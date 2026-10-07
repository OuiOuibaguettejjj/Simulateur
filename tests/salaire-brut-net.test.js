const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const html = fs.readFileSync("public/outil/salaire-brut-net/index.html", "utf8");
const match = html.match(/window\.TOOL=\{calc:function\(\)\{([\s\S]*?)\n\}\};/);
assert.ok(match, "Salary calculator function not found");

const inputs = {
  montant: {value:"3500"},
  periode: {value:"mensuel"},
  statut: {value:"noncadre"},
  pas: {value:"0"},
  "net-imposable": {value:""},
  "custom-rate": {value:"23"}
};
const document = {
  getElementById(id) {
    if (id === "mode-net") return {getAttribute: () => "false"};
    return inputs[id] || null;
  }
};

const context = {document, Number, Intl, window:{}};
vm.createContext(context);
vm.runInContext("window.TOOL={calc:function(){"+match[1]+"}}", context);
const calc = context.window.TOOL.calc.bind({
  $(id) { return inputs[id]; },
  euro(value) { return new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(value); }
});

function result(overrides = {}) {
  const defaults = {
    montant: "3500",
    periode: "mensuel",
    statut: "noncadre",
    pas: "0",
    "net-imposable": "",
    "custom-rate": "23"
  };
  for (const [key, value] of Object.entries(defaults)) inputs[key].value = value;
  for (const [key, value] of Object.entries(overrides)) inputs[key].value = value;
  return calc();
}

assert.match(result(), /2\s?695\s?€/);
assert.match(result({pas:"10","net-imposable":"2800"}), /2\s?415\s?€/);
assert.match(result({pas:"10","net-imposable":""}), /Renseignez le revenu net imposable/);
assert.match(result({pas:"10","net-imposable":"30000"}), /Paramètres incohérents/);
assert.match(result({"custom-rate":"40"}), /2\s?100\s?€/);
assert.match(result({"custom-rate":"23,5"}), /2\s?678\s?€/);

console.log("Salaire brut net regression tests passed.");
