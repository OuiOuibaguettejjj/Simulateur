import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { buildParamsJs, readParams } from "../scripts/generate-params.mjs";
import { checkParams } from "../scripts/check-params.mjs";

const data = readParams();
const clone = v => JSON.parse(JSON.stringify(v));
const rules = r => r.errors.map(e => e.rule);
const warns = r => r.warnings.map(w => w.rule);

/* ---------- Fixtures ---------- */
const page = (title, extra = "") => '<!doctype html><title>' + title + '</title><script src="/parametres.js" defer></script><h1>' + title + "</h1>" + extra;
function fixture() {
  const d = {
    schemaVersion: 1,
    staleAfterDays: 180,
    warnExpiryDays: 30,
    sets: {
      demo: {
        label: "Démo",
        year: 2026,
        usedBy: ["demo"],
        source: { label: "Source", url: "https://example.org/demo" },
        effectiveFrom: "2026-01-01",
        effectiveTo: "2026-12-31",
        verifiedOn: "2026-09-01",
        values: { taux: 0.2, tranches: [1, 2, 3] }
      }
    },
    anneeAMigrer: { motif: "x", slugs: ["ancien"] }
  };
  const pages = {
    demo: page("Calculateur démo 2026", "<p>Montant : 1 234,50 €</p>"),
    ancien: page("Calculateur ancien 2026"),
    neutre: page("Calculateur neutre")
  };
  pages.ancien = pages.ancien.replace('<script src="/parametres.js" defer></script>', "");
  return { d, pages, generated: undefined };
}
function run(mutate, today = "2026-10-03", horizonDays) {
  const f = fixture();
  mutate?.(f);
  return checkParams({ data: f.d, pages: f.pages, today, generated: f.generated, horizonDays });
}

/* ---------- Positif ---------- */
const base = run();
assert.deepEqual(base.errors, [], "fixture conforme : aucune erreur");
assert.deepEqual(warns(base), ["year-debt"], "seul l'avertissement de dette d'année est attendu");

