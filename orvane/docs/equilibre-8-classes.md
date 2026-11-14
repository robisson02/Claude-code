# Équilibre entre les 8 classes, niveaux 1 à 200 : rapport

**En bref**
- J'ai fait **21 changements** ciblés, sans toucher à aucun niveau.
- `node outils/grimoire.js verifier` (toutes les classes) finit sans remarque : 8 fois « ok », code de sortie 0.
- Je n'ai touché ni au moteur, ni à `outils/grimoire.js`. Je n'ai pas lancé `assembler` : le `grimoire.js` de la racine n'a pas bougé. Il faudra le lancer pour que le prototype voie ces changements.
- Au Fourneau, rien ne bouge, sauf un détail. Un seul changement touche un sort de niveau 6 ou moins : le Rayon minimum du Lancer de hachoir. Le Bouchevalier niveau 6 avec déclinaisons passe de 35,8 à 36,0 %.

## Comment j'ai mesuré

**1. Calcul sans combat** (`equil8/lib.js`) :
- valeur moyenne d'un lancer, coups de maître compris, au rang du niveau visé (× 1,15 ou × 1,30) ;
- Brûlé compté une seule fois par tour ;
- conditions pondérées selon leur chance d'être vraies ;
- dégâts soutenus par tour sur une cible, avec 6 CM puis 7 CM dès le niveau 100, limites et relances respectées, meilleur tour cherché parmi toutes les combinaisons ;
- en « mono-élément » : un sort par emplacement, et seulement ceux de l'élément joué ;
- Commis non comptés : ils ne profitent pas des affinités.

**2. Essai en combat** (`equil8/haut.js`, en dehors du moteur) :
- les groupes du Fourneau, grossis : Victuailles × 5 et dégâts × 2,5 au niveau 81 ; × 10 et × 5,5 au niveau 200 ;
- Conservation des monstres mise à 0, pour ne favoriser aucun élément ;
- tout le capital dans l'élément joué (« libre » : capital partagé) ;
- 200 combats au niveau 81, 160 au niveau 200, artisan joué par l'IA du moteur.

## 1. Les 21 changements

