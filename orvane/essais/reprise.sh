#!/bin/bash
cd "$(dirname "$0")"
node tuto-scenarios.js > scenarios.log 2>&1; grep -E "^  (!!|ÉCHEC)" scenarios.log; echo "scénarios du tutoriel : $(grep -c '  OK' scenarios.log) OK, $(grep -c '  !!' scenarios.log) !!"; tail -2 scenarios.log
node verif.js > verif.log 2>&1; echo "robustesse (passe 5) : $(grep -c '^OK' verif.log) OK, $(grep -c '^ÉCHEC' verif.log) échec(s)"; grep "^ÉCHEC" verif.log
node partie.js tel merlanceur h 26 grumeaux "$PWD/partie-tel" tel > partie-tel.log 2>&1; node partie.js ordi levainqueur h 26 grumeaux "$PWD/partie-ordi" ordi > partie-ordi.log 2>&1
grep -E "DURÉE|durée|ERREUR|tour de l" partie-tel.log partie-ordi.log
echo FINI
