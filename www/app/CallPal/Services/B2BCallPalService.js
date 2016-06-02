'use strict';

angular
    .module('callpal.callpal')
    .factory('B2BCallPalSvc', B2BCallPalSvc);

function B2BCallPalSvc(ContactsSvc,
                        $q,
                        $rootScope,
                        $timeout,
                        $interval,
                        $state,
                        CallSvc,
                        UserSvc,
                        Utils,
                        $http,
                        $window,
                        CountryCodesSvc,
                        $ionicPlatform,
                        $cordovaFile,
                        SettingsLanguageService,
                        $translate,
                        DBA) {

  var host = window.config.content.host;

  SettingsLanguageService.get_lang().then(function(language){
      $translate.use(language);
  });

  return {

    get_geolocation: function()
    {
      var geolocation = {};
      var userInfo = UserSvc.getUserInfo();

      if($window.localStorage['geolocation'])
        geolocation = JSON.parse($window.localStorage['geolocation']);

      if(!geolocation.country || !geolocation.country.short_name)
      {
        var country = ''
        if(userInfo.country)
          country = userInfo.country;

        geolocation.country = {
          short_name: country
        }
      }

      if (!geolocation.state || !geolocation.state.long_name) {
        geolocation.state = {
          long_name: ''
        }
      }

      if (!geolocation.city || !geolocation.city.long_name) {
        geolocation.city = {
          long_name: ''
        }
      }

      if(!geolocation.zip_code || !geolocation.zip_code.long_name){
        geolocation.zip_code = {
          long_name: ''
        }
      }

      return geolocation;
    },

    get_caller_data: function (members, offset) {

      var userInfo = UserSvc.getUserInfo();
      var userToken = UserSvc.getUserToken();
      var geolocation = this.get_geolocation();

      console.log('userInfo', userInfo);

      var memberCountry = null;

      if(members && members[0]){
        if(members[0].phoneNumbers)
        {
          if(members[0].phoneNumbers[0].countryCode) {
            var rps = CountryCodesSvc.getCountryByPhonePrefix(members[0].phoneNumbers[0].countryCode);
            memberCountry = rps.code;
          }else{
            memberCountry = 'US';
          }
        }else{
          memberCountry = 'US';
        }
      }else{
        memberCountry = 'US';
      }

      console.log('geolocation', geolocation);


      var req = {
        method: 'POST',
        url: (host + '/caller'),
        headers: {
          'Authorization': 'Bearer ' + userToken.value,
          'Content-Type': 'application/json'
        },
        data: {
          username: userInfo.username,
          country: geolocation.country.short_name,
          state: geolocation.state.long_name,
          city: geolocation.city.long_name,
          postal_code: geolocation.zip_code.long_name,
          target_country: memberCountry,
          user_to: members[0].username,
          cards_limit: 10,
          offset: offset
        }
      };


      var deferred = $q.defer();

      setTimeout(function () {

        $http(req)
            .then(function (response) {
              console.log('get_caller_data',response.data);
              deferred.resolve(response.data.data);
            }, function (error) {
              deferred.reject(error);
            });

      }, 0);

      return deferred.promise;
    },

    get_callee_data: function (members, offset) {

      var userInfo = UserSvc.getUserInfo();
      var userToken = UserSvc.getUserToken();
      var geolocation = this.get_geolocation();


      var memberCountry = null;

      if(members && members[0]){
        if(members[0].phoneNumbers)
        {
          if(members[0].phoneNumbers[0].countryCode) {
            var rps = CountryCodesSvc.getCountryByPhonePrefix(members[0].phoneNumbers[0].countryCode);
            memberCountry = rps.code;
          }else{
            memberCountry = 'US';
          }
        }else{
          memberCountry = 'US';
        }
      }else{
        memberCountry = 'US';
      }

      var req = {
        method: 'POST',
        url: (host + '/callee'),
        headers: {
          'Authorization': 'Bearer ' + userToken.value,
          'Content-Type': 'application/json'
        },
        data: {
          username: userInfo.username,
          country: geolocation.country.short_name,
          state: geolocation.state.long_name,
          city: geolocation.city.long_name,
          postal_code: geolocation.zip_code.long_name,
          origin_country: memberCountry,
          user_from: members[0].username,
          cards_limit: 10,
          offset: offset
        }
      };


      var deferred = $q.defer();

      setTimeout(function () {

        $http(req)
            .then(function (response) {
              console.log('get_caller_data',response.data.data);
              deferred.resolve(response.data.data);
            }, function (error) {
              deferred.reject(error);
            });

      }, 0);

      return deferred.promise;
    },

    get_expressions: function()
    {
      var express = [
        {id: 'okay', name:'Okay', translated: $translate.instant('w_nest.express.okay'), icon: 'web-assets/img/express/okay.png', type: 'express'},
        {id: 'cool', name:'Cool', translated: $translate.instant('w_nest.express.cool'), icon: 'web-assets/img/express/cool.png', type: 'express'},
        {id: 'like_it', name:'Like it!', translated: $translate.instant('w_nest.express.like_it'), icon: 'web-assets/img/express/likeit.png', type: 'express'},
        {id: 'amazing', name:'Amazing!', translated: $translate.instant('w_nest.express.amazing'), icon: 'web-assets/img/express/amazing.png', type: 'express'},
        {id: 'love_it', name:'Love it!', translated: $translate.instant('w_nest.express.love_it'), icon: 'web-assets/img/express/loveit.png', type: 'express'}
      ];

      return express;
    },

    get_share_actions: function()
    {
      var actions = [
        {id: 'doc', name:'Document', icon: 'web-assets/img/call/share/document.png', type: 'share'},
        {id: 'cam', name:'Camera', icon: 'web-assets/img/call/share/camera.png', type: 'share'},
        {id: 'roll', name:'Camera Roll', icon: 'web-assets/img/call/share/camera_roll.png', type: 'share'},
      ];

      return actions;
    },

    send_express: function(express, campaign)
    {

      var userInfo = UserSvc.getUserInfo();
      var userToken = UserSvc.getUserToken();
      var geolocation = this.get_geolocation();

      var req = {
        method: 'PUT',
        url: (host + '/express/' + campaign.key),
        headers: {
          'Authorization': 'Bearer ' + userToken.value,
          'Content-Type': 'application/json'
        },
        data: {
          username: userInfo.username,
          country: geolocation.country.short_name,
          state: geolocation.state.long_name,
          city: geolocation.city.long_name,
          postal_code: geolocation.zip_code.long_name,
          express: express.id,
          comment: express.comment
        }
      };

      var deferred = $q.defer();

      setTimeout(function () {

        $http(req)
            .then(function (response) {
              deferred.resolve(response.data.data);
            }, function (error) {
              deferred.reject(error);
            });

      }, 0);

      return deferred.promise;
    },

    save_on_nest: function(campaign)
    {
      var userInfo = UserSvc.getUserInfo();
      var userToken = UserSvc.getUserToken();
      var geolocation = this.get_geolocation();

      var req = {
        method: 'PUT',
        url: (host + '/savetomynest_from_call/' + campaign.key),
        headers: {
          'Authorization': 'Bearer ' + userToken.value,
          'Content-Type': 'application/json'
        },
        data: {
          username: userInfo.username,
          country: geolocation.country.short_name,
          state: geolocation.state.long_name,
          city: geolocation.city.long_name,
          postal_code: geolocation.zip_code.long_name,
        }
      };

      var deferred = $q.defer();

      setTimeout(function () {

        $http(req)
            .then(function (response) {
              deferred.resolve(response.data.data);
            }, function (error) {
              deferred.reject(error);
            });

      }, 0);

      return deferred.promise;
    },

    share_with_pals: function(pals, campaign)
    {
      var userInfo = UserSvc.getUserInfo();
      var userToken = UserSvc.getUserToken();
      var geolocation = this.get_geolocation();

      var req = {
        method: 'PUT',
        url: (host + '/sharetocallpalusers/' + campaign.key),
        headers: {
          'Authorization': 'Bearer ' + userToken.value,
          'Content-Type': 'application/json'
        },
        data: {
          country_from: geolocation.country.short_name,
          state_from: geolocation.state.long_name,
          city_from: geolocation.city.long_name,
          postal_code_from: geolocation.zip_code.long_name,
          usernames_to: pals
        }
      };

      var deferred = $q.defer();

      setTimeout(function () {

        $http(req)
            .then(function (response) {
              deferred.resolve(response.data.data);
            }, function (error) {
              deferred.reject(error);
            });

      }, 0);

      return deferred.promise;
    },

    save_on_gallery: function(url)
    {
      var deferred = $q.defer();

      if(ionic.Platform.isIOS()){
        window.plugins.socialsharing.saveToPhotoAlbum(
          url,
          function (success) {
            deferred.resolve(success);
          },
          function (error) {
            deferred.reject(error);
          }
        );
      }else if (ionic.Platform.isAndroid()) {

      }

      return deferred.promise;
    },

    delete_content: function(campaign)
    {
      var userInfo = UserSvc.getUserInfo();
      var userToken = UserSvc.getUserToken();

      var req = {
        method: 'PUT',
        url: (host + '/removefrommynest/' + userInfo.username),
        headers: {
          'Authorization': 'Bearer ' + userToken.value,
          'Content-Type': 'application/json'
        },
        data: {
          key: campaign.key
        }
      };

      var deferred = $q.defer();

      setTimeout(function () {

        $http(req)
            .then(function (response) {
              deferred.resolve(response.data.data);
            }, function (error) {
              deferred.reject(error);
            });

      }, 0);

      return deferred.promise;
    },

    save_on_database: function(campaign)
    {
      console.log('save_on_database', campaign);
      var deferred = $q.defer();
      DBA.getDocumentContent('mediaContent', campaign.key)
          .then(function (suc) {
            console.log('DEBUG: Success getting campaign inside DB', suc);

            if(suc.rows.length == 0){
              DBA.addDocumentContent('mediaContent', campaign.key)
                .then(function (sccss) {
                  console.log('DBA.addDocumentContent(mediaContent', sccss);
                  deferred.resolve(sccss);
                }, function (err) {
                  console.error('DEBUG: Error creating campaign inside DB', err);
                  deferred.reject(err);
                });
            }

          }, function (err) {
            console.error('DEBUG: Error getting campaign inside DB', err);
            deferred.reject(err);
          });
      return deferred.promise;
    },

    remove_from_database: function(campaign)
    {
      var deferred = $q.defer();
      DBA.removeDocumentContent('mediaContent', campaign.key)
         .then(function(sccss){
           console.log('remove_from_database', sccss);
           deferred.resolve(sccss);
         }, function(err){
           console.log('remove_from_database', err);
           deferred.reject(err);
         });
      return deferred.promise;
    },

    get_all_from_database: function()
    {
      var deferred = $q.defer();

      var userInfo = UserSvc.getUserInfo();
      var userToken = UserSvc.getUserToken();
      var geolocation = this.get_geolocation();

      DBA.getAllDocumentsContent('mediaContent')
         .then(function(sccss){
           console.log('getAllDocumentsContent', sccss.rows.item(0));
           var data = [];
           for (var i = 0; i < sccss.rows.length; i++) {
             data.push(sccss.rows.item(i).key);
           }

           var req = {
             method: 'POST',
             url: (host + '/synch/notused'),
             headers: {
               'Authorization': 'Bearer ' + userToken.value,
               'Content-Type': 'application/json'
             },
             data: {
               content: data
             }
           };

           setTimeout(function () {

             $http(req)
                 .then(function (response) {
                   console.log('get_all_from_database',response.data);
                   deferred.resolve(response.data.data);
                 }, function (error) {
                   deferred.reject(error);
                 });

           }, 0);

         }, function(err){
           console.log('get_all_from_database', err);
           deferred.reject(err);
         });
      return deferred.promise;
    }
  }

}
