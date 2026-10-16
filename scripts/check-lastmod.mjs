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

export function checkPageLastmod({ file, baseHtml, currentHtml, baseRoutes, currentRoutes, today = new Date().toISOString().slice(0, 10) }) {
  const route = routeFromHtmlPath(file);
  if (!route || normalizePageForLastmod(baseHtml) === normalizePageForLastmod(currentHtml)) return [];
  const before = baseRoutes?.[route];
  const after = currentRoutes?.[route];
  if (before !== after) return [];
  // Une date lastmod ne distingue pas plusieurs changements survenus le même jour.
  // Si la date est celle du jour courant, elle peut donc légitimement être identique à la base.
  if (after && after === today) return [];
  return [
    `${route} : le HTML a changé hors métadonnées Open Graph/Twitter, mais lastmod reste ${after ?? "absent"} (base : ${before ?? "absent"}). Mettez à jour data/lastmod.json et régénérez public/sitemap.xml.`
  ];
}

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
}

function readAt(ref, file) {
  return git("show", `${ref}:${file}`);
}

function main() {
  if (!BASE_REF) {
    console.error("CHECK_PAGES_BASE_REF est requis pour contrôler les lastmod des pages modifiées.");
    process.exit(1);
  }

  let changes;
  try {
    changes = git("diff", "--no-renames", "--name-status", "--diff-filter=ACMR", `${BASE_REF}...HEAD`)
      .split(/\r?\n/)
      .filter(Boolean)
      .map(line => {
        const [status, file] = line.split("\t");
        return { status, file };
      })
      .filter(change => HTML_PATH.test(change.file) || change.file === "public/index.html");
  } catch (error) {
    console.error("Impossible de comparer les pages avec la base de la PR : " + error.message);
    process.exit(1);
  }

  if (!changes.length) {
    console.log("Lastmod guard : aucune page HTML indexable modifiée.");
    return;
  }

  let baseRoutes;
  let currentRoutes;
  try {
    const baseData = JSON.parse(readAt(BASE_REF, "data/lastmod.json"));
    const currentData = JSON.parse(fs.readFileSync(path.join(ROOT, "data/lastmod.json"), "utf8"));
    if (!baseData || typeof baseData !== "object" || !baseData.routes || typeof baseData.routes !== "object" || Array.isArray(baseData.routes)) {
      throw new Error("la version de base de data/lastmod.json ne contient pas d'objet routes valide");
    }
    if (!currentData || typeof currentData !== "object" || !currentData.routes || typeof currentData.routes !== "object" || Array.isArray(currentData.routes)) {
      throw new Error("la version courante de data/lastmod.json ne contient pas d'objet routes valide");
    }
    baseRoutes = baseData.routes;
    currentRoutes = currentData.routes;
  } catch (error) {
    console.error("Impossible de lire ou valider data/lastmod.json dans la base et la PR : " + error.message);
    process.exit(1);
  }

  const errors = [];
  try {
    for (const { status, file } of changes) {
      if (status === "A") continue; // Nouvelle page : la couverture exacte du sitemap vérifie son entrée.
      const baseHtml = readAt(BASE_REF, file);
      const currentHtml = fs.readFileSync(path.join(ROOT, file), "utf8");
      errors.push(...checkPageLastmod({ file, baseHtml, currentHtml, baseRoutes, currentRoutes }));
    }
  } catch (error) {
    console.error("Impossible de vérifier une page modifiée pour lastmod : " + error.message);
    process.exit(1);
  }

  if (errors.length) {
    console.error("Lastmod guard failed :");
    for (const error of errors) console.error(" - " + error);
    process.exit(1);
  }
  console.log(`Lastmod guard passed : ${changes.length} page(s) HTML vérifiée(s).`);
}

if (import.meta.url === pathToFileURL(path.resolve(process.argv[1] || "")).href) main();
