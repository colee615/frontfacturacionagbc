<template>
   <div>
      <JcLoader :load="load"></JcLoader>
      <AdminTemplate :page="page" :modulo="modulo">
         <div slot="body" class="enterprise-page-shell">
            <div class="row">
               <div class="col-12 mb-4">
                  <div class="card notification-hero enterprise-filter-card">
                     <div class="card-body">
                        <div class="notification-hero-head">
                           <div>
                              <p class="notification-kicker mb-2">Centro de Seguimiento</p>
                              <h4 class="notification-title mb-2">Notificaciones de facturacion</h4>
                              <p class="notification-subtitle mb-0">Monitorea emisiones, contingencias y respuestas de SUFE en una sola vista.</p>
                           </div>
                           <div class="notification-badge">
                              <i class="fas fa-receipt"></i>
                              <span>{{ filteredList.length }} registros</span>
                           </div>
                        </div>
                        <div class="notification-search-wrap mt-4">
                           <i class="fas fa-search"></i>
                           <input
                              v-model="searchQuery"
                              type="text"
                              class="form-control notification-search"
                              placeholder="Buscar por codigo de seguimiento o mensaje"
                           >
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
                  <div class="card enterprise-table-card enterprise-content-card">
                     <div class="card-body">
                        <div v-if="filteredList.length" class="table-wrap notification-table-wrap enterprise-table-wrap">
                           <table class="notification-table enterprise-table">
                              <thead>
                                 <tr>
                                    <th>
                                       <span class="head-label"><i class="fas fa-hashtag"></i><span>#</span></span>
                                    </th>
                                    <th>
                                       <span class="head-label"><i class="fas fa-tags"></i><span>Tipo</span></span>
                                    </th>
                                    <th>
                                       <span class="head-label"><i class="fas fa-toggle-on"></i><span>Estado</span></span>
                                    </th>
                                    <th>
                                       <span class="head-label"><i class="fas fa-industry"></i><span>Fuente</span></span>
                                    </th>
                                    <th>
                                       <span class="head-label"><i class="fas fa-search"></i><span>Seguimiento</span></span>
                                    </th>
                                    <th>
                                       <span class="head-label"><i class="fas fa-calendar-alt"></i><span>Fecha</span></span>
                                    </th>
                                    <th>
                                       <span class="head-label"><i class="fas fa-comment-dots"></i><span>Mensaje</span></span>
                                    </th>
                                    <th>
                                       <span class="head-label"><i class="fas fa-cog"></i><span>Acciones</span></span>
                                    </th>
                                 </tr>
                              </thead>
                              <tbody>
                                 <tr v-for="(m, i) in paginatedList" :key="m.id">
                                    <td>
                                       <strong class="notification-row-index">{{ (currentPage - 1) * itemsPerPage + i + 1 }}</strong>
                                    </td>
                                    <td>
                                       <span class="notification-chip" :class="tipoClasses[getTipoEmision(m)] || 'tipo-generico'">
                                          {{ getTipoEmision(m) || 'SIN TIPO' }}
                                       </span>
                                    </td>
                                    <td>
                                       <span class="notification-state" :class="estadoClasses[m.estado] || ''">{{ m.estado }}</span>
                                    </td>
                                    <td>
                                       <span class="notification-source">{{ m.fuente }}</span>
                                    </td>
                                    <td>
                                       <div class="notification-tracking">{{ m.codigo_seguimiento }}</div>
                                    </td>
                                    <td>
                                       <strong class="notification-date">{{ m.fecha }}</strong>
                                    </td>
                                    <td>
                                       <div class="notification-message">{{ m.mensaje }}</div>
                                    </td>
                                    <td>
                                       <div class="notification-action-group">
                                          <nuxt-link
                                             v-if="m.estado === 'EXITO'"
                                             :to="`${url_editar}${m.id}`"
                                             class="notification-action notification-action-success"
                                             title="Ver detalle"
                                          >
                                             <i class="fas fa-search"></i>
                                          </nuxt-link>
                                          <nuxt-link
                                             v-else-if="m.estado === 'OBSERVADO'"
                                             :to="`${url_editar}${m.id}`"
                                             class="notification-action notification-action-danger"
                                             title="Ver detalle"
                                          >
                                             <i class="fas fa-exclamation-triangle"></i>
                                          </nuxt-link>
                                       </div>
                                    </td>
                                 </tr>
                              </tbody>
                           </table>

                           <div class="notification-table-footer">
                              <p class="footer-copy">
                                 Mostrando {{ rangeStart }} a {{ rangeEnd }} de {{ filteredList.length }} notificaciones
                              </p>

                              <div class="notification-pager">
                                 <button class="pager-btn" type="button" :disabled="currentPage === 1" @click="changePage(1)">
                                    <i class="fas fa-angle-double-left"></i>
                                 </button>
                                 <button class="pager-btn" type="button" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
                                    <i class="fas fa-angle-left"></i>
                                 </button>
                                 <button
                                    v-for="page in visiblePages"
                                    :key="page"
                                    type="button"
                                    class="pager-btn"
                                    :class="{ active: currentPage === page }"
                                    @click="changePage(page)"
                                 >
                                    {{ page }}
                                 </button>
                                 <button class="pager-btn" type="button" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
                                    <i class="fas fa-angle-right"></i>
                                 </button>
                                 <button class="pager-btn" type="button" :disabled="currentPage === totalPages" @click="changePage(totalPages)">
                                    <i class="fas fa-angle-double-right"></i>
                                 </button>
                              </div>
                           </div>
                        </div>

                        <div v-else class="empty-state notification-empty-state">
                           <h3>Sin resultados</h3>
                           <p>No encontramos notificaciones con ese criterio de busqueda.</p>
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
         if (page < 1 || page > this.totalPages) {
            return;
         }

         this.currentPage = page;
      },
      parseNotificationDate(value) {
         if (!value) {
            return 0;
         }

         const raw = String(value).trim();
         const normalized = raw.includes(' ') && !raw.includes('T')
            ? raw.replace(' ', 'T')
            : raw;
         const parsed = Date.parse(normalized);

         if (!Number.isNaN(parsed)) {
            return parsed;
         }

         const fallback = new Date(raw);
         return Number.isNaN(fallback.getTime()) ? 0 : fallback.getTime();
      },
      sortNotifications(items) {
         return [...items].sort((a, b) => {
            const dateDiff = this.parseNotificationDate(b?.fecha) - this.parseNotificationDate(a?.fecha);
            if (dateDiff !== 0) {
               return dateDiff;
            }

            return Number(b?.id || 0) - Number(a?.id || 0);
         });
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
         return Math.max(1, Math.ceil(this.filteredList.length / this.itemsPerPage));
      },
      paginatedList() {
         const start = (this.currentPage - 1) * this.itemsPerPage;
         const end = start + this.itemsPerPage;
         return this.filteredList.slice(start, end);
      },
      rangeStart() {
         if (!this.filteredList.length) {
            return 0;
         }

         return ((this.currentPage - 1) * this.itemsPerPage) + 1;
      },
      rangeEnd() {
         return Math.min(this.currentPage * this.itemsPerPage, this.filteredList.length);
      },
      visiblePages() {
         const total = this.totalPages;
         const current = this.currentPage;
         const start = Math.max(1, current - 2);
         const end = Math.min(total, start + 4);
         const pages = [];

         for (let page = start; page <= end; page += 1) {
            pages.push(page);
         }

         return pages;
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
               this.list = this.sortNotifications(Array.isArray(v[0]) ? v[0] : []);
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
   border: 1px solid #edf1f6;
   border-radius: 16px;
   overflow: hidden;
   background: #ffffff;
}

