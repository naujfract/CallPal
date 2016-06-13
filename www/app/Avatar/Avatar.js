"use strict";

angular
  .module('callpal.avatar', [
    'ionic'
  ])

    .config(function ($stateProvider) {


      $stateProvider
          .state('app.avatar', {
            url: "/avatar",
            templateUrl: "app/Avatar/Templates/avatar.html",
            controller: 'AvatarCtrl'
          })

    })

;
