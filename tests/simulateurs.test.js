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

const angleUnits = {
  deg:{factor:Math.PI/180},
  rad:{factor:1},
  grad:{factor:Math.PI/200},
  turn:{factor:2*Math.PI},
  arcmin:{factor:Math.PI/(180*60)},
  arcsec:{factor:Math.PI/(180*3600)},
  mrad:{factor:0.001}
};
assert.ok(Math.abs(window.Simulateurs.convert({value:180,from:"deg",to:"rad",units:angleUnits})-Math.PI)<1e-12);
assert.ok(Math.abs(window.Simulateurs.convert({value:Math.PI,from:"rad",to:"deg",units:angleUnits})-180)<1e-12);
assert.ok(Math.abs(window.Simulateurs.convert({value:1,from:"turn",to:"deg",units:angleUnits})-360)<1e-12);
assert.ok(Math.abs(window.Simulateurs.convert({value:1,from:"deg",to:"arcmin",units:angleUnits})-60)<1e-12);
assert.ok(Number.isNaN(window.Simulateurs.convert({value:1,from:"unknown",to:"deg",units:angleUnits})));

console.log("Simulateurs guard and conversion tests passed.");
