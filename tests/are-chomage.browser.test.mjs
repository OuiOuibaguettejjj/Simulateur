import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import {chromium} from "playwright";

const port=4175;
const baseUrl="http://127.0.0.1:"+port;
const server=spawn("python3",["-m","http.server",String(port),"--directory","public"],{stdio:"ignore"});
let browser;
async function waitReady(){
 const deadline=Date.now()+10000;
 while(Date.now()<deadline){
  try{const response=await fetch(baseUrl+"/");if(response.status===200)return}catch{}
  await new Promise(resolve=>setTimeout(resolve,100));
 }
 throw new Error("Serveur de test ARE non prêt.");
}
try{
 await waitReady();
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 await page.goto(baseUrl+"/outil/are-chomage/",{waitUntil:"load"});
 await page.locator("#ref").fill("48000");
 await page.locator("#duree").fill("730");
 await page.getByRole("button",{name:"Calculer mon ARE estimée"}).click();
 let result=(await page.locator("#result").innerText()).replace(/[\u00a0\u202f]/g," ");
 assert.match(result,/39,74 € brut par jour/,"montant journalier arrondi");
 assert.match(result,/Allocation mensuelle indicative[\s\S]*1\s?192,20 € brut/,"mensuel calculé sur le journalier affiché");
 await page.locator("#ref").fill("60000");
 await page.locator(".button-main").click();
 result=(await page.locator("#result").innerText()).replace(/[\u00a0\u202f]/g," ");
 assert.match(result,/46,85 € brut par jour/,"recalcul journalier après modification des entrées");
 assert.match(result,/Allocation mensuelle indicative[\s\S]*1\s?405,50 € brut/,"recalcul mensuel après modification des entrées");
 assert.doesNotMatch(result,/Durée après coefficient/,"ne pas présenter une durée réglementaire simplifiée");
 await page.locator("#ref").fill("0");
 await page.locator(".button-main").click();
 assert.equal(await page.locator("#are-error").isVisible(),true,"une entrée invalide doit afficher une erreur");
 assert.match(await page.locator("#are-error").innerText(),/salaire de référence positif/i);
 result=(await page.locator("#result").innerText()).replace(/[\u00a0\u202f]/g," ");
 assert.match(result,/Votre estimation apparaîtra ici/i,"une entrée invalide neutralise le résultat précédent");
 assert.doesNotMatch(result,/46,85 € brut par jour|1\s?405,50 € brut/,"ne pas conserver une estimation obsolète après erreur");
 for(const width of [320,360,375,390,768,1280]){
  await page.setViewportSize({width,height:900});
  const layout=await page.evaluate(()=>({
   viewport:window.innerWidth,
   document:document.documentElement.scrollWidth,
   tool:document.querySelector(".tool").getBoundingClientRect().right,
   inputs:[...document.querySelectorAll("#are-form input")].map(el=>({left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right})),
   button:document.querySelector(".button-main").getBoundingClientRect()
  }));
  assert.ok(layout.document<=layout.viewport+1,"débordement horizontal à "+width+"px : "+JSON.stringify(layout));
  assert.ok(layout.tool<=layout.viewport+1,"calculateur hors écran à "+width+"px : "+JSON.stringify(layout));
  assert.ok(layout.inputs.every(input=>input.left>=-1&&input.right<=layout.viewport+1),"champ hors écran à "+width+"px : "+JSON.stringify(layout));
  assert.ok(layout.button.width>0&&layout.button.right<=layout.viewport+1,"bouton masqué à "+width+"px");
 }
 console.log("ARE navigateur : formule, arrondis journalier/mensuel, validation et responsive 320–1280 px vérifiés.");
}finally{
 if(browser)await browser.close();
 server.kill("SIGTERM");
}
