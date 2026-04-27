<template>
  <aside class="enterprise-sidenav" id="sidenav-main">
    <div class="sidenav-header">
      <i
        class="fas fa-times p-3 cursor-pointer text-secondary opacity-7 position-absolute end-0 top-0 d-none d-xl-none"
        aria-hidden="true"
        id="iconSidenav"
        @click="closeMobileAside"
      ></i>

      <a class="brand-card" href="javascript:void(0)">
        <div class="brand-mark">
          <img src="/assets/img/logo.png" alt="Logo" />
        </div>
        <div class="brand-copy">
          <span class="brand-kicker">AGBC</span>
          <strong class="brand-title">Facturación</strong>
          <small class="brand-subtitle">Back office</small>
        </div>
      </a>
    </div>

    <div class="sidenav-body">
      <div class="sidenav-menu" id="sidenav-collapse-main">
        <ul class="navbar-nav">
          <li class="nav-section" v-if="showAdminSection">
            <span class="nav-section-label">Administración</span>
          </li>

          <li class="nav-item" v-if="showAdminSection">
            <a data-bs-toggle="collapse" href="#configuracion" class="nav-link enterprise-parent-link" aria-controls="configuracion" role="button" aria-expanded="false">
              <span class="nav-icon-shell"><i class="fas fa-sliders-h"></i></span>
              <span class="nav-link-text">Configuración</span>
              <i class="fas fa-chevron-down nav-chevron"></i>
            </a>
            <div class="collapse" id="configuracion">
              <ul class="nav enterprise-subnav">
                <li class="nav-item" v-if="usuariosAccess">
                  <nuxt-link class="nav-link enterprise-sub-link" to="/panel/usuarios/">
                    <i class="fas fa-users"></i>
                    <span>Usuarios</span>
                  </nuxt-link>
                </li>
                <li class="nav-item" v-if="seguridadAccess">
                  <nuxt-link class="nav-link enterprise-sub-link" to="/panel/seguridad/">
                    <i class="fas fa-user-lock"></i>
                    <span>Roles y permisos</span>
                  </nuxt-link>
                </li>
              </ul>
            </div>
          </li>


          <li class="nav-section" v-if="showSalesSection">
            <span class="nav-section-label">Ventas</span>
          </li>
          <li class="nav-item" v-if="showSalesSection">
            <a data-bs-toggle="collapse" href="#ventas-cajero" class="nav-link enterprise-parent-link" aria-controls="ventas-cajero" role="button" aria-expanded="false">
              <span class="nav-icon-shell"><i class="fas fa-cash-register"></i></span>
              <span class="nav-link-text">Gestión de ventas</span>
              <i class="fas fa-chevron-down nav-chevron"></i>
            </a>
            <div class="collapse" id="ventas-cajero">
              <ul class="nav enterprise-subnav">
                <li class="nav-item" v-if="ventasReadAccess">
                  <nuxt-link class="nav-link enterprise-sub-link" to="/cajero/ventas/lista">
                    <i class="fas fa-list-ul"></i>
                    <span>Lista de ventas realizadas</span>
                  </nuxt-link>
                </li>
                <li class="nav-item" v-if="ventasReadAccess">
                  <nuxt-link class="nav-link enterprise-sub-link" to="/cajero/ventas/cierre">
                    <i class="fas fa-file-invoice-dollar"></i>
                    <span>Cierre diario</span>
                  </nuxt-link>
                </li>
                <li class="nav-item" v-if="ventasReadAccess">
                  <nuxt-link class="nav-link enterprise-sub-link" to="/cajero/ventas/caja">
                    <i class="fas fa-boxes"></i>
                    <span>Caja y fichas</span>
                  </nuxt-link>
                </li>
                <li class="nav-item" v-if="ventasAccess">
                  <nuxt-link class="nav-link enterprise-sub-link" to="/cajero/ventas/protocolo">
                    <i class="fas fa-paper-plane"></i>
                    <span>Operaciones de envío</span>
                  </nuxt-link>
                </li>
                 <li class="nav-item" v-if="notificacionesAccess">
                  <nuxt-link class="nav-link enterprise-sub-link" to="/panel/notificaciones/">
                    <i class="fas fa-bell"></i>
                    <span>Notificaciones</span>
                  </nuxt-link>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </aside>
</template>

<script>
export default {
  computed: {
    permissions() {
      return this.$store.state.auth.permissions || [];
    },
    views() {
      return this.$store.state.auth.views || [];
    },
    usuariosAccess() {
      return this.hasAccess('usuarios.manage', 'usuarios');
    },
    notificacionesAccess() {
      return this.hasAccess('dashboard.view', 'dashboard');
    },
    seguridadAccess() {
      return this.hasAccess('rbac.manage', 'seguridad');
    },
    ventasAccess() {
      return this.hasAccess('ventas.write', 'ventas');
    },
    ventasReadAccess() {
      return this.hasAccess('ventas.read', 'ventas');
    },
    showAdminSection() {
      return this.usuariosAccess
        || this.notificacionesAccess
        || this.seguridadAccess;
    },
    showSalesSection() {
      return this.ventasAccess || this.ventasReadAccess;
    }
  },
  methods: {
    closeMobileAside() {
      const side = document.getElementById('sidenav-main');
      if (side) {
        side.classList.add('d-none');
      }
    },
    hasAccess(permission, viewSlug) {
      return this.can(permission) && this.canView(viewSlug);
    },
    can(permission) {
      return this.permissions.includes(permission);
    },
    canView(viewSlug) {
      return this.views.includes(viewSlug);
    }
  }
};
</script>

