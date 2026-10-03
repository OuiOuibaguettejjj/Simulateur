#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT=process.cwd();
const STRUCT=new Set(["div","section","main","header","footer","nav","article","aside","details","ul","ol","table","form"]);\nconst OPTIONAL_END=new Set(["p","li","dt","dd","tr","td","th","thead","tbody","tfoot","option"]);
const VOID=new Set(["area","base","br","col","embed","hr","img","input","link","meta","source","track","wbr"]);
const ENT={amp:"&",lt:"<",gt:">",quot:'"',apos:"'",nbsp:"\u00a0",lsquo:"‘",rsquo:"’",ldquo:"“",rdquo:"”",laquo:"«",raquo:"»",hellip:"…",ndash:"–",mdash:"—",euro:"€",middot:"·"};
const read=f=>fs.readFileSync(path.join(ROOT,f),"utf8");
const norm=s=>String(s).replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z][a-z0-9]+);/gi,(x,e)=>e[0]==="#"?String.fromCodePoint(parseInt(e.slice(e[1].toLowerCase()==="x"?2:1),e[1].toLowerCase()==="x"?16:10)):ENT[e]??x).replace(/\s+/g," ").trim();
function parseAttrs(s){const a={},r=/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>]+)))?/g;let m;while(m=r.exec(s))a[m[1].toLowerCase()]=m[2]??m[3]??m[4]??"";return a}
export function parseHtml(html){
 const root={name:"#root",attrs:{},start:0,end:html.length,children:[],parent:null,texts:[]},stack=[root],errors=[],re=/<!--[\s\S]*?-->|<![^>]*>|<[^>]*>/g;let pos=0,raw=null,m;
 const add=(s,start)=>{if(s)stack[stack.length-1].texts.push({text:s,start})};
 while(m=re.exec(html)){if(m.index<pos)continue;if(raw){if(!new RegExp("^<\\s*/\\s*"+raw+"\\b","i").test(m[0]))continue;add(html.slice(pos,m.index),pos);raw=null}else add(html.slice(pos,m.index),pos);const t=m[0],start=m.index,end=start+t.length;pos=end;
  if(t.startsWith("<!--")||/^<!doctype\b/i.test(t))continue;
  const close=/^<\s*\/\s*([A-Za-z][\w:-]*)/.exec(t);
  if(close){const n=close[1].toLowerCase();let i=-1;for(let j=stack.length-1;j;j--)if(stack[j].name===n){i=j;break}if(i<0){if(!OPTIONAL_END.has(n))errors.push(t+" en trop")}else{for(let j=stack.length-1;j>i;j--)if(STRUCT.has(stack[j].name))errors.push("<"+stack[j].name+"> non fermé avant </"+n+">");stack[i].end=end;stack.length=i}continue}
  const open=/^<\s*([A-Za-z][\w:-]*)\b([\s\S]*?)\/?\s*>$/.exec(t);if(!open)continue;const n=open[1].toLowerCase(),node={name:n,attrs:parseAttrs(open[2].replace(/\/\s*$/,"")),start,end,children:[],parent:stack.at(-1),texts:[]};node.parent.children.push(node);
  if(!(/\/\s*>$/.test(t)||VOID.has(n))){stack.push(node);if(n==="script"||n==="style")raw=n}
 }
 if(!raw)add(html.slice(pos),pos);for(let i=stack.length-1;i;i--)if(STRUCT.has(stack[i].name))errors.push("<"+stack[i].name+"> non fermé");return{root,errors}
}
const walk=(n,p,o=[])=>{for(const c of n.children){if(p(c))o.push(c);walk(c,p,o)}return o};
const find=(r,q={})=>walk(r,n=>(!q.tag||n.name===q.tag)&&(!q.className||(n.attrs.class||"").split(/\s+/).includes(q.className))&&(q.id===undefined||n.attrs.id===q.id));
const text=n=>norm([...n.texts.map(x=>({s:x.start,t:x.text})),...n.children.map(c=>({s:c.start,t:text(c)}))].sort((a,b)=>a.s-b.s).map(x=>x.t).join(" "));
const excl=(n,k)=>((n.attrs.class||"").split(/\s+/).includes(k))?"":norm([...n.texts.map(x=>({s:x.start,t:x.text})),...n.children.map(c=>({s:c.start,t:excl(c,k)}))].sort((a,b)=>a.s-b.s).map(x=>x.t).join(" "));
const ancestor=(n,k)=>{for(let p=n.parent;p;p=p.parent)if((p.attrs.class||"").split(/\s+/).includes(k))return true;return false};
const attr=(n,k)=>n.attrs[k.toLowerCase()],links=n=>find(n,{tag:"a"});
const external=h=>{try{const u=new URL(h);return /^https?:$/.test(u.protocol)&&!["simulateur.site","www.simulateur.site"].includes(u.hostname.toLowerCase())}catch{return false}};
const pageHref=(h,idx)=>{const m=/^\/([^/]+)\/([^/]+)\/$/.exec(h||"");return!!m&&idx.has(m[1]+"/"+m[2])};
function ld(root){const ss=find(root,{tag:"script"}).filter(n=>(attr(n,"type")||"").toLowerCase()==="application/ld+json"),err=[],items=[];for(const n of ss){try{const v=JSON.parse(n.texts.map(x=>x.text).join("").trim()),add=v=>Array.isArray(v)?v.forEach(add):v&&typeof v==="object"?(Array.isArray(v["@graph"])?v["@graph"].forEach(add):items.push(v)):null;add(v)}catch(e){err.push("JSON-LD invalide : "+e.message)}}return{items,err}}
export function checkPage(html,ctx){
 const {dir,slug,toolsMeta,pageIndex}=ctx,{root,errors:bal}=parseHtml(html),e=[],fail=(rule,message)=>e.push({rule,message}),metas=find(root,{tag:"meta"}),he=find(root,{tag:"html"});
 if(!/^\s*<!doctype\s+html\s*>/i.test(html)||he.length!==1||attr(he[0],"lang")!=="fr"||!metas.some(n=>(attr(n,"name")||"").toLowerCase()==="viewport")||!metas.some(n=>(attr(n,"name")||"").toLowerCase()==="calculator-rendering"&&(attr(n,"content")||"").toLowerCase()==="static")||!find(root,{tag:"link"}).some(n=>(attr(n,"rel")||"").toLowerCase().split(/\s+/).includes("stylesheet")&&attr(n,"href")==="/styles.css"))fail("html-base","doctype/lang/viewport/static rendering/stylesheet incomplet");
 bal.forEach(m=>fail("markup-balance",m));
 const ts=find(root,{tag:"title"}),title=norm(ts[0]?text(ts[0]):"");if(ts.length!==1||!/^.+ \| Simulateur$/.test(title)||!title.slice(0,-13).trim())fail("title","title doit être de la forme « Mot-clé | Simulateur »");
 const ds=metas.filter(n=>(attr(n,"name")||"").toLowerCase()==="description"),description=norm(ds[0]?attr(ds[0],"content")||"":"");if(ds.length!==1||[...description].length<120||[...description].length>160)fail("description","meta description : "+[...description].length+" caractères, attendu 120–160");
 const canonical="https://simulateur.site/"+dir+"/"+slug+"/",cs=find(root,{tag:"link"}).filter(n=>(attr(n,"rel")||"").toLowerCase().split(/\s+/).includes("canonical"));if(cs.length!==1||attr(cs[0],"href")!==canonical)fail("canonical","canonique attendue : "+canonical);
 const bs=find(root,{className:"breadcrumb"}),b=bs[0],bl=b?links(b):[];if(!b||!bl.length||text(bl[0])!=="Accueil")fail("breadcrumb","le premier lien du breadcrumb doit être « Accueil »");
 const h1=find(root,{tag:"h1"});if(h1.length!==1||!text(h1[0]))fail("h1","exactement un h1 non vide est requis");
 const tool=find(root,{tag:"section",className:"tool"});if(tool.length!==1||!walk(tool[0],n=>n===h1[0]).length||!find(tool[0],{tag:"p",className:"tool-intro"}).some(n=>text(n)))fail("tool-block","section.tool unique avec h1 et p.tool-intro non vide requis");for(const id of["ey","title","intro","source"])if(find(root,{id}).length){fail("tool-block","id legacy interdit : "+id);break}
 const rs=find(root,{className:"result"});if(!rs.some(n=>text(n)))fail("result","au moins un .result doit avoir un texte non vide dans le HTML source");if(!rs.some(n=>attr(n,"aria-live")==="polite"))fail("result",'un .result doit avoir aria-live="polite"');
 if(!find(root,{className:"formula"}).some(n=>links(n).some(a=>external(attr(a,"href")))) )fail("formula",".formula doit contenir un lien externe http(s)");
 const secs=find(root,{className:"content-section"}),h2=secs.flatMap(s=>find(s,{tag:"h2"}).filter(n=>!ancestor(n,"related-tools")));if(!secs.length||h2.length<3)fail("content-h2","au moins 3 h2 éditoriaux requis");
 const rel=find(root,{className:"related-tools"});if(rel.length!==1)fail("related-block","exactement un bloc .related-tools est requis");const rl=rel.length===1?find(rel[0],{className:"related-link"}):[];if(rl.length<2||rl.length>4)fail("related-block","2 à 4 .related-link requis");
 const meta=toolsMeta?.[slug];for(const a of rl){const h=attr(a,"href"),m=/^\/[^/]+\/([^/]+)\/$/.exec(h||""),target=m?.[1];if(!pageHref(h,pageIndex))fail("related-block","lien associé vers une page inexistante : "+(h||"(vide)"));if(target&&!(meta?.relatedTools||[]).some(x=>x?.slug===target))fail("related-block","slug associé absent de TOOLS_META["+slug+"].relatedTools : "+target)}
 if(!meta||!Array.isArray(meta.relatedTools)||meta.relatedTools.length<2)fail("related-meta","TOOLS_META["+slug+"] doit exister avec au moins 2 relatedTools");
 const j=ld(root),wa=j.items.filter(x=>x["@type"]==="WebApplication"),br=j.items.filter(x=>x["@type"]==="BreadcrumbList");j.err.forEach(m=>fail("jsonld",m));if(wa.length!==1||br.length!==1)fail("jsonld","exactement un WebApplication et un BreadcrumbList sont requis");
 if(wa.length===1){if(wa[0].url!==canonical)fail("jsonld","WebApplication.url doit être le canonique");if(norm(wa[0].description||"")!==description)fail("jsonld","WebApplication.description doit égaler la meta description")}
 if(br.length===1){const it=br[0].itemListElement,names=b?text(b).split(/\s*·\s*/).map(norm):[];if(!Array.isArray(it)||it.length!==3)fail("jsonld","BreadcrumbList doit contenir 3 éléments");else{if(it[0]?.item!=="https://simulateur.site/"||it[2]?.item!==canonical)fail("jsonld","URLs du BreadcrumbList incorrectes");if(it.map(x=>norm(x?.name||"")).join("·")!==names.join("·"))fail("jsonld","noms du BreadcrumbList différents du breadcrumb visible")}}
 return e
}
export function checkAll(pages){const tm=new Map(),dm=new Map(),e=[];for(const p of pages){const{root}=parseHtml(p.html),t=find(root,{tag:"title"})[0],d=find(root,{tag:"meta"}).find(n=>(attr(n,"name")||"").toLowerCase()==="description"),tv=norm(t?text(t):""),dv=norm(d?attr(d,"content")||"":"");if(tv){if(tm.has(tv))e.push({path:p.path,rule:"meta-unique",message:"partage le même titre que "+tm.get(tv)});else tm.set(tv,p.path)}if(dv){if(dm.has(dv))e.push({path:p.path,rule:"meta-unique",message:"partage la même description que "+dm.get(dv)});else dm.set(dv,p.path)}}return e}
function discover(){const p=[];for(const dir of["outil","conversion","comparateur"]){const b=path.join(ROOT,"public",dir);if(!fs.existsSync(b)||!fs.statSync(b).isDirectory())continue;for(const x of fs.readdirSync(b,{withFileTypes:true})){const f=path.join(b,x.name,"index.html");if(x.isDirectory()&&fs.existsSync(f)&&fs.statSync(f).isFile())p.push({dir,slug:x.name,path:"public/"+dir+"/"+x.name+"/index.html",html:fs.readFileSync(f,"utf8")})}}return p.sort((a,b)=>a.path.localeCompare(b.path))}
export function loadToolsMeta(s){const m=s.match(/const CATEGORIES=(\{[\s\S]*?\});\s*const TOOLS_META=(\{[\s\S]*?\});\s*function toolMeta/);if(!m)throw Error("central taxonomy blocks are not parseable");try{return Function("return ("+m[2]+")")()}catch(e){throw Error("central taxonomy cannot be parsed: "+e.message)}}
const family=(p,m)=>p.dir==="outil"?(m[p.slug]?.type||"outil"):p.dir;
function main(){
 let pages;try{pages=discover()}catch(e){console.error(e.message);process.exit(1)}if(!pages.length){console.error("Aucune page outil trouvée.");process.exit(1)}
 let meta;try{meta=loadToolsMeta(read("public/simulateurs.js"))}catch(e){console.error(e.message);process.exit(1)}
 const idx=new Set(pages.map(p=>p.dir+"/"+p.slug)),fail=[];for(const p of pages)fail.push(...checkPage(p.html,{dir:p.dir,slug:p.slug,toolsMeta:meta,pageIndex:idx}).map(x=>({...x,path:p.path})));fail.push(...checkAll(pages));
 const rules=["html-base","markup-balance","title","description","canonical","breadcrumb","h1","tool-block","result","formula","content-h2","related-block","related-meta","jsonld","meta-unique"],counts=Object.fromEntries(rules.map(x=>[x,0]));for(const x of fail)if(x.rule in counts)counts[x.rule]++;
 const fam={};for(const p of pages){const f=family(p,meta);fam[f]=(fam[f]||0)+1}
 const ind=pages.map(p=>{const{root}=parseHtml(p.html),s=find(root,{className:"content-section"}),words=s.map(x=>excl(x,"related-tools")).join(" ").split(/\s+/).filter(Boolean).length,h=s.flatMap(x=>find(x,{tag:"h2"}).filter(n=>!ancestor(n,"related-tools"))).length,ext=find(root,{tag:"a"}).filter(a=>external(attr(a,"href"))).length;return{path:p.path,words,h2:h,external:ext}}),under=ind.filter(x=>x.words<120).length,noext=ind.filter(x=>x.external===0).length,total=pages.length;
 const a=["### (a) Règles","","| Règle | Pages en échec | Total |","|---|---:|---:|",...rules.map(r=>"| "+r+" | "+counts[r]+" | "+total+" |")].join("\n");
 const b=["### (b) Familles","","| Famille | Pages |","|---|---:|",...Object.entries(fam).sort(([x],[y])=>x.localeCompare(y)).map(([f,n])=>"| "+f+" | "+n+" |")].join("\n");
 const c=["### (c) Indicateurs","","| Indicateur | Valeur |","|---|---:|","| Pages sous 120 mots | "+under+" |","| Pages sans lien externe | "+noext+" |"].join("\n");
 const out=[a,b,c,"### Écarts","",...fail.map(x=>x.path+" ["+x.rule+"] "+x.message)].join("\n");
 if(process.env.GITHUB_STEP_SUMMARY&&!process.argv.includes("--json"))fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,[a,b,c].join("\n\n")+"\n");
 if(process.argv.includes("--json"))console.log(JSON.stringify({pages:pages.map(p=>({path:p.path,dir:p.dir,slug:p.slug,family:family(p,meta)})),rules:counts,families:fam,indicators:ind,pagesUnder120:under,pagesWithoutExternalLink:noext,failures:fail},null,2));else console.log(out);
 if(process.argv.includes("--strict")&&fail.length){for(const x of fail)console.error("::error file="+x.path+"::"+x.rule+" "+x.message);process.exit(1)}
}
if(import.meta.url===(process.argv[1]?pathToFileURL(path.resolve(process.argv[1])).href:""))main();
