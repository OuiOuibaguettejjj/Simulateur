(function(){
  const PARAMS = Object.freeze({
    effectiveFrom: "2026-04-01",
    effectiveTo: "2027-03-31",
    base: 651.69,
    childIncrease: 260.68,
    coupleChildIncrease: 195.51,
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
      const age=Number(input.age);
      const dependents=Number(input.dependents);
      const single=input.status==="single";
      const student=input.student==="yes";
      const youngActive=input.youngActive==="yes";
      const isolatedMajoration=input.majoration==="yes";
      const resident=input.resident==="yes";

      if(!Number.isInteger(age) || age<0) return {eligible:false,reason:"L'âge renseigné est invalide."};
      if(!Number.isInteger(dependents) || dependents<0) return {eligible:false,reason:"Le nombre de personnes à charge doit être un entier positif ou nul."};
      if(!resident) return {eligible:false,reason:"Le simulateur suppose une résidence stable et effective en France. La Caf doit vérifier la condition de résidence et, le cas échéant, le droit au séjour."};
      if(age<18) return {eligible:false,reason:"Le RSA est ouvert à partir de 18 ans, sous conditions."};
      if(age<25 && !(single && dependents>0) && !(youngActive && !student)){
        return {eligible:false,reason:"Entre 18 et 24 ans, le RSA est soumis à des conditions particulières, notamment de parent isolé ou de jeune actif ayant exercé au moins 3 214 heures sur les 3 années précédentes."};
      }
      if(student && !(single && dependents>0)){
        return {eligible:false,reason:"Le RSA n'est en principe pas ouvert aux étudiants, sauf situations particulières, notamment de parent isolé. La Caf doit confirmer le droit."};
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

      // Housing deduction: when the actual housing aid is below the forfait,
      // the aid itself is deducted; otherwise the statutory housing forfait applies.
      let logement=0;
      if(input.housing==="forfait") logement=housingFlat(people);
      if(input.housing==="aidBelowForfait"){
        const aid=Number(input.housingAid);
        if(!validNumber(aid) || aid>housingFlat(people)){
          return {eligible:false,reason:"Le montant de l'aide au logement doit être compris entre 0 € et le forfait logement applicable au foyer."};
        }
        logement=round2(aid);
      }

      const rsa=round2(Math.max(0,forfait-avg-logement));

      return {
        eligible:true,
        averageResources:avg,
        forfait,
        logement,
        rsa,
        people,
        majoration,
        months:months.map(Number),
        scope:"estimation_simplifiée"
      };
    },
    money
  };
})();