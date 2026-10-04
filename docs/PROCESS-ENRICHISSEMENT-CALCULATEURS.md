# Processus d'enrichissement des calculateurs

> Document de référence pour enrichir les calculateurs de Simulateur, un à la fois.
> Dernière révision : 4 octobre 2026.

## Objectif

Transformer progressivement chaque calculateur en une page réellement utile, fiable et différenciante, sans multiplier les refontes ni dégrader le socle commun.

Le principe directeur est la **qualité et la valeur ajoutée** : un enrichissement n'est pas jugé au volume de texte ajouté, mais à ce qu'il apporte réellement à l'utilisateur.

Un calculateur est traité de bout en bout, puis considéré comme **terminé** et gelé. Il n'est rouvert que pour une correction, une évolution réglementaire ou une évolution fonctionnelle réellement justifiée.

Ce document complète, sans les remplacer, les règles déjà en vigueur :

| Document ou fichier | Rôle |
|---|---|
| `docs/FORME.md` | Forme des pages, règles de simplicité, tests de référence (§ « Tests de référence d'un calculateur ») |
| `docs/template-outil.html` | Point de copie documentaire unique du gabarit d'un outil |
| `docs/DECISIONS.md` | Décisions d'architecture et leurs justifications |
| `docs/ECHEANCES.md` | Échéances des paramètres réglementaires et procédure de renouvellement |
| `data/parametres.json` | Barèmes et paramètres réglementaires, avec source, validité et date de vérification |
| `scripts/check-pages.baseline.json` | Écarts éditoriaux connus et suivis par le cliquet |
| `tests/references/*.json` | Cas de référence à valeur attendue sourcée |

En cas de conflit, ces documents d'architecture priment sur le présent processus.

---

## 0. Prérequis techniques et garde-fous

Cette section est **bloquante** : aucun audit éditorial ne commence avant qu'elle soit remplie.

### 0.1 Classer le calculateur

Chaque calculateur appartient à une classe, qui détermine ce qui est permis.

| Classe | Définition | Exemples actuels | Enrichissement éditorial |
|---|---|---|---|
| **A. Pur calcul** | Aucune valeur réglementaire ni valeur datée : conversions, mathématiques, pourcentages, statistiques | `pourcentage`, `moyenne`, `vitesse`, `conversion/*` | Autorisé |
| **B. Réglementaire migré** | Rattaché à un jeu de `data/parametres.json` (champ `usedBy`) | `smic`, `rsa`, `frais-kilometriques` | Autorisé, avec les exigences du § 0.4 |
| **C. Réglementaire verrouillé** | Slug présent dans `anneeAMigrer.slugs` de `data/parametres.json` | liste d'`anneeAMigrer` | **Interdit** : migrer d'abord le barème (§ 0.5) |
| **D. À qualifier** | Manipule peut-être des taux, plafonds, durées légales ou barèmes sans être migré ni listé | à auditer au cas par cas | Interdit tant que le classement n'est pas tranché (§ 0.6) |

Le classement se vérifie dans les fichiers, pas de mémoire :

1. chercher le slug dans `anneeAMigrer.slugs` (classe C) ;
2. chercher le slug dans les champs `usedBy` des jeux de paramètres (classe B) ;
3. sinon, lire le script de l'outil à la recherche de constantes chiffrées de nature légale, fiscale ou sociale (classe D si présentes, classe A sinon).

### 0.2 Relever l'état de la baseline

Lister les entrées de `scripts/check-pages.baseline.json` concernant la page (`path` = `public/outil/<slug>/index.html`, ou le chemin de la famille concernée). Ces entrées sont l'écart éditorial connu : elles constituent une partie de la cible de l'enrichissement.

Pour voir les écarts actuels d'une page, lancer `node scripts/check-pages.mjs` sans option : la sortie liste chaque écart avec son chemin, sa règle et son message (filtrer par slug au besoin).

Règles du cliquet, à respecter strictement :

- la baseline ne **grossit jamais** : aucun nouvel écart n'est toléré, aucune entrée n'est ajoutée à la main ;
- une entrée corrigée est **retirée** avec l'option `--update-baseline` de `scripts/check-pages.mjs`, jamais à la main ;
- une entrée corrigée mais non retirée fait échouer la CI (« entrée périmée ») ;
- les entrées `description`, `content-h2` et `formula` d'un outil verrouillé (classe C) ne peuvent pas être retirées tant que son slug figure dans `anneeAMigrer` : le cliquet les bloque volontairement. Les autres règles ne sont pas concernées par ce verrou, mais la classe C reste interdite d'enrichissement éditorial (§ 0.1) ;
- seules les entrées **de l'outil traité** sont modifiées dans la baseline, dans la même PR que l'enrichissement ;
- l'option `--seed-baseline` du script **ajoute** des entrées éditoriales : elle n'est jamais utilisée dans le cadre de ce processus.

#### Ce que chaque règle exige réellement

Cette table est tirée du code de `scripts/check-pages.mjs`. En cas de doute ou d'évolution du script, le script fait foi. Elle rend la cible de chaque chantier concrète.

| Règle | Exigence vérifiée par `check-pages` |
|---|---|
| `title` | un seul `<title>`, de la forme « Mot-clé \| Simulateur », avec un mot-clé non vide |
| `description` | une seule meta description, de 120 à 160 caractères. Elle doit aussi être identique à `WebApplication.description` du JSON-LD (règle `jsonld`) |
| `content-h2` | au moins 2 titres h2 éditoriaux, situés dans des `.content-section` et hors `.related-tools` |
| `formula` | un bloc `.formula` ou `.source-links` contenant un lien externe http(s) (hors simulateur.site) |
| `faq` | un bloc `.calculator-faq` unique en accordéon natif `<details>/<summary>`, avec au moins une question et une réponse non vide |
| `result` | deux conditions indépendantes, qui peuvent porter sur deux éléments : un `.result` non vide dans le HTML source (donc non rempli par JavaScript), et un `.result` avec `aria-live="polite"` |
| `tool-block` | une seule section `.tool` contenant le h1 et un `p.tool-intro` non vide ; pour `/outil/`, au moins un `input`, `select`, `textarea` ou `button` dans la page ; les ids hérités `ey`, `title`, `intro` et `source` sont interdits |
| `meta-unique` | titre et description uniques sur l'ensemble du site (outil, conversion, comparateur) |

Les douze règles structurelles et les cinq règles éditoriales (`description`, `content-h2`, `formula`, `faq`, `meta-unique`) sont suivies par le cliquet.

### 0.3 Vérifier que le filet de sécurité couvre l'outil

Avant de modifier quoi que ce soit, exécuter les contrôles listés en § 11.1 sur la branche de départ, et noter qu'ils sont verts. Un état de départ rouge se traite séparément, avant le chantier.

Vérifier en particulier :

- que l'outil passe les six familles d'entrées de la couche 1 (`tests/generic-calcs.test.mjs` : cas par défaut, zéro, vide, négatif, grand nombre, virgule décimale) ;
- que `tests/generic-calcs-exceptions.json` ne contient **aucune exception** le concernant. Une exception existante doit être traitée ou justifiée, jamais prolongée. Aucune nouvelle exception n'est autorisée par ce processus ;
- si un cas de référence existe déjà pour l'outil dans `tests/references/`.

### 0.4 Exigences supplémentaires pour un outil réglementaire (classe B)

- **Aucune valeur réglementaire n'est écrite en dur dans la page.** Elle vit dans `data/parametres.json`, avec sa source officielle, sa période de validité (`effectiveFrom`, `effectiveTo`) et sa date de vérification (`verifiedOn`).
- **Source officielle d'abord** : Service-Public, Légifrance, impots.gouv.fr, Caf, URSSAF, ministères. Un calculateur tiers n'est jamais la source d'une valeur réglementaire ; il ne sert qu'à une vérification croisée.
- **Un cas de référence sourcé est obligatoire** dans `tests/references/*.json`, avec une source officielle. La valeur attendue ne doit **jamais** être obtenue en exécutant le calculateur testé (règle de `docs/FORME.md`).
- **Une note de sources** par outil réglementaire, sur le modèle de `docs/rsa/SOURCES.md` : liens, date de vérification, ce qui a été vérifié et ce qui ne l'a pas été.
- **L'échéance est suivie** dans `docs/ECHEANCES.md`, avec la procédure de renouvellement. Un outil dont le jeu expire ne peut pas être déclaré « terminé » sans cette ligne.
- **Aucune valeur n'est inventée ni déduite d'une autre source** lorsque la source officielle n'est pas disponible. Dans ce cas, l'information est omise ou signalée comme non vérifiée, et la limite est écrite dans la page.
- **L'année dans le titre ou le H1** n'est admise que si elle est cohérente avec le jeu de paramètres de l'outil ou avec `anneeAMigrer` : `scripts/check-params.mjs` contrôle cette cohérence.

### 0.5 Outil verrouillé (classe C) : migrer d'abord

Un outil de `anneeAMigrer` ne s'enrichit pas. Il se **migre**, dans une PR dédiée, avant tout chantier éditorial :

1. créer ou compléter le jeu de paramètres correspondant dans `data/parametres.json`, avec source, validité et vérification ;
2. régénérer et contrôler `public/parametres.js` (`scripts/generate-params.mjs`) ;
3. brancher l'outil sur les paramètres, sans changer le résultat produit, sauf correction justifiée ;
4. ajouter le cas de référence sourcé (§ 0.4) ;
5. retirer le slug de `anneeAMigrer` **uniquement** lorsque la migration est réelle ;
6. renseigner `docs/ECHEANCES.md` ;
7. ne modifier aucun barème au passage : une migration est mécanique, une revalorisation est une autre PR.

L'enrichissement éditorial ne commence qu'une fois cette PR fusionnée.

### 0.6 Outil à qualifier (classe D)

Le classement d'un outil douteux est une décision, pas un détail. Il se traite dans une PR ou une note dédiée, avant le chantier éditorial, et se documente dans `docs/DECISIONS.md`. Deux issues possibles :

- l'outil ne contient aucune valeur réglementaire : il passe en classe A ;
- l'outil en contient : il doit être migré vers un jeu de paramètres (classe B), ou inscrit à `anneeAMigrer` si les contrôles actuels le permettent. Le mécanisme exact se décide au cas par cas, car `scripts/check-params.mjs` impose des règles sur la présence d'une année dans le titre ou le H1 des outils listés.

### 0.7 Séparer les types de changement

Un chantier peut impliquer plusieurs types de changement. Ils se livrent dans des **PR distinctes**, mergées dans cet ordre :

1. correction d'un bug de calcul ou de saisie (exemple : ajout d'un `type="number"` manquant) ;
2. migration du barème vers les paramètres (§ 0.5) ;
3. enrichissement éditorial.

