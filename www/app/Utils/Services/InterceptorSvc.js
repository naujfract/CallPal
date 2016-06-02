// Interceptor to queue HTTP requests.

angular.module('callpal.utils').factory('InterceptorService', ['$injector', function($injector) {

  // load the main services by injection
  var $localstorage = $injector.get('$localstorage'),
      UserSvc = $injector.get('UserSvc'),
      $q = $injector.get('$q'),
      CallPalDbSvc = $injector.get('CallPalDbSvc'),
      $window = $injector.get('$window');


  var i = { //interceptor

      'token' : {
          // get a knew token from the server
          'refresh' : function  () {
            var _this = this;
                defered = new $q.defer(),
                userClient = UserSvc.getUserClient(),
                userRefreshToken = UserSvc.getUserRefreshToken();

            _this.isRefreshing = true;
            console.log('calling refreshToken');
            $injector.get('AuthSvc').refreshToken(userClient.id, userClient.secret, userRefreshToken)
              .then(function (tokenObj) {

                console.log('refreshToken success', tokenObj);

                var n_u_token = tokenObj.data.access_token[0].token;
                var n_r_token = tokenObj.data.access_token[1].refreshtoken;
                // Save new tokens into the local storage
                $localstorage.setObject('userToken', n_u_token);
                $localstorage.set('userRefreshToken', n_r_token);
                $localstorage.set('userTokenTimestamp', moment(n_u_token.created).format('M/D/YYYY, h:mm:ss a'));

                _this.isRefreshing = false;
                return defered.resolve();
              }, function (err) {

                console.log('refreshToken error');

                _this.isRefreshing = false;
                return defered.reject(err);
              });

            return defered.promise;
          },

          // get the same token generated previously, NOT a new one
          'reload' : function  () {
            var userClient = UserSvc.getUserClient(),
                defered = new $q.defer();

            var req = {
              method: 'GET',
              url: (window.config.api.host + '/token/' + UserSvc.getUserInfo().username),
              headers: {'Authorization': 'Basic '+ btoa(userClient.id + ':' + userClient.secret)}
            }

            $injector.get('$http')(req)
              .then(function(_newToken) {
                if (_newToken.data.success) {
                  newToken = _newToken.data.token.value;
                  $localstorage.setObject('userToken', _newToken.data.token);
                  $localstorage.set('userRefreshToken', _newToken.data.refreshtoken);
                  $localstorage.set('userTokenTimestamp', moment(_newToken.data.token.created).format('M/D/YYYY, h:mm:ss a'));
                  //console.log('_newToken', moment().format('M/D/YYYY, h:mm:ss a'));
                  defered.resolve();
                }
              }, function (err) {
                console.error('error reloading token', err);
                defered.reject();
              })

            return defered.promise;
          },

          // a flag for know is the token in been refreshed
          'isRefreshing' : false,
          'format' : 'M/D/YYYY, h:mm:ss a',

          // return true if the token is expired calculating timestamp in the local storage
          'isExpiredByTimestamp' : function () {
            var _this = this;
                userTokenTimestamp = $localstorage.get('userTokenTimestamp');

            if (! userTokenTimestamp) { return true }

            if (moment(userTokenTimestamp, _this.format).add(window.config.tokenExpirationInMinutes - 1, 'minutes').isBefore(moment())) {
              return true;
            }
            return false;
          },

          'getValue' : function () {
            return $localstorage.getObject('userToken').value;
          }

      },

      'security' : {
          // calculate if is the request need to be intercepted
          'isExcludedUrl' : function(url) {
            var excludedUrls = [{'name' : 'request token', 'url' : '/oauth2/token'}, {'name' : 'reload token', 'url' : '/token'}];

            for (var i in excludedUrls) {
              var excludedUrl = window.config.api.host + excludedUrls[i].url;

              if (!!~ url.indexOf(excludedUrl)) {
                return true;
              }
            }
            return false;
          },

          // return true only if is an https request
          'isValidProtocol' : function (url) {
            var protocol = window.config.api.protocol;

            if (url.substring(0, protocol.length) == protocol) {
              return true;
            }
            return false;
          },
      },

      'request': {
          'queue' : [],
          'timeout': window.config.requestTimeout,
          'percentPoorConnection' : window.config.requestPercentPoorConnection,

          'executeAll' : function () {
            var _this = this;

            for (var i in _this.queue) {
              _this.queue[i]();
            }
            _this.queue = [];
          },

          'executeTop' : function () {
            if (this.queue.length === 0) {
              return;
            }

            this.queue[0]();
          },

          'checkPoorConnection' : function (config) {
            var respTime = new Date().getTime() - config.startTime;

            if (respTime >= (config.timeout * this.percentPoorConnection)) {
              if (! $injector.get('PHONE_STATUS').poorConnection) {
                $injector.get('PHONE_STATUS').poorConnection = true;
                //console.log('PHONE_STATUS ------------------------->', true);

                setTimeout(function () {
                  $injector.get('PHONE_STATUS').poorConnection = false;
                  //console.log('PHONE_STATUS ------------------------->', false);
                }, window.config.timeDisplayingToasts);
              }
            }
          }
      }

  }


  return {
    request: function (config) {
      // check if the app is offline
      if (! $injector.get('PHONE_STATUS').online) {
        return $q.reject({ error: true, message: 'Offline' })
      }

      // on every server request
      if (!UserSvc.user_need_login() && i.security.isValidProtocol(config.url) && !i.security.isExcludedUrl(config.url)) {
        console.log('entering to request: '+ config.url);

        // put all the requests in a queue
        var deferred = $q.defer();
        i.request.queue.push(function () {

          config.timeout = i.request.timeout;
          config.startTime = new Date().getTime();

          if (config.headers.Authorization && config.headers.Authorization.substring(0, 6) === 'Bearer') {
            config.headers.Authorization = 'Bearer ' + i.token.getValue();
          }

          console.log('calling from queue: '+ config.url);
          deferred.resolve(config);
        });

        // if the token is expired
        if (i.token.isExpiredByTimestamp()) {
          // if it is not been refreshed the do it
          if (! i.token.isRefreshing) {
            i.token.refresh()
              .then(function () {
                i.request.executeTop();
              }, function () {
                console.error('error getting new token')
              })
          }
        } else if (i.request.queue.length == 1) {
          i.request.executeTop();
        }

        return deferred.promise;
      }

      return config;
    },

    response: function (response) {
      if (i.security.isValidProtocol(response.config.url) && !i.security.isExcludedUrl(response.config.url)) {
        console.log('response from '+ response.config.url, response);

        i.request.checkPoorConnection(response.config);
        i.request.queue.shift();
        i.request.executeTop();
      }
      return response;
    },

    responseError: function(responseError) {
      if (responseError.config && i.security.isValidProtocol(responseError.config.url)) {
        if (responseError.status == 500 && responseError.data.message === 'Phone not verified') {
          $window.localStorage.clear();
          CallPalDbSvc.deleteTables();
          //$state.go('login');
          $window.location.reload();
          i.request.queue.shift();
          i.request.executeTop();
        }
        if ( responseError.status == 500 && responseError.data.message == 'token not match') {
          i.token.reload()
            .then(function () {
              console.log('success getting same token');
              i.request.queue.shift();
              i.request.executeTop();
            }, function () {
              console.error('error getting same token');
            });
        } else {
          i.request.checkPoorConnection(responseError.config);
          i.request.queue.shift();
          i.request.executeTop();
        }
      }

      return $q.reject(responseError);
    }
  }

}]);


angular.module("callpal.main").config(['$httpProvider', function($httpProvider) {
  $httpProvider.interceptors.push('InterceptorService');
}]);
