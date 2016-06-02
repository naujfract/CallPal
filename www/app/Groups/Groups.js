"use strict";

angular
    .module('callpal.groups', [
      'ionic',
      'datePicker'
    ])

    .config(function ($stateProvider) {
      $stateProvider
          .state('app.groups-create', {
            url: "/groups/create",
            cache: false,
            params: {
              group: null
            },
            templateUrl: "app/Groups/Templates/GroupsCreate.html",
            controller: 'GroupsCtrl'
          })
          .state('app.groups-save', {
            url: "/groups/save",
            cache: false,
            params: {
              group: null
            },
            templateUrl: "app/Groups/Templates/GroupsCreateModalSetup.html",
            controller: 'GroupsCtrl'
          })
          .state('app.groups-show', {
            url: "/groups/show",
            cache: false,
            params: {
              group: null
            },
            templateUrl: "app/Groups/Templates/GroupsShow.html",
            controller: 'GroupsCtrl'
          })

    })
;
