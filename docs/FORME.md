# Règles de forme du site

Ce document définit le **gabarit canonique des pages interactives**. Les pages sont HTML-first : le contenu essentiel, l'interface initiale et les données structurées sont présents dans le HTML commité. JavaScript apporte la logique de calcul et les interactions, mais ne génère pas le socle éditorial de la page.

## 1. Gabarit unique

**Terminologie technique.** Le code de contrôle utilise la notion de **page interactive** pour les règles réellement transversales aux trois familles. Les termes `outil`, `conversion` et `comparateur` restent utilisés lorsqu’une règle dépend réellement de la famille concernée (taxonomie, logique de conversion, logique de comparaison ou règles éditoriales encore spécifiques). Les URL `/outil/`, `/conversion/` et `/comparateur/` ne sont pas modifiées.

Les pages `/outil/`, `/conversion/` et `/comparateur/` sont trois **familles de pages interactives**. Elles partagent le même socle HTML-first et le même contrat de forme ; seule la logique métier et la sémantique propre à la famille peuvent varier. Le préfixe d'URL est conservé pour respecter les URL existantes ; il ne constitue pas un gabarit de rendu différent.

Le gabarit de référence est `docs/template-outil.html`. Pour créer une nouvelle page interactive, utiliser ce fichier comme point de copie, puis adapter uniquement les données et l'interface propres à sa famille.

### Squelette HTML canonique

Le squelette ci-dessous décrit les blocs attendus. Les commentaires indiquent les zones à adapter ; ils ne constituent pas un moteur de template exécuté au build.

```html
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="calculator-rendering" content="static">
  <!-- Une meta AdSense est ajoutée selon le flux existant et contrôlée par prepare-adsense.mjs. -->

  <!-- Principal mot-clé / intention de recherche + marque. -->
  <title>Mot-clé principal | Simulateur</title>

  <!-- 120 à 160 caractères, description utile et spécifique à la page. -->
  <meta name="description" content="Description spécifique, claire et utile de l'outil et de son usage principal.">

  <!-- URL existante de la page : ne jamais la modifier pour uniformiser le gabarit. -->
  <link rel="canonical" href="https://simulateur.site/outil/slug/">

  <link rel="stylesheet" href="/styles.css">

  <!-- JSON-LD : un WebApplication et un BreadcrumbList, cohérents avec la canonique. -->
  <script type="application/ld+json">
    { ... WebApplication ... }
  </script>
  <script type="application/ld+json">
    { ... BreadcrumbList ... }
  </script>

  <!-- Scripts nécessaires à l'interactivité uniquement. -->
</head>
<body>
  <!-- Header commun : il est commité dans chaque page et vérifié par normalize-layout.mjs --check. -->
  <header>...</header>

  <main>
    <div class="wrap">
      <!-- Breadcrumb visible : Accueil > catégorie > outil. -->
      <div class="breadcrumb">...</div>

      <section class="tool">
        <div class="eyebrow">CATÉGORIE</div>
        <h1>Nom de l'outil</h1>
        <p class="tool-intro">Introduction spécifique à l'outil.</p>

        <!-- Interface initiale : champs/selects/commandes réellement présents dans le HTML. -->
        <div id="fields">...</div>

        <button class="button-main">Calculer</button>

        <div class="result" id="result" aria-live="polite">Saisissez vos données puis lancez le calcul.</div>

        <!-- Méthode, limites et au moins une source : bloc obligatoire, dans le bloc outil. -->
        <div class="formula">
          <strong>Méthode et sources</strong>
          <p>Principe du calcul, limites et/ou source pertinente.</p>
          <p>Source : <a href="https://...">Source officielle</a>.</p>
        </div>
      </section>
    </div>

    <!-- Bloc éditorial : au moins deux sections H2. La FAQ est obligatoire et utilise l’accordéon natif details/summary. -->
    <section class="content-section">
      <h2>Explication du calcul</h2><p>...</p>
      <h2>Exemple de calcul</h2><p>...</p>
    </section>

    <!-- FAQ obligatoire pour chaque page interactive : au moins une question utile, nombre de questions libre. Le composant standard utilise aria-labelledby="faq-title" et id="faq-title". -->
    <section class="calculator-faq" aria-labelledby="faq-title">
      <h2 id="faq-title">FAQ</h2>
      <details>
        <summary>Question fréquente sur cet outil ?</summary>
        <div class="calculator-faq-answer"><p>Réponse directe et utile.</p></div>
      </details>
    </section>

    <!-- Bloc obligatoire : /outil/ : 2 à 4 liens issus des relations définies dans `data/tools.json` ; /conversion/ et /comparateur/ : 2 à 4 liens écrits dans le HTML, sans entrée dans `data/tools.json`. Un seul bloc par page. -->
    <section class="related-tools">
      ...
    </section>
  </main>

  <!-- Footer commun : il est commité dans chaque page et vérifié par normalize-layout.mjs --check. -->
  <footer>...</footer>

  <!-- Les scripts peuvent rester en bas du body lorsqu'ils sont nécessaires. -->
</body>
</html>
```

