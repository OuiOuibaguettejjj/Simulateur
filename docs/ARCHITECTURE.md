# Architecture

Le site utilise un Cloudflare Worker devant des Static Assets. Les calculateurs sont principalement servis depuis `public/outil/<slug>/index.html` avec des composants communs dans `public/`.

Le simulateur RSA utilise un moteur dédié `public/rsa.js` séparé de son interface HTML. Cette séparation permet de modifier les paramètres réglementaires sans disperser la logique dans le rendu.


## Taxonomie des outils

La taxonomie officielle est centralisée dans `public/simulateurs.js` via `CATEGORIES`, `TOOL_TYPES` et `TOOLS_META`. Chaque outil possède un type unique et une catégorie principale. Les URL existantes `/outil/<slug>/` ne sont pas modifiées.

La source de vérité contient également les relations `relatedTools` de chaque outil. Cette structure est désormais la référence opérationnelle : il n'est pas prévu de migration séparée des relations historiques. Le pré-rendu et les contrôles CI consomment cette même taxonomie ; l'ancien objet `groups` n'est plus utilisé.

Les contrôles pré-production vérifient notamment :
- la présence de chaque outil dans `TOOL_TYPES` et `TOOLS_META` ;
- l'égalité exacte entre le type déclaré dans `TOOL_TYPES` et celui de `TOOLS_META` ;
- la validité des catégories et des relations `relatedTools` ;
- la correspondance entre la taxonomie centrale et les pages `/outil/<slug>/`.

Les URLs existantes restent inchangées afin d'éviter une migration SEO inutile.


## Contrat des pages outil

Les pages `/outil/<slug>/` évoluent vers un contrat HTML-first commun. Le HTML initial est la source de vérité pour le contenu essentiel : titre, H1, introduction, interface visible, résultat initial, méthode/limites, sources, breadcrumb et liens internes. Le JavaScript de l'outil conserve la logique de calcul et les interactions ; il ne doit pas être requis pour générer le contenu SEO principal.

Chaque page possède une catégorie principale issue de `TOOLS_META[slug].category`. Le breadcrumb visible et le `BreadcrumbList` JSON-LD doivent utiliser cette même catégorie et terminer sur l'URL canonique de l'outil. Les relations `relatedTools` alimentent le bloc standard « Outils associés » ; des liens contextuels éditoriaux restent possibles lorsque leur valeur est réelle.

Les simulateurs riches peuvent conserver des extensions spécifiques (graphiques, tableaux, scénarios, FAQ, contenu réglementaire), à condition de respecter le socle commun. Il n'est pas recherché une uniformité visuelle absolue.

La migration est progressive. Les URLs `/outil/<slug>/` et la logique métier existante sont conservées. Les pages migrées utilisent temporairement le marqueur `calculator-rendering=static` afin que le pré-rendu historique ne les réécrive pas. Le rôle de `scripts/prerender-tools.mjs` sera réduit progressivement à mesure que les pages legacy disparaîtront.

Le contrat a d'abord été validé sur six profils représentatifs : TVA, âge, prix unitaire, RSA, succession et intérêts composés, puis étendu aux 71 pages restantes. Les URLs et la logique métier existantes sont conservées.
