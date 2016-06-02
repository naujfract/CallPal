"use strict";

angular
  .module('callpal.tellafriend', [
    'ionic',
    'ionic-toast'
  ])

  .config(function ($stateProvider) {

    $stateProvider
      .state('app.tellafriend', {
        url: "/tellafriend",
        //cache: false,
        templateUrl: 'app/TellAFriend/TellAFriend.html',
        controller: 'TellAFriendCtrl',
        params: { 'showFiveMinutePopup': false }
      })

  })
  .run(runBlock);

function runBlock(TellafriendSvc) {
  //TellafriendSvc.checkUserInvitations();
}
