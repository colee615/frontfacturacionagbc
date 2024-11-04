<template>
   <div>
      <AdminTemplate :page="page" :modulo="modulo">
         <div slot="body">
            <div class="row justify-content-md-center">
               <div class="form-group mt-3 col-md-6">
                  <label for="cajeroSelect">Seleccione un cajero:</label>
                  <v-select :options="list" v-model="selectedCajero" label="name" :reduce="cajero => cajero.id"
                     @input="resetData" placeholder="Buscar cajero...">
                     <template #option="option">
                        <div>
                           {{ option.name }} - {{ option.email }}
                        </div>
                     </template>
                  </v-select>
               </div>
               <div class="col-lg-10 mx-auto" v-if="selectedCajero">
                  <div class="card mb-4">
                     <div class="card-header p-3">
                        <div class="d-flex justify-content-between align-items-center">
                           <h6>Datos del Cajero</h6>
                           <div class="btn-group">
                              <button @click="descargarPDF" class="btn btn-danger btn-sm">
                                 Exportar PDF Día De Hoy
                              </button>
                              <button @click="descargarExcel" class="btn btn-success btn-sm">
                                 Exportar Excel Día De Hoy
                              </button>
                              <button @click="descargarPDFPorRangoFechas" class="btn btn-danger btn-sm">
                                 Exportar PDF por Rango de Fechas
                              </button>
                              <button @click="descargarExcelPorRangoFechas" class="btn btn-success btn-sm">
                                 Exportar Excel por Rango de Fechas
                              </button>
                           </div>
                        </div>
                     </div>
                     <div class="card-body p-3">
                        <div class="row">
                           <div class="col-md-6">
                              <p class="text-sm mb-0"><strong>Nombre:</strong> {{ selectedCajeroDetails.name }}</p>
                              <p class="text-sm mb-0"><strong>Email:</strong> {{ selectedCajeroDetails.email }}</p>
                              <p class="text-sm mb-0"><strong>Sucursal:</strong> {{
                                 selectedCajeroDetails.sucursale.departamento }}</p>
                              <p class="text-sm mb-0"><strong>Estado:</strong> {{
                                 formatEstado(selectedCajeroDetails.estado) }}</p>
                           </div>
                        </div>
                        <hr class="horizontal dark mt-4 mb-4" />
                        <div class="row">
                           <div class="col-lg-6">
                              <h6 class="mb-3">Información</h6>
                              <div class="form-group mt-3">
                                 <label for="fechaInicio">Fecha Inicio:</label>
                                 <input type="date" id="fechaInicio" v-model="fechaInicio" class="form-control" />
                              </div>
                              <div class="form-group mt-3">
                                 <label for="fechaFin">Fecha Fin:</label>
                                 <input type="date" id="fechaFin" v-model="fechaFin" class="form-control" />
                              </div>
                              <button @click="fetchVentasPorRangoFechas(selectedCajeroDetails.id)"
                                 class="btn btn-secondary btn-sm mt-2">
                                 Ver Ventas por Rango de Fechas
                              </button>
                              <button @click="fetchVentasDelDia(selectedCajeroDetails.id)"
                                 class="btn btn-primary btn-sm mt-2">
                                 Ver Ventas del Día
                              </button>
                           </div>
                           <div class="col-lg-6 text-center">
                              <img src="/assets/img/logo.png" alt="Imagen Descriptiva" class="img-fluid mt-4"
                                 style="max-width: 150px;" />
                              <div class="mt-4">
                                 <span class="mb-2 text-lg">Total del Día:</span>
                                 <span class="text-dark text-lg ms-2 font-weight-bold">{{ totalVentasDelDia }} Bs</span>
                              </div>
                           </div>
                        </div>
                        <div class="mt-3">
                           <div v-if="ventasDelDia.length > 0">
                              <h5>Ventas del Día</h5>
                              <ul class="list-group">
                                 <li v-for="venta in ventasDelDia" :key="venta.id" class="list-group-item">
                                    N° - {{ venta.codigoOrden }} Razon Social: {{ venta.cliente?.razonSocial || 'N/A' }}
                                    N° Identidad: {{ venta.cliente?.documentoIdentidad ?
                                       formatDocumentoIdentidad(venta.cliente.documentoIdentidad) : 'N/A' }}
                                    Tipo: {{ venta.motivo }} - Total Venta {{ venta.total }} Bs - Estado: {{
                                       formatEstado(venta.estado)
                                    }}
                                 </li>
                              </ul>
                              <p><strong>Total del Día (sin Estado 0):</strong> {{ totalVentasDelDia }} Bs</p>
                           </div>
                           <div v-if="ventasPorRangoFechas.length > 0" class="mt-3">
                              <h5>Ventas por Rango de Fechas</h5>
                              <ul class="list-group">
                                 <li v-for="venta in ventasPorRangoFechas" :key="venta.id" class="list-group-item">
                                    N° - {{ venta.codigoOrden }} Razon Social: {{ venta.cliente?.razonSocial || 'N/A' }}
                                    N° Identidad: {{ venta.cliente?.documentoIdentidad ?
                                       formatDocumentoIdentidad(venta.cliente.documentoIdentidad) : 'N/A' }}
                                    Tipo: {{ venta.motivo }} - Total Venta {{ venta.total }} Bs - Estado: {{
                                       formatEstado(venta.estado)
                                    }}
                                 </li>
                              </ul>
                              <p><strong>Total por Rango de Fechas (sin Estado 0):</strong> {{ totalVentasPorRangoFechas
                                 }} Bs</p>
                           </div>
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
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { utils, writeFile } from 'xlsx';

