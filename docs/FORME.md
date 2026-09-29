# Règles de forme du site

La forme du site est gérée à un seul endroit pour chaque élément. Ne jamais la redéfinir dans une page.

| Élément | Où c'est géré |
|---|---|
| Mise en page (largeurs, marges, cartes, boutons) | public/styles.css |
| En-tête et pied de page | scripts/normalize-layout.mjs (appliqué au déploiement à toutes les pages) |
| Contrôle de cohérence | scripts/check-layout.mjs (avertissements dans les logs du déploiement) |

## Règles

1. Le contenu d'une page est dans un seul `<main>`. Ne pas écrire d'en-tête ni de pied de page : ils sont insérés au déploiement.
2. `<main>` gère lui-même la largeur maximale (1180 px) et les marges latérales (24 px). Ne jamais ajouter de padding ou de marge latérale à un bloc, ni en style inline, ni dans un `<style>` de page.
3. Un `<div class="wrap">` dans `<main>` est facultatif et sans effet.
4. Texte de fin de page (explications, FAQ, sources) : `<section class="content-section">` directement dans `<main>`.
5. Un `<style>` de page ne doit pas redéfinir `.wrap`, `main`, `header`, `footer`, `.nav`, `.navlinks`, `.logo`, `.content-section`, `.related-tools`, `.footerlinks`. Un style propre à un seul outil (graphique, tableau) reste possible.
6. Tout nouvel outil doit être listé sur au moins une page de rubrique (calculateurs, simulateurs, conversions, comparateurs).

## Gabarit : page de texte

```html
<!doctype html>
<html lang="fr"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Titre de la page | Simulateur</title>
<meta name="description" content="Description de la page.">
<link rel="canonical" href="https://simulateur.site/mon-slug/">
<link rel="stylesheet" href="/styles.css">
</head><body>
<main>
<article class="article">
<div class="eyebrow">RUBRIQUE</div><h1>Titre</h1>
<p>Texte.</p>
</article>
</main>
</body></html>
```

## Gabarit : contenu d'une page de rubrique

```html
<main>
<div class="breadcrumb"><a href="/">Accueil</a> · Rubrique</div>
<section class="hero"><div class="eyebrow">RUBRIQUE</div><h1>Titre</h1><p class="lead">Introduction.</p></section>
<section><div class="section-head"><h2>Groupe</h2></div><div class="grid">
<article class="card"><div class="icon">%</div><h3><a href="/outil/slug/">Nom</a></h3><p>Description.</p></article>
</div></section>
</main>
```

## Page d'outil

Copier public/outil/pourcentage/index.html et adapter le contenu. Le fil d'Ariane, les données structurées et « Calculs associés » sont ajoutés par scripts/prerender-tools.mjs.
