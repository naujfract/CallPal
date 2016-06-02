'use strict';

angular
.module('callpal.notifications')
.controller('NotificationsCtrl', NotificationsCtrl);

function NotificationsCtrl($injector
                         , VoiceMailSvc
                         , $ionicPopup
                         , $q
                         , UserSvc
                         , $scope
                         , $state
                         , CallPalDbSvc
                         , $ionicModal
                         , ContactsSvc
                         , NotificationsSvc
                         , ionicToast
                         , Utils
                         , $translate
                         , $window) {

  //------------------------------------------------------------------
  // IOS Global Push Notifications from external services
  //------------------------------------------------------------------


  ionic.Platform.ready(function () {

    if (ionic.Platform.isIOS()) {

      var iosConfig = {
        senderID: "623580757489",
        gcmSandbox: true,
        alert: "true",
        badge: "true",
        sound: "true",
        categories: {
            "incoming_call": {
                "yes": {
                    "callback": "accept", "title": "Accept", "foreground": true, "destructive": false
                },
                "no": {
                    "callback": "app.reject", "title": "Reject", "foreground": false, "destructive": false
                }
            }
        }
      };


      console.log('window.accept', window);

      if (Utils.isRunningOnADevice()) {

        if ((typeof PushNotification) != "undefined" && (typeof PushNotification !== "undefined")
            && (typeof PushNotification) != undefined && cordova.plugins && cordova.plugins.diagnostic) {
          var push = PushNotification.init({
            ios: iosConfig
          });

          push.on('registration', function (data) {
            if (data.registrationId.length > 0) {
              console.log('------------ registration ID = ' + data.registrationId);
              // Send the registrationId to the server
              NotificationsSvc.saveRegistrationId(data.registrationId);
            }
          });

          push.on('notification', function (notification) {
            console.log('notification-----', notification);
            console.log('notification callback -----', notification.additionalData.callback);
            cordova.plugins.diagnostic.isRemoteNotificationsEnabled(function(sccs){
              var userInfo = UserSvc.getUserInfo();
              if (userInfo.username != undefined || userInfo.username != "" || userInfo.username != null) {
                $scope.NotificatorManager.manage(notification);
              }
            }, function(err){
              console.log(err);
            });

          });

          push.on('error', function (e) {
            console.error('error push ios', e.message);
          });
        }

        else
          console.log('\n\n\n\n\n\n ERROR PLEASE INSTALL PushNotificationsPlugin!!! \n\n\n\n');


      }

    }

    if (ionic.Platform.isAndroid()) {

      var androidConfig = {
        "senderID": "623580757489"
      }

      if (Utils.isRunningOnADevice() && (typeof PushNotification !== 'undefined'))
        if (Utils.isRunningOnADevice() && PushNotification) { // Check if the push plugin is defined.

          console.log('DEBUG INF: trying to register in push notifications');

          var push = PushNotification.init({
            android: androidConfig
          });

          push.on('registration', function (data) {
            console.log('DEBUG: INF Data for push registration is : ', data);
            if (data.registrationId.length > 0) {
              console.log('registration ID = ' + data.registrationId);
              NotificationsSvc.saveRegistrationId(data.registrationId); // Send the registrationId to the server
            }
          });

          push.on('notification', function (notification) {
            console.log("New push notification: ", notification);
            $scope.NotificatorManager.manage(notification);
          });


          push.on('error', function (e) {
            console.error('error push android', e.message);
          });
        }

    }
  });


  //----------------------------

  $scope.NotificatorManager = {


    sync: function () {
      $scope.notifications.refresh();
    },


    // Here only manage IMPORTANT NOTIFICATIONS (NOTIFY CALL & DUPLICATED PHONE)
    // All the rest of the notifications are
    manage: function (notification) {

      var self = this;
      self.sync(); // Recursive Sync the notifications

      var deferred = $q.defer();
      var payload = null;
      var type = null;

      if (ionic.Platform.isIOS()) {
        payload = JSON.parse(notification.additionalData['gcm.notification.payload']);
        console.log('payload json', payload);
        type = notification.additionalData['gcm.notification.type'];
        //type = payload.type;
      } else {
        payload = notification.additionalData.payload;
        type = payload.type;
      }

      console.log('The type is : ', type);
      console.log('The payload is : ', payload);


      // Only process the incoming call and the duplicated phone notification

      // Incoming call
      if (type == "incoming_call") { // Launch the app the screen

        // Disconnecting from the SIP on incoming push call

        //CallPalSvc.closeSipConnection();
        if (typeof cordova !== 'undefined') {
          var CallPalSvc = $injector.get('CallPalSvc');
          if (cordova.plugins.backgroundMode.isActive()) {
            console.log('Background mode is active and there is a push, cancel the next sip normal event');
            CallPalSvc.setCurrentCallFromPushStatus(true);
          }
        }

        //Utils.bringAppToFront();
        console.log('notification.additionalData', notification.additionalData);

        if (notification.additionalData.clicked) {

          var member = {
            avatar: payload.member.avatar,
            displayName: payload.member.phone,
            extension: payload.member.extension,
            phoneNumbers: [{
              number: payload.member.phone,
              countryCode: payload.member.phone_prefix
            }],
            username: payload.member.username
          };

          if (ionic.Platform.isIOS()) {
            if (notification.additionalData.clicked == 'accept') {
              $state.go('callpal', {
                members: [member],
                auto_answer: notification.additionalData.clicked,
                video_enabled: false,
                type: 'incoming',
                pause_sip_incoming_call_behavior: true
              });
            }
          }else{
            $state.go('callpal', {
              members: [member],
              auto_answer: notification.additionalData.clicked,
              video_enabled: false,
              type: 'incoming',
              pause_sip_incoming_call_behavior: true
            });
          }

          $state.go('callpal', {
            members: [member],
            auto_answer: notification.additionalData.clicked,
            video_enabled: false,
            type: 'incoming',
            pause_sip_incoming_call_behavior: true
          });

        }

        else
        {
          console.log('i should detect here if the screen is off but the app is oppened');

        }

        deferred.resolve();
      }

      // Call from blocked contact
      if (type == "call_from_blocked_contact") {
        deferred.resolve();
        ionicToast.show("CallPal call from blocked contact " + payload.displayName, 'bottom', false, window.config.timeDisplayingToasts);
      }


      // TODO Check this with mario

      if (payload.type == "phone_duplicated") {

        localStorage.clear();
        CallPalDbSvc.deleteTables();
        $state.go('login');

        var showAlert = function () {
          var alertPopup = $ionicPopup.alert({
            title: $translate.instant('w_notifications.duplicated_phone_title'),
            template: $translate.instant('w_notifications.duplicated_phone_text')
          });

          alertPopup.then(function (res) {
            $state.go('login');
          });
        };
        showAlert();

        deferred.resolve();

      }


      deferred.resolve();
      return deferred.promise;
    },


    // Manage the rest of the notifications

    interact: function (notification) {

      var self = this;
      var deferred = $q.defer();

      var payload = notification.additionalData.payload;
      var type = payload.type;

      if (type == "shared_contact") {
        self.sharing_contact.process(notification);
      }

      if (type == "new_voicemail") {
        self.voicemail_notification.process(notification);
        VoiceMailSvc.initVoicemails();
      }

      self.sync(); // After interact with a notification (sync notifications)

      self.clearNotification(notification);

      deferred.resolve();
      return deferred.promise;

    },


    // Clear one notification (one)
    clearNotification: function (notification) {

      var dfd = $q.defer();
      var self = this;
      NotificationsSvc.dismissNotification(notification).then(function (done) {
        self.sync();
      });


    },


    // clearNotifications (all)
    // ask the user
    // clean notifications
    // show a toast

    clearNotifications: function () {

      var self = this;

      if ($scope.notifications.list.length > 0) {

        $ionicPopup
        .confirm({
          title: $translate.instant('w_notifications.title'),
          template: $translate.instant('w_notifications.delete_all')
        })
        .then(function (res) {
          if (res) {
            NotificationsSvc.dismissNotifications().then(function (done) {
              ionicToast.show("Notifications deleted successfully", 'bottom', false, window.config.timeDisplayingToasts);
              self.sync();
            });

          }
        });

      }

    },


    search: {

      query: "",
      isEnabled: false,

      enable: function (inputSearchId) {
        this.query = "";
        this.isEnabled = true;
        Utils.showKeyboard(inputSearchId);
      },

      disable: function () {
        this.query = "";
        this.isEnabled = false;
        Utils.hideKeyboard();
      },

      if_is_android: function () {
        return !ionic.Platform.isIOS();
      }

    },


    sharing_contact: {

      notification: null,
      notification_id: null,
      contact: null,
      from: null,
      modal: null,


      process: function (ntf) {

        var self = this;
        self.notification = ntf;
        var payload = self.notification.additionalData.payload;

        self.notification_id = payload.notification_id;
        self.contact = payload.contact;
        self.from = payload.from;
        self.show();

      },


      init: function () {
        var self = this;
        var deferred = $q.defer();
        $ionicModal.fromTemplateUrl('app/Notifications/Templates/NotificationsModalAcceptSharedContact.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function (modal) {
          self.modal = modal;
          deferred.resolve();
        }, function () {
          deferred.reject();
        });
        return deferred.promise;
      },


      show: function () {
        var self = this;
        if (this.modal) {
          this.modal.show();
        } else {
          this.init().then(function () {
            console.log('\n\ntrying to accept incoming shared contact\n\n');
            self.modal.show();
            $("#parrot_elem1").addClass("animated swing");
          })
        }
      },


      hide: function () {
        var self = this;
        if (this.modal) {
          this.modal.remove();
          this.modal = null;
        }
      },


      save: function () {
        this.hide();
        var self = this;
        ContactsSvc.createContact(self.contact).then(function (data) {
          NotificationsSvc.dismissNotification(self.notification).then(function (done) {
            $scope.notifications.refresh();
          });
          ionicToast.show('', 'bottom', false, window.config.timeDisplayingToasts);
        }).then(function (error) {
          console.error('Error: Error saving contact');
          ionicToast.show($translate.instant('w_notifications.import_contact_error'), 'bottom', false, window.config.timeDisplayingToasts);
        });

      },
    },


    voicemail_notification: {
      notification: null,
      from: null,
      modal: null,
      process: function (ntf) {
        var self = this;
        self.notification = ntf;
        var payload = self.notification.additionalData.payload;
        self.name = payload.name;
        self.phone = payload.phone;
        self.phone_prefix = payload.phone_prefix;
        $state.go('app.voicemail'); // Take the user to the voiceMail
      },
    }
  };


}
