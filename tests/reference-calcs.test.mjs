import assert from "node:assert/strict";
import fs from "node:fs";
import {runInlineCalculator} from "./calculator-harness.mjs";
const cases=JSON.parse(fs.readFileSync("tests/references/core.json","utf8"));
assert.ok(Array.isArray(cases)&&cases.length>=9,"au moins 9 cas de référence sont requis");
const forbidden=new Set(JSON.parse(fs.readFileSync("data/parametres.json","utf8")).anneeAMigrer.slugs||[]);
const covered=new Set();
function numbers(text){return[...String(text).matchAll(/-?\d+(?:[\s\u00a0\u202f]\d{3})*(?:[.,]\d+)?/g)].map(m=>Number(m[0].replace(/[\s\u00a0\u202f]/g,"").replace(",",".")))}
for(const c of cases){
  assert.equal(typeof c.outil,"string","outil requis");assert.ok(!c.famille||["outil","conversion","comparateur"].includes(c.famille),"famille interactive invalide");assert.ok(c.entrees&&typeof c.entrees==="object","entrees requises");
  assert.equal(typeof c.attendu,"number","attendu doit être numérique");assert.equal(typeof c.tolerance,"number","tolerance requise");
  assert.equal(typeof c.sortie,"string","sortie doit être un libellé ou une regex");
  assert.ok(typeof c.source==="string"&&/^https:\/\//.test(c.source),"source https obligatoire");
  if(c.verificationSource) assert.ok(/^https:\/\//.test(c.verificationSource),"verificationSource https obligatoire");
  assert.ok(!forbidden.has(c.outil),c.outil+" est encore marqué anneeAMigrer");
  const out=await runInlineCalculator({family:c.famille||"outil",slug:c.outil,caseKind:"default",inputs:c.entrees,mockRates:c.mockRates||{},clickButtons:false});assert.ok(out.text,c.outil+" : résultat vide");
  const label=new RegExp(c.sortie,"i");assert.ok(label.test(out.text),c.outil+" : libellé de sortie absent dans « "+out.text+" »");
  const labelled=out.text.slice(out.text.search(label));const got=numbers(labelled)[0];assert.ok(Number.isFinite(got),c.outil+" : aucune valeur numérique associée à la sortie « "+c.sortie+" »");
  assert.ok(Math.abs(got-c.attendu)<=c.tolerance,c.outil+" : attendu "+c.attendu+", obtenu "+got+" (« "+out.text+" »)");
  if(Array.isArray(c.verifications))for(const v of c.verifications){const re=new RegExp(v.sortie,"i");assert.ok(re.test(out.text),c.outil+" : sortie secondaire absente : "+v.sortie);const part=out.text.slice(out.text.search(re));const value=numbers(part)[0];assert.ok(Number.isFinite(value),c.outil+" : valeur secondaire absente : "+v.sortie);assert.ok(Math.abs(value-v.attendu)<=v.tolerance,c.outil+" : "+v.sortie+" attendu "+v.attendu+", obtenu "+value)}
  covered.add(c.outil);
}
const refusedTools=[...forbidden];
await assert.rejects(()=>runInlineCalculator({family:cases[0].famille||"outil",slug:cases[0].outil,inputs:{__unknown_reference_id__:"1"}}),/unknown input id/,"un identifiant d’entrée inconnu doit échouer");
console.log("Couche 2 — "+covered.size+" outils testés sur un cas réel sourcé, "+cases.length+" cas.");
console.log("Couverture : "+covered.size+" outils testés sur au moins un cas réel.");
console.log("Outils refusés (anneeAMigrer) : "+refusedTools.length+".");
