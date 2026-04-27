<template>
   <div v-if="user" class="enterprise-shell">
      <BaseAside />
      <main class="enterprise-admin-theme enterprise-main-shell">
         <BaseNav :page="page" :modulo="modulo" />
         <div class="container-fluid enterprise-admin-surface enterprise-admin-layout">
            <div class="enterprise-admin-body">
               <slot name="body" />
            </div>
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
   background: #f4f6fb;
   min-height: 100vh;
}

.enterprise-shell {
   min-height: 100vh;
   background: #f4f6fb;
}

.enterprise-main-shell {
   min-height: 100vh;
   margin-left: 356px;
   padding-bottom: 18px;
   transition: margin-left 0.22s ease;
   position: relative;
   z-index: 1;
}

.enterprise-admin-layout {
   min-height: calc(100vh - 108px);
   display: flex;
   flex-direction: column;
   padding: 24px 18px 0 0;
}

.enterprise-admin-body {
   flex: 1 1 auto;
}

.enterprise-admin-surface .card {
   border: 1px solid rgba(215, 222, 235, 0.92);
   box-shadow: 0 18px 55px rgba(24, 39, 75, 0.06);
   border-radius: 18px;
   background: rgba(255, 255, 255, 0.98);
}

.enterprise-admin-surface .card-header {
   border-bottom: 1px solid rgba(215, 222, 235, 0.82);
   background: rgba(255, 255, 255, 0.72);
}

.enterprise-admin-surface .table {
   --bs-table-bg: transparent;
}

.enterprise-admin-surface .table thead th {
   color: #667085 !important;
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
   border-color: rgba(202, 211, 225, 0.95) !important;
   background: #ffffff !important;
   color: #344054 !important;
   border-radius: 10px !important;
}

.enterprise-admin-surface .form-control::placeholder,
.enterprise-admin-surface textarea::placeholder {
   color: #94a3b8 !important;
}

.enterprise-admin-surface .form-control:focus,
.enterprise-admin-surface .form-select:focus,
.enterprise-admin-surface textarea:focus {
   border-color: #5967d8 !important;
   box-shadow: 0 0 0 0.2rem rgba(89, 103, 216, 0.12) !important;
}

.enterprise-admin-surface .btn-primary,
.enterprise-admin-surface .btn-success,
.enterprise-admin-surface .bg-gradient-secondary,
.enterprise-admin-surface .btn.bg-gradient-secondary,
.enterprise-admin-surface .btn.bg-gradient-primary {
   background: #5967d8 !important;
   color: #ffffff !important;
   border: 1px solid rgba(89, 103, 216, 0.18) !important;
   box-shadow: 0 10px 20px rgba(89, 103, 216, 0.16);
}

.enterprise-admin-surface .btn-primary:hover,
.enterprise-admin-surface .btn-success:hover,
.enterprise-admin-surface .btn.bg-gradient-secondary:hover,
.enterprise-admin-surface .btn.bg-gradient-primary:hover {
   color: #ffffff !important;
   opacity: 0.96;
}

.enterprise-admin-surface .btn-dark,
.enterprise-admin-surface .bg-gradient-dark,
.enterprise-admin-surface .btn.bg-gradient-dark {
   background: #1f2937 !important;
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
   background: #ffffff !important;
   color: #4b5565 !important;
   border: 1px solid rgba(202, 211, 225, 0.95) !important;
}

.enterprise-admin-surface .btn-outline-dark:hover,
.enterprise-admin-surface .btn-outline-primary:hover,
.enterprise-admin-surface .btn-outline-secondary:hover {
   background: #eef2ff !important;
   color: #3442a8 !important;
   border-color: rgba(89, 103, 216, 0.28) !important;
}

.enterprise-admin-surface .btn-outline-danger {
   background: #ffffff !important;
   color: #c0362c !important;
   border: 1px solid rgba(240, 160, 154, 0.46) !important;
}

.enterprise-admin-surface .btn-outline-danger:hover {
   background: #fff1f0 !important;
   color: #a7251c !important;
}

.enterprise-admin-surface .modal-content {
   border: 1px solid rgba(226, 232, 240, 0.9);
   border-radius: 18px;
   box-shadow: 0 18px 34px rgba(15, 23, 42, 0.08);
}

.enterprise-admin-surface .modal-header {
   background: #ffffff;
   border-bottom: 1px solid rgba(226, 232, 240, 0.9);
}

.enterprise-admin-surface .pagination .page-link {
   color: #64748b;
   border-color: rgba(203, 213, 225, 0.9);
   background: #ffffff;
}

.enterprise-admin-surface .pagination .active .page-link {
   background: #5967d8;
   border-color: rgba(89, 103, 216, 0.24);
   color: #ffffff;
}

