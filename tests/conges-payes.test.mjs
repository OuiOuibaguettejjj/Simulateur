import assert from "node:assert/strict";
import {runInlineCalculator} from "./calculator-harness.mjs";

const cases=[
  {
    name:"10 jours ouvrés : le maintien utilise les jours réellement travaillés",
    inputs:{brut:"24000",cp:"10",unite:"ouvres",mensuel:"2000",joursmois:"21",joursmaintien:"10"},
    expected:["960,00 €","952,38 €"]
  },
  {
    name:"12 jours ouvrables peuvent correspondre à 10 jours travaillés",
    inputs:{brut:"24000",cp:"12",unite:"ouvrables",mensuel:"2000",joursmois:"21",joursmaintien:"10"},
    expected:["960,00 €","952,38 €"]
  }
];
for(const test of cases){
  const out=await runInlineCalculator({slug:"conges-payes",inputs:test.inputs});
  for(const value of test.expected)assert.ok(out.text.includes(value),test.name+": montant attendu "+value+" ; obtenu : "+out.text);
}
for(const test of [
  {name:"jours de travail pour le maintien à zéro",inputs:{brut:"24000",cp:"10",unite:"ouvres",mensuel:"2000",joursmois:"21",joursmaintien:"0"}},
  {name:"jours de travail pour le maintien absents",inputs:{brut:"24000",cp:"10",unite:"ouvres",mensuel:"2000",joursmois:"21",joursmaintien:""}}
]){
  const out=await runInlineCalculator({slug:"conges-payes",inputs:test.inputs});
  assert.ok(out.text.includes("Veuillez renseigner des valeurs positives"),test.name+": une validation était attendue ; obtenu : "+out.text);
}
console.log("Congés payés : 2 cas métier de référence et 2 cas invalides vérifiés.");
