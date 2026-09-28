(function(){
  const PARAMS = Object.freeze({
    effectiveFrom: "2026-04-01",
    effectiveTo: "2027-03-31",
    base: 651.69,
    childIncrease: 260.68,\n    coupleChildIncrease: 195.51,
    majorationBase: 836.85,
    majorationChildIncrease: 278.95,
    housing: { one: 78.20, two: 156.41, threePlus: 193.55 },
    youngActiveHours: 3214
  });

  function round2(n){ return Math.round((n + Number.EPSILON) * 100) / 100; }
  function money(n){ return Number(n).toLocaleString("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:2}); }
  function housingFlat(people){ return people<=1 ? PARAMS.housing.one : people===2 ? PARAMS.housing.two : PARAMS.housing.threePlus; }
  function householdBase(single, dependents, majoration){
    if(majoration && single) return PARAMS.majorationBase + Math.max(0, dependents) * PARAMS.majorationChildIncrease;
    return single ? PARAMS.base + Math.max(0, dependents) * PARAMS.childIncrease
                  : PARAMS.base * 1.5 + Math.max(0, dependents) * PARAMS.coupleChildIncrease;
  }
  function validNumber(v){ return Number.isFinite(Number(v)) && Number(v)>=0; }

  window.RSAEngine = {
    params: PARAMS,
    calculate(input){
      const age=Number(input.age), dependents=Number(input.dependents)||0;
      const single=input.status==="single";
      const student=input.student==="yes";
      const youngActive=input.youngActive==="yes";
      const isolatedMajoration=input.majoration==="yes";
      const resident=input.resident==="yes";

      if(!resident) return {eligible:false,reason:"Le simulateur suppose une résidence stable et effective en France. Cette condition doit être vérifiée par la Caf."};
      if(age<18) return {eligible:false,reason:"Le RSA est ouvert à partir de 18 ans, sous conditions."};
      if(age<25 && !(single && dependents>0) && !(youngActive && !student)){
        return {eligible:false,reason:"Entre 18 et 24 ans, des conditions particulières s'appliquent. Le simulateur demande notamment le statut de jeune actif ou de parent isolé."};
      }
      if(student && !(single && dependents>0)){
        return {eligible:false,reason:"Le RSA n'est en principe pas ouvert aux étudiants, sauf situations particulières notamment de parent isolé. La Caf doit confirmer le droit."};
      }
      if(!single && isolatedMajoration){
        return {eligible:false,reason:"La majoration pour isolement concerne un foyer isolé."};
      }

      const months=input.months||[];
      if(months.length!==3 || months.some(m=>!validNumber(m))) {
        return {eligible:false,reason:"Les ressources des trois mois de référence doivent être renseignées avec des montants valides."};
      }
      const avg=round2(months.reduce((a,b)=>a+Number(b),0)/3);
      const people=1+(single?0:1)+dependents;
      const majoration=isolatedMajoration && single;
      const forfait=round2(householdBase(single,dependents,majoration));
      const logement=input.housing==="forfait" ? housingFlat(people) : 0;
      const rsa=round2(Math.max(0,forfait-avg-logement));

      return {
        eligible:true,
        averageResources:avg,
        forfait,
        logement,
        rsa,
        people,
        majoration,
        months:months.map(Number)
      };
    },
    money
  };
})();