// @describe : Configuration Service/Factory, this Factory returns the configurations options for the app
// @how-to-use-it :
//   Add the Dependency Injection to your module => ['ConfigurationSvc', function(ConfigurationSvc) {...}];
//   Call the init method just only once => ConfigurationSvc.init();
//   Get the config values you need => var host = ConfigurationSvc.host();
//
angular.module('callpal.settings')

  .factory('ConfigurationSvc', ['$q', '$localstorage', function ($q, $localstorage) {

    return {


      initialize_notifications_storage: function() {

        var dfd = $q.defer();

        var notifications = $localstorage.getObject('callpal_notifications');
        //console.log('Notifications object', notifications);

        if (!Array.isArray(notifications)) {
          $localstorage.setObject('callpal_notifications', []);
          dfd.resolve("notifications storage was initialized successfully");
        }
        else
        {
          dfd.resolve("notifications storage was previously initialized");
        }

        return dfd.promise;

      },


      base_endpoint :function() {
        return window.config.api.host;
      },

      get_api_host: function() {
        return window.config.api.host;
      },

      get_push_host: function() {
        return window.config.push.host;
      },




     };


  }]);
