<template>
  <div>
    <JcLoader :load="load" />
    <AdminTemplate :page="page" :modulo="modulo">
      <div slot="body" class="service-report-page">
        <div class="service-report-shell">
          <section class="service-hero-card">
            <BasePageHeading title="Ventas por servicio" icon="layers" eyebrow="Reportes y control" description="Consulta cantidades e importes consolidados de cada servicio." />

            <div class="service-toolbar">
              <label class="service-field service-field-search">
                <span>Buscar servicio</span>
                <input v-model.trim="searchTerm" type="text" placeholder="Courier, contratos, express..." />
              </label>

              <label class="service-field">
                <span>Máximo de filas</span>
                <select v-model.number="filters.limite">
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                  <option :value="200">200</option>
                  <option :value="500">500</option>
                </select>
              </label>

              <div class="service-toolbar-actions">
                <button type="button" class="service-btn service-btn-primary" @click="loadReport">
                  <i class="fas fa-sync-alt"></i>
                  <span>Actualizar</span>
                </button>
                <button type="button" class="service-btn service-btn-secondary" @click="clearSearch">
                  <i class="fas fa-eraser"></i>
                  <span>Limpiar</span>
                </button>
              </div>
            </div>

            <section v-if="error" class="service-error-card">
              <h3>No se pudo cargar el reporte</h3>
              <p>{{ error }}</p>
            </section>

            <template v-else>
              <div class="service-summary-grid">
                <article class="service-summary-card">
                  <span>Servicios</span>
                  <strong>{{ summary.cantidadServicios }}</strong>
                </article>
                <article class="service-summary-card">
                  <span>Ventas</span>
                  <strong>{{ summary.cantidadVentas }}</strong>
                </article>
                <article class="service-summary-card">
                  <span>Detalles</span>
                  <strong>{{ summary.cantidadDetalles }}</strong>
                </article>
                <article class="service-summary-card">
                  <span>Cantidad</span>
                  <strong>{{ formatNumber(summary.totalCantidad) }}</strong>
                </article>
                <article class="service-summary-card service-summary-card-money">
                  <span>Total</span>
                  <strong>{{ formatCurrency(summary.totalMonto) }}</strong>
                </article>
              </div>

              <section class="service-table-card">
                <div class="service-table-head">
                  <div>
                    <h3>Detalle agrupado</h3>
                    <p>{{ filteredServices.length }} resultado(s) visibles</p>
                  </div>
                </div>

                <div v-if="!filteredServices.length" class="service-empty-state">
                  <h3>Sin resultados</h3>
                  <p>No encontramos servicios para la fecha o el texto buscado.</p>
                </div>

                <div v-else class="service-table-wrap">
                  <table class="service-table">
                    <thead>
                      <tr>
                        <th>Servicio agrupado</th>
                        <th>Total</th>
                        <th>Cantidad</th>
                        <th>Ventas</th>
                        <th>Detalles</th>
                        <th>Ultima venta</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in filteredServices" :key="item.servicio">
                        <td>
                          <button type="button" class="service-name-cell service-name-button" @click="openServiceModal(item)">
                            <strong>{{ item.servicio }}</strong>
                            <small v-if="item.descripcionMuestra">{{ item.descripcionMuestra }}</small>
                          </button>
                        </td>
                        <td class="service-amount">{{ formatCurrency(item.totalMonto) }}</td>
                        <td>{{ formatNumber(item.totalCantidad) }}</td>
                        <td>{{ item.cantidadVentas }}</td>
                        <td>{{ item.cantidadDetalles }}</td>
                        <td>{{ formatDateTime(item.ultimaFecha) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <div v-if="activeService" class="service-modal-backdrop" @click.self="closeServiceModal">
                <div class="service-modal-card">
                  <div class="service-table-head">
                    <div>
                      <h3>{{ activeService.servicio }}</h3>
                      <p>{{ activeService.cantidadDetalles }} detalle(s) dentro del grupo.</p>
                    </div>
                    <button type="button" class="service-btn service-btn-secondary" @click="closeServiceModal">
                      Cerrar
                    </button>
                  </div>

                  <div class="service-table-wrap">
                    <table class="service-table">
                      <thead>
                        <tr>
                          <th>Venta ID</th>
                          <th>Detalle ID</th>
                          <th>Descripción</th>
                          <th>Orden</th>
                          <th>Seguimiento</th>
                          <th>Total</th>
                          <th>Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-if="serviceDetailLoading">
                          <td colspan="7">Cargando detalle del servicio...</td>
                        </tr>
                        <tr v-else-if="!(activeService.rows || []).length">
                          <td colspan="7">No hay ventas para este servicio con los filtros actuales.</td>
                        </tr>
                        <tr v-for="(row, index) in activeService.rows" :key="`${row.ventaId || 'sin-venta'}-${row.detalleId || index}`">
                          <td>{{ row.ventaId || '-' }}</td>
                          <td>{{ row.detalleId || '-' }}</td>
                          <td>{{ row.descripcion || '-' }}</td>
                          <td>{{ row.codigoOrden || '-' }}</td>
                          <td>{{ row.codigoSeguimiento || '-' }}</td>
                          <td class="service-amount">{{ formatCurrency(row.totalLinea) }}</td>
                          <td>{{ formatDateTime(row.fecha) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </template>
          </section>
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
      error: '',
      modulo: 'Kardex',
      page: 'Ventas por servicio',
      searchTerm: '',
      filters: {
        limite: 200
      },
      activeService: null,
      serviceDetailLoading: false,
      report: {
        resumen: {
          cantidadServicios: 0,
          cantidadVentas: 0,
          cantidadDetalles: 0,
          totalCantidad: 0,
          totalMonto: 0
        },
        servicios: []
      }
    };
  },
  computed: {
    summary() {
      return this.report?.resumen || {};
    },
    filteredServices() {
      const term = this.normalizeText(this.searchTerm);
      const rows = Array.isArray(this.report?.servicios) ? this.report.servicios : [];

      if (!term) {
        return rows;
      }

      return rows.filter((item) => {
        const haystack = [
          item?.servicio,
          item?.descripcionMuestra,
          ...(Array.isArray(item?.descripciones) ? item.descripciones : [])
        ]
          .map((value) => this.normalizeText(value))
          .join(' ');

        return haystack.includes(term);
      });
    }
  },
  mounted() {
    this.loadReport();
  },
  methods: {
    normalizeText(value) {
      return String(value || '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('es-BO', {
        style: 'currency',
        currency: 'BOB',
        minimumFractionDigits: 2
      }).format(Number(value || 0));
    },
    formatNumber(value) {
      return new Intl.NumberFormat('es-BO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(Number(value || 0));
    },
    formatDateTime(value) {
      if (!value) {
        return '-';
      }

      const safeValue = String(value).replace(' ', 'T');
      const date = new Date(safeValue);
      if (Number.isNaN(date.getTime())) {
        return value;
      }

      return new Intl.DateTimeFormat('es-BO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    },
    clearSearch() {
      this.searchTerm = '';
    },
    async openServiceModal(item) {
      if (!item?.servicio) {
        this.activeService = item || null;
        return;
      }

      this.activeService = {
        ...(item || {}),
        rows: []
      };
      this.serviceDetailLoading = true;

      try {
        const params = new URLSearchParams();
        params.append('servicio', String(item.servicio));
        const response = await this.$admin.$get(`ventas/reportes/servicios/detalle?${params.toString()}`);
        this.activeService = response?.servicio
          ? { ...(item || {}), ...(response.servicio || {}) }
          : { ...(item || {}), rows: [] };
      } catch (err) {
        this.activeService = {
          ...(item || {}),
          rows: []
        };
        this.error = err?.response?.data?.message || 'No se pudo consultar el detalle del servicio.';
      } finally {
        this.serviceDetailLoading = false;
      }
    },
    closeServiceModal() {
      this.activeService = null;
      this.serviceDetailLoading = false;
    },
    async loadReport() {
      this.load = true;
      this.error = '';

      try {
        const params = new URLSearchParams();
        params.append('limite', String(Number(this.filters.limite || 200)));

        const response = await this.$admin.$get(`ventas/reportes/servicios?${params.toString()}`);
        this.report = {
          resumen: response?.resumen || this.report.resumen,
          servicios: Array.isArray(response?.servicios) ? response.servicios : []
        };
      } catch (err) {
        this.error = err?.response?.data?.message || 'No se pudo consultar el consolidado por servicio.';
      } finally {
        this.load = false;
      }
    }
  }
};
</script>

<style scoped>
.service-report-page {
  padding: 1rem 0 1.6rem;
}

.service-report-shell {
  width: 100%;
}

.service-hero-card {
  padding: 1.1rem;
  border-radius: 28px;
  background: linear-gradient(180deg, #fcfdff 0%, #f6f9ff 100%);
  border: 1px solid #dfe7f4;
  box-shadow: 0 22px 50px rgba(29, 51, 96, 0.08);
}

.service-kicker {
  margin: 0 0 0.35rem;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #7d8ca4;
}

.service-hero-copy h1 {
  margin: 0;
  color: #1c3563;
  font-size: 1.9rem;
  font-weight: 900;
}

.service-hero-copy p {
  margin: 0.5rem 0 0;
  color: #67778f;
  max-width: 780px;
}

.service-toolbar {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: minmax(280px, 1.3fr) minmax(180px, 220px) auto;
  gap: 0.8rem;
  align-items: end;
}

.service-field {
  display: flex;
  flex-direction: column;
  gap: 0.38rem;
}

.service-field span {
  color: #60718d;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.service-field input,
.service-field select {
  height: 44px;
  border-radius: 14px;
  border: 1px solid #d9e3f2;
  padding: 0 0.9rem;
  background: #fff;
  color: #243a68;
}

.service-field-search {
  min-width: 0;
}

.service-toolbar-actions {
  display: flex;
  gap: 0.55rem;
}

.service-btn {
  height: 44px;
  padding: 0 1rem;
  border-radius: 14px;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.8rem;
  font-weight: 800;
}

.service-btn-primary {
  background: #2e63d5;
  color: #fff;
  box-shadow: 0 16px 30px rgba(46, 99, 213, 0.2);
}

.service-btn-secondary {
  background: #fff;
  border-color: #d8e2f1;
  color: #37517f;
}

.service-error-card,
.service-table-card {
  margin-top: 1rem;
  padding: 0.95rem;
  border-radius: 22px;
  border: 1px solid #e4ebf6;
  background: #fff;
}

.service-summary-grid {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.8rem;
}

.service-summary-card {
  padding: 0.9rem 1rem;
  border-radius: 18px;
  border: 1px solid #e3ebf7;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.service-summary-card span {
  color: #77859b;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.service-summary-card strong {
  color: #173262;
  font-size: 1.15rem;
  font-weight: 900;
}

.service-summary-card-money {
  background: linear-gradient(180deg, #eef7f1 0%, #ffffff 100%);
}

.service-table-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.8rem;
}

.service-table-head h3,
.service-empty-state h3,
.service-error-card h3 {
  margin: 0;
  color: #1d3360;
  font-size: 1.05rem;
  font-weight: 900;
}

.service-table-head p,
.service-empty-state p,
.service-error-card p {
  margin: 0.35rem 0 0;
  color: #6f7c92;
  font-size: 0.8rem;
}

.service-table-wrap {
  overflow-x: auto;
  border: 1px solid #edf1f7;
  border-radius: 18px;
}

.service-table {
  width: 100%;
  min-width: 980px;
  border-collapse: collapse;
}

.service-table thead th {
  padding: 0.8rem;
  text-align: left;
  color: #49607f;
  font-size: 0.68rem;
  font-weight: 800;
  background: #f9fbfe;
  border-bottom: 1px solid #edf1f7;
}

.service-table tbody td {
  padding: 0.82rem 0.8rem;
  border-bottom: 1px solid #edf1f7;
  color: #2b4161;
  font-size: 0.78rem;
  vertical-align: top;
}

.service-table tbody tr:last-child td {
  border-bottom: 0;
}

.service-name-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.service-name-button {
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.service-name-cell strong {
  color: #173262;
  font-size: 0.82rem;
}

.service-name-cell small {
  color: #73839b;
  line-height: 1.35;
}

.service-amount {
  color: #16914a;
  font-weight: 900;
}

.service-empty-state {
  padding: 0.75rem 0.2rem 0.2rem;
}

.service-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1400;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.2rem;
  background: rgba(15, 23, 42, 0.42);
}

.service-modal-card {
  width: min(1180px, 100%);
  max-height: 88vh;
  overflow: auto;
  padding: 1rem;
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid #dfe7f4;
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.24);
}

@media (max-width: 1100px) {
  .service-toolbar,
  .service-summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .service-hero-card {
    padding: 0.95rem;
  }

  .service-toolbar,
  .service-summary-grid {
    grid-template-columns: 1fr;
  }

  .service-toolbar-actions {
    flex-direction: column;
  }

  .service-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
