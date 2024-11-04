<template>
   <div>
      <AdminTemplate :page="page" :modulo="modulo">
         <div slot="body">
            <div class="row justify-content-md-center">
               <div class="form-group mt-3 col-md-6">
                  <label for="sucursalSelect">Seleccione una sucursal:</label>
                  <v-select :options="list" v-model="selectedSucursal" label="nombre"
                     :reduce="sucursal => sucursal.codigosucursal" @input="resetData" placeholder="Buscar sucursal...">
                     <template #option="option">
                        <div>
                           {{ option.departamento }} - {{ option.codigosucursal }}
                        </div>
                     </template>
                  </v-select>
               </div>
               <div class="col-lg-10 mx-auto" v-if="selectedSucursal !== null">
                  <div class="card mb-4">
                     <div class="card-header p-3">
                        <div class="d-flex justify-content-between align-items-center">
                           <h6>Datos de la Sucursal</h6>
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
                              <p class="text-sm mb-0"><strong>Nombre:</strong> {{ selectedSucursalDetails.nombre }}</p>
                              <p class="text-sm mb-0"><strong>Departamento:</strong> {{
                                 selectedSucursalDetails.departamento }}</p>
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
                              <button @click="fetchVentasPorRangoFechas(selectedSucursalDetails.codigosucursal)"
                                 class="btn btn-secondary btn-sm mt-2">
                                 Ver Ventas por Rango de Fechas
                              </button>
                              <button @click="fetchVentasDelDia(selectedSucursalDetails.codigosucursal)"
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
                           <div v-if="Object.keys(ventasDelDia).length > 0">
                              <h5>Ventas del Día</h5>
                              <ul class="list-group">
                                 <li v-for="(ventasCajero, cajeroId) in ventasDelDia" :key="cajeroId"
                                    class="list-group-item">
                                    <h6 v-if="ventasCajero && ventasCajero.cajero">{{ ventasCajero.cajero.name }}</h6>

                                    <ul>
                                       <li v-for="(venta, index) in ventasCajero.ventas" :key="index">
                                          <p><strong>Razon Social:</strong> {{ venta.cliente.razonSocial || 'N/A' }}</p>
                                          <p><strong>N° Identidad:</strong> {{ venta.cliente.documentoIdentidad ?
                                             formatDocumentoIdentidad(venta.cliente.documentoIdentidad) : 'N/A' }}</p>
                                          <p><strong>Total Venta:</strong> {{ venta.total }} Bs</p>
                                          <p><strong>Estado:</strong> {{ formatEstado(venta.estado) }}</p>
                                          <p><strong>Detalles:</strong></p>
                                          <ul>
                                             <li v-for="(detalle, index) in venta.detalle_ventas" :key="index">
                                                Servicio: {{ detalle.servicio.nombre }} - Precio: {{ detalle.precio }}
                                                Bs - Cantidad: {{ detalle.cantidad }}
                                             </li>
                                          </ul>
                                       </li>
                                    </ul>
                                    <p><strong>Total Ventas del Cajero:</strong> {{ ventasCajero.total }} Bs</p>
                                 </li>
                              </ul>
                              <p><strong>Total del Día (sin Estado 0):</strong> {{ totalVentasDelDia }} Bs</p>
                           </div>

                           <div v-if="Object.keys(ventasPorRangoFechas).length > 0" class="mt-3">
                              <h5>Ventas por Rango de Fechas</h5>
                              <ul class="list-group">
                                 <li v-for="(ventasCajero, cajeroId) in ventasPorRangoFechas" :key="cajeroId"
                                    class="list-group-item">
                                    <h6 v-if="ventasCajero && ventasCajero.cajero">{{ ventasCajero.cajero.name }}</h6>
                                    <ul>
                                       <li v-for="(venta, index) in ventasCajero.ventas" :key="index">
                                          <p><strong>Razon Social:</strong> {{ venta.cliente.razonSocial || 'N/A' }}</p>
                                          <p><strong>N° Identidad:</strong> {{ venta.cliente.documentoIdentidad ?
                                             formatDocumentoIdentidad(venta.cliente.documentoIdentidad) : 'N/A' }}</p>
                                          <p><strong>Total Venta:</strong> {{ venta.total }} Bs</p>
                                          <p><strong>Estado:</strong> {{ formatEstado(venta.estado) }}</p>
                                          <p><strong>Detalles:</strong></p>
                                          <ul>
                                             <li v-for="(detalle, index) in venta.detalle_ventas" :key="index">
                                                Servicio: {{ detalle.servicio.nombre }} - Precio: {{ detalle.precio }}
                                                Bs - Cantidad:
                                                {{ detalle.cantidad }}
                                             </li>
                                          </ul>
                                       </li>
                                    </ul>
                                    <p><strong>Total Ventas del Cajero:</strong> {{ ventasCajero.total }} Bs</p>
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
   name: "ReportePorSucursal",
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
         apiUrl: 'sucursales',
         page: 'Administración',
         modulo: 'Reportes por Sucursal',
         currentPage: 1,
         itemsPerPage: 14,
         selectedSucursal: null,
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
         return this.list.filter(item => item.nombre.toLowerCase().includes(this.search.toLowerCase()));
      },
      selectedSucursalDetails() {
         return this.list.find(item => item.codigosucursal === this.selectedSucursal) || {};
      }
   },
   methods: {
      async GET_DATA(path) {
         const res = await this.$admin.$get(path);
         return res;
      },
      async fetchVentasDelDia(codigoSucursal) {
         this.load = true;
         try {
            const res = await this.$admin.$get(`/ventas/sucursal/dia/${codigoSucursal}`);
            console.log('Response:', res);
            this.totalVentasDelDia = res.total_general; // Cambiar a 'totalVentasDelDia'
            this.ventasDelDia = res.ventas_por_cajero; // Cambiar a 'ventasDelDia'
         } catch (e) {
            console.error('Error:', e);
         } finally {
            this.load = false;
         }
      }

      ,
      async fetchVentasPorRangoFechas(codigoSucursal) {
         this.load = true;
         try {
            const res = await this.$admin.$post(`/ventas/sucursal/fecha/${codigoSucursal}`, { fecha_inicio: this.fechaInicio, fecha_fin: this.fechaFin });
            this.ventasPorRangoFechas = res.ventas_por_cajero;
            this.totalVentasPorRangoFechas = res.total_general;
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

         // Agregar información de la sucursal
         doc.text(`Nombre: ${this.selectedSucursalDetails.nombre}`, 14, 20);
         doc.text(`Departamento: ${this.selectedSucursalDetails.departamento}`, 14, 40);
         doc.text(`Total Ventas del Día: ${this.totalVentasDelDia} Bs`, 14, 60);

         // Agregar tabla de ventas
         autoTable(doc, {
            startY: 70,
            head: [['N°', 'Cajero', 'Razon Social', 'Identidad', 'Tipo', 'Total Venta']],
            body: Object.values(this.ventasDelDia).flatMap(ventasCajero =>
               ventasCajero.ventas.map(venta => [
                  venta.codigoOrden,
                  ventasCajero.cajero.name,
                  venta.cliente?.razonSocial || 'N/A',
                  venta.cliente?.documentoIdentidad ? this.formatDocumentoIdentidad(venta.cliente.documentoIdentidad) : 'N/A',
                  venta.motivo,
                  `${venta.total} Bs`
               ])
            ),
            theme: 'grid',
            margin: { top: 20, right: 20, bottom: 20, left: 20 }
         });

         doc.save('ventas_del_dia.pdf');
      },
      descargarExcel() {
         const data = [
            { 'Sucursal': `Nombre: ${this.selectedSucursalDetails.nombre}, Departamento: ${this.selectedSucursalDetails.departamento}` },
            {},
            ...Object.values(this.ventasDelDia).flatMap(ventasCajero =>
               ventasCajero.ventas.map(venta => ({
                  'N°': venta.codigoOrden,
                  'Cajero': ventasCajero.cajero.name,
                  'Razon Social': venta.cliente?.razonSocial || 'N/A',
                  'Identidad': venta.cliente?.documentoIdentidad ? this.formatDocumentoIdentidad(venta.cliente.documentoIdentidad) : 'N/A',
                  'Tipo': venta.motivo,
                  'Total Venta': `${venta.total} Bs`
               }))
            ),
            {},
            { 'N°': '', 'Cajero': '', 'Razon Social': '', 'Identidad': '', 'Tipo': 'Total Ventas del Día', 'Total Venta': `${this.totalVentasDelDia} Bs` }
         ];

         const ws = utils.json_to_sheet(data);
         const wb = utils.book_new();
         utils.book_append_sheet(wb, ws, 'Ventas del Día');

         writeFile(wb, 'ventas_del_dia.xlsx');
      },
      descargarPDFPorRangoFechas() {
         const doc = new jsPDF({ orientation: 'landscape' });

         // Agregar información de la sucursal
         doc.text(`Nombre: ${this.selectedSucursalDetails.nombre}`, 14, 20);
         doc.text(`Departamento: ${this.selectedSucursalDetails.departamento}`, 14, 40);
         doc.text(`Total Ventas por Rango de Fechas: ${this.totalVentasPorRangoFechas} Bs`, 14, 60);

         // Agregar tabla de ventas
         autoTable(doc, {
            startY: 70,
            head: [['N°', 'Cajero', 'Razon Social', 'Identidad', 'Tipo', 'Total Venta']],
            body: Object.values(this.ventasPorRangoFechas).flatMap(ventasCajero =>
               ventasCajero.ventas.map(venta => [
                  venta.codigoOrden,
                  ventasCajero.cajero.name,
                  venta.cliente?.razonSocial || 'N/A',
                  venta.cliente?.documentoIdentidad ? this.formatDocumentoIdentidad(venta.cliente.documentoIdentidad) : 'N/A',
                  venta.motivo,
                  `${venta.total} Bs`
               ])
            ),
            theme: 'grid',
            margin: { top: 20, right: 20, bottom: 20, left: 20 }
         });

         doc.save('ventas_por_rango_fechas.pdf');
      },
      descargarExcelPorRangoFechas() {
         const data = [
            { 'Sucursal': `Nombre: ${this.selectedSucursalDetails.nombre}, Departamento: ${this.selectedSucursalDetails.departamento}` },
            {},
            ...Object.values(this.ventasPorRangoFechas).flatMap(ventasCajero =>
               ventasCajero.ventas.map(venta => ({
                  'N°': venta.codigoOrden,
                  'Cajero': ventasCajero.cajero.name,
                  'Razon Social': venta.cliente?.razonSocial || 'N/A',
                  'Identidad': venta.cliente?.documentoIdentidad ? this.formatDocumentoIdentidad(venta.cliente.documentoIdentidad) : 'N/A',
                  'Tipo': venta.motivo,
                  'Total Venta': `${venta.total} Bs`
               }))
            ),
            {},
            { 'N°': '', 'Cajero': '', 'Razon Social': '', 'Identidad': '', 'Tipo': 'Total Ventas por Rango de Fechas', 'Total Venta': `${this.totalVentasPorRangoFechas} Bs` }
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
         this.showErrorMessage('Hubo un problema al obtener los datos de sucursales. Intente nuevamente.');
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
