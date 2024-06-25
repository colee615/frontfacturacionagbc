<template>
   <div>
      <JcLoader :load="load"></JcLoader>
      <AdminTemplate :page="page" :modulo="modulo">
         <div slot="body">
            <div v-if="sucursalUbicacion">
               Sucursal Ubicación: {{ sucursalUbicacion }}
            </div>
            <div v-if="showButton">
               <!-- Botón que se mostrará/ocultará según los permisos -->
               <button>Acción restringida</button>
            </div>
         </div>
      </AdminTemplate>
   </div>
</template>

<script>
export default {
   name: "IndexPage",
   head() {
      return {
         title: "Index",
      };
   },
   data() {
      return {
         user: {},
         page: "Dashboard",
         modulo: "Dashboard",
         load: false,
         role: '',
         ubicacion: '',
         showButton: false,
      };
   },
   computed: {
      sucursalUbicacion() {
         return this.user.cajero && this.user.cajero.sucursale ? this.user.cajero.sucursale.ubicacion : null;
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
         if (this.role === 'cajero' && this.ubicacion === 'Oruro') {
            this.showButton = true;
         } else {
            this.showButton = false;
         }
      }
   },
   async mounted() {
      this.$nextTick(async () => {
         let user = localStorage.getItem('userAuth')
         this.user = JSON.parse(user);
         this.checkPermissions();
      });
   },
 
};
</script>
