<template>
  <div>
    <JcLoader :load="load" />
    <AdminTemplate :page="page" :modulo="modulo">
      <div slot="body" class="closure-page">
        <div class="closure-shell">
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
                <button type="button" class="toolbar-export-btn" @click="downloadResumenPdf">
                  <i class="fas fa-file-pdf"></i>
                  <span>Exportar PDF</span>
                </button>
              </div>
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
                    <span>Sucursales del dia</span>
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
                        <th>Accion</th>
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
                              <small>Sucursal {{ item.codigoSucursalLabel }} Â· Punto {{ item.puntoVentaLabel }}</small>
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
                                v-if="item.totalQrPagadoPendienteFactura > 0"
                                class="metric-tag metric-tag-warning"
                              >
                                QR s/f {{ formatCurrency(item.totalQrPagadoPendienteFactura) }}
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
                              @click="openConciliationModal(item)"
                            >
                              <i class="far fa-calendar-check"></i>
                              <span>{{ item.conciliacion.totalComprobantes > 0 ? 'Conciliacion' : 'Conciliar sucursal' }}</span>
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
                  <small>{{ incident.code }}<span v-if="incident.tracking"> Â· {{ incident.tracking }}</span></small>
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

        <div v-if="activeConciliationModal" class="detail-modal-backdrop" @click.self="closeConciliationModal">
          <div class="detail-modal-card conciliation-modal-card">
            <div class="detail-modal-head">
              <div class="users-modal-head-copy">
                <p class="detail-kicker mb-1">Conciliacion diaria</p>
                <h3>{{ activeConciliationModal.title }}</h3>
                <p class="detail-copy mb-0">{{ activeConciliationModal.subtitle }}</p>
              </div>
              <button type="button" class="detail-modal-close" @click="closeConciliationModal">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div ref="conciliationDetailPanel" class="conciliation-form-card conciliation-detail-card">
              <div class="conciliation-detail-head">
                <div>
                  <p class="detail-kicker mb-1">Resumen del dia seleccionado</p>
                  <h4>{{ formatDateLabel(activeConciliationModal.selectedDate) }}</h4>
                  <p class="detail-copy mb-0">Al tocar una fecha, aqui se actualizan el estado, los comprobantes y la carga del dia elegido.</p>
                </div>
                <span class="calendar-selection-pill" :class="conciliacionStatusPillClass(activeConciliationModal.conciliacion)">
                  {{ conciliacionLabel(activeConciliationModal.conciliacion) }}
                </span>
              </div>

              <div class="conciliation-summary-grid">
                <article class="conciliation-summary-card">
                  <span>Fecha activa</span>
                  <strong>{{ formatDateLabel(activeConciliationModal.selectedDate) }}</strong>
                </article>
                <article class="conciliation-summary-card">
                  <span>Efectivo esperado</span>
                  <strong>{{ formatCurrency(activeConciliationModal.conciliacion.totalEfectivoSistema) }}</strong>
                </article>
                <article class="conciliation-summary-card">
                  <span>Total comprobantes</span>
                  <strong>{{ formatCurrency(activeConciliationModal.conciliacion.totalComprobantes) }}</strong>
                </article>
                <article class="conciliation-summary-card">
                  <span>Diferencia</span>
                  <strong>{{ formatCurrency(activeConciliationModal.conciliacion.diferencia) }}</strong>
                </article>
              </div>

              <div class="conciliation-cta-row">
                <button type="button" class="toolbar-export-btn" @click="triggerConciliationFilePicker">
                  <i class="fas fa-upload"></i>
                  <span>Agregar comprobante de {{ formatDateLabel(activeConciliationModal.selectedDate) }}</span>
                </button>
                <span class="detail-copy mb-0">
                  {{ activeConciliationModal.comprobantes.length
                    ? `${activeConciliationModal.comprobantes.length} comprobante(s) registrados para esta fecha.`
                    : 'Todavia no hay comprobantes cargados para esta fecha.' }}
                </span>
              </div>
            </div>

            <section class="calendar-card calendar-card-modal">
              <div class="calendar-card-head">
                <div>
                  <p class="detail-kicker mb-1">Calendario de conciliacion</p>
                  <h3>{{ activeConciliationCalendarLabel }}</h3>
                  <p class="calendar-card-copy">Seleccione el dia del comprobante para esta regional. El panel se actualiza solo para la fecha elegida.</p>
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

            <div ref="conciliationUploadPanel" class="conciliation-form-card">
              <div class="conciliation-detail-head conciliation-detail-head-form">
                <div>
                  <p class="detail-kicker mb-1">Carga del comprobante</p>
                  <h4>Comprobante para {{ formatDateLabel(activeConciliationModal.selectedDate) }}</h4>
                  <p class="detail-copy mb-0">
                    Suba una foto del comprobante. Si el QR es legible, intentaremos completar monto, banco y referencia automaticamente.
                  </p>
                </div>
              </div>
              <div class="conciliation-scanner-card">
                <div class="conciliation-scanner-head">
                  <div>
                    <p class="detail-kicker mb-1">Escanear QR del comprobante</p>
                    <h4>Vista asistida</h4>
                  </div>
                </div>

                <div class="conciliation-scanner-toolbar">
                  <label class="toolbar-field">
                    <span>Camaras disponibles</span>
                    <select v-model="activeConciliationModal.qrScanner.selectedDeviceId" :disabled="activeConciliationModal.qrScanner.loadingDevices || !activeConciliationModal.qrScanner.cameras.length">
                      <option value="">
                        {{ activeConciliationModal.qrScanner.loadingDevices ? 'Detectando camaras...' : 'No se detectaron camaras' }}
                      </option>
                      <option v-for="camera in activeConciliationModal.qrScanner.cameras" :key="camera.deviceId" :value="camera.deviceId">
                        {{ camera.label || 'Camara disponible' }}
                      </option>
                    </select>
                  </label>

                  <div class="conciliation-scanner-actions">
                    <button type="button" class="action-btn action-btn-warning" @click="activateConciliationCamera">
                      <i class="fas fa-camera"></i>
                      <span>Activar camara</span>
                    </button>
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
                    @click="handleConciliationQrStageClick"
                  >
                    <video
                      v-if="activeConciliationModal.qrScanner.mode === 'camera'"
                      ref="conciliationQrVideo"
                      autoplay
                      playsinline
                      muted
                      class="conciliation-scanner-media"
                    ></video>
                    <img
                      v-else-if="activeConciliationModal.qrScanner.previewUrl"
                      ref="conciliationQrImage"
                      :src="activeConciliationModal.qrScanner.previewUrl"
                      alt="Comprobante seleccionado"
                      class="conciliation-scanner-media"
                    />
                    <div class="conciliation-scanner-crop" :style="activeConciliationQrCropStyle"></div>
                  </div>
                  <div v-else class="conciliation-scanner-empty">
                    <p>Pulsa "Activar camara" o selecciona una imagen.</p>
                  </div>
                </div>

                <div v-if="activeConciliationQrHasSource" class="conciliation-scanner-footer">
                  <p class="detail-copy mb-0">Marca solo el QR y procesa el recorte.</p>
                  <div class="conciliation-scanner-actions">
                    <button type="button" class="action-btn action-btn-warning" @click="processConciliationQrCrop">
                      <i class="fas fa-crop-alt"></i>
                      <span>Procesar recorte</span>
                    </button>
                    <button type="button" class="action-btn action-btn-primary" @click="processConciliationQrFullSource">
                      <i class="fas fa-expand"></i>
                      <span>Imagen completa</span>
                    </button>
                    <button type="button" class="action-btn action-btn-danger" @click="resetConciliationQrSource">
                      <i class="fas fa-times"></i>
                      <span>Cancelar</span>
                    </button>
                  </div>
                </div>

                <p class="detail-copy mb-0">{{ activeConciliationModal.qrScanner.statusMessage }}</p>
              </div>
              <div class="conciliation-form-grid">
                <label class="toolbar-field">
                  <span>Monto depositado</span>
                  <input ref="conciliationAmountInput" v-model="activeConciliationModal.form.montoDepositado" type="number" min="0" step="0.01" placeholder="0.00" />
                </label>
                <label class="toolbar-field">
                  <span>Banco</span>
                  <input v-model.trim="activeConciliationModal.form.banco" type="text" placeholder="Banco / entidad" />
                </label>
                <label class="toolbar-field">
                  <span>Referencia</span>
                  <input v-model.trim="activeConciliationModal.form.referencia" type="text" placeholder="Nro. operacion" />
                </label>
                <label class="toolbar-field toolbar-field-file">
                  <span>Comprobante</span>
                  <input ref="conciliationFileInput" type="file" accept=".jpg,.jpeg,.png,.pdf,.webp" @change="onConciliationFileChange" />
                </label>
                <label class="toolbar-field toolbar-field-wide">
                  <span>Observacion</span>
                  <textarea v-model.trim="activeConciliationModal.form.observacion" rows="3" placeholder="Detalle del deposito o nota de control"></textarea>
                </label>
              </div>
              <div v-if="activeConciliationModal.qrScan && activeConciliationModal.qrScan.status !== 'idle'" class="conciliation-qr-panel">
                <div class="conciliation-qr-head">
                  <strong>Lectura del QR del comprobante</strong>
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
                  <div v-if="activeConciliationModal.qrScan.parsed.bank" class="conciliation-qr-chip">
                    <span>Agencia / entidad</span>
                    <strong>{{ activeConciliationModal.qrScan.parsed.bank }}</strong>
                  </div>
                  <div v-if="activeConciliationModal.qrScan.parsed.transaction" class="conciliation-qr-chip">
                    <span>Transaccion</span>
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
              <div class="conciliation-form-actions">
                <span v-if="activeConciliationModal.selectedFileName" class="calendar-selection-pill">
                  Archivo: <strong>{{ activeConciliationModal.selectedFileName }}</strong>
                </span>
                <button type="button" class="toolbar-export-btn" @click="submitConciliationReceipt">
                  <i class="fas fa-upload"></i>
                  <span>Guardar comprobante</span>
                </button>
              </div>
            </div>

            <div v-if="activeConciliationModal.loading" class="empty-state users-modal-empty">
              <h3>Cargando conciliacion</h3>
              <p>Estamos consultando los comprobantes registrados para esta fecha.</p>
            </div>

            <div v-else-if="activeConciliationModal.comprobantes.length" class="conciliation-receipts-list">
              <article v-for="receipt in activeConciliationModal.comprobantes" :key="receipt.id" class="conciliation-receipt-card">
                <div class="conciliation-receipt-main">
                  <strong>{{ formatCurrency(receipt.montoDepositado) }}</strong>
                  <small>{{ formatDateLabel(receipt.fechaDeposito) }}</small>
                  <small>{{ receipt.banco || 'Sin banco' }}<span v-if="receipt.referencia"> · {{ receipt.referencia }}</span></small>
                  <small>{{ receipt.observacion || 'Sin observacion' }}</small>
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
    </AdminTemplate>
  </div>
