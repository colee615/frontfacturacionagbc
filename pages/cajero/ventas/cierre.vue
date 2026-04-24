<template>
  <div>
    <JcLoader :load="load" />
    <AdminTemplate :page="page" :modulo="modulo">
      <div slot="body" class="cierre-wrap">
        <div class="cierre-header d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
          <div>
            <h1 class="mb-1">Cierre diario</h1>
            <p class="text-muted mb-0">Consolidado para responsable con ventas del dia por cajero y por sucursal.</p>
          </div>
          <div class="cierre-header-badges mt-3 mt-lg-0">
            <span class="cierre-mini-badge">Fecha: {{ filters.fecha || '-' }}</span>
            <span class="cierre-mini-badge cierre-mini-badge--success">Cajeros: {{ numberFormat(kardexResumen.usuarios) }}</span>
            <span class="cierre-mini-badge cierre-mini-badge--warning">Ventas: {{ numberFormat(kardexResumen.ventas) }}</span>
          </div>
        </div>

        <div class="card cierre-panel mb-4">
          <div class="card-header cierre-panel__header">
            <div>
              <strong>Filtros de consolidado</strong>
              <div class="text-muted small">Define la fecha de corte y estado para preparar el reporte operativo.</div>
            </div>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-xl-3 col-lg-4 col-md-6 mb-3">
                <label class="cierre-label">Fecha</label>
                <input v-model="filters.fecha" type="date" class="form-control cierre-control" @change="fetchReporte">
              </div>
              <div class="col-xl-3 col-lg-4 col-md-6 mb-3">
                <label class="cierre-label">Estado emision</label>
                <select v-model="filters.estado_emision" class="form-control cierre-control" @change="fetchReporte">
                  <option value="all">Todos</option>
                  <option value="PROCESADA">Facturada</option>
                  <option value="RECEPCIONADA">Pendiente</option>
                  <option value="CONTINGENCIA_CREADA">Contingencia</option>
                  <option value="OBSERVADA">Observada</option>
                </select>
              </div>
            </div>

            <div class="d-flex flex-wrap">
              <button class="btn btn-outline-primary mr-2 mb-2" @click="fetchReporte" :disabled="load">
                <i class="fas fa-sync-alt mr-1"></i> Actualizar
              </button>
              <button class="btn btn-outline-secondary mb-2" @click="resetFilters">
                <i class="fas fa-undo mr-1"></i> Reiniciar
              </button>
            </div>
          </div>
        </div>

        <div class="cierre-summary-grid">
          <div class="cierre-stat-card">
            <div class="cierre-stat-card__label">Total vendido</div>
            <div class="cierre-stat-card__value">Bs {{ money(kardexResumen.totalVendido) }}</div>
            <div class="cierre-stat-card__meta">Suma consolidada del dia seleccionado</div>
          </div>
          <div class="cierre-stat-card">
            <div class="cierre-stat-card__label">Facturadas</div>
            <div class="cierre-stat-card__value">{{ numberFormat(kardexResumen.facturadas) }}</div>
            <div class="cierre-stat-card__meta">Emisiones con comprobante confirmado</div>
          </div>
          <div class="cierre-stat-card">
            <div class="cierre-stat-card__label">Pendientes</div>
            <div class="cierre-stat-card__value">{{ numberFormat(kardexResumen.pendientes) }}</div>
            <div class="cierre-stat-card__meta">Emisiones en proceso o contingencia</div>
          </div>
          <div class="cierre-stat-card">
            <div class="cierre-stat-card__label">Observadas</div>
            <div class="cierre-stat-card__value">{{ numberFormat(kardexResumen.observadas) }}</div>
            <div class="cierre-stat-card__meta">Requieren revision antes de cierre</div>
          </div>
        </div>

        <div class="card cierre-panel mb-4">
          <div class="card-header cierre-panel__header d-flex justify-content-between align-items-center">
            <div>
              <strong>Ventas por cajero</strong>
              <div class="text-muted small">Base para remision interna al cargo responsable.</div>
            </div>
            <span class="cierre-table-count">{{ cajeros.length }} cajeros</span>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table cierre-table mb-0">
                <thead>
                  <tr>
                    <th>Cajero</th>
                    <th class="text-center">Ventas</th>
                    <th class="text-center">Facturadas</th>
                    <th class="text-center">Pendientes</th>
                    <th class="text-center">Observadas</th>
                    <th class="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in cajeros" :key="row.usuarioId">
                    <td>
                      <div class="cierre-table__primary">{{ row.usuarioNombre || 'SIN USUARIO' }}</div>
                      <div class="cierre-table__secondary">ID: {{ row.usuarioId || 'N/A' }}</div>
                    </td>
                    <td class="text-center">{{ numberFormat(row.cantidadVentas) }}</td>
                    <td class="text-center">{{ numberFormat(row.facturadas) }}</td>
                    <td class="text-center">{{ numberFormat(row.pendientes) }}</td>
                    <td class="text-center">{{ numberFormat(row.observadas) }}</td>
                    <td class="text-right"><strong>Bs {{ money(row.totalVendido) }}</strong></td>
                  </tr>
                  <tr v-if="!cajeros.length">
                    <td colspan="6" class="text-center py-4 text-muted">No hay ventas para los filtros seleccionados.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="card cierre-panel">
          <div class="card-header cierre-panel__header d-flex justify-content-between align-items-center">
            <div>
              <strong>Reporte por sucursal</strong>
              <div class="text-muted small">Consolidado final para control por oficina y punto de venta.</div>
            </div>
            <span class="cierre-table-count">{{ sucursales.length }} sucursales</span>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table cierre-table mb-0">
                <thead>
                  <tr>
                    <th>Sucursal</th>
                    <th class="text-center">Punto venta</th>
                    <th class="text-center">Cantidad</th>
                    <th class="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in sucursales" :key="`${row.codigoSucursal}-${row.puntoVenta}`">
                    <td>
                      <div class="cierre-table__primary">Sucursal {{ row.codigoSucursal }}</div>
                    </td>
                    <td class="text-center">{{ row.puntoVenta }}</td>
                    <td class="text-center">{{ numberFormat(row.cantidad) }}</td>
                    <td class="text-right"><strong>Bs {{ money(row.total) }}</strong></td>
                  </tr>
                  <tr v-if="!sucursales.length">
                    <td colspan="4" class="text-center py-4 text-muted">No hay consolidado por sucursal para este cierre.</td>
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
  head() {
    return { title: this.modulo };
  },
  data() {
    return {
      load: true,
      page: 'Ventas',
      modulo: 'Cierre diario',
      filters: {
        fecha: '2026-04-20',
        estado_emision: 'all',
      },
      kardexResumen: {
        usuarios: 0,
        ventas: 0,
        totalVendido: 0,
        facturadas: 0,
        pendientes: 0,
        observadas: 0,
      },
      cajeros: [],
      sucursales: [],
    };
  },
  methods: {
    async fetchReporte() {
      if (!this.filters.fecha) return;
      this.load = true;
      try {
        const params = {
          fechaInicio: this.filters.fecha,
          fechaFin: this.filters.fecha,
          estado_sufe: this.filters.estado_emision !== 'all' ? this.filters.estado_emision : undefined,
          limite: 500,
        };

        const [kardexResp, resumenResp] = await Promise.all([
          this.$admin.$get('ventas/reportes/kardex-usuarios', { params }),
          this.$admin.$get('ventas/reportes/resumen', { params }),
        ]);

        const kardexResumen = kardexResp?.resumen || {};
        this.kardexResumen = {
          usuarios: Number(kardexResumen.usuarios || 0),
          ventas: Number(kardexResumen.ventas || 0),
          totalVendido: Number(kardexResumen.totalVendido || 0),
          facturadas: Number(kardexResumen.facturadas || 0),
          pendientes: Number(kardexResumen.pendientes || 0),
          observadas: Number(kardexResumen.observadas || 0),
        };

        this.cajeros = Array.isArray(kardexResp?.usuarios) ? kardexResp.usuarios : [];
        this.sucursales = Array.isArray(resumenResp?.porSucursal) ? resumenResp.porSucursal : [];
      } catch (error) {
        const msg = error?.response?.data?.message || 'No se pudo cargar el cierre diario.';
        this.$swal.fire('Error', msg, 'error');
      } finally {
        this.load = false;
      }
    },

    resetFilters() {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      this.filters = {
        fecha: `${yyyy}-${mm}-${dd}`,
        estado_emision: 'all',
      };
      this.fetchReporte();
    },

    money(value) {
      const n = Number(value || 0);
      return Number.isFinite(n) ? n.toFixed(2) : '0.00';
    },

    numberFormat(value) {
      const n = Number(value || 0);
      return Number.isFinite(n) ? n.toLocaleString('es-BO') : '0';
    },
  },
  mounted() {
    this.resetFilters();
  },
};
</script>

