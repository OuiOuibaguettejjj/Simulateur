import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Contrôle de cohérence de la forme du site : bloquant (fail-closed), le moindre écart fait échouer le déploiement.
// Règles : un seul <main>, un seul <header>, un seul <footer> par page ; pas de CSS de page qui redéfinit
// la mise en page commune ; chaque outil de public/outil/ est listé sur une page de rubrique.

const root = path.join(process.cwd(), "public");
const SKIP_ROOT_DIRS = new Set([".well-known", "api"]);
const HUBS = ["calculateurs", "simulateurs", "conversions", "comparateurs"];
const SHARED = /^(?:\.wrap|main|header|footer|\.nav|\.navlinks|\.logo|\.content-section|\.calculator-faq|\.related-tools|\.footerlinks)(?![\w-])/;


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

function extractStyleRules(html) {
  const rules = [];
  for (const m of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    const css = m[1].replace(/\/\*[\s\S]*?\*\//g, "").replace(/@media[^\{]*\{/gi, "");
    for (const rule of css.split("}")) {
      for (const selector of rule.split("{")[0].split(",")) {
        const t = selector.trim();
        if (t) rules.push(t);
      }
    }
  }
  return rules;
}

export function sharedOverrides(html) {
  return [...new Set(extractStyleRules(html).filter(selector => SHARED.test(selector)))];
}

export function localHeadingOverrides(html) {
  return [...new Set(
    extractStyleRules(html).filter(selector =>
      /(^|[\s>+~,(])h[1-6](?=$|[\s.#:[>+~),])/.test(selector)
    )
  )];
}

function checkSite() {
  let warned = 0;
  const localWarn = (rel, msg) => {
    warned++;
    console.log("::warning file=" + rel + "::" + msg);
  };

  const files = walk(root);
  for (const file of files) {
    const rel = path.relative(process.cwd(), file);
    const html = fs.readFileSync(file, "utf8");
    for (const [tag, re] of [["main", /<main\b/gi], ["header", /<header\b/gi], ["footer", /<footer\b/gi]]) {
      const n = (html.match(re) || []).length;
      if (n !== 1) localWarn(rel, "attendu : exactement un <" + tag + ">, trouvé " + n);
    }
    for (const sel of sharedOverrides(html)) {
      localWarn(rel, "CSS de page qui redéfinit la mise en page commune : " + sel + " (à déplacer dans public/styles.css)");
    }
    for (const sel of localHeadingOverrides(html)) {
      localWarn(rel, "CSS local qui redéfinit un titre h1–h6 : " + sel + " (les styles de titres doivent rester dans public/styles.css)");
    }
  }

  const linked = new Set();
  for (const hub of HUBS) {
    const f = path.join(root, hub, "index.html");
    if (!fs.existsSync(f)) {
      localWarn("public/" + hub + "/index.html", "page de rubrique introuvable");
      continue;
    }
    for (const m of fs.readFileSync(f, "utf8").matchAll(/href=["']\/outil\/([^/"'?#]+)/g)) linked.add(m[1]);
  }
  const outilDir = path.join(root, "outil");
  if (fs.existsSync(outilDir)) {
    for (const e of fs.readdirSync(outilDir, { withFileTypes: true })) {
      if (e.isDirectory() && fs.existsSync(path.join(outilDir, e.name, "index.html")) && !linked.has(e.name)) {
        localWarn("public/outil/" + e.name + "/index.html", "outil non listé sur une page de rubrique (calculateurs, simulateurs, conversions, comparateurs)");
      }
    }
  }

  console.log("Layout check: " + files.length + " pages checked; " + warned + " issue(s).");
  if (warned) {
    console.error("Layout consistency check failed: " + warned + " issue(s) detected.");
    process.exit(1);
  }
}

if (import.meta.url === pathToFileURL(path.resolve(process.argv[1] || "")).href) {
  checkSite();
}
