#!/usr/bin/env bash
# Construit l'APK du clavier Correcteur Réel : HeliBoard (version figée ci-dessous) + le moteur de correction.
#
#   clavier/heliboard/construire-apk.sh [dossier-de-travail]
#
# Prérequis : JDK 17 ou plus récent, et le SDK Android (variable ANDROID_HOME) ; Gradle télécharge lui-même
# la plateforme et le NDK demandés par HeliBoard si leurs licences sont acceptées.
# Résultat : clavier/build/CorrecteurReel.apk
# Avec PREPARER_SEULEMENT=1, s'arrête avant la compilation (pour vérifier que le correctif s'applique).
set -euo pipefail

ICI=$(cd "$(dirname "$0")" && pwd)
RACINE=$(cd "$ICI/../.." && pwd)
TRAVAIL=${1:-$RACINE/clavier/build/heliboard}
HELIBOARD_DEPOT=https://github.com/Helium314/HeliBoard.git
# HeliBoard 4.3-beta1 (25 octobre 2026). Le correctif heliboard.patch est écrit pour cette version précise.
HELIBOARD_VERSION=44ddb1ae06203857c490da75f9fa281a4e8b89cd

echo "→ HeliBoard $HELIBOARD_VERSION dans $TRAVAIL"
if [ ! -d "$TRAVAIL/.git" ]; then
  mkdir -p "$TRAVAIL"
  git -C "$TRAVAIL" init -q
  git -C "$TRAVAIL" remote add origin "$HELIBOARD_DEPOT"
fi
if ! git -C "$TRAVAIL" cat-file -e "$HELIBOARD_VERSION^{commit}" 2>/dev/null; then
  git -C "$TRAVAIL" fetch -q --depth 1 origin "$HELIBOARD_VERSION"
fi
# Repart d'une copie propre à chaque construction (les dossiers de compilation, ignorés par git, sont gardés).
git -C "$TRAVAIL" checkout -q -f "$HELIBOARD_VERSION"
git -C "$TRAVAIL" clean -q -fd

echo "→ Branchement du correcteur"
git -C "$TRAVAIL" apply "$ICI/heliboard.patch"
APP="$TRAVAIL/app/src/main"
mkdir -p "$APP/java/helium314/keyboard/latin/correcteur" "$APP/java/fr/correcteurreel" "$APP/assets/correcteur"
cp "$ICI/src/CorrecteurReel.kt" "$APP/java/helium314/keyboard/latin/correcteur/"
cp "$RACINE"/clavier/moteur/src/main/kotlin/fr/correcteurreel/*.kt "$APP/java/fr/correcteurreel/"
cp "$RACINE/correcteur/data/lexique-fr.tsv.gz" "$RACINE/correcteur/data/complements.tsv" "$APP/assets/correcteur/"

if [ "${PREPARER_SEULEMENT:-0}" = 1 ]; then
  echo "✔ Sources prêtes dans $TRAVAIL"
  exit 0
fi

echo "→ Compilation"
# Tant que l'APK est signé avec la même clé, une nouvelle version s'installe par-dessus l'ancienne sans perdre
# ce qui a été appris. SIGNATURE_DOSSIER désigne un dossier contenant signature.jks et son mot-de-passe ;
# sans lui, Gradle signe avec la clé de débogage de la machine.
SIGNATURE=()
if [ -n "${SIGNATURE_DOSSIER:-}" ]; then
  MOT_DE_PASSE=$(cat "$SIGNATURE_DOSSIER/mot-de-passe")
  SIGNATURE=(
    -Pandroid.injected.signing.store.file="$SIGNATURE_DOSSIER/signature.jks"
    -Pandroid.injected.signing.store.password="$MOT_DE_PASSE"
    -Pandroid.injected.signing.key.alias=clavier
    -Pandroid.injected.signing.key.password="$MOT_DE_PASSE"
  )
fi
(cd "$TRAVAIL" && ./gradlew --no-daemon assembleDebug "${SIGNATURE[@]}")

APK=$(find "$TRAVAIL/app/build/outputs/apk/debug" -name "*.apk" | head -1)
mkdir -p "$RACINE/clavier/build"
cp "$APK" "$RACINE/clavier/build/CorrecteurReel.apk"
echo "✔ $RACINE/clavier/build/CorrecteurReel.apk"
