import assert from "node:assert/strict";
import { checkPageLastmod, normalizePageForLastmod, routeFromHtmlPath } from "../scripts/check-lastmod.mjs";

const baseRoutes = { "/outil/exemple/": "2026-10-03" };

assert.equal(routeFromHtmlPath("public/index.html"), "/");
assert.equal(routeFromHtmlPath("public/outil/exemple/index.html"), "/outil/exemple/");
assert.equal(routeFromHtmlPath("public/styles.css"), null);

assert.deepEqual(
  checkPageLastmod({
    file: "public/outil/exemple/index.html",
    baseHtml: "<title>Avant</title><main>Texte</main>",
    currentHtml: "<title>Après</title><main>Texte</main>",
    baseRoutes,
    currentRoutes: { ...baseRoutes }
  }).length,
  1,
  "une modification HTML éditoriale sans changement de lastmod échoue"
);

assert.deepEqual(
  checkPageLastmod({
    file: "public/outil/exemple/index.html",
    baseHtml: '<head><title>Exemple</title><meta property="og:title" content="Avant"></head><main>Texte</main>',
    currentHtml: '<head><title>Exemple</title><meta property="og:title" content="Après"></head><main>Texte</main>',
    baseRoutes,
    currentRoutes: { ...baseRoutes }
  }),
  [],
  "une modification uniquement Open Graph ne requiert pas de changement de lastmod"
);

assert.deepEqual(
  checkPageLastmod({
    file: "public/outil/exemple/index.html",
    baseHtml: "<title>Avant</title><main>Texte</main>",
    currentHtml: "<title>Après</title><main>Texte</main>",
    baseRoutes,
    currentRoutes: { "/outil/exemple/": "2026-10-14" }
  }),
  [],
  "une modification éditoriale avec date lastmod actualisée passe"
);

assert.deepEqual(
  checkPageLastmod({
    file: "public/outil/exemple/index.html",
    baseHtml: "<title>Avant</title><main>Texte</main>",
    currentHtml: "<title>Après</title><main>Texte</main>",
    baseRoutes: { "/outil/exemple/": "2026-10-16" },
    currentRoutes: { "/outil/exemple/": "2026-10-16" },
    today: "2026-10-16"
  }),
  [],
  "une modification éditoriale le même jour peut conserver la date lastmod du jour"
);

assert.deepEqual(
  checkPageLastmod({
    file: "public/outil/exemple/index.html",
    baseHtml: "<title>Avant</title><main>Texte</main>",
    currentHtml: "<title>Après</title><main>Texte</main>",
    baseRoutes: { "/outil/exemple/": "2026-10-15" },
    currentRoutes: { "/outil/exemple/": "2026-10-15" },
    today: "2026-10-16"
  }).length,
  1,
  "une modification éditoriale ancienne sans changement de lastmod échoue toujours"
);

assert.equal(
  normalizePageForLastmod('<meta name="twitter:card" content="summary"><p>Texte</p>'),
  "<p>Texte</p>"
);

console.log("Lastmod guard tests passed.");
