angular.module('callpal.settings')

.controller('SettingsCtrl', function (CallPalDbSvc, CallSvc, $scope, $state, $window, SettingsSvc, $ionicPopup, MembersDbSvc, CountryCodesSvc, CallsDbSvc, UserSvc, $ionicPlatform, $ionicModal, ionicToast, CameraSvc, UserRemoteSvc, $ionicLoading, Utils, $translate) {

  //console.log("settings controller fired...");

  $scope.changePasswordData = {'old_password': '', 'password': '', 'confirm_password': '', 'req_phone': ''};
  $scope.settingsNotification = {'incomingCallAnimation': '', 'notifyNewVoicemail': '', 'req_phone': ''};

  $scope.debug = window.config.debug;

  //TODO alert dialog (global?)
  $scope.showAlert = function (title, message) {
    var alertPopup = $ionicPopup.alert({
      title: title,
      template: message
    });
    alertPopup.then(function (res) {
      //if not allowed redirect to login
      //$state.go('login');
    });
  };

  // Navigation Control for Settings Section
  $scope.gotoSetting = function (option) {
    $state.go('app.settings.' + option);
  };

  $scope.open_profile_avatar_window = function() {
    $state.go('marketplace');
  };


  // Network Status - Pie Chart Data
  $scope.options = {thickness: 100};

  function humanizeDuration(timeElapseInSeconds, timeMeasures) {

      var duration = moment.duration({s: timeElapseInSeconds}),
           msg = "";

        for(var i = 0; i < timeMeasures.length; i ++){
            var dtn = duration.get(timeMeasures[i].measure);
            if(dtn > 0){
                msg += dtn + ' ' + timeMeasures[i].toDisplay + ' ';
            }
        }

      return msg;
  }

  $scope.loadCountries = function () {

    var total = 0;
    $scope.countries = [];

    CallsDbSvc.get_times().then(function (result) {

        var timeMeasures = [
            { measure: 'hours',   toDisplay: 'hrs' },
            { measure: 'minutes', toDisplay: 'mins' },
            { measure: 'seconds', toDisplay: 'secs' }
        ];

        $scope.out = humanizeDuration(result.outgoing, timeMeasures);
        $scope.cin = humanizeDuration(result.incoming, timeMeasures);
    });

    MembersDbSvc.get_all_grouped_by_country().then(function (result) {
      var countries = Object.keys(result);
      //  get the total
      for (var i in countries) {
        total += result[countries[i]];
      }
      for (var i in countries) {
        var hue = 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')',
          percent = (result[countries[i]] * 100) / total,
          p = percent.toFixed(1);
        $scope.countries.push({label: countries[i], value: p, color: hue, classColor: hue});
      }
    });
  };

  $scope.$on('$ionicView.enter', function (e) {
    $scope.loadCountries();
  });


  $scope.getCountryName = function (country) {
    return CountryCodesSvc.getCountryByAbbv(country).caption;
  };


  // Function to change password
  $scope.changePassword = function () {
    SettingsSvc.changePassword($scope.changePasswordData).then(function (callback) {
        $scope.changePasswordData.old_password = undefined;
        $scope.changePasswordData.password = undefined;
        $scope.changePasswordData.confirm_password = undefined;
        $scope.showAlert($translate.instant('w_settings.options.account_info.password.title'), callback.message);
    }, function(err) {
        if(err.message){
            ionicToast.show(err.message, 'bottom', false, window.config.timeDisplayingToasts);
        }else{
            ionicToast.show($translate.instant("w_settings.options.account_info.password.error", 'bottom', false, window.config.timeDisplayingToasts));
        }
    });
  };

  $scope.logout = function () {
    $window.localStorage.clear();
    CallPalDbSvc.deleteTables();
    //$state.go('login');
    $window.location.reload();
  };


  // fix this
  $scope.$on('$ionicView.beforeLeave', function () {
    CallSvc.stopAudio();
  });  

  // Register BACK button action
  var backButtonBehav = $ionicPlatform.registerBackButtonAction(function(event) {
    if ($state.current.name == 'app.settings.menu') {
      $state.go('app.country');
    } else {
      $state.go('app.settings.menu');
    }
    //console.log($state.current.name);
  }, 100);
  //Then when this scope is destroyed, remove the function
  $scope.$on('$destroy', backButtonBehav);

    $scope.showOptions = false;

    $scope.switchOptions = function(){
        $scope.showOptions = !$scope.showOptions;
    };

    $scope.changeProfileAvatar = function(pictureSourceType){

        $scope.showOptions = false;
        $ionicLoading.show();
        CameraSvc.requestPermisions().then(function(){
            CameraSvc.getPicture(pictureSourceType).then(function(base64){

                $ionicLoading.hide();
                var base64Image = "data:image/jpeg;base64," + base64;

                CameraSvc.cropPicture(base64Image).then(function(canvas){
                    doneAvatarCroping(canvas, base64Image);
                }, function(error){
                    $ionicLoading.hide();
                });
            }, function(){
                $ionicLoading.hide();
            });
        }, function(){
            ionicToast.show($translate.instant('w_settings.camera.permissions_request'), 'bottom', false, window.config.timeDisplayingToasts);
            $ionicLoading.hide();
        });
    };

    function doneAvatarCroping(canvas, base64Image){

        $ionicLoading.show();

      UserRemoteSvc.setUserProfilePhoto(canvas).then(function(avatar){
        $scope.user_data.avatar = base64Image;
        UserSvc.setUserProfilePhoto(avatar + '?' + Utils.getTimeStamp());
        ionicToast.show($translate.instant('w_settings.camera.photo_ok'), 'bottom', false, window.config.timeDisplayingToasts);
        $ionicLoading.hide();
      }, function(error){
        ionicToast.show($translate.instant('w_settings.camera.photo_error'), 'bottom', false, window.config.timeDisplayingToasts);
        $ionicLoading.hide();
      });
    };

    $scope.showProfileAvatar = function(){
    $ionicModal.fromTemplateUrl('app/Settings/Templates/profileavatarmodal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });
  };

    $scope.closeModal = function() {
      $scope.modal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      if ($scope.modal)
        $scope.modal.remove();
    });

});
