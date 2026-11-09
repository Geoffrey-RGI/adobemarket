import {readFile,mkdir,writeFile,rm,cp} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist/server',{recursive:true});await mkdir('dist/.openai',{recursive:true});
const assets={};for(const [path,file,type] of [['/','index.html','text/html; charset=utf-8'],['/app.js','app.js','text/javascript; charset=utf-8'],['/style.css','style.css','text/css; charset=utf-8']])assets[path]={body:await readFile('web/'+file,'utf8'),type};
const code=await readFile('worker/index.js','utf8');await writeFile('dist/server/index.js','const ASSETS='+JSON.stringify(assets)+';\n'+code);
await cp('.openai/hosting.json','dist/.openai/hosting.json');await cp('drizzle','dist/drizzle',{recursive:true});
console.log('Built Worker, assets, and migrations');
