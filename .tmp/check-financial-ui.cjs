const fs=require('fs');const compiler=require('vue-template-compiler');const parser=require('@babel/parser');
for(const f of ['lista','sucursal','servicios','auditoria']){
 const s=compiler.parseComponent(fs.readFileSync('pages/cajero/ventas/'+f+'.vue','utf8'));
 const r=compiler.compile(s.template.content);
 parser.parse(s.script.content,{sourceType:'module',plugins:['optionalChaining']});
 console.log(f,JSON.stringify(r.errors));if(r.errors.length)process.exitCode=1;
}
