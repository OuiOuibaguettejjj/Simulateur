# Architecture

Le site utilise un Cloudflare Worker devant des Static Assets. Les outils sont principalement servis depuis `public/outil/<slug>/index.html`, avec des composants communs dans `public/`.

Le simulateur RSA utilise un moteur dédié `public/rsa.js` séparé de son interface HTML. Cette séparation permet de modifier les paramètres réglementaires sans disperser la logique dans le rendu.

## Taxonomie des outils

La taxonomie officielle est centralisée dans `data/tools.json` via `categories` et `tools`. Chaque outil possède un type unique et une catégorie principale. Les URL existantes `/outil/<slug>/` ne sont pas modifiées.

La source de vérité contient également les relations `relatedTools` de chaque outil, sous forme d'une liste ordonnée de slugs (`["slug-a","slug-b"]`). Les titres et descriptions ne sont pas des données de référence : le texte des liens dans le HTML est libre (recommandé : titre de la page cible). L'ancien objet `groups` n'est plus utilisé.

Les contrôles pré-production vérifient notamment :
- la présence de chaque outil dans `data/tools.json` ;
- la validité des catégories et des relations `relatedTools` ;
- la correspondance entre la taxonomie centrale et les pages `/outil/<slug>/` ;
- la cohérence entre les métadonnées centrales et le HTML publié : catégorie, breadcrumb JSON-LD, URL canonique et liens du bloc « Outils associés ».

Les URLs existantes restent inchangées afin d'éviter une migration SEO inutile.

## Contrat des pages interactives

Les pages `/outil/<slug>/`, `/conversion/<slug>/` et `/comparateur/<slug>/` suivent un contrat HTML-first commun. Le HTML initial est la source de vérité pour le contenu essentiel : titre, H1, introduction, interface visible, résultat initial, méthode/limites, sources, breadcrumb et liens internes. Le JavaScript de l'outil conserve la logique de calcul et les interactions ; il ne doit pas être requis pour générer le contenu SEO principal.

Les règles transversales s’appliquent à toutes les pages interactives. Les règles de taxonomie de `data/tools.json` restent propres aux pages `/outil/<slug>/`. Le breadcrumb visible et le `BreadcrumbList` JSON-LD restent spécifiques aux outils lorsqu’ils utilisent la taxonomie centrale ; les conversions et comparateurs suivent leur propre fil d’Ariane jusqu’à leur URL canonique. Les relations `relatedTools` alimentent le bloc standard « Outils associés » lorsqu'elles sont définies ; des liens contextuels éditoriaux restent possibles lorsque leur valeur est réelle.

Les contrôles CI vérifient les invariants transversaux des pages interactives ainsi que, pour les outils, la cohérence entre la taxonomie centrale et le HTML statique. Ils empêchent notamment qu'un outil conserve un ancien breadcrumb, une mauvaise canonique ou un ancien maillage après une modification de `data/tools.json`.

Les simulateurs riches peuvent conserver des extensions spécifiques (graphiques, tableaux, scénarios, contenu réglementaire), à condition de respecter le socle commun. La FAQ n’est pas une extension optionnelle : elle est obligatoire sur chaque page interactive et suit le composant standard. Il n'est pas recherché une uniformité visuelle absolue.

La migration HTML-first est terminée : les 77 pages `/outil/<slug>/` sont statiques et autonomes pour leur contenu éditorial initial. Le script historique `scripts/prerender-tools.mjs` et son workflow de validation ont été supprimés. Il n'existe plus de migration progressive ni de réécriture pré-déploiement de ces pages.

Les URLs et la logique métier existantes sont conservées.
## Processus pré-production et MEP

Le contrôle transversal `scripts/check-security.mjs` est le gate unique pour les invariants de sécurité, de frontière de production, de taxonomie et de CI/CD. Il est exécuté au début du workflow de déploiement, avant toute génération ou transformation du build.

