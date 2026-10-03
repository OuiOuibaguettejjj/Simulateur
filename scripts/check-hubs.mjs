#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const ROOT=process.cwd(), errors=[];
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const walk=(dir,out=[])=>{for(const e of fs.readdirSync(path.join(ROOT,dir),{withFileTypes:true})){const r=path.posix.join(dir,e.name);if(e.isDirectory()){if(![".git","node_modules"].includes(e.name))walk(r,out)}else out.push(r)}return out};
const files=walk(""), taxonomy=JSON.parse(read("data/tools.json")), tools=taxonomy.tools, categories=taxonomy.categories;
const ALLOWED_TYPES=new Set(["calculateur","simulateur","conversion","comparateur"]);
const fail=m=>errors.push(m);
for(const [slug,meta] of Object.entries(tools)){
  if(!ALLOWED_TYPES.has(meta?.type))fail("invalid tool type for "+slug+": "+(meta?.type??"(missing)")+"; expected calculateur, simulateur, conversion or comparateur");
  if(!meta?.category||!Object.hasOwn(categories,meta.category))fail("invalid tool category for "+slug+": "+(meta?.category??"(missing)")+"; category must exist in data/tools.json.categories");
}
const toolSlugs=html=>{const out=[];for(const part of html.split('href="/outil/').slice(1)){const s=part.split('/"')[0];if(s&&!out.includes(s))out.push(s)}return out};
const cardParts=html=>html.split('<article class="card').slice(1).map(x=>'<article class="card'+x.split("</article>")[0]+'</article>');
for(const [cat,meta] of Object.entries(categories)){const p="public"+meta.path+"index.html";if(!fs.existsSync(path.join(ROOT,p))){fail("missing category hub: "+p);continue}const expected=new Set(Object.entries(tools).filter(([,m])=>m.category===cat).map(([s])=>s)),main=new Set();for(const c of cardParts(read(p))){const sl=toolSlugs(c)[0];if(!sl)continue;if(expected.has(sl)){if(c.includes("see-also"))fail(p+": primary tool marked see-also: "+sl);main.add(sl)}else if(!c.includes("see-also"))fail(p+": cross-category tool missing see-also: "+sl)}for(const s of expected)if(!main.has(s))fail(p+": missing primary tool: "+s);for(const s of main)if(!expected.has(s))fail(p+": unexpected primary tool: "+s)}
for(const [type,p] of Object.entries({calculateur:"public/calculateurs/index.html",simulateur:"public/simulateurs/index.html"})){const expected=new Set(Object.entries(tools).filter(([,m])=>m.type===type).map(([s])=>s)),got=new Set(toolSlugs(read(p)));for(const s of expected)if(!got.has(s))fail(p+": missing "+type+": "+s);for(const s of got)if(!expected.has(s))fail(p+": unexpected "+type+": "+s)}
const conv=read("public/conversions/index.html");for(const s of toolSlugs(conv))if(tools[s]?.type!=="conversion")fail("conversions hub intruder: /outil/"+s+"/ has type "+(tools[s]?.type??"(unknown)")+", expected conversion");for(const p of files.filter(x=>/^public\/conversion\/[^/]+\/index\.html$/.test(x))){const s=p.split("/")[2];if(!conv.includes("/conversion/"+s+"/"))fail("conversions hub missing: "+s)}for(const [s,m] of Object.entries(tools))if(m.type==="conversion"&&!conv.includes("/outil/"+s+"/"))fail("conversions hub missing tool: "+s);
const comp=read("public/comparateurs/index.html");for(const s of toolSlugs(comp))if(tools[s]?.type!=="comparateur")fail("comparateurs hub intruder: /outil/"+s+"/ has type "+(tools[s]?.type??"(unknown)")+", expected comparateur");for(const p of files.filter(x=>/^public\/comparateur\/[^/]+\/index\.html$/.test(x))){const s=p.split("/")[2];if(!comp.includes("/comparateur/"+s+"/"))fail("comparateurs hub missing: "+s)}for(const [s,m] of Object.entries(tools))if(m.type==="comparateur"&&!comp.includes("/outil/"+s+"/"))fail("comparateurs hub missing tool: "+s);
const home=read("public/index.html");for(const meta of Object.values(categories))if(!home.includes('href="'+meta.path+'"'))fail("home missing category: "+meta.path);
if(errors.length){console.error(errors.join("\n"));process.exit(1)}
console.log("Hub taxonomy check passed.");