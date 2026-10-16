import assert from "node:assert/strict";
import fs from "node:fs";
import {runInlineCalculator} from "./calculator-harness.mjs";

const slug="sasu-vs-ei-micro";
const page=fs.readFileSync("public/outil/"+slug+"/index.html","utf8");

assert.ok(!/id=["']ca["']/.test(page),"la page pédagogique ne doit pas afficher un champ de chiffre d’affaires inutilisé");
assert.match(page,/Aucun montant de cotisations ou de revenu net n’est calculé/,"la limite du comparateur doit être visible avant interaction");
assert.match(page,/Afficher les points clés/,"le bouton doit décrire l’action réelle, pas promettre un calcul");
assert.match(page,/<meta name="description" content="([^"]+)"/,"la page doit avoir une meta description");
const metaDescription=page.match(/<meta name="description" content="([^"]+)"/)?.[1] ?? "";
assert.ok(metaDescription.length <= 160,"la meta description doit rester concise");
const ogDescription=page.match(/<meta property="og:description" content="([^"]+)"/)?.[1] ?? "";
assert.equal(ogDescription,metaDescription,"la description Open Graph doit rester alignée sur la meta description");
assert.ok(page.includes("Taux de cotisations micro vérifiés le 16 octobre 2026"),"la date de vérification des taux doit être visible");
assert.ok(page.includes("fiche officielle Service-Public Entreprendre"),"la source officielle des taux doit être visible");
assert.match(page,/<h2>Comparatif rapide<\/h2>[\s\S]*?<table\b[^>]*>[\s\S]*?<th scope="col">Micro-entreprise<\/th>[\s\S]*?<th scope="col">EI au régime réel<\/th>[\s\S]*?<th scope="col">SASU<\/th>/,"le comparatif visible doit couvrir les trois structures");
for (const url of ["vosdroits/F36232","vosdroits/F23844?language=fr","vosdroits/F36240","vosdroits/F36380"]) {
  assert.ok(page.includes(url),"une source officielle dédiée doit être liée : "+url);
}


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
assert.match(page,/<input id="s" name="structure" type="text" list="structures"[^>]*required/,"la saisie doit proposer une liste de valeurs reconnues");
assert.match(page,/<datalist id="structures">[\s\S]*<option value="Micro"[^>]*>[\s\S]*<option value="EI"[^>]*>[\s\S]*<option value="SASU"[^>]*>/,"la liste doit proposer les trois structures prises en charge");
assert.match(page,/if\(!\["Micro","EI","SASU"\]\.includes\(s\)\)/,"toute valeur hors liste doit être refusée explicitement");
assert.match(page,/entreprendre\.service-public\.gouv\.fr\/vosdroits\/F36232/,"les taux doivent pointer vers la fiche officielle des cotisations micro-entrepreneur");
console.log("Comparateur SASU/EI/micro : 3 branches valides et 4 entrées invalides testées.");
