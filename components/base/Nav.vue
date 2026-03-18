<template>
   <nav
      class="enterprise-topbar navbar navbar-main navbar-expand-lg position-sticky mt-4 top-1 px-0 mx-4 z-index-sticky"
      id="navbarBlur"
      data-scroll="true"
   >
      <div class="container-fluid py-2 px-3">
         <div class="topbar-shell">
            <div class="topbar-left">
               <div class="breadcrumb-chip">
                  <i class="fas fa-layer-group"></i>
                  <span>{{ page }}</span>
               </div>

               <div class="topbar-heading">
                  <h5 class="mb-1">{{ modulo }}</h5>
                  <p class="mb-0">
                     {{ userName || 'usuario' }}
                  </p>
               </div>
            </div>

            <div class="topbar-center d-none d-xl-flex">
               <div class="context-pill">
                  <i class="fas fa-id-badge"></i>
                  <span>{{ roleLabel || 'Sin rol' }}</span>
               </div>
               <div class="context-pill">
                  <i class="fas fa-map-marker-alt"></i>
                  <span>{{ departmentName || 'Sin sucursal asignada' }}</span>
               </div>
            </div>

            <div class="topbar-actions">
               <button class="topbar-icon-btn d-none d-xl-inline-flex" @click="SideToggle()" title="Mostrar u ocultar menú">
                  <i class="fas fa-bars"></i>
               </button>

               <button class="topbar-icon-btn d-xl-none" @click="hideSideNav()" id="iconNavbarSidenav" title="Menú">
                  <i class="fas fa-bars"></i>
               </button>

               <button class="topbar-icon-btn" @click="DarkMode()" title="Cambiar tema">
                  <i v-if="theme == 'light-version'" class="fas fa-moon"></i>
                  <i v-else class="fas fa-sun"></i>
               </button>

               <button class="logout-btn" @click="Logout()">
                  <i class="fas fa-sign-out-alt"></i>
                  <span class="d-none d-sm-inline">Cerrar sesión</span>
               </button>
            </div>
         </div>
      </div>
   </nav>
</template>

<script>
export default {
   props: {
      page: {
         type: String,
         default: ''
      },
      modulo: {
         type: String,
         default: ''
      },
   },
   data() {
      return {
         theme: 'light-version',
      }
   },
   computed: {
      user() {
         return this.$store.state.auth.user;
      },
      role() {
         return this.$store.state.auth.role;
      },
      roles() {
         return this.$store.state.auth.roles || [];
      },
      userName() {
         return this.user && this.user.name ? this.user.name : '';
      },
      departmentName() {
         return this.user && this.user.sucursale && this.user.sucursale.departamento
            ? this.user.sucursale.departamento
            : '';
      },
      roleLabel() {
         if (this.roles.includes('admin')) return 'Administrador';
         if (this.roles.includes('usuario')) return 'Operador';
         return this.role || '';
      },
   },
   methods: {
      SideToggle() {
         let body = document.body
         body.classList.add("g-sidenav-show", "bg-gray-");
         body.classList.contains("g-sidenav-hidden") ? body.classList.remove("g-sidenav-hidden") : body.classList.add("g-sidenav-hidden");
      },
      hideSideNav() {
         let side = document.getElementById('sidenav-main')
         side.classList.contains("d-none") ? side.classList.remove("d-none") : side.classList.add("d-none");
      },
      DarkMode() {
         let theme = localStorage.getItem('theme.pos')
         let body = document.body
         if (theme != null) {
            if (body.classList.contains("dark-version")) {
               body.classList.remove("dark-version")
               theme = "light-version"
               localStorage.setItem('theme.pos', theme)
            } else {
               body.classList.remove("light-version")
               theme = "dark-version"
               localStorage.setItem('theme.pos', theme)
            }
            this.theme = theme
            body.classList.add(theme)
         } else {
            localStorage.setItem('theme.pos', "dark-version")
         }
      },
      Logout() {
         this.$store.dispatch('auth/logout');
         this.$router.push('/auth/login');
      }
   },
   mounted() {
      this.$nextTick(() => {
         let body = document.body
         let theme = localStorage.getItem('theme.pos')
         if (theme != null) {
            body.classList.add(theme);
            this.theme = theme
         }
         if (window.innerWidth <= 767) {
            body.classList.add('g-sidenav-pinned')
            document.getElementById('iconSidenav').classList.remove('d-none')
            document.getElementById('sidenav-main').classList.add('d-none')
         }
      });
   }
}
</script>

<style scoped>
.enterprise-topbar {
   border-radius: 22px;
   background: linear-gradient(180deg, #ffd84f 0%, #f3c228 100%);
   backdrop-filter: blur(12px);
   box-shadow: 0 14px 30px rgba(120, 85, 10, 0.16);
   border: 1px solid rgba(176, 121, 0, 0.2);
}

.topbar-shell {
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: 14px;
   width: 100%;
}

.topbar-left {
   display: flex;
   align-items: center;
   gap: 16px;
   min-width: 0;
}

.breadcrumb-chip,
.context-pill {
   display: inline-flex;
   align-items: center;
   gap: 8px;
   padding: 9px 13px;
   border-radius: 999px;
   background: rgba(255, 255, 255, 0.34);
   color: #6c4a05;
   font-size: 11px;
   font-weight: 700;
   white-space: nowrap;
   border: 1px solid rgba(176, 121, 0, 0.16);
}

.topbar-heading h5 {
   font-weight: 800;
   color: #4d3503;
   font-size: 17px;
}

.topbar-heading p {
   color: rgba(92, 61, 0, 0.8);
   font-size: 12px;
}

.topbar-center {
   display: flex;
   align-items: center;
   gap: 10px;
}

.topbar-actions {
   display: flex;
   align-items: center;
   gap: 8px;
}

.topbar-icon-btn,
.logout-btn {
   border: 0;
   border-radius: 14px;
   display: inline-flex;
   align-items: center;
   justify-content: center;
   gap: 8px;
   transition: all 0.2s ease;
}

.topbar-icon-btn {
   width: 40px;
   height: 40px;
   background: rgba(255, 255, 255, 0.34);
   color: #6c4a05;
   border: 1px solid rgba(176, 121, 0, 0.16);
}

.topbar-icon-btn:hover {
   background: rgba(255, 255, 255, 0.54);
}

.logout-btn {
   height: 40px;
   padding: 0 15px;
   background: rgba(255, 255, 255, 0.92);
   color: #6c4a05;
   font-weight: 700;
   font-size: 14px;
   border: 1px solid rgba(176, 121, 0, 0.18);
   box-shadow: 0 10px 20px rgba(120, 85, 10, 0.1);
}

.logout-btn:hover {
   opacity: 0.96;
}

@media (max-width: 1199px) {
   .topbar-shell {
      flex-wrap: wrap;
   }
}

@media (max-width: 767px) {
   .topbar-left {
      width: 100%;
   }

   .topbar-heading p {
      display: none;
   }
}
</style>
