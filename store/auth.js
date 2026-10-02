const AUTH_KEYS = ['token', 'user', 'role', 'roles', 'permissions', 'views'];

const safeJsonParse = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch (_) {
    return fallback;
  }
};

const getStorageValue = (key, rememberMe = false) => {
  if (!process.client) return null;
  const primaryStorage = rememberMe ? localStorage : sessionStorage;
  const secondaryStorage = rememberMe ? sessionStorage : localStorage;
  const primaryValue = primaryStorage.getItem(key);
  return primaryValue !== null ? primaryValue : secondaryStorage.getItem(key);
};

const setStorageValue = (key, value, rememberMe = false) => {
  if (!process.client) return;
  const targetStorage = rememberMe ? localStorage : sessionStorage;
  const otherStorage = rememberMe ? sessionStorage : localStorage;
  targetStorage.setItem(key, value);
  otherStorage.removeItem(key);
};

const clearStorage = () => {
  if (!process.client) return;
  AUTH_KEYS.forEach((key) => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  });
};

export const state = () => ({
  token: null,
  user: null,
  role: null,
  roles: [],
  permissions: [],
  views: [],
});

export const mutations = {
  setToken(state, token) {
    state.token = token;
  },
  clearToken(state) {
    state.token = null;
  },
  setUser(state, user) {
    state.user = user;
  },
  setRole(state, role) {
    state.role = role === 'admin' ? 'admin' : role;
  },
  setRoles(state, roles) {
    state.roles = Array.isArray(roles) ? roles : [];
  },
  setPermissions(state, permissions) {
    state.permissions = Array.isArray(permissions) ? permissions : [];
  },
  setViews(state, views) {
    state.views = Array.isArray(views) ? views : [];
  },
  clearUser(state) {
    state.user = null;
    state.role = null;
    state.roles = [];
    state.permissions = [];
    state.views = [];
  },
};

export const getters = {
  isAuthenticated: (state) => Boolean(state.token),
  isAdmin: (state) => state.roles.includes('admin'),
  isCashier: (state) => state.roles.includes('usuario'),
  can: (state) => (permission) => state.permissions.includes(permission),
  canView: (state) => (viewSlug) => state.views.includes(viewSlug),
};

export const actions = {
  loadAuthFromStorage({ commit }) {
    if (!process.client) return;

    const rememberMe = localStorage.getItem('token') !== null;
    const token = getStorageValue('token', rememberMe);
    const user = getStorageValue('user', rememberMe);
    const role = getStorageValue('role', rememberMe);
    const rolesRaw = getStorageValue('roles', rememberMe);
    const permissionsRaw = getStorageValue('permissions', rememberMe);
    const viewsRaw = getStorageValue('views', rememberMe);

    const roles = rolesRaw ? safeJsonParse(rolesRaw, []) : [];
    const permissions = permissionsRaw ? safeJsonParse(permissionsRaw, []) : [];
    const views = viewsRaw ? safeJsonParse(viewsRaw, []) : [];

    if (token) {
      commit('setToken', token);
      setStorageValue('token', token, rememberMe);
    }

    commit('setRoles', roles);
    commit('setPermissions', permissions);
    commit('setViews', views);

    setStorageValue('roles', JSON.stringify(roles), rememberMe);
    setStorageValue('permissions', JSON.stringify(permissions), rememberMe);
    setStorageValue('views', JSON.stringify(views), rememberMe);

    const normalizedRole = role
      ? (role === 'admin' ? 'admin' : role)
      : (roles.includes('admin') ? 'admin' : (roles[0] || null));

    if (user) {
      const parsedUser = safeJsonParse(user, null);
      if (parsedUser) {
        const enrichedUser = { ...parsedUser, role: parsedUser.role || normalizedRole };
        commit('setUser', enrichedUser);
        setStorageValue('user', JSON.stringify(enrichedUser), rememberMe);
      }
    }

    if (normalizedRole) {
      commit('setRole', normalizedRole);
      setStorageValue('role', normalizedRole, rememberMe);
    }
  },
  login({ commit }, { token, user, roles = [], permissions = [], views = [], rememberMe }) {
    if (!process.client) return;

    const persistAcrossSessions = typeof rememberMe === 'boolean'
      ? rememberMe
      : localStorage.getItem('token') !== null;
    const normalizedRoles = Array.isArray(roles) ? roles : [];
    const roleLabel = normalizedRoles.includes('admin')
      ? 'admin'
      : (normalizedRoles[0] || 'usuario');
    const enrichedUser = { ...user, role: roleLabel };

    setStorageValue('token', token, persistAcrossSessions);
    setStorageValue('user', JSON.stringify(enrichedUser), persistAcrossSessions);
    setStorageValue('role', roleLabel, persistAcrossSessions);
    setStorageValue('roles', JSON.stringify(normalizedRoles), persistAcrossSessions);
    setStorageValue('permissions', JSON.stringify(permissions), persistAcrossSessions);
    setStorageValue('views', JSON.stringify(views), persistAcrossSessions);

    commit('setToken', token);
    commit('setUser', enrichedUser);
    commit('setRole', roleLabel);
    commit('setRoles', normalizedRoles);
    commit('setPermissions', permissions);
    commit('setViews', views);
  },
  async logout({ commit, state }) {
    if (process.client) {
      try {
        if (state.token && this.$admin) {
          await this.$admin.post('logout');
        }
      } catch (_) {
        // Ignore network/logout API errors; local cleanup must still happen.
      }

      clearStorage();
      commit('clearToken');
      commit('clearUser');
      this.$router.push('/auth/login');
    }
  }
};
