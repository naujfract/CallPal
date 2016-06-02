'use strict';

angular.module('callpal.settings')

  // SettingsUpdateProfileCtrl
  .controller("SettingsUpdateProfileCtrl", function ($scope, $state, SettingsSvc) {

    $scope.minDate = moment().subtract('100', 'years');
    $scope.maxDate = moment().subtract('5', 'years');
    
    function init(){
        $scope.saveNeeded = false;
        $scope.oldUserData = angular.copy($scope.user_data);
    }

    $scope.$on('$ionicView.enter', function (e) {
        init();
    });
    
    $scope.$on('$locationChangeStart', function () {
      if ($scope.saveNeeded === true) {
        $scope.changeUserProfile();
        $scope.saveNeeded = false;
      }
    });

    $scope.onRelease = function () {
      // change detected
      $scope.saveNeeded = true;
    };

    $scope.gotoSettings = function (option) {
      $state.go('app.settings.' + option);
    };

    $scope.changeUserProfile = function () {
        
      $scope.user_data.dob = moment($scope.user_data.dob).format("YYYY-MM-DD");

      SettingsSvc
        .changeUserProfile($scope.user_data)
        .then(function (promise_ok) {
            if(promise_ok.data && promise_ok.data.success === true){
                $scope.saveNeeded = false;
                SettingsSvc.persistLocalProfileData($scope.user_data);
                $scope.screen_message = "";
            }
        }, function (promise_error) {
            $scope.user_data = $scope.oldUserData;
            console.error('An error happened saving the user configuration', promise_error);
        });
    };

  });