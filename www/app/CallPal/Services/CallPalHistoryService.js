'use strict';

angular
    .module('callpal.callpal')
    .factory('CallPalHistorySvc', CallPalHistorySvc);


function CallPalHistorySvc(ContactsSvc, DBA, $q) {

  var _prefix = 'calls';

  return {

    add: function (call) {
      var deferred = $q.defer();

      if (Array.isArray(call.members)) {
        var member = call.members[0];
        if (member.extension != undefined && member.extension != null && member.extension != "") {
          call.avatar = ContactsSvc.getCachedAvatar(call.members[0].extension);
        }
        else {
          call.avatar = "";
        }
        DBA.addDocument(_prefix, call)
            .then(function () {
              deferred.resolve();
            }, function () {
              deferred.reject();
            });
      }

      deferred.reject();
      return deferred.promise;
    },

    getAll: function () {

      var result = [];
      var deferred = $q.defer();

      DBA.getCollection(_prefix)
        .then(function (history) {

          if (history.length > 0) {
            for (var i = history.length - 1; i >= 0; i--) {
              var call = history[i];
              if (call.members.length == 0) { continue }

              if (ContactsSvc.isInitalized()) {
                if (call.members[0].extension) {
                  call.avatar = ContactsSvc.getCachedAvatar(call.members[0].extension);
                } else if (call.members[0].phoneNumbers) {
                  call.avatar = ContactsSvc.getCachedAvatarByNumber(call.members[0].phoneNumbers);
                }
              }

              result.push(call);
            }

            deferred.resolve(result);
          } else {
            deferred.resolve([]);
          }
        }, function (err) {
          console.log('ERROR', err);
        });
      return deferred.promise;
    },

    clear: function () {
      DBA.delCollection(_prefix)
          .then(function () {
            ;
          }, function () {
            ;
          });
    }


  }

}
