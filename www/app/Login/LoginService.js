'use strict';

angular
  .module('callpal.login')
  .factory('LoginSvc', LoginSvc)
  .factory('FacebookSvc', FacebookSvc)
  .factory('GoogleSvc', GoogleSvc)
  .factory('PhoneRegistrationSvc', PhoneRegistrationSvc)
  .factory('PhoneVerificationSvc', PhoneVerificationSvc)
;



function LoginSvc($q,
                  $http,
                  Utils) {



  var host = window.config.api.host; // Getting endpoint address

  return {


    login: function (loginCredentials) {

      var dfd = $q.defer();

      var device = Utils.device();
      if (device.uuid == "" || device.uuid == undefined)
        device.uuid = "callpal";

      var params = {
        //verifyPhonePin: loginCredentials.verifyPhonePin,
        username: loginCredentials.username,
        password: loginCredentials.password,
        pin: loginCredentials.pin,
        signUpAction: "callpal",
        device: device
      };

      $http.post(host + '/users/login', params).then(function (resp) {
        console.log('resp success from server', resp);
        dfd.resolve(resp.data);
      }, function (err) {
        console.log('resp error', err);
        dfd.reject(err);
      });

      return dfd.promise;

    },





    forgotPassword: function (email, callback) {

      var req = {
        method: 'POST',
        url: (host + '/users/recoverpassword'),
        data: {email: email}
      };
      $http(req).then(function (result) {
        return callback(result.data);
      }, function (err) {
        console.error('Error', err);
        return callback(err.data);
      });

    }

  };

}




function FacebookSvc($q,
                     $http,
                     $cordovaOauth,
                     $cordovaDevice) {

  var host = window.config.api.host; // Endpoint|Backend address
  var appId = "328296397294264";     // Facebook appId to perform requests

  return {

    loginWithFacebook: function () {
      /*openFB.init({appId: appId, tokenStore: $localstorage});
      return ngFB.login({scope: 'public_profile,email'});*/

      return $cordovaOauth.facebook(appId,
            ["email", "public_profile"]);
    },




    getFacebookProfileInfo: function (access_token) {
      var dfd = $q.defer();

      $http.get("https://graph.facebook.com/v2.2/me",
                   {params: { access_token: access_token,
                            fields: "id,name,email,gender,picture",
                            format: "json" }})
      .then(function(facebook_profile) {
        dfd.resolve(facebook_profile);
      }, function(err){
        dfd.resolve({success: false, message: 'Network error.', raw_message: err});
      });

      return dfd.promise;
    },




    /**
     * @function: @signInUp
     * @description: Create the user in the backend or signin the user
     * @description: This method create the user using the social network data (Google or Facebook)
     * @description: Or authenticate the user if the user is already registered in the backend
     * @param: facebook_profile (the social network user facebook profile data)
     **/


    signInUp: function (facebook_profile) {

      console.log("DEBUG:INFO: Running signInUp with Facebook_profile", facebook_profile);

      if (facebook_profile.birthday !== undefined)
        facebook_profile.birthday = Date.parse(facebook_profile.birthday);
      else
        facebook_profile.birthday = "";

      var request_data = {
        username: facebook_profile.id,
        email: facebook_profile.email,
        password: facebook_profile.id,
        name: facebook_profile.name,
        gender: facebook_profile.gender,
        age_range: facebook_profile.age_range,
        dob: facebook_profile.birthday,
        language: facebook_profile.language,
        signUpAction: "facebook",
        device: ionic.Platform.isWebView() ? $cordovaDevice.getDevice() : {
          available: true,
          cordova: "",
          manufacturer: "",
          model: "",
          platform: "",
          uuid: "",
          version: ""
        }
      };

      console.log("DEBUG:INFO: Request data before before /users/sninup Facebook", request_data);

      return $http({
        method: 'POST',
        url: (host + '/users/sninup/'),
        data: request_data
      });
    }

  };
}



