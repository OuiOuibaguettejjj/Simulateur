import assert from "node:assert/strict";
import { validateLastmodData } from "../scripts/generate-sitemap.mjs";

const valid = {
  schemaVersion: 1,
  routes: {
    "/": "2026-10-03",
    "/retraite/": "2026-09-28"
  }
};
const pages = ["/", "/retraite/"];

assert.deepEqual(validateLastmodData(valid, pages, "2026-10-03"), [], "cas valide");

assert.ok(
  validateLastmodData(
    { schemaVersion: 1, routes: { "/": "2026-10-03" } },
    ["/", "/retraite/"],
    "2026-10-03"
  ).some(error => error.includes("sans entrée lastmod")),
  "route sans entrée"
);

assert.ok(
  validateLastmodData(
    { schemaVersion: 1, routes: { "/": "2026-10-03", "/absente/": "2026-10-03" } },
    ["/"],
    "2026-10-03"
  ).some(error => error.includes("orpheline")),
  "entrée orpheline"
);

assert.ok(
  validateLastmodData(
    { schemaVersion: 1, routes: { "/": "2026-02-30", "/retraite/": "2026-09-28" } },
    pages,
    "2026-10-03"
  ).some(error => error.includes("Date lastmod invalide")),
  "date invalide"
);

assert.ok(
  validateLastmodData(
    { schemaVersion: 1, routes: { "/": "2026-10-05", "/retraite/": "2026-09-28" } },
    pages,
    "2026-10-03"
  ).some(error => error.includes("future")),
  "date future au-delà de demain"
);

assert.ok(
  validateLastmodData(valid, ["/", "/"], "2026-10-03").some(error => error.includes("Route dupliquée")),
  "route dupliquée"
);

assert.deepEqual(
  validateLastmodData(
    { schemaVersion: 1, routes: { "/": "2026-10-04", "/retraite/": "2026-09-28" } },
    pages,
    "2026-10-03"
  ),
  [],
  "demain UTC reste autorisé"
);

console.log("Sitemap lastmod tests passed.");
