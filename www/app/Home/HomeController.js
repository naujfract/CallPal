'use strict';

angular
    .module('callpal.home')
    .controller('HomeCtrl', HomeCtrl)
    .controller('DialPadCtrl', DialPadCtrl)
    .controller('AdsCtrl', AdsCtrl)
;

function HomeCtrl(DBA, $rootScope, $ionicActionSheet, $localstorage, $scope, ModalsManagerService, $state,
                  $timeout, $ionicPopup, CallSvc, UserSvc, FavoritesContactsSvc,
                  GroupSvc, ContactsSvc, $ionicHistory, $ionicPlatform, CallPalHistorySvc, Utils, $translate,
                  ImageCachingSvc) {



  // animate the buttons with numbers on click event
  $scope.reloading.favorites = false;
  $scope.reloading.callHistory = false;

  // loads favorites, wait for loading data in the first time
  $scope.favorites = FavoritesContactsSvc.getAll();
  Utils.createFavoriteSwiper();

  // loads call history, wait for loading data in the first time
  CallPalHistorySvc.getAll().then(function(callHistory) {
    $scope.calls = callHistory;
  });

  if (! ContactsSvc.isInitalized()) {
    $rootScope.$on('contacts:doneLoading', function () {
        $scope.favorites = FavoritesContactsSvc.getAll();
        Utils.createFavoriteSwiper();

        CallPalHistorySvc.getAll().then(function(callHistory) {
            $scope.calls = callHistory;
        });

        ImageCachingSvc.init();
        ImageCachingSvc.resolve();
    });
  }

  if ($ionicHistory) {
    $ionicHistory.clearHistory();
  }

  // Declarations

  $scope.user = UserSvc.getUserInfo();
  $scope.countries = CallSvc.getCountries();
  $scope.countrySelection = {country: ""};

  // Submit Country

  $scope.next = function () {
    //console.log($scope.countrySelection.country);
    $scope.prefix = $scope.countrySelection['country']['countryCode'];
    var countryCode = $scope.countrySelection['country']['countryCode'];
    if (countryCode != undefined && countryCode != 'undefined' && countryCode != null) {
      $scope.number = $scope.prefix;
      $scope.prefix = $scope.countrySelection['country']['countryCode'];
      CallSvc.setCountry($scope.number, $scope.countrySelection['country']['caption']);
      $state.go("app.dialpad");
    } else
      $ionicPopup.alert({
        title: $translate.instant('w_general_actions.error'),
        template: $translate.instant('w_dial_pad.not_correct_country')
      });
  };

  // Countries

  $scope.countries = {

    popup: null,
    list: [],
    search: {
      caption: ""
    },

    show: function () {

      this.list = CallSvc.getCountries();
      this.popup = $ionicPopup.show({
        templateUrl: 'app/Home/Templates/PopUpCountries.html',
        title: $translate.instant('w_general_actions.choose_country'),
        cssClass: 'select-country',
        subTitle: '',
        scope: $scope,
        buttons: [{
          text: $translate.instant('w_general_actions.cancel')
        }]
      });
      ModalsManagerService.add({modal_type: "popup", modal_id: "countries_list_call", modal: this.popup});

    },

    close: function () {

      this.popup.close();

    },

    select: function (country) {

      this.close();
      CallSvc.setMyNumber(null);

      $scope.prefix = country.countryCode;
      if (country.countryCode != undefined && country != 'undefined' && country != null) {
        $scope.number = $scope.prefix;
        $scope.prefix = country.countryCode;
        CallSvc.setCountry($scope.number, country.caption);
        $state.go("app.dialpad");
      } else
        $ionicPopup.alert({
          title: $translate.instant('w_general_actions.error'),
          template: $translate.instant('w_dial_pad.not_correct_country')
        });
    }

  };

  // Register BACK button action
  var backButtonBehav = $ionicPlatform.registerBackButtonAction(function (event) {
      console.log('registerBackButtonAction');
      ionic.Platform.exitApp();
  }, 100);
  //Then when this scope is destroyed, remove the function
  $scope.$on('$destroy', backButtonBehav);

  // hide the missing call notification when go out
  $scope.$on('$ionicView.leave', function () {
    $scope.setMissingCallNotNotified(0);
    $localstorage.set('missingCallNotNotified', 0);
  });

  // action sheet functionality------------------------------

  // End Call - go back to dialpad
  $scope.backDialpad = function () {
    $state.go('app.dialpad');
  };


  // Call history management

  $scope.calls_history = {

    call: function (call) {
      console.log('call is: ', call);
      $state.go('callpal', { members: call.members, group_call: call.group_call });
    },

    menu: function (call, callIndex) {

      // Show the action sheet
      var DELETE_CALL = 0, DELETE_HISTORY_CALL = 1, ADD_TO_CONTACTS = 2, CANCEL = 3,
          ionicActionSheetButtons = [
            { text: $translate.instant('call_history.delete_call') },
            { text: $translate.instant('call_history.delete_call_history') },
            { text: $translate.instant('call_history.add_to_contacts') }
          ];

      if (call.group_call || ContactsSvc.isContact(call.members[0])) {
        ionicActionSheetButtons.splice(2, 1);
      }

      var hideSheet = $ionicActionSheet.show({
        buttons: ionicActionSheetButtons,
        buttonClicked: function (index) {
          switch (index) {
            case DELETE_CALL:
              DBA.delDocumentSelf('calls', call, 'date')
                  .then(function (suc) {
                    $scope.calls.splice(callIndex, 1);
                  }, function (err) {
                    console.log('error deleting call history document', err);
                  });
              hideSheet();
              break;
            case DELETE_HISTORY_CALL:
               var confirmPopup = $ionicPopup.confirm({
                 title: $translate.instant('call_history.confirm_title'),
                 template: $translate.instant('call_history.confirm_text')
               });

               confirmPopup.then(function(res) {
                 if(res) {
                      DBA.delCollection('calls')
                      .then(function (suc) {
                          $scope.calls = null;
                          hideSheet();
                      }, function (err) {
                          ionicToast.show($translate.instant('call_history.error_deleting_all'), 'middle', false, window.config.timeDisplayingToasts);
                          hideSheet();
                      });
                 } else {
                   hideSheet();
                 }
              });

              break;
            case ADD_TO_CONTACTS:

              console.log(call);

              var numberData = {
                label: 'mobile',
                number: call.members[0].phoneNumbers[0].number
              };
              var data = {
                phones: [numberData]
              };

              //var data = [name, firstNumber, secondNumber];
              navigator.manageContacts.add(data);
            case CANCEL:
              hideSheet();
              break;
          }
        }
      });

      $timeout(function () {
        hideSheet();
      }, 5000);
    }
  }


  //------------------------------------------------------------------------------
  // Groups management in the main screen
  //------------------------------------------------------------------------------

  $rootScope.$on('groups:refresh', function () {
    $scope.main_groups.all();
  });

  // Group management in the main screen
  $scope.main_groups = {

    group: null,
    group_index: -1,

    all: function () {
      GroupSvc.getAll().then(function (groups) {
        $scope.groups = groups;
        Utils.createCallGroupSwiper();
      });
    },

    menu: function (group, groupIndex) {

      this.group = group;
      this.group_index = groupIndex;

      var self = this,
          ACTION_MENU_VIEW = 0,
          ACTION_MENU_DELETE = 1;

      $ionicActionSheet.show({
        buttons: [
          { text: $translate.instant('w_general_actions.view') },
          { text: $translate.instant('w_general_actions.delete') }
        ],
        destructiveText: $translate.instant('w_general_actions.delete_all'),
        cancelText: $translate.instant('w_general_actions.cancel'),
        destructiveButtonClicked: function () {
          self.destroy_all();
          return true;
        },
        buttonClicked: function (index) {
          switch (index) {
            case ACTION_MENU_VIEW:
            {
              self.show();
              break;
            }
            case ACTION_MENU_DELETE:
            {
              self.destroy();
              break;
            }
            default:
              console.log('nada');
          }
          return true;
        }
      });

    },

    show: function (group) {
      if (this.group)
        $state.go('app.groups-show', {group: this.group});
      else
        $state.go('app.groups-show', {group: group});
    },

    destroy: function () {
      var self = this,
          confirmPopup = $ionicPopup.confirm({
            title: $translate.instant('w_groups.delete_title'),
            template: $translate.instant('w_groups.delete_text')
          });
      confirmPopup.then(function (res) {
        if (res)
          GroupSvc.remove_group(self.group);
        else
          return;
      });
    },

    destroy_all: function () {
      var confirmPopup = $ionicPopup.confirm({
        title: $translate.instant('w_groups.delete_title'),
        template: $translate.instant('w_groups.delete_all_text')
      });
      confirmPopup.then(function (res) {
        if (res) {
          GroupSvc.destroy_all();
        } else {
          return;
        }
      });
    },
  };
  $scope.main_groups.all(); // Load all the groups


  $scope.callContact = function (contact) {
    $state.go('callpal', {'members': [contact]});
  };

}



