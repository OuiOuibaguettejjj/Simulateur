import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const script = path.resolve("scripts/normalize-layout.mjs");
const page = (body, head = "") => '<!doctype html><html lang="fr"><head><meta charset="utf-8">' + head + '</head><body><main>' + body + "</main></body></html>";
const SOCIAL_HEAD =
  '<title>Calcul A &amp; B : "test" | Simulateur</title>' +
  '<meta name="description" content="Description de test avec &amp; et l&#39;apostrophe, assez longue pour un exemple réaliste.">' +
  '<link rel="canonical" href="https://simulateur.site/outil/x/">';

function run(body, head = "", family = "outil") {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "normalize-layout-"));
  try {
    const dir = path.join(tmp, "public", family, "x");
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, "index.html");
    fs.writeFileSync(file, page(body, head));
    execFileSync("node", [script], { cwd: tmp, stdio: "pipe" });
    const first = fs.readFileSync(file, "utf8");
    execFileSync("node", [script], { cwd: tmp, stdio: "pipe" });
    assert.equal(fs.readFileSync(file, "utf8"), first, "idempotent : une 2e passe ne change rien");
    return first;
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

const out = run('<div class="result" id="result"></div><div class="result cap-result"></div><div class="result-main"></div><div class="result-kicker"></div><div class="astro-result"></div><div class="result" aria-live="off"></div>');
assert.equal((out.match(/aria-live="polite"/g) || []).length, 2, "aria-live ajouté uniquement sur class=result");
assert(/<div class="result-main">/.test(out), "result-main inchangé");
assert(/<div class="result-kicker">/.test(out), "result-kicker inchangé");
assert(/<div class="astro-result">/.test(out), "astro-result inchangé");
assert(/<div class="result" aria-live="off">/.test(out), "un aria-live existant est respecté");
assert.equal((out.match(/\/favicon\.svg/g) || []).length, 1, "favicon ajouté une seule fois");
// Balises de partage Open Graph et Twitter.
const social = run("<div class=\"result\"></div>", SOCIAL_HEAD);
const count = (re) => (social.match(re) || []).length;
assert.equal(count(/property="og:title"/g), 1, "og:title ajouté une seule fois");
assert(social.includes('<meta property="og:title" content="Calcul A &amp; B : &quot;test&quot; | Simulateur">'), "og:title échappé sans double encodage");
assert(social.includes('<meta property="og:description" content="Description de test avec &amp; et l&#39;apostrophe, assez longue pour un exemple réaliste.">'), "og:description reprend la meta description");
assert(social.includes('<meta property="og:url" content="https://simulateur.site/outil/x/">'), "og:url égale la canonique");
assert(social.includes('<meta property="og:type" content="website">'), "og:type présent");
assert(social.includes('<meta property="og:site_name" content="Simulateur">'), "og:site_name présent");
assert(social.includes('<meta property="og:locale" content="fr_FR">'), "og:locale présent");
assert(social.includes('<meta name="twitter:card" content="summary">'), "twitter:card présent");
assert.equal(count(/og:image/g), 0, "aucune image déclarée");

const keep = run("<div></div>", SOCIAL_HEAD + '<meta property="og:title" content="Titre personnalisé">');
assert.equal((keep.match(/property="og:title"/g) || []).length, 1, "un og:title existant est respecté");
assert(keep.includes('content="Titre personnalisé"'), "valeur personnalisée conservée");
assert(keep.includes('property="og:url"'), "les balises manquantes sont tout de même ajoutées");

const dollar = run("<div></div>", SOCIAL_HEAD.replace("Calcul A", () => "Prix $& $1"));
assert(dollar.includes('content="Prix $&amp; $1 &amp; B'), "les motifs $ du titre sont insérés littéralement");

const bare = run("<div></div>", "<title>Sans description | Simulateur</title>");
assert.equal((bare.match(/og:|twitter:/g) || []).length, 0, "page sans description ni canonique : aucune balise de partage");

for (const family of ["outil", "conversion", "comparateur"]) {
  const outFamily = run("<button>Calculer</button><div class=\"result\"></div>", SOCIAL_HEAD, family);
  assert(outFamily.includes('<script src="/enter-calcul.js" defer></script>'), family + " reçoit le mécanisme Entrée commun");
}

const nonInteractive = run("<button>Accueil</button><div class=\"result\"></div>", SOCIAL_HEAD, "calculateurs");
assert(!nonInteractive.includes("/enter-calcul.js"), "une page non interactive ne reçoit pas le mécanisme Entrée");

console.log("normalize-layout tests passed.");
