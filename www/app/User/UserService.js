'use strict';

angular
  .module('callpal.user')
  .factory('UserSvc', UserSvc)
  .factory('UserRemoteSvc', UserRemoteSvc);

function UserSvc($localstorage, $injector, $q, CountryCodesSvc) {
  

  // Declarations + Assignment from LocalStorage ---- old info persist
  // var userInfo = $localstorage.getObject('userInfo');
  // var userToken = $localstorage.getObject('userToken');
  // var userClient = $localstorage.getObject('userClient');
  // var userRefreshToken = $localstorage.get('userRefreshToken');

  return {


    regen_device_sip_extension: function () {

      var self = this;

      var UserSvc = $injector.get('UserSvc');
      var $http = $injector.get('$http');

      var dfd = $q.defer();

      var host = window.config.api.host,
          userInfo = UserSvc.getUserInfo(),
          userToken = UserSvc.getUserToken();

      var req = {
        method: 'PUT',
        url: (host + '/sip/' + userInfo.username),
        headers: {
          'Authorization': 'Bearer ' + userToken.value
        }
      };

      $http(req).then(function (response) {
        if (response && response.data) {
          log('DEBUG: INF : regen_device_sip_extension', response);
          var device_username = response.data.device_username;
          if (device_username) {
            userInfo.device_username = device_username;
            UserSvc.setUserInfo(userInfo);   // modify userinfo ot storage the device_username
            dfd.resolve(response.data);
          } else
            dfd.reject();
        }
        else {
          dfd.reject();
        }
      }, function (error) {
        console.log('DEBUG: ERR : regen_device_sip_extension', error);
        dfd.reject('Error getting device_extension');
      });

      return dfd.promise;

    },
    
    
    
    


    user_need_login: function() {

      var Utils = $injector.get('Utils');

      var userInfo = $localstorage.getObject('userInfo');
      var userToken = this.getUserToken();
      var userClient = this.getUserClient();
      var userRefreshToken = this.getUserRefreshToken();

      var evaluate = (
          userInfo.username == undefined || userInfo.username == "" ||
          Utils.isEmptyObject(userInfo) || !userInfo.phoneVerified ||
          userToken == undefined || Utils.isEmptyObject(userToken) ||
          userClient == undefined || Utils.isEmptyObject(userClient) ||
          userRefreshToken == undefined || Utils.isEmptyObject(userRefreshToken)
      );

      //console.log('evaluate is', evaluate);

      return evaluate;

    },




    /**
     * @function: @getUserInfo
     * @description: Getting the user information in the localStorage
     * @return: json object with the user information { allowedDevices: Array[45], avatar, country, created: 1442259583148, dob, ... }
     * @return: { gender, language, name, phone, settings, speedDial: Array[0], username ... }
     **/
    getUserInfo: function () {
      var userInfo = $localstorage.getObject('userInfo');
      if(userInfo.country){
            userInfo.countryName = CountryCodesSvc.getCountryByAbbv(userInfo.country).caption;
        }
      return userInfo;
    },


    setUserInfo: function (userInfo) {
      $localstorage.setObject('userInfo', userInfo);
    },


    getUserToken: function () {
      var userToken = $localstorage.getObject('userToken');
      //console.log('The token is ', JSON.stringify(userToken));
      return userToken;
    },


    getUserClient: function () {
      var userClient = $localstorage.getObject('userClient');
      return userClient;
    },


    getUserRefreshToken: function () {
      var userRefreshToken = $localstorage.get('userRefreshToken');
      return userRefreshToken;
    },


    persistUserData: function (user) {
      var temp_user = user.data.user;
      delete temp_user.password; // remove the password
      delete temp_user.confirm_password; // remove the password
      $localstorage.setObject('userInfo', temp_user); // Save the user info
      $localstorage.setObject('userClient', user.data.client);
      user.data.token.created = Date.now(); // create the information for the userToken and the RefreshToken
      $localstorage.setObject('userToken', user.data.token);
      $localstorage.set('userRefreshToken', user.data.refreshtoken);
    },


    save_user_after_login: function(data_login) {

      console.log('data _ login ', data_login);

      $localstorage.setObject('userInfo', data_login.user); // Save the user info
      $localstorage.setObject('userClient', data_login.client);
      var token = data_login.token;
      token.created = Date.now();
      $localstorage.setObject('userToken', token);
      $localstorage.set('userRefreshToken', data_login.refreshtoken);

    },

    setPhoneVerified: function () {
      var userInfo = this.getUserInfo();
      delete userInfo.verifyPhonePin;
      userInfo.phoneVerified = 1;
      $localstorage.setObject('userInfo', userInfo);
    },


    is_phone_pin_pending: function () {
      var userInfo = this.getUserInfo();
      if (userInfo != undefined)
        if (userInfo.phoneVerified == 0) return true;
      return false;
    },


    // Verify if the user account is active
    is_account_active: function () {
      var userInfo = this.getUserInfo();
      if (userInfo != undefined)
        if (userInfo.phoneVerified == 1) return true;
      return false;
    },


    get_phone_pin_pending: function () {
      var userInfo = this.getUserInfo();
      if (userInfo != undefined) {
        return {
          "phone": userInfo.phone,
          "username": userInfo.username,
          "country": userInfo.country,
          "phone_prefix": userInfo.phone_prefix
        }
      }
      return null;
    },

    //---------------------------------------------------------
    // Attempts

    /**
     * @function: @attempts
     * @description:
     * @return:
     **/
    attempts: function () {
      var value = $localstorage.getObject('attempts').value;
      var count = parseInt(value);
      if (!isNaN(count)) {
        console.log('Count count', count);
        return count;
      }
      return 1;
    },


    /**
     * @function: @attempts_increment
     * @description: Increment the count of the attempts
     * @return:
     **/
    attempts_increment: function () {
      var value = $localstorage.getObject('attempts').value;
      var count = parseInt(value);
      if (!isNaN(count)) {
        value += 1;
        $localstorage.setObject('attempts', {value: value});
      }
      else
        $localstorage.setObject('attempts', {value: 1});
    },

    setUserProfilePhoto: function(photoUrl){
        var user = this.getUserInfo();
            user.avatar = photoUrl;
        this.setUserInfo(user);
    },

    getSelectedBackground: function(){
        var userInfo = $localstorage.getObject('userInfo');
        return userInfo.settings.background || 'default-green';
    },
    
    setUserData: function(user){
        $localstorage.setObject('userInfo', user);
    }

  };


}

