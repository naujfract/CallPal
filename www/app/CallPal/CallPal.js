"use strict";

angular
    .module('callpal.callpal', [
      'ionic',
      'angular-md5',
      'angularLazyImg'
    ])

    .config(function ($stateProvider) {
      $stateProvider
          .state('callpal', {
            url: "/callpal",
            cache: true,
            params: {
              members: [],
              group_call: false,
              group_name: "Group call",
              groupExtraMembers: [],
              type: "outgoing",
              video_enabled: false,
              auto_answer: false,
              pause_sip_incoming_call_behavior: false
            },
            onEnter: function($state, Permission, $stateParams, $ionicHistory, $translate, $timeout, $ionicPlatform){

              console.log('stateParams onEnter', $stateParams);

                var history = $ionicHistory.viewHistory();

                if(!history.backView || history.backView.stateName !== "callpal"){
                  $ionicPlatform.ready(function() {
                    Permission.request([
                        'CAMERA',
                        'RECORD_AUDIO',
                        'READ_PHONE_STATE'
                    ])
                    .then(function(wereGranted){
                        if(wereGranted === false){
                            $timeout(function(){
                                alert($translate.instant('w_general_actions.non_authorized_permission'));
                                $ionicHistory.goBack(-1);
                            });
                        }else{
                          Permission.goToState('callpalSuccess', $stateParams);
                        }
                    }, function(error){
                        console.log(error);
                        Permission.goToState('callpalSuccess', $stateParams);
                    });
                  });
                }else{
                    $timeout(function(){
                        $ionicHistory.goBack(-2);
                    });
                }
            }

          })
          .state('callpalSuccess', {
                url: "/callpal",
                cache: false,
                params: {
                  members: [],
                  group_call: false,
                  group_name: "Group call",
                  groupExtraMembers: [],
                  type: "outgoing",
                  video_enabled: false,
                  auto_answer: false,
                  pause_sip_incoming_call_behavior: false
                },
                templateUrl: "app/CallPal/Templates/CallPal.html",
                controller: 'CallPalCtrl'
          });
    })
;
