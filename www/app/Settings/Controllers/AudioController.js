angular.module('callpal.settings')

// Audio Settings Controller
.controller('AudioCtrl', function ($scope, SettingsSvc, AudioMicroSvc) {

  $scope.saveNeeded = false;
  $scope.settingsAudio = {}; // default audio settings


  /**
   * @function: @ionicView.beforeLeave
   * @description: Set Listener for save
   **/
  $scope.$on('$ionicView.beforeLeave', function () {
    if ($scope.saveNeeded === true) {
      $scope.changeSettingsAudio();
    }
  });


  /**
   * @function: @initAudio
   * @description: initialize the audio settings
   * @description: initialize data from local storage into the settings for audio
   **/
  $scope.initAudio = function () {
    SettingsSvc.getSettings('Audio').then(function (Settings) {
      $scope.settingsAudio = Settings.Settings;
      $scope.show = true;
    });
  };


  /**
   * @function: @onRelease
   * @description: Change the variable to change the settings
   **/
  $scope.onRelease = function () {
    $scope.saveNeeded = true;
  };


  /**
   * @function: changeSettingsAudio
   * @description: persist the data
   **/
  $scope.changeSettingsAudio = function () {
    AudioMicroSvc.changeSettingsAudio($scope.settingsAudio, function (callback) {
      if (callback.success !== undefined && callback.success == false) {
        var message = 'Error';
        if (callback.message != undefined)
          message = callback.message;
        else
          message = callback.error;
        $scope.showAlert('Error', message);
      } else
        $scope.saveNeeded = false;
    });
  };


});
