<template>
  <div>
    <JcLoader :load="load" />
    <AdminTemplate :page="page" :modulo="modulo">
      <div slot="body" class="ventas-wrap">
        <div class="card ventas-hero mb-4">
          <div class="card-body">
            <div class="ventas-header d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
          <div class="ventas-heading">
            <span class="ventas-heading-icon">
              <i class="fas fa-receipt"></i>
            </span>
            <div>
              <p class="ventas-kicker mb-2">Centro de ventas</p>
              <h1 class="mb-1">Mis ventas</h1>
              <p class="text-muted mb-0">Consulta tu historial de emisiones y accede a comprobantes desde una sola pantalla.</p>
            </div>
          </div>
          <div class="ventas-header-badges mt-3 mt-lg-0">
            <span class="ventas-mini-badge"><i class="fas fa-list-ul"></i> {{ numberFormat(summary.ventas) }}</span>
            <span class="ventas-mini-badge ventas-mini-badge--success"><i class="fas fa-check"></i> {{ numberFormat(summary.facturadas) }}</span>
            <span class="ventas-mini-badge ventas-mini-badge--warning"><i class="fas fa-clock"></i> {{ numberFormat(summary.pendientes) }}</span>
          </div>
            </div>
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
                  <option value="ANULACION_SOLICITADA">Anulacion solicitada</option>
                  <option value="ANULADA">Anulada</option>
                  <option value="RECEPCIONADA">Pendiente</option>
                  <option value="CONTINGENCIA_CREADA">Contingencia</option>
                  <option value="OBSERVADA">Observada</option>
                  <option value="ANULACION_OBSERVADA">Anulacion observada</option>
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
              <button class="btn ventas-action-btn ventas-action-btn-danger mr-2 mb-2" @click="exportPdf" :disabled="load || !rows.length">
                <i class="fas fa-file-pdf"></i>
                <span>Reporte PDF</span>
              </button>
              <button class="btn ventas-action-btn mb-2" @click="resetFilters">
                <i class="fas fa-undo"></i>
                <span>Reiniciar</span>
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
                      <div class="ventas-table-actions">
                        <button
                          v-if="row.codigoSeguimiento"
                          type="button"
                          class="ventas-icon-action"
                          @click="consultarVenta(row)"
                          :title="row.estadoSufe === 'RECEPCIONADA' || row.estadoSufe === 'CONTINGENCIA_CREADA' ? 'Actualizar estado' : 'Consultar estado'"
                        >
                          <i class="fas fa-sync-alt"></i>
                        </button>

                        <button
                          v-if="canAnular(row)"
                          type="button"
                          class="ventas-icon-action ventas-icon-action-danger"
                          @click="anularVenta(row)"
                          title="Anular factura"
                        >
                          <i class="fas fa-ban"></i>
                        </button>

                        <a
                          v-if="pdfUrl(row)"
                          :href="pdfUrl(row)"
                          target="_blank"
                          rel="noopener"
                          class="ventas-icon-action ventas-icon-action-pdf"
                          title="PDF original"
                        >
                          <i class="fas fa-file-pdf"></i>
                        </a>

                        <button class="ventas-icon-action ventas-icon-action-dark" @click="goTicket(row)" title="Ver ticket">
                          <i class="fas fa-ticket-alt"></i>
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
                  <a class="page-link" href="#" @click.prevent="changePage(1)" title="Primera página" aria-label="Primera página">
                    <i class="fas fa-angle-double-left"></i>
                  </a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)" title="Página anterior" aria-label="Página anterior">
                    <i class="fas fa-angle-left"></i>
                  </a>
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
                  <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)" title="Página siguiente" aria-label="Página siguiente">
                    <i class="fas fa-angle-right"></i>
                  </a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a class="page-link" href="#" @click.prevent="changePage(totalPages)" title="Última página" aria-label="Última página">
                    <i class="fas fa-angle-double-right"></i>
                  </a>
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
                <div class="ventas-items-modal__title">
                  <span class="ventas-items-modal__icon">
                    <i class="fas fa-box-open"></i>
                  </span>
                  <div>
                  <p class="ventas-kicker mb-1">Detalle de venta</p>
                  <h5 class="modal-title mb-1">Ítems registrados</h5>
                  <div class="ventas-items-modal__subtitle">
                    Venta {{ itemsModal.row?.codigoOrden || ('#' + (itemsModal.row?.id || '')) }} · {{ itemsModal.loading ? '...' : itemsModal.items.length }} item(s)
                  </div>
                  </div>
                </div>
                <button type="button" class="ventas-items-modal__close" @click="closeItems" aria-label="Cerrar" title="Cerrar">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <div class="modal-body ventas-items-modal__body">
                <div class="ventas-items-modal__meta">
                  <span><i class="fas fa-receipt"></i> {{ itemsModal.row?.numeroFactura || 'Factura S/N' }}</span>
                  <span><i class="fas fa-id-card"></i> {{ itemsModal.row?.documentoIdentidad || 'Documento S/N' }}</span>
                  <strong>Bs {{ money(itemsModal.row?.total || 0) }}</strong>
                </div>
                <div class="table-responsive ventas-items-table-wrap">
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
                          <span class="ventas-item-code">{{ item.codigo || ('ITEM-' + (index + 1)) }}</span>
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
                        <td colspan="6" class="text-center py-5">
                          <div class="ventas-items-empty">
                            <i class="fas fa-spinner fa-spin"></i>
                            <strong>Cargando ítems</strong>
                            <span>Estamos recuperando el detalle de la venta.</span>
                          </div>
                        </td>
                      </tr>

                      <tr v-else-if="!itemsModal.items.length">
                        <td colspan="6" class="text-center py-5">
                          <div class="ventas-items-empty">
                            <i class="fas fa-inbox"></i>
                            <strong>Sin ítems registrados</strong>
                            <span>No hay detalle disponible para esta venta.</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="modal-footer ventas-items-modal__footer">
                <div class="ventas-items-modal__summary">Total venta: Bs {{ money(itemsModal.row?.total || 0) }}</div>
                <button type="button" class="btn ventas-action-btn" @click="closeItems">
                  <i class="fas fa-check"></i>
                  <span>Cerrar</span>
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
        if (estado === 'OBSERVADA' || estado === 'ANULACION_OBSERVADA') summary.observadas += 1;
        if (estado === 'RECEPCIONADA' || estado === 'CONTINGENCIA_CREADA' || estado === 'ANULACION_SOLICITADA') summary.pendientes += 1;
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
        this.notify('error', 'No se pudo cargar', msg);
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
        ANULADA: 'ANULADA',
        ANULACION_SOLICITADA: 'PENDIENTE ANULACION',
        ANULACION_OBSERVADA: 'ANULACION OBSERVADA',
        RECEPCIONADA: 'PENDIENTE',
        CONTINGENCIA_CREADA: 'PENDIENTE',
        OBSERVADA: 'RECHAZADA',
      };
      return map[(estado || '').toUpperCase()] || ((estado || 'SIN ESTADO').toUpperCase());
    },

    facturaHelp(estado) {
      const key = (estado || '').toUpperCase();
      if (key === 'PROCESADA') return 'Factura emitida correctamente.';
      if (key === 'ANULADA') return 'Factura anulada correctamente.';
      if (key === 'ANULACION_SOLICITADA') return 'Anulacion enviada; esperando notificacion final.';
      if (key === 'ANULACION_OBSERVADA') return 'La solicitud de anulacion fue observada.';
      if (key === 'RECEPCIONADA' || key === 'CONTINGENCIA_CREADA') return 'Emision en proceso de confirmacion.';
      if (key === 'OBSERVADA') return 'Requiere revision antes de reenviar.';
      return 'Sin observaciones registradas.';
    },

    facturaChipClass(estado) {
      const key = this.facturaLabel(estado);
      if (key === 'FACTURADA') return 'ventas-status-chip--success';
      if (key === 'ANULADA') return 'ventas-status-chip--muted';
      if (key === 'PENDIENTE') return 'ventas-status-chip--warning';
      if (key === 'PENDIENTE ANULACION') return 'ventas-status-chip--warning';
      if (key === 'RECHAZADA') return 'ventas-status-chip--danger';
      if (key === 'ANULACION OBSERVADA') return 'ventas-status-chip--danger';
      return 'ventas-status-chip--muted';
    },

    canAnular(row) {
      return Boolean(row?.cuf) && (row?.estadoSufe || '').toUpperCase() === 'PROCESADA';
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
        this.notify('success', 'Estado actualizado', res?.message || 'Consulta realizada correctamente.');
        await this.fetchVentas();
      } catch (error) {
        const msg = error?.response?.data?.message || 'No se pudo consultar la venta.';
        this.notify('error', 'No se pudo consultar', msg);
      } finally {
        this.load = false;
      }
    },

    async anularVenta(row) {
      if (!this.canAnular(row)) {
        this.notify('warning', 'No disponible', 'Solo se puede anular una factura procesada y con CUF.');
        return;
      }

      const { value: formValues } = await this.$swal.fire({
        title: 'Anular factura',
        html: `
          <div class="text-left">
            <label class="d-block small font-weight-bold mb-1">Motivo</label>
            <input id="annul-motivo" class="swal2-input" value="DATOS ERRONEOS EN LA FACTURA">
            <label class="d-block small font-weight-bold mt-3 mb-1">Tipo de anulacion</label>
            <select id="annul-tipo" class="swal2-select">
              <option value="1">1 - Factura mal emitida</option>
              <option value="2">2 - Nota credito-debito mal emitida</option>
              <option value="3" selected>3 - Datos de emision incorrectos</option>
              <option value="4">4 - Factura o nota devuelta</option>
            </select>
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Solicitar anulacion',
        cancelButtonText: 'Cancelar',
        buttonsStyling: false,
        customClass: {
          popup: 'ventas-swal',
          title: 'ventas-swal-title',
          htmlContainer: 'ventas-swal-body',
          confirmButton: 'ventas-swal-button ventas-swal-confirm-danger',
          cancelButton: 'ventas-swal-button ventas-swal-cancel',
          actions: 'ventas-swal-actions'
        },
        preConfirm: () => {
          const motivo = document.getElementById('annul-motivo')?.value?.trim();
          const tipoAnulacion = Number(document.getElementById('annul-tipo')?.value || 0);
          if (!motivo) {
            this.$swal.showValidationMessage('El motivo es obligatorio.');
            return false;
          }
          return { motivo, tipoAnulacion };
        },
      });

      if (!formValues) return;

      this.load = true;
      try {
        const response = await this.$admin.$patch(`ventas/anular/${row.cuf}`, formValues);
        this.notify('success', 'Solicitud enviada', response?.message || 'La anulacion fue recepcionada correctamente.');
        await this.fetchVentas();
      } catch (error) {
        const data = error?.response?.data || {};
        const msg = data.message || data.error || data.details?.mensaje || 'No se pudo solicitar la anulacion.';
        this.notify('error', 'No se pudo anular', msg);
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
        this.notify('error', 'No se cargaron los items', msg);
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
        this.notify('success', 'Reporte generado', 'El PDF se descargó correctamente.');
      } catch (error) {
        this.notify('error', 'No se pudo generar el PDF', 'Intenta nuevamente con otros filtros.');
      }
    },
    notify(icon, title, text = '') {
      return this.$swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        icon,
        title,
        text,
        timer: icon === 'error' ? 4200 : 2400,
        timerProgressBar: true,
        customClass: {
          popup: 'ventas-toast',
          title: 'ventas-toast-title',
          htmlContainer: 'ventas-toast-body',
          timerProgressBar: 'ventas-toast-progress'
        }
      });
    },
  },

  mounted() {
    this.fetchVentas();
  },
};
</script>

<style>
.ventas-wrap {
  padding-bottom: 1rem;
}

.ventas-hero {
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.98);
  overflow: hidden;
}

.ventas-hero .card-body,
.ventas-panel .card-body {
  padding: 1.55rem 1.65rem;
}

.ventas-header {
  gap: 1rem;
}

.ventas-heading {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.ventas-heading-icon {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #eef2ff;
  color: #5967d8;
  border: 1px solid #e0e7ff;
}

.ventas-kicker {
  color: #98a2b3;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.ventas-header h1 {
  font-size: 1.35rem;
  font-weight: 800;
  color: #1f2937;
}

.ventas-header-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.ventas-mini-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  background: #eef2ff;
  border: 1px solid #dfe5ff;
  color: #3442a8;
  font-size: 0.82rem;
  font-weight: 800;
}

.ventas-mini-badge--success {
  background: #ecfdf3;
  border-color: #abefc6;
  color: #067647;
}

.ventas-mini-badge--warning {
  background: #fff7df;
  border-color: #f6d77a;
  color: #8a6100;
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
  border: 1px solid #e6ebf3;
  border-radius: 16px;
  padding: 1rem 1.05rem;
  box-shadow: none;
  min-height: 142px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.18s ease;
}

.ventas-stat-card:hover {
  border-color: #d9defd;
  transform: translateY(-1px);
}

.ventas-stat-card--accent {
  background: #f8fafc;
}

.ventas-stat-card__label {
  color: #667085;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 0.65rem;
}

.ventas-stat-card__value {
  color: #1f2937;
  font-size: 1.55rem;
  line-height: 1;
  font-weight: 800;
  margin-bottom: 0.7rem;
}

.ventas-stat-card__meta {
  color: #667085;
  font-size: 0.82rem;
  line-height: 1.35;
}

.ventas-panel {
  border: 1px solid #e6ebf3;
  border-radius: 18px;
  box-shadow: none;
  overflow: hidden;
  background: #ffffff;
}

.ventas-panel__header {
  background: #f8fafc;
  border-bottom: 1px solid #e6ebf3;
  padding: 1rem 1.25rem;
}

.ventas-label {
  color: #344054;
  font-size: 0.82rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.ventas-control {
  min-height: 44px;
  border-radius: 14px;
  border-color: #d8e0ec;
  box-shadow: none;
}

.ventas-control:focus {
  border-color: #5967d8;
  box-shadow: 0 0 0 0.18rem rgba(89, 103, 216, 0.12);
}

.ventas-action-btn {
  min-height: 42px;
  border-radius: 13px;
  border: 1px solid #d8e0ec;
  background: #ffffff;
  color: #4b5565;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.82rem;
  font-weight: 800;
  box-shadow: none;
}

.ventas-action-btn-danger {
  background: #fff1f0;
  border-color: #f5b3ad;
  color: #b42318;
}

.ventas-table-count {
  color: #667085;
  font-size: 0.86rem;
  font-weight: 600;
}

.ventas-table thead th {
  background: #f7f9fc;
  border-bottom: 1px solid #e6ebf3;
  color: #667085;
  font-size: 0.79rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  white-space: nowrap;
}

.ventas-table td {
  vertical-align: top;
  border-top: 1px solid #eef2f7;
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.ventas-table__primary {
  color: #24324d;
  font-weight: 700;
}

.ventas-table__secondary {
  color: #667085;
  font-size: 0.83rem;
  margin-top: 0.25rem;
}

.ventas-table__amount {
  color: #1f2937;
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
  background: #eef2ff;
  border: 1px solid #dfe5ff;
  color: #3442a8;
  font-weight: 800;
}

.ventas-count-pill--button {
  cursor: pointer;
}

.ventas-table-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.ventas-icon-action {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: 1px solid #d8e0ec;
  background: #ffffff;
  color: #4b5565;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
}

.ventas-icon-action-danger {
  background: #fff1f0;
  border-color: #f5b3ad;
  color: #b42318;
}

.ventas-icon-action-pdf {
  background: #fff7df;
  border-color: #f6d77a;
  color: #8a6100;
}

.ventas-icon-action-dark {
  background: #1f2937;
  border-color: rgba(31, 41, 55, 0.16);
  color: #ffffff;
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
  background: #eef2ff;
  color: #3442a8;
  border-color: #dfe5ff;
}

.ventas-status-chip--success {
  background: #ecfdf3;
  color: #067647;
  border-color: #abefc6;
}

.ventas-status-chip--warning {
  background: #fff7df;
  color: #8a6100;
  border-color: #f6d77a;
}

.ventas-status-chip--danger {
  background: #fff1f0;
  color: #b42318;
  border-color: #f5b3ad;
}

.ventas-status-chip--muted {
  background: #f1f5f9;
  color: #475569;
  border-color: #e2e8f0;
}

.ventas-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.48);
  backdrop-filter: blur(8px);
  z-index: 2050;
}

.ventas-modal-visible {
  z-index: 2060;
}

.ventas-items-modal {
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid #e6ebf3;
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.24);
}

.ventas-items-modal__header {
  background: #f8fafc;
  border-bottom: 1px solid #e6ebf3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.2rem 1.35rem;
}

.ventas-items-modal__title {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-width: 0;
}

.ventas-items-modal__title h5 {
  color: #1f2937;
  font-size: 1.08rem;
  font-weight: 800;
}

.ventas-items-modal__icon {
  width: 44px;
  height: 44px;
  border-radius: 15px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #eef2ff;
  border: 1px solid #dfe5ff;
  color: #5967d8;
}

.ventas-items-modal__close {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid #e6ebf3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #ffffff;
  color: #667085;
}

.ventas-items-modal__close:hover {
  background: #fff1f0;
  border-color: #fecdc9;
  color: #b42318;
}

.ventas-items-modal__subtitle {
  margin-top: 0.25rem;
  color: #667085;
  font-size: 0.85rem;
}

.ventas-items-modal__body {
  padding: 1.2rem;
}

.ventas-items-modal__meta {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.ventas-items-modal__meta span,
.ventas-items-modal__meta strong {
  min-height: 34px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.42rem 0.75rem;
  border: 1px solid #e6ebf3;
  background: #f8fafc;
  color: #667085;
  font-size: 0.82rem;
  font-weight: 800;
}

.ventas-items-modal__meta strong {
  background: #eef2ff;
  border-color: #dfe5ff;
  color: #3442a8;
}

.ventas-items-table-wrap {
  border: 1px solid #e6ebf3;
  border-radius: 16px;
  overflow: hidden;
}

.ventas-items-table thead th {
  background: #f7f9fc;
  color: #667085;
  border-bottom: 1px solid #e6ebf3;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.ventas-items-table td {
  vertical-align: top;
  border-top: 1px solid #eef2f7;
  padding-top: 0.9rem;
  padding-bottom: 0.9rem;
}

.ventas-item-code {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0.3rem 0.62rem;
  border-radius: 999px;
  background: #eef2ff;
  border: 1px solid #dfe5ff;
  color: #3442a8;
  font-size: 0.78rem;
  font-weight: 800;
}

.ventas-items-table__qty {
  display: inline-flex;
  min-width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #fff7df;
  color: #8a6100;
  font-weight: 800;
}

.ventas-items-table__total {
  color: #1f2937;
  font-weight: 800;
}

.ventas-items-empty {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  color: #667085;
}

.ventas-items-empty i {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border: 1px solid #e6ebf3;
  color: #5967d8;
}

.ventas-items-empty strong {
  color: #1f2937;
  font-weight: 800;
}

.ventas-items-empty span {
  color: #667085;
  font-size: 0.9rem;
}

.ventas-items-modal__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.2rem 1.15rem;
  border-top: 1px solid #e6ebf3;
  background: #ffffff;
}

.ventas-items-modal__summary {
  color: #1f2937;
  font-weight: 800;
}

.ventas-panel .card-footer {
  background: #ffffff;
  border-top: 1px solid #e6ebf3;
}

.ventas-panel .enterprise-pagination {
  gap: 0.4rem;
  padding: 0.35rem;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #e6ebf3;
}

.ventas-panel .enterprise-pagination .page-link {
  min-width: 36px !important;
  width: 36px !important;
  height: 36px !important;
  padding: 0 !important;
  border-radius: 12px !important;
  border: 1px solid transparent !important;
  background: transparent !important;
  box-shadow: none !important;
  color: #667085 !important;
  font-size: 0.82rem !important;
  font-weight: 800 !important;
}

.ventas-panel .enterprise-pagination .page-item.active .page-link {
  background: #5967d8 !important;
  border-color: #5967d8 !important;
  color: #ffffff !important;
}

.ventas-panel .enterprise-pagination .page-item.disabled .page-link {
  color: #aab4c6 !important;
  opacity: 0.72;
}

.ventas-toast,
.ventas-swal {
  border-radius: 16px !important;
  background: #ffffff !important;
  border: 1px solid #e6ebf3 !important;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.16) !important;
}

.ventas-toast {
  width: min(420px, calc(100vw - 24px)) !important;
  padding: 0.95rem 1rem !important;
}

.ventas-toast-title,
.ventas-swal-title {
  color: #1f2937 !important;
  font-weight: 800 !important;
}

.ventas-toast-body,
.ventas-swal-body {
  color: #667085 !important;
  font-weight: 600 !important;
}

.ventas-toast-progress {
  background: rgba(89, 103, 216, 0.22) !important;
}

.ventas-swal {
  width: min(460px, calc(100vw - 28px)) !important;
  padding: 1.5rem !important;
}

.ventas-swal-actions {
  gap: 0.7rem !important;
}

.ventas-swal-button {
  min-width: 132px;
  min-height: 42px;
  border-radius: 13px;
  border: 1px solid transparent;
  padding: 0.68rem 1rem;
  font-size: 0.82rem;
  font-weight: 800;
}

.ventas-swal-cancel {
  background: #ffffff;
  border-color: #d8e0ec;
  color: #4b5565;
}

.ventas-swal-confirm-danger {
  background: #b42318;
  border-color: #b42318;
  color: #ffffff;
}

body.enterprise-dark .ventas-hero,
body.enterprise-dark .ventas-panel,
body.enterprise-dark .ventas-stat-card,
body.enterprise-dark .ventas-items-modal,
body.enterprise-dark .ventas-toast,
body.enterprise-dark .ventas-swal {
  background: #151e2b !important;
  border-color: rgba(82, 99, 128, 0.78) !important;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.25) !important;
}

body.enterprise-dark .ventas-header h1,
body.enterprise-dark .ventas-stat-card__value,
body.enterprise-dark .ventas-table__primary,
body.enterprise-dark .ventas-table__amount,
body.enterprise-dark .ventas-items-modal__title h5,
body.enterprise-dark .ventas-items-empty strong,
body.enterprise-dark .ventas-items-table__total,
body.enterprise-dark .ventas-items-modal__summary,
body.enterprise-dark .ventas-toast-title,
body.enterprise-dark .ventas-swal-title {
  color: #f8fafc !important;
}

body.enterprise-dark .ventas-kicker,
body.enterprise-dark .ventas-stat-card__label,
body.enterprise-dark .ventas-table thead th,
body.enterprise-dark .ventas-items-table thead th {
  color: #aab4c6 !important;
}

body.enterprise-dark .ventas-wrap .text-muted,
body.enterprise-dark .ventas-stat-card__meta,
body.enterprise-dark .ventas-table__secondary,
body.enterprise-dark .ventas-items-modal__subtitle,
body.enterprise-dark .ventas-items-empty,
body.enterprise-dark .ventas-items-empty span,
body.enterprise-dark .ventas-toast-body,
body.enterprise-dark .ventas-swal-body,
body.enterprise-dark .ventas-table-count {
  color: #94a3b8 !important;
}

body.enterprise-dark .ventas-heading-icon {
  background: rgba(89, 103, 216, 0.18) !important;
  border-color: rgba(129, 140, 248, 0.3) !important;
  color: #c7d2fe !important;
}

body.enterprise-dark .ventas-items-modal__icon,
body.enterprise-dark .ventas-items-empty i,
body.enterprise-dark .ventas-item-code {
  background: rgba(89, 103, 216, 0.18) !important;
  border-color: rgba(129, 140, 248, 0.3) !important;
  color: #c7d2fe !important;
}

body.enterprise-dark .ventas-panel__header,
body.enterprise-dark .ventas-table thead th,
body.enterprise-dark .ventas-items-modal__header,
body.enterprise-dark .ventas-items-table thead th,
body.enterprise-dark .ventas-panel .card-footer,
body.enterprise-dark .ventas-items-modal__footer {
  background: #111b2a !important;
  border-color: rgba(82, 99, 128, 0.72) !important;
}

body.enterprise-dark .ventas-control,
body.enterprise-dark .swal2-input,
body.enterprise-dark .swal2-select {
  background: #0f1726 !important;
  border-color: rgba(82, 99, 128, 0.86) !important;
  color: #e5e7eb !important;
}

body.enterprise-dark .ventas-control::placeholder {
  color: #728198 !important;
}

body.enterprise-dark .ventas-label {
  color: #e5e7eb !important;
}

body.enterprise-dark .ventas-table td,
body.enterprise-dark .ventas-items-table td {
  border-color: rgba(82, 99, 128, 0.48) !important;
}

body.enterprise-dark .ventas-action-btn,
body.enterprise-dark .ventas-icon-action,
body.enterprise-dark .ventas-count-pill,
body.enterprise-dark .ventas-panel .enterprise-pagination,
body.enterprise-dark .ventas-items-modal__close,
body.enterprise-dark .ventas-items-modal__meta span,
body.enterprise-dark .ventas-items-table-wrap {
  background: #101827 !important;
  border-color: rgba(82, 99, 128, 0.78) !important;
  color: #cbd5e1 !important;
}

body.enterprise-dark .ventas-items-modal__meta strong {
  background: rgba(89, 103, 216, 0.18) !important;
  border-color: rgba(129, 140, 248, 0.3) !important;
  color: #c7d2fe !important;
}

body.enterprise-dark .ventas-icon-action-danger,
body.enterprise-dark .ventas-status-chip--danger {
  background: rgba(239, 68, 68, 0.14) !important;
  border-color: rgba(239, 68, 68, 0.32) !important;
  color: #fca5a5 !important;
}

body.enterprise-dark .ventas-icon-action-pdf,
body.enterprise-dark .ventas-status-chip--warning,
body.enterprise-dark .ventas-mini-badge--warning,
body.enterprise-dark .ventas-items-table__qty {
  background: rgba(245, 158, 11, 0.16) !important;
  border-color: rgba(245, 158, 11, 0.32) !important;
  color: #fbbf24 !important;
}

body.enterprise-dark .ventas-status-chip--success,
body.enterprise-dark .ventas-mini-badge--success {
  background: rgba(34, 197, 94, 0.14) !important;
  border-color: rgba(34, 197, 94, 0.28) !important;
  color: #86efac !important;
}

body.enterprise-dark .ventas-status-chip--primary,
body.enterprise-dark .ventas-mini-badge {
  background: rgba(89, 103, 216, 0.18) !important;
  border-color: rgba(129, 140, 248, 0.3) !important;
  color: #c7d2fe !important;
}

body.enterprise-dark .ventas-status-chip--muted {
  background: rgba(148, 163, 184, 0.12) !important;
  border-color: rgba(148, 163, 184, 0.24) !important;
  color: #cbd5e1 !important;
}

body.enterprise-dark .ventas-panel .enterprise-pagination .page-link {
  color: #94a3b8 !important;
}

body.enterprise-dark .ventas-panel .enterprise-pagination .page-item.active .page-link {
  background: #5967d8 !important;
  color: #ffffff !important;
}

body.enterprise-dark .ventas-swal-cancel {
  background: #101827;
  border-color: rgba(82, 99, 128, 0.78);
  color: #cbd5e1;
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
