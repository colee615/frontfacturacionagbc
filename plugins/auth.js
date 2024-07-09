export default ({ store }) => {
  store.dispatch('auth/loadAuthFromStorage');
};
