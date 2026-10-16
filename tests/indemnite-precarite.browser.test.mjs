import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import {chromium} from "playwright";

const port=4176;
const baseUrl="http://127.0.0.1:"+port;
const server=spawn("python3",["-m","http.server",String(port),"--directory","public"],{stdio:"ignore"});
let browser;
async function waitReady(){
  const deadline=Date.now()+10000;
  while(Date.now()<deadline){
    try{const response=await fetch(baseUrl+"/");if(response.status===200)return}catch{}
    await new Promise(resolve=>setTimeout(resolve,100));
  }
  throw new Error("Serveur de test indemnité de précarité non prêt.");
}
try{
  await waitReady();
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  await page.goto(baseUrl+"/outil/indemnite-precarite/",{waitUntil:"load"});

  await page.getByRole("button",{name:"Calculer mon indemnité"}).click();
  assert.equal(await page.locator("#error").isVisible(),true,"une rémunération vide doit afficher une erreur");
  assert.match(await page.locator("#error").innerText(),/rémunération brute totale valide/i);
  assert.equal(await page.locator("#result").isVisible(),false,"aucun résultat ne doit être affiché pour une saisie vide");

  await page.locator("#gross").fill("20000");
  await page.locator("#gross").press("Enter");
  let result=(await page.locator("#result").innerText()).replace(/[\u00a0\u202f]/g," ");
  assert.match(result,/2\s?000,00\s?€/,"Entrée doit déclencher le calcul à 10 %");
  assert.equal(await page.locator("#error").isVisible(),false,"l'erreur doit disparaître après une saisie valide");

  await page.locator("#rate").selectOption("6");
  await page.locator(".button-main").click();
  result=(await page.locator("#result").innerText()).replace(/[\u00a0\u202f]/g," ");
  assert.match(result,/1\s?200,00\s?€/,"le taux CDD de 6 % doit calculer 1 200 € sur 20 000 €");

  await page.locator("#contract").selectOption("interim");
  assert.equal(await page.locator("#rate-wrap").isHidden(),true,"le taux de 6 % ne doit pas être sélectionnable pour l'intérim");
  await page.locator(".button-main").click();
  result=(await page.locator("#result").innerText()).replace(/[\u00a0\u202f]/g," ");
  assert.match(result,/2\s?000,00\s?€/,"l'intérim doit rétablir le taux de 10 %");

  await page.locator("#gross").fill("-1");
  await page.locator(".button-main").click();
  assert.equal(await page.locator("#error").isVisible(),true,"une rémunération négative doit être refusée");
  assert.equal(await page.locator("#result").isVisible(),false,"une saisie invalide ne doit pas laisser un ancien résultat visible");

  for(const width of [320,360,375,390,768,1280]){
    await page.setViewportSize({width,height:900});
    const layout=await page.evaluate(()=>({
      viewport:window.innerWidth,
      document:document.documentElement.scrollWidth,
      tool:document.querySelector(".tool").getBoundingClientRect().right,
      inputs:[...document.querySelectorAll("#form input, #form select")].map(el=>({left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right})),
      button:document.querySelector(".button-main").getBoundingClientRect()
    }));
    assert.ok(layout.document<=layout.viewport+1,"débordement horizontal à "+width+"px : "+JSON.stringify(layout));
    assert.ok(layout.tool<=layout.viewport+1,"calculateur hors écran à "+width+"px : "+JSON.stringify(layout));
    assert.ok(layout.inputs.every(input=>input.left>=-1&&input.right<=layout.viewport+1),"champ hors écran à "+width+"px : "+JSON.stringify(layout));
    assert.ok(layout.button.width>0&&layout.button.right<=layout.viewport+1,"bouton masqué à "+width+"px");
  }
  console.log("indemnite-precarite navigateur : saisie vide/négative, Entrée, taux CDD/intérim et responsive 320–1280 px vérifiés.");
}finally{
  if(browser)await browser.close();
  server.kill("SIGTERM");
}
