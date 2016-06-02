"use strict";

angular
  .module('callpal.nest', [
    'ionic',
    'ngCordova'
  ])

  .config(function ($stateProvider) {

    $stateProvider

      .state('nest-home', {
        url: "/nest-home",
        cache: false,
        templateUrl: "./app/Nest/Home/Templates/Home.html",
        controller: 'NestHomeCtrl'
      })

    ;

  })
;
