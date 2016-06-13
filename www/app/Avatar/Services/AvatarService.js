'use strict';

angular
    .module('callpal.avatar')
    .factory('NotificationsSvc', ['$localstorage', '$cordovaDevice', 'UserSvc', 'ConfigurationSvc', '$q', '$http', '$rootScope', 'Utils', NotificationsSvc]);

function NotificationsSvc($localstorage, $cordovaDevice, UserSvc, ConfigurationSvc, $q, $http, $rootScope, Utils, CallPalSvc) {

  // Getting endpoint address
  var host_push = ConfigurationSvc.get_push_host();

  return {


    pauseSipIncomingCallBehavior: function() {
      // CallPalSvc.setPauseSipIncomingCallBehavior(true);
    },


    // Download the remote notifications
    // Save it in the localStorage
    // Delete the remote notifications from the backend
    getAll: function () {

      var self = this;

      var dfd = $q.defer();
      var userToken = UserSvc.getUserToken();
      var userInfo = UserSvc.getUserInfo();
      var notifications = $localstorage.getObject('callpal_notifications');

      var req = {
        method: 'GET',
        url: (host_push + '/notifications/get_all/' + userInfo.username),
        headers: {
          'Authorization': 'Bearer ' + userToken.value
        }
      };

      $http(req).then(function (response) {

        var remote_notifications_list = response.data.notifications;
        if (remote_notifications_list != undefined && remote_notifications_list.length > 0) {

          var new_list = self.createNewNotifications(remote_notifications_list);
          //var new_list = notifications.concat(remote_notifications_list);
          //$localstorage.setObject('callpal_notifications', new_list);
          dfd.resolve(new_list);
          self.deleteRemoteNotifications(); // delete remotes

        }
        else
          dfd.resolve(notifications);

      }, function (error) {

        console.error('Network error trying to download the notifications ', error);
        return dfd.reject("error getting notifications");

      });

      return dfd.promise

    },


    createNewNotifications: function (arrNotifications) {
      console.log('DEBUG: Trying to create new notification: ', arrNotifications);
      var notifications = $localstorage.getObject('callpal_notifications');
      var new_list = notifications.concat(arrNotifications);
      $localstorage.setObject('callpal_notifications', new_list);
      return new_list;
    },


    // Delete the remotes notifications

    deleteRemoteNotifications: function () {

      var dfd = $q.defer();
      var userToken = UserSvc.getUserToken();
      var userInfo = UserSvc.getUserInfo();

      var req_delete_notifications = {
        method: 'DELETE',
        url: (host_push + '/notifications/delete_all/' + userInfo.username),
        headers: {'Authorization': 'Bearer ' + userToken.value}
      };

      $http(req_delete_notifications).then(function (delete_notifications_data) {
        dfd.resolve();
      }, function (delete_notifications_error) {
        dfd.reject();
      });
      return dfd.promise;

    },


    // Remove a notification from the lS
    dismissNotification: function (notification) {

      var dfd = $q.defer();
      var notifications = $localstorage.getObject('callpal_notifications');

      if (notifications.length == 1) {
        $localstorage.setObject('callpal_notifications', []);
      }
      else {
        for (var i in notifications) {
          if (notifications[i].additionalData.notification_id == notification.additionalData.notification_id) {
            notifications.splice(i, 1);
            $localstorage.setObject('callpal_notifications', notifications);
            break;
          }
        }
      }

      dfd.resolve("done");
      return dfd.promise;

    },


    dismissNotifications: function () {

      var dfd = $q.defer();
      $localstorage.setObject('callpal_notifications', []);
      dfd.resolve('done');
      return dfd.promise;

    },


    // Save Google/APNS registrationId
    saveRegistrationId: function (registrationId) {
      var dfd = $q.defer();

      if (window.cordova) {
        var device_uuid = $cordovaDevice.getUUID();
        var device = $cordovaDevice.getDevice();
        var userToken = UserSvc.getUserToken();
        var userInfo = UserSvc.getUserInfo();

        console.log('host_push', host_push);

        var req = {
          method: 'PUT',
          url: (host_push + '/notifications/save_registration_id/' + userInfo.username),
          headers: {
            'Authorization': 'Bearer ' + userToken.value
          },
          data: {registrationId: registrationId, device_uuid: device_uuid, username: userInfo.username, device: device}
        };

        $http(req).then(function (response) {
          dfd.resolve(response);
        }, function (error) {
          console.error('Error saving the registrationId ', error);
          dfd.reject('Error: Network connection');
        });
      }
      dfd.reject('Error: Network connection');
      return dfd.promise;
    },


    // Notify the remote user about my call
    notifyOutgoingCall: function (username, from, to) {
      var userToken = UserSvc.getUserToken();
      var userInfo  = UserSvc.getUserInfo();
      var params = { username: username, from: from, to: to,
        extraContactData: {
            avatar: userInfo.avatar,
            country: userInfo.country,
            countryName: userInfo.countryName,
            extension: userInfo.device_username,
            language: userInfo.language,
            name: userInfo.name,
            phone: userInfo.phone,
            username: userInfo.username,
            phone_prefix: userInfo.phone_prefix,
            gender: userInfo.gender,
            dob: userInfo.dob
        }
      };
      var deferred = $q.defer();
      var request = {
        method: 'POST',
        url: (host_push + '/notifications/contacts/notify_incoming_call'),
        headers: {'Authorization': 'Bearer ' + userToken.value},
        data: params
      };

      $http(request)
          .then(function (response) {
            return deferred.resolve(response);
          }, function (error) {
            console.error('error notifying outgoing call', error);
            return deferred.resolve([]);
          });
      return deferred.promise
    },




    // Notify missed call
    notifyMissedCall: function (username, from, to) {
      var userToken = UserSvc.getUserToken();
      var userInfo  = UserSvc.getUserInfo();
      var params = { username: username, from: from, to: to,
        extraContactData: {
          avatar: userInfo.avatar,
          country: userInfo.country,
          countryName: userInfo.countryName,
          extension: userInfo.device_username,
          language: userInfo.language,
          name: userInfo.name,
          phone: userInfo.phone,
          username: userInfo.username,
          phone_prefix: userInfo.phone_prefix,
          gender: userInfo.gender,
          dob: userInfo.dob
        }
      };
      var deferred = $q.defer();
      var request = {
        method: 'POST',
        url: (host_push + '/notifications/contacts/notify_missing_call'),
        headers: {'Authorization': 'Bearer ' + userToken.value},
        data: params
      };

      $http(request)
          .then(function (response) {
            return deferred.resolve(response);
          }, function (error) {
            console.error('error notifying outgoing call', error);
            return deferred.resolve([]);
          });
      return deferred.promise
    },





    // Notify the remote user about my VoiceMail
    notifyVoiceMailDelivered: function (to, time) {

      time = (time * 1000) + (45 * 1000); // time to milliseconds + extra time for kazoo to create the voicemail

      //console.log('Sending notification to ', to);

      var userToken = UserSvc.getUserToken();
      var params = {to_username: to};
      var deferred = $q.defer();

      var req = {
        method: 'POST',
        url: (host_push + '/notifications/contacts/new_voice_message'),
        headers: {
          'Authorization': 'Bearer ' + userToken.value
        },
        data: params
      };

      console.log('\n\n DEBUG: Notifying VOICE_MAIL IN: ' + time + ' \n\n');
      setTimeout(function () {
        $http(req).then(function (response) {
          console.log('DEBUG: VoiceMail was notified in time correctly. Response from notifications new_voice_message ', response);
          deferred.resolve(response);
        }, function (error) {
          console.error('error notifying voicemail call', error);
          deferred.resolve([]);
        });
      }, time);

      return deferred.promise

    }

  }

};
