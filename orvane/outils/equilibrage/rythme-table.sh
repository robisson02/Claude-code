#!/bin/bash
# usage : rythme-table.sh N graine -> durée et pertes, niveaux 1 à 6 (base et déclinaisons) puis 10 et 26
cd "$(dirname "$0")/../.."
N=${1:-400}; G=${2:-1}
for c in levainqueur patissorcier bouchevalier pateladin fromagicien merlanceur traitreur legumancien; do
  for m in 1: 2: 3: 3:--declinaisons 4: 4:--declinaisons 5: 5:--declinaisons 6: 6:--declinaisons 10:--declinaisons 26:--declinaisons; do
    niv=${m%%:*}; d=${m#*:}
    ( out=$(node moteur/simule.js $N verif/grimoire/$c-sorts.json --classe=$c --niveau=$niv $d --graine=$G 2>&1)
      v=$(echo "$out" | grep -m1 '^Victoires' | sed -E 's/Victoires : ([0-9]+).*défaites : ([0-9]+).*sans fin \(60 manches\) : ([0-9]+)/\2 \3/')
      p=$(echo "$out" | grep -m1 'tous combats' | sed -E 's/.*tous combats \(défaite = 100 %\) : ([0-9,]+) %.*/\1/')
      du=$(echo "$out" | grep -m1 '^Durée' | sed -E 's/Durée : ([0-9,]+) manches.*/\1/')
      printf "%s\t%s\t%s\t%s\t%s\t%s\n" $c $niv "${d:+decl}" "$du" "$p" "$v" ) &
  done
  wait
done
