<template>
  <header class="safe-page-heading">
    <span class="safe-heading-icon"><BaseIcon :name="icon" :size="25" /></span>
    <div class="safe-heading-copy">
      <p v-if="eyebrow" class="safe-eyebrow">{{ eyebrow }}</p>
      <h1>{{ title }}</h1>
      <p v-if="description" class="safe-description">{{ description }}</p>
    </div>
    <div v-if="$slots.default" class="safe-heading-actions"><slot /></div>
  </header>
</template>
<script>
export default {
  props: {
    title: { type: String, required: true }, description: { type: String, default: '' },
    eyebrow: { type: String, default: '' }, icon: { type: String, default: 'file' }
  }
};
</script>
