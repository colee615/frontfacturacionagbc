<template>
  <div>
    <JcLoader :load="load" />
    <AdminTemplate :page="page" :modulo="modulo">
      <div slot="body" class="ops-wrap">
        <div class="ops-header d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
          <div>
            <h1 class="mb-1">Caja y fichas</h1>
            <p class="text-muted mb-0">Control operativo de sucursal, cajeras y cierre diario con diferencias de efectivo y fichas.</p>
          </div>
          <div class="ops-header-badges mt-3 mt-lg-0">
            <span class="ops-mini-badge">{{ branchLabel }}</span>
            <span class="ops-mini-badge ops-mini-badge--success">Caja: {{ cajaBadge }}</span>
            <span class="ops-mini-badge ops-mini-badge--warning">Mes: {{ monthFilter }}</span>
          </div>
        </div>

        <div class="ops-summary-grid">
          <div class="ops-stat-card">
            <div class="ops-stat-card__label">Stock sucursal</div>
            <div class="ops-stat-card__value">{{ numberFormat(branchStock.cantidadDisponible) }}</div>
            <div class="ops-stat-card__meta">Bs {{ money(branchStock.montoDisponible) }}</div>
          </div>
          <div class="ops-stat-card">
            <div class="ops-stat-card__label">Stock cajera actual</div>
            <div class="ops-stat-card__value">{{ numberFormat(cashierStock.cantidadDisponible) }}</div>
            <div class="ops-stat-card__meta">Bs {{ money(cashierStock.montoDisponible) }}</div>
          </div>
          <div class="ops-stat-card">
            <div class="ops-stat-card__label">Cajeras con saldo</div>
            <div class="ops-stat-card__value">{{ numberFormat(cashierBalancesSummary.cajeras) }}</div>
            <div class="ops-stat-card__meta">Bs {{ money(cashierBalancesSummary.montoDisponible) }}</div>
          </div>
          <div class="ops-stat-card" :class="isCajaAbierta ? 'is-open' : 'is-closed'">
            <div class="ops-stat-card__label">Estado de caja</div>
            <div class="ops-stat-card__value">{{ cajaBadge }}</div>
            <div class="ops-stat-card__meta">{{ cajaMessage }}</div>
          </div>
        </div>

        <div class="row">
          <div class="col-xl-6 mb-4">
            <div class="card ops-panel h-100">
              <div class="card-header ops-panel__header">
                <strong>Abastecer sucursal</strong>
                <div class="text-muted small">Registra el stock maestro disponible para La Paz y su punto de venta.</div>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-4 mb-3">
                    <label class="ops-label">Cantidad</label>
                    <input v-model.number="branchForm.cantidadFichas" type="number" min="0" class="form-control ops-control">
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="ops-label">Monto</label>
                    <input v-model.number="branchForm.montoFichas" type="number" min="0" step="0.01" class="form-control ops-control">
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="ops-label">Valor unitario</label>
                    <input v-model.number="branchForm.valorUnitarioFicha" type="number" min="0" step="0.01" class="form-control ops-control">
                  </div>
                  <div class="col-12 mb-3">
                    <label class="ops-label">Observacion</label>
                    <textarea v-model="branchForm.observacion" rows="2" class="form-control ops-control"></textarea>
                  </div>
                </div>
                <div class="d-flex flex-wrap">
                  <button class="btn btn-outline-primary mr-2 mb-2" :disabled="load" @click="submitBranchSupply">
                    <i class="fas fa-warehouse mr-1"></i> Guardar stock sucursal
                  </button>
                  <button class="btn btn-outline-secondary mb-2" :disabled="load" @click="resetBranchForm">
                    <i class="fas fa-undo mr-1"></i> Limpiar
                  </button>
                </div>
                <div class="ops-inline-note mt-3">
                  Disponible ahora: <strong>{{ numberFormat(branchStock.cantidadDisponible) }}</strong> fichas | <strong>Bs {{ money(branchStock.montoDisponible) }}</strong>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xl-6 mb-4">
            <div class="card ops-panel h-100">
              <div class="card-header ops-panel__header">
                <strong>Asignar a cajera</strong>
                <div class="text-muted small">Transfiere desde el stock de sucursal hacia una cajera especifica.</div>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-12 mb-3">
                    <label class="ops-label">Seleccion rapida</label>
                    <div class="d-flex flex-wrap align-items-center">
                      <select v-model="assignmentForm.selectedUserId" class="form-control ops-control mr-2 mb-2" @change="onCashierSelected">
                        <option value="">Selecciona una cajera</option>
                        <option v-for="option in cashierOptions" :key="option.id" :value="option.id">
                          {{ option.name }} | {{ option.email || option.id }}
                        </option>
                      </select>
                      <button class="btn btn-outline-secondary mb-2" :disabled="load" @click="useCurrentUser">
                        <i class="fas fa-user mr-1"></i> Usarme
                      </button>
                    </div>
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="ops-label">Usuario ID</label>
                    <input v-model="assignmentForm.destinoUsuarioId" type="text" class="form-control ops-control">
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="ops-label">Nombre</label>
                    <input v-model="assignmentForm.destinoUsuarioNombre" type="text" class="form-control ops-control">
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="ops-label">Email</label>
                    <input v-model="assignmentForm.destinoUsuarioEmail" type="email" class="form-control ops-control">
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="ops-label">Cantidad</label>
                    <input v-model.number="assignmentForm.cantidadFichas" type="number" min="0" class="form-control ops-control">
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="ops-label">Monto</label>
                    <input v-model.number="assignmentForm.montoFichas" type="number" min="0" step="0.01" class="form-control ops-control">
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="ops-label">Valor unitario</label>
                    <input v-model.number="assignmentForm.valorUnitarioFicha" type="number" min="0" step="0.01" class="form-control ops-control">
                  </div>
                  <div class="col-12 mb-3">
                    <label class="ops-label">Observacion</label>
                    <textarea v-model="assignmentForm.observacion" rows="2" class="form-control ops-control"></textarea>
                  </div>
                </div>
                <div class="d-flex flex-wrap">
                  <button class="btn btn-outline-primary mr-2 mb-2" :disabled="load" @click="submitAssignment">
                    <i class="fas fa-share-square mr-1"></i> Asignar fichas
                  </button>
                  <button class="btn btn-outline-secondary mb-2" :disabled="load" @click="resetAssignmentForm">
                    <i class="fas fa-undo mr-1"></i> Limpiar
                  </button>
                </div>
                <div class="ops-inline-note mt-3">
                  Sucursal restante luego de cada transferencia: revisa el panel de stock maestro.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-xl-5 mb-4">
            <div class="card ops-panel h-100">
              <div class="card-header ops-panel__header">
                <strong>Caja diaria</strong>
                <div class="text-muted small">Abre caja con efectivo inicial y fichas; al cerrar veras diferencias reales.</div>
              </div>
              <div class="card-body">
                <div class="ops-box-state">
                  <div>
                    <div class="ops-box-state__label">Estado actual</div>
                    <div class="ops-box-state__value" :class="isCajaAbierta ? 'is-open' : 'is-closed'">{{ cajaBadge }}</div>
                  </div>
                  <div class="ops-box-state__meta">
                    <div v-if="currentCaja">Fecha: {{ currentCaja.fechaOperacion }}</div>
                    <div v-if="currentCaja">Ventas: {{ numberFormat(currentCaja.cantidadVentas) }}</div>
                  </div>
                </div>

                <div v-if="!isCajaAbierta">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="ops-label">Efectivo apertura</label>
                      <input v-model.number="openForm.montoApertura" type="number" min="0" step="0.01" class="form-control ops-control">
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="ops-label">Valor unitario ficha</label>
                      <input v-model.number="openForm.valorUnitarioFicha" type="number" min="0" step="0.01" class="form-control ops-control">
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="ops-label">Cantidad fichas apertura</label>
                      <input v-model.number="openForm.cantidadFichasApertura" type="number" min="0" class="form-control ops-control">
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="ops-label">Monto fichas apertura</label>
                      <input v-model.number="openForm.montoFichasApertura" type="number" min="0" step="0.01" class="form-control ops-control">
                    </div>
                    <div class="col-12 mb-3">
                      <label class="ops-label">Observacion</label>
                      <textarea v-model="openForm.observacion" rows="2" class="form-control ops-control"></textarea>
                    </div>
                  </div>
                  <button class="btn btn-outline-primary" :disabled="load" @click="submitOpenCaja">
                    <i class="fas fa-lock-open mr-1"></i> Abrir caja
                  </button>
                </div>

                <div v-else>
                  <div class="ops-expected-grid">
                    <div class="ops-expected-card">
                      <span>Efectivo esperado</span>
                      <strong>Bs {{ money(currentCaja.montoCierreEsperado) }}</strong>
                    </div>
                    <div class="ops-expected-card">
                      <span>Fichas esperadas</span>
                      <strong>{{ numberFormat(currentCaja.cantidadFichasCierreEsperado) }} | Bs {{ money(currentCaja.montoFichasCierreEsperado) }}</strong>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="ops-label">Efectivo declarado</label>
                      <input v-model.number="closeForm.montoCierreDeclarado" type="number" min="0" step="0.01" class="form-control ops-control">
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="ops-label">Valor unitario ficha</label>
                      <input v-model.number="closeForm.valorUnitarioFicha" type="number" min="0" step="0.01" class="form-control ops-control">
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="ops-label">Cantidad fichas declarada</label>
                      <input v-model.number="closeForm.cantidadFichasCierreDeclarado" type="number" min="0" class="form-control ops-control">
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="ops-label">Monto fichas declarado</label>
                      <input v-model.number="closeForm.montoFichasCierreDeclarado" type="number" min="0" step="0.01" class="form-control ops-control">
                    </div>
                    <div class="col-12 mb-3">
                      <label class="ops-label">Observacion</label>
                      <textarea v-model="closeForm.observacion" rows="2" class="form-control ops-control"></textarea>
                    </div>
                  </div>

                  <div class="ops-diff-preview mb-3">
                    <div class="ops-diff-preview__item">
                      <span>Diferencia efectivo</span>
                      <strong :class="diffClass(previewDifferences.efectivo)">Bs {{ money(previewDifferences.efectivo) }}</strong>
                    </div>
                    <div class="ops-diff-preview__item">
                      <span>Diferencia fichas monto</span>
                      <strong :class="diffClass(previewDifferences.fichasMonto)">Bs {{ money(previewDifferences.fichasMonto) }}</strong>
                    </div>
                    <div class="ops-diff-preview__item">
                      <span>Diferencia fichas cantidad</span>
                      <strong :class="diffClass(previewDifferences.fichasCantidad)">{{ numberFormat(previewDifferences.fichasCantidad) }}</strong>
                    </div>
                  </div>

                  <button class="btn btn-outline-danger" :disabled="load" @click="submitCloseCaja">
                    <i class="fas fa-door-closed mr-1"></i> Cerrar caja
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xl-7 mb-4">
            <div class="card ops-panel h-100">
              <div class="card-header ops-panel__header d-flex justify-content-between align-items-center">
                <div>
                  <strong>Saldos por cajera</strong>
                  <div class="text-muted small">Vista consolidada de las cajeras que manejan fichas en la sucursal.</div>
                </div>
                <button class="btn btn-outline-secondary btn-sm" :disabled="load" @click="refreshAll">
                  <i class="fas fa-sync-alt mr-1"></i> Actualizar
                </button>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table ops-table mb-0">
                    <thead>
                      <tr>
                        <th>Cajera</th>
                        <th class="text-center">Cantidad</th>
                        <th class="text-right">Monto</th>
                        <th class="text-right">Ultimo consumo</th>
                        <th class="text-right">Accion</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="row in cashierBalances" :key="row.usuarioId">
                        <td>
                          <div class="ops-table__primary">{{ row.usuarioNombre || row.usuarioId }}</div>
                          <div class="ops-table__secondary">{{ row.usuarioEmail || 'Sin correo' }}</div>
                        </td>
                        <td class="text-center">{{ numberFormat(row.cantidadDisponible) }}</td>
                        <td class="text-right"><strong>Bs {{ money(row.montoDisponible) }}</strong></td>
                        <td class="text-right">{{ row.ultimoConsumoEn || '-' }}</td>
                        <td class="text-right">
                          <button class="btn btn-outline-secondary btn-sm" :disabled="load" @click="pickCashier(row)">
                            <i class="fas fa-arrow-up-right-from-square mr-1"></i> Usar
                          </button>
                        </td>
                      </tr>
                      <tr v-if="!cashierBalances.length">
                        <td colspan="5" class="text-center py-4 text-muted">No hay cajeras con stock registrado en esta sucursal.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-xl-6 mb-4">
            <div class="card ops-panel h-100">
              <div class="card-header ops-panel__header">
                <strong>Movimientos de sucursal</strong>
                <div class="text-muted small">Abastecimientos y transferencias del stock maestro.</div>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table ops-table mb-0">
                    <thead>
                      <tr>
                        <th>Movimiento</th>
                        <th class="text-center">Cantidad</th>
                        <th class="text-right">Monto</th>
                        <th class="text-right">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="row in branchMovements" :key="`branch-${row.id}`">
                        <td>
                          <div class="ops-table__primary">{{ row.tipoMovimiento }}</div>
                          <div class="ops-table__secondary">{{ row.observacion || '-' }}</div>
                        </td>
                        <td class="text-center">{{ signedNumber(row.cantidadDelta) }}</td>
                        <td class="text-right">{{ signedMoney(row.montoDelta) }}</td>
                        <td class="text-right">{{ row.createdAt || '-' }}</td>
                      </tr>
                      <tr v-if="!branchMovements.length">
                        <td colspan="4" class="text-center py-4 text-muted">No hay movimientos registrados para la sucursal.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xl-6 mb-4">
            <div class="card ops-panel h-100">
              <div class="card-header ops-panel__header">
                <strong>Arqueos del mes</strong>
                <div class="text-muted small">Cierres arqueados con diferencia de efectivo y fichas.</div>
              </div>
              <div class="card-body">
                <div class="d-flex flex-wrap align-items-end mb-3">
                  <div class="mr-2 mb-2">
                    <label class="ops-label">Mes</label>
                    <input v-model="monthFilter" type="month" class="form-control ops-control" @change="fetchArqueos">
                  </div>
                  <button class="btn btn-outline-primary mb-2" :disabled="load" @click="fetchArqueos">
                    <i class="fas fa-search mr-1"></i> Ver arqueos
                  </button>
                </div>
                <div class="table-responsive">
                  <table class="table ops-table mb-0">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th class="text-right">Dif. efectivo</th>
                        <th class="text-right">Dif. fichas</th>
                        <th class="text-center">Dif. cant.</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="day in arqueosDias" :key="day.fecha">
                        <td>
                          <div class="ops-table__primary">{{ day.fecha }}</div>
                          <div class="ops-table__secondary">{{ numberFormat(day.cantidadVentas) }} ventas</div>
                        </td>
                        <td class="text-right"><strong :class="diffClass(day.diferenciaEfectivo)">Bs {{ money(day.diferenciaEfectivo) }}</strong></td>
                        <td class="text-right"><strong :class="diffClass(day.diferenciaFichas)">Bs {{ money(day.diferenciaFichas) }}</strong></td>
                        <td class="text-center"><strong :class="diffClass(day.diferenciaCantidadFichas)">{{ numberFormat(day.diferenciaCantidadFichas) }}</strong></td>
                      </tr>
                      <tr v-if="!arqueosDias.length">
                        <td colspan="4" class="text-center py-4 text-muted">No hay arqueos cargados para este mes.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
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
      load: false,
      page: 'Ventas',
      modulo: 'Caja y fichas',
      currentCaja: null,
      cajaMessage: '',
      cashierStock: this.emptyCashierStock(),
      branchStock: this.emptyBranchStock(),
      cashierBalancesSummary: {
        cajeras: 0,
        cantidadDisponible: 0,
        montoDisponible: 0,
      },
      cashierBalances: [],
      cashierOptions: [],
      branchMovements: [],
      arqueosDias: [],
      monthFilter: this.currentMonth(),
      openForm: {
        montoApertura: 0,
        cantidadFichasApertura: 0,
        montoFichasApertura: 0,
        valorUnitarioFicha: 10,
        observacion: '',
      },
      closeForm: {
        montoCierreDeclarado: 0,
        cantidadFichasCierreDeclarado: 0,
        montoFichasCierreDeclarado: 0,
        valorUnitarioFicha: 10,
        observacion: '',
      },
      branchForm: {
        cantidadFichas: 0,
        montoFichas: 0,
        valorUnitarioFicha: 10,
        observacion: '',
      },
      assignmentForm: {
        selectedUserId: '',
        destinoUsuarioId: '',
        destinoUsuarioNombre: '',
        destinoUsuarioEmail: '',
        cantidadFichas: 0,
        montoFichas: 0,
        valorUnitarioFicha: 10,
        observacion: '',
      },
    };
  },
  computed: {
    user() {
      return this.$store?.state?.auth?.user || {};
    },
    currentSucursal() {
      return this.user?.sucursale || this.user?.sucursal || {};
    },
    hasSucursalContext() {
      return this.currentSucursal?.codigosucursal !== undefined
        || this.currentSucursal?.codigoSucursal !== undefined;
    },
    codigoSucursal() {
      return Number(
        this.currentSucursal?.codigosucursal ??
        this.currentSucursal?.codigoSucursal ??
        0
      );
    },
    puntoVenta() {
      return Number(
        this.currentSucursal?.puntoventa ??
        this.currentSucursal?.puntoVenta ??
        0
      );
    },
    sucursalNombre() {
      return (
        this.currentSucursal?.nombre ||
        this.currentSucursal?.descripcion ||
        this.currentSucursal?.municipio ||
        `Sucursal ${this.codigoSucursal}`
      );
    },
    branchLabel() {
      return `${this.sucursalNombre} | Punto ${this.puntoVenta}`;
    },
    isCajaAbierta() {
      return String(this.currentCaja?.estado || '').toUpperCase() === 'ABIERTA';
    },
    cajaBadge() {
      const state = String(this.currentCaja?.estado || '').toUpperCase();
      if (state === 'ABIERTA' || state === 'CERRADA') {
        return state;
      }
      return 'SIN APERTURA';
    },
    previewDifferences() {
      const expectedCash = Number(this.currentCaja?.montoCierreEsperado || 0);
      const expectedFichaAmount = Number(this.currentCaja?.montoFichasCierreEsperado || 0);
      const expectedFichaQty = Number(this.currentCaja?.cantidadFichasCierreEsperado || 0);
      const declaredCash = Number(this.closeForm.montoCierreDeclarado || 0);
      const declaredFichaAmount = Number(this.closeForm.montoFichasCierreDeclarado || 0);
      const declaredFichaQty = Number(this.closeForm.cantidadFichasCierreDeclarado || 0);

      return {
        efectivo: declaredCash - expectedCash,
        fichasMonto: declaredFichaAmount - expectedFichaAmount,
        fichasCantidad: declaredFichaQty - expectedFichaQty,
      };
    },
  },
  methods: {
    currentMonth() {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    },
    currentDate() {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    },
    emptyCashierStock() {
      return {
        cantidadDisponible: 0,
        montoDisponible: 0,
      };
    },
    emptyBranchStock() {
      return {
        cantidadDisponible: 0,
        montoDisponible: 0,
      };
    },
    money(value) {
      const n = Number(value || 0);
      return Number.isFinite(n) ? n.toFixed(2) : '0.00';
    },
    signedMoney(value) {
      const n = Number(value || 0);
      const sign = n > 0 ? '+' : '';
      return `${sign}Bs ${this.money(n)}`;
    },
    numberFormat(value) {
      const n = Number(value || 0);
      return Number.isFinite(n) ? n.toLocaleString('es-BO') : '0';
    },
    signedNumber(value) {
      const n = Number(value || 0);
      const sign = n > 0 ? '+' : '';
      return `${sign}${this.numberFormat(n)}`;
    },
    diffClass(value) {
      const n = Number(value || 0);
      if (n === 0) return 'ops-diff--ok';
      return n > 0 ? 'ops-diff--up' : 'ops-diff--down';
    },
    branchParams(extra = {}) {
      return {
        codigoSucursal: this.codigoSucursal,
        puntoVenta: this.puntoVenta,
        sucursalNombre: this.sucursalNombre,
        ...extra,
      };
    },
    useCurrentUser() {
      this.assignmentForm.selectedUserId = String(this.user.id || '');
      this.assignmentForm.destinoUsuarioId = String(this.user.id || '');
      this.assignmentForm.destinoUsuarioNombre = String(this.user.name || '');
      this.assignmentForm.destinoUsuarioEmail = String(this.user.email || '');
    },
    onCashierSelected() {
      const selected = this.cashierOptions.find((item) => String(item.id) === String(this.assignmentForm.selectedUserId));
      if (!selected) return;
      this.assignmentForm.destinoUsuarioId = String(selected.id || '');
      this.assignmentForm.destinoUsuarioNombre = String(selected.name || '');
      this.assignmentForm.destinoUsuarioEmail = String(selected.email || '');
    },
    pickCashier(row) {
      this.assignmentForm.selectedUserId = String(row?.usuarioId || '');
      this.assignmentForm.destinoUsuarioId = String(row?.usuarioId || '');
      this.assignmentForm.destinoUsuarioNombre = String(row?.usuarioNombre || '');
      this.assignmentForm.destinoUsuarioEmail = String(row?.usuarioEmail || '');
    },
    notify(type, title, text) {
      this.$swal.fire({
        icon: type,
        title,
        text,
        confirmButtonText: 'Entendido',
      });
    },
    ensureBranchContext() {
      if (!this.user?.id) {
        this.notify('error', 'Sesion invalida', 'No se encontro el usuario autenticado.');
        return false;
      }

      if (!this.hasSucursalContext || this.codigoSucursal < 0 || this.puntoVenta < 0) {
        this.notify('error', 'Sucursal invalida', 'El usuario no tiene codigo de sucursal o punto de venta validos.');
        return false;
      }

      return true;
    },
    applyCajaState(payload) {
      this.currentCaja = payload?.caja || null;
      this.cajaMessage = payload?.mensaje || '';

      if (this.currentCaja) {
        this.closeForm.montoCierreDeclarado = Number(this.currentCaja.montoCierreEsperado || 0);
        this.closeForm.cantidadFichasCierreDeclarado = Number(this.currentCaja.cantidadFichasCierreEsperado || 0);
        this.closeForm.montoFichasCierreDeclarado = Number(this.currentCaja.montoFichasCierreEsperado || 0);
        this.openForm.montoApertura = Number(this.currentCaja.montoApertura || 0);
        this.openForm.cantidadFichasApertura = Number(this.currentCaja.cantidadFichasApertura || 0);
        this.openForm.montoFichasApertura = Number(this.currentCaja.montoFichasApertura || 0);
      }
    },
    async fetchCajaState() {
      const res = await this.$admin.$get('caja/estado', {
        params: this.branchParams({ fecha: this.currentDate() }),
      });
      this.applyCajaState(res);
      if (res?.stockFichas) {
        this.cashierStock = res.stockFichas;
      }
      if (res?.stockFichasSucursal) {
        this.branchStock = res.stockFichasSucursal;
      }
    },
    async fetchCashierStock() {
      const res = await this.$admin.$get('caja/fichas/stock', {
        params: this.branchParams({ limite: 8 }),
      });
      this.cashierStock = res?.stock || this.emptyCashierStock();
      if (!this.currentCaja) {
        this.openForm.cantidadFichasApertura = Number(this.cashierStock.cantidadDisponible || 0);
        this.openForm.montoFichasApertura = Number(this.cashierStock.montoDisponible || 0);
      }
    },
    async fetchBranchStock() {
      const res = await this.$admin.$get('caja/fichas/sucursal/stock', {
        params: this.branchParams({ limite: 8 }),
      });
      this.branchStock = res?.stockSucursal || this.emptyBranchStock();
      this.branchMovements = Array.isArray(res?.movimientosSucursal) ? res.movimientosSucursal : [];
    },
    async fetchCashierBalances() {
      const res = await this.$admin.$get('caja/fichas/cajeros/saldos', {
        params: this.branchParams(),
      });
      this.cashierBalancesSummary = res?.resumen || {
        cajeras: 0,
        cantidadDisponible: 0,
        montoDisponible: 0,
      };
      this.cashierBalances = Array.isArray(res?.cajeras) ? res.cajeras : [];
      this.syncCashierOptions();
    },
    async fetchArqueos() {
      const res = await this.$admin.$get('caja/arqueos', {
        params: this.branchParams({ mes: this.monthFilter }),
      });
      this.arqueosDias = Array.isArray(res?.dias) ? res.dias : [];
    },
    async refreshAll() {
      if (!this.ensureBranchContext()) return;
      this.load = true;
      try {
        await Promise.all([
          this.fetchCajaState(),
          this.fetchCashierStock(),
          this.fetchBranchStock(),
          this.fetchCashierBalances(),
          this.fetchArqueos(),
        ]);
      } catch (error) {
        const msg = error?.response?.data?.message || 'No se pudo cargar el control de caja y fichas.';
        this.notify('error', 'Error', msg);
      } finally {
        this.load = false;
      }
    },
    syncCashierOptions() {
      const catalog = new Map();

      if (this.user?.id) {
        catalog.set(String(this.user.id), {
          id: this.user.id,
          name: this.user.name || `Usuario ${this.user.id}`,
          email: this.user.email || '',
        });
      }

      this.cashierBalances.forEach((row) => {
        if (!row?.usuarioId) return;
        catalog.set(String(row.usuarioId), {
          id: row.usuarioId,
          name: row.usuarioNombre || `Usuario ${row.usuarioId}`,
          email: row.usuarioEmail || '',
        });
      });

      this.cashierOptions = Array.from(catalog.values()).sort((a, b) =>
        String(a.name || '').localeCompare(String(b.name || ''), 'es', { sensitivity: 'base' })
      );
    },
    resetBranchForm() {
      this.branchForm = {
        cantidadFichas: 0,
        montoFichas: 0,
        valorUnitarioFicha: this.branchForm.valorUnitarioFicha || 10,
        observacion: '',
      };
    },
    resetAssignmentForm() {
      this.assignmentForm = {
        selectedUserId: '',
        destinoUsuarioId: '',
        destinoUsuarioNombre: '',
        destinoUsuarioEmail: '',
        cantidadFichas: 0,
        montoFichas: 0,
        valorUnitarioFicha: this.assignmentForm.valorUnitarioFicha || 10,
        observacion: '',
      };
    },
    async submitBranchSupply() {
      if (!this.ensureBranchContext()) return;
      this.load = true;
      try {
        await this.$admin.$post('caja/fichas/sucursal/abastecer', {
          ...this.branchParams(),
          ...this.branchForm,
        });
        this.notify('success', 'Sucursal actualizada', 'El stock maestro de fichas se registro correctamente.');
        await this.refreshAll();
        this.resetBranchForm();
      } catch (error) {
        const msg = error?.response?.data?.message || 'No se pudo abastecer la sucursal.';
        this.notify('error', 'Error', msg);
        this.load = false;
      }
    },
    async submitAssignment() {
      if (!this.ensureBranchContext()) return;
      if (!this.assignmentForm.destinoUsuarioId) {
        this.notify('warning', 'Falta cajera', 'Selecciona o escribe la cajera destino antes de asignar fichas.');
        return;
      }

      this.load = true;
      try {
        await this.$admin.$post('caja/fichas/asignar', {
          ...this.branchParams(),
          ...this.assignmentForm,
          afectarStockSucursal: true,
        });
        this.notify('success', 'Asignacion completada', 'Las fichas fueron transferidas a la cajera seleccionada.');
        await this.refreshAll();
        this.resetAssignmentForm();
      } catch (error) {
        const data = error?.response?.data || {};
        const msg = data?.message || Object.values(data?.errors || {}).flat()[0] || 'No se pudo asignar fichas a la cajera.';
        this.notify('error', 'Error', msg);
        this.load = false;
      }
    },
    async submitOpenCaja() {
      if (!this.ensureBranchContext()) return;
      this.load = true;
      try {
        await this.$admin.$post('caja/abrir', {
          ...this.branchParams({ fecha: this.currentDate() }),
          ...this.openForm,
        });
        this.notify('success', 'Caja abierta', 'La caja diaria se abrio con el efectivo y fichas registrados.');
        await this.refreshAll();
      } catch (error) {
        const data = error?.response?.data || {};
        const msg = data?.message || Object.values(data?.errors || {}).flat()[0] || 'No se pudo abrir la caja.';
        this.notify('error', 'Error', msg);
        this.load = false;
      }
    },
    async submitCloseCaja() {
      if (!this.ensureBranchContext()) return;
      this.load = true;
      try {
        await this.$admin.$post('caja/cerrar', {
          ...this.branchParams({ fecha: this.currentDate() }),
          ...this.closeForm,
        });
        this.notify('success', 'Caja cerrada', 'El cierre se guardo con diferencias de efectivo y fichas.');
        await this.refreshAll();
      } catch (error) {
        const data = error?.response?.data || {};
        const msg = data?.message || Object.values(data?.errors || {}).flat()[0] || 'No se pudo cerrar la caja.';
        this.notify('error', 'Error', msg);
        this.load = false;
      }
    },
  },
  mounted() {
    this.useCurrentUser();
    this.syncCashierOptions();
    this.refreshAll();
  },
};
</script>