.enterprise-admin-surface h1,
.enterprise-admin-surface h2,
.enterprise-admin-surface h3,
.enterprise-admin-surface h4,
.enterprise-admin-surface h5,
.enterprise-admin-surface h6 {
   color: #1e293b;
}

.enterprise-admin-surface .enterprise-pagination {
   gap: 0.625rem;
   flex-wrap: wrap;
}

.enterprise-admin-surface .enterprise-pagination .page-item {
   margin: 0;
}

.enterprise-admin-surface .enterprise-pagination .page-link {
   margin-left: 0 !important;
   min-width: 52px;
   height: 42px;
   padding: 0 0.95rem;
   border-radius: 999px !important;
   border: 1px solid #d8e0ec !important;
   background: rgba(255, 255, 255, 0.96) !important;
   color: #6a7a96 !important;
   font-weight: 700;
   font-size: 0.92rem;
   line-height: 1;
   display: inline-flex;
   align-items: center;
   justify-content: center;
   box-shadow: 0 8px 20px rgba(31, 41, 55, 0.06);
   transition: all 0.18s ease;
}

.enterprise-admin-surface .enterprise-pagination .page-link:hover {
   background: #ffffff !important;
   border-color: #b9c7dc !important;
   color: #334155 !important;
   transform: translateY(-1px);
}

.enterprise-admin-surface .enterprise-pagination .page-item.active .page-link {
   background: #5967d8 !important;
   border-color: #5967d8 !important;
   color: #ffffff !important;
   box-shadow: 0 12px 28px rgba(89, 103, 216, 0.18);
}

.enterprise-admin-surface .enterprise-pagination .page-item.disabled .page-link {
   background: #f7f9fc !important;
   border-color: #e2e8f0 !important;
   color: #a5b1c2 !important;
   box-shadow: none;
   opacity: 0.9;
   pointer-events: none;
}

body.enterprise-sidebar-collapsed .enterprise-sidenav {
   width: 88px !important;
   max-width: 88px !important;
}

body.enterprise-sidebar-collapsed .enterprise-main-shell {
   margin-left: 124px;
}

body.enterprise-sidebar-collapsed .enterprise-sidenav .brand-card {
   justify-content: center;
   padding: 12px 8px;
}

body.enterprise-sidebar-collapsed .enterprise-sidenav .brand-copy,
body.enterprise-sidebar-collapsed .enterprise-sidenav .nav-section,
body.enterprise-sidebar-collapsed .enterprise-sidenav .nav-link-text,
body.enterprise-sidebar-collapsed .enterprise-sidenav .nav-chevron,
body.enterprise-sidebar-collapsed .enterprise-sidenav .enterprise-subnav span {
   display: none !important;
}

body.enterprise-sidebar-collapsed .enterprise-sidenav .sidenav-header {
   padding-left: 12px;
   padding-right: 12px;
}

body.enterprise-sidebar-collapsed .enterprise-sidenav .sidenav-body {
   padding-left: 10px;
   padding-right: 10px;
}

body.enterprise-sidebar-collapsed .enterprise-sidenav .enterprise-parent-link,
body.enterprise-sidebar-collapsed .enterprise-sidenav .enterprise-sub-link {
   justify-content: center;
   padding-left: 10px;
   padding-right: 10px;
}

body.enterprise-sidebar-collapsed .enterprise-sidenav .enterprise-subnav {
   padding: 4px 0 8px;
}

body.enterprise-sidebar-collapsed .enterprise-sidenav .enterprise-sub-link::before {
   left: 4px;
}

body.enterprise-sidebar-collapsed .enterprise-sidenav .navbar-nav {
   align-items: stretch;
}

body.enterprise-dark,
body.enterprise-dark .enterprise-shell,
body.enterprise-dark .enterprise-admin-theme {
   background: #121821 !important;
   color: #cbd5e1;
}

body.enterprise-dark .enterprise-sidenav,
body.enterprise-dark .enterprise-topbar,
body.enterprise-dark .enterprise-admin-surface .card,
body.enterprise-dark .modal-content,
body.enterprise-dark .ventas-panel,
body.enterprise-dark .ventas-stat-card,
body.enterprise-dark .invoice-status-card {
   background: rgba(24, 31, 43, 0.96) !important;
   border-color: rgba(71, 85, 105, 0.72) !important;
   box-shadow: 0 24px 70px rgba(0, 0, 0, 0.28) !important;
}

body.enterprise-dark .enterprise-sidenav {
   background: #111a26 !important;
   border-color: rgba(82, 99, 128, 0.72) !important;
}

