(function(){
  const $=id=>document.getElementById(id);
  const euro=value=>Number(value).toLocaleString("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:2});
  const num=value=>Number(value).toLocaleString("fr-FR",{maximumFractionDigits:2});

  const groups={
    "smic":["Salaire","/salaire/",[["salaire-brut-net","Salaire brut ↔ net","Estimer le net avant impôt."],["salaire-horaire","Salaire horaire","Calculer le taux horaire."]]],
    "taux-endettement":["Immobilier","/immobilier/",[["capacite-emprunt","Capacité d’emprunt","Estimer le capital empruntable."],["pret-immobilier","Prêt immobilier","Calculer mensualité et coût du crédit."]]],
    "indemnite-precarite":["Travail","/travail/",[["preavis-demission","Préavis de démission","Estimer la durée du préavis."],["rupture-conventionnelle","Rupture conventionnelle","Estimer l’indemnité minimale."]]],
    "heures-supplementaires":["Salaire","/salaire/",[["salaire-brut-net","Salaire brut ↔ net","Estimer le net avant impôt."],["salaire-horaire","Salaire horaire","Calculer le taux horaire."]]],
    "temps-partiel":["Salaire","/salaire/",[["salaire-brut-net","Salaire brut ↔ net","Estimer le net avant impôt."],["salaire-horaire","Salaire horaire","Calculer le taux horaire."]]],
    "prelevement-source":["Fiscalité","/fiscalite/",[["impot-sur-le-revenu","Impôt sur le revenu","Estimer l'impôt annuel."],["salaire-brut-net","Salaire brut ↔ net","Estimer le net avant impôt."]]],
    "ifi":["Immobilier","/immobilier/",[["plus-value-immobiliere","Plus-value immobilière","Calculer une plus-value immobilière."],["frais-de-notaire","Frais de notaire","Estimer les frais d'acquisition."]]],
    "epargne-reglementee":["Épargne","/epargne/",[["interets-composes","Intérêts composés","Projeter un capital."],["epargne-mensuelle","Épargne mensuelle","Calculer un effort d'épargne."]]],
    "assurance-vie":["Épargne","/epargne/",[["interets-composes","Intérêts composés","Projeter un capital."],["epargne-mensuelle","Épargne mensuelle","Calculer un effort d'épargne."]]],
    "per":["Épargne","/epargne/",[["interets-composes","Intérêts composés","Projeter un capital."],["retraite-simplifiee","Retraite simplifiée","Estimer une pension de base."]]],
    "salaire-brut-net":["Salaire","/salaire/",[
      ["salaire-horaire","Salaire horaire","Convertir un salaire en taux horaire."],
      ["rupture-conventionnelle","Rupture conventionnelle","Estimer l’indemnité minimale."],
      ["indemnite-licenciement","Indemnité de licenciement","Estimer l’indemnité légale."],
      ["solde-tout-compte","Solde de tout compte","Estimer les sommes dues au départ."]
    ]],
    "salaire-horaire":["Salaire","/salaire/",[
      ["salaire-brut-net","Salaire brut ↔ net","Passer du brut au net avant impôt."],
      ["frais-kilometriques","Frais kilométriques","Estimer les frais professionnels."],
      ["temps-travail","Temps de travail","Calculer une durée travaillée."]
    ]],
    "capacite-emprunt":["Immobilier","/immobilier/",[
      ["pret-immobilier","Prêt immobilier","Calculer mensualité et coût du crédit."],
      ["mensualite-pret","Mensualité de prêt","Calculer une mensualité à taux fixe."],
      ["tableau-amortissement","Tableau d’amortissement","Voir la répartition capital/intérêts."],
      ["frais-de-notaire","Frais de notaire","Estimer les frais d’acquisition."]
    ]],
    "pret-immobilier":["Immobilier","/immobilier/",[
      ["capacite-emprunt","Capacité d’emprunt","Estimer le capital empruntable."],
      ["mensualite-pret","Mensualité de prêt","Calculer une mensualité."],
      ["tableau-amortissement","Tableau d’amortissement","Détailler le remboursement du prêt."],
      ["frais-de-notaire","Frais de notaire","Estimer les frais d’acquisition."]
    ]],
    "mensualite-pret":["Immobilier","/immobilier/",[
      ["pret-immobilier","Prêt immobilier","Calculer le coût total du crédit."],
      ["capacite-emprunt","Capacité d’emprunt","Estimer le capital empruntable."],
      ["tableau-amortissement","Tableau d’amortissement","Détailler les échéances."],
      ["rendement-locatif","Rendement locatif","Évaluer un investissement locatif."]
    ]],
    "frais-de-notaire":["Immobilier","/immobilier/",[
      ["pret-immobilier","Prêt immobilier","Calculer le coût du financement."],
      ["capacite-emprunt","Capacité d’emprunt","Estimer votre budget d’emprunt."],
      ["rendement-locatif","Rendement locatif","Calculer la rentabilité d’un bien."],
      ["plus-value-immobiliere","Plus-value immobilière","Estimer une plus-value à la revente."]
    ]],
    "succession":["Fiscalité","/fiscalite/",[["donation","Droits de donation","Estimer les droits selon le lien de parenté."],["impot-sur-le-revenu","Impôt sur le revenu","Estimer l’impôt sur le revenu."],["assurance-vie","Assurance-vie","Comprendre le traitement fiscal de l’assurance-vie."]]],\n    "impot-sur-le-revenu":["Fiscalité","/fiscalite/",[
      ["tva","TVA : HT ↔ TTC","Calculer HT, TTC et TVA."],
      ["plus-value-mobiliere","Plus-value mobilière","Estimer l’imposition d’une plus-value."],
      ["donation","Donation","Estimer les droits selon le lien familial."],
      ["succession","Succession","Estimer les droits de succession."]
    ]],
    "tva":["Fiscalité","/fiscalite/",[
      ["impot-sur-le-revenu","Impôt sur le revenu","Estimer l’impôt sur le revenu."],
      ["plus-value-mobiliere","Plus-value mobilière","Estimer une imposition sur plus-value."],
      ["donation","Donation","Estimer les droits de donation."]
    ]],
    "plus-value-mobiliere":["Fiscalité","/fiscalite/",[
      ["impot-sur-le-revenu","Impôt sur le revenu","Estimer l’impôt sur le revenu."],
      ["tva","TVA : HT ↔ TTC","Calculer une TVA."],
      ["donation","Donation","Estimer les droits de donation."]
    ]],
    "age-retraite":["Retraite","/retraite/",[
      ["retraite-simplifiee","Retraite simplifiée","Obtenir une première estimation de pension."],
      ["age","Quel âge ai-je ?","Calculer précisément un âge."],
      ["salaire-brut-net","Salaire brut ↔ net","Estimer son salaire net."]
    ]],
    "are-chomage":["Travail","/travail/",[
      ["indemnites-maladie","Indemnités maladie","Estimer les indemnités journalières."],
      ["rupture-conventionnelle","Rupture conventionnelle","Estimer l’indemnité minimale."],
      ["solde-tout-compte","Solde de tout compte","Estimer les sommes dues au départ."],
      ["preavis-demission","Préavis de démission","Estimer la durée du préavis."]
    ]],
    "rupture-conventionnelle":["Travail","/travail/",[
      ["indemnite-licenciement","Indemnité de licenciement","Estimer l’indemnité légale."],
      ["preavis-demission","Préavis de démission","Calculer la date de fin du préavis."],
      ["solde-tout-compte","Solde de tout compte","Estimer les sommes dues au départ."],
      ["are-chomage","Allocation chômage (ARE)","Obtenir une première estimation de l’ARE."]
    ]],
    "preavis-demission":["Travail","/travail/",[
      ["rupture-conventionnelle","Rupture conventionnelle","Estimer l’indemnité minimale."],
      ["indemnite-licenciement","Indemnité de licenciement","Estimer l’indemnité légale."],
      ["solde-tout-compte","Solde de tout compte","Estimer les sommes dues au départ."],
      ["are-chomage","Allocation chômage (ARE)","Estimer l’allocation chômage."]
    ]]
  };

  function addBreadcrumbSchema(tool,slug,group){
    const itemList=[{"@type":"ListItem","position":1,"name":"Accueil","item":"https://simulateur.site/"}];
    if(group) itemList.push({"@type":"ListItem","position":2,"name":group[0],"item":"https://simulateur.site"+group[1]});
    itemList.push({"@type":"ListItem","position":itemList.length+1,"name":tool.title||document.title,"item":location.href.split("#")[0]});
    const script=document.createElement("script");
    script.type="application/ld+json";
    script.textContent=JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":itemList});
    document.head.appendChild(script);
  }

  function addVisibleBreadcrumb(tool,group){
    if(document.querySelector(".breadcrumb")) return;
    const host=document.querySelector("main .wrap")||document.querySelector("main");
    if(!host) return;
    const b=document.createElement("div");
    b.className="breadcrumb";
    b.innerHTML='<a href="/">Accueil</a>'+(group?' · <a href="'+group[1]+'">'+group[0]+"</a>":"")+' · '+(tool.title||document.title);
    host.insertBefore(b,host.firstElementChild);
  }

  function addRelatedTools(slug,group){
    const data=groups[slug];
    if(!data || document.querySelector(".related-tools")) return;
    const host=document.querySelector("main");
    if(!host) return;
    const section=document.createElement("section");
    section.className="related-tools";
    section.innerHTML='<div><div class="eyebrow">À VOIR AUSSI</div><h2>Calculs associés</h2><div class="related-links">'+
      data[2].map(x=>'<a class="related-link" href="/outil/'+x[0]+'/"><strong>'+x[1]+'</strong><span>'+x[2]+"</span></a>").join("")+
      '</div><p class="status-note">Retrouvez aussi tous les outils de la rubrique <a href="'+data[1]+'">'+data[0]+"</a>.</p></div>";
    host.appendChild(section);
  }

  window.Simulateurs={
    render(){
      const tool=window.TOOL;
      if(!tool){ $("result").textContent="Calculateur indisponible."; return; }
      try{
        $("ey").textContent=tool.ey||"";
        $("title").textContent=tool.title||"";
        $("intro").textContent=tool.intro||"";
        const renderedFields=typeof tool.fields==="function"?tool.fields():"";
        if(renderedFields) $("fields").innerHTML=renderedFields;
        $("source").textContent=tool.source||"";
        document.title=(tool.title||"Simulateur")+" | Simulateur";
        const slug=(location.pathname.match(/\/outil\/([^/]+)/)||[])[1];
        const group=slug&&groups[slug];
        addBreadcrumbSchema(tool,slug,group);
        addVisibleBreadcrumb(tool,group);
        addRelatedTools(slug,group);
      }catch(error){
        $("result").textContent="Impossible de charger ce calculateur.";
        console.error("Simulateurs.render:",error);
      }
    },
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