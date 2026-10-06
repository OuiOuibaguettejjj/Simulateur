const fs = require("fs");
const assert = require("assert");
const vm = require("vm");

const html = fs.readFileSync("public/outil/age-retraite/index.html", "utf8");
assert(html.includes("pensions prenant effet à partir du 1er septembre 2026"), "scope must be explicit");
assert(html.includes("le mois de naissance peut modifier le résultat"), "month boundary must be explained");
assert(html.includes("ne détermine pas à lui seul une date personnelle de départ"), "tool limits must be explicit");

const marker = "window.TOOL={calc:function(){";
const start = html.indexOf(marker);
assert(start >= 0, "age-retraite calculator engine missing");
const end = html.indexOf("};</script>", start);
assert(end > start, "age-retraite calculator engine boundary missing");
const script = html.slice(start, end + 2);
const context = { window: {} };
vm.runInNewContext(script, context);
assert(context.window.TOOL && typeof context.window.TOOL.calc === "function", "calculator engine must be executable");

function calc(date) {
  return context.window.TOOL.calc.call({ $: () => ({ value: date }) });
}

assert(/62 ans/.test(calc("1961-08-31")), "1961 August must remain at 62");
assert(/168 trimestres/.test(calc("1961-08-31")), "1961 August must require 168 quarters");
assert(/62 ans et 3 mois/.test(calc("1961-09-01")), "1961 September must move to 62 years 3 months");
assert(/169 trimestres/.test(calc("1961-09-01")), "1961 September must require 169 quarters");
assert(/62 ans et 9 mois/.test(calc("1965-03-31")), "1965 March must remain at 62 years 9 months");
assert(/170 trimestres/.test(calc("1965-03-31")), "1965 March must require 170 quarters");
assert(/63 ans/.test(calc("1965-04-01")), "1965 April must move to 63");
assert(/171 trimestres/.test(calc("1965-04-01")), "1965 April must require 171 quarters");
assert(/63 ans et 9 mois/.test(calc("1968-12-31")), "1968 must be 63 years 9 months");
assert(/64 ans/.test(calc("1969-01-01")), "1969+ must be 64");
assert(/172 trimestres/.test(calc("1969-01-01")), "1969+ must require 172 quarters");
assert(/date de naissance valide/i.test(calc("not-a-date")), "invalid date must be rejected");
assert(/non prise en charge/i.test(calc("1957-12-31")), "out-of-scope year must be rejected");

console.log("Age-retraite deterministic tests passed.");
