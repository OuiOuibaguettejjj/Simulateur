# Architecture

Le site utilise un Cloudflare Worker devant des Static Assets. Les calculateurs sont principalement servis depuis `public/outil/<slug>/index.html` avec des composants communs dans `public/`.

Le simulateur RSA utilise un moteur dédié `public/rsa.js` séparé de son interface HTML. Cette séparation permet de modifier les paramètres réglementaires sans disperser la logique dans le rendu.
