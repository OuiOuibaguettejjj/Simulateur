import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import {chromium} from "playwright";

const server=spawn("python3",["-m","http.server","4175","--directory","public"],{stdio:"ignore"});
async function waitReady(){
  const deadline=Date.now()+10000;
  while(Date.now()<deadline){
    try{const response=await fetch("http://127.0.0.1:4175/outil/jours-ouvres/");if(response.status===200)return}
    catch{}
    await new Promise(resolve=>setTimeout(resolve,100));
  }
  throw new Error("Serveur HTTP non prêt après 10 s");
}
try{
  await waitReady();
  const browser=await chromium.launch({headless:true});
  for(const viewport of [{width:390,height:844},{width:1280,height:900}]){
    const page=await browser.newPage({viewport});
    const errors=[];
    page.on("pageerror",error=>errors.push(String(error)));
    await page.goto("http://127.0.0.1:4175/outil/jours-ouvres/",{waitUntil:"load"});
    assert.equal(await page.title(),"Calculateur de jours ouvrés entre deux dates | Simulateur");
    assert.equal(await page.locator("h1").innerText(),"Calculateur de jours ouvrés entre deux dates");
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),"débordement horizontal à "+viewport.width+" px");

    await page.locator("#date-debut").fill("13072026");
    await page.locator("#date-fin").fill("17072026");
    assert.equal(await page.locator("#date-debut").inputValue(),"13/07/2026","formatage automatique de la date de début");
    assert.equal(await page.locator("#date-fin").inputValue(),"17/07/2026","formatage automatique de la date de fin");
    await page.getByRole("button",{name:"Calculer les jours ouvrés"}).click();
    assert.match(await page.locator("#result").innerText(),/4 jours ouvrés/,"résultat de référence visible à "+viewport.width+" px");
    await page.locator("#date-fin").press("Enter");
    assert.match(await page.locator("#result").innerText(),/4 jours ouvrés/,"Entrée déclenche le calcul à "+viewport.width+" px");

    await page.locator("#date-debut").fill("31022026");
    await page.getByRole("button",{name:"Calculer les jours ouvrés"}).click();
    assert.match(await page.locator("#result").innerText(),/deux dates valides/,"date impossible refusée à "+viewport.width+" px");
    assert.deepEqual(errors,[],"aucune erreur JavaScript à "+viewport.width+" px");
    await page.close();
  }
  await browser.close();
  console.log("jours-ouvres browser : mobile, desktop, formatage des dates, résultat, Entrée et validation vérifiés.");
}finally{
  server.kill("SIGTERM");
}