Le bloc outil est un `<section class="tool">` sur toutes les pages. L'introduction est un `<p class="tool-intro">`. Les anciens identifiants `ey`, `title`, `intro` et `source` ne sont plus utilisés.

## 2. Blocs obligatoires

Chaque page interactive doit fournir dans son HTML initial :

- `<!doctype html>` et `lang="fr"` ;
- un `<head>` complet avec viewport ;
- un `<title>` suivant la forme **« Mot-clé principal | Simulateur »** ; une précision utile (année, HT/TTC, etc.) peut compléter le mot-clé principal sans retirer la marque ;
- une meta description non vide de **120 à 160 caractères** ;
- une URL canonique correspondant exactement à l'URL publique existante ;
- `public/styles.css` comme feuille de style commune ;
- un `<header>`, un `<main>` et un `<footer>` uniques ;
- un breadcrumb visible commençant par **Accueil** ;
- un H1 unique et non vide ;
- un bloc `<section class="tool">` contenant le H1 et une introduction `<p class="tool-intro">` (les anciens ids ey, title, intro et source ne sont plus utilisés) ;
- l'interface essentielle directement présente dans le HTML ;
- un résultat initial **non vide**, même avant toute saisie, avec `aria-live="polite"` ;
- un bloc `.formula` (méthode et limites) contenant au moins une source ;
- au moins deux sections H2 éditoriales, regroupées dans un ou plusieurs `section.content-section` ; ces H2 utilisent le composant visuel commun du socle (hiérarchie, accent latéral, espacement et responsive). Le H2 `FAQ` est un composant distinct et ne compte pas dans ces deux H2 ; les H2 des blocs « Outils associés » restent également distincts ;
- un bloc `.calculator-faq` unique, avec un H2 `FAQ`, au moins un `<details>` et, pour chaque question, un `<summary>` non vide et un bloc `.calculator-faq-answer` non vide ;
- `/outil/` : un unique bloc `.related-tools` standard de 2 à 4 liens, issus des relations définies dans `data/tools.json` ;
- `/conversion/` et `/comparateur/` : un unique bloc `.related-tools` standard de 2 à 4 liens écrits directement dans le HTML, sans entrée `data/tools.json` ; chaque lien doit pointer vers une page publique existante, sans lien vers la page elle-même et sans doublon ;
- un `WebApplication` JSON-LD unique ;
- un `BreadcrumbList` JSON-LD unique, cohérent avec le breadcrumb visible et la canonique ;
- les liens internes réellement utiles à la page.

Le JavaScript ne doit pas être nécessaire pour faire apparaître le H1, l'introduction, les champs principaux, le résultat initial ou le contenu SEO principal.

## 3. Blocs obligatoires à profondeur flexible

La présence des composants essentiels est obligatoire ; leur profondeur reste libre. Il n'existe pas de quota de mots, de paragraphes ou de questions.

La FAQ est obligatoire sur chaque page interactive (`/outil/`, `/conversion/`, `/comparateur/`). Elle utilise un unique bloc `.calculator-faq` avec `<details>/<summary>`, `aria-labelledby="faq-title"` et un H2 `id="faq-title"` intitulé `FAQ`, afin de rester native, accessible au clavier et fonctionnelle sans JavaScript. Le nombre de questions est libre, avec au minimum une question et une réponse non vide. Les réponses restent directement présentes dans le HTML.

Selon la nature de la page interactive, peuvent être ajoutés sans modifier le socle :

- graphique ou tableau ;
- scénarios ou comparaisons ;
- avertissement réglementaire ou méthodologique ;
- contenu spécifique au domaine.

