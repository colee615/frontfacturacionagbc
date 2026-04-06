<template>
   <div>
      <JcLoader :load="load"></JcLoader>
      <AdminTemplate :page="page" :modulo="modulo">
         <div slot="body">
            <div class="row">
               <div class="col-12 mb-4">
                  <div class="card notification-hero">
                     <div class="card-body">
                        <div class="notification-hero-head">
                           <div>
                              <p class="notification-kicker mb-2">Centro de Seguimiento</p>
                              <h4 class="notification-title mb-2">Notificaciones de facturación</h4>
                              <p class="notification-subtitle mb-0">Monitorea emisiones, contingencias y respuestas de SUFE en una sola vista.</p>
                           </div>
                           <div class="notification-badge">
                              <i class="fas fa-receipt"></i>
                              <span>{{ filteredList.length }} registros</span>
                           </div>
                        </div>
                        <div class="notification-search-wrap mt-4">
                           <i class="fas fa-search"></i>
                           <input v-model="searchQuery" type="text" class="form-control notification-search"
                              placeholder="Buscar por codigo de seguimiento o mensaje">
                        </div>
                        <div class="row mt-4 g-3">
                           <div class="col-md-3 col-sm-6">
                              <div class="notification-stat">
                                 <span class="notification-stat-label">Exitosas</span>
                                 <strong>{{ successCount }}</strong>
                              </div>
                           </div>
                           <div class="col-md-3 col-sm-6">
                              <div class="notification-stat">
                                 <span class="notification-stat-label">Observadas</span>
                                 <strong>{{ observedCount }}</strong>
                              </div>
                           </div>
                           <div class="col-md-3 col-sm-6">
                              <div class="notification-stat">
                                 <span class="notification-stat-label">Creadas</span>
                                 <strong>{{ createdCount }}</strong>
                              </div>
                           </div>
                           <div class="col-md-3 col-sm-6">
                              <div class="notification-stat">
                                 <span class="notification-stat-label">Contingencias</span>
                                 <strong>{{ contingencyCount }}</strong>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
               <div class="col-12">
                  <div class="card">
                     <div class="card-body">
                        <div class="table-responsive notification-table-wrap">
                           <table class="table notification-table align-middle">
                              <thead>
                                 <tr>
                                    <th class="py-0 px-1">#</th>
                                    <th class="py-0 px-1">TIPO</th>
                                    <th class="py-0 px-1">ESTADO</th>
                                    <th class="py-0 px-1">FUENTE</th>
                                    <th class="py-0 px-1">SEGUIMIENTO</th>
                                    <th class="py-0 px-1">FECHA</th>
                                    <th class="py-0 px-1">MENSAJE</th>
                                    <th class="py-0 px-1"></th>
                                 </tr>
                              </thead>
                              <tbody>
                                 <tr v-for="(m, i) in paginatedList" :key="m.id">
                                    <td class="py-2 px-2 notification-row-index">{{ (currentPage - 1) * itemsPerPage + i + 1 }}</td>
                                    <td class="py-2 px-2">
                                       <span class="notification-chip" :class="tipoClasses[getTipoEmision(m)] || 'tipo-generico'">
                                          {{ getTipoEmision(m) || 'SIN TIPO' }}
                                       </span>
                                    </td>
                                    <td class="py-2 px-2">
                                       <span class="notification-state" :class="estadoClasses[m.estado] || ''">{{ m.estado }}</span>
                                    </td>
                                    <td class="py-2 px-2">
                                       <span class="notification-source">{{ m.fuente }}</span>
                                    </td>
                                    <td class="py-2 px-2">
                                       <div class="notification-tracking">{{ m.codigo_seguimiento }}</div>
                                    </td>
                                    <td class="py-2 px-2">{{ m.fecha }}</td>
                                    <td class="py-2 px-2">
                                       <div class="notification-message">{{ m.mensaje }}</div>
                                    </td>
                                    <td class="py-2 px-2">
                                       <div class="btn-group">
                                          <nuxt-link :to="`${url_editar}${m.id}`"
                                             class="btn btn-success btn-sm py-1 px-2" v-if="m.estado === 'EXITO'">
                                             <i class="fas fa-search"></i>
                                          </nuxt-link>
                                          <nuxt-link :to="`${url_editar}${m.id}`"
                                             class="btn btn-sm py-1 px-2 btn-danger"
                                             v-else-if="m.estado === 'OBSERVADO'">
                                             <i class="fas fa-exclamation-triangle"></i>
                                          </nuxt-link>
                                       </div>
                                    </td>
                                 </tr>
                              </tbody>
                           </table>
                        </div>
                        <nav aria-label="Page navigation example" class="enterprise-pagination-nav">
                           <ul class="pagination justify-content-center enterprise-pagination">
                              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                 <a class="page-link" href="#" @click.prevent="changePage(1)">Primero</a>
                              </li>
                              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                 <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">Anterior</a>
                              </li>
                              <li class="page-item" v-for="page in totalPages" :key="page"
                                 :class="{ active: currentPage === page }">
                                 <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
                              </li>
                              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                                 <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">Siguiente</a>
                              </li>
                              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                                 <a class="page-link" href="#" @click.prevent="changePage(totalPages)">Último</a>
                              </li>
                           </ul>
                        </nav>
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
         list: [],
         searchQuery: '',
         apiUrl: 'notificaciones',
         page: 'Administracion',
         modulo: 'Notificaciones',
         url_editar: '/panel/notificaciones/detalle/',
         currentPage: 1,
         itemsPerPage: 14
      };
   },
   methods: {
      getTipoEmision(notification) {
         if (!notification || !notification.detalle) {
            return '';
         }

         return notification.detalle.tipoEmision || '';
      },
      changePage(page) {
         if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
         }
      },
      async GET_DATA(path) {
         const res = await this.$admin.$get(path);
         res.forEach(notification => {
            try {
               notification.detalle = typeof notification.detalle === 'string'
                  ? JSON.parse(notification.detalle)
                  : (notification.detalle || {});
            } catch (e) {
               notification.detalle = {};
            }
         });
         return res;
      }
   },
   computed: {
      tipoClasses() {
         return {
            EMISION: 'emision',
            ANULACION: 'anulacion',
            MULTIPLE: 'multiple',
            MASIVO: 'masivo',
            CONTINGENCIA: 'contingencia',
            CONTINGENCIA_CAFC: 'contingencia-cafc',
            DOCUMENTO_AJUSTE: 'documento-ajuste',
         };
      },
      estadoClasses() {
         return {
            EXITO: 'exito',
            OBSERVADO: 'observado',
            CREADO: 'creado',
         };
      },
      user() {
         return this.$store.state.auth.user;
      },
      filteredList() {
         const term = (this.searchQuery || '').toString().toLowerCase();
         return this.list.filter(item => {
            const tracking = ((item && item.codigo_seguimiento) ? item.codigo_seguimiento : '').toString().toLowerCase();
            const message = ((item && item.mensaje) ? item.mensaje : '').toString().toLowerCase();
            return tracking.includes(term) || message.includes(term);
         });
      },
      totalPages() {
         return Math.ceil(this.filteredList.length / this.itemsPerPage);
      },
      paginatedList() {
         const start = (this.currentPage - 1) * this.itemsPerPage;
         const end = start + this.itemsPerPage;
         return this.filteredList.slice(start, end);
      },
      successCount() {
         return this.list.filter(item => item.estado === 'EXITO').length;
      },
      observedCount() {
         return this.list.filter(item => item.estado === 'OBSERVADO').length;
      },
      createdCount() {
         return this.list.filter(item => item.estado === 'CREADO').length;
      },
      contingencyCount() {
         return this.list.filter(item => item.detalle?.tipoEmision === 'CONTINGENCIA' || item.detalle?.tipoEmision === 'CONTINGENCIA_CAFC').length;
      }
   },
   mounted() {
      this.$nextTick(async () => {
         try {
            await Promise.all([this.GET_DATA(this.apiUrl)]).then((v) => {
               this.list = v[0];
            });
         } catch (e) {

         } finally {
            this.load = false;
         }

      });
   },
};
</script>


