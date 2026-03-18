<template>
   <div>
      <JcLoader :load="load" />
      <AdminTemplate :page="page" :modulo="modulo">
         <div slot="body">
            <div class="row justify-content-end">
               <div class="col-12 col-sm-7">
                  <div class="row">
                     <div class="col-12">
                        <div class="card gold-soft-card">
                           <div class="card-header bg-transparent py-2 px-3">
                              <div class="row">
                                 <div class="col-lg-4 col-md-6 col-12">
                                    <div class="input-group input-group-lg">
                                       <span class="input-group-text gold-search-icon bg-transparent border-0">
                                          <i class="ni ni-archive-2 text-lg" aria-hidden="true"></i>
                                       </span>
                                       <input type="text" class="form-control bg-transparent border-0 gold-search-input"
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
                     </div>
                  </div>
               </div>
               <div class="col-12 col-sm-5">
                     <div class="card card-pricing gold-pricing-card">
                     <div class="card-header gold-pricing-header text-center pt-4 pb-5 position-relative">
                        <div class="z-index-1 position-relative">
                           <h1 class="gold-pricing-amount mt-2 mb-0"><small></small>{{ totalCarrito }}</h1>
                           <h6 class="gold-pricing-label">Total</h6>
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
                              class="btn gold-outline-btn btn-icon-only btn-rounded mb-0 ms-2 btn-sm d-flex align-items-center justify-content-center ms-auto"
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
                                       ArtÃ­culo
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
                                       <p class="text-xxs font-weight-bold mb-0 text-start">{{ Number(m.cantidad *
                                          m.precio).toFixed(2) }}</p>
                                    </td>
                                    <td>
                                       <div class="input-group input-group-sm">
                                          <button class="btn gold-outline-btn mb-0 btn-sm" type="button"
                                             @click="[modalEdit = true, item = m]">
                                             <i class="fas fa-pen"></i>
                                          </button>
                                          <button class="btn gold-outline-danger mb-0 btn-sm" type="button"
                                             @click="EliminarItem(i)">
                                             <i class="fas fa-times"></i>
                                          </button>
                                       </div>
                                    </td>
                                 </tr>
                              </tbody>
                           </table>
                        </div>
                        <a href="javascript:void(0);" class="btn gold-primary-btn w-100 mt-4 mb-0"
                           @click="CheckAndSave">
                           <i class="fas fa-save mx-2"></i> GUARDAR VENTA
                        </a>
                     </div>
                  </div>
               </div>
               <div class="modal fade" :class="modalEdit ? 'showModal' : ''" id="AjusteModal" tabindex="-1"
                  role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                  <div class="modal-dialog modal-dialog-centered" role="document">
                     <div class="modal-content gold-modal-content">
                        <div class="modal-header gold-modal-header">
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
                           </div>
                        </div>
                        <div class="modal-footer">
                           <button type="button" @click="SaveItem" class="btn gold-primary-btn w-100"
                              data-bs-dismiss="modal">Confirmar</button>
                        </div>
                     </div>
                  </div>
               </div>
               <div class="modal fade" id="clienteModal" tabindex="-1" aria-labelledby="clienteModalLabel"
                  aria-hidden="true">
                  <div class="modal-dialog modal-lg">
                     <div class="modal-content gold-modal-content">
                        <div class="modal-body">
                           <div class="input-group mb-3">
                              <input type="text" class="form-control gold-field" placeholder="Buscar cliente..."
                                 v-model="filtroDocumentoIdentidad" autofocus />
                           </div>

                           <div class="row justify-content-end mb-2">
                              <div class="col-12">
                                 <div class="card gold-inner-card">
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
                                                      <button type="button" class="btn gold-primary-btn btn-sm"
                                                         style="font-size: 8px; padding: 10px 20px; border-radius: 10px;"
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
                                             <p>No se encontraron clientes. Â¿Desea agregar uno nuevo?</p>
                                             <button class="btn gold-primary-btn" @click="showAddClienteForm = true">Agregar
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
                                    <label for="razonSocial">* RazÃ³n Social</label>
                                    <input type="text" v-model="model.razonSocial" class="form-control"
                                       id="razonSocial" />
                                 </div>
                                 <div class="form-group col-12">
                                    <label for="tipoDocumentoIdentidad">* Tipo Documento de Identidad del
                                       Cliente</label>
                                    <select v-model="model.tipoDocumentoIdentidad" class="form-control"
                                       id="tipoDocumentoIdentidad">
                                       <option value="1">CI - CÃ©dula de identidad</option>
                                       <option value="2">CEX - CÃ©dula de identidad de extranjero</option>
                                       <option value="3">PAS - Pasaporte</option>
                                       <option value="4">OD - Otro Documento de Identidad</option>
                                       <option value="5">NIT - NÃºmero de identificaciÃ³n Tributaria</option>
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
                                    <label for="correo">Email del Cliente</label>
                                    <input type="text" v-model="model.correo" class="form-control" id="correo" />
                                 </div>
                                 <button class="btn gold-primary-btn w-100" @click="Savecliente()">Guardar</button>
                                 <button class="btn gold-outline-btn w-100 mt-2"
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
            formatoFactura: 'rollo', // Valor predeterminado
            montoDescuentoAdicional: 0,
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
            1: "CI - CÃ©dula de identidad",
            2: "CEX - CÃ©dula de identidad de extranjero",
            3: "PAS - Pasaporte",
            4: "OD - Otro Documento de Identidad",
            5: "NIT - NÃºmero de identificaciÃ³n Tributaria",
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
         return this.servicios.filter(servicio => !servicio.tipo || servicio.tipo === 'servicio');
      },
      isCISelected() {
         return this.model.tipoDocumentoIdentidad === "1";
      },
      user() {
         return this.$store.state.auth.user;
      },
      currentSucursal() {
         if (!this.user) return null;
         return this.user.sucursale || this.user.sucursal || null;
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
               title: "Cantidad invÃ¡lida",
               text: "La cantidad no puede ser mayor a 15.",
               confirmButtonText: "Entendido",
            });
         }
      },
      AddCarritoPrimeraSeccion(servicio) {
         this.AddCarrito(servicio, 'servicio');
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
               title: "Carrito VacÃ­o",
               text: "Debe agregar al menos un elemento al carrito para poder guardar.",
               confirmButtonText: "Entendido",
            });
         } else if (!this.cliente) {
            new bootstrap.Modal(document.getElementById("clienteModal")).show();
         } else {
            this.ConfirmAndSave();
         }
      },
      ConfirmAndSave() {
         this.$swal
            .fire({
               title: "Â¿EstÃ¡s seguro de realizar la venta?",
               input: 'select',
               inputOptions: {
                  'rollo': 'Formato Rollo',
                  'pagina': 'Formato PÃ¡gina'
               },
               inputValue: 'rollo',
               showDenyButton: true,
               confirmButtonText: "SÃ­, facturar",
               denyButtonText: `No, cancelar`,
               inputPlaceholder: 'Seleccionar formato de factura',
               inputAttributes: {
                  'aria-label': 'Seleccionar formato de factura'
               }
            })
            .then((result) => {
               if (result.isConfirmed) {
                  this.formatoFactura = result.value;
                  this.Save();
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
         this.model = {
            razonSocial: "",
            documentoIdentidad: "",
            complemento: "",
            tipoDocumentoIdentidad: "",
            correo: "",
         };
         this.showAddClienteForm = false;
      },
      validateClienteFields() {
         const errors = [];
         if (!this.model.razonSocial || typeof this.model.razonSocial !== 'string') {
            errors.push('La RazÃ³n Social es obligatoria.');
         }
         if (!this.model.documentoIdentidad) {
            errors.push('El NÃºmero de Documento es obligatorio.');
         }
         if (!this.model.tipoDocumentoIdentidad) {
            errors.push('El Tipo de Documento de Identidad es obligatorio.');
         }
         if (this.model.correo) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(this.model.correo)) {
               errors.push('El Email del Cliente no tiene un formato vÃ¡lido.');
            }
         }
         return errors;
      },
      buildClientePayload() {
         return {
            razonSocial: (this.model.razonSocial || '').trim(),
            documentoIdentidad: (this.model.documentoIdentidad || '').trim(),
            complemento: this.model.complemento ? this.model.complemento.trim() : '',
            tipoDocumentoIdentidad: this.model.tipoDocumentoIdentidad,
            correo: this.model.correo ? this.model.correo.trim() : '',
         };
      },
      async Savecliente() {
         const errors = this.validateClienteFields();
         if (errors.length) {
            this.$swal.fire({
               toast: true,
               position: 'center',
               showConfirmButton: false,
               icon: 'error',
               title: 'Verifique los siguientes campos:',
               html: `<ul style="text-align: left;">${errors.map(e => `<li>${e}</li>`).join('')}</ul>`,
            });
            return;
         }
         this.load = true;
         try {
            const payload = this.buildClientePayload();
            const res = await this.$admin.$post(this.apiUrl, payload);
            this.clientes.push(res);
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
            const backendErrors = e.response?.data?.errors;
            const backendMessage = e.response?.data?.message || e.response?.data?.error;
            if (backendErrors && typeof backendErrors === 'object') {
               const items = Object.values(backendErrors).flat().map(err => `<li>${err}</li>`).join('');
               this.$swal.fire({
                  toast: true,
                  position: 'center',
                  showConfirmButton: false,
                  icon: 'error',
                  title: 'No se pudo guardar el cliente',
                  html: `<ul style="text-align: left;">${items}</ul>`,
               });
               return;
            }
            this.$swal.fire({
               toast: true,
               position: 'center',
               showConfirmButton: false,
               icon: 'error',
               title: backendMessage || 'Hubo un problema al guardar el cliente.',
            });
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
         };
         this.item = item;
         this.modalEdit = true;
      },
      SaveItem() {
         // Validar que la cantidad no sea 0
         if (this.item.cantidad === 0) {
            this.$swal.fire({
               icon: "error",
               title: "Cantidad invÃ¡lida",
               text: "La cantidad no puede ser 0.",
               confirmButtonText: "Entendido",
            });
            return;
         }

         if (this.item.tipo === 'servicio') {
            const baseCodigo = this.item.servicio.codigo;
            for (let i = 0; i < this.item.cantidad; i++) {
               const newItem = {
                  ...this.item,
                  cantidad: 1, // Crear una copia con cantidad 1
                  servicio: {
                     ...this.item.servicio,
                     codigo: `${baseCodigo}-${i + 1}` // AÃ±adir el nÃºmero secuencial al cÃ³digo del servicio
                  }
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
      validateUserContext() {
         if (!this.user || !this.user.id) {
            this.$swal.fire({
               title: "SesiÃ³n invÃ¡lida",
               text: "No se encontrÃ³ el usuario autenticado. Inicie sesiÃ³n nuevamente.",
               icon: "error",
               confirmButtonText: "Ok",
            });
            return false;
         }

         const hasCodigoSucursal = this.currentSucursal
            && this.currentSucursal.codigosucursal !== null
            && this.currentSucursal.codigosucursal !== undefined;

         if (!hasCodigoSucursal) {
            this.$swal.fire({
               title: "Sucursal no disponible",
               text: "El usuario no tiene una sucursal asignada o la sesiÃ³n no cargÃ³ ese dato.",
               icon: "error",
               confirmButtonText: "Ok",
            });
            return false;
         }

         return true;
      },
      validateVentaPayload() {
         const errors = [];
         const cliente = this.cliente || {};
         const sucursal = this.currentSucursal || {};
         const municipio = (sucursal.municipio || '').trim();
         const departamento = (sucursal.departamento || '').trim();
         const telefono = String(sucursal.telefono || '').trim();
         const razonSocial = String(cliente.razonSocial || '').trim();
         const documentoIdentidad = String(cliente.documentoIdentidad || '').trim();
         const correo = String(cliente.correo || '').trim();
         const codigoCliente = String(cliente.codigoCliente || '').trim();
         const complemento = String(cliente.complemento || '').trim();
         const tipoDocumentoIdentidad = String(cliente.tipoDocumentoIdentidad || '').trim();

         if (!/^[A-ZÀ-ſ\s.-]{2,25}$/u.test(municipio)) {
            errors.push('El municipio de la sucursal debe estar en mayúsculas y tener entre 2 y 25 caracteres.');
         }

         if (departamento) {
            if (!/^[A-Z\s.-]{2,15}$/u.test(departamento)) {
               errors.push('El departamento de la sucursal debe tener entre 2 y 15 caracteres válidos.');
            }
            if (municipio !== departamento && `${municipio}-${departamento}`.length > 25) {
               errors.push('La longitud combinada de municipio y departamento no puede superar 25 caracteres.');
            }
         }

         if (!/^[0-9]{7,8}$/.test(telefono)) {
            errors.push('El teléfono de la sucursal debe tener 7 u 8 dígitos.');
         }

         if (this.totalCarrito <= 0) {
            errors.push('El total de la venta debe ser mayor a 0.');
         }

         if (!razonSocial || razonSocial.length < 2 || razonSocial.length > 500) {
            errors.push('La razón social del cliente debe tener entre 2 y 500 caracteres.');
         }

         if (!documentoIdentidad || documentoIdentidad.length > 20) {
            errors.push('El documento de identidad del cliente es obligatorio y no puede superar 20 caracteres.');
         }

         if (!/^[1-5]$/.test(tipoDocumentoIdentidad)) {
            errors.push('El tipo de documento de identidad del cliente debe estar entre 1 y 5.');
         }

         if (['99001', '99002', '99003'].includes(documentoIdentidad) && tipoDocumentoIdentidad !== '5') {
            errors.push('Los documentos especiales 99001, 99002 y 99003 requieren tipo de documento 5.');
         }

         if (tipoDocumentoIdentidad === '1') {
            if (complemento && !/^([0-9][A-Z]|[0-9]{2})$/.test(complemento)) {
               errors.push('El complemento del cliente debe tener formato válido de 2 caracteres.');
            }
         } else if (complemento) {
            errors.push('El complemento solo está permitido cuando el tipo de documento es CI.');
         }

         if (!correo || correo.length > 50 || !/^[\w.\-]+@([\w-]+\.)+[\w-]{2,4}$/.test(correo)) {
            errors.push('El correo del cliente es obligatorio y debe tener un formato válido de hasta 50 caracteres.');
         }

         if (!codigoCliente || codigoCliente.length < 2 || codigoCliente.length > 50 || !/^[A-Za-z0-9\s\-_]+$/.test(codigoCliente)) {
            errors.push('El código de cliente debe tener entre 2 y 50 caracteres válidos.');
         }

         if (!['rollo', 'pagina'].includes(this.formatoFactura)) {
            errors.push('El formato de factura debe ser rollo o pagina.');
         }

         if (!Array.isArray(this.carrito) || this.carrito.length === 0 || this.carrito.length > 500) {
            errors.push('La venta debe contener entre 1 y 500 ítems.');
         }

         this.carrito.forEach((item, index) => {
            if (!/^[0-9]{6}$/.test(String(item.servicio?.actividadEconomica || ''))) {
               errors.push(`El ítem ${index + 1} tiene actividad económica inválida.`);
            }
            if (!/^[0-9]{5,7}$/.test(String(item.servicio?.codigoSin || ''))) {
               errors.push(`El ítem ${index + 1} tiene código SIN inválido.`);
            }
            if (!String(item.servicio?.codigo || '').trim() || String(item.servicio?.codigo || '').length < 3) {
               errors.push(`El ítem ${index + 1} debe tener un código interno válido.`);
            }
            if (!String(item.servicio?.descripcion || '').trim() || String(item.servicio?.descripcion || '').length < 5) {
               errors.push(`El ítem ${index + 1} debe tener una descripción válida.`);
            }
            if (!Number(item.precio) || Number(item.precio) <= 0) {
               errors.push(`El ítem ${index + 1} debe tener un precio mayor a 0.`);
            }
            if (!Number(item.cantidad) || Number(item.cantidad) <= 0) {
               errors.push(`El ítem ${index + 1} debe tener una cantidad mayor a 0.`);
            }
            if (!Number(item.servicio?.unidadMedida) || Number(item.servicio?.unidadMedida) <= 0) {
               errors.push(`El ítem ${index + 1} debe tener una unidad de medida válida.`);
            }
         });

         if (errors.length) {
            this.$swal.fire({
               icon: 'error',
               title: 'La venta no cumple las validaciones del protocolo',
               html: `<ul style="text-align:left;">${errors.map(error => `<li>${error}</li>`).join('')}</ul>`,
               confirmButtonText: 'Entendido',
            });
            return false;
         }

         return true;
      },
      extractBackendErrors(error) {
         const errors = [];
         const data = error?.response?.data || {};

         if (data.message) {
            errors.push(data.message);
         }

         if (data.details) {
            errors.push(data.details);
         }

         if (data.errors && typeof data.errors === 'object') {
            Object.values(data.errors).flat().forEach(message => errors.push(message));
         }

         if (data.details?.datos?.errores && Array.isArray(data.details.datos.errores)) {
            data.details.datos.errores.forEach(message => errors.push(message));
         }

         if (data.details?.message) {
            errors.push(data.details.message);
         }

         return [...new Set(errors.filter(Boolean))];
      },
      async Save() {
         if (!this.validateUserContext()) return;
         if (!this.validateVentaPayload()) return;
         this.load = true;
         try {
            const sucursal = this.currentSucursal;
            const operacion = {
               cliente_id: this.cliente.id,
               usuario_id: this.user.id,
               codigoSucursal: sucursal.codigosucursal,
               puntoVenta: 0,
               documentoSector: 1,
               municipio: sucursal.municipio,
               departamento: sucursal.departamento,
               telefono: sucursal.telefono,
               metodoPago: 1,
               formatoFactura: this.formatoFactura,
               monto_descuento_adicional: Number(this.montoDescuentoAdicional || 0),
               motivo: "Venta",
               total: this.totalCarrito,
               carrito: this.carrito.map((item, index) => ({
                  servicio_id: item.servicio.id,
                  actividadEconomica: item.servicio.actividadEconomica,
                  codigoSin: item.servicio.codigoSin,
                  codigo: `${item.servicio.codigo}-${index + 1}`,
                  descripcion: item.servicio.descripcion,
                  unidadMedida: item.servicio.unidadMedida,
                  cantidad: item.cantidad,
                  precio: item.precio,
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
            const backendErrors = this.extractBackendErrors(e);
            if (e.response?.status === 403) {
               this.$swal.fire({
                  title: 'Error al emitir factura',
                  html: backendErrors.length
                     ? `<ul style="text-align:left;">${backendErrors.map(error => `<li>${error}</li>`).join('')}</ul>`
                     : (e.response?.data?.error || 'Hubo un error al procesar la venta.'),
                  icon: "error",
                  confirmButtonText: 'Entendido'
               });
            } else {
               this.$swal.fire({
                  title: "Error al emitir factura",
                  html: backendErrors.length
                     ? `<ul style="text-align:left;">${backendErrors.map(error => `<li>${error}</li>`).join('')}</ul>`
                     : "No hay conexiÃ³n con la AGETIC",
                  footer: !backendErrors.length ? (e.response?.data?.details || "Hubo un error al procesar la venta") : null,
                  icon: "error",
                  confirmButtonText: "Ok",
               });
            }
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

.gold-soft-card {
   background: #ffffff !important;
   border: 1px solid rgba(226, 232, 240, 0.9) !important;
   box-shadow: 0 16px 28px rgba(15, 23, 42, 0.06);
}

.gold-search-icon {
   color: #c69100 !important;
}

.gold-search-input,
.gold-search-input::placeholder {
   color: #8d6a17 !important;
}

.gold-pricing-card {
   border: 1px solid rgba(226, 232, 240, 0.92);
   box-shadow: 0 16px 28px rgba(15, 23, 42, 0.06);
   background: #ffffff;
}

.gold-pricing-header {
   background: linear-gradient(135deg, #334155 0%, #475569 100%) !important;
   color: #ffffff;
}

.gold-pricing-amount {
   color: #ffffff !important;
   font-weight: 800;
}

.gold-pricing-label {
   color: rgba(255, 255, 255, 0.92) !important;
   font-weight: 700;
}

.gold-primary-btn {
   background: linear-gradient(135deg, #ffe38a 0%, #ffd54f 100%) !important;
   color: #5a4006 !important;
   border: 1px solid rgba(201, 154, 35, 0.24) !important;
   box-shadow: 0 12px 24px rgba(181, 145, 43, 0.14);
   font-weight: 800;
}

.gold-primary-btn:hover,
.gold-primary-btn:focus {
   color: #5a4006 !important;
   opacity: 0.96;
}

.gold-outline-btn {
   background: #fffaf0 !important;
   color: #9b7008 !important;
   border: 1px solid rgba(214, 183, 96, 0.34) !important;
   box-shadow: none;
}

.gold-outline-btn:hover,
.gold-outline-btn:focus {
   background: #ffe9a6 !important;
   color: #6d4b04 !important;
}

.gold-outline-danger {
   background: #fff8f1 !important;
   color: #c17433 !important;
   border: 1px solid rgba(230, 173, 121, 0.34) !important;
}

.gold-outline-danger:hover,
.gold-outline-danger:focus {
   background: #ffe6d2 !important;
   color: #9d5720 !important;
}

.gold-modal-content {
   border: 1px solid rgba(226, 232, 240, 0.9);
   box-shadow: 0 18px 34px rgba(15, 23, 42, 0.08);
   border-radius: 18px;
   overflow: hidden;
}

.gold-modal-header {
   background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
   border-bottom: 1px solid rgba(226, 232, 240, 0.9);
}

.gold-inner-card {
   border: 1px solid rgba(226, 232, 240, 0.9);
   box-shadow: 0 12px 22px rgba(15, 23, 42, 0.05);
}

.gold-field {
   border: 1px solid rgba(203, 213, 225, 0.9) !important;
   background: #ffffff !important;
}

.gold-field:focus {
   border-color: #f2be22 !important;
   box-shadow: 0 0 0 0.2rem rgba(242, 190, 34, 0.14) !important;
}
</style>
