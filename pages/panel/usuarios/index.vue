<template>
   <div>
      <JcLoader :load="load"></JcLoader>
      <AdminTemplate :page="page" :modulo="modulo">
         <div slot="body">
            <div class="row">
               <div class="col-12 mb-4">
                  <div class="card users-hero">
                     <div class="card-body">
                        <div class="users-hero-head">
                           <div>
                              <p class="users-kicker mb-2">Centro de Accesos</p>
                              <h4 class="users-title mb-2">Gestión de usuarios</h4>
                              <p class="users-subtitle mb-0">Controla credenciales, estado operativo y accesos del equipo desde una sola vista.</p>
                           </div>
                           <div class="users-badge">
                              <i class="fas fa-user-shield"></i>
                              <span>{{ filteredList.length }} registros</span>
                           </div>
                        </div>
                        <div class="row mt-4 g-3">
                           <div class="col-md-4 col-sm-6">
                              <div class="users-stat">
                                 <span class="users-stat-label">Usuarios activos</span>
                                 <strong>{{ activeCount }}</strong>
                              </div>
                           </div>
                           <div class="col-md-4 col-sm-6">
                              <div class="users-stat">
                                 <span class="users-stat-label">Usuarios inactivos</span>
                                 <strong>{{ inactiveCount }}</strong>
                              </div>
                           </div>
                           <div class="col-md-4 col-sm-12">
                              <div class="users-stat">
                                 <span class="users-stat-label">Con acceso de gestión</span>
                                 <strong>{{ canManageUsuarios ? 'Sí' : 'No' }}</strong>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
               <div class="col-12">
                  <div class="card users-card">
                     <div class="card-body">
                        <div class="users-toolbar">
                           <div class="users-search-wrap">
                              <i class="fas fa-search"></i>
                              <input v-model="search" type="text" class="form-control users-search" placeholder="Buscar por nombre o correo">
                           </div>
                           <div class="users-actions">
                              <nuxtLink v-if="canCreateUsuarios" :to="url_nuevo" class="btn users-btn users-btn-primary">
                                 <i class="fas fa-plus"></i>
                                 <span>Nuevo usuario</span>
                              </nuxtLink>
                              <button @click="generateReport('excel')" class="btn users-btn users-btn-success">
                                 <i class="fas fa-file-excel"></i>
                                 <span>Excel</span>
                              </button>
                              <button @click="generateReport('pdf')" class="btn users-btn users-btn-danger">
                                 <i class="fas fa-file-pdf"></i>
                                 <span>PDF</span>
                              </button>
                           </div>
                        </div>

                        <div class="table-responsive users-table-wrap">
                           <table class="table users-table align-middle">
                              <thead>
                                 <tr>
                                    <th class="py-1 px-2">#</th>
                                    <th class="py-1 px-2">NOMBRE</th>
                                    <th class="py-1 px-2">EMAIL</th>
                                    <th class="py-1 px-2">ESTADO</th>
                                    <th class="py-1 px-2">ACCIONES</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 <tr v-for="(m, i) in paginatedList" :key="m.id">
                                    <td class="py-2 px-2 users-row-index">{{ (currentPage - 1) * itemsPerPage + i + 1 }}</td>
                                    <td class="py-2 px-2">
                                       <div class="users-name-block">
                                          <strong>{{ m.name }}</strong>
                                       </div>
                                    </td>
                                    <td class="py-2 px-2">
                                       <span class="users-email">{{ m.email }}</span>
                                    </td>
                                    <td class="py-2 px-2">
                                       <span class="users-state" :class="estadoBadgeClass(m.estado)">
                                          {{ estadoLabel(m.estado) }}
                                       </span>
                                    </td>
                                    <td class="py-2 px-2">
                                       <div class="users-action-group">
                                          <nuxt-link v-if="canUpdateUsuarios" :to="`${url_editar}${m.id}`" class="btn users-icon-btn users-icon-btn-info">
                                             <i class="fas fa-pen"></i>
                                          </nuxt-link>
                                          <button v-if="canDeleteUsuarios && m.estado === 1" type="button" @click="Eliminar(m.id)"
                                             class="btn users-icon-btn users-icon-btn-danger">
                                             <i class="fas fa-trash"></i>
                                          </button>
                                          <button v-if="canUpdateUsuarios && m.estado === 2" type="button" @click="Activar(m.id)"
                                             class="btn users-icon-btn users-icon-btn-success">
                                             <i class="fas fa-check"></i>
                                          </button>
                                       </div>
                                    </td>
                                 </tr>
                                 <tr v-if="!paginatedList.length">
                                    <td colspan="5" class="py-4 text-center users-empty">
                                       No se encontraron usuarios con ese criterio de búsqueda.
                                    </td>
                                 </tr>
                              </tbody>
                           </table>
                        </div>
                        <nav aria-label="Page navigation example" class="enterprise-pagination-nav">
                           <ul class="pagination justify-content-center enterprise-pagination">
                              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                 <a class="page-link" href="#" @click.prevent="changePage(1)">Primero</a>
                              </li>
                              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                 <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">Anterior</a>
                              </li>
                              <li class="page-item" v-for="page in totalPages" :key="page"
                                 :class="{ active: currentPage === page }">
                                 <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
                              </li>
                              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                                 <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">Siguiente</a>
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
      activeCount() {
         return this.list.filter(item => item.estado === 1).length;
      },
      inactiveCount() {
         return this.list.filter(item => item.estado === 2).length;
      },
      filteredList() {
         const term = (this.search || '').toString().toLowerCase();
         return this.list.filter(item => {
            const name = ((item && item.name) ? item.name : '').toString().toLowerCase();
            const email = ((item && item.email) ? item.email : '').toString().toLowerCase();
            return name.includes(term) || email.includes(term);
         });
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
      estadoLabel(estado) {
         if (estado === 1) return 'Activo';
         if (estado === 2) return 'Inactivo';
         return 'Desconocido';
      },
      estadoBadgeClass(estado) {
         if (estado === 1) return 'activo';
         if (estado === 2) return 'inactivo';
         return 'desconocido';
      },
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
            header: ['#', 'Nombre', 'Email', 'Estado'],
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
            { wpx: 100 }
         ];

         const wb = utils.book_new();
         utils.book_append_sheet(wb, ws, "usuarios");

         writeFile(wb, "Usuarios.xlsx");
      },
      generatePDF(data) {
         const doc = new jsPDF();
         const tableColumn = ['#', 'Nombre', 'Email', 'Estado'];
         const tableRows = data.map(item => [
            item['#'],
            item['Nombre'],
            item['Email'],
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
.users-hero {
   border-radius: 24px;
   background:
      radial-gradient(circle at top right, rgba(255, 216, 79, 0.22), transparent 26%),
      linear-gradient(135deg, #ffffff 0%, #fffaf0 100%);
}

.users-hero-head {
   display: flex;
   align-items: flex-start;
   justify-content: space-between;
   gap: 1rem;
}

.users-kicker {
   color: #b78916;
   font-size: 0.8rem;
   font-weight: 800;
   letter-spacing: 0.12em;
   text-transform: uppercase;
}

.users-title {
   color: #24324d;
   font-weight: 800;
}

.users-subtitle {
   color: #6b7a90;
   max-width: 720px;
}

.users-badge {
   display: inline-flex;
   align-items: center;
   gap: 0.65rem;
   padding: 0.8rem 1rem;
   border-radius: 16px;
   background: #fff;
   border: 1px solid rgba(215, 224, 236, 0.9);
   color: #4a5b79;
   font-weight: 800;
   box-shadow: 0 12px 24px rgba(15, 23, 42, 0.06);
}

.users-stat {
   padding: 1rem 1.1rem;
   border-radius: 18px;
   background: rgba(255, 255, 255, 0.84);
   border: 1px solid rgba(223, 230, 240, 0.92);
}

.users-stat-label {
   display: block;
   color: #7b8aa3;
   font-size: 0.84rem;
   font-weight: 700;
   margin-bottom: 0.35rem;
}

.users-stat strong {
   color: #22314d;
   font-size: 1.5rem;
   font-weight: 800;
}

.users-card {
   border-radius: 24px;
}

.users-toolbar {
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: 1rem;
   margin-bottom: 1.5rem;
   flex-wrap: wrap;
}

.users-search-wrap {
   position: relative;
   flex: 1 1 420px;
}

.users-search-wrap i {
   position: absolute;
   left: 16px;
   top: 50%;
   transform: translateY(-50%);
   color: #94a3b8;
}

.users-search {
   height: 54px;
   padding-left: 46px !important;
   border-radius: 16px !important;
}

.users-actions {
   display: flex;
   gap: 0.75rem;
   flex-wrap: wrap;
}

.users-btn {
   display: inline-flex;
   align-items: center;
   justify-content: center;
   gap: 0.55rem;
   min-height: 48px;
   padding: 0.8rem 1.2rem;
   border-radius: 14px;
   border: none;
   font-weight: 800;
   box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.users-btn-primary {
   background: #344258;
   color: #fff;
}

.users-btn-success {
   background: linear-gradient(135deg, #f9dd74 0%, #f7c94b 100%);
   color: #5b4300;
}

.users-btn-danger {
   background: linear-gradient(135deg, #ff4d4f 0%, #dc2626 100%);
   color: #fff;
}

.users-table-wrap {
   border-radius: 18px;
   overflow: hidden;
}

.users-table {
   margin-bottom: 0;
}

.users-row-index {
   color: #94a3b8;
   font-weight: 700;
}

.users-name-block {
   display: flex;
   flex-direction: column;
   gap: 0.18rem;
}

.users-name-block strong {
   color: #24324d;
}

.users-name-block small {
   color: #94a3b8;
   font-weight: 700;
}

.users-email {
   color: #4b5b76;
   font-weight: 600;
}

.users-state {
   display: inline-flex;
   align-items: center;
   justify-content: center;
   padding: 0.46rem 0.8rem;
   border-radius: 999px;
   font-size: 0.82rem;
   font-weight: 800;
   letter-spacing: 0.02em;
   white-space: nowrap;
}

.users-state.activo {
   background: #ecfdf3;
   color: #157347;
}

.users-state.inactivo {
   background: #fff5f5;
   color: #c2410c;
}

.users-state.desconocido {
   background: #f1f5f9;
   color: #475569;
}

.users-action-group {
   display: flex;
   gap: 0.45rem;
   flex-wrap: wrap;
}

.users-icon-btn {
   width: 38px;
   height: 38px;
   border-radius: 12px;
   display: inline-flex;
   align-items: center;
   justify-content: center;
   border: none;
   color: #fff;
   box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
}

.users-icon-btn-info {
   background: linear-gradient(135deg, #22c1dc 0%, #0891b2 100%);
}

.users-icon-btn-danger {
   background: linear-gradient(135deg, #ff4d4f 0%, #dc2626 100%);
}

.users-icon-btn-success {
   background: linear-gradient(135deg, #22c55e 0%, #15803d 100%);
}

.users-empty {
   color: #7b8aa3;
   font-weight: 700;
}

@media (max-width: 991px) {
   .users-hero-head {
      flex-direction: column;
   }
}
</style>


