<template>
  <button type="button" class="safe-service-card" @click="$emit('AddCarrito', servicio)" :aria-label="'Agregar ' + servicio.descripcion + ' al carrito'">
    <span class="safe-service-icon"><BaseIcon name="layers" :size="24" /></span>
    <span class="safe-service-description">{{ servicio.descripcion }}</span>
    <strong>{{ Number(servicio.precioUnitario).toFixed(2) }} <small>Bs</small></strong>
    <span class="safe-service-bottom"><span>{{ servicio.codigo }}</span><BaseIcon name="plus" :size="16" /></span>
  </button>
</template>
<script>
export default { props: { servicio: { type: Object, required: true } } };
</script>
<style scoped>
.safe-service-card { width: 100%; height: 100%; padding: 17px; border: 1px solid var(--safe-line); border-radius: 12px; background: var(--safe-surface); text-align: left; display: flex; flex-direction: column; gap: 12px; color: var(--safe-ink); transition: border-color .16s, transform .16s; }
.safe-service-card:hover { border-color: #58a9a0; transform: translateY(-2px); }
.safe-service-icon { width: 38px; height: 38px; display: grid; place-items: center; color: var(--safe-accent); background: var(--safe-tint); border-radius: 9px; }
.safe-service-description { font-size: 11px; line-height: 1.65; flex: 1; }
.safe-service-card strong { font-size: 19px; letter-spacing: -.025em; font-variant-numeric: tabular-nums; }
.safe-service-card small { font-size: 10px; color: var(--safe-muted); }
.safe-service-bottom { display: flex; justify-content: space-between; border-top: 1px solid var(--safe-line); padding-top: 10px; color: var(--safe-muted); font-size: 10px; width: 100%; }
</style>

