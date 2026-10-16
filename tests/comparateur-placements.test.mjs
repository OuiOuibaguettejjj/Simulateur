import assert from "node:assert/strict";
import {runInlineCalculator} from "./calculator-harness.mjs";

function amountAfter(label, text) {
  const start = text.search(new RegExp(label, "i"));
  assert.notEqual(start, -1, "libellé absent : " + label + " dans " + text);
  const match = text.slice(start).match(/(-?\d[\d\s\u00a0\u202f]*(?:[,.]\d{1,2})?)\s*€/);
  assert.ok(match, "montant absent après " + label + " dans " + text);
  return Number(match[1].replace(/[\s\u00a0\u202f]/g, "").replace(",", "."));
}

const inputs = {
  "capital-a": "10000", "versement-a": "200", "rendement-a": "3", "frais-a": "0.2", "horizon-a": "10",
  "capital-b": "10000", "versement-b": "200", "rendement-b": "3", "frais-b": "0.2", "horizon-b": "10"
};
const base = await runInlineCalculator({slug: "comparateur-placements", inputs});
assert.equal(amountAfter("Placement A · 10 ans", base.text), 40790,
  "10 000 € initiaux + 200 €/mois sur 10 ans avec rendement net annuel de 2,8 %");
assert.equal(amountAfter("Gains estimés", base.text), 6790,
  "les gains estimés doivent correspondre au capital final moins les sommes versées");

const zeroRate = await runInlineCalculator({
  slug: "comparateur-placements",
  inputs: {...inputs, "rendement-a": "0", "frais-a": "0", "rendement-b": "0", "frais-b": "0"}
});
assert.equal(amountAfter("Placement A · 10 ans", zeroRate.text), 34000,
  "à taux net nul, capital initial et versements doivent être restitués sans gains");
assert.equal(amountAfter("Gains estimés", zeroRate.text), 0,
  "à taux net nul, les gains estimés doivent être nuls");

const differentHorizons = await runInlineCalculator({
  slug: "comparateur-placements",
  inputs: {...inputs, "horizon-b": "15"}
});
assert.match(differentHorizons.text, /Attention : les horizons sont différents/i,
  "les horizons différents doivent déclencher un avertissement explicite");

const empty = await runInlineCalculator({
  slug: "comparateur-placements",
  inputs: {...inputs, "capital-a": ""}
});
assert.match(empty.text, /Vérifiez vos hypothèses/i,
  "un champ vide doit être refusé plutôt que converti en zéro");

const negative = await runInlineCalculator({
  slug: "comparateur-placements",
  inputs: {...inputs, "capital-a": "-1"}
});
assert.match(negative.text, /Vérifiez vos hypothèses/i,
  "un capital négatif doit être refusé");

console.log("Comparateur de placements : scénario de référence, taux net nul, horizons différents et saisies invalides validés.");
