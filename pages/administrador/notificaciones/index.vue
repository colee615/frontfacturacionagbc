<template>
   <div>
      <JcLoader :load="load"></JcLoader>
      <AdminTemplate :page="page" :modulo="modulo">
         <div slot="body">
            <div class="row justify-content-end">
               <div class="col-2">
               </div>
               <div class="col-12">
                  <div class="card">
                     <div class="card-body">
                        <table class="table">
                           <thead>
                              <tr>

                                 <th class="py-0 px-1">#</th>
                                 <th class="py-0 px-1">ESTADO</th>
                                 <th class="py-0 px-1">FUENTE</th>
                                 <th class="py-0 px-1">CODIGO SEGUIMIENTO</th>
                                 <th class="py-0 px-1">FECHA</th>
                                 <th class="py-0 px-1">MENSAJE</th>
                                 <th class="py-0 px-1"></th>
                              </tr>
                           </thead>
                           <tbody>
                              <tr v-for="(m, i) in list" :key="m.id">
                                 <td class="py-0 px-1">{{ i + 1 }}</td>
                                 <td class="py-0 px-1">{{ m.estado }}</td>
                                 <td class="py-0 px-1">{{ m.fuente }}</td>
                                 <td class="py-0 px-1">{{ m.codigo_seguimiento }}</td>
                                 <td class="py-0 px-1">{{ m.fecha }}</td>
                                 <td class="py-0 px-1">{{ m.mensaje }}</td>
                                 <td class="py-0 px-1">
                                    <div class="btn-group">
                                       <nuxt-link :to="`${url_editar}${m.id}`" class="btn btn-success btn-sm py-1 px-2"
                                          v-if="m.estado === 'EXITO'">
                                          <i class="fas fa-search"></i>
                                       </nuxt-link>

                                       <nuxt-link :to="`${url_editar}${m.id}`" class="btn btn-sm py-1 px-2 btn-danger"
                                          v-else-if="m.estado === 'OBSERVADO'">
                                          <i class="fas fa-exclamation-triangle"></i>
                                       </nuxt-link>
                                    </div>
                                 </td>
                              </tr>
                           </tbody>
                        </table>
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
         apiUrl: 'notificaciones',
         page: 'Administracion',
         modulo: 'Notificaciones',
         url_editar: '/administrador/notificaciones/detalle/',

      };
   },
   methods: {
      async GET_DATA(path) {
         const res = await this.$admin.$get(path);
         return res
      },
   },
   mounted() {
      this.$nextTick(async () => {
         try {
            await Promise.all([this.GET_DATA(this.apiUrl)]).then((v) => {
               this.list = v[0]
            })
         } catch (e) {

         } finally {
            this.load = false
         }
      });
   },
};
</script>
