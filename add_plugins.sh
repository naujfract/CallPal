ionic plugin add https://github.com/parronte/cordova-plugin-proximity
ionic plugin add cordova-plugin-vibration
ionic plugin add https://github.com/apache/cordova-plugin-device-push
ionic plugin add https://github.com/apache/cordova-plugin-file.git#3.0.0
ionic plugin add cordova-plugin-media@1.0.1
ionic plugin add https://github.com/apache/cordova-plugin-inappbrowser#1.1.1
ionic plugin add https://github.com/apache/cordova-plugin-whitelist#1.2.1
ionic plugin add https://github.com/renanoliveira/cordova-phone-call-trap@0.1.1  # detect any native incoming call
cordova plugin add cordova-plugin-crosswalk-webview
ionic plugin add https://github.com/alongubkin/audiotoggle.git
ionic plugin add cordova-plugin-camera
ionic plugin add phonegap-plugin-push # Do not install this push plugin for the moment.
#ionic plugin add https://github.com/phonegap-build/PushPlugin.git # Use this plugin for the push notifications instead is deprecated but working
ionic plugin add https://github.com/katzer/cordova-plugin-local-notifications.git
ionic plugin add https://github.com/dbaq/cordova-plugin-contacts-phone-numbers
cordova plugin add https://github.com/litehelpers/Cordova-sn-pushqlite-storage.git
ionic plugin add https://github.com/hazems/cordova-sms-plugin.git
ionic plugin add cordova-plugin-geolocation
ionic plugin add cordova-plugin-network-information
ionic plugin add cordova-plugin-x-toast
#ionic plugin add cordova-plugin-googleplus --variable REVERSED_CLIENT_ID=com.googleusercontent.apps.466131023170-hc1o6tf3d9r8bsospp3jlhvbg464q0rt
ionic plugin add https://github.com/macdonst/SpeechRecognitionPlugin
ionic plugin add https://github.com/EddyVerbruggen/Insomnia-PhoneGap-Plugin.git
ionic plugin add ionic-plugin-keyboard
ionic plugin add https://github.com/katzer/cordova-plugin-background-mode.git
ionic plugin add https://github.com/lampaa/com.lampa.startapp.git
ionic plugin add https://github.com/davidrivasro07/manage-contacts-cordova-plugin
ionic plugin add https://github.com/apache/cordova-plugin-splashscreen
ionic plugin add cordova-plugin-diagnostic
ionic plugin add https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin.git

```

For example, to start a new Ionic project with the default tabs interface, make sure the `ionic` utility is installed:

```bash
$ npm install -g ionic
```

Then run:

```bash
$ ionic start myProject tabs
```

More info on this can be found on the Ionic [Getting Started](http://ionicframework.com/getting-started) page and the [Ionic CLI](https://github.com/driftyco/ionic-cli) repo.

## Issues
Issues have been disabled on this repo, if you do find an issue or have a question consider posting it on the [Ionic Forum](http://forum.ionicframework.com/).  Or else if there is truly an error, follow our guidelines for [submitting an issue](http://ionicframework.com/submit-issue/) to the main Ionic repository.
