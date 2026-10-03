import fs from "node:fs";
import path from "node:path";

// Contrôle de cohérence de la forme du site : avertissements uniquement, ne bloque jamais le déploiement.
// Règles : un seul <main>, un seul <header>, un seul <footer> par page ; pas de CSS de page qui redéfinit
// la mise en page commune ; chaque outil de public/outil/ est listé sur une page de rubrique.

const root = path.join(process.cwd(), "public");
const SKIP_ROOT_DIRS = new Set([".well-known", "api"]);
const HUBS = ["calculateurs", "simulateurs", "conversions", "comparateurs"];
const SHARED = /^(?:\.wrap|main|header|footer|\.nav|\.navlinks|\.logo|\.content-section|\.related-tools|\.footerlinks)(?![\w-])/;

let warned = 0;
function warn(rel, msg) {
  warned++;
  console.log("::warning file=" + rel + "::" + msg);
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!(dir === root && SKIP_ROOT_DIRS.has(entry.name))) walk(p, out);
    } else if (entry.isFile() && (entry.name === "index.html" || (dir === root && entry.name === "404.html"))) {
      out.push(p);
    }
  }
  return out;
}

function sharedOverrides(html) {
  const found = new Set();
  for (const m of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    const css = m[1].replace(/\/\*[\s\S]*?\*\//g, "").replace(/@media[^\{]*\{/gi, "");
    for (const rule of css.split("}")) {
      for (const s of rule.split("{")[0].split(",")) {
        const t = s.trim();
        if (SHARED.test(t)) found.add(t);
      }
    }
  }
  return [...found];
}

const files = walk(root);
for (const file of files) {
  const rel = path.relative(process.cwd(), file);
  const html = fs.readFileSync(file, "utf8");
  for (const [tag, re] of [["main", /<main\b/gi], ["header", /<header\b/gi], ["footer", /<footer\b/gi]]) {
    const n = (html.match(re) || []).length;
    if (n !== 1) warn(rel, "attendu : exactement un <" + tag + ">, trouvé " + n);
  }
  for (const sel of sharedOverrides(html)) {
    warn(rel, "CSS de page qui redéfinit la mise en page commune : " + sel + " (à déplacer dans public/styles.css)");
  }
}

const linked = new Set();
for (const hub of HUBS) {
  const f = path.join(root, hub, "index.html");
  if (!fs.existsSync(f)) {
    warn("public/" + hub + "/index.html", "page de rubrique introuvable");
    continue;
  }
  for (const m of fs.readFileSync(f, "utf8").matchAll(/href=["']\/outil\/([^/"'?#]+)/g)) linked.add(m[1]);
}
const outilDir = path.join(root, "outil");
if (fs.existsSync(outilDir)) {
  for (const e of fs.readdirSync(outilDir, { withFileTypes: true })) {
    if (e.isDirectory() && fs.existsSync(path.join(outilDir, e.name, "index.html")) && !linked.has(e.name)) {
      warn("public/outil/" + e.name + "/index.html", "outil non listé sur une page de rubrique (calculateurs, simulateurs, conversions, comparateurs)");
    }
  }
}

console.log("Layout check: " + files.length + " pages checked; " + warned + " issue(s).");
if (warned) {
  console.error("Layout consistency check failed: " + warned + " issue(s) detected.");
  process.exit(1);
}
