import assert from "node:assert/strict";
import {AD_HOST_RE,IGNORED_CONSOLE_RE} from "../scripts/ad-filter.mjs";

assert.equal(AD_HOST_RE.test("pagead2.googlesyndication.com"),true);
assert.equal(AD_HOST_RE.test("securepubads.g.doubleclick.net"),true);
assert.equal(AD_HOST_RE.test("simulateur.site"),false);
assert.equal(AD_HOST_RE.test("googlesyndicationXcom"),false);
assert.equal(IGNORED_CONSOLE_RE.test("Failed to load https://static.cloudflareinsights.com/beacon.min.js"),true);
assert.equal(IGNORED_CONSOLE_RE.test("net::ERR_BLOCKED_BY_CLIENT"),true);
assert.equal(IGNORED_CONSOLE_RE.test("TypeError: x is not a function"),false);
console.log("ad-filter tests passed.");
