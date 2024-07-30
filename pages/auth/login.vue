<template>
   <div>
      <main class="main-content main-content-bg mt-0 ps">
         <transition name="fade" mode="out-in">
            <section v-if="isLogin" key="login" class="form-section">
               <div class="page-header min-vh-75 d-flex">
                  <div class="image-section">
                     <img src="/assets/imagenes/login1.jpg" class="img-fluid full-height" alt="Imagen">
                  </div>
                  <div class="form-container">
                     <div class="container">
                        <div class="row justify-content-center">
                           <div class="col-md-8">
                              <div class="card custom-card">
                                 <div class="card-header pb-3 text-center">
                                    <h3 class="font-weight-bold text-info">
                                       Iniciar sesión <i class="fas fa-sign-in-alt"></i>
                                    </h3>
                                 </div>
                                 <div class="card-body">
                                    <form @submit.prevent="submit">
                                       <div class="mb-3">
                                          <label for="email" class="form-label"><i class="far fa-envelope"></i> Correo
                                             Electrónico</label>
                                          <input type="email" v-model.trim="model.email" class="form-control" id="email"
                                             placeholder="Correo Electrónico" required>
                                       </div>
                                       <div class="mb-3 position-relative">
                                          <label for="password" class="form-label"><i class="fas fa-lock"></i>
                                             Contraseña</label>
                                          <input type="password" v-model.trim="model.password" class="form-control"
                                             id="password" placeholder="Contraseña" required>

                                          <button type="button"
                                             class="btn btn-outline-secondary btn-sm align-self-center"
                                             style="position: absolute; right: 10px; top: 50%; transform: translateY(-10%); border: none; z-index: 100;"
                                             @click="togglePasswordVisibility">
                                             <i class="fas" :class="showPassword ? 'fa-eye' : 'fa-eye-slash'"
                                                style="color: black;"></i>
                                          </button>

                                       </div>
                                       <div class="mb-3">
                                          <div id="recaptcha" class="g-recaptcha"></div>
                                       </div>
                                       <div class="text-center">
                                          <button type="submit"
                                             class="btn bg-gradient-info w-100 mt-4">Ingresar</button>
                                          <p class="mt-1">
                                             <a href="#" @click="toggleMode('forgotPassword')">¿Olvidaste tu
                                                contraseña?</a>
                                          </p>
                                       </div>
                                    </form>
                                    <div v-if="codigoEnviado">

                                       <form @submit.prevent="verificarCodigo">
                                          <div class="mb-3">
                                             <label for="codigo_confirmacion" class="form-label">Código de
                                                Confirmación</label>
                                             <input type="text" v-model="model.codigo_confirmacion" class="form-control"
                                                id="codigo_confirmacion" required>
                                          </div>
                                          <div class="text-center">
                                             <button type="submit" class="btn bg-gradient-info w-100 mt-4">Verificar
                                                Código</button>
                                          </div>
                                       </form>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </section>

            <section v-else key="forgotPassword" class="form-section">
               <div class="page-header min-vh-75 d-flex">
                  <div class="image-section">
                     <img src="/assets/imagenes/login1.jpg" class="img-fluid full-height" alt="Imagen">
                  </div>
                  <div class="form-container">
                     <div class="container">
                        <div class="row justify-content-center">
                           <div class="col-md-8">
                              <div class="card custom-card">
                                 <div class="card-header pb-3 text-center">
                                    <h3 class="font-weight-bold text-info">
                                       Recuperar Contraseña <i class="fas fa-key"></i>
                                    </h3>
                                 </div>
                                 <div class="card-body">
                                    <form @submit.prevent="submitForgotPassword">
                                       <div class="mb-3">
                                          <label for="forgot-email" class="form-label"><i class="far fa-envelope"></i>
                                             Correo Electrónico</label>
                                          <input type="email" v-model.trim="forgotPasswordEmail" class="form-control"
                                             id="forgot-email" placeholder="Correo Electrónico" required>
                                       </div>
                                       <div class="text-center">
                                          <button type="submit" class="btn bg-gradient-info w-100 mt-4">Enviar Correo de
                                             Recuperación</button>
                                          <p class="mt-3">
                                             <a href="#" @click="toggleMode('login')">Volver al inicio de sesión</a>
                                          </p>
                                       </div>
                                    </form>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </section>
         </transition>
      </main>

      <!-- Modal -->
      <div v-if="modalCitas" class="modal fade show" style="display: block; background: rgba(0, 0, 0, 0.5);">
         <div class="page-header min-vh-75">
            <div class="container">
               <div class="row justify-content-center">
                  <div class="col-md-6">
                     <div class="card custom-card">
                        <div class="card-header pb-3 text-center">
                           <h3 class="font-weight-bold text-info">
                              Recuperar Contraseña <i class="fas fa-key"></i>
                           </h3>
                        </div>
                        <div class="card-body">
                           <form @submit.prevent="enviarDatosCita">
                              <div class="mb-3">
                                 <label for="modal-token" class="form-label">Token de Restablecimiento</label>
                                 <input type="text" v-model.trim="resetToken" class="form-control" id="modal-token"
                                    placeholder="Token de Restablecimiento" required>
                              </div>
                              <div class="mb-3">
                                 <label for="modal-password" class="form-label">Nueva Contraseña</label>
                                 <input type="password" v-model.trim="newPassword" class="form-control"
                                    id="modal-password" placeholder="Nueva Contraseña" required>
                              </div>
                              <div class="modal-footer">
                                 <button type="button" class="btn btn-secondary" @click="cerrarModalCi">Cerrar</button>
                                 <button type="submit" class="btn bg-gradient-info">Cambiar Contraseña</button>
                              </div>
                           </form>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<script>