function GoogleSvc($http,
                   $rootScope,
                   UserSvc,
                   $cordovaDevice,
                   SettingsLanguageService,
                   $ionicLoading) {


  var host = window.config.api.host; // Endpoint|Backend address

  return {


    loginWithGoogle: function (callback) {

      var googleEndpoint = 'https://accounts.google.com/o/oauth2/auth';
      var googleClientId = '515280262168-gbvqh3nm0sbpo06g7ksmqm28sr90m2vo.apps.googleusercontent.com';
      var googleClientSecret = 'E99effsAkBrc4uveOZT-4TDG';
      var googleRedirectUri = 'http://localhost/callback';
      var googleScope = 'https://www.googleapis.com/auth/plus.me https://www.googleapis.com/auth/userinfo.email&approval_prompt=force&response_type=code';

      var googleRequestToken = '';
      var googleAccessToken = '';

      $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

      var googleRequest = window.open(googleEndpoint + '?client_id=' +
                            googleClientId + '&redirect_uri=' +
                            googleRedirectUri +'&scope=' +
                            googleScope, '_blank', 'location=no');

      // TODO: only hide loading if canceled
      googleRequest.addEventListener('exit', function(event){
        console.log('exit inappbrowser fired');
        if ($rootScope.hideLoginLoading)
          $ionicLoading.hide();
      });

      googleRequest.addEventListener('loadstart', function(event) {
        $rootScope.hideLoginLoading = true;

        if((event.url).startsWith("http://localhost/callback")) {
          $rootScope.hideLoginLoading = false;
          googleRequestToken = (event.url).split('code=')[1];

              $http({method: "POST", url: "https://accounts.google.com/o/oauth2/token",
                 data: "client_id=" +
                 googleClientId + "&client_secret=" +
                 googleClientSecret +
                 "&redirect_uri=http://localhost/callback" +
                 "&grant_type=authorization_code" +
                 "&code=" + googleRequestToken })

            .success(function(data) {
                googleAccessToken = data.access_token;

                  $http.get('https://www.googleapis.com/plus/v1/people/me?access_token=' + googleAccessToken)
                  .success(function(info){
                      console.log('google Data', info);

                      var birthday = "";
                      if (info.birthday !== undefined)
                        birthday = Date.parse(info.birthday);

                      //email logic
                      var primaryEmail = "";
                      if (info.email != undefined)
                        primaryEmail = info.email;

                      //email logic
                      var ageRangeMin = "";
                      if (info.ageRangeMin != undefined)
                        ageRangeMin = info.ageRangeMin;

                      if (info.emails != undefined)
                        for (var i = 0; i < info.emails.length; i++)
                          if (info.emails[i].type === 'account') primaryEmail = info.emails[i].value;

                      //rootscope to use in controller
                      info.email = primaryEmail;

                      console.log('calling SettingsLanguageService');

                      SettingsLanguageService.get_lang().then(function(language){

                          info.language = language;
                          $rootScope.userGoogle = info;

                          console.log('email', primaryEmail);

                          // send to backend
                          var params = {
                            username: info.id,
                            email: primaryEmail,
                            password: info.id,
                            name: info.displayName,
                            gender: info.gender,
                            dob: birthday,
                            age_range: {min: ageRangeMin},
                            country: "",
                            phone: "",
                            language: language,
                            signUpAction: "google",
                            device: ionic.Platform.isWebView() ? $cordovaDevice.getDevice() : {
                              available: true,
                              cordova: "",
                              manufacturer: "",
                              model: "",
                              platform: "",
                              uuid: "",
                              version: ""
                            }
                          };
                          $http.defaults.headers.post['Content-Type'] = 'application/json';
                          $http.post(host + '/users/sninup', params).then(function (promise_user) {
                            console.log('promise google user', promise_user);
                            if (promise_user.data.success) {
                              UserSvc.persistUserData(promise_user);
                            }
                            promise_user.data.google_data = info;
                            return callback(promise_user.data);
                          }, function (err) {
                            console.error('Error google sninup', err);
                          });
                        }, function (err) {
                          console.log('err');
                        });
                    })
                    .error(function(err){
                        return callback({success: false, message: err});
                    });
            })
            .error(function(data, status) {
                return callback({success: false, message: data});
            });
          googleRequest.close();
        }
      });


      /*window.plugins.googleplus.isAvailable(function (available) {

        if (!available || available == null || available == undefined)
          return callback({success: false, message: "Google service is not available in your phone"});

        if (available) {
          console.log('Google is available');
          window.plugins.googleplus.trySilentLogin({
            'scopes': 'email profile',
            //'webApiKey': 'AIzaSyBJGdsGXkKB02dc4kOVYwsikssP9KxDrjc',
            //'offline': true,
            //'scopes': '', // optional space-separated list of scopes, the default is sufficient for login and basic profile info
            // 'offline': true, // optional and required for Android only - if set to true the plugin will also return the OAuth access token, that can be used to sign in to some third party services that don't accept a Cross-client identity token (ex. Firebase)
            //'webApiKey': 'api of web app', // optional API key of your Web application from Credentials settings of your project - if you set it the returned idToken will allow sign in to services like Azure Mobile Services
            // there is no API key for Android; you app is wired to the Google+ API by listing your package name in the google dev console and signing your apk (which you have done in chapter 4)
          }, function (info) {
            console.log('Google info', info);
            var birthday = "";
            if (info.birthday !== undefined)
              birthday = Date.parse(info.birthday);

            //email logic
            var primaryEmail = "";
            if (info.email != undefined)
              primaryEmail = info.email;

            if (info.emails != undefined)
              for (var i = 0; i < info.emails.length; i++)
                if (info.emails[i].type === 'account') primaryEmail = info.emails[i].value;

            //rootscope to use in controller
            info.email = primaryEmail;

            $rootScope.userGoogle = info;

            // send to backend
            var params = {
              username: primaryEmail,
              password: info.userId,
              name: info.displayName,
              gender: info.gender,
              dob: birthday,
              age_range: {min: info.ageRangeMin},
              country: "",
              phone: "",
              language: navigator.language,
              signUpAction: "google",
              device: ionic.Platform.isWebView() ? $cordovaDevice.getDevice() : {
                available: true,
                cordova: "",
                manufacturer: "",
                model: "",
                platform: "",
                uuid: "",
                version: ""
              }
            };

            $http.post(host + '/users/sninup', params).then(function (promise_user) {
              console.log('promise google user', promise_user);
              if (promise_user.data.success) {
                UserSvc.persistUserData(promise_user);
              }
              return callback(promise_user.data);
            }, function (err) {
              console.error('Error google sninup', err);
            });

          }, function (error) {
            console.error("error google plugin :: ", error);
            return callback({success: false, message: error})
          });
        }
      });*/
    }

  };

}