Les workflows `.github/workflows/tests.yml` et `.github/workflows/deploy.yml` partagent désormais les contrôles de qualité du dépôt : gate de sécurité, validation statique complète, `check-layout`, tests fonctionnels structurants et smoke des pages interactives. Le workflow de déploiement ajoute ensuite les contrôles propres à la production : intégration AdSense, contrôle de commit, empreinte de déploiement, déploiement et vérifications Cloudflare post-MEP. Les dates `lastmod` du sitemap sont lues dans `data/lastmod.json`, hors `public/`, puis vérifiées avant la génération ; elles sont ainsi versionnées avec le contenu et indépendantes de l'historique Git.

Le workflow `.github/workflows/tests.yml` exécute également le gate de sécurité en début de chaîne, puis les contrôles de qualité partagés. Il constitue donc le filet de validation des PR ; le workflow de déploiement rejoue ces mêmes contrôles avant d'ajouter ses contrôles spécifiques à la production.

Toute évolution d'architecture ou de sécurité doit d'abord être décidée et auditée manuellement. Les contrôles CI bloquent une configuration non conforme ; ils ne modifient jamais automatiquement les règles de sécurité ou l'architecture.

## Contrôle des pages : règles structurelles et éditoriales

`scripts/check-pages.mjs` classe ses règles en deux familles, séparées dans la sortie console et dans le tableau `GITHUB_STEP_SUMMARY`.

