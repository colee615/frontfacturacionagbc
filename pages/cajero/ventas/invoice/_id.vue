<template>
   <div>
      <JcLoader :load="load"></JcLoader>
      <AdminTemplate :page="page" :modulo="modulo">
         <div slot="body" class="invoice-page">
            <div class="row justify-content-md-center">
               <div class="col-xl-9 col-lg-10 mx-auto">
                  <div class="card invoice-card mb-4">
                     <div class="card-header invoice-header">
                        <div class="invoice-header-content">
                           <div class="invoice-heading">
                              <span class="invoice-heading-icon">
                                 <i class="fas fa-file-invoice"></i>
                              </span>
                              <div>
                                 <p class="invoice-kicker mb-2">Detalle de venta</p>
                                 <h4 class="mb-1">Invoice</h4>
                                 <p class="invoice-subtitle mb-0">
                                    Venta no. <b>{{ model.id || '-' }}</b> · {{ model.fecha || 'Sin fecha' }}
                                 </p>
                              </div>
                           </div>
                           <div class="invoice-actions">
                              <button
                                 v-if="canAnular"
                                 @click="anularFactura"
                                 class="btn invoice-action-btn invoice-action-btn-danger"
                                 title="Anular factura"
                              >
                                 <i class="fas fa-ban"></i>
                                 <span>Anular factura</span>
                              </button>
                              <button @click="$router.back()" class="btn invoice-action-btn invoice-action-btn-primary">
                                 <i class="fas fa-arrow-left"></i>
                                 <span>Regresar</span>
                              </button>
                           </div>
                        </div>
                     </div>
                     <div class="card-body invoice-body">
                        <div class="invoice-status-card mb-4">
                           <div>
                              <p class="invoice-kicker mb-1">Estado de facturación</p>
                              <h5 class="mb-2">{{ statusLabel }}</h5>
                              <p class="mb-0 invoice-status-help">{{ statusHelp }}</p>
                           </div>
                           <span class="invoice-status-badge" :class="statusClass">{{ statusLabel }}</span>
                        </div>

                        <div class="invoice-section-head">
                           <div>
                              <p class="invoice-kicker mb-1">Ítems</p>
                              <h6 class="mb-0">Detalle facturado</h6>
                           </div>
                           <span class="invoice-count-chip">{{ model.detalle_ventas.length }} ítem(s)</span>
                        </div>

                        <div class="invoice-items-list">
                           <div class="invoice-item-row" v-for="m in model.detalle_ventas" :key="m.id">
                              <div class="invoice-item-main">
                                 <span class="invoice-item-icon"><i class="fas fa-box"></i></span>
                                 <div>
                                    <h6 class="mb-1">{{ m.descripcion || 'Detalle sin descripción' }}</h6>
                                    <p class="mb-0">
                                       {{ Number(m.precio).toFixed(2) }}Bs x {{ m.cantidad }}
                                    </p>
                                 </div>
                              </div>
                              <div class="invoice-item-meta">
                                 <span><i class="fas fa-hashtag"></i>{{ m.codigo || 'S/C' }}</span>
                                 <span><i class="fas fa-barcode"></i>{{ m.codigoSin || 'S/C' }}</span>
                              </div>
                           </div>
                        </div>

                        <div class="row invoice-info-grid">
                           <div class="col-lg-8 col-md-6 col-12">
                              <div class="invoice-info-card">
                                 <p class="invoice-kicker mb-1">Información</p>
                                 <h6 class="mb-3">Detalle de venta</h6>
                                 <div class="invoice-info-list">
                                    <div class="invoice-info-row">
                                       <span>Código de seguimiento</span>
                                       <strong>{{ model.codigoSeguimiento || 'N/A' }}</strong>
                                    </div>
                                    <div class="invoice-info-row">
                                       <span>Estado del protocolo</span>
                                       <strong>{{ statusLabel }}</strong>
                                    </div>
                                    <div class="invoice-info-row" v-if="model.seguimiento && model.seguimiento.tipoEmision">
                                       <span>Tipo de emisión</span>
                                       <strong>{{ model.seguimiento.tipoEmision }}</strong>
                                    </div>
                                    <div class="invoice-info-row" v-if="model.seguimiento && model.seguimiento.cuf">
                                       <span>CUF</span>
                                       <strong class="invoice-code">{{ model.seguimiento.cuf }}</strong>
                                    </div>
                                    <div class="invoice-info-row">
                                       <span>Cliente</span>
                                       <strong>
                                             {{ model.cliente && model.cliente.codigoCliente ?
                                                model.cliente.codigoCliente : 'N/A' }} -
                                             {{ model.cliente && model.cliente.razonSocial ? model.cliente.razonSocial :
                                                'N/A' }}
                                       </strong>
                                    </div>
                                    <div class="invoice-info-row">
                                       <span>Documento identidad</span>
                                       <strong>{{ model.cliente && model.cliente.documentoIdentidad ? model.cliente.documentoIdentidad : 'N/A' }}</strong>
                                    </div>
                                    <div class="invoice-info-row">
                                       <span>Cajero</span>
                                       <strong>{{ model.origen_usuario_nombre || 'N/A' }}</strong>
                                    </div>
                                    <div class="invoice-info-row" v-if="model.seguimiento && model.seguimiento.observacion">
                                       <span>Observación</span>
                                       <strong>{{ model.seguimiento.observacion }}</strong>
                                    </div>
                                    <div class="invoice-info-row" v-if="model.seguimiento && model.seguimiento.fechaNotificacion">
                                       <span>Última notificación</span>
                                       <strong>{{ model.seguimiento.fechaNotificacion }}</strong>
                                    </div>
                                 </div>
                              </div>
                           </div>
                           <div class="col-lg-4 col-12 ms-auto">
                              <div class="invoice-total-card">
                                 <span>Total</span>
                                 <strong>{{ Number(model.total).toFixed(2) }}Bs</strong>
                                 <div class="invoice-logo-box">
                                    <img src="/assets/img/logo.png" alt="Logo">
                                 </div>
                              </div>
                           </div>
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
   name: "IndexPage",
   head() {
      return {
         title: this.modulo,
      };
   },
   data() {
      return {
         load: true,
         model: {
            total: 0,
            cliente: {},
            origen_usuario_nombre: '',
            detalle_ventas: [],
            status: null,
            seguimiento: {}
         },
         apiUrl: "ventas",
         page: "Ventas",
         modulo: "Invoice",
      };
   },
   computed: {
      statusLabel() {
         return this.model?.status?.label || 'Sin estado';
      },
      statusClass() {
         const key = this.model?.status?.key || '';
         const classes = {
            PROCESADO: 'procesado',
            RECEPCIONADA: 'recepcionada',
            CONTINGENCIA_CREADA: 'contingencia',
            OBSERVADO: 'observado',
            ANULADA: 'anulada',
            ANULACION_SOLICITADA: 'contingencia',
            ANULACION_OBSERVADA: 'observado',
            PENDIENTE_CONFIRMACION: 'recepcionada',
            PENDIENTE: 'pendiente',
         };

         return classes[key] || 'desconocido';
      },
      statusHelp() {
         const key = this.model?.status?.key || '';
         const messages = {
            PROCESADO: 'La factura ya fue confirmada y está lista para su uso.',
            RECEPCIONADA: 'La venta fue enviada y sigue en proceso de confirmación.',
            CONTINGENCIA_CREADA: 'La venta quedó pendiente por contingencia mientras se confirma con impuestos.',
            OBSERVADO: 'La emisión quedó observada y requiere revisión antes de reenviar.',
            ANULADA: 'La factura fue anulada correctamente.',
            ANULACION_SOLICITADA: 'La solicitud de anulación fue enviada y espera notificación final.',
            ANULACION_OBSERVADA: 'La solicitud de anulación fue observada por SUFE.',
            PENDIENTE_CONFIRMACION: 'La venta fue enviada y todavía está en proceso de confirmación.',
            PENDIENTE: 'La venta todavía no fue enviada al flujo de facturación.',
         };

         return messages[key] || 'No hay información adicional del estado.';
      },
      canAnular() {
         const key = this.model?.status?.key || '';
         const cuf = this.model?.status?.cuf || this.model?.seguimiento?.cuf;
         return Boolean(cuf) && key === 'PROCESADO';
      },
   },
   methods: {
      async GET_DATA(path) {
         const res = await this.$admin.$get(path);
         return res;
      },
      async fetchAnulacionGuardStatus() {
         try {
            const response = await this.$admin.$get('ventas/anulacion/guard-status');
            return response?.guard || null;
         } catch (error) {
            return null;
         }
      },
      async promptSupervisorAuthorization() {
         const { value } = await this.$swal.fire({
            title: 'Autorizacion requerida',
            html: `
               <div class="text-left">
                  <p class="small text-muted mb-2">Ingresa credenciales de un rol superior para habilitar anulacion temporal.</p>
                  <label class="d-block small font-weight-bold mb-1">Correo supervisor</label>
                  <input id="auth-supervisor-email" class="swal2-input" type="email" placeholder="supervisor@dominio.com">
                  <label class="d-block small font-weight-bold mt-3 mb-1">Contrasena supervisor</label>
                  <input id="auth-supervisor-password" class="swal2-input" type="password" placeholder="Contrasena">
               </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Autorizar',
            cancelButtonText: 'Cancelar',
            buttonsStyling: false,
            customClass: {
               popup: 'invoice-swal',
               title: 'invoice-swal-title',
               htmlContainer: 'invoice-swal-body',
               confirmButton: 'invoice-swal-button invoice-swal-confirm-danger',
               cancelButton: 'invoice-swal-button invoice-swal-cancel',
               actions: 'invoice-swal-actions'
            },
            preConfirm: () => {
               const supervisor_email = document.getElementById('auth-supervisor-email')?.value?.trim();
               const supervisor_password = document.getElementById('auth-supervisor-password')?.value || '';
               if (!supervisor_email || !supervisor_password) {
                  this.$swal.showValidationMessage('Correo y contrasena del supervisor son obligatorios.');
                  return false;
               }
               return { supervisor_email, supervisor_password, duracion_minutos: 15 };
            },
         });

         return value || null;
      },
      async ensureAnulacionAuthorization() {
         const roles = this.$store?.state?.auth?.roles || [];
         const permissions = this.$store?.state?.auth?.permissions || [];
         const isHigherRole =
            (Array.isArray(roles) && roles.some((r) => ['admin', 'administrador', 'supervisor'].includes(String(r).toLowerCase())))
            || (Array.isArray(permissions) && permissions.some((p) => ['rbac.manage', 'usuarios.manage', 'ventas.manage'].includes(String(p).toLowerCase())));
         if (isHigherRole) return true;

         const guard = await this.fetchAnulacionGuardStatus();
         if (guard?.allowed) return true;

         const credentials = await this.promptSupervisorAuthorization();
         if (!credentials) return false;

         try {
            const auth = await this.$admin.$post('ventas/anulacion/autorizar', credentials);
            this.notify('success', 'Autorizacion concedida', auth?.message || 'Anulacion habilitada temporalmente.');
            return true;
         } catch (error) {
            const data = error?.response?.data || {};
            const msg = data.message || data.error || 'No se pudo validar autorizacion de supervisor.';
            this.notify('error', 'Autorizacion rechazada', msg);
            return false;
         }
      },
      async anularFactura() {
         if (!this.canAnular) {
            this.notify('warning', 'No disponible', 'Solo se puede anular una factura procesada y con CUF.');
            return;
         }

         const authorized = await this.ensureAnulacionAuthorization();
         if (!authorized) return;

         const { value: formValues } = await this.$swal.fire({
            title: 'Anular factura',
            html: `
               <div class="invoice-annul-form">
                  <label class="invoice-annul-label" for="annul-motivo">Motivo</label>
                  <input id="annul-motivo" class="swal2-input invoice-annul-input" value="Datos erroneos en la factura">
                  <label class="invoice-annul-label" for="annul-tipo">Tipo de anulacion</label>
                  <select id="annul-tipo" class="swal2-select invoice-annul-select">
                     <option value="1">1 - Factura mal emitida</option>
                     <option value="2">2 - Nota credito-debito mal emitida</option>
                     <option value="3" selected>3 - Datos de emision incorrectos</option>
                     <option value="4">4 - Factura o nota devuelta</option>
                  </select>
               </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Confirmar anulacion',
            cancelButtonText: 'Cancelar',
            buttonsStyling: false,
            customClass: {
               popup: 'invoice-swal',
               title: 'invoice-swal-title',
               htmlContainer: 'invoice-swal-body',
               confirmButton: 'invoice-swal-button invoice-swal-confirm-danger',
               cancelButton: 'invoice-swal-button invoice-swal-cancel',
               actions: 'invoice-swal-actions'
            },
            preConfirm: () => {
               const motivo = document.getElementById('annul-motivo')?.value?.trim();
               const tipoAnulacion = Number(document.getElementById('annul-tipo')?.value || 0);
               if (!motivo) {
                  this.$swal.showValidationMessage('El motivo es obligatorio.');
                  return false;
               }
               return { motivo, tipoAnulacion };
            },
         });

         if (!formValues) return;

         const cuf = this.model?.status?.cuf || this.model?.seguimiento?.cuf;
         this.load = true;
         try {
            const response = await this.$admin.$patch(`ventas/anular/${cuf}`, formValues);
            this.notify('success', 'Solicitud enviada', response?.message || 'La anulacion fue recepcionada correctamente.');
            this.model = await this.GET_DATA('ventas/' + this.$route.params.id);
         } catch (error) {
            const data = error?.response?.data || {};
            const msg = data.message || data.error || data.details?.mensaje || 'No se pudo solicitar la anulacion.';
            this.notify('error', 'No se pudo anular', msg);
         } finally {
            this.load = false;
         }
      },
      notify(icon, title, text = '') {
         return this.$swal.fire({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            icon,
            title,
            text,
            timer: icon === 'error' ? 4200 : 2400,
            timerProgressBar: true,
            customClass: {
               popup: 'invoice-toast',
               title: 'invoice-toast-title',
               htmlContainer: 'invoice-toast-body',
               timerProgressBar: 'invoice-toast-progress'
            }
         });
      },
   },
   mounted() {
      this.$nextTick(async () => {
         try {
            await Promise.all([this.GET_DATA('ventas/' + this.$route.params.id)]).then((v) => {
               this.model = v[0];
            });
         } catch (e) {
            console.error(e);
         } finally {
            this.load = false;
         }
      });
   },
};
</script>
<style>
.invoice-page {
   color: #344054;
}

