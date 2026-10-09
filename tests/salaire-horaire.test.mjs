import assert from "node:assert/strict";
import {runInlineCalculator} from "./calculator-harness.mjs";

async function calculate(inputs) {
  const result = await runInlineCalculator({slug:"salaire-horaire", inputs});
  return result.text;
}

let result = await calculate({mode:"mensuel", montant:"3000", heures:"35"});
assert.match(result, /19,78\s?€/);
assert.match(result, /3\s?000(?:,00)?\s?€/);
assert.match(result, /36\s?000(?:,00)?\s?€/);

result = await calculate({mode:"horaire", montant:"20", heures:"35"});
assert.match(result, /20(?:,00)?\s?€/);
assert.match(result, /3\s?033,33\s?€/);
assert.match(result, /36\s?400(?:,00)?\s?€/);

result = await calculate({mode:"horaire", montant:"20", heures:"20"});
assert.match(result, /20(?:,00)?\s?€/);
assert.match(result, /1\s?733,33\s?€/);
assert.match(result, /20\s?800(?:,00)?\s?€/);

result = await calculate({mode:"mensuel", montant:"", heures:"35"});
assert.match(result, /Renseignez un montant/);
result = await calculate({mode:"mensuel", montant:"3000", heures:"0"});
assert.match(result, /Renseignez un montant/);
result = await calculate({mode:"mensuel", montant:"3000", heures:"169"});
assert.match(result, /Renseignez un montant/);
result = await calculate({mode:"mensuel", montant:"1680", heures:"168"});
assert.match(result, /10,00\\s?€/);
result = await calculate({mode:"mensuel", montant:"3000", heures:"0.01"});
assert.match(result, /69\\s?230,77\\s?€/);
result = await calculate({mode:"mensuel", montant:"-10", heures:"35"});
assert.match(result, /Renseignez un montant/);
result = await calculate({mode:"mensuel", montant:"0", heures:"35"});
assert.match(result, /montant doit être supérieur à zéro/);
result = await calculate({mode:"mensuel", montant:"12,5", heures:"35"});
assert.match(result, /12,50\s?€/);

console.log("Salaire horaire tests passed.");
