<template>
   <div>
      <JcLoader :load="load" />
      <AdminTemplate :page="page" :modulo="modulo">
         <div slot="body" class="protocol-page">
            <div class="hero-card card mb-4">
               <div class="card-body">
                  <div class="row align-items-center">
                     <div class="col-12 col-xl-7 mb-3 mb-xl-0">
                        <p class="eyebrow mb-2">Facturación Empresarial</p>
                        <h2 class="hero-title mb-2">Enviar Ventas de Forma Fácil</h2>
                        <p class="hero-copy mb-0">
                           Esta pantalla está pensada para uso diario. Solo busca la venta, selecciónala y usa el botón
                           que necesites. El sistema se encarga del envío automáticamente.
                        </p>
                     </div>
                     <div class="col-12 col-xl-5">
                        <div class="row g-3">
                           <div class="col-6">
                              <div class="metric-card">
                                 <span class="metric-label">Ventas Cargadas</span>
                                 <strong class="metric-value">{{ operables.length }}</strong>
                              </div>
                           </div>
                           <div class="col-6">
                              <div class="metric-card">
                                 <span class="metric-label">Seleccionadas</span>
                                 <strong class="metric-value">{{ selectedVentaIds.length }}</strong>
                              </div>
                           </div>
                           <div class="col-6">
                              <div class="metric-card">
                                 <span class="metric-label">Pendientes</span>
                                 <strong class="metric-value">{{ summary.pending }}</strong>
                              </div>
                           </div>
                           <div class="col-6">
                              <div class="metric-card">
                                 <span class="metric-label">Observadas</span>
                                 <strong class="metric-value">{{ summary.observed }}</strong>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div class="card mb-4 guide-card">
               <div class="card-body">
                  <div class="guide-grid">
                     <div class="guide-step">
                        <span class="guide-number">1</span>
                        <div>
                           <strong>Busca la venta</strong>
                           <p class="mb-0">Puedes buscar por nombre del cliente, documento o código.</p>
                        </div>
                     </div>
                     <div class="guide-step">
                        <span class="guide-number">2</span>
                        <div>
                           <strong>Selecciona una o varias</strong>
                           <p class="mb-0">Marca la casilla de las ventas que quieres trabajar.</p>
                        </div>
                     </div>
                     <div class="guide-step">
                        <span class="guide-number">3</span>
                        <div>
                           <strong>Haz clic en el botón</strong>
                           <p class="mb-0">Usa “Enviar ventas”, “Revisar estado” o “Enviar por contingencia”.</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div class="row mb-4">
               <div class="col-12 col-xl-8 mb-3 mb-xl-0">
                  <div class="card h-100">
                     <div class="card-body">
                        <div class="toolbar-grid">
                           <div>
                              <label class="form-label subtle-label">Paso 1. Buscar ventas</label>
                              <input v-model.trim="searchVentas" type="text" class="form-control"
                                 placeholder="Ejemplo: Juan Perez, 12345678 o venta-0001" />
                           </div>
                           <div>
                              <label class="form-label subtle-label">Qué deseas ver</label>
                              <select v-model="scope" class="form-control" @change="loadOperables">
                                 <option value="actionable">Solo ventas listas para trabajar</option>
                                 <option value="all">Todas las ventas</option>
                              </select>
                           </div>
                           <div>
                              <label class="form-label subtle-label">Paso 2. Seleccionar</label>
                              <button class="btn btn-outline-dark w-100" @click="toggleVisibleSelectionByButton">
                                 {{ allVisibleSelected ? 'Quitar selección visible' : 'Seleccionar las visibles' }}
                              </button>
                           </div>
                           <div>
                              <label class="form-label subtle-label">Actualizar datos</label>
                              <button class="btn btn-dark w-100" @click="loadOperables">
                                 Volver a cargar
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div class="col-12 col-xl-4">
                  <div class="card h-100 quick-actions-card">
                     <div class="card-body">
                        <p class="quick-title mb-3">Paso 3. Elegir acción</p>
                        <div class="d-grid gap-2">
                           <button class="btn btn-success" :disabled="!selectedVentaIds.length"
                              @click="emitirSeleccionadas('auto')">
                              Enviar ventas
                           </button>
                           <button class="btn btn-outline-primary" :disabled="!selectedVentaIds.length"
                              @click="consultarSeleccionadas">
                              Revisar estado de las seleccionadas
                           </button>
                           <button class="btn btn-outline-warning" :disabled="!selectedVentaIds.length"
                              @click="openCafcModal">
                              Enviar por contingencia
                           </button>
                        </div>
                        <p class="quick-help mt-3 mb-0">
                           Si seleccionas una sola venta, el sistema la envía sola. Si seleccionas varias, el sistema
                           intenta enviarlas juntas automáticamente.
                        </p>
                     </div>
                  </div>
               </div>
            </div>

            <div class="card mb-4">
               <div class="card-header border-0 pb-0 d-flex flex-wrap gap-2 justify-content-between align-items-center">
                  <div>
                     <h5 class="mb-1">Lista de Ventas</h5>
                     <p class="text-sm text-muted mb-0">Aquí aparecen las ventas que puedes revisar o enviar.</p>
                  </div>
                  <div class="selection-pill">
                     {{ selectedVentaIds.length }} seleccionada(s)
                  </div>
               </div>
               <div class="card-body">
                  <div class="table-responsive">
                     <table class="table protocol-table align-middle">
                        <thead>
                           <tr>
                              <th class="text-center" style="width: 50px;">
                                 <input type="checkbox" :checked="allVisibleSelected" @change="toggleVisibleSelection($event)" />
                              </th>
                              <th>Registro</th>
                              <th>Cliente</th>
                              <th>Total</th>
                              <th>Código de seguimiento</th>
                              <th>Estado</th>
                              <th class="text-end">Qué puedes hacer</th>
                           </tr>
                        </thead>
                        <tbody>
                           <tr v-for="venta in filteredOperables" :key="venta.id">
                              <td class="text-center">
                                 <input type="checkbox" :value="venta.id" v-model="selectedVentaIds" />
                              </td>
                              <td>
                                 <div class="fw-bold">#{{ venta.id }}</div>
                                 <div class="text-sm text-muted">{{ venta.fecha }}</div>
                                 <div class="text-xs text-muted">Orden: {{ venta.codigoOrden }}</div>
                              </td>
                              <td>
                                 <div class="fw-semibold">{{ venta.cliente?.razonSocial || 'Cliente no registrado' }}</div>
                                 <div class="text-sm text-muted">
                                    Documento: {{ venta.cliente?.documentoIdentidad || 'N/D' }}
                                 </div>
                                 <div class="text-xs text-muted">
                                    Código: {{ venta.cliente?.codigoCliente || 'N/D' }}
                                 </div>
                              </td>
                              <td>
                                 <div class="fw-semibold">{{ formatAmount(venta.total) }}</div>
                                 <div class="text-xs text-muted">
                                    Sucursal {{ venta.codigoSucursal }} | Punto {{ venta.puntoVenta }}
                                 </div>
                              </td>
                              <td>
                                 <span class="tracking-chip">{{ venta.codigoSeguimiento }}</span>
                              </td>
                              <td>
                                 <span class="status-chip" :class="statusClass(venta.status?.key)">
                                    {{ venta.status?.label || 'Sin estado' }}
                                 </span>
                              </td>
                              <td class="text-end">
                                 <div class="d-flex flex-wrap gap-2 justify-content-end">
                                    <button class="btn btn-sm btn-outline-success"
                                       :disabled="!venta.status?.can_emit"
                                       @click="runSingleAction('emit', venta)">
                                       Enviar
                                    </button>
                                    <button class="btn btn-sm btn-outline-primary"
                                       :disabled="!venta.status?.can_consult"
                                       @click="runSingleAction('consult', venta)">
                                       Revisar
                                    </button>
                                    <button class="btn btn-sm btn-outline-warning"
                                       :disabled="!venta.status?.can_cafc"
                                       @click="runSingleAction('cafc', venta)">
                                       Contingencia
                                    </button>
                                    <button class="btn btn-sm btn-outline-secondary"
                                       @click="focusResponse(venta)">
                                       Detalle
                                    </button>
                                 </div>
                              </td>
                           </tr>
                           <tr v-if="!filteredOperables.length">
                              <td colspan="7" class="empty-state-cell">
                                 <div class="empty-title">No hay ventas para mostrar</div>
                                 <div class="empty-copy">Prueba cambiando la búsqueda o la vista de ventas.</div>
                              </td>
                           </tr>
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>

            <div class="row">
               <div class="col-12 col-xl-7 mb-4 mb-xl-0">
                  <div class="card h-100">
                     <div class="card-header border-0 pb-0 d-flex justify-content-between align-items-center">
                        <div>
                           <h5 class="mb-1">Resultado</h5>
                           <p class="text-sm text-muted mb-0">Aquí verás la respuesta del sistema después de cada acción.</p>
                        </div>
                        <button class="btn btn-outline-dark btn-sm mb-0" @click="clearResponse">
                           Limpiar resultado
                        </button>
                     </div>
                     <div class="card-body">
                        <pre class="response-box">{{ formattedResponse }}</pre>
                     </div>
                  </div>
               </div>

               <div class="col-12 col-xl-5">
                  <div class="card h-100 advanced-card">
                     <div class="card-header border-0 pb-0">
                        <h5 class="mb-1">Opciones Avanzadas</h5>
                        <p class="text-sm text-muted mb-0">
                           Esta parte es solo para soporte o casos especiales. En el trabajo diario normalmente no la necesitarás.
                        </p>
                     </div>
                     <div class="card-body">
                        <div class="mb-3">
                           <button class="btn btn-outline-dark w-100" @click="showAdvanced = !showAdvanced">
                              {{ showAdvanced ? 'Ocultar opciones avanzadas' : 'Mostrar opciones avanzadas' }}
                           </button>
                        </div>

                        <div v-if="showAdvanced">
                           <div class="advanced-block">
                              <label class="form-label subtle-label">Consultar paquete manualmente</label>
                              <div class="d-flex gap-2">
                                 <input v-model.trim="consultaPaquete.codigo" type="text" class="form-control"
                                    placeholder="Pega aquí el código del paquete" />
                                 <button class="btn btn-dark" @click="consultarPaquete">Revisar</button>
                              </div>
                           </div>

                           <div class="advanced-block">
                              <label class="form-label subtle-label">Envío masivo manual</label>
                              <textarea v-model="masiva.facturasJson" class="form-control code-box" rows="8"></textarea>
                              <button class="btn btn-primary w-100 mt-2" @click="emitirMasiva">Enviar manualmente</button>
                           </div>

                           <div class="advanced-block mb-0">
                              <label class="form-label subtle-label">Contingencia manual</label>
                              <div class="row">
                                 <div class="col-12 col-md-4 mb-2">
                                    <input v-model.trim="cafc.cafc" type="text" class="form-control" placeholder="CAFC" />
                                 </div>
                                 <div class="col-12 col-md-4 mb-2">
                                    <input v-model="cafc.fechaInicio" type="text" class="form-control"
                                       placeholder="Fecha Inicio" />
                                 </div>
                                 <div class="col-12 col-md-4 mb-2">
                                    <input v-model="cafc.fechaFin" type="text" class="form-control"
                                       placeholder="Fecha Fin" />
                                 </div>
                              </div>
                              <textarea v-model="cafc.facturasJson" class="form-control code-box" rows="8"></textarea>
                              <button class="btn btn-warning w-100 mt-2" @click="emitirContingenciaCafc">
                                 Enviar contingencia manual
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div class="modal fade" :class="showCafcSelectionModal ? 'show d-block' : ''" tabindex="-1"
               role="dialog" aria-hidden="true">
               <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
                  <div class="modal-content cafc-modal">
                     <div class="modal-header border-0">
                        <div>
                           <h5 class="modal-title mb-1">Enviar por Contingencia</h5>
                           <p class="text-sm text-muted mb-0">Completa estos datos solo si la venta debe regularizarse por contingencia.</p>
                        </div>
                        <button type="button" class="btn-close" @click="showCafcSelectionModal = false"></button>
                     </div>
                     <div class="modal-body">
                        <div class="row mb-3">
                           <div class="col-12 col-md-4 mb-2">
                              <label class="form-label subtle-label">Código CAFC</label>
                              <input v-model.trim="cafcSelection.cafc" type="text" class="form-control" />
                           </div>
                           <div class="col-12 col-md-4 mb-2">
                              <label class="form-label subtle-label">Inicio del evento</label>
                              <input v-model="cafcSelection.fechaInicio" type="text" class="form-control"
                                 placeholder="2026-03-18 08:00:00" />
                           </div>
                           <div class="col-12 col-md-4 mb-2">
                              <label class="form-label subtle-label">Fin del evento</label>
                              <input v-model="cafcSelection.fechaFin" type="text" class="form-control"
                                 placeholder="2026-03-18 12:00:00" />
                           </div>
                        </div>

                        <div class="table-responsive">
                           <table class="table table-bordered align-middle">
                              <thead>
                                 <tr>
                                    <th>Registro</th>
                                    <th>Cliente</th>
                                    <th>Total</th>
                                    <th>Número manual</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 <tr v-for="venta in selectedVentas" :key="venta.id">
                                    <td>#{{ venta.id }}<br><small class="text-muted">{{ venta.codigoOrden }}</small></td>
                                    <td>{{ venta.cliente?.razonSocial || 'N/D' }}</td>
                                    <td>{{ formatAmount(venta.total) }}</td>
                                    <td>
                                       <input v-model.number="cafcSelection.nroFacturas[venta.id]" type="number" min="1"
                                          class="form-control" />
                                    </td>
                                 </tr>
                              </tbody>
                           </table>
                        </div>
                     </div>
                     <div class="modal-footer border-0">
                        <button type="button" class="btn btn-outline-secondary" @click="showCafcSelectionModal = false">
                           Cancelar
                        </button>
                        <button type="button" class="btn btn-warning" @click="emitirCafcSeleccionadas">
                           Confirmar envío por contingencia
                        </button>
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
         load: false,
         page: 'ventas',
         modulo: 'Operaciones SEFE',
         operables: [],
         selectedVentaIds: [],
         searchVentas: '',
         scope: 'actionable',
         showAdvanced: false,
         lastResponse: null,
         showCafcSelectionModal: false,
         cafcSelection: {
            cafc: '',
            fechaInicio: '',
            fechaFin: '',
            nroFacturas: {},
         },
         consultaPaquete: {
            codigo: '',
         },
         masiva: {
            facturasJson: `[
  {
    "fechaEmision": "2026-03-18 10:00:00",
    "codigoOrden": "M-001",
    "municipio": "LA PAZ",
    "telefono": "2457000",
    "razonSocial": "CLIENTE MASIVO",
    "documentoIdentidad": "12345678",
    "tipoDocumentoIdentidad": 1,
    "complemento": "1A",
    "correo": "cliente@correo.com",
    "codigoCliente": "CLI-M-001",
    "metodoPago": 1,
    "montoTotal": 100,
    "formatoFactura": "pagina",
    "detalle": [
      {
        "actividadEconomica": "841121",
        "codigoSin": "99100",
        "codigo": "SERV-M-001",
        "descripcion": "SERVICIO MASIVO",
        "precioUnitario": 100,
        "cantidad": 1,
        "unidadMedida": 58
      }
    ]
  }
]`,
         },
         cafc: {
            cafc: '',
            fechaInicio: '',
            fechaFin: '',
            facturasJson: `[
  {
    "codigoOrden": "CAFC-001",
    "nroFactura": 1,
    "fechaEmision": "2026-03-18",
    "municipio": "LA PAZ",
    "telefono": "2457000",
    "razonSocial": "CLIENTE CAFC",
    "documentoIdentidad": "12345678",
    "tipoDocumentoIdentidad": 1,
    "complemento": "1A",
    "correo": "cliente@correo.com",
    "codigoCliente": "CLI-C-001",
    "metodoPago": 1,
    "montoTotal": 50,
    "formatoFactura": "pagina",
    "detalle": [
      {
        "actividadEconomica": "841121",
        "codigoSin": "99100",
        "codigo": "SERV-C-001",
        "descripcion": "SERVICIO CAFC",
        "precioUnitario": 50,
        "cantidad": 1,
        "unidadMedida": 58
      }
    ]
  }
]`,
         },
      };
   },
   computed: {
      formattedResponse() {
         return this.lastResponse ? JSON.stringify(this.lastResponse, null, 2) : 'Sin respuesta todavía.';
      },
      filteredOperables() {
         const term = (this.searchVentas || '').toLowerCase();
         if (!term) return this.operables;
         return this.operables.filter(venta => {
            const content = [
               venta.id,
               venta.codigoOrden,
               venta.codigoSeguimiento,
               venta.cliente?.razonSocial,
               venta.cliente?.documentoIdentidad,
               venta.status?.label,
            ].join(' ').toLowerCase();
            return content.includes(term);
         });
      },
      selectedVentas() {
         return this.operables.filter(venta => this.selectedVentaIds.includes(venta.id));
      },
      allVisibleSelected() {
         return this.filteredOperables.length > 0
            && this.filteredOperables.every(venta => this.selectedVentaIds.includes(venta.id));
      },
      summary() {
         return this.operables.reduce((acc, venta) => {
            const key = venta.status?.key;
            if (key === 'PENDIENTE') acc.pending += 1;
            if (key === 'OBSERVADO') acc.observed += 1;
            return acc;
         }, { pending: 0, observed: 0 });
      },
   },
   methods: {
      formatAmount(value) {
         const number = Number(value || 0);
         return `${number.toFixed(2)} Bs`;
      },
      statusClass(status) {
         const map = {
            PENDIENTE: 'chip-pending',
            OBSERVADO: 'chip-observed',
            PROCESADO: 'chip-success',
            CONTINGENCIA_CREADA: 'chip-contingency',
            ENVIADO_SIN_NOTIFICACION: 'chip-info',
         };
         return map[status] || 'chip-neutral';
      },
      clearResponse() {
         this.lastResponse = null;
      },
      focusResponse(venta) {
         this.lastResponse = venta;
      },
      toggleVisibleSelection(event) {
         const checked = event.target.checked;
         const visibleIds = this.filteredOperables.map(venta => venta.id);
         if (checked) {
            this.selectedVentaIds = [...new Set([...this.selectedVentaIds, ...visibleIds])];
            return;
         }
         this.selectedVentaIds = this.selectedVentaIds.filter(id => !visibleIds.includes(id));
      },
      toggleVisibleSelectionByButton() {
         if (this.allVisibleSelected) {
            this.selectedVentaIds = this.selectedVentaIds.filter(id =>
               !this.filteredOperables.some(venta => venta.id === id)
            );
            return;
         }
         this.selectedVentaIds = [...new Set([
            ...this.selectedVentaIds,
            ...this.filteredOperables.map(venta => venta.id),
         ])];
      },
      parseJsonField(label, value) {
         try {
            return JSON.parse(value);
         } catch (error) {
            this.$swal.fire({
               icon: 'error',
               title: `${label} inválido`,
               text: 'Revise la estructura JSON antes de enviar.',
            });
            return null;
         }
      },
      showResponse(response) {
         this.lastResponse = response;
      },
      collectMessages(error) {
         const messages = [];
         const data = error?.response?.data || {};

         if (data.message) messages.push(data.message);
         if (data.error) messages.push(data.error);
         if (data.details) messages.push(typeof data.details === 'string' ? data.details : JSON.stringify(data.details));
         if (data.errors && typeof data.errors === 'object') {
            Object.values(data.errors).flat().forEach(message => messages.push(message));
         }

         return [...new Set(messages.filter(Boolean))];
      },
      async loadOperables() {
         this.load = true;
         try {
            const response = await this.$admin.$get(`ventas/operables?scope=${this.scope}`);
            this.operables = Array.isArray(response) ? response : [];
            this.selectedVentaIds = this.selectedVentaIds.filter(id => this.operables.some(venta => venta.id === id));
         } catch (error) {
            this.$swal.fire('Error', this.collectMessages(error).join('\n') || 'No se pudo cargar las ventas operables.', 'error');
         } finally {
            this.load = false;
         }
      },
      async emitirSeleccionadas(modo) {
         if (!this.selectedVentaIds.length) {
            this.$swal.fire('Error', 'Debe seleccionar al menos una venta.', 'error');
            return;
         }

         this.load = true;
         try {
            const response = await this.$admin.$post('ventas/emitir-seleccion', {
               venta_ids: this.selectedVentaIds,
               modo,
            });
            this.showResponse(response);
            this.$swal.fire('Éxito', response?.message || 'Ventas enviadas correctamente.', 'success');
            await this.loadOperables();
         } catch (error) {
            this.showResponse(error?.response?.data || { error: error.message });
            this.$swal.fire('Error', this.collectMessages(error).join('\n') || 'No se pudo emitir la selección.', 'error');
         } finally {
            this.load = false;
         }
      },
      async consultarSeleccionadas() {
         if (!this.selectedVentaIds.length) {
            this.$swal.fire('Error', 'Debe seleccionar al menos una venta.', 'error');
            return;
         }

         this.load = true;
         try {
            const response = await this.$admin.$post('ventas/consultar-seleccion', {
               venta_ids: this.selectedVentaIds,
            });
            this.showResponse(response);
         } catch (error) {
            this.showResponse(error?.response?.data || { error: error.message });
            this.$swal.fire('Error', this.collectMessages(error).join('\n') || 'No se pudo consultar la selección.', 'error');
         } finally {
            this.load = false;
         }
      },
      openCafcModal(singleVenta = null) {
         const ventas = singleVenta ? [singleVenta] : this.selectedVentas;
         if (!ventas.length) {
            this.$swal.fire('Error', 'Debe seleccionar al menos una venta.', 'error');
            return;
         }

         if (singleVenta) {
            this.selectedVentaIds = [singleVenta.id];
         }

         const nextNumbers = {};
         ventas.forEach((venta, index) => {
            nextNumbers[venta.id] = this.cafcSelection.nroFacturas[venta.id] || (index + 1);
         });
         this.cafcSelection.nroFacturas = nextNumbers;
         this.showCafcSelectionModal = true;
      },
      async emitirCafcSeleccionadas() {
         if (!this.selectedVentaIds.length) {
            this.$swal.fire('Error', 'Debe seleccionar al menos una venta.', 'error');
            return;
         }

         if (!this.cafcSelection.cafc || !this.cafcSelection.fechaInicio || !this.cafcSelection.fechaFin) {
            this.$swal.fire('Error', 'CAFC, fechaInicio y fechaFin son obligatorios.', 'error');
            return;
         }

         this.load = true;
         try {
            const response = await this.$admin.$post('ventas/contingencia-cafc-seleccion', {
               venta_ids: this.selectedVentaIds,
               cafc: this.cafcSelection.cafc,
               fechaInicio: this.cafcSelection.fechaInicio,
               fechaFin: this.cafcSelection.fechaFin,
               nro_facturas: this.cafcSelection.nroFacturas,
            });
            this.showResponse(response);
            this.showCafcSelectionModal = false;
            this.$swal.fire('Éxito', response?.message || 'Contingencia CAFC enviada correctamente.', 'success');
            await this.loadOperables();
         } catch (error) {
            this.showResponse(error?.response?.data || { error: error.message });
            this.$swal.fire('Error', this.collectMessages(error).join('\n') || 'No se pudo enviar la contingencia CAFC.', 'error');
         } finally {
            this.load = false;
         }
      },
      async runSingleAction(action, venta) {
         if (action === 'emit') {
            this.selectedVentaIds = [venta.id];
            await this.emitirSeleccionadas('individual');
            return;
         }

         if (action === 'consult') {
            this.selectedVentaIds = [venta.id];
            await this.consultarSeleccionadas();
            return;
         }

         if (action === 'cafc') {
            this.openCafcModal(venta);
         }
      },
      async consultarPaquete() {
         if (!this.consultaPaquete.codigo) {
            this.$swal.fire('Error', 'Debe ingresar el código de seguimiento del paquete.', 'error');
            return;
         }

         this.load = true;
         try {
            const response = await this.$admin.$get(`ventas/consultar-paquete/${this.consultaPaquete.codigo}`);
            this.showResponse(response);
         } catch (error) {
            this.showResponse(error?.response?.data || { error: error.message });
            this.$swal.fire('Error', this.collectMessages(error).join('\n') || 'No se pudo consultar el paquete.', 'error');
         } finally {
            this.load = false;
         }
      },
      async emitirMasiva() {
         const facturas = this.parseJsonField('Facturas JSON de emisión masiva', this.masiva.facturasJson);
         if (!facturas) return;

         this.load = true;
         try {
            const response = await this.$admin.$post('ventas/masiva', {
               codigoSucursal: 0,
               puntoVenta: 0,
               documentoSector: 1,
               facturas,
            });
            this.showResponse(response);
            this.$swal.fire('Éxito', response?.mensaje || 'Solicitud masiva enviada correctamente.', 'success');
         } catch (error) {
            this.showResponse(error?.response?.data || { error: error.message });
            this.$swal.fire('Error', this.collectMessages(error).join('\n') || 'No se pudo enviar la emisión masiva.', 'error');
         } finally {
            this.load = false;
         }
      },
      async emitirContingenciaCafc() {
         const facturas = this.parseJsonField('Facturas JSON de contingencia CAFC', this.cafc.facturasJson);
         if (!facturas) return;

         if (!this.cafc.cafc || !this.cafc.fechaInicio || !this.cafc.fechaFin) {
            this.$swal.fire('Error', 'CAFC, fechaInicio y fechaFin son obligatorios.', 'error');
            return;
         }

         this.load = true;
         try {
            const response = await this.$admin.$post('ventas/contingencia-cafc', {
               cafc: this.cafc.cafc,
               fechaInicio: this.cafc.fechaInicio,
               fechaFin: this.cafc.fechaFin,
               documentoSector: 1,
               puntoVenta: 0,
               codigoSucursal: 0,
               facturas,
            });
            this.showResponse(response);
            this.$swal.fire('Éxito', response?.mensaje || 'Solicitud de contingencia CAFC enviada correctamente.', 'success');
         } catch (error) {
            this.showResponse(error?.response?.data || { error: error.message });
            this.$swal.fire('Error', this.collectMessages(error).join('\n') || 'No se pudo procesar la contingencia CAFC.', 'error');
         } finally {
            this.load = false;
         }
      },
   },
   mounted() {
      this.$nextTick(async () => {
         await this.loadOperables();
      });
   },
};
</script>

