"use strict";

angular
  .module('callpal.utils', [
    'ionic'
  ])

  .config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
  }])

;

angular
  .module('callpal.caching', [
    'ionic'
  ])

  .config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
  }])

;
