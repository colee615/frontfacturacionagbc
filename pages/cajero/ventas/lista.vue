<template>
   <div>
      <JcLoader :load="load"></JcLoader>
      <AdminTemplate :page="page" :modulo="modulo">
         <div slot="body">
            <div class="row justify-content-end mb-2">
               <div class="modal fade" :class="modalEdit ? 'show d-block' : ''" id="AjusteModal" tabindex="-1"
                  role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                  <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
                     <div class="modal-content">
                        <div class="modal-header">
                           <h5 class="modal-title" id="exampleModalLabel">Detalle Venta Recepcionada</h5>
                           <button type="button" class="btn-close text-dark" @click="modalEdit = false"
                              data-bs-dismiss="modal" aria-label="Close">
                              <span aria-hidden="true">&times;</span>
                           </button>
                        </div>
                        <div class="modal-body">
                           <div v-if="ventaDetails">
                              <!-- Datos Generales -->
                              <div class="row mb-3">
                                 <div class="col-12">
                                    <h5>Datos Generales</h5>
                                    <div class="d-flex justify-content-between">
                                       <span><strong>Estado SIN:</strong> {{
                                          ventaDetails.estado }}</span>
                                       <span><strong>Estado:</strong> {{
                                          ventaDetails.estado }}</span>
                                    </div>
                                 </div>
                                 <div class="col-12 col-md-6">
                                    <p><strong>Número de Factura:</strong> {{
                                       ventaDetails.detalleFactura.cabecera.numeroFactura }}</p>
                                    <p><strong>CUF:</strong> {{ ventaDetails.cuf }}</p>
                                    <p><strong>Razón Social:</strong> {{
                                       ventaDetails.detalleFactura.cabecera.nombreRazonSocial }}</p>
                                    <p><strong>Fecha:</strong> {{ ventaDetails.detalleFactura.cabecera.fechaEmision }}
                                    </p>
                                    <p><strong>Tipo de Factura:</strong> {{
                                       ventaDetails.detalleFactura.cabecera.codigoDocumentoSector }}</p>
                                 </div>
                                 <div class="col-12 col-md-6">
                                    <p><strong>Tipo de Documento:</strong> {{
                                       ventaDetails.detalleFactura.cabecera.codigoTipoDocumentoIdentidad }}</p>
                                    <p><strong>Nro de Documento:</strong> {{
                                       ventaDetails.detalleFactura.cabecera.numeroDocumento }}</p>
                                    <p><strong>Monto Total:</strong> {{ ventaDetails.detalleFactura.cabecera.montoTotal
                                       }}</p>
                                    <p><strong>Sector:</strong> {{
                                       ventaDetails.detalleFactura.cabecera.codigoDocumentoSector }}</p>
                                 </div>
                              </div>
                              <!-- Envío de correo electrónico -->
                              <div class="row mb-3">
                                 <div class="col-12">
                                    <h5>Envío de correo electrónico</h5>
                                 </div>
                                 <div class="col-12">
                                    <p><strong>Correo electrónico del cliente:</strong> {{ ventaDetails.correo }}</p>
                                    <p><strong>Fecha de envío del correo electrónico:</strong> {{
                                       ventaDetails.detalleFactura.cabecera.fechaEmision }}</p>
                                    <p><strong>ID Correo:</strong> 669925ecf2a25802231a85a5</p>
                                 </div>
                              </div>
                              <!-- Detalle -->
                              <div class="row mb-3">
                                 <div class="col-12">
                                    <h5>Detalle</h5>
                                    <button class="btn btn-outline-primary me-2">
                                       <i class="fas fa-eye"></i> Ver Detalle
                                    </button>
                                    <button class="btn btn-outline-primary me-2">
                                       <i class="fas fa-file-pdf"></i> Factura PDF
                                    </button>
                                    <button class="btn btn-outline-primary">
                                       <i class="fas fa-file-code"></i> Factura XML
                                    </button>
                                 </div>
                              </div>
                              <!-- Acciones -->
                              <div class="row">
                                 <div class="col-12">
                                    <h5>Acciones</h5>
                                    <button class="btn btn-outline-secondary me-2"
                                       @click="showAnularModal(ventaDetails.cuf)"
                                       :disabled="ventaDetails.estado !== 'PROCESADO'">
                                       <i class="fas fa-ban"></i> Anular
                                    </button>
                                 </div>
                              </div>

                           </div>
                           <div v-else>
                              <p>No se encontraron detalles de la venta.</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <!-- Nuevo modal para ingresar motivo y tipo de anulación -->
               <div class="modal fade" :class="modalAnular ? 'show d-block' : ''" id="AnularModal" tabindex="-1"
                  role="dialog" aria-labelledby="anularModalLabel" aria-hidden="true">
                  <div class="modal-dialog modal-dialog-centered" role="document">
                     <div class="modal-content">
                        <div class="modal-header">
                           <h5 class="modal-title" id="anularModalLabel">Anular Factura</h5>
                           <button type="button" class="btn-close text-dark" @click="modalAnular = false"
                              data-bs-dismiss="modal" aria-label="Close">
                              <span aria-hidden="true">&times;</span>
                           </button>
                        </div>
                        <div class="modal-body">
                           <div>
                              <div class="mb-3">
                                 <label for="motivoAnulacion" class="form-label">Motivo de Anulación</label>
                                 <input type="text" class="form-control" id="motivoAnulacion" v-model="motivo">
                              </div>
                              <div class="mb-3">
                                 <label for="tipoAnulacion" class="form-label">Tipo de Anulación</label>
                                 <input type="text" class="form-control" id="tipoAnulacion" v-model="tipoAnulacion">
                              </div>
                           </div>
                        </div>
                        <div class="modal-footer">
                           <button type="button" @click="modalAnular = false" class="btn bg-gradient-secondary w-100"
                              data-bs-dismiss="modal">Cerrar</button>
                           <button type="button" @click="AnularFactura" class="btn btn-danger w-100">Confirmar
                              Anulación</button>
                        </div>
                     </div>
                  </div>
               </div>

               <div class="col-12">
                  <div class="card">
                     <div class="card-body">
                        <div class="table-responsive">
                           <table class="table table-striped table-bordered">
                              <thead>
                                 <tr>
                                    <th class="py-0 px-1">#</th>
                                    <th class="py-0 px-1">FECHA</th>
                                    <th class="py-0 px-1">CODIGO - CLIENTE</th>
                                    <th class="py-0 px-1">CODIGO SEGUIMIENTO</th>
                                    <th class="py-0 px-1">DOCUMENTO</th>
                                    <th class="py-0 px-1">TOTAL</th>
                                    <th class="py-0 px-1"></th>
                                 </tr>
                              </thead>
                              <tbody>
                                 <tr v-for="(m, i) in list" :key="m.id">
                                    <td class="py-0 px-1">{{ i + 1 }}</td>
                                    <td class="py-0 px-1">{{ m.fecha }}</td>
                                    <td class="py-0 px-1">
                                       {{ m.cliente && m.cliente.codigoCliente ? m.cliente.codigoCliente : 'N/A' }} -
                                       {{ m.cliente && m.cliente.razonSocial ? m.cliente.razonSocial : 'N/A' }}

                                    </td>
                                    <td class="py-0 px-1">{{ m.codigoSeguimiento }}</td>
                                    <td class="py-0 px-1">
                                       {{ m.cliente ? m.cliente.documentoIdentidad : 'N/A' }}
                                    </td>
                                    <td class="py-0 px-1">{{ m.total }}</td>
                                    <td class="py-0 px-1">
                                       <div class="btn-group">
                                          <button type="button" @click="redirectTo(m.id)"
                                             class="btn btn-info btn-sm py-1 px-2" title="Ver venta">
                                             <i class="fas fa-eye"></i>
                                          </button>
                                          <button type="button" @click="ImprimirVenta(m)"
                                             class="btn btn-success btn-sm py-1 px-2" title="Imprimir venta">
                                             <i class="fas fa-print"></i>
                                          </button>
                                          <button type="button" title="Consultar Venta"
                                             @click="ConsultarVenta(m.codigoSeguimiento)"
                                             class="btn btn-danger btn-sm py-1 px-2">
                                             <i class="fas fa-info-circle"></i>
                                          </button>
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

         </div>
      </AdminTemplate>
   </div>
