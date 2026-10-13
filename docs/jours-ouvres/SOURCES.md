# Sources — Calculateur de jours ouvrés

Vérification effectuée le 13 octobre 2026.

## Sources officielles

1. [Service-Public.fr — Jours fériés en France](https://www.service-public.gouv.fr/particuliers/vosdroits/F2405)
   - Source du calendrier national des jours fériés utilisé par le calculateur.
   - Le jeu de paramètres retient huit dates fixes et trois dates mobiles calculées à partir du dimanche de Pâques.
2. [Service-Public.fr — Jour ouvré, jour ouvrable et jour calendaire](https://www.service-public.gouv.fr/particuliers/vosdroits/F35697)
   - Source de la distinction entre jours ouvrés et jours ouvrables et de l'exemple de référence utilisé dans les tests.

## Éléments vérifiés

- Le calendrier courant comprend les huit dates fixes stockées dans `data/parametres.json` et le lundi de Pâques, l'Ascension et le lundi de Pentecôte, représentés par les décalages `[1, 39, 50]` après le dimanche de Pâques.
- Le cas de référence du 13 au 17 juillet 2026 compte quatre jours si le 14 juillet est exclu.
- Le calcul compte les jours du lundi au vendredi, dates de début et de fin incluses, et peut exclure les jours fériés nationaux qui tombent en semaine.

## Limites et éléments non vérifiés

- Le calcul applique le calendrier national métropolitain défini par le jeu de paramètres. Il ne modélise pas les jours fériés spécifiques à l'Alsace-Moselle, les accords collectifs ni les règles propres à un employeur.
- Les sources ci-dessus décrivent le calendrier courant ; elles ne valident pas rétroactivement le statut de chaque jour férié pour toutes les années depuis 1900. La plage 1900–2100 est une limite technique de saisie et ne constitue pas une garantie que le calendrier légal actuel s'appliquait à toutes ces dates.
- Les jours fériés ne sont pas nécessairement chômés dans toutes les activités. Le résultat est un décompte conventionnel et non une détermination juridique des jours effectivement travaillés.
- Toute modification légale ou évolution de la source doit déclencher une revue de `data/parametres.json`, des tests et de cette note.

## Paramètres

Le calendrier est centralisé dans le jeu `jours-ouvres` de `data/parametres.json`, puis diffusé par `public/parametres.js`. Date de vérification du jeu : 13 octobre 2026.
