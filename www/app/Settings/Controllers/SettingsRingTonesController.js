angular.module('callpal.settings')
  .controller('SettingsRingTonesController', ['$stateParams', 'RingTonesService', '$state', '$scope', 'CallSvc',
    function ($stateParams, RingTonesService, $state, $scope, CallSvc) {

      $scope.play = function (fileName) {
        $scope.userRingTone = fileName;
        RingTonesService.setUserRingTone($stateParams.fromContact, fileName);
        CallSvc.playAudio(RingTonesService.ringToneRoot + fileName);
      }


      $scope.back = function () {

        CallSvc.stopAudio();
        if (! $stateParams.fromContact) {
          $state.go('app.settings.menu');
        } else {
          $state.go('app.contact', {contact: $stateParams.contact } );
          //$state.go('app.contacts');
        }
      }

      $scope.$on('$ionicView.beforeEnter', function() {
        $scope.ringTones = RingTonesService.getRingTones();
        $scope.userRingTone = RingTonesService.getUserRingTone($stateParams.fromContact);
      });

  }]);

