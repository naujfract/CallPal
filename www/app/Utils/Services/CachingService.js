'use strict';

angular
    .module('callpal.caching')
    .factory('ImageCachingSvc', ImageCaching);

function ImageCaching($ImageCacheFactory, UserSvc, ContactsSvc, CountryCodesSvc, $q){

    var o = {
        initialImages: [
            'web-assets/img/call/avatar_mask.png',
            'web-assets/img/call/end_call.png',
            
            'web-assets/img/contacts/egg-outline.png',
            'web-assets/img/contacts/egg.png',
            
            'web-assets/img/express/funny.png',
            'web-assets/img/express/happy.png',
            'web-assets/img/express/laugh.png',
            'web-assets/img/express/ok.png',
            'web-assets/img/express/surprised.png',
            
            'web-assets/img/eye-close.png',
            'web-assets/img/eye-open.png',
            
            'web-assets/img/faces/he1.png',
            'web-assets/img/faces/he2.png',
            'web-assets/img/faces/she1.png',
            'web-assets/img/faces/she2.png',
            
            'web-assets/img/icon_nest.png',
            
            'web-assets/img/icons/callpal.png',
            'web-assets/img/icons/tabs-glass.png',
            
            'web-assets/img/langs/es.png',
            'web-assets/img/langs/fr.png',
            'web-assets/img/langs/pt.png',
            'web-assets/img/langs/uk.png',
            
            'web-assets/img/nest/accept.png',
            'web-assets/img/nest/back.png',
            'web-assets/img/nest/cancel.png',
            'web-assets/img/nest/customize.png',
            'web-assets/img/nest/exit.png',
            'web-assets/img/nest/notificationegg.png',
            'web-assets/img/nest/search.png',
            
            'web-assets/img/nest/categories/beauty.png',
            'web-assets/img/nest/categories/biking.png',
            'web-assets/img/nest/categories/boats.png',
            'web-assets/img/nest/categories/gaming.png',
            'web-assets/img/nest/categories/travel.png',

            'web-assets/img/ui/button-green.png',
            'web-assets/img/ui/button-orange.png',
            'web-assets/img/ui/button-red.png',
            'web-assets/img/ui/button-delete.png',
            'web-assets/img/ui/glass-header.png',
            
            'web-assets/img/widgets/w1.png',
            'web-assets/img/widgets/w2.png',
            'web-assets/img/widgets/w3.png',
            'web-assets/img/widgets/w4.png',
            'web-assets/img/widgets/w5.png',
            'web-assets/img/widgets/w6.png',
            'web-assets/img/login/skybg.png'
        ],
        images: [],
        init: function(){
            this.add(this.initialImages);
            this.addUserAvatar();
            this.addContactListAvatar();
            this.addCountriesFlags();
        },
        add: function(imagesUrl){
            if (!(imagesUrl instanceof Array)){
                var randomUrl = this.generateRandomUrl(imagesUrl);
                if(randomUrl){
                    this.images.push(randomUrl);
                }
            }else{
                var length = imagesUrl.length;
                for(var i = 0; i < length; i++){
                    var randomUrl = this.generateRandomUrl(imagesUrl[i]);
                    if(randomUrl){
                        this.images.push(randomUrl);
                    }
                }
            }
        },
        resolve: function(){
            var self = this;
            $ImageCacheFactory.Cache(this.images)
            .then(function(){
                self.initialImages = [];
                self.images = [];
                console.log('DEBUG: Done image caching');
            }, function(error){
                console.log("DEBUG: Error image caching", error);
            });
        },
        generateRandomUrl: function(url){
            if(url && url.length > 2){
                if(url.split('?').length > 1){
                    return url;
                }else{
                    return url + '?' + Math.floor(Math.random() * 11);
                }
            }else{
                return null; 
            }
        },
        addUserAvatar: function(){
            var userInfo = UserSvc.getUserInfo();
            this.add(this.generateRandomUrl(userInfo.avatar));
        },
        addContactListAvatar: function(){
            this.add(ContactsSvc.get_all_avatars());
        },
        addCountriesFlags: function(){
            var countries = CountryCodesSvc.getCountries(),
                length = countries.length;

            for(var i = 0; i < length; i++){
                if(countries[i].code && countries[i].active === "1")
                    this.images.push(window.config.flags.url + countries[i].code.toLowerCase() + '.' + window.config.flags.extension);
            }
        },
        /**
        * David Rivas
        * Use to cache a passed array o images.
        **/
        cacheSpecificImages: function(imgs)
        {
          var deferred = $q.defer();
          $ImageCacheFactory.Cache(imgs)
          .then(function(sccss){
              deferred.resolve(sccss);
          }, function(error){
              deferred.reject(error);
          });

          return deferred.promise;
        }
    };

    return o;
}
