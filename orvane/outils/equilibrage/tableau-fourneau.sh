#!/bin/bash
# usage : tableau.sh [N] [graine] [classes...]
cd "$(dirname "$0")/../.."
N=${1:-400}; G=${2:-1}; shift 2
CL=${@:-levainqueur patissorcier bouchevalier pateladin fromagicien merlanceur traitreur legumancien}
for c in $CL; do
  node outils/grimoire.js aplatir $c >/dev/null
  for m in "2:" "6:" "6:--declinaisons"; do
    niv=${m%%:*}; d=${m#*:}
    ( out=$(node moteur/simule.js $N verif/grimoire/$c-sorts.json --classe=$c --niveau=$niv $d --graine=$G)
      v=$(echo "$out" | grep -m1 '^Victoires' | sed -E 's/Victoires : ([0-9]+).*défaites : ([0-9]+).*sans fin \(60 manches\) : ([0-9]+)/\1 \2 \3/')
      p=$(echo "$out" | grep -m1 'tous combats' | sed -E 's/.*tous combats \(défaite = 100 %\) : ([0-9,]+) %.*/\1/')
      printf "%-13s n%s %-4s  V/D/SF %-12s perte %s\n" $c $niv "${d:+decl}" "$v" "$p" ) &
  done
  wait
done