/* ---------- Négatifs : une règle = un test ---------- */
assert.ok(rules(run(null, "2027-01-01")).includes("expired"), "validité dépassée : bloquant");
assert.equal(rules(run(null, "2026-12-31")).includes("expired"), false, "le dernier jour de validité reste valable");
assert.ok(warns(run(null, "2026-12-15")).includes("expiring"), "fin de validité proche : avertissement");
assert.equal(rules(run(null, "2026-12-15")).includes("expired"), false, "fin proche : non bloquant");
assert.ok(rules(run(null, "2026-11-15", 60)).includes("horizon"), "horizon : expiration à moins de 60 jours bloquante");
assert.equal(rules(run(null, "2026-11-01", 60)).includes("horizon"), false, "horizon : expiration à exactement 60 jours non bloquante");
const checkParamsScript = fileURLToPath(new URL("../scripts/check-params.mjs", import.meta.url));
function cliFixture(expiry, args) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "simulateur-check-params-"));
  try {
    const f = fixture();
    f.d.sets.demo.effectiveTo = expiry;
    f.pages.demo = page("Calculateur démo 2026");
    fs.mkdirSync(path.join(tmpDir, "data"), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, "public", "outil", "demo"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, "data", "parametres.json"), JSON.stringify(f.d, null, 2) + "\n");
    fs.writeFileSync(path.join(tmpDir, "public", "outil", "demo", "index.html"), f.pages.demo);
    fs.mkdirSync(path.join(tmpDir, "public", "outil", "ancien"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, "public", "outil", "ancien", "index.html"), f.pages.ancien);
    fs.writeFileSync(path.join(tmpDir, "public", "parametres.js"), buildParamsJs(f.d));
    return spawnSync(process.execPath, [checkParamsScript, "--today=2026-11-15", ...args], {
      cwd: tmpDir,
      encoding: "utf8"
    });
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}
assert.equal(cliFixture("2026-12-01", ["--horizon", "60"]).status, 1, "CLI : --horizon 60 bloque une expiration à moins de 60 jours");
assert.equal(cliFixture("2026-12-01", ["--horizon=60"]).status, 1, "CLI : --horizon=60 bloque une expiration à moins de 60 jours");
assert.equal(cliFixture("2027-01-31", ["--horizon", "60"]).status, 0, "CLI : une expiration à plus de 60 jours reste non bloquante");
assert.equal(cliFixture("2027-01-31", ["--horizon=60"]).status, 0, "CLI : --horizon=60 reste non bloquant à plus de 60 jours");
for (const args of [["--horizon"], ["--horizon="], ["--horizon", "abc"], ["--horizon=abc"], ["--horizon", "1.5"], ["--horizon=-1"]]) {
  assert.equal(cliFixture("2026-12-01", args).status, 2, "CLI : valeur --horizon invalide refusée (" + args.join(" ") + ")");
}
assert.ok(warns(run(f => { f.d.sets.demo.verifiedOn = "2026-03-01"; })).includes("stale"), "vérification ancienne : avertissement");
assert.equal(rules(run(f => { f.d.sets.demo.verifiedOn = "2026-03-01"; })).includes("stale"), false, "vérification ancienne : non bloquant");
assert.ok(rules(run(f => { f.d.sets.demo.verifiedOn = "2026-12-01"; })).includes("schema"), "vérification datée du futur refusée");
assert.ok(rules(run(f => { f.d.sets.demo.values.taux = "20 %"; })).includes("schema"), "valeur non numérique refusée");
assert.ok(rules(run(f => { f.d.sets.demo.source.url = "http://example.org"; })).includes("schema"), "source non https refusée");
assert.ok(rules(run(f => { f.d.sets.demo.effectiveFrom = "2027-01-01"; })).includes("schema"), "période inversée refusée");
assert.ok(rules(run(f => { f.d.sets.demo.year = 2030; })).includes("year-set"), "année du jeu hors période");
assert.ok(rules(run(f => { f.pages.demo = page("Calculateur démo 2025"); })).includes("year-mismatch"), "année de titre différente du jeu");
assert.ok(rules(run(f => { f.pages.demo = f.pages.demo.replace('<script src="/parametres.js" defer></script>', ""); })).includes("params-script"), "page migrée sans /parametres.js");
assert.ok(rules(run(f => { f.d.sets.demo.usedBy = ["inconnu"]; })).includes("unknown-page"), "outil inexistant");
assert.ok(rules(run(f => { f.d.sets.demo.htmlMentions = [{ slug: "demo", path: "taux", format: "eur2" }]; })).includes("html-mention"), "prose HTML qui ne reprend pas la valeur");
assert.deepEqual(run(f => { f.d.sets.demo.values.montant = 1234.5; f.d.sets.demo.htmlMentions = [{ slug: "demo", path: "montant", format: "eur2" }]; }).errors, [], "prose HTML conforme (espaces insécables normalisés)");
assert.ok(rules(run(f => { f.pages.neutre = page("Calculateur neutre 2026"); })).includes("year-not-regulatory"), "année dans un outil sans paramètres");
assert.ok(rules(run(f => { f.pages.ancien = page("Calculateur ancien"); })).includes("year-debt"), "entrée de dette sans année : à retirer");
assert.ok(rules(run(f => { f.d.anneeAMigrer.slugs.push("demo"); })).includes("year-debt"), "outil migré encore listé en dette");
assert.ok(rules(run(f => { f.d.anneeAMigrer.slugs.push("fantome"); })).includes("year-debt"), "dette sur une page inexistante");
assert.ok(rules(run(f => { f.generated = "obsolète"; })).includes("generated"), "fichier généré périmé");
assert.deepEqual(run(f => { f.generated = buildParamsJs(f.d); }).errors, [], "fichier généré à jour");

/* ---------- Données réelles ---------- */
const root = process.cwd();
const realPages = {};
for (const slug of fs.readdirSync("public/outil")) {
  const file = "public/outil/" + slug + "/index.html";
  if (fs.existsSync(file)) realPages[slug] = fs.readFileSync(file, "utf8");
}
const generatedReal = fs.readFileSync("public/parametres.js", "utf8");
const real = today => checkParams({ data, pages: realPages, today, generated: generatedReal });
assert.deepEqual(real("2026-10-06").errors, [], "dépôt conforme à la date de référence");
assert.equal(generatedReal, buildParamsJs(data), "public/parametres.js correspond à data/parametres.json");
assert.ok(rules(real("2027-01-01")).includes("expired"), "le SMIC expire fin 2026");
assert.ok(real("2027-01-01").errors.some(e => e.message.startsWith("smic")), "l'expiration concerne bien le SMIC");
assert.ok(real("2027-04-01").errors.filter(e => e.rule === "expired").length === 3, "tous les jeux expirent au 1er avril 2027");

