//plugins/auth.js
export default ({ store }) => {
  store.dispatch('auth/loadAuthFromStorage');
};
