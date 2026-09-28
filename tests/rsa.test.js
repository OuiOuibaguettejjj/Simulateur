const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

global.window = {};
vm.runInThisContext(fs.readFileSync("public/rsa.js", "utf8"), { filename: "public/rsa.js" });

const { RSAEngine } = global.window;
assert.ok(RSAEngine, "RSAEngine must be available");

function calc(overrides = {}) {
  return RSAEngine.calculate({
    age: 30,
    status: "single",
    dependents: 0,
    student: "no",
    youngActive: "no",
    majoration: "no",
    resident: "yes",
    housing: "none",
    months: [0, 0, 0],
    ...overrides
  });
}

const cases = [
  [["single", 0], 651.69],
  [["single", 1], 977.54],
  [["single", 2], 1173.05],
  [["single", 3], 1433.73],
  [["single", 4], 1694.41],
  [["couple", 0], 977.54],
  [["couple", 1], 1173.05],
  [["couple", 2], 1368.56],
  [["couple", 3], 1629.24],
  [["couple", 4], 1889.92]
];

for (const [[status, dependents], expected] of cases) {
  const result = calc({ status, dependents });
  assert.equal(result.eligible, true, `case ${status}/${dependents} should be eligible`);
  assert.equal(result.forfait, expected, `RSA forfait mismatch for ${status}/${dependents}`);
  assert.equal(result.rsa, expected, `RSA result mismatch for ${status}/${dependents}`);
}

assert.equal(calc({ majoration: "yes" }).forfait, 836.85);
assert.equal(calc({ majoration: "yes", dependents: 1 }).forfait, 1115.80);
assert.equal(calc({ status: "couple", housing: "forfait" }).logement, 156.41);
assert.equal(calc({ status: "single", housing: "forfait" }).logement, 78.20);
assert.equal(calc({ status: "single", months: [300, 300, 300] }).rsa, 351.69);

// Additional regression coverage: >4 dependents, 3+ person housing forfait,
// housing aid below the forfait, and key eligibility exclusions.
assert.equal(calc({ status: "single", dependents: 5 }).forfait, 1955.09);
assert.equal(calc({ status: "couple", dependents: 5 }).forfait, 2150.60);
assert.equal(calc({ status: "single", dependents: 3, housing: "forfait" }).logement, 193.55);
assert.equal(calc({ housing: "aidBelowForfait", housingAid: 100 }).logement, 100);
assert.equal(calc({ age: 17 }).eligible, false);
assert.equal(calc({ resident: "no" }).eligible, false);
assert.equal(calc({ student: "yes" }).eligible, false);

console.log("RSA deterministic tests passed.");
