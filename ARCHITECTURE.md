# ARCHITECTURE.md

Architecture cible du projet, après abandon de la contrainte « fichier HTML
unique ». Ce document décrit où on va ; `CLAUDE.md` décrit ce qui existe
aujourd'hui (`flat-or-globe-2.20.0.html`) et reste la référence sur le
contenu scientifique et les règles rhétoriques héritées.

## 1. Pourquoi cette refonte

Le fichier unique a bien rempli son rôle (page auto-suffisante, envoyable
par email, zéro dépendance) mais il a atteint ses limites :

- 32 000+ lignes dans un seul fichier : impossible à revoir, à versionner
  proprement (pas encore de dépôt git) ou à faire évoluer sans risque de
  collision (cf. tous les pièges documentés dans l'en-tête du fichier
  legacy : ids obsolètes, renumérotations manuelles, comptages i18n qui se
  désynchronisent).
- Le rendu 3D est un moteur orthographique fait main (`rot3`/`mk3`/`path3`)
  : suffisant pour des scènes simples, mais limité pour les rendus qu'on
  veut maintenant (vraie perspective, éclairage, interaction caméra).
- L'i18n est câblée à la main dans le DOM (hash de contenu, walker de
  nœuds texte) : ça a permis d'avancer vite mais ça complique l'ajout de
  langues et le rend fragile aux refontes de mise en page.

## 2. Objectifs (demande du 2026-09-12)

1. Séparer le contenu en fichiers indépendants (un module par onglet, au
   minimum).
2. Éviter les technologies « TypeScript lourdes » : pas de compilateur TS
   obligatoire dans la chaîne, pas de framework à runtime volumineux.
3. De meilleurs rendus visuels.
4. Abandonner la contrainte du fichier unique / offline strict.
5. Ajouter des langues.
6. Ajouter des faits (nouveaux cas documentés).
7. Simplifier des textes existants.
8. De la vraie 3D sur certaines animations (au lieu du moteur maison 2.5D).

## 3. Ce qui NE change PAS

La refonte est technique, pas éditoriale. Restent contraignants (détaillés
dans `CLAUDE.md` §« header comment » et à reporter tels quels dans le
nouveau code, pas seulement dans la doc) :

- Les 7 règles rhétoriques (jamais d'exagération non étiquetée, steel-man
  du modèle plat, réfraction toujours montrée à côté de la valeur brute,
  préférer les inversions de signe aux écarts de magnitude, préférer les
  quantités où les paramètres parasites s'annulent, énoncer à l'avance ce
  qui validerait le modèle plat, assumer les limites dans le texte).
