# Décisions d’architecture

## 2026-10-09 — Migration et enrichissement des frais de notaire

Le calculateur frais de notaire est migré vers `data/parametres.json`. Les paramètres recensent le plafond global indicatif des droits de mutation pour l’ancien, le plafond lié à la première acquisition destinée à la résidence principale, le taux réduit de certaines acquisitions dans le neuf, la contribution de sécurité immobilière, le barème des émoluments, la TVA et une provision indicative de débours. Les sources sont impots.gouv.fr et le BOFiP, vérifiées le 9 octobre 2026. Le calcul ne détermine pas le taux exact voté par chaque département ni toutes les conditions juridiques ; il reste une estimation et l’indique explicitement.

## 2026-10-09 — Migration et enrichissement de la donation

Le calculateur donation est migré vers `data/parametres.json` : abattements usuels, abattement handicap, barème progressif en ligne directe, barème distinct entre époux/Pacs, barème entre frères et sœurs et taux des autres liens. Les montants ont été recoupés avec Service-Public et les articles applicables du CGI le 9 octobre 2026. Le calcul prend en compte la base taxable déjà soumise au barème lorsque l’utilisateur la renseigne, mais ne reconstitue pas automatiquement les déclarations antérieures. Il ne valide pas les plafonds globaux ni les conditions factuelles des exonérations. L’article 790 A bis est temporaire jusqu’au 31 décembre 2026 ; son renouvellement éventuel nécessite une vérification réglementaire.

## 2026-10-09 — Migration et enrichissement de l’IFI

Le calculateur IFI est migré vers `data/parametres.json` : seuil d’assujettissement, tranches du barème, décote, abattement de résidence principale et limitation de la déduction des dettes. L’interface détaille l’actif immobilier retenu, les dettes admises et le patrimoine net taxable. L’estimation reste avant réduction pour dons, plafonnement de l’IFI et imputation d’impôts étrangers ; les exonérations et règles complexes de valorisation ne sont pas entièrement modélisées.

## 2026-10-08 — Migration et enrichissement du PTZ

Le calculateur PTZ est migré vers `data/parametres.json` avant l’enrichissement, conformément au processus d’enrichissement des calculateurs. Le jeu couvre les offres émises du 1er avril 2025 au 31 décembre 2027 et centralise les plafonds de ressources, coefficients familiaux, tranches, plafonds d’opération, quotités et durées/différés. La page reste une pré-estimation : les régimes particuliers, les exceptions à la primo-accession, la conformité détaillée des travaux et la solvabilité bancaire ne sont pas déterminés automatiquement.

# Décisions techniques

## Taux d’endettement — classement et méthode (2026-10-09)

Le calculateur `/outil/taux-endettement/` est classé **B — réglementaire migré** : le repère HCSF est lu dans le jeu `capacite-emprunt` de `data/parametres.json`. Le jeu est partagé avec le calculateur de capacité d’emprunt ; aucune valeur réglementaire n’est dupliquée dans la page.

Le taux affiché porte sur les mensualités des crédits existants et du nouveau crédit, assurance comprise, rapportées aux revenus mensuels nets avant impôt. Les pensions alimentaires versées et le loyer conservé après le projet sont exclus de ce taux simplifié et déduits séparément pour calculer le budget restant. La page indique explicitement que cette estimation ne reproduit pas l’intégralité de l’analyse bancaire. Un cas de référence sourcé est maintenu dans `tests/references/core.json`, et la note de vérification des sources se trouve dans `docs/taux-endettement/SOURCES.md`.


## Êtes-vous riche ? — série statistique retenue 2026-10-05

Le calculateur `/outil/etes-vous-riche/` utilise les seuils 2024 publiés dans l’Insee Première n°2079, « Les salaires dans le secteur privé en 2024 » (publication du 23 octobre 2025). Cette publication fournit D1 à D9 ainsi que les 95e et 99e centiles nécessaires au positionnement proposé par le calculateur.

L’édition 2026 de la fiche Insee sur les salaires dans le secteur privé a élargi son champ aux apprentis, stagiaires rémunérés et à Mayotte et indique que ses données ne sont pas comparables à celles de l’édition 2025. Elle ne fournit par ailleurs pas les 95e et 99e centiles utilisés par le calculateur. Le calculateur conserve donc explicitement la série 2025 pour préserver un périmètre statistique cohérent et les niveaux de positionnement proposés. Toute évolution vers une nouvelle série devra être traitée comme une évolution fonctionnelle et statistique distincte, avec nouvelle vérification des seuils et des tests de référence.

