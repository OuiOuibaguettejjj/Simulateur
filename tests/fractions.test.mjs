import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const html=fs.readFileSync("public/outil/fractions/index.html","utf8");
const match=html.match(/<script>\s*([\s\S]*?)<\/script>\s*<\/body>/i);
assert.ok(match,"script du calculateur introuvable");
const context={window:{}};
vm.runInNewContext(match[1],context,{filename:"fractions-inline.js"});
const calculator=context.window.TOOL;
assert.equal(typeof calculator?.calc,"function","fonction de calcul introuvable");

function calculate(inputs) {
  const result=calculator.calc.call({$:id=>({value:inputs[id]??""})});
  return String(result).replace(/<[^>]*>/g,"").replace(/&nbsp;/g," ");
}
function expect(inputs,expected,description) {
  const result=calculate(inputs);
  assert.ok(result.includes(expected),description+"; résultat : "+result);
}
const base={a:"1",b:"2",c:"1",d:"3"};
expect({...base,operation:"add"},"1/2 + 1/3 = 5/6","addition et résultat exact");
expect({...base,operation:"subtract"},"1/2 − 1/3 = 1/6","soustraction");
expect({...base,operation:"multiply"},"1/2 × 1/3 = 1/6","multiplication");
expect({...base,operation:"divide"},"1/2 ÷ 1/3 = 3/2","division");
expect({a:"4",b:"6",c:"0",d:"1",operation:"add"},"2/3","simplification irréductible");
expect({a:"1",b:"-2",c:"0",d:"1",operation:"add"},"-1/2","normalisation du signe au numérateur");
expect({a:"-1",b:"-2",c:"0",d:"1",operation:"add"},"1/2","dénominateur négatif normalisé");
expect({a:"2",b:"3",c:"0",d:"1",operation:"subtract"},"2/3","soustraction avec zéro");
expect({a:"1",b:"2",c:"0",d:"3",operation:"divide"},"division par une fraction nulle est impossible","division par zéro refusée");
expect({a:"1",b:"0",c:"1",d:"3",operation:"add"},"dénominateur ne peut pas être égal à zéro","dénominateur nul refusé");
expect({a:"",b:"2",c:"1",d:"3",operation:"add"},"Saisissez un entier","champ vide refusé");
expect({a:"1.5",b:"2",c:"1",d:"3",operation:"add"},"entiers dans la plage autorisée","entrée non entière refusée");
expect({a:"1",b:"2",c:"1",d:"3",operation:"unknown"},"opération valide","opération inconnue refusée");
expect({a:"9007199254740992",b:"1",c:"1",d:"1",operation:"add"},"plage autorisée","entier hors plage refusé");

const huge={a:"9007199254740991",b:"1",c:"9007199254740991",d:"1",operation:"multiply"};
const hugeText=calculate(huge);
const exact=(9007199254740991n*9007199254740991n).toString();
assert.ok(hugeText.includes(exact),"fraction géante exacte : "+hugeText);
const decimal=hugeText.split("Valeur décimale :")[1]?.replace(/[\s\u00a0\u202f.,]/g,"");
assert.equal(decimal,exact,"décimale géante exacte après regroupement français");

assert.ok(calculate({a:"1",b:"6",c:"0",d:"1",operation:"add"}).includes("0,166667"),"arrondi à six décimales");
assert.ok(calculate({a:"-1",b:"6",c:"0",d:"1",operation:"add"}).includes("-0,166667"),"arrondi signé à six décimales");
console.log("fractions : 4 opérations, simplification, signes, validations, division par zéro et précision BigInt validés.");
