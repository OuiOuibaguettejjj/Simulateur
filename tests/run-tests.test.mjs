import assert from "node:assert/strict";
import fs from "node:fs";
import {STEPS,INDIRECT_TESTS} from "../scripts/run-tests.mjs";

// Garde-fou du point d'entrée unique : un test ou un contrôle oublié dans scripts/run-tests.mjs ne serait plus exécuté par la CI.
const ids=STEPS.map(s=>s.id);
assert.equal(new Set(ids).size,ids.length,"identifiants d'étapes dupliqués : "+ids.filter((id,i)=>ids.indexOf(id)!==i).join(", "));

for(const s of STEPS)assert.ok(fs.existsSync(s.file),s.id+" : fichier introuvable : "+s.file);

const referenced=new Set(STEPS.map(s=>s.file));
const orphans=fs.readdirSync("tests").filter(f=>/\.test\.(?:js|mjs)$/.test(f)).map(f=>"tests/"+f)
  .filter(f=>!referenced.has(f)&&!INDIRECT_TESTS.has(f));
assert.deepEqual(orphans,[],"tests jamais exécutés (à ajouter à STEPS dans scripts/run-tests.mjs) : "+orphans.join(", "));

for(const [test,parent] of INDIRECT_TESTS){
  assert.ok(fs.existsSync(test),"test indirect introuvable : "+test);
  assert.ok(referenced.has(parent),parent+" doit être une étape pour couvrir "+test);
  const name=test.slice("tests/".length);
  assert.ok(fs.readFileSync(parent,"utf8").includes('import("./'+name+'")'),parent+" n'importe plus "+name+" : il ne tourne plus nulle part");
}

// Un fichier qui importe Playwright doit être marqué browser:true, sinon --skip-browser et le message d'installation mentent.
for(const s of STEPS.filter(s=>s.file.endsWith(".mjs")||s.file.endsWith(".js"))){
  const usesPlaywright=/from\s+["']playwright["']|require\(\s*["']playwright["']\s*\)/.test(fs.readFileSync(s.file,"utf8"));
  assert.equal(Boolean(s.browser),usesPlaywright,s.id+" : browser:"+Boolean(s.browser)+" mais "+(usesPlaywright?"importe":"n'importe pas")+" Playwright");
}

console.log("run-tests : "+STEPS.length+" étapes, "+INDIRECT_TESTS.size+" tests indirects, aucun test orphelin.");
