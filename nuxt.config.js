//const HOST_NAME = 'https://tr.krasnodar.ru';
const HOST_NAME = 'http://192.168.61.245:8080';

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
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
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
      rpcUrl:  (/^dev/.test(process.env.NODE_ENV)) ? '/rpc/' : `${ HOST_NAME }/channel`,
      apiUrl:  (/^dev/.test(process.env.NODE_ENV)) ? '/api/' : `${ HOST_NAME }/channel`,
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
          "/api": `${ HOST_NAME }`,
          "/rpc": `${ HOST_NAME }`
  },
  

  build: {
  }
}
