'use strict';

angular
  .module('callpal.contacts')
  .factory('BlockedContactsSvc', BlockedContactsSvc);

function BlockedContactsSvc($q, $http, UserSvc, ConfigurationSvc, $localstorage, ionicToast, ContactsSvc, $translate) {

  var host = ConfigurationSvc.base_endpoint(),
    blockeds = $localstorage.getObject('blockeds');

  // Auxiliar private function to add blocked to backend
  function addBlockedToBackend (contact) {
    var userInfo = UserSvc.getUserInfo();
    var userToken = UserSvc.getUserToken();
    var deferred = $q.defer();

    var req = {
      method: 'PUT',
      url: (host + '/contact/addblocked/' + userInfo.username),
      headers: {
        'Authorization': 'Bearer ' + userToken.value
      },
      data: {'extension' : contact.extension}
    };

    $http(req).then(function () {
      deferred.resolve();
    }, function (err) {
      return deferred.reject(err);
    });

    return deferred.promise;
  }

  // Auxiliar private function to remove blocked from backend
  function removeBlockedFromBackend (contact) {
    var deferred = $q.defer(),
        userInfo = UserSvc.getUserInfo(),
        userToken = UserSvc.getUserToken();

    var req = {
      method: 'PUT',
      url: (host + '/contact/removeblocked/' + userInfo.username),
      headers: {
        'Authorization': 'Bearer ' + userToken.value
      },
      data: { extension: contact.extension }
    };

    $http(req).then(function (response) {
      console.log("DEBUG: Success deleting contact from backend", response);
      deferred.resolve(response);
    }, function (err) {
      console.log("DEBUG: ERROR deleting contact from backend", err);
      deferred.reject(err);
    });

    return deferred.promise;
  }

  // Auxiliar private function to add blocked to frontend
  function addBlockedToFrontend (contact) {
    if (! Array.isArray(blockeds)) {
      blockeds = new Array();
    }
    blockeds.push({'extension' : contact.extension});
    $localstorage.setObject('blockeds', blockeds);
  }

  // Auxiliar private function to remove blocked from frontend
  function removeBlockedFromFrontend (contact) {
    if (Array.isArray(blockeds)) {
      var position = factory.isBlocked(contact) === true ? 0 : factory.isBlocked(contact);
      blockeds.splice(position, 1);
      $localstorage.setObject('blockeds', blockeds);
    }
  }


  var factory = {

    add : function (contact) {
      var deferred = $q.defer();

      addBlockedToBackend(contact)
        .then(function () {
          addBlockedToFrontend(contact);
          ionicToast.show($translate.instant('w_contacts.blocked_ok'), 'bottom', false, window.config.timeDisplayingToasts);
          deferred.resolve();
        }, function (err) {
          ionicToast.show($translate.instant('w_contacts.blocked_error'), 'bottom', false, window.config.timeDisplayingToasts);
          deferred.resolve(err);
        });

      return deferred.promise;
    },

    isBlocked : function (contact) {
      if (! contact.extension) { return false }
      if (! Array.isArray(blockeds)) { return false }

      for (var i in blockeds) {
        if (blockeds[i].extension == contact.extension) {
          if (i == 0 ) { return true }
          return i;
        }
      }

      return false;
    },

    isCallpalUser : function (contact) {
      return contact.extension;
    },

    remove : function (contact) {

      console.log('DEBUG: Contact to delete is: ', contact);
      var deferred = $q.defer();

      removeBlockedFromBackend(contact).then(function () {
        removeBlockedFromFrontend(contact);
        ionicToast.show($translate.instant('w_contacts.unblocked_ok'), 'bottom', false, window.config.timeDisplayingToasts);
        deferred.resolve();
      }, function (err) {
        ionicToast.show($translate.instant('w_contacts.unblocked_error'), 'bottom', false, window.config.timeDisplayingToasts);
        deferred.resolve(err);
      });


      return deferred.promise;
    },

    getAll: function () {
      var contacts = [],
        allContacts = ContactsSvc.all();

      if (! Array.isArray(blockeds)) { return [] }

      for (var i in blockeds) {
        for (var j in allContacts) {
          if (allContacts[j].extension == blockeds[i].extension) {
            contacts.push(allContacts[j]);
          }
        }
      }

      return contacts;
    }

  };

  return factory;
}
