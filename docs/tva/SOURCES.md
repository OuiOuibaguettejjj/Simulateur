# Sources — calculateur TVA

Dernière vérification : **8 octobre 2026**.

## Sources officielles vérifiées

- [Ministère de l’Économie — TVA : quels sont les taux de votre quotidien](https://www.economie.gouv.fr/particuliers/impots-et-fiscalite/gerer-mes-autres-impots-et-taxes/tva-quels-sont-les-taux-de-votre-quotidien) — principaux taux métropolitains (20 %, 10 %, 5,5 %, 2,1 %), catégories générales et existence de taux spécifiques en Corse et outre-mer.
- [Légifrance — Code général des impôts, article 278](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000026950057/2026-05-04) — taux normal de 20 %.
- [Légifrance — Code général des impôts, article 278-0 bis](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053562844/2026-07-03) — taux réduit de 5,5 %.
- [Légifrance — Code général des impôts, article 279](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053562872/2026-05-12) — taux réduit de 10 %.

## Périmètre du calculateur

Le calculateur applique mathématiquement le taux sélectionné pour passer de HT à TTC ou de TTC à HT. Il **ne détermine pas** si le taux est juridiquement applicable à une opération donnée.

La page couvre les principaux taux de France métropolitaine. Les taux particuliers de Corse et des DROM, les exonérations et les régimes spécifiques ne sont pas modélisés.

## Points explicitement vérifiés

- Les quatre taux proposés sont 20 %, 10 %, 5,5 % et 2,1 % pour la France métropolitaine.
- Le passage HT → TTC utilise `TTC = HT × (1 + taux / 100)`.
- Le passage TTC → HT utilise `HT = TTC / (1 + taux / 100)`.
- La TVA est obtenue par `TVA = TTC − HT` ou `TVA = HT × taux / 100`.
- Les montants affichés sont arrondis à l’euro-cent uniquement pour la présentation.

## Non vérifié / hors périmètre

Le calculateur ne qualifie pas une opération particulière au regard des nombreuses exceptions et conditions prévues par le Code général des impôts. Il ne remplace donc pas une vérification fiscale ou comptable pour une facture ou une déclaration.
