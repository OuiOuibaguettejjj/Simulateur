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

const refusedTools=[...forbidden];
await assert.rejects(()=>runInlineCalculator({family:cases[0].famille||"outil",slug:cases[0].outil,inputs:{__unknown_reference_id__:"1"}}),/unknown input id/,"un identifiant d’entrée inconnu doit échouer");
console.log("Couche 2 — "+covered.size+" outils testés sur un cas réel sourcé, "+cases.length+" cas.");
console.log("Couverture : "+covered.size+" outils testés sur au moins un cas réel.");
console.log("Outils refusés (anneeAMigrer) : "+refusedTools.length+".");