## Partage de dépenses : formats numériques utilisateur

Les champs de montant, nombre de personnes et pourcentage refusent la notation scientifique afin de rester cohérents avec les formats décimaux affichés. Le parsing des pourcentages reprend le traitement des espaces et espaces insécables des autres champs numériques. Les pourcentages personnalisés restent limités à deux décimales.

## RSA : moteur séparé de l'interface

Le moteur RSA est placé dans `public/rsa.js` afin de séparer les règles métier du HTML et de faciliter les contrôles et futures mises à jour réglementaires.

## Ressources sur trois mois

L'interface demande trois montants mensuels afin de représenter la période de référence et d'éviter un calcul basé sur un seul mois.

## Pas de stockage serveur

Les données saisies sont traitées côté navigateur et ne sont pas envoyées à un endpoint applicatif dédié.

## Préparation AdSense

L'intégration publicitaire est préparée via un fichier `ads.txt`, les marqueurs éditeur dans le `<head>`, une CSP dédiée et des contrôles de pipeline. Aucun bloc publicitaire `adsbygoogle` n'est ajouté à ce stade. Les smoke tests bloquent les requêtes publicitaires afin d'éviter de générer des impressions pendant les validations automatisées.

## Taxonomie 2026-10-03

La structure logique des outils est définie avant les prochaines intégrations : type unique, catégorie principale unique et conservation des URL. La taxonomie est centralisée dans `data/tools.json`, hors de `public/` et donc non servie. Cette première étape ne réécrit pas les blocs de contenu existants.

## Migration taxonomie 2026-10-03

Les relations entre outils sont maintenant stockées avec la taxonomie centrale. Le pré-rendu et le contrôle CI ne dépendent plus d'un second référentiel `groups`. Cette migration ne change aucune URL.

## Sécurité et processus pré-production 2026-10-03

Le contrôle transversal `scripts/check-security.mjs` est le gate des invariants de sécurité, de frontière de production, de taxonomie et de CI/CD. Il est exécuté au début du workflow de déploiement, avant toute génération ou transformation du build.

Les contrôles CI bloquent une configuration non conforme ; ils ne modifient jamais automatiquement les règles de sécurité ou l'architecture. Toute évolution d'architecture ou de sécurité doit d'abord être décidée et auditée manuellement.

Le workflow de tests fonctionnels reste séparé du gate de sécurité. Le workflow de déploiement conserve les contrôles de build, de qualité, de smoke tests et les vérifications Cloudflare post-MEP.

## HTML-first 2026-10-03

Les 77 pages `/outil/<slug>/` sont désormais HTML-first et autonomes pour leur contenu éditorial initial. Le script historique de pré-rendu et son workflow de validation ont été supprimés. Les URLs existantes sont conservées.

## Durcissement CI/CD P0 — 2026-10-03

Le dépôt doit rester la source de vérité de la production. Les scripts de génération du sitemap, d'uniformisation du layout et de préparation AdSense peuvent conserver leur mode de génération pour les opérations manuelles, mais le workflow de production les exécute désormais en mode `--check` et échoue si le contenu commité n'est pas déjà conforme. Les tests fonctionnels critiques sont exécutés dans le workflow de déploiement et le workflow `tests` s'exécute sur toute PR vers `main` ainsi que sur les merge groups. Le contrôle des GitHub Actions accepte les commentaires de fin de ligne tout en exigeant un SHA complet.


## Canonical HTML migration — 2026-10-03

Le contenu HTML commité a été synchronisé avec les transformations canoniques existantes de layout partagé et de préparation AdSense. Le pipeline CI/CD ne réécrit plus ces fichiers en production : il vérifie désormais leur conformité et échoue en cas de dérive.


## Durcissement post-audit P0 — 2026-10-03

Le workflow `tests` récupère désormais l'historique Git complet afin que le calcul déterministe des dates `lastmod` du sitemap soit identique en PR et en production.

