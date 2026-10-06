import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildRatchetMessages,checkPage,checkAll,loadToolsMeta,parseHtml,summarize,STRUCTURAL_RULES,EDITORIAL_RULES,TRACKED_RULES,toolDirsWithoutIndex,trackedPairs,parseBaseline,compareToBaseline,nextBaseline,seedBaseline,interactivePagesFromChangedFiles,changedMandatoryFailures} from "../scripts/check-pages.mjs";

const DESC="Utilisez cet outil en ligne pour effectuer rapidement votre calcul et obtenir un résultat clair, pratique et adapté à votre situation.";
const CATS={categorie:{label:"Catégorie",path:"/categorie/"}};
const META={slug:{type:"calculateur",category:"categorie",relatedTools:["slug-1","slug-2"]},"slug-1":{},"slug-2":{}};
const IDX=new Set(["outil/slug","outil/slug-1","outil/slug-2"]);

function fixture(desc=DESC){
return "<!doctype html><html lang=\"fr\"><head>"+
"<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><meta name=\"calculator-rendering\" content=\"static\">"+
"<title>Mot-clé | Simulateur</title><meta name=\"description\" content=\""+desc+"\">"+
"<link rel=\"canonical\" href=\"https://simulateur.site/outil/slug/\"><link rel=\"stylesheet\" href=\"/styles.css\">"+
"<script type=\"application/ld+json\">{\"@context\":\"https://schema.org\",\"@type\":\"WebApplication\",\"url\":\"https://simulateur.site/outil/slug/\",\"description\":\""+desc+"\"}</script>"+
"<script type=\"application/ld+json\">{\"@context\":\"https://schema.org\",\"@type\":\"BreadcrumbList\",\"itemListElement\":[{\"@type\":\"ListItem\",\"position\":1,\"name\":\"Accueil\",\"item\":\"https://simulateur.site/\"},{\"@type\":\"ListItem\",\"position\":2,\"name\":\"Catégorie\",\"item\":\"https://simulateur.site/categorie/\"},{\"@type\":\"ListItem\",\"position\":3,\"name\":\"Nom de l'outil\",\"item\":\"https://simulateur.site/outil/slug/\"}]}</script>"+
"</head><body><header></header><main><div class=\"breadcrumb\"><a href=\"/\">Accueil</a> · <a href=\"/categorie/\">Catégorie</a> · Nom de l'outil</div>"+
"<section class=\"tool\"><h1>Nom de l'outil</h1><p class=\"tool-intro\">Introduction claire et utile.</p><div id=\"fields\"><input id=\"v\" type=\"number\"></div><div class=\"result\" aria-live=\"polite\">Résultat initial.</div>"+
"<div class=\"formula\"><a href=\"https://www.service-public.fr/\">Source officielle</a></div></section>"+
"<section class=\"content-section\"><h2>Explication du calcul</h2><p>Principe.</p><h2>Exemple de calcul</h2><p>Exemple.</p></section>"+
"<section class=\"calculator-faq\" aria-labelledby=\"faq-title\"><h2 id=\"faq-title\">FAQ</h2><details><summary>Comment interpréter le résultat ?</summary><div class=\"calculator-faq-answer\"><p>Une réponse utile.</p></div></details></section>"+
"<section class=\"related-tools\"><a class=\"related-link\" href=\"/outil/slug-1/\">Outil 1</a><a class=\"related-link\" href=\"/outil/slug-2/\">Outil 2</a><p class=\"status-note\">Retrouvez aussi tous les outils de la rubrique <a href=\"/categorie/\">Catégorie</a>.</p></section></main><footer></footer></body></html>";
}
const errs=(h,m=META,i=IDX)=>checkPage(h,{dir:"outil",slug:"slug",toolsMeta:m,categories:CATS,pageIndex:i});
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
  {dir,slug,toolsMeta:{},categories:{},pageIndex:idx}
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

