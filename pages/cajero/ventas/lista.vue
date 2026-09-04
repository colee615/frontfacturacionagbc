<template>
  <div>
    <JcLoader :load="load" />
    <AdminTemplate :page="page" :modulo="modulo">
      <div slot="body" class="closure-page">
        <div v-if="!activeConciliationModal" class="closure-shell">
          <section class="hero-card">
            <div class="hero-copy">
              <h1>Control de cierre</h1>
            </div>

            <div class="toolbar-grid">
              <label class="toolbar-field toolbar-field-date">
                <i class="far fa-calendar-alt"></i>
                <input v-model="startDate" type="date" />
              </label>

              <label class="toolbar-field toolbar-field-date">
                <i class="far fa-calendar-alt"></i>
                <input v-model="endDate" type="date" />
              </label>

              <button
                type="button"
                class="toolbar-filter-btn"
                :disabled="load"
                @click="applyDateFilter"
              >
                <i class="fas fa-filter"></i>
                <span>{{ load ? 'Verificando...' : 'Filtrar' }}</span>
              </button>

              <label class="toolbar-field toolbar-field-search">
                <i class="fas fa-search"></i>
                <input v-model.trim="filters.q" type="text" placeholder="Buscar sucursal..." />
              </label>

              <label class="toolbar-field toolbar-field-select">
                <i class="fas fa-filter"></i>
                <select v-model="statusFilter">
                  <option value="all">Estado: Todos</option>
                  <option value="cerrada">Sin observaciones</option>
                  <option value="pendiente">Con pendientes</option>
                  <option value="diferencia">Con observaciones</option>
                  <option value="sin_ventas">Sin ventas</option>
                </select>
              </label>
              <div class="toolbar-actions">
                <button
                  type="button"
                  class="toolbar-export-btn"
                  :disabled="exportExcelLoading"
                  @click="downloadResumenExcel"
                >
                  <i class="fas fa-file-excel"></i>
                  <span>{{ exportExcelLoading ? 'Generando Excel...' : 'Exportar Excel' }}</span>
                </button>
                <button
                  type="button"
                  class="toolbar-export-btn"
                  :disabled="exportPdfLoading"
                  @click="downloadResumenPdf"
                >
                  <i class="fas fa-file-pdf"></i>
                  <span>{{ exportPdfLoading ? 'Generando PDF...' : 'Exportar PDF' }}</span>
                </button>
              </div>
            </div>

            <div v-if="load" class="report-loading-banner">
              <i class="fas fa-sync-alt fa-spin"></i>
              <span>Actualizando y verificando totales...</span>
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
                    <span>Sucursales del día</span>
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
                        <th>Total vendido</th>
                        <th>Ventas</th>
                        <th>Incidencias</th>
                        <th>Estado</th>
                        <th>Acción</th>
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
                        <td>
                          <div class="metric-stack">
                            <strong>{{ formatCurrency(item.totalVendido) }}</strong>
                            <div class="metric-tags">
                              <span class="metric-tag metric-tag-info">QR {{ formatCurrency(item.totalQrFacturado) }}</span>
                              <span class="metric-tag metric-tag-neutral">Ef {{ formatCurrency(item.totalEfectivoFacturado) }}</span>
                              <span
                                v-if="item.totalEcaFacturado > 0"
                                class="metric-tag metric-tag-warning"
                              >
                                ECA {{ formatCurrency(item.totalEcaFacturado) }}
                              </span>
                              <span
                                v-if="item.totalContratosNoSumados > 0"
                                class="metric-tag metric-tag-contract"
                              >
                                Cont {{ formatCurrency(item.totalContratosNoSumados) }}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div class="metric-stack">
                            <strong>{{ item.facturadas }} ventas</strong>
                            <div class="metric-tags">
                              <span class="metric-tag metric-tag-info">QR {{ item.qrFacturadas }}</span>
                              <span class="metric-tag metric-tag-neutral">Ef {{ item.electronicasFacturadas }}</span>
                              <span v-if="item.ecaFacturadas > 0" class="metric-tag metric-tag-warning">ECA {{ item.ecaFacturadas }}</span>
                              <span v-if="item.contratosNoSumados > 0" class="metric-tag metric-tag-contract">Cont {{ item.contratosNoSumados }}</span>
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

                            <button
                              class="action-btn action-btn-warning"
                              type="button"
                              @click="goToConciliation(item)"
                            >
                              <i class="far fa-calendar-check"></i>
                              <span>{{ item.conciliacion.totalComprobantes > 0 ? 'Conciliación' : 'Conciliar sucursal' }}</span>
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

        <section v-if="activeConciliationModal" class="conciliation-page-shell">
          <div class="conciliation-page-topbar">
            <button type="button" class="action-btn action-btn-primary conciliation-back-btn" @click="closeConciliationModal">
              <i class="fas fa-arrow-left"></i>
              <span>Volver a control de cierre</span>
            </button>
          </div>

          <section class="hero-card conciliation-hero-card">
            <div class="conciliation-hero-head">
              <div class="users-modal-head-copy">
                <p class="detail-kicker mb-1">Conciliación diaria</p>
                <h3>{{ activeConciliationModal.title }}</h3>
                <p class="detail-copy mb-0">{{ activeConciliationModal.subtitle }}</p>
              </div>
              <span class="calendar-selection-pill" :class="conciliacionStatusPillClass(activeConciliationModal.conciliacion)">
                {{ conciliacionLabel(activeConciliationModal.conciliacion) }}
              </span>
            </div>

            <div ref="conciliationDetailPanel" class="conciliation-form-card conciliation-detail-card">
              <div class="conciliation-detail-head">
                <div>
                  <p class="detail-kicker mb-1">Resumen del día seleccionado</p>
                  <h4>{{ formatDateLabel(activeConciliationModal.selectedDate) }}</h4>
                  <p class="detail-copy mb-0">Al seleccionar una fecha, aquí se actualizan el estado, los comprobantes y la carga del día elegido.</p>
                </div>
              </div>

              <div class="conciliation-summary-grid">
                <article class="summary-card summary-card-primary conciliation-summary-card">
                  <div class="summary-copy">
                    <span>Fecha activa</span>
                    <strong>{{ formatDateLabel(activeConciliationModal.selectedDate) }}</strong>
                  </div>
                </article>
                <article class="summary-card summary-card-success conciliation-summary-card">
                  <div class="summary-copy">
                    <span>Efectivo esperado</span>
                    <strong>{{ formatCurrency(activeConciliationModal.conciliacion.totalEfectivoSistema) }}</strong>
                  </div>
                </article>
                <article class="summary-card summary-card-warning conciliation-summary-card">
                  <div class="summary-copy">
                    <span>Total comprobantes</span>
                    <strong>{{ formatCurrency(activeConciliationModal.conciliacion.totalComprobantes) }}</strong>
                  </div>
                </article>
                <article class="summary-card summary-card-money conciliation-summary-card">
                  <div class="summary-copy">
                    <span>Diferencia</span>
                    <strong>{{ formatCurrency(activeConciliationModal.conciliacion.diferencia) }}</strong>
                  </div>
                </article>
              </div>

              <div class="conciliation-cta-row">
                <span class="detail-copy mb-0">
                  {{ activeConciliationModal.comprobantes.length
                    ? `${activeConciliationModal.comprobantes.length} comprobante(s) registrados para esta fecha.`
                    : 'Todavia no hay comprobantes cargados para esta fecha.' }}
                </span>
              </div>
            </div>
          </section>

          <div class="conciliation-content-grid">
            <section class="calendar-card calendar-card-modal conciliation-panel-card">
              <div class="calendar-card-head">
                <div>
                  <p class="detail-kicker mb-1">Calendario de conciliación</p>
                  <h3>{{ activeConciliationCalendarLabel }}</h3>
                  <p class="calendar-card-copy">Seleccione el día del comprobante para esta regional. El panel se actualiza solo para la fecha elegida.</p>
                </div>
                <div class="calendar-nav">
                  <button type="button" class="calendar-nav-btn" @click="moveActiveConciliationCalendar(-1)">
                    <i class="fas fa-chevron-left"></i>
                  </button>
                  <button type="button" class="calendar-nav-btn" @click="jumpActiveConciliationCalendarToToday">
                    Hoy
                  </button>
                  <button type="button" class="calendar-nav-btn" @click="moveActiveConciliationCalendar(1)">
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>

              <div class="calendar-weekdays">
                <span v-for="weekday in calendarWeekdays" :key="weekday">{{ weekday }}</span>
              </div>

              <div class="calendar-grid">
                <button
                  v-for="day in activeConciliationCalendarDays"
                  :key="day.key"
                  type="button"
                  class="calendar-day"
                  :class="{
                    'calendar-day-muted': !day.isCurrentMonth,
                    'calendar-day-today': day.isToday,
                    'calendar-day-selected': day.isSelected,
                    'calendar-day-has-upload': day.hasReceipts,
                    'calendar-day-complete': day.isCompleted
                  }"
                  @click="selectActiveConciliationDay(day)"
                >
                  <span class="calendar-day-number">{{ day.dayNumber }}</span>
                  <div class="calendar-day-flags">
                    <small v-if="day.isCompleted" class="calendar-day-badge calendar-day-badge-success">Cumplido</small>
                    <small v-else-if="day.hasReceipts" class="calendar-day-badge">{{ day.receiptCount }} comp.</small>
                  </div>
                </button>
              </div>
            </section>

            <div class="conciliation-side-stack">
              <div ref="conciliationUploadPanel" class="conciliation-form-card conciliation-upload-card">
                <div class="conciliation-detail-head conciliation-detail-head-form">
                  <div>
                    <p class="detail-kicker mb-1">Carga del comprobante</p>
                    <h4>Comprobante para {{ formatDateLabel(activeConciliationModal.selectedDate) }}</h4>
                  </div>
                </div>

                <div
                  v-if="!isConciliationCompletedWithReceipts(activeConciliationModal.conciliacion, activeConciliationModal.comprobantes) || activeConciliationModal.showUploadComposer"
                  class="conciliation-scanner-card"
                >
                  <div class="conciliation-scanner-head">
                    <div>
                      <p class="detail-kicker mb-1">Escanear QR del comprobante</p>
                      <h4>Selecciona la imagen y recorta el QR</h4>
                    </div>
                  </div>

                  <div class="conciliation-scanner-toolbar">
                    <div class="conciliation-scanner-copy">
                      <strong>Comprobante del día</strong>
                      <p>Sube una foto del comprobante y arrastra el recuadro sobre el QR para completar los datos automaticamente.</p>
                    </div>
                    <div class="conciliation-scanner-actions">
                      <button type="button" class="action-btn action-btn-primary" @click="triggerConciliationScannerImagePicker">
                        <i class="fas fa-image"></i>
                        <span>Seleccionar imagen</span>
                      </button>
                      <input ref="conciliationQrScannerInput" type="file" accept=".jpg,.jpeg,.png,.webp" class="sr-only-input" @change="onConciliationScannerImageChange" />
                    </div>
                  </div>

                  <div class="conciliation-scanner-stage">
                    <div
                      v-if="activeConciliationQrHasSource"
                      ref="conciliationQrStage"
                      class="conciliation-scanner-preview"
                      :class="{ 'conciliation-scanner-preview-selecting': activeConciliationModal.qrScanner.cropEnabled }"
                      @mousedown.prevent="startConciliationQrSelection"
                      @mousemove.prevent="updateConciliationQrSelection"
                      @mouseup.prevent="finishConciliationQrSelection"
                      @mouseleave="finishConciliationQrSelection"
                      @dragstart.prevent
                    >
                      <img
                        v-if="activeConciliationModal.qrScanner.previewUrl"
                        ref="conciliationQrImage"
                        :src="activeConciliationModal.qrScanner.previewUrl"
                        alt="Comprobante seleccionado"
                        class="conciliation-scanner-media"
                      />
                      <div
                        v-if="activeConciliationModal.qrScanner.cropEnabled"
                        class="conciliation-scanner-crop"
                        :style="activeConciliationQrCropStyle"
                      ></div>
                    </div>
                    <div v-else class="conciliation-scanner-empty">
                      <p>Seleccione una imagen del comprobante para empezar el recorte del QR.</p>
                    </div>
                  </div>

                  <div v-if="activeConciliationQrHasSource" class="conciliation-scanner-footer">
                    <p class="detail-copy mb-0">
                      Arrastre para seleccionar el area del QR y luego procesela.
                    </p>
                    <div class="conciliation-scanner-actions">
                      <button
                        type="button"
                        class="action-btn action-btn-primary"
                        :disabled="activeConciliationModal.qrScan && activeConciliationModal.qrScan.status === 'loading'"
                        @click="processConciliationQrFullSource"
                      >
                        <i class="fas fa-expand"></i>
                        <span>{{ activeConciliationModal.qrScan && activeConciliationModal.qrScan.status === 'loading' ? 'Procesando...' : 'Procesar recorte' }}</span>
                      </button>
                      <button type="button" class="action-btn action-btn-danger" @click="resetConciliationQrSource">
                        <i class="fas fa-times"></i>
                        <span>Cancelar</span>
                      </button>
                    </div>
                  </div>

                  <p class="detail-copy mb-0">{{ activeConciliationModal.qrScanner.statusMessage }}</p>
                </div>

                <div
                  v-if="activeConciliationModal.qrScan && ['error', 'unsupported'].includes(activeConciliationModal.qrScan.status)"
                  class="conciliation-manual-card"
                >
                  <div class="conciliation-scanner-toolbar">
                    <div class="conciliation-scanner-copy">
                      <strong>Registro manual</strong>
                      <p>Como no se pudo detectar el QR, completa los datos manualmente antes de guardar.</p>
                    </div>
                    <div class="conciliation-scanner-actions">
                      <button type="button" class="action-btn action-btn-primary" @click="triggerConciliationScannerImagePicker">
                        <i class="fas fa-image"></i>
                        <span>Seleccionar imagen</span>
                      </button>
                      <input ref="conciliationQrScannerInput" type="file" accept=".jpg,.jpeg,.png,.webp" class="sr-only-input" @change="onConciliationScannerImageChange" />
                    </div>
                  </div>
                  <div class="conciliation-manual-file" v-if="activeConciliationModal.selectedFileName">
                    <span class="calendar-selection-pill">
                      Archivo: <strong>{{ activeConciliationModal.selectedFileName }}</strong>
                    </span>
                  </div>
                </div>

                <div v-if="activeConciliationModal.qrScan && ['error', 'unsupported'].includes(activeConciliationModal.qrScan.status)" class="conciliation-form-grid">
                  <label class="toolbar-field">
                    <span>Monto depositado</span>
                    <input ref="conciliationAmountInput" v-model="activeConciliationModal.form.montoDepositado" type="number" min="0" step="0.01" placeholder="0.00" />
                  </label>
                  <label class="toolbar-field">
                    <span>Banco</span>
                    <input v-model.trim="activeConciliationModal.form.banco" type="text" placeholder="Banco / entidad" />
                  </label>
                  <label class="toolbar-field">
                    <span>Nombre del banco</span>
                    <input v-model.trim="activeConciliationModal.form.nombreBanco" type="text" placeholder="BANCO UNIÓN S.A." />
                  </label>
                  <label class="toolbar-field">
                    <span>Usuario</span>
                    <input v-model.trim="activeConciliationModal.form.usuarioBanco" type="text" placeholder="Usuario del comprobante" />
                  </label>
                  <label class="toolbar-field">
                    <span>Agencia</span>
                    <input v-model.trim="activeConciliationModal.form.agenciaBanco" type="text" placeholder="Agencia / soporte operativo" />
                  </label>
                  <label class="toolbar-field">
                    <span>Transacción</span>
                    <input v-model.trim="activeConciliationModal.form.transaccionBanco" type="text" placeholder="Depositos a cuenta" />
                  </label>
                  <label class="toolbar-field">
                    <span>Fecha comprobante</span>
                    <input v-model.trim="activeConciliationModal.form.fechaComprobante" type="text" placeholder="20/08/2026" />
                  </label>
                  <label class="toolbar-field">
                    <span>Moneda</span>
                    <input v-model.trim="activeConciliationModal.form.monedaComprobante" type="text" placeholder="Bs" />
                  </label>
                  <label class="toolbar-field">
                    <span>Depositante</span>
                    <input v-model.trim="activeConciliationModal.form.depositante" type="text" placeholder="Nombre del depositante" />
                  </label>
                  <label class="toolbar-field">
                    <span>Beneficiario</span>
                    <input v-model.trim="activeConciliationModal.form.beneficiario" type="text" placeholder="Nombre del beneficiario" />
                  </label>
                  <label class="toolbar-field">
                    <span>Referencia</span>
                    <input v-model.trim="activeConciliationModal.form.referencia" type="text" placeholder="Nro. operacion" />
                  </label>
                  <label class="toolbar-field toolbar-field-wide">
                    <span>Observación</span>
                    <textarea v-model.trim="activeConciliationModal.form.observacion" rows="3" placeholder="Detalle del depósito o nota de control"></textarea>
                  </label>
                </div>
                <div v-if="activeConciliationModal.qrScan && activeConciliationModal.qrScan.status !== 'idle'" class="conciliation-qr-panel">
                  <div class="conciliation-qr-head">
                    <strong>Datos detectados del comprobante</strong>
                    <span class="calendar-selection-pill" :class="conciliationQrStatusClass(activeConciliationModal.qrScan.status)">
                      {{ conciliationQrStatusLabel(activeConciliationModal.qrScan.status) }}
                    </span>
                  </div>

                  <p v-if="activeConciliationModal.qrScan.message" class="detail-copy mb-0">
                    {{ activeConciliationModal.qrScan.message }}
                  </p>
                  <div v-if="activeConciliationModal.qrScan.parsed" class="conciliation-qr-grid">
                    <div v-if="activeConciliationModal.qrScan.parsed.bankName" class="conciliation-qr-chip">
                      <span>Banco</span>
                      <strong>{{ activeConciliationModal.qrScan.parsed.bankName }}</strong>
                    </div>
                    <div v-if="activeConciliationModal.qrScan.parsed.amount !== null" class="conciliation-qr-chip">
                      <span>Monto detectado</span>
                      <strong>{{ formatCurrency(activeConciliationModal.qrScan.parsed.amount) }}</strong>
                    </div>
                    <div v-if="activeConciliationModal.qrScan.parsed.reference" class="conciliation-qr-chip">
                      <span>Referencia</span>
                      <strong>{{ activeConciliationModal.qrScan.parsed.reference }}</strong>
                    </div>
                    <div v-if="activeConciliationModal.qrScan.parsed.date" class="conciliation-qr-chip">
                      <span>Fecha</span>
                      <strong>{{ activeConciliationModal.qrScan.parsed.date }}</strong>
                    </div>
                    <div v-if="activeConciliationModal.qrScan.parsed.currency" class="conciliation-qr-chip">
                      <span>Moneda</span>
                      <strong>{{ activeConciliationModal.qrScan.parsed.currency }}</strong>
                    </div>
                    <div v-if="activeConciliationModal.qrScan.parsed.bank" class="conciliation-qr-chip">
                      <span>Agencia</span>
                      <strong>{{ activeConciliationModal.qrScan.parsed.bank }}</strong>
                    </div>
                    <div v-if="activeConciliationModal.qrScan.parsed.transaction" class="conciliation-qr-chip">
                      <span>Transacción</span>
                      <strong>{{ activeConciliationModal.qrScan.parsed.transaction }}</strong>
                    </div>
                    <div v-if="activeConciliationModal.qrScan.parsed.user" class="conciliation-qr-chip">
                      <span>Usuario</span>
                      <strong>{{ activeConciliationModal.qrScan.parsed.user }}</strong>
                    </div>
                    <div v-if="activeConciliationModal.qrScan.parsed.depositante" class="conciliation-qr-chip">
                      <span>Depositante</span>
                      <strong>{{ activeConciliationModal.qrScan.parsed.depositante }}</strong>
                    </div>
                    <div v-if="activeConciliationModal.qrScan.parsed.beneficiario" class="conciliation-qr-chip">
                      <span>Beneficiario</span>
                      <strong>{{ activeConciliationModal.qrScan.parsed.beneficiario }}</strong>
                    </div>
                  </div>
                </div>
                <div
                  v-if="!isConciliationCompletedWithReceipts(activeConciliationModal.conciliacion, activeConciliationModal.comprobantes) || activeConciliationModal.showUploadComposer"
                  class="conciliation-form-actions"
                >
                  <span v-if="activeConciliationModal.selectedFileName" class="calendar-selection-pill">
                    Archivo: <strong>{{ activeConciliationModal.selectedFileName }}</strong>
                  </span>
                  <button type="button" class="toolbar-export-btn" @click="submitConciliationReceipt">
                    <i class="fas fa-upload"></i>
                    <span>Guardar comprobante</span>
                  </button>
                </div>
                <div v-else class="empty-state users-modal-empty conciliation-upload-complete-state">
                  <h3>Día ya conciliado</h3>
                  <p>Este día ya tiene comprobante cargado y la conciliación figura como cumplida. Solo vuelva a subir una imagen si desea reemplazar o agregar otro comprobante.</p>
                  <button type="button" class="action-btn action-btn-primary" @click="openConciliationUploadComposer">
                    <i class="fas fa-upload"></i>
                    <span>Cargar otro comprobante</span>
                  </button>
                </div>
              </div>

              <div class="conciliation-form-card conciliation-receipts-panel">
                <div class="conciliation-detail-head conciliation-detail-head-form">
                  <div>
                    <p class="detail-kicker mb-1">Comprobantes registrados</p>
                    <h4>Historial del día</h4>
                    <p class="detail-copy mb-0">Revise los comprobantes subidos, abra el archivo o elimine registros incorrectos.</p>
                  </div>
                </div>
                <div v-if="activeConciliationModal.loading" class="empty-state users-modal-empty">
                  <h3>Cargando conciliación</h3>
                  <p>Estamos consultando los comprobantes registrados para esta fecha.</p>
                </div>

                <div v-else-if="activeConciliationModal.comprobantes.length" class="conciliation-receipts-list">
                  <article v-for="receipt in activeConciliationModal.comprobantes" :key="receipt.id" class="conciliation-receipt-card">
                    <div class="conciliation-receipt-main">
                      <strong>{{ formatCurrency(receipt.montoDepositado) }}</strong>
                      <small>{{ formatDateLabel(receipt.fechaDeposito) }}</small>
                      <small>{{ receipt.banco || 'Sin banco' }}<span v-if="receipt.referencia"> · {{ receipt.referencia }}</span></small>
                      <small>{{ receipt.observacion || 'Sin observación' }}</small>
                      <small>Subido por {{ receipt.subidoPorNombre || receipt.subidoPorEmail || 'Sin usuario' }} · {{ formatDate(receipt.createdAt) }}</small>
                    </div>
                    <div class="conciliation-receipt-actions">
                      <a class="action-secondary-btn" :href="receipt.archivoUrl" target="_blank" rel="noopener">
                        <i class="fas fa-paperclip"></i>
                        <span>Ver archivo</span>
                      </a>
                      <button type="button" class="action-danger-btn" @click="deleteConciliationReceipt(receipt)">
                        <i class="fas fa-trash-alt"></i>
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </article>
                </div>

                <div v-else class="empty-state users-modal-empty">
                  <h3>Sin comprobantes</h3>
                  <p>Todavia no se cargaron comprobantes para esta sucursal en la fecha seleccionada.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AdminTemplate>
  </div>
</template>

<script>
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import jsQR from 'jsqr';
import { saveAs } from 'file-saver';

let zxingModulePromise = null;
let qrScannerModulePromise = null;

