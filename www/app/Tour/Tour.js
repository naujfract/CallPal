"use strict";

angular
  .module('callpal.tour', [
    'ionic'
  ])

  .config(function ($stateProvider) {

    $stateProvider
      .state('tour', {
        url: "/tour",
        templateUrl: "app/Tour/Tour.html",
        controller: 'TourCtrl'
      })

  })
;
