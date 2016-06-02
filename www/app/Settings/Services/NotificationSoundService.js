angular.module('callpal.settings')

.factory('NotificationSoundSvc', ['$localstorage', '$http', 'UserSvc', 'ConfigurationSvc', function ($localstorage, $http, UserSvc, ConfigurationSvc) {

  // Getting endpoint address
  var host = ConfigurationSvc.base_endpoint();

  var NotificationSoundSvcMethods = {


    /**
     * @function: incomingCallAnimationEnabled
     * @description: Change the notifications settings
    **/
    getIncomingCallAnimation: function() {
      settings = $localstorage.getObject('userInfo').settings;
      return settings.incomingCallAnimation;
    },


    /**
     * @function: notifyNewVoicemailEnabled
     * @description: Change the notifications settings
    **/
    getNotifyNewVoicemail: function() {
      settings = $localstorage.getObject('userInfo').settings;
      return settings.notifyNewVoicemail;
    },


    /**
     * @function: changeSettingsNotification
     * @description: Change the notifications settings
    **/
    changeSettingsNotification: function(settingsNotification, callback) {

      console.log('settignsNotifications', settingsNotification);

      var userToken = UserSvc.getUserToken();
      var userInfo = UserSvc.getUserInfo();

      var req = {
        method: 'PUT',
        url: (host + '/users/settings/notification/' + userInfo.username),
        headers: {
          'Authorization': 'Bearer ' + userToken.value
        },
        data: {
          incomingCallAnimation: settingsNotification.incomingCallAnimation,
          notifyNewVoicemail: settingsNotification.notifyNewVoicemail
        }
      };

      $http(req).then(function(resp) {
        console.log('response ', resp);

        userInfo.settings.incomingCallAnimation = settingsNotification.incomingCallAnimation;
        userInfo.settings.notifyNewVoicemail = settingsNotification.notifyNewVoicemail;
        $localstorage.setObject('userInfo', userInfo);

        return callback(resp.data);
      }, function(err) {
        console.error('Error saving the settings notifications', err);
        return callback(err.data);
      });


    },


  };

  return NotificationSoundSvcMethods;

}]);
