// plugins/casilla.js
export default function ({ $axios, store, redirect }, inject) {
  const casilla = $axios.create({
    headers: {
      common: {
        Accept: 'text/plain, */*'
      }
    }
  });

  const url = 'http://172.65.10.33:8000/cajero/';
  casilla.setBaseURL(url);

  casilla.interceptors.request.use(config => {
    if (process.client) {
      const token = store.state.auth.token;
      if (token) {
        config.headers.common['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  });

  casilla.interceptors.response.use(
    response => response,
    error => {
      if (error.response.status === 401) {
        redirect('/auth/login');
      }
      return Promise.reject(error);
    }
  );

  inject('casilla', casilla);
}
