(function(){
  function parseNumber(raw){
    const normalized=String(raw).trim().replace(/[\s\u00a0\u202f]/g,"").replace(",",".");
    if(normalized==="") return null;
    if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return null;
    const value=Number(normalized);
    return Number.isFinite(value)?value:null;
  }

  function formatEuro(value){
    return Number(value).toLocaleString("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:2});
  }

  function formatNumber(value){
    return Number(value).toLocaleString("fr-FR",{maximumFractionDigits:2});
  }

  function calculate(){
    const ids=["capital","versement","rendement","frais-versement","frais-gestion","annees"];
    const values=Object.fromEntries(ids.map(id=>[id,parseNumber(document.getElementById(id)?.value)]));
    if(Object.values(values).some(value=>value===null)){
      return "Saisissez toutes les valeurs avec un format numérique valide.";
    }

    const capital=values.capital, versement=values.versement, rendement=values.rendement, feeOnContribution=values["frais-versement"], feeManagement=values["frais-gestion"], annees=values.annees;
    if([capital,versement,feeOnContribution,feeManagement,annees].some(value=>value<0)){
      return "Le capital, les versements, les frais et la durée ne peuvent pas être négatifs.";
    }
    if(annees>80){
      return "Choisissez une durée inférieure ou égale à 80 ans.";
    }
    if(rendement<-100 || rendement>100){
      return "Le rendement doit être compris entre -100 % et 100 %.";
    }
    if(feeOnContribution>100 || feeManagement>100){
      return "Les frais doivent être compris entre 0 % et 100 %.";
    }

    const months=Math.round(annees*12);
    const contributionFactor=1-feeOnContribution/100;
    const monthlyRate=(rendement-feeManagement)/100/12;
    const initialNet=capital*contributionFactor;
    const monthlyNet=versement*contributionFactor;

    let finalCapital;
    if(Math.abs(monthlyRate)<1e-15){
      finalCapital=initialNet+monthlyNet*months;
    }else{
      finalCapital=initialNet*Math.pow(1+monthlyRate,months)+monthlyNet*(Math.pow(1+monthlyRate,months)-1)/monthlyRate;
    }

    if(!Number.isFinite(finalCapital)){
      return "Le résultat est trop grand pour être représenté.";
    }

    const totalVerse=capital+versement*months;
    const gain=finalCapital-totalVerse;

    const grossMonthlyRate=rendement/100/12;
    let noFeeCapital;
    if(Math.abs(grossMonthlyRate)<1e-15){
      noFeeCapital=totalVerse;
    }else{
      noFeeCapital=capital*Math.pow(1+grossMonthlyRate,months)+versement*(Math.pow(1+grossMonthlyRate,months)-1)/grossMonthlyRate;
    }
    const feeImpact=Math.max(0,noFeeCapital-finalCapital);
    const netAnnualRate=rendement-feeManagement;

    return '<div class="result-main"><span class="result-label">Capital final estimé</span><strong>'+formatEuro(finalCapital)+'</strong></div>'+
      '<div class="takeaway"><div class="takeaway-title">À retenir</div><div class="takeaway-grid">'+
      '<div class="takeaway-item"><small>Total des versements</small><strong>'+formatEuro(totalVerse)+'</strong></div>'+
      '<div class="takeaway-item"><small>Gain après frais</small><strong>'+formatEuro(gain)+'</strong></div>'+
      '<div class="takeaway-item"><small>Rendement annuel après frais</small><strong>'+formatNumber(netAnnualRate)+' %</strong></div>'+
      '</div></div>'+
      '<div class="scenario"><div class="scenario-title">Impact des frais</div><div class="scenario-grid">'+
      '<div class="scenario-item"><small>Projection sans frais</small><strong>'+formatEuro(noFeeCapital)+'</strong></div>'+
      '<div class="scenario-item"><small>Écart estimé en fin de période</small><strong>'+formatEuro(feeImpact)+'</strong></div>'+
      '</div></div>';
  }

  window.assuranceVie={calculate};
})();
