<template>
   <div class="launch-login-page">
      <main class="main-content launch-login-main">
         <section class="launch-login-shell">
            <div class="launch-login-left">
               <div class="login-content">
                  <transition name="fade-slide" mode="out-in">
                     <form v-if="isLogin" key="login-form" class="auth-form" @submit.prevent="submit">
                        <h1 class="auth-title">Iniciar sesión</h1>

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

                        <label class="remember-row" for="remember-me">
                           <input id="remember-me" v-model="model.rememberMe" type="checkbox">
                           <span>Recordarme</span>
                        </label>

                        <button type="button" class="btn-link-clean recovery-link" @click="toggleMode('forgot')">¿Olvidaste tu contraseña?</button>

                        <button type="submit" class="btn btn-login-primary w-100" :disabled="submitting"><span>{{ submitting ? 'Ingresando…' : 'Ingresar' }}</span></button>
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

                        <button type="button" class="btn-link-clean" @click="abrirModalCita">Ya tengo un token de recuperación</button>

                        <button type="button" class="btn-link-clean" @click="toggleMode('login')">
                           Volver al inicio de sesión
                        </button>
                     </form>
                  </transition>

                  <p class="auth-footer">
                     © {{ new Date().getFullYear() }} Correos de Bolivia · AGBC
                  </p>
               </div>
            </div>

            <div class="launch-login-right">
               <img src="/assets/imagenes/banner.png" alt="Bienvenido a Correos de Bolivia: servicios postales y plataforma de gestión." class="login-welcome-banner">
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
         submitting: false,
         forgotPasswordEmail: '',
         model: {
            email: '',
            password: '',
            rememberMe: false
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
         if (this.submitting) return;
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
            this.submitting = true;
            const res = await this.$admin.post('login', {
               email: this.model.email,
               password: this.model.password,
               remember_me: this.model.rememberMe
            });

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
                  views: loginViews,
                  rememberMe: this.model.rememberMe
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
                     views,
                     rememberMe: this.model.rememberMe
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
         } finally {
            this.submitting = false;
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

.launch-login-page { min-height: 100vh; background: #f1f5f8; color: #21384d; font-family: 'Inter', 'Segoe UI', sans-serif; }
.launch-login-main { min-height: 100vh; display: grid; place-items: center; padding: 12px; }
.launch-login-shell { width: 100%; max-width: 980px; min-height: 630px; display: grid; grid-template-columns: minmax(290px, 32%) minmax(0, 68%); border: 1px solid #e1e9f1; border-radius: 30px; background: #fff; box-shadow: 0 20px 56px #153d6813; overflow: hidden; }
.launch-login-left { padding: 24px 26px; display: flex; flex-direction: column; background: linear-gradient(180deg, #fff 0%, #fbfdff 100%); }
.login-content { display: flex; flex: 1; flex-direction: column; justify-content: center; padding-top: 12px; }
.auth-form { width: 100%; display: grid; gap: 16px; margin: auto 0; }
.auth-title { font-size: 28px; font-weight: 700; letter-spacing: -.04em; color: #102d56; margin: 0 0 4px; }
.auth-subtitle { font-size: 12px; color: #8290a4; line-height: 1.8; margin-bottom: 8px; }
.field-group label { font-size: 11px; font-weight: 700; letter-spacing: .035em; color: #183961; display: block; margin-bottom: 8px; text-transform: uppercase; }
.input-shell { position: relative; }
.input-shell > i { position: absolute; top: 50%; left: 14px; transform: translateY(-50%); color: #8da0ba; font-size: 14px; }
.input-shell .form-control { height: 50px; background: #fff; border: 1px solid #d2deec; border-radius: 10px; padding: 0 42px; font-size: 12px; color: #263e5c; box-shadow: none; }
.input-shell .form-control:focus { border-color: #2b70bd; box-shadow: 0 0 0 3px #2b70bd17; }
.launch-login-page :focus-visible { outline: 2px solid #2b70bd; outline-offset: 2px; }
.toggle-pass { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); width: 30px; height: 30px; border: 0; background: transparent; color: #617995; border-radius: 5px; }
.remember-row { display: flex; align-items: center; gap: 8px; margin: -1px 0 0; color: #384d68; font-size: 12px; font-weight: 600; cursor: pointer; }
.remember-row input { accent-color: #155da6; width: 14px; height: 14px; margin: 0; }
.btn-link-clean { padding: 0; background: transparent; border: 0; color: #185eaa; font-size: 11px; font-weight: 600; }
.recovery-link { justify-self: end; margin-top: -14px; }
.btn-login-primary { height: 52px; background: #ffd956; color: #16375e; border-radius: 14px; border: 1px solid #f5c83e; display: flex; align-items: center; justify-content: center; gap: 24px; font-size: 12px; font-weight: 750; text-transform: uppercase; box-shadow: 0 8px 18px #dfaa221b; margin: 0; }
.btn-login-primary:hover { color: #16375e; background: #ffce32; border-color: #f0be26; transform: none; }
.btn-login-primary:disabled { opacity: .6; }
.auth-footer { margin: auto 0 0; padding-top: 28px; color: #7189a7; font-size: 10px; text-align: center; }
.launch-login-right { position: relative; min-width: 0; min-height: 100%; overflow: hidden; background: #fff; }
.login-welcome-banner { display: block; position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; }
.clean-modal-backdrop { background: #132c4480; backdrop-filter: blur(4px); }
.clean-modal-content { border: 0; border-radius: 16px; }
.modal-close-btn { background: transparent; border: 0; font-size: 24px; color: #738195; }
.modal-actions { display: flex; gap: 12px; justify-content: flex-end; }
.fade-slide-enter-active, .fade-slide-leave-active { transition: opacity .15s; }
.fade-slide-enter, .fade-slide-leave-to { opacity: 0; }
@media (max-width: 900px) { .launch-login-shell { grid-template-columns: minmax(275px, 40%) minmax(0, 60%); } .launch-login-left { padding: 22px; } }
@media (max-width: 700px) { .launch-login-main { padding: 16px; } .launch-login-shell { grid-template-columns: 1fr; min-height: 0; max-width: 460px; border-radius: 22px; } .launch-login-right { display: none; } .launch-login-left { padding: 26px 24px 20px; } .login-content { flex: 0 1 auto; justify-content: flex-start; padding-top: 0; } .auth-footer { margin: 34px 0 0; padding-top: 0; } }
@media (prefers-reduced-motion: reduce) { * { transition: none !important; } }

</style>
