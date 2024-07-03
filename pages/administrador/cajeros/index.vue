<template>
   <div>
      <JcLoader :load="load"></JcLoader>
      <AdminTemplate :page="page" :modulo="modulo">
         <div slot="body">
            <div class="row justify-content-end mb-2">
               <div class="col-auto">
                  <nuxt-link :to="url_nuevo" class="btn btn-dark btn-sm w-100">
                     <i class="fas fa-plus"></i> Agregar
                  </nuxt-link>
               </div>
            </div>
            <div class="row">
               <div class="col-12">
                  <div class="card">
                     <div class="card-body">
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
         } catch (e) {

         } finally {
            this.load = false;
         }
      },
      Eliminar(id) {
         let self = this;
         this.$swal
            .fire({
               title: "Deseas Eliminar?",
               showDenyButton: false,
               showCancelButton: true,
               confirmButtonText: "Eliminar",
               cancelarButtonText: `Cancelar`,
            })
            .then(async (result) => {
               /* Read more about isConfirmed, isDenied below */
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
