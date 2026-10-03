(function(){
  const $=id=>document.getElementById(id);
  const euro=value=>Number(value).toLocaleString("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:2});
  const num=value=>Number(value).toLocaleString("fr-FR",{maximumFractionDigits:2});

  window.Simulateurs={
    calc(){
      const tool=window.TOOL;
      if(!tool){ $("result").textContent="Calculateur indisponible."; return; }
      try{
        $("result").innerHTML=tool.calc.call({$,euro,num});
      }catch(error){
        $("result").textContent="Valeurs invalides ou insuffisantes.";
        console.error("Simulateurs.calc:",error);
      }
    }
  };
})();
