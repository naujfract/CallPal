'use strict';

angular
    .module('callpal.sharing')
    .factory('CameraService', CameraService)
;

function CameraService($q) {

  return {

    getPicture: function (options) {
      var dfd = $q.defer();

      navigator.camera.getPicture(function (result) {
        // Do any magic you need
        dfd.resolve(result);
      }, function (err) {
        dfd.reject(err);
      }, options);

      return dfd.promise;
    }

  };

}