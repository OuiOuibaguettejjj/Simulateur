(function(){
  const RELATED = {
    "pourcentage":["tva","remise","marge"],
    "tva":["remise","prix-unitaire","pourcentage"],
    "remise":["pourcentage","tva","promotions"],
    "marge":["coefficient","prix-unitaire","tva"],
    "coefficient":["marge","remise","prix-unitaire"],
    "prix-unitaire":["promotions","remise","tva"],
    "salaire-horaire":["salaire-brut-net","temps-travail","conges-payes"],
    "proportion":["pourcentage","prix-unitaire","fractions"],
    "temps":["temps-calcul","difference-dates","jours-ouvres"],
    "poids":["volume","longueur","temperature"],
    "longueur":["poids","volume","temperature"],
    "volume":["poids","longueur","temperature"],
    "temperature":["poids","volume","longueur"],
    "devises":["prix-unitaire","inflation","pourcentage"],
    "arrondi":["pourcentage","proportion","fractions"],
    "perimetre":["proportion","arrondi","fractions"],
    "difference-dates":["jours-ouvres","temps-travail","age-retraite"],
    "temps-travail":["salaire-horaire","jours-ouvres","temps-calcul"],
    "temps-calcul":["temps","temps-travail","difference-dates"],
    "consommation-carburant":["frais-kilometriques","prix-unitaire","promotions"],
    "promotions":["prix-unitaire","remise","tva"],
    "mensualite-pret":["pret-immobilier","tableau-amortissement","capacite-emprunt"],
    "epargne":["epargne-mensuelle","interets-composes","inflation"],
    "interets-composes":["epargne","epargne-mensuelle","comparateur-placements"],
    "jours-ouvres":["difference-dates","temps-travail","conges-payes"],
    "fractions":["proportion","pourcentage","arrondi"],
    "frais-kilometriques":["consommation-carburant","salaire-brut-net","impot-sur-le-revenu"],
    "partage-depenses":["pourboire","promotions","prix-unitaire"],
    "recette":["proportion","partage-depenses","prix-unitaire"],
    "pourboire":["partage-depenses","promotions","prix-unitaire"],
    "impot-sur-le-revenu":["salaire-brut-net","prime-activite","plus-value-mobiliere"],
    "salaire-brut-net":["salaire-horaire","impot-sur-le-revenu","are-chomage"],
    "pret-immobilier":["mensualite-pret","capacite-emprunt","tableau-amortissement"],
    "frais-de-notaire":["pret-immobilier","plus-value-immobiliere","capacite-emprunt"],
    "are-chomage":["salaire-brut-net","rupture-conventionnelle","indemnite-licenciement"],
    "capacite-emprunt":["pret-immobilier","mensualite-pret","frais-de-notaire"],
    "tableau-amortissement":["pret-immobilier","mensualite-pret","capacite-emprunt"],
    "rendement-locatif":["cash-flow-immobilier","pret-immobilier","frais-de-notaire"],
    "cash-flow-immobilier":["rendement-locatif","pret-immobilier","frais-de-notaire"],
    "ptz":["pret-immobilier","capacite-emprunt","frais-de-notaire"],
    "plus-value-immobiliere":["frais-de-notaire","pret-immobilier","rendement-locatif"],
    "rupture-conventionnelle":["indemnite-licenciement","are-chomage","solde-tout-compte"],
    "indemnite-licenciement":["rupture-conventionnelle","solde-tout-compte","are-chomage"],
    "preavis-demission":["solde-tout-compte","conges-payes","salaire-brut-net"],
    "solde-tout-compte":["conges-payes","preavis-demission","indemnite-licenciement"],
    "conges-payes":["solde-tout-compte","salaire-horaire","rupture-conventionnelle"],
    "prime-activite":["salaire-brut-net","rsa","impot-sur-le-revenu"],
    "rsa":["prime-activite","salaire-brut-net","impot-sur-le-revenu"],
    "age-retraite":["retraite-simplifiee","difference-dates","salaire-brut-net"],
    "retraite-simplifiee":["age-retraite","epargne-mensuelle","interets-composes"],
    "micro-entrepreneur":["charges-independant","sasu-vs-ei-micro","salaire-brut-net"],
    "charges-independant":["micro-entrepreneur","sasu-vs-ei-micro","impot-sur-le-revenu"],
    "sasu-vs-ei-micro":["micro-entrepreneur","charges-independant","impot-sur-le-revenu"],
    "epargne-mensuelle":["epargne","interets-composes","comparateur-placements"],
    "inflation":["epargne","epargne-mensuelle","comparateur-placements"],
    "comparateur-placements":["epargne","interets-composes","inflation"],
    "donation":["succession","plus-value-mobiliere","impot-sur-le-revenu"],
    "succession":["donation","plus-value-mobiliere","impot-sur-le-revenu"],
    "plus-value-mobiliere":["impot-sur-le-revenu","comparateur-placements","epargne"],
    "indemnites-maladie":["indemnites-maternite-paternite","salaire-brut-net","are-chomage"],
    "indemnites-maternite-paternite":["indemnites-maladie","salaire-brut-net","prime-activite"]
  };

  const INFO = {
    "pourcentage":["Calcul de pourcentage","Calculer une part, une évolution ou un ratio."],
    "tva":["TVA : HT ↔ TTC","Passer du HT au TTC et retrouver le montant de TVA."],
    "remise":["Calcul de remise","Calculer rapidement un prix après réduction."],
    "marge":["Marge et taux de marge","Calculer marge, taux de marge et prix de vente."],
    "coefficient":["Coefficient multiplicateur","Retrouver le coefficient entre coût et prix de vente."],
    "prix-unitaire":["Prix au kilo, litre ou unité","Comparer des formats différents sur une base commune."],
    "salaire-horaire":["Salaire horaire","Estimer un taux horaire à partir d'un salaire et du temps de travail."],
    "proportion":["Proportion et règle de trois","Résoudre une proportion simplement."],
    "temps":["Convertisseur de temps","Convertir heures, minutes et secondes."],
    "poids":["Convertisseur de poids","Convertir g, kg, mg et tonnes."],
    "longueur":["Convertisseur de longueur","Convertir mm, cm, m et km."],
    "volume":["Convertisseur de volume","Convertir litres, millilitres et m³."],
    "temperature":["Convertisseur de température","Convertir °C, °F et K."],
    "devises":["EUR / USD","Convertir des devises avec les taux disponibles."],
    "arrondi":["Arrondi","Arrondir un nombre au niveau de précision souhaité."],
    "perimetre":["Périmètre","Calculer le périmètre d'une figure courante."],
    "difference-dates":["Différence entre deux dates","Calculer le nombre de jours entre deux dates."],
    "temps-travail":["Temps de travail","Calculer une durée travaillée avec la pause."],
    "temps-calcul":["Addition d'heures","Additionner des heures, minutes et durées."],
    "consommation-carburant":["Consommation carburant","Estimer les litres consommés et le coût d'un trajet."],
    "promotions":["Comparateur de promotions","Comparer le prix effectif d'un lot ou d'une offre."],
    "mensualite-pret":["Mensualité de prêt","Estimer une mensualité de crédit à taux fixe."],
    "epargne":["Épargne et intérêts","Estimer la valeur future d'une épargne."],
    "interets-composes":["Intérêts composés","Simuler la croissance d'un capital et de versements."],
    "jours-ouvres":["Jours ouvrés","Compter les jours du lundi au vendredi entre deux dates."],
    "fractions":["Fractions","Additionner, soustraire, multiplier ou diviser des fractions."],
    "frais-kilometriques":["Frais kilométriques 2026","Estimer les frais professionnels selon le barème fiscal."],
    "partage-depenses":["Partage de dépenses","Répartir une dépense entre plusieurs personnes."],
    "recette":["Adapter une recette","Ajuster les quantités au nombre de personnes."],
    "pourboire":["Pourboire","Calculer le pourboire et le montant par personne."],
    "impot-sur-le-revenu":["Impôt sur le revenu 2026","Estimer l'impôt selon les règles du simulateur."],
    "salaire-brut-net":["Salaire brut net","Estimer le net à partir du brut mensuel."],
    "pret-immobilier":["Prêt immobilier","Calculer mensualité, intérêts et coût total d'un crédit."],
    "frais-de-notaire":["Frais de notaire","Estimer les frais liés à l'achat d'un bien immobilier."],
    "are-chomage":["Allocation chômage ARE","Estimer le montant de l'allocation chômage."],
    "capacite-emprunt":["Capacité d'emprunt","Estimer le montant empruntable selon revenus et durée."],
    "tableau-amortissement":["Tableau d'amortissement","Voir la répartition du capital et des intérêts."],
    "rendement-locatif":["Rendement locatif","Estimer la rentabilité d'un investissement locatif."],
    "cash-flow-immobilier":["Cash-flow immobilier","Estimer le flux de trésorerie mensuel d'un bien."],
    "ptz":["PTZ 2026","Estimer l'éligibilité et le montant du prêt à taux zéro."],
    "plus-value-immobiliere":["Plus-value immobilière","Estimer la plus-value lors de la vente d'un bien."],
    "rupture-conventionnelle":["Rupture conventionnelle","Estimer l'indemnité minimale de rupture."],
    "indemnite-licenciement":["Indemnité de licenciement","Estimer l'indemnité selon l'ancienneté et le salaire."],
    "preavis-demission":["Préavis de démission","Estimer la date de fin de préavis."],
    "solde-tout-compte":["Solde de tout compte","Estimer les sommes dues à la fin du contrat."],
    "conges-payes":["Congés payés","Estimer l'indemnité correspondant aux congés."],
    "prime-activite":["Prime d'activité","Estimer le montant de la prime selon la situation."],
    "rsa":["RSA 2026","Estimer le montant du RSA selon la situation."],
    "age-retraite":["Âge de retraite","Estimer l'âge de départ selon les paramètres saisis."],
    "retraite-simplifiee":["Retraite simplifiée","Obtenir une première estimation de retraite."],
    "micro-entrepreneur":["Micro-entrepreneur","Estimer cotisations et revenu selon le chiffre d'affaires."],
    "charges-independant":["Charges indépendant","Estimer les charges liées à une activité indépendante."],
    "sasu-vs-ei-micro":["SASU / EI / micro","Comparer plusieurs statuts pour une activité indépendante."],
    "epargne-mensuelle":["Épargne mensuelle","Projeter un capital avec des versements réguliers."],
    "inflation":["Inflation","Mesurer l'effet de l'inflation sur un montant."],
    "comparateur-placements":["Comparateur de placements","Comparer plusieurs hypothèses de rendement et d'épargne."],
    "donation":["Donation","Explorer les principaux paramètres fiscaux d'une donation."],
    "succession":["Succession","Estimer les droits selon les paramètres renseignés."],
    "plus-value-mobiliere":["Plus-value mobilière","Estimer la fiscalité d'une plus-value sur titres."],
    "indemnites-maladie":["IJ maladie","Estimer les indemnités journalières en cas d'arrêt."],
    "indemnites-maternite-paternite":["IJ maternité / paternité","Estimer les indemnités journalières correspondantes."]
  };

  const CONVERSIONS=new Set(["devises","poids","longueur","volume","temperature"]);
  const pathFor=slug=>(CONVERSIONS.has(slug)?"/conversion/":"/outil/")+slug+"/";

  function enableEnterToCalculate(){
    document.addEventListener('keydown', function(event){
      if(event.key !== 'Enter' || event.isComposing) return;
      const target=event.target;
      if(!target || target.tagName !== 'INPUT' || target.type === 'hidden') return;
      const container=target.closest('.tool, .pv');
      const form=target.closest('form');
      if(!container && !form) return;
      const button=(container && container.querySelector('button.button-main')) || (form && form.querySelector('button[type="submit"], button.button-main'));
      if(!button) return;
      if(!button || button.disabled) return;
      event.preventDefault();
      button.click();
    });
  }

  function renderRelatedTools(){
    const tool=document.querySelector('.tool, .pv');
    if(!tool || tool.dataset.relatedMounted) return;

    const canonical=document.querySelector('link[rel="canonical"]');
    if(!canonical) return;
    const match=canonical.href.match(/\/(?:outil|conversion)\/([^/]+)\/?$/);
    if(!match) return;

    const slug=match[1];
    const related=(RELATED[slug]||[]).filter(item=>INFO[item]).slice(0,3);
    if(!related.length) return;

    const section=document.createElement('section');
    section.className='related-tools';
    section.innerHTML='<div><div class="eyebrow">À VOIR AUSSI</div><h2>Calculs associés</h2><p class="muted">D\'autres outils utiles dans le même parcours.</p><div class="related-links">'+
      related.map(item=>'<a class="related-link" href="'+pathFor(item)+'"><strong>'+INFO[item][0]+'</strong><span>'+INFO[item][1]+'</span></a>').join('')+
      '</div></div>';

    tool.dataset.relatedMounted='true';
    const wrap=tool.closest('.wrap');
    if(wrap && wrap.parentNode) wrap.parentNode.insertBefore(section,wrap.nextSibling);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){
      enableEnterToCalculate();
      renderRelatedTools();
    }, {once:true});
  } else {
    enableEnterToCalculate();
    renderRelatedTools();
  }
})();