Le commit de synchronisation HTML `b1844c90bd4c31a815b31433268a629e2049b97a` est explicitement exclu du calcul des `lastmod` car il ne constitue pas une modification éditoriale des pages. Le sitemap est régénéré par le mécanisme canonique et reste une source de vérité committée.

Le contrôle `normalize-layout.mjs --check` est fail-closed : une divergence ou un avertissement structurel fait échouer le contrôle. Le contrôle de cohérence du layout du workflow de déploiement n'est plus présenté comme un contrôle informatif.

Avant chaque MEP, le workflow enregistre la version Cloudflare actuellement active. Si le déploiement ou une vérification de production échoue après cette étape, le workflow tente automatiquement de rétablir cette version précédente. Ce rollback ne modifie ni le dépôt ni les fichiers locaux.

## Lastmod du sitemap versionné avec le contenu — 2026-10-03

Les dates `lastmod` du sitemap sont désormais définies dans `data/lastmod.json`, versionné avec le contenu, et ne dépendent plus de l'historique Git. Elles ne dépendent donc ni des commits ignorés, ni de la date du committeur qui peut changer lors d'un rebase. La génération du sitemap valide la couverture exacte des routes, les dates et l'absence de doublons avant de produire la sortie committée.

Cette décision remplace en partie l'entrée « Durcissement post-audit P0 » ci-dessus sur les `lastmod` : l'historique Git complet et les commits ignorés ne sont plus nécessaires pour déterminer les dates.

## Source de vérité unique de la taxonomie — 2026-10-03

La taxonomie des outils repose désormais sur une seule déclaration par outil dans `data/tools.json`. Le type, la catégorie principale et les relations `relatedTools` sont définis au même endroit. L'ancien objet `TOOL_TYPES`, qui dupliquait le type de chaque outil, a été supprimé ainsi que son contrôle de cohérence. Cette décision vise à réduire les points de divergence et à rendre l'ajout ou l'évolution d'un outil plus simple, sans introduire de moteur générique supplémentaire.


## 2026-10-03 — Phase 1 : gabarit HTML canonique et documentation

La forme du site est désormais documentée autour d'un gabarit HTML-first unique, avec `public/outil/tva/index.html` comme référence concrète et `public/outil/_template.html` comme point de copie non public.

Le contrat documentaire impose notamment un `<title>` de la forme « Mot-clé principal | Simulateur », une meta description de 120 à 160 caractères, un résultat initial non vide, un `WebApplication` JSON-LD et un `BreadcrumbList` JSON-LD cohérent avec la canonique.

La documentation a été corrigée pour refléter le flux réel : header et footer commités dans les pages, `normalize-layout.mjs --check` et `check-layout.mjs` bloquants, et absence de `scripts/prerender-tools.mjs`. Cette phase ne modifie aucune URL, logique métier, règle de calcul, CSP, en-tête de sécurité, pinning GitHub Actions ou mécanisme de rollback.


## 2026-10-03 — Correction MEP Phase 1 : template hors `public/`

La première MEP de la Phase 1 a été bloquée par le contrôle statique : `public/outil/_template.html` était volontairement exclu des walks `index.html`, mais restait néanmoins parcouru par le contrôle global de toutes les pages HTML publiques. Le fichier contenait en outre des placeholders non résolvables comme `/categorie/`.

Le template canonique est donc déplacé dans `docs/template-outil.html`. Il reste disponible comme point de copie documentaire sans être une ressource publique. Aucune URL publique, logique métier, règle de calcul, CSP, en-tête de sécurité, pinning GitHub Actions ou mécanisme de rollback n'est modifié.


## 2026-10-03 — Taxonomie hors `public/`

La taxonomie des outils est déplacée de `public/simulateurs.js` vers `data/tools.json`. Ce fichier est hors de `public/` et n'est donc pas servi comme ressource publique. Les consommateurs CI/CD et de validation lisent désormais ce JSON avec `JSON.parse`. `public/simulateurs.js` est réduit aux utilitaires numériques et au moteur partagé de calcul, sans modification de `window.Simulateurs.calc`.


## 2026-10-03 — relatedTools en liste de slugs

`relatedTools` devient une liste ordonnée de slugs dans `data/tools.json`. Les titres et descriptions de l'ancienne structure ne sont plus une donnée de référence : le texte des liens du HTML est libre. Le contrôle exige que les slugs existent, ne contiennent ni auto-référence ni doublon, et (check-pages) que le bloc `.related-tools` du HTML liste exactement ces slugs. Aucune page HTML n'est modifiée par cette décision.


