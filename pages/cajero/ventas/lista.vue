<template>
   <div>
      <JcLoader :load="load"></JcLoader>
      <AdminTemplate :page="page" :modulo="modulo">
         <div slot="body">
            <div class="row">
               <div class="col-12 mb-4">
                  <div class="card sales-hero">
                     <div class="card-body">
                        <div class="sales-hero-head">
                           <div>
                              <p class="sales-kicker mb-2">Centro de Facturación</p>
                              <h4 class="sales-title mb-2">Lista de ventas recepcionadas</h4>
                              <p class="sales-subtitle mb-0">
                                 Supervisa ventas enviadas al backend puente, revisa seguimiento y accede a sus acciones operativas.
                              </p>
                           </div>
                           <div class="sales-badge">
                              <i class="fas fa-file-invoice-dollar"></i>
                              <span>{{ filteredList.length }} registros</span>
                           </div>
                        </div>

                        <div class="sales-search-wrap mt-4">
                           <i class="fas fa-search"></i>
                           <input
                              v-model.trim="searchQuery"
                              type="text"
                              class="form-control sales-search"
                              placeholder="Buscar por código de seguimiento, cliente o documento"
                           >
                        </div>

                        <div class="row mt-4 g-3">
                           <div class="col-md-3 col-sm-6">
                              <div class="sales-stat">
                                 <span class="sales-stat-label">Ventas listadas</span>
                                 <strong>{{ filteredList.length }}</strong>
                              </div>
                           </div>
                           <div class="col-md-3 col-sm-6">
                              <div class="sales-stat">
                                 <span class="sales-stat-label">Monto acumulado</span>
                                 <strong>{{ formattedTotalAmount }}</strong>
                              </div>
                           </div>
                           <div class="col-md-3 col-sm-6">
                              <div class="sales-stat">
                                 <span class="sales-stat-label">Con seguimiento</span>
                                 <strong>{{ trackedCount }}</strong>
                              </div>
                           </div>
                           <div class="col-md-3 col-sm-6">
                              <div class="sales-stat">
                                 <span class="sales-stat-label">Sin documento</span>
                                 <strong>{{ missingDocumentCount }}</strong>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div class="row justify-content-end mb-2">
               <div v-if="modalEdit" class="sales-modal-backdrop" @click="modalEdit = false"></div>
               <div v-if="modalEdit" class="modal d-block sales-modal-visible" id="AjusteModal" tabindex="-1"
                  role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="false">
                  <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
                     <div class="modal-content sales-consult-modal">
                        <div class="modal-header">
                           <h5 class="modal-title" id="exampleModalLabel">Resultado de verificación</h5>
                           <button type="button" class="btn-close text-dark" @click="modalEdit = false"
                              data-bs-dismiss="modal" aria-label="Close">
                              <span aria-hidden="true">&times;</span>
                           </button>
                        </div>
                        <div class="modal-body sales-consult-body">
                           <div v-if="ventaDetails">
                              <div class="sales-consult-header mb-4">
                                 <div>
                                    <p class="sales-kicker mb-1">Consulta manual a SEFE</p>
                                    <h4 class="mb-2">{{ consultaStatusLabel }}</h4>
                                    <p class="mb-0 sales-subtitle">
                                       {{ consultaStatusHelp }}
                                    </p>
                                 </div>
                                 <span class="sales-status" :class="consultaStatusClass">
                                    {{ consultaStatusLabel }}
                                 </span>
                              </div>

                              <div class="row g-3 mb-4">
                                 <div class="col-md-6">
                                    <div class="sales-consult-card">
                                       <span class="sales-consult-label">Código de seguimiento</span>
                                       <strong>{{ ventaDetails.codFactura || consultedTracking }}</strong>
                                    </div>
                                 </div>
                                 <div class="col-md-6">
                                    <div class="sales-consult-card">
                                       <span class="sales-consult-label">Número de factura</span>
                                       <strong>{{ consultaCabecera.numeroFactura || ventaDetails.nroFactura || 'Pendiente' }}</strong>
                                    </div>
                                 </div>
                                 <div class="col-md-6">
                                    <div class="sales-consult-card">
                                       <span class="sales-consult-label">CUF</span>
                                       <strong class="sales-break">{{ ventaDetails.cuf || 'Pendiente' }}</strong>
                                    </div>
                                 </div>
                                 <div class="col-md-6">
                                    <div class="sales-consult-card">
                                       <span class="sales-consult-label">Cliente</span>
                                       <strong>{{ consultaCabecera.nombreRazonSocial || selectedVentaContext?.cliente?.razonSocial || 'N/A' }}</strong>
                                    </div>
                                 </div>
                              </div>

                              <div class="row g-3 mb-4">
                                 <div class="col-md-6">
                                    <div class="sales-consult-card">
                                       <span class="sales-consult-label">Documento</span>
                                       <strong>{{ consultaCabecera.numeroDocumento || selectedVentaContext?.cliente?.documentoIdentidad || 'N/A' }}</strong>
                                    </div>
                                 </div>
                                 <div class="col-md-6">
                                    <div class="sales-consult-card">
                                       <span class="sales-consult-label">Total</span>
                                       <strong>{{ consultaCabecera.montoTotal || selectedVentaContext?.total || '0.00' }}</strong>
                                    </div>
                                 </div>
                              </div>

                              <div class="sales-consult-actions">
                                 <button class="btn btn-outline-primary me-2" @click="toggleConsultaDetalle">
                                    <i class="fas fa-eye"></i> {{ showConsultaDetalle ? 'Ocultar detalle' : 'Ver detalle' }}
                                 </button>
                                 <a v-if="consultaPdfUrl" class="btn btn-outline-primary me-2" :href="consultaPdfUrl" target="_blank" rel="noopener">
                                    <i class="fas fa-file-pdf"></i> Factura PDF
                                 </a>
                                 <button v-else class="btn btn-outline-secondary me-2" disabled>
                                    <i class="fas fa-file-pdf"></i> PDF pendiente
                                 </button>
                                 <a v-if="consultaXmlUrl" class="btn btn-outline-primary" :href="consultaXmlUrl" target="_blank" rel="noopener">
                                    <i class="fas fa-file-code"></i> Factura XML
                                 </a>
                                 <button v-else class="btn btn-outline-secondary" disabled>
                                    <i class="fas fa-file-code"></i> XML pendiente
                                 </button>
                                 <button
                                    v-if="canAnularFactura"
                                    class="btn btn-outline-danger"
                                    @click="toggleAnulacionPanel"
                                 >
                                    <i class="fas fa-ban"></i> {{ modalAnular ? 'Ocultar anulación' : 'Anular factura' }}
                                 </button>
                              </div>

                              <div v-if="modalAnular" class="sales-anular-panel mt-4">
                                 <div class="sales-anular-head">
                                    <div>
                                       <p class="sales-kicker mb-1">Acción sensible</p>
                                       <h5 class="mb-1">Anular factura</h5>
                                       <p class="mb-0 sales-subtitle">
                                          Completa el motivo y el tipo de anulación antes de confirmar el envío a SEFE.
                                       </p>
                                    </div>
                                 </div>

                                 <div class="row g-3 mt-1">
                                    <div class="col-md-12">
                                       <label for="motivoAnulacion" class="form-label sales-form-label">Motivo de anulación</label>
                                       <input type="text" class="form-control sales-form-control" id="motivoAnulacion" v-model="motivo">
                                    </div>
                                    <div class="col-md-12">
                                       <label for="tipoAnulacion" class="form-label sales-form-label">Tipo de anulación</label>
                                       <select class="form-control sales-form-control" id="tipoAnulacion" v-model="tipoAnulacion">
                                          <option disabled value="">Seleccione una opción</option>
                                          <option value="1">1 - Factura mal emitida</option>
                                          <option value="2">2 - Nota de crédito-débito mal emitida</option>
                                          <option value="3">3 - Datos de emisión incorrectos</option>
                                          <option value="4">4 - Factura o nota devuelta</option>
                                       </select>
                                    </div>
                                 </div>

                                 <div class="sales-anular-actions mt-4">
                                    <button type="button" @click="toggleAnulacionPanel" class="btn btn-outline-secondary">
                                       Cerrar
                                    </button>
                                    <button type="button" @click="AnularFactura" class="btn btn-danger">
                                       Confirmar anulación
                                    </button>
                                 </div>
                              </div>

                              <div v-if="showConsultaDetalle" class="sales-consult-detail mt-4">
                                 <h6 class="mb-3">Detalle de la factura</h6>
                                 <div v-if="consultaDetalle.length">
                                    <div v-for="(item, index) in consultaDetalle" :key="index" class="sales-consult-item">
                                       <strong>{{ item.descripcion || 'Sin descripción' }}</strong>
                                       <span>{{ item.codigoProducto || item.codigo || 'S/C' }}</span>
                                       <span>{{ item.cantidad }} x {{ item.precioUnitario }}</span>
                                    </div>
                                 </div>
                                 <p v-else class="mb-0 text-muted">No hay detalle disponible en esta consulta.</p>
                              </div>
                           </div>
                           <div v-else>
                              <p>No se encontraron detalles de la venta.</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div class="col-12">
                  <div class="card sales-card">
                     <div class="card-body">
                        <div class="table-responsive sales-table-wrap">
                           <table class="table sales-table align-middle">
                              <thead>
                                 <tr>
                                    <th class="py-1 px-2">#</th>
                                    <th class="py-1 px-2">FECHA</th>
                                    <th class="py-1 px-2">CLIENTE</th>
                                    <th class="py-1 px-2">SEGUIMIENTO</th>
                                    <th class="py-1 px-2">ESTADO</th>
                                    <th class="py-1 px-2">DOCUMENTO</th>
                                    <th class="py-1 px-2">TOTAL</th>
                                    <th class="py-1 px-2">ACCIONES</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 <tr v-for="(m, i) in paginatedList" :key="m.id">
                                    <td class="py-2 px-2 sales-row-index">{{ (currentPage - 1) * itemsPerPage + i + 1 }}</td>
                                    <td class="py-2 px-2">
                                       <span class="sales-date">{{ m.fecha || 'N/A' }}</span>
                                    </td>
                                    <td class="py-2 px-2">
                                       <div class="sales-client-block">
                                          <strong>{{ getClientName(m) }}</strong>
                                          <small>{{ getClientCode(m) }}</small>
                                       </div>
                                    </td>
                                    <td class="py-2 px-2">
                                       <span class="sales-tracking">{{ m.codigoSeguimiento || 'SIN SEGUIMIENTO' }}</span>
                                    </td>
                                    <td class="py-2 px-2">
                                       <span class="sales-status" :class="statusClass(m.status)">
                                          {{ statusLabel(m.status) }}
                                       </span>
                                    </td>
                                    <td class="py-2 px-2">
                                       <span class="sales-document">{{ getDocument(m) }}</span>
                                    </td>
                                    <td class="py-2 px-2">
                                       <span class="sales-total">{{ formatAmount(m.total) }}</span>
                                    </td>
                                    <td class="py-2 px-2">
                                       <div class="sales-action-group">
                                          <button type="button" @click="redirectTo(m.id)"
                                             class="btn sales-icon-btn sales-icon-btn-info" title="Ver venta">
                                             <i class="fas fa-eye"></i>
                                          </button>
                                          <button type="button" @click="ImprimirVenta(m)"
                                             class="btn sales-icon-btn sales-icon-btn-warning" title="Imprimir venta">
                                             <i class="fas fa-print"></i>
                                          </button>
                                          <button type="button" title="Consultar venta"
                                             @click="ConsultarVenta(m)"
                                             class="btn sales-icon-btn sales-icon-btn-danger">
                                             <i class="fas fa-info-circle"></i>
                                          </button>
                                       </div>
                                    </td>
                                 </tr>
                                 <tr v-if="!paginatedList.length">
                                    <td colspan="8" class="py-4 text-center sales-empty">
                                       No se encontraron ventas con ese criterio.
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
                              <li class="page-item" v-for="pageNumber in totalPages" :key="`page-${pageNumber}`"
                                 :class="{ active: currentPage === pageNumber }">
                                 <a class="page-link" href="#" @click.prevent="changePage(pageNumber)">{{ pageNumber }}</a>
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
         ventaDetails: {
            detalleFactura: {
               cabecera: {}
            }
         },
         consultedTracking: '',
         selectedVentaContext: null,
         showConsultaDetalle: false,
         showModal: false,
         modalEdit: false,
         modalAnular: false,
         motivo: "",
         tipoAnulacion: "",
         apiUrl: "ventas/operables?scope=all",
         page: "Ventas",
         modulo: "Lista de ventas",
         sucursal: {},
         url_editar: "/cajero/ventas/invoice/",
         searchQuery: '',
         currentPage: 1,
         itemsPerPage: 12,
      };
   },

   computed: {
      filteredList() {
         const term = (this.searchQuery || '').toString().toLowerCase();

         return this.list.filter(item => {
            const tracking = (item?.codigoSeguimiento || '').toString().toLowerCase();
            const clientCode = (item?.cliente?.codigoCliente || '').toString().toLowerCase();
            const clientName = (item?.cliente?.razonSocial || '').toString().toLowerCase();
            const document = (item?.cliente?.documentoIdentidad || '').toString().toLowerCase();

            return tracking.includes(term)
               || clientCode.includes(term)
               || clientName.includes(term)
               || document.includes(term);
         });
      },
      totalPages() {
         return Math.max(1, Math.ceil(this.filteredList.length / this.itemsPerPage));
      },
      paginatedList() {
         if (!Array.isArray(this.filteredList) || !this.filteredList.length) {
            return [];
         }

         const safePage = Math.min(Math.max(Number(this.currentPage) || 1, 1), this.totalPages);
         const safeSize = Math.max(Number(this.itemsPerPage) || 12, 1);
         const start = (safePage - 1) * safeSize;

         return this.filteredList.slice(start, start + safeSize);
      },
      trackedCount() {
         return this.filteredList.filter(item => !!item?.codigoSeguimiento).length;
      },
      missingDocumentCount() {
         return this.filteredList.filter(item => !item?.cliente?.documentoIdentidad).length;
      },
      totalAmount() {
         return this.filteredList.reduce((sum, item) => {
            const amount = Number(item?.total || 0);
            return sum + (Number.isFinite(amount) ? amount : 0);
         }, 0);
      },
      formattedTotalAmount() {
         return this.formatAmount(this.totalAmount);
      },
      consultaCabecera() {
         return this.ventaDetails?.detalleFactura?.cabecera || {};
      },
      consultaDetalle() {
         return this.ventaDetails?.detalleFactura?.detalle || [];
      },
      consultaStatusLabel() {
         const estado = (this.ventaDetails?.estado || '').toString().toUpperCase();
         const labels = {
            PROCESADO: 'Facturada',
            PENDIENTE: 'En proceso',
            OBSERVADO: 'Observada',
            ANULADO: 'Anulada',
         };

         return labels[estado] || (estado || 'Sin estado');
      },
      consultaStatusClass() {
         const estado = (this.ventaDetails?.estado || '').toString().toUpperCase();
         const classes = {
            PROCESADO: 'procesado',
            PENDIENTE: 'recepcionada',
            OBSERVADO: 'observado',
            ANULADO: 'contingencia',
         };

         return classes[estado] || 'desconocido';
      },
      consultaStatusHelp() {
         const estado = (this.ventaDetails?.estado || '').toString().toUpperCase();
         const messages = {
            PROCESADO: 'La factura ya fue confirmada correctamente por SEFE.',
            PENDIENTE: 'La venta sigue en proceso de confirmación.',
            OBSERVADO: 'La factura quedó observada y requiere revisión.',
            ANULADO: 'La factura fue anulada en SEFE.',
         };

         return messages[estado] || 'Resultado devuelto por la consulta manual a SEFE.';
      },
      consultaPdfUrl() {
         const cuf = this.ventaDetails?.cuf;
         if (!cuf || this.consultaStatusLabel !== 'Facturada') return null;
         return `https://sefe.demo.agetic.gob.bo/public/facturas_pdf/${cuf}.pdf`;
      },
      consultaXmlUrl() {
         const xml = this.ventaDetails?.xml;
         const cuf = this.ventaDetails?.cuf;

         if (xml) {
            return `https://sefe.demo.agetic.gob.bo/public/facturas_xml/${xml}`;
         }

         if (cuf && this.consultaStatusLabel === 'Facturada') {
            return `https://sefe.demo.agetic.gob.bo/public/facturas_xml/${cuf}.xml`;
         }

         return null;
      },
      canAnularFactura() {
         const estado = (this.ventaDetails?.estado || '').toString().toUpperCase();
         const cuf = (this.ventaDetails?.cuf || '').toString().trim();

         return Boolean(cuf) && estado === 'PROCESADO';
      }
   },

   watch: {
      searchQuery() {
         this.currentPage = 1;
      },
      totalPages(newValue) {
         if (this.currentPage > newValue) {
            this.currentPage = newValue || 1;
         }
      }
   },

   methods: {
      getClientCode(item) {
         return item?.cliente?.codigoCliente || 'SIN CODIGO';
      },
      getClientName(item) {
         return item?.cliente?.razonSocial || 'Cliente no identificado';
      },
      getDocument(item) {
         return item?.cliente?.documentoIdentidad || 'N/A';
      },
      statusLabel(status) {
         return status?.label || 'Sin estado';
      },
      statusClass(status) {
         const key = status?.key || '';
         const classes = {
            PROCESADO: 'procesado',
            RECEPCIONADA: 'recepcionada',
            CONTINGENCIA_CREADA: 'contingencia',
            OBSERVADO: 'observado',
            PENDIENTE_CONFIRMACION: 'recepcionada',
            PENDIENTE: 'pendiente',
         };

         return classes[key] || 'desconocido';
      },
      formatAmount(value) {
         const amount = Number(value || 0);
         if (!Number.isFinite(amount)) return '0.00';
         return amount.toFixed(2);
      },
      changePage(page) {
         if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
         }
      },
      async GET_DATA(path) {
         try {
            const res = await this.$admin.$get(path);
            return res;
         } catch (error) {
            console.error(`Error fetching data from ${path}:`, error);
         }
      },

      async EliminarItem(id) {
         this.load = true;
         try {
            await this.$admin.$delete(`${this.apiUrl}/${id}`);
            const updatedList = await this.GET_DATA(this.apiUrl);
            this.list = updatedList;
         } catch (error) {
            console.error(`Error deleting item ${id}:`, error);
         } finally {
            this.load = false;
         }
      },

      Eliminar(id) {
         this.$swal
            .fire({
               title: "Deseas Eliminar?",
               showDenyButton: false,
               showCancelButton: true,
               confirmButtonText: "Eliminar",
               cancelButtonText: `Cancelar`,
            })
            .then(async (result) => {
               if (result.isConfirmed) {
                  await this.EliminarItem(id);
               }
            });
      },

      async ImprimirVenta(venta) {
         try {
            let sucursal = this.sucursal;
            sucursal.venta = venta;
            const res = await this.$printer.$post(`${sucursal.impresora_url}venta`, sucursal);
            console.log('Impresión de venta:', res);
         } catch (error) {
            console.error('Error al imprimir venta:', error);
         }
      },

      async ConsultarVenta(item) {
         try {
            this.consultedTracking = item?.codigoSeguimiento || '';
            this.selectedVentaContext = item || null;
            this.showConsultaDetalle = false;
            const res = await this.$admin.$get(`ventas/consultar/${this.consultedTracking}`);
            console.log('Respuesta completa del API:', res);
            this.ventaDetails = res;
            this.list = await this.GET_DATA(this.apiUrl);
            this.modalEdit = true;
         } catch (error) {
            console.error('Error al consultar venta:', error);
         }
      },

      toggleConsultaDetalle() {
         this.showConsultaDetalle = !this.showConsultaDetalle;
      },

      toggleAnulacionPanel() {
         this.modalAnular = !this.modalAnular;

         if (!this.modalAnular) {
            this.motivo = '';
            this.tipoAnulacion = '';
         }
      },

      redirectTo(id) {
         this.$router.push(`${this.url_editar}${id}`);
      },

      showAnularModal(cuf = null) {
         if (cuf) {
            this.ventaDetails.cuf = cuf;
         }

         this.motivo = '';
         this.tipoAnulacion = '';
         this.modalAnular = true;
      },
      extractErrorMessages(error) {
         const messages = [];
         const data = error?.response?.data || {};

         if (data.message) {
            messages.push(data.message);
         }

         if (data.error) {
            messages.push(data.error);
         }

         if (data.errors && typeof data.errors === 'object') {
            Object.values(data.errors).flat().forEach(message => messages.push(message));
         }

         if (data.details?.datos?.errores && Array.isArray(data.details.datos.errores)) {
            data.details.datos.errores.forEach(message => messages.push(message));
         }

         if (data.details && typeof data.details === 'string') {
            messages.push(data.details);
         }

         return [...new Set(messages.filter(Boolean))];
      },
      validateAnulacionForm() {
         const errors = [];
         const motivo = (this.motivo || '').trim();
         const tipoAnulacion = String(this.tipoAnulacion || '').trim();

         if (!motivo) {
            errors.push('El motivo de anulación es obligatorio.');
         } else if (!/^[A-Za-z0-9\s\-_.\/;,\\]+$/.test(motivo)) {
            errors.push('El motivo de anulación contiene caracteres no permitidos por el protocolo.');
         }

         if (!['1', '2', '3', '4'].includes(tipoAnulacion)) {
            errors.push('Debe seleccionar un tipo de anulación válido.');
         }

         if (errors.length) {
            this.$swal.fire({
               icon: 'error',
               title: 'La anulación no cumple las validaciones',
               html: `<ul style="text-align:left;">${errors.map(error => `<li>${error}</li>`).join('')}</ul>`,
            });
            return false;
         }

         return true;
      },

      async AnularFactura() {
         if (!this.validateAnulacionForm()) return;

         try {
            const res = await this.$admin.$patch(`ventas/anular/${this.ventaDetails.cuf}`, {
               motivo: this.motivo.trim(),
               tipoAnulacion: Number(this.tipoAnulacion)
            });

            this.$swal.fire('Éxito', res?.message || 'La factura ha sido anulada correctamente.', 'success');

            this.modalAnular = false;
            this.motivo = '';
            this.tipoAnulacion = '';

            const refreshedConsulta = await this.$admin.$get(`ventas/consultar/${this.consultedTracking}`);
            this.ventaDetails = refreshedConsulta;
            this.list = await this.GET_DATA(this.apiUrl);

         } catch (error) {
            console.error('Error al anular factura:', error);
            const messages = this.extractErrorMessages(error);
            this.$swal.fire({
               icon: 'error',
               title: 'Hubo un problema al anular la factura.',
               html: messages.length
                  ? `<ul style="text-align:left;">${messages.map(message => `<li>${message}</li>`).join('')}</ul>`
                  : null,
               text: messages.length ? null : 'Revise los datos enviados o la respuesta del servicio.',
            });
         }
      }
   },

   mounted() {
      this.$nextTick(async () => {
         try {
            const data = await this.GET_DATA(this.apiUrl);
            this.list = Array.isArray(data) ? data : [];
         } catch (error) {
            console.error('Error al montar los datos:', error);
         } finally {
            this.load = false;
         }
      });
   },
};
</script>

