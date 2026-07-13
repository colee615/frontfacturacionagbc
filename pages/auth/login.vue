<template>
   <div class="launch-login-page">
      <main class="main-content launch-login-main">
         <section class="launch-login-shell">
            <div class="launch-login-left">
               <div class="login-content">
                  <transition name="fade-slide" mode="out-in">
                     <form v-if="isLogin" key="login-form" class="auth-form" @submit.prevent="submit">
                        <h2 class="auth-title auth-title-typing">Iniciar sesión</h2>

                        <div class="field-group">
                           <label for="email">Correo electrónico</label>
                           <div class="input-shell">
                              <i class="far fa-envelope"></i>
                              <input
                                 id="email"
                                 v-model.trim="model.email"
                                 type="email"
                                 class="form-control"
                                 placeholder="correo@empresa.com"
                                 autocomplete="email"
                                 required
                              >
                           </div>
                        </div>

                        <div class="field-group">
                           <label for="password">Contraseña</label>
                           <div class="input-shell">
                              <i class="fas fa-lock"></i>
                              <input
                                 id="password"
                                 v-model.trim="model.password"
                                 :type="showPassword ? 'text' : 'password'"
                                 class="form-control"
                                 placeholder="Ingresa tu contraseña"
                                 autocomplete="current-password"
                                 required
                              >
                              <button
                                 type="button"
                                 class="toggle-pass"
                                 :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                                 @click="togglePasswordVisibility"
                              >
                                 <i class="fas" :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
                              </button>
                           </div>
                        </div>

                        <label class="remember-row">
                           <input type="checkbox">
                           <span>Recordarme</span>
                        </label>

                        <button type="submit" class="btn btn-login-primary w-100">Ingresar</button>
                     </form>

                     <form v-else key="forgot-form" class="auth-form" @submit.prevent="submitForgotPassword">
                        <h2 class="auth-title">Recuperar contraseña</h2>
                        <p class="auth-subtitle">Te enviaremos un token a tu correo</p>

                        <div class="field-group">
                           <label for="forgot-email">Correo electrónico</label>
                           <div class="input-shell">
                              <i class="far fa-envelope"></i>
                              <input
                                 id="forgot-email"
                                 v-model.trim="forgotPasswordEmail"
                                 type="email"
                                 class="form-control"
                                 placeholder="correo@empresa.com"
                                 autocomplete="email"
                                 required
                              >
                           </div>
                        </div>

                        <button type="submit" class="btn btn-login-primary w-100">Enviar correo de recuperación</button>

                        <button type="button" class="btn-link-clean" @click="toggleMode('login')">
                           Volver al inicio de sesión
                        </button>
                     </form>
                  </transition>

                  <p class="auth-footer">
                     2026•@CorreosdeBolivia
                  </p>
               </div>
            </div>

            <div class="launch-login-right" aria-hidden="true">
               <img
                  src="/assets/imagenes/banner.png"
                  alt=""
                  class="side-banner"
               >
            </div>
         </section>
      </main>

      <div
         v-if="modalCitas"
         class="modal fade show d-block clean-modal-backdrop"
         tabindex="-1"
         role="dialog"
         aria-modal="true"
      >
         <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content clean-modal-content">
               <div class="modal-header border-0 pb-0">
                  <h5 class="modal-title">Restablecer contraseña</h5>
                  <button type="button" class="modal-close-btn" aria-label="Cerrar" @click="cerrarModalCi">
                     <span aria-hidden="true">&times;</span>
                  </button>
               </div>

               <div class="modal-body pt-2">
                  <form @submit.prevent="enviarDatosCita" class="d-grid gap-3">
                     <div>
                        <label for="modal-token" class="form-label">Token de restablecimiento</label>
                        <input
                           id="modal-token"
                           v-model.trim="resetToken"
                           type="text"
                           class="form-control"
                           placeholder="Ingresa el token recibido"
                           required
                        >
                     </div>

                     <div>
                        <label for="modal-password" class="form-label">Nueva contraseña</label>
                        <input
                           id="modal-password"
                           v-model.trim="newPassword"
                           type="password"
                           class="form-control"
                           placeholder="Nueva contraseña"
                           required
                        >
                     </div>

                     <div class="modal-actions">
                        <button type="button" class="btn btn-outline-secondary" @click="cerrarModalCi">Cancelar</button>
                        <button type="submit" class="btn btn-login-primary">Cambiar contraseña</button>
                     </div>
                  </form>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<script>
