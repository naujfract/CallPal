'use strict';

angular.module('callpal.main').controller('MainCtrl', MainCtrl);

function MainCtrl(UserSvc,
                  NotificationsSvc,
                  Utils,
                  ContactsSvc,
                  CallPalSvc,
                  $scope,
                  ionicToast,
                  $state,
                  $rootScope,
                  VoiceMailSvc,
                  SIPService,
                  $localstorage,
                  $callpalbackground,
                  $css,
                  $ionicModal,
                  $ionicHistory,
                  $timeout,
                  CallSvc,
                  $translate,
                  $ionicSlideBoxDelegate,
                  $cordovaLocalNotification,
                  PHONE_STATUS,
                  TellafriendSvc,
                  GeoCodingService,
                  $ionicPopup,
                  $ionicPlatform,
                  $cordovaSplashscreen,
                  $http,
                  CountryCodesSvc,
                  ModalsManagerService,
                  $q,
                  SpeedDialSvc,
                  SettingsSvc,
                  $window,
                  $cordovaSQLite,
                  CallPalDbSvc) {

  // --------------------------------------------------------------------

  $scope.flag = window.config.flags; // Flags egg-shape for the app

  // Declaration of global vars used in all the app
  $scope.phone_status = PHONE_STATUS; // Online offline
  $scope.phone_platform = ionic.Platform.platform(); // Platform
  $scope.reloading = {
    favorites: true,
    callHistory: true,
    voicemails: false
  }; // realoding flags for spinners

  $scope.pendingRequests = function () {//used to disable buttons while $http has pending requests
    return $http.pendingRequests.length > 0;
  };

  // --------------------------------------------------------------------
  // Contacts (second menu and groups calls)
  $scope.contacts = {
    list: ContactsSvc.all(),

    refresh: function () {
      ContactsSvc.refresh().then(function (success) {
        $scope.contacts.list = ContactsSvc.all();
        $scope.$broadcast('scroll.refreshComplete');
      }, function (sad) {
        ionicToast.show($translate.instant('w_contacts.load_error'), 'bottom', false, window.config.timeDisplayingToasts);
        $scope.$broadcast('scroll.refreshComplete');
      });
    },

    // Return a group of selected contacts/members
    // Used in the group call
    selected: function () {
      var result = [];
      this.list.forEach(function (contact) {
        if (contact.isChecked) {
          result.push(contact);
        }
      });
      return result;
    },


    invite: function (contact) {
      console.log('DEBUG: INF: Inviting contact ', contact);
      $ionicPopup.confirm({
        title: "Invite",
        template: "Are you sure you want to send this invitation?"
      }).then(function (res) {
        if (res) {
          console.log("the contact is :", contact);
          TellafriendSvc.gossipWithFriends([contact]);
        }
      });
    }

  };

  $rootScope.$on("contacts:refresh", function () {
    $scope.contacts.refresh();
  });

  $ionicPlatform.ready(function () {

    //CallPalDbSvc.deleteMedia()


    if(ContactsSvc.all().length === 0){
        ContactsSvc.initialize().then(function () { // Load the contact list

            $scope.contacts.list = ContactsSvc.all();
            if ($scope.contacts.list.length <= 18) {
              var userInfo = UserSvc.getUserInfo();
              userInfo.initialInvitationSent = 1;
              UserSvc.setUserInfo(userInfo);
            }
            $scope.tell_a_friend.refresh();

            // ContactsSvc.initContactsSync(); // backup contacts function
        }, function(){
            $scope.contacts.list = ContactsSvc.all();// load contacts list in the phone
        });
    }

    $rootScope.calling = false;

    $scope.user_data = SettingsSvc.callpalUser;
    if (Utils.isEmptyObject($scope.user_data)) {
      console.log('user object is empty');
      $scope.user_data = UserSvc.getUserInfo();
    }

  });

  // Tell a friend (first menu)
  $scope.tell_a_friend = {
    friends: [],
    refresh: function () {
      this.friends = ContactsSvc.get_all_without_callpal();
    }
  };

  // Notifications (main menu)
  $scope.notifications = {
    list: [],
    refresh: function () {
      var self = this;
      NotificationsSvc.getAll().then(function (data) {
        self.list = data;
        $scope.$broadcast('scroll.refreshComplete');
      }, function (err) {
        console.error('Error getting notifications', err);
      });
    }
  };
  $scope.notifications.refresh();


  // Calls (main menu)
  $scope.calls = [];


  // VoiceMail (fourth menu)

  $rootScope.$on("voicemail:refresh", function () {
    console.log('Voicemail is being notified');
    //$scope.voicemail.refresh();
  });


  // --------------------------------------------------------------------

  // Initialize the sip connection

  Utils.delay(300).then(function () {

    // Init the SIP connection
    if (typeof cordova !== 'undefined') {
      if (!cordova.plugins.backgroundMode.isActive())
        SIPService.init().then(function () {
          CallPalSvc.init(); // Reconnect to the SIP
        });
    }
    else // is the web
    {
      SIPService.init().then(function () {
        CallPalSvc.init(); // Reconnect to the SIP
      });
    }

  });

  // Reconnect to SIP resume
  document.addEventListener('resume', function () {

    console.log('RESUME CORRE');

    cordova.plugins.backgroundMode.disable(); // Disable background mode

    if (typeof cordova !== 'undefined') {
      if (!cordova.plugins.backgroundMode.isActive())
        SIPService.init().then(function () {
          CallPalSvc.init(); // Reconnect to the SIP
        });
    }
    else // is the web
    {
      SIPService.init().then(function () {
        CallPalSvc.init(); // Reconnect to the SIP
      });
    }


    $scope.validate_location();
    onPause = false;
  });

  if (window.cordova){
    setTimeout(function(){
      $cordovaSplashscreen.hide();
    }, 1000);
  }


  //----------------------------------------------------------------------------
  // Correction Tool

  $scope.correctionTool = {

    modal: null,
    //countries: CallSvc.getCountries(),
    countries: [],
    search: {},

    country: null,
    contact: null,

    validNumber: false,
    phoneNumber: null,
    phoneNumberPos: null,
    immutablePhoneNumber: null,
    originalCountry: undefined,
    extraOptions: null,

    clearPhone: function (real_number) {
      return real_number ? PhoneFormat.cleanPhone(real_number) : null;
    },

    init: function () {
      var self = this;
      var dfd = $q.defer();
      var userInfo = UserSvc.getUserInfo();

      self.countries = [];

      var systemCountries = CallSvc.getCountries();
      //console.log('CallSvc.getCountries()', CallSvc.getCountries());

      systemCountries.find(
          function(country, index){

            if(country && country.code)
            {
              if(country.code == userInfo.country)
              {
                self.countries.push(country);
                systemCountries.splice(index, 1);
              }

              if(userInfo.country != 'US')
              {
                if(country.code == 'US')
                {
                  self.countries.push(country);
                  systemCountries.splice(index, 1);
                }
              }
            }

          });

      self.countries = self.countries.concat(systemCountries);

      $ionicModal.fromTemplateUrl('app/Contacts/Templates/ContactsModalCorrectionTool.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        self.modal = modal;
        dfd.resolve();

      }, function (error) {
        dfd.reject(error);
      });

      return dfd.promise;
    },

    clearSelectedCountry: function () {
      this.search.caption = "";
    },

    show: function (contact, phoneNumberPos, extraOptions) {

      var self = this;
      if (extraOptions) {
        // this.extraOptions = extraOptions; // This popup comes from GroupCall

        // save
        this.groupCallBack = function (test) {
          console.log(test);
          var phoneIndex = extraOptions.phoneIndex;
          console.log(phoneIndex);
          extraOptions.scope.selectedPhone = extraOptions.contact.phoneNumbers[phoneIndex].number;
          extraOptions.scope.phoneSelectedIndex = phoneIndex;
          extraOptions.scope.saveNumber(contact);
        }

        console.log('INSPECTING SELF OR ExtraOptions ' , extraOptions);
      }

      if(contact.phoneNumbers[phoneNumberPos].countryCode)
        this.originalCountry = CountryCodesSvc.getCountryByPhonePrefix(contact.phoneNumbers[phoneNumberPos].countryCode);

      this.contact = contact;
      this.phoneNumberPos = phoneNumberPos;
      this.phoneNumber = contact.phoneNumbers[phoneNumberPos].number;
      this.immutablePhoneNumber = contact.phoneNumbers[phoneNumberPos].real_number || contact.phoneNumbers[phoneNumberPos].number;

      this.init().then(function () {
        self.modal.show();
        ModalsManagerService.add({modal_type: "modal", modal_id: "autocorrection_number", modal: self.modal});
        if ($scope.correctionTool.originalCountry) {
          $scope.correctionTool.search.caption = $scope.correctionTool.originalCountry.caption;
          $scope.correctionTool.country = $scope.correctionTool.originalCountry;
        } else {
          //var us = CountryCodesSvc.getCountryByAbbv('US')
          //$scope.correctionTool.search.caption = us.caption;
        }
      });

    },


    select_country: function (country) {

      var self = this;

      this.country = country;
      this.search.caption = country.caption;

      // validate if the number is correct
      var validObject = Utils.validPhoneNumber(this.immutablePhoneNumber, country.code);
      this.validNumber = validObject.valid;

      if (this.validNumber) {
        this.phoneNumber = validObject.displayedNumber;
      } else {
        ionicToast.show($translate.instant('w_contacts.correction_tool.invalid_country'), 'middle', false, window.config.timeDisplayingToasts);
      }

    },


    save: function () {



      var self = this;

      this.validNumber = Utils.validPhoneNumber(this.phoneNumber, this.country.code);

      if (this.validNumber) {
        if(self.phoneNumber !== self.contact.phoneNumbers[this.phoneNumberPos].number ||
            !self.contact.phoneNumbers[this.phoneNumberPos].fixed) {
          SpeedDialSvc.createOrUpdateSpeedDial(self.contact, self.phoneNumber, self.phoneNumberPos,
              self.immutablePhoneNumber, self.country)
              .then(function (success) { // Set properties for new speedDial inside contact
                console.log('DEBUG: success is: ', success);
                console.log('DEBUG: self.contact' ,self.contact);

                // call group add callback from within here
                if (self.groupCallBack) {
                  self.groupCallBack(self.contact);
                  // delete self.groupCallBack;
                }

                ionicToast.show($translate.instant('w_contacts.correction_tool.save_success'), 'bottom', false, window.config.timeDisplayingToasts);

                self.notifyContactRefresh();

                //if (self.extraOptions && self.extraOptions.type == "group_call_member_selection") {
                //  self.extraOptions.scope.group.selectNumber(success);
                //}

                self.hide(false);
              }, function (error) {
                ionicToast.show($translate.instant('w_contacts.correction_tool.save_error'), 'middle', false, window.config.timeDisplayingToasts);
                console.error('DEBUG: There is an error saving speedDial on the server', error);
              });
        }else{
          self.hide();
        }
      }else {
        ionicToast.show($translate.instant('w_contacts.correction_tool.invalid_country'), 'middle', false, window.config.timeDisplayingToasts);
      }

    },


    notifyContactRefresh: function () {
      var self = this;
      //$scope.details.refresh_contact();
      self.contact.hasSpeedDial = true;
      self.contact.phoneNumbers[self.phoneNumberPos].fixed = true;
      self.contact.phoneNumbers[self.phoneNumberPos].number = self.phoneNumber;
      self.contact.phoneNumbers[self.phoneNumberPos].countryCode = self.country.countryCode;
      self.contact.phoneNumbers[self.phoneNumberPos].real_number = self.contact.phoneNumbers[self.phoneNumberPos].number;
    },


    hide: function (with_popup_option) {

      //if (!with_popup_option && this.extraOptions && this.extraOptions.type == "group_call_member_selection") {
      //  this.extraOptions.scope.group.selectNumber(this.extraOptions.contact);
      //}

      this.contact = null;
      this.phoneNumberPos = null;
      this.phoneNumber = null;
      this.immutablePhoneNumber = null;
      delete $state.params.showCorrectionTool;
      console.log('$state.params.showCorrectionTool;', $state.params.showCorrectionTool);
      this.modal.remove();
      this.modal = null;
    },


    validatePhoneNumber: function() {

      if (Utils.validPhoneNumber(this.phoneNumber, this.country.code)) {
        this.validNumber = true;
      }

    },

  };


  //----------------------------------------------------------------------------
  // Lang and Background

  // Apply the background settings
  $scope.applyBackground = {

    apply: function () {
      $scope.background = $callpalbackground.get_background();
      $css.removeAll();
      $css.bind({
        href: 'css/background-' + $scope.background + '.css'
      }, $scope);
    }

  };
  $scope.applyBackground.apply();

  //----------------------------------------------------------------------------
  // Manage missing calls

  // Show notify new missed call
  $scope.missingCallNotNotified = null;
  $scope.setMissingCallNotNotified = function (val) {
    $scope.missingCallNotNotified = val;
  };
  $rootScope.$on('call:show_missing_call', function () {
    $scope.missingCallNotNotified = $localstorage.get('missingCallNotNotified');
    if (!$scope.missingCallNotNotified)
      $scope.missingCallNotNotified = 0;
    $scope.missingCallNotNotified = parseInt($scope.missingCallNotNotified) + 1;
    $localstorage.set('missingCallNotNotified', $scope.missingCallNotNotified);
  });

  //----------------------------------------------------------------------------

  // Management of native calls

  // detect native incoming call
  if (typeof window.plugins !== 'undefined' && cordova) {
    PhoneCallTrap.onCall(function (state) {
      switch (state) {
        case "RINGING":
          CallPalSvc.nativeCall.status = CallPalSvc.nativeCall.RINGING;
          if (CallPalSvc.isCallPalCallActive()) {
            $ionicSlideBoxDelegate.$getByHandle('slider-ads').stop(); // stop adds for incoming native call
            var session = CallPalSvc.getCallPalCallSession(); // put the call in hold and stop the ads
            session.hold();
            if (CallPalSvc.getCall().members[0].landline) { // if the calling is to an landline
              $timeout(function () { // wait for 5 seconds
                // if the user hangup the native call
                if (CallPalSvc.nativeCall.status == CallPalSvc.nativeCall.IDLE) {
                  var session = CallPalSvc.getCallPalCallSession();
                  session.unhold();
                } else
                  CallPalSvc.disconnect();
              }, 5000);
            }
          }
          break;
        case "OFFHOOK":
          CallPalSvc.nativeCall.status = CallPalSvc.nativeCall.OFFHOOK;
          break;
        case "IDLE":
          CallPalSvc.nativeCall.status = CallPalSvc.nativeCall.IDLE;
          if (CallPalSvc.isCallPalCallActive()) {
            $ionicSlideBoxDelegate.$getByHandle('slider-ads').start(); // run the ads when hangup native call
            var session = CallPalSvc.getCallPalCallSession(); // put the call in unhold and
            session.unhold();
          }
          break;
      }
    });
  }

  //----------------------------------------------------------------------------

  // Utility functions in the MainController scope

  // Navigation
  $scope.navigate_to = function (state, options, state_back, options_back) { // Navigate to.
    if (state_back != null && state_back != undefined)
      $scope.state_back = state_back;
    if (options_back != null && options_back != undefined)
      $scope.options_back = options_back;
    if (options != undefined && options != null)
      $state.go(state, options);
    else
      $state.go(state);
  };
  $scope.navigate_back = function () { // Navigate back
    if ($scope.state_back && $scope.options_back)
      $state.go($scope.state_back, $scope.options_back);
    else if ($scope.state_back && !$scope.options_back) {
      $state.go($scope.state_back);
    } else
      $ionicHistory.back();
  };
  $scope.goToCallPal = function () { // Navigate to home
    $scope.setMissingCallNotNotified(0);
    $localstorage.set('missingCallNotNotified', 0);
    $state.go('app.country');
  };

  // remove animations
  $scope.removeAnimations = function () {
    $ionicHistory.nextViewOptions({
      disableAnimate: true
    });
  };


  //----------------------------------------------------------------------

  // App goes to the background
  var onPause = false;
  // restart the app if calling and user press hold
  document.addEventListener('pause', function () {

    cordova.plugins.backgroundMode.enable(); // Enable background mode

    onPause = true;
    // stop all the voice mail reproducing
    VoiceMailSvc.audios.stop();

    // if there is a call running
    if (CallPalSvc.isCallPalCallActive()) {
      $cordovaLocalNotification.schedule({
        id: "1",
        title: "Callpal",
        text: $translate.instant('call_history.end_call_notification', { time: ModalsManagerService.getCallFinishingTime() }),
        sound: 'file://web-assets/audio/beep.wav'
      }).then(function () {
        setTimeout(function () {
          if (onPause) {
            // restart the time for callFinishingTime
            ModalsManagerService.setCallFinishingTime(10);
            CallPalSvc.disconnect();
          }
        }, ModalsManagerService.getCallFinishingTime() * 1000);
      });
    } else {

      // silence ring tone and other sound
      CallSvc.stopAudio();

      // Stop the connection if the app goes to the background
      console.log('\n\n\n THE WENT TO THE BACKGROUND \n\n\n');
      CallPalSvc.closeSipConnection();
      //CallPalSvc.closeSipConnection();

    }
  }, false);

  //----------------------------------------------------------------------

  // Location

  $scope.popUp = {
    show: function (title, template, btOk, btCancel, type) {
      var self = this;
      var confirmPopup = $ionicPopup.confirm({
        title: title,
        template: template,
        buttons: [{
          text: btOk,
          type: 'button-positive',
          onTap: function (e) {
            if (cordova && cordova.plugins && cordova.plugins.diagnostic)
              cordova.plugins.diagnostic.switchToLocationSettings();
            else
              console.error('DEBUG: ERROR, Please install plugin cordova.plugins.diagnostic');
          }
        }]
      });
    }
  };
  var count_location_intents = 0;
  $scope.validate_location = function () {
    var self = this;
    var validate = GeoCodingService.validate();
    console.log('validate_location', validate);
    if (validate) {
      count_location_intents = 0;
      console.log('DEBUG: INFO: Main validate_location', validate);
    } else {
      GeoCodingService.get_location().then(function (sccs) {
        count_location_intents = 0;
        console.log('DEBUG: INFO: Main GeoCodingService.get_location', sccs);
      }, function (err) {
        console.log(err);
        if(count_location_intents < 3)
        {
          $scope.validate_location();
          count_location_intents++;
        }
        /*if (ionic.Platform.isAndroid()) {
          $scope.popUp.show($translate.instant('location.unavailable'),
              $translate.instant('location.activation_request'),
              $translate.instant('t_menu.settings'),
              $translate.instant('w_general_actions.cancel'),
              1);
        } else if (ionic.Platform.isIOS()) {
          $scope.popUp.show($translate.instant('location.unavailable'),
              $translate.instant('location.unavailable'),
              $translate.instant('w_general_actions.retry'),
              $translate.instant('w_general_actions.cancel'),
              2);
        }*/
      });
    }
  }

  $scope.validate_location();

  // Keyboard Scroll
  $scope.$on('$ionicView.afterEnter', function () {
    // Handle iOS-specific issue with jumpy viewport when interacting with input fields.
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.disableScroll(true);
    }
  });
  $scope.$on('$ionicView.beforeLeave', function () {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      // return to keyboard default scroll state
      cordova.plugins.Keyboard.disableScroll(false);
    }
  });

};
