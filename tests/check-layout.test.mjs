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
h2 { margin: 0; }
.card > h3 { margin: 0; }
h4:hover { text-decoration: underline; }
</style>`;
assert.deepEqual(localHeadingOverrides(heading).sort(), [".card > h3", "h2", "h4:hover"]);

const safe = `
<style>
.h2 { margin: 0; }
.heading-card h2-title { margin: 0; }
.card { margin: 0; }
</style>`;
assert.deepEqual(localHeadingOverrides(safe), []);

console.log("check-layout guard tests passed.");
