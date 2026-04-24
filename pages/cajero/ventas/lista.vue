<template>
  <div>
    <JcLoader :load="load" />
    <AdminTemplate :page="page" :modulo="modulo">
      <div slot="body" class="ventas-wrap">
        <div class="ventas-header d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
          <div>
            <h1 class="mb-1">Mis ventas</h1>
            <p class="text-muted mb-0">Consulta tu historial de emisiones y accede a comprobantes desde una sola pantalla.</p>
          </div>
          <div class="ventas-header-badges mt-3 mt-lg-0">
            <span class="ventas-mini-badge">Ventas: {{ numberFormat(summary.ventas) }}</span>
            <span class="ventas-mini-badge ventas-mini-badge--success">Facturadas: {{ numberFormat(summary.facturadas) }}</span>
            <span class="ventas-mini-badge ventas-mini-badge--warning">Pendientes: {{ numberFormat(summary.pendientes) }}</span>
          </div>
        </div>

        <div class="card ventas-panel mb-4">
          <div class="card-header ventas-panel__header">
            <div>
              <strong>Filtros de consulta</strong>
              <div class="text-muted small">Ajusta criterios para encontrar ventas por codigo, cliente, fecha o estado.</div>
            </div>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-xl-4 col-lg-6 mb-3">
                <label class="ventas-label">Buscar</label>
                <input
                  v-model.trim="filters.q"
                  type="text"
                  class="form-control ventas-control"
                  placeholder="Codigo, seguimiento, cliente o documento"
                  @input="onSearchInput"
                  @keydown.enter.prevent="fetchVentas"
                >
              </div>

              <div class="col-xl-2 col-lg-3 col-md-4 mb-3">
                <label class="ventas-label">Estado</label>
                <select v-model="filters.estado" class="form-control ventas-control" @change="fetchVentas">
                  <option value="all">Todos</option>
                  <option value="emitido">Emitido</option>
                  <option value="borrador">Borrador</option>
                </select>
              </div>

              <div class="col-xl-2 col-lg-3 col-md-4 mb-3">
                <label class="ventas-label">Estado emision</label>
                <select v-model="filters.estado_emision" class="form-control ventas-control" @change="fetchVentas">
                  <option value="all">Todos</option>
                  <option value="PROCESADA">Facturada</option>
                  <option value="RECEPCIONADA">Pendiente</option>
                  <option value="CONTINGENCIA_CREADA">Contingencia</option>
                  <option value="OBSERVADA">Observada</option>
                </select>
              </div>

              <div class="col-xl-2 col-lg-3 col-md-4 mb-3">
                <label class="ventas-label">Desde</label>
                <input v-model="filters.from" type="date" class="form-control ventas-control" @change="fetchVentas">
              </div>

              <div class="col-xl-2 col-lg-3 col-md-4 mb-3">
                <label class="ventas-label">Hasta</label>
                <input v-model="filters.to" type="date" class="form-control ventas-control" @change="fetchVentas">
              </div>

              <div class="col-xl-2 col-lg-3 col-md-4 mb-3">
                <label class="ventas-label">Registros</label>
                <select v-model.number="filters.per_page" class="form-control ventas-control" @change="onPerPageChange">
                  <option :value="10">10</option>
                  <option :value="20">20</option>
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                </select>
              </div>
            </div>

            <div class="d-flex flex-wrap">
              <button class="btn btn-outline-primary mr-2 mb-2" @click="exportPdf" :disabled="load || !rows.length">
                <i class="fas fa-file-pdf mr-1"></i> Reporte PDF
              </button>
              <button class="btn btn-outline-secondary mb-2" @click="resetFilters">
                <i class="fas fa-undo mr-1"></i> Reiniciar
              </button>
            </div>
          </div>
        </div>

        <div class="ventas-summary-grid">
          <button type="button" class="ventas-stat-card" @click="quickFilter('emitido', 'all')">
            <div class="ventas-stat-card__label">Ventas emitidas</div>
            <div class="ventas-stat-card__value">{{ numberFormat(summary.ventas) }}</div>
            <div class="ventas-stat-card__meta">Registros cerrados y enviados a facturacion</div>
          </button>

          <button type="button" class="ventas-stat-card" @click="quickFilter('emitido', 'PROCESADA')">
            <div class="ventas-stat-card__label">Facturadas</div>
            <div class="ventas-stat-card__value">{{ numberFormat(summary.facturadas) }}</div>
            <div class="ventas-stat-card__meta">Ventas con comprobante listo para entrega</div>
          </button>

          <button type="button" class="ventas-stat-card" @click="quickFilter('emitido', 'RECEPCIONADA')">
            <div class="ventas-stat-card__label">Pendientes</div>
            <div class="ventas-stat-card__value">{{ numberFormat(summary.pendientes) }}</div>
            <div class="ventas-stat-card__meta">Emisiones en proceso o esperando actualizacion</div>
          </button>

          <button type="button" class="ventas-stat-card" @click="quickFilter('emitido', 'OBSERVADA')">
            <div class="ventas-stat-card__label">Observadas</div>
            <div class="ventas-stat-card__value">{{ numberFormat(summary.observadas) }}</div>
            <div class="ventas-stat-card__meta">Ventas que requieren revision antes de reenviar</div>
          </button>

          <button type="button" class="ventas-stat-card" @click="quickFilter('borrador', 'all')">
            <div class="ventas-stat-card__label">Borradores</div>
            <div class="ventas-stat-card__value">0</div>
            <div class="ventas-stat-card__meta">No disponibles en este modulo (backend puente)</div>
          </button>

          <button type="button" class="ventas-stat-card ventas-stat-card--accent" @click="quickFilter('emitido', 'all')">
            <div class="ventas-stat-card__label">Total vendido</div>
            <div class="ventas-stat-card__value">Bs {{ money(summary.totalVendido) }}</div>
            <div class="ventas-stat-card__meta">Monto acumulado de las ventas emitidas</div>
          </button>
        </div>

        <div class="card ventas-panel">
          <div class="card-header ventas-panel__header d-flex justify-content-between align-items-center">
            <div>
              <strong>Historial de ventas</strong>
              <div class="text-muted small">Detalle de emisiones registradas para tu cuenta.</div>
            </div>
            <span class="ventas-table-count">{{ totalRows }} registros</span>
          </div>

          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table ventas-table mb-0">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Codigo orden</th>
                    <th>Cliente</th>
                    <th>Facturacion</th>
                    <th>Estado</th>
                    <th class="text-center">Items</th>
                    <th class="text-right">Total</th>
                    <th class="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in paginatedRows" :key="row.id">
                    <td>
                      <div class="ventas-table__primary">{{ formatDate(row.fecha, 'date') }}</div>
                      <div class="ventas-table__secondary">{{ formatDate(row.fecha, 'time') }}</div>
                    </td>
                    <td>
                      <div class="ventas-table__primary">{{ row.codigoOrden || 'Sin codigo' }}</div>
                      <div class="ventas-table__secondary">Doc: {{ row.documentoIdentidad || 'S/N' }} · Fact: {{ row.numeroFactura || 'S/N' }}</div>
                    </td>
                    <td>
                      <div class="ventas-table__primary">{{ row.razonSocial || 'SIN NOMBRE' }}</div>
                      <div class="ventas-table__secondary">{{ row.codigoCliente || 'SIN CLIENTE' }}</div>
                    </td>
                    <td>
                      <span class="ventas-status-chip" :class="facturaChipClass(row.estadoSufe)">
                        {{ facturaLabel(row.estadoSufe) }}
                      </span>
                      <div class="ventas-table__secondary mt-1">{{ facturaHelp(row.estadoSufe) }}</div>
                    </td>
                    <td>
                      <span class="ventas-status-chip ventas-status-chip--primary">EMITIDO</span>
                    </td>
                    <td class="text-center">
                      <button type="button" class="ventas-count-pill ventas-count-pill--button" @click="openItems(row)">
                        {{ row.itemsCount !== null ? row.itemsCount : '?' }}
                      </button>
                    </td>
                    <td class="text-right">
                      <div class="ventas-table__amount">Bs {{ money(row.total) }}</div>
                    </td>
                    <td class="text-center">
                      <div class="d-flex flex-wrap justify-content-center">
                        <button
                          v-if="row.codigoSeguimiento"
                          type="button"
                          class="btn btn-xs btn-outline-secondary mr-2 mb-2"
                          @click="consultarVenta(row)"
                        >
                          {{ row.estadoSufe === 'RECEPCIONADA' || row.estadoSufe === 'CONTINGENCIA_CREADA' ? 'Actualizar estado' : 'Consultar' }}
                        </button>

                        <a
                          v-if="pdfUrl(row)"
                          :href="pdfUrl(row)"
                          target="_blank"
                          rel="noopener"
                          class="btn btn-xs btn-outline-primary mr-2 mb-2"
                        >
                          PDF original
                        </a>

                        <button class="btn btn-xs btn-outline-dark mb-2" @click="goTicket(row)">
                          Ticket
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr v-if="!paginatedRows.length">
                    <td colspan="8" class="text-center py-5 text-muted">No se encontraron ventas con los filtros aplicados.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="totalPages > 1" class="card-footer clearfix">
            <nav class="enterprise-pagination-nav">
              <ul class="pagination justify-content-center enterprise-pagination mb-0">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="changePage(1)">Primero</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">Anterior</a>
                </li>
                <li
                  v-for="pageNumber in totalPages"
                  :key="`p-${pageNumber}`"
                  class="page-item"
                  :class="{ active: currentPage === pageNumber }"
                >
                  <a class="page-link" href="#" @click.prevent="changePage(pageNumber)">{{ pageNumber }}</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">Siguiente</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a class="page-link" href="#" @click.prevent="changePage(totalPages)">Ultimo</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div v-if="itemsModal.open" class="ventas-modal-backdrop" @click="closeItems"></div>
        <div v-if="itemsModal.open" class="modal d-block ventas-modal-visible" tabindex="-1" role="dialog" aria-hidden="false">
          <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div class="modal-content ventas-items-modal">
              <div class="modal-header ventas-items-modal__header">
                <div>
                  <h5 class="modal-title mb-1">Detalle de items</h5>
                  <div class="ventas-items-modal__subtitle">
                    Venta {{ itemsModal.row?.codigoOrden || ('#' + (itemsModal.row?.id || '')) }} · {{ itemsModal.loading ? '...' : itemsModal.items.length }} item(s)
                  </div>
                </div>
                <button type="button" class="close" @click="closeItems" aria-label="Cerrar">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body p-0">
                <div class="table-responsive">
                  <table class="table ventas-items-table mb-0">
                    <thead>
                      <tr>
                        <th>Codigo</th>
                        <th>Detalle</th>
                        <th class="text-center">Cant.</th>
                        <th class="text-right">Base</th>
                        <th class="text-right">Extras</th>
                        <th class="text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(item, index) in itemsModal.items" :key="`it-${index}`">
                        <td>
                          <div class="ventas-table__primary">{{ item.codigo || ('ITEM-' + (index + 1)) }}</div>
                          <div class="ventas-table__secondary">{{ item.origen_tipo || item.modelo || '' }}</div>
                        </td>
                        <td>
                          <div class="ventas-table__primary">{{ item.descripcion || item.titulo || 'Sin detalle' }}</div>
                          <div v-if="item.titulo && item.titulo !== item.descripcion" class="ventas-table__secondary">{{ item.titulo }}</div>
                          <div v-if="item.subtitulo" class="ventas-table__secondary">{{ item.subtitulo }}</div>
                        </td>
                        <td class="text-center">
                          <span class="ventas-items-table__qty">{{ item.cantidad || 1 }}</span>
                        </td>
                        <td class="text-right">Bs {{ money(itemBase(item)) }}</td>
                        <td class="text-right">Bs {{ money(itemExtras(item)) }}</td>
                        <td class="text-right ventas-items-table__total">Bs {{ money(itemTotal(item)) }}</td>
                      </tr>

                      <tr v-if="itemsModal.loading">
                        <td colspan="6" class="text-center py-4 text-muted">Cargando items...</td>
                      </tr>

                      <tr v-else-if="!itemsModal.items.length">
                        <td colspan="6" class="text-center py-4 text-muted">No hay items para esta venta.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="modal-footer ventas-items-modal__footer">
                <div class="ventas-items-modal__summary">Total venta: Bs {{ money(itemsModal.row?.total || 0) }}</div>
                <button type="button" class="btn btn-outline-primary" @click="closeItems">Cerrar</button>
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
    return { title: this.modulo };
  },

  data() {
    return {
      load: true,
      page: 'Ventas',
      modulo: 'Mis ventas',
      filters: {
        q: '',
        estado: 'emitido',
        estado_emision: 'all',
        from: '',
        to: '',
        per_page: 20,
      },
      rows: [],
      totalRows: 0,
      summary: {
        ventas: 0,
        facturadas: 0,
        pendientes: 0,
        observadas: 0,
        totalVendido: 0,
      },
      currentPage: 1,
      searchTimer: null,
      detailCache: {},
      itemsModal: {
        open: false,
        row: null,
        items: [],
        loading: false,
      },
    };
  },

  computed: {
    totalPages() {
      return Math.max(1, Math.ceil(this.rows.length / this.filters.per_page));
    },
    paginatedRows() {
      const start = (this.currentPage - 1) * this.filters.per_page;
      return this.rows.slice(start, start + this.filters.per_page);
    },
    currentUserId() {
      const user = this.$store?.state?.auth?.user || {};
      return this.extractUserId(user);
    },
  },

  watch: {
    totalPages(newValue) {
      if (this.currentPage > newValue) {
        this.currentPage = newValue || 1;
      }
    },
  },

  methods: {
    extractUserId(user) {
      if (!user || typeof user !== 'object') return '';
      const candidates = [
        user.id,
        user.usuario_id,
        user.user_id,
        user.usuarioId,
        user.userId,
        user.origen_usuario_id,
        user.uid,
      ];
      const value = candidates.find((candidate) => candidate !== undefined && candidate !== null && String(candidate).trim() !== '');
      return value !== undefined && value !== null ? String(value).trim() : '';
    },

    async resolveCurrentUserId() {
      const localId = this.currentUserId;
      if (localId) return localId;

      try {
        const me = await this.$admin.$get('me');
        const remoteUser = me?.usuario || {};
        const remoteId = this.extractUserId(remoteUser);
        if (remoteId) {
          this.$store.commit('auth/setUser', remoteUser);
          return remoteId;
        }
      } catch (e) {
      }

      return '';
    },

    normalizeIdentityValue(value) {
      return String(value || '').trim().toLowerCase();
    },

    normalizeCarnet(value) {
      return String(value || '').trim().toUpperCase().replace(/\s+/g, '');
    },

    buildIdentityFromUser(user) {
      const alias = this.normalizeIdentityValue(user?.alias || user?.alias_acceso);
      const carnet = this.normalizeCarnet(user?.numero_carnet || user?.carnet || user?.ci);
      const email = this.normalizeIdentityValue(user?.email);
      const id = this.extractUserId(user);

      return {
        id: id || '',
        alias: alias || '',
        carnet: carnet || '',
        email: email || '',
      };
    },

    async resolveUserIdentity() {
      const localUser = this.$store?.state?.auth?.user || {};
      let identity = this.buildIdentityFromUser(localUser);

      try {
        const me = await this.$admin.$get('me');
        const remoteUser = me?.usuario || {};
        if (remoteUser && Object.keys(remoteUser).length) {
          this.$store.commit('auth/setUser', remoteUser);
          identity = this.buildIdentityFromUser(remoteUser);
        }
      } catch (e) {
      }

      return identity;
    },

    ventaMatchesIdentity(venta, identity) {
      const user = venta?.usuario || {};
      const sameId = identity.id && String(user?.id || '').trim() === identity.id;
      const sameAlias = identity.alias && this.normalizeIdentityValue(user?.alias) === identity.alias;
      const sameCarnet = identity.carnet && this.normalizeCarnet(user?.carnet) === identity.carnet;
      const sameEmail = identity.email && this.normalizeIdentityValue(user?.email) === identity.email;
      return Boolean(sameId || sameAlias || sameCarnet || sameEmail);
    },

    mapKardexDetalleRows(detalle) {
      return detalle.map((row) => ({
        id: row.id,
        fecha: row.fecha || '',
        codigoOrden: row.codigoOrden || '',
        numeroFactura: row.numeroFactura || row.nroFactura || '',
        codigoSeguimiento: row.codigoSeguimiento || '',
        razonSocial: row.razonSocial || '',
        documentoIdentidad: row.documentoIdentidad || '',
        codigoCliente: row.codigoCliente || '',
        total: Number(row.total || 0),
        estadoSufe: (row.estadoSufe || '').toUpperCase(),
        cuf: row.cuf || '',
        itemsCount: Number.isFinite(Number(row.itemsCount)) ? Number(row.itemsCount) : (this.detailCache[row.id]?.length ?? null),
      }));
    },

    mapResumenRows(ventas) {
      return ventas.map((row) => ({
        id: row.id,
        fecha: row.fecha || '',
        codigoOrden: row.codigoOrden || '',
        numeroFactura: row.numeroFactura || row.nroFactura || '',
        codigoSeguimiento: row.codigoSeguimiento || '',
        razonSocial: row?.cliente?.razonSocial || '',
        documentoIdentidad: row?.cliente?.documentoIdentidad || '',
        codigoCliente: row?.cliente?.codigoCliente || '',
        total: Number(row.total || 0),
        estadoSufe: (row.estadoSufe || '').toUpperCase(),
        cuf: row.cuf || '',
        itemsCount: Number.isFinite(Number(row.itemsCount))
          ? Number(row.itemsCount)
          : (Array.isArray(row.detalle) ? row.detalle.length : (this.detailCache[row.id]?.length ?? null)),
      }));
    },

    buildSummaryFromRows(rows) {
      const summary = {
        ventas: rows.length,
        facturadas: 0,
        pendientes: 0,
        observadas: 0,
        totalVendido: 0,
      };

      rows.forEach((row) => {
        const estado = (row.estadoSufe || '').toUpperCase();
        summary.totalVendido += Number(row.total || 0);
        if (estado === 'PROCESADA') summary.facturadas += 1;
        if (estado === 'OBSERVADA') summary.observadas += 1;
        if (estado === 'RECEPCIONADA' || estado === 'CONTINGENCIA_CREADA') summary.pendientes += 1;
      });

      return summary;
    },

    async fetchVentas() {
      if (this.filters.estado === 'borrador') {
        this.rows = [];
        this.totalRows = 0;
        this.summary = { ventas: 0, facturadas: 0, pendientes: 0, observadas: 0, totalVendido: 0 };
        this.currentPage = 1;
        this.load = false;
        return;
      }

      this.load = true;
      try {
        const identity = await this.resolveUserIdentity();
        if (!identity.id && !identity.alias && !identity.carnet && !identity.email) {
          this.rows = [];
          this.totalRows = 0;
          this.summary = { ventas: 0, facturadas: 0, pendientes: 0, observadas: 0, totalVendido: 0 };
          return;
        }

        const params = {
          origen_usuario_alias: identity.alias || undefined,
          origen_usuario_carnet: identity.carnet || undefined,
          origen_usuario_email: identity.email || undefined,
          fechaInicio: this.filters.from || undefined,
          fechaFin: this.filters.to || undefined,
          estado_sufe: this.filters.estado_emision !== 'all' ? this.filters.estado_emision : undefined,
          q: this.filters.q || undefined,
          limite: 500,
        };

        const response = await this.$admin.$get('ventas/reportes/kardex-usuarios', { params });
        const detalle = Array.isArray(response?.detalle) ? response.detalle : [];
        const resumen = response?.resumen || {};

        const rows = this.mapKardexDetalleRows(detalle);
        const summary = {
          ventas: Number(resumen.ventas || 0),
          facturadas: Number(resumen.facturadas || 0),
          pendientes: Number(resumen.pendientes || 0),
          observadas: Number(resumen.observadas || 0),
          totalVendido: Number(resumen.totalVendido || 0),
        };

        this.rows = rows;
        this.totalRows = rows.length;
        this.summary = summary;

        this.currentPage = 1;
      } catch (error) {
        const msg = error?.response?.data?.message || 'No se pudo cargar Mis ventas.';
        this.$swal.fire('Error', msg, 'error');
      } finally {
        this.load = false;
      }
    },

    onSearchInput() {
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => {
        this.fetchVentas();
      }, 450);
    },

    onPerPageChange() {
      this.currentPage = 1;
    },

    quickFilter(estado, estadoEmision) {
      this.filters.estado = estado;
      this.filters.estado_emision = estadoEmision;
      this.fetchVentas();
    },

    resetFilters() {
      this.filters = {
        q: '',
        estado: 'emitido',
        estado_emision: 'all',
        from: '',
        to: '',
        per_page: 20,
      };
      this.fetchVentas();
    },

    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    formatDate(value, part) {
      if (!value) return '-';
      const date = new Date(value.replace(' ', 'T'));
      if (Number.isNaN(date.getTime())) return '-';
      if (part === 'time') {
        return date.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleDateString('es-BO');
    },

    money(value) {
      const n = Number(value || 0);
      return Number.isFinite(n) ? n.toFixed(2) : '0.00';
    },

    itemBase(item) {
      const base = Number(item?.monto_base);
      if (Number.isFinite(base)) return base;
      return Number(item?.precio || 0);
    },

    itemExtras(item) {
      const extras = Number(item?.monto_extras);
      return Number.isFinite(extras) ? extras : 0;
    },

    itemTotal(item) {
      const totalLinea = Number(item?.total_linea);
      if (Number.isFinite(totalLinea)) return totalLinea;
      const cantidad = Number(item?.cantidad || 1);
      return (this.itemBase(item) + this.itemExtras(item)) * (Number.isFinite(cantidad) ? cantidad : 1);
    },

    numberFormat(value) {
      const n = Number(value || 0);
      return Number.isFinite(n) ? n.toLocaleString('es-BO') : '0';
    },

    facturaLabel(estado) {
      const map = {
        PROCESADA: 'FACTURADA',
        RECEPCIONADA: 'PENDIENTE',
        CONTINGENCIA_CREADA: 'PENDIENTE',
        OBSERVADA: 'RECHAZADA',
      };
      return map[(estado || '').toUpperCase()] || ((estado || 'SIN ESTADO').toUpperCase());
    },

    facturaHelp(estado) {
      const key = (estado || '').toUpperCase();
      if (key === 'PROCESADA') return 'Factura emitida correctamente.';
      if (key === 'RECEPCIONADA' || key === 'CONTINGENCIA_CREADA') return 'Emision en proceso de confirmacion.';
      if (key === 'OBSERVADA') return 'Requiere revision antes de reenviar.';
      return 'Sin observaciones registradas.';
    },

    facturaChipClass(estado) {
      const key = this.facturaLabel(estado);
      if (key === 'FACTURADA') return 'ventas-status-chip--success';
      if (key === 'PENDIENTE') return 'ventas-status-chip--warning';
      if (key === 'RECHAZADA') return 'ventas-status-chip--danger';
      return 'ventas-status-chip--muted';
    },

    pdfUrl(row) {
      if (!row?.cuf || this.facturaLabel(row.estadoSufe) !== 'FACTURADA') return null;
      return `https://sefe.demo.agetic.gob.bo/public/facturas_pdf/${row.cuf}.pdf`;
    },

    goTicket(row) {
      if (!row?.id) return;
      this.$router.push(`/cajero/ventas/invoice/${row.id}`);
    },

    async consultarVenta(row) {
      if (!row?.codigoSeguimiento) return;
      this.load = true;
      try {
        const res = await this.$admin.$get(`ventas/consultar/${row.codigoSeguimiento}`);
        this.$swal.fire('Estado actualizado', res?.message || 'Consulta realizada correctamente.', 'success');
        await this.fetchVentas();
      } catch (error) {
        const msg = error?.response?.data?.message || 'No se pudo consultar la venta.';
        this.$swal.fire('Error', msg, 'error');
      } finally {
        this.load = false;
      }
    },

    async openItems(row) {
      this.itemsModal.open = true;
      this.itemsModal.row = row;
      this.itemsModal.loading = true;

      if (this.detailCache[row.id]) {
        this.itemsModal.items = this.detailCache[row.id];
        this.itemsModal.loading = false;
        return;
      }

      this.itemsModal.items = [];
      try {
        const detail = await this.$admin.$get(`ventas/${row.id}`);
        const items = Array.isArray(detail?.detalle) ? detail.detalle : [];
        this.detailCache[row.id] = items;
        this.itemsModal.items = items;

        const idx = this.rows.findIndex((x) => x.id === row.id);
        if (idx !== -1) {
          this.$set(this.rows[idx], 'itemsCount', items.length);
        }
      } catch (error) {
        const msg = error?.response?.data?.message || 'No se pudo cargar detalle de items.';
        this.$swal.fire('Error', msg, 'error');
      } finally {
        this.itemsModal.loading = false;
      }
    },

    closeItems() {
      this.itemsModal.open = false;
      this.itemsModal.row = null;
      this.itemsModal.items = [];
      this.itemsModal.loading = false;
    },

    async exportPdf() {
      try {
        const identity = await this.resolveUserIdentity();
        const params = {
          origen_usuario_alias: identity.alias || undefined,
          origen_usuario_carnet: identity.carnet || undefined,
          origen_usuario_email: identity.email || undefined,
          fechaInicio: this.filters.from || undefined,
          fechaFin: this.filters.to || undefined,
          estado_sufe: this.filters.estado_emision !== 'all' ? this.filters.estado_emision : undefined,
          q: this.filters.q || undefined,
          limite: 500,
        };

        const response = await this.$admin.get('ventas/reportes/kardex-pdf', {
          params,
          responseType: 'blob',
        });

        const blob = new Blob([response.data], { type: 'application/pdf' });
        const contentDisposition = response.headers?.['content-disposition'] || '';
        const fileNameMatch = contentDisposition.match(/filename=\"?([^\";]+)\"?/i);
        const fileName = (fileNameMatch && fileNameMatch[1]) ? fileNameMatch[1] : `kardex-mis-ventas-${new Date().toISOString().slice(0, 10)}.pdf`;

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        this.$swal.fire('Error', 'No se pudo generar el PDF del reporte.', 'error');
      }
    },
  },

  mounted() {
    this.fetchVentas();
  },
};
</script>

