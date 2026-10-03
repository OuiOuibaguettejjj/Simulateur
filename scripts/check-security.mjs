#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const errors = [];

function read(file) { return fs.readFileSync(path.join(ROOT, file), "utf8"); }
function walk(dir, out = []) {
  for (const entry of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = path.posix.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (![".git", "node_modules"].includes(entry.name)) walk(rel, out);
    } else out.push(rel);
  }
  return out;
}
const allFiles = walk("");
const textFiles = allFiles.filter(file => !/\.(?:png|jpe?g|gif|webp|ico|woff2?|ttf|pdf|zip)$/i.test(file));
function fail(message) { errors.push(message); }

/* Secret material and dangerous-file gate. */
const forbiddenNames = /^(?:\.env(?:\..*)?|id_rsa|id_dsa|id_ecdsa|id_ed25519)$/i;
for (const file of allFiles) {
  const base = path.posix.basename(file);
  if (forbiddenNames.test(base) && !/^\.env\.example$/i.test(base)) fail("forbidden secret-like file: " + file);
  if (/\.(?:pem|key|p12|pfx)$/i.test(file)) fail("private-key/certificate material must not be committed: " + file);
}
const secretPatterns = [
  /-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----/,
  /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{20,}\b/,
  /\bsk_(?:live|test)_[A-Za-z0-9]{20,}\b/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\b(?:AWS_SECRET_ACCESS_KEY|CLOUDFLARE_API_TOKEN)\s*[:=]\s*["']?[A-Za-z0-9_./+=-]{20,}/
];
for (const file of textFiles) {
  const content = read(file);
  for (const pattern of secretPatterns) if (pattern.test(content)) fail("possible secret material in " + file);
}

/* Central architecture source-of-truth gate. */
const sim = read("public/simulateurs.js");
const categoriesMatch = sim.match(/const CATEGORIES=(\{[\s\S]*?\});\s*const TOOLS_META=/);
const metaMatch = sim.match(/const TOOLS_META=(\{[\s\S]*?\});\s*function toolMeta/);
if (!categoriesMatch || !metaMatch) {
  fail("central taxonomy blocks are not parseable");
} else {
  let categories, toolsMeta;
  try {
    categories = Function("return (" + categoriesMatch[1] + ")")();
    toolsMeta = Function("return (" + metaMatch[1] + ")")();
  } catch (error) {
    fail("central taxonomy cannot be parsed: " + error.message);
  }
  if (categories && toolsMeta) {
    const allowedTypes = new Set(["calculateur", "simulateur", "conversion", "comparateur"]);
    const categorySlugs = new Set(Object.keys(categories));
    const metaSlugs = Object.keys(toolsMeta);
    const pageSlugs = allFiles.filter(file => /^public\/outil\/[^/]+\/index\.html$/.test(file)).map(file => file.split("/")[2]);
    for (const [slug, meta] of Object.entries(toolsMeta)) {
      if (!meta || typeof meta !== "object") { fail("invalid metadata for " + slug); continue; }
      if (!allowedTypes.has(meta.type)) fail(slug + ": invalid type " + meta.type);
      if (!categorySlugs.has(meta.category)) fail(slug + ": unknown primary category " + meta.category);
      if (!Array.isArray(meta.relatedTools)) fail(slug + ": relatedTools must be an array");
      for (const related of meta.relatedTools || []) {
        if (!related || typeof related.slug !== "string") { fail(slug + ": malformed related tool"); continue; }
        if (!(related.slug in toolsMeta)) fail(slug + ": related tool missing from central metadata: " + related.slug);
        if (related.slug === slug) fail(slug + ": tool cannot relate to itself");
        if (!related.title || !related.description) fail(slug + ": related tool requires title and description");
      }
    }
    const pageSet = new Set(pageSlugs);
    for (const slug of metaSlugs) if (!pageSet.has(slug)) fail("taxonomy entry has no /outil page: " + slug);
    for (const slug of pageSet) if (!toolsMeta[slug]) fail("tool page missing from central taxonomy: " + slug);
  }
}

/* Production boundary and Worker invariants. */
const wrangler = read("wrangler.jsonc");
if (!/"workers_dev"\s*:\s*false/.test(wrangler)) fail("wrangler: workers_dev must remain disabled");
if (!/"preview_urls"\s*:\s*false/.test(wrangler)) fail("wrangler: preview_urls must remain disabled");
if (!/"run_worker_first"\s*:\s*\[\s*"\/api\/devises"\s*\]/.test(wrangler)) fail("wrangler: run_worker_first must stay limited to /api/devises");

const worker = read("worker.js");
if (!/request\.method !== "GET" && request\.method !== "HEAD"/.test(worker)) fail("worker: API method allow-list missing");
if (!/Access-Control-Allow-Origin": "https:\/\/simulateur\.site"/.test(worker)) fail("worker: API CORS origin is not locked to simulateur.site");
if (/Access-Control-Allow-Origin": "\*"/.test(worker)) fail("worker: wildcard CORS is forbidden");
if (/eval\s*\(|new Function\s*\(/.test(worker)) fail("worker: dynamic code execution is forbidden");

const headers = read("public/_headers");
for (const header of ["X-Content-Type-Options","X-Frame-Options","Strict-Transport-Security","Content-Security-Policy","Cross-Origin-Opener-Policy","Cross-Origin-Resource-Policy","Referrer-Policy","Permissions-Policy"]) {
  if (!headers.split(/\r?\n/).some(line => line.trimStart().startsWith(header + ":"))) fail("public/_headers: missing " + header);
}
const cspWorker = worker.match(/"Content-Security-Policy": "([^"]+)"/)?.[1];
const cspHeaders = headers.match(/^\s*Content-Security-Policy:\s*(.+)$/mi)?.[1]?.trim();
if (cspWorker && cspHeaders && cspWorker !== cspHeaders) fail("CSP mismatch between worker.js and public/_headers");

/* CI/CD trust-boundary gate. */
for (const file of allFiles.filter(file => file.startsWith(".github/workflows/") && file.endsWith(".yml"))) {
  const workflow = read(file);
  if (!/^permissions:\s*$/m.test(workflow)) fail(file + ": explicit permissions block required");
  if (/permissions:\s*(?:write-all|read-write)/i.test(workflow) || /^\s+\w+:\s*write\s*$/m.test(workflow)) fail(file + ": write GitHub permissions are forbidden");
  for (const match of workflow.matchAll(/^\s*(?:-\s*)?uses:\s*([^\s#]+)/gm)) {
    if (!/@[0-9a-f]{40}$/i.test(match[1])) fail(file + ": action is not pinned to a full commit SHA: " + match[1]);
  }
  if (/pull_request_target/i.test(workflow)) fail(file + ": pull_request_target is forbidden");
  if (/\$\{\{\s*secrets\.(?!CLOUDFLARE_API_TOKEN\s*\}\}|CLOUDFLARE_ACCOUNT_ID\s*\}\})/.test(workflow)) fail(file + ": unexpected GitHub secret reference");
}
const deploy = read(".github/workflows/deploy.yml");
if (!/group:\s*production/.test(deploy) || !/cancel-in-progress:\s*false/.test(deploy)) fail("deploy workflow: production concurrency lock must queue, not cancel");
if (!/permissions:\s*\n\s+contents:\s+read/.test(deploy)) fail("deploy workflow: contents: read permission is required");
if (!/cloudflare\/wrangler-action@[0-9a-f]{40}/.test(deploy)) fail("deploy workflow: Wrangler action must be pinned to a full SHA");
if (!/secrets\.CLOUDFLARE_API_TOKEN/.test(deploy) || !/secrets\.CLOUDFLARE_ACCOUNT_ID/.test(deploy)) fail("deploy workflow: Cloudflare credentials must remain GitHub secrets");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Pre-production security and architecture gate passed.");
