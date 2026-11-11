// plugins/auth.js
export default ({ store, app }) => {
  // Restore the cached session synchronously so public routes can render immediately.
  store.dispatch('auth/loadAuthFromStorage');

  const token = store.state.auth.token;
  if (!token || !app.$admin) return;

  // Validate the session in the background; a slow API must not leave the SPA blank.
  app.$admin.$get('me').then((res) => {
    if (store.state.auth.token !== token) return;

    const user = res.usuario || null;
    const roles = res.roles || [];
    const permissions = res.permissions || [];
    const views = res.views || [];

    if (user) {
      store.dispatch('auth/login', {
        token,
        user,
        roles,
        permissions,
        views
      });
    }
  }).catch((error) => {
    // The admin plugin handles 401 cleanup and redirects. Keep cached auth on network errors.
    if (error?.response?.status !== 401) {
      console.warn('No se pudo validar la sesión en segundo plano:', error?.message || error);
    }
  });
};
