<template>
  <aside class="enterprise-sidenav sidenav navbar navbar-vertical navbar-expand-xs border-0 my-3 fixed-start ms-3" id="sidenav-main">
    <div class="sidenav-header">
      <i
        class="fas fa-times p-3 cursor-pointer text-white opacity-7 position-absolute end-0 top-0 d-none d-xl-none"
        aria-hidden="true"
        id="iconSidenav"
      ></i>

      <a class="brand-card" href="javascript:void(0)">
        <div class="brand-mark">
          <img src="/assets/img/logo.png" alt="Logo" />
        </div>
        <div class="brand-copy">
          <span class="brand-kicker">AGBC</span>
          <strong class="brand-title">Facturación</strong>
          <small class="brand-subtitle">Panel administrativo</small>
        </div>
      </a>
    </div>

    <div class="sidenav-body">
      <div class="collapse navbar-collapse w-auto h-auto" id="sidenav-collapse-main">
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
  width: 270px !important;
  max-width: 270px !important;
  border-radius: 28px;
  background: linear-gradient(180deg, #ffd84f 0%, #f3c228 100%);
  border: 1px solid rgba(176, 121, 0, 0.18);
  box-shadow: 0 24px 48px rgba(120, 85, 10, 0.16);
  overflow: hidden;
}

.sidenav-header {
  padding: 18px 18px 10px;
}

.brand-card {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 14px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.22);
  border: 1px solid rgba(176, 121, 0, 0.14);
  text-decoration: none;
  box-shadow: 0 12px 24px rgba(120, 85, 10, 0.1);
}

.brand-mark {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.34);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.brand-mark img {
  width: 30px;
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
  letter-spacing: 0.14em;
  color: rgba(92, 61, 0, 0.68);
}

.brand-title {
  color: #463000 !important;
  font-size: 20px;
  font-weight: 800;
}

.brand-subtitle {
  color: rgba(92, 61, 0, 0.78);
  font-size: 11px;
}

.sidenav-body {
  padding: 10px 14px 22px;
}

.nav-section {
  margin: 18px 0 10px;
  padding: 0 12px;
}

.nav-section-label {
  color: rgba(92, 61, 0, 0.72);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.enterprise-parent-link {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 4px 4px;
  padding: 12px 14px;
  border-radius: 16px;
  color: #5e470e !important;
  transition: all 0.2s ease;
}

.enterprise-parent-link:hover {
  background: rgba(255, 255, 255, 0.18);
  color: #4d3908 !important;
}

.nav-icon-shell {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.22);
  color: #b88200 !important;
  flex-shrink: 0;
}

.nav-link-text {
  flex: 1;
  font-weight: 650;
  font-size: 14px;
  color: #5e470e !important;
  opacity: 1 !important;
}

.nav-chevron {
  font-size: 12px;
  opacity: 0.8;
  color: rgba(134, 103, 25, 0.78);
}

.enterprise-parent-link::after {
  display: none !important;
  content: none !important;
}

.enterprise-subnav {
  margin: 0;
  padding: 4px 4px 10px 8px;
}

.enterprise-sub-link {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 3px 0;
  padding: 9px 14px 9px 16px;
  border-radius: 14px;
  color: rgba(103, 79, 20, 0.92) !important;
  transition: all 0.2s ease;
  font-size: 13px;
  font-weight: 500;
  opacity: 1 !important;
  position: relative;
}

.enterprise-sub-link i {
  width: 16px;
  text-align: center;
  color: #c08a00 !important;
}

.enterprise-sub-link:hover {
  background: rgba(255, 255, 255, 0.16);
  color: #4d3908 !important;
}

.enterprise-sub-link.nuxt-link-active,
.enterprise-sub-link.nuxt-link-exact-active {
  background: #ffffff;
  color: #4d3908 !important;
  font-weight: 700;
  box-shadow: 0 10px 22px rgba(181, 145, 43, 0.14);
}

.enterprise-sub-link.nuxt-link-active i,
.enterprise-sub-link.nuxt-link-exact-active i {
  color: #d19800 !important;
}

.enterprise-parent-link.router-link-active,
.enterprise-parent-link.router-link-exact-active,
.enterprise-parent-link[aria-expanded="true"] {
  background: rgba(255, 255, 255, 0.22);
  color: #4d3908 !important;
  box-shadow: inset 0 0 0 1px rgba(201, 154, 35, 0.14);
}

.enterprise-parent-link.router-link-active .nav-icon-shell,
.enterprise-parent-link.router-link-exact-active .nav-icon-shell,
.enterprise-parent-link[aria-expanded="true"] .nav-icon-shell {
  background: rgba(255, 255, 255, 0.8);
  color: #d19800 !important;
}

.enterprise-sub-link.nuxt-link-active::before,
.enterprise-sub-link.nuxt-link-exact-active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 999px;
  background: #f2be22;
}

.enterprise-sidenav .nav-link,
.enterprise-sidenav .nav-link span,
.enterprise-sidenav .nav-link i,
.enterprise-sidenav .navbar-nav .nav-link {
  color: inherit !important;
  opacity: 1 !important;
}

.navbar-vertical.navbar-expand-xs .navbar-collapse {
  overflow: hidden;
}
</style>
