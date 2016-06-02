"use strict";

angular
  .module('callpal.home', [
    'ionic'
  ])

  .config(function ($stateProvider) {

    $stateProvider
      .state('app.country', {
        url: "/country",
        cache:false,
        templateUrl: "app/Home/Templates/Home.html",
        controller: 'HomeCtrl'
      })
      .state('app.dialpad', {
        url: "/dialpad",
        templateUrl: "app/Home/Templates/DialPad.html",
        controller: 'DialPadCtrl'
      })

  })
;
