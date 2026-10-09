# Sources — calculateur de préavis de démission

Dernière vérification : 9 octobre 2026. Les règles intégrées sont limitées aux conventions explicitement listées dans le calculateur ; toute autre situation doit être contrôlée dans le simulateur officiel avant saisie manuelle.

## Sources officielles

- [Code du travail numérique — simulateur officiel du préavis de démission](https://code.travail.gouv.fr/outils/preavis-demission) — recherche de la convention et vérification de la durée.
- [Syntec, IDCC 1486](https://code.travail.gouv.fr/contribution/1486-quelle-est-la-duree-du-preavis-en-cas-de-demission) — catégories ETAM, coefficients particuliers, ingénieurs/cadres et chargé d’enquête intermittent. Pour l’ETAM général, « plus de 2 ans » est distinct de « 2 ans exactement ».
- [Sociétés d’assurances, IDCC 1672](https://code.travail.gouv.fr/contribution/1672-quelle-est-la-duree-du-preavis-en-cas-de-demission) — classes 1 à 4 et 5 à 7.
- [Publicité, IDCC 0086](https://code.travail.gouv.fr/contribution/86-quelle-est-la-duree-du-preavis-en-cas-de-demission) — catégories professionnelles.
- [Prestataires de services du secteur tertiaire, IDCC 2098](https://code.travail.gouv.fr/contribution/2098-quelle-est-la-duree-du-preavis-en-cas-de-demission) — catégories professionnelles.
- [Commerce de détail et de gros à prédominance alimentaire, IDCC 2216](https://code.travail.gouv.fr/contribution/2216-quelle-est-la-duree-du-preavis-en-cas-de-demission) — catégories professionnelles.
- [Hôtels, cafés, restaurants, IDCC 1979](https://code.travail.gouv.fr/contribution/1979-quelle-est-la-duree-du-preavis-en-cas-de-demission) — catégories et paliers d’ancienneté.
- [Démission du salarié à domicile employé par un particulier — Service-Public via Code du travail numérique](https://code.travail.gouv.fr/fiche-service-public/demission-du-salarie-a-domicile-employe-par-un-particulier) — moins de 6 mois : une semaine ; de 6 mois à moins de 2 ans : deux semaines ; 2 ans et plus : un mois.

## Contrôles et limites

- Les seuils d’ancienneté stockés dans `data/parametres.json` sont exprimés en mois. L’interface distingue « 2 ans exactement » et « plus de 2 ans » ; la règle Syntec utilise une condition strictement supérieure à 24 mois. La valeur 25 du sélecteur est un code de tranche, pas une ancienneté de 25 mois.
- Les durées conventionnelles sont uniquement dans `data/parametres.json` ; le JavaScript de page ne duplique plus ces durées.
- Les règles ne couvrent pas toutes les conventions collectives françaises. Le nom ou l’IDCC d’une convention non listée peut être noté, mais la durée doit être recherchée dans la source officielle et saisie manuellement.
- Le calcul de date ne modélise pas les suspensions, dispenses, congés ou accords individuels.
