import assert from "node:assert/strict";
import fs from "node:fs";
import {checkPage,checkAll,loadToolsMeta,parseHtml,summarize} from "../scripts/check-pages.mjs";

const DESC="Utilisez cet outil en ligne pour effectuer rapidement votre calcul et obtenir un résultat clair, pratique et adapté à votre situation.";
const META={slug:{type:"calculateur",relatedTools:[{slug:"slug-1"},{slug:"slug-2"}]},"slug-1":{},"slug-2":{}};
const IDX=new Set(["outil/slug","outil/slug-1","outil/slug-2"]);

function fixture(desc=DESC){
return "<!doctype html><html lang=\"fr\"><head>"+
"<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><meta name=\"calculator-rendering\" content=\"static\">"+
"<title>Mot-clé | Simulateur</title><meta name=\"description\" content=\""+desc+"\">"+
"<link rel=\"canonical\" href=\"https://simulateur.site/outil/slug/\"><link rel=\"stylesheet\" href=\"/styles.css\">"+
"<script type=\"application/ld+json\">{\"@context\":\"https://schema.org\",\"@type\":\"WebApplication\",\"url\":\"https://simulateur.site/outil/slug/\",\"description\":\""+desc+"\"}</script>"+
"<script type=\"application/ld+json\">{\"@context\":\"https://schema.org\",\"@type\":\"BreadcrumbList\",\"itemListElement\":[{\"@type\":\"ListItem\",\"position\":1,\"name\":\"Accueil\",\"item\":\"https://simulateur.site/\"},{\"@type\":\"ListItem\",\"position\":2,\"name\":\"Catégorie\",\"item\":\"https://simulateur.site/categorie/\"},{\"@type\":\"ListItem\",\"position\":3,\"name\":\"Nom de l'outil\",\"item\":\"https://simulateur.site/outil/slug/\"}]}</script>"+
"</head><body><header></header><main><div class=\"breadcrumb\"><a href=\"/\">Accueil</a> · <a href=\"/categorie/\">Catégorie</a> · Nom de l'outil</div>"+
"<section class=\"tool\"><h1>Nom de l'outil</h1><p class=\"tool-intro\">Introduction claire et utile.</p><div id=\"fields\"></div><div class=\"result\" aria-live=\"polite\">Résultat initial.</div>"+
"<div class=\"formula\"><a href=\"https://www.service-public.fr/\">Source officielle</a></div></section>"+
"<section class=\"content-section\"><h2>Comment calculer ?</h2><p>Principe.</p><h2>Exemple de calcul</h2><p>Exemple.</p><h2>À savoir</h2><p>Limites.</p></section>"+
"<section class=\"related-tools\"><a class=\"related-link\" href=\"/outil/slug-1/\">Outil 1</a><a class=\"related-link\" href=\"/outil/slug-2/\">Outil 2</a></section></main><footer></footer></body></html>";
}
const errs=(h,m=META,i=IDX)=>checkPage(h,{dir:"outil",slug:"slug",toolsMeta:m,pageIndex:i});
const has=(h,r)=>errs(h).some(x=>x.rule===r);
function familyFixture(dir,slug,relatedLinks){
  const related=relatedLinks.map((href,i)=>"<a class=\"related-link\" href=\""+href+"\">Associé "+(i+1)+"</a>").join("");
  return fixture()
    .replaceAll("/outil/slug/", "/"+dir+"/"+slug+"/")
    .replace(/<section class="related-tools">[\s\S]*?<\/section>/, "<section class=\"related-tools\">"+related+"</section>");
}
function familyIndex(dir,slug,relatedLinks){
  return new Set([
    dir+"/"+slug,
    ...relatedLinks
      .filter(h=>/^\/[^/]+\/[^/]+\/$/.test(h))
      .map(h=>h.slice(1,-1))
  ]);
}
const familyErrs=(dir,slug,relatedLinks,idx=familyIndex(dir,slug,relatedLinks))=>checkPage(
  familyFixture(dir,slug,relatedLinks),
  {dir,slug,toolsMeta:{},pageIndex:idx}
);



