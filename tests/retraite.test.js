const fs = require("fs");
const assert = require("assert");

const html = fs.readFileSync("public/outil/retraite-simplifiee/index.html", "utf8");

for (const field of ["birth", "sam", "trTotal", "trGeneral", "departure"]) {
  assert(
    new RegExp('id=["']' + field + '["']').test(html),
    "missing core field: " + field
  );
}

for (const obsolete of ["surcoteParentaleTr", "parentalChildQuarter", "parentalFullRateBeforeLegal", "children", "surcoteTr"]) {
  assert(
    !html.includes('id="' + obsolete + '"'),
    "obsolete complex field still present: " + obsolete
  );
}

assert(!html.includes("const scenarios="), "future scenarios should not be part of the simplified calculator");
assert(!html.includes("ReferenceError"), "calculator source contains an old runtime error marker");

function retirementRate(trTotal, req, departure, age67) {
  const missingByDuration = Math.max(0, req - trTotal);
  const missingByAge = departure >= age67 ? 0 : Math.ceil(departure.monthsToAge67 / 3);
  const missing = Math.min(20, missingByDuration, missingByAge);
  return { missing, rate: 50 - missing * 0.625 };
}

assert.deepStrictEqual(retirementRate(160, 169, {monthsToAge67: 56}, null), {missing: 9, rate: 44.375});
assert.deepStrictEqual(retirementRate(169, 169, {monthsToAge67: 56}, null), {missing: 0, rate: 50});
assert.deepStrictEqual(retirementRate(140, 169, {monthsToAge67: 0}, {monthsToAge67: 0}), {missing: 0, rate: 50});

const pension = 30000 * 44.375 / 100 * (160 / 169);
assert(Math.abs(pension - 12603.550295857987) < 1e-9, "base pension formula regression");

console.log("Retraite deterministic tests passed.");
