import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const ROOT=process.cwd();

function strip(html){return String(html).replace(/<[^>]*>/g,"").replace(/&nbsp;/g," ").replace(/&euro;/g,"€").replace(/\s+/g," ").trim();}

class FakeElement{
  constructor(tag,attrs={},text=""){this.tagName=tag.toUpperCase();this.nodeName=this.tagName;this.attributes=attrs;this.id=attrs.id||"";this.name=attrs.name||"";this.type=attrs.type||"";this.value=attrs.value??"";this.defaultValue=this.value;this.checked=attrs.checked!==undefined;this.selected=attrs.selected!==undefined;this._textContent=text;this._innerHTML=text;this.style={};this.dataset={};this.listeners={};this.children=[];this.options=[];this.selectedIndex=-1;this.className=attrs.class||"";this.classList={add:()=>{},remove:()=>{},toggle:()=>{},contains:c=>this.className.split(/\s+/).includes(c)};}
  addEventListener(type,fn){(this.listeners[type]??=[]).push(fn)}
  dispatchEvent(event){for(const fn of this.listeners[event.type]||[])fn.call(this,event)}
  click(){const event={type:"click",target:this};this.dispatchEvent(event);if(this.attributes.onclick&&this._doc?._context){const previous=this._doc._context.event;this._doc._context.event=event;try{vm.runInContext(String(this.attributes.onclick),this._doc._context,{filename:"[onclick]"})}finally{this._doc._context.event=previous}}if((this.tagName==="BUTTON"||this.tagName==="INPUT")&&((this.type||"").toLowerCase()==="submit"||this.tagName==="BUTTON"&&!(this.type||"").toLowerCase())&&this.form)this.form.dispatchEvent({type:"submit",target:this.form,preventDefault(){}})}
  get textContent(){return this._textContent}set textContent(v){this._textContent=String(v)}get innerHTML(){return this._innerHTML}set innerHTML(v){this._innerHTML=String(v);this._textContent=strip(this._innerHTML)}focus(){} blur(){} select(){} scrollIntoView(){}
  appendChild(child){this.children.push(child);return child}
  removeChild(child){this.children=this.children.filter(x=>x!==child);return child}replaceChildren(...children){this.children=[...children];this.innerHTML=children.map(x=>x?.outerHTML||x?.textContent||"").join("");return undefined}
  insertAdjacentHTML(_where,html){this.innerHTML+=html;this.textContent=strip(this.innerHTML)}
  setAttribute(k,v){this.attributes[k]=String(v);if(k==="value")this.value=String(v);if(k==="class")this.className=String(v)}
  getAttribute(k){return this.attributes[k]??null}
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
  for(const el of document.elements){
    if(!["INPUT","SELECT","TEXTAREA"].includes(el.tagName))continue;
    if(el.type==="radio"||el.type==="checkbox")continue;
    if(el.tagName==="SELECT"){if(kind!=="default"&&el.options.length){el.selectedIndex=0;el.value=el.options[0].value}continue}
    if(kind==="default")continue;
    if(el.type==="date"){el.value="2020-01-15";continue}
    if(kind==="empty")el.value="";
    else if(kind==="zero")el.value="0";
    else if(kind==="negative")el.value="-10";
    else if(kind==="large")el.value="100";
    else if(kind==="comma")el.value=el.type==="number"?"12.5":"12,5";
  }
}
function resultText(document){return document.elements.filter(e=>e.id==="result"||e.id==="results"||e.className.split(/\s+/).some(c=>/result/i.test(c))).map(e=>strip(e.textContent||e.innerHTML||"")).filter(Boolean).join(" | ")}
function loadContext(html){
  const document=buildDocument(html);
  const context=vm.createContext({document,console:{log(){},warn(){},error(){}},setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},requestAnimationFrame:fn=>fn(),cancelAnimationFrame(){},alert(){},confirm:()=>true,prompt:()=>null,Event:function(type){this.type=type},CustomEvent:function(type){this.type=type},Date,Intl,Math,Number,String,Boolean,Array,Object,JSON,RegExp,parseFloat,parseInt,isNaN,isFinite});
  context.window=context;context.globalThis=context;document._context=context;context.addEventListener=(type,fn)=>{if(type==="load")fn()};return{context,document,window:context};
}
function localScripts(html){return[...html.matchAll(/<script[^>]+src=[\"']([^\"']+)[\"'][^>]*><\/script>/gi)].map(m=>m[1]).filter(src=>src.startsWith("/")&&src.endsWith(".js")).map(src=>src.slice(1))}
export function runInlineCalculator({slug,caseKind="default",inputs={}}){
  const file=path.join(ROOT,"public","outil",slug,"index.html");const html=fs.readFileSync(file,"utf8");const {context,document,window}=loadContext(html);
  for(const [id,value] of Object.entries(inputs)){const el=document.getElementById(id);if(!el)throw new Error("unknown input id: "+id);el.value=String(value)}
  setCase(document,caseKind);
  for(const src of localScripts(html)){const full=path.join(ROOT,"public",src);if(fs.existsSync(full))vm.runInContext(fs.readFileSync(full,"utf8"),context,{filename:src,timeout:500})}
  const inline=[...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)].filter(m=>!/\bsrc=/.test(m[1])&&!/application\/ld\+json/i.test(m[1]));
  if(!inline.length)throw new Error("aucun script intégré");
  for(const m of inline)vm.runInContext(m[2],context,{filename:file,timeout:500});
  let returned="";
  if(window.TOOL?.calc){const $=id=>document.getElementById(id);const euro=value=>Number(value).toLocaleString("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:2});const num=value=>Number(value).toLocaleString("fr-FR",{maximumFractionDigits:2});const result=window.TOOL.calc.call({$,euro,num});if(typeof result!=="string")throw new Error("calc ne retourne pas une chaîne");returned=strip(result)}
  for(const button of document.querySelectorAll("button"))button.click();
  return{text:[returned,resultText(document)].filter(Boolean).join(" | "),hasTool:!!window.TOOL};
}
export function listIntegratedTools(){const dir=path.join(ROOT,"public","outil");return fs.readdirSync(dir,{withFileTypes:true}).filter(e=>e.isDirectory()).map(e=>e.name).filter(slug=>{const html=fs.readFileSync(path.join(dir,slug,"index.html"),"utf8");return[...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)].some(m=>!/\bsrc=/.test(m[1])&&!/application\/ld\+json/i.test(m[1]))}).sort()}
