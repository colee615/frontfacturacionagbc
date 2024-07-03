<template>
   <div>
      <JcLoader :load="load"></JcLoader>
      <AdminTemplate :page="page" :modulo="modulo">
         <div slot="body">
            <div class="row justify-content-end mb-2">
               <div class="col-12">
                  <div class="card">
                     <div class="card-body">
                        <h5 class="mb-4">Tus ventas, Cajero: {{ user ? user.name : 'N/A' }}</h5>
                        <div class="table-responsive">
                           <table class="table table-striped table-bordered">
                              <thead>
                                 <tr>
                                    <th class="py-0 px-1">#</th>
                                    <th class="py-0 px-1">FECHA</th>
                                    <th class="py-0 px-1">CODIGO - CLIENTE</th>
                                    <th class="py-0 px-1">DOCUMENTO IDENTIFICACIÓN</th>
                                    <th class="py-0 px-1">TOTAL DE VENTA</th>
                                    <th class="py-0 px-1"></th>
                                 </tr>
                              </thead>
                              <tbody>
                                 <tr v-for="(m, i) in filteredList" :key="m.id">
                                    <td class="py-0 px-1">{{ i + 1 }}</td>
                                    <td class="py-0 px-1">{{ m.fecha }}</td>
                                    <td class="py-0 px-1">{{ m.cliente.codigoCliente }} - {{ m.cliente.razonSocial }}
                                    </td>
                                    <td class="py-0 px-1">{{ m.cliente.documentoIdentidad }}</td>
                                    <td class="py-0 px-1">{{ m.total }}</td>
                                    <td class="py-0 px-1">
                                       <div class="btn-group">
                                          <nuxtLink :to="url_editar + m.id" class="btn btn-info btn-sm py-1 px-2">
                                             <i class="fas fa-eye"></i>
                                          </nuxtLink>
                                          <button type="button" @click="ImprimirVenta(m)"
                                             class="btn btn-success btn-sm py-1 px-2">
                                             <i class="fas fa-print"></i>
                                          </button>
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

   head() {
      return {
         title: this.modulo,
      };
   },

   data() {
      return {
         load: true,
         list: [],
         sucursals: [],
         apiUrl: "ventas",
         page: "Ventas",
         modulo: "Lista de ventas",
         sucursal: {},

         url_editar: "/cajero/ventas/invoice/",
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
         this.$swal.fire({
            title: "Deseas Eliminar?",
            showDenyButton: false,
            showCancelButton: true,
            confirmButtonText: "Eliminar",
            cancelarButtonText: `Cancelar`,
         }).then(async (result) => {
            if (result.isConfirmed) {
               await self.EliminarItem(id);
            }
         });
      },
      async ImprimirVenta(venta) {
         let sucursal = this.sucursal
         sucursal.venta = venta
         const res = await this.$printer.$post(sucursal.impresora_url + "venta", sucursal);
         console.log(res)
      }
   },
   computed: {
      filteredList() {
         // Filtrar la lista de ventas por el id del cajero actual
         return this.list.filter(m => m.cajero.id === this.user.id);
      },
      user() {
         return this.$store.state.auth.user;
      },

   },
   mounted() {
      this.$nextTick(async () => {
         try {
            await Promise.all([this.GET_DATA(this.apiUrl)]).then((v) => {
               this.list = v[0];
            });
         } catch (e) {

         } finally {
            this.load = false;
         }
      });
   },
};
</script>