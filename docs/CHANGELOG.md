## 2026-10-01 — Capacité d’emprunt HTML-first
- Correction de la compatibilité du calculateur avec le nouveau contrat HTML-first.
- Le calculateur n’appelle plus le moteur de rendu legacy `Simulateurs.render()` ni `Simulateurs.calc()`.
- Le calcul reste local à la page afin de préserver le HTML serveur et d’éviter une dépendance au renderer historique.
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
