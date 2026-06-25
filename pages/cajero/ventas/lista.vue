<template>
  <div>
    <JcLoader :load="load" />
    <AdminTemplate :page="page" :modulo="modulo">
      <div slot="body" class="branches-page">
        <div class="branches-shell">
          <section class="filters-card">
            <div class="filters-row">
              <label class="search-field">
                <span class="search-icon">
                  <i class="fa fa-search"></i>
                </span>
                <input
                  v-model.trim="filters.q"
                  type="text"
                  placeholder="Buscar sucursal o cajero..."
                />
              </label>

              <div class="filters-divider"></div>

              <label class="select-field">
                <span>Fecha inicio</span>
                <input
                  v-model="filters.fechaInicio"
                  type="date"
                />
              </label>

              <label class="select-field">
                <span>Fecha fin</span>
                <input
                  v-model="filters.fechaFin"
                  type="date"
                />
              </label>

              <label class="select-field">
                <span>Código sucursal</span>
                <input
                  v-model="filters.codigoSucursal"
                  type="number"
                  min="0"
                  placeholder="Todos los códigos"
                />
              </label>

              <label class="select-field">
                <span>Punto de venta</span>
                <input
                  v-model="filters.puntoVenta"
                  type="number"
                  min="0"
                  placeholder="Todos los puntos"
                />
              </label>

              <button class="btn-clean" type="button" @click="resetFilters">
                <i class="fa fa-sliders"></i>
                <span>Limpiar filtros</span>
              </button>

              <button class="btn-clean btn-export" type="button" @click="downloadKardexPdf">
                <i class="fa fa-file-pdf-o"></i>
                <span>Exportar PDF</span>
              </button>
            </div>
          </section>

          <section v-if="error" class="error-card">
            <h3>No se pudo cargar el reporte</h3>
            <p>{{ error }}</p>
          </section>

          <section v-else class="table-card enterprise-table-card">
            <div class="table-head">
              <div>
                <p class="table-kicker">Reporte consolidado</p>
                <h2>Sucursales registradas</h2>
              </div>
            </div>

            <div v-if="!report.sucursales.length" class="empty-state">
              <h3>Sin resultados</h3>
              <p>No encontramos sucursales con esos filtros.</p>
            </div>

            <div v-else class="table-wrap enterprise-table-wrap">
              <table class="branches-table enterprise-table">
                <thead>
                  <tr>
                    <th>
                      <span class="head-label">
                        <i class="fa fa-building-o"></i>
                        <span>Código Sucursal</span>
                      </span>
                    </th>
                    <th>
                      <span class="head-label">
                        <i class="fa fa-dot-circle-o"></i>
                        <span>Punto Venta</span>
                      </span>
                    </th>
                    <th>
                      <span class="head-label">
                        <i class="fa fa-map-marker"></i>
                        <span>Sucursal</span>
                      </span>
                    </th>
                    <th>
                      <span class="head-label">
                        <i class="fa fa-users"></i>
                        <span>Cajeros</span>
                      </span>
                    </th>
                    <th>
                      <span class="head-label">
                        <i class="fa fa-money"></i>
                        <span>Total vendido</span>
                      </span>
                    </th>
                    <th>
                      <span class="head-label">
                        <i class="fa fa-clock-o"></i>
                        <span>Última venta</span>
                      </span>
                    </th>
                    <th>
                      <span class="head-label">
                        <i class="fa fa-eye"></i>
                        <span>Acciones</span>
                      </span>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="item in report.sucursales" :key="item.id">
                    <td>
                      <strong class="code-display">{{ item.codigoSucursal ?? 0 }}</strong>
                    </td>

                    <td>
                      <strong class="code-display">{{ item.puntoVenta ?? 0 }}</strong>
                    </td>

                    <td>
                      <div class="branch-main">
                        <strong>{{ item.departamento || 'Sin departamento' }}</strong>
                      </div>
                    </td>

                    <td>
                      <div class="manager-cell">
                        <strong>{{ item.cajerosUnicos }} usuario(s)</strong>
                      </div>
                    </td>

                    <td>
                      <strong class="amount-text">{{ formatCurrency(item.totalVendido) }}</strong>
                    </td>

                    <td>
                      <div class="schedule-cell">
                        <strong>{{ formatDate(item.ultimaVenta) }}</strong>
                      </div>
                    </td>

                    <td>
                      <button class="action-view-btn" type="button" @click="goToSucursal(item)">
                        <i class="fa fa-eye"></i>
                        <span>Ver</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
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
      }
    };
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
    'filters.fechaInicio'() {
      this.scheduleLoadReport();
    },
    'filters.fechaFin'() {
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
        const response = await this.$admin.$get(path);

        this.report = {
          resumen: response && response.resumen ? response.resumen : this.report.resumen,
          sucursales: response && response.sucursales ? response.sucursales : []
        };
      } catch (err) {
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

      this.filters = {
        fechaInicio: '',
        fechaFin: '',
        codigoSucursal: '',
        puntoVenta: '',
        q: '',
        limite: 50
      };

      this.loadReport();
    },
    goToSucursal(item) {
      this.$router.push({
        path: '/cajero/ventas/sucursal',
        query: {
          fechaInicio: this.filters.fechaInicio || '',
          fechaFin: this.filters.fechaFin || '',
          codigoSucursal: item.codigoSucursal ?? '',
          puntoVenta: item.puntoVenta ?? '',
          nombre: item.nombre || '',
          departamento: item.departamento || ''
        }
      });
    },
    async downloadKardexPdf() {
      this.load = true;

      try {
        const params = {};
        Object.keys(this.filters).forEach((key) => {
          const value = this.filters[key];
          if (value !== '' && value !== null && value !== undefined) {
            params[key] = value;
          }
        });

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
.branches-page {
  padding: 0.25rem 0 1rem;
}

.branches-shell {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.filters-card,
.table-card,
.error-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.99) 0%, #ffffff 100%);
  border: 1px solid #e8edf5;
  border-radius: 22px;
  box-shadow: 0 10px 28px rgba(22, 42, 77, 0.06);
}

.filters-card {
  padding: 0.95rem 1.1rem;
}

.filters-row {
  display: grid;
  grid-template-columns: minmax(280px, 2fr) 1px repeat(4, minmax(150px, 1fr)) auto;
  gap: 1rem;
  align-items: end;
}

.filters-divider {
  width: 1px;
  height: 52px;
  align-self: center;
  background: linear-gradient(180deg, transparent 0%, #dfe6f0 18%, #dfe6f0 82%, transparent 100%);
}

.search-field,
.select-field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.select-field span {
  font-size: 0.78rem;
  font-weight: 700;
  color: #4c5568;
}

.search-field {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 0.95rem;
  top: 50%;
  transform: translateY(-50%);
  color: #7b879b;
  font-size: 1rem;
}

.search-field input,
.select-field input {
  height: 54px;
  border-radius: 12px;
  border: 1px solid #dde4ef;
  background: #fff;
  color: #24324a;
  font-size: 0.95rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-field input {
  padding: 0 1rem 0 2.45rem;
}

.select-field input {
  padding: 0 0.95rem;
}

.search-field input:focus,
.select-field input:focus {
  outline: none;
  border-color: #b9c8e5;
  box-shadow: 0 0 0 4px rgba(45, 99, 200, 0.08);
}

.btn-clean {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  height: 46px;
  padding: 0 1rem;
  border-radius: 12px;
  border: 1px solid #e4e9f2;
  background: #fff;
  color: #4a566c;
  font-weight: 700;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.btn-clean:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(27, 52, 92, 0.08);
}

.btn-export {
  border-color: #f3d0d6;
  color: #b42318;
}

.btn-export:hover {
  background: #fff6f6;
}

.table-card,
.error-card {
  padding: 1rem;
}

.table-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.table-kicker {
  margin: 0 0 0.25rem;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #8a94a8;
}

.table-head h2,
.empty-state h3,
.error-card h3 {
  margin: 0;
  color: #1d3360;
  font-size: 1.7rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.table-wrap {
  overflow-x: auto;
  border: 1px solid #edf1f6;
  border-radius: 16px;
}

.branches-table {
  width: 100%;
  min-width: 1080px;
  border-collapse: collapse;
  background: #fff;
}

.branches-table thead th {
  padding: 0.95rem 0.9rem;
  text-align: left;
  font-size: 0.83rem;
  font-weight: 700;
  color: #495468;
  background: linear-gradient(180deg, #ffffff 0%, #fafbfd 100%);
  border-bottom: 1px solid #edf1f6;
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

.branches-table tbody td {
  padding: 1rem 0.9rem;
  border-bottom: 1px solid #edf1f6;
  color: #33415c;
  vertical-align: middle;
}

.branches-table tbody tr:last-child td {
  border-bottom: 0;
}

.branch-main,
.manager-cell,
.schedule-cell {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.branch-main strong,
.manager-cell strong,
.schedule-cell strong,
.amount-text,
.code-display {
  color: #223658;
  font-weight: 700;
}

.code-display {
  font-size: 1.05rem;
  letter-spacing: 0.02em;
}

.amount-text {
  font-size: 1.15rem;
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

.empty-state {
  padding: 1.8rem 1rem;
}

.empty-state p,
.error-card p {
  margin: 0.45rem 0 0;
  color: #6f7c92;
}

@media (max-width: 1280px) {
  .filters-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .btn-clean {
    grid-column: span 2;
  }
}

@media (max-width: 991px) {
  .filters-row {
    grid-template-columns: 1fr;
  }

  .filters-divider {
    display: none;
  }

  .btn-clean {
    width: 100%;
  }

  .table-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
