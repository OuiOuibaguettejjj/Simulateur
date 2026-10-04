import assert from "node:assert/strict";
import {runInlinePage} from "./calculator-harness.mjs";

function expectText(label,out,parts){
  for(const part of parts)assert.ok(out.text.includes(part),label+" : résultat attendu absent : "+part+"\nRésultat : "+out.text);
}

const cases=[
  ["conversion/aire","Aire : 1 m² → ha",()=>runInlinePage({pagePath:"conversion/aire/index.html",inputs:{v:"1"}}),["0,0001 ha"]],
  ["conversion/angle","Angle : 180° → rad",()=>runInlinePage({pagePath:"conversion/angle/index.html",inputs:{value:"180"},selects:{from:"deg",to:"rad"},clickId:"convert"}),["180° = 3,14159265 rad"]],
  ["conversion/longueur","Longueur : 1 m → cm/mm/km",()=>runInlinePage({pagePath:"conversion/longueur/index.html",inputs:{v:"1"}}),["100 cm","1 000 mm","0,001 km"]],
  ["conversion/poids","Poids : 1 kg → g/mg/t",()=>runInlinePage({pagePath:"conversion/poids/index.html",inputs:{v:"1"}}),["1 000 g","1 000 000 mg","0,001 tonne(s)"]],
  ["conversion/temperature","Température : 100 °C → °F",()=>runInlinePage({pagePath:"conversion/temperature/index.html",inputs:{value:"100"},selects:{from:"C",to:"F"},clickId:"convert"}),["100 C = 212 F"]],
  ["conversion/volume","Volume : 1 L → mL/cL/m³",()=>runInlinePage({pagePath:"conversion/volume/index.html",inputs:{v:"1"}}),["1 000 mL","100 cL","0,001 m³"]],
  ["conversion/donnees","Données : 1 Go → Mo",()=>runInlinePage({pagePath:"conversion/donnees/index.html",inputs:{v:"1"},selects:{from:"go",to:"mo"},clickId:"go"}),["1 000 Mo"]],
  ["comparateur/prix-unitaire","Prix unitaire : offres A/B",()=>runInlinePage({pagePath:"comparateur/prix-unitaire/index.html",inputs:{pa:"3.50",qa:"500",pb:"5.20",qb:"800"},clickId:"compare"}),["7,00 € / kg","6,50 € / kg","0,50 € / kg"]]
];

for(const [slug,label,run,parts] of cases)expectText(label,run(),parts);
console.log("Couverture interactive : "+cases.length+" scénarios métier de référence passent.");