.invoice-card {
   border-radius: 18px;
   overflow: hidden;
   background: #ffffff;
   border: 1px solid #e6ebf3;
   box-shadow: none;
}

.invoice-header {
   padding: 1.3rem 1.45rem;
   background: #f8fafc;
   border-bottom: 1px solid #e6ebf3;
}

.invoice-header-content {
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: 1rem;
}

.invoice-heading {
   display: flex;
   align-items: flex-start;
   gap: 1rem;
}

.invoice-heading-icon {
   width: 46px;
   height: 46px;
   border-radius: 16px;
   display: inline-flex;
   align-items: center;
   justify-content: center;
   flex-shrink: 0;
   background: #eef2ff;
   color: #5967d8;
   border: 1px solid #e0e7ff;
}

.invoice-heading h4 {
   color: #1f2937;
   font-size: 1.35rem;
   font-weight: 800;
}

.invoice-subtitle {
   color: #667085;
   font-size: 0.96rem;
}

.invoice-actions {
   display: flex;
   align-items: center;
   justify-content: flex-end;
   gap: 0.55rem;
   flex-wrap: wrap;
}

.invoice-action-btn {
   min-height: 42px;
   border-radius: 13px;
   border: 1px solid #d8e0ec;
   background: #ffffff;
   color: #4b5565;
   display: inline-flex;
   align-items: center;
   gap: 0.5rem;
   font-size: 0.82rem;
   font-weight: 800;
   box-shadow: none;
}

