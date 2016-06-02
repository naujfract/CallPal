'use strict';

angular
    .module('callpal.sip')
    .factory('SIPService', SIPService)
;

function SIPService($q, $ionicPlatform, CallSvc, UserSvc, angularLoad) {

  var active = false;

  return {

    init: function () {

      var self = this;
      var deferred = $q.defer();

      $ionicPlatform.ready(function () {
        self._applyIOSRTC();

        self._loadSIP()
            .then(function () {
              self._applyIOSRTCWrappers();
              active = true;
              deferred.resolve(true);
            });
      });

      return deferred.promise;

    },


    _applyIOSRTC: function () {

      if (window.cordova && window.device) {
        if (window.device.platform === 'iOS') {
          if (window.cordova.plugins) {
            //cordova.plugins.iosrtc.debug.enable("iosrtc*");
            window.cordova.plugins.iosrtc.registerGlobals();
          }
        }
      }

    },


    // Load the sip libraries one for iOS (0.6.4) and lastest for Android
    _loadSIP: function () {

      var deferred = $q.defer();

      if (window.cordova && window.device.platform === 'iOS')
        angularLoad.loadScript('lib/sip/sip-0.6.4.js')
            .then(function () {
              deferred.resolve(true);
            });
      else
        angularLoad.loadScript('lib/sip/sip-0.7.5.js')
            .then(function () {
              deferred.resolve(true);
            });

      return deferred.promise;

    },


    _applyIOSRTCWrappers: function () {

      //console.log('SIP.WebRTC.isSupported', SIP.WebRTC.isSupported());
      if (window.cordova && window.device.platform === 'iOS') {
        SIP.WebRTC.isSupported = function isSupported() {
          return true;
        };
        //console.log('SIP.WebRTC.isSupported', SIP.WebRTC.isSupported());
        SIP.WebRTC.MediaStream = cordova.plugins.iosrtc.MediaStream;
        //SIP.WebRTC.getUserMedia = cordova.plugins.iosrtc.getUserMedia; // original one


        cordova.plugins.iosrtc.getUserMedia({audio: true, video: true}); // enable video and audio
        SIP.WebRTC.getUserMedia = cordova.plugins.iosrtc.getUserMedia;


        SIP.WebRTC.RTCPeerConnection = cordova.plugins.iosrtc.RTCPeerConnection;
        SIP.WebRTC.RTCSessionDescription = cordova.plugins.iosrtc.RTCSessionDescription;

      }

    },

    getAuthorizationUser: function () {
      return UserSvc.getUserInfo().device_username;
    },

    getPassword: function () {
      return UserSvc.getUserInfo().device_username;
    },

    getWsServers: function () {
      return window.config.sip.servers;
    },


    getSipServer: function () {
      var parser = document.createElement('a');
      parser.href = window.config.sip.servers[0];
      return parser.hostname;
    },

    getUri: function (user) {
      console.log('\n\n\n USER URI: ', user);
      console.log('\n\n\n');
      return 'sip:' + user + '@' + window.config.sip.domain;
    },

    getConfig: function () {

      var userInfo = UserSvc.getUserInfo();

      var config = {
        autostart: false,
        level: "debug",
        traceSip: true, // false
        register: false, // false
        wsServers: this.getWsServers(),
        uri: this.getUri(this.getAuthorizationUser()),
        authorizationUser: this.getAuthorizationUser(),
        password: this.getAuthorizationUser(),
        registerExpires: 600,
        //registerExpires: 60,
        //connectionRecoveryMaxInterval: 20,
        //connectionRecoveryMinInterval: 4,
        //wsServerMaxReconnection: 10,
        log: {builtinEnabled: window.config.enable_sip_logs},
        displayName: userInfo.name || userInfo.username,
        rel100: "supported"
      };

      console.log("DEBUG : CONFIGURATION FOR THE SIP IS ", config);
      return config;

    },


    endCall: function (sess) {
      var deferred = $q.defer();
      deferred.resolve("Ending the call");

      try {
        if (!sess) {
          deferred.reject({session_status: false, message: "No session"});
        } else if (sess && sess.startTime) { // Connected
          console.log('DEBUG: SIP:CONNECTED: Bye was executed for session');
          sess.bye();
          deferred.resolve({session_status: "bye", message: "Bye was executed for session"});
        } else if (sess && sess.reject) { // Incoming
          console.log('DEBUG: SIP:INCOMING: SESSION.REJECT');
          sess.reject();
          deferred.resolve({session_status: "reject", message: "Reject was executed for session"});
        } else if (sess && sess.cancel) { // Outbound
          sess.cancel();
          console.log('DEBUG: SIP:OUTBOUND: SESSION.CANCEL');
          deferred.resolve({session_status: "cancel", message: "Cancel was executed for session"});
        }
      } catch (err) {
        deferred.reject("Error ending the call: " + JSON.stringify(err));
        console.error("Error ending the call endCall SIPService.js, the error is:", err);
      }
      return deferred.promise;
    },


    getMediaOptions: function () {
      console.log('Loading getMediaOptions');
      return {
        media: {
          constraints: {
            audio: true,
            video: true
          },
          render: {
            //local: document.getElementById('localAudio')
            remote: document.getElementById('remoteAudio')
          }
        }
      }
    },


    registerOnRack: function (ua) {
      if (!ua) return;
      ua.register();
      console.log("DEBUG: SIP:registerOnRack was executed for UA: ", ua);
    },


    // the sip is already connected
    isRegistered: function (ua) {
      return ua.isRegistered();
    },


    // Detect if the user is connected
    isConnected: function (ua) {
      console.log('isConnected', ua);
      if (ua) {
        return ua.isRegistered();
      }
      return false;
    },


    unRegisterOnRack: function (ua) {
      active = false;
      if (!ua) return;
      ua.unregister();
      console.log("DEBUG: SIP:unRegisterOnRack was executed for UA: ", ua);
    },


    pauseTones: function () {
      CallSvc.stopAudio();
    }


  };

}
