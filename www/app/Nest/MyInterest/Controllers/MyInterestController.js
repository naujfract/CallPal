"use strict";

angular
  .module('callpal.nest.myinterest')
  .controller('NestMyInterestCtrl', NestMyInterestCtrl)
;


function NestMyInterestCtrl($scope,
                   $rootScope,
                   MyInterestService,
                   $timeout,
                   $ionicPopup,
                   $window,
                   $state,
                   $ionicLoading,
                   SettingsLanguageService,
                   $translate,
                   $ionicPlatform,
                   UserSvc) {

$scope.flag = window.config.flags;

 $scope.main = {
   sections: null,
   savedContent: null,
   savedCategories: [],
   savedKeywords: [],
   savedLanguages: [],
   searchBox: {
     title: null,
     interval: null,
     show: false,
     class: ''
   },
   addKeyBox: {
     interval: null,
     show: false
   },
   langClass: null,
   categories_width: 0,

   init: function()
   {
     var self = this;

     $ionicLoading.show({
       template: '<ion-spinner icon="ripple"></ion-spinner>'
     });

     var container = $('#interestsBox').width();
     self.categories_width = ( ( (container / 3) - 4) - 4) + 'px';
     console.log('categories_width', self.categories_width);
     var userInfo = UserSvc.getUserInfo();
     self.langClass = userInfo.language;

     SettingsLanguageService.get_lang().then(function(language){
         $translate.use(language);
         self.searchBox.title = $translate.instant('w_nest.search');
     });

     MyInterestService.get_tabs()
      .then(function(response){

        MyInterestService.get_interests().then(function(sccss){
          self.savedCategories = sccss.categories;
          self.savedKeywords = sccss.keywords;
          self.savedLanguages = sccss.languages;
          //dfd.resolve(sccss);

          if(response.message != 'Network Error' && self.savedCategories){
            for (var i = 0; i < response[0].childs.length; i++) {
              var savedIndex = self.savedCategories.indexOf(response[0].childs[i].name);
              if (savedIndex != -1) {
                response[0].childs[i].style = 'active';
                //response[0].childs[i] = self.savedContent.categories[savedIndex];
                $scope.interestsActions.selectedInterests.push(response[0].childs[i]);
              }
            }
            $ionicLoading.hide();
            self.sections = response;
            self.searchBox.class = 'slideInRight';
            $timeout(function(){
              self.searchBox.show = true;
              $scope.interestsActions.show = true;

              $rootScope.$broadcast('masonry.reload');
              $scope.interestsActions.show = true;
            }, 800);
          }else{
            $ionicLoading.hide();
            self.sections = response;
            self.searchBox.class = 'slideInRight';
            $timeout(function(){
              self.searchBox.show = true;
              $scope.interestsActions.show = true;

              $rootScope.$broadcast('masonry.reload');
              $scope.interestsActions.show = true;
            }, 800);
          }

        }, function(err){
          $ionicLoading.hide();
          self.sections = response;
          self.searchBox.class = 'slideInRight';
          $timeout(function(){
            self.searchBox.show = true;
            $scope.interestsActions.show = true;

            $rootScope.$broadcast('masonry.reload');
            $scope.interestsActions.show = true;
          }, 800);
          console.log(err);
          //dfd.reject(err);
        });



      }, function(err){
        console.log(err);
      })
   },

   change: function(section, index)
   {
     var self = this;
     section.animated = 'bounceOutDown';
     $scope.main.sections[0].animated = 'bounceOutLeft';
     $scope.main.sections[0].childs_class ='bounceOut';
     $timeout(function(){
       $scope.interestsActions.show = false;
       $scope.main.sections[0].animated ='bounceInUp';
       $scope.main.sections[0].childs_class ='';

       $scope.main.sections[index] = $scope.main.sections[0];
       section.animated = 'bounceInLeft';
       $scope.main.sections[0] = section;
       $timeout(function(){
         switch (section.search) {
           case 'key words':
             var container = $('#interestsBox').width();
             self.categories_width = ( ( (container / 4) - 4) - 4) + 'px';
             break;
           case 'languages':
             var container = $('#interestsBox').width();
             self.categories_width = ( ( (container - 10) - 4) - 4) + 'px';
             break;
         }
         $scope.interestsActions.show = true;
       }, 800);
       $timeout(function(){
         $scope.loading.hide();
       }, 1600);
     }, 1000);

     console.log(section.search);


     //$scope.main.sections[index] = $scope.main.sections[0];
     //$scope.main.sections[0] = section;
   },

   search: function()
   {
     var self = this;

     //$rootScope.$broadcast('masonry.reload');

     if(self.searchBox.interval)
        $timeout.cancel(self.searchBox.interval);

     if(self.addKeyBox.interval)
        $timeout.cancel(self.addKeyBox.interval);

     self.searchBox.interval = $timeout(function () {
       if(self.sections[0].search == 'key words'){
         if(self.searchBox.filterInterests.length == 0){
           self.addKeyBox.interval = $timeout(function () {
             self.addKeyBox.show = true;
           }, 700);

         }else{
           self.addKeyBox.show = false;
         }
       }
     }, 500);
   },

   addKey: function()
   {
     var self = this;
     var newKey = {
       key: self.searchBox.name,
       style: 'active'
     }
     self.sections[0].childs.unshift(newKey);
     self.searchBox.name = '';
     self.addKeyBox.show = false;
   }
 };

 $scope.interestsActions = {
   selectedInterests: [],
   selectedKeywords: [],
   selectedLanguages: [],
   show: false,
   addInterest: function(interest, type)
   {
     switch (type) {
       case 'interests':
         if(!interest.style){
           this.selectedInterests.push(interest);
           interest.style = 'active';
         }else{
           for (var i = 0; i < this.selectedInterests.length; i++) {
             if(this.selectedInterests[i].name == interest.name){
               this.selectedInterests.splice(i, 1);
             }
           }
           interest.style = '';
         }
         break;
      case 'key words':
        if(!interest.style){
          //this.selectedKeywords.push(interest);
          interest.style = 'active';
        }else{
          /*for (var i = 0; i < this.selectedKeywords.length; i++) {
            if(this.selectedKeywords[i].key == interest.key){
              this.selectedKeywords.splice(i, 1);
            }
          }*/
          interest.style = '';
        }
        break;
        case 'languages':
          if(!interest.style){
            this.selectedLanguages.push(interest);
            interest.style = 'active';
          }else{
            for (var i = 0; i < this.selectedLanguages.length; i++) {
              if(this.selectedLanguages[i].title == interest.title){
                this.selectedLanguages.splice(i, 1);
              }
            }
            interest.style = '';
          }
          break;
     }


   },

   continue: function()
   {
     var self = this;
     switch ($scope.main.sections[0].search) {
       case 'interests':
         if (this.selectedInterests.length > 0) {
           $scope.loading.show();
           var keywords = [];
           for (var i = 0; i < this.selectedInterests.length; i++) {
             keywords = keywords.concat(this.selectedInterests[i].keywords);
           }

           if($scope.main.savedKeywords){
             for (var i = 0; i < keywords.length; i++) {
               keywords[i].style = 'active';
               var index = $scope.main.savedKeywords.indexOf(keywords[i].key.replace(/[^a-zA-Z ]/g, "").toLowerCase());
               if (index != -1) {
                 $scope.main.savedKeywords.splice(index, 1);
               }
             }
             for (var i = 0; i < $scope.main.savedKeywords.length; i++) {
               var key = {
                 key: $scope.main.savedKeywords[i],
                 style: 'active'
               }
               keywords.unshift(key);
             }
           }

           self.selectedKeywords = keywords;
           $scope.main.change($scope.main.sections[1], this.get_section('key words', keywords));

         }else{
           $scope.alert.show($translate.instant('w_nest.wait'), $translate.instant('w_nest.no_categories'));
         }
         break;
       case 'key words':
         for (var i = 0; i < $scope.main.sections[2].childs.length; i++) {
           //console.log($scope.main.sections[2].childs[i]);
           if($scope.main.savedLanguages){
             if($scope.main.savedLanguages.indexOf($scope.main.sections[2].childs[i].code) != -1){
               $scope.main.sections[2].childs[i].style = 'active';
               this.selectedLanguages.push($scope.main.sections[2].childs[i]);
             }
           }
         }
         $scope.main.change($scope.main.sections[2], this.get_section('languages', null));
         break;
       case 'languages':
         var categories = [];
         var keywords = [];
         var languages = [];

         for (var i = 0; i < this.selectedKeywords.length; i++) {
           if (this.selectedKeywords[i].style == '') {
             this.selectedKeywords.splice(i, 1);
           }
         }

         for (var i = 0; i < this.selectedInterests.length; i++) {
           categories.push(this.selectedInterests[i].name);
         }
         //console.log(categories);

         for (var i = 0; i < this.selectedKeywords.length; i++) {
           var key = this.selectedKeywords[i].key.replace(/[^a-zA-Z ]/g, "").toLowerCase();
           key = key.replace(/\s+/g, '');
           keywords.push(key);
         }
         //console.log(keywords);

         for (var i = 0; i < this.selectedLanguages.length; i++) {
           languages.push(this.selectedLanguages[i].code);
           console.log(this.selectedLanguages[i]);
         }
         //console.log(languages);

         var interests = {
           categories: categories,
           keywords: keywords,
           languages: languages
         }
         MyInterestService.send_interests(interests)
          .then(function(sccs){
            //console.log(sccs);
            $window.localStorage['interests'] = JSON.stringify(interests);
            $state.go('nest-home');
          }, function(err){
            console.log(err);
          });
         break;
     }
   },

   back: function()
   {

     var self = this;
     switch ($scope.main.sections[0].search) {
       case 'interests':
         $state.go('nest-home');
         break;
       case 'key words':
         $scope.main.change( $scope.main.sections[1], 1);
         break;
       case 'languages':
         $scope.main.change( $scope.main.sections[2], 2);
         break;
       default:

     }
   },

   get_section: function(section, data)
   {
     var index = null;
     for (var i = 0; i < $scope.main.sections.length; i++) {
       if($scope.main.sections[i].search == section)
       {
         index = i;
         if (data) {
           $scope.main.sections[i].childs = data;
         }
       }
     }
     return index;
   }
 }

 $scope.alert = {

   show: function(title, template)
   {
     $ionicPopup.alert({
        title: title,
        template: template
      });
   }
 }

 $scope.loading = {
   show: function()
   {
     $ionicLoading.show({
       template: '<ion-spinner icon="ripple"></ion-spinner>'
     });
   },

   hide: function()
   {
     $ionicLoading.hide();
   }
 };

 // Register BACK button action
 var backButtonBehav = $ionicPlatform.registerBackButtonAction(function(event) {
     $state.go('nest-home');
 }, 100);
 //Then when this scope is destroyed, remove the function
 $scope.$on('$destroy', backButtonBehav);

 $scope.main.init();
}
