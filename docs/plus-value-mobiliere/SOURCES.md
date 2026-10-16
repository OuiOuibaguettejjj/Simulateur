# Sources réglementaires — plus-value mobilière

Date de vérification : 16 octobre 2026.

## Paramètres centralisés

Le jeu `plus-value-mobiliere` de `data/parametres.json` contient les taux de référence applicables en 2026 au régime général des cessions privées :

- Impôt sur le revenu au PFU : 12,8 %.
- Prélèvements sociaux : 18,6 %.
- PFU total de référence : 31,4 %.

Ces valeurs sont chargées par la page depuis le fichier généré `public/parametres.js`. La page ne définit plus les taux dans sa formule JavaScript. La date de fin au 31 décembre 2026 est une échéance de vérification du jeu, et non une affirmation que le droit fiscal expirera à cette date.

## Sources officielles

1. [impots.gouv.fr — J’ai réalisé une plus-value mobilière, comment est-elle imposée ?](https://www.impots.gouv.fr/particulier/questions/jai-realise-une-plus-value-mobiliere-comment-est-elle-imposee) — source principale pour le régime général et le PFU.
2. [Service-Public — Impôt sur le revenu : plus-values sur valeurs mobilières](https://www.service-public.gouv.fr/particuliers/vosdroits/F21618) — recoupement du taux, de l’imputation des moins-values et des règles générales.
3. [impots.gouv.fr — Les cessions mobilières](https://www.impots.gouv.fr/particulier/les-cessions-mobilieres) — base de calcul, frais et situations particulières.

## Limites du calculateur

Le résultat reste une estimation simplifiée : le calculateur soustrait les frais saisis du gain et applique le PFU de référence au gain positif. Il ne vérifie pas l’admissibilité des frais, ne calcule pas l’imputation ou le report des moins-values, ne modélise pas les abattements, exonérations, l’option globale pour le barème progressif ni les régimes particuliers comme le PEA. Vérifier la situation déclarative sur les sources officielles.

## Cas de référence

Pour un achat de 10 000 €, une vente de 15 000 € et 0 € de frais saisis, le gain simplifié est de 5 000 €. Au PFU de référence, le résultat attendu est de 1 570 €. Ce cas est repris dans `tests/references/core.json` ; il vérifie le calcul du simulateur, tandis que les sources officielles justifient les taux utilisés.
