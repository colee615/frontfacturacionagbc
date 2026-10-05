<template>
  <AdminTemplate :page="'Auditoría financiera'" :modulo="'Reportes y control'">
    <main slot="body" class="audit-page">
      <header class="audit-heading">
        <div><p class="eyebrow">REPORTES Y CONTROL</p><h1>Auditoría financiera</h1><p>Comprueba qué suma, qué se excluye y dónde hay diferencias.</p></div>
        <div class="actions"><button :disabled="!report || loading || exporting" @click="exportExcel">Exportar Excel</button><button :disabled="!report || loading || exporting" @click="exportPdf">Exportar PDF</button></div>
      </header>
      <form class="filters" @submit.prevent="loadReport">
        <label>Desde<input v-model="filters.fechaInicio" type="date" /></label>
        <label>Hasta<input v-model="filters.fechaFin" type="date" /></label>
        <label>Regional<select v-model="filters.codigoSucursal"><option value="">Todas las regionales</option><option v-for="r in regionales" :key="r.codigo" :value="r.codigo">{{ r.nombre }}</option></select></label>
        <button class="primary" :disabled="loading">{{ loading ? 'Consultando…' : 'Consultar' }}</button>
      </form>
      <p v-if="error" role="alert" class="error">{{ error }}</p>
      <p v-if="loading" role="status">Calculando las operaciones del período…</p>
      <template v-if="report && !loading && !error">
        <div class="scope"><span>{{ periodLabel }} · BOB · {{ formatDate(report.generadoEn) }}</span><nuxt-link :to="{path:'/cajero/ventas/servicios',query:appliedFilters}">Comparar con servicios →</nuxt-link></div>
        <section class="metrics" aria-label="Totales del período">
          <article class="metric main"><span>Total vendido</span><strong>{{ money(summary.totalVendido) }}</strong><small>{{ summary.facturadas }} facturas incluidas</small></article>
          <article class="metric"><span>Efectivo facturado</span><strong>{{ money(summary.totalEfectivoFacturado) }}</strong><small>Aporta al total vendido</small></article>
          <article class="metric"><span>QR facturado y pagado</span><strong>{{ money(summary.totalQrFacturado) }}</strong><small>Pago confirmado, factura vigente</small></article>
          <article class="metric"><span>Facturas anuladas</span><strong>{{ money(summary.totalFacturasAnuladas) }}</strong><small>{{ summary.facturasAnuladas }} registros · excluidos</small></article>
        </section>
        <section class="reconciliation" :class="{warning: summary.diferenciaMediosPago !== 0}">
          <div><h2>{{ summary.diferenciaMediosPago === 0 ? 'El desglose del total coincide' : 'Hay una diferencia en el desglose' }}</h2><p>Efectivo + QR facturado = total vendido. Diferencia: <strong>{{ money(summary.diferenciaMediosPago) }}</strong>.</p></div>
          <span class="badge">{{ report.meta.cantidadIncidencias }} operaciones para revisar</span>
        </section>
        <section class="excluded"><h2>Fuera del total vendido</h2><div class="excluded-grid">
          <div><span>QR cancelado / fallido</span><strong>{{ money(summary.totalQrCancelado) }}</strong></div>
          <div><span>QR sin pago confirmado</span><strong>{{ money(summary.totalQrPendiente) }}</strong></div>
          <div><span>QR pagado sin factura vigente*</span><strong>{{ money(summary.totalQrPagadoPendienteFactura) }}</strong></div>
          <div><span>Contratos vigentes</span><strong>{{ money(summary.totalContratosNoSumados) }}</strong></div>
          <div><span>ECA vigente</span><strong>{{ money(summary.totalEcaFacturado) }}</strong></div>
          <div><span>Registros oficiales</span><strong>{{ money(summary.totalOficial) }}</strong></div>
        </div><p>*Los cobros vinculados solo a facturas anuladas se identifican en incidencias. Un estado fiscal anulado no demuestra una devolución. Estas categorías pueden coincidir sobre la misma operación; no deben sumarse entre sí.</p></section>
        <section class="audit-results">
          <nav class="tabs" aria-label="Desglose del reporte"><button v-for="tab in tabs" :key="tab.key" :class="{active:activeTab===tab.key}" :aria-pressed="activeTab===tab.key" @click="activeTab=tab.key">{{ tab.label }}</button></nav>
          <div class="table-wrap" v-if="activeTab!=='incidencias'">
            <table><caption>{{ currentTabLabel }} · {{ periodLabel }}</caption><thead><tr><th>{{ activeTab==='regionales' ? 'Regional / PV' : activeTab==='dias' ? 'Fecha' : 'Cajero / regional' }}</th><th>Facturas incluidas</th><th>Efectivo</th><th>QR confirmado</th><th>Total vendido</th><th>Anuladas (excluido)</th><th>Otros excluidos</th></tr></thead>
              <tbody><tr v-for="(row,index) in tableRows" :key="index"><th scope="row">{{ rowLabel(row) }}</th><td>{{ row.facturadas }}</td><td>{{ money(row.totalEfectivoFacturado) }}</td><td>{{ money(row.totalQrFacturado) }}</td><td class="strong">{{ money(row.totalVendido) }}</td><td>{{ money(row.totalFacturasAnuladas) }}</td><td>{{ money(row.totalNoIncluido-row.totalFacturasAnuladas) }}</td></tr><tr v-if="!tableRows.length"><td colspan="7">Sin operaciones para estos filtros.</td></tr></tbody>
              <tfoot><tr><th>Total</th><td>{{ summary.facturadas }}</td><td>{{ money(summary.totalEfectivoFacturado) }}</td><td>{{ money(summary.totalQrFacturado) }}</td><td>{{ money(summary.totalVendido) }}</td><td>{{ money(summary.totalFacturasAnuladas) }}</td><td>{{ money(summary.totalNoIncluido-summary.totalFacturasAnuladas) }}</td></tr></tfoot></table>
          </div>
          <div v-else>
            <p class="table-note">Se muestran {{ report.incidencias.length }} de {{ report.meta.cantidadIncidencias }} operaciones observadas. {{ report.meta.incidenciasTruncadas ? 'El detalle está limitado; filtra por regional o por un período menor.' : '' }}</p>
            <div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Regional / PV</th><th>Factura / orden</th><th>Estado fiscal</th><th>Pago</th><th>Importe</th><th>Revisar</th></tr></thead><tbody><tr v-for="(row,index) in report.incidencias" :key="index"><td>{{ formatDate(row.fecha) }}</td><td>{{ branchName(row.sucursal) }}</td><td>{{ row.numeroFactura || 'Sin número' }}<small>{{ row.codigoOrden }}</small></td><td>{{ row.financiero.estadoFiscal }}</td><td>{{ row.financiero.medioPago }} · {{ row.financiero.estadoPago }}</td><td>{{ money(row.total) }}</td><td><span v-for="reason in row.motivos" :key="reason" class="reason">{{ reasonLabel(reason) }}</span></td></tr><tr v-if="!report.incidencias.length"><td colspan="7">No se detectaron incidencias con las reglas revisadas.</td></tr></tbody></table></div>
          </div>
        </section>
        <footer class="audit-footnote"><strong>Cómo leer este reporte</strong><p>{{ report.meta.criterio }}</p><p>{{ report.alcance }} La coincidencia de totales verifica las reglas del sistema; la conciliación bancaria requiere los extractos y las devoluciones efectivas. Los importes de registros anulados representan intentos fiscales, no cobros adicionales.</p></footer>
      </template>
    </main>
  </AdminTemplate>
