# Benchmark concurrentiel — calculateur de plus-value mobilière

- Date de vérification : 16 octobre 2026.
- Périmètre : comparaison documentaire de pages officielles et de ressources financières accessibles publiquement. Il ne s'agit ni d'un audit exhaustif des résultats Google, ni d'une mesure des positions, du trafic ou des conversions des concurrents.
- Méthode : ne retenir que les fonctionnalités et informations visibles dans les pages consultées ; distinguer les calculateurs directs des pages d'explication.

## Références consultées

1. [Service-Public — Impôt sur le revenu, plus-values sur valeurs mobilières](https://www.service-public.gouv.fr/particuliers/vosdroits/F21618) — fiche officielle grand public. Elle explique le calcul du gain, l'imputation des moins-values, leur report possible sur dix ans, le PFU, l'option pour le barème et le traitement des titres acquis avant 2018.
2. [impots.gouv.fr — Les cessions mobilières](https://www.impots.gouv.fr/particulier/les-cessions-mobilieres) — référence fiscale pour les règles de calcul, les frais, les moins-values et les situations particulières.
3. [impots.gouv.fr — J'ai réalisé une plus-value mobilière, comment est-elle imposée ?](https://www.impots.gouv.fr/particulier/questions/jai-realise-une-plus-value-mobiliere-comment-est-elle-imposee) — synthèse officielle du régime fiscal.
4. [BoursoBank — Calcul de la plus ou moins-value avec option à l'impôt sur le revenu](https://www.boursobank.com/aide-en-ligne/fiscalite/declaration-d-impot/question/quel-est-le-calcul-de-la-value-des-cessions-de-valeur-mobilieres-avec-option-a-l-impot-sur-le-revenu-26826) — ressource d'aide d'un acteur financier, avec exemples de calcul et explications sur les abattements et l'imputation des moins-values ; ce n'est pas un calculateur autonome.
5. [Boursorama — page de présentation des simulateurs](https://www.boursorama.com/simulateurs/) — catalogue général de simulateurs financiers. La page consultée ne permet pas, à elle seule, de confirmer l'existence d'un calculateur dédié à la plus-value mobilière.
6. [Simulateur officiel de l'impôt 2026](https://simulateur-ir-ifi.impots.gouv.fr/calcul_impot/2026/complet/index.htm) — parcours déclaratif officiel ; utile pour orienter vers la déclaration, mais ne constitue pas un comparateur direct de notre estimation simplifiée.

## Comparaison utile pour l'expérience utilisateur

| Besoin | Ce que montrent les références consultées | Réponse retenue sur Simulateur |
|---|---|---|
| Obtenir rapidement un ordre de grandeur | Les pages officielles expliquent les règles, mais la fiche Service-Public est avant tout informative. | Calcul immédiat à partir du prix d'achat, du prix de vente et des frais saisis. |
| Comprendre la composition de l'impôt | La fiche Service-Public distingue le PFU, l'impôt sur le revenu et les prélèvements sociaux. | Ventilation explicite des composantes à 12,8 % et 18,6 %, et affichage du total indicatif à 31,4 % pour le régime général 2026. |
| Comprendre une perte | Service-Public explique que les moins-values peuvent, sous conditions, compenser des plus-values de même nature et être reportées. | Afficher une moins-value quand le résultat est négatif, sans prétendre calculer son imputation sur d'autres gains. |
| Évaluer PFU ou barème | Les sources officielles et l'aide BoursoBank rappellent que l'option pour le barème et les abattements dépendent de la situation et peuvent impliquer d'autres revenus. | Expliquer le caractère global de l'option et ne pas présenter le résultat PFU comme une comparaison personnalisée. |
| Éviter une estimation trompeuse | Les références listent des exceptions : PEA, abattements conditionnels, moins-values, exonérations et régimes particuliers. | Afficher les limites près du résultat et fournir des liens vers les sources officielles. |
| Accéder aux outils associés | Les ressources financières regroupent plusieurs sujets fiscaux et patrimoniaux. | Proposer le calculateur d'impôt sur le revenu, le calculateur de TVA, les droits de donation et le lien vers la rubrique Fiscalité. |

## Différenciation et limites

- La valeur ajoutée visée est une estimation courte, immédiatement lisible et ventilée, accompagnée d'explications sur les limites fiscales.
- Les pages consultées ne permettent pas de conclure qu'un site concurrent précis possède un calculateur autonome équivalent avec les mêmes champs. Aucun concurrent direct n'est donc présenté comme testé ou battu.
- Aucun classement SEO, volume de recherche, score de performance, taux de conversion ou qualité d'interface mobile concurrente n'a été mesuré.
- Les taux réglementaires de référence 2026 sont centralisés dans `data/parametres.json`, avec source officielle, période de validité et date de vérification. La page charge `/parametres.js` généré ; le slug est retiré de `anneeAMigrer` après cette migration.
- Le calculateur n'effectue pas une liquidation fiscale complète : les frais saisis ne sont pas contrôlés, les moins-values ne sont pas imputées, les abattements ne sont pas appliqués et l'option pour le barème n'est pas simulée.

## Sources officielles à privilégier

Pour trancher une situation fiscale individuelle, consulter en priorité les pages d'impots.gouv.fr et de Service-Public ci-dessus. Les exemples et ressources d'acteurs financiers servent à comprendre les besoins d'explication, pas à remplacer la doctrine fiscale officielle.
