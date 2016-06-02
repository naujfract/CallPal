'use strict';

angular
  .module('callpal.contacts')
  .factory('FavoritesContactsSvc', FavoritesContactsSvc)
;

function FavoritesContactsSvc($q, $http, UserSvc, ConfigurationSvc, $localstorage, ionicToast, ContactsSvc, BlockedContactsSvc, $translate) {

  var host = ConfigurationSvc.base_endpoint(),
      userToken = UserSvc.getUserToken(),
      userInfo = UserSvc.getUserInfo(),
      favorites = $localstorage.getObject('favorites');

  // Auxiliar private function to add favorite to backend
  function addFavoriteToBackend (contact) {
    var deferred = $q.defer();

    var req = {
      method: 'PUT',
      url: (host + '/contact/addfavorite/' + userInfo.username),
      headers: {
        'Authorization': 'Bearer ' + userToken.value
      },
      data: {'extension' : contact.extension}
    };

    $http(req).then(function (ok) {
      console.log('DEBUG: SUCC creating fav', ok);
      deferred.resolve();
    }, function (err) {
      console.log('DEBUG: ERROR creating fav', err);
      deferred.reject(err);
    });

    return deferred.promise;
  }

  // Auxiliar private function to remove favorite from backend
  function removeFavoriteFromBackend (contact) {
    var deferred = $q.defer();

    var req = {
      method: 'PUT',
      url: (host + '/contact/removefavorite/' + userInfo.username),
      headers: {
        'Authorization': 'Bearer ' + userToken.value
      },
      data: {'extension' : contact.extension}
    };

    $http(req).then(function (ok) {
      console.log('DEBUG: SUCC deleting fav', ok);
      deferred.resolve();
    }, function (err) {
      console.log('DEBUG: ERR deleting fav', err);
      deferred.reject(err);
    });

    return deferred.promise;
  }

  // Auxiliar private function to add favorite to frontend
  function addFavoriteToFrontend (contact) {
    if (! Array.isArray(favorites)) {
      favorites = new Array();
    }

    favorites.push(contact);
    $localstorage.setObject('favorites', favorites);
  }

  // Auxiliar private function to remove favorite from frontend
  function removeFavoriteFromFrontend (contact) {
    if (Array.isArray(favorites)) {
      var position = factory.isFavorite(contact) === true ? 0 : factory.isFavorite(contact);

      favorites.splice(position, 1);
      $localstorage.setObject('favorites', favorites);
    }
  }


  var factory = {
    add : function (contact) {
      var deferred = $q.defer();

      addFavoriteToBackend(contact)
        .then(function () {
          addFavoriteToFrontend(contact);
          ionicToast.show($translate.instant('w_contacts.favorite_ok'), 'bottom', false, window.config.timeDisplayingToasts);
          deferred.resolve();
        }, function (err) {
          ionicToast.show($translate.instant('w_contacts.favorite_error'), 'bottom', false, window.config.timeDisplayingToasts);
          deferred.resolve(err);
        })

      return deferred.promise;
    },

    isFavorite : function (contact) {
      if (! contact.extension) { return false }
      if (! Array.isArray(favorites)) { return false }

      for (var i in favorites) {
        if (favorites[i].extension == contact.extension) {
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
      var deferred = $q.defer();

      removeFavoriteFromBackend(contact.extension)
        .then(function () {
          removeFavoriteFromFrontend(contact)
          ionicToast.show($translate.instant('w_contacts.remove_favorite_ok'), 'bottom', false, window.config.timeDisplayingToasts);
          deferred.resolve();
        }, function (err) {
          ionicToast.show($translate.instant('w_contacts.remove_favorite_error'), 'bottom', false, window.config.timeDisplayingToasts);
          deferred.resolve(err);
        })

      return deferred.promise;
    },

    getAll: function () {
      var favorites = $localstorage.getObject('favorites'),
          contacts = [];

      for (var i in favorites) {
         var favorite = favorites[i];

         if (! BlockedContactsSvc.isBlocked(favorite)) {
           if (ContactsSvc.isInitalized()) {
             if (favorite.extension) {
               favorite.avatar = ContactsSvc.getCachedAvatar(favorite.extension);
             } else if (favorite.phoneNumbers) {
               favorite.avatar = ContactsSvc.getCachedAvatarByNumber(favorite.phoneNumbers);
             }
           }

           contacts.push(favorite);
         }
      }

      return contacts;
    }

  };

  return factory;
}
