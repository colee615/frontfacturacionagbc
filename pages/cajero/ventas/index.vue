<template>
   <div>
      <JcLoader :load="load" />
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
                     <div class="col-12 py-2" style="min-height: 60vh; max-height: 60vh; overflow-y: scroll;">
                        <div class="row">
                           <div class="col-6 col-md-4 col-lg-3 mb-3" v-for="m in serviciosServicio" :key="m.id">
                              <PostServicio :servicio="m" @AddCarrito="AddCarritoPrimeraSeccion" />
                           </div>
                        </div>
                        <div class="my-4 border-top"></div>
                        <h4 class="text-center my-4">Prevaloradas</h4>
                        <div class="row">
                           <div class="col-6 col-md-4 col-lg-3 mb-3" v-for="m in serviciosPrevalorada" :key="m.id">
                              <PostServicio :servicio="m" @AddCarrito="AddCarritoSegundaSeccion" />
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
               <div class="col-12 col-sm-5">
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
                                 <use xlink:href="#card-wave" x="48" y="-1" fill="rgba(255,255,255,0.30)"></use>
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
                                       Código de Rastreo
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
                                 <tr v-for="(m, i) in carrito" :key="i">
                                    <td class="text-start">
                                       <p class="text-xxs font-weight-bold mb-0 text-start">{{ m.servicio.descripcion }}
                                       </p>
                                    </td>
                                    <td class="text-start">
                                       <p class="text-xxs font-weight-bold mb-0 text-start">{{ m.codigoEspecial }}</p>
                                    </td>
                                    <td class="text-start">
                                       <p class="text-xxs font-weight-bold mb-0 text-start">{{ Number(m.cantidad *
                                          m.precio).toFixed(2) }}</p>
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
                           <h5 class="modal-title" id="exampleModalLabel">Editar servicio</h5>
                           <button type="button" class="btn-close text-dark" @click="closeModal" data-bs-dismiss="modal"
                              aria-label="Close">
                              <span aria-hidden="true">&times;</span>
                           </button>
                        </div>
                        <div class="modal-body">
                           <div class="row">
                              <div class="col-12">
                                 <div class="form-group has-success">
                                    <label for="">Servicio</label>
                                    <input type="text" placeholder="" disabled class="form-control"
                                       :value="item.servicio.codigo" />
                                    <input type="text" placeholder="" disabled class="form-control"
                                       :value="item.servicio.descripcion" />
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
                                    <input type="number" placeholder="" class="form-control"
                                       v-model.number="item.cantidad" min="1" @input="validateCantidad" />
                                 </div>
                              </div>
                              <div class="col-12">
                                 <div v-for="(field, index) in specialFields" :key="index">
                                    <div class="form-group has-success">
                                       <label for="">Código de Rastreo {{ index + 1 }}</label>
                                       <input type="text" placeholder="Ingrese código de rastreo" class="form-control"
                                          v-model="field.codigoEspecial" />
                                    </div>
                                    <div class="form-group has-success">
                                       <label for="">Información Adicional {{ index + 1 }}</label>
                                       <input type="text" placeholder="Ingrese información adicional"
                                          class="form-control" v-model="field.informacionAdicional" />
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                        <div class="modal-footer">
                           <button type="button" @click="SaveItem" class="btn bg-gradient-secondary w-100"
                              data-bs-dismiss="modal">Confirmar</button>
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
                              <input type="text" class="form-control" placeholder="Buscar cliente..."
                                 v-model="filtroDocumentoIdentidad" autofocus />
                           </div>

                           <div class="row justify-content-end mb-2">
                              <div class="col-12">
                                 <div class="card">
                                    <div class="card-body">
                                       <div class="table-responsive">
                                          <table class="table table-striped table-bordered"
                                             v-if="filteredClientes.length > 0">
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
                                                   <td>{{ m.documentoIdentidad }}</td>
                                                   <td>{{ tipoDocumentoMap[m.tipoDocumentoIdentidad] }}</td>
                                                   <td>
                                                      <button type="button" class="btn btn-success"
                                                         style="font-size: 8px; padding: 10px 20px; border-radius: 5px; background-color: #4CAF50; color: white;"
                                                         data-bs-dismiss="modal" aria-label="Seleccionar Cliente"
                                                         @click="selectCliente(m)">
                                                         <i class="fa fa-user-plus" aria-hidden="true"></i> Seleccionar
                                                         cliente
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
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div v-if="showAddClienteForm">
                              <div slot="body" class="row">
                                 <div class="form-group col-12">
                                    <label for="razonSocial">* Nombre del Cliente</label>
                                    <input type="text" v-model="model.razonSocial" class="form-control"
                                       id="razonSocial" />
                                 </div>
                                 <div class="form-group col-12">
                                    <label for="tipoDocumentoIdentidad">* Tipo Documento de Identidad del
                                       Cliente</label>
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
                                    <label for="documentoIdentidad">* Numero Documento del Cliente</label>
                                    <input type="text" v-model="model.documentoIdentidad" class="form-control"
                                       id="documentoIdentidad" />
                                 </div>
                                 <div class="form-group col-12" v-if="isCISelected">
                                    <label for="complemento">Complemento del Documento de Identidad</label>
                                    <input type="text" v-model="model.complemento" class="form-control"
                                       id="complemento" />
                                 </div>
                                 <div class="form-group col-12">
                                    <label for="correo">* Email del Cajero</label>
                                    <input type="text" v-model="model.correo" class="form-control" id="correo" />
                                 </div>
                                 <button class="btn btn-dark w-100" @click="Savecliente()">Guardar</button>
                                 <button class="btn btn-secondary w-100 mt-2"
                                    @click="cancelCreateCliente">Cancelar</button>
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
import Swal from "sweetalert2";

