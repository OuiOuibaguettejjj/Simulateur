# Processus d'enrichissement des calculateurs

## Objectif

Transformer progressivement chaque calculateur en une page réellement utile, fiable et différenciante, sans multiplier les refontes ni dégrader le socle commun.

Le principe directeur est la **qualité et la valeur ajoutée** : un enrichissement n'est pas jugé au volume de texte ajouté, mais à ce qu'il apporte réellement à l'utilisateur.

Un calculateur est traité de bout en bout, puis considéré comme **terminé à 100 %** et gelé. Il n'est rouvert que pour une correction, une évolution réglementaire ou une évolution fonctionnelle réellement justifiée.

## 1. Socle obligatoire

Le format structurel et fonctionnel commun du site reste la référence. L'enrichissement ne doit pas contourner ou remplacer ce socle.

Pour une page \`/outil/\`, le socle comprend notamment :

- title et métadonnées SEO ;
- H1 et introduction ;
- calculateur et résultat ;
- contenu explicatif ;
- données utilisées, hypothèses ou notes lorsque pertinentes ;
- FAQ lorsque pertinente ;
- sources ;
- calculs associés et maillage interne ;
- breadcrumb visible et BreadcrumbList ;
- WebApplication JSON-LD ;
- structure HTML, comportement commun, responsive et accessibilité ;
- gestion correcte des entrées invalides et du résultat.

Le socle impose une **structure commune**, pas une longueur uniforme ni un contenu identique. La profondeur de chaque section dépend du calculateur, de sa complexité et de l'intention utilisateur.

Toute évolution du socle commun doit être traitée comme une décision d'architecture distincte. Elle ne doit pas être introduite simplement pour enrichir un outil particulier.

## 2. Une unité de travail = un calculateur

Un chantier d'enrichissement porte sur un seul calculateur à la fois.

Étapes obligatoires :

1. audit ;
2. définition de la cible ;
3. recherche des intentions et requêtes pertinentes ;
4. benchmark ciblé ;
5. enrichissement ;
6. tests et contrôles ;
7. revue finale ;
8. PR ;
9. MEP uniquement après autorisation explicite ;
10. vérification post-MEP ;
11. classement « terminé ».

On ne profite pas d'un chantier pour modifier plusieurs calculateurs ou refaire l'architecture du site.

## 3. Audit avant modification

Aucune modification ne commence avant l'audit du calculateur.

L'audit couvre :

### Calcul et fiabilité
- formule et logique métier ;
- unités et conventions ;
- arrondis ;
- cas limites ;
- valeurs nulles ou invalides ;
- cas particuliers ;
- références et sources ;
- tests existants ;
- paramètres réglementaires lorsque concernés.

### Page et contenu
- title, description et H1 ;
- introduction ;
- calculateur et résultat ;
- explications ;
- formule ;
- données utilisées et hypothèses ;
- exemples ;
- FAQ ;
- sources ;
- calculs associés ;
- cohérence avec le socle commun.

### SEO
- intention principale ;
- variantes de recherche ;
- questions et intentions secondaires ;
- couverture actuelle ;
- maillage interne ;
- différenciation par rapport aux résultats pertinents.

### UX et technique
- compréhension immédiate ;
- ordre des blocs ;
- mobile ;
- accessibilité ;
- saisie ;
- touche Entrée ;
- affichage du résultat ;
- messages d'erreur ;
- absence de régression évidente.

L'audit distingue ce qui est **nécessaire** de ce qui serait seulement souhaitable.

## 4. Recherche SEO : partir des besoins, pas des mots-clés

La recherche SEO sert à comprendre ce que les utilisateurs cherchent et les questions auxquelles la page doit répondre.

Pour chaque calculateur, identifier lorsque les données sont disponibles :

- requête principale ;
- variantes naturelles ;
- requêtes longue traîne ;
- questions fréquentes ;
- intentions secondaires ;
- vocabulaire réellement employé.

Les requêtes servent à **définir les besoins à couvrir**, pas à remplir artificiellement la page.

La requête principale doit être naturellement cohérente avec le title, le H1, l'introduction et le contenu principal. Les variantes sont utilisées uniquement lorsqu'elles correspondent réellement au sujet traité.

Aucune phrase ne doit être ajoutée uniquement pour placer un mot-clé.

### Test de valeur

Pour chaque ajout éditorial, poser les questions suivantes :

- Est-ce que cela répond à une question réelle ?
- Est-ce que cela explique quelque chose d'utile ?
- Est-ce que cela aide à utiliser ou interpréter le calculateur ?
- Est-ce que cela apporte une précision, un exemple, une limite ou une information absente ailleurs ?
- Si le SEO n'existait pas, conserverait-on quand même ce contenu ?

Si la réponse est non, l'ajout doit être supprimé ou reformulé.

## 5. Valeur ajoutée et différenciation

L'objectif n'est pas de produire une page plus longue que les concurrents.

L'objectif est de produire une page **meilleure et plus utile**.

L'enrichissement doit rechercher, selon le sujet :

- une explication plus claire ;
- une formule compréhensible ;
- des exemples réellement parlants ;
- des cas particuliers utiles ;
- des hypothèses explicites ;
- une meilleure interprétation du résultat ;
- des sources fiables et vérifiables ;
- des informations à jour ;
- un parcours utilisateur plus simple ;
- un maillage interne pertinent ;
- une réponse plus complète aux questions réellement posées.

Le contenu ne doit pas simplement copier, paraphraser ou allonger ce qui existe ailleurs. Il doit apporter une valeur propre à Simulateur.

Le volume de mots n'est jamais un objectif en soi.

## 6. Explications

Les explications sont adaptées au calculateur. Elles peuvent notamment couvrir :

1. ce que signifie le résultat ;
2. comment le calcul est effectué ;
3. la formule et ses variables ;
4. un exemple concret ;
5. les données ou hypothèses utilisées ;
6. les limites et cas particuliers ;
7. les conséquences pratiques lorsque cela aide l'utilisateur.

Toutes les sections ne sont pas obligatoires sur tous les outils : leur présence dépend de leur utilité réelle.

## 7. FAQ

La FAQ contient des **questions réelles et pertinentes**, pas des formulations créées pour ajouter du texte ou des mots-clés.

Pour chaque question :

- elle doit correspondre à une intention identifiable ;
- elle doit apporter quelque chose qui n'est pas déjà parfaitement couvert ailleurs ;
- la réponse doit être précise et utile ;
- la formulation peut naturellement correspondre à une recherche utilisateur.

Éviter notamment les questions purement promotionnelles ou redondantes avec l'introduction et le fonctionnement évident du calculateur.

La FAQ visible est prioritaire sur toute recherche artificielle de résultat enrichi.

## 8. Benchmark

Avant l'enrichissement, comparer le calculateur à un petit nombre de résultats réellement pertinents, généralement 3 à 5.

Comparer notamment :

- couverture du besoin ;
- calculs proposés ;
- cas particuliers ;
- explications ;
- exemples ;
- FAQ ;
- sources ;
- UX ;
- limites et hypothèses.

La question à trancher est :

> **Qu'est-ce que notre page apporte de réellement meilleur ou plus utile ?**

Le benchmark sert à trouver des lacunes et des opportunités, pas à reproduire les concurrents.

## 9. Enrichissement

Une fois la cible définie, les modifications sont limitées au périmètre nécessaire :

- page du calculateur ;
- logique du calculateur si nécessaire ;
- tests ;
- données ou références nécessaires ;
- \`data/tools.json\` lorsque nécessaire.

Une modification commune n'est introduite que si le besoin est démontré pour plusieurs pages et qu'elle respecte le gel de l'architecture.

## 10. Contrôle qualité avant validation

### Calcul
- cas normaux ;
- cas limites ;
- entrées invalides ;
- arrondis ;
- résultats attendus ;
- références indépendantes lorsque disponibles.

### Page
- structure ;
- contenu ;
- liens ;
- sources ;
- canonical ;
- JSON-LD ;
- breadcrumb ;
- related tools ;
- absence de duplication ou régression.

### UX
- desktop ;
- mobile ;
- saisie ;
- Entrée ;
- résultat ;
- erreurs ;
- lisibilité.

### SEO
- intention principale couverte ;
- requêtes pertinentes intégrées naturellement ;
- questions secondaires couvertes lorsque justifiées ;
- aucun contenu artificiel ;
- aucune répétition de mots-clés ;
- title, H1 et description cohérents ;
- maillage interne utile ;
- contenu différenciant.

## 11. Definition of Done

Un calculateur n'est « terminé » que lorsque :

- le calcul est vérifié ;
- les tests pertinents sont verts ;
- les cas limites importants sont traités ;
- le socle structurel est conforme ;
- le contenu répond réellement à l'intention ;
- les explications apportent une valeur ajoutée ;
- les exemples sont pertinents ;
- la FAQ est utile lorsqu'elle est présente ;
- les sources sont fiables et à jour ;
- le maillage interne est pertinent ;
- le SEO est travaillé sans contenu artificiel ;
- l'UX desktop et mobile est satisfaisante ;
- aucune régression connue ne subsiste ;
- la CI est verte ;
- après MEP autorisée, la production a été vérifiée.

Le statut **TERMINÉ** signifie que le calculateur est considéré comme suffisamment abouti pour passer au suivant, et non qu'il doit être continuellement retouché.

## 12. Gel après terminaison

Un calculateur terminé ne doit pas être rouvert pour une amélioration mineure de convenance.

Réouverture justifiée uniquement en cas de :

- bug ou erreur de calcul ;
- changement réglementaire ;
- source devenue obsolète ;
- évolution fonctionnelle réellement justifiée ;
- problème SEO démontré par les données ;
- problème UX ou accessibilité important ;
- information substantielle nouvelle nécessitant une mise à jour.

Une préférence éditoriale mineure ou l'envie d'ajouter encore du texte ne constitue pas une raison suffisante.

## 13. Principe final

Le site doit progresser par **unités finies de haute qualité**.

Le but n'est pas d'enrichir rapidement 77 pages à moitié.

Le but est de pouvoir dire, calculateur après calculateur :

> **Cette page est fiable, utile, claire, bien sourcée, bien structurée, pertinente pour les recherches qu'elle vise et apporte une vraie valeur ajoutée. Elle est terminée.**

Ce processus privilégie donc la qualité, l'exactitude, l'originalité et la satisfaction de l'utilisateur plutôt que le volume de contenu ou la production destinée principalement au référencement.
