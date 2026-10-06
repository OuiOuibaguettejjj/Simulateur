# Sources réglementaires — RSA

Vérification effectuée le 6 octobre 2026.

## Sources principales
1. CAF — Barème Revenu de solidarité active, au 1er avril 2026.
2. Légifrance — Code de l'action sociale et des familles, articles R262-6 et suivants.
3. Service-Public.fr — RSA jeunes parents et conditions applicables aux étudiants/jeunes actifs.
4. CAF — déclaration des ressources et montant net social.

## Principes vérifiés
- Les ressources du foyer sont prises en compte selon les règles du CASF.
- Depuis le 1er mars 2025, le montant dû est déterminé à partir des quatrième, troisième et deuxième mois précédant la demande ou le réexamen, selon les règles de l’article R262-7 du CASF.
- Une aide au logement, un logement gratuit ou un logement occupé en propriété sans aide personnelle peuvent entraîner la prise en compte du forfait logement ; il ne s’agit pas d’un prorata de l’aide effectivement perçue.
- Le montant net social est la référence déclarative pour les ressources concernées par le RSA.
- Les 18-24 ans sont soumis à des conditions spécifiques dans plusieurs situations.

## Limites
- Le calculateur demande un total mensuel simplifié des ressources du foyer. La Caf traite certaines prestations et catégories de ressources selon des règles spécifiques ; l’estimation ne reproduit donc pas l’intégralité du calcul administratif.
Les textes évoluent. Toute modification réglementaire doit entraîner une revue des paramètres et des tests avant publication.

## Paramètres
Les montants sont désormais dans `data/parametres.json` (jeu `rsa`), diffusés par `public/parametres.js`. Une revue de barème met à jour ce jeu (valeurs, dates de validité, `verifiedOn`).
