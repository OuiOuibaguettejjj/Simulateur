import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import {INTERACTIVE_FAMILIES} from "../scripts/interactive-families.mjs";

const ROOT=process.cwd();

function strip(html){return String(html).replace(/<[^>]*>/g,"").replace(/&nbsp;/g," ").replace(/&euro;/g,"€").replace(/\s+/g," ").trim();}

class FakeElement{
  constructor(tag,attrs={},text=""){this.tagName=tag.toUpperCase();this.nodeName=this.tagName;this.attributes=attrs;this.id=attrs.id||"";this.name=attrs.name||"";this.type=attrs.type||"";this.value=attrs.value??"";this.defaultValue=this.value;this.checked=attrs.checked!==undefined;this.selected=attrs.selected!==undefined;this._textContent=text;this._innerHTML=text;this.style={};this.dataset={};this.listeners={};this.children=[];this.options=[];this.onclick=null;this.selectedIndex=-1;this.className=attrs.class||"";this.classList={add:()=>{},remove:()=>{},toggle:()=>{},contains:c=>this.className.split(/\s+/).includes(c)};}
  addEventListener(type,fn){(this.listeners[type]??=[]).push(fn)}
  dispatchEvent(event){for(const fn of this.listeners[event.type]||[])fn.call(this,event)}
  click(){const event={type:"click",target:this};this.dispatchEvent(event);if(typeof this.onclick==="function")this.onclick.call(this,event);if(this.attributes.onclick&&this._doc?._context){const previous=this._doc._context.event;this._doc._context.event=event;try{vm.runInContext(String(this.attributes.onclick),this._doc._context,{filename:"[onclick]"})}finally{this._doc._context.event=previous}}if((this.tagName==="BUTTON"||this.tagName==="INPUT")&&((this.type||"").toLowerCase()==="submit"||this.tagName==="BUTTON"&&!(this.type||"").toLowerCase())&&this.form)this.form.dispatchEvent({type:"submit",target:this.form,preventDefault(){}})}
  get textContent(){return this._textContent}set textContent(v){this._textContent=String(v)}get innerHTML(){return this._innerHTML}set innerHTML(v){this._innerHTML=String(v);this._textContent=strip(this._innerHTML)}focus(){} blur(){} select(){} scrollIntoView(){}
  append(...children){this.children.push(...children);for(const child of children)if(this._doc&&!this._doc.elements.includes(child))this._doc.elements.push(child);return undefined}
  appendChild(child){this.children.push(child);if(this._doc&&!this._doc.elements.includes(child))this._doc.elements.push(child);return child}
  removeChild(child){this.children=this.children.filter(x=>x!==child);return child}replaceChildren(...children){this.children=[...children];for(const child of children)if(this._doc&&!this._doc.elements.includes(child))this._doc.elements.push(child);this.innerHTML=children.map(x=>x?.outerHTML||x?.textContent||"").join("");return undefined}
  insertAdjacentHTML(_where,html){this.innerHTML+=html;this.textContent=strip(this.innerHTML)}
  setAttribute(k,v){this.attributes[k]=String(v);if(k==="value")this.value=String(v);if(k==="class")this.className=String(v)}
  getAttribute(k){return this.attributes[k]??null}removeAttribute(k){delete this.attributes[k];if(k==="aria-invalid")delete this.attributes[k]}
  matches(selector){return matches(this,selector)}
  querySelector(selector){return this._doc?.querySelector(selector)||null}
  querySelectorAll(selector){return this._doc?.querySelectorAll(selector)||[]}
}
function matches(el,selector){
  selector=selector.trim();
  if(selector==="*")return true;
  if(selector.startsWith("#"))return el.id===selector.slice(1);
  if(selector.startsWith("."))return el.classList.contains(selector.slice(1));
  const checked=selector.endsWith(":checked"); if(checked)selector=selector.slice(0,-8);
  const a=selector.match(/^([a-zA-Z]*)\[([^=]+)=[\"']?([^\]\"']+)[\"']?\]$/);
  if(a){if(a[1]&&el.tagName.toLowerCase()!==a[1].toLowerCase())return false;return el.attributes[a[2]]===a[3]&&(!checked||el.checked)}
  return el.tagName.toLowerCase()===selector.toLowerCase();
}
function attrs(raw){const out={};for(const a of raw.matchAll(/([:\w-]+)(?:=[\"']([^\"']*)[\"'])?/g))out[a[1].toLowerCase()]=a[2]??"";return out}
function parseElements(html){
  const elements=[];
  for(const m of html.matchAll(/<(form)(\s[^>]*)?>[\s\S]*?<\/form>/gi))elements.push(new FakeElement("form",attrs(m[2]||"")));
  for(const m of html.matchAll(/<(input|select|textarea|button)(\s[^>]*)?>([\s\S]*?)<\/\1>/gi)){elements.push(new FakeElement(m[1],attrs(m[2]||""),strip(m[3])))}
  for(const m of html.matchAll(/<(input)(\s[^>]*)?\/?\s*>/gi)){const a=attrs(m[2]||"");if(!elements.some(e=>e.tagName==="INPUT"&&e.id===a.id&&e.name===a.name))elements.push(new FakeElement("input",a))}
  for(const m of html.matchAll(/<([a-z]+)([^>]*)\sclass=[\"']([^\"']*result[^\"']*)[\"'][^>]*>/gi)){const a=attrs(m[2]||"");a.class=m[3];if(!elements.some(e=>e.id===a.id&&e.className===a.class))elements.push(new FakeElement(m[1],a,""))}
  for(const m of html.matchAll(/<([a-zA-Z][\w-]*)([^>]*)>/g)){const tag=m[1].toLowerCase();if(["script","style","meta","link","title"].includes(tag))continue;const a=attrs(m[2]||"");if(a.id&&!elements.some(e=>e.id===a.id))elements.push(new FakeElement(tag,a,""))}
  for(const select of elements.filter(e=>e.tagName==="SELECT")){
    const block=html.match(new RegExp("<select\\b[^>]*\\bid=[\"']"+select.id+"[\"'][^>]*>([\\s\\S]*?)</select>","i"))?.[1]||"";
    select.options=[...block.matchAll(/<option([^>]*)>([\s\S]*?)<\/option>/gi)].map(m=>{const a=attrs(m[1]||"");return {value:a.value!==undefined?a.value:strip(m[2]),text:strip(m[2]),selected:a.selected!==undefined}});
    select.selectedIndex=select.options.findIndex(o=>o.selected);if(select.selectedIndex<0)select.selectedIndex=0;
    select.value=select.options[select.selectedIndex]?.value??select.options[0]?.value??"";
  }
  return elements;
}
function buildDocument(html){
  const elements=parseElements(html),missing=new Map();
  const doc={elements,missing,getElementById(id){const e=elements.find(x=>x.id===id);return e||null},querySelectorAll(selector){return elements.filter(e=>matches(e,selector))},querySelector(selector){return doc.querySelectorAll(selector)[0]||null},addEventListener(type,fn){if(type==="DOMContentLoaded")fn()},createElement(tag){const e=new FakeElement(tag);e._doc=doc;if(tag==="canvas")e.getContext=()=>new Proxy({}, {get:()=>()=>{}});return e},createElementNS(_ns,tag){return doc.createElement(tag)},body:new FakeElement("body"),documentElement:new FakeElement("html")};
  for(const e of elements)e._doc=doc;const forms=elements.filter(e=>e.tagName==="FORM");for(const e of elements)if((e.tagName==="BUTTON"||e.tagName==="INPUT")&&forms.length)e.form=forms[0];return doc;
}
function setCase(document,kind){
  let dateIndex=0;
  for(const el of document.elements){
    if(!["INPUT","SELECT","TEXTAREA"].includes(el.tagName))continue;
    if(el.type==="radio"||el.type==="checkbox")continue;
    if(el.tagName==="SELECT"){if(kind!=="default"&&el.options.length){el.selectedIndex=0;el.value=el.options[0].value}continue}
    if(kind==="default")continue;
    if(el.type==="date"){el.value=dateIndex++===0?"2020-01-15":"2021-01-15";continue}
    if(kind==="empty")el.value="";
    else if(kind==="zero")el.value="0";
    else if(kind==="negative")el.value="-10";
    else if(kind==="large")el.value="100";
    else if(kind==="comma")el.value=el.type==="number"?"12.5":"12,5";
  }
}
function resultText(document){const primary=document.elements.filter(e=>e.id==="result"||e.id==="results"||e.className.split(/\s+/).some(c=>/result/i.test(c))).map(e=>strip(e.textContent||e.innerHTML||"")).filter(Boolean);if(primary.length)return[...new Set(primary)].join(" | ");return document.elements.filter(e=>e.id&&![ "INPUT","SELECT","TEXTAREA","BUTTON","FORM"].includes(e.tagName)).map(e=>strip(e.textContent||e.innerHTML||"")).filter(Boolean).join(" | ")}
function loadContext(html,mockRates={}){
  const document=buildDocument(html);
  const context=vm.createContext({document,console:{log(){},warn(){},error(){}},setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},requestAnimationFrame:fn=>fn(),cancelAnimationFrame(){},alert(){},confirm:()=>true,prompt:()=>null,Event:function(type){this.type=type},CustomEvent:function(type){this.type=type},fetch:async()=>({ok:true,json:async()=>({dates:{EUR:null,USD:"2026-09-25",GBP:"2026-09-25",CHF:"2026-09-25"},rates:{EUR:1,USD:1.23,GBP:0.87,CHF:0.94,...mockRates},source:"BCE"})}),Date,Intl,Math,Number,String,Boolean,Array,Object,JSON,RegExp,parseFloat,parseInt,isNaN,isFinite});
  for(const element of document.elements)if(element.id&&!Object.prototype.hasOwnProperty.call(context,element.id))context[element.id]=element;
  context.window=context;context.globalThis=context;document._context=context;context.addEventListener=(type,fn)=>{if(type==="load")fn()};return{context,document,window:context};
}
function localScripts(html){return[...html.matchAll(/<script[^>]+src=[\"']([^\"']+)[\"'][^>]*><\/script>/gi)].map(m=>m[1]).filter(src=>src.startsWith("/")&&src.endsWith(".js")).map(src=>src.slice(1))}
export async function runInlineCalculator({slug,family="outil",caseKind="default",inputs={},mockRates={}}){
  if(!INTERACTIVE_FAMILIES.includes(family))throw new Error("unknown interactive family: "+family);
  const file=path.join(ROOT,"public",family,slug,"index.html");const html=fs.readFileSync(file,"utf8");const {context,document,window}=loadContext(html,mockRates);
  for(const [id,value] of Object.entries(inputs)){const el=document.getElementById(id);if(!el)throw new Error("unknown input id: "+id);const raw=String(value);el.value=el.type==="number"&&!(family==="outil"&&slug==="frais-de-notaire"&&id==="prix")?raw.replace(",","." ):raw}
  setCase(document,caseKind);
  for(const src of localScripts(html)){const full=path.join(ROOT,"public",src);if(fs.existsSync(full))vm.runInContext(fs.readFileSync(full,"utf8"),context,{filename:src,timeout:500})}
  const inline=[...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)].filter(m=>!/\bsrc=/.test(m[1])&&!/application\/ld\+json/i.test(m[1]));
  if(!inline.length)throw new Error("aucun script intégré");
  for(const m of inline)vm.runInContext(m[2],context,{filename:file,timeout:500});
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  await new Promise(resolve=>setTimeout(resolve,0));
  let returned="";
  if(family==="outil"&&window.TOOL?.calc){const $=id=>document.getElementById(id);const euro=value=>Number(value).toLocaleString("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:2});const num=value=>Number(value).toLocaleString("fr-FR",{maximumFractionDigits:2});const result=window.TOOL.calc.call({$,euro,num});if(typeof result!=="string")throw new Error("calc ne retourne pas une chaîne");returned=strip(result)}
  const calculationButton=document.querySelector(".button-main");
  if(calculationButton)calculationButton.click();
  return{text:[returned,resultText(document)].filter(Boolean).join(" | "),hasTool:!!window.TOOL};
}
export function listIntegratedPages(){const pages=[];for(const family of INTERACTIVE_FAMILIES){const dir=path.join(ROOT,"public",family);if(!fs.existsSync(dir))continue;for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(!entry.isDirectory())continue;const slug=entry.name;const html=fs.readFileSync(path.join(dir,slug,"index.html"),"utf8");const hasInline=[...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)].some(m=>!/\bsrc=/.test(m[1])&&!/application\/ld\+json/i.test(m[1]));if(hasInline)pages.push({family,slug})}}return pages.sort((a,b)=>(a.family+"/"+a.slug).localeCompare(b.family+"/"+b.slug))}
export function listIntegratedTools(){return listIntegratedPages().filter(page=>page.family==="outil").map(page=>page.slug)}
