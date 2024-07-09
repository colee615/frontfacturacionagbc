// store/auth.js
export const state = () => ({
  token: null,
  user: null,
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
};

export const actions = {
  loadAuthFromStorage({ commit }) {
    if (process.client) {
      const token = localStorage.getItem('jwt_token'); // Asegúrate de usar el nombre correcto aquí
      const user = localStorage.getItem('user');
      if (token) {
        commit('setToken', token);
      }
      if (user) {
        commit('setUser', JSON.parse(user));
      }
      
      // Escuchar cambios en localStorage para sincronizar el estado entre pestañas
      window.addEventListener('storage', () => {
        const newToken = localStorage.getItem('jwt_token');
        const newUser = localStorage.getItem('user');
        if (newToken) {
          commit('setToken', newToken);
        } else {
          commit('clearToken');
        }
        if (newUser) {
          commit('setUser', JSON.parse(newUser));
        } else {
          commit('clearUser');
        }
      });
    }
  },
  login({ commit }, { token, user }) {
    if (process.client) {
      localStorage.setItem('jwt_token', token); // Asegúrate de usar el nombre correcto aquí
      localStorage.setItem('user', JSON.stringify(user));
      commit('setToken', token);
      commit('setUser', user);
    }
  },
  logout({ commit }) {
    if (process.client) {
      localStorage.removeItem('jwt_token'); // Asegúrate de usar el nombre correcto aquí
      localStorage.removeItem('user');
      commit('clearToken');
      commit('clearUser');
    }
  }
};
