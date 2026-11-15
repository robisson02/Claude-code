#!/usr/bin/env bash
# Prépare le jeu pour l'APK, hors ligne : copie la page, le moteur, le grimoire et le prototype dans
# app/src/main/assets/www, télécharge Phaser et les polices pour qu'aucun réseau ne soit nécessaire,
# et ajoute le pont Android (touche Retour).
#
#   bash web/preparer-www.sh        (depuis orvane/android ; Gradle le lance avant chaque construction)
#
# Les téléchargements sont gardés dans web/cache (ignoré par git) : une construction suivante n'a plus besoin du réseau.
set -euo pipefail

ICI=$(cd "$(dirname "$0")" && pwd)
ANDROID=$(cd "$ICI/.." && pwd)
JEU=$(cd "$ANDROID/.." && pwd)                       # le dossier orvane/
WWW="$ANDROID/app/src/main/assets/www"
CACHE="$ICI/cache"
NAVIGATEUR="Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36"

rm -rf "$WWW"
mkdir -p "$WWW/vendor" "$WWW/polices" "$CACHE"

# 1. Les scripts locaux que la page charge, à leur place
grep -o '<script src="[^"]*"' "$JEU/jeu.html" | sed 's/<script src="//;s/"$//' | grep -v '^https\?:' | while read -r f; do
  mkdir -p "$WWW/$(dirname "$f")"
  cp "$JEU/$f" "$WWW/$f"
done
cp "$ICI/android.js" "$WWW/android.js"

# 2. Phaser, téléchargé une fois depuis l'adresse écrite dans la page
PHASER_URL=$(grep -o 'https://cdnjs[^"]*phaser[^"]*\.js' "$JEU/jeu.html" | head -1)
if [ ! -s "$CACHE/phaser.min.js" ]; then
  echo "→ Phaser : $PHASER_URL"
  curl -sSfL --retry 3 -o "$CACHE/phaser.min.js" "$PHASER_URL"
fi
[ "$(wc -c < "$CACHE/phaser.min.js")" -gt 500000 ] || { echo "Phaser téléchargé incomplet" >&2; exit 1; }
cp "$CACHE/phaser.min.js" "$WWW/vendor/phaser.min.js"

# 3. Les polices (Atkinson Hyperlegible, Bricolage Grotesque, licence OFL) : la feuille de style Google Fonts et ses
#    fichiers woff2, réécrits en chemins locaux. Sans réseau ni cache, le jeu garde les polices du téléphone.
POLICES_URL=$(grep -o 'https://fonts.googleapis.com/css2[^"]*' "$JEU/jeu.html" | head -1 | sed 's/&amp;/\&/g')
POLICES=0
if [ -n "$POLICES_URL" ]; then
  if [ ! -s "$CACHE/polices.css" ]; then
    echo "→ Polices : $POLICES_URL"
    if curl -sSfL --retry 3 -A "$NAVIGATEUR" -o "$CACHE/polices.css.tmp" "$POLICES_URL"; then
      ok=1
      for u in $(grep -o 'https://fonts.gstatic.com/[^)]*\.woff2' "$CACHE/polices.css.tmp" | sort -u); do
        nom=$(echo "$u" | sed 's#https://fonts.gstatic.com/##; s#/#-#g')
        [ -s "$CACHE/$nom" ] || curl -sSfL --retry 3 -o "$CACHE/$nom" "$u" || { ok=0; break; }
      done
      if [ "$ok" = 1 ]; then
        sed -E 's#https://fonts.gstatic.com/([^)]*\.woff2)#\1#g' "$CACHE/polices.css.tmp" \
          | sed -E ':a; s#(url\()([^)/]*)/([^)]*\.woff2\))#\1\2-\3#; ta' > "$CACHE/polices.css"
      fi
      rm -f "$CACHE/polices.css.tmp"
    fi
  fi
  if [ -s "$CACHE/polices.css" ]; then
    cp "$CACHE/polices.css" "$WWW/polices/polices.css"
    for f in $(grep -o 'url([^)]*\.woff2)' "$CACHE/polices.css" | sed 's/url(//;s/)$//'); do cp "$CACHE/$f" "$WWW/polices/$f"; done
    POLICES=1
  else
    echo "⚠ Polices non téléchargées : le jeu utilisera celles du téléphone" >&2
  fi
fi

# 4. La page : document complet (pas de mode « quirks »), ressources locales, pont Android à la fin
node - "$JEU/jeu.html" "$WWW/jeu.html" "$POLICES" <<'JS'
const fs = require('fs');
const [src, dst, polices] = process.argv.slice(2);
let h = fs.readFileSync(src, 'utf8');
h = h.replace(/<link rel="preconnect"[^>]*>\n?/g, '');
h = h.replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^"]*">/,
  polices === '1' ? '<link rel="stylesheet" href="polices/polices.css">' : '');
h = h.replace(/<script src="https:\/\/cdnjs[^"]*phaser[^"]*"><\/script>/, '<script src="vendor/phaser.min.js"></script>');
if (/https?:\/\/(cdnjs|fonts\.g)/.test(h)) { console.error('Il reste une ressource en ligne dans la page'); process.exit(1); }
fs.writeFileSync(dst, '<!doctype html>\n<html lang="fr">\n' + h.trim() + '\n<script src="android.js"></script>\n</html>\n');
JS

echo "✔ Jeu prêt dans $WWW ($(find "$WWW" -type f | wc -l) fichiers, $(du -sh "$WWW" | cut -f1))"
