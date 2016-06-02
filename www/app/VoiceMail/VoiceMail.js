"use strict";

angular
  .module('callpal.voicemail', [
    'ionic'
  ])
  .config(function ($stateProvider) {
    $stateProvider
      .state('app.voicemail', {
        url: "/voicemail",
        templateUrl: "app/VoiceMail/Templates/VoiceMail.html",
        controller: 'VoiceMailCtrl'
      })
  });
