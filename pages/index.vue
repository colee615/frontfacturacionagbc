<template>
   <div>
      <JcLoader :load="load" />
      <AdminTemplate :page="page" :modulo="modulo">
         <template v-slot:body>
            <div v-if="sucursalUbicacion">
               Sucursal Ubicación: {{ sucursalUbicacion }}
            </div>

            {{ user }}

            <div v-if="showButton">
               <button>Acción restringida</button>
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
      };
   },
   computed: {
      user() {
         return this.$store.state.auth.user;
      },
      sucursalUbicacion() {
         return this.user && this.user.sucursale ? this.user.sucursale.ubicacion : null;
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
      checkPermissions() {
         if (this.user.role === 'cajero' && this.sucursalUbicacion === 'Oruro') {
            this.showButton = true;
         } else {
            this.showButton = false;
         }
      }
   },
   mounted() {
      this.$nextTick(() => {

         this.load = true;

         if (process.client && this.user) {
            this.checkPermissions();
            this.load = false;
         } else {
            this.$router.push('/auth/login');
         }
      });
   }
};
</script>
