import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = "public";
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

function lastModified(file) {
  const date = execFileSync("git", ["log", "-1", "--format=%cs", "--", file], { encoding: "utf8" }).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Unable to determine valid Git last-modified date for ${file}: ${date}`);
  }
  return date;
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

fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemap, "utf8");
console.log(`Generated sitemap.xml with ${pages.length} URLs using Git last-modified dates.`);
