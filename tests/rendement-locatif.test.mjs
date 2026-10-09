import assert from "node:assert/strict";
import {runInlineCalculator} from "./calculator-harness.mjs";

const base = {
  prix: "100000",
  frais: "0",
  travaux: "0",
  mobilier: "0",
  loyer: "1000",
  vac: "0",
  charges: "0",
  taxe: "0",
  assurance: "0",
  gestion: "0",
  entretien: "0"
};
async function calculate(overrides = {}) {
  return runInlineCalculator({
    family: "outil",
    slug: "rendement-locatif",
    inputs: {...base, ...overrides}
  });
}

// Cas simple vérifié indépendamment : 12 000 / 100 000 = 12 %.
const simple = await calculate();
assert.match(simple.text, /Rendement brut sur coût total[\s\S]*?12,00 %/i);
assert.match(simple.text, /Rendement net sur coût total avant financement et impôts[\s\S]*?12,00 %/i);

// Les virgules décimales sont acceptées et les taux sont arrondis à deux décimales.
const decimalComma = await calculate({loyer: "1000,50", vac: "12,5"});
assert.match(decimalComma.text, /Rendement brut sur coût total[\s\S]*?12,01 %/i);
assert.match(decimalComma.text, /Rendement net sur coût total avant financement et impôts[\s\S]*?10,51 %/i);

// Les deux bornes autorisées de vacance et de gestion sont acceptées.
const fullVacancy = await calculate({vac: "100", gestion: "100"});
assert.match(fullVacancy.text, /Rendement net sur coût total avant financement et impôts[\s\S]*?0,00 %/i);

// Le rendement net peut légitimement être négatif si les dépenses dépassent les loyers.
const negativeIncome = await calculate({charges: "20000"});
assert.match(negativeIncome.text, /Revenu locatif annuel après ces dépenses[\s\S]*?-8[\s\u00a0\u202f]?000,00\s*€/i);
assert.match(negativeIncome.text, /Rendement net sur coût total avant financement et impôts[\s\S]*?-8,00 %/i);

// Champs obligatoires, montants négatifs et pourcentages hors limites.
assert.match((await calculate({prix: ""})).text, /prix d’achat supérieur à zéro/i);
assert.match((await calculate({loyer: "0"})).text, /loyer mensuel supérieur à zéro/i);
assert.match((await calculate({charges: "-1"})).text, /saisissez uniquement des nombres positifs ou nuls/i);
assert.match((await calculate({vac: "100,01"})).text, /vacance locative doit être comprise entre 0 et 100 %/i);
assert.match((await calculate({gestion: "100,01"})).text, /frais de gestion doivent être compris entre 0 et 100 %/i);
assert.match((await calculate({loyer: "1,2,3"})).text, /saisissez uniquement des nombres positifs ou nuls/i);

// Les valeurs extrêmes ne doivent jamais exposer Infinity/NaN dans le résultat.
const huge = "1" + "0".repeat(308);
const extreme = await calculate({prix: huge, loyer: huge});
assert.match(extreme.text, /montants saisis sont trop élevés/i);
assert.doesNotMatch(extreme.text, /(?:NaN|Infinity|-Infinity|undefined|\[object Object\]|∞)/i);

console.log("rendement-locatif tests passed (calcul, virgule, limites, erreurs, revenu négatif et dépassement numérique).");