Une extension spécifique ne doit pas recréer un second gabarit de page.

## 4. Métadonnées et données structurées

### Title

Règle canonique :

`Mot-clé principal | Simulateur`

Le mot-clé doit décrire l'intention principale de la page. Les précisions utiles peuvent être ajoutées avant ` | Simulateur`, par exemple une année ou une distinction HT/TTC.

### Meta description

La meta description doit contenir **120 à 160 caractères**, être spécifique à la page et décrire concrètement l'utilité de l'outil. Elle ne doit pas être une phrase générique réutilisée sur plusieurs pages.

### WebApplication

Chaque page outil possède un seul objet JSON-LD `WebApplication`. Sa propriété `name`, son `url` et sa `description` doivent correspondre à la page.

### BreadcrumbList

Chaque page possède un seul objet JSON-LD `BreadcrumbList`. Il doit reprendre la hiérarchie visible :

1. Accueil ;
2. catégorie principale ;
3. outil.

L'URL finale doit être exactement la canonique de la page.

## 5. Header, footer et normalisation

Le header et le footer **sont commités dans chaque page**. Ils ne sont pas insérés au déploiement.

`scripts/normalize-layout.mjs` vérifie/normalise le layout partagé sur les pages HTML publiques. En production, le workflow utilise `normalize-layout.mjs --check` : il ne réécrit pas les pages et échoue si une page diverge du layout canonique ou présente une ambiguïté structurelle.

`scripts/check-layout.mjs` est également **bloquant** : une anomalie de structure ou une redéfinition interdite du layout commun fait échouer le contrôle.

## 6. Source de vérité et workflow

### Enrichissement d'une page interactive

Un enrichissement ne se limite pas au contenu éditorial. Avant de modifier une page interactive, vérifier que le **fonctionnement et le périmètre du calculateur lui-même** sont suffisamment complets pour son usage attendu.

L'audit d'enrichissement porte donc sur deux volets :

- **fonctionnel** : entrées, sorties, paramètres, unités, cas d'usage couverts, sens de conversion, possibilités de calcul et limites du moteur existant ; lorsque des fonctionnalités utiles et cohérentes manquent, elles peuvent être ajoutées ;
- **éditorial** : explications, méthode, exemples, repères, FAQ, sources, limites et contenu utile à la compréhension du résultat.