function PhoneRegistrationSvc($q,
                              $http,
                              $base64,
                              UserSvc,
                              $rootScope) {

  var host = window.config.api.host;

  return {

    /**
     * @function: @register_or_update_phone_social_networks
     * @description: Send the phone number and the country to the backend for activation
     * @param: signInUp data
     * @return:
     **/
    register_or_update_phone_social_networks: function (signupData) {
      var params = {
        username: signupData.username,
        password: signupData.password,
        country: signupData.country,
        phone_prefix: signupData.phone_prefix,
        phone: PhoneFormat.cleanPhone(signupData.phone)
      };

      console.log(params);

      var dfd = $q.defer();
      var userToken = UserSvc.getUserToken();
      var userInfo = UserSvc.getUserInfo();

      if (params.username == undefined && $rootScope.userFacebook) {
        params.username = userInfo.username;
        params.password = $rootScope.userFacebook.data.id;
      }

      if (userInfo != undefined && userToken != undefined) {
        var req = {
          method: 'PUT',
          url: (host + '/users/register_or_update_phone_social_networks/' + userInfo.username),
          headers: {'Authorization': 'Basic ' + $base64.encode(params.username + ':' + params.password)},
          data: params
        };

        if(!userInfo.country || (userInfo.country && userInfo.country.length === 0)){
            userInfo.country = signupData.country;
            UserSvc.setUserData(userInfo);
        }

        $http(req).then(function (response) {
          return dfd.resolve(response);
        }, function (error) {
          console.error('Error in SignupSvc trying to send the Phone PIN code, ', error);
          return dfd.reject([]);
        });
      }
      return dfd.promise;
    },


    /**
     * @function: @register_or_update_phone_regular_login
     * @description: Send the phone number and the country to the backend for activation
     * @param: signInUp data
     * @return:
     **/
    register_or_update_phone_regular_login: function (signupData) {
        
      var params = {
        username: signupData.username,
        password: signupData.password,
        country: signupData.country,
        phone_prefix: signupData.phone_prefix,
        phone: PhoneFormat.cleanPhone(signupData.phone),
      };

      var dfd = $q.defer();

      var req = {
        method: 'PUT',
        url: (host + '/users/register_or_update_phone_regular_login/' + signupData.username),
        headers: {'Authorization': 'Basic ' + btoa(params.username + ':' + params.password)},
        data: params
      };

      $http(req).then(function (response) {

        if (response.data.success)
          return dfd.resolve(response);
        else
          return dfd.reject(response);

      }, function (error) {
        console.error('Error in SignupSvc trying to send the Phone PIN code, ', error);
        return dfd.reject(error);
      });

      return dfd.promise;
    },


    /**
     * @function: @register_or_update_phone_regular_signup
     * @description: Send the phone number and the country to the backend for activation
     * @param: signupData
     **/
    register_or_update_phone_regular_signup: function (signupData) {
      var params = {
        username: signupData.username,
        password: signupData.password,
        country: signupData.country_initials,
        phone_prefix: signupData.phone_prefix,
        phone: PhoneFormat.cleanPhone(signupData.phone)
      };

      var dfd = $q.defer();
      var userToken = UserSvc.getUserToken();
      var userInfo = UserSvc.getUserInfo();

      if (userInfo != undefined && userToken != undefined) {
        var req = {
          method: 'PUT',
          url: (host + '/users/register_or_update_phone_regular_login/' + userInfo.username),
          headers: {'Authorization': 'Basic ' + btoa(params.username + ':' + params.password)},
          data: params
        };

        $http(req).then(function (response) {
          return dfd.resolve(response);
        }, function (error) {
          console.error('Error in SignupSvc trying to send the Phone PIN code, ', error);
          return dfd.reject([]);
        });
      }
      return dfd.promise;
    }

  };

}