for (const dir of ["conversion","comparateur"]) {
  const family = dir === "conversion" ? "source" : "prix-unitaire";
  const related = dir === "conversion"
    ? ["/conversion/aire/","/conversion/angle/","/conversion/volume/"]
    : ["/outil/slug-1/","/outil/slug-2/"];
  const missingFaq = familyErrs(dir,family,related).filter(x=>x.rule === "faq");
  assert.equal(missingFaq.length,0,dir+" conforme : la FAQ est transversale");
  const withoutFaq = familyFixture(dir,family,related).replace(/<section class="calculator-faq"[\s\S]*?<\/section>/,"");
  assert.ok(checkPage(withoutFaq,{dir,slug:family,toolsMeta:{},categories:{},pageIndex:familyIndex(dir,family,related)}).some(x=>x.rule==="faq"),dir+" sans FAQ : le contrôle transversal doit échouer");
}

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

assert.deepEqual(errs(fixture()),[],"page conforme");const oneEditorialH2=fixture().replace(
  '<h2>Exemple de calcul</h2><p>Exemple.</p>',
  ''
);
assert(has(oneEditorialH2,"content-h2"),"le H2 FAQ ne doit pas compter dans les 2 H2 éditoriaux");
const faqWithTwoEditorialH2=oneEditorialH2.replace(
  '<h2>Explication du calcul</h2>',
  '<h2>Explication du calcul</h2><h2>Deuxième section</h2>'
);
assert.equal(has(faqWithTwoEditorialH2,"content-h2"),false,"deux H2 éditoriaux hors FAQ restent valides");

assert(has(fixture().replace("<title>Mot-clé | Simulateur</title>","<title>Mot-clé</title>"),"title"));
for(const [n,bad] of [[119,true],[120,false],[160,false],[161,true]])assert.equal(has(fixture("x".repeat(n)),"description"),bad,"description "+n);
for(const a of ["'","&#39;","&apos;","’"])assert.equal(has(fixture("x".repeat(118)+a+"."),"description"),false,"apostrophe "+a);
assert(has(fixture().replace("<section class=\"tool\">","<div class=\"tool\">"),"tool-block"));
assert(has(fixture().replace("<p class=\"tool-intro\">","<p id=\"intro\" class=\"tool-intro\">"),"tool-block"));
assert(has(fixture().replace("Résultat initial.",""),"result"));
assert(has(fixture().replace(" aria-live=\"polite\"",""),"result"));
assert(has(fixture().replace("<a href=\"https://www.service-public.fr/\">Source officielle</a>","Source officielle"),"formula"));
const sourceLinksFixture=fixture().replace("<div class=\"formula\"><a href=\"https://www.service-public.fr/\">Source officielle</a></div>","<div class=\"formula\">Source officielle</div><div class=\"source-links\"><a href=\"https://www.service-public.fr/\">Source officielle</a></div>");
assert.equal(has(sourceLinksFixture,"formula"),false,"positif : source externe dans .source-links");
assert(has(sourceLinksFixture.replace("<a href=\"https://www.service-public.fr/\">Source officielle</a>","Source officielle"),"formula"),"négatif : .source-links sans lien externe");
assert(has(fixture().replace("<h2>Exemple de calcul</h2>",""),"content-h2"));
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
assert.deepEqual(checkPage(template,{dir:"outil",slug:"slug",toolsMeta:META,categories:CATS,pageIndex:IDX}),[],"template conforme");

assert.equal(checkAll([{path:"a",html:fixture()},{path:"b",html:fixture()}]).length,2,"meta-unique");
const s1=summarize([{path:"a",rule:"x",message:"1"},{path:"a",rule:"x",message:"2"}],["x"],2);assert.deepEqual(s1.x,{pages:1,messages:2},"même page = 1 page, 2 écarts");const s2=summarize([{path:"a",rule:"x",message:"1"},{path:"b",rule:"x",message:"2"}],["x"],2);assert.deepEqual(s2.x,{pages:2,messages:2},"deux pages = 2 pages");const s3=summarize([{path:"a",rule:"x",message:"1"},{path:"b",rule:"x",message:"2"},{path:"c",rule:"x",message:"3"}],["x"],2);assert.equal(s3.x.pages,2,"pages ne dépasse jamais total");
const sim='{"categories":{},"tools":{"slug":{"type":"calculateur","relatedTools":["slug-1","slug-2"]}}}';
assert.equal(loadToolsMeta(sim).slug.type,"calculateur");


