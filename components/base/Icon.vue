<template>
  <svg class="safe-icon" xmlns="http://www.w3.org/2000/svg" :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    <path v-for="(path, index) in paths" :key="index" :d="path" />
  </svg>
</template>
<script>
const icons = {
  home: ['M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z'],
  send: ['m22 2-7 20-4-9-9-4Z', 'M22 2 11 13'],
  bell: ['M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9', 'M10 21h4'],
  chart: ['M4 3v18h17', 'M8 16v-4m5 4V7m5 9V4'],
  layers: ['m12 3 10 5-10 5L2 8Z', 'm2 12 10 5 10-5', 'm2 16 10 5 10-5'],
  file: ['M14 2H5a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8Z', 'M14 2v6h6', 'M8 13h8m-8 4h5'],
  users: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0', 'M17 3a4 4 0 0 1 0 8m5 10v-2a4 4 0 0 0-3-3.87'],
  shield: ['M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6Z', 'm8 12 3 3 5-6'],
  key: ['M14 3a7 7 0 0 0-6 10L2 19v3h4v-3h3l2-2a7 7 0 1 0 3-14', 'M16 7h.01'],
  menu: ['M4 6h16M4 12h16M4 18h16'], close: ['m6 6 12 12M6 18 18 6'],
  arrow: ['M4 12h16m-6-6 6 6-6 6'], chevron: ['m9 5 7 7-7 7'],
  moon: ['M21 12.8A9 9 0 0 1 11.2 3 9 9 0 1 0 21 12.8Z'],
  sun: ['M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0', 'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5'],
  logout: ['M9 3H4v18h5', 'M9 12h13m-5-5 5 5-5 5'],
  calendar: ['M4 5h16v16H4Z', 'M16 3v4M8 3v4M4 11h16'],
  search: ['M18 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0', 'm16 16 5 5'],
  store: ['M3 10 5 3h14l2 7M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0', 'M5 13v8h14v-8M9 21v-6h6v6'],
  plus: ['M12 5v14M5 12h14'], check: ['m5 12 4 4L19 6'],
  mail: ['M3 5h18v14H3Z', 'm3 5 9 7 9-7']
};
export default {
  props: { name: { type: String, default: 'file' }, size: { type: [Number, String], default: 20 } },
  computed: { paths() { return icons[this.name] || icons.file; } }
};
</script>
<style scoped>
.safe-icon { display: inline-block; vertical-align: middle; flex-shrink: 0; }
</style>
