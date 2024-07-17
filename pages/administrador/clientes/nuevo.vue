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
                        <div class="row">
                           <!-- Icono de pregunta con eventos de mouse -->
                           <div class="mb-3 position-relative info-container">
                              <label for="info" class="form-label">
                                 <i class="fas fa-question-circle" @mouseover="showInfoTooltip = true"
                                    @mouseleave="showInfoTooltip = false"></i> Información
                              </label>
                              <div v-if="showInfoTooltip" class="info-tooltip">
                                 <span>Los campos marcados con * son obligatorios, el campo de email es obligatorio, si
                                    absolutamente no tiene email el cliente, guardelo vacio</span>
                                 <div class="arrow"></div>
                              </div>
                           </div>
                           <div class="form-group col-12">
                              <label for="razonSocial">* Nombre del Cliente</label>
                              <input type="text" v-model="model.razonSocial" class="form-control" id="razonSocial">
                           </div>
                           <div class="form-group col-12">
                              <label for="tipoDocumentoIdentidad">* Tipo Documento de Identidad del Cliente</label>
                              <select v-model="model.tipoDocumentoIdentidad" class="form-control"
                                 id="tipoDocumentoIdentidad">
                                 <option value="1">CI - Cédula de identidad</option>
                                 <option value="2">CEX - Cédula de identidad de extranjero</option>
                                 <option value="3">PAS - Pasaporte</option>
                                 <option value="4">OD - Otro Documento de Identidad</option>
                                 <option value="5">NIT - Número de identificación Tributaria</option>
                              </select>
                           </div>
                           <div class="form-group col-12">
                              <label for="documentoIdentidad">* Numero Documento del
                                 Cliente</label>
                              <input type="text" v-model="model.documentoIdentidad" class="form-control"
                                 id="documentoIdentidad">
                           </div>
                           <div class="form-group col-12" v-if="isCISelected">
                              <label for="complemento">Complemento del Documento de Identidad</label>
                              <input type="text" v-model="model.complemento" class="form-control" id="complemento">
                           </div>
                           <div class="form-group col-12">
                              <label for="correo">* Email del Cajero</label>
                              <input type="text" v-model="model.correo" class="form-control" id="correo">
                           </div>
                        </div>
                        <div class="col-12">
                           <div class="row">
                              <div class="col-6">
                                 <button class="btn btn-info w-100" @click="$router.back()">Regresar</button>
                              </div>
                              <div class="col-6">
                                 <button class="btn btn-dark w-100" @click="Save()">Guardar</button>
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
            razonSocial: '',
            documentoIdentidad: '',
            complemento: '',
            tipoDocumentoIdentidad: '',
            correo: '',
         },
         apiUrl: 'clientes',
         page: 'Administracion',
         modulo: 'Clientes',
         load: false,
         showInfoTooltip: false, // Variable para controlar la visibilidad del tooltip de información
      }
   },
   computed: {
      user() {
         return this.$store.state.auth.user;
      },
      isCISelected() {
         return this.model.tipoDocumentoIdentidad === '1';
      },
   },
   methods: {
      validateFields() {
         const errors = [];
         if (!this.model.razonSocial || typeof this.model.razonSocial !== 'string') {
            errors.push('El Nombre del Cliente es obligatorio.');
         }
         if (!this.model.documentoIdentidad) {
            errors.push('El Numero de Identidad es obligatorio.');
         }
         if (!this.model.tipoDocumentoIdentidad) {
            errors.push('El Tipo de Documento de Identidad es obligatorio.');
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
   mounted() {
      if (this.user.role !== 'administrador') {
         this.$router.push('/');
      }
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
