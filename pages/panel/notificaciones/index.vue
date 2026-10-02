<template>
   <div>
      <JcLoader :load="load"></JcLoader>
      <AdminTemplate :page="page" :modulo="modulo">
         <div slot="body" class="enterprise-page-shell">
            <div class="row">
               <div class="col-12 mb-4">
                  <div class="card notification-hero enterprise-filter-card">
                     <div class="card-body">
                        <div class="notification-hero-head">
                           <BasePageHeading title="Notificaciones" icon="bell" eyebrow="Centro de seguimiento" description="Revisa emisiones, contingencias y respuestas de facturación." />
                           <div class="notification-toolbar">
                              <div class="notification-badge">
                                 <i class="fas fa-receipt"></i>
                                 <span>{{ filteredList.length }} registros</span>
                              </div>
                              <button type="button" class="notification-toolbar-btn" :disabled="load" @click="refreshData">
                                 <i class="fas fa-sync-alt" :class="{ 'fa-spin': load }"></i>
                                 <span>Actualizar</span>
                              </button>
                              <button type="button" class="notification-toolbar-btn notification-export-btn" :disabled="!filteredList.length" @click="exportCsv">
                                 <i class="fas fa-file-csv"></i>
                                 <span>Exportar CSV</span>
                              </button>
                           </div>
                        </div>
                        <div class="notification-search-wrap mt-4">
                           <i class="fas fa-search"></i>
                           <input
                              v-model="searchQuery"
                              type="text"
                              class="form-control notification-search"
                              :class="{ 'has-clear': searchQuery }"
                              placeholder="Buscar por seguimiento, factura, mensaje, tipo o fuente"
                           >
                           <button v-if="searchQuery" type="button" class="notification-clear-search" aria-label="Limpiar búsqueda" @click="searchQuery = ''">
                              <i class="fas fa-times"></i>
                           </button>
                        </div>
                        <div class="notification-filters">
                           <label class="notification-filter-field">
                              <span>Estado</span>
                              <select v-model="statusFilter" class="form-control">
                                 <option value="">Todos los estados</option>
                                 <option value="EXITO">Éxito</option>
                                 <option value="OBSERVADO">Observado</option>
                                 <option value="CREADO">Creado</option>
                              </select>
                           </label>
                           <label class="notification-filter-field">
                              <span>Tipo</span>
                              <select v-model="typeFilter" class="form-control">
                                 <option value="">Todos los tipos</option>
                                 <option value="CONTINGENCIAS">Contingencias</option>
                                 <option v-for="type in typeOptions" :key="type" :value="type">{{ formatLabel(type) }}</option>
                              </select>
                           </label>
                           <label class="notification-filter-field">
                              <span>Fuente</span>
                              <select v-model="sourceFilter" class="form-control">
                                 <option value="">Todas las fuentes</option>
                                 <option v-for="source in sourceOptions" :key="source" :value="source">{{ source }}</option>
                              </select>
                           </label>
                           <label class="notification-filter-field">
                              <span>Desde</span>
                              <input v-model="dateFrom" type="date" class="form-control">
                           </label>
                           <label class="notification-filter-field">
                              <span>Hasta</span>
                              <input v-model="dateTo" type="date" class="form-control">
                           </label>
                           <button type="button" class="notification-reset-btn" :disabled="!hasActiveFilters" @click="clearFilters">
                              <i class="fas fa-undo-alt"></i>
                              <span>Limpiar</span>
                           </button>
                        </div>
                        <div class="row mt-4 g-3">
                           <div class="col-md-3 col-sm-6">
                              <button type="button" class="notification-stat" :class="{ active: statusFilter === 'EXITO' }" :aria-pressed="statusFilter === 'EXITO'" @click="toggleStatusFilter('EXITO')">
                                 <span class="notification-stat-label">Exitosas</span>
                                 <strong>{{ successCount }}</strong>
                              </button>
                           </div>
                           <div class="col-md-3 col-sm-6">
                              <button type="button" class="notification-stat" :class="{ active: statusFilter === 'OBSERVADO' }" :aria-pressed="statusFilter === 'OBSERVADO'" @click="toggleStatusFilter('OBSERVADO')">
                                 <span class="notification-stat-label">Observadas</span>
                                 <strong>{{ observedCount }}</strong>
                              </button>
                           </div>
                           <div class="col-md-3 col-sm-6">
                              <button type="button" class="notification-stat" :class="{ active: statusFilter === 'CREADO' }" :aria-pressed="statusFilter === 'CREADO'" @click="toggleStatusFilter('CREADO')">
                                 <span class="notification-stat-label">Creadas</span>
                                 <strong>{{ createdCount }}</strong>
                              </button>
                           </div>
                           <div class="col-md-3 col-sm-6">
                              <button type="button" class="notification-stat" :class="{ active: typeFilter === 'CONTINGENCIAS' }" :aria-pressed="typeFilter === 'CONTINGENCIAS'" @click="toggleContingencyFilter">
                                 <span class="notification-stat-label">Contingencias</span>
                                 <strong>{{ contingencyCount }}</strong>
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div class="col-12">
                  <div class="card enterprise-table-card enterprise-content-card">
                     <div class="card-body">
                        <div v-if="filteredList.length" class="table-wrap notification-table-wrap enterprise-table-wrap">
                           <table class="notification-table enterprise-table">
                              <thead>
                                 <tr>
                                    <th>
                                       <button type="button" class="sortable-head" @click="changeSort('id')"><span class="head-label"><i class="fas fa-hashtag"></i><span>#</span></span><i v-if="sortBy === 'id'" class="fas sort-indicator" :class="sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down'"></i></button>
                                    </th>
                                    <th>
                                       <button type="button" class="sortable-head" @click="changeSort('tipo')"><span class="head-label"><i class="fas fa-tags"></i><span>Tipo</span></span><i v-if="sortBy === 'tipo'" class="fas sort-indicator" :class="sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down'"></i></button>
                                    </th>
                                    <th>
                                       <button type="button" class="sortable-head" @click="changeSort('estado')"><span class="head-label"><i class="fas fa-toggle-on"></i><span>Estado</span></span><i v-if="sortBy === 'estado'" class="fas sort-indicator" :class="sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down'"></i></button>
                                    </th>
                                    <th>
                                       <button type="button" class="sortable-head" @click="changeSort('fuente')"><span class="head-label"><i class="fas fa-industry"></i><span>Fuente</span></span><i v-if="sortBy === 'fuente'" class="fas sort-indicator" :class="sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down'"></i></button>
                                    </th>
                                    <th>
                                       <button type="button" class="sortable-head" @click="changeSort('seguimiento')"><span class="head-label"><i class="fas fa-search"></i><span>Seguimiento</span></span><i v-if="sortBy === 'seguimiento'" class="fas sort-indicator" :class="sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down'"></i></button>
                                    </th>
                                    <th>
                                       <button type="button" class="sortable-head" @click="changeSort('fecha')"><span class="head-label"><i class="fas fa-calendar-alt"></i><span>Fecha</span></span><i v-if="sortBy === 'fecha'" class="fas sort-indicator" :class="sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down'"></i></button>
                                    </th>
                                    <th>
                                       <button type="button" class="sortable-head" @click="changeSort('mensaje')"><span class="head-label"><i class="fas fa-comment-dots"></i><span>Mensaje</span></span><i v-if="sortBy === 'mensaje'" class="fas sort-indicator" :class="sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down'"></i></button>
                                    </th>
                                    <th>
                                       <span class="head-label"><i class="fas fa-cog"></i><span>Acciones</span></span>
                                    </th>
                                 </tr>
                              </thead>
                              <tbody>
                                 <tr v-for="(m, i) in paginatedList" :key="m.id">
                                    <td>
                                       <strong class="notification-row-index">{{ (currentPage - 1) * itemsPerPage + i + 1 }}</strong>
                                    </td>
                                    <td>
                                       <span class="notification-chip" :class="tipoClasses[getTipoEmision(m)] || 'tipo-generico'">
                                          {{ getTipoEmision(m) || 'SIN TIPO' }}
                                       </span>
                                    </td>
                                    <td>
                                       <span class="notification-state" :class="estadoClasses[m.estado] || ''">{{ m.estado }}</span>
                                    </td>
                                    <td>
                                       <span class="notification-source">{{ m.fuente }}</span>
                                    </td>
                                    <td>
                                       <div class="notification-tracking">{{ m.codigo_seguimiento }}</div>
                                    </td>
                                    <td>
                                       <strong class="notification-date">{{ m.fecha }}</strong>
                                    </td>
                                    <td>
                                       <div class="notification-message">{{ m.mensaje }}</div>
                                    </td>
                                    <td>
                                       <div class="notification-action-group">
                                          <button
                                             type="button"
                                             @click="openDetail(m)"
                                             class="notification-action"
                                             :class="m.estado === 'OBSERVADO' ? 'notification-action-danger' : 'notification-action-success'"
                                             :title="`Ver detalle de notificación ${m.id}`"
                                             :aria-label="`Ver detalle de notificación ${m.id}`"
                                          >
                                             <i class="fas fa-eye"></i>
                                          </button>
                                       </div>
                                    </td>
                                 </tr>
                              </tbody>
                           </table>

                           <div class="notification-table-footer">
                              <p class="footer-copy">
                                 Mostrando {{ rangeStart }} a {{ rangeEnd }} de {{ filteredList.length }} notificaciones
                              </p>

                              <div class="notification-pager">
                                 <label class="notification-page-size">
                                    <span>Filas</span>
                                    <select v-model.number="itemsPerPage" class="form-control">
                                       <option :value="14">14</option>
                                       <option :value="25">25</option>
                                       <option :value="50">50</option>
                                       <option :value="100">100</option>
                                    </select>
                                 </label>
                                 <button class="pager-btn" type="button" :disabled="currentPage === 1" @click="changePage(1)">
                                    <i class="fas fa-angle-double-left"></i>
                                 </button>
                                 <button class="pager-btn" type="button" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
                                    <i class="fas fa-angle-left"></i>
                                 </button>
                                 <button
                                    v-for="page in visiblePages"
                                    :key="page"
                                    type="button"
                                    class="pager-btn"
                                    :class="{ active: currentPage === page }"
                                    @click="changePage(page)"
                                 >
                                    {{ page }}
                                 </button>
                                 <button class="pager-btn" type="button" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
                                    <i class="fas fa-angle-right"></i>
                                 </button>
                                 <button class="pager-btn" type="button" :disabled="currentPage === totalPages" @click="changePage(totalPages)">
                                    <i class="fas fa-angle-double-right"></i>
                                 </button>
                              </div>
                           </div>
                        </div>

                        <div v-else class="empty-state notification-empty-state">
                           <h3>Sin resultados</h3>
                           <p>No encontramos notificaciones con ese criterio de búsqueda.</p>
                           <button v-if="hasActiveFilters" type="button" class="notification-toolbar-btn" @click="clearFilters">Limpiar filtros</button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
            <div v-if="detailModalOpen" class="notification-modal-backdrop" @click.self="closeDetail" @keydown.esc="closeDetail" tabindex="-1">
               <section class="notification-modal" role="dialog" aria-modal="true" aria-labelledby="notification-modal-title">
                  <header class="notification-modal-header">
                     <div>
                        <span class="notification-modal-eyebrow">Detalle de seguimiento</span>
                        <h2 id="notification-modal-title">Notificación #{{ selectedNotification.id || '—' }}</h2>
                        <p>{{ selectedDetail.tipoEmision ? `Tipo de emisión: ${formatLabel(selectedDetail.tipoEmision)}` : 'Información de la notificación' }}</p>
                     </div>
                     <button type="button" class="notification-modal-close" aria-label="Cerrar detalle" @click="closeDetail"><i class="fas fa-times"></i></button>
                  </header>
                  <div v-if="detailLoading" class="notification-modal-loading"><i class="fas fa-circle-notch fa-spin"></i> Cargando detalle…</div>
                  <div v-else class="notification-modal-body">
                     <div class="notification-modal-summary">
                        <div><span>Estado</span><strong class="notification-modal-state" :class="detailStateClass(selectedNotification.estado)">{{ selectedNotification.estado || 'SIN ESTADO' }}</strong></div>
                        <div><span>Fecha</span><strong>{{ selectedNotification.fecha || 'Sin fecha' }}</strong></div>
                        <div><span>Fuente</span><strong>{{ selectedNotification.fuente || 'Sin fuente' }}</strong></div>
                        <div><span>Seguimiento</span><strong class="notification-modal-mono">{{ selectedNotification.codigo_seguimiento || 'Sin seguimiento' }}</strong></div>
                     </div>
                     <section class="notification-modal-section">
                        <h3>Información principal</h3>
                        <div class="notification-modal-data-grid">
                           <div><span>CUF</span><strong class="notification-modal-mono">{{ selectedDetail.cuf || 'No disponible' }}</strong></div>
                           <div><span>Nro. factura</span><strong>{{ selectedDetail.nroFactura || 'No disponible' }}</strong></div>
                           <div><span>Código de estado de Impuestos</span><strong>{{ selectedDetail.codigoEstadoImpuestos ?? 'No disponible' }}</strong></div>
                           <div class="wide"><span>Mensaje</span><strong>{{ selectedNotification.mensaje || 'Sin mensaje' }}</strong></div>
                           <div class="wide"><span>Observación</span><strong>{{ selectedNotification.observacion || selectedDetail.observacion || 'No hay observaciones' }}</strong></div>
                        </div>
                     </section>
                     <section class="notification-modal-section">
                        <h3>Enlaces y referencias</h3>
                        <div class="notification-modal-links">
                           <div><span>URL PDF</span><a v-if="selectedDetail.urlPdf" :href="selectedDetail.urlPdf" target="_blank" rel="noopener noreferrer">{{ selectedDetail.urlPdf }}</a><strong v-else>No disponible</strong></div>
                           <div><span>URL XML</span><a v-if="selectedDetail.urlXml" :href="selectedDetail.urlXml" target="_blank" rel="noopener noreferrer">{{ selectedDetail.urlXml }}</a><strong v-else>No disponible</strong></div>
                        </div>
                     </section>
                  </div>
                  <footer v-if="!detailLoading" class="notification-modal-footer"><button type="button" class="notification-modal-done" @click="closeDetail">Cerrar</button></footer>
               </section>
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
         statusFilter: '',
         typeFilter: '',
         sourceFilter: '',
         dateFrom: '',
         dateTo: '',
         sortBy: 'fecha',
         sortDirection: 'desc',
         apiUrl: 'notificaciones',
         page: 'Administración',
         modulo: 'Notificaciones',
         currentPage: 1,
         itemsPerPage: 14,
         detailModalOpen: false,
         detailLoading: false,
         selectedNotification: {},
         selectedDetail: {}
      };
   },
   methods: {
      getTipoEmision(notification) {
         if (!notification || !notification.detalle) {
            return '';
         }

         return notification.detalle.tipoEmision || '';
      },
      normalizeText(value) {
         return (value === null || value === undefined ? '' : String(value))
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
      },
      formatLabel(value) {
         return String(value || '').replace(/_/g, ' ');
      },
      toggleStatusFilter(status) {
         this.statusFilter = this.statusFilter === status ? '' : status;
      },
      toggleContingencyFilter() {
         this.typeFilter = this.typeFilter === 'CONTINGENCIAS' ? '' : 'CONTINGENCIAS';
      },
      clearFilters() {
         this.searchQuery = '';
         this.statusFilter = '';
         this.typeFilter = '';
         this.sourceFilter = '';
         this.dateFrom = '';
         this.dateTo = '';
         this.currentPage = 1;
      },
      changePage(page) {
         if (page < 1 || page > this.totalPages) {
            return;
         }

         this.currentPage = page;
      },
      changeSort(column) {
         if (this.sortBy === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
         } else {
            this.sortBy = column;
            this.sortDirection = column === 'fecha' || column === 'id' ? 'desc' : 'asc';
         }
      },
      parseNotificationDate(value) {
         if (!value) {
            return 0;
         }

         const raw = String(value).trim();
         const localDate = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:,?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?)?$/i);
         if (localDate) {
            let hour = Number(localDate[4] || 0);
            const meridiem = (localDate[7] || '').toUpperCase();
            if (meridiem === 'PM' && hour < 12) hour += 12;
            if (meridiem === 'AM' && hour === 12) hour = 0;
            const parsedLocal = new Date(
               Number(localDate[3]), Number(localDate[2]) - 1, Number(localDate[1]),
               hour, Number(localDate[5] || 0), Number(localDate[6] || 0)
            );
            return Number.isNaN(parsedLocal.getTime()) ? 0 : parsedLocal.getTime();
         }
         const normalized = raw.includes(' ') && !raw.includes('T')
            ? raw.replace(' ', 'T')
            : raw;
         const parsed = Date.parse(normalized);

         if (!Number.isNaN(parsed)) {
            return parsed;
         }

         const fallback = new Date(raw);
         return Number.isNaN(fallback.getTime()) ? 0 : fallback.getTime();
      },
      sortNotifications(items) {
         return [...items].sort((a, b) => {
            const dateDiff = this.parseNotificationDate(b?.fecha) - this.parseNotificationDate(a?.fecha);
            if (dateDiff !== 0) {
               return dateDiff;
            }

            return Number(b?.id || 0) - Number(a?.id || 0);
         });
      },
      async GET_DATA(path) {
         const res = await this.$admin.$get(path);
         res.forEach(notification => {
            try {
               notification.detalle = typeof notification.detalle === 'string'
                  ? JSON.parse(notification.detalle)
                  : (notification.detalle || {});
            } catch (e) {
               notification.detalle = {};
            }
         });
         return res;
      },
      async openDetail(notification) {
         this.selectedNotification = { ...notification };
         this.selectedDetail = notification.detalle || {};
         this.detailModalOpen = true;
         this.detailLoading = true;
         try {
            const response = await this.$admin.$get(`notificaciones/${notification.id}`);
            this.selectedNotification = response || { ...notification };
            const detail = this.selectedNotification.detalle;
            if (typeof detail === 'string') {
               try { this.selectedDetail = JSON.parse(detail); } catch (error) { this.selectedDetail = {}; }
            } else {
               this.selectedDetail = detail || {};
            }
         } catch (error) {
            console.error('Error al obtener el detalle de la notificación:', error);
            if (this.$swal) {
               this.$swal.fire({ icon: 'error', title: 'No se pudo cargar el detalle', text: 'Inténtalo de nuevo.' });
            }
         } finally {
            this.detailLoading = false;
         }
      },
      closeDetail() {
         this.detailModalOpen = false;
         this.selectedNotification = {};
         this.selectedDetail = {};
      },
      detailStateClass(state) {
         return { EXITO: 'success', OBSERVADO: 'warning', CREADO: 'info' }[(state || '').toString().toUpperCase()] || 'neutral';
      },
      async refreshData() {
         this.load = true;
         try {
            const response = await this.GET_DATA(this.apiUrl);
            this.list = this.sortNotifications(Array.isArray(response) ? response : []);
            this.currentPage = 1;
         } catch (error) {
            console.error('Error al actualizar notificaciones:', error);
            if (this.$swal) {
               this.$swal.fire({
                  icon: 'error',
                  title: 'No se pudieron actualizar las notificaciones',
                  text: 'Verifica tu conexión e inténtalo de nuevo.'
               });
            }
         } finally {
            this.load = false;
         }
      },
      exportCsv() {
         const columns = [
            ['ID', item => item.id],
            ['Tipo', item => this.getTipoEmision(item)],
            ['Estado', item => item.estado],
            ['Fuente', item => item.fuente],
            ['Seguimiento', item => item.codigo_seguimiento],
            ['Fecha', item => item.fecha],
            ['Factura', item => item.detalle && item.detalle.nroFactura],
            ['CUF', item => item.detalle && item.detalle.cuf],
            ['Mensaje', item => item.mensaje],
            ['Observación', item => item.observacion || (item.detalle && item.detalle.observacion)]
         ];
         const quote = value => {
            let text = String(value === null || value === undefined ? '' : value);
            if (/^\s*[=+\-@]/.test(text)) text = `'${text}`;
            return `"${text.replace(/"/g, '""')}"`;
         };
         const rows = [columns.map(([label]) => quote(label)).join(';')];
         this.sortedFilteredList.forEach(item => {
            rows.push(columns.map(([, getValue]) => quote(getValue(item))).join(';'));
         });

         const blob = new Blob([`\uFEFF${rows.join('\r\n')}`], { type: 'text/csv;charset=utf-8;' });
         const url = URL.createObjectURL(blob);
         const link = document.createElement('a');
         link.href = url;
         link.download = `notificaciones-${new Date().toISOString().slice(0, 10)}.csv`;
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
         setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
   },
   computed: {
      tipoClasses() {
         return {
            EMISION: 'emision',
            ANULACION: 'anulacion',
            MULTIPLE: 'multiple',
            MASIVO: 'masivo',
            CONTINGENCIA: 'contingencia',
            CONTINGENCIA_CAFC: 'contingencia-cafc',
            DOCUMENTO_AJUSTE: 'documento-ajuste',
         };
      },
      estadoClasses() {
         return {
            EXITO: 'exito',
            OBSERVADO: 'observado',
            CREADO: 'creado',
         };
      },
      user() {
         return this.$store.state.auth.user;
      },
      typeOptions() {
         return [...new Set(this.list.map(item => this.getTipoEmision(item)).filter(Boolean))].sort((a, b) => a.localeCompare(b));
      },
      sourceOptions() {
         return [...new Set(this.list.map(item => item.fuente).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
      },
      hasActiveFilters() {
         return Boolean(this.searchQuery || this.statusFilter || this.typeFilter || this.sourceFilter || this.dateFrom || this.dateTo);
      },
      filteredList() {
         const term = this.normalizeText(this.searchQuery);
         const from = this.dateFrom ? new Date(`${this.dateFrom}T00:00:00`).getTime() : null;
         const to = this.dateTo ? new Date(`${this.dateTo}T23:59:59.999`).getTime() : null;
         return this.list.filter(item => {
            const detail = item.detalle || {};
            const searchable = this.normalizeText([
               item.id, item.codigo_seguimiento, item.mensaje, item.estado, item.fuente,
               this.getTipoEmision(item), detail.nroFactura, detail.cuf
            ].join(' '));
            const type = this.getTipoEmision(item);
            const typeMatches = !this.typeFilter || (this.typeFilter === 'CONTINGENCIAS'
               ? type === 'CONTINGENCIA' || type === 'CONTINGENCIA_CAFC'
               : type === this.typeFilter);
            const timestamp = this.parseNotificationDate(item.fecha);
            return (!term || searchable.includes(term))
               && (!this.statusFilter || item.estado === this.statusFilter)
               && typeMatches
               && (!this.sourceFilter || item.fuente === this.sourceFilter)
               && (from === null || (timestamp && timestamp >= from))
               && (to === null || (timestamp && timestamp <= to));
         });
      },
      sortedFilteredList() {
         const direction = this.sortDirection === 'asc' ? 1 : -1;
         return [...this.filteredList].sort((a, b) => {
            let aValue;
            let bValue;
            if (this.sortBy === 'fecha') {
               aValue = this.parseNotificationDate(a.fecha);
               bValue = this.parseNotificationDate(b.fecha);
            } else if (this.sortBy === 'tipo') {
               aValue = this.getTipoEmision(a);
               bValue = this.getTipoEmision(b);
            } else if (this.sortBy === 'seguimiento') {
               aValue = a.codigo_seguimiento;
               bValue = b.codigo_seguimiento;
            } else {
               aValue = a[this.sortBy];
               bValue = b[this.sortBy];
            }
            if (this.sortBy === 'id' || this.sortBy === 'fecha') {
               return (Number(aValue || 0) - Number(bValue || 0)) * direction;
            }
            return String(aValue || '').localeCompare(String(bValue || ''), 'es', { numeric: true, sensitivity: 'base' }) * direction;
         });
      },
      totalPages() {
         return Math.max(1, Math.ceil(this.filteredList.length / this.itemsPerPage));
      },
      paginatedList() {
         const start = (this.currentPage - 1) * this.itemsPerPage;
         const end = start + this.itemsPerPage;
         return this.sortedFilteredList.slice(start, end);
      },
      rangeStart() {
         if (!this.filteredList.length) {
            return 0;
         }

         return ((this.currentPage - 1) * this.itemsPerPage) + 1;
      },
      rangeEnd() {
         return Math.min(this.currentPage * this.itemsPerPage, this.filteredList.length);
      },
      visiblePages() {
         const total = this.totalPages;
         const current = this.currentPage;
         const start = Math.max(1, current - 2);
         const end = Math.min(total, start + 4);
         const pages = [];

         for (let page = start; page <= end; page += 1) {
            pages.push(page);
         }

         return pages;
      },
      successCount() {
         return this.list.filter(item => item.estado === 'EXITO').length;
      },
      observedCount() {
         return this.list.filter(item => item.estado === 'OBSERVADO').length;
      },
      createdCount() {
         return this.list.filter(item => item.estado === 'CREADO').length;
      },
      contingencyCount() {
         return this.list.filter(item => item.detalle?.tipoEmision === 'CONTINGENCIA' || item.detalle?.tipoEmision === 'CONTINGENCIA_CAFC').length;
      }
   },
   watch: {
      searchQuery() { this.currentPage = 1; },
      statusFilter() { this.currentPage = 1; },
      typeFilter() { this.currentPage = 1; },
      sourceFilter() { this.currentPage = 1; },
      dateFrom() { this.currentPage = 1; },
      dateTo() { this.currentPage = 1; },
      itemsPerPage() { this.currentPage = 1; }
   },
   mounted() {
      this.refreshData();
   },
};
</script>

<style scoped>
.notification-hero {
   border-radius: 24px;
   background:
      radial-gradient(circle at top right, rgba(255, 216, 79, 0.22), transparent 26%),
      linear-gradient(135deg, #ffffff 0%, #fffaf0 100%);
}

.notification-hero-head {
   display: flex;
   align-items: flex-start;
   justify-content: space-between;
   gap: 1rem;
}

.notification-kicker {
   color: #b78916;
   font-size: 0.8rem;
   font-weight: 800;
   letter-spacing: 0.12em;
   text-transform: uppercase;
}

.notification-title {
   color: #24324d;
   font-weight: 800;
}

.notification-subtitle {
   color: #6b7a90;
   max-width: 720px;
}

.notification-badge {
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

.notification-toolbar {
   display: flex;
   align-items: center;
   justify-content: flex-end;
   gap: 0.55rem;
   flex-wrap: wrap;
}

.notification-toolbar-btn,
.notification-reset-btn {
   display: inline-flex;
   align-items: center;
   justify-content: center;
   gap: 0.5rem;
   min-height: 42px;
   padding: 0.55rem 0.8rem;
   border: 1px solid #dbe4ef;
   border-radius: 12px;
   background: #fff;
   color: #355174;
   font-size: 0.82rem;
   font-weight: 700;
   transition: border-color 0.15s ease, background 0.15s ease, transform 0.15s ease;
}

.notification-toolbar-btn:hover:not(:disabled),
.notification-reset-btn:hover:not(:disabled) {
   border-color: #9fb9d8;
   background: #f8fbff;
   transform: translateY(-1px);
}

.notification-toolbar-btn:disabled,
.notification-reset-btn:disabled {
   cursor: not-allowed;
   opacity: 0.5;
}

.notification-export-btn {
   border-color: #cce8de;
   color: #14775f;
}

.notification-search-wrap .notification-clear-search {
   position: absolute;
   top: 50%;
   right: 14px;
   transform: translateY(-50%);
   width: 30px;
   height: 30px;
   border: 0;
   border-radius: 8px;
   background: transparent;
   color: #8090a6;
}

.notification-search-wrap .notification-clear-search:hover {
   background: #f1f5f9;
   color: #334155;
}

.notification-search.has-clear {
   padding-right: 48px !important;
}

.notification-filters {
   display: grid;
   grid-template-columns: repeat(3, minmax(130px, 1fr)) repeat(2, minmax(145px, 0.8fr)) auto;
   align-items: end;
   gap: 0.8rem;
   margin-top: 1rem;
}

.notification-filter-field {
   display: grid;
   gap: 0.35rem;
   margin: 0;
   color: #63738d;
   font-size: 0.75rem;
   font-weight: 700;
}

.notification-filter-field .form-control {
   min-width: 0;
   height: 42px;
   border-color: #dbe4ef;
   border-radius: 11px;
   color: #34465f;
   font-size: 0.82rem;
}

.notification-reset-btn {
   color: #63738d;
}

.notification-search-wrap {
   position: relative;
}

.notification-search-wrap > .fa-search {
   position: absolute;
   left: 16px;
   top: 50%;
   transform: translateY(-50%);
   color: #94a3b8;
}

.notification-search {
   height: 54px;
   padding-left: 46px !important;
   border-radius: 16px !important;
}

.notification-stat {
   display: flex;
   width: 100%;
   flex-direction: column;
   align-items: flex-start;
   padding: 1rem 1.1rem;
   border-radius: 18px;
   background: rgba(255, 255, 255, 0.84);
   border: 1px solid rgba(223, 230, 240, 0.92);
   text-align: left;
   font: inherit;
   cursor: pointer;
   transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.notification-stat:hover,
.notification-stat.active {
   border-color: #b9cde4;
   box-shadow: 0 8px 20px rgba(35, 63, 94, 0.08);
   transform: translateY(-1px);
}

.notification-stat-label {
   display: block;
   color: #7b8aa3;
   font-size: 0.84rem;
   font-weight: 700;
   margin-bottom: 0.35rem;
}

.notification-stat strong {
   color: #22314d;
   font-size: 1.5rem;
   font-weight: 800;
}

.notification-table-wrap {
   border: 1px solid #edf1f6;
   border-radius: 16px;
   overflow: hidden;
   background: #ffffff;
}

.notification-table {
   width: 100%;
   min-width: 1120px;
   border-collapse: collapse;
   background: #fff;
}

.notification-table thead th {
   padding: 0.95rem 0.9rem;
   text-align: left;
   font-size: 0.83rem;
   font-weight: 700;
   color: #495468;
   background: linear-gradient(180deg, #ffffff 0%, #fafbfd 100%);
   border-bottom: 1px solid #edf1f6;
}

.sortable-head {
   display: inline-flex;
   align-items: center;
   gap: 0.45rem;
   padding: 0;
   border: 0;
   background: transparent;
   color: inherit;
   font: inherit;
   cursor: pointer;
}

.sortable-head:hover {
   color: #1d4f86;
}

.sort-indicator {
   color: #247bb3;
}

.head-label {
   display: inline-flex;
   align-items: center;
   gap: 0.5rem;
}

.head-label i {
   color: #7d8798;
   font-size: 0.95rem;
}

.notification-table tbody td {
   padding: 1rem 0.9rem;
   border-bottom: 1px solid #edf1f6;
   color: #33415c;
   vertical-align: middle;
}

.notification-table tbody tr:last-child td {
   border-bottom: 0;
}

.notification-table tbody tr:hover {
   background: #fbfcff;
}

.notification-row-index {
   color: #94a3b8;
   font-weight: 700;
}

.notification-chip,
.notification-state,
.notification-source {
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

.notification-state.exito {
   background: #ecfdf3;
   color: #157347;
}

.notification-state.observado {
   background: #fff5f5;
   color: #c2410c;
}

.notification-state.creado {
   background: #eff6ff;
   color: #1d4ed8;
}

.notification-source {
   background: #f8fafc;
   color: #475569;
   border: 1px solid #e2e8f0;
}

.notification-tracking {
   font-family: Consolas, Monaco, monospace;
   color: #334155;
   font-weight: 700;
}

.notification-date {
   color: #223658;
   font-weight: 700;
}

.notification-message {
   max-width: 340px;
   white-space: nowrap;
   overflow: hidden;
   text-overflow: ellipsis;
   color: #4b5b76;
}

.notification-action-group {
   display: flex;
   gap: 0.45rem;
   flex-wrap: wrap;
}

.notification-action {
   width: 36px;
   height: 36px;
   display: inline-flex;
   align-items: center;
   justify-content: center;
   border-radius: 12px;
   border: 1px solid transparent;
   background: #fff;
   padding: 0;
   cursor: pointer;
   transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.notification-action:hover {
   transform: translateY(-1px);
}

.notification-action-success {
   color: #3442a8;
   border-color: #d9defd;
   background: #eef2ff;
}

.notification-action-danger {
   color: #b42318;
   border-color: #f5b3ad;
   background: #fff1f0;
}

.notification-action i {
   font-size: 0.82rem;
}

.notification-modal-backdrop {
   position: fixed;
   inset: 0;
   z-index: 1200;
   display: flex;
   align-items: center;
   justify-content: center;
   padding: 1.25rem;
   background: rgba(15, 23, 42, 0.58);
   backdrop-filter: blur(3px);
}

.notification-modal {
   display: flex;
   flex-direction: column;
   width: min(100%, 920px);
   max-height: min(90vh, 900px);
   overflow: hidden;
   border: 1px solid #e6ebf3;
   border-radius: 20px;
   background: #fff;
   color: #24324d;
   box-shadow: 0 24px 80px rgba(15, 23, 42, 0.28);
}

.notification-modal-header,
.notification-modal-footer {
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: 1rem;
   padding: 1.15rem 1.35rem;
   background: #f8fafc;
}

.notification-modal-header { border-bottom: 1px solid #e6ebf3; }
.notification-modal-footer { justify-content: flex-end; border-top: 1px solid #e6ebf3; }
.notification-modal-eyebrow { color: #75839a; font-size: 0.72rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
.notification-modal-header h2 { margin: 0.2rem 0; color: #1e2a3d; font-size: 1.35rem; font-weight: 800; }
.notification-modal-header p { margin: 0; color: #64748b; font-size: 0.88rem; }
.notification-modal-close { width: 38px; height: 38px; flex: 0 0 auto; border: 1px solid #dbe4ef; border-radius: 11px; background: #fff; color: #64748b; }
.notification-modal-close:hover { background: #f1f5f9; color: #1e293b; }
.notification-modal-body { overflow-y: auto; padding: 1.25rem 1.35rem; }
.notification-modal-loading { display: flex; min-height: 220px; align-items: center; justify-content: center; gap: 0.7rem; color: #64748b; font-weight: 700; }
.notification-modal-summary { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.7rem; }
.notification-modal-summary > div,
.notification-modal-data-grid > div,
.notification-modal-links > div { min-width: 0; padding: 0.8rem 0.9rem; border: 1px solid #e6ebf3; border-radius: 13px; background: #fff; }
.notification-modal-summary > div { background: #f8fafc; }
.notification-modal-summary span,
.notification-modal-data-grid span,
.notification-modal-links span { display: block; margin-bottom: 0.3rem; color: #6f7c92; font-size: 0.72rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; }
.notification-modal-summary strong,
.notification-modal-data-grid strong,
.notification-modal-links strong,
.notification-modal-links a { color: #24324d; font-size: 0.9rem; font-weight: 700; overflow-wrap: anywhere; }
.notification-modal-state { display: inline-flex; padding: 0.25rem 0.6rem; border-radius: 999px; }
.notification-modal-state.success { background: #ecfdf3; color: #067647; }
.notification-modal-state.warning { background: #fff5f5; color: #b42318; }
.notification-modal-state.info { background: #eff6ff; color: #1d4ed8; }
.notification-modal-state.neutral { background: #f1f5f9; color: #475569; }
.notification-modal-mono { font-family: Consolas, Monaco, monospace; }
.notification-modal-section { margin-top: 1.15rem; }
.notification-modal-section h3 { margin: 0 0 0.65rem; color: #1e2a3d; font-size: 1rem; font-weight: 800; }
.notification-modal-data-grid,
.notification-modal-links { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.6rem; }
.notification-modal-data-grid > .wide { grid-column: 1 / -1; }
.notification-modal-data-grid strong { white-space: pre-wrap; }
.notification-modal-links a { color: #2d4f8f; }
.notification-modal-done { min-height: 40px; padding: 0.55rem 1rem; border: 1px solid #d7deeb; border-radius: 11px; background: #fff; color: #4a5b79; font-weight: 800; }
.notification-modal-done:hover { background: #f1f5f9; }

@media (max-width: 767px) {
   .notification-modal-backdrop { padding: 0.6rem; }
   .notification-modal { max-height: 94vh; border-radius: 16px; }
   .notification-modal-header, .notification-modal-body { padding: 1rem; }
   .notification-modal-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 480px) {
   .notification-modal-summary, .notification-modal-data-grid, .notification-modal-links { grid-template-columns: 1fr; }
   .notification-modal-data-grid > .wide { grid-column: auto; }
}

.notification-table-footer {
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: 1rem;
   padding: 0.95rem 1rem;
   border-top: 1px solid #edf1f6;
   background: #fff;
}

.footer-copy {
   margin: 0;
   color: #6f7c92;
   font-size: 0.9rem;
}

.notification-pager {
   display: flex;
   align-items: center;
   gap: 0.45rem;
   flex-wrap: wrap;
}

.notification-page-size {
   display: inline-flex;
   align-items: center;
   gap: 0.4rem;
   margin: 0 0.35rem 0 0;
   color: #6f7c92;
   font-size: 0.8rem;
   font-weight: 700;
}

.notification-page-size .form-control {
   width: 68px;
   height: 36px;
   padding: 0.25rem 0.45rem;
   border-color: #e5eaf2;
   border-radius: 8px;
   color: #4b5b76;
   font-size: 0.82rem;
}

.pager-btn {
   min-width: 36px;
   height: 36px;
   padding: 0 0.7rem;
   border: 1px solid #e5eaf2;
   border-radius: 8px;
   background: #fff;
   color: #627089;
   font-weight: 700;
   transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.pager-btn:hover:not(:disabled) {
   transform: translateY(-1px);
   border-color: #c8d7ee;
   box-shadow: 0 8px 16px rgba(29, 56, 104, 0.08);
}

.pager-btn.active {
   border-color: #ff6f6f;
   color: #e04f4f;
   box-shadow: inset 0 0 0 1px rgba(224, 79, 79, 0.08);
}

.pager-btn:disabled {
   opacity: 0.45;
   cursor: not-allowed;
}

.notification-empty-state {
   padding: 1.8rem 1rem;
   text-align: center;
}

.notification-empty-state h3 {
   margin: 0;
   color: #1d3360;
   font-size: 1.35rem;
   font-weight: 800;
}

.notification-empty-state p {
   margin: 0.45rem 0 0;
   color: #6f7c92;
}

@media (max-width: 1199px) {
   .notification-filters {
      grid-template-columns: repeat(3, minmax(130px, 1fr));
   }

   .notification-reset-btn {
      min-height: 42px;
   }
}

.emision {
   background-color: #ecfeff;
   color: #0f766e;
}

.anulacion {
   background-color: #fff1f2;
   color: #be123c;
}

.multiple {
   background-color: #f0fdf4;
   color: #15803d;
}

.masivo {
   background-color: #fff7ed;
   color: #c2410c;
}

.contingencia {
   background-color: #fff8e1;
   color: #a16207;
}

.contingencia-cafc {
   background-color: #faf5ff;
   color: #7e22ce;
}

.documento-ajuste {
   background-color: #eff6ff;
   color: #2563eb;
}

.tipo-generico {
   background-color: #f1f5f9;
   color: #37474f;
}

@media (max-width: 991px) {
   .notification-hero-head {
      flex-direction: column;
   }

   .notification-table-footer {
      flex-direction: column;
      align-items: stretch;
   }

   .notification-pager {
      justify-content: center;
   }

   .notification-toolbar {
      justify-content: flex-start;
   }
}

@media (max-width: 575px) {
   .notification-filters {
      grid-template-columns: repeat(2, minmax(0, 1fr));
   }

   .notification-filter-field .form-control {
      font-size: 0.76rem;
   }

   .notification-toolbar-btn,
   .notification-reset-btn {
      padding-inline: 0.6rem;
      font-size: 0.76rem;
   }

   .notification-page-size {
      width: 100%;
      justify-content: center;
      margin: 0 0 0.2rem;
   }
}
</style>
