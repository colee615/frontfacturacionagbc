const {loadNuxt,build}=require('nuxt');
(async()=>{const nuxt=await loadNuxt({for:'build',configOverrides:{buildDir:'.tmp/nuxt-financial-audit'}});try{await build(nuxt);}finally{await nuxt.close();}})().catch(e=>{console.error(e.message);process.exitCode=1;});
