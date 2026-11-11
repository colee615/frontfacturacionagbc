<template>
  <AdminTemplate page="Inicio" modulo="Dashboard">
    <main slot="body" class="sales-dashboard">
      <header class="sales-dashboard-heading">
        <div>
          <p class="safe-eyebrow">RESUMEN COMERCIAL</p>
          <h1>Dashboard de ventas</h1>
          <p>Hola, {{ firstName }}. Compara las ventas y los medios de pago.</p>
        </div>
        <span v-if="report && !loading" class="dashboard-updated">Actualizado {{ generatedAt }}</span>
      </header>

      <form v-if="canReadSales" class="dashboard-filters" @submit.prevent="loadDashboard">
        <label>
          <span>Desde</span>
          <input v-model="filters.fechaInicio" type="date" aria-label="Fecha inicial" />
        </label>
        <label>
          <span>Hasta</span>
          <input v-model="filters.fechaFin" type="date" aria-label="Fecha final" />
        </label>
        <label class="dashboard-regional">
          <span>Regional</span>
          <select v-model="filters.codigoSucursal" aria-label="Regional">
            <option value="">Todas las regionales</option>
            <option v-for="regional in regionales" :key="regional.codigo" :value="String(regional.codigo)">{{ regional.nombre }}</option>
          </select>
        </label>
        <button type="submit" class="dashboard-apply" :disabled="loading">
          {{ loading ? 'Consultando…' : 'Actualizar' }}
        </button>
      </form>

      <section v-if="!canReadSales" class="dashboard-message">
        <h2>Panel de ventas no disponible</h2>
        <p>Tu cuenta no tiene acceso a los reportes de ventas. Si lo necesitas, solicita el permiso correspondiente al administrador.</p>
      </section>

      <p v-if="error" class="dashboard-error" role="alert">{{ error }}</p>
      <p v-else-if="loading" class="dashboard-loading" role="status">Cargando ventas y medios de pago…</p>

      <template v-if="report && !loading && !error && canReadSales">
        <div class="dashboard-period">
          <span>{{ periodLabel }} · BOB</span>
          <span>Ventas facturadas vigentes; QR con pago confirmado</span>
        </div>

        <section class="dashboard-metrics" aria-label="Resumen del período">
          <article class="dashboard-metric dashboard-metric-primary">
            <span>Total vendido</span>
            <strong>{{ money(summary.totalVendido) }}</strong>
            <small>{{ summary.facturadas || 0 }} facturas incluidas</small>
          </article>
          <article class="dashboard-metric">
            <span>Efectivo</span>
            <strong>{{ money(summary.totalEfectivoFacturado) }}</strong>
            <small>{{ paymentShare('cash') }}% del total vendido</small>
          </article>
          <article class="dashboard-metric">
            <span>QR confirmado</span>
            <strong>{{ money(summary.totalQrFacturado) }}</strong>
            <small>{{ paymentShare('qr') }}% del total vendido</small>
          </article>
          <article class="dashboard-metric">
            <span>Promedio por factura</span>
            <strong>{{ money(ticketAverage) }}</strong>
            <small>En el período seleccionado</small>
          </article>
        </section>

        <section class="dashboard-charts">
          <article class="dashboard-chart-card dashboard-trend-card">
            <div class="dashboard-card-heading">
              <div><h2>Ventas por día y medio de pago</h2><p>Compara efectivo y QR confirmado durante el período.</p></div>
              <span v-if="chartWasLimited" class="chart-range-note">Últimos 45 días</span>
            </div>
            <div class="chart-legend" aria-hidden="true">
              <span><i class="legend-cash"></i>Efectivo</span>
              <span><i class="legend-qr"></i>QR confirmado</span>
            </div>
            <div v-if="hasChartSales" class="sales-chart" role="img" :aria-label="chartDescription">
              <div class="chart-y-axis" aria-hidden="true">
                <span>{{ moneyCompact(chartMax) }}</span>
                <span>{{ moneyCompact(chartMax / 2) }}</span>
                <span>0</span>
              </div>
              <div class="chart-scroll">
                <div class="chart-plot" :style="{ width: chartPlotWidth }">
                  <div class="chart-gridline chart-gridline-top"></div>
                  <div class="chart-gridline chart-gridline-middle"></div>
                  <div class="chart-gridline chart-gridline-bottom"></div>
                  <div class="chart-columns">
                    <div v-for="day in chartBars" :key="day.fecha" class="chart-day" :title="chartDayTitle(day)">
                      <div class="chart-bar-pair">
                        <span class="chart-bar chart-bar-cash" :style="{ height: barHeight(day.efectivo) }"></span>
                        <span class="chart-bar chart-bar-qr" :style="{ height: barHeight(day.qr) }"></span>
                      </div>
                    </div>
                  </div>
                  <div class="chart-date-labels" aria-hidden="true">
                    <span v-for="day in chartBars" :key="day.fecha + '-label'">{{ day.etiqueta }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="dashboard-chart-empty">No hay ventas facturadas para las fechas seleccionadas.</div>
          </article>

          <article class="dashboard-chart-card dashboard-payment-card">
            <div class="dashboard-card-heading">
              <div><h2>Comparación de pagos</h2><p>Distribución del total vendido por medio.</p></div>
            </div>
            <div class="payment-total"><span>Total vendido</span><strong>{{ money(summary.totalVendido) }}</strong></div>
            <div v-for="method in paymentRows" :key="method.key" class="payment-method">
              <div class="payment-method-heading">
                <span><i :class="method.key === 'cash' ? 'legend-cash' : 'legend-qr'"></i>{{ method.label }}</span>
                <strong>{{ money(method.total) }}</strong>
              </div>
              <div class="payment-track" role="presentation"><span :class="method.key === 'cash' ? 'payment-fill-cash' : 'payment-fill-qr'" :style="{ width: method.share + '%' }"></span></div>
              <small>{{ method.share }}% del total</small>
            </div>
            <div class="payment-reconciliation" :class="{ 'has-difference': Number(summary.diferenciaMediosPago || 0) !== 0 }">
              <span>Efectivo + QR</span>
              <strong>{{ money(summary.totalEfectivoFacturado + summary.totalQrFacturado) }}</strong>
              <small>{{ reconciliationLabel }}</small>
            </div>
          </article>
        </section>

        <footer class="dashboard-footer">
          <span>El total excluye anulaciones y pagos QR sin confirmación.</span>
          <nuxt-link :to="{ path: '/cajero/ventas/auditoria', query: appliedFilters }">Abrir auditoría financiera <BaseIcon name="chevron" :size="13" /></nuxt-link>
        </footer>
      </template>
    </main>
  </AdminTemplate>
</template>

<script>
function localIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseLocalDate(value) {
  const parts = String(value || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(part => !part)) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

export default {
  data() {
    const today = new Date();
    return {
      filters: {
        fechaInicio: localIsoDate(new Date(today.getFullYear(), today.getMonth(), 1)),
        fechaFin: localIsoDate(today),
        codigoSucursal: ''
      },
      appliedFilters: {},
      report: null,
      regionales: [],
      loading: false,
      error: '',
      requestId: 0
    };
  },
  computed: {
    auth() { return this.$store.state.auth || {}; },
    user() { return this.auth.user; },
    firstName() { return ((this.user || {}).name || 'bienvenido').split(' ')[0]; },
    canReadSales() { return (this.auth.permissions || []).includes('ventas.read') && (this.auth.views || []).includes('ventas'); },
    summary() { return (this.report && this.report.resumen) || {}; },
    periodLabel() {
      const start = this.formatShortDate(this.appliedFilters.fechaInicio);
      const end = this.formatShortDate(this.appliedFilters.fechaFin);
      return `${start} — ${end}`;
    },
    generatedAt() {
      if (!this.report || !this.report.generadoEn) return '';
      return new Intl.DateTimeFormat('es-BO', { hour: '2-digit', minute: '2-digit' }).format(new Date(this.report.generadoEn));
    },
    ticketAverage() {
      const count = Number(this.summary.facturadas || 0);
      return count ? Number(this.summary.totalVendido || 0) / count : 0;
    },
    paymentRows() {
      return [
        { key: 'cash', label: 'Efectivo', total: Number(this.summary.totalEfectivoFacturado || 0), share: this.paymentShare('cash') },
        { key: 'qr', label: 'QR confirmado', total: Number(this.summary.totalQrFacturado || 0), share: this.paymentShare('qr') }
      ];
    },
    chartBars() {
      if (!this.appliedFilters.fechaInicio || !this.appliedFilters.fechaFin) return [];
      const start = parseLocalDate(this.appliedFilters.fechaInicio);
      const end = parseLocalDate(this.appliedFilters.fechaFin);
      if (!start || !end || start > end) return [];

      const chartStart = new Date(end);
      chartStart.setDate(chartStart.getDate() - 44);
      const firstDay = start > chartStart ? start : chartStart;
      const daily = new Map((this.report.porFecha || []).map(row => [String(row.fecha || '').slice(0, 10), row]));
      const bars = [];
      const cursor = new Date(firstDay);
      while (cursor <= end && bars.length < 45) {
        const date = localIsoDate(cursor);
        const row = daily.get(date) || {};
        bars.push({
          fecha: date,
          etiqueta: date.slice(8, 10),
          efectivo: Number(row.totalEfectivoFacturado || 0),
          qr: Number(row.totalQrFacturado || 0)
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      return bars;
    },
    chartWasLimited() {
      const start = parseLocalDate(this.appliedFilters.fechaInicio);
      const end = parseLocalDate(this.appliedFilters.fechaFin);
      return Boolean(start && end && Math.round((end - start) / 86400000) + 1 > 45);
    },
    chartMax() {
      const max = Math.max(0, ...this.chartBars.map(day => Math.max(day.efectivo, day.qr)));
      if (!max) return 1;
      const magnitude = 10 ** Math.floor(Math.log10(max));
      return Math.ceil(max / magnitude) * magnitude;
    },
    chartPlotWidth() { return `${Math.max(100, this.chartBars.length * 34)}px`; },
    reconciliationLabel() {
      return Number(this.summary.diferenciaMediosPago || 0) === 0
        ? 'El desglose coincide con el total vendido.'
        : `Diferencia: ${this.money(this.summary.diferenciaMediosPago)}`;
    },
    hasChartSales() { return this.chartBars.some(day => day.efectivo > 0 || day.qr > 0); },
    chartDescription() {
      return `Ventas diarias por medio de pago entre ${this.periodLabel}. Efectivo en verde oscuro y QR confirmado en verde claro.`;
    }
  },
  mounted() {
    if (!this.user) {
      this.$router.push('/auth/login');
      return;
    }
    if (this.canReadSales) this.loadDashboard();
  },
  methods: {
    money(value) {
      return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', maximumFractionDigits: 2 }).format(Number(value || 0));
    },
    moneyCompact(value) {
      return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', notation: 'compact', maximumFractionDigits: 1 }).format(Number(value || 0));
    },
    formatShortDate(value) {
      const date = parseLocalDate(value);
      return date ? new Intl.DateTimeFormat('es-BO', { day: '2-digit', month: 'short', year: 'numeric' }).format(date) : '—';
    },
    paymentShare(key) {
      const total = Number(this.summary.totalVendido || 0);
      if (!total) return 0;
      const amount = key === 'cash' ? Number(this.summary.totalEfectivoFacturado || 0) : Number(this.summary.totalQrFacturado || 0);
      return Math.round((amount / total) * 100);
    },
    barHeight(amount) {
      return amount > 0 ? `${Math.max((amount / this.chartMax) * 100, 1.5)}%` : '0%';
    },
    chartDayTitle(day) {
      return `${this.formatShortDate(day.fecha)} · Efectivo: ${this.money(day.efectivo)} · QR: ${this.money(day.qr)}`;
    },
    async loadDashboard() {
      const id = ++this.requestId;
      const filters = { ...this.filters };
      this.error = '';
      if (!filters.fechaInicio || !filters.fechaFin || filters.fechaInicio > filters.fechaFin) {
        this.report = null;
        this.error = 'Selecciona un rango de fechas válido.';
        return;
      }

      this.loading = true;
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => { if (value !== '') params.set(key, value); });
        const report = await this.$admin.$get(`ventas/reportes/dashboard?${params.toString()}`);
        if (id !== this.requestId) return;
        this.report = report;
        this.appliedFilters = filters;
        if (!filters.codigoSucursal && Array.isArray(report.sucursales)) {
          const regionales = new Map();
          report.sucursales.forEach(row => {
            regionales.set(String(row.codigoSucursal), row.nombre || String(row.codigoSucursal));
          });
          this.regionales = Array.from(regionales, ([codigo, nombre]) => ({ codigo, nombre }));
        }
      } catch (error) {
        if (id === this.requestId) {
          this.report = null;
          this.error = error.response?.data?.message || error.message || 'No se pudo cargar el dashboard.';
        }
      } finally {
        if (id === this.requestId) this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.sales-dashboard { max-width: 1600px; margin: 0 auto; color: var(--safe-ink); }
.sales-dashboard-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 22px; }
.sales-dashboard-heading h1 { margin: 0; font-size: clamp(24px, 2.2vw, 31px); line-height: 1.25; font-weight: 700; }
.sales-dashboard-heading > div > p:last-child { color: var(--safe-muted); margin: 7px 0 0; font-size: 13px; }
.dashboard-updated { color: var(--safe-muted); font-size: 11px; padding-bottom: 4px; white-space: nowrap; }
.dashboard-filters { display: grid; grid-template-columns: minmax(140px, 190px) minmax(140px, 190px) minmax(190px, 1fr) auto; gap: 13px; align-items: flex-end; padding: 16px; background: var(--safe-surface); border: 1px solid var(--safe-line); border-radius: 12px; }
.dashboard-filters label { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.dashboard-filters label > span { color: var(--safe-muted); font-size: 11px; font-weight: 600; }
.dashboard-filters input, .dashboard-filters select { height: 40px; width: 100%; min-width: 0; padding: 0 10px; color: var(--safe-ink); background: var(--safe-soft); border: 1px solid var(--safe-line); border-radius: 7px; font-size: 12px; }
.dashboard-apply { height: 40px; padding: 0 19px; color: #fff; background: #087f82; border: 1px solid #087f82; border-radius: 7px; font-size: 12px; font-weight: 650; }
.dashboard-apply:hover { background: #06696d; }
.dashboard-apply:disabled { opacity: .6; cursor: wait; }
.dashboard-period { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px 18px; margin: 18px 2px 12px; color: var(--safe-muted); font-size: 11px; }
.dashboard-metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 13px; }
.dashboard-metric { display: flex; flex-direction: column; gap: 8px; min-width: 0; padding: 18px 19px; background: var(--safe-surface); border: 1px solid var(--safe-line); border-radius: 12px; }
.dashboard-metric > span { color: var(--safe-muted); font-size: 12px; }
.dashboard-metric > strong { overflow: hidden; color: var(--safe-ink); font-size: clamp(18px, 1.7vw, 23px); line-height: 1.3; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
.dashboard-metric > small { color: var(--safe-muted); font-size: 10px; }
.dashboard-metric-primary { background: #173e4e; border-color: #173e4e; }
.dashboard-metric-primary > span, .dashboard-metric-primary > small { color: #c5dcdf; }
.dashboard-metric-primary > strong { color: #fff; }
.dashboard-charts { display: grid; grid-template-columns: minmax(0, 1.65fr) minmax(300px, 1fr); gap: 14px; margin-top: 15px; }
.dashboard-chart-card { min-width: 0; padding: 21px; background: var(--safe-surface); border: 1px solid var(--safe-line); border-radius: 12px; }
.dashboard-card-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.dashboard-card-heading h2 { margin: 0; font-size: 15px; font-weight: 650; }
.dashboard-card-heading p { margin: 5px 0 0; color: var(--safe-muted); font-size: 11px; line-height: 1.5; }
.chart-range-note { color: var(--safe-muted); font-size: 10px; white-space: nowrap; }
.chart-legend { display: flex; gap: 18px; margin: 20px 0 10px 46px; color: var(--safe-muted); font-size: 10px; }
.chart-legend span, .payment-method-heading > span { display: inline-flex; align-items: center; gap: 7px; }
.chart-legend i, .payment-method-heading i { display: inline-block; width: 8px; height: 8px; border-radius: 3px; }
.legend-cash { background: #117d78; }
.legend-qr { background: #6bc6aa; }
.sales-chart { display: grid; grid-template-columns: 40px minmax(0, 1fr); gap: 6px; height: 232px; }
.chart-y-axis { display: flex; flex-direction: column; justify-content: space-between; align-items: flex-end; padding: 0 0 23px; color: var(--safe-muted); font-size: 9px; }
.chart-scroll { min-width: 0; overflow-x: auto; scrollbar-width: thin; }
.chart-plot { position: relative; min-width: 100%; height: 100%; padding-bottom: 23px; }
.chart-gridline { position: absolute; left: 0; right: 0; height: 1px; background: var(--safe-line); pointer-events: none; }
.chart-gridline-top { top: 0; }
.chart-gridline-middle { top: 50%; }
.chart-gridline-bottom { bottom: 23px; }
.chart-columns { position: absolute; inset: 0 0 23px; display: grid; grid-auto-flow: column; grid-auto-columns: minmax(25px, 1fr); align-items: stretch; }
.chart-day { display: flex; align-items: flex-end; justify-content: center; min-width: 0; height: 100%; }
.chart-bar-pair { display: flex; align-items: flex-end; justify-content: center; gap: 3px; width: 100%; height: 100%; }
.chart-bar { display: block; width: 10px; min-height: 0; border-radius: 3px 3px 0 0; transition: height .2s ease; }
.chart-bar-cash { background: #117d78; }
.chart-bar-qr { background: #6bc6aa; }
.chart-date-labels { position: absolute; inset: auto 0 0; display: grid; grid-auto-flow: column; grid-auto-columns: minmax(25px, 1fr); color: var(--safe-muted); text-align: center; font-size: 9px; }
.dashboard-chart-empty { display: grid; place-items: center; min-height: 190px; color: var(--safe-muted); font-size: 12px; text-align: center; }
.payment-total { display: flex; flex-direction: column; gap: 5px; margin: 23px 0 21px; padding-bottom: 17px; border-bottom: 1px solid var(--safe-line); }
.payment-total span { color: var(--safe-muted); font-size: 11px; }
.payment-total strong { color: var(--safe-ink); font-size: 24px; }
.payment-method + .payment-method { margin-top: 19px; }
.payment-method-heading { display: flex; justify-content: space-between; gap: 10px; color: var(--safe-ink); font-size: 11px; }
.payment-method-heading strong { font-size: 11px; white-space: nowrap; }
.payment-track { height: 8px; margin: 9px 0 5px; overflow: hidden; background: var(--safe-soft); border-radius: 8px; }
.payment-track > span { display: block; height: 100%; min-width: 0; border-radius: inherit; transition: width .2s ease; }
.payment-fill-cash { background: #117d78; }
.payment-fill-qr { background: #6bc6aa; }
.payment-method > small { color: var(--safe-muted); font-size: 10px; }
.payment-reconciliation { display: grid; grid-template-columns: 1fr auto; gap: 3px 12px; margin-top: 23px; padding: 12px; color: #11695e; background: #eaf6f1; border: 1px solid #d4eee3; border-radius: 8px; font-size: 10px; }
.payment-reconciliation strong { text-align: right; }
.payment-reconciliation small { grid-column: 1 / -1; color: #527a72; font-size: 9px; }
.payment-reconciliation.has-difference { color: #87540d; background: #fff5e8; border-color: #f2dfbd; }
.payment-reconciliation.has-difference small { color: #87540d; }
.dashboard-footer { display: flex; justify-content: space-between; align-items: center; gap: 14px; margin: 15px 2px 4px; color: var(--safe-muted); font-size: 10px; }
.dashboard-footer a { display: inline-flex; align-items: center; gap: 6px; color: var(--safe-accent); font-size: 11px; font-weight: 650; white-space: nowrap; }
.dashboard-message, .dashboard-error, .dashboard-loading { padding: 18px; background: var(--safe-surface); border: 1px solid var(--safe-line); border-radius: 10px; color: var(--safe-muted); font-size: 12px; }
.dashboard-message h2 { margin: 0 0 5px; color: var(--safe-ink); font-size: 15px; }
.dashboard-message p { margin: 0; }
.dashboard-error { margin: 15px 0; color: #934b32; border-color: #f0d3c7; background: #fff5f1; }
.dashboard-loading { margin: 15px 0; }
@media (max-width: 1100px) { .dashboard-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); } .dashboard-charts { grid-template-columns: minmax(0, 1fr); } }
@media (max-width: 767px) { .sales-dashboard-heading { align-items: flex-start; flex-direction: column; gap: 7px; } .dashboard-updated { padding: 0; } .dashboard-filters { grid-template-columns: repeat(2, minmax(0, 1fr)); } .dashboard-regional { grid-column: 1 / -1; } .dashboard-apply { grid-column: 1 / -1; } .dashboard-chart-card { padding: 16px; } .dashboard-footer { align-items: flex-start; flex-direction: column; } }
@media (max-width: 430px) { .dashboard-metrics { grid-template-columns: 1fr; } .dashboard-metric { padding: 15px; } .dashboard-metric > strong { font-size: 20px; } .dashboard-period { flex-direction: column; } .chart-range-note { display: none; } }
@media (prefers-reduced-motion: reduce) { .sales-dashboard *, .sales-dashboard *::before, .sales-dashboard *::after { transition: none !important; } }
</style>
