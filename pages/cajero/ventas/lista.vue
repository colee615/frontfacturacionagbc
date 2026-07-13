<template>
  <div>
    <JcLoader :load="load" />
    <AdminTemplate :page="page" :modulo="modulo">
      <div slot="body" class="closure-page">
        <div class="closure-shell">
          <section class="hero-card">
            <div class="hero-copy">
              <h1>Control de cierre diario</h1>
              <p>Revision operativa y cierre de caja por sucursal.</p>
            </div>

            <div class="toolbar-grid">
              <label class="toolbar-field toolbar-field-date">
                <i class="far fa-calendar"></i>
                <input v-model="selectedDate" type="date" />
              </label>

              <label class="toolbar-field toolbar-field-search">
                <i class="fas fa-search"></i>
                <input v-model.trim="filters.q" type="text" placeholder="Buscar sucursal..." />
              </label>

              <label class="toolbar-field toolbar-field-select">
                <i class="fas fa-filter"></i>
                <select v-model="statusFilter">
                  <option value="all">Estado: Todos</option>
                  <option value="cerrada">Caja cerrada</option>
                  <option value="pendiente">Pendiente de cierre</option>
                  <option value="diferencia">Con diferencia</option>
                  <option value="sin_ventas">Sin ventas</option>
                </select>
              </label>
            </div>

            <section v-if="error" class="error-card">
              <h3>No se pudo cargar el reporte</h3>
              <p>{{ error }}</p>
            </section>

            <template v-else>
              <div class="summary-grid">
                <article class="summary-card summary-card-primary">
                  <div class="summary-icon">
                    <i class="fas fa-store"></i>
                  </div>
                  <div class="summary-copy">
                    <span>Sucursales del dia</span>
                    <strong>{{ dashboardMetrics.total }}</strong>
                  </div>
                </article>

                <article class="summary-card summary-card-success">
                  <div class="summary-icon">
                    <i class="far fa-check-circle"></i>
                  </div>
                  <div class="summary-copy">
                    <span>Sin observaciones</span>
                    <strong>{{ dashboardMetrics.conformes }}</strong>
                  </div>
                </article>

                <article class="summary-card summary-card-warning">
                  <div class="summary-icon">
                    <i class="far fa-clock"></i>
                  </div>
                  <div class="summary-copy">
                    <span>Con pendientes</span>
                    <strong>{{ dashboardMetrics.pendientes }}</strong>
                  </div>
                </article>

                <article class="summary-card summary-card-danger">
                  <div class="summary-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                  </div>
                  <div class="summary-copy">
                    <span>Con observaciones</span>
                    <strong>{{ dashboardMetrics.diferencias }}</strong>
                  </div>
                </article>

                <article class="summary-card summary-card-neutral">
                  <div class="summary-icon">
                    <i class="far fa-times-circle"></i>
                  </div>
                  <div class="summary-copy">
                    <span>Sin ventas</span>
                    <strong>{{ dashboardMetrics.sinVentas }}</strong>
                  </div>
                </article>

                <article class="summary-card summary-card-money">
                  <div class="summary-icon">
                    <i class="fas fa-dollar-sign"></i>
                  </div>
                  <div class="summary-copy">
                    <span>Total vendido</span>
                    <strong>{{ formatCurrency(dashboardMetrics.totalVendido) }}</strong>
                  </div>
                </article>
              </div>

              <div class="progress-panel">
                <div class="progress-card">
                  <div class="progress-card-icon">
                    <i class="far fa-clipboard"></i>
                  </div>
                  <div class="progress-card-main">
                    <div class="progress-card-copy">
                      <strong>{{ progressSummary.reviewed }} de {{ progressSummary.total }} sucursales revisadas</strong>
                      <span>{{ progressSummary.percent }}% de avance</span>
                    </div>
                    <div class="progress-track">
                      <span class="progress-fill" :style="{ width: `${progressSummary.percent}%` }"></span>
                    </div>
                  </div>
                </div>

                <div class="priority-card">
                  <i class="fas fa-info-circle"></i>
                  <span>{{ priorityMessage }}</span>
                </div>
              </div>

              <section class="table-card">
                <div v-if="!filteredBranches.length" class="empty-state">
                  <h3>Sin resultados</h3>
                  <p>No encontramos sucursales para esa fecha o filtro seleccionado.</p>
                </div>

                <div v-else class="table-wrap">
                  <table class="closure-table">
                    <thead>
                      <tr>
                        <th>Sucursal</th>
                        <th>Ventas</th>
                        <th>Total vendido</th>
                        <th>Facturación</th>
                        <th>Incidencias</th>
                        <th>Estado</th>
                        <th>Accion</th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr
                        v-for="item in filteredBranches"
                        :key="item.id"
                        :class="{
                          'row-warning': item.status.key === 'pendiente',
                          'row-danger': item.status.key === 'diferencia'
                        }"
                      >
                        <td>
                          <div class="branch-cell">
                            <span class="branch-cell-icon">
                              <i class="fas fa-store"></i>
                            </span>
                            <div class="branch-cell-copy">
                              <strong>{{ item.displayName }}</strong>
                              <small>Sucursal {{ item.codigoSucursalLabel }} · Punto {{ item.puntoVentaLabel }}</small>
                            </div>
                          </div>
                        </td>

                        <td>{{ item.ventasNetas }}</td>
                        <td>
                          <div class="metric-stack">
                            <strong>{{ formatCurrency(item.totalVendido) }}</strong>
                            <div class="metric-tags">
                              <span class="metric-tag metric-tag-info">QR {{ formatCurrency(item.totalQrFacturado) }}</span>
                              <span class="metric-tag metric-tag-neutral">Ef {{ formatCurrency(item.totalEfectivoFacturado) }}</span>
                              <span
                                v-if="item.totalQrPagadoPendienteFactura > 0"
                                class="metric-tag metric-tag-warning"
                              >
                                QR s/f {{ formatCurrency(item.totalQrPagadoPendienteFactura) }}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div class="metric-stack">
                            <strong>{{ item.facturadas }} facturadas</strong>
                            <div class="metric-tags">
                              <span class="metric-tag metric-tag-info">QR {{ item.qrFacturadas }}</span>
                              <span class="metric-tag metric-tag-neutral">Ef {{ item.electronicasFacturadas }}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <button
                            v-if="hasIncidences(item)"
                            type="button"
                            class="incident-trigger"
                            @click="loadIncidentsModal(item)"
                          >
                            <div class="metric-stack">
                              <strong>Revisar</strong>
                              <div class="metric-tags">
                                <span v-if="item.observadas > 0" class="metric-tag metric-tag-danger">Obs {{ item.observadas }}</span>
                                <span v-if="item.pendientes > 0" class="metric-tag metric-tag-warning">Pend {{ item.pendientes }}</span>
                                <span v-if="item.conCufOtroEstado > 0" class="metric-tag metric-tag-danger">Fac anul {{ item.conCufOtroEstado }}</span>
                                <span v-if="item.qrPagadoPendienteFactura > 0" class="metric-tag metric-tag-warning">QR s/f {{ item.qrPagadoPendienteFactura }}</span>
                                <span v-if="item.qrCancelado > 0" class="metric-tag metric-tag-danger">QR anul {{ item.qrCancelado }}</span>
                                <span v-if="item.qrPendiente > 0" class="metric-tag metric-tag-neutral">QR pend {{ item.qrPendiente }}</span>
                              </div>
                            </div>
                          </button>
                          <div v-else class="metric-stack">
                            <strong>Sin incidencias</strong>
                            <small>Todo en orden</small>
                          </div>
                        </td>

                        <td>
                          <span class="status-chip" :class="`status-chip-${item.status.key}`">
                            <i :class="item.status.icon"></i>
                            {{ item.status.label }}
                          </span>
                        </td>

                        <td>
                          <div class="action-stack">
                            <button
                              class="action-btn"
                              :class="item.status.actionClass"
                              type="button"
                              @click="goToSucursal(item)"
                            >
                              <i :class="item.status.actionIcon"></i>
                              <span>{{ item.status.actionLabel }}</span>
                            </button>

                            <button class="action-link" type="button" @click="loadUsersModal(item)">
                              {{ item.cajerosUnicos }} usuario(s)
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </template>
          </section>
        </div>

        <div v-if="activeUsersModal" class="detail-modal-backdrop" @click.self="closeUsersModal">
          <div class="detail-modal-card users-modal-card">
            <div class="detail-modal-head">
              <div class="users-modal-head-copy">
                <p class="detail-kicker mb-1">Usuarios de la sucursal</p>
                <h3>{{ activeUsersModal.title }}</h3>
                <p class="detail-copy mb-0">{{ activeUsersModal.subtitle }}</p>
              </div>
              <button type="button" class="detail-modal-close" @click="closeUsersModal">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="users-modal-summary">
              <div class="users-summary-pill users-summary-pill-accent">
                <span>Usuarios</span>
                <strong>{{ activeUsersModal.users.length }}</strong>
              </div>
            </div>

            <div v-if="activeUsersModal.loading" class="empty-state users-modal-empty">
              <h3>Cargando usuarios</h3>
              <p>Estamos consultando los usuarios registrados para esta sucursal.</p>
            </div>

            <div v-else-if="activeUsersModal.users.length" class="users-modal-list">
              <div v-for="user in activeUsersModal.users" :key="user.key" class="users-modal-item">
                <div class="users-modal-item-main">
                  <strong>{{ user.nombre }}</strong>
                  <small>{{ user.detalle }}</small>
                </div>
                <div class="users-modal-item-meta">
                  <span>{{ user.rol }}</span>
                  <small>{{ user.ultimaVenta || 'Sin ventas registradas' }}</small>
                </div>
              </div>
            </div>

            <div v-else class="empty-state users-modal-empty">
              <h3>Sin detalle disponible</h3>
              <p>{{ activeUsersModal.error || 'No encontramos la lista de usuarios para esta sucursal.' }}</p>
            </div>
          </div>
        </div>

        <div v-if="activeIncidentsModal" class="detail-modal-backdrop" @click.self="closeIncidentsModal">
          <div class="detail-modal-card users-modal-card incidents-modal-card">
            <div class="detail-modal-head">
              <div class="users-modal-head-copy">
                <p class="detail-kicker mb-1">Incidencias de la sucursal</p>
                <h3>{{ activeIncidentsModal.title }}</h3>
                <p class="detail-copy mb-0">{{ activeIncidentsModal.subtitle }}</p>
              </div>
              <button type="button" class="detail-modal-close" @click="closeIncidentsModal">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="users-modal-summary">
              <div class="users-summary-pill users-summary-pill-accent">
                <span>Incidencias</span>
                <strong>{{ activeIncidentsModal.items.length }}</strong>
              </div>
            </div>

            <div v-if="activeIncidentsModal.loading" class="empty-state users-modal-empty">
              <h3>Cargando incidencias</h3>
              <p>Estamos consultando el detalle de los casos detectados para esta sucursal.</p>
            </div>

            <div v-else-if="activeIncidentsModal.items.length" class="users-modal-list incidents-modal-list">
              <div v-for="incident in activeIncidentsModal.items" :key="incident.key" class="users-modal-item incidents-modal-item">
                <div class="users-modal-item-main">
                  <strong>{{ incident.title }}</strong>
                  <small>{{ incident.code }}<span v-if="incident.tracking"> · {{ incident.tracking }}</span></small>
                  <small>{{ incident.customer }}</small>
                  <small>{{ incident.message }}</small>
                </div>
                <div class="users-modal-item-meta incidents-modal-meta">
                  <span>{{ formatCurrency(incident.amount) }}</span>
                  <small>{{ incident.user }}</small>
                  <small>{{ formatDate(incident.createdAt) }}</small>
                  <small>{{ incident.status }}</small>
                </div>
              </div>
            </div>

            <div v-else class="empty-state users-modal-empty">
              <h3>Sin incidencias</h3>
              <p>{{ activeIncidentsModal.error || 'No encontramos incidencias para esta sucursal.' }}</p>
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
      selectedDate: '',
      statusFilter: 'all',
      filters: {
        codigoSucursal: '',
        puntoVenta: '',
        q: '',
        limite: 50
      },
      report: {
        resumen: {
          cantidadVentas: 0,
          totalVendido: 0,
          cajerosUnicos: 0,
          facturadas: 0,
          observadas: 0,
          pendientes: 0
        },
        sucursales: []
      },
      activeUsersModal: null,
      activeIncidentsModal: null
    };
  },
  computed: {
    branchRows() {
      return (this.report.sucursales || []).map((item, index) => this.normalizeBranch(item, index));
    },
    filteredBranches() {
      return this.branchRows.filter((item) => {
        if (!this.matchesSelectedDate(item)) {
          return false;
        }

        if (this.statusFilter !== 'all' && item.status.key !== this.statusFilter) {
          return false;
        }

        return true;
      });
    },
    dashboardMetrics() {
      return this.filteredBranches.reduce((acc, item) => {
        acc.total += 1;
        acc.totalVendido += item.totalVendido;
        acc.ventasNetas += item.ventasNetas;

        if (item.status.key === 'cerrada') acc.conformes += 1;
        if (item.status.key === 'pendiente') acc.pendientes += 1;
        if (item.status.key === 'diferencia') acc.diferencias += 1;
        if (item.status.key === 'sin_ventas') acc.sinVentas += 1;

        return acc;
      }, {
        total: 0,
        conformes: 0,
        pendientes: 0,
        diferencias: 0,
        sinVentas: 0,
        totalVendido: 0,
        ventasNetas: 0
      });
    },
    progressSummary() {
      const total = this.dashboardMetrics.total;
      const reviewed = this.filteredBranches.filter((item) => item.status.key !== 'pendiente').length;
      const percent = total ? Math.round((reviewed / total) * 100) : 0;

      return {
        total,
        reviewed,
        percent
      };
    },
    priorityMessage() {
      if (this.dashboardMetrics.diferencias) {
        return 'Priorice la revision de sucursales con ventas observadas.';
      }

      if (this.dashboardMetrics.pendientes) {
        return 'Hay sucursales con ventas pendientes que requieren seguimiento.';
      }

      return 'Todas las sucursales visibles estan sin observaciones para la fecha seleccionada.';
    }
  },
  mounted() {
    this.loadReport();
  },
  beforeDestroy() {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
  },
  watch: {
    'filters.q'() {
      this.scheduleLoadReport();
    },
    'filters.codigoSucursal'() {
      this.scheduleLoadReport();
    },
    'filters.puntoVenta'() {
      this.scheduleLoadReport();
    }
  },
  methods: {
    defaultToday() {
      const date = new Date();
      const year = date.getFullYear();
      const month = `${date.getMonth() + 1}`.padStart(2, '0');
      const day = `${date.getDate()}`.padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    scheduleLoadReport() {
      if (this.isSyncingFilters) {
        return;
      }

      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }

      this.searchTimer = setTimeout(() => {
        this.loadReport();
      }, 350);
    },
    normalizeBranch(item, index) {
      const totalQrFacturado = Number(item?.totalQrFacturado || 0);
      const totalEfectivoFacturado = Number(item?.totalEfectivoFacturado || 0);
      const totalQrPagadoPendienteFactura = Number(item?.totalQrPagadoPendienteFactura || 0);
      const cantidadVentas = Number(item?.cantidadVentas || 0);
      const pendientes = Number(item?.pendientes || 0);
      const observadas = Number(item?.observadas || 0);
      const qrPagadoPendienteFactura = Number(item?.qrPagadoPendienteFactura || 0);
      const qrCancelado = Number(item?.qrCancelado || 0);
      const qrPendiente = Number(item?.qrPendiente || 0);
      const ventasFacturadasNetas = Math.max(0, cantidadVentas - Number(item?.oficiales || 0));
      const ventasOperativas = ventasFacturadasNetas + qrPagadoPendienteFactura + qrPendiente;
      const totalCobrado = totalQrFacturado + totalEfectivoFacturado + totalQrPagadoPendienteFactura;
      const status = this.resolveBranchStatus({
        cantidadVentas: ventasOperativas,
        pendientes,
        observadas
      });

      return {
        ...item,
        id: item?.id || `${item?.codigoSucursal ?? index}-${item?.puntoVenta ?? 0}`,
        displayName: (item?.departamento || item?.nombre || item?.sucursalNombre || 'Sin sucursal').toUpperCase(),
        codigoSucursalLabel: String(item?.codigoSucursal ?? '0').padStart(3, '0'),
        puntoVentaLabel: String(item?.puntoVenta ?? '0'),
        cantidadVentas,
        ventasNetas: ventasOperativas,
        ventasFacturadasNetas,
        totalVendido: totalCobrado,
        totalFacturado: totalQrFacturado + totalEfectivoFacturado,
        totalQrFacturado,
        totalEfectivoFacturado,
        totalQrPagadoPendienteFactura,
        facturadas: Number(item?.facturadas || 0),
        qrFacturadas: Number(item?.qrFacturadas || 0),
        electronicasFacturadas: Number(item?.electronicasFacturadas || 0),
        oficiales: Number(item?.oficiales || 0),
        conCufOtroEstado: Number(item?.conCufOtroEstado || 0),
        observadas,
        pendientes,
        qrPagadoPendienteFactura,
        qrCancelado,
        qrPendiente,
        status,
        kardexDisponible: item?.kardexDisponible !== false
      };
    },
    resolveBranchStatus({ cantidadVentas, pendientes, observadas }) {
      if (cantidadVentas <= 0) {
        return {
          key: 'sin_ventas',
          label: 'Sin ventas',
          icon: 'far fa-times-circle',
          actionLabel: 'Sin actividad',
          actionClass: 'action-btn-muted',
          actionIcon: 'far fa-eye-slash'
        };
      }

      if (observadas > 0) {
        return {
          key: 'diferencia',
          label: 'Con observaciones',
          icon: 'fas fa-exclamation-triangle',
          actionLabel: 'Revisar kardex',
          actionClass: 'action-btn-danger',
          actionIcon: 'fas fa-search'
        };
      }

      if (pendientes > 0) {
        return {
          key: 'pendiente',
          label: 'Con pendientes',
          icon: 'far fa-clock',
          actionLabel: 'Revisar kardex',
          actionClass: 'action-btn-warning',
          actionIcon: 'fas fa-search'
        };
      }

      return {
        key: 'cerrada',
        label: 'Sin observaciones',
        icon: 'far fa-check-circle',
        actionLabel: 'Ver kardex',
        actionClass: 'action-btn-primary',
        actionIcon: 'far fa-eye'
      };
    },
    matchesSelectedDate(item) {
      if (!this.selectedDate) {
        return true;
      }

      const value = item?.ultimaVenta || item?.primeraVenta;
      if (!value) {
        return false;
      }

      return this.extractDateKey(value) === this.selectedDate;
    },
    extractDateKey(value) {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return '';
      }

      const year = date.getFullYear();
      const month = `${date.getMonth() + 1}`.padStart(2, '0');
      const day = `${date.getDate()}`.padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    roundCurrency(value) {
      return Math.round(Number(value || 0) * 100) / 100;
    },
    async loadReport() {
      this.load = true;
      this.error = '';

      try {
        const params = new URLSearchParams();
        Object.keys(this.filters).forEach((key) => {
          const value = this.filters[key];
          if (value !== '' && value !== null && value !== undefined) {
            params.append(key, value);
          }
        });

        const query = params.toString();
        const path = query ? `ventas/reportes/sucursales?${query}` : 'ventas/reportes/sucursales';
        console.log('[ventas/lista] loadReport:start', {
          filters: { ...this.filters },
          path
        });
        const response = await this.$admin.$get(path);
        console.log('[ventas/lista] loadReport:success', {
          resumen: response && response.resumen ? response.resumen : null,
          sucursales: Array.isArray(response && response.sucursales) ? response.sucursales.length : 0,
          firstSucursal: Array.isArray(response && response.sucursales) && response.sucursales.length
            ? response.sucursales[0]
            : null
        });

        this.report = {
          resumen: response && response.resumen ? response.resumen : this.report.resumen,
          sucursales: response && response.sucursales ? response.sucursales : []
        };
      } catch (err) {
        console.error('[ventas/lista] loadReport:error', {
          filters: { ...this.filters },
          status: err?.response?.status || null,
          data: err?.response?.data || null,
          message: err?.message || null
        });
        const message = err && err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : 'Verifica el endpoint del consolidado o los permisos de lectura.';

        this.error = message;
      } finally {
        this.load = false;
      }
    },
    resetFilters() {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }

      this.selectedDate = '';
      this.statusFilter = 'all';
      this.filters = {
        codigoSucursal: '',
        puntoVenta: '',
        q: '',
        limite: 50
      };

      this.loadReport();
    },
    hasIncidences(item) {
      return Boolean(
        item?.observadas
        || item?.pendientes
        || item?.conCufOtroEstado
        || item?.qrPagadoPendienteFactura
        || item?.qrCancelado
        || item?.qrPendiente
      );
    },
    goToSucursal(item) {
      const codigoSucursal = String(item?.codigoSucursal ?? '').trim();
      console.log('[ventas/lista] goToSucursal', {
        item,
        query: {
          codigoSucursal,
          puntoVenta: item?.puntoVenta ?? '',
          nombre: item?.nombre || '',
          departamento: item?.departamento || ''
        }
      });
      if (codigoSucursal === '' || item?.status?.key === 'sin_ventas') {
        return;
      }

      this.$router.push({
        path: '/cajero/ventas/sucursal',
        query: {
          codigoSucursal,
          puntoVenta: item.puntoVenta ?? '',
          nombre: item.nombre || '',
          departamento: item.departamento || ''
        }
      });
    },
    closeUsersModal() {
      this.activeUsersModal = null;
    },
    closeIncidentsModal() {
      this.activeIncidentsModal = null;
    },
    resolveBranchUsers(item) {
      const sources = [
        item?.cajeros,
        item?.usuarios,
        item?.users,
        item?.facturadores,
        item?.detalleCajeros,
        item?.cajerosDetalle,
        item?.usuariosDetalle
      ];

      const source = sources.find((value) => Array.isArray(value) && value.length);
      if (!source) {
        return [];
      }

      return source.map((user, index) => {
        if (typeof user === 'string') {
          return {
            key: `${item.id || 'branch'}-${index}`,
            nombre: user,
            detalle: 'Usuario registrado',
            rol: 'Cajero'
          };
        }

        const nombre = user?.nombre || user?.name || user?.alias || user?.username || user?.usuario || user?.email || 'Sin nombre';
        const detalle = user?.detalle || user?.descripcion || user?.documentoIdentidad || user?.documento || user?.correo || user?.email || 'Sin detalle';
        const rol = user?.rol || user?.role || user?.cargo || 'Cajero';

        return {
          key: user?.id || user?.codigo || `${item.id || 'branch'}-${index}`,
          nombre,
          detalle,
          rol
        };
      });
    },
    async loadUsersModal(item) {
      const modalKey = `${item.codigoSucursal ?? 0}-${item.puntoVenta ?? 0}`;
      this.load = true;
      this.activeUsersModal = {
        title: item.departamento || item.nombre || 'Sucursal',
        subtitle: `Cód. ${item.codigoSucursal ?? 0} · Punto ${item.puntoVenta ?? 0}`,
        users: this.resolveBranchUsers(item),
        loading: true,
        error: '',
        key: modalKey
      };

      try {
        console.log('[ventas/lista] loadUsersModal:start', {
          codigoSucursal: item.codigoSucursal ?? 0,
          puntoVenta: item.puntoVenta ?? 0,
          modalKey
        });
        const response = await this.$admin.$get(
          `ventas/reportes/sucursales/usuarios?codigoSucursal=${encodeURIComponent(item.codigoSucursal ?? 0)}&puntoVenta=${encodeURIComponent(item.puntoVenta ?? 0)}`
        );
        console.log('[ventas/lista] loadUsersModal:success', {
          modalKey,
          response
        });
        const source = Array.isArray(response?.usuarios)
          ? response.usuarios
          : (
            Array.isArray(response?.data?.usuarios)
              ? response.data.usuarios
              : (Array.isArray(response?.users) ? response.users : (Array.isArray(response) ? response : []))
          );

        const users = source.map((user, index) => {
          if (typeof user === 'string') {
            return {
              key: `${item.id || 'branch'}-${index}`,
              nombre: user,
              detalle: 'Usuario registrado',
              rol: 'Cajero',
              ultimaVenta: '-'
            };
          }

          const nombre = user?.usuarioNombre
            || user?.nombre
            || user?.name
            || user?.alias
            || user?.username
            || user?.usuario
            || user?.usuarioEmail
            || user?.email
            || 'Sin nombre';
          const detalleParts = [
            user?.usuarioAlias,
            user?.alias,
            user?.usuarioEmail,
            user?.email,
            user?.usuarioCarnet,
            user?.carnet
          ].filter(Boolean);

          return {
            key: user?.usuarioId || user?.id || user?.codigo || `${item.id || 'branch'}-${index}`,
            nombre,
            detalle: detalleParts.length ? detalleParts.join(' · ') : 'Sin detalle',
            rol: user?.rol || user?.role || user?.cargo || (user?.cantidadVentas !== undefined ? 'Usuario' : 'Cajero'),
            ultimaVenta: this.formatDate(user?.ultimaVenta || user?.ultima_venta || user?.lastSaleAt || user?.ultimaVentaAt)
          };
        });

        if (this.activeUsersModal && this.activeUsersModal.key === modalKey) {
          this.activeUsersModal = {
            ...this.activeUsersModal,
            users: users.length ? users : this.resolveBranchUsers(item),
            loading: false,
            error: users.length ? '' : 'La API no devolvio usuarios para esta sucursal.'
          };
        }
      } catch (err) {
        console.error('[ventas/lista] loadUsersModal:error', {
          modalKey,
          status: err?.response?.status || null,
          data: err?.response?.data || null,
          message: err?.message || null
        });
        if (this.activeUsersModal && this.activeUsersModal.key === modalKey) {
          const fallbackUsers = this.resolveBranchUsers(item);
          this.activeUsersModal = {
            ...this.activeUsersModal,
            users: fallbackUsers,
            loading: false,
            error: fallbackUsers.length
              ? 'No se pudo consultar la API, se muestran los datos disponibles en el reporte.'
              : (err?.response?.data?.message || 'No se pudo cargar la lista de usuarios de la sucursal.')
          };
        }
      } finally {
        this.load = false;
      }
    },
    async loadIncidentsModal(item) {
      const modalKey = `${item.codigoSucursal ?? 0}-${item.puntoVenta ?? 0}`;
      this.load = true;
      this.activeIncidentsModal = {
        title: item.departamento || item.nombre || 'Sucursal',
        subtitle: `Cód. ${item.codigoSucursal ?? 0} · Punto ${item.puntoVenta ?? 0}`,
        items: [],
        loading: true,
        error: '',
        key: modalKey
      };

      try {
        const response = await this.$admin.$get(
          `ventas/reportes/sucursales/incidencias?codigoSucursal=${encodeURIComponent(item.codigoSucursal ?? 0)}&puntoVenta=${encodeURIComponent(item.puntoVenta ?? 0)}`
        );

        const source = Array.isArray(response?.incidencias)
          ? response.incidencias
          : (Array.isArray(response?.data?.incidencias) ? response.data.incidencias : []);

        if (this.activeIncidentsModal && this.activeIncidentsModal.key === modalKey) {
          this.activeIncidentsModal = {
            ...this.activeIncidentsModal,
            items: source,
            loading: false,
            error: source.length ? '' : 'La API no devolvió incidencias para esta sucursal.'
          };
        }
      } catch (err) {
        if (this.activeIncidentsModal && this.activeIncidentsModal.key === modalKey) {
          this.activeIncidentsModal = {
            ...this.activeIncidentsModal,
            items: [],
            loading: false,
            error: err?.response?.data?.message || 'No se pudo cargar el detalle de incidencias.'
          };
        }
      } finally {
        this.load = false;
      }
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
    formatCurrency(value) {
      const amount = Number(value || 0);
      if (Number.isNaN(amount)) {
        return 'Bs 0,00';
      }

      return `Bs ${amount.toLocaleString('es-BO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    }
  }
};
</script>

<style scoped>
.closure-page {
  padding: 0.35rem 0 1rem;
}

.closure-shell {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hero-card,
.table-card,
.error-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, #ffffff 100%);
  border: 1px solid #e7edf6;
  border-radius: 26px;
  box-shadow: 0 18px 48px rgba(16, 34, 68, 0.07);
}

.hero-card {
  padding: 1rem;
}

.hero-copy h1 {
  margin: 0;
  color: #173163;
  font-size: 1.55rem;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.hero-copy p {
  margin: 0.35rem 0 0;
  color: #6e7f9b;
  font-size: 0.82rem;
}

.toolbar-grid {
  display: grid;
  grid-template-columns: 190px minmax(220px, 1fr) 190px;
  gap: 0.7rem;
  margin-top: 0.95rem;
}

.toolbar-field {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 42px;
  border: 1px solid #dbe4f0;
  border-radius: 12px;
  background: #fff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.toolbar-field i {
  position: absolute;
  left: 0.8rem;
  color: #66758f;
  font-size: 0.82rem;
}

.toolbar-field input,
.toolbar-field select {
  width: 100%;
  height: 42px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: #223658;
  font-size: 0.82rem;
  padding: 0 0.85rem 0 2.2rem;
}

.toolbar-field input:focus,
.toolbar-field select:focus {
  outline: none;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.65rem;
  margin-top: 0.95rem;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.8rem 0.85rem;
  border: 1px solid #e9eef6;
  border-radius: 16px;
  background: #fff;
}

.summary-icon {
  width: 42px;
  height: 42px;
  border-radius: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.92rem;
  flex-shrink: 0;
}

.summary-copy {
  display: flex;
  flex-direction: column;
  gap: 0.22rem;
  min-width: 0;
}

.summary-copy span {
  color: #63738f;
  font-size: 0.68rem;
  font-weight: 800;
}

.summary-copy strong {
  color: #1a3160;
  font-size: 0.94rem;
  font-weight: 900;
}

.summary-card-primary .summary-icon { background: #e8f0ff; color: #2862d4; }
.summary-card-success .summary-icon { background: #e7f8ec; color: #16a34a; }
.summary-card-warning .summary-icon { background: #fff5df; color: #d88b09; }
.summary-card-danger .summary-icon { background: #ffe9e9; color: #e53935; }
.summary-card-neutral .summary-icon { background: #eef1f6; color: #67758d; }
.summary-card-money .summary-icon { background: #ffecee; color: #e53935; }
.summary-card-success strong { color: #1c9a47; }
.summary-card-warning strong { color: #dc8c0d; }
.summary-card-danger strong,
.summary-card-money strong { color: #e53935; }

.progress-panel {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
  gap: 0.7rem;
  margin-top: 0.8rem;
}

.progress-card,
.priority-card {
  border: 1px solid #e7edf6;
  border-radius: 16px;
  background: #fff;
  padding: 0.75rem 0.85rem;
}

.progress-card {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.progress-card-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(180deg, #2f6de8 0%, #295ed0 100%);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.84rem;
  flex-shrink: 0;
}

.progress-card-main {
  flex: 1;
}

.progress-card-copy {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex-wrap: wrap;
  color: #5d6f8c;
  font-size: 0.8rem;
}

.progress-card-copy strong {
  color: #234170;
  font-weight: 800;
}

.progress-track {
  width: 100%;
  height: 7px;
  border-radius: 999px;
  background: #e7edf8;
  overflow: hidden;
  margin-top: 0.6rem;
}

.progress-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #2f6de8 0%, #275ccf 100%);
}

.priority-card {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: #2d59b0;
  background: linear-gradient(180deg, #f8fbff 0%, #f1f6ff 100%);
}

.priority-card i {
  font-size: 0.95rem;
}

.table-card {
  margin-top: 0.9rem;
  padding: 0.8rem;
}

.table-wrap {
  overflow-x: auto;
  border: 1px solid #ecf1f7;
  border-radius: 16px;
}

.closure-table {
  width: 100%;
  min-width: 1320px;
  border-collapse: collapse;
  background: #fff;
}

.closure-table thead th {
  padding: 0.75rem 0.7rem;
  text-align: left;
  color: #465670;
  font-size: 0.68rem;
  font-weight: 800;
  background: linear-gradient(180deg, #ffffff 0%, #fafbfd 100%);
  border-bottom: 1px solid #edf1f7;
}

.closure-table tbody td {
  padding: 0.72rem;
  border-bottom: 1px solid #edf1f7;
  color: #29405e;
  font-size: 0.78rem;
  vertical-align: middle;
}

.closure-table tbody tr:last-child td {
  border-bottom: 0;
}

.row-warning {
  background: linear-gradient(90deg, rgba(255, 243, 214, 0.28) 0%, rgba(255, 255, 255, 0) 55%);
}

.row-danger {
  background: linear-gradient(90deg, rgba(255, 232, 232, 0.34) 0%, rgba(255, 255, 255, 0) 55%);
}

.branch-cell {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.branch-cell-icon {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  background: #edf3ff;
  color: #2a63d7;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 0.78rem;
}

.branch-cell-copy {
  display: flex;
  flex-direction: column;
  gap: 0.16rem;
}

.branch-cell-copy strong {
  color: #1e3565;
  font-size: 0.82rem;
  font-weight: 800;
}

.branch-cell-copy small {
  color: #70809b;
  font-size: 0.66rem;
}

.metric-stack {
  display: flex;
  flex-direction: column;
  gap: 0.16rem;
  min-width: 0;
}

.metric-stack strong {
  color: #1e3565;
  font-size: 0.8rem;
  font-weight: 800;
}

.metric-stack small {
  color: #70809b;
  font-size: 0.66rem;
  line-height: 1.35;
}

.metric-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.28rem;
}

.metric-tag {
  display: inline-flex;
  align-items: center;
  min-height: 20px;
  padding: 0.12rem 0.42rem;
  border-radius: 999px;
  font-size: 0.62rem;
  font-weight: 800;
  line-height: 1.1;
  border: 1px solid transparent;
  white-space: nowrap;
}

.metric-tag-info {
  background: #eaf2ff;
  border-color: #cddfff;
  color: #265fce;
}

.metric-tag-neutral {
  background: #f3f6fb;
  border-color: #dfe7f3;
  color: #60718d;
}

.metric-tag-warning {
  background: #fff6e4;
  border-color: #f6ddb0;
  color: #c98108;
}

.metric-tag-danger {
  background: #ffeded;
  border-color: #f6caca;
  color: #d64040;
}

.incident-trigger {
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.incident-trigger .metric-stack strong {
  text-decoration: underline;
  text-decoration-color: rgba(30, 53, 101, 0.22);
  text-underline-offset: 3px;
}

.incident-trigger:hover .metric-stack strong {
  color: #2a63d7;
}

.code-pill {
  display: inline-flex;
  min-width: 46px;
  justify-content: center;
  padding: 0.28rem 0.45rem;
  border-radius: 999px;
  background: #f1f4fa;
  color: #324663;
  font-weight: 800;
  font-size: 0.72rem;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.62rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 800;
  border: 1px solid transparent;
}

.status-chip-cerrada {
  background: #ebf9ef;
  border-color: #d8f1e0;
  color: #1e8f44;
}

.status-chip-pendiente {
  background: #fff6e3;
  border-color: #f7dfac;
  color: #d18400;
}

.status-chip-diferencia {
  background: #ffe8e8;
  border-color: #f5c0c0;
  color: #de3e3e;
}

.status-chip-sin_ventas {
  background: #eff2f7;
  border-color: #e1e6ef;
  color: #6d778b;
}

.amount-success {
  color: #19a24a;
  font-weight: 800;
}

.amount-danger {
  color: #e53935;
  font-weight: 800;
}

.action-stack {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.3rem;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-width: 122px;
  height: 32px;
  padding: 0 0.75rem;
  border-radius: 10px;
  border: 1px solid transparent;
  font-size: 0.74rem;
  font-weight: 800;
}

.action-btn-primary {
  background: #f5f9ff;
  border-color: #cadbfd;
  color: #2a63d7;
}

.action-btn-warning {
  background: #fff8e8;
  border-color: #f6d58d;
  color: #d38a0a;
}

.action-btn-danger {
  background: #ffeded;
  border-color: #f1b0b0;
  color: #df3a3a;
}

.action-btn-muted {
  background: #f4f6fa;
  border-color: #e3e8f0;
  color: #7a8599;
  cursor: not-allowed;
}

.action-link {
  border: 0;
  background: transparent;
  color: #3766c9;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0;
}

.empty-state {
  padding: 1.4rem 0.8rem;
}

.empty-state h3,
.error-card h3 {
  margin: 0;
  color: #1d3360;
  font-size: 1.1rem;
  font-weight: 800;
}

.empty-state p,
.error-card p {
  margin: 0.45rem 0 0;
  color: #6f7c92;
  font-size: 0.8rem;
}

.error-card {
  margin-top: 1rem;
  padding: 0.8rem;
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
  width: min(760px, 100%);
  max-height: calc(100vh - 3rem);
  overflow: hidden;
  background: #fff;
  border-radius: 20px;
  border: 1px solid #dfe7f2;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.24);
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.detail-modal-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.detail-modal-head h3 {
  margin: 0;
  color: #1d3360;
  font-size: 1.2rem;
  font-weight: 900;
}

.detail-modal-close {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid #dde4ef;
  background: #fff;
  color: #40506f;
}

.detail-kicker {
  margin: 0 0 0.3rem;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #8a94a8;
}

.detail-copy {
  color: #6f7c92;
  font-size: 0.8rem;
}

.users-modal-head-copy {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.users-modal-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin: 0.8rem 0 0.95rem;
}

.users-summary-pill {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 96px;
  padding: 0.68rem 0.8rem;
  border: 1px solid #e5ebf4;
  border-radius: 14px;
  background: linear-gradient(180deg, #fbfcfe 0%, #f6f8fc 100%);
}

.users-summary-pill span {
  font-size: 0.64rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #8490a8;
}

.users-summary-pill strong {
  color: #223658;
  font-size: 0.92rem;
  font-weight: 900;
}

.users-summary-pill-accent {
  background: linear-gradient(180deg, #edf3ff 0%, #e7efff 100%);
  border-color: #d9e4fb;
}

.users-modal-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  overflow-y: auto;
  max-height: min(52vh, 460px);
  padding-right: 0.25rem;
}

.users-modal-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.9rem;
  padding: 0.82rem 0.9rem;
  border: 1px solid #edf1f6;
  border-radius: 14px;
  background: #fdfefe;
}

.users-modal-item-main {
  min-width: 0;
}

.users-modal-item strong {
  display: block;
  color: #223658;
  font-weight: 800;
  line-height: 1.25;
  font-size: 0.82rem;
}

.users-modal-item small {
  display: block;
  color: #6f7c92;
  line-height: 1.35;
  font-size: 0.72rem;
}

.users-modal-item-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.3rem;
  margin-left: auto;
}

.users-modal-item span {
  flex-shrink: 0;
  padding: 0.28rem 0.58rem;
  border-radius: 999px;
  background: #eef2f7;
  color: #52607a;
  font-size: 0.68rem;
  font-weight: 700;
}

.users-modal-item-meta small {
  text-align: right;
  white-space: nowrap;
}

.incidents-modal-card {
  width: min(920px, 100%);
}

.incidents-modal-list {
  max-height: min(62vh, 560px);
}

.incidents-modal-item .users-modal-item-main {
  display: flex;
  flex-direction: column;
  gap: 0.22rem;
}

.incidents-modal-meta {
  gap: 0.2rem;
}

.users-modal-empty {
  padding: 0.9rem 0.4rem 0.4rem;
}

@media (max-width: 1400px) {
  .summary-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1100px) {
  .toolbar-grid,
  .progress-panel {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 991px) {
  .hero-card {
    padding: 1rem;
  }

  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .detail-modal-backdrop {
    padding: 0.9rem;
    align-items: stretch;
  }

  .detail-modal-card {
    width: 100%;
    max-height: calc(100vh - 1.8rem);
    padding: 1rem;
    border-radius: 20px;
  }

  .users-modal-item {
    flex-direction: column;
  }

  .users-modal-item-meta {
    align-items: flex-start;
    margin-left: 0;
    width: 100%;
  }
}

@media (max-width: 640px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .hero-copy h1 {
    font-size: 1.65rem;
  }
}
</style>
