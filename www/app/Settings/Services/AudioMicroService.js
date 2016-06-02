angular.module('callpal.settings')

.factory('AudioMicroSvc', ['$localstorage', '$http', 'UserSvc', 'ConfigurationSvc', function ($localstorage, $http, UserSvc, ConfigurationSvc) {

  // Getting endpoint address
  var host = ConfigurationSvc.base_endpoint();

  var AudioMicroSvcMethods = {

    /**
     * @function: getSettingsAudio
     * @description: Get the Audio settings
    **/
    getSettingsAudio: function() {
      settingsAudio = $localstorage.getObject('userInfo').settings;
      speakerVolume = settingsAudio.speakerVolume;
      micVolume = settingsAudio.micVolume;
      return {
        speakerVolume: AudioMicroSvcMethods.getSpeakerVolume(),
        micVolume: AudioMicroSvcMethods.getMicrophoneVolume()
      };
    },


    /**
     * @function: getSpeakerVolume
     * @description: Get the Speaker settings
    **/
    getSpeakerVolume: function() {
      settingsAudio = $localstorage.getObject('userInfo').settings;
      speakerVolume = settingsAudio.speakerVolume;
      if (speakerVolume != undefined && speakerVolume != null && speakerVolume != "")
        return (parseInt(speakerVolume) * 0.01).toFixed(1);
      return 0.5; // default value
    },


    /**
     * @function: getSettingsMicrophone
     * @description: Get the Microphone settings
    **/
    getMicrophoneVolume: function() {
      settingsAudio = $localstorage.getObject('userInfo').settings;
      micVolume = settingsAudio.micVolume;
      if (micVolume != undefined && micVolume != null && micVolume != "")
        return (parseInt(micVolume) * 0.01).toFixed(1);
      return 0.5; // default value
    },


    /**
     * @function: changeSettingsAudio
     * @description: persist the audio settings
    **/
    changeSettingsAudio: function(settingsAudio, callback) {
      var userToken = UserSvc.getUserToken();
      var userInfo = UserSvc.getUserInfo();
      var req = {
        method: 'PUT',
        url: (host + '/users/settings/audio/'+userInfo.username),
        headers: {
          'Authorization': 'Bearer ' + userToken.value
        },
        data: {
          speakerVolume: settingsAudio.speakerVolume,
          micVolume: settingsAudio.micVolume
        }
      };

      $http(req).then(function(resp) {
        //update local storage
        userInfo.settings.speakerVolume = settingsAudio.speakerVolume;
        userInfo.settings.micVolume = settingsAudio.micVolume;
        $localstorage.setObject('userInfo', userInfo);
        return callback(resp.data);
      }, function(err) {
        return callback(err.data);
      });
    },

  };

  return AudioMicroSvcMethods;

}]);
