// plugins/admin.js
export default function ({ $axios, store, redirect }, inject) {
  const admin = $axios.create({
    headers: {
      common: {
        Accept: 'text/plain, */*'
      }
    }
  });

  const url = 'http://172.65.10.36:10001/admin/';
  admin.setBaseURL(url);

  admin.interceptors.request.use(config => {
    if (process.client) {
      const token = store.state.auth.token;
      if (token) {
        config.headers.common['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  });

  admin.interceptors.response.use(
    response => response,
    error => {
      if (error.response.status === 401) {
        redirect('/auth/login');
      }
      return Promise.reject(error);
    }
  );

  inject('admin', admin);
}
