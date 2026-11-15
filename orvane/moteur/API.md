# Orvane : l'API du moteur de règles de combat

Pour qui écrit l'affichage (Phaser 3) : ce que le moteur attend, ce qu'il renvoie, et comment enchaîner un combat.
Le contrat commun (`CONTRAT.md`) fait foi pour les règles et le format des sorts ; ce document dit comment s'en servir.

## 1. Les fichiers

| Fichier | Rôle | Navigateur | node |
|---|---|---|---|
| `regles.js` | le moteur (aucune dépendance, aucun DOM) | `ORVANE.Regles` | `require('./regles.js')` |
| `monstres.js` | fiches du Fourneau (Grumeau, Mie-tron, Grumeau chef), groupes, carte du Fourneau | `ORVANE.Monstres` | `require('./monstres.js')` |
| `outils.js` | le Coup d'outil de chaque classe, la fiche du Pain de route | `ORVANE.Outils` | `require('./outils.js')` |
| `sorts-essai.js` | sorts d'essai au format du contrat (pas les vrais sorts du jeu) | `ORVANE.SORTS_ESSAI` | `require('./sorts-essai.js')` |
| `tests.js` | 190 tests : `node tests.js` | | |
| `tests-adverses.js` | 103 tests adverses (cas limites du contrat et du rapport) : `node tests-adverses.js` | | |
| `simule.js` | N combats simulés : `node simule.js 1000 [fichier-de-sorts] [--options]` (voir §11) | | |

```html
<script src="moteur/regles.js"></script>
<script src="moteur/monstres.js"></script>
<script src="moteur/outils.js"></script>
<script> const R = ORVANE.Regles, M = ORVANE.Monstres, O = ORVANE.Outils; </script>
```

## 2. Principes

