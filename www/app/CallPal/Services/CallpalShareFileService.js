'use strict';

angular
    .module('callpal.callpal')
    .factory('CallPalShareFileService', CallPalShareFileService);


function CallPalShareFileService(ContactsSvc,
                                 $q,
                                 $rootScope,
                                 $timeout,
                                 $state,
                                 SIPService,
                                 CallSvc,
                                 BlockedContactsSvc,
                                 UserSvc,
                                 NotificationsSvc,
                                 Utils,
                                 $http) {





  function setUpDataInterface(userAgent, target,
                              dataRenderId,
                              fileInputId,
                              filenameDisplayId,
                              dataShareButtonId,
                              errorMsgContainerId) {


    // Target has a 'data.' prefix
    var dataTarget = 'data.' + target;
    var dataRender = document.getElementById(dataRenderId);
    var fileInput = document.getElementById(fileInputId);
    var filenameDisplay = document.getElementById(filenameDisplayId);
    var dataShareButton = document.getElementById(dataShareButtonId);
    var errorMsgContainer = document.getElementById(errorMsgContainerId);
    if (errorMsgContainer.childNodes.length === 0) {
      errorMsgContainer.appendChild(document.createTextNode(''));
    }

    // The open data transfer session
    var session;
    // The File object for the chosen local file
    var file = null;
    // An ArrayBuffer of the loaded local File that has actually been loaded
    // into memory
    var loadedFile = null;
    // Metadata for the received file. The metadata has "name" and "type"
    var receivedFileMetadata;
    // The actual received file data
    var receivedFileData;
    // We do not support file chunking, so we can only send small files.
    var maxChunkSize = 16000; // 16 KB
    // The Blob object that combines the received file data and file type.
    // We cannot construct File objects, so we must make a Blob, which does not
    // have a file name.
    var receivedFile;

    // We have placeholder text in the message render box. It should be deleted
    // after we have sent or received our first message. This keeps track of
    // that.
    var noMessages = true;

    // When we receive an invite, we must set up our media handler to read in
    // data from over the RTCDataChannel.
    // Each data transmission consists of three parts:
    //   1) a JSON text object with the fields:
    //          "name" --> file name
    //          "type" --> file type
    //   2) an ArrayBuffer of binary content, which is the actual file.
    //   3) a terminating single newline character
    // The only order restriction on the transmission is that parts 1 and 2 come
    // before the terminating part 3.
    //
    // This then makes a link to the file and puts the file received notice and
    // link into the message display box.
    // After a terminating newline, the session is closed. So, each session has
    // only one file transfer.
    userAgent.on('invite', function (session) {



      session.mediaHandler.on('dataChannel', function (dataChannel) {
        dataChannel.onmessage = function (event) {
          // The terminating empty newline.
          // Here we construct our Blob object and create a download URL
          // and plug it into the message render box.
          if (typeof(event.data) === 'string' && event.data === '\n') {
            receivedFile = new Blob([receivedFileData],
                {type: receivedFileMetadata.type});
            var fileUrl = URL.createObjectURL(receivedFile);
            var msgTag = createDataMsgTag(
                session.remoteIdentity.displayName,
                'data received',
                receivedFileMetadata.name,
                fileUrl
            );
            if (noMessages) {
              dataRender.removeChild(dataRender.children[0]);
              noMessages = false;
            }
            dataRender.appendChild(msgTag);
            session.bye();
            // The file metadata
          } else if (typeof(event.data) === 'string') {
            receivedFileMetadata = JSON.parse(event.data);
            // The actual file content
          } else {
            receivedFileData = event.data;
          }
        };
      });
      session.accept();
    });

    // This fires every time we choose a new file.
    // We display what file we have selected and load it into an ArrayBuffer.
    fileInput.addEventListener('change', function (event) {
      var tmpFile = event.target.files[0];
      if (tmpFile !== undefined && tmpFile !== file) {
        // Reset the loadedFile variable, since we are supposed to load in a
        // new file but have not done so yet.
        // This value might not be set if the file is too large. This is
        // intended. We later prevent ourselves from sending a null file.
        loadedFile = null;
        file = tmpFile;

        var filename = file.name;
        filenameDisplay.childNodes[0].nodeValue = filename;

        // File is small enough to send, so we load it.
        if (file.size <= maxChunkSize) {
          // Clear the error message
          errorMsgContainer.childNodes[0].nodeValue = '';
          var reader = new FileReader();
          reader.onload = (function (e) {
            loadedFile = e.target.result;
          });
          reader.readAsArrayBuffer(file);
        }
        // The file is too large to send. We still display its name, but we
        // do not set the loadedFile variable, which will prevent us from
        // sending it.
        else {
          var errorStr = 'File too large to send using demo (chunking not supported)';
          errorMsgContainer.childNodes[0].nodeValue = errorStr;
        }
      }
    });

    // This shares the loaded file.
    // We invite the target and then send the data to them and wait for a "BYE"
    // response to signal that they got the file.
    dataShareButton.addEventListener('click', function () {
      // No video or audio, only data
      var options = {
        media: {
          constraints: {
            audio: false,
            video: false
          },
          dataChannel: true
        }
      };
      // Make sure we don't try to send nothing
      if (loadedFile !== null) {
        session = userAgent.invite('sip:' + dataTarget, options);

        session.mediaHandler.on('dataChannel', function (dataChannel) {
          dataChannel.onopen = (function () {
            // Send JSON data about file
            dataChannel.send(JSON.stringify({
              name: file.name,
              type: file.type
            }));
            dataChannel.send(loadedFile);
            // Send empty newline to end transmission
            dataChannel.send('\n');
          });
        });

        // Handling the BYE response, which means that we successfully
        // sent the file.
        session.on('bye', function (req) {
          var msgTag = createDataMsgTag(
              userAgent.configuration.displayName,
              'data sent',
              file.name,
              URL.createObjectURL(file)
          );
          if (noMessages) {
            dataRender.removeChild(dataRender.children[0]);
            noMessages = false;
          }
          dataRender.appendChild(msgTag);
        });
      }
    });
  }


}
