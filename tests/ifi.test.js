const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

// Le calculateur IFI est défini dans le HTML (window.TOOL) : on exécute le vrai code de la page.
const file = "public/outil/ifi/index.html";
const html = fs.readFileSync(file, "utf8");
const script = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
  .map(match => match[1])
  .find(source => /window\.TOOL\s*=/.test(source));
assert.ok(script, "La page IFI doit définir window.TOOL");

const window = { addEventListener() {} };
vm.runInNewContext(script, { window, document: {}, console }, { filename: file, timeout: 1000 });
const tool = window.TOOL;
assert.equal(typeof tool.calc, "function", "TOOL.calc doit être une fonction");

const euro = value => "€" + Number(value).toFixed(2);
function run(value) {
  return tool.calc.call({ $: () => ({ value: String(value) }), euro, num: euro });
}

function amount(result) {
  const match = result.match(/<strong>€(-?\d+(?:\.\d+)?)<\/strong>/);
  assert.ok(match, "Montant introuvable dans : " + result);
  return Number(match[1]);
}

function ifi(value) { return amount(run(value)); }

// Non assujetti sous 1,3 M€ : 0 € et message explicite (régression : 1 000 000 € affichait 1 000 €).
for (const value of ["", 0, 500000, 800001, 1000000, 1250000, 1299999]) {
  const result = run(value);
  assert.equal(amount(result), 0, "IFI attendu à 0 € pour " + value);
  assert.match(result, /Non assujetti/, "Message « non assujetti » attendu pour " + value);
}

// Exemples officiels Service-Public : 1 350 000 € (avec décote) et 1 500 000 €.
assert.equal(ifi(1350000), 2225);
assert.match(run(1350000), /Décote estimée : €625\.00/);
assert.equal(ifi(1500000), 3900);
assert.doesNotMatch(run(1500000), /Décote/);

// Fin de la décote à 1,4 M€ : 2 500 + 100 000 × 0,7 % = 3 200 €.
assert.equal(ifi(1400000), 3200);
assert.doesNotMatch(run(1400000), /Décote/);

// Tranches supérieures du barème.
assert.equal(ifi(2570000), 11390);
assert.equal(ifi(5000000), 35690);
assert.equal(ifi(10000000), 98190);
assert.equal(ifi(12000000), 128190);

// Saisie invalide.
assert.equal(run(-5), "Renseignez un patrimoine valide.");

console.log("IFI deterministic tests passed.");
