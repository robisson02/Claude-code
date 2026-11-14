# Orvane : le contrat commun (règles de combat + format des sorts)

Ce fichier fait foi. Les règles détaillées sont dans la partie 3 du rapport
`../verif/t8/recherche-dofus.md` ; ce contrat les reprend et les CORRIGE avec les décisions de l'utilisateur.
En cas de désaccord entre le rapport et ce fichier, ce fichier gagne.

## 1. Décisions de l'utilisateur (14 novembre 2026)

1. Rideau (tacle) : formule du rapport (part gardée = (Faux-fuyant + 5) / (2 × Rideau + 5), parts multipliées).
   MISE À JOUR du 14 novembre (décision de l'utilisateur) : **il n'y a PAS de minimum garanti**. On peut rester pris au contact :
   en quittant une case au contact, Pas restants = arrondi(Pas × part gardée) et CM restants = arrondi(CM × part gardée) ;
   si les Pas restants sont 0, on ne peut pas sortir (le déplacement est refusé avec la raison « Pris dans le Rideau » et
   l'aperçu le montre avant). Faux-fuyant ≥ 2 × Rideau ou l'état Glissant : sortie sans perte. Cette règle remplace « au moins 1 Pas gardé » du rapport (§3.7).
2. **Les zones de dégâts ne touchent JAMAIS les alliés** (ni le lanceur). Une zone de dégâts touche les ennemis ; une zone de soutien touche les alliés. Le champ `touche` vaut donc "ennemis" pour tout sort qui fait des dégâts, "allies" pour un sort de soutien. ("tous" n'existe plus.)
3. **Le soin est réservé au Pâtissorcier et au Pâtéladin** (brique `soin`, sur soi ou sur un allié). Aucune autre classe n'a de brique `soin`. Les autres se soignent avec le « Pain de route » du Sac : objet, 2 CM, 1 fois par tour, soigne 12 + 2 × niveau / 10 (arrondi bas), 3 par combat.
4. **Minuteur : 45 secondes par tour**, sans report du temps non utilisé. En solo il est actif par défaut et désactivable. Trois tours passés d'affilée font quitter le service en groupe seulement ; en solo, le Minuteur passe le tour et rien de plus (choix fait après les essais du prototype : sur téléphone, on peut être interrompu).
5. Effets secondaires des affinités (VALIDÉS par l'utilisateur, à garder dans une table de constantes) : Terroir → Rideau (+1 par 10 points), Soufflé → Faux-fuyant (+1 par 10), Éclair → Ouverture (+2 par point), Flambée → Coup de maître (+1 % par 20 points), Eaudace → Victuailles (+1 par 2 points).
6. +1 CM au niveau 100. Chef-d'œuvre au niveau 200 (et sa déclinaison aussi au niveau 200).
7. Phaser pour le prototype et le vrai jeu, le plus possible.
8. **Un rôle par élément, commun à toutes les classes** :
   - Flambée (F) : les gros coups et les dégâts qui durent (état Brûlé, fournées, coups de maître) ;
   - Eaudace (E) : ralentir (Ramolli, retraits de Pas, Enraciné) ;
   - Terroir (T) : les coups au sol et les poussées (poussée, Écrasement, Planté, poses au sol) ;
   - Soufflé (S) : le placement et les zones (attirance, bonds, échanges, zones larges, Glissant) ;
   - Éclair (C) : les rebonds et la vitesse (rebond, gain de CM, Ouverture, Dérobé).
   Chaque classe garde des sorts dans les CINQ éléments (l'élément appartient au sort, jamais à la classe).
   Pour qu'on puisse jouer un seul élément, ce qui compte est le nombre d'emplacements qui offrent cet élément
   (le sort de base OU sa déclinaison) : voir les seuils du §4. Une déclinaison peut garder l'élément de son sort
   quand l'usage change franchement, mais la couverture des éléments passe d'abord.
9. Déblocages étalés jusqu'au niveau 200, chaque déclinaison entre son sort et le suivant. Niveaux FIXES (emplacement : sort de base, déclinaison) :
   1 : 1, 3 · 2 : 1, 5 · 3 : 1, 7 · 4 : 10, 18 · 5 : 26, 34 · 6 : 41, 49 · 7 : 57, 65 · 8 : 73, 81 ·
   9 : 88, 96 · 10 : 104, 112 · 11 : 120, 128 · 12 : 135, 143 · 13 : 151, 159 · 14 : 167, 175 · 15 : 182, 190 · 16 : 200, 200.
   La première déclinaison (niveau 3) s'ouvre par une quête de l'Astrelier, « Décliner sa première recette ».
   Rangs : un sort passe au rang 2 cinquante niveaux après son déblocage, au rang 3 cent niveaux après (plafonné à 200) :
   rang 2 = dégâts, soins et boucliers × 1,15 ; rang 3 = × 1,30 et relance − 1 (minimum 0). Règle générique, pas de données par sort.
10. Les sorts des emplacements 1 à 3 (et leurs déclinaisons) sont réécrits classe par classe pour donner une identité
    dès le niveau 1 : la mécanique de classe est présente dès les emplacements 1 à 3 ; des Rayons qui disent le rôle ;
    des déplacements différents selon la classe.
11. **Les points de caractéristique se placent librement** (décisions du 14 novembre) : les 5 points par niveau vont où le joueur veut, point par point, dans les affinités Flambée, Eaudace, Terroir, Soufflé et Éclair et dans les Victuailles (« vitalité ») : rien n'est bridé (1 point dans chaque élément, ou 1 en Victuailles, 2 en Terroir et 2 en Flambée…). Plus de points en Savoir-faire (bonus d'XP) : il ne vient que de l'équipement, le jeu passe toujours `capital.savoirFaire = 0`. Le but conseillé, jamais imposé, est de choisir 1 ou 2 éléments. « Répartir pour moi » (prototype et simulation) : l'élément le plus présent parmi les sorts de dégâts équipés, plus le 2e s'il a au moins la moitié de ses sorts ; points dépensés à tour de rôle au coût réel des paliers, rien en Victuailles.
12. **Des combats plus courts au début** (décision du 14 novembre : « réduis simplement la vie des monstres de 30 à 40 % ») : les Victuailles des monstres du Fourneau baissent de 35 % (Grumeau 52 → 34, Mie-tron 40 → 26, Grumeau chef 66 → 43) ; rien d'autre ne change (sorts, dégâts, XP, Blé). Mesure (400 combats × 80 cas, niveaux 1 à 6, IA du moteur) : 5,4 → 4,0 manches en moyenne ; Victuailles perdues 36 → 22 % ; défaites de 0,5 à 0,1-0,2 %.
13. **Une seule fournée par case** (décision du 14 novembre) : poser une fournée qui cuit (tours > 0) sur une case qui en porte déjà une, de n'importe quel camp, est refusé (« Il y a déjà une fournée ici ») ; une fournée qui éclate tout de suite (tours 0) n'est pas concernée. Effet mesuré sur l'équilibre : négligeable (Levainqueur +0,05 manche).

## 2. Règles (rappel des points qui changent par rapport au rapport)

- Rapport §3.4 ordre alterné par Ouverture : inchangé. §3.5 Minuteur : 45 s fixes (décision 4).
- Rapport §3.12 zones : `touche` vaut "ennemis" ou "allies" (décision 2) ; baisse de 15 % par case d'éloignement, 3 fois au plus.
- Rapport §3.10 barème des limites : inchangé (frappes à 2 CM : 3 par tour, 2 par cible ; 3 CM : 2/1 ; 4 CM et plus : 1/1 ; zone de dégâts : 2/1 ; soin, bouclier : 1/1, relance 2 ; bond, échange : 1, relance 2 ; retrait : 2/1 ; pose : 2, plafondPose 3 ; bonus : 1, relance 3 ; Commis : 1, relance 4, relanceInitiale 1 ; chef-d'œuvre : 1, relance 5, relanceInitiale 2). Un sort peut s'en écarter s'il a une raison (à dire dans `texte` ou `change`).
- Coup d'outil : chaque classe a son outil (donnees.js, champ `outil`), qui donne une attaque « Coup d'outil » (rapport §2 point 15) : défini dans `moteur/outils.js`.

## 3. Le format d'un sort (objet JSON)

```
{
  "id": "levainqueur.mie-raille",          // classe + "." + nom en minuscules sans accents, tirets
  "classe": "levainqueur", "emplacement": 2, // 1 à 16
  "declinaisonDe": null,                     // ou l'id du sort de base
  "niveau": 1, "nom": "Mie-raille", "element": "F",   // F E T S C N
  "cm": 2,                                   // 1 à 7 ; 7 seulement au niveau 100 et plus
  "rayon": { "min": 2, "max": 6, "modifiable": true },
  "lancer": "libre",                         // libre | ligne | diagonale | ligne+diagonale
  "vue": true,                               // ligne de vue demandée
  "cible": "combattant",                     // ennemi | allie | combattant | caseLibre | case | soi
  "parTour": 3, "parCible": 2, "relance": 0, "relanceInitiale": 0, "plafondPose": 0,
  "maitre": 10,                              // taux de coup de maître du sort, 0 à 25 (0 si aucun dégât ni soin)
  "zone": { "forme": "case", "taille": 0, "tailleMin": 0, "baisse": true },
  "touche": "ennemis",                       // ennemis | allies
  "effets": [ { "type": "degats", "element": "F", "min": 10, "max": 14, "maitre": [13, 17] } ],
  "texte": "Une volée de miettes brûlantes.",   // ambiance, jeu de mots ; jamais lu par le moteur
  "change": ""                               // pour une déclinaison : ce qui change, en une phrase
}
```
Formes de zone : case (taille 0) | croix | rond | anneau | ligne | travers | cone | demi-rond | carre | terrain.

Briques d'effet (liste FERMÉE ; le moteur les implémente toutes) :
- `{type:"degats", element, min, max, maitre:[min,max]}` : l'élément d'une brique de dégâts est celui du sort (sauf N interdit pour des dégâts : un sort N ne fait pas de dégâts).
- `{type:"soin", min, max, maitre:[min,max]}` : Pâtissorcier et Pâtéladin seulement.
- `{type:"bouclier", valeur, tours, couchesMax}`
- `{type:"pousse", cases}` · `{type:"attire", cases}` · `{type:"ramene", cases}` (attire un allié vers soi)
- `{type:"bond"}` (le lanceur va sur la case visée, libre) · `{type:"echange"}` (lanceur ↔ cible) · `{type:"dans-le-dos"}` (le lanceur passe derrière la cible)
- `{type:"etat", etat, tours, couches}` ; états (liste fermée) : brule, ramolli, enracine, plante, glissant, derobe, nappe, fume, attendri, affine, feve, maree-haute, maree-basse
- `{type:"retire", quoi:"cm"|"pas", n}` (garanti, plafond 2 CM et 2 Pas entre deux tours de la cible)
- `{type:"bonus", carac, valeur, tours, qui:"soi"|"allies"|"cible"}` ; carac : levure | rayon | pas | cm | conservation | coupDeMaitre | rideau | fauxFuyant | ouverture | degatsPct
- `{type:"gainCM", n, qui:"soi"|"allies"}`
- `{type:"entame", part, tours}` (porte l'Entame de la cible à `part` %, pour le Tranchant du Bouchevalier)
- `{type:"rebond", fois, rayon, part}` (les dégâts du sort rebondissent `fois` fois sur l'ennemi le plus proche à `rayon` cases au plus, à `part` % de la valeur)
- `{type:"renforce", quoi, valeur, tours, fois}` ; quoi = id de sort, "element:F", "famille:fournee"… ; valeur en % ; fois = nombre de lancers concernés (0 = tous pendant `tours`)
- `{type:"si", condition, effets:[…]}` ; conditions : cibleBlessee (moins de 50 % de Victuailles), dansLeDos, auContact, cibleAffinee (paramètre `n`), mareeHaute, mareeBasse, buffetComplet (3 pièges posés), cibleTombe (après les dégâts du sort)
- `{type:"pose", quoi:"nappe"|"piege"|"fournee"|"graine"|"ustensile", tours, declenche:"debut"|"entree"|"fin" (nappe), zone, touche, maitre, effets:[…], victuailles (ustensile, fournée qui occupe sa case), commis (fiche, pour une graine)}`
- `{type:"invoque", commis:{nom, victuailles, cm, pas, ouverture, rideau, fauxFuyant, sorts:[sorts au même format, sans emplacement]}}`

Mécaniques de classe dans ce format : Fournée = `pose` "fournee" ; Glaçage = `bouclier` + état nappe (3 couches) ; Tranchant = `entame` ;
Fumage = `pose` "nappe" avec état fume ; Affinage = état affine + `si` cibleAffinee ; Marée = états maree-haute / maree-basse
(alternent d'eux-mêmes à chaque tour du Merlanceur, gérés par le moteur) ; Buffet = `pose` "piege" (plafondPose 3) + `si` buffetComplet ;
Potager = `pose` "graine" qui devient un Commis.

## 4. Seuils vérifiés par programme (par classe)

- Niveaux exacts du §1 décision 9 ; noms uniques dans la classe et dans tout le jeu ; noms des emplacements 16 qui commencent par « Chef-d'œuvre ».
- Couverture d'un élément au niveau L = nombre d'emplacements dont le sort de base OU la déclinaison, débloqué au niveau L, contient une brique `degats` de cet élément (y compris dans une pose, un `si`, un Commis).
  Seuils : au niveau 34, chaque élément ≥ 1 ; au niveau 81, chaque élément ≥ 2 ; au niveau 200, chaque élément ≥ 4, et au moins 3 éléments ≥ 5.
- Aucune brique `soin` hors Pâtissorcier et Pâtéladin.
- Tout sort qui fait des dégâts a au moins une limite (parTour > 0, parCible > 0 ou relance > 0) et `touche` = "ennemis".
- 7 CM seulement au niveau 100 et plus. `maitre` = 0 si le sort ne fait ni dégâts ni soin.
- Un sort N ne contient aucune brique `degats`.

## 5. Ajouts validés après l'écriture du moteur (14 novembre)

- Pose de fournée : champ facultatif `cuitTout: true` (le chef-d'œuvre fait cuire d'un coup toutes les fournées du lanceur).
- État brûlé : champ facultatif `valeur` sur la brique `etat` (Victuailles perdues par couche au début du tour ; 5 par défaut), 3 couches au plus.
- Pose d'Ustensile : champ facultatif `nom`.
- Un allié poussé ou heurté ne prend jamais d'Écrasement (décision 2).
- Attendri : −10 % de Conservation à 1 couche, −15 % à 2 couches.
