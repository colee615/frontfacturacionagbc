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
                                 <label for="razonSocial">Razon Social</label>
                                 <input type="text" v-model="model.razonSocial" class="form-control" id="razonSocial">
                              </div>
                              <div class="form-group col-12">
                                 <label for="documentoIdentidad">Documento de Identidad</label>
                                 <input type="text" v-model="model.documentoIdentidad" class="form-control"
                                    id="documentoIdentidad">
                              </div>
                              <div class="form-group col-12">
                                 <label for="complemento">Complemento</label>
                                 <input type="text" v-model="model.complemento" class="form-control" id="complemento">
                              </div>
                              <div class="form-group col-12">
                                 <label for="tipoDocumentoIdentidad">Tipo Documento de Identidad</label>
                                 <select v-model="model.tipoDocumentoIdentidad" class="form-control"
                                    id="tipoDocumentoIdentidad">
                                    <option value="1">CI - Cédula de identidad</option>
                                    <option value="2">CEX - Cédula de identidad de extranjero</option>
                                    <option value="3">PAS - Pasaporte</option>
                                    <option value="4">OD - Otro Documento de Identidad</option>
                                    <option value="5">NIT - Número de identificación Tributaria</option>
                                 </select>
                              </div>

                              <div class="form-group col-12">
                                 <label for="correo">Correo</label>
                                 <input type="text" v-model="model.correo" class="form-control" id="correo">
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
            razonSocial: '',
            documentoIdentidad: '',
            complemento: '',
            tipoDocumentoIdentidad: '',
            correo: '',
            codigoCliente: '',
         },
         apiUrl: 'clientes',
         page: 'Administracion',
         modulo: 'Clientes',
         load: true,
      }
   },
   methods: {
      async GET_DATA(path) {
         const res = await this.$admin.$get(path);
         return res;
      },
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
               await Promise.all([
                  this.GET_DATA(this.apiUrl + "/" + this.$route.params.id),
               ]).then((v) => {
                  this.model = v[0];
               });
            } catch (e) {

            } finally {
               this.load = false;

            }
         }
      });
   },
};
</script>
