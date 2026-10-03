(function(){
  const $=id=>document.getElementById(id);
  const euro=value=>Number(value).toLocaleString("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:2});
  const num=value=>Number(value).toLocaleString("fr-FR",{maximumFractionDigits:2});


  // Taxonomie officielle : une seule catégorie principale et un seul type par outil.
  // Les URLs /outil/<slug>/ restent inchangées. Les relations historiques ci-dessous seront migrées séparément.
  const CATEGORIES={"argent":{"label":"Argent","path":"/argent/"},"epargne":{"label":"Épargne","path":"/epargne/"},"immobilier":{"label":"Immobilier","path":"/immobilier/"},"fiscalite":{"label":"Fiscalité","path":"/fiscalite/"},"retraite":{"label":"Retraite","path":"/retraite/"},"salaire":{"label":"Salaire","path":"/salaire/"},"travail":{"label":"Travail","path":"/travail/"},"temps":{"label":"Temps","path":"/temps/"},"mesures":{"label":"Mesures","path":"/mesures/"},"vie":{"label":"Vie quotidienne","path":"/vie-quotidienne/"}};
  const TOOL_TYPES={"arrondi":"calculateur","calculatrice":"calculateur","coefficient":"calculateur","fractions":"calculateur","marge":"calculateur","median-mode":"calculateur","moyenne-ponderee":"calculateur","moyenne":"calculateur","pourcentage":"calculateur","proportion":"calculateur","ratio":"calculateur","remise":"calculateur","salaire-horaire":"calculateur","mensualite-pret":"calculateur","epargne":"calculateur","signe-astrologique":"calculateur","frais-kilometriques":"calculateur","difference-dates":"calculateur","temps-travail":"calculateur","temps-calcul":"calculateur","age":"calculateur","jours-ouvres":"calculateur","surface":"calculateur","vitesse":"calculateur","electricite":"calculateur","consommation-carburant":"calculateur","cout-km":"calculateur","perimetre":"calculateur","promotions":"calculateur","partage-depenses":"calculateur","recette":"calculateur","pourboire":"calculateur","prix-unitaire":"calculateur","age-retraite":"simulateur","are-chomage":"simulateur","assurance-vie":"simulateur","capacite-emprunt":"simulateur","cash-flow-immobilier":"simulateur","charges-independant":"simulateur","conges-payes":"simulateur","donation":"simulateur","epargne-mensuelle":"simulateur","epargne-reglementee":"simulateur","frais-de-notaire":"simulateur","heures-supplementaires":"simulateur","ifi":"simulateur","impot-sur-le-revenu":"simulateur","indemnite-licenciement":"simulateur","indemnite-precarite":"simulateur","indemnites-maladie":"simulateur","indemnites-maternite-paternite":"simulateur","inflation":"simulateur","interets-composes":"simulateur","micro-entrepreneur":"simulateur","per":"simulateur","plus-value-immobiliere":"simulateur","plus-value-mobiliere":"simulateur","preavis-demission":"simulateur","prelevement-source":"simulateur","pret-immobilier":"simulateur","prime-activite":"simulateur","ptz":"simulateur","rendement-locatif":"simulateur","retraite-simplifiee":"simulateur","rsa":"simulateur","rupture-conventionnelle":"simulateur","salaire-brut-net":"simulateur","smic":"simulateur","solde-tout-compte":"simulateur","succession":"simulateur","tableau-amortissement":"simulateur","taux-endettement":"simulateur","temps-partiel":"simulateur","tva":"simulateur","comparateur-placements":"comparateur","sasu-vs-ei-micro":"comparateur","temps":"conversion"};
  const TOOLS_META={"arrondi":{"type":"calculateur","category":"argent"},"calculatrice":{"type":"calculateur","category":"argent"},"coefficient":{"type":"calculateur","category":"argent"},"fractions":{"type":"calculateur","category":"argent"},"marge":{"type":"calculateur","category":"argent"},"median-mode":{"type":"calculateur","category":"argent"},"moyenne-ponderee":{"type":"calculateur","category":"argent"},"moyenne":{"type":"calculateur","category":"argent"},"pourcentage":{"type":"calculateur","category":"argent"},"proportion":{"type":"calculateur","category":"argent"},"ratio":{"type":"calculateur","category":"argent"},"remise":{"type":"calculateur","category":"argent"},"prix-unitaire":{"type":"calculateur","category":"argent"},"assurance-vie":{"type":"simulateur","category":"epargne"},"comparateur-placements":{"type":"comparateur","category":"epargne"},"epargne-mensuelle":{"type":"simulateur","category":"epargne"},"epargne-reglementee":{"type":"simulateur","category":"epargne"},"epargne":{"type":"calculateur","category":"epargne"},"inflation":{"type":"simulateur","category":"epargne"},"interets-composes":{"type":"simulateur","category":"epargne"},"per":{"type":"simulateur","category":"epargne"},"capacite-emprunt":{"type":"simulateur","category":"immobilier"},"cash-flow-immobilier":{"type":"simulateur","category":"immobilier"},"frais-de-notaire":{"type":"simulateur","category":"immobilier"},"ifi":{"type":"simulateur","category":"immobilier"},"mensualite-pret":{"type":"calculateur","category":"immobilier"},"plus-value-immobiliere":{"type":"simulateur","category":"immobilier"},"pret-immobilier":{"type":"simulateur","category":"immobilier"},"ptz":{"type":"simulateur","category":"immobilier"},"rendement-locatif":{"type":"simulateur","category":"immobilier"},"tableau-amortissement":{"type":"simulateur","category":"immobilier"},"taux-endettement":{"type":"simulateur","category":"immobilier"},"donation":{"type":"simulateur","category":"fiscalite"},"impot-sur-le-revenu":{"type":"simulateur","category":"fiscalite"},"plus-value-mobiliere":{"type":"simulateur","category":"fiscalite"},"prelevement-source":{"type":"simulateur","category":"fiscalite"},"succession":{"type":"simulateur","category":"fiscalite"},"tva":{"type":"simulateur","category":"fiscalite"},"age-retraite":{"type":"simulateur","category":"retraite"},"retraite-simplifiee":{"type":"simulateur","category":"retraite"},"salaire-brut-net":{"type":"simulateur","category":"salaire"},"salaire-horaire":{"type":"calculateur","category":"salaire"},"heures-supplementaires":{"type":"simulateur","category":"salaire"},"smic":{"type":"simulateur","category":"salaire"},"temps-partiel":{"type":"simulateur","category":"salaire"},"are-chomage":{"type":"simulateur","category":"travail"},"charges-independant":{"type":"simulateur","category":"travail"},"conges-payes":{"type":"simulateur","category":"travail"},"frais-kilometriques":{"type":"calculateur","category":"travail"},"indemnite-licenciement":{"type":"simulateur","category":"travail"},"indemnite-precarite":{"type":"simulateur","category":"travail"},"indemnites-maladie":{"type":"simulateur","category":"travail"},"indemnites-maternite-paternite":{"type":"simulateur","category":"travail"},"micro-entrepreneur":{"type":"simulateur","category":"travail"},"preavis-demission":{"type":"simulateur","category":"travail"},"prime-activite":{"type":"simulateur","category":"travail"},"rsa":{"type":"simulateur","category":"travail"},"rupture-conventionnelle":{"type":"simulateur","category":"travail"},"sasu-vs-ei-micro":{"type":"comparateur","category":"travail"},"solde-tout-compte":{"type":"simulateur","category":"travail"},"age":{"type":"calculateur","category":"temps"},"difference-dates":{"type":"calculateur","category":"temps"},"jours-ouvres":{"type":"calculateur","category":"temps"},"temps-calcul":{"type":"calculateur","category":"temps"},"temps-travail":{"type":"calculateur","category":"temps"},"temps":{"type":"conversion","category":"temps"},"consommation-carburant":{"type":"calculateur","category":"mesures"},"cout-km":{"type":"calculateur","category":"mesures"},"electricite":{"type":"calculateur","category":"mesures"},"perimetre":{"type":"calculateur","category":"mesures"},"surface":{"type":"calculateur","category":"mesures"},"vitesse":{"type":"calculateur","category":"mesures"},"partage-depenses":{"type":"calculateur","category":"vie"},"pourboire":{"type":"calculateur","category":"vie"},"promotions":{"type":"calculateur","category":"vie"},"recette":{"type":"calculateur","category":"vie"},"signe-astrologique":{"type":"calculateur","category":"vie"}};
  function toolMeta(slug){return TOOLS_META[slug]||null}

  const groups={
    "temps":["Temps","/temps/",[
      ["difference-dates","Différence entre deux dates","Calculer l’écart entre deux dates."],
      ["temps-travail","Temps de travail","Calculer une durée de travail."],
      ["age","Calcul d’âge","Calculer précisément un âge."]
    ]],
    "rsa":["Protection sociale","/simulateurs/",[["prime-activite","Prime d’activité","Estimer la prime d’activité."],["salaire-brut-net","Salaire brut ↔ net","Estimer le salaire net."],["are-chomage","Allocation chômage ARE","Obtenir une estimation indicative de l’ARE."],["succession","Droits de succession","Estimer les droits selon la situation."]]],
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
    "succession":["Fiscalité","/fiscalite/",[["donation","Droits de donation","Estimer les droits selon le lien de parenté."],["impot-sur-le-revenu","Impôt sur le revenu","Estimer l’impôt sur le revenu."],["assurance-vie","Assurance-vie","Comprendre le traitement fiscal de l’assurance-vie."]]],
    "impot-sur-le-revenu":["Fiscalité","/fiscalite/",[
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

  function addBreadcrumbSchema(tool,slug,meta){
    const itemList=[{"@type":"ListItem","position":1,"name":"Accueil","item":"https://simulateur.site/"}];
    if(meta) itemList.push({"@type":"ListItem","position":2,"name":CATEGORIES[meta.category].label,"item":"https://simulateur.site"+CATEGORIES[meta.category].path});
    itemList.push({"@type":"ListItem","position":itemList.length+1,"name":tool.title||document.title,"item":location.href.split("#")[0]});
    if([...document.querySelectorAll('script[type="application/ld+json"]')].some(node=>/"@type"\s*:\s*"BreadcrumbList"/.test(node.textContent||""))) return;
    const script=document.createElement("script");
    script.type="application/ld+json";
    script.textContent=JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":itemList});
    document.head.appendChild(script);
  }

  function addVisibleBreadcrumb(tool,meta){
    if(document.querySelector(".breadcrumb")) return;
    const host=document.querySelector("main .wrap")||document.querySelector("main");
    if(!host) return;
    const b=document.createElement("div");
    b.className="breadcrumb";
    b.innerHTML='<a href="/">Accueil</a>'+(meta?' · <a href="'+CATEGORIES[meta.category].path+'">'+CATEGORIES[meta.category].label+"</a>":"")+' · '+(tool.title||document.title);
    host.insertBefore(b,host.firstElementChild);
  }

  window.Simulateurs={
    render(){
      if(document.querySelector('meta[name="calculator-rendering"][content="static"]')) return;
      const tool=window.TOOL;
      if(!tool){ $("result").textContent="Calculateur indisponible."; return; }
      try{
        $("ey").textContent=tool.ey||"";
        $("title").textContent=tool.displayTitle||tool.title||"";
        $("intro").textContent=tool.displayIntro||tool.intro||"";
        const renderedFields=typeof tool.fields==="function"?tool.fields():"";
        if(renderedFields && !$("fields").children.length) $("fields").innerHTML=renderedFields;
        $("source").textContent=tool.source||"";
        const slug=(location.pathname.match(/\/outil\/([^/]+)/)||[])[1];
        const meta=slug&&toolMeta(slug);
        addBreadcrumbSchema(tool,slug,meta);
        addVisibleBreadcrumb(tool,meta);
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