assert.deepEqual(
  familyErrs("conversion","source",[
    "/conversion/aire/",
    "/conversion/angle/",
    "/conversion/volume/"
  ]),
  [],
  "conversion valide avec 3 liens internes existants"
);

for(const [label,links] of [
  ["1 lien",["/conversion/aire/"]],
  ["5 liens",[
    "/conversion/aire/",
    "/conversion/angle/",
    "/conversion/volume/",
    "/conversion/poids/",
    "/conversion/temperature/"
  ]],
  ["page inexistante",[
    "/conversion/aire/",
    "/conversion/absente/",
    "/conversion/volume/"
  ]],
  ["auto-lien",[
    "/conversion/aire/",
    "/conversion/source/",
    "/conversion/volume/"
  ]],
  ["doublon",[
    "/conversion/aire/",
    "/conversion/volume/",
    "/conversion/volume/"
  ]]
]) {
  const idx=label==="page inexistante"
    ? new Set([
        "conversion/source",
        "conversion/aire",
        "conversion/volume"
      ])
    : familyIndex("conversion","source",links);
  const failures=familyErrs("conversion","source",links,idx)
    .filter(x=>x.rule==="related-block");

  assert.equal(
    failures.length,
    1,
    "conversion "+label+" = un seul écart related-block"
  );
}

assert.deepEqual(
  familyErrs("comparateur","source",[
    "/conversion/aire/",
    "/conversion/angle/",
    "/conversion/volume/"
  ]),
  [],
  "comparateur valide sans TOOLS_META"
);

const outilMissingMeta=errs(
  fixture().replace("/outil/slug-2/","/outil/slug-3/"),
  {
    ...META,
    "slug-3": {}
  },
  new Set(["outil/slug","outil/slug-1","outil/slug-2","outil/slug-3"])
);
assert.equal(
  outilMissingMeta.filter(x=>x.rule==="related-block").length,
  1,
  "/outil/ conserve related-block sans relation TOOLS_META"
);

const outilWithoutMeta=errs(fixture(),{},IDX);
assert.equal(
  outilWithoutMeta.filter(x=>x.rule==="related-meta").length,
  1,
  "/outil/ sans TOOLS_META conserve related-meta"
);

