# Règles de forme du site

L'objectif est une architecture de pages simple, statique et homogène. Le contenu initial d'une page doit être directement présent dans son HTML. JavaScript apporte l'interactivité et le calcul, mais ne construit pas le contenu éditorial ou la structure essentielle de la page.

## Principes

1. **HTML-first** : H1, introduction, interface essentielle, méthode, sources, liens internes et données structurées sont présents dans le HTML initial.
2. **Un seul gabarit de page outil** : les pages `/outil/`, `/conversion/` et `/comparateur/` utilisent le même socle visuel et sémantique. Le préfixe d'URL distingue le type d'outil ; il ne crée pas une architecture de rendu différente.
3. **Personnalisation limitée** : un simulateur complexe peut ajouter un graphique, un tableau, des scénarios ou des explications spécifiques, sans recréer le gabarit global.
4. **Pas de rendu éditorial dynamique** : `Simulateurs.render()` n'est plus utilisé pour construire une page. Le hook historique est un no-op de compatibilité sur les anciennes pages.
5. **Le HTML committé est la source de vérité** : CI vérifie la conformité mais ne réécrit plus les pages, le sitemap ou les éléments publicitaires.
6. **Pas de moteur de template générique** : la simplicité et la maintenabilité priment sur l'abstraction.

## Structure commune

Une page outil suit cette structure logique :

```text
<head>
 ├── title / meta description / canonical
 ├── styles.css
 ├── JavaScript nécessaire
 └── JSON-LD
      ├── WebApplication
      └── BreadcrumbList

<body>
 ├── header commun
 ├── main
 │   └── .wrap
 │       ├── breadcrumb
 │       ├── .tool
 │       │   ├── eyebrow
 │       │   ├── H1
 │       │   ├── introduction
 │       │   ├── interface
 │       │   ├── bouton de calcul
 │       │   └── résultat
 │       ├── contenu éditorial / méthode / FAQ
 │       └── .related-tools si pertinent
 └── footer commun
```

Les classes et dimensions communes sont définies dans `public/styles.css`. Les styles propres à un outil complexe restent autorisés dans sa page.

## Métadonnées et taxonomie

La taxonomie centrale est `public/simulateurs.js` :

- un type principal : `calculateur`, `simulateur`, `conversion` ou `comparateur` ;
- une catégorie principale ;
- des outils associés ;
- pour les routes hors `/outil/`, la propriété `path` conserve l'URL existante.

Les URLs existantes ne sont pas migrées uniquement pour uniformiser le code. Ainsi, `/outil/<slug>/`, `/conversion/<slug>/` et `/comparateur/<slug>/` restent des conteneurs d'URL, tout en partageant le même socle de page.

## Breadcrumb et données structurées

Chaque page outil doit avoir :

- un breadcrumb visible commençant par **Accueil** ;
- la catégorie principale comme niveau intermédiaire ;
- le nom de l'outil comme dernier niveau ;
- un `BreadcrumbList` JSON-LD correspondant exactement à l'URL canonique ;
- un `WebApplication` JSON-LD unique.

Pour les pages `/outil/`, le breadcrumb et les liens associés sont contrôlés par la taxonomie centrale.

## Règles de contenu

- Un seul `<main>`, un seul `<header>` et un seul `<footer>`.
- Un H1 non vide et unique.
- Une meta description non vide.
- Une URL canonique correspondant à la page.
- L'interface essentielle doit être utilisable sans génération HTML par JavaScript.
- Les sources officielles et limites du calcul doivent être indiquées lorsqu'elles sont pertinentes.
- Les liens associés doivent rester contextuels et utiles ; pas de remplissage artificiel.

## Gabarit minimal

```html
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="calculator-rendering" content="static">
  <title>Titre de l'outil | Simulateur</title>
  <meta name="description" content="Description claire et utile.">
  <link rel="canonical" href="https://simulateur.site/outil/slug/">
  <link rel="stylesheet" href="/styles.css">
  <!-- WebApplication + BreadcrumbList -->
</head>
<body>
  <header>...</header>
  <main>
    <div class="wrap">
      <div class="breadcrumb">...</div>
      <section class="tool">
        <div class="eyebrow">CATÉGORIE</div>
        <h1>Titre de l'outil</h1>
        <p class="tool-intro">Introduction.</p>
        <div id="fields">...</div>
        <button class="button-main">Calculer</button>
        <div class="result" id="result"></div>
      </section>
      <section class="content-section">...</section>
      <section class="related-tools">...</section>
    </div>
  </main>
  <footer>...</footer>
</body>
</html>
```

Les scripts de validation (`check-layout.mjs`, `check-security.mjs` et les contrôles du workflow de déploiement) sont des garde-fous : ils détectent les écarts mais ne modifient pas automatiquement la sécurité ni le contenu des pages.