export default {
   head() {
      return {
         title: this.modulo,
      };
   },

   data() {
      return {
         specialFields: [], // Array to hold multiple special fields
         formatoFactura: 'rollo', // Valor predeterminado
         filtroDocumentoIdentidad: "",
         model: {
            razonSocial: "",
            documentoIdentidad: "",
            complemento: "",
            tipoDocumentoIdentidad: "",
            correo: "",
         },
         apiUrl: "clientes",
         showAddClienteForm: false,
         tipoDocumentoMap: {
            1: "CI - Cédula de identidad",
            2: "CEX - Cédula de identidad de extranjero",
            3: "PAS - Pasaporte",
            4: "OD - Otro Documento de Identidad",
            5: "NIT - Número de identificación Tributaria",
         },
         modulo: "Nueva venta",
         page: "ventas",
         load: true,
         modalEdit: false,
         servicios: [],
         carrito: [],
         clientes: [],
         cliente: null,
         sucursals: [],
         filtroCliente: "",
         sucursal: {},
         item: {
            servicio: {
               nombre: "",
            },
            cantidad: 0,
            precio: 0,
         },
      };
   },

   computed: {
      serviciosServicio() {
         return this.servicios.filter(servicio => servicio.tipo === 'servicio');
      },
      serviciosPrevalorada() {
         return this.servicios.filter(servicio => servicio.tipo === 'prevalorada');
      },
      isCISelected() {
         return this.model.tipoDocumentoIdentidad === "1";
      },
      user() {
         return this.$store.state.auth.user;
      },
      totalCarrito() {
         let subtotal = this.carrito.reduce((a, b) => a + b.cantidad * b.precio, 0);
         return subtotal;
      },
      filteredClientes() {
         if (!this.clientes || !Array.isArray(this.clientes)) {
            return [];
         }
         return this.clientes.filter((cliente) => {
            if (!cliente || !cliente.documentoIdentidad) return false; // Add this check
            const docValido = this.filtroDocumentoIdentidad ? cliente.documentoIdentidad.toLowerCase().includes(this.filtroDocumentoIdentidad.toLowerCase()) : false;
            return docValido;
         });
      },
   },
   methods: {
      validateCantidad() {
         if (this.item.cantidad > 15) {
            this.item.cantidad = 15;
            this.$swal.fire({
               icon: "error",
               title: "Cantidad inválida",
               text: "La cantidad no puede ser mayor a 15.",
               confirmButtonText: "Entendido",
            });
         }
         this.updateSpecialFields();
      },
      updateSpecialFields() {
         this.specialFields = [];
         for (let i = 0; i < this.item.cantidad && i < 15; i++) {
            this.specialFields.push({
               codigoEspecial: '',
               informacionAdicional: ''
            });
         }
      },
      AddCarritoPrimeraSeccion(servicio) {
         if (this.carrito.some(item => item.servicio.tipo === 'prevalorada')) {
            this.$swal.fire({
               icon: "error",
               title: "Restricción",
               text: "No puedes agregar productos de la primera sección si ya tienes productos de las prevaloradas en el carrito.",
               confirmButtonText: "Entendido",
            });
            return;
         }
         this.AddCarrito(servicio, 'servicio');
      },
      AddCarritoSegundaSeccion(servicio) {
         if (this.carrito.some(item => item.servicio.tipo === 'servicio')) {
            this.$swal.fire({
               icon: "error",
               title: "Restricción",
               text: "No puedes agregar productos de las prevaloradas si ya tienes productos de la primera sección en el carrito.",
               confirmButtonText: "Entendido",
            });
            return;
         }
         this.AddCarrito(servicio, 'prevalorada');
      },
      selectCliente(cliente) {
         this.cliente = cliente;
         this.ConfirmAndSave();
      },
      async guardarCliente() {
         const res = await this.$admin.$post("clientes", this.nuevoCliente);
         if (res.success) {
            this.clientes.push(res.cliente);
            this.showAddClienteForm = false;
            this.filtroCliente = "";
            new bootstrap.Modal(document.getElementById("clienteModal")).hide();
         } else {
            alert("Error al guardar el cliente.");
         }
      },
      CheckAndSave() {
         if (this.carrito.length === 0) {
            this.$swal.fire({
               icon: "error",
               title: "Carrito Vacío",
               text: "Debe agregar al menos un elemento al carrito para poder guardar.",
               confirmButtonText: "Entendido",
            });
         } else if (this.carrito[0].tipo === 'servicio' && !this.cliente) {
            new bootstrap.Modal(document.getElementById("clienteModal")).show();
         } else {
            this.ConfirmAndSave();
         }
      },
      ConfirmAndSave() {
         this.$swal
            .fire({
               title: "¿Estás seguro de realizar la venta?",
               input: 'select',
               inputOptions: {
                  'rollo': 'Formato Rollo',
                  'pagina': 'Formato Página'
               },
               inputValue: 'rollo',
               showDenyButton: true,
               confirmButtonText: "Sí, facturar",
               denyButtonText: `No, cancelar`,
               inputPlaceholder: 'Seleccionar formato de factura',
               inputAttributes: {
                  'aria-label': 'Seleccionar formato de factura'
               }
            })
            .then((result) => {
               if (result.isConfirmed) {
                  this.formatoFactura = result.value;
                  if (this.carrito[0].tipo === 'prevalorada') {
                     this.SaveSegundaSeccion();
                  } else {
                     this.Save();
                  }
               } else if (result.isDenied) {
                  window.location.reload();
               }
            });
      },

      async GET_DATA(path) {
         const res = await this.$admin.$get(path);
         return res;
      },
      cerrarModalCliente() {
         this.nuevoCliente = {
            nombre: "",
            documentoIdentidad: "",
         };
         this.showAddClienteForm = false;
      },
      async Savecliente() {
         this.load = true;
         try {
            const res = await this.$admin.$post(this.apiUrl, this.model);
            this.clientes.push(res.data);
            this.$swal.fire({
               title: "Guardado!",
               showDenyButton: false,
               showCancelButton: false,
               confirmButtonText: "Ok",
            }).then(async (result) => {
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
            await Promise.all([this.GET_DATA("servicios"), this.GET_DATA("clientes")]).then((v) => {
               this.servicios = v[0];
               this.clientes = v[1];
            });
         } catch (e) {
         }
      },
      AddCarrito(servicio, tipo) {
         const item = {
            servicio: servicio,
            cantidad: 0,
            precio: servicio.precioUnitario,
            tipo: tipo,
            codigoEspecial: '',  // Campo para el código especial
            informacionAdicional: ''  // Campo para la información adicional
         };
         this.item = item;
         this.modalEdit = true;
      },
      SaveItem() {
         // Validar que la cantidad no sea 0
         if (this.item.cantidad === 0) {
            this.$swal.fire({
               icon: "error",
               title: "Cantidad inválida",
               text: "La cantidad no puede ser 0.",
               confirmButtonText: "Entendido",
            });
            return;
         }

         // Validar que todos los campos de código de rastreo e información adicional estén llenos
         for (const field of this.specialFields) {
            if (!field.codigoEspecial || !field.informacionAdicional) {
               this.$swal.fire({
                  icon: "error",
                  title: "Campos vacíos",
                  text: "Debe llenar todos los campos de Código de Rastreo e Información Adicional.",
                  confirmButtonText: "Entendido",
               });
               return;
            }
         }

         if (this.item.tipo === 'servicio' || this.item.tipo === 'prevalorada') {
            const baseCodigo = this.item.servicio.codigo;
            for (let i = 0; i < this.item.cantidad; i++) {
               const newItem = {
                  ...this.item,
                  cantidad: 1, // Crear una copia con cantidad 1
                  servicio: {
                     ...this.item.servicio,
                     codigo: `${baseCodigo}-${i + 1}` // Añadir el número secuencial al código del servicio
                  },
                  codigoEspecial: this.specialFields[i].codigoEspecial, // Añadir código especial
                  informacionAdicional: this.specialFields[i].informacionAdicional // Añadir información adicional
               };
               this.carrito.push(newItem);
            }
         }
         this.modalEdit = false;
         this.clearModalFields();
      },
      clearModalFields() {
         this.item = {
            servicio: {
               nombre: "",
            },
            cantidad: 0,
            precio: 0,
         };
         this.specialFields = [];
      },
      EliminarItem(i) {
         this.carrito.splice(i, 1);
      },
      cancelCreateCliente() {
         this.showAddClienteForm = false;
      },
      Clean() {
         this.carrito = [];
      },
      closeModal() {
         this.modalEdit = false;
         this.clearModalFields();
      },
      async Save() {
         this.load = true;
         try {
            const operacion = {
               cliente_id: this.cliente.id,
               cajero_id: this.user.id,
               codigoSucursal: this.user.sucursale.codigosucursal,
               puntoVenta: 0,
               documentoSector: 1,
               municipio: this.user.sucursale.municipio,
               departamento: this.user.sucursale.departamento,
               telefono: this.user.sucursale.telefono,
               metodoPago: 1,
               formatoFactura: this.formatoFactura,
               monto_descuento_adicional: this.montoDescuentoAdicional,
               motivo: "Venta",
               total: this.totalCarrito,
               carrito: this.carrito.map((item, index) => ({
                  servicio_id: item.servicio.id,
                  actividadEconomica: item.servicio.actividadEconomica,
                  codigoSin: item.servicio.codigoSin,
                  codigo: `${item.servicio.codigo}-${index + 1}`,
                  descripcion: `Codigo de Rastreo: ${item.codigoEspecial}, Detalle de envío: ${item.informacionAdicional}`, // Modificación aquí
                  unidadMedida: item.servicio.unidadMedida,
                  cantidad: item.cantidad,
                  precio: item.precio,
                  codigoEspecial: item.codigoEspecial, // Asegurar que se envía el código especial
                  informacionAdicional: item.informacionAdicional // Asegurar que se envía la información adicional
               })),
            };
            console.log("Datos a enviar:", operacion);
            const res = await this.$admin.$post("ventas", operacion);
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
                     const pdfResponse = await this.$admin.$get(`venta/pdf/${res.codigoSeguimiento}`);
                     const printWindow = window.open(pdfResponse.pdf_url, "_blank");
                     printWindow.onload = () => {
                        printWindow.print();
                     };
                  }
               });
         } catch (e) {
            console.error(e);
            this.$swal.fire({
               title: "Error al emitir factura",
               text: "No hay conexión con la AGETIC",
               footer: e.response?.data?.details || "Hubo un error al procesar la venta",
               icon: "error",
               confirmButtonText: "Ok",
            });
         } finally {
            this.load = false;
         }
      }
      ,
      async SaveSegundaSeccion() {
         this.load = true;
         try {
            const operacion = {
               cajero_id: this.user.id,
               codigoSucursal: this.user.sucursale.codigosucursal,
               puntoVenta: 0,
               documentoSector: 23,
               municipio: this.user.sucursale.municipio,
               departamento: this.user.sucursale.departamento,
               telefono: this.user.sucursale.telefono,
               metodoPago: 1,
               formatoFactura: this.formatoFactura,
               monto_descuento_adicional: this.montoDescuentoAdicional,
               motivo: "Prevalorada",
               total: this.totalCarrito,
               carrito: [
                  {
                     servicio_id: this.carrito[0].servicio.id,
                     actividadEconomica: this.carrito[0].servicio.actividadEconomica,
                     codigoSin: this.carrito[0].servicio.codigoSin,
                     codigo: this.carrito[0].servicio.codigo,
                     descripcion: this.carrito[0].servicio.descripcion,
                     unidadMedida: this.carrito[0].servicio.unidadMedida,
                     cantidad: this.carrito.reduce((acc, item) => acc + item.cantidad, 0),
                     precio: this.carrito[0].precio,
                     codigoEspecial: this.carrito.map(item => item.codigoEspecial).join(", "),
                     informacionAdicional: this.carrito.map(item => item.informacionAdicional).join(", "),
                  }
               ],
            };
            console.log("Datos a enviar:", operacion);
            const res = await this.$admin.$post("venta2", operacion);
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
                     const pdfResponse = await this.$admin.$get(`venta/pdf/${res.codigoSeguimiento}`);
                     const printWindow = window.open(pdfResponse.pdf_url, "_blank");
                     printWindow.onload = () => {
                        printWindow.print();
                     };
                  }
               });
         } catch (e) {
            console.error(e);
            this.$swal.fire({
               title: "Error al emitir factura",
               text: "No hay conexión con la AGETIC",
               footer: e.response?.data?.details || "Hubo un error al procesar la venta",
               icon: "error",
               confirmButtonText: "Ok",
            });
         } finally {
            this.load = false;
         }
      },
   },

   mounted() {
      this.$nextTick(async () => {
         try {
            await this.Datos();
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

.table-responsive {
   max-height: 300px;
   overflow-y: auto;
}
</style>