## 2026-10-03 — Gel de l'architecture : règles structurelles et éditoriales

L'architecture est gelée autour d'un socle HTML commun obligatoire, avec liberté d'enrichir l'intérieur du bloc outil. `check-pages` distingue les règles structurelles (le socle, bloquantes) des règles éditoriales (qualité de contenu, suivies par compteurs sans bloquer). Le contrat HTML ne dit rien sur le style du JavaScript interne : `window.TOOL` reste le défaut recommandé, et un moteur réglementaire peut être extrait en `public/<slug>.js` comme `rsa.js` et `impot.js`. Remplacé en partie par l'entrée suivante : les règles éditoriales sont désormais sous cliquet.


## 2026-10-03 — Cliquet sur les règles structurelles et éditoriales

`check-pages --ratchet` est bloquant en CI et en déploiement. Les écarts structurels et éditoriaux suivis sont figés dans `scripts/check-pages.baseline.json` : un nouvel écart fait échouer la CI, et un écart corrigé doit être retiré de la baseline (entrée périmée). Les règles éditoriales ne peuvent que diminuer : toute nouvelle page doit être conforme dès sa création. `--update-baseline` ne peut que retirer des entrées. `--seed-baseline` sert uniquement à amorcer une règle éditoriale qui n'a encore aucune entrée et refuse toute règle déjà présente. Les deux blocs Node inline de `deploy.yml` sont supprimés une fois leurs contrôles portés dans `check-pages` et testés ; le garde de cohérence avant production, la validation statique, les tests, les smoke tests, le déploiement et le rollback sont conservés tels quels.

## 2026-10-06 — Contrat final des pages interactives modifiées

Le contrôle de conformité d'une PR est séparé du cliquet de dette historique. Lorsqu'une PR modifie une page interactive, `check-pages --check-changed-contract` exige que toutes les règles suivies du contrat soient satisfaites dans l'état final de la page, sans que la baseline puisse servir d'exception. Le cliquet continue à détecter les nouveaux écarts et les dettes périmées des pages non modifiées. Une dette corrigée sur une page modifiée ne bloque donc pas la PR ; sa suppression de la baseline reste une opération explicite et séparée.

## 2026-10-03 — Outils associés HTML-first

Toutes les pages `/outil/` utilisent désormais 2 à 4 relations ordonnées dans `data/tools.json` et dans leur HTML. Cette duplication contrôlée est volontaire : le JSON sert au contrôle de cohérence, tandis que le HTML est la source de vérité rendue au visiteur.

Le fallback JavaScript historique des outils associés est supprimé une fois le comptage final validé. Les pages `/conversion/` et `/comparateur/` restent HTML-first avec 2 à 4 liens sans `relatedTools`.

La page TVA reçoit volontairement une nouvelle liste visible d'outils associés : pourcentage, remise, prix-unitaire et impot-sur-le-revenu. `capacite-emprunt` est ramenée à un seul bloc standard de quatre liens ; son paragraphe « Sources officielles… » est conservé dans le contenu.


## 2026-10-03 — Taxonomie définitive et contrôle des hubs

La taxonomie principale est désormais arrêtée : Maths (/maths/) regroupe pourcentage, proportion, ratio, fractions, moyenne, moyenne pondérée, médiane/mode, arrondi et calculatrice. Argent conserve coefficient, marge, remise et prix unitaire. TVA devient un calculateur ; épargne et frais kilométriques deviennent des simulateurs ; temps devient une conversion tout en conservant son URL /outil/temps/.

Les URLs existantes sont conservées. Les deux intentions prix unitaire (/outil/prix-unitaire/ et /comparateur/prix-unitaire/) restent distinctes pour le moment. Les hubs de catégorie et de type sont alignés sur la déclaration centrale ; les liens transversaux des hubs de catégorie restent visibles avec la classe see-also.

Le contrôle CI check-hubs.mjs vérifiera la couverture exacte des hubs de catégorie, la cohérence des hubs de type, la couverture des pages /conversion/ et /comparateur/ et la présence de toutes les catégories sur l’accueil.


## Paramètres réglementaires centralisés — 2026-10-03