function UserRemoteSvc($q, $http, UserSvc) {

  var host = window.config.api.host;

    return {

      getUserByExtension: function (uid) {

        var self = this;

        var deferred = $q.defer();
        var userToken = UserSvc.getUserToken();

        var req = {
          method: 'GET',
          url: (host + '/users/get_basic/' + uid),
          headers: {
            'Authorization': 'Bearer ' + userToken.value
          }
        };

        $http(req).then(function (response) {
          log('DEBUG: INF : getUserByHash', response);
          deferred.resolve(response.data[0])
        }, function (error) {
          log('DEBUG: ERR : getUserByHash', error);
          deferred.reject('Error getting the remote user.');
        });

        return deferred.promise;

      },

        setUserProfilePhoto: function(canvas){

            var deferred = $q.defer(),
                userToken = UserSvc.getUserToken(),
                blob = window.dataURLtoBlob && window.dataURLtoBlob(canvas.toDataURL("image/jpg")),
                formData = new FormData();
        
            formData.append('photo', blob);

            $http.post(host + '/users/profile_photo', formData, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined,
                    'Authorization': 'Bearer ' + userToken.value
                }
            })
            .then(function (response) {
                if(response.data.success){
                   deferred.resolve(response.data.avatar);
                }else{
                    deferred.reject('error');
                }
            }, function (error) {
                return deferred.reject('Error while trying to update your profile picture, please try again later');
            });

            return deferred.promise;
        }
    };

}
