import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = "public";
const CHECK_ONLY = process.argv.includes("--check");
const SITE = "https://simulateur.site";
const EXCLUDED_PREFIXES = ["public/api/"];

// These restoration/tree-migration commits rebuilt the public tree without changing page content.
// They must not become the apparent last modification date of restored pages.
const IGNORED_COMMITS = new Set([
  "2dc2ac88a7e12e26240d935011c8ad5ebba944a8",
  "977851feb8ef88b3c4c41307eeee2a5b915a1874",
  "b1844c90bd4c31a815b31433268a629e2049b97a"
]);

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

function lastModified(file) {
  const history = execFileSync(
    "git",
    ["log", "--format=%H%x09%cs", "--", file],
    { encoding: "utf8" }
  ).trim().split(/\r?\n/).filter(Boolean);

  for (const entry of history) {
    const [sha, date] = entry.split("\t");
    if (IGNORED_COMMITS.has(sha)) continue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error(`Unable to determine valid Git last-modified date for ${file}: ${date}`);
    }
    return date;
  }

  throw new Error(`No valid Git last-modified date found for ${file}`);
}

const pages = walk(ROOT)
  .filter(isIndexablePage)
  .map(file => ({ route: routeFromFile(file), lastmod: lastModified(file) }))
  .sort((a, b) => a.route.localeCompare(b.route));

const seen = new Set();
for (const page of pages) {
  if (seen.has(page.route)) throw new Error(`Duplicate sitemap route: ${page.route}`);
  seen.add(page.route);
}

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...pages.flatMap(page => [
    "  <url>",
    `    <loc>${SITE}${page.route}</loc>`,
    `    <lastmod>${page.lastmod}</lastmod>`,
    "  </url>"
  ]),
  "</urlset>",
  ""
].join("\n");

const sitemapPath = path.join(ROOT, "sitemap.xml");
if (CHECK_ONLY) {
  const current = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, "utf8") : "";
  if (current !== sitemap) {
    const currentLines = current.split(/\r?\n/);
    const generatedLines = sitemap.split(/\r?\n/);
    const firstMismatch = generatedLines.findIndex((line, i) => line !== currentLines[i]);
    console.error("Sitemap check failed: public/sitemap.xml is not the generated sitemap for this commit.");
    console.error("First mismatch at line " + (firstMismatch + 1) + ":");
    console.error("Committed: " + (currentLines[firstMismatch] ?? "<missing>"));
    console.error("Generated: " + (generatedLines[firstMismatch] ?? "<missing>"));
    console.error("BEGIN_GENERATED_SITEMAP");
    console.error(sitemap);
    console.error("END_GENERATED_SITEMAP");
    process.exit(1);
  }
  console.log(`Sitemap check passed: ${pages.length} URLs.`);
} else {
  fs.writeFileSync(sitemapPath, sitemap, "utf8");
  console.log(`Generated sitemap.xml with ${pages.length} URLs using Git last-modified dates.`);
}
