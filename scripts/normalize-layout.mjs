import fs from "node:fs";
import path from "node:path";
import {isInteractivePage} from "./interactive-families.mjs";

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

// Échappe une valeur pour un attribut entre guillemets doubles, sans toucher aux entités déjà présentes.
function escapeAttr(value) {
  return value
    .replace(/&(?!#?\w+;)/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Balises de partage Open Graph et Twitter, dérivées du titre, de la meta description
// et de l'URL canonique déjà présents dans la page. Idempotent : une balise déjà
// présente est respectée, et une page sans titre, description ou canonique n'est pas touchée.
// Aucune image n'est déclarée : le dépôt n'en contient pas.
function addSocialMeta(html) {
  const title = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  const description = /<meta\b[^>]*\bname=(["'])description\1[^>]*\bcontent=(["'])([\s\S]*?)\2[^>]*>/i.exec(html);
  const canonical = /<link\b[^>]*\brel=(["'])canonical\1[^>]*\bhref=(["'])([^"']+)\2[^>]*>/i.exec(html);
  if (!title || !description || !canonical || !title[1].trim()) return html;

  const has = (attr, name) =>
    new RegExp("<meta\\b[^>]*\\b" + attr + "=([\"'])" + name + "\\1", "i").test(html);
  const wanted = [
    ["property", "og:type", "website"],
    ["property", "og:site_name", "Simulateur"],
    ["property", "og:locale", "fr_FR"],
    ["property", "og:title", escapeAttr(title[1].trim())],
    ["property", "og:description", escapeAttr(description[3].trim())],
    ["property", "og:url", escapeAttr(canonical[3])],
    ["name", "twitter:card", "summary"]
  ];
  const tags = wanted
    .filter(([attr, name]) => !has(attr, name))
    .map(([attr, name, content]) => '<meta ' + attr + '="' + name + '" content="' + content + '">')
    .join("");
  if (!tags) return html;
  return html.replace(/<\/head>/i, () => tags + "</head>");
}

function normalize(html, isInteractive = false) {
  const warnings = [];
  let out = html;

  // Accessibilité, favicon et balises de partage communs, de façon idempotente.
  out = out.replace(/<[^>]*\bclass=(["'])([^"']*)\1[^>]*>/gi, (tag, _q, cls) =>
    /(^|\s)result(\s|$)/.test(cls) && !/\baria-live\s*=/.test(tag)
      ? tag.slice(0, -1) + ' aria-live="polite">'
      : tag);

  if (!/<link\b[^>]*href=["']\/favicon\.svg["'][^>]*>/i.test(out)) {
    out = out.replace(/<\/head>/i, '<link rel="icon" href="/favicon.svg" type="image/svg+xml"></head>');
  }

  out = addSocialMeta(out);

  let body = /<body\b[^>]*>/i.exec(out);
  if (!body) return { html, warnings: ["pas de balise <body>, page ignorée"] };

  // Inject the shared keyboard mechanism on every interactive page.
  // This also covers future pages automatically through the common layout step.
  if (isInteractive && !/<script[^>]+src=["']\/enter-calcul\.js["'][^>]*>/i.test(out)) {
    const headClose = /<\/head>/i.exec(out);
    if (headClose) {
      out = out.slice(0, headClose.index) + '<script src="/enter-calcul.js" defer></script>' + out.slice(headClose.index);
    } else {
      warnings.push("balise </head> absente, mécanisme Entrée non injecté");
    }
  }

  body = /<body\b[^>]*>/i.exec(out);

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
  const interactive = isInteractivePage(relative);
  const { html, warnings } = normalize(old, interactive);
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