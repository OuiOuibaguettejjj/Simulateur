(function(){
  const BRACKETS = Object.freeze([[11600,0],[29579,0.11],[84577,0.30],[181917,0.41],[Infinity,0.45]]);
  const FAMILY_QUOTIENT_CAP = 1807;
  function taxForQuotient(q){
    let tax=0, previous=0;
    for(const [limit,rate] of BRACKETS){
      tax += Math.max(0,Math.min(q,limit)-previous)*rate;
      if(q<=limit) break;
      previous=limit;
    }
    return tax;
  }
  function calculate({income,parts,couple}){
    const revenu=Number(income), p=Number(parts), isCouple=Boolean(couple);
    if(!Number.isFinite(revenu)||revenu<0||!Number.isFinite(p)||p<=0) return {valid:false,reason:"Valeurs invalides."};
    const quotient=revenu/p;
    const rawTax=taxForQuotient(quotient)*p;
    const baseParts=isCouple?2:1;
    const extraHalfParts=Math.max(0,Math.round((p-baseParts)*2));
    let familyQuotientCap=0, cappedTax=rawTax;
    if(extraHalfParts>0){
      const referenceTax=taxForQuotient(revenu/baseParts)*baseParts;
      familyQuotientCap=FAMILY_QUOTIENT_CAP*extraHalfParts;
      cappedTax=Math.max(rawTax,referenceTax-familyQuotientCap);
    }
    const grossTax=Math.max(0,cappedTax);
    const decoteThreshold=isCouple?3249:1964;
    const decoteBase=isCouple?1470:889;
    const decote=grossTax<decoteThreshold?Math.max(0,decoteBase-0.4525*grossTax):0;
    const netTax=Math.max(0,grossTax-decote);
    const tmi=quotient<=11600?0:quotient<=29579?11:quotient<=84577?30:quotient<=181917?41:45;
    return {valid:true,rawTax,grossTax,familyQuotientCap,decote,netTax,tmi};
  }
  window.ImpotEngine=Object.freeze({calculate,brackets:BRACKETS,familyQuotientCap:FAMILY_QUOTIENT_CAP});
})();