'use strict';

angular
    .module('callpal.notifications')
    .factory('LocalNotificationsSvc', LocalNotificationsSvc);

function LocalNotificationsSvc(Utils, SettingsSvc, UserSvc, $cordovaLocalNotification, $ionicPlatform) {


  // Getting endpoint address
  var host_push = "http://" + window.config.push.host + ":" + window.config.push.port + "/api";


  return {



    // Create locals notifications
    create_notification_random_time: function (id, title, text, time, extra_params) {

      // get random number
      var random_int = Utils.get_random_number_from_zero(10);
      var time = new Date(moment().add(random_int, 'minutes')._d);
      //var time = new Date();
      $ionicPlatform.ready(function () {
        if (window.cordova) {
          cordova.plugins.notification.local.isPresent(id, function (present) {
            if (present) {
              console.log('notification local id already present', id);
              cordova.plugins.notification.local.isTriggered(id, function (present) {
                // isScheduled() or isTriggered()
                $cordovaLocalNotification.schedule({
                  id: id, title: title, text: text, data: extra_params, at: time
                }).then(function (result) {
                });
              });
            }
            else {
              console.log('Scheduling notification id: ' + id + " , on time : " + time);

              $cordovaLocalNotification.schedule({
                id: id, title: title, text: text, data: extra_params, at: time
              }).then(function (result) {
              });
            }
          });
        }
      });

    },



    // Run the reminders for the locals notifications
    run_reminders: function () {
      var self = this;

      // if there is not user session don't run the reminders
      if (UserSvc.is_account_active()) {
        console.log("running notification on account active.");
        var gender = SettingsSvc.getProfileGender();
        var birthday = SettingsSvc.getProfileBirthday();
        // If not happy birthday
        // TODO VALIDATE THERE IS CALL RUNNING
        if (birthday == null || birthday == 'Invalid date' || birthday == undefined) {
          this.create_notification_random_time(17, "CallPal", $translate.instant('reminder.birthday_answer'), 2, {notification_type: "settings_birthday"});
        }
        if (gender == null || gender == "" || gender == undefined) {
          this.create_notification_random_time(18, "CallPal", $translate.instant('reminder.birthday_answer'), 1, {notification_type: "settings_gender"});
        }
      }

    },


    schedule_notification: function (id, title, text, time, extra_params) {
      console.log('Trying to schedule a new notification for this group');
      console.log('ExtraParams : ', extra_params);

      $ionicPlatform.ready(function () {
        if (window.cordova) {
          cordova.plugins.notification.local.isPresent(id, function (present) {
            if (present) {
              console.log('notification local id already present', id);
              cordova.plugins.notification.local.isTriggered(id, function (present) {
                $cordovaLocalNotification.schedule({
                  id: id, title: title, text: text, data: extra_params, at: time
                }).then(function (result) {
                });
              });
            }
            else {
              console.log('Scheduling notification id: ' + id + " , on time : " + time);
              $cordovaLocalNotification.schedule({
                id: id, title: title, text: text, data: extra_params, at: time
              }).then(function (result) {
              });
            }
          });
        }
      });
    },


    // Check notifications:
    check_group_notifications: function() {

    }



  }

};
