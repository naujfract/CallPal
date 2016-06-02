angular.module('callpal.settings')

  .controller("SettingsCallHistoryCtrl", function ($scope, CallPalHistorySvc, DBA) {

    CallPalHistorySvc
      .getAll()
      .then(function (calls) {
        $scope.calls = calls;
      });

    $scope.clear = function () {
      DBA.delCollection('calls');
      $scope.calls = [];
    };

    //// Loading modules
    //HistoryCallSvc = $injector.get('HistoryCallSvc');
    //SettingsSvc = $injector.get('SettingsSvc');
    //UserSvc = $injector.get('UserSvc');
    //ionicToast = $injector.get('ionicToast');
    //$ionicPopover = $injector.get('$ionicPopover');
    //$ionicPopup = $injector.get('$ionicPopup');
    //$ionicLoading = $injector.get('$ionicLoading');
    //$localstorage = $injector.get('$localstorage');
    //var CallsDbSvc = $injector.get('CallsDbSvc');
    //var MembersDbSvc = $injector.get('MembersDbSvc');
    //
    //// Scope vars
    //$scope.calls = [];
    //$scope.call = {};
    //
    ///**
    // * @function: @loadCalls
    // * @description: loadCalls
    // *
    // **/
    //$scope.loadCalls = function () {
    //  $scope.calls = [];
    //  CallsDbSvc.all().then(function (calls) {
    //    calls.forEach(function (call, index, arr) {
    //      call.members = [];
    //      MembersDbSvc.find_by_call_id(call.call_id).then(function (members) {
    //        call.members = members.rows;
    //      });
    //      $scope.calls.push(call);
    //    });
    //  });
    //}
    //
    //$scope.$on('$ionicView.enter', function (e) {
    //  $scope.loadCalls();
    //});
    //
    //
    ///**
    // * @function: @if_is_group_call
    // * @description: Detect if the call belongs to a group
    // *
    // **/
    //$scope.if_is_group_call = function (call) {
    //  if (call.members != undefined) {
    //    if (call.members.length > 1) return true;
    //    if (call.members.length == 1) return false;
    //  }
    //  return false;
    //}
    //
    ////-------
    //
    //
    ///**
    // * @function: @clearCallHistory
    // * @description: Clear all the calls in the history list
    // **/
    //$scope.clearCallHistory = function () {
    //  HistoryCallSvc.clearCallHistory();
    //  $scope.loadCalls();
    //};
    //
    //
    ///**
    // * @function: @deleteCall
    // * @description: delete this call from the call history
    // **/
    //$scope.deleteCall = function (call) {
    //  HistoryCallSvc.deleteCall(call);
    //  $scope.loadCalls();
    //  $scope.closeCallDetailsModal();
    //};
    //
    //
    ///**
    // * @state: TODO
    // * @function: @exportCalls
    // * @description: Export the user calls to another user or send via email
    // **/
    //$scope.exportCalls = function () {
    //}
    //
    ////--------------------------------------------------------------------------
    //
    //
    ///**
    // * @function: @initializeCallDetailsModal
    // * @description: Show the contact details
    // **/
    //var initializeCallDetailsModal = function () {
    //  $ionicModal = $injector.get('$ionicModal');
    //  $ionicModal.fromTemplateUrl('app/Settings/templates/callhistorydetails.html', {
    //    scope: $scope,
    //    animation: 'slide-in-up'
    //  }).then(function (modal) {
    //    $scope.call_details_modal = modal;
    //  });
    //};
    //initializeCallDetailsModal();
    //
    //
    ///**
    // * @function: @showCallDetails
    // * @description: When you click to see the call details
    // * @return:
    // **/
    //$scope.showCallDetails = function (index, $event) {
    //  $scope.call = $scope.calls[index];
    //  $scope.members = HistoryCallSvc.members_to_array($scope.call.members);
    //  $scope.call_details_modal.show();
    //}
    //
    //
    ///**
    // * @function: @closeCallDetailsModal
    // * @description: Close the modal
    // * @return:
    // **/
    //$scope.closeCallDetailsModal = function () {
    //  $scope.call_details_modal.hide();
    //};
    //
    //
    ///**
    // * @function: @on.destroy
    // * @description: Destroy the modal
    // * @return:
    // **/
    //$scope.$on('$destroy', function () {
    //  $scope.call_details_modal.remove();
    //  $scope.popover.remove();
    //});
    //
    //
    //// Popover controls (Clear call history)
    ////-------------------------------------------------
    //
    ///**
    // * @function: @Popover to clear the call history
    // * @description:
    // **/
    //$ionicPopover.fromTemplateUrl('app/Settings/templates/callhistorypopover.html', {
    //  scope: $scope
    //}).then(function (popover) {
    //  $scope.popover = popover;
    //});
    //
    //
    ///**
    // * @function: @openPopover
    // * @description: open the popover
    // **/
    //$scope.openPopover = function ($event) {
    //  $scope.popover.show($event);
    //};
    //
    //
    ///**
    // * @function: @closePopover
    // * @description: close the popover
    // **/
    //$scope.closePopover = function () {
    //  $scope.popover.hide();
    //};
    //
    //
    ///**
    // * @function: @showConfirm
    // * @description: The user need confirm before clear all the call history
    // **/
    //$scope.showConfirm = function () {
    //  var confirmPopup = $ionicPopup.confirm({
    //    title: 'Clear call history',
    //    template: 'Are you sure ?'
    //  });
    //  confirmPopup.then(function (res) {
    //    if (res) {
    //      $scope.clearCallHistory(); // cleaning the call history list
    //      $scope.closePopover();
    //    } else {
    //      $scope.closePopover();
    //    }
    //  });
    //};
    //
    //// Icons functionalities
    ////-------------------------------------------------
    //
    ///**
    // * @function: @draw_phone_icon
    // * @description: Return the class name for the icon call
    // * @param: call_type :strings => [incoming, outgoing, missed]
    // **/
    //$scope.draw_phone_icon = function (call_type) {
    //  if (call_type == "outgoing")
    //    return "ion-ios-telephone";
    //  if (call_type == "incoming")
    //    return "ion-ios-telephone";
    //  if (call_type == "missed")
    //    return "ion-ios-telephone-outline";
    //  return "ion-ios-telephone";
    //}
    //
    //
    ///**
    // * @function: @draw_phone_arrow
    // * @description: Return the class name for the icon arrow call
    // * @param: call_type :strings => [incoming, outgoing, missed]
    // **/
    //$scope.draw_phone_arrow = function (call_type) {
    //  if (call_type == "outgoing")
    //    return "ion-arrow-right-a";
    //  if (call_type == "incoming")
    //    return "ion-arrow-left-a";
    //  if (call_type == "missed")
    //    return "ion-close";
    //  return "ion-arrow-right-a";
    //}

  });
