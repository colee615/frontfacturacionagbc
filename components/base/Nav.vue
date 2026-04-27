<template>
   <nav
      class="enterprise-topbar"
      id="navbarBlur"
      data-scroll="true"
   >
      <div class="container-fluid p-0">
         <div class="topbar-shell">
            <div class="topbar-left">
               <div class="breadcrumb-chip">
                  <i class="fas fa-layer-group"></i>
                  <span>{{ page }}</span>
               </div>

               <div class="topbar-heading">
                  <h5 class="mb-1">{{ modulo || page }}</h5>
                  <p class="mb-0">
                     {{ userName || 'Usuario activo' }}
                  </p>
               </div>
            </div>

            <div class="topbar-center d-none d-xl-flex">
               <div class="context-pill">
                  <i class="fas fa-id-badge"></i>
                  <span>{{ roleLabel || 'Sin rol' }}</span>
               </div>
               <div class="context-pill">
                  <i class="fas fa-shield-alt"></i>
                  <span>{{ accessLabel }}</span>
               </div>
            </div>

            <div class="topbar-actions">
               <button class="topbar-icon-btn d-none d-xl-inline-flex" @click="SideToggle()" title="Mostrar u ocultar menú">
                  <i class="fas fa-bars"></i>
               </button>

               <button class="topbar-icon-btn d-xl-none" @click="hideSideNav()" id="iconNavbarSidenav" title="Menú">
                  <i class="fas fa-bars"></i>
               </button>

               <button class="topbar-icon-btn" @click="toggleTheme" :title="themeLabel" :aria-label="themeLabel">
                  <i v-if="isDark" class="fas fa-sun"></i>
                  <i v-else class="fas fa-moon"></i>
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
         theme: 'enterprise-light',
      }
   },
   computed: {
      isDark() {
         return this.theme === 'enterprise-dark';
      },
      themeLabel() {
         return this.isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
      },
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
      roleLabel() {
         if (this.roles.includes('admin')) return 'Administrador';
         if (this.roles.includes('usuario')) return 'Operador';
         return this.role || '';
      },
      accessLabel() {
         return this.roles.length ? 'Acceso configurado' : 'Acceso básico';
      },
   },
   methods: {
      SideToggle() {
         document.body.classList.toggle('enterprise-sidebar-collapsed');
      },
      hideSideNav() {
         const side = document.getElementById('sidenav-main');
         if (!side) return;
         side.classList.toggle('d-none');
      },
      applyTheme(theme) {
         const normalized = theme === 'enterprise-dark' || theme === 'dark-version'
            ? 'enterprise-dark'
            : 'enterprise-light';

         document.body.classList.remove('enterprise-dark', 'enterprise-light', 'dark-version', 'light-version');
         document.body.classList.add(normalized);
         document.documentElement.setAttribute('data-theme', normalized === 'enterprise-dark' ? 'dark' : 'light');

         localStorage.setItem('theme.pos', normalized);
         this.theme = normalized;
      },
      resolveInitialTheme() {
         const saved = localStorage.getItem('theme.pos');
         if (saved) {
            return saved;
         }

         const prefersDark = window.matchMedia
            && window.matchMedia('(prefers-color-scheme: dark)').matches;

         return prefersDark ? 'enterprise-dark' : 'enterprise-light';
      },
      toggleTheme() {
         this.applyTheme(this.isDark ? 'enterprise-light' : 'enterprise-dark');
      },
      Logout() {
         this.$store.dispatch('auth/logout');
         this.$router.push('/auth/login');
      }
   },
   mounted() {
      this.$nextTick(() => {
         this.applyTheme(this.resolveInitialTheme());
         if (window.innerWidth <= 767) {
            document.getElementById('iconSidenav').classList.remove('d-none')
            document.getElementById('sidenav-main').classList.add('d-none')
         }
      });
   }
}
</script>

<style scoped>
.enterprise-topbar {
   margin: 16px 18px 0 0;
   border-radius: 22px;
   background: rgba(255, 255, 255, 0.96);
   backdrop-filter: blur(12px);
   box-shadow: 0 18px 55px rgba(24, 39, 75, 0.08);
   border: 1px solid rgba(215, 222, 235, 0.92);
}

.topbar-shell {
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: 14px;
   width: 100%;
   min-height: 76px;
   padding: 12px 16px;
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
   background: #f5f7fb;
   color: #4b5565;
   font-size: 11px;
   font-weight: 800;
   white-space: nowrap;
   border: 1px solid #e6ebf3;
}

.topbar-heading h5 {
   font-weight: 800;
   color: #1f2937;
   font-size: 18px;
}

.topbar-heading p {
   color: #667085;
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
   background: #f5f7fb;
   color: #4b5565;
   border: 1px solid #e6ebf3;
}

.topbar-icon-btn:hover {
   background: #eef2ff;
   color: #3442a8;
}

.logout-btn {
   height: 40px;
   padding: 0 15px;
   background: #1f2937;
   color: #ffffff;
   font-weight: 700;
   font-size: 14px;
   border: 1px solid rgba(31, 41, 55, 0.12);
   box-shadow: 0 12px 24px rgba(31, 41, 55, 0.12);
}

.logout-btn:hover {
   background: #344054;
   color: #ffffff;
}

@media (max-width: 1199px) {
   .topbar-shell {
      flex-wrap: wrap;
   }
}

@media (max-width: 767px) {
   .enterprise-topbar {
      margin: 12px 12px 0;
   }

   .topbar-shell {
      min-height: auto;
   }

   .topbar-left {
      width: 100%;
   }

   .topbar-heading p {
      display: none;
   }
}
</style>
