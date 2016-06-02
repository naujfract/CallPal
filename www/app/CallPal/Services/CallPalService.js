'use strict';


/**
 * Callpal LLC
 * Please DO NOT Touch this file at least you know what are you doing.
 * For questions ask to Juan Ricardo | jricardo@callpalapp.net
 *
 */


angular
    .module('callpal.callpal')
    .factory('CallPalSvc', CallPalSvc);

function CallPalSvc(ContactsSvc,
                    $q,
                    $rootScope,
                    $timeout,
                    $interval,
                    $ionicHistory,
                    CallPalHistorySvc,
                    $state,
                    SIPService,
                    CallSvc,
                    BlockedContactsSvc,
                    UserSvc,
                    UserRemoteSvc,
                    Utils,
                    $http,
                    AudioMicroSvc,
                    $cordovaVibration,
                    ionicToast,
                    $window,
                    $injector) {



  var NotificationsSvc = $injector.get('NotificationsSvc');
  var remote_user = null;    // The user that is being called
  var videoEnabled = false;  // State for a video call
  var landline_call = false; // State if the call is a landline call
  var group_call = false;    // State if the call is a group call


  var globalAudio = null;
  var active = false; // Flag to see the state of the current call
  var CALL_IS_RUNNING = false; // Save the state if the call is running
  var voice_mail_activated = false;

  var micActive = true;
  var speakerActive = true;

  var ua = null;
  var session = null;
  var session_accepted = false; // Status when the session if accepted
  var config = null;
  var mediaOptions = null;
  var localSpeakerEnabled = true;

  var timer = null;
  var timeout = null;
  var active_call = null;

  var accepted_from_push = false;

  var call = {
    active: false,
    status: "finished", // "connecting" , "connected" , "finished",
    duration: 0,
    date: null,
    type: "outgoing",
    members: []
  };

  var call_type = "NONE";

  var current_call_from_push_status = false;
  var pause_sip_incoming_call_behavior = false;
  var temp_members = [];

  // ---------------------------------------------


  // object for handle the user interaction with ads
  var proximity = {
    'interval': null,

    'begin': function () {
      var _this = this;
      if (ionic.Platform.isAndroid() || ionic.Platform.isIOS()) {
        if (navigator.proximity) {
          navigator.proximity.enableSensor();

          _this.interval = $interval(function () {
            navigator.proximity.getProximityState(function (near) {
              if (near) {
                $cordovaVibration.vibrate(1000);
              }
            });
          }, 1000);
        }
      }
    },
    'end': function () {
      if (ionic.Platform.isAndroid() || ionic.Platform.isIOS()) {
        var _this = this;
        if (navigator.proximity) {
          navigator.proximity.disableSensor();
          $interval.cancel(_this.interval);
        }
      }
    }
  };


  return {


    nativeCall: { // native call status
      RINGING: 0,
      OFFHOOK: 1,
      IDLE: 2,
      status: 2
    },

    setCurrentCallFromPushStatus: function (status) {
      this.current_call_from_push_status = status;
    },

    getCurrentCallFromPushStatus: function () {
      return this.current_call_from_push_status;
    },


    setPauseSipIncomingCallBehavior: function(bool) {
      this.pause_sip_incoming_call_behavior = bool;
    },

    getSipIncomingCallBehaviorPauseState: function() {
      return this.pause_sip_incoming_call_behavior;
    },


    getCall: function () {
      return call;
    },

    setAutoAnswer: function(accepted)
    {
      if (accepted) {
        call.active = true;
      }
      accepted_from_push = accepted;
    },

    isLandLineCall: function() {
      return landline_call;
    },

    setLandLineCall: function(active) {
      landline_call = active;
    },

    setCallRunning: function (active) {
      CALL_IS_RUNNING = active;
    },

    isCallActive: function () {
      return CALL_IS_RUNNING;
    },

    isCallPalCallActive: function () { // TODO same that isCallActive
      return call.active;
    },


    isGroupCallActive: function () {
      return group_call;
    },

    setGroupCallActive: function(active) {
      group_call = active;
    },

    getCallPalCallSession: function () {
      return session;
    },


    isVideoCall: function (videoProperty) {
      return (videoEnabled === "true" || videoEnabled === true || videoProperty === 'true' || videoProperty === true);
    },


    setVideoCall: function (active) {
      videoEnabled = active;
    },


    isMicActive: function () {
      return micActive;
    },

    setMicActive: function (micStatus) {
      micActive = micStatus;
    },

    isSpeakerActive: function () {
      return speakerActive;
    },

    setSpeakerActive: function (speakerStatus) {
      speakerActive = speakerStatus;
    },


    extractMemberPropertiesFromIncommingCall: function (incoming_session) { // Extract properties from Header
      // Process if is a videoCall or a Callpal/Call
      this.setVideoCall(incoming_session.request.getHeader('X-Video-Enabled') || false);
      // Get the extra params of the session
      var remote_user_avatar_img = incoming_session.request.getHeader('X-Avatar') || "";
      var remote_user_phone_number = incoming_session.request.getHeader('X-Number') || "";
      var remote_user_name = incoming_session.request.getHeader('X-Name') || "";
      var remote_user_country = incoming_session.request.getHeader('X-Country') || "";
      var remote_user_fullphone = incoming_session.request.getHeader('X-Fullphone') || "";
      var remote_user_username = incoming_session.request.getHeader('X-Username') || "";
      var remote_user_extension = incoming_session.request.getHeader('X-Extension') || "";

      var member = {};
      member.avatar = remote_user_avatar_img;
      member.phone = remote_user_phone_number;
      member.name = remote_user_name;
      member.country = remote_user_country;
      member.fullphone = remote_user_fullphone;
      member.username = remote_user_username;
      member.extension = remote_user_extension;

      return member;
    },


    init: function () {
      this.sipConstructor();
      //if (!ua) {
      //} else {
      //  console.log('UA Already exists!!');
      //}
    },


    sipConstructor: function () {

      if (SIPService.isConnected(ua)) { // Detect if is connected and registered
        if (accepted_from_push)
          this.accept(); // Accept the call auto
        console.log('DEBUG: INFO: Sip is already connected: ');
      } else {
        console.log('\nDEBUG: INFO: Reconnecting SIP: \n');
        config = SIPService.getConfig();
        mediaOptions = SIPService.getMediaOptions();

        if (!SIPService.isConnected(ua)) {
          ua = new SIP.UA(config);
          ua.start();
          ua.register();
          window.uaobj = ua;
          this.createUserAgentObservers();
        }

      }

    },

    // Close the sip connection
    closeSipConnection: function() {
      console.log('\n\n\nENDING THE SIP CONNECTION\n\n\n');
      //ua.unregister();
      if (ua) {
        ua.unregister();
        //ua.stop();
        //ua.transport.disconnect();
      }
    },


    callRunning: function () { // Returns if the current call is running
      var callRunningResult = (call && call.status != "finished");
      if (callRunningResult) {
        // TODO Notify the incoming call into the screen and inside the notification list
        log('DEBUG: Current call is not finished yet, ending the call');
      }
      return callRunningResult;
    },


    initializeCurrentCallVariables: function () {
      this.setVideoCall(false);
      active = true;                           // there is an active call
      voice_mail_activated = false;            // reset voice_mail activated property
    },


    hideViewModals: function () { // Destroy all modals before the call
      $rootScope.$emit('call:destroy_modals');
    },


    applyiOSPropertiesForCall: function () {
      if (window.cordova) {
        if (ionic.Platform.isIOS()) // Audio on the speaker
          cordova.plugins.iosrtc.selectAudioOutput("speaker");
      }
    },


    isNativeCallManagerRunning: function () {
      var self = this;

      if (self.nativeCall.status != self.nativeCall.IDLE) { // if there is a native call in process
        $rootScope.$emit('call:show_missing_call');
        self.disconnect();
        return true;
      }
      return false;
    },


    launchAppToFront: function () { // Launch the app to the front
      //Utils.delay(1000).then(function () {
          Utils.bringAppToFront();
      //});

    },


    notifyIncomingCall: function (fixed_member) {
      var self = this;

      self.playToneForIncomingCall(fixed_member);
      if (window.cordova) {
        self.launchAppToFront();
      }

      //if (window.cordova) {
      //  self.launchAppToFront();
      //   TODO Keep vibrating!!!
        //Utils.createLocalNotification("976", "Callpal", "New incoming call", {type: "incoming_call"}).then(function (res) {  // Notify screen
        //  self.playToneForIncomingCall(fixed_member);
        //})
      //} else {
      //  self.playToneForIncomingCall(fixed_member);
      //}
    },


    playToneForIncomingCall: function (fixed_member) {
      $timeout(function () {
        CallSvc.playToneIn(fixed_member.username); // Play tone based on username
      }, 1300);
    },


    createIncomingCallAttributes: function (fixed_member) {
      var self = this;

      call.date = new Date();

      var newMember = {
        displayName: fixed_member.name || fixed_member.phone
            , avatar: fixed_member.avatar
          , username: fixed_member.username
          , extension: fixed_member.extension || session.remoteIdentity.uri.user
          , phoneNumbers: [{number: fixed_member.phone}]
      };
      call.members = [newMember];

      if (self.isGroupCallActive()) {
        var groupAsMember = {
          displayName: "Group call"
          , avatar: ""
          , username: ""
          , extension: fixed_member.extension
          , phoneNumbers: [{number: ""}]
        };
        call.members = [groupAsMember];
      }

      call.status = "connecting";
      call.type = "incoming";
    },


    updateAvatarInView: function (fixed_member) {

      console.log('Fixed member: updateAvatarInView, ', fixed_member);

      $timeout(function () {
        $rootScope.$emit('call:update_avatar', fixed_member.avatar);   // Set the avatar of the user
      }, 200);
    },

    // ------------------------------

    createUserAgentObservers: function () {
      var self = this;
      var CallPalFileService = $injector.get('CallPalFileService');

      ua.on('connected', function () {
        log('DEBUG:UA connected.');
      });

      ua.on('registered', function (event) {
        console.log('\n\n\n\n event on registered is : ', event);
        console.log('\n\n\n\n ua on registered is : ', self.ua);

        //if (typeof cordova !== 'undefined')
        //  if (cordova.plugins.backgroundMode.isActive()) {
        //    if (ua) {
        //      ua.unregister();
        //      ua.stop();
        //    }
        //  }

        log('DEBUG:UA registered.');
      });

      ua.on('unregistered', function (event) {
        console.log('\n\n\n\n event on unregistered is : ', event);
        console.log('\n\n\n\n ua on unregistered is : ', self.ua);
        active = false;
        voice_mail_activated = false;
        //proximity.end(); // end vibrating if proximity
        log('DEBUG:UA unregistered.');
        //log('DEBUG: UA connecting againg\n');
        //SIPService.init().then(function () {
        //  self.init();
        //});
        ua = null;
      });

      ua.on('message', function (message) {
        log('DEBUG:UA message received. \n\n', message.body);
        var jMsg = JSON.parse(message.body);

        if (jMsg) {
          if (jMsg.action == "shared_file") {
            var file_data = jMsg.file_data;
            var options = {type: "shared_file", file_data: {location: file_data.location, size: file_data.size}};
            CallPalFileService.notifyElementShared(options);
          }

          if (jMsg.action == "shared_card") {
            var card_data = jMsg.card_data;
            var options = {type: "shared_card", card_data: card_data};
            CallPalFileService.notifyElementShared(options)
          }

          if (jMsg.action == "video_camera_activation") {
            log('DEBUG: INFO : videoCamera activation ?  is: ', cameraActivation);
            var cameraActivation = jMsg.value;
            if (cameraActivation === 'true' || cameraActivation === true)
              self.displayVideoRender();
            else if (cameraActivation === 'false' || cameraActivation === false) {
              self.hideVideoRender();
            }
          }

          if (jMsg.action == "disable_speaker") {
            var speakerActivation = jMsg.value;
            if (speakerActivation === 'true' || speakerActivation === true)
              self.toggleSpeakerFromRemote(true);
            else if (speakerActivation === 'false' || speakerActivation === false) {
              self.toggleSpeakerFromRemote(false);
            }
          }
        }

      });

      ua.on('invite', function (incoming_session) {

        self.session_accepted = false;
        $rootScope.$emit('sip:received_100');

        //if (incoming_session && self.isCallActive()) {
        //  $rootScope.$emit('call:notify_second_call');
        //}

        session = incoming_session; // copy the session
        if (!session) return;

        remote_user = SIPService.getUri(incoming_session.remoteIdentity.uri.user);
        log('DEBUG: UA incoming call --------------------');
        log('DEBUG: Remote user is: ', remote_user);  // user or sip ext
        log('DEBUG: UA incoming call --------------------');

        if (self.callRunning()) // Detect if there is a call already running
          return;

        if (self.isNativeCallManagerRunning()) // Detect if there is a native call running
          return;

        // Apply some call properties and take actions before notify
        self.applyiOSPropertiesForCall();
        self.initializeCurrentCallVariables();
        self.hideViewModals();

        // We start processing the call from here.
        // -------------------------------------------------------------

        // Get remote member that is calling
        var member = self.extractMemberPropertiesFromIncommingCall(incoming_session);
        console.log('\n\n DEBUG: INFO: Member for incoming is: ', member);


        // Handle group calls

        var isGroupCall = incoming_session.request.getHeader('X-Group');
        if (isGroupCall === "true" || isGroupCall === true) {
          console.log('DEBUG: INF. Setting the call as a group call.');
          self.setGroupCallActive(true);
        }
        else
          self.setGroupCallActive(false);


        // Handle normal calls

        if (BlockedContactsSvc.isBlocked(member)) {
          NotificationsSvc.createNewNotifications([{
            additionalData: {
              payload: {
                type: "call_from_blocked_contact",
                displayName: JSON.stringify(member.name + " " + member.phone)
              }
            }
          }]);
          SIPService.endCall(session).then(function(success) {
            session = null;
          }); // Automatically end the clall
          return;
        }


        // Get the fixed name of the remote
        member.name = ContactsSvc.match_member_name(member);

        // Notify the notification bar and tone in
        //self.notifyIncomingCall(member);
        self.createIncomingCallAttributes(member);

        self.events();

        call_type = "INCOMING";

        console.log('DEBUG: CALL INFORMATION BEFORE GO ', call);

        if (accepted_from_push) {
          console.log('accepted_from_push', accepted_from_push);
          self.updateAvatarInView(member);
          self.accept();
          setTimeout(function() {
            $rootScope.$emit('sip:received_100');
          }, 3000);
        } else { // The app is in foreground and is not accepted from push
          if (typeof cordova !== 'undefined') {
            if (!cordova.plugins.backgroundMode.isActive()) {
              console.log('\n\n\n FOREGROUND IS ACTIVE 0000 \n\n\n');
              self.notifyIncomingCall(member);
              self.updateAvatarInView(member);
              $state.go('callpal', call);
              setTimeout(function() {
                $rootScope.$emit('sip:received_100');
              }, 3000);
            }
          } else { // Only for the web
            self.notifyIncomingCall(member);
            self.updateAvatarInView(member);
            $state.go('callpal', call);
            setTimeout(function() {
              $rootScope.$emit('sip:received_100');
            }, 3000);
          }
        }

      });
    },


    sendSipMessage: function (data) {

      // TODO Send the invite to all the members inside the group call
      // TODO if call.is_group_call == true
      // TODO group_members = read_members_from_sqlite
      // TODO foreach current_member in group_members

      if (data.type == "shared_file") {
        var url = data.file_data.url;
        var size = data.file_data.size;
        this.sendMessage(JSON.stringify({action: "shared_file", file_data: {location: url, size: size}}));
      }


      if (data.type == "shared_card") {
        var card_data = data.card_data;
        console.log('DEBUG: INF card_data in sendSipMessageWithSharedCard', card_data);
        this.sendMessage(JSON.stringify({action: "shared_card", card_data: card_data}));
      }

    },


    toggleVideoCamera: function (cameraStatus) {
      var dfd = $q.defer();
      this.setVideoCall(cameraStatus); // change the state inside the service
      this.sendMessage(JSON.stringify({action: "video_camera_activation", value: JSON.stringify(cameraStatus)}));
      // TODO Send the message for all the group
      dfd.resolve('Ok');
      return dfd.promise;
    },


    toggleMic: function (micStatus) {
      this.setMicActive(micStatus);
      var dfd = $q.defer();
      this.sendMessage(JSON.stringify({action: "disable_speaker", value: JSON.stringify(micStatus)}));
      dfd.resolve('Ok');
      return dfd.promise;
    },


    toggleSpeakerFromRemote: function (statusSpeaker) {
      var dfd = $q.defer();
      if (session && statusSpeaker == false) {
        console.log('Enabling audio');
        if (document.getElementById('remoteAudio'))
          document.getElementById('remoteAudio').muted = true;
        if (globalAudio)
          globalAudio.muted = true;
        //this.setSpeakerActive(false);
        console.log('Not audio.');
      } else if (session && statusSpeaker == true) {
        console.log('Disabling audio');
        if (globalAudio)
          globalAudio.muted = false;
        if (document.getElementById('remoteAudio'))
          document.getElementById('remoteAudio').muted = false;
        //this.setSpeakerActive(true);
        console.log('Yes audio.');
      }
      dfd.resolve('Ok');
      return dfd.promise;
    },


    toggleSpeaker: function (statusSpeaker) {
      var dfd = $q.defer();
      if (session && statusSpeaker == false) {
        console.log('Enabling audio');
        if (document.getElementById('remoteAudio'))
          document.getElementById('remoteAudio').muted = true;
        if (globalAudio)
          globalAudio.muted = true;
        this.setSpeakerActive(false);
        console.log('Not audio.');
      } else if (session && statusSpeaker == true) {
        console.log('Disabling audio');
        if (globalAudio)
          globalAudio.muted = false;
        if (document.getElementById('remoteAudio'))
          document.getElementById('remoteAudio').muted = false;
        this.setSpeakerActive(true);
        console.log('Yes audio.');
      }
      dfd.resolve('Ok');
      return dfd.promise;
    },


    isLocalSpeakerEnabled: function (speakerStatus) {
      return (localSpeakerEnabled === "true" || localSpeakerEnabled === true || speakerStatus === 'true' || speakerStatus === true);
    },

    sendMessage: function (message) {
      ua.message(remote_user, message);
    },

    stopRingTones: function () {
      var Ringing = document.getElementById('tone');
      Ringing.currentTime = 0;
      Ringing.pause();
      Ringing.src = "";
    },


    hideVideoRender: function () {
      $('#remoteAudio').removeClass("video-show");
      $('#remoteAudio').removeAttr( "src" );
      $("#user_avatar").addClass('avatar');
      $('#remoteAudio').addClass('video-hide');
    },


    displayVideoRender: function () {
      $('#remoteAudio').removeClass("video-hide");
      $('#remoteAudio').removeClass("video-hide");
      $('#remoteAudio').addClass('video-show');
      $("#user_avatar").removeClass('avatar');

      $timeout(function () {
        console.log('DEBUG: INF: Displaying video ...');
        var videoElem = document.getElementById("remoteAudio");
        if (Array.isArray(window.blobt))
          videoElem.src = window.URL.createObjectURL(window.blobt[0]);
        console.log('Exit from timeout');
      }, 1000);

    },


    voiceMailWasActivated: function (data) { // Detect if the voiceMail was activated

      var self = this;
      console.log('DETERMINATE IF VOICE WAS ACTIVATED', data);

      if (data && data['headers']) {

        var voice_mail_content_length = data['headers']['Content-Length'][0].raw;
        var voice_mail_content_length_numeric = (parseInt(voice_mail_content_length));
        log('DEBUG: INFO: Voicemail voice_mail_content_length_numeric', voice_mail_content_length_numeric);

        // The number should be in the majority of cases 896
        // TODO Do not activate voiceMail groups calls
        if ((voice_mail_content_length_numeric < 1015) && (!call.members[0].landline)) {
          log('DEBUG: INFO The VoiceMail was activated');
          self.sendMissedNotificationForMembers(self.temp_members);
          return true;
        }
        log('DEBUG: INFO: The VoiceMailSuggestion is not active this is a LANDLINE CALL');
        return false;
      }

    },


    // ---------------------------------------------------------------------------------------------------
    // Session events
    // ---------------------------------------------------------------------------------------------------

    events: function () {

      if (!session) return;
      var self = this;

      // session.unhold();
      session.on('accepted', function (data) {

        $rootScope.$emit('sip:received_100');

        self.session_accepted = true;

        log('DEBUG: this session was accepteds!', data);

        // Stop all the ringTones
        self.stopRingTones();

        if (self.voiceMailWasActivated(data)) {
          voice_mail_activated = true;
        }

        self.setCallRunning(true);
        $rootScope.$emit('call:active');

        if (ionic.Platform.isIOS()) {
          if (typeof window.plugins !== 'undefined')
            cordova.plugins.iosrtc.selectAudioOutput("speaker");
        }

        proximity.begin(); // start vibrating when accept the incoming call
        self.__call();

        if (self.isVideoCall()) {
          self.displayVideoRender();
        }

        session.mediaHandler.on('addStream', function (e) {
          globalAudio = new Audio(window.URL.createObjectURL(e.stream));
          console.log('Entering here');
          globalAudio.play();
        });


        // TODO this is only for iOS devices to render videos
        if (window.cordova && window.device.platform === 'iOS') {
          var remoteStreams = session.getRemoteStreams();
          //SIP.WebRTC.MediaStreamManager.render(remoteStreams[0], document.getElementById('remoteAudio'));
          window.blobt = remoteStreams;
          $timeout(function () {
            console.log('DEBUG: INF: Displaying video ...');
            var videoElem = document.getElementById("remoteAudio");
            videoElem.src = window.URL.createObjectURL(window.blobt[0]);
            //videoElem.play();
            console.log('Exit from timeout');
          }, 3000);
        }

      });

      session.on('bye', function () {

        $rootScope.$emit('sip:received_100');
        self.session_accepted = false;
        self.hideVideoRender();
        self.setCallRunning(false);
        self.stopRingTones(); // STOP THE AUDIO
        active = false;
        videoEnabled = false;

        proximity.end(); // end vibrating when one of the user hangup the incoming call
        if (call.duration > 0) {
          self.sendCallTimeToBackend();
        }

        log('DEBUG:SESSION bye');
        if (call.status != "finished") {
          log('DEBUG:SESSION bye -----------------------------------------------------------------------');
          self.disconnect();
        }
      });

      session.on('failed', function (event) {

        $rootScope.$emit('sip:received_100');
        console.log('\n\n\nDEBUG: ERROR This session fail! :( ', event);
        console.log('\n\n\n\n');

        self.session_accepted = false;
        self.hideVideoRender(); // Hide the video
        self.setCallRunning(false);
        self.stopRingTones(); // Stop the audio
        active = false;
        videoEnabled = false;
        //proximity.end(); // end vibrating if proximity
        log('DEBUG: FAIL: Session failed');

        if (call.type != "incoming") { // outgoing call error
          if (event.status_code != 487) { // manually ended
            if (call_type != "INCOMING") {
              console.log('Here i am again ***** call \n\n\n\n', call);
              ionicToast.show(CallSvc.call_errors_parse(event.status_code), 'bottom', false, 4000);
            }
          }
        }

        if (call.type == "incoming" && call.status == "connecting") {
          $rootScope.$emit('call:show_missing_call'); // increment the notification missed call
          // Send a notification to the backend to notify the missed call
          self.sendMissedNotificationForMembers(self.temp_members);
        }
        if (call.status != "finished")
          self.disconnect();
      });

    },


    // ---------------------------------------------------------------------------------------------------
    // Outgoing call
    // ---------------------------------------------------------------------------------------------------

    formRemoteUserSipUri: function (members, number, options) {

      var self = this;
      var member = members[0];
      var user = null;
      self.setLandLineCall(false);
      self.setGroupCallActive(false);

      if (member.extension) { // Call to the extension
        log('DEBUG: INF: Calling to extension ', member.extension);
        user = member.extension;
      }

      if (member.landline) { // Call to land_line number
        log('DEBUG: INF: Calling land_line number ', member.landline_number);
        user = member.landline_number;
        self.setLandLineCall(true);
      }

      if (number) { // Specific number call LandLine
        log('DEBUG: INF: Calling LandLine direct number from DialPad: ', number);
        user = number;
        self.setLandLineCall(true);
      }

      if (options.group_call) {
        self.setGroupCallActive(true);
      }

      return SIPService.getUri(user);

    },


    createOutGoingCallAttributes: function (members, options) {
      call.date = new Date();
      call.members = members;
      call.status = "connecting";
      call.active = true;
      call.group_call = options.group_call;
    },


    notifyOutgoingCall: function (members) {

      // Do not send any push if is a LandLine call
      if (this.isLandLineCall()) {
        return;
      }

      if (this.isGroupCallActive()) {
        this.sendNotificationForMembers($state.params.groupExtraMembers);
      } else {
        this.sendNotificationForMembers(members);
      }
    },


    notifyMissedCall: function (members) {

      // Do not send any push if is a LandLine call
      if (this.isLandLineCall()) {
        return;
      }

      if (this.isGroupCallActive()) {
        this.sendMissedNotificationForMembers($state.params.groupExtraMembers);
      } else {
        this.sendMissedNotificationForMembers(members);
      }
    },


    // Can be applied for one or multiple members
    sendNotificationForMembers: function (groupMembers) {
      var userInfo = UserSvc.getUserInfo();
      groupMembers.forEach(function (m, i, a) {
        if (m.extension != "" && m.extension != null && m.extension != undefined &&
            m.username != "" && m.username != null && m.username != undefined) {

          // Get the phoneNumber of the current member
          var phone_number = "";
          if (Array.isArray(m.phoneNumbers))
            phone_number = m.phoneNumbers[0].number;

          console.log('Notifiying outgoing call inside sendNotificationForMembers');

          NotificationsSvc.notifyOutgoingCall(userInfo.username, // Notify to the other user the outgoing call
              {
                username: userInfo.username, name: userInfo.name
              }, {
                username: m.username || 'Callpal Call',
                name: m.displayName || 'Callpal Call',
                phone_number: phone_number
              }
          );

        }
      });
    },



    // Can be applied for one or multiple members
    sendMissedNotificationForMembers: function (groupMembers) {
      var userInfo = UserSvc.getUserInfo();
      if (Array.isArray(groupMembers)) {
        groupMembers.forEach(function (m, i, a) {
          if (m.extension != "" && m.extension != null && m.extension != undefined &&
              m.username != "" && m.username != null && m.username != undefined) {

            // Get the phoneNumber of the current member
            var phone_number = "";
            if (Array.isArray(m.phoneNumbers))
              phone_number = m.phoneNumbers[0].number;

            console.log('Notifiying outgoing call inside sendNotificationForMembers');

            NotificationsSvc.notifyMissedCall(userInfo.username, // Notify to the other user the outgoing call
                {
                  username: userInfo.username, name: userInfo.name
                }, {
                  username: m.username || 'Callpal Call',
                  name: m.displayName || 'Callpal Call',
                  phone_number: phone_number
                }
            );

          }
        });
      }
    },


    // ---------------------------------------------------------------------------

    // Allows to create the device_username or ext for the user in case does not exists
    validate_and_create_sip_extension: function () {

      var dfd = $q.defer();
      var userInfo = UserSvc.getUserInfo();
      if (!userInfo.device_username) {
        dfd.reject();
        UserSvc.regen_device_sip_extension().then(function (succ) {
          console.log('DEBUG: SUCCESS: RE-CREATING EXTENSIOn FOR USER; ', succ);
        }, function (err) {
          console.log('ERROR RE-CREATING EXTENSION FOR THE USER: ', err);
          dfd.reject();
        });
      }
      else {
        dfd.resolve();
      }
      return dfd.promise;

    },


    connect: function (members, number, options) {

      var self = this;
      self.session_accepted = false;

      self.validate_and_create_sip_extension().then(function (succ) {

        self.temp_members = members;

        var userInfo = UserSvc.getUserInfo();

        videoEnabled = options.video_enabled;

        var uri = self.formRemoteUserSipUri(members, number, options);
        remote_user = uri;

        self.createOutGoingCallAttributes(members, options); // Setting the call information
        self.notifyOutgoingCall(members);

        CallSvc.playOpeningCallTone(); // first tone for outgoing call


        console.log('DEBUG: INF: userInfo.device_username: ', userInfo.device_username);
        UserRemoteSvc.getUserByExtension(userInfo.device_username).then(function (success) {

          if (success) {
            log('DEBUG: AVATAR: ', success.avatar);

            var avatar = success.avatar; // TODO Re-update avatar before send
            var name = userInfo.name;
            var full_phone = userInfo.phone_prefix + userInfo.phone;
            var number = userInfo.phone;
            var country = userInfo.country;
            var username = userInfo.username;
            var extension = userInfo.device_username;

            // Change the name if is a group call
            if ($state.params.group_call) {
              name = $state.params.group_name;
            }

            mediaOptions.extraHeaders = [
              'X-PUSH: yes', // Retry the call
              'X-Video-Enabled: ' + options.video_enabled,
              'X-Sesstype: outgoingcall',
              'X-Avatar: ' + avatar,
              'X-Name: ' + name,
              'X-Number: ' + number,
              'X-Country: ' + country,
              'X-Fullphone: ' + full_phone,
              'X-Username: ' + username,
              'X-Extension: ' + extension,
              'P-Asserted-Identity: ' + full_phone
            ];

            // Set header for group call
            if ($state.params.group_call) {
              mediaOptions.extraHeaders.push('X-Group: true');
              mediaOptions.extraHeaders.push('X-Group-Name: ' + name);
            }
            else {
              mediaOptions.extraHeaders.push('X-Group: false');
            }

            console.log('the mediaOptions are: ', mediaOptions);

            if (ionic.Platform.isIOS()) { // Audio on the speaker
              if (typeof window.plugins !== 'undefined') {
                cordova.plugins.iosrtc.selectAudioOutput("speaker");
              }
            }

            if (options.group_call) {
              mediaOptions.media.constraints.video = false;
              if (ua) {
                self.sendInvite(uri, mediaOptions).then(function (success) {
                  console.log('\n\n\n\n\n current_sess is \n\n\n\n\n', success.session);
                  if (success.session.received_100 === true) {
                    // play the ringtone
                    CallSvc.playToneOut();
                    $rootScope.$emit('call:update_display_status', "Calling to group ...");
                    console.log('received_100 is true');
                    self.events();
                  }
                }, function (err) {
                  ionicToast.show(err, 'bottom', false, window.config.timeDisplayingToasts);
                });
              }
            } else {
              // Real invite for a single call
              mediaOptions.media.constraints.video = true;
              if (ua) {
                self.sendInvite(uri, mediaOptions).then(function (success) {
                  console.log('\n\n\n\n\n current_sess is \n\n\n\n\n', success.session);
                  if (success.session.received_100 === true) {
                    // play the ringtone
                    CallSvc.playToneOut();
                    $rootScope.$emit('call:update_display_status', "Calling ...");
                    console.log('received_100 is true');
                    self.events();
                    call_type = "OUTGOING";
                  }
                }, function (err) {
                  ionicToast.show(err, 'bottom', false, window.config.timeDisplayingToasts);
                });
              }
            }
            //self.events();
          }

        }, function (err) {
          console.log('DEBUG: config there is a problem getUserByExtension, ', err);
        });

        if (window.plugins && !window.config.debug) {
          window.plugins.insomnia.keepAwake();
        }

      }, function (err) {
        // notify the screen
        ionicToast.show("Sorry, there was an error trying to make the call. Please try again.", 'bottom', false, window.config.timeDisplayingToasts);
        self.disconnect();
      });

    },


    // Send the call to the sip infrastructure
    sendInvite: function (uri, mediaOptions) { // promise
      var dfd = $q.defer();
      var self = this;
      session = ua.invite(uri, mediaOptions); // 1st instance all in false
      window.session_call = session;

      if (!session) { // Probably an internal app err
        dfd.reject("App internal error. Please try again.");
        return dfd.promise;
      }

      session.on('progress', function (response) {
        console.log('response change on progress', response);
        if (response.status_code == 100) {
          $rootScope.$emit("sip:received_100");
          dfd.resolve({session: session, response: response});
        }

        if (response.status_code == 180 || response.status_code == 181 || response.status_code == 182 || response.status_code == 183) {
          $rootScope.$emit("sip:received_100");
          dfd.resolve({session: session, response: response});
        }
        if (response.status_code == 199) {
          dfd.reject("App internal error. STATUS_CODE 199.");
        }
      });
      return dfd.promise; // on invite sent confirmed, return promise
    },


    setInviteStatus: function(status) {
      this.invite_status = status;
    },

    getInviteStatus: function() {
      return this.invite_status;
    },


    accept: function () {
      $rootScope.calling = true;
      var self = this;
      if (session && session.accept) {
        session.accept(mediaOptions);
      }
      //$rootScope.$emit('call:update_avatar', null); // Set the avatar back to null to hide it
    },


    __call: function () {
      var self = this;

      console.log('calling ------------------------------------------------------');
      CallSvc.stopAudio();
      if (typeof window.plugins !== 'undefined')
        cordova.plugins.backgroundMode.enable();

      call.status = 'connected';
      call.active = true;

      $rootScope.$emit('call:update_properties');

      timer = $interval(function () {
        $rootScope.$emit('call:update', call);
        call.duration++;
      }, 1000);
    },


    status: function () {
      return call;
    },


    addMember: function (member) {

      var self = this;
      var deferred = $q.defer();
      if (self._checkMembers(member)) {
        $timeout(function () {
          call.members.push(member);
          $rootScope.$emit('call:update', call);
          deferred.resolve();
        });
      } else {
        deferred.reject('The member already exists');
      }
      return deferred.promise;
    },

    sendCallTimeToBackend : function () {
      var host = window.config.api.host,
          userInfo = UserSvc.getUserInfo(),
          userToken = UserSvc.getUserToken();

      $http({
        method: 'PUT',
        url: (host + '/callhistory/call_credits/' + userInfo.username),
        headers: {'Authorization': 'Bearer ' + userToken.value},
        data: { duration: Utils.timeToSecondAndMinutes(call.duration)}
      }).then(null, function(err) {
        console.error(err);
      });
    },


    disconnect: function () {

      var self = this;
      videoEnabled = false;  // Disable the video
      micActive = true;      // Disable the mic

      self.hideVideoRender();
      $rootScope.$emit('call:update_avatar', null); // Set the avatar back to null
      CallSvc.pauseRemoteAudio();
      CallSvc.stopAudio();

      active_call = call;

      self.setPauseSipIncomingCallBehavior(false); // reset status

      if (timeout) {
        $timeout.cancel(timeout);
      }

      if (typeof window.plugins !== 'undefined') {
        if (window.cordova) {
          cordova.plugins.backgroundMode.disable();
            if(!window.config.debug)
                window.plugins.insomnia.allowSleepAgain();
        }
      }

      if (call.active) {
        call.status = 'finished';
      }

      if (self.session_accepted == false) {
        self.sendMissedNotificationForMembers(self.temp_members);
      }

      // Don't save the call if is a group call
      // here
      if (!self.isGroupCallActive() && call.members.length > 0) {
        console.log('DEBUG: INTERNAL INFO: Adding call to the history', call);
        CallPalHistorySvc.add(call);
      }

      $interval.cancel(timer);

      self.sendCallTimeToBackend();
      console.log('self.sendCallTimeToBackend() was executed');

      // The voiceMail was activated so after a few seconds send a push to notify the voicemail
      if (voice_mail_activated && call.duration > 6) {
        console.log('Voicemail was activated');
        NotificationsSvc.notifyVoiceMailDelivered(call.members[0].username, call.duration).then(function (success) {
        }, function (error) {
          console.log('There is an error notifying voiceMail', error);
        });
      }

      // Check if user has shared with friends and handle
      //TellafriendSvc.checkUserInvitations();

      if (voice_mail_activated && !self.isGroupCallActive()) {
        $state.go('app.contact', { contact: call.members[0], sheet: false });
      } else {
        //TODO Change the ionicHistory count when the app was answered from push after sip connection
        //$ionicHistory.goBack(); // Go back to the last view
        $state.go('app.country');
      }

      voice_mail_activated = false; // reset voicemail
      call = {
        active: false,
        status: "finished",
        duration: 0,
        type: "outgoing",
        date: null,
        members: []
      };

      if (session && ua) {
        SIPService.endCall(session).then(function (session_status) {
          accepted_from_push = false;
          console.log('DEBUG: INFO: Session information', session_status);
          session = null;
        }, function (error_session) {
          console.log('DEBUG: ERRO: There is not session', error_session);
        });
      }

      call_type = "NONE";

      // back to normal screen size

      CallSvc.stopVideo();
      console.log('End');
    },


    _checkMembers: function (member) {
      var valid = true;
      call.members.forEach(function (m) {
        if (member.id == m.id) {
          valid = false;
          return false;
        }
      });
      return valid;
    },


    rate_call: function (points) {
      var host = window.config.api.host;
      var userInfo = UserSvc.getUserInfo();
      var userToken = UserSvc.getUserToken();
      var userSpeedDials = userInfo.speedDial;

      var req = {
        method: 'PUT',
        url: (host + '/callhistory/ratecall/' + userInfo.username),
        headers: {
          'Authorization': 'Bearer ' + userToken.value
        },
        data: {
          caller: userInfo.username,
          receiver: active_call.members,
          date: new Date(),
          rate: points,
          mode: true,
          duration: active_call.duration
        }
      };

      var deferred = $q.defer();

      setTimeout(function () {

        $http(req)
            .then(function (response) {
              deferred.resolve(response);
            }, function (error) {
              deferred.reject(error);
            });

      }, 0);

      return deferred.promise;
    }

  }

}