export default {
   data() {
      return {
         apiUrl2: 'reset-password',
         isLogin: true,
         forgotPasswordEmail: '',
         model: {
            email: '',
            password: ''
         },
         modalCitas: false,
         showPassword: false,
         model3: {
            password: ''
         },
         isRegister: false,
         resetToken: '',
         newPassword: ''
      };
   },
   methods: {
      async enviarDatosCita() {
         if (!this.resetToken || !this.newPassword) {
            await this.$swal.fire({
               toast: true,
               position: 'center',
               showConfirmButton: false,
               timerProgressBar: true,
               icon: 'error',
               text: 'Por favor complete ambos campos antes de continuar.',
               customClass: {
                  container: 'my-swal-container',
                  title: 'my-swal-title',
                  content: 'my-swal-content',
                  confirmButton: 'my-swal-confirm-button'
               }
            });
            return;
         }

         try {
            const response = await this.$admin.post(`${this.apiUrl2}/${this.resetToken}`, { password: this.newPassword });
            if (response.data.message) {
               await this.$swal
                  .fire({
                     toast: true,
                     position: 'center',
                     showConfirmButton: false,
                     timer: 4000,
                     timerProgressBar: true,
                     icon: 'success',
                     allowOutsideClick: false,
                     text: response.data.message
                  })
                  .then(() => {
                     this.cerrarModalCi();
                     this.toggleMode('login');
                  });
            } else if (response.data.error) {
               this.$swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: response.data.error
               });
            }
         } catch (error) {
            console.error(error);
            this.$swal.fire({
               icon: 'error',
               title: 'Error',
               text: 'Ocurrió un error al cambiar la contraseña. Por favor, inténtelo de nuevo más tarde.'
            });
         }
      },
      abrirModalCita() {
         this.modalCitas = true;
      },
      cerrarModalCi() {
         this.modalCitas = false;
      },
      togglePasswordVisibility() {
         this.showPassword = !this.showPassword;
      },
      async submit() {
         if (!this.model.email || !this.model.password) {
            this.$swal.fire({
               toast: true,
               position: 'center',
               showConfirmButton: false,
               icon: 'error',
               title: 'Oops...',
               text: 'Los campos son obligatorios. Por favor, llene ambos campos.'
            });
            return;
         }

         try {
            const res = await this.$admin.post('login', this.model);

            if (res.data.token) {
               const loginUser = res.data.usuario || null;
               const loginRoles = res.data.roles || (loginUser && loginUser.role ? [loginUser.role] : []);
               const loginPermissions = res.data.permissions || [];
               const loginViews = res.data.views || [];

               this.$store.dispatch('auth/login', {
                  token: res.data.token,
                  user: loginUser,
                  roles: loginRoles,
                  permissions: loginPermissions,
                  views: loginViews
               });

               try {
                  const me = await this.$admin.$get('me');
                  const user = me.usuario || loginUser;
                  const roles = me.roles || loginRoles;
                  const permissions = me.permissions || loginPermissions;
                  const views = me.views || loginViews;

                  this.$store.dispatch('auth/login', {
                     token: res.data.token,
                     user,
                     roles,
                     permissions,
                     views
                  });
               } catch (meError) {
                  console.error('Error loading full session from me:', meError);
               }

               this.$swal.fire({
                  toast: true,
                  position: 'center',
                  showConfirmButton: false,
                  timer: 2000,
                  timerProgressBar: true,
                  icon: 'success',
                  title: 'Inicio de sesión exitoso'
               });

               setTimeout(() => {
                  this.$swal.close();
                  this.$router.push('/');
               }, 2000);
            } else if (res.data.error) {
               this.$swal.fire({
                  toast: true,
                  position: 'top-end',
                  showConfirmButton: false,
                  icon: 'error',
                  title: res.data.error
               });
            }
         } catch (error) {
            if (error.response) {
               if (error.response.status === 403) {
                  this.$swal.fire({
                     toast: true,
                     position: 'top-end',
                     showConfirmButton: false,
                     icon: 'error',
                     title: error.response.data && error.response.data.error ? error.response.data.error : 'Acceso denegado',
                     text: error.response.data && error.response.data.message
                        ? error.response.data.message
                        : 'No tienes permiso para realizar esta acción.'
                  });
               } else if (error.response.status === 400 || error.response.status === 401) {
                  this.$swal.fire({
                     toast: true,
                     position: 'top-end',
                     showConfirmButton: false,
                     icon: 'error',
                     title: 'Credenciales incorrectas'
                  });
               } else {
                  this.$swal.fire({
                     toast: true,
                     position: 'top-end',
                     showConfirmButton: false,
                     icon: 'error',
                     title: 'Error',
                     text: error.response.data && error.response.data.error
                        ? error.response.data.error
                        : 'Ocurrió un error. Por favor, inténtelo de nuevo más tarde.'
                  });
               }
            } else if (error.request) {
               console.error('No response received:', error.request);
               this.$swal.fire({
                  title: 'Error',
                  text: 'No se recibió respuesta del servidor. Por favor, inténtelo de nuevo más tarde.',
                  icon: 'error'
               });
            } else {
               console.error('Error during login:', error.message);
               this.$swal.fire({
                  title: 'Error',
                  text: 'Ocurrió un error. Por favor, inténtelo de nuevo más tarde.',
                  icon: 'error'
               });
            }
         }
      },
      async submitForgotPassword() {
         if (!this.forgotPasswordEmail) {
            this.$swal.fire({
               toast: true,
               position: 'center',
               showConfirmButton: false,
               icon: 'error',
               title: 'Oops...',
               text: 'El campo de correo electrónico es obligatorio. Por favor, ingréselo.'
            });
            return;
         }

         try {
            const response = await this.$admin.post('/request-password-reset', { email: this.forgotPasswordEmail });
            if (response.data.message) {
               this.$swal.fire({
                  toast: true,
                  position: 'center',
                  showConfirmButton: true,
                  icon: 'success',
                  title: response.data.message
               });

               // For secure environments the token is not returned by API.
               if (response.data.reset_token) {
                  this.resetToken = response.data.reset_token;
                  this.abrirModalCita();
               }
            } else if (response.data.error) {
               this.$swal.fire({
                  toast: true,
                  position: 'top-end',
                  showConfirmButton: false,
                  icon: 'error',
                  title: response.data.error
               });
            }
         } catch (e) {
            console.error('Error during password reset request:', e);
            this.$swal.fire({
               title: 'Error',
               text: 'Ocurrió un error. Por favor, inténtelo de nuevo más tarde.',
               icon: 'error'
            });
         }
      },
      toggleMode(mode) {
         this.isLogin = mode === 'login';
         this.isRegister = mode === 'register';
      }
   }
};
</script>

