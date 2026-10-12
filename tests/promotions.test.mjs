import assert from "node:assert/strict";
import {runInlineCalculator} from "./calculator-harness.mjs";

const cases=[
  {name:"compare les prix unitaires et identifie l'offre la moins chère",inputs:{pA:2,qA:3,tA:5,pB:2.2,qB:3,tB:5.7},expected:["1,67 €","1,90 €","L’offre A","1,00 €","0,90 €","16,7 %"]},
  {name:"accepte une virgule décimale",inputs:{pA:"2,5",qA:2,tA:"4,5",pB:3,qB:2,tB:5},expected:["2,25 €","2,50 €"]},
  {name:"détecte deux offres au même prix unitaire",inputs:{pA:2,qA:3,tA:6,pB:3,qB:2,tB:4},expected:["même prix par unité"]},
  {name:"indique un surcoût quand l'offre dépasse le prix habituel",inputs:{pA:2,qA:2,tA:5,pB:3,qB:2,tB:5},expected:["surcoût"]}
];
for(const testCase of cases){
  const out=await runInlineCalculator({slug:"promotions",inputs:testCase.inputs});
  for(const expected of testCase.expected)assert.ok(out.text.includes(expected),testCase.name+": attendu "+expected+" ; obtenu : "+out.text);
}
for(const testCase of [
  {name:"quantité nulle",inputs:{pA:2,qA:0,tA:4,pB:2,qB:2,tB:4}},
  {name:"quantité fractionnaire",inputs:{pA:2,qA:1.5,tA:3,pB:2,qB:2,tB:4}},
  {name:"prix négatif",inputs:{pA:-1,qA:2,tA:1,pB:2,qB:2,tB:4}},
  {name:"total manquant",inputs:{pA:2,qA:2,tA:"",pB:2,qB:2,tB:4}}
]){
  const out=await runInlineCalculator({slug:"promotions",inputs:testCase.inputs});
  assert.ok(out.text.includes("Valeurs à vérifier"),testCase.name+": validation attendue ; obtenu : "+out.text);
}
console.log("Promotions : "+cases.length+" cas métier et 4 cas de validation vérifiés.");
