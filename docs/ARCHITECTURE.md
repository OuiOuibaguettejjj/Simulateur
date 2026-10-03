# Architecture

Le site utilise un Cloudflare Worker devant des Static Assets. Les outils sont principalement servis depuis `public/outil/<slug>/index.html`, avec des composants communs dans `public/`.

Le simulateur RSA utilise un moteur dédié `public/rsa.js` séparé de son interface HTML. Cette séparation permet de modifier les paramètres réglementaires sans disperser la logique dans le rendu.

## Taxonomie des outils

La taxonomie officielle est centralisée dans `data/tools.json` via `categories` et `tools`. Chaque outil possède un type unique et une catégorie principale. Les URL existantes `/outil/<slug>/` ne sont pas modifiées.

La source de vérité contient également les relations `relatedTools` de chaque outil. Cette structure est la référence opérationnelle du maillage associé ; l'ancien objet `groups` n'est plus utilisé.

Les contrôles pré-production vérifient notamment :
- la présence de chaque outil dans `data/tools.json` et `data/tools.json` ;
- l'égalité exacte entre le type déclaré dans `data/tools.json` et celui de `data/tools.json` ;
- la validité des catégories et des relations `relatedTools` ;
- la correspondance entre la taxonomie centrale et les pages `/outil/<slug>/` ;
- la cohérence entre les métadonnées centrales et le HTML publié : catégorie, breadcrumb JSON-LD, URL canonique et liens du bloc « Outils associés ».

Les URLs existantes restent inchangées afin d'éviter une migration SEO inutile.

## Contrat des pages outil

Les pages `/outil/<slug>/` suivent un contrat HTML-first commun. Le HTML initial est la source de vérité pour le contenu essentiel : titre, H1, introduction, interface visible, résultat initial, méthode/limites, sources, breadcrumb et liens internes. Le JavaScript de l'outil conserve la logique de calcul et les interactions ; il ne doit pas être requis pour générer le contenu SEO principal.

Chaque page possède une catégorie principale issue de `data/tools.json` (`tools[slug].category`). Le breadcrumb visible et le `BreadcrumbList` JSON-LD utilisent cette même catégorie et terminent sur l'URL canonique de l'outil. Les relations `relatedTools` alimentent le bloc standard « Outils associés » lorsqu'elles sont définies ; des liens contextuels éditoriaux restent possibles lorsque leur valeur est réelle.

Les contrôles CI vérifient désormais ces invariants entre la taxonomie centrale et le HTML statique. Ils empêchent notamment qu'une page conserve un ancien breadcrumb, une mauvaise canonique ou un ancien maillage après une modification de `data/tools.json`.

Les simulateurs riches peuvent conserver des extensions spécifiques (graphiques, tableaux, scénarios, FAQ, contenu réglementaire), à condition de respecter le socle commun. Il n'est pas recherché une uniformité visuelle absolue.

La migration HTML-first est terminée : les 77 pages `/outil/<slug>/` sont statiques et autonomes pour leur contenu éditorial initial. Le script historique `scripts/prerender-tools.mjs` et son workflow de validation ont été supprimés. Il n'existe plus de migration progressive ni de réécriture pré-déploiement de ces pages.

Les URLs et la logique métier existantes sont conservées.
## Processus pré-production et MEP

Le contrôle transversal `scripts/check-security.mjs` est le gate unique pour les invariants de sécurité, de frontière de production, de taxonomie et de CI/CD. Il est exécuté au début du workflow de déploiement, avant toute génération ou transformation du build.

Le workflow `.github/workflows/deploy.yml` conserve les contrôles qui relèvent du build et de la qualité du produit : génération et intégrité du sitemap, contrat HTML-first, cohérence métadonnées/HTML, normalisation idempotente, intégration AdSense, validation statique, tests fonctionnels, smoke tests locaux et production, contrôle de commit, empreinte de déploiement et vérifications Cloudflare post-MEP. Ces contrôles ne sont pas dupliqués dans le gate de sécurité.

Le workflow `.github/workflows/tests.yml` reste dédié aux tests fonctionnels ciblés des calculateurs. Il ne porte pas le gate de sécurité.

Toute évolution d'architecture ou de sécurité doit d'abord être décidée et auditée manuellement. Les contrôles CI bloquent une configuration non conforme ; ils ne modifient jamais automatiquement les règles de sécurité ou l'architecture.
