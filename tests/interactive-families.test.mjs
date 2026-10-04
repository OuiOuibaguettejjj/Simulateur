import assert from "node:assert/strict";
import {getInteractiveFamily,isInteractivePage,INTERACTIVE_FAMILIES} from "../scripts/interactive-families.mjs";

assert.deepEqual(INTERACTIVE_FAMILIES,["outil","conversion","comparateur"]);

for (const [path,family] of [
  ["outil/tva/index.html","outil"],
  ["conversion/donnees/index.html","conversion"],
  ["comparateur/prix-unitaire/index.html","comparateur"],
  ["comparateur/prix-unitaire\\index.html","comparateur"]
]) {
  assert.equal(getInteractiveFamily(path),family,path+" classée dans la bonne famille");
  assert.equal(isInteractivePage(path),true,path+" reconnue comme page interactive");
}

for (const path of [
  "index.html",
  "calculateurs/index.html",
  "simulateurs/index.html",
  "api/test/index.html",
  "outil/tva/not-index.html",
  "outil/index.html",
  "outil/tva/"
]) {
  assert.equal(getInteractiveFamily(path),null,path+" ne doit pas être classée interactive");
  assert.equal(isInteractivePage(path),false,path+" ne doit pas être interactive");
}

console.log("interactive-families tests passed.");