/* ---------- Runtime ---------- */
function load() {
  const context = vm.createContext({ window: {} });
  vm.runInContext(generatedReal, context, { filename: "public/parametres.js" });
  return context;
}
const ctx = load();
const P = ctx.window.Parametres;
assert.ok(P, "Parametres exposé sur window");
assert.deepEqual([...P.ids()].sort(), Object.keys(data.sets).sort(), "tous les jeux sont exposés");
assert.throws(() => P.get("inconnu"), /inconnus/, "jeu inconnu : erreur explicite");
assert.ok(Object.isFrozen(P.get("smic")) && Object.isFrozen(P.get("smic").values.metropole), "valeurs figées en profondeur");
assert.equal(P.isEffective("smic", "2026-06-01"), true);
assert.equal(P.isEffective("smic", "2026-05-31"), false);
assert.equal(P.isEffective("smic", "2027-01-01"), false);
assert.equal(P.get("rsa").verifiedOn, "2026-10-06");

/* ---------- Parité avec les anciens calculs codés en dur ---------- */
function pageTool(slug) {
  const html = realPages[slug];
  const script = html.match(/<script>(window\.TOOL=[\s\S]*?)<\/script>/);
  assert.ok(script, slug + " : script d'outil introuvable");
  const context = load();
  vm.runInContext(script[1], context, { filename: slug });
  const euro = v => Number(v).toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
  const num = v => Number(v).toLocaleString("fr-FR", { maximumFractionDigits: 2 });
  return inputs => context.window.TOOL.calc.call({ $: id => ({ value: String(inputs[id]) }), euro, num });
}
const euro = v => Number(v).toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
const num = v => Number(v).toLocaleString("fr-FR", { maximumFractionDigits: 2 });

// Anciennes formules (copiées avant migration) : elles servent de référence de non-régression.
function legacySmic({ heures, zone }) {
  const h = +heures || 0, z = zone;
  if (h <= 0 || h > 48) return "Indiquez un nombre d’heures hebdomadaires compris entre 0 et 48.";
  const hourly = z === "mayotte" ? 9.56 : 12.31;
  const monthly35 = z === "mayotte" ? 1449.93 : 1867.02;
  const annual35 = z === "mayotte" ? 17399.20 : 22404.20;
  const monthly = monthly35 * (h / 35), annual = annual35 * (h / 35);
  const netMonthly = z === "mayotte" ? null : 1477.93 * (h / 35);
  return "<strong>" + euro(hourly) + " brut / heure</strong><br><br>" + euro(monthly) + " brut / mois pour " + num(h) + " h/semaine<br>" + euro(annual) + " brut / an" + (z === "metropole" ? "<br>Net indicatif : " + euro(netMonthly) + " / mois" : "");
}
function legacyFraisKm({ km, cv, veh }) {
  let d = +km, c = +cv, e = veh === "electrique";
  if (d <= 0) return "Veuillez saisir un kilométrage positif.";
  let a = [.529, .606, .636, .665, .697][c - 3], b = [.370, .407, .427, .447, .470][c - 3], m = [1065, 1330, 1395, 1457, 1515][c - 3];
  let f = d <= 5000 ? d * a : d <= 20000 ? d * [.316, .340, .357, .374, .394][c - 3] + m : d * b;
  if (e) f *= 1.2;
  return "<strong>" + euro(f) + "</strong> de frais kilométriques estimés<br><small>Barème 2026 · majoration électrique de 20 % incluse.</small>";
}

const smic = pageTool("smic");
let compared = 0;
for (const zone of ["metropole", "mayotte"]) {
  for (const heures of [0, 1, 7.5, 17.5, 24, 35, 39, 40.25, 48, 49]) {
    assert.equal(smic({ heures, zone }), legacySmic({ heures, zone }), "SMIC " + zone + " " + heures + " h");
    compared++;
  }
}
const fkm = pageTool("frais-kilometriques");
for (const cv of [3, 4, 5, 6, 7]) {
  for (const veh of ["normal", "electrique"]) {
    for (const km of [-1, 0, 1, 4999, 5000, 5001, 8000, 19999, 20000, 20001, 35000]) {
      assert.equal(fkm({ km, cv, veh }), legacyFraisKm({ km, cv, veh }), "Frais km " + cv + " CV " + veh + " " + km + " km");
      compared++;
    }
  }
}
assert.equal(fkm({ km: 1000, cv: 9, veh: "normal" }), "Puissance fiscale invalide.", "puissance hors barème : message explicite");
assert.ok(compared > 100, "parité vérifiée sur une grille large");

console.log("Params tests passed (" + compared + " comparaisons de parité).");