</template>

<script>
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

export default {
   head() {
      return {
         title: this.modulo,
      };
   },

   data() {
      return {
         load: true,
         list: [],
         ventaDetails: {
            detalleFactura: {
               cabecera: {}
            }
         },
         showModal: false,
         modalEdit: false,
         modalAnular: false, // Nuevo estado para el modal de anulación
         motivo: "", // Motivo de la anulación
         tipoAnulacion: "", // Tipo de anulación
         apiUrl: "ventas",
         page: "Ventas",
         modulo: "Lista de ventas",
         sucursal: {},
         url_editar: "/cajero/ventas/invoice/",
      };
   },

   methods: {
      async GET_DATA(path) {
         try {
            const res = await this.$admin.$get(path);
            return res;
         } catch (error) {
            console.error(`Error fetching data from ${path}:`, error);
         }
      },

      async EliminarItem(id) {
         this.load = true;
         try {
            await this.$admin.$delete(`${this.apiUrl}/${id}`);
            const updatedList = await this.GET_DATA(this.apiUrl);
            this.list = updatedList;
         } catch (error) {
            console.error(`Error deleting item ${id}:`, error);
         } finally {
            this.load = false;
         }
      },

      Eliminar(id) {
         this.$swal
            .fire({
               title: "Deseas Eliminar?",
               showDenyButton: false,
               showCancelButton: true,
               confirmButtonText: "Eliminar",
               cancelButtonText: `Cancelar`,
            })
            .then(async (result) => {
               if (result.isConfirmed) {
                  await this.EliminarItem(id);
               }
            });
      },

      async ImprimirVenta(venta) {
         try {
            let sucursal = this.sucursal;
            sucursal.venta = venta;
            const res = await this.$printer.$post(`${sucursal.impresora_url}venta`, sucursal);
            console.log('Impresión de venta:', res);
         } catch (error) {
            console.error('Error al imprimir venta:', error);
         }
      },

      async ConsultarVenta(codigoSeguimiento) {
         try {
            const res = await this.$admin.$get(`ventas/consultar/${codigoSeguimiento}`);
            console.log('Respuesta completa del API:', res); // Verifica cómo se estructura la respuesta
            this.ventaDetails = res; // Guarda los datos recibidos en la propiedad
            this.modalEdit = true;
         } catch (error) {
            console.error('Error al consultar venta:', error);
         }
      },

      redirectTo(id) {
         this.$router.push(`${this.url_editar}${id}`);
      },

      showAnularModal(cuf) {
         this.ventaDetails.cuf = cuf;
         this.modalAnular = true;
      },

      async AnularFactura() {
         try {
            const res = await this.$admin.patch(`ventas/anular/${this.ventaDetails.cuf}`, {
               motivo: this.motivo,
               tipoAnulacion: this.tipoAnulacion
            });

            if (res.status === 200) {
               this.$swal.fire('Éxito', 'La factura ha sido anulada correctamente.', 'success');
            } else {
               this.$swal.fire('Error', 'Hubo un problema al anular la factura.', 'error');
            }

            this.modalAnular = false;
            this.modalEdit = false;

            // Actualiza la lista de ventas
            const updatedList = await this.GET_DATA(this.apiUrl);
            this.list = updatedList;

         } catch (error) {
            console.error('Error al anular factura:', error);
            this.$swal.fire('Error', 'Hubo un problema al anular la factura.', 'error');
         }
      }
   },

   mounted() {
      this.$nextTick(async () => {
         try {
            const data = await this.GET_DATA(this.apiUrl);
            this.list = data;
         } catch (error) {
            console.error('Error al montar los datos:', error);
         } finally {
            this.load = false;
         }

         this.$nextTick(() => {
            const elements = document.querySelectorAll('.btn:not(.modal .btn)');
            elements.forEach(el => {
               tippy(el, {
                  theme: 'custom',
                  animation: 'scale',
                  content: el.getAttribute('title'),
                  onShow(instance) {
                     el.removeAttribute('title');
                  }
               });
            });
         });
      });
   },
};
</script>

<style>
/* Estilo personalizado para los tooltips */
.tippy-box[data-theme~='custom'] {
   background-color: #333;
   color: #fff;
   border-radius: 4px;
   font-size: 12px;
   padding: 5px 8px;
}
</style>
