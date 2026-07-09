<template>
  <div>
    <JcLoader :load="load" />
    <AdminTemplate :page="page" :modulo="modulo">
      <div slot="body" class="branch-dashboard-page enterprise-page-shell">
        <section class="branch-hero-card enterprise-filter-card">
          <div class="branch-hero-head">
            <div>
              <p class="branch-kicker">Dashboard de ventas por usuario</p>
              <h2 class="branch-title">{{ branchLabel }}</h2>
              <p class="branch-copy">
                Código sucursal {{ filters.codigoSucursal || 'N/D' }} · Punto de venta {{ filters.puntoVenta || 'N/D' }}
              </p>
            </div>

            <div class="branch-hero-actions">
              <button class="hero-back-btn" type="button" @click="$router.push('/cajero/ventas/lista')">
                <i class="fas fa-arrow-left"></i>
                <span>Volver</span>
              </button>
              <button class="hero-back-btn hero-export-btn" type="button" @click="downloadKardexPdf">
                <i class="fas fa-file-pdf"></i>
                <span>Exportar PDF</span>
              </button>
              <div class="branch-hero-badge">
                <i class="fas fa-users"></i>
                <span>{{ visibleVentas.length }} ventas</span>
              </div>
            </div>
          </div>

          <div class="branch-filter-grid">
            <label class="branch-filter-field">
              <span>Fecha inicio</span>
              <input v-model="filters.fechaInicio" type="date" />
            </label>
            <label class="branch-filter-field">
              <span>Fecha fin</span>
              <input v-model="filters.fechaFin" type="date" />
            </label>
          </div>
        </section>

        <section class="stats-grid">
          <div class="stat-card stat-card-red">
            <div class="stat-icon"><i class="fas fa-tag"></i></div>
            <div class="stat-copy">
              <span>Ventas totales</span>
              <strong>{{ formatCurrency(summary.total) }}</strong>
              <small>{{ summary.count }} transacciones</small>
            </div>
          </div>

          <div class="stat-card stat-card-green">
            <div class="stat-icon"><i class="fas fa-file-invoice-dollar"></i></div>
            <div class="stat-copy">
              <span>Total facturado</span>
              <strong>{{ formatCurrency(summary.total) }}</strong>
              <small>Ventas de la sucursal</small>
            </div>
          </div>

          <div class="stat-card stat-card-yellow">
            <div class="stat-icon"><i class="fas fa-percentage"></i></div>
            <div class="stat-copy">
              <span>Usuarios</span>
              <strong>{{ userSummaries.length }}</strong>
              <small>Facturadores activos</small>
            </div>
          </div>

          <div class="stat-card stat-card-gray">
            <div class="stat-icon"><i class="fas fa-exchange-alt"></i></div>
            <div class="stat-copy">
              <span>Promedio</span>
              <strong>{{ formatCurrency(summary.count ? summary.total / summary.count : 0) }}</strong>
              <small>Por venta</small>
            </div>
          </div>
        </section>

        <section v-if="error" class="error-card">
          <h3>No se pudo cargar el reporte</h3>
          <p>{{ error }}</p>
        </section>

        <template v-else>
          <section class="branch-workspace">
            <aside class="branch-selector-card enterprise-content-card">
              <div class="selector-head">
                <div>
                  <p class="detail-kicker mb-2">Paso 2 · Kardex por usuario</p>
                  <h3 class="mb-1">Facturadores</h3>
                  <p class="detail-copy mb-0">Primero eliges la sucursal y luego revisas el kardex por cajero.</p>
                </div>
              </div>

              <label class="selector-search">
                <i class="fas fa-search"></i>
                <input v-model.trim="userSearch" type="text" placeholder="Buscar usuario..." />
              </label>

              <div class="selector-list">
                <button
                  type="button"
                  class="selector-item"
                  :class="{ active: activeUserId === 'all' }"
                  @click="selectUser('all')"
                >
                  <span class="selector-name">Todos los usuarios</span>
                  <small>{{ visibleVentas.length }} venta(s)</small>
                </button>

                <button
                  v-for="user in filteredUserSummaries"
                  :key="user.id"
                  type="button"
                  class="selector-item"
                  :class="{ active: activeUserId === user.id }"
                  @click="selectUser(user.id)"
                >
                  <span class="selector-name">{{ user.nombre }}</span>
                  <small>{{ user.ventas }} venta(s) · {{ formatCurrency(user.total) }}</small>
                </button>
              </div>
            </aside>

            <section class="branch-main-card enterprise-content-card">
              <div class="branch-tabs">
                <button
                  type="button"
                  class="branch-tab"
                  :class="{ active: activeTab === 'resumen' }"
                  @click="activeTab = 'resumen'"
                >
                  Resumen
                </button>
                <button
                  type="button"
                  class="branch-tab"
                  :class="{ active: activeTab === 'detalle' }"
                  @click="activeTab = 'detalle'"
                >
                  Detalle de ventas
                </button>
                <button
                  type="button"
                  class="branch-tab"
                  :class="{ active: activeTab === 'comparativo' }"
                  @click="activeTab = 'comparativo'"
                >
                  Comparativo
                </button>

                <div class="branch-range-chip">
                  <i class="fas fa-calendar-alt"></i>
                  <span>{{ currentDateRangeLabel }}</span>
                </div>

                <div class="branch-range-chip">
                  <i class="fas fa-user"></i>
                  <span>{{ activeUserLabel }}</span>
                </div>
              </div>

              <div v-if="activeTab === 'resumen'" class="branch-summary-grid">
                <div class="branch-summary-card">
                  <span>Ventas filtradas</span>
                  <strong>{{ filteredVentas.length }}</strong>
                </div>
                <div class="branch-summary-card">
                  <span>Total filtrado</span>
                  <strong>{{ formatCurrency(summary.total) }}</strong>
                </div>
                <div class="branch-summary-card">
                  <span>Usuarios visibles</span>
                  <strong>{{ filteredUserSummaries.length }}</strong>
                </div>
                <div class="branch-summary-card">
                  <span>Promedio</span>
                  <strong>{{ formatCurrency(summary.count ? summary.total / summary.count : 0) }}</strong>
                </div>
                <div class="branch-summary-card">
                  <span>Factura electrónica</span>
                  <strong>{{ deliverySummary.factura_electronica.count }}</strong>
                  <small>{{ formatCurrency(deliverySummary.factura_electronica.total) }}</small>
                </div>
                <div class="branch-summary-card">
                  <span>QR</span>
                  <strong>{{ deliverySummary.qr.count }}</strong>
                  <small>{{ formatCurrency(deliverySummary.qr.total) }}</small>
                </div>
                <div class="branch-summary-card">
                  <span>Registro oficial</span>
                  <strong>{{ deliverySummary.oficial.count }}</strong>
                  <small>{{ formatCurrency(deliverySummary.oficial.total) }}</small>
                </div>
              </div>

              <div v-if="activeTab === 'resumen'" class="table-wrap enterprise-table-wrap branch-resume-table">
                <table class="sales-table enterprise-table">
                  <thead>
                    <tr>
                      <th>Cajero</th>
                      <th>Ventas</th>
                      <th>Total</th>
                      <th>Factura electrónica</th>
                      <th>Total factura electrónica</th>
                      <th>QR</th>
                      <th>Total QR</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="user in filteredUserSummaries" :key="user.id">
                      <td><strong>{{ user.nombre }}</strong></td>
                      <td>{{ user.ventas }}</td>
                      <td><strong class="amount-text">{{ formatCurrency(user.total) }}</strong></td>
                      <td>{{ user.deliveries.factura_electronica.count }}</td>
                      <td>{{ formatCurrency(user.deliveries.factura_electronica.total) }}</td>
                      <td>{{ user.deliveries.qr.count }}</td>
                      <td>{{ formatCurrency(user.deliveries.qr.total) }}</td>
                    </tr>
                    <tr v-if="!filteredUserSummaries.length">
                      <td colspan="7" class="empty-state-cell">No hay cajeros visibles para el rango seleccionado.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-else-if="activeTab === 'comparativo'" class="branch-comparative">
                <div class="branch-comparative-card">
                  <h4>Ranking de usuarios</h4>
                  <div class="ranking-list">
                    <div v-for="user in userSummaries" :key="user.id" class="ranking-item">
                      <div>
                        <strong>{{ user.nombre }}</strong>
                        <small>
                          {{ user.ventas }} venta(s) · Factura electrónica {{ user.deliveries.factura_electronica.count }} · QR {{ user.deliveries.qr.count }}
                        </small>
                      </div>
                      <strong>{{ formatCurrency(user.total) }}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else>
                <div v-if="!filteredVentas.length" class="empty-state">
                  <h3>Sin ventas</h3>
                  <p>No encontramos ventas para esta sucursal con los filtros actuales.</p>
                </div>

                <div v-else class="table-wrap enterprise-table-wrap">
                  <div class="detail-filters">
                    <label class="detail-filter-field detail-filter-field-search">
                      <i class="fas fa-search"></i>
                      <input v-model.trim="detailFilters.q" type="text" placeholder="Buscar por código, cliente o seguimiento..." />
                    </label>
                    <label class="detail-filter-field">
                      <span>Estado</span>
                      <select v-model="detailFilters.estado">
                        <option value="all">Todos</option>
                        <option value="emitido">Emitido</option>
                        <option value="pendiente_pago">Pendiente QR</option>
                        <option value="borrador">Borrador</option>
                      </select>
                    </label>
                    <label class="detail-filter-field">
                      <span>Emisión</span>
                      <select v-model="detailFilters.estadoEmision">
                        <option value="all">Todos</option>
                        <option value="FACTURADA">Facturada</option>
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="RECHAZADA">Rechazada</option>
                        <option value="NO_APLICA">No aplica</option>
                        <option value="ERROR">Error</option>
                      </select>
                    </label>
                    <label class="detail-filter-field">
                      <span>Registros</span>
                      <select v-model.number="pageSize">
                        <option :value="5">5</option>
                        <option :value="10">10</option>
                        <option :value="20">20</option>
                        <option :value="50">50</option>
                      </select>
                    </label>
                  </div>

                  <table class="sales-table enterprise-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Código orden</th>
                        <th>Cliente</th>
                        <th>Facturación</th>
                        <th>Estado</th>
                        <th>Items</th>
                        <th>Monto</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="venta in paginatedVentas" :key="venta.id">
                        <td>
                          <div class="cell-stack">
                            <strong>{{ formatDate(venta.fecha) }}</strong>
                            <small>{{ usuarioNombre(venta) }}</small>
                          </div>
                        </td>
                        <td>
                          <div class="cell-stack">
                            <strong>{{ venta.codigoOrden || `#${venta.id}` }}</strong>
                            <small>{{ venta.codigoSeguimiento || venta.qr_transaction_id || 'Sin seguimiento' }}</small>
                          </div>
                        </td>
                        <td>
                          <div class="cell-stack">
                            <strong>{{ venta.cliente?.razonSocial || 'SIN NOMBRE' }}</strong>
                            <small>{{ venta.cliente?.documentoIdentidad || 'Sin documento' }}</small>
                          </div>
                        </td>
                        <td>
                          <div class="cell-stack">
                            <strong>
                              <span class="status-pill" :class="channelPillClass(venta)">
                                {{ deliveryChannelLabel(venta) }}
                              </span>
                            </strong>
                            <small>{{ facturacionModeLabel(venta) }}</small>
                          </div>
                        </td>
                        <td>
                          <div class="cell-stack">
                            <strong>
                              <span class="status-pill" :class="statusPillClass(venta)">
                                {{ emissionStateLabel(venta) }}
                              </span>
                            </strong>
                            <small>{{ cartStateLabel(venta) }}</small>
                          </div>
                        </td>
                        <td><strong>{{ ventaItemsCount(venta) }}</strong></td>
                        <td><strong class="amount-text">{{ formatCurrency(venta.total) }}</strong></td>
                        <td>
                          <div class="table-actions">
                            <button
                              v-if="canAnularVenta(venta)"
                              class="action-danger-btn"
                              type="button"
                              @click="anularVenta(venta)"
                            >
                              <i class="fas fa-ban"></i>
                              <span>Anular</span>
                            </button>
                            <button class="action-view-btn" type="button" @click="openVentaDetail(venta)">
                              <i class="fas fa-eye"></i>
                              <span>Detalle</span>
                            </button>
                            <a
                              v-if="pdfOriginalUrl(venta)"
                              class="action-secondary-btn"
                              :href="pdfOriginalUrl(venta)"
                              target="_blank"
                              rel="noopener"
                            >
                              <i class="fas fa-file-pdf"></i>
                              <span>PDF</span>
                            </a>
                            <button
                              v-else-if="!isCartVenta(venta)"
                              class="action-secondary-btn"
                              type="button"
                              @click="$router.push(`/cajero/ventas/invoice/${venta.id}`)"
                            >
                              <i class="fas fa-receipt"></i>
                              <span>Ver</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div class="table-footer">
                    <p class="footer-copy">
                      Mostrando {{ rangeStart }} a {{ rangeEnd }} de {{ filteredVentas.length }} ventas
                    </p>

                    <div class="pager">
                      <button class="pager-btn" type="button" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
                        <i class="fa fa-angle-left"></i>
                      </button>

                      <button
                        v-for="page in visiblePages"
                        :key="page"
                        type="button"
                        class="pager-btn"
                        :class="{ active: page === currentPage }"
                        @click="goToPage(page)"
                      >
                        {{ page }}
                      </button>

                      <button class="pager-btn" type="button" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
                        <i class="fa fa-angle-right"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </section>
        </template>

        <div v-if="activeDetailVenta" class="detail-modal-backdrop" @click.self="activeDetailVenta = null">
          <div class="detail-modal-card">
            <div class="detail-modal-head">
              <div>
                <p class="detail-kicker mb-1">Detalle de venta</p>
                <h3>{{ activeDetailVenta.codigoOrden || `Venta ${activeDetailVenta.id}` }}</h3>
                <p class="detail-copy mb-0">{{ activeDetailVenta.cliente?.razonSocial || 'Sin cliente registrado' }}</p>
              </div>
              <button type="button" class="detail-modal-close" @click="activeDetailVenta = null">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="detail-modal-meta">
              <span>{{ formatDate(activeDetailVenta.fecha) }}</span>
              <span>{{ deliveryChannelLabel(activeDetailVenta) }}</span>
              <span>{{ emissionStateLabel(activeDetailVenta) }}</span>
              <strong>{{ formatCurrency(activeDetailVenta.total) }}</strong>
            </div>

            <div class="detail-modal-body">
              <table class="sales-table enterprise-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Detalle</th>
                    <th>Cantidad</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in activeDetailVenta.detalle || []" :key="`${activeDetailVenta.id}-${index}`">
                    <td>{{ item.codigo || `ITEM-${index + 1}` }}</td>
                    <td>
                      <div class="cell-stack">
                        <strong>{{ item.descripcion || item.titulo || 'Sin detalle' }}</strong>
                        <small>{{ item.subtitulo || item.titulo || item.origen_tipo || '' }}</small>
                      </div>
                    </td>
                    <td>{{ item.cantidad || 1 }}</td>
                    <td>{{ formatCurrency(item.total_linea || ((item.precio || 0) * (item.cantidad || 1))) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminTemplate>
  </div>
</template>

<script>
export default {
  data() {
    return {
      load: false,
      page: 'Ventas',
      modulo: 'Kardex',
      error: '',
      isSyncingFilters: false,
      searchTimer: null,
      filters: {
        fechaInicio: '',
        fechaFin: '',
        codigoSucursal: '',
        puntoVenta: '',
        q: ''
      },
      userSearch: '',
      activeUserId: 'all',
      activeTab: 'resumen',
      currentPage: 1,
      pageSize: 5,
      detailFilters: {
        q: '',
        estado: 'all',
        estadoEmision: 'all'
      },
      activeDetailVenta: null,
      branchName: '',
      branchDepartment: '',
      ventas: []
    };
  },
  computed: {
    branchLabel() {
      return this.branchDepartment || this.branchName || 'Sucursal';
    },
    currentDateRangeLabel() {
      const start = this.filters.fechaInicio ? this.formatShortDate(this.filters.fechaInicio) : 'sin inicio';
      const end = this.filters.fechaFin ? this.formatShortDate(this.filters.fechaFin) : 'sin fin';
      return start === end ? start : `${start} - ${end}`;
    },
    activeUserLabel() {
      if (this.activeUserId === 'all') {
        return 'Historial completo de la sucursal';
      }

      const match = this.userSummaries.find((user) => user.id === this.activeUserId);
      return match ? `Ventas de ${match.nombre}` : 'Historial filtrado';
    },
    visibleVentas() {
      return this.ventas.filter((venta) => this.isVentaInDateRange(venta));
    },
    filteredVentas() {
      const ventas = this.activeUserId === 'all'
        ? this.visibleVentas
        : this.visibleVentas.filter((venta) => this.usuarioId(venta) === this.activeUserId);

      return ventas.filter((venta) => this.matchesDetailFilters(venta));
    },
    userSummaries() {
      const map = new Map();

      this.visibleVentas.forEach((venta) => {
        const id = this.usuarioId(venta);
        const nombre = this.usuarioNombre(venta);
        const deliveryType = this.resolveDeliveryType(venta);

        if (!map.has(id)) {
          map.set(id, {
            id,
            nombre,
            ventas: 0,
            total: 0,
            deliveries: this.buildDeliveryAccumulator()
          });
        }

        const current = map.get(id);
        current.ventas += 1;
        current.total += Number(venta.total || 0);
        current.deliveries[deliveryType.key].count += 1;
        current.deliveries[deliveryType.key].total += Number(venta.total || 0);
      });

      return Array.from(map.values()).sort((a, b) => b.ventas - a.ventas);
    },
    filteredUserSummaries() {
      const term = (this.userSearch || '').toString().toLowerCase();
      return this.userSummaries.filter((user) => {
        const nombre = (user.nombre || '').toString().toLowerCase();
        return nombre.includes(term);
      });
    },
    summary() {
      return this.filteredVentas.reduce((acc, venta) => {
        acc.total += Number(venta.total || 0);
        acc.count += 1;
        return acc;
      }, { total: 0, count: 0 });
    },
    deliverySummary() {
      return this.filteredVentas.reduce((acc, venta) => {
        const delivery = this.resolveDeliveryType(venta);
        acc[delivery.key].count += 1;
        acc[delivery.key].total += Number(venta.total || 0);
        return acc;
      }, this.buildDeliveryAccumulator());
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.filteredVentas.length / this.pageSize));
    },
    paginatedVentas() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredVentas.slice(start, start + this.pageSize);
    },
    rangeStart() {
      if (!this.filteredVentas.length) {
        return 0;
      }

      return ((this.currentPage - 1) * this.pageSize) + 1;
    },
    rangeEnd() {
      return Math.min(this.currentPage * this.pageSize, this.filteredVentas.length);
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
    }
  },
  mounted() {
    this.syncRouteFilters();
    this.loadVentas();
  },
  beforeDestroy() {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
  },
  watch: {
    'filters.q'() {
      this.currentPage = 1;
      this.activeUserId = 'all';
      this.scheduleLoadVentas();
    },
    'filters.fechaInicio'() {
      this.currentPage = 1;
      this.scheduleLoadVentas();
    },
    'filters.fechaFin'() {
      this.currentPage = 1;
      this.scheduleLoadVentas();
    },
    'detailFilters.q'() {
      this.currentPage = 1;
    },
    'detailFilters.estado'() {
      this.currentPage = 1;
    },
    'detailFilters.estadoEmision'() {
      this.currentPage = 1;
    },
    pageSize() {
      this.currentPage = 1;
    }
  },
  methods: {
    syncRouteFilters() {
      this.isSyncingFilters = true;
      const hasFechaInicio = Object.prototype.hasOwnProperty.call(this.$route.query, 'fechaInicio');
      const hasFechaFin = Object.prototype.hasOwnProperty.call(this.$route.query, 'fechaFin');
      const fechaInicio = hasFechaInicio ? this.$route.query.fechaInicio : '';
      const fechaFin = hasFechaFin ? this.$route.query.fechaFin : '';

      this.filters.fechaInicio = fechaInicio;
      this.filters.fechaFin = fechaFin;
      this.filters.codigoSucursal = this.$route.query.codigoSucursal || '';
      this.filters.puntoVenta = this.$route.query.puntoVenta || '';
      this.branchName = this.$route.query.nombre || '';
      this.branchDepartment = this.$route.query.departamento || '';
      this.isSyncingFilters = false;
    },
    formatShortDate(value) {
      if (!value) {
        return '-';
      }

      const date = new Date(`${value}T00:00:00`);
      if (Number.isNaN(date.getTime())) {
        return value;
      }

      return date.toLocaleDateString('es-BO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    },
    ventaDateValue(venta) {
      if (!venta?.fecha) {
        return '';
      }

      if (typeof venta.fecha === 'string') {
        const match = venta.fecha.match(/^(\d{4}-\d{2}-\d{2})/);
        if (match) {
          return match[1];
        }
      }

      const date = new Date(venta.fecha);
      if (Number.isNaN(date.getTime())) {
        return '';
      }

      const year = date.getFullYear();
      const month = `${date.getMonth() + 1}`.padStart(2, '0');
      const day = `${date.getDate()}`.padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    isVentaInDateRange(venta) {
      const ventaDate = this.ventaDateValue(venta);
      if (!ventaDate) {
        return true;
      }

      if (this.filters.fechaInicio && ventaDate < this.filters.fechaInicio) {
        return false;
      }

      if (this.filters.fechaFin && ventaDate > this.filters.fechaFin) {
        return false;
      }

      return true;
    },
    buildDeliveryAccumulator() {
      return {
        factura_electronica: { key: 'factura_electronica', label: 'Factura electronica', count: 0, total: 0 },
        qr: { key: 'qr', label: 'QR', count: 0, total: 0 },
        oficial: { key: 'oficial', label: 'Registro oficial', count: 0, total: 0 }
      };
    },
    resolveDeliveryType(venta) {
      const codigoOrden = String(venta?.codigoOrden || '').trim().toUpperCase();
      const razonSocial = String(venta?.cliente?.razonSocial || venta?.razon_social || '').trim().toUpperCase();
      const estadoSufeRaw = String(
        venta?.respuesta_emision?.estadoSufe
        || venta?.estadoSufe
        || venta?.estado_sufe
        || ''
      ).trim().toUpperCase();
      const canalEmisionRaw = String(venta?.canal_emision || venta?.canalEmision || '').trim().toLowerCase();
      const isOficial = Boolean(venta?.es_oficial)
        || codigoOrden.startsWith('OFI-')
        || razonSocial === 'ENVIO OFICIAL'
        || estadoSufeRaw === 'REGISTRADA_OFICIAL';

      if (canalEmisionRaw === 'qr') {
        return { key: 'qr', label: 'QR' };
      }

      if (canalEmisionRaw === 'oficial') {
        return { key: 'oficial', label: 'Registro oficial' };
      }

      if (canalEmisionRaw === 'factura_electronica') {
        return { key: 'factura_electronica', label: 'Factura electronica' };
      }

      if (isOficial) {
        return { key: 'oficial', label: 'Registro oficial' };
      }

      if (codigoOrden.startsWith('VQ-')) {
        return { key: 'qr', label: 'QR' };
      }

      if (codigoOrden.startsWith('VF-') || codigoOrden.startsWith('V-')) {
        return { key: 'factura_electronica', label: 'Factura electronica' };
      }

      const hasQrAsset = Boolean(
        venta?.qr
        || venta?.qrUrl
        || venta?.urlQr
        || venta?.codigoQr
        || venta?.codigoQR
        || venta?.seguimiento?.qr
        || venta?.seguimiento?.urlQr
      );

      if (hasQrAsset) {
        return { key: 'qr', label: 'QR' };
      }

      const candidates = [
        venta?.canal_emision,
        venta?.canalEmision,
        venta?.metodo_pago,
        venta?.metodoPago,
        venta?.estado_pago,
        venta?.estadoPago,
        venta?.tipoEntrega,
        venta?.entrega,
        venta?.canalEntrega,
        venta?.formatoEntrega,
        venta?.modalidadEntrega,
        venta?.metodoEntrega,
        venta?.metodoPagoLabel,
        venta?.metodoPagoDescripcion,
        venta?.tipoFactura,
        venta?.formatoFactura,
        venta?.seguimiento?.tipoEntrega,
        venta?.seguimiento?.tipoEmision
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());

      if (candidates.some((value) => value.includes('qr') || value.includes('digital'))) {
        return { key: 'qr', label: 'QR' };
      }

      if (candidates.some((value) => value.includes('oficial'))) {
        return { key: 'oficial', label: 'Registro oficial' };
      }

      return { key: 'factura_electronica', label: 'Factura electronica' };
    },
    isCartVenta(venta) {
      return String(venta?.origenVentaTipo || '').includes('facturacion_cart')
        || String(venta?.id || '').startsWith('cart-')
        || Number(venta?.cartId || 0) > 0;
    },
    normalizedEstado(venta) {
      if (this.isCartVenta(venta)) {
        return String(venta?.status?.key || venta?.estado || '').toUpperCase();
      }

      const statusKey = String(venta?.status?.key || '').toUpperCase();
      if (statusKey === 'PENDIENTE') {
        return 'PENDIENTE_PAGO';
      }

      return 'EMITIDO';
    },
    normalizedEstadoEmision(venta) {
      if (this.isCartVenta(venta)) {
        return String(venta?.estado_emision || '').toUpperCase() || 'SIN_ESTADO';
      }

      const estadoSufe = String(venta?.estadoSufe || '').toUpperCase();
      if (estadoSufe === 'PROCESADA') return 'FACTURADA';
      if (estadoSufe === 'OBSERVADA') return 'RECHAZADA';
      if (estadoSufe === 'RECEPCIONADA' || estadoSufe === 'CONTINGENCIA_CREADA') return 'PENDIENTE';
      return estadoSufe || 'SIN_ESTADO';
    },
    matchesDetailFilters(venta) {
      const term = String(this.detailFilters.q || '').trim().toLowerCase();
      const estado = String(this.detailFilters.estado || 'all').toLowerCase();
      const estadoEmision = String(this.detailFilters.estadoEmision || 'all').toUpperCase();

      if (estado !== 'all') {
        const ventaEstado = this.normalizedEstado(venta).toLowerCase();
        if (estado === 'pendiente_pago') {
          if (ventaEstado !== 'pendiente_pago' && ventaEstado !== 'qr_pendiente') {
            return false;
          }
        } else if (ventaEstado !== estado) {
          return false;
        }
      }

      if (estadoEmision !== 'ALL' && this.normalizedEstadoEmision(venta) !== estadoEmision) {
        return false;
      }

      if (!term) {
        return true;
      }

      const haystack = [
        venta?.codigoOrden,
        venta?.codigoSeguimiento,
        venta?.qr_transaction_id,
        venta?.cliente?.razonSocial,
        venta?.cliente?.documentoIdentidad,
        venta?.usuario?.nombre,
        venta?.usuario?.alias,
        venta?.mensaje_emision
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    },
    usuarioId(venta) {
      return venta?.usuario?.id || venta?.origen_usuario_id || 'sin-usuario';
    },
    usuarioNombre(venta) {
      return venta?.usuario?.nombre || venta?.origen_usuario_nombre || 'Sin usuario';
    },
    selectUser(userId) {
      this.activeUserId = userId;
      this.currentPage = 1;
      this.activeTab = 'resumen';
    },
    ventaItemsCount(venta) {
      if (Array.isArray(venta?.detalle) && venta.detalle.length) {
        return venta.detalle.length;
      }

      return Number(venta?.itemsCount || venta?.cantidad || 1);
    },
    deliveryChannelLabel(venta) {
      return this.resolveDeliveryType(venta).label;
    },
    facturacionModeLabel(venta) {
      if (this.isCartVenta(venta) && venta?.modalidad_facturacion) {
        return String(venta.modalidad_facturacion).replace(/_/g, ' ');
      }

      return venta?.status?.label || 'Factura emitida';
    },
    emissionStateLabel(venta) {
      if (this.isCartVenta(venta)) {
        const estado = this.normalizedEstadoEmision(venta);
        if (this.deliveryChannelLabel(venta) === 'QR' && estado === 'NO_APLICA') {
          const pago = String(venta?.estado_pago || '').toLowerCase();
          if (pago === 'pagado') return 'PAGADO QR';
          if (pago === 'cancelado') return 'QR RECHAZADO';
          return 'QR PENDIENTE';
        }

        return estado.replace(/_/g, ' ');
      }

      return venta?.status?.label || 'Sin estado';
    },
    cartStateLabel(venta) {
      if (this.isCartVenta(venta)) {
        return String(venta?.status?.label || venta?.estado_emision || 'Sin estado');
      }

      return String(venta?.status?.key || 'EMITIDO').replace(/_/g, ' ');
    },
    statusPillClass(venta) {
      const label = this.emissionStateLabel(venta).toUpperCase();
      if (label.includes('FACTURADA') || label.includes('PAGADO')) return 'status-pill-success';
      if (label.includes('PENDIENTE')) return 'status-pill-warning';
      if (label.includes('RECHAZ')) return 'status-pill-danger';
      if (label.includes('ERROR')) return 'status-pill-dark';
      return '';
    },
    channelPillClass(venta) {
      return this.deliveryChannelLabel(venta) === 'QR' ? 'status-pill-warning' : 'status-pill-neutral';
    },
    pdfOriginalUrl(venta) {
      const response = venta?.respuesta_emision || {};
      return response?.factura?.pdfUrl || response?.pdfUrl || '';
    },
    canAnularVenta(venta) {
      return Boolean(venta?.status?.can_annul && venta?.status?.cuf);
    },
    async fetchAnulacionGuardStatus() {
      try {
        const response = await this.$admin.$get('ventas/anulacion/guard-status');
        return response?.guard || null;
      } catch (error) {
        return null;
      }
    },
    async promptSupervisorAuthorization() {
      const { value } = await this.$swal.fire({
        title: 'Autorizacion requerida',
        html: `
          <div class="text-left">
            <p class="small text-muted mb-2">Ingresa credenciales de un rol superior para habilitar anulacion temporal.</p>
            <label class="d-block small font-weight-bold mb-1">Correo supervisor</label>
            <input id="auth-supervisor-email" class="swal2-input" type="email" placeholder="supervisor@dominio.com">
            <label class="d-block small font-weight-bold mt-3 mb-1">Contrasena supervisor</label>
            <input id="auth-supervisor-password" class="swal2-input" type="password" placeholder="Contrasena">
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Autorizar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
          const supervisor_email = document.getElementById('auth-supervisor-email')?.value?.trim();
          const supervisor_password = document.getElementById('auth-supervisor-password')?.value || '';
          if (!supervisor_email || !supervisor_password) {
            this.$swal.showValidationMessage('Correo y contrasena del supervisor son obligatorios.');
            return false;
          }
          return { supervisor_email, supervisor_password, duracion_minutos: 15 };
        }
      });

      return value || null;
    },
    async ensureAnulacionAuthorization() {
      const roles = this.$store?.state?.auth?.roles || [];
      const permissions = this.$store?.state?.auth?.permissions || [];
      const isHigherRole =
        (Array.isArray(roles) && roles.some((r) => ['admin', 'administrador', 'supervisor'].includes(String(r).toLowerCase())))
        || (Array.isArray(permissions) && permissions.some((p) => ['rbac.manage', 'usuarios.manage', 'ventas.manage'].includes(String(p).toLowerCase())));
      if (isHigherRole) return true;

      const guard = await this.fetchAnulacionGuardStatus();
      if (guard?.allowed) return true;

      const credentials = await this.promptSupervisorAuthorization();
      if (!credentials) return false;

      try {
        const response = await this.$admin.$post('ventas/anulacion/autorizar', credentials);
        await this.notifyAnulacion('success', 'Autorizacion concedida', response?.message || 'Anulacion habilitada temporalmente.');
        return true;
      } catch (error) {
        const data = error?.response?.data || {};
        const message = data.message || data.error || 'No se pudo validar autorizacion de supervisor.';
        await this.notifyAnulacion('error', 'Autorizacion rechazada', message);
        return false;
      }
    },
    async promptAnulacion() {
      const { value } = await this.$swal.fire({
        title: 'Anular factura',
        html: `
          <div class="protocol-annul-form">
            <label class="protocol-annul-label" for="annul-motivo">Motivo</label>
            <input id="annul-motivo" class="swal2-input protocol-annul-input" value="Datos erroneos en la factura">
            <label class="protocol-annul-label" for="annul-tipo">Tipo de anulacion</label>
            <select id="annul-tipo" class="swal2-select protocol-annul-select">
              <option value="1">1 - Factura mal emitida</option>
              <option value="2">2 - Nota credito-debito mal emitida</option>
              <option value="3" selected>3 - Datos de emision incorrectos</option>
              <option value="4">4 - Factura o nota devuelta</option>
            </select>
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Confirmar anulacion',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
          const motivo = document.getElementById('annul-motivo')?.value?.trim();
          const tipoAnulacion = Number(document.getElementById('annul-tipo')?.value || 0);
          if (!motivo) {
            this.$swal.showValidationMessage('El motivo es obligatorio.');
            return false;
          }
          return { motivo, tipoAnulacion };
        }
      });

      return value || null;
    },
    async anularVenta(venta) {
      if (!this.canAnularVenta(venta)) {
        await this.notifyAnulacion('warning', 'No disponible', 'Solo se puede anular una factura procesada y con CUF.');
        return;
      }

      const authorized = await this.ensureAnulacionAuthorization();
      if (!authorized) return;

      const payload = await this.promptAnulacion();
      if (!payload) return;

      this.load = true;
      try {
        const response = await this.$admin.$patch(`ventas/anular/${venta.status.cuf}`, payload);
        await this.notifyAnulacion('success', 'Solicitud enviada', response?.message || 'La anulacion fue recepcionada correctamente.');
        await this.loadVentas();
        if (this.activeDetailVenta?.id === venta.id) {
          this.activeDetailVenta = this.ventas.find((item) => item.id === venta.id) || null;
        }
      } catch (error) {
        const data = error?.response?.data || {};
        const message = data.message || data.error || data.details?.mensaje || 'No se pudo solicitar la anulacion.';
        await this.notifyAnulacion('error', 'No se pudo anular', message);
      } finally {
        this.load = false;
      }
    },
    notifyAnulacion(icon, title, text = '') {
      return this.$swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        icon,
        title,
        text,
        timer: icon === 'error' ? 4200 : 2400,
        timerProgressBar: true
      });
    },
    openVentaDetail(venta) {
      this.activeDetailVenta = venta;
    },
    scheduleLoadVentas() {
      if (this.isSyncingFilters) {
        return;
      }

      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }

      this.searchTimer = setTimeout(() => {
        this.loadVentas();
      }, 350);
    },
    async loadVentas() {
      this.load = true;
      this.error = '';

      try {
        const params = new URLSearchParams();
        params.append('codigoSucursal', this.filters.codigoSucursal);
        params.append('puntoVenta', this.filters.puntoVenta);
        if (this.filters.fechaInicio) {
          params.append('fechaInicio', this.filters.fechaInicio);
        }
        if (this.filters.fechaFin) {
          params.append('fechaFin', this.filters.fechaFin);
        }
        if (this.filters.q) {
          params.append('q', this.filters.q);
        }

        const response = await this.$admin.$get(`ventas?${params.toString()}`);
        this.ventas = Array.isArray(response) ? response : [];
        this.activeUserId = 'all';
        this.currentPage = 1;
        this.activeTab = 'resumen';
      } catch (err) {
        this.error = err?.response?.data?.message
          ? err.response.data.message
          : 'No se pudo cargar el detalle de ventas de la sucursal.';
      } finally {
        this.load = false;
      }
    },
    resetFilters() {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }

      this.filters = {
        fechaInicio: Object.prototype.hasOwnProperty.call(this.$route.query, 'fechaInicio')
          ? this.$route.query.fechaInicio
          : '',
        fechaFin: Object.prototype.hasOwnProperty.call(this.$route.query, 'fechaFin')
          ? this.$route.query.fechaFin
          : '',
        codigoSucursal: this.$route.query.codigoSucursal || '',
        puntoVenta: this.$route.query.puntoVenta || '',
        q: ''
      };

      this.loadVentas();
    },
    async downloadKardexPdf() {
      this.load = true;

      try {
        const params = {
          codigoSucursal: this.filters.codigoSucursal,
          puntoVenta: this.filters.puntoVenta
        };

        if (this.filters.fechaInicio) {
          params.fechaInicio = this.filters.fechaInicio;
        }

        if (this.filters.fechaFin) {
          params.fechaFin = this.filters.fechaFin;
        }

        if (this.filters.q) {
          params.q = this.filters.q;
        }

        if (this.activeUserId !== 'all') {
          params.origen_usuario_id = this.activeUserId;
        }

        const response = await this.$admin.get('ventas/reportes/kardex-pdf', {
          params,
          responseType: 'blob'
        });

        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        const disposition = response.headers['content-disposition'] || '';
        const filenameMatch = disposition.match(/filename=\"?([^"]+)\"?/i);

        link.href = url;
        link.download = filenameMatch ? filenameMatch[1] : 'kardex-facturacion.pdf';
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        const message = err?.response?.data?.message
          ? err.response.data.message
          : 'No se pudo descargar el kardex PDF.';

        this.$swal.fire({
          icon: 'error',
          title: 'Descarga no disponible',
          text: message,
          confirmButtonText: 'Entendido'
        });
      } finally {
        this.load = false;
      }
    },
    goToPage(page) {
      if (page < 1 || page > this.totalPages) {
        return;
      }

      this.currentPage = page;
    },
    formatCurrency(value) {
      const amount = Number(value || 0);
      return `Bs ${amount.toFixed(2)}`;
    },
    formatDate(value) {
      if (!value) {
        return '-';
      }

      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return value;
      }

      return date.toLocaleString('es-BO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
};
</script>

