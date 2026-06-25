import Swal from 'sweetalert2';

const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');

const resolveToken = (store) => {
  const stateToken = store && store.state && store.state.auth ? store.state.auth.token : null;
  if (stateToken) return stateToken;
  if (!process.client) return null;
  return sessionStorage.getItem('token') || localStorage.getItem('token');
};

const resolveAdminBaseUrl = ($config) => {
  const fromRuntime = $config && $config.adminApiBaseUrl ? $config.adminApiBaseUrl : '';
  const normalized = `${trimTrailingSlash(fromRuntime)}/`;

  if (process.client && normalized.startsWith('http://') && window.location.protocol === 'https:') {
    return normalized.replace('http://', 'https://');
  }

  return normalized === '/' ? '' : normalized;
};

export default function ({ $axios, $config, store, redirect }, inject) {
  const admin = $axios.create({
    baseURL: resolveAdminBaseUrl($config),
    timeout: 20000,
    headers: {
      common: {
        Accept: 'application/json, text/plain, */*',
        'X-Requested-With': 'XMLHttpRequest'
      }
    }
  });

  admin.interceptors.request.use(config => {
    const token = resolveToken(store);
    config.headers = config.headers || {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  });

  admin.interceptors.response.use(
    response => {
      const contentType = response && response.headers ? (response.headers['content-type'] || '') : '';
      if (typeof contentType === 'string' && contentType.includes('text/html')) {
        Swal.fire({
          icon: 'error',
          title: 'Configuracion API invalida',
          text: 'La URL del backend no apunta a la API (esta devolviendo HTML). Revisa ADMIN_API_BASE_URL.'
        });
        return Promise.reject(new Error('Invalid API base URL: HTML response detected.'));
      }
      return response;
    },
    error => {
      const status = error && error.response ? error.response.status : null;
      const message = error && error.response && error.response.data ? error.response.data.error : null;

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