Les barèmes ne sont plus codés en dur dans chaque page : ils vivent dans `data/parametres.json` avec validité, source et date de vérification, et sont diffusés par un fichier généré (`public/parametres.js`). Choix : un JSON central plutôt qu'un module par moteur, pour contrôler tous les jeux au même endroit ; une année dans un titre seulement pour un barème daté ; contrôle de péremption bloquant sur la validité dépassée (une page ne doit pas afficher un barème périmé) mais simple avertissement sur l'ancienneté de la vérification (une PR sans rapport ne doit pas casser un jour donné pour une simple date de contrôle). Migration par lots : trois outils pilotes (SMIC, frais kilométriques, RSA) ; les autres restent listés dans `anneeAMigrer` jusqu'à leur tour. Limite connue : la prose HTML n'est liée aux paramètres que pour les montants déclarés dans `htmlMentions`.

## 2026-10-04 — Verrou anneeAMigrer et anticipation des échéances

Un outil encore marqué `anneeAMigrer` dans `data/parametres.json` ne peut pas résorber ses écarts éditoriaux suivis (`description`, `content-h2`, `formula`) dans `scripts/check-pages.baseline.json`. Le cliquet bloque leur retrait jusqu'à la migration du barème vers `parametres.json`, puis au retrait du marqueur. Cette règle évite d'enrichir un outil dont le barème reste à migrer.

Limite connue : si un slug est retiré de `anneeAMigrer` après suppression de l'année du titre/H1, sans migration effective du barème, les contrôles actuels ne détectent pas cette échappatoire.

`check-params.mjs` conserve son comportement par défaut : seule une validité dépassée est bloquante. L'option `--horizon <jours>` permet une anticipation indépendante ; les jeux qui expirent dans moins de l'horizon deviennent bloquants pour ce contrôle. Le workflow PR exécute cette anticipation en non bloquant avec une annotation GitHub warning, et un workflow hebdomadaire l'exécute en bloquant. Les échéances suivies sont documentées dans `docs/ECHEANCES.md`.

## 2026-10-04 — Deux couches de tests des calculateurs

Les calculateurs à script intégré disposent de deux niveaux de filet de sécurité. La couche 1 exécute chaque script intégré dans `node:vm` avec un DOM minimal et plusieurs familles d'entrées limites ; elle vérifie l'absence d'exception, de résultat vide et de valeurs invalides. Les exceptions techniques existantes sont versionnées dans `tests/generic-calcs-exceptions.json` et sont ratchetées par identité et motif.

La couche 2 ajoute des cas de référence pilotés par `tests/references/*.json`. Chaque valeur attendue est indépendante du code testé et accompagnée d'une source publiée fiable. Les cas refusent les outils encore marqués `anneeAMigrer`, lus directement depuis `data/parametres.json`. Les sorties sont vérifiées à partir d'un libellé ou d'une regex déclarée dans le champ `sortie`.

La couche 1 appelle volontairement `TOOL.calc` directement pour observer la sortie brute avant le garde-fou de `simulateurs.js`. Ce contournement est intentionnel et limité au harnais de test.

Le smoke Chromium et le contrôle post-déploiement utilisent le même module `tests/invalid-result.mjs` pour détecter `NaN`, `Infinity`, `undefined`, `null`, `[object Object]`, `∞` et `-∞`.

## 2026-10-04 — Balises de partage dans le normaliseur de layout

Les balises Open Graph et Twitter sont générées par `normalize-layout.mjs` plutôt que écrites page par page : elles sont dérivées du titre, de la meta description et de la canonique, qui restent la source de vérité, et le mode `--check` bloque toute dérive. Choix : `twitter:card` en `summary` et aucune `og:image`, faute d'image dans le dépôt ; une image de partage pourra être ajoutée plus tard sans toucher aux URL. Les pages sans titre, description ou canonique (`404.html`) ne reçoivent aucune balise. Aucune URL, logique de calcul, CSP ni date `lastmod` n'est modifiée (changement mécanique de balisage).

## 2026-10-04 — Socle H2 éditorial commun

Les deux H2 éditoriaux obligatoires des calculateurs utilisent un traitement visuel commun via `section.content-section > h2`. Le composant repose sur une hiérarchie typographique sobre, un accent latéral, des espacements constants et un comportement mobile dédié. Le choix porte uniquement sur la forme visuelle : le contenu des sections éditoriales reste libre selon le calculateur.

