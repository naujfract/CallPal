angular.module('callpal.settings')

    .controller('BackgroundCtrl', function ($css, $scope, SettingsSvc, Utils, UserSvc) {

      $scope.current_background = UserSvc.getSelectedBackground();


      $scope.settings_background = {

        changeBackground: function (property) {
            $scope.background = property;
            $css.removeAll();
            $css.bind({
              href: 'css/background-' + property + '.css'
            }, $scope);
            SettingsSvc.changeSettingsBackground(property);
        }
      };
    });
