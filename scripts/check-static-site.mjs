import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { isInteractivePage } from './interactive-families.mjs';

const root = 'public';
const files = [];
const allFiles = new Set();

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.isFile()) {
      allFiles.add(p.replaceAll(path.sep, '/'));
      if (p.endsWith('.html')) files.push(p.replaceAll(path.sep, '/'));
    }
  }
}
walk(root);

const errors = [];
const canonicals = new Map();

function publicPathForFile(file) {
  const rel = file.slice('public'.length);
  if (rel === '/index.html') return '/';
  if (rel.endsWith('/index.html')) return rel.slice(0, -'index.html'.length);
  return rel;
}

function existsPublicPath(urlPath) {
  if (urlPath === '/') return allFiles.has('public/index.html');
  const clean = urlPath.replace(/^\//, '').replace(/\/$/, '');
  if (allFiles.has('public/' + clean)) return true;
  if (allFiles.has('public/' + clean + '/index.html')) return true;
  return false;
}

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const route = publicPathForFile(file);

  if (html.includes('--- TRUNCATED ---')) errors.push(file + ': truncation marker');
  if (!/^<!doctype html>/i.test(html.trim())) errors.push(file + ': missing doctype');
  if (!/<html\b[^>]*>/i.test(html)) errors.push(file + ': missing html element');
  if (!/<head\b[^>]*>/i.test(html)) errors.push(file + ': missing head');
  if (!/<body\b[^>]*>/i.test(html)) errors.push(file + ': missing body');
  if (!/<\/html>/i.test(html)) errors.push(file + ': missing closing html tag');

  const head = (html.match(/<head\b[^>]*>[\s\S]*?<\/head>/i) || [''])[0];
  const titles = [...head.matchAll(/<title>[^<]+<\/title>/gi)];
  if (titles.length !== 1) errors.push(file + ': expected exactly one document title, found ' + titles.length);

  const canonicalMatches = [...html.matchAll(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/gi)];
  if (file === 'public/404.html') {
    if (canonicalMatches.length > 1) errors.push(file + ': more than one canonical');
  } else if (canonicalMatches.length !== 1) {
    errors.push(file + ': expected exactly one canonical, found ' + canonicalMatches.length);
  } else {
    const canonical = canonicalMatches[0][1];
    if (!canonical.startsWith('https://simulateur.site/')) errors.push(file + ': canonical outside simulateur.site: ' + canonical);
    if (canonicals.has(canonical)) errors.push(file + ': duplicate canonical ' + canonical + ' (also ' + canonicals.get(canonical) + ')');
    canonicals.set(canonical, file);
  }

  if (html.toLowerCase().includes('repere')) errors.push(file + ': obsolete brand string "repere"');
  if (html.includes('repere.workers.dev')) errors.push(file + ': obsolete workers.dev domain');

  if (isInteractivePage(file.slice('public/'.length))) {
    if (html.length < 1000) errors.push(file + ': interactive page suspiciously small (' + html.length + ' bytes)');
    if (!/<script\b/i.test(html)) errors.push(file + ': interactive page has no JavaScript');
    if (!/<button\b/i.test(html)) errors.push(file + ': interactive page has no button');
  }

  for (const match of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attrs = match[1];
    const typeMatch = attrs.match(/\btype=["']([^"']+)["']/i);
    const type = typeMatch ? typeMatch[1].toLowerCase() : "";
    if (type && !["text/javascript", "application/javascript", "application/ecmascript", "text/ecmascript", "module"].includes(type)) continue;
    const js = match[2].trim();
    if (!js) continue;
    try { new vm.Script(js, {filename:file}); }
    catch (e) { errors.push(file + ': JavaScript syntax error: ' + e.message); }
  }

  for (const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/gi)) {
    const target = match[1];
    if (!target || target.startsWith('#') || /^(https?:|mailto:|tel:|data:|javascript:)/i.test(target)) continue;
    const targetPath = target.split(/[?#]/)[0];
    if (targetPath.startsWith('/') && !existsPublicPath(targetPath)) {
      errors.push(file + ': broken internal path ' + targetPath);
    }
  }
}

if (allFiles.has('public/sitemap.xml')) {
  const sitemap = fs.readFileSync('public/sitemap.xml', 'utf8');
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  const seen = new Set();
  for (const url of sitemapUrls) {
    if (seen.has(url)) errors.push('public/sitemap.xml: duplicate URL ' + url);
    seen.add(url);
    if (!url.startsWith('https://simulateur.site/')) errors.push('public/sitemap.xml: URL outside canonical domain ' + url);
    else if (!existsPublicPath(new URL(url).pathname)) errors.push('public/sitemap.xml: broken URL ' + url);
  }
  if (sitemapUrls.includes('https://simulateur.site/404.html')) errors.push('public/sitemap.xml: 404 page must not be indexed');
}

if (!allFiles.has('public/styles.css')) errors.push('public/styles.css: missing');
if (!allFiles.has('public/robots.txt')) errors.push('public/robots.txt: missing');
if (!allFiles.has('public/sitemap.xml')) errors.push('public/sitemap.xml: missing');
if (allFiles.has('public/simulateurs.js')) {
  try { new vm.Script(fs.readFileSync('public/simulateurs.js','utf8'), {filename:'public/simulateurs.js'}); }
  catch (e) { errors.push('public/simulateurs.js: JavaScript syntax error: ' + e.message); }
}

const interactiveCount = files.filter(f => isInteractivePage(f.slice('public/'.length))).length;
console.log('Validated ' + files.length + ' HTML pages and ' + interactiveCount + ' interactive pages.');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
