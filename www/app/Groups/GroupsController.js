'use strict';

angular
    .module('callpal.groups')
    .controller('GroupsCtrl', GroupsCtrl)

function GroupsCtrl($ionicLoading, $q, $scope, $state, $stateParams, $ionicPopup, $ionicModal, GroupSvc, ionicToast, $translate, Utils) {

  $scope.minDate = moment().add('5', 'minutes');
  $scope.maxDate = moment().add('1', 'years');

  console.log($scope.contacts.list);

  $scope.addToGroupCall = addToGroupCall;


  /////////////
  function addToGroupCall(index) {
    $scope.contacts.list[index].isChecked = true;
  }



  // Group
  $scope.group = {
    reminder: false,
    modal: null,
    modal_edit: null,
    already_exists: false,
    name: null,
    timestamp: new Date(),
    selected_members: [],
    members: [],
    edit_current_members: [],
    group_data: null,
    editable: false,
    pending_changes: false,
    currentContact: null,
    selectedPhone: null,
    phoneSelectedIndex: -1,
    selectNumberPopup: null,


    selectNumber: function (contact) {

      var self = this;

      // clean vars
      //self.currentContact = null;
      self.selectedPhone = null;
      self.phoneSelectedIndex = -1;
      self.selectNumberPopup = null;

      this.currentContact = contact;


      // add check if not callpal user and only has 1 number and is fixed
      if (this.currentContact.hasSpeedDial &&
          Array.isArray(this.currentContact.phoneNumbers) &&
          (this.currentContact.phoneNumbers.length === 1) && !this.currentContact.extension) {
        this.currentContact.isChecked = true;
        this.selected_members.push(this.currentContact);
        console.log('INSPECTING SELECTED MEMBERS OBJECT : ', this.selected_members);
        return;
      }

      // Multiple numbers or multiple options to select
      this.openPhoneSelectionPopup();

    },


    openPhoneSelectionPopup: function () {

      var self = this;

      this.selectNumberPopup = $ionicPopup.show({
        scope: $scope,
        title: 'Number selection',
        subTitle: 'Select one number to call',
        templateUrl: 'app/Groups/Templates/PopupSelectNumber.html',
        buttons: [
          { text: 'Cancel', cancelType: "button-assertive" },
          {
            text: '<b>Continue</b>',
            type: 'button-positive',
            onTap: function(e) {
              if (self.selectedPhone)
                self.saveNumber(self.currentContact);
              else {
                ionicToast.show("Select one number to continue", 'bottom', false, window.config.timeDisplayingToasts);
                e.preventDefault();
              }
            }
          }
        ]
      });

    },


    openCorrectionTool: function(contact, phoneIndex) {

      // after the number is fixed,  
      // add it to selected number and save selected contact
      // 
      var groupCallBack = {
        contact: contact,
        phoneIndex: phoneIndex,
        scope: $scope.group
      };

      this.selectNumberPopup.close();
      $scope.correctionTool.show(contact, phoneIndex, groupCallBack);

    },


    saveNumber: function (selectedContact) {

      console.log('Saving the number: ', this.selectedPhone);
      console.log('The contact selected was : ', selectedContact);
      console.log('The phone selected index is : ', this.phoneSelectedIndex);

      var memberObject = {
        avatar: selectedContact.avatar,
        displayName: selectedContact.displayName,
        username: selectedContact.username,
        phoneNumbers: []
      };

      if (this.selectedPhone) {

        if (this.selectedPhone.length == 29) { // extension call callpal
          console.log('Calling callpal member');
          memberObject.extension = selectedContact.extension;
          var number = selectedContact.phoneNumbers[0];
          number.fixed = false; // To not call landline when callpal extension
          memberObject.phoneNumbers.push(number);
        }

        if (this.selectedPhone.length < 20) {
          console.log('Calling landline number');
          if (self.phoneSelectedIndex != -1) {
            memberObject.phoneNumbers.push(selectedContact.phoneNumbers[this.phoneSelectedIndex]);
          }
        }

      }

      console.log('INSPECTING MEMBER OBJECT : ', memberObject);
      // Add member object to the list of members


      this.selected_members.push(memberObject);
      console.log('INSPECTING SELECTED MEMBERS OBJECT : ', this.selected_members);
      selectedContact.isChecked = true;
      // clean the number
      //this.selectedPhone = null;
      this.phoneSelectedIndex = -1;
      this.currentContact = null


    },


    removeFromGroupCall: function (contact) {

      for (var i in this.selected_members) {

        // Remove by callpal extension

        var currentContactSelected = this.selected_members[i];
        if ((typeof currentContactSelected.extension !== 'undefined') &&
            currentContactSelected.extension === contact.extension) {
          this.selected_members.splice(i, 1);
          contact.isChecked = false;
          console.log('MEMBERS FOR GROUP AFTER REMOVE : ', this.selected_members);
          return;
        }

        // Remove by phoneNumber

        if (Array.isArray(currentContactSelected.phoneNumbers)) {

          for (var j in currentContactSelected.phoneNumbers) {

            var currentSelectedNumber = currentContactSelected.phoneNumbers[j];

            for (var k in contact.phoneNumbers) {

              var currentSelecteNumberContact = contact.phoneNumbers[k];

              if (currentSelectedNumber.real_number == currentSelecteNumberContact.real_number) {
                console.log('IT WAS FOUND');
                this.selected_members.splice(i, 1);
                contact.isChecked = false;
                console.log('MEMBERS FOR GROUP AFTER REMOVE : ', this.selected_members);
                return;
              }

            }

          }
        }


      }

      contact.isChecked = false;

      console.log('MEMBERS FOR GROUP AFTER REMOVE : ', this.selected_members);

    },



    // Basic method to run the call
    runCall: function (options) {

      var dfd = $q.defer();
      dfd.resolve('ok');
      var groupCallExtension = options.groupcall_number || options.number;

      $state.go('callpal', {
        group_call: true,
        groupExtraMembers: options.group_members,
        group_name: options.group_name,
        members: [{
          extension: groupCallExtension,
          name: options.group_name || $translate.instant('w_groups.group_call_title'),
          displayName: options.group_name || $translate.instant('w_groups.group_call_title')
        }]
      });

      return dfd.promise;
    },


    notifyScheduleChange: function () {
      this.edit_update(); // Always update the data for the group
      if (this.reminder != undefined && this.reminder == true) {
        console.log('The schedule for this group it was changed', this.timestamp);
        GroupSvc.changeLocalNotificationSchedule(this.group_data);
      }
      else {
      }
    },

    // Instant call from basic group creation
    instantCall: function () {

      var self = this;

      //
      //this.selected_members = $scope.contacts.selected();



      //if (!GroupSvc.isAtLeastOneCallpalUser(this.selected_members)) {
      //  ionicToast.show($translate.instant('w_groups.at_least_one_callpal'), 'bottom', false, window.config.timeDisplayingToasts);
      //  return;
      //}

      GroupSvc.createInstantCall(this.selected_members).then(function (remoteGroup) {
        if (remoteGroup.data.success) {
          var groupCallExtension = remoteGroup.data.groupcall_number;
          self.runCall({group_members: self.selected_members, group_name: "Group call", groupcall_number: groupCallExtension});
        }
        else {
          ionicToast.show("There is an error creating the group.", 'bottom', false, window.config.timeDisplayingToasts);
        }

      }, function (err) {
        ionicToast.show("There is an error creating the group.", 'bottom', false, window.config.timeDisplayingToasts);
        console.error('DEBUG: An error happened trying to create the group call', err);
      });

      this.unselectContacts();
    },


    // Call from showGroup
    call: function () {
      var self = this;
      var groupCallExtension = this.group_data.groupcall_number;

      // Before call save if is pending
      if (this.pending_changes) {
        this.edit_update().then(function () {
          var callProperties = {
            groupcall_number: groupCallExtension,
            group_name: self.group_data.name,
            group_members: self.group_data.members
          };
          self.runCall(callProperties);
        }, function (err) {
          console.log('DEBUG: ERR in call', err);
        });
      } else {
        var callProperties = {
          groupcall_number: groupCallExtension,
          group_name: self.group_data.name,
          group_members: self.group_data.members
        };
        self.runCall(callProperties);
      }
      this.unselectContacts();
    },


    unselectContacts: function () {
      for (var i in $scope.contacts.list) {
        var currentContact = $scope.contacts.list[i];
        currentContact.isChecked = false;
      }
    },


    // -----------------------------------------------------------------------------
    // Group creation
    // -----------------------------------------------------------------------------

    // Regular group creating and management

    // Init the modal to create the group
    create_init_modal: function () {
      var self = this;
      var dfd = $q.defer();
      $ionicModal.fromTemplateUrl('./app/Groups/Templates/GroupsCreateModalSetup.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        self.modal = modal;
        dfd.resolve('ok');
      });
      return dfd.promise;
    },

    // Show the schedule form
    create_schedule: function () {
      var self = this;
      this.selected_members = $scope.contacts.selected();

      // at least one of the member need to be a callpal member
      //if (!GroupSvc.isAtLeastOneCallpalUser(this.selected_members)) {
      //  ionicToast.show($translate.instant('w_groups.at_least_one_callpal'), 'bottom', false, window.config.timeDisplayingToasts);
      //  return;
      //}

      if (this.modal)
        this.modal.show();
      else
        this.create_init_modal().then(function (success) {
          self.modal.show();
        });
    },

    // Save the schedule and create the group
    create_save_schedule: function () {
      var self = this;
      if (!this.name || this.name.length === 0) {
        $ionicPopup.alert({
          title: $translate.instant('w_general_actions.error'),
          template: $translate.instant('w_groups.mandatory_name')
        });
      } else if (!this.selected_members.length || this.selected_members.length === 0) {
        $ionicPopup.alert({
          title: $translate.instant('w_general_actions.error'),
          template: $translate.instant('w_groups.mandatory_members')
        });
      } else if (this.timestamp && this.timestamp > new Date(new Date() - 3 * 3000)) {
        $ionicLoading.show();

        GroupSvc.schedule_group({
          name: this.name,
          timestamp: this.timestamp,
          members: this.selected_members,
          reminder: this.reminder
        }).then(function () {
          $ionicLoading.hide();

          self.create_hide();
          ionicToast.show($translate.instant('w_groups.schedule_ok'), 'bottom', false, window.config.timeDisplayingToasts);
          self.unselectContacts();
          $state.go('app.country');
        });
      } else {
        $ionicPopup.alert({
          title: $translate.instant('w_general_actions.error'),
          template: $translate.instant('w_groups.invalid_date')
        });
      }
    },

    // Hide group or schedule
    create_hide: function () {
      if (this.modal)
        this.modal.remove();
      this.modal = null;
    },

    // -----------------------------------------------------------------------------
    // Group edition
    // -----------------------------------------------------------------------------

    edit_init_modal: function (action) {
      var self = this;
      var dfd = $q.defer();
      $ionicModal.fromTemplateUrl('./app/Groups/Templates/' + action + '.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        self.modal_edit = modal;
        dfd.resolve('ok');
      });
      return dfd.promise;
    },

    // Enable edit mode
    edit: function () {
      if (!this.editable)
        this.editable = true;
      else
        this.editable = false;
    },

    edit_change_date: function () {
      var self = this;
      if (this.modal_edit)
        this.modal_edit.show();
      else
        this.edit_init_modal("GroupsModalEditDate").then(function (success) {
          self.modal_edit.show();
        });
    },

    edit_save_change_date: function (new_date) {
      this.pending_changes = true;
      this.edit_hide_modal();
      this.timestamp = new_date;
    },

    edit_set_pending_changes: function() {
      this.pending_changes = true;
    },

    edit_hide_modal: function () {
      this.modal_edit.hide();
      this.modal_edit = null;
    },

    // Edit add more members
    edit_change_members: function () {
      var self = this;

      for (var j in self.edit_current_members) {
        var selectedMember = self.edit_current_members[j];

        console.log('selectedMember 1 : ', selectedMember);

        for (var i in $scope.contacts.list) {
          var cMember = $scope.contacts.list[i];

          console.log('selectedMember 2 : ', cMember);

          if (selectedMember.extension === cMember.extension) {
            cMember.isChecked = true;
            break;
          }
        }
      }




      if (this.modal_edit)
        this.modal_edit.show();
      else
        this.edit_init_modal("GroupsModalEditMembers").then(function (success) {
          self.modal_edit.show();
        });
    },

    edit_save_change_members: function () {
      var selectedMembers = $scope.contacts.selected();

      var concatenation = this.edit_current_members.concat(selectedMembers);
      this.edit_current_members = JSON.parse(JSON.stringify(concatenation));

      this.pending_changes = true;
      this.edit_hide_modal();
      this.unselectContacts();
    },


    edit_remove_from_numbers: function (contact, index) {

      var self = this;
      var name_to_show = contact.displayName || contact.phoneNumbers[0].number || "";

      $ionicPopup.confirm({
            title: 'Group call',
            template: "Remove member " + name_to_show + " from group ?"
          })
          .then(function (res) {
            if (res) {
              self.edit_current_members.splice(index, 1);
              self.pending_changes = true;
            }
          });
    },


    edit_update: function () { // Update the group
      var dfd = $q.defer();
      var self = this;

      if (!this.name || this.name.length === 0) {
        $ionicPopup.alert({
          title: $translate.instant('w_general_actions.error'),
          template: $translate.instant('w_groups.mandatory_name')
        });
      } else if (!this.edit_current_members.length || this.edit_current_members.length === 0) {
        $ionicPopup.alert({
          title: $translate.instant('w_general_actions.error'),
          template: $translate.instant('w_groups.mandatory_members')
        });
      } else if ((new Date(this.timestamp.toString())) && (new Date(this.timestamp.toString())) > new Date(new Date() - 3 * 3000)) {

        // update the group with the new properties
        var group_to_update = this.group_data;
        group_to_update.key = this.group_data.key;
        group_to_update.name = this.name;
        group_to_update.timestamp = this.timestamp;
        group_to_update.members = this.edit_current_members;
        group_to_update.reminder = this.reminder;

        $ionicLoading.show();

        GroupSvc.update(group_to_update).then(function () {
          $ionicLoading.hide();

          self.editable = false;
          self.pending_changes = false;
          ionicToast.show($translate.instant('w_groups.edit_ok'), 'bottom', false, window.config.timeDisplayingToasts);
          self.unselectContacts();
          dfd.resolve();
        });
      } else {
        dfd.reject();
        $ionicPopup.alert({
          title: $translate.instant('w_general_actions.error'),
          template: $translate.instant('w_groups.invalid_date')
        });
      }

      return dfd.promise;
    },

    edit_destroy: function () {
      var self = this;
      var confirmPopup = $ionicPopup.confirm({
        title: $translate.instant('w_groups.delete_title'),
        template: $translate.instant('w_groups.delete_text')
      });
      confirmPopup.then(function (res) {
        if (res) {
          GroupSvc.remove_group(self.group_data);
          $state.go('app.country');
        } else {
          return;
        }
      });
    },

  };

  // Init

  if ($state.params.group) { // If there is a group is an update 'cuz the group already exists
    var temp_group = $stateParams.group;
    console.log('DEBUG: INF: temp_group openned is : ', temp_group);
    $scope.group.already_exists = true;
    $scope.group.reminder = temp_group.reminder;
    $scope.group.name = temp_group.name;
    $scope.group.timestamp = temp_group.timestamp;
    $scope.group.edit_current_members = temp_group.members;
    $scope.group.group_data = temp_group;
  }


  // Search

  $scope.search = {
    query: "",
    isEnabled: false,

    enable: function (inputSearchId) {
      this.query = "";
      this.isEnabled = true;
      Utils.showKeyboard(inputSearchId);
    },

    disable: function () {
      this.query = "";
      this.isEnabled = false;
      Utils.hideKeyboard();
    }
  };


};
