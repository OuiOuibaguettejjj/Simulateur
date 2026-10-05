import assert from "node:assert/strict";
import { sharedOverrides, localHeadingOverrides } from "../scripts/check-layout.mjs";

const shared = `
<style>
.content-section h2 { margin-top: 2rem; }
.calculator-faq>h2 { margin: 0; }
</style>`;
assert.deepEqual(sharedOverrides(shared).sort(), [".calculator-faq>h2", ".content-section h2"]);

const heading = `
<style>
.data-content h2 { margin: 0; }
.tool h2 { margin: 0; }
h2 { margin: 0; }
section.content-section h2 { margin: 0; }
.content-section h2 { margin: 0; }
.calculator-faq > h3 { margin: 0; }
.card > h3 { margin: 0; }
h4:hover { text-decoration: underline; }
</style>`;
assert.deepEqual(localHeadingOverrides(heading).sort(), [
  ".calculator-faq > h3",
  ".content-section h2",
  ".data-content h2",
  ".tool h2",
  ".card > h3",
  "h2",
  "h4:hover",
  "section.content-section h2"
].sort());

const safe = `
<style>
.h2 { margin: 0; }
.heading-card h2-title { margin: 0; }
.card { margin: 0; }
</style>`;
assert.deepEqual(localHeadingOverrides(safe), []);

console.log("check-layout guard tests passed.");
