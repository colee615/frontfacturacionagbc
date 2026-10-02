<template>
  <main class="registration-page">
    <section class="registration-card">
      <span class="registration-check"><BaseIcon name="check" :size="34" /></span>
      <p class="registration-kicker">TODO LISTO</p>
      <h1>Tu cuenta ha sido creada</h1>
      <p>Ya puedes iniciar sesión para acceder a tu espacio de trabajo.</p>
      <nuxt-link to="/auth/login">Ir al inicio de sesión<BaseIcon name="arrow" :size="18" /></nuxt-link>
      <small>SAFE · Correos de Bolivia</small>
    </section>
  </main>
</template>
<style scoped>
.registration-page { min-height: 100vh; display: grid; place-items: center; padding: 24px; background: #f3f6f9; font-family: 'Inter', 'Segoe UI', sans-serif; }
.registration-card { max-width: 460px; padding: 48px 36px; text-align: center; border-radius: 18px; border: 1px solid #e4eaee; background: #fff; box-shadow: 0 12px 40px #14314a0a; }
.registration-check { display: grid; place-items: center; width: 72px; height: 72px; margin: 0 auto 28px; color: #168679; background: #e9f6f1; border-radius: 50%; }
.registration-kicker { color: #168679 !important; font-size: 9px !important; letter-spacing: .16em; font-weight: 700; }
.registration-card h1 { color: #203c50; font-size: 28px; letter-spacing: -.04em; margin-bottom: 18px; }
.registration-card p { font-size: 13px; line-height: 1.8; color: #788a9a; }
.registration-card a { display: flex; align-items: center; justify-content: center; gap: 22px; margin: 28px 0; padding: 13px; background: #087f82; color: white; border-radius: 8px; font-size: 12px; }
.registration-card small { font-size: 10px; color: #8d9ca9; }
</style>

