# Audit préalable et benchmark — calculateur de donation

- Date : 9 octobre 2026
- Classe : B — calculateur réglementaire
- Périmètre : page donation, données fiscales, références de test, maillage interne et génération des paramètres.
- Requête principale : calcul droits de donation.
- Intentions secondaires : abattement parent-enfant, donation entre époux/Pacs, abattement handicap, don familial de sommes d’argent, exonération logement temporaire.
- Sources des intentions : structure du calculateur et questions couvertes par les pages officielles citées ci-dessous ; aucune donnée Search Console propre à cette URL n’a été utilisée pour ce benchmark.

## Constats et décisions

1. L’abattement handicap ne doit pas être appliqué par défaut. Le formulaire demande maintenant une confirmation explicite d’éligibilité et le calcul l’ignore sinon.
2. Le barème des époux/Pacs est distinct du barème en ligne directe. Il est maintenant stocké séparément dans `data/parametres.json` et utilisé pour la relation `conjoint`.
3. Les exonérations des articles 790 G et 790 A bis ne s’appliquent qu’aux sommes d’argent et à certains liens familiaux. Le formulaire demande la nature du don et une confirmation des conditions. Les plafonds globaux et justificatifs restent à vérifier par l’utilisateur.
4. Le maillage visible correspond maintenant aux trois slugs déclarés dans `data/tools.json` : `succession`, `plus-value-mobiliere`, `impot-sur-le-revenu`.
5. Les donations antérieures peuvent modifier l’utilisation du barème, pas seulement l’abattement disponible. Le simulateur ne reconstitue toujours pas la liquidation complète des donations antérieures ; cette limite est affichée. Le résultat reste une estimation et ne doit pas être présenté comme une liquidation fiscale complète.

## Benchmark (consulté le 9 octobre 2026)

- [Service-Public — droits de donation selon le lien familial](https://www.service-public.gouv.fr/particuliers/vosdroits/F14203) : référence réglementaire pour les abattements et barèmes.
- [Service-Public — calcul et paiement des droits](https://www.service-public.gouv.fr/particuliers/vosdroits/F14205) : distingue notamment le barème ligne directe de celui applicable entre époux/Pacs.
- [Service-Public — exonérations et dons de sommes d’argent](https://www.service-public.gouv.fr/particuliers/vosdroits/F10203) : conditions et limites du don familial et de l’exonération logement temporaire.
- [Mon Petit Fiscaliste — simulateur de donation](https://www.monpetitfiscaliste.fr/simuler/donation) : référence concurrente pour comparer les informations demandées et la couverture des cas usuels.
- [France Succession](https://www.france-succession.fr/) et [CalcFacile](https://www.calcfacile.com/) : pistes complémentaires de comparaison éditoriale ; les valeurs réglementaires ne sont jamais reprises de ces sites.

## Couverture et limites

Le benchmark a servi à identifier les règles qui devaient être explicites dans l’interface (éligibilité handicap, barème conjoint/Pacs, conditions des exonérations, limite des donations antérieures). Les valeurs sont contrôlées à partir des sources officielles, pas des concurrents.

Restent hors calcul : reconstitution détaillée des tranches consommées par des donations antérieures, plafond global de 300 000 € de l’article 790 A bis déjà utilisé par le bénéficiaire, frais d’acte, démembrement, donations-partages, transmission d’entreprise et autres régimes spéciaux.

## Références de tests

- Parent → enfant, 200 000 €, abattement de 100 000 € : 18 194 € de droits selon Service-Public.
- Époux/Pacs, 200 000 €, abattement de 80 724 € : 21 061 € selon le barème officiel.
- Parent → enfant, 200 000 €, abattement de parenté et abattement handicap complet : 0 € de droits dans le scénario hypothétique où l’éligibilité handicap est confirmée.