</template>

<script>
export default {
  data() { return { loading:false, exporting:false, error:'', report:null, appliedFilters:{}, requestId:0, activeTab:'regionales',
    filters:{fechaInicio:'',fechaFin:'',codigoSucursal:''}, regionales:[],
    tabs:[{key:'regionales',label:'Por regional'},{key:'dias',label:'Por día'},{key:'usuarios',label:'Por cajero'},{key:'incidencias',label:'Incidencias'}] }; },
  computed: {
    summary() { return this.report?.resumen || {}; },
    periodLabel() { return `${this.appliedFilters.fechaInicio || 'Inicio de registros'} — ${this.appliedFilters.fechaFin || 'Último registro'}`; },
    tableRows() { return this.activeTab==='dias' ? this.report.porFecha : this.activeTab==='usuarios' ? this.report.porUsuarios : this.report.sucursales; },
    currentTabLabel() { return this.tabs.find(t=>t.key===this.activeTab)?.label || ''; }
  },
  mounted() { Object.keys(this.filters).forEach(k=>{if(this.$route.query[k]!=null)this.filters[k]=this.$route.query[k];}); this.loadReport(); },
  methods: {
    money(value) { return new Intl.NumberFormat('es-BO',{style:'currency',currency:'BOB'}).format(Number(value||0)); },
    formatDate(value) { return String(value||'—').replace('T',' ').slice(0,19); },
    branchName(row={}) { return `${row.departamento || row.nombre || row.codigoSucursal || 'Regional 0'} / PV ${row.puntoVenta || 0}`; },
    rowLabel(row) { return this.activeTab==='dias' ? row.fecha : this.activeTab==='usuarios' ? `${row.usuario?.nombre || 'Sin usuario'} · ${this.branchName(row.sucursal)}` : this.branchName(row); },
    reasonLabel(code) { return ({DIFERENCIA_CABECERA_DETALLE:'Cabecera y detalle tienen distintos importes',SIN_DETALLE:'Sin detalle de servicios',FACTURA_VIGENTE_PAGO_CANCELADO:'Factura vigente con pago cancelado',FACTURA_VIGENTE_PAGO_PENDIENTE:'Factura vigente sin pago confirmado',PAGO_SIN_EVIDENCIA:'Falta evidencia del pago',COBRO_SIN_FACTURA_VIGENTE:'Cobro sin factura vigente',CUF_VIGENTE_DUPLICADO:'CUF vigente repetido',QR_COMPARTIDO_ENTRE_FACTURAS_VIGENTES:'Varias facturas vigentes usan el mismo QR',QR_PAGADO_SOLO_FACTURAS_ANULADAS:'QR pagado vinculado solo a facturas anuladas'})[code] || code; },
    async loadReport() {
      const id=++this.requestId; this.loading=true;this.error='';
      const filters={...this.filters};
      try {
        if(filters.fechaInicio && filters.fechaFin && filters.fechaInicio>filters.fechaFin)throw new Error('La fecha inicial debe ser anterior a la final.');
        const params=new URLSearchParams();Object.entries(filters).forEach(([k,v])=>{if(v!=='')params.set(k,v);});params.set('limite','500');
        const report=await this.$admin.$get(`ventas/reportes/auditoria-financiera?${params}`);
        if(id!==this.requestId)return;
        this.report=report;this.appliedFilters=filters;
        if(filters.codigoSucursal==='')this.regionales=report.sucursales.map(r=>({codigo:r.codigoSucursal,nombre:r.nombre}));
      } catch(error){if(id===this.requestId)this.error=error.response?.data?.message || error.message || 'No se pudo cargar la auditoría.';}
      finally{if(id===this.requestId)this.loading=false;}
    },
    exportRows(rows,label) { return rows.map(r=>[label(r),r.facturadas,r.totalEfectivoFacturado,r.totalQrFacturado,r.totalVendido,r.totalFacturasAnuladas,r.totalNoIncluido-r.totalFacturasAnuladas]); },
    async exportExcel() {
      this.exporting=true;
      try {
        const ExcelJS=(await import('exceljs')).default;const {saveAs}=await import('file-saver');const workbook=new ExcelJS.Workbook();
        const criteria=workbook.addWorksheet('Criterios');criteria.addRows([['Auditoría financiera'],['Período',this.periodLabel],['Generado',this.report.generadoEn],['Criterio',this.report.meta.criterio],['Alcance',this.report.alcance],['Incidencias',this.report.meta.cantidadIncidencias],['Detalle limitado',this.report.meta.incidenciasTruncadas?'Sí':'No']]);criteria.columns=[{width:25},{width:110}];
        for(const [name,rows,label] of [['Regionales',this.report.sucursales,r=>this.branchName(r)],['Por día',this.report.porFecha,r=>r.fecha],['Por cajero',this.report.porUsuarios,r=>`${r.usuario?.nombre || 'Sin usuario'} / ${this.branchName(r.sucursal)}`]]) {
          const sheet=workbook.addWorksheet(name);sheet.addRow([name,'Facturas incluidas','Efectivo','QR confirmado','Total vendido','Anuladas excluidas','Otros excluidos']);sheet.addRows(this.exportRows(rows,label));sheet.columns=[{width:48},...Array.from({length:6},()=>({width:22}))];sheet.getRow(1).font={bold:true};sheet.views=[{state:'frozen',ySplit:1}];for(let i=3;i<=7;i++)sheet.getColumn(i).numFmt='#,##0.00';
        }
        const issues=workbook.addWorksheet('Incidencias');issues.addRow(['Factura','Orden','Fecha','Regional','Estado fiscal','Estado pago','Importe','Motivos']);this.report.incidencias.forEach(r=>issues.addRow([r.numeroFactura,r.codigoOrden,r.fecha,this.branchName(r.sucursal),r.financiero.estadoFiscal,r.financiero.estadoPago,r.total,r.motivos.map(this.reasonLabel).join('; ')]));issues.columns=Array.from({length:8},()=>({width:28}));issues.getColumn(7).numFmt='#,##0.00';
        saveAs(new Blob([await workbook.xlsx.writeBuffer()]),'auditoria-financiera.xlsx');
      }catch(error){this.error='No se pudo exportar Excel: '+error.message;}finally{this.exporting=false;}
    },
    async exportPdf() {
      this.exporting=true;
      try {
        const {default:jsPDF}=await import('jspdf');const {default:autoTable}=await import('jspdf-autotable');const pdf=new jsPDF({orientation:'landscape'});
        pdf.setFontSize(18);pdf.text('Auditoría financiera',14,18);pdf.setFontSize(10);pdf.text(this.periodLabel+' · BOB',14,26);
        autoTable(pdf,{startY:33,head:[['Regional / PV','Facturas','Efectivo','QR confirmado','Total vendido','Anuladas excluidas','Otros excluidos']],body:this.exportRows(this.report.sucursales,r=>this.branchName(r)).map(r=>r.map((v,i)=>i>1?this.money(v):v)),foot:[['Total',this.summary.facturadas,...['totalEfectivoFacturado','totalQrFacturado','totalVendido','totalFacturasAnuladas'].map(k=>this.money(this.summary[k])),this.money(this.summary.totalNoIncluido-this.summary.totalFacturasAnuladas)]],styles:{fontSize:8},headStyles:{fillColor:[0,117,125]}});
        pdf.setFontSize(9);pdf.text(pdf.splitTextToSize(this.report.meta.criterio+' '+this.report.alcance,265),14,pdf.lastAutoTable.finalY+12);pdf.save('auditoria-financiera.pdf');
      }catch(error){this.error='No se pudo exportar PDF: '+error.message;}finally{this.exporting=false;}
    }
  }
};
</script>

