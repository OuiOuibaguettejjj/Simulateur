const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

global.window = {};
vm.runInThisContext(fs.readFileSync("public/parametres.js","utf8"),{filename:"public/parametres.js"});
vm.runInThisContext(fs.readFileSync("public/impot.js","utf8"),{filename:"public/impot.js"});
const {ImpotEngine}=global.window;
assert.ok(ImpotEngine,"ImpotEngine must be available");

function calc(income,parts,couple=false,options={}){
  const result=ImpotEngine.calculate({income,parts,couple,...options});
  assert.equal(result.valid,true);
  return result;
}

assert.equal(calc(50000,1).grossTax,8103.99);
assert.equal(calc(50000,1).netTax,8103.99);
assert.equal(calc(15000,1).netTax,0);
assert.equal(Math.round(calc(50000,2,true).grossTax),2948);assert.equal(Math.round(calc(50000,2,true).decote),149);assert.equal(Math.round(calc(50000,2,true).netTax),2799);

// Official 2026 quotient-family cap example: married couple, 130,000 €, 5 parts.
const officialExample=calc(130000,5,true);
assert.equal(Math.round(officialExample.rawTax),7920);
assert.equal(Math.round(officialExample.familyQuotientCap),10842);
assert.equal(Math.round(officialExample.grossTax),14366);
assert.equal(Math.round(officialExample.netTax),14366);

const uncapped=calc(130000,2,true);
assert.equal(uncapped.familyQuotientCap,0);
assert.equal(uncapped.grossTax,uncapped.rawTax);

// Optional advanced inputs: already-determined deductions reduce the taxable base,
// while source withholding is only used to estimate the remaining balance/refund.
const advanced=calc(50000,1,false,{deductions:5000,sourceWithholding:3000});
assert.equal(advanced.taxableIncome,45000);
assert.equal(Math.round(advanced.netTax),6604);
assert.equal(Math.round(advanced.balance),3604);
assert.equal(Math.round(calc(50000,1,false,{sourceWithholding:9000}).balance*100),-89601);

assert.equal(ImpotEngine.calculate({income:-1,parts:1,couple:false}).valid,false);
assert.equal(ImpotEngine.calculate({income:50000,parts:0,couple:false}).valid,false);
assert.equal(ImpotEngine.calculate({income:NaN,parts:1,couple:false}).valid,false);
assert.equal(ImpotEngine.calculate({income:50000,parts:1,couple:false,deductions:-1}).valid,false);
assert.equal(ImpotEngine.calculate({income:50000,parts:1,couple:false,sourceWithholding:-1}).valid,false);

console.log("Impôt deterministic tests passed.");