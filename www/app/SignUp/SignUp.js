"use strict";

angular
  .module('callpal.signup', [
    'ionic'
  ])

  .config(function ($stateProvider) {

    $stateProvider
      .state('signup', {
        url: '/signup',
        controller: 'SignUpCtrl',
        templateUrl: './app/SignUp/Templates/SignUp.html'
      });

  })
;
