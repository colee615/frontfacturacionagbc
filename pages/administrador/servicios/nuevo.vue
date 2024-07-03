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
                                 <input type="text" name="" v-model="model.unidadMedida" class="form-control" id="" />
                              </div>
                              <div class="form-group col-12">
                                 <label for="">Código SIN</label>
                                 <input type="text" name="" v-model="model.codigoSin" class="form-control" id="" />
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
   name: "IndexPage",
   head() {
      return {
         title: this.modulo,
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
         modulo: 'Servicios'
      };
   },
   methods: {

   },
   computed: {
      user() {
         return this.$store.state.auth.user;
      },
   },
   mounted() {
      this.$nextTick(async () => {
         if (this.user.role !== 'administrador') {
            this.$router.push('/'); // Redirige a la página principal
         } else {
            try {
               // Puedes agregar aquí alguna lógica adicional que necesites al cargar el componente
            } catch (e) {

            } finally {
               // Y aquí cualquier acción de limpieza o finalización
            }
         }
      });
   },
};
</script>
