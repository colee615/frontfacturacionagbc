<template>
   <div v-if="load" class="jc-loader">
      <span class="loader"></span>
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
   inset: 0;
   display: flex;
   align-items: center;
   justify-content: center;
   background: rgba(248, 250, 252, 0.72);
   backdrop-filter: blur(6px);
   z-index: 9999;
}

.loader {
   position: relative;
   display: inline-block;
   width: 48px;
   height: 48px;
   border-radius: 50%;
   border-top: 4px solid #ffffff;
   border-right: 4px solid transparent;
   box-sizing: border-box;
   animation: rotation 1s linear infinite;
}

.loader::after,
.loader::before {
   content: '';
   box-sizing: border-box;
   position: absolute;
   left: 0;
   top: 0;
   width: 48px;
   height: 48px;
   border-radius: 50%;
   border-bottom: 4px solid #f6c445;
   border-left: 4px solid transparent;
}

@keyframes rotation {
   0% {
      transform: rotate(0deg);
   }

   100% {
      transform: rotate(360deg);
   }
}
</style>