function PhoneVerificationSvc($http,
                              $base64,
                              UserSvc,
                              ConfigurationSvc,
                              $rootScope) {

  var host = ConfigurationSvc.base_endpoint(); // Getting endpoint address

  return {




    //----------------------------------------------
    // SMS Pin verification
    //----------------------------------------------

    /**
     * @function: @verifySMSPinRegularLogin
     * @description: Verify the pin send through SMS to the user
     * @param: signinData
     * @return: http promise
     **/
    verifySMSPinRegularLogin: function (signinData) {
      var req = {
        method: 'PUT',
        url: (host + '/users/verify_sms_pin_regular_login/' + signinData.username),
        //headers: { 'Authorization': 'Bearer ' + userToken.value},
        headers: {'Authorization': 'Basic ' + btoa(signinData.username + ':' + signinData.password)},
        data: signinData
      };
      return $http(req);
    },





    /**
     * @function: @verifySMSPinSocialNetworks
     * @description: Verify the pin send through SMS to the user
     * @param: signinData
     * @return: http promise
     **/
    verifySMSPinSocialNetworks: function (signinData) {
      var userToken = UserSvc.getUserToken();
      var userInfo = UserSvc.getUserInfo();

      // hack to pass in facebook credentials
      if (signinData.username == undefined && $rootScope.userFacebook) {
        signinData.username = userInfo.username;
        signinData.password = $rootScope.userFacebook.data.id;
      }

      var req = {
        method: 'PUT',
        url: (host + '/users/verify_sms_pin_social_networks/' + userInfo.username),
        headers: {'Authorization': 'Basic ' + $base64.encode(signinData.username + ':' + signinData.password)},
        data: signinData
      };
      return $http(req);
    },





    /**
     * @function: @verifySMSPinRegularSignUp
     * @description: Verify the pin send through SMS to the user
     * @param: signupData
     * @return: http promise
     **/
    verifySMSPinRegularSignUp: function (signupData) {
      var userToken = UserSvc.getUserToken();
      var userInfo = UserSvc.getUserInfo();
      var req = {
        method: 'PUT',
        url: (host + '/users/verify_sms_pin_social_networks/' + userInfo.username),
        headers: {'Authorization': 'Basic ' + $base64.encode(signupData.username + ':' + signupData.password)},
        data: signupData
      };
      return $http(req);
    },





    //----------------------------------------------
    // Email pin verification
    //----------------------------------------------

    /**
     * @function: @verifyEmailPin
     * @description: Verify the pin send through SMS to the user
     * @param: signinData
     * @return: http promise
     **/
    verifyEmailPin: function (signinData) {
      //var userToken = UserSvc.getUserToken();
      //var userInfo = UserSvc.getUserInfo();
      var req = {
        method: 'PUT',
        url: (host + '/users/verify_email_pin/' + signinData.username),
        headers: {'Authorization': 'Basic ' + btoa(signinData.username + ':' + signinData.password)},
        data: signinData
      };
      return $http(req);
    }

  };




}
