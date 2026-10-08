# Sources réglementaires — temps de travail

Vérification effectuée le 8 octobre 2026.

## Sources principales
1. [Service-Public — Durée du travail d'un salarié du secteur privé à temps plein](https://www.service-public.gouv.fr/particuliers/vosdroits/F1911), vérifié le 25 septembre 2025.
2. [Ministère du Travail — La durée légale du travail](https://travail-emploi.gouv.fr/la-duree-legale-du-travail), mise à jour le 13 juin 2025.

## Principes vérifiés
- La durée légale de référence d'un salarié à temps complet dans le cas général est de 35 heures par semaine.
- L'équivalent mensuel forfaitaire correspondant est de 151,67 heures.
- La durée quotidienne maximale est en principe de 10 heures.
- La durée hebdomadaire maximale est en principe de 48 heures sur une même semaine et de 44 heures en moyenne sur 12 semaines consécutives.
- Des dispositions conventionnelles et des situations particulières peuvent modifier les règles applicables.

## Paramètres
Les références utilisées par le calculateur sont centralisées dans `data/parametres.json`, jeu `temps-travail`, et diffusées par `public/parametres.js`.

## Limites
Le calculateur mesure un temps de travail à partir des horaires saisis. Il ne détermine pas juridiquement les heures supplémentaires, les temps de pause assimilés au temps de travail effectif, les régimes d'aménagement du temps de travail, les conventions de forfait ou les règles particulières applicables à certaines catégories de salariés.

Toute évolution réglementaire doit entraîner une revue des paramètres, des sources et des tests avant publication.
