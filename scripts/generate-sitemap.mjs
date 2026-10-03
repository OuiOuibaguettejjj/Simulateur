import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = "public";
const DATA_FILE = "data/lastmod.json";
const CHECK_ONLY = process.argv.includes("--check");
const SITE = "https://simulateur.site";
const EXCLUDED_PREFIXES = ["public/api/"];

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(file));
    else if (entry.isFile()) files.push(file.replaceAll(path.sep, "/"));
  }
  return files;
}

function isIndexablePage(file) {
  return (file === "public/index.html" || file.endsWith("/index.html"))
    && file !== "public/404.html"
    && !EXCLUDED_PREFIXES.some(prefix => file.startsWith(prefix));
}

function routeFromFile(file) {
  if (file === "public/index.html") return "/";
  return "/" + file.slice("public/".length, -"index.html".length);
}

function tomorrowUtc(today) {
  const date = new Date(today + "T00:00:00Z");
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T00:00:00Z");
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validateLastmodData(data, pages, today) {
  const errors = [];
  const routes = data && typeof data === "object" && !Array.isArray(data) ? data.routes : null;
  if (!data || typeof data !== "object" || Array.isArray(data) || data.schemaVersion !== 1 || !routes || typeof routes !== "object" || Array.isArray(routes)) {
    errors.push("data/lastmod.json doit respecter le schéma { schemaVersion: 1, routes: { ... } }");
    return errors;
  }

  const pageRoutes = pages.map(page => typeof page === "string" ? page : page.route);
  const seenPages = new Set();
  for (const route of pageRoutes) {
    if (seenPages.has(route)) errors.push("Route dupliquée dans les pages indexables : " + route);
    seenPages.add(route);
  }

  const routeKeys = Object.keys(routes);
  const pageSet = new Set(pageRoutes);
  for (const route of pageSet) {
    if (!Object.prototype.hasOwnProperty.call(routes, route)) {
      errors.push("Page indexable sans entrée lastmod : " + route);
    }
  }
  for (const route of routeKeys) {
    if (!pageSet.has(route)) {
      errors.push("Entrée lastmod orpheline : " + route);
    }
  }

  const maxDate = tomorrowUtc(today);
  for (const route of routeKeys) {
    const date = routes[route];
    if (!validDate(date)) {
      errors.push("Date lastmod invalide pour " + route + " : " + String(date));
    } else if (date > maxDate) {
      errors.push("Date lastmod future pour " + route + " : " + date + " (maximum autorisé : " + maxDate + ")");
    }
  }
  return errors;
}

function loadLastmodData(pages) {
  const dataPath = path.resolve(DATA_FILE);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  } catch (error) {
    throw new Error("Impossible de lire " + DATA_FILE + " : " + error.message);
  }
  const today = new Date().toISOString().slice(0, 10);
  const errors = validateLastmodData(data, pages, today);
  if (errors.length) throw new Error(errors.join("\n"));
  return data.routes;
}

function buildSitemap(pages, routes) {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...pages.flatMap(page => [
      "  <url>",
      `    <loc>${SITE}${page.route}</loc>`,
      `    <lastmod>${routes[page.route]}</lastmod>`,
      "  </url>"
    ]),
    "</urlset>",
    ""
  ].join("\n");
}

function main() {
  const pages = walk(ROOT)
    .filter(isIndexablePage)
    .map(file => ({ route: routeFromFile(file) }))
    .sort((a, b) => a.route.localeCompare(b.route));

  const routes = loadLastmodData(pages);
  const sitemap = buildSitemap(pages, routes);
  const sitemapPath = path.join(ROOT, "sitemap.xml");

  if (CHECK_ONLY) {
    const current = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, "utf8") : "";
    if (current !== sitemap) {
      const currentLines = current.split(/\r?\n/);
      const generatedLines = sitemap.split(/\r?\n/);
      const firstMismatch = generatedLines.findIndex((line, i) => line !== currentLines[i]);
      console.error("Sitemap check failed: public/sitemap.xml is not the generated sitemap from data/lastmod.json.");
      console.error("First mismatch at line " + (firstMismatch + 1) + ":");
      console.error("Committed: " + (currentLines[firstMismatch] ?? "<missing>"));
      console.error("Generated: " + (generatedLines[firstMismatch] ?? "<missing>"));
      process.exit(1);
    }
    console.log(`Sitemap check passed: ${pages.length} URLs.`);
  } else {
    fs.writeFileSync(sitemapPath, sitemap, "utf8");
    console.log(`Generated sitemap.xml with ${pages.length} URLs using data/lastmod.json.`);
  }
}

if (import.meta.url === pathToFileURL(path.resolve(process.argv[1] || "")).href) main();
