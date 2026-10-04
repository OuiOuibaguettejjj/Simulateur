import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { buildParamsJs, readParams, TARGET } from "./generate-params.mjs";

// Contrôle des paramètres réglementaires (data/parametres.json) :
//  - bloquant : schéma invalide, validité dépassée, année de titre incohérente, fichier généré périmé ;
//  - avertissement : vérification ancienne (staleAfterDays), fin de validité proche (warnExpiryDays),
//    slugs encore listés dans anneeAMigrer.
// Options : --today=YYYY-MM-DD (tests, simulation de péremption).

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const YEAR = /\b(20\d{2})\b/g;
const FORMATS = {
  eur2: n => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €"
};

const norm = s => String(s).replace(/[  ]/g, " ");
const isDate = v => typeof v === "string" && ISO.test(v) && !Number.isNaN(Date.parse(v + "T00:00:00Z"));
const days = (from, to) => Math.round((Date.parse(to + "T00:00:00Z") - Date.parse(from + "T00:00:00Z")) / 86400000);
const years = text => [...String(text).matchAll(YEAR)].map(m => Number(m[1]));
const get = (obj, dotted) => dotted.split(".").reduce((o, k) => (o && typeof o === "object" ? o[k] : undefined), obj);

function titleAndH1(html) {
  const title = (html.match(/<title>([^<]*)<\/title>/i) || [])[1] || "";
  const h1 = ((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || "").replace(/<[^>]+>/g, "");
  return { title, h1 };
}

function numbersOnly(value, where, fail) {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) fail("schema", where + " : nombre non fini");
  } else if (Array.isArray(value)) {
    if (!value.length) fail("schema", where + " : tableau vide");
    value.forEach((v, i) => numbersOnly(v, where + "[" + i + "]", fail));
  } else if (value && typeof value === "object") {
    const keys = Object.keys(value);
    if (!keys.length) fail("schema", where + " : objet vide");
    keys.forEach(k => numbersOnly(value[k], where + "." + k, fail));
  } else {
    fail("schema", where + " : seules les valeurs numériques sont autorisées (texte dans notes/source)");
  }
}

// pages : { slug: html } des pages /outil/<slug>/ ; generated : contenu actuel de public/parametres.js (ou null).
export function checkParams({ data, pages, today, generated, horizonDays }) {
  const errors = [];
  const warnings = [];
  const fail = (rule, message) => errors.push({ rule, message });
  const warn = (rule, message) => warnings.push({ rule, message });

  if (data?.schemaVersion !== 1) fail("schema", "schemaVersion doit valoir 1");
  if (!Number.isInteger(data?.staleAfterDays) || data.staleAfterDays < 1) fail("schema", "staleAfterDays doit être un entier positif");
  if (!Number.isInteger(data?.warnExpiryDays) || data.warnExpiryDays < 0) fail("schema", "warnExpiryDays doit être un entier positif ou nul");
  if (!data?.sets || typeof data.sets !== "object" || !Object.keys(data.sets).length) {
    fail("schema", "sets absent ou vide");
    return { errors, warnings, debt: [] };
  }

  const owner = new Map(); // slug -> id du jeu
  for (const [id, set] of Object.entries(data.sets)) {
    const at = "sets." + id;
    if (!/^[a-z0-9-]+$/.test(id)) fail("schema", at + " : identifiant invalide");
    if (!set.label || typeof set.label !== "string") fail("schema", at + ".label manquant");
    if (!Number.isInteger(set.year)) fail("schema", at + ".year doit être un entier");
    if (!set.source || typeof set.source.label !== "string" || !/^https:\/\/[^\s]+$/.test(set.source.url || "")) fail("schema", at + ".source : label et URL https obligatoires");
    for (const k of ["effectiveFrom", "effectiveTo", "verifiedOn"]) if (!isDate(set[k])) fail("schema", at + "." + k + " : date AAAA-MM-JJ obligatoire");
    if (!Array.isArray(set.usedBy) || !set.usedBy.length) fail("schema", at + ".usedBy : au moins un slug d'outil");
    if (set.values === undefined) fail("schema", at + ".values manquant");
    else numbersOnly(set.values, at + ".values", fail);

    if (isDate(set.effectiveFrom) && isDate(set.effectiveTo)) {
      if (set.effectiveFrom > set.effectiveTo) fail("schema", at + " : effectiveFrom postérieur à effectiveTo");
      const y0 = Number(set.effectiveFrom.slice(0, 4)), y1 = Number(set.effectiveTo.slice(0, 4));
      if (Number.isInteger(set.year) && (set.year < y0 || set.year > y1)) fail("year-set", at + ".year (" + set.year + ") hors de la période de validité " + set.effectiveFrom + " → " + set.effectiveTo);
      if (today > set.effectiveTo) fail("expired", id + " : validité dépassée depuis le " + set.effectiveTo + " — mettre à jour les paramètres (" + (set.source?.url || "source") + ")");
      else {
        const remaining=days(today,set.effectiveTo);
        if (Number.isInteger(horizonDays) && horizonDays >= 0 && remaining < horizonDays) {
          fail("horizon", id + " : fin de validité le " + set.effectiveTo + " (dans " + remaining + " j) — renouveler avant l'échéance");
        } else if (remaining <= data.warnExpiryDays) {
          warn("expiring", id + " : fin de validité le " + set.effectiveTo + " (dans " + remaining + " j)");
        }
      }
    }
    if (isDate(set.verifiedOn)) {
      if (set.verifiedOn > today) fail("schema", at + ".verifiedOn est dans le futur");
      else if (days(set.verifiedOn, today) > data.staleAfterDays) warn("stale", id + " : dernière vérification il y a " + days(set.verifiedOn, today) + " j (seuil " + data.staleAfterDays + " j)");
    }

    for (const slug of set.usedBy || []) {
      if (owner.has(slug)) fail("schema", slug + " est déclaré dans deux jeux (" + owner.get(slug) + ", " + id + ")");
      owner.set(slug, id);
      const html = pages[slug];
      if (html === undefined) { fail("unknown-page", id + " : l'outil « " + slug + " » n'existe pas dans public/outil/"); continue; }
      if (!/<script[^>]+src="\/parametres\.js"/.test(html)) fail("params-script", slug + " : la page doit charger /parametres.js");
      const { title, h1 } = titleAndH1(html);
      for (const y of new Set([...years(title), ...years(h1)])) {
        if (y !== set.year) fail("year-mismatch", slug + " : année " + y + " dans le titre/H1, mais le jeu « " + id + " » est de " + set.year);
      }
    }
    for (const m of set.htmlMentions || []) {
      const html = pages[m.slug];
      const fmt = FORMATS[m.format];
      const value = get(set.values, m.path);
      if (html === undefined || !fmt || typeof value !== "number") { fail("schema", id + ".htmlMentions : entrée invalide (" + JSON.stringify(m) + ")"); continue; }
      if (!set.usedBy.includes(m.slug)) fail("schema", id + ".htmlMentions : " + m.slug + " absent de usedBy");
      if (!norm(html).includes(norm(fmt(value)))) fail("html-mention", m.slug + " : la page ne contient pas « " + norm(fmt(value)) + " » (" + id + "." + m.path + ")");
    }
  }

  const debt = data.anneeAMigrer?.slugs;
  if (!Array.isArray(debt)) fail("schema", "anneeAMigrer.slugs doit être un tableau");
  const debtSet = new Set(Array.isArray(debt) ? debt : []);
  for (const slug of debtSet) {
    if (pages[slug] === undefined) { fail("year-debt", "anneeAMigrer : « " + slug + " » n'existe pas dans public/outil/"); continue; }
    if (owner.has(slug)) fail("year-debt", "anneeAMigrer : « " + slug + " » est déjà migré (jeu " + owner.get(slug) + ") — le retirer de la liste");
    const { title, h1 } = titleAndH1(pages[slug]);
    if (!years(title).length && !years(h1).length) fail("year-debt", "anneeAMigrer : « " + slug + " » n'a plus d'année dans son titre/H1 — le retirer de la liste");
  }
  for (const [slug, html] of Object.entries(pages)) {
    if (owner.has(slug) || debtSet.has(slug)) continue;
    const { title, h1 } = titleAndH1(html);
    const found = [...new Set([...years(title), ...years(h1)])];
    if (found.length) fail("year-not-regulatory", slug + " : année " + found.join(", ") + " dans le titre/H1 sans paramètres réglementaires associés — retirer l'année ou migrer l'outil vers data/parametres.json");
  }
  if (debtSet.size) warn("year-debt", debtSet.size + " outil(s) gardent encore l'année dans le titre en attendant leur migration");

  if (generated !== undefined) {
    if (generated !== buildParamsJs(data)) fail("generated", TARGET + " ne correspond pas à data/parametres.json — lancer : node scripts/generate-params.mjs");
  }
  return { errors, warnings, debt: [...debtSet] };
}

