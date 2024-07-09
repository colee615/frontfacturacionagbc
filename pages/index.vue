<template>
   <div>
      <JcLoader :load="load" />
      <AdminTemplate :page="page" :modulo="modulo">
         <template v-slot:body>

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
   },
   mounted() {
      this.load = true;
      if (this.user) {
         this.load = false;
      } else {
         this.$router.push('/auth/login');
      }
   },

};
</script>
