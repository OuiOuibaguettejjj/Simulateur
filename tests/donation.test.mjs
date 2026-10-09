import assert from "node:assert/strict";
import {runInlineCalculator} from "./calculator-harness.mjs";

const common = {
  montant: "200000",
  lien: "parent",
  natureDonation: "argent",
  donLogementEligible: "oui",
  donLogement: "100000",
  dateDonLogement: "2026-06-01"
};

const partial = await runInlineCalculator({
  slug: "donation",
  inputs: {...common, donLogementAffecte: "40000"}
});
assert.match(partial.text, /Exonérations appliquées\s*40\s*000,00\s*€/,
  "l'exonération 790 A bis doit être plafonnée au montant réellement affecté");
assert.match(partial.text, /Base taxable estimée\s*60\s*000,00\s*€/,
  "la base taxable doit intégrer seulement 40 000 € d'exonération 790 A bis");

const noEligibleUse = await runInlineCalculator({
  slug: "donation",
  inputs: {...common, donLogementAffecte: "0", dateDonLogement: ""}
});
assert.match(noEligibleUse.text, /Exonérations appliquées\s*0,00\s*€/,
  "aucune exonération 790 A bis ne doit s'appliquer sans somme affectée");
assert.match(noEligibleUse.text, /Base taxable estimée\s*100\s*000,00\s*€/,
  "sans somme affectée, seule l'exonération de parenté réduit la base taxable");

const cappedByAvailableAllowance = await runInlineCalculator({
  slug: "donation",
  inputs: {...common, montant: "250000", donLogementAffecte: "150000"}
});
assert.match(cappedByAvailableAllowance.text, /Exonérations appliquées\s*100\s*000,00\s*€/,
  "l'exonération doit aussi rester limitée au plafond disponible du 790 A bis");

const overDonation = await runInlineCalculator({
  slug: "donation",
  inputs: {...common, donLogementAffecte: "250000"}
});
assert.match(overDonation.text, /ne peut pas dépasser la valeur totale de la donation/i,
  "un montant affecté supérieur à la donation doit être refusé");

console.log("Tests donation / article 790 A bis : 4 scénarios passés.");
