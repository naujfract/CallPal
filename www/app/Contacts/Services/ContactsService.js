'use strict';

angular
    .module('callpal.contacts')
    .factory('ContactsSvc', ContactsSvc);

function ContactsSvc($q, $http, UserSvc, Utils, $ionicPlatform, SpeedDialSvc, $rootScope, $localstorage, Permission, $filter) {


  var host = window.config.api.host,
      host_push = window.config.push.host,
      initialized = false;

  var list = []; // List of contacts

  return {

    all: function () {
      return list;
    },
    // in order to get the avatar stored and not go to the server
    getCachedAvatar: function (extension) {
      for (var i in list) {
        if (extension == list[i].extension && list[i].avatar) {
          return list[i].avatar;
        }
      }
      return null;
    },

    getCachedAvatarByNumber: function (numbers) {
        for (var k in numbers) {
            for (var i in list){
                for (var j in list[i].phoneNumbers) {
                    var phoneNumber = list[i].phoneNumbers[j];
                    if (((phoneNumber.number && phoneNumber.number === '+' + numbers[k].number) ||
                        (phoneNumber.number && phoneNumber.number === numbers[k].number) ||
                        phoneNumber.normalizedNumber && phoneNumber.normalizedNumber === '+' + numbers[k].number) && list[i].avatar) {
                        return list[i].avatar;
                    }
                }
            }
        }
        return null;
    },

    isInitalized : function () {
      return initialized;
    },
    
    loadContacts: function(){
        
        var dfd = $q.defer(),
            self = this;
      
        self.getContacts().then(function (basic_contacts) {
          //log('The basics contacts are: ', basic_contacts);
            list = basic_contacts.list;

            self.getContactsMeta(basic_contacts).then(function (remote_contacts) {

              initialized = true;

              list = remote_contacts;
              self.setLastTimeStampContactsUpdated();
              $rootScope.$emit('contacts:doneLoading');
              dfd.resolve(list);
            }, function (error) {
              $rootScope.$emit('contacts:doneLoading');
              console.error('DEBUG: ERROR getContactsMeta in initialize: ', error);
              dfd.reject(error);
            });
          }, function (error) {
              initialized = false;
            console.error('There is an error initializing the contacts', error);
            dfd.reject(error);
          });

        return dfd.promise;
    },

    initialize: function () {
      var dfd = $q.defer();
      var self = this;
      
        if(ionic.Platform.isAndroid()){
            $rootScope.$on('Permission.doneApplying', function(){
                  self.loadContacts().then(function(list){
                      dfd.resolve(list);
                  },
                  function(error){
                      dfd.reject(error);
                  });
            });
            if(Permission.userPrompted){
                self.loadContacts().then(function(list){
                      dfd.resolve(list);
                  },
                  function(error){
                      dfd.reject(error);
                  });
            }
        }else{
            self.loadContacts().then(function(list){
                dfd.resolve(list);
            },
            function(error){
                dfd.reject(error);
            });
        }
      
      return dfd.promise;
    },

    refresh: function(){
        var dfd = $q.defer();
        var self = this;
      
        self.loadContacts().then(function(list){
            dfd.resolve(list);
        },
        function(error){
            dfd.reject(error);
        });
      
      return dfd.promise;
    },

    get_all_avatars: function(){
       var avatars = [],
           length = list.length;
       for(var i = 0; i < length; i++){
           if(list[i].avatar && list[i].avatar !== ''){
               avatars.push(list[i].avatar);
           }
       }
       return avatars;
    },



    get_all_without_callpal: function () {
      var resultArray = [];
      for (var i in list) {
        var currentContact = list[i];
        if (currentContact.username == null || currentContact.username == '' || currentContact.username == undefined ||
            currentContact.extension == null || currentContact.extension == '' || currentContact.extension == undefined)
          resultArray.push(currentContact);
      }
      return resultArray;
    },


    find_by_extension: function (extension) {
      for (var i in list) {
        if (list[i].extension == extension) {
          return list[i];
        }
      }
      return null;
    },


    find_by_phone_number: function (countryPrefix, number) {
      if (! number || ! countryPrefix) {
        return null;
      }

      for (var i in list) {
        var currentContact = list[i];

        for (var j in currentContact.phoneNumbers) {
          var currentPhone = currentContact.phoneNumbers[j];
          if ((currentPhone.real_number || currentPhone.number) &&
             (currentPhone.real_number == number  ||
             currentPhone.number == number ||
             currentPhone.number == countryPrefix + number ||
             currentPhone.number == '+' + countryPrefix + number)) {
            return currentContact;
          }
        }
      }
      return null;
    },


    //match_member_name: function (member) {
    //
    //  var dfd = $q.defer();
    //  var self = this;
    //  var contact = null;
    //
    //  if (Array.isArray(list)) {
    //
    //    contact = self.find_by_extension(member.extension); // Match by extension
    //
    //    if (contact != null) {
    //
    //      member.name = contact.displayName || contact.name;
    //      dfd.resolve(member);
    //
    //    } else {
    //
    //      contact = self.find_by_phone_number(member.phone); // Match by number
    //
    //      if (contact != null) {
    //
    //        member.name = contact.displayName || contact.name;
    //        dfd.resolve(member);
    //
    //      } else { // Return the normal data that is being sent through the network
    //
    //        if (member.name != "" && member.name != undefined && member.name != null) {
    //          dfd.resolve(member);
    //        } else {
    //          member.name = member.number; // Copy the number to the name
    //          dfd.resolve(member);
    //        }
    //
    //      }
    //
    //    }
    //  }
    //
    //  return dfd.promise;
    //
    //},

    match_member_name: function (member) {
      var contact = this.find_by_extension(member.extension || member.caller_id_number); // Match by extension
      if (contact) {
        return contact.displayName || contact.name;
      }

      contact = this.find_by_phone_number(member.phone); // Match by number
      if (contact) {
        return contact.displayName || contact.name;
      }

      if (member.name) {
        return member.displayName || member.name;
      }

      return member.number || member.phone || member.caller_id_name;
    },

    shareContact: function (contact_to, contact_data) {

      var dfd = $q.defer();
      var userToken = UserSvc.getUserToken();
      var userInfo = UserSvc.getUserInfo();

      var req = {
        method: 'POST',
        url: (host_push + '/notifications/contacts/share_contact'), // the username is the email
        headers: {
          'Authorization': 'Bearer ' + userToken.value
        },
        data: {
          username: userInfo.username,
          contacts: [contact_to.username],
          contact: contact_data
        }
      };

      $http(req).then(function (response) {
        dfd.resolve(response.data);
      }, function (error) {
        console.error('Error getting the contact list', error);
        dfd.reject([]);
      });

      return dfd.promise;

    },


    createContact: function (contact_params) {

      var deferred = $q.defer();
      var contact = {displayName: "", firstName: "", lastName: "", name: "", phoneNumbers: []};
      var phones = [];

      // extract phone numbers
      contact_params.phoneNumbers.forEach(function (number, pos, arr) {
        var phone_number = number.normalizedNumber || number.number;
        var phone_type = number.type || "mobile";
        phones[pos] = {label: phone_type, number: phone_number};
      });

      contact.displayName = contact_params.displayName || contact_params.name;
      contact.firstName = contact_params.firstName || contact_params.name;
      contact.lastName = contact_params.lastName || contact_params.name;
      contact.name = contact_params.name;

      var full_name = contact.displayName || contact_params.name;

      // Object data to create the contact
      var data = {
        name: full_name,
        phones: phones
      };

      // Call the native address book plugin to create the contact into the system
      $ionicPlatform.ready(function () {
        navigator.manageContacts.add(data);
      });

      return deferred.promise;

    },


    getContactsFromTest: function () {

      var deferred = $q.defer();

      var contactList = [

        {"displayName": "Karina Dunaeva", "phoneNumbers": [{"number": "3234038917"}]},
        {"displayName": "Jorge Garcia", "phoneNumbers": [{"number": "7864130075"}]},
        {"displayName": "Pedro Arronte", "phoneNumbers": [{"number": "7862664379"}]},
        {"displayName": "David Rivas", "phoneNumbers": [{"number": "7864500217"}]},
        {"displayName": "Alejandro", "phoneNumbers": [{"number": "7866672868"}]},
        {"displayName": "Mario Carballosa", "phoneNumbers": [{"number": "7868996483"}, {"number": "7868996482"}]},
        {"displayName": "Hilel Tcherikover", "phoneNumbers": [{"number": "8452488183"}]},
        {"displayName": "Shmuel Hen", "phoneNumbers": [{"number": "7864137990"}]},
        {"displayName": "Marcela Tobon", "phoneNumbers": [{"number": "3058906715"}]},
        {"displayName": "Hannah Gandelman", "phoneNumbers": [{"number": "7865719976"}]},
        {"displayName": "Paulina Leon", "phoneNumbers": [{"number": "8134200842"}]},
        {"displayName": "Diego Jacome", "phoneNumbers": [{"number": "59322245677"}]},
        {"displayName": "Ana model Spain", "phoneNumbers": [{"number": "7542098490"}]},
        {"displayName": "Juan Gutierrez", "phoneNumbers": [{"number": "7866787647"}]},
        {"displayName": "Mariol Calderon", "phoneNumbers": [{"number": "305-6100204"}, {"number": "305-6100205"}]},
        {"displayName": "John Doe A", "phoneNumbers": [{"number": "000-000-0000"}]},
        {"displayName": "Stefani Model", "phoneNumbers": [{"number": "2067470691"}]},
        {"displayName": "Grancho", "phoneNumbers": [{"number": "6414304888"}]},
        {"displayName": "Yander delgado", "phoneNumbers": [{"number": "3057098887"}]},
        {"displayName": "Donald Granados", "phoneNumbers": [{"number": "3057732499"}]},
        {"displayName": "Amparito", "phoneNumbers": [{"number": "7866818973"}]},
        {"displayName": "Doe John Bash", "phoneNumbers": [{"number": "7864848473"}]},
        {"displayName": "Fabio Astray", "phoneNumbers": [{"number": "7862162320"}]},
        {"displayName": "Yuri Ritvin", "phoneNumbers": [{"number": "1 (786)-4474606"}]},
        {"displayName": "Ecuador 2", "phoneNumbers": [{"number": "+59322245688"}]},
        {"displayName": "Ecuador 3", "phoneNumbers": [{"number": "59322245699"}]},
        {"displayName": "Loraine", "phoneNumbers": [{"number": "7034318208"}]},
        {"displayName": "John Lennon", "phoneNumbers": [{"number": "+1 (786) 666 7535"}]},
        {"displayName": "Lanna del Rey", "phoneNumbers": [{"number": "+13059519292 "}]},
        {"displayName": "Tony test", "phoneNumbers": [{"number": "011447446664032"}]},
        {"displayName": "Christian Someillan", "phoneNumbers": [{"number": "3053005119"}]},
        {"displayName": "Alefroid Nostradamus", "phoneNumbers": [{"number": "7866787634"}]},
        {"displayName": "Eli Cohen", "phoneNumbers": [{"number": "585111115"}]},
        {"displayName": "Marco Polo Travel", "phoneNumbers": [{"number": "81559598"}]},
        {"displayName": "Thon Hotel Opera", "phoneNumbers": [{"number": "24103000"}]},
        {"displayName": "Tia Elo", "phoneNumbers": [{"number": "34 64 26 98511"}]},
        {"displayName": "Juan Gutierrez 2", "phoneNumbers": [{"number": "7862347645"}]}


      ];

      //console.time('GENERATING_CONTACTS');
      //var randomContacts = Utils.generateRandomTelephoneNumbers(100, 3);
      //console.timeEnd('GENERATING_CONTACTS');
      
      //for (var i in randomContacts){
      //  contactList.push(randomContacts[i]);
      //}

      deferred.resolve(contactList);

      return deferred.promise;

    },


    getContacts: function () {

      var self = this;
      var deferred = $q.defer();

      if (!window.config.debug && Utils.isRunningOnADevice()) {
        self.getContactsFromDevice().then(function (contactList) {
          // It should be cleant here
          contactList = checkDuplicateContacts(contactList);
          deferred.resolve(SpeedDialSvc.apply_speed_dials_to_contact_list(contactList));
        }, function (err) {
          console.error("Error loading the contact list", err);
          deferred.reject(err);
        });
      } else {
        self.getContactsFromTest().then(function (contactList) {
          // It should be cleant here
          deferred.resolve(SpeedDialSvc.apply_speed_dials_to_contact_list(contactList));
        });
      }

      return deferred.promise;

      //////////////////////////////////////////////
      function checkDuplicateContacts(contactList) {
        contactList = $filter('orderBy')(contactList, ['displayName'], false); // order list by name to check duplicate contacts

        for (var i = 0; i < contactList.length; i++) { 
          if (i === 0) continue; // skip first element
          var currentContact  = contactList[i];
          var previousContact = contactList[i-1];
          if (currentContact.displayName === previousContact.displayName) { // if cc name matches pc name
            for (var j = 0; j < currentContact.phoneNumbers.length; j++) { // for each currentContacts phone number
              var phoneNumber = PhoneFormat.cleanPhone(currentContact.phoneNumbers[j].number); // clean phone number
              var checkLastSixMatch = phoneNumber.substr(phoneNumber.length - 6); // get last 6 characters of cleaned number
              var regex = new RegExp("\\d+" + checkLastSixMatch); // regex last 6 numbers
              for (var k = 0; k < previousContact.phoneNumbers.length; k++) { // check each number for currentPhoneNumber match
                var previousNumber = PhoneFormat.cleanPhone(previousContact.phoneNumbers[k].number); // clean current phone number in iteration
                if (regex.test(previousNumber)) { // if matches, remove current contact from list
                  contactList.splice(i, 1);
                }
              }
            }
          }
        }
        return contactList;
      }
    },

    // Real device get contacts from the real device
    getContactsFromDevice: function () {
      var deferred = $q.defer();
      navigator.contactsPhoneNumbers.list(function (contactList) {
        deferred.resolve(contactList);
      }, function (error_loading_contacts) {
        console.error("Error loading the contact list", error_loading_contacts);
        deferred.reject([]);
      });
      return deferred.promise;
    },


    // Match the local contacts and speedDials with the backend
    getContactsMeta: function (contactList) {

        var self = this;
        var deferred = $q.defer();
        var phones = [];

        if (contactList.allNumbers.length > 0){

          self.matchContactsWithRemotes(contactList.allNumbers).then(function (remoteContacts) {

            remoteContacts.contacts.forEach(function (remoteContact) {

                contactList.list.forEach(function (contact) {

                    contact.phoneNumbers.forEach(function (number) {
                      // Clean the numbers
                        var clean_number = contact.hasSpeedDial ? number.number : PhoneFormat.cleanPhone(number.normalizedNumber || number.number);

                        if (remoteContact.key === clean_number
                            || remoteContact.phone_prefix.replace('+', '') + remoteContact.key === clean_number
                            || remoteContact.phone_prefix + remoteContact.key === clean_number) {

                            contact.extension = remoteContact.value.extension;
                            contact.avatar = remoteContact.value.avatar;
                            contact.username = remoteContact.value.username;
                            if(remoteContact.phone_prefix){
                              number.countryCode = remoteContact.phone_prefix;
                            }
                        }
                    });
                });
            });

            deferred.resolve(contactList.list);
          }, function (error) {
            console.error('There is an error', error);
            deferred.reject('Error connecting with the API.', error)
          });
        } else {
          deferred.resolve(contactList.list);
        }

        return deferred.promise;
    },


    // Callpal contacts in the server
    matchContactsWithRemotes: function (phones) {

      var deferred = $q.defer();
      var userToken = UserSvc.getUserToken();

      var req = {
        method: 'POST',
        url: (host + '/contact'),
        headers: {
          'Authorization': 'Bearer ' + userToken.value
        },
        data: phones
      };

        $http(req).then(function (response) {
          deferred.resolve({
            contacts: response.data
          });
        }, function (error) {
          console.error('Error loading contacts in matchContactsWithRemotes, ', error);
          return deferred.reject([]);
        });

      return deferred.promise;

    },


    // Return the contact list without the exclusions
    getContactsWithExclusions: function (exclusions) {

      var self = this;
      var deferred = $q.defer();
      var exclusion_list = JSON.parse(JSON.stringify(list)); // Copy the object

      exclusion_list.forEach(function (contact, index) {
        exclusions.forEach(function (exclusion) {
          if (contact.username == exclusion.username) {
            delete exclusion_list[index];
          }
        });
      });

      deferred.resolve(exclusion_list);

      return deferred.promise;

    },


    isContact: function (member) {
      for (var i in member.phoneNumbers || []) {
        var callPhoneNumber = member.phoneNumbers[i];

        for (var j in list || []) {
          var contact = list[j];

          for (var k in contact.phoneNumbers || []) {
            var contactPhoneNumber = contact.phoneNumbers[k];

            if (callPhoneNumber.number.toString().indexOf(contactPhoneNumber.number.toString()) != -1) {
              return true;
            }
          }
        }
      }
      return false;
    },




    // --------------------------------------------------------------------------------
    // Contacts Sync
    // --------------------------------------------------------------------------------


    initContactsSync: function () {


      console.log("\n\n Initializing backup for contacts \n\n");

      // init backup function
      var lastBackup;
      var self = this;

      if ($localstorage.get('lastBackup') !== undefined) // set lastBackup time if in storage
        lastBackup = $localstorage.get('lastBackup');
      if (!lastBackup || Date.now() - lastBackup >= 21600000) // if has not backedUp or last back up was over 6 hours
        self.syncContacts() // sync contacts
            .then(function (res) {
              lastBackup = Date.now();
              $localstorage.set('lastBackup', lastBackup);
            }, function (err) {
              console.error('Not able to back up contacts: ', err);
            });

      // setup a listener for action
      $rootScope.$on('$stateChangeStart', function () {
        console.log('DEBUG: State changed');
        if ((Date.now() - lastBackup) >= 21) { // if lastbackup - current time -> backup
          self.syncContacts().then(function (res) {
            lastBackup = Date.now();
            $localstorage.set('lastBackup', lastBackup);
          });
        }
      });

    },

    syncContacts: function() {

      var deferred = $q.defer();
      var userToken = UserSvc.getUserToken();
      var userInfo = UserSvc.getUserInfo();

      var req = {
        method: 'PUT',
        url: (host + '/contact/backup/'+ userInfo.username), // the username is the email
        headers: {
          'Authorization': 'Bearer ' + userToken.value
        },
        data: { contacts: list }
      };

      //console.log('list', list);
      $http(req).then(function (response) {
        console.log('DEBUG: INFO: contacts sync success: ', response);
        deferred.resolve(response);
      }, function (error) {
        console.log('DEBUG: Error syncing the contact list', error);
        deferred.reject(error);
      });

      return deferred.promise;
    },









    // --------------------------------------------------------------------------------
    // Contacts update functions
    // --------------------------------------------------------------------------------

    try_update_contacts: function () {
      log('trying to update contacts');
      var lastUpdatedTime = this.getLastTimeStampContactsUpdated();
      log('lastUpdatedTime', lastUpdatedTime);
      if ((new Date()) > lastUpdatedTime.addHours(2)) {
        log("DEBUG: INF: contacts need to be updated");
        $rootScope.$emit('contacts:refresh');
        this.setLastTimeStampContactsUpdated(); // save timestamp for save
      }
      else {
        log('DEBUG: INF, concats do not need update');
        log('DEBUG: Next update is in: ', lastUpdatedTime.addHours(2));
      }
    },


    getLastTimeStampContactsUpdated: function () {
      var timeStamp = UserSvc.getUserInfo().last_timestamp_contacts_updated;
      if (timeStamp != null && timeStamp != undefined && timeStamp != {} && timeStamp != "")
        return new Date(timeStamp);
      else {
        this.setLastTimeStampContactsUpdated(); // Set the lasttime it was now
        timeStamp = new Date();
      }
      return timeStamp;
    },


    setLastTimeStampContactsUpdated: function () {
      var userInfo = UserSvc.getUserInfo();
      userInfo.last_timestamp_contacts_updated = new Date();
      UserSvc.setUserInfo(userInfo);
      return true;
    },


  }

}
