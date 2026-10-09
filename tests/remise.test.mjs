import assert from "node:assert/strict";
import {runInlineCalculator} from "./calculator-harness.mjs";

const cases=[
  {name:"prix 120 €, remise 15 %",inputs:{p:120,r:15},expected:["102,00 €","18,00 €"]},
  {name:"prix 80 €, remise 25 %",inputs:{p:80,r:25},expected:["60,00 €","20,00 €"]},
  {name:"remise nulle",inputs:{p:100,r:0},expected:["100,00 €","0,00 €"]},
  {name:"remise totale",inputs:{p:100,r:100},expected:["0,00 €","100,00 €"]},
  {name:"prix nul",inputs:{p:0,r:25},expected:["0,00 €","0,00 €"]},
  {name:"prix très faible : les montants affichés restent cohérents",inputs:{p:"0.05",r:10},expected:["0,05 €","0,00 €"]},
  {name:"virgule décimale",inputs:{p:"12,5",r:20},expected:["10,00 €","2,50 €"]}
];
for(const test of cases){
  const out=await runInlineCalculator({slug:"remise",inputs:test.inputs});
  for(const value of test.expected)assert.ok(out.text.includes(value),test.name+": résultat attendu "+value+" ; obtenu : "+out.text);
}
for(const test of [
  {name:"prix négatif",inputs:{p:-1,r:10}},
  {name:"taux supérieur à 100 %",inputs:{p:100,r:101}},
  {name:"prix vide",inputs:{p:"",r:10}},
  {name:"taux vide",inputs:{p:100,r:""}}
]){
  const out=await runInlineCalculator({slug:"remise",inputs:test.inputs});
  assert.ok(out.text.includes("Valeurs invalides"),test.name+": une erreur de validation était attendue ; obtenu : "+out.text);
}
console.log("Remise : "+cases.length+" cas métier valides et 4 cas invalides vérifiés.");
