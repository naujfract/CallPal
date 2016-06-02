"use strict";

angular
  .module('callpal.main', [
    'ionic', 'ionic.rating', 'pascalprecht.translate'
  ])

  .config(function ($stateProvider, $translateProvider) {

    // Loading i18n
    var translations = window.config.translations;
    for (var lang in translations) {
      $translateProvider.translations(lang, translations[lang]);
    }

    $translateProvider.preferredLanguage(translations.default);

    $stateProvider
      .state('app', {
        url: "/app",
        templateUrl: "app/Main/Templates/Main.html",
        controller: 'MainCtrl'
      });

  })
;