import Swal from 'sweetalert2';

export default {
   data() {
      return {
         apiUrl2: 'reset-password',
         codigoEnviado: false,
         isLogin: true,
         forgotPasswordEmail: '',
         codigo_confirmacion: '',
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
      }
   },
   mounted() {
      this.loadRecaptcha();
   },
   methods: {
      loadRecaptcha() {
         if (!document.querySelector('script[src="https://www.google.com/recaptcha/api.js"]')) {
            const script = document.createElement('script');
            script.src = 'https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit';
            script.async = true;
            script.defer = true;
            window.onloadCallback = this.renderRecaptcha;
            document.head.appendChild(script);
         } else {
            this.renderRecaptcha();
         }
      },
      renderRecaptcha() {
         if (window.grecaptcha) {
            window.grecaptcha.render('recaptcha', {
               sitekey: '6LeZRRkqAAAAAFkhwa0KlenJXafRgu9Yl7Nr41NC'
            });
         }
      },
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
               await this.$swal.fire({
                  toast: true,
                  position: 'center',
                  showConfirmButton: false,
                  timer: 4000,
                  timerProgressBar: true,
                  icon: 'success',
                  allowOutsideClick: false,
                  text: response.data.message
               }).then(() => {
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
         const passwordInput = document.getElementById('password');
         if (passwordInput) {
            passwordInput.type = this.showPassword ? 'text' : 'password';
            this.showPassword = !this.showPassword;
         }
      },
      async submit() {
         if (!this.model.email || !this.model.password) {
            this.$swal.fire({
               toast: true,
               position: 'center',
               showConfirmButton: false,
               icon: 'error',
               title: 'Oops...',
               text: 'Los campos son obligatorios. Por favor, llene ambos campos.',
            });
            return;
         }
         const recaptchaResponse = grecaptcha.getResponse();
         if (!recaptchaResponse) {
            this.$swal.fire({
               toast: true,
               position: 'center',
               showConfirmButton: false,
               icon: 'error',
               title: 'Oops...',
               text: 'Por favor, complete el reCAPTCHA.',
            });
            return;
         }
         try {
            const res = await this.$admin.post('login', { ...this.model, 'g-recaptcha-response': recaptchaResponse });

            if (res.data.message) {
               this.$swal.fire({
                  toast: true,
                  position: 'center',
                  showConfirmButton: false,
                  icon: 'success',
                  title: res.data.message,
               });
               this.codigoEnviado = true;
            } else if (res.data.error) {
               this.$swal.fire({
                  toast: true,
                  position: 'top-end',
                  showConfirmButton: false,
                  icon: 'error',
                  title: res.data.error,
               });
            }
         } catch (error) {
            if (error.response) {
               // El servidor respondió con un estado distinto a 2xx
               if (error.response.status === 403) {
                  this.$swal.fire({
                     toast: true,
                     position: 'top-end',
                     showConfirmButton: false,
                     icon: 'error',
                     title: 'Horario no permitido',
                     text: 'El sistema solo está disponible entre las 8 AM y las 7 PM.',
                  });
               } else if (error.response.status === 400) {
                  this.$swal.fire({
                     toast: true,
                     position: 'top-end',
                     showConfirmButton: false,
                     icon: 'error',
                     title: 'Correo no registrado',
                     text: 'El correo electrónico que ingresó no está registrado en el sistema.',
                  });
               } else if (error.response.status === 401) {
                  this.$swal.fire({
                     toast: true,
                     position: 'top-end',
                     showConfirmButton: false,
                     icon: 'error',
                     title: 'Credenciales incorrectas',
                  });
               } else {
                  this.$swal.fire({
                     toast: true,
                     position: 'top-end',
                     showConfirmButton: false,
                     icon: 'error',
                     title: 'Error',
                     text: error.response.data.error || 'Ocurrió un error. Por favor, inténtelo de nuevo más tarde.',
                  });
               }
            } else if (error.request) {
               // La solicitud fue hecha pero no hubo respuesta
               console.error('No response received:', error.request);
               this.$swal.fire({
                  title: "Error",
                  text: "No se recibió respuesta del servidor. Por favor, inténtelo de nuevo más tarde.",
                  icon: 'error',
               });
            } else {
               // Algo pasó al configurar la solicitud
               console.error('Error during login:', error.message);
               this.$swal.fire({
                  title: "Error",
                  text: "Ocurrió un error. Por favor, inténtelo de nuevo más tarde.",
                  icon: 'error',
               });
            }
         }
      }


      ,
      async verificarCodigo() {
         if (!this.model.codigo_confirmacion) {
            this.$swal.fire({
               toast: true,
               position: 'center',
               showConfirmButton: false,
               icon: 'error',
               title: 'Oops...',
               text: 'El código de confirmación es obligatorio. Por favor, ingréselo.',
            });
            return;
         }
         try {
            const res = await this.$admin.post('verificar-codigo-confirmacion', this.model);
            if (res.data.token) {
               this.$swal.fire({
                  toast: true,
                  position: 'center',
                  showConfirmButton: false,
                  timer: 2000,
                  timerProgressBar: true,
                  icon: 'success',
                  title: 'Inicio de sesión exitoso',
                  didOpen: () => {
                     Swal.showLoading();
                  }
               });
               this.$store.dispatch('auth/login', { token: res.data.token, user: res.data.cajero });
               setTimeout(() => {
                  this.$swal.close();
                  if (res.data.cajero.role === 'cajero') {
                     this.$router.push('/cajero/ventas/');
                  } else {
                     this.$router.push('/');
                  }
               }, 2000);
            } else if (res.data.error) {
               this.$swal.fire({
                  toast: true,
                  position: 'top-end',
                  showConfirmButton: false,
                  icon: 'error',
                  title: res.data.error,
               });
            }
         } catch (e) {
            console.error('Error during verification:', e);
            this.$swal.fire({
               title: "Error",
               text: "Ocurrió un error. Por favor, inténtelo de nuevo más tarde.",
               icon: 'error',
            });
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
               text: 'El campo de correo electrónico es obligatorio. Por favor, ingréselo.',
            });
            return;
         }
         try {
            const response = await this.$admin.post('/request-password-reset', { email: this.forgotPasswordEmail });
            if (response.data.message) {
               this.$swal.fire({
                  toast: true,
                  position: 'center',
                  showConfirmButton: false,
                  icon: 'success',
                  title: response.data.message,
               });
               this.abrirModalCita();
            } else if (response.data.error) {
               this.$swal.fire({
                  toast: true,
                  position: 'top-end',
                  showConfirmButton: false,
                  icon: 'error',
                  title: response.data.error,
               });
            }
         } catch (e) {
            console.error('Error during password reset request:', e);
            this.$swal.fire({
               title: "Error",
               text: "Ocurrió un error. Por favor, inténtelo de nuevo más tarde.",
               icon: 'error',
            });
         }
      },
      toggleMode(mode) {
         this.isLogin = mode === 'login';
         this.isRegister = mode === 'register';
         this.codigoEnviado = false;
      },
   }
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
   transition: transform 0.5s ease;
}

