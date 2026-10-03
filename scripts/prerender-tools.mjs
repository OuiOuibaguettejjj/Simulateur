import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
const root=path.join(process.cwd(),"public","outil");
const sim=fs.readFileSync(path.join(process.cwd(),"public","simulateurs.js"),"utf8");
function walk(d){const o=[];for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())o.push(...walk(p));else if(e.name==="index.html")o.push(p)}return o}
function esc(v){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function toolOf(html,file){const ss=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);const s=ss.find(x=>/window\.TOOL\s*=/.test(x));if(!s)return null;const window={addEventListener(){}};const noop={addEventListener(){},removeEventListener(){},style:{},classList:{add(){},remove(){},toggle(){}},setAttribute(){},removeAttribute(){},appendChild(){return this}};const document={getElementById(){return noop},querySelector(){return noop},querySelectorAll(){return[]},createElement(){return noop},addEventListener(){}};vm.runInNewContext(s,{window,document,location:{pathname:"/outil/"+path.basename(path.dirname(file))+"/"},console,URL,Number,Math,Date,Intl,JSON,String,Boolean,Array,Object,RegExp,parseInt,parseFloat,isFinite,isNaN,setTimeout,clearTimeout},{filename:file,timeout:1000});if(!window.TOOL)throw Error(file+": TOOL non défini");return window.TOOL}
function jsonLdScript(data) {
  return '<script type="application/ld+json">' + JSON.stringify(data).replace(/</g, "\\u003c") + '</script>';
}
function hasJsonLdType(html, type) {
  return [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .some(m => new RegExp('"@type"\s*:\s*"' + type + '"').test(m[1]));
}
function metaDescription(html) {
  const m = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
  return m ? m[1] : "";
}
function metadataOf(s){
  const c=s.match(/const CATEGORIES=([\s\S]*?);\s*const TOOL_TYPES=/);
  const m=s.match(/const TOOLS_META=([\s\S]*?);\s*function toolMeta/);
  if(!c||!m) throw Error("Taxonomy metadata missing");
  return {categories:Function("return ("+c[1]+")")(),tools:Function("return ("+m[1]+")")()};
}
function applicationCategory(meta){
  return meta && ["fiscalite","epargne","immobilier"].includes(meta.category) ? "FinanceApplication" : "UtilitiesApplication";
}
function replaceElementContents(html, tag, id, content) {
  const open = new RegExp(`<${tag}\\b[^>]*\\bid=["']${id}["'][^>]*>`, 'i').exec(html);
  if (!open) return html;
  const openEnd = open.index + open[0].length;
  const tags = new RegExp('</?' + tag + '\\b[^>]*>', 'gi');
  tags.lastIndex = openEnd;
  let depth = 1;
  let match;
  while ((match = tags.exec(html))) {
    if (/^<\//.test(match[0])) depth--;
    else depth++;
    if (depth === 0) return html.slice(0, openEnd) + content + html.slice(match.index);
  }
  throw new Error('Unclosed #' + id + ' container');
}
function relatedToolsMarkup(slug) {
  const meta=toolsMeta[slug];
  if(!meta || !meta.relatedTools?.length) return "";
  const links=meta.relatedTools.map(x=>'<a class="related-link" href="/outil/'+x.slug+'/"><strong>'+esc(x.title)+'</strong><span>'+esc(x.description)+'</span></a>').join("");
  const category=taxonomy.categories[meta.category];
  return '<section class="related-tools"><div><div class="eyebrow">À VOIR AUSSI</div><h2>Calculs associés</h2><div class="related-links">'+links+'</div><p class="status-note">Retrouvez aussi tous les outils de la rubrique <a href="'+category.path+'">'+esc(category.label)+'</a>.</p></div></section>';
}
function hasBC(h){return [...h.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].some(m=>/"@type"\s*:\s*"BreadcrumbList"/.test(m[1]))}
const taxonomy=metadataOf(sim);const toolsMeta=taxonomy.tools;let changed=0,skipped=0,staticSkipped=0;
for(const file of walk(root)){
  const old=fs.readFileSync(file,"utf8");
  // HTML-first calculators own their SEO/interface markup; legacy prerender must not rewrite them.
  if(/<meta\b[^>]*name=["\x27]calculator-rendering["\x27][^>]*content=["\x27]static["\x27][^>]*>/i.test(old)){
    skipped++; staticSkipped++; continue;
  }
  let h=old;const slug=path.basename(path.dirname(file)),t=toolOf(h,file);if(!t){skipped++;continue}const title=t.displayTitle||t.title||"",intro=t.displayIntro||t.intro||"";if(!title)throw Error(file+": titre vide");
h=h.replace(/(<title>)[\s\S]*?(<\/title>)/i,(_,a,b)=>a+esc(t.seoTitle||t.title||title)+" | Simulateur"+b);
h=h.replace(/(<div[^>]+id=["']ey["'][^>]*>)[\s\S]*?(<\/div>)/i,(_,a,b)=>a+esc(t.ey||"")+b);
h=h.replace(/(<h1[^>]+id=["']title["'][^>]*>)[\s\S]*?(<\/h1>)/i,(_,a,b)=>a+esc(title)+b);
h=h.replace(/(<p[^>]+id=["']intro["'][^>]*>)[\s\S]*?(<\/p>)/i,(_,a,b)=>a+esc(intro)+b);
h=h.replace(/(<p[^>]+id=["']source["'][^>]*>)[\s\S]*?(<\/p>)/i,(_,a,b)=>a+esc(t.source||"")+b);
if(typeof t.fields==="function" && slug !== "temps"){
  const f=t.fields();
  if(f) h=replaceElementContents(h,"div","fields",f);
}
const meta=toolsMeta[slug];if(!meta)throw Error(file+": outil absent de la taxonomie");const category=taxonomy.categories[meta.category];if(!category)throw Error(file+": catégorie inconnue: "+meta.category);const g=[category.label,category.path];
const breadcrumbCategory=g[0] !== title ? ' · <a href="'+g[1]+'">'+esc(g[0])+'</a>' : '';
const breadcrumb='<div class="breadcrumb"><a href="/">Accueil</a>'+breadcrumbCategory+' · '+esc(title)+'</div>';
if(/<div[^>]+class=["']breadcrumb["']/i.test(h)){
  h=h.replace(/<div[^>]+class=["']breadcrumb["'][^>]*>[\s\S]*?<\/div>/i,breadcrumb);
}else{
  h=h.replace(/(<main\b[^>]*>[\s\S]*?<div[^>]+class=["']wrap["'][^>]*>)/i,"$1"+breadcrumb);
}
const canonical=(h.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)||[])[1]||"https://simulateur.site/outil/"+slug+"/";
if(!hasJsonLdType(h,"WebApplication")){
  h=h.replace(/<\/head>/i,jsonLdScript({
    "@context":"https://schema.org",
    "@type":"WebApplication",
    name:title,
    url:canonical,
    description:metaDescription(h),
    inLanguage:"fr-FR",
    applicationCategory:applicationCategory(meta),
    operatingSystem:"Any",
    browserRequirements:"Requires JavaScript",
    offers:{price:"0",priceCurrency:"EUR"}
  })+"</head>");
}
if(!hasBC(h)){const items=[{"@type":"ListItem","position":1,"name":"Accueil","item":"https://simulateur.site/"}];if(g[0]!==title)items.push({"@type":"ListItem","position":2,"name":g[0],"item":new URL(g[1],"https://simulateur.site").href});items.push({"@type":"ListItem","position":items.length+1,"name":title,"item":canonical});h=h.replace(/<\/head>/i,jsonLdScript({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":items})+"</head>")}
if(!/<section[^>]+class=["']related-tools["']/i.test(h)){
  const related=relatedToolsMarkup(slug);
  if(related) h=h.replace(/<\/main>/i,related+"</main>");
}
if(h!==old){fs.writeFileSync(file,h.endsWith("\n")?h:h+"\n");changed++}}
console.log("SEO prerender: "+changed+" legacy pages updated; "+skipped+" pages skipped ("+staticSkipped+" HTML-first calculators).");
