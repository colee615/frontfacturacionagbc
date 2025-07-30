import Swal from 'sweetalert2';

export default function ({ $axios, store, redirect }, inject) {
  const admin = $axios.create({
    headers: {
      common: {
        Accept: 'text/plain, */*'
      }
    }
  });
  const url = 'http://172.65.10.36:10001/admin/';

//   const url = 'http://localhost/laravel11/api11fact/apifacturacionagbc/public/admin/';
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
      if (error.response.status === 401 || error.response.status === 403) {
        // Muestra el mensaje de error
        if (error.response.status === 403 && error.response.data.error) {
          Swal.fire({
            icon: 'error',
            title: 'Horario no permitido',
            text: 'El sistema solo está disponible entre las 8 AM y las 7 PM.',
            confirmButtonText: 'Entendido'
          });
        }
        // Redirige a la página de login y cierra sesión en el frontend
        store.dispatch('auth/logout');
        redirect('/auth/login');
      }
      return Promise.reject(error);
    }
  );

  inject('admin', admin);
}
