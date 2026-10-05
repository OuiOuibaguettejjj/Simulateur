(function(){
  const $=id=>document.getElementById(id);
  const euro=value=>Number(value).toLocaleString("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:2});
  const num=value=>Number(value).toLocaleString("fr-FR",{maximumFractionDigits:2});
  const INVALID_RESULT=/NaN|undefined|Infinity|∞/;

  window.Simulateurs={
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
    },
    convert({value,from,to,units}){
      const x=typeof value==="string"&&value.trim()===""?NaN:Number(value);
      if(!Number.isFinite(x)||x<0||!units?.[from]||!units?.[to]) return null;
      const result=x*units[from].factor/units[to].factor;
      if(!Number.isFinite(result)) return null;
      return result;
    }
  };
})();