- **Structurelles (bloquantes)** : `html-base`, `markup-balance`, `title`, `canonical`, `breadcrumb`, `h1`, `tool-block`, `result`, `related-block`, `jsonld`, `related-meta`, `citation-marker`. Elles garantissent le socle HTML commun. `markup-balance` détecte aussi les attributs malformés (nom d'attribut contenant `"` ou `'`, par exemple `type="number step="any"`) et un `>` parasite juste après une balise.
- **Éditoriales sous cliquet** : `description` (120 à 160 caractères), `content-h2` (au moins 2 H2), `formula` (lien source externe dans `.formula` ou `.source-links`), `faq` (FAQ accordéon obligatoire sur toute page interactive) et `meta-unique` sont sous cliquet : elles ne peuvent que diminuer.

La règle `faq` s’applique à chaque page interactive (`/outil/`, `/conversion/`, `/comparateur/`). Une page nouvelle ou enrichie sans FAQ crée un nouvel écart et bloque la CI ; les pages historiques déjà en dette restent suivies par le cliquet et sont résorbées lors de leur enrichissement.

Le normaliseur `scripts/normalize-layout.mjs` ajoute de façon idempotente `aria-live="polite"` à chaque `.result` le favicon SVG commun et les balises de partage Open Graph / Twitter (`og:title`, `og:description`, `og:url`, `og:type`, `og:site_name`, `og:locale`, `twitter:card`, dérivées du titre, de la meta description et de la canonique de la page) dans le `<head>`, sans modifier le texte visible. Son mode `--check` est fail-closed. Les indicateurs « pages sous 120 mots » et « pages sans lien externe » restent informatifs et ne bloquent pas.

Pour les pages `/outil/`, le contrôle vérifie en plus, contre `data/tools.json` : la catégorie (lien du breadcrumb visible, et élément de position 2 du `BreadcrumbList`, nom et URL) ; l'égalité exacte, ordre compris, entre les slugs du bloc `.related-tools` du HTML et `relatedTools` ; et que `relatedTools` contient de 2 à 4 slugs (règle `related-meta`).

Avec `--strict`, seuls les écarts structurels font échouer la commande.

### Cliquet (ratchet) et baseline

`node scripts/check-pages.mjs --ratchet` est une étape **bloquante** de `tests.yml` et de `deploy.yml` (placée avant la validation statique). Elle remplace les deux anciens blocs Node inline de `deploy.yml` (contrat HTML-first, métadonnées et HTML), dont les contrôles sont désormais portés dans `check-pages` et couverts par `tests/check-pages.test.mjs` : marqueur `calculator-rendering=static`, H1 non vide, meta description présente, canonique, au moins un `input`, `select`, `textarea` ou `button`, un seul `WebApplication` et un seul `BreadcrumbList` (positions 1, 2, 3), aucun dossier `/outil/<slug>/` sans `index.html`, catégorie et relations égales à `data/tools.json`.

`scripts/check-pages.baseline.json` liste les écarts connus, structurels et éditoriaux, sous la forme `{ "path": ..., "rule": ... }` (une entrée par page et par règle). Le cliquet ne laisse la situation que s'améliorer :

- **échec** si un écart suivi (structurel ou éditorial) n'est pas dans la baseline (régression, ou nouvelle page non conforme) : une nouvelle page doit passer 100 % des règles suivies ;
- **échec** si la baseline contient une entrée qui n'échoue plus (entrée périmée) : elle doit être retirée ;
- `node scripts/check-pages.mjs --update-baseline` crée la baseline la première fois, puis ne sait que **retirer** des entrées. Il refuse, avec un message explicite, d'en ajouter.

`--seed-baseline` sert uniquement à amorcer les règles éditoriales quand aucune n'est encore présente dans la baseline ; il refuse dès qu'une règle éditoriale y figure. `--update-baseline` ne fait que retirer des entrées.

### Outils associés — Étape F (2026-10-03)

Pour chaque page `/outil/<slug>/`, `relatedTools` est un tableau ordonné de 2 à 4 slugs dans `data/tools.json`, et le même ensemble, dans le même ordre, est écrit directement dans le bloc HTML `.related-tools`. Le HTML commité est la source de vérité éditoriale. Aucun fallback JavaScript ne génère les outils associés. Les pages `/conversion/` et `/comparateur/` portent leurs 2 à 4 liens directement dans leur HTML et n'ont pas d'entrée `relatedTools` dans `data/tools.json`.


## Paramètres réglementaires et année dans les titres (2026-10-03)

**Source de vérité** : `data/parametres.json` (non servi). Chaque jeu (`sets.<id>`) porte `label`, `year`, `usedBy` (slugs d'outils), `source` (libellé et URL https), `effectiveFrom` / `effectiveTo`, `verifiedOn` (date de notre dernière vérification contre la source, pas celle de la source), des `notes` et des `values` strictement numériques. Un jeu = une période de validité : une revalorisation remplace le jeu, l'historique reste dans Git.

**Diffusion** : `scripts/generate-params.mjs` produit `public/parametres.js` (objet `window.Parametres`, valeurs figées : `get(id)`, `ids()`, `isEffective(id, date)`). Le fichier est commité et vérifié en `--check`, comme le sitemap. Les pages migrées chargent `/parametres.js` avant leur moteur ; un jeu inconnu lève une erreur explicite, il n'existe aucune valeur de repli.

**Contrôle** : `scripts/check-params.mjs` (étape CI de `tests.yml` et `deploy.yml`, option `--today=AAAA-MM-JJ` pour simuler une date) :
- *bloquant* : schéma invalide, jeu dont `effectiveTo` est dépassé (`expired`), année de titre/H1 différente de celle du jeu (`year-mismatch`), page migrée sans `/parametres.js`, `public/parametres.js` périmé, année dans le titre d'un outil sans paramètres (`year-not-regulatory`) ;
- *avertissement* : `verifiedOn` plus ancien que `staleAfterDays` (180), fin de validité à moins de `warnExpiryDays` (30), outils encore listés dans `anneeAMigrer`.
- `htmlMentions` (optionnel) : relie un montant écrit dans la prose HTML d'une page (indispensable au rendu HTML-first) à une valeur du jeu ; le contrôle échoue si la page n'affiche plus le montant formaté. Utilisé pour le SMIC.

**Politique d'année** : l'année n'apparaît dans le titre, le H1 et le breadcrumb que pour un outil dont le résultat dépend d'un barème daté, et doit alors égaler `year` de son jeu. Les outils de calcul pur (mensualité, inflation, amortissement, etc.) n'ont pas d'année. Les URL `/outil/<slug>/` ne changent jamais. `anneeAMigrer.slugs` liste les outils dont le barème est encore en dur ; chaque migration retire le slug de la liste (une entrée devenue inutile fait échouer le contrôle).

**Migrés** : `smic`, `frais-kilometriques`, `rsa`. **Mise à jour annuelle** : vérifier la source, modifier le jeu (valeurs, dates, `year`, `verifiedOn`), lancer `node scripts/generate-params.mjs`, puis mettre à jour les titres/H1 des outils concernés et la prose signalée par `htmlMentions`.
