import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import {chromium} from "playwright";

const server=spawn("python3",["-m","http.server","4174","--directory","public"],{stdio:"ignore"});
async function waitReady(){
  const deadline=Date.now()+10000;
  while(Date.now()<deadline){
    try{const response=await fetch("http://127.0.0.1:4174/outil/interets-composes/");if(response.status===200)return}
    catch{}
    await new Promise(resolve=>setTimeout(resolve,100));
  }
  throw new Error("Serveur HTTP non prêt après 10 s");
}
const amount=async locator=>(await locator.innerText()).replace(/[^\d]/g,"");
try{
  await waitReady();
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage();
  await page.goto("http://127.0.0.1:4174/outil/interets-composes/",{waitUntil:"load"});
  await page.locator("#capital").fill("0");
  await page.locator("#versement").fill("100");
  await page.locator("#rendement").fill("12");
  await page.locator("#duree").fill("1");
  await page.locator("details").first().locator("summary").click();
  await page.locator("#frais").fill("0");
  await page.locator("#hausse").fill("0");
  await page.locator("#inflation").fill("0");
  await page.locator("#frequence").selectOption("annual");
  assert.equal(await amount(page.locator("#final")),"1266","les versements mensuels doivent être rémunérés au prorata avant la capitalisation annuelle");
  assert.equal(await amount(page.locator("#paid")),"1200","le total versé doit rester égal à 12 versements de 100 €");
  assert.ok(await page.locator("#chart path.capital-line").count()>0,"le graphique doit être tracé après un calcul valide");

  await page.locator("#frequence").selectOption("monthly");
  assert.equal(await amount(page.locator("#final")),"1268","la composition mensuelle doit capitaliser les intérêts à chaque mois");
  await page.locator("#frequence").selectOption("never");
  assert.equal(await amount(page.locator("#final")),"1266","les intérêts simples doivent rémunérer chaque versement au prorata sans capitaliser les intérêts");
  await page.locator("#frequence").selectOption("annual");

  await page.locator("#rendement").fill("100.1");
  await page.locator("#calculate").click();
  assert.equal((await page.locator("#final").innerText()).trim(),"Valeurs invalides","un rendement supérieur à 100 % doit être refusé");
  assert.equal((await page.locator("#gains").innerText()).trim(),"—","les anciens résultats ne doivent pas rester affichés");
  assert.equal((await page.locator("#paid").innerText()).trim(),"—","le total versé précédent doit être effacé");
  assert.equal(await page.locator("#chart path.capital-line").count(),0,"le graphique précédent doit être effacé après une entrée invalide");
  assert.equal((await page.locator("#breakdown").innerText()).trim(),"","le tableau précédent doit être effacé après une entrée invalide");

  await page.locator("#rendement").fill("7");
  await page.locator("#duree").fill("1.5");
  await page.locator("#calculate").click();
  assert.equal((await page.locator("#final").innerText()).trim(),"Valeurs invalides","une durée fractionnaire ne doit pas produire un résultat tronqué à la dernière année complète");
  assert.equal((await page.locator("#paid").innerText()).trim(),"—","les montants précédents doivent être effacés pour une durée invalide");
  await browser.close();
  console.log("Intérêts composés : capitalisation annuelle, total versé, rendement hors limite et effacement des résultats précédents vérifiés.");
}finally{
  server.kill("SIGTERM");
}
