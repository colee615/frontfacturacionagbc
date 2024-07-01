<template>
   <div>
      <JcLoader :load="load"></JcLoader>
      <AdminTemplate :page="page" :modulo="modulo">
         <div slot="body">
            <div class="row justify-content-end">
               <div class="col-12 col-sm-7">
                  <div class="row">
                     <div class="col-12">
                        <div class="card bg-gradient-dark">
                           <div class="card-header bg-transparent py-2 px-3">
                              <div class="row">
                                 <div class="col-lg-4 col-md-6 col-12">
                                    <div class="input-group input-group-lg">
                                       <span class="input-group-text text-white bg-transparent border-0">
                                          <i class="ni ni-archive-2 text-lg" aria-hidden="true"></i>
                                       </span>
                                       <input type="text" class="form-control bg-transparent border-0 text-white"
                                          placeholder="Buscar..." />
                                    </div>
                                 </div>

                              </div>
                           </div>
                        </div>
                     </div>
                     <div class="col-12 py-2"
                        style="min-height: 60vh;max-height: 60vh;overflow-y: scroll;overflow-x: none;">
                        <div class="row">
                           <div class="col-3" v-for="m in servicios">
                              <PostServicio :servicio="m" @AddCarrito="AddCarrito"></PostServicio>

                           </div>
                        </div>
                     </div>
                     <div class="col-xl-12">
                        <div class="card">
                           <div class="card-body d-flex p-3">
                              <div class="nav-wrapper position-relative ms-auto w-50">
                                 <ul class="nav nav-pills nav-fill p-1" role="tablist">
                                    <li class="nav-item active" role="presentation">
                                       <a class="nav-link mb-0 px-0 py-1" data-bs-toggle="tab" href="#cam1" role="tab"
                                          aria-controls="cam1" aria-selected="true">
                                       </a>
                                    </li>
                                 </ul>
                              </div>

                           </div>
                        </div>
                     </div>
                  </div>
               </div>
               <div class="col-sm-5">
                  <div class="card card-pricing">
                     <div class="card-header bg-gradient-dark text-center pt-4 pb-5 position-relative">
                        <div class="z-index-1 position-relative">
                           <h1 class="text-white mt-2 mb-0"><small></small>{{ totalCarrito }}</h1>

                           <h6 class="text-white">Total</h6>
                        </div>
                     </div>
                     <div class="position-relative mt-n5" style="height: 50px">
                        <div class="position-absolute w-100">
                           <svg class="waves waves-sm" xmlns="http://www.w3.org/2000/svg"
                              xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 24 150 40"
                              preserveAspectRatio="none" shape-rendering="auto">
                              <defs>
                                 <path id="card-wave"
                                    d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"></path>
                              </defs>
                              <g class="moving-waves">
                                 <use xlink:href="#card-wave" x="48" y="-1" fill="rgba(255,255,255,0.30"></use>
                                 <use xlink:href="#card-wave" x="48" y="3" fill="rgba(255,255,255,0.35)"></use>
                                 <use xlink:href="#card-wave" x="48" y="5" fill="rgba(255,255,255,0.25)"></use>
                                 <use xlink:href="#card-wave" x="48" y="8" fill="rgba(255,255,255,0.20)"></use>
                                 <use xlink:href="#card-wave" x="48" y="13" fill="rgba(255,255,255,0.15)"></use>
                                 <use xlink:href="#card-wave" x="48" y="16" fill="rgba(255,255,255,0.99)"></use>
                              </g>
                           </svg>
                        </div>
                     </div>
                     <div class="card-body text-center p-3">
                        <div class="d-flex align-items-center px-2">
                           <h6>CARRITO</h6>
                           <button type="button"
                              class="btn btn-icon-only btn-rounded btn-outline-dark mb-0 ms-2 btn-sm d-flex align-items-center justify-content-center ms-auto"
                              data-bs-toggle="tooltip" data-bs-placement="bottom" @click="Clean()">
                              <i class="fas fa-trash" aria-hidden="true"></i>
                           </button>
                        </div>
                        <div class="table-responsive p-0" style="min-height: 30vh">
                           <table class="table align-items-center justify-content-center mb-0">
                              <thead>
                                 <tr>
                                    <th
                                       class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2 text-start">
                                       Artículo
                                    </th>
                                    <th
                                       class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2 text-start">
                                       Cantidad
                                    </th>
                                    <th
                                       class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2 text-start">
                                       Total
                                    </th>
                                    <th
                                       class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">
                                    </th>
                                 </tr>
                              </thead>
                              <tbody>
                                 <tr v-for="(m, i) in carrito">
                                    <td class="text-start">
                                       <p class="text-xxs font-weight-bold mb-0 text-start">
                                          {{ m.servicio.descripcion }}
                                       </p>
                                    </td>
                                    <td class="text-start">
                                       <p class="text-xxs font-weight-bold mb-0 text-start">
                                          {{ m.cantidad }}
                                       </p>
                                    </td>
                                    <td class="text-start">
                                       <p class="text-xxs font-weight-bold mb-0 text-start">
                                          {{ Number(m.cantidad * m.precio).toFixed(2) }}
                                       </p>
                                    </td>
                                    <td>
                                       <div class="input-group input-group-sm">
                                          <button class="btn btn-outline-primary mb-0 btn-sm" type="button"
                                             @click="[modalEdit = true, item = m]">
                                             <i class="fas fa-pen"></i>
                                          </button>
                                          <button class="btn btn-outline-danger mb-0 btn-sm" type="button"
                                             @click="EliminarItem(i)">
                                             <i class="fas fa-times"></i>
                                          </button>
                                       </div>
                                    </td>
                                 </tr>
                              </tbody>
                           </table>
                        </div>
                        <a href="javascript:void(0);" class="btn bg-gradient-dark w-100 mt-4 mb-0"
                           @click="CheckAndSave">
                           <i class="fas fa-save mx-2"></i> GUARDAR VENTA
                        </a>

                     </div>
                  </div>
               </div>
               <div class="modal fade" :class="modalEdit ? 'showModal' : ''" id="AjusteModal" tabindex="-1"
                  role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                  <div class="modal-dialog modal-dialog-centered" role="document">
                     <div class="modal-content">
                        <div class="modal-header">
                           <h5 class="modal-title" id="exampleModalLabel">
                              Editar servicio
                           </h5>
                           <button type="button" class="btn-close text-dark" @click="modalEdit = false"
                              data-bs-dismiss="modal" aria-label="Close">
                              <span aria-hidden="true">&times;</span>
                           </button>
                        </div>
                        <div class="modal-body">
                           <div class="row">
                              <div class="col-12">
                                 <div class="form-group has-success">
                                    <label for="">Servicio</label>
                                    <input type="text" placeholder="" disabled class="form-control"
                                       :value="item.servicio.nombre" />
                                 </div>
                              </div>


                              <div class="col-6">
                                 <div class="form-group has-success">
                                    <label for="">Precio</label>
                                    <input type="text" placeholder="" class="form-control"
                                       v-model.number="item.precio" />
                                 </div>
                              </div>
                              <div class="col-6">
                                 <div class="form-group has-success">
                                    <label for="">Cantidad</label>
                                    <input type="text" placeholder="" class="form-control"
                                       v-model.number="item.cantidad" />
                                 </div>
                              </div>
                           </div>
                        </div>
                        <div class="modal-footer">
                           <button type="button" @click="modalEdit = false" class="btn bg-gradient-secondary w-100"
                              data-bs-dismiss="modal">
                              Confirmar
                           </button>
                        </div>
                     </div>
                  </div>
               </div>

               <div class="modal fade" id="clienteModal" tabindex="-1" aria-labelledby="clienteModalLabel"
                  aria-hidden="true">
                  <div class="modal-dialog modal-lg">
                     <div class="modal-content">

                        <div class="modal-body">
                           <div class="input-group mb-3">
                              <select class="form-control" v-model="filtroTipoDocumento">
                                 <option value="">Todos</option>
                                 <option value="1">CI - Cédula de identidad</option>
                                 <option value="2">CEX - Cédula de identidad de extranjero</option>
                                 <option value="3">PAS - Pasaporte</option>
                                 <option value="4">OD - Otro Documento de Identidad</option>
                                 <option value="5">NIT - Número de identificación Tributaria</option>
                              </select>
                              <input type="text" class="form-control" placeholder="Buscar cliente..."
                                 v-model="filtroDocumentoIdentidad" autofocus>

                           </div>

                           <table class="table" v-if="filteredClientes.length > 0">
                              <thead>
                                 <tr>

                                    <th class="py-0 px-1">CLIENTE - NOMBRE</th>
                                    <th class="py-0 px-1">DOCUMENTO ID</th>
                                    <th class="py-0 px-1">TIPO DOCUMENTO</th>
                                    <th class="py-0 px-1"></th>
                                 </tr>
                              </thead>
                              <tbody>
                                 <tr v-for="m in filteredClientes" :key="m.id">

                                    <td>{{ m.codigoCliente }} - {{ m.razonSocial }}</td>
                                    <td>{{ m.documentoIdentidad }} </td>
                                    <td>{{ tipoDocumentoMap[m.tipoDocumentoIdentidad] }} </td>
                                    <td>
                                       <button type="button" class="btn btn-success"
                                          style="font-size: 8px; padding: 10px 20px; border-radius: 5px; background-color: #4CAF50; color: white;"
                                          data-bs-dismiss="modal" aria-label="Seleccionar Cliente"
                                          @click="selectCliente(m.id)">
                                          <i class="fa fa-user-plus" aria-hidden="true"></i> Seleccionar cliente
                                       </button>
                                    </td>
                                 </tr>
                              </tbody>
                           </table>

                           <div v-else>
                              <p>No se encontraron clientes. ¿Desea agregar uno nuevo?</p>
                              <button class="btn btn-primary" @click="showAddClienteForm = true">Agregar
                                 Cliente</button>
                           </div>

                           <div v-if="showAddClienteForm">

                              <div slot="body" class="row">
                                 <div class="form-group col-12">
                                    <label for="razonSocial">Razon Social</label>
                                    <input type="text" v-model="model.razonSocial" class="form-control"
                                       id="razonSocial">
                                 </div>
                                 <div class="form-group col-12">
                                    <label for="tipoDocumentoIdentidad">Tipo Documento de Identidad</label>
                                    <select class="form-control" v-model="filtroTipoDocumento">
                                       <option value="">Todos</option>
                                       <option value="1">CI - Cédula de identidad</option>
                                       <option value="2">CEX - Cédula de identidad de extranjero</option>
                                       <option value="3">PAS - Pasaporte</option>
                                       <option value="4">OD - Otro Documento de Identidad</option>
                                       <option value="5">NIT - Número de identificación Tributaria</option>
                                    </select>

                                 </div>
                                 <div class="form-group col-12">
                                    <label for="documentoIdentidad">Documento de Identidad</label>
                                    <input type="text" v-model="model.documentoIdentidad" class="form-control"
                                       id="documentoIdentidad">
                                 </div>
                                 <div class="form-group col-12">
                                    <label for="complemento">Complemento</label>
                                    <input type="text" v-model="model.complemento" class="form-control"
                                       id="complemento">
                                 </div>

                                 <div class="form-group col-12">
                                    <label for="correo">Correo</label>
                                    <input type="text" v-model="model.correo" class="form-control" id="correo">
                                 </div>

                                 <button class="btn btn-dark w-100" @click="Savecliente()">
                                    Guardar
                                 </button>
                              </div>

                           </div>
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