<style scoped>
.ventas-wrap {
  padding-bottom: 1rem;
}

.ventas-header {
  gap: 1rem;
  margin-bottom: 1rem;
}

.ventas-header h1 {
  font-weight: 700;
  color: #173b73;
}

.ventas-header-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.ventas-mini-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  background: rgba(254, 204, 54, 0.18);
  color: #173b73;
  font-size: 0.82rem;
  font-weight: 700;
}

.ventas-mini-badge--success {
  background: rgba(40, 167, 69, 0.14);
  color: #1f7a35;
}

.ventas-mini-badge--warning {
  background: rgba(255, 193, 7, 0.18);
  color: #9a6b00;
}

.ventas-summary-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.ventas-stat-card {
  text-align: left;
  width: 100%;
  border: 1px solid rgba(32, 83, 154, 0.12);
  border-top: 4px solid #fecc36;
  border-radius: 12px;
  padding: 1rem 1.05rem;
  box-shadow: 0 8px 24px rgba(16, 43, 84, 0.06);
  min-height: 142px;
  background: #fff;
  cursor: pointer;
}

.ventas-stat-card--accent {
  border-top-color: #20539a;
  background: linear-gradient(180deg, #ffffff 0%, #f6f9ff 100%);
}

.ventas-stat-card__label {
  color: #5f7290;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  margin-bottom: 0.65rem;
}

.ventas-stat-card__value {
  color: #173b73;
  font-size: 2rem;
  line-height: 1;
  font-weight: 800;
  margin-bottom: 0.7rem;
}

.ventas-stat-card__meta {
  color: #74839b;
  font-size: 0.82rem;
  line-height: 1.35;
}

.ventas-panel {
  border: 1px solid rgba(32, 83, 154, 0.12);
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(16, 43, 84, 0.05);
  overflow: hidden;
}

.ventas-panel__header {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-bottom: 1px solid rgba(32, 83, 154, 0.1);
  padding: 1rem 1.25rem;
}

.ventas-label {
  color: #294b7c;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.ventas-control {
  min-height: 44px;
  border-radius: 10px;
  border-color: rgba(32, 83, 154, 0.18);
  box-shadow: none;
}

.ventas-control:focus {
  border-color: rgba(32, 83, 154, 0.42);
  box-shadow: 0 0 0 0.18rem rgba(32, 83, 154, 0.09);
}

.ventas-table-count {
  color: #6f819d;
  font-size: 0.86rem;
  font-weight: 600;
}

.ventas-table thead th {
  background: #f7f9fc;
  border-bottom: 1px solid rgba(32, 83, 154, 0.1);
  color: #38557f;
  font-size: 0.79rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  white-space: nowrap;
}

.ventas-table td {
  vertical-align: top;
  border-top: 1px solid rgba(32, 83, 154, 0.08);
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.ventas-table__primary {
  color: #173b73;
  font-weight: 700;
}

.ventas-table__secondary {
  color: #74839b;
  font-size: 0.83rem;
  margin-top: 0.25rem;
}

.ventas-table__amount {
  color: #0f2f61;
  font-weight: 800;
  font-size: 1.05rem;
}

.ventas-count-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  height: 34px;
  padding: 0 0.6rem;
  border-radius: 999px;
  background: rgba(32, 83, 154, 0.08);
  color: #20539a;
  font-weight: 800;
}

.ventas-count-pill--button {
  border: 1px solid transparent;
  cursor: pointer;
}

.ventas-status-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.28rem 0.58rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  border: 1px solid transparent;
}

