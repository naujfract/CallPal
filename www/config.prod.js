window.config = {
  share_enabled: true,
  package_name: "com.cp.callpalapp",
  translations: {es: es, en: en, ru: ru, /*pt: pt, fr: fr,*/ default: "en"},
  flags: {
    url: 'https://welcome.callpalnetwork.com/flags-mini/',
    extension: 'png'
  },
  debug: false,
  enable_sip_logs: false,
  api: {
    host: "https://callpalapi.callpalnetwork.com/api",
    protocol: 'https'
  },
  content: {
    host: "https://callpalapicontent.callpalnetwork.com/api/content",
    protocol: 'https'
  },
  channel: {
    host: "https://callpalapicontent.callpalnetwork.com/api/channel",
    protocol: 'https'
  },
  sip: {
    proxy: '149.56.77.175',
    domain: 'sip.callpalnetwork.com',
    servers: ['wss://sip10.callpalnetwork.com:8444']
  },
  push: {
    host: "https://callpalapinotifications.callpalnetwork.com/api"
  },
  tokenExpirationInMinutes: 60,
  timeDisplayingToasts: 2500,
  requestTimeout: 60000,
  requestPercentPoorConnection : 0.1,
  crashReport: {
      sendReport: true,
      url: 'https://callpalapitechsupport.callpalnetwork.com',
      username: 'Tvu5iGzCiBNEHrJL6Mjd',
      password: 'i9rRyk2D9RwjDggr2AAe'
  }

};

window.log = function (str1, object) {
  console.log(str1, object);
};
