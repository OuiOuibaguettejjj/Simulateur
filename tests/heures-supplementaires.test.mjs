import assert from "node:assert/strict";
import {runInlineCalculator} from "./calculator-harness.mjs";

const validCases=[
  {name:"barème par défaut : 20 € × 10 heures",inputs:{horaire:"20",heures:"10"},expected:"260,00 €"},
  {name:"huit premières heures majorées à 25 %",inputs:{horaire:"20",heures:"8"},expected:"200,00 €"},
  {name:"heures au-delà de huit majorées à 50 %",inputs:{horaire:"20",heures:"9"},expected:"230,00 €"},
  {name:"zéro heure supplémentaire",inputs:{horaire:"20",heures:"0"},expected:"0,00 €"},
  {name:"taux horaire et heures avec décimales",inputs:{horaire:"12.50",heures:"1.5"},expected:"23,44 €"}
];
for(const test of validCases){
  const out=await runInlineCalculator({slug:"heures-supplementaires",inputs:test.inputs});
  assert.ok(out.text.includes(test.expected),test.name+": résultat attendu "+test.expected+" ; obtenu : "+out.text);
}

const invalidCases=[
  {name:"taux horaire vide",inputs:{horaire:"",heures:"10"}},
  {name:"heures vides",inputs:{horaire:"20",heures:""}},
  {name:"taux horaire nul",inputs:{horaire:"0",heures:"10"}},
  {name:"taux horaire négatif",inputs:{horaire:"-1",heures:"10"}},
  {name:"heures négatives",inputs:{horaire:"20",heures:"-1"}},
  {name:"taux avec plus de deux décimales",inputs:{horaire:"20.123",heures:"10"}},
  {name:"heures avec plus de deux décimales",inputs:{horaire:"20",heures:"1.234"}}
];
for(const test of invalidCases){
  const out=await runInlineCalculator({slug:"heures-supplementaires",inputs:test.inputs});
  assert.ok(out.text.includes("Renseignez un taux horaire"),test.name+": une erreur de validation était attendue ; obtenu : "+out.text);
}

const overflow=await runInlineCalculator({
  slug:"heures-supplementaires",
  inputs:{horaire:"1.79e308",heures:"1.79e308"}
});
assert.ok(overflow.text.includes("Le montant calculé est trop élevé"),
  "un calcul débordant doit être refusé explicitement ; obtenu : "+overflow.text);

console.log("Heures supplémentaires : "+validCases.length+" cas de référence et "+(invalidCases.length+1)+" cas invalides/limites vérifiés.");