<style scoped>
.launch-login-page {
   min-height: 100vh;
   background:
      radial-gradient(circle at 10% 18%, rgba(255, 208, 84, 0.12) 0%, rgba(255, 208, 84, 0) 20%),
      radial-gradient(circle at 90% 84%, rgba(37, 99, 235, 0.1) 0%, rgba(37, 99, 235, 0) 24%),
      linear-gradient(145deg, #f7f9fd 0%, #eef3fb 52%, #ebf1fa 100%);
}

.launch-login-main {
   min-height: 100vh;
   display: flex;
   align-items: center;
   justify-content: center;
   padding: 2.75rem;
}

.launch-login-shell {
   width: 100%;
   max-width: 980px;
   min-height: 600px;
   background: #ffffff;
   border: 1px solid #e2e8f0;
   border-radius: 32px;
   box-shadow: 0 28px 64px rgba(15, 23, 42, 0.1);
   overflow: hidden;
   display: grid;
   grid-template-columns: 315px minmax(0, 1fr);
}

.launch-login-left {
   display: flex;
   flex-direction: column;
   padding: 2rem 1.6rem 1.35rem;
   background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 251, 255, 0.96) 100%);
   border-right: 1px solid #edf2f7;
}

.login-content {
   display: flex;
   flex: 1;
   flex-direction: column;
   justify-content: center;
   gap: 1.4rem;
   align-items: center;
}

.auth-form {
   display: grid;
   gap: 1rem;
   width: 100%;
   max-width: 270px;
   margin: 0 auto;
}

.auth-title {
   margin: 0 0 0.35rem;
   font-size: 1.8rem;
   font-weight: 800;
   color: #14213d;
   letter-spacing: -0.04em;
   line-height: 1.05;
   display: inline-block;
   position: relative;
}

.auth-title-typing {
   white-space: nowrap;
   clip-path: inset(0 100% 0 0);
   animation: typing-login 1.8s steps(14, end) 0.15s 1 forwards;
}

.auth-title-typing::after {
   content: '';
   position: absolute;
   top: 0.08em;
   right: -0.12em;
   width: 2px;
   height: 0.9em;
   background: rgba(20, 33, 61, 0.55);
   animation:
      typing-login 1.8s steps(14, end) 0.15s 1 forwards,
      caret-blink 0.75s step-end 5;
}

.auth-subtitle {
   margin: -0.15rem 0 1rem;
   color: #70819b;
   font-size: 0.92rem;
}

.field-group label {
   display: inline-block;
   margin-bottom: 0.38rem;
   font-size: 0.84rem;
   font-weight: 700;
   color: #31445f;
   letter-spacing: 0.01em;
   text-transform: uppercase;
}

.input-shell {
   position: relative;
}

.input-shell > i {
   position: absolute;
   left: 0.9rem;
   top: 50%;
   transform: translateY(-50%);
   color: #94a3b8;
}

