# Décisions techniques

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

L'architecture est gelée autour d'un socle HTML commun obligatoire, avec liberté d'enrichir l'intérieur du bloc outil. `check-pages` distingue les règles structurelles (le socle, bloquantes) des règles éditoriales (qualité de contenu, suivies par compteurs sans bloquer). Le contrat HTML ne dit rien sur le style du JavaScript interne : `window.TOOL` reste le défaut recommandé, et un moteur réglementaire peut être extrait en `public/<slug>.js` comme `rsa.js` et `impot.js`.

