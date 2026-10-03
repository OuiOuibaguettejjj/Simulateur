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

La structure logique des outils est définie avant les prochaines intégrations : type unique, catégorie principale unique et conservation des URL. La taxonomie est centralisée dans `public/simulateurs.js`. Cette première étape ne réécrit pas les blocs de contenu existants.

## Migration taxonomie 2026-10-03

Les relations entre outils sont maintenant stockées avec la taxonomie centrale. Le pré-rendu et le contrôle CI ne dépendent plus d'un second référentiel `groups`. Cette migration ne change aucune URL.

## Sécurité et processus pré-production 2026-10-03

Le contrôle transversal `scripts/check-security.mjs` est le gate des invariants de sécurité, de frontière de production, de taxonomie et de CI/CD. Il est exécuté au début du workflow de déploiement, avant toute génération ou transformation du build.

Les contrôles CI bloquent une configuration non conforme ; ils ne modifient jamais automatiquement les règles de sécurité ou l'architecture. Toute évolution d'architecture ou de sécurité doit d'abord être décidée et auditée manuellement.

Le workflow de tests fonctionnels reste séparé du gate de sécurité. Le workflow de déploiement conserve les contrôles de build, de qualité, de smoke tests et les vérifications Cloudflare post-MEP.

## HTML-first 2026-10-03

Les 77 pages `/outil/<slug>/` sont désormais HTML-first et autonomes pour leur contenu éditorial initial. Le script historique de pré-rendu et son workflow de validation ont été supprimés. Les URLs existantes sont conservées.