// ===== Étape D : un test positif et un test négatif par règle structurelle =====
const only=(h,r,m=META,i=IDX)=>errs(h,m,i).filter(x=>x.rule===r);
assert.equal(only(fixture(),"faq").length,0,"FAQ accordéon conforme");
assert(only(fixture().replace("<h2 id=\"faq-title\">FAQ</h2>","<h2 id=\"faq-title\">Questions fréquentes</h2>"),"faq").length>0,"FAQ « Questions fréquentes » refusée");
assert(only(fixture().replace("aria-labelledby=\"faq-title\"",""),"faq").length>0,"FAQ sans aria-labelledby standard");
assert(only(fixture().replace("<div class=\"calculator-faq-answer\"><p>Une réponse utile.</p></div>","<p>Une réponse utile.</p>"),"faq").length>0,"FAQ sans conteneur de réponse standard");
assert(only(fixture().replace('<section class="calculator-faq" aria-labelledby="faq-title"><h2 id="faq-title">FAQ</h2><details><summary>Comment interpréter le résultat ?</summary><div class="calculator-faq-answer"><p>Une réponse utile.</p></div></details></section>',""),"faq").length>0,"FAQ absente");
assert(only(fixture().replace("<details><summary>Comment interpréter le résultat ?</summary><div class=\"calculator-faq-answer\"><p>Une réponse utile.</p></div></details>","<p>Question sans accordéon.</p>"),"faq").length>0,"FAQ sans details");
assert(only(fixture().replace("<summary>Comment interpréter le résultat ?</summary>","<p>Question</p>"),"faq").length>0,"FAQ sans summary");
assert(only(fixture().replace("<p>Une réponse utile.</p>",""),"faq").length>0,"FAQ sans réponse");
assert(only(fixture().replace('<section class="calculator-faq" aria-labelledby="faq-title">','<section class="calculator-faq" aria-labelledby="faq-title"><section class="calculator-faq">'),"faq").length>0,"deux blocs FAQ");

const L=x=>"<a class=\"related-link\" href=\"/outil/"+x+"/\">"+({"slug-1":"Outil 1","slug-2":"Outil 2"}[x]||x)+"</a>";
const NEG={
 "html-base":fixture().replace("<html lang=\"fr\">","<html lang=\"en\">"),
 "markup-balance":fixture().replace("</section></main>","</main>"),
 "title":fixture().replace("<title>Mot-clé | Simulateur</title>","<title>Mot-clé</title>"),
 "canonical":fixture().replace("rel=\"canonical\" href=\"https://simulateur.site/outil/slug/\"","rel=\"canonical\" href=\"https://simulateur.site/outil/autre/\""),
 "breadcrumb":fixture().replace("<a href=\"/\">Accueil</a> ·","<a href=\"/\">Home</a> ·"),
 "h1":fixture().replace("<h1>Nom de l'outil</h1>","<h1></h1>"),
 "tool-block":fixture().replace("<section class=\"tool\">","<div class=\"tool\">"),
 "result":fixture().replace("Résultat initial.",""),
 "related-block":fixture().replace(L("slug-2"),""),
 "jsonld":fixture().replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g,""),
 "citation-marker":fixture().replace("Exemple de calcul","Exemple de calcul citeturn2search3")
};
for(const r of STRUCTURAL_RULES){
 assert.equal(only(fixture(),r).length,0,"positif "+r+" : page conforme sans écart");
 if(r==="related-meta"){
  assert(only(fixture(),r,{...META,slug:{...META.slug,relatedTools:["slug-1"]}}).length>0,"négatif related-meta : 1 slug");
 } else assert(only(NEG[r],r).length>0,"négatif "+r+" : écart attendu");
}
assert.deepEqual(errs(fixture()),[],"page conforme : aucun écart du tout");
assert.equal(only(fixture().replace("Exemple de calcul","Exemple de calcul citeturn2search3"),"citation-marker").length,1,"négatif : marqueur de citation ChatGPT visible");

// classement des règles
assert.deepEqual(STRUCTURAL_RULES.filter(r=>EDITORIAL_RULES.includes(r)),[],"familles disjointes");
for(const r of ["description","content-h2","formula","faq","meta-unique"])assert(EDITORIAL_RULES.includes(r)&&!STRUCTURAL_RULES.includes(r),r+" est éditoriale");
for(const r of ["html-base","markup-balance","title","canonical","breadcrumb","h1","tool-block","result","related-block","jsonld","related-meta","citation-marker"])assert(STRUCTURAL_RULES.includes(r),r+" est structurelle");
assert.deepEqual(errs(fixture("x")).filter(x=>STRUCTURAL_RULES.includes(x.rule)),[],"une page qui ne viole que l'éditorial n'a aucun écart structurel");
assert(errs(fixture("x")).some(x=>x.rule==="description"),"description reste signalée (éditorial)");

