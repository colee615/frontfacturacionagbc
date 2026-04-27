<template>
   <footer class="footer enterprise-footer">
      <div class="enterprise-footer-shell">
         <div class="enterprise-footer-copy">
            <span class="enterprise-footer-year">© {{ year }}</span>
            <span class="enterprise-footer-dot">•</span>
            <span class="enterprise-footer-brand">AGBC Facturación</span>
         </div>
         <div class="enterprise-footer-meta">Operación segura de facturación</div>
      </div>
   </footer>
</template>

<script>
export default {
   computed: {
      year() {
         return new Date().getFullYear();
      }
   }
};
</script>

<style scoped>
.enterprise-footer {
   margin-top: 1.5rem;
}

.enterprise-footer-shell {
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: 1rem;
   padding: 0.95rem 0.25rem;
   background: transparent;
   border-top: 1px solid rgba(215, 222, 235, 0.82);
}

.enterprise-footer-copy {
   display: flex;
   align-items: center;
   gap: 0.55rem;
   color: #667085;
   font-weight: 700;
}

.enterprise-footer-year {
   color: #98a2b3;
}

.enterprise-footer-dot {
   color: #c9d2e3;
}

.enterprise-footer-brand {
   color: #344054;
}

.enterprise-footer-meta {
   color: #98a2b3;
   font-size: 0.92rem;
   font-weight: 600;
}

@media (max-width: 767px) {
   .enterprise-footer-shell {
      flex-direction: column;
      align-items: flex-start;
   }
}
</style>
