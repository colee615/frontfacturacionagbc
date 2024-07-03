<template>
   <div>
      <JcLoader :load="load"></JcLoader>
      <AdminTemplate :page="page" :modulo="modulo">
         <div slot="body">
            <div class="row justify-content-end">
               <div class="col-2">
               </div>
               <div class="col-12">
                  <div class="card">
                     <div class="card-body">
                        <nuxtLink :to="url_nuevo" class="btn btn-dark btn-sm w-100">
                           <i class="fas fa-plus"></i> Agregar
                        </nuxtLink>
                        <div class="table-responsive"> <!-- Agregamos la clase table-responsive aquí -->
                           <table class="table">
                              <thead>
                                 <th class="py-0 px-1">#</th>
                                 <th class="py-0 px-1">Nombre</th>
                                 <th class="py-0 px-1">N°Codigo</th>
                                 <th class="py-0 px-1">Precio Unitario</th>
                                 <th class="py-0 px-1">Codigo Sin</th>
                                 <th class="py-0 px-1"></th>
                              </thead>
                              <tbody>
                                 <tr v-for="(m, i) in list" :key="m.id">
                                    <td class="py-0 px-1">{{ i + 1 }}</td>
                                    <td class="py-0 px-1">{{ m.nombre }}</td>
                                    <td class="py-0 px-1">{{ m.codigo }}</td>
                                    <td class="py-0 px-1">{{ m.precioUnitario }}</td>
                                    <td class="py-0 px-1">{{ m.codigoSin }}</td>
                                    <td class="py-0 px-1">
                                       <div class="btn-group">
                                          <nuxtLink :to="url_editar + m.id" class="btn btn-info btn-sm py-1 px-2">
                                             <i class="fas fa-pen"></i>
                                          </nuxtLink>

                                          <button type="button" @click="Eliminar(m.id)"
                                             class="btn btn-danger btn-sm py-1 px-2">
                                             <i class="fas fa-trash trash-icon"></i>
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
         apiUrl: "servicios",
         page: "Administracion",
         modulo: "Servicios",
         url_nuevo: "/administrador/servicios/nuevo",
         url_editar: "/administrador/servicios/editar/",
      };
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
