<template>
   <div>
      <JcLoader :load="load"></JcLoader>
      <AdminTemplate :page="page" :modulo="modulo">
         <div slot="body">
            <div class="row">
               <div class="col-12">
                  <div class="card">
                     <div class="card-body">
                        <input v-model="search" type="text" class="form-control" placeholder="Buscar por nombre">
                        <br>
                        <nuxtLink v-if="canCreateUsuarios" :to="url_nuevo" class="btn btn-dark btn-sm w-100 mb-2">
                           <i class="fas fa-plus"></i> Agregar
                        </nuxtLink>
                        <button @click="generateReport('excel')" class="btn btn-success btn-sm">
                           <i class="fas fa-file-excel"></i> Excel
                        </button>
                        <button @click="generateReport('pdf')" class="btn btn-danger btn-sm">
                           <i class="fas fa-file-pdf"></i> PDF
                        </button>

                        <div class="table-responsive">
                           <table class="table table-striped table-bordered">
                              <thead>
                                 <tr>
                                    <th class="py-1 px-2">#</th>
                                    <th class="py-1 px-2">NOMBRE</th>
                                    <th class="py-1 px-2">EMAIL</th>
                                    <th class="py-1 px-2">SUCURSAL</th>
                                    <th class="py-1 px-2">ESTADO</th>
                                    <th class="py-1 px-2">ACCIONES</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 <tr v-for="(m, i) in paginatedList" :key="m.id">
                                    <td class="py-1 px-2">{{ (currentPage - 1) * itemsPerPage + i + 1 }}</td>
                                    <td class="py-1 px-2">{{ m.name }}</td>
                                    <td class="py-1 px-2">{{ m.email }}</td>
                                    <td class="py-1 px-2">{{ m.sucursale ? m.sucursale.departamento : '-' }}</td>
                                    <td class="py-1 px-2">{{ m.estado === 1 ? 'Activo' : m.estado === 2 ? 'Inactivo' :
                                       'Desconocido' }}</td>
                                    <td class="py-1 px-2">
                                       <div class="btn-group">
                                          <nuxt-link v-if="canUpdateUsuarios" :to="`${url_editar}${m.id}`" class="btn btn-info btn-sm py-1 px-2">
                                             <i class="fas fa-pen"></i>
                                          </nuxt-link>
                                          <button v-if="canDeleteUsuarios && m.estado === 1" type="button" @click="Eliminar(m.id)"
                                             class="btn btn-danger btn-sm py-1 px-2">
                                             <i class="fas fa-trash"></i>
                                          </button>
                                          <button v-if="canUpdateUsuarios && m.estado === 2" type="button" @click="Activar(m.id)"
                                             class="btn btn-success btn-sm py-1 px-2">
                                             <i class="fas fa-check"></i>
                                          </button>
                                       </div>
                                    </td>
                                 </tr>
                              </tbody>
                           </table>
                        </div>
                        <!-- Pagination controls -->
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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { utils, writeFile } from 'xlsx';

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
         apiUrl: 'usuarios',
         page: 'Panel',
         modulo: 'Usuarios',
         url_nuevo: '/panel/usuarios/nuevo',
         url_editar: '/panel/usuarios/editar/',
         currentPage: 1,
         itemsPerPage: 14
      };
   },
   computed: {
      user() {
         return this.$store.state.auth.user;
      },
      permissions() {
         return this.$store.state.auth.permissions || [];
      },
      canCreateUsuarios() {
         return this.permissions.includes('usuarios.manage') || this.permissions.includes('usuarios.create');
      },
      canUpdateUsuarios() {
         return this.permissions.includes('usuarios.manage') || this.permissions.includes('usuarios.update');
      },
      canDeleteUsuarios() {
         return this.permissions.includes('usuarios.manage') || this.permissions.includes('usuarios.delete');
      },
      canManageUsuarios() {
         return this.permissions.includes('usuarios.manage');
      },
      filteredList() {
         const term = (this.search || '').toString().toLowerCase();
         return this.list.filter(item => ((item && item.name) ? item.name : '').toString().toLowerCase().includes(term));
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
   methods: {
      async GET_DATA(path) {
         const res = await this.$admin.$get(path);
         return res;
      },
      async EliminarItem(id) {
         if (!this.canDeleteUsuarios) return;
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
               title: 'Usuario eliminado exitosamente',
               timer: 2000,
               timerProgressBar: true,
            });
         } catch (e) {
            this.$swal.fire({
               toast: true,
               position: 'center',
               showConfirmButton: false,
               icon: 'error',
               title: 'Hubo un problema al eliminar al Usuario. Intente nuevamente.',
               timer: 2000,
               timerProgressBar: true,
            });
         } finally {
            this.load = false;
         }
      },
      Eliminar(id) {
         if (!this.canDeleteUsuarios) return;
         let self = this;
         this.$swal.fire({
            toast: false,
            position: 'center',
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: '<span style="font-weight: bold;">Sí, Eliminar</span>',
            cancelButtonText: '<span style="font-weight: bold;">No, Cancelar</span>',
            title: "",
            html: '<div style="text-align: center;"><div style="font-size: 20px;">¿Deseas eliminar al Usuario?</div></div>',
            icon: 'warning',
            dangerMode: true,
         }).then(async (result) => {
            if (result.isConfirmed) {
               await self.EliminarItem(id);
            }
         });
      },
      async ActivarItem(id) {
         if (!this.canUpdateUsuarios) return;
         this.load = true;
         try {
            const res = await this.$admin.$put(this.apiUrl + "/activar/" + id);
            await Promise.all([this.GET_DATA(this.apiUrl)]).then((v) => {
               this.list = v[0];
            });
            this.$swal.fire({
               toast: true,
               position: 'center',
               showConfirmButton: false,
               icon: 'success',
               title: 'Usuario activado exitosamente',
               timer: 2000,
               timerProgressBar: true,
            });
         } catch (e) {
            this.$swal.fire({
               toast: true,
               position: 'center',
               showConfirmButton: false,
               icon: 'error',
               title: 'Hubo un problema al activar al Usuario. Intente nuevamente.',
               timer: 2000,
               timerProgressBar: true,
            });
         } finally {
            this.load = false;
         }
      },
      Activar(id) {
         if (!this.canUpdateUsuarios) return;
         this.$swal.fire({
            toast: false,
            position: 'center',
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: '<span style="font-weight: bold;">Sí, Activar</span>',
            cancelButtonText: '<span style="font-weight: bold;">No, Cancelar</span>',
            title: "",
            html: '<div style="text-align: center;"><div style="font-size: 20px;">¿Deseas activar al Usuario?</div></div>',
            icon: 'warning',
            dangerMode: true,
         }).then(async (result) => {
            if (result.isConfirmed) {
               await this.ActivarItem(id);
            }
         });
      },
      generateReport(format) {
         const data = this.filteredList.map((item, index) => ({
            '#': index + 1,
            'Nombre': item.name,
            'Email': item.email,
            'Sucursal': item.sucursale ? item.sucursale.departamento : '-',
            'Estado': item.estado === 1 ? 'Activo' : item.estado === 2 ? 'Inactivo' : 'Desconocido'
         }));

         switch (format) {
            case 'excel':
               this.generateExcel(data);
               break;
            case 'pdf':
               this.generatePDF(data);
               break;
         }
      },
      generateExcel(data) {
         const ws = utils.json_to_sheet(data);
         const wsOpts = {
            header: ['#', 'Nombre', 'Email', 'Sucursal', 'Estado'],
            font: {
               name: 'Arial',
               sz: 12,
               bold: true
            },
            fill: {
               fgColor: { rgb: "FFFF00" }
            },
            border: {
               top: { style: 'thin', color: { rgb: '000000' } },
               bottom: { style: 'thin', color: { rgb: '000000' } },
               left: { style: 'thin', color: { rgb: '000000' } },
               right: { style: 'thin', color: { rgb: '000000' } }
            }
         };

         ws['!cols'] = [
            { wpx: 50 },
            { wpx: 150 },
            { wpx: 200 },
            { wpx: 150 },
            { wpx: 100 }
         ];

         const wb = utils.book_new();
         utils.book_append_sheet(wb, ws, "usuarios");

         writeFile(wb, "Usuarios.xlsx");
      },
      generatePDF(data) {
         const doc = new jsPDF();
         const tableColumn = ['#', 'Nombre', 'Email', 'Sucursal', 'Estado'];
         const tableRows = data.map(item => [
            item['#'],
            item['Nombre'],
            item['Email'],
            item['Sucursal'],
            item['Estado']
         ]);

         doc.setFontSize(18);
         doc.text('Reporte de Usuarios', 14, 22);

         autoTable(doc, {
            startY: 30,
            head: [tableColumn],
            body: tableRows,
            styles: {
               cellPadding: 5,
               fontSize: 6,
               valign: 'middle',
               overflow: 'linebreak',
               fillColor: [255, 255, 255],
               textColor: [0, 0, 0],
               lineColor: [44, 62, 80],
               lineWidth: 0.75
            },
            headStyles: {
               fillColor: [44, 62, 80],
               textColor: [255, 255, 255],
               fontSize: 6,
               fontStyle: 'bold'
            },
            footStyles: {
               fillColor: [44, 62, 80],
               textColor: [255, 255, 255],
               fontSize: 6,
               fontStyle: 'bold'
            },
            theme: 'grid'
         });

         doc.save('Usuarios.pdf');
      },
      changePage(page) {
         if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
         }
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


