"use strict";

angular
  .module('callpal.login', [
    'ionic',
    'base64',
    'ngCordova'
  ])

  .config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider

      .state('login', {
        url: "/login",
        templateUrl: "./app/Login/Templates/Login.html",
        controller: 'LoginCtrl'
      })

      .state('facebookoauthcallback', {
        url: "/facebookoauthcallback",
        templateUrl: "./app/Login/Templates/LoginFacebookCallback.html"
      })
    ;

  })
;
