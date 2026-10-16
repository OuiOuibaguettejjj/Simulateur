# Sources — indemnités maternité / paternité

Dernière vérification : 16 octobre 2026.

## Sources officielles

- [Service-Public — Congé de maternité d’une salariée du secteur privé](https://www.service-public.gouv.fr/particuliers/vosdroits/F2265) : salaire de référence, plafond mensuel, division par 91,25, déduction forfaitaire et bornes minimale/maximale des IJ en 2026.
- [Service-Public — Congé de paternité et d’accueil de l’enfant d’un salarié du secteur privé](https://www.service-public.gouv.fr/particuliers/vosdroits/F3156) : vérification croisée de la méthode et des bornes en 2026.

## Paramètres centralisés

Le jeu `indemnites-maternite-paternite` dans `data/parametres.json` centralise le plafond mensuel de salaire, le diviseur 91,25, la déduction forfaitaire de 21 % et les montants minimal et maximal de l’indemnité journalière applicables en 2026. La page ne duplique pas ces montants dans son texte éditorial.

## Périmètre et limites

Le calcul vise le cas général d’un salarié avec droits à indemnisation ouverts. Il ne vérifie pas les conditions d’affiliation, les heures travaillées, les cotisations, les périodes de référence particulières ni les situations de chômage ou d’activité saisonnière/discontinue. Il ne calcule pas le complément employeur ni les avantages d’une convention collective. Le montant effectif est déterminé par la CPAM.

## Renouvellement

Vérifier les deux sources officielles avant le 31 décembre 2026 et à chaque évolution réglementaire. Mettre à jour le jeu de paramètres, son cas de référence et les tests si les règles ou valeurs changent.
