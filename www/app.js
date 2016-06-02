// Callpal


angular.module('callpal', [
      // System
      'ionic'
      , 'ngCordova'
      , 'ui.router'
      , 'door3.css' // css dynamic
      , 'ionic.contrib.ui.hscrollcards' // horizontal nest scrolling
      , 'wu.masonry'
      , 'ionic.ion.imageCacheFactory'
      , 'angularLazyImg'
      // Modules
      //, 'client_app' // Include the avatar module for the market place
      , 'callpal.utils'
      , 'callpal.caching'
      , 'callpal.sip'
      , 'callpal.main'
      , 'callpal.login'
      , 'callpal.tour'
      , 'callpal.signup'
      , 'callpal.voicemail'
      , 'callpal.home'
      , 'callpal.callpal'
      , 'callpal.contacts'
      , 'callpal.tellafriend'
      , 'callpal.settings'
      , 'callpal.user'
      , 'callpal.auth'
      , 'callpal.groups'
      , 'callpal.notifications'
      , 'callpal.nest'
      , 'callpal.nest.myinterest'

    ])

    .config(function ($urlRouterProvider, $ionicConfigProvider, UserSvcProvider, $translateProvider, $provide, UtilsProvider) {

        if(window.config.crashReport.sendReport){//crash reporting

            window.onerror = function (message, url, lineNumber, columnNumber, error) {
                var exceptionMsg = message + '\n Url: ' + url + '\n Line Number: ' + lineNumber + '\n Column Number:' + columnNumber + '\n Error: ' + error;
                UtilsProvider.$get().notifyError(exceptionMsg);
            };

            (function (){

              try {
               var oldLog = console.error;
               console.error = function(exceptionMsg){
                   UtilsProvider.$get().notifyError(exceptionMsg);
                   if (console && arguments)
                    oldLog.apply(console, arguments);
               };

              } catch (e) {
                console.log('error creating log', e);
              }

            })();
        }

      if (!UserSvcProvider.$get().user_need_login())
        $urlRouterProvider.otherwise('/app/country');
      else
        $urlRouterProvider.otherwise('/login');

      $ionicConfigProvider.views.forwardCache(true); // Forward caching of views
      $ionicConfigProvider.views.transition('none'); // Remove view's transitions
      $ionicConfigProvider.views.swipeBackEnabled(false); // Disable swipe to go back
      $translateProvider.fallbackLanguage('en');

      if ('addEventListener' in document) {
        document.addEventListener('DOMContentLoaded', function() {
          FastClick.attach(document.body);
        }, false);
      }

    })

    .run(function (CallPalDbSvc, Utils, $ionicPlatform, UserSvc, $state, SettingsLanguageService, Permission) {


      $ionicPlatform.ready(function () {
        Utils.runCordovaPlugins(); // Run the plugins
        CallPalDbSvc.init();       // Init the storage on the app
        Utils.hideSplashScreen();  // Hide the splash screen
        Utils.watchPhoneStatus();  // Watch for online-offline switching
        SettingsLanguageService.init(); //Set phone language

        if (ionic.Platform.isAndroid())
          Permission.request(); //requesting app needed permissions

        if (UserSvc.user_need_login()) {
          $state.go('login');
        }
        else {
          $state.go('app.country');
        }

      });

    //
    //  $rootScope.$on('$locationChangeSuccess', function (e) {
    //
    //    $ionicPlatform.ready(function () {
    //      Utils.runCordovaPlugins(); // Run the plugins
    //      CallPalDbSvc.init();       // Init the storage on the app
    //      Utils.hideSplashScreen();  // Hide the splash screen
    //    });
    //
    //    if (!UserSvc.user_need_login()) {
    //      //$state.go('app.country');
    //      return;
    //    }
    //
    //
    //    e.preventDefault(); // Prevent $urlRouter's default handler from firing
    //
    //
    //    $state.go('login'); // By default go to the login
    //    $urlRouter.sync();  // Syn the router
    //
    //  });
    //
    //  $urlRouter.listen(); // Configures $urlRouter's listener after your custom listener
    //


    })
    .value('PHONE_STATUS', {
        online: true
    })


;
