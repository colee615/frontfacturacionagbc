<template>
  <div>
    <JcLoader :load="load" />
    <AdminTemplate :page="page" :modulo="modulo">
      <div slot="body" class="branch-dashboard-page enterprise-page-shell">
                <section class="stats-grid">
          <div class="stat-card stat-card-red">
            <div class="stat-icon"><i class="fas fa-tag"></i></div>
            <div class="stat-copy">
              <span>Total general</span>
              <strong>{{ formatCurrency(summary.totalGeneral) }}</strong>
              <small>{{ summary.countCobrado }} transacciones cobradas</small>
            </div>
          </div>

          <div class="stat-card stat-card-green">
            <div class="stat-icon"><i class="fas fa-file-invoice-dollar"></i></div>
            <div class="stat-copy">
              <span>Total caja</span>
              <strong>{{ formatCurrency(summary.totalCaja) }}</strong>
              <small>No incluye QR</small>
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
              <strong>{{ formatCurrency(summary.countCobrado ? summary.totalGeneral / summary.countCobrado : 0) }}</strong>
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
                  <h3 class="mb-1">Facturadores</h3>
                  <p class="detail-copy mb-0">Primero selecciona la sucursal y luego revisa el kardex por cajero.</p>
                </div>
              </div>

              <label class="selector-search">
                <i class="fas fa-search"></i>
                <input v-model.trim="userSearch" type="text" placeholder="Buscar usuario..." />
              </label>

              <div ref="selectorList" class="selector-list">
                <button
                  type="button"
                  class="selector-item"
                  :class="{ active: activeUserId === 'all' }"
                  data-user-id="all"
                  @click="selectUser('all')"
                >
                  <span class="selector-name">Todos los usuarios</span>
                  <small>{{ visibleVentas.length }} ventas</small>
                </button>

                <button
                  v-for="user in filteredUserSummaries"
                  :key="user.id"
                  type="button"
                  class="selector-item"
                  :class="{ active: activeUserId === user.id }"
                  :data-user-id="String(user.id)"
                  @click="selectUser(user.id)"
                >
                  <span class="selector-name">{{ user.nombre }}</span>
                  <small>{{ user.ventas }} ventas · {{ formatCurrency(user.total) }}</small>
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

                <div class="branch-date-filter" ref="dateFilter">
                  <button
                    type="button"
                    class="branch-range-chip branch-range-chip-button"
                    :class="{ 'branch-range-chip-active': hasDateRange }"
                    @click.stop="toggleDateRangePicker"
                  >
                    <i class="fas fa-calendar-alt"></i>
                    <span>{{ currentDateRangeLabel }}</span>
                  </button>

                  <div v-if="showDateRangePicker" class="date-range-popover" @click.stop>
                    <div class="date-range-popover-head">
                      <div>
                        <strong>Seleccionar fechas</strong>
                        <small>Filtra el kardex por rango de fechas.</small>
                      </div>
                      <button type="button" class="date-range-close" @click="closeDateRangePicker">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>

                    <div class="date-range-quick-actions">
                      <button type="button" class="date-quick-btn" @click="setQuickDateRange('today')">Hoy</button>
                      <button type="button" class="date-quick-btn" @click="setQuickDateRange('last7')">7 días</button>
                      <button type="button" class="date-quick-btn" @click="setQuickDateRange('last30')">30 días</button>
                      <button type="button" class="date-quick-btn" @click="setQuickDateRange('month')">Este mes</button>
                    </div>

                    <div class="date-range-fields">
                      <label class="date-range-field">
                        <span>Desde</span>
                        <input v-model="draftDateRange.fechaInicio" type="date" />
                      </label>
                      <label class="date-range-field">
                        <span>Hasta</span>
                        <input v-model="draftDateRange.fechaFin" type="date" />
                      </label>
                    </div>

                    <div class="date-range-actions">
                      <button type="button" class="date-range-link" @click="clearDateRange">Limpiar</button>
                      <button type="button" class="date-range-apply" @click="applyDateRange">Aplicar</button>
                    </div>
                  </div>
                </div>

                <div class="branch-range-chip">
                  <i class="fas fa-user"></i>
                  <span>{{ activeUserLabel }}</span>
                </div>

                <div class="branch-toolbar-actions">
                  <button
                    type="button"
                    class="branch-export-btn"
                    @click="downloadKardexPdf"
                  >
                    <i class="fas fa-file-pdf"></i>
                    <span>{{ activeUserId === 'all' ? 'Exportar PDF sucursal' : 'Exportar PDF cajero' }}</span>
                  </button>
                </div>
              </div>

              <div v-if="activeTab === 'resumen'" class="branch-summary-grid">
                <div class="branch-summary-card">
                  <span>Ventas filtradas</span>
                  <strong>{{ filteredVentas.length }}</strong>
                </div>
                <div class="branch-summary-card">
                  <span>Total general</span>
                  <strong>{{ formatCurrency(summary.totalGeneral) }}</strong>
                </div>
                <div class="branch-summary-card">
                  <span>Usuarios visibles</span>
                  <strong>{{ filteredUserSummaries.length }}</strong>
                </div>
                <div class="branch-summary-card">
                  <span>Total caja</span>
                  <strong>{{ formatCurrency(summary.totalCaja) }}</strong>
                </div>
                <div class="branch-summary-card">
                  <span>Factura electrónica</span>
                  <strong>{{ deliverySummary.factura_electronica.count }}</strong>
                  <small>{{ formatCurrency(deliverySummary.factura_electronica.total) }}</small>
                </div>
                <div class="branch-summary-card">
                  <span>QR facturado</span>
                  <strong>{{ deliverySummary.qr_facturado.count }}</strong>
                  <small>{{ formatCurrency(deliverySummary.qr_facturado.total) }}</small>
                </div>
                <div class="branch-summary-card">
                  <span>QR pendiente / pago</span>
                  <strong>{{ deliverySummary.qr_pagado_pendiente_factura.count }}</strong>
                  <small>{{ formatCurrency(deliverySummary.qr_pagado_pendiente_factura.total) }}</small>
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
                      <th>Total general</th>
                      <th>Total caja</th>
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
                      <td>{{ formatCurrency(user.totalCaja) }}</td>
                      <td>{{ user.deliveries.factura_electronica.count }}</td>
                      <td>{{ formatCurrency(user.deliveries.factura_electronica.total) }}</td>
                      <td>{{ user.deliveries.qr_facturado.count + user.deliveries.qr_pagado_pendiente_factura.count + user.deliveries.qr_pendiente.count + user.deliveries.qr_cancelado.count }}</td>
                      <td>{{ formatCurrency(user.deliveries.qr_facturado.total + user.deliveries.qr_pagado_pendiente_factura.total + user.deliveries.qr_pendiente.total + user.deliveries.qr_cancelado.total) }}</td>
                    </tr>
                    <tr v-if="!filteredUserSummaries.length">
                      <td colspan="8" class="empty-state-cell">No hay cajeros visibles para el rango seleccionado.</td>
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
                          {{ user.ventas }} ventas · Factura electrónica {{ user.deliveries.factura_electronica.count }} · QR {{ user.deliveries.qr_facturado.count + user.deliveries.qr_pagado_pendiente_factura.count + user.deliveries.qr_pendiente.count + user.deliveries.qr_cancelado.count }}
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
                        <option :value="15">15</option>
                        <option :value="30">30</option>
                        <option :value="50">50</option>
                        <option :value="100">100</option>
                      </select>
                    </label>
                  </div>

                  <table class="sales-table enterprise-table sales-table-detail">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Código de orden</th>
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
                        <td>
                          <div class="cell-stack">
                            <strong class="amount-text">{{ formatCurrency(venta.total) }}</strong>
                            <small v-if="isQrPaymentVenta(venta)">Origen de cobro: QR</small>
                            <small v-if="isQrFacturadoVenta(venta)">QR facturado fuera de caja</small>
                          </div>
                        </td>
                        <td>
                          <div class="table-actions">
                            <button
                              v-if="canViewQr(venta)"
                              class="action-secondary-btn"
                              type="button"
                              @click="consultarQrVenta(venta, false)"
                            >
                              <i class="fas fa-qrcode"></i>
                              <span>Ver QR</span>
                            </button>
                            <button
                              v-else-if="canFacturarQrVenta(venta)"
                              class="action-secondary-btn"
                              type="button"
                              @click="consultarQrVenta(venta, true)"
                            >
                              <i class="fas fa-file-invoice"></i>
                              <span>Facturar venta</span>
                            </button>
                            <button
                              v-if="canCancelarQrVenta(venta)"
                              class="action-danger-btn"
                              type="button"
                              @click="cancelarPagoQrVenta(venta)"
                            >
                              <i class="fas fa-ban"></i>
                              <span>Cancelar pago</span>
                            </button>
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
      page: 'Reportes',
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
      pageSize: 15,
      showDateRangePicker: false,
      draftDateRange: {
        fechaInicio: '',
        fechaFin: ''
      },
      detailFilters: {
        q: '',
        estado: 'all',
        estadoEmision: 'all'
      },
      activeDetailVenta: null,
      activeQrVenta: null,
      branchName: '',
      branchDepartment: '',
      ventas: []
    };
  },
  computed: {
    branchLabel() {
      return this.branchDepartment || this.branchName || 'Sucursal';
    },
    hasDateRange() {
      return Boolean(this.filters.fechaInicio || this.filters.fechaFin);
    },
    currentDateRangeLabel() {
      if (!this.filters.fechaInicio && !this.filters.fechaFin) {
        return 'Seleccionar fechas';
      }

      if (this.filters.fechaInicio && this.filters.fechaFin) {
        const start = this.formatShortDate(this.filters.fechaInicio);
        const end = this.formatShortDate(this.filters.fechaFin);
        return start === end ? start : `${start} - ${end}`;
      }

      if (this.filters.fechaInicio) {
        return `Desde ${this.formatShortDate(this.filters.fechaInicio)}`;
      }

      return `Hasta ${this.formatShortDate(this.filters.fechaFin)}`;
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
        const sectionKey = this.resolveSectionKey(venta);

        if (!map.has(id)) {
          map.set(id, {
            id,
            nombre,
            ventas: 0,
            total: 0,
            totalCobrado: 0,
            totalCaja: 0,
            deliveries: this.buildDeliveryAccumulator()
          });
        }

        const current = map.get(id);
        current.ventas += 1;
        if (this.countsTowardCollectedTotal(venta)) {
          current.total += Number(venta.total || 0);
          current.totalCobrado += Number(venta.total || 0);
        }
        if (this.countsTowardCashTotal(venta)) {
          current.totalCaja += Number(venta.total || 0);
        }
        current.deliveries[sectionKey].count += 1;
        current.deliveries[sectionKey].total += Number(venta.total || 0);
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
        if (this.countsTowardCollectedTotal(venta)) {
          acc.totalGeneral += Number(venta.total || 0);
          acc.countCobrado += 1;
        }
        if (this.countsTowardCashTotal(venta)) {
          acc.totalCaja += Number(venta.total || 0);
        }
        acc.count += 1;
        return acc;
      }, { totalGeneral: 0, totalCaja: 0, count: 0, countCobrado: 0 });
    },
    deliverySummary() {
      return this.filteredVentas.reduce((acc, venta) => {
        const sectionKey = this.resolveSectionKey(venta);
        acc[sectionKey].count += 1;
        acc[sectionKey].total += Number(venta.total || 0);
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
    console.log('[ventas/sucursal] mounted', {
      routeQuery: { ...this.$route.query }
    });
    this.syncRouteFilters();
    this.syncDraftDateRange();
    this.loadVentas();
    document.addEventListener('click', this.handleOutsideDatePickerClick);
    document.addEventListener('keydown', this.handleDatePickerEscape);
  },
  beforeDestroy() {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    document.removeEventListener('click', this.handleOutsideDatePickerClick);
    document.removeEventListener('keydown', this.handleDatePickerEscape);
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
    },
    activeUserId() {
      this.scrollActiveSelectorIntoView();
    },
    filteredUserSummaries() {
      this.scrollActiveSelectorIntoView();
    },
    showDateRangePicker(value) {
      if (value) {
        this.syncDraftDateRange();
      }
    }
  },
  methods: {
    hasValidBranchContext() {
      const codigoSucursal = String(this.filters.codigoSucursal ?? '').trim();
      console.log('[ventas/sucursal] hasValidBranchContext', {
        codigoSucursal,
        puntoVenta: this.filters.puntoVenta ?? '',
        isValid: codigoSucursal !== ''
      });
      return codigoSucursal !== '';
    },
    syncDraftDateRange() {
      this.draftDateRange = {
        fechaInicio: this.filters.fechaInicio || '',
        fechaFin: this.filters.fechaFin || ''
      };
    },
    toggleDateRangePicker() {
      if (!this.showDateRangePicker) {
        this.syncDraftDateRange();
      }
      this.showDateRangePicker = !this.showDateRangePicker;
    },
    closeDateRangePicker() {
      this.showDateRangePicker = false;
    },
    handleOutsideDatePickerClick(event) {
      if (!this.showDateRangePicker) {
        return;
      }

      const root = this.$refs.dateFilter;
      if (root && !root.contains(event.target)) {
        this.closeDateRangePicker();
      }
    },
    handleDatePickerEscape(event) {
      if (event.key === 'Escape' && this.showDateRangePicker) {
        this.closeDateRangePicker();
      }
    },
    todayIso() {
      const date = new Date();
      const year = date.getFullYear();
      const month = `${date.getMonth() + 1}`.padStart(2, '0');
      const day = `${date.getDate()}`.padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    shiftIsoDate(baseIso, diffDays) {
      const date = new Date(`${baseIso}T00:00:00`);
      if (Number.isNaN(date.getTime())) {
        return baseIso;
      }
      date.setDate(date.getDate() + diffDays);
      const year = date.getFullYear();
      const month = `${date.getMonth() + 1}`.padStart(2, '0');
      const day = `${date.getDate()}`.padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    setQuickDateRange(type) {
      const today = this.todayIso();

      if (type === 'today') {
        this.draftDateRange.fechaInicio = today;
        this.draftDateRange.fechaFin = today;
        return;
      }

      if (type === 'last7') {
        this.draftDateRange.fechaInicio = this.shiftIsoDate(today, -6);
        this.draftDateRange.fechaFin = today;
        return;
      }

      if (type === 'last30') {
        this.draftDateRange.fechaInicio = this.shiftIsoDate(today, -29);
        this.draftDateRange.fechaFin = today;
        return;
      }

      const date = new Date(`${today}T00:00:00`);
      const year = date.getFullYear();
      const month = `${date.getMonth() + 1}`.padStart(2, '0');
      this.draftDateRange.fechaInicio = `${year}-${month}-01`;
      this.draftDateRange.fechaFin = today;
    },
    applyDateRange() {
      const start = this.draftDateRange.fechaInicio || '';
      const end = this.draftDateRange.fechaFin || '';

      if (start && end && start > end) {
        this.$swal.fire({
          icon: 'warning',
          title: 'Rango inválido',
          text: 'La fecha inicial no puede ser mayor que la fecha final.',
          confirmButtonText: 'Entendido'
        });
        return;
      }

      this.isSyncingFilters = true;
      this.filters.fechaInicio = start;
      this.filters.fechaFin = end;
      this.isSyncingFilters = false;
      this.currentPage = 1;
      this.activeUserId = 'all';
      this.closeDateRangePicker();
      this.loadVentas();
    },
    clearDateRange() {
      this.draftDateRange.fechaInicio = '';
      this.draftDateRange.fechaFin = '';
      this.applyDateRange();
    },
    scrollActiveSelectorIntoView() {
      this.$nextTick(() => {
        const container = this.$refs.selectorList;
        if (!container || typeof container.querySelector !== 'function') {
          return;
        }

        const activeId = String(this.activeUserId || 'all');
        const target = container.querySelector(`[data-user-id="${activeId}"]`);
        if (!target) {
          container.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        const targetTop = target.offsetTop - 12;
        container.scrollTo({
          top: Math.max(0, targetTop),
          behavior: 'smooth'
        });
      });
    },
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
      console.log('[ventas/sucursal] syncRouteFilters', {
        filters: { ...this.filters },
        branchName: this.branchName,
        branchDepartment: this.branchDepartment
      });
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
        factura_electronica: { key: 'factura_electronica', label: 'Factura electrónica', count: 0, total: 0 },
        qr_facturado: { key: 'qr_facturado', label: 'QR facturado', count: 0, total: 0 },
        qr_pagado_pendiente_factura: { key: 'qr_pagado_pendiente_factura', label: 'QR pagado pendiente de factura', count: 0, total: 0 },
        qr_pendiente: { key: 'qr_pendiente', label: 'QR pendiente', count: 0, total: 0 },
        qr_cancelado: { key: 'qr_cancelado', label: 'QR cancelado', count: 0, total: 0 },
        oficial: { key: 'oficial', label: 'Registro oficial', count: 0, total: 0 }
      };
    },
    isQrPaymentVenta(venta) {
      return String(venta?.metodo_pago || '').trim().toLowerCase() === 'qr'
        || String(venta?.canal_emision || '').trim().toLowerCase() === 'qr';
    },
    isQrFacturadoVenta(venta) {
      return this.isQrPaymentVenta(venta)
        && String(venta?.estado_pago || '').trim().toLowerCase() === 'pagado'
        && String(venta?.estado_emision || '').trim().toUpperCase() === 'FACTURADA';
    },
    countsTowardCashTotal(venta) {
      if (this.isQrPaymentVenta(venta)) {
        return false;
      }

      const estado = String(venta?.estado || '').trim().toLowerCase();
      const estadoEmision = String(venta?.estado_emision || '').trim().toUpperCase();
      const statusKey = String(venta?.status?.key || '').trim().toUpperCase();
      const statusLabel = String(venta?.status?.label || '').trim().toUpperCase();
      const estadoPago = String(venta?.estado_pago || '').trim().toLowerCase();

      if (estadoPago === 'pagado') {
        return true;
      }

      if (['FACTURADA', 'EMITIDO'].includes(statusKey)) {
        return true;
      }

      if (statusLabel.includes('FACTURADA') || statusLabel.includes('EMITIDO')) {
        return true;
      }

      if (estadoEmision === 'FACTURADA') {
        return true;
      }

      return estado === 'emitido';
    },
    countsTowardCollectedTotal(venta) {
      if (this.isQrPaymentVenta(venta)) {
        return String(venta?.estado_pago || '').trim().toLowerCase() === 'pagado';
      }

      return this.countsTowardCashTotal(venta);
    },
    resolveSectionKey(venta) {
      if (this.isQrPaymentVenta(venta)) {
        const estadoPago = String(venta?.estado_pago || 'pendiente').trim().toLowerCase();
        const estadoEmision = String(venta?.estado_emision || '').trim().toUpperCase();

        if (estadoPago === 'pagado' && estadoEmision === 'FACTURADA') {
          return 'qr_facturado';
        }

        if (estadoPago === 'pagado') {
          return 'qr_pagado_pendiente_factura';
        }

        if (estadoPago === 'cancelado' || estadoPago === 'fallido') {
          return 'qr_cancelado';
        }

        return 'qr_pendiente';
      }

      const deliveryType = this.resolveDeliveryType(venta);
      return deliveryType.key;
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
      const metodoPagoRaw = String(venta?.metodo_pago || venta?.metodoPago || '').trim().toLowerCase();
      const isOficial = Boolean(venta?.es_oficial)
        || codigoOrden.startsWith('OFI-')
        || razonSocial === 'ENVIO OFICIAL'
        || estadoSufeRaw === 'REGISTRADA_OFICIAL';

      if (canalEmisionRaw === 'oficial') {
        return { key: 'oficial', label: 'Registro oficial' };
      }

      if (metodoPagoRaw === 'qr' || canalEmisionRaw === 'qr') {
        return { key: 'qr', label: 'QR' };
      }

      if (canalEmisionRaw === 'factura_electronica') {
        return { key: 'factura_electronica', label: 'Factura electrónica' };
      }

      if (isOficial) {
        return { key: 'oficial', label: 'Registro oficial' };
      }

      if (codigoOrden.startsWith('VQ-')) {
        return { key: 'qr', label: 'QR' };
      }

      if (codigoOrden.startsWith('VF-') || codigoOrden.startsWith('V-')) {
        return { key: 'factura_electronica', label: 'Factura electrónica' };
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

      return { key: 'factura_electronica', label: 'Factura electrónica' };
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
      if (this.isQrPaymentVenta(venta)) {
        return 'QR';
      }

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
        if (this.isQrPaymentVenta(venta)) {
          const pago = String(venta?.estado_pago || '').toLowerCase();
          if (pago === 'pagado' && estado === 'FACTURADA') return 'QR FACTURADO';
          if (pago === 'pagado') return 'PAGADO QR';
          if (pago === 'cancelado' || pago === 'fallido') return 'QR ANULADO';
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
      if (label.includes('ANULAD')) return 'status-pill-dark';
      if (label.includes('PENDIENTE')) return 'status-pill-warning';
      if (label.includes('RECHAZ')) return 'status-pill-danger';
      if (label.includes('ERROR')) return 'status-pill-dark';
      return '';
    },
    channelPillClass(venta) {
      return this.isQrPaymentVenta(venta) ? 'status-pill-warning' : 'status-pill-neutral';
    },
    pdfOriginalUrl(venta) {
      const response = venta?.respuesta_emision || {};
      return response?.factura?.pdfUrl || response?.pdfUrl || '';
    },
    canAnularVenta(venta) {
      return Boolean(venta?.status?.can_annul && venta?.status?.cuf);
    },
    canCancelarQrVenta(venta) {
      return this.isCartVenta(venta)
        && this.isQrPaymentVenta(venta)
        && String(venta?.status?.key || '').trim().toUpperCase() === 'QR_PENDIENTE'
        && String(venta?.estado_pago || 'pendiente').trim().toLowerCase() === 'pendiente';
    },
    canViewQr(venta) {
      return this.isCartVenta(venta)
        && this.isQrPaymentVenta(venta)
        && ['pendiente', 'cancelado', 'fallido'].includes(String(venta?.estado_pago || 'pendiente').trim().toLowerCase());
    },
    canFacturarQrVenta(venta) {
      return this.isCartVenta(venta)
        && this.isQrPaymentVenta(venta)
        && String(venta?.estado_pago || '').trim().toLowerCase() === 'pagado'
        && String(venta?.estado_emision || '').trim().toUpperCase() !== 'FACTURADA';
    },
    extractQrPayloadFromConsultResponse(payload) {
      const respuesta = payload?.respuesta || {};
      const cart = payload?.cart || {};
      const imageData = String(
        respuesta?.image_data
        || respuesta?.qr_url
        || respuesta?.qrUrl
        || respuesta?.image_url
        || ''
      ).trim();
      const transactionId = String(
        respuesta?.transaction_id
        || cart?.qr_transaction_id
        || ''
      ).trim();
      const paymentStatus = String(
        respuesta?.payment_status
        || cart?.estado_pago
        || 'holding'
      ).trim().toLowerCase();

      if (!imageData && !transactionId) {
        return null;
      }

      return {
        imageData,
        transactionId,
        paymentStatus,
        message: String(respuesta?.message || respuesta?.mensaje || '').trim()
      };
    },
    normalizeQrImageSrc(value) {
      const image = String(value || '').trim();
      if (!image) {
        return '';
      }
      if (image.startsWith('data:image') || /^https?:\/\//i.test(image)) {
        return image;
      }
      return `data:image/png;base64,${image}`;
    },
    async consultarQrVenta(venta, autoEmitInvoice = false) {
      const originUserId = this.usuarioId(venta);
      const cartId = Number(venta?.cartId || venta?.origenVentaId || String(venta?.id || '').replace('cart-', ''));

      if (!originUserId || !cartId) {
        await this.notifyAnulacion('warning', 'Venta no disponible', 'No se pudo identificar la venta QR para consultar.');
        return;
      }

      this.load = true;
      try {
        const payload = {
          origen_usuario_id: originUserId,
          cart_id: cartId,
          auto_emit_invoice: autoEmitInvoice ? 1 : 0
        };
        const response = await this.$admin.$post('cart/consultar', payload);
        const qrPayload = this.extractQrPayloadFromConsultResponse(response);

        await this.loadVentas();

        if (qrPayload && ['holding', 'pending', 'pendiente'].includes(qrPayload.paymentStatus)) {
          const imageSrc = this.normalizeQrImageSrc(qrPayload.imageData);
          const html = imageSrc
            ? `<div style="text-align:center"><img src="${imageSrc}" alt="QR" style="max-width:260px;width:100%;border-radius:12px;border:1px solid #e5e7eb;padding:8px;background:#fff"></div>`
            : '<p class="mb-0">El QR sigue pendiente, pero el proveedor no devolvió la imagen en esta consulta.</p>';
          await this.$swal.fire({
            title: 'QR vigente',
            html,
            confirmButtonText: 'Entendido',
            footer: qrPayload.transactionId ? `Tx: ${qrPayload.transactionId}` : ''
          });
          return;
        }

        const refreshedVenta = this.ventas.find((item) => String(item.id) === String(venta.id) || Number(item.cartId || item.origenVentaId || 0) === cartId) || venta;
        const finalState = this.emissionStateLabel(refreshedVenta);
        const message = response?.respuesta?.mensaje || response?.respuesta?.message || `Estado actualizado: ${finalState}`;

        await this.$swal.fire({
          icon: 'success',
          title: autoEmitInvoice ? 'Venta actualizada' : 'QR actualizado',
          text: message,
          confirmButtonText: 'Entendido'
        });
      } catch (error) {
        const message = error?.response?.data?.message || 'No se pudo consultar el estado de la venta QR.';
        await this.$swal.fire({ icon: 'error', title: 'No se pudo consultar', text: message });
      } finally {
        this.load = false;
      }
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
        title: 'Autorización requerida',
        html: `
          <div class="text-left">
            <p class="small text-muted mb-2">Ingresa credenciales de un rol superior para habilitar la anulación temporal.</p>
            <label class="d-block small font-weight-bold mb-1">Correo supervisor</label>
            <input id="auth-supervisor-email" class="swal2-input" type="email" placeholder="supervisor@dominio.com">
            <label class="d-block small font-weight-bold mt-3 mb-1">Contraseña del supervisor</label>
            <input id="auth-supervisor-password" class="swal2-input" type="password" placeholder="Contraseña">
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
            this.$swal.showValidationMessage('El correo y la contraseña del supervisor son obligatorios.');
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
        await this.notifyAnulacion('success', 'Autorización concedida', response?.message || 'Anulación habilitada temporalmente.');
        return true;
      } catch (error) {
        const data = error?.response?.data || {};
        const message = data.message || data.error || 'No se pudo validar la autorización del supervisor.';
        await this.notifyAnulacion('error', 'Autorización rechazada', message);
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
            <label class="protocol-annul-label" for="annul-tipo">Tipo de anulación</label>
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
        confirmButtonText: 'Confirmar anulación',
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
        await this.notifyAnulacion('success', 'Solicitud enviada', response?.message || 'La anulación fue recibida correctamente.');
        await this.loadVentas();
        if (this.activeDetailVenta?.id === venta.id) {
          this.activeDetailVenta = this.ventas.find((item) => item.id === venta.id) || null;
        }
      } catch (error) {
        const data = error?.response?.data || {};
        const message = data.message || data.error || data.details?.mensaje || 'No se pudo solicitar la anulación.';
        await this.notifyAnulacion('error', 'No se pudo anular', message);
      } finally {
        this.load = false;
      }
    },
    async promptCancelQrReason() {
      const { value } = await this.$swal.fire({
        title: 'Cancelar cobro QR',
        html: `
          <div class="protocol-annul-form">
            <label class="protocol-annul-label" for="cancel-qr-reason">Motivo</label>
            <input id="cancel-qr-reason" class="swal2-input protocol-annul-input" value="Cobro generado por error">
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Cancelar cobro',
        cancelButtonText: 'Volver',
        preConfirm: () => {
          const reason = document.getElementById('cancel-qr-reason')?.value?.trim();
          return { reason: reason || 'Cobro generado por error' };
        }
      });

      return value || null;
    },
    async cancelarPagoQrVenta(venta) {
      if (!this.canCancelarQrVenta(venta)) {
        await this.notifyAnulacion('warning', 'No disponible', 'Solo se puede cancelar un QR pendiente de pago.');
        return;
      }

      const payload = await this.promptCancelQrReason();
      if (!payload) return;

      const cartId = Number(venta?.cartId || venta?.origenVentaId || String(venta?.id || '').replace('cart-', ''));
      const internalCode = String(venta?.codigoOrden || '').trim();
      const transactionId = Number(venta?.qr_transaction_id || venta?.respuesta_emision?.transaction_id || 0);

      this.load = true;
      try {
        const response = await this.$admin.$post('qr/cancel-payment', {
          cart_id: cartId > 0 ? cartId : undefined,
          internal_code: internalCode || undefined,
          transaction_id: transactionId > 0 ? transactionId : undefined,
          reason: payload.reason
        });
        await this.notifyAnulacion('success', 'Cobro QR cancelado', response?.message || 'El QR pendiente fue cancelado correctamente.');
        await this.loadVentas();
        if (this.activeDetailVenta?.id === venta.id) {
          this.activeDetailVenta = this.ventas.find((item) => item.id === venta.id) || null;
        }
      } catch (error) {
        const data = error?.response?.data || {};
        const message = data.message || data.error || 'No se pudo cancelar el cobro QR.';
        await this.notifyAnulacion('error', 'No se pudo cancelar', message);
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
      if (!this.hasValidBranchContext()) {
        console.warn('[ventas/sucursal] loadVentas:invalid-branch-context', {
          filters: { ...this.filters },
          routeQuery: { ...this.$route.query }
        });
        this.error = 'La sucursal seleccionada no tiene un codigo de sucursal valido para consultar el kardex.';
        this.ventas = [];
        this.load = false;
        return;
      }

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

        const path = `ventas?${params.toString()}`;
        console.log('[ventas/sucursal] loadVentas:start', {
          filters: { ...this.filters },
          path
        });
        const response = await this.$admin.$get(path);
        console.log('[ventas/sucursal] loadVentas:success', {
          totalVentas: Array.isArray(response) ? response.length : 0,
          firstVenta: Array.isArray(response) && response.length ? response[0] : null
        });
        this.ventas = Array.isArray(response) ? response : [];
        this.activeUserId = 'all';
        this.currentPage = 1;
        this.activeTab = 'resumen';
        this.scrollActiveSelectorIntoView();
      } catch (err) {
        console.error('[ventas/sucursal] loadVentas:error', {
          filters: { ...this.filters },
          status: err?.response?.status || null,
          data: err?.response?.data || null,
          message: err?.message || null
        });
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

.branch-selector-card,
.branch-main-card,
.error-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.99) 0%, #ffffff 100%);
  border: 1px solid #e8edf5;
  border-radius: 22px;
  box-shadow: 0 10px 28px rgba(22, 42, 77, 0.06);
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

.detail-copy,
.error-card p,
.empty-state p {
  margin: 0.45rem 0 0;
  color: #6f7c92;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.7rem;
  margin: 0.85rem 0;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.82rem 0.92rem;
  border-radius: 18px;
  background: #fff;
  border: 1px solid #e6ebf3;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.05);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.stat-copy {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.stat-copy span {
  color: #667085;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.stat-copy strong {
  color: #1f2937;
  font-size: 1.06rem;
  font-weight: 800;
}

.stat-copy small {
  color: #6f7c92;
  font-size: 0.8rem;
}

.stat-card-red .stat-icon { background: #ffe7e7; color: #d23a3a; }
.stat-card-green .stat-icon { background: #e4f7df; color: #2b8a3e; }
.stat-card-yellow .stat-icon { background: #fff2cd; color: #d69a00; }
.stat-card-gray .stat-icon { background: #eef2f7; color: #6b7280; }

.branch-workspace {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 0.85rem;
}

.branch-selector-card,
.branch-main-card {
  padding: 0.85rem 0.95rem;
}

.selector-head h3 {
  margin: 0;
  color: #1d3360;
  font-size: 0.98rem;
  font-weight: 800;
}

.selector-search {
  position: relative;
  display: block;
  margin: 0.85rem 0 0.7rem;
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
  height: 40px;
  padding: 0 0.95rem 0 2.45rem;
  border-radius: 12px;
  border: 1px solid #dde4ef;
  background: #fff;
  font-size: 0.84rem;
}

.selector-list {
  display: grid;
  gap: 0.45rem;
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
  padding: 0.72rem 0.82rem;
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
  font-size: 0.9rem;
}

.selector-item small {
  color: #66758f;
  font-size: 0.76rem;
}

.branch-tabs {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
  border-bottom: 1px solid #edf1f6;
  padding-bottom: 0.7rem;
  margin-bottom: 0.85rem;
}

.branch-tab {
  padding: 0.35rem 0;
  border: 0;
  background: transparent;
  color: #667085;
  font-weight: 700;
  border-bottom: 2px solid transparent;
  font-size: 0.84rem;
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
  padding: 0.45rem 0.72rem;
  border-radius: 14px;
  border: 1px solid #e6ebf3;
  background: #fff;
  color: #40506f;
  font-weight: 700;
  font-size: 0.82rem;
}

.branch-date-filter {
  position: relative;
  margin-left: auto;
}

.branch-range-chip-button {
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.branch-range-chip-button:hover {
  transform: translateY(-1px);
  border-color: #cfdaed;
  box-shadow: 0 10px 18px rgba(29, 56, 104, 0.08);
}

.branch-range-chip-active {
  border-color: #c9d9f6;
  background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
  color: #294c89;
}

.date-range-popover {
  position: absolute;
  top: calc(100% + 0.65rem);
  right: 0;
  z-index: 30;
  width: min(420px, 92vw);
  padding: 1rem;
  border: 1px solid #e5ebf4;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
  box-shadow: 0 22px 48px rgba(15, 23, 42, 0.16);
}

.date-range-popover-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.date-range-popover-head strong {
  display: block;
  color: #223658;
  font-size: 0.95rem;
}

.date-range-popover-head small {
  display: block;
  margin-top: 0.2rem;
  color: #71809a;
  font-size: 0.78rem;
  line-height: 1.4;
}

.date-range-close {
  width: 34px;
  height: 34px;
  border: 1px solid #e1e7f0;
  border-radius: 10px;
  background: #fff;
  color: #52607a;
}

.date-range-quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.95rem;
}

.date-quick-btn {
  height: 32px;
  padding: 0 0.72rem;
  border: 1px solid #dbe4f0;
  border-radius: 999px;
  background: #fff;
  color: #44536c;
  font-size: 0.76rem;
  font-weight: 700;
}

.date-range-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.date-range-field {
  display: flex;
  flex-direction: column;
  gap: 0.38rem;
}

.date-range-field span {
  color: #66758f;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.date-range-field input {
  height: 42px;
  padding: 0 0.85rem;
  border: 1px solid #dde4ef;
  border-radius: 12px;
  background: #fff;
  color: #23314d;
  font-size: 0.82rem;
}

.date-range-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 1rem;
}

.date-range-link {
  border: 0;
  background: transparent;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 700;
}

.date-range-apply {
  min-width: 110px;
  height: 36px;
  padding: 0 0.9rem;
  border: 1px solid #c9d9f6;
  border-radius: 12px;
  background: linear-gradient(180deg, #f8fbff 0%, #edf3ff 100%);
  color: #234b8b;
  font-size: 0.82rem;
  font-weight: 800;
}

.branch-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.7rem;
}

.branch-resume-table {
  margin-top: 0.85rem;
}

.branch-summary-card {
  padding: 0.82rem 0.9rem;
  border-radius: 18px;
  border: 1px solid #e6ebf3;
  background: #f8fafc;
}

.branch-summary-card span {
  display: block;
  color: #667085;
  font-size: 0.72rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
}

.branch-summary-card strong {
  color: #1d3360;
  font-size: 1.02rem;
  font-weight: 800;
}

.branch-summary-card small {
  font-size: 0.8rem;
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
  padding: 0.75rem 0.85rem;
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
  grid-template-columns: minmax(320px, 2.2fr) repeat(3, minmax(150px, 1fr));
  gap: 0.7rem;
  padding: 0.82rem;
  border-bottom: 1px solid #edf1f6;
  background: #fff;
  align-items: end;
}

.detail-filter-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.detail-filter-field span {
  font-size: 0.7rem;
  font-weight: 700;
  color: #67768f;
}

.detail-filter-field input,
.detail-filter-field select {
  height: 40px;
  border-radius: 12px;
  border: 1px solid #dde4ef;
  background: #fff;
  color: #23314d;
  padding: 0 0.95rem;
  font-size: 0.82rem;
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

.sales-table-detail {
  min-width: 1260px;
}

.sales-table thead th {
  padding: 0.78rem 0.8rem;
  text-align: left;
  font-size: 0.72rem;
  font-weight: 700;
  color: #495468;
  background: linear-gradient(180deg, #ffffff 0%, #fafbfd 100%);
  border-bottom: 1px solid #edf1f6;
}

.sales-table tbody td {
  padding: 0.78rem 0.8rem;
  border-bottom: 1px solid #edf1f6;
  color: #33415c;
  vertical-align: middle;
  font-size: 0.84rem;
}

.sales-table-detail th:nth-child(1),
.sales-table-detail td:nth-child(1) {
  width: 17%;
}

.sales-table-detail th:nth-child(2),
.sales-table-detail td:nth-child(2) {
  width: 13%;
}

.sales-table-detail th:nth-child(3),
.sales-table-detail td:nth-child(3) {
  width: 16%;
}

.sales-table-detail th:nth-child(4),
.sales-table-detail td:nth-child(4) {
  width: 14%;
}

.sales-table-detail th:nth-child(5),
.sales-table-detail td:nth-child(5) {
  width: 12%;
}

.sales-table-detail th:nth-child(6),
.sales-table-detail td:nth-child(6) {
  width: 6%;
  text-align: center;
}

.sales-table-detail th:nth-child(7),
.sales-table-detail td:nth-child(7) {
  width: 10%;
}

.sales-table-detail th:nth-child(8),
.sales-table-detail td:nth-child(8) {
  width: 12%;
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
  font-size: 0.82rem;
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
  min-width: 0;
}

.cell-stack strong,
.amount-text {
  color: #223658;
  font-weight: 700;
}

.cell-stack strong {
  line-height: 1.3;
  word-break: break-word;
}

.cell-stack small,
.status-pill {
  color: #7d8798;
  font-size: 0.74rem;
}

.cell-stack small {
  line-height: 1.35;
  word-break: break-word;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0.2rem 0.62rem;
  border-radius: 999px;
  background: #f2f5fa;
  font-weight: 700;
  color: #53627d;
}

.amount-text {
  font-size: 0.95rem;
}

.action-view-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-width: 88px;
  height: 34px;
  padding: 0 0.72rem;
  border: 1px solid #dbe4f0;
  border-radius: 10px;
  background: #fff;
  color: #2d4f8f;
  font-weight: 700;
  font-size: 0.8rem;
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
  justify-content: flex-start;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.branch-toolbar-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.branch-export-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  min-height: 36px;
  padding: 0 0.82rem;
  border: 1px solid #f6c86f;
  border-radius: 12px;
  background: linear-gradient(180deg, #fff9ed 0%, #fff2d8 100%);
  color: #b46900;
  font-weight: 800;
  font-size: 0.82rem;
  box-shadow: 0 10px 24px rgba(246, 200, 111, 0.18);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.branch-export-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(246, 200, 111, 0.24);
}

.action-secondary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-width: 72px;
  height: 34px;
  padding: 0 0.72rem;
  border: 1px solid #dbe4f0;
  border-radius: 10px;
  background: #fff;
  color: #40506f;
  font-weight: 700;
  font-size: 0.8rem;
  text-decoration: none;
}

.action-danger-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-width: 78px;
  height: 34px;
  padding: 0 0.72rem;
  border: 1px solid #f3c7c7;
  border-radius: 10px;
  background: #fff5f5;
  color: #b42318;
  font-weight: 700;
  font-size: 0.8rem;
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
  font-size: 1.38rem;
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
  .branch-summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .branch-toolbar-actions {
    width: 100%;
  }

  .branch-date-filter {
    margin-left: 0;
  }

  .detail-filters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .sales-table-detail {
    min-width: 1120px;
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

  .branch-toolbar-actions,
  .branch-export-btn {
    width: 100%;
  }

  .date-range-popover {
    left: 0;
    right: auto;
    width: min(100%, 92vw);
  }

  .date-range-fields {
    grid-template-columns: 1fr;
  }

  .detail-filters {
    grid-template-columns: 1fr;
  }
}
</style>


