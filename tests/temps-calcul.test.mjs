import assert from "node:assert/strict";
import {runInlineCalculator} from "./calculator-harness.mjs";

async function expectConversion({value,fromUnit,toUnit,expected}) {
  const result=await runInlineCalculator({
    family:"outil",
    slug:"temps-calcul",
    inputs:{value,fromUnit,toUnit}
  });
  assert.match(result.text,expected,
    `conversion inattendue pour ${value} ${fromUnit} vers ${toUnit}: ${result.text}`);
}

await expectConversion({
  value:"90",fromUnit:"minutes",toUnit:"decimalHours",
  expected:/90 minute\(s\) = 1,5 heure\(s\) décimale\(s\)/
});
await expectConversion({
  value:"1,5",fromUnit:"decimalHours",toUnit:"minutes",
  expected:/1,5 heure\(s\) décimale\(s\) = 90 minute\(s\)/
});
await expectConversion({
  value:"86400",fromUnit:"seconds",toUnit:"days",
  expected:/86 400 seconde\(s\) = 1 jour\(s\) de 24 h/
});
await expectConversion({
  value:"604800",fromUnit:"seconds",toUnit:"weeks",
  expected:/604 800 seconde\(s\) = 1 semaine\(s\) de 7 jours/
});
await expectConversion({
  value:"1",fromUnit:"weeks",toUnit:"seconds",
  expected:/1 semaine\(s\) de 7 jours = 604 800 seconde\(s\)/
});
await expectConversion({
  value:"0",fromUnit:"seconds",toUnit:"minutes",
  expected:/0 seconde\(s\) = 0 minute\(s\)/
});
await expectConversion({
  value:"12,5",fromUnit:"minutes",toUnit:"seconds",
  expected:/12,5 minute\(s\) = 750 seconde\(s\)/
});
await expectConversion({
  value:"45",fromUnit:"minutes",toUnit:"minutes",
  expected:/45 minute\(s\) = 45 minute\(s\)/
});

const invalid=await runInlineCalculator({
  family:"outil",slug:"temps-calcul",
  inputs:{value:"",fromUnit:"minutes",toUnit:"seconds"}
});
assert.match(invalid.text,/Saisissez une durée/,"une entrée vide doit être rejetée");

const negative=await runInlineCalculator({
  family:"outil",slug:"temps-calcul",
  inputs:{value:"-1",fromUnit:"minutes",toUnit:"seconds"}
});
assert.match(negative.text,/Saisissez une durée/,"une durée négative doit être rejetée");

const overflow=await runInlineCalculator({
  family:"outil",slug:"temps-calcul",
  inputs:{value:"1.7976931348623157e308",fromUnit:"weeks",toUnit:"seconds"}
});
assert.match(overflow.text,/trop grande/,"un débordement doit afficher une erreur explicite");

console.log("Convertisseur de durée : 11 scénarios de référence et de limites réussis.");