| # | Classe, emplacement (niveau) | Sort | Avant → après | Raison |
|---|---|---|---|---|
| 1 | Pâtéladin 8B (73) | Andouille tourbillon → **Farandole d'andouilles** | 4 → 3 CM, 1 → 2 par tour, 14-17 → 12-15 (maître 15-19) | Soufflé non jouable au niveau 81 (16 dégâts par tour) ; nom trop proche de « Tourbillon de meringue » (Pâtissorcier, même genre de sort) |
| 2 | Fromagicien 6D (49) | Coup de frais | relance 2 → 0, 1 → 2 par tour, Enraciné → Ramolli | Eaudace au niveau 81 : 15 → 23 ; un Enraciné à chaque tour à 5 cases, pour une classe qui tire, bloquerait la cible pour toujours |
| 3 | Fromagicien 4D (18) | Soufflé au fromage | 4 → 3 CM, 13-17 → 10-13 | Soufflé au niveau 81 : 18 → 29 ; 4 + 3 CM ne tenaient pas dans 6 CM |
| 4 | Pâtissorcier 6D (49) | Blancs en neige | 4 → 3 CM, 1 → 2 par tour, 20-24 → 14-17 | Eaudace au niveau 81 : 22 → 34 |
| 5 | Pâtissorcier 7D (65) | Tremblement de flan | 4 → 3 CM, 13-17 → 11-14 | Terroir au niveau 81 : 20 → 33 |
| 6 | Bouchevalier 6D (49) | Mise sous vide | Eaudace → **Soufflé**, Enraciné → attire de 2 cases, 10-14 → 12-15 | Seulement 2 petits sorts Soufflé (niveaux 1 et 3) contre 4 en Eaudace. Soufflé au niveau 81 : 20 → 25. Le texte parlait déjà d'« aspirer l'air » |
| 7 | Bouchevalier 4B (10) | Barbecue | 4 → 3 CM, 12-15 → 9-12 (Brûlé gardé) | Toutes ses frappes Flambée coûtaient 4 CM, donc une seule par tour |
| 8 | Bouchevalier 8B (73) | Attendrisseur | 4 → 3 CM, 20-25 → 15-19, toujours 1 par tour (raison écrite dans le texte) | Avec le 7 : Flambée 24 → 35 au niveau 81, 41 → 65 au niveau 200 |
| 9 | Bouchevalier 4D (18) | Barbecue à l'eau | 4 → 3 CM, 1 → 2 par tour, 18-22 → 14-17 | Garder l'Eaudace jouable après le 6 : 26 → 33 au niveau 81 |
| 10 | Légumancien 15D (190) | Jus de céleri | 5 → 4 CM, 24-28 → 20-23 | Eaudace la plus faible au niveau 200 (41 → 49) ; presque une copie du Raz-de-marée (Merlanceur, même emplacement) |
| 11 | Fromagicien 8D (81) | Trou de mémoire | Rayon 2-5 → 1-5 | Aucun sort Éclair utilisable au contact (voir l'encadré) |
| 12 | Merlanceur 6B (41) | Anguille électrique | Rayon 2-6 → 1-6 | Même raison, aux niveaux 81 et 200 |
| 13 | Bouchevalier 2D (5) | Lancer de hachoir | Rayon 2-5 → 1-5 | Même raison, pour une classe de contact ; effet au Fourneau : 35,8 → 36,0 % |
| 14 | Pâtissorcier 5D (34) | Fouet survolté | lancer « libre » Rayon 2-5 modifiable → en ligne, Rayon 1-4 non modifiable ; rebond jusqu'à 3 cases au lieu de 2 | Copie exacte de Pain banni (Levainqueur, même emplacement, mêmes chiffres) |
| 15 | Légumancien 10B (104) | Racines nouées | 11-14 → 14-17 (relance 3 gardée) | Nettement sous Bien ficelé (Levainqueur, niveau 112 : 13-17, relance 0) |
| 16 | Bouchevalier 7D (65) | Laisser mariner | nappe 8-10 → 11-13 | La plus faible des nappes, sous la Coulée de raclette du niveau 7 |
| 17 | Levainqueur 9B (88) | Pétrissage | 12-16 → 14-17 | Hameçon (Merlanceur, même emplacement, même niveau, même attirance de 3 cases) portait plus loin et frappait plus fort |
| 18 | Traitreur 15B (182) | Plateau-repas → **Menu complet** | nom et texte | Trop proche des chefs-d'œuvre du Pâtéladin « le Grand Plateau » et « le Plateau d'orages » |
| 19 | Traitreur 12B (135) | Nappe retournée → **Table renversée** | nom et texte | « Nappe » est un objet du jeu (5 classes posent des nappes, état Nappé du Pâtissorcier), or ce sort n'en pose pas |
| 20 | Traitreur 12D (143) | Nappe tirée → **Chemin de table** | nom, texte, « change » | Même raison |
| 21 | Légumancien 15B (182) | Céleri-foudre → **Céleri branché** | nom et texte | Trop proche de « Coup de foudre » (Pâtissorcier, même emplacement, même élément, mêmes CM) ; son texte disait même « un coup de foudre » |

**Pourquoi les changements 11 à 13 (sorts Éclair au contact).** En jouant seulement l'Éclair, l'affinité ne donne que de l'Ouverture : rien pour quitter le contact. Or, avec le Rideau, on garde à peu près la moitié de ses CM en sortant (Faux-fuyant 5 contre Rideau 8). Une classe dont tous les sorts Éclair demandent 2 cases se retrouve donc bloquée dès qu'un monstre la touche. Dans l'essai au niveau 81 :
- Fromagicien : 73 % de pertes et 81 défaites sur 200 → 45 % et 1 défaite ;
- Merlanceur : 47 % et 32 défaites → 32 % et 4 ;
- Bouchevalier : 67 % et 32 défaites → 50 % et 7 ;
- Pâtissorcier, grâce au changement 14 : 56 % (26 défaites, 8 combats sans fin) → 36 % (3 défaites).

**Mis à jour avec les renommages :**
- le lien `declinaisonDe` et le texte « change » d'Andouillette grillée (Pâtéladin 8D) et de Plat du terroir (Traitreur 15D) ;
- le lien de Jus de céleri, qui suit le renommage de Céleri branché.

## 2. Jouer chacun des 5 éléments

Calcul sans combat : dégâts par tour sur une cible, avant → après. « Libre » = meilleur mélange d'éléments.

| Classe | 81 libre | F | E | T | S | C | 200 libre | F | E | T | S | C |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Levainqueur | 51 | 51 | 36 | 45 | 30 | 34 | 74 | 74 | 52 | 66 | 54 | 62 |
| Pâtissorcier | 43 | 38 | 22→34 | 20→33 | 24 | 28 | 63 | 57 | 51 | 58 | 38 | 53 |
| Bouchevalier | 41 | 24→35 | 26→33 | 41 | 20→25 | 25 | 66 | 41→65 | 48→50 | 54 | 48 | 44 |
| Pâtéladin | 44 | 44 | 27 | 41 | 16→27 | 30 | 61 | 53 | 56 | 52 | 44→47 | 52 |
| Fromagicien | 39 | 38 | 15→23 | 34 | 18→29 | 21 | 74 | 73 | 57 | 60 | 47 | 61 |
| Merlanceur | 38 | 38 | 33 | 32 | 23 | 26 | 65 | 60 | 46 | 46 | 45 | 56 |
| Traitreur | 47 | 32 | 27 | 27 | 32 | 38 | 77 | 56 | 53 | 54 | 46 | 77 |
| Légumancien | 40 | 28 | 28 | 34 | 28 | 24 | 62 | 58 | 41→49 | 47 | 45 | 56 |

Au niveau 81 avant les changements, 7 éléments étaient à moins de 50 % du meilleur mélange de leur classe. Il n'en reste plus.

**Essai en combat, après les changements (pertes, d = défaites, sf = sans fin) :**
- **Niveau 81 :** tous les éléments ont maintenant au plus 9 défaites sur 200, sauf le Traitreur en Soufflé (15 défaites, voir le problème 3 plus bas).
  - Éclair : Levainqueur 46 % d3, Pâtissorcier 36 % d3, Bouchevalier 50 % d7, Pâtéladin 44 % d9 sf4, Fromagicien 45 % d1 sf8, Merlanceur 32 % d4, Traitreur 23 %, Légumancien 35 % d2.
- **Niveau 200 :** chaque classe et chaque élément entre 2 et 34 %, au plus 1 défaite pour 160 combats. Il reste quelques combats sans fin : Levainqueur F sf5 et T sf3, Bouchevalier E sf7, Pâtéladin E sf6 et C sf2.

**Puissance générale.** Meilleur mélange au niveau 200, sans les Commis : de 61 (Pâtéladin) à 77 (Traitreur), soit environ ±12 %. Cet écart va avec les rôles : les classes de soin en dessous, Traitreur, Levainqueur et Fromagicien au-dessus. Le Levainqueur et le Légumancien ont en plus leurs Commis.

## 3. À niveau égal : ce que j'ai repéré sans le changer

- **Flambée :** les sorts sont plus forts par CM (Brûlé, coups de maître) dans toutes les classes, de la même façon. C'est le rôle de l'élément.
- **Éclair avec rebond :** famille régulière d'une classe à l'autre. La Croûte cendrée et le Mont-d'or brûlant (Fromagicien) ne sont forts qu'une fois la cible affinée depuis 3 tours.
- **Sorts réglés pour le Fourneau, faibles à tous les niveaux :** Chou-chou, Bleu d'orage, Bleu marine, Éclat d'écaille, Croc de boucher, Palet de chèvre. Je les ai laissés : les toucher casserait les mesures au Fourneau.
- **Le Traitreur** a pour meilleur sort au niveau 200 son sort du niveau 1, la Pique-olive. Laissé tel quel pour la même raison.
- **Brest-Paris** frappe peu, mais pousse de 4 cases : l'Écrasement compense. Laissé tel quel.
- **Gabarits très proches** (liste de briques fermée), différents par le Rayon ou par l'effet en plus, laissés tels quels : Bâtard rassis et Prise de terrine, Hameçon et Petits-fourbes, Flambée minute et Patate chaude, la Criée et la Grande Récolte.

## 4. Identité des classes, rôle des éléments, noms

- **Identité :** chaque classe a sa mécanique dans les emplacements 1 à 3, et ses Rayons suivent son rôle : Pâtissorcier, Fromagicien, Merlanceur et Légumancien tirent ; les autres vont au contact.
- **Rôle des éléments :** respecté. Il n'y a que 7 effets d'un autre élément, et tous ont une raison :
  - les gains de CM des pièges du Buffet (Traitreur), c'est leur mécanique ;
  - le −2 CM de Pain perdu, un sort Eaudace.
- **Noms :** 5 renommages (tableau plus haut). Proximités que j'ai gardées : « Croûte » (Levainqueur, Fromagicien, Pâtéladin), « Pièce » (Pâtissorcier, Bouchevalier), « Brest » (Pâtissorcier, Merlanceur), « Saut » (Bouchevalier, Merlanceur).
- **Une confusion hors classes :** le Commis « Mitron » du Levainqueur (niveau 167) et le monstre « Mie-tron », avec le groupe « le chef et son mitron ».

## 5. Simulations finales au Fourneau (400 combats, graine 1)

| Classe | N6 base : défaites / sans fin / pertes | N6 déclinaisons : défaites / sans fin / pertes | Graine 1001 (base / décl.) |
|---|---|---|---|
| Levainqueur | 0 / 0 / 30,8 % | 0 / 0 / 38,5 % | 30,4 / 39,2 % |
| Pâtissorcier | 0 / 0 / 31,1 % | 0 / 0 / 38,0 % | 31,1 / 37,4 % |
| Bouchevalier | 0 / 0 / 31,6 % | 2 / 0 / 36,0 % | 32,3 / 36,4 % |
| Pâtéladin | 0 / 0 / 33,2 % | 0 / 0 / 35,0 % | 31,8 / 34,6 % |
| Fromagicien | 1 / 0 / 33,3 % | 2 / 0 / 32,0 % | 32,2 / 33,4 % (12 défaites) |
| Merlanceur | 4 / 0 / 31,2 % | 5 / 0 / 33,2 % | 32,3 / 32,6 % |
| Traitreur | 0 / 0 / 33,5 % | 0 / 0 / 34,6 % | 33,7 / 34,6 % |
| Légumancien | 0 / 0 / 33,3 % | 0 / 0 / 35,9 % | 32,7 / 35,5 % |

- Les 16 mesures sont dans la cible (30 à 40 %), sans aucun combat sans fin.
- Niveau 2, pour information : de 36,9 à 38,7 % de pertes.
- Les 12 défaites du Fromagicien avec déclinaisons à la graine 1001 existaient déjà avant mes changements. Ses sorts jusqu'au niveau 6 sont identiques à la version d'avant.

## 6. Problèmes du moteur, de l'IA et des outils

1. **simule.js plante à haut niveau** avec « capital dépassé ».
   - Cause : `affinitesParDefaut` répartit 5 × (niveau − 1) points comme s'ils étaient des valeurs d'affinité, sans compter que le point coûte 2 au-delà de 80, puis 3 au-delà de 160.
   - Reproduction : `node moteur/simule.js 10 verif/grimoire/levainqueur-sorts.json --classe=levainqueur --niveau=90` donne « capital dépassé (570 points pour 445) ».
   - Premier niveau en erreur : 40 pour le Merlanceur ; 50 pour le Levainqueur, le Pâtissorcier, le Bouchevalier et le Fromagicien ; 66 pour le Pâtéladin et le Légumancien ; 82 pour le Traitreur.
   - Contournement : `--affinites=F:80,T:80,E:56`.
2. **L'IA prend d'abord les dégâts.** Quand un sort coûte moins cher, l'IA remplit ses CM de dégâts et ne pose plus de bouclier.
   - Fromagicien en Soufflé au niveau 81 : 12 → 25 % de pertes (il tue plus vite, mais ne pose plus Petit-lait).
   - Bouchevalier en Soufflé : 40 → 43 %.
   - Ce n'est pas une perte de puissance : un joueur choisirait.
3. **Les pièges ne sont jamais posés par l'IA** (problème déjà signalé). Le Traitreur en Soufflé au niveau 81 n'a alors aucun sort au contact : 15 défaites sur 200.
4. **Blocages entre deux « tireurs »** (`iaPlacementFinal`, déjà signalés) : ce sont eux qui donnent les combats sans fin de l'essai.
5. **Choix automatique « tire » ou « colle »** (déjà signalé) : le Bouchevalier au Terroir, au niveau 200, est joué en tireur à cause d'Os à ronger (Rayon 4).

## 7. Ce qui restera à mesurer avec des monstres de plus haut niveau

1. **Affinités secondaires très inégales en solo.**
   - En Eaudace seule : +106 Victuailles au niveau 81, +205 au niveau 200. C'est le meilleur élément de l'essai.
   - L'Ouverture de l'Éclair ne sert presque à rien.
   - En Terroir seul : +41 de Rideau. En Soufflé seul : +41 de Faux-fuyant.
   - Ce sont des constantes validées (décision 5), mais à revoir avec de vrais monstres.
2. **Se spécialiser rapporte beaucoup.**
   - Un seul élément : × 3,1 sur les dégâts au niveau 81, × 5,1 au niveau 200.
   - Capital partagé entre 5 éléments : × 1,8 et × 2,4.
3. **Ce qui ne profite pas des affinités** devient plus faible en montant :
   - le Brûlé (5 par couche, fixe) ;
   - l'Écrasement (12 + niveau ÷ 4) ;
   - les Commis (× (1 + niveau ÷ 120)) : Mitron, radis, Chou-fleur carnivore, Chou-marin.
   - Il faudra mesurer aussi combien de temps les Commis survivent.
4. **Groupes de 3 monstres ou plus :** valeur des rebonds, des zones et des chefs-d'œuvre qui touchent tout le terrain. Mon calcul suppose une seule cible.
5. **Monstres avec plus de CM :** valeur des retraits de CM (Trou de mémoire, Hameçonnage, Fine lame, Cervelas, Coup de foudre, Pain perdu). Contre les monstres du Fourneau (4 ou 5 CM), ils ne servent presque à rien.
6. **Enraciné à chaque tour à 4 cases ou plus** : Charlotte (Pâtissorcier), Bien ficelé (Levainqueur). Une classe qui tire pourrait bloquer un monstre de contact sans fin.
7. **Grandes poussées contre les murs :** Brest-Paris (4 cases), Raie-pulsion et Jambon de pays (3 cases).
8. **Valeur des soins et des boucliers** du Pâtissorcier et du Pâtéladin : l'IA les sous-estime.
9. **7 CM à partir du niveau 100 :** il faut des sorts qui s'assemblent (3 + 4, 5 + 2).
10. **Chefs-d'œuvre sur une cible**, Plateau d'orages (Pâtéladin) et Coup de feu (Traitreur), face à de vrais boss.

## Fichiers

Grimoires modifiés, et leurs fichiers aplatis `-sorts.json` refaits pour les 8 classes : `verif/grimoire/<classe>.json`

Dans `equil8/` :
- `avant/` : copie d'avant de tous les grimoires ;
- `appliquer.js` : refait les 21 changements à partir de la copie (le journal est dans `journal.json`) ;
- outils de calcul : `lib.js`, `elements.js`, `parslot.js`, `frappes.js`, `doublons.js`, `roles.js`, `roles2.js`, `portees.js`, `meilleur.js` ;
- essai en combat : `haut.js`, `matrice.sh`, `montre.js` ; résultats bruts dans `m81-*.jsonl` et `m200-*.jsonl` ;
- mesures au Fourneau : `tableau.sh`, résultats dans `final-g1.txt` et `final-g1001.txt`.