Le H2 de la FAQ reste volontairement distinct, car la FAQ est un composant interactif avec son propre traitement visuel. Les H2 des blocs « Outils associés » restent également distincts. Les pages déjà enrichies pourront être remises progressivement à ce standard visuel lors de leur repasse individuelle, sans exception permanente ni contrainte d'uniformisation du contenu.

Le choix est porté par le CSS commun plutôt que par une multiplication de variantes HTML : les pages conservent leur structure `content-section`, tandis que le template documentaire rappelle ce composant comme référence. Une page ne doit pas créer de style H2 spécifique à un calculateur sans justification d'architecture commune.



## 2026-10-05 — Durcissement du contrat des pages interactives et de la CI

Le contrôle de couverture des pages interactives s'applique aux familles `outil`, `conversion` et `comparateur`. Les tests génériques, de référence et Chromium vérifient ce contrat commun sans effacer les différences de logique entre familles.

Le garde-fou de layout interdit les redéfinitions locales des titres `h1` à `h6` et les redéfinitions locales des composants partagés, notamment `.content-section h2` et `.calculator-faq h2`. Un test dédié vérifie ces invariants et est exécuté dans les workflows de tests et de déploiement. Le contrôle de syntaxe des blocs Node inline conservés dans `deploy.yml` est vérifié automatiquement.

Les contrôles de sitemap, de filtre publicitaire et de formes de résultat invalide sont désormais communs aux workflows de tests et de déploiement. Les cas de référence dépendant d'une API simulée utilisent une fixture de transport explicitement séparée de la valeur attendue issue de la source publiée.
## 2026-10-07 — Prêt immobilier : calcul mathématique sans barème réglementaire

Le calculateur `pret-immobilier` ne dépend pas d’un barème réglementaire daté : le taux, la durée, le capital et l’hypothèse d’assurance sont saisis par l’utilisateur. Il ne doit donc pas rester dans `data/parametres.json > anneeAMigrer.slugs`. La suppression de son année dans le titre est une correction de périmètre, pas une migration réglementaire.


## 2026-10-07 — Prêt immobilier : scénarios de taux et prix du bien

Le calculateur conserve son périmètre de simulation mathématique et ajoute deux scénarios directement utiles à l’intention de recherche : comparaison de taux autour du taux saisi et calcul optionnel du capital emprunté à partir du prix du bien et de l’apport. Ces fonctions enrichissent la comparaison sans introduire de barème de taux de marché, de TAEG approximatif ou de logique PTZ dans cette page.

Lorsque le prix du bien et l’apport sont renseignés, ils déterminent le capital simulé ; le champ « montant emprunté » devient alors facultatif. Le capital saisi reste utilisé lorsque le prix du bien n’est pas renseigné.


## 2026-10-07 — Migration des paramètres du calculateur de capacité d’emprunt

Le calculateur `capacite-emprunt` était encore verrouillé dans `data/parametres.json > anneeAMigrer.slugs`. Cette PR constitue uniquement la migration préalable imposée par le processus d’enrichissement : le cadre HCSF utilisé par le calcul est désormais centralisé dans `data/parametres.json` et diffusé par `public/parametres.js`.

Le jeu centralise le taux d’effort maximal de 35 % et la maturité maximale de 25 ans. La formule, les valeurs par défaut, les limites de saisie et la présentation de la page ne sont pas enrichies dans cette PR. Le taux de marché affiché par défaut est volontairement laissé hors du jeu réglementaire et documenté séparément, car son actualisation constitue un chantier distinct.

## 2026-10-07 — Salaire brut net : hors migration réglementaire

Le calculateur `salaire-brut-net` est retiré de `data/parametres.json > anneeAMigrer.slugs`. Les coefficients internes de 23 % pour le non-cadre et 25 % pour le cadre sont des hypothèses d'estimation, pas un barème réglementaire officiel pouvant être centralisé comme tel dans `data/parametres.json`. La page n'est donc pas traitée comme une migration de barème. L'année est retirée du titre et du H1 afin de respecter le contrôle de cohérence des paramètres. L'enrichissement du calculateur fera l'objet d'une PR distincte.
