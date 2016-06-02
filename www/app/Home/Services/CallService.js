'use strict';

angular
  .module('callpal.home')
  .factory('CallSvc', CallSvc)
  .factory('AdsSvc', AdsSvc)
  .factory('HistoryCallSvc', HistoryCallSvc)
;

function CallSvc(CountryCodesSvc, RingTonesService, $translate) {


  var session;
  var svcNumber;
  var svcCountry = {};
  var rtcSession;
  var stream;
  var allSessions = [];
  var userCountryIntlPrefix = "1"; // Once oAuth is done, get this value from registration data.
  var userDialOutPrefix = "011"; // Once oAuth is done, get this value from registration data.
  var callStatus;
  var streamAudio; // Holds audio from stream during calls


  // Tones
  var ringtone = "web-assets/audio/ringtone.mp3";

  var SelfMethods = {
    
    call_errors_parse: function (code) {
      var response = "Call cannot be connected.";
      switch (code) {
        case 404:
          response += $translate.instant('w_sip_errors.404');
          break;
        case 486:
          response += $translate.instant('w_sip_errors.486');
          break;
        case 408:
        case 410:
        case 430:
        case 480:
          response += $translate.instant('w_sip_errors.408,410,430,480');
          break;
        case 484:
          response += $translate.instant('w_sip_errors.484');
        case 503:
          response += $translate.instant('w_sip_errors.503');
      }
      return response;
    },



    playAudio: function (src) {
      var audio = document.getElementById('tone');
      audio.removeAttribute('src');
      audio.src = src;
      audio.loop = true;
      audio.load();

      audio.addEventListener('loadedmetadata', function () {
        audio.play();
      });
    },


    playOpeningCallTone: function () {
      var audio = document.getElementById('tone');
      audio.removeAttribute('src');
      audio.src = "./web-assets/audio/first_tone.wav";
      audio.loop = false;
      audio.load();

      audio.addEventListener('loadedmetadata', function () {
        audio.play();
      });
    },


    stopAudio: function () {
      var audio = document.getElementById('tone');
      audio.pause();
      audio.currentTime = 0;
    },


    stopVideo: function() {
      var video = document.getElementById("remoteAudio");
      video.loop = false;
      video.pause();
      video.src = "";
      var audio = document.getElementById("tone");
      audio.loop = false;
      audio.pause();
      audio.src = "";
    },

    playToneIn: function (name) {
      SelfMethods.playAudio(RingTonesService.getUserRingTonePath(name));
    },


    playToneOut: function () {
      SelfMethods.playAudio(ringtone);
    },


    totalSessions: function () {
      console.log('Sessions number', allSessions.length);
    },


    getUserCountryIntlPrefix: function () {
      return userCountryIntlPrefix;
    },


    getUserDialOutPrefix: function () {
      return userDialOutPrefix;
    },


    callStatus: function () {
      return callStatus;
    },


    setCountry: function (number, caption) {
      svcCountry.number = number;
      svcCountry.prefix = number;
      svcCountry.caption = caption;
    },


    getCountry: function () {
      return svcCountry;
    },


    getCountries: function () {
      var country_codes = CountryCodesSvc.getCountries();
      var returnCountries = [];
      for (var i = 0; i < country_codes.length; i++)
        if (country_codes[i].active == 1)
          returnCountries.push(country_codes[i]);
      return returnCountries;
    },


    getNumber: function () {
      return svcCountry.number;
    },

    setMyNumber: function (number) {
      svcCountry.myNumber = number;
    },

    getMyNumber: function (number) {
      return svcCountry.myNumber;
    },


    pauseRemoteAudio: function () {
      var audio = document.getElementById("remoteAudio");
      audio.src = "";
      audio.loop = false;
      audio.pause();
    },

  };

  return SelfMethods;

  // -----------------------------------------------------------------

  var CallSvcMethods = {

    initiate: function (number) {

      ua.on('invite', function (session) {
        // createNewSessionUI(session.remoteIdentity.uri, session);
        session.accept();
        console.log('invite!');
        console.log(session);
      });

      // here you determine whether the call has video and audio
      var options = {
        media: {
          constraints: {
            audio: true,
            video: false
          }
        }
      };

      //makes the call
      //session = ua.invite('sip:'+svcNumber+'@sip2.callpalnetwork.com', options);
      session = ua.invite('sip:1001@10.0.0.5', options);

      session.on('accepted', function () {
        ringtone.pause();
        console.log('accepted!');
        //console.log(session);
      });

      session.mediaHandler.on('addStream', function (e) {
        ringtone.pause();
        //new Audio(window.URL.createObjectURL(e.stream)).play();
        var audio = new Audio(window.URL.createObjectURL(e.stream));
        //audio.volume = AudioMicroSvc.getSpeakerVolume();
        console.log('audio object: ', audio);
        audio.play();

        if (typeof AudioToggle != undefined)
          AudioToggle.setAudioMode(AudioToggle.SPEAKER);

        console.log('addStream!');
        console.log(session);
        console.log(e);
      });

      session.on('progress', function (e) {
        console.log('current call is in progress', e);
      });
    },


    muteToggle: function () {
      var status = session.isMuted();
      if (status.audio == true) {
        session.unmute({audio: true});
        callStatus.replace(' - Muted', '');
      } else {
        session.mute({audio: true});
        callStatus += " - Muted";
      }
    }

  };

  return CallSvcMethods;

}

