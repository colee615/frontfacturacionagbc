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
                                    <th class="py-1 px-2">Modificado por</th>
                                    <th class="py-1 px-2">Habilitado a Cajero</th>
                                    <th class="py-1 px-2">Acceso Especial</th>
                                    <th class="py-1 px-2">Motivo</th>
                                    <th class="py-1 px-2">Fecha</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 <tr v-for="(log, i) in paginatedLogs" :key="log.id">
                                    <td class="py-1 px-2">{{ (currentPage - 1) * itemsPerPage + i + 1 }}</td>
                                    <td class="py-1 px-2">{{ log.modified_by.name }}</td>
                                    <td class="py-1 px-2">{{ log.cajero.name }}</td>
                                    <td class="py-1 px-2">{{ log.special_access ? 'Acceso concedido' : 'Permiso quitado'
                                       }}</td>

                                    <td class="py-1 px-2">{{ log.motivo }}</td>
                                    <td class="py-1 px-2">{{ new Date(log.created_at).toLocaleString() }}</td>
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
                                 <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">&laquo;</a>
                              </li>
                              <li class="page-item" v-for="page in totalPages" :key="page"
                                 :class="{ active: currentPage === page }">
                                 <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
                              </li>
                              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                                 <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">&raquo;</a>
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
         logs: [],
         search: '',
         apiUrl: 'special-access-logs',
         page: 'Administración',
         modulo: 'Accesos Especiales',
         currentPage: 1,
         itemsPerPage: 10,
      };
   },
   computed: {
      filteredLogs() {
         return this.logs.filter(log => log.cajero.name.toLowerCase().includes(this.search.toLowerCase()));
      },
      totalPages() {
         return Math.ceil(this.filteredLogs.length / this.itemsPerPage);
      },
      paginatedLogs() {
         const start = (this.currentPage - 1) * this.itemsPerPage;
         const end = start + this.itemsPerPage;
         return this.filteredLogs.slice(start, end);
      }
   },
   methods: {
      async GET_DATA(path) {
         const res = await this.$admin.$get(path);
         return res;
      },
      changePage(page) {
         if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
         }
      },
      async fetchLogs() {
         this.load = true;
         try {
            const res = await this.GET_DATA(this.apiUrl);
            this.logs = res;
         } catch (e) {
            console.error(e);
         } finally {
            this.load = false;
         }
      },
      generateReport(format) {
         const data = this.filteredLogs.map((log, index) => ({
            '#': index + 1,
            'Modificado por': log.modified_by.name,
            'Habilitado a Cajero': log.cajero.name,
            'Acceso Especial': log.special_access ? 'Acceso concedido' : 'Permiso quitado',
            'Motivo': log.motivo,
            'Fecha': new Date(log.created_at).toLocaleString()
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
         const wb = utils.book_new();
         utils.book_append_sheet(wb, ws, "Accesos Especiales");
         writeFile(wb, "accesos_especiales.xlsx");
      },
      generatePDF(data) {
         const doc = new jsPDF();
         const tableColumn = ['#', 'Modificado por', 'Habilitado a Cajero', 'Acceso Especial', 'Motivo', 'Fecha'];
         const tableRows = data.map(item => [
            item['#'],
            item['Modificado por'],
            item['Habilitado a Cajero'],
            item['Acceso Especial'],
            item['Motivo'],
            item['Fecha']
         ]);

         doc.setFontSize(18);
         doc.text('Reporte de Accesos Especiales', 14, 22);
         autoTable(doc, {
            startY: 30,
            head: [tableColumn],
            body: tableRows,
            styles: {
               cellPadding: 5,
               fontSize: 8,
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
               fontSize: 8,
               fontStyle: 'bold'
            },
            footStyles: {
               fillColor: [44, 62, 80],
               textColor: [255, 255, 255],
               fontSize: 8,
               fontStyle: 'bold'
            },
            theme: 'grid'
         });

         doc.save('accesos_especiales.pdf');
      }
   },
   mounted() {
      this.fetchLogs();
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