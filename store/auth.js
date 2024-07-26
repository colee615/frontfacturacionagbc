export const state = () => ({
  token: null,
  user: null,
  role: null, // New state property for role
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
    state.role = user.role; 
  },
  clearUser(state) {
    state.user = null;
    state.role = null; // Clear role when user is cleared
  },
};

export const actions = {
  loadAuthFromStorage({ commit }) {
    if (process.client) {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      if (token) {
        commit('setToken', token);
      }
      if (user) {
        const parsedUser = JSON.parse(user);
        commit('setUser', parsedUser);
      }
    }
  },
  login({ commit }, { token, user }) {
    if (process.client) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      commit('setToken', token);
      commit('setUser', user);
    }
  },
  logout({ commit }) {
    if (process.client) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      commit('clearToken');
      commit('clearUser');
    }
  }
};
