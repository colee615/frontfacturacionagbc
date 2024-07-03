<template>
   <div>


      <main class="main-content main-content-bg mt-0 ps">
         <transition name="fade" mode="out-in">
            <section v-if="isLogin" key="login" class="form-section">
               <div class="page-header min-vh-75">
                  <div class="container">
                     <div class="row justify-content-center">
                        <div class="col-md-6">
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
                                       <button type="button" class="btn btn-outline-secondary btn-sm align-self-center"
                                          style="position: absolute; right: 10px; top: 70%; transform: translateY(-50%); border: none; z-index: 100;"
                                          @click="togglePasswordVisibility">
                                          <i class="fas" :class="showPassword ? 'fa-eye' : 'fa-eye-slash'"
                                             style="color: black;"></i>
                                       </button>
                                    </div>
                                    <div class="text-center">
                                       <button type="submit" class="btn bg-gradient-info w-100 mt-4">
                                          Ingresar
                                       </button>

                                       <p class="mt-1">
                                          <a href="#" @click="toggleMode('forgotPassword')">¿Olvidaste tu
                                             contraseña?</a>
                                       </p>
                                    </div>
                                 </form>

                                 <div v-if="codigoEnviado">
                                    <p>Se ha enviado un código de confirmación a su correo. Por favor, ingréselo a
                                       continuación:</p>
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

            </section>

            <section v-else key="forgotPassword" class="form-section">
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
         isRegister: false, // Define isRegister here
         resetToken: '',  // Añadir esta línea
         newPassword: ''  // Añadir esta línea
      }
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
      abrirModalCita() { // Modificar esta línea
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
         try {
            const res = await this.$admin.post('login', this.model);
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
         } catch (e) {
            console.error('Error during login:', e);
            this.$swal.fire({
               title: "Error",
               text: "Ocurrió un error. Por favor, inténtelo de nuevo más tarde.",
               icon: 'error',
            });
         }
      },
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
                  this.$router.push('/');
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
      }

      ,

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
               this.abrirModalCita(); // Abrir modal para ingresar token y nueva contraseña
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
      togglePasswordVisibility() {
         const passwordInput = document.getElementById('password');
         if (passwordInput) {
            passwordInput.type = this.showPassword ? 'text' : 'password';
            this.showPassword = !this.showPassword;
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

.background-image-container {
   position: absolute;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   background: linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/assets/imagenes/login1.jpg') center center / cover no-repeat;
   z-index: 0;
}

.oblique-image {
   filter: blur(8px) brightness(0.7);
}
</style>
