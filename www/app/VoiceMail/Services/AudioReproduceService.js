'use strict';

angular
  .module('callpal.voicemail')
  .factory('AudioReproduceService', ['$interval', '$ionicLoading', AudioReproduceService]);

function AudioReproduceService($interval, $ionicLoading) {

  return {
    audio : function () {
      var audio = {
        paused: false,
        reproducing: false,
        listened: false,
        progress: 0,
        length: 0,
        media: {
          object: null,
          start: function (fileName) {
            if (ionic.Platform.isIOS()) {
              var iOSPlayOptions = {
                numberOfLoops: 2,
                playAudioWhenScreenIsLocked : false
              }
            }

            audio.media.object = new Media(fileName, null, null, audio.media.onStatusChange);

            if (ionic.Platform.isIOS()) {
              audio.media.play(iOSPlayOptions);
            } else if (ionic.Platform.isAndroid()) {
              audio.media.play();
            }
         },
          onStatusChange: function (status) {
            //console.log('ESTADO :',status);
            switch (status) {
              //case 1: starting(only samsung)
              case 2:
                $ionicLoading.hide();
                audio.listened = true;
                audio.reproducing = true;
                audio.timer.play();
                break;
              //case 3: pause
              case 4:
                audio.stop();
                break;
            }
          },
          stop: function () {
            audio.reproducing = false;
            audio.paused = false;
            audio.progress = 0;
            // if the file is stopped it does not need to be stopped(giving error in ios)
            audio.media.object.getCurrentPosition(function(pos) {
              if (pos != -1) {
                audio.media.object.stop();
              }
            });

          },
          play: function () {
            audio.paused = false;
            audio.reproducing = true;
            audio.media.object.play();
          },
          pause: function () {
            audio.paused = true;
            audio.media.object.pause();
          },
          move: function () {
            audio.media.object.seekTo(audio.progress * 1000);
          }
        },
        timer: {
          object: null,
          play: function () {
            audio.timer.paused = false;
            audio.timer.object = $interval(function () {
              if (audio.progress < parseInt(audio.length / 1000)) {
                audio.progress = parseInt(audio.progress) + 1;
              }
              else {
                audio.media.stop();
              }
            }, 1000);
          },
          stop: function () {
            $interval.cancel(audio.timer.object);
          },
          pause: function () {
            $interval.cancel(audio.timer.object);
            audio.timer.paused = true;
          },
          paused: false
        },
        start: function (fileName, voiceMailLength) {
          audio.length = voiceMailLength;
          audio.media.start(fileName);
        },
        stop: function () {
          audio.media.stop();
          audio.timer.stop();
        },
        pause: function () {
          audio.media.pause();
          audio.timer.pause();
        },
        play: function () {
          audio.media.play();
        },
        isReproducing: function () {
          return audio.reproducing;
        }
      }

      return audio;
    }

  }
}