function AdsSvc() {

  var ads = [
    {index: 1, length: 15, message: 'Ad 1', path: "web-assets/img/ads/ad1.png"},
    {index: 2, length: 15, message: 'Ad 2', path: "web-assets/img/ads/ad2.png"},
    {index: 3, length: 10, message: 'Ad 3', path: "web-assets/img/ads/ad3.png"},
    {index: 4, length: 8,  message: 'Ad 4', path: "web-assets/img/ads/ad4.png"},
    {index: 5, length: 7,  message: 'Ad 5', path: "web-assets/img/ads/ad5.png"},
    {index: 6, length: 7,  message: 'Ad 5', path: "web-assets/img/ads/ad6.png"},
    {index: 7, length: 7,  message: 'Ad 5', path: "web-assets/img/ads/ad7.png"},
    {index: 8, length: 7,  message: 'Ad 5', path: "web-assets/img/ads/ad8.png"},
    {index: 9, length: 7,  message: 'Ad 5', path: "web-assets/img/ads/ad9.png"},
    {index: 10, length: 7,  message: 'Ad 5', path: "web-assets/img/ads/ad10.png"},
    {index: 11, length: 7,  message: 'Ad 5', path: "web-assets/img/ads/ad11.png"},
    {index: 12, length: 7,  message: 'Ad 5', path: "web-assets/img/ads/ad12.png"},
    {index: 13, length: 7,  message: 'Ad 5', path: "web-assets/img/ads/ad13.png"},
    {index: 14, length: 7,  message: 'Ad 5', path: "web-assets/img/ads/ad14.png"},
    {index: 15, length: 7,  message: 'Ad 5', path: "web-assets/img/ads/ad15.png"},

  ];

  return {
    getAds: function () {
      return ads;
    }
  };

}

function HistoryCallSvc(CallsDbSvc, MembersDbSvc) {

  return {

    /**
     * @function: @clearCallHistory
     * @description: clear the call history from the SQLite
     **/
    clearCallHistory: function () {
      CallsDbSvc.delete_all();
      MembersDbSvc.delete_all();
    },


    /**
     * @function: @deleteCall
     * @description: with the call id delete this call from the localSQLite database
     * @description: Important inside the remove function on the deleteCall method we are deleting the members of this call too.
     * @param: call (the call information)
     **/
    deleteCall: function (call) {
      CallsDbSvc.remove(call);
    },


    /**
     * @function: @members_to_array
     * @description: Convert the members (SQLResultRows) to an array
     **/
    members_to_array: function (members) {
      var results = [];
      for (var i = 0; i < members.length; i++) {
        results.push(members.item(i));
      }
      return results;
    }

  }

}
