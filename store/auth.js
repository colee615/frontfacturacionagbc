const AUTH_KEYS = ['token', 'user', 'role', 'roles', 'permissions', 'views'];

const safeJsonParse = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch (_) {
    return fallback;
  }
};

const getStorageValue = (key) => {
  if (!process.client) return null;
  const sessionValue = sessionStorage.getItem(key);
  if (sessionValue !== null) return sessionValue;
  return localStorage.getItem(key);
};

const setStorageValue = (key, value) => {
  if (!process.client) return;
  sessionStorage.setItem(key, value);
  localStorage.removeItem(key);
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

    const token = getStorageValue('token');
    const user = getStorageValue('user');
    const role = getStorageValue('role');
    const rolesRaw = getStorageValue('roles');
    const permissionsRaw = getStorageValue('permissions');
    const viewsRaw = getStorageValue('views');

    const roles = rolesRaw ? safeJsonParse(rolesRaw, []) : [];
    const permissions = permissionsRaw ? safeJsonParse(permissionsRaw, []) : [];
    const views = viewsRaw ? safeJsonParse(viewsRaw, []) : [];

    if (token) {
      commit('setToken', token);
      setStorageValue('token', token);
    }

    commit('setRoles', roles);
    commit('setPermissions', permissions);
    commit('setViews', views);

    setStorageValue('roles', JSON.stringify(roles));
    setStorageValue('permissions', JSON.stringify(permissions));
    setStorageValue('views', JSON.stringify(views));

    const normalizedRole = role
      ? (role === 'admin' ? 'admin' : role)
      : (roles.includes('admin') ? 'admin' : (roles[0] || null));

    if (user) {
      const parsedUser = safeJsonParse(user, null);
      if (parsedUser) {
        const enrichedUser = { ...parsedUser, role: parsedUser.role || normalizedRole };
        commit('setUser', enrichedUser);
        setStorageValue('user', JSON.stringify(enrichedUser));
      }
    }

    if (normalizedRole) {
      commit('setRole', normalizedRole);
      setStorageValue('role', normalizedRole);
    }
  },
  login({ commit }, { token, user, roles = [], permissions = [], views = [] }) {
    if (!process.client) return;

    const normalizedRoles = Array.isArray(roles) ? roles : [];
    const roleLabel = normalizedRoles.includes('admin')
      ? 'admin'
      : (normalizedRoles[0] || 'usuario');
    const enrichedUser = { ...user, role: roleLabel };

    setStorageValue('token', token);
    setStorageValue('user', JSON.stringify(enrichedUser));
    setStorageValue('role', roleLabel);
    setStorageValue('roles', JSON.stringify(normalizedRoles));
    setStorageValue('permissions', JSON.stringify(permissions));
    setStorageValue('views', JSON.stringify(views));

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
