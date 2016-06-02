'use strict';

angular
  .module('callpal.settings')
  .factory('SettingsSvc', SettingsSvc);

SettingsSvc.$inject = ['$q', '$localstorage', '$http', 'UserSvc', 'ConfigurationSvc', '$translate'];

function SettingsSvc($q, $localstorage, $http, UserSvc, ConfigurationSvc, $translate) {

  // Getting endpoint address
  var host = ConfigurationSvc.base_endpoint();

  var callpalUser = {};
  callpalUser = UserSvc.getUserInfo();

  return {
    getSettings: function(type) {
      var dfd = $q.defer();

      setTimeout(function() {

        // Get Settings
        var userInfo = UserSvc.getUserInfo();
        var response = {};

        if (type == 'Audio') {
          response.speakerVolume = userInfo.settings.speakerVolume;
          response.micVolume = userInfo.settings.micVolume;
        }

        if (type == 'Background') {
          response.background = userInfo.settings.background;
        }

        dfd.resolve({
          Settings: response
        });
      }, 500);

      return dfd.promise;
    },

    callpalUser: callpalUser,

    updateCallpalUser: function() {
      callpalUser = UserSvc.getUserInfo();
    },

    /**
     * @function: @changeUserProfile
     * @description: Persist the user profile in the localStorage and in the server
     **/
    changeUserProfile: function(userData, callback) {
      var userInfo = UserSvc.getUserInfo();
      var userToken = UserSvc.getUserToken();

      // Request object
      var req = {
        method: 'PUT',
        url: (host + '/users/' + userInfo.username),
        headers: {
          'Authorization': "Bearer " + userToken.value,
          'Content-Type': "application/json"
        },
        data: userData
      };
      var setReq = $http(req);
      return setReq;
    },

    persistLocalProfileData: function(userData) {
      var userInfo = UserSvc.getUserInfo();

      if (userData.dob != undefined && userData.dob != "")
        userInfo.dob = userData.dob;
      if (userData.name != undefined && userData.name != "")
        userInfo.name = userData.name;
      if (userData.gender != undefined && userData.gender != "")
        userInfo.gender = userData.gender;

      $localstorage.setObject('userInfo', userInfo);
      callpalUser = userInfo;
    },


    getProfileGender: function() {
      var userInfo = UserSvc.getUserInfo();
      if (userInfo != undefined) {
        var gender = userInfo.gender;
        if (gender != undefined && gender != "" && gender != null) {
          return gender;
        }
      }
      return null;
    },

    setProfileGender: function(gender) {
      var userInfo = UserSvc.getUserInfo();
      if (userInfo != undefined) {
        userInfo.gender = gender;
        return gender;
      }
      return null;
    },


    getProfileBirthday: function() {
      var userInfo = UserSvc.getUserInfo();
      if (userInfo != undefined) {
        var dob = userInfo.dob;
        if (dob != undefined && dob != "" && dob != null) {
          return dob;
        }
      }
      return null;
    },

    setProfileBirthday: function(date) {
      var userInfo = UserSvc.getUserInfo();
      if (userInfo != undefined) {
        userInfo.dob = date;
        return userInfo.dob;
      }
      return null;
    },


    /**
     * @function: @changePassword
     * @description: Change the user password
     **/
    changePassword: function(changePasswordData, callback) {

      var dfd = $q.defer();
      var userToken = UserSvc.getUserToken();

      if (userToken == undefined || userToken == '')
        dfd.reject({success: false, message: $translate.instant('w_settings.options.account_info.password.not_authorized')});
        
      if(!changePasswordData.old_password || changePasswordData.old_password.length === 0 || 
         !changePasswordData.password || changePasswordData.password.length === 0 ||
         !changePasswordData.confirm_password || changePasswordData.confirm_password.length === 0){
          dfd.reject({success: false, message: $translate.instant('w_settings.options.account_info.password.empty_fields')});
      }
      
      if(changePasswordData.password !== changePasswordData.confirm_password){
          dfd.reject({success: false, message: $translate.instant('w_settings.options.account_info.password.new_password_mismatch')});
      }
 
      var req = {
        method: 'POST',
        url: (host + '/users/changepassword'),
        headers: { 'Authorization': 'Bearer '+ userToken.value },
        data: {
          old_password: changePasswordData.old_password,
          password: changePasswordData.password,
          confirm_password: changePasswordData.confirm_password
        }
      };

      $http(req).then(function(resp) {
        dfd.resolve(resp.data);
      }, function(err) {
        console.error('Error changing password', err);
        dfd.reject(err);
      });


      return dfd.promise;
    },

    changeSettingsBackground: function(background_selected, callback) {

      var userToken = UserSvc.getUserToken();
      var userInfo = UserSvc.getUserInfo();

      // Save on the localStorage
      userInfo.settings.background = background_selected;
      $localstorage.setObject('userInfo', userInfo);

      // Sync the background settings with the server
      var req = {
        method: 'PUT',
        url: (host + '/users/settings/background/'+userInfo.username),
        headers: {
          'Authorization': 'Bearer ' + userToken.value
        },
        data: { background: background_selected }
      };

      return $http(req);
    }
  };
}
