'use strict';

angular
    .module('callpal.notifications')
    .controller('LocalNotificationsCtrl', LocalNotificationsCtrl);

function LocalNotificationsCtrl($q, $scope, $rootScope, $ionicModal, AvatarService, NotificationsSvc, SettingsSvc, CallPalSvc) {


  //------------------------------------------------------------------
  // Local Notifications and Reminders
  //------------------------------------------------------------------

  console.log('Running local notifications');
  LocalNotificationsSvc.run_reminders();



  $scope.birthday = {

    modal: null,
    date: new Date(),

    init: function () {

      var self = this;
      var deferred = $q.defer();

      $ionicModal.fromTemplateUrl('app/Notifications/Templates/NotificationsModalBirthDay.html', {
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
        this.modal.show()
      } else {
        this
            .init()
            .then(function () {
              self.modal.show();
            })
      }

    },

    hide: function () {

      this.modal.remove();
      this.modal = null;

    },

    save: function () {

      $scope.birthday.date = moment($scope.birthday.date).format("YYYY-MM-DD");
      SettingsSvc.setProfileBirthday($scope.birthday.date);

      var sendData = {
        dob: $scope.birthday.date
      }

      SettingsSvc
          .changeUserProfile(sendData)
          .then(function (promise_ok) {
            $scope.show_thanks = true;
            setTimeout(function () {
              $scope.birthday.hide();
            }, 500);
          }, function (promise_error) {
            console.error('An error happened saving the user configuration', promise_error);
          });

    }

  };


  //----------------------------

  $scope.gender = {

    modal: null,
    gender: null,
    avatars: {},

    init: function () {

      var self = this;
      var deferred = $q.defer();

      this.avatars.male = AvatarService.get_male_avatar();
      this.avatars.female = AvatarService.get_female_avatar();

      $ionicModal.fromTemplateUrl('app/Notifications/Templates/NotificationsModalGender.html', {
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
        this.modal.show()
      } else {
        this
            .init()
            .then(function () {
              self.modal.show();
            })
      }


    },

    hide: function () {

      this.modal.remove();
      this.modal = null;

    },

    save: function (gender) {

      $scope.show_thanks = true;

      if (gender == "male")
        $('#male').addClass('animated wobble');

      if (gender == "female")
        $('#female').addClass('animated bounceOutLeft');

      SettingsSvc.setProfileGender(gender);

      var sendData = {
        gender: gender
      }

      SettingsSvc
          .changeUserProfile(sendData)
          .then(function (promise_ok) {
            $scope.show_thanks = true;
            setTimeout(function () {
              $scope.gender.hide();
            }, 500);
          }, function (promise_error) {
            console.error('An error happened saving the user configuration', promise_error);
          });

    }

  };


  //-----------
  // Process notification data
  $scope.group_call_schedule = {

    execute: function (notificationData) {
      console.log('Notification Data for group call schedule to process', notificationData);
      if (notificationData)
        $state.go('app.groups-show', {group: notificationData});
    },

  };


  //----------------------------
  // Events for local

  $rootScope.$on('$cordovaLocalNotification:click', function (event, notification, state) {
    var notification_type = JSON.parse(notification.data).notification_type;
    if (notification_type == "settings_gender")
      $scope.gender.show();
    if (notification_type == "settings_birthday")
      $scope.birthday.show();

    if (notification_type == "group_call_schedule")
      $scope.group_call_schedule.execute(notification.data);

    if (notification_type == "incoming_call") {
      $state.params.auto_answer = true;
      CallPalSvc.setAutoAnswer($state.params.auto_answer);
    }

  });

  $rootScope.$on('$cordovaLocalNotification:schedule', function (event, notification, state) {
    console.log('schedule');
  });

  $rootScope.$on('$cordovaLocalNotification:trigger', function (event, notification, state) {
    console.log('trigger');
  });

  $rootScope.$on('$cordovaLocalNotification:update', function (event, notification, state) {
    console.log('update');
  });

  $rootScope.$on('$cordovaLocalNotification:clear', function (event, notification, state) {
    console.log('clear');
    // Cron the reminders
    setTimeout(function () {
      NotificationsSvc.run_reminders();
    }, 1000);
  });

  $rootScope.$on('$cordovaLocalNotification:clearall', function (event, state) {
    console.log('clearall');
    // Cron the reminders
    setTimeout(function () {
      NotificationsSvc.run_reminders();
    }, 1000);
  });

  $rootScope.$on('$cordovaLocalNotification:cancel', function (event, notification, state) {
    console.log('cancel');
    // Cron the reminders
    setTimeout(function () {
      NotificationsSvc.run_reminders();
    }, 1000);
  });

  $rootScope.$on('$cordovaLocalNotification:cancelall', function (event, state) {
    console.log('cancelall');
    // Cron the reminders
    setTimeout(function () {
      NotificationsSvc.run_reminders();
    }, 1000);
  });


}
