<template>
   <div>
      <AdminTemplate :page="page" :modulo="modulo">
         <div slot="body">
            <div class="row justify-content-center">
               <div class="col-sm-8 col-12">
                  <div class="card">
                     <div class="card-header">
                        <h3>Agregar</h3>
                     </div>
                     <div class="card-body">
                        <CrudCreate :model="model" :apiUrl="apiUrl">
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
                        </CrudCreate>
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
            await Promise.all([this.GET_DATA('sucursales')]).then((v) => {
               this.sucursales = v[0];

               if (this.sucursales.length) {
                  this.model.sucursale_id = this.sucursales[0].id;
               }
            });

         } catch (e) {
            console.log(e);
         } finally {
            this.load = false
         }
      });
   },

}
</script>