function DialPadCtrl($scope, $state, CallSvc, UserSvc, ContactsSvc) {

  /**
   * @function: @on view enter
   * @description: load the numbers
   **/

  $scope.prefix = CallSvc.getNumber();
  var myNumber = CallSvc.getMyNumber();
  $scope.number = !myNumber ? $scope.prefix : $scope.prefix + myNumber;

  $scope.countries = CallSvc.getCountries();
  $scope.countrySelection = {country: ""};
  $scope.countryObj = CallSvc.getCountry();
  $scope.user = UserSvc.getUserInfo();
  $scope.showAddContactButton = false;


  // Function for entering numbers in dial pad
  $scope.enterDigit = function (item, id_item) {

    // Flash light the item number
    id_item = "#" + id_item;
    $(id_item).css('background', 'rgba(255, 255, 255, 0.5)');
    setTimeout(function () {
      $(id_item).css('background', 'none');
    }, 200);


    $scope.number += item;

    //detect phone's lenght to show add contact Button
    if ($scope.number.length >= 6) {
      $scope.showAddContactButton = true;
    } else {
      $scope.showAddContactButton = false;
    }


  };


  // Function to delete a digit
  $scope.deleteDigit = function () {
    if ($scope.number.length > $scope.countryObj['prefix'].toString().length) {
      $scope.number = $scope.number.substring(0, $scope.number.length - 1);
    }
    if ($scope.number.length >= 6) {
      $scope.showAddContactButton = true;
    } else {
      $scope.showAddContactButton = false;
    }
  };

  //Function to delete all digits
  $scope.clearNumber = function () {

    $scope.number = $scope.countryObj['prefix'];

    if ($scope.number.length >= 6) {
      $scope.showAddContactButton = true;
    } else {
      $scope.showAddContactButton = false;
    }
  }

  $scope.call = function () {

    if ($scope.number.length > 5) {

        var number = $scope.number.substr($scope.prefix.length, $scope.number.length - 1);
        CallSvc.setMyNumber(number);

      // Get the contact name on the contact list
      var displayName = "";
      var contact = ContactsSvc.find_by_phone_number($scope.prefix, number);
      if (contact != null)
        displayName = contact.displayName;

      $state.go('callpal', {
        members: [{
          landline: true,
          landline_number: $scope.number,
          displayName: displayName,
          phoneNumbers: [{number: $scope.number}]
        }]
      });
    }
    else {
      $('#tel').addClass('animated wobble');
    }
  };


  $scope.addContact = function () {
    var numberData = {
      label: 'mobile',
      number: $scope.number
    };
    var data = {
      phones: [numberData]
    };
    //var data = [name, firstNumber, secondNumber];
    navigator.manageContacts.add(data);
  }

  // ------------------------------

  // End Call - go back to dialpad
  $scope.backDialpad = function () {
    $state.go('app.dialpad');
  };


  // Back to country selection (Home)
  $scope.back = function () {
    //$scope.number = '';
    $state.go("app.country");
  };

}


function AdsCtrl($scope,
                 AdsSvc) {


  // Declarations
  $scope.ads = AdsSvc.getAds();


}
