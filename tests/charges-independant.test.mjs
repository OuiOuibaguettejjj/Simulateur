import assert from "node:assert/strict";
import {runInlineCalculator} from "./calculator-harness.mjs";

const slug="charges-independant";

// Référence arithmétique indépendante pour la formule simplifiée affichée par la page.
// 40 000 × 0,74 × 30 % = 8 880 €. Ce cas ne prétend pas valider un barème officiel.
const reference=await runInlineCalculator({slug,inputs:{rev:"40000",taux:"30"}});
assert.match(reference.text,/8[\s\u00a0\u202f]?880,00\s*€/,"la simulation de référence doit afficher 8 880 € de cotisations");
assert.match(reference.text,/base simplifiée retenue/i,"la base simplifiée doit être expliquée dans le résultat");

// Les champs vides ne doivent plus être assimilés à des zéros.
const empty=await runInlineCalculator({slug});
assert.match(empty.text,/renseignez le revenu annuel et le taux/i,"les champs vides doivent produire un message de validation");

// Zéro est une saisie valide et doit être distingué d'une absence de saisie.
const zero=await runInlineCalculator({slug,inputs:{rev:"0",taux:"0"}});
assert.match(zero.text,/0,00\s*€/,"les valeurs nulles doivent rester acceptées");

// Les bornes du taux et du revenu sont contrôlées même hors validation native du navigateur.
for(const inputs of [
  {rev:"-1",taux:"30"},
  {rev:"1000",taux:"101"},
  {rev:"Infinity",taux:"30"},
  {rev:"1000",taux:"-0.1"}
]){
  const out=await runInlineCalculator({slug,inputs});
  assert.match(out.text,/saisissez un revenu positif ou nul et un taux compris entre 0 et 100 %/i,"les entrées hors limites doivent être rejetées : "+JSON.stringify(inputs));
}

console.log("charges-independant : formule de référence, champs vides, zéro et bornes vérifiés.");
