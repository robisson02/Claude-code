# Correcteur Réel : prototype de moteur de correction pour clavier de téléphone

Un correcteur français pensé pour un clavier de téléphone (cible : Samsung Galaxy S24, Android), qui :

- **corrige l'orthographe pendant la frappe** : accents oubliés (`reel` → `réel`, `tres` → `très`, `ca` → `ça`),
  apostrophes et traits d'union (`aujourdhui` → `aujourd'hui`), fautes de frappe selon la disposition **AZERTY**
  (`bonjoue` → `bonjour`, le `e` est à côté du `r`) ;
- **corrige la grammaire courante** : a/à, ou/où, la/là, sur/sûr, ça/sa, c'est/ces, se/ce, et/est,
  accord du verbe avec le pronom sujet (`ils mange` → `ils mangent`), participe ou infinitif
  (`j'ai manger` → `j'ai mangé`, `je vais mangé` → `je vais manger`) ;
- **apprend votre façon d'écrire sans jamais apprendre une faute** : vos prénoms, votre argot, vos abréviations
  deviennent valides, mais une forme sans accent d'un mot existant (`reel`) reste une faute, même tapée cent fois.

Tout est en JavaScript sans dépendance : le même moteur tourne dans Node.js (tests, ligne de commande) et dans
le navigateur du téléphone (démo).

## Essayer

**Dans le navigateur du téléphone** : ouvrez `demo.html`. En local, depuis ce dossier :

```sh
python3 -m http.server 8000
# puis http://localhost:8000/demo.html (ou http://<ip-de-l-ordinateur>:8000/demo.html depuis le téléphone)
```

La page simule un champ de saisie : chaque espace déclenche la correction du mot, puis la relecture grammaticale.
Touchez <kbd>⌫</kbd> juste après une correction pour l'annuler, comme sur un téléphone. Le panneau
« Ce que le clavier a retenu » montre les mots appris, ceux en observation et ceux qui ne seront jamais appris.

**En ligne de commande** :

```sh
node outils/corriger.mjs "je vais a paris, c'est tres reel. j'ai manger et ils mange. ou est le telephonne ?"
# je vais à paris, c'est très réel. j'ai mangé et ils mangent. où est le téléphone ?
```

**Tests** (Node.js 18 ou plus récent, aucune installation) :

```sh
npm test
```

Les tests vérifient notamment qu'**aucune des 106 phrases correctes** du jeu d'essai n'est modifiée, et que
« reel » n'est jamais appris, même après dix annulations.

## Comment ça marche

### 1. Correction d'un mot (`src/moteur.js`, `src/clavier.js`)

- Le **dictionnaire de référence** (`data/lexique-fr.tsv.gz`) contient 142 000 formes françaises validées, avec leur
  fréquence d'usage, leur catégorie (nom, verbe…), leur genre, leur nombre et leur conjugaison.
- Chaque mot est ramené à une **clé** sans accents, sans apostrophe ni trait d'union : `réel` → `reel`.
  Si ce que vous tapez a la clé d'un mot existant, seuls les accents manquent : la faute est certaine et
  corrigée d'office.
- Sinon, le moteur cherche les mots à une ou deux fautes de frappe près. Une **touche voisine** sur le clavier
  AZERTY, une lettre doublée ou deux lettres inversées coûtent moins cher qu'une lettre au hasard.
- Les candidats sont classés par fréquence, par **vos habitudes** et par le **contexte** : après « la », un nom
  féminin ; après « ils », un verbe à la 3ᵉ personne du pluriel ; après « est », un participe (`un eleve` →
  `un élève`, mais `il est eleve` → `il est élevé`).
- Un mot valide mais rare est remplacé par sa version accentuée quand celle-ci est environ 20 fois plus
  probable dans le contexte (`la foret` → `la forêt`, mais `tu invites` reste tel quel).
- Prudence : un mot inconnu avec majuscule en milieu de phrase (probablement un nom) est suggéré, jamais
  imposé ; une abréviation courte (`jsp`) n'est jamais remplacée par un mot rare.

### 2. Apprentissage protégé (`src/profil.js`)

Le profil sépare **ce qui est valide** (dictionnaire + mots appris) de **ce qui est fréquent pour vous**
(qui ne sert qu'à classer les suggestions).

| Situation | Ce que fait le clavier |
|---|---|
| Forme sans accent, apostrophe ou trait d'union d'un mot existant (`reel`, `tres`, `aujourdhui`) | **Jamais apprise**, même après des annulations. Seul un ajout manuel explicite et confirmé l'autorise (« un reel Instagram »). |
| Mot inconnu qui ressemble à une faute de frappe (`mdr`, corrigé en `mer`) | Appris après **2 annulations** de la correction. |
| Mot inconnu sans correction évidente (`chelou`) | Appris après **3 usages dans 2 contextes** différents. |
| Nom propre (majuscule en milieu de phrase) | Appris après **2 usages**. |
| Ajout manuel, contact | Appris tout de suite. |
| Champ de mot de passe, navigation privée | Rien n'est appris. |

Une fois un mot appris, oublier son accent est corrigé vers votre écriture (`Maelou` → `Maëlou`).

### 3. Grammaire (`src/grammaire.js`)

Des règles locales examinent chaque mot et ses voisins dans la même proposition. Chacune donne une
**confiance** : `haute` (le clavier corrige seul) ou `moyenne` (souligné, proposé). Les règles privilégient
la précision : dans le doute, elles ne disent rien. Pendant la frappe, elles attendent la suite quand elle
est nécessaire (`il est la` n'est corrigé en `là` qu'une fois la phrase terminée).

## Organisation

```
correcteur/
├── demo.html                  démo pour le navigateur du téléphone
├── src/
│   ├── moteur.js              Correcteur : analyse d'un mot, suggestions, événements du clavier, texte entier
│   ├── profil.js              apprentissage protégé, sauvegarde
│   ├── grammaire.js           règles de grammaire contextuelles
│   ├── lexique.js             dictionnaire et analyse (catégories, conjugaisons)
│   ├── clavier.js             disposition AZERTY, distance de frappe
│   ├── texte.js               normalisation, découpage en mots
│   ├── mots.js                petites classes de mots (pronoms, déterminants…)
│   └── node.js                chargement du dictionnaire dans Node.js
├── data/
│   ├── lexique-fr.tsv.gz      dictionnaire dérivé de Lexique 3.83
│   └── complements.tsv        formes élidées (j', qu'…), mots récents, prénoms courants
├── scripts/construire-lexique.mjs   régénère data/lexique-fr.tsv.gz depuis Lexique383.tsv
├── outils/corriger.mjs        correction en ligne de commande
└── test/                      tests (node --test)
```

## Limites connues

- Ce n'est pas encore un clavier : c'est le moteur qu'un clavier appellera à chaque mot.
- La grammaire couvre les erreurs les plus fréquentes, pas tout : pas d'accord des adjectifs, ni du participe
  passé avec le complément placé avant (« les pommes que j'ai mangées »), ni des cas comme « ces/ses » en
  général.
- Le dictionnaire date de 2018 et ignore l'argot récent et la plupart des noms propres : c'est à
  l'apprentissage de les ajouter.

## Étapes suivantes

1. **Clavier Android** : partir de [HeliBoard](https://github.com/Helium314/HeliBoard), clavier libre dérivé de
   celui d'Android, et y brancher ce moteur, soit en le portant en Kotlin, soit tel quel via
   `androidx.javascriptengine`.
2. **Grammaire complète** : intégrer [Grammalecte](https://grammalecte.net/), correcteur français libre, pour les
   accords et les cas que les règles actuelles ne couvrent pas.
3. Enrichir le dictionnaire (prénoms, mots récents) et ajuster les seuils avec de vrais textes tapés.

## Données

`data/lexique-fr.tsv.gz` est dérivé de **Lexique 3.83** (Boris New, Christophe Pallier et al.,
[lexique.org](http://www.lexique.org)), distribué sous licence
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.fr) ; le fichier dérivé est distribué sous la
même licence. Pour le régénérer : `npm run construire-lexique -- chemin/vers/Lexique383.tsv`.
