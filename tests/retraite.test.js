const fs = require("fs");
const assert = require("assert");
const vm = require("vm");

const html = fs.readFileSync("public/outil/retraite-simplifiee/index.html", "utf8");

for (const field of ['F.date("birth"', 'F.text("sam"', 'F.text("trTotal"', 'F.text("trGeneral"', 'F.date("departure"']) {
  assert(html.includes(field), "missing core field reference: " + field);
}

for (const obsolete of ["surcoteParentaleTr", "parentalChildQuarter", "parentalFullRateBeforeLegal", "children", "surcoteTr"]) {
  assert(!html.includes('id="' + obsolete + '"'), "obsolete complex field still present: " + obsolete);
}

assert(!html.includes("const scenarios="), "future scenarios should not be part of the simplified calculator");
assert(html.includes("p.year<1955||p.year>2100"), "birth year must stay within the stated simulation scope");
assert(html.includes("Questions fréquentes"), "FAQ must be present");
assert((html.match(/<details>/g)||[]).length === 6, "FAQ must stay concise");
assert(html.includes("À savoir"), "key data note must be present");
const intro = (html.match(/<div class="content-intro">([\s\S]*?)<\/div>/i) || [,""])[1];
assert(!/surcote/i.test(intro), "intro must not promise a surcote calculation");
assert(html.includes('Date de départ envisagée (1er du mois)'), "departure date must be explicitly month-based");
assert(html.includes('departure.getDate()!==1'), "departure date must be validated as the first day of a month");
assert(html.includes('2026-09-01T12:00:00'), "calculator must state the September 2026 rules scope");

const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/gi)][0]?.[1];
assert(script, "calculator script missing");

const context = {
  window: { addEventListener() {} },
  document: {
    getElementById() { return {value:"", children:{length:0}, textContent:""}; },
    querySelectorAll() { return []; },
    createElement() { return {}; },
    addEventListener() {}
  },
  console,
  URL, Number, Math, Date, Intl, JSON, String, Boolean, Array, Object, RegExp,
  parseInt, parseFloat, isFinite, isNaN, setTimeout, clearTimeout
};
vm.runInNewContext(script, context, {timeout:1000});

const params = context.paramsForBirth;
const estimate = context.retirementEstimate;
assert(params && estimate, "core retirement functions must be executable");

const cases = [
  ["1961-08-31", 62 * 12, 168],
  ["1961-09-01", 62 * 12 + 3, 169],
  ["1964-01-01", 62 * 12 + 9, 170],
  ["1965-03-31", 62 * 12 + 9, 170],
  ["1965-04-01", 63 * 12, 171],
  ["1966-01-01", 63 * 12 + 3, 172],
  ["1969-01-01", 64 * 12, 172]
];
for (const [birth, legalMonths, req] of cases) {
  const p = params(birth);
  assert(p, "missing parameters for " + birth);
  assert.strictEqual(p.legalMonths, legalMonths, "legal age regression " + birth);
  assert.strictEqual(p.req, req, "required quarters regression " + birth);
}

assert.strictEqual(params("1954-12-31"), null, "births before 1955 must be outside scope");
assert.strictEqual(params("2101-01-01"), null, "births after 2100 must be outside scope");

const birth = new Date("1964-01-16T12:00:00");
const departure = new Date("2027-01-01T12:00:00");
const r = estimate(160, 160, 170, 170, departure, birth);
assert.strictEqual(r.missing, 10, "decote must use the smaller missing-quarter count");
assert.strictEqual(r.rate, 43.75, "decote rate regression");
assert(Math.abs(r.pension - (30000 * 43.75 / 100 * (160 / 170))) < 1e-9, "full pension formula regression");

const full = estimate(170, 170, 170, 170, new Date("2031-01-01T12:00:00"), birth);
assert.strictEqual(full.rate, 50, "full-rate regression");
assert.strictEqual(full.missing, 0, "no decote at full rate");

const age67 = estimate(140, 140, 170, 170, new Date("2031-01-01T12:00:00"), birth);
assert.strictEqual(age67.missing, 0, "no decote at 67");

console.log("Retraite deterministic tests passed.");