.ventas-status-chip--primary {
  background: rgba(254, 204, 54, 0.18);
  color: #7c5b00;
  border-color: rgba(254, 204, 54, 0.45);
}

.ventas-status-chip--success {
  background: rgba(40, 167, 69, 0.14);
  color: #1f7a35;
  border-color: rgba(40, 167, 69, 0.28);
}

.ventas-status-chip--warning {
  background: rgba(255, 193, 7, 0.18);
  color: #9a6b00;
  border-color: rgba(255, 193, 7, 0.3);
}

.ventas-status-chip--danger {
  background: rgba(220, 53, 69, 0.12);
  color: #b02a37;
  border-color: rgba(220, 53, 69, 0.24);
}

.ventas-status-chip--muted {
  background: rgba(108, 117, 125, 0.1);
  color: #66707a;
  border-color: rgba(108, 117, 125, 0.22);
}

.ventas-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.35);
  z-index: 2050;
}

.ventas-modal-visible {
  z-index: 2060;
}

.ventas-items-modal {
  border-radius: 18px;
  overflow: hidden;
}

.ventas-items-modal__header {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-bottom: 1px solid rgba(32, 83, 154, 0.1);
}

.ventas-items-modal__subtitle {
  margin-top: 0.25rem;
  color: #74839b;
  font-size: 0.85rem;
}

.ventas-items-table thead th {
  background: #f7f9fc;
  color: #38557f;
  border-bottom: 1px solid rgba(32, 83, 154, 0.1);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.ventas-items-table td {
  vertical-align: top;
  border-top: 1px solid rgba(32, 83, 154, 0.08);
  padding-top: 0.9rem;
  padding-bottom: 0.9rem;
}

.ventas-items-table__qty {
  display: inline-flex;
  min-width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(254, 204, 54, 0.22);
  color: #7c5b00;
  font-weight: 800;
}

.ventas-items-table__total {
  color: #173b73;
  font-weight: 800;
}

.ventas-items-modal__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.ventas-items-modal__summary {
  color: #173b73;
  font-weight: 800;
}

@media (max-width: 1399.98px) {
  .ventas-summary-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 767.98px) {
  .ventas-summary-grid {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  .ventas-stat-card {
    min-height: auto;
  }

  .ventas-items-modal__footer {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
