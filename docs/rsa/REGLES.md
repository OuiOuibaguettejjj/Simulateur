# Règles de calcul — Simulateur RSA

## Périmètre
Version de référence : barème RSA du 1er avril 2026 au 31 mars 2027. Dernière vérification : 28 septembre 2026.

Le simulateur fournit une estimation indicative et volontairement simplifiée. Il ne reproduit pas l'intégralité du dossier individuel Caf.

## Paramètres 2026
- Personne seule, 0 charge : 651,69 €
- Couple, 0 charge : 977,54 €
- Personne seule + 1 charge : 977,54 €
- Couple + 1 charge : 1 173,05 €
- Personne seule + 2 charges : 1 173,05 €
- Couple + 2 charges : 1 368,56 €
- Personne seule : +260,68 € par personne à charge supplémentaire
- Couple : +195,51 € par personne à charge supplémentaire
- RSA majoré, isolée enceinte : 836,85 €
- RSA majoré, isolée + 1 charge : 1 115,80 €
- RSA majoré, isolée + 2 charges : 1 394,75 €
- RSA majoré : +278,95 € par personne supplémentaire
- Forfait logement : 78,20 € / 156,41 € / 193,55 € selon la taille du foyer.

## Formule d'estimation
RSA estimé = montant forfaitaire - moyenne des ressources des trois mois de référence - déduction logement.

Le résultat est plafonné à zéro.

La réglementation actuelle prévoit une période de référence M-4 à M-2 pour le calcul du droit. Le simulateur demande trois montants mensuels correspondant à cette période et en calcule la moyenne.

## Ressources
L'utilisateur saisit directement le total des ressources à retenir pour chacun des trois mois. Pour les salaires et revenus de remplacement concernés, le montant net social est la référence déclarative.

Cette approche évite de prétendre reproduire toutes les règles de prise en compte par catégorie, mais elle suppose que l'utilisateur a correctement identifié les ressources à retenir. Certaines prestations et certains revenus font l'objet de règles spécifiques.

## Logement
- aucune aide personnelle au logement et charge de logement : déduction 0 € ;
- aide au logement inférieure au forfait applicable : déduction de l'aide effectivement perçue ;
- aide au logement au moins égale au forfait, logement gratuit ou propriété dans les situations concernées : déduction du forfait légal.

## Éligibilité simplifiée
Le simulateur vérifie :
- résidence stable et effective en France ;
- âge minimal ;
- cas particuliers 18-24 ans ;
- statut étudiant ;
- cohérence de la majoration pour isolement.

Il ne vérifie pas automatiquement toutes les conditions liées à la nationalité/droit au séjour, à la durée exacte de résidence, aux congés ou disponibilités, ni toutes les situations particulières prévues par le CASF. Ces points doivent être vérifiés auprès de la Caf.
