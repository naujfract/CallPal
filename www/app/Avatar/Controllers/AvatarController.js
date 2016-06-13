angular.module('callpal.avatar')

.controller('AvatarCtrl', function (CallPalDbSvc, CallSvc, $scope, $state, $window, SettingsSvc, $ionicPopup, MembersDbSvc, CountryCodesSvc, CallsDbSvc, UserSvc, $ionicPlatform, $ionicModal, ionicToast, CameraSvc, UserRemoteSvc, $ionicLoading, Utils, $translate) {

  //console.log("settings controller fired...");


  $scope.debug = window.config.debug;



  // Navigation Control for Settings Section
  $scope.gotoAvatar = function (option) {
    $state.go('app.avatar.' + option);
  };


});
