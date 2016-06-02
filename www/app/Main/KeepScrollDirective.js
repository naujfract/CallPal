'use strict';

angular
.module('callpal.main')
.directive('keepScroll', keepScroll);

keepScroll.$inject = ['$state', '$timeout', 'ScrollPositions', '$ionicScrollDelegate'];

function keepScroll ($state, $timeout, ScrollPositions, $ionicScrollDelegate) {
  var directive = {
    restrict: 'A',
    link: link,
  };
  return directive;

  function link(scope, element, attrs) {
    scope.$on('$stateChangeStart', function() {
      ScrollPositions[$state.current.name] = $ionicScrollDelegate.getScrollPosition();
    });

    $timeout(function() {
      var offset = ScrollPositions[$state.current.name];
      if (offset)
        $ionicScrollDelegate.scrollTo(offset.left, offset.top);
    });
  }
}
