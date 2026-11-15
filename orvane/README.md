# Orvane

Un RPG tactique au tour par tour pour téléphone, en vue de 3/4, dans l'esprit de Dofus (mécaniques libres, aucun nom ni dessin repris). Les huit classes sont des métiers de bouche, dans la direction artistique de La Place des Artisans. Orvane reste un nom de travail.

## Ce qu'il y a ici

| Chemin | Contenu |
|---|---|
| `jeu.html` + `proto/` | Le prototype jouable (Phaser 3.90.0, chargé depuis cdnjs) : création de l'artisan, tutoriel « Premier service », exploration du Fourneau, Mise en place, combat, Addition, Grimoire, caractéristiques, lexique. |
| `moteur/regles.js` | Le moteur de règles, sans dépendance, qui marche dans le navigateur et dans Node. Toutes les règles du combat sont là ; le prototype ne fait qu'afficher et animer. |
| `moteur/CONTRAT.md` | Les règles décidées, qui font foi (décisions 1 à 13). |
| `moteur/API.md` | Comment appeler le moteur. |
| `moteur/monstres.js` | La carte du Fourneau, ses monstres et ses groupes. |
| `grimoire.js` | Les 256 sorts (8 classes × 16 emplacements, chaque sort avec sa déclinaison), assemblés à partir de `verif/grimoire/<classe>.json`. |
| `jeu-artisans.html` | Le plan de création (classes, sorts, règles, monde, enseignes). Il lit `donnees.js`, `persos.js`, `zones.js`, `grimoire.js`, `grimoire-plan.js` et `captures/`. |
| `monde.json`, `zones.js` | Le monde : zones, boss d'enseigne, boss final. |
| `docs/` | La recherche sur la façon de jouer à Dofus, et le rapport d'équilibre entre les 8 classes. |
| `essais/` | Les essais Playwright, qui jouent au doigt comme un joueur. |
| `outils/` | L'outil du grimoire et les tableaux d'équilibrage. |

## Jouer au prototype

Ouvrir `jeu.html` dans un navigateur (il faut un accès à internet pour Phaser et les polices). Sur téléphone, en portrait.

## L'application Android (APK)

À chaque modification d'`orvane/`, GitHub construit l'APK (`.github/workflows/orvane-apk.yml`) et le publie dans la version **« orvane »** des Releases du dépôt. Sur le téléphone : télécharger `Orvane.apk`, l'ouvrir, autoriser l'installation depuis cette source. Le jeu y marche sans internet (Phaser et les polices sont inclus), la sauvegarde reste dans le téléphone, et une nouvelle version s'installe par-dessus l'ancienne (même clé de signature, gardée dans le cache de GitHub).

`android/` contient l'application : une WebView en plein écran qui sert le jeu depuis ses fichiers (`WebViewAssetLoader`). La touche Retour ferme la fenêtre ouverte ou annule l'aperçu (`android/web/android.js`), sinon elle met le jeu en arrière-plan. Pour construire à la main (JDK 17+, Gradle 8.14, SDK Android dans `ANDROID_HOME`) :

```bash
orvane/android/construire-apk.sh     # → orvane/android/build/Orvane.apk
```

## Vérifier

```bash
node moteur/tests.js              # règles (197 tests)
node moteur/tests-adverses.js     # cas difficiles (103 tests)
node outils/grimoire.js verifier  # les 256 sorts
```

## Le grimoire

Les sorts se modifient dans `verif/grimoire/<classe>.json`, puis :

```bash
node outils/grimoire.js verifier <classe>
node outils/grimoire.js aplatir <classe>   # pour la simulation
node outils/grimoire.js assembler          # refait grimoire.js
```

## Simuler des combats

```bash
node moteur/simule.js 400 verif/grimoire/patissorcier-sorts.json --classe=patissorcier --niveau=3 --declinaisons
bash outils/equilibrage/rythme-table.sh 400 1 > table.tsv && python3 outils/equilibrage/rythme-resume.py table.tsv
```

L'ordinateur joue les deux camps ; les points de caractéristique sont placés comme « Répartir pour moi ».

## Essais dans le navigateur

Ils demandent Playwright et Chromium (`npm i playwright`).

```bash
cd essais
node scen-moteur.js      # fournée, Pain de route, Minuteur en solo, Addition d'une défaite
node tuto-debutant.js    # le tutoriel joué au doigt
bash finales.sh          # une partie au téléphone et une à l'ordinateur, avec captures dans proto/captures
```