<style scoped>
.cierre-wrap {
  padding-bottom: 1rem;
}

.cierre-header {
  gap: 1rem;
  margin-bottom: 1rem;
}

.cierre-header h1 {
  font-weight: 700;
  color: #173b73;
}

.cierre-header-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.cierre-mini-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  background: rgba(254, 204, 54, 0.18);
  color: #173b73;
  font-size: 0.82rem;
  font-weight: 700;
}

.cierre-mini-badge--success {
  background: rgba(40, 167, 69, 0.14);
  color: #1f7a35;
}

.cierre-mini-badge--warning {
  background: rgba(255, 193, 7, 0.18);
  color: #9a6b00;
}

.cierre-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.cierre-stat-card {
  border: 1px solid rgba(32, 83, 154, 0.12);
  border-top: 4px solid #fecc36;
  border-radius: 12px;
  padding: 1rem 1.05rem;
  box-shadow: 0 8px 24px rgba(16, 43, 84, 0.06);
  min-height: 130px;
  background: #fff;
}

.cierre-stat-card__label {
  color: #5f7290;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  margin-bottom: 0.65rem;
}

.cierre-stat-card__value {
  color: #173b73;
  font-size: 1.8rem;
  line-height: 1;
  font-weight: 800;
  margin-bottom: 0.7rem;
}

