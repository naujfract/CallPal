angular.module('callpal.settings')

  .controller("SettingsLanguagesController", ['$scope', '$translate', 'SettingsLanguageService', 'ionicToast', '$state', 'Utils', function ($scope, $translate, SettingsLanguageService, ionicToast, $state, Utils) {

    $scope.current_language = null;

    // Init
    $scope.init = function () {
        SettingsLanguageService.get_lang().then(function(language){
            $scope.current_language = language;
        });
        $scope.languages = SettingsLanguageService.get_languages();
    }();

    // Select the lang
    $scope.selectLanguage = function (lang) {
      $scope.current_language = lang.abbr;
      $translate.use(lang.abbr); // Change app lang
      SettingsLanguageService.saveLanguagePreference(lang); // Persist
      ionicToast.show($translate.instant('w_settings.options.languages.changed_ok', { language: lang.lang }), 'bottom', false, window.config.timeDisplayingToasts);
    };

    // Search Filter
    $scope.showSearch = function (inputSearchId) {
      $scope.show = true;
        Utils.showKeyboard(inputSearchId);
    };
    $scope.cancelSearch = function () {
      $scope.show = false;
      $scope.search = "";
        Utils.hideKeyboard();
    };

    $scope.back = function(){
      $state.go('app.settings.menu');
    };

  }]);
