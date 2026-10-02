<template>
  <div v-if="user" class="enterprise-shell safe-shell" :class="{ 'safe-menu-open': mobileOpen, 'safe-menu-collapsed': collapsed }">
    <a href="#main-content" class="safe-skip-link">Ir al contenido</a>
    <div v-if="mobileOpen" class="safe-sidebar-backdrop" @click="closeMenu"></div>
    <BaseAside @close="closeMenu" />
    <main id="main-content" class="enterprise-admin-theme enterprise-main-shell" tabindex="-1">
      <BaseNav :page="page" :modulo="modulo" :menu-open="isMobile ? mobileOpen : !collapsed" @toggle-menu="toggleMenu" />
      <div class="container-fluid enterprise-admin-surface enterprise-admin-layout">
        <div class="enterprise-admin-body"><slot name="body" /></div>
        <BaseFooter />
      </div>
    </main>
  </div>
</template>
<script>
export default {
  name: 'AdminTemplate',
  props: { page: { type: String, default: '' }, modulo: { type: String, default: '' } },
  data() { return { mobileOpen: false, collapsed: false, isMobile: false }; },
  computed: { user() { return this.$store.state.auth.user; } },
  mounted() {
    this.onResize();
    window.addEventListener('resize', this.onResize);
    window.addEventListener('keydown', this.onKeydown);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.onKeydown);
    document.body.classList.remove('safe-menu-lock');
  },
  watch: { '$route.path'() { this.closeMenu(); } },
  methods: {
    onResize() { this.isMobile = window.innerWidth < 1200; if (!this.isMobile) this.closeMenu(); },
    toggleMenu() {
      if (!this.isMobile) { this.collapsed = !this.collapsed; return; }
      this.mobileOpen = !this.mobileOpen;
      document.body.classList.toggle('safe-menu-lock', this.mobileOpen);
      if (this.mobileOpen) this.$nextTick(() => this.$el.querySelector('.safe-mobile-close').focus());
    },
    closeMenu() {
      const wasOpen = this.mobileOpen;
      this.mobileOpen = false;
      document.body.classList.remove('safe-menu-lock');
      if (wasOpen) this.$nextTick(() => { const button = this.$el.querySelector('[aria-controls="sidenav-main"]'); if (button) button.focus(); });
    },
    onKeydown(event) {
      if (!this.mobileOpen) return;
      if (event.key === 'Escape') this.closeMenu();
      if (event.key === 'Tab') {
        const links = this.$el.querySelectorAll('.safe-sidebar a, .safe-sidebar button');
        const first = links[0], last = links[links.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
  }
};
</script>
<style src="~/static/assets/css/safe-design.css"></style>

