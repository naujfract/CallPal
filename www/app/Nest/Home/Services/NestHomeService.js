'use strict';

angular
  .module('callpal.nest')
  .factory('NestHomeService', NestHomeService);

function NestHomeService($http
                         ,$q
                         ,UserSvc
                         ,ImageCachingSvc
                         ,$window) {

  var host = window.config.content.host;
  var channelHost = window.config.channel.host;
  return {

    follow_channel: function(id)
    {

      var userInfo = UserSvc.getUserInfo();
      var userToken = UserSvc.getUserToken();

      var req = {
        method: 'PUT',
        url: (channelHost + '/follow/' + id),
        headers: {
          'Authorization': 'Bearer ' + userToken.value,
          'Content-Type': 'application/json'
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
    },

    unfollow_channel: function(id)
    {

      var userInfo = UserSvc.getUserInfo();
      var userToken = UserSvc.getUserToken();

      var req = {
        method: 'PUT',
        url: (channelHost + '/unfollow/' + id),
        headers: {
          'Authorization': 'Bearer ' + userToken.value,
          'Content-Type': 'application/json'
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
    },

    get_channels: function()
    {

      var userInfo = UserSvc.getUserInfo();
      var userToken = UserSvc.getUserToken();

      var req = {
        method: 'GET',
        url: (host + '/following/channels'),
        headers: {
          'Authorization': 'Bearer ' + userToken.value,
          'Content-Type': 'application/json'
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
    },

    get_channel_details: function(id, limit, offset)
    {
      var userInfo = UserSvc.getUserInfo();
      var userToken = UserSvc.getUserToken();

      var req = {
        method: 'PUT',
        url: (channelHost + '/' + id),
        headers: {
          'Authorization': 'Bearer ' + userToken.value,
          'Content-Type': 'application/json'
        },
        data: {
          cards_limit: limit,
          cards_offset: offset
        }
      };

      var deferred = $q.defer();

      setTimeout(function () {

        $http(req)
            .then(function (response) {
                deferred.resolve(response.data);
            }, function (error) {
              deferred.reject(error);
            });

      }, 0);

      return deferred.promise;
    },

    get_categories: function () {

      var dfd = $q.defer();

      if($window.localStorage['interests']){
        var categories = JSON.parse($window.localStorage['interests']);

        setTimeout(function() {
          dfd.resolve(categories.categories);
        }, 100);
      }else{
        setTimeout(function() {
          dfd.reject('no data');
        },100);
      }

      return dfd.promise;
    },

    get_keywords: function () {

      var dfd = $q.defer();

      if($window.localStorage['interests']){
        var categories = JSON.parse($window.localStorage['interests']);
        console.log(categories);
        setTimeout(function() {
          dfd.resolve(categories.categories);
        }, 100);
      }else{
        setTimeout(function() {
          dfd.reject('no data');
        },100);
      }

      return dfd.promise;
    },

    get_interest: function()
    {

      var categories = [
        {'name': 'music', 'lorem': 'nightlife' },
        {'name': 'yachts', 'lorem': 'sports' },
        {'name': 'art', 'lorem': 'abstract' },
        {'name': 'photograhy', 'lorem': 'city' },
        {'name': 'beauty', 'lorem': 'people' },
        {'name': 'travel', 'lorem': 'nature' },
        {'name': 'business', 'lorem': 'business' },
        {'name': 'cats', 'lorem': 'cats' }];

      var height = ~~(Math.random() * 500) + 100;
      var id = ~~(Math.random() * 10000);
      var category = categories[Math.floor(Math.random() * categories.length)];
      return {
          src: 'http://lorempixel.com/280/' + height + '/' + category.lorem + '/?' + id,
          title: id,
          category: category.name
      };
    },

    get_content: function()
    {
      var userInfo = UserSvc.getUserInfo();
      var userToken = UserSvc.getUserToken();

      var req = {
        method: 'GET',
        url: (host + '/' + userInfo.username),
        headers: {
          'Authorization': 'Bearer ' + userToken.value,
          'Content-Type': 'application/json'
        }
      };

      var imagesToCache = [];

      var deferred = $q.defer();

      setTimeout(function () {

        $http(req)
            .then(function (response) {
              for (var i = 0; i < response.data.data.length; i++) {

                if(response.data.data[i].media_image_desktop)
                  imagesToCache.push(response.data.data[i].media_image_desktop);

                if(response.data.data[i].media_image_mobile)
                  imagesToCache.push(response.data.data[i].media_image_mobile);

                if(response.data.data[i].media_image_mobile_thumb)
                  imagesToCache.push(response.data.data[i].media_image_mobile_thumb);
              }

              //var output = response.data.data;

              ImageCachingSvc.cacheSpecificImages(imagesToCache).then(function(sccs){
                deferred.resolve(response.data.data);
              }, function(err){
                console.log(err);
              });


            }, function (error) {
              deferred.reject(error);
            });

      }, 0);

      return deferred.promise;
    }

  };

}