<style scoped>
.protocol-page {
   padding-bottom: 24px;
}

.hero-card {
   border: 0;
   border-radius: 24px;
   background:
      radial-gradient(circle at top right, rgba(214, 177, 106, 0.18), transparent 28%),
      linear-gradient(135deg, #17324d 0%, #0f2235 58%, #243b53 100%);
   color: #fff;
   overflow: hidden;
}

.eyebrow {
   font-size: 12px;
   letter-spacing: 0.12em;
   text-transform: uppercase;
   color: rgba(255, 255, 255, 0.72);
}

.hero-title {
   font-size: 2rem;
   font-weight: 800;
   color: #fff;
}

.hero-copy {
   color: rgba(255, 255, 255, 0.82);
   max-width: 720px;
}

.metric-card {
   border-radius: 18px;
   padding: 16px;
   background: rgba(255, 255, 255, 0.08);
   border: 1px solid rgba(255, 255, 255, 0.12);
   min-height: 92px;
   display: flex;
   flex-direction: column;
   justify-content: space-between;
}

.metric-label {
   font-size: 12px;
   text-transform: uppercase;
   letter-spacing: 0.08em;
   color: rgba(255, 255, 255, 0.68);
}

.metric-value {
   font-size: 2rem;
   font-weight: 800;
   color: #fff;
}

.toolbar-grid {
   display: grid;
   grid-template-columns: repeat(4, minmax(0, 1fr));
   gap: 16px;
}

.subtle-label {
   font-size: 12px;
   font-weight: 700;
   text-transform: uppercase;
   letter-spacing: 0.06em;
   color: #67748e;
}

.quick-actions-card {
   border: 1px solid #dbe4ee;
   border-radius: 20px;
   background: linear-gradient(180deg, #ffffff 0%, #f6f8fb 100%);
}

.guide-card {
   border: 1px solid #e6ecf3;
   border-radius: 20px;
   background: linear-gradient(180deg, #fffdfa 0%, #f8fbff 100%);
}

.guide-grid {
   display: grid;
   grid-template-columns: repeat(3, minmax(0, 1fr));
   gap: 16px;
}

.guide-step {
   display: flex;
   gap: 14px;
   align-items: flex-start;
   padding: 14px;
   border-radius: 16px;
   background: #ffffff;
   border: 1px solid #e8eef5;
}

.guide-step p {
   font-size: 13px;
   color: #67748e;
   line-height: 1.45;
}

.guide-number {
   width: 34px;
   height: 34px;
   border-radius: 50%;
   display: inline-flex;
   align-items: center;
   justify-content: center;
   background: #17324d;
   color: #fff;
   font-weight: 800;
   flex-shrink: 0;
}

.quick-title {
   font-size: 14px;
   font-weight: 800;
   letter-spacing: 0.06em;
   text-transform: uppercase;
   color: #344767;
}

.quick-help {
   font-size: 13px;
   color: #67748e;
   line-height: 1.5;
}

.selection-pill {
   border-radius: 999px;
   padding: 8px 14px;
   background: #eef3f8;
   color: #344767;
   font-size: 12px;
   font-weight: 700;
   letter-spacing: 0.04em;
   text-transform: uppercase;
}

.protocol-table thead th {
   font-size: 11px;
   text-transform: uppercase;
   letter-spacing: 0.08em;
   color: #8392ab;
   border-bottom: 1px solid #e9ecef;
}

.protocol-table tbody td {
   vertical-align: middle;
}

.tracking-chip {
   display: inline-block;
   padding: 8px 10px;
   border-radius: 10px;
   background: #f6f8fb;
   color: #344767;
   font-size: 12px;
   line-height: 1.35;
   word-break: break-word;
}

.status-chip {
   display: inline-flex;
   align-items: center;
   border-radius: 999px;
   padding: 8px 12px;
   font-size: 12px;
   font-weight: 700;
   line-height: 1;
}

.chip-pending {
   background: #eef2f7;
   color: #344767;
}

.chip-observed {
   background: #fdecea;
   color: #b42318;
}

.chip-success {
   background: #e8f7ee;
   color: #027a48;
}

.chip-contingency {
   background: #fff4e5;
   color: #b54708;
}

.chip-info {
   background: #e7f0ff;
   color: #175cd3;
}

.chip-neutral {
   background: #f2f4f7;
   color: #475467;
}

.empty-state-cell {
   text-align: center;
   padding: 40px 16px !important;
}

.empty-title {
   font-weight: 800;
   color: #344767;
   margin-bottom: 6px;
}

.empty-copy {
   font-size: 14px;
   color: #67748e;
}

.response-box,
.code-box {
   font-family: Consolas, Monaco, monospace;
   font-size: 12px;
}

.response-box {
   background: #101a28;
   color: #f8fafc;
   border-radius: 18px;
   padding: 18px;
   min-height: 360px;
   white-space: pre-wrap;
   word-break: break-word;
   margin: 0;
}

.advanced-card,
.cafc-modal {
   border-radius: 22px;
}

.advanced-block {
   padding: 14px;
   border-radius: 16px;
   background: #f8fafc;
   border: 1px solid #e5e7eb;
   margin-bottom: 14px;
}

@media (max-width: 1199px) {
   .toolbar-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
   }

   .guide-grid {
      grid-template-columns: 1fr;
   }
}

@media (max-width: 767px) {
   .hero-title {
      font-size: 1.6rem;
   }

   .toolbar-grid {
      grid-template-columns: 1fr;
   }

   .response-box {
      min-height: 260px;
   }
}
</style>
