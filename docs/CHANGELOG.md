## 2026-10-03 — Cliquet check-pages et contrôles portés
- `check-pages --ratchet` devient bloquant dans `tests.yml` et `deploy.yml` ; `scripts/check-pages.baseline.json` liste les écarts structurels connus (retraits seulement via `--update-baseline`).
- Contrôles des deux blocs inline de `deploy.yml` portés dans `check-pages` (description présente, contrôles de calcul, positions du `BreadcrumbList`, dossier sans `index.html`, au moins une page `/outil/`) et couverts par les tests ; les deux blocs sont supprimés.
- Aucune page publique modifiée.

## 2026-10-03 — check-pages : règles structurelles et éditoriales
- Règles classées en structurelles (bloquantes) et éditoriales (suivies, non bloquantes) ; rapport séparé en deux familles.
- `markup-balance` : détection des attributs malformés et du `>` parasite après une balise.
- Nouvelles vérifications `/outil/` : catégorie (breadcrumb visible et `BreadcrumbList` position 2), égalité exacte des slugs du bloc `.related-tools` avec `data/tools.json`, `relatedTools` de 2 à 4 slugs.
- `tests/check-pages.test.mjs` : un test positif et un test négatif par règle structurelle.

## 2026-10-03 — relatedTools en liste de slugs
- `data/tools.json` : `relatedTools` passe de `[{slug,title,description}]` à `["slug"]`, ordre conservé (91 relations, 77 outils).
- Contrôles adaptés (check-security : slugs existants, sans auto-référence ni doublon ; check-pages ; deploy.yml).
- Aucune page HTML modifiée.

## 2026-10-03 — Nettoyage du legacy et taxonomie hors public
- Déplacement de la taxonomie des outils vers `data/tools.json`, hors de `public/`.
- Suppression du rendu éditorial historique `Simulateurs.render()` et des métadonnées de taxonomie dans `public/simulateurs.js`.
- Suppression des appels de rendu legacy et des identifiants `ey`, `title`, `intro` et `source` des pages outils concernées.
- Aucun changement d'URL ni de logique de calcul.

## 2026-10-03 — Migration HTML-first complète des outils
- Migration des 71 pages `/outil/` restantes vers le contrat HTML-first, pour un total de 77/77 pages.
- Le HTML initial porte désormais le contenu SEO et l'interface essentielle ; le JavaScript conserve la logique de calcul.
- Harmonisation des breadcrumbs, données structurées WebApplication/BreadcrumbList et liens d'outils associés à partir de la taxonomie centrale.
- Suppression de l'ancien pré-rendu `scripts/prerender-tools.mjs` et du workflow de validation dédié, devenus inutiles.
- Le pipeline de production vérifie désormais directement que les 77 pages respectent le contrat HTML-first.

## 2026-10-02 — Mécanisme Entrée commun aux calculateurs
- Généralisation du raccourci Entrée via le socle partagé enter-calcul.js : détection automatique du bouton principal du calculateur courant, sans dépendre d'une classe de conteneur spécifique.
- Injection automatique de enter-calcul.js par le normaliseur de layout sur toutes les pages /outil/ et /conversion/, y compris les futurs calculateurs ajoutés au dépôt.
- Aucun changement du moteur de calcul, des routes, du Worker, de Cloudflare ou des dépendances externes.

## 2026-10-02 — Uniformisation du calcul au clavier
- Rattachement du calculateur Partage de dépenses au mécanisme commun `enter-calcul.js` afin que la touche Entrée déclenche le calcul comme sur les calculateurs utilisant le socle commun.
- Aucun changement du moteur de calcul, du Worker, de Cloudflare ou des dépendances externes.

## 2026-10-02 — Robustesse des saisies du partage de dépenses
- Correction du parsing des pourcentages personnalisés afin de traiter correctement les espaces et espaces insécables comme les autres champs numériques.
- Refus de la notation scientifique dans les champs numériques utilisateur afin de respecter les formats de saisie affichés et la règle de précision des pourcentages.
- Aucun changement de Worker, de configuration Cloudflare ou de dépendance externe.

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
- À cette date, la page restait compatible avec le pipeline de pré-rendu alors utilisé. Cette compatibilité a ensuite été supprimée lors de la migration HTML-first complète du 3 octobre 2026.
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
