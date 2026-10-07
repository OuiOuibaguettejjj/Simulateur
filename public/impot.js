(function(){
  const params=window.Parametres.get("impot-sur-le-revenu").values;
  const BRACKETS=params.brackets.map(([limit,rate])=>[limit===null?Infinity:limit,rate]);
  const FAMILY_QUOTIENT_CAP=params.familyQuotientCap;
  function roundEuro(value){return Math.floor(value+0.5);}
  function taxForQuotient(q){
    let tax=0, previous=0;
    for(const [limit,rate] of BRACKETS){
      tax += Math.max(0,Math.min(q,limit)-previous)*rate;
      if(q<=limit) break;
      previous=limit;
    }
    return tax;
  }
  function calculate({income,parts,couple,sourceWithholding=0}){
    const revenu=Number(income), p=Number(parts), isCouple=Boolean(couple);
    const withholding=Number(sourceWithholding);
    if(!Number.isFinite(revenu)||revenu<0||!Number.isFinite(p)||p<=0||!Number.isFinite(withholding)||withholding<0){
      return {valid:false,reason:"Valeurs invalides."};
    }
    const taxableIncome=roundEuro(revenu);
    const quotient=taxableIncome/p;
    const rawTax=taxForQuotient(quotient)*p;
    const baseParts=isCouple?2:1;
    const extraHalfParts=Math.max(0,Math.round((p-baseParts)*2));
    let familyQuotientCap=0, cappedTax=rawTax;
    if(extraHalfParts>0){
      const referenceTax=roundEuro(taxForQuotient(taxableIncome/baseParts)*baseParts);
      familyQuotientCap=FAMILY_QUOTIENT_CAP*extraHalfParts;
      cappedTax=Math.max(roundEuro(rawTax),referenceTax-familyQuotientCap);
    }
    const grossTax=roundEuro(Math.max(0,cappedTax));
    const decoteRules=isCouple?params.decote.couple:params.decote.single;
    const decote=roundEuro(grossTax<decoteRules.threshold?Math.max(0,decoteRules.base-decoteRules.rate*grossTax):0);
    const netTax=roundEuro(Math.max(0,grossTax-decote));
    const balance=netTax-withholding;
    const tmi=quotient<=BRACKETS[0][0]?0:quotient<=BRACKETS[1][0]?11:quotient<=BRACKETS[2][0]?30:quotient<=BRACKETS[3][0]?41:45;
    return {valid:true,taxableIncome,rawTax,grossTax,familyQuotientCap,decote,netTax,sourceWithholding:withholding,balance,tmi};
  }
  window.ImpotEngine=Object.freeze({calculate,brackets:BRACKETS,familyQuotientCap:FAMILY_QUOTIENT_CAP});
})();