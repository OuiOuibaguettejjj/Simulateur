import assert from "node:assert/strict";
import {runInlineCalculator} from "./calculator-harness.mjs";

const run=inputs=>runInlineCalculator({family:"outil",slug:"micro-entrepreneur",inputs});
const normal=await run({ca:"1000",act:"vente",acre:"non",creation:"01/07/2026"});
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
const acreOld=await run({ca:"1000",act:"vente",acre:"oui",creation:"30/06/2026"});
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
const outOfScope=await run({ca:"1000",act:"vente",acre:"oui",creation:"01/07/2025"});
assert.match(outOfScope.text,/uniquement les créations ou reprises intervenues en 2026/i,
  "micro-entrepreneur : ne pas extrapoler les taux ACRE hors du périmètre vérifié");
console.log("Micro-entrepreneur : taux ordinaires, ACRE, activité tourisme et entrées invalides validés.");