Raison : un bug mélangé à un enrichissement rend la revue illisible et masque la cause d'une régression. Chaque PR garde un périmètre vérifiable.

---

## 1. Socle obligatoire

Le format structurel et fonctionnel commun du site reste la référence. L'enrichissement ne doit pas contourner ou remplacer ce socle.

Pour une page `/outil/`, le socle comprend :

- title et métadonnées SEO ;
- H1 et introduction ;
- calculateur et résultat ;
- contenu explicatif ;
- données utilisées, hypothèses ou notes lorsque pertinentes ;
- FAQ obligatoire en accordéon natif `<details>/<summary>`, pour chaque page `/outil/`, avec un bloc `.calculator-faq` unique, un H2 `FAQ`, `aria-labelledby="faq-title"` et `id="faq-title"`, au moins une question et, pour chaque question, un bloc `.calculator-faq-answer` non vide ;
- sources ;
- calculs associés et maillage interne ;
- breadcrumb visible et BreadcrumbList ;
- WebApplication JSON-LD ;
- structure HTML, comportement commun, responsive et accessibilité ;
- gestion correcte des entrées invalides et du résultat.

Le socle impose une **structure commune**, pas une longueur uniforme ni un contenu identique. La profondeur de chaque section dépend du calculateur, de sa complexité et de l'intention utilisateur.