<style scoped>
.enterprise-sidenav {
  position: fixed;
  left: 16px;
  top: 16px;
  bottom: 16px;
  z-index: 1040;
  width: 320px !important;
  max-width: 320px !important;
  height: calc(100vh - 32px);
  margin: 0;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(215, 222, 235, 0.92);
  box-shadow: 0 24px 70px rgba(24, 39, 75, 0.10);
  overflow: hidden;
  backdrop-filter: blur(18px);
  transition: width 0.22s ease, max-width 0.22s ease, transform 0.22s ease, box-shadow 0.22s ease;
}

.sidenav-header {
  padding: 20px 18px 12px;
}

.brand-card {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-radius: 18px;
  background: #f8fafc;
  border: 1px solid #e6ebf3;
  text-decoration: none;
}

.brand-mark {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #e1e7f0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.brand-mark img {
  width: 29px;
  height: auto;
}

.brand-copy {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
  min-width: 0;
}

.brand-kicker {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #8a95a8;
  font-weight: 800;
}

.brand-title {
  color: #1f2937 !important;
  font-size: 19px;
  font-weight: 800;
}

.brand-subtitle {
  color: #667085;
  font-size: 12px;
}

.sidenav-body {
  padding: 8px 14px 22px;
}

.nav-section {
  margin: 22px 0 9px;
  padding: 0 14px;
}

.nav-section-label {
  color: #98a2b3;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.20em;
  text-transform: uppercase;
}

.enterprise-parent-link {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 4px 2px;
  padding: 11px 12px;
  border-radius: 15px;
  color: #4b5565 !important;
  transition: all 0.2s ease;
}

.enterprise-parent-link:hover {
  background: #f5f7fb;
  color: #243b6b !important;
}

.nav-icon-shell {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #eef2ff;
  color: #5967d8 !important;
  flex-shrink: 0;
}

.nav-link-text {
  flex: 1;
  font-weight: 700;
  font-size: 14px;
  color: #4b5565 !important;
  opacity: 1 !important;
}

.nav-chevron {
  font-size: 11px;
  opacity: 0.65;
  color: #8a95a8;
}

.enterprise-parent-link::after {
  display: none !important;
  content: none !important;
}

.enterprise-subnav {
  margin: 0;
  padding: 7px 4px 11px 14px;
}

.enterprise-sub-link {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 2px 0;
  padding: 10px 12px 10px 14px;
  border-radius: 14px;
  color: #667085 !important;
  transition: all 0.2s ease;
  font-size: 13px;
  font-weight: 650;
  opacity: 1 !important;
  position: relative;
}

.enterprise-sub-link i {
  width: 16px;
  text-align: center;
  color: #98a2b3 !important;
}

.enterprise-sub-link:hover {
  background: #f5f7fb;
  color: #243b6b !important;
}

.enterprise-sub-link.nuxt-link-active,
.enterprise-sub-link.nuxt-link-exact-active {
  background: #eef2ff;
  color: #3442a8 !important;
  font-weight: 700;
}

.enterprise-sub-link.nuxt-link-active i,
.enterprise-sub-link.nuxt-link-exact-active i {
  color: #5967d8 !important;
}

.enterprise-parent-link.router-link-active,
.enterprise-parent-link.router-link-exact-active,
.enterprise-parent-link[aria-expanded="true"] {
  background: #f5f7fb;
  color: #243b6b !important;
  box-shadow: inset 0 0 0 1px #e6ebf3;
}

.enterprise-parent-link.router-link-active .nav-icon-shell,
.enterprise-parent-link.router-link-exact-active .nav-icon-shell,
.enterprise-parent-link[aria-expanded="true"] .nav-icon-shell {
  background: #ffffff;
  color: #3442a8 !important;
  box-shadow: 0 8px 22px rgba(89, 103, 216, 0.12);
}

.enterprise-sub-link.nuxt-link-active::before,
.enterprise-sub-link.nuxt-link-exact-active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 9px;
  bottom: 9px;
  width: 3px;
  border-radius: 999px;
  background: #5967d8;
}

.enterprise-sidenav .nav-link,
.enterprise-sidenav .nav-link span,
.enterprise-sidenav .nav-link i,
.enterprise-sidenav .navbar-nav .nav-link {
  color: inherit !important;
  opacity: 1 !important;
}

.sidenav-menu {
  overflow: hidden;
}

@media (max-width: 1199.98px) {
  .enterprise-sidenav {
    left: 12px;
    top: 12px;
    bottom: 12px;
    height: calc(100vh - 24px);
  }
}
</style>