.invoice-action-btn-primary {
   background: #1f2937;
   border-color: rgba(31, 41, 55, 0.16);
   color: #ffffff;
}

.invoice-action-btn-danger {
   background: #fff1f0;
   border-color: #f5b3ad;
   color: #b42318;
}

.invoice-body {
   padding: 1.55rem 1.65rem;
}

.invoice-status-card {
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: 1rem;
   padding: 1.05rem 1.15rem;
   border-radius: 16px;
   background: #f8fafc;
   border: 1px solid #e6ebf3;
}

.invoice-kicker {
   color: #98a2b3;
   font-size: 0.72rem;
   font-weight: 800;
   letter-spacing: 0.16em;
   text-transform: uppercase;
}

.invoice-status-card h5,
.invoice-section-head h6,
.invoice-info-card h6 {
   color: #1f2937;
   font-weight: 800;
}

.invoice-status-help {
   color: #667085;
   max-width: 620px;
}

.invoice-status-badge {
   display: inline-flex;
   align-items: center;
   justify-content: center;
   padding: 0.55rem 0.95rem;
   border-radius: 999px;
   font-size: 0.84rem;
   font-weight: 800;
   white-space: nowrap;
   border: 1px solid transparent;
}

.invoice-status-badge.procesado {
   background: #ecfdf3;
   color: #067647;
   border-color: #abefc6;
}

