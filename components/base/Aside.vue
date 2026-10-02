<template>
  <aside id="sidenav-main" class="safe-sidebar" aria-label="Menú principal">
    <nuxt-link to="/" class="safe-brand" aria-label="SAFE · Inicio">
      <span class="safe-brand-mark"><img src="/assets/imagenes/AGBClogo1.png" alt="Correos de Bolivia" /></span>
    </nuxt-link>
    <button class="safe-mobile-close safe-icon-button" type="button" aria-label="Cerrar menú" @click="$emit('close')"><BaseIcon name="close" /></button>
    <nav class="safe-sidebar-nav">
      <section v-for="group in groups" :key="group.label" class="safe-nav-group">
        <h2>{{ group.label }}</h2>
        <nuxt-link v-for="item in group.items" :key="item.to" :to="item.to" class="safe-nav-link" :class="{ 'is-active': isActive(item) }" :aria-current="isActive(item) ? 'page' : null" :title="item.title" @click.native="$emit('close')">
          <BaseIcon :name="item.icon" /><span>{{ item.title }}</span><span v-if="isActive(item)" class="safe-active-dot"></span>
        </nuxt-link>
      </section>
    </nav>
    <div class="safe-sidebar-note"><BaseIcon name="shield" :size="22" /><div><strong>Todo en un solo lugar</strong><p>Facturación, control y seguimiento.</p></div></div>
    <div class="safe-sidebar-footer"><span>AGBC</span><small>Plataforma de facturación</small></div>
  </aside>
</template>
<script>
import { visibleNavigation } from '~/utils/navigation';
export default {
  computed: { groups() { return visibleNavigation(this.$store.state.auth); } },
  methods: {
    isActive(item) {
      const path = this.$route.path.replace(/\/$/, '') || '/';
      const target = item.to.replace(/\/$/, '') || '/';
      return path === target || (target === '/panel/notificaciones' && path.startsWith(target + '/')) || (target === '/cajero/ventas/lista' && path === '/cajero/ventas/sucursal');
    }
  }
};
</script>

