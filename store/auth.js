export const state = () => ({
  token: null,
  user: null,
})

export const mutations = {
  setToken(state, token) {
    console.log('Setting token:', token);
    state.token = token;
  },
  clearToken(state) {
    state.token = null;
  },
  setUser(state, user) {
    console.log('Setting user:', user);
    state.user = user;
  },
  clearUser(state) {
    state.user = null;
  }
}

export const actions = {
  nuxtServerInit({ dispatch }) {
    dispatch('loadAuthFromStorage');
  },
  loadAuthFromStorage({ commit }) {
    if (process.client) {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');

      if (token) {
        commit('setToken', token);
      }

      if (user) {
        commit('setUser', JSON.parse(user));
      }
    }
  }
}
