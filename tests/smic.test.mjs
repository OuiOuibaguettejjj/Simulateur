import assert from "node:assert/strict";
import {runInlineCalculator} from "./calculator-harness.mjs";

const fullTime=await runInlineCalculator({slug:"smic",inputs:{heures:"35",zone:"metropole"}});
assert.match(fullTime.text,/12,31\s*€/,"le taux horaire métropolitain doit rester à 12,31 €");
assert.match(fullTime.text,/1\s*867,02\s*€/,"le montant mensuel à 35 h doit rester à 1 867,02 €");
assert.match(fullTime.text,/22\s*404,20\s*€/,"le montant annuel à 35 h doit rester à 22 404,20 €");

const halfTime=await runInlineCalculator({slug:"smic",inputs:{heures:"17.5",zone:"metropole"}});
assert.match(halfTime.text,/933,51\s*€/,"le montant mensuel à 17,5 h doit être proratisé");
assert.match(halfTime.text,/11\s*202,10\s*€/,"le montant annuel à 17,5 h doit être proratisé");

const minimum=await runInlineCalculator({slug:"smic",inputs:{heures:"0.01",zone:"metropole"}});
assert.match(minimum.text,/12,31\s*€/,"la borne minimale autorisée de 0,01 h doit être acceptée");

for (const hours of ["", "0", "0.005", "0.015", "35.01", "36"]) {
  const invalid=await runInlineCalculator({slug:"smic",inputs:{heures:hours,zone:"metropole"}});
  assert.match(invalid.text,/entre 0,01 et 35 heures normales/i,`la saisie ${JSON.stringify(hours)} doit être refusée`);
}

const mayotte=await runInlineCalculator({slug:"smic",inputs:{heures:"35",zone:"mayotte"}});
assert.match(mayotte.text,/9,56\s*€/,"le taux horaire de Mayotte doit rester à 9,56 €");
assert.doesNotMatch(mayotte.text,/net indicatif/i,"ne pas afficher de net indicatif non fourni pour Mayotte");

console.log("SMIC : montants de référence, prorata, bornes, pas de saisie et exclusion des heures supplémentaires validés.");
