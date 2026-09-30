import fs from "node:fs";
import path from "node:path";

// Ajoute les marqueurs AdSense dans le <head> de toutes les pages publiques.
// Idempotent : une seconde exécution ne modifie plus aucun fichier.
const root = path.join(process.cwd(), "public");
const SKIP_ROOT_DIRS = new Set([".well-known", "api"]);
const META = '<meta name="google-adsense-account" content="ca-pub-2924580037451268">';

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!(dir === root && SKIP_ROOT_DIRS.has(entry.name))) walk(file, out);
    } else if (entry.isFile() && (entry.name === "index.html" || (dir === root && entry.name === "404.html"))) {
      out.push(file);
    }
  }
  return out;
}

function normalize(html, file) {
  const head = /<head\b[^>]*>([\s\S]*?)<\/head>/i.exec(html);
  const viewport = /<meta\b[^>]*name=["']viewport["'][^>]*>/i.exec(html);
  if (!head || !viewport || viewport.index < head.index || viewport.index > head.index + head[0].length) {
    throw new Error(file + ": <head> ou <meta name=viewport> introuvable");
  }

  // Supprime le marqueur et les retours à la ligne qui l'entourent afin que
  // sa réinsertion soit toujours byte-identique au passage suivant.
  let out = html.replace(
    /\r?\n[ \t]*<meta\b[^>]*name=["']google-adsense-account["'][^>]*>/gi,
    ""
  );
  out = out.replace(/<meta\b[^>]*name=["']google-adsense-account["'][^>]*>[ \t]*/gi, "");

  const headMatch = /<head\b[^>]*>([\s\S]*?)<\/head>/i.exec(out);
  if (!headMatch) throw new Error(file + ": structure du head invalide après normalisation");
  const vp = /<meta\b[^>]*name=["']viewport["'][^>]*>/i.exec(headMatch[1]);
  if (!vp) throw new Error(file + ": structure du head invalide après normalisation");

  const insertAt = headMatch.index + headMatch[0].indexOf(vp[0]) + vp[0].length;
  return out.slice(0, insertAt) + "\n" + META + out.slice(insertAt);
}

function verify(html, file) {
  const head = /<head\b[^>]*>([\s\S]*?)<\/head>/i.exec(html);
  if (!head) throw new Error(file + ": head absent");
  const meta = (head[1].match(/<meta\b[^>]*name=["']google-adsense-account["'][^>]*>/gi) || []);
  if (meta.length !== 1) throw new Error(file + ": attendu exactement une meta google-adsense-account, trouvé " + meta.length);
}

const files = walk(root);
let changed = 0;
for (const file of files) {
  const old = fs.readFileSync(file, "utf8");
  const next = normalize(old, path.relative(process.cwd(), file));
  verify(next, path.relative(process.cwd(), file));
  if (next !== old) {
    fs.writeFileSync(file, next);
    changed++;
  }
}
console.log("AdSense normalize: " + changed + " pages updated; " + files.length + " pages checked.");