<style scoped>
.notification-hero {
   border-radius: 24px;
   background:
      radial-gradient(circle at top right, rgba(255, 216, 79, 0.22), transparent 26%),
      linear-gradient(135deg, #ffffff 0%, #fffaf0 100%);
}

.notification-hero-head {
   display: flex;
   align-items: flex-start;
   justify-content: space-between;
   gap: 1rem;
}

.notification-kicker {
   color: #b78916;
   font-size: 0.8rem;
   font-weight: 800;
   letter-spacing: 0.12em;
   text-transform: uppercase;
}

.notification-title {
   color: #24324d;
   font-weight: 800;
}

.notification-subtitle {
   color: #6b7a90;
   max-width: 720px;
}

.notification-badge {
   display: inline-flex;
   align-items: center;
   gap: 0.65rem;
   padding: 0.8rem 1rem;
   border-radius: 16px;
   background: #fff;
   border: 1px solid rgba(215, 224, 236, 0.9);
   color: #4a5b79;
   font-weight: 800;
   box-shadow: 0 12px 24px rgba(15, 23, 42, 0.06);
}

.notification-search-wrap {
   position: relative;
}

.notification-search-wrap i {
   position: absolute;
   left: 16px;
   top: 50%;
   transform: translateY(-50%);
   color: #94a3b8;
}

.notification-search {
   height: 54px;
   padding-left: 46px !important;
   border-radius: 16px !important;
}

.notification-stat {
   padding: 1rem 1.1rem;
   border-radius: 18px;
   background: rgba(255, 255, 255, 0.84);
   border: 1px solid rgba(223, 230, 240, 0.92);
}

.notification-stat-label {
   display: block;
   color: #7b8aa3;
   font-size: 0.84rem;
   font-weight: 700;
   margin-bottom: 0.35rem;
}

.notification-stat strong {
   color: #22314d;
   font-size: 1.5rem;
   font-weight: 800;
}

.notification-table-wrap {
   border-radius: 18px;
   overflow-x: auto;
   overflow-y: hidden;
   padding-bottom: 0.35rem;
   -webkit-overflow-scrolling: touch;
}

.notification-table {
   margin-bottom: 0;
   min-width: 1180px;
}

.notification-row-index {
   color: #94a3b8;
   font-weight: 700;
}

.notification-chip,
.notification-state,
.notification-source {
   display: inline-flex;
   align-items: center;
   justify-content: center;
   padding: 0.46rem 0.8rem;
   border-radius: 999px;
   font-size: 0.82rem;
   font-weight: 800;
   letter-spacing: 0.02em;
   white-space: nowrap;
}

.notification-state.exito {
   background: #ecfdf3;
   color: #157347;
}

.notification-state.observado {
   background: #fff5f5;
   color: #c2410c;
}

.notification-state.creado {
   background: #eff6ff;
   color: #1d4ed8;
}

.notification-source {
   background: #f8fafc;
   color: #475569;
   border: 1px solid #e2e8f0;
}

.notification-tracking {
   font-family: Consolas, Monaco, monospace;
   color: #334155;
   font-weight: 700;
}

.notification-message {
   max-width: 340px;
   white-space: nowrap;
   overflow: hidden;
   text-overflow: ellipsis;
   color: #4b5b76;
}

.emision {
   background-color: #ecfeff;
   color: #0f766e;
}

.anulacion {
   background-color: #fff1f2;
   color: #be123c;
}

.multiple {
   background-color: #f0fdf4;
   color: #15803d;
}

.masivo {
   background-color: #fff7ed;
   color: #c2410c;
}

.contingencia {
   background-color: #fff8e1;
   color: #a16207;
}

.contingencia-cafc {
   background-color: #faf5ff;
   color: #7e22ce;
}

.documento-ajuste {
   background-color: #eff6ff;
   color: #2563eb;
}

.tipo-generico {
   background-color: #f1f5f9;
   color: #37474f;
}

@media (max-width: 991px) {
   .notification-hero-head {
      flex-direction: column;
   }
}
</style>

