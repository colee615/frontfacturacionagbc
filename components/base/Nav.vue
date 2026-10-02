<template>
  <header class="safe-topbar">
    <div class="safe-topbar-context">
      <button type="button" class="safe-icon-button" aria-label="Mostrar u ocultar menú" aria-controls="sidenav-main" :aria-expanded="menuOpen" @click="$emit('toggle-menu')"><BaseIcon name="menu" /></button>
      <nav class="safe-breadcrumb" aria-label="Ruta de navegación"><nuxt-link to="/">Inicio</nuxt-link><BaseIcon name="chevron" :size="14" /><span>{{ modulo || page || 'Panel principal' }}</span></nav>
    </div>
    <div class="safe-topbar-actions">
      <span class="safe-topbar-date"><BaseIcon name="calendar" :size="16" />{{ dateLabel }}</span>
      <button type="button" class="safe-icon-button" :aria-label="themeLabel" :title="themeLabel" @click="toggleTheme"><BaseIcon :name="isDark ? 'sun' : 'moon'" /></button>
      <div class="safe-user"><span class="safe-avatar">{{ initials }}</span><div><strong>{{ userName }}</strong><small>{{ roleLabel }}</small></div></div>
      <button type="button" class="safe-icon-button safe-logout" aria-label="Cerrar sesión" title="Cerrar sesión" @click="logout"><BaseIcon name="logout" /></button>
    </div>
  </header>
</template>
<script>
export default {
  props: { page: { type: String, default: '' }, modulo: { type: String, default: '' }, menuOpen: Boolean },
  data() { return { isDark: false, dateLabel: new Intl.DateTimeFormat('es-BO', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date()) }; },
  computed: {
    userName() { return (this.$store.state.auth.user || {}).name || 'Mi cuenta'; },
    initials() { return this.userName.split(' ').filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase(); },
    roleLabel() { const auth = this.$store.state.auth; return (auth.roles || []).includes('admin') ? 'Administrador' : (auth.roles || []).includes('usuario') ? 'Operador' : auth.role || 'Usuario'; },
    themeLabel() { return this.isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'; }
  },
  mounted() {
    const saved = localStorage.getItem('theme.pos');
    this.applyTheme(saved ? ['enterprise-dark', 'dark-version'].includes(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches);
  },
  methods: {
    applyTheme(dark) {
      this.isDark = dark;
      document.body.classList.remove('dark-version', 'light-version', 'enterprise-light', 'enterprise-dark');
      document.body.classList.add(dark ? 'enterprise-dark' : 'enterprise-light');
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    },
    toggleTheme() { this.applyTheme(!this.isDark); localStorage.setItem('theme.pos', this.isDark ? 'enterprise-dark' : 'enterprise-light'); },
    async logout() { await this.$store.dispatch('auth/logout'); this.$router.push('/auth/login'); }
  }
};
</script>

