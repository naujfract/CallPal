'use strict';

angular
        .module('callpal.contacts')
        .factory('SpeedDialSvc', SpeedDialSvc);

function SpeedDialSvc($q, $http, $timeout, CountryCodesSvc, UserSvc, $filter) {

    var host = window.config.api.host;

    
    function deleteDuplicates(arr, property) {
        
        if(arr.length < 2){
            return arr;
        }else{
            var i,
                len=arr.length,
                out=[],
                obj={};

            for (i = 0; i < len; i++) {
              obj[arr[i][property]] = arr[i];
            }
            for (i  in obj) {
              out.push(obj[i]);
            }
            return out;
        }
    }

    return {
        getCountryFromFixedNumberOrUserCountry: function (contact, phoneNumberIndex) {
            var userInfo = UserSvc.getUserInfo();
            var resultCountry = CountryCodesSvc.getCountryByPhonePrefix(userInfo.phone_prefix);
            if (Array.isArray(contact.phoneNumbers)) {
                var countryCode = contact.phoneNumbers[phoneNumberIndex].code;
                if (countryCode)
                    resultCountry = CountryCodesSvc.getCountryByAbbv(countryCode)
            }
            return resultCountry;
        },
        // Join the speed Dials with the contacts
        apply_speed_dials_to_contact_list: function (contacts) {

            var userInfo = UserSvc.getUserInfo();
            contacts = {
                list: contacts,
                allNumbers: []
            };

            if (Array.isArray(userInfo.speedDial) && userInfo.speedDial.length > 0) {
                for(var sd = userInfo.speedDial.length; sd--;){
                    
                    var speedDial = userInfo.speedDial[sd];
                    
                    for(var cs = contacts.list.length; cs--;){
                        
                        if(!contacts.list[cs].no_duplicates){
                            contacts.list[cs].phoneNumbers = deleteDuplicates(contacts.list[cs].phoneNumbers, 'normalizedNumber'); //correct duplicated phones
                        }

                        for (var cph = 0; cph < contacts.list[cs].phoneNumbers.length; cph++) {                                   
                            var phoneNumber = contacts.list[cs].phoneNumbers[cph],
                                cleanedPhone = PhoneFormat.cleanPhone(phoneNumber.number);

                            if(cleanedPhone === userInfo.phone || cleanedPhone.length < 4){//owner phone or number with less than 4 sky digits 
                                break;
                            }

                            if (cleanedPhone === speedDial.real_number) {//set found speed dial
                                contacts.list[cs].hasSpeedDial = true;
                                contacts.list[cs].phoneNumbers[cph] = speedDial;

                                phoneNumber = contacts.list[cs].phoneNumbers[cph];
                            }

                            if(!contacts.list[cs].pushed_numbers){
                                if(contacts.list[cs].hasSpeedDial && phoneNumber.real_number){//saves all numbers
                                    contacts.allNumbers.push(phoneNumber.real_number);
                                }else{
                                    contacts.list[cs].phoneNumbers[cph].number = cleanedPhone;
                                    contacts.allNumbers.push(cleanedPhone);
                                }
                            }
                        }
                        contacts.list[cs].no_duplicates = true;
                        contacts.list[cs].pushed_numbers = true;
                    }
                }
                
            } else{
                for(var cs = contacts.list.length; cs--;){
                        
                    if(!contacts.list[cs].no_duplicates){
                        contacts.list[cs].phoneNumbers = deleteDuplicates(contacts.list[cs].phoneNumbers, 'normalizedNumber'); //correct duplicated phones
                    }

                    for (var cph = 0; cph < contacts.list[cs].phoneNumbers.length; cph++) {                                   
                        var phoneNumber = contacts.list[cs].phoneNumbers[cph],
                            cleanedPhone = PhoneFormat.cleanPhone(phoneNumber.number);

                        if(cleanedPhone === userInfo.phone || cleanedPhone.length < 4){//owner phone or number with less than 4 sky digits 
                            break;
                        }

                        if(!contacts.list[cs].pushed_numbers){
                            contacts.list[cs].phoneNumbers[cph].number = cleanedPhone;
                            contacts.allNumbers.push(cleanedPhone);
                        }
                    }
                    contacts.list[cs].no_duplicates = true;
                    contacts.list[cs].pushed_numbers = true;
                }
            }
            return contacts;
        },
        createOrUpdateSpeedDial: function (contact, phoneNumber, phoneNumberPos, immutablePhoneNumber, country) {
            var dfd = $q.defer(),
                    userInfo = UserSvc.getUserInfo(),
                    userSpeedDials = userInfo.speedDial,
                    self = this;

            if (!Array.isArray(userSpeedDials))
                userSpeedDials = [];

            var speedDial = {
                fixed: true,
                real_number: immutablePhoneNumber,
                number: phoneNumber,
                countryCode: country.countryCode
            };

            if (contact.hasSpeedDial) {
                this.saveSpeedDialOnServer(speedDial).then(function (success) {


                    contact.phoneNumbers[phoneNumberPos] = speedDial;

                    var res = self.replaceSpeedDial(speedDial);
                    console.log('contact after speedDialed in saveSpeedDialOnServer ', contact);

                    if (res)
                        dfd.resolve(contact);
                    else
                        dfd.reject("Error replacing the speedDial");
                }, function (error) {
                    console.error('DEBUG: Error saving speedDial on Server', error);
                    dfd.reject(error);
                });
            } else {
                this.saveSpeedDialOnServer(speedDial).then(function (success) {

                    contact.phoneNumbers[phoneNumberPos] = speedDial;

                    userSpeedDials.push(speedDial);
                    userInfo.speedDial = userSpeedDials;
                    UserSvc.setUserInfo(userInfo);
                    dfd.resolve(contact);
                }, function (error) {
                    console.error('DEBUG: Error saving speedDial on Server', error);
                    dfd.reject(error);
                });
            }
            return dfd.promise;
        },
        saveSpeedDialOnServer: function (speedDial) {
            var userInfo = UserSvc.getUserInfo();
            var userToken = UserSvc.getUserToken();
            var req = {
                method: 'PUT',
                url: (host + '/contacts/' + userInfo.username),
                headers: {
                    'Authorization': 'Bearer ' + userToken.value
                },
                data: speedDial
            };
            return $http(req);
        },
        replaceSpeedDial: function (speedDial) {
            var userInfo = UserSvc.getUserInfo();
            var userSpeedDials = userInfo.speedDial;
            var founded = false;
            var foundedPosition = -1;

            for (var i in userSpeedDials) {
                var currentSpeedDial = userSpeedDials[i];
                if (currentSpeedDial.real_number == speedDial.real_number) {
                    foundedPosition = i;
                    founded = true;
                    break;
                }
            }
            return this.setOrReplaceSpeedDial(speedDial, foundedPosition);
        },
        setOrReplaceSpeedDial: function (speedDial, position) {
            var userInfo = UserSvc.getUserInfo();
            var userSpeedDials = userInfo.speedDial;
            if (position != null && position >= 0) {
                userSpeedDials[position] = speedDial;
                userInfo.speedDial = userSpeedDials;
                UserSvc.setUserInfo(userInfo);
                return true;
            } else {
                userSpeedDials.push(speedDial);
                userInfo.speedDial = userSpeedDials;
                UserSvc.setUserInfo(userInfo);
                return true;
            }
            return false;
        },
        // Get speed dials
        getSpeedDials: function () {
            var self = this;
            var result = [];
            var deferred = $q.defer();
            var userInfo = UserSvc.getUserInfo();
            var userSpeedDials = userInfo.speedDial;
            if (Array.isArray(userSpeedDials))
                for (var i = userSpeedDials.length - 1; i >= 0; i--) {
                    result.push(userSpeedDials[i]);
                }
            $timeout(function () {
                deferred.resolve(result);
            });
            return deferred.promise;
        },
        getSpeedDialsWithExclusion: function (exclusions) {
            var self = this;
            var deferred = $q.defer();
            self.getSpeedDials()
                    .then(function (contactList) {
                        contactList.forEach(function (contact, index) {
                            exclusions.forEach(function (exclusion) {
                                if ((contact.real_number && contact.real_number == exclusion.real_number) ||
                                        (contact.number && contact.number == exclusion.number))
                                    delete contactList[index];
                            });
                        });
                        deferred.resolve(contactList);
                    });
            return deferred.promise;
        },
    }

}
