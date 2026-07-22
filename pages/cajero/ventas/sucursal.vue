<template>
  <div>
    <JcLoader :load="load" />
    <AdminTemplate :page="page" :modulo="modulo">
      <div slot="body" class="branch-dashboard-page enterprise-page-shell">
        <section v-if="error" class="error-card">
          <h3>No se pudo cargar el reporte</h3>
          <p>{{ error }}</p>
        </section>

        <template v-else>
          <section class="branch-hero-card enterprise-content-card">
            <div class="branch-hero-head">
              <div class="branch-hero-copy">
                <h1>Kardex de sucursal · {{ branchLabel }}</h1>
                <p>{{ branchHeroSubtitle }}</p>
              </div>

              <div class="branch-hero-meta">
                <div class="branch-context-chip">
                  <i class="fas fa-store"></i>
                  <span>Sucursal {{ branchCodeLabel }} · Punto {{ branchPointLabel }}</span>
                </div>

                <div class="branch-status-chip" :class="`branch-status-chip-${branchHealth.key}`">
                  <i :class="branchHealth.icon"></i>
                  <span>{{ branchHealth.label }}</span>
                </div>
              </div>
            </div>

            <div class="branch-hero-toolbar">
              <div class="branch-toolbar-group">
                <div v-if="activeTab === 'fechas'" class="branch-date-inline-group">
                  <label class="branch-date-inline">
                    <i class="far fa-calendar-alt"></i>
                    <input v-model="filters.fechaInicio" type="date" aria-label="Fecha inicio" />
                  </label>

                  <label class="branch-date-inline">
                    <i class="far fa-calendar-alt"></i>
                    <input v-model="filters.fechaFin" type="date" aria-label="Fecha fin" />
                  </label>
                </div>

              </div>
            </div>
          </section>

          <section class="stats-grid branch-overview-grid">
            <div class="stat-card stat-card-blue">
              <div class="stat-icon"><i class="fas fa-shopping-cart"></i></div>
              <div class="stat-copy">
                <span>Total vendido</span>
                <strong>{{ formatCurrency(branchOverview.totalGeneral) }}</strong>
                <small>{{ branchOverview.countCobrado }} transacciones cobradas</small>
              </div>
            </div>

            <div class="stat-card stat-card-green">
              <div class="stat-icon"><i class="fas fa-cash-register"></i></div>
              <div class="stat-copy">
                <span>Efectivo / caja</span>
                <strong>{{ formatCurrency(branchOverview.totalCaja) }}</strong>
                <small>No incluye QR</small>
              </div>
            </div>

            <div class="stat-card stat-card-violet">
              <div class="stat-icon"><i class="fas fa-qrcode"></i></div>
              <div class="stat-copy">
                <span>QR confirmado</span>
                <strong>{{ formatCurrency(branchOverview.totalQrConfirmado) }}</strong>
                <small>{{ branchOverview.qrConfirmados }} venta(s) QR facturadas</small>
              </div>
            </div>

            <div class="stat-card stat-card-yellow">
              <div class="stat-icon"><i class="fas fa-clock"></i></div>
              <div class="stat-copy">
                <span>QR por revisar</span>
                <strong>{{ formatCurrency(branchOverview.totalQrPendiente) }}</strong>
                <small>{{ branchOverview.qrPendientes }} pendiente(s) / pago(s)</small>
              </div>
            </div>

            <div class="stat-card stat-card-red">
              <div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div>
              <div class="stat-copy">
                <span>Incidencias</span>
                <strong>{{ branchOverview.incidencias }}</strong>
                <small>{{ branchHealth.message }}</small>
              </div>
            </div>
          </section>

          <section
            v-if="branchHealth.key !== 'ok'"
            class="branch-alert"
            :class="`branch-alert-${branchHealth.key}`"
          >
            <i :class="branchHealth.icon"></i>
            <span>{{ branchHealth.message }}</span>
          </section>

          <section class="branch-workspace">
            <section class="branch-main-card enterprise-content-card">
              <div class="branch-main-head">
                <div>
                  <p class="branch-kicker mb-1">Vista</p>
                  <h3 class="branch-main-title">{{ activeTab === 'fechas' ? 'Fechas seleccionadas' : 'Todas las ventas' }}</h3>
                </div>
                <button
                  type="button"
                  class="branch-export-btn"
                  @click="downloadKardexPdf"
                >
                  <i class="fas fa-file-pdf"></i>
                  <span>{{ activeUserId === 'all' ? 'Exportar PDF sucursal' : 'Exportar PDF cajero' }}</span>
                </button>
              </div>

              <div class="branch-tabs">
                <div class="branch-tabs-group">
                  <button
                    type="button"
                    class="branch-tab"
                    :class="{ active: activeTab === 'fechas' }"
                    @click="selectTab('fechas')"
                  >
                    Fechas seleccionadas
                  </button>
                  <button
                    type="button"
                    class="branch-tab"
                    :class="{ active: activeTab === 'todas' }"
                    @click="selectTab('todas')"
                  >
                    Todas las ventas
                  </button>
                </div>
              </div>

              <div v-if="false" class="table-wrap enterprise-table-wrap branch-resume-table">
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

              <div>
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
                        <th>Nro. factura</th>
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
                            <strong>{{ numeroFacturaValue(venta) || '-' }}</strong>
                          </div>
                        </td>
                        <td>
                          <div class="cell-stack">
                            <strong>
                              <span class="status-pill" :class="channelPillClass(venta)">
                                {{ paymentOriginLabel(venta) }}
                              </span>
                            </strong>
                          </div>
                        </td>
                        <td>
                          <div class="cell-stack">
                            <strong>
                              <span class="status-pill" :class="statusPillClass(venta)">
                                {{ emissionStateLabel(venta) }}
                              </span>
                            </strong>
                            <small v-if="hasAnulacionAudit(venta)" class="audit-inline-copy">
                              Anulada por {{ venta.anulacion?.anuladaPorNombre || venta.anulacion?.anuladaPorEmail || 'usuario no identificado' }}
                            </small>
                            <small v-if="hasAnulacionAudit(venta)" class="audit-inline-copy">
                              {{ formatDateTime(venta.anulacion?.anuladaAt) }}
                            </small>
                            <small v-if="hasQrCancelacionAudit(venta)" class="audit-inline-copy">
                              QR cancelado por {{ venta.qrCancelacion?.canceladaPorNombre || venta.qrCancelacion?.canceladaPorEmail || 'usuario no identificado' }}
                            </small>
                            <small v-if="hasQrCancelacionAudit(venta)" class="audit-inline-copy">
                              {{ formatDateTime(venta.qrCancelacion?.canceladaAt) }}
                            </small>
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
                              @click="verQrVenta(venta)"
                            >
                              <i class="fas fa-qrcode"></i>
                              <span>Ver QR</span>
                            </button>
                            <button
                              v-else-if="canConsultarEstadoVenta(venta)"
                              class="action-secondary-btn"
                              type="button"
                              @click="consultarQrVenta(venta, false)"
                            >
                              <i class="fas fa-sync-alt"></i>
                              <span>Consultar</span>
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
                              <span>{{ qrCancelActionLabel(venta) }}</span>
                            </button>
                            <button
                              v-if="canAnularVenta(venta)"
                              class="action-danger-btn"
                              type="button"
                              @click="anularVenta(venta)"
                            >
                              <i class="fas fa-ban"></i>
                              <span>{{ isRejectedVenta(venta) && isCartVenta(venta) ? 'Anular venta' : 'Anular' }}</span>
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

            <aside class="branch-selector-card enterprise-content-card">
              <div class="selector-head">
                <div>
                  <h3 class="mb-1">Resumen</h3>
                </div>
                <button type="button" class="selector-export-btn" @click="downloadUserSummaryPdf">
                  <i class="fas fa-file-pdf"></i>
                  <span>Exportar PDF</span>
                </button>
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
                  <span class="selector-content">
                    <span class="selector-name">Todos los usuarios</span>
                    <span class="selector-metrics">
                      <small><strong>Ventas</strong> {{ branchGlobalOverview.countCobrado }}</small>
                      <small><strong>Total</strong> {{ formatCurrency(branchGlobalOverview.totalGeneral) }}</small>
                      <small><strong>QR</strong> {{ formatCurrency(branchGlobalOverview.totalQr) }}</small>
                      <small><strong>Ef</strong> {{ formatCurrency(branchGlobalOverview.totalEf) }}</small>
                    </span>
                  </span>
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
                  <span class="selector-content">
                    <span class="selector-name">{{ user.nombre }}</span>
                    <span class="selector-metrics">
                      <small><strong>Ventas</strong> {{ user.countCobrado }}</small>
                      <small><strong>Total</strong> {{ formatCurrency(user.total) }}</small>
                      <small><strong>QR</strong> {{ formatCurrency(user.totalQr) }}</small>
                      <small><strong>Ef</strong> {{ formatCurrency(user.totalCaja) }}</small>
                    </span>
                  </span>
                </button>
              </div>
            </aside>
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

            <div v-if="isReviewedQrIncident(activeDetailVenta)" class="detail-modal-meta">
              <span>Incidencia revisada</span>
              <span>{{ activeDetailVenta.incidencia_revisada_por || 'Sin usuario' }}</span>
              <span>{{ formatDate(activeDetailVenta.incidencia_revisada_at) }}</span>
            </div>

            <div v-if="canMarkQrIncidentReviewed(activeDetailVenta)" class="detail-modal-actions">
              <button type="button" class="action-secondary-btn" @click="markQrIncidentReviewed(activeDetailVenta)">
                <i class="fas fa-check-circle"></i>
                <span>Marcar revisada</span>
              </button>
            </div>

            <div v-if="isReviewedQrIncident(activeDetailVenta) && activeDetailVenta.incidencia_revision_nota" class="detail-modal-note">
              {{ activeDetailVenta.incidencia_revision_nota }}
            </div>

            <div v-if="hasAnulacionAudit(activeDetailVenta)" class="detail-audit-card">
              <h4>Auditoria de anulacion</h4>
              <div class="detail-audit-grid">
                <div><strong>Factura:</strong> {{ activeDetailVenta.anulacion?.numeroFactura || numeroFacturaValue(activeDetailVenta) || '-' }}</div>
                <div><strong>Orden:</strong> {{ activeDetailVenta.anulacion?.codigoOrden || activeDetailVenta.codigoOrden || '-' }}</div>
                <div><strong>CUF:</strong> {{ activeDetailVenta.anulacion?.cuf || activeDetailVenta.status?.cuf || activeDetailVenta.cuf || '-' }}</div>
                <div><strong>Anulada por:</strong> {{ activeDetailVenta.anulacion?.anuladaPorNombre || activeDetailVenta.anulacion?.anuladaPorEmail || 'Sin registro' }}</div>
                <div><strong>Fecha y hora:</strong> {{ formatDateTime(activeDetailVenta.anulacion?.anuladaAt) }}</div>
                <div><strong>Tipo:</strong> {{ activeDetailVenta.anulacion?.tipo || 'Sin registro' }}</div>
                <div class="detail-audit-full"><strong>Motivo:</strong> {{ activeDetailVenta.anulacion?.motivo || 'Sin motivo registrado' }}</div>
                <div v-if="anulacionRespaldoUrl(activeDetailVenta)" class="detail-audit-full">
                  <strong>Respaldo:</strong>
                  <a
                    :href="anulacionRespaldoUrl(activeDetailVenta)"
                    target="_blank"
                    rel="noopener"
                  >
                    {{ anulacionRespaldoNombre(activeDetailVenta) || 'Ver archivo adjunto' }}
                  </a>
                  <span v-if="anulacionRespaldoMime(activeDetailVenta) || anulacionRespaldoSize(activeDetailVenta)">
                    · {{ anulacionRespaldoMime(activeDetailVenta) || 'Archivo' }}
                    <span v-if="anulacionRespaldoSize(activeDetailVenta)"> · {{ formatFileSize(anulacionRespaldoSize(activeDetailVenta)) }}</span>
                  </span>
                </div>
                <div v-if="activeDetailVenta.anulacion?.autorizadaPorEmail" class="detail-audit-full">
                  <strong>Autorizada por:</strong> {{ activeDetailVenta.anulacion.autorizadaPorEmail }}
                </div>
              </div>
            </div>

            <div v-if="hasQrCancelacionAudit(activeDetailVenta)" class="detail-audit-card">
              <h4>Auditoria de cancelacion QR</h4>
              <div class="detail-audit-grid">
                <div><strong>Orden:</strong> {{ activeDetailVenta.qrCancelacion?.codigoOrden || activeDetailVenta.codigoOrden || '-' }}</div>
                <div><strong>Tx QR:</strong> {{ activeDetailVenta.qrCancelacion?.transactionId || activeDetailVenta.qr_transaction_id || '-' }}</div>
                <div><strong>Estado pago:</strong> {{ activeDetailVenta.qrCancelacion?.estadoPago || activeDetailVenta.estado_pago || '-' }}</div>
                <div><strong>Cancelado por:</strong> {{ activeDetailVenta.qrCancelacion?.canceladaPorNombre || activeDetailVenta.qrCancelacion?.canceladaPorEmail || 'Sin registro' }}</div>
                <div><strong>Fecha y hora:</strong> {{ formatDateTime(activeDetailVenta.qrCancelacion?.canceladaAt) }}</div>
                <div><strong>Origen:</strong> {{ activeDetailVenta.qrCancelacion?.origen || 'Sin registro' }}</div>
                <div class="detail-audit-full"><strong>Motivo:</strong> {{ activeDetailVenta.qrCancelacion?.motivo || 'Sin motivo registrado' }}</div>
                <div class="detail-audit-full"><strong>Detalle:</strong> {{ activeDetailVenta.qrCancelacion?.mensaje || activeDetailVenta.mensaje_emision || 'Sin detalle registrado' }}</div>
              </div>
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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
      activeTab: 'fechas',
      currentPage: 1,
      pageSize: 15,
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
    branchCodeLabel() {
      return String(this.filters.codigoSucursal || '0').padStart(3, '0');
    },
    branchPointLabel() {
      return String(this.filters.puntoVenta || '0');
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
    branchHeroSubtitle() {
      const base = this.activeTab === 'todas'
        ? 'Historial completo'
        : (this.hasDateRange ? this.currentDateRangeLabel : 'Sin rango de fechas aplicado');

      return `${base} · ${this.scopeVentas.length} venta(s) visibles${this.activeUserId === 'all' ? ' en la sucursal' : ` para ${this.activeUserName}`}`;
    },
    visibleVentas() {
      if (this.activeTab === 'todas') {
        return this.ventas;
      }

      return this.ventas.filter((venta) => this.isVentaInDateRange(venta));
    },
    scopeVentas() {
      return this.activeUserId === 'all'
        ? this.visibleVentas
        : this.visibleVentas.filter((venta) => this.usuarioId(venta) === this.activeUserId);
    },
    activeUserName() {
      if (this.activeUserId === 'all') {
        return 'la sucursal';
      }

      const match = this.userSummaries.find((user) => user.id === this.activeUserId);
      return match?.nombre || 'el usuario seleccionado';
    },
    filteredVentas() {
      const ventas = this.scopeVentas;

      return ventas
        .filter((venta) => this.matchesDetailFilters(venta))
        .slice()
        .sort((a, b) => this.compareVentasByFactura(a, b));
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
            countCobrado: 0,
            total: 0,
            totalCobrado: 0,
            totalCaja: 0,
            totalQr: 0,
            deliveries: this.buildDeliveryAccumulator()
          });
        }

        const current = map.get(id);
        current.ventas += 1;
        if (this.countsTowardCollectedTotal(venta)) {
          current.countCobrado += 1;
          current.total += Number(venta.total || 0);
          current.totalCobrado += Number(venta.total || 0);
        }
        if (this.countsTowardCashTotal(venta)) {
          current.totalCaja += Number(venta.total || 0);
        }
        if (this.countsTowardCollectedQrTotal(venta)) {
          current.totalQr += Number(venta.total || 0);
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
    branchOverview() {
      return this.scopeVentas.reduce((acc, venta) => {
        const total = Number(venta.total || 0);
        const sectionKey = this.resolveSectionKey(venta);
        const reviewedQrIncident = this.isReviewedQrIncident(venta);

        if (this.countsTowardCollectedTotal(venta)) {
          acc.totalGeneral += total;
          acc.countCobrado += 1;
        }

        if (this.countsTowardCashTotal(venta)) {
          acc.totalCaja += total;
        }

        if (sectionKey === 'qr_facturado' && this.countsTowardCollectedQrTotal(venta)) {
          acc.totalQrConfirmado += total;
          acc.qrConfirmados += 1;
        }

        if (sectionKey === 'qr_pagado_pendiente_factura' || sectionKey === 'qr_pendiente') {
          acc.totalQrPendiente += total;
          acc.qrPendientes += 1;
        }

        if (this.isReviewableCartIncident(venta) && !reviewedQrIncident) {
          acc.incidencias += 1;
        }

        return acc;
      }, {
        totalGeneral: 0,
        countCobrado: 0,
        totalCaja: 0,
        totalQrConfirmado: 0,
        qrConfirmados: 0,
        totalQrPendiente: 0,
        qrPendientes: 0,
        incidencias: 0
      });
    },
    branchGlobalOverview() {
      return this.visibleVentas.reduce((acc, venta) => {
        const total = Number(venta.total || 0);

        if (this.countsTowardCollectedTotal(venta)) {
          acc.countCobrado += 1;
          acc.totalGeneral += total;
        }

        if (this.countsTowardCollectedQrTotal(venta)) {
          acc.totalQr += total;
        }

        if (this.countsTowardCashTotal(venta)) {
          acc.totalEf += total;
        }

        return acc;
      }, {
        countCobrado: 0,
        totalGeneral: 0,
        totalQr: 0,
        totalEf: 0
      });
    },
    branchDeliverySummary() {
      return this.scopeVentas.reduce((acc, venta) => {
        const sectionKey = this.resolveSectionKey(venta);
        acc[sectionKey].count += 1;
        acc[sectionKey].total += Number(venta.total || 0);
        return acc;
      }, this.buildDeliveryAccumulator());
    },
    branchHealth() {
      const observed = this.scopeVentas.filter((venta) => this.isReviewableCartIncident(venta) && !this.isReviewedQrIncident(venta)).length;
      const pending = this.branchDeliverySummary.qr_pagado_pendiente_factura.count
        + this.branchDeliverySummary.qr_pendiente.count;

      if (!this.scopeVentas.length) {
        return {
          key: 'empty',
          label: 'Sin ventas',
          icon: 'far fa-times-circle',
          message: this.activeUserId === 'all'
            ? 'No se encontraron ventas para este rango en la sucursal.'
            : `No se encontraron ventas para ${this.activeUserName} en este rango.`
        };
      }

      if (observed > 0) {
        return {
          key: 'alert',
          label: 'Con observaciones',
          icon: 'fas fa-exclamation-triangle',
          message: `Se detectaron ${observed} venta(s) anuladas o con observacion para revisar.`
        };
      }

      if (pending > 0) {
        return {
          key: 'pending',
          label: 'Con pendientes',
          icon: 'far fa-clock',
          message: `Hay ${pending} venta(s) QR pendientes o pagadas sin cierre final de factura.`
        };
      }

      return {
        key: 'ok',
        label: 'Sin observaciones',
        icon: 'far fa-check-circle',
        message: 'La sucursal no presenta incidencias visibles en el rango seleccionado.'
      };
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
      const synced = this.syncFiltersToRoute();
      if (!synced && this.activeTab === 'fechas') {
        this.scheduleLoadVentas();
      }
    },
    'filters.fechaFin'() {
      this.currentPage = 1;
      const synced = this.syncFiltersToRoute();
      if (!synced && this.activeTab === 'fechas') {
        this.scheduleLoadVentas();
      }
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
    '$route.query': {
      deep: true,
      handler(nextQuery, previousQuery) {
        const nextSignature = JSON.stringify(nextQuery || {});
        const previousSignature = JSON.stringify(previousQuery || {});

        if (nextSignature === previousSignature) {
          return;
        }

        this.syncRouteFilters();
        this.loadVentas();
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
    todayIso() {
      const date = new Date();
      const year = date.getFullYear();
      const month = `${date.getMonth() + 1}`.padStart(2, '0');
      const day = `${date.getDate()}`.padStart(2, '0');
      return `${year}-${month}-${day}`;
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
      const defaultDate = this.todayIso();
      const hasFechaInicio = Object.prototype.hasOwnProperty.call(this.$route.query, 'fechaInicio');
      const hasFechaFin = Object.prototype.hasOwnProperty.call(this.$route.query, 'fechaFin');
      const fechaInicio = hasFechaInicio ? this.$route.query.fechaInicio : defaultDate;
      const fechaFin = hasFechaFin ? this.$route.query.fechaFin : defaultDate;

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
    syncFiltersToRoute() {
      if (this.isSyncingFilters) {
        return false;
      }

      const nextQuery = {
        ...this.$route.query,
        fechaInicio: this.filters.fechaInicio || '',
        fechaFin: this.filters.fechaFin || '',
        codigoSucursal: this.filters.codigoSucursal || '',
        puntoVenta: this.filters.puntoVenta || '',
        nombre: this.branchName || this.$route.query.nombre || '',
        departamento: this.branchDepartment || this.$route.query.departamento || ''
      };

      Object.keys(nextQuery).forEach((key) => {
        if (nextQuery[key] === '') {
          delete nextQuery[key];
        }
      });

      const currentSignature = JSON.stringify(this.$route.query || {});
      const nextSignature = JSON.stringify(nextQuery);

      if (currentSignature === nextSignature) {
        return false;
      }

      this.$router.replace({ query: nextQuery });
      return true;
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
    hasFacturaEmitidaEvidence(venta) {
      const estadoEmision = String(venta?.estado_emision || '').trim().toUpperCase();
      const statusKey = String(venta?.status?.key || '').trim().toUpperCase();
      const statusLabel = String(venta?.status?.label || '').trim().toUpperCase();
      const cuf = String(
        venta?.cuf
        || venta?.status?.cuf
        || venta?.seguimiento?.cuf
        || venta?.respuesta_emision?.factura?.cuf
        || venta?.respuesta_emision?.cuf
        || ''
      ).trim();
      const pdfUrl = String(
        venta?.seguimiento?.urlPdf
        || venta?.respuesta_emision?.factura?.pdfUrl
        || venta?.respuesta_emision?.pdfUrl
        || ''
      ).trim();
      const numeroFactura = String(
        venta?.numeroFactura
        || venta?.respuesta_emision?.factura?.nroFactura
        || ''
      ).trim();

      return estadoEmision === 'FACTURADA'
        || statusKey === 'FACTURADA'
        || statusLabel.includes('FACTURADA')
        || cuf !== ''
        || pdfUrl !== ''
        || numeroFactura !== '';
    },
    isQrFacturadoVenta(venta) {
      return this.isQrPaymentVenta(venta)
        && String(venta?.estado_pago || '').trim().toLowerCase() === 'pagado'
        && !this.isAnuladaVenta(venta)
        && this.hasFacturaEmitidaEvidence(venta);
    },
    isAnuladaVenta(venta) {
      const statusKey = String(venta?.status?.key || '').trim().toUpperCase();
      const estadoEmision = String(venta?.estado_emision || '').trim().toUpperCase();
      const estadoSufe = String(
        venta?.respuesta_emision?.estadoSufe
        || venta?.estadoSufe
        || venta?.estado_sufe
        || ''
      ).trim().toUpperCase();

      return [
        statusKey,
        estadoEmision,
        estadoSufe
      ].some((value) => ['ANULADA', 'ANULADO', 'ANULACION_SOLICITADA', 'DESCARTADA'].includes(value));
    },
    countsTowardCashTotal(venta) {
      if (this.isAnuladaVenta(venta)) {
        return false;
      }

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
      if (this.isAnuladaVenta(venta)) {
        return false;
      }

      if (this.isQrPaymentVenta(venta)) {
        return String(venta?.estado_pago || '').trim().toLowerCase() === 'pagado';
      }

      return this.countsTowardCashTotal(venta);
    },
    countsTowardCollectedQrTotal(venta) {
      return this.countsTowardCollectedTotal(venta) && this.isQrPaymentVenta(venta);
    },
    resolveSectionKey(venta) {
      if (this.isQrPaymentVenta(venta)) {
        const estadoPago = String(venta?.estado_pago || 'pendiente').trim().toLowerCase();

        if (estadoPago === 'pagado' && this.isQrFacturadoVenta(venta)) {
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
        const statusKey = String(venta?.status?.key || '').toUpperCase();
        if (statusKey === 'DESCARTADA') return 'DESCARTADA';
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
    numeroFacturaValue(venta) {
      const raw = String(
        venta?.numeroFactura
        || venta?.numero_factura
        || venta?.respuesta_emision?.factura?.nroFactura
        || venta?.respuesta_emision?.nroFactura
        || venta?.seguimiento?.numeroFactura
        || ''
      ).trim();

      if (!raw) {
        return '';
      }

      return raw;
    },
    numeroFacturaSortable(venta) {
      const numeroFactura = this.numeroFacturaValue(venta);
      if (!numeroFactura) {
        return null;
      }

      const numeric = numeroFactura.replace(/\D+/g, '');
      return numeric ? Number(numeric) : null;
    },
    compareVentasByFactura(a, b) {
      const facturaA = this.numeroFacturaSortable(a);
      const facturaB = this.numeroFacturaSortable(b);

      if (facturaA !== null && facturaB !== null && facturaA !== facturaB) {
        return facturaB - facturaA;
      }

      if (facturaA !== null && facturaB === null) {
        return -1;
      }

      if (facturaA === null && facturaB !== null) {
        return 1;
      }

      const dateA = new Date(a?.fecha || a?.created_at || 0).getTime();
      const dateB = new Date(b?.fecha || b?.created_at || 0).getTime();

      return dateB - dateA;
    },
    selectUser(userId) {
      this.activeUserId = userId;
      this.currentPage = 1;
    },
    async selectTab(tabKey) {
      if (this.activeTab === tabKey) {
        return;
      }

      this.activeTab = tabKey;
      this.activeUserId = 'all';
      this.currentPage = 1;
      await this.loadVentas();
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
    paymentOriginLabel(venta) {
      return this.isQrPaymentVenta(venta) ? 'QR' : 'Efectivo';
    },
    emissionStateLabel(venta) {
      if (this.isCartVenta(venta)) {
        if (this.isQrPaymentVenta(venta)) {
          const pago = String(venta?.estado_pago || '').toLowerCase();
          if (pago === 'pagado' && this.isQrFacturadoVenta(venta)) return 'QR FACTURADO';
          if (pago === 'pagado') return 'PAGADO QR';
          if (pago === 'cancelado' || pago === 'fallido') return 'QR ANULADO';
          return 'QR PENDIENTE';
        }

        const estado = this.normalizedEstadoEmision(venta);
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
      if (label.includes('FACTURAD') || label.includes('PAGADO')) return 'status-pill-success';
      if (label.includes('ANULAD')) return 'status-pill-dark';
      if (label.includes('DESCARTAD')) return 'status-pill-dark';
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
      return response?.factura?.pdfUrl
        || response?.pdfUrl
        || venta?.seguimiento?.urlPdf
        || '';
    },
    isRejectedVenta(venta) {
      const statusKey = String(venta?.status?.key || '').trim().toUpperCase();
      const statusLabel = String(venta?.status?.label || '').trim().toUpperCase();
      const estadoEmision = this.normalizedEstadoEmision(venta);

      return ['OBSERVADO', 'RECHAZADA'].includes(statusKey)
        || statusLabel.includes('OBSERVAD')
        || statusLabel.includes('RECHAZAD')
        || estadoEmision === 'RECHAZADA';
    },
    canAnularVenta(venta) {
      return Boolean(venta?.status?.cuf) && (Boolean(venta?.status?.can_annul) || this.isRejectedVenta(venta));
    },
    canCancelarQrVenta(venta) {
      return this.isCartVenta(venta)
        && this.isQrPaymentVenta(venta)
        && String(venta?.status?.key || '').trim().toUpperCase() === 'QR_PENDIENTE'
        && String(venta?.estado_pago || 'pendiente').trim().toLowerCase() === 'pendiente';
    },
    qrCancelActionLabel(venta) {
      return 'Cancelar pago';
    },
    isReviewedQrIncident(venta) {
      return Boolean(venta?.incidencia_revisada_at);
    },
    isRejectedDiscardedIncident(venta) {
      return this.isCartVenta(venta)
        && String(venta?.estado || '').trim().toLowerCase() === 'descartado'
        && this.normalizedEstadoEmision(venta) === 'DESCARTADA';
    },
    isReviewableCartIncident(venta) {
      return this.isCartVenta(venta)
        && (
          this.resolveSectionKey(venta) === 'qr_cancelado'
          || this.isRejectedDiscardedIncident(venta)
        );
    },
    canMarkQrIncidentReviewed(venta) {
      return this.isReviewableCartIncident(venta)
        && !this.isReviewedQrIncident(venta);
    },
    canViewQr(venta) {
      return this.isCartVenta(venta)
        && this.isQrPaymentVenta(venta)
        && ['pendiente', 'cancelado', 'fallido'].includes(String(venta?.estado_pago || 'pendiente').trim().toLowerCase());
    },
    needsFacturaRefresh(venta) {
      return this.isCartVenta(venta)
        && this.hasFacturaEmitidaEvidence(venta)
        && !this.pdfOriginalUrl(venta);
    },
    canConsultarEstadoVenta(venta) {
      return this.isCartVenta(venta)
        && (Boolean(venta?.status?.can_consult) || this.needsFacturaRefresh(venta))
        && !this.canViewQr(venta);
    },
    canFacturarQrVenta(venta) {
      return this.isCartVenta(venta)
        && this.isQrPaymentVenta(venta)
        && String(venta?.estado_pago || '').trim().toLowerCase() === 'pagado'
        && !this.isQrFacturadoVenta(venta);
    },
    extractQrPayloadFromConsultResponse(payload) {
      const qrData = payload?.qr_data || {};
      const respuesta = payload?.respuesta || {};
      const qhantuy = respuesta?.qhantuy || {};
      const cart = payload?.cart || {};
      const imageData = String(
        qrData?.image_data
        || qrData?.qr_url
        || qrData?.qrUrl
        || qrData?.image_url
        || qrData?.imageUrl
        || respuesta?.image_data
        || respuesta?.qr_url
        || respuesta?.qrUrl
        || respuesta?.image_url
        || respuesta?.items?.[0]?.qr_url
        || respuesta?.items?.[0]?.image_data
        || respuesta?.items?.[0]?.image_url
        || qhantuy?.qr_url
        || qhantuy?.qrUrl
        || qhantuy?.image_data
        || qhantuy?.items?.[0]?.qr_url
        || qhantuy?.items?.[0]?.image_data
        || qhantuy?.items?.[0]?.image_url
        || cart?.respuesta_emision?.qr_url
        || cart?.respuesta_emision?.image_data
        || cart?.respuesta_emision?.items?.[0]?.qr_url
        || ''
      ).trim();
      const transactionId = String(
        qrData?.transaction_id
        || qrData?.transactionId
        || respuesta?.transaction_id
        || respuesta?.payment_id
        || respuesta?.paymentId
        || respuesta?.items?.[0]?.id
        || qhantuy?.transaction_id
        || qhantuy?.id
        || qhantuy?.items?.[0]?.id
        || cart?.qr_transaction_id
        || ''
      ).trim();
      const paymentStatus = String(
        qrData?.payment_status
        || qrData?.paymentStatus
        || respuesta?.payment_status
        || respuesta?.paymentStatus
        || respuesta?.items?.[0]?.payment_status
        || qhantuy?.payment_status
        || qhantuy?.status
        || qhantuy?.items?.[0]?.payment_status
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
    qrFeedbackMessage(payload, fallbackTitle = 'QR actualizado') {
      const feedback = payload?.feedback || {};
      return {
        icon: String(feedback?.type || '').trim().toLowerCase() || 'info',
        title: String(feedback?.title || '').trim() || fallbackTitle,
        text: String(feedback?.message || feedback?.detail || payload?.message || '').trim()
      };
    },
    findVentaByCartId(sourceVenta) {
      const cartId = Number(sourceVenta?.cartId || sourceVenta?.origenVentaId || String(sourceVenta?.id || '').replace('cart-', ''));
      return this.ventas.find((item) => String(item.id) === String(sourceVenta?.id) || Number(item.cartId || item.origenVentaId || 0) === cartId) || sourceVenta;
    },
    qrPayloadFromVenta(venta) {
      const respuesta = venta?.respuesta_emision || {};
      return this.extractQrPayloadFromConsultResponse({
        qr_data: respuesta?.qr_data || {},
        respuesta,
        cart: venta
      });
    },
    shouldKeepShowingQr(venta, qrPayload = null) {
      if (!this.canViewQr(venta)) {
        return false;
      }

      const resolvedPayload = qrPayload || this.qrPayloadFromVenta(venta);
      if (!resolvedPayload) {
        return Boolean(venta?.qr_transaction_id);
      }

      return ['holding', 'pending', 'pendiente'].includes(String(resolvedPayload.paymentStatus || '').trim().toLowerCase());
    },
    async showPendingQrModal(qrPayload, pendingText = 'El QR sigue vigente, pero no se recibio la imagen en esta consulta.') {
      const imageSrc = this.normalizeQrImageSrc(qrPayload?.imageData);
      const html = imageSrc
        ? `<div style="text-align:center"><img src="${imageSrc}" alt="QR" style="max-width:260px;width:100%;border-radius:12px;border:1px solid #e5e7eb;padding:8px;background:#fff"></div>`
        : `<p class="mb-0">${pendingText}</p>`;
      await this.$swal.fire({
        title: 'QR vigente',
        html,
        confirmButtonText: 'Entendido',
        footer: qrPayload?.transactionId ? `Tx: ${qrPayload.transactionId}` : ''
      });
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
    async verQrVenta(venta) {
      const originUserId = this.usuarioId(venta);
      const cartId = Number(venta?.cartId || venta?.origenVentaId || String(venta?.id || '').replace('cart-', ''));
      const localQrPayload = this.qrPayloadFromVenta(venta);

      if (!originUserId || !cartId) {
        await this.notifyAnulacion('warning', 'Venta no disponible', 'No se pudo identificar la venta QR para visualizar.');
        return;
      }

      this.load = true;
      try {
        const response = await this.$axios.$post('/api/factura-venta/cart/ver-qr', {
          origen_usuario_id: originUserId,
          cart_id: cartId
        });
        const qrPayload = this.extractQrPayloadFromConsultResponse(response);

        await this.loadVentas();
        const refreshedVenta = this.findVentaByCartId(venta);
        const refreshedQrPayload = this.qrPayloadFromVenta(refreshedVenta);
        const activeQrPayload = refreshedQrPayload || qrPayload;

        if (Boolean(response?.force_open_qr) || this.shouldKeepShowingQr(refreshedVenta, activeQrPayload)) {
          this.load = false;
          await this.showPendingQrModal(
            activeQrPayload || {
              imageData: '',
              transactionId: String(response?.cart?.qr_transaction_id || refreshedVenta?.qr_transaction_id || ''),
              paymentStatus: String(response?.cart?.estado_pago || refreshedVenta?.estado_pago || 'pendiente')
            },
            'El QR sigue vigente, pero no se recibio la imagen en esta consulta.'
          );
          return;
        }

        const feedback = this.qrFeedbackMessage(response, 'Estado QR actualizado');
        this.load = false;
        await this.$swal.fire({
          icon: feedback.icon,
          title: feedback.title,
          text: feedback.text || 'La consulta del QR fue procesada correctamente.',
          confirmButtonText: 'Entendido'
        });
      } catch (error) {
        if (this.shouldKeepShowingQr(venta, localQrPayload)) {
          this.load = false;
          await this.showPendingQrModal(
            localQrPayload,
            'No se pudo refrescar el QR desde el proveedor, pero se muestra el ultimo QR disponible guardado localmente.'
          );
          return;
        }

        const message = error?.response?.data?.feedback?.message
          || error?.response?.data?.message
          || 'No se pudo recuperar el QR de la venta.';
        this.load = false;
        await this.$swal.fire({ icon: 'error', title: 'No se pudo mostrar el QR', text: message });
      } finally {
        this.load = false;
      }
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
        const response = await this.$axios.$post('/api/factura-venta/cart/consultar', payload);
        const qrPayload = this.extractQrPayloadFromConsultResponse(response);

        await this.loadVentas();
        const refreshedVenta = this.findVentaByCartId(venta);
        const refreshedQrPayload = this.qrPayloadFromVenta(refreshedVenta);
        const activeQrPayload = refreshedQrPayload || qrPayload;

        if (this.shouldKeepShowingQr(refreshedVenta, activeQrPayload)) {
          this.load = false;
          await this.showPendingQrModal(
            activeQrPayload || {
              imageData: '',
              transactionId: String(refreshedVenta?.qr_transaction_id || ''),
              paymentStatus: String(refreshedVenta?.estado_pago || 'pendiente')
            },
            'El QR sigue pendiente, pero el proveedor no devolvio la imagen en esta consulta.'
          );
          return;
        }

        const finalState = this.emissionStateLabel(refreshedVenta);
        const message = response?.respuesta?.mensaje || response?.respuesta?.message || `Estado actualizado: ${finalState}`;

        this.load = false;
        await this.$swal.fire({
          icon: 'success',
          title: autoEmitInvoice ? 'Venta actualizada' : 'QR actualizado',
          text: message,
          confirmButtonText: 'Entendido'
        });
      } catch (error) {
        const message = error?.response?.data?.message || 'No se pudo consultar el estado de la venta QR.';
        this.load = false;
        await this.$swal.fire({ icon: 'error', title: 'No se pudo consultar', text: message });
      } finally {
        this.load = false;
      }
    },
    async fetchAnulacionGuardStatus() {
      try {
        const response = await this.$admin.$get('ventas/anulacion/guard-status');
        console.log('[ventas/sucursal] fetchAnulacionGuardStatus:success', {
          response
        });
        return response?.guard || null;
      } catch (error) {
        console.error('[ventas/sucursal] fetchAnulacionGuardStatus:error', {
          status: error?.response?.status || null,
          data: error?.response?.data || null,
          message: error?.message || null
        });
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
      const singleRole = this.$store?.state?.auth?.role || this.$store?.state?.auth?.user?.role || null;
      const roles = this.$store?.state?.auth?.roles || [];
      const permissions = this.$store?.state?.auth?.permissions || [];
      const isHigherRole =
        ['admin', 'administrador', 'supervisor'].includes(String(singleRole || '').toLowerCase())
        || 
        (Array.isArray(roles) && roles.some((r) => ['admin', 'administrador', 'supervisor'].includes(String(r).toLowerCase())))
        || (Array.isArray(permissions) && permissions.some((p) => ['rbac.manage', 'usuarios.manage', 'ventas.manage'].includes(String(p).toLowerCase())));
      console.log('[ventas/sucursal] ensureAnulacionAuthorization:start', {
        singleRole,
        roles,
        permissions,
        isHigherRole
      });
      if (isHigherRole) return true;

      const guard = await this.fetchAnulacionGuardStatus();
      console.log('[ventas/sucursal] ensureAnulacionAuthorization:guard', {
        guard
      });
      if (guard?.allowed) return true;

      const credentials = await this.promptSupervisorAuthorization();
      console.log('[ventas/sucursal] ensureAnulacionAuthorization:credentials-provided', {
        provided: Boolean(credentials)
      });
      if (!credentials) return false;

      try {
        const response = await this.$admin.$post('ventas/anulacion/autorizar', credentials);
        console.log('[ventas/sucursal] ensureAnulacionAuthorization:authorized', {
          response
        });
        await this.notifyAnulacion('success', 'Autorización concedida', response?.message || 'Anulación habilitada temporalmente.');
        return true;
      } catch (error) {
        console.error('[ventas/sucursal] ensureAnulacionAuthorization:authorize-error', {
          status: error?.response?.status || null,
          data: error?.response?.data || null,
          message: error?.message || null
        });
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
            <label class="protocol-annul-label" for="annul-respaldo">Respaldo</label>
            <input
              id="annul-respaldo"
              class="swal2-file protocol-annul-file"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,.webp,.doc,.docx"
            >
            <p class="protocol-annul-help">Adjunta una foto o documento de respaldo para la anulación.</p>
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Confirmar anulación',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
          const motivo = document.getElementById('annul-motivo')?.value?.trim();
          const tipoAnulacion = Number(document.getElementById('annul-tipo')?.value || 0);
          const respaldoInput = document.getElementById('annul-respaldo');
          const respaldo = respaldoInput?.files?.[0] || null;
          if (!motivo) {
            this.$swal.showValidationMessage('El motivo es obligatorio.');
            return false;
          }
          if (!respaldo) {
            this.$swal.showValidationMessage('Debes adjuntar un respaldo para continuar.');
            return false;
          }
          return { motivo, tipoAnulacion, respaldo };
        }
      });

      return value || null;
    },
    async anularVenta(venta) {
      console.log('[ventas/sucursal] anularVenta:start', {
        ventaId: venta?.id || null,
        codigoOrden: venta?.codigoOrden || null,
        numeroFactura: this.numeroFacturaValue(venta) || null,
        cuf: venta?.status?.cuf || venta?.cuf || null,
        status: venta?.status || null,
        estadoSufe: venta?.estadoSufe || venta?.estado_sufe || null,
        canAnular: this.canAnularVenta(venta),
        isRejected: this.isRejectedVenta(venta),
        isCart: this.isCartVenta(venta)
      });
      if (!this.canAnularVenta(venta)) {
        await this.notifyAnulacion('warning', 'No disponible', 'Solo se puede anular una factura procesada y con CUF.');
        return;
      }

      if (this.isRejectedVenta(venta) && this.isCartVenta(venta)) {
        const { value } = await this.$swal.fire({
          title: 'Anular venta rechazada',
          html: `
            <div class="protocol-annul-form">
              <label class="protocol-annul-label" for="discard-rejected-note">Motivo</label>
              <input id="discard-rejected-note" class="swal2-input protocol-annul-input" value="Venta rechazada descartada localmente">
            </div>
          `,
          focusConfirm: false,
          showCancelButton: true,
          confirmButtonText: 'Anular venta',
          cancelButtonText: 'Volver',
          preConfirm: () => {
            const note = document.getElementById('discard-rejected-note')?.value?.trim();
            return { note: note || 'Venta rechazada descartada localmente' };
          }
        });

        if (!value) return;

        this.load = true;
        try {
          const response = await this.$admin.$post('ventas/rechazadas/descartar', {
            cart_id: Number(venta?.cartId || venta?.origenVentaId || String(venta?.id || '').replace('cart-', '')),
            note: value.note
          });
          await this.notifyAnulacion('success', 'Venta anulada', response?.message || 'La venta rechazada fue descartada localmente.');
          try {
            await this.refreshVentaInPlace(venta);
          } catch (refreshError) {
            await this.loadVentas();
          }
          if (this.activeDetailVenta?.id === venta.id) {
            this.activeDetailVenta = this.findVentaByCartId(venta);
          }
        } catch (error) {
          const data = error?.response?.data || {};
          const message = data.message || data.error || 'No se pudo anular la venta rechazada.';
          await this.notifyAnulacion('error', 'No se pudo anular', message);
        } finally {
          this.load = false;
        }
        return;
      }

      const authorized = await this.ensureAnulacionAuthorization();
      console.log('[ventas/sucursal] anularVenta:authorized', {
        authorized
      });
      if (!authorized) return;

      const payload = await this.promptAnulacion();
      console.log('[ventas/sucursal] anularVenta:payload', payload);
      if (!payload) return;

      this.load = true;
      try {
        const formData = new FormData();
        formData.append('motivo', payload.motivo);
        formData.append('tipoAnulacion', String(payload.tipoAnulacion));
        if (payload.respaldo) {
          formData.append('respaldo', payload.respaldo);
        }
        console.log('[ventas/sucursal] anularVenta:request', {
          url: `ventas/anular/${venta.status.cuf}`,
          motivo: payload.motivo,
          tipoAnulacion: payload.tipoAnulacion,
          respaldo: payload.respaldo ? {
            name: payload.respaldo.name,
            size: payload.respaldo.size,
            type: payload.respaldo.type
          } : null
        });
        const response = await this.$admin.$request({
          method: 'patch',
          url: `ventas/anular/${venta.status.cuf}`,
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log('[ventas/sucursal] anularVenta:success', {
          response
        });
        await this.notifyAnulacion('success', 'Solicitud enviada', response?.message || 'La anulación fue recibida correctamente.');
        try {
          await this.refreshVentaInPlace(venta);
        } catch (refreshError) {
          console.error('[ventas/sucursal] anularVenta:refresh-error', {
            status: refreshError?.response?.status || null,
            data: refreshError?.response?.data || null,
            message: refreshError?.message || null
          });
          await this.loadVentas();
        }
        if (this.activeDetailVenta?.id === venta.id) {
          this.activeDetailVenta = this.ventas.find((item) => item.id === venta.id) || null;
        }
      } catch (error) {
        console.error('[ventas/sucursal] anularVenta:error', {
          status: error?.response?.status || null,
          data: error?.response?.data || null,
          message: error?.message || null
        });
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
        const isLocalOnly = Boolean(response?.local_only);
        await this.notifyAnulacion(
          'success',
          'Cobro QR cancelado',
          response?.message || (isLocalOnly
            ? 'El cobro QR fue cancelado localmente porque no existia un QR activo para anular.'
            : 'El QR pendiente fue cancelado correctamente.')
        );
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
    async markQrIncidentReviewed(venta) {
      if (!this.canMarkQrIncidentReviewed(venta)) {
        return;
      }

      const { value } = await this.$swal.fire({
        title: 'Marcar incidencia revisada',
        html: `
          <div class="protocol-annul-form">
            <label class="protocol-annul-label" for="review-incident-note">Nota</label>
            <input id="review-incident-note" class="swal2-input protocol-annul-input" value="${this.isRejectedDiscardedIncident(venta) ? 'Factura rechazada descartada y validada manualmente' : 'QR cancelado validado manualmente'}">
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Guardar revision',
        cancelButtonText: 'Volver',
        preConfirm: () => {
          const note = document.getElementById('review-incident-note')?.value?.trim();
          return {
            note: note || (this.isRejectedDiscardedIncident(venta)
              ? 'Factura rechazada descartada y validada manualmente'
              : 'QR cancelado validado manualmente')
          };
        }
      });

      if (!value) return;

      this.load = true;
      try {
        const response = await this.$admin.$post('qr/incidencia/revisar', {
          cart_id: Number(venta?.cartId || venta?.origenVentaId || String(venta?.id || '').replace('cart-', '')),
          note: value.note
        });
        await this.notifyAnulacion(
          'success',
          'Incidencia revisada',
          response?.message || (this.isRejectedDiscardedIncident(venta)
            ? 'La factura rechazada descartada fue marcada como revisada.'
            : 'La incidencia QR fue marcada como revisada.')
        );
        await this.loadVentas();
        if (this.activeDetailVenta?.id === venta.id) {
          this.activeDetailVenta = this.findVentaByCartId(venta);
        }
      } catch (error) {
        const message = error?.response?.data?.message || 'No se pudo marcar la incidencia como revisada.';
        await this.notifyAnulacion('error', 'No se pudo revisar', message);
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
        if (this.activeTab === 'fechas' && this.filters.fechaInicio) {
          params.append('fechaInicio', this.filters.fechaInicio);
        }
        if (this.activeTab === 'fechas' && this.filters.fechaFin) {
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
    async refreshVentaInPlace(sourceVenta) {
      const ventaId = Number(sourceVenta?.id || 0);
      if (!ventaId) {
        return null;
      }

      const refreshed = await this.$admin.$get(`ventas/${ventaId}`);
      const index = this.ventas.findIndex((item) => String(item.id) === String(ventaId));

      if (index >= 0) {
        const mergedVenta = {
          ...this.ventas[index],
          ...refreshed
        };
        this.$set(this.ventas, index, mergedVenta);

        if (this.activeDetailVenta?.id === ventaId) {
          this.activeDetailVenta = mergedVenta;
        }

        return mergedVenta;
      }

      return refreshed;
    },
    resetFilters() {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }

      const defaultDate = this.todayIso();
      this.filters = {
        fechaInicio: Object.prototype.hasOwnProperty.call(this.$route.query, 'fechaInicio')
          ? this.$route.query.fechaInicio
          : defaultDate,
        fechaFin: Object.prototype.hasOwnProperty.call(this.$route.query, 'fechaFin')
          ? this.$route.query.fechaFin
          : defaultDate,
        codigoSucursal: this.$route.query.codigoSucursal || '',
        puntoVenta: this.$route.query.puntoVenta || '',
        q: ''
      };

      this.loadVentas();
    },
    async downloadKardexPdf() {
      return this.downloadKardexPdfForUser(this.activeUserId);
    },
    async loadImageDataUrl(src) {
      const response = await fetch(src);
      const blob = await response.blob();

      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    },
    async drawPdfHeader(doc) {
      try {
        const ministerioDataUrl = await this.loadImageDataUrl('/assets/imagenes/MOPSV.png');
        const correosDataUrl = await this.loadImageDataUrl('/assets/imagenes/AGBClogo1.png');
        const pageWidth = doc.internal.pageSize.getWidth();
        const rightLogoWidth = 46;
        const rightLogoX = pageWidth - 8 - rightLogoWidth;

        doc.setFillColor(255, 255, 255);
        doc.rect(8, 5, pageWidth - 16, 21, 'F');
        doc.addImage(ministerioDataUrl, 'PNG', 10, 6.4, 82, 15);
        doc.addImage(correosDataUrl, 'PNG', rightLogoX, 5.8, rightLogoWidth, 16.5);
      } catch (error) {
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.setFillColor(255, 255, 255);
        doc.rect(8, 5, pageWidth - 16, 21, 'F');
      }
    },
    currentPdfUserLabel() {
      const user = this.$store?.state?.auth?.user || {};
      return user?.name || user?.nombre || user?.email || 'Usuario no identificado';
    },
    currentPdfTimestamp() {
      const now = new Date();
      const date = now.toLocaleDateString('es-BO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const time = now.toLocaleTimeString('es-BO', {
        hour: '2-digit',
        minute: '2-digit'
      });

      return `${date} ${time}`;
    },
    drawPdfFooter(doc, generatedBy, generatedAt) {
      const pageCount = doc.internal.getNumberOfPages();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      for (let page = 1; page <= pageCount; page += 1) {
        doc.setPage(page);
        doc.setDrawColor(210, 218, 232);
        doc.line(10, pageHeight - 12, pageWidth - 10, pageHeight - 12);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.2);
        doc.setTextColor(90, 90, 90);
        doc.text(`Emitido por: ${generatedBy}`, 10, pageHeight - 7);
        doc.text(`Fecha y hora: ${generatedAt}`, pageWidth - 10, pageHeight - 7, { align: 'right' });
      }
    },
    async downloadUserSummaryPdf() {
      this.load = true;

      try {
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'letter'
        });
        const pageWidth = doc.internal.pageSize.getWidth();
        const generatedBy = this.currentPdfUserLabel();
        const generatedAt = this.currentPdfTimestamp();
        const recaudacionLabel = this.activeTab === 'fechas'
          ? (this.filters.fechaFin || this.filters.fechaInicio || this.todayIso())
          : this.todayIso();
        const rows = [
          [
            'Todos los usuarios',
            String(this.branchGlobalOverview.countCobrado || 0),
            this.formatCurrency(this.branchGlobalOverview.totalGeneral || 0),
            this.formatCurrency(this.branchGlobalOverview.totalQr || 0),
            this.formatCurrency(this.branchGlobalOverview.totalEf || 0)
          ],
          ...this.filteredUserSummaries.map((user) => ([
            user.nombre || 'Sin usuario',
            String(user.countCobrado || 0),
            this.formatCurrency(user.total || 0),
            this.formatCurrency(user.totalQr || 0),
            this.formatCurrency(user.totalCaja || 0)
          ]))
        ];
        const rangeLabel = this.activeTab === 'fechas'
          ? `${this.filters.fechaInicio || '-'} al ${this.filters.fechaFin || '-'}`
          : 'Todas las ventas';

        await this.drawPdfHeader(doc);

        autoTable(doc, {
          startY: 28,
          body: [[
            'Oficina Postal:',
            this.branchLabel || 'Sin sucursal',
            'Encargado sucursal:',
            generatedBy
          ], [
            'Ventanilla:',
            `Punto ${this.branchPointLabel || '0'}`,
            'Fecha de recaudacion:',
            recaudacionLabel
          ]],
          theme: 'grid',
          tableWidth: 180,
          styles: {
            fontSize: 7.5,
            cellPadding: 2,
            minCellHeight: 10,
            lineColor: [90, 90, 90],
            textColor: [20, 20, 20]
          },
          columnStyles: {
            0: { cellWidth: 32, fontStyle: 'bold' },
            1: { cellWidth: 58 },
            2: { cellWidth: 32, fontStyle: 'bold' },
            3: { cellWidth: 58 }
          },
          margin: { left: 15, right: 15 }
        });

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 4,
          body: [['RESUMEN POR USUARIO']],
          theme: 'grid',
          tableWidth: 180,
          styles: {
            fontSize: 8.1,
            fontStyle: 'bold',
            cellPadding: 2.2,
            lineColor: [90, 90, 90],
            textColor: [20, 20, 20],
            fillColor: [250, 250, 250]
          },
          margin: { left: 15, right: 15 }
        });

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 2,
          body: [[
            'Cajeros visibles',
            String(this.filteredUserSummaries.length),
            'Total ventas',
            String(this.branchGlobalOverview.countCobrado || 0)
          ], [
            'Vista',
            this.activeTab === 'fechas' ? 'Fechas seleccionadas' : 'Todas las ventas',
            'Total emitido',
            this.formatCurrency(this.branchGlobalOverview.totalGeneral || 0)
          ], [
            'Rango',
            rangeLabel,
            'Total QR',
            this.formatCurrency(this.branchGlobalOverview.totalQr || 0)
          ], [
            'Total efectivo',
            this.formatCurrency(this.branchGlobalOverview.totalEf || 0),
            '',
            ''
          ]],
          theme: 'grid',
          tableWidth: 180,
          styles: {
            fontSize: 7.3,
            cellPadding: 1.8,
            minCellHeight: 8,
            lineColor: [90, 90, 90],
            textColor: [20, 20, 20]
          },
          columnStyles: {
            0: { cellWidth: 45, fontStyle: 'bold' },
            1: { cellWidth: 45 },
            2: { cellWidth: 45, fontStyle: 'bold' },
            3: { cellWidth: 45 }
          },
          margin: { left: 15, right: 15 }
        });

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 4,
          body: [['RESUMEN VISIBLE DEL PANEL']],
          theme: 'grid',
          tableWidth: 180,
          styles: {
            fontSize: 8.1,
            fontStyle: 'bold',
            cellPadding: 2.2,
            lineColor: [90, 90, 90],
            textColor: [20, 20, 20],
            fillColor: [250, 250, 250]
          },
          margin: { left: 15, right: 15 }
        });

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 2,
          head: [['Usuario', 'Ventas', 'Total', 'QR', 'Ef']],
          body: rows,
          theme: 'grid',
          tableWidth: 180,
          headStyles: {
            fillColor: [241, 245, 249],
            textColor: [20, 20, 20],
            fontStyle: 'bold',
            halign: 'center',
            lineColor: [90, 90, 90]
          },
          styles: {
            fontSize: 8.2,
            cellPadding: 2.1,
            lineColor: [90, 90, 90],
            textColor: [20, 20, 20]
          },
          columnStyles: {
            0: { cellWidth: 76 },
            1: { cellWidth: 26, halign: 'center' },
            2: { cellWidth: 26, halign: 'right' },
            3: { cellWidth: 26, halign: 'right' },
            4: { cellWidth: 26, halign: 'right' }
          },
          margin: { left: 15, right: 15 }
        });

        this.drawPdfFooter(doc, generatedBy, generatedAt);
        const blob = doc.output('blob');
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = `resumen-usuarios-${this.filters.codigoSucursal || 'sucursal'}-${this.todayIso()}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        this.$swal.fire({
          icon: 'error',
          title: 'Exportación no disponible',
          text: 'No se pudo generar el PDF del resumen.',
          confirmButtonText: 'Entendido'
        });
      } finally {
        this.load = false;
      }
    },
    async downloadKardexPdfForUser(userId = 'all') {
      this.load = true;

      try {
        const isAllVentasPdf = this.activeTab === 'todas' && userId === 'all';
        const withinSelectedRange = (venta) => {
          if (!isAllVentasPdf) {
            return true;
          }

          const rawDate = venta?.fecha || venta?.created_at || null;
          if (!rawDate) {
            return false;
          }

          const ventaDate = new Date(rawDate);
          if (Number.isNaN(ventaDate.getTime())) {
            return false;
          }

          const ventaIso = [
            ventaDate.getFullYear(),
            String(ventaDate.getMonth() + 1).padStart(2, '0'),
            String(ventaDate.getDate()).padStart(2, '0')
          ].join('-');

          if (this.filters.fechaInicio && ventaIso < this.filters.fechaInicio) {
            return false;
          }

          if (this.filters.fechaFin && ventaIso > this.filters.fechaFin) {
            return false;
          }

          return true;
        };
        const exportVentas = this.filteredVentas.filter((venta) => withinSelectedRange(venta));

        if (!exportVentas.length) {
          throw new Error('No hay ventas visibles para exportar.');
        }

        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'letter'
        });
        const pageWidth = doc.internal.pageSize.getWidth();
        const generatedBy = this.currentPdfUserLabel();
        const generatedAt = this.currentPdfTimestamp();
        const recaudacionLabel = this.activeTab === 'fechas'
          ? (this.filters.fechaFin || this.filters.fechaInicio || this.todayIso())
          : this.todayIso();
        const title = isAllVentasPdf
          ? 'LISTADO GENERAL DE VENTAS'
          : (userId === 'all' ? 'KARDEX DE SUCURSAL' : 'KARDEX DE CAJERO');
        const subtitle = isAllVentasPdf
          ? 'Ventas visibles ordenadas por numero de factura'
          : (userId === 'all'
            ? 'Resumen detallado por cajero y ventas del rango seleccionado'
            : `Resumen detallado de ventas para ${this.activeUserName}`);
        const totalEmitido = exportVentas.reduce((sum, venta) => (
          this.countsTowardCollectedTotal(venta) ? sum + Number(venta.total || 0) : sum
        ), 0);
        const totalCaja = exportVentas.reduce((sum, venta) => (
          this.countsTowardCashTotal(venta) ? sum + Number(venta.total || 0) : sum
        ), 0);
        const totalQr = exportVentas.reduce((sum, venta) => (
          this.countsTowardCollectedQrTotal(venta) ? sum + Number(venta.total || 0) : sum
        ), 0);
        const totalVentas = exportVentas.filter((venta) => this.countsTowardCollectedTotal(venta)).length;
        const summaryLabel = userId === 'all' ? 'KARDEX AGRUPADO POR CAJERO' : 'RESUMEN DEL CAJERO';
        const buildDetailRows = (ventas, rowOffset = 0) => ventas.map((venta, index) => {
          const detailItems = Array.isArray(venta?.detalle) ? venta.detalle : [];
          const detailText = detailItems.length
            ? detailItems
              .map((item) => {
                const servicio = item?.descripcion || item?.nombre || item?.detalle || item?.servicio || 'SIN SERVICIO';
                const codigoPaquete = item?.codigo || item?.codigoSeguimiento || item?.tracking || item?.guia || '';
                return codigoPaquete ? `${servicio}\nCod.: ${codigoPaquete}` : servicio;
              })
              .join('\n')
            : (venta?.cliente?.razonSocial || 'Sin cliente');

          const codeText = detailItems.length
            ? detailItems
              .map((item) => item?.codigo || item?.codigoSeguimiento || item?.tracking || '')
              .filter(Boolean)
              .join('\n')
            : '-';

          return [
            String(rowOffset + index + 1),
            this.formatDate(venta.fecha),
            detailText,
            codeText || '-',
            String(this.numeroFacturaValue(venta) || '-'),
            this.isAnuladaVenta(venta) ? 'ANULADA' : this.emissionStateLabel(venta),
            this.formatCurrency(venta.total || 0)
          ];
        });
        const groupedVentas = [];
        const groupedMap = new Map();

        exportVentas.forEach((venta) => {
          const currentUserId = this.usuarioId(venta);
          const currentUserName = this.usuarioNombre(venta);

          if (!groupedMap.has(currentUserId)) {
            const bucket = {
              id: currentUserId,
              nombre: currentUserName,
              ventas: []
            };
            groupedMap.set(currentUserId, bucket);
            groupedVentas.push(bucket);
          }

          groupedMap.get(currentUserId).ventas.push(venta);
        });

        await this.drawPdfHeader(doc);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(29, 51, 96);
        doc.text(title, pageWidth / 2, 31.5, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.8);
        doc.setTextColor(107, 114, 128);
        doc.text(subtitle, pageWidth / 2, 36.2, { align: 'center' });

        autoTable(doc, {
          startY: 41,
          body: [[
            'Oficina Postal:',
            this.branchLabel || 'Sin sucursal',
            userId === 'all' ? 'Encargado sucursal:' : 'Cajero:',
            userId === 'all' ? generatedBy : this.activeUserName
          ], [
            'Ventanilla:',
            `Punto ${this.branchPointLabel || '0'}`,
            'Fecha de recaudacion:',
            recaudacionLabel
          ]],
          theme: 'grid',
          tableWidth: 180,
          styles: {
            fontSize: 7.5,
            cellPadding: 2,
            minCellHeight: 10,
            lineColor: [90, 90, 90],
            textColor: [20, 20, 20]
          },
          columnStyles: {
            0: { cellWidth: 32, fontStyle: 'bold' },
            1: { cellWidth: 58 },
            2: { cellWidth: 32, fontStyle: 'bold' },
            3: { cellWidth: 58 }
          },
          margin: { left: 15, right: 15 }
        });

        if (isAllVentasPdf) {
          const visibleVentas = exportVentas
            .slice()
            .sort((a, b) => this.compareVentasByFactura(a, b));

          autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 4,
            body: [[
              'TOTAL GENERAL',
              this.formatCurrency(totalEmitido),
              'TOTAL VENTAS',
              String(totalVentas)
            ], [
              'TOTAL EFECTIVO',
              this.formatCurrency(totalCaja),
              'TOTAL QR',
              this.formatCurrency(totalQr)
            ]],
            theme: 'grid',
            tableWidth: 180,
            styles: {
              fontSize: 7.5,
              cellPadding: 2,
              minCellHeight: 9,
              lineColor: [90, 90, 90],
              textColor: [20, 20, 20]
            },
            columnStyles: {
              0: { cellWidth: 45, fontStyle: 'bold' },
              1: { cellWidth: 45 },
              2: { cellWidth: 45, fontStyle: 'bold' },
              3: { cellWidth: 45 }
            },
            margin: { left: 15, right: 15 }
          });

          autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 4,
            body: [['DETALLE DE TODAS LAS VENTAS']],
            theme: 'grid',
            tableWidth: 180,
            styles: {
              fontSize: 8.1,
              fontStyle: 'bold',
              cellPadding: 2.2,
              lineColor: [90, 90, 90],
              textColor: [20, 20, 20],
              fillColor: [250, 250, 250]
            },
            margin: { left: 15, right: 15 }
          });

          autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 2,
            head: [['Nro.', 'Fecha', 'Cajero', 'Detalle', 'Factura', 'Estado', 'Importe']],
            body: visibleVentas.map((venta, index) => {
              const detailItems = Array.isArray(venta?.detalle) ? venta.detalle : [];
              const detailText = detailItems.length
                ? detailItems
                  .map((item) => {
                    const servicio = item?.descripcion || item?.nombre || item?.detalle || item?.servicio || 'SIN SERVICIO';
                    const codigoPaquete = item?.codigo || item?.codigoSeguimiento || item?.tracking || item?.guia || '';
                    return codigoPaquete ? `${servicio}\nCod.: ${codigoPaquete}` : servicio;
                  })
                  .join('\n')
                : (venta?.cliente?.razonSocial || 'Sin cliente');

              return [
                String(index + 1),
                this.formatDate(venta.fecha),
                this.usuarioNombre(venta),
                detailText,
                String(this.numeroFacturaValue(venta) || '-'),
                this.isAnuladaVenta(venta) ? 'ANULADA' : this.emissionStateLabel(venta),
                this.formatCurrency(venta.total || 0)
              ];
            }),
            theme: 'grid',
            tableWidth: 180,
            headStyles: {
              fillColor: [248, 250, 252],
              textColor: [20, 20, 20],
              fontStyle: 'bold',
              halign: 'center',
              lineColor: [90, 90, 90]
            },
            styles: {
              fontSize: 7,
              cellPadding: 1.7,
              lineColor: [90, 90, 90],
              textColor: [20, 20, 20],
              overflow: 'linebreak',
              valign: 'top'
            },
            columnStyles: {
              0: { cellWidth: 10, halign: 'center' },
              1: { cellWidth: 22, halign: 'center' },
              2: { cellWidth: 28 },
              3: { cellWidth: 66 },
              4: { cellWidth: 14, halign: 'center' },
              5: { cellWidth: 20, halign: 'center' },
              6: { cellWidth: 20, halign: 'right' }
            },
            margin: { left: 15, right: 15 },
            didDrawPage: () => {
              this.drawPdfHeader(doc);
            }
          });

          this.drawPdfFooter(doc, generatedBy, generatedAt);

          const blob = doc.output('blob');
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');

          link.href = url;
          link.download = `kardex-facturacion-${this.filters.codigoSucursal || 'sucursal'}-${this.todayIso()}.pdf`;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
          return;
        }

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 4,
          body: [['RESUMEN POR CAJERO']],
          theme: 'grid',
          tableWidth: 180,
          styles: {
            fontSize: 8.1,
            fontStyle: 'bold',
            cellPadding: 2.2,
            lineColor: [90, 90, 90],
            textColor: [20, 20, 20],
            fillColor: [250, 250, 250]
          },
          margin: { left: 15, right: 15 }
        });

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 2,
          head: [['Cajero', 'Ventas', 'Total general', 'Total efectivo', 'Total QR']],
          body: groupedVentas.map((group) => {
            const ventasUsuarioActivas = group.ventas.filter((venta) => this.countsTowardCollectedTotal(venta));
            const ventasEfectivoActivas = ventasUsuarioActivas.filter((venta) => !this.isQrPaymentVenta(venta));
            const ventasQrActivas = ventasUsuarioActivas.filter((venta) => this.isQrPaymentVenta(venta));
            const totalUsuario = ventasUsuarioActivas.reduce((sum, venta) => sum + Number(venta.total || 0), 0);
            const totalUsuarioEf = ventasEfectivoActivas.reduce((sum, venta) => sum + Number(venta.total || 0), 0);
            const totalUsuarioQr = ventasQrActivas.reduce((sum, venta) => sum + Number(venta.total || 0), 0);

            return [
              group.nombre,
              String(ventasUsuarioActivas.length),
              this.formatCurrency(totalUsuario),
              this.formatCurrency(totalUsuarioEf),
              this.formatCurrency(totalUsuarioQr)
            ];
          }),
          theme: 'grid',
          tableWidth: 180,
          headStyles: {
            fillColor: [248, 250, 252],
            textColor: [20, 20, 20],
            fontStyle: 'bold',
            halign: 'center',
            lineColor: [90, 90, 90]
          },
          styles: {
            fontSize: 7.3,
            cellPadding: 1.9,
            minCellHeight: 8.5,
            lineColor: [90, 90, 90],
            textColor: [20, 20, 20]
          },
          columnStyles: {
            0: { cellWidth: 68 },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 31, halign: 'right' },
            3: { cellWidth: 31, halign: 'right' },
            4: { cellWidth: 30, halign: 'right' }
          },
          margin: { left: 15, right: 15 },
          didDrawPage: () => {
            this.drawPdfHeader(doc);
          }
        });

        let currentY = doc.lastAutoTable.finalY + 4;

        groupedVentas.forEach((group, groupIndex) => {
          const ventasUsuarioActivas = group.ventas.filter((venta) => this.countsTowardCollectedTotal(venta));
          const ventasAnuladas = group.ventas.filter((venta) => this.isAnuladaVenta(venta));
          const ventasEfectivo = group.ventas.filter((venta) => !this.isQrPaymentVenta(venta));
          const ventasQr = group.ventas.filter((venta) => this.isQrPaymentVenta(venta));
          const ventasEfectivoActivas = ventasUsuarioActivas.filter((venta) => !this.isQrPaymentVenta(venta));
          const ventasQrActivas = ventasUsuarioActivas.filter((venta) => this.isQrPaymentVenta(venta));
          const totalUsuario = ventasUsuarioActivas.reduce((sum, venta) => sum + Number(venta.total || 0), 0);
          const totalUsuarioEf = ventasEfectivoActivas.reduce((sum, venta) => sum + Number(venta.total || 0), 0);
          const totalUsuarioQr = ventasQrActivas.reduce((sum, venta) => sum + Number(venta.total || 0), 0);

          autoTable(doc, {
            startY: currentY,
            body: [[`${userId === 'all' ? `CAJERO ${groupIndex + 1}` : 'CAJERO'}: ${group.nombre}`]],
            theme: 'grid',
            tableWidth: 180,
            styles: {
              fontSize: 8,
              fontStyle: 'bold',
              cellPadding: 2.1,
              lineColor: [90, 90, 90],
              textColor: [20, 20, 20],
              fillColor: [250, 250, 250]
            },
            margin: { left: 15, right: 15 },
            didDrawPage: () => {
              this.drawPdfHeader(doc);
            }
          });
          currentY = doc.lastAutoTable.finalY + 2;

          autoTable(doc, {
            startY: currentY,
            body: [[
              ventasAnuladas.length
                ? `Total ventas: ${ventasUsuarioActivas.length} · Anuladas: ${ventasAnuladas.length}`
                : `Total ventas: ${ventasUsuarioActivas.length}`,
              `Total emitido: ${this.formatCurrency(totalUsuario)}`,
              `Efectivo: ${ventasEfectivoActivas.length} · ${this.formatCurrency(totalUsuarioEf)}`,
              `QR: ${ventasQrActivas.length} · ${this.formatCurrency(totalUsuarioQr)}`
            ]],
            theme: 'grid',
            tableWidth: 180,
            styles: {
              fontSize: 7.6,
              cellPadding: 2.2,
              minCellHeight: 9,
              lineColor: [90, 90, 90],
              textColor: [20, 20, 20]
            },
            columnStyles: {
              0: { cellWidth: 45, fontStyle: 'bold' },
              1: { cellWidth: 45, fontStyle: 'bold' },
              2: { cellWidth: 45 },
              3: { cellWidth: 45 }
            },
            margin: { left: 15, right: 15 },
            didDrawPage: () => {
              this.drawPdfHeader(doc);
            }
          });
          currentY = doc.lastAutoTable.finalY + 3;

          if (ventasEfectivo.length) {
            autoTable(doc, {
              startY: currentY,
              body: [[`VENTAS EFECTIVO · ${ventasEfectivo.length} · ${this.formatCurrency(totalUsuarioEf)}`]],
              theme: 'grid',
              tableWidth: 180,
              styles: {
                fontSize: 7.8,
                fontStyle: 'bold',
                cellPadding: 2,
                lineColor: [90, 90, 90],
                textColor: [20, 20, 20],
                fillColor: [248, 250, 252]
              },
              margin: { left: 15, right: 15 },
              didDrawPage: () => {
                this.drawPdfHeader(doc);
              }
            });
            currentY = doc.lastAutoTable.finalY + 1.5;

            autoTable(doc, {
              startY: currentY,
              head: [['Nro.', 'Fecha', 'Detalle', 'Factura', 'Estado', 'Importe']],
              body: buildDetailRows(ventasEfectivo).map((row) => [row[0], row[1], row[2], row[4], row[5], row[6]]),
              theme: 'grid',
              tableWidth: 180,
              headStyles: {
                fillColor: [248, 250, 252],
                textColor: [20, 20, 20],
                fontStyle: 'bold',
                halign: 'center',
                lineColor: [90, 90, 90]
              },
              styles: {
                fontSize: 7.1,
                cellPadding: 1.8,
                lineColor: [90, 90, 90],
                textColor: [20, 20, 20],
                overflow: 'linebreak',
                valign: 'top'
              },
              columnStyles: {
                0: { cellWidth: 10, halign: 'center' },
                1: { cellWidth: 22, halign: 'center' },
                2: { cellWidth: 86 },
                3: { cellWidth: 14, halign: 'center' },
                4: { cellWidth: 24, halign: 'center' },
                5: { cellWidth: 24, halign: 'right' }
              },
              margin: { left: 15, right: 15 },
              didDrawPage: () => {
                this.drawPdfHeader(doc);
              }
            });
            currentY = doc.lastAutoTable.finalY + 2;
          }

          if (ventasQr.length) {
            autoTable(doc, {
              startY: currentY,
              body: [[`VENTAS QR · ${ventasQr.length} · ${this.formatCurrency(totalUsuarioQr)}`]],
              theme: 'grid',
              tableWidth: 180,
              styles: {
                fontSize: 7.8,
                fontStyle: 'bold',
                cellPadding: 2,
                lineColor: [90, 90, 90],
                textColor: [20, 20, 20],
                fillColor: [248, 250, 252]
              },
              margin: { left: 15, right: 15 },
              didDrawPage: () => {
                this.drawPdfHeader(doc);
              }
            });
            currentY = doc.lastAutoTable.finalY + 1.5;

            autoTable(doc, {
              startY: currentY,
              head: [['Nro.', 'Fecha', 'Detalle', 'Factura', 'Estado', 'Importe']],
              body: buildDetailRows(ventasQr).map((row) => [row[0], row[1], row[2], row[4], row[5], row[6]]),
              theme: 'grid',
              tableWidth: 180,
              headStyles: {
                fillColor: [248, 250, 252],
                textColor: [20, 20, 20],
                fontStyle: 'bold',
                halign: 'center',
                lineColor: [90, 90, 90]
              },
              styles: {
                fontSize: 7.1,
                cellPadding: 1.8,
                lineColor: [90, 90, 90],
                textColor: [20, 20, 20],
                overflow: 'linebreak',
                valign: 'top'
              },
              columnStyles: {
                0: { cellWidth: 10, halign: 'center' },
                1: { cellWidth: 22, halign: 'center' },
                2: { cellWidth: 86 },
                3: { cellWidth: 14, halign: 'center' },
                4: { cellWidth: 24, halign: 'center' },
                5: { cellWidth: 24, halign: 'right' }
              },
              margin: { left: 15, right: 15 },
              didDrawPage: () => {
                this.drawPdfHeader(doc);
              }
            });
            currentY = doc.lastAutoTable.finalY + 2;
          }
        });

        autoTable(doc, {
          startY: currentY,
          body: [[
            'TOTAL GENERAL',
            this.formatCurrency(totalEmitido),
            'TOTAL EFECTIVO',
            this.formatCurrency(totalCaja)
          ], [
            'TOTAL QR',
            this.formatCurrency(totalQr),
            '',
            ''
          ]],
          theme: 'grid',
          tableWidth: 180,
          styles: {
            fontSize: 7.5,
            cellPadding: 2,
            lineColor: [90, 90, 90],
            textColor: [20, 20, 20],
            fontStyle: 'bold'
          },
          columnStyles: {
            0: { cellWidth: 45, fontStyle: 'bold' },
            1: { cellWidth: 45 },
            2: { cellWidth: 45, fontStyle: 'bold' },
            3: { cellWidth: 45 }
          },
          margin: { left: 15, right: 15 },
          didDrawPage: () => {
            this.drawPdfHeader(doc);
          }
        });

        this.drawPdfFooter(doc, generatedBy, generatedAt);

        const blob = doc.output('blob');
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = userId === 'all'
          ? `kardex-sucursal-${this.filters.codigoSucursal || '0'}-${this.todayIso()}.pdf`
          : `kardex-cajero-${userId}-${this.todayIso()}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        const message = err?.message || 'No se pudo descargar el kardex PDF.';

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
    formatFileSize(bytes) {
      const size = Number(bytes || 0);
      if (!size) {
        return '0 B';
      }

      if (size < 1024) {
        return `${size} B`;
      }

      if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(1)} KB`;
      }

      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
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
    },
    formatDateTime(value) {
      return this.formatDate(value);
    },
    anulacionRespaldoUrl(venta) {
      return (
        venta?.anulacion?.respaldoUrl
        || venta?.anulacion?.respaldo_url
        || venta?.anulacion?.url
        || venta?.anulacion?.archivoUrl
        || venta?.anulacion?.archivo_url
        || null
      );
    },
    anulacionRespaldoNombre(venta) {
      return (
        venta?.anulacion?.respaldoNombre
        || venta?.anulacion?.respaldo_nombre
        || venta?.anulacion?.archivoNombre
        || venta?.anulacion?.archivo_nombre
        || venta?.anulacion?.nombre
        || null
      );
    },
    anulacionRespaldoMime(venta) {
      return (
        venta?.anulacion?.respaldoMime
        || venta?.anulacion?.respaldo_mime
        || venta?.anulacion?.archivoMime
        || venta?.anulacion?.archivo_mime
        || null
      );
    },
    anulacionRespaldoSize(venta) {
      return (
        venta?.anulacion?.respaldoSize
        || venta?.anulacion?.respaldo_size
        || venta?.anulacion?.archivoSize
        || venta?.anulacion?.archivo_size
        || null
      );
    },
    hasQrCancelacionAudit(venta) {
      return Boolean(
        venta?.qrCancelacion?.canceladaAt
        || venta?.qrCancelacion?.motivo
        || venta?.qrCancelacion?.canceladaPorNombre
        || venta?.qrCancelacion?.canceladaPorEmail
        || venta?.qrCancelacion?.mensaje
      );
    },
    hasAnulacionAudit(venta) {
      return Boolean(
        venta?.anulacion?.anuladaAt
        || venta?.anulacion?.motivo
        || venta?.anulacion?.anuladaPorNombre
        || venta?.anulacion?.anuladaPorEmail
        || this.anulacionRespaldoUrl(venta)
      );
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
  grid-template-columns: repeat(5, minmax(0, 1fr));
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

.stat-card-blue .stat-icon { background: #e8f0ff; color: #2862d4; }
.stat-card-red .stat-icon { background: #ffe7e7; color: #d23a3a; }
.stat-card-green .stat-icon { background: #e4f7df; color: #2b8a3e; }
.stat-card-yellow .stat-icon { background: #fff2cd; color: #d69a00; }
.stat-card-violet .stat-icon { background: #f2e8ff; color: #7c3aed; }
.stat-card-gray .stat-icon { background: #eef2f7; color: #6b7280; }

.branch-hero-card {
  padding: 1rem 1.05rem;
  margin-bottom: 0.85rem;
}

.branch-hero-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.branch-hero-copy h1 {
  margin: 0;
  color: #18315f;
  font-size: 1.8rem;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.branch-hero-copy p {
  margin: 0.35rem 0 0;
  color: #6d7d96;
  font-size: 0.9rem;
}

.branch-hero-meta {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.branch-context-chip,
.branch-status-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 40px;
  padding: 0.55rem 0.85rem;
  border-radius: 14px;
  border: 1px solid #e3e9f3;
  background: #fff;
  font-size: 0.82rem;
  font-weight: 800;
  color: #26406f;
}

.branch-status-chip-ok {
  border-color: #d6efdc;
  background: #effbf2;
  color: #188247;
}

.branch-status-chip-pending {
  border-color: #fae7b9;
  background: #fff8e7;
  color: #d08b09;
}

.branch-status-chip-alert {
  border-color: #f6d2d2;
  background: #fff1f1;
  color: #d43a3a;
}

.branch-status-chip-empty {
  border-color: #e3e9f3;
  background: #f8fafc;
  color: #64748b;
}

.branch-hero-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
  margin-top: 0.95rem;
  flex-wrap: wrap;
}

.branch-toolbar-group {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.branch-range-chip-muted {
  margin-left: 0;
}

.branch-overview-grid {
  margin-bottom: 0.85rem;
}

.branch-alert {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.82rem 0.95rem;
  border-radius: 16px;
  border: 1px solid #e6ebf3;
  background: #fff;
  margin-bottom: 0.85rem;
  font-size: 0.84rem;
  font-weight: 700;
}

.branch-alert i {
  font-size: 0.9rem;
}

.branch-alert-pending {
  border-color: #f7e4b7;
  background: #fff8e8;
  color: #b97709;
}

.branch-alert-alert {
  border-color: #f6d1d1;
  background: #fff1f1;
  color: #cf3131;
}

.branch-workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 0.85rem;
  align-items: start;
}

.branch-selector-card,
.branch-main-card {
  padding: 0.85rem 0.95rem;
}

.branch-selector-card {
  position: sticky;
  top: 1rem;
}

.selector-head h3 {
  margin: 0;
  color: #1d3360;
  font-size: 0.98rem;
  font-weight: 800;
}

.selector-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.selector-export-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 34px;
  padding: 0 0.78rem;
  border: 1px solid #f6c86f;
  border-radius: 10px;
  background: linear-gradient(180deg, #fff9ed 0%, #fff2d8 100%);
  color: #b46900;
  font-size: 0.76rem;
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
  display: block;
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

.selector-content {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.selector-name {
  display: block;
  color: #1d3360;
  font-weight: 800;
  font-size: 0.9rem;
  line-height: 1.35;
  word-break: break-word;
}

.selector-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.35rem 0.8rem;
  justify-items: start;
  align-items: center;
}

.selector-item small {
  color: #66758f;
  font-size: 0.76rem;
  line-height: 1.25;
}

.selector-item small strong {
  display: block;
  color: #1d3360;
  font-size: 0.72rem;
  font-weight: 800;
  margin-bottom: 0.08rem;
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

.branch-main-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.45rem;
}

.branch-main-title {
  margin: 0;
  color: #18315f;
  font-size: 1.02rem;
  font-weight: 800;
}

.branch-tabs-group {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
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

.branch-date-inline-group {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  flex-wrap: wrap;
}

.branch-date-inline {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  min-height: 42px;
  padding: 0 0.85rem;
  border-radius: 14px;
  border: 1px solid #dbe4f0;
  background: #fff;
  color: #40506f;
}

.branch-date-inline i {
  color: #5d6d89;
  font-size: 0.92rem;
}

.branch-date-inline input {
  border: 0;
  outline: 0;
  background: transparent;
  color: #23314d;
  font-size: 0.84rem;
  font-weight: 700;
}

.branch-date-inline input::-webkit-calendar-picker-indicator {
  cursor: pointer;
}

.branch-resume-table {
  margin-top: 0.85rem;
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

.audit-inline-copy {
  color: #8a5a20 !important;
  font-size: 0.72rem !important;
  line-height: 1.2 !important;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 0.2rem 0.62rem;
  border-radius: 999px;
  background: #f2f5fa;
  font-weight: 700;
  color: #53627d;
  white-space: nowrap;
  word-break: normal;
  text-align: center;
  line-height: 1.1;
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

.detail-audit-card {
  margin: 0 0 1rem;
  padding: 1rem 1.1rem;
  border: 1px solid #e6ecf5;
  border-radius: 16px;
  background: #f8fbff;
}

.detail-audit-card h4 {
  margin: 0 0 0.8rem;
  color: #1d3360;
  font-size: 0.98rem;
}

.detail-audit-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem 1rem;
  color: #40506f;
  font-size: 0.92rem;
}

.detail-audit-full {
  grid-column: 1 / -1;
}

@media (max-width: 1199px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .branch-workspace {
    grid-template-columns: 1fr;
  }

  .branch-selector-card {
    position: static;
  }

  .selector-head {
    flex-direction: column;
    align-items: stretch;
  }

  .selector-metrics {
    grid-template-columns: 1fr;
  }

  .branch-hero-head {
    flex-direction: column;
  }

  .branch-hero-meta {
    justify-content: flex-start;
  }
}

@media (max-width: 991px) {
  .branch-hero-toolbar,
  .branch-toolbar-group {
    flex-direction: column;
    align-items: stretch;
  }

  .branch-toolbar-actions {
    width: 100%;
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
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .branch-hero-copy h1 {
    font-size: 1.45rem;
  }

  .branch-toolbar-actions,
  .branch-export-btn {
    width: 100%;
  }

  .detail-filters {
    grid-template-columns: 1fr;
  }
}
</style>


