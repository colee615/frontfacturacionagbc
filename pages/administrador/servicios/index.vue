<template>
   <div>
      <JcLoader :load="load"></JcLoader>
      <AdminTemplate :page="page" :modulo="modulo">
         <div slot="body">
            <div class="row justify-content-end mb-2">
               <div class="col-auto">
               </div>
            </div>
            <div class="row">
               <div class="col-12">
                  <div class="card">
                     <div class="card-body">
                        <input v-model="search" type="text" class="form-control" placeholder="Buscar por nombre">
                        <br>
                        <nuxtLink :to="url_nuevo" class="btn btn-dark btn-sm w-100 mb-2">
                           <i class="fas fa-plus"></i> Agregar
                        </nuxtLink>
                        <div class="table-responsive">
                           <table class="table table-striped table-bordered">
                              <thead>
                                 <tr>
                                    <th class="py-0 px-1">#</th>
                                    <th class="py-0 px-1">Nombre</th>
                                    <th class="py-0 px-1">N°Codigo</th>
                                    <th class="py-0 px-1">Precio Unitario</th>
                                    <th class="py-0 px-1">Codigo Sin</th>
                                    <th class="py-0 px-1"></th>
                                 </tr>
                              </thead>
                              <tbody>
                                 <tr v-for="(m, i) in paginatedList" :key="m.id">
                                    <td class="py-0 px-1">{{ (currentPage - 1) * itemsPerPage + i + 1 }}</td>
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
                                             <i class="fas fa-trash"></i>
                                          </button>
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
         search: '',
         apiUrl: "servicios",
         page: "Administracion",
         modulo: "Servicios",
         url_nuevo: "/administrador/servicios/nuevo",
         url_editar: "/administrador/servicios/editar/",
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
      filteredList() {
         return this.list.filter(item => item.nombre.toLowerCase().includes(this.search.toLowerCase()));
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

<style scoped>
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
