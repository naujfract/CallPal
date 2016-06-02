'use strict';

angular.module('callpal.settings')

        .factory('SettingsLanguageService', ['$http', 'UserSvc', 'ConfigurationSvc', '$cordovaGlobalization', '$q', '$translate', function ($http, UserSvc, ConfigurationSvc, $cordovaGlobalization, $q, $translate) {

                var host = ConfigurationSvc.base_endpoint();

                var o = {
                    init: function(){
                        o.get_lang().then(function(language){
                            $translate.use(language);
                        });
                    },
                    get_lang: function () {

                        var userInfo = UserSvc.getUserInfo(),
                            defer = $q.defer();

                        if (userInfo && userInfo.language){
                            if(userInfo.language.length === 2){
                                defer.resolve(userInfo.language);
                            }else{
                              if(ionic.Platform.isWebView()){
                                o.get_phone_language().then(function(language){
                                    defer.resolve(language);
                                }, function (err) {
                                 console.log(err);   
                                });
                              }
                            }
                        }else{
                          if(ionic.Platform.isWebView()){
                            o.get_phone_language().then(function(language){
                                if(language)
                                    defer.resolve(language);
                                else
                                    defer.reject('No language found');
                            }, function (err) {
                             console.log(err);   
                            });
                          }
                        }

                        return defer.promise;
                    },
                    get_phone_language: function () {
                        var defer = $q.defer();
                        if (navigator.globalization) {
                            $cordovaGlobalization.getPreferredLanguage()
                            .then(function (result) {
                                if (result.value) {
                                    var language = result.value.split('-');
                                        language = language[0].toLowerCase();
                                    defer.resolve(language);
                                }
                            }, function(err) {
                                defer.resolve($translate.preferredLanguage());
                            } );
                        } else {
                            defer.resolve($translate.preferredLanguage());
                        }
                        return defer.promise;
                    },
                    get_languages: function () {
                        return [
                            {lang: 'Español', abbr: "es", flag: "es"},
                            {lang: 'English', abbr: "en", flag: "gb"},
                            {lang: 'Pусский', abbr: "ru", flag: "ru"}/*,
                             { lang: "Français", abbr: "fr", flag: "fr" },
                             { lang: "Português", abbr: "pt", flag: "pt" }*/
                        ];
                    },
                    saveLanguagePreference: function (lang) {
                        this.saveLocalUserLang(lang);
                        this.saveRemoteUserLang(lang, function (callback) {
                            if (callback.success !== undefined && callback.success == false) {
                                var message = 'Error';
                                if (callback.message != undefined)
                                    message = callback.message;
                                else
                                    message = callback.error;
                                console.log('error', callback);
                            }
                        });
                    },
                    saveRemoteUserLang: function (language, callback) {

                        var userInfo = UserSvc.getUserInfo();
                        var userToken = UserSvc.getUserToken();

                        var req = {
                            method: 'PUT',
                            url: (host + '/users/' + userInfo.username),
                            headers: {
                                'Authorization': "Bearer " + userToken.value,
                                'Content-Type': "application/json"
                            },
                            data: {"language": language.abbr}
                        };
                        return $http(req);
                    },
                    saveLocalUserLang: function (language) {
                        var userInfo = UserSvc.getUserInfo();
                        userInfo.language = language.abbr;
                        UserSvc.setUserInfo(userInfo);
                    },
                };

                return o;

            }]);
