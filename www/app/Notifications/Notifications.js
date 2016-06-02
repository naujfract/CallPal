"use strict";

angular
  .module('callpal.notifications', [
    'ionic'
  ])

    .config(function ($stateProvider) {


      $stateProvider
          .state('app.notifications', {
            url: "/notifications",
            templateUrl: "app/Notifications/Templates/NotificationsList.html",
            controller: 'NotificationsCtrl'
          })

    })

;
