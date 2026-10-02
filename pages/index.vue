<template>
  <AdminTemplate page="Inicio" modulo="Mi espacio de trabajo">
    <template #body>
      <div class="safe-home">
        <div class="safe-home-intro"><div><p class="safe-eyebrow">TU ESPACIO DE TRABAJO</p><h1>Hola, {{ firstName }}<span class="safe-greeting-dot">.</span></h1><p>Todo lo que necesitas para organizar tu jornada.</p></div><span class="safe-home-label"><BaseIcon name="store" :size="17" />Correos de Bolivia</span></div>
        <section class="safe-welcome">
          <div class="safe-welcome-copy"><span class="safe-welcome-tag">SISTEMA DE FACTURACIÓN</span><h2>Una gestión más simple.<br>Todo bajo control.</h2><p>Gestiona tus operaciones y encuentra la información que necesitas, desde un mismo lugar.</p><nuxt-link v-if="primaryAction" :to="primaryAction.to" class="safe-welcome-button">{{ primaryAction.title }}<BaseIcon name="arrow" :size="18" /></nuxt-link></div>
          <div class="safe-welcome-art" aria-hidden="true"><div class="safe-art-orbit"></div><div class="safe-art-document"><span class="safe-art-stamp"><BaseIcon name="file" :size="30" /></span><span class="safe-art-line"></span><span class="safe-art-line short"></span><div class="safe-art-separator"></div><span class="safe-art-line"></span><span class="safe-art-line short"></span><span class="safe-art-check"><BaseIcon name="check" :size="24" /></span></div><div class="safe-art-floating"><BaseIcon name="shield" :size="26" /></div></div>
        </section>
        <div class="safe-home-columns">
          <div class="safe-home-modules">
            <section v-for="group in groups" :key="group.label" class="safe-module-section">
              <div class="safe-section-title"><h2>{{ group.label }}</h2><span>{{ group.items.length }} {{ group.items.length === 1 ? 'módulo' : 'módulos' }}</span></div>
              <div class="safe-module-grid"><nuxt-link v-for="item in group.items" :key="item.to" :to="item.to" class="safe-module-card"><span class="safe-module-icon"><BaseIcon :name="item.icon" :size="23" /></span><BaseIcon class="safe-module-arrow" name="arrow" :size="18" /><h3>{{ item.title }}</h3><p>{{ item.description }}</p><span class="safe-module-open">Abrir módulo<BaseIcon name="chevron" :size="13" /></span></nuxt-link></div>
            </section>
            <div v-if="!groups.length" class="safe-empty"><BaseIcon name="shield" :size="32" /><h2>Tu espacio está listo</h2><p>Solicita a tu administrador acceso a los módulos que necesitas.</p></div>
          </div>
          <aside class="safe-home-aside">
            <section class="safe-day-card"><span class="safe-aside-icon"><BaseIcon name="calendar" :size="22" /></span><p class="safe-eyebrow">HOY</p><strong>{{ dayNumber }}</strong><p>{{ monthLabel }}</p><span>{{ weekday }}</span></section>
            <section class="safe-help-card"><BaseIcon name="layers" :size="24" /><h3>Un espacio a tu medida</h3><p>Los módulos disponibles corresponden a los accesos de tu cuenta.</p><div><BaseIcon name="shield" :size="16" /><span>Acceso según tu rol</span></div></section>
          </aside>
        </div>
      </div>
    </template>
  </AdminTemplate>
</template>
<script>
import { visibleNavigation } from '~/utils/navigation';
export default {
  data() { const today = new Date(); return { dayNumber: today.getDate(), monthLabel: new Intl.DateTimeFormat('es-BO', { month: 'long', year: 'numeric' }).format(today), weekday: new Intl.DateTimeFormat('es-BO', { weekday: 'long' }).format(today) }; },
  computed: {
    user() { return this.$store.state.auth.user; },
    firstName() { return ((this.user || {}).name || 'bienvenido').split(' ')[0]; },
    groups() { return visibleNavigation(this.$store.state.auth).map(group => ({ ...group, items: group.items.filter(item => item.to !== '/') })).filter(group => group.items.length); },
    primaryAction() { return this.groups.length ? this.groups[0].items[0] : null; }
  },
  mounted() { if (!this.user) this.$router.push('/auth/login'); }
};
</script>