.invoice-status-badge.recepcionada {
   background: #eff6ff;
   color: #1d4ed8;
   border-color: #bfdbfe;
}

.invoice-status-badge.contingencia {
   background: #fff7df;
   color: #8a6100;
   border-color: #f6d77a;
}

.invoice-status-badge.observado {
   background: #fff1f0;
   color: #b42318;
   border-color: #f5b3ad;
}

.invoice-status-badge.anulada {
   background: #eef2f7;
   color: #475569;
}

.invoice-status-badge.pendiente,
.invoice-status-badge.desconocido {
   background: #f1f5f9;
   color: #475569;
   border-color: #e2e8f0;
}

.invoice-section-head {
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: 1rem;
   margin-bottom: 1rem;
}

.invoice-count-chip {
   min-height: 34px;
   padding: 0.4rem 0.75rem;
   border-radius: 999px;
   display: inline-flex;
   align-items: center;
   justify-content: center;
   background: #eef2ff;
   border: 1px solid #dfe5ff;
   color: #3442a8;
   font-size: 0.82rem;
   font-weight: 800;
}

.invoice-items-list {
   display: flex;
   flex-direction: column;
   border: 1px solid #e6ebf3;
   border-radius: 16px;
   overflow: hidden;
   background: #ffffff;
   margin-bottom: 1.35rem;
}

