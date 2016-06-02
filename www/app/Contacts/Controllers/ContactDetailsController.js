"use strict";

angular
    .module('callpal.contacts')
    .controller('ContactDetailsCtrl', ContactDetailsCtrl);


function ContactDetailsCtrl($timeout, Utils, $q, ContactsSvc, $scope, $state, $rootScope, $ionicActionSheet,
                            UserSvc, $ionicModal, ModalsManagerService, CountryCodesSvc, SpeedDialSvc,
                            FavoritesContactsSvc, BlockedContactsSvc, CallSvc, ionicToast, $ionicPlatform, $translate) {

  $scope.flag = window.config.flags;

  $scope.getSelectedBackground = UserSvc.getSelectedBackground;

  $scope.dragged = false;

  $scope.details = {

    contact: null,

    open_native_contact_details: function () {

      var data = {
        id: this.contact.id
      };
      if (window.cordova)
        navigator.manageContacts.open(data);
      else
        alert('DEBUG INF: Option only supported in real device');
    },


    callpal: function (data) {   // Call App-to-App
      this.contact.landline = false;
      this.contact.landline_number = null;

      if (data == "video")
        $state.go('callpal', {members: [this.contact], video_enabled: true});
      else
        $state.go('callpal', {members: [this.contact], video_enabled: false});

    },

    call_landline: function (number_index) {                  // Call to a LandLine number
      if (this.contact.phoneNumbers[number_index].fixed) {
        this.contact.landline = true;
        this.contact.landline_number = this.contact.phoneNumbers[number_index].number;
        $state.go('callpal', {members: [this.contact]});
      } else {
        $scope.correctionTool.show(this.contact, number_index);
      }
    },


    back: function () {
      $state.go('app.contacts');
    },

    refresh_contact: function () {

      var self = this;
      var contactFounded = null;
      console.log('this.contact.phoneNumbers', this.contact.phoneNumbers);

      $rootScope.$emit('contacts:refresh');

      $timeout(function () {
        for (var i in self.contact.phoneNumbers) {
          var currentNumber = self.contact.phoneNumbers[i].real_number || self.contact.phoneNumbers[i].number;
          contactFounded = ContactsSvc.find_by_phone_number(currentNumber);
          console.log('contactFounded', contactFounded);
          if (contactFounded != null) {
            self.contact = contactFounded;
            $scope.$broadcast('scroll.refreshComplete');
            break;
          }
        }
      }, 1300);
    },

    imageTouch: function() {
      $scope.dragged = true;
    },

    endImageTouch: function() {
      $scope.dragged = false;
    }


  };

  //$scope.correctionTool = {
  //
  //  modal: null,
  //  //countries: CallSvc.getCountries(),
  //  countries: [],
  //  search: {},
  //
  //  country: null,
  //  contact: null,
  //
  //  validNumber: false,
  //  phoneNumber: null,
  //  phoneNumberPos: null,
  //  immutablePhoneNumber: null,
  //  originalCountry: undefined,
  //
  //  clearPhone: function (real_number) {
  //    return real_number ? PhoneFormat.cleanPhone(real_number) : null;
  //  },
  //
  //  init: function () {
  //    var self = this;
  //    var dfd = $q.defer();
  //    var userInfo = UserSvc.getUserInfo();
  //
  //    self.countries = [];
  //
  //    var systemCountries = CallSvc.getCountries();
  //    //console.log('CallSvc.getCountries()', CallSvc.getCountries());
  //
  //    systemCountries.find(
  //      function(country, index){
  //
  //        if(country && country.code)
  //        {
  //          if(country.code == userInfo.country)
  //          {
  //            self.countries.push(country);
  //            systemCountries.splice(index, 1);
  //          }
  //
  //          if(userInfo.country != 'US')
  //          {
  //            if(country.code == 'US')
  //            {
  //              self.countries.push(country);
  //              systemCountries.splice(index, 1);
  //            }
  //          }
  //        }
  //
  //      });
  //
  //    self.countries = self.countries.concat(systemCountries);
  //
  //    $ionicModal.fromTemplateUrl('app/Contacts/Templates/ContactsModalCorrectionTool.html', {
  //      scope: $scope,
  //      animation: 'slide-in-up'
  //    }).then(function (modal) {
  //      self.modal = modal;
  //      dfd.resolve();
  //
  //    }, function (error) {
  //      dfd.reject(error);
  //    });
  //
  //    return dfd.promise;
  //  },
  //
  //  clearSelectedCountry: function () {
  //    this.search.caption = "";
  //  },
  //
  //  show: function (contact, phoneNumberPos) {
  //    var self = this;
  //
  //    if(contact.phoneNumbers[phoneNumberPos].countryCode)
  //      this.originalCountry = CountryCodesSvc.getCountryByPhonePrefix(contact.phoneNumbers[phoneNumberPos].countryCode);
  //
  //    this.contact = contact;
  //    this.phoneNumberPos = phoneNumberPos;
  //    this.phoneNumber = contact.phoneNumbers[phoneNumberPos].number;
  //    this.immutablePhoneNumber = contact.phoneNumbers[phoneNumberPos].real_number || contact.phoneNumbers[phoneNumberPos].number;
  //
  //    this.init().then(function () {
  //      self.modal.show();
  //      ModalsManagerService.add({modal_type: "modal", modal_id: "autocorrection_number", modal: self.modal});
  //      if($scope.correctionTool.originalCountry){
  //          $scope.correctionTool.search.caption = $scope.correctionTool.originalCountry.caption;
  //          $scope.correctionTool.country = $scope.correctionTool.originalCountry;
  //      }else{
  //          //var us = CountryCodesSvc.getCountryByAbbv('US')
  //          //$scope.correctionTool.search.caption = us.caption;
  //      }
  //    });
  //
  //  },
  //
  //
  //  select_country: function (country) {
  //
  //    var self = this;
  //
  //    this.country = country;
  //    this.search.caption = country.caption;
  //
  //    // validate if the number is correct
  //    var validObject = Utils.validPhoneNumber(this.immutablePhoneNumber, country.code);
  //    this.validNumber = validObject.valid;
  //
  //    if (this.validNumber) {
  //      this.phoneNumber = validObject.displayedNumber;
  //    } else {
  //      ionicToast.show($translate.instant('w_contacts.correction_tool.invalid_country'), 'middle', false, window.config.timeDisplayingToasts);
  //    }
  //
  //  },
  //
  //
  //  save: function () {
  //    var self = this;
  //    this.validNumber = Utils.validPhoneNumber(this.phoneNumber, this.country.code);
  //
  //    if (this.validNumber){
  //        if(self.phoneNumber !== self.contact.phoneNumbers[this.phoneNumberPos].number ||
  //           !self.contact.phoneNumbers[this.phoneNumberPos].fixed) {
  //          SpeedDialSvc.createOrUpdateSpeedDial(self.contact, self.phoneNumber, self.phoneNumberPos,
  //              self.immutablePhoneNumber, self.country)
  //              .then(function (success) { // Set properties for new speedDial inside contact
  //                console.log('DEBUG: success is: ', success);
  //                ionicToast.show($translate.instant('w_contacts.correction_tool.save_success'), 'bottom', false, window.config.timeDisplayingToasts);
  //                self.notifyContactRefresh();
  //                self.hide();
  //              }, function (error) {
  //                  ionicToast.show($translate.instant('w_contacts.correction_tool.save_error'), 'middle', false, window.config.timeDisplayingToasts);
  //                  console.error('DEBUG: There is an error saving speedDial on the server', error);
  //              });
  //        }else{
  //            self.hide();
  //        }
  //    }else {
  //      ionicToast.show($translate.instant('w_contacts.correction_tool.invalid_country'), 'middle', false, window.config.timeDisplayingToasts);
  //    }
  //  },
  //
  //
  //  notifyContactRefresh: function () {
  //    var self = this;
  //    //$scope.details.refresh_contact();
  //    self.contact.hasSpeedDial = true;
  //    self.contact.phoneNumbers[self.phoneNumberPos].fixed = true;
  //    self.contact.phoneNumbers[self.phoneNumberPos].number = self.phoneNumber;
  //    self.contact.phoneNumbers[self.phoneNumberPos].countryCode = self.country.countryCode;
  //    self.contact.phoneNumbers[self.phoneNumberPos].real_number = self.contact.phoneNumbers[self.phoneNumberPos].number;
  //  },
  //
  //
  //  hide: function () {
  //    this.contact = null;
  //    this.phoneNumberPos = null;
  //    this.phoneNumber = null;
  //    this.immutablePhoneNumber = null;
  //    delete $state.params.showCorrectionTool;
  //    console.log('$state.params.showCorrectionTool;', $state.params.showCorrectionTool);
  //    this.modal.remove();
  //    this.modal = null;
  //  },
  //
  //
  //  validatePhoneNumber: function() {
  //
  //    if (Utils.validPhoneNumber(this.phoneNumber, this.country.code)) {
  //      this.validNumber = true;
  //    }
  //
  //  },
  //
  //};

  $scope.share = {

    modal: null,
    contact: null,
    search: false,
    query: "",
    list: [],


    init: function () {

      var self = this;
      var dfd = $q.defer();

      $ionicModal.fromTemplateUrl('app/Contacts/Templates/ContactsModalShare.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        self.modal = modal;
        dfd.resolve();
      }, function () {
        dfd.reject();
      });

      return dfd.promise;
    },


    open: function (currentContact) {
      var self = this;
      this.contact = currentContact;
      if (this.modal) {
        this.modal.show()
      } else {
        this.init().then(function () {
          self.modal.show();
          ModalsManagerService.add({modal_type: "modal", modal_id: "contact_share", modal: self.modal});
        })
      }

      ContactsSvc.getContactsWithExclusions([currentContact])
          .then(function (contactList) {
            self.list = contactList;
            for (var i in self.list) {
              if (self.list[i].extension) {
                self.list[i].avatar = ContactsSvc.getCachedAvatar(self.list[i].extension);
              }
            }
          })
    },

    close: function () {
      this.modal.remove();
      this.modal = null;
      this.disableSearch();
    },

    share: function (contact_to) {
      ContactsSvc.shareContact(contact_to, this.contact);
      ionicToast.show(this.contact.displayName + ' ' + $translate.instant('w_contacts.shared_with') + ' ' + contact_to.displayName, 'bottom', false, window.config.timeDisplayingToasts);
      this.close();
    },

    enableSearch: function (inputSearchId) {
      this.search = true;
      this.query = "";
        Utils.showKeyboard(inputSearchId);
    },

    disableSearch: function () {
      this.search = false;
      this.query = "";
        Utils.hideKeyboard();
    }

  };

  $scope.options = {

    show: function (contact) {

      if (contact != null && $scope.details) {
        $scope.details.contact = contact;
      }

      var details = {};
      if ($scope.details)
        details = $scope.details;
      else
        details.contact = contact;

      var menu_options = {};
      menu_options.buttons = [{text: $translate.instant('w_general_actions.share'), id: "share"}];
      //if (window.cordova) // Take the contact to the native card
       // menu_options.buttons.push({text: "Edit", id: "edit"}); // TODO Check with david

      // favorite functionality
      if (FavoritesContactsSvc.isCallpalUser(details.contact)) {
        if (! FavoritesContactsSvc.isFavorite(details.contact)) {
          menu_options.buttons.push({text: $translate.instant('w_general_actions.favorite'), id: "favorite_add"});
        } else {
          menu_options.buttons.push({text: $translate.instant('w_contacts.remove_favorite'), id: "favorite_remove"});
        }
      }

      // blocked functionality
      if (BlockedContactsSvc.isCallpalUser(details.contact)) {
        if (! BlockedContactsSvc.isBlocked(details.contact)) {
          menu_options.buttons.push({text: $translate.instant('w_contacts.block_contact'), id: "contact_block"});
        } else {
          menu_options.buttons.push({text: $translate.instant('w_contacts.unblock_contact'), id: "contact_unlock"});
        }
      }

      if (details.contact.hasSpeedDial) // Set the RingTone
        menu_options.buttons.push({text: $translate.instant('w_contacts.assign_ringtone'), id: "set_ringtone"});

      menu_options.cancelText = $translate.instant('w_general_actions.cancel');
      menu_options.cancel = function () {
        $scope.hideSheet();
      };

      menu_options.buttonClicked = function (index) {
        console.log('index #i was pressed', index);

        if (menu_options.buttons[index].id == "set_ringtone") {
          $scope.removeAnimations();
          $state.go('app.settings.ringtones', {fromContact: details.contact.username, contact: details.contact});
        }

        if (menu_options.buttons[index].id == "contact_unlock") {
          BlockedContactsSvc.remove(contact);
        }

        if (menu_options.buttons[index].id == "contact_block") {
          BlockedContactsSvc.add(contact);
        }


        if (menu_options.buttons[index].id == "favorite_remove") {
          FavoritesContactsSvc.remove(contact);
        }

        if (menu_options.buttons[index].id == "favorite_add") {
          FavoritesContactsSvc.add(contact);
        }

        if (menu_options.buttons[index].id == "share") {
          $scope.share.open(details.contact);
        }

        if (menu_options.buttons[index].id == "edit") {
          $scope.details.open_native_contact_details();
        }

        return true;
      };

      // Create the sheet
      $scope.hideSheet = $ionicActionSheet.show(menu_options);
    },


    go: function (where) {
      $state.go(where);
    }

  };


  // Manage state params to this controller
  if ($state.params.sheet)
    $scope.options.show($state.params.contact);


  if ($state.params.contact)
    $scope.details.contact = $state.params.contact;

  if ($state.params.showCorrectionTool) { // Show the correction tool only for one contact
    $scope.correctionTool.show($state.params.contact, 0);
    $state.params.showCorrectionTool = false;
  }

  // Back button behaviors
  $ionicPlatform.onHardwareBackButton(function (event) {
      event.preventDefault();
  });


  // Register BACK button action
  var backButtonBehav = $ionicPlatform.registerBackButtonAction(function (event) {
      $scope.removeAnimations();
      $state.go('app.contacts');
  }, 100);
  //Then when this scope is destroyed, remove the function
  $scope.$on('$destroy', backButtonBehav);

}
