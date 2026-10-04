import fs from "node:fs";
import assert from "node:assert/strict";

const workflow = fs.readFileSync(".github/workflows/deploy.yml", "utf8");
const staticCheck = fs.readFileSync("scripts/check-static-site.mjs", "utf8");

assert.match(workflow, /run: node scripts\/check-static-site\.mjs/);
assert.match(workflow, /run: node scripts\/check-layout\.mjs/);
for (const test of [
  "tests/smoke-results.test.mjs",
  "tests/generic-calcs.test.mjs",
  "tests/reference-calcs.test.mjs",
  "tests/check-pages.test.mjs",
  "tests/normalize-layout.test.mjs",
  "tests/interactive-families.test.mjs",
  "tests/deploy-workflow.test.mjs"
]) {
  assert.match(workflow, new RegExp(test.replaceAll(".", "\\.")), `deploy.yml doit exécuter ${test}`);
}

assert.match(staticCheck, /from ['"]\.\/interactive-families\.mjs['"]/);
assert.doesNotMatch(staticCheck, /from ['"]\.\/scripts\/interactive-families\.mjs['"]/);
assert.match(staticCheck, /isInteractivePage\(/);

console.log("deploy workflow shared validation tests passed.");
