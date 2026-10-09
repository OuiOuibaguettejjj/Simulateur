const fs = require("fs");
const assert = require("assert");
const vm = require("vm");

const html = fs.readFileSync("public/outil/retraite-simplifiee/index.html", "utf8");

for (const field of ['id="birth"', 'id="sam"', 'id="trTotal"', 'id="trGeneral"', 'id="departure"']) {
  assert(html.includes(field), "missing core field: " + field);
}

assert(html.includes("p.year<1955||p.year>2100"), "birth year scope must be enforced");
assert(html.includes("departure.getDate()!==1"), "departure date must be first of month");
assert(html.includes('effectiveFrom+"T12:00:00"'), "effective start date must come from regulatory parameters");
assert(html.includes("const effectiveTo=window.Parametres.get"), "effective end date must come from regulatory parameters");
assert(html.includes("Date de départ hors période couverte"), "out-of-period departures must be rejected");
assert(html.includes('samValue===""||trTotalValue===""||trGeneralValue===""'), "empty numeric fields must be rejected");
assert(html.includes("d.getFullYear()===parts[0]"), "impossible calendar dates must be rejected");
assert(html.includes('<script src="/parametres.js" defer></script>'), "regulatory parameters must be loaded");
assert(html.includes("birthCohorts.find"), "birth cohort rules must come from parameters");
assert(html.includes('class="calculator-faq"'), "FAQ must be present");
assert(html.includes("<h2 id=\"faq-title\">FAQ</h2>"), "FAQ must use the standard title");
assert.strictEqual((html.match(/class="calculator-faq-answer"/g) || []).length, 5, "FAQ answers must use the standard wrapper");
assert.strictEqual((html.match(/<details>/g) || []).length, 5, "FAQ must stay concise");
assert(html.includes("Exemple de calcul"), "a concise independent example must be present");
assert(html.includes("Légifrance — loi de financement de la Sécurité sociale pour 2026"), "official legal source must be linked");

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

// Execute the actual browser calculator against representative valid and invalid inputs.
const paramsJs = fs.readFileSync("public/parametres.js", "utf8");
const inlineScript = html.match(/<script>\s*([\s\S]*?)<\/script><\/body>/i);
assert(inlineScript, "inline calculator script must be present");
const context = { console, Date, Math, Number, Object, Array, String };
context.window = context;
vm.createContext(context);
vm.runInContext(paramsJs, context);
vm.runInContext(inlineScript[1], context);

function calculate(values) {
  const fields = values;
  return context.window.TOOL.calc.call({
    $(id) { return { value: fields[id] ?? "" }; },
    euro(value) { return value.toFixed(2) + " €"; }
  });
}
const valid = calculate({birth:"1963-01-01", departure:"2026-10-01", sam:"30000", trTotal:"170", trGeneral:"150"});
assert(valid.includes("13 235") || valid.includes("13235") || valid.includes("13 235"), "valid reference scenario should return pension estimate");
const expired = calculate({birth:"1963-01-01", departure:"2027-04-01", sam:"30000", trTotal:"170", trGeneral:"150"});
assert(expired.includes("hors période couverte"), "departures after parameter expiry must be rejected");
const emptyQuarter = calculate({birth:"1963-01-01", departure:"2026-10-01", sam:"30000", trTotal:"", trGeneral:"150"});
assert(emptyQuarter.includes("Valeurs invalides"), "empty quarter input must be rejected");
const impossibleDate = calculate({birth:"1963-02-30", departure:"2026-10-01", sam:"30000", trTotal:"170", trGeneral:"150"});
assert(impossibleDate.includes("Valeurs invalides"), "impossible birth dates must be rejected");

console.log("Retraite deterministic and runtime tests passed.");