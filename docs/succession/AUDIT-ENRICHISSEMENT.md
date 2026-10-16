# Audit préalable — enrichissement du calculateur de succession

- Date de l’audit : 16 octobre 2026
- Page concernée : `public/outil/succession/index.html`
- URL canonique conservée : `https://simulateur.site/outil/succession/`
- Classe réglementaire : C — le slug `succession` figure dans `data/parametres.json` > `anneeAMigrer.slugs`.
- Décision : enrichissement ciblé. Ne pas réécrire le calculateur et ne pas modifier le résultat métier sans preuve d’une anomalie.

## 1. État existant vérifié dans le dépôt

La page est déjà HTML-first et dispose d’une interface métier spécifique. Elle contient notamment :

- saisie de la part nette reçue par le bénéficiaire ;
- sélection du lien avec le défunt ;
- abattement spécifique handicap (159 325 €) ;
- cas d’exonération du conjoint survivant / partenaire de PACS ;
- option d’exonération entre frères et sœurs sous conditions déclarées ;
- représentation des petits-enfants/arrière-petits-enfants avec partage de l’abattement de la souche ;
- prise en compte manuelle de l’abattement déjà consommé, de la base taxable antérieure et des droits déjà acquittés pour les donations de moins de 15 ans ;
- décomposition du barème par tranches et affichage de l’estimation nette après droits ;
- sources officielles, explication de la méthode, limites et liens vers les outils associés.

