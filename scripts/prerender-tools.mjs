import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
const root=path.join(process.cwd(),"public","outil");
const sim=fs.readFileSync(path.join(process.cwd(),"public","simulateurs.js"),"utf8");
function walk(d){const o=[];for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())o.push(...walk(p));else if(e.name==="index.html")o.push(p)}return o}
function esc(v){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function toolOf(html,file){const ss=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);const s=ss.find(x=>/window\.TOOL\s*=/.test(x));if(!s)return null;const window={addEventListener(){}};const document={getElementById(){return null},querySelector(){return null},querySelectorAll(){return[]},createElement(){return{}}};vm.runInNewContext(s,{window,document,location:{pathname:"/outil/"+path.basename(path.dirname(file))+"/"},console,URL,Number,Math,Date,Intl,JSON,String,Boolean,Array,Object,RegExp,parseInt,parseFloat,isFinite,isNaN,setTimeout,clearTimeout},{filename:file,timeout:1000});if(!window.TOOL)throw Error(file+": TOOL non défini");return window.TOOL}
function groupsOf(s){const m=s.match(/const groups=({[\s\S]*?})\s*;\s*function addBreadcrumbSchema/);return m?vm.runInNewContext("("+m[1]+")"):{}}
function hasBC(h){return [...h.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].some(m=>/"@type"\s*:\s*"BreadcrumbList"/.test(m[1]))}
const groups=groupsOf(sim);let changed=0,skipped=0;
for(const file of walk(root)){const old=fs.readFileSync(file,"utf8");let h=old;const slug=path.basename(path.dirname(file)),t=toolOf(h,file);if(!t){skipped++;continue}const title=t.displayTitle||t.title||"",intro=t.displayIntro||t.intro||"";if(!title)throw Error(file+": titre vide");
h=h.replace(/(<title>)[\s\S]*?(<\/title>)/i,(_,a,b)=>a+esc(t.seoTitle||t.title||title)+" | Simulateur"+b);
h=h.replace(/(<div[^>]+id=["']ey["'][^>]*>)[\s\S]*?(<\/div>)/i,(_,a,b)=>a+esc(t.ey||"")+b);
h=h.replace(/(<h1[^>]+id=["']title["'][^>]*>)[\s\S]*?(<\/h1>)/i,(_,a,b)=>a+esc(title)+b);
h=h.replace(/(<p[^>]+id=["']intro["'][^>]*>)[\s\S]*?(<\/p>)/i,(_,a,b)=>a+esc(intro)+b);
h=h.replace(/(<p[^>]+id=["']source["'][^>]*>)[\s\S]*?(<\/p>)/i,(_,a,b)=>a+esc(t.source||"")+b);
const fm=h.match(/<div([^>]*id=["']fields["'][^>]*)>([\s\S]*?)<\/div>/i);if(fm&&!/\bhidden\b/i.test(fm[1])&&!fm[2].trim()&&typeof t.fields==="function"){const f=t.fields();if(!f)throw Error(file+": champs vides");h=h.replace(fm[0],"<div"+fm[1]+">"+f+"</div>")}
if(!/<div[^>]+class=["']breadcrumb["']/i.test(h)){const g=groups[slug]||["Calculateurs","/calculateurs/"];h=h.replace(/(<main\b[^>]*>[\s\S]*?<div[^>]+class=["']wrap["'][^>]*>)/i,"$1<div class=\"breadcrumb\"><a href=\""+g[1]+"\">"+esc(g[0])+"</a> · "+esc(title)+"</div>")}
if(!hasBC(h)){const c=(h.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)||[])[1]||"https://simulateur.site/outil/"+slug+"/";const bm=h.match(/<div[^>]+class=["']breadcrumb["'][^>]*>([\s\S]*?)<\/div>/i),links=bm?[...bm[1].matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]:[],items=[{"@type":"ListItem","position":1,"name":"Accueil","item":"https://simulateur.site/"}];if(links[0])items.push({"@type":"ListItem","position":2,"name":links[0][2].replace(/<[^>]+>/g,"").trim(),"item":new URL(links[0][1],"https://simulateur.site").href});items.push({"@type":"ListItem","position":items.length+1,"name":title,"item":c});h=h.replace(/<\/head>/i,'<script type="application/ld+json">'+JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":items})+"</script></head>")}
if(h!==old){fs.writeFileSync(file,h.endsWith("\n")?h:h+"\n");changed++}}
console.log("SEO prerender: "+changed+" pages updated; "+skipped+" static-special pages skipped.");
