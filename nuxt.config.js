//const HOST_NAME = 'https://tr.krasnodar.ru';
const HOST_NAME = /^dev/.test(process.env.NODE_ENV) ? 'http://192.168.61.245:8080' : '//evac.gkukkcodd.krasnodar.ru';

export default {
  ssr: false,
  target: 'static',

  head: {
    titleTemplate: '%s - evac-mobi',
    title: 'evac-mobi',
    htmlAttrs: {
      lang: 'ru'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      {rel: "icon", type: "image/x-icon",  href: "http://gkukkcodd.krasnodar.ru/wp-content/themes/gkukkcodd_new/images/favicon.png"}
    ]
  },

  css: [
  ],

  plugins: [
    '~/plugins/extend-app.js'
  ],

  components: true,

  buildModules: [
    '@nuxtjs/vuetify'
  ],

  modules: [
    '@nuxtjs/proxy'
  ],
  
  router: {
      mode: "hash"
  },
  
  env: {
      rpcUrl:  (/^dev/.test(process.env.NODE_ENV)) ? '/rpc/' : `${ HOST_NAME }/rpc/`,
      apiUrl:  (/^dev/.test(process.env.NODE_ENV)) ? '/api/' : `${ HOST_NAME }/api/`,
      natsWs:  { servers: "wss://tr.krasnodar.ru:4222/", user: "teva", pass: "teva25822" }
  },
  
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      options: { customProperties: true },
      dark: false,
      light: true
    }
  },
  
  proxy: {
          "/api/branding": {
              target: `${ HOST_NAME }/branding`,
              pathRewrite: {'^/api/branding': ''}
          },
          "/api/publicApi": {
              target: `${ HOST_NAME }/channel/api/publicApi`,
              pathRewrite: {'^/api/publicApi': ''}
          },
          "/api": 'http://192.168.61.245:8880',
          "/rpc": `${ HOST_NAME }`
  },
  

  build: {
  }
}
