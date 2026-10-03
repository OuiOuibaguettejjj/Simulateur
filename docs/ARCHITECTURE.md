# Architecture

Le site utilise un Cloudflare Worker devant des Static Assets. Les calculateurs sont principalement servis depuis `public/outil/<slug>/index.html` avec des composants communs dans `public/`.

Le simulateur RSA utilise un moteur dédié `public/rsa.js` séparé de son interface HTML. Cette séparation permet de modifier les paramètres réglementaires sans disperser la logique dans le rendu.


## Taxonomie des outils

La taxonomie officielle est centralisée dans `public/simulateurs.js` via `CATEGORIES`, `TOOL_TYPES` et `TOOLS_META`. Chaque outil possède un type unique et une catégorie principale. Les URL existantes `/outil/<slug>/` ne sont pas modifiées.

Les relations historiques entre outils restent temporairement dans la structure existante afin de ne pas réécrire les blocs de contenu déjà pré-rendus. Elles seront migrées dans une étape dédiée.