// markup-balance : attributs malformés et « > » parasite
const badAttr=fixture().replace("<input id=\"v\" type=\"number\">","<input id=\"v\" type=\"number step=\"any\" value=\"12.345\">");
assert(only(badAttr,"markup-balance").some(x=>/attribut malformé/.test(x.message)),"négatif : type=\"number step=\"any\"");
assert.equal(only(fixture().replace("<input id=\"v\" type=\"number\">","<input id=\"v\" type=\"number\" step=\"any\" value=\"12.345\">"),"markup-balance").length,0,"positif : attributs corrects");
assert(only(fixture().replace("<input id=\"v\" type=\"number\">","<input id=\"v\" data-x='a\"b'>"),"markup-balance").length===0,"positif : guillemet dans une valeur entre apostrophes");
assert(only(fixture().replace("<section class=\"tool\">","<section class=\"tool\">>"),"markup-balance").some(x=>/parasite/.test(x.message)),"négatif : « > » en trop après une balise");
assert.deepEqual(parseHtml("<script>>1</script><div></div>").errors,[],"un > en début de script n'est pas signalé");

// catégorie : breadcrumb visible
assert(only(fixture().replace("<a href=\"/categorie/\">Catégorie</a>","<a href=\"/autre/\">Catégorie</a>"),"breadcrumb").length>0,"négatif : href catégorie");
assert(only(fixture().replace("<a href=\"/categorie/\">Catégorie</a>","<a href=\"/categorie/\">Autre</a>"),"breadcrumb").length>0,"négatif : libellé catégorie");
assert(only(fixture(),"breadcrumb",{...META,slug:{...META.slug,category:"inconnue"}}).length>0,"négatif : catégorie absente de data/tools.json");
// related-tools : lien « rubrique » aligné sur la catégorie
assert(only(fixture().replace('<a href="/categorie/">Catégorie</a>.</p></section>', '<a href="/autre/">Catégorie</a>.</p></section>'),"related-block").some(x=>/lien « rubrique »/.test(x.message)),"négatif : href du lien rubrique");
assert(only(fixture().replace('<p class="status-note">Retrouvez aussi tous les outils de la rubrique <a href="/categorie/">Catégorie</a>.</p>', ''),"related-block").some(x=>/lien « rubrique »/.test(x.message)),"négatif : lien rubrique absent");
assert(only(fixture().replace('<a href="/categorie/">Catégorie</a>.</p></section>', '<a href="/categorie/">Autre</a>.</p></section>'),"related-block").some(x=>/lien « rubrique »/.test(x.message)),"négatif : texte du lien rubrique");
assert(only(fixture().replace('<a href="/categorie/">Catégorie</a>.</p></section>', '<a href="/categorie/">Catégorie</a><a href="/categorie/">Catégorie</a>.</p></section>'),"related-block").some(x=>/lien « rubrique »/.test(x.message)),"négatif : doublon du lien rubrique");
assert.equal(only(fixture(),"related-block").length,0,"positif : lien rubrique correct");

// catégorie : BreadcrumbList position 2
assert(only(fixture().replace("\"name\":\"Catégorie\",\"item\":\"https://simulateur.site/categorie/\"","\"name\":\"Catégorie\",\"item\":\"https://simulateur.site/autre/\""),"jsonld").some(x=>/position 2/.test(x.message)),"négatif : item position 2");
assert(only(fixture().replace("\"name\":\"Catégorie\",\"item\"","\"name\":\"Autre\",\"item\""),"jsonld").some(x=>/position 2/.test(x.message)),"négatif : name position 2");