export default {
   name: "IndexPage",
   components: { vSelect },
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
         apiUrl: 'cajeros',
         page: 'Administración',
         modulo: 'Cajeros',
         url_nuevo: '/administrador/cajeros/nuevo',
         url_editar: '/administrador/cajeros/editar/',
         currentPage: 1,
         itemsPerPage: 14,
         selectedCajero: null,
         fechaInicio: '',
         fechaFin: '',
         ventasDelDia: [],
         totalVentasDelDia: 0,
         ventasPorRangoFechas: [],
         totalVentasPorRangoFechas: 0
      };
   },
   computed: {
      user() {
         return this.$store.state.auth.user;
      },
      filteredList() {
         return this.list.filter(item => item.name.toLowerCase().includes(this.search.toLowerCase()));
      },
      selectedCajeroDetails() {
         return this.list.find(item => item.id === this.selectedCajero) || {};
      }
   },
   methods: {
      async GET_DATA(path) {
         const res = await this.$admin.$get(path);
         return res;
      },
      async fetchVentasDelDia(id) {
         this.load = true;
         try {
            const res = await this.$admin.$get(`/ventas/dia/${id}`);
            this.ventasDelDia = res.ventas;
            this.totalVentasDelDia = res.total;
         } catch (e) {
            this.showErrorMessage('Hubo un problema al obtener las ventas del día. Intente nuevamente.');
         } finally {
            this.load = false;
         }
      },
      async fetchVentasPorRangoFechas(id) {
         this.load = true;
         try {
            const res = await this.$admin.$post(`/ventas/fecha/${id}`, { fecha_inicio: this.fechaInicio, fecha_fin: this.fechaFin });
            this.ventasPorRangoFechas = res.ventas;
            this.totalVentasPorRangoFechas = res.total;
         } catch (e) {
            this.showErrorMessage('Hubo un problema al obtener las ventas por rango de fechas. Intente nuevamente.');
         } finally {
            this.load = false;
         }
      },
      formatEstado(estado) {
         const estados = {
            1: 'Activo',
            2: 'Inactivo',
            default: 'Desconocido'
         };
         return estados[estado] || estados.default;
      },
      formatDocumentoIdentidad(documentoIdentidad) {
         return documentoIdentidad || 'N/A';
      },
      resetData() {
         this.ventasDelDia = [];
         this.totalVentasDelDia = 0;
         this.ventasPorRangoFechas = [];
         this.totalVentasPorRangoFechas = 0;
         this.fechaInicio = '';
         this.fechaFin = '';
      },
      showErrorMessage(message) {
         this.$swal.fire({
            toast: true,
            position: 'center',
            showConfirmButton: false,
            icon: 'error',
            title: message,
            timer: 2000,
            timerProgressBar: true,
         });
      },
      descargarPDF() {
         const doc = new jsPDF({ orientation: 'landscape' });

         // Agregar información del cajero
         doc.text(`Nombre: ${this.selectedCajeroDetails.name}`, 14, 20);
         doc.text(`Sucursal: ${this.selectedCajeroDetails.sucursale.departamento}`, 14, 40);
         doc.text(`Total Ventas del Día: ${this.totalVentasDelDia} Bs`, 14, 60);

         // Agregar tabla de ventas
         autoTable(doc, {
            startY: 70,
            head: [['N°', 'Razon Social', 'Identidad', 'Tipo', 'Total Venta']],
            body: this.ventasDelDia.map(venta => [
               venta.codigoOrden,
               venta.cliente?.razonSocial || 'N/A',
               venta.cliente?.documentoIdentidad ? this.formatDocumentoIdentidad(venta.cliente.documentoIdentidad) : 'N/A',
               venta.motivo,
               `${venta.total} Bs`
            ]),
            theme: 'grid',
            margin: { top: 20, right: 20, bottom: 20, left: 20 }
         });

         doc.save('ventas_del_dia.pdf');
      },
      descargarExcel() {
         const data = [
            { 'Cajero': `Nombre: ${this.selectedCajeroDetails.name}, Sucursal: ${this.selectedCajeroDetails.sucursale.departamento}` },
            {},
            ...this.ventasDelDia.map(venta => ({
               'N°': venta.codigoOrden,
               'Razon Social': venta.cliente?.razonSocial || 'N/A',
               'Identidad': venta.cliente?.documentoIdentidad ? this.formatDocumentoIdentidad(venta.cliente.documentoIdentidad) : 'N/A',
               'Tipo': venta.motivo,
               'Total Venta': `${venta.total} Bs`
            })),
            {},
            { 'N°': '', 'Razon Social': '', 'Identidad': '', 'Tipo': 'Total Ventas del Día', 'Total Venta': `${this.totalVentasDelDia} Bs` }
         ];

         const ws = utils.json_to_sheet(data);
         const wb = utils.book_new();
         utils.book_append_sheet(wb, ws, 'Ventas del Día');

         writeFile(wb, 'ventas_del_dia.xlsx');
      },
      descargarPDFPorRangoFechas() {
         const doc = new jsPDF({ orientation: 'landscape' });

         // Agregar información del cajero
         doc.text(`Nombre: ${this.selectedCajeroDetails.name}`, 14, 20);
         doc.text(`Sucursal: ${this.selectedCajeroDetails.sucursale.departamento}`, 14, 40);
         doc.text(`Total Ventas por Rango de Fechas: ${this.totalVentasPorRangoFechas} Bs`, 14, 60);

         // Agregar tabla de ventas
         autoTable(doc, {
            startY: 70,
            head: [['N°', 'Razon Social', 'Identidad', 'Tipo', 'Total Venta']],
            body: this.ventasPorRangoFechas.map(venta => [
               venta.codigoOrden,
               venta.cliente?.razonSocial || 'N/A',
               venta.cliente?.documentoIdentidad ? this.formatDocumentoIdentidad(venta.cliente.documentoIdentidad) : 'N/A',
               venta.motivo,
               `${venta.total} Bs`
            ]),
            theme: 'grid',
            margin: { top: 20, right: 20, bottom: 20, left: 20 }
         });

         doc.save('ventas_por_rango_fechas.pdf');
      },
      descargarExcelPorRangoFechas() {
         const data = [
            { 'Cajero': `Nombre: ${this.selectedCajeroDetails.name}, Sucursal: ${this.selectedCajeroDetails.sucursale.departamento}` },
            {},
            ...this.ventasPorRangoFechas.map(venta => ({
               'N°': venta.codigoOrden,
               'Razon Social': venta.cliente?.razonSocial || 'N/A',
               'Identidad': venta.cliente?.documentoIdentidad ? this.formatDocumentoIdentidad(venta.cliente.documentoIdentidad) : 'N/A',
               'Tipo': venta.motivo,
               'Total Venta': `${venta.total} Bs`
            })),
            {},
            { 'N°': '', 'Razon Social': '', 'Identidad': '', 'Tipo': 'Total Ventas por Rango de Fechas', 'Total Venta': `${this.totalVentasPorRangoFechas} Bs` }
         ];

         const ws = utils.json_to_sheet(data);
         const wb = utils.book_new();
         utils.book_append_sheet(wb, ws, 'Ventas por Rango de Fechas');

         writeFile(wb, 'ventas_por_rango_fechas.xlsx');
      }
   },
   async mounted() {
      this.load = true;
      try {
         const data = await this.GET_DATA(this.apiUrl);
         this.list = data;
      } catch (e) {
         this.showErrorMessage('Hubo un problema al obtener los datos de cajeros. Intente nuevamente.');
      } finally {
         this.load = false;
      }
   }
};
</script>

<style scoped>
.btn-group {
   margin-top: 1rem;
}

.text-lg {
   font-size: 1.25rem;
}

.font-weight-bold {
   font-weight: 700;
}
</style>
