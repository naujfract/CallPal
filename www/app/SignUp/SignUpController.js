'use strict';

angular
  .module('callpal.signup')
  .controller('SignUpCtrl', SignUpCtrl);

function SignUpCtrl($scope, $translate, $state, $ionicLoading, $ionicPopup, $ionicModal, $localstorage, UserSvc, Utils, SignUpSvc, PhoneRegistrationSvc, PhoneVerificationSvc, CountryCodesSvc, SettingsLanguageService, $timeout, $animate) {

  $scope.flag = window.config.flags; // Flags egg-shape for the app

  // List of the countries
  $scope.search = {caption: ""};
  $scope.countries = CountryCodesSvc.getCountries();

  // The data for the signUp process
  $scope.signupData = {
    'username': '',
    'password': '',
    'phone_prefix': '+1',
    'pretty_country_dial': '+1 US',
    'country_initials': 'US',
    'confirm_password': '',
    'name': '',
    'gender': '',
    'dob': '',
    'country': '',
    'phone': '',
    'language': '',
    'referral': '',
    'latitude': '',
    'longitude': '',
    'sms_pin': ''
  };


  // Load Country Modal
  $ionicModal.fromTemplateUrl('app/SignUp/Templates/SignUpModalPhone.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.phone_country_modal = modal;
  });



  /**
   * @function: @NextShowCountryPhoneModal
   * @description: Show the next part of the wizard for the registration process
   * This method is to click in the next button to show the list to select the country and type the phone number
   * This method also check the email and the password
   **/
  $scope.NextShowCountryPhoneModal = function () {

    var username = $scope.signupData.username;
    var password = $scope.signupData.password;

    if (Utils.is_valid_email(username) && Utils.is_valid_password(password))
      $scope.showPhoneCountryModal();
    else
      showAlert($translate.instant('w_login.information_error_2', { characters: 6 }));

  };



  /**
   * @function: @showPhoneCountryModal
   * @description: Show the phone popup
   * @param:-
   * @return:-
   **/
  $scope.showPhoneCountryModal = function () {
    $scope.phone_country_modal.show();
    $scope.showCountries();

  };




  /**
   * @function: @hidePhoneCountryModal
   * @description: Close the modal
   * @return:-
   **/
  $scope.hidePhoneCountryModal = function () {
    $scope.phone_country_modal.hide();
  };




  /**
   * @function: @setCountryCode
   * @description: Click on the item on the list to select your country code
   * @param:-
   * @return:-
   **/
  $scope.setCountryCodeFromItemInCountriesList = function (country) {
    $scope.signupData.phone_prefix = "+" + country.countryCode;
    $scope.signupData.pretty_country_dial = "+" + country.countryCode + " " + country.code;
    $scope.signupData.country_initials = country.code;
    
    $scope.PopUpCountries.close();
  };

  

  $scope.registerAccount = function() {

    var phone = $scope.signupData.phone;
    var formatted_phone = PhoneFormat.cleanPhone(phone); // Format the phone before send it
    var phone_prefix = $scope.signupData.phone_prefix;

    if (!phone_prefix || phone_prefix.length === 0 || !formatted_phone || formatted_phone.length === 0) {
      showAlert($translate.instant('w_login.empty_phone_fields'));
      return;
    }
    if (Utils.validPhoneNumber(formatted_phone, phone_prefix)) {

      $ionicLoading.show();
      $scope.signupData.username = $scope.signupData.username.toLowerCase();

      SettingsLanguageService.get_phone_language().then(function(language) {
        $scope.signupData.language = language;

        SignUpSvc.signup($scope.signupData).then(function(callback) { // Creating the new user account
          if (typeof callback.data.sms_err_code !== 'undefined') {
            // attempt sms verification again
            $scope.sms_error = $translate.instant('w_sms_errors.' + callback.data.sms_err_code);
            $timeout(function() {
              var smsInput = angular.element(document.body.querySelector('.phone-number input'));
              $animate.addClass(smsInput, 'shake').then(function() {
                smsInput.removeClass('shake');
              });
            });
            return;
          }
          if (callback != undefined && callback.success)
            $scope.showPhonePinPopup();
          if (callback != undefined && !callback.success)
            showAlert('Error: ' + callback.message);
        }, function(error) {
          showAlert($translate.instant('w_login.login_btn') + ', ' + $translate.instant('w_general_actions.network_error') + error);
        }).finally(function() {
          $ionicLoading.hide();
        });
      });
    } else
      showAlert($translate.instant('w_login.information_error'));
  };


  /**
   * @function: @showPhonePinPopup
   * @description: Show the Popup to ask for the Phone pin
   * @param:-
   * @return:-
   **/
  $scope.showPhonePinPopup = function () {
    $scope.phonePinVerificationPopup = $ionicPopup.show({
      templateUrl: 'app/SignUp/Templates/SignUpPopUpPin.html',
      title: $translate.instant('w_login.secure_pin'),
      subTitle: $translate.instant('w_login.secure_pin_detail'),
      scope: $scope,
      buttons: [
        {text: $translate.instant('w_general_actions.cancel')},
        {
          text: '<b>' + $translate.instant('w_general_actions.verify') + '</b>',
          type: 'button-positive',
          onTap: function (e) {
            if (!$scope.signupData.sms_pin) {
              e.preventDefault();
            } else {
              verifySMSPinRegularSignUp($scope.signupData);
              e.preventDefault();
            }
          }
        }
      ]
    });
  };


  /**
   * @function: @hidePhonePinPopup
   * @description: Hide the phone pin verification popup
   * @return:
   **/
  $scope.hidePhonePinPopup = function () {
    $scope.phonePinVerificationPopup.close();
  };


  /**
   * @function: @hide_show_password
   * @description: Hide or show the password
   * @return:
   **/
  $scope.password_status = "web-assets/img/eye-close.png";

  $scope.hide_show_password = function () {
    if ($scope.showpassword) {
      $scope.password_status = "web-assets/img/eye-close.png";
      $scope.showpassword = false;
    }
    else {
      $scope.password_status = "web-assets/img/eye-open.png";
      $scope.showpassword = true;
    }
  };


  /**
   * @function: @updateAccountPhoneNumberResendPin
   * @description: Update Phone
   * @param:-
   * @return:-
   **/
  $scope.updateAccountPhoneNumberResendPin = function () {

    if(!$scope.signupData.phone || $scope.signupData.phone.length === 0){
        showAlert($translate.instant('w_login.empty_phone'));
        return;
    }
    
    if (UserSvc.attempts() < 3) {

      if (Utils.validPhoneNumber($scope.signupData.phone, $scope.signupData.phone_prefix)) {
        
        $ionicLoading.show();

        PhoneRegistrationSvc.register_or_update_phone_regular_signup($scope.signupData).then(function (res) {
          if (res.data.success === false && typeof res.data.sms_err_code !== 'undefined') {
            // attempt sms verification again
            $scope.sms_error = $translate.instant('w_sms_errors.' + res.data.sms_err_code);
            $timeout(function() {
              var smsInput = angular.element(document.body.querySelector('.phone-number input'));
              $animate.addClass(smsInput, 'shake').then(function() {
                smsInput.removeClass('shake');
              });
            });
            $ionicLoading.hide();
            return;
          }

          UserSvc.attempts_increment();

          $ionicLoading.hide();

          var userInfo = UserSvc.getUserInfo();

          userInfo.phone = $scope.signupData.phone;
          $localstorage.setObject('userInfo', userInfo);

          $scope.error_message_phone_pin_verification = $translate.instant('w_login.secure_pin_detail');

          $scope.showPhonePinPopup();

        }, function (err) {
          console.log('Error updating phone pin in SignUpSvc', err);
        });

      } else
        showAlert($translate.instant('w_login.information_error'));

    }
    else
      attemptsExceded();

  };


  /**
   * @function: @verifySMSPinRegularSignUp
   * @description: Verify the Phone pin
   * @param: signupData
   * @return: Access to the app if all is working
   **/
  var verifySMSPinRegularSignUp = function (signupData) {

    $ionicLoading.show();

    return PhoneVerificationSvc.verifySMSPinRegularSignUp(signupData).then(function (callback) {


      // here
      console.log('Callback : : : verifySMSPinRegularSignUp ', callback);

      if (!callback.data.success)
        $scope.error_message_phone_pin_verification = callback.data.message;

      if (callback.data.success) {



        UserSvc.setPhoneVerified();
        $scope.hidePhonePinPopup();
        $scope.hidePhoneCountryModal();
        SettingsLanguageService.init();

        var userInfo = UserSvc.getUserInfo();
        var device_username = callback.data.device_username;
        if (device_username)
          userInfo.device_username = device_username;
        UserSvc.setUserInfo(userInfo);   // modify userinfo ot storage the device_username

        $state.go('app.country');
      }
    }, function (error) {
        $scope.error_message_phone_pin_verification = error.data.message;
    }).finally(function(){
        $ionicLoading.hide();
    });
  };


  /**
   * @function: @showAlert
   * @description: show an alert in the screen
   * @param: message (the message or the information to show)
   * @return:
   **/
  var showAlert = function (message) {
    var alertPopup = $ionicPopup.alert({
      title: $translate.instant('w_login.signin_callpal'),
      template: message
    });
    alertPopup.then(function () {
      alertPopup.close();
    });
  };


  /**
   * @function: @attemptsExceded
   * @description:
   * @param:
   * @return:
   **/
  var attemptsExceded = function () {
    var alertPopup = $ionicPopup.alert({
      title: $translate.instant('w_login.signin_callpal'),
      template: $translate.instant('w_login.attempts_error')
    });
    alertPopup.then(function () {
      alertPopup.close();
      $scope.hidePhoneCountryModal();
      $scope.hidePhonePinPopup();
      alertPopup.close();
      $state.go('login');
    });
  };


  /**
   * @function: @getCountryLowerCase
   * @description:
   * @return:
   **/
  $scope.getCountryLowerCase = function (data) {
    return angular.lowercase(data);
  };


  /**
   * @function: @goBack
   * @description: Navigate back
   **/
  $scope.goBack = function () {
    $scope.hidePhoneCountryModal();
    if (!(UserSvc.attempts < 3))
      $state.go('login');
  };


  /**
   * @function: @back
   * @description: Go back
   * @param: -
   * @return: -
   **/
  $scope.back = function () {
    $state.go('login');
  };


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

  $scope.showCountries = function () {
    $scope.PopUpCountries = $ionicPopup.show({
      templateUrl: 'app/SignUp/Templates/SignUpPopUpCountries.html',
      title: $translate.instant('w_login.select_country'),
      subTitle: '',
      scope: $scope,
      buttons: [{
        text: $translate.instant('w_login.select_country')
      }]
    });
  };

}
