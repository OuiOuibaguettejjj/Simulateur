# Sources — capacité d’emprunt

Dernière vérification : 7 octobre 2026.

## Cadre HCSF

- **HCSF — mesure relative à l’octroi de crédits immobiliers** : https://www.economie.gouv.fr/hcsf/mesures/mesure-relative-loctroi-de-credits-immobiliers
  - taux d’effort maximal de principe : 35 % ;
  - maturité maximale : 25 ans, avec les cas de différé prévus par la décision ;
  - marge de flexibilité : jusqu’à 20 % de la production trimestrielle, selon les règles d’allocation en vigueur.
- **HCSF — communiqué du 15 septembre 2026** : la page officielle des communiqués confirme la séance du troisième trimestre 2026. La mesure relative aux conditions d’octroi reste le cadre de référence suivi par le HCSF.
- **HCSF — rapport annuel 2025** : https://www.economie.gouv.fr/files/files/directions_services/hcsf/HCSF_Rapport_annuel_2025.pdf
  - rappelle le caractère juridiquement contraignant des seuils de 35 % et 25 ans depuis le 1er janvier 2022.

## Taux de marché affiché par défaut

Le taux de 3,30 % actuellement affiché dans la page est une donnée de marché distincte du cadre réglementaire et n’est pas migrée dans le jeu de paramètres par cette PR.

La dernière publication Banque de France disponible au 7 octobre 2026 est **Crédits aux particuliers — août 2026**, publiée le 6 octobre 2026 : https://www.banque-france.fr/fr/statistiques/credit/credits-aux-particuliers-2026-08

Cette publication indique 3,32 % pour les nouveaux crédits à l’habitat hors renégociations en août 2026. La valeur 3,30 % actuellement présente dans la page est donc à traiter comme une donnée de marché à actualiser dans un chantier distinct ; elle n’est pas modifiée dans cette PR conformément au principe de séparation des migrations et des revalorisations.

## Périmètre

Cette migration centralise uniquement les paramètres HCSF utilisés par le calculateur. Elle ne change pas la formule de capacité, les valeurs par défaut, les limites de saisie ou la présentation éditoriale.