- Les décisions techniques non évidentes (exagération par rayon réduit et
  jamais par étirement d'axe, réfraction = rayon effectif appliqué au
  globe seul, visibilité jugée contre la dépression d'horizon, etc.).
- Le système de sources : un bloc `.srcs` par onglet, numérotation par
  onglet, un `[n]` par affirmation sourcée.
- La règle de repli i18n : une clé manquante retombe sur l'anglais, jamais
  sur du vide ; l'anglais reste lu depuis le contenu source, jamais stocké
  en double dans un dictionnaire.

Ce qui change explicitement : la contrainte « doit fonctionner hors-ligne
depuis un unique fichier .html ouvert directement dans un navigateur ». Le
site cible est un site statique buildé, déployé quelque part (à définir,
voir `NOTES.md`), pas un fichier qu'on s'envoie par email.

## 4. Choix techniques

- **Pas de framework UI à runtime lourd.** JavaScript natif + modules ES.
  On garde la logique « une fonction render() par onglet » qui a fait ses
  preuves, on la déplace juste dans des fichiers séparés avec un contrat
  explicite (§6).
- **Pas de TypeScript compilé.** Fichiers `.js` + JSDoc pour les types
  importants (signatures des fonctions partagées, formes des objets
  `PRESETS`/`CITES`/i18n). Un `tsc --checkJs --noEmit` peut tourner comme
  vérification de qualité (epic07) mais rien ne passe par un compilateur
  TypeScript dans le chemin de build.
- **Outillage de build : Vite.** Config minimale, dev server avec rechargement
  à chaud, build statique en sortie. Choisi pour son faible poids et son
  support natif des modules ES (pas de webpack à configurer à la main).
- **Vraie 3D : Three.js**, mais seulement sur les scènes identifiées dans
  `tasks/epic03/` (constellation GPS, dipôle/disque magnétique, triangle
  d'excès sphérique, cadran solaire). Le reste (coupes, graphes, cartes)
  reste en Canvas 2D / SVG — pas de migration Three.js par principe sur
  ce qui n'en a pas besoin.
- **TeX → MathML : on garde le convertisseur maison.** Pas de librairie
  externe (KaTeX/MathJax) : trop lourd pour ce que la page utilise
  (~150 commandes). Le convertisseur legacy (`texToMathML`) est repris tel
  quel dans `src/core/tex-mathml.js`.
- **i18n : JSON par langue et par onglet**, chargés par le module de
  l'onglet. Fini le hash de contenu + walker DOM ; les clés deviennent des
  chemins lisibles (`sim.lead-1`, `hh.gloss-3`, ...). Le principe de repli
  sur l'anglais et l'audit de complétude (epic07) sont conservés.
- **Audits en Python.** Décision du 2026-09-12 : les cinq audits hérités
  du legacy (structure, intégrité, texte, figures, TeX -- voir
  `CLAUDE.md`) sont réécrits en Python, dans la continuité directe des
  scripts d'origine, plutôt que portés vers Node. Ce n'est pas une
  exception à la règle "pas de techno lourde" : ces scripts sont un
  outillage de développement (exécutés en CI et à la main, jamais par le
  site en production), donc ils n'ajoutent rien au poids ou aux
  dépendances de la page servie. Détail dans `tasks/epic07/`.

## 5. Arborescence cible

```
/
  index.html                 -- coquille : masthead, barre d'onglets, montage des modules
  src/
    main.js                  -- registre des onglets, activation, routage clavier
    core/
      dom.js                 -- $, helpers DOM
      math.js                -- géométrie sphère/plan partagée (horizon, rayon effectif, etc.)
      tex-mathml.js           -- convertisseur TeX -> MathML (repris du legacy)
      camera3d.js             -- caméra orthographique partagée (rot3/mk3/path3) pour les scènes qui restent en 2.5D
      i18n.js                  -- chargeur de dictionnaires + repli anglais
      citations.js             -- rendu des blocs .srcs et des ancres [n], par onglet
    tabs/
      sim/            index.js, view.html, style.css, presets.js
      hh/             index.js, view.html, style.css
      cnav/ star/ dist/ dip/ grav/ mag/ sun/ twi/ azim/ surv/ ct/ gps/
      home/ ref/ obs/ falsify/
    render3d/
      scene-gps.js, scene-mag.js, scene-sundial.js
      shared/ (lumières, matériaux, contrôles caméra communs Three.js)
    i18n/
      en/<tab>.json   (source de vérité, un fichier par onglet)
      fr/<tab>.json
      de/ it/ es/ pt/ nl/ ...
    data/
      presets.js, cites.js (ou .json), dem/*.json (profils de silhouette bakés)
  public/                     -- assets statiques (favicon, images sourcées, DEM bruts)
  legacy/
    flat-or-globe-2.20.0.html -- conservé en lecture seule comme référence de parité pendant la migration
  scripts/                    -- audits (epic07), portés du legacy audit-*.py/js
  tasks/epicXX/UCXX.org
  ARCHITECTURE.md  LOG.md  NOTES.md  PROJECT.org  CLAUDE.md
```

## 6. Contrat d'un module d'onglet

Chaque onglet exporte un objet unique, enregistré par `main.js` :

```js
export default {
  key: "sim",              // identifiant stable, cf. légende TABLIST du legacy
  mount(container) { ... },// injecte le HTML du panneau, une fois
  render(state) { ... },   // (re)dessine, appelé à l'activation et à chaque changement d'input
  teardown() { ... },      // stoppe les boucles rAF, retire les listeners -- absent du legacy, ajouté ici
};
```

Remplace le grand `if/else` d'`activateTab()` du legacy par une table de
routage construite depuis la liste des modules importés. `teardown()` est
une amélioration délibérée : dans le legacy, les boucles `rAF` se
gardent elles-mêmes sur la visibilité de l'onglet ; ici, l'idée est de les
arrêter franchement pour ne pas dépendre de ce garde-fou partout.

## 7. Stratégie de migration

1. Le fichier `flat-or-globe-2.20.0.html` est déplacé tel quel dans
   `legacy/` et devient la référence de parité (jamais modifié après ça,
   sauf correction de contenu qui doit de toute façon être reportée dans
   le nouveau code).
2. Onglet par onglet (epic02), on porte le contenu et le rendu, on vérifie
   la parité visuelle et numérique contre le legacy, puis seulement on
   coche l'UC correspondante.
3. Rien n'est supprimé du legacy tant que la parité de l'epic02 n'est pas
   complète à 100 % -- voir `PROJECT.org`.

## 8. Commandes

Node 20.19.2 + npm 10 (Node/npm ne sont pas installés au niveau système
sur la machine de dev actuelle -- un binaire portable a été placé dans
`~/.local/opt/node-v20.19.2/` et symlinké dans `~/.local/bin/`, déjà sur
le `PATH` par défaut du shell de ce poste. À refaire sur une nouvelle
machine si besoin : télécharger le tarball `linux-x64` correspondant sur
nodejs.org et l'extraire quelque part, aucun droit root nécessaire).

- `npm install` -- installe Vite (seule dépendance de dev pour l'instant).
- `npm run dev` -- serveur de développement Vite avec rechargement à chaud.
- `npm run build` -- build statique dans `dist/` (vérifié : 3 fichiers,
  HTML+CSS+JS, ~15 kB de JS gzippé pour la coquille + l'onglet gabarit).
- `npm run preview` -- sert `dist/` localement pour vérifier le build.
- `npm run check` -- filet de vérification minimal (epic01/UC07) : importe
  chaque module sous `src/tabs/*/index.js` via l'API SSR de Vite et
  vérifie le contrat `mount/render/teardown` (§6). Détecte une régression
  de contrat avec un message clair et un code de sortie non nul.
- `node --test src/core/*.test.js` -- tests unitaires des modules
  partagés (`node:test`, aucune dépendance de test externe).

## 9. Déploiement (agnostique de l'hébergeur)

Pas de décision d'hébergement prise (voir `NOTES.md`), mais la contrainte
posée par le propriétaire -- "une stack simple pour pouvoir aller
n'importe où" -- est déjà satisfaite par le choix de Vite : `npm run
build` produit un dossier `dist/` 100% statique (HTML/CSS/JS/assets), sans
serveur applicatif ni base de données. Deux modes de diffusion restent
ouverts sans rien changer à l'architecture :

- **Statique nu** : le contenu de `dist/` déposé tel quel sur n'importe
  quel hébergeur de fichiers statiques ou CDN.
- **Image conteneur (Docker/Podman)** : un `Dockerfile` minimal (build
  Vite dans un premier stage, puis copie de `dist/` dans une image
  serveur statique légère type nginx) -- à ajouter comme tâche à part
  entière le jour où ce mode est retenu, pas avant. Ne pas anticiper son
  contenu ici tant que le choix n'est pas fait.

Aucun des deux modes n'a d'impact sur `src/` : ils ne changent que la
dernière étape (comment `dist/` est servi), jamais le code applicatif.
