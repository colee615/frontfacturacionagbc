// store/auth.js
export const state = () => ({
  token: null,
  user: null,
  role: null,
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
  clearUser(state) {
    state.user = null;
  },
  setRole(state, role) {
    state.role = role;
  },
  clearRole(state) {
    state.role = null;
  },
};

export const actions = {
  loadAuthFromStorage({ commit }) {
    if (process.client) {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      const role = localStorage.getItem('role');

      if (token) {
        commit('setToken', token);
      }

      if (user) {
        commit('setUser', JSON.parse(user));
      }

      if (role) {
        commit('setRole', role);
      }
    }
  },
  login({ commit }, { token, user, role }) {
    if (process.client) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', role);
      commit('setToken', token);
      commit('setUser', user);
      commit('setRole', role);
    }
  },
  logout({ commit }) {
    if (process.client) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      commit('clearToken');
      commit('clearUser');
      commit('clearRole');
    }
  },
};
