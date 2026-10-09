import assert from "node:assert/strict";
import {runInlineCalculator} from "./calculator-harness.mjs";

const fullTime=await runInlineCalculator({slug:"smic",inputs:{heures:"35",zone:"metropole"}});
assert.match(fullTime.text,/12,31\s*€/,"le taux horaire métropolitain doit rester à 12,31 €");
assert.match(fullTime.text,/1\s*867,02\s*€/,"le montant mensuel à 35 h doit rester à 1 867,02 €");

const overtime=await runInlineCalculator({slug:"smic",inputs:{heures:"36",zone:"metropole"}});
assert.match(overtime.text,/heures supplémentaires ne sont pas calculées/i,"36 h doit être refusé tant que les majorations d'heures supplémentaires ne sont pas modélisées");

const mayotte=await runInlineCalculator({slug:"smic",inputs:{heures:"35",zone:"mayotte"}});
assert.match(mayotte.text,/9,56\s*€/,"le taux horaire de Mayotte doit rester à 9,56 €");
assert.doesNotMatch(mayotte.text,/net indicatif/i,"ne pas afficher de net indicatif non fourni pour Mayotte");

console.log("SMIC : références métropole/Mayotte et exclusion des heures supplémentaires validées.");