assert.deepEqual(errs(fixture()),[],"page conforme");
assert(has(fixture().replace("<title>Mot-clé | Simulateur</title>","<title>Mot-clé</title>"),"title"));
for(const [n,bad] of [[119,true],[120,false],[160,false],[161,true]])assert.equal(has(fixture("x".repeat(n)),"description"),bad,"description "+n);
for(const a of ["'","&#39;","&apos;","’"])assert.equal(has(fixture("x".repeat(118)+a+"."),"description"),false,"apostrophe "+a);
assert(has(fixture().replace("<section class=\"tool\">","<div class=\"tool\">"),"tool-block"));
assert(has(fixture().replace("<p class=\"tool-intro\">","<p id=\"intro\" class=\"tool-intro\">"),"tool-block"));
assert(has(fixture().replace("Résultat initial.",""),"result"));
assert(has(fixture().replace(" aria-live=\"polite\"",""),"result"));
assert(has(fixture().replace("<a href=\"https://www.service-public.fr/\">Source officielle</a>","Source officielle"),"formula"));
assert(has(fixture().replace("<h2>À savoir</h2>",""),"content-h2"));
assert(has(fixture().replace("</section></main>","</section><section class=\"related-tools\"><a class=\"related-link\" href=\"/outil/slug-1/\">A</a><a class=\"related-link\" href=\"/outil/slug-2/\">B</a></section></main>"),"related-block"));
assert(has(fixture().replace("<a class=\"related-link\" href=\"/outil/slug-2/\">Outil 2</a>",""),"related-block"));
assert(has(fixture().replace("<a class=\"related-link\" href=\"/outil/slug-2/\">Outil 2</a>","<a class=\"related-link\" href=\"/outil/slug-2/\">2</a><a class=\"related-link\" href=\"/outil/slug-1/\">3</a><a class=\"related-link\" href=\"/outil/slug-1/\">4</a><a class=\"related-link\" href=\"/outil/slug-1/\">5</a>"),"related-block"));
assert(has(fixture().replace("/outil/slug-2/","/outil/absent/"),"related-block"));
assert(has(fixture().replace("\"description\":\""+DESC+"\"","\"description\":\"Autre\""),"jsonld"));
assert(has(fixture().replace(/<script type=\"application\/ld\+json\">[\s\S]*?<\/script>/g,""),"jsonld"));
assert(has(fixture()+"</div>","markup-balance"));
assert(has(fixture().replace("</section></main>","</main>"),"markup-balance"));
assert(has(fixture().replace("https://simulateur.site/outil/slug/","https://simulateur.site/outil/autre/"),"canonical"));

assert.deepEqual(parseHtml("<script>const x='<div><section>';</script><section></section>").errors,[],"script text ignored");assert.deepEqual(parseHtml("<script>for(let i=0;i<n;i++){}</script><section></section>").errors,[], "script comparison text ignored");
assert.equal(parseHtml("<script>for(let i=0;i<n;i++){}</script><section></section>").root.children.some(n=>n.name==="section"),true,"section après script");
assert.deepEqual(parseHtml("<script>if(a<b){}</script><div></div>").errors,[], "script less-than text ignored");
assert.equal(parseHtml("<script>if(a<b){}</script><div></div>").root.children.some(n=>n.name==="div"),true,"div après script");
assert.deepEqual(parseHtml("<script>x=1</SCRIPT><section></section>").errors,[], "script closing tag case-insensitive");
assert.equal(parseHtml("<script>x=1</SCRIPT><section></section>").root.children.some(n=>n.name==="section"),true,"section après fermeture majuscule");

const twoRelatedBlocks=fixture().replace("</section></main>","</section><section class=\"related-tools\"><a class=\"related-link\" href=\"/outil/slug-1/\">Outil 1</a><a class=\"related-link\" href=\"/outil/slug-2/\">Outil 2</a></section></main>");
assert.deepEqual(errs(twoRelatedBlocks).filter(x=>x.rule==="related-block"),[{rule:"related-block",message:"exactement un bloc .related-tools est requis"}],"deux blocs related-tools = un seul écart related-block");


const template=fs.readFileSync(new URL("../docs/template-outil.html",import.meta.url),"utf8");
assert.deepEqual(checkPage(template,{dir:"outil",slug:"slug",toolsMeta:{slug:{relatedTools:[{slug:"slug-1"},{slug:"slug-2"}]},"slug-1":{},"slug-2":{}},pageIndex:IDX}),[],"template conforme");

assert.equal(checkAll([{path:"a",html:fixture()},{path:"b",html:fixture()}]).length,2,"meta-unique");
const s1=summarize([{path:"a",rule:"x",message:"1"},{path:"a",rule:"x",message:"2"}],["x"],2);assert.deepEqual(s1.x,{pages:1,messages:2},"même page = 1 page, 2 écarts");const s2=summarize([{path:"a",rule:"x",message:"1"},{path:"b",rule:"x",message:"2"}],["x"],2);assert.deepEqual(s2.x,{pages:2,messages:2},"deux pages = 2 pages");const s3=summarize([{path:"a",rule:"x",message:"1"},{path:"b",rule:"x",message:"2"},{path:"c",rule:"x",message:"3"}],["x"],2);assert.equal(s3.x.pages,2,"pages ne dépasse jamais total");
const sim='const CATEGORIES={}; const TOOLS_META={"slug":{"type":"calculateur","relatedTools":[{"slug":"slug-1"},{"slug":"slug-2"}]}}; function toolMeta(slug){return TOOLS_META[slug]||null}';
assert.equal(loadToolsMeta(sim).slug.type,"calculateur");

console.log("check-pages tests passed.");
