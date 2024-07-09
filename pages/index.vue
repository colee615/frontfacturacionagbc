<template>
   <div>
      <JcLoader :load="load" />
      <AdminTemplate :page="page" :modulo="modulo">
         <template v-slot:body>
            <div v-if="sucursalUbicacion">
               Sucursal Ubicación: {{ sucursalUbicacion }}
            </div>

            <div v-if="showButton">
               <button>Acción restringida</button>
            </div>

            <div>
               <h3>Casillas IDs con alquiler activo:</h3>
               <ul>
                  <li v-for="casilla in casillasConAlquiler" :key="casilla.casilla_id">
                     {{ casilla.casilla_id }}
                  </li>
               </ul>
            </div>
         </template>
      </AdminTemplate>
   </div>
</template>

<script>
import Swal from 'sweetalert2';

export default {
   name: "IndexPage",
   data() {
      return {
         page: "Dashboard",
         modulo: "Dashboard",
         load: false,
         showButton: false,
         datos: {
            casillas: [] // Inicializar el arreglo para almacenar las casillas
         }
      };
   },
   computed: {
      user() {
         return this.$store.state.auth.user;
      },
      sucursalUbicacion() {
         return this.user && this.user.sucursale ? this.user.sucursale.ubicacion : null;
      },
      casillasConAlquiler() {
         // Filtrar las casillas con alquiler_estado: 1
         return this.datos.casillas.filter(casilla => casilla.casilla_estado === 1);
      }
   },
   methods: {
      async GET_DATA(path) {
         try {
            const res = await this.$admin.$get(path);
            return res;
         } catch (error) {
            console.error(error);
         }
      },
      async CASILLAS(path) {
         try {
            const res = await this.$casilla.$get(path);
            this.datos.casillas = res.casillas;
         } catch (error) {
            console.error(error);
         }
      },
      checkPermissions() {
         if (this.user.role === 'cajero' && this.sucursalUbicacion === 'Oruro') {
            this.showButton = true;
         } else {
            this.showButton = false;
         }
      }
   },
   mounted() {
      this.$nextTick(async () => {
         this.load = true;
         if (process.client && this.user) {
            await this.CASILLAS('todas-las-casillas'); // Llamar a la función CASILLAS para obtener los datos de las casillas
            this.checkPermissions();
            this.load = false;
         } else {
            this.$router.push('/auth/login');
         }

      });
   }
};
</script>