.input-shell .form-control {
   min-height: 50px;
   border-radius: 14px;
   border: 1px solid #d8e2f0;
   background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
   padding-left: 2.35rem;
   padding-right: 2.35rem;
   box-shadow: none;
   color: #1f2937;
   transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.input-shell .form-control:focus {
   border-color: #f2be22;
   background: #fff;
   box-shadow: 0 0 0 0.16rem rgba(242, 190, 34, 0.11);
}

.toggle-pass {
   position: absolute;
   right: 0.55rem;
   top: 50%;
   transform: translateY(-50%);
   border: none;
   background: transparent;
   color: #64748b;
   width: 32px;
   height: 32px;
   border-radius: 50%;
}

.toggle-pass:hover {
   background: rgba(148, 163, 184, 0.16);
}

.remember-row {
   display: inline-flex;
   align-items: center;
   gap: 0.45rem;
   color: #475569;
   font-size: 0.88rem;
   user-select: none;
   margin-top: 0.2rem;
   width: fit-content;
}

.btn-login-primary {
   min-height: 52px;
   border-radius: 15px;
   border: 1px solid rgba(201, 154, 35, 0.24);
   background: linear-gradient(135deg, #ffe38a 0%, #ffd54f 100%);
   color: #5a4006;
   font-weight: 800;
   letter-spacing: 0.01em;
   box-shadow: 0 10px 22px rgba(201, 154, 35, 0.16);
   transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
}

.btn-login-primary:hover {
   color: #5a4006;
   filter: brightness(0.99);
   transform: translateY(-1px);
   box-shadow: 0 18px 34px rgba(201, 154, 35, 0.22);
}

.btn-link-clean {
   border: none;
   background: none;
   color: #2d5cae;
   font-weight: 700;
   width: fit-content;
   margin: 0.7rem auto 0;
   padding: 0;
}

.btn-link-clean:hover {
   color: #0f172a;
   text-decoration: underline;
   text-underline-offset: 0.16rem;
}

.auth-footer {
   margin: 0 auto;
   color: #93a4c0;
   font-size: 0.76rem;
   line-height: 1.5;
   text-align: center;
   padding-top: 0.8rem;
   width: 100%;
   max-width: 270px;
}

.launch-login-right {
   position: relative;
   display: flex;
   align-items: center;
   justify-content: center;
   overflow: hidden;
   background:
      radial-gradient(circle at top right, rgba(255, 209, 102, 0.1) 0%, rgba(255, 209, 102, 0) 22%),
      linear-gradient(180deg, #f8fbff 0%, #f4f8ff 100%);
   padding: 0.15rem;
}

.side-banner {
   display: block;
   width: 100%;
   height: 100%;
   max-width: none;
   max-height: none;
   object-fit: cover;
   object-position: center;
}

.clean-modal-backdrop {
   background: rgba(15, 23, 42, 0.5);
}

.clean-modal-content {
   border-radius: 18px;
   border: 1px solid rgba(226, 232, 240, 0.92);
   box-shadow: 0 20px 36px rgba(15, 23, 42, 0.2);
}

.clean-modal-content .modal-title {
   color: #1f2937;
   font-weight: 700;
}

.clean-modal-content .form-control {
   border-radius: 12px;
   min-height: 46px;
}

.clean-modal-content .form-control:focus {
   border-color: #f2be22;
   box-shadow: 0 0 0 0.2rem rgba(242, 190, 34, 0.18);
}

.modal-close-btn {
   border: none;
   background: transparent;
   color: #64748b;
   font-size: 1.6rem;
   line-height: 1;
   padding: 0.15rem 0.35rem;
}

.modal-close-btn:hover {
   color: #0f172a;
}

.modal-actions {
   display: flex;
   justify-content: flex-end;
   gap: 0.7rem;
   margin-top: 0.4rem;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
   transition: all 0.22s ease;
}

.fade-slide-enter,
.fade-slide-leave-to {
   opacity: 0;
   transform: translateY(6px);
}

@keyframes typing-login {
   from {
      clip-path: inset(0 100% 0 0);
   }
   to {
      clip-path: inset(0 0 0 0);
   }
}

@keyframes caret-blink {
   0%,
   100% {
      border-right-color: rgba(20, 33, 61, 0.55);
   }
   50% {
      border-right-color: transparent;
   }
}

@media (max-width: 1000px) {
   .launch-login-shell {
      grid-template-columns: 1fr;
      min-height: auto;
   }

   .launch-login-left {
      padding: 1.75rem 1.3rem 1.1rem;
   }

   .launch-login-right {
      min-height: 340px;
      padding: 1rem;
   }

   .launch-login-left {
      border-right: none;
      border-bottom: 1px solid #e6edf8;
   }
}

@media (max-width: 576px) {
   .launch-login-main {
      padding: 0.75rem;
   }

   .auth-title {
      font-size: 1.75rem;
    }

   .launch-login-right {
      min-height: 240px;
      padding: 0.8rem;
   }

   .side-banner {
      max-width: none;
      max-height: none;
   }
}
</style>
