<template>
  <AdminTemplate :page="'Estado de cajas'" :modulo="'Reportes y control'">
    <main slot="body" class="operations-page">
      <BasePageHeading
        title="Estado de cajas"
        eyebrow="OPERACIÓN Y FACTURACIÓN"
        icon="chart"
        description="Consulta cada caja, detecta emisiones trabadas y sigue la solución recomendada."
      >
        <div class="heading-actions">
          <label class="date-filter">
            <span>Fecha</span>
            <input v-model="selectedDate" type="date" :disabled="loading" @change="changeDate">
          </label>
          <button class="primary-button" type="button" :disabled="loading" @click="loadReport">
            {{ loading ? 'Actualizando…' : 'Actualizar' }}
          </button>
        </div>
      </BasePageHeading>

      <p v-if="error" class="message message--error" role="alert">{{ error }}</p>
      <p v-if="loading && !dailyReport && !report" class="message message--loading" role="status">
        Consultando cajas e incidencias…
      </p>

      <template v-if="dailyReport || report">
        <section class="summary-grid" aria-label="Resumen diario de cajas">
          <article class="summary-card">
            <span>Cajas del día</span>
            <strong>{{ dailySummary.cajas || 0 }}</strong>
            <small>{{ selectedDate }}</small>
          </article>
          <article class="summary-card summary-card--open">
            <span>Abiertas</span>
            <strong>{{ dailySummary.abiertas || 0 }}</strong>
            <small>Requieren cierre al finalizar operación</small>
          </article>
          <article class="summary-card summary-card--closed">
            <span>Cerradas</span>
            <strong>{{ dailySummary.cerradas || 0 }}</strong>
            <small>Revisa diferencias de efectivo y fichas</small>
          </article>
          <article class="summary-card" :class="incidentCount ? 'summary-card--alert' : 'summary-card--clear'">
            <span>Incidencias registradas</span>
            <strong>{{ incidentCount }}</strong>
            <small>{{ incidentCount ? 'Consulta la solución sugerida abajo' : 'Sin emisiones trabadas ni cajas antiguas abiertas' }}</small>
          </article>
        </section>

        <div class="notice-bar">
          <span>Datos actualizados: {{ dateTime(report?.generadoEn) }}</span>
          <span>Una emisión incierta requiere consulta fiscal antes de reintentar.</span>
        </div>

        <section class="panel-card">
          <div class="section-heading">
            <div>
              <h2>Cajas del día</h2>
              <p>Estado por cajero, sucursal y punto de venta</p>
            </div>
            <label class="search-field">
              <span>Buscar cajero o sucursal</span>
              <input v-model.trim="search" type="search" placeholder="Nombre, sucursal o estado">
            </label>
          </div>

          <div class="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Cajero / sucursal</th>
                  <th>Estado</th>
                  <th>Hora</th>
                  <th>Ventas</th>
                  <th>Cierre esperado</th>
                  <th>Cierre declarado</th>
                  <th>Diferencia</th>
                  <th>Solución sugerida</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="box in filteredBoxes" :key="box.usuarioId + '-' + box.codigoSucursal + '-' + box.puntoVenta">
                  <td>
                    <strong>{{ box.usuarioNombre || 'Sin cajero' }}</strong>
                    <small>{{ branchLabel(box) }} · PV {{ box.puntoVenta || 0 }}</small>
                  </td>
                  <td><span class="status-badge" :class="box.estado === 'ABIERTA' ? 'badge-open' : 'badge-closed'">{{ boxStatus(box.estado) }}</span></td>
                  <td>{{ box.estado === 'CERRADA' ? (box.cerradaEn || '—') : (box.abiertaEn || '—') }}</td>
                  <td>{{ money(box.montoVentas) }}<small>{{ box.cantidadVentas || 0 }} ventas</small></td>
                  <td>{{ money(box.montoCierreEsperado) }}</td>
                  <td>{{ box.estado === 'CERRADA' ? money(box.montoCierreDeclarado) : 'Pendiente' }}</td>
                  <td :class="Number(box.diferencia || 0) ? 'difference-value' : ''">
                    {{ box.estado === 'CERRADA' ? money(box.diferencia) : '—' }}
                    <small v-if="box.estado === 'CERRADA'">Efectivo {{ money(box.diferenciaEfectivo) }} · Fichas {{ money(box.diferenciaFichas) }}</small>
                  </td>
                  <td>{{ boxSolution(box) }}</td>
                </tr>
                <tr v-if="!filteredBoxes.length">
                  <td colspan="8" class="empty-state">No hay cajas registradas para esta fecha o búsqueda.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="panel-card incidents-panel">
          <div class="section-heading">
            <div>
              <h2>Incidencias y solución</h2>
              <p>{{ filteredIncidents.length }} casos activos o con revisión manual pendiente</p>
            </div>
            <label class="search-field">
              <span>Buscar incidencia</span>
              <input v-model.trim="incidentSearch" type="search" placeholder="Cajero, orden o factura">
            </label>
          </div>

          <div class="incident-list">
            <article v-for="row in filteredIncidents" :key="row.tipo + '-' + row.id" class="incident-card">
              <div class="incident-main">
                <div class="incident-title-line">
                  <span class="status-badge" :class="badgeClass(row.tipo)">{{ typeLabel(row.tipo) }}</span>
                  <span class="state-text">{{ row.estadoEmision || row.estadoCaja || row.estadoCarrito }}</span>
                  <span class="time-text">{{ row.fechaOperacion || dateTime(row.actualizadoEn) }} · {{ ageLabel(row.minutosSinCambio) }}</span>
                </div>
                <div class="incident-columns">
                  <div>
                    <strong>{{ row.usuario || 'Sin usuario' }}</strong>
                    <small>{{ row.sucursal }} · PV {{ row.puntoVenta || 0 }} · Caja {{ row.cajaId ? '#' + row.cajaId : 'sin caja hoy' }}</small>
                  </div>
                  <div>
                    <strong>{{ row.codigoOrden || ('Caja #' + row.cajaId) }}</strong>
                    <small v-if="row.numeroFactura">Factura {{ row.numeroFactura }}</small>
                    <small v-else-if="row.codigoSeguimiento">Seguimiento {{ row.codigoSeguimiento }}</small>
                    <small v-else>Sin factura ni seguimiento fiscal</small>
                  </div>
                  <div>
                    <strong>{{ money(row.total) }}</strong>
                    <small>{{ paymentLabel(row) }} · {{ row.estadoPago || 'Pago sin estado' }}</small>
                  </div>
                </div>
                <p v-if="row.mensaje" class="incident-message">{{ row.mensaje }}</p>
                <details v-if="row.items && row.items.length" class="item-details">
                  <summary>Ver {{ row.items.length }} artículo(s)</summary>
                  <ul><li v-for="item in row.items" :key="item.codigo + item.detalle">{{ item.codigo }} · {{ item.detalle }} — {{ money(item.total) }}</li></ul>
                </details>
              </div>
              <aside class="solution-box">
                <strong>Qué hacer</strong>
                <p>{{ solution(row) }}</p>
                <button
                  v-if="row.puedeLiberar && canWriteSales"
                  class="resolve-button"
                  type="button"
                  :disabled="busyCartId === row.cartId"
                  @click="releaseCart(row)"
                >
                  {{ busyCartId === row.cartId ? 'Liberando…' : 'Liberar para reintentar' }}
                </button>
                <nuxt-link v-else-if="row.tipo === 'CAJA_ANTERIOR_ABIERTA'" class="text-link" to="/cajero/ventas/lista">
                  Abrir control de cierre
                </nuxt-link>
                <nuxt-link v-else-if="row.tipo === 'EMISION_REQUIERE_REVISION'" class="text-link" to="/cajero/ventas/protocolo">
                  Abrir protocolo fiscal
                </nuxt-link>
                <span v-else-if="row.puedeLiberar && !canWriteSales" class="permission-hint">Requiere permiso ventas.write</span>
              </aside>
            </article>
            <div v-if="!filteredIncidents.length" class="empty-state incident-empty">No hay incidencias para esta búsqueda.</div>
          </div>
        </section>
      </template>
    </main>
  </AdminTemplate>
