<template>
   <footer class="footer enterprise-footer">
      <div class="enterprise-footer-shell">
         <div class="enterprise-footer-copy">
            <span class="enterprise-footer-year">© 2024</span>
            <span class="enterprise-footer-dot">•</span>
            <span class="enterprise-footer-brand">AGBC Facturación</span>
         </div>
         <div class="enterprise-footer-meta">Panel administrativo</div>
      </div>
   </footer>
</template>

<style scoped>
.enterprise-footer {
   margin-top: 2rem;
}

.enterprise-footer-shell {
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: 1rem;
   padding: 1rem 1.25rem;
   border-radius: 18px;
   background: rgba(255, 255, 255, 0.75);
   border: 1px solid rgba(214, 223, 236, 0.9);
   box-shadow: 0 14px 30px rgba(15, 23, 42, 0.05);
}

.enterprise-footer-copy {
   display: flex;
   align-items: center;
   gap: 0.55rem;
   color: #7a5a10;
   font-weight: 700;
}

.enterprise-footer-year {
   color: #8d99ae;
}

.enterprise-footer-dot {
   color: #d0a11e;
}

.enterprise-footer-brand {
   color: #6c4a05;
}

.enterprise-footer-meta {
   color: #94a3b8;
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
