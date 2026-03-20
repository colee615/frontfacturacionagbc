import Swal from 'sweetalert2';

export default function ({ $axios, store, redirect }, inject) {
  const admin = $axios.create({
    headers: {
      common: {
        Accept: 'application/json, text/plain, */*'
      }
    }
  });

  const url = 'https://safe.correos.gob.bo/admin/';
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
      const status = error?.response?.status;
      const message = error?.response?.data?.error;

      if (status === 401) {
        store.dispatch('auth/logout');
        redirect('/auth/login');
      } else if (status === 403) {
        Swal.fire({
          icon: 'error',
          title: 'Acceso denegado',
          text: message || 'No tienes permiso para esta accion',
          confirmButtonText: 'Entendido'
        });
      }

      return Promise.reject(error);
    }
  );

  inject('admin', admin);
}
