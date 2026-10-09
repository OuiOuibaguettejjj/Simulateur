import assert from "node:assert/strict";
import {runInlineCalculator} from "./calculator-harness.mjs";

function amountAfter(label, text) {
  const start = text.search(new RegExp(label, "i"));
  assert.notEqual(start, -1, "libellé absent : " + label + " dans " + text);
  const match = text.slice(start).match(/(-?\d[\d\s\u00a0\u202f]*(?:[,.]\d{1,2})?)\s*€/);
  assert.ok(match, "montant absent après " + label + " dans " + text);
  return Number(match[1].replace(/[\s\u00a0\u202f]/g, "").replace(",", "."));
}

const base = await runInlineCalculator({
  family: "outil",
  slug: "epargne-mensuelle",
  inputs: { initial: "5000", mensuel: "300", taux: "3", annees: "10" }
});
assert.equal(amountAfter("Capital final estimé", base.text), 48553.98,
  "5 000 € initiaux + 300 €/mois pendant 10 ans à 3 % annuel effectif");

const zeroRate = await runInlineCalculator({
  family: "outil",
  slug: "epargne-mensuelle",
  inputs: { initial: "5000", mensuel: "300", taux: "0", annees: "10" }
});
assert.equal(amountAfter("Capital final estimé", zeroRate.text), 41000,
  "à taux nul, le capital final doit égaler le total versé");
assert.equal(amountAfter("Intérêts estimés", zeroRate.text), 0,
  "à taux nul, les intérêts doivent être nuls");

const blank = await runInlineCalculator({
  family: "outil",
  slug: "epargne-mensuelle",
  inputs: { initial: "", mensuel: "300", taux: "3", annees: "10" }
});
assert.match(blank.text, /Renseignez les quatre champs/i,
  "une entrée vide ne doit pas être convertie silencieusement en zéro");

const negative = await runInlineCalculator({
  family: "outil",
  slug: "epargne-mensuelle",
  inputs: { initial: "-1", mensuel: "300", taux: "3", annees: "10" }
});
assert.match(negative.text, /Vérifiez les valeurs/i,
  "un capital initial négatif doit être refusé");

console.log("Épargne mensuelle : cas de référence, taux nul, champ vide et valeur négative validés.");
