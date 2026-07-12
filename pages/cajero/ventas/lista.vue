<template>
  <div>
    <JcLoader :load="load" />
    <AdminTemplate :page="page" :modulo="modulo">
      <div slot="body" class="branches-page">
        <div class="branches-shell">
          <section class="filters-card">
            <div class="filters-copy">
              <div>
                <p class="table-kicker">Panel de reportes</p>
                <h2 class="filters-title">Sucursales y kardex por cajero</h2>
                <p class="filters-subtitle">
                  Revisa el consolidado por sucursal y entra al detalle para ver el kardex por usuario.
                </p>
              </div>
            </div>

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
                <p class="table-subtitle">
                  Selecciona una sucursal para entrar al kardex detallado y revisar el historial por facturador.
                </p>
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
                      <div class="branch-main">
                        <strong>{{ item.departamento || 'Sin departamento' }}</strong>
                        <small>Sucursal {{ item.codigoSucursal ?? 0 }} · Punto {{ item.puntoVenta ?? 0 }}</small>
                      </div>
                    </td>

                    <td>
                      <button class="manager-cell manager-cell-btn" type="button" @click="loadUsersModal(item)">
                        <strong>{{ item.cajerosUnicos }} usuario(s)</strong>
                        <small>Ver usuarios</small>
                      </button>
                    </td>

                    <td>
                      <div class="schedule-cell">
                        <strong>{{ formatDate(item.ultimaVenta) }}</strong>
                      </div>
                    </td>

                    <td>
                      <button class="action-view-btn" type="button" @click="goToSucursal(item)">
                        <i class="fa fa-eye"></i>
                        <span>Ver kardex</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
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
      activeUsersModal: null
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
          codigoSucursal: item.codigoSucursal ?? '',
          puntoVenta: item.puntoVenta ?? '',
          nombre: item.nombre || '',
          departamento: item.departamento || ''
        }
      });
    },
    openUsersModal(item) {
      this.activeUsersModal = {
        title: item.departamento || item.nombre || 'Sucursal',
        subtitle: `Cód. ${item.codigoSucursal ?? 0} · Punto ${item.puntoVenta ?? 0}`,
        codigoSucursal: item.codigoSucursal ?? 0,
        puntoVenta: item.puntoVenta ?? 0,
        users: this.resolveBranchUsers(item)
      };
    },
    closeUsersModal() {
      this.activeUsersModal = null;
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
      this.activeUsersModal = {
        title: item.departamento || item.nombre || 'Sucursal',
      
        users: this.resolveBranchUsers(item),
        loading: true,
        error: '',
        key: modalKey
      };

      try {
        const response = await this.$admin.$get(
          `ventas/reportes/sucursales/usuarios?codigoSucursal=${encodeURIComponent(item.codigoSucursal ?? 0)}&puntoVenta=${encodeURIComponent(item.puntoVenta ?? 0)}`
        );
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
            error: users.length ? '' : 'La API no devolvió usuarios para esta sucursal.'
          };
        }
      } catch (err) {
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
        return 'Bs 0.00';
      }

      return `Bs ${amount.toFixed(2)}`;
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

.filters-copy {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.filters-title {
  margin: 0;
  color: #1d3360;
  font-size: 1.55rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.filters-subtitle,
.table-subtitle {
  margin: 0.35rem 0 0;
  color: #66748d;
  font-size: 0.84rem;
  line-height: 1.45;
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
  grid-template-columns: minmax(280px, 2fr) 1px repeat(2, minmax(150px, 1fr)) auto;
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
  font-size: 1.38rem;
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
  padding: 0.78rem 0.8rem;
  text-align: left;
  font-size: 0.73rem;
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
  font-size: 0.82rem;
}

.branches-table tbody td {
  padding: 0.78rem 0.8rem;
  border-bottom: 1px solid #edf1f6;
  color: #33415c;
  vertical-align: middle;
  font-size: 0.84rem;
}

.branches-table tbody tr:last-child td {
  border-bottom: 0;
}

.branch-main,
.manager-cell,
.schedule-cell {
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
}

.branch-main small {
  color: #6f7c92;
  font-size: 0.71rem;
}

.manager-cell-btn {
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.manager-cell-btn small {
  color: #6f7c92;
  font-size: 0.7rem;
  font-weight: 600;
}

.branch-main strong,
.manager-cell strong,
.schedule-cell strong,
.amount-text,
.code-display {
  color: #223658;
  font-weight: 700;
  font-size: 0.93rem;
}

.code-display {
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
  height: 34px;
  padding: 0 0.72rem;
  border: 1px solid #dbe4f0;
  border-radius: 10px;
  background: #fff;
  color: #2d4f8f;
  font-weight: 700;
  font-size: 0.82rem;
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
  border-radius: 24px;
  border: 1px solid #dfe7f2;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.24);
  padding: 1.2rem;
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
  font-size: 1.45rem;
  font-weight: 900;
  letter-spacing: -0.03em;
}

.detail-modal-close {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  border: 1px solid #dde4ef;
  background: #fff;
  color: #40506f;
}

.users-modal-head-copy {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.users-modal-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 1rem 0 1.1rem;
}

.users-summary-pill {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 110px;
  padding: 0.8rem 0.95rem;
  border: 1px solid #e5ebf4;
  border-radius: 16px;
  background: linear-gradient(180deg, #fbfcfe 0%, #f6f8fc 100%);
}

.users-summary-pill span {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #8490a8;
}

.users-summary-pill strong {
  color: #223658;
  font-size: 1.02rem;
  font-weight: 900;
}

.users-summary-pill-accent {
  background: linear-gradient(180deg, #edf3ff 0%, #e7efff 100%);
  border-color: #d9e4fb;
}

.users-modal-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
  max-height: min(52vh, 460px);
  padding-right: 0.25rem;
}

.users-modal-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.15rem;
  padding: 1rem 1.05rem;
  border: 1px solid #edf1f6;
  border-radius: 16px;
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
}

.users-modal-item small {
  display: block;
  color: #6f7c92;
  line-height: 1.35;
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
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  background: #eef2f7;
  color: #52607a;
  font-size: 0.78rem;
  font-weight: 700;
}

.users-modal-item-meta small {
  text-align: right;
  white-space: nowrap;
}

.users-modal-empty {
  padding: 0.9rem 0.4rem 0.4rem;
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

  .detail-modal-head {
    align-items: flex-start;
  }

  .detail-modal-head h3 {
    font-size: 1.25rem;
  }

  .users-modal-summary {
    gap: 0.6rem;
  }

  .users-summary-pill {
    min-width: calc(33.333% - 0.5rem);
    flex: 1 1 0;
  }

  .users-modal-list {
    max-height: calc(100vh - 16rem);
  }

  .users-modal-item {
    flex-direction: column;
  }

  .users-modal-item-meta {
    align-items: flex-start;
    margin-left: 0;
    width: 100%;
  }

  .users-modal-item-meta small {
    white-space: normal;
    text-align: left;
  }

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
