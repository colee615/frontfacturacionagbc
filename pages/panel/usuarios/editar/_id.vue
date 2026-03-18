<template>
   <div>
      <JcLoader :load="load"></JcLoader>
      <AdminTemplate :page="page" :modulo="modulo">
         <div slot="body">
            <div class="row justify-content-center">
               <div class="col-sm-8 col-12">
                  <div class="card">
                     <div class="card-header">
                        <h3>Actualizar</h3>
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
                                 <label for="name">* Nombre del Usuario</label>
                                 <input type="text" v-model="model.name" class="form-control" id="name" required>
                              </div>
                              <div class="form-group col-6">
                                 <label for="sucursale">* Sucursal del Usuario</label>
                                 <select v-model="model.sucursale_id" class="form-control" id="sucursale" required>
                                    <option value="" disabled selected>Seleccione una sucursal</option>
                                    <option v-for="m in sucursales" :value="m.id">{{ m.departamento }}</option>
                                 </select>
                              </div>
                              <div class="form-group col-12">
                                 <label for="email">* Email del Usuario</label>
                                 <input type="email" v-model="model.email" class="form-control" id="email" required>
                              </div>
                              <div class="form-group col-12">
                                 <label for="password">Password del Usuario</label>
                                 <input type="password" v-model="model.password" class="form-control" id="password">
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
                                    <button v-if="canUpdateUsuarios" class="btn btn-dark w-100" @click="Save()">
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
   name: "IndexPage",
   head() {
      return {
         title: "Demo",
      };
   },
   data() {
      return {
         model: {
            name: '',
            email: '',
            password: '',
            sucursale_id: '',
         },
         sucursales: [],
         apiUrl: 'usuarios',
         page: 'Administracion',
         modulo: 'usuarios',
         load: true,
         showInfoTooltip: false,
      }
   },
   methods: {
      async GET_DATA(path) {
         const res = await this.$admin.$get(path);
         return res;
      },
      validateFields() {
         const errors = [];
         if (!this.model.name || typeof this.model.name !== 'string' || this.model.name.length > 255) {
            errors.push('El Nombre Usuario es obligatorio.');
         }
         const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
         if (!this.model.email || !emailPattern.test(this.model.email) || this.model.email.length > 255) {
            errors.push('El Email del Usuario es obligatorio.');
         }
         if (!this.model.sucursale_id || typeof this.model.sucursale_id !== 'number') {
            errors.push('Debe seleccionar una Sucursal válida.');
         }
         return errors;
      },
      buildPayload() {
         const payload = {
            name: this.model.name ? this.model.name.trim() : '',
            email: this.model.email ? this.model.email.trim() : '',
            sucursale_id: Number(this.model.sucursale_id),
         };

         if (this.model.password && this.model.password.trim()) {
            payload.password = this.model.password.trim();
         }

         return payload;
      },
      async Save() {
         if (!this.canUpdateUsuarios) return;
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

         this.load = true;
         try {
            const payload = this.buildPayload();
            await this.$admin.$put(this.apiUrl + "/" + this.model.id, payload);

            this.$swal.fire({
               toast: true,
               position: 'center',
               showConfirmButton: false,
               icon: 'success',
               title: 'Guardado exitosamente!',
               timer: 2000,
               timerProgressBar: true,
            });

            setTimeout(() => {
               this.$router.back();
            }, 2000);
         } catch (e) {
            console.error(e);
            const backendErrors = e.response?.data?.errors;
            const backendMessage = e.response?.data?.message || e.response?.data?.error;

            if (backendErrors && typeof backendErrors === 'object') {
               const items = Object.values(backendErrors).flat().map(err => `<li>${err}</li>`).join('');
               this.$swal.fire({
                  toast: true,
                  position: 'center',
                  showConfirmButton: false,
                  icon: 'error',
                  title: 'No se pudo actualizar el usuario',
                  html: `<ul style="text-align: left;">${items}</ul>`,
               });
               return;
            }

            this.$swal.fire({
               toast: true,
               position: 'center',
               showConfirmButton: false,
               icon: 'error',
               title: backendMessage || 'Hubo un problema al actualizar. Intente nuevamente.',
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
      permissions() {
         return this.$store.state.auth.permissions || [];
      },
      canUpdateUsuarios() {
         return this.permissions.includes('usuarios.manage') || this.permissions.includes('usuarios.update');
      },
      canManageUsuarios() {
         return this.permissions.includes('usuarios.manage');
      },
   },
   mounted() {
      this.$nextTick(async () => {
         try {
            await Promise.all([
               this.GET_DATA(this.apiUrl + "/" + this.$route.params.id), this.GET_DATA('sucursales'),
            ]).then((v) => {
               this.model = {
                  ...this.model,
                  ...v[0],
                  password: '',
                  sucursale_id: Number(v[0].sucursale_id || v[0].sucursale?.id || ''),
               };
               this.sucursales = v[1];
            });
         } catch (e) {
            console.error(e);
         } finally {
            this.load = false;
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
   left: 0;
   margin-top: 5px;
   background-color: rgba(0, 0, 0, 0.85);
   color: #fff;
   border: 1px solid rgba(255, 255, 255, 0.3);
   padding: 10px;
   border-radius: 8px;
   box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
   display: none;
   font-size: 0.875rem;
   font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
   max-width: 250px;
   text-align: left;
   z-index: 1000;
}

.info-tooltip::after {
   content: "";
   position: absolute;
   top: -5px;
   left: 20px;
   border-width: 5px;
   border-style: solid;
   border-color: transparent transparent rgba(0, 0, 0, 0.85) transparent;
}

.info-container:hover .info-tooltip,
.info-container .info-tooltip.d-block {
   display: block;
}
</style>


