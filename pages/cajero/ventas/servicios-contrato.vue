<template>
  <div>
    <JcLoader :load="load" />
    <AdminTemplate :page="page" :modulo="modulo">
      <div slot="body" class="service-report-page">
        <div class="service-report-shell">
          <section class="service-hero-card">
            <div class="service-hero-copy">
              <p class="service-kicker">Kardex</p>
              <h1>Servicios contrato por cliente</h1>
              <p>
                Consolidado exclusivo de servicios contrato. Se agrupa por <b>NIT</b> y <b>raz&oacute;n social</b> para ver
                cu&aacute;nto se vendi&oacute; a cada cliente.
              </p>
            </div>

            <div class="service-toolbar">
              <label class="service-field service-field-search">
                <span>Buscar cliente</span>
                <input v-model.trim="searchTerm" type="text" placeholder="NIT, raz&oacute;n social o servicio..." />
              </label>

              <label class="service-field">
                <span>M&aacute;ximo filas</span>
                <select v-model.number="filters.limite">
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                  <option :value="200">200</option>
                  <option :value="500">500</option>
                </select>
              </label>

              <div class="service-toolbar-actions">
                <button
                  type="button"
                  class="service-btn service-btn-secondary"
                  :disabled="pdfLoading || load || !filteredClients.length"
                  @click="downloadContractReportPdf"
                >
                  <i class="fas fa-file-pdf"></i>
                  <span>{{ pdfLoading ? 'Generando...' : 'Exportar PDF' }}</span>
                </button>
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
                  <span>Clientes</span>
                  <strong>{{ summary.cantidadClientes }}</strong>
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
                    <h3>Clientes agrupados</h3>
                    <p>{{ filteredClients.length }} resultado(s) visibles</p>
                  </div>
                </div>

                <div v-if="!filteredClients.length" class="service-empty-state">
                  <h3>Sin resultados</h3>
                  <p>No encontramos servicios contrato para el texto buscado.</p>
                </div>

                <div v-else class="service-table-wrap">
                  <table class="service-table">
                    <thead>
                      <tr>
                        <th>NIT / Raz&oacute;n social</th>
                        <th>Servicios</th>
                        <th>Total</th>
                        <th>Cantidad</th>
                        <th>Ventas</th>
                        <th>Detalles</th>
                        <th>&Uacute;ltima venta</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in filteredClients" :key="`${item.nit}-${item.razonSocial}`">
                        <td>
                          <button type="button" class="service-name-cell service-name-button" @click="openClientModal(item)">
                            <strong>{{ item.razonSocial || 'Sin raz&oacute;n social' }}</strong>
                            <small>NIT: {{ item.nit || 'Sin NIT' }}</small>
                          </button>
                        </td>
                        <td>
                          <span class="contract-service-list">{{ item.servicioMuestra || '-' }}</span>
                        </td>
                        <td class="service-amount">{{ formatCurrency(item.totalMonto) }}</td>
                        <td>{{ formatNumber(item.totalCantidad) }}</td>
                        <td>{{ item.cantidadVentas }}</td>
                        <td>{{ item.cantidadDetalles }}</td>
                        <td>{{ formatDateTime(item.ultimaFecha) }}</td>
                        <td>
                          <button
                            type="button"
                            class="service-btn service-btn-secondary service-btn-inline"
                            :disabled="pdfLoading"
                            @click="downloadSingleCompanyPdf(item)"
                          >
                            <i class="fas fa-file-pdf"></i>
                            <span>{{ pdfLoading ? 'Generando...' : 'PDF empresa' }}</span>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <div v-if="activeClient" class="service-modal-backdrop" @click.self="closeClientModal">
                <div class="service-modal-card">
                  <div class="service-table-head">
                    <div>
                      <h3>{{ activeClient.razonSocial || 'Sin raz&oacute;n social' }}</h3>
                      <p>NIT: {{ activeClient.nit || 'Sin NIT' }} &middot; {{ activeClient.cantidadDetalles }} detalle(s) de contrato.</p>
                    </div>
                    <button type="button" class="service-btn service-btn-secondary" @click="closeClientModal">
                      Cerrar
                    </button>
                  </div>

                  <div class="service-table-wrap">
                    <table class="service-table">
                      <thead>
                        <tr>
                          <th>N&uacute;mero factura</th>
                          <th>Servicio</th>
                          <th>Descripci&oacute;n</th>
                          <th>Orden</th>
                          <th>Seguimiento</th>
                          <th>Total</th>
                          <th>Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-if="detailLoading">
                          <td colspan="7">Cargando detalle del cliente...</td>
                        </tr>
                        <tr v-else-if="!(activeClient.rows || []).length">
                          <td colspan="7">No hay detalles de contrato para este cliente con los filtros actuales.</td>
                        </tr>
                        <tr v-for="(row, index) in activeClient.rows" :key="`${row.numeroFactura || 'sin-factura'}-${row.codigoSeguimiento || index}`">
                          <td>{{ row.numeroFactura || '-' }}</td>
                          <td>{{ row.servicio || '-' }}</td>
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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default {
  data() {
    return {
      load: false,
      error: '',
      modulo: 'Kardex',
      page: 'Servicios contrato',
      searchTerm: '',
      filters: {
        limite: 200
      },
      pdfLoading: false,
      pdfAssetCache: {},
      activeClient: null,
      detailLoading: false,
      report: {
        resumen: {
          cantidadClientes: 0,
          cantidadVentas: 0,
          cantidadDetalles: 0,
          totalCantidad: 0,
          totalMonto: 0
        },
        clientes: []
      }
    };
  },
  computed: {
    summary() {
      return this.report?.resumen || {};
    },
    filteredClients() {
      const term = this.normalizeText(this.searchTerm);
      const rows = Array.isArray(this.report?.clientes) ? this.report.clientes : [];

      if (!term) {
        return rows;
      }

      return rows.filter((item) => {
        const haystack = [
          item?.nit,
          item?.razonSocial,
          item?.servicioMuestra,
          ...(Array.isArray(item?.servicios) ? item.servicios : [])
        ]
          .map((value) => this.normalizeText(value))
          .join(' ');

        return haystack.includes(term);
      });
    },
    pdfClients() {
      return this.filteredClients;
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
    async loadImageDataUrl(src) {
      if (!src) {
        return null;
      }

      if (this.pdfAssetCache[src]) {
        return this.pdfAssetCache[src];
      }

      const response = await fetch(src);
      const blob = await response.blob();
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      this.pdfAssetCache = {
        ...this.pdfAssetCache,
        [src]: dataUrl
      };

      return dataUrl;
    },
    async drawPdfHeader(doc) {
      const pageWidth = doc.internal.pageSize.getWidth();

      try {
        const [ministerioDataUrl, correosDataUrl] = await Promise.all([
          this.loadImageDataUrl('/assets/imagenes/MOPSV.png'),
          this.loadImageDataUrl('/assets/imagenes/AGBClogo1.png')
        ]);
        const rightLogoWidth = 33;
        const rightLogoX = pageWidth - 12 - rightLogoWidth;

        doc.setFillColor(255, 255, 255);
        doc.rect(8, 5, pageWidth - 16, 21, 'F');
        doc.addImage(ministerioDataUrl, 'PNG', 10, 6.4, 82, 15);
        doc.addImage(correosDataUrl, 'PNG', rightLogoX, 5.8, rightLogoWidth, 16.5);
      } catch (error) {
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
    pdfClientDetailRows(rows = []) {
      return (rows || []).map((row, index) => ([
        index + 1,
        row?.numeroFactura || '-',
        row?.descripcion || '-',
        this.formatDateTime(row?.fecha),
        this.formatCurrency(row?.totalLinea || 0)
      ]));
    },
    async fetchPdfClients(targetItem = null) {
      const params = new URLSearchParams();
      params.append('limite', String(Number(this.filters.limite || 200)));
      params.append('includeRows', '1');

      const pdfResponse = await this.$admin.$get(`ventas/reportes/servicios-contrato?${params.toString()}`);
      const pdfRows = Array.isArray(pdfResponse?.clientes) ? pdfResponse.clientes : [];
      const term = this.normalizeText(this.searchTerm);
      let selectedClients = !term ? pdfRows : pdfRows.filter((item) => {
        const haystack = [
          item?.nit,
          item?.razonSocial,
          item?.servicioMuestra,
          ...(Array.isArray(item?.servicios) ? item.servicios : [])
        ]
          .map((value) => this.normalizeText(value))
          .join(' ');

        return haystack.includes(term);
      });

      if (targetItem) {
        const targetNit = String(targetItem?.nit || '').trim();
        const targetRazonSocial = String(targetItem?.razonSocial || '').trim();
        selectedClients = selectedClients.filter((item) => (
          String(item?.nit || '').trim() === targetNit
          && String(item?.razonSocial || '').trim() === targetRazonSocial
        ));
      }

      return selectedClients;
    },
    sanitizeFileNameSegment(value, fallback = 'empresa') {
      return String(value || fallback)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase() || fallback;
    },
    async buildContractPdf(selectedClients, fileSuffix = 'general') {
      if (!selectedClients.length) {
        throw new Error('No hay datos para exportar.');
      }

        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'letter'
        });

        await this.drawPdfHeader(doc);

        const generatedBy = this.currentPdfUserLabel();
        const generatedAt = this.currentPdfTimestamp();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const searchText = this.searchTerm ? this.searchTerm : 'Todos los clientes';
        const totalVentas = selectedClients.reduce((acc, item) => acc + Number(item?.cantidadVentas || 0), 0);
        const totalDetalles = selectedClients.reduce((acc, item) => acc + Number(item?.cantidadDetalles || 0), 0);
        const totalFacturas = selectedClients.reduce((acc, item) => {
          const rows = Array.isArray(item?.rows) ? item.rows : [];
          const facturas = rows
            .map((row) => String(row?.numeroFactura || '').trim())
            .filter((value) => value !== '');

          return acc + new Set(facturas).size;
        }, 0);
        const totalGeneral = selectedClients.reduce((acc, item) => acc + Number(item?.totalMonto || 0), 0);
        const tableMargin = { left: 12, right: 12 };
        const sectionTableWidth = pageWidth - tableMargin.left - tableMargin.right;
        const metaTableWidths = {
          labelOne: 28,
          valueOne: 68,
          labelTwo: 32,
          valueTwo: sectionTableWidth - 28 - 68 - 32
        };
        const summaryTableWidths = {
          labelOne: 28,
          valueOne: 28,
          labelTwo: 32,
          valueTwo: 28,
          labelThree: 40,
          valueThree: sectionTableWidth - 28 - 28 - 32 - 28 - 40
        };
        const detailColumnStyles = {
          0: { cellWidth: 9, halign: 'center' },
          1: { cellWidth: 28, halign: 'center' },
          2: { cellWidth: 101 },
          3: { cellWidth: 26 },
          4: { cellWidth: sectionTableWidth - 9 - 28 - 101 - 26, halign: 'right' }
        };

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(15);
        doc.setTextColor(25, 55, 112);
        doc.text('REPORTE DE SERVICIOS CONTRATO', pageWidth / 2, 35, { align: 'center' });

        autoTable(doc, {
          startY: 41,
          body: [[
            'Reporte:',
            'Servicios contrato por cliente',
            'Generado por:',
            generatedBy
          ], [
            'Filtro visible:',
            searchText,
            'Fecha de emisión:',
            generatedAt
          ]],
          theme: 'grid',
          styles: {
            fontSize: 7.4,
            cellPadding: 2,
            lineColor: [90, 90, 90],
            textColor: [20, 20, 20]
          },
          columnStyles: {
            0: { fontStyle: 'bold', fillColor: [250, 250, 250], cellWidth: metaTableWidths.labelOne },
            1: { cellWidth: metaTableWidths.valueOne },
            2: { fontStyle: 'bold', fillColor: [250, 250, 250], cellWidth: metaTableWidths.labelTwo },
            3: { cellWidth: metaTableWidths.valueTwo }
          },
          tableWidth: sectionTableWidth,
          margin: tableMargin
        });

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 3,
          body: [['RESUMEN GENERAL']],
          theme: 'grid',
          styles: {
            fontSize: 7.8,
            fontStyle: 'bold',
            cellPadding: 2,
            fillColor: [245, 245, 245],
            textColor: [20, 20, 20]
          },
          margin: tableMargin
        });

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 1.5,
          body: [[
            'CLIENTES',
            String(selectedClients.length),
            'FACTURAS',
            String(totalFacturas),
            'TOTAL GENERAL',
            this.formatCurrency(totalGeneral)
          ]],
          theme: 'grid',
          styles: {
            fontSize: 7.4,
            cellPadding: 2,
            lineColor: [90, 90, 90],
            textColor: [20, 20, 20]
          },
          columnStyles: {
            0: { fontStyle: 'bold', fillColor: [250, 250, 250], cellWidth: summaryTableWidths.labelOne },
            1: { cellWidth: summaryTableWidths.valueOne },
            2: { fontStyle: 'bold', fillColor: [250, 250, 250], cellWidth: summaryTableWidths.labelTwo },
            3: { cellWidth: summaryTableWidths.valueTwo },
            4: { fontStyle: 'bold', fillColor: [250, 250, 250], cellWidth: summaryTableWidths.labelThree },
            5: { cellWidth: summaryTableWidths.valueThree, halign: 'right' }
          },
          tableWidth: sectionTableWidth,
          margin: tableMargin
        });

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 3,
          body: [['RESUMEN POR EMPRESA']],
          theme: 'grid',
          styles: {
            fontSize: 7.8,
            fontStyle: 'bold',
            cellPadding: 2,
            fillColor: [245, 245, 245],
            textColor: [20, 20, 20]
          },
          margin: tableMargin
        });

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 1.5,
          head: [[
            'Empresa',
            'NIT',
            'Facturas',
            'Total'
          ]],
          body: selectedClients.map((item) => {
            const rows = Array.isArray(item?.rows) ? item.rows : [];
            const facturas = rows
              .map((row) => String(row?.numeroFactura || '').trim())
              .filter((value) => value !== '');

            return [
              item?.razonSocial || 'Sin razon social',
              item?.nit || '-',
              new Set(facturas).size,
              this.formatCurrency(item?.totalMonto || 0)
            ];
          }),
          theme: 'grid',
          styles: {
            fontSize: 7.1,
            cellPadding: 1.8,
            lineColor: [90, 90, 90],
            textColor: [20, 20, 20],
            overflow: 'linebreak'
          },
          headStyles: {
            fillColor: [238, 243, 250],
            textColor: [20, 20, 20],
            fontStyle: 'bold'
          },
          columnStyles: {
            0: { cellWidth: 84, fontStyle: 'bold' },
            1: { cellWidth: 28 },
            2: { cellWidth: 22, halign: 'center' },
            3: { cellWidth: sectionTableWidth - 84 - 28 - 22, halign: 'right' }
          },
          margin: tableMargin
        });

        for (let index = 0; index < selectedClients.length; index += 1) {
          const item = selectedClients[index];
          const detailRows = Array.isArray(item?.rows) ? item.rows : [];
          let currentY = doc.lastAutoTable?.finalY || 43;
          const estimatedRowHeight = 14;
          const estimatedSectionHeight = 26 + (Math.max(detailRows.length, 1) * estimatedRowHeight);
          let sectionStartY = currentY + 3;

          if (currentY + estimatedSectionHeight > pageHeight - 18) {
            doc.addPage();
            await this.drawPdfHeader(doc);
            currentY = 28;
            sectionStartY = 31;
          }

          autoTable(doc, {
            startY: sectionStartY,
            body: [[`${item?.razonSocial || 'Sin razon social'} - NIT: ${item?.nit || '-'}`]],
            theme: 'grid',
            styles: {
              fontSize: 7.8,
              fontStyle: 'bold',
              cellPadding: 2,
              fillColor: [245, 245, 245],
              textColor: [20, 20, 20]
            },
            tableWidth: sectionTableWidth,
            margin: tableMargin,
            pageBreak: 'avoid',
            rowPageBreak: 'avoid'
          });

          autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 1.5,
            head: [[
              'Nro.',
              'Número de factura',
              'Descripción',
              'Fecha',
              'Importe'
            ]],
            body: this.pdfClientDetailRows(detailRows).length
              ? this.pdfClientDetailRows(detailRows)
              : [[
                '-',
                '-',
                'No se encontraron detalles de contrato para este cliente.',
                '-',
                this.formatCurrency(0)
              ]],
            theme: 'grid',
            styles: {
              fontSize: 6.8,
              cellPadding: 1.6,
              lineColor: [90, 90, 90],
              textColor: [20, 20, 20],
              overflow: 'linebreak'
            },
            headStyles: {
              fillColor: [238, 243, 250],
              textColor: [20, 20, 20],
              fontStyle: 'bold'
            },
            columnStyles: detailColumnStyles,
            tableWidth: sectionTableWidth,
            margin: tableMargin,
            pageBreak: 'avoid',
            rowPageBreak: 'avoid'
          });

          autoTable(doc, {
            startY: doc.lastAutoTable.finalY,
            body: [[
              '',
              '',
              '',
              'Total:',
              this.formatCurrency(item?.totalMonto || 0)
            ]],
            theme: 'grid',
            styles: {
              fontSize: 6.8,
              cellPadding: 1.6,
              lineColor: [90, 90, 90],
              textColor: [20, 20, 20]
            },
            columnStyles: {
              0: { ...detailColumnStyles[0] },
              1: { ...detailColumnStyles[1] },
              2: { ...detailColumnStyles[2] },
              3: { ...detailColumnStyles[3], fontStyle: 'bold', halign: 'right' },
              4: { ...detailColumnStyles[4], fontStyle: 'bold', halign: 'right' }
            },
            tableWidth: sectionTableWidth,
            margin: tableMargin,
            pageBreak: 'avoid',
            rowPageBreak: 'avoid'
          });
        }

        this.drawPdfFooter(doc, generatedBy, generatedAt);
        doc.save(`servicios-contrato-${fileSuffix}-${new Date().toISOString().slice(0, 10)}.pdf`);
    },
    async downloadContractReportPdf() {
      if (this.pdfLoading || !this.filteredClients.length) {
        return;
      }

      this.pdfLoading = true;

      try {
        const selectedClients = await this.fetchPdfClients();
        await this.buildContractPdf(selectedClients, 'general');
      } catch (error) {
        this.$toast?.error?.('No se pudo generar el PDF de servicios contrato.');
      } finally {
        this.pdfLoading = false;
      }
    },
    async downloadSingleCompanyPdf(item) {
      if (this.pdfLoading || !item) {
        return;
      }

      this.pdfLoading = true;

      try {
        const selectedClients = await this.fetchPdfClients(item);
        const suffix = this.sanitizeFileNameSegment(item?.razonSocial || item?.nit || 'empresa');
        await this.buildContractPdf(selectedClients, suffix);
      } catch (error) {
        this.$toast?.error?.('No se pudo generar el PDF de la empresa seleccionada.');
      } finally {
        this.pdfLoading = false;
      }
    },
    clearSearch() {
      this.searchTerm = '';
    },
    async openClientModal(item) {
      if (!item) {
        this.activeClient = null;
        return;
      }

      this.activeClient = {
        ...(item || {}),
        rows: []
      };
      this.detailLoading = true;

      try {
        const params = new URLSearchParams();
        if (item?.nit) {
          params.append('nit', String(item.nit));
        }
        if (item?.razonSocial) {
          params.append('razonSocial', String(item.razonSocial));
        }

        const response = await this.$admin.$get(`ventas/reportes/servicios-contrato/detalle?${params.toString()}`);
        this.activeClient = response?.cliente
          ? { ...(item || {}), ...(response.cliente || {}) }
          : { ...(item || {}), rows: [] };
      } catch (err) {
        this.activeClient = {
          ...(item || {}),
          rows: []
        };
        this.error = err?.response?.data?.message || 'No se pudo consultar el detalle del cliente.';
      } finally {
        this.detailLoading = false;
      }
    },
    closeClientModal() {
      this.activeClient = null;
      this.detailLoading = false;
    },
    async loadReport() {
      this.load = true;
      this.error = '';

      try {
        const params = new URLSearchParams();
        params.append('limite', String(Number(this.filters.limite || 200)));

        const response = await this.$admin.$get(`ventas/reportes/servicios-contrato?${params.toString()}`);
        this.report = {
          resumen: response?.resumen || this.report.resumen,
          clientes: Array.isArray(response?.clientes) ? response.clientes : []
        };
      } catch (err) {
        this.error = err?.response?.data?.message || 'No se pudo consultar el consolidado de servicios contrato.';
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
  line-height: 1.55;
}

.service-toolbar {
  margin-top: 1.3rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 180px auto;
  gap: 0.9rem;
  align-items: end;
}

.service-field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.service-field span {
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #7182a0;
}

.service-field input,
.service-field select {
  min-height: 48px;
  border-radius: 15px;
  border: 1px solid #d5e0f1;
  background: #fff;
  padding: 0.85rem 1rem;
  color: #1d335f;
  outline: none;
}

.service-toolbar-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.service-btn {
  min-height: 48px;
  border-radius: 15px;
  border: 1px solid transparent;
  padding: 0 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  font-weight: 700;
  cursor: pointer;
}

.service-btn-primary {
  background: linear-gradient(135deg, #3a67d8 0%, #2853c7 100%);
  color: #fff;
  box-shadow: 0 14px 24px rgba(40, 83, 199, 0.2);
}

.service-btn-secondary {
  background: #fff;
  border-color: #d5e0f1;
  color: #315094;
}

.service-btn-inline {
  min-height: 38px;
  padding: 0 0.8rem;
  border-radius: 12px;
  white-space: nowrap;
}

.service-error-card,
.service-table-card {
  margin-top: 1.1rem;
  border-radius: 24px;
  border: 1px solid #dfe7f4;
  background: #fff;
  padding: 1rem;
}

.service-summary-grid {
  margin-top: 1.1rem;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.9rem;
}

.service-summary-card {
  border-radius: 20px;
  border: 1px solid #dfe7f4;
  background: #fff;
  padding: 0.95rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.service-summary-card span {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #7a88a2;
}

.service-summary-card strong {
  color: #16366c;
  font-size: 1.6rem;
  font-weight: 900;
}

.service-summary-card-money {
  background: linear-gradient(135deg, #f7fcf7 0%, #f0fbf3 100%);
}

.service-table-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.8rem;
}

.service-table-head h3 {
  margin: 0;
  color: #18376b;
  font-size: 1.2rem;
  font-weight: 800;
}

.service-table-head p {
  margin: 0.2rem 0 0;
  color: #7182a0;
}

.service-empty-state {
  border-radius: 18px;
  border: 1px dashed #d4dff0;
  background: #f9fbff;
  padding: 2rem 1.2rem;
  text-align: center;
}

.service-empty-state h3 {
  margin: 0;
  color: #1b3766;
}

.service-empty-state p {
  margin: 0.45rem 0 0;
  color: #6e7c95;
}

.service-table-wrap {
  overflow: auto;
}

.service-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 980px;
}

.service-table th,
.service-table td {
  border-bottom: 1px solid #e7eef8;
  padding: 0.95rem 0.75rem;
  text-align: left;
  vertical-align: top;
  color: #2c426d;
}

.service-table th {
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #7a88a2;
}

.service-name-cell {
  display: flex;
  flex-direction: column;
  gap: 0.28rem;
}

.service-name-cell strong {
  color: #17386f;
}

.service-name-cell small,
.contract-service-list {
  color: #67778f;
  line-height: 1.45;
}

.service-name-button {
  width: 100%;
  border: 0;
  background: transparent;
  padding: 0;
  text-align: left;
  cursor: pointer;
}

.service-name-button:hover strong {
  color: #2a5ad1;
}

.service-amount {
  white-space: nowrap;
  font-weight: 800;
  color: #17396f;
}

.service-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 29, 56, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.2rem;
  z-index: 2000;
}

.service-modal-card {
  width: min(1200px, 100%);
  max-height: 88vh;
  overflow: auto;
  border-radius: 24px;
  background: #fff;
  border: 1px solid #dfe7f4;
  padding: 1rem;
  box-shadow: 0 32px 60px rgba(14, 31, 60, 0.2);
}

@media (max-width: 1100px) {
  .service-summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .service-toolbar {
    grid-template-columns: 1fr;
  }

  .service-toolbar-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .service-summary-grid {
    grid-template-columns: 1fr;
  }

  .service-modal-backdrop {
    padding: 0.7rem;
  }
}
</style>

