import assert from "node:assert/strict";
import {runInlineCalculator} from "./calculator-harness.mjs";

const project=await runInlineCalculator({slug:"per",inputs:{capital:"10000",versement:"300",rendement:"3",annees:"10"}});
assert.ok(project.text.includes("55 415,96"),"projection de référence du PER");
assert.ok(project.text.includes("9 415,96"),"gain théorique de référence du PER");

const zeroRate=await runInlineCalculator({slug:"per",inputs:{capital:"1000",versement:"100",rendement:"0",annees:"1"}});
assert.ok(zeroRate.text.includes("2 200,00"),"le rendement nul doit restituer capital initial + versements");

const empty=await runInlineCalculator({slug:"per",inputs:{capital:"",versement:"300",rendement:"3",annees:"10"}});
assert.ok(empty.text.includes("les quatre champs"),"un champ vide ne doit pas être silencieusement traité comme zéro");

const negativeRate=await runInlineCalculator({slug:"per",inputs:{capital:"1000",versement:"100",rendement:"-2",annees:"1"}});
assert.ok(negativeRate.text.includes("au terme"),"un rendement négatif réaliste doit produire une projection");
assert.ok(!negativeRate.text.includes("nombres valides"),"un rendement négatif réaliste ne doit pas être rejeté");

const totalLoss=await runInlineCalculator({slug:"per",inputs:{capital:"1000",versement:"100",rendement:"-100",annees:"1"}});
assert.ok(totalLoss.text.includes("au terme"),"un rendement annuel de -100 % doit rester calculable avec la convention mensuelle annoncée");

const excessiveLoss=await runInlineCalculator({slug:"per",inputs:{capital:"1000",versement:"100",rendement:"-100.01",annees:"1"}});
assert.ok(excessiveLoss.text.includes("rendement supérieur ou égal à -100 %"),"un rendement inférieur à -100 % doit être rejeté");

const fractionalMonth=await runInlineCalculator({slug:"per",inputs:{capital:"1000",versement:"100",rendement:"3",annees:"1.1"}});
assert.ok(fractionalMonth.text.includes("nombre entier de mois"),"une durée ne représentant pas un nombre entier de mois doit être rejetée");

const thirteenMonths=await runInlineCalculator({slug:"per",inputs:{capital:"1000",versement:"100",rendement:"3",annees:"1.0833333"}});
assert.ok(thirteenMonths.text.includes("au terme"),"une durée saisie avec une précision décimale suffisante pour 13 mois doit être acceptée");

const overflow=await runInlineCalculator({slug:"per",inputs:{capital:"1e308",versement:"0",rendement:"3",annees:"100"}});
assert.ok(overflow.text.includes("dépasse la plage calculable"),"un résultat non fini doit être traité proprement");

console.log("PER : projection de référence, rendement nul, champs vides, rendement négatif, périodes mensuelles et dépassement vérifiés.");
