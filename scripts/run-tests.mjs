#!/usr/bin/env node
// Point d'entrée unique des contrôles du dépôt.
//   npm test                      tout lancer (comme la CI), lister TOUS les échecs à la fin
//   npm run test:fast             sans les étapes qui ont besoin de Chromium
//   npm test -- --only=smoke      une étape, un groupe ou un fragment d'identifiant
//   npm test -- --list            voir les étapes
// La CI (.github/workflows/tests.yml) appelle ce même script : ce qui passe ici passe là-bas.
// Pour ajouter un test : l'ajouter à STEPS ci-dessous (tests/run-tests.test.mjs vérifie qu'aucun n'est oublié).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {fileURLToPath,pathToFileURL} from "node:url";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const STEP_TIMEOUT_MS=300_000;
const BASELINE="scripts/check-pages.baseline.json";

// Champs : id, group, file + args (commande node) ou run (fonction),
// browser (a besoin de Chromium), pr (seulement sur pull request), base (a besoin de CHECK_PAGES_BASE_REF),
// warn (n'échoue jamais : l'écart est signalé en avertissement).
const step=(id,group,file,args=[],opts={})=>({id,group,file,args,...opts});

export const STEPS=[
  step("security","static","scripts/check-security.mjs"),
  step("sitemap-canonique","static","scripts/generate-sitemap.mjs",["--check"]),
  step("layout-canonique","static","scripts/normalize-layout.mjs",["--check"]),
  step("adsense-canonique","static","scripts/prepare-adsense.mjs",["--check"]),
  step("sitemap-test","static","tests/sitemap.test.mjs"),
  step("site-statique","static","scripts/check-static-site.mjs"),
  step("layout-garde-test","static","tests/check-layout.test.mjs"),
  step("layout","static","scripts/check-layout.mjs"),

  step("donation","unit","tests/donation.test.mjs"),
  step("ifi","unit","tests/ifi.test.js"),
  step("impot","unit","tests/impot.test.js"),
  step("rsa","unit","tests/rsa.test.js"),
  step("retraite","unit","tests/retraite.test.js"),
  step("age-retraite","unit","tests/age-retraite.test.js"),
  step("age-retraite-seo","unit","tests/age-retraite-seo.test.js"),
  step("simulateurs","unit","tests/simulateurs.test.js"),
  step("salaire-horaire","unit","tests/salaire-horaire.test.mjs"),
  step("salaire-brut-net","unit","tests/salaire-brut-net.test.js"),
  step("smic","unit","tests/smic.test.mjs"),
  step("ptz","unit","tests/ptz.test.mjs"),
  step("ad-filter","unit","tests/ad-filter.test.mjs"),
  step("invalid-result","unit","tests/invalid-result.test.mjs"),
  step("jours-ouvres","unit","tests/jours-ouvres.test.mjs"),
  step("jours-ouvres-browser","browser","tests/jours-ouvres.browser.test.mjs",[],{browser:true}),

  step("smoke-results","browser","tests/smoke-results.test.mjs",[],{browser:true}),
  step("interets-composes","browser","tests/interets-composes.test.mjs",[],{browser:true}),
  step("smoke-site","browser","scripts/smoke-site.mjs",["--base-url","http://127.0.0.1:4173","--mode","local"],{browser:true}),
  step("promotions-navigateur","browser","tests/promotions-browser.test.mjs",[],{browser:true}),
  step("cash-flow-navigateur","browser","tests/cash-flow-immobilier.browser.test.mjs",[],{browser:true}),

  step("ratio","unit","tests/ratio.test.mjs"),
  step("calculs-generiques","unit","tests/generic-calcs.test.mjs"),
  step("signe-astrologique","unit","tests/signe-astrologique.test.mjs"),
  step("references-sourcees","unit","tests/reference-calcs.test.mjs"),
  step("rendement-locatif","unit","tests/rendement-locatif.test.mjs"),

  step("parametres-test","params","tests/params.test.mjs"),
  step("parametres-generes","params","scripts/generate-params.mjs",["--check"]),
  step("parametres-validite","params","scripts/check-params.mjs"),
  step("parametres-horizon-60j","params","scripts/check-params.mjs",["--horizon","60"],{warn:true}),

  step("check-pages-test","pages","tests/check-pages.test.mjs"),
  step("baseline-regeneree","pages",BASELINE,[],{pr:true,run:baselineRegeneration}),
  step("layout-normalisation-test","pages","tests/normalize-layout.test.mjs"),
  step("familles-interactives-test","pages","tests/interactive-families.test.mjs"),
  step("workflow-deploy-test","pages","tests/deploy-workflow.test.mjs"),
  step("runner-couverture-test","pages","tests/run-tests.test.mjs"),
  step("contrat-pages-modifiees","pages","scripts/check-pages.mjs",["--check-changed-contract"],{pr:true,base:true}),
  step("cliquet-pages","pages","scripts/check-pages.mjs",["--ratchet","--check-changed-contract"],{base:true})
];