// related-tools : égalité exacte avec data/tools.json (ordre inclus)
const swapped=fixture().replace(L("slug-1")+L("slug-2"),L("slug-2")+L("slug-1"));
assert(only(swapped,"related-block").some(x=>/différents de data\/tools\.json/.test(x.message)),"négatif : même slugs, ordre différent");
const IDX3=new Set([...IDX,"outil/slug-3"]);
assert(only(fixture().replace(L("slug-2"),L("slug-2")+L("slug-3")),"related-block",{...META,"slug-3":{}},IDX3).length>0,"négatif : lien en plus dans le HTML");
assert(only(fixture(),"related-block",{...META,slug:{...META.slug,relatedTools:["slug-1","slug-2","slug-3"]},"slug-3":{}},IDX3).length>0,"négatif : slug en plus dans data/tools.json");
// related-meta : bornes 2 à 4
const IDX5=new Set([...IDX,"outil/slug-3","outil/slug-4","outil/slug-5"]);
const M=n=>({...META,slug:{...META.slug,relatedTools:["slug-1","slug-2","slug-3","slug-4","slug-5"].slice(0,n)},"slug-3":{},"slug-4":{},"slug-5":{}});
const H=n=>fixture().replace(L("slug-1")+L("slug-2"),["slug-1","slug-2","slug-3","slug-4","slug-5"].slice(0,n).map(L).join(""));
assert.deepEqual(errs(H(4),M(4),IDX5),[],"positif : 4 relations cohérentes HTML/data");
assert.deepEqual(errs(H(2),M(2),IDX5),[],"positif : 2 relations cohérentes HTML/data");
assert.equal(only(H(5),"related-meta",M(5),IDX5).length,1,"négatif : 5 relations");
assert.equal(only(H(1),"related-meta",M(1),IDX5).length,1,"négatif : 1 relation");
assert.equal(only(fixture(),"related-meta",{...META,slug:{...META.slug,relatedTools:"slug-1"}}).length,1,"négatif : relatedTools n'est pas une liste");

// ===== Étape E : contrôles portés depuis deploy.yml =====
// marqueur calculator-rendering=static
assert(only(fixture().replace("<meta name=\"calculator-rendering\" content=\"static\">",""),"html-base").length>0,"négatif : marqueur static absent");
assert(only(fixture().replace("content=\"static\"","content=\"dynamic\""),"html-base").length>0,"négatif : marqueur différent de static");
// meta description présente (bloquant, distinct de la longueur éditoriale)
const noDesc=fixture().replace(/<meta name="description" content="[^"]*">/,"");
assert(only(noDesc,"html-base").some(x=>/description absente/.test(x.message)),"négatif : meta description absente");
assert.equal(only(fixture("x"),"html-base").length,0,"positif : description présente mais courte = éditorial seulement");
// canonique
assert(only(fixture().replace(/<link rel="canonical"[^>]*>/,""),"canonical").length>0,"négatif : canonique absente");
// au moins un input/select/textarea/button
const noCtl=fixture().replace("<input id=\"v\" type=\"number\">","");
assert(only(noCtl,"tool-block").some(x=>/input, select, textarea ou button/.test(x.message)),"négatif : aucun contrôle de calcul");
for(const el of ["<select id=\"v\"></select>","<textarea id=\"v\"></textarea>","<button id=\"v\">Calculer</button>"])assert.equal(only(fixture().replace("<input id=\"v\" type=\"number\">",el),"tool-block").length,0,"positif : "+el);
assert.equal(only(noCtl.replace("</main>","<script>const s='<button>';</script></main>"),"tool-block").length>0,true,"un <button> dans une chaîne JS ne compte pas comme contrôle");
// un seul WebApplication et un seul BreadcrumbList
const LD=/<script type="application\/ld\+json">[\s\S]*?<\/script>/g,lds=fixture().match(LD);
assert(only(fixture().replace("</head>",lds[0]+"</head>"),"jsonld").length>0,"négatif : deux WebApplication");
assert(only(fixture().replace("</head>",lds[1]+"</head>"),"jsonld").length>0,"négatif : deux BreadcrumbList");
assert(only(fixture().replace("\"position\":3","\"position\":7"),"jsonld").some(x=>/positions/.test(x.message)),"négatif : position 3 incorrecte");
assert(only(fixture().replace("\"position\":2,","\"position\":\"2\","),"jsonld").some(x=>/positions/.test(x.message)),"négatif : position non numérique");
// dossier /outil/<slug>/ sans index.html
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"check-pages-"));
try{
 fs.mkdirSync(path.join(tmp,"avec"));fs.writeFileSync(path.join(tmp,"avec","index.html"),"<!doctype html>");
 assert.deepEqual(toolDirsWithoutIndex(tmp),[],"positif : tous les dossiers ont un index.html");
 fs.mkdirSync(path.join(tmp,"sans"));fs.mkdirSync(path.join(tmp,"fichier"));fs.mkdirSync(path.join(tmp,"fichier","index.html"));
 assert.deepEqual(toolDirsWithoutIndex(tmp),["fichier","sans"],"négatif : dossier vide et index.html qui est un dossier");
 assert.deepEqual(toolDirsWithoutIndex(path.join(tmp,"absent")),[],"dossier racine absent : rien à signaler ici");
}finally{fs.rmSync(tmp,{recursive:true,force:true})}

