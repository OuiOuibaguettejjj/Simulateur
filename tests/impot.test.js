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

assert.equal(calc(50000,1).grossTax,8104);
assert.equal(calc(50000,1).netTax,8104);
assert.equal(calc(15000,1).netTax,0);
assert.equal(calc(50000,2,true).grossTax,2948);
assert.equal(calc(50000,2,true).decote,150);
assert.equal(calc(50000,2,true).netTax,2798);

// Official 2026 quotient-family cap example: married couple, 130,000 €, 5 parts.
const officialExample=calc(130000,5,true);
assert.equal(officialExample.rawTax,7920);
assert.equal(officialExample.familyQuotientCap,10842);
assert.equal(officialExample.grossTax,14366);
assert.equal(officialExample.netTax,14366);

const uncapped=calc(130000,2,true);
assert.equal(uncapped.familyQuotientCap,0);
assert.equal(uncapped.grossTax,Math.round(uncapped.rawTax));

// Optional advanced input: source withholding only estimates the remaining balance/refund.
const advanced=calc(50000,1,false,{sourceWithholding:3000});
assert.equal(advanced.taxableIncome,50000);
assert.equal(advanced.netTax,8104);
assert.equal(advanced.balance,5104);
assert.equal(calc(50000,1,false,{sourceWithholding:9000}).balance,-896);

assert.equal(ImpotEngine.calculate({income:-1,parts:1,couple:false}).valid,false);
assert.equal(ImpotEngine.calculate({income:50000,parts:0,couple:false}).valid,false);
assert.equal(ImpotEngine.calculate({income:NaN,parts:1,couple:false}).valid,false);
assert.equal(ImpotEngine.calculate({income:50000,parts:1,couple:false,sourceWithholding:-1}).valid,false);

console.log("Impôt deterministic tests passed.");