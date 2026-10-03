import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Génère public/parametres.js à partir de data/parametres.json (source de vérité, non servie).
// --check : échoue si le fichier commité diffère de la sortie canonique (même principe que le sitemap).

export const SOURCE = "data/parametres.json";
export const TARGET = "public/parametres.js";

function deepSort(value) {
  if (Array.isArray(value)) return value.map(deepSort);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, deepSort(value[key])]));
  }
  return value;
}

export function buildParamsJs(data) {
  const runtime = {};
  for (const id of Object.keys(data.sets).sort()) {
    const set = data.sets[id];
    runtime[id] = {
      label: set.label,
      year: set.year,
      effectiveFrom: set.effectiveFrom,
      effectiveTo: set.effectiveTo,
      verifiedOn: set.verifiedOn,
      source: { label: set.source.label, url: set.source.url },
      values: deepSort(set.values)
    };
  }
  return [
    "/* Fichier généré par scripts/generate-params.mjs à partir de data/parametres.json. Ne pas modifier à la main. */",
    "(function (root) {",
    "  function freeze(o) {",
    "    if (o && typeof o === \"object\" && !Object.isFrozen(o)) {",
    "      Object.freeze(o);",
    "      Object.keys(o).forEach(function (k) { freeze(o[k]); });",
    "    }",
    "    return o;",
    "  }",
    "  var SETS = freeze(" + JSON.stringify(runtime, null, 2).replace(/\n/g, "\n  ") + ");",
    "  root.Parametres = {",
    "    ids: function () { return Object.keys(SETS); },",
    "    get: function (id) {",
    "      if (!Object.prototype.hasOwnProperty.call(SETS, id)) throw new Error(\"Paramètres réglementaires inconnus : \" + id);",
    "      return SETS[id];",
    "    },",
    "    isEffective: function (id, asOf) {",
    "      var set = this.get(id);",
    "      var day = asOf || new Date().toISOString().slice(0, 10);",
    "      return day >= set.effectiveFrom && day <= set.effectiveTo;",
    "    }",
    "  };",
    "})(typeof window !== \"undefined\" ? window : globalThis);",
    ""
  ].join("\n");
}

export function readParams(root = process.cwd()) {
  return JSON.parse(fs.readFileSync(path.join(root, SOURCE), "utf8"));
}

function main() {
  const check = process.argv.includes("--check");
  const expected = buildParamsJs(readParams());
  const file = path.join(process.cwd(), TARGET);
  const current = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
  if (current === expected) {
    console.log(TARGET + " est à jour.");
    return;
  }
  if (check) {
    console.error(TARGET + " ne correspond pas à " + SOURCE + ". Lancer : node scripts/generate-params.mjs");
    process.exit(1);
  }
  fs.writeFileSync(file, expected);
  console.log(TARGET + " généré.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
