# Processus d’audit SEO des pages interactives

> Procédure autonome pour auditer une page de Simulateur sans lancer un enrichissement complet.
> Périmètre : pages interactives /outil/, /conversion/ et /comparateur/.

## Objectif et déclenchement

L’audit peut être lancé à tout moment à partir d’une URL ou d’un slug, que la page ait déjà été enrichie ou non. Il décrit l’existant, détecte les problèmes SEO et propose des améliorations adaptées à l’intention de recherche et à la famille de page.

**Un audit ne modifie aucun fichier.** Il présente les constats et propositions ; les corrections ne commencent qu’après accord explicite. La procédure d’enrichissement globale reste définie dans docs/PROCESS-ENRICHISSEMENT-CALCULATEURS.md.

## 1. Vérifier la source actuelle

Lire directement la version actuelle de la page dans le dépôt. Ne pas se fier à une ancienne conversation ou à une version possiblement obsolète.

Relever les valeurs exactes, sans les paraphraser :
- URL et famille de page : outil, conversion ou comparateur ;
- title ;
- H1 ;
- meta description ;
- WebApplication.description du JSON-LD ;
- métadonnées Open Graph et Twitter pertinentes ;
- canonical et directives d’indexation ;
- règles de CI pertinentes qui contrôlent ces éléments.

Si un élément ne peut pas être vérifié dans le code ou le rendu accessible, l’indiquer comme **non vérifié**. Ne pas le déduire.

## 2. Auditer les termes au cas par cas

Examiner séparément le title, le H1 et la meta description. Selon l’intention de la page, considérer notamment :
- « calculateur », « calcul », « calculer » ;
- « simulateur », « simulation », « simuler » ;
- « convertisseur », « conversion », « convertir » ;
- « comparateur », « comparer » ;
- les mots-clés métier et les formulations pertinentes pour les internautes.

Ne pas imposer artificiellement tous les termes dans chaque balise. Une conversion d’unités, un simulateur de situation et un comparateur peuvent répondre à des intentions différentes. Préserver les mots-clés métier utiles ; éviter le bourrage, les formulations génériques et les répétitions qui nuisent à la lisibilité.

### Repères de longueur — lignes directrices, jamais des seuils bloquants

- **Title : viser environ 60 caractères**, lorsque cela permet de conserver une formulation claire et précise.
- **Meta description : viser environ 160 caractères**, lorsque cela permet de décrire utilement la page et son bénéfice.
- Ces repères sont des objectifs éditoriaux indicatifs, pas des limites imposées par Google : l’affichage peut être tronqué selon l’appareil et la largeur disponible, et Google peut générer un titre ou un extrait différent.
- Ne pas dégrader la pertinence, la précision, la lisibilité ou le mot-clé métier pour respecter le nombre de caractères. Un dépassement justifié n’est pas un défaut en soi.
- **Ne jamais faire échouer la CI ni demander une modification uniquement parce que le title dépasse 60 caractères ou la meta description dépasse 160 caractères.** Les contrôles automatiques se limitent aux exigences techniques réellement définies dans le dépôt ; les repères de longueur servent à guider la rédaction.

Pour chaque balise, préciser quels termes sont utiles, déjà présents, absents mais potentiellement pertinents, ou artificiels dans ce contexte. Toute recommandation doit être liée à l’intention de recherche et au sujet précis de la page.

## 3. Vérifier la cohérence technique

Contrôler, selon ce qui s’applique :
- présence et unicité du title et de la meta description ;
- exigences techniques de longueur réellement imposées par les contrôles actuels du projet ;
- à titre éditorial uniquement, proximité des repères indicatifs de 60 caractères pour le title et de 160 pour la meta description, sans traiter un dépassement comme une non-conformité ;
- cohérence entre la meta description et WebApplication.description lorsque la règle du projet l’exige ;
- canonical, directives d’indexation et métadonnées sociales ;
- cohérence entre title, H1, description et contenu réel ;
- règles CI bloquantes et état de conformité de la page.

Distinguer clairement une règle technique existante d’une recommandation éditoriale. Une recommandation ne devient pas une règle bloquante de CI sans décision explicite.

## 4. Présenter chaque constat et chaque proposition

Pour le title, le H1, la meta description et les autres éléments pertinents, fournir :
1. **Valeur actuelle exacte** ;
2. **Constat vérifiable** : défaut technique, incohérence, terme présent ou absent, sujet et intention couverts ;
3. **Proposition** : nouvelle formulation si une amélioration est justifiée, sinon indiquer qu’aucun changement n’est recommandé ;
4. **Justification** : lien avec l’intention, le vocabulaire métier, la clarté ou une règle technique ;
5. **Niveau de certitude** : défaut avéré et vérifié, recommandation éditoriale argumentée, ou hypothèse à tester.

Proposer une version révisée uniquement si elle apporte une amélioration justifiable. Ne pas présenter une préférence de rédaction comme un facteur de classement Google démontré.

## 5. Utiliser Search Console avec prudence

Lorsque des données Search Console sont disponibles, analyser les requêtes, impressions, clics, CTR, position et périodes pertinentes. Préciser les dates comparées et les limites de l’analyse.

Une évolution des impressions après un changement de métadonnées est un signal à étudier, mais ne prouve pas à elle seule une relation de cause à effet. Ne pas attribuer une baisse ou une hausse à un changement unique sans éléments suffisants.

Si les données ne sont pas disponibles, l’indiquer explicitement et séparer les hypothèses des faits mesurés.

## 6. Conclure sans modifier

Terminer par une synthèse : éléments conformes à conserver ; corrections recommandées avec justification ; arbitrages nécessaires ; éléments non vérifiés ; données Search Console utiles.

Attendre l’accord explicite avant toute modification du dépôt. Après correction autorisée, vérifier les valeurs directement dans le code, contrôler leur cohérence technique et exécuter les tests pertinents.

## Modèle de fiche d’audit

### Audit SEO : <slug>
- Date de l’audit :
- URL :
- Famille : outil / conversion / comparateur
- Source et version vérifiées :

### État actuel exact
- Title :
- H1 :
- Meta description :
- WebApplication.description :
- Canonical / indexation :
- Open Graph / Twitter :
- Règles CI pertinentes :

### Analyse individualisée
- Intention principale et vocabulaire métier :
- Title : constat, proposition éventuelle, justification, certitude
- H1 : constat, proposition éventuelle, justification, certitude
- Meta description : constat, proposition éventuelle, justification, certitude
- Cohérence technique :
- Éléments à conserver :
- Défauts avérés :
- Recommandations éditoriales :
- Hypothèses à tester :

### Search Console
- Période :
- Requêtes / impressions / clics / CTR / position :
- Limites de comparaison :

### Décision
- Changements proposés :
- Points non vérifiés :
- Accord avant modification : en attente / accordé / refusé

## Consigne réutilisable

Effectue l’audit SEO complet de cette page de Simulateur en suivant docs/PROCESS-AUDIT-SEO-PAGES-INTERACTIVES.md. Vérifie directement l’état actuel dans le dépôt, restitue les valeurs exactes, formule des recommandations justifiées au cas par cas et ne modifie aucun fichier sans mon accord explicite.