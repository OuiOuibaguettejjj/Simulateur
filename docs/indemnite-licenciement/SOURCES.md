# Sources réglementaires — indemnité de licenciement

Vérification effectuée le 7 octobre 2026.

## Sources principales
1. Service-Public — « Indemnité de licenciement du salarié en CDI ».
2. Légifrance — Code du travail, articles R1234-1 et R1234-2.

## Principes vérifiés
- Le calcul concerne l'indemnité légale de licenciement du salarié en CDI.
- L'indemnité légale est due sous conditions, notamment avec au moins 8 mois d'ancienneté ininterrompue, appréciés à la date d'envoi de la lettre de licenciement.
- L'ancienneté servant au montant est calculée jusqu'à la rupture effective du contrat ; les années incomplètes sont proratisées selon les mois complets.
- En cas de faute grave ou lourde, l'indemnité légale de licenciement n'est pas due, sauf disposition conventionnelle, contractuelle ou usage plus favorable.
- Le salaire de référence retient la formule la plus favorable entre la moyenne des 12 derniers mois et celle des 3 derniers mois, selon les règles applicables aux primes.
- Le minimum légal est de 1/4 de mois de salaire par année jusqu'à 10 ans, puis 1/3 de mois par année au-delà.
- Une convention collective, le contrat ou un usage peut prévoir une indemnité plus favorable.

## Limites du jeu de paramètres
- Le jeu ne modélise pas les dispositions conventionnelles ou contractuelles plus favorables.
- Le calculateur traite la comparaison des moyennes 12 mois / 3 mois et permet d'isoler une prime annuelle ou exceptionnelle pour appliquer la prise en compte proportionnelle prévue par la règle des 3 mois.
- Il ne reconstitue pas les situations nécessitant un calcul détaillé des périodes de temps partiel, des absences ou d'autres rémunérations particulières.
- Le calculateur bloque l'estimation légale en cas de faute grave ou lourde.
- Le calculateur distingue l'ancienneté à la date d'envoi de la lettre (droit à l'indemnité) et l'ancienneté à la rupture effective (montant).
- Le calculateur reste une estimation du minimum légal et ne remplace pas la vérification de la convention collective applicable.

## Paramètres
Les règles réglementaires sont désormais dans `data/parametres.json` (jeu `indemnite-licenciement`), diffusées par `public/parametres.js`.

Les textes applicables doivent être revérifiés avant toute évolution du jeu ou nouvelle année.
