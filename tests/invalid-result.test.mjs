import assert from "node:assert/strict";
import {isInvalidResult} from "./invalid-result.mjs";
import {runInlineCalculator} from "./calculator-harness.mjs";
for(const value of ["NaN €","-Infinity","undefined","null","[object Object]","∞ €","∞%","∞ jours","(∞)","-∞ €"]) assert.equal(isInvalidResult(value),true,"doit détecter "+value);
for(const value of ["1 234,56 €","Résultat nul"]) assert.equal(isInvalidResult(value),false,"ne doit pas détecter "+value);

const extreme=await runInlineCalculator({family:"outil",slug:"capacite-emprunt",inputs:{revenus:"1e308",charges:"0",taux:"3.32",duree:"25",assurance:"0.20",apport:"0"}});
assert.match(extreme.text,/Résultat impossible/i,"la capacité d’emprunt doit refuser un résultat numérique non représentable");
assert.equal(isInvalidResult(extreme.text),false,"un résultat extrême ne doit jamais exposer une valeur invalide");
console.log("invalid-result tests passed.");
