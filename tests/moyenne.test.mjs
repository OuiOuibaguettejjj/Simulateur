import assert from "node:assert/strict";
import { runInlineCalculator } from "./calculator-harness.mjs";

const run = inputs => runInlineCalculator({ family: "outil", slug: "moyenne", inputs });

const standard = await run({ s: "12, 15, 18, 20" });
assert.match(standard.text, /Moyenne\s*:\s*16,25/, "la moyenne de 12, 15, 18 et 20 vaut 16,25");

const decimalComma = await run({ s: "12,5; 15,5; 18" });
assert.match(decimalComma.text, /Moyenne\s*:\s*15,3333333333/, "les décimales avec virgule sont acceptées avec des points-virgules");

const ambiguousDecimalComma = await run({ s: "12,5 15,5 18" });
assert.match(ambiguousDecimalComma.text, /Format ambigu[\s\S]*points-virgules/i, "les décimales ambiguës séparées par des espaces sont refusées");

const ambiguousDecimalCommaWithSeparators = await run({ s: "12,5, 15,5, 18" });
assert.match(ambiguousDecimalCommaWithSeparators.text, /Format ambigu[\s\S]*points-virgules/i, "les décimales avec virgules et séparateurs mélangés sont refusées");

const ambiguousMultiDigitDecimalComma = await run({ s: "12,55, 15,55, 18" });
assert.match(ambiguousMultiDigitDecimalComma.text, /Format ambigu[\s\S]*points-virgules/i, "les décimales à plusieurs chiffres avec séparateurs mélangés sont refusées");

const ambiguousDecimalCommaWithoutSpaces = await run({ s: "12,5,15,5,18" });
assert.match(ambiguousDecimalCommaWithoutSpaces.text, /Format ambigu[\s\S]*points-virgules/i, "les décimales avec virgule et séparateurs sans espaces sont refusées");

const repeatedSeparators = await run({ s: "12,,18" });
assert.match(repeatedSeparators.text, /Format ambigu|séparateurs répétés/i, "les séparateurs répétés sont refusés");

const negative = await run({ s: "-10; 2; 8" });
assert.match(negative.text, /Moyenne\s*:\s*0/, "les nombres négatifs sont traités correctement");

const zero = await run({ s: "0; 0; 0" });
assert.match(zero.text, /Moyenne\s*:\s*0/, "une série de zéros produit une moyenne nulle");

const empty = await run({ s: "   " });
assert.match(empty.text, /Saisissez au moins un nombre/, "une série vide est refusée");

const invalid = await run({ s: "12; abc; 18" });
assert.match(invalid.text, /Valeur invalide/, "une valeur invalide n'est pas ignorée silencieusement");

const large = await run({ s: "1e308; 1e308" });
assert.match(large.text, /Moyenne\s*:\s*1,0000000000e\+308/i, "la moyenne reste finie quand la somme dépasse la plage numérique");

console.log("Tests ciblés du calculateur de moyenne réussis.");
