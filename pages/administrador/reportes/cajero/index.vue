<template>
   <div>
      <AdminTemplate :page="page" :modulo="modulo">
         <div slot="body">
            <div class="row justify-content-md-center">
               <div class="form-group mt-3">
                  <label for="cajeroSelect">Seleccione un cajero:</label>
                  <select id="cajeroSelect" v-model="selectedCajero" class="form-control">
                     <option v-for="cajero in filteredList" :key="cajero.id" :value="cajero.id">
                        {{ cajero.name }} - {{ cajero.email }}
                     </option>
                  </select>
               </div>
               <div class="col-lg-8 mx-auto" v-if="selectedCajero">
                  <div class="card mb-4">
                     <div class="card-header p-3 pb-0">
                        <div class="d-flex justify-content-between align-items-center">
                           <div>
                              <h6>Detalle de cajero</h6>
                              <p class="text-sm mb-0">
                                 <strong>Nombre:</strong> {{ selectedCajeroDetails.name }}
                              </p>
                              <p class="text-sm mb-0">
                                 <strong>Email:</strong> {{ selectedCajeroDetails.email }}
                              </p>
                              <p class="text-sm mb-0">
                                 <strong>Sucursal:</strong> {{ selectedCajeroDetails.sucursale.departamento }}
                              </p>
                              <p class="text-sm mb-0">
                                 <strong>Estado:</strong> {{ formatEstado(selectedCajeroDetails.estado) }}
                              </p>
                           </div>
                           <button @click="$router.back()" class="btn bg-gradient-info btn-sm mb-0">
                              <i class="ni ni-bold-left"></i> Regresar
                           </button>
                        </div>
                     </div>
                     <div class="card-body p-3 pt-0">
                        <hr class="horizontal dark mt-0 mb-4" />
                        <div class="row">
                           <div class="d-flex">
                              <div>
                                 <h6 class="text-lg mb-0 mt-2"></h6>
                                 <p class="text-sm mb-3"></p>
                                 <span class="badge badge-sm bg-gradient-success">
                                    <i class="fas fa-barcode"></i>
                                 </span>
                              </div>
                           </div>
                        </div>
                        <hr class="horizontal dark mt-4 mb-4" />
                        <div class="row">
                           <div class="col-lg-8 col-md-6 col-12">
                              <h6 class="mb-3 mt-4">Información</h6>
                              <ul class="list-group">
                                 <li class="list-group-item border-0 d-flex p-4 mb-2 bg-gray-100 border-radius-lg">
                                    <div class="d-flex flex-column">
                                       <h6 class="mb-3 text-sm">Detalle de venta</h6>
                                       <span class="mb-2 text-xs">Código de Seguimiento:
                                          <span class="text-dark font-weight-bold ms-2"></span>
                                       </span>
                                       <span class="mb-2 text-xs">Cliente:
                                          <span class="text-dark font-weight-bold ms-2"></span>
                                       </span>
                                       <span class="mb-2 text-xs">Documento Identidad:
                                          <span class="text-dark font-weight-bold ms-2"></span>
                                       </span>
                                       <span class="mb-2 text-xs">Cajero:
                                          <span class="text-dark font-weight-bold ms-2"></span>
                                       </span>
                                    </div>
                                 </li>
                              </ul>
                           </div>
                           <div class="col-lg-4 col-12 ms-auto">
                              <div class="d-flex justify-content-between mt-4">
                                 <span class="mb-2 text-lg">Total:</span>
                                 <span class="text-dark text-lg ms-2 font-weight-bold">{{ totalVentasDelDia }}</span>
                              </div>
                              <div class="text-center mt-2">
                                 <img src="/assets/img/logo.png" alt="Imagen Descriptiva"
                                    style="width: 150px; height: auto;">
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
            <div v-if="selectedCajero">
               <h5 class="mt-4">Detalles del Cajero</h5>
               <p><strong>Nombre:</strong> {{ selectedCajeroDetails.name }}</p>
               <p><strong>Email:</strong> {{ selectedCajeroDetails.email }}</p>
               <p><strong>Sucursal:</strong> {{ selectedCajeroDetails.sucursale.departamento }}</p>
               <p><strong>Estado:</strong> {{ formatEstado(selectedCajeroDetails.estado) }}</p>
               <div class="btn-group">
                  <nuxt-link :to="`${url_editar}${selectedCajeroDetails.id}`" class="btn btn-info btn-sm py-1 px-2">
                     <i class="fas fa-pen"></i>
                  </nuxt-link>
                  <button v-if="selectedCajeroDetails.estado === 1" type="button"
                     @click="confirmarEliminar(selectedCajeroDetails.id)" class="btn btn-danger btn-sm py-1 px-2">
                     <i class="fas fa-trash"></i>
                  </button>
                  <button v-if="selectedCajeroDetails.estado === 2" type="button"
                     @click="confirmarActivar(selectedCajeroDetails.id)" class="btn btn-success btn-sm py-1 px-2">
                     <i class="fas fa-check"></i>
                  </button>
               </div>
               <button @click="fetchVentasDelDia(selectedCajeroDetails.id)" class="btn btn-primary btn-sm mt-2">
                  Ver Ventas del Día
               </button>
               <div v-if="ventasDelDia.length > 0" class="mt-3">
                  <h5>Ventas del Día</h5>
                  <ul>
                     <li v-for="venta in ventasDelDia" :key="venta.id">
                        {{ venta.cliente.name }} - {{ venta.total }}
                     </li>
                  </ul>
                  <p><strong>Total del día:</strong> {{ totalVentasDelDia }}</p>
               </div>
            </div>
         </div>
      </AdminTemplate>
   </div>