// ===== Étape E : cliquet et baseline =====
const P=(p,r)=>({path:p,rule:r});
const cur=trackedPairs([{path:"b",rule:"title",message:"1"},{path:"a",rule:"result",message:"1"},{path:"a",rule:"result",message:"2"},{path:"a",rule:"description",message:"éditorial"}]);
assert.deepEqual(cur,[P("a","description"),P("a","result"),P("b","title")],"paires suivies dédoublonnées et triées, structurelles + éditoriales");
// cliquet : positif
assert.deepEqual(compareToBaseline(cur,cur),{added:[],stale:[]},"positif : écarts structurels + éditoriaux = baseline");
// cliquet : négatif (régression ou nouvelle page non conforme)
assert.deepEqual(compareToBaseline([...cur,P("c","h1")],cur).added,[P("c","h1")],"négatif : nouvel écart absent de la baseline");
// cliquet : négatif (entrée périmée)
assert.deepEqual(compareToBaseline([P("a","result"),P("a","description")],cur).stale,[P("b","title")],"négatif : entrée périmée");
// parseBaseline : validation
assert.deepEqual(parseBaseline('[{"path":"a","rule":"title"}]'),[P("a","title")],"positif : baseline structurelle valide");
assert.deepEqual(parseBaseline('[{"path":"a","rule":"description"}]'),[P("a","description")],"positif : baseline éditoriale acceptée");
for(const [label,txt] of [["JSON invalide","{"],["pas une liste","{}"],["entrée sans règle",'[{"path":"a"}]'],["règle inconnue",'[{"path":"a","rule":"zzz"}]'],["doublon",'[{"path":"a","rule":"title"},{"path":"a","rule":"title"}]']])assert.throws(()=>parseBaseline(txt),Error,"négatif : "+label);
// --update-baseline : génération initiale, retrait seul, refus d'ajout
const init=nextBaseline(cur,null);assert(init.ok&&init.initial&&init.next.length===3,"génération initiale autorisée");
const shrink=nextBaseline([P("a","result")],cur);assert(shrink.ok&&!shrink.initial,"retrait accepté");assert.deepEqual(shrink.next,[P("a","result")],"la baseline perd les entrées corrigées");assert.deepEqual(shrink.removed,[P("a","description"),P("b","title")]);
const grow=nextBaseline([...cur,P("c","h1")],cur);assert.equal(grow.ok,false,"ajout refusé");assert.deepEqual(grow.added,[P("c","h1")]);assert.deepEqual(grow.next,cur,"la baseline n'est pas modifiée en cas de refus");
const mixed=nextBaseline([P("a","result"),P("a","description"),P("c","h1")],cur);assert.equal(mixed.ok,false,"un retrait ne compense pas un ajout");
assert.deepEqual(nextBaseline(cur,cur).removed,[],"rien à retirer : baseline inchangée");

const editorial=[P("a","description")];
assert.deepEqual(compareToBaseline([...editorial,P("c","content-h2")],editorial).added,[P("c","content-h2")],"nouvel écart éditorial = added");
assert.deepEqual(compareToBaseline([],editorial).stale,editorial,"écart éditorial corrigé = stale");
assert.equal(nextBaseline([...editorial,P("c","formula")],editorial).ok,false,"--update-baseline ne peut pas ajouter un écart éditorial");
const seeded=seedBaseline([...editorial,P("b","content-h2"),P("c","title")],[P("z","title")]);
assert(seeded.ok,"--seed-baseline accepte les règles éditoriales absentes");
assert.deepEqual(seeded.added,[P("a","description"),P("b","content-h2")],"--seed-baseline ajoute les écarts des règles éditoriales absentes");
const refused=seedBaseline(editorial,[P("z","description")]);
assert.equal(refused.ok,false,"--seed-baseline refuse une règle éditoriale déjà présente");
assert.deepEqual(refused.refused,["description"],"--seed-baseline indique la règle déjà présente");

