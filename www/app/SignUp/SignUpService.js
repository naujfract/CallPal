'use strict';

angular
  .module('callpal.signup')
  .factory('SignUpSvc', SignUpSvc);

function SignUpSvc($http, $q,
                   $cordovaDevice,
                   UserSvc) {

  // Getting endpoint address
  var host = window.config.api.host;


  return {

    signup: function (signupData, callback) {

      var dfd = $q.defer();

      var params = {
        username: signupData.username,
        password: signupData.password,
        country: signupData.country_initials,
        phone_prefix: signupData.phone_prefix,
        phone: signupData.phone,
        //language: navigator.language,
        language: signupData.language,
        name: "",
        gender: "",
        dob: "",
        referral: signupData.referral,
        device: ionic.Platform.isWebView() ? $cordovaDevice.getDevice() : {
          available: true,
          cordova: "",
          manufacturer: "",
          model: "",
          platform: "",
          uuid: "callpal",
          version: ""
        }
      };

      $http.post(host + '/users', params).then(function (userObj) { // Register the user on the server
        console.log('DEBUG|INFO: post /users', userObj);
        if (userObj.data.success) {
          UserSvc.persistUserData(userObj);
          dfd.resolve(userObj);
        }
        else {
          dfd.resolve({ success: false, message: userObj.data.message });
        }
      }, function (err) {
        console.error('DEBUG|ERROR: post /users', err);
        console.error('Error creating user', err);
        dfd.reject(err.data);
      });

      return dfd.promise;
    }

  };

}
