<template>
   <div>
      <JcLoader :load="load"></JcLoader>
      <AdminTemplate :page="page" :modulo="modulo">
         <div slot="body">
            <div class="row justify-content-center">
               <div class="col-sm-8 col-12">
                  <div class="card">
                     <div class="card-header">
                        <h3>Actualizar</h3>
                     </div>
                     <div class="card-body">
                        <CrudUpdate :model="model" :apiUrl="apiUrl">
                           <div slot="body" class="row">
                              <div class="form-group col-12">
                                 <label for="ubicacion">Nombre</label>
                                 <input type="text" v-model="model.name" class="form-control" id="name">
                              </div>
                              <div class="form-group col-6">
                                 <label for="">Sucursal</label>
                                 <select name="" id="" class="form-control" v-model="model.sucursale_id">
                                    <option v-for="m in sucursales" :value="m.id">{{ m.ubicacion }}</option>
                                 </select>
                              </div>
                              <div class="form-group col-12">
                                 <label for="email">Email</label>
                                 <input type="text" v-model="model.email" class="form-control" id="email">
                              </div>
                              <div class="form-group col-12">
                                 <label for="password">Password</label>
                                 <input type="password" v-model="model.password" class="form-control" id="password">
                              </div>
                           </div>
                        </CrudUpdate>
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
         title: "Demo",
      };
   },
   data() {
      return {
         model: {
            name: '',
            email: '',
            password: '',
            sucursale_id: '',
         },
         sucursales: [],
         apiUrl: 'cajeros',
         page: 'Administracion',
         modulo: 'Cajeros',
         load: true,
      }
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
            await Promise.all([
               this.GET_DATA(this.apiUrl + "/" + this.$route.params.id), this.GET_DATA('sucursales'),
            ]).then((v) => {
               this.model = v[0];
               this.sucursales = v[1];

            });
         } catch (e) {

         } finally {
            this.load = false;
         }
      });
   },
};
</script>