// le fichier de baseline versionné est valide et ne contient que des écarts structurels
const committed=parseBaseline(fs.readFileSync(new URL("../scripts/check-pages.baseline.json",import.meta.url),"utf8"));
assert(committed.every(x=>TRACKED_RULES.includes(x.rule)),"baseline versionnée : uniquement des règles suivies");

// contrat final des pages modifiées : indépendant de la baseline
const mandatoryBroken=fixture().replace(/<section class="calculator-faq"[\s\S]*?<\/section>/,"");
const mandatoryFailures=errs(mandatoryBroken).map(x=>({...x,path:"public/outil/slug/index.html"}));
assert(mandatoryFailures.some(x=>x.rule==="faq"),"contrat final : une FAQ absente est une violation obligatoire");
assert.deepEqual(changedMandatoryFailures(mandatoryFailures,["public/outil/slug/index.html"]).map(x=>x.rule),["faq"],"contrat final : la dette d'une page modifiée est bloquante sans regarder la baseline");
assert.deepEqual(changedMandatoryFailures(mandatoryFailures,["public/outil/autre/index.html"]),[],"contrat final : une page non modifiée n'est pas contrôlée");
assert.deepEqual(changedMandatoryFailures(errs(fixture()),["public/outil/slug/index.html"]),[],"contrat final : une page modifiée conforme est verte");
assert.deepEqual(
 interactivePagesFromChangedFiles(
   [{path:"public/outil/slug/index.html",dir:"outil",slug:"slug",html:""}],
   ["public/outil/slug/index.html"]
 ),
 ["public/outil/slug/index.html"],
 "détection : modification directe du HTML"
);
assert.deepEqual(
 interactivePagesFromChangedFiles(
   [{path:"public/outil/slug/index.html",dir:"outil",slug:"slug",html:"/slug.js"}],
   ["public/slug.js"]
 ),
 ["public/outil/slug/index.html"],
 "détection : JavaScript propre au calculateur référencé par la page"
);

// anneeAMigrer : les écarts éditoriaux ne peuvent pas être résorbés avant migration.
const debtPath="public/outil/ancien/index.html";
const lockedBaseline=[P(debtPath,"description"),P(debtPath,"content-h2"),P(debtPath,"formula"),P(debtPath,"faq"),P(debtPath,"result")];
const lockedCurrent=[P(debtPath,"result")];
const locked=nextBaseline(lockedCurrent,lockedBaseline,["ancien"]);
assert.equal(locked.ok,false,"anneeAMigrer bloque le retrait des écarts éditoriaux");
assert.deepEqual(locked.blocked,[P(debtPath,"description"),P(debtPath,"content-h2"),P(debtPath,"formula"),P(debtPath,"faq")],"les quatre écarts éditoriaux sont verrouillés");
const lockedMessages=buildRatchetMessages({stale:lockedBaseline.slice(0,4),blocked:locked.blocked});
assert.equal(lockedMessages.length,4,"entrée verrouillée : un seul message par écart");
assert(lockedMessages.every(m=>m.includes("cliquet anneeAMigrer")),"entrée verrouillée : seul le message anneeAMigrer apparaît");
assert(!lockedMessages.some(m=>m.includes("entrée périmée")),"entrée verrouillée : aucun message entrée périmée");
const addedMessages=buildRatchetMessages({added:[P("public/outil/test/index.html","result")]});
assert.equal(addedMessages.length,1,"écart ajouté : un seul message");
assert(addedMessages[0].includes("nouvel écart"),"écart ajouté : message attendu");
const unlockedMessages=buildRatchetMessages({stale:[P(debtPath,"description")]});
assert.equal(unlockedMessages.length,1,"entrée périmée non verrouillée : un message");
assert(unlockedMessages[0].includes("entrée périmée"),"entrée périmée non verrouillée : message périmé présent");
const migrated=nextBaseline(lockedCurrent,lockedBaseline,[]);
assert.equal(migrated.ok,true,"outil migré : retrait des écarts autorisé");
assert.deepEqual(migrated.removed,[P(debtPath,"description"),P(debtPath,"content-h2"),P(debtPath,"formula"),P(debtPath,"faq")],"outil migré : écarts retirables");

console.log("check-pages tests passed.");
