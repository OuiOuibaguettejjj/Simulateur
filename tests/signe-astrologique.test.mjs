import assert from "node:assert/strict";
import {runInlineCalculator} from "./calculator-harness.mjs";

// Références indépendantes : les dates choisies sont volontairement éloignées
// des changements de signe afin de vérifier le calculateur sur des cas non ambigus.
// Les éphémérides tropicales Astro-Seek confirment les positions du Soleil sur
// les périodes correspondantes :
// - 2026-04 : https://horoscopes.astro-seek.com/astrology-ephemeris-april-2026
// - 2026-06 : https://horoscopes.astro-seek.com/astrology-ephemeris-june-2026
// - 2026-08 : https://horoscopes.astro-seek.com/monthly-astro-calendar-august-2026
// - 2026-11 : https://horoscopes.astro-seek.com/monthly-astro-calendar-november-2026\n// Référence ascendant : Jennifer Lawrence, née le 15 août 1990 à 15:20 à Louisville,\n// donnée publiquement comme Sagittaire ascendant sur Asteria :\n// https://heyasteria.com/explore/jennifer-lawrence
const cases=[
  ["2026-04-15","♈ Bélier"],
  ["2026-06-15","♊ Gémeaux"],
  ["2026-08-15","♌ Lion"],
  ["2026-11-15","♏ Scorpion"]
];
for(const [date,expected] of cases){
  const out=await runInlineCalculator({family:"outil",slug:"signe-astrologique",inputs:{"birth-date":date}});
  assert.match(out.text,new RegExp(expected.replace(" ","\\s+").replace("♈","♈").replace("♊","♊").replace("♌","♌").replace("♏","♏")),date+" : signe inattendu");
}

// Vérifie également que la page signale les dates de transition plutôt que
// de présenter une date calendaire comme une certitude astronomique.
// En 2026, le Soleil entre en Bélier le 20 mars à 14:46 UTC et en Cancer
// le 21 juin à 08:25 UTC (Astro-Seek).
for(const date of ["2026-03-20","2026-06-21"]){
  const out=await runInlineCalculator({family:"outil",slug:"signe-astrologique",inputs:{"birth-date":date}});
  assert.match(out.text,/Date charnière/i,date+" : avertissement de frontière absent");
}
console.log("Tests signe astrologique : 4 dates de référence non ambiguës + 2 dates charnières vérifiées.");


const rising=await runInlineCalculator({
  family:"outil",
  slug:"signe-astrologique",
  inputs:{
    "birth-date":"1990-08-15",
    "birth-time":"15:20",
    "birth-lat":"38.2527",
    "birth-lon":"-85.7585",
    "utc-offset":"-4"
  }
});
assert.match(rising.text,/♐\s+Sagittaire/,"15 août 1990, 15:20, Louisville : ascendant inattendu");

const noTime=await runInlineCalculator({
  family:"outil",
  slug:"signe-astrologique",
  inputs:{"birth-date":"1990-08-15"}
});
assert.match(noTime.text,/Heure nécessaire/i,"sans heure, l'ascendant doit être explicitement non calculé");

console.log("Test ascendant : 15 août 1990, 15:20, Louisville → Sagittaire, plus contrôle de l'absence d'heure.");
