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
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

            </section>

            <section v-else-if="isRegister" key="register" class="form-section">
               <div class="page-header min-vh-75">
                  <div class="container">
                     <div class="row justify-content-center">
                        <div class="col-md-6">
                           <div class="card custom-card">
                              <div class="card-header pb-3 text-center">
                                 <h3 class="font-weight-bold text-info">
                                    Registrarse <i class="fas fa-user-plus"></i>
                                 </h3>
                              </div>

                              <div class="card-body">
                                 <div class="mb-3 position-relative">
                                    <label for="info" class="form-label"><i class="fas fa-question-circle"></i>
                                       Información</label>
                                    <!-- Mensaje de advertencia sobre campos obligatorios -->
                                    <div class="info-tooltip">
                                       Los campos marcados con * son obligatorios.
                                    </div>
                                 </div>
                                 <form @submit.prevent="Save">
                                    <div class="mb-3">
                                       <label for="nombre" class="form-label"><i class="fas fa-user"></i> Nombre
                                          *</label>
                                       <input type="text" v-model.trim="model2.nombre_fundacion" class="form-control"
                                          id="nombre" placeholder="Nombre" required>
                                    </div>
                                    <div class="mb-3">
                                       <label for="departamento" class="form-label"><i class="fas fa-city"></i>
                                          Departamento
                                          *</label>
                                       <select v-model.trim="model2.departamento_fundacion" class="form-select"
                                          id="departamento_fundacion" required>
                                          <option value="" disabled selected>Selecciona un departamento</option>
                                          <option value="La Paz">La Paz</option>
                                          <option value="Santa Cruz">Santa Cruz</option>
                                          <option value="Cochabamba">Cochabamba</option>
                                          <option value="Oruro">Oruro</option>
                                          <option value="Potosí">Potosí</option>
                                          <option value="Tarija">Tarija</option>
                                          <option value="Chuquisaca">Chuquisaca</option>
                                          <option value="Beni">Beni</option>
                                          <option value="Pando">Pando</option>
                                       </select>
                                    </div>


                                    <div class="mb-3">
                                       <label for="numerocel_fundacion" class="form-label"><i class="fas fa-phone"></i>
                                          Teléfono
                                          Celular *</label>
                                       <input type="tel" v-model.trim="model2.numerocel_fundacion" class="form-control"
                                          id="numerocel_fundacion" placeholder="Teléfono Celular" required>
                                    </div>

                                    <div class="mb-3">
                                       <label for="">Tipo de organización *</label>
                                       <select name="" id="" class="form-control" v-model="model2.tipo_id">
                                          <option v-for="m in tipos" :value="m.id">{{ m.nombre_tipo }}</option>
                                       </select>
                                    </div>



                                    <div class="mb-3">
                                       <label for="email" class="form-label"><i class="far fa-envelope"></i> Correo
                                          Electrónico
                                          *</label>
                                       <input type="email" v-model.trim="model2.email_fundacion" class="form-control"
                                          id="email" placeholder="Correo Electrónico" required>
                                    </div>
                                    <div class="mb-3 position-relative">
                                       <label for="password" class="form-label"><i class="fas fa-lock"></i> Contraseña
                                          *</label>
                                       <input type="password" v-model.trim="model2.password" class="form-control"
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
                                          Registrarse
                                       </button>
                                       <p class="mt-3">
                                          ¿Ya tienes una cuenta? <a href="#" @click="toggleMode('login')">Inicia sesión
                                             aquí</a>.
                                       </p>
                                    </div>
                                 </form>
                              </div>
                           </div>
                        </div>
                        <div class="col-md-6">
                           <div class="oblique position-absolute top-0 h-100 d-md-block d-none me-n8">
                              <div
                                 class="oblique-image bg-cover position-absolute fixed-top ms-auto h-100 z-index-0 ms-n6"
                                 style="background-image: url('/assets/imagenes/login1.jpg');"></div>
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
                                          Correo
                                          Electrónico</label>
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

                           <div class="mb-3">
                              <label for="modal-token" class="form-label">Token de Restablecimiento</label>
                              <input type="text" v-model.trim="model3.token" class="form-control" id="modal-token"
                                 placeholder="Token de Restablecimiento" required>
                           </div>
                           <div class="mb-3">
                              <label for="modal-password" class="form-label">Nueva Contraseña</label>
                              <input type="password" v-model.trim="model3.password" class="form-control"
                                 id="modal-password" placeholder="Nueva Contraseña" required>
                           </div>
                        </div>
                        <div class="modal-footer">
                           <button type="submit" class="btn btn-secondary" @click="cerrarModalCi">Cerrar</button>
                           <button type="submit" class="btn bg-gradient-info" @click="enviarDatosCita">Cambiar
                              Contraseña</button>
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
import Cookies from 'js-cookie';

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
         }
      }
   },
   methods: {
      async enviarDatosCita() {
         if (!this.model3.token || !this.model3.password) {
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
         this.editModalLoad = true;
         try {
            const response = await this.$admin.$post(`${this.apiUrl2}/${this.model3.token}`, { password: this.model3.password });
            if (response.hasOwnProperty('message')) {
               await this.$swal.fire({
                  toast: true,
                  position: 'center',
                  showConfirmButton: false,
                  timer: 4000,
                  timerProgressBar: true,
                  icon: 'success',
                  allowOutsideClick: false,
                  text: response.message
               }).then(() => {
                  this.cerrarModalCi();
                  this.toggleMode('login');
               });
            } else if (response.hasOwnProperty('error')) {
               this.$swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: response.error
               });
            }
         } catch (error) {
            console.error(error);
            this.$swal.fire({
               icon: 'error',
               title: 'Error',
               text: 'Ocurrió un error al cambiar la contraseña. Por favor, inténtelo de nuevo más tarde.'
            });
         } finally {
            this.editModalLoad = false;
         }
      },
      abrirModalCita(token, password) {
         this.model3.token = token;
         this.model3.password = password;
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
            const res = await this.$login.post('login', this.model);
            console.log('Response from backend:', res);
            if (res.data.error) {
               this.$swal.fire({
                  toast: true,
                  position: 'top-end',
                  showConfirmButton: false,
                  icon: 'error',
                  title: res.data.error,
               });
            } else {
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
               if (process.client) {
                  this.$store.commit('auth/setToken', res.data.token);
                  this.$store.commit('auth/setUser', res.data.cajero);
                  localStorage.setItem('token', res.data.token);
                  localStorage.setItem('user', JSON.stringify(res.data.cajero));
               }
               setTimeout(() => {
                  this.$swal.close();
                  this.$router.push('/');
               }, 2000);
            }
         } catch (e) {
            console.error('Error during login:', e);
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
            const response = await this.$admin.$post('/recuperar-contrasena', { email_fundacion: this.forgotPasswordEmail });
            console.log(response);
            if (response.hasOwnProperty('mensaje')) {
               if (response.mensaje === 'Correo electrónico no encontrado en nuestra base de datos') {
                  this.$swal.fire({
                     toast: true,
                     position: 'center',
                     showConfirmButton: false,
                     timer: 6000,
                     timerProgressBar: true,
                     icon: 'error',
                     title: 'Correo electrónico no encontrado',
                     text: 'El correo electrónico proporcionado no está registrado en nuestra base de datos.'
                  });
               } else {
                  this.$swal.fire({
                     toast: true,
                     position: 'center',
                     showConfirmButton: false,
                     timer: 6000,
                     timerProgressBar: true,
                     icon: 'success',
                     title: 'Correo de recuperación enviado',
                     text: 'Se ha enviado un correo electrónico de recuperación de contraseña a su dirección de Gmail. Por favor, revise su bandeja de entrada.',
                     didClose: () => {
                        this.forgotPasswordEmail = '';
                        this.abrirModalCita();
                     }
                  });
               }
            }
         } catch (error) {
            console.error('Error al enviar solicitud de recuperación:', error);
            this.$swal.fire({
               toast: true,
               position: 'center',
               showConfirmButton: false,
               timer: 6000,
               timerProgressBar: true,
               icon: 'error',
               title: 'Error al enviar correo de recuperación',
               text: 'Ocurrió un error al intentar enviar el correo de recuperación. Por favor, inténtelo de nuevo más tarde.'
            });
         }
      },
      toggleMode(mode) {
         if (mode === 'login') {
            this.isLogin = true;
         } else if (mode === 'forgotPassword') {
            this.isLogin = false;
         }
      }
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
