import assert from "node:assert/strict";
import {runInlineCalculator} from "./calculator-harness.mjs";

const base={loyer:1000,vac:5,credit:750,"assurance-credit":0,charges:120,gestion:0,taxe:1200,assurance:150,entretien:300,autres:0};
const cases=[
  {name:"hypothèses par défaut",inputs:base,expected:["-57,50 €","-690,00 €"]},
  {name:"cash-flow nul",inputs:{loyer:100,vac:0,credit:0,"assurance-credit":0,charges:0,gestion:0,taxe:1200,assurance:0,entretien:0,autres:0},expected:["0,00 €","0,00 €"]},
  {name:"vacance de 100 %",inputs:{loyer:1000,vac:100,credit:0,"assurance-credit":0,charges:0,gestion:0,taxe:0,assurance:0,entretien:0,autres:0},expected:["0,00 €"]},
  {name:"virgule décimale",inputs:{loyer:"1000,50",vac:0,credit:"700,25","assurance-credit":0,charges:0,gestion:0,taxe:0,assurance:0,entretien:0,autres:0},expected:["300,25 €","3 603,00 €"]}
];
for(const test of cases){
  const out=await runInlineCalculator({slug:"cash-flow-immobilier",inputs:test.inputs});
  for(const value of test.expected)assert.ok(out.text.includes(value),test.name+": attendu "+value+" ; obtenu : "+out.text);
}
const invalidCases=[
  {name:"champ vide",inputs:{...base,loyer:""}},
  {name:"valeur négative",inputs:{...base,credit:-1}},
  {name:"vacance supérieure à 100 %",inputs:{...base,vac:100.01}},
  {name:"gestion supérieure à 100 %",inputs:{...base,gestion:100.01}},
  {name:"dépenses extrêmes",inputs:{...base,loyer:"1e308",credit:"1e308",taxe:"1e308"}}
];
for(const test of invalidCases){
  const out=await runInlineCalculator({slug:"cash-flow-immobilier",inputs:test.inputs});
  assert.ok(/Renseignez un nombre valide|doivent être compris entre 0 et 100|trop élevés pour être calculés de façon fiable/.test(out.text),test.name+": message de validation attendu ; obtenu : "+out.text);
}
console.log("Cash-flow immobilier : 4 cas métier valides et 5 cas invalides vérifiés.");