export default {
  data() {
    return {
      load: false,
      exportExcelLoading: false,
      exportPdfLoading: false,
      page: 'Reportes',
      modulo: 'Kardex',
      error: '',
      qrScanDebugEntries: [],
      isSyncingFilters: false,
      searchTimer: null,
      activeLoadReportToken: 0,
      branchVentasCache: {},
      pdfAssetCache: {},
      startDate: '',
      endDate: '',
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
      branchTotalsByBranch: {},
      branchCatalog: [
        { id: '000-0', codigoSucursal: '000', puntoVenta: '0', departamento: 'LA PAZ', nombre: 'LA PAZ', sucursalNombre: 'LA PAZ' },
        { id: '001-0', codigoSucursal: '001', puntoVenta: '0', departamento: 'SANTA CRUZ DE LA SIERRA', nombre: 'SANTA CRUZ DE LA SIERRA', sucursalNombre: 'SANTA CRUZ DE LA SIERRA' },
        { id: '002-0', codigoSucursal: '002', puntoVenta: '0', departamento: 'COCHABAMBA', nombre: 'COCHABAMBA', sucursalNombre: 'COCHABAMBA' },
        { id: '003-0', codigoSucursal: '003', puntoVenta: '0', departamento: 'ORURO', nombre: 'ORURO', sucursalNombre: 'ORURO' },
        { id: '004-0', codigoSucursal: '004', puntoVenta: '0', departamento: 'POTOSI', nombre: 'POTOSI', sucursalNombre: 'POTOSI' },
        { id: '005-0', codigoSucursal: '005', puntoVenta: '0', departamento: 'SUCRE', nombre: 'SUCRE', sucursalNombre: 'SUCRE' },
        { id: '006-0', codigoSucursal: '006', puntoVenta: '0', departamento: 'TARIJA', nombre: 'TARIJA', sucursalNombre: 'TARIJA' },
        { id: '007-0', codigoSucursal: '007', puntoVenta: '0', departamento: 'COBIJA', nombre: 'COBIJA', sucursalNombre: 'COBIJA' },
        { id: '008-0', codigoSucursal: '008', puntoVenta: '0', departamento: 'TRINIDAD', nombre: 'TRINIDAD', sucursalNombre: 'TRINIDAD' }
      ],
      calendarAnchorMonth: '',
      conciliacionSummaryRows: [],
      userCountsByBranch: {},
      activeUsersModal: null,
      activeIncidentsModal: null,
      activeConciliationModal: null
    };
  },
  computed: {
    calendarWeekdays() {
      return ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
    },
    selectedConciliationDate() {
      return this.endDate || this.startDate || this.defaultToday();
    },
    isSingleDaySelection() {
      return Boolean(this.startDate && this.endDate && this.startDate === this.endDate);
    },
    conciliacionSummaryByBranch() {
      return (this.conciliacionSummaryRows || []).reduce((acc, row) => {
        const key = this.branchKey(row?.codigoSucursal, row?.puntoVenta);
        acc[key] = row;
        return acc;
      }, {});
    },
    calendarMonthLabel() {
      const date = this.calendarMonthDate();
      return date.toLocaleDateString('es-BO', {
        month: 'long',
        year: 'numeric'
      });
    },
    activeConciliationCalendarLabel() {
      if (!this.activeConciliationModal) {
        return '';
      }

      const date = this.activeConciliationCalendarMonthDate();
      return date.toLocaleDateString('es-BO', {
        month: 'long',
        year: 'numeric'
      });
    },
    activeConciliationQrHasSource() {
      const scanner = this.activeConciliationModal?.qrScanner;
      return Boolean(scanner?.previewUrl);
    },
    activeConciliationQrCropStyle() {
      const crop = this.activeConciliationModal?.qrScanner?.crop || { x: 0.58, y: 0.63, w: 0.18, h: 0.18 };
      const mediaBox = this.getConciliationQrMediaBox();
      return {
        left: `${(mediaBox.leftRatio + (crop.x * mediaBox.widthRatio)) * 100}%`,
        top: `${(mediaBox.topRatio + (crop.y * mediaBox.heightRatio)) * 100}%`,
        width: `${crop.w * mediaBox.widthRatio * 100}%`,
        height: `${crop.h * mediaBox.heightRatio * 100}%`
      };
    },
    calendarDays() {
      const monthDate = this.calendarMonthDate();
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const startWeekDay = (firstDay.getDay() + 6) % 7;
      const gridStart = new Date(year, month, 1 - startWeekDay);
      const activeDate = this.selectedConciliationDate;
      const today = this.defaultToday();

      return Array.from({ length: 42 }, (_, index) => {
        const current = new Date(gridStart);
        current.setDate(gridStart.getDate() + index);
        const iso = this.dateToIso(current);
        const receipts = this.conciliacionSummaryRows.filter((row) => row?.fecha === iso);
        const receiptCount = receipts.reduce((acc, row) => acc + Number(row?.receiptCount || 0), 0);

        return {
          key: `${iso}-${index}`,
          iso,
          dayNumber: current.getDate(),
          isCurrentMonth: current.getMonth() === month,
          isToday: iso === today,
          isSelected: iso === activeDate,
          hasReceipts: receiptCount > 0,
          receiptCount
        };
      });
    },
    activeConciliationCalendarDays() {
      if (!this.activeConciliationModal) {
        return [];
      }

      const monthDate = this.activeConciliationCalendarMonthDate();
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const startWeekDay = (firstDay.getDay() + 6) % 7;
      const gridStart = new Date(year, month, 1 - startWeekDay);
      const activeDate = this.activeConciliationModal.selectedDate || this.defaultToday();
      const today = this.defaultToday();

      return Array.from({ length: 42 }, (_, index) => {
        const current = new Date(gridStart);
        current.setDate(gridStart.getDate() + index);
        const iso = this.dateToIso(current);
        const receipts = this.conciliacionSummaryRows.filter((row) =>
          row?.fecha === iso
          && this.branchKey(row?.codigoSucursal, row?.puntoVenta) === this.activeConciliationModal.branchKey
        );
        const receiptCount = receipts.reduce((acc, row) => acc + Number(row?.receiptCount || 0), 0);
        const hasCompleted = receipts.some((row) => String(row?.estado || '').toLowerCase() === 'conciliado');

        return {
          key: `${iso}-${index}`,
          iso,
          dayNumber: current.getDate(),
          isCurrentMonth: current.getMonth() === month,
          isToday: iso === today,
          isSelected: iso === activeDate,
          hasReceipts: receiptCount > 0,
          receiptCount,
          isCompleted: hasCompleted
        };
      });
    },
    branchRows() {
      const reportedRows = Array.isArray(this.report.sucursales) ? this.report.sucursales : [];
      const reportedMap = reportedRows.reduce((acc, item) => {
        const key = this.branchKey(item?.codigoSucursal, item?.puntoVenta);
        acc[key] = item;
        return acc;
      }, {});

      const mergedRows = this.branchCatalog.map((baseItem) => {
        const key = this.branchKey(baseItem.codigoSucursal, baseItem.puntoVenta);
        return {
          ...this.emptyBranchRow(baseItem),
          ...(reportedMap[key] || {})
        };
      });

      reportedRows.forEach((item) => {
        const key = this.branchKey(item?.codigoSucursal, item?.puntoVenta);
        if (!mergedRows.find((row) => this.branchKey(row?.codigoSucursal, row?.puntoVenta) === key)) {
          mergedRows.push(item);
        }
      });

      return mergedRows.map((item, index) => this.normalizeBranch(item, index));
    },
    filteredBranches() {
      return this.branchRows.filter((item) => {
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
        acc.totalQrFacturado += item.totalQrFacturado || 0;
        acc.totalEfectivoFacturado += item.totalEfectivoFacturado || 0;
        acc.totalEcaFacturado += item.totalEcaFacturado || 0;
        acc.totalContratosNoSumados += item.totalContratosNoSumados || 0;
        acc.totalQrPagadoPendienteFactura += item.totalQrPagadoPendienteFactura || 0;

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
        ventasNetas: 0,
        totalQrFacturado: 0,
        totalEfectivoFacturado: 0,
        totalEcaFacturado: 0,
        totalContratosNoSumados: 0,
        totalQrPagadoPendienteFactura: 0
      });
    },
    formattedSelectedDate() {
      const startDate = this.startDate;
      const endDate = this.endDate;

      if (!startDate && !endDate) {
        return 'Mes actual';
      }

      return `${this.formatDateLabel(startDate)} al ${this.formatDateLabel(endDate)}`;
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
        return 'Priorice la revisión de sucursales con ventas observadas.';
      }

      if (this.dashboardMetrics.pendientes) {
        return 'Hay sucursales con pendientes operativos que requieren seguimiento.';
      }

      return 'Todas las sucursales visibles estan sin observaciones.';
    }
  },
  mounted() {
    this.initializeDateRange();
    this.initializeCalendarAnchor();
    this.loadReport();
    this.syncRouteConciliationState();
  },
  beforeDestroy() {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    this.releaseConciliationQrBitmap(this.activeConciliationModal?.qrScanner?.sourceBitmap || null);
    this.stopConciliationCameraStream();
  },
  watch: {
    startDate() {
      this.initializeCalendarAnchor();
    },
    endDate() {
      this.initializeCalendarAnchor();
    },
    'filters.q'() {
      this.scheduleLoadReport();
    },
    'filters.codigoSucursal'() {
      this.scheduleLoadReport();
    },
    'filters.puntoVenta'() {
      this.scheduleLoadReport();
    },
    '$route.query': {
      handler() {
        this.syncRouteConciliationState();
      }
    }
  },
  methods: {
    initializeDateRange() {
      const today = this.defaultToday();
      this.endDate = today;
      this.startDate = today;
    },
    initializeCalendarAnchor() {
      this.calendarAnchorMonth = this.startOfMonth(this.selectedConciliationDate || this.defaultToday());
    },
    goToConciliation(item) {
      const selectedDate = this.endDate || this.startDate || this.defaultToday();
      const codigoSucursal = this.normalizeNonNegativeInteger(item?.codigoSucursal, 0);
      const puntoVenta = this.normalizeNonNegativeInteger(item?.puntoVenta, 0);
      this.$router.push({
        path: this.$route.path,
        query: {
          ...this.$route.query,
          view: 'conciliation',
          fecha: selectedDate,
          codigoSucursal: String(codigoSucursal),
          puntoVenta: String(puntoVenta)
        }
      });
    },
    async syncRouteConciliationState() {
      const view = String(this.$route.query?.view || '').toLowerCase();
      if (view !== 'conciliation') {
        if (this.activeConciliationModal) {
          this.stopConciliationCameraStream();
          this.activeConciliationModal = null;
        }
        return;
      }

      const fecha = String(this.$route.query?.fecha || this.endDate || this.startDate || this.defaultToday());
      const codigoSucursal = this.normalizeNonNegativeInteger(this.$route.query?.codigoSucursal, NaN);
      const puntoVenta = this.normalizeNonNegativeInteger(this.$route.query?.puntoVenta, NaN);
      if (Number.isNaN(codigoSucursal) || Number.isNaN(puntoVenta)) {
        return;
      }

      const branch = this.branchRows.find((row) => (
        Number(row?.codigoSucursal ?? -1) === codigoSucursal
        && Number(row?.puntoVenta ?? -1) === puntoVenta
      ));

      const nextKey = this.branchKey(codigoSucursal, puntoVenta);
      if (
        this.activeConciliationModal
        && this.activeConciliationModal.branchKey === nextKey
        && this.activeConciliationModal.selectedDate === fecha
      ) {
        return;
      }

      const fallbackItem = branch || {
        codigoSucursal,
        puntoVenta,
        displayName: `Sucursal ${String(codigoSucursal).padStart(3, '0')}`,
        departamento: '',
        nombre: '',
        conciliacion: this.emptyConciliacion({ codigoSucursal, puntoVenta })
      };

      await this.openConciliationModal(fallbackItem, { selectedDate: fecha, fromRoute: true });
    },
    branchKey(codigoSucursal, puntoVenta) {
      const codigo = String(this.normalizeNonNegativeInteger(codigoSucursal, 0)).padStart(3, '0');
      const punto = String(this.normalizeNonNegativeInteger(puntoVenta, 0));
      return `${codigo}-${punto}`;
    },
    normalizeNonNegativeInteger(value, fallback = 0) {
      if (Array.isArray(value)) {
        return this.normalizeNonNegativeInteger(value[0], fallback);
      }

      if (typeof value === 'number' && Number.isFinite(value)) {
        return value >= 0 ? Math.trunc(value) : fallback;
      }

      const text = String(value ?? '').trim();
      if (!text) {
        return fallback;
      }

      const match = text.match(/\d+/);
      if (!match) {
        return fallback;
      }

      const parsed = Number.parseInt(match[0], 10);
      return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
    },
    dateToIso(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    calendarMonthDate() {
      const base = this.calendarAnchorMonth || this.startOfMonth(this.selectedConciliationDate || this.defaultToday());
      const [year, month] = String(base).split('-');
      return new Date(Number(year || 0), Math.max(0, Number(month || 1) - 1), 1);
    },
    activeConciliationCalendarMonthDate() {
      const base = this.activeConciliationModal?.calendarAnchorMonth
        || this.startOfMonth(this.activeConciliationModal?.selectedDate || this.defaultToday());
      const [year, month] = String(base).split('-');
      return new Date(Number(year || 0), Math.max(0, Number(month || 1) - 1), 1);
    },
    moveCalendarMonth(step) {
      const current = this.calendarMonthDate();
      current.setMonth(current.getMonth() + step);
      this.calendarAnchorMonth = this.startOfMonth(this.dateToIso(current));
    },
    jumpCalendarToToday() {
      const today = this.defaultToday();
      this.calendarAnchorMonth = this.startOfMonth(today);
      this.startDate = today;
      this.endDate = today;
    },
    selectCalendarDay(day) {
      if (!day?.iso) {
        return;
      }

      this.startDate = day.iso;
      this.endDate = day.iso;
      this.calendarAnchorMonth = this.startOfMonth(day.iso);
    },
    moveActiveConciliationCalendar(step) {
      if (!this.activeConciliationModal) {
        return;
      }

      const current = this.activeConciliationCalendarMonthDate();
      current.setMonth(current.getMonth() + step);
      this.activeConciliationModal = {
        ...this.activeConciliationModal,
        calendarAnchorMonth: this.startOfMonth(this.dateToIso(current))
      };
    },
    async jumpActiveConciliationCalendarToToday() {
      if (!this.activeConciliationModal) {
        return;
      }

      const today = this.defaultToday();
      this.resetActiveConciliationEntryState();
      this.activeConciliationModal = {
        ...this.activeConciliationModal,
        selectedDate: today,
        fecha: today,
        calendarAnchorMonth: this.startOfMonth(today)
      };
      this.$router.replace({
        path: this.$route.path,
        query: {
          ...this.$route.query,
          view: 'conciliation',
          fecha: today,
          codigoSucursal: String(this.activeConciliationModal.codigoSucursal),
          puntoVenta: String(this.activeConciliationModal.puntoVenta)
        }
      });
      await this.reloadActiveConciliationDetail();
      this.scrollConciliationUploadIntoView();
    },
    async selectActiveConciliationDay(day) {
      if (!day?.iso || !this.activeConciliationModal) {
        return;
      }

      this.resetActiveConciliationEntryState();
      this.activeConciliationModal = {
        ...this.activeConciliationModal,
        selectedDate: day.iso,
        fecha: day.iso,
        calendarAnchorMonth: this.startOfMonth(day.iso)
      };
      this.$router.replace({
        path: this.$route.path,
        query: {
          ...this.$route.query,
          view: 'conciliation',
          fecha: day.iso,
          codigoSucursal: String(this.activeConciliationModal.codigoSucursal),
          puntoVenta: String(this.activeConciliationModal.puntoVenta)
        }
      });
      await this.reloadActiveConciliationDetail();
      this.scrollConciliationUploadIntoView();
      this.focusConciliationAmountField();
    },
    scrollConciliationDetailIntoView() {
      this.$nextTick(() => {
        const panel = this.$refs?.conciliationDetailPanel;
        if (panel && typeof panel.scrollIntoView === 'function') {
          panel.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    },
    scrollConciliationUploadIntoView() {
      this.$nextTick(() => {
        const panel = this.$refs?.conciliationUploadPanel;
        if (panel && typeof panel.scrollIntoView === 'function') {
          panel.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    },
    emptyConciliationQrScanner() {
      return {
        loadingDevices: true,
        cameras: [],
        selectedDeviceId: '',
        mode: '',
        sourceBitmap: null,
        previewUrl: '',
        previewFileName: '',
        statusMessage: 'Selecciona una imagen del comprobante para comenzar el recorte.',
        cropEnabled: true,
        crop: {
          x: 0.58,
          y: 0.63,
          w: 0.18,
          h: 0.18
        },
        cropSelectionStart: null,
        cropSelecting: false,
        stream: null
      };
    },
    async loadConciliationCameraDevices() {
      if (!process.client || typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices || !this.activeConciliationModal) {
        if (this.activeConciliationModal) {
          this.activeConciliationModal = {
            ...this.activeConciliationModal,
            qrScanner: {
              ...this.activeConciliationModal.qrScanner,
              loadingDevices: false,
              cameras: [],
              statusMessage: 'Selecciona una imagen del comprobante para comenzar el recorte.'
            }
          };
        }
        return;
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices
          .filter((device) => device.kind === 'videoinput')
          .map((device, index) => ({
            deviceId: device.deviceId,
            label: device.label || `Camara ${index + 1}`
          }));

        if (!this.activeConciliationModal) {
          return;
        }

        this.activeConciliationModal = {
          ...this.activeConciliationModal,
          qrScanner: {
            ...this.activeConciliationModal.qrScanner,
            loadingDevices: false,
            cameras,
            selectedDeviceId: this.activeConciliationModal.qrScanner.selectedDeviceId || cameras?.[0]?.deviceId || '',
            statusMessage: 'Selecciona una imagen del comprobante para comenzar el recorte.'
          }
        };
      } catch (error) {
        if (!this.activeConciliationModal) {
          return;
        }

        this.activeConciliationModal = {
          ...this.activeConciliationModal,
          qrScanner: {
            ...this.activeConciliationModal.qrScanner,
            loadingDevices: false,
            cameras: [],
            statusMessage: 'Selecciona una imagen del comprobante para comenzar el recorte.'
          }
        };
      }
    },
    triggerConciliationScannerImagePicker() {
      const ref = this.$refs?.conciliationQrScannerInput;
      const input = Array.isArray(ref) ? ref[0] : ref;
      if (input && typeof input.click === 'function') {
        input.click();
      }
    },
    resetActiveConciliationEntryState() {
      if (!this.activeConciliationModal) {
        return;
      }

      const currentScanner = this.activeConciliationModal.qrScanner || this.emptyConciliationQrScanner();
      this.stopConciliationCameraStream();
      this.activeConciliationModal = {
        ...this.activeConciliationModal,
        selectedFile: null,
        selectedFileName: '',
        entryMode: this.activeConciliationModal.entryMode || 'qr',
        qrScan: {
          status: 'idle',
          message: '',
          rawText: '',
          parsed: null
        },
        qrScanner: {
          ...this.emptyConciliationQrScanner(),
          loadingDevices: currentScanner.loadingDevices,
          cameras: currentScanner.cameras || [],
          selectedDeviceId: currentScanner.selectedDeviceId || ''
        },
        form: {
          montoDepositado: '',
          banco: '',
          nombreBanco: '',
          usuarioBanco: '',
          agenciaBanco: '',
          transaccionBanco: '',
          fechaComprobante: '',
          monedaComprobante: '',
          depositante: '',
          beneficiario: '',
          referencia: '',
          observacion: ''
        }
      };
    },
    focusConciliationAmountField() {
      this.$nextTick(() => {
        const ref = this.$refs?.conciliationAmountInput;
        const input = Array.isArray(ref) ? ref[0] : ref;
        if (input && typeof input.focus === 'function') {
          input.focus();
        }
      });
    },
    pushQrScanDebug(message) {
      const nextEntry = String(message || '').trim();
      if (!nextEntry) {
        return;
      }

      this.qrScanDebugEntries = [
        ...this.qrScanDebugEntries.slice(-11),
        nextEntry
      ];
    },
    stopConciliationCameraStream() {
      const stream = this.activeConciliationModal?.qrScanner?.stream || null;
      if (stream?.getTracks) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const ref = this.$refs?.conciliationQrVideo;
      const video = Array.isArray(ref) ? ref[0] : ref;
      if (video) {
        video.srcObject = null;
      }

      if (this.activeConciliationModal?.qrScanner) {
        this.activeConciliationModal = {
          ...this.activeConciliationModal,
          qrScanner: {
            ...this.activeConciliationModal.qrScanner,
            stream: null,
            mode: this.activeConciliationModal.qrScanner.previewUrl ? 'image' : '',
            statusMessage: this.activeConciliationModal.qrScanner.previewUrl
              ? 'Imagen lista para procesar.'
              : 'Selecciona una imagen del comprobante para comenzar el recorte.'
          }
        };
      }
    },
    releaseConciliationQrBitmap(bitmap) {
      if (bitmap && typeof bitmap.close === 'function') {
        try {
          bitmap.close();
        } catch (error) {
          // ignore bitmap cleanup failure
        }
      }
    },
    async createConciliationImageBitmap(file) {
      if (!process.client || typeof window === 'undefined' || typeof window.createImageBitmap !== 'function' || !file) {
        return null;
      }

      try {
        return await window.createImageBitmap(file, { imageOrientation: 'from-image' });
      } catch (error) {
        try {
          return await window.createImageBitmap(file);
        } catch (innerError) {
          return null;
        }
      }
    },
    async activateConciliationCamera() {
      if (!process.client || typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia || !this.activeConciliationModal) {
        return;
      }

      this.stopConciliationCameraStream();

      try {
        const selectedDeviceId = this.activeConciliationModal.qrScanner.selectedDeviceId;
        const constraints = selectedDeviceId
          ? { video: { deviceId: { exact: selectedDeviceId } } }
          : { video: { facingMode: 'environment' } };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (!this.activeConciliationModal) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        this.activeConciliationModal = {
          ...this.activeConciliationModal,
          qrScanner: {
            ...this.activeConciliationModal.qrScanner,
            mode: 'camera',
            sourceBitmap: null,
            stream,
            previewUrl: '',
            cropEnabled: true,
            statusMessage: 'Camara activa. Arrastre para seleccionar el area del QR y luego procesela.'
          }
        };

        this.$nextTick(() => {
          const ref = this.$refs?.conciliationQrVideo;
          const video = Array.isArray(ref) ? ref[0] : ref;
          if (video) {
            video.srcObject = stream;
            video.play?.().catch(() => {});
          }
        });
      } catch (error) {
        this.stopConciliationCameraStream();
        if (!this.activeConciliationModal) {
          return;
        }

        this.activeConciliationModal = {
          ...this.activeConciliationModal,
          qrScanner: {
            ...this.activeConciliationModal.qrScanner,
            statusMessage: 'No se detectó ninguna cámara. Verifique los permisos del navegador o use la opción de imagen.'
          }
        };
      }
    },
    async onConciliationScannerImageChange(event) {
      const file = event?.target?.files?.[0] || null;
      if (!this.activeConciliationModal) {
        return;
      }

      const previousBitmap = this.activeConciliationModal?.qrScanner?.sourceBitmap || null;

      let nextModal = {
        ...this.activeConciliationModal,
        selectedFile: file,
        selectedFileName: file?.name || '',
        qrScan: {
          status: 'idle',
          message: '',
          rawText: '',
          parsed: null
        }
      };
      this.activeConciliationModal = nextModal;

      if (!file) {
        this.releaseConciliationQrBitmap(previousBitmap);
        if (this.activeConciliationModal?.qrScanner) {
          this.activeConciliationModal = {
            ...this.activeConciliationModal,
            qrScanner: {
              ...this.activeConciliationModal.qrScanner,
              sourceBitmap: null,
              previewUrl: '',
              previewFileName: '',
              mode: '',
              statusMessage: 'Selecciona una imagen del comprobante para comenzar el recorte.'
            }
          };
        }
        return;
      }

      this.stopConciliationCameraStream();

      const mimeType = String(file.type || '').toLowerCase();
      const isImage = mimeType.startsWith('image/');

      if (!isImage) {
        this.releaseConciliationQrBitmap(previousBitmap);
        this.activeConciliationModal = {
          ...this.activeConciliationModal,
          qrScan: {
            status: 'unsupported',
            message: 'El archivo fue cargado correctamente. La lectura automatica del QR solo funciona con imagenes.',
            rawText: '',
            parsed: null
          }
        };
        return;
      }

      try {
        const [previewUrl, sourceBitmap] = await Promise.all([
          this.readFileAsDataUrl(file),
          this.createConciliationImageBitmap(file)
        ]);

        this.releaseConciliationQrBitmap(previousBitmap);

        if (this.activeConciliationModal?.qrScanner) {
          this.activeConciliationModal = {
            ...this.activeConciliationModal,
            qrScanner: {
              ...this.activeConciliationModal.qrScanner,
              mode: 'image',
              sourceBitmap,
              cropEnabled: true,
              previewUrl,
              previewFileName: file.name || '',
              statusMessage: 'Imagen cargada. Arrastre para seleccionar el area del QR y luego procesela.'
            }
          };
        }
      } catch (error) {
        this.releaseConciliationQrBitmap(previousBitmap);
        // preview is optional
      }

      this.activeConciliationModal = {
        ...this.activeConciliationModal,
        qrScan: {
          status: 'idle',
          message: 'Imagen lista. Puede procesar el QR cuando desee.',
          rawText: '',
          parsed: null
        }
      };
    },
    readFileAsDataUrl(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
    },
    async cloneFileForUpload(file) {
      if (!file) {
        return null;
      }

      if (process.client && typeof File === 'function' && typeof file.arrayBuffer === 'function') {
        const buffer = await file.arrayBuffer();
        return new File([buffer], file.name || 'comprobante', {
          type: file.type || 'application/octet-stream',
          lastModified: file.lastModified || Date.now()
        });
      }

      return file;
    },
    dataUrlToUploadFile(dataUrl, filename = 'comprobante.png') {
      const raw = String(dataUrl || '').trim();
      if (!raw.startsWith('data:')) {
        return null;
      }

      const parts = raw.split(',');
      if (parts.length < 2) {
        return null;
      }

      const header = parts[0] || '';
      const body = parts.slice(1).join(',');
      const mimeMatch = header.match(/^data:([^;]+);base64$/i);
      const mimeType = mimeMatch?.[1] || 'image/png';

      try {
        const binary = window.atob(body);
        const bytes = new Uint8Array(binary.length);
        for (let index = 0; index < binary.length; index += 1) {
          bytes[index] = binary.charCodeAt(index);
        }

        return new File([bytes], filename, {
          type: mimeType,
          lastModified: Date.now()
        });
      } catch (error) {
        return null;
      }
    },
    async resolveConciliationUploadFile() {
      const selectedFile = this.activeConciliationModal?.selectedFile || null;
      if (selectedFile) {
        return this.cloneFileForUpload(selectedFile);
      }

      const previewUrl = this.activeConciliationModal?.qrScanner?.previewUrl || '';
      const fallbackName = this.activeConciliationModal?.selectedFileName || 'comprobante.png';
      if (previewUrl) {
        return this.dataUrlToUploadFile(previewUrl, fallbackName);
      }

      return null;
    },
    canvasToDataUrl(canvas) {
      if (!canvas || typeof canvas.toDataURL !== 'function') {
        return '';
      }

      try {
        return canvas.toDataURL('image/png');
      } catch (error) {
        return '';
      }
    },
    emptyConciliacion(item = {}) {
      return {
        id: null,
        fecha: this.selectedConciliationDate,
        codigoSucursal: Number(item?.codigoSucursal || 0),
        puntoVenta: Number(item?.puntoVenta || 0),
        sucursalNombre: item?.displayName || item?.sucursalNombre || item?.nombre || '',
        totalEfectivoSistema: Number(item?.totalEfectivoFacturado || 0),
        totalQrSistema: Number(item?.totalQrFacturado || 0),
        totalGeneralSistema: Number(item?.totalVendido || 0),
        totalComprobantes: 0,
        diferencia: Number(item?.totalEfectivoFacturado || 0) * -1,
        estado: 'sin_comprobante',
        receiptCount: 0,
        updatedAt: null
      };
    },
    conciliacionLabel(conciliacion) {
      const estado = String(conciliacion?.estado || 'sin_comprobante').toLowerCase();
      if (estado === 'conciliado') return 'Conciliado';
      if (estado === 'parcial') return 'Parcial';
      if (estado === 'con_diferencia') return 'Con diferencia';
      return 'Sin comprobante';
    },
    conciliacionStatusClass(conciliacion) {
      const estado = String(conciliacion?.estado || 'sin_comprobante').toLowerCase();
      if (estado === 'conciliado') return 'metric-tag-success';
      if (estado === 'parcial') return 'metric-tag-warning';
      if (estado === 'con_diferencia') return 'metric-tag-danger';
      return 'metric-tag-neutral';
    },
    isConciliationCompletedWithReceipts(conciliacion, comprobantes = []) {
      const estado = String(conciliacion?.estado || '').toLowerCase();
      return estado === 'conciliado' && Array.isArray(comprobantes) && comprobantes.length > 0;
    },
    openConciliationUploadComposer() {
      if (!this.activeConciliationModal) {
        return;
      }

      this.activeConciliationModal = {
        ...this.activeConciliationModal,
        showUploadComposer: true
      };
      this.scrollConciliationUploadIntoView();
    },
    conciliacionStatusPillClass(conciliacion) {
      const estado = String(conciliacion?.estado || 'sin_comprobante').toLowerCase();
      if (estado === 'conciliado') return 'calendar-selection-pill-success';
      if (estado === 'parcial') return 'calendar-selection-pill-warning';
      if (estado === 'con_diferencia') return 'calendar-selection-pill-danger';
      return 'calendar-selection-pill-neutral';
    },
    conciliationQrStatusLabel(status) {
      if (status === 'success') return 'QR detectado';
      if (status === 'loading') return 'Leyendo QR';
      if (status === 'error') return 'No legible';
      if (status === 'unsupported') return 'Sin lectura';
      return 'Sin lectura';
    },
    conciliationQrStatusClass(status) {
      if (status === 'success') return 'calendar-selection-pill-success';
      if (status === 'loading') return 'calendar-selection-pill-warning';
      if (status === 'error') return 'calendar-selection-pill-danger';
      return 'calendar-selection-pill-neutral';
    },
    async decodeQrFromImageFile(file) {
      if (!process.client || typeof window === 'undefined') {
        return null;
      }

      this.pushQrScanDebug(`Archivo recibido: ${file?.name || 'sin nombre'}`);
      const bitmap = await this.createConciliationImageBitmap(file);
      if (!bitmap) {
        return null;
      }

      try {
        const directScanResult = await this.decodeQrWithQrScanner(bitmap);
        if (directScanResult) {
          this.pushQrScanDebug('qr-scanner detecto el QR directamente desde el archivo.');
          return directScanResult;
        }

        const nativeResult = await this.decodeQrFromBitmapWithNativeDetector(bitmap);
        if (nativeResult) {
          this.pushQrScanDebug('BarcodeDetector detecto el QR desde el bitmap.');
          return nativeResult;
        }

        const fallbackCanvas = document.createElement('canvas');
        fallbackCanvas.width = bitmap.width;
        fallbackCanvas.height = bitmap.height;
        const ctx = fallbackCanvas.getContext('2d');
        if (!ctx) {
          return null;
        }

        ctx.drawImage(bitmap, 0, 0);
        this.pushQrScanDebug(`Bitmap convertido a canvas ${fallbackCanvas.width}x${fallbackCanvas.height}.`);
        return this.decodeQrFromCanvasWithJsQr(fallbackCanvas, { cropped: false, sourceLabel: 'archivo original' });
      } finally {
        this.releaseConciliationQrBitmap(bitmap);
      }
    },
    async decodeQrFromBitmapWithNativeDetector(bitmap) {
      if (!process.client || typeof window === 'undefined' || typeof window.BarcodeDetector === 'undefined' || !bitmap) {
        return null;
      }

      const supportedFormats = await window.BarcodeDetector.getSupportedFormats();
      if (!Array.isArray(supportedFormats) || !supportedFormats.includes('qr_code')) {
        return null;
      }

      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      const results = await detector.detect(bitmap);
      return results?.[0]?.rawValue ? String(results[0].rawValue) : null;
    },
    async decodeQrFromCanvas(canvas, options = {}) {
      if (!process.client || typeof window === 'undefined' || !canvas) {
        return null;
      }

      const { cropped = false } = options;

      try {
        const nativeBitmap = await createImageBitmap(canvas);
        try {
          const nativeResult = await this.decodeQrFromBitmapWithNativeDetector(nativeBitmap);
          if (nativeResult) {
            return nativeResult;
          }
        } finally {
          if (nativeBitmap && typeof nativeBitmap.close === 'function') {
            nativeBitmap.close();
          }
        }
      } catch (error) {
        // ignore native path failure and continue with jsQR
      }

      return this.decodeQrFromCanvasWithJsQr(canvas, { cropped });
    },
    async loadZxingModule() {
      if (!zxingModulePromise) {
        zxingModulePromise = import('@zxing/library');
      }

      return zxingModulePromise;
    },
    async loadQrScannerModule() {
      if (!qrScannerModulePromise) {
        qrScannerModulePromise = import('qr-scanner');
      }

      return qrScannerModulePromise;
    },
    async decodeQrWithQrScanner(source) {
      if (!process.client || typeof window === 'undefined' || !source) {
        return null;
      }

      try {
        const qrScannerModule = await this.loadQrScannerModule();
        const QrScanner = qrScannerModule.default || qrScannerModule;
        const result = await QrScanner.scanImage(source, {
          returnDetailedScanResult: true,
          highlightScanRegion: false,
          highlightCodeOutline: false
        });
        return result?.data ? String(result.data) : null;
      } catch (error) {
        return null;
      }
    },
    async decodeQrFromImageDataWithZxing(imageData, width, height) {
      if (!process.client || !imageData || !width || !height) {
        return null;
      }

      try {
        const zxing = await this.loadZxingModule();
        const {
          MultiFormatReader,
          BarcodeFormat,
          DecodeHintType,
          RGBLuminanceSource,
          BinaryBitmap,
          HybridBinarizer
        } = zxing;

        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
        hints.set(DecodeHintType.TRY_HARDER, true);

        const reader = new MultiFormatReader();
        reader.setHints(hints);

        const luminanceSource = new RGBLuminanceSource(imageData.data, width, height);
        const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));
        const result = reader.decode(binaryBitmap);
        return result?.getText ? String(result.getText()) : null;
      } catch (error) {
        return null;
      }
    },
    async decodeQrFromCanvasWithJsQr(canvas, options = {}) {
      if (!canvas) {
        return null;
      }

      const { cropped = false, sourceLabel = cropped ? 'recorte' : 'imagen completa' } = options;
      const candidates = this.buildQrScanCandidates({ cropped, canvas });
      console.info('[ventas/lista] qrScan:candidates', {
        cropped,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        candidates: candidates.length
      });
      this.pushQrScanDebug(`Analizando ${sourceLabel} ${canvas.width}x${canvas.height} con ${candidates.length} intento(s).`);

      for (let index = 0; index < candidates.length; index += 1) {
        if (index > 0) {
          await this.pauseQrScanIteration();
        }

        const candidateConfig = candidates[index];
        const candidate = this.createQrScanCanvasVariant(canvas, candidateConfig);
        if (!candidate) {
          continue;
        }

        const qrScannerValue = await this.decodeQrWithQrScanner(candidate);
        if (qrScannerValue) {
          console.info('[ventas/lista] qrScan:success', {
            engine: 'qr-scanner',
            candidateIndex: index,
            cropped
          });
          this.pushQrScanDebug(`Intento ${index + 1}: QR detectado con qr-scanner.`);
          return qrScannerValue;
        }

        const workingCtx = candidate.getContext('2d', { willReadFrequently: true });
        if (!workingCtx) {
          continue;
        }

        const imageData = workingCtx.getImageData(0, 0, candidate.width, candidate.height);
        const result = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth'
        });
        if (result?.data) {
          console.info('[ventas/lista] qrScan:success', {
            engine: 'jsqr',
            candidateIndex: index,
            cropped
          });
          this.pushQrScanDebug(`Intento ${index + 1}: QR detectado con jsQR.`);
          return String(result.data);
        }

        if (candidateConfig.useZxing) {
          const zxingValue = await this.decodeQrFromImageDataWithZxing(imageData, candidate.width, candidate.height);
          if (zxingValue) {
            console.info('[ventas/lista] qrScan:success', {
              engine: 'zxing',
              candidateIndex: index,
              cropped
            });
            this.pushQrScanDebug(`Intento ${index + 1}: QR detectado con ZXing.`);
            return zxingValue;
          }
        }

        if (index < 4) {
          this.pushQrScanDebug(`Intento ${index + 1}: sin coincidencia (${candidate.width}x${candidate.height}).`);
        }
      }

      console.warn('[ventas/lista] qrScan:not-found', {
        cropped,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height
      });
      this.pushQrScanDebug('No se encontro ningun QR valido en los intentos realizados.');
      return null;
    },
    pauseQrScanIteration() {
      return new Promise((resolve) => {
        if (process.client && typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
          window.requestAnimationFrame(() => resolve());
          return;
        }

        setTimeout(resolve, 0);
      });
    },
    getConciliationQrStagePoint(event) {
      const mediaBox = this.getConciliationQrMediaBox();
      if (!mediaBox.rect.width || !mediaBox.rect.height || !mediaBox.contentWidth || !mediaBox.contentHeight) {
        return null;
      }

      const x = Math.min(
        Math.max(0, (event.clientX - mediaBox.contentLeft) / mediaBox.contentWidth),
        1
      );
      const y = Math.min(
        Math.max(0, (event.clientY - mediaBox.contentTop) / mediaBox.contentHeight),
        1
      );
      return { x, y };
    },
    getConciliationQrMediaBox() {
      const imageRef = this.activeConciliationModal?.qrScanner?.mode === 'camera'
        ? this.$refs?.conciliationQrVideo
        : this.$refs?.conciliationQrImage;
      const media = Array.isArray(imageRef) ? imageRef[0] : imageRef;
      const sourceBitmap = this.activeConciliationModal?.qrScanner?.sourceBitmap || null;
      if (!media?.getBoundingClientRect) {
        return {
          rect: { width: 0, height: 0 },
          contentLeft: 0,
          contentTop: 0,
          contentWidth: 0,
          contentHeight: 0,
          leftRatio: 0,
          topRatio: 0,
          widthRatio: 1,
          heightRatio: 1
        };
      }

      const rect = media.getBoundingClientRect();
      const boxWidth = rect.width || 0;
      const boxHeight = rect.height || 0;
      const naturalWidth = sourceBitmap?.width || media.videoWidth || media.naturalWidth || boxWidth || 0;
      const naturalHeight = sourceBitmap?.height || media.videoHeight || media.naturalHeight || boxHeight || 0;

      if (!boxWidth || !boxHeight || !naturalWidth || !naturalHeight) {
        return {
          rect,
          contentLeft: rect.left,
          contentTop: rect.top,
          contentWidth: boxWidth,
          contentHeight: boxHeight,
          leftRatio: 0,
          topRatio: 0,
          widthRatio: 1,
          heightRatio: 1
        };
      }

      const mediaRatio = naturalWidth / naturalHeight;
      const boxRatio = boxWidth / boxHeight;
      let contentWidth = boxWidth;
      let contentHeight = boxHeight;

      if (boxRatio > mediaRatio) {
        contentWidth = boxHeight * mediaRatio;
      } else {
        contentHeight = boxWidth / mediaRatio;
      }

      const contentLeft = rect.left + ((boxWidth - contentWidth) / 2);
      const contentTop = rect.top + ((boxHeight - contentHeight) / 2);

      return {
        rect,
        contentLeft,
        contentTop,
        contentWidth,
        contentHeight,
        leftRatio: boxWidth ? (contentLeft - rect.left) / boxWidth : 0,
        topRatio: boxHeight ? (contentTop - rect.top) / boxHeight : 0,
        widthRatio: boxWidth ? contentWidth / boxWidth : 1,
        heightRatio: boxHeight ? contentHeight / boxHeight : 1
      };
    },
    startConciliationQrSelection(event) {
      if (!this.activeConciliationModal?.qrScanner?.cropEnabled) {
        return;
      }

      const point = this.getConciliationQrStagePoint(event);
      if (!point) {
        return;
      }

      this.activeConciliationModal = {
        ...this.activeConciliationModal,
        qrScanner: {
          ...this.activeConciliationModal.qrScanner,
          cropSelectionStart: point,
          cropSelecting: true,
          crop: {
            x: point.x,
            y: point.y,
            w: 0.001,
            h: 0.001
          },
          statusMessage: 'Seleccionando area del QR...'
        }
      };
    },
    updateConciliationQrSelection(event) {
      if (!this.activeConciliationModal?.qrScanner?.cropEnabled || !this.activeConciliationModal?.qrScanner?.cropSelecting) {
        return;
      }

      const point = this.getConciliationQrStagePoint(event);
      const start = this.activeConciliationModal.qrScanner.cropSelectionStart;
      if (!point || !start) {
        return;
      }

      const nextCrop = {
        x: Math.min(start.x, point.x),
        y: Math.min(start.y, point.y),
        w: Math.max(0.001, Math.abs(point.x - start.x)),
        h: Math.max(0.001, Math.abs(point.y - start.y))
      };

      this.activeConciliationModal = {
        ...this.activeConciliationModal,
        qrScanner: {
          ...this.activeConciliationModal.qrScanner,
          crop: nextCrop,
          statusMessage: 'Arrastre para ampliar o ajustar el area del QR.'
        }
      };
    },
    finishConciliationQrSelection(event) {
      if (!this.activeConciliationModal?.qrScanner?.cropEnabled || !this.activeConciliationModal?.qrScanner?.cropSelecting) {
        return;
      }

      if (event) {
        this.updateConciliationQrSelection(event);
      }

      const crop = this.activeConciliationModal.qrScanner.crop || { x: 0.58, y: 0.63, w: 0.18, h: 0.18 };
      const normalizedCrop = {
        x: crop.x,
        y: crop.y,
        w: Math.max(0.04, crop.w),
        h: Math.max(0.04, crop.h)
      };

      this.activeConciliationModal = {
        ...this.activeConciliationModal,
        qrScanner: {
          ...this.activeConciliationModal.qrScanner,
          crop: normalizedCrop,
          cropSelectionStart: null,
          cropSelecting: false,
          statusMessage: 'Area QR seleccionada. Pulse "Procesar recorte" para analizarla.'
        }
      };
    },
    buildQrScanCandidates({ cropped = false, canvas = null } = {}) {
      if (cropped) {
        return [
          { region: { x: 0, y: 0, w: 1, h: 1 }, scale: 1, variant: 'none', rotation: 0, useZxing: true },
          { region: { x: 0, y: 0, w: 1, h: 1 }, scale: 2, variant: 'grayscale', rotation: 0, useZxing: true },
          { region: { x: 0, y: 0, w: 1, h: 1 }, scale: 3, variant: 'contrast', rotation: 0, useZxing: true },
          { region: { x: 0, y: 0, w: 1, h: 1 }, scale: 4, variant: 'threshold', rotation: 0, useZxing: true },
          { region: { x: 0, y: 0, w: 1, h: 1 }, scale: 3, variant: 'contrast', rotation: -4, useZxing: true },
          { region: { x: 0, y: 0, w: 1, h: 1 }, scale: 3, variant: 'contrast', rotation: 4, useZxing: true }
        ];
      }

      return [
        { region: { x: 0, y: 0, w: 1, h: 1 }, scale: 1, variant: 'none', rotation: 0, useZxing: true },
        { region: { x: 0, y: 0, w: 1, h: 1 }, scale: 1.5, variant: 'grayscale', rotation: 0, useZxing: true },
        { region: { x: 0.48, y: 0.48, w: 0.44, h: 0.44 }, scale: 3, variant: 'contrast', rotation: 0, useZxing: true },
        { region: { x: 0.48, y: 0.48, w: 0.44, h: 0.44 }, scale: 4, variant: 'threshold', rotation: 0, useZxing: true },
        { region: { x: 0.44, y: 0.44, w: 0.5, h: 0.5 }, scale: 3, variant: 'contrast', rotation: -4, useZxing: true },
        { region: { x: 0.44, y: 0.44, w: 0.5, h: 0.5 }, scale: 3, variant: 'contrast', rotation: 4, useZxing: true }
      ];
    },
    createQrScanCanvasVariant(sourceCanvas, { region, scale = 1, variant = 'none', rotation = 0 } = {}) {
      if (!sourceCanvas) {
        return null;
      }

      const sx = Math.max(0, Math.round(sourceCanvas.width * Number(region?.x || 0)));
      const sy = Math.max(0, Math.round(sourceCanvas.height * Number(region?.y || 0)));
      const sw = Math.max(1, Math.round(sourceCanvas.width * Number(region?.w || 1)));
      const sh = Math.max(1, Math.round(sourceCanvas.height * Number(region?.h || 1)));
      const dw = Math.max(1, Math.round(sw * scale));
      const dh = Math.max(1, Math.round(sh * scale));

      const workingCanvas = document.createElement('canvas');
      workingCanvas.width = dw;
      workingCanvas.height = dh;
      const ctx = workingCanvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        return null;
      }

      if (rotation) {
        ctx.save();
        ctx.translate(dw / 2, dh / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(sourceCanvas, sx, sy, sw, sh, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();
      } else {
        ctx.drawImage(sourceCanvas, sx, sy, sw, sh, 0, 0, dw, dh);
      }

      if (variant === 'none') {
        return workingCanvas;
      }

      const imageData = ctx.getImageData(0, 0, dw, dh);
      const data = imageData.data;

      for (let index = 0; index < data.length; index += 4) {
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const gray = Math.round((r * 0.299) + (g * 0.587) + (b * 0.114));

        if (variant === 'grayscale') {
          data[index] = gray;
          data[index + 1] = gray;
          data[index + 2] = gray;
        } else if (variant === 'contrast') {
          const contrasted = gray < 128 ? 0 : 255;
          data[index] = contrasted;
          data[index + 1] = contrasted;
          data[index + 2] = contrasted;
        } else if (variant === 'threshold') {
          const normalized = gray > 170 ? 255 : gray < 90 ? 0 : gray;
          data[index] = normalized;
          data[index + 1] = normalized;
          data[index + 2] = normalized;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      return workingCanvas;
    },
    buildConciliationQrCanvas() {
      const scanner = this.activeConciliationModal?.qrScanner;
      if (!scanner) {
        return null;
      }

      let source = null;
      let naturalWidth = 0;
      let naturalHeight = 0;
      if (scanner.mode === 'camera') {
        const ref = this.$refs?.conciliationQrVideo;
        source = Array.isArray(ref) ? ref[0] : ref;
        naturalWidth = source?.videoWidth || source?.clientWidth || 0;
        naturalHeight = source?.videoHeight || source?.clientHeight || 0;
      } else if (scanner.previewUrl) {
        source = scanner.sourceBitmap || null;
        if (!source) {
          const ref = this.$refs?.conciliationQrImage;
          source = Array.isArray(ref) ? ref[0] : ref;
        }
        naturalWidth = source?.width || source?.naturalWidth || source?.clientWidth || 0;
        naturalHeight = source?.height || source?.naturalHeight || source?.clientHeight || 0;
      }

      if (!source) {
        return null;
      }

      if (!naturalWidth || !naturalHeight) {
        return null;
      }

      const crop = scanner.crop || { x: 0.58, y: 0.63, w: 0.18, h: 0.18 };
      const sx = Math.round(naturalWidth * crop.x);
      const sy = Math.round(naturalHeight * crop.y);
      const sw = Math.max(1, Math.round(naturalWidth * crop.w));
      const sh = Math.max(1, Math.round(naturalHeight * crop.h));

      const canvas = document.createElement('canvas');
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return null;
      }

      ctx.drawImage(source, sx, sy, sw, sh, 0, 0, sw, sh);
      return canvas;
    },
    async applyConciliationQrRawText(rawText, successMessage = 'QR detectado. Revise los datos autocompletados antes de guardar.') {
      if (!this.activeConciliationModal) {
        return false;
      }

      if (!rawText) {
        this.activeConciliationModal = {
          ...this.activeConciliationModal,
          qrScan: {
            status: 'error',
            message: 'No pudimos leer el QR de esta imagen. Puede completar los campos manualmente.',
            rawText: '',
            parsed: null
          }
        };
        return false;
      }

      const parsed = await this.enrichQrPayload(rawText);
      const shouldApply = await this.confirmQrAutofill(parsed);
      const nextForm = {
        ...this.activeConciliationModal.form
      };

      if (shouldApply) {
        if (parsed.amount !== null && Number(parsed.amount) > 0) {
          nextForm.montoDepositado = String(parsed.amount);
        }
        if (parsed.bankName || parsed.bank) {
          nextForm.banco = [parsed.bankName, parsed.bank].filter(Boolean).join(' - ').slice(0, 255);
        }
        nextForm.nombreBanco = String(parsed.bankName || '').slice(0, 160);
        nextForm.usuarioBanco = String(parsed.user || '').slice(0, 120);
        nextForm.agenciaBanco = String(parsed.bank || '').slice(0, 180);
        nextForm.transaccionBanco = String(parsed.transaction || '').slice(0, 180);
        nextForm.fechaComprobante = String(parsed.date || '').slice(0, 40);
        nextForm.monedaComprobante = String(parsed.currency || '').slice(0, 20);
        nextForm.depositante = String(parsed.depositante || '').slice(0, 180);
        nextForm.beneficiario = String(parsed.beneficiario || '').slice(0, 180);

        const resolvedReference = parsed.reference || parsed.user || parsed.transaction || '';
        if (resolvedReference) {
          nextForm.referencia = resolvedReference.slice(0, 255);
        }

        const observationParts = [
          parsed.bankName ? `Banco: ${parsed.bankName}` : '',
          parsed.bank ? `Agencia: ${parsed.bank}` : '',
          parsed.user ? `Usuario: ${parsed.user}` : '',
          parsed.transaction ? `Transacción: ${parsed.transaction}` : '',
          parsed.date ? `Fecha: ${parsed.date}` : '',
          parsed.currency ? `Moneda: ${parsed.currency}` : '',
          parsed.depositante ? `Depositante: ${parsed.depositante}` : '',
          parsed.beneficiario ? `Beneficiario: ${parsed.beneficiario}` : ''
        ].filter(Boolean);

        if (observationParts.length) {
          nextForm.observacion = observationParts.join(' | ').slice(0, 500);
        } else if (parsed.rawText && !nextForm.observacion) {
          nextForm.observacion = `QR detectado: ${parsed.rawText}`.slice(0, 500);
        }
      }

      this.activeConciliationModal = {
        ...this.activeConciliationModal,
        form: nextForm,
        qrScan: {
          status: 'success',
          message: shouldApply
            ? successMessage
            : 'QR detectado. Se mostraron los datos, pero decidio revisarlos manualmente.',
          rawText,
          parsed
        }
      };

      if (shouldApply) {
        this.focusConciliationAmountField();
      }

      return true;
    },
    async decodeQrViaServer(canvas) {
      const imageDataUrl = this.canvasToDataUrl(canvas);
      if (!imageDataUrl) {
        return null;
      }

      try {
        const response = await this.$axios.$post('/api/qr/decode', {
          imageDataUrl
        });

        if (Array.isArray(response?.attempts)) {
          response.attempts.slice(0, 10).forEach((entry) => {
            this.pushQrScanDebug(`server: ${entry}`);
          });
        }

        if (response?.ok && response?.rawText) {
          this.pushQrScanDebug(`Servidor detecto QR con ${response.engine || 'desconocido'} (${response.variant || 'sin variante'}).`);
          return String(response.rawText);
        }
      } catch (error) {
        this.pushQrScanDebug(`Servidor QR error: ${error?.response?.data?.message || error?.message || 'desconocido'}`);
      }

      return null;
    },
    async processConciliationQrFullSource() {
      if (!this.activeConciliationModal?.qrScanner) {
        return;
      }

      if (this.activeConciliationModal.qrScan?.status === 'loading') {
        return;
      }

      this.$swal.fire({
        title: 'Procesando QR',
        text: 'Estamos leyendo la imagen del comprobante. Espere un momento.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          this.$swal.showLoading();
        }
      });

      this.activeConciliationModal = {
        ...this.activeConciliationModal,
        qrScan: {
          status: 'loading',
          message: 'Leyendo el QR del area recortada para completar los datos...',
          rawText: '',
          parsed: null
        },
        qrScanner: {
          ...this.activeConciliationModal.qrScanner,
          statusMessage: 'Procesando el area recortada del QR...'
        }
      };
      this.qrScanDebugEntries = [];

      try {
        const useCrop = true;
        const canvas = this.buildConciliationQrCanvas();
        const selectedFile = this.activeConciliationModal.selectedFile || null;
        console.info('[ventas/lista] qrScan:start', {
          useCrop,
          crop: useCrop ? this.activeConciliationModal.qrScanner.crop : null,
          canvasWidth: canvas?.width || null,
          canvasHeight: canvas?.height || null
        });
        this.pushQrScanDebug(useCrop
          ? `Inicio de lectura sobre recorte ${canvas?.width || 0}x${canvas?.height || 0}.`
          : `Inicio de lectura sobre imagen completa ${canvas?.width || 0}x${canvas?.height || 0}.`);

        let rawText = null;

        if (!useCrop && selectedFile) {
          this.pushQrScanDebug('Intentando leer directamente el archivo original.');
          rawText = await this.decodeQrFromImageFile(selectedFile);
        }

        if (!rawText) {
          this.pushQrScanDebug(`Intentando lectura local sobre ${useCrop ? 'el recorte exacto' : 'la imagen preparada'}.`);
          rawText = canvas ? await this.decodeQrFromCanvas(canvas, { cropped: useCrop, sourceLabel: useCrop ? 'recorte exacto' : 'imagen preparada' }) : null;
        }

        if (!rawText) {
          this.pushQrScanDebug('Lectura local sin exito. Se envia al servidor para un analisis adicional.');
          rawText = canvas ? await this.decodeQrViaServer(canvas) : null;
        }

        const ok = await this.applyConciliationQrRawText(
          rawText,
          useCrop
            ? 'QR detectado desde el recorte. Revise los datos autocompletados antes de guardar.'
            : 'QR detectado desde la imagen completa. Revise los datos autocompletados antes de guardar.'
        );

        if (this.activeConciliationModal?.qrScanner) {
          this.activeConciliationModal = {
            ...this.activeConciliationModal,
            qrScanner: {
              ...this.activeConciliationModal.qrScanner,
              statusMessage: ok
                ? 'Recorte procesado correctamente.'
                : 'No se pudo leer el QR del recorte. Ajuste mejor el area seleccionada.'
            }
          };
        }
      } finally {
        this.$swal.close();
      }
    },
    resetConciliationQrSource() {
      this.stopConciliationCameraStream();
      if (!this.activeConciliationModal?.qrScanner) {
        return;
      }

      this.releaseConciliationQrBitmap(this.activeConciliationModal.qrScanner.sourceBitmap || null);

      this.activeConciliationModal = {
        ...this.activeConciliationModal,
        qrScanner: {
          ...this.emptyConciliationQrScanner(),
          cameras: this.activeConciliationModal.qrScanner.cameras || [],
          selectedDeviceId: this.activeConciliationModal.qrScanner.selectedDeviceId || '',
          loadingDevices: false
        }
      };
    },
    parseQrPayload(rawText) {
      const fallback = {
        amount: null,
        reference: '',
        bank: '',
        bankName: '',
        user: '',
        transaction: '',
        date: '',
        currency: '',
        depositante: '',
        beneficiario: '',
        rawText: rawText || ''
      };

      if (!rawText) {
        return fallback;
      }

      const text = String(rawText).trim();

      try {
        const parsedJson = JSON.parse(text);
        const amount = Number(
          parsedJson.amount
          || parsedJson.monto
          || parsedJson.total
          || parsedJson.importe
          || 0
        );

        return {
          amount: Number.isFinite(amount) && amount > 0 ? amount : null,
          reference: String(parsedJson.reference || parsedJson.referencia || parsedJson.operation || parsedJson.operacion || '').trim(),
          bank: String(parsedJson.bank || parsedJson.banco || parsedJson.entity || parsedJson.entidad || parsedJson.agencia || '').trim(),
          bankName: String(parsedJson.bank_name || parsedJson.nombre_banco || parsedJson.bank || parsedJson.banco || '').trim(),
          user: String(parsedJson.user || parsedJson.usuario || '').trim(),
          transaction: String(parsedJson.transaction || parsedJson.transaccion || parsedJson.tipo_transaccion || '').trim(),
          date: String(parsedJson.date || parsedJson.fecha || '').trim(),
          currency: String(parsedJson.currency || parsedJson.moneda || '').trim(),
          depositante: String(parsedJson.depositante || parsedJson.depositor || '').trim(),
          beneficiario: String(parsedJson.beneficiario || parsedJson.beneficiary || '').trim(),
          rawText: text
        };
      } catch (error) {
        // Fallback regex parsing
      }

      const amountMatch = text.match(/(?:monto|amount|importe|total)[^0-9]{0,12}(\d+(?:[.,]\d{1,2})?)/i);
      const referenceMatch = text.match(/(?:referencia|reference|operacion|operación|transaction|trx)[^A-Z0-9]{0,12}([A-Z0-9-]{4,})/i);
      const bankMatch = text.match(/(?:banco|bank|entidad)[^A-Z0-9]{0,12}([A-ZÁÉÍÓÚ0-9 .-]{3,})/i);
      const bankNameMatch = text.match(/(?:banco unión s\.a\.|banco union s\.a\.|banco [a-záéíóú .]+)/i);
      const userMatch = text.match(/(?:usuario)[^A-Z0-9]{0,12}([A-Z0-9_.-]{4,})/i);
      const transactionMatch = text.match(/(?:transaccion|transacción)[^A-Z0-9]{0,12}([A-ZÁÉÍÓÚ0-9 .-]{4,})/i);
      const dateMatch = text.match(/(?:fecha)[^0-9]{0,12}(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})/i);
      const currencyMatch = text.match(/(?:moneda)[^A-Z0-9]{0,12}([A-Z$Bs.]{1,10})/i);
      const depositanteMatch = text.match(/(?:depositante|depositor)[^A-Z0-9]{0,12}([A-ZÁÉÍÓÚÑ ]{4,})/i);
      const beneficiarioMatch = text.match(/(?:beneficiario)[^A-Z0-9]{0,12}([A-ZÁÉÍÓÚÑ ]{4,})/i);

      return {
        amount: amountMatch ? Number(String(amountMatch[1]).replace(',', '.')) : null,
        reference: referenceMatch ? String(referenceMatch[1]).trim() : '',
        bank: bankMatch ? String(bankMatch[1]).trim() : '',
        bankName: bankNameMatch ? String(bankNameMatch[0]).trim() : '',
        user: userMatch ? String(userMatch[1]).trim() : '',
        transaction: transactionMatch ? String(transactionMatch[1]).trim() : '',
        date: dateMatch ? String(dateMatch[1]).trim() : '',
        currency: currencyMatch ? String(currencyMatch[1]).trim() : '',
        depositante: depositanteMatch ? String(depositanteMatch[1]).trim() : '',
        beneficiario: beneficiarioMatch ? String(beneficiarioMatch[1]).trim() : '',
        rawText: text
      };
    },
    async enrichQrPayload(rawText) {
      const parsed = this.parseQrPayload(rawText);

      if (!rawText) {
        return parsed;
      }

      const text = String(rawText).trim();
      const isHttp = /^https?:\/\//i.test(text);
      const bancoUnionBaseUrl = 'https://www.bancounion.com.bo/ComprobantesBun/Index?parametro=';

      let targetUrl = '';
      let fallbackReference = parsed.reference || '';

      if (isHttp) {
        targetUrl = text;
      } else {
        const sanitizedToken = text
          .replace(/^parametro=/i, '')
          .replace(/^["']|["']$/g, '')
          .trim();

        const looksLikeBancoUnionToken = /^[A-Za-z0-9_\-]{20,}$/.test(sanitizedToken);
        if (!looksLikeBancoUnionToken) {
          return parsed;
        }

        targetUrl = `${bancoUnionBaseUrl}${encodeURIComponent(sanitizedToken)}`;
        fallbackReference = sanitizedToken;
      }

      try {
        const url = new URL(targetUrl);
        const host = String(url.hostname || '').toLowerCase();
        const isBancoUnion = host.includes('bancounion.com.bo');

        if (!isBancoUnion || !process.client) {
          return {
            ...parsed,
            reference: fallbackReference || String(url.searchParams.get('parametro') || '').trim()
          };
        }

        const response = await this.$axios.$get('/api/banco-union/comprobante', {
          params: {
            url: targetUrl,
            reference: fallbackReference || String(url.searchParams.get('parametro') || '').trim()
          }
        });

        if (!response?.ok || !response?.parsed) {
          return {
            ...parsed,
            reference: fallbackReference || String(url.searchParams.get('parametro') || '').trim()
          };
        }

        const enriched = response.parsed;

        return {
          ...parsed,
          ...enriched,
          amount: enriched.amount !== null ? enriched.amount : parsed.amount,
          reference: enriched.reference || fallbackReference || parsed.reference || String(url.searchParams.get('parametro') || '').trim(),
          bank: enriched.bank || parsed.bank,
          bankName: enriched.bankName || parsed.bankName,
          user: enriched.user || parsed.user,
          transaction: enriched.transaction || parsed.transaction,
          date: enriched.date || parsed.date,
          currency: enriched.currency || parsed.currency,
          depositante: enriched.depositante || parsed.depositante,
          beneficiario: enriched.beneficiario || parsed.beneficiario,
          rawText: text,
          sourceUrl: targetUrl
        };
      } catch (error) {
        return {
          ...parsed,
          reference: fallbackReference || parsed.reference
        };
      }
    },
    parseBankReceiptHtml(html, fallbackReference = '') {
      const empty = {
        amount: null,
        reference: fallbackReference || '',
        bank: '',
        bankName: '',
        user: '',
        transaction: '',
        date: '',
        currency: '',
        depositante: '',
        beneficiario: ''
      };

      if (!html) {
        return empty;
      }

      const plainText = String(html)
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, '\n')
        .replace(/&nbsp;/gi, ' ')
        .replace(/\r/g, '\n')
        .replace(/\n{2,}/g, '\n')
        .trim();

      const readValue = (label) => {
        const regex = new RegExp(`${label}\\s*[:\\-]?\\s*([^\\n]+)`, 'i');
        const match = plainText.match(regex);
        return match ? String(match[1]).trim() : '';
      };

      const amountText = readValue('MONTO') || readValue('IMPORTE');
      const amountNumber = amountText
        ? Number(String(amountText).replace(/[^\d.,]/g, '').replace(/\.(?=\d{3}(?:\D|$))/g, '').replace(',', '.'))
        : null;

      return {
        amount: Number.isFinite(amountNumber) && amountNumber > 0 ? amountNumber : null,
        reference: fallbackReference || '',
        bank: readValue('AGENCIA') || readValue('BANCO / ENTIDAD'),
        bankName: readValue('NOMBRE DEL BANCO') || readValue('BANCO') || (plainText.includes('BANCO UNION') ? 'BANCO UNION S.A.' : ''),
        user: readValue('USUARIO'),
        transaction: readValue('TRANSACCION') || readValue('TRANSACCIÓN'),
        date: readValue('FECHA'),
        currency: readValue('MONEDA'),
        depositante: readValue('DEPOSITANTE'),
        beneficiario: readValue('BENEFICIARIO')
      };
    },
    async confirmQrAutofill(parsed) {
      const lines = [
        parsed.bankName ? `<div><strong>Banco:</strong> ${parsed.bankName}</div>` : '',
        parsed.user ? `<div><strong>Usuario:</strong> ${parsed.user}</div>` : '',
        parsed.bank ? `<div><strong>Agencia:</strong> ${parsed.bank}</div>` : '',
        parsed.transaction ? `<div><strong>Transacción:</strong> ${parsed.transaction}</div>` : '',
        parsed.date ? `<div><strong>Fecha:</strong> ${parsed.date}</div>` : '',
        parsed.amount !== null ? `<div><strong>Monto:</strong> ${this.formatCurrency(parsed.amount)}</div>` : '',
        parsed.currency ? `<div><strong>Moneda:</strong> ${parsed.currency}</div>` : '',
        parsed.depositante ? `<div><strong>Depositante:</strong> ${parsed.depositante}</div>` : '',
        parsed.beneficiario ? `<div><strong>Beneficiario:</strong> ${parsed.beneficiario}</div>` : ''
      ].filter(Boolean);

      if (!lines.length) {
        return true;
      }

      const result = await this.$swal.fire({
        icon: 'question',
        title: 'Datos detectados del comprobante',
        html: `<div class="text-left" style="display:grid;gap:6px;text-align:left;">${lines.join('')}</div>`,
        showCancelButton: true,
        confirmButtonText: 'Usar estos datos',
        cancelButtonText: 'Revisar manualmente'
      });

      return Boolean(result?.isConfirmed);
    },
    resetConciliationQrScan() {
      if (!this.activeConciliationModal) {
        return;
      }

      this.activeConciliationModal = {
        ...this.activeConciliationModal,
        qrScan: {
          status: 'idle',
          message: '',
          rawText: '',
          parsed: null
        }
      };
    },
    conciliationDifferenceTagClass(conciliacion) {
      const difference = Number(conciliacion?.diferencia || 0);
      if (Math.abs(difference) < 0.01) {
        return 'metric-tag-success';
      }

      return difference > 0 ? 'metric-tag-info' : 'metric-tag-danger';
    },
    async fetchConciliacionesSummaryRows(requestToken = this.activeLoadReportToken) {
      try {
        const fecha = this.activeConciliationModal?.selectedDate || this.selectedConciliationDate || this.defaultToday();
        const response = await this.$admin.$get(`caja/conciliaciones?fecha=${encodeURIComponent(fecha)}`);
        if (requestToken !== this.activeLoadReportToken) {
          return null;
        }

        return Array.isArray(response?.conciliaciones)
          ? response.conciliaciones.map((item) => ({
            ...item,
            receiptCount: Number(item?.receiptCount || 0)
          }))
          : [];
      } catch (error) {
        console.error('[ventas/lista] loadConciliacionesSummary:error', {
          status: error?.response?.status || null,
          data: error?.response?.data || null,
          message: error?.message || null
        });

        return requestToken === this.activeLoadReportToken ? [] : null;
      }
    },
    async loadConciliacionesSummary(requestToken = this.activeLoadReportToken) {
      const rows = await this.fetchConciliacionesSummaryRows(requestToken);
      if (rows === null || requestToken !== this.activeLoadReportToken) {
        return;
      }

      this.conciliacionSummaryRows = rows;
    },
    emptyBranchRow(baseItem) {
      return {
        id: baseItem.id,
        nombre: baseItem.nombre,
        departamento: baseItem.departamento,
        sucursalNombre: baseItem.sucursalNombre,
        codigoSucursal: baseItem.codigoSucursal,
        puntoVenta: baseItem.puntoVenta,
        kardexDisponible: true,
        cantidadVentas: 0,
        totalVendido: 0,
        totalQrFacturado: 0,
        totalEfectivoFacturado: 0,
        cajerosUnicos: 0,
        facturadas: 0,
        qrFacturadas: 0,
        electronicasFacturadas: 0,
        oficiales: 0,
        facturasAnuladas: 0,
        totalFacturasAnuladas: 0,
        conCufOtroEstado: 0,
        observadas: 0,
        pendientes: 0,
        qrPagadoPendienteFactura: 0,
        qrCancelado: 0,
        qrPendiente: 0,
        cartRechazadoDescartado: 0,
        totalQrPagadoPendienteFactura: 0,
        totalQrCancelado: 0,
        totalQrPendiente: 0,
        totalCartRechazadoDescartado: 0,
        totalContratosNoSumados: 0,
        contratosNoSumados: 0
      };
    },
    isAnuladaVenta(venta) {
      const statusKey = String(venta?.status?.key || '').trim().toUpperCase();
      const estadoEmision = String(venta?.estado_emision || '').trim().toUpperCase();
      const estadoSufe = String(
        venta?.respuesta_emision?.estadoSufe
        || venta?.estadoSufe
        || venta?.estado_sufe
        || ''
      ).trim().toUpperCase();

      return [
        statusKey,
        estadoEmision,
        estadoSufe
      ].some((value) => ['ANULADA', 'ANULADO', 'ANULACION_SOLICITADA', 'DESCARTADA'].includes(value));
    },
    isQrPaymentVenta(venta) {
      const codigoOrden = String(venta?.codigoOrden || '').trim().toUpperCase();
      const metodoPago = String(venta?.metodo_pago || venta?.metodoPago || '').trim().toLowerCase();
      const canalEmision = String(venta?.canal_emision || venta?.canalEmision || '').trim().toLowerCase();

      return codigoOrden.startsWith('VQ-')
        || codigoOrden.startsWith('VQC-')
        || metodoPago === 'qr'
        || canalEmision === 'qr';
    },
    hasFacturaEmitidaEvidence(venta) {
      const estadoEmision = String(venta?.estado_emision || '').trim().toUpperCase();
      const statusKey = String(venta?.status?.key || '').trim().toUpperCase();
      const statusLabel = String(venta?.status?.label || '').trim().toUpperCase();
      const cuf = String(
        venta?.cuf
        || venta?.status?.cuf
        || venta?.seguimiento?.cuf
        || venta?.respuesta_emision?.factura?.cuf
        || venta?.respuesta_emision?.cuf
        || ''
      ).trim();
      const pdfUrl = String(
        venta?.seguimiento?.urlPdf
        || venta?.respuesta_emision?.factura?.pdfUrl
        || venta?.respuesta_emision?.pdfUrl
        || ''
      ).trim();
      const numeroFactura = String(
        venta?.numeroFactura
        || venta?.respuesta_emision?.factura?.nroFactura
        || ''
      ).trim();

      return estadoEmision === 'FACTURADA'
        || statusKey === 'FACTURADA'
        || statusLabel.includes('FACTURADA')
        || cuf !== ''
        || pdfUrl !== ''
        || numeroFactura !== '';
    },
    isQrFacturadoVenta(venta) {
      return this.isQrPaymentVenta(venta)
        && String(venta?.estado_pago || '').trim().toLowerCase() === 'pagado'
        && !this.isAnuladaVenta(venta)
        && this.hasFacturaEmitidaEvidence(venta);
    },
    countsTowardCashTotal(venta) {
      if (this.isAnuladaVenta(venta) || this.isQrPaymentVenta(venta) || this.isServicioContratoVenta(venta) || this.isEcaServiceVenta(venta)) {
        return false;
      }

      const estado = String(venta?.estado || '').trim().toLowerCase();
      const estadoEmision = String(venta?.estado_emision || '').trim().toUpperCase();
      const statusKey = String(venta?.status?.key || '').trim().toUpperCase();
      const statusLabel = String(venta?.status?.label || '').trim().toUpperCase();
      const estadoPago = String(venta?.estado_pago || '').trim().toLowerCase();

      if (estadoPago === 'pagado') {
        return true;
      }

      if (['FACTURADA', 'EMITIDO'].includes(statusKey)) {
        return true;
      }

      if (statusLabel.includes('FACTURADA') || statusLabel.includes('EMITIDO')) {
        return true;
      }

      if (estadoEmision === 'FACTURADA') {
        return true;
      }

      return estado === 'emitido';
    },
    countsTowardCollectedTotal(venta) {
      if (this.isAnuladaVenta(venta)) {
        return false;
      }

      if (this.isServicioContratoVenta(venta) || this.isEcaServiceVenta(venta)) {
        return false;
      }

      if (this.isQrPaymentVenta(venta)) {
        return this.isQrFacturadoVenta(venta);
      }

      return this.countsTowardCashTotal(venta);
    },
    countsTowardCollectedQrTotal(venta) {
      return this.isQrFacturadoVenta(venta);
    },
    countsTowardPendingFacturaQrTotal(venta) {
      return this.isQrPaymentVenta(venta)
        && String(venta?.estado_pago || '').trim().toLowerCase() === 'pagado'
        && !this.isAnuladaVenta(venta)
        && !this.isQrFacturadoVenta(venta);
    },
    isContratoChannelVenta(venta) {
      const canalOperativo = String(
        venta?.canal_operativo
        || venta?.canalOperativo
        || ''
      ).trim().toLowerCase();
      const esCuentaPorCobrar = Boolean(
        venta?.es_cuenta_por_cobrar
        || venta?.esCuentaPorCobrar
      );
      const empresaNombre = String(
        venta?.empresa_nombre
        || venta?.empresaNombre
        || ''
      ).trim();
      const empresaSigla = String(
        venta?.empresa_sigla
        || venta?.empresaSigla
        || ''
      ).trim();

      return canalOperativo === 'contrato'
        || esCuentaPorCobrar
        || empresaNombre.length > 0
        || empresaSigla.length > 0;
    },
    isServicioContratoVenta(venta) {
      if (this.isContratoChannelVenta(venta)) {
        return true;
      }

      const detalle = Array.isArray(venta?.detalle) ? venta.detalle : [];
      if (!detalle.length) {
        return false;
      }

      return detalle.some((item) => {
        const labels = [
          item?.titulo,
          item?.nombre_servicio,
          item?.servicio,
          item?.descripcion,
          item?.detalle,
          item?.nombre
        ]
          .filter(Boolean)
          .map((value) => String(value).trim().toLowerCase());

        return labels.some((value) => (
          value.includes('servicio contratos')
          || value.includes('servicio contrato')
          || value === 'contratos'
          || value === 'contrato'
        ));
      });
    },
    isEcaServiceVenta(venta) {
      const detalle = Array.isArray(venta?.detalle) ? venta.detalle : [];
      if (!detalle.length) {
        return false;
      }

      return detalle.some((item) => {
        const labels = [
          item?.titulo,
          item?.nombre_servicio,
          item?.servicio,
          item?.descripcion,
          item?.detalle,
          item?.nombre
        ]
          .filter(Boolean)
          .map((value) => String(value).trim().toLowerCase());

        return labels.some((value) => (
          value.includes('servicio eca')
          || /(^|[^a-z0-9])eca([^a-z0-9]|$)/.test(value)
        ));
      });
    },
    isExcludedServiceVenta(venta) {
      return this.isServicioContratoVenta(venta) || this.isEcaServiceVenta(venta);
    },
    isServiceVenta(venta) {
      const detalle = Array.isArray(venta?.detalle) ? venta.detalle : [];
      if (!detalle.length) {
        return false;
      }

      return detalle.every((item) => {
        const servicioId = Number(item?.servicio_id || item?.servicioId || 0);
        if (servicioId > 0) {
          return true;
        }

        const hasTracking = Boolean(
          String(
            item?.codigoSeguimiento
            || item?.tracking
            || item?.guia
            || item?.resumen_origen?.codigoSeguimiento
            || ''
          ).trim()
        );
        const nombreServicio = String(
          item?.nombre_servicio
          || item?.servicio
          || item?.descripcion
          || ''
        ).trim();

        return !hasTracking && nombreServicio.length > 0 && String(venta?.codigoSeguimiento || '').trim() === '';
      });
    },
    contratoEmpresaLabel(venta) {
      return String(
        venta?.cliente?.razonSocial
        || venta?.razon_social
        || venta?.cliente?.nombre
        || 'Sin empresa'
      ).trim() || 'Sin empresa';
    },
    contratoDescripcionLabel(venta) {
      const detalle = Array.isArray(venta?.detalle) ? venta.detalle : [];
      const descripciones = detalle
        .map((item) => {
          const exactCandidates = [
            item?.resumen_origen?.descripcion_servicio,
            item?.descripcion,
            item?.titulo,
            item?.nombre_servicio
          ]
            .map((value) => String(value || '').trim())
            .filter(Boolean);

          const preferred = exactCandidates.find((value) => {
            const normalized = value.toLowerCase();
            return normalized !== 'contratos'
              && normalized !== 'contrato'
              && normalized !== 'servicio contratos'
              && normalized !== 'servicio contrato';
          });

          return preferred || exactCandidates[0] || '';
        })
        .filter(Boolean);

      return descripciones.length ? descripciones.join(', ') : 'Servicio no sumado';
    },
    excludedServiceTypeLabel(venta) {
      if (this.isEcaServiceVenta(venta)) {
        return 'ECA';
      }

      if (this.isServicioContratoVenta(venta)) {
        return 'Contrato';
      }

      const detalle = Array.isArray(venta?.detalle) ? venta.detalle : [];
      const labels = detalle
        .flatMap((item) => [
          item?.resumen_origen?.descripcion_servicio,
          item?.descripcion,
          item?.titulo,
          item?.nombre_servicio,
          item?.servicio,
          item?.detalle,
          item?.nombre
        ])
        .filter(Boolean)
        .map((value) => String(value).trim().toLowerCase());

      return labels.some((value) => value.includes('servicio eca') || /(^|[^a-z0-9])eca([^a-z0-9]|$)/.test(value)) ? 'ECA' : 'Contrato';
    },
    countsTowardEcaTotal(venta) {
      if (this.isAnuladaVenta(venta) || this.isQrPaymentVenta(venta) || !this.isEcaServiceVenta(venta)) {
        return false;
      }

      const estado = String(venta?.estado || '').trim().toLowerCase();
      const estadoEmision = String(venta?.estado_emision || '').trim().toUpperCase();
      const statusKey = String(venta?.status?.key || '').trim().toUpperCase();
      const statusLabel = String(venta?.status?.label || '').trim().toUpperCase();
      const estadoPago = String(venta?.estado_pago || '').trim().toLowerCase();

      if (estadoPago === 'pagado') {
        return true;
      }

      if (['FACTURADA', 'EMITIDO', 'PROCESADO'].includes(statusKey)) {
        return true;
      }

      if (statusLabel.includes('FACTURADA') || statusLabel.includes('EMITIDO')) {
        return true;
      }

      if (estadoEmision === 'FACTURADA') {
        return true;
      }

      return estado === 'emitido';
    },
    calculateBranchTotalsFromVentas(ventas = []) {
      return ventas.reduce((acc, venta) => {
        if (this.isServicioContratoVenta(venta)) {
          const total = Number(venta?.total || 0);
          acc.totalContratosNoSumados += total;
          acc.contratosNoSumados += 1;
          return acc;
        }

        if (this.isEcaServiceVenta(venta)) {
          const total = Number(venta?.total || 0);
          acc.totalEcaFacturado += total;
          acc.ecaFacturadas += 1;
          return acc;
        }

        const total = Number(venta?.total || 0);
        if (this.countsTowardCollectedTotal(venta)) {
          acc.totalVendido += total;
        }
        if (this.countsTowardCollectedQrTotal(venta)) {
          acc.totalQrFacturado += total;
          acc.qrFacturadas += 1;
          acc.facturadas += 1;
        }
        if (this.countsTowardPendingFacturaQrTotal(venta)) {
          acc.totalQrPagadoPendienteFactura += total;
        }
        if (this.countsTowardCashTotal(venta)) {
          acc.totalEfectivoFacturado += total;
          acc.electronicasFacturadas += 1;
          acc.facturadas += 1;
        }

        return acc;
      }, {
        totalVendido: 0,
        totalQrFacturado: 0,
        totalQrPagadoPendienteFactura: 0,
        totalEfectivoFacturado: 0,
        totalEcaFacturado: 0,
        totalContratosNoSumados: 0,
        facturadas: 0,
        qrFacturadas: 0,
        ecaFacturadas: 0,
        electronicasFacturadas: 0,
        contratosNoSumados: 0
      });
    },
    async buildBranchTotalsMap(sourceRows = [], requestToken = this.activeLoadReportToken) {
      if (!sourceRows.length) {
        return {};
      }

      const ventas = await this.fetchReportVentas();

      if (requestToken !== this.activeLoadReportToken) {
        return null;
      }

      const ventasByBranch = ventas.reduce((acc, venta) => {
        const codigoSucursal = venta?.sucursal?.codigoSucursal ?? venta?.codigoSucursal;
        const puntoVenta = venta?.sucursal?.puntoVenta ?? venta?.puntoVenta ?? venta?.sucursal?.id ?? 0;
        const key = this.branchKey(codigoSucursal, puntoVenta);

        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(venta);
        return acc;
      }, {});

      return sourceRows.reduce((acc, branch) => {
        const key = this.branchKey(branch?.codigoSucursal, branch?.puntoVenta);
        acc[key] = this.calculateBranchTotalsFromVentas(ventasByBranch[key] || []);
        return acc;
      }, {});
    },
    async refreshBranchTotalsFromVentas(requestToken = this.activeLoadReportToken) {
      const sourceRows = Array.isArray(this.report?.sucursales) ? this.report.sucursales : [];
      const nextTotals = await this.buildBranchTotalsMap(sourceRows, requestToken);
      if (nextTotals === null || requestToken !== this.activeLoadReportToken) {
        return;
      }

      this.branchTotalsByBranch = nextTotals;
    },
    cachedUserCount(codigoSucursal, puntoVenta) {
      const key = this.branchKey(codigoSucursal, puntoVenta);
      return Number(this.userCountsByBranch[key] || 0);
    },
    async fetchBranchUserCounts(requestToken = this.activeLoadReportToken) {
      try {
        const fecha = this.endDate || this.defaultToday();
        const response = await this.$admin.$get(`caja/reporte-diario?fecha=${encodeURIComponent(fecha)}`);
        const rows = Array.isArray(response?.porSucursal) ? response.porSucursal : [];
        const nextCounts = {};

        rows.forEach((row) => {
          const key = this.branchKey(row?.codigoSucursal, row?.puntoVenta);
          nextCounts[key] = Number(row?.cajas || 0);
        });

        this.branchCatalog.forEach((item) => {
          const key = this.branchKey(item.codigoSucursal, item.puntoVenta);
          if (!Object.prototype.hasOwnProperty.call(nextCounts, key)) {
            nextCounts[key] = 0;
          }
        });

        if (requestToken !== this.activeLoadReportToken) {
          return null;
        }

        return nextCounts;
      } catch (error) {
        console.error('[ventas/lista] ensureBranchUserCounts:error', {
          status: error?.response?.status || null,
          data: error?.response?.data || null,
          message: error?.message || null
        });

        return null;
      }
    },
    async ensureBranchUserCounts(requestToken = this.activeLoadReportToken) {
      const nextCounts = await this.fetchBranchUserCounts(requestToken);
      if (!nextCounts || requestToken !== this.activeLoadReportToken) {
        return;
      }

      this.userCountsByBranch = nextCounts;
    },
    applyDateFilter() {
      if (!this.startDate || !this.endDate) {
        this.$swal.fire({
          icon: 'warning',
          title: 'Seleccione ambas fechas',
          text: 'Indique la fecha de inicio y la fecha final antes de filtrar.'
        });
        return;
      }

      if (this.startDate > this.endDate) {
        this.$swal.fire({
          icon: 'warning',
          title: 'Rango de fechas no valido',
          text: 'La fecha de inicio no puede ser posterior a la fecha final.'
        });
        return;
      }

      this.loadReport();
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
    defaultToday() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    },
    async fetchReportVentas() {
      const cacheKey = ['report', this.startDate || '', this.endDate || ''].join('|');
      if (Array.isArray(this.branchVentasCache[cacheKey])) {
        return this.branchVentasCache[cacheKey];
      }

      const params = new URLSearchParams();
      if (this.startDate) {
        params.append('fechaInicio', this.startDate);
      }
      if (this.endDate) {
        params.append('fechaFin', this.endDate);
      }

      const query = params.toString();
      const response = await this.$admin.$get(query ? `ventas?${query}` : 'ventas');
      const ventas = Array.isArray(response) ? response : [];
      this.branchVentasCache = {
        ...this.branchVentasCache,
        [cacheKey]: ventas
      };

      return ventas;
    },
    async fetchBranchVentas(branch) {
      const cacheKey = [
        String(branch?.codigoSucursal ?? ''),
        String(branch?.puntoVenta ?? '0'),
        this.startDate || '',
        this.endDate || ''
      ].join('|');

      if (Array.isArray(this.branchVentasCache[cacheKey])) {
        return this.branchVentasCache[cacheKey];
      }

      const params = new URLSearchParams();
      params.append('codigoSucursal', String(branch?.codigoSucursal ?? ''));
      params.append('puntoVenta', String(branch?.puntoVenta ?? '0'));
      if (this.startDate) {
        params.append('fechaInicio', this.startDate);
      }
      if (this.endDate) {
        params.append('fechaFin', this.endDate);
      }

      const path = `ventas?${params.toString()}`;
      const response = await this.$admin.$get(path);
      const ventas = Array.isArray(response) ? response : [];
      this.branchVentasCache = {
        ...this.branchVentasCache,
        [cacheKey]: ventas
      };
      return ventas;
    },
    startOfMonth(isoDate) {
      const [year, month] = String(isoDate || '').split('-');
      if (!year || !month) {
        return '';
      }

      return `${year}-${month}-01`;
    },
    formatDateLabel(isoDate) {
      const [year, month, day] = String(isoDate || '').split('-');
      if (!year || !month || !day) {
        return isoDate || '-';
      }

      return `${day}/${month}/${year}`;
    },
    usuarioIdFromVenta(venta) {
      return venta?.usuario?.id || venta?.origen_usuario_id || 'sin-usuario';
    },
    usuarioNombreFromVenta(venta) {
      return venta?.usuario?.nombre || venta?.origen_usuario_nombre || 'Sin usuario';
    },
    usuarioEmailFromVenta(venta) {
      return venta?.usuario?.email || venta?.origen_usuario_email || '';
    },
    isQrVenta(venta) {
      const codigoOrden = String(venta?.codigoOrden || '').toUpperCase();
      const metodoPago = String(venta?.metodo_pago || '').toLowerCase();
      const canalEmision = String(venta?.canal_emision || '').toLowerCase();
      return codigoOrden.startsWith('VQ-')
        || codigoOrden.startsWith('VQC-')
        || metodoPago === 'qr'
        || canalEmision === 'qr';
    },
    isPendingVenta(venta) {
      const estado = String(venta?.estado_pago || venta?.status?.key || venta?.estado_emision || '').toUpperCase();
      return estado.includes('PENDIENT');
    },
    countsTowardCashVenta(venta) {
      return !this.isQrVenta(venta);
    },
    numeroFacturaFromVenta(venta) {
      return String(
        venta?.numeroFactura
        || venta?.respuesta_emision?.factura?.nroFactura
        || venta?.respuesta_emision?.nroFactura
        || venta?.seguimiento?.numeroFactura
        || '-'
      ).trim() || '-';
    },
    formatPdfDateTime(value) {
      if (!value) {
        return '-';
      }

      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return String(value);
      }

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${day}/${month}/${year}\n${hours}:${minutes}`;
    },
    buildVentaDetallePdf(venta) {
      const detalle = Array.isArray(venta?.detalle) ? venta.detalle : [];
      if (!detalle.length) {
        return {
          detalle: '-',
          paquetes: '-'
        };
      }

      const firstItem = detalle[0] || {};
      const principal = String(
        firstItem?.titulo
        || firstItem?.nombre_servicio
        || firstItem?.descripcion
        || 'Sin detalle'
      ).trim();
      const paquetes = detalle
        .map((item) => {
          const codigo = String(item?.codigo || item?.resumen_origen?.codigo || '').trim();
          return codigo;
        })
        .filter(Boolean);

      return {
        detalle: `${principal}\n${detalle.length} paquete${detalle.length === 1 ? '' : 's'}`,
        paquetes: paquetes.length ? paquetes.join('\n') : '-'
      };
    },
    groupVentasByUserForPdf(ventas) {
      const grouped = new Map();

      ventas.forEach((venta) => {
        const userId = this.usuarioIdFromVenta(venta);
        if (!grouped.has(userId)) {
          grouped.set(userId, {
            id: userId,
            nombre: this.usuarioNombreFromVenta(venta),
            email: this.usuarioEmailFromVenta(venta),
            ventas: []
          });
        }

        grouped.get(userId).ventas.push(venta);
      });

      return Array.from(grouped.values())
        .map((group) => {
          const totalCaja = group.ventas.reduce((acc, venta) => acc + (this.countsTowardCashVenta(venta) ? Number(venta?.total || 0) : 0), 0);
          const cobradas = group.ventas.filter((venta) => !this.isPendingVenta(venta)).length;
          const pendientes = group.ventas.filter((venta) => this.isPendingVenta(venta)).length;

          return {
            ...group,
            totalCaja,
            cobradas,
            pendientes
          };
        })
        .sort((a, b) => b.ventas.length - a.ventas.length);
    },
    normalizeBranch(item, index) {
      const branchTotals = this.branchTotalsByBranch[this.branchKey(item?.codigoSucursal, item?.puntoVenta)] || null;
      const totalQrFacturado = Number(branchTotals?.totalQrFacturado ?? (item?.totalQrFacturado || 0));
      const totalEfectivoFacturado = Number(branchTotals?.totalEfectivoFacturado ?? (item?.totalEfectivoFacturado || 0));
      const totalEcaFacturado = Number(branchTotals?.totalEcaFacturado ?? 0);
      const totalContratosNoSumados = Number(branchTotals?.totalContratosNoSumados ?? 0);
      const totalQrPagadoPendienteFactura = Number(branchTotals?.totalQrPagadoPendienteFactura ?? (item?.totalQrPagadoPendienteFactura || 0));
      const facturadas = Number(branchTotals?.facturadas ?? (item?.facturadas || 0));
      const qrFacturadas = Number(branchTotals?.qrFacturadas ?? (item?.qrFacturadas || 0));
      const ecaFacturadas = Number(branchTotals?.ecaFacturadas ?? 0);
      const electronicasFacturadas = Number(branchTotals?.electronicasFacturadas ?? (item?.electronicasFacturadas || 0));
      const contratosNoSumados = Number(branchTotals?.contratosNoSumados ?? 0);
      const cantidadVentas = Number(branchTotals?.facturadas ?? (item?.cantidadVentas || 0));
      const pendientes = Number(item?.pendientes || 0);
      const observadas = Number(item?.observadas || 0);
      const qrPagadoPendienteFactura = Number(item?.qrPagadoPendienteFactura || 0);
      const qrCancelado = Number(item?.qrCancelado || 0);
      const qrPendiente = Number(item?.qrPendiente || 0);
      const ventasFacturadasNetas = Math.max(0, facturadas);
      const ventasOperativas = ventasFacturadasNetas;
      const totalCobrado = Number(branchTotals?.totalVendido ?? (totalQrFacturado + totalEfectivoFacturado));
      const incidentSummary = this.resolveIncidentSummary({
        observadas,
        pendientes,
        conCufOtroEstado: Number(item?.conCufOtroEstado || 0),
        qrPagadoPendienteFactura,
        qrCancelado,
        qrPendiente
      });
      const status = this.resolveBranchStatus({
        cantidadVentas: ventasOperativas,
        hasPendingIncidences: incidentSummary.hasPendingIncidences,
        hasObservedIncidences: incidentSummary.hasObservedIncidences
      });
      const conciliacion = this.conciliacionSummaryByBranch[this.branchKey(item?.codigoSucursal, item?.puntoVenta)] || this.emptyConciliacion({
        ...item,
        totalEfectivoFacturado,
        totalQrFacturado,
        totalVendido: totalCobrado
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
        totalEcaFacturado,
        totalContratosNoSumados,
        totalQrPagadoPendienteFactura,
        facturadas,
        qrFacturadas,
        ecaFacturadas,
        electronicasFacturadas,
        contratosNoSumados,
        cajerosUnicos: Number(item?.cajerosUnicos || this.cachedUserCount(item?.codigoSucursal, item?.puntoVenta)),
        oficiales: Number(item?.oficiales || 0),
        facturasAnuladas: Number(item?.facturasAnuladas || 0),
        totalFacturasAnuladas: Number(item?.totalFacturasAnuladas || 0),
        conCufOtroEstado: Number(item?.conCufOtroEstado || 0),
        observadas,
        pendientes,
        qrPagadoPendienteFactura,
        qrCancelado,
        qrPendiente,
        cartRechazadoDescartado: Number(item?.cartRechazadoDescartado || 0),
        totalCartRechazadoDescartado: Number(item?.totalCartRechazadoDescartado || 0),
        hasPendingIncidences: incidentSummary.hasPendingIncidences,
        hasObservedIncidences: incidentSummary.hasObservedIncidences,
        status,
        kardexDisponible: item?.kardexDisponible !== false,
        conciliacion: {
          ...conciliacion,
          totalEfectivoSistema: Number(conciliacion?.totalEfectivoSistema ?? totalEfectivoFacturado),
          totalQrSistema: Number(conciliacion?.totalQrSistema ?? totalQrFacturado),
          totalGeneralSistema: Number(conciliacion?.totalGeneralSistema ?? totalCobrado)
        }
      };
    },
    resolveIncidentSummary({ observadas, pendientes, conCufOtroEstado, qrPagadoPendienteFactura, qrCancelado, qrPendiente }) {
      const hasObservedIncidences = Boolean(
        observadas > 0
        || conCufOtroEstado > 0
        || qrCancelado > 0
      );
      const hasPendingIncidences = Boolean(
        pendientes > 0
        || qrPagadoPendienteFactura > 0
        || qrPendiente > 0
      );

      return {
        hasObservedIncidences,
        hasPendingIncidences
      };
    },
    resolveBranchStatus({ cantidadVentas, hasPendingIncidences, hasObservedIncidences }) {
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

      if (hasObservedIncidences) {
        return {
          key: 'diferencia',
          label: 'Con observaciones',
          icon: 'fas fa-exclamation-triangle',
          actionLabel: 'Revisar kardex',
          actionClass: 'action-btn-danger',
          actionIcon: 'fas fa-search'
        };
      }

      if (hasPendingIncidences) {
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
    roundCurrency(value) {
      return Math.round(Number(value || 0) * 100) / 100;
    },
    async loadReport() {
      const requestToken = this.activeLoadReportToken + 1;
      this.activeLoadReportToken = requestToken;
      this.load = true;
      this.error = '';
      this.branchVentasCache = {};

      try {
        const endDate = this.endDate || this.defaultToday();
        const startDate = this.startDate || endDate;
        const params = new URLSearchParams();
        if (startDate) {
          params.append('fechaInicio', startDate);
        }
        if (endDate) {
          params.append('fechaFin', endDate);
        }
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

        if (requestToken !== this.activeLoadReportToken) {
          console.warn('[ventas/lista] loadReport:stale-success-ignored', {
            requestToken,
            activeLoadReportToken: this.activeLoadReportToken
          });
          return;
        }

        const nextReport = {
          resumen: response && response.resumen ? response.resumen : this.report.resumen,
          sucursales: response && response.sucursales ? response.sucursales : []
        };
        const nextBranchTotals = await this.buildBranchTotalsMap(nextReport.sucursales, requestToken);

        if (requestToken !== this.activeLoadReportToken) {
          console.warn('[ventas/lista] loadReport:stale-verification-ignored', {
            requestToken,
            activeLoadReportToken: this.activeLoadReportToken
          });
          return;
        }

        this.report = nextReport;
        this.branchTotalsByBranch = nextBranchTotals || {};
        this.syncRouteConciliationState();
        Promise.allSettled([
          this.fetchBranchUserCounts(requestToken),
          this.fetchConciliacionesSummaryRows(requestToken)
        ]).then((results) => {
          if (requestToken !== this.activeLoadReportToken) {
            return;
          }

          const [userCountsResult, conciliationResult] = results;

          if (userCountsResult.status === 'fulfilled' && userCountsResult.value) {
            this.userCountsByBranch = userCountsResult.value;
          } else if (userCountsResult.status === 'rejected') {
            console.warn('[ventas/lista] loadReport:background-task:error', {
              taskName: 'fetchBranchUserCounts',
              message: userCountsResult.reason?.message || null,
              status: userCountsResult.reason?.response?.status || null,
              data: userCountsResult.reason?.response?.data || null
            });
          }

          if (conciliationResult.status === 'fulfilled' && Array.isArray(conciliationResult.value)) {
            this.conciliacionSummaryRows = conciliationResult.value;
          } else if (conciliationResult.status === 'rejected') {
            console.warn('[ventas/lista] loadReport:background-task:error', {
              taskName: 'fetchConciliacionesSummaryRows',
              message: conciliationResult.reason?.message || null,
              status: conciliationResult.reason?.response?.status || null,
              data: conciliationResult.reason?.response?.data || null
            });
          }
        });
      } catch (err) {
        if (requestToken !== this.activeLoadReportToken) {
          console.warn('[ventas/lista] loadReport:stale-error-ignored', {
            requestToken,
            activeLoadReportToken: this.activeLoadReportToken,
            message: err?.message || null
          });
          return;
        }
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
        if (requestToken === this.activeLoadReportToken) {
          this.load = false;
        }
      }
    },
    resetFilters() {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }

      this.initializeDateRange();
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
      const fechaInicio = this.startDate || this.defaultToday();
      const fechaFin = this.endDate || fechaInicio;
      console.log('[ventas/lista] goToSucursal', {
        item,
        query: {
          codigoSucursal,
          puntoVenta: item?.puntoVenta ?? '',
          nombre: item?.nombre || '',
          departamento: item?.departamento || '',
          fechaInicio,
          fechaFin
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
          departamento: item.departamento || '',
          fechaInicio,
          fechaFin
        }
      });
    },
    closeUsersModal() {
      this.activeUsersModal = null;
    },
    closeIncidentsModal() {
      this.activeIncidentsModal = null;
    },
    closeConciliationModal() {
      this.releaseConciliationQrBitmap(this.activeConciliationModal?.qrScanner?.sourceBitmap || null);
      this.stopConciliationCameraStream();
      this.activeConciliationModal = null;
      if (String(this.$route.query?.view || '').toLowerCase() === 'conciliation') {
        const nextQuery = { ...this.$route.query };
        delete nextQuery.view;
        delete nextQuery.fecha;
        delete nextQuery.codigoSucursal;
        delete nextQuery.puntoVenta;
        this.$router.replace({ path: this.$route.path, query: nextQuery });
      }
    },
    async openConciliationModal(item, options = {}) {
      const selectedDate = options.selectedDate || this.endDate || this.startDate || this.defaultToday();
      const codigoSucursal = this.normalizeNonNegativeInteger(item?.codigoSucursal, 0);
      const puntoVenta = this.normalizeNonNegativeInteger(item?.puntoVenta, 0);
      const branchKey = this.branchKey(codigoSucursal, puntoVenta);
      this.activeConciliationModal = {
        branchKey,
        codigoSucursal,
        puntoVenta,
        fecha: selectedDate,
        selectedDate,
        calendarAnchorMonth: this.startOfMonth(selectedDate),
        showUploadComposer: true,
        title: item.displayName || item.departamento || item.nombre || 'Sucursal',
        subtitle: `Sucursal ${String(codigoSucursal).padStart(3, '0')} · Punto ${puntoVenta}`,
        conciliacion: item.conciliacion || this.emptyConciliacion(item),
        comprobantes: [],
        loading: true,
        entryMode: 'qr',
        selectedFile: null,
        selectedFileName: '',
        qrScan: {
          status: 'idle',
          message: '',
          rawText: '',
          parsed: null
        },
        qrScanner: this.emptyConciliationQrScanner(),
        form: {
          montoDepositado: '',
          banco: '',
          nombreBanco: '',
          usuarioBanco: '',
          agenciaBanco: '',
          transaccionBanco: '',
          fechaComprobante: '',
          monedaComprobante: '',
          depositante: '',
          beneficiario: '',
          referencia: '',
          observacion: ''
        }
      };

      await this.reloadActiveConciliationDetail();
    },
    async reloadActiveConciliationDetail() {
      if (!this.activeConciliationModal) {
        return;
      }

      const modalKey = this.activeConciliationModal.branchKey;
      this.activeConciliationModal = {
        ...this.activeConciliationModal,
        loading: true
      };

      try {
        const response = await this.$admin.$get(
          `caja/conciliaciones/detalle?fecha=${encodeURIComponent(this.activeConciliationModal.selectedDate)}&codigoSucursal=${encodeURIComponent(this.activeConciliationModal.codigoSucursal)}&puntoVenta=${encodeURIComponent(this.activeConciliationModal.puntoVenta)}`
        );

        if (!this.activeConciliationModal || this.activeConciliationModal.branchKey !== modalKey) {
          return;
        }

        this.activeConciliationModal = {
          ...this.activeConciliationModal,
          conciliacion: {
            ...(response?.conciliacion || this.emptyConciliacion(this.activeConciliationModal)),
            receiptCount: Array.isArray(response?.comprobantes) ? response.comprobantes.length : 0
          },
          comprobantes: Array.isArray(response?.comprobantes) ? response.comprobantes : [],
          showUploadComposer: !this.isConciliationCompletedWithReceipts(
            response?.conciliacion || this.activeConciliationModal.conciliacion,
            Array.isArray(response?.comprobantes) ? response.comprobantes : []
          ),
          loading: false
        };
        await this.loadConciliacionesSummary();
      } catch (error) {
        console.error('[ventas/lista] reloadActiveConciliationDetail:error', {
          status: error?.response?.status || null,
          data: error?.response?.data || null,
          message: error?.message || null
        });
        if (this.activeConciliationModal) {
          this.activeConciliationModal = {
            ...this.activeConciliationModal,
            loading: false
          };
        }
        this.$swal.fire({
          icon: 'error',
          title: 'No se pudo abrir la conciliación',
          text: error?.response?.data?.message || 'No fue posible consultar los comprobantes de la fecha seleccionada.'
        });
      }
    },
    async submitConciliationReceipt() {
      if (!this.activeConciliationModal) {
        return;
      }

      const hasVisualSource = Boolean(
        this.activeConciliationModal.selectedFile
        || this.activeConciliationModal.qrScanner?.previewUrl
      );

      if (!hasVisualSource) {
        this.$swal.fire({
          icon: 'warning',
          title: 'Archivo requerido',
          text: 'Seleccione o capture el comprobante en la parte superior antes de guardar.'
        });
        return;
      }

      let uploadFile = null;
      try {
        uploadFile = await this.resolveConciliationUploadFile();
      } catch (error) {
        this.$swal.fire({
          icon: 'error',
          title: 'No se pudo preparar el archivo',
          text: 'Vuelva a seleccionar la imagen del comprobante antes de guardar.'
        });
        return;
      }

      if (!uploadFile) {
        this.$swal.fire({
          icon: 'error',
          title: 'Archivo no disponible',
          text: 'Vuelva a seleccionar la imagen del comprobante antes de guardar.'
        });
        return;
      }

      const activeBranch = this.branchRows.find((row) => this.branchKey(row?.codigoSucursal, row?.puntoVenta) === this.activeConciliationModal.branchKey);
      const codigoSucursal = this.normalizeNonNegativeInteger(
        activeBranch?.codigoSucursal ?? this.activeConciliationModal.codigoSucursal ?? this.activeConciliationModal.conciliacion?.codigoSucursal,
        0
      );
      const puntoVenta = this.normalizeNonNegativeInteger(
        activeBranch?.puntoVenta ?? this.activeConciliationModal.puntoVenta ?? this.activeConciliationModal.conciliacion?.puntoVenta,
        0
      );
      const formData = new FormData();
      formData.append('fecha', this.activeConciliationModal.fecha);
      formData.append('codigoSucursal', String(codigoSucursal));
      formData.append('puntoVenta', String(puntoVenta));
      formData.append('sucursalNombre', activeBranch?.displayName || activeBranch?.sucursalNombre || this.activeConciliationModal.title);
      formData.append('totalEfectivoSistema', String(activeBranch?.totalEfectivoFacturado ?? this.activeConciliationModal.conciliacion?.totalEfectivoSistema ?? 0));
      formData.append('totalQrSistema', String(activeBranch?.totalQrFacturado ?? this.activeConciliationModal.conciliacion?.totalQrSistema ?? 0));
      formData.append('totalGeneralSistema', String(activeBranch?.totalVendido ?? this.activeConciliationModal.conciliacion?.totalGeneralSistema ?? 0));
      formData.append('montoDepositado', String(this.activeConciliationModal.form.montoDepositado || 0));
      formData.append('banco', this.activeConciliationModal.form.banco || '');
      formData.append('nombreBanco', this.activeConciliationModal.form.nombreBanco || '');
      formData.append('usuarioBanco', this.activeConciliationModal.form.usuarioBanco || '');
      formData.append('agenciaBanco', this.activeConciliationModal.form.agenciaBanco || '');
      formData.append('transaccionBanco', this.activeConciliationModal.form.transaccionBanco || '');
      formData.append('fechaComprobante', this.activeConciliationModal.form.fechaComprobante || '');
      formData.append('monedaComprobante', this.activeConciliationModal.form.monedaComprobante || '');
      formData.append('depositante', this.activeConciliationModal.form.depositante || '');
      formData.append('beneficiario', this.activeConciliationModal.form.beneficiario || '');
      formData.append('referencia', this.activeConciliationModal.form.referencia || '');
      formData.append('observacion', this.activeConciliationModal.form.observacion || '');
      formData.append('archivo', uploadFile, uploadFile.name || this.activeConciliationModal.selectedFileName || 'comprobante');

      this.load = true;
      try {
        const response = await this.$admin.$post('caja/conciliaciones/comprobantes', formData);
        this.activeConciliationModal = {
          ...this.activeConciliationModal,
          conciliacion: {
            ...(response?.conciliacion || this.activeConciliationModal.conciliacion),
            receiptCount: Array.isArray(response?.comprobantes) ? response.comprobantes.length : 0
          },
          comprobantes: Array.isArray(response?.comprobantes) ? response.comprobantes : [],
          showUploadComposer: !this.isConciliationCompletedWithReceipts(
            response?.conciliacion || this.activeConciliationModal.conciliacion,
            Array.isArray(response?.comprobantes) ? response.comprobantes : []
          ),
          selectedFile: null,
          selectedFileName: '',
          form: {
            montoDepositado: '',
            banco: '',
            nombreBanco: '',
            usuarioBanco: '',
            agenciaBanco: '',
            transaccionBanco: '',
            fechaComprobante: '',
            monedaComprobante: '',
            depositante: '',
            beneficiario: '',
            referencia: '',
            observacion: ''
          },
          qrScan: {
            status: 'idle',
            message: '',
            rawText: '',
            parsed: null
          }
        };
        await this.loadConciliacionesSummary();
      } catch (error) {
        console.error('[ventas/lista] submitConciliationReceipt:error', {
          status: error?.response?.status || null,
          data: error?.response?.data || null,
          message: error?.message || null
        });
        this.$swal.fire({
          icon: 'error',
          title: 'No se pudo guardar el comprobante',
          text: error?.response?.data?.message || 'Revise el archivo y los datos del deposito.'
        });
      } finally {
        this.load = false;
      }
    },
    async deleteConciliationReceipt(receipt) {
      if (!this.activeConciliationModal || !receipt?.id) {
        return;
      }

      const confirm = await this.$swal.fire({
        icon: 'warning',
        title: 'Eliminar comprobante',
        text: 'Esta acción quitará el archivo y recalculará la conciliación del día.',
        showCancelButton: true,
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (!confirm.isConfirmed) {
        return;
      }

      this.load = true;
      try {
        const response = await this.$admin.$delete(`caja/conciliaciones/comprobantes/${receipt.id}`);
        this.activeConciliationModal = {
          ...this.activeConciliationModal,
          conciliacion: {
            ...(response?.conciliacion || this.activeConciliationModal.conciliacion),
            receiptCount: Array.isArray(response?.comprobantes) ? response.comprobantes.length : 0
          },
          comprobantes: Array.isArray(response?.comprobantes) ? response.comprobantes : []
        };
        await this.loadConciliacionesSummary();
      } catch (error) {
        console.error('[ventas/lista] deleteConciliationReceipt:error', {
          status: error?.response?.status || null,
          data: error?.response?.data || null,
          message: error?.message || null
        });
        this.$swal.fire({
          icon: 'error',
          title: 'No se pudo eliminar',
          text: error?.response?.data?.message || 'No fue posible eliminar el comprobante seleccionado.'
        });
      } finally {
        this.load = false;
      }
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
    },
    resolvePdfIncidenceDetails(item) {
      const parts = [];
      const facturasAnuladas = Number(item?.facturasAnuladas || 0);
      const totalFacturasAnuladas = Number(item?.totalFacturasAnuladas || 0);
      const cartRechazadoDescartado = Number(item?.cartRechazadoDescartado || 0);
      const totalCartRechazadoDescartado = Number(item?.totalCartRechazadoDescartado || 0);
      const otrasConCuf = Math.max(
        0,
        Number(item?.conCufOtroEstado || 0) - facturasAnuladas - cartRechazadoDescartado
      );

      if (Number(item?.observadas || 0) > 0) {
        parts.push(`Observadas: ${item.observadas}`);
      }

      if (Number(item?.pendientes || 0) > 0) {
        parts.push(`Pendientes: ${item.pendientes}`);
      }

      if (facturasAnuladas > 0) {
        parts.push(`Facturas anuladas: ${facturasAnuladas} por ${this.formatCurrency(totalFacturasAnuladas)} (no suma al total vendido)`);
      }

      if (cartRechazadoDescartado > 0) {
        parts.push(`QR rechazado/descartado: ${cartRechazadoDescartado} por ${this.formatCurrency(totalCartRechazadoDescartado)}`);
      }

      if (otrasConCuf > 0) {
        parts.push(`Otros estados con CUF: ${otrasConCuf}`);
      }

      if (Number(item?.qrPagadoPendienteFactura || 0) > 0) {
        parts.push(`QR pagado sin factura: ${item.qrPagadoPendienteFactura}`);
      }

      if (Number(item?.qrCancelado || 0) > 0) {
        parts.push(`QR anulados: ${item.qrCancelado}`);
      }

      if (Number(item?.qrPendiente || 0) > 0) {
        parts.push(`QR pendientes: ${item.qrPendiente}`);
      }

      return parts;
    },
    resolvePdfIncidenceLabel(item) {
      const parts = this.resolvePdfIncidenceDetails(item);
      return parts.length ? parts.join(' | ') : 'Sin incidencias';
    },
    async loadImageDataUrl(src) {
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
      try {
        const ministerioDataUrl = await this.loadImageDataUrl('/assets/imagenes/MOPSV.png');
        const correosDataUrl = await this.loadImageDataUrl('/assets/imagenes/AGBClogo1.png');
        const pageWidth = doc.internal.pageSize.getWidth();
        const rightLogoWidth = 46;
        const rightLogoX = pageWidth - 8 - rightLogoWidth;

        doc.setFillColor(255, 255, 255);
        doc.rect(8, 5, pageWidth - 16, 21, 'F');
        doc.addImage(ministerioDataUrl, 'PNG', 10, 6.4, 82, 15);
        doc.addImage(correosDataUrl, 'PNG', rightLogoX, 5.8, rightLogoWidth, 16.5);
      } catch (error) {
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.setFillColor(255, 255, 255);
        doc.rect(8, 5, pageWidth - 16, 21, 'F');
      }
    },
    normalizePdfBlocks(blocks) {
      return (blocks || [])
        .filter((block) => block && block.text)
        .map((block) => ({
          text: String(block.text),
          bold: Boolean(block.bold),
          fontSize: block.fontSize || 6.7
        }));
    },
    getPdfBlockLines(doc, text, width) {
      const safeWidth = Math.max(8, Number(width || 0));
      const normalizedText = String(text || '').trim();
      if (!normalizedText) {
        return [''];
      }

      return doc.splitTextToSize(normalizedText, safeWidth);
    },
    measurePdfInfoBlocks(doc, cellWidth, blocks) {
      const filteredBlocks = this.normalizePdfBlocks(blocks);
      if (!filteredBlocks.length) {
        return 12.2;
      }

      const contentWidth = Math.max(8, cellWidth - 1.1);
      const topPadding = 1;
      const bottomPadding = 1;
      const blockGap = 0.7;
      let totalHeight = topPadding + bottomPadding;

      filteredBlocks.forEach((block, index) => {
        const lines = this.getPdfBlockLines(doc, block.text, contentWidth);
        const lineHeight = Math.max(2.7, block.fontSize * 0.6);

        totalHeight += lines.length * lineHeight;
        if (index < filteredBlocks.length - 1) {
          totalHeight += blockGap;
        }
      });

      return Math.max(12.2, totalHeight);
    },
    buildPdfIncidentBlocks(branch) {
      return [
        { text: `Estado: ${branch.status?.label || '-'}`, bold: true },
        { text: `Incidencias: ${this.resolvePdfIncidenceLabel(branch)}` }
      ];
    },
    buildPdfSalesBlocks(branch) {
      return [
        { text: `Ventas total: ${Number(branch.qrFacturadas || 0) + Number(branch.electronicasFacturadas || 0)}`, bold: true },
        { text: `Ventas QR: ${branch.qrFacturadas || 0}` },
        { text: `Ventas Ef: ${branch.electronicasFacturadas || 0}` }
      ];
    },
    buildPdfTotalBlocks(branch) {
      const blocks = [
        { text: `Total: ${this.formatCurrency(branch.totalVendido)}`, bold: true },
        { text: `QR: ${this.formatCurrency(branch.totalQrFacturado)}` },
        { text: `Efectivo: ${this.formatCurrency(branch.totalEfectivoFacturado)}` }
      ];

      if (Number(branch.totalFacturasAnuladas || 0) > 0) {
        blocks.push({ text: `Anulado no sumado: ${this.formatCurrency(branch.totalFacturasAnuladas)}` });
      }

      if (Number(branch.totalCartRechazadoDescartado || 0) > 0) {
        blocks.push({ text: `QR rechazado/desc.: ${this.formatCurrency(branch.totalCartRechazadoDescartado)}` });
      }

      return blocks;
    },
    drawPdfInfoBlocks(doc, cell, blocks) {
      const filteredBlocks = this.normalizePdfBlocks(blocks);

      if (!filteredBlocks.length) {
        return;
      }

      const startX = cell.x + 0.55;
      const startY = cell.y + 1;
      const width = Math.max(8, cell.width - 1.1);
      const gap = 0.7;
      let cursorY = startY;

      filteredBlocks.forEach((block, index) => {
        const lines = this.getPdfBlockLines(doc, block.text, width);
        const lineHeight = Math.max(2.7, block.fontSize * 0.6);

        doc.setTextColor(20, 20, 20);
        doc.setFont('helvetica', block.bold ? 'bold' : 'normal');
        doc.setFontSize(block.fontSize);
        doc.text(lines, startX, cursorY + lineHeight);

        cursorY += (lines.length * lineHeight);
        if (index < filteredBlocks.length - 1) {
          cursorY += gap;
        }
      });
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
    addBranchMetaTable(doc, branch, groupedUsers) {
      const encargado = groupedUsers.length ? groupedUsers[0].nombre : 'Sin responsable';
      autoTable(doc, {
        startY: 28,
        body: [[
          'Oficina Postal:',
          branch.displayName || branch.sucursalNombre || '-',
          'Encargado sucursal:',
          encargado
        ], [
          'Ventanilla:',
          `Punto ${branch.puntoVentaLabel || branch.puntoVenta || 0}`,
          'Fecha de recaudacion:',
          this.endDate || this.defaultToday()
        ]],
        theme: 'grid',
        styles: {
          fontSize: 7.4,
          cellPadding: 2,
          lineColor: [90, 90, 90],
          textColor: [20, 20, 20]
        },
        columnStyles: {
          0: { fontStyle: 'bold', fillColor: [250, 250, 250], cellWidth: 28 },
          1: { cellWidth: 46 },
          2: { fontStyle: 'bold', fillColor: [250, 250, 250], cellWidth: 34 },
          3: { cellWidth: 50 }
        },
        margin: { left: 12, right: 12 }
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 2,
        body: [['KARDEX AGRUPADO POR CAJERO']],
        theme: 'grid',
        styles: {
          fontSize: 7.8,
          fontStyle: 'bold',
          cellPadding: 2,
          fillColor: [245, 245, 245],
          textColor: [20, 20, 20]
        },
        margin: { left: 12, right: 12 }
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 2,
        body: [[
          'CAJEROS CON VENTAS',
          String(groupedUsers.length),
          'TOTAL VENTAS',
          String(groupedUsers.reduce((acc, group) => acc + group.ventas.length, 0))
        ], [
          'TOTAL EN CAJA',
          this.formatCurrency(branch.totalEfectivoFacturado || branch.totalCaja || 0),
          'TOTAL EMITIDO',
          this.formatCurrency(branch.totalVendido || 0)
        ]],
        theme: 'grid',
        styles: {
          fontSize: 7.4,
          cellPadding: 2,
          lineColor: [90, 90, 90],
          textColor: [20, 20, 20]
        },
        columnStyles: {
          0: { fontStyle: 'bold', fillColor: [250, 250, 250], cellWidth: 38 },
          1: { cellWidth: 38 },
          2: { fontStyle: 'bold', fillColor: [250, 250, 250], cellWidth: 38 },
          3: { cellWidth: 38 }
        },
        margin: { left: 12, right: 12 }
      });
    },
    addUserSectionToPdf(doc, group, index) {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 3,
        body: [[`CAJERO ${index + 1}: ${String(group.nombre || 'Sin usuario').toUpperCase()}`]],
        theme: 'grid',
        styles: {
          fontSize: 7.8,
          fontStyle: 'bold',
          cellPadding: 2,
          fillColor: [245, 245, 245],
          textColor: [20, 20, 20]
        },
        margin: { left: 12, right: 12 }
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 1.5,
        body: [[
          `${String(group.nombre || '').toUpperCase()}\n${group.email || ''}`,
          `${group.ventas.length}\nventas`,
          `${group.cobradas}\ncobradas`,
          `${group.pendientes}\npendientes`,
          `${this.formatCurrency(group.totalCaja)}\ntotal en caja`
        ]],
        theme: 'grid',
        styles: {
          fontSize: 7,
          cellPadding: 1.8,
          lineColor: [90, 90, 90],
          textColor: [20, 20, 20]
        },
        columnStyles: {
          0: { cellWidth: 58, fontStyle: 'bold' },
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 20, halign: 'center' },
          4: { cellWidth: 34, halign: 'right' }
        },
        margin: { left: 12, right: 12 }
      });

      const detailRows = group.ventas.map((venta, rowIndex) => {
        const detailPayload = this.buildVentaDetallePdf(venta);
        return [
          String(rowIndex + 1),
          this.formatPdfDateTime(venta?.fecha),
          String(venta?.codigoOrden || '-'),
          String(venta?.cliente?.razonSocial || 'Sin cliente'),
          detailPayload.detalle,
          detailPayload.paquetes,
          this.numeroFacturaFromVenta(venta),
          String(venta?.status?.label || venta?.estado_emision || venta?.estado_pago || 'Emitida'),
          this.formatCurrency(Number(venta?.total || 0))
        ];
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 1.5,
        head: [[
          'Nro.',
          'Fecha',
          'Orden',
          'Cliente',
          'Detalle',
          'Paquete / codigos',
          'Factura',
          'Estado',
          'Importe'
        ]],
        body: detailRows,
        theme: 'grid',
        styles: {
          fontSize: 6.2,
          cellPadding: 1.5,
          lineColor: [90, 90, 90],
          textColor: [20, 20, 20],
          overflow: 'linebreak',
          valign: 'middle'
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [20, 20, 20],
          fontStyle: 'bold',
          fontSize: 6.2
        },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center' },
          1: { cellWidth: 16, halign: 'center' },
          2: { cellWidth: 17 },
          3: { cellWidth: 22 },
          4: { cellWidth: 36 },
          5: { cellWidth: 28 },
          6: { cellWidth: 11, halign: 'center' },
          7: { cellWidth: 11, halign: 'center' },
          8: { cellWidth: 13, halign: 'right' }
        },
        margin: { left: 12, right: 12 }
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY,
        body: [[
          { content: `SUBTOTAL ${String(group.nombre || '').toUpperCase()}`, styles: { halign: 'right', fontStyle: 'bold' } },
          { content: this.formatCurrency(group.totalCaja), styles: { halign: 'right', fontStyle: 'bold' } }
        ]],
        theme: 'grid',
        styles: {
          fontSize: 7,
          cellPadding: 1.8,
          lineColor: [90, 90, 90],
          textColor: [20, 20, 20]
        },
        columnStyles: {
          0: { cellWidth: 166 },
          1: { cellWidth: 16 }
        },
        margin: { left: 12, right: 12 }
      });
    },
    async downloadResumenExcel() {
      if (this.exportExcelLoading) {
        return;
      }

      this.exportExcelLoading = true;
      this.$swal.fire({
        title: 'Generando Excel',
        text: 'Estamos preparando la descarga. Esto puede tardar unos segundos.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          this.$swal.showLoading();
        }
      });

      try {
        const ExcelJSModule = await import('exceljs');
        const ExcelJS = ExcelJSModule.default || ExcelJSModule;
        const statusLabel = {
          all: 'Todos',
          cerrada: 'Sin observaciones',
          pendiente: 'Con pendientes',
          diferencia: 'Con observaciones',
          sin_ventas: 'Sin ventas'
        }[this.statusFilter] || 'Todos';
        const visibleBranches = this.filteredBranches;

        if (!visibleBranches.length) {
          this.$swal.fire({
            icon: 'warning',
            title: 'Sin datos para exportar',
            text: 'No hay sucursales visibles con el filtro actual.'
          });
          return;
        }

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Control de cierre';
        workbook.created = new Date();
        const generatedAt = this.currentPdfTimestamp();
        const totalFacturasAnuladas = visibleBranches.reduce(
          (acc, branch) => acc + Number(branch.totalFacturasAnuladas || 0),
          0
        );
        const totalCartRechazadoDescartado = visibleBranches.reduce(
          (acc, branch) => acc + Number(branch.totalCartRechazadoDescartado || 0),
          0
        );
        const contractBranches = visibleBranches.filter(
          (branch) => Number(branch.totalContratosNoSumados || branch.contratosNoSumados || 0) > 0
        );
        const contractRows = (await Promise.all(contractBranches.map(async (branch) => {
          try {
            const ventas = await this.fetchBranchVentas(branch);

            return ventas
              .filter((venta) => this.isExcludedServiceVenta(venta))
              .map((venta) => ({
                sucursal: branch.displayName || '-',
                codigo_sucursal: branch.codigoSucursalLabel,
                punto_venta: branch.puntoVentaLabel,
                cajero: this.usuarioNombreFromVenta(venta),
                empresa: this.contratoEmpresaLabel(venta),
                tipo_servicio: this.excludedServiceTypeLabel(venta),
                descripcion: this.contratoDescripcionLabel(venta),
                importe: Number(venta.total || 0)
              }));
          } catch (error) {
            return [];
          }
        }))).flat();

        const mainSheet = workbook.addWorksheet('Control cierre', {
          views: [{ state: 'frozen', ySplit: 11 }]
        });
        mainSheet.pageSetup = {
          paperSize: 1,
          orientation: 'portrait',
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
          margins: { left: 0.3, right: 0.3, top: 0.4, bottom: 0.4, header: 0.2, footer: 0.2 }
        };
        mainSheet.columns = [
          { width: 28 },
          { width: 23 },
          { width: 18 },
          { width: 28 },
          { width: 13 },
          { width: 20 }
        ];

        const border = {
          top: { style: 'thin', color: { argb: 'FF6B7280' } },
          left: { style: 'thin', color: { argb: 'FF6B7280' } },
          bottom: { style: 'thin', color: { argb: 'FF6B7280' } },
          right: { style: 'thin', color: { argb: 'FF6B7280' } }
        };
        const sectionFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
        const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        const titleFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
        const applyRangeBorder = (fromRow, fromCol, toRow, toCol) => {
          for (let row = fromRow; row <= toRow; row += 1) {
            for (let col = fromCol; col <= toCol; col += 1) {
              mainSheet.getCell(row, col).border = border;
            }
          }
        };
        const styleSectionTitle = (rowNumber, text, mergeTo = 6) => {
          mainSheet.mergeCells(rowNumber, 1, rowNumber, mergeTo);
          const cell = mainSheet.getCell(rowNumber, 1);
          cell.value = text;
          cell.font = { name: 'Calibri', size: 11, bold: true };
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
          cell.fill = sectionFill;
          applyRangeBorder(rowNumber, 1, rowNumber, mergeTo);
          mainSheet.getRow(rowNumber).height = 24;
        };

        mainSheet.mergeCells('A1:F1');
        const titleCell = mainSheet.getCell('A1');
        titleCell.value = 'CONTROL DE CIERRE';
        titleCell.font = { name: 'Calibri', size: 16, bold: false };
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
        titleCell.fill = titleFill;
        mainSheet.getRow(1).height = 30;

        const infoRows = [
          ['Fecha inicio:', this.startDate || this.defaultToday(), 'Fecha fin:', this.endDate || this.defaultToday(), 'Estado:', statusLabel],
          ['Búsqueda:', this.filters.q || 'Todas las sucursales', 'Sucursales visibles:', Number(this.dashboardMetrics.total || 0), 'Total vendido:', this.formatCurrency(this.dashboardMetrics.totalVendido || 0)]
        ];
        infoRows.forEach((rowData, index) => {
          const rowNumber = 3 + index;
          rowData.forEach((value, cellIndex) => {
            const cell = mainSheet.getCell(rowNumber, cellIndex + 1);
            cell.value = value;
            cell.font = {
              name: 'Calibri',
              size: 10,
              bold: cellIndex % 2 === 0
            };
            cell.alignment = {
              vertical: 'middle',
              horizontal: cellIndex % 2 === 0 ? 'left' : (cellIndex === 5 ? 'right' : 'left'),
              wrapText: true
            };
            if (cellIndex % 2 === 0) {
              cell.fill = headerFill;
            }
          });
          mainSheet.getRow(rowNumber).height = 24;
        });
        applyRangeBorder(3, 1, 4, 6);

        styleSectionTitle(6, 'KARDEX DE VENTAS COBRADAS');
        const metricRows = [
          ['Sucursales del día', Number(this.dashboardMetrics.total || 0), 'Sin observaciones', Number(this.dashboardMetrics.conformes || 0), 'Con pendientes', Number(this.dashboardMetrics.pendientes || 0)],
          ['Con observaciones', Number(this.dashboardMetrics.diferencias || 0), 'Sin ventas', Number(this.dashboardMetrics.sinVentas || 0), 'Total vendido', this.formatCurrency(this.dashboardMetrics.totalVendido || 0)]
        ];
        metricRows.forEach((rowData, index) => {
          const rowNumber = 7 + index;
          rowData.forEach((value, cellIndex) => {
            const cell = mainSheet.getCell(rowNumber, cellIndex + 1);
            cell.value = value;
            cell.font = { name: 'Calibri', size: 10, bold: cellIndex % 2 === 0 };
            cell.alignment = {
              vertical: 'middle',
              horizontal: cellIndex % 2 === 0 ? 'left' : 'right',
              wrapText: true
            };
            if (cellIndex % 2 === 0) {
              cell.fill = headerFill;
            }
          });
          mainSheet.getRow(rowNumber).height = 24;
        });
        applyRangeBorder(7, 1, 8, 6);

        styleSectionTitle(10, 'RESUMEN DE SUCURSALES', 4);
        const branchHeaderRow = 11;
        ['Sucursal', 'Estado e incidencias', 'Total ventas', 'Total vendido'].forEach((value, index) => {
          const cell = mainSheet.getCell(branchHeaderRow, index + 1);
          cell.value = value;
          cell.font = { name: 'Calibri', size: 10, bold: true };
          cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
          cell.fill = headerFill;
          cell.border = border;
        });
        mainSheet.getRow(branchHeaderRow).height = 26;

        let currentRow = 12;
        visibleBranches.forEach((branch) => {
          const branchLabel = `${branch.displayName || '-'} (${branch.codigoSucursalLabel} / PV ${branch.puntoVentaLabel})`;
          const incidentText = this.buildPdfIncidentBlocks(branch).map((block) => block.text).join('\n');
          const salesText = this.buildPdfSalesBlocks(branch).map((block) => block.text).join('\n');
          const totalsText = this.buildPdfTotalBlocks(branch).map((block) => block.text).join('\n');
          const row = mainSheet.getRow(currentRow);
          row.getCell(1).value = branchLabel;
          row.getCell(2).value = incidentText;
          row.getCell(3).value = salesText;
          row.getCell(4).value = totalsText;
          [1, 2, 3, 4].forEach((col) => {
            const cell = row.getCell(col);
            cell.border = border;
            cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
            cell.font = { name: 'Calibri', size: 10 };
          });
          row.height = 56;
          currentRow += 1;
        });

        const totalBoxStart = currentRow;
        mainSheet.mergeCells(totalBoxStart, 1, totalBoxStart, 3);
        const totalTitle = mainSheet.getCell(totalBoxStart, 1);
        totalTitle.value = 'TOTALES';
        totalTitle.font = { name: 'Calibri', size: 11, bold: true };
        totalTitle.fill = sectionFill;
        totalTitle.alignment = { vertical: 'middle', horizontal: 'left' };
        applyRangeBorder(totalBoxStart, 1, totalBoxStart, 4);

        const totalRows = [
          ['Total general', this.formatCurrency(this.dashboardMetrics.totalVendido || 0)],
          ['Total QR', this.formatCurrency(this.dashboardMetrics.totalQrFacturado || 0)],
          ['Total efectivo', this.formatCurrency(this.dashboardMetrics.totalEfectivoFacturado || 0)]
        ];
        if (totalFacturasAnuladas > 0) {
          totalRows.push(['Facturas anuladas no sumadas', this.formatCurrency(totalFacturasAnuladas)]);
        }
        if (totalCartRechazadoDescartado > 0) {
          totalRows.push(['QR rechazado/descartado', this.formatCurrency(totalCartRechazadoDescartado)]);
        }
        totalRows.forEach((rowData, index) => {
          const rowNumber = totalBoxStart + 1 + index;
          mainSheet.mergeCells(rowNumber, 1, rowNumber, 3);
          mainSheet.getCell(rowNumber, 1).value = rowData[0];
          mainSheet.getCell(rowNumber, 4).value = rowData[1];
          mainSheet.getCell(rowNumber, 1).font = { name: 'Calibri', size: 10, bold: true };
          mainSheet.getCell(rowNumber, 4).font = { name: 'Calibri', size: 10, bold: true };
          mainSheet.getCell(rowNumber, 1).alignment = { vertical: 'middle', horizontal: 'left' };
          mainSheet.getCell(rowNumber, 4).alignment = { vertical: 'middle', horizontal: 'right' };
          applyRangeBorder(rowNumber, 1, rowNumber, 4);
        });
        currentRow = totalBoxStart + totalRows.length + 2;

        currentRow += 1;
        mainSheet.mergeCells(currentRow, 1, currentRow, 2);
        mainSheet.getCell(currentRow, 1).value = 'Generado en';
        mainSheet.getCell(currentRow, 3).value = generatedAt;
        mainSheet.getCell(currentRow, 1).font = { name: 'Calibri', size: 10, bold: true };
        mainSheet.getCell(currentRow, 3).font = { name: 'Calibri', size: 10 };
        mainSheet.getCell(currentRow, 1).alignment = { horizontal: 'left' };
        mainSheet.getCell(currentRow, 3).alignment = { horizontal: 'left' };

        const branchesSheet = workbook.addWorksheet('Sucursales');
        branchesSheet.columns = [
          { header: 'Sucursal', key: 'sucursal', width: 28 },
          { header: 'Código de sucursal', key: 'codigo_sucursal', width: 16 },
          { header: 'Punto venta', key: 'punto_venta', width: 14 },
          { header: 'Estado', key: 'estado', width: 20 },
          { header: 'Detalle estado', key: 'detalle_estado', width: 24 },
          { header: 'Total vendido', key: 'total_vendido', width: 16 },
          { header: 'Total QR', key: 'total_qr_facturado', width: 16 },
          { header: 'Total efectivo', key: 'total_efectivo_facturado', width: 18 },
          { header: 'Total ECA', key: 'total_eca_facturado', width: 16 },
          { header: 'Contratos no sumados', key: 'total_contratos_no_sumados', width: 22 },
          { header: 'Ventas totales', key: 'ventas_totales', width: 14 },
          { header: 'Ventas QR', key: 'ventas_qr', width: 12 },
          { header: 'Ventas efectivo', key: 'ventas_efectivo', width: 15 },
          { header: 'Ventas ECA', key: 'ventas_eca', width: 12 },
          { header: 'Ventas contrato', key: 'ventas_contrato', width: 15 },
          { header: 'Observadas', key: 'observadas', width: 12 },
          { header: 'Pendientes', key: 'pendientes', width: 12 },
          { header: 'Cuf otro estado', key: 'facturas_anuladas_o_cuf_otro_estado', width: 18 },
          { header: 'QR pendiente factura', key: 'qr_pagado_pendiente_factura', width: 20 },
          { header: 'QR cancelado', key: 'qr_cancelado', width: 14 },
          { header: 'QR pendiente', key: 'qr_pendiente', width: 14 },
          { header: 'Cajeros unicos', key: 'cajeros_unicos', width: 14 }
        ];
        visibleBranches.forEach((branch) => {
          branchesSheet.addRow({
            sucursal: branch.displayName || '-',
            codigo_sucursal: branch.codigoSucursalLabel,
            punto_venta: branch.puntoVentaLabel,
            estado: branch.status?.label || '',
            detalle_estado: branch.status?.hint || '',
            total_vendido: Number(branch.totalVendido || 0),
            total_qr_facturado: Number(branch.totalQrFacturado || 0),
            total_efectivo_facturado: Number(branch.totalEfectivoFacturado || 0),
            total_eca_facturado: Number(branch.totalEcaFacturado || 0),
            total_contratos_no_sumados: Number(branch.totalContratosNoSumados || 0),
            ventas_totales: Number(branch.facturadas || 0),
            ventas_qr: Number(branch.qrFacturadas || 0),
            ventas_efectivo: Number(branch.electronicasFacturadas || 0),
            ventas_eca: Number(branch.ecaFacturadas || 0),
            ventas_contrato: Number(branch.contratosNoSumados || 0),
            observadas: Number(branch.observadas || 0),
            pendientes: Number(branch.pendientes || 0),
            facturas_anuladas_o_cuf_otro_estado: Number(branch.conCufOtroEstado || 0),
            qr_pagado_pendiente_factura: Number(branch.qrPagadoPendienteFactura || 0),
            qr_cancelado: Number(branch.qrCancelado || 0),
            qr_pendiente: Number(branch.qrPendiente || 0),
            cajeros_unicos: Number(branch.cajerosUnicos || 0)
          });
        });

        const incidentsSheet = workbook.addWorksheet('Incidencias');
        incidentsSheet.columns = [
          { header: 'Sucursal', key: 'sucursal', width: 28 },
          { header: 'Código de sucursal', key: 'codigo_sucursal', width: 16 },
          { header: 'Punto venta', key: 'punto_venta', width: 14 },
          { header: 'Incidencia', key: 'incidencia', width: 52 }
        ];
        visibleBranches.forEach((branch) => {
          const blocks = this.buildPdfIncidentBlocks(branch);
          if (!blocks.length) {
            incidentsSheet.addRow({
              sucursal: branch.displayName || '-',
              codigo_sucursal: branch.codigoSucursalLabel,
              punto_venta: branch.puntoVentaLabel,
              incidencia: 'Sin incidencias'
            });
            return;
          }

          blocks.forEach((block) => {
            incidentsSheet.addRow({
              sucursal: branch.displayName || '-',
              codigo_sucursal: branch.codigoSucursalLabel,
              punto_venta: branch.puntoVentaLabel,
              incidencia: block.text
            });
          });
        });

        if (contractRows.length) {
          const contractsSheet = workbook.addWorksheet('Servicios no sumados', {
            views: [{ state: 'frozen', ySplit: 2 }]
          });
          contractsSheet.pageSetup = {
            paperSize: 1,
            orientation: 'landscape',
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
            margins: { left: 0.3, right: 0.3, top: 0.4, bottom: 0.4, header: 0.2, footer: 0.2 }
          };
          contractsSheet.columns = [
            { width: 22 },
            { width: 28 },
            { width: 32 },
            { width: 44 },
            { width: 14 }
          ];

          const applyContractsBorder = (fromRow, fromCol, toRow, toCol) => {
            for (let row = fromRow; row <= toRow; row += 1) {
              for (let col = fromCol; col <= toCol; col += 1) {
                contractsSheet.getCell(row, col).border = border;
              }
            }
          };

          contractsSheet.mergeCells('A1:E1');
          const contractsTitleCell = contractsSheet.getCell('A1');
          contractsTitleCell.value = 'DETALLE DE SERVICIOS NO SUMADOS';
          contractsTitleCell.font = { name: 'Calibri', size: 13, bold: true };
          contractsTitleCell.alignment = { vertical: 'middle', horizontal: 'left' };
          contractsTitleCell.fill = sectionFill;
          applyContractsBorder(1, 1, 1, 5);
          contractsSheet.getRow(1).height = 24;

          contractsSheet.mergeCells('A2:C2');
          contractsSheet.getCell('A2').value = `Emitido por: ${this.currentPdfUserLabel()}`;
          contractsSheet.getCell('A2').font = { name: 'Calibri', size: 10 };
          contractsSheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'left' };
          contractsSheet.mergeCells('D2:E2');
          contractsSheet.getCell('D2').value = `Fecha y hora: ${generatedAt}`;
          contractsSheet.getCell('D2').font = { name: 'Calibri', size: 10 };
          contractsSheet.getCell('D2').alignment = { vertical: 'middle', horizontal: 'right' };
          contractsSheet.getRow(2).height = 22;

          let contractRowCursor = 4;
          const groupedContractRows = contractRows.reduce((acc, row) => {
            const key = `${row.sucursal} (${row.codigo_sucursal} / PV ${row.punto_venta})`;
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(row);
            return acc;
          }, {});

          Object.entries(groupedContractRows).forEach(([groupLabel, rows]) => {
            contractsSheet.mergeCells(contractRowCursor, 1, contractRowCursor, 5);
            const groupCell = contractsSheet.getCell(contractRowCursor, 1);
            groupCell.value = groupLabel;
            groupCell.font = { name: 'Calibri', size: 11, bold: true };
            groupCell.alignment = { vertical: 'middle', horizontal: 'left' };
            groupCell.fill = headerFill;
            applyContractsBorder(contractRowCursor, 1, contractRowCursor, 5);
            contractsSheet.getRow(contractRowCursor).height = 22;
            contractRowCursor += 1;

            ['Cajero', 'Empresa', 'Descripción', 'Importe'].forEach((value, index) => {
              const cell = contractsSheet.getCell(contractRowCursor, index + 1);
              cell.value = value;
              cell.font = { name: 'Calibri', size: 10, bold: true };
              cell.alignment = { vertical: 'middle', horizontal: index === 3 ? 'right' : 'center', wrapText: true };
              cell.fill = headerFill;
              cell.border = border;
            });
            contractsSheet.mergeCells(contractRowCursor, 4, contractRowCursor, 4);
            contractsSheet.getRow(contractRowCursor).height = 22;
            contractRowCursor += 1;

            rows.forEach((row) => {
              const excelRow = contractsSheet.getRow(contractRowCursor);
              excelRow.getCell(1).value = row.cajero;
              excelRow.getCell(2).value = row.empresa;
              excelRow.getCell(3).value = `${row.tipo_servicio}\n${row.descripcion}`;
              excelRow.getCell(4).value = this.formatCurrency(row.importe);
              [1, 2, 3, 4].forEach((col) => {
                const cell = excelRow.getCell(col);
                cell.border = border;
                cell.alignment = {
                  vertical: 'top',
                  horizontal: col === 4 ? 'right' : 'left',
                  wrapText: true
                };
                cell.font = { name: 'Calibri', size: 10 };
              });
              excelRow.height = 40;
              contractRowCursor += 1;
            });

            contractRowCursor += 1;
          });
        }

        workbook.worksheets.forEach((sheet) => {
          const headerRow = sheet.getRow(1);
          if (sheet.name !== 'Control cierre') {
            headerRow.font = { name: 'Calibri', size: 10, bold: true };
            headerRow.fill = headerFill;
            headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            headerRow.eachCell((cell) => {
              cell.border = border;
            });
            sheet.views = [{ state: 'frozen', ySplit: 1 }];
          }
        });

        this.$swal.close();
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(
          new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }),
          `control-cierre-${this.startDate || 'inicio'}-${this.endDate || 'fin'}.xlsx`
        );
      } catch (error) {
        this.$swal.close();
        this.$swal.fire({
          icon: 'error',
          title: 'Exportación no disponible',
          text: 'No se pudo generar el Excel del control de cierre.'
        });
      } finally {
        this.exportExcelLoading = false;
      }
    },
    async downloadResumenPdf() {
      if (this.exportPdfLoading) {
        return;
      }

      this.exportPdfLoading = true;
      this.$swal.fire({
        title: 'Generando PDF',
        text: 'Estamos preparando la descarga. Esto puede tardar unos segundos.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          this.$swal.showLoading();
        }
      });

      try {
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'letter'
        });
        const generatedBy = this.currentPdfUserLabel();
        const generatedAt = this.currentPdfTimestamp();
        const pageWidth = doc.internal.pageSize.getWidth();
        const reportWidth = 204;
        const reportMarginX = (pageWidth - reportWidth) / 2;
        const statusLabel = {
          all: 'Todos',
          cerrada: 'Sin observaciones',
          pendiente: 'Con pendientes',
          diferencia: 'Con observaciones',
          sin_ventas: 'Sin ventas'
        }[this.statusFilter] || 'Todos';
        const visibleBranches = this.filteredBranches;
        const contractBranches = visibleBranches.filter((branch) => Number(branch.totalContratosNoSumados || branch.contratosNoSumados || 0) > 0);
        const contractGroups = await Promise.all(contractBranches.map(async (branch) => {
          try {
            const ventas = await this.fetchBranchVentas(branch);
            const rows = ventas
              .filter((venta) => this.isExcludedServiceVenta(venta))
              .map((venta) => ([
                this.usuarioNombreFromVenta(venta),
                this.contratoEmpresaLabel(venta),
                `${this.excludedServiceTypeLabel(venta)}\n${this.contratoDescripcionLabel(venta)}`,
                this.formatCurrency(venta.total || 0)
              ]));

            if (!rows.length) {
              return null;
            }

            return {
              branchLabel: `${branch.displayName || '-'} (${branch.codigoSucursalLabel} / PV ${branch.puntoVentaLabel})`,
              total: ventas
                .filter((venta) => this.isExcludedServiceVenta(venta))
                .reduce((sum, venta) => sum + Number(venta.total || 0), 0),
              rows
            };
          } catch (error) {
            return null;
          }
        }));
        const visibleContractGroups = contractGroups.filter(Boolean);

        if (!visibleBranches.length) {
          this.$swal.fire({
            icon: 'warning',
            title: 'Sin datos para exportar',
            text: 'No hay sucursales visibles con el filtro actual.'
          });
          return;
        }

        await this.drawPdfHeader(doc);

        doc.setFontSize(13);
        doc.setTextColor(20, 20, 20);
        doc.text('CONTROL DE CIERRE', pageWidth / 2, 33, { align: 'center' });

        autoTable(doc, {
          startY: 39,
          body: [[
            'Fecha inicio:',
            this.startDate || this.defaultToday(),
            'Fecha fin:',
            this.endDate || this.defaultToday(),
            'Estado:',
            statusLabel
          ], [
            'Búsqueda:',
            this.filters.q || 'Todas las sucursales',
            'Sucursales visibles:',
            String(this.dashboardMetrics.total),
            'Total vendido:',
            this.formatCurrency(this.dashboardMetrics.totalVendido)
          ]],
          theme: 'grid',
          styles: {
            fontSize: 7.1,
            cellPadding: 1.9,
            minCellHeight: 8,
            lineColor: [90, 90, 90],
            textColor: [20, 20, 20]
          },
          tableWidth: reportWidth,
          columnStyles: {
            0: { fontStyle: 'bold', fillColor: [245, 245, 245], cellWidth: 22 },
            1: { cellWidth: 46 },
            2: { fontStyle: 'bold', fillColor: [245, 245, 245], cellWidth: 22 },
            3: { cellWidth: 46 },
            4: { fontStyle: 'bold', fillColor: [245, 245, 245], cellWidth: 22 },
            5: { cellWidth: 46 }
          },
          margin: { left: reportMarginX, right: reportMarginX }
        });

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 3,
          body: [['KARDEX DE VENTAS COBRADAS']],
          theme: 'grid',
          styles: {
            fontSize: 8.4,
            fontStyle: 'bold',
            cellPadding: 2.4,
            minCellHeight: 8,
            fillColor: [245, 245, 245],
            textColor: [20, 20, 20],
            lineColor: [90, 90, 90]
          },
          tableWidth: reportWidth,
          margin: { left: reportMarginX, right: reportMarginX }
        });

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY,
          body: [[
            'Sucursales del día',
            String(this.dashboardMetrics.total),
            'Sin observaciones',
            String(this.dashboardMetrics.conformes),
            'Con pendientes',
            String(this.dashboardMetrics.pendientes)
          ], [
            'Con observaciones',
            String(this.dashboardMetrics.diferencias),
            'Sin ventas',
            String(this.dashboardMetrics.sinVentas),
            'Total vendido',
            this.formatCurrency(this.dashboardMetrics.totalVendido)
          ]],
          theme: 'grid',
          styles: {
            fontSize: 7.1,
            cellPadding: 1.9,
            minCellHeight: 8,
            lineColor: [90, 90, 90],
            textColor: [20, 20, 20]
          },
          tableWidth: reportWidth,
          columnStyles: {
            0: { fontStyle: 'bold', fillColor: [245, 245, 245], cellWidth: 26 },
            1: { cellWidth: 42, halign: 'right' },
            2: { fontStyle: 'bold', fillColor: [245, 245, 245], cellWidth: 26 },
            3: { cellWidth: 42, halign: 'right' },
            4: { fontStyle: 'bold', fillColor: [245, 245, 245], cellWidth: 26 },
            5: { cellWidth: 42, halign: 'right' }
          },
          margin: { left: reportMarginX, right: reportMarginX }
        });

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 3,
          body: [['RESUMEN DE SUCURSALES']],
          theme: 'grid',
          styles: {
            fontSize: 8.6,
            fontStyle: 'bold',
            cellPadding: 2.2,
            minCellHeight: 7,
            fillColor: [245, 245, 245],
            textColor: [20, 20, 20],
            lineColor: [90, 90, 90]
          },
          tableWidth: reportWidth,
          margin: { left: reportMarginX, right: reportMarginX }
        });

        const tableRows = visibleBranches.map((branch) => [
          `${branch.displayName || '-'} (${branch.codigoSucursalLabel} / PV ${branch.puntoVentaLabel})`,
          this.buildPdfIncidentBlocks(branch).map((block) => block.text).join('\n'),
          this.buildPdfSalesBlocks(branch).map((block) => block.text).join('\n'),
          this.buildPdfTotalBlocks(branch).map((block) => block.text).join('\n')
        ]);

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY,
          head: [[
            'Sucursal',
            'Estado e incidencias',
            'Total ventas',
            'Total vendido'
          ]],
          body: tableRows,
          theme: 'grid',
          headStyles: {
            fillColor: [245, 245, 245],
            textColor: [20, 20, 20],
            fontSize: 7.8,
            fontStyle: 'bold',
            halign: 'center',
            valign: 'middle',
            lineColor: [90, 90, 90],
            minCellHeight: 10
          },
          styles: {
            fontSize: 7.5,
            cellPadding: 1.4,
            minCellHeight: 9,
            lineColor: [90, 90, 90],
            textColor: [20, 20, 20],
            overflow: 'linebreak',
            valign: 'top'
          },
          tableWidth: reportWidth,
          columnStyles: {
            0: { cellWidth: 48, valign: 'middle' },
            1: { cellWidth: 50, valign: 'top' },
            2: { cellWidth: 36, halign: 'left', valign: 'top' },
            3: { cellWidth: 70, halign: 'left', valign: 'top' }
          },
          margin: { left: reportMarginX, right: reportMarginX }
        });

        const footerRows = [
          [{ content: this.formatCurrency(this.dashboardMetrics.totalVendido), styles: { halign: 'left', fontStyle: 'bold' } }],
          [{ content: `Total QR: ${this.formatCurrency(this.dashboardMetrics.totalQrFacturado || 0)}`, styles: { halign: 'left', fontStyle: 'bold' } }],
          [{ content: `Total efectivo: ${this.formatCurrency(this.dashboardMetrics.totalEfectivoFacturado || 0)}`, styles: { halign: 'left', fontStyle: 'bold' } }]
        ];

        const totalFacturasAnuladas = visibleBranches.reduce(
          (acc, branch) => acc + Number(branch.totalFacturasAnuladas || 0),
          0
        );
        const totalCartRechazadoDescartado = visibleBranches.reduce(
          (acc, branch) => acc + Number(branch.totalCartRechazadoDescartado || 0),
          0
        );

        if (totalFacturasAnuladas > 0) {
          footerRows.push([
            { content: '', colSpan: 3, styles: { halign: 'left', lineWidth: 0 } },
            {
              content: `Facturas anuladas no sumadas: ${this.formatCurrency(totalFacturasAnuladas)}`,
              styles: { halign: 'left', fontStyle: 'bold' }
            }
          ]);
        }

        if (totalCartRechazadoDescartado > 0) {
          footerRows.push([
            { content: '', colSpan: 3, styles: { halign: 'left', lineWidth: 0 } },
            {
              content: `QR rechazado/descartado: ${this.formatCurrency(totalCartRechazadoDescartado)}`,
              styles: { halign: 'left', fontStyle: 'bold' }
            }
          ]);
        }

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY,
          body: footerRows,
          theme: 'grid',
          styles: {
            fontSize: 7.2,
            cellPadding: 1.7,
            lineColor: [90, 90, 90],
            textColor: [20, 20, 20],
            valign: 'middle'
          },
          tableWidth: 58,
          columnStyles: {
            0: { cellWidth: 58 }
          },
          margin: { left: reportMarginX + reportWidth - 58, right: reportMarginX }
        });

        if (visibleContractGroups.length) {
          autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 4,
            body: [['DETALLE DE SERVICIOS NO SUMADOS']],
            theme: 'grid',
            styles: {
              fontSize: 8.4,
              fontStyle: 'bold',
              cellPadding: 2.4,
              minCellHeight: 8,
              fillColor: [245, 245, 245],
              textColor: [20, 20, 20],
              lineColor: [90, 90, 90]
            },
            tableWidth: reportWidth,
            margin: { left: reportMarginX, right: reportMarginX }
          });

          let contractsY = doc.lastAutoTable.finalY;
          const pageHeight = doc.internal.pageSize.getHeight();
          const minContractsBlockHeight = 42;

          visibleContractGroups.forEach((group) => {
            if ((pageHeight - contractsY) < minContractsBlockHeight) {
              doc.addPage();
              this.drawPdfHeader(doc);
              contractsY = 28;
            }

            autoTable(doc, {
              startY: contractsY,
              body: [[group.branchLabel]],
              theme: 'grid',
              styles: {
                fontSize: 7.8,
                fontStyle: 'bold',
                cellPadding: 2,
                minCellHeight: 7,
                fillColor: [250, 250, 250],
                textColor: [20, 20, 20],
                lineColor: [90, 90, 90]
              },
              tableWidth: reportWidth,
              margin: { left: reportMarginX, right: reportMarginX }
            });

            autoTable(doc, {
              startY: doc.lastAutoTable.finalY,
              head: [[
                'Cajero',
                'Empresa',
                'Descripción',
                'Importe'
              ]],
              body: group.rows,
              theme: 'grid',
              headStyles: {
                fillColor: [245, 245, 245],
                textColor: [20, 20, 20],
                fontSize: 7.3,
                fontStyle: 'bold',
                halign: 'center',
                valign: 'middle',
                lineColor: [90, 90, 90],
                minCellHeight: 10
              },
              styles: {
                fontSize: 7,
                cellPadding: 1.5,
                minCellHeight: 8,
                lineColor: [90, 90, 90],
                textColor: [20, 20, 20],
                overflow: 'linebreak',
                valign: 'top'
              },
              tableWidth: reportWidth,
              columnStyles: {
                0: { cellWidth: 32 },
                1: { cellWidth: 48 },
                2: { cellWidth: 104 },
                3: { cellWidth: 20, halign: 'right' }
              },
              margin: { left: reportMarginX, right: reportMarginX }
            });

            autoTable(doc, {
              startY: doc.lastAutoTable.finalY,
              body: [[
                { content: `SUBTOTAL SERVICIOS NO SUMADOS ${String(group.branchLabel || '').toUpperCase()}`, styles: { halign: 'right', fontStyle: 'bold' } },
                { content: this.formatCurrency(group.total), styles: { halign: 'right', fontStyle: 'bold' } }
              ]],
              theme: 'grid',
              styles: {
                fontSize: 7,
                cellPadding: 1.8,
                lineColor: [90, 90, 90],
                textColor: [20, 20, 20]
              },
              columnStyles: {
                0: { cellWidth: 184 },
                1: { cellWidth: 20 }
              },
              margin: { left: reportMarginX, right: reportMarginX }
            });

            contractsY = doc.lastAutoTable.finalY + 2;
          });
        }

        this.drawPdfFooter(doc, generatedBy, generatedAt);
        this.$swal.close();
        doc.save(`control-cierre-${this.startDate || 'inicio'}-${this.endDate || 'fin'}.pdf`);
      } catch (error) {
        this.$swal.close();
        this.$swal.fire({
          icon: 'error',
          title: 'Exportación no disponible',
          text: 'No se pudo generar el PDF del control de cierre.'
        });
      } finally {
        this.exportPdfLoading = false;
      }
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

.conciliation-page-shell {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.conciliation-page-topbar {
  display: flex;
  justify-content: flex-start;
}

.conciliation-page-card {
  width: 100%;
  max-width: none;
  max-height: none;
}

.conciliation-back-btn {
  min-height: 42px;
}

.conciliation-hero-card {
  padding: 1.15rem;
}

.conciliation-hero-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.conciliation-hero-head h3 {
  margin: 0;
  color: #173163;
  font-size: 1.65rem;
  font-weight: 900;
  letter-spacing: -0.03em;
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

.hero-copy {
  text-align: center;
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
  grid-template-columns: 170px 170px 120px minmax(280px, 1fr) 170px 260px;
  gap: 0.7rem;
  margin-top: 0.95rem;
  align-items: center;
}

.toolbar-field-date {
  min-width: 0;
}

.toolbar-field-search {
  min-width: 0;
}

.toolbar-field-select {
  min-width: 0;
}

.toolbar-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.55rem;
  min-width: 0;
}

.toolbar-export-btn {
  border: 1px solid #f0c36a;
  background: linear-gradient(180deg, #fff7e5 0%, #fff1cc 100%);
  color: #9a6200;
  border-radius: 12px;
  min-height: 42px;
  padding: 0.7rem 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease;
  width: 100%;
  justify-content: center;
}

.toolbar-export-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 20px rgba(154, 98, 0, 0.12);
}

.toolbar-filter-btn {
  border: 1px solid #2d73df;
  background: linear-gradient(180deg, #317be9 0%, #1e62cc 100%);
  color: #fff;
  border-radius: 12px;
  min-height: 42px;
  padding: 0.7rem 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease, opacity 0.16s ease;
}

.toolbar-filter-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 12px 20px rgba(30, 98, 204, 0.2);
}

.toolbar-filter-btn:disabled {
  cursor: wait;
  opacity: 0.72;
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

.report-loading-banner {
  margin-top: 0.85rem;
  border: 1px solid #cfe0ff;
  background: linear-gradient(180deg, #eef5ff 0%, #e4efff 100%);
  color: #20407a;
  border-radius: 14px;
  min-height: 46px;
  padding: 0.8rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 0.9rem;
  font-weight: 700;
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

.metric-tag-contract {
  background: #f4eefc;
  border-color: #ddd0f3;
  color: #7550b2;
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

.calendar-card {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #e4ecf8;
  border-radius: 24px;
  background: linear-gradient(180deg, #fcfdff 0%, #f7faff 100%);
}

.calendar-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.9rem;
}

.calendar-card-head h3 {
  margin: 0;
  color: #223658;
  font-size: 1.15rem;
  font-weight: 900;
  text-transform: capitalize;
}

.calendar-card-copy {
  margin: 0.3rem 0 0;
  color: #6f7c92;
  font-size: 0.8rem;
  max-width: 620px;
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.calendar-nav-btn {
  height: 38px;
  min-width: 38px;
  padding: 0 0.9rem;
  border-radius: 12px;
  border: 1px solid #d6e0f0;
  background: #fff;
  color: #29477f;
  font-size: 0.8rem;
  font-weight: 800;
}

.calendar-weekdays,
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.45rem;
}

.calendar-weekdays {
  margin-bottom: 0.45rem;
}

.calendar-weekdays span {
  text-align: center;
  color: #7a8599;
  font-size: 0.69rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.calendar-day {
  min-height: 74px;
  padding: 0.65rem 0.5rem;
  border-radius: 16px;
  border: 1px solid #dfe7f2;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  color: #223658;
}

.calendar-day-muted {
  opacity: 0.45;
}

.calendar-day-today {
  border-color: #f3c15b;
  box-shadow: inset 0 0 0 1px rgba(243, 193, 91, 0.35);
}

.calendar-day-selected {
  border-color: #2a63d7;
  background: linear-gradient(180deg, #edf4ff 0%, #f7faff 100%);
  box-shadow: 0 12px 28px rgba(42, 99, 215, 0.15);
}

.calendar-day-has-upload {
  border-color: #42a45b;
}

.calendar-day-complete {
  border-color: #2f9e44;
  background: linear-gradient(180deg, #f0fbf3 0%, #ffffff 100%);
  box-shadow: 0 12px 28px rgba(47, 158, 68, 0.12);
}

.calendar-day-number {
  font-size: 0.96rem;
  font-weight: 900;
}

.calendar-day-flags {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
}

.calendar-day-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem 0.45rem;
  border-radius: 999px;
  background: #ecf7ef;
  color: #2c8f46;
  font-size: 0.66rem;
  font-weight: 800;
}

.calendar-day-badge-success {
  background: #2f9e44;
  color: #fff;
  box-shadow: 0 10px 18px rgba(47, 158, 68, 0.22);
}

.calendar-card-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 0.95rem;
}

.calendar-selection-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.5rem 0.75rem;
  border-radius: 999px;
  border: 1px solid #d9e4f6;
  background: #f7faff;
  color: #36517e;
  font-size: 0.74rem;
  font-weight: 700;
}

.calendar-selection-pill-warning {
  border-color: #f5d58e;
  background: #fff8ea;
  color: #b07403;
}

.calendar-selection-pill-success {
  border-color: #cbe9d3;
  background: #ecf7ef;
  color: #2a8c46;
}

.calendar-selection-pill-danger {
  border-color: #f1b0b0;
  background: #ffeded;
  color: #df3a3a;
}

.calendar-selection-pill-neutral {
  border-color: #d9e4f6;
  background: #f7faff;
  color: #36517e;
}

.metric-tag-success {
  background: #ecf7ef;
  border-color: #cbe9d3;
  color: #2a8c46;
}

.conciliation-modal-card {
  width: min(860px, 100%);
}

.conciliation-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.7rem;
  margin: 0.95rem 0 1rem;
}

.conciliation-summary-card {
  padding: 0.85rem 0.9rem;
  border: 1px solid #e7edf6;
  border-radius: 16px;
  background: linear-gradient(180deg, #fcfdff 0%, #f7faff 100%);
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.conciliation-summary-card span {
  color: #7c8aa4;
  font-size: 0.69rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.conciliation-summary-card strong {
  color: #223658;
  font-size: 1rem;
  font-weight: 900;
}

.conciliation-form-card {
  padding: 0.95rem;
  border: 1px solid #e7edf6;
  border-radius: 18px;
  background: #fbfcff;
}

.conciliation-detail-card {
  margin-bottom: 0;
  padding: 1.1rem;
  background: linear-gradient(180deg, #fdfefe 0%, #f7fbff 100%);
}

.conciliation-content-grid {
  display: grid;
  grid-template-columns: minmax(380px, 0.95fr) minmax(460px, 1.25fr);
  gap: 1rem;
  align-items: start;
}

.conciliation-panel-card {
  min-height: 100%;
  order: 2;
}

.conciliation-side-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  order: 1;
}

.conciliation-upload-card,
.conciliation-receipts-panel {
  padding: 1.1rem;
  background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
}

.conciliation-entry-mode {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem;
  margin-bottom: 0.95rem;
  border: 1px solid #e3eaf7;
  border-radius: 999px;
  background: #f7faff;
}

.conciliation-entry-mode-btn {
  border: 0;
  background: transparent;
  color: #5f7293;
  border-radius: 999px;
  padding: 0.6rem 1rem;
  font-size: 0.82rem;
  font-weight: 800;
  transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

.conciliation-entry-mode-btn-active {
  background: #ffffff;
  color: #18386b;
  box-shadow: 0 8px 18px rgba(32, 64, 122, 0.12);
}

.conciliation-detail-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.85rem;
  margin-bottom: 0.85rem;
}

.conciliation-detail-head h4 {
  margin: 0;
  color: #223658;
  font-size: 1rem;
  font-weight: 900;
}

.conciliation-detail-head-form {
  margin-bottom: 0.9rem;
}

.conciliation-cta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
  flex-wrap: wrap;
  margin-top: 0.25rem;
}

.conciliation-primary-cta {
  width: auto;
  min-width: min(100%, 360px);
}

.conciliation-qr-panel {
  margin-top: 0.95rem;
  padding: 1rem 1.05rem;
  border: 1px dashed #d6e2f4;
  border-radius: 18px;
  background: linear-gradient(180deg, #fbfdff 0%, #ffffff 100%);
}

.conciliation-qr-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.conciliation-qr-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.7rem;
  margin-top: 0.75rem;
}

.conciliation-qr-chip {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.7rem 0.8rem;
  border-radius: 14px;
  border: 1px solid #e1e9f6;
  background: #f7faff;
}

.conciliation-qr-chip span {
  color: #6d7f9d;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.conciliation-qr-chip strong {
  color: #173163;
  font-size: 0.92rem;
  font-weight: 800;
  word-break: break-word;
}

.conciliation-qr-chip-wide {
  grid-column: span 3;
}

.sr-only-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.conciliation-scanner-card {
  margin-bottom: 0.95rem;
  padding: 0.95rem;
  border: 1px solid #e4ebf7;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
}

.conciliation-scanner-head {
  margin-bottom: 0.8rem;
}

.conciliation-scanner-head h4 {
  margin: 0;
  color: #223658;
  font-size: 1rem;
  font-weight: 900;
}

.conciliation-scanner-toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: center;
}

.conciliation-scanner-copy {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.conciliation-scanner-copy strong {
  color: #223658;
  font-size: 0.92rem;
  font-weight: 800;
}

.conciliation-scanner-copy p {
  margin: 0;
  color: #6d7f9d;
  font-size: 0.84rem;
  line-height: 1.45;
}

.conciliation-scanner-actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.conciliation-scanner-stage {
  margin-top: 0.9rem;
}

.conciliation-scanner-preview {
  position: relative;
  min-height: 320px;
  border: 1px solid #dbe6f5;
  border-radius: 16px;
  background: #f8fbff;
  overflow: hidden;
  cursor: crosshair;
}

.conciliation-scanner-media {
  display: block;
  width: 100%;
  max-height: 460px;
  object-fit: contain;
  background: #fff;
}

.conciliation-scanner-crop {
  position: absolute;
  border: 2px solid #f3be2f;
  background: rgba(255, 214, 79, 0.16);
  box-shadow: 0 0 0 9999px rgba(11, 23, 48, 0.18);
  pointer-events: none;
  border-radius: 10px;
}

.conciliation-scanner-empty {
  min-height: 320px;
  border: 1px dashed #d7e2f4;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: #fcfdff;
  color: #5d7190;
  text-align: center;
}

.conciliation-scanner-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  flex-wrap: wrap;
  margin-top: 0.85rem;
}

.conciliation-form-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
}

.toolbar-field-file input[type="file"] {
  padding-top: 0.7rem;
}

.toolbar-field-wide {
  grid-column: span 3;
}

.conciliation-form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.9rem;
}

.conciliation-autofill-panel {
  border-style: solid;
  background: linear-gradient(180deg, #fffdf8 0%, #ffffff 100%);
}

.conciliation-manual-card {
  margin-bottom: 1rem;
  padding: 1rem 1.05rem;
  border: 1px solid #e4ebf7;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
}

.conciliation-manual-file {
  margin-top: 0.85rem;
}

.conciliation-autofill-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.7rem;
  margin-top: 0.8rem;
}

.conciliation-receipts-list {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  margin-top: 1rem;
  overflow-y: auto;
  max-height: min(42vh, 360px);
  padding-right: 0.15rem;
}

.conciliation-receipt-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.9rem;
  padding: 0.9rem;
  border: 1px solid #e7edf6;
  border-radius: 16px;
  background: #fff;
}

.conciliation-receipt-main {
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
}

.conciliation-receipt-main strong {
  color: #223658;
  font-size: 0.95rem;
  font-weight: 900;
}

.conciliation-receipt-main small {
  color: #6f7c92;
  font-size: 0.74rem;
  line-height: 1.38;
}

.conciliation-receipt-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 136px;
}

.action-secondary-btn,
.action-danger-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.42rem;
  min-height: 34px;
  padding: 0.55rem 0.8rem;
  border-radius: 12px;
  border: 1px solid transparent;
  font-size: 0.74rem;
  font-weight: 800;
}

.action-secondary-btn {
  background: #f5f9ff;
  border-color: #cadbfd;
  color: #2a63d7;
}

.action-danger-btn {
  background: #ffeded;
  border-color: #f1b0b0;
  color: #df3a3a;
}

@media (max-width: 1400px) {
  .conciliation-content-grid {
    grid-template-columns: 1fr;
  }

  .summary-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1100px) {
  .toolbar-grid,
  .progress-panel {
    grid-template-columns: 1fr;
  }

  .toolbar-actions {
    grid-template-columns: 1fr;
  }

  .conciliation-hero-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .conciliation-summary-grid,
  .conciliation-form-grid,
  .conciliation-autofill-grid,
  .conciliation-qr-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .toolbar-field-wide,
  .conciliation-qr-chip-wide {
    grid-column: span 2;
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

  .calendar-card-head,
  .conciliation-receipt-card {
    flex-direction: column;
  }

  .conciliation-scanner-toolbar,
  .conciliation-scanner-footer {
    grid-template-columns: 1fr;
    flex-direction: column;
    align-items: stretch;
  }

  .conciliation-entry-mode {
    width: 100%;
    justify-content: stretch;
  }

  .conciliation-entry-mode-btn {
    flex: 1 1 0;
    text-align: center;
  }

  .conciliation-receipt-actions {
    width: 100%;
    min-width: 0;
  }
}

@media (max-width: 640px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .hero-copy h1 {
    font-size: 1.65rem;
  }

  .calendar-weekdays,
  .calendar-grid,
  .conciliation-summary-grid,
  .conciliation-form-grid,
  .conciliation-autofill-grid,
  .conciliation-qr-grid {
    grid-template-columns: 1fr;
  }

  .toolbar-field-wide,
  .conciliation-qr-chip-wide {
    grid-column: span 1;
  }
}
</style>

