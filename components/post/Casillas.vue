<template>
   <div class="card p-0" @click="AgregarCarrito()">
      <div class="card h-100">
         <div class="card-body">
            <h5 class="card-title">Casilla ID: {{ casilla.casilla_id }}</h5>
            <p class="card-text">Estado: {{ casilla.casilla_estado }}</p>
         </div>
      </div>
   </div>
</template>
<script>
export default {
   props: {
      casilla: {
         type: Object,
         default: () => { },
      },
   },
   methods: {
      AgregarCarrito() {
         this.$emit('AddCarrito', this.casilla)
      }
   },
};
</script>