<style scoped>
.ops-wrap {
  padding-bottom: 1rem;
}

.ops-header {
  gap: 1rem;
  margin-bottom: 1rem;
}

.ops-header h1 {
  font-weight: 700;
  color: #173b73;
}

.ops-header-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.ops-mini-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  background: rgba(254, 204, 54, 0.18);
  color: #173b73;
  font-size: 0.82rem;
  font-weight: 700;
}

.ops-mini-badge--success {
  background: rgba(40, 167, 69, 0.14);
  color: #1f7a35;
}

.ops-mini-badge--warning {
  background: rgba(255, 193, 7, 0.18);
  color: #9a6b00;
}

.ops-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.ops-stat-card {
  border: 1px solid rgba(32, 83, 154, 0.12);
  border-top: 4px solid #fecc36;
  border-radius: 12px;
  padding: 1rem 1.05rem;
  box-shadow: 0 8px 24px rgba(16, 43, 84, 0.06);
  background: #fff;
  min-height: 132px;
}

.ops-stat-card.is-open {
  border-top-color: #28a745;
}

.ops-stat-card.is-closed {
  border-top-color: #dc3545;
}

.ops-stat-card__label {
  color: #5f7290;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 0.65rem;
}

.ops-stat-card__value {
  color: #173b73;
  font-size: 1.8rem;
  line-height: 1;
  font-weight: 800;
  margin-bottom: 0.7rem;
}

