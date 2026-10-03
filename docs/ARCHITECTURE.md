# Architecture

Le site utilise un Cloudflare Worker devant des Static Assets. Les outils sont principalement servis depuis `public/outil/<slug>/index.html`, avec des composants communs dans `public/`.

Le simulateur RSA utilise un moteur dédié `public/rsa.js` séparé de son interface HTML. Cette séparation permet de modifier les paramètres réglementaires sans disperser la logique dans le rendu.

## Taxonomie des outils

La taxonomie officielle est centralisée dans `public/simulateurs.js` via `CATEGORIES`, `TOOL_TYPES` et `TOOLS_META`. Chaque outil possède un type unique et une catégorie principale. Les URL existantes `/outil/<slug>/` ne sont pas modifiées.

La source de vérité contient également les relations `relatedTools` de chaque outil. Cette structure est la référence opérationnelle du maillage associé ; l'ancien objet `groups` n'est plus utilisé.

Les contrôles pré-production vérifient notamment :
- la présence de chaque outil dans `TOOL_TYPES` et `TOOLS_META` ;
- l'égalité exacte entre le type déclaré dans `TOOL_TYPES` et celui de `TOOLS_META` ;
- la validité des catégories et des relations `relatedTools` ;
- la correspondance entre la taxonomie centrale et les pages `/outil/<slug>/` ;
- la cohérence entre les métadonnées centrales et le HTML publié : catégorie, breadcrumb JSON-LD, URL canonique et liens du bloc « Outils associés ».

Les URLs existantes restent inchangées afin d'éviter une migration SEO inutile.

## Contrat des pages outil

Les pages `/outil/<slug>/` suivent un contrat HTML-first commun. Le HTML initial est la source de vérité pour le contenu essentiel : titre, H1, introduction, interface visible, résultat initial, méthode/limites, sources, breadcrumb et liens internes. Le JavaScript de l'outil conserve la logique de calcul et les interactions ; il ne doit pas être requis pour générer le contenu SEO principal.

Chaque page possède une catégorie principale issue de `TOOLS_META[slug].category`. Le breadcrumb visible et le `BreadcrumbList` JSON-LD utilisent cette même catégorie et terminent sur l'URL canonique de l'outil. Les relations `relatedTools` alimentent le bloc standard « Outils associés » lorsqu'elles sont définies ; des liens contextuels éditoriaux restent possibles lorsque leur valeur est réelle.

Les contrôles CI vérifient désormais ces invariants entre la taxonomie centrale et le HTML statique. Ils empêchent notamment qu'une page conserve un ancien breadcrumb, une mauvaise canonique ou un ancien maillage après une modification de `TOOLS_META`.

Les simulateurs riches peuvent conserver des extensions spécifiques (graphiques, tableaux, scénarios, FAQ, contenu réglementaire), à condition de respecter le socle commun. Il n'est pas recherché une uniformité visuelle absolue.

La migration HTML-first est terminée : les 77 pages `/outil/<slug>/` sont statiques et autonomes pour leur contenu éditorial initial. Le script historique `scripts/prerender-tools.mjs` et son workflow de validation ont été supprimés. Il n'existe plus de migration progressive ni de réécriture pré-déploiement de ces pages.

Les URLs et la logique métier existantes sont conservées.
