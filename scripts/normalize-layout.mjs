import fs from "node:fs";
import path from "node:path";

// Uniformise l'en-tête et le pied de page de toutes les pages HTML de public/.
// Idempotent : relancé sur son propre résultat, il ne modifie plus rien.
// Pour changer le menu ou les liens du pied de page, modifier HEADER / FOOTER ci-dessous.

const root = path.join(process.cwd(), "public");
const CHECK_ONLY = process.argv.includes("--check");
const SKIP_ROOT_DIRS = new Set([".well-known", "api"]);

const HEADER =
  '<header><div class="wrap nav"><a class="logo" href="/">Simulateur<span>.</span></a>' +
  '<nav class="navlinks" aria-label="Navigation principale">' +
  '<a href="/calculateurs/">Calculateurs</a><a href="/simulateurs/">Simulateurs</a>' +
  '<a class="nav-extra" href="/conversions/">Conversions</a><a class="nav-extra" href="/comparateurs/">Comparateurs</a>' +
  '</nav></div></header>';

const FOOTER =
  '<footer><div class="wrap"><div class="footerlinks">' +
  '<a href="/">Accueil</a><a href="/a-propos/">À propos</a><a href="/contact/">Contact</a>' +
  '<a href="/mentions-legales/">Mentions légales</a><a href="/confidentialite/">Confidentialité</a>' +
  '<a href="/cookies/">Cookies</a><a href="/cgu/">CGU</a>' +
  "</div></div></footer>";

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

function normalize(html, isCalculator = false) {
  const warnings = [];
  let out = html;

  const body = /<body\b[^>]*>/i.exec(out);
  if (!body) return { html, warnings: ["pas de balise <body>, page ignorée"] };

  // Inject the shared keyboard mechanism on every calculator/conversion page.
  // This also covers future pages automatically through the common layout step.
  if (isCalculator && !/<script[^>]+src=["']\/enter-calcul\.js["'][^>]*>/i.test(out)) {
    const headClose = /<\/head>/i.exec(out);
    if (headClose) {
      out = out.slice(0, headClose.index) + '<script src="/enter-calcul.js" defer></script>' + out.slice(headClose.index);
    } else {
      warnings.push("balise </head> absente, mécanisme Entrée non injecté");
    }
  }

  // En-tête
  const headerCount = (out.match(/<header\b/gi) || []).length;
  if (headerCount === 0) {
    const at = body.index + body[0].length;
    out = out.slice(0, at) + HEADER + out.slice(at);
  } else {
    const lead = /(<body\b[^>]*>\s*)<header\b[^>]*>[\s\S]*?<\/header>/i.exec(out);
    if (lead && /class=["']logo["']/.test(lead[0])) {
      out = out.slice(0, lead.index) + lead[1] + HEADER + out.slice(lead.index + lead[0].length);
    } else {
      warnings.push("en-tête non reconnu, laissé tel quel");
    }
  }

  // Pied de page
  const footerCount = (out.match(/<footer\b/gi) || []).length;
  if (footerCount === 0) {
    const main = /<\/main>/i.exec(out);
    if (main) {
      const at = main.index + main[0].length;
      out = out.slice(0, at) + FOOTER + out.slice(at);
    } else {
      const end = out.search(/<\/body>/i);
      if (end === -1) warnings.push("ni </main> ni </body>, pied de page non ajouté");
      else out = out.slice(0, end) + FOOTER + out.slice(end);
    }
  } else if (footerCount === 1) {
    out = out.replace(/<footer\b[\s\S]*?<\/footer>/i, () => FOOTER);
  } else {
    warnings.push("plusieurs pieds de page, laissés tels quels");
  }

  return { html: out, warnings };
}

let changed = 0;
let warned = 0;
const files = walk(root);
for (const file of files) {
  const old = fs.readFileSync(file, "utf8");
  const relative = path.relative(root, file).replaceAll(path.sep, "/");
  const isCalculator = relative.startsWith("outil/") || relative.startsWith("conversion/");
  const { html, warnings } = normalize(old, isCalculator);
  for (const w of warnings) {
    warned++;
    console.warn("normalize-layout: " + path.relative(process.cwd(), file) + " : " + w);
  }
  if (html !== old) {
    changed++;
    if (!CHECK_ONLY) fs.writeFileSync(file, html);
  }
}
if (CHECK_ONLY && (changed || warned)) {
  console.error(
    "Layout check failed: " +
    changed + " page(s) differ from the canonical shared layout; " +
    warned + " warning(s) indicate an unrecognized or structurally ambiguous layout."
  );
  process.exit(1);
}
console.log("Layout " + (CHECK_ONLY ? "check" : "normalize") + ": " + changed + " pages updated; " + files.length + " pages checked; " + warned + " warnings.");