</template>

<script>
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import jsQR from 'jsqr';

export default {
  data() {
    return {
      load: false,
      page: 'Reportes',
      modulo: 'Kardex',
      error: '',
      isSyncingFilters: false,
      searchTimer: null,
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
      return Boolean(scanner?.previewUrl || scanner?.mode === 'camera');
    },
    activeConciliationQrCropStyle() {
      const crop = this.activeConciliationModal?.qrScanner?.crop || { x: 0.2, y: 0.2, w: 0.55, h: 0.4 };
      return {
        left: `${crop.x * 100}%`,
        top: `${crop.y * 100}%`,
        width: `${crop.w * 100}%`,
        height: `${crop.h * 100}%`
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
        return 'Priorice la revision de sucursales con ventas observadas.';
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
  },
  beforeDestroy() {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    this.stopConciliationCameraStream();
  },
  watch: {
    startDate() {
      this.initializeCalendarAnchor();
      this.scheduleLoadReport();
    },
    endDate() {
      this.initializeCalendarAnchor();
      this.scheduleLoadReport();
    },
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
    initializeDateRange() {
      const today = this.defaultToday();
      this.endDate = today;
      this.startDate = today;
    },
    initializeCalendarAnchor() {
      this.calendarAnchorMonth = this.startOfMonth(this.selectedConciliationDate || this.defaultToday());
    },
    branchKey(codigoSucursal, puntoVenta) {
      const codigo = String(codigoSucursal ?? '0').padStart(3, '0');
      const punto = String(puntoVenta ?? '0');
      return `${codigo}-${punto}`;
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
        previewUrl: '',
        previewFileName: '',
        statusMessage: 'Pulsa "Activar camara" o selecciona una imagen.',
        crop: {
          x: 0.18,
          y: 0.28,
          w: 0.56,
          h: 0.34
        },
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
              statusMessage: 'Este navegador no permite detectar camaras. Use la opcion de imagen.'
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
            statusMessage: cameras.length
              ? 'Seleccione una imagen o active la camara para ubicar el QR.'
              : 'No se detectaron camaras. Puede continuar con una imagen.'
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
            statusMessage: 'No se pudieron consultar las camaras del dispositivo. Use la opcion de imagen.'
          }
        };
      }
    },
    triggerConciliationFilePicker() {
      this.scrollConciliationUploadIntoView();
      this.$nextTick(() => {
        const ref = this.$refs?.conciliationFileInput;
        const input = Array.isArray(ref) ? ref[0] : ref;
        if (input && typeof input.click === 'function') {
          input.click();
        }
      });
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
              ? 'Marca solo el QR y procesa el recorte.'
              : 'Pulsa "Activar camara" o selecciona una imagen.'
          }
        };
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
            stream,
            previewUrl: '',
            statusMessage: 'Camara activa. Toque la vista para centrar el recorte sobre el QR.'
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
            statusMessage: 'No se detecto ninguna camara. Verifica permisos del navegador o usa la opcion de imagen.'
          }
        };
      }
    },
    async onConciliationScannerImageChange(event) {
      const file = event?.target?.files?.[0] || null;
      if (!file || !this.activeConciliationModal) {
        return;
      }

      this.stopConciliationCameraStream();

      const previewUrl = await this.readFileAsDataUrl(file);
      if (!this.activeConciliationModal) {
        return;
      }

      this.activeConciliationModal = {
        ...this.activeConciliationModal,
        selectedFile: file,
        selectedFileName: file.name || '',
        qrScanner: {
          ...this.activeConciliationModal.qrScanner,
          mode: 'image',
          previewUrl,
          previewFileName: file.name || '',
          statusMessage: 'Marca solo el QR y procesa el recorte.'
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
    handleConciliationQrStageClick(event) {
      if (!this.activeConciliationModal?.qrScanner) {
        return;
      }

      const stage = event?.currentTarget;
      if (!stage?.getBoundingClientRect) {
        return;
      }

      const rect = stage.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const currentCrop = this.activeConciliationModal.qrScanner.crop || { x: 0.18, y: 0.28, w: 0.56, h: 0.34 };
      const nextCrop = {
        ...currentCrop,
        x: Math.min(Math.max(0, x - (currentCrop.w / 2)), 1 - currentCrop.w),
        y: Math.min(Math.max(0, y - (currentCrop.h / 2)), 1 - currentCrop.h)
      };

      this.activeConciliationModal = {
        ...this.activeConciliationModal,
        qrScanner: {
          ...this.activeConciliationModal.qrScanner,
          crop: nextCrop,
          statusMessage: 'Recorte ajustado. Procese el recorte cuando el QR quede dentro del marco.'
        }
      };
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

      const bitmap = await createImageBitmap(file);

      try {
        const nativeResult = await this.decodeQrFromBitmapWithNativeDetector(bitmap);
        if (nativeResult) {
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
        return this.decodeQrFromCanvasWithJsQr(fallbackCanvas);
      } finally {
        if (bitmap && typeof bitmap.close === 'function') {
          bitmap.close();
        }
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
    async decodeQrFromCanvas(canvas) {
      if (!process.client || typeof window === 'undefined' || !canvas) {
        return null;
      }

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

      return this.decodeQrFromCanvasWithJsQr(canvas);
    },
    decodeQrFromCanvasWithJsQr(canvas) {
      if (!canvas) {
        return null;
      }

      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) {
        return null;
      }

      const scanAtScale = (scale = 1) => {
        let workingCanvas = canvas;
        if (scale !== 1) {
          workingCanvas = document.createElement('canvas');
          workingCanvas.width = Math.max(1, Math.round(canvas.width * scale));
          workingCanvas.height = Math.max(1, Math.round(canvas.height * scale));
          const workingCtx = workingCanvas.getContext('2d', { willReadFrequently: true });
          if (!workingCtx) {
            return null;
          }
          workingCtx.drawImage(canvas, 0, 0, workingCanvas.width, workingCanvas.height);
        }

        const workingCtx = workingCanvas.getContext('2d', { willReadFrequently: true });
        if (!workingCtx) {
          return null;
        }

        const imageData = workingCtx.getImageData(0, 0, workingCanvas.width, workingCanvas.height);
        const result = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth'
        });
        return result?.data ? String(result.data) : null;
      };

      const scales = [1, 1.5, 2, 2.5, 3];
      for (const scale of scales) {
        const value = scanAtScale(scale);
        if (value) {
          return value;
        }
      }

      return null;
    },
    buildConciliationQrCanvas({ cropped = false } = {}) {
      const scanner = this.activeConciliationModal?.qrScanner;
      if (!scanner) {
        return null;
      }

      let source = null;
      if (scanner.mode === 'camera') {
        const ref = this.$refs?.conciliationQrVideo;
        source = Array.isArray(ref) ? ref[0] : ref;
      } else if (scanner.previewUrl) {
        const ref = this.$refs?.conciliationQrImage;
        source = Array.isArray(ref) ? ref[0] : ref;
      }

      if (!source) {
        return null;
      }

      const naturalWidth = source.videoWidth || source.naturalWidth || source.clientWidth || 0;
      const naturalHeight = source.videoHeight || source.naturalHeight || source.clientHeight || 0;
      if (!naturalWidth || !naturalHeight) {
        return null;
      }

      const crop = scanner.crop || { x: 0.18, y: 0.28, w: 0.56, h: 0.34 };
      const sx = cropped ? Math.round(naturalWidth * crop.x) : 0;
      const sy = cropped ? Math.round(naturalHeight * crop.y) : 0;
      const sw = cropped ? Math.round(naturalWidth * crop.w) : naturalWidth;
      const sh = cropped ? Math.round(naturalHeight * crop.h) : naturalHeight;

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
        if (parsed.reference) {
          nextForm.referencia = parsed.reference;
        }

        const observationParts = [
          parsed.transaction ? `Transaccion: ${parsed.transaction}` : '',
          parsed.date ? `Fecha: ${parsed.date}` : '',
          parsed.depositante ? `Depositante: ${parsed.depositante}` : '',
          parsed.beneficiario ? `Beneficiario: ${parsed.beneficiario}` : '',
          parsed.user ? `Usuario: ${parsed.user}` : ''
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
    async processConciliationQrCrop() {
      if (!this.activeConciliationModal?.qrScanner) {
        return;
      }

      this.activeConciliationModal = {
        ...this.activeConciliationModal,
        qrScanner: {
          ...this.activeConciliationModal.qrScanner,
          statusMessage: 'Procesando el recorte del QR...'
        }
      };

      const canvas = this.buildConciliationQrCanvas({ cropped: true });
      const rawText = canvas ? await this.decodeQrFromCanvas(canvas) : null;
      const ok = await this.applyConciliationQrRawText(rawText, 'QR detectado desde el recorte. Revise los datos autocompletados antes de guardar.');

      if (this.activeConciliationModal?.qrScanner) {
        this.activeConciliationModal = {
          ...this.activeConciliationModal,
          qrScanner: {
            ...this.activeConciliationModal.qrScanner,
            statusMessage: ok
              ? 'Recorte procesado correctamente.'
              : 'No se pudo leer el recorte. Ajuste el marco sobre el QR o pruebe con imagen completa.'
          }
        };
      }
    },
    async processConciliationQrFullSource() {
      if (!this.activeConciliationModal?.qrScanner) {
        return;
      }

      this.activeConciliationModal = {
        ...this.activeConciliationModal,
        qrScanner: {
          ...this.activeConciliationModal.qrScanner,
          statusMessage: 'Procesando la imagen completa...'
        }
      };

      const canvas = this.buildConciliationQrCanvas({ cropped: false });
      const rawText = canvas ? await this.decodeQrFromCanvas(canvas) : null;
      const ok = await this.applyConciliationQrRawText(rawText, 'QR detectado desde la imagen completa. Revise los datos autocompletados antes de guardar.');

      if (this.activeConciliationModal?.qrScanner) {
        this.activeConciliationModal = {
          ...this.activeConciliationModal,
          qrScanner: {
            ...this.activeConciliationModal.qrScanner,
            statusMessage: ok
              ? 'Imagen completa procesada correctamente.'
              : 'No se pudo leer la imagen completa. Ajuste el recorte sobre el QR.'
          }
        };
      }
    },
    resetConciliationQrSource() {
      this.stopConciliationCameraStream();
      if (!this.activeConciliationModal?.qrScanner) {
        return;
      }

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

        if (!isBancoUnion || !process.client || typeof window === 'undefined' || typeof window.fetch !== 'function') {
          return {
            ...parsed,
            reference: fallbackReference || String(url.searchParams.get('parametro') || '').trim()
          };
        }

        const response = await window.fetch(targetUrl, {
          method: 'GET',
          mode: 'cors',
          credentials: 'omit'
        });

        if (!response.ok) {
          return {
            ...parsed,
            reference: fallbackReference || String(url.searchParams.get('parametro') || '').trim()
          };
        }

        const html = await response.text();
        const enriched = this.parseBankReceiptHtml(html, fallbackReference || targetUrl);

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
        parsed.transaction ? `<div><strong>Transaccion:</strong> ${parsed.transaction}</div>` : '',
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
    async loadConciliacionesSummary() {
      try {
        const fecha = this.activeConciliationModal?.selectedDate || this.selectedConciliationDate || this.defaultToday();
        const response = await this.$admin.$get(`caja/conciliaciones?fecha=${encodeURIComponent(fecha)}`);
        this.conciliacionSummaryRows = Array.isArray(response?.conciliaciones)
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
        this.conciliacionSummaryRows = [];
      }
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
        totalCartRechazadoDescartado: 0
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
      if (this.isAnuladaVenta(venta) || this.isQrPaymentVenta(venta)) {
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

      if (this.isQrPaymentVenta(venta)) {
        return String(venta?.estado_pago || '').trim().toLowerCase() === 'pagado';
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
    isServicioContratoVenta(venta) {
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
          || value.includes('contratos')
          || value.includes('contrato')
        ));
      });
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

      return descripciones.length ? descripciones.join(', ') : 'Servicio Contratos';
    },
    calculateBranchTotalsFromVentas(ventas = []) {
      return ventas.reduce((acc, venta) => {
        if (this.isServiceVenta(venta) || this.isServicioContratoVenta(venta)) {
          return acc;
        }

        const total = Number(venta?.total || 0);
        if (this.countsTowardCollectedTotal(venta)) {
          acc.totalVendido += total;
        }
        if (this.countsTowardCollectedQrTotal(venta)) {
          acc.totalQrFacturado += total;
        }
        if (this.countsTowardPendingFacturaQrTotal(venta)) {
          acc.totalQrPagadoPendienteFactura += total;
        }
        if (this.countsTowardCashTotal(venta)) {
          acc.totalEfectivoFacturado += total;
        }

        return acc;
      }, {
        totalVendido: 0,
        totalQrFacturado: 0,
        totalQrPagadoPendienteFactura: 0,
        totalEfectivoFacturado: 0
      });
    },
    async refreshBranchTotalsFromVentas() {
      const sourceRows = Array.isArray(this.report?.sucursales) ? this.report.sucursales : [];
      if (!sourceRows.length) {
        this.branchTotalsByBranch = {};
        return;
      }

      const adjustments = await Promise.all(sourceRows.map(async (branch) => {
        try {
          const ventas = await this.fetchBranchVentas(branch);
          const totals = this.calculateBranchTotalsFromVentas(ventas);
          return {
            key: this.branchKey(branch?.codigoSucursal, branch?.puntoVenta),
            totals
          };
        } catch (error) {
          return null;
        }
      }));

      this.branchTotalsByBranch = adjustments
        .filter(Boolean)
        .reduce((acc, item) => {
          acc[item.key] = item.totals;
          return acc;
        }, {});
    },
    cachedUserCount(codigoSucursal, puntoVenta) {
      const key = this.branchKey(codigoSucursal, puntoVenta);
      return Number(this.userCountsByBranch[key] || 0);
    },
    async ensureBranchUserCounts() {
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

        this.userCountsByBranch = nextCounts;
      } catch (error) {
        console.error('[ventas/lista] ensureBranchUserCounts:error', {
          status: error?.response?.status || null,
          data: error?.response?.data || null,
          message: error?.message || null
        });
      }
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
    async fetchBranchVentas(branch) {
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
      return Array.isArray(response) ? response : [];
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
      const totalQrPagadoPendienteFactura = Number(branchTotals?.totalQrPagadoPendienteFactura ?? (item?.totalQrPagadoPendienteFactura || 0));
      const cantidadVentas = Number(item?.cantidadVentas || 0);
      const pendientes = Number(item?.pendientes || 0);
      const observadas = Number(item?.observadas || 0);
      const qrPagadoPendienteFactura = Number(item?.qrPagadoPendienteFactura || 0);
      const qrCancelado = Number(item?.qrCancelado || 0);
      const qrPendiente = Number(item?.qrPendiente || 0);
      const ventasFacturadasNetas = Math.max(0, cantidadVentas - Number(item?.oficiales || 0));
      const ventasOperativas = ventasFacturadasNetas + qrPagadoPendienteFactura + qrPendiente;
      const totalCobrado = Number(branchTotals?.totalVendido ?? (totalQrFacturado + totalEfectivoFacturado + totalQrPagadoPendienteFactura));
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
        totalQrPagadoPendienteFactura,
        facturadas: Number(item?.facturadas || 0),
        qrFacturadas: Number(item?.qrFacturadas || 0),
        electronicasFacturadas: Number(item?.electronicasFacturadas || 0),
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
      this.load = true;
      this.error = '';

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

        this.report = {
          resumen: response && response.resumen ? response.resumen : this.report.resumen,
          sucursales: response && response.sucursales ? response.sucursales : []
        };
        await Promise.all([
          this.refreshBranchTotalsFromVentas(),
          this.ensureBranchUserCounts(),
          this.loadConciliacionesSummary()
        ]);
      } catch (err) {
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
        this.load = false;
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
      this.stopConciliationCameraStream();
      this.activeConciliationModal = null;
    },
    async openConciliationModal(item) {
      const selectedDate = this.endDate || this.startDate || this.defaultToday();
      const branchKey = this.branchKey(item?.codigoSucursal, item?.puntoVenta);
      this.activeConciliationModal = {
        branchKey,
        codigoSucursal: Number(item?.codigoSucursal ?? 0),
        puntoVenta: Number(item?.puntoVenta ?? 0),
        fecha: selectedDate,
        selectedDate,
        calendarAnchorMonth: this.startOfMonth(selectedDate),
        title: item.displayName || item.departamento || item.nombre || 'Sucursal',
        subtitle: `Sucursal ${String(item?.codigoSucursal ?? 0).padStart(3, '0')} · Punto ${item?.puntoVenta ?? 0}`,
        conciliacion: item.conciliacion || this.emptyConciliacion(item),
        comprobantes: [],
        loading: true,
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
          referencia: '',
          observacion: ''
        }
      };

      this.loadConciliationCameraDevices();
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
          title: 'No se pudo abrir la conciliacion',
          text: error?.response?.data?.message || 'No fue posible consultar los comprobantes de la fecha seleccionada.'
        });
      }
    },
    async onConciliationFileChange(event) {
      const file = event?.target?.files?.[0] || null;
      if (!this.activeConciliationModal) {
        return;
      }

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
        return;
      }

      const mimeType = String(file.type || '').toLowerCase();
      const isImage = mimeType.startsWith('image/');

      if (!isImage) {
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
        const previewUrl = await this.readFileAsDataUrl(file);
        if (this.activeConciliationModal?.qrScanner) {
          this.stopConciliationCameraStream();
          this.activeConciliationModal = {
            ...this.activeConciliationModal,
            qrScanner: {
              ...this.activeConciliationModal.qrScanner,
              mode: 'image',
              previewUrl,
              previewFileName: file?.name || '',
              statusMessage: 'Imagen cargada. Puede procesar la imagen completa o ajustar el recorte sobre el QR.'
            }
          };
        }
      } catch (error) {
        // preview is optional
      }

      this.activeConciliationModal = {
        ...this.activeConciliationModal,
        qrScan: {
          status: 'loading',
          message: 'Leyendo el QR del comprobante para completar los datos...',
          rawText: '',
          parsed: null
        }
      };

      try {
        const rawText = await this.decodeQrFromImageFile(file);
        const ok = await this.applyConciliationQrRawText(rawText, 'QR detectado. Los datos fueron cargados y puede confirmarlos antes de guardar.');
        if (this.activeConciliationModal?.qrScanner) {
          this.activeConciliationModal = {
            ...this.activeConciliationModal,
            qrScanner: {
              ...this.activeConciliationModal.qrScanner,
              statusMessage: ok
                ? 'Lectura automatica completada. Si desea, puede ajustar el recorte para mejorar la precision.'
                : 'No se detecto el QR completo. Ajuste el recorte sobre la zona del QR e intente de nuevo.'
            }
          };
        }
      } catch (error) {
        console.error('[ventas/lista] onConciliationFileChange:qr:error', {
          message: error?.message || null,
          fileName: file?.name || null,
          fileType: file?.type || null
        });
        this.activeConciliationModal = {
          ...this.activeConciliationModal,
          qrScan: {
            status: 'error',
            message: 'No pudimos procesar la imagen del comprobante. Puede continuar con carga manual.',
            rawText: '',
            parsed: null
          }
        };
      }
    },
    async submitConciliationReceipt() {
      if (!this.activeConciliationModal) {
        return;
      }

      if (!this.activeConciliationModal.selectedFile) {
        this.$swal.fire({
          icon: 'warning',
          title: 'Archivo requerido',
          text: 'Seleccione un comprobante antes de guardar.'
        });
        return;
      }

      const activeBranch = this.branchRows.find((row) => this.branchKey(row?.codigoSucursal, row?.puntoVenta) === this.activeConciliationModal.branchKey);
      const formData = new FormData();
      formData.append('fecha', this.activeConciliationModal.fecha);
      formData.append('codigoSucursal', String(activeBranch?.codigoSucursal ?? this.activeConciliationModal.codigoSucursal ?? this.activeConciliationModal.conciliacion?.codigoSucursal ?? 0));
      formData.append('puntoVenta', String(activeBranch?.puntoVenta ?? this.activeConciliationModal.puntoVenta ?? this.activeConciliationModal.conciliacion?.puntoVenta ?? 0));
      formData.append('sucursalNombre', activeBranch?.displayName || activeBranch?.sucursalNombre || this.activeConciliationModal.title);
      formData.append('totalEfectivoSistema', String(activeBranch?.totalEfectivoFacturado ?? this.activeConciliationModal.conciliacion?.totalEfectivoSistema ?? 0));
      formData.append('totalQrSistema', String(activeBranch?.totalQrFacturado ?? this.activeConciliationModal.conciliacion?.totalQrSistema ?? 0));
      formData.append('totalGeneralSistema', String(activeBranch?.totalVendido ?? this.activeConciliationModal.conciliacion?.totalGeneralSistema ?? 0));
      formData.append('montoDepositado', String(this.activeConciliationModal.form.montoDepositado || 0));
      formData.append('banco', this.activeConciliationModal.form.banco || '');
      formData.append('referencia', this.activeConciliationModal.form.referencia || '');
      formData.append('observacion', this.activeConciliationModal.form.observacion || '');
      formData.append('archivo', this.activeConciliationModal.selectedFile);

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
          selectedFile: null,
          selectedFileName: '',
          form: {
            montoDepositado: '',
            banco: '',
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
        text: 'Esta accion quitara el archivo y recalculara la conciliacion del dia.',
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
        subtitle: `CÃ³d. ${item.codigoSucursal ?? 0} Â· Punto ${item.puntoVenta ?? 0}`,
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
            detalle: detalleParts.length ? detalleParts.join(' Â· ') : 'Sin detalle',
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
        subtitle: `CÃ³d. ${item.codigoSucursal ?? 0} Â· Punto ${item.puntoVenta ?? 0}`,
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
            error: source.length ? '' : 'La API no devolviÃ³ incidencias para esta sucursal.'
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
      const response = await fetch(src);
      const blob = await response.blob();

      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
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
    async downloadResumenPdf() {
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
        const contractGroups = await Promise.all(visibleBranches.map(async (branch) => {
          try {
            const ventas = await this.fetchBranchVentas(branch);
            const rows = ventas
              .filter((venta) => this.isServicioContratoVenta(venta))
              .map((venta) => ([
                this.usuarioNombreFromVenta(venta),
                this.contratoEmpresaLabel(venta),
                this.contratoDescripcionLabel(venta),
                this.formatCurrency(venta.total || 0)
              ]));

            if (!rows.length) {
              return null;
            }

            return {
              branchLabel: `${branch.displayName || '-'} (${branch.codigoSucursalLabel} / PV ${branch.puntoVentaLabel})`,
              total: ventas
                .filter((venta) => this.isServicioContratoVenta(venta))
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
            'Busqueda:',
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
            'Sucursales del dia',
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
            body: [['DETALLE DE CONTRATOS NO SUMADOS']],
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

          visibleContractGroups.forEach((group) => {
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
                'Descripcion',
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
                { content: `SUBTOTAL CONTRATOS ${String(group.branchLabel || '').toUpperCase()}`, styles: { halign: 'right', fontStyle: 'bold' } },
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
        doc.save(`control-cierre-${this.startDate || 'inicio'}-${this.endDate || 'fin'}.pdf`);
      } catch (error) {
        this.$swal.fire({
          icon: 'error',
          title: 'Exportacion no disponible',
          text: 'No se pudo generar el PDF del control de cierre.'
        });
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
  grid-template-columns: 190px 190px minmax(320px, 1fr) 220px 170px;
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
  display: flex;
  justify-content: flex-end;
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
  margin-bottom: 1rem;
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

.conciliation-qr-panel {
  margin-top: 0.95rem;
  padding: 0.95rem 1rem;
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
  grid-template-columns: minmax(240px, 1fr) auto;
  gap: 0.8rem;
  align-items: end;
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
  background: rgba(255, 214, 79, 0.14);
  box-shadow: 0 0 0 9999px rgba(9, 20, 45, 0.18);
  pointer-events: none;
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
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.toolbar-field-file input[type="file"] {
  padding-top: 0.7rem;
}

.toolbar-field-wide {
  grid-column: span 4;
}

.conciliation-form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.9rem;
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
  .summary-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1100px) {
  .toolbar-grid,
  .progress-panel {
    grid-template-columns: 1fr;
  }

  .conciliation-summary-grid,
  .conciliation-form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .toolbar-field-wide {
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
  .conciliation-qr-grid {
    grid-template-columns: 1fr;
  }

  .toolbar-field-wide {
    grid-column: span 1;
  }
}
</style>

