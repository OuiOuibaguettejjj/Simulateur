import assert from "node:assert/strict";
import {runInlineCalculator} from "./calculator-harness.mjs";

const run=async(inputs,expected)=>{const out=await runInlineCalculator({slug:"perimetre",inputs});assert.match(out.text,expected);};
await run({a:"5",b:"3"},/16/);
await run({shape:"triangle",side1:"3",side2:"4",side3:"5"},/12/);
await run({shape:"circle",radius:"2"},/12,57/);
await run({a:"5,5",b:"2,5"},/16/);
await run({a:"0",b:"3"},/strictement positives/);
await run({shape:"triangle",side1:"1",side2:"2",side3:"3"},/triangle valide/);
await run({shape:"circle",radius:""},/rayon strictement positif/);
console.log("Calculateur périmètre : cas rectangle, triangle, cercle, virgule décimale et entrées invalides validés.");
