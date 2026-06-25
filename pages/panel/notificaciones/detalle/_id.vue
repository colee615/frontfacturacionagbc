<template>
   <div>
      <JcLoader :load="load"></JcLoader>
      <AdminTemplate :page="page" :modulo="modulo">
         <div slot="body" class="enterprise-page-shell">
            <section class="report-sheet">
               <div class="report-sheet-head">
                  <div class="report-head-copy">
                     <p class="report-kicker mb-2">Reporte de notificacion</p>
                     <h2 class="report-title mb-2">Notificacion #{{ model.id || '-' }}</h2>
                     <p class="report-subtitle mb-0">
                        Tipo emision: <strong>{{ parsedDetalle.tipoEmision || 'SIN TIPO' }}</strong>
                     </p>
                  </div>

                  <button type="button" class="report-back-btn" @click="$router.back()">
                     <i class="fas fa-arrow-left"></i>
                     <span>Volver</span>
                  </button>
               </div>

               <div class="report-divider"></div>

               <div class="report-summary-grid">
                  <div class="report-summary-item">
                     <span>Estado</span>
                     <strong :class="`report-state ${stateClass(model.estado)}`">{{ model.estado || 'SIN ESTADO' }}</strong>
                  </div>
                  <div class="report-summary-item">
                     <span>Fecha</span>
                     <strong>{{ model.fecha || 'Sin fecha' }}</strong>
                  </div>
                  <div class="report-summary-item">
                     <span>Fuente</span>
                     <strong>{{ model.fuente || 'Sin fuente' }}</strong>
                  </div>
                  <div class="report-summary-item">
                     <span>Seguimiento</span>
                     <strong class="report-mono">{{ model.codigo_seguimiento || 'Sin seguimiento' }}</strong>
                  </div>
               </div>

               <div class="report-divider light"></div>

               <div class="report-section">
                  <h3>Informacion principal</h3>
                  <div class="report-data-grid">
                     <div class="report-data-row">
                        <span>CUF</span>
                        <strong class="report-mono">{{ parsedDetalle.cuf || 'No disponible' }}</strong>
                     </div>
                     <div class="report-data-row">
                        <span>Nro Factura</span>
                        <strong>{{ parsedDetalle.nroFactura || 'No disponible' }}</strong>
                     </div>
                     <div class="report-data-row">
                        <span>Codigo Estado Impuestos</span>
                        <strong>{{ parsedDetalle.codigoEstadoImpuestos ?? 'No disponible' }}</strong>
                     </div>
                     <div class="report-data-row wide">
                        <span>Mensaje</span>
                        <strong>{{ model.mensaje || 'Sin mensaje' }}</strong>
                     </div>
                     <div class="report-data-row wide">
                        <span>Observacion</span>
                        <strong>{{ resolvedObservacion }}</strong>
                     </div>
                  </div>
               </div>

               <div class="report-section">
                  <h3>Enlaces y referencias</h3>
                  <div class="report-link-list">
                     <div class="report-link-row">
                        <span>URL PDF</span>
                        <a v-if="parsedDetalle.urlPdf" :href="parsedDetalle.urlPdf" target="_blank" rel="noopener noreferrer">
                           {{ parsedDetalle.urlPdf }}
                        </a>
                        <strong v-else>No disponible</strong>
                     </div>
                     <div class="report-link-row">
                        <span>URL XML</span>
                        <a v-if="parsedDetalle.urlXml" :href="parsedDetalle.urlXml" target="_blank" rel="noopener noreferrer">
                           {{ parsedDetalle.urlXml }}
                        </a>
                        <strong v-else>No disponible</strong>
                     </div>
                  </div>
               </div>
            </section>
         </div>
      </AdminTemplate>
   </div>
</template>

<script>
export default {
   data() {
      return {
         load: true,
         page: 'Reporte',
         modulo: 'Notificaciones',
         model: {
            detalle: {}
         },
         parsedDetalle: {
            tipoEmision: '',
            cuf: '',
            nroFactura: '',
            urlPdf: '',
            urlXml: '',
            observacion: '',
            codigoEstadoImpuestos: null,
         }
      };
   },
   methods: {
      async GET_DATA(path) {
         try {
            const response = await this.$admin.$get(path);
            this.model = response;
            if (response.detalle) {
               this.parsedDetalle = typeof response.detalle === 'string'
                  ? JSON.parse(response.detalle)
                  : response.detalle;
            }
         } catch (error) {
            console.error('Error al obtener los datos:', error);
         } finally {
            this.load = false;
         }
      },
      stateClass(state) {
         const value = (state || '').toString().toUpperCase();
         if (value === 'EXITO') return 'success';
         if (value === 'OBSERVADO') return 'warning';
         if (value === 'CREADO') return 'info';
         return 'neutral';
      }
   },
   computed: {
      user() {
         return this.$store.state.auth.user;
      },
      resolvedObservacion() {
         return this.model.observacion || this.parsedDetalle.observacion || 'No hay observaciones';
      }
   },
   mounted() {
      this.$nextTick(async () => {
         try {
            await this.GET_DATA('notificaciones/' + this.$route.params.id);
         } catch (e) {
            console.log(e);
         } finally {
            this.load = false;
         }
      });
   },
};
</script>

