<template>
   <div>
      <JcLoader :load="load"></JcLoader>
      <AdminTemplate :page="page" :modulo="modulo">
         <div slot="body">
            <div class="row">
               <div class="col-12">
                  <div class="card">
                     <div class="card-body">
                        <input v-model="search" type="text" class="form-control" placeholder="Buscar por nombre">
                        <br>
                        <nuxtLink :to="url_nuevo" class="btn btn-dark btn-sm w-100 mb-2">
                           <i class="fas fa-plus"></i> Agregar
                        </nuxtLink>
                        <button @click="generateReport('excel')" class="btn btn-success btn-sm">
                           <i class="fas fa-file-excel"></i> Excel
                        </button>
                        <button @click="generateReport('pdf')" class="btn btn-danger btn-sm">
                           <i class="fas fa-file-pdf"></i> PDF
                        </button>
                        <div class="table-responsive">
                           <table class="table table-striped table-bordered">
                              <thead>
                                 <tr>
                                    <th class="py-0 px-1">#</th>
                                    <th class="py-0 px-1">NOMBRE</th>
                                    <th class="py-0 px-1">MUNICIPIO</th>
                                    <th class="py-0 px-1">DEPARTAMENTO</th>
                                    <th class="py-0 px-1">CODIGO SUCURSAL</th>
                                    <th class="py-0 px-1">DIRECCION</th>
                                    <th class="py-0 px-1">TELEFONO</th>
                                    <th class="py-0 px-1"></th>
                                 </tr>
                              </thead>
                              <tbody>
                                 <tr v-for="(m, i) in filteredList" :key="m.id">
                                    <td class="py-0 px-1">{{ i + 1 }}</td>
                                    <td class="py-0 px-1">{{ m.nombre }}</td>
                                    <td class="py-0 px-1">{{ m.municipio }}</td>
                                    <td class="py-0 px-1">{{ m.departamento }}</td>
                                    <td class="py-0 px-1">{{ m.codigosucursal }}</td>
                                    <td class="py-0 px-1">{{ m.direcccion }}</td>
                                    <td class="py-0 px-1">{{ m.telefono }}</td>
                                    <td class="py-0 px-1">
                                       <div class="btn-group">
                                          <nuxt-link :to="`${url_editar}${m.id}`" class="btn btn-info btn-sm py-1 px-2">
                                             <i class="fas fa-pen"></i>
                                          </nuxt-link>
                                          <button type="button" @click="Eliminar(m.id)"
                                             class="btn btn-danger btn-sm py-1 px-2">
                                             <i class="fas fa-trash"></i>
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
         apiUrl: 'sucursales',
         page: 'Administracion',
         modulo: 'Sucursales',
         url_nuevo: '/administrador/sucursales/nuevo',
         url_editar: '/administrador/sucursales/editar/',
         url_permisos: '/administrador/sucursales/permisos/',
      };
   },
   methods: {
      async GET_DATA(path) {
         const res = await this.$admin.$get(path);
         return res;
      },
      async EliminarItem(id) {
         this.load = true;
         try {
            const res = await this.$admin.$delete(this.apiUrl + '/' + id);
            console.log(res);
            await Promise.all([this.GET_DATA(this.apiUrl)]).then((v) => {
               this.list = v[0];
            });
         } catch (e) {
            console.error(e);
         } finally {
            this.load = false;
         }
      },
      Eliminar(id) {
         let self = this;
         this.$swal.fire({
            title: 'Deseas Eliminar?',
            showDenyButton: false,
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
         }).then(async (result) => {
            if (result.isConfirmed) {
               await self.EliminarItem(id);
            }
         });
      },
      generateReport(format) {
         const data = this.filteredList.map((item, index) => ({
            '#': index + 1,
            'Nombre': item.nombre,
            'Municipio': item.municipio,
            'Departamento': item.departamento,
            'Codigo Sucursal': item.codigosucursal,
            'Direccion': item.direcccion,
            'Telefono': item.telefono
         }));

         switch (format) {
            case 'excel':
               this.generateExcel(data);
               break;
            case 'pdf':
               this.generatePDF(data);
               break;
         }
      },
      generateExcel(data) {
         // Crear una hoja de trabajo y agregar los datos
         const ws = utils.json_to_sheet(data);

         // Aplicar estilos a la hoja de trabajo
         const wsOpts = {
            header: ['#', 'Nombre', 'Email', 'Sucursal', 'Estado'],
            font: {
               name: 'Arial',
               sz: 12,
               bold: true
            },
            fill: {
               fgColor: { rgb: "FFFF00" } // Fondo amarillo para encabezados
            },
            border: {
               top: { style: 'thin', color: { rgb: '000000' } },
               bottom: { style: 'thin', color: { rgb: '000000' } },
               left: { style: 'thin', color: { rgb: '000000' } },
               right: { style: 'thin', color: { rgb: '000000' } }
            }
         };

         // Aplicar estilos a los encabezados
         ws['!cols'] = [
            { wpx: 50 }, // Ancho de columna para '#'
            { wpx: 150 }, // Ancho de columna para 'Nombre'
            { wpx: 200 }, // Ancho de columna para 'Email'
            { wpx: 150 }, // Ancho de columna para 'Sucursal'
            { wpx: 100 }  // Ancho de columna para 'Estado'
         ];

         // Crear un libro de trabajo y agregar la hoja
         const wb = utils.book_new();
         utils.book_append_sheet(wb, ws, "Sucursales");

         // Guardar el archivo
         writeFile(wb, "sucursales.xlsx");
      },
      generatePDF(data) {
         const doc = new jsPDF();
         const tableColumn = ['#', 'Nombre', 'Municipio', 'Departamento', 'Codigo Sucursal', 'Direccion', 'Telefono'];
         const tableRows = data.map(item => [
            item['#'],
            item['Nombre'],
            item['Municipio'],
            item['Departamento'],
            item['Codigo Sucursal'],
            item['Direccion'],
            item['Telefono']
         ]);
         // Agregar el título
         doc.setFontSize(18);
         doc.text('Reporte de sucursales', 14, 22);

         // Estilos para la tabla
         autoTable(doc, {
            startY: 30,
            head: [tableColumn],
            body: tableRows,
            styles: {
               cellPadding: 5,
               fontSize: 6,
               valign: 'middle',
               overflow: 'linebreak',
               fillColor: [255, 255, 255],
               textColor: [0, 0, 0],
               lineColor: [44, 62, 80],
               lineWidth: 0.75
            },
            headStyles: {
               fillColor: [44, 62, 80],
               textColor: [255, 255, 255],
               fontSize: 6,
               fontStyle: 'bold'
            },
            footStyles: {
               fillColor: [44, 62, 80],
               textColor: [255, 255, 255],
               fontSize: 6,
               fontStyle: 'bold'
            },
            theme: 'grid'
         });
         // Guardar el archivo PDF
         doc.save('sucursales.pdf');
      },
   },
   computed: {
      user() {
         return this.$store.state.auth.user;
      },
      filteredList() {
         return this.list.filter(item => item.nombre.toLowerCase().includes(this.search.toLowerCase()));
      }
   },
   mounted() {
      this.$nextTick(async () => {
         if (this.user.role !== 'administrador') {
            this.$router.push('/'); // Redirige a la página principal
         } else {
            try {
               await Promise.all([this.GET_DATA(this.apiUrl)]).then((v) => {
                  this.list = v[0];
               });
            } catch (e) {
               console.error(e);
            } finally {
               this.load = false;
            }
         }
      });
   },
};
</script>
