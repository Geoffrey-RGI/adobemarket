import {readFile,mkdir,writeFile,rm,cp} from 'node:fs/promises';
import {build} from 'esbuild';
await rm('dist',{recursive:true,force:true});await mkdir('dist/server',{recursive:true});
const browser=await build({entryPoints:['web/app.js'],bundle:true,write:false,format:'esm',target:'es2022',minify:true});
const assets={};for(const [path,file,type] of [['/','index.html','text/html; charset=utf-8'],['/style.css','style.css','text/css; charset=utf-8']])assets[path]={body:await readFile('web/'+file,'utf8'),type};
assets['/app.js']={body:browser.outputFiles[0].text,type:'text/javascript; charset=utf-8'};
await build({entryPoints:['worker/index.js'],bundle:true,outfile:'dist/server/index.js',format:'esm',platform:'browser',target:'es2022',banner:{js:'const ASSETS='+JSON.stringify(assets)+';'}});
await cp('drizzle','dist/drizzle',{recursive:true});
console.log('Built Cloudflare Worker, bundled Firebase client, and migrations');
