#!/bin/bash
# Passe 7 : tous les essais après les corrections (îles et voyages, défauts signalés, tutoriel, robustesse, parties, moteur).
cd "$(dirname "$0")"
R=..
node verif-iles.js > verif-iles.log 2>&1 && head -1 verif-iles.log                       # les plans des îles et la carte du pont (moteur)
ZONE=voie-lactee node simule-pont.js 300 grimoire-plat.json --classe=levainqueur --niveau=2 | grep -E "^Victoires|perdues, vic"
node voyages.js > voyages.log 2>&1; echo "voyages : $(grep -c '^OK' voyages.log) OK, $(grep -c '^ÉCHEC' voyages.log) échec(s)"; grep -E "^ÉCHEC" voyages.log
node defauts.js > defauts.log 2>&1; tail -1 defauts.log; grep -E "^ÉCHEC" defauts.log
node tuto-debutant.js > tuto-tel.log 2>&1; node tuto-debutant.js --ordi > tuto-ordi.log 2>&1
grep -E "État final|proposée|Console" tuto-tel.log tuto-ordi.log
node tuto-scenarios.js > scenarios.log 2>&1; grep -E "^  (OK|!!|ÉCHEC)" scenarios.log | grep -v "  OK" ; echo "scénarios du tutoriel : $(grep -c '  OK' scenarios.log) OK"
node verif.js > verif.log 2>&1; echo "robustesse (passe 5) : $(grep -c '^OK' verif.log) OK, $(grep -c '^ÉCHEC' verif.log) échec(s)"; grep "^ÉCHEC" verif.log
mkdir -p partie-tel partie-ordi
node partie.js tel merlanceur h 26 grumeaux "$PWD/partie-tel" tel > partie-tel.log 2>&1; node partie.js ordi levainqueur h 26 grumeaux "$PWD/partie-ordi" ordi > partie-ordi.log 2>&1
grep -E "DURÉE|console" partie-tel.log partie-ordi.log
(node scen-moteur.js > scen-moteur.log 2>&1; echo "scen-moteur : code $?"; tail -3 scen-moteur.log)
(cd $R && node moteur/tests.js | tail -1 && node moteur/tests-adverses.js | tail -1)
