"use strict";

angular.module('callpal.settings', [
    'ionic'/*, 'n3-pie-chart'*/, 'jrCrop'
  ])
  .config(function($stateProvider) {

    $stateProvider

  // Settings Navigation
  .state('app.settings', {
    url: '/settings',
    templateUrl: 'app/Settings/Templates/settings.html',
    controller: "SettingsCtrl",
    // abstract: "true"
  })
  .state('app.settings.menu', {
    url: "/menu",
    // templateUrl: "app/Settings/Templates/settings2.html",
    views: {
      'settings-tab@app.settings': {
        templateUrl: "app/Settings/Templates/menu.html",
        //controller: "SettingsCtrl"
      }
    },
  })
  .state('app.settings.aboutus', {
    url: "/aboutus",
    // templateUrl: "app/Settings/Templates/settings2.html",
    views: {
      'settings-tab': {
        templateUrl: "app/Settings/Templates/aboutus.html",
        // controller: "SettingsCtrl"
      }
    },
  })
  .state('app.settings.advertise', {
    url: "/advertise",
    // templateUrl: "app/Settings/Templates/settings2.html",
    views: {
      'settings-tab': {
        templateUrl: "app/Settings/Templates/advertise.html",
        // controller: "SettingsCtrl"
      }
    },
  })
  .state('app.settings.accountinfo', {
    url: "/accountinfo",
    // templateUrl: "app/Settings/Templates/settings2.html",
    views: {
      'settings-tab': {
        templateUrl: "app/Settings/Templates/accountinfo.html",
        controller: "SettingsCtrl"
      }
    },
  })
  .state('app.settings.changepassword', {
    url: "/changepassword",
    // templateUrl: "app/Settings/Templates/settings2.html",
    views: {
      'settings-tab': {
        templateUrl: "app/Settings/Templates/changepassword.html",
        controller: "SettingsCtrl",
      }
    }
  })
  .state('app.settings.updateprofile', {
    url: "/updateprofile",
    // templateUrl: "app/Settings/Templates/settings2.html",
    views: {
      'settings-tab': {
        templateUrl: "app/Settings/Templates/updateprofile.html",
        controller: "SettingsUpdateProfileCtrl",
      }
    }
  })
  .state('app.settings.networkstatus', {
    url: "/networkstatus",
    // templateUrl: "app/Settings/Templates/settings2.html",
    views: {
      'settings-tab': {
        templateUrl: "app/Settings/Templates/networkstatus.html",
        controller: "SettingsCtrl",
      }
    }
  })
  .state('app.settings.blocknumber', {
    url: "/blocknumber",
    // templateUrl: "app/Settings/Templates/settings2.html",
    views: {
      'settings-tab': {
        templateUrl: "app/Settings/Templates/blocknumber.html",
        controller: "BlockedContactsCtrl",
      }
    }
  })
  .state('app.settings.notifications', {
    url: "/notification",
    // templateUrl: "app/Settings/Templates/settings2.html",
    views: {
      'settings-tab': {
        templateUrl: "app/Settings/Templates/notifications.html",
        controller: "NotificationCtrl"
      }
    },
  })
  .state('app.settings.audio', {
    url: "/audio",
    // templateUrl: "app/Settings/Templates/settings2.html",
    views: {
      'settings-tab': {
        templateUrl: "app/Settings/Templates/audio.html",
        controller: "AudioCtrl"
      }
    },
  })
  .state('app.settings.background', {
    url: "/background",
    // templateUrl: "app/Settings/Templates/settings2.html",
    views: {
      'settings-tab': {
        templateUrl: "app/Settings/Templates/background.html",
        controller: "BackgroundCtrl"
      }
    },
  })
  .state('app.settings.callhistory', {
    url: "/callhistory",
    // templateUrl: "app/Settings/Templates/settings2.html",
    views: {
      'settings-tab': {
        templateUrl: "app/Settings/Templates/callhistory.html",
        controller: "SettingsCallHistoryCtrl"
      }
    },
  })
  .state('app.settings.languages', {
    url: "/languages",
    views: {
      'settings-tab': {
        templateUrl: "app/Settings/Templates/languages.html",
        controller: "SettingsLanguagesController"
      }
    },
  })
  .state('app.settings.avatarapp', {
    url: "/avatarapp",
    views: {
      'settings-tab': {
        templateUrl: "app/Settings/Templates/AvatarApp/avatarapp.html",
        controller: "SettingsLanguagesController"
      }
    },
  })
  .state('app.settings.ringtones', {
    url: "/ringtones",
    views: {
      'settings-tab': {
        templateUrl: "app/Settings/Templates/ringtones.html",
        controller: "SettingsRingTonesController"
      }
    },
    params: {'fromContact': false, contact: null},
  });

});
