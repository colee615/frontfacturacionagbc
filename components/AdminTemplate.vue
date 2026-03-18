<template>
   <div v-if="user">
      <BaseAside />
      <main class="main-content position-relative max-height-vh-100 h-100 border-radius-lg enterprise-admin-theme">
         <BaseNav :page="page" :modulo="modulo" />
         <div class="container-fluid py-4 enterprise-admin-surface">
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

<style>
.enterprise-admin-theme {
   background:
      radial-gradient(circle at top right, rgba(255, 216, 79, 0.12), transparent 24%),
      linear-gradient(180deg, #f8f9fc 0%, #f2f4f8 100%);
   min-height: 100vh;
}

.enterprise-admin-surface .card {
   border: 1px solid rgba(226, 232, 240, 0.92);
   box-shadow: 0 18px 34px rgba(15, 23, 42, 0.06);
   border-radius: 20px;
   background: rgba(255, 255, 255, 0.98);
}

.enterprise-admin-surface .card-header {
   border-bottom: 1px solid rgba(226, 232, 240, 0.82);
}

.enterprise-admin-surface .table {
   --bs-table-bg: transparent;
}

.enterprise-admin-surface .table thead th {
   color: #60708a !important;
   font-weight: 800 !important;
   letter-spacing: 0.04em;
}

.enterprise-admin-surface .table tbody td,
.enterprise-admin-surface .table tbody th,
.enterprise-admin-surface .table tbody p,
.enterprise-admin-surface .table tbody span {
   color: #475569;
}

.enterprise-admin-surface .form-control,
.enterprise-admin-surface .form-select,
.enterprise-admin-surface .input-group-text,
.enterprise-admin-surface textarea {
   border-color: rgba(203, 213, 225, 0.9) !important;
   background: #ffffff !important;
   color: #475569 !important;
}

.enterprise-admin-surface .form-control::placeholder,
.enterprise-admin-surface textarea::placeholder {
   color: #94a3b8 !important;
}

.enterprise-admin-surface .form-control:focus,
.enterprise-admin-surface .form-select:focus,
.enterprise-admin-surface textarea:focus {
   border-color: #f2be22 !important;
   box-shadow: 0 0 0 0.2rem rgba(242, 190, 34, 0.14) !important;
}

.enterprise-admin-surface .btn-primary,
.enterprise-admin-surface .btn-success,
.enterprise-admin-surface .bg-gradient-secondary,
.enterprise-admin-surface .btn.bg-gradient-secondary,
.enterprise-admin-surface .btn.bg-gradient-primary {
   background: linear-gradient(135deg, #ffe38a 0%, #ffd54f 100%) !important;
   color: #5a4006 !important;
   border: 1px solid rgba(201, 154, 35, 0.24) !important;
   box-shadow: 0 10px 20px rgba(181, 145, 43, 0.14);
}

.enterprise-admin-surface .btn-primary:hover,
.enterprise-admin-surface .btn-success:hover,
.enterprise-admin-surface .btn.bg-gradient-secondary:hover,
.enterprise-admin-surface .btn.bg-gradient-primary:hover {
   color: #5a4006 !important;
   opacity: 0.96;
}

.enterprise-admin-surface .btn-dark,
.enterprise-admin-surface .bg-gradient-dark,
.enterprise-admin-surface .btn.bg-gradient-dark {
   background: linear-gradient(135deg, #334155 0%, #475569 100%) !important;
   color: #ffffff !important;
   border: 1px solid rgba(71, 85, 105, 0.24) !important;
   box-shadow: 0 10px 20px rgba(51, 65, 85, 0.14);
}

.enterprise-admin-surface .btn-dark:hover,
.enterprise-admin-surface .btn.bg-gradient-dark:hover {
   color: #ffffff !important;
   opacity: 0.96;
}

.enterprise-admin-surface .btn-outline-dark,
.enterprise-admin-surface .btn-outline-primary,
.enterprise-admin-surface .btn-outline-secondary {
   background: #fffaf0 !important;
   color: #9b7008 !important;
   border: 1px solid rgba(214, 183, 96, 0.34) !important;
}

.enterprise-admin-surface .btn-outline-dark:hover,
.enterprise-admin-surface .btn-outline-primary:hover,
.enterprise-admin-surface .btn-outline-secondary:hover {
   background: #ffe9a6 !important;
   color: #6d4b04 !important;
}

.enterprise-admin-surface .btn-outline-danger {
   background: #fff8f1 !important;
   color: #c17433 !important;
   border: 1px solid rgba(230, 173, 121, 0.34) !important;
}

.enterprise-admin-surface .btn-outline-danger:hover {
   background: #ffe6d2 !important;
   color: #9d5720 !important;
}

.enterprise-admin-surface .modal-content {
   border: 1px solid rgba(226, 232, 240, 0.9);
   border-radius: 18px;
   box-shadow: 0 18px 34px rgba(15, 23, 42, 0.08);
}

.enterprise-admin-surface .modal-header {
   background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
   border-bottom: 1px solid rgba(226, 232, 240, 0.9);
}

.enterprise-admin-surface .pagination .page-link {
   color: #64748b;
   border-color: rgba(203, 213, 225, 0.9);
   background: #ffffff;
}

.enterprise-admin-surface .pagination .active .page-link {
   background: linear-gradient(135deg, #ffe38a 0%, #ffd54f 100%);
   border-color: rgba(201, 154, 35, 0.24);
   color: #5a4006;
}

.enterprise-admin-surface h1,
.enterprise-admin-surface h2,
.enterprise-admin-surface h3,
.enterprise-admin-surface h4,
.enterprise-admin-surface h5,
.enterprise-admin-surface h6 {
   color: #1e293b;
}
</style>
