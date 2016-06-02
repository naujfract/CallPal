'use strict';

angular
    .module('callpal.callpal')
    .controller('CallPalCtrl', CallPalCtrl);

function CallPalCtrl($scope,
                     $rootScope,
                     $q,
                     $state,
                     $ionicModal,
                     $ionicLoading,
                     CallPalSvc,
                     CallPalFileService,
                     ContactsSvc,
                     Utils,
                     $timeout,
                     $ionicPlatform,
                     $ionicPopup,
                     ionicToast,
                     B2BCallPalSvc,
                     $ionicSlideBoxDelegate,
                     $translate) {


  setTimeout(function() {
    $rootScope.$emit('sip:received_100');
  }, 5000);

  $scope.share_test = window.config.share_enabled;

  $scope.landline = false;
  $scope.group_call = false;
  $scope.showComingSoon = showComingSoon;


  $scope.call = null; // There is not call by default
  $scope.status = $translate.instant('call_history.connecting') + '...'; // No status in the call by default
  $scope.members = [];  // By default the members are empty
  $scope.type = "outgoing"; // Default call type is outgoing

  if($state.params.members[0]){
    $scope.dialedNumber = $state.params.members[0].landline_number || undefined;
  }else {
    $state.go('app.country');
  }


  // Set the members if there is members
  if ($state.params.members.length) {
    $scope.members = $state.params.members;

    // bring the cached avatar
    for (var i in $scope.members) {
      if ($scope.members[i].extension) {
        $scope.members[i].avatar = ContactsSvc.getCachedAvatar($scope.members[i].extension);
      }
    }
  }

  // Set the call type if there is call type
  if ($state.params.type) {
    $scope.type = $state.params.type;
    console.log('The type is : ', $scope.type);

    // if type of call is incoming and is coming from push true
    if ($scope.type == 'incoming' && CallPalSvc.getCurrentCallFromPushStatus() == true) {
      var pushCallTimeout = setTimeout(function() { // start listener for when call connects to cancel end call from push timeout
        $scope.end(); // cancel call after 15 seconds
        ionicToast.show($translate.instant('w_general_actions.call_ended'), 'bottom', false, window.config.timeDisplayingToasts);
      }, 15000);

      $rootScope.$on('call:active', function() { // clear timeout when call connects
        clearTimeout(pushCallTimeout);
      });
    }
  }

  console.log('$state.params', $state.params);


  // Set that is a landline call
  if ($state.params.members[0].landline)
    $scope.landline = true;

  if ($state.params.group_call) {
    $scope.group_call = true;
  }


  // Update call
  if($state.params.auto_answer){
    CallPalSvc.setAutoAnswer($state.params.auto_answer);
  }else{
    CallPalSvc.setAutoAnswer(false);
  }

  $scope.callProperties = CallPalSvc.getCall();
  console.log('on load call properties', $scope.callProperties);
  $rootScope.$on('call:update_properties', function (e) {
    $scope.callProperties = CallPalSvc.getCall();
    console.log('call:update_properties', $scope.callProperties);
    console.log('Updating call properties', $scope.callProperties);
  });


  //////////////////////
  function showComingSoon() {
    ionicToast.show('Dialpad coming soon!', 'bottom', false, window.config.timeDisplayingToasts);
  }


  console.log('\n\n\nstate params are: \n\n\n', $state.params);


  $scope.video_camera = {

    enabled: false,

    micActive: true,
    speakerActive: true,

    toggle: function () {
      var self = this;

      CallPalSvc.toggleVideoCamera(!this.enabled).then(function (success) {
        self.enabled = !self.enabled;
        console.log('DEBUG: OK: Tooglering camera OK');
      }, function (error) {
        console.log('DEBUG: ERROR: There is an error');
      });

    },


    isVideoCall: function () {
      return CallPalSvc.isVideoCall();
    },


    isSpeakerActive: function () {
      return CallPalSvc.isSpeakerActive();
    },


    isMicActive: function () {
      return CallPalSvc.isMicActive();
    },


    toggleMic: function () {
      var self = this;
      CallPalSvc.toggleMic(!this.micActive).then(function (succ) {
        self.micActive = !self.micActive;
      }, function (err) {
        console.log('DEBUG: ERR: Error togglering Audio');
      });
    },


    toggleSpeaker: function () {
      var self = this;
      CallPalSvc.toggleSpeaker(!this.speakerActive).then(function (succ) {
        self.speakerActive = !self.speakerActive;
      }, function (err) {
        console.log('DEBUG: ERR: Error togglering Audio');
      });
    },

  };
  // Set if the camera is or not enabled
  if ($state.params.video_enabled) {
    $scope.video_camera.enabled = true;
  }


  // Start Call (for an outgoing call)
  $scope.start = function () {
    console.log('Starting the call with members: ', JSON.stringify($scope.members));
    CallPalSvc.connect($scope.members, null, {
          group_name: $state.params.group_name,
          video_enabled: $state.params.video_enabled,
          group_call: $state.params.group_call,
          group_extra_members: $state.params.groupExtraMembers
        }
    );
  };


  // End Call
  $scope.end = function () {
    $scope.status = 'Disconnecting';
    CallPalSvc.setAutoAnswer(false);
    B2BCallPalSvc.get_all_from_database()
      .then(function(sccs){
        console.log('get_all_from_database', sccs);
      }, function(err){
        console.log('get_all_from_database', err);
      })
    if ($scope.call) {
      if ($scope.call.duration >= 120) {
        var maximum = 10;
        var rand = Math.floor((Math.random() * maximum) + 1);
        if (rand == 2) {
          $timeout(function () {
            $scope.rate_call.show();
          }, 1500);
        } else {
          CallPalSvc.disconnect();
        }
      } else {
        CallPalSvc.disconnect();
      }
    } else {
      CallPalSvc.disconnect();
    }
    CallPalSvc.stopRingTones();
  };


  // Accept Call

  $scope.accept = function () {
    console.log('DEBUG: Accepting the call');
    CallPalSvc.accept();
    $scope.callProperties.type = "connected";
    $scope.main.cardsBorder = 'outgoing';
  };

  // Updating Call

  $rootScope.$on('call:update', function (e, call) {
    CallPalSvc.setAutoAnswer($state.params.auto_answer);
    // Set the call for the controller (the call is setted from the service)
    $scope.call = call;
    $scope.status = Utils.timeToSecondAndMinutes(call.duration);

  });

  $rootScope.$on('call:update_display_status', function(e, status) {
    console.log('status is  : ', status);
    $scope.status = status;
  });

  $rootScope.$on('call:notify_second_call', function (e, call) {
    //alert('There is a second call');
  });


  $scope.user_avatar = "./web-assets/img/world.png";
  $scope.defaultAvatar = "./web-assets/img/world.png";
  // Updating Call avatar from the CallPalService
  $rootScope.$on('call:update_avatar', function (e, avatar) {
    console.log('Avatar updated', avatar);
    if (avatar) {
      $scope.user_avatar = avatar
    } else
      $scope.user_avatar = $scope.defaultAvatar;

    //if (avatar != null)
    //setTimeout(function () {
    //  $('#user_avatar').addClass('animated wobble infinite');
    //}, 2000);
  });


  // ----------------------------------------------------------------------
  // Sharing functions
  // ----------------------------------------------------------------------

  $scope.share = {

    file: null,          // File to send
    active: false,
    remoteFile: {},    // The file from the other side
    remoteCard : {},   // The card from the other side
    type: "file",        // Default type share functionallity [file, card]


    enable: function () {
      this.active = true;
      $scope.express.disable();
    },

    disable: function () {
      this.active = false;
    },

    toggle: function () {
      if (this.active)
        this.disable();
      else
        this.enable();
    },

    selectFile: function () {
      $("#file").trigger('click');
    },

    sendFile: function () {
      if (Utils.validateFileExtensionToShare(this.file.name))
        if (Utils.validateFileSize(this.file.size)) {
          ionicToast.show($translate.instant('w_general_actions.sending_file'), 'bottom', false, window.config.timeDisplayingToasts);
          CallPalFileService.transmit({type: "file", file_data: this.file});
        }
        else
          ionicToast.show($translate.instant('f_files.too_big'), 'bottom', false, window.config.timeDisplayingToasts);
      else
        ionicToast.show($translate.instant('f_files.invalid_extension'), 'bottom', false, window.config.timeDisplayingToasts);
    },


    shareCard: function () {
      var currentCard = $scope.main.cards[$ionicSlideBoxDelegate.$getByHandle('cardsSlide').currentIndex()];
      CallPalFileService.transmit({type: "card", card_data: currentCard});
    },


    acceptRemoteElement: function () {
      $('#accept-file').removeClass('show');
      $('#accept-file').addClass('hide');
      if (this.type == "file") {
        if (this.remoteFile) {
          console.log('Accepting the remote file', this.remoteFile.location);
          CallPalFileService.downloadFile(this.remoteFile);
        }
        else
          ionicToast.show('An error happened when trying to download the file', 'bottom', false, window.config.timeDisplayingToasts);
      }

      if (this.type == "card") {
        // NOTE: for David from Juan | Use this.remoteCard to get the card from here
        //$('#remoteCardThumbnail').attr('src', this.remoteCard.media_image_mobile);
        $scope.main.add_shared_card(this.remoteCard);
      }
    },


    rejectRemoteElement: function () {
      $('#accept-file').removeClass('show');
      $('#accept-file').addClass('hide');
    },

  };

  // Send the file after is loaded in the file input type
  Utils.delay(4000).then(function () {
    var domFile = document.getElementById('file');
    if (domFile) {
      domFile.onchange = function (event) {
        //sumale + 20 sec al time
        $scope.share.file = event.target.files[0];
        $scope.share.sendFile();
        $scope.share.file = null;
      };
    }
  });

  // Detect new incoming card or file shared from service
  $rootScope.$on('call:shared_element', function (e, options) {

    console.log('\n\nDEBUG: INFO: options on rootScope : ', options);
    console.log('\n\n');

    if (options.type == "shared_card") {
      $scope.share.type = "card";
      $scope.share.remoteCard = options.card_data;
      $('#accept-file').removeClass('hide');
      $('#accept-file').addClass('show');
    }

    if (options.type == "shared_file") {
      $scope.share.type = "file";
      $scope.share.remoteFile = options.file_data
    }

    $('#accept-file').removeClass('hide');
    $('#accept-file').addClass('show');

  });

  // ----------------------------------------------------------------------

  // Add Members
  $scope.addMembers = {

    modal: null,
    search: false,
    query: "",
    list: [],
    init: function () {

      var self = this;
      var deferred = $q.defer();

      $ionicModal.fromTemplateUrl('app/CallPal/Templates/CallPalModalAddMember.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        self.modal = modal;
        deferred.resolve();
      }, function () {
        deferred.reject();
      });

      return deferred.promise;

    },


    open: function (members) {

      var self = this;

      $ionicLoading.show();

      if (this.modal) {
        this.modal.show()
      } else {
        this
            .init()
            .then(function () {
              self.modal.show();
            })
      }

      SpeedDialSvc.getSpeedDialsWithExclusion(members)
          .then(function (contactList) {
            self.list = contactList;
            $ionicLoading.hide();
            // set cached avatar
            for (var i in self.list) {
              if (self.list[i].extension) {
                self.list[i].avatar = ContactsSvc.getCachedAvatar(self.list[i].extension);
              }
            }
          })
    },


    close: function () {

      if (this.modal) {
        this.modal.remove();
        this.modal = null;
        this.disableSearch();
      }

    },
    add: function (contact) {

      var self = this;

      CallPalSvc
          .addMember(contact);

      self.close();

    },
    enableSearch: function () {

      this.search = true;
      this.query = "";

    },
    disableSearch: function () {

      this.search = false;
      this.query = "";

    }
  };

  // ----------------------------------------------------------------------

  // Express
  $scope.express = {

    active: false,

    enable: function () {

      this.active = true;
      $scope.share.disable();

    },

    disable: function () {

      this.active = false;

    },

    toggle: function () {

      if (this.active)
        this.disable();
      else
        this.enable();

    }

  };

  // ----------------------------------------------------------------------

  // Main
  $scope.main = {
    cards: [],
    cardsBorder: '',
    boxActions: {
      show: false,
      class: ''
    },
    activeAction: null,
    actions: null,
    offset: 0,
    interval: null,
    currentCardDate: null,
    cardIntents: 0,

    init: function () {
      var self = this;
      var canvas, stage, exportRoot;

      canvas = document.getElementById("canvas");
    	exportRoot = new lib.Untitled5();

    	stage = new createjs.Stage(canvas);
    	stage.addChild(exportRoot);
    	stage.update();

    	createjs.Ticker.setFPS(lib.properties.fps);
    	createjs.Ticker.addEventListener("tick", stage);

      if ($scope.type == "outgoing") {
        this.cardsBorder = 'outgoing';
        var members = $scope.members;
        if($state.params.group_call)
          members = $state.params.groupExtraMembers;

        B2BCallPalSvc.get_caller_data(members, this.offset)
            .then(function (rps) {
              if(rps)
              {
                var promisesContent = []
                for (var i = 0; i < rps.length; i++) {
                  self.cards.push(rps[i]);
                }
                for (var i = 0; i < rps.length; i++) {
                  promisesContent.push(B2BCallPalSvc.save_on_database(rps[i]));
                }
                $q.all(promisesContent)
                  .then(function(value) {
                    console.log('value', value);
                  });

                  $timeout(function () {

                    $ionicSlideBoxDelegate.$getByHandle('cardsSlide').update();
                    self.currentCardDate = new Date();

                    self.interval = $timeout(function () {

                      $ionicSlideBoxDelegate.$getByHandle('cardsSlide').next();
                    }, rps[0].duration_impressions * 1000);
                    $('.button.express, .button.nest').removeClass('disabled');
                  }, 100);
                  self.cardIntents = 0;

              }else{
                if (self.cardIntents < 3) {
                  self.init();
                  self.cardIntents++;
                }else if(self.cardIntents >= 3){
                  console.log("Finishing call cause not content available", self.cardIntents);
                  $scope.end();
                }

              }
            }, function (err) {
              console.log(err);
            });
      } else if ($scope.type == "incoming") {
        B2BCallPalSvc.get_callee_data($scope.members, this.offset)
            .then(function (rps) {
              if(rps)
              {
                var promisesContent = []
                for (var i = 0; i < rps.length; i++) {
                  self.cards.push(rps[i]);
                }

                for (var i = 0; i < rps.length; i++) {
                  promisesContent.push(B2BCallPalSvc.save_on_database(rps[i]));
                }

                $q.all(promisesContent)
                  .then(function(value) {
                    console.log('value', value);
                  });

                $timeout(function () {
                  $ionicSlideBoxDelegate.$getByHandle('cardsSlide').update();
                  self.currentCardDate = new Date();
                  self.interval = $timeout(function () {
                    $ionicSlideBoxDelegate.$getByHandle('cardsSlide').next();
                  }, rps[0].duration_impressions * 1000);
                  $timeout(function () {
                    $('.button.express, .button.nest').removeClass('disabled');
                  }, 0);
                }, 100);
                self.cardIntents = 0;
              }else{
                if (self.cardIntents < 3) {
                  self.init();
                  self.cardIntents++;
                }else if(self.cardIntents >= 3){
                  console.log("Finishing call cause not content available", self.cardIntents);
                  $scope.end();
                }

              }

            }, function (err) {
              console.log(err);
            });
      }

    },

    card_express_actions: function (type) {
      var self = this;
      var Seconds_Between_Dates = null;

      $timeout.cancel(self.interval);

      if (self.activeAction && self.activeAction != type) {
        this.hide_actions_container().then(function () {

          Seconds_Between_Dates = Math.ceil((new Date().getTime() - self.currentCardDate.getTime()) / 1000);

          self.actions = B2BCallPalSvc.get_expressions();

          self.interval = $timeout(function () {

            self.interval = $timeout(function () {
              $ionicSlideBoxDelegate.$getByHandle('cardsSlide').next();
            }, (self.cards[$ionicSlideBoxDelegate.currentIndex()].duration_impressions * 1000) - (Seconds_Between_Dates * 1000 ));

            self.toggle_actions(type);
          }, 5000);

          self.toggle_actions(type);
        });
      } else {
        if (!this.boxActions.show) {

          Seconds_Between_Dates = Math.ceil((new Date().getTime() - self.currentCardDate.getTime()) / 1000);

          self.actions = B2BCallPalSvc.get_expressions();

          self.interval = $timeout(function () {

            self.interval = $timeout(function () {
              $ionicSlideBoxDelegate.$getByHandle('cardsSlide').next();
            }, (self.cards[$ionicSlideBoxDelegate.currentIndex()].duration_impressions * 1000) - (Seconds_Between_Dates * 1000 ));

            self.toggle_actions(type);
          }, 5000);

          self.toggle_actions(type);
        } else {
          self.toggle_actions(type);
        }
      }
    },

    card_share_actions: function (type) {
      var self = this;

      $timeout.cancel(self.interval);

      if (self.activeAction && self.activeAction != type) {
        this.hide_actions_container().then(function () {
          self.actions = B2BCallPalSvc.get_share_actions();
          self.toggle_actions(type);
        });
      } else {
        if (!this.boxActions.show) {
          this.actions = B2BCallPalSvc.get_share_actions();
          self.toggle_actions(type);
        } else {
          self.toggle_actions(type);
        }
      }

    },

    hide_actions_container: function () {

      var deferred = $q.defer();

      var self = this;

      self.toggle_actions(type);

      setTimeout(function () {

        deferred.resolve();

      }, 500);

      return deferred.promise;

    },

    get_next_slide: function (index) {
      var self = this;

      B2BCallPalSvc
        .remove_from_database(this.cards[index - 1])
        .then(function(sccs){
          console.log('remove_from_database', sccs);
        }, function(err){
          console.log('remove_from_database', err);
        })

      $timeout.cancel(self.interval);
      self.currentCardDate = new Date();

      self.interval = $timeout(function () {
        $ionicSlideBoxDelegate.$getByHandle('cardsSlide').next();
      }, this.cards[index].duration_impressions * 1000);

      var difference = Math.abs(this.cards.length - index);



      if (difference == 3) {
        this.offset = this.offset + 10;
        B2BCallPalSvc.get_caller_data($scope.members, this.offset)
            .then(function (rps) {
              var promisesContent = [];
              if (self.cards.length >= 20) {
                self.cards = [];
                for (var i = 0; i < rps.length; i++) {
                  self.cards.push(rps[i]);
                }

                for (var i = 0; i < rps.length; i++) {
                  promisesContent.push(B2BCallPalSvc.save_on_database(rps[i]));
                }

                $q.all(promisesContent)
                  .then(function(value) {
                    console.log('value', value);
                  });
                $timeout(function () {
                  $ionicSlideBoxDelegate.$getByHandle('cardsSlide').update();
                }, 100);
                $ionicSlideBoxDelegate.$getByHandle('cardsSlide').slide(0);
              }else{
                for (var i = 0; i < rps.length; i++) {
                  self.cards.push(rps[i]);
                }
                $timeout(function () {
                  $ionicSlideBoxDelegate.$getByHandle('cardsSlide').update();
                }, 100);
              }

            }, function (err) {
              console.log(err);
            });
      }
    },

    add_shared_card: function(card)
    {
      var self = this;
      $timeout.cancel(self.interval);
      var position = $ionicSlideBoxDelegate.$getByHandle('cardsSlide').currentIndex() + 1;
      self.currentCardDate = new Date();
      self.cards.splice(position, 0, card);
      $timeout(function () {
        $ionicSlideBoxDelegate.$getByHandle('cardsSlide').update();
      }, 100);
      $ionicSlideBoxDelegate.$getByHandle('cardsSlide').next();
    },

    toggle_actions: function (type) {
      if (!this.boxActions.show) {
        this.boxActions.class = 'active';
        this.boxCardsClass = 'blur';
        this.boxActions.show = true;
        this.activeAction = type;
      } else {
        this.boxActions.class = '';
        this.boxCardsClass = '';
        this.boxActions.show = false;
        this.activeAction = '';
      }
    }
  };


  //------------------------------------------------

  // Rate calls
  // Set the rate and max variables
  $scope.rate = 0;
  $scope.max = 5;
  var active_call = null;
  $scope.rate_call = {

    modal: null,

    init: function () {

      var self = this;

      $ionicModal.fromTemplateUrl('app/CallPal/Templates/RateCallModal.html', {

        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        self.modal = modal;
      });

    },

    show: function () {

      var self = this;

      active_call = $scope.call;
      this.modal.show();

    },

    hide: function () {

      this.modal.hide();
      CallPalSvc
          .disconnect();

    },

    rate: function (points) {

      var sendRating = CallPalSvc.rate_call(points);

      sendRating.then(function (response) {
        //console.log(response);
        $scope.rate_call.hide();
      }, function (response) {
        //console.log(response);
        $scope.rate_call.hide();
      });
    }
  };

  // Initialize the rating call when the CallPalCtrl is initialized
  $scope.rate_call.init();

  $scope.hideModalRate = function () {
    $scope.rate_call.hide();
  };

  // ----------------------------------------------------------------------

  // Manage actions in the call screen
  $scope.manage_actions = {

    send: function (action) {
      switch (action.type) {
        case 'express':
          B2BCallPalSvc.send_express(action, $scope.main.cards[$ionicSlideBoxDelegate.currentIndex()])
              .then(function (rps) {
                $ionicSlideBoxDelegate.$getByHandle('cardsSlide').start();
                $scope.main.toggle_actions('express');
              }, function (err) {
                console.log(err);
              });
          break;
        case 'share':
          if (action.id == "doc") {
            $scope.share.shareCard();
          }
          if (action.id == "cam") {
            $scope.share.selectFile();
          }
          if (action.id == "roll") {
            $scope.share.selectFile();
          }

          $scope.main.toggle_actions('share');

          var Seconds_Between_Dates = Math.ceil((new Date().getTime() - $scope.main.currentCardDate.getTime()) / 1000);
          $scope.main.interval = $timeout(function () {
            $ionicSlideBoxDelegate.$getByHandle('cardsSlide').next();
          }, ($scope.main.cards[$ionicSlideBoxDelegate.currentIndex()].duration_impressions * 1000) - (Seconds_Between_Dates * 1000 ));

        break;
      }
    },

    save_on_nest: function () {
      $timeout.cancel($scope.main.interval);
      if ($scope.main.activeAction && $scope.main.activeAction != 'nest') {
        $scope.main.hide_actions_container().then(function () {

          self.actions = B2BCallPalSvc.get_share_actions();

          $scope.main.actions = [
            {type: 'nest'}
          ];

          $scope.main.toggle_actions('nest');

          B2BCallPalSvc.save_on_nest($scope.main.cards[$ionicSlideBoxDelegate.currentIndex()])
              .then(function (rps) {
                console.log('save_on_nest', rps);
                $timeout(function () {
                  $scope.main.toggle_actions('nest');
                  $ionicSlideBoxDelegate.$getByHandle('cardsSlide').next();
                }, 1500);
              }, function (err) {
                console.log(err);
                $timeout(function () {
                  $scope.main.toggle_actions('nest');
                  $ionicSlideBoxDelegate.$getByHandle('cardsSlide').next();
                }, 1500);
              });
        });
      } else {
        $scope.main.actions = [
          {type: 'nest'}
        ];

        $scope.main.toggle_actions('nest');

        B2BCallPalSvc.save_on_nest($scope.main.cards[$ionicSlideBoxDelegate.currentIndex()])
            .then(function (rps) {
              console.log('save_on_nest', rps);
              $timeout(function () {
                $scope.main.toggle_actions('nest');
                $ionicSlideBoxDelegate.$getByHandle('cardsSlide').next();
              }, 1500);
            }, function (err) {
              console.log(err);
              $timeout(function () {
                $scope.main.toggle_actions('nest');
                $ionicSlideBoxDelegate.$getByHandle('cardsSlide').next();
              }, 1500);
            });
      }

      /*B2BCallPalSvc.save_on_nest($scope.main.cards[$ionicSlideBoxDelegate.currentIndex()])
       .then(function(rps){
       console.log(rps);
       }, function(err){
       console.log(err);
       });*/
    },
  }

  // ----------------------------------------------------------------------

  if (!$scope.members.length)
    $scope.end();
  else if ($scope.type == "outgoing" || $scope.type == "incoming") {
    $scope.main.init();
  }

  if ($scope.type == "outgoing") {
    $scope.start();
  }

  // ----------------------------------------------------------------------

  var backIntents = 0;
  var back_alert = null;

  // Register BACK button action
  var backButtonBehav = $ionicPlatform.registerBackButtonAction(function (event) {
    if ($state.current.controller == 'CallPalCtrl') { // your check here
      backIntents++;
      if (backIntents >= 3) {
        if (!back_alert) {
          back_alert = $ionicPopup.confirm({
            title: $translate.instant('w_general_actions.warning'),
            template: $translate.instant('call_history.end_call_confirmation'),
            hardwareBackButtonClose: false
          }).then(function (res) {
            if (res) {
              backIntents = 0;
              $scope.end();
            }
          })
        }
      }
    }
  }, 600);
  //Then when this scope is destroyed, remove the function
  $scope.$on('$destroy', backButtonBehav);

}
