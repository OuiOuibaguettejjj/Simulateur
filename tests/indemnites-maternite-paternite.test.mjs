import assert from "node:assert/strict";
import {runInlineCalculator} from "./calculator-harness.mjs";

const run=inputs=>runInlineCalculator({family:"outil",slug:"indemnites-maternite-paternite",inputs});
const textFor=async inputs=>(await run(inputs)).text;

const highMonth=await textFor({s1:"10000",s2:"0",s3:"0",jours:"1",type:"maternite"});
assert.match(highMonth,/34,67\s*€/,"le plafond mensuel doit s’appliquer séparément au salaire du mois concerné");

const capped=await textFor({s1:"4005",s2:"4005",s3:"4005",jours:"1",type:"paternite"});
assert.match(capped,/104,02\s*€/,"l’indemnité journalière doit être plafonnée au maximum 2026");

const floor=await textFor({s1:"100",s2:"100",s3:"100",jours:"1",type:"maternite"});
assert.match(floor,/11,12\s*€/,"le minimum journalier doit s’appliquer dans l’hypothèse de droits ouverts");

const negative=await textFor({s1:"-1",s2:"3000",s3:"3000",jours:"1",type:"maternite"});
assert.match(negative,/salaires bruts mensuels valides/i,"un salaire négatif doit être refusé");

const empty=await textFor({s1:"",s2:"3000",s3:"3000",jours:"1",type:"maternite"});
assert.match(empty,/salaires bruts mensuels valides/i,"un salaire manquant doit être refusé");

const zero=await textFor({s1:"0",s2:"0",s3:"0",jours:"1",type:"maternite"});
assert.match(zero,/supérieur à zéro/i,"trois salaires nuls ne doivent pas produire une indemnité minimale fictive");

const fractionalDays=await textFor({s1:"3000",s2:"3000",s3:"3000",jours:"1.5",type:"maternite"});
assert.match(fractionalDays,/nombre entier de jours/i,"les jours indemnisés doivent être un entier positif");

console.log("indemnites-maternite-paternite tests passed.");
