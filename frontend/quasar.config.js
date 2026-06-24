/* eslint-env node */
const { configure } = require('quasar/wrappers');

module.exports = configure(function (/* ctx */) {
  return {
    eslint: { warnings: true, errors: true },

    // Boot files run before the Vue app mounts (order matters)
    boot: ['pinia', 'axios', 'face-api'],

    css: ['app.scss'],

    extras: ['roboto-font', 'material-icons'],

    build: {
      target: {
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
        node: 'node20',
      },
      vueRouterMode: 'hash',
      // Inject API base URL into the bundle via process.env (webpack DefinePlugin)
      env: {
        API_URL: process.env.VITE_API_URL || process.env.API_URL || 'http://localhost:3000',
      },
    },

    devServer: { open: false },

    framework: {
      config: { notify: { position: 'top' } },
      plugins: ['Notify', 'Dialog', 'Loading', 'LocalStorage'],
    },

    animations: 'all',

    cordova: {
      id: 'com.mahajan.attendance',
      noIosLegacyBuildFlag: true,
    },
  };
});
