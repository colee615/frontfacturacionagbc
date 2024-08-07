<template>
   <div>
      <AdminTemplate :page="page" :modulo="modulo">
         <div slot="body">
            <div class="row justify-content-center">
               <div class="col-sm-8 col-12">
                  <div class="card">
                     <div class="card-header">
                        <h3>Agregar Sucursal</h3>
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
                           <div class="row">
                              <div class="form-group col-12">
                                 <label for="nombre">* Nombre de la Sucursal</label>
                                 <input type="text" name="nombre" v-model="model.nombre" class="form-control"
                                    id="nombre" />
                              </div>
                              <div class="form-group col-12">
                                 <label for="municipio">* Municipio</label>
                                 <input type="text" name="municipio" v-model="model.municipio" class="form-control"
                                    id="municipio" />
                              </div>
                              <div class="form-group col-12">
                                 <label for="departamento">* Departamento</label>
                                 <input type="text" name="departamento" v-model="model.departamento"
                                    class="form-control" id="departamento" />
                              </div>
                              <div class="form-group col-12">
                                 <label for="codigosucursal">* Código Sucursal</label>
                                 <input type="text" name="codigosucursal" v-model="model.codigosucursal"
                                    class="form-control" id="codigosucursal" />
                              </div>
                              <div class="form-group col-12">
                                 <label for="direcccion">* Dirección</label>
                                 <input type="text" name="direcccion" v-model="model.direcccion" class="form-control"
                                    id="direcccion" />
                              </div>
                              <div class="form-group col-12">
                                 <label for="telefono">* Teléfono</label>
                                 <input type="text" name="telefono" v-model="model.telefono" class="form-control"
                                    id="telefono" />
                              </div>
                           </div>
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
      </AdminTemplate>
   </div>
</template>

<script>
export default {
   name: "AgregarSucursal",
   data() {
      return {
         model: {
            nombre: '',
            municipio: '',
            departamento: '',
            codigosucursal: '',
            direcccion: '',
            telefono: '',
         },
         showInfoTooltip: false, // Variable para controlar la visibilidad del tooltip de información
         apiUrl: 'sucursales',
         page: 'Administracion',
         modulo: 'Sucursales',
      };
   },
   methods: {
      validateFields() {
         const errors = [];

         if (!this.model.nombre) {
            errors.push('El Nombre es obligatorio.');
         }

         if (!this.model.municipio) {
            errors.push('El Municipio es obligatorio.');
         }

         if (!this.model.departamento) {
            errors.push('El Departamento es obligatorio.');
         }

         if (!this.model.codigosucursal) {
            errors.push('El Código de Sucursal es obligatorio.');
         }

         if (!this.model.direcccion) {
            errors.push('La Dirección es obligatoria.');
         }

         if (!this.model.telefono) {
            errors.push('El Teléfono es obligatorio.');
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
