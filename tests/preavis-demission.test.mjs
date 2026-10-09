import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const params = JSON.parse(fs.readFileSync("data/parametres.json", "utf8"));
const set = params.sets["preavis-demission"];
assert.ok(set, "le jeu de paramètres du préavis est déclaré");
assert.deepEqual(set.usedBy, ["preavis-demission"]);
assert.equal(params.anneeAMigrer.slugs.includes("preavis-demission"), false, "le calculateur est migré");
assert.equal(set.verifiedOn, "2026-10-09");
assert.match(set.source.url, /^https:\/\/code\.travail\.gouv\.fr\//);

const rules = set.values.rules;
const references = JSON.parse(fs.readFileSync("tests/references/preavis-demission.json", "utf8"));
assert.equal(references.length, 4, "les cas de référence sourcés du préavis sont présents");
for (const c of references) {
  assert.equal(c.outil, "preavis-demission");
  assert.ok(/^https:\/\//.test(c.source));
  const seniorityBand = c.entrees.anciennete === "plus-de-2-ans" ? 25 : c.entrees.ancienneteMois;
  const matches = rules.filter(r => r[0] === c.entrees.idcc && r[1] === c.entrees.categorie && (r[5] === 1 ? seniorityBand > r[2] : r[2] <= seniorityBand) && (r[6] === undefined || seniorityBand < r[6])).sort((a,b) => b[2]-a[2]);
  if (c.attendu === null) {
    assert.equal(matches.length, 0, "aucune durée automatique ne doit être produite pour le cas non précisé par la source : " + c.cas);
    continue;
  }
  assert.ok(matches.length > 0, "aucune règle pour le cas de référence " + c.cas);
  assert.deepEqual({mois:matches[0][3],jours:matches[0][4]}, c.attendu, "valeur réglementaire incorrecte pour " + c.cas);
}
const has = (...expected) => assert.ok(rules.some(rule => JSON.stringify(rule) === JSON.stringify(expected)), "règle absente : " + expected.join(","));
[
  [1486, 1, 0, 1, 0, 0, 24], [1486, 1, 24, 2, 0, 1], [1486, 2, 0, 2, 0],
  [1486, 3, 0, 3, 0], [1486, 4, 0, 1, 0],
  [1672, 1, 0, 1, 0], [1672, 2, 0, 3, 0],
  [86, 1, 0, 1, 0], [86, 2, 0, 2, 0], [86, 3, 0, 3, 0],
  [2098, 1, 0, 1, 0], [2098, 2, 0, 2, 0], [2098, 3, 0, 3, 0],
  [2216, 1, 0, 1, 0], [2216, 2, 0, 2, 0], [2216, 3, 0, 3, 0],
  [1979, 1, 0, 0, 8], [1979, 1, 6, 0, 15], [1979, 1, 24, 1, 0],
  [1979, 2, 0, 0, 15], [1979, 2, 6, 1, 0], [1979, 2, 24, 2, 0],
  [1979, 3, 0, 1, 0], [1979, 3, 6, 3, 0],
  [3239, 1, 0, 0, 7], [3239, 1, 6, 0, 14], [3239, 1, 24, 1, 0]
].forEach(rule => has(...rule));
assert.equal(rules.length, 27, "le nombre de règles sourcées est stable");

const html = fs.readFileSync("public/outil/preavis-demission/index.html", "utf8");
for (const idcc of ["1486", "1672", "0086", "2098", "2216", "1979", "3239"]) assert.ok(html.includes(idcc), "IDCC absent du sélecteur ou des sources : " + idcc);
assert.ok(html.includes('class="tool pv-card"'));
assert.ok(html.includes('class="result pv-result pv-result--empty" aria-live="polite">'), "le bloc initial est visible mais neutre");
assert.ok(html.includes("widget-loader.js"), "le module officiel de recherche de convention est intégré");
assert.ok(html.includes("https://code.travail.gouv.fr/widgets/convention-collective"), "le parcours de recherche officielle est disponible");
assert.ok(html.includes('class="calculator-faq-answer"'));
assert.ok(html.includes('src="/parametres.js"'));
assert.ok(!html.includes("préavis de démission 2026 | Simulateur"));

assert.match(html, /value="6">De 6 mois à moins de 2 ans/);
assert.match(html, /value="24">2 ans exactement/);
assert.match(html, /value="25">Plus de 2 ans/);
assert.ok(html.includes("r[5]===1?seniorityBand>r[2]:r[2]<=seniorityBand)&&(r[6]===undefined||seniorityBand<r[6])"), "les bornes basse et haute de séniorité sont prises en compte");
assert.ok(html.includes("particulier:3239"), "la convention des particuliers employeurs est intégrée");
assert.ok(!html.includes("const descriptions="), "les durées réglementaires ne sont pas dupliquées dans le JavaScript de page");
const resolveRule=(idcc,category,seniorityBand)=>rules.filter(r=>r[0]===idcc&&r[1]===category&&(r[5]===1?seniorityBand>r[2]:r[2]<=seniorityBand)&&(r[6]===undefined||seniorityBand<r[6])).sort((a,b)=>b[2]-a[2])[0];
assert.equal(resolveRule(1486,1,24),undefined,"Syntec : exactement 2 ans reste indéterminé faute de précision officielle");
assert.equal(resolveRule(1486,1,23)[3],1,"Syntec : moins de 2 ans donne un mois");
assert.equal(resolveRule(1486,1,25)[3],2,"Syntec : plus de 2 ans passe à deux mois");
assert.equal(resolveRule(1979,1,6)[4],15,"HCR employé : six mois donne quinze jours");
assert.equal(resolveRule(1979,1,24)[3],1,"HCR employé : deux ans donne un mois");
assert.equal(resolveRule(1979,2,6)[3],1,"HCR agent de maîtrise : six mois donne un mois");
assert.equal(resolveRule(1979,3,6)[3],3,"HCR cadre : six mois donne trois mois");
const start = html.indexOf("function addMonths(start,n){");
const end = html.indexOf("function fmt(x)", start);
assert.ok(start >= 0 && end > start, "fonctions de calcul de date présentes");
const dateFunctions = html.slice(start, end);
const endDate = vm.runInNewContext("(() => {" + dateFunctions + "; return endDate; })()");
const date = (y,m,d) => new Date(Date.UTC(y,m-1,d));
const fmtDate = d => d.toISOString().slice(0,10);
assert.equal(fmtDate(endDate(date(2026,7,13),1,0)), "2026-08-12", "un mois de date à date");
assert.equal(fmtDate(endDate(date(2026,1,31),1,0)), "2026-02-28", "fin de mois sans jour équivalent");
assert.equal(fmtDate(endDate(date(2028,1,31),1,0)), "2028-02-29", "fin de mois en année bissextile");
assert.equal(fmtDate(endDate(date(2026,1,31),1,7)), "2026-03-07", "mois puis jours après un report en fin de mois");
assert.equal(fmtDate(endDate(date(2026,2,28),1,0)), "2026-03-27", "mois depuis une date de fin de mois non bissextile");
assert.equal(fmtDate(endDate(date(2026,1,15),0,8)), "2026-01-22", "préavis de huit jours");
assert.equal(fmtDate(endDate(date(2026,1,13),1,7)), "2026-02-19", "mois puis jours supplémentaires");

console.log("Préavis de démission : règles conventionnelles, migration, sources, structure HTML et calculs de date validés.");
