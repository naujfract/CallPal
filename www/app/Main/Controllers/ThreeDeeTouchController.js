'use strict';

angular
    .module('callpal.main')
    .controller('TreeDeeTouchController', TreeDeeTouchController);

function TreeDeeTouchController($state,
                                $ionicPlatform) {


  //3D Touch Preview Working only on IOS
  $ionicPlatform.ready(function () {
    if (window.cordova && window.cordova.plugins && ionic.Platform.isIOS()) {
      if (ionic.Platform.version() >= 9) {
        ThreeDeeTouch.isAvailable(function (avail) {
          ThreeDeeTouch.enableLinkPreview();
          ThreeDeeTouch.configureQuickActions([
            {
              type: 'dialpad', // optional, but can be used in the onHomeIconPressed callback
              title: 'Dial Pad', // mandatory
              subtitle: 'Quickly call pad.', // optional
              iconType: 'Contact' // optional
            },
            {
              type: 'callpal',
              title: 'Call Pal',
              subtitle: 'Call a friend',
              iconType: 'Home'
            },
            {
              type: 'callhilel',
              title: 'Call Hilel',
              iconType: 'Audio'
            },
            {
              type: 'callparronte',
              title: 'Call Pedro Arronte',
              iconType: 'Audio'
            }
          ]);

          ThreeDeeTouch.onHomeIconPressed = function (payload) {
            console.log("Icon pressed. Type: " + payload.type + ". Title: " + payload.title + ".");
            if (payload.type == 'callhilel') {
              var contact = {
                id: '6',
                displayName: 'Hilel Tcherikover',
                phoneNumbers: [{
                  number: '+18452488183',
                  fixed: true,
                }],
                extension: 'US145237992999782038518911152',
                avatar: 'http://cdn.mysitemyway.com/etc-mysitemyway/icons/legacy-previews/icons/blue-jelly-icons-food-beverage/056248-blue-jelly-icon-food-beverage-egg-sc48.png',
                username: 'htcherikover@callpalapp.net',
                hasSpeedDial: true,
                email: null,
                isFavorite: false,
                isContact: true,
                keepPosted: null,
                ringTone: null,
                country: null
              }
              $state.go('callpal', {members: [contact]});

            } else if (payload.type == 'callparronte') {
              var contact = {
                id: '3',
                displayName: 'Pedro Arronte',
                phoneNumbers: [{
                  number: '+17862664379',
                  fixed: true,
                }],
                extension: 'US145220401191016118181514205',
                avatar: 'http://cdn.mysitemyway.com/etc-mysitemyway/icons/legacy-previews/icons-256/firey-orange-jelly-icons-food-beverage/056608-firey-orange-jelly-icon-food-beverage-egg-sc48.png',
                username: 'parronte@callpalapp.net',
                hasSpeedDial: true,
                email: null,
                isFavorite: true,
                isContact: true,
                keepPosted: null,
                ringTone: null,
                country: null
              }
              $state.go('callpal', {members: [contact]});
            } else if (payload.type == 'dialpad') {
              // hook up any other icons you may have and do something awesome (e.g. launch the Camera UI, then share the image to Twitter)
              //console.log(JSON.stringify(payload));
              $state.go('app.dialpad');
            } else if (payload.type == 'callpal') {
              // hook up any other icons you may have and do something awesome (e.g. launch the Camera UI, then share the image to Twitter)
              //console.log(JSON.stringify(payload));
              $state.go('app.contacts');
            }
          }

          ThreeDeeTouch.watchForceTouches(function (result) {
            console.log("force touch % " + result.force); // 84
            console.log("force touch timestamp " + result.timestamp); // 1449908744.706419
            console.log("force touch x coordinate " + result.x); // 213
            console.log("force touch y coordinate " + result.y); // 41
          });
        });
      }
    }
  });


}
