'use strict';
/**
 * Created by callpalllc on 1/11/16.
 */


angular.module("callpal.main").factory("ModalsManagerService", ['$rootScope', '$ionicLoading', function($rootScope, $ionicLoading) {

  var callFinishingTime = 60;

  var Self = {


    modals: [],

    // determine the time for notify the user when call goes to background


    // Add a new modal
    add: function (modal_data) { // modals_data => { modal_type: "popup|modal", modal_id: "id_of_modal", modal_reference: ionicModal }
      Self.modals.push(modal_data);
      console.log('A new modal was opened');
    },
    //set the time in seconds
    setCallFinishingTime : function (val) {
      callFinishingTime = val;
    },
    getCallFinishingTime : function () {
      return callFinishingTime;
    },

    // Close all modals
    closeAll: function() {
      console.log('destroying all modals.');

      try {

        $ionicLoading.hide();

        if (Self.modals) {
          Self.modals.forEach(function (modal, pos, arr) {

            console.log('current modal', modal);
            if (modal && modal.modal != null && modal.modal != undefined) {

              if (modal.modal_type != null && modal.modal_type != undefined) {
                if (modal.modal_type == "popup") {
                  modal.modal.close();
                  modal = null;
                } else if (modal.modal_type == "modal") {
                  modal.modal.hide();
                  modal = null;
                }

              }

            }
          });
        }

      } catch (err) {}

    },

  };


  // Listen for events in order to destroy the modals
  $rootScope.$on('call:destroy_modals', function (e) {
    console.log('destroying modals...');
    Self.closeAll();
  });


  return Self;

}]);
