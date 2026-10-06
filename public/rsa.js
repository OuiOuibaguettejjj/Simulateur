(function(){
  // Paramètres réglementaires centralisés dans data/parametres.json.
  const SET = window.Parametres.get("rsa");
  const PARAMS = Object.freeze(Object.assign({ effectiveFrom: SET.effectiveFrom, effectiveTo: SET.effectiveTo }, SET.values));
  const hoursLabel = String(PARAMS.youngActiveHours).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  function round2(n){ return Math.round((n + Number.EPSILON) * 100) / 100; }
  function money(n){ return Number(n).toLocaleString("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:2}); }
  function housingFlat(people){ return people<=1 ? PARAMS.housing.one : people===2 ? PARAMS.housing.two : PARAMS.housing.threePlus; }
  function householdBase(single, dependents, majoration){
    const d = Math.max(0, dependents);
    if(majoration && single) return round2(PARAMS.majorationBase + d * PARAMS.majorationChildIncrease);
    const amounts = single ? PARAMS.singleAmounts : PARAMS.coupleAmounts;
    if(d <= 3) return amounts[d];
    return round2(amounts[3] + (d - 3) * PARAMS.childIncrease);
  }
  function validNumber(v){
    if(typeof v === "string" && v.trim() === "") return false;
    return Number.isFinite(Number(v)) && Number(v)>=0;
  }

  window.RSAEngine = {
    params: PARAMS,
    calculate(input){
      const asOf = input.asOf || new Date().toISOString().slice(0,10);
      if (asOf < PARAMS.effectiveFrom || asOf > PARAMS.effectiveTo) {
        return {eligible:false,reason:"Le barème RSA utilisé par ce simulateur n'est pas valable à cette date. Vérifiez le barème actuellement applicable."};
      }

      const age=Number(input.age);
      const dependents=Number(input.dependents);
      const single=input.status==="single";
      const student=input.student==="yes";
      const youngActive=input.youngActive==="yes";
      const pregnant=input.pregnant==="yes";
      const resident=input.resident==="yes";
      const majoration=single && (pregnant || dependents>0 && input.majoration==="yes");

      if(!Number.isInteger(age) || age<0) return {eligible:false,reason:"L'âge renseigné est invalide."};
      if(!Number.isInteger(dependents) || dependents<0) return {eligible:false,reason:"Le nombre de personnes à charge doit être un entier positif ou nul."};
      if(!resident) return {eligible:false,reason:"Le simulateur suppose une résidence stable et effective en France. La Caf vérifie aussi les éventuelles conditions liées à la nationalité et au séjour."};
      if(age<18 && dependents===0 && !pregnant) return {eligible:false,reason:"Le RSA peut être ouvert sans condition d’âge lorsque vous assumez la charge d’un enfant né ou à naître. Dans les autres situations, le simulateur ne retient pas le RSA avant 18 ans."};
      if(age<25 && dependents===0 && !pregnant && !(youngActive && !student)){
        return {eligible:false,reason:"Entre 18 et 24 ans, le RSA est soumis à des conditions particulières : parent isolé ou jeune actif ayant exercé au moins " + hoursLabel + " heures sur les 3 années précédentes."};
      }
      if(student && !(single && (dependents>0 || pregnant))){
        return {eligible:false,reason:"Le RSA n'est en principe pas ouvert aux étudiants, sauf situations particulières, notamment de parent isolé. La Caf doit confirmer le droit."};
      }
      if(input.majoration==="yes" && !(single && (dependents>0 || pregnant))){
        return {eligible:false,reason:"La majoration parent isolé suppose une situation d'isolement avec enfant à charge. La grossesse peut ouvrir un droit à majoration dans certaines conditions."};
      }

      const months=input.months||[];
      if(months.length!==3 || months.some(m=>!validNumber(m))) {
        return {eligible:false,reason:"Les ressources des trois mois de référence doivent être renseignées avec des montants valides."};
      }

      const averageResources=round2(months.reduce((a,b)=>a+Number(b),0)/3);
      const people=1+(single?0:1)+dependents;
      const forfait=round2(householdBase(single,dependents,majoration));

      // Une aide au logement ou l'absence de charge de logement entraîne le forfait logement.
      // Une charge de logement réellement supportée et sans aide n'entraîne pas ce forfait.
      const logement=input.housing==="aidOrFree" ? housingFlat(people) : 0;
      const rsa=round2(Math.max(0,forfait-averageResources-logement));

      return {
        eligible:true,
        averageResources,
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