.fade-enter,
.fade-leave-to {
   transform: rotateY(-90deg);
}

.custom-card {
   border: 1px solid #ccc;
   border-radius: 12px;
   box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
   background: linear-gradient(180deg, #f9f9f9, #e6e6e6);
   transition: box-shadow 0.3s ease;
}

.custom-card:hover {
   box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
}

.card-header h3 {
   font-size: 24px;
}

.form-label {
   font-weight: bold;
}

.btn {
   font-weight: bold;
}

.btn:hover {
   opacity: 0.8;
}

i {
   margin-right: 5px;
}

.form-section {
   position: relative;
   display: flex;
   align-items: center;
}

.page-header {
   display: flex;
   width: 100%;
}

.image-section {
   flex: 1;
   overflow: hidden;
}

.image-section img {
   width: 100%;
   height: 100%;
   object-fit: cover;
}

.form-container {
   flex: 1;
   display: flex;
   justify-content: center;
   align-items: center;
}

.card.custom-card {
   position: relative;
   z-index: 1;
}

.card.custom-card .card-body {
   padding-right: 40px;
}

.btn-sm {
   padding: 0.25rem 0.5rem;
   font-size: 0.75rem;
}

.info-tooltip {
   position: absolute;
   top: calc(100% + 5px);
   left: 0;
   background-color: #fff;
   color: #555;
   border: 1px solid #ccc;
   padding: 5px;
   border-radius: 5px;
   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
   display: none;
   font-size: 0.8rem;
   font-family: Arial, sans-serif;
   max-width: 200px;
   text-align: left;
}

.position-relative:hover .info-tooltip {
   display: block;
}
</style>
