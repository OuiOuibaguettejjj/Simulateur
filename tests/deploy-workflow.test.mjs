import fs from "node:fs";
import {spawnSync} from "node:child_process";
import assert from "node:assert/strict";

const workflow=fs.readFileSync(".github/workflows/deploy.yml","utf8");
const blocks=[...workflow.matchAll(/^\s+node(?: --input-type=module)? <<'NODE'\n([\s\S]*?)^\s+NODE$/gm)].map(m=>m[1].split("\n").map(line=>line.replace(/^ {10}/,"")).join("\n"));
assert.equal(blocks.length,6,"nombre inattendu de blocs Node inline dans deploy.yml");

const moduleBlocks=blocks.filter(block=>/^import /m.test(block));
assert.equal(moduleBlocks.length,3,"les trois blocs modifiés du contrôle transversal doivent être ESM");
for(const block of moduleBlocks){
  assert.doesNotMatch(block,/\brequire\s*\(/,"un bloc ESM de deploy.yml ne doit pas utiliser require()");
  const check=spawnSync(process.execPath,["--input-type=module","--check"],{input:block,encoding:"utf8"});
  assert.equal(check.status,0,check.stderr||"syntaxe ESM invalide");
}
const staticGuard=moduleBlocks.find(block=>block.includes("isInteractivePage"));
assert(staticGuard,"le garde de cohérence doit importer isInteractivePage");
assert.match(staticGuard,/import \{ isInteractivePage \} from ['"]\.\/scripts\/interactive-families\.mjs['"]/);
assert.match(staticGuard,/isInteractivePage\(/);

console.log("deploy workflow inline Node syntax tests passed.");
