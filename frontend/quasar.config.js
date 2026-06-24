/* eslint-env node */
const { configure } = require('quasar/wrappers');

module.exports = configure(function (/* ctx */) {
  return {
    eslint: { warnings: true, errors: true },

    boot: ['axios', 'face-api'],

    css: ['app.scss'],

    extras: ['roboto-font', 'material-icons', 'fontawesome-v6'],

    build: {
      target: { browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'], node: 'node20' },
      vueRouterMode: 'hash',
      // VITE_API_URL is read directly by src/api/client.js via import.meta.env
    },

    devServer: { open: true },

    framework: {
      config: { notify: { position: 'top' } },
      plugins: ['Notify', 'Dialog', 'Loading', 'LocalStorage'],
    },

    animations: 'all',

    ssr: { pwa: false, prodPort: 3001, middlewares: ['render'] },

    pwa: {
      workboxMode: 'generateSW',
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
    },

    cordova: {
      id: 'com.mahajan.attendance',
      noIosLegacyBuildFlag: true,
    },

    capacitor: { hideSplashScreenOnAppLoad: true },

    electron: { inspectPort: 5858, bundler: 'packager' },
  };
});
