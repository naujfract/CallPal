'use strict';

angular
  .module('callpal.sharing')
  .factory('SharingService', SharingService)
;

function SharingService($http, $cordovaDevice) {

  var host = window.config.api.host; // Getting endpoint address

  return {

    shareCameraPhone: function () {
      var params = {
        username: loginCredentials.username,
        password: loginCredentials.password,
        pin: loginCredentials.pin,
        //verifyPhonePin: loginCredentials.verifyPhonePin,
        signUpAction: "callpal",
        device: ionic.Platform.isWebView() ? $cordovaDevice.getDevice() : {
          available: true,
        }
      };
      $http.post(host + '/users/login', params).then(function (resp) {
        return callback(resp.data);
      }, function (err) {
        console.error('Server error trying to signIn: ', err);
        return callback({success: false, message: err, raw_message: err});
      });
    },

  };

}
