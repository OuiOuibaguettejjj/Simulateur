#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT=process.cwd();
export const STRUCTURAL_RULES=["html-base","markup-balance","title","canonical","breadcrumb","h1","tool-block","result","related-block","jsonld","related-meta","citation-marker"];
export const EDITORIAL_RULES=["description","content-h2","formula","meta-unique"];
export const MIGRATION_LOCK_RULES=["description","content-h2","formula"];
export const TRACKED_RULES=[...STRUCTURAL_RULES,...EDITORIAL_RULES];
const STRUCT=new Set(["div","section","main","header","footer","nav","article","aside","details","ul","ol","table","form"]);
const OPTIONAL_END=new Set(["p","li","dt","dd","tr","td","th","thead","tbody","tfoot","option"]);
const VOID=new Set(["area","base","br","col","embed","hr","img","input","link","meta","source","track","wbr"]);
const ENT={amp:"&",lt:"<",gt:">",quot:'"',apos:"'",nbsp:"\u00a0",lsquo:"‘",rsquo:"’",ldquo:"“",rdquo:"”",laquo:"«",raquo:"»",hellip:"…",ndash:"–",mdash:"—",euro:"€",middot:"·"};
const read=f=>fs.readFileSync(path.join(ROOT,f),"utf8");
const norm=s=>String(s).replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z][a-z0-9]+);/gi,(x,e)=>e[0]==="#"?String.fromCodePoint(parseInt(e.slice(e[1].toLowerCase()==="x"?2:1),e[1].toLowerCase()==="x"?16:10)):ENT[e]??x).replace(/\s+/g," ").trim();
function badAttrNames(s){const r=/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>]+)))?/g,o=[];let m;while(m=r.exec(s))if(/["']/.test(m[1]))o.push(m[1]);return o}
function parseAttrs(s){const a={},r=/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>]+)))?/g;let m;while(m=r.exec(s))a[m[1].toLowerCase()]=m[2]??m[3]??m[4]??"";return a}
export function parseHtml(html){
 const root={name:"#root",attrs:{},start:0,end:html.length,children:[],parent:null,texts:[]},stack=[root],errors=[],re=/<!--[\s\S]*?-->|<![^>]*>|<[^>]*>/g;let pos=0,m;
 const add=(s,start)=>{if(s){if(s.startsWith(">")&&!["script","style"].includes(stack[stack.length-1].name))errors.push("« > » parasite juste après une balise");stack[stack.length-1].texts.push({text:s,start})}};
 while(m=re.exec(html)){if(m.index<pos)continue;add(html.slice(pos,m.index),pos);const t=m[0],start=m.index,end=start+t.length;pos=end;
  if(t.startsWith("<!--")||/^<!doctype\b/i.test(t))continue;
  const close=/^<\s*\/\s*([A-Za-z][\w:-]*)/.exec(t);
  if(close){const n=close[1].toLowerCase();let i=-1;for(let j=stack.length-1;j;j--)if(stack[j].name===n){i=j;break}if(i<0){if(!OPTIONAL_END.has(n))errors.push(t+" en trop")}else{for(let j=stack.length-1;j>i;j--)if(STRUCT.has(stack[j].name))errors.push("<"+stack[j].name+"> non fermé avant </"+n+">");stack[i].end=end;stack.length=i}continue}
  const open=/^<\s*([A-Za-z][\w:-]*)\b([\s\S]*?)\/?\s*>$/.exec(t);if(!open)continue;const n=open[1].toLowerCase(),node={name:n,attrs:parseAttrs(open[2].replace(/\/\s*$/,"")),start,end,children:[],parent:stack.at(-1),texts:[]};node.parent.children.push(node);for(const bad of badAttrNames(open[2]))errors.push("attribut malformé dans <"+n+"> : "+bad);
  if(!(/\/\s*>$/.test(t)||VOID.has(n))){stack.push(node);if(n==="script"||n==="style"){const closeIndex=html.toLowerCase().indexOf("</"+n,start+t.length);if(closeIndex<0){add(html.slice(start+t.length),start+t.length);pos=html.length;re.lastIndex=html.length}else{add(html.slice(start+t.length,closeIndex),start+t.length);pos=closeIndex;re.lastIndex=closeIndex}}}
 }
 if(pos<html.length)add(html.slice(pos),pos);for(let i=stack.length-1;i;i--)if(STRUCT.has(stack[i].name))errors.push("<"+stack[i].name+"> non fermé");return{root,errors}
}
const walk=(n,p,o=[])=>{for(const c of n.children){if(p(c))o.push(c);walk(c,p,o)}return o};
const find=(r,q={})=>walk(r,n=>(!q.tag||n.name===q.tag)&&(!q.className||(n.attrs.class||"").split(/\s+/).includes(q.className))&&(q.id===undefined||n.attrs.id===q.id));
const text=n=>norm([...n.texts.map(x=>({s:x.start,t:x.text})),...n.children.map(c=>({s:c.start,t:text(c)}))].sort((a,b)=>a.s-b.s).map(x=>x.t).join(" "));
const visibleText=n=>["script","style"].includes(n.name)?"":norm([...n.texts.map(x=>({s:x.start,t:x.text})),...n.children.map(c=>({s:c.start,t:visibleText(c)}))].sort((a,b)=>a.s-b.s).map(x=>x.t).join(" "));
const excl=(n,k)=>((n.attrs.class||"").split(/\s+/).includes(k))?"":norm([...n.texts.map(x=>({s:x.start,t:x.text})),...n.children.map(c=>({s:c.start,t:excl(c,k)}))].sort((a,b)=>a.s-b.s).map(x=>x.t).join(" "));
const ancestor=(n,k)=>{for(let p=n.parent;p;p=p.parent)if((p.attrs.class||"").split(/\s+/).includes(k))return true;return false};
const attr=(n,k)=>n.attrs[k.toLowerCase()],links=n=>find(n,{tag:"a"});
const external=h=>{try{const u=new URL(h);return /^https?:$/.test(u.protocol)&&!["simulateur.site","www.simulateur.site"].includes(u.hostname.toLowerCase())}catch{return false}};
const pageHref=(h,idx)=>{const m=/^\/([^/]+)\/([^/]+)\/$/.exec(h||"");return!!m&&idx.has(m[1]+"/"+m[2])};
function ld(root){const ss=find(root,{tag:"script"}).filter(n=>(attr(n,"type")||"").toLowerCase()==="application/ld+json"),err=[],items=[];for(const n of ss){try{const v=JSON.parse(n.texts.map(x=>x.text).join("").trim()),add=v=>Array.isArray(v)?v.forEach(add):v&&typeof v==="object"?(Array.isArray(v["@graph"])?v["@graph"].forEach(add):items.push(v)):null;add(v)}catch(e){err.push("JSON-LD invalide : "+e.message)}}return{items,err}}
export function summarize(fail,rules,total){const max=Number.isFinite(total)?Math.max(0,total):0;return Object.fromEntries(rules.map(rule=>{const rows=fail.filter(x=>x.rule===rule),pages=new Set(rows.map(x=>x.path));return[rule,{pages:Math.min(pages.size,max),messages:rows.length}] }))}
export function checkPage(html,ctx){
 const {dir,slug,toolsMeta,categories,pageIndex}=ctx,meta=toolsMeta?.[slug],{root,errors:bal}=parseHtml(html),e=[],fail=(rule,message)=>e.push({rule,message}),metas=find(root,{tag:"meta"}),he=find(root,{tag:"html"});
 if(!/<!doctype\s+html\s*>/i.test(html)||he.length!==1||attr(he[0],"lang")!=="fr"||!metas.some(n=>(attr(n,"name")||"").toLowerCase()==="viewport")||!metas.some(n=>(attr(n,"name")||"").toLowerCase()==="calculator-rendering"&&(attr(n,"content")||"").toLowerCase()==="static")||!find(root,{tag:"link"}).some(n=>(attr(n,"rel")||"").toLowerCase().split(/\s+/).includes("stylesheet")&&attr(n,"href")==="/styles.css"))fail("html-base","doctype/lang/viewport/static rendering/stylesheet incomplet");
 bal.forEach(m=>fail("markup-balance",m));
 const ts=find(root,{tag:"title"}),title=norm(ts[0]?text(ts[0]):"");if(ts.length!==1||!/^.+ \| Simulateur$/.test(title)||!title.slice(0,-13).trim())fail("title","title doit être de la forme « Mot-clé | Simulateur »");
 const ds=metas.filter(n=>(attr(n,"name")||"").toLowerCase()==="description"),description=norm(ds[0]?attr(ds[0],"content")||"":"");if(!description)fail("html-base","meta description absente ou vide");if(ds.length!==1||[...description].length<120||[...description].length>160)fail("description","meta description : "+[...description].length+" caractères, attendu 120–160");
 const canonical="https://simulateur.site/"+dir+"/"+slug+"/",cs=find(root,{tag:"link"}).filter(n=>(attr(n,"rel")||"").toLowerCase().split(/\s+/).includes("canonical"));if(cs.length!==1||attr(cs[0],"href")!==canonical)fail("canonical","canonique attendue : "+canonical);
 if(/(?:turn\d+search\d+|citeturn\d+search\d+)/i.test(visibleText(root)))fail("citation-marker","marqueur de citation ChatGPT détecté dans le texte visible");
 const bs=find(root,{className:"breadcrumb"}),b=bs[0],bl=b?links(b):[];if(!b||!bl.length||text(bl[0])!=="Accueil")fail("breadcrumb","le premier lien du breadcrumb doit être « Accueil »");
 const cat=dir==="outil"&&meta?.category?categories?.[meta.category]:undefined;if(dir==="outil"){if(!meta||!cat)fail("breadcrumb","catégorie introuvable dans data/tools.json pour "+slug);else{const cl=bl[1];if(!cl||attr(cl,"href")!==cat.path||text(cl)!==norm(cat.label))fail("breadcrumb","lien catégorie du breadcrumb attendu : "+cat.label+" ("+cat.path+")")}}
 const h1=find(root,{tag:"h1"});if(h1.length!==1||!text(h1[0]))fail("h1","exactement un h1 non vide est requis");
 const tool=find(root,{tag:"section",className:"tool"});if(tool.length!==1||!walk(tool[0],n=>n===h1[0]).length||!find(tool[0],{tag:"p",className:"tool-intro"}).some(n=>text(n)))fail("tool-block","section.tool unique avec h1 et p.tool-intro non vide requis");for(const id of["ey","title","intro","source"])if(find(root,{id}).length){fail("tool-block","id legacy interdit : "+id);break}
 if(dir==="outil"&&!walk(root,n=>["input","select","textarea","button"].includes(n.name)).length)fail("tool-block","au moins un input, select, textarea ou button est requis");
 const rs=find(root,{className:"result"});if(!rs.some(n=>text(n)))fail("result","au moins un .result doit avoir un texte non vide dans le HTML source");if(!rs.some(n=>attr(n,"aria-live")==="polite"))fail("result",'un .result doit avoir aria-live="polite"');
 if(!find(root,{className:"formula"}).some(n=>links(n).some(a=>external(attr(a,"href"))))&&!find(root,{className:"source-links"}).some(n=>links(n).some(a=>external(attr(a,"href")))))fail("formula",".formula ou .source-links doit contenir un lien externe http(s)");
 const secs=find(root,{className:"content-section"}),h2=secs.flatMap(s=>find(s,{tag:"h2"}).filter(n=>!ancestor(n,"related-tools")));if(!secs.length||h2.length<3)fail("content-h2","au moins 3 h2 éditoriaux requis");
 const rel=find(root,{className:"related-tools"});const htmlRelatedFamily=dir==="conversion"||dir==="comparateur";if(dir==="outil"&&cat&&rel.length===1){const categoryLinks=links(rel[0]).filter(a=>attr(a,"href")===cat.path);if(categoryLinks.length!==1||!categoryLinks.some(a=>text(a).includes(norm(cat.label))))fail("related-block","le lien « rubrique » doit exister une seule fois avec href "+cat.path+" et un texte contenant « "+cat.label+" »")}if(rel.length!==1)fail("related-block","exactement un bloc .related-tools est requis");if(rel.length===1){const rl=find(rel[0],{className:"related-link"});if(htmlRelatedFamily){let message="";if(rl.length<2||rl.length>4)message="2 à 4 .related-link requis";else{const selfHref="/"+dir+"/"+slug+"/",seen=new Set();for(const a of rl){const h=attr(a,"href")||"";if(!/^\/[^/]+\/[^/]+\/$/.test(h)){message="lien associé invalide : chemin interne attendu : "+(h||"(vide)");break}if(!pageHref(h,pageIndex)){message="lien associé vers une page inexistante : "+h;break}if(h===selfHref){message="auto-lien interdit : "+h;break}if(seen.has(h)){message="doublon dans les liens associés : "+h;break}seen.add(h)}}if(message)fail("related-block",message)}else{if(rl.length<2||rl.length>4)fail("related-block","2 à 4 .related-link requis");const actual=[];for(const a of rl){const h=attr(a,"href"),m=/^\/outil\/([^/]+)\/$/.exec(h||"");if(!pageHref(h,pageIndex))fail("related-block","lien associé vers une page inexistante : "+(h||"(vide)"));else if(!m)fail("related-block","lien associé hors /outil/ : "+h);if(m)actual.push(m[1])}const expected=Array.isArray(meta?.relatedTools)?meta.relatedTools:[];if(actual.join(",")!==expected.join(","))fail("related-block","slugs du bloc .related-tools différents de data/tools.json["+slug+"].relatedTools : HTML=["+actual.join(",")+"] data=["+expected.join(",")+"]")}}
 if(dir==="outil"&&(!meta||!Array.isArray(meta.relatedTools)||meta.relatedTools.length<2||meta.relatedTools.length>4))fail("related-meta","data/tools.json["+slug+"].relatedTools doit contenir de 2 à 4 slugs");
 const j=ld(root),wa=j.items.filter(x=>x["@type"]==="WebApplication"),br=j.items.filter(x=>x["@type"]==="BreadcrumbList");j.err.forEach(m=>fail("jsonld",m));if(wa.length!==1||br.length!==1)fail("jsonld","exactement un WebApplication et un BreadcrumbList sont requis");
 if(wa.length===1){if(wa[0].url!==canonical)fail("jsonld","WebApplication.url doit être le canonique");if(norm(wa[0].description||"")!==description)fail("jsonld","WebApplication.description doit égaler la meta description")}
 if(br.length===1){const it=br[0].itemListElement,names=b?text(b).split(/\s*·\s*/).map(norm):[];if(!Array.isArray(it)||it.length!==3)fail("jsonld","BreadcrumbList doit contenir 3 éléments");else{if(it[0]?.item!=="https://simulateur.site/"||it[2]?.item!==canonical)fail("jsonld","URLs du BreadcrumbList incorrectes");if(it.some((x,i)=>x?.position!==i+1))fail("jsonld","les positions du BreadcrumbList doivent être 1, 2, 3");if(dir==="outil"&&cat){const p2=it.find(x=>x&&x.position===2);if(!p2||norm(p2.name||"")!==norm(cat.label)||p2.item!=="https://simulateur.site"+cat.path)fail("jsonld","BreadcrumbList position 2 attendue : "+cat.label+" (https://simulateur.site"+cat.path+")")}if(it.map(x=>norm(x?.name||"")).join("·")!==names.join("·"))fail("jsonld","noms du BreadcrumbList différents du breadcrumb visible")}}
 return e
}
export function checkAll(pages){const tm=new Map(),dm=new Map(),e=[];for(const p of pages){const{root}=parseHtml(p.html),t=find(root,{tag:"title"})[0],d=find(root,{tag:"meta"}).find(n=>(attr(n,"name")||"").toLowerCase()==="description"),tv=norm(t?text(t):""),dv=norm(d?attr(d,"content")||"":"");if(tv){if(tm.has(tv))e.push({path:p.path,rule:"meta-unique",message:"partage le même titre que "+tm.get(tv)});else tm.set(tv,p.path)}if(dv){if(dm.has(dv))e.push({path:p.path,rule:"meta-unique",message:"partage la même description que "+dm.get(dv)});else dm.set(dv,p.path)}}return e}
function discover(){const p=[];for(const dir of["outil","conversion","comparateur"]){const b=path.join(ROOT,"public",dir);if(!fs.existsSync(b)||!fs.statSync(b).isDirectory())continue;for(const x of fs.readdirSync(b,{withFileTypes:true})){const f=path.join(b,x.name,"index.html");if(x.isDirectory()&&fs.existsSync(f)&&fs.statSync(f).isFile())p.push({dir,slug:x.name,path:"public/"+dir+"/"+x.name+"/index.html",html:fs.readFileSync(f,"utf8")})}}return p.sort((a,b)=>a.path.localeCompare(b.path))}
export function toolDirsWithoutIndex(base=path.join(ROOT,"public","outil")){if(!fs.existsSync(base)||!fs.statSync(base).isDirectory())return[];return fs.readdirSync(base,{withFileTypes:true}).filter(d=>d.isDirectory()&&!(fs.existsSync(path.join(base,d.name,"index.html"))&&fs.statSync(path.join(base,d.name,"index.html")).isFile())).map(d=>d.name).sort()}
export function loadTaxonomy(s=read("data/tools.json")){try{const v=typeof s==="string"?JSON.parse(s):s;return{categories:v.categories||{},tools:v.tools}}catch(e){throw Error("data/tools.json cannot be parsed: "+e.message)}}
export function loadToolsMeta(s){return loadTaxonomy(s).tools}
export const BASELINE_FILE="scripts/check-pages.baseline.json";
const pairKey=x=>x.path+"\u0000"+x.rule;
export function trackedPairs(failures){const seen=new Map();for(const x of failures)if(TRACKED_RULES.includes(x.rule))seen.set(pairKey(x),{path:x.path,rule:x.rule});return[...seen.values()].sort((a,b)=>a.path.localeCompare(b.path)||a.rule.localeCompare(b.rule))}
export function parseBaseline(text){let v;try{v=JSON.parse(text)}catch(e){throw Error(BASELINE_FILE+" illisible : "+e.message)}if(!Array.isArray(v))throw Error(BASELINE_FILE+" doit être une liste de { path, rule }");const seen=new Set();for(const x of v){if(!x||typeof x.path!=="string"||typeof x.rule!=="string")throw Error(BASELINE_FILE+" : entrée invalide "+JSON.stringify(x));if(!TRACKED_RULES.includes(x.rule))throw Error(BASELINE_FILE+" : règle inconnue « "+x.rule+" »");if(seen.has(pairKey(x)))throw Error(BASELINE_FILE+" : doublon "+x.path+" ["+x.rule+"]");seen.add(pairKey(x))}return v.map(x=>({path:x.path,rule:x.rule}))}
export function compareToBaseline(current,baseline){const cur=new Set(current.map(pairKey)),base=new Set(baseline.map(pairKey));return{added:current.filter(x=>!base.has(pairKey(x))),stale:baseline.filter(x=>!cur.has(pairKey(x)))}}
export function nextBaseline(current,baseline,migrationSlugs=[]){
 if(baseline===null)return{ok:true,initial:true,next:current,removed:[],blocked:[]};
 const{added,stale}=compareToBaseline(current,baseline);
 const debt=new Set(migrationSlugs);
 const blocked=stale.filter(x=>{
   const m=/^public\/outil\/([^/]+)\/index\.html$/.exec(x.path);
   return m&&debt.has(m[1])&&MIGRATION_LOCK_RULES.includes(x.rule);
 });
 if(blocked.length)return{ok:false,added,next:baseline,removed:[],blocked};
 if(added.length)return{ok:false,added,next:baseline,removed:[],blocked:[]};
 const gone=new Set(stale.map(pairKey));
 return{ok:true,initial:false,next:baseline.filter(x=>!gone.has(pairKey(x))),removed:stale,blocked:[]}
}
export function buildRatchetMessages({added=[],stale=[],blocked=[]}){
 const blockedKeys=new Set(blocked.map(pairKey));
 return [
  ...added.map(x=>"::error file="+x.path+"::cliquet : nouvel écart ["+x.rule+"] absent de la baseline"),
  ...stale.filter(x=>!blockedKeys.has(pairKey(x))).map(x=>"::error file="+x.path+"::cliquet : entrée périmée ["+x.rule+"] : l'écart est corrigé, retirez-la avec --update-baseline"),
  ...blocked.map(x=>"::error file="+x.path+"::cliquet anneeAMigrer : migrez le barème vers parametres.json, retirez anneeAMigrer, puis enrichissez l'outil ["+x.rule+"]")
 ];
}
export function seedBaseline(current,baseline){const present=new Set(baseline.map(x=>x.rule));const refused=EDITORIAL_RULES.filter(rule=>present.has(rule));if(refused.length)return{ok:false,refused,next:baseline,added:[]};const added=current.filter(x=>EDITORIAL_RULES.includes(x.rule));const next=[...baseline,...added].sort((a,b)=>a.path.localeCompare(b.path)||a.rule.localeCompare(b.rule));return{ok:true,refused:[],next,added};
}
const family=(p,m)=>p.dir==="outil"?(m[p.slug]?.type||"outil"):p.dir;
function main(){
 let pages;try{pages=discover()}catch(e){console.error(e.message);process.exit(1)}if(!pages.length||!pages.some(p=>p.dir==="outil")){console.error("Aucune page /outil/ trouvée.");process.exit(1)}
 let tax;try{tax=loadTaxonomy()}catch(e){console.error(e.message);process.exit(1)}const meta=tax.tools;
 const idx=new Set(pages.map(p=>p.dir+"/"+p.slug)),fail=[];for(const p of pages)fail.push(...checkPage(p.html,{dir:p.dir,slug:p.slug,toolsMeta:meta,categories:tax.categories,pageIndex:idx}).map(x=>({...x,path:p.path})));fail.push(...checkAll(pages));for(const d of toolDirsWithoutIndex())fail.push({path:"public/outil/"+d+"/",rule:"html-base",message:"dossier /outil/"+d+"/ sans index.html"});
 const total=pages.length,sev=r=>STRUCTURAL_RULES.includes(r)?"structurelle":"éditoriale",all=fail.map(x=>({...x,severity:sev(x.rule)})),sf=all.filter(x=>x.severity==="structurelle"),ef=all.filter(x=>x.severity==="éditoriale"),counts=summarize(all,[...STRUCTURAL_RULES,...EDITORIAL_RULES],total);
 const fam={};for(const p of pages){const f=family(p,meta);fam[f]=(fam[f]||0)+1}
 const ind=pages.map(p=>{const{root}=parseHtml(p.html),s=find(root,{className:"content-section"}),words=s.map(x=>excl(x,"related-tools")).join(" ").split(/\s+/).filter(Boolean).length,h=s.flatMap(x=>find(x,{tag:"h2"}).filter(n=>!ancestor(n,"related-tools"))).length,ext=find(root,{tag:"a"}).filter(a=>external(attr(a,"href"))).length;return{path:p.path,words,h2:h,external:ext}}),under=ind.filter(x=>x.words<120).length,noext=ind.filter(x=>x.external===0).length;
 const table=rs=>["| Règle | Pages en échec | Écarts | Total |","|---|---:|---:|---:|",...rs.map(r=>"| "+r+" | "+counts[r].pages+" | "+counts[r].messages+" | "+total+" |")].join("\n");
 const sp=new Set(sf.map(x=>x.path)).size;
 const a=["### (a) Règles STRUCTURELLES (bloquantes) — "+sf.length+" écart(s) sur "+sp+" page(s)","",table(STRUCTURAL_RULES)].join("\n");
 const b=["### (b) Règles ÉDITORIALES (bloquantes par cliquet) — "+ef.length+" écart(s)","",table(EDITORIAL_RULES),"","| Indicateur éditorial | Valeur |","|---|---:|","| Pages sous 120 mots | "+under+" |","| Pages sans lien externe | "+noext+" |"].join("\n");
 const c=["### (c) Familles","","| Famille | Pages |","|---|---:|",...Object.entries(fam).sort(([x],[y])=>x.localeCompare(y)).map(([f,n])=>"| "+f+" | "+n+" |")].join("\n");
 const out=[a,b,c,"### Écarts structurels","",...sf.map(x=>x.path+" ["+x.rule+"] "+x.message),"","### Écarts éditoriaux","",...ef.map(x=>x.path+" ["+x.rule+"] "+x.message)].join("\n");
 if(process.env.GITHUB_STEP_SUMMARY&&!process.argv.includes("--json"))fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,[a,b,c].join("\n\n")+"\n");
 if(process.argv.includes("--json"))console.log(JSON.stringify({pages:pages.map(p=>({path:p.path,dir:p.dir,slug:p.slug,family:family(p,meta)})),rules:{structural:STRUCTURAL_RULES,editorial:EDITORIAL_RULES},counts,families:fam,indicators:ind,pagesUnder120:under,pagesWithoutExternalLink:noext,structuralFailures:sf,editorialFailures:ef,failures:all},null,2));else if(!process.argv.includes("--update-baseline"))console.log(out);
 const baselinePath=path.join(ROOT,BASELINE_FILE),pairs=trackedPairs(all);
 const migrationData=JSON.parse(read("data/parametres.json"));
 const migrationSlugs=Array.isArray(migrationData?.anneeAMigrer?.slugs)?migrationData.anneeAMigrer.slugs:[];
 if(process.argv.includes("--seed-baseline")){
  let base;try{base=parseBaseline(fs.readFileSync(baselinePath,"utf8"))}catch(e){console.error(e.code==="ENOENT"?BASELINE_FILE+" introuvable.":e.message);process.exit(1)}
  const r=seedBaseline(pairs,base);
  if(!r.ok){console.error("--seed-baseline refusé : les règles éditoriales suivantes sont déjà présentes dans la baseline : "+r.refused.join(", ")+".");process.exit(1)}
  fs.writeFileSync(baselinePath,JSON.stringify(r.next,null,2)+"\n");
  const counts=Object.fromEntries(EDITORIAL_RULES.map(rule=>[rule,r.added.filter(x=>x.rule===rule).length]));
  console.log("--seed-baseline : "+r.added.length+" entrée(s) ajoutée(s). "+EDITORIAL_RULES.map(rule=>rule+"="+counts[rule]).join(", ")+" .");return
 }
 if(process.argv.includes("--update-baseline")){
  let base=null;if(fs.existsSync(baselinePath)){try{base=parseBaseline(fs.readFileSync(baselinePath,"utf8"))}catch(e){console.error(e.message);process.exit(1)}}
  const r=nextBaseline(pairs,base,migrationSlugs);
  if(!r.ok){
   if(r.blocked.length){
    console.error("--update-baseline refusé : un outil marqué anneeAMigrer ne peut pas résorber ses écarts éditoriaux avant migration du barème.");
    for(const x of r.blocked)console.error("  - "+x.path+" ["+x.rule+"] : migrez le barème vers parametres.json, retirez anneeAMigrer, puis enrichissez l'outil.");
    process.exit(1)
   }
   console.error("--update-baseline refusé : la baseline ne peut que perdre des entrées, jamais en gagner.\n"+r.added.length+" écart(s) suivi(s) absent(s) de la baseline (régression ou nouvelle page non conforme) :");for(const x of r.added)console.error("  - "+x.path+" ["+x.rule+"]");console.error("Corrigez ces écarts au lieu de les ajouter à la baseline.");process.exit(1)
  }
  fs.writeFileSync(baselinePath,JSON.stringify(r.next,null,2)+"\n");console.log(r.initial?"Baseline créée : "+r.next.length+" entrée(s).":"Baseline mise à jour : "+r.removed.length+" entrée(s) retirée(s), "+r.next.length+" restante(s).");return
 }
 if(process.argv.includes("--ratchet")){
  let base;try{base=parseBaseline(fs.readFileSync(baselinePath,"utf8"))}catch(e){console.error(e.code==="ENOENT"?BASELINE_FILE+" introuvable : lancez --update-baseline une première fois.":e.message);process.exit(1)}
  const r=nextBaseline(pairs,base,migrationSlugs);
  const {added,stale}=compareToBaseline(pairs,base);
  const line="Cliquet : "+pairs.length+" écart(s) suivi(s) connu(s) ou nouveaux, "+base.length+" en baseline, "+added.length+" nouveau(x), "+stale.length+" périmé(s).";
  console.log(line);if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,"### Cliquet\n\n"+line+"\n");
  for(const x of added)console.error("::error file="+x.path+"::cliquet : nouvel écart ["+x.rule+"] absent de la baseline");
  for(const message of buildRatchetMessages({added,stale,blocked:r.blocked||[]}))console.error(message);
  if(added.length||stale.length||(r.blocked||[]).length)process.exit(1)
 }
 if(process.argv.includes("--strict")&&sf.length){for(const x of sf)console.error("::error file="+x.path+"::"+x.rule+" "+x.message);process.exit(1)}
}
if(import.meta.url===(process.argv[1]?pathToFileURL(path.resolve(process.argv[1])).href:""))main();
