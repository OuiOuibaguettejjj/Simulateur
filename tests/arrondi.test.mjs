import assert from "node:assert/strict";
import {runInlineCalculator} from "./calculator-harness.mjs";

async function calculate(inputs) {
  const result=await runInlineCalculator({slug:"arrondi",inputs});
  return result.text;
}

assert.match(await calculate({v:"12.345",p:"2"}),/12\.35/,"12,345 à 2 décimales doit donner 12,35");
assert.match(await calculate({v:"8.124",p:"2"}),/8\.12/,"8,124 à 2 décimales doit donner 8,12");
assert.match(await calculate({v:"12.345",p:"0"}),/12/,"zéro décimale doit être accepté");
assert.match(await calculate({v:"-12.345",p:"2"}),/-12\.35/,"les nombres négatifs doivent rester acceptés");

for(const inputs of [
  {v:"",p:"2"},
  {v:"12.345",p:""},
  {v:"12.345",p:"2.5"},
  {v:"12.345",p:"-1"},
  {v:"12.345",p:"101"}
]) {
  assert.match(await calculate(inputs),/Valeurs invalides/,"les champs vides et précisions invalides doivent être refusés : "+JSON.stringify(inputs));
}

console.log("arrondi : cas normaux, zéro, négatif, champs vides et bornes de précision validés.");