Toute évolution du socle commun (gabarit, normaliseur de layout, règles de `check-pages`) est une **décision d'architecture distincte**, documentée dans `docs/DECISIONS.md`. Elle n'est jamais introduite pour enrichir un outil particulier.

---

## 2. Une unité de travail = un calculateur

Un chantier d'enrichissement porte sur **un seul calculateur** à la fois.

| Phase | Contenu | Livrable |
|---|---|---|
| 0 | Qualification et garde-fous (§ 0) | Classe, entrées de baseline, état de départ |
| 1 | Audit (§ 3) | Fiche d'audit |
| 2 | Cible et périmètre (§ 4) | Fiche de cadrage |
| 3 | Intentions de recherche et benchmark (§ 5, § 9) | Notes d'intentions et de benchmark |
| 4 | PR préalables éventuelles : bug, migration (§ 0.7) | PR mergées |
| 5 | Enrichissement (§ 10) | Modifications sur la branche |
| 6 | Tests et contrôles (§ 11) | Contrôles verts |
| 7 | Revue finale et PR (§ 12) | PR conforme à la checklist |
| 8 | Mise en production, **uniquement après autorisation explicite** (§ 13) | Déploiement |
| 9 | Vérification post-production (§ 13) | Constat écrit |
| 10 | Clôture : statut « Terminé », registre, gel (§ 14, § 15) | Ligne du registre à jour |

On ne profite pas d'un chantier pour modifier plusieurs calculateurs, pour refaire l'architecture du site ou pour toucher à un barème en dehors de l'outil traité.

### Choix du calculateur suivant

L'ordre de traitement suit cette priorité :

1. les outils réglementaires **déjà migrés et vérifiés** (classe B), où le terrain est sûr et les paramètres sourcés ;
2. les outils de **pur calcul** (classe A), sans risque de contenu réglementaire inexact ;
3. les outils verrouillés (classe C), **après** leur migration ;
4. les outils à qualifier (classe D), **après** leur classement.

