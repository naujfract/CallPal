'use strict';

angular
  .module('callpal.voicemail')
  .factory('VoiceMailSvc', ['$rootScope', 'ContactsSvc', 'AudioReproduceService', 'DBA', '$ionicPopup','$window', '$cordovaFile', '$q', '$http', 'UserSvc', 'ConfigurationSvc', '$ionicPlatform', '$translate', VoiceMailSvc]);

function VoiceMailSvc ($rootScope, ContactsSvc, AudioReproduceService, DBA, $ionicPopup, $window, $cordovaFile, $q, $http, UserSvc, ConfigurationSvc, $ionicPlatform, $translate) {

  var voiceMailResp = null;
  var folderPath = null;

  $ionicPlatform.ready(function() {
    if (typeof window.plugins !== 'undefined') {
      if (cordova) {
        if(ionic.Platform.isAndroid()) {
          folderPath = cordova.file.externalApplicationStorageDirectory;
        } else if (ionic.Platform.isIOS()) {
          folderPath = cordova.file.documentsDirectory;
        }
      }
    }
  });

  var host = ConfigurationSvc.base_endpoint();

  function createContainerFolder (folderName) {
      var deferred = $q.defer();

      $ionicPlatform.ready(function() {

        $cordovaFile
        .checkDir(folderPath, folderName)
        .then(function (success) {
            deferred.resolve();
          },
          function (fail) {
            $cordovaFile.createDir(folderPath, folderName, true)
              .then(function (success) {
                deferred.resolve();
              }, function(err) {
                deferred.reject();
              });
          }
        )
      });
      return deferred.promise;
  }

  function removeFileFromSystemFileAndDataBase (voiceMail) {
    var path = folderPath + 'voice_mail/',
        fileName = voiceMail.media_id + '.mp3';

    return $q.all([$cordovaFile.removeFile(path, fileName), DBA.delDocumentSelf('voiceMails', voiceMail, 'media_id')]);
  }



  var get = function () {
      var deferred = $q.defer();
      var userInfo = UserSvc.getUserInfo();
      var userToken = UserSvc.getUserToken();

      var req = {
        method: 'GET',
        url: (host + '/voicemail/' + userInfo.username),
        headers: {
          'Authorization': 'Bearer ' + userToken.value
        }
      };

      $http(req)
        .then(function (response) {
          deferred.resolve(response.data);
        }, function (error) {
          console.error('error getting voicemail', error);
          return deferred.reject('Error getting the remote voice mail.');
        });

      return deferred.promise;
    },


    downloadVoiceMail = function(auth_token, media_url, media_id) {
      var deferred = $q.defer();
      var userToken = UserSvc.getUserToken();

      $http({
          'method' : 'GET',
          'url' : window.config.api.host + media_url,
          'responseType': 'arraybuffer',
          headers: {
            'Authorization': 'Bearer ' + userToken.value
          }
       })
       .then(function(suc) {
         suc.media_id = media_id;
         deferred.resolve(suc);
       },
       function(err) {
         deferred.reject(err);
       });

      return deferred.promise;
    },

    saveFileSystemVoiceMail = function(voiceMailResponse) {
      var deferred = $q.defer(),
        folderName = 'voice_mail',
        fileName = voiceMailResponse.media_id + '.mp3';

      // create folder if it not exist
      createContainerFolder(folderName).then(function() {
          //save information in file
          $cordovaFile.writeFile(folderPath + folderName + '/', fileName, voiceMailResponse.data, true)
          .then(function (response) {
            deferred.resolve(response.target.localURL);
          }, function(err) {
            console.error('file not saved succesfully ', err);
            deferred.reject(err);
          });
      });
      return deferred.promise;
    },



    getIntSeconds = function (voiceMailLength) {
      return parseInt(parseInt(voiceMailLength) / 1000);
    },


    storage = function () {
      var storage = {
        voiceMails : null,
        route : (typeof cordova !== 'undefined') ? folderPath + 'voice_mail/' : '/',
        save : function (voiceMail, localURL) {
          var deferred = $q.defer();

          var _voiceMail = {
            'listened' : false,
            'path' : localURL,
            'media_id' : voiceMail.media_id
          }

          DBA.addDocument('voiceMails', _voiceMail)
            .then(function(suc) {
              deferred.resolve();
            }, function(err) {
              deferred.reject(err);
            });

          return deferred.promise;
        },


        exists : function (voiceMail) {
          var deferred = $q.defer();

          DBA.getCollection('voiceMails')
            .then(function(voiceMails) {
              var index = getVoiceMailIndex(voiceMails, voiceMail);

              if (index) {
                voiceMail.path = voiceMails[index].path;
                deferred.resolve(index);
              } else {
                deferred.resolve(false);
              }
            }, function(err) {
              deferred.reject(err);
            });

          return deferred.promise;
        },
        news : {
          getValues : function (voiceMailList) {
            var notListenedQuantity = 0,
              notifiedVoiceMailQuantity = $window.localStorage.getItem('notifiedVoiceMailQuantity');
            // search for not listened voice mail
            for (var i in voiceMailList) {
              var voiceMail = voiceMailList[i];
              if (! storage.exists(voiceMail)) {
                notListenedQuantity ++;
              }
            }
            return {'notListenedQuantity' : notListenedQuantity, 'notifiedVoiceMailQuantity' : notifiedVoiceMailQuantity};
          },
          count : function(voiceMailList) {
            //$window.localStorage.setItem('notifiedVoiceMailQuantity', 2);
            var quantity = 0,
              obj = storage.news.getValues(voiceMailList);

            // get the not notified voice mail quantity
            if (! obj.notifiedVoiceMailQuantity || obj.notifiedVoiceMailQuantity == 0) {
              quantity = obj.notListenedQuantity;
            } else {
              quantity = obj.notListenedQuantity - obj.notifiedVoiceMailQuantity;
            }

            return quantity;
          },
          refresh : function(voiceMailList) {
            var obj = storage.news.getValues(voiceMailList);
            $window.localStorage.setItem('notifiedVoiceMailQuantity', parseInt(obj.notListenedQuantity));
          }
        }
      };

      return storage;
    },
    deleteVoiceMail = function (voiceMail) {
      var deferred = $q.defer();
      var userToken = UserSvc.getUserToken();

      var confirmPopup = $ionicPopup.confirm({
        title: $translate.instant('w_voice_mail.delete_one_title'),
        template: $translate.instant('w_voice_mail.delete_one_text')
      });

      confirmPopup.then(function(res) {
        if (res) {
          var http = {
            'method' : 'PUT',
            'url' : host + '/voicemail/media/' + voiceMail.media_id,
            'headers' : {
              'Authorization': 'Bearer ' + userToken.value
            }
          }

          $http(http)
            .then(function(suc) {
              if (suc.data.hasOwnProperty('success') && suc.data.success == false) {
                deferred.reject(true);
              }

              removeFileFromSystemFileAndDataBase(voiceMail)
                .finally(function() {
                  deferred.resolve();
                })
            }, function (err) {
              deferred.reject(err);
            });

        } else {
          deferred.reject();
        }
      });

      return deferred.promise;
    },

    getVoiceMailIndex = function (voiceMails, voiceMail) {
      for (var i in voiceMails) {
        var _voiceMail = voiceMails[i];
        if (_voiceMail.media_id == voiceMail.media_id) {
          return i;
        }
      }
      return false;
    },

    getVoiceMailResp = function () {
      return voiceMailResp;
    },

    setVoiceMailResp = function (data) {
        if (! data || ! data.data || data.success === false) return;

        voiceMailResp = data;
    },

    getDateFromTimestamp = function(timestamp) {
      var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      var date = new Date((timestamp - 62167219200) * 1000);
      return (monthNames[date.getMonth()]+ ' ' + date.getDate() + ', ' + date.getFullYear());
    },

    // create al the infrastructure for the voicemail
    prepareVoiceMailList = function (voiceMailResp) {
      if (! voiceMailResp || ! voiceMailResp.data || voiceMailResp.success === false) return;
      // set an audio object for every voicemail in the list
      for (var i in voiceMailResp.data) {
        var voiceMail = voiceMailResp.data[i];

        // set the display name from contacts
        if (! ContactsSvc.isInitalized()) {
          voiceMail.displayName = voiceMail.phone;
        } else {
          voiceMail.displayName = ContactsSvc.match_member_name(voiceMail);
        }
        // data needed for reproduce
        voiceMail.audio = AudioReproduceService.audio();
        // set the listened flag
        voiceMail.listened = false;
        // get voicemail storage in db
        DBA.getCollection('voiceMails')
          .then(function(storageVoiceMails) {
            if (getVoiceMailIndex(storageVoiceMails, voiceMail)) {
              voiceMail.audio.listened = true;
            }
          });
      }
      setVoiceMailResp(voiceMailResp);
    },

    audios = {
      stop : function () {
        if (voiceMailResp) {
          angular.forEach(voiceMailResp.data, function(voiceMail) {
            if (voiceMail.audio.isReproducing()) {
              voiceMail.audio.stop();
            }
          });
        }
      }
    },

    deleteAll = function (voiceMails) {
      var deferred = $q.defer(),
          voicemailsIds = [],
          userInfo = UserSvc.getUserInfo(),
          promisesFromRemoveFileFromSystemFileAndDataBase = [];
      var userToken = UserSvc.getUserToken();

      angular.forEach(voiceMails, function (voiceMail) {
        //voicemailsIds.push(voiceMail.media_id);
        promisesFromRemoveFileFromSystemFileAndDataBase.push(removeFileFromSystemFileAndDataBase(voiceMail));
      });

      //var http = {
      //  'method' : 'DELETE',
      //  'url' : host + '/voicemail/allmedia/' + userInfo.username,
      //  'headers' : {
      //    'Authorization': 'Bearer ' + userToken.value,
      //    'Content-Type': 'application/json'
      //  },
      //  'data':{
      //      media: voicemailsIds
      //  }
      //}
      //
      //return $q.all([$q.all(promisesFromRemoveFileFromSystemFileAndDataBase), $http(http)]);
      $q.all([$q.all(promisesFromRemoveFileFromSystemFileAndDataBase)])
        .then(function () {
          deferred.resolve();
        }, function (err) {
          if (err.message == 'NOT_FOUND_ERR') {
            return deferred.resolve();
          }

          deferred.reject();
        });

      return deferred.promise;
    },

    initVoicemails = function () {
      // load the voicemails the first time without displayname
      get().then(function (voiceMailResp) {
        prepareVoiceMailList(voiceMailResp);
        setVoiceMailResp(voiceMailResp);

        // update de display name when contacts loads
        if (! ContactsSvc.isInitalized()) {
          $rootScope.$on('contacts:doneLoading', function () {
            for (var i in voiceMailResp.data) {
              var voiceMail = voiceMailResp.data[i];
              voiceMail.displayName = ContactsSvc.match_member_name(voiceMail);
            }
          });
        }
      }, function (err) {
        console.error('DEBUG: ERR: Loading voice mails', err);
      });


    }

    initVoicemails();

  return {
    get : get,
    downloadVoiceMail: downloadVoiceMail,
    saveFileSystemVoiceMail : saveFileSystemVoiceMail,
    getIntSeconds : getIntSeconds,
    storage : storage,
    deleteVoiceMail : deleteVoiceMail,
    getVoiceMailIndex : getVoiceMailIndex,
    getVoiceMailResp : getVoiceMailResp,
    setVoiceMailResp : setVoiceMailResp,
    getDateFromTimestamp : getDateFromTimestamp,
    prepareVoiceMailList : prepareVoiceMailList,
    audios : audios,
    deleteAll : deleteAll,
    initVoicemails : initVoicemails
  }

}
