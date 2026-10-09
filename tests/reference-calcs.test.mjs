import assert from "node:assert/strict";
import fs from "node:fs";
import {runInlineCalculator} from "./calculator-harness.mjs";
const cases=JSON.parse(fs.readFileSync("tests/references/core.json","utf8"));
assert.ok(Array.isArray(cases)&&cases.length>=9,"au moins 9 cas de référence sont requis");
const forbidden=new Set(JSON.parse(fs.readFileSync("data/parametres.json","utf8")).anneeAMigrer.slugs||[]);
const covered=new Set();
function withinTolerance(actual,expected,tolerance){
  return Math.abs(actual-expected)<=tolerance ||
    (Number.isInteger(actual)&&Math.abs(actual-Math.round(expected))<1e-9&&Math.abs(expected-Math.round(expected))<0.5);
}
function numbers(text){return[...String(text).matchAll(/-?\d+(?:[\s\u00a0\u202f]\d{3})*(?:[.,]\d+)?/g)].map(m=>Number(m[0].replace(/[\s\u00a0\u202f]/g,"").replace(",",".")))}
for(const c of cases){
  assert.equal(typeof c.outil,"string","outil requis");assert.ok(!c.famille||["outil","conversion","comparateur"].includes(c.famille),"famille interactive invalide");assert.ok(c.entrees&&typeof c.entrees==="object","entrees requises");
  assert.equal(typeof c.attendu,"number","attendu doit être numérique");assert.equal(typeof c.tolerance,"number","tolerance requise");
  assert.equal(typeof c.sortie,"string","sortie doit être un libellé ou une regex");
  assert.ok(typeof c.source==="string"&&/^https:\/\//.test(c.source),"source https obligatoire");
  if(c.verificationSource) assert.ok(/^https:\/\//.test(c.verificationSource),"verificationSource https obligatoire");
  assert.ok(!forbidden.has(c.outil),c.outil+" est encore marqué anneeAMigrer");
  const out=await runInlineCalculator({family:c.famille||"outil",slug:c.outil,caseKind:"default",inputs:c.entrees,mockRates:c.mockRates||{}});assert.ok(out.text,c.outil+" : résultat vide");
  const label=new RegExp(c.sortie,"i");assert.ok(label.test(out.text),c.outil+" : libellé de sortie absent dans « "+out.text+" »");
  const labelled=out.text.slice(out.text.search(label));const got=numbers(labelled)[0];assert.ok(Number.isFinite(got),c.outil+" : aucune valeur numérique associée à la sortie « "+c.sortie+" »");
  assert.ok(withinTolerance(got,c.attendu,c.tolerance),c.outil+" : attendu "+c.attendu+", obtenu "+got+" (« "+out.text+" »)");
  if(Array.isArray(c.verifications))for(const v of c.verifications){const re=new RegExp(v.sortie,"i");assert.ok(re.test(out.text),c.outil+" : sortie secondaire absente : "+v.sortie);const part=out.text.slice(out.text.search(re));const value=numbers(part)[0];assert.ok(Number.isFinite(value),c.outil+" : valeur secondaire absente : "+v.sortie);assert.ok(withinTolerance(value,v.attendu,v.tolerance),c.outil+" : "+v.sortie+" attendu "+v.attendu+", obtenu "+value)}
  covered.add(c.outil);
}
// Régressions propres au calculateur de donation : les exonérations ne s'appliquent
// pas à un bien autre qu'une somme d'argent, même si un montant a été saisi.
const donationNonCashExemption = await runInlineCalculator({
  family: "outil",
  slug: "donation",
  inputs: {
    montant: "100000",
    natureDonation: "bien",
    lien: "parent",
    abattementUtilise: "0",
    handicapEligible: "non",
    handicapUtilise: "0",
    donFamilial: "1000",
    donFamilialEligible: "oui",
    donLogement: "0",
    donLogementEligible: "non"
  }
});
assert.match(donationNonCashExemption.text, /exige une somme d’argent/i,
  "donation : l'exonération 790 G doit être refusée pour un bien autre qu'une somme d'argent");

const donationUnconfirmedHousing = await runInlineCalculator({
  family: "outil",
  slug: "donation",
  inputs: {
    montant: "100000",
    natureDonation: "argent",
    lien: "parent",
    abattementUtilise: "0",
    handicapEligible: "non",
    handicapUtilise: "0",
    donFamilial: "0",
    donFamilialEligible: "non",
    donLogement: "1000",
    donLogementEligible: "non"
  }
});
assert.match(donationUnconfirmedHousing.text, /conditions confirmées/i,
  "donation : l'exonération 790 A bis doit être refusée sans confirmation des conditions");


const donationHousingBase = {
  montant: "100000", natureDonation: "argent", lien: "parent",
  abattementUtilise: "0", handicapEligible: "non", handicapUtilise: "0",
  donFamilial: "0", donFamilialEligible: "non", donLogement: "1000",
  donLogementEligible: "oui"
};
for (const [date, shouldPass] of [
  ["2025-02-14", false],
  ["2025-02-15", true],
  ["2026-12-31", true],
  ["2027-01-01", false]
]) {
  const result = await runInlineCalculator({
    family: "outil", slug: "donation",
    inputs: {...donationHousingBase, dateDonLogement: date}
  });
  if (shouldPass) {
    assert.match(result.text, /Droits de donation estimés/i,
      "donation : date 790 A bis autorisée " + date);
  } else {
    assert.match(result.text, /entre le 15 février 2025 et le 31 décembre 2026/i,
      "donation : date 790 A bis refusée " + date);
  }
}
const donationNoHousingDate = await runInlineCalculator({
  family: "outil", slug: "donation",
  inputs: {...donationHousingBase, dateDonLogement: ""}
});
assert.match(donationNoHousingDate.text, /entre le 15 février 2025 et le 31 décembre 2026/i,
  "donation : date de versement requise pour 790 A bis");
const donationOtherParent = await runInlineCalculator({
  family: "outil", slug: "donation",
  inputs: {
    montant: "100000", natureDonation: "bien", lien: "autreParent",
    abattementUtilise: "0", handicapEligible: "non", handicapUtilise: "0",
    donFamilial: "0", donFamilialEligible: "non", donLogement: "0",
    donLogementEligible: "non", baseTaxableAnterieure: "0"
  }
});
assert.match(donationOtherParent.text, /Droits de donation estimés/i,
  "donation : un autre parent jusqu'au quatrième degré doit être calculable");


const donationReverseFamily = await runInlineCalculator({
  family: "outil", slug: "donation",
  inputs: {
    montant: "100000", natureDonation: "argent", lien: "enfant",
    abattementUtilise: "0", handicapEligible: "non", handicapUtilise: "0",
    donFamilial: "1000", donFamilialEligible: "oui", donLogement: "0",
    donLogementEligible: "non"
  }
});
assert.match(donationReverseFamily.text, /lien familial éligible/i,
  "donation : le 790 G ne doit pas s'appliquer dans le sens enfant vers parent");
const donationReverseHousing = await runInlineCalculator({
  family: "outil", slug: "donation",
  inputs: {
    montant: "100000", natureDonation: "argent", lien: "enfant",
    abattementUtilise: "0", handicapEligible: "non", handicapUtilise: "0",
    donFamilial: "0", donFamilialEligible: "non", donLogement: "1000",
    donLogementEligible: "oui", dateDonLogement: "2026-06-01"
  }
});
assert.match(donationReverseHousing.text, /lien familial éligible/i,
  "donation : le 790 A bis ne doit pas s'appliquer dans le sens enfant vers parent");


// Régression : une base taxable antérieure positive ne peut coexister avec un abattement
// de parenté déclaré comme encore entièrement disponible.
const donationInconsistentPriorBase = await runInlineCalculator({
  family: "outil", slug: "donation",
  inputs: {
    montant: "110000", natureDonation: "argent", lien: "parent",
    abattementUtilise: "0", handicapEligible: "non", handicapUtilise: "0",
    donFamilial: "0", donFamilialEligible: "non", donLogement: "0",
    donLogementEligible: "non", baseTaxableAnterieure: "10000"
  }
});
assert.match(donationInconsistentPriorBase.text, /base taxable antérieure est positive[\s\S]*abattement de parenté/i,
  "donation : refuser une base antérieure positive avec un abattement de parenté non consommé");

// La même situation avec l'abattement parent-enfant entièrement consommé calcule les droits marginaux.
const donationConsistentPriorBase = await runInlineCalculator({
  family: "outil", slug: "donation",
  inputs: {
    montant: "10000", natureDonation: "argent", lien: "parent",
    abattementUtilise: "100000", handicapEligible: "non", handicapUtilise: "0",
    donFamilial: "0", donFamilialEligible: "non", donLogement: "0",
    donLogementEligible: "non", baseTaxableAnterieure: "10000"
  }
});
assert.match(donationConsistentPriorBase.text, /Droits de donation estimés/i,
  "donation : calculer les droits marginaux quand les données antérieures sont cohérentes");
assert.match(donationConsistentPriorBase.text, /1[\s\u00a0\u202f]?598(?:[,.]00)?\s*€/i,
  "donation : 10 000 € de base antérieure et 10 000 € de base courante produisent 1 598 € de droits marginaux");

// Régression : les plafonds encore disponibles peuvent dépasser le montant du don.
// Le simulateur applique seulement l'exonération réellement utilisable, sans refuser la saisie.
const donationAvailableCapsAboveGift = await runInlineCalculator({
  family: "outil", slug: "donation",
  inputs: {
    montant: "10000", natureDonation: "argent", lien: "parent",
    abattementUtilise: "100000", handicapEligible: "non", handicapUtilise: "0",
    donFamilial: "31865", donFamilialEligible: "oui",
    donLogement: "100000", donLogementEligible: "oui", dateDonLogement: "2026-06-01",
    baseTaxableAnterieure: "0"
  }
});
assert.match(donationAvailableCapsAboveGift.text, /Droits de donation estimés/i,
  "donation : les plafonds d'exonération disponibles supérieurs au don ne doivent pas provoquer de refus");
assert.match(donationAvailableCapsAboveGift.text, /Exonérations appliquées[\s\S]*?10[\s\u00a0\u202f]?000(?:[,.]00)?\s*€/i,
  "donation : les exonérations appliquées ne doivent pas dépasser le montant du don");

// Régression : le petit-neveu/la petite-nièce peut bénéficier du 790 G si son parent est décédé.
const donationPetitNeveu = await runInlineCalculator({
  family: "outil", slug: "donation",
  inputs: {
    montant: "10000", natureDonation: "argent", lien: "petitNeveu",
    abattementUtilise: "0", handicapEligible: "non", handicapUtilise: "0",
    donFamilial: "31865", donFamilialEligible: "oui",
    donLogement: "0", donLogementEligible: "non", baseTaxableAnterieure: "0"
  }
});
assert.match(donationPetitNeveu.text, /Droits de donation estimés/i,
  "donation : le petit-neveu avec parent décédé doit être éligible au 790 G");
assert.match(donationPetitNeveu.text, /Exonérations appliquées[\s\S]*?8[\s\u00a0\u202f]?406(?:[,.]00)?\s*€/i,
  "donation : l'exonération 790 G du petit-neveu s'applique après l'abattement de 1 594 €");

// Régression : un petit-neveu peut relever du 790 G, mais pas du 790 A bis.
const donationPetitNeveuHousing = await runInlineCalculator({
  family: "outil", slug: "donation",
  inputs: {
    montant: "10000", natureDonation: "argent", lien: "petitNeveu",
    abattementUtilise: "0", handicapEligible: "non", handicapUtilise: "0",
    donFamilial: "0", donFamilialEligible: "non",
    donLogement: "1000", donLogementEligible: "oui", dateDonLogement: "2026-06-01",
    baseTaxableAnterieure: "0"
  }
});
assert.match(donationPetitNeveuHousing.text, /790 A bis exige une somme d’argent, un lien familial éligible/i,
  "donation : le petit-neveu ne doit pas être éligible au 790 A bis");

// Régression : les abattements affichés sont plafonnés au montant effectivement donné.
const donationAllowanceDisplayCapped = await runInlineCalculator({
  family: "outil", slug: "donation",
  inputs: {
    montant: "10000", natureDonation: "argent", lien: "parent",
    abattementUtilise: "0", handicapEligible: "non", handicapUtilise: "0",
    donFamilial: "0", donFamilialEligible: "non",
    donLogement: "0", donLogementEligible: "non", baseTaxableAnterieure: "0"
  }
});
assert.match(donationAllowanceDisplayCapped.text, /Abattements appliqués[\s\S]*?10[\s\u00a0\u202f]?000(?:[,.]00)?\s*€/i,
  "donation : les abattements appliqués affichés ne doivent pas dépasser la donation");

// Régression : le dernier taux progressif reste applicable au-delà du seuil sentinelle historique.
const donationVeryLarge = await runInlineCalculator({
  family: "outil", slug: "donation",
  inputs: {
    montant: "2000000000000", natureDonation: "argent", lien: "parent",
    abattementUtilise: "100000", handicapEligible: "non", handicapUtilise: "0",
    donFamilial: "0", donFamilialEligible: "non", donLogement: "0",
    donLogementEligible: "non", baseTaxableAnterieure: "0"
  }
});
assert.match(donationVeryLarge.text, /899[\s\u00a0\u202f]?999[\s\u00a0\u202f]?762[\s\u00a0\u202f]?394(?:[,.]00)?\s*€/i,
  "donation : le barème doit appliquer 45 % à la base excédant l'ancien dernier seuil");

const refusedTools=[...forbidden];
await assert.rejects(()=>runInlineCalculator({family:cases[0].famille||"outil",slug:cases[0].outil,inputs:{__unknown_reference_id__:"1"}}),/unknown input id/,"un identifiant d’entrée inconnu doit échouer");
console.log("Couche 2 — "+covered.size+" outils testés sur un cas réel sourcé, "+cases.length+" cas.");
console.log("Couverture : "+covered.size+" outils testés sur au moins un cas réel.");
console.log("Outils refusés (anneeAMigrer) : "+refusedTools.length+".");
