# Tests de référence — RSA

## Paramètres attendus
- Seul, 0 charge, aucune ressource, sans déduction logement => 651,69 €.
- Couple, 0 charge, aucune ressource, sans déduction logement => 977,54 €.
- Seul, 1 charge, aucune ressource, sans déduction logement => 977,54 €.
- Couple, 1 charge, aucune ressource, sans déduction logement => 1 173,05 €.
- Seul, 2 charges, aucune ressource, sans déduction logement => 1 173,05 €.

## Forfait logement
Pour un foyer de :
- 1 personne : 78,20 €
- 2 personnes : 156,41 €
- 3 personnes ou plus : 193,55 €.

## Déduction logement
- aucune aide : 0 € ;
- aide inférieure au forfait : déduction de l'aide ;
- aide égale ou supérieure au forfait : déduction du forfait.

Exemple : personne seule, 100 € de ressources mensuelles et aide au logement de 50 € => 651,69 - 100 - 50 = 501,69 €.

## Contrôles
- RSA négatif => 0 €.
- Ressources des trois mois => moyenne arithmétique.
- Ressources invalides => résultat bloqué.
- Non-résident => résultat bloqué.
- 18-24 ans sans exception => résultat bloqué.
- Étudiant sans exception => résultat bloqué.
- Majoration sélectionnée dans un couple => résultat bloqué.
- aide au logement négative ou supérieure au forfait => résultat bloqué.

## Validation réglementaire
Les valeurs et principes de calcul ont été confrontés aux publications CAF et au Code de l'action sociale et des familles en vigueur au 28 septembre 2026.

Avant MEP, effectuer les tests manuels dans le navigateur, vérifier les valeurs limites et contrôler les routes/indexation.
