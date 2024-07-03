<template>
   <div v-if="load" class="jc-loader">
      <img src="/assets/img/logo.png" alt="Loading..." />
      <p>Cargando...</p>
   </div>
</template>

<script>
export default {
   name: 'JcLoader',
   props: {
      load: {
         type: Boolean,
         required: true
      }
   }
}
</script>

<style scoped>
.jc-loader {
   position: fixed;
   top: 50%;
   left: 50%;
   transform: translate(-50%, -50%);
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   background-color: transparent;

   padding: 20px;
   border-radius: 8px;
   z-index: 9999;

}

img {
   width: 150px;
   /* Ajusta el tamaño de la imagen según tus necesidades */
   height: auto;
}

p {
   margin-top: 15px;
   /* Espacio entre la imagen y el texto */
   font-weight: bold;
   /* Texto en negrita */
}
</style>
