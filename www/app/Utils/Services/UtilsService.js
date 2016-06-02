'use strict';

angular
        .module('callpal.utils')
        .factory('$localstorage', localstorage)
        .factory('CountryCodesSvc', CountryCodesSvc)
        .factory('$callpalbackground', callpalbackground)
        .factory('AuthInterceptor', AuthInterceptor)
        .factory('Utils', Utils)
        .factory('AvatarService', AvatarService)
        .factory('GeoCodingService', GeoCodingService)
        .factory('Permission', Permission)
        ;

function GeoCodingService($ionicPlatform, $q, $http, $window, $timeout) {
    return {
        google_host: 'https://maps.googleapis.com',
        google_api_host: 'https://www.googleapis.com',
        google_api_key: 'AIzaSyC37wyGJawxR1tAt2teb5RNIGjEHtNdgIc',
        get_location: function () {
            var deferred = $q.defer();
            var self = this;

            var coordinates = null;
            self.get_coordinates().then(function (sccs) {
                console.log('get_coordinates', sccs);
                coordinates = sccs;

                self.get_address(coordinates).then(function (sccs) {

                    deferred.resolve(self.save_location(sccs, coordinates));

                }, function (err) {
                    deferred.reject(err);
                });
            }, function (err) {
                deferred.reject(err);
            });

            return deferred.promise;
        },
        validate: function () {
            var self = this;
            if ($window.localStorage['geolocation']) {
                var geolocation = JSON.parse($window.localStorage['geolocation']);

                if (moment(geolocation.timestamp).isValid()) {

                    if (moment(geolocation.timestamp).add(12, 'hours').isBefore(new Date())) {

                        self.get_coordinates().then(function (sccs) {

                            if (geolocation.coordinates.latitude != sccs.lat &&
                                    geolocation.coordinates.longitude != sccs.lng) {

                                if (self.getDistanceFromLatLonInKm(geolocation.coordinates.latitude,
                                        geolocation.coordinates.longitude, sccs.lat, sccs.lng) >= 20) {
                                    return false;
                                } else {
                                    return geolocation;
                                }

                            } else {
                                return geolocation;
                            }
                        }, function (err) {
                            return false;
                        });
                    } else {
                        return geolocation;
                    }
                } else {
                    return false;
                }
            } else {
                return false;
            }
        },
        get_coordinates: function () {
            var deferred = $q.defer();
            var self = this;
            $ionicPlatform.ready(function () {

                var req = {
                    method: 'POST',
                    url: (self.google_api_host + '/geolocation/v1/geolocate?key=' + self.google_api_key),
                    data: {
                        considerIp: true
                    }
                };

                $http(req)
                        .then(function (sccs) {
                            console.log('sccs', sccs.data.location);

                            if (sccs.data && sccs.data.location
                                    && sccs.data.location.lat && sccs.data.location.lng)
                            {
                                deferred.resolve(sccs.data.location);
                            } else {
                                deferred.reject(err);
                            }

                        }, function (err, e, d) {
                            console.log('geolocation', err);
                            console.log('geolocation', e);
                            console.log('geolocation', d);
                            deferred.reject(err);
                        });

                /*self.is_location_enabled()
                 .then(function (rps) {
                 console.log('is_location_enabled', rps);
                 //deferred.resolve(rps);
                 var options = {
                 enableHighAccuracy: true,
                 timeout: 10000,
                 maximumAge: 0
                 };
                 navigator.geolocation.getCurrentPosition(function (pos) {
                 deferred.resolve(pos);
                 }, function (err) {
                 deferred.reject(err);
                 }, options);

                 }, function (err) {
                 console.log(err);
                 deferred.reject(err);
                 })*/
            });

            return deferred.promise;
        },
        get_address: function (coordinates) {

            var deferred = $q.defer();
            if (coordinates && coordinates.lat && coordinates.lng)
            {
                var req = {
                    method: 'GET',
                    url: (this.google_host + '/maps/api/geocode/json?latlng='
                            + coordinates.lat + ',' + coordinates.lng
                            + '&sensor=true&key=' + this.google_api_key)
                };

                $http(req)
                        .then(function (sccs) {
                            deferred.resolve(sccs.data.results[0]);
                        }, function (err, e, d) {
                            console.log(err);
                            console.log(e);
                            console.log(d);
                            deferred.reject(err);
                        });
            } else {
                $timeout(function () {
                    deferred.reject(false);
                }, 100);
            }


            return deferred.promise;
        },
        save_location: function (data, coordinates) {
            var city, state, country, zip_code;
            for (var i = 0; i < data.address_components.length; i++) {

                switch (data.address_components[i].types[0]) {
                    case 'locality':
                        city = data.address_components[i];
                        break;
                    case 'administrative_area_level_1':
                        state = data.address_components[i];
                        break;
                    case 'country':
                        country = data.address_components[i];
                        break;
                    case 'postal_code':
                        zip_code = data.address_components[i];
                        break;
                    default:

                }
            }

            var location = {
                city: city,
                zip_code: zip_code,
                state: state,
                country: country,
                coordinates: {
                    latitude: coordinates.lat,
                    longitude: coordinates.lng,
                },
                timestamp: new Date()
            };
            console.log('location', location);

            $window.localStorage['geolocation'] = JSON.stringify(location);

            return location;
        },
        getDistanceFromLatLonInKm: function (lat1, lon1, lat2, lon2) {
            var R = 6371; // Radius of the earth in km
            var dLat = this.deg2rad(lat2 - lat1);  // deg2rad below
            var dLon = this.deg2rad(lon2 - lon1);
            var a =
                    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2)
                    ;
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c; // Distance in km
            return d;
        },
        deg2rad: function (deg) {
            return deg * (Math.PI / 180)
        },
        is_location_enabled: function () {
            var deferred = $q.defer();
            var self = this;
            $timeout(function () {
                if (ionic.Platform.device()) {
                    if (window.cordova && window.cordova.plugins && window.cordova.plugins.diagnostic) {
                        if (cordova.plugins.diagnostic.isLocationAuthorized) {
                            cordova.plugins.diagnostic.isLocationAuthorized(function (rps) {
                                console.log('isLocationAuthorized sccs', rps);

                                if (rps) {
                                    cordova.plugins.diagnostic.isLocationEnabled(function (enabled) {
                                        console.log("Location is " + (enabled ? "enabled" : "disabled"));
                                        if (enabled) {
                                            deferred.resolve(enabled);
                                        } else {
                                            deferred.reject(enabled);
                                        }
                                    }, function (error) {
                                        console.error("The following error occurred: " + error);
                                        deferred.reject(error);
                                    });
                                } else {

                                    self.get_permissions()
                                            .then(function (sccs) {
                                                console.log(sccs);
                                                $timeout(function () {
                                                    cordova.plugins.diagnostic.isLocationEnabled(function (enabled) {
                                                        //console.log("Location is " + (enabled ? "enabled" : "disabled"));
                                                        if (enabled) {
                                                            deferred.resolve(enabled);
                                                        } else {
                                                            deferred.reject(enabled);
                                                        }
                                                    }, function (error) {
                                                        console.error("The following error occurred: " + error);
                                                        deferred.reject(error);
                                                    });
                                                }, 5000);
                                            }, function (err) {
                                                console.log(err);
                                            });
                                }
                            }, function (err) {
                                console.log('isLocationAuthorized err', err);
                            });
                        } else {
                            cordova.plugins.diagnostic.isLocationEnabled(function (enabled) {
                                console.log("Location is " + (enabled ? "enabled" : "disabled"));
                                if (enabled) {
                                    deferred.resolve(enabled);
                                } else {
                                    deferred.reject(enabled);
                                }
                            }, function (error) {
                                console.error("The following error occurred: " + error);
                                deferred.reject(error);
                            });
                        }

                        /**/
                    } else {
                        deferred.resolve(true);
                    }
                } else {
                    deferred.resolve(true);
                }
            }, 100);
            return deferred.promise;
        },
        get_permissions: function () {
            var deferred = $q.defer();
            if (cordova && cordova.plugins && cordova.plugins.diagnostic) {
                cordova.plugins.diagnostic.requestLocationAuthorization(function () {
                    deferred.resolve(true);
                }, function (error) {
                    deferred.reject(error);
                }, "when_in_use");
            }
            return deferred.promise;
        }
    }
}