.cierre-stat-card__meta {
  color: #74839b;
  font-size: 0.82rem;
  line-height: 1.35;
}

.cierre-panel {
  border: 1px solid rgba(32, 83, 154, 0.12);
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(16, 43, 84, 0.05);
  overflow: hidden;
}

.cierre-panel__header {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-bottom: 1px solid rgba(32, 83, 154, 0.1);
  padding: 1rem 1.25rem;
}

.cierre-label {
  color: #294b7c;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.cierre-control {
  min-height: 44px;
  border-radius: 10px;
  border-color: rgba(32, 83, 154, 0.18);
  box-shadow: none;
}

.cierre-control:focus {
  border-color: rgba(32, 83, 154, 0.42);
  box-shadow: 0 0 0 0.18rem rgba(32, 83, 154, 0.09);
}

.cierre-table-count {
  color: #6f819d;
  font-size: 0.86rem;
  font-weight: 600;
}

.cierre-table thead th {
  background: #f7f9fc;
  border-bottom: 1px solid rgba(32, 83, 154, 0.1);
  color: #38557f;
  font-size: 0.79rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  white-space: nowrap;
}

.cierre-table td {
  vertical-align: top;
  border-top: 1px solid rgba(32, 83, 154, 0.08);
  padding-top: 0.9rem;
  padding-bottom: 0.9rem;
}

.cierre-table__primary {
  color: #173b73;
  font-weight: 700;
}

.cierre-table__secondary {
  color: #74839b;
  font-size: 0.83rem;
  margin-top: 0.25rem;
}

@media (max-width: 991.98px) {
  .cierre-summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767.98px) {
  .cierre-summary-grid {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
</style>