<style scoped>
.branch-dashboard-page {
  padding: 0.25rem 0 1rem;
}

.branch-hero-card,
.branch-selector-card,
.branch-main-card,
.error-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.99) 0%, #ffffff 100%);
  border: 1px solid #e8edf5;
  border-radius: 22px;
  box-shadow: 0 10px 28px rgba(22, 42, 77, 0.06);
}

.branch-hero-card {
  padding: 1rem 1.15rem;
}

.branch-hero-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.branch-kicker,
.detail-kicker {
  margin: 0 0 0.3rem;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #8a94a8;
}

.branch-title {
  margin: 0;
  color: #1d3360;
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.branch-copy,
.detail-copy,
.error-card p,
.empty-state p {
  margin: 0.45rem 0 0;
  color: #6f7c92;
}

.branch-hero-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.branch-filter-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(180px, 220px));
  gap: 0.85rem;
  margin-top: 1rem;
}

.branch-filter-field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.branch-filter-field span {
  font-size: 0.78rem;
  font-weight: 700;
  color: #4c5568;
}

.branch-filter-field input {
  height: 48px;
  border-radius: 12px;
  border: 1px solid #dde4ef;
  background: #fff;
  color: #24324a;
  padding: 0 0.95rem;
}

.hero-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  height: 44px;
  padding: 0 1rem;
  border-radius: 12px;
  border: 1px solid #dde5f0;
  background: #fff;
  color: #40506f;
  font-weight: 700;
}