// Tests lancés par un autre test (tests/generic-calcs.test.mjs les importe) : pas d'étape propre.
export const INDIRECT_TESTS=new Map([
  ["tests/epargne-mensuelle.test.mjs","tests/generic-calcs.test.mjs"],
  ["tests/remise.test.mjs","tests/generic-calcs.test.mjs"],
  ["tests/temps-calcul.test.mjs","tests/generic-calcs.test.mjs"],
  ["tests/promotions.test.mjs","tests/generic-calcs.test.mjs"],
  ["tests/cash-flow-immobilier.test.mjs","tests/generic-calcs.test.mjs"]
]);

function run(cmd,args,env={}){
  const r=spawnSync(cmd,args,{cwd:ROOT,encoding:"utf8",maxBuffer:256*1024*1024,timeout:STEP_TIMEOUT_MS,env:{...process.env,...env}});
  let output=(r.stdout||"")+(r.stderr||"");
  let status=r.status;
  if(r.error){status=1;output+="\n"+(r.error.code==="ETIMEDOUT"?"Délai dépassé ("+STEP_TIMEOUT_MS/1000+" s).":String(r.error.message))}
  else if(r.signal){status=1;output+="\nProcessus interrompu par "+r.signal+"."}
  return {status,output};
}

// Régénère la baseline depuis celle de main et vérifie qu'elle est identique à celle de la PR.
function baselineRegeneration(){
  const file=path.join(ROOT,BASELINE);
  const expected=fs.readFileSync(file,"utf8");
  const show=spawnSync("git",["show","origin/main:"+BASELINE],{cwd:ROOT,encoding:"utf8",maxBuffer:64*1024*1024});
  if(show.status!==0)return {status:1,output:"git show origin/main:"+BASELINE+" impossible : "+(show.stderr||"").trim()};
  try{
    fs.writeFileSync(file,show.stdout);
    const update=run(process.execPath,["scripts/check-pages.mjs","--update-baseline"]);
    if(update.status!==0)return update;
    const regenerated=fs.readFileSync(file,"utf8");
    if(regenerated===expected)return update;
    const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"baseline-"));
    const a=path.join(tmp,"baseline.attendue.json"),b=path.join(tmp,"baseline.regeneree.json");
    fs.writeFileSync(a,expected);fs.writeFileSync(b,regenerated);
    const diff=spawnSync("diff",["-u",a,b],{encoding:"utf8"});
    fs.rmSync(tmp,{recursive:true,force:true});
    return {status:1,output:update.output+"\n"+(diff.stdout||"La baseline régénérée diffère de celle de la PR.")};
  }finally{fs.writeFileSync(file,expected)}
}

function resolveBaseRef(){
  if(process.env.CHECK_PAGES_BASE_REF)return process.env.CHECK_PAGES_BASE_REF;
  if(process.env.GITHUB_ACTIONS)return null;
  for(const ref of ["origin/main","main"]){
    const r=spawnSync("git",["merge-base","HEAD",ref],{cwd:ROOT,encoding:"utf8"});
    if(r.status===0&&r.stdout.trim())return r.stdout.trim();
  }
  return null;
}

function playwrightAvailable(){try{import.meta.resolve("playwright");return true}catch{return false}}

function parseArgs(argv){
  const opts={list:false,only:null,skipBrowser:false,failFast:false,pr:process.env.GITHUB_EVENT_NAME==="pull_request",help:false};
  for(const arg of argv){
    if(arg==="--list")opts.list=true;
    else if(arg==="--skip-browser")opts.skipBrowser=true;
    else if(arg==="--fail-fast")opts.failFast=true;
    else if(arg==="--pr")opts.pr=true;
    else if(arg==="--help"||arg==="-h")opts.help=true;
    else if(arg.startsWith("--only="))opts.only=arg.slice(7).split(",").map(s=>s.trim()).filter(Boolean);
    else throw new Error("Option inconnue : "+arg+" (voir --help)");
  }
  return opts;
}

const HELP=`Usage : node scripts/run-tests.mjs [options]   (ou npm test -- [options])
  --list            lister les étapes et quitter
  --only=a,b        n'exécuter que ces étapes : identifiant, fragment d'identifiant ou groupe (static, unit, browser, params, pages)
  --skip-browser    ignorer les étapes qui nécessitent Chromium (hors CI)
  --fail-fast       s'arrêter à la première étape en échec (par défaut : tout exécuter puis tout lister)
  --pr              exécuter aussi les contrôles réservés aux pull requests (nécessite origin/main)
Environnement : CHECK_PAGES_BASE_REF (sinon : merge-base avec origin/main).`;

function selected(opts){
  if(!opts.only)return STEPS;
  const picked=STEPS.filter(s=>opts.only.some(q=>s.group===q||s.id===q||s.id.includes(q)));
  if(!picked.length)throw new Error("Aucune étape ne correspond à --only="+opts.only.join(","));
  return picked;
}

