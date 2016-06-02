"use strict";

angular
  .module('callpal.login')
  .controller('LoginCtrl', LoginCtrl)
  //.controller('FacebookCtrl', FacebookCtrl)
;


function LoginCtrl($scope,
                   $rootScope,
                   $ionicPopup,
                   $ionicLoading,
                   $ionicModal,
                   $localstorage,
                   UserSvc,
                   LoginSvc,
                   GoogleSvc,
                   FacebookSvc,
                   PhoneRegistrationSvc,
                   PhoneVerificationSvc,
                   CountryCodesSvc,
                   Utils,
                   $state,
                   $animate,
                   $q,
                   $timeout,
                   GroupSvc,
                   $ionicPlatform,
                   $cordovaSplashscreen,
                   SettingsLanguageService,
                   $translate) {


  $scope.flag = window.config.flags; // Flags egg-shape for the app

  // hide splashscreen if at login

  $scope.language = undefined;

  $ionicPlatform.ready(function(){
    if (window.cordova) {

        setTimeout(function(){
          $cordovaSplashscreen.hide();
        }, 1500);

        SettingsLanguageService.get_lang().then(function(language){
            $translate.use(language);
            $scope.language = language;
            $scope.usernameLabel = $translate.instant('w_login.username');
            $scope.passwordLabel = $translate.instant('w_login.password');
        });
    }
  });

  $rootScope.$on('$ionicView.enter', function() {

    if (window.cordova){
      setTimeout(function(){
        $cordovaSplashscreen.hide();
      }, 1000);
    }

  });

  // Country Codes Libs
  $scope.countries = CountryCodesSvc.getCountries();

  //--

  $scope.signupData = {
    'username': '',
    'password': '',
    'phone': '',
    'phone_prefix': '+1',
    'country': 'US',
    'pretty_country_dial': '+1 US',
    'sms_pin': ""
  };



  $scope.signinData = {
    "username": "",
    "password": "",
    "email_pin": "",
    "referral": ""
  };



  // Regular Login

  $scope.login = {

    is_valid_form: function() {

      var username = $scope.signinData.username;
      var password = $scope.signinData.password;
      if (username != undefined &&
          username != "" &&
          password != undefined &&
          password != "" &&
          Utils.is_valid_email(username) &&
          Utils.is_valid_password(password))
        return true;
      return false;
    },


    login: function() {

      var self =this;

      if (this.is_valid_form()) {

        showLoadingIndicator();
        $scope.signinData.username = $scope.signinData.username.toLowerCase();

        LoginSvc.login($scope.signinData).then(function(resolve) {

          hideLoadingIndicator();

          if (!resolve.success && resolve.message != undefined && resolve.message != "")
            showAlert("CallPal SignIn", resolve.message);

          if (resolve.phoneVerified == 1)
            $scope.email_pin_popup.show();

          if (resolve.phoneVerified == 0) {
              $scope.signupData.username = $scope.signinData.username;
              $scope.signupData.password = $scope.signinData.password;
              $scope.activate_phone_regular_login.show();
              self.restoreSignUpData(resolve);
          }

        }, function (reject) {
          hideLoadingIndicator();
          showAlert("CallPal " + $translate.instant('w_login.sign_in'), $translate.instant('w_login.login_error'));
        });
      }
      else {
        showAlert("CallPal", $translate.instant('w_login.no_input_warning'));
      }
    },

    restoreSignUpData: function (cb) { // cb => callback_data
      $scope.signupData.phone = cb.phone;
      $scope.signupData.phone_prefix = cb.phone_prefix;
      $scope.signupData.country = cb.country;
      if (cb.phone_prefix != undefined && cb.phone_prefix != "" &&
          cb.country != undefined && cb.country != "")
        $scope.signupData.pretty_country_dial = (cb.phone_prefix + " " + cb.country);
      else
        $scope.signupData.pretty_country_dial = $translate.instant('w_login.select_country');
    },

  };



  // Modal for the countries in the login (if the user have phoneVerified == 0)

  $scope.activate_phone_regular_login = {

    modal: null,


    init: function () {

      var self =this;
      var dfd = $q.defer();

      $ionicModal.fromTemplateUrl("./app/Login/Templates/LoginModalRegularLogin.html", {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (m) {
        dfd.resolve();
        self.modal = m;
      });

      return dfd.promise;
    },


    show: function() {
      var self =this;
      this.init().then(function() {
        self.modal.show();
      });
    },


    hide: function () {
      if (this.modal)
        this.modal.hide();
    },


    register_or_update_phone: function () { // Register/Update the phone when the user is signin with the regular login | This function is sending a SMS pin

      var phone_number = PhoneFormat.cleanPhone($scope.signupData.phone);
      if (Utils.validPhoneNumber(phone_number, $scope.signupData.phone_prefix)) {
        showLoadingIndicator();
        PhoneRegistrationSvc.register_or_update_phone_regular_login($scope.signupData).then(function (resp) {
          hideLoadingIndicator();
          var userInfo = UserSvc.getUserInfo();
          userInfo.phone = phone_number;
          $localstorage.setObject('userInfo', userInfo); // update local storage
          $scope.error_message_phone_pin_verification = $translate.instant('w_login.sms_confirmation', { phone_number: phone_number });
          $scope.sms_pin_regular_login.show();
        }, function (err) {
          hideLoadingIndicator();

          if (err.data.sms_err_code) {
            $scope.sms_error = $translate.instant('w_sms_errors.'+err.data.sms_err_code);
            $timeout(function() {
              var smsInput = angular.element(document.body.querySelector('.phone-number input'));

              $animate.addClass(smsInput, 'shake').then(function() {
                smsInput.removeClass('shake');
              });

            });
            return;
          } else
            showAlert($translate.instant('w_general_actions.network_error'));

          console.log('Error updating phone pin in SignupSvc', err);
        });
      }
      else
        showAlert($translate.instant('w_login.information_error'));
    },



  };



  // SMS Pin Verification for Regular Login

  $scope.sms_pin_regular_login = {

    signup: {},
    sms_pin_popup_regular_login: null,

    show: function () {

      var self =this;

      // PIN Popup
      this.sms_pin_popup_regular_login = $ionicPopup.show({
        template: '<b style="color: #2D5D36;">{{ error_message_phone_pin_verification || "" }}</b>' +
        '<input type="tel" ng-model="signupData.sms_pin">',
        title: $translate.instant('w_login.secure_pin'),
        subTitle: $translate.instant('w_login.secure_pin_detail'),
        scope: $scope,
        buttons: [
          {
            text: $translate.instant('w_general_actions.cancel'),
            onTap: function (e) {
            }
          },
          {
            text: '<b>' + $translate.instant('w_general_actions.verify') + '</b>',
            type: 'button-positive',
            onTap: function (e) {
              if (!$scope.signupData.sms_pin) {
                e.preventDefault(); // Do nothing
              } else {
                self.verify($scope.signupData);
                e.preventDefault();
              }
            }
          }
        ]
      });
    },


    hide: function () {
      this.sms_pin_popup_regular_login.close();
    },


    verify: function (signupData) {

      console.log('\n\n\nverify pin\n\n\n', signupData);

      var self = this;

      showLoadingIndicator();
      return PhoneVerificationSvc.verifySMSPinRegularLogin(signupData).then(function (callback) {

        console.log('\n\n\ncall back verify pin\n\n\n', callback);

        if (!callback.data.success)
          $scope.error_message_phone_pin_verification = callback.data.message;
        if (callback.data.success) {
          UserSvc.persistUserData(callback); // Save the user and the token information
          UserSvc.setPhoneVerified();      // the phone number was verified correctly with the PIN
          self.hide();
          $scope.activate_phone_regular_login.hide();
          SettingsLanguageService.init();
          $state.go('app.country');
        }
      }, function (promise_error) {
        console.error('There is an error', promise_error);
        $scope.error_message_phone_pin_verification = promise_error.data.message;
      }).finally(function(){
          hideLoadingIndicator();
      });
    }

  };



  // Email PIN Verification

  $scope.email_pin_popup = {

    email_pin_popup: null,

    show: function() {

      var self = this;
      this.email_pin_popup = $ionicPopup.show({
        template: '<div class="row"><span class="error-message">{{error_message_phone_pin_verification}}</span></div><input type="tel" ng-model="signinData.pin">',
        title: $translate.instant('w_login.secure_pin'),
        subTitle: $translate.instant('w_login.check_email'),
        scope: $scope,
        buttons: [
          {text: $translate.instant('w_general_actions.cancel')},
          {
            text: '<b>' + $translate.instant('w_login.login_btn') + '</b>',
            type: 'button-positive',
            onTap: function (e) {
              if (!$scope.signinData.pin) {
                e.preventDefault();
              } else {
                self.verify();
              }
            }
          }
        ]
      });
    },


    hide: function () {
      this.email_pin_popup.close();
    },


    verify: function () {

      var self = this;

      showLoadingIndicator();
      return PhoneVerificationSvc.verifyEmailPin($scope.signinData).then(function (callback) {

        if (!callback.data.success){
          //$scope.error_message_phone_pin_verification = callback.data.message;
          $scope.error_message_phone_pin_verification = $translate.instant('w_login.pin_error');
          self.show();
        }
        if (callback.data.success) {
          UserSvc.persistUserData(callback); // Save the user data
          // UserSvc.apply_settings();       // TODO Apply the settings for this user
          UserSvc.setPhoneVerified();        // The phone number was verified correctly with the PIN
                   // Go to the app :)
          SettingsLanguageService.init();
          GroupSvc.downloadRemoteGroupCalls().then(function (success) {
              console.log('DEBUG: SUCC downloading groups', success);
          }, function (err) {
              self.hide();
              $state.go('app.country');
              console.log('DEBUG: ERR downloading groups', err);
          }).finally(function(){
              self.hide();
              $state.go('app.country');
              hideLoadingIndicator();
          });
        }
      }, function (promise_error) {
        hideLoadingIndicator();
        console.error('There is an error', promise_error);
        $scope.error_message_phone_pin_verification = promise_error.data.message;
      });
    }

  };



  // Select the country

  $scope.list_countries = {

    popup: null,

    show: function () {
      this.popup = $ionicPopup.show({
        templateUrl: 'app/Login/Templates/LoginPopUpCountries.html',
        title: $translate.instant('w_login.select_country'),
        subTitle: '',
        scope: $scope,
        buttons: [{
          text: $translate.instant('w_general_actions.cancel')
        }]
      });
    },

    hide: function () {
      if (this.popup)
        this.popup.close();
    },

    set_country_code: function (country) {
      $scope.signupData['phone_prefix'] = "+" + country.countryCode;
      $scope.signupData['country'] = country.code;
      $scope.signupData['pretty_country_dial'] = "+" + country.countryCode + " " + country.code;
      this.hide(); // Close the modal
    },


    getCountryLowerCase: function (data) {
      return angular.lowercase(data);
    }

  };




  //----------------------------------------------


  // Facebook
  $scope.signin_up_facebook = {


    login_or_signup: function() {

      var self = this;
      showLoadingIndicator();
      FacebookSvc.loginWithFacebook().then(function (done) {
        console.log(done);
        FacebookSvc.getFacebookProfileInfo(done.access_token).then(function (facebook_profile) {

          facebook_profile.data.language = $scope.language; //always the lang on phone
          $rootScope.userFacebook = facebook_profile;
          FacebookSvc.signInUp(facebook_profile.data)
            .then(function (res) {

            hideLoadingIndicator();
            var user_data = res.data;

            if (user_data.success) {

              UserSvc.persistUserData(res); // persist the user data

              if (user_data.phoneVerified == 0) {
                $scope.activate_phone_social_networks.show(); // Activate the phone
                self.prepare_info(user_data, facebook_profile);
                if (!user_data.country) {
                  setTimeout(function () {
                    $scope.list_countries.show(); // open the dialog to select the country
                  }, 300);
                }
              }

              if (user_data.phoneVerified == 1) {
                SettingsLanguageService.init();
                navigate_to('app.country'); // done!
              }

            } else
              showAlert('Error', user_data.message);
          }, function (err) {
            hideLoadingIndicator();
            showAlert($translate.instant('w_login.login_btn'), $translate.instant('w_general_actions.network_error'));
            console.log('Error creating or Login in the facebook user in the db', err);
          });
        }, function (error) {
          hideLoadingIndicator();
          showAlert($translate.instant('w_login.login_btn'), $translate.instant('w_login.profile_info_error'));
          console.error('Error getting the facebook profile information', error);
        });
      }, function (error) {
        hideLoadingIndicator();
        //showAlert($translate.instant('w_general_actions.network_error'));
        //console.error('There is an error trying to access with Facebook', error);
        // DO NOT show popup if user closed browser
        // if (error.status != "user_cancelled")
        //   showAlert('Login', error);
      });
    },


    // Prepare info to activate the phone
    prepare_info: function(user_data, facebook_profile) {

      $scope.signupData.username = facebook_profile.username;
      $scope.signupData.password = facebook_profile.id;
      $scope.signupData.phone = (user_data.phone != undefined && user_data.phone != '') ? user_data.phone : "" ;

      $scope.signupData.phone_prefix =
          ( user_data.phone_prefix != undefined && user_data.phone_prefix != "" ) ?
              user_data.phone_prefix : "+1";

      $scope.signupData.country =
          ( user_data.country != undefined && user_data.country != "" ) ?
              user_data.country : "US";

      $scope.signupData.pretty_country_dial =
          ( user_data.pretty_country_dial != undefined && user_data.pretty_country_dial != "" && user_data.pretty_country_dial != null ) ?
              user_data.pretty_country_dial : "+1 US";

      $scope.signupData.pretty_country_dial =
          ( user_data.phone_prefix != undefined && user_data.phone_prefix != "" && user_data.phone_prefix != null &&
          user_data.country      != undefined && user_data.country      != "" && user_data.country != null ) ?
              ( user_data.phone_prefix + user_data.country) : "+1 US";
    }


  };




  // Google

  $scope.signin_up_google = {

    login_or_signup: function() {

      var self = this;
      showLoadingIndicator();

      GoogleSvc.loginWithGoogle(function (callback) {

        console.log('login_or_signup', callback);

        if (!callback.success)
          showAlert('Login', callback.message);

        if (callback.success) {

          if (callback.phoneVerified == 0) {

            $scope.activate_phone_social_networks.show(); // Activate the phone
            self.prepare_info(callback);
            hideLoadingIndicator();
            if(!callback.country)
            setTimeout(function(){
              $scope.list_countries.show(); // open the dialog to select the country
            }, 500); // open the dialog to select the country
          }

          if (callback.phoneVerified == 1) {
            if (ionic.Platform.isWebView()) { // is webview should be done earlier in call stack
              SettingsLanguageService.init();
              navigate_to('app.country'); // done!
              hideLoadingIndicator();
            }
          }
        }

      }, function (error) {
        //hideLoadingIndicator();
        showAlert($translate.instant('w_login.login_btn'), $translate.instant('w_general_actions.network_error'));
        console.error('There is an error trying to access with Google', error);
      });
    },

    // Prepare info to activate the phone
    prepare_info: function(data) {
      $scope.signupData.username = data.user.username;
      $scope.signupData.password = data.google_data.id;
      $scope.signupData.phone = (data.user.phone != undefined && data.user.phone != '') ? data.user.phone : "" ;

      $scope.signupData.phone_prefix =
          ( data.user.phone_prefix != undefined && data.user.phone_prefix != "" ) ?
              data.user.phone_prefix : "+1";

      $scope.signupData.country =
          ( data.user.country != undefined && data.user.country != "" ) ?
              data.user.country : "US";

      $scope.signupData.pretty_country_dial =
          ( data.user.pretty_country_dial != undefined && data.user.pretty_country_dial != "" && data.user.pretty_country_dial != null ) ?
              data.user.pretty_country_dial : "+1 US";

      $scope.signupData.pretty_country_dial =
          ( data.user.phone_prefix != undefined && data.user.phone_prefix != "" && data.user.phone_prefix != null &&
          data.user.country      != undefined && data.user.country      != "" && data.user.country != null ) ?
              ( data.user.phone_prefix + data.user.country) : "+1 US";
    },

    restoreSignUpData: function(cb) { // cb => callback_data
      $scope.signupData.phone = cb.phone;
      $scope.signupData.phone_prefix = cb.phone_prefix;
      $scope.signupData.country = cb.country;
      if (cb.phone_prefix != undefined && cb.phone_prefix != "" &&
          cb.country != undefined && cb.country != "")
        $scope.signupData.pretty_country_dial = (cb.phone_prefix + " " + cb.country);
      else
        $scope.signupData.pretty_country_dial = $translate.instant('w_login.select_country');
    }

  };




  // Modal for the countries in the login (if the user have phoneVerified == 0)

  $scope.activate_phone_social_networks = {

    modal: null,

    init: function () {

      var self =this;
      var dfd = $q.defer();

      $ionicModal.fromTemplateUrl("./app/Login/Templates/LoginModalSocialNetworks.html", {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (m) {
        dfd.resolve();
        self.modal = m;
      });

      return dfd.promise;
    },


    show: function() {
      var self =this;
      this.init().then(function() {
        self.modal.show();
      });
    },



    hide: function () {
      this.modal.hide();
    },



    register_or_update_phone: function () {

      var phone = $scope.signupData.phone,
          prefix = $scope.signupData.phone_prefix,
          phone_number = "",
          phone_prefix = "";
      if (phone != undefined && phone != "")
        phone_number = PhoneFormat.cleanPhone($scope.signupData.phone);
      if (prefix != undefined && prefix != "")
        phone_prefix = prefix;

      if (Utils.validPhoneNumber(phone_number, phone_prefix) && Utils.is_valid_phone_prefix(phone_prefix)) {
        showLoadingIndicator();

        console.log('$scope.signupData : PhoneRegistrationSvc.register_or_update_phone_social_networks ', $scope.signupData);
        PhoneRegistrationSvc.register_or_update_phone_social_networks($scope.signupData).then(function (resp) {
          hideLoadingIndicator();
          console.log('reg/up-ph-social resp is: ', resp );
          if (resp.data.sms_err_code) {
            $scope.sms_error = $translate.instant('w_sms_errors.'+res.data.sms_err_code);
            $timeout(function() {
              var smsInput = angular.element(document.body.querySelector('.phone-number input'));

              $animate.addClass(smsInput, 'shake').then(function() {
                smsInput.removeClass('shake');
              });

            });
            return;
          }
          var userInfo = UserSvc.getUserInfo();
          userInfo.phone = phone_number;

          //userInfo.device_username = resp.data.device_username;

          $localstorage.setObject('userInfo', userInfo); // update local storage
          $scope.list_countries.hide();
          $scope.activate_phone_social_networks.hide();
          $scope.error_message_phone_pin_verification = "Check in your phone (" + phone_number + ") for a new SMS."
          $scope.sms_pin_social_networks.show();
        }, function (err) {
          console.log(err);
          hideLoadingIndicator();
          showAlert($translate.instant('w_general_actions.network_error'));
          console.log('Error updating phone pin in SignupSvc', err);
        });
      }
      else
        showAlert($translate.instant('w_login.information_error'));
    },

  };




  // SMS Pin Verification for Social Networks

  $scope.sms_pin_social_networks = {

    signup: {},
    popup: null,

    show: function () {
      var self =this;

      // PIN Popup
      this.popup = $ionicPopup.show({
        template: '<b style="color: #2D5D36;">{{ error_message_phone_pin_verification || "" }}</b>' +
        '<input type="tel" ng-model="signupData.sms_pin">',
        title: $translate.instant('w_login.secure_pin'),
        subTitle: $translate.instant('w_login.secure_pin_detail'),
        scope: $scope,
        buttons: [
          {
            text: $translate.instant('w_general_actions.cancel'), onTap: function (e) {
          }
          },
          {
            text: '<b>' + $translate.instant('w_general_actions.verify') + '</b>',
            type: 'button-positive',
            onTap: function (e) {
              if (!$scope.signupData.sms_pin) {
                e.preventDefault(); // Do nothing
              } else {
                self.verify();
                e.preventDefault();
              }
            }
          }
        ]
      });
    },


    hide: function () {
      this.popup.close();
    },


    verify: function () {

      var self = this;
      showLoadingIndicator();
      return PhoneVerificationSvc.verifySMSPinSocialNetworks($scope.signupData /* we use the sms_pin */).then(function (callback) {

        console.log('Callback after verifySMSPinSocialNetworks', callback);

        if (!callback.data.success)
          $scope.error_message_phone_pin_verification = callback.data.message;
        if (callback.data.success) {

          var userInfo = UserSvc.getUserInfo();
          var device_username = callback.data.device_username;
          if (device_username)
            userInfo.device_username = device_username;

          UserSvc.setPhoneVerified();      // the phone number was verified correctly with the PIN
          UserSvc.setUserInfo(userInfo);   // modify userinfo ot storage the device_username

          self.hide();
          SettingsLanguageService.init();
          $state.go('app.country');
        }
      }, function (promise_error) {
        console.error('There is an error', promise_error);
        $scope.error_message_phone_pin_verification = promise_error.data.message;
      }).finally(function(){
          hideLoadingIndicator();
      });
    },
  };






  //----------------------------------------------

  // Forgot your password

  $scope.forgotPassword = function () {
    var fPopup = $ionicPopup.show({
      template: '<input type="email" ng-model="login.email">',
      title: $translate.instant('w_general_actions.enter_email'),
      scope: $scope,
      buttons: [
        {text: $translate.instant('w_general_actions.cancel')},
        {
          text: '<b>' + $translate.instant('w_general_actions.send') + '</b>',
          type: 'button-positive',
          onTap: function (e) {
            if (!$scope.login.email) {
              e.preventDefault(); //don't allow the user to close unless he enters wifi password
            } else {
              LoginSvc.forgotPassword($scope.login.email, function (callback) {
                showAlert($translate.instant('w_general_actions.warning'), callback.message);
              });
            }
          }
        }
      ]
    });
    fPopup.then(function (res) {
    });
  };





  //----------------------------------------------


  // Utils and others


  /**
   * @function: @showAlert
   * @description: Show a Dialog with the message
   **/
  var showAlert = function (title, message) {
    var alertPopup = $ionicPopup.alert({title: title, template: message});
    alertPopup.then(function (res) {
      return false;
    });
  };


  /**
   * @function: @navigate_to
   * @description: Navigate to
   **/
  var navigate_to = function (internal_state_route) {
    $state.go(internal_state_route);
  };


  /**
   * @function: @navigate_to_signup
   * @description: Navigate to Signup
   **/
  $scope.navigate_to_signup = function () {
    $state.go('signup');
  };


  /**
   * @function: @navigate_to_tour
   * @description: Navigate to tour
   **/
  $scope.navigate_to_tour = function () {
    $state.go('tour');
  };


  /**
   * @function: @showLoadingIndicator
   * @description: Show the loading indicator
   **/
  var showLoadingIndicator = function () {
    $scope.loadingIndicator = $ionicLoading.show({
      animation: 'fade-in',
      showBackdrop: true,
      template: '<ion-spinner icon="android"/>'
    });
  };





  var hideLoadingIndicator = function () {
    $ionicLoading.hide();
  };


  /**
   * @function: @getCountryLowerCase
   * @description:
   * @return:
   **/

  /**
   * @function: @restoreSignUpData
   * @description: restoreSignUpData
   * @param: cb => callback data { cb.phone | cb.phone_prefix | cb.country }
   **/
  var restoreSignUpData = function (cb) { // cb => callback_data
    $scope.signupData.phone = cb.phone;
    $scope.signupData.phone_prefix = cb.phone_prefix;
    $scope.signupData.country = cb.country;
    if (cb.phone_prefix != undefined && cb.phone_prefix != "" &&
      cb.country != undefined && cb.country != "")
      $scope.signupData.pretty_country_dial = (cb.phone_prefix + " " + cb.country);
    else
      $scope.signupData.pretty_country_dial = $translate.instant('w_login.select_country');
  };


  $scope.anonymousLogin = function () {
    $state.go('app.contacts');
  }

}