- **Tout l'état d'un combat est un objet JSON simple** (`etat`). On peut le sauver avec `JSON.stringify`, le reprendre avec `JSON.parse` et continuer : le résultat est identique (c'est testé). C'est ce qu'enverra le futur serveur.
- **Les actions modifient `etat` en place** et renvoient `{ ok: true, evenements: [...] }`.
- **Une action refusée** renvoie `{ ok: false, raison: "Plus de service pour ce tour" }` et **ne touche pas à l'état** (testé octet par octet).
- **Le hasard est déterministe** : un mulberry32 dont la graine vit dans `etat.alea`. Même graine et mêmes actions = même combat. Les aperçus (`apercuSort`, `casesVisables`, `deplacementsPossibles`…) ne tirent jamais au hasard et ne changent rien, y compris pour ce que fait un objet posé pendant l'aperçu (fournée qui éclate tout de suite, piège atteint par un bond ou une poussée).
- **Ce qu'on envoie à un joueur** : `R.vuePour(etat, camp)` pour l'état (sans la graine, sans les pièges de l'autre camp, sans rien qui trahisse la case d'un ennemi Dérobé) et `R.evenementsPour(etat, evenements, camp)` pour les événements d'une action. Le serveur garde l'état complet.
- **Les événements sont ordonnés** : l'affichage les anime dans l'ordre (marche, puis Rideau, puis piège, puis dégâts, puis chute…). Une action qui finit un tour renvoie aussi les événements du début du tour suivant (fournées qui éclatent, Brûlé, nappes…).
- **Le Minuteur** (45 s, `R.tempsDuTour(etat)`) est compté par l'affichage : à zéro, l'affichage appelle `R.finDuTour(etat, id, { absent: true })` si l'artisan n'a rien fait, `R.finDuTour(etat, id)` sinon. Il n'est désactivable qu'en solo (décision 4) : avec deux artisans ou plus, `options.minuteur: false` est sans effet.
- **Cases** : toujours `[x, y]`, deux entiers, sur la grille (X, Y) (une case `[2.5, 0]` ou `['2', '0']` est refusée). L'écran en losanges n'en est qu'une rotation : `ecranX = (x − y) × L/2`, `ecranY = (x + y) × H/2`. Distance = |ΔX| + |ΔY|.

## 3. Un combat, de bout en bout

```js
const sorts = ORVANE.SORTS_ESSAI.filter(s => s.classe === 'levainqueur' && !s.declinaisonDe && s.niveau <= 6)
  .concat([O.pour('levainqueur')]);                      // le Coup d'outil (emplacement 0) est un sort comme un autre
const etat = R.creerCombat({
  carte: M.carte('fourneau'),
  graine: 12,                                            // nombre ou texte
  artisans: [{ id: 'moi', nom: 'Brioche', classe: 'levainqueur', niveau: 6, affinites: { F: 15, T: 10 }, sorts }],
  monstres: M.groupe('fourneau', 'mie-et-pate'),
  options: { depart: numeroDuCombat % 3 }                // jeu de cases de départ : on tourne d'un combat à l'autre (3.3)
});
// Mise en place : les monstres sont déjà placés ; l'artisan touche une case dorée.
R.placer(etat, 'moi', [9, 10]);   // → { ok: true, evenements: [{ type: 'placement', id: 'moi', case: [9, 10] }] }
R.choisirCommande(etat, etat.commande.proposees[0]);   // sinon la première proposée est prise au début ; null = aucune
R.choisirBonusCommande(etat, 'moi', 'ristourne');      // ou 'savoirFaire' (par défaut)
let r = R.commencer(etat);        // ou R.pret(etat, id) pour chaque artisan (« Envoyez ! »)
// r.evenements : debut (frise), manche 1, tour du premier combattant…

function boucle() {
  const a = R.actif(etat);                 // le combattant dont c'est le tour (objet de l'état), ou null
  if (etat.phase === 'fin') return montrerAddition(R.resultat(etat));
  if (a.controle !== 'joueur') { animer(R.iaJoue(etat, a.id).evenements).then(boucle); return; }
  attendreLeJoueur();                      // le joueur agit, puis appelle boucle()
}
```

**Agir en deux temps (partie 3.23)** : premier toucher = aperçu, second toucher sur la même case = action.

```js
// Marche
const portee = R.deplacementsPossibles(etat, 'moi');            // cases vertes, avec coût et perte au Rideau
const sansRideau = R.deplacementsPossibles(etat, 'moi', { sansRideau: true }); // pour griser les cases perdues
const rid = R.apercuRideau(etat, 'moi');                        // au contact ? « −1 Pas, −2 CM » en sortant ; pris = on ne peut pas sortir
const ap = R.apercuDeplacement(etat, 'moi', [8, 8]);            // chemin, « −2 Pas », « −1 Pas, −2 CM » (ou refus « Pris dans le Rideau »)
R.deplacer(etat, 'moi', [8, 8]);                                // au second toucher

// Sort
const barre = R.barre(etat, 'moi');                             // boutons : disponible ou grisé, avec la raison
const v = R.casesVisables(etat, 'moi', 'levainqueur.mie-raille'); // Rayon : or plein (vue) / or pâle hachuré (pas de vue)
const ps = R.apercuSort(etat, 'moi', 'levainqueur.mie-raille', [5, 5]); // zone, « −15 à −21 (maître −19 à −26) », toque renversée
R.lancer(etat, 'moi', 'levainqueur.mie-raille', [5, 5]);
R.utiliserPainDeRoute(etat, 'moi');
R.finDuTour(etat, 'moi');
```

## 4. Les formats d'entrée

### La carte

```js
{
  id: 'fourneau', nom: 'Le Fourneau',
  lignes: [                 // une chaîne par rangée Y, un caractère par colonne X
    '~~...~~~~~~~~~~~',     // '.' sol · '~' ou ' ' vide (on voit à travers, on ne marche pas)
    '~......B.C~~~~~~',     // toute autre lettre (ou '#') : décor plein, qui bloque la marche et la vue
  ],
  legende: { B: 'billot', C: 'caisse', F: 'four', L: 'lanterne' },   // nom des décors (pour l'affichage)
  departs: [                // 2 ou 3 jeux de cases de départ ; 6 cases dorées (artisans) et 6 cuivre (monstres)
    { artisans: [[9, 7], [10, 8], [9, 11]], monstres: [[4, 6], [5, 5], [4, 5]] }
  ]
}
```
Sans `departs`, les lettres `a` (artisan) et `m` (monstre) dans `lignes` donnent un jeu de départ (elles valent du sol).
**Une carte pour le portrait** : avec la projection ci-dessus, une grille rectangulaire de W × H cases est un losange deux fois plus large que haut. Le Fourneau (`M.carte('fourneau')`) est donc une bande le long de la diagonale x + y : grille de 16 × 16 (le reste est du vide), 118 cases dont 5 décors (113 de sol), qui donnent à l'écran 9 demi-colonnes sur 27 demi-rangées, soit environ 275 × 392 px avec des cases de 55 × 28 (plus haut que large). Les monstres partent en haut, les artisans en bas ; chaque jeu de départ mêle des cases exposées au Mie-tron, des cases à l'abri d'un décor et des cases en retrait. Pour cadrer la caméra, prendre la boîte des cases qui ne sont pas du vide.
Dans l'état, `etat.carte.lignes` ne contient plus que `.`, `#` et `~`, et `etat.carte.decors["x,y"]` donne le nom du décor.
`R.terrain(etat, [x, y])` → `'sol' | 'plein' | 'vide'`.

### Un artisan (entrée de `creerCombat`)

```js
{
  id: 'moi', nom: 'Brioche', classe: 'levainqueur', niveau: 6,
  affinites: { F: 15, T: 10, E: 0, S: 0, C: 0 },     // valeurs ; coût en capital : 1 point jusqu'à 80, 2 jusqu'à 160, 3 au-delà
  capital: { victuailles: 0, savoirFaire: 0 },       // points de capital (1 point = 2 Victuailles ; 2 points = +1 Savoir-faire)
  equipement: { cm, pas, rayon, victuailles, levure, remontant, rideau, fauxFuyant, ouverture, coupDeMaitre,
                commis, ristourne, savoirFaire, affinites: { F: 5 }, conservation: { T: 10 } },   // tout facultatif
  sorts: [ /* sorts au format du contrat, Coup d'outil compris */ ],
  controle: 'joueur',          // ou 'ia' (le moteur ne l'impose pas : c'est l'affichage qui décide d'appeler iaJoue)
  comportement: 'tire',        // pour l'IA : 'tire' ou 'colle' ; sinon déduit des sorts
  painDeRoute: 3,              // Pains de route dans le Sac pour ce combat
  case: [9, 10]                // facultatif : case déjà choisie
}
```
Le capital disponible est 5 × (niveau − 1) ; s'il est dépassé, `creerCombat` lève une erreur.
`R.deriverArtisan(def)` donne les caractéristiques calculées (pour l'onglet Carac.) :
`{ niveau, victuailles, cm, pas, rayon, rideau, fauxFuyant, ouverture, coupDeMaitre, commis, levure, remontant, ristourne, savoirFaire, conservation, affinites, capital: { disponible, utilise, reste } }`.
Les sorts pas encore débloqués (niveau du sort > niveau de l'artisan) et le second sort d'un même emplacement sont écartés, avec un message dans `etat.avertissements`.

### Un monstre (fiche de `monstres.js`)

```js
{ id: 'grumeau', nom: 'Grumeau', niveau: 2, chef: false, taille: 1,
  victuailles: 52, cm: 4, pas: 3, ouverture: 80, rideau: 5, fauxFuyant: 0,
  conservation: { F: -20, E: 30 },      // libre pour un monstre (−50 à +100) ; négatif = faiblesse
  comportement: 'colle',                 // 'colle' (finit au contact du plus fragile) ou 'tire' (3 à 5 cases, hors de vue)
  sorts: [ /* format du contrat */ ], xp: 25, ble: 4,
  objets: [{ id: 'pate-crue', nom: 'Pâte crue', taux: 40 }] }
```
`M.fiche(id)` (copie), `M.groupe('fourneau', 'le-chef')` (liste de fiches), `M.prevision('fourneau', id)` (XP, Blé, membres pour la fiche du groupe sur la carte), `M.carte('fourneau')`.
Groupes du Fourneau, du plus facile au plus dur (XP) : `chef-seul` (60), `mie-et-pate` (60), `grumeaux` (le chef et son pâton, 85), `le-chef` (le chef et son mitron, 95). Le Grumeau et le Mie-tron reprennent exactement le tableau 3.22 ; le Grumeau chef (nouveau) a été réglé par la simulation (66 Victuailles, Grosse pâte 9 à 12).

### Un sort

Le format du §3 du contrat. Le moteur complète ce qui manque (`rayon` 0 à 0, `lancer` libre, `vue` vrai, `cible` combattant, limites à 0, `zone` case, fourchette maître = +25 %).
**`touche` (décision 2)** : un sort qui fait des dégâts (lui-même ou dans un `si`) touche toujours les ennemis, même si sa fiche dit « allies » (le vérificateur le signale) ; un objet posé qui fait des dégâts aussi. Sans champ `touche`, le moteur le déduit : « ennemis » si le sort attaque (dégâts, poussée, attirance, retrait, Entame, états Brûlé, Ramolli, Enraciné, Fumé, Attendri, Affiné, Fève), « allies » s'il soutient (soin, bouclier, ramène, bonus sur la cible, états Glissant, Dérobé, Nappé, Planté, Marée), sinon d'après `cible` (allie ou soi → « allies »). En plus de ce filtre, une brique `degats` ne touche jamais le camp du lanceur.
`R.verifierSort(sort, opts)` renvoie la liste des écarts au contrat (vide si tout va bien) : champs du §3 (présence et type), valeurs (CM, Rayon, limites, formes, cibles, manières de lancer), emplacement 0 à 16 et niveau de la décision 9 (`R.NIVEAUX_EMPLACEMENTS`), id = classe + « . » + nom sans accents, noms des emplacements 16 (« Chef-d'œuvre … »), réglages obligatoires de chaque brique, règle de `touche` (dans les deux sens), soin réservé, limites d'un sort de dégâts, `maitre`, sorts des Commis, bonus d'Ouverture (sans effet : l'ordre est fixé au début). `opts.presence: false` ne signale pas les champs manquants (c'est ce que fait `creerCombat`).
`R.verifierClasse(sorts)` applique les seuils du §4 aux sorts d'une ou plusieurs classes : `{ ok, problemes, couverture: { classe: { 34: { F, E, T, S, C }, 81: …, 200: … } } }` (un sort de base par emplacement 1 à 16, une déclinaison au plus, `declinaisonDe` juste, noms uniques dans tout ce qu'on lui donne, couverture par élément ; le Coup d'outil n'y entre pas). `R.normaliserSort(sort)` montre le sort complété.

Champs facultatifs ajoutés par le moteur, **hors du §3 du contrat** (à y ajouter, ou à ne pas utiliser dans les vrais sorts) : `valeur` sur une brique `etat` Brûlé (dégâts par couche, 5 par défaut) ; `cuitTout: true` sur une `pose` de fournée (toutes les fournées du lanceur éclatent d'abord : le chef-d'œuvre du rapport 3.17 n'a pas d'autre brique pour le dire) ; `nom` sur une `pose` d'Ustensile ; `comportement`, `conservation`, `affinites` dans une fiche de Commis ; `outil` (Coup d'outil), `taille` et `texte` dans les fiches de monstre. Le vérificateur ne les signale pas.

## 5. Les fonctions

| Fonction | Renvoie | Notes |
|---|---|---|
| `creerCombat({ carte, artisans, monstres, graine, options })` | `etat` | `options` : `minuteur` (vrai par défaut ; `false` n'agit qu'en solo), `depart` (index du jeu de départ : le jeu le fait tourner d'un combat à l'autre ; sinon tiré au hasard), `donjon` (jeu 0, 4 Commandes proposées), `commande` (`'auto'` : deux proposées ; un id : imposée ; `'aucune'`), `arrivage` (% d'XP en plus) |
| `rejoindre(etat, artisan)` | action | un allié rejoint pendant la Mise en place (4 artisans au plus) ; le Minuteur et les bonus de Commande sont recalculés |
| `placer(etat, id, case)` | action | case dorée du jeu de départ ; échange avec un autre artisan si elle est prise |
| `choisirCommande(etat, idCommande \| null)` | action | parmi `etat.commande.proposees` ; sans choix, la première proposée est prise au début du combat ; `null` = pas de Commande |
| `choisirBonusCommande(etat, id, 'savoirFaire' \| 'ristourne')` | action | mémorisé dans `etat.commande.choix` |
| `pret(etat, id)` | action | « Envoyez ! » ; le combat commence quand tous les artisans sont prêts |
| `commencer(etat)` | action | place les artisans oubliés, calcule la frise, lance le premier tour ; refus « Aucun artisan » ou « Aucun monstre » |
| `actif(etat)` | combattant ou `null` | |
| `deplacementsPossibles(etat, id, { sansRideau })` | `[{ case, cout, chemin, pasRestants, cmRestants, perte: { cm, pas }, rideau: [{ case, cm, pas, part }] }]` | pour un combattant qui n'est pas actif : sa portée à son prochain tour |
| `apercuDeplacement(etat, id, case)` | `{ ok, case, cout, chemin, pasRestants, cmRestants, perte, rideau }` ou refus | refus « Pris dans le Rideau », « Case hors d'atteinte (Rideau) » (la perte en chemin la rend trop lointaine) ou « Case hors d'atteinte » |
| `apercuRideau(etat, id)` | `{ auContact, ennemis: [ids], part, pasApres, cmApres, perte: { cm, pas }, pris }` | ce que coûterait de quitter sa case maintenant ; `pris` : 0 Pas après la perte, on ne peut pas sortir |
| `deplacer(etat, id, case)` | action | le meilleur chemin (le moins de CM perdus, puis le plus de Pas gardés) |
| `barre(etat, id)` | `[{ id, nom, element, cm, emplacement, rang, rayon: { min, max, modifiable }, disponible, raison, relance, lancesCeTour, chanceMaitre }]` | `rayon.max` tient compte du bonus |
| `casesVisables(etat, id, sortId)` | `{ disponible, raison, cases: [{ case, vue, visable, raison }] }` | chaque case du Rayon ; `vue` faux = or pâle hachuré (Pas de vue, mauvaise manière de lancer) |
| `apercuSort(etat, id, sortId, case)` | voir ci-dessous, ou refus | pour un sort `soi`, `case` peut manquer |
| `lancer(etat, id, sortId, case)` | action | |
| `utiliserPainDeRoute(etat, id)` | action | 2 CM, une fois par tour, 3 par combat, soigne 12 + 2 × niveau / 10 |
| `apercuPain(etat, id)` | `{ ok, disponible, raison, valeur, valeurPleine, cm, reste }` | sans rien changer : refus éventuel (« Victuailles déjà pleines »…) et Victuailles vraiment rendues |
| `finDuTour(etat, id, { absent })` | action | `absent` : tour passé par le Minuteur sans rien faire ; en groupe, au 3e d'affilée l'artisan quitte le service ; en solo, le tour passe et rien de plus |
| `iaJoue(etat, id)` | action | joue tout le tour (marche, sorts, Pain de route, placement final) et finit le tour |
| `iaPlace(etat, id, { pire })` | action | choisit une case de départ (simulation, artisan absent) : la moins exposée aux monstres (vue, portée, tireurs) ; `pire: true` prend l'inverse |
| `abandonner(etat, id)` | action | défaite sans butin ; en groupe, l'artisan quitte le service (il compte comme tombé, rien pour lui à l'Addition) et le combat continue, sauf s'il était le dernier debout |
| `resultat(etat)` | `{ fini, vainqueur, manche, addition, commande }` | |
| `vuePour(etat, camp)` | copie de l'état | ce que voit un camp : sans les pièges ennemis ; un ennemi Dérobé est retiré de la grille (`case: null, cache: true`, et `orientation`, `derniereCaseDebut`, `tour` vidés) ; sans `alea` (la graine) ni `compteur`. **À utiliser pour dessiner** et pour tout envoi au client d'un joueur |
| `evenementsPour(etat, evenements, camp)` | liste | les événements d'une action tels qu'un camp peut les voir (`etat` : après l'action) : sans le `deplacement`, `bond`, `dans-le-dos`, `echange`, `rideau`, `bute` d'un ennemi Dérobé, ni la poussée qu'il subit ; `declenchement` sans sa case ; sans la `pose` (ni la disparition) d'un piège de l'autre camp, dont le `lancer` arrive avec `case: null, cache: true`. Le camp du lanceur reçoit tout |
| `deriverArtisan(def)`, `coutAffinite(v)`, `rangSort(nivSort, nivArtisan)`, `sortAuRang(sort, rang)`, `valeurPain(niveau)` | fiches | |
| `verifierSort(sort, { presence })`, `verifierClasse(sorts)`, `normaliserSort(sort)`, `NIVEAUX_EMPLACEMENTS` | vérificateur | voir §4 |
| `ligneDeVue(etat, a, b)`, `casesZone(etat, zone, origine, centre, orientation)`, `distance(a, b)`, `terrain(etat, c)`, `trouver(etat, id)`, `cloner(etat)`, `tempsDuTour(etat)` | utilitaires | `orientation` (facultative) : l'axe d'une zone orientée quand origine = centre (sort sur soi) |

`apercuSort` :
```js
{ ok: true, sortId, case: [5, 5], cm: 2, chanceMaitre: 10, chanceMaitrePose: 0,   // taux d'un objet posé par le sort (fournée, piège…)
  zone: [[5, 5]],                                   // cases de la zone, à dessiner dans la couleur de l'élément
  cibles: [{ id: 'mie-tron', nom: 'Mie-tron', camp: 'monstres', allie: false,
             degats: { min: 15, max: 21, maitreMin: 19, maitreMax: 26 },   // déjà calculés (affinité, Levure, zone, Conservation, états)
             soin: null, bouclier: null,
             tombe: 'sur' | 'possible' | null,     // toque renversée si 'sur' (ou 'possible' en pâle)
             effets: [/* événements prévus sur cette cible : pousse, etat, retrait… */] }],
  poses: [/* pose, invoque, bond… prévus */], rebonds: [/* rebonds prévus */],
  eclatement: null | { zone: [[5, 4], …], tours: 2, cibles: [/* même forme que cibles */] } }   // fournée qui cuit : ce qu'elle ferait si elle éclatait maintenant
```
L'aperçu rejoue le sort sur une copie de l'état vue par le camp du lanceur, avec les jets au minimum puis au maximum (et en coup de maître, si le sort ou un objet qu'il pose a un taux) : il compte l'Écrasement, les rebonds, les `si`, une fournée qui éclate tout de suite, sans jamais tirer au hasard. Il ne révèle ni pièges ni Dérobés.

## 6. L'état

```js
etat = {
  version: 1, phase: 'miseEnPlace' | 'combat' | 'fin', manche: 1, tourNumero: 1, compteur: 7 /* ids des objets et Commis */,
  frise: ['mie-tron', 'moi', 'grumeau'], indexActif: 0,    // ordre de jeu ; les tombés y restent et sont sautés
  carte: { nom, largeur, hauteur, lignes, decors, departs }, depart: 0,
  minuteur: { actif: true, duree: 45 }, options: {...}, alea: 123456789,
  combattants: [ /* voir ci-dessous */ ],
  sol: [ /* nappes, pièges, fournées, graines, Ustensiles */ ],
  commande: { proposees, choisie, respectee, raison, bonus: { id: % }, choix: { artisan: 'savoirFaire' }, ordre, prochain, refusee } | null,
  resultat: { vainqueur, manche, abandon, addition } | null,
  chutes: [ids dans l'ordre des chutes], avertissements: [textes]
}
```

Un combattant (`genre` : `artisan`, `monstre`, `commis`, `ustensile`) :
```js
{ id, nom, genre, camp: 'artisans' | 'monstres', niveau, classe, fiche, maitre /* Commis, Ustensile */,
  case: [x, y] | null, orientation: [1, 0], vivant: true,
  victuailles: 104, victuaillesMax: 120, entame: 2,         // maximum affiché = victuaillesMax − entame (gris hachuré)
  cm: 6, pas: 3, cmBase: 6, pasBase: 3,
  carac: { rayon, levure, remontant, coupDeMaitre, ouverture, rideau, fauxFuyant, commis, ristourne, savoirFaire },
  affinites: { F, E, T, S, C }, conservation: { F, E, T, S, C, N },
  sorts: [ /* sorts complétés, au rang de l'artisan (champ rang) */ ],
  etats: [{ etat: 'ramolli', tours: 1, couches: 1, source: 'grumeau' }],   // tours 0 = tout le combat
  bonus: [{ carac, valeur, tours, source }], boucliers: [{ valeur, restant, tours, source, sortId }],
  renforts: [...], entameSpeciale: { part, tours } | null, relances: { sortId: tours restants },
  pain: 3, controle: 'joueur' | 'ia', comportement: 'tire' | 'colle', chef: false,
  tour: { lances, cibles, pasMarches, pain, caseDebut },
  joue /* faux pour un Ustensile */, retraits: { cm, pas } /* reçus depuis son dernier tour */, attente: { cm, pas } /* à retirer à son prochain tour */,
  cmEnPlus /* CM gagnés hors de son tour */, toursJoues, derniereCaseDebut, absences, pret, multDegats /* Commis */,
  plafondConservation, xp, ble, objets /* monstres */, abandon }
```
Les Ustensiles (et les fournées qui occupent leur case, comme le Four à pain) sont des combattants `genre: 'ustensile'`, `joue: false` : ils ont des Victuailles, bloquent la marche et la vue, ne sont pas dans la frise.

Un objet au sol :
```js
{ id: 'o3', quoi: 'nappe' | 'piege' | 'fournee' | 'graine' | 'ustensile', poseur, camp, sortId, nom, element,
  case: [x, y], cases: [[x, y]] /* nappe */, tours, reste /* compte à rebours de la fournée ou de la graine */,
  declenche: 'debut' | 'entree' | 'fin', zone, touche, maitre, effets, cache /* piège : caché à l'autre camp */,
  entite /* id de l'Ustensile qui occupe la case */, renfort /* multiplicateur des renforts du lanceur au moment de la pose */ }
```

## 7. Les événements

Champs communs : `type`, puis selon le type. `source` / `id` / `cible` sont des ids de combattants, `objet` un id d'objet au sol.

| type | champs | à l'écran |
|---|---|---|
| `placement` | id, case | pion posé pendant la Mise en place |
| `rejoint`, `pret` | id | allié arrivé, « Envoyez ! » |
| `debut` | frise, depart, commande, minuteur | frise de portraits, Commande du combat |
| `manche` | n | numéro de manche |
| `tour` | id, manche, cm, pas, retraits {cm, pas}, minuteur | portrait agrandi, barre du Minuteur |
| `fin-tour` | id | |
| `deplacement` | id, chemin [[x,y]…] (case de départ comprise) | marche case par case |
| `rideau` | id, case, cmPerdus, pasPerdus | « −1 Pas, −2 CM » au-dessus de la case quittée |
| `bute` | id, case, contre (rideau, poussee) | arrêt net (un Dérobé, une case prise, `rideau: true` si l'on s'est retrouvé pris en chemin, `poussee: true` pour un allié poussé contre un obstacle, sans Écrasement) |
| `revele` | id, case | le Dérobé apparaît un instant |
| `lancer` | id, sortId, nom, element, case, maitre, cm | animation du sort ; toque dorée si `maitre` |
| `degats` | source, cible, valeur, absorbe, perdu, entame, victuailles, max, element, maitre, sortId, ecrasement, rebond, etat ('brule'), objet | chiffre qui monte ; `absorbe` = part prise par les boucliers |
| `soin` | source, cible, valeur, brut, maitre, victuailles, max, sortId, pain | |
| `bouclier` | source, cible, valeur, total, tours | |
| `pousse`, `attire`, `ramene` | source, cible, chemin | glissade forcée |
| `ecrasement` | source, cible, cases, valeur, heurte | choc contre l'obstacle ; les `degats` suivent |
| `resiste` | cible, etat ('plante') | |
| `bond` | id, de, vers · `echange` : id, avec, de, vers · `dans-le-dos` : id, cible, de, vers | |
| `etat` | action ('pose' \| 'fini'), cible, etat, tours, couches, source | icône d'état |
| `retrait` | cible, quoi ('cm' \| 'pas'), n, demande, plafond, etat | |
| `bonus` | action ('pose' \| 'fini'), cible, carac, valeur, tours | |
| `gain-cm` | cible, n, cause ('feve') | |
| `entame` | cible, part, tours | |
| `rebond` | de, vers, case, n | arc électrique |
| `renforce` | id, quoi, valeur, tours, fois | |
| `maree` | id, etat | la Voile monte ou se couche |
| `pose` | objet, quoi, case, cases, poseur, camp, tours, cache, entite, sortId | **un piège a `cache: true` : ne pas le montrer à l'autre camp** |
| `cuisson` | objet, reste | compte à rebours de la fournée |
| `declenchement` | objet, quoi, cible, case | explosion, piège qui claque, nappe qui agit |
| `disparait` | objet, quoi, entite, raison ('declenche', 'eclate', 'fini', 'casse', 'germe', 'poseur'), poseur, camp | |
| `invoque` | id, maitre, nom, case, victuailles | Commis (ou graine qui sort de terre) |
| `tombe` | id, genre, case, par | « rend son tablier » |
| `pain` | id, reste, cm | |
| `absent`, `quitte` | id (n, max ; abandon) | tour manqué (`max` : 3 en groupe, `null` en solo) ; départ après 3 en groupe, ou abandon en groupe |
| `commande` | commande, respectee: false, par, raison, regle (ou choisie: true) | Commande rayée ; `raison` dit ce qui s'est passé (« Merlanceur a fini son tour au contact d'un ennemi »), `regle` rappelle la règle |
| `fin` | vainqueur, manche, addition | l'Addition |

L'Addition : `{ victoire, xp: { id: n }, ble: { id: n }, objets: { id: [{ id, nom, de }] }, commande: { id, respectee, appliquee, raison, bonus } }`. Sur une défaite, une Commande tenue jusque-là vaut `respectee: null` (sans objet) et `appliquee: false` ; `appliquee` n'est vrai que si le bonus a servi.

## 8. Raisons de refus (textes renvoyés tels quels)

« Le combat n'a pas commencé », « Le combat est terminé », « Ce n'est pas le tour de X », « X a rendu son tablier », « Combattant inconnu »,
« Pas assez de coups de main (3 CM) », « Revient dans 2 tours », « Plus de service pour ce tour », « Déjà servi à cette cible »,
« Hors du Rayon », « Pas de vue », « Il faut lancer en ligne », « Il faut lancer en diagonale », « Il faut lancer en ligne ou en diagonale »,
« Il faut viser un ennemi / un allié / un combattant / une case libre », « Ce sort se lance sur soi », « Case hors du terrain »,
« Déjà 3 posés : plafond atteint », « Déjà 3 pièges posés », « Il y a déjà un piège ici », « Il y a déjà une fournée ici », « Plus de place pour un Commis »,
« Ce sort n'est pas dans le grimoire de X », « Enraciné : impossible de marcher ce tour », « Plus de Pas », « Déjà sur cette case »,
« On ne marche pas là », « Pris dans le Rideau », « Case hors d'atteinte (Rideau) », « Case hors d'atteinte », « Plus de Pain de route », « Déjà mangé ce tour », « Victuailles déjà pleines »,
« Seuls les artisans ont un Sac », « Il faut choisir une case de départ dorée », « Le service est complet (4 artisans au plus) », « Case invalide », « Aucun monstre »…
Un sort qui pose un piège, une graine, un Ustensile, une fournée qui occupe sa case, ou qui appelle un Commis, est refusé sur une case occupée (« Il faut viser une case libre »), avant de payer, même s'il vise « case » ; seul un ennemi Dérobé ne se découvre qu'en s'y cognant (`bute`).

## 9. Règles telles que codées (précisions et choix)

- **Ordre** : Ouverture moyenne de chaque camp (artisans et monstres, pas les Commis), égalité tirée au sort ; puis alternance ; un Commis s'insère juste après son artisan (et ses Commis déjà là) et joue dès la manche où il arrive.
- **Début de tour**, dans l'ordre : CM et Pas rendus (moins les retraits en attente et le Ramolli), Marée qui bascule, objets du combattant (fournées qui cuisent ou éclatent, graines qui germent, nappes et Ustensiles qui s'usent), nappes « debut », Brûlé. **Fin de tour** : nappes « fin », contrôle « Sans contact », Affiné +1, puis décompte des états, bonus, boucliers, renforts, Entame spéciale et relances. Une durée de 1 posée sur soi pendant son tour couvre donc ce tour seulement ; posée sur un autre, elle couvre son prochain tour. `tours: 0` = tout le combat.
- **Relance** : `relance: 2` lancée au tour t → « Revient dans 2 tours », de nouveau possible au tour t + 2.
- **Rideau** (décision 1 mise à jour) : part gardée en fraction exacte, Pas et CM restants arrondis au plus proche, **aucun minimum** : à 0 Pas on ne sort pas (« Pris dans le Rideau », rien n'est perdu) ; Faux-fuyant ≥ 2 × Rideau ou Glissant : aucune perte ; plusieurs sorties de contact sur un même chemin se cumulent ; le chemin choisi perd le moins de CM, puis garde le plus de Pas. `CONST.RIDEAU.pasGardes` (0) permet de rétablir un minimum.
- **Vue** : supercover entre centres de cases ; au coin, coupée seulement si les deux cases bloquent ; symétrique.
- **Zones orientées** (ligne, travers, cône, demi-rond) : axe lanceur → case visée (axe dominant, diagonale à égalité) ; sur soi, l'orientation du lanceur. Elles sont construites dans le repère (axe, perpendiculaire) : le demi-rond est fait de rangées de 2n + 1, 2n − 1… cases qui se resserrent derrière la case visée, ce qui donne 4 / 9 / 16 cases (tableau 3.12) en ligne comme en diagonale ; en diagonale, comme le cône et le travers, ses cases sont espacées sur la grille (elles se touchent par un coin à l'écran).
- **Dégâts** : un seul jet par brique et par lancer, partagé par toutes les cibles et les rebonds (l'aperçu et le coup reçu restent cohérents) ; étapes 2 (arrondi bas) puis 3 à 5 sans arrondi, arrondi bas à la fin.
- **Boucliers** : la couche la plus ancienne absorbe d'abord ; `couchesMax` couches du même sort par cible ; l'état Nappé n'est qu'une marque qui tombe avec le dernier bouclier.
- **Poussée** : depuis le lanceur pour un sort sans zone, depuis la case visée pour une zone (la plus éloignée d'abord) ; Écrasement : 12 + niveau / 4 par case manquée, moitié pour le heurté, **rien pour un allié du lanceur heurté, et rien du tout quand on pousse un allié** (décision 2 : jamais de dégâts sur son camp ; l'allié s'arrête, événement `bute` avec `poussee: true`) ; piège sur le chemin : arrêt sans Écrasement. Attirance : s'arrête au contact, sans Écrasement. Un combattant qui tombe en chemin (piège, nappe « entree ») s'arrête là, et si c'était son tour, le tour passe au suivant.
- **Dans le dos** : chaque combattant a une `orientation` (dernier pas ou dernier sort ; au départ, vers l'ennemi le plus proche). « dansLeDos » = le lanceur est dans le quart arrière ; la brique `dans-le-dos` le pose sur la case juste derrière.
- **Retraits** : fenêtre qui se referme à la fin du tour de la cible : 2 CM et 2 Pas au plus, Ramolli compris ; appliqués tout de suite si c'est son tour.
- **Rebond** : sur l'ennemi visible le plus proche de la cible précédente, jamais deux fois le même, à `part` % de la valeur du sort (même jet).
- **Renforce** : sur le lanceur ; `quoi` = id de sort, `element:X` ou `famille:X` (X = un type de brique ou un `quoi` de pose : fournee, piege, soin, commis…) ; `fois` décompte les lancers. Un objet posé (fournée, piège, nappe, Ustensile) garde les renforts qui valaient **au moment du lancer** (`renfort` sur l'objet) : une fournée qui cuit un tour profite d'un renfort « fois : 1 » ou d'un tour, même s'il est fini quand elle éclate.
- **Pièges** : cachés à l'autre camp (l'IA ne les voit pas, `vuePour` et `evenementsPour` non plus), 3 au plus par poseur ; ils se déclenchent sur toute arrivée (marche, poussée, bond, échange). **Nappes** : une fois par tour et par combattant ; leur durée décompte au début du tour du poseur.
- **Brûlé** : `couches` × 5 Victuailles (ou `valeur`) au début du tour du porteur ; reposer le Brûlé remet sa durée **sans ajouter de couche** (partie 3.16, « sans cumul, sauf mention » : c'est la brique qui dit combien de couches, 3 au plus). Ramolli (2), Nappé (3) et Attendri (2) se cumulent, comme le dit leur ligne du tableau 3.16.
- **Graine** : germe au début du prochain tour du poseur si la case est libre et qu'il reste une place de Commis ; sinon elle attend.
- **Commis** : Victuailles et dégâts × (1 + niveau / 120) ; joués par l'IA ; tombent avec leur artisan.
- **Mort** : tout ce que le combattant a posé disparaît, ses Commis tombent, ses états, bonus et boucliers sur les autres s'arrêtent (sauf la Fève).
- **Rangs** (règle générique, décision 9) : rang 2 au niveau du sort + 50, rang 3 au niveau du sort + 100, chacun plafonné à 200 (lecture littérale : tout sort est au rang 3 au niveau 200, le chef-d'œuvre dès son arrivée ; à faire valider) ; × 1,15 / × 1,30 sur dégâts, soins, boucliers, dans les poses, les `si` et les sorts du Commis qu'appelle le sort (avant le × (1 + niveau / 120) du Commis) ; rang 3 : relance − 1 du sort lancé. Le Coup d'outil monte de rang comme les autres (niveau 1 : rang 2 au niveau 51, rang 3 au niveau 101).
- **Addition** : écart de niveau mesuré sur le plus fort monstre ; Blé partagé (le reste va aux premiers servis) ; un tirage par objet et par monstre, les artisans essayant dans l'ordre de Ristourne décroissante (bonus de Commande compris) ; défaite : moitié de l'XP des monstres tombés, ni Blé ni objet ; abandon : rien (en groupe, rien pour celui qui a abandonné, les autres sont servis normalement).
- **Commande** : deux proposées (quatre en donjon : « deux Commandes en donjon » est à préciser par l'utilisateur) ; bonus de 25 à 100 % selon la difficulté et √(monstres / artisans), recalculé quand un allié rejoint ; sans choix de l'initiateur, la première proposée est prise au début ; contrôlée en direct ; « Sans sel » compte tout soin du camp (Pain de route compris) ; « Fait main » exige que le coup qui fait tomber vienne d'un sort d'emplacement 0 lancé par un artisan ; « Sur le plan de travail » ne compte que la marche.
- **Minuteur** : 45 s par tour, sans report ; `options.minuteur: false` ne le coupe qu'en solo (avec un allié, il reste : les tours d'un absent doivent passer). Pas d'option « Minuteur strict » (rapport 3.5) : la décision 4 la rend sans objet.
- **Ouverture** : l'ordre est fixé au début du combat (3.4, inchangé par le contrat) ; un bonus d'Ouverture en combat ne change donc rien (le vérificateur le signale). L'Ouverture compte par l'équipement et l'Éclair (décision 5).
- **Camp vide** : un combat sans monstre ne commence pas (« Aucun monstre »).
- **Coups d'outil** (`outils.js`) : tous s'appellent « Coup d'outil », comme le nomme le contrat (§2) ; l'unicité des noms (§4) vaut pour les 16 emplacements de chaque classe. Le Couperet a le taux de coup de maître le plus haut (25 %) avec la fourchette maître habituelle (+ 25 %, partie 3.11). Le Sécateur (« 2 cases côte à côte ») a la même forme que le Saucisson (« ligne de 2 ») : la liste fermée des formes n'a pas de paire perpendiculaire à l'axe (à faire valider).

## 10. Constantes

`R.CONST` regroupe tout ce qui se règle : CM et Pas de départ, plafonds, Victuailles, paliers du capital, `AFFINITES_SECONDAIRES` (décision 5, validée), Rideau, baisse des zones (15 %, 3 fois), Entame (12,5 %, 50 %), Écrasement, retraits (2 / 2), Pain de route, rangs, états (`ETATS` : couches maximum, `cumul` (Brûlé : non), durée par défaut, Brûlé 5 par couche, Fumé −15 %, Attendri −10 / −15 %, Marée +2 Rayon / +20 %), XP de groupe, écart de niveau, Commandes (`R.COMMANDES`), réglages de l'IA (`IA.bonusChuteSure` : priorité d'une chute certaine). On peut les changer avant de créer un combat (`R.CONST.MINUTEUR_S = 30`).
Listes fermées exposées : `R.ELEMENTS`, `R.ETATS`, `R.FORMES`, `R.CIBLES`, `R.LANCERS`, `R.BRIQUES`, `R.CONDITIONS`, `R.CARACS_BONUS`, `R.POSES`.

## 11. L'IA et la simulation

`iaJoue` suit la partie 3.22 : chaque couple (case atteignable en comptant le Rideau, sort, case visée) reçoit une valeur = dégâts attendus (Conservation, coup de maître) bornés aux Victuailles + bonus si la cible tomberait + bonus pour la plus fragile + effets (états, retraits, soins…) − danger de la case − perte au Rideau. Le meilleur coup est joué, puis on recommence ; à la fin, « colle » se place au contact du plus fragile, « tire » à 3 à 5 cases, hors du contact, si possible hors de vue de l'ennemi au plus grand Rayon de dégâts. L'IA ne voit que ce que voit son camp. Les poses (fournées, pièges, nappes) valent moins qu'un coup immédiat (`CONST.IA.poidsPose`).

Écarts assumés avec la partie 3.22, à faire valider :
- **Point 1** : un coup immédiat qui fait tomber une cible **à coup sûr** passe avant tout le reste (`IA.bonusChuteSure`) ; une chute seulement possible reçoit un bonus proportionnel à sa chance (`IA.bonusChute`).
- **Point 2** : le danger d'une case est la somme des dégâts par tour des ennemis qui peuvent l'atteindre (Pas + Rayon de dégâts), et non leur nombre : un tireur qui frappe fort pèse plus qu'un Commis. Il ne tient compte ni de la vue ni du Rideau (trop coûteux à chaque case).
- **Placement** (`iaPlace`) : la case dorée la moins exposée (dégâts des monstres qui la verraient dès le départ, ou qui l'atteindraient en marchant ; un décor qui cache compte pour beaucoup, les tireurs davantage).

`simule.js` fait jouer un artisan par l'IA contre les groupes du Fourneau, sur la carte en portrait, le jeu de cases de départ tournant d'un combat à l'autre :

```
node simule.js 1000                         # Levainqueur niveau 2, sorts d'essai, les 4 groupes à tour de rôle, placement de l'IA
node simule.js 2160 --placement=chaque      # 30 combats sur chacune des 6 cases de chaque jeu : la meilleure et la pire case, par groupe
node simule.js 1000 --placement=pire        # la case que l'IA juge la pire ; --placement=hasard : au hasard
node simule.js 1000 ../sorts.json --classe=merlanceur --niveau=3 --groupe=le-chef
```

Résultats avec les sorts d'essai (Levainqueur niveau 2, 14 novembre), en Victuailles perdues (défaite = 100 %) :

| Groupe | Placement de l'IA | Meilleure case dorée (selon le jeu) | Pire case dorée | Défaites |
|---|---|---|---|---|
| Le chef seul | 18,7 % | 14 à 16 % | 19 à 22 % | 0 |
| Mie et pâte | 33,7 % | 19 à 30 % | 45 à 56 % | 0 |
| Le chef et son pâton | 39,7 % | 30 à 42 % | 46 à 52 % | 0 |
| Le chef et son mitron | 55,4 % | 31 à 51 % | 65 à 72 % | 3,6 % (jusqu'à 3,3 % sur la pire case) |

Le placement compte (de 5 à 30 points entre la meilleure et la pire case d'un même jeu) et un mauvais placement peut faire perdre contre le groupe le plus dur. Viser 30 à 40 % pour **chaque** groupe n'est pas possible tant que le Grumeau et le Mie-tron gardent les valeurs du tableau 3.22 et qu'un groupe compte 1 ou 2 monstres : un deuxième monstre ajoute au moins ses propres dégâts pendant toute sa vie. Les groupes vont donc du plus facile (le chef seul, 60 XP) au plus dur (le chef et son mitron, 95 XP). À relancer avec les vrais sorts.
