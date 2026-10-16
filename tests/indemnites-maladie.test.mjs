import assert from "node:assert/strict";
import {runInlineCalculator} from "./calculator-harness.mjs";

const run=inputs=>runInlineCalculator({family:"outil",slug:"indemnites-maladie",inputs:{"date-debut":"01/07/2026",...inputs}});
const highMixed=await run({s1:"6000",s2:"1000",s3:"1000",jours:"10"});
assert.match(highMixed.text,/176,96\s*€\s*d’IJSS brutes estimées/i,
  "le plafond doit être appliqué séparément à chacun des trois salaires");
assert.match(highMixed.text,/IJ journalière\s*:\s*25,28\s*€/i,
  "le montant journalier doit suivre l’exemple officiel de Service-Public");

const officialExample=await run({s1:"2000",s2:"2000",s3:"2000",jours:"10"});
assert.match(officialExample.text,/230,09\s*€\\s*d’IJSS brutes estimées/i,
  "l’exemple officiel à 2 000 € par mois doit donner 32,87 € par jour");

const max=await run({s1:"6000",s2:"6000",s3:"6000",jours:"10"});
assert.match(max.text,/300,79\s*€\s*d’IJSS brutes estimées/i,
  "l’indemnité maximale de 42,97 € doit être multipliée par les 7 jours après carence");

const comma=await run({s1:"2 500,50",s2:"2500",s3:"2500",jours:"10"});
assert.match(comma.text,/287,63\s*€\s*d’IJSS brutes estimées/i,
  "les espaces de groupement et la virgule décimale doivent être acceptés");

const carence=await run({s1:"2500",s2:"2500",s3:"2500",jours:"3"});
assert.match(carence.text,/0,00\s*€\s*d’IJSS brutes estimées/i,
  "un arrêt de trois jours ne doit produire aucun jour indemnisé dans le cas général");

const invalidDate=await run({"date-debut":"31/02/2026",s1:"2500",s2:"2500",s3:"2500",jours:"10"});
assert.match(invalidDate.text,/date.*valide/i,"une date impossible doit être refusée");
const oldDate=await run({"date-debut":"30/06/2026",s1:"2500",s2:"2500",s3:"2500",jours:"10"});
assert.match(oldDate.text,/uniquement.*01\/07\/2026.*31\/12\/2026/i,"les arrêts hors période couverte doivent être refusés");
const badFormat=await run({"date-debut":"2026-07-01",s1:"2500",s2:"2500",s3:"2500",jours:"10"});
assert.match(badFormat.text,/format jj\/mm\/aaaa/i,"le format de date doit être explicite");

const negative=await run({s1:"-1",s2:"2500",s3:"2500",jours:"10"});
assert.match(negative.text,/salaires bruts mensuels valides/i,"un salaire négatif doit être refusé");
const empty=await run({s1:"",s2:"2500",s3:"2500",jours:"10"});
assert.match(empty.text,/salaires bruts mensuels valides/i,"un salaire manquant doit être refusé");
const zero=await run({s1:"0",s2:"0",s3:"0",jours:"10"});
assert.match(zero.text,/total des salaires.*supérieur à zéro/i,"trois salaires nuls ne doivent pas produire une indemnité fictive");
const fractional=await run({s1:"2500",s2:"2500",s3:"2500",jours:"1.5"});
assert.match(fractional.text,/durée entière/i,"une durée fractionnaire doit être refusée");
const huge=await run({s1:"1e308",s2:"1e308",s3:"1e308",jours:"1e308"});
assert.match(huge.text,/salaires bruts mensuels valides/i,"les montants extrêmes hors format monétaire doivent être refusés");

console.log("indemnites-maladie tests passed.");
