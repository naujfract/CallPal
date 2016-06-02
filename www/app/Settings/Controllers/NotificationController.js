angular.module('callpal.settings')


// Notification Settings Controller
.controller('NotificationCtrl', function ($scope, NotificationSoundSvc) {

  $scope.settingsNotification = {};

  //console.log("NOTIFICATION controller fired...");
  $scope.saveNeeded = false;

  // Set Listener for save
  $scope.$on('$ionicView.beforeLeave', function () {
    if ($scope.saveNeeded === true) {
      $scope.changeSettingsNotification();
    }
  });

  //initialize data from NotificatorManager storage into the settings for notification
  $scope.initNotification = function () {
    $scope.settingsNotification.incomingCallAnimation = NotificationSoundSvc.getIncomingCallAnimation();
    $scope.settingsNotification.notifyNewVoicemail = NotificationSoundSvc.getNotifyNewVoicemail();
  };

  // Watch changes
  $scope.onChange = function () {
    $scope.saveNeeded = true;
  };

  // Function to change settings notifications
  $scope.changeSettingsNotification = function () {
    NotificationSoundSvc.changeSettingsNotification($scope.settingsNotification, function (callback) {
      if (callback.success !== undefined && callback.success == false)
        $scope.showAlert('Error', callback.message);
      else
        $scope.saveNeeded = false;
    });
  };

});
