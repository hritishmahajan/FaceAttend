import { configure } from 'quasar/wrappers';

export default configure(function (/* ctx */) {
  return {
    eslint: { warnings: true, errors: true },

    boot: ['pinia', 'axios', 'face-api'],

    css: ['app.scss'],

    extras: ['roboto-font', 'material-icons'],

    build: {
      target: {
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
        node: 'node20',
      },
      vueRouterMode: 'hash',
      // Served from a project subpath on GitHub Pages (/FaceAttend/) in prod.
      publicPath: process.env.NODE_ENV === 'production' ? '/FaceAttend/' : '/',
      env: {
        API_URL: process.env.VITE_API_URL || process.env.API_URL || 'http://localhost:3000',
        APP_BASE: process.env.NODE_ENV === 'production' ? '/FaceAttend' : '',
      },
    },

    devServer: {
      open: false,
      client: {
        overlay: {
          // Don't cover the screen for benign browser noise.
          warnings: false,
          runtimeErrors: error =>
            !/ResizeObserver loop|CoreLocation|kCLError/.test(error?.message ?? ''),
        },
      },
    },

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
