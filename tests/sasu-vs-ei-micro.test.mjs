import assert from "node:assert/strict";
import fs from "node:fs";
import {runInlineCalculator} from "./calculator-harness.mjs";

const slug="sasu-vs-ei-micro";
const page=fs.readFileSync("public/outil/"+slug+"/index.html","utf8");

assert.ok(!/id=["']ca["']/.test(page),"la page pédagogique ne doit pas afficher un champ de chiffre d’affaires inutilisé");
assert.match(page,/Aucun montant de cotisations ou de revenu net n’est calculé/,"la limite du comparateur doit être visible avant interaction");
assert.match(page,/Afficher les points clés/,"le bouton doit décrire l’action réelle, pas promettre un calcul");

const cases=[
  {structure:"Micro",expected:/cotisations généralement calculées sur le chiffre d’affaires encaissé/i},
  {structure:"EI",expected:/cotisations dépendent du revenu professionnel/i},
  {structure:"SASU",expected:/rémunération du président/i},
];
for(const item of cases){
  const out=await runInlineCalculator({family:"outil",slug,inputs:{s:item.structure}});
  assert.match(out.text,item.expected,"résultat incohérent pour "+item.structure);
  assert.doesNotMatch(out.text,/NaN|undefined|Valeur invalide/i,"résultat invalide pour "+item.structure);
}
console.log("Comparateur SASU/EI/micro : 3 branches testées ; aucune fausse promesse de calcul numérique.");
