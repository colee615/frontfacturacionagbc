// plugins/auth.js
export default async ({ store, app }) => {
  await store.dispatch('auth/loadAuthFromStorage');

  if (!store.state.auth.token) return;

  try {
    const res = await app.$admin.$get('me');
    const user = res.usuario || null;
    const roles = res.roles || [];
    const permissions = res.permissions || [];
    const views = res.views || [];

    if (user) {
      store.dispatch('auth/login', {
        token: store.state.auth.token,
        user,
        roles,
        permissions,
        views
      });
    }
  } catch (_) {
    store.dispatch('auth/logout');
  }
};