function loadPages(root) {
  const dir = path.join(root, "public", "outil");
  const pages = {};
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name, "index.html");
    if (entry.isDirectory() && fs.existsSync(file)) pages[entry.name] = fs.readFileSync(file, "utf8");
  }
  return pages;
}

function main() {
  const todayArg = process.argv.find(a => a.startsWith("--today="));
  const today = todayArg ? todayArg.slice("--today=".length) : new Date().toISOString().slice(0, 10);
  if (!isDate(today)) { console.error("--today doit être au format AAAA-MM-JJ"); process.exit(2); }
  const horizonIndex=process.argv.indexOf("--horizon");
  let horizonDays;
  if(horizonIndex>=0){
    const raw=process.argv[horizonIndex+1];
    if(raw===undefined||!/^[0-9]+$/.test(raw)){console.error("--horizon doit être un nombre entier de jours");process.exit(2)}
    horizonDays=Number(raw);
  }
  const root = process.cwd();
  const generatedFile = path.join(root, TARGET);
  const result = checkParams({
    data: readParams(root),
    pages: loadPages(root),
    today,
    generated: fs.existsSync(generatedFile) ? fs.readFileSync(generatedFile, "utf8") : null,
    horizonDays
  });

  console.log("Contrôle des paramètres réglementaires au " + today);
  for (const w of result.warnings) console.log("  avertissement [" + w.rule + "] " + w.message);
  for (const e of result.errors) console.error("  ERREUR [" + e.rule + "] " + e.message);

  if (process.env.GITHUB_STEP_SUMMARY) {
    const lines = ["### Paramètres réglementaires (" + today + ")", "", "| Niveau | Règle | Détail |", "|---|---|---|"];
    for (const e of result.errors) lines.push("| erreur | " + e.rule + " | " + e.message.replace(/\|/g, "\\|") + " |");
    for (const w of result.warnings) lines.push("| avertissement | " + w.rule + " | " + w.message.replace(/\|/g, "\\|") + " |");
    if (lines.length === 4) lines.push("| ok | — | Aucun écart |");
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join("\n") + "\n\n");
  }

  if (result.errors.length) process.exit(1);
  console.log("Paramètres réglementaires : " + (result.warnings.length ? result.warnings.length + " avertissement(s), aucun écart bloquant." : "aucun écart."));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
