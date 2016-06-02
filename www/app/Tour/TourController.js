'use strict';

angular
  .module('callpal.tour')
  .controller('TourCtrl', TourCtrl);

function TourCtrl($scope, $state) {

  // Function to go back to login page
  $scope.back = function () {
    $state.go('login');
  };

}