<style scoped>
.report-sheet {
   max-width: 1060px;
   margin: 0 auto;
   padding: 1.4rem 1.35rem 1.5rem;
   background: #ffffff;
   border: 1px solid #e6ebf3;
   border-radius: 20px;
   box-shadow: 0 10px 28px rgba(22, 42, 77, 0.06);
}

.report-sheet-head {
   display: flex;
   align-items: flex-start;
   justify-content: space-between;
   gap: 1rem;
}

.report-kicker {
   margin: 0;
   color: #8b94a7;
   font-size: 0.76rem;
   font-weight: 800;
   letter-spacing: 0.18em;
   text-transform: uppercase;
}

.report-title {
   margin: 0;
   color: #1e2a3d;
   font-size: 1.6rem;
   font-weight: 800;
   letter-spacing: -0.02em;
}

.report-subtitle {
   color: #56627a;
   font-size: 0.95rem;
}

.report-subtitle strong {
   color: #24324d;
}

.report-back-btn {
   display: inline-flex;
   align-items: center;
   gap: 0.5rem;
   min-height: 42px;
   padding: 0.6rem 0.95rem;
   border-radius: 12px;
   border: 1px solid #d7deeb;
   background: #ffffff;
   color: #4a5b79;
   font-weight: 800;
}

.report-divider {
   height: 1px;
   margin: 1rem 0 1.15rem;
   background: #e6ebf3;
}

.report-divider.light {
   margin-top: 1.25rem;
}

.report-summary-grid {
   display: grid;
   grid-template-columns: repeat(4, minmax(0, 1fr));
   gap: 0.8rem;
}

.report-summary-item {
   padding: 0.9rem 1rem;
   border-radius: 14px;
   border: 1px solid #e6ebf3;
   background: #f8fafc;
}

.report-summary-item span,
.report-data-row span,
.report-link-row span {
   display: block;
   margin-bottom: 0.28rem;
   color: #6f7c92;
   font-size: 0.82rem;
   font-weight: 800;
   text-transform: uppercase;
   letter-spacing: 0.08em;
}

.report-summary-item strong {
   color: #1e2a3d;
   font-size: 0.98rem;
   font-weight: 800;
}

.report-state {
   display: inline-flex;
   align-items: center;
   justify-content: center;
   min-width: 88px;
   padding: 0.34rem 0.7rem;
   border-radius: 999px;
   border: 1px solid transparent;
   font-size: 0.78rem;
}

.report-state.success {
   background: #ecfdf3;
   color: #067647;
   border-color: #abefc6;
}

.report-state.warning {
   background: #fff5f5;
   color: #b42318;
   border-color: #fecdc9;
}

.report-state.info {
   background: #eff6ff;
   color: #1d4ed8;
   border-color: #bfdbfe;
}

.report-state.neutral {
   background: #f1f5f9;
   color: #475569;
   border-color: #e2e8f0;
}

.report-section {
   margin-top: 1.3rem;
}

.report-section h3 {
   margin: 0 0 0.85rem;
   color: #1e2a3d;
   font-size: 1.05rem;
   font-weight: 800;
}

.report-data-grid,
.report-link-list {
   display: grid;
   gap: 0.7rem;
}

.report-data-row,
.report-link-row {
   display: grid;
   grid-template-columns: 210px minmax(0, 1fr);
   gap: 0.8rem;
   align-items: start;
   padding: 0.85rem 0.95rem;
   border: 1px solid #e6ebf3;
   border-radius: 14px;
   background: #ffffff;
}

.report-data-row strong,
.report-data-row a,
.report-link-row strong,
.report-link-row a {
   color: #24324d;
   font-weight: 700;
   word-break: break-word;
}

.report-mono {
   font-family: Consolas, Monaco, monospace;
}

.report-link-row a {
   color: #2d4f8f;
}

@media (max-width: 991px) {
   .report-sheet-head {
      flex-direction: column;
   }

   .report-back-btn {
      width: 100%;
      justify-content: center;
   }

   .report-summary-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
   }

   .report-data-row,
   .report-link-row {
      grid-template-columns: 1fr;
   }

   .report-data-row span,
   .report-link-row span {
      margin-bottom: 0.15rem;
   }
}

@media (max-width: 767px) {
   .report-sheet {
      padding: 1.05rem;
      border-radius: 16px;
   }

   .report-summary-grid {
      grid-template-columns: 1fr;
   }
}
</style>
