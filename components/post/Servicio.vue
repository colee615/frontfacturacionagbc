<template>
   <div class="card service-card p-0" @click="AgregarCarrito()">
      <div class="card-header mx-4 mt-2 p-1 text-center bg-transparent border-0">
         <div class="icon icon-shape icon-lg service-icon-shell shadow text-center border-radius-lg">
            <i class="fas fa-archive opacity-10" aria-hidden="true"></i>
         </div>
      </div>
      <div class="card-body pt-0 p-2 text-center">
         <h6 class="text-center mb-1 text-xxs service-price">
            <i class="fas fa-barcode"></i>{{ Number(servicio.precioUnitario).toFixed(2) }}
         </h6>
         <span class="text-xs service-description">{{ servicio.descripcion }}</span>
         <hr class="horizontal my-2 service-divider" />
         <h5 class="mb-0 text-sm service-code">
            {{ servicio.codigo }}</h5>
      </div>
   </div>
</template>
<script>
export default {
   props: {
      servicio: {
         type: Object,
         default: () => { },
      },
   },
   methods: {
      AgregarCarrito() {
         this.$emit('AddCarrito', this.servicio)
      }
   },
};
</script>

<style scoped>
.service-card {
   border: 1px solid rgba(214, 183, 96, 0.22);
   border-radius: 22px;
   box-shadow: 0 16px 28px rgba(181, 145, 43, 0.1);
   background: linear-gradient(180deg, #ffffff 0%, #fffaf0 100%);
   transition: transform 0.2s ease, box-shadow 0.2s ease;
   cursor: pointer;
}

.service-card:hover {
   transform: translateY(-2px);
   box-shadow: 0 20px 34px rgba(181, 145, 43, 0.14);
}

.service-icon-shell {
   background: linear-gradient(135deg, #ffe38a 0%, #ffd54f 100%) !important;
   color: #8f6400;
}

.service-price {
   color: #9b7008;
   font-weight: 800;
}

.service-description {
   color: #6d5830;
   line-height: 1.35;
}

.service-divider {
   background-color: rgba(214, 183, 96, 0.22);
}

.service-code {
   color: #4f3907;
   font-weight: 800;
}
</style>
