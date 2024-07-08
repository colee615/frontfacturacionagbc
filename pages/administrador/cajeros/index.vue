<template>
   <div>
      <JcLoader :load="load"></JcLoader>
      <AdminTemplate :page="page" :modulo="modulo">
         <div slot="body">
            <div class="row">
               <div class="col-12">
                  <div class="card">
                     <div class="card-body">
                        <nuxtLink :to="url_nuevo" class="btn btn-dark btn-sm w-100 mb-2">
                           <i class="fas fa-plus"></i> Agregar
                        </nuxtLink>
                        <div class="table-responsive">
                           <table class="table table-striped table-bordered">
                              <thead>
                                 <tr>
                                    <th class="py-1 px-2">#</th>
                                    <th class="py-1 px-2">NOMBRE</th>
                                    <th class="py-1 px-2">EMAIL</th>
                                    <th class="py-1 px-2">SUCURSAL</th>
                                    <th class="py-1 px-2"></th>
                                 </tr>
                              </thead>
                              <tbody>
                                 <tr v-for="(m, i) in list" :key="m.id">
                                    <td class="py-1 px-2">{{ i + 1 }}</td>
                                    <td class="py-1 px-2">{{ m.name }}</td>
                                    <td class="py-1 px-2">{{ m.email }}</td>
                                    <td class="py-1 px-2">{{ m.sucursale.ubicacion }}</td>
                                    <td class="py-1 px-2">
                                       <div class="btn-group">
                                          <nuxt-link :to="`${url_editar}${m.id}`" class="btn btn-info btn-sm py-1 px-2">
                                             <i class="fas fa-pen"></i>
                                          </nuxt-link>
                                          <button type="button" @click="Eliminar(m.id)"
                                             class="btn btn-danger btn-sm py-1 px-2">
                                             <i class="fas fa-trash"></i>
                                          </button>
                                       </div>
                                    </td>
                                 </tr>
                              </tbody>
                           </table>
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
import axios from 'axios';

export default {
   name: "IndexPage",
   head() {
      return {
         title: this.modulo,
      };
   },
   data() {
      return {
         load: true,
         list: [],
         apiUrl: 'cajeros',
         page: 'Administración',
         modulo: 'Cajeros',
         url_nuevo: '/administrador/cajeros/nuevo',
         url_editar: '/administrador/cajeros/editar/',
      };
   },
   computed: {
      user() {
         return this.$store.state.auth.user;
      },
   },
   methods: {
      async GET_DATA(path) {
         const res = await this.$admin.$get(path);
         return res;
      },
      async EliminarItem(id) {
         this.load = true;
         try {
            const res = await this.$admin.$delete(this.apiUrl + "/" + id);

            await Promise.all([this.GET_DATA(this.apiUrl)]).then((v) => {
               this.list = v[0];
            });

            this.$swal.fire({
               toast: true,
               position: 'center',
               showConfirmButton: false,
               icon: 'success',
               title: 'Cajero eliminado exitosamente',
               timer: 2000, // Mostrar la alerta de éxito por 2 segundos
               timerProgressBar: true,
            });
         } catch (e) {
            // Manejo de errores si es necesario
            this.$swal.fire({
               toast: true,
               position: 'center',
               showConfirmButton: false,
               icon: 'error',
               title: 'Hubo un problema al eliminar al cajero. Intente nuevamente.',
               timer: 2000, // Mostrar la alerta de error por 2 segundos
               timerProgressBar: true,
            });
         } finally {
            this.load = false;
         }
      },
      Eliminar(id) {
         let self = this;
         this.$swal.fire({
            toast: false, // Cambiado a modal (toast: false)
            position: 'center',
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: '<span style="font-weight: bold;">Sí, Eliminar</span>',
            cancelButtonText: '<span style="font-weight: bold;">No, Cancelar</span>',
            title: "",
            html: '<div style="text-align: center;"><div style="font-size: 20px;">¿Deseas eliminar al Cajero?</div></div>',
            icon: 'warning',
            dangerMode: true,
         }).then(async (result) => {
            if (result.isConfirmed) {
               await self.EliminarItem(id);
            }
         });
      },
   },
   mounted() {
      this.$nextTick(async () => {
         if (this.user.role !== 'administrador') {
            this.$router.push('/'); // Redirige a la página principal
         } else {
            try {
               await Promise.all([this.GET_DATA(this.apiUrl)]).then((v) => {
                  this.list = v[0];
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
