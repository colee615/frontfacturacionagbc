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
    if (process.client) {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      const role = localStorage.getItem('role');
      const roles = localStorage.getItem('roles');
      const permissions = localStorage.getItem('permissions');
      const views = localStorage.getItem('views');

      if (token) {
        commit('setToken', token);
      }
      if (roles) {
        commit('setRoles', JSON.parse(roles));
      }
      if (permissions) {
        commit('setPermissions', JSON.parse(permissions));
      }
      if (views) {
        commit('setViews', JSON.parse(views));
      }

      const parsedRoles = roles ? JSON.parse(roles) : [];
      const normalizedRole = role
        ? (role === 'admin' ? 'admin' : role)
        : (parsedRoles.includes('admin') ? 'admin' : (parsedRoles[0] || null));

      if (user) {
        const parsedUser = JSON.parse(user);
        commit('setUser', { ...parsedUser, role: parsedUser.role || normalizedRole });
      }

      if (normalizedRole) {
        commit('setRole', normalizedRole);
      }
    }
  },
  login({ commit }, { token, user, roles = [], permissions = [], views = [] }) {
    if (process.client) {
      const normalizedRoles = Array.isArray(roles) ? roles : [];
      const roleLabel = normalizedRoles.includes('admin')
        ? 'admin'
        : (normalizedRoles[0] || 'usuario');
      const enrichedUser = { ...user, role: roleLabel };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(enrichedUser));
      localStorage.setItem('role', roleLabel);
      localStorage.setItem('roles', JSON.stringify(normalizedRoles));
      localStorage.setItem('permissions', JSON.stringify(permissions));
      localStorage.setItem('views', JSON.stringify(views));

      commit('setToken', token);
      commit('setUser', enrichedUser);
      commit('setRole', roleLabel);
      commit('setRoles', normalizedRoles);
      commit('setPermissions', permissions);
      commit('setViews', views);
    }
  },
  logout({ commit }) {
    if (process.client) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      localStorage.removeItem('roles');
      localStorage.removeItem('permissions');
      localStorage.removeItem('views');
      commit('clearToken');
      commit('clearUser');
      this.$router.push('/auth/login');
    }
  }
};



