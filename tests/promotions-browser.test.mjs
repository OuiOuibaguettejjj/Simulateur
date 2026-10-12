import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import {chromium} from "playwright";

const port=4174;
const baseUrl="http://127.0.0.1:"+port;
const server=spawn("python3",["-m","http.server",String(port),"--directory","public"],{stdio:"ignore"});
let browser;
async function waitReady(){
 const deadline=Date.now()+10000;
 while(Date.now()<deadline){
  try{const response=await fetch(baseUrl+"/");if(response.status===200)return}catch{}
  await new Promise(resolve=>setTimeout(resolve,100));
 }
 throw new Error("Serveur de test non prêt.");
}
try{
 await waitReady();
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 await page.goto(baseUrl+"/outil/promotions/",{waitUntil:"load"});
 assert.equal(await page.title(),"Calculateur de promotions : comparer deux offres | Simulateur");
 await page.locator("#pA").fill("2,50");
 await page.locator("#qA").fill("2");
 await page.locator("#tA").fill("4,50");
 await page.locator("#pB").fill("3");
 await page.locator("#qB").fill("2");
 await page.locator("#tB").fill("5");
 await page.locator("#tA").press("Enter");
 let result=(await page.locator("#result").innerText()).replace(/[\u00a0\u202f]/g," ");
 assert.match(result,/Offre A : 2,25 €/);
 assert.match(result,/Offre B : 2,50 €/);
 assert.match(result,/Offre A.*plus avantageuse de 0,25 € par unité/s);
 await page.locator("#pA").fill("2,001");
 await page.locator(".button-main").click();
 result=(await page.locator("#result").innerText()).replace(/[\u00a0\u202f]/g," ");
 assert.match(result,/Valeurs à vérifier/);
 for(const width of [320,360,375,390,768,1280]){
  await page.setViewportSize({width,height:900});
  const layout=await page.evaluate(()=>({
   viewport:window.innerWidth,
   document:document.documentElement.scrollWidth,
   tool:document.querySelector(".tool").getBoundingClientRect().right,
   inputs:[...document.querySelectorAll(".field-group input")].map(el=>({left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right}))
  }));
  assert.ok(layout.document<=layout.viewport+1,"débordement horizontal à "+width+"px : "+JSON.stringify(layout));
  assert.ok(layout.tool<=layout.viewport+1,"calculateur hors écran à "+width+"px : "+JSON.stringify(layout));
  assert.ok(layout.inputs.every(input=>input.left>=-1&&input.right<=layout.viewport+1),"champ hors écran à "+width+"px : "+JSON.stringify(layout));
 }
 console.log("Promotions navigateur : virgule décimale, Entrée, invalides et responsive 320–1280 px vérifiés.");
}finally{
 if(browser)await browser.close();
 server.kill("SIGTERM");
}