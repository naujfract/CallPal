"use strict";

angular
    .module('callpal.contacts', [
      'ionic',
      'angular.filter'
    ])

    .config(function ($stateProvider) {

      $stateProvider
          .state('app.contacts', {
            url: "/contacts",
            cache: false,
            params: {
              contact: null
            },
            templateUrl: "./app/Contacts/Templates/Contacts.html",
            controller: 'ContactsCtrl'
          })
          .state('app.contact', {
            url: "/contact",
            params: {
              contact: null,
              sheet: false,
              showCorrectionTool: false,
            },
            cache: false,
            templateUrl: "./app/Contacts/Templates/ContactShow.html",
            controller: 'ContactDetailsCtrl'
          })

    })
;