.invoice-item-row {
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: 1rem;
   padding: 1rem;
}

.invoice-item-row + .invoice-item-row {
   border-top: 1px solid #eef2f7;
}

.invoice-item-main {
   display: flex;
   align-items: flex-start;
   gap: 0.85rem;
   min-width: 0;
}

.invoice-item-icon {
   width: 38px;
   height: 38px;
   border-radius: 13px;
   display: inline-flex;
   align-items: center;
   justify-content: center;
   background: #eef2ff;
   border: 1px solid #dfe5ff;
   color: #5967d8;
   flex-shrink: 0;
}

.invoice-item-main h6 {
   color: #24324d;
   font-size: 0.98rem;
   font-weight: 800;
}

.invoice-item-main p {
   color: #667085;
   font-weight: 650;
}

.invoice-item-meta {
   display: flex;
   align-items: center;
   justify-content: flex-end;
   gap: 0.45rem;
   flex-wrap: wrap;
}

.invoice-item-meta span {
   min-height: 30px;
   padding: 0.32rem 0.62rem;
   border-radius: 999px;
   display: inline-flex;
   align-items: center;
   gap: 0.35rem;
   background: #f8fafc;
   border: 1px solid #e6ebf3;
   color: #667085;
   font-size: 0.78rem;
   font-weight: 800;
}

.invoice-info-grid {
   row-gap: 1rem;
}

.invoice-info-card,
.invoice-total-card {
   height: 100%;
   border-radius: 16px;
   border: 1px solid #e6ebf3;
   background: #f8fafc;
   padding: 1.15rem;
}

.invoice-info-list {
   display: flex;
   flex-direction: column;
   gap: 0.72rem;
}

.invoice-info-row {
   display: grid;
   grid-template-columns: minmax(150px, 0.45fr) minmax(0, 1fr);
   gap: 0.75rem;
   align-items: start;
}

.invoice-info-row span {
   color: #667085;
   font-size: 0.82rem;
   font-weight: 700;
}

.invoice-info-row strong {
   color: #24324d;
   font-size: 0.86rem;
   font-weight: 800;
   word-break: break-word;
}

.invoice-code {
   font-family: Consolas, "Courier New", monospace;
   font-size: 0.78rem !important;
}

.invoice-total-card {
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   gap: 0.7rem;
   text-align: center;
   background: #ffffff;
}

.invoice-total-card span {
   color: #667085;
   font-size: 0.86rem;
   font-weight: 800;
}

.invoice-total-card strong {
   color: #1f2937;
   font-size: 1.65rem;
   font-weight: 800;
}

.invoice-logo-box {
   width: 128px;
   height: 128px;
   border-radius: 24px;
   display: flex;
   align-items: center;
   justify-content: center;
   background: #f8fafc;
   border: 1px solid #e6ebf3;
}

.invoice-logo-box img {
   width: 86px;
   height: auto;
}