.ops-stat-card__meta {
  color: #74839b;
  font-size: 0.82rem;
  line-height: 1.35;
}

.ops-panel {
  border: 1px solid rgba(32, 83, 154, 0.12);
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(16, 43, 84, 0.05);
  overflow: hidden;
}

.ops-panel__header {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-bottom: 1px solid rgba(32, 83, 154, 0.1);
  padding: 1rem 1.25rem;
}

.ops-label {
  color: #294b7c;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 0.35rem;
}

.ops-control {
  min-height: 44px;
  border-radius: 10px;
  border-color: rgba(32, 83, 154, 0.18);
  box-shadow: none;
}

.ops-control:focus {
  border-color: rgba(32, 83, 154, 0.42);
  box-shadow: 0 0 0 0.18rem rgba(32, 83, 154, 0.09);
}

.ops-inline-note {
  color: #5f7290;
  font-size: 0.88rem;
}

.ops-box-state {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  background: #f8fbff;
  border: 1px solid rgba(32, 83, 154, 0.1);
  margin-bottom: 1rem;
}

.ops-box-state__label {
  color: #74839b;
  font-size: 0.8rem;
  text-transform: uppercase;
  font-weight: 700;
}

.ops-box-state__value {
  font-size: 1.2rem;
  font-weight: 800;
}

