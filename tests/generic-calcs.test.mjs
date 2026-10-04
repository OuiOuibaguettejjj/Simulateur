import assert from "node:assert/strict";
import fs from "node:fs";
import {execFileSync} from "node:child_process";
import {listIntegratedTools,runInlineCalculator} from "./calculator-harness.mjs";
import {isInvalidResult} from "./invalid-result.mjs";

const exceptionsPath="tests/generic-calcs-exceptions.json";
const data=JSON.parse(fs.readFileSync(exceptionsPath,"utf8"));
const exceptions=data.exceptions;
const keyOf=x=>x.slug+"|"+x.case;
const exceptionMap=new Map(exceptions.map(x=>[keyOf(x),x]));
const cases=["default","zero","empty","negative","large","comma"];
const tools=listIntegratedTools(),failures=[];
for(const slug of tools)for(const caseKind of cases){
  const key=slug+"|"+caseKind;
  try{
    const out=runInlineCalculator({slug,caseKind});
    if(!out.text)throw new Error("résultat vide");
    if(isInvalidResult(out.text))throw new Error("valeur invalide dans le résultat : "+out.text.slice(0,160));
  }catch(error){
    const ex=exceptionMap.get(key);
    if(!ex || (ex.match && !String(error.message||error).includes(ex.match)))failures.push({slug,case:caseKind,error:String(error.message||error)});
  }
}
const ids=new Set(exceptions.map(keyOf));assert.equal(ids.size,exceptions.length,"exceptions : identités dupliquées");
assert.equal(data.maxFailures,exceptions.length,"exceptions : maxFailures doit correspondre au nombre d'identités");
let previous=null;
try{previous=JSON.parse(execFileSync("git",["show","HEAD^1:"+exceptionsPath],{encoding:"utf8"}));}catch(error){if(error?.status!==128)throw error}
if(previous){
  const prevIds=new Set(previous.exceptions.map(keyOf));
  for(const id of ids)assert.ok(prevIds.has(id),"exception nouvelle non autorisée : "+id);
}
const currentFailures=new Set(failures.map(keyOf));
const stale=exceptions.filter(ex=>!currentFailures.has(keyOf(ex))).map(keyOf);
assert.equal(stale.length,0,"exceptions devenues obsolètes : "+stale.join(", "));
assert.ok(failures.length<=data.maxFailures,"cliquet : les échecs hors exceptions ne peuvent pas augmenter");
console.log("Couche 1 — "+tools.length+" outils testés sur au moins un cas réel, "+exceptions.length+" outils/cas entièrement ou partiellement exemptés.");
if(failures.length){console.error("Échecs couche 1 hors exceptions :");for(const f of failures)console.error(" - "+f.slug+" ["+f.case+"] : "+f.error);process.exit(1)}
console.log("Couche 1 : tous les cas passent ou correspondent exactement à une exception documentée.");
