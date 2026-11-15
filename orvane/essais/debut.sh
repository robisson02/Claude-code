#!/bin/bash
# Combats du début (niveaux 1 et 3) au doigt : durée réelle (« Envoyez ! » → Addition) ; même boucle que la fin de finales.sh.
cd "$(dirname "$0")"
mkdir -p debut
for x in "patissorcier f 1 grumeaux" "levainqueur h 3 chef-seul" "pateladin h 1 mie-et-pate" "traitreur f 3 grumeaux" "fromagicien f 1 chef-seul" "bouchevalier h 3 mie-et-pate"; do
  set -- $x
  rm -rf debut/tmp-$1 && mkdir -p debut/tmp-$1
  timeout 600 node partie.js tel $1 $2 $3 $4 "$PWD/debut/tmp-$1" debut-$1 > debut/$1.log 2>&1
  echo "$1 niveau $3 contre $4 : $(grep -E 'DURÉE DU COMBAT|console :' debut/$1.log | tr '\n' ' ')"
done
