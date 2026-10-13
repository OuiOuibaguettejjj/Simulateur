import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const html = fs.readFileSync("public/outil/jours-ouvres/index.html", "utf8");
const match = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1);
assert.ok(match, "script fonctionnel du calculateur introuvable");
const context = vm.createContext({window: {}, Date, Math, Number, String, Array, Set, Map, RegExp});
vm.runInContext(match[1], context);

const date = value => context.parseFrenchDate(value);
assert.equal(date("13/07/2026").toISOString(), "2026-07-13T00:00:00.000Z");
assert.equal(date("29/02/2024").toISOString(), "2024-02-29T00:00:00.000Z");
assert.equal(date("29/02/2025"), null, "date impossible rejetée");
assert.equal(date("1/7/2026"), null, "format non conforme rejeté");
assert.equal(date("01/01/1899"), null, "année hors limites rejetée");

const count = (start, end, holidays = true) => context.countBusinessDays(date(start), date(end), holidays);
assert.equal(count("13/07/2026", "17/07/2026", true), 4, "le 14 juillet est exclu");
assert.equal(count("13/07/2026", "17/07/2026", false), 5, "option jours fériés désactivée");
assert.equal(count("04/05/2026", "08/05/2026", true), 4, "le 8 mai est exclu");
assert.equal(count("11/07/2026", "12/07/2026", true), 0, "période limitée au week-end");
assert.equal(count("31/12/2026", "04/01/2027", false), 3, "période traversant deux années");
assert.equal(count("07/04/2026", "07/04/2026", true), 1, "un jour ouvré ordinaire compte une fois");
assert.equal(count("08/05/2026", "08/05/2026", true), 0, "un jour férié seul est exclu");
assert.equal(context.countBusinessDays(date("17/07/2026"), date("13/07/2026"), true), null, "ordre inversé rejeté");

const uiResult = context.window.TOOL.calc.call({
  $: id => ({ "date-debut": "13/07/2026", "date-fin": "17/07/2026", feries: "oui" })[id] && {value: ({ "date-debut": "13/07/2026", "date-fin": "17/07/2026", feries: "oui" })[id]}
});
assert.match(uiResult, /4 jours ouvrés/);
console.log("jours-ouvres : dates, jours fériés nationaux, week-ends, limites et période multi-annuelle validés.");