À l'intérieur d'une classe, privilégier les outils dont la demande est la plus forte (données de recherche si disponibles, sinon pertinence de l'intention) et ceux qui ont le plus d'entrées de baseline à résorber.

---

## 3. Audit avant modification

Aucune modification ne commence avant l'audit. Le résultat s'écrit dans la fiche d'audit (annexe B) et distingue ce qui est **nécessaire** de ce qui serait seulement souhaitable.

### Calcul et fiabilité

- formule et logique métier ;
- pour toute refonte ou modification substantielle du comportement, ajouter ou mettre à jour des tests métier propres au calculateur : au minimum un cas nominal, un cas limite pertinent et les règles particulières importantes ;
- les tests spécifiques restent associés au calculateur et sont exécutés à chaque CI ; les tests génériques par famille ne remplacent pas cette couverture ;
- unités et conventions ;
- arrondis ;
- cas limites ;
- valeurs nulles, vides, négatives, très grandes, invalides ;
- saisie avec virgule décimale ;
- cas particuliers ;
- références et sources ;
- tests existants, cas de référence existants ;
- paramètres réglementaires lorsque concernés (classe, validité, vérification).

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
- cohérence avec le socle commun et avec le gabarit.

### SEO

- intention principale ;
- variantes de recherche ;
- questions et intentions secondaires ;
- couverture actuelle ;
- maillage interne entrant et sortant ;
- différenciation par rapport aux résultats pertinents.

### UX et technique

- compréhension immédiate ;
- ordre des blocs ;
- mobile ;
- accessibilité (libellés des champs, contraste, navigation au clavier) ;
- saisie, touche Entrée ;
- affichage du résultat ;
- messages d'erreur ;
- champs numériques : chaque champ de saisie numérique déclare un type adapté. Un champ sans `type="number"` dans lequel on saisit une virgule décimale peut produire `NaN`. Tout champ sans type doit être justifié (liste de valeurs, texte libre) ;
- absence de régression évidente.

---

## 4. Cible et périmètre

À l'issue de l'audit, fixer par écrit :

- la classe du calculateur ;
- la liste des entrées de baseline à résorber ;
- les corrections de calcul nécessaires (elles partent dans une PR distincte, § 0.7) ;
- le contenu à ajouter, à modifier, à supprimer ;
- ce qui est **hors périmètre** et pourquoi ;
- les cas de test à ajouter ;
- les sources à vérifier.

Une cible trop large se découpe. Un outil complexe peut justifier plusieurs PR, mais ne devient « terminé » qu'à la clôture de la dernière.

---

## 5. Recherche d'intentions : partir des besoins, pas des mots-clés

La recherche sert à comprendre ce que les utilisateurs cherchent et les questions auxquelles la page doit répondre.

Pour chaque calculateur, identifier lorsque les données sont disponibles :

- requête principale ;
- variantes naturelles ;
- requêtes longue traîne ;
- questions fréquentes ;
- intentions secondaires ;
- vocabulaire réellement employé.

**Sources de données** : Google Search Console si l'accès existe pour le site ; à défaut, les suggestions et questions associées des moteurs de recherche, les forums et sites officiels où les questions se posent, et les pages concurrentes pertinentes. Lorsque aucune donnée chiffrée n'est disponible, le dire explicitement dans la fiche et traiter les intentions comme des **hypothèses**, à confirmer ensuite par les données réelles.

Les requêtes servent à **définir les besoins à couvrir**, pas à remplir artificiellement la page.

La requête principale doit être naturellement cohérente avec le title, le H1, l'introduction et le contenu principal. Les variantes sont utilisées uniquement lorsqu'elles correspondent réellement au sujet traité.

Aucune phrase ne doit être ajoutée uniquement pour placer un mot-clé.

### Test de valeur

Pour chaque ajout éditorial :

- Est-ce que cela répond à une question réelle ?
- Est-ce que cela explique quelque chose d'utile ?
- Est-ce que cela aide à utiliser ou interpréter le calculateur ?
- Est-ce que cela apporte une précision, un exemple, une limite ou une information absente ailleurs sur la page ?
- Si le SEO n'existait pas, conserverait-on quand même ce contenu ?

Si la réponse est non, l'ajout est supprimé ou reformulé.

---

## 6. Valeur ajoutée et différenciation

L'objectif n'est pas de produire une page plus longue que les concurrents. L'objectif est de produire une page **meilleure et plus utile**.

L'enrichissement recherche, selon le sujet :

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

Le contenu ne doit pas copier, paraphraser de près ou allonger ce qui existe ailleurs. Il apporte une valeur propre à Simulateur. Les formulations sont originales ; les données publiques (barèmes, textes de loi) se citent par leur source, sans reproduire de longs passages.

Le volume de mots n'est jamais un objectif en soi.

### Sujets à enjeu (finance, droit, travail, santé)

Les calculateurs touchant à l'argent, au droit ou à l'emploi relèvent d'un contenu à enjeu élevé pour l'utilisateur. Pour eux :

- les résultats sont présentés comme **indicatifs** lorsqu'ils le sont, avec les hypothèses qui les conditionnent ;
- les cas où le calcul ne s'applique pas sont écrits (situations exclues, conventions collectives, régimes particuliers) ;
- la page oriente vers l'organisme officiel compétent lorsque le cas dépasse le simulateur ;
- aucune promesse de résultat ou de montant garanti n'est formulée.

---

## 7. Explications

Les explications sont adaptées au calculateur. Elles peuvent couvrir :

1. ce que signifie le résultat ;
2. comment le calcul est effectué ;
3. la formule et ses variables ;
4. un exemple concret ;
5. les données ou hypothèses utilisées ;
6. les limites et cas particuliers ;
7. les conséquences pratiques lorsque cela aide l'utilisateur.

Toutes les sections ne sont pas obligatoires sur tous les outils : leur présence dépend de leur utilité réelle.

### Exemples

- Chaque exemple chiffré est **recalculé indépendamment** (à la main ou par une source), jamais copié depuis la sortie de l'outil sans contrôle.
- Les nombres suivent les conventions françaises : séparateur décimal virgule, espace pour les milliers, symbole de l'euro après le nombre.
- Un exemple publié doit correspondre à une entrée que l'outil accepte, et donner le résultat affiché. Lorsqu'il est possible, il est repris comme cas de test.

---

## 8. FAQ

La FAQ est obligatoire pour chaque calculateur. Elle utilise l’accordéon natif `<details>/<summary>` du nouveau template et reste directement présente dans le HTML.

La FAQ contient des **questions réelles et pertinentes**, pas des formulations créées pour ajouter du texte ou des mots-clés.

Pour chaque question :

- elle correspond à une intention identifiable ;
- elle apporte quelque chose qui n'est pas déjà parfaitement couvert ailleurs sur la page ;
- la réponse est précise et utile ;
- la formulation peut naturellement correspondre à une recherche utilisateur.

Éviter les questions promotionnelles ou redondantes avec l'introduction et le fonctionnement évident du calculateur.

La FAQ visible prime sur toute recherche artificielle de résultat enrichi. Toute donnée structurée de FAQ reflète exactement le contenu visible.

---

## 9. Benchmark

Avant l'enrichissement, comparer le calculateur à un petit nombre de résultats réellement pertinents, généralement 3 à 5.

Comparer :

- couverture du besoin ;
- calculs proposés ;
- cas particuliers ;
- explications ;
- exemples ;
- FAQ ;
- sources ;
- UX ;
- limites et hypothèses.

La question à trancher :

> **Qu'est-ce que notre page apporte de réellement meilleur ou plus utile ?**

Le benchmark sert à trouver des lacunes et des opportunités, pas à reproduire les concurrents. Une page concurrente n'est jamais la source d'une valeur réglementaire (§ 0.4) : elle peut signaler un cas à vérifier, la vérification se fait à la source officielle.

---

## 10. Enrichissement

Une fois la cible définie, les modifications sont limitées au périmètre nécessaire :

- page du calculateur ;
- logique du calculateur, uniquement pour une évolution justifiée et validée (une correction de bug part dans sa propre PR, § 0.7) ;
- tests, y compris le cas de référence sourcé (§ 0.4) ;
- données ou références nécessaires (`data/parametres.json` pour un outil réglementaire) ;
- `data/tools.json` lorsque nécessaire ;
- entrées de la baseline **propres à l'outil**, retirées avec `--update-baseline` ;
- `docs/ECHEANCES.md` et la note de sources pour un outil réglementaire.

Les fichiers communs (gabarit, scripts de contrôle, workflows, baseline des autres outils) ne sont pas modifiés. Une modification commune n'est introduite que si le besoin est démontré pour plusieurs pages, et elle suit la règle du § 1.

Règles de rédaction techniques :

- les gabarits de pages sont respectés (`docs/template-outil.html`) ;
- le résultat ne contient jamais `NaN`, `Infinity`, `undefined`, `null`, `[object Object]` ni `∞` ;
- les champs de saisie numériques portent un type adapté et acceptent la virgule décimale ;
- les messages d'erreur sont explicites et en français ;
- la date `lastmod` de la page est mise à jour selon la règle de `docs/DECISIONS.md`, uniquement pour une évolution substantielle du contenu.

---

## 11. Contrôle qualité avant validation

### 11.1 Contrôles automatiques

Exécuter sur la branche, avant ouverture de la PR, les contrôles de `.github/workflows/tests.yml` (liste à jour dans ce fichier). Parmi eux :

Les tests génériques par famille constituent un filet de sécurité permanent. Les scénarios métier propres à un calculateur doivent être ajoutés ou mis à jour dans sa PR lorsqu'une refonte ou une modification substantielle touche son comportement. Une modification purement mécanique sans changement de comportement ne nécessite pas de nouveau cas artificiel.

- `node tests/simulateurs.test.js` (garde des résultats) ;
- `node tests/invalid-result.test.mjs` ;
- `node tests/ad-filter.test.mjs` ;
- `node tests/smoke-results.test.mjs` ;
- `node scripts/smoke-site.mjs --base-url http://127.0.0.1:4173 --mode local` ;
- `node tests/generic-calcs.test.mjs` (aucune exception ajoutée) ;
- `node tests/interactive-families.test.mjs` (scénarios métier génériques des conversions et comparateurs déterministes) ;
- `node tests/reference-calcs.test.mjs` ;
- `node tests/params.test.mjs` ;
- `node tests/check-pages.test.mjs` ;
- `node scripts/check-pages.mjs --ratchet` (cliquet de la baseline, bloquant en CI).

Commandes du cliquet :

- `node scripts/check-pages.mjs --ratchet` vérifie l'état courant par rapport à la baseline. Il échoue en cas de nouvel écart, d'entrée périmée ou d'entrée bloquée par `anneeAMigrer`. À lancer avant d'ouvrir la PR, et après chaque correction ;
- `node scripts/check-pages.mjs --update-baseline` retire de la baseline les entrées corrigées. Il refuse de s'exécuter si un nouvel écart existe ou si l'outil est verrouillé par `anneeAMigrer` ; la baseline ne peut que perdre des entrées.

Ordre d'usage pour un chantier : corriger la page, lancer `--ratchet` (il signale les entrées périmées), lancer `--update-baseline`, relancer `--ratchet` (il doit être vert), puis committer la baseline avec la page.

Joindre les sorties à la PR.

### 11.2 Contrôles manuels

**Calcul**
- cas normaux ;
- cas limites ;
- entrées invalides ;
- virgule décimale ;
- arrondis ;
- résultats attendus ;
- références indépendantes (obligatoires pour un outil réglementaire).

**Page**
- structure ;
- contenu ;
- liens ;
- sources ;
- canonical ;
- JSON-LD ;
- breadcrumb ;
- outils associés ;
- absence de duplication ou de régression.

**UX**
- desktop ;
- mobile ;
- saisie ;
- touche Entrée ;
- résultat ;
- erreurs ;
- lisibilité ;
- accessibilité au clavier et libellés des champs.

**SEO**
- intention principale couverte ;
- requêtes pertinentes intégrées naturellement ;
- questions secondaires couvertes lorsque justifiées ;
- aucun contenu artificiel ;
- aucune répétition de mots-clés ;
- title, H1 et description cohérents ;
- maillage interne utile ;
- contenu différenciant.

---

## 12. Revue et Pull Request

- Une branche par calculateur : `feat/enrichissement-<slug>`.
- Un titre de PR explicite : `feat(<slug>): enrichir le calculateur <nom>`.
- Des messages de commit en français, au format `type: description` ou `type(scope): description`.
- Une PR par type de changement (§ 0.7).
- La description reprend la checklist de l'annexe A, cochée, avec les sorties des contrôles.
- Aucun barème, taux ou plafond modifié en dehors d'une PR de migration ou de revalorisation, annoncée comme telle.
- Aucune fusion tant que la CI n'est pas verte sur le dernier commit et que la branche n'est pas à jour avec `main`.
- Fusion en **squash**, pour garder un historique lisible.

La revue vérifie en priorité : l'exactitude du calcul, la source de chaque valeur, le test de valeur du § 5 sur chaque ajout éditorial, et l'absence de modification hors périmètre (`git diff --stat main...HEAD`).

---

## 13. Mise en production et vérification

La mise en production n'a lieu **qu'après autorisation explicite** de la personne responsable du site. Un merge ne vaut pas autorisation de déployer.

Le workflow de déploiement exécute un smoke avant et après la mise en ligne, et peut déclencher un retour arrière automatique si le contrôle de production échoue. Un résultat invalide dans un `.result`, une erreur console ou une page sans titre est donc **bloquant**. S'en assurer en local avant la demande de mise en production.

Après la mise en production, vérifier et consigner par écrit :

- la page répond en 200 et son title est correct ;
- le calculateur fonctionne avec un cas de référence ;
- aucune erreur console ;
- le rendu desktop et mobile ;
- la canonical, le JSON-LD et le breadcrumb ;
- les liens internes de la page.

Si un problème apparaît, la correction ou le retour arrière passe avant toute autre activité.

---

## 14. Definition of Done

Un calculateur n'est « terminé » que lorsque **tous** les points ci-dessous sont vrais.

**Fiabilité**
- [ ] le calcul est vérifié sur cas normaux, limites, invalides et virgule décimale ;
- [ ] les tests métier propres au calculateur sont présents ou mis à jour lorsqu'une refonte ou une modification substantielle touche son comportement ;
- [ ] au moins un cas de référence sourcé existe dans `tests/references/*.json` (obligatoire en classe B, recommandé en classe A) ;
- [ ] aucune exception n'existe ni n'a été ajoutée dans `tests/generic-calcs-exceptions.json` pour cet outil ;
- [ ] le résultat ne produit jamais de valeur invalide.

**Paramètres et conformité (outils réglementaires)**
- [ ] les valeurs vivent dans `data/parametres.json`, avec source officielle, validité et `verifiedOn` ;
- [ ] `docs/ECHEANCES.md` mentionne l'échéance ;
- [ ] une note de sources existe pour l'outil ;
- [ ] le slug n'est plus dans `anneeAMigrer`, ou n'y a jamais été.

**Socle et baseline**
- [ ] le socle structurel est conforme (§ 1) ;
- [ ] les entrées de baseline de l'outil sont retirées avec `--update-baseline` ;
- [ ] aucune entrée n'a été ajoutée à la baseline ;
- [ ] la CI est verte sur le dernier commit.

**Contenu**
- [ ] le contenu répond à l'intention principale ;
- [ ] les explications apportent une valeur ajoutée (test de valeur du § 5 passé sur chaque ajout) ;
- [ ] les exemples sont recalculés indépendamment et correspondent au résultat de l'outil ;
- [ ] la FAQ obligatoire est utile, sans question artificielle ;
- [ ] les sources sont fiables, officielles pour le réglementaire, et vérifiées à une date notée ;
- [ ] le maillage interne est pertinent ;
- [ ] le SEO est travaillé sans contenu artificiel.

**Expérience**
- [ ] l'UX desktop et mobile est satisfaisante ;
- [ ] l'accessibilité de base est vérifiée ;
- [ ] aucune régression connue ne subsiste.

**Clôture**
- [ ] après mise en production autorisée, la vérification de production est consignée ;
- [ ] la ligne du registre de suivi est à jour (annexe C).

Le statut **TERMINÉ** signifie que le calculateur est suffisamment abouti pour passer au suivant, et non qu'il doit être continuellement retouché.

---

## 15. Gel après terminaison

Un calculateur terminé figure dans le registre de suivi avec son statut et sa date. Il ne doit pas être rouvert pour une amélioration mineure de convenance.

**Réouverture justifiée** uniquement en cas de :

- bug ou erreur de calcul ;
- changement réglementaire ;
- source devenue obsolète ;
- échéance de paramètres arrivant à terme ;
- évolution fonctionnelle réellement justifiée ;
- problème SEO démontré par les données ;
- problème UX ou accessibilité important ;
- information substantielle nouvelle nécessitant une mise à jour.

Une préférence éditoriale mineure ou l'envie d'ajouter encore du texte ne constitue pas une raison suffisante.

### Le gel et les paramètres réglementaires

Le gel porte sur l'**éditorial**, pas sur les paramètres. Le renouvellement d'un jeu de `data/parametres.json` à son échéance suit la procédure de `docs/ECHEANCES.md` et n'est jamais bloqué par le statut « Terminé ». À chaque renouvellement :

- les valeurs, la source et `verifiedOn` sont mis à jour ;
- le cas de référence est mis à jour uniquement si la source officielle a changé le résultat attendu ;
- la ligne du registre est mise à jour (date de dernière vérification).

Le contrôle des paramètres avec horizon (`scripts/check-params.mjs --horizon`) signale à l'avance les jeux proches de l'échéance : un avertissement ou un échec sur ce contrôle est une réouverture justifiée.

---

## 16. Consignes pour un assistant (humain ou IA)

Pour toute personne ou tout outil appliquant ce processus :

1. **Ne jamais inventer** une valeur réglementaire, un taux, un plafond, une date de validité ou une source. En l'absence de source officielle, s'arrêter et signaler le manque.
2. **Ne jamais fabriquer** une valeur attendue de test en exécutant le calculateur testé.
3. **Ne jamais modifier** `data/parametres.json` ou `scripts/check-pages.baseline.json` hors du cadre explicite du chantier.
4. **Ne jamais ajouter** d'entrée à la baseline (y compris avec `--seed-baseline`) ni d'exception générique.
5. **Ne jamais fusionner ni déployer** sans autorisation explicite.
6. **Un seul calculateur par chantier**, un seul type de changement par PR.
7. En cas d'écart entre ce document et le dépôt (fichier absent, option inconnue, règle différente), **vérifier dans le dépôt** et signaler l'écart plutôt que de supposer.
8. Rendre compte : fichiers touchés, commits, sorties des contrôles, hypothèses non vérifiées, points laissés en suspens.

---

## 17. Principe final

Le site doit progresser par **unités finies de haute qualité**.

Le but n'est pas d'enrichir rapidement 77 pages à moitié. Le but est de pouvoir dire, calculateur après calculateur :

> **Cette page est fiable, utile, claire, bien sourcée, bien structurée, pertinente pour les recherches qu'elle vise et apporte une vraie valeur ajoutée. Elle est terminée.**

Ce processus privilégie la qualité, l'exactitude, l'originalité et la satisfaction de l'utilisateur plutôt que le volume de contenu ou la production destinée principalement au référencement.

---

## Annexe A : checklist de PR (à copier dans `.github/pull_request_template.md`)

```markdown
## Calculateur
- Slug : 
- Classe (A / B / C migré / D qualifié) : 
- Type de PR (correction / migration / enrichissement) : 

## Garde-fous
- [ ] Un seul calculateur et un seul type de changement
- [ ] Aucun barème, taux ou plafond modifié (sauf PR de migration ou de revalorisation annoncée)
- [ ] Aucune entrée ajoutée à `scripts/check-pages.baseline.json`
- [ ] Entrées de baseline de l'outil retirées avec `--update-baseline`
- [ ] Aucune exception ajoutée à `tests/generic-calcs-exceptions.json`
- [ ] Slug absent de `anneeAMigrer` (ou migration faite dans une PR préalable)

## Fiabilité
- [ ] Cas normaux, limites, invalides et virgule décimale vérifiés
- [ ] Cas de référence sourcé ajouté ou confirmé (source officielle si réglementaire)
- [ ] Valeur attendue non obtenue par exécution de l'outil
- [ ] `docs/ECHEANCES.md` et note de sources à jour (outils réglementaires)

## Contenu
- [ ] Test de valeur passé sur chaque ajout éditorial
- [ ] Exemples recalculés indépendamment
- [ ] FAQ utile, sans question artificielle
- [ ] Sources fiables, vérifiées, datées
- [ ] Maillage interne pertinent
- [ ] Aucun mot-clé artificiel

## Vérifications
- [ ] CI verte sur le dernier commit
- [ ] Branche à jour avec `main`
- [ ] `git diff --stat main...HEAD` limité au périmètre annoncé
- [ ] Mobile et desktop contrôlés
- Sorties des contrôles : 

## Production
- [ ] Aucun déploiement effectué (autorisation explicite requise)
```

## Annexe B : fiche d'audit (modèle)

```markdown
# Audit : <slug>

- Date de l'audit : 
- Classe : A / B / C / D
- Entrées de baseline concernées : 
- Jeu de paramètres associé : 
- Cas de référence existant : oui / non
- Exception générique existante : oui / non

## Calcul et fiabilité
- Formule et conventions : 
- Arrondis : 
- Cas limites testés : 
- Problèmes constatés (nécessaire / souhaitable) : 

## Page et contenu
- Title / description / H1 : 
- Introduction : 
- Explications, formule, exemples : 
- FAQ : 
- Sources : 
- Maillage interne : 

## Intentions de recherche
- Requête principale : 
- Variantes et longue traîne : 
- Questions secondaires : 
- Source des données (Search Console / hypothèses) : 

## Benchmark (3 à 5 pages)
- Pages comparées : 
- Lacunes de notre page : 
- Ce que nous apportons de réellement meilleur : 

## UX et technique
- Mobile / accessibilité / saisie / Entrée : 
- Champs de saisie sans type adapté : 

## Cible
- Contenu à ajouter, modifier, supprimer : 
- Hors périmètre : 
- PR préalables nécessaires (correction, migration) : 
- Cas de test à ajouter : 
```

## Annexe C : registre de suivi (modèle pour `docs/ENRICHISSEMENT-SUIVI.md`)

```markdown
# Suivi de l'enrichissement des calculateurs

Statuts : À qualifier · Verrouillé (migration requise) · À faire · En cours · Terminé · Rouvert

| Slug | Classe | Statut | Date | PR | Dernière vérification des sources | Remarques |
|---|---|---|---|---|---|---|
| smic | B | À faire | | | 2026-10-03 | Échéance du jeu : 2026-12-31 |
| frais-kilometriques | B | À faire | | | 2026-10-03 | |
| rsa | B | À faire | | | 2026-09-28 | |
```
