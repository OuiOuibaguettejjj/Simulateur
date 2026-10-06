const fs = require("fs");
const assert = require("assert");

const html = fs.readFileSync("public/outil/age-retraite/index.html", "utf8");
const title = (html.match(/<title>([^<]+)<\/title>/i) || [, ""])[1];
const description = (html.match(/<meta name="description" content="([^"]+)"/i) || [, ""])[1];

assert(title === "Âge légal de départ à la retraite 2026 | Simulateur");
assert(title.length <= 60);
assert(description.length >= 120 && description.length <= 160);
assert(html.includes('"@type":"WebApplication"'));
assert(html.includes('"name":"Âge légal de départ à la retraite 2026 | Simulateur"'));
assert(html.includes('"name":"Âge de départ à la retraite"'));
assert(/Dernière mise à jour : \d{1,2} (janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre) 20\d{2}\./.test(html));
assert(html.includes("1958 à 1960"));
assert(html.includes("1969 et après"));
assert(html.includes("carrière longue"));
assert(html.includes("suspendu jusqu’en 2028"));
assert(html.includes("1er avril 1965"));
assert(html.includes("âge minimum de départ peut être abaissé d’un an"));
assert(html.includes("Légifrance — loi n° 2025-1403 du 30 décembre 2025, article 105"));

console.log("Age-retraite final SEO/content consistency checks passed.");
