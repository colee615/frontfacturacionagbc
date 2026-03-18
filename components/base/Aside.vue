<template>
  <aside class="sidenav navbar navbar-vertical navbar-expand-xs border-0 border-radius-xl my-3 fixed-start ms-3" id="sidenav-main">
    <div class="sidenav-header">
      <i class="fas fa-times p-3 cursor-pointer text-secondary opacity-5 position-absolute end-0 top-0 d-none d-xl-none" aria-hidden="true" id="iconSidenav"></i>
      <a class="navbar-brand m-0" href="javascript:void(0)">
        <div class="col-lg-4 text-center mt-3 mt-lg-0">
          <img src="/assets/img/logo.png" alt="Logo" style="width: 50px; height: auto;">
          <span class="ms-2 align-middle">AGBC</span>
        </div>
      </a>
    </div>

    <hr class="horizontal dark mt-0" />

    <div class="collapse navbar-collapse w-auto h-auto" id="sidenav-collapse-main">
      <ul class="navbar-nav">
        <li class="nav-item mt-3" v-if="showAdminSection">
          <h6 class="ps-4 ms-2 text-uppercase text-xs font-weight-bolder opacity-6">ADMINISTRACION</h6>
        </li>

        <li class="nav-item" v-if="showAdminSection">
          <a data-bs-toggle="collapse" href="#configuracion" class="nav-link" aria-controls="configuracion" role="button" aria-expanded="false">
            <div class="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center me-2">
              <i class="fas fa-cog"></i>
            </div>
            <span class="nav-link-text ms-1">Configuracion</span>
          </a>
          <div class="collapse" id="configuracion">
            <ul class="nav ms-4 ps-3">
              <li class="nav-item" v-if="usuariosAccess">
                <nuxt-link class="nav-link" to="/panel/usuarios/">
                  <span class="sidenav-mini-icon"> U </span>
                  <span class="sidenav-normal"> Usuarios</span>
                </nuxt-link>
              </li>
              <li class="nav-item" v-if="sucursalesAccess">
                <nuxt-link class="nav-link" to="/panel/sucursales/">
                  <span class="sidenav-mini-icon"> S </span>
                  <span class="sidenav-normal"> Sucursales</span>
                </nuxt-link>
              </li>
              <li class="nav-item" v-if="clientesAccess">
                <nuxt-link class="nav-link" to="/panel/clientes/">
                  <span class="sidenav-mini-icon"> C </span>
                  <span class="sidenav-normal"> Clientes</span>
                </nuxt-link>
              </li>
              <li class="nav-item" v-if="serviciosAccess">
                <nuxt-link class="nav-link" to="/panel/servicios/">
                  <span class="sidenav-mini-icon"> S </span>
                  <span class="sidenav-normal"> Servicios</span>
                </nuxt-link>
              </li>
              <li class="nav-item" v-if="notificacionesAccess">
                <nuxt-link class="nav-link" to="/panel/notificaciones/">
                  <span class="sidenav-mini-icon"> N </span>
                  <span class="sidenav-normal"> Notificaciones</span>
                </nuxt-link>
              </li>
              <li class="nav-item" v-if="seguridadAccess">
                <nuxt-link class="nav-link" to="/panel/seguridad/">
                  <span class="sidenav-mini-icon"> R </span>
                  <span class="sidenav-normal"> Roles y Permisos</span>
                </nuxt-link>
              </li>
            </ul>
          </div>
        </li>

        <li class="nav-item mt-3" v-if="showReportsSection">
          <h6 class="ps-4 ms-2 text-uppercase text-xs font-weight-bolder opacity-6">REPORTES</h6>
        </li>
        <li class="nav-item" v-if="showReportsSection">
          <a data-bs-toggle="collapse" href="#reportes" class="nav-link" aria-controls="reportes" role="button" aria-expanded="false">
            <div class="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center me-2">
              <i class="fas fa-chart-bar"></i>
            </div>
            <span class="nav-link-text ms-1">Reportes de ventas</span>
          </a>
          <div class="collapse" id="reportes">
            <ul class="nav ms-4 ps-3">
              <li class="nav-item">
                <nuxt-link class="nav-link" to="/panel/reportes/sucursal/">
                  <span class="sidenav-mini-icon"> S </span>
                  <span class="sidenav-normal"> Por sucursal</span>
                </nuxt-link>
              </li>
              <li class="nav-item">
                <nuxt-link class="nav-link" to="/panel/reportes/usuarios">
                  <span class="sidenav-mini-icon"> U </span>
                  <span class="sidenav-normal"> Por usuario</span>
                </nuxt-link>
              </li>
            </ul>
          </div>
        </li>

        <li class="nav-item mt-3" v-if="showSalesSection">
          <h6 class="ps-4 ms-2 text-uppercase text-xs font-weight-bolder opacity-6">VENTAS</h6>
        </li>
        <li class="nav-item" v-if="showSalesSection">
          <a data-bs-toggle="collapse" href="#ventas-cajero" class="nav-link" aria-controls="ventas-cajero" role="button" aria-expanded="false">
            <div class="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center me-2">
              <i class="fas fa-cash-register"></i>
            </div>
            <span class="nav-link-text ms-1">Ventas</span>
          </a>
          <div class="collapse" id="ventas-cajero">
            <ul class="nav ms-4 ps-3">
              <li class="nav-item">
                <nuxt-link class="nav-link" to="/cajero/ventas/">
                  <span class="sidenav-mini-icon"> N </span>
                  <span class="sidenav-normal"> Nueva venta</span>
                </nuxt-link>
              </li>
              <li class="nav-item" v-if="ventasReadAccess">
                <nuxt-link class="nav-link" to="/cajero/ventas/lista">
                  <span class="sidenav-mini-icon"> L </span>
                  <span class="sidenav-normal"> Lista de ventas</span>
                </nuxt-link>
              </li>
            </ul>
          </div>
        </li>

      </ul>
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
    sucursalesAccess() {
      return this.hasAccess('sucursales.manage', 'sucursales');
    },
    clientesAccess() {
      return this.hasAccess('clientes.read', 'clientes');
    },
    serviciosAccess() {
      return this.hasAccess('servicios.manage', 'servicios');
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
        || this.sucursalesAccess
        || this.clientesAccess
        || this.serviciosAccess
        || this.notificacionesAccess
        || this.seguridadAccess;
    },
    showReportsSection() {
      return this.can('ventas.read') && this.canView('reportes');
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




