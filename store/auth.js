import Cookies from 'js-cookie';

export const state = () => ({
  token: null,
  cajero: null
})

export const mutations = {
  setToken(state, token) {
    state.token = token;
    Cookies.set('token', token); // Guardar el token en una cookie
  },
  setCajero(state, cajero) {
    state.cajero = cajero;
  },
  clearToken(state) {
    state.token = null;
    state.cajero = null;
    Cookies.remove('token'); // Eliminar el token de la cookie
  }
}

export const actions = {
  nuxtServerInit({ commit }, { req }) {
    let token = null;
    // Obtener el token de la cookie si existe
    if (req.headers.cookie) {
      const parsedCookies = cookieparser.parse(req.headers.cookie);
      token = parsedCookies.token;
    }
    commit('setToken', token);
  }
}
