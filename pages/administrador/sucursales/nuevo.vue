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
                                 <label for="ubicacion">Ubicación</label>
                                 <input type="text" v-model="model.ubicacion" class="form-control" id="ubicacion">
                              </div>
                              <div class="form-group col-12">
                                 <label for="codigosucursal">Código de Sucursal</label>
                                 <input type="text" v-model="model.codigosucursal" class="form-control"
                                    id="codigosucursal">
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
            ubicacion: '',
            codigosucursal: ''
         },
         apiUrl: 'sucursales',
         page: 'Administracion',
         modulo: 'Sucursales',
         load: true,
      }
   },

   methods: {

   },
   computed: {
      user() {
         return this.$store.state.auth.user;
      },
   },
   mounted() {
      if (this.user.role !== 'administrador') {
         this.$router.push('/'); // Redirige a la página principal
      }
   },

}
</script>
