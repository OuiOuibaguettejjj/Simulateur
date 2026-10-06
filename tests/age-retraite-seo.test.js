const fs = require("fs");
const assert = require("assert");
const html = fs.readFileSync("public/outil/age-retraite/index.html", "utf8");

const title = (html.match(/<title>([^<]+)<\/title>/i) || [,""])[1];
const description = (html.match(/<meta name="description" content="([^"]+)"/i) || [,""])[1];
assert(title==="Âge de départ à la retraite | Simulateur", "SEO title must follow the shared site title contract");
assert(title.length <= 60, "SEO title should remain concise");
assert(description.includes("âge légal de départ à la retraite"), "description must target search intent");
assert(description.includes("1er septembre 2026"), "description must expose the regulatory scope");
assert(html.includes("<h1>Âge légal de départ à la retraite 2026</h1>"), "H1 must remain descriptive");
assert(html.includes("<td>1958 à 1960</td><td>62 ans</td><td>167 trimestres</td>"), "table must cover the earliest supported generations");
assert(html.includes("âge minimum abaissé d’un an"), "important parent-specific exception must be disclosed");
assert(html.includes("carrière longue"), "early-retirement scope must be disclosed");
assert(html.includes('<section class="calculator-faq" aria-labelledby="faq-title">'), "FAQ structure must follow the shared calculator contract");assert(html.includes('<h2 id="faq-title">FAQ</h2>'), "FAQ heading must follow the shared calculator contract");
assert(html.includes("https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000053227007"), "primary legal source must remain linked");
console.log("Age-retraite SEO/content guard passed.");