body.enterprise-dark .brand-card,
body.enterprise-dark .brand-mark,
body.enterprise-dark .breadcrumb-chip,
body.enterprise-dark .context-pill,
body.enterprise-dark .topbar-icon-btn,
body.enterprise-dark .selection-pill,
body.enterprise-dark .ventas-count-pill,
body.enterprise-dark .tracking-chip,
body.enterprise-dark .advanced-block,
body.enterprise-dark .guide-step,
body.enterprise-dark .contingency-card {
   background: rgba(30, 41, 59, 0.92) !important;
   border-color: rgba(71, 85, 105, 0.8) !important;
   color: #cbd5e1 !important;
}

body.enterprise-dark .enterprise-sidenav .brand-card {
   background: rgba(27, 39, 56, 0.72) !important;
   border-color: rgba(82, 99, 128, 0.62) !important;
}

body.enterprise-dark .enterprise-sidenav .brand-mark {
   background: rgba(17, 24, 39, 0.92) !important;
   border-color: rgba(82, 99, 128, 0.52) !important;
}

body.enterprise-dark .brand-title,
body.enterprise-dark .topbar-heading h5,
body.enterprise-dark .enterprise-admin-surface h1,
body.enterprise-dark .enterprise-admin-surface h2,
body.enterprise-dark .enterprise-admin-surface h3,
body.enterprise-dark .enterprise-admin-surface h4,
body.enterprise-dark .enterprise-admin-surface h5,
body.enterprise-dark .enterprise-admin-surface h6,
body.enterprise-dark .ventas-header h1,
body.enterprise-dark .ventas-table__primary,
body.enterprise-dark .ventas-table__amount,
body.enterprise-dark .empty-title,
body.enterprise-dark .quick-title,
body.enterprise-dark .contingency-card strong,
body.enterprise-dark .invoice-status-badge,
body.enterprise-dark .enterprise-footer-brand {
   color: #f8fafc !important;
}

body.enterprise-dark .brand-kicker,
body.enterprise-dark .brand-subtitle,
body.enterprise-dark .topbar-heading p,
body.enterprise-dark .enterprise-admin-surface .card-header,
body.enterprise-dark .enterprise-admin-surface .table thead th,
body.enterprise-dark .enterprise-admin-surface .table tbody td,
body.enterprise-dark .enterprise-admin-surface .table tbody th,
body.enterprise-dark .enterprise-admin-surface .table tbody p,
body.enterprise-dark .enterprise-admin-surface .table tbody span,
body.enterprise-dark .ventas-table__secondary,
body.enterprise-dark .ventas-stat-card__meta,
body.enterprise-dark .text-muted,
body.enterprise-dark .quick-help,
body.enterprise-dark .empty-copy,
body.enterprise-dark .invoice-status-help,
body.enterprise-dark .enterprise-footer-copy,
body.enterprise-dark .enterprise-footer-meta {
   color: #94a3b8 !important;
}

body.enterprise-dark .enterprise-parent-link,
body.enterprise-dark .enterprise-parent-link .nav-link-text,
body.enterprise-dark .enterprise-sub-link {
   color: #cbd5e1 !important;
}

body.enterprise-dark .enterprise-sidenav .nav-section-label {
   color: #8ea0bb !important;
}

body.enterprise-dark .enterprise-sidenav .enterprise-parent-link {
   background: transparent !important;
   border: 1px solid transparent !important;
   box-shadow: none !important;
}

body.enterprise-dark .enterprise-parent-link:hover,
body.enterprise-dark .enterprise-parent-link[aria-expanded="true"],
body.enterprise-dark .enterprise-sub-link:hover {
   background: rgba(47, 60, 82, 0.62) !important;
   color: #ffffff !important;
}

body.enterprise-dark .enterprise-parent-link[aria-expanded="true"] {
   background: rgba(47, 60, 82, 0.72) !important;
   border-color: rgba(103, 119, 148, 0.36) !important;
}

body.enterprise-dark .enterprise-sub-link.nuxt-link-active,
body.enterprise-dark .enterprise-sub-link.nuxt-link-exact-active {
   background: rgba(245, 158, 11, 0.13) !important;
   color: #ffffff !important;
}

body.enterprise-dark .enterprise-sidenav .nav-icon-shell {
   background: rgba(148, 163, 184, 0.12) !important;
   color: #cbd5e1 !important;
   box-shadow: none !important;
}

body.enterprise-dark .enterprise-sidenav .enterprise-parent-link:hover .nav-icon-shell,
body.enterprise-dark .enterprise-sidenav .enterprise-parent-link[aria-expanded="true"] .nav-icon-shell {
   background: rgba(245, 158, 11, 0.14) !important;
   color: #fbbf24 !important;
}

body.enterprise-dark .enterprise-sidenav .enterprise-sub-link i {
   color: #aab4c6 !important;
}

