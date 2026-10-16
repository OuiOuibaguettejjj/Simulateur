import assert from "node:assert/strict";
import {runInlineCalculator} from "./calculator-harness.mjs";

const slug="plus-value-mobiliere";
const euro=/\d[\d\s\u00a0\u202f]*,\d{2}\s*€/;

// Référence arithmétique du régime simplifié affiché par la page :
// (15 000 - 10 000 - 0) × 31,4 % = 1 570 €.
const gain=await runInlineCalculator({slug,inputs:{achat:"10000",vente:"15000",frais:"0"}});
assert.match(gain.text,/Plus-value estimée/i,"un gain positif doit être identifié comme une plus-value");
assert.match(gain.text,/5[\s\u00a0\u202f]?000,00\s*€/,"le gain net de référence doit être de 5 000 €");
assert.match(gain.text,/640,00\s*€/,"l'impôt sur le revenu estimé doit être de 640 €");
assert.match(gain.text,/930,00\s*€/,"les prélèvements sociaux estimés doivent être de 930 €");
assert.match(gain.text,/1[\s\u00a0\u202f]?570,00\s*€/,"l'imposition totale estimée doit être de 1 570 €");

// Une vente inférieure au coût d'acquisition doit montrer la moins-value,
// sans l'imputer artificiellement à d'autres gains ni produire d'impôt positif.
const loss=await runInlineCalculator({slug,inputs:{achat:"15000",vente:"10000",frais:"0"}});
assert.match(loss.text,/Moins-value estimée/i,"une perte doit être identifiée comme une moins-value");
assert.match(loss.text,/5[\s\u00a0\u202f]?000,00\s*€/,"la moins-value doit être affichée en valeur absolue");
assert.match(loss.text,/0,00\s*€/,"aucun impôt ne doit être calculé sur une moins-value isolée");
assert.match(loss.text,/n’est pas déduite d’autres gains/i,"l'absence d'imputation doit être explicitée");

// Le gain nul doit rester distinct d'une moins-value.
const zero=await runInlineCalculator({slug,inputs:{achat:"10000",vente:"10000",frais:"0"}});
assert.match(zero.text,/Plus-value estimée/i);
assert.match(zero.text,/0,00\s*€/);

// Champs vides et montants invalides doivent être refusés.
const empty=await runInlineCalculator({slug});
assert.match(empty.text,/Renseignez le prix d’achat/i);
for(const inputs of [
  {achat:"-1",vente:"10000",frais:"0"},
  {achat:"10000",vente:"Infinity",frais:"0"},
  {achat:"10000",vente:"15000",frais:"-1"}
]){
  const out=await runInlineCalculator({slug,inputs});
  assert.match(out.text,/Vérifiez les montants|trop élevés/i,"une entrée invalide doit être rejetée : "+JSON.stringify(inputs));
}
console.log("Plus-value mobilière : gain, moins-value, zéro et validations vérifiés.");