La PR historique [#3](https://github.com/OuiOuibaguettejjj/Simulateur/pull/3) a déjà traité la représentation des descendants : partage de l’abattement de 100 000 € entre représentants d’une même souche et application du tarif progressif en ligne directe. La PR [#71](https://github.com/OuiOuibaguettejjj/Simulateur/pull/71) a ensuite intégré la page dans le contrat HTML-first. Ces mécanismes ne doivent pas être remplacés par une implémentation générique.

## 2. Garde-fous fonctionnels

Avant toute modification du calcul :

1. relever et conserver les sorties de référence actuelles ;
2. ajouter des tests indépendants pour les cas représentatifs, avec résultats attendus calculés à partir des sources officielles et non à partir du code testé ;
3. comparer les résultats avant/après sur les cas par défaut, zéro, champ vide, montant négatif, très grand montant, virgule décimale et représentation ;
4. ne corriger la logique que si un écart précis est démontré, avec un test de non-régression.

La page n’est pas encore migrée vers `data/parametres.json`. Avant toute modification de barème, qualifier la migration réglementaire et, si elle est nécessaire, la faire dans la même PR complète : paramètres sourcés, dates de validité, date de vérification, génération de `public/parametres.js`, cas de référence sourcé et échéance documentée. Aucun barème ne doit être actualisé simplement au passage.

## 3. Écarts de baseline et état après enrichissement

L’audit initial a identifié deux entrées pour cette page dans `scripts/check-pages.baseline.json` : `faq` et `tool-block`. La branche ajoute maintenant une section `.calculator-faq` avec sept questions et place le H1 ainsi que l’introduction dans une section `.tool` englobante, sans supprimer la structure métier existante.

La baseline de la branche a été réduite à `[]` après correction des deux écarts suivis pour cette page. Sur le commit précédent, la CI avait exécuté le script officiel et confirmé que `tool-block` était déjà corrigé, mais que la FAQ ne respectait pas encore sa structure attendue. La FAQ a depuis été remise au niveau du contrat (`h2` exact « FAQ » et `<details>` enfants directs du bloc `.calculator-faq`). Le contrôle `baseline-regeneree` du nouveau commit doit confirmer que la baseline correspond exactement au résultat de `node scripts/check-pages.mjs --update-baseline` ; ne pas déclarer la conformité avant ce résultat.

## 4. Enrichissement éditorial et UX réalisé dans la branche

- Le H1 et l’introduction sont maintenant contenus dans une section `.tool` tout en conservant le design spécifique de la succession.
- Une FAQ native de sept questions a été ajoutée avant le bloc des outils associés.
- Le calculateur et ses formules JavaScript n’ont pas été modifiés.

Les améliorations supplémentaires listées ci-dessous restent les points de contrôle de l’audit, notamment l’accessibilité, le rendu mobile, la validation des sources et l’exécution de la suite de tests.

### Priorité 1 — contrat de page et résultat

- intégrer le H1 et son introduction dans la section `.tool` conformément à `docs/FORME.md`, en préservant l’identité visuelle spécifique de la page ;
- ajouter une FAQ native en `<details>/<summary>`, avec réponses prudentes et utiles : part nette ou patrimoine brut, abattement selon la parenté, conjoint/PACS, handicap, représentation, donations antérieures et limites du résultat ;
- conserver le résultat initial accessible et le rendu du résultat dans `aria-live="polite"` ;
- vérifier l’affichage mobile du formulaire, du tableau de tranches et des montants sans débordement horizontal.

### Priorité 2 — clarté métier

- préciser près du champ principal que la simulation porte sur la part nette individuelle, et non sur le patrimoine total du défunt ;
- mieux distinguer l’abattement théorique, la fraction encore disponible, la base taxable actuelle et les montants antérieurs déclarés ;
- expliciter que les donations antérieures ne sont pas reconstituées automatiquement et que les champs reposent sur les documents fiscaux précédents ;
- garder visibles les limites : assurance-vie, frais d’acte, démembrement, transmission d’entreprise, partage civil entre héritiers et régimes particuliers ne sont pas intégralement simulés ;
- ne pas présenter comme vérifiées automatiquement les conditions que l’utilisateur doit confirmer lui-même.

### Priorité 3 — SEO et maillage

- conserver l’URL, le canonical, le fil d’Ariane et les données structurées cohérents ;
- aligner exactement la description du JSON-LD WebApplication sur la meta description ;
- garder un title et un H1 naturels, centrés sur le calcul des droits de succession ;
- ajouter les sections éditoriales nécessaires sans remplissage artificiel, avec deux H2 éditoriaux au minimum hors FAQ ;
- maintenir les liens vers donation, impôt sur le revenu, assurance-vie et la rubrique fiscalité lorsqu’ils sont pertinents ;
- vérifier que chaque affirmation fiscale sensible est liée à une source officielle.

## 5. Sources à utiliser pour toute validation réglementaire

- [Impots.gouv.fr — calcul des droits de succession](https://www.impots.gouv.fr/particulier/questions/comment-dois-je-calculer-les-droits-de-succession)
- [Service-Public — évaluation de la succession et calcul des droits](https://www.service-public.fr/particuliers/vosdroits/F14198)
- [Légifrance — Code général des impôts, articles 777 et suivants](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053779457)
- [BOFiP — rappel fiscal des donations antérieures](https://bofip.impots.gouv.fr/bofip/1767-PGP.html/identifiant=BOI-ENR-DMTG-10-50-50-20230711)

Les sources et barèmes devront être ouverts et revérifiés au moment de la modification ; cette liste ne vaut pas validation réglementaire datée.

## 6. Critères d’acceptation de la PR d’enrichissement

- [ ] Le calcul existant est conservé, ou chaque changement métier est justifié par un cas reproductible et une source officielle.
- [ ] Les cas de référence couvrent les liens de parenté, les exonérations et la représentation.
- [ ] FAQ conforme au contrat du dépôt.
- [ ] H1 et introduction dans la section `.tool`.
- [ ] Aucun nouvel écart dans la baseline ; écarts corrigés retirés uniquement via le script prévu.
- [ ] Contrôles de sécurité, structure, sitemap, layout, paramètres, tests de calcul et cliquet exécutés.
- [ ] Audit mobile et desktop effectué.
- [ ] CI GitHub Actions verte avant fusion.
- [ ] Aucune fusion ni mise en production sans demande explicite.

## 7. Portée et statut

Ce document suit l’enrichissement de la page dans la branche. Il ne constitue pas un certificat de conformité du calculateur. Les formules métier n’ont pas été changées. Les tests sont exécutés via GitHub Actions. La baseline doit encore être validée par le contrôle CI qui rejoue le script officiel ; l’audit visuel mobile et desktop n’a pas été réalisé. Aucune réussite finale de test n’est revendiquée tant que la dernière CI n’est pas terminée.
