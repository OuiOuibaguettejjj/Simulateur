import assert from "node:assert/strict";
import {runInlineCalculator} from "./calculator-harness.mjs";

const run=inputs=>runInlineCalculator({family:"outil",slug:"micro-entrepreneur",inputs:{periodStart:"01/07/2026",periodEnd:"30/09/2026",...inputs}});
const normal=await run({ca:"1000",act:"vente",acre:"non",creation:"01/07/2026",periodStart:"01/07/2026",periodEnd:"30/09/2026"});
assert.match(normal.text,/Chiffre d’affaires restant après cotisations[\s\S]*877[,.]00\s*€/i,
  "micro-entrepreneur : 1 000 € de CA vente donnent 877 € après cotisations ordinaires");
assert.match(normal.text,/Cotisations estimées[\s\S]*123[,.]00\s*€/i,
  "micro-entrepreneur : cotisations ordinaires vente à 12,3 %");
const tourism=await run({ca:"1000",act:"tourisme",acre:"non",creation:"01/07/2026"});
assert.match(tourism.text,/Cotisations estimées[\s\S]*60[,.]00\s*€/i,
  "micro-entrepreneur : meublé de tourisme classé à 6 %");
const acre=await run({ca:"1000",act:"bic",acre:"oui",creation:"01/07/2026"});
assert.match(acre.text,/Cotisations estimées[\s\S]*159[,.]00\s*€/i,
  "micro-entrepreneur : taux ACRE BIC de 15,9 % à compter du 1er juillet 2026");
const acreOld=await run({ca:"1000",act:"vente",acre:"oui",creation:"30/06/2026",periodStart:"01/07/2026",periodEnd:"30/09/2026"});
assert.match(acreOld.text,/Cotisations estimées[\s\S]*62[,.]00\s*€/i,
  "micro-entrepreneur : taux ACRE vente de 6,2 % avant le 1er juillet 2026");
const negative=await run({ca:"-1000",act:"vente",acre:"non",creation:"01/07/2026"});
assert.match(negative.text,/chiffre d’affaires encaissé valide/i,
  "micro-entrepreneur : refuser un chiffre d’affaires négatif");
const empty=await run({ca:"",act:"vente",acre:"non",creation:"01/07/2026"});
assert.match(empty.text,/chiffre d’affaires encaissé valide/i,
  "micro-entrepreneur : refuser un chiffre d’affaires vide");
const invalidDate=await run({ca:"1000",act:"vente",acre:"oui",creation:"31/02/2026"});
assert.match(invalidDate.text,/date de début d’activité valide/i,
  "micro-entrepreneur : refuser une date impossible");
const priorYear=await run({ca:"1000",act:"bic",acre:"oui",creation:"01/10/2025",periodStart:"01/01/2026",periodEnd:"31/03/2026"});
assert.match(priorYear.text,/Cotisations estimées[\s\S]*106[,.]00\s*€/i,
  "micro-entrepreneur : taux ACRE antérieur au 1er juillet 2026 pour une création en 2025, si les droits sont encore actifs");
const missingDate=await run({ca:"1000",act:"vente",acre:"oui",creation:""});
assert.match(missingDate.text,/date de début d’activité valide/i,
  "micro-entrepreneur : demander une date réelle si l’ACRE est sélectionnée");
const outOfScope=await run({ca:"1000",act:"vente",acre:"oui",creation:"01/07/2024"});
assert.match(outOfScope.text,/du 1er janvier 2025 au 31 décembre 2026/i,
  "micro-entrepreneur : refuser les dates antérieures au périmètre de taux vérifié");

const expectedAcreBefore={vente:62,tourisme:30,bic:106,bnc:128,cipav:134};
const expectedAcreAfter={vente:93,tourisme:45,bic:159,bnc:192,cipav:174};
for(const [activity,cents] of Object.entries(expectedAcreBefore)){
  const result=await run({ca:"1000",act:activity,acre:"oui",creation:"30/06/2026"});
  assert.match(result.text,new RegExp("Cotisations estimées[\\s\\S]*"+cents.toFixed(2).replace(".", "[,.]")+"\\s*€","i"),
    "micro-entrepreneur : taux ACRE avant juillet 2026 pour "+activity);
}
for(const [activity,cents] of Object.entries(expectedAcreAfter)){
  const result=await run({ca:"1000",act:activity,acre:"oui",creation:"01/07/2026"});
  assert.match(result.text,new RegExp("Cotisations estimées[\\s\\S]*"+cents.toFixed(2).replace(".", "[,.]")+"\\s*€","i"),
    "micro-entrepreneur : taux ACRE à compter de juillet 2026 pour "+activity);
  assert.match(result.text,/toute la période/i,
    "micro-entrepreneur : rappeler que les droits ACRE doivent couvrir toute la période");
}

console.log("Micro-entrepreneur : taux ordinaires, ACRE par activité, périodes partielles et entrées invalides validés.");

const partialPeriod=await run({ca:"1000",act:"vente",acre:"oui",creation:"05/10/2025",periodStart:"01/06/2026",periodEnd:"31/07/2026"});
assert.match(partialPeriod.text,/dépasse la fin théorique des droits ACRE/i,
  "micro-entrepreneur : refuser une période qui déborde la fin des droits ACRE");
const afterExpiry=await run({ca:"1000",act:"vente",acre:"oui",creation:"01/07/2026",periodStart:"01/07/2027",periodEnd:"31/07/2027"});
assert.match(afterExpiry.text,/commence après la fin théorique des droits ACRE/i,
  "micro-entrepreneur : refuser l’ACRE après la fin théorique des droits");
const invalidPeriod=await run({ca:"1000",act:"vente",acre:"oui",creation:"01/07/2026",periodStart:"01/09/2026",periodEnd:"01/08/2026"});
assert.match(invalidPeriod.text,/fin de la période estimée doit être postérieure/i,
  "micro-entrepreneur : refuser une période inversée");