function AvatarService() {

    return {
        get_male_avatar: function () {
            var n = Math.floor((Math.random() * 2) + 1);
            return "web-assets/img/faces/he" + n + ".png";
        },
        get_female_avatar: function () {
            var n = Math.floor((Math.random() * 2) + 1);
            return "web-assets/img/faces/she" + n + ".png";
        }

    };

}


/**
 * @name : localStorage Factory
 * @description : Set and Get data from the $window localStorage object
 *
 **/
function localstorage($window) {
    return {
        set: function (key, value) {
            $window.localStorage[key] = value;
        },
        get: function (key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        setObject: function (key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function (key) {
            return JSON.parse($window.localStorage[key] || '{}');
        }
    }
}

/**
 * @name : CountryCodesSvc
 * @description : Get the country codes to use in the app
 *
 **/
function CountryCodesSvc() {

    var CountryCodesSvcMethods = {
        /**
         * @name : getCountryByAbbv
         * @param: "CU"
         * @return: "{ code: val, countryCode: val, caption: val}"
         **/
        getCountryByAbbv: function (abbv) {
            var res = null;
            CountryCodesSvcMethods.getCountries().forEach(function (item, pos, array) {
                if (item.code == abbv)
                    res = item;
            });
            if (res != undefined && res != null)
                return res;
            return {code: abbv, countryCode: abbv, caption: abbv}
        },
        /**
         * @name : getCountryByPhonePrefix
         * @param: "+1"
         * @return: "{ code: val, countryCode: val, caption: val}"
         **/
        getCountryByPhonePrefix: function (phone_prefix) {

            phone_prefix = phone_prefix.replace("+", "");

            var res = null;
            CountryCodesSvcMethods.getCountries().forEach(function (item, pos, array) {
                if (item.countryCode == phone_prefix)
                    res = item;
            });
            if (res != undefined && res != null)
                return res;
            return {code: phone_prefix, countryCode: phone_prefix, caption: phone_prefix}
        },
        /**
         * @name : getCountryByName
         * @param: "Cuba"
         * @return: "{ code: val, countryCode: val, caption: val}"
         **/
        getCountryByName: function (name) {
            var res = null;
            CountryCodesSvcMethods.getCountries().forEach(function (item, pos, array) {
                if (item.caption == name)
                    res = item;
            });
            if (res != undefined && res != null)
                return res;
            return {code: name, countryCode: name, caption: name}
        },
        /**
         * @name : getCountries
         * @return: [{ code: val, countryCode: val, caption: val}, ...]
         **/
        getCountries: function () {
            return [
                {code: "AF", countryCode: "93", caption: "Afghanistan", active: "0"},
                {code: "AL", countryCode: "355", caption: "Albania", active: "0"},
                {code: "DZ", countryCode: "213", caption: "Algeria", active: "0"},
                {code: "AS", countryCode: "1684", caption: "American Samoa", active: "1"},
                {code: "AD", countryCode: "376", caption: "Andorra", active: "0"},
                {code: "AO", countryCode: "244", caption: "Angola", active: "1"},
                {code: "AI", countryCode: "1264", caption: "Anguilla", active: "0"},
                {code: "AQ", countryCode: "672", caption: "Antarctica", active: "0"},
                {code: "AG", countryCode: "1268", caption: "Antigua And Barbuda", active: "0"},
                {code: "AR", countryCode: "54", caption: "Argentina", active: "1"},
                {code: "AM", countryCode: "374", caption: "Armenia", active: "0"},
                {code: "AW", countryCode: "297", caption: "Aruba", active: "0"},
                {code: "AU", countryCode: "61", caption: "Australia", active: "1"},
                {code: "AT", countryCode: "43", caption: "Austria", active: "1"},
                {code: "AZ", countryCode: "994", caption: "Azerbaijan", active: "0"},
                {code: "BS", countryCode: "1242", caption: "Bahamas", active: "1"},
                {code: "BH", countryCode: "973", caption: "Bahrain", active: "0"},
                {code: "BD", countryCode: "880", caption: "Bangladesh", active: "0"},
                {code: "BB", countryCode: "1246", caption: "Barbados", active: "0"},
                {code: "BY", countryCode: "375", caption: "Belarus", active: "0"},
                {code: "BE", countryCode: "32", caption: "Belgium", active: "1"},
                {code: "BZ", countryCode: "501", caption: "Belize", active: "1"},
                {code: "BJ", countryCode: "229", caption: "Benin", active: "0"},
                {code: "BM", countryCode: "1441", caption: "Bermuda", active: "1"},
                {code: "BT", countryCode: "975", caption: "Bhutan", active: "0"},
                {code: "BO", countryCode: "591", caption: "Bolivia", active: "1"},
                {code: "BQ", countryCode: "599", caption: "Bonaire, Sint Eustatius and Saba", active: "0"},
                {code: "BA", countryCode: "387", caption: "Bosnia And Herzegovina", active: "0"},
                {code: "BW", countryCode: "267", caption: "Botswana", active: "0"},
                {code: "BV", countryCode: "47", caption: "Bouvet Island", active: "0"},
                {code: "BR", countryCode: "55", caption: "Brazil", active: "1", language: "pt"},
                {code: "IO", countryCode: "246", caption: "British Indian Ocean Territory", active: "0"},
                {code: "BN", countryCode: "673", caption: "Brunei", active: "0"},
                {code: "BG", countryCode: "359", caption: "Bulgaria", active: "1"},
                {code: "BF", countryCode: "226", caption: "Burkina Faso", active: "0"},
                {code: "BI", countryCode: "257", caption: "Burundi", active: "0"},
                {code: "KH", countryCode: "855", caption: "Cambodia", active: "1"},
                {code: "CM", countryCode: "237", caption: "Cameroon", active: "1"},
                {code: "CA", countryCode: "1", caption: "Canada", active: "1"},
                {code: "CV", countryCode: "238", caption: "Cape Verde", active: "0"},
                {code: "KY", countryCode: "1345", caption: "Cayman Islands", active: "1"},
                {code: "CF", countryCode: "236", caption: "Central African Republic", active: "0"},
                {code: "TD", countryCode: "235", caption: "Chad", active: "0"},
                {code: "CL", countryCode: "56", caption: "Chile", active: "1"},
                {code: "CN", countryCode: "86", caption: "China", active: "1"},
                {code: "CX", countryCode: "61", caption: "Christmas Island", active: "0"},
                {code: "CC", countryCode: "61", caption: "Cocos (Keeling) Islands", active: "0"},
                {code: "CO", countryCode: "57", caption: "Colombia", active: "1"},
                {code: "KM", countryCode: "269", caption: "Comoros", active: "0"},
                {code: "CG", countryCode: "242", caption: "Congo", active: "0"},
                {code: "CK", countryCode: "682", caption: "Cook Islands", active: "0"},
                {code: "CR", countryCode: "506", caption: "Costa Rica", active: "1"},
                {code: "HR", countryCode: "385", caption: "Croatia (Hrvatska)", active: "0"},
                {code: "CU", countryCode: "53", caption: "Cuba", active: "0", language: "es"},
                {code: "CW", countryCode: "5999", caption: "Curacao", active: "0"},
                {code: "CY", countryCode: "357", caption: "Cyprus", active: "0"},
                {code: "CZ", countryCode: "420", caption: "Czech Republic", active: "1"},
                {code: "CI", countryCode: "225", caption: "Côte d'Ivoire (Ivory Coast)", active: "0"},
                {code: "CD", countryCode: "243", caption: "Democratic Republic Of Congo (Zaire)", active: "0"},
                {code: "DK", countryCode: "45", caption: "Denmark", active: "1"},
                {code: "DJ", countryCode: "253", caption: "Djibouti", active: "0"},
                {code: "DM", countryCode: "1767", caption: "Dominica", active: "0"},
                {code: "DO", countryCode: "1", caption: "Dominican Republic", active: "1"},
                {code: "EC", countryCode: "593", caption: "Ecuador", active: "1"},
                {code: "EG", countryCode: "20", caption: "Egypt", active: "1"},
                {code: "SV", countryCode: "503", caption: "El Salvador", active: "1"},
                {code: "GQ", countryCode: "240", caption: "Equatorial Guinea", active: "0"},
                {code: "ER", countryCode: "291", caption: "Eritrea", active: "0"},
                {code: "EE", countryCode: "372", caption: "Estonia", active: "1"},
                {code: "ET", countryCode: "251", caption: "Ethiopia", active: "0"},
                {code: "FK", countryCode: "500", caption: "Falkland Islands (Malvinas)", active: "0"},
                {code: "FO", countryCode: "298", caption: "Faroe Islands", active: "0"},
                {code: "FJ", countryCode: "679", caption: "Fiji", active: "0"},
                {code: "FI", countryCode: "358", caption: "Finland", active: "1"},
                {code: "FR", countryCode: "33", caption: "France", active: "1", language: "fr"},
                {code: "GF", countryCode: "594", caption: "French Guiana", active: "0"},
                {code: "PF", countryCode: "689", caption: "French Polynesia", active: "0"},
                {code: "TF", countryCode: "596", caption: "French Southern Territories", active: "0"},
                {code: "GA", countryCode: "241", caption: "Gabon", active: "0"},
                {code: "GM", countryCode: "220", caption: "Gambia", active: "0"},
                {code: "GE", countryCode: "995", caption: "Georgia", active: "0"},
                {code: "DE", countryCode: "49", caption: "Germany", active: "1"},
                {code: "GH", countryCode: "233", caption: "Ghana", active: "0"},
                {code: "GI", countryCode: "350", caption: "Gibraltar", active: "0"},
                {code: "GR", countryCode: "30", caption: "Greece", active: "1"},
                {code: "GL", countryCode: "299", caption: "Greenland", active: "1"},
                {code: "GD", countryCode: "1473", caption: "Grenada", active: "0"},
                {code: "GP", countryCode: "590", caption: "Guadeloupe", active: "0"},
                {code: "GU", countryCode: "1671", caption: "Guam", active: "0"},
                {code: "GT", countryCode: "502", caption: "Guatemala", active: "1"},
                {code: "GG", countryCode: "44", caption: "Guernsey", active: "0"},
                {code: "GN", countryCode: "224", caption: "Guinea", active: "0"},
                {code: "GW", countryCode: "245", caption: "Guinea-Bissau", active: "0"},
                {code: "GY", countryCode: "592", caption: "Guyana", active: "0"},
                {code: "HT", countryCode: "509", caption: "Haiti", active: "1"},
                {code: "HM", countryCode: "672", caption: "Heard And McDonald Islands", active: "0"},
                {code: "HN", countryCode: "504", caption: "Honduras", active: "1"},
                {code: "HK", countryCode: "852", caption: "Hong Kong", active: "1"},
                {code: "HU", countryCode: "36", caption: "Hungary", active: "0"},
                {code: "IS", countryCode: "354", caption: "Iceland", active: "1"},
                {code: "IN", countryCode: "91", caption: "India", active: "1"},
                {code: "ID", countryCode: "62", caption: "Indonesia", active: "0"},
                {code: "IR", countryCode: "98", caption: "Iran", active: "0"},
                {code: "IQ", countryCode: "964", caption: "Iraq", active: "0"},
                {code: "IE", countryCode: "353", caption: "Ireland", active: "1"},
                {code: "IM", countryCode: "44", caption: "Isle of Man", active: "0"},
                {code: "IL", countryCode: "972", caption: "Israel", active: "1"},
                {code: "IT", countryCode: "39", caption: "Italy", active: "1"},
                {code: "JM", countryCode: "1876", caption: "Jamaica", active: "1"},
                {code: "JP", countryCode: "81", caption: "Japan", active: "1"},
                {code: "JE", countryCode: "44", caption: "Jersey", active: "0"},
                {code: "JO", countryCode: "962", caption: "Jordan", active: "0"},
                {code: "KZ", countryCode: "7", caption: "Kazakhstan", active: "0"},
                {code: "KE", countryCode: "254", caption: "Kenya", active: "0"},
                {code: "KI", countryCode: "686", caption: "Kiribati", active: "0"},
                {code: "KW", countryCode: "965", caption: "Kuwait", active: "0"},
                {code: "KG", countryCode: "996", caption: "Kyrgyzstan", active: "0"},
                {code: "LA", countryCode: "856", caption: "Laos", active: "0"},
                {code: "LV", countryCode: "371", caption: "Latvia", active: "0"},
                {code: "LB", countryCode: "961", caption: "Lebanon", active: "0"},
                {code: "LS", countryCode: "266", caption: "Lesotho", active: "0"},
                {code: "LR", countryCode: "231", caption: "Liberia", active: "0"},
                {code: "LY", countryCode: "218", caption: "Libya", active: "0"},
                {code: "LI", countryCode: "423", caption: "Liechtenstein", active: "1"},
                {code: "LT", countryCode: "370", caption: "Lithuania", active: "0"},
                {code: "LU", countryCode: "352", caption: "Luxembourg", active: "1"},
                {code: "MO", countryCode: "853", caption: "Macau", active: "0"},
                {code: "MK", countryCode: "389", caption: "Macedonia", active: "0"},
                {code: "MG", countryCode: "261", caption: "Madagascar", active: "0"},
                {code: "MW", countryCode: "265", caption: "Malawi", active: "0"},
                {code: "MY", countryCode: "60", caption: "Malaysia", active: "0"},
                {code: "MV", countryCode: "960", caption: "Maldives", active: "0"},
                {code: "ML", countryCode: "223", caption: "Mali", active: "0"},
                {code: "MT", countryCode: "356", caption: "Malta", active: "0"},
                {code: "MH", countryCode: "692", caption: "Marshall Islands", active: "0"},
                {code: "MQ", countryCode: "596", caption: "Martinique", active: "0"},
                {code: "MR", countryCode: "222", caption: "Mauritania", active: "0"},
                {code: "MU", countryCode: "230", caption: "Mauritius", active: "0"},
                {code: "YT", countryCode: "262", caption: "Mayotte", active: "0"},
                {code: "MX", countryCode: "52", caption: "Mexico", active: "1"},
                {code: "FM", countryCode: "691", caption: "Micronesia", active: "0"},
                {code: "MD", countryCode: "373", caption: "Moldova", active: "0"},
                {code: "MC", countryCode: "377", caption: "Monaco", active: "1"},
                {code: "MN", countryCode: "976", caption: "Mongolia", active: "0"},
                {code: "ME", countryCode: "382", caption: "Montenegro", active: "1"},
                {code: "MS", countryCode: "1664", caption: "Montserrat", active: "0"},
                {code: "MA", countryCode: "212", caption: "Morocco", active: "0"},
                {code: "MZ", countryCode: "258", caption: "Mozambique", active: "0"},
                {code: "MM", countryCode: "95", caption: "Myanmar (Burma)", active: "0"},
                {code: "NA", countryCode: "264", caption: "Namibia", active: "0"},
                {code: "NR", countryCode: "674", caption: "Nauru", active: "0"},
                {code: "NP", countryCode: "977", caption: "Nepal", active: "0"},
                {code: "NL", countryCode: "31", caption: "Netherlands", active: "1"},
                {code: "AN", countryCode: "599", caption: "Netherlands Antilles", active: "0"},
                {code: "NC", countryCode: "687", caption: "New Caledonia", active: "0"},
                {code: "NZ", countryCode: "64", caption: "New Zealand", active: "1"},
                {code: "NI", countryCode: "505", caption: "Nicaragua", active: "1"},
                {code: "NE", countryCode: "227", caption: "Niger", active: "0"},
                {code: "NG", countryCode: "234", caption: "Nigeria", active: "0"},
                {code: "NU", countryCode: "683", caption: "Niue", active: "0"},
                {code: "NF", countryCode: "6723", caption: "Norfolk Island", active: "0"},
                {code: "KP", countryCode: "850", caption: "North Korea", active: "0"},
                {code: "MP", countryCode: "1670", caption: "Northern Mariana Islands", active: "0"},
                {code: "NO", countryCode: "47", caption: "Norway", active: "1"},
                {code: "OM", countryCode: "968", caption: "Oman", active: "0"},
                {code: "PK", countryCode: "92", caption: "Pakistan", active: "0"},
                {code: "PW", countryCode: "680", caption: "Palau", active: "0"},
                {code: "PS", countryCode: "970", caption: "Palestinian Authority", active: "0"},
                {code: "PA", countryCode: "507", caption: "Panama", active: "1"},
                {code: "PG", countryCode: "675", caption: "Papua New Guinea", active: "0"},
                {code: "PY", countryCode: "595", caption: "Paraguay", active: "1"},
                {code: "PE", countryCode: "51", caption: "Peru", active: "1"},
                {code: "PH", countryCode: "63", caption: "Philippines", active: "0"},
                {code: "PN", countryCode: "872", caption: "Pitcairn Islands", active: "0"},
                {code: "PL", countryCode: "48", caption: "Poland", active: "1"},
                {code: "PT", countryCode: "351", caption: "Portugal", active: "1", language: "pt"},
                {code: "PR", countryCode: "1787", caption: "Puerto Rico", active: "1"},
                {code: "QA", countryCode: "974", caption: "Qatar", active: "0"},
                {code: "RE", countryCode: "262", caption: "Reunion", active: "0"},
                {code: "RO", countryCode: "40", caption: "Romania", active: "1"},
                {code: "RU", countryCode: "7", caption: "Russia", active: "1"},
                {code: "RW", countryCode: "250", caption: "Rwanda", active: "0"},
                {code: "BL", countryCode: "590", caption: "Saint Barthelemy", active: "0"},
                {code: "SH", countryCode: "290", caption: "Saint Helena", active: "0"},
                {code: "KN", countryCode: "1869", caption: "Saint Kitts And Nevis", active: "0"},
                {code: "LC", countryCode: "1758", caption: "Saint Lucia", active: "1"},
                {code: "MF", countryCode: "590", caption: "Saint Martin", active: "0"},
                {code: "PM", countryCode: "508", caption: "Saint Pierre And Miquelon", active: "1"},
                {code: "VC", countryCode: "1784", caption: "Saint Vincent And The Grenadines", active: "0"},
                {code: "SM", countryCode: "378", caption: "San Marino", active: "1"},
                {code: "ST", countryCode: "239", caption: "Sao Tome And Principe", active: "0"},
                {code: "SA", countryCode: "966", caption: "Saudi Arabia", active: "0"},
                {code: "SN", countryCode: "221", caption: "Senegal", active: "0"},
                {code: "RS", countryCode: "381", caption: "Serbia", active: "1"},
                {code: "SC", countryCode: "248", caption: "Seychelles", active: "0"},
                {code: "SL", countryCode: "232", caption: "Sierra Leone", active: "0"},
                {code: "SG", countryCode: "65", caption: "Singapore", active: "0"},
                {code: "SX", countryCode: "1721", caption: "Sint Maarten", active: "0"},
                {code: "SK", countryCode: "421", caption: "Slovakia", active: "1"},
                {code: "SI", countryCode: "386", caption: "Slovenia", active: "1"},
                {code: "SB", countryCode: "677", caption: "Solomon Islands", active: "0"},
                {code: "SO", countryCode: "252", caption: "Somalia", active: "0"},
                {code: "ZA", countryCode: "27", caption: "South Africa", active: "1"},
                {code: "GS", countryCode: "500", caption: "South Georgia And South Sandwich Islands", active: "0"},
                {code: "KR", countryCode: "82", caption: "South Korea", active: "1"},
                {code: "SS", countryCode: "211", caption: "South Sudan", active: "0"},
                {code: "ES", countryCode: "34", caption: "Spain", active: "1", language: "es"},
                {code: "LK", countryCode: "94", caption: "Sri Lanka", active: "0"},
                {code: "SD", countryCode: "249", caption: "Sudan", active: "0"},
                {code: "SR", countryCode: "597", caption: "Suriname", active: "0"},
                {code: "SJ", countryCode: "47", caption: "Svalbard And Jan Mayen", active: "0"},
                {code: "SZ", countryCode: "268", caption: "Swaziland", active: "0"},
                {code: "SE", countryCode: "46", caption: "Sweden", active: "1"},
                {code: "CH", countryCode: "41", caption: "Switzerland", active: "1"},
                {code: "SY", countryCode: "963", caption: "Syria", active: "0"},
                {code: "TW", countryCode: "886", caption: "Taiwan", active: "0"},
                {code: "TJ", countryCode: "992", caption: "Tajikistan", active: "0"},
                {code: "TZ", countryCode: "255", caption: "Tanzania", active: "0"},
                {code: "TH", countryCode: "66", caption: "Thailand", active: "0"},
                {code: "TL", countryCode: "670", caption: "Timor-Leste", active: "0"},
                {code: "TG", countryCode: "228", caption: "Togo", active: "0"},
                {code: "TK", countryCode: "690", caption: "Tokelau", active: "0"},
                {code: "TO", countryCode: "676", caption: "Tonga", active: "0"},
                {code: "TT", countryCode: "1868", caption: "Trinidad And Tobago", active: "1"},
                {code: "TN", countryCode: "216", caption: "Tunisia", active: "0"},
                {code: "TR", countryCode: "90", caption: "Turkey", active: "1"},
                {code: "TM", countryCode: "993", caption: "Turkmenistan", active: "0"},
                {code: "TC", countryCode: "1649", caption: "Turks And Caicos Islands", active: "0"},
                {code: "TV", countryCode: "688", caption: "Tuvalu", active: "0"},
                {code: "UG", countryCode: "256", caption: "Uganda", active: "0"},
                {code: "UA", countryCode: "380", caption: "Ukraine", active: "1"},
                {code: "AE", countryCode: "971", caption: "United Arab Emirates", active: "1"},
                {code: "GB", countryCode: "44", caption: "United Kingdom", active: "1"},
                {code: "US", countryCode: "1", caption: "United States", active: "1", language: "en"},
                //{code: "UM", countryCode: "1", caption: "United States Minor Outlying Islands", active: "1"},
                {code: "UY", countryCode: "598", caption: "Uruguay", active: "1"},
                {code: "UZ", countryCode: "998", caption: "Uzbekistan", active: "0"},
                {code: "VA", countryCode: "379", caption: "Vatican City (Holy See)", active: "0"},
                {code: "VE", countryCode: "58", caption: "Venezuela", active: "1"},
                {code: "VN", countryCode: "84", caption: "Vietnam", active: "1"},
                {code: "VG", countryCode: "1284", caption: "Virgin Islands (British)", active: "0"},
                {code: "VI", countryCode: "1340", caption: "Virgin Islands (US)", active: "0"},
                {code: "WF", countryCode: "681", caption: "Wallis And Futuna Islands", active: "0"},
                {code: "WS", countryCode: "685", caption: "Western Samoa", active: "0"},
                {code: "YE", countryCode: "697", caption: "Yemen", active: "0"},
                {code: "ZM", countryCode: "260", caption: "Zambia", active: "0"},
                {code: "ZW", countryCode: "263", caption: "Zimbabwe", active: "0"},
                {code: "AX", countryCode: "358", caption: "Åland Islands", active: "0"},
                {code: "VU", countryCode: "678", caption: "Vanuatu", active: "0"}
            ];
        }
    };

    return CountryCodesSvcMethods;


}

/**
 * @name : Background Factory
 * @description : Get background color
 *
 **/
function callpalbackground($localstorage) {
    return {
        get_background: function () {
            var background = 'default-green';
            try {
                var user_info = $localstorage.getObject('userInfo');
                if (user_info != undefined && user_info != null) {
                    var settings = user_info.settings;
                    if (settings != undefined && settings != null) {
                        var raw_background = settings.background;
                        if (raw_background && raw_background != "" && raw_background != undefined)
                            background = raw_background;
                    }
                }
            } catch (err) {
                console.log('there is an error reading background from config file', err);
            }
            return background;
        }
    }
}

/**
 * @name : AuthInterceptor
 * @description : This component manage the request before send it to the server, the basic concept is
 *    change the token for the request when the token expires. First we validate the URL (we don't need to update the token
 *    for the login page or the registration page/request for example, so we only validate this for a few requests.
 *
 **/
function AuthInterceptor($rootScope,
        $q,
        $localstorage,
        $injector,
        UserSvc) {

    /**
     * @function: @validate_before_refresh_token
     * @description: validate the url before change/refresh the token
     * @param: config : HTTP Request configuration
     * @return:
     *   OnOK: Boolean value true
     *   OnError: Boolan value false
     *
     **/
    // NOTE: not template && not login && (no username means not sign up) && not grant_type means not token exchange, recoverpassword
    var validate_before_refresh_token = function (config) {
        var c = config;
        if (c.url.indexOf("templates") <= -1 &&
                c.url.indexOf("login") <= -1 &&
                c.url.indexOf("token") <= -1 &&
                c.url.indexOf("recoverpassword") <= -1 &&
                c.data != undefined &&
                c.data.username == undefined &&
                c.data.grant_type == undefined &&
                c.url.indexOf("fbusers") <= -1 &&
                c.url.indexOf("gusers") <= -1) {
            return true;
        }
        return false;
    };

    /**
     * @function: @is_token_life_expired
     * @description: Check is the token is not expired based on Math.round
     * @param: userToken (The userToken object with the tokenLife and the created date)
     * @return: A boolean value
     **/
    var is_token_life_expired = function (userToken) {
        return (Math.round((Date.now() - userToken.created) / 1000) > userToken.tokenLife);
    };

    //--------------------------------------------------------------
    // Interceptor methods
    //
    return {};
}

/**
 * @name : Global Utility Function
 * @description : utility functions (isEmptyObject?, isRunningOnADevice? and more)
 *
 **/
function Utils($cordovaLocalNotification, $injector, UserSvc, $q, $http, $timeout, $cordovaDevice, $window, PHONE_STATUS, $translate, $base64, $ionicPlatform) {

    var _timeout;
    var host = window.config.api.host;

    var o = {
        favoriteSwiper: undefined,
        callGroupSwiper: undefined,
        /**
         * @function: @formatPhoneNumber
         * @description: Format phone number so it is 'call ready'
         * @param: number { contact.phoneNumbers[0].normalizedNumber }
         * @param: country {code,caption,active} (Object)
         * @return:  Returns formatted phone number
         *
         **/
        formatPhoneNumber: function (number, country) {
            number = PhoneFormat.cleanPhone(number);
            number = PhoneFormat.formatE164(country['code'], number);
            return number;
        },
        runCordovaPlugins: function () {

            if (typeof window.plugins !== 'undefined') {

                if (window.StatusBar)
                    window.StatusBar.styleDefault();

                if (cordova) {
                    if (window.config.debug)
                        window.plugins.insomnia.keepAwake();

//          cordova.plugins.backgroundMode.setDefaults({
//            title: "CallPal", text: $translate.instant('call_history.on_background')
//          });
                    cordova.plugins.backgroundMode.enable();

                    if (window.cordova.plugins.Keyboard)
                        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);

                }
            }

        },
        hideSplashScreen: function () {

            if (ionic.Platform.isAndroid() || ionic.Platform.isIOS()) {
                $timeout(function () {
                    /*if (navigator && navigator.splashscreen)
                        navigator.splashscreen.hide();*/
                }, 1000);
            }

        },
        /**
         * @function: @validPhoneNumber
         * @description: Checks if phone number it is 'call ready'
         * @param: number { contact.phoneNumbers[0].normalizedNumber }
         * @param: country {code,caption,active} (Object)
         * @return:  Returns boolean
         *
         **/
        validPhoneNumber: function (phone, country) {

            if (phone.length === 0)
                return false;

            var userInfo = UserSvc.getUserInfo(),
                    e164Country = this.formatToE164(phone, country),
                    matchingCountry = PhoneFormat.countryForE164Number(e164Country),
                    matchOnCountry = PhoneFormat.isValidNumber(phone, country),
                    matchOnOwnCountry = PhoneFormat.isValidNumber(phone, userInfo.country);

            if (matchOnCountry && matchingCountry.toUpperCase() === country.toUpperCase()) {
                return {valid: true, displayedNumber: e164Country};
            } else if ((matchOnCountry !== matchOnOwnCountry) && (matchingCountry.toUpperCase() !== country.toUpperCase())) {
                return {valid: true, displayedNumber: phone};
            } else {
                return {valid: false, displayedNumber: phone};
            }
        },
        formatToE164: function (phone, country) {

            if (phone.length === 0)
                return false;

            return PhoneFormat.formatE164(country, phone);
        },
        // remove all letters and characters from number
        clearNumbers: function (contact) {
            angular.forEach(contact.phoneNumbers, function (phoneNumber) {
                phoneNumber.number = phoneNumber.number.replace(/[^\d]/g, '');
            });
        },
        // Allows to bring the app to the front
        // If the app is minimized is gonna launch the app to the front
        bringAppToFront: function () {
            if (typeof startApp !== 'undefined' && window.device.platform === 'Android') {
                var sApp = startApp.set({
                    package: window.config.package_name
                });
                sApp.start(function (message) {  /* success */
                    console.log("Launching app", message); // => OK
                },
                        function (error) {
                            console.log("Error launching app", error);
                        });
            }
        },
        // Create a localNotification
        createLocalNotification: function (id, title, message, data) {
            return $cordovaLocalNotification.schedule({
                id: id, title: title, text: message, data: data
            });
        },
        device: function () {

            if (typeof device !== 'undefined') {
                return $cordovaDevice.getDevice();
            } else
                return {
                    available: true,
                    cordova: "",
                    manufacturer: "",
                    model: "",
                    platform: "",
                    uuid: "",
                    version: ""
                };

        },
        // this function has been modified in order to refresh token when inactivity
        connectivity: function () {

            var deferred = $q.defer();
            var userToken = UserSvc.getUserToken();

            var req = {
                method: 'GET',
                url: (host + '/verify/connection/'),
                headers: {
                    'Authorization': 'Bearer ' + userToken.value
                }
            };
            //console.log('connectivity ', req);
            $http(req)
                    .then(function () {
                        deferred.resolve()
                    }, function (error) {
                        return deferred.reject(error.status);
                    });

            return deferred.promise;

        },
        checkConnectivity: function () {
            var deferred = $q.defer();
            this.connectivity()
                    .then(function () {
                        deferred.resolve();
                    }, function (errorStatus) {
                        /*if (errorStatus == 0) {
                         $ionicPopup
                         .confirm({
                         title: 'Error',
                         template: 'The app is offline, check your network and try again.',
                         okText: 'Retry'
                         })
                         .then(function (res) {
                         if (res) {
                         $timeout(function () {
                         $window.location.reload(true)
                         });
                         }
                         });
                         }*/
                        deferred.reject();
                    });
            return deferred.promise;
        },
        delay: function (time) {
            var deferred = $q.defer();

            if (typeof time === 'undefined')
                time = 1000;

            if (_timeout) {
                $timeout.cancel(_timeout);
            }

            $ionicPlatform.ready(function() {
                _timeout = $timeout(function () {
                    _timeout = null;
                    deferred.resolve();
                }, time);
            });

            return deferred.promise;

        },
        get_random_number_from_zero: function (number) {
            return Math.floor((Math.random() * number) + 1);
        },
        /**
         * @function: @is_valid_email
         * @description: Validate if the email address is correct
         * @param:-
         * @return:-
         * @link: http://codesnippets.joyent.com/posts/show/1917
         * @link: http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
         **/
        is_valid_email: function (email) {
            var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            if (email != undefined) {
                if (filter.test(email) && email != "")
                    return true;
            }
            return false;
        },
        /**
         * @function: @is_valid_password
         * @description: Validate the password is correct
         * @param:-
         * @return:-
         **/
        is_valid_password: function (password) {
            return (password != undefined && password != "" && password.length >= 6);
        },
        /**
         * @function: @is_valid_phone_prefix
         * @description: Validate the phone prefix
         * @param: phone_prefix : +1
         * @return: Boolean
         **/
        is_valid_phone_prefix: function (phone_prefix) {
            var c = phone_prefix;
            return (c.length >= 2 && c.length <= 6 && c.indexOf("+") == 0);
        },
        /**
         * @function: @is_valid_phone
         * @description: Validate the phone number
         * @param: phone
         * @return:-
         **/
        is_valid_phone: function (phone, country) {
            if (phone == null || country == null)
                return false;
            
            country = country.replace('+', '');

            var e164Country = PhoneFormat.formatE164(country, phone);
            var matchingCountry = PhoneFormat.countryForE164Number(e164Country);
            var matchOnCountry = PhoneFormat.isValidNumber(phone, country);

            if(matchOnCountry)
                return e164Country;
            else
                return false;
        },
        /**
         * @function: @is_valid_year
         * @description: valid a year
         * @return: year
         **/
        is_valid_year: function (year) {
            var y = parseInt(year);
            if (isNaN(y))
                return false;
            if (year.toString().length != 4)
                return false;
            var current_year = parseInt((new Date()).getUTCFullYear());
            if (y < 1900)
                return false;
            if (y > current_year)
                return false;
            return true;
        },
        /**
         * @function: @isEmptyObject
         * @description: Validate if the object is empty
         * @param: obj (some object)
         **/
        isEmptyObject: function (obj) {
            for (var key in obj)
                if (Object.prototype.hasOwnProperty.call(obj, key))
                    return false;
            return true;
        },
        /**
         * @function: @isRunningOnADevice
         * @description: Check if the app is Running on a Device or not
         * @return: A boolean value
         **/
        isRunningOnADevice: function () {
            var dev = ionic.Platform.device();
            if (Object.keys(dev).length === 0)
                return false;
            return true;
        },
        timeToSecondAndMinutes: function (time, labels) {
            var isNegative = parseInt(time) < 0 ? true : false,
                    time = Math.abs(time),
                    resp = null;

            var minutes = Math.floor(time / 60);
            var seconds = time - minutes * 60;
            if (labels)
                resp = (minutes > 0 ? (minutes < 10 ? "0" + minutes : minutes) + "min " : "") + (seconds < 10 ? "0" + seconds : seconds) + "sec";
            else
                resp = (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);

            if (isNegative) {
                resp = '- ' + resp;
            }

            return resp;
        },
        getTimeStamp: function () {
            return new Date().getTime();
        },
        setFocus: function (elementId) {
            if (!elementId)
                return false;

            $timeout(function () {
                angular.element('#' + elementId).focus();
            }, 500);
        },
        showKeyboard: function (elementId) {
            if (window.cordova) {
                cordova.plugins.Keyboard.show();
            }
            this.setFocus(elementId);
        },
        hideKeyboard: function () {
            if (window.cordova)
                cordova.plugins.Keyboard.close();
        },
        watchPhoneStatus: function () {

            $window.addEventListener('offline', function () {
                PHONE_STATUS.online = false;
            });

            $window.addEventListener('online', function () {

                PHONE_STATUS.online = true;
                console.log('Re-Connect to the SIP on connection back: ');
                var CallPalSvc = $injector.get('CallPalSvc');
                var SIPService = $injector.get('SIPService');
                // Init the SIP connection only if the app is not in background
                if (typeof cordova !== 'undefined') {
                  if (!cordova.plugins.backgroundMode.isActive()) {
                    SIPService.init().then(function () {
                      CallPalSvc.init();
                    });
                  }
                }
                else // only web
                {
                    SIPService.init().then(function () {
                        CallPalSvc.init();
                    });
                }

            });
        },
        createFavoriteSwiper: function () {
            $timeout(function () {
                o.favoriteSwiper = new Swiper('.widget-favorites .swiper-container', {
                    slidesPerView: 3,
                    spaceBetween: 10
                });

            }, 100);
        },
        createCallGroupSwiper: function () {
            $timeout(function () {
                o.callGroupSwiper = new Swiper('.widget-call-group .swiper-container', {
                    slidesPerView: 2,
                    spaceBetween: 10
                });

            }, 100);
        },
        // getFolderPath
        getFolderPath: function () {
            if (ionic.Platform.isAndroid()) {
                return cordova.file.externalApplicationStorageDirectory;
            } else if (ionic.Platform.isIOS()) {
                return cordova.file.documentsDirectory;
            }
        },
        validateFileExtensionToShare: function (fileName) {
            var self = this;
            var extensions = ['.jpg', '.gif', '.png', '.pdf', '.jpeg'];

            if (self.hasExtension(fileName, extensions)) {
                return true;
            }
            return false;
        },
        validateFileSize: function (size) {
            return (size / 1024 / 1024 <= 14)
        },
        hasExtension: function (fileName, exts) {
            return (new RegExp('(' + exts.join('|').replace(/\./g, '\\.') + ')$')).test(fileName);
        },
        notifyError: function (exception) {

            var userInfo = UserSvc.getUserInfo(),
                    crashReport = {
                        message: exception,
                        date: moment().format('dddd MMMM Do YYYY, h:mm:ss a'),
                        device: ionic.Platform.isWebView() ? $cordovaDevice.getDevice() : 'navigator'
                    };

            $http.put(window.config.crashReport.url + '/api/usererrlog/' + userInfo.username,
                    crashReport, {
                        headers: {
                            Authorization: 'Basic ' + $base64.encode(window.config.crashReport.username + ':'
                                    + window.config.crashReport.password)
                        }
                    }).success(function (response) {
                if (response.success) {
                    console.log('Error sended');
                }
            });

            console.log('Sending error');
            //window.alert($translate.instant('w_general_actions.found_error') + '\n' + exception);
        },
        generateRandomTelephoneNumbers: function (quantity, maxPhonesPerContact) {

            var phones = [],
                    minPhones = 2342348000,
                    maxPhones = 8908995000,
                    phoneTypes = ['MOBILE', 'HOME', 'OTHER'],
                    random = Math.random();

            for (var i = 0; i < quantity; i++) {

                var position = i + 1,
                        contact = {
                            displayName: "Contact No." + position,
                            firstName: "Contact",
                            id: position,
                            lastName: "No." + position,
                            phoneNumbers: []
                        },
                randomQuantityPhones = Math.floor(random * maxPhonesPerContact) + 1;

                for (var j = 0; j < randomQuantityPhones; j++) {

                    var randomNumber = Math.floor(random * (maxPhones - minPhones)) + minPhones,
                            randomNumber = randomNumber.toString(),
                            random = Math.random();

                    contact.phoneNumbers.push({
                        normalizedNumber: randomNumber,
                        number: randomNumber,
                        type: phoneTypes[Math.floor(random * phoneTypes.length)]
                    });
                }

                phones.push(contact);
            }

            return phones;
        }
    };

    return o;
}

function Permission($window, $timeout, $q, $rootScope, $state) {

    function runValidations(permissions){

        if (!$window.cordova || !cordova.plugins.diagnostic) {
            return { valid: false, message: 'No cordova.plugins.diagnostic installed' };
        } else if(!ionic.Platform.isWebView()){
            return { valid: false, message: 'Only running on phones' };
        }else if(ionic.Platform.platform() !== 'android' && ionic.Platform.version() < 6){
            return { valid: false, message: 'Only running on Android >= 6' };
        } else if (permissions && !Array.isArray(permissions)) {
            return { valid: false, message: 'Permissions should be an Array' };
        } else if (Array.isArray(permissions) && permissions.length === 0) {
            return { valid: false, message: 'Permissions should have at least a value' };
        }else{
            return { valid: true, message: '' };
        }
    }

    var o = {
        userPrompted: false,
        areValidPermissions: function (permissions) {

            /*
             * Visit https://www.npmjs.com/package/cordova.plugins.diagnostic#getpermissionauthorizationstatus
             * for more info
             */

            for (var i in permissions) {
                var permission = permissions[i];
                if (!cordova.plugins.diagnostic.runtimePermission[permission]) {
                    console.warn('This permission does not exist: ' + permission);
                    return false;
                }
            }

            return true;
        },
        goToState: function (state, params) {
            $state.go(state, params);
        },
        request: function (permissions) {

            var permissionsArray = [],
                defer = $q.defer(),
                response = runValidations(permissions);

            if (ionic.Platform.isIOS()) {
                defer.resolve(true);
                return defer.promise;
            }

            if(response.valid === false){
                defer.reject(response.message);
                return defer.promise;
            }

            if (!permissions) { //set default permissions
                permissionsArray = [
                    cordova.plugins.diagnostic.runtimePermission.CAMERA,
                    cordova.plugins.diagnostic.runtimePermission.RECORD_AUDIO,
                    cordova.plugins.diagnostic.runtimePermission.READ_PHONE_STATE,
                    cordova.plugins.diagnostic.runtimePermission.SEND_SMS,
                    cordova.plugins.diagnostic.runtimePermission.READ_EXTERNAL_STORAGE,
                    cordova.plugins.diagnostic.runtimePermission.WRITE_EXTERNAL_STORAGE,
                    cordova.plugins.diagnostic.runtimePermission.READ_CONTACTS/*,
                    cordova.plugins.diagnostic.runtimePermission.WRITE_CONTACTS*/
                ];
            } else {
                for (var i in permissions) {
                    var permission = permissions[i];
                    permissionsArray.push(cordova.plugins.diagnostic.runtimePermission[permission]);
                }
            }

            if (o.areValidPermissions(permissionsArray)) {

                cordova.plugins.diagnostic.requestRuntimePermissions(function (statuses) {

                    var allPermissionsGranted = true;

                    for (var permission in statuses) {
                        switch (statuses[permission]) {
                            case cordova.plugins.diagnostic.runtimePermissionStatus.DENIED:
                                allPermissionsGranted = false;
                                break;
                            case cordova.plugins.diagnostic.runtimePermissionStatus.DENIED_ALWAYS:
                                allPermissionsGranted = false;
                                break;
                        }
                    }

                    $rootScope.$broadcast('Permission.doneApplying');
                    o.userPrompted = true;
                    return defer.resolve(allPermissionsGranted);
                },
                function (err) { $rootScope.$broadcast('Permission.doneApplying'); o.userPrompted = true; }, permissionsArray);
            } else {
                $rootScope.$broadcast('Permission.doneApplying');
                o.userPrompted = true;
                defer.reject('Invalid permission(s) detected');
            }

            return defer.promise;
        }
    };

    return o;

}
