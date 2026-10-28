# Clavier Correcteur Réel (Android)

Un vrai clavier pour Android (testé pour le Samsung Galaxy S24) : le clavier libre
[HeliBoard](https://github.com/Helium314/HeliBoard), dans lequel est branché le moteur de correction de
[`correcteur/`](../correcteur/), porté en Kotlin.

Ce que le moteur ajoute à HeliBoard quand la langue du clavier est le français :

- **accents oubliés corrigés à l'espace** : `reel` → `réel`, `tres` → `très`, `ca` → `ça` ;
- **fautes de frappe selon la disposition AZERTY** : `bonjoue` → `bonjour` ;
- **grammaire pendant la frappe** : `je vais a paris` → `je vais à paris`, `ils mange` → `ils mangent`,
  `j'ai manger` → `j'ai mangé`, `il est la.` → `il est là.` ;
- **apprentissage protégé** : vos prénoms, votre argot, vos abréviations sont appris, mais une forme sans
  accent d'un mot existant (`reel`) ne l'est jamais, même tapée cent fois.

Comme sur un téléphone ordinaire, un **retour arrière juste après une correction l'annule**. Annuler deux fois
la correction d'un mot inconnu (`mdr`) le fait apprendre ; annuler celle de `reel` ne change rien.

## Installer sur le téléphone

1. Sur le téléphone, connecté à votre compte GitHub, ouvrez la page **Releases** du dépôt et téléchargez
   `CorrecteurReel.apk` (version « Clavier Correcteur Réel »).
2. Ouvrez le fichier téléchargé. Android demande d'autoriser l'installation d'applications depuis le navigateur
   (ou l'application Fichiers) : acceptez pour cette fois.
3. **Paramètres › Gestion globale › Liste et paramètres du clavier** (ou « Clavier et méthode de saisie »
   selon la version) : activez **Correcteur Réel**, puis choisissez-le comme clavier par défaut.
4. Ouvrez l'application Correcteur Réel : dans **Langues et dispositions**, ajoutez **Français (AZERTY)**.
5. Les réglages du correcteur sont dans **Correction du texte** : « Correcteur Réel (français) » et
   « Grammaire pendant la frappe ». La correction automatique de HeliBoard doit rester activée.

Par défaut, le clavier affiche une rangée de chiffres en haut, et ses touches font 90 % de la hauteur
habituelle de HeliBoard. Pour ajuster : dans l'application, **Apparence › Hauteur du clavier**, et
**Préférences › Rangée de chiffres**.

Au premier lancement, le dictionnaire (142 000 formes) met environ une seconde à se charger ; le clavier
fonctionne normalement pendant ce temps.

Une nouvelle version s'installe en général par-dessus l'ancienne sans perdre ce que le clavier a appris
(voir les limites plus bas).

## Confidentialité

Tout se passe sur le téléphone : HeliBoard n'a pas l'autorisation d'accéder à Internet. Ce que le clavier
apprend est enregistré dans ses fichiers privés (`correcteur-reel-profil.json`). Rien n'est appris dans les
champs de mot de passe, en navigation privée, ni si « Apprendre de vos saisies » est désactivé.

## Comment c'est construit

```
clavier/
├── moteur/                 le moteur en Kotlin (sans dépendance Android) et ses tests
│   └── outils/generer-parite.mjs   cas de référence produits par la version JavaScript
└── heliboard/
    ├── heliboard.patch     modifications de HeliBoard (une dizaine de points d'accroche)
    ├── src/CorrecteurReel.kt   pont entre HeliBoard et le moteur
    └── construire-apk.sh   récupère HeliBoard (version figée), applique le tout, compile
```

À chaque modification de `clavier/` poussée sur GitHub, le workflow
[`.github/workflows/clavier-apk.yml`](../.github/workflows/clavier-apk.yml) teste le moteur, construit l'APK
sur les serveurs de GitHub et remplace la version « Clavier Correcteur Réel » des Releases.

Pour construire en local (JDK 17+ et SDK Android installés) :

```sh
clavier/heliboard/construire-apk.sh      # → clavier/build/CorrecteurReel.apk
cd clavier/moteur && gradle test          # tests du moteur
```

### Points d'accroche dans HeliBoard

| Fichier | Rôle |
|---|---|
| `Suggest.kt` | Les propositions du moteur passent en tête de la barre de suggestions, et c'est lui qui décide de corriger ou non le mot. |
| `InputLogic.java`, `commitCurrentAutoCorrection` | À l'espace, le mot est accordé avec ce qui précède (`ils mange` → `mangent`). |
| `InputLogic.java`, `handleSeparatorEvent` | Après chaque mot, les mots précédents sont relus (`a` → `à` une fois `paris` tapé). |
| `InputLogic.java`, `commitChosenWord` et `revertCommit` | Apprentissage, et mémorisation des corrections annulées. |
| `LatinIME.java` | Chargement du dictionnaire au démarrage, sauvegarde de ce qui a été appris. |
| `Settings`, `TextCorrectionScreen.kt` | Les deux réglages. |

### Limites

- C'est une version de démonstration (« debug ») de HeliBoard 4.3-beta1, renommée.
- La clé de signature n'est pas dans le dépôt : GitHub la garde dans le cache des Actions, qui l'efface après
  7 jours sans construction. Une construction après une longue pause signe donc avec une nouvelle clé, et
  Android refuse alors la mise à jour : il faut désinstaller l'ancienne version (ce qui efface ce que le
  clavier a appris) avant d'installer la nouvelle. Pour une clé permanente, il faudra la ranger dans les
  secrets du dépôt.
- Seul le français est concerné ; dans les autres langues, HeliBoard fonctionne comme d'habitude.

HeliBoard est distribué sous licence GPL-3.0 ; ce clavier, qui en est dérivé, l'est aussi.
