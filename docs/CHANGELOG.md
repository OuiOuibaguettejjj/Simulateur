## 2026-10-02 — FAQ pédagogique des convertisseurs
- Ajout d’une FAQ courte et pédagogique aux pages température et angles.
- Ajout de repères historiques et d’explications sur l’usage des différentes unités, sans modifier le moteur de conversion.
- Aucun changement de Worker, de configuration Cloudflare ou de dépendance externe.

## 2026-10-01 — Convertisseurs température et angles
- Refonte du convertisseur de température avec conversion bidirectionnelle Celsius, Fahrenheit et Kelvin, interface plus claire et contenu SEO enrichi.
- Ajout du convertisseur d’angles degrés, radians et grades.
- Ajout du maillage interne depuis la page Conversions et l’accueil.
- Aucun changement de Worker, de configuration Cloudflare ou de dépendance externe.

## 2026-10-01 — Capacité d’emprunt premium
- Refonte du calculateur de capacité d’emprunt immobilier : formulaire enrichi, assurance emprunteur, apport, comparaison 15/20/25 ans et résultats détaillés.
- SEO renforcé avec contenu HTML serveur, données structurées WebApplication/BreadcrumbList, FAQ, sources officielles et maillage interne.
- Compatibilité conservée avec le moteur legacy de pré-rendu afin de ne pas modifier le pipeline de déploiement ni le runtime commun des autres simulateurs.
- Aucun changement de route, de Worker, de configuration Cloudflare ou de dépendance externe.

# Changelog

## 2026-09-28 — Simulateur RSA
- Refonte du parcours RSA 2026.
- Ajout d'un moteur de calcul dédié.
- Ajout de la documentation des règles, sources et tests.
- Intégration du RSA dans l'accueil et les outils associés.

Cette version est préparée sur la branche `feature/rsa-refonte` et n'est pas mise en production.

## 2026-09-28 — RSA
- Renforcement du moteur RSA et du traitement de la déduction logement.
- Distinction entre aide au logement inférieure au forfait et situation où le forfait légal s'applique.
- Documentation explicite du périmètre simplifié de l'estimation et des limites réglementaires non simulées.
