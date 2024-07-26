<template>
   <div>
      <JcLoader :load="load"></JcLoader>
      <AdminTemplate :page="page" :modulo="modulo">
         <div slot="body">

            <div class="row">
               <div class="col-12 mb-2">
                  <input v-model="searchNombre" type="text" class="form-control mb-2" placeholder="Buscar por nombre">
                  <input v-model="searchDocumento" type="text" class="form-control" placeholder="Buscar por documento">
               </div>

               <div class="col-12 mb-2 text-right">
                  <button @click="generateReport('excel')" class="btn btn-success btn-sm">
                     <i class="fas fa-file-excel"></i> Excel
                  </button>
                  <button @click="generateReport('pdf')" class="btn btn-danger btn-sm">
                     <i class="fas fa-file-pdf"></i> PDF
                  </button>
               </div>

               <div class="col-12">
                  <div class="card">
                     <div class="card-body">
                        <nuxt-link :to="url_nuevo" class="btn btn-dark btn-sm w-100 mb-2">
                           <i class="fas fa-plus"></i> Agregar
                        </nuxt-link>
                        <div class="table-responsive">
                           <table class="table table-striped table-bordered">
                              <thead>
                                 <tr>
                                    <th class="py-0 px-1">#</th>
                                    <th class="py-0 px-1">NOMBRE</th>
                                    <th class="py-0 px-1">DOCUMENTO ID</th>
                                    <th class="py-0 px-1">COMPLEMENTO</th>
                                    <th class="py-0 px-1">TIPO DOCUMENTO</th>
                                    <th class="py-0 px-1">CORREO</th>
                                    <th class="py-0 px-1">CODIGO CLIENTE</th>
                                    <th class="py-0 px-1"></th>
                                 </tr>
                              </thead>
                              <tbody>
                                 <tr v-for="(m, i) in filteredList" :key="m.id">
                                    <td class="py-0 px-1">{{ i + 1 }}</td>
                                    <td class="py-0 px-1">{{ m.razonSocial }}</td>
                                    <td class="py-0 px-1">{{ m.documentoIdentidad }}</td>
                                    <td class="py-0 px-1">{{ m.complemento }}</td>
                                    <td class="py-0 px-1">{{ tipoDocumentoMap[m.tipoDocumentoIdentidad] }}</td>
                                    <td class="py-0 px-1">{{ m.correo }}</td>
                                    <td class="py-0 px-1">{{ m.codigoCliente }}</td>
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
         searchNombre: '',
         searchDocumento: '',
         apiUrl: 'clientes',
         page: 'Administracion',
         modulo: 'Clientes',
         url_nuevo: '/administrador/clientes/nuevo',
         url_editar: '/administrador/clientes/editar/',
         tipoDocumentoMap: {
            1: 'CI - Cédula de identidad',
            2: 'CEX - Cédula de identidad de extranjero',
            3: 'PAS - Pasaporte',
            4: 'OD - Otro Documento de Identidad',
            5: 'NIT - Número de identificación Tributaria',
         },
      };
   },
   methods: {
      async GET_DATA(path) {
         const res = await this.$admin.$get(path);
         return res
      },

      async EliminarItem(id) {
         this.load = true
         try {
            const res = await this.$admin.$delete(this.apiUrl + '/' + id);
            console.log(res)
            await Promise.all([this.GET_DATA(this.apiUrl)]).then((v) => {
               this.list = v[0]
            })
         } catch (e) {

         } finally {
            this.load = false
         }
      },
      Eliminar(id) {
         let self = this
         this.$swal.fire({
            title: 'Deseas Eliminar?',
            showDenyButton: false,
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelarButtonText: `Cancelar`,
         }).then(async (result) => {
            if (result.isConfirmed) {
               await self.EliminarItem(id)
            }
         })
      },
      generateReport(format) {
         const data = this.filteredList.map((item, index) => ({
            '#': index + 1,
            'Nombre': item.razonSocial,
            'Documento id': item.documentoIdentidad,
            'Complemento': item.complemento,
            'Tipo Documento': this.tipoDocumentoMap[item.tipoDocumentoIdentidad] || 'Desconocido', // Mapeo correcto aquí
            'Correo': item.correo,
            'Codigo cliente': item.codigoCliente
         }));

         switch (format) {
            case 'excel':
               this.generateExcel(data);
               break;
            case 'pdf':
               this.generatePDF(data);
               break;
         }
      }
      ,
      generateExcel(data) {
         // Crear una hoja de trabajo y agregar los datos
         const ws = utils.json_to_sheet(data);

         // Aplicar estilos a la hoja de trabajo
         const wsOpts = {
            header: ['#', 'Nombre', 'Documento id', 'Complemento', 'Tipo documento', 'Correo', 'Codigo cliente'],
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
         utils.book_append_sheet(wb, ws, "Clientes");

         // Guardar el archivo
         writeFile(wb, "clientes.xlsx");
      }
      ,
      generatePDF(data) {
         const doc = new jsPDF();
         const tableColumn = ['#', 'Nombre', 'Documento id', 'Complemento', 'Tipo documento', 'Correo', 'Codigo cliente'];

         // Mapeo de datos
         const tableRows = data.map(item => {
            // Verificar el valor del tipo de documento
            console.log(`Tipo de documento: ${item['Tipo Documento']}`);

            return [
               item['#'],
               item['Nombre'],
               item['Documento id'],
               item['Complemento'],
               item['Tipo Documento'],
               item['Correo'],
               item['Codigo cliente']
            ];
         });

         // Agregar el título
         doc.setFontSize(18);
         doc.text('Reporte de clientes', 14, 22);

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
         doc.save('clientes.pdf');
      }

      ,
   },
   computed: {
      filteredList() {
         return this.list.filter(m =>
            m.razonSocial.toLowerCase().includes(this.searchNombre.toLowerCase()) &&
            m.documentoIdentidad.toLowerCase().includes(this.searchDocumento.toLowerCase())
         );
      },
      user() {
         return this.$store.state.auth.user;
      },
   },
   mounted() {
      this.$nextTick(async () => {

         try {
            await Promise.all([this.GET_DATA(this.apiUrl)]).then((v) => {
               this.list = v[0]
            })
         } catch (e) {

         } finally {
            this.load = false
         }

      });
   },
};
</script>
