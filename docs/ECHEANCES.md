# Échéances des paramètres réglementaires

Ce document recense les échéances actuellement suivies par `data/parametres.json`. Il indique uniquement où vérifier et renouveler les données ; les valeurs de barème restent dans le fichier de paramètres.

| Jeu | Expiration actuelle | Source officielle à consulter |
|---|---|---|
| SMIC | 31/12/2026 | [Service-Public — SMIC](https://www.service-public.gouv.fr/particuliers/vosdroits/F2300) |
| RSA | 31/03/2027 | [Service-Public — RSA](https://www.service-public.gouv.fr/particuliers/vosdroits/F19778) et [Légifrance](https://www.legifrance.gouv.fr/) |
| Frais kilométriques | 31/03/2027 | [Service-Public — frais kilométriques](https://www.service-public.gouv.fr/particuliers/vosdroits/R3080) et [economie.gouv.fr](https://www.economie.gouv.fr/particuliers/impots-et-fiscalite/gerer-mon-impot-sur-le-revenu/impot-sur-le-revenu-tout-savoir-sur-le-bareme-des-frais-kilometriques) |
| Capacité d’emprunt | 31/12/2026 | [HCSF — conditions d’octroi de crédits immobiliers](https://www.economie.gouv.fr/hcsf/mesures/mesure-relative-loctroi-de-credits-immobiliers) |
| Impôt sur le revenu | 31/12/2026 | [impots.gouv.fr — calcul de l’impôt 2026](https://www.impots.gouv.fr/www2/fichiers/documentation/brochure/ir_2026/pdf_som/21-calcul_impot_369a382.pdf) |
| Prime d’activité | 31/03/2027 | [CAF — évolution de la prime d’activité en 2026](https://www.caf.fr/allocataires/actualites/actualites-nationales/la-prime-d-activite-augmente-en-2026) et [Service-Public](https://www.service-public.gouv.fr/particuliers/vosdroits/F2882) |
| Indemnité de licenciement | 31/12/2026 | [Service-Public — indemnité de licenciement](https://www.service-public.gouv.fr/particuliers/vosdroits/F987) et [Légifrance — article R1234-2](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000035644692/2026-05-10) |

## Procédure de renouvellement

1. Consulter la source officielle correspondant au jeu.
2. Vérifier la période d'application et les valeurs publiées.
3. Mettre à jour uniquement le jeu concerné dans `data/parametres.json`, avec sa source et sa date de vérification.
4. Régénérer puis contrôler `public/parametres.js`.
5. Mettre à jour les tests de référence concernés uniquement si la source officielle a changé le résultat attendu.
6. Exécuter les contrôles CI des paramètres et des pages.
7. Retirer le slug de `anneeAMigrer` uniquement lorsque l'outil est réellement migré vers le jeu de paramètres correspondant.

Aucune valeur réglementaire ne doit être inventée ou déduite d'une autre source lorsque la source officielle n'est pas disponible.
