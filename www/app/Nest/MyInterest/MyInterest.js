"use strict";

angular
  .module('callpal.nest.myinterest', [
    'ionic',
  ])

  .config(function ($stateProvider) {

    $stateProvider

      .state('nest-myinterest', {
        url: "/nest-myinterest",
        cache: false,
        templateUrl: "./app/Nest/MyInterest/Templates/MyInterest.html",
        controller: 'NestMyInterestCtrl'
      })

    ;

  })
;
