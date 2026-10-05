const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("public/simulateurs.js", "utf8");
const nodes = {result:{innerHTML:"",textContent:""}};

function loadCalc(calc){
  nodes.result.innerHTML = "";
  nodes.result.textContent = "";
  global.window = {TOOL:{calc}};
  global.document = {getElementById:id=>nodes[id]};
  vm.runInThisContext(source,{filename:"public/simulateurs.js"});
  window.Simulateurs.calc();
}

loadCalc(function(){ return "<strong>10 €</strong>"; });
assert.equal(nodes.result.innerHTML,"<strong>10 €</strong>");
assert.equal(nodes.result.textContent,"");

loadCalc(function(){ return this.euro(0/0); });
assert.equal(nodes.result.textContent,"Valeurs invalides ou insuffisantes.");
assert.equal(nodes.result.innerHTML,"");

loadCalc(function(){ return this.euro(1/0); });
assert.equal(nodes.result.textContent,"Valeurs invalides ou insuffisantes.");
assert.equal(nodes.result.innerHTML,"");

loadCalc(function(){ return "undefined"; });
assert.equal(nodes.result.textContent,"Valeurs invalides ou insuffisantes.");
assert.equal(nodes.result.innerHTML,"");

loadCalc(function(){ return undefined; });
assert.equal(nodes.result.textContent,"Valeurs invalides ou insuffisantes.");
assert.equal(nodes.result.innerHTML,"");

const originalConsoleError = console.error;
console.error = () => {};
try {
  loadCalc(function(){ throw new Error("boom"); });
} finally {
  console.error = originalConsoleError;
}
assert.equal(nodes.result.textContent,"Valeurs invalides ou insuffisantes.");
assert.equal(nodes.result.innerHTML,"");

nodes.result.innerHTML = "";
nodes.result.textContent = "";
global.window = {};
global.document = {getElementById:id=>nodes[id]};
vm.runInThisContext(source,{filename:"public/simulateurs.js"});
window.Simulateurs.calc();
assert.equal(nodes.result.textContent,"Calculateur indisponible.");
assert.equal(nodes.result.innerHTML,"");

const units={cm:{factor:0.01},m:{factor:1},km:{factor:1000}};
assert.equal(window.Simulateurs.convert({value:"1",from:"cm",to:"m",units}),0.01);
assert.equal(window.Simulateurs.convert({value:"1000",from:"m",to:"cm",units}),100000);
assert.equal(window.Simulateurs.convert({value:"",from:"cm",to:"m",units}),null);
assert.equal(window.Simulateurs.convert({value:"-1",from:"cm",to:"m",units}),null);
assert.equal(window.Simulateurs.convert({value:"1",from:"unknown",to:"m",units}),null);
console.log("Simulateurs guard and conversion tests passed.");