Pour les conversions notamment, vérifier que l'ensemble des unités courantes et pertinentes pour l'usage visé est couvert et que le parcours de conversion est cohérent (par exemple choix de l'unité de départ et de l'unité d'arrivée lorsque ce modèle est pertinent). Il n'est pas nécessaire de couvrir des unités historiques, spécialisées ou marginales uniquement pour viser une exhaustivité littérale.

Une page n'est donc pas considérée comme pleinement enrichie parce que son texte a été amélioré si son interface ou son moteur reste manifestement trop limité par rapport à l'usage attendu. Toute extension fonctionnelle doit respecter le socle commun, éviter les systèmes spécifiques faisant doublon et être accompagnée des contrôles/tests nécessaires.


Le HTML commité est la source de vérité. Les scripts de CI vérifient sa conformité ; ils ne doivent pas servir de moteur de génération éditoriale en production.

Le flux réel est :

1. créer/copier une page à partir de `docs/template-outil.html` ;
2. renseigner les métadonnées, le breadcrumb, l'interface, le résultat initial et le contenu propres à l'outil ;
3. conserver la logique de calcul dans le JavaScript existant sans modifier les règles métier ;
4. inscrire l'outil dans `data/tools.json` (type, catégorie, 2 à 4 `relatedTools` sous forme de slugs) ;
5. mettre à jour la date de la page dans `data/lastmod.json` si son contenu éditorial change ;
6. exécuter les contrôles pré-production ;
7. committer le HTML canonique.

La date de `data/lastmod.json` est mise à jour pour un changement de contenu visible (titre, description, texte, barème, résultat affiché). Elle n'est pas mise à jour pour une modification mécanique (layout, balisage, aria, ids, refactor JavaScript sans effet visible).

Il n'existe pas de `scripts/prerender-tools.mjs` dans ce flux et aucun header/footer n'est injecté pendant le déploiement.

### Contrôle de conformité

`scripts/check-pages.mjs` sépare les règles **structurelles** (le socle ci-dessus, bloquantes) des règles **éditoriales** (longueur de description, nombre de H2, lien source externe, unicité des métadonnées). Les règles suivies par le cliquet (`--ratchet` et `scripts/check-pages.baseline.json`) ne peuvent que diminuer : toute nouvelle page doit être conforme dès sa création et tout écart corrigé doit être retiré de la baseline. Les indicateurs de volume de contenu et de présence de lien externe hors règle `.formula` restent informatifs. `--update-baseline` ne peut que retirer des entrées ; `--seed-baseline` sert à amorcer une règle éditoriale encore absente de la baseline et refuse une règle déjà présente. Le détail est dans `docs/ARCHITECTURE.md`.

### JavaScript interne

Le contrat HTML ne dit rien sur le style du JavaScript interne d'un outil. `window.TOOL` (avec `calc`) est recommandé par défaut ; un moteur réglementaire complexe peut être extrait dans `public/<slug>.js`, comme `rsa.js` et `impot.js`. Dans tous les cas, le JavaScript ne génère pas le socle HTML et ne doit pas rendre de liens d'outils associés : le bloc `.related-tools` est écrit dans le HTML.

## 7. Template de référence

Le fichier `docs/template-outil.html` est un **point de copie documentaire uniquement**. Il ne représente pas une page publique :

- il est situé hors de `public/` ;
- il n'est donc pas parcouru par les walks des scripts de génération/contrôle des pages publiques ;
- il ne peut pas être ajouté au sitemap par accident ;
- il ne doit jamais être référencé comme URL publique.

Toute modification du template doit rester compatible avec les contrôles CI.

## 8. Tests de référence d'un calculateur

Lorsqu'un calculateur reçoit un test de référence, le cas est ajouté dans `tests/references/*.json` avec les champs `outil`, `entrees`, `attendu`, `tolerance`, `sortie` et `source`. Le champ optionnel `famille` identifie la famille de page interactive (`outil`, `conversion` ou `comparateur`) ; lorsqu'il est omis, le test est rattaché à `outil` pour conserver la compatibilité avec les cas existants. Le champ `sortie` désigne le libellé ou la regex de la valeur contrôlée ; le test échoue si ce libellé est absent ou si aucune valeur numérique ne lui est associée.

La valeur `attendu` doit provenir d'une source publiée indépendante du code testé. Elle ne doit jamais être obtenue en exécutant le calculateur testé pour fabriquer l'attendu. Si aucune source fiable ne permet de fixer un attendu, le cas n'est pas ajouté.

La couche 1 de `tests/generic-calcs.test.mjs` appelle directement `TOOL.calc` pour observer les sorties brutes, en contournant volontairement le garde-fou de `simulateurs.js`. Ce comportement est réservé au harnais et permet de détecter les valeurs invalides avant leur remplacement par le message de production.

Le matcher partagé des résultats invalides est défini dans `tests/invalid-result.mjs` et utilisé par les tests et les smokes Chromium.

## 9. Règles de simplicité

- Pas de moteur de template générique.
- Pas de second gabarit pour une famille d'URL.
- Le contenu éditorial initial doit rester directement présent dans le HTML commité ; aucun rendu éditorial par JavaScript n'est requis.
- Pas de modification d'URL pour résoudre un problème de forme.
- Les simulateurs complexes peuvent enrichir le socle, mais ne doivent pas le remplacer.
- Un seul bloc `.related-tools` par page : un bloc riche existant est fusionné dans le bloc standard, jamais ajouté à côté.
- Les pages existantes sont mises en conformité par lots ; le contrat s'applique dès maintenant à toute nouvelle page et à toute modification de page.

### Outils associés — contrat HTML-first (2026-10-03)

Une page `/outil/` possède exactement un bloc `.related-tools` contenant 2 à 4 `.related-link`. Chaque lien est écrit dans le HTML et pointe vers `/outil/<slug>/`. `data/tools.json` contient le même tableau ordonné de 2 à 4 slugs dans `relatedTools`. Le texte visible du lien suit le format `<strong>Titre</strong><span>Description</span>` et ne dépend plus d'un rendu JavaScript. Les pages `/conversion/` et `/comparateur/` conservent 2 à 4 liens dans leur HTML sans entrée `relatedTools` dans `data/tools.json`. Le fallback JS historique est supprimé.
