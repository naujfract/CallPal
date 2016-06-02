"use strict";

angular
    .module('callpal.contacts')
    .controller('ContactsCtrl', ContactsCtrl);


function ContactsCtrl($state, $scope, $ionicPlatform, $timeout, Utils, ContactsSvc, $ionicHistory) {

  //----------------------------

  // don't remove this code from here
  //$ionicHistory.clearCache();
  $ionicHistory.clearHistory();

  //ContactsSvc.try_update_contacts();

  $scope.contacts.call = function (contact, data) {
    contact.landline = false; // Reset landline
    if (contact.hasSpeedDial && contact.phoneNumbers.length == 1) {
      contact.landline = true;
      contact.landline_number = contact.phoneNumbers[0].number;
      $state.go('callpal', {members: [contact]});
    }
    else if (contact.phoneNumbers.length == 1)
      $state.go('app.contact', {contact: contact, showCorrectionTool: true});
    else
      $state.go('app.contact', {contact: contact});

  };

  // Call directly to the contact using callpal
  $scope.contacts.callpal = function (contact, data) {

    $scope.removeAnimations();
    contact.landline_number = null;
    contact.landline = false;

    if (data == "video")
      $state.go('callpal', { members: [contact], video_enabled: true });
    else
      $state.go('callpal', { members: [contact], video_enabled: false });

  };


  $scope.open_contact = function (contact) {

    //console.log('contact is : ', contact);
    $state.go('app.contact', {contact: contact});

  };


  $scope.contacts.open_groups = function () {

    $state.go("app.groups-create");

  };


  $scope.goToContactWithOptions = function (contact) {
    $state.go('app.contact', {contact: contact, sheet: true});
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
    },

    if_is_android: function () {
      return !ionic.Platform.isIOS();
    },

    notEmpty: function(contact) {
      return true
    }

  };

  // Speech Recognition

  if (typeof SpeechRecognition !== 'undefined') {
    $scope.voiceRecognition = new SpeechRecognition();
    $scope.voiceRecognition.onresult = function (e) {
      if (e.results.length > 0)
        if ($scope.search.isEnabled) {
          $scope.search.query = e.results[0][0].transcript;
          $scope.$apply();
        }
    }
  }

  // Show the indicator list contact not found after a few seconds.
  $timeout(function () {
    if ($scope.contacts.list.length == 0) {
      $scope.contacts_found = false;
    } else {
      $scope.contacts_found = true;
    }
  }, 3000);


  // Back button behaviors
  /*$ionicPlatform.onHardwareBackButton(function (event) {
      event.preventDefault();
      $scope.details.hide();
  });*/


  // Back button behaviors


  var backButtonBehav = $ionicPlatform.registerBackButtonAction(function (event) {
      //$scope.removeAnimations();
      console.log('registerBackButtonAction');
      $state.go('app.country');
  }, 100);
  //Then when this scope is destroyed, remove the function
  $scope.$on('$destroy', backButtonBehav);

  /*$scope.$on('$ionicView.leave', function () {
    $scope.setMissingCallNotNotified(0);
    $localstorage.set('missingCallNotNotified', 0);
  });*/


}
