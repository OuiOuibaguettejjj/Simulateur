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
for (const invalid of ["", "bonjour", "micro", "Sasu"]) {
  const out=await runInlineCalculator({family:"outil",slug,inputs:{s:invalid}});
  assert.match(out.text,/Choisissez une structure parmi les trois options proposées/i,"une structure invalide doit être refusée : "+JSON.stringify(invalid));
  assert.doesNotMatch(out.text,/rémunération du président|taux 2026 affichés/i,"une structure invalide ne doit pas être présentée comme un résultat valide");
}
assert.match(page,/<select id="s" name="structure" required>/,"la structure doit être choisie parmi des options fermées");
assert.doesNotMatch(page,/<input id="s"[^>]*list="structures"/,"un champ texte libre ne doit pas remplacer la sélection");
assert.match(page,/urssaf\.fr\/accueil\/actualites\/taux-cotisations-autoentrepeneur\.html/,"les taux doivent pointer vers la source officielle Urssaf");
console.log("Comparateur SASU/EI/micro : 3 branches valides et 4 entrées invalides testées.");