</template>

<script>
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { utils, writeFile } from 'xlsx';

export default {
   name: "IndexPage",
   head() {
      return {
         title: this.modulo,
      };
   },
   data() {
      return {
         load: true,
         list: [],
         search: '',
         apiUrl: 'cajeros',
         page: 'Administración',
         modulo: 'Cajeros',
         url_nuevo: '/administrador/cajeros/nuevo',
         url_editar: '/administrador/cajeros/editar/',
         currentPage: 1,
         itemsPerPage: 14,
         selectedCajero: null,
         ventasDelDia: [],
         totalVentasDelDia: 0
      };
   },
   computed: {
      user() {
         return this.$store.state.auth.user;
      },
      filteredList() {
         return this.list.filter(item => item.name.toLowerCase().includes(this.search.toLowerCase()));
      },
      selectedCajeroDetails() {
         return this.list.find(item => item.id === this.selectedCajero) || {};
      }
   },
   methods: {
      async GET_DATA(path) {
         const res = await this.$admin.$get(path);
         return res;
      },
      async EliminarItem(id) {
         this.load = true;
         try {
            await this.$admin.$delete(`${this.apiUrl}/${id}`);
            const [data] = await Promise.all([this.GET_DATA(this.apiUrl)]);
            this.list = data;
            this.$swal.fire({
               toast: true,
               position: 'center',
               showConfirmButton: false,
               icon: 'success',
               title: 'Cajero eliminado exitosamente',
               timer: 2000,
               timerProgressBar: true,
            });
         } catch (e) {
            this.$swal.fire({
               toast: true,
               position: 'center',
               showConfirmButton: false,
               icon: 'error',
               title: 'Hubo un problema al eliminar al cajero. Intente nuevamente.',
               timer: 2000,
               timerProgressBar: true,
            });
         } finally {
            this.load = false;
         }
      },
      confirmarEliminar(id) {
         this.$swal.fire({
            toast: false,
            position: 'center',
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: '<span style="font-weight: bold;">Sí, Eliminar</span>',
            cancelButtonText: '<span style="font-weight: bold;">No, Cancelar</span>',
            title: "",
            html: '<div style="text-align: center;"><div style="font-size: 20px;">¿Deseas eliminar al Cajero?</div></div>',
            icon: 'warning',
            dangerMode: true,
         }).then(async (result) => {
            if (result.isConfirmed) {
               await this.EliminarItem(id);
            }
         });
      },
      confirmarActivar(id) {
         this.$swal.fire({
            toast: false,
            position: 'center',
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: '<span style="font-weight: bold;">Sí, Activar</span>',
            cancelButtonText: '<span style="font-weight: bold;">No, Cancelar</span>',
            title: "",
            html: '<div style="text-align: center;"><div style="font-size: 20px;">¿Deseas activar al Cajero?</div></div>',
            icon: 'warning',
            dangerMode: true,
         }).then(async (result) => {
            if (result.isConfirmed) {
               await this.ActivarItem(id);
            }
         });
      },
      async ActivarItem(id) {
         this.load = true;
         try {
            await this.$admin.$put(`${this.apiUrl}/${id}`, { estado: 1 });
            const [data] = await Promise.all([this.GET_DATA(this.apiUrl)]);
            this.list = data;
            this.$swal.fire({
               toast: true,
               position: 'center',
               showConfirmButton: false,
               icon: 'success',
               title: 'Cajero activado exitosamente',
               timer: 2000,
               timerProgressBar: true,
            });
         } catch (e) {
            this.$swal.fire({
               toast: true,
               position: 'center',
               showConfirmButton: false,
               icon: 'error',
               title: 'Hubo un problema al activar al cajero. Intente nuevamente.',
               timer: 2000,
               timerProgressBar: true,
            });
         } finally {
            this.load = false;
         }
      },
      async fetchVentasDelDia(id) {
         this.load = true;
         try {
            const res = await this.$admin.$get(`/ventas/dia/${id}`);
            this.ventasDelDia = res.ventas;
            this.totalVentasDelDia = res.total;
         } catch (e) {
            this.$swal.fire({
               toast: true,
               position: 'center',
               showConfirmButton: false,
               icon: 'error',
               title: 'Hubo un problema al obtener las ventas del día. Intente nuevamente.',
               timer: 2000,
               timerProgressBar: true,
            });
         } finally {
            this.load = false;
         }
      },
      formatEstado(estado) {
         switch (estado) {
            case 1:
               return 'Activo';
            case 2:
               return 'Inactivo';
            default:
               return 'Desconocido';
         }
      },
      descargarPDF() {
         const doc = new jsPDF();
         autoTable(doc, { html: '#cajerosTable' });
         doc.save('cajeros.pdf');
      },
      descargarExcel() {
         const ws = utils.json_to_sheet(this.list);
         const wb = utils.book_new();
         utils.book_append_sheet(wb, ws, 'Cajeros');
         writeFile(wb, 'cajeros.xlsx');
      }
   },
   async mounted() {
      this.load = true;
      try {
         const [data] = await Promise.all([this.GET_DATA(this.apiUrl)]);
         this.list = data;
      } catch (e) {
         this.$swal.fire({
            toast: true,
            position: 'center',
            showConfirmButton: false,
            icon: 'error',
            title: 'Hubo un problema al obtener los datos de cajeros. Intente nuevamente.',
            timer: 2000,
            timerProgressBar: true,
         });
      } finally {
         this.load = false;
      }
   }
};
</script>

<style scoped>
.btn-group {
   margin-top: 1rem;
}
</style>