</template>

<script>
const SUCURSALES_POR_CODIGO = {
  0: 'LA PAZ',
  1: 'SANTA CRUZ DE LA SIERRA',
  2: 'COCHABAMBA',
  3: 'ORURO',
  4: 'POTOSI',
  5: 'SUCRE',
  6: 'TARIJA',
  7: 'COBIJA',
  8: 'TRINIDAD',
  10: 'EL ALTO'
};

export default {
  data() {
    return {
      loading: false,
      error: '',
      report: null,
      dailyReport: null,
      selectedDate: this.today(),
      search: '',
      incidentSearch: '',
      busyCartId: null,
      timer: null
    };
  },
  computed: {
    dailySummary() { return this.dailyReport?.resumen || {}; },
    canWriteSales() { return (this.$store?.state?.auth?.permissions || []).includes('ventas.write'); },
    incidentCount() {
      return (this.report?.incidencias || []).length;
    },
    filteredBoxes() {
      const query = this.search.toLocaleLowerCase();
      const rows = this.dailyReport?.porCajero || [];
      if (!query) return rows;
      return rows.filter((row) => [row.usuarioNombre, this.branchLabel(row), row.estado, row.puntoVenta]
        .some((value) => String(value || '').toLocaleLowerCase().includes(query)));
    },
    filteredIncidents() {
      const query = this.incidentSearch.toLocaleLowerCase();
      const rows = this.report?.incidencias || [];
      if (!query) return rows;
      return rows.filter((row) => [row.usuario, row.sucursal, row.codigoOrden, row.numeroFactura, row.mensaje, row.tipo, row.estadoPago]
        .some((value) => String(value || '').toLocaleLowerCase().includes(query)));
    }
  },
  mounted() {
    this.loadReport();
    this.timer = window.setInterval(() => this.loadReport(), 60000);
  },
  beforeDestroy() {
    if (this.timer) window.clearInterval(this.timer);
  },
  methods: {
    today() {
      const date = new Date();
      return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
    },
    changeDate() {
      this.dailyReport = null;
      return this.loadReport();
    },
    async loadReport() {
      if (this.loading) return;
      this.loading = true;
      this.error = '';
      try {
        const date = encodeURIComponent(this.selectedDate || this.today());
        const [incidentsResult, dailyResult] = await Promise.allSettled([
          this.$admin.$get('caja/bloqueadas?minutos=5'),
          this.$admin.$get(`caja/reporte-diario?fecha=${date}`)
        ]);
        const errors = [];

        if (incidentsResult.status === 'fulfilled') {
          this.report = incidentsResult.value;
        } else {
          errors.push(this.requestError('Incidencias', 'caja/bloqueadas', incidentsResult.reason));
        }

        if (dailyResult.status === 'fulfilled') {
          this.dailyReport = dailyResult.value;
        } else {
          errors.push(this.requestError('Cajas del día', 'caja/reporte-diario', dailyResult.reason));
        }

        this.error = errors.join(' ');
      } finally {
        this.loading = false;
      }
    },
    requestError(label, endpoint, error) {
      const timeoutMs = Number(this.$admin?.defaults?.timeout || 20000);
      let detail = 'sin respuesta del servidor (red o CORS)';

      if (error?.code === 'ECONNABORTED' || /timeout/i.test(error?.message || '')) {
        detail = `superó el tiempo de espera de ${Math.ceil(timeoutMs / 1000)} segundos`;
      } else if (error?.response?.status === 401) {
        detail = 'la sesión venció (HTTP 401)';
      } else if (error?.response?.status === 403) {
        detail = 'falta el permiso ventas.read (HTTP 403)';
      } else if (error?.response?.status) {
        detail = `el servidor respondió HTTP ${error.response.status}`;
      }

      return `${label} (${endpoint}): ${detail}.`;
    },
    async releaseCart(row) {
      if (!row?.cartId || !row.puedeLiberar || !this.canWriteSales) return;
      const confirmation = await this.$swal.fire({
        title: 'Liberar borrador',
        text: `Se verificó que ${row.codigoOrden || 'este carrito'} no tiene factura ni pago QR activo. Se devolverá a borrador para permitir un nuevo intento.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Liberar',
        cancelButtonText: 'Volver',
        confirmButtonColor: '#16745d'
      });
      if (!confirmation.isConfirmed) return;
      this.busyCartId = row.cartId;
      try {
        const response = await this.$admin.$post(`caja/bloqueadas/${row.cartId}/liberar`, {
          nota: 'Liberación solicitada desde el panel Estado de cajas.'
        });
        await this.$swal.fire('Borrador liberado', response?.message || 'Ya se puede reintentar desde la caja.', 'success');
        await this.loadReport();
      } catch (error) {
        const message = error.response?.data?.message || error.response?.data?.error || 'No se pudo liberar. Consulta el estado fiscal o QR antes de reintentar.';
        await this.$swal.fire('No se liberó', message, 'error');
        await this.loadReport();
      } finally {
        this.busyCartId = null;
      }
    },
    money(value) { return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(Number(value || 0)); },
    dateTime(value) { return String(value || '—').replace('T', ' ').slice(0, 19); },
    branchLabel(row) {
      const name = String(row?.sucursal || row?.sucursalNombre || '').trim();
      if (name) return name;

      const rawCode = row?.codigoSucursal;
      if (rawCode === null || rawCode === undefined || String(rawCode).trim() === '') {
        return 'Sin sucursal';
      }

      const code = Number(rawCode);
      return SUCURSALES_POR_CODIGO[code] || `Sucursal ${rawCode}`;
    },
    boxStatus(status) { return status === 'ABIERTA' ? 'Abierta' : status === 'CERRADA' ? 'Cerrada' : (status || 'Sin estado'); },
    boxSolution(box) {
      if (box.estado === 'ABIERTA') return 'Al terminar el turno, registra el cierre y concilia efectivo, QR y fichas.';
      if (Math.abs(Number(box.diferencia || 0)) >= 0.01) return 'Revisa el arqueo y deja una observación por la diferencia.';
      return 'Cierre registrado sin diferencia.';
    },
    ageLabel(minutes) {
      const total = Math.max(0, Number(minutes || 0));
      if (total < 60) return `hace ${total} min`;
      const hours = Math.floor(total / 60);
      const days = Math.floor(hours / 24);
      return days ? `hace ${days} d ${hours % 24} h` : `hace ${hours} h ${total % 60} min`;
    },
    paymentLabel(row) {
      const method = String(row.metodoPago || '').toLowerCase();
      return method === 'qr' ? 'QR' : method === 'efectivo' ? 'Efectivo' : 'Pago';
    },
    solution(row) {
      if (row.solucion) return row.solucion;
      if (row.tipo === 'CAJA_ANTERIOR_ABIERTA') return 'Revisa el arqueo del día y coordina el cierre con el cajero o supervisor.';
      if (row.tipo === 'EMISION_ATASCADA') return row.puedeLiberar
        ? 'No hay factura ni pago QR vinculado. Libera el borrador para que el cajero pueda reintentar.'
        : 'Consulta el estado fiscal o QR. No reemitas mientras haya una referencia activa.';
      if (row.tipo === 'EMISION_REQUIERE_REVISION') return 'Consulta el seguimiento fiscal en el protocolo antes de volver a emitir.';
      if (row.tipo === 'NO_CONSOLIDADA') return 'Confirma que no hubo cobro. Si no existe pago ni factura, se puede volver a intentar desde el carrito.';
      return 'Verifica el comprobante y concilia el pago antes de cerrar la incidencia.';
    },
    typeLabel(type) {
      return ({
        EMISION_ATASCADA: 'Emisión atascada',
        EMISION_REQUIERE_REVISION: 'Revisión fiscal',
        FACTURA_MANUAL: 'Revisión manual',
        NO_CONSOLIDADA: 'No consolidada',
        CAJA_ANTERIOR_ABIERTA: 'Caja anterior abierta'
      })[type] || type;
    },
    badgeClass(type) {
      if (type === 'EMISION_ATASCADA' || type === 'CAJA_ANTERIOR_ABIERTA') return 'badge-danger';
      if (type === 'NO_CONSOLIDADA') return 'badge-neutral';
      if (type === 'FACTURA_MANUAL') return 'badge-manual';
      return 'badge-warning';
    }
  }
};
</script>

<style scoped>
.operations-page{max-width:1680px;margin:auto;padding:20px 10px;color:#19334a}.heading-actions{display:flex;align-items:flex-end;gap:10px}.date-filter,.search-field{display:flex;flex-direction:column;gap:5px;font-size:11px;font-weight:700;color:#52687a}.date-filter input,.search-field input{height:38px;padding:8px 11px;border:1px solid #cedee8;border-radius:8px;background:#fff;color:#19334a}.primary-button,.resolve-button{border:0;border-radius:9px;padding:10px 15px;background:#144d7c;color:#fff;font-weight:700;cursor:pointer}.primary-button:disabled,.resolve-button:disabled{opacity:.6;cursor:wait}.summary-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin:22px 0}.summary-card{display:flex;flex-direction:column;gap:8px;padding:18px;border:1px solid #dde7ee;border-radius:13px;background:#fff}.summary-card span{font-size:13px;color:#52687a}.summary-card strong{font-size:28px;color:#19334a}.summary-card small,.table-scroll small,.incident-card small{font-size:11px;line-height:1.45;color:#667c8e}.summary-card--open{border-color:#f1d7a1;background:#fffcf4}.summary-card--closed,.summary-card--clear{border-color:#cde8dc;background:#f8fcfa}.summary-card--alert{border-color:#f0c5c5;background:#fff9f9}.notice-bar{display:flex;justify-content:space-between;gap:12px;padding:12px 15px;margin-bottom:17px;border:1px solid #d7e7ee;border-radius:10px;background:#f5fafc;color:#426174;font-size:12px}.panel-card{margin:16px 0;overflow:hidden;border:1px solid #dde7ee;border-radius:14px;background:#fff}.section-heading{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;padding:18px 20px;border-bottom:1px solid #e5edf1}.section-heading h2{margin:0;font-size:18px}.section-heading p{margin:5px 0 0;color:#63778a;font-size:12px}.search-field input{width:260px}.table-scroll{overflow:auto}table{width:100%;min-width:1000px;border-collapse:collapse;font-size:12px}th,td{padding:13px 14px;text-align:left;vertical-align:top;border-bottom:1px solid #e8eef2}thead{background:#f5f8fb;color:#435d71}tbody tr:hover{background:#fbfdfe}td small{display:block;margin-top:4px;max-width:280px;white-space:normal;overflow-wrap:anywhere}.status-badge{display:inline-block;padding:5px 9px;border-radius:20px;font-size:10px;font-weight:800;white-space:nowrap}.badge-open{background:#fff0d3;color:#855400}.badge-closed,.badge-manual{background:#e5f5ed;color:#17654c}.badge-danger{background:#ffeded;color:#a33333}.badge-warning{background:#fff4dc;color:#8a5d00}.badge-neutral{background:#edf3f7;color:#4c6476}.difference-value{font-weight:800;color:#9b3d30}.incident-list{display:grid;gap:12px;padding:14px}.incident-card{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:16px;padding:16px;border:1px solid #e0e9ef;border-radius:12px;background:#fff}.incident-title-line{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.state-text,.time-text{font-size:11px;color:#62788b}.incident-columns{display:grid;grid-template-columns:1.2fr 1fr .7fr;gap:14px;margin-top:13px}.incident-columns strong{display:block;font-size:13px}.incident-columns small{display:block;margin-top:4px}.incident-message{margin:12px 0 0;color:#52687a;font-size:12px;overflow-wrap:anywhere}.solution-box{align-self:stretch;padding:13px;border:1px solid #d9e8ee;border-radius:10px;background:#f6fafc}.solution-box strong{font-size:12px;color:#254a61}.solution-box p{margin:7px 0 12px;font-size:12px;line-height:1.5;color:#52687a}.resolve-button{padding:9px 12px;background:#16745d;font-size:12px}.text-link{font-size:12px;font-weight:700;color:#145b8e}.permission-hint{font-size:11px;color:#8a5d00}.item-details{margin-top:12px;font-size:12px;color:#52687a}.item-details summary{cursor:pointer;font-weight:700}.item-details ul{margin:8px 0 0;padding-left:18px}.empty-state{text-align:center!important;padding:28px;color:#657a8b}.incident-empty{border:1px dashed #cedee8;border-radius:10px}.message{padding:13px;border-radius:9px}.message--error{background:#fff0f0;color:#a22}.message--loading{color:#52687a}.notice-bar span:first-child{white-space:nowrap}@media(max-width:1050px){.summary-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.incident-card{grid-template-columns:1fr}.solution-box{display:block}.section-heading{align-items:flex-start;flex-direction:column}.notice-bar{align-items:flex-start;flex-direction:column}.search-field,.search-field input{width:100%}}@media(max-width:600px){.operations-page{padding:12px 0}.heading-actions{width:100%;align-items:flex-end}.date-filter{flex:1}.date-filter input{width:100%}.summary-grid{grid-template-columns:1fr}.summary-card{padding:15px}.incident-columns{grid-template-columns:1fr;gap:10px}.incident-title-line{align-items:flex-start}.incident-list{padding:9px}.incident-card{padding:12px}}
</style>
