import assert from "node:assert/strict";
import {runInlineCalculator} from "./calculator-harness.mjs";

const cases=[
  {name:"neuf collectif — tranche 2",inputs:{rfr:"40000",cout:"250000",works:"","other-loans":"",zone:"B1",people:"3",type:"collectif"},expected:97200},
  {name:"neuf individuel — tranche 1",inputs:{rfr:"20000",cout:"150000",works:"","other-loans":"",zone:"C",people:"2",type:"individuel"},expected:45000},
  {name:"ancien avec travaux — tranche 3",inputs:{rfr:"40000",cout:"200000",works:"60000","other-loans":"",zone:"B2",people:"2",type:"ancien"},expected:66000},
  {name:"plafond des autres prêts",inputs:{rfr:"40000",cout:"250000",works:"","other-loans":"50000",zone:"B1",people:"3",type:"collectif"},expected:50000}
];
function extract(text,label){const marker=" € de "+label;const i=String(text).indexOf(marker);assert.ok(i>=0,"sortie absente : "+label+" dans "+text);const m=String(text).slice(0,i).match(/([0-9][0-9 .,]*)$/);assert.ok(m,"valeur absente avant "+label+" dans "+text);return Number(m[1].replace(/[\s\u00a0\u202f]/g,"").replace(",","."))}
for(const c of cases){const out=await runInlineCalculator({family:"outil",slug:"ptz",caseKind:"default",inputs:c.inputs});const value=extract(out.text,"PTZ estimé");assert.ok(Math.abs(value-c.expected)<0.01,c.name+" : attendu "+c.expected+", obtenu "+value)}
const oldZone=await runInlineCalculator({family:"outil",slug:"ptz",caseKind:"default",inputs:{rfr:"20000",cout:"150000",works:"50000","other-loans":"",zone:"A",people:"2",type:"ancien"}});assert.match(oldZone.text,/zone B2 ou C/i);
const oldWorks=await runInlineCalculator({family:"outil",slug:"ptz",caseKind:"default",inputs:{rfr:"20000",cout:"150000",works:"30000","other-loans":"",zone:"C",people:"2",type:"ancien"}});assert.match(oldWorks.text,/25 %/);
const incomeCap=await runInlineCalculator({family:"outil",slug:"ptz",caseKind:"default",inputs:{rfr:"49000",cout:"150000",works:"","other-loans":"",zone:"A",people:"1",type:"collectif"}});assert.match(incomeCap.text,/Au-dessus du plafond/i);
console.log("PTZ : cas métier sourcés et garde-fous validés.");
