import { createApp } from 'vue';
import { Quasar, Notify, Dialog, Loading, LocalStorage } from 'quasar';
import { createPinia } from 'pinia';
import quasarLang from 'quasar/lang/en-US';
import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';
import './css/app.scss';
import App from './App.vue';
import router from './router';

const app = createApp(App);
app.use(createPinia());
app.use(Quasar, {
  plugins: { Notify, Dialog, Loading, LocalStorage },
  lang: quasarLang,
  config: { notify: { position: 'top' } },
});
app.use(router);
app.mount('#app');
