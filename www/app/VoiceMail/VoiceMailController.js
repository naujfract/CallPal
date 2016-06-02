'use strict';

angular
  .module('callpal.voicemail')
  .controller('VoiceMailCtrl', ['ContactsSvc', '$ionicPopup', '$state', '$q', '$scope', 'VoiceMailSvc', '$ionicLoading', 'AudioRecordService', '$ionicPlatform', 'Utils', 'ionicToast', '$translate', VoiceMailCtrl]);

function VoiceMailCtrl(ContactsSvc, $ionicPopup, $state, $q, $scope, VoiceMailSvc, $ionicLoading, AudioRecordService, $ionicPlatform, Utils, ionicToast, $translate) {

  $scope.refresh = function () {
    VoiceMailSvc.get().then(function (voiceMailResp) {
        VoiceMailSvc.prepareVoiceMailList(voiceMailResp); // set an audio object for every voicemail in the list
    }, function () {
      ionicToast.show($translate.instant('w_contacts.load_error'), 'bottom', false, window.config.timeDisplayingToasts);
    }).finally(function(){
        $scope.voiceMailResp = VoiceMailSvc.getVoiceMailResp();
        $ionicLoading.hide();
        $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.callContact = function (voiceMail) {
    var contact = ContactsSvc.find_by_extension(voiceMail.caller_id_number);
    if(!contact){//then is a callpal member
        contact = {
            displayName: voiceMail.name,
            landline_number: voiceMail.phone_prefix + voiceMail.phone,
            extension: voiceMail.caller_id_number,
            phoneNumbers: [
                { number: voiceMail.phone_prefix + voiceMail.phone }
            ]
        };
    }
    $state.go('callpal', {'members': [contact], video_enabled: false });
  };

  $scope.reproduce = function(voiceMail) {
    // stop all audios when begin one
    VoiceMailSvc.audios.stop();
    $ionicLoading.show();

    VoiceMailSvc.storage().exists(voiceMail)
      .then(function(suc) {
        if (suc) {
          voiceMail.audio.start(voiceMail.path, voiceMail.length);
        } else {
          reproduceAndDownloadVoiceMail(voiceMail);
        }
      }, function(err) {
        console.error(err);
        VoiceMailSvc.errorAlert(err);
      });
  }

  var reproduceAndDownloadVoiceMail = function(voiceMail) {
    VoiceMailSvc
      // download the file
      .downloadVoiceMail($scope.voiceMailResp.auth_token, voiceMail.media_url, voiceMail.media_id)
       //save in file system
      .then(VoiceMailSvc.saveFileSystemVoiceMail)
      // save and reproduce audio
      // start reproducing
      .then(function(localURL) {
        VoiceMailSvc.storage().save(voiceMail, localURL);
        voiceMail.audio.start(localURL, voiceMail.length);
      })
      .catch(function(err) {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: 'Error',
          template: err.message
        });
      });
  }

  $scope.startRecording = function () {
    var deferred = $q.defer();
    var filename = AudioRecordService.start(deferred);

    filename.then(function(suc) {
      //var object = new Media(cordova.file.externalApplicationStorageDirectory + 'voice_mail/' + suc, null, null, null);
      //object.play();
      console.log(suc);
    });
  };

  $scope.deleteVoiceMail = function (voiceMail) {
    VoiceMailSvc.deleteVoiceMail(voiceMail)
      .then(function (suc) {
        ionicToast.show($translate.instant('w_voice_mail.delete_one_ok'), 'bottom', false, window.config.timeDisplayingToasts);
        $scope.voiceMailResp.data.splice(VoiceMailSvc.getVoiceMailIndex($scope.voiceMailResp.data, voiceMail), 1);
      }, function (err) {
        if (err) {
          ionicToast.show($translate.instant('w_voice_mail.delete_one_error'), 'bottom', false, window.config.timeDisplayingToasts);
        }
      });
  };

  $scope.deleteAll = function () {
    var confirmPopup = $ionicPopup.confirm({
      title: $translate.instant('w_voice_mail.delete_all_title'),
      template: $translate.instant('w_voice_mail.delete_all_text')
    });

    confirmPopup.then(function(confirmed) {
      if (confirmed) {
        $ionicLoading.show();
        VoiceMailSvc.deleteAll($scope.voiceMailResp.data)
          .then(function () {
              $ionicLoading.hide();
              ionicToast.show($translate.instant('w_voice_mail.delete_all_ok'), 'bottom', false, window.config.timeDisplayingToasts);
              $scope.voiceMailResp.data = [];
          }, function () {
              $ionicLoading.hide();
              ionicToast.show($translate.instant('w_voice_mail.delete_all_error'), 'bottom', false, window.config.timeDisplayingToasts);
          })
      }
    });
  };

  $scope.$on('$ionicView.leave', function () {
    VoiceMailSvc.audios.stop();
  });

  $scope.$on('$ionicView.enter', function () {
    if (! VoiceMailSvc.getVoiceMailResp()) {
      $ionicLoading.show();

      $scope.$watch('VoiceMailSvc.getVoiceMailResp()', function (newValue) {
        $scope.voiceMailResp = newValue;
        $ionicLoading.hide();
      });
    } else {
      $scope.voiceMailResp = VoiceMailSvc.getVoiceMailResp();
    }
  });


  // Register BACK button action
  var backButtonBehav = $ionicPlatform.registerBackButtonAction(function(event) {
      $state.go('app.country');
  }, 100);
  //Then when this scope is destroyed, remove the function
  $scope.$on('$destroy', backButtonBehav);

  $scope.search = {
    query: {},
    isEnabled: false,

    enable: function (inputSearchId) {
      this.query = "";
      this.isEnabled = true;
        Utils.showKeyboard(inputSearchId);
    },

    disable: function () {
      this.query = "";
      this.isEnabled = false;
        Utils.hideKeyboard();
    },

    if_is_android: function () {
      return !ionic.Platform.isIOS();
    }
  }

}
