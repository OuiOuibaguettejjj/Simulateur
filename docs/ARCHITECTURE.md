# Architecture

Le site utilise un Cloudflare Worker devant des Static Assets. Les calculateurs sont principalement servis depuis `public/outil/<slug>/index.html` avec des composants communs dans `public/`.

Le simulateur RSA utilise un moteur dédié `public/rsa.js` séparé de son interface HTML. Cette séparation permet de modifier les paramètres réglementaires sans disperser la logique dans le rendu.


## Taxonomie des outils

La taxonomie officielle est centralisée dans `public/simulateurs.js` via `CATEGORIES`, `TOOL_TYPES` et `TOOLS_META`. Chaque outil possède un type unique et une catégorie principale. Les URL existantes `/outil/<slug>/` ne sont pas modifiées.

La source de vérité contient également les relations `relatedTools` de chaque outil. Le pré-rendu et les contrôles CI consomment cette même taxonomie ; l'ancien objet `groups` n'est plus utilisé.

Les contrôles pré-production vérifient notamment :
- la présence de chaque outil dans `TOOL_TYPES` et `TOOLS_META` ;
- l'égalité exacte entre le type déclaré dans `TOOL_TYPES` et celui de `TOOLS_META` ;
- la validité des catégories et des relations `relatedTools` ;
- la correspondance entre la taxonomie centrale et les pages `/outil/<slug>/`.

Les URLs existantes restent inchangées afin d'éviter une migration SEO inutile.
