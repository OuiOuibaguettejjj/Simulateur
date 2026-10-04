import fs from "node:fs";
import {spawnSync} from "node:child_process";
import assert from "node:assert/strict";

const workflow = fs.readFileSync(".github/workflows/deploy.yml", "utf8");
const staticCheck = fs.readFileSync("scripts/check-static-site.mjs", "utf8");
const blocks=[...workflow.matchAll(/^\s+node(?: --input-type=module)? <<'NODE'\n([\s\S]*?)^\s+NODE$/gm)].map(m=>m[1].split("\n").map(line=>line.replace(/^ {10}/,"")).join("\n"));
assert.equal(blocks.length,6,"nombre inattendu de blocs Node inline dans deploy.yml");
const moduleBlocks=blocks.filter(block=>/^import /m.test(block));
assert.equal(moduleBlocks.length,3,"les trois blocs modifiés du contrôle transversal doivent être ESM");
for(const block of moduleBlocks){
  assert.doesNotMatch(block,/\brequire\s*\(/,"un bloc ESM de deploy.yml ne doit pas utiliser require()");
  const check=spawnSync(process.execPath,["--input-type=module","--check"],{input:block,encoding:"utf8"});
  assert.equal(check.status,0,check.stderr||"syntaxe ESM invalide");
}
const interactiveBlocks=blocks.filter(block=>block.includes("isInteractivePage("));
assert.equal(interactiveBlocks.length,2,"les deux blocs utilisant isInteractivePage doivent être contrôlés");
for(const block of interactiveBlocks){
  assert.match(block,/import \{ isInteractivePage \} from ['"]\.\/scripts\/interactive-families\.mjs['"]/);
  assert.match(block,/isInteractivePage\(/);
}

assert.match(workflow, /run: node scripts\/check-static-site\.mjs/);
assert.match(workflow, /run: node scripts\/check-layout\.mjs/);
for (const test of [
  "tests/smoke-results.test.mjs",
  "tests/generic-calcs.test.mjs",
  "tests/reference-calcs.test.mjs",
  "tests/check-pages.test.mjs",
  "tests/normalize-layout.test.mjs",
  "tests/interactive-families.test.mjs",
  "tests/deploy-workflow.test.mjs",
  "tests/sitemap.test.mjs",
  "tests/ad-filter.test.mjs",
  "tests/invalid-result.test.mjs"
]) {
  assert.match(workflow, new RegExp(test.replaceAll(".", "\\.")), `deploy.yml doit exécuter ${test}`);
}

assert.match(staticCheck, /from ['"]\.\/interactive-families\.mjs['"]/);
assert.doesNotMatch(staticCheck, /from ['"]\.\/scripts\/interactive-families\.mjs['"]/);
assert.match(staticCheck, /isInteractivePage\(/);

console.log("deploy workflow validation tests passed.");
