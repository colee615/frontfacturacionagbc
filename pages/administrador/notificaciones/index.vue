<template>
   <div>
      <JcLoader :load="load"></JcLoader>
      <AdminTemplate :page="page" :modulo="modulo">
         <div slot="body">

            <div class="row">
               <div class="col-12 mb-2">
                  <input v-model="searchQuery" type="text" class="form-control mb-2"
                     placeholder="Buscar por codigo seguimiento">

               </div>
               <div class="col-12">
                  <div class="card">
                     <div class="card-body">
                        <div class="table-responsive">
                           <table class="table table-striped table-bordered">
                              <thead>
                                 <tr>
                                    <th class="py-0 px-1">#</th>
                                    <th class="py-0 px-1">TIPO DE LA SOLICITUD</th>
                                    <th class="py-0 px-1">ESTADO DE LA SOLICITUD</th>
                                    <th class="py-0 px-1">FUENTE</th>
                                    <th class="py-0 px-1">CODIGO SEGUIMIENTO</th>
                                    <th class="py-0 px-1">FECHA</th>
                                    <th class="py-0 px-1">MENSAJE</th>
                                    <th class="py-0 px-1"></th>
                                 </tr>
                              </thead>
                              <tbody>
                                 <tr v-for="(m, i) in paginatedList" :key="m.id">
                                    <td class="py-0 px-1">{{ i + 1 }}</td>
                                    <td class="py-0 px-1"
                                       :class="{ 'emision': m.detalle.tipoEmision === 'EMISION', 'anulacion': m.detalle.tipoEmision === 'ANULACION' }">
                                       {{ m.detalle.tipoEmision }}
                                    </td>
                                    <td class="py-0 px-1">{{ m.estado }}</td>
                                    <td class="py-0 px-1">{{ m.fuente }}</td>
                                    <td class="py-0 px-1">{{ m.codigo_seguimiento }}</td>
                                    <td class="py-0 px-1">{{ m.fecha }}</td>
                                    <td class="py-0 px-1">{{ m.mensaje }}</td>
                                    <td class="py-0 px-1">
                                       <div class="btn-group">
                                          <nuxt-link :to="`${url_editar}${m.id}`"
                                             class="btn btn-success btn-sm py-1 px-2" v-if="m.estado === 'EXITO'">
                                             <i class="fas fa-search"></i>
                                          </nuxt-link>
                                          <nuxt-link :to="`${url_editar}${m.id}`"
                                             class="btn btn-sm py-1 px-2 btn-danger"
                                             v-else-if="m.estado === 'OBSERVADO'">
                                             <i class="fas fa-exclamation-triangle"></i>
                                          </nuxt-link>
                                       </div>
                                    </td>
                                 </tr>
                              </tbody>
                           </table>
                        </div>
                        <nav aria-label="Page navigation example">
                           <ul class="pagination justify-content-center">
                              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                 <a class="page-link" href="#" @click.prevent="changePage(1)">Primero</a>
                              </li>
                              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                 <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)"></a>
                              </li>
                              <li class="page-item" v-for="page in totalPages" :key="page"
                                 :class="{ active: currentPage === page }">
                                 <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
                              </li>
                              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                                 <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)"></a>
                              </li>
                              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                                 <a class="page-link" href="#" @click.prevent="changePage(totalPages)">Último</a>
                              </li>
                           </ul>
                        </nav>
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
         searchQuery: '',
         apiUrl: 'notificaciones',
         page: 'Administracion',
         modulo: 'Notificaciones',
         url_editar: '/administrador/notificaciones/detalle/',
         currentPage: 1,
         itemsPerPage: 14
      };
   },
   methods: {
      changePage(page) {
         if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
         }
      },
      async GET_DATA(path) {
         const res = await this.$admin.$get(path);
         res.forEach(notification => {
            notification.detalle = JSON.parse(notification.detalle);
         });
         return res;
      }
   },
   computed: {
      user() {
         return this.$store.state.auth.user;
      },
      filteredList() {
         return this.list.filter(item => item.codigo_seguimiento.toLowerCase().includes(this.searchQuery.toLowerCase()));
      },
      totalPages() {
         return Math.ceil(this.filteredList.length / this.itemsPerPage);
      },
      paginatedList() {
         const start = (this.currentPage - 1) * this.itemsPerPage;
         const end = start + this.itemsPerPage;
         return this.filteredList.slice(start, end);
      }
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


<style scoped>
.emision {
   background-color: #e0f7fa;
   /* color de fondo para EMISION */
   color: #00796b;
   /* color de texto para EMISION */
}

.anulacion {
   background-color: #ffebee;
   /* color de fondo para ANULACION */
   color: #c62828;
   /* color de texto para ANULACION */
}

/* Estilos personalizados para paginación */
.pagination .page-item.active .page-link {
   background-color: #384464;
   /* Color azulito */
   border-color: #384464;
   color: #fff;
   /* Número blanco */
   border-radius: 50%;
   /* Circular */
}

.pagination .page-item .page-link {
   color: #384464;
   /* Color azulito para los links */
}
</style>
