#!/usr/bin/env bash
# Construit l'APK d'Orvane : le jeu (page, moteur, grimoire, prototype), Phaser et les polices, dans une application
# Android qui marche hors ligne.
#
#   orvane/android/construire-apk.sh
#
# Prérequis : JDK 17 ou plus récent, Gradle 8.14, le SDK Android (variable ANDROID_HOME), node, curl.
# Signature : avec ORVANE_CLE (fichier .jks, alias « orvane ») et ORVANE_MOT_DE_PASSE, la clé stable ; sinon la clé
# de débogage de la machine.
# Résultat : orvane/android/build/Orvane.apk
set -euo pipefail
ICI=$(cd "$(dirname "$0")" && pwd)
cd "$ICI"
gradle --no-daemon assembleRelease "$@"
mkdir -p build
cp app/build/outputs/apk/release/app-release.apk build/Orvane.apk
echo "✔ $ICI/build/Orvane.apk ($(du -h build/Orvane.apk | cut -f1))"