<style scoped>
.sales-modal-backdrop {
   position: fixed;
   inset: 0;
   background: rgba(15, 23, 42, 0.38);
   backdrop-filter: blur(2px);
   z-index: 2050;
}

.sales-modal-visible {
   z-index: 2060;
}

.sales-modal-visible .modal-dialog {
   margin: 2rem 2rem 2rem auto;
   max-width: min(1180px, calc(100vw - 420px));
}

.sales-consult-modal {
   border-radius: 24px;
   overflow: hidden;
   border: 1px solid rgba(220, 228, 238, 0.95);
   box-shadow: 0 30px 70px rgba(15, 23, 42, 0.16);
}

.sales-consult-body {
   max-height: 78vh;
   overflow-y: auto;
   padding: 1.5rem;
}

.sales-consult-header {
   display: flex;
   align-items: flex-start;
   justify-content: space-between;
   gap: 1rem;
}

.sales-consult-card {
   height: 100%;
   padding: 1rem 1.1rem;
   border-radius: 18px;
   background: #fffaf0;
   border: 1px solid rgba(234, 205, 132, 0.35);
}

.sales-consult-label {
   display: block;
   margin-bottom: 0.45rem;
   font-size: 0.76rem;
   font-weight: 800;
   letter-spacing: 0.08em;
   text-transform: uppercase;
   color: #9a6c07;
}