body.enterprise-dark .enterprise-sidenav .enterprise-sub-link.nuxt-link-active i,
body.enterprise-dark .enterprise-sidenav .enterprise-sub-link.nuxt-link-exact-active i {
   color: #fbbf24 !important;
}

body.enterprise-dark .enterprise-sidenav .enterprise-sub-link.nuxt-link-active::before,
body.enterprise-dark .enterprise-sidenav .enterprise-sub-link.nuxt-link-exact-active::before {
   background: #f59e0b !important;
}

body.enterprise-dark .enterprise-admin-surface .card-header,
body.enterprise-dark .modal-header,
body.enterprise-dark .ventas-panel__header,
body.enterprise-dark .ventas-table thead th,
body.enterprise-dark .ventas-items-table thead th {
   background: rgba(20, 27, 38, 0.92) !important;
   border-color: rgba(71, 85, 105, 0.72) !important;
}

body.enterprise-dark .enterprise-admin-surface .form-control,
body.enterprise-dark .enterprise-admin-surface .form-select,
body.enterprise-dark .enterprise-admin-surface .input-group-text,
body.enterprise-dark .enterprise-admin-surface textarea,
body.enterprise-dark .ventas-control,
body.enterprise-dark .swal2-input,
body.enterprise-dark .swal2-select {
   background: #111827 !important;
   color: #e5e7eb !important;
   border-color: rgba(71, 85, 105, 0.9) !important;
}

body.enterprise-dark .enterprise-admin-surface .form-control::placeholder,
body.enterprise-dark .enterprise-admin-surface textarea::placeholder,
body.enterprise-dark .ventas-control::placeholder {
   color: #64748b !important;
}

body.enterprise-dark .enterprise-admin-surface .btn-outline-dark,
body.enterprise-dark .enterprise-admin-surface .btn-outline-primary,
body.enterprise-dark .enterprise-admin-surface .btn-outline-secondary,
body.enterprise-dark .enterprise-admin-surface .pagination .page-link,
body.enterprise-dark .enterprise-admin-surface .enterprise-pagination .page-link {
   background: rgba(30, 41, 59, 0.95) !important;
   color: #cbd5e1 !important;
   border-color: rgba(71, 85, 105, 0.9) !important;
}

body.enterprise-dark .topbar-icon-btn:hover,
body.enterprise-dark .enterprise-admin-surface .btn-outline-dark:hover,
body.enterprise-dark .enterprise-admin-surface .btn-outline-primary:hover,
body.enterprise-dark .enterprise-admin-surface .btn-outline-secondary:hover,
body.enterprise-dark .enterprise-admin-surface .pagination .page-link:hover {
   background: rgba(89, 103, 216, 0.18) !important;
   color: #ffffff !important;
}

body.enterprise-dark .logout-btn {
   background: #f8fafc !important;
   color: #111827 !important;
   border-color: rgba(248, 250, 252, 0.16) !important;
}

body.enterprise-dark .ventas-mini-badge,
body.enterprise-dark .ventas-status-chip--warning {
   background: rgba(245, 158, 11, 0.16) !important;
   color: #fbbf24 !important;
   border-color: rgba(245, 158, 11, 0.26) !important;
}

body.enterprise-dark .ventas-mini-badge--success,
body.enterprise-dark .ventas-status-chip--success,
body.enterprise-dark .chip-success {
   background: rgba(34, 197, 94, 0.14) !important;
   color: #86efac !important;
   border-color: rgba(34, 197, 94, 0.24) !important;
}

body.enterprise-dark .ventas-status-chip--danger,
body.enterprise-dark .chip-observed {
   background: rgba(239, 68, 68, 0.14) !important;
   color: #fca5a5 !important;
   border-color: rgba(239, 68, 68, 0.24) !important;
}

body.enterprise-dark .chip-info,
body.enterprise-dark .chip-contingency,
body.enterprise-dark .ventas-status-chip--primary {
   background: rgba(89, 103, 216, 0.16) !important;
   color: #c7d2fe !important;
   border-color: rgba(89, 103, 216, 0.28) !important;
}

body.enterprise-dark .response-box {
   background: #050816 !important;
   color: #e5e7eb !important;
   border: 1px solid rgba(71, 85, 105, 0.8);
}

body.enterprise-dark .enterprise-footer-shell {
   border-color: rgba(71, 85, 105, 0.72);
}

@media (max-width: 1199.98px) {
   .enterprise-main-shell {
      margin-left: 0;
   }

   body.enterprise-sidebar-collapsed .enterprise-main-shell {
      margin-left: 0;
   }
}

@media (max-width: 767.98px) {
   .enterprise-admin-layout {
      padding: 18px 12px 0;
   }
}
</style>