<style scoped>
.audit-page{max-width:1600px;margin:auto;padding:22px 10px;color:#19334a}.audit-heading{display:flex;justify-content:space-between;gap:24px;align-items:center;margin-bottom:24px}.eyebrow{font-size:11px;letter-spacing:2px;color:#527083;font-weight:700}h1{font-size:30px;letter-spacing:-.7px;margin:6px 0}h2{font-size:17px;margin:0 0 8px}p{color:#5b6e80;margin:8px 0;line-height:1.6}.actions{display:flex;gap:10px}button{border:1px solid #cbdce4;background:white;border-radius:9px;padding:11px 17px;color:#19334a;font-weight:600;cursor:pointer}button:disabled{opacity:.55;cursor:wait}button:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #25b4be;outline-offset:2px}.primary{background:#007d86;color:white;border-color:#007d86}.filters{display:grid;grid-template-columns:1fr 1fr 1.4fr auto;gap:16px;background:white;padding:22px;border:1px solid #e0e8ee;border-radius:14px;align-items:end}.filters label{display:flex;flex-direction:column;gap:7px;font-size:12px;font-weight:600}input,select{min-width:0;width:100%;height:42px;border:1px solid #cedee8;border-radius:8px;padding:8px;background:white;color:#19334a}.scope{display:flex;justify-content:space-between;margin:20px 0;font-size:12px;color:#5b6e80}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}.metric{border:1px solid #dde7ee;border-radius:14px;background:white;padding:23px;display:flex;flex-direction:column;gap:12px}.metric span{font-size:13px}.metric strong{font-size:25px;letter-spacing:-.4px}.metric small{font-size:11px;color:#5b6e80}.metric.main{background:#006f78;color:white}.metric.main small{color:#ceeef1}.reconciliation{display:flex;align-items:center;justify-content:space-between;gap:20px;background:#edf8f4;border:1px solid #cce9dd;border-radius:12px;padding:20px;margin:20px 0}.badge{border-radius:20px;background:white;padding:10px 14px;font-size:12px;white-space:nowrap}.warning,.error{background:#fff3e6;color:#864805}.error{padding:15px;border-radius:10px}.excluded{padding:22px;background:white;border:1px solid #dde7ee;border-radius:14px}.excluded-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin:18px 0}.excluded-grid div{display:flex;flex-direction:column;gap:9px}.excluded-grid span,.excluded p{font-size:12px}.excluded-grid strong{font-size:18px}.audit-results{margin-top:24px;background:white;border:1px solid #dde7ee;border-radius:14px;overflow:hidden}.tabs{display:flex;gap:6px;padding:16px;border-bottom:1px solid #e1eaf0;overflow:auto}.tabs button{border:0;background:transparent;white-space:nowrap}.tabs button.active{background:#e7f5f5;color:#006f78}.table-wrap{overflow:auto}table{border-collapse:collapse;width:100%;font-size:12px;white-space:nowrap}caption{text-align:left;padding:14px;color:#5b6e80;caption-side:top}th,td{padding:15px;border-bottom:1px solid #e7edf2;text-align:right}th:first-child,td:first-child{text-align:left}thead{background:#f5f8fb}tbody th{text-align:left;font-weight:500}tfoot{background:#edf6f7;font-weight:700}.strong{font-weight:700}td small{display:block;color:#63778a;margin-top:6px}.reason{display:block;color:#8c5a10;white-space:normal;text-align:left;min-width:220px;margin:4px 0}.table-note{padding:0 16px;font-size:12px}.audit-footnote{padding:22px 4px;font-size:12px}.audit-footnote p{max-width:1050px}@media(max-width:1000px){.metrics{grid-template-columns:repeat(2,1fr)}.filters{grid-template-columns:1fr 1fr}.audit-heading{align-items:flex-start;flex-direction:column}}@media(max-width:600px){.metrics,.excluded-grid,.filters{grid-template-columns:1fr}.scope,.reconciliation{flex-direction:column;align-items:flex-start;gap:10px}.metric strong{font-size:23px}.audit-page{padding:12px 0}h1{font-size:25px}}
</style>
