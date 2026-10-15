import assert from "node:assert/strict";
import {runInlineCalculator} from "./calculator-harness.mjs";

const cases=[
  {name:"part d'une valeur",inputs:{mode:"part",v:"250",p:"20"},expected:"20 % de 250 = 50"},
  {name:"pourcentage représenté",inputs:{mode:"ratio",v:"30",p:"150"},expected:"30 représente 20 % de 150"},
  {name:"hausse",inputs:{mode:"variation",v:"80",p:"100"},expected:"25 %"},
  {name:"baisse",inputs:{mode:"variation",v:"100",p:"80"},expected:"-20 %"},
  {name:"division par zéro pour une proportion",inputs:{mode:"ratio",v:"30",p:"0"},expected:"différente de zéro"},
  {name:"valeur initiale nulle",inputs:{mode:"variation",v:"0",p:"80"},expected:"différente de zéro"},
  {name:"valeur initiale négative avec remontée",inputs:{mode:"variation",v:"-100",p:"-50"},expected:"doit être positive"},
  {name:"valeur initiale négative avec baisse",inputs:{mode:"variation",v:"-100",p:"-150"},expected:"doit être positive"},
  {name:"champ vide",inputs:{mode:"part",v:"",p:"20"},expected:"nombres valides"}
];
for(const item of cases){
  const result=await runInlineCalculator({slug:"pourcentage",inputs:item.inputs});
  assert.ok(result.text.includes(item.expected),item.name+": attendu "+JSON.stringify(item.expected)+", reçu "+JSON.stringify(result.text));
}
console.log("Pourcentage : "+cases.length+" scénarios métier validés.");
