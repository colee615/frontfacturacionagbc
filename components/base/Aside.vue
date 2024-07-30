<template>
   <aside class="sidenav navbar navbar-vertical navbar-expand-xs border-0 border-radius-xl my-3 fixed-start ms-3"
      id="sidenav-main">
      <div class="sidenav-header">
         <i class="fas fa-times p-3 cursor-pointer text-secondary opacity-5 position-absolute end-0 top-0 d-none d-xl-none"
            aria-hidden="true" id="iconSidenav"></i>
         <a class="navbar-brand m-0"
            href=" https://demos.creative-tim.com/soft-ui-dashboard-pro/pages/dashboards/default.html " target="_blank">
            <div class="col-lg-4 text-center mt-3 mt-lg-0">
               <img src="/assets/img/logo.png" alt="Logo de la Empresa" style="width: 50px; height: auto;">
               <span class="ms-2 align-middle">AGBC</span>
            </div>
         </a>
      </div>
      <hr class="horizontal dark mt-0" />
      <div class="collapse navbar-collapse w-auto h-auto" id="sidenav-collapse-main">
         <ul class="navbar-nav">

            <!-- Sección de Administración -->
            <li class="nav-item mt-3" v-if="isCashier || isAdmin">
               <h6 class="ps-4 ms-2 text-uppercase text-xs font-weight-bolder opacity-6">ADMINISTRACIÓN</h6>
            </li>
            <li class="nav-item" v-if="isCashier || isAdmin">
               <a data-bs-toggle="collapse" href="#usuarios" class="nav-link" aria-controls="usuarios" role="button"
                  aria-expanded="false">
                  <div
                     class="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center me-2">
                     <svg width="12px" height="12px" viewBox="0 0 42 42" version="1.1"
                        xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <title>office</title>
                        <!-- Contenido del icono de oficina -->
                     </svg>
                  </div>
                  <span class="nav-link-text ms-1">Configuración</span>
               </a>
               <div class="collapse" id="usuarios" v-if="isAdmin || isCashier">
                  <ul class="nav ms-4 ps-3">
                     <li class="nav-item" v-if="isAdmin">
                        <nuxt-link class="nav-link" to="/administrador/activaciones/">
                           <span class="sidenav-mini-icon"> A </span>
                           <span class="sidenav-normal"> Activaciones</span>
                        </nuxt-link>
                     </li>
                     <li class="nav-item" v-if="isAdmin">
                        <nuxt-link class="nav-link" to="/administrador/cajeros/">
                           <span class="sidenav-mini-icon"> C </span>
                           <span class="sidenav-normal"> Cajeros</span>
                        </nuxt-link>
                     </li>
                     <li class="nav-item" v-if="isAdmin">
                        <nuxt-link class="nav-link" to="/administrador/sucursales/">
                           <span class="sidenav-mini-icon"> S </span>
                           <span class="sidenav-normal"> Sucursales</span>
                        </nuxt-link>
                     </li>
                     <li class="nav-item" v-if="isAdmin || isCashier">
                        <nuxt-link class="nav-link" to="/administrador/clientes/">
                           <span class="sidenav-mini-icon"> C </span>
                           <span class="sidenav-normal"> Clientes</span>
                        </nuxt-link>
                     </li>
                     <li class="nav-item" v-if="isAdmin">
                        <nuxt-link class="nav-link" to="/administrador/servicios/">
                           <span class="sidenav-mini-icon"> S </span>
                           <span class="sidenav-normal"> Servicios</span>
                        </nuxt-link>
                     </li>
                     <li class="nav-item" v-if="isAdmin || isCashier">
                        <nuxt-link class="nav-link" to="/administrador/notificaciones/">
                           <span class="sidenav-mini-icon"> N </span>
                           <span class="sidenav-normal"> Notificaciones</span>
                        </nuxt-link>
                     </li>
                  </ul>
               </div>
            </li>

            <!-- Sección de Caja -->
            <li class="nav-item mt-3" v-if="isCashier || isAdmin">
               <h6 class="ps-4 ms-2 text-uppercase text-xs font-weight-bolder opacity-6">CAJA</h6>
            </li>
            <li class="nav-item" v-if="isCashier || isAdmin">
               <a data-bs-toggle="collapse" href="#caja" class="nav-link" aria-controls="caja" role="button"
                  aria-expanded="false">
                  <div
                     class="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center me-2">
                     <svg width="12px" height="12px" viewBox="0 0 42 42" version="1.1"
                        xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <title>office</title>
                        <!-- Contenido del icono -->
                     </svg>
                  </div>
                  <span class="nav-link-text ms-1">Caja</span>
               </a>
               <div class="collapse" id="caja">
                  <ul class="nav ms-4 ps-3">
                     <li class="nav-item">
                        <nuxt-link class="nav-link" to="/cajero/historial/">
                           <span class="sidenav-mini-icon"> H </span>
                           <span class="sidenav-normal"> Historial</span>
                        </nuxt-link>
                     </li>
                  </ul>
               </div>
            </li>

            <!-- Sección de Ventas -->
            <li class="nav-item mt-3" v-if="isCashier || isAdmin">
               <h6 class="ps-4 ms-2 text-uppercase text-xs font-weight-bolder opacity-6">VENTAS</h6>
            </li>
            <li class="nav-item" v-if="isCashier || isAdmin">
               <a data-bs-toggle="collapse" href="#venta" class="nav-link" aria-controls="venta" role="button"
                  aria-expanded="false">
                  <div
                     class="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center me-2">
                     <svg width="12px" height="12px" viewBox="0 0 42 42" version="1.1"
                        xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <title>office</title>
                        <!-- Contenido del icono -->
                     </svg>
                  </div>
                  <span class="nav-link-text ms-1">Ventas</span>
               </a>
               <div class="collapse" id="venta">
                  <ul class="nav ms-4 ps-3">
                     <li class="nav-item">
                        <nuxt-link class="nav-link" to="/cajero/ventas/">
                           <span class="sidenav-mini-icon"> N </span>
                           <span class="sidenav-normal"> Nueva venta </span>
                        </nuxt-link>
                     </li>
                     <li class="nav-item" v-if="isAdmin">
                        <nuxt-link class="nav-link" to="/cajero/ventas/lista">
                           <span class="sidenav-mini-icon"> V </span>
                           <span class="sidenav-normal"> Ventas </span>
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
      role() {
         return this.$store.state.auth.role; // Accede al rol desde el store de Vuex
      },
      isAdmin() {
         return this.role === 'administrador'; // Verifica si el rol es administrador
      },
      isCashier() {
         return this.role === 'cajero'; // Verifica si el rol es cajero
      }
   }
};
</script>
