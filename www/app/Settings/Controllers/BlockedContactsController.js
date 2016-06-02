angular.module('callpal.settings')

  // BlockedContacts Controller
  .controller('BlockedContactsCtrl', function ($scope, $ionicLoading, BlockedContactsSvc, $ionicPopup, $translate) {

    /**
     * @function: @init
     * @description: Load the contacts from the server
     * @param:
     * @return:
     *
     **/
    $scope.init = function () {
      $scope.blocked_contact_list = [];
      //loadIndicator(false);
      $scope.blocked_contact_list = BlockedContactsSvc.getAll();
    };


    /**
     * @function: @ionicView.enter
     * @description: On enter in this view load the blocked contacts
     **/
    $scope.$on('$ionicView.enter', function (e) {
      $scope.init();
    });


    /**
     * @function: @showConfirm
     * @description: Are you sure to unblock this contact?
     * @param:
     * @return:
     *
     **/
    $scope.showConfirm = function (selected_contact) {
      var confirmPopup = $ionicPopup.confirm({
        title: $translate.instant('w_contacts.unblock_contact'),
        template: $translate.instant('w_contacts.unblock_confirmation', { contact: selected_contact.displayName })
      });
      /**
       * @function: @ionicView.enter
       * @description: On enter in this view
       **/
      $scope.$on('$ionicView.enter', function (e) {
        $scope.init();
      });


      confirmPopup.then(function (res) {
        if (res) {
          loadIndicator(false);
          BlockedContactsSvc.remove(selected_contact)
            .then(function () {
              $scope.init(); // Refresh the list
              hideIndicator();
          }, function (error) {
            hideIndicator();
          });
        } else {
          // Close dialog
        }
      });
    };


    /**
     * @function: @loadIndicator
     * @description: Shows the loading with background or not
     * @param:
     *  backdrop: boolean
     * @return: -
     **/
    var loadIndicator = function (backdrop) {
      $scope.loadingIndicator = $ionicLoading.show({
        animation: 'fade-in',
        showBackdrop: backdrop,
        showDelay: 200,
        template: '<ion-spinner icon="android"/>'
      });
    };


    /**
     * @function: @hideIndicator
     * @description: Hide the indicator
     * @param: -
     * @return: -
     **/
    var hideIndicator = function () {
      $ionicLoading.hide();
    };

  });


