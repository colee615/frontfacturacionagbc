<template>
   <div>
      <JcLoader :load="load"></JcLoader>
      <AdminTemplate :page="page" :modulo="modulo">
         <div slot="body">
            <div class="row justify-content-end">
               <div class="col-2">
                  <nuxtLink :to="url_nuevo" class="btn btn-dark btn-sm w-100">
                     <i class="fas fa-plus"></i> Agregar
                  </nuxtLink>
               </div>
               <div class="col-12">
                  <div class="card">
                     <div class="card-body">
                        <table class="table">
                           <thead>
                              <tr>
                                 <th class="py-0 px-1">#</th>
                                 <th class="py-0 px-1">UBICACION</th>
                                 <th class="py-0 px-1">CODIGO SUCURSAL</th>
                                 <th class="py-0 px-1"></th>
                              </tr>
                           </thead>
                           <tbody>
                              <tr v-for="(m, i) in list" :key="m.id">
                                 <td class="py-0 px-1">{{ i + 1 }}</td>
                                 <td class="py-0 px-1">{{ m.ubicacion }}</td>
                                 <td class="py-0 px-1">{{ m.codigosucursal }}</td>
                                 <td class="py-0 px-1">
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
         apiUrl: 'sucursales',
         page: 'Administracion',
         modulo: 'Sucursales',
         url_nuevo: '/administrador/sucursales/nuevo',
         url_editar: '/administrador/sucursales/editar/',
      };
   },
   methods: {
      async GET_DATA(path) {
         const res = await this.$admin.$get(path);
         return res
      },
      async EliminarItem(id) {
         this.load = true
         try {
            const res = await this.$admin.$delete(this.apiUrl + '/' + id);
            console.log(res)
            await Promise.all([this.GET_DATA(this.apiUrl)]).then((v) => {
               this.list = v[0]
            })
         } catch (e) {

         } finally {
            this.load = false
         }
      },
      Eliminar(id) {
         let self = this
         this.$swal.fire({
            title: 'Deseas Eliminar?',
            showDenyButton: false,
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelarButtonText: `Cancelar`,
         }).then(async (result) => {
            if (result.isConfirmed) {
               await self.EliminarItem(id)
            }
         })
      }
   },
   mounted() {
      this.$nextTick(async () => {
         try {
            await Promise.all([this.GET_DATA(this.apiUrl)]).then((v) => {
               this.list = v[0]
            })
         } catch (e) {

         } finally {
            this.load = false
         }
      });
   },
};
</script>
