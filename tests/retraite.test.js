const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

const html = fs.readFileSync("public/outil/retraite-simplifiee/index.html", "utf8");
const script = html.match(/<script>\nconst F=([\s\S]*?)\n<\/script>/);
assert(script, "retirement calculator script not found");

const context = {
  window: { TOOL: {}, addEventListener() {} },
  console,
  Date,
  Number,
  Math,
  Intl,
  String,
  Object,
  Array
};
vm.createContext(context);
vm.runInContext(script[1], context);

const { paramsForBirth, retirementEstimate } = context;
assert(paramsForBirth, "paramsForBirth missing");
assert(retirementEstimate, "retirementEstimate missing");

function assertParams(birth, legalMonths, req) {
  const p = paramsForBirth(birth);
  assert(p, "missing params for " + birth);
  assert.strictEqual(p.legalMonths, legalMonths, "legal age mismatch for " + birth);
  assert.strictEqual(p.req, req, "required quarters mismatch for " + birth);
}

assertParams("1961-08-31", 744, 168);
assertParams("1961-09-01", 747, 169);
assertParams("1962-01-01", 750, 169);
assertParams("1963-01-01", 753, 170);
assertParams("1965-03-31", 753, 170);
assertParams("1965-04-01", 756, 171);
assertParams("1966-01-01", 759, 172);
assertParams("1969-01-01", 768, 172);

const birth = new Date("1961-11-08T12:00:00");
const full = retirementEstimate(30000, 169, 169, 169, new Date("2024-02-08T12:00:00"), birth);
assert.strictEqual(full.rate, 50);
assert.strictEqual(full.decote, 0);

const example = retirementEstimate(30000, 160, 160, 169, new Date("2024-04-01T12:00:00"), birth);
assert.strictEqual(example.missing, 9);
assert.strictEqual(example.decote, 5.625);
assert.strictEqual(example.rate, 44.375);

const age67 = retirementEstimate(30000, 140, 140, 169, new Date("2028-11-08T12:00:00"), birth);
assert.strictEqual(age67.missing, 0);
assert.strictEqual(age67.rate, 50);

assert.strictEqual(paramsForBirth("1960-02-29").legalDate.getDate(), 28);
assert.strictEqual(paramsForBirth("1960-02-29").legalDate.getMonth(), 1);

console.log("Retraite deterministic tests passed.");
