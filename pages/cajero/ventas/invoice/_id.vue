<template>
   <div>
      <JcLoader :load="load"></JcLoader>
      <AdminTemplate :page="page" :modulo="modulo">
         <div slot="body">
            <div class="row justify-content-md-center">
               <div class="col-lg-8 mx-auto">
                  <div class="card mb-4">
                     <div class="card-header p-3 pb-0">
                        <div class="d-flex justify-content-between align-items-center">
                           <div>
                              <h6>Detalle de venta</h6>
                              <p class="text-sm mb-0">
                                 Venta no. <b> {{ model.id }}</b> de <b>{{ model.fecha }} </b>
                              </p>
                           </div>
                           <button @click="$router.back()" class="btn bg-gradient-info btn-sm mb-0">
                              <i class="ni ni-bold-left"></i> Regresar
                           </button>
                        </div>
                     </div>
                     <div class="card-body p-3 pt-0">
                        <hr class="horizontal dark mt-0 mb-4" />
                        <div class="invoice-status-card mb-4">
                           <div>
                              <p class="invoice-kicker mb-1">Estado de facturación</p>
                              <h5 class="mb-2">{{ statusLabel }}</h5>
                              <p class="mb-0 invoice-status-help">{{ statusHelp }}</p>
                           </div>
                           <span class="invoice-status-badge" :class="statusClass">{{ statusLabel }}</span>
                        </div>
                        <div class="row">
                           <div class="col-12" v-for="m in model.detalle_ventas" :key="m.id">
                              <div class="d-flex">
                                 <div>
                                    <h6 class="text-lg mb-0 mt-2">{{ m.descripcion || 'Detalle sin descripción' }} - {{ m.codigo || 'S/C' }}</h6>
                                    <p class="text-sm mb-3">
                                       {{ Number(m.precio).toFixed(2) }}Bs x {{ m.cantidad }}
                                    </p>
                                    <span class="badge badge-sm bg-gradient-success"> <i class="fas fa-barcode"></i>
                                       {{ m.codigoSin || 'S/C' }}</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                        <hr class="horizontal dark mt-4 mb-4" />
                        <div class="row">
                           <div class="col-lg-8 col-md-6 col-12">
                              <h6 class="mb-3 mt-4">Información</h6>
                              <ul class="list-group">
                                 <li class="list-group-item border-0 d-flex p-4 mb-2 bg-gray-100 border-radius-lg">
                                    <div class="d-flex flex-column">
                                       <h6 class="mb-3 text-sm">Detalle de venta</h6>
                                       <span class="mb-2 text-xs">Codigo de Seguimiento:
                                          <span class="text-dark font-weight-bold ms-2">{{ model.codigoSeguimiento
                                             }}</span>
                                       </span>
                                       <span class="mb-2 text-xs">Estado del protocolo:
                                          <span class="text-dark font-weight-bold ms-2">{{ statusLabel }}</span>
                                       </span>
                                       <span class="mb-2 text-xs" v-if="model.seguimiento && model.seguimiento.tipoEmision">Tipo de emisión:
                                          <span class="text-dark font-weight-bold ms-2">{{ model.seguimiento.tipoEmision }}</span>
                                       </span>
                                       <span class="mb-2 text-xs" v-if="model.seguimiento && model.seguimiento.cuf">CUF:
                                          <span class="text-dark font-weight-bold ms-2">{{ model.seguimiento.cuf }}</span>
                                       </span>
                                       <span class="mb-2 text-xs">Cliente:
                                          <span class="text-dark font-weight-bold ms-2">
                                             {{ model.cliente && model.cliente.codigoCliente ?
                                                model.cliente.codigoCliente : 'N/A' }} -
                                             {{ model.cliente && model.cliente.razonSocial ? model.cliente.razonSocial :
                                                'N/A' }}
                                          </span>
                                       </span>
                                       <span class="mb-2 text-xs">Documento Identidad:
                                          <span class="text-dark font-weight-bold ms-2">{{ model.cliente &&
                                             model.cliente.documentoIdentidad ? model.cliente.documentoIdentidad : 'N/A'
                                             }}</span>
                                       </span>
                                       <span class="mb-2 text-xs">Cajero:
                                          <span class="text-dark font-weight-bold ms-2">{{ model.origen_usuario_nombre || 'N/A' }}</span>
                                       </span>
                                       <span class="mb-2 text-xs" v-if="model.seguimiento && model.seguimiento.observacion">Observación:
                                          <span class="text-dark font-weight-bold ms-2">{{ model.seguimiento.observacion }}</span>
                                       </span>
                                       <span class="mb-2 text-xs" v-if="model.seguimiento && model.seguimiento.fechaNotificacion">Última notificación:
                                          <span class="text-dark font-weight-bold ms-2">{{ model.seguimiento.fechaNotificacion }}</span>
                                       </span>
                                    </div>
                                 </li>
                              </ul>
                           </div>
                           <div class="col-lg-4 col-12 ms-auto">
                              <div class="d-flex justify-content-between mt-4">
                                 <span class="mb-2 text-lg"> Total: </span>
                                 <span class="text-dark text-lg ms-2 font-weight-bold">{{ Number(model.total).toFixed(2)
                                    }}Bs</span>
                              </div>
                              <div style="display: flex; justify-content: center; align-items: center;">
                                 <img src="/assets/img/logo.png" alt="Imagen Descriptiva"
                                    style="width: 150px; height: auto;">
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
            PENDIENTE_CONFIRMACION: 'La venta fue enviada y todavía está en proceso de confirmación.',
            PENDIENTE: 'La venta todavía no fue enviada al flujo de facturación.',
         };

         return messages[key] || 'No hay información adicional del estado.';
      },
   },
   methods: {
      async GET_DATA(path) {
         const res = await this.$admin.$get(path);
         return res;
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
<style scoped>
.invoice-status-card {
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: 1rem;
   padding: 1rem 1.2rem;
   border-radius: 18px;
   background: linear-gradient(135deg, #ffffff 0%, #fffaf0 100%);
   border: 1px solid rgba(223, 230, 240, 0.92);
}

.invoice-kicker {
   color: #b78916;
   font-size: 0.78rem;
   font-weight: 800;
   letter-spacing: 0.12em;
   text-transform: uppercase;
}

.invoice-status-help {
   color: #6b7a90;
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
}

.invoice-status-badge.procesado {
   background: #ecfdf3;
   color: #157347;
}

.invoice-status-badge.recepcionada {
   background: #eff6ff;
   color: #1d4ed8;
}

.invoice-status-badge.contingencia {
   background: #fff8e1;
   color: #a16207;
}

.invoice-status-badge.observado {
   background: #fff5f5;
   color: #c2410c;
}

.invoice-status-badge.pendiente,
.invoice-status-badge.desconocido {
   background: #f1f5f9;
   color: #475569;
}

@media (max-width: 991px) {
   .invoice-status-card {
      flex-direction: column;
      align-items: flex-start;
   }
}
</style>
