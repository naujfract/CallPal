angular.module('callpal.settings').factory('RingTonesService', ['$localstorage', 'ionicToast',
    function ($localstorage, ionicToast) {

      function getContactIndex (contactUserName, ringTones) {
        for (var i in ringTones) {
          var ringTone = ringTones[i];
          if (ringTone.contactUserName == contactUserName) {
            return i;
          }
        }
        return false;
      }

      var RingTonesService = {
        'ringToneRoot' : 'web-assets/audio/ring-tones/',
        'setUserRingTone' : function (contactUserName, ringTonefileName) {
          if (contactUserName) {
            var ringTones = $localstorage.getObject('ringTones');
            // if the list is empty
            if (Object.getOwnPropertyNames(ringTones).length == 0) {
              ringTones = [];
              ringTones.push({'contactUserName' : contactUserName, 'ringTonefileName' : ringTonefileName});
            } else {
              // if the contact exist update it
              var index = getContactIndex(contactUserName, ringTones);
              if (index) {
                ringTones[index].ringTonefileName = ringTonefileName;
              } else {
                ringTones.push({'contactUserName' : contactUserName, 'ringTonefileName' : ringTonefileName});
              }
            }

            $localstorage.setObject('ringTones', ringTones);
          } else {
            $localstorage.set('ringTone', ringTonefileName);
          }

          ionicToast.show('Ring Tone changed!', 'bottom', false, window.config.timeDisplayingToasts);
        },
        'getUserRingTone' : function (contactUserName) {

          console.log('getUserRingTone', contactUserName);


          if (! contactUserName) {
            return $localstorage.get('ringTone') || RingTonesService.getRingTones()[0].fileName;
          } else {
            var ringTones = $localstorage.getObject('ringTones');
            // if the list is empty return default ring tone
            if (Object.getOwnPropertyNames(ringTones).length == 0) {
              return $localstorage.get('ringTone') || RingTonesService.getRingTones()[0].fileName;
            }

            var index = getContactIndex(contactUserName, ringTones);
            if (index) {
              return ringTones[index].ringTonefileName;
            } else {
              return $localstorage.get('ringTone') || RingTonesService.getRingTones()[0].fileName;
            }
          }
        },
        'getUserRingTonePath' : function (contactUserName) {
          return RingTonesService.ringToneRoot + RingTonesService.getUserRingTone(contactUserName);
        },
        'getRingTones' : function () {
          return [{
            'visualName': 'CallPal',
            'fileName': 'CallPall Theme MAIN THEME A Final_Ver.1.mp3',
          }, 
          // {
          //   'visualName': 'CallPal +',
          //   'fileName': 'CallPall Theme MAIN THEME B Final_Ver.1.mp3'
          // }, 
          // {
          //   'visualName': 'CallPal ++',
          //   'fileName': 'CallPall Theme MAIN THEME C Final_Ver.1.mp3',
          // }, 
          {
            'visualName': 'Funk',
            'fileName': 'CallPall Theme 70\'s Final_Ver.1.mp3',
          }, {
            'visualName': 'Africa',
            'fileName': 'CallPall Theme AFRICA Final_Ver.1.mp3',
          }, {
            'visualName': 'Brazil',
            'fileName': 'CallPall Theme BRAZIL Final_Ver.1.mp3'
          }, {
            'visualName': 'Far East',
            'fileName': 'CallPall Theme FAR EAST Final_Ver.1.mp3'
          }, {
            'visualName': 'Happy',
            'fileName': 'CallPall Theme HAPPY Final_Ver.1.mp3',
          }, {
            'visualName': 'India',
            'fileName': 'CallPall Theme INDIA Final_Ver.1.mp3'
          }, {
            'visualName': 'Metal',
            'fileName': 'CallPall Theme METAL Final_Ver.1.mp3'
          }, {
            'visualName': 'Middle East',
            'fileName': 'CallPall Theme MIDDLE EAST Final_Ver.1.mp3'
          }, {
            'visualName': 'Digital',
            'fileName': 'CallPall Theme RINGTONE Final_Ver.1.mp3'
          }, {
            'visualName': 'Russia',
            'fileName': 'CallPall Theme RUSSIA Final_Ver.1.mp3'
          }, {
            'visualName': 'Hip-Hop',
            'fileName': 'CallPall Theme URBAN Final_Ver.1.mp3'
          }];
        }
      }

      return RingTonesService;
  }]);