.notification-table {
   width: 100%;
   min-width: 1120px;
   border-collapse: collapse;
   background: #fff;
}

.notification-table thead th {
   padding: 0.95rem 0.9rem;
   text-align: left;
   font-size: 0.83rem;
   font-weight: 700;
   color: #495468;
   background: linear-gradient(180deg, #ffffff 0%, #fafbfd 100%);
   border-bottom: 1px solid #edf1f6;
}

.head-label {
   display: inline-flex;
   align-items: center;
   gap: 0.5rem;
}

.head-label i {
   color: #7d8798;
   font-size: 0.95rem;
}

.notification-table tbody td {
   padding: 1rem 0.9rem;
   border-bottom: 1px solid #edf1f6;
   color: #33415c;
   vertical-align: middle;
}

.notification-table tbody tr:last-child td {
   border-bottom: 0;
}

.notification-table tbody tr:hover {
   background: #fbfcff;
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

.notification-date {
   color: #223658;
   font-weight: 700;
}

.notification-message {
   max-width: 340px;
   white-space: nowrap;
   overflow: hidden;
   text-overflow: ellipsis;
   color: #4b5b76;
}

.notification-action-group {
   display: flex;
   gap: 0.45rem;
   flex-wrap: wrap;
}

.notification-action {
   width: 36px;
   height: 36px;
   display: inline-flex;
   align-items: center;
   justify-content: center;
   border-radius: 12px;
   border: 1px solid transparent;
   background: #fff;
   transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.notification-action:hover {
   transform: translateY(-1px);
}

.notification-action-success {
   color: #3442a8;
   border-color: #d9defd;
   background: #eef2ff;
}

.notification-action-danger {
   color: #b42318;
   border-color: #f5b3ad;
   background: #fff1f0;
}

.notification-action i {
   font-size: 0.82rem;
}

.notification-table-footer {
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: 1rem;
   padding: 0.95rem 1rem;
   border-top: 1px solid #edf1f6;
   background: #fff;
}

.footer-copy {
   margin: 0;
   color: #6f7c92;
   font-size: 0.9rem;
}

.notification-pager {
   display: flex;
   align-items: center;
   gap: 0.45rem;
   flex-wrap: wrap;
}

.pager-btn {
   min-width: 36px;
   height: 36px;
   padding: 0 0.7rem;
   border: 1px solid #e5eaf2;
   border-radius: 8px;
   background: #fff;
   color: #627089;
   font-weight: 700;
   transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.pager-btn:hover:not(:disabled) {
   transform: translateY(-1px);
   border-color: #c8d7ee;
   box-shadow: 0 8px 16px rgba(29, 56, 104, 0.08);
}

.pager-btn.active {
   border-color: #ff6f6f;
   color: #e04f4f;
   box-shadow: inset 0 0 0 1px rgba(224, 79, 79, 0.08);
}

.pager-btn:disabled {
   opacity: 0.45;
   cursor: not-allowed;
}

.notification-empty-state {
   padding: 1.8rem 1rem;
   text-align: center;
}

.notification-empty-state h3 {
   margin: 0;
   color: #1d3360;
   font-size: 1.35rem;
   font-weight: 800;
}

.notification-empty-state p {
   margin: 0.45rem 0 0;
   color: #6f7c92;
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

   .notification-table-footer {
      flex-direction: column;
      align-items: stretch;
   }

   .notification-pager {
      justify-content: center;
   }
}
</style>
