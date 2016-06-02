angular.module('callpal.settings')
.factory('CameraSvc', ['$cordovaCamera', '$jrCrop', '$q', '$translate', function ($cordovaCamera, $jrCrop, $q, $translate) {

    var camera = {
        cameraOptions: {
            targetWidth: 600,
            targetHeight: 800,
            quality: 50,
            allowEdit: false,
            correctOrientation: true,
            popoverOptions: true,
            saveToPhotoAlbum: false,
            destinationType: navigator.camera ? navigator.camera.DestinationType.DATA_URL : null, // Camera.DestinationType.DATA_URL | Camera.DestinationType.FILE_URI | Camera.DestinationType.NATIVE_URI
            sourceType: navigator.camera ? navigator.camera.PictureSourceType.CAMERA : null// Camera.PictureSourceType.PHOTOLIBRARY | Camera.PictureSourceType.CAMERA | Camera.PictureSourceType.SAVEDPHOTOALBUM
        },
        cropOptions: {
            width: 400,
            height: 400,
            title: '',
            circle: true
        },
        requestPermisions: function(){
            
            var defered = new $q.defer();
            
            if(ionic.Platform.isAndroid()) defered.resolve(true);
            
            if(ionic.Platform.isIOS()){
                cordova.plugins.diagnostic.isCameraEnabled(function(){
                    defered.resolve(true);
                }, function(){
                    cordova.plugins.diagnostic.requestCameraAuthorization(function(granted){
                        defered.resolve(true);
                    }, function(error){
                        defered.reject(false);
                    });
                });
            }
            
            return defered.promise;
        },
        getPicture: function (pictureSourceType, options) {

            if(!navigator.camera) return false;
            
            if (options) this.cameraOptions = options;

            switch (pictureSourceType) {
                case 'camera':
                    this.cameraOptions.sourceType = navigator.camera ? navigator.camera.PictureSourceType.CAMERA : null;
                    break;
                case 'library':
                    this.cameraOptions.sourceType = navigator.camera ? navigator.camera.PictureSourceType.PHOTOLIBRARY : null;
                    break;
                default:
                    this.cameraOptions.sourceType = navigator.camera ? navigator.camera.PictureSourceType.SAVEDPHOTOALBUM : null;
            }

            return $cordovaCamera.getPicture(this.cameraOptions);
        },
        cropPicture: function(url, options){
            
            this.cropOptions.url = url;
            if (options) this.cropOptions = options;
                        
            var jrCrop = $jrCrop.crop(this.cropOptions);
            
            $('.jr-crop-center-container')
            .last()
            .prepend("<h5 class='row col-80 cropping-text'>" + 
                     $translate.instant('w_settings.camera.crop_message') + 
                     "</h5>");  
             
            return jrCrop;
        }
    };

    return camera;
}]);
