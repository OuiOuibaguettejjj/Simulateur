const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const html = fs.readFileSync("public/outil/ifi/index.html", "utf8");
const inline = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).find(s=>/window\.TOOL\s*=/.test(s));
assert.ok(inline, "window.TOOL doit être défini");
const window = {};
vm.runInNewContext(fs.readFileSync("public/parametres.js","utf8"), {window,Object,JSON,Date,globalThis:window});
vm.runInNewContext(inline,{window,Parametres:window.Parametres,Intl,Number,String,Math},{timeout:1000});
const tool=window.TOOL;
function run(v){return tool.calc.call({$(id){return{value:v[id]??""}}})}
function amount(s){const m=s.match(/class="ifi-main-result">([^<]+)</);assert.ok(m,"Montant absent : "+s);return Number(m[1].replace(/\s/g,"").replace(/€/g,"").replace(",", "."))}
function ifi(n){return amount(run({autresBiens:String(n)}))}
for(const n of [0,500000,800001,1000000,1299999,1300000])assert.equal(amount(run({autresBiens:String(n)})),0,"IFI nul attendu à "+n);
assert.equal(ifi(1300001),1250.02);
assert.equal(ifi(1350000),2225);
assert.equal(ifi(1400000),3200);
assert.equal(ifi(1500000),3900);
assert.equal(ifi(2570000),11390);
assert.equal(ifi(5000000),35690);
assert.equal(ifi(10000000),98190);
assert.equal(ifi(12000000),128190);
assert.equal(amount(run({residence:"1000000"})),0,"abattement résidence principale appliqué");
const dette=run({autresBiens:"6000000",dettes:"4000000"});assert.match(dette,/3\s?800\s?000/);assert.equal(amount(dette),8800);
assert.match(run({autresBiens:"-1"}),/montants positifs ou nuls/i);
console.log("IFI deterministic tests passed.");
