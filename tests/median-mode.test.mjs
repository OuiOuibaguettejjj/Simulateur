import assert from "node:assert/strict";
import {runInlineCalculator} from "./calculator-harness.mjs";
async function calculate(s){return (await runInlineCalculator({slug:"median-mode",inputs:{s}})).text}
assert.match(await calculate("10,12,20"),/Médiane : 12/);
assert.match(await calculate("12, 15, 15, 18, 20"),/Médiane : 15/);
assert.match(await calculate("12, 15, 15, 18, 20"),/Mode : 15/);
assert.match(await calculate("2,4,8,10"),/Médiane : 6/);
assert.match(await calculate("2,4,8,10"),/aucun \(aucune répétition\)/);
assert.match(await calculate("1,2,2,3,3"),/Mode : 2, 3/);
assert.match(await calculate("1,5; 2,5; 3"),/Médiane : 2,5/);
assert.match(await calculate("1.5, 2.5, 3"),/Médiane : 2,5/);
assert.match(await calculate(""),/Saisissez au moins un nombre/);
assert.match(await calculate("1, nope, 3"),/Valeur invalide/);
assert.match(await calculate("1e309,2"),/Valeur invalide/);
assert.match(await calculate("1.1234567890123, 1.1234567890123"),/Médiane : 1,1234567890123/);
assert.match(await calculate("1e308, 1.7e308"),/Médiane : 1,35000000000000e\+308/);
console.log("median-mode: 13 scénarios validés.");
