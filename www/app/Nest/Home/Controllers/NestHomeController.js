"use strict";

angular
  .module('callpal.nest')
  .controller('NestHomeCtrl', NestHomeCtrl)
;


function NestHomeCtrl($scope,
                   $rootScope,
                   $ionicPopup,
                   $ionicLoading,
                   $ionicModal,
                   $localstorage,
                   UserSvc,
                   ContactsSvc,
                   NestHomeService,
                   Utils,
                   $state,
                   $q,
                   $http,
                   $ionicScrollDelegate,
                   $ionicPlatform,
                   $timeout,
                   $cordovaSocialSharing,
                   B2BCallPalSvc,
                   MyInterestService,
                   $window,
                   SettingsLanguageService,
                   $translate) {

  $scope.channels = {

    channels: null,
    modal: null,
    content: null,
    offset: 0,
    moreDataCanBeLoaded: true,
    savedChannels: [],

    load: function()
    {
      var self = this;
      NestHomeService.get_channels()
        .then(function(scs){
          if(scs.data.success && scs.data.channels.length > 0){
            for (var i = 0; i < scs.data.channels.length; i++) {

              if ($window.localStorage['channels']) {

                self.savedChannels = JSON.parse($window.localStorage['channels']);

                self.savedChannels.find(
                  function(channel){

                    if(channel.id == scs.data.channels[i].channel_id){

                      scs.data.channels[i].amount_local = channel.amount;

                    }else{

                      self.savedChannels.push({id: scs.data.channels[i].channel_id,
                                     amount: scs.data.channels[i].amount,
                                     last: scs.data.channels[i].amount});
                    }
                  });
              }else{

                self.savedChannels.push({id: scs.data.channels[i].channel_id,
                               amount: scs.data.channels[i].amount,
                               last: scs.data.channels[i].amount});
              }
            }
            self.channels = scs.data.channels;
            console.log('self.channels', self.channels);
          }
          $window.localStorage['channels'] = JSON.stringify(self.savedChannels);

        }, function(err){
          console.log(err);
        });
    },

    init: function() {
      var self = this;
      var d = $q.defer();
      $ionicModal.fromTemplateUrl('./app/Nest/Home/Templates/ChannelDetailModal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        self.modal = modal;
        d.resolve();
      }, function(err){
        d.reject();
      });
      return d.promise;
    },

    show: function(content) {
      var self = this;

      self.savedChannels.find(
        function(channel){
          if(channel.id === content.channel_id){
            channel.amount = 0;
          }
        });

      $window.localStorage['channels'] = JSON.stringify(self.savedChannels);

      self.get_details(content.channel_id, 12, 0)
        .then(function(sccs){
          console.log('get_details', sccs);
          sccs.list = content;
          if(!sccs.channel[0] && !sccs.channel[0].channel_name){
            sccs.channel[0] = content;
          }
          sccs.channel[0].channel_nickname = sccs.channel[0].channel_name.replace(/ /g,'');
          self.content = sccs;
          if (self.modal) {
            self.modal.show();
          } else
            self.init().then(function() {
              self.modal.show();
            });
        }, function(err){
          console.log(err);
        });
    },

    hide: function()
    {
      var self = this;
      self.modal.hide();
      self.load();
      self.content = null;
      self.offset = 0;
      self.moreDataCanBeLoaded = true;
    },

    get_details: function(id, limit, offset)
    {
      var self = this;
      var d = $q.defer();
      NestHomeService.get_channel_details(id, limit, this.offset)
        .then(function(sccs){
          self.offset = self.offset + 9;
          d.resolve(sccs);
        }, function(err){
          d.reject(err);
          console.log(err);
        });
      return d.promise;
    },

    load_more: function(id, limit)
    {
      var self = this;
      console.log('self.offset', self.offset);
      NestHomeService.get_channel_details(id, limit, self.offset)
        .then(function(sccs){
          if(sccs.content.length > 0){
            self.offset = self.offset + 9;
            var cards = self.content.content;
            cards = cards.concat(sccs.content);
            self.content.content = cards;
            $scope.$broadcast('scroll.infiniteScrollComplete');
          }else{
            self.moreDataCanBeLoaded = false;
            $scope.$broadcast('scroll.infiniteScrollComplete');
          }
        }, function(err){
          console.log(err);
        });
    },

    toggle_follow: function()
    {
      var self = this;
      if (self.content.channel[0].is_following == 0) {
        NestHomeService.follow_channel(self.content.channel[0].channel_id)
          .then(function(sccs){
            self.content.channel[0].is_following = 1;
            console.log(sccs);
          }, function(err){
            console.log(err);
          });
      }else if (self.content.channel[0].is_following == 1) {
        NestHomeService.unfollow_channel(self.content.channel[0].channel_id)
          .then(function(sccs){
            self.content.channel[0].is_following = 0;
            console.log(sccs);
          }, function(err){
            console.log(err);
          });
      }
    }
  }

  $scope.contacts = {

    list: [],
    scroll_status_top: true,
    scroll_status_bottom: true,
    scroll_history: 0,
    contactToShare: [],

    load: function () {
      var dfd = $q.defer();

      var self = this;

      $ionicPlatform.ready(function () {
        //ContactsSvc.refresh().then(function () { // Load the contact list
          var contacts_service = ContactsSvc.all();
          var contacts = [];
          for (var i = 0; i < contacts_service.length; i++) {
            if(contacts_service[i].username)
              contacts.push(contacts_service[i]);
          }
          self.list = contacts;
          dfd.resolve(self.list);
        //});
      });

      return dfd.promise;
    },

    hide: function()
    {
      if($ionicScrollDelegate.getScrollPosition().top > 0 && this.scroll_status_top){
        $('#nestUsersBox').removeClass('nav-down').addClass('nav-up');
        this.scroll_history = $ionicScrollDelegate.getScrollPosition().top;
        this.scroll_status = false;
      }else if($ionicScrollDelegate.getScrollPosition().top < this.scroll_history && this.scroll_status_bottom){
        $('#nestUsersBox').removeClass('nav-up').addClass('nav-down');
      }

    },

    addToShare: function(contact)
    {
      if (contact.selected) {
        contact.style = 'active';
        this.contactToShare.push(contact.username);
      }else{
        contact.style = '';
        this.contactToShare.splice(this.contactToShare.indexOf(contact.username), 1);
      }
    }

  };

  $scope.categories = {
    list: [],
    translatedCategories: [],
    load: function(){

      var dfd = $q.defer();
      var self = this;

      MyInterestService.get_interests().then(function(sccss){
        if(sccss.success){
          for (var i = 0; i < sccss.categories.length; i++) {

            var translatedCategory = null;

            console.log('sccss.categories[i]', sccss.categories[i]);
            self.translatedCategories.find(
              function(tCategory){
                if(tCategory.name == sccss.categories[i])
                {
                  translatedCategory = tCategory.translated;
                  console.log(tCategory);
                }
              });

            var category = {
              title: sccss.categories[i],
              translated: translatedCategory,
              image: './web-assets/img/nest/categories/' + sccss.categories[i].replace(' & ','').toLowerCase() + '.svg',
            }
            console.log('category', category);
            self.list.push(category);
          }
        }
        dfd.resolve(sccss);
      }, function(err){
        dfd.reject(err);
      });
    }
  };

  $scope.interests = {
    interests_array: [],
    times: 0,
    search: [],
    selected_category: null,
    interested_loaded: true,

    load: function()
    {
      var dfd = $q.defer();
      var self = this;

      self.interests_array = [];

      NestHomeService.get_content()
        .then(function(rps){
          for (var i = 0; i < rps.length; i++) {
            self.interests_array.push(rps[i]);
          }
          console.log('NestHomeService.get_content()', rps);
          console.log('self.interests_array', self.interests_array);
        }, function(err){
          self.interested_loaded = false;
          console.log('NestHomeService.get_content()',err);
        });
    },

    load_more: function()
    {
      var self = this;
      for (var i = 0; i < 6; i++) {
        self.interests_array.push(NestHomeService.get_interest());
      }
      $scope.$broadcast('scroll.infiniteScrollComplete');
    },

    categoryFilter: function(category)
    {
      if(this.selected_category != category){
        console.log('categoryFilter', category);
        this.selected_category = category;
        this.search.categories = category;
        $ionicScrollDelegate.$getByHandle('interests').scrollTop();
        setTimeout(function(){
          $rootScope.$broadcast('masonry.reload');
        }, 500);
      }else{
        this.selected_category = '';
        this.search.categories = '';
        $ionicScrollDelegate.$getByHandle('interests').scrollTop();
        setTimeout(function(){
          $rootScope.$broadcast('masonry.reload');
        }, 500);
      }

    }
  }

  $scope.main = {
    keyword: null,
    loaded: false,
    search_placeholder: '',
    langClass: null,

    start: function()
    {
      var self = this;
      $ionicLoading.show({
        template: '<ion-spinner icon="ripple"></ion-spinner>'
      });

      var userInfo = UserSvc.getUserInfo();
      self.langClass = userInfo.language;

      SettingsLanguageService.get_lang().then(function(language){
          $translate.use(language);
          self.search_placeholder = $translate.instant('w_nest.home.search_placeholder');
      });

      MyInterestService.get_tabs()
        .then(function(sccs){
          console.log(sccs[0].childs);
          $scope.categories.translatedCategories = sccs[0].childs;

          $q.all([
              $scope.contacts.load(),
              $scope.channels.load(),
              $scope.categories.load(),
              $scope.interests.load()
          ]).then(function(value) {
            $ionicLoading.hide();
            self.loaded = true;
          });

        }, function(err){
          console.log(err);
        });
    },

  }

  $scope.detail = {

    modal: null,
    content: null,
    actions :
    {
      type: null,
      box:{
        class: null,
        classByType: null,
      }
    },
    video: {
      width: screen.width,
      height: (screen.width * 50) / 100
    },
    expressions: null,
    cardContentClass: null,
    selectedExpression: null,
    activeAction: null,
    search_placeholder_translate: $translate.instant('w_nest.search_contacts'),

    init: function() {
      var self = this;
      var d = $q.defer();
      $ionicModal.fromTemplateUrl('./app/Nest/Home/Templates/ContentDetailModal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        self.modal = modal;
        d.resolve();
      }, function(err){
        d.reject();
      });
      return d.promise;
    },

    show: function(content, from) {
      var self = this;
      content.from = from;
      self.content = content;
      console.log('self.content', self.content);
      self.modal = null;
      console.log('self.modal', self.modal);
      if (self.modal) {
        self.modal.show();
      } else
        self.init().then(function() {
          self.modal.show();
        });
    },

    hide: function()
    {
      var self = this;
      self.actions.box.class = '';
      self.cardContentClass = '';
      self.modal.hide();
    },

    show_actions: function(type)
    {
      var self = this;
      this.activeAction = type;

      this.toggle_actions();

      this.actions.type = type;
      this.actions.box.classByType = type;

      if (type == 'express'){
        this.expressions = B2BCallPalSvc.get_expressions();
      }else if (type == 'archive') {
        B2BCallPalSvc.save_on_gallery(this.content.media_image_mobile)
          .then(function(sccs){
            console.log(sccs);
            $timeout(function(){
              self.actions.box.class = 'active slideOutDown';
              self.cardContentClass = '';
            }, 1500);
          }, function(err){
            console.log(err);
          });
      }
    },

    share: function(content)
    {
      var self = this;
      $scope.loading.show();
      $ionicPlatform.ready(function() {

        $cordovaSocialSharing
          .share(content.media_title,
          content.media_description,
          content.media_image_mobile,
          content.media_link) // Share via native share sheet
          .then(function(result) {
            $scope.loading.hide();
            self.toggle_actions();
            console.log(result);
          }, function(err) {
            $scope.loading.hide();
            self.toggle_actions();
            console.log(err);
          });

      });

    },

    share_with_pals: function(type)
    {
      var self = this;

      if($scope.contacts.contactToShare.length > 0){
        $scope.loading.show();
        B2BCallPalSvc.share_with_pals($scope.contacts.contactToShare, this.content)
          .then(function(sccs){
            $scope.loading.hide();
            $scope.contacts.contactToShare = [];
            $scope.contacts.list.find(
              function(contact){
                if(contact.style){
                  delete contact['style'];
                  delete contact['selected'];
                }
              });
            self.actions.box.class = 'active slideOutDown';
            self.cardContentClass = '';
            console.log(sccs);
          }, function(err){
            $scope.loading.hide();
            self.actions.box.class = 'active slideOutDown';
            self.cardContentClass = '';
            console.log(err);
          });
      }else{
        $scope.alert.show($translate.instant('w_nest.wait'), $translate.instant('w_nest.no_pals'));
      }
    },

    setExpression: function(expression)
    {
      this.selectedExpression = expression.id;
    },

    send_express: function()
    {
      var self = this;
      if(this.selectedExpression){

        var expression = {
          id: this.selectedExpression
        };

        if(this.comment)
          expression.comment = this.comment;
        else
          expression.comment = '';

        $scope.loading.show();
        B2BCallPalSvc.send_express(expression, this.content)
          .then(function(rps)
          {
            self.selectedExpression = null;
            self.comment = null;
            $scope.loading.hide();
            self.actions.box.class = 'active slideOutDown';
            self.cardContentClass = '';
            console.log(rps);
          }, function(err){
            self.selectedExpression = null;
            self.comment = null;
            $scope.loading.hide();
            self.actions.box.class = 'active slideOutDown';
            self.cardContentClass = '';
            console.log(err);
          })
      }else{
        $scope.alert.show($translate.instant('w_nest.wait'), $translate.instant('w_nest.no_categories'));
      }
    },

    delete_content: function()
    {
      var self = this;
      var confirmPopup = $ionicPopup.confirm({
         title: 'Confirmation',
         template: 'Are you sure you want to delete this content?'
       });

       confirmPopup.then(function(res) {
         if(res) {
           console.log('You are sure');
           $scope.loading.show();
           B2BCallPalSvc.delete_content(self.content)
             .then(function(rps)
             {
               $scope.loading.hide();
               self.hide();
               $scope.interests.load();
               console.log(rps);
             }, function(err){
               console.log(err);
             })
         } else {

         }
       });
    },

    cancel_share: function()
    {
      this.actions.box.class = 'active slideOutDown';
      this.cardContentClass = '';
    },

    toggle_actions: function()
    {
      this.actions.box.class = 'active slideInUp';
      this.cardContentClass = 'blur';

      /*if(this.actions.box.class == 'active slideInUp')
      {
        this.actions.box.class = 'active slideOutDown';
        this.cardContentClass = '';
      }else{
        this.actions.box.class = 'active slideInUp';
        this.cardContentClass = 'blur';
      }*/
    },

    save_on_gallery: function()
    {
      console.log(this.content);
      B2BCallPalSvc.save_on_gallery(this.content.media_image_mobile)
        .then(function(sccs){
          console.log(sccs);
        }, function(err){
          console.log(err);
        })
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

  $scope.alert = {

    show: function(title, template)
    {
      $ionicPopup.alert({
         title: title,
         template: template
       });
    }
  }

  // Register BACK button action
  var backButtonBehav = $ionicPlatform.registerBackButtonAction(function(event) {
      $state.go('app.country');
  }, 100);
  //Then when this scope is destroyed, remove the function
  $scope.$on('$destroy', backButtonBehav);

  $scope.main.start();

}
