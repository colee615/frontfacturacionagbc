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
                        <div slot="body" class="row">
                           <div class="form-group col-12">
                              <label for="ubicacion">Nombre Cajero</label>
                              <input type="text" v-model="model.name" class="form-control" id="name" required>
                           </div>
                           <div class="form-group col-6">
                              <label for="">Sucursal del Cajero</label>
                              <select name="" id="" class="form-control" v-model="model.sucursale_id" required>
                                 <option value="" disabled selected>Seleccione una sucursal</option>
                                 <option v-for="m in sucursales" :value="m.id">{{ m.ubicacion }}</option>
                              </select>
                           </div>
                           <div class="form-group col-12">
                              <label for="email">Email del Cajero</label>
                              <input type="email" v-model="model.email" class="form-control" id="email" required>
                           </div>
                           <div class="form-group col-12">
                              <label for="password">Password del Cajero</label>
                              <input type="password" v-model="model.password" class="form-control" id="password">
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
         apiUrl: 'cajeros',
         page: 'Administracion',
         modulo: 'Cajeros',
         load: true,
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
            errors.push('El Nombre Cajero es obligatorio.');
         }
         const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
         if (!this.model.email || !emailPattern.test(this.model.email) || this.model.email.length > 255) {
            errors.push('El Email del Cajero es obligatorio.');
         }
         if (!this.model.sucursale_id || typeof this.model.sucursale_id !== 'number') {
            errors.push('Debe seleccionar una Sucursal válida.');
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

         this.load = true;
         try {
            const res = await this.$admin.$put(this.apiUrl + "/" + this.model.id, this.model);

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
               await Promise.all([
                  this.GET_DATA(this.apiUrl + "/" + this.$route.params.id), this.GET_DATA('sucursales'),
               ]).then((v) => {
                  this.model = v[0];
                  this.sucursales = v[1];

               });
            } catch (e) {

            } finally {
               this.load = false;
            }
         }
      });
   },
};
</script>
