import assert from "node:assert/strict";
import {runInlineCalculator} from "./calculator-harness.mjs";

const empty=await runInlineCalculator({slug:"succession",inputs:{part:""}});
assert.match(empty.text,/Renseignez une part nette valide\./,"une part vide doit produire une validation explicite");

const zero=await runInlineCalculator({slug:"succession",inputs:{part:"0"}});
assert.doesNotMatch(zero.text,/Renseignez une part nette valide\./,"une part égale à zéro reste une valeur valide");

console.log("Succession : champ vide refusé, zéro accepté.");