function main(){
  let opts;
  try{opts=parseArgs(process.argv.slice(2))}catch(error){console.error(error.message);process.exit(2)}
  if(opts.help){console.log(HELP);return}
  let steps;
  try{steps=selected(opts)}catch(error){console.error(error.message);process.exit(2)}
  if(opts.list){
    for(const s of steps)console.log(s.id.padEnd(30)+s.group.padEnd(9)+[s.browser&&"chromium",s.pr&&"PR seulement",s.base&&"base git",s.warn&&"avertissement"].filter(Boolean).join(", "));
    return;
  }

  const ci=Boolean(process.env.GITHUB_ACTIONS);
  const baseRef=resolveBaseRef();
  const hasPlaywright=playwrightAvailable();
  const results=[];
  const started=Date.now();

  for(const s of steps){
    let result;
    if(s.pr&&!opts.pr)result={state:"skip",reason:"réservé aux pull requests (option --pr)"};
    else if(s.browser&&opts.skipBrowser&&!ci)result={state:"skip",reason:"--skip-browser"};
    else if(s.browser&&!hasPlaywright)result={state:"fail",output:"Le paquet « playwright » est introuvable. Installer avec : npm install && npx playwright install chromium (ou lancer npm run test:fast)."};
    else if(s.base&&!baseRef)result=ci?{state:"fail",output:"CHECK_PAGES_BASE_REF est requis en CI."}:{state:"skip",reason:"aucune base git (origin/main introuvable, CHECK_PAGES_BASE_REF absent)"};
    else{
      const t=Date.now();
      const r=s.run?s.run():run(process.execPath,[s.file,...s.args],s.base?{CHECK_PAGES_BASE_REF:baseRef}:{});
      const seconds=(Date.now()-t)/1000;
      if(r.status===0)result={state:"ok",seconds,output:r.output};
      else if(s.warn)result={state:"warn",seconds,output:r.output};
      else result={state:"fail",seconds,output:r.output};
    }
    results.push({step:s,...result});
    report(s,result,ci);
    if(result.state==="fail"&&opts.failFast)break;
  }

  const failed=results.filter(r=>r.state==="fail");
  const warned=results.filter(r=>r.state==="warn");
  const skipped=results.filter(r=>r.state==="skip");
  const total=(Date.now()-started)/1000;
  const slowest=[...results].filter(r=>r.seconds).sort((a,b)=>b.seconds-a.seconds).slice(0,5);
  console.log("\n"+"─".repeat(60));
  console.log(results.length-failed.length-warned.length-skipped.length+" réussie(s), "+failed.length+" en échec, "+warned.length+" avertissement(s), "+skipped.length+" ignorée(s) — "+total.toFixed(1)+" s");
  if(slowest.length)console.log("Plus lentes : "+slowest.map(r=>r.step.id+" "+r.seconds.toFixed(1)+" s").join(" · "));
  for(const r of skipped)console.log("  ignorée  "+r.step.id+" : "+r.reason);
  if(failed.length){
    console.log("\nÉchecs :");
    for(const r of failed)console.log("  ✖ "+r.step.id+"   →   npm test -- --only="+r.step.id);
  }
  if(process.env.GITHUB_STEP_SUMMARY){
    const rows=results.map(r=>"| "+r.step.id+" | "+r.step.group+" | "+({ok:"✅",fail:"❌",warn:"⚠️",skip:"⏭️"}[r.state])+" | "+(r.seconds?r.seconds.toFixed(1)+" s":"")+" |");
    try{fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,"### Contrôles\n\n| Étape | Groupe | Résultat | Durée |\n|---|---|---|---:|\n"+rows.join("\n")+"\n\nTotal : "+total.toFixed(1)+" s\n")}catch{}
  }
  process.exit(failed.length?1:0);
}

function report(s,result,ci){
  const time=result.seconds!==undefined?(result.seconds.toFixed(1)+" s").padStart(7):"       ";
  if(result.state==="ok")console.log("  ✔ "+time+"  "+s.id);
  else if(result.state==="skip")console.log("  – "+time+"  "+s.id+" (ignorée)");
  else if(result.state==="warn"){
    console.log("  ⚠ "+time+"  "+s.id+" (avertissement, non bloquant)");
    for(const line of result.output.split(/\r?\n/).filter(l=>/ERREUR \[horizon\]/.test(l)))console.log(ci?"::warning::"+line:"      "+line);
  }else{
    console.log("  ✖ "+time+"  "+s.id);
    if(ci)console.log("::error title=Échec : "+s.id+"::voir le journal de l'étape « "+s.id+" »");
    const text=(result.output||"").trimEnd();
    if(text)console.log(text.split(/\r?\n/).map(l=>"      │ "+l).join("\n"));
  }
}

if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url)main();
