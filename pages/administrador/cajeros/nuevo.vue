<template>
   <div>
      <JcLoader :load="load"></JcLoader>
      <AdminTemplate :page="page" :modulo="modulo">
         <div slot="body">
            <div class="row justify-content-center">
               <div class="col-sm-8 col-12">
                  <div class="card">
                     <div class="card-header">
                        <h3>Agregar</h3>
                     </div>
                     <div class="card-body">
                        <div class="row">
                           <!-- Icono de pregunta con eventos de mouse -->
                           <div class="mb-3 position-relative info-container">
                              <label for="info" class="form-label">
                                 <i class="fas fa-question-circle" @mouseover="showInfoTooltip = true"
                                    @mouseleave="showInfoTooltip = false"></i> Información
                              </label>
                              <div v-if="showInfoTooltip" class="info-tooltip">
                                 <span>Los campos marcados con * son obligatorios.</span>
                                 <div class="arrow"></div>
                              </div>
                           </div>

                           <div class="form-group col-12">
                              <label for="ubicacion">* Nombre del Cajero</label>
                              <input type="text" v-model="model.name" class="form-control" id="name" required>
                           </div>
                           <div class="form-group col-6">
                              <label for="">* Sucursal del Cajero</label>
                              <select name="" id="" class="form-control" v-model="model.sucursale_id" required>
                                 <option value="" disabled selected>Seleccione una sucursal</option>
                                 <option v-for="m in sucursales" :value="m.id">{{ m.departamento }}</option>
                              </select>
                           </div>
                           <div class="form-group col-12">
                              <label for="email"> * Email del Cajero</label>
                              <input type="email" v-model="model.email" class="form-control" id="email" required>
                           </div>
                           <div class="form-group col-12">
                              <label for="password">* Password del Cajero</label>
                              <input type="password" v-model="model.password" class="form-control" id="password"
                                 required>
                           </div>
                           <div class="col-12">
                              <div class="row">
                                 <div class="col-6">
                                    <button class="btn btn-info w-100" @click="$router.back()">
                                       Regresar
                                    </button>
                                 </div>
                                 <div class="col-6">
                                    <button class="btn btn-dark w-100" @click="Save()">
                                       Guardar
                                    </button>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </AdminTemplate>
   </div>
</template>

<script>
export default {
   data() {
      return {
         model: {
            name: '',
            email: '',
            password: '',
            sucursale_id: '',
         },
         sucursales: [],
         apiUrl: 'cajeros',
         page: 'Administracion',
         modulo: 'Cajeros',
         load: true,
         showInfoTooltip: false, // Variable para controlar la visibilidad del tooltip de información
      }
   },

   methods: {
      async GET_DATA(path) {
         const res = await this.$admin.$get(path);
         return res;
      },
      validateFields() {
         const errors = [];
         if (!this.model.name || typeof this.model.name !== 'string') {
            errors.push('El Nombre Cajero es obligatorio.');
         }
         const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
         if (!this.model.email || !emailPattern.test(this.model.email)) {
            errors.push('El Email del Cajero es obligatorio.');
         }
         if (!this.model.sucursale_id || typeof this.model.sucursale_id !== 'number') {
            errors.push('Debe seleccionar una Sucursal válida.');
         }
         if (!this.model.password) {
            errors.push('El Password del Cajero es obligatorio.');
         }
         return errors;
      },
      async Save() {
         // Validaciones
         const errors = this.validateFields();
         if (errors.length) {
            this.$swal.fire({
               toast: true,
               position: 'center',
               showConfirmButton: false,
               icon: 'error',
               title: 'Verifique los siguientes campos:',
               html: `<ul style="text-align: left;">${errors.map(e => `<li>${e}</li>`).join('')}</ul>`,
            });
            return;
         }

         // Si todas las validaciones pasan
         this.load = true;
         try {
            const res = await this.$admin.$post(this.apiUrl, this.model);

            // Mostrar la notificación de éxito y redirigir después de un tiempo
            this.$swal.fire({
               toast: true,
               position: 'center',
               showConfirmButton: false,
               icon: 'success',
               title: 'Guardado exitosamente!',
               timer: 2000, // Mostrar la alerta por 2 segundos
               timerProgressBar: true,
            });

            // Esperar 2 segundos antes de redirigir
            setTimeout(() => {
               this.$router.back();
            }, 2000);
         } catch (e) {
            this.$swal.fire({
               toast: true,
               position: 'center',
               showConfirmButton: false,
               icon: 'error',
               title: 'Hubo un problema al guardar. Intente nuevamente.',
            });
         } finally {
            this.load = false;
         }
      },
   },

   computed: {
      user() {
         return this.$store.state.auth.user;
      },
   },

   mounted() {
      this.$nextTick(async () => {
         if (this.user.role !== 'administrador') {
            this.$router.push('/'); // Redirige a la página principal
         } else {
            try {
               await Promise.all([this.GET_DATA('sucursales')]).then((v) => {
                  this.sucursales = v[0];

                  if (this.sucursales.length) {
                     this.model.sucursale_id = this.sucursales[0].id;
                  }
               });

            } catch (e) {
               console.error('Error al cargar sucursales:', e);
            } finally {
               this.load = false
            }
         }
      });
   },
}

</script>
<style scoped>
.info-container {
   display: inline-block;
   position: relative;
}

.info-tooltip {
   position: absolute;
   top: 100%;
   /* Posicionar debajo del icono */
   left: 0;
   margin-top: 5px;
   /* Espacio entre el icono y el tooltip */
   background-color: rgba(0, 0, 0, 0.85);
   /* Fondo oscuro semitransparente */
   color: #fff;
   /* Texto blanco */
   border: 1px solid rgba(255, 255, 255, 0.3);
   /* Borde blanco semitransparente */
   padding: 10px;
   /* Espacio interno más amplio */
   border-radius: 8px;
   /* Bordes redondeados */
   box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
   /* Sombra más pronunciada */
   font-size: 0.875rem;
   /* Tamaño de fuente ligeramente mayor */
   font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
   /* Fuente más formal */
   max-width: 250px;
   /* Ancho máximo del tooltip */
   text-align: left;
   z-index: 1000;
   /* Asegurar que esté por encima de otros elementos */
}

.info-tooltip::after {
   content: "";
   position: absolute;
   top: -5px;
   /* Ajustar la posición de la flecha */
   left: 20px;
   /* Posicionar la flecha */
   border-width: 5px;
   border-style: solid;
   border-color: transparent transparent rgba(0, 0, 0, 0.85) transparent;
}

.info-container:hover .info-tooltip,
.info-container .info-tooltip.d-block {
   display: block;
}
</style>