.invoice-toast,
.invoice-swal {
   border-radius: 16px !important;
   background: #ffffff !important;
   border: 1px solid #e6ebf3 !important;
   box-shadow: 0 18px 48px rgba(15, 23, 42, 0.16) !important;
}

.invoice-toast {
   width: min(420px, calc(100vw - 24px)) !important;
   padding: 0.95rem 1rem !important;
}

.invoice-toast-title,
.invoice-swal-title {
   color: #1f2937 !important;
   font-weight: 800 !important;
   font-size: 2rem !important;
   letter-spacing: -0.02em !important;
}

.invoice-toast-body,
.invoice-swal-body {
   color: #667085 !important;
   font-weight: 600 !important;
}

.invoice-toast-progress {
   background: rgba(89, 103, 216, 0.22) !important;
}

.invoice-swal {
   width: min(460px, calc(100vw - 28px)) !important;
   padding: 1.5rem !important;
}

.invoice-swal .swal2-html-container {
   margin: 0.8rem 0 0 !important;
   padding: 0 !important;
   text-align: left !important;
}

.invoice-annul-form {
   display: flex;
   flex-direction: column;
   gap: 0.65rem;
}

.invoice-annul-label {
   color: #344054;
   font-size: 0.8rem;
   font-weight: 800;
   letter-spacing: 0.04em;
   text-transform: uppercase;
   margin: 0;
}

.invoice-annul-input,
.invoice-annul-select {
   width: 100% !important;
   margin: 0 !important;
   min-height: 46px !important;
   border-radius: 12px !important;
   border: 1px solid #d8e0ec !important;
   font-size: 1rem !important;
   color: #344054 !important;
   box-shadow: none !important;
   background: #ffffff !important;
}

.invoice-annul-input {
   padding: 0.75rem 0.9rem !important;
}

