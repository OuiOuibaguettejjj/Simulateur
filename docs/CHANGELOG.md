## 2026-10-02 — Nettoyage du partage de dépenses
- Suppression de la fonction `toCents()` inutilisée, sans changement du comportement du calculateur.
- Aucun changement de Worker, de configuration Cloudflare ou de dépendance externe.

## 2026-10-02 — Durcissement du partage de dépenses
- Validation stricte des parts personnalisées à 100,00 % afin d’éviter toute incohérence d’arrondi dans les montants dus.
- Refus des nombres de participants non entiers au lieu de les arrondir silencieusement.
- Aucun changement de Worker, de configuration Cloudflare ou de dépendance externe.

## 2026-10-02 — Correctif CI du partage de dépenses
- Conservation du bouton de recalcul manuel en complément du calcul instantané afin de respecter le contrat de validation statique des calculateurs.

## 2026-10-02 — Correctifs du partage de dépenses
- Validation explicite des montants et pourcentages, avec refus des valeurs invalides au lieu de les convertir silencieusement en 0.
- Refus d’un montant total nul et amélioration des messages d’erreur accessibles.
- Simplification de l’UX avec calcul en temps réel, sans bouton redondant.
- Amélioration de la sémantique et de l’affichage mobile du tableau et des participants.
- Clarification des textes sur les remboursements lorsque la dépense est totalement couverte.

## 2026-10-02 — Partage de dépenses premium
- Refonte du calculateur de partage de dépenses avec une interface HTML statique plus complète.
- Ajout des parts égales ou personnalisées, jusqu’à 12 participants, des noms et des montants déjà payés.
- Ajout du calcul des soldes et des remboursements entre participants.
- Renforcement du SEO avec WebApplication, BreadcrumbList, contenu éditorial et FAQ.
- Runtime local dédié, sans modification du Worker, de Cloudflare ou des dépendances externes.

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
