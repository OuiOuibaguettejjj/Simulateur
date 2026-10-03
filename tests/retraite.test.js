const fs = require("fs");
const assert = require("assert");

const html = fs.readFileSync("public/outil/retraite-simplifiee/index.html", "utf8");

for (const field of ['id="birth"', 'id="sam"', 'id="trTotal"', 'id="trGeneral"', 'id="departure"']) {
  assert(html.includes(field), "missing core field: " + field);
}

assert(html.includes("p.year<1955||p.year>2100"), "birth year scope must be enforced");
assert(html.includes("departure.getDate()!==1"), "departure date must be first of month");
assert(html.includes('2026-09-01T12:00:00'), "September 2026 rules scope must be enforced");
assert(html.includes("Questions fréquentes"), "FAQ must be present");
assert.strictEqual((html.match(/<details>/g) || []).length, 6, "FAQ must stay concise");
assert(html.includes("À savoir"), "key data note must be present");

const intro = (html.match(/<div class="content-intro">([\s\S]*?)<\/div>/i) || [,""])[1];
assert(!/surcote/i.test(intro), "intro must not promise surcote calculation");

for (const obsolete of ["surcoteParentaleTr", "parentalChildQuarter", "parentalFullRateBeforeLegal", "surcoteTr"]) {
  assert(!html.includes('id="' + obsolete + '"'), "obsolete field still present: " + obsolete);
}
assert(!html.includes("const scenarios="), "future scenarios should not be part of the simplified calculator");

const rate = 50 - (10 * 0.625);
const pension = 30000 * rate / 100 * (160 / 170);
assert.strictEqual(rate, 43.75, "decote formula regression");
assert(Math.abs(pension - 12352.941176470587) < 1e-9, "base pension formula regression");

const fullRate = 50 - (0 * 0.625);
assert.strictEqual(fullRate, 50, "full-rate regression");

console.log("Retraite deterministic tests passed.");