.ops-box-state__value.is-open {
  color: #1f7a35;
}

.ops-box-state__value.is-closed {
  color: #b02a37;
}

.ops-box-state__meta {
  text-align: right;
  color: #74839b;
  font-size: 0.85rem;
}

.ops-expected-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.ops-expected-card {
  border: 1px solid rgba(32, 83, 154, 0.12);
  border-radius: 10px;
  background: #f8fbff;
  padding: 0.8rem 0.9rem;
}

.ops-expected-card span {
  display: block;
  color: #74839b;
  font-size: 0.8rem;
  margin-bottom: 0.35rem;
}

.ops-expected-card strong {
  color: #173b73;
}

.ops-diff-preview {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.ops-diff-preview__item {
  border: 1px solid rgba(32, 83, 154, 0.12);
  border-radius: 10px;
  padding: 0.75rem 0.8rem;
  background: #fff;
}

.ops-diff-preview__item span {
  display: block;
  color: #74839b;
  font-size: 0.78rem;
  margin-bottom: 0.25rem;
}

.ops-table thead th {
  background: #f7f9fc;
  border-bottom: 1px solid rgba(32, 83, 154, 0.1);
  color: #38557f;
  font-size: 0.79rem;
  font-weight: 800;
  text-transform: uppercase;
  white-space: nowrap;
}

.ops-table td {
  vertical-align: top;
  border-top: 1px solid rgba(32, 83, 154, 0.08);
  padding-top: 0.9rem;
  padding-bottom: 0.9rem;
}

.ops-table__primary {
  color: #173b73;
  font-weight: 700;
}

.ops-table__secondary {
  color: #74839b;
  font-size: 0.83rem;
  margin-top: 0.25rem;
}

.ops-diff--ok {
  color: #1f7a35;
}

.ops-diff--up {
  color: #20539a;
}

.ops-diff--down {
  color: #b02a37;
}

@media (max-width: 1199.98px) {
  .ops-summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767.98px) {
  .ops-summary-grid,
  .ops-expected-grid,
  .ops-diff-preview {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
</style>
