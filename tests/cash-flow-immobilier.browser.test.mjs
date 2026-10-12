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
 throw new Error("Serveur de test non prêt.");
}
try{
 await waitReady();
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 await page.goto(baseUrl+"/outil/cash-flow-immobilier/",{waitUntil:"load"});
 assert.equal(await page.title(),"Calcul cash-flow immobilier : simulateur locatif | Simulateur");
 await page.locator("#result").waitFor();
 await page.locator("#loyer").fill("1000");
 await page.locator("#credit").fill("750");
 await page.locator("#result").click();
 await page.locator("#credit").press("Enter");
 let result=(await page.locator("#result").innerText()).replace(/[\u00a0\u202f]/g," ");
 assert.match(result,/Cash-flow mensuel[\s\S]*-57,50 €/);
 assert.match(result,/Cash-flow annuel[\s\S]*-690,00 €/);
 await page.locator("#vac").fill("101");
 await page.locator(".button-main").click();
 result=await page.locator("#result").innerText();
 assert.match(result,/doivent être compris entre 0 et 100/);
 for(const width of [320,360,375,390,768,1280]){
  await page.setViewportSize({width,height:900});
  const layout=await page.evaluate(()=>({
   viewport:window.innerWidth,
   document:document.documentElement.scrollWidth,
   tool:document.querySelector(".cashflow-tool").getBoundingClientRect().right,
   inputs:[...document.querySelectorAll(".cashflow-fields input")].map(el=>({left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right}))
  }));
  assert.ok(layout.document<=layout.viewport+1,"débordement horizontal à "+width+"px : "+JSON.stringify(layout));
  assert.ok(layout.tool<=layout.viewport+1,"calculateur hors écran à "+width+"px : "+JSON.stringify(layout));
  assert.ok(layout.inputs.every(input=>input.left>=-1&&input.right<=layout.viewport+1),"champ hors écran à "+width+"px : "+JSON.stringify(layout));
 }
 console.log("Cash-flow immobilier navigateur : calcul, Entrée, validation et responsive 320–1280 px vérifiés.");
}finally{
 if(browser)await browser.close();
 server.kill("SIGTERM");
}
