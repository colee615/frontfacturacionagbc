<template>
   <div v-if="user">
      <BaseAside />
      <main class="main-content position-relative max-height-vh-100 h-100 border-radius-lg">
         <BaseNav :page="page" :modulo="modulo" />
         <div class="container-fluid py-4">
            <slot name="body" />
            <BaseFooter />
         </div>
      </main>
   </div>
   <div v-else>
      <!-- Puedes añadir un mensaje o componente de carga aquí si lo deseas -->
   </div>
</template>

<script>
export default {
   name: 'AdminTemplate',
   props: {
      page: {
         type: String,
         default: ''
      },
      modulo: {
         type: String,
         default: ''
      }
   },
   async asyncData({ store, redirect }) {
      await store.dispatch('auth/loadAuthFromStorage');

      // Verifica si el usuario está autenticado
      if (!store.state.auth.token) {
         // Si no está autenticado, redirige a la página de login
         redirect('/auth/login');
      }

      return {};
   },
   computed: {
      user() {
         return this.$store.state.auth.user;
      }
   }
}
</script>
