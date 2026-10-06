import assert from "node:assert/strict";
import {runInlineCalculator} from "./calculator-harness.mjs";

const cases = [
  {name: "A vide / B renseigné", inputs: {a: "", b: "18"}},
  {name: "A renseigné / B vide", inputs: {a: "12", b: ""}},
];

for (const testCase of cases) {
  const out = await runInlineCalculator({
    family: "outil",
    slug: "ratio",
    inputs: testCase.inputs,
  });
  assert.match(out.text, /Valeurs invalides/, testCase.name + " doit être refusé");
}

const valid = await runInlineCalculator({
  family: "outil",
  slug: "ratio",
  inputs: {a: "12", b: "18"},
});
assert.match(valid.text, /Ratio\s*:\s*2\s*:\s*3/, "le cas nominal doit rester fonctionnel");
assert.match(valid.text, /Quotient\s*:\s*0,6667/, "le quotient nominal doit rester fonctionnel");

console.log("Ratio : validation des valeurs vides et cas nominal OK.");
