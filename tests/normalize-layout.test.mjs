import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const script = path.resolve("scripts/normalize-layout.mjs");
const page = (body) => '<!doctype html><html lang="fr"><head><meta charset="utf-8"></head><body><main>' + body + "</main></body></html>";

function run(body) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "normalize-layout-"));
  try {
    const dir = path.join(tmp, "public", "outil", "x");
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, "index.html");
    fs.writeFileSync(file, page(body));
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
console.log("normalize-layout tests passed.");