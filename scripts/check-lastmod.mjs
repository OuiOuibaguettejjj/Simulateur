#!/usr/bin/env node
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const BASE_REF = process.env.CHECK_PAGES_BASE_REF;
const HTML_PATH = /^public\/(.*)\/index\.html$/;

export function routeFromHtmlPath(file) {
  if (file === "public/index.html") return "/";
  const match = HTML_PATH.exec(file);
  return match ? "/" + match[1] + "/" : null;
}

// Les métadonnées de partage social peuvent changer sans changement éditorial.
// Elles sont neutralisées pour éviter les faux positifs lors d'une synchronisation OG/Twitter.
export function normalizePageForLastmod(html) {
  return String(html)
    .replace(/<meta\b(?=[^>]*(?:property|name)\s*=\s*(["'])?(?:og:|twitter:)[^\s"'/>]*\1?)[^>]*>\s*/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function checkPageLastmod({ file, baseHtml, currentHtml, baseRoutes, currentRoutes }) {
  const route = routeFromHtmlPath(file);
  if (!route || normalizePageForLastmod(baseHtml) === normalizePageForLastmod(currentHtml)) return [];
  const before = baseRoutes?.[route];
  const after = currentRoutes?.[route];
  if (before !== after) return [];
  return [
    `${route} : le HTML a changé hors métadonnées Open Graph/Twitter, mais lastmod reste ${after ?? "absent"} (base : ${before ?? "absent"}). Mettez à jour data/lastmod.json et régénérez public/sitemap.xml.`
  ];
}

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
}

function readAt(ref, file) {
  try {
    return git("show", `${ref}:${file}`);
  } catch {
    return null;
  }
}

function main() {
  if (!BASE_REF) {
    console.error("CHECK_PAGES_BASE_REF est requis pour contrôler les lastmod des pages modifiées.");
    process.exit(1);
  }

  let changed;
  try {
    changed = git("diff", "--name-only", "--diff-filter=ACMR", `${BASE_REF}...HEAD`)
      .split(/\r?\n/)
      .filter(file => HTML_PATH.test(file) || file === "public/index.html");
  } catch (error) {
    console.error("Impossible de comparer les pages avec la base de la PR : " + error.message);
    process.exit(1);
  }

  if (!changed.length) {
    console.log("Lastmod guard : aucune page HTML indexable modifiée.");
    return;
  }

  const baseDataRaw = readAt(BASE_REF, "data/lastmod.json");
  const currentDataRaw = fs.readFileSync(path.join(ROOT, "data/lastmod.json"), "utf8");
  let baseRoutes;
  let currentRoutes;
  try {
    baseRoutes = JSON.parse(baseDataRaw ?? "{}").routes ?? {};
    currentRoutes = JSON.parse(currentDataRaw).routes ?? {};
  } catch (error) {
    console.error("Impossible de lire data/lastmod.json : " + error.message);
    process.exit(1);
  }

  const errors = [];
  for (const file of changed) {
    const baseHtml = readAt(BASE_REF, file);
    const currentHtml = fs.readFileSync(path.join(ROOT, file), "utf8");
    if (baseHtml === null) continue; // Nouvelle page : le contrôle de couverture du sitemap vérifie son entrée.
    errors.push(...checkPageLastmod({ file, baseHtml, currentHtml, baseRoutes, currentRoutes }));
  }

  if (errors.length) {
    console.error("Lastmod guard failed :");
    for (const error of errors) console.error(" - " + error);
    process.exit(1);
  }
  console.log(`Lastmod guard passed : ${changed.length} page(s) HTML vérifiée(s).`);
}

if (import.meta.url === pathToFileURL(path.resolve(process.argv[1] || "")).href) main();
