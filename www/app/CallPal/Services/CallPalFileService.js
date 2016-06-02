'use strict';

angular
    .module('callpal.callpal')
    .factory('CallPalFileService', CallPalFileService);

function CallPalFileService($q,
                            $ionicPlatform,
                            $rootScope,
                            UserSvc,
                            $injector,
                            $http,
                            ionicToast,
                            Utils,
                            $cordovaFile) {

  return {


    transmit: function(options) {

      if (options.type == "file") {
        this.sendFile(options.file_data);
      }


      if (options.type == "card") {
        this.sendCard(options.card_data);
      }

    },


    // ---------------------------------------------------------------
    // Share card functions
    // ---------------------------------------------------------------

    sendCard: function(currentCard) {
      var CallPalSvc = $injector.get('CallPalSvc');
      console.log('DEBUG: INF Sharing call');
      ionicToast.show("Sharing ...", 'bottom', false, window.config.timeDisplayingToasts);
      CallPalSvc.sendSipMessage({type: "shared_card", card_data: currentCard});
    },




    // ---------------------------------------------------------------
    // Sharing file functions
    // ---------------------------------------------------------------

    // Send the file to the backend
    sendFile: function (file) {

      var self = this;
      var CallPalSvc = $injector.get('CallPalSvc');
      console.log('DEBUG: INFORMATION ABOUT THE FILE SELECTED : ', file);

      var dfd = $q.defer();

      var uploadUrl = window.config.content.host + "/share_photo_from_call";
      var fd = new FormData();
      fd.append('toshare', file);

      $http.post(uploadUrl, fd, {
        transformRequest: angular.identity,
        headers: {
          'Content-Type': undefined,
          'Authorization': 'Bearer ' + UserSvc.getUserToken()
        }
      }).then(function (response) {
        dfd.resolve(response);
        console.log('DEUBG: Message response uploading file: ', response);
        if (response.data.success)
          CallPalSvc.sendSipMessage({
            type: "shared_file",
            file_data: {url: response.data.url, size: self.formatBytes(file.size)}
          });
      }, function (error) {
        dfd.reject();
        console.log('DEBUG: Message error uploading file', error);
      });

      return dfd.promise;
    },


    // File sharing
    notifyElementShared: function (options) {
      log('DEBUG INFO : options information is: \n\n', options);
      $rootScope.$emit('call:shared_element', options);
    },


    downloadFile: function (file) {

      var self = this;
      var fileLocation = file.location;
      console.log('The file location is : ', fileLocation);

      var fileName = fileLocation.substring(fileLocation.lastIndexOf('/') + 1, fileLocation.length);
      var dfd = $q.defer();

      dfd.reject('error');
      var xhr = new XMLHttpRequest();
      xhr.open("GET", fileLocation);
      xhr.responseType = "blob";

      console.log('Starting file download fileName', fileName);

      xhr.onload = function () {
        console.log('The file was downloaded');
        console.log(this.response);
        //self.renderRemotePicture(this.response, fileLocation);

        if (ionic.Platform.isIOS()) {

          window.plugins.socialsharing.saveToPhotoAlbum(
              [fileLocation, fileName],
              function(success) { console.log('File saved successfully', success); },
              function(error) { console.log('File error saving file', error); }
          );

        }


        if (ionic.Platform.isAndroid()) {

          self.saveRemoteFileOnStorage(this.response, fileName).then(function (fileCreateSuccess) {
            //console.log('DEBUG: INF FILE CREATED \n\n\n');
            //console.log('DEBUG: FILE IS: ', fileCreateSuccess);

            //console.log('DEBUG INF: fileName is: ', fileName);
            //console.log('DEBUG INF: cordova.file.documentsDirectory is: ', cordova.file.documentsDirectory);

            //$cordovaFile.readAsBinaryString(cordova.file.documentsDirectory, fileName).then(function (fileSuccessBinary) {
              //console.log('\n\n DEBUG INF: The file is : ', fileSuccessBinary);
            //}, function (fileErrReading) {
              //console.log('DEBUG: ERR: Error reading files .. ', fileErrReading);
            //});

          }, function (fileCreateErr) {
            console.log('DEBUG: ERR There is an error when trying to create the file');
          });


        }

        return dfd.resolve(this.response);
      };
      xhr.send();
      return dfd.promise;
    },


    createContainerFolder: function (folderName) {
      var dfd = $q.defer();
      var folderPath = Utils.getFolderPath();
      $ionicPlatform.ready(function () {
        $cordovaFile.checkDir(folderPath, folderName).then(function (success) {
              dfd.resolve(success);
            }, function (fail) {
              console.log('DEBUG: ERR Folder does not exists', fail);
              $cordovaFile.createDir(folderPath, folderName, true)
                  .then(function (success) {
                    console.log('DEBUG: INFO $cordovaFile.createDir', success);
                    dfd.resolve(success);
                  }, function (err) {
                    console.log('DEBUG: error $cordovaFile.createDir', err);
                    dfd.reject(err);
                  });
            }
        )
      });
      return dfd.promise;
    },


    saveRemoteFileOnStorage: function (file, fileName) {

      console.log('saveRemoteFileOnStorage file is: ', file);
      console.log('saveRemoteFileOnStorage fileName is: ', fileName);

      var self = this;
      var dfd = $q.defer();
      var folderName = 'files_callpal';

      var storageFolder = cordova.file.externalRootDirectory;

      if (ionic.Platform.isAndroid()) {
        console.log('\n\n This is an Android Device saving the picture in the Android folder \n\n');
        storageFolder = cordova.file.externalRootDirectory;
      }

      if (ionic.Platform.isIOS()) {
        console.log('\n\n This is an IOS device saving the picture in the iOS folder \n\n');
        //storageFolder = cordova.file.documentsDirectory;
        storageFolder = cordova.file.applicationDirectory
      }

      var folderPath = Utils.getFolderPath();

      $cordovaFile.writeFile(storageFolder, fileName, file, true).then(function (response) {
        console.log('DEBUG: INF File  saved succesfullly ', response);
        dfd.resolve(response);
      }, function (err) {
        console.log('DEBUG: Error File not saved succesfullly ', err);
        dfd.reject(err);
      });

      //self.createContainerFolder(folderName).then(function (success) {
      //  console.log('DEBUG: INF createContainerFolder ', success);
      //});

      return dfd.promise;
    },


    formatBytes: function (bytes, decimals) {
      if (bytes == 0) return '0 Byte';
      var k = 1000;
      var dm = decimals + 1 || 3;
      var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      var i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },


    renderRemotePicture: function (file, url) {
      var arrayBufferView = new Uint8Array(file);
      var blob = new Blob([arrayBufferView], {type: "image/jpeg"});
      var urlCreator = window.URL || window.webkitURL;
      var imageUrl = urlCreator.createObjectURL(blob);
      var img = document.querySelector("#user_avatar");
      img.style["background-image"] = "url(" + url + ")";
    },


  }

}
