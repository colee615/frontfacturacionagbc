<template>
  <div>
    <JcLoader :load="load" />
    <AdminTemplate :page="page" :modulo="modulo">
      <template v-slot:body>
        <div class="card">
          <div class="card-body">
            <h5 class="mb-2">Panel principal</h5>
            <p class="mb-0">El acceso a módulos y botones se controla por roles, permisos y vistas.</p>
          </div>
        </div>
      </template>
    </AdminTemplate>
  </div>
</template>

<script>
export default {
  name: 'PanelIndexPage',
  data() {
    return {
      page: 'Panel',
      modulo: 'Dashboard',
      load: false
    };
  },
  computed: {
    user() {
      return this.$store.state.auth.user;
    }
  },
  mounted() {
    if (!this.user) {
      this.$router.push('/auth/login');
    }
  }
};
</script>
