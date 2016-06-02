'use strict';

angular
  .module('callpal.tellafriend')
  .controller('TellAFriendCtrl', TellAFriendCtrl);

function TellAFriendCtrl($scope, $timeout, $ionicPlatform, TellafriendSvc, ionicToast, $ionicPopup, $state, $stateParams, Utils, $translate, Permission) {
  $scope.invite = invite;

  // If user has not shared with 10 friends && talkTime>5min, show popup
  if ($stateParams.showFiveMinutePopup) {
    showFiveMinutePopup();
  }

  $scope.select = {
    all: false
  };


  // Show the indicator list contact not found after a few seconds.
  $timeout( function() {
    if ($scope.tell_a_friend.friends.length == 0) {
      $scope.contacts_found = false;
    }
  }, 200);





  $scope.toggleSelection = function (selection) {

    if (selection !== undefined)
      $scope.select.all = selection;

    $scope.tell_a_friend.friends.forEach(function (contact, index) {
      $scope.tell_a_friend.friends[index].checked = $scope.select.all;
    });

  };



  // Selection


  //////////////////////

  function showFiveMinutePopup() {
    $ionicPopup.alert({
      title: $translate.instant('w_tell_a_friend.title'),
      template: $translate.instant('w_tell_a_friend.mandatory_invitation')
    });
    var requireTenInvitations = true;
  }

  // add selected users to array and call service to send sms
  function invite() {

    var selected = [],
        minimun_contacts = 10;

    $scope.tell_a_friend.friends.forEach(function (contact) {
      if (contact.checked) {
        selected.push(contact);
      }
    });

    // TODO: check if sent in silent mode on android
    if (selected.length) {
        
      Permission.request(['SEND_SMS']).then(function(wereGranted){
          if(wereGranted){
                if (typeof requireTenInvitations !== 'undefined' && requireTenInvitations === 'true' && selected.length < 10) {
                  ionicToast.show($translate.instant('w_tell_a_friend.mandatory_invitation', { contacts: minimun_contacts }), 'bottom', false, window.config.timeDisplayingToasts);
                }
                if (ionic.Platform.isAndroid()) { // show confirm popup on android
                  $ionicPopup.confirm({
                    title: $translate.instant('w_tell_a_friend.title'),
                    template: $translate.instant('w_tell_a_friend.confirmation')
                  })
                  .then(function (res) { // confirm send invitation on adroid
                    if (res) {
                      TellafriendSvc.gossipWithFriends(selected);
                      // TODO move bottom to then function after message sent success
                        $scope.toggleSelection(false);
                    }
                  });
                } else if (ionic.Platform.isIOS()) { // if ios
                  TellafriendSvc.gossipWithFriends(selected);
                  // TODO move bottom to then function after message sent success
                    $scope.toggleSelection(false);
                }
            }else{
                ionicToast.show($translate.instant('w_general_actions.non_authorized_permission'), 'bottom', false, window.config.timeDisplayingToasts);
            }
      }, function(error){
          console.error(error);
      });
      
    } else { // if none selected, show toast
      ionicToast.show($translate.instant('w_tell_a_friend.at_least_one'), 'bottom', false, window.config.timeDisplayingToasts);
    }
  };

  // Search

  $scope.search = {

    query: "",
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
    }

  };

  // Register BACK button action
  var backButtonBehav = $ionicPlatform.registerBackButtonAction(function(event) {
      $state.go('app.country');
  }, 100);
  //Then when this scope is destroyed, remove the function
  $scope.$on('$destroy', backButtonBehav);

}