import Swal from 'sweetalert2';


export default {
   head() {
      return {
         title: this.modulo,
      };
   },

   data() {
      return {
         filtroTipoDocumento: '',
         filtroDocumentoIdentidad: '',
         model: {
            razonSocial: '',
            documentoIdentidad: '',
            complemento: '',
            tipoDocumentoIdentidad: '',
            correo: '',
            codigoCliente: '',
         },

         apiUrl: 'clientes',
         showAddClienteForm: false,
         nuevoCliente: {
            nombre: '',
            documentoIdentidad: '',
            // Otros campos necesarios
         },
         tipoDocumentoMap: {
            1: 'CI - Cédula de identidad',
            2: 'CEX - Cédula de identidad de extranjero',
            3: 'PAS - Pasaporte',
            4: 'OD - Otro Documento de Identidad',
            5: 'NIT - Número de identificación Tributaria',
         },
         user: {},
         modulo: "Nueva venta",
         page: "ventas",
         load: false,
         modalEdit: false,
         servicios: [],
         carrito: [],
         clientes: [],
         cliente: null,

         sucursals: [],
         filtroCliente: '',
         sucursal: {

         },
         item: {
            servicio: {
               nombre: ''
            },
            cantidad: 0,
            precio: 0,
         },
         user: {},
      };

   },

   computed: {
      totalCarrito() {
         return this.carrito.reduce((a, b) => a + (b.cantidad * b.precio), 0);
      },
      filteredClientes() {
         // Verifica que this.clientes esté definido y sea un arreglo
         if (!this.clientes || !Array.isArray(this.clientes)) {
            return [];
         }
         return this.clientes.filter(cliente => {
            // Comprueba si el tipo de documento es válido
            const tipoValido = this.filtroTipoDocumento ?
               parseInt(cliente.tipoDocumentoIdentidad) === parseInt(this.filtroTipoDocumento) : true;

            // Comprueba si el documento de identidad es válido
            const docValido = this.filtroDocumentoIdentidad ?
               cliente.documentoIdentidad.toLowerCase().includes(this.filtroDocumentoIdentidad.toLowerCase()) : true;

            return tipoValido && docValido;
         });
      },

   },
   methods: {
      async guardarCliente() {

         const res = await this.$admin.$post('clientes', this.nuevoCliente);
         if (res.success) {
            this.clientes.push(res.cliente);
            this.showAddClienteForm = false;
            this.filtroCliente = '';
            new bootstrap.Modal(document.getElementById('clienteModal')).hide();
         } else {

            alert("Error al guardar el cliente.");
         }
      },
      CheckAndSave() {
         if (this.carrito.length === 0) {
            // Si el carrito está vacío, mostrar alerta
            this.$swal.fire({
               icon: 'error',
               title: 'Carrito Vacío',
               text: 'Debe agregar al menos un elemento al carrito para poder guardar.',
               confirmButtonText: 'Entendido'
            });
         } else if (!this.cliente) {

            new bootstrap.Modal(document.getElementById('clienteModal')).show();
         } else {

            this.ConfirmAndSave();
         }
      },

      ConfirmAndSave() {
         this.$swal.fire({
            title: '¿Estás seguro de realizar la venta?',
            showDenyButton: true,
            confirmButtonText: 'Sí, guardar',
            denyButtonText: `No, cancelar`,
         }).then((result) => {
            if (result.isConfirmed) {
               this.Save();
            }
         });
      },
      selectCliente(id) {
         this.cliente = id;
         this.ConfirmAndSave();
      },
      async GET_DATA(path) {
         const res = await this.$admin.$get(path);
         return res;
      },
      cerrarModalCliente() {

         this.nuevoCliente = {
            nombre: '',
            documentoIdentidad: '',
         };
         this.showAddClienteForm = false; l

      },
      async Savecliente() {
         this.load = true;
         try {
            const res = await this.$admin.$post(this.apiUrl, this.model);

            this.$swal
               .fire({
                  title: "Guardado!",
                  showDenyButton: false,
                  showCancelButton: false,
                  confirmButtonText: "Ok",
               })
               .then(async (result) => {
                  if (result.isConfirmed) {
                     this.cerrarModalCliente();
                     await this.Datos();
                  }
               });
         } catch (e) {

         } finally {
            this.load = false;
         }
      },
      async Datos() {
         try {
            await Promise.all([this.GET_DATA('servicios'), this.GET_DATA('clientes'),]).then((v) => {
               this.servicios = v[0];
               this.clientes = v[1];

            });
         } catch (e) {

         }
      },

      AddCarrito(servicio) {
         let id = servicio.id
         let buscarRegistro = this.carrito.filter((i) => i.servicio.id == id)
         if (buscarRegistro.length > 0) {
            let indice = this.carrito.findIndex((i) => i.servicio.id == id)
            if (this.carrito[indice].cantidad + 1 > this.carrito[indice].stock) {
               return false;
            } else {
               this.carrito[indice].cantidad += 1

            }
         } else {
            const item = {
               servicio: servicio,
               cantidad: 1,
               precio: servicio.precioUnitario,

            }
            this.carrito.push(item)
            this.item = item;
            this.modalEdit = true;
         }


      },

      EliminarItem(i) {
         this.carrito.splice(i, 1)
      },
      Clean() {
         this.carrito = []
      },
      async Save() {
         this.load = true;
         try {
            const operacion = {
               cliente_id: this.cliente,
               motivo: 'Venta',
               total: this.totalCarrito,
               pago: 0,
               cambio: 0,
               tipo: '1',
               cajero_id: this.user.cajero.id,
               carrito: this.carrito.map(item => ({
                  servicio_id: item.servicio.id,
                  cantidad: item.cantidad,
                  precio: item.precio
               }))
            };
            const res = await this.$admin.$post('ventas', operacion);

            this.$swal
               .fire({
                  title: "Venta Guardada !",
                  showDenyButton: false,
                  showCancelButton: false,
                  confirmButtonText: "Ok",
               })
               .then(async (result) => {
                  if (result.isConfirmed) {
                     this.Clean();
                     this.load = true;
                     await this.Datos();
                     this.load = false;
                     this.cliente = null;
                     // Abrir el PDF en una nueva ventana
                     const printWindow = window.open(res.pdf_url, '_blank');
                     printWindow.onload = () => {
                        printWindow.print();
                     };
                  }
               });
         } catch (e) {
            console.error(e);
         } finally {
            this.load = false;
         }
      },

   },

   mounted() {
      let user = localStorage.getItem('userAuth')
      this.user = JSON.parse(user)
      this.$nextTick(async () => {
         try {
            await this.Datos()
         } catch (e) {

         } finally {
            this.load = false;
         }
      });
   },
};
</script>
<style>
.showModal {
   visibility: visible;
   display: block;
   opacity: 1 !important;
}
</style>
