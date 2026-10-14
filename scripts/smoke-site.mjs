import fs from "node:fs";
import {spawn} from "node:child_process";
import {chromium} from "playwright";
import {isInvalidResult} from "./../tests/invalid-result.mjs";
import {AD_HOST_RE,IGNORED_CONSOLE_RE} from "./ad-filter.mjs";
import {isInteractivePage} from "./interactive-families.mjs";

const args=new Map();
for(let i=0;i<process.argv.length;i++){const m=process.argv[i].match(/^--([^=]+)=(.*)$/);if(m)args.set(m[1],m[2]);else if(process.argv[i].startsWith("--"))args.set(process.argv[i].slice(2),process.argv[i+1]&&!process.argv[i+1].startsWith("--")?process.argv[++i]:"");}
const mode=args.get("mode")||"local";
const baseUrl=(args.get("base-url")||"http://127.0.0.1:4173").replace(/\/$/,"");
if(!["local","production"].includes(mode))throw new Error("mode invalide: "+mode);
function walk(dir,out=[]){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=dir+"/"+e.name;if(e.isDirectory())walk(p,out);else if(e.isFile()&&p.endsWith(".html"))out.push(p)}return out}
const files=walk("public");
let server=null;
async function waitReady(){const deadline=Date.now()+10000;while(Date.now()<deadline){try{const r=await fetch(baseUrl+"/");if(r.status===200)return}catch{}await new Promise(r=>setTimeout(r,100))}throw new Error("serveur HTTP non prêt après 10 s")}
if(mode==="local"){server=spawn("python3",["-m","http.server","4173","--directory","public"],{stdio:"ignore"});await waitReady()}
try{
 const browser=await chromium.launch({headless:true});const errors=[];
 for(const file of files){
  const route="/"+file.slice("public/".length).replace(/\/index\.html$/,"/");
  const page=await browser.newPage();
  await page.route("**/*",route=>{const hostname=new URL(route.request().url()).hostname;if(AD_HOST_RE.test(hostname))return route.abort();return route.continue()});
  async function populate(page){await page.locator("input").evaluateAll(inputs=>{for(const input of inputs){if(input.type==="date")input.value="2020-01-15";else if(input.type==="number")input.value=input.min&&Number(input.min)>10?input.min:"10";else if(input.type!=="hidden")input.value="test";input.dispatchEvent(new Event("input",{bubbles:true}));input.dispatchEvent(new Event("change",{bubbles:true}))}});await page.locator("select").evaluateAll(selects=>{for(const select of selects){if(select.options.length){select.selectedIndex=0;select.dispatchEvent(new Event("change",{bubbles:true}))}}})}
  await page.route("**/api/devises",route=>route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({dates:{EUR:null,USD:"2026-09-25",GBP:"2026-09-25",CHF:"2026-09-25"},rates:{EUR:1,USD:1.17,GBP:0.87,CHF:0.94},source:"BCE"})}));
  const consoleErrors=[],pageErrors=[];
  page.on("console",m=>{if(m.type()==="error"&&!IGNORED_CONSOLE_RE.test(m.text()))consoleErrors.push(m.text())});
  page.on("pageerror",e=>pageErrors.push(String(e)));
  try{
   const response=await page.goto(baseUrl+route,{waitUntil:mode==="local"?"load":"domcontentloaded",timeout:mode==="local"?10000:20000});
   if(!response||response.status()!==200)errors.push(file+": "+(mode==="production"?"production ":"")+"HTTP "+(response&&response.status()));
   if(!(await page.title()))errors.push(file+": "+(mode==="production"?"production ":"")+"empty title");
   if(isInteractivePage(file.slice("public/".length))){
    await populate(page);const buttons=page.locator("button"),n=await buttons.count();if(n===0)errors.push(file+": "+(mode==="production"?"production ":"")+"no button");
    for(let i=0;i<n;i++)try{const button=buttons.nth(i);if(await button.isDisabled())continue;await button.click({timeout:mode==="local"?1500:2000});await page.waitForTimeout(mode==="local"?30:50)}catch(e){errors.push(file+": "+(mode==="production"?"production ":"")+"button "+i+" click failed: "+e.message)}
    if(file==="public/outil/prix-unitaire/index.html"){
     const result=page.locator("#result");
     try{
      await page.locator("#p").fill("3,50");await page.locator("#q").fill("0,5");await page.locator("#u").selectOption("kg");
      await page.getByRole("button",{name:"Calculer le prix unitaire"}).click();
      if(!/7,00\s*€\s*\/\s*kg/.test(await result.innerText()))errors.push(file+": virgule décimale non calculée correctement");
      await page.locator("#p").fill("0,20");await page.locator("#q").fill("100");await page.locator("#u").selectOption("pièce");
      await page.getByRole("button",{name:"Calculer le prix unitaire"}).click();
      if(!/0,002\s*€\s*\/\s*pièce/.test(await result.innerText()))errors.push(file+": le petit prix unitaire n'est pas affiché avec assez de précision");
      await page.locator("#p").fill("3,50");await page.locator("#q").fill("0,5");await page.locator("#u").selectOption("kg");
      await page.locator("#q").press("Enter");
      if(!/7,00\s*€\s*\/\s*kg/.test(await result.innerText()))errors.push(file+": la touche Entrée ne déclenche pas le calcul");
      await page.locator("#p").fill("1");await page.locator("#q").fill("0");
      await page.getByRole("button",{name:"Calculer le prix unitaire"}).click();
      if(!/strictement supérieure à zéro/.test(await result.innerText()))errors.push(file+": la quantité nulle n'est pas refusée");
     }catch(e){errors.push(file+": test navigateur dédié échoué: "+e.message)}
    }
    if(file==="public/outil/marge/index.html"){
     const result=page.locator("#result");
     try{
      await page.locator("#achat").fill("60,00");await page.locator("#vente").fill("100,00");await page.locator("#frais").fill("5,00");await page.locator("#objectif").fill("40,00");
      await page.getByRole("button",{name:"Calculer"}).click();
      let text=await result.innerText();
      if(!/Marge commerciale\s*:\s*35,00\s*€/.test(text))errors.push(file+": marge avec frais unitaires incorrecte");
      if(!/Taux de marge\s*:\s*53,85\s*%/.test(text))errors.push(file+": taux de marge incorrect");
      if(!/Taux de marque\s*:\s*35\s*%/.test(text))errors.push(file+": taux de marque incorrect");
      if(!/Prix de vente HT pour un taux de marque de 40\s*%\s*:\s*108,33\s*€/.test(text))errors.push(file+": prix cible incorrect");
      await page.locator("#objectif").press("Enter");
      if(!/108,33\s*€/.test(await result.innerText()))errors.push(file+": la touche Entrée ne déclenche pas le calcul de marge");
      await page.locator("#objectif").fill("100");
      await page.getByRole("button",{name:"Calculer"}).click();
      if(!/moins de 100\s*%/.test(await result.innerText()))errors.push(file+": taux cible de 100 % non refusé");
      await page.locator("#objectif").fill("0");
      await page.getByRole("button",{name:"Calculer"}).click();
      if(!/Prix de vente HT pour un taux de marque de 0\s*%\s*:\s*65,00\s*€/.test(await result.innerText()))errors.push(file+": taux cible de 0 % incorrect");
      await page.locator("#objectif").fill("");
      await page.locator("#achat").fill("-1");
      await page.getByRole("button",{name:"Calculer"}).click();
      if(!/prix d'achat positif ou nul/.test(await result.innerText()))errors.push(file+": prix d'achat négatif non refusé");
     }catch(e){errors.push(file+": test navigateur marge échoué: "+e.message)}
    }
   }else if(mode==="local")await populate(page);
   const texts=await page.locator(".result").allTextContents();
   const badResults=texts.filter(t=>isInvalidResult(t));
   if(badResults.length)errors.push(file+": "+(mode==="production"?"production ":"")+"valeur invalide dans .result: "+badResults.map(t=>t.trim().slice(0,120)).join(" | "));
   if(consoleErrors.length)errors.push(file+": "+(mode==="production"?"production ":"")+"console.error: "+consoleErrors.join(" | "));
   if(pageErrors.length)errors.push(file+": "+(mode==="production"?"production ":"")+"pageerror: "+pageErrors.join(" | "));
  }catch(e){errors.push(file+": "+(mode==="production"?"production ":"")+e.message)}
  await page.close();
 }
 await browser.close();
 console.log((mode==="production"?"Production ":"Local ")+"smoke-tested "+files.length+" public HTML pages, including "+files.filter(f=>isInteractivePage(f.slice("public/".length))).length+" interactive pages.");
 if(errors.length){console.error(errors.join("\n"));process.exit(1)}
}finally{if(server)server.kill("SIGTERM")}
