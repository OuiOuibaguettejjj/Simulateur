# Tests de référence — RSA

## Paramètres attendus
- Seul, 0 charge, aucune ressource, sans forfait logement => 651,69 €.
- Couple, 0 charge, aucune ressource, sans forfait logement => 977,54 €.
- Seul, 1 charge, aucune ressource, sans forfait logement => 977,54 €.
- Couple, 1 charge, aucune ressource, sans forfait logement => 1 173,05 €.
- Seul, 2 charges, aucune ressource, sans forfait logement => 1 173,05 €.

## Forfait logement
Pour un foyer de :
- 1 personne : 78,20 €
- 2 personnes : 156,41 €
- 3 personnes ou plus : 193,55 €

## Contrôles
- RSA négatif => 0 €.
- Ressources des trois mois => moyenne arithmétique.
- Ressources invalides => résultat bloqué.
- Non-résident => résultat bloqué.
- 18-24 ans sans exception => résultat bloqué.
- Étudiant sans exception => résultat bloqué.
- Majoration sélectionnée dans un couple => résultat bloqué.

## À compléter
Avant MEP, effectuer des tests manuels dans le navigateur sur les valeurs limites et comparer les cas de référence avec les sources officielles.
