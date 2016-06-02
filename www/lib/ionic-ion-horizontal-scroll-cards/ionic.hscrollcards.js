(function(ionic) {

  // SCREENWIDTH = screen.width;
  // CARDWIDTH = 120;


  angular.module('ionic.contrib.ui.hscrollcards', ['ionic'])

    .directive('hscroller', ['$timeout', function($timeout) {
      return {
        restrict: 'E',
        template: '<div class="hscroller" ng-transclude></div>',
        replace: true,
        transclude: true,

        compile: function(element, attr) {
          return function($scope, $element, $attr) {

            var el = $element[0];
            angular.element($element).bind("scroll", function(){
              var left = $element[0].scrollLeft;
              // console.log($element.childNodes);
            });


          }
        },
      }
    }])

    .directive('hcard', ['$rootScope', function($rootScope) {
      return {
        restrict: 'E',
        template: '<div class="hscroller-card" ng-transclude></div>',
        replace: true,
        transclude: true,
        scope: {
          type: '@',
          title: '@',
          image: '@',
          badge: '@',
          index: '@'
        },
        link: function(scope, element, attrs){
          var img = null;
          if(attrs.type == 'channel')
          {
            if(attrs.image){
              img = angular.element("<div class='hscroller-box'><img class='hscroller-img' src='"+attrs.image+"' /></div>");
            }else{
              img = angular.element("<div class='hscroller-avatar' ng-show='!contact.avatar'></div>");
            }

            element.append('<div class="hscroller-label">'+attrs.title+'</div>');
            element.append(img);
            if(attrs.badge > 0){
              element.append('<span class="badge badge-assertive">'+attrs.badge+'</span>');
            }

            var animationClass = 'hscroller-card-animated-' + attrs.index.toString();
            element.addClass(animationClass);

          }else if(attrs.type == 'express'){
            img = angular.element("<img class='hscroller-img' src='" + attrs.image + "'/>");

            //element.append('<div class="hscroller-label">'+attrs.title+'</div>');
            element.append(img);
            element.append('<div class="hscroller-label">'+attrs.title+'</div>');
          }else if(attrs.type == 'category'){
            img = angular.element("<div class='hscroller-img' style='background-image: url(" + attrs.image + ");'/>");

            element.append('<div class="hscroller-label">'+attrs.title+'</div>');
            element.append(img);
            var animationClass = 'hscroller-card-animated-' + attrs.index.toString();
            element.addClass(animationClass);
          }else{
            img = angular.element("<div class='hscroller-img' style='background-image: url(" + attrs.image + ");'/>");

            //element.append('<div class="hscroller-label">'+attrs.title+'</div>');
            element.append(img);
            var animationClass = 'hscroller-card-animated-' + attrs.index.toString();
            element.addClass(animationClass);
          }



        },

      }
    }]);

})(window.ionic);
