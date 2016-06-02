'use strict';

angular
    .module('callpal.voicemail')
    .factory('GroupSvc', GroupSvc);

function GroupSvc(DBA, $q, ConfigurationSvc, UserSvc, $http, $rootScope, LocalNotificationsSvc) {

  var host = ConfigurationSvc.base_endpoint();

  return {


    // Change Schedule for the group call
    changeLocalNotificationSchedule: function (group) {
      console.log('The group is : ', group);
      LocalNotificationsSvc.schedule_notification(21, "CallPal", "New group call schedule", new Date(group.timestamp.toString()), {notification_type: "group_call_schedule",  group: group});
    },


    createInstantCall: function (members) {

      console.log('DEBUG: MEMBERS createInstantCall', members);
      var userToken = UserSvc.getUserToken();
      var userInfo = UserSvc.getUserInfo();
      var dfd = $q.defer();

      var data_request = {
        members: members
      };

      var req = {
        method: 'PUT',
        url: (host + '/group_calls/instant_call/' + userInfo.username),
        headers: {
          'Authorization': 'Bearer ' + userToken.value
        },
        data: data_request
      };

      $http(req).then(function (response) {
        dfd.resolve(response);
      }, function (error) {
        console.error('Error creating the instant group call in the server side', error);
        dfd.reject(error);
      });
      return dfd.promise;

    },


    schedule_group: function (group) {

      var self = this;
      var userToken = UserSvc.getUserToken();
      var userInfo = UserSvc.getUserInfo();
      var deferred = $q.defer();
      var data_request = {
        owner: userInfo.username,
        timestamp: new Date(group.timestamp.toString()),
        members: group.members,
        name: group.name,
        reminder: group.reminder
      };

      var req = {
        method: 'POST',
        url: (host + '/group_calls/create'),
        headers: {
          'Authorization': 'Bearer ' + userToken.value
        },
        data: data_request
      };

      $http(req).then(function (response) {
        console.log('response on group create', response);
        // Here call the SQLite to create the group
        group.key = response.data.data.key;
        group.groupcall_number = response.data.data.groupcall_number;
        
        DBA.addDocument('groups', group)
            .then(function (suc) {
              console.log('DEBUG: Success creating group inside DB', suc);

              if (group.reminder) // Send the local notification schedule for the group
                self.changeLocalNotificationSchedule(group);

              deferred.resolve(suc);
            }, function (err) {
              console.error('DEBUG: Error creating group inside DB', err);
              deferred.reject(err);
            });

      }, function (error) {
        console.error('Error creating the group call in the server side', error);
        deferred.reject(error);
      });

      return deferred.promise
    },


    update: function (group) {

      var userToken = UserSvc.getUserToken();
      var userInfo = UserSvc.getUserInfo();
      var self = this;

      var deferred = $q.defer();

      var data_request = {
        id: group.key,
        owner: userInfo.username,
        timestamp: new Date(group.timestamp.toString()),
        members: group.members,
        name: group.name,
        reminder: group.reminder
      };

      var req = {
        method: 'PUT',
        url: (host + '/group_calls/update/' + group.key),
        headers: {'Authorization': 'Bearer ' + userToken.value},
        data: data_request
      };

      $http(req).then(function (response) {
        console.log('DEBUG: SUCC: reponse updatign group call', response);
        DBA.updateDocument("groups", "key", group.key, group).then(function (success) {
          console.log('Succ, ', success);
          deferred.resolve(success.members); // Update the group call in the SQlite
        }, function (err) {
          console.error('Error', err);
        })

      }, function (error) {
        console.error('DEBUG: Error updating the group call in the server side', error);
        deferred.reject(error);
      });
      return deferred.promise
    },


    remove_group: function (group) {

      var userToken = UserSvc.getUserToken();
      var userInfo = UserSvc.getUserInfo();
      var deferred = $q.defer(),
          req = {
            method: 'PUT',
            url: (host + '/group_calls/delete_one/' + group.key + '/' + userInfo.username),
            headers: {'Authorization': 'Bearer ' + userToken.value}
          };
      $http(req).then(function (response) {
        deferred.resolve(response);
        DBA.delDocumentSelf('groups', group, 'key').then(function (successGroupDelete) {
          $rootScope.$emit('groups:refresh');
          deferred.resolve("The group call was deleted correctly");
        }, function (exceptionGroupDelete) {
          deferred.reject("There is an error trying to delete the group");
          console.error('DEBUG: CERR exceptionGroupDelete ', exceptionGroupDelete);
        });
      }, function (error) {
        console.error('DEBUG: Error updating the group call in the server side', error);
        deferred.reject(error);
      });
      return deferred.promise;
    },


    destroy_all: function () {

      var userToken = UserSvc.getUserToken();
      var userInfo = UserSvc.getUserInfo();
      var deferred = $q.defer();
      var req = {
        method: 'PUT',
        url: host + '/group_calls/delete_all/' + userInfo.username,
        headers: {'Authorization': 'Bearer ' + userToken.value}
      };


      $http(req).then(function (response) {
        console.log('response for delete all', response);
        deferred.resolve(response);
        DBA.delCollection('groups').then(function (successGroupDelete) {
          $rootScope.$emit('groups:refresh');
          deferred.resolve("The group call was deleted correctly");
        }, function (exceptionGroupDelete) {
          deferred.reject("There is an error trying to delete the group");
          console.error('DEBUG: CERR exceptionGroupDelete ', exceptionGroupDelete);
        });
      }, function (err) {
        deferred.reject(err);
      });
      return deferred.promise;
    },

    downloadRemoteGroupCalls: function () {
      var dfd = $q.defer(),
          req = {
            method: 'GET',
            url: (host + '/group_calls/all/' + UserSvc.getUserInfo().username),
            headers: {'Authorization': 'Bearer ' + UserSvc.getUserToken().value}
          };
      $http(req).then(function (response) {
        console.log('DEBUG: response for group download', response);
        if (response.data.success)
          for (var i in response.data.data) {
            var group = response.data.data[i];
            console.log('the group is : ', group);
            DBA.addDocument('groups', group);
          }
        dfd.resolve(response);
      }, function (error) {
        console.error('DEBUG: Error downloading groups', error);
        dfd.reject(error);
      });
      return dfd.promise;
    },


    getAll: function () {
      var deferred = $q.defer();

      DBA.getCollection('groups')
          .then(function (suc) {
            //console.log('groups from database', suc);
            deferred.resolve(suc);
          }, function (err) {
            deferred.reject(err);
          });

      return deferred.promise;
    },

    // return true if at least one of the member is a callpal user, otherwise return false
    isAtLeastOneCallpalUser : function (selected_members) {
      for (var i in selected_members || []) {
        if (selected_members[i].extension) {
          return true;
        }
      }
      return false;
    }

  };


}
