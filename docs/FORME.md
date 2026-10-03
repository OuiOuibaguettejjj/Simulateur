# Règles de forme du site

Ce document définit le **gabarit canonique** des pages outil. Les pages sont HTML-first : le contenu essentiel, l'interface initiale et les données structurées sont présents dans le HTML commité. JavaScript apporte la logique de calcul et les interactions, mais ne génère pas le socle éditorial de la page.

## 1. Gabarit unique

Les pages `/outil/`, `/conversion/` et `/comparateur/` partagent le même socle HTML-first. Le préfixe d'URL est conservé pour respecter les URL existantes ; il ne constitue pas un gabarit de rendu différent.

La page de référence actuelle est `public/outil/tva/index.html`. Pour créer une nouvelle page, utiliser `public/outil/_template.html` comme point de copie, puis adapter uniquement les données et l'interface propres à l'outil.

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

        <!-- Le résultat initial ne doit jamais être vide. -->
        <div class="result" id="result">Saisissez vos données puis lancez le calcul.</div>

        <!-- Méthode, limites et sources peuvent être dans le bloc outil ou le contenu éditorial. -->
        <div class="formula">
          <strong>Méthode et sources</strong>
          <p>Principe du calcul, limites et/ou source pertinente.</p>
        </div>
      </section>
    </div>

    <!-- Bloc éditorial : explications, exemples, limites, FAQ si utile. -->
    <section class="content-section">
      <h2>...</h2>
      <p>...</p>
    </section>

    <!-- Bloc facultatif : outils associés, lorsque des relations pertinentes sont définies. -->
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

## 2. Blocs obligatoires

Chaque page outil doit fournir dans son HTML initial :

- `<!doctype html>` et `lang="fr"` ;
- un `<head>` complet avec viewport ;
- un `<title>` suivant la forme **« Mot-clé principal | Simulateur »** ; une précision utile (année, HT/TTC, etc.) peut compléter le mot-clé principal sans retirer la marque ;
- une meta description non vide de **120 à 160 caractères** ;
- une URL canonique correspondant exactement à l'URL publique existante ;
- `public/styles.css` comme feuille de style commune ;
- un `<header>`, un `<main>` et un `<footer>` uniques ;
- un breadcrumb visible commençant par **Accueil** ;
- un H1 unique et non vide ;
- une introduction claire ;
- l'interface essentielle directement présente dans le HTML ;
- un résultat initial **non vide**, même avant toute saisie ;
- les informations de méthode, limites et sources lorsqu'elles sont pertinentes ;
- un `WebApplication` JSON-LD unique ;
- un `BreadcrumbList` JSON-LD unique, cohérent avec le breadcrumb visible et la canonique ;
- les liens internes réellement utiles à la page.

Le JavaScript ne doit pas être nécessaire pour faire apparaître le H1, l'introduction, les champs principaux, le résultat initial ou le contenu SEO principal.

## 3. Blocs facultatifs

Selon la nature de l'outil, peuvent être ajoutés sans modifier le socle :

- graphique ou tableau ;
- scénarios ou comparaisons ;
- FAQ ;
- exemple détaillé ;
- avertissement réglementaire ou méthodologique ;
- bloc « Outils associés » ;
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

Le HTML commité est la source de vérité. Les scripts de CI vérifient sa conformité ; ils ne doivent pas servir de moteur de génération éditoriale en production.

Le flux réel est :

1. créer/copier une page à partir de `public/outil/_template.html` ;
2. renseigner les métadonnées, le breadcrumb, l'interface, le résultat initial et le contenu propres à l'outil ;
3. conserver la logique de calcul dans le JavaScript existant sans modifier les règles métier ;
4. inscrire l'outil dans la taxonomie centrale lorsque nécessaire ;
5. exécuter les contrôles pré-production ;
6. committer le HTML canonique.

Il n'existe pas de `scripts/prerender-tools.mjs` dans ce flux et aucun header/footer n'est injecté pendant le déploiement.

## 7. Template de référence

Le fichier `public/outil/_template.html` est un **point de copie uniquement**. Il ne représente pas une page publique :

- son nom ne se termine pas par `index.html` ;
- il n'entre donc pas dans le walk des pages de `generate-sitemap.mjs`, `normalize-layout.mjs`, `prepare-adsense.mjs` ou `check-layout.mjs` ;
- il doit rester hors du sitemap ;
- il ne doit jamais être référencé comme URL publique.

Toute modification du template doit rester compatible avec les contrôles CI.

## 8. Règles de simplicité

- Pas de moteur de template générique.
- Pas de second gabarit pour une famille d'URL.
- Pas de rendu éditorial via `Simulateurs.render()`.
- Pas de modification d'URL pour résoudre un problème de forme.
- Les simulateurs complexes peuvent enrichir le socle, mais ne doivent pas le remplacer.
