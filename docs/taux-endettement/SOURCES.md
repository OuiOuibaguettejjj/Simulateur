# Sources — taux d’endettement

Dernière vérification : 9 octobre 2026.

## Cadre HCSF

- **HCSF — mesure relative à l’octroi de crédits immobiliers** : https://www.economie.gouv.fr/hcsf/mesures/mesure-relative-loctroi-de-credits-immobiliers
  - repère de taux d’effort maximal en vigueur, assurance emprunteur comprise ;
  - maturité maximale et marge de flexibilité encadrées par les décisions HCSF.
- **Ministère de l’Économie — crédit immobilier : comment ça marche** : https://www.economie.gouv.fr/particuliers/gerer-mon-argent/emprunter-et-sassurer/credit-immobilier-comment-ca-marche
  - éléments de contexte sur l’analyse d’un dossier de crédit.

## Méthode appliquée par la page

Le taux lié aux crédits est calculé comme suit :

`(mensualités des crédits existants + nouvelle mensualité, assurance comprise) / revenus mensuels nets avant impôt × 100`.

Le seuil de référence est lu dans le jeu `capacite-emprunt` de `data/parametres.json`, et non codé en dur dans la page.

Les pensions alimentaires versées et le loyer qui demeure après le projet sont exclus du taux lié aux mensualités de crédit affiché par cet outil. L’écart au repère est donc explicitement présenté comme un écart indicatif sur les seuls crédits, et non comme une marge globale de capacité d’emprunt. Les pensions et le loyer sont déduits séparément pour estimer le budget restant. Ces charges fixes restent pertinentes dans l’analyse globale du dossier par la banque. Cette estimation ne reproduit pas l’ensemble des règles d’analyse ni les dérogations appliquées par un établissement prêteur.

## Limites

- Le résultat est indicatif et ne constitue ni une décision bancaire ni une garantie d’octroi.
- Les revenus sont saisis par l’utilisateur ; le calculateur ne vérifie pas leur éligibilité au sens réglementaire.
- La date de vérification du jeu HCSF et son échéance éditoriale sont suivies dans `data/parametres.json` et `docs/ECHEANCES.md`.