.hero-export-btn {
  border-color: #f3d0d6;
  color: #b42318;
}

.branch-hero-badge {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.85rem;
  margin: 1rem 0;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 1.1rem;
  border-radius: 18px;
  background: #fff;
  border: 1px solid #e6ebf3;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.05);
}

.stat-icon {
  width: 58px;
  height: 58px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.stat-copy {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.stat-copy span {
  color: #667085;
  font-size: 0.82rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.stat-copy strong {
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 800;
}

.stat-copy small {
  color: #6f7c92;
}

.stat-card-red .stat-icon { background: #ffe7e7; color: #d23a3a; }
.stat-card-green .stat-icon { background: #e4f7df; color: #2b8a3e; }
.stat-card-yellow .stat-icon { background: #fff2cd; color: #d69a00; }
.stat-card-gray .stat-icon { background: #eef2f7; color: #6b7280; }

.branch-workspace {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 1rem;
}

.branch-selector-card,
.branch-main-card {
  padding: 1rem 1.1rem;
}

.selector-head h3 {
  margin: 0;
  color: #1d3360;
  font-size: 1.1rem;
  font-weight: 800;
}

.selector-search {
  position: relative;
  display: block;
  margin: 1rem 0 0.85rem;
}

.selector-search i {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.selector-search input {
  width: 100%;
  height: 46px;
  padding: 0 0.95rem 0 2.45rem;
  border-radius: 12px;
  border: 1px solid #dde4ef;
  background: #fff;
}

.selector-list {
  display: grid;
  gap: 0.55rem;
  max-height: 420px;
  overflow: auto;
}

.selector-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
  text-align: left;
  padding: 0.9rem 0.95rem;
  border-radius: 14px;
  border: 1px solid #e6ebf3;
  background: #fff;
  transition: all 0.18s ease;
}

.selector-item:hover {
  transform: translateY(-1px);
  border-color: #cfdaf0;
}

.selector-item.active {
  border-color: #c9d9f6;
  background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
  box-shadow: 0 14px 24px rgba(40, 92, 190, 0.08);
}

.selector-name {
  display: block;
  color: #1d3360;
  font-weight: 800;
}

.selector-item small {
  color: #66758f;
}

.branch-tabs {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  border-bottom: 1px solid #edf1f6;
  padding-bottom: 0.85rem;
  margin-bottom: 1rem;
}

.branch-tab {
  padding: 0.45rem 0;
  border: 0;
  background: transparent;
  color: #667085;
  font-weight: 700;
  border-bottom: 2px solid transparent;
}

.branch-tab.active {
  color: #e11d2e;
  border-bottom-color: #e11d2e;
}

.branch-range-chip {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.55rem 0.85rem;
  border-radius: 14px;
  border: 1px solid #e6ebf3;
  background: #fff;
  color: #40506f;
  font-weight: 700;
}

.branch-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.85rem;
}

.branch-resume-table {
  margin-top: 1rem;
}

.branch-summary-card {
  padding: 1rem 1.05rem;
  border-radius: 18px;
  border: 1px solid #e6ebf3;
  background: #f8fafc;
}

.branch-summary-card span {
  display: block;
  color: #667085;
  font-size: 0.8rem;
  font-weight: 800;
  margin-bottom: 0.35rem;
}

.branch-summary-card strong {
  color: #1d3360;
  font-size: 1.2rem;
  font-weight: 800;
}

.branch-comparative-card h4 {
  margin: 0 0 0.9rem;
  color: #1d3360;
  font-weight: 800;
}

.ranking-list {
  display: grid;
  gap: 0.65rem;
}

.ranking-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1rem;
  border-radius: 14px;
  border: 1px solid #e6ebf3;
  background: #fff;
}

.ranking-item strong {
  color: #223658;
}

.ranking-item small {
  display: block;
  color: #6f7c92;
}

.empty-state-cell {
  text-align: center;
  color: #6f7c92;
  padding: 1rem;
}

.table-wrap {
  overflow-x: auto;
  border: 1px solid #edf1f6;
  border-radius: 16px;
}

.detail-filters {
  display: grid;
  grid-template-columns: minmax(280px, 2fr) repeat(3, minmax(150px, 1fr));
  gap: 0.85rem;
  padding: 1rem;
  border-bottom: 1px solid #edf1f6;
  background: #fff;
}

.detail-filter-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.detail-filter-field span {
  font-size: 0.76rem;
  font-weight: 700;
  color: #67768f;
}

.detail-filter-field input,
.detail-filter-field select {
  height: 46px;
  border-radius: 12px;
  border: 1px solid #dde4ef;
  background: #fff;
  color: #23314d;
  padding: 0 0.95rem;
}

.detail-filter-field-search {
  position: relative;
}

.detail-filter-field-search i {
  position: absolute;
  left: 0.9rem;
  bottom: 0.95rem;
  color: #90a0b7;
}

.detail-filter-field-search input {
  padding-left: 2.5rem;
}

.sales-table {
  width: 100%;
  min-width: 1120px;
  border-collapse: collapse;
  background: #fff;
}

.sales-table thead th {
  padding: 0.95rem 0.9rem;
  text-align: left;
  font-size: 0.83rem;
  font-weight: 700;
  color: #495468;
  background: linear-gradient(180deg, #ffffff 0%, #fafbfd 100%);
  border-bottom: 1px solid #edf1f6;
}

.sales-table tbody td {
  padding: 1rem 0.9rem;
  border-bottom: 1px solid #edf1f6;
  color: #33415c;
  vertical-align: middle;
}

.sales-table tbody tr:last-child td {
  border-bottom: 0;
}

.table-footer {
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

.pager {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
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

.cell-stack {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.cell-stack strong,
.amount-text {
  color: #223658;
  font-weight: 700;
}

.cell-stack small,
.status-pill {
  color: #7d8798;
  font-size: 0.82rem;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  background: #f2f5fa;
  font-weight: 700;
  color: #53627d;
}

.amount-text {
  font-size: 1.05rem;
}

.action-view-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-width: 88px;
  height: 38px;
  padding: 0 0.85rem;
  border: 1px solid #dbe4f0;
  border-radius: 10px;
  background: #fff;
  color: #2d4f8f;
  font-weight: 700;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.action-view-btn:hover {
  transform: translateY(-1px);
  border-color: #c8d7ee;
  box-shadow: 0 8px 16px rgba(29, 56, 104, 0.08);
}

.table-actions {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex-wrap: wrap;
}

.action-secondary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-width: 76px;
  height: 38px;
  padding: 0 0.85rem;
  border: 1px solid #dbe4f0;
  border-radius: 10px;
  background: #fff;
  color: #40506f;
  font-weight: 700;
  text-decoration: none;
}

.action-danger-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-width: 86px;
  height: 38px;
  padding: 0 0.85rem;
  border: 1px solid #f3c7c7;
  border-radius: 10px;
  background: #fff5f5;
  color: #b42318;
  font-weight: 700;
}

.status-pill-success {
  background: #e7f6ea;
  color: #1f7a36;
}

.status-pill-warning {
  background: #fff1cf;
  color: #9a6700;
}

.status-pill-danger {
  background: #ffe3e3;
  color: #b42318;
}

.status-pill-dark {
  background: #e9edf5;
  color: #374151;
}

.status-pill-neutral {
  background: #eef2f7;
  color: #52607a;
}

.empty-state {
  padding: 1.8rem 1rem;
}

.empty-state h3,
.error-card h3 {
  margin: 0;
  color: #1d3360;
  font-size: 1.7rem;
  font-weight: 800;
}

.detail-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(15, 23, 42, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.detail-modal-card {
  width: min(920px, 100%);
  max-height: calc(100vh - 3rem);
  overflow: auto;
  background: #fff;
  border-radius: 24px;
  border: 1px solid #dfe7f2;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.24);
  padding: 1.2rem;
}

.detail-modal-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.detail-modal-head h3 {
  margin: 0;
  color: #1d3360;
}

.detail-modal-close {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  border: 1px solid #dde4ef;
  background: #fff;
  color: #40506f;
}

.detail-modal-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 1rem 0;
  color: #61708a;
}

@media (max-width: 1199px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .branch-workspace {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 991px) {
  .branch-hero-head,
  .branch-hero-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-back-btn,
  .branch-hero-badge {
    width: 100%;
    justify-content: center;
  }

  .branch-summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .branch-filter-grid {
    grid-template-columns: 1fr 1fr;
  }

  .detail-filters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .table-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .pager {
    justify-content: center;
  }
}

@media (max-width: 767px) {
  .stats-grid,
  .branch-summary-grid {
    grid-template-columns: 1fr;
  }

  .branch-filter-grid {
    grid-template-columns: 1fr;
  }

  .detail-filters {
    grid-template-columns: 1fr;
  }
}
</style>
