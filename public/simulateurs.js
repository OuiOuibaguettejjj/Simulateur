(function(){
  const $=id=>document.getElementById(id);
  const euro=value=>Number(value).toLocaleString("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:2});
  const num=value=>Number(value).toLocaleString("fr-FR",{maximumFractionDigits:2});
  const INVALID_RESULT=/NaN|undefined|Infinity|∞/;

  window.Simulateurs={
    convert({value,from,to,units}){
      const source=units?.[from],target=units?.[to];
      if(!Number.isFinite(value)||!source||!target){ return NaN; }
      return value*source.factor/target.factor;
    },
    calc(){
      const tool=window.TOOL;
      if(!tool){ $("result").textContent="Calculateur indisponible."; return; }
      try{
        const html=tool.calc.call({$,euro,num});
        if(typeof html!=="string"||INVALID_RESULT.test(html)){
          $("result").textContent="Valeurs invalides ou insuffisantes.";
          return;
        }
        $("result").innerHTML=html;
      }catch(error){
        $("result").textContent="Valeurs invalides ou insuffisantes.";
        console.error("Simulateurs.calc:",error);
      }
    }
  };
})();
