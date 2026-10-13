import assert from "node:assert/strict";
import {runInlineCalculator} from "./calculator-harness.mjs";

async function calculate(start,end){
  return runInlineCalculator({
    family:"outil",
    slug:"difference-dates",
    inputs:{"date-debut":start,"date-fin":end}
  });
}

const week=await calculate("01/01/2026","08/01/2026");
assert.match(week.text,/7 jours/,"du 1er au 8 janvier, l'écart doit être de 7 jours");
assert.match(week.text,/1 semaine et 0 jour/,"7 jours doivent représenter une semaine");

const same=await calculate("12/05/2026","12/05/2026");
assert.match(same.text,/0 jour/,"deux dates identiques doivent donner zéro jour");
assert.match(same.text,/0 semaine et 0 jour/,"zéro jour doit être décomposé sans reste");

const leap=await calculate("28/02/2024","01/03/2024");
assert.match(leap.text,/2 jours/,"l'année bissextile 2024 doit inclure le 29 février");

const invalidDay=await calculate("31/02/2026","01/03/2026");
assert.match(invalidDay.text,/Vérifiez les deux dates/,"une date impossible doit être refusée");

const invalidFormat=await calculate("2026-01-01","08/01/2026");
assert.match(invalidFormat.text,/Vérifiez les deux dates/,"un format différent de jj/mm/aaaa doit être refusé");

const outOfRange=await calculate("01/01/1899","08/01/1899");
assert.match(outOfRange.text,/Vérifiez les deux dates/,"les dates antérieures à 1900 doivent être refusées");

const reverse=await calculate("09/01/2026","08/01/2026");
assert.match(reverse.text,/La date d’arrivée doit être égale ou postérieure/,"une date d'arrivée antérieure doit être refusée");

const lowerBound=await calculate("01/01/1900","02/01/1900");
assert.match(lowerBound.text,/1 jour/,"la borne basse autorisée doit être acceptée");

const upperBound=await calculate("30/12/2100","31/12/2100");
assert.match(upperBound.text,/1 jour/,"la borne haute autorisée doit être acceptée");

const leapCentury=await calculate("28/02/2100","01/03/2100");
assert.match(leapCentury.text,/1 jour/,"2100 n'est pas une année bissextile");

console.log("Différence entre deux dates : 10 scénarios de référence et de limites réussis.");
