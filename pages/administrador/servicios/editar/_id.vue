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
                              <div slot="body" class="row">
                                 <div class="form-group col-12">
                                    <label for="">Nombre</label>
                                    <input type="text" name="" v-model="model.nombre" class="form-control" id="" />
                                 </div>
                                 <div class="form-group col-12">
                                    <label for="">Codigo</label>
                                    <input type="text" name="" v-model="model.codigo" class="form-control" id="" />
                                 </div>
                                 <div class="form-group col-12">
                                    <label for="">Descripción</label>
                                    <input type="text" name="" v-model="model.descripcion" class="form-control" id="" />
                                 </div>
                                 <div class="form-group col-12">
                                    <label for="">Precio Unitario</label>
                                    <input type="number" name="" v-model="model.precioUnitario" class="form-control"
                                       id="" />
                                 </div>

                                 <div class="form-group col-12">
                                    <label for="">Unidad de Medida</label>
                                    <input type="text" name="" v-model="model.unidadMedida" class="form-control"
                                       id="" />
                                 </div>
                                 <div class="form-group col-12">
                                    <label for="">Código SIN</label>
                                    <input type="text" name="" v-model="model.codigoSin" class="form-control" id="" />
                                 </div>
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
            codigo: '',
            descripcion: '',
            precioUnitario: '',
            nombre: '',
            unidadMedida: '',
            codigoSin: '',
         },
         apiUrl: 'servicios',
         page: 'Servicios',
         modulo: 'Servicios',
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
               this.GET_DATA(this.apiUrl + "/" + this.$route.params.id),
            ]).then((v) => {
               this.model = v[0];
            });
         } catch (e) {
            console.log(e);
         } finally {
            this.load = false;
         }
      });
   },
};
</script>
