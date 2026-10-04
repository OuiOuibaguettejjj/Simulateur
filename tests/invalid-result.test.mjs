import assert from "node:assert/strict";
import {isInvalidResult} from "./invalid-result.mjs";
for(const value of ["NaN €","-Infinity","undefined","null","[object Object]","∞ €","-∞ €"]) assert.equal(isInvalidResult(value),true,"doit détecter "+value);
for(const value of ["1 234,56 €","Résultat nul"]) assert.equal(isInvalidResult(value),false,"ne doit pas détecter "+value);
console.log("invalid-result tests passed.");
