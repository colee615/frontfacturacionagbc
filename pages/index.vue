<template>
   <div>
      <JcLoader :load="load" />
      <AdminTemplate :page="page" :modulo="modulo">
         <template v-slot:body>
            <div>
               <button v-if="showButton">Admin Only Button</button>
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
      role() {
         return this.$store.state.auth.role; // Access the role from the Vuex store
      },

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
   },
   mounted() {
      this.$nextTick(async () => {
         this.load = true;
         if (process.client && this.user) {
            await this.CASILLAS('todas-las-casillas'); // Llamar a la función CASILLAS para obtener los datos de las casillas
            this.load = false;
         } else {
            this.$router.push('/auth/login');
         }
         // Set showButton to true if the role is 'administrador'
         if (this.role === 'administrador') {
            this.showButton = true;
         }
      });
   }
};
</script>
