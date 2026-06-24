import { boot } from 'quasar/wrappers';
import axios from 'axios';
import { useAuthStore } from 'src/stores/auth';

const api = axios.create({ baseURL: process.env.API_URL || 'http://localhost:3000' });

export default boot(({ app }) => {
  api.interceptors.request.use(config => {
    const auth = useAuthStore();
    if (auth.token) config.headers.Authorization = `Bearer ${auth.token}`;
    return config;
  });

  api.interceptors.response.use(
    res => res,
    err => {
      if (err.response?.status === 401) {
        const auth = useAuthStore();
        auth.logout();
        window.location.href = '/#/login';
      }
      return Promise.reject(err);
    }
  );

  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