.invoice-annul-select {
   padding: 0.68rem 2.3rem 0.68rem 0.9rem !important;
   -webkit-appearance: none !important;
   -moz-appearance: none !important;
   appearance: none !important;
   background-image: linear-gradient(45deg, transparent 50%, #64748b 50%), linear-gradient(135deg, #64748b 50%, transparent 50%);
   background-position: calc(100% - 18px) calc(50% - 3px), calc(100% - 12px) calc(50% - 3px);
   background-size: 6px 6px, 6px 6px;
   background-repeat: no-repeat;
}

.invoice-swal-actions {
   gap: 0.7rem !important;
}

.invoice-swal-button {
   min-width: 132px;
   min-height: 42px;
   border-radius: 13px;
   border: 1px solid transparent;
   padding: 0.68rem 1rem;
   font-size: 0.82rem;
   font-weight: 800;
}

.invoice-swal-cancel {
   background: #ffffff;
   border-color: #d8e0ec;
   color: #4b5565;
}

.invoice-swal-confirm-danger {
   background: #b42318;
   border-color: #b42318;
   color: #ffffff;
}

body.enterprise-dark .invoice-card,
body.enterprise-dark .invoice-toast,
body.enterprise-dark .invoice-swal {
   background: #151e2b !important;
   border-color: rgba(82, 99, 128, 0.78) !important;
   box-shadow: 0 24px 70px rgba(0, 0, 0, 0.25) !important;
}

body.enterprise-dark .invoice-header {
   background: #111b2a !important;
   border-color: rgba(82, 99, 128, 0.72) !important;
}

body.enterprise-dark .invoice-heading h4,
body.enterprise-dark .invoice-status-card h5,
body.enterprise-dark .invoice-section-head h6,
body.enterprise-dark .invoice-info-card h6,
body.enterprise-dark .invoice-item-main h6,
body.enterprise-dark .invoice-info-row strong,
body.enterprise-dark .invoice-total-card strong,
body.enterprise-dark .invoice-toast-title,
body.enterprise-dark .invoice-swal-title {
   color: #f8fafc !important;
}

body.enterprise-dark .invoice-subtitle,
body.enterprise-dark .invoice-status-help,
body.enterprise-dark .invoice-item-main p,
body.enterprise-dark .invoice-info-row span,
body.enterprise-dark .invoice-total-card span,
body.enterprise-dark .invoice-toast-body,
body.enterprise-dark .invoice-swal-body {
   color: #94a3b8 !important;
}

body.enterprise-dark .invoice-annul-label {
   color: #e5e7eb !important;
}

body.enterprise-dark .invoice-annul-input,
body.enterprise-dark .invoice-annul-select {
   background: #0f1726 !important;
   border-color: rgba(82, 99, 128, 0.86) !important;
   color: #e5e7eb !important;
}

body.enterprise-dark .invoice-annul-select {
   background-image: linear-gradient(45deg, transparent 50%, #cbd5e1 50%), linear-gradient(135deg, #cbd5e1 50%, transparent 50%) !important;
}

body.enterprise-dark .invoice-kicker {
   color: #aab4c6 !important;
}

body.enterprise-dark .invoice-heading-icon,
body.enterprise-dark .invoice-item-icon,
body.enterprise-dark .invoice-count-chip {
   background: rgba(89, 103, 216, 0.18) !important;
   border-color: rgba(129, 140, 248, 0.3) !important;
   color: #c7d2fe !important;
}

body.enterprise-dark .invoice-status-card,
body.enterprise-dark .invoice-items-list,
body.enterprise-dark .invoice-info-card,
body.enterprise-dark .invoice-total-card,
body.enterprise-dark .invoice-logo-box,
body.enterprise-dark .invoice-item-meta span {
   background: #101827 !important;
   border-color: rgba(82, 99, 128, 0.78) !important;
   color: #cbd5e1 !important;
}

body.enterprise-dark .invoice-item-row + .invoice-item-row {
   border-color: rgba(82, 99, 128, 0.48) !important;
}

body.enterprise-dark .invoice-action-btn {
   background: #101827 !important;
   border-color: rgba(82, 99, 128, 0.78) !important;
   color: #cbd5e1 !important;
}

body.enterprise-dark .invoice-action-btn-primary {
   background: #f8fafc !important;
   border-color: rgba(248, 250, 252, 0.2) !important;
   color: #111827 !important;
}

body.enterprise-dark .invoice-action-btn-danger {
   background: rgba(239, 68, 68, 0.14) !important;
   border-color: rgba(239, 68, 68, 0.32) !important;
   color: #fca5a5 !important;
}

body.enterprise-dark .invoice-status-badge.procesado {
   background: rgba(34, 197, 94, 0.14) !important;
   border-color: rgba(34, 197, 94, 0.28) !important;
   color: #86efac !important;
}

body.enterprise-dark .invoice-status-badge.contingencia {
   background: rgba(245, 158, 11, 0.16) !important;
   border-color: rgba(245, 158, 11, 0.32) !important;
   color: #fbbf24 !important;
}

body.enterprise-dark .invoice-status-badge.observado {
   background: rgba(239, 68, 68, 0.14) !important;
   border-color: rgba(239, 68, 68, 0.32) !important;
   color: #fca5a5 !important;
}

body.enterprise-dark .invoice-status-badge.recepcionada {
   background: rgba(89, 103, 216, 0.18) !important;
   border-color: rgba(129, 140, 248, 0.3) !important;
   color: #c7d2fe !important;
}

body.enterprise-dark .invoice-status-badge.anulada,
body.enterprise-dark .invoice-status-badge.pendiente,
body.enterprise-dark .invoice-status-badge.desconocido {
   background: rgba(148, 163, 184, 0.12) !important;
   border-color: rgba(148, 163, 184, 0.24) !important;
   color: #cbd5e1 !important;
}

body.enterprise-dark .swal2-input,
body.enterprise-dark .swal2-select {
   background: #0f1726 !important;
   border-color: rgba(82, 99, 128, 0.86) !important;
   color: #e5e7eb !important;
}

body.enterprise-dark .invoice-swal-cancel {
   background: #101827;
   border-color: rgba(82, 99, 128, 0.78);
   color: #cbd5e1;
}

@media (max-width: 991px) {
   .invoice-status-card {
      flex-direction: column;
      align-items: flex-start;
   }

   .invoice-header-content,
   .invoice-item-row {
      flex-direction: column;
      align-items: stretch;
   }

   .invoice-actions,
   .invoice-item-meta {
      justify-content: flex-start;
   }
}

@media (max-width: 767px) {
   .invoice-header,
   .invoice-body {
      padding: 1.2rem;
   }

   .invoice-heading {
      gap: 0.75rem;
   }

   .invoice-heading-icon {
      width: 42px;
      height: 42px;
      border-radius: 14px;
   }

   .invoice-action-btn {
      width: 100%;
      justify-content: center;
   }

   .invoice-info-row {
      grid-template-columns: 1fr;
      gap: 0.25rem;
   }
}
</style>
