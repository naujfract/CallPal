'use strict';

angular
  .module('callpal.signup')
  .factory('TellafriendSvc', TellAFriendSvc);

function TellAFriendSvc (Utils, $rootScope, $http, ConfigurationSvc, UserSvc, $state, CallPalHistorySvc, $ionicPopup, ionicToast, $translate) {

  // Getting endpoint address
  var host = ConfigurationSvc.base_endpoint();

  /**
   * @function: @iWannaMyPoint
   * @description: Update the invitations sent by this user
   * @param: Contacts Array
   *
   **/
  var iWannaMyPoints = function(contacts) {
    var contacts_to_send = [];
    var token = UserSvc.getUserToken();
    var user_info = UserSvc.getUserInfo();
    var email = user_info.username;
    if (contacts.length >= 10) {
      // var needConfirmation = true; // update user sent invites if success
      user_info.initialInvitationSent = 1;
      UserSvc.setUserInfo(user_info); // might not be necessary
      updateInviteSent(email, token.value);
    }
    contacts.forEach(function(contact, index, arr) {
      contacts_to_send.push({"name": contact.displayName, "phone": contact.phoneNumbers[0].number});
    });
    // Request object
    var req = {
      method: 'PUT',
      url: (host + '/invite/' + email),
      headers: {
        'Authorization': "Bearer " + token.value,
        'Content-Type': "application/json"
      },
      data: contacts_to_send
    };
    $http(req).then(function (response) {
      console.log('Ok iWannaMyPoints', response);
      // if (needConfirmation) { // if success, update userobj
      //   user_info.initialInvitationSent = 1;
      //   UserSvc.setUserInfo(user_info); // might not be necessary
      //   updateInviteSent(email, token.value);
      // }
    }, function (error) {
      console.error('Error on iWannaMyPoints', error);
    });
  };

  function updateInviteSent(username, tokenValue){
    var req = {
      method: 'PUT',
      url: (host + '/users/initial_invitation_sent/' + username),
      headers: {
        'Authorization': "Bearer " + tokenValue,
        'Content-Type': "application/json"
      },
      data: { initialInviteSent: 1 }
    };
    $http(req).then(function (response) {
      console.log('updated initialInviteSent', response);
    }, function (error) {
      console.error('Error on initialInviteSent', error);
    });
  }


  return {
    /**
     * @function: @checkUserInvitations
     * @description: Check if user shared 10 contacts and handle accordingly
     **/
    checkUserInvitations: function () {
      var userInfo = UserSvc.getUserInfo();
      console.log('userInfo ',userInfo);
      // !window.config.debug &&
      if ((typeof userInfo.initialInvitationSent === 'undefined' || userInfo.initialInvitationSent === 0)) { // if user has not shared with 10 friends

        CallPalHistorySvc.getAll() // get call history
        .then(function (res) {
          var totalCallTime = 0,
              minimun_contacts = 10;

          for(var i=0; res.length>i; i++){ // get duration from each and add to total
            var duration = res[i].duration;
            totalCallTime += duration;
          }
          if (totalCallTime > 300) { // and userTotalTalkTime > 5min
            if ($state.current !== 'app.tellafriend') // if current state is not tell a friend, go to tell a friend.
              $state.go('app.tellafriend', { showFiveMinutePopup: true });
            // listen to state change start: to go or keep in tellafriend state
            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
              if (toState.name === 'callpal') // allow incoming call
                console.log('to state is ', toState);
              else if (toState.name !== 'app.tellafriend' && (typeof userInfo.initialInvitationSent === 'undefined' || userInfo.initialInvitationSent === 0)) { // if toState is not tellafriend
                if (fromState.name !== 'app.tellafriend') { // and from state is not tellafriend, go to tellafriend
                  event.preventDefault(); // prevent state change and show popup
                  $state.go('app.tellafriend', { showFiveMinutePopup: true });

                } else { // if from state is tell a friend, prevent state change and show popup
                  event.preventDefault();
                  $ionicPopup.alert({
                    title: $translate.instant('w_tell_a_friend.title'),
                    template: $translate.instant('w_tell_a_friend.mandatory_invitation', { contacts: minimun_contacts })
                  });
                }
              }
            });
          }
        });
      }
    },

    /**
     * @function: @injectCheckedAttribute
     * @description: Inject checked attribute into the contacts array
     * @param: Contacts Array
     *
     **/
    injectCheckedAttribute: function(contacts) {
      contacts.forEach(function(contact, index, arr) {
        contact.checked = false;
      });
      return contacts;
    },


    /**
     * @function: @gossipWithFriend
     * @description: Tell a friend (send a Text Message/SMS) to the friend phone number
     * This function makes a loop in the contact list and send a SMS message to each user or contact
     * @param: contact_list [{contact}, {contact}] (An Array with the contact list)
     * @return: Promise with the message status list
     * TODO: refactor to single for loop and handle platform case
     **/
    gossipWithFriends: function(contact_list) {
      var textMessage = $translate.instant('w_tell_a_friend.invitation_text');
      var status_messages_by_contacts = []; // TODO: what is this for? possibly remove
      if (Utils.isRunningOnADevice()) {
        var phone_list = [];
        if (ionic.Platform.isIOS()) { // send group sms on ios devices, use cordova-sms-plugin
          for (var i = 0; i < contact_list.length; i++) {// for each contact in list get number and add to array
            var current_contact = contact_list[i];
            for (var io = 0; io < current_contact.phoneNumbers.length; io++) {
              var phoneNumber = current_contact.phoneNumbers[io].number;
              if (io !== 0 && phoneNumber.toString().replace(/\D/g,'') === current_contact.phoneNumbers[io--].number.toString().replace(/\D/g,'')) {
                break; // break function if this number is the same as the previous number
              }
              phone_list.push(current_contact.phoneNumbers[io].number); // add to array
            }
          }
          sms.send(phone_list, textMessage, undefined, function (message) { // send message to phoneNumbersArray
            iWannaMyPoints(contact_list); // // if success, call the API and update invitations sent
            ionicToast.show($translate.instant('w_tell_a_friend.send_ok'), 'bottom', false, window.config.timeDisplayingToasts);
            status_messages_by_contacts = { message: message, contact: current_contact };
          }, function (error) {
            // else show error
            console.error("Error sending the message: " + error.code + ", message: " + error.message);
          });
          return;
        } else if (ionic.Platform.isAndroid()) { // if android, use com.jsmobile.plugins.sms plugin for sms
          for (var i = 0; i < contact_list.length; i++) {
            var current_contact = contact_list[i];
            console.log(current_contact);
            for (var io = 0; io < current_contact.phoneNumbers.length; io++) {
              var phoneNumber = current_contact.phoneNumbers[io].number;
              if (io !== 0 && phoneNumber.toString().replace(/\D/g,'') === current_contact.phoneNumbers[io--].number.toString().replace(/\D/g,'')) {
                break; // break function if this number is the same as the previous number
              }
              var messageInfo = {
                phoneNumber: phoneNumber,
                textMessage: textMessage
              };
              sms.sendMessage(messageInfo, function (message) {
                iWannaMyPoints(contact_list); // if success, call the API and update invitations sent
                status_messages_by_contacts = { message: message, contact: current_contact };
              }, function (error) {
                console.error("Error object: ", error);
                return;
              });
            }
            ionicToast.show($translate.instant('w_tell_a_friend.send_ok'), 'bottom', false, window.config.timeDisplayingToasts);
          }
        }
      }
      return status_messages_by_contacts; // TODO: what is this for? possibly remove
    },


    /**
     * @function: @sendTextMessage
     * @description: Send a text message to a contact
     * @param: contact { contact.phoneNumbers[0].normalizedNumber
     * @param: country {code,caption,active} (Object)
     * @return: The response message (Sent or not sent) from the SMS process
     * NOTE: This function is not in use (Don't delete for now)
     *
     **/
    sendTextMessage: function(contact) {
      var textMessage = $translate.instant('w_tell_a_friend.invitation_text');
      var messageInfo = {
        phoneNumber: contact.phoneNumbers[0].normalizedNumber,
        textMessage: textMessage
      };
      sms.sendMessage(messageInfo, function(message) {
        console.log("Message sent: " + message);
        return message;
      }, function(error) {
        console.error("Error sending the message: " + error.code + ", message: " + error.message);
      });
      return false;
    }

  };

}
