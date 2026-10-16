# Sources — calculateur micro-entrepreneur

Dernière vérification : 16 octobre 2026.

## Sources officielles consultées

- [Service-Public Entreprendre — cotisations sociales du micro-entrepreneur](https://entreprendre.service-public.gouv.fr/vosdroits/F36232) : taux micro-sociaux ordinaires 2026, notamment 12,3 % pour la vente et l’hébergement hors exceptions, 21,2 % pour les prestations BIC, 25,6 % pour les professions libérales non réglementées et 23,2 % pour la Cipav.
- [Urssaf — guide auto-entrepreneur (PDF)](https://www.urssaf.fr/files/live/sites/urssaffr/files/autres/Diaporama_Auto-entrepreneur.pdf) : taux ACRE avant et à compter du 1er juillet 2026, et rappel de la CFP distincte.
- [Service-Public — ACRE](https://www.service-public.gouv.fr/particuliers/vosdroits/F11677) : principe, conditions, demande et taux minoré applicable aux créations à compter du 1er juillet 2026.
- [Service-Public Entreprendre — contribution à la formation professionnelle](https://entreprendre.service-public.gouv.fr/vosdroits/F23459) : CFP calculée séparément selon l’activité.
- [Décret n° 2026-69 du 6 février 2026 — Légifrance](https://www.legifrance.gouv.fr/loda/id/JORFTEXT000053449085) : changement des règles ACRE en 2026.

## Paramètres appliqués

Les taux ordinaires et les taux ACRE sont centralisés dans `data/parametres.json`, jeu `micro-entrepreneur`, et exposés par `public/parametres.js`. Les taux ACRE avant le 1er juillet sont repris du guide Urssaf ; à partir du 1er juillet 2026, les taux du guide sont 9,3 % (vente), 15,9 % (BIC), 19,2 % (BNC) et 17,4 % (Cipav). Pour les meublés de tourisme classés, le taux ordinaire publié est de 6 % et le taux ACRE à compter du 1er juillet 2026 de 4,5 %.

## Périmètre et limites

- Le calcul porte sur le chiffre d’affaires ou les recettes réellement encaissés. Il ne gère pas la ventilation d’une activité mixte.
- La catégorie « vente » ne couvre pas la location d’habitation meublée ; une option distincte existe pour la location de meublés de tourisme classés. Les règles de la location d’habitation meublée et d’autres situations particulières ne sont pas modélisées.
- La CFP est une contribution distincte des cotisations sociales : 0,1 % pour le commerce, 0,3 % pour l’artisanat et 0,2 % pour les professions libérales. Elle s’ajoute aux cotisations et n’est pas calculée ici. Le versement libératoire de l’impôt, la CFE, les frais professionnels et l’impôt sur le revenu ne sont pas inclus.
- Le calcul ACRE accepte les créations ou reprises du 1er janvier 2025 au 31 décembre 2026. Pour une création antérieure au 1er juillet 2026, il applique le barème ACRE antérieur ; à compter de cette date, il applique le barème réduit à 75 % du taux normal. L’outil estime la fin théorique des droits à la fin du troisième trimestre civil suivant le trimestre de début d’activité et vérifie que la période de chiffre d’affaires saisie est entièrement couverte. Si la période chevauche cette échéance, répartissez le chiffre d’affaires et faites deux calculs. Cette vérification ne remplace pas la confirmation des droits effectivement accordés par l’Urssaf.
- L’outil reste une estimation indicative ; pour une activité mixte, une location d’habitation meublée ou une situation particulière, confirmer le taux applicable auprès de l’Urssaf.
