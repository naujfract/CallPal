'use strict';

angular
  .module('callpal.voicemail')
  .factory('AudioRecordService', ['$q', '$cordovaFile', '$rootScope', '$ionicPopup', '$interval', AudioRecordService]);

function AudioRecordService($q, $cordovaFile, $rootScope, $ionicPopup, $interval) {
    var scope = $rootScope.$new();
    scope.count = 0;

    document.addEventListener('deviceready', function () {
      scope.path = cordova.file.externalApplicationStorageDirectory + 'voice_mail/';
    });

    var mediaRec = {
      deferred : null,
      media : {
        object : null,
        fileName : null,

        startRecording : function () {
          mediaRec.media.object = new Media(scope.path + mediaRec.media.fileName,
            // success callback
            function (suc) {
              //mediaRec.deferred.resolve(suc);
            },
            // error callback
            function (err) {
              mediaRec.deferred.reject(err);
            }
          );
          // Record audio
          mediaRec.media.object.startRecord();
        },
        stopRecording : function () {
          var deferred = $q.defer();

          mediaRec.media.object.stopRecord();
          mediaRec.media.sendVoiceMail()
            .then(function(suc) {
              mediaRec.media.deleteFile(scope.path, mediaRec.media.fileName)
                .then(function (suc) {
                  deferred.resolve(suc);
                }, function (err) {
                  deferred.reject(err);
                })
            }, function(err) {
              deferred.reject(err);
            });

          return deferred.promise;
        },
        cancelRecording : function () {
          var deferred = $q.defer();

          mediaRec.media.object.stopRecord();
          mediaRec.media.deleteFile(scope.path, mediaRec.media.fileName)
            .then(function(suc) {
              deferred.resolve(suc);
            }, function(err) {
              deferred.reject(err);
            });

          return deferred.promise;
        },
        deleteFile : function (path, fileName) {
          var deferred = $q.defer();

          $cordovaFile.removeFile(path, fileName)
            .then(function (suc) {
              deferred.resolve(suc);
            }, function (err) {
              deferred.reject(err);
            })

          return deferred.promise;
        },
        sendVoiceMail : function () {
          var deferred = $q.defer();

          deferred.resolve();
          //deferred.reject(err);

          return deferred.promise;
        }
      },
      popup : {
        object : null,
        open : function () {
          mediaRec.popup.object = $ionicPopup.show({
            templateUrl: 'app/VoiceMail/Templates/VoiceMailPopupRecording.html',
            subTitle: '',
            scope: scope,
            buttons: [{
              text: 'Cancel',
              onTap : function(e) {
                mediaRec.cancel();
              }
            }, {
              text : 'Submit',
              onTap : function(e) {
                mediaRec.close();
              }
            }]
          });
        },
        close : function () {
          mediaRec.popup.object.close();
        }
      },
      timer : {
        object : null,
        play : function () {
          mediaRec.timer.object = $interval(function () {
            scope.count ++;
          }, 1000);
        },
        stop : function () {
          $interval.cancel(mediaRec.timer.object);
        }
      },
      start : function (deferred) {
        mediaRec.deferred = deferred;

        scope.count = 0;
        mediaRec.media.fileName = 'voice_' + Math.round(new Date().getTime()/1000) + '.mp3';

        mediaRec.popup.open();
        mediaRec.timer.play();
        mediaRec.media.startRecording();

        return deferred.promise;
      },
      close : function () {
        mediaRec.timer.stop();
        mediaRec.popup.close();

        mediaRec.media.stopRecording()
          .then(function (suc) {
            mediaRec.deferred.resolve(suc);
          }, function (err) {
            mediaRec.deferred.reject(err);
          });
      },
      cancel : function () {
        mediaRec.timer.stop();
        mediaRec.popup.close();

        mediaRec.media.cancelRecording()
          .then(function (suc) {
            mediaRec.deferred.resolve(suc);
          }, function (err) {
            mediaRec.deferred.reject(err);
          });
      }
    };

    return mediaRec;
}
