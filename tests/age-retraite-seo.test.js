const fs = require("fs");
const assert = require("assert");
const html = fs.readFileSync("public/outil/age-retraite/index.html", "utf8");

// Ce test fige les faits réglementaires et la structure de la page, pas la formulation SEO :
// titre, H1 et description peuvent être réécrits librement tant que le contrat ci-dessous tient
// (forme « Mot-clé | Simulateur », longueur, radical « calcul » pour les requêtes calculateur/calculer/calcul).
const strip = value => value.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const title = (html.match(/<title>([^<]+)<\/title>/i) || [,""])[1];
const h1 = strip((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [,""])[1]);
const description = (html.match(/<meta name="description" content="([^"]+)"/i) || [,""])[1];

assert(/^.+ \| Simulateur$/.test(title), "SEO title must follow the shared site title contract");
assert(title.length <= 60, "SEO title should remain concise");
assert(/calcul/i.test(title), "SEO title must keep the calcul/calculateur/calculer keyword");
assert(/calcul/i.test(h1) && /retraite/i.test(h1), "H1 must stay descriptive and keep the calcul keyword");
assert(description.length >= 120 && description.length <= 160, "meta description must stay between 120 and 160 characters");
assert(/calcul/i.test(description) && /âge[^.]*retraite/i.test(description), "description must target search intent");
assert(description.includes("1er septembre 2026"), "description must expose the regulatory scope");

const webApplication = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
  .map(match => { try { return JSON.parse(match[1]); } catch { return null; } })
  .flatMap(data => Array.isArray(data) ? data : data && data["@graph"] ? data["@graph"] : [data])
  .find(node => node && node["@type"] === "WebApplication");
assert(webApplication, "JSON-LD WebApplication must be present and valid");
assert(/calcul/i.test(webApplication.name || ""), "JSON-LD WebApplication name must keep the calcul keyword");

assert(/Dernière mise à jour : \d{1,2} (janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre) 20\d{2}\./.test(html), "last update date must be disclosed");
assert(html.includes("suspendu jusqu’en 2028"), "suspension duration must be disclosed");
assert(html.includes("<th scope=\"row\">1958 à 1960</th><td>62 ans</td><td>167 trimestres</td>"), "table must cover the earliest supported generations");
assert(html.includes("1969 et après"), "table must cover the latest supported generations");
assert(html.includes("1er avril 1965"), "parental exception must expose the legal birth-date scope");
assert(html.includes("âge minimum de départ peut être abaissé d’un an"), "parental exception must be disclosed accurately");
assert(html.includes("carrière longue"), "early-retirement scope must be disclosed");
assert(html.includes('<section class="calculator-faq" aria-labelledby="faq-title">'), "FAQ structure must follow the shared calculator contract");
assert(html.includes('<h2 id="faq-title">FAQ</h2>'), "FAQ heading must follow the shared calculator contract");
assert(html.includes("https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000053227007"), "primary legal source must remain linked");
assert(html.includes("Légifrance — loi n° 2025-1403 du 30 décembre 2025, article 105"), "primary legal source citation must remain visible");
console.log("Age-retraite SEO/content guard passed.");
