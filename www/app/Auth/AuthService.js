'use strict';

angular
  .module('callpal.auth')
  .factory('AuthSvc', AuthSvc);

function AuthSvc($http, $localstorage, $state, $q) {

  // Endpoint address
  var host = window.config.api.host;

  // Main Declarations
  var localizationInfo = function(){
    var deferred = $q.defer();
    console.log("localizationInfo function fired");

    var options = {
      enableHighAccuracy: true,
      timeout: 1000,
      maximumAge: 0
    };

    try{
      navigator.geolocation.getCurrentPosition(function(pos){
        deferred.resolve(pos.coords);

      }, function(err){
        deferred.resolve(err);
      }, options);
    }catch(err){
      deferred.resolve(err);
    }

    return deferred.promise;
  };

  return {
    refreshToken: function(clientId, clientSecret, refreshToken) {
      //TODO device number | var req_phone = '8d4a80fa0e9de4a366f9'; | return "refresh token";
      var req = {
        method: 'POST',
        url: (host + '/oauth2/token'),
        headers: {
          'Authorization': 'Basic '+ btoa(clientId + ':' + clientSecret)
        },
        data: {
          grant_type: 'refresh_token',
          //refresh_token: refreshToken+'|'+req_phone
          refresh_token: refreshToken
        }
      };
      return $http(req);
    },

    createToken: function(clientId, clientSecret, username, password, callback){
      var req = {
        method: 'POST',
        url: (host + '/oauth2/token'),
        headers: {
          'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
        data: {
          grant_type: 'password',
          username: username,
          password: password
        }
      };

      $http(req).then(function(tokenObj){
        if(tokenObj.data.success != undefined && tokenObj.data.success == false)
          return callback(tokenObj.data);

        //local storage the tokens
        //set time
        tokenObj.data.access_token[0].token.created = Date.now();
        $localstorage.setObject('userToken', tokenObj.data.access_token[0].token);
        $localstorage.set('userRefreshToken', tokenObj.data.access_token[1].refreshtoken);

        return callback({success:true});

      }, function(err) {
        // err.status will contain the status code
        return callback(err.data);
      });
    },
    getClient: function(username, password, callback){
      var req = {
        method: 'GET',
        url: (host + '/clients'),
        headers: {
          'Authorization': 'Basic '+btoa(username+':'+password)
        }
      };

      $http(req).then(function(clientObj){

        if(clientObj.data.success != undefined && clientObj.data.success == false)
          return callback(clientObj.data);

        $localstorage.setObject('userClient', clientObj.data);

        return callback(clientObj.data);
      }, function(err) {
        // err.status will contain the status code
        return callback(err.data);
      });
    },
    createClient: function(username, password, callback){
      var req = {
        method: 'POST',
        url: (host + '/clients'),
        headers: {
          'Authorization': 'Basic '+btoa(username+':'+password)
        },
        data: {
          name: 'Callpal'
        }
      };

      $http(req).then(function(clientObj){

        if(clientObj.data.success != undefined && clientObj.data.success == false)
          return callback(clientObj.data);

        $localstorage.setObject('userClient', clientObj.data);

        return callback(clientObj.data);
      }, function(err) {
        // err.status will contain the status code
        return callback(err.data);
      });
    },
    deviceNotAllowed: function(){
      //clear all objects from local storage
      $localstorage.setObject('userInfo', {});
      $localstorage.setObject('userClient', {});
      $localstorage.setObject('userToken', {});
      $localstorage.set('userRefreshToken', '');

      $state.go('login');
    },
    getLocalization: function(){
      var deferred = $q.defer();
      console.log("getLocalization function fired");

      return localizationInfo(function(locationObj) {
        deferred.resolve(locationObj);
      });

    }
  };

}