.sales-consult-card strong {
   color: #24324d;
   font-size: 1rem;
}

.sales-consult-actions {
   display: flex;
   flex-wrap: wrap;
   gap: 0.75rem;
}

.sales-consult-detail {
   padding: 1rem 1.1rem;
   border-radius: 18px;
   background: #f8fafc;
   border: 1px solid rgba(221, 228, 236, 0.95);
}

.sales-anular-panel {
   padding: 1.25rem;
   border-radius: 20px;
   background: linear-gradient(180deg, #fff8f8 0%, #fff 100%);
   border: 1px solid rgba(248, 184, 184, 0.65);
   box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.sales-anular-head {
   display: flex;
   align-items: flex-start;
   justify-content: space-between;
   gap: 1rem;
}

.sales-form-label {
   font-weight: 800;
   color: #425375;
}

.sales-form-control {
   min-height: 50px;
   border-radius: 14px;
}

.sales-anular-actions {
   display: flex;
   justify-content: flex-end;
   gap: 0.75rem;
   flex-wrap: wrap;
}

.sales-consult-item {
   display: flex;
   flex-wrap: wrap;
   gap: 0.75rem;
   padding: 0.7rem 0;
   border-bottom: 1px solid rgba(221, 228, 236, 0.95);
   color: #51627f;
}

.sales-consult-item:last-child {
   border-bottom: 0;
}

.sales-break {
   word-break: break-all;
}

.sales-hero {
   border-radius: 24px;
   background:
      radial-gradient(circle at top right, rgba(255, 216, 79, 0.22), transparent 26%),
      linear-gradient(135deg, #ffffff 0%, #fffaf0 100%);
}

.sales-hero-head {
   display: flex;
   align-items: flex-start;
   justify-content: space-between;
   gap: 1rem;
}

.sales-kicker {
   color: #b78916;
   font-size: 0.8rem;
   font-weight: 800;
   letter-spacing: 0.12em;
   text-transform: uppercase;
}

.sales-title {
   color: #24324d;
   font-weight: 800;
}

.sales-subtitle {
   color: #6b7a90;
   max-width: 760px;
}

.sales-badge {
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

.sales-search-wrap {
   position: relative;
}

.sales-search-wrap i {
   position: absolute;
   left: 16px;
   top: 50%;
   transform: translateY(-50%);
   color: #94a3b8;
}

.sales-search {
   height: 54px;
   padding-left: 46px !important;
   border-radius: 16px !important;
}

.sales-stat {
   padding: 1rem 1.1rem;
   border-radius: 18px;
   background: rgba(255, 255, 255, 0.84);
   border: 1px solid rgba(223, 230, 240, 0.92);
}

.sales-stat-label {
   display: block;
   color: #7b8aa3;
   font-size: 0.84rem;
   font-weight: 700;
   margin-bottom: 0.35rem;
}

.sales-stat strong {
   color: #22314d;
   font-size: 1.5rem;
   font-weight: 800;
}

.sales-card {
   border-radius: 24px;
}

.sales-table-wrap {
   border-radius: 18px;
   overflow-x: auto;
   overflow-y: hidden;
   padding-bottom: 0.35rem;
   -webkit-overflow-scrolling: touch;
}

.sales-table {
   margin-bottom: 0;
   min-width: 980px;
}

.sales-row-index {
   color: #94a3b8;
   font-weight: 700;
}

.sales-date,
.sales-document {
   color: #4b5b76;
   font-weight: 600;
}

.sales-client-block {
   display: flex;
   flex-direction: column;
   gap: 0.18rem;
}

.sales-client-block strong {
   color: #24324d;
}

.sales-client-block small {
   color: #94a3b8;
   font-weight: 700;
}

.sales-tracking {
   display: inline-flex;
   align-items: center;
   padding: 0.48rem 0.8rem;
   border-radius: 999px;
   background: #f8fafc;
   color: #334155;
   font-family: Consolas, Monaco, monospace;
   font-weight: 700;
}

.sales-total {
   display: inline-flex;
   align-items: center;
   justify-content: center;
   padding: 0.46rem 0.8rem;
   border-radius: 999px;
   background: #ecfdf3;
   color: #157347;
   font-weight: 800;
}

.sales-status {
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

.sales-status.procesado {
   background: #ecfdf3;
   color: #157347;
}

.sales-status.recepcionada {
   background: #eff6ff;
   color: #1d4ed8;
}

.sales-status.contingencia {
   background: #fff8e1;
   color: #a16207;
}

.sales-status.observado {
   background: #fff5f5;
   color: #c2410c;
}

.sales-status.pendiente,
.sales-status.desconocido {
   background: #f1f5f9;
   color: #475569;
}

.sales-action-group {
   display: flex;
   gap: 0.45rem;
   flex-wrap: wrap;
}

.sales-icon-btn {
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

.sales-icon-btn-info {
   background: linear-gradient(135deg, #22c1dc 0%, #0891b2 100%);
}

.sales-icon-btn-warning {
   background: linear-gradient(135deg, #f9dd74 0%, #f7c94b 100%);
   color: #5b4300;
}

.sales-icon-btn-danger {
   background: linear-gradient(135deg, #ff4d4f 0%, #dc2626 100%);
}

.sales-empty {
   color: #7b8aa3;
   font-weight: 700;
}

@media (max-width: 991px) {
   .sales-modal-visible .modal-dialog {
      margin: 1rem auto;
      max-width: calc(100vw - 2rem);
   }

   .sales-hero-head {
      flex-direction: column;
   }
}
</style>
