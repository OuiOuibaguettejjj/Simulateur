# Décisions techniques

## Partage de dépenses : formats numériques utilisateur
Les champs de montant, nombre de personnes et pourcentage refusent la notation scientifique afin de rester cohérents avec les formats décimaux affichés. Le parsing des pourcentages reprend le traitement des espaces et espaces insécables des autres champs numériques. Les pourcentages personnalisés restent limités à deux décimales.

# Décisions techniques

## RSA : moteur séparé de l'interface
Le moteur RSA est placé dans `public/rsa.js` afin de séparer les règles métier du HTML et de faciliter les contrôles et futures mises à jour réglementaires.

## Ressources sur trois mois
L'interface demande trois montants mensuels afin de représenter la période de référence et d'éviter un calcul basé sur un seul mois.

## Pas de stockage serveur
Les données saisies sont traitées côté navigateur et ne sont pas envoyées à un endpoint applicatif dédié.

## MEP
Aucune mise en production n'est effectuée dans le cadre de cette implémentation initiale.

## Préparation AdSense
L'intégration publicitaire est préparée via un fichier `ads.txt`, les marqueurs éditeur dans le `<head>`, une CSP dédiée et des contrôles de pipeline. Aucun bloc publicitaire `adsbygoogle` n'est ajouté à ce stade. Les smoke tests bloquent les requêtes publicitaires afin d'éviter de générer des impressions pendant les validations automatisées.


## Taxonomie 2026-10-03

La structure logique des outils est définie avant les prochaines intégrations : type unique, catégorie principale unique et conservation des URL. La taxonomie est centralisée dans `public/simulateurs.js`. Cette première étape ne réécrit pas les blocs de contenu existants.


## Migration taxonomie 2026-10-03

Les relations entre outils sont maintenant stockées avec la taxonomie centrale. Le pré-rendu et le contrôle CI ne dépendent plus d'un second référentiel `groups`. Cette migration ne change aucune URL.


## Sécurité pré-production 2026-10-03

Le pipeline PR vérifie désormais les invariants de sécurité liés à l'architecture centralisée : cohérence de `TOOL_TYPES` / `TOOLS_META` avec les pages `/outil/<slug>/`, intégrité des relations `relatedTools`, absence de secrets committés, verrouillage CORS de l'API, périmètre `run_worker_first`, cohérence CSP Worker/Static Assets et durcissement des workflows GitHub. Cette validation s'exécute avant le pré-rendu afin qu'une évolution de la taxonomie ne puisse contourner les contrôles de sécurité.
