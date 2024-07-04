<template>
   <div>
      <AdminTemplate :page="page" :modulo="modulo">
         <div slot="body">
            <div class="row justify-content-center">
               <div class="col-sm-8 col-12">
                  <div class="card">
                     <div class="card-header">
                        <h3>Agregar</h3>
                     </div>
                     <div class="card-body">
                        <div slot="body" class="row">
                           <div class="mb-3 position-relative info-container">
                              <label for="info" class="form-label">
                                 <i class="fas fa-question-circle" @mouseover="showInfoTooltip = true"
                                    @mouseleave="showInfoTooltip = false"></i> Información
                              </label>
                              <div class="info-tooltip" :class="{ 'd-block': showInfoTooltip }">
                                 <span>Los campos marcados con * son obligatorios.</span>
                                 <div class="arrow"></div>
                              </div>
                           </div>
                           <div slot="body" class="row">
                              <div class="form-group col-12">
                                 <label for="">* Nombre del Servicio</label>
                                 <input type="text" name="" v-model="model.nombre" class="form-control" id="" />
                              </div>
                              <div class="form-group col-12">
                                 <label for="">* Codigo del Servicio</label>
                                 <input type="text" name="" v-model="model.codigo" class="form-control" id="" />
                              </div>
                              <div class="form-group col-12">
                                 <label for="">* Descripción del Servicio</label>
                                 <input type="text" name="" v-model="model.descripcion" class="form-control" id="" />
                              </div>
                              <div class="form-group col-12">
                                 <label for="">* Precio Unitario del Servicio</label>
                                 <input type="number" name="" v-model="model.precioUnitario" class="form-control"
                                    id="" />
                              </div>

                              <div class="form-group col-12">
                                 <label for="">* Unidad de Medida del Servicio</label>
                                 <input type="text" name="" v-model="model.unidadMedida" class="form-control" id="" />
                              </div>
                              <div class="form-group col-12">
                                 <label for="">* Código SIN del Servicio</label>
                                 <input type="text" name="" v-model="model.codigoSin" class="form-control" id="" />
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
         </div>
      </AdminTemplate>
   </div>
</template>

<script>
export default {
   name: "IndexPage",
   head() {
      return {
         title: this.modulo,
      };
   },
   data() {
      return {
         model: {
            codigo: '',
            descripcion: '',
            precioUnitario: '',
            nombre: '',
            unidadMedida: '',
            codigoSin: '',
         },
         showInfoTooltip: false, // Variable para controlar la visibilidad del tooltip de información
         apiUrl: 'servicios',
         page: 'Servicios',
         modulo: 'Servicios',

      };
   },
   methods: {
      validateFields() {
         const errors = [];

         if (!this.model.nombre) {
            errors.push('El Nombre del Servicio es obligatorio.');
         }

         if (!this.model.codigo) {
            errors.push('El Código del Servicio es obligatorio.');
         }

         if (!this.model.descripcion) {
            errors.push('La Descripción del Servicio es obligatoria.');
         }

         if (!this.model.precioUnitario || isNaN(this.model.precioUnitario) || Number(this.model.precioUnitario) <= 0) {
            errors.push('El Precio Unitario del Servicio es obligatorio.');
         }

         if (!this.model.unidadMedida) {
            errors.push('La Unidad de Medida del Servicio');
         }

         if (!this.model.codigoSin) {
            errors.push('El Código SIN del Servicio es obligatorio');
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
               // Puedes agregar aquí alguna lógica adicional que necesites al cargar el componente
            } catch (e) {

            } finally {
               // Y aquí cualquier acción de limpieza o finalización
            }
         }
      });
   },
};
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
   display: none;
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
