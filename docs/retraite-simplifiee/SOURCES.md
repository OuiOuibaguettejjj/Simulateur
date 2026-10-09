# Sources réglementaires — retraite simplifiée

Dernière vérification : 9 octobre 2026.

## Paramètres utilisés

- [Assurance retraite — âge de départ et durée d’assurance](https://www.lassuranceretraite.fr/portail-info/home/actif/age-depart/age-depart-retraite.html) : tableaux applicables aux pensions prenant effet à partir du 1er septembre 2026, âge légal par cohorte de naissance et trimestres nécessaires au taux maximum.
- [Légifrance — loi n° 2025-1403 du 30 décembre 2025, article 105](https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000053227007) : fondement législatif des modifications applicables à compter du 1er septembre 2026.
- [Assurance retraite — calcul de la retraite de base](https://www.lassuranceretraite.fr/portail-info/portail-info/home/actif/montant-retraite/montant-retraite.html) : principe de calcul, taux maximum de 50 %, décote et proratisation.

## Ce qui a été vérifié

Les âges légaux et durées d’assurance codés dans `data/parametres.json` ont été comparés aux tableaux officiels de l’Assurance retraite et à l’article 105 de la loi. Les paramètres sont valables pour les pensions prenant effet du 1er septembre 2026 au 31 mars 2027, avec une nouvelle vérification à effectuer avant l’échéance.

## Limites connues

Le calculateur reste volontairement simplifié. Il demande à l’utilisateur un revenu annuel moyen déjà estimé ; il ne reconstitue pas les meilleures années, ne calcule pas les retraites complémentaires et ne simule pas les majorations, minima, surcotes, carrières longues ou régimes particuliers. Il ne remplace pas le relevé de carrière ni le simulateur officiel inter-régimes.

Les résultats de référence sont calculés indépendamment à partir de la formule documentée, et non en exécutant le calculateur pour produire la valeur attendue.
