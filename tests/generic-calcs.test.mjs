import assert from "node:assert/strict";
import fs from "node:fs";
import {execFileSync} from "node:child_process";
import {listIntegratedPages,runInlineCalculator} from "./calculator-harness.mjs";
import {isInvalidResult} from "./invalid-result.mjs";

const exceptionsPath="tests/generic-calcs-exceptions.json";
const data=JSON.parse(fs.readFileSync(exceptionsPath,"utf8"));
const exceptions=data.exceptions;
const keyOf=x=>(x.family?x.family+"/":"")+x.slug+"|"+x.case;
const exceptionMap=new Map(exceptions.map(x=>[keyOf(x),x]));
const cases=["default","zero","empty","negative","large","comma"];
const pages=listIntegratedPages(),rawFailures=[];
for(const page of pages)for(const caseKind of cases){
  const {family,slug}=page;
  try{
    const out=await runInlineCalculator({family,slug,caseKind});
    if(!out.text)throw new Error("résultat vide");
    if(isInvalidResult(out.text))throw new Error("valeur invalide dans le résultat : "+out.text.slice(0,160));
  }catch(error){rawFailures.push({slug,case:caseKind,error:String(error.message||error)})}
}
const rawFailureMap=new Map(rawFailures.map(f=>[keyOf(f),f]));
const failures=rawFailures.filter(f=>{
  const ex=exceptionMap.get(keyOf(f));
  return !ex || (ex.match && !f.error.includes(ex.match));
});
const ids=new Set(exceptions.map(keyOf));assert.equal(ids.size,exceptions.length,"exceptions : identités dupliquées");
assert.equal(data.maxFailures,exceptions.length,"exceptions : maxFailures doit correspondre au nombre d'identités");
let previous=null;
let historyAvailable=true;
try{execFileSync("git",["rev-parse","--verify","HEAD^1"],{encoding:"utf8"});}catch{historyAvailable=false;console.log("ratchet ignoré : historique git indisponible");}
if(historyAvailable){
  try{const tracked=execFileSync("git",["ls-tree","-r","--name-only","HEAD^1","--",exceptionsPath],{encoding:"utf8"}).trim();if(tracked===exceptionsPath)previous=JSON.parse(execFileSync("git",["show","HEAD^1:"+exceptionsPath],{encoding:"utf8"}));}catch(error){if(error?.status!==0)throw error}
}
if(previous){
  const prevIds=new Set(previous.exceptions.map(keyOf));
  for(const id of ids)assert.ok(prevIds.has(id),"exception nouvelle non autorisée : "+id);
}
const rawFailureIds=new Set(rawFailures.map(keyOf));
const stale=exceptions.filter(ex=>!rawFailureIds.has(keyOf(ex))).map(keyOf);
assert.equal(stale.length,0,"exceptions devenues obsolètes : "+stale.join(", "));
assert.ok(failures.length<=data.maxFailures,"échecs hors exceptions : "+failures.map(f=>keyOf(f)+" => "+f.error).join(" | "));
const fullyExempted=new Set(pages.filter(page=>cases.every(kind=>exceptionMap.has(keyOf({...page,case:kind})))).map(page=>keyOf(page)));
console.log("Couverture : "+pages.length+" pages interactives testées sur au moins un cas réel, "+fullyExempted.size+" pages entièrement exemptées.");
if(failures.length){console.error("Échecs couche 1 hors exceptions :");for(const f of failures)console.error(" - "+f.slug+" ["+f.case+"] : "+f.error);process.exit(1)}
console.log("Couche 1 : tous les cas passent ou correspondent exactement à une exception documentée.");
