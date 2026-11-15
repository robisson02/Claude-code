# Orvane et Dofus : comment on joue, ce qui manque, les règles à coder

Document de travail, 13 novembre 2026.

## En bref

- **Ton impression est juste.** La maquette a la grille en losanges, le déplacement en 4 directions et les 6 CM / 3 Pas de Dofus. Mais il lui manque ce qui fait le jeu : la ligne de vue, le fait d'être retenu au contact (le Rideau), la mise en place avant le combat, l'ordre de jeu alterné, des monstres qui ont des sorts, et des limites sur chaque sort. Résultat : on recule et on tire, sans risque, et on ne peut pas perdre.
- **Un moteur graphique n'aurait rien changé à ça.** Ce qui manque, ce sont des règles, pas de l'affichage. Un moteur comme Phaser aidera pour la caméra, le zoom au doigt, les animations et la fluidité sur téléphone. On y passe quand on écrit le vrai combat (partie 5).
- **Ma proposition :** écrire d'abord les règles dans un module à part, testé sans écran, le brancher sur la maquette pour juger le plaisir de jeu, puis passer l'affichage à Phaser (partie 6).

Comment lire ce document : les mots de Dofus n'apparaissent que dans les parties 1 et 2, pour comparer. La partie 3, les règles d'Orvane, n'utilise que le vocabulaire d'Orvane. Un dictionnaire de correspondance termine la partie 1.

---

## 1. Comment on joue à Dofus (l'essentiel en une page)

Versions : Dofus 2 (Flash, 2009-2024), Dofus 3 (moteur Unity, sorti le 3 décembre 2024, mêmes règles que Dofus 2), Dofus Touch (téléphone, depuis 2016, règles proches mais serveurs séparés), Dofus Rétro (l'ancienne version 1.29).

### Le combat

- **Il part de la carte.** Des groupes de monstres (un chef et ses suiveurs, de 1 à 8 sur PC, de 1 à 4 sur Touch) se promènent, visibles. En les survolant, on voit leur niveau, leur composition et l'XP prévue. Un clic lance le combat sur place. Il n'y a ni rencontre au hasard ni arène séparée (Dofus 3 bascule sur une petite carte de combat propre à la zone).
- **Le placement (environ 45 s).** Chaque camp a ses cases de départ colorées. On choisit sa case, on voit où sont les ennemis, on choisit le défi du combat, puis on clique « Prêt ». Jusqu'à 8 contre 8 sur PC, 4 joueurs sur Touch.
- **L'ordre de jeu.** L'équipe dont l'initiative moyenne est la meilleure commence. Ensuite les équipes alternent strictement : 1er de A, 1er de B, 2e de A, 2e de B… L'ordre est fixé au début et affiché dans une frise de portraits. Une invocation joue juste après son invocateur. Un mort est sauté.
- **Le tour.** 6 PA (points d'action) et 3 PM (points de mouvement), rendus pleins à chaque tour : il n'y a pas de mana. On mélange librement marche et sorts. Un chrono court : environ 15 s + 1 s par PA et par PM, la moitié du temps non utilisé est reportée au tour suivant, 1 minute au plus (30 s sur Rétro ; +15 s contre les monstres depuis la 3.7).
- **La grille.** Isométrique, en losanges. En combat, on se déplace dans 4 directions seulement (les côtés du losange), jamais en diagonale, 1 PM par case. Les cases atteignables s'affichent en vert.
- **La ligne de vue.** On trace une ligne du centre de sa case au centre de la case visée. Les obstacles la coupent, et tous les combattants aussi, alliés compris. Les trous et l'eau ne la coupent pas. 71 % des sorts en ont besoin. Se cacher derrière un pilier ou un allié est la base du placement.
- **Le tacle et la fuite.** Quitter une case voisine d'un ennemi fait perdre une part de ses PA ET de ses PM. La part gardée vaut (Fuite + 2) / (2 × (Tacle + 2)) : à égalité, on perd la moitié. Avec deux ennemis au contact, les parts se multiplient. La perte s'affiche pendant qu'on trace son chemin. Le corps-à-corps « colle ».
- **L'érosion.** 10 % des dégâts reçus réduisent les PV maximum jusqu'à la fin du combat. Les soins ne compensent donc jamais tout.
- **La mort et la fin.** À 0 PV, on est retiré de la grille et ses invocations disparaissent. Victoire quand tous les ennemis sont tombés. Un écran donne l'XP, les kamas et les objets (servis dans l'ordre de prospection). Défaite : retour au point de sauvegarde.
- **Les défis (challenges).** Un par combat, deux en donjon, choisi entre deux propositions : par exemple « ne jamais finir son tour au contact » ou « tuer dans l'ordre imposé ». Chaque joueur choisit un bonus d'XP ou de butin, d'environ +40 à +147 %.

### Les sorts

- **Une fiche chiffrée, toujours affichée** : coût de 1 à 7 PA (92 % des sorts coûtent 2 à 4 PA), portée minimum et maximum comptée en cases (ce qui donne un losange), portée modifiable ou non (34 % des sorts), lancer en ligne (19 %) ou en diagonale, ligne de vue, case libre ou cible obligatoire, lancers par tour, lancers par cible et par tour, relance en tours (30 % des sorts), délai avant le premier lancer, taux de critique propre au sort (0 à 25 %) avec une fourchette critique plus haute.
- **Des zones codées** par forme et par taille : cercle (en losange), croix, ligne, ligne en travers, cône, demi-cercle, carré, anneau. Leurs effets baissent de 10 % par case d'éloignement, 4 fois au plus.
- **Des effets variés** : dégâts dans 4 éléments plus le Neutre, soins, boucliers, poussée et attirance (avec des dégâts si la cible heurte un obstacle), téléportations, échanges de place, états (plus de 400 sorts en posent), glyphes au sol, pièges cachés, invocations, retraits de PA et de PM.
- **L'affichage** : quand on choisit un sort, la portée s'allume en bleu (foncé = visable, pâle = cachée par un obstacle). Au survol d'une case, la zone s'affiche en rouge. Un aperçu des dégâts minimum et maximum est disponible en option.
- **19 classes, 22 paires de sorts chacune** : on équipe le sort de base OU sa variante, et on change gratuitement hors combat. Il n'y a pas de deck : tous les sorts débloqués sont dans la barre, plus l'attaque à l'arme.

### Les caractéristiques

- 4 caractéristiques élémentaires (Force pour la Terre et le Neutre, Intelligence pour le Feu, Chance pour l'Eau, Agilité pour l'Air) : chaque point donne +1 % de dégâts dans son élément, plus un effet secondaire. Plus la Vitalité (PV) et la Sagesse (XP).
- 5 points à répartir par niveau. Les coûts montent par paliers (1, puis 2, 3 et 4 points pour +1). La réinitialisation est gratuite.
- **Dégâts** = jet × (100 + caractéristique + Puissance) / 100 + dommages fixes, puis moins la résistance fixe, puis × (100 − % de résistance) / 100. La résistance en % des joueurs est plafonnée à 50 % (35 % sur Touch), celle des monstres non : on vise l'élément faible du monstre, visible en le survolant.
- **PA et PM** : 6 PA et 3 PM au départ, +1 PA au niveau 100, et c'est tout ce que donne le niveau. Le reste vient de l'équipement, plafonné à 12 PA, 6 PM et +6 de portée. Tout le monde vise « 12/6 ».

### La progression

- Niveau maximum 200. La courbe d'XP est un mur : le passage du 199 au 200 coûte un tiers de toute l'XP. Après 200, des niveaux « Oméga » sans puissance.
- Un sort ou une variante se débloque tous les 5 niveaux, et les sorts montent seuls de grade.
- La puissance vient surtout de l'équipement : panoplies à paliers (souvent +1 PA ou +1 PM à 2 ou 3 pièces), 6 emplacements pour des objets rares, amélioration par runes avec risque de perte.

### Le monde

- Environ 10 000 cartes en écrans fixes, repérées par des coordonnées. On change d'écran par le bord.
- Des bornes de téléportation payantes à découvrir, un point de sauvegarde, des potions de rappel, un espace personnel, un déplacement automatique.
- Les donjons : une suite de salles puis un boss à mécanique, avec une clé fabriquée à partir des ressources du donjon.
- Tous les métiers pour chaque personnage. On récolte d'un clic dans le décor (3 s), on fabrique dans des ateliers en ville. Presque tout l'équipement est fabriqué par les joueurs et vendu dans un marché découpé par corps de métier.
- Un rituel quotidien (une offrande par jour pendant 365 jours, avec un bonus du jour pour tous), des chasses au trésor, des guildes, des alliances et une arène classée.

### Sur téléphone (Dofus Touch)

Mêmes règles, groupes de 4, pas d'agression par les monstres. L'interface du PC est tassée dans un panneau fixe (environ 27 % de la largeur). C'est le premier reproche des joueurs : « l'interface prend 40 % de l'écran », touches minuscules, chat qui recouvre la grille, caméra fixe en combat. Le client est en JavaScript (carte dessinée sur un canvas, menus en HTML), emballé en application.

### Ce qui reste incertain

- Le temps de tour de la 2.29 vient d'un message de forum ; la durée de 45 s du placement vient d'un site de fans.
- La taille d'une carte (560 cases, 14 × 20) n'a été confirmée par aucune source.
- Le site officiel dofus.com n'a pas pu être lu directement : les chiffres viennent de wikis, de guides de fans et des données du jeu extraites par la communauté.

### Sources principales

- Wiki de fans anglophone : dofuswiki.fandom.com (pages Combat, Characteristic, Dodging, Line of Sight, Spell, Damage, Area of Effect).
- JeuxOnLine : dofus.jeuxonline.info (bases du combat ; devblogs du tacle déterministe en 2011, des variantes et de l'agression en 2017, du mode tactique).
- dofuspourlesnoobs.com (dommages, tacle et fuite, challenges, notes des mises à jour 3.1 à 3.7).
- Données du jeu : api.dofusdb.fr (statistiques calculées sur les 836 sorts de classe).
- Code du serveur 1.29 Araknemu (github.com/Arakne/Araknemu) pour l'ordre de jeu.
- Dofus Touch : fiche et avis de l'App Store, code du client non officiel Lindo.
- Documentation des moteurs : Godot, Unity, Phaser, PixiJS, Colyseus.

### Le dictionnaire Dofus → Orvane

| Dofus | Orvane |
|---|---|
| PA, PM, portée (PO) | Coups de main (CM), Pas, Rayon |
| PV | Victuailles |
| Initiative | Ouverture |
| Tacle / Fuite | Rideau / Faux-fuyant |
| Résistances | Conservation |
| Puissance | Levure |
| Critique | Coup de maître |
| Invocations | Commis |
| Soins (bonus) | Remontant |
| Prospection | Ristourne |
| Sagesse (bonus d'XP) | Savoir-faire |
| Érosion | l'Entame (proposé) |
| Dommages de poussée | l'Écrasement (proposé) |
| Phase de placement | la Mise en place (proposé) |
| Challenge | la Commande (proposé) |
| Glyphe | Nappe (proposé) |
| Variante, grade | Déclinaison, rang |
| Sorts communs | Recettes de famille (proposé) |
| Kamas | Blé |
| Zaap | Four banal (proposé) |
| Écran de fin de combat | l'Addition (proposé) |

---

## 2. Ce qui manque à Orvane

### Ce que fait la maquette aujourd'hui (lu dans le code)

- **Le terrain** : le Fourneau, 78 cases dont 4 décors (2 billots, 1 caisse, 1 étoile), en losange de 9 × 9. Tu pars toujours de la même case, les 2 Grumeaux à 7 et 8 cases. Le combat se lance par un bouton « Combat » ; il n'y a aucun monstre sur la carte en balade.
- **Toi** : 110 / 120 Victuailles, 6 CM, 3 Pas. Tu joues toujours en premier.
- **La marche** : 4 directions, 1 Pas par case, on contourne le décor et les Grumeaux. Un seul toucher sur une case verte et tu pars.
- **Les sorts** : les 5 premiers de ta classe, réduits à 5 types (frappe sur une cible, frappe en ligne, croix de zone, bond, soin sur soi). La portée se compte en cases, avec un minimum et un maximum, et « en ligne » veut dire sur la même rangée. Un seul toucher sur la cible et le sort part. Il n'y a ni ligne de vue, ni limite par tour, ni relance, ni coup de maître. Les dégâts sont le jet brut : affinités, Levure et Conservation ne servent à rien. La croix touche ses 5 cases à pleine force, et seulement les ennemis. Le soin se lance même quand les Victuailles sont pleines.
- **Les Grumeaux** : 48 Victuailles, 3 Pas, aucun CM, aucun sort. Après ton tour, ils jouent l'un après l'autre : ils avancent de 3 cases au plus vers toi, puis frappent de 8 à 12 s'ils sont au contact.
- **Pas de Rideau** : quitter le contact d'un Grumeau ne coûte rien.
- **La fin** : victoire = toujours +60 XP, 3 Poussières d'étoile et 12 Blé. Défaite = retour à la Halle. Pas de minuteur, pas de mise en place.
- **Conséquence** : la meilleure tactique est de reculer puis de tirer (Mie-raille porte de 2 à 6). Et deux soins par tour (30 Victuailles) rendent plus que ce que font les deux Grumeaux (16 à 24) : on ne peut pas perdre.
- **Côté données** (sorts.js) : 128 sorts et 128 déclinaisons. 90 % coûtent 2 à 4 CM, comme dans Dofus. Mais le Rayon et l'effet sont des phrases, que le moteur ne sait lire que pour les 5 premiers sorts de chaque classe. Un seul sort parle de ligne de vue (Anguille sous roche), aucun n'a de relance.

### Essentiel : sans ça, ce n'est pas un Dofus-like

**1. La ligne de vue.**
Dans Dofus : elle coupe 71 % des sorts ; se cacher derrière un obstacle ou un allié est la base du jeu.
Dans Orvane : le plan l'annonce pour le Fourneau, mais la maquette ne la calcule pas. On frappe à travers le four, les billots et les autres Grumeaux.
Proposition : un vrai calcul de vue (partie 3.8). Le décor plein et tous les combattants coupent la vue ; le vide entre les îles ne la coupe pas (on voit à travers, on ne marche pas dessus). Rayon visable en or plein, Rayon caché en or pâle hachuré. Un champ « vue : oui/non » sur chaque sort, à « non » pour environ un quart d'entre eux (pièges, poses au sol, sorts du Terroir qui passent sous terre). Le Fourneau doit avoir 3 à 5 obstacles qui cachent vraiment.

**2. Le Rideau et le Faux-fuyant.**
Dans Dofus : quitter le contact coûte une part des PA et des PM, calculée d'avance et affichée.
Dans Orvane : les deux caractéristiques existent mais ne font rien.
Proposition : la règle « le Rideau tombe », avec une formule propre à Orvane, toujours au moins 1 Pas gardé (partie 3.7). Elle donne aussi de l'identité aux classes : le Bouchevalier a beaucoup de Rideau, le Traîtreur beaucoup de Faux-fuyant.

**3. Une fiche de sort chiffrée, avec des limites.**
Dans Dofus : coût, portée, ligne de vue, lancers par tour, par cible, relance, critique… Le meilleur tour mélange 2 ou 3 sorts différents.
Dans Orvane : rien de tout ça. Le meilleur tour est de répéter le même sort (trois Mie-raille).
Proposition : le format de la partie 4, et un barème de départ (partie 3.10) : frappes à 2 CM 3 fois par tour et 2 fois par cible, frappes à 3 CM 2 fois par tour et 1 fois par cible, etc. Le bouton se grise avec la raison : « Plus de service pour ce tour », « Revient dans 2 tours ».

**4. Des monstres avec une fiche, des sorts, une faiblesse et une IA.**
Dans Dofus : un monstre a ses PA, ses PM, ses sorts, ses résistances (souvent une faiblesse) et un rôle (il frappe, tire, soigne ou entrave).
Dans Orvane : le Grumeau avance et tape. Il n'y a pas d'ennemi à distance, l'élément choisi ne change rien.
Proposition : une fiche par monstre et une IA à priorités (partie 3.22). Au Fourneau, le Grumeau colle au contact et craint la Flambée ; le Mie-tron tire de loin, fuit le contact et craint le Terroir. Un appui long sur un monstre ouvre sa fiche. Objectif d'équilibrage : un bon placement coûte 30 à 40 % des Victuailles, un mauvais peut faire perdre.

**5. Des classes qui se ressemblent au départ, et un soin pour tout le monde.**
Dans Dofus : dès le niveau 1, un tireur ne joue pas comme un combattant au contact. Le soin est le métier de quelques classes.
Dans Orvane : les 5 premiers sorts des 8 classes suivent le même modèle (frappe à 3 CM, tir à 2 CM de 2 à 6, soin de 15 à 3 CM, croix à 4 CM, bond de 1 à 3). La mécanique de classe n'arrive qu'au niveau 10 ou 15.
Proposition : réécrire les sorts des niveaux 1 à 6 classe par classe. La mécanique de classe dès le niveau 1 à 3 (une petite Fournée, une couche de Glaçage, un amuse-bouche, un Radis, la Marée active d'office…). Des Rayons qui disent le rôle (le Merlanceur tire de 3 à 8, le Bouchevalier frappe au contact). Le soin sur soi réservé au Pâtéladin et au Pâtissorcier, avec une relance ; les autres ont le « Pain de route » du Sac, une fois par tour, payé en CM. Des déplacements différents : bond pour le Levainqueur, échange de place pour le Traîtreur, recul pour le Merlanceur, aucun bond pour le Bouchevalier.

**6. Le combat qui part de la carte, et la Mise en place.**
Dans Dofus : des groupes visibles qu'on touche pour combattre sur place, puis un placement libre sur des cases de départ.
Dans Orvane : un bouton « Combat » et des positions fixes.
Proposition : 2 ou 3 groupes de Grumeaux et de Mie-trons qui errent sur le Fourneau, avec un chef plus gros. Toucher un groupe ouvre sa fiche (niveau, membres, XP et butin prévus) et un bouton « Engager » : un combat ne part jamais d'un simple glissement de doigt (défaut reproché à Touch). Puis la Mise en place (partie 3.3).

**7. L'ordre de jeu alterné.**
Dans Dofus : les camps alternent, selon l'initiative.
Dans Orvane : l'Ouverture vaut 140 dans l'onglet Carac. mais ne sert à rien ; tu joues, puis tous les Grumeaux à la suite. À 4 contre 4, quatre tours ennemis d'affilée seraient injouables.
Proposition : partie 3.4. La frise existe déjà : il suffit d'y mettre de petits portraits avec un anneau de Victuailles.

**8. Agir en deux temps au doigt, voir son Rayon, cadrer le combat.**
Dans Dofus : sur PC, le survol montre le chemin, la zone et les dégâts avant le clic. Sur Touch, on touche d'abord pour voir.
Dans Orvane : un seul toucher fait marcher ou lancer, sans aperçu ; une erreur de doigt coûte le tour. Les cases du Rayon sans ennemi sont dessinées en or à 22 % d'opacité, sans contour, sur un sol crème : on ne les voit pas. La caméra ne bouge pas : en combat, la Halle reste à l'écran et le Fourneau n'occupe qu'environ 40 % de la hauteur de la carte. Une case fait environ 40 × 20 pixels, sous les 44 pixels conseillés pour un doigt.
Proposition : partie 3.23. Premier toucher = aperçu (chemin et « −2 Pas », ou zone, « −13 à −18 » sur chaque cible, une toque renversée si la cible tomberait). Second toucher sur la même case = validation. Caméra qui cadre l'île du combat (zoom d'environ ×1,5), pincer pour zoomer, double toucher pour recentrer. Un soin sur soi demande confirmation et se grise quand les Victuailles sont pleines.

### Important : ce qui fait la profondeur

**9. La formule de dégâts, la Conservation, le coup de maître.** Aujourd'hui, le jet est appliqué tel quel. Proposition : partie 3.11, avec un plafond de Conservation à 40 % pour les artisans, libre pour les monstres, et une fourchette « coup de maître » environ 25 % plus haute. Le bouton affiche la fourchette déjà calculée : « 13 à 18 (maître 16 à 22) ».

**10. Des zones codées, et un Rayon modifiable ou non.** Aujourd'hui, une seule croix, à pleine force, qui ne touche que les ennemis, et on ne sait pas quels sorts profitent du bonus de Rayon. Proposition : partie 3.12 (formes, baisse avec la distance, alliés touchés) et un champ « modifiable » vrai pour environ un tiers des sorts, affiché « Rayon 2 à 6 + ».

**11. Poussée, attirance et Écrasement.** 18 sorts repoussent et 8 attirent, sans règle de collision. Proposition : partie 3.13.

**12. L'usure du combat.** Rien ne limite les soins. Proposition : l'Entame (partie 3.15).

**13. Le Minuteur.** Pas de chrono. Le plan propose 30 s en ligne. Proposition : partie 3.5, une barre fine au-dessus des sorts.

**14. Les défis.** Aucun ; la victoire rapporte toujours la même chose. Proposition : la Commande (partie 3.21).

**15. Toute la barre de sorts et le Coup d'outil.** La barre ne montre que 5 sorts ; l'Outil est équipé mais ne frappe pas. Proposition : tous les sorts équipés sont disponibles en combat, sur 2 rangées de 6 (on glisse le doigt pour changer de page, un onglet Objets pour les consommables). La première case est le « Coup d'outil », dont la fiche vient de l'objet : 3 à 5 CM, une fois par tour, avec la forme de l'outil. Rouleau = 3 cases en travers (on étale), Fouet = croix, Couperet = 1 case avec un gros coup de maître, Couteau = 1 case, 2 fois par tour, Harpon = 2 à 5 cases, Sécateur = 2 cases côte à côte, Saucisson ferré = ligne de 2, Bâton-tranche-meule = 1 à 2 cases qui repousse.

**16. La taille des cartes de combat et des groupes.** Le Fourneau est un losange large qui laisse du vide sur un écran en portrait. Proposition : au plus 4 artisans, groupes de 1 à 4 monstres (1 ou 2 au Fourneau, 3 ou 4 en donjon). Des cartes de combat pensées pour le portrait : losange étiré en hauteur d'environ 9 × 13 cases (110 à 130 cases jouables), 3 à 5 obstacles qui cachent, 2 ou 3 jeux de cases de départ qui tournent d'un combat à l'autre.

**17. Le rythme des déblocages, le CM du niveau 100, les plafonds.** Aujourd'hui les sorts arrivent aux niveaux 1, 1, 1, 3, 6, 10, 15, 22, 30, 40, 52, 66, 85, 110, 150, 200, et leurs déclinaisons juste après. Entre 110 et 200, il y a des trous de 20 à 25 niveaux, là où l'XP est la plus longue à gagner. Aucun CM n'est lié au niveau, alors qu'un chef-d'œuvre coûte 7 CM pour une base de 6. Proposition : « quelque chose tous les 5 à 10 niveaux ». Sorts de base aux niveaux 1, 1, 1, 1, 5, 10, 15, 20, 26, 32, 40, 48, 56, 65, 80, et le chef-d'œuvre à 200. Les déclinaisons des 4 sorts de départ s'ouvrent par une courte quête à l'Astrelier (niveaux 3 à 9), les 11 suivantes s'étalent de 95 à 190, celle du chef-d'œuvre à 200. Les rangs 2 et 3 de chaque sort arrivent 50 et 100 niveaux après lui. +1 CM au niveau 100, avec le titre de Compagnon. Plafonds d'équipement : 11 CM, 6 Pas, +5 Rayon (partie 3.1).

**18. Les éléments : trop dilués, sans rôle.** Dans chaque classe, une déclinaison garde l'élément de son sort dans seulement 1 à 4 cas sur 16. Un joueur qui ne joue qu'un élément ne peut équiper ensemble que 2 à 4 sorts de cet élément au niveau 50, 2 à 5 au niveau 100 (Dofus : 8 à 10). Proposition : donner à chaque élément un rôle commun à toutes les classes. Flambée : les dégâts qui durent et les gros coups. Eaudace : ralentir (retirer des Pas, ramollir). Terroir : les coups au sol et les poussées. Soufflé : le placement et les zones. Éclair : les rebonds et la vitesse. Une déclinaison garde le plus souvent l'élément de son sort, et le choix porte sur l'usage (une cible ou une zone, le contact ou la distance). Vérifier par un petit script qu'une voie à un seul élément a au moins 5 sorts au niveau 50 et 7 au niveau 200.

**19. Le capital de points et les effets secondaires.** Aujourd'hui, 5 points par niveau, seulement dans les affinités, sans palier ni effet secondaire. Proposition : partie 3.1 (paliers propres à Orvane, Victuailles et Savoir-faire achetables, un effet secondaire par affinité, différent des correspondances de Dofus).

**20. La boucle hors combat.** La maquette n'a qu'une île où l'on marche ; le PNJ « ! », les étals et la balance sont du décor. Proposition : faire de l'artisanat le cœur de la boucle (le jeu vient de La Place des Artisans). Ressources visibles dans le décor (épis, ruches, caves) récoltées d'un toucher. Ateliers à Grand-Étal. Équipement surtout fabriqué par les joueurs avec le butin. Comptoir découpé par corps de métier. « Fours banaux » à découvrir pour voyager, payés en Blé, qui servent aussi de point de retour. Un « Plat du jour » : une offrande quotidienne et un bonus du jour pour tous. Des clés de donjon fabriquées, les « bons de commande ». Des écrans fixes avec de grosses flèches aux bords.

### Secondaire : à prévoir, pas urgent

**21. Les retraits de CM et de Pas.** Plusieurs sorts en retirent, sans règle. Proposition : des retraits garantis (pas de tirage au hasard, illisible au doigt) mais plafonnés (partie 3.14).

**22. Les Commis.** Rien sur leur ordre de jeu, leur durée, leur montée en puissance. Proposition : partie 3.18.

**23. La fin du combat.** Récompense fixe. Proposition : l'Addition (partie 3.20).

**24. La fraîcheur des zones.** Rien de tel. Proposition : « l'Arrivage ». Une zone peu fréquentée gagne de la Fraîcheur, jusqu'à +100 % de Savoir-faire et de Ristourne, affichée sur la fiche des groupes. À 100 %, un « Grand arrivage » fait venir un monstre rare pendant 2 heures.

**25. La forme des donjons.** 27 donjons et leurs Enseignes sont écrits, mais pas leur forme. Proposition : 2 salles puis la salle de l'Enseigne (format téléphone, groupes de 4). Entrée avec un bon de commande fabriqué. Après une défaite, on reprend à la dernière salle. Chaque Enseigne a une Commande spéciale liée à sa mécanique (par exemple, écraser chaque cocon de la Proxi-Mite avant qu'il n'éclose).

**26. Des sorts communs à toutes les classes.** Il n'en existe pas. Proposition : les « Recettes de famille », 6 à 10 sorts partagés, gagnés sur les Enseignes, groupés par paires comme les déclinaisons (un Commis de passage, une poussée, une attirance, un sort qui frappe dans le meilleur élément de l'artisan…).

**27. Des déclinaisons dès le niveau 2.** Un débutant fait un choix de build avant de connaître ses sorts. Proposition : la première déclinaison s'ouvre par une quête de l'Astrelier (« Décliner sa première recette »), après quelques combats gagnés.

**28. Le journal de combat et les signaux.** Seuls des chiffres flottants d'une seconde disent ce qui s'est passé. Proposition : un journal repliable de 2 lignes au-dessus de la barre, qui ne recouvre jamais la grille, et 4 signaux rapides pour le groupe : « Ici », « Cette cible », « Soin ! », « Je recule ».

**29. L'agression et le jeu à deux.** La Voie lactée doit apprendre à « éviter les Grumeaux », et les groupes n'ouvrent qu'au niveau 13. Proposition : une agression douce, limitée à quelques zones : un « ! » au-dessus du groupe, 3 s pour s'éloigner, jamais pendant une récolte. Jeu à deux possible dès la Halle des Ébauches.

**30. 8 directions en balade.** La balade utilise le chemin à 4 directions du combat. Proposition : 8 directions hors combat (trajets plus naturels), 4 en combat, et un bouton « Voir » qui fait pulser tout ce qui est interactif.

### Ce qui est déjà juste

- La grille en losanges, la marche en 4 directions à 1 Pas par case, les cases vertes qui contournent le décor : c'est la règle de Dofus.
- Le Rayon compté en cases (portée en losange), avec un minimum, un maximum et des sorts « en ligne ».
- 6 CM et 3 Pas rendus à chaque tour, 90 % des sorts entre 2 et 4 CM, des chefs-d'œuvre à 7 : le bon budget de tour.
- Le combat sur une île de la même carte, sans arène séparée.
- Les repères de l'écran : frise avec le numéro du tour, barres de vie au-dessus des monstres, Victuailles, CM et Pas à côté des sorts, coût sur chaque bouton, « Fin du tour » sous le pouce.
- Le jeu en portrait, d'une main, avec « Masquer le menu » (la carte prend alors environ 75 % de l'écran) et des onglets réglables : la réponse directe au premier reproche fait à Touch.
- Les déclinaisons : même emplacement, l'une ou l'autre, changement hors combat seulement. Les 3 rangs proposés jouent le rôle des grades.
- L'élément appartient au sort, pas à la classe.
- Une liste de caractéristiques complète et déjà renommée ; il ne manque que les formules.
- Des mécaniques de classe fortes et lisibles (Fournée, Glaçage, Tranchant, Fumage, Affinage, Marée, Buffet, Potager) et des Enseignes à mécanique.
- Des groupes de 4, un serveur qui arbitre tout (Colyseus), des sorts rangés dans des données : la bonne architecture contre la triche et les robots, premier reproche fait à Touch.

### Ce qu'il ne faut pas copier

- Les mots de Dofus (voir la liste des mots protégés en annexe de la partie 3).
- Toutes les constantes de Dofus à l'identique (formule du tacle, 10 % d'érosion, −10 % par case en zone, 12 PA / 6 PM / 6 PO, paliers 1/2/3/4, 45 s de placement, 15 s + 1 s par point). Les mécaniques sont libres, mais tout reprendre au chiffre près renforcerait un risque de parasitisme : la partie 3 choisit exprès d'autres valeurs.
- Les correspondances caractéristique → élément → effet secondaire de Dofus (l'Agilité qui donne à la fois tacle et fuite, la Chance le butin, l'Intelligence les soins).
- Les couleurs de lecture de Dofus : portée bleue, zone rouge, cases de départ rouges et bleues. Orvane prend l'or et le cuivre.
- Les défauts connus : interface qui mange 40 % de l'écran, chat sur la grille, caméra fixe, combats lancés par erreur, retrait de PA/PM tiré au hasard, immobilisation totale par le tacle, courbe d'XP en mur, plus de 400 sorts qui posent des états, amélioration d'objets qui peut tout faire perdre, jeu à plusieurs comptes encouragé.
- Le mot « Dofus-like » sur la fiche du store ou dans les publicités.

---

## 3. Les règles de combat d'Orvane, version Dofus-like

Fiche prête à coder. Toutes les valeurs sont des **valeurs de départ**, à régler par l'essai (des combats simulés par milliers, puis tes tests). Les constantes sont propres à Orvane.

Lexique : **artisan** = un personnage joueur ; **combattant** = artisan, monstre ou Commis ; **camp** = les artisans d'un côté, les monstres de l'autre ; **tour** = le moment où un combattant agit ; **manche** = un passage complet de la frise. Les distances se comptent en cases, sur la grille (X, Y) : distance = |ΔX| + |ΔY|.

### 3.1 Valeurs de départ, gains et plafonds

| Caractéristique | Au départ | Ce qui l'augmente | Plafond (équipement compris, hors effets de combat) |
|---|---|---|---|
| Coups de main (CM) | 6 | +1 au niveau 100 (titre de Compagnon), équipement | 11 |
| Pas | 3 | équipement (premier Pas vers le niveau 60, sur les Sabots) | 6 |
| Rayon (bonus) | 0 | équipement | +5 |
| Victuailles | 90 + 5 × niveau | capital (1 point = 2 Victuailles), Eaudace (+1 par 2 points), équipement | aucun |
| Rideau | 5 | +1 par 10 points de Terroir, équipement | aucun |
| Faux-fuyant | 5 | +1 par 10 points de Soufflé, équipement | aucun |
| Ouverture | 100 | +2 par point d'Éclair, équipement | aucun |
| Coup de maître | 0 % | +1 % par 20 points de Flambée, équipement | 100 % sur un sort |
| Commis | 1 | équipement | 5 |
| Conservation (par élément) | 0 % | équipement, états | 40 % pour les artisans ; libre pour les monstres (de −50 % à +100 %) |
| Levure, Remontant, Ristourne | 0 | équipement, états | aucun |
| Savoir-faire | 0 | équipement, capital (2 points = +1) | aucun |

- **Le capital** : 5 points par niveau gagné. Une affinité coûte 1 point pour +1 jusqu'à 80, 2 points pour +1 de 81 à 160, 3 points au-delà. Victuailles : 1 point = 2 Victuailles. Savoir-faire : 2 points = +1. Le refaçonnage à l'Astrelier rend tous les points, gratuitement.
- **Les effets secondaires des affinités** (le jeu de mots, pas la copie) : Terroir → Rideau (on est planté), Soufflé → Faux-fuyant (on file comme le vent), Éclair → Ouverture (rapide comme l'éclair), Flambée → Coup de maître (le coup de feu), Eaudace → Victuailles (il faut de l'audace pour encaisser).
- **Objectif d'un artisan de niveau 200** : 10 à 11 CM, 5 à 6 Pas.

### 3.2 L'engagement

- Les groupes de 1 à 4 monstres sont visibles sur la carte et se promènent lentement. Le chef, plus gros, marche en tête.
- Toucher un groupe ouvre sa fiche : niveau de chaque membre, XP et Blé prévus, bonus d'Arrivage. Le bouton « Engager » lance le combat. Un glissement de doigt ne lance jamais de combat.
- Le combat se joue sur la carte de combat de la zone où l'on est. Les autres îles passent en grisé (la « vue en plan » d'Orvane : sol foncé, décor plein bien marqué).

### 3.3 La Mise en place

- Chaque carte de combat a 2 ou 3 jeux de cases de départ. En donjon, toujours le même ; ailleurs, on tourne d'un combat à l'autre.
- Les artisans ont 6 cases de départ dorées, les monstres 6 cases cuivre. Le jeu place les monstres ; chaque artisan touche une case dorée libre pour s'y poser, et peut en changer.
- On voit où sont les monstres. Toucher un monstre ouvre sa fiche.
- C'est là que l'initiateur du combat choisit la Commande (partie 3.21) et que chaque artisan choisit son bonus.
- Les alliés rejoignent en touchant la cloche de service posée à l'endroit où le combat a commencé.
- Le bouton « Envoyez ! » remplace « Prêt ». Le combat commence quand tous les artisans ont touché « Envoyez ! », ou au bout de 30 s en ligne. En solo, pas de limite.

### 3.4 L'ordre de jeu

- On calcule l'Ouverture moyenne de chaque camp. Le camp le plus haut commence ; en cas d'égalité, tirage au sort.
- Dans chaque camp, on classe les combattants par Ouverture décroissante. Puis on alterne : 1er du camp A, 1er du camp B, 2e de A, 2e de B… Quand un camp n'a plus personne à faire jouer, l'autre enchaîne.
- L'ordre est fixé au début du combat. Un Commis s'insère juste après son artisan. Un combattant tombé est sauté.
- La frise montre de petits portraits ronds, entourés d'un anneau de Victuailles, le combattant actif agrandi. Elle se replie vers le haut. Toucher un portrait amène la caméra sur ce combattant et ouvre sa fiche.

### 3.5 Le tour et le Minuteur

- Au début de son tour, un combattant retrouve tous ses CM et ses Pas (moins les retraits reçus, partie 3.14). Puis les effets « début de tour » s'appliquent : états, nappes, fournées.
- Il agit dans l'ordre qu'il veut : marcher, lancer, remarcher, relancer…
- Le tour finit quand il touche « Fin du tour », quand le Minuteur arrive au bout, ou quand il tombe. Les CM et Pas restants sont perdus.
- **Le Minuteur** : au début du tour, 25 s + 1 s par CM et par Pas (34 s avec 6 CM et 3 Pas). La moitié du temps non utilisé s'ajoute au tour suivant, sans dépasser 60 s. Il s'affiche en barre fine au-dessus des sorts.
- En solo, le Minuteur est désactivé par défaut. L'option « Minuteur strict » rapporte +10 % de Savoir-faire.
- En groupe, un artisan absent voit ses tours passés automatiquement. Après 3 tours manqués d'affilée, il quitte le service (il compte comme tombé).

### 3.6 Le déplacement

- Une case voisine = une des 4 cases qui touchent un côté du losange. Pas de diagonale en combat.
- Chaque case coûte 1 Pas.
- On ne traverse ni le décor plein, ni le vide entre les îles, ni un Ustensile, ni un combattant (allié compris). Un combattant Dérobé ennemi bloque aussi la case, mais on ne le sait qu'en s'y cognant : le déplacement s'arrête là.
- Hors combat : 8 directions.

### 3.7 Le Rideau : quitter le contact

- On est **au contact** d'un ennemi quand on occupe une des 4 cases voisines de la sienne. Seuls les ennemis visibles et debout retiennent (les Commis ennemis aussi ; pas les Ustensiles ni les combattants Dérobés).
- Quand on **quitte** une case au contact d'un ou plusieurs ennemis, on calcule, pour chaque ennemi au contact :
  **part gardée = (Faux-fuyant + 5) / (2 × Rideau de l'ennemi + 5)**, plafonnée à 100 %.
  Avec plusieurs ennemis au contact, on multiplie les parts.
- Les CM et les Pas restants (avant de payer le pas qui fait sortir) sont multipliés par cette part, arrondis au plus proche. **On garde toujours au moins 1 Pas**, pour pouvoir faire ce pas-là : on n'est jamais immobilisé.
- On part sans aucune perte si Faux-fuyant ≥ 2 × Rideau. L'état **Glissant** fait aussi partir sans perte.
- La perte s'affiche pendant l'aperçu du chemin (« −1 Pas, −2 CM » au-dessus de la case de sortie), et les cases devenues hors d'atteinte passent en gris barré.

| Ton Faux-fuyant | Ennemi(s) au contact | Part gardée | 6 CM et 3 Pas deviennent |
|---|---|---|---|
| 5 | 1 Grumeau (Rideau 5) | 10 / 15 = 67 % | 4 CM et 2 Pas (puis le pas de sortie : 1 Pas) |
| 5 | 2 Grumeaux (Rideau 5 et 5) | 67 % × 67 % = 44 % | 3 CM et 1 Pas (puis le pas de sortie : 0) |
| 10 | 1 Grumeau (Rideau 5) | 15 / 15 = 100 % | rien perdu |
| 5 | 1 Bouchevalier ennemi (Rideau 20) | 10 / 45 = 22 % | 1 CM et 1 Pas (le minimum) |

### 3.8 La ligne de vue

- On travaille sur la grille (X, Y), où les cases sont des carrés : l'écran en losanges n'en est qu'une rotation.
- On trace le segment entre le **centre** de la case du lanceur et le **centre** de la case visée, et on liste toutes les cases qu'il traverse (méthode dite « supercover »). Si le segment passe pile par un coin, entre deux cases, la vue n'est coupée que si **les deux** cases bloquent. La case du lanceur et la case visée ne comptent pas.
- **Coupent la vue** : le décor plein (four, étal, billot, caisse, lanterne, étoile), les Ustensiles, tout combattant visible (allié, ennemi, Commis).
- **Ne coupent pas la vue** : le vide entre les îles, les flaques et nappes au sol, les pièges, les combattants Dérobés.
- Le résultat est le même dans les deux sens : si je te vois, tu me vois.
- Un sort marqué « vue : non » ignore tout cela (poses au sol, sorts lancés en cloche, sorts du Terroir qui passent sous terre).
- À l'écran : Rayon visable en or plein avec contour, Rayon caché en or pâle hachuré, cases hors Rayon sans marque.

### 3.9 Le Rayon

- Une case est dans le Rayon si **min ≤ distance ≤ max**. Cela dessine un losange (troué au centre si min > 0).
- Si le sort est **modifiable**, max effectif = max du sort + bonus de Rayon du lanceur (jamais sous le min). Sinon, le bonus ne compte pas.
- **Manière de lancer** : libre ; en ligne (même X ou même Y, ce qui suit les bords des losanges à l'écran) ; en diagonale (|ΔX| = |ΔY|, ce qui donne une ligne droite horizontale ou verticale à l'écran) ; en ligne et en diagonale (8 branches).
- **Ce qu'on vise** : un ennemi, un allié, un combattant, une case libre, n'importe quelle case, ou soi.
- Une case est **visable** si elle est dans le Rayon, respecte la manière de lancer, a la vue (si le sort la demande) et le bon contenu.

### 3.10 Limites de lancer et relances

- **parTour** : lancers permis dans un même tour (0 = seulement limité par les CM).
- **parCible** : lancers permis sur un même combattant dans un même tour (0 = pas de limite). Pour un sort de zone, la cible est le combattant de la case visée.
- **relance** : nombre de tours du lanceur à attendre avant de relancer (0 = aucune).
- **relanceInitiale** : nombre de tours du lanceur avant le premier lancer du combat.
- **plafondPose** (sorts qui posent quelque chose) : nombre maximum d'objets de ce sort en même temps sur le terrain.
- Barème de départ :

| Type de sort | parTour | parCible | relance | Autre |
|---|---|---|---|---|
| Frappe à 2 CM | 3 | 2 | 0 | |
| Frappe à 3 CM | 2 | 1 | 0 | |
| Frappe à 4 CM et plus | 1 | 1 | 0 | |
| Zone de dégâts | 2 | 1 | 0 | |
| Soin, bouclier | 1 | 1 | 2 | |
| Bond, échange, téléportation | 1 | 0 | 2 | |
| Retrait de CM ou de Pas | 2 | 1 | 0 | |
| Pose au sol (piège, nappe, fournée, graine) | 2 | 0 | 0 | plafondPose 3 |
| Bonus sur soi ou ses alliés | 1 | 0 | 3 | |
| Appel d'un Commis | 1 | 0 | 4 | relanceInitiale 1 |
| Chef-d'œuvre | 1 | 0 | 5 | relanceInitiale 2 (pas avant le 3e tour) |
| Coup d'outil | 1 (Couteau : 2) | 0 | 0 | |

- À l'écran, un sort qui ne peut plus partir se grise, avec sa raison : « Plus de service pour ce tour », « Déjà servi à cette cible », « Revient dans 2 tours ».

### 3.11 Dégâts, soins et coup de maître

**Le coup de maître.** Chance = taux du sort + Coup de maître du lanceur, plafonnée à 100 %. Un sort à 0 % ne fait jamais de coup de maître (soins, boucliers, déplacements). On tire le coup de maître **avant** le jet. En coup de maître, on utilise la fourchette « maître » du sort (environ 25 % plus haute), et une toque dorée s'affiche au-dessus du chiffre.

**Les dégâts**, dans l'ordre :
1. Jet uniforme entre le minimum et le maximum (normal ou maître).
2. Multiplier par (100 + affinité de l'élément + Levure) / 100, arrondir à l'inférieur. Pour le Neutre, seule la Levure compte.
3. En zone, multiplier par la baisse de distance (partie 3.12).
4. Multiplier par (100 − Conservation de la cible dans cet élément) / 100. Conservation plafonnée à 40 % pour un artisan ; libre pour un monstre (négative = faiblesse).
5. Multiplier par les états qui changent les dégâts (Fumé, Marée basse…), qui se multiplient entre eux.
6. Arrondir à l'inférieur, jamais sous 0. Les boucliers absorbent d'abord, le reste va sur les Victuailles.
7. L'Entame s'applique aux dégâts reçus sur les Victuailles (partie 3.15).

**Les soins** : soin = jet × (100 + Levure) / 100 + Remontant. Un soin d'un élément (rare) ajoute aussi l'affinité de cet élément. Un soin ne dépasse pas le maximum de Victuailles (diminué de l'Entame).

**Exemple** : Mie-raille (10 à 14 Flambée) lancée par un Levainqueur qui a 30 en Flambée et 0 en Levure, sur un Grumeau qui craint la Flambée (Conservation −20 %). Jet 12 → 12 × 1,30 = 15,6 → 15 → 15 × 1,20 = 18 dégâts. Entame : 18 / 8 = 2, le maximum du Grumeau passe de 52 à 50.

**L'infobulle et l'aperçu** affichent la fourchette déjà calculée avec les caractéristiques du lanceur et la Conservation de la cible : « −13 à −18 (maître −16 à −22) ».

### 3.12 Les zones

| Forme | Description | Cases (taille 1 / 2 / 3) |
|---|---|---|
| case | la case visée seule | 1 |
| croix | la case visée et n cases dans les 4 directions | 5 / 9 / 13 |
| rond | toutes les cases à distance ≤ n de la case visée (un losange à l'écran) | 5 / 13 / 25 |
| anneau | le bord du rond seulement | 4 / 8 / 12 |
| ligne | la case visée et les n cases derrière elle, dans l'axe lanceur → cible | 2 / 3 / 4 |
| travers | n cases de chaque côté de la case visée, perpendiculaires à l'axe | 3 / 5 / 7 |
| cône | rangées de 1, 3, 5… cases qui s'élargissent derrière la case visée | 4 / 9 / 16 |
| demi-rond | la moitié du rond tournée vers l'arrière, la case visée comprise | 4 / 9 / 16 |
| carré | carré de (2n + 1) cases de côté sur la grille | 9 / 25 / 49 |
| terrain | toutes les cases | toutes |

- **Taille minimum** possible (par exemple un rond de 2 sans son centre).
- **La baisse avec la distance** : dans une zone, dégâts et soins baissent de **15 % par case d'éloignement de la case visée**, au plus 3 fois (55 % au minimum). Les états et la poussée ne baissent pas. Un sort peut être marqué « sans baisse ».
- **Qui est touché** (champ « touche ») : « ennemis », « alliés » ou « tous ». Par défaut, une zone de dégâts touche **tous** les combattants dedans, alliés et lanceur compris ; une zone de soutien ne touche que les alliés. L'aperçu signale chaque allié touché.
- Pour un sort lancé sur soi (« Soi, zone de 2 »), la case visée est celle du lanceur.

### 3.13 Poussée, attirance et Écrasement

- **Pousser de n cases** : la cible s'éloigne du lanceur, case par case, dans l'axe lanceur → cible. Si la cible n'est pas alignée, on prend l'axe le plus long ; à égalité parfaite, elle part en diagonale (chaque pas avance d'une case en X et en Y). Pour une zone qui pousse, chaque cible s'éloigne de la case visée, en commençant par la plus éloignée.
- **Attirer de n cases** : la cible vient vers le lanceur, et s'arrête au contact.
- La cible s'arrête si la case suivante est du décor plein, du vide, un Ustensile ou un combattant. **L'Écrasement** : pour chaque case de poussée qu'elle n'a pas pu faire, elle subit **12 + niveau du lanceur / 4** (arrondi à l'inférieur). Le combattant heurté en subit la moitié. Pas d'élément, pas de Conservation ; l'Entame s'applique. Rien ne se propage au-delà du premier heurté.
- Exemple : un Bouchevalier de niveau 40 lance Coup de jarret (repousse de 2) sur un Grumeau qui a un billot juste derrière lui : 2 cases bloquées × (12 + 10) = 44 dégâts.
- **Bond** : le lanceur va sur une case libre visée. **Échange** : deux combattants échangent leurs cases. **Passer dans le dos** : le lanceur va sur la case derrière la cible, si elle est libre.
- L'état **Planté** empêche tout déplacement forcé (poussée, attirance, échange, téléportation par un autre).
- Un piège sur le chemin d'une poussée se déclenche et arrête la cible.
- Idée à tester plus tard, propre à Orvane : pousser dans le vide fait « tomber dans les étoiles » (la cible revient au tour suivant sur une case de départ libre et perd 15 % de ses Victuailles).

### 3.14 Retraits de CM et de Pas

- Les retraits sont **garantis** : pas de tirage au hasard.
- Un combattant ne peut pas perdre plus de **2 CM et 2 Pas** par retraits entre deux de ses tours, toutes sources confondues (état Ramolli compris).
- Un retrait s'applique à son prochain tour : ses CM et Pas de départ sont réduits. Si c'est son tour, il s'applique tout de suite.

### 3.15 L'Entame

- Une part sur huit (12,5 %) des dégâts reçus sur les Victuailles réduit le maximum de Victuailles jusqu'à la fin du combat (comme une première tranche de pain qu'on ne remet pas).
- Certains sorts l'augmentent : le Tranchant du Bouchevalier la porte à 25 % sur sa cible pendant 2 tours. Plafond : 50 %.
- Les soins ne rendent pas l'Entame. Le maximum revient à la fin du combat.
- À l'écran, la part entamée s'affiche en gris hachuré au bout de la barre.

### 3.16 Les états

Une douzaine d'états, chacun avec son icône, pas plus. Un état dure un nombre de tours **du porteur** et décompte à la fin de son tour. Reposer le même état remet sa durée au maximum, sans cumul, sauf mention.

| État | Effet | Durée type | Exemples de sources |
|---|---|---|---|
| Brûlé | perd des Victuailles au début de son tour | 2 tours | Flan-bé |
| Ramolli | −1 Pas par couche, 2 couches au plus | 1 à 2 tours | Bâtard trempé, Coup de filet |
| Enraciné | ne peut plus marcher (il peut encore lancer) | 1 tour | Canapé, Charlotte |
| Planté | ne peut être ni poussé, ni attiré, ni déplacé de force | 1 à 2 tours | Billot |
| Glissant | quitte le contact sans rien perdre | 1 tour | sorts de Soufflé |
| Dérobé | invisible pour l'ennemi ; ne coupe pas la vue, ne retient pas ; lancer un sort montre sa case un instant | 1 à 2 tours | Service discret |
| Nappé | bouclier qui absorbe les dégâts ; jusqu'à 3 couches | 2 tours | Glaçage |
| Fumé | inflige 15 % de dégâts en moins | 1 tour | nappes de fumée du Pâtéladin |
| Attendri | −10 à −15 % de Conservation | 2 tours | Marinade, Attendrisseur |
| Affiné | compteur +1 par tour passé (5 au plus), renforce l'effet du Fromagicien | tant qu'il dure | Fromagicien |
| Fève | celui qui fait tomber le porteur gagne 1 CM | tout le combat | Galette des rois |
| Marée haute / Marée basse | +2 Rayon / +20 % de dégâts, alterne à chaque tour | permanent | Merlanceur |

Les états posés par un artisan disparaissent quand il tombe.

### 3.17 Au sol : nappes, pièges, fournées, graines, Ustensiles

- **Nappe** (visible) : une zone posée pour N tours. Elle agit sur qui commence son tour dedans, ou qui y entre, ou qui y finit son tour (champ « déclenche »), une fois par tour et par combattant. Exemples : le gril de la Sardinade, la fumée du Pâtéladin, le bouillon de la Bouillabaisse.
- **Piège** (caché à l'ennemi, visible pour ton camp) : 1 case. Il se déclenche quand un ennemi y entre, en marchant ou poussé. Il arrête son déplacement, applique ses effets (avec une zone éventuelle) puis disparaît. Pas sur une case occupée ni sur un autre piège. Au plus 3 pièges posés par artisan (le Buffet complet du Traîtreur).
- **Fournée** (visible, avec un compte à rebours) : elle éclate au début du tour de son poseur, après N tours, dans sa zone. Un chef-d'œuvre peut toutes les faire cuire d'un coup.
- **Graine** : elle devient un Commis au début du prochain tour du poseur, si la case est libre ; sinon elle attend.
- **Ustensile** : un objet posé qui occupe une case (four à pain, pièce montée, banc de sardines). Il bloque les Pas et la vue, a des Victuailles (on peut le casser), ne joue pas, n'apparaît pas dans la frise et ne compte pas dans les Commis. Un four à pain cassé avant la fin de sa cuisson n'éclate pas.
- Tout ce qu'un artisan a posé disparaît quand il tombe.

### 3.18 Les Commis

- Un artisan peut avoir autant de Commis en même temps que sa caractéristique Commis (1 au départ, 5 au plus).
- Un Commis joue juste après son artisan, contrôlé par l'IA (une option « Commis dressés », pour les diriger soi-même, pourra venir plus tard).
- Ses Victuailles et ses dégâts sont multipliés par (1 + niveau de l'artisan / 120).
- Il disparaît s'il tombe ou si son artisan tombe.

### 3.19 Tomber au combat

- À 0 Victuailles, le combattant « rend son tablier » : il quitte la grille, sa case se libère, ses tours sont sautés.
- Ses Commis, ses nappes, ses pièges, ses fournées et ses Ustensiles disparaissent. Les états qu'il a posés sur d'autres s'arrêtent (sauf la Fève).
- Pas de retour en combat (un futur sort rare pourrait l'offrir).
- Un camp perd quand tous ses combattants sont tombés (les Commis et Ustensiles ne comptent pas). Abandonner vaut défaite, sans butin.

### 3.20 La fin du combat : l'Addition

- **XP gagnée** = somme de l'XP des monstres × coefficient de groupe × part du joueur × (1 + Savoir-faire / 100) × écart de niveau × (1 + bonus de Commande) × (1 + Arrivage).
  - Coefficient de groupe (nombre d'artisans) : 1 → 1 ; 2 → 1,15 ; 3 → 1,35 ; 4 → 1,6.
  - Part du joueur = son niveau / somme des niveaux des artisans.
  - Écart de niveau : si le plus fort monstre a plus de 10 niveaux de moins que le joueur, −5 % par niveau au-delà, 20 % au minimum.
- **Blé** : la somme du Blé des monstres, partagée à parts égales.
- **Objets** : chaque monstre a sa liste d'objets et leurs taux. Taux réel = taux × (100 + Ristourne) / 100. On tire objet par objet, et les artisans sont servis dans l'ordre de Ristourne décroissante.
- **Défaite** : retour au dernier Four banal ou Établi visité, un peu d'usure sur l'équipement, la moitié de l'XP des monstres tombés, aucun objet.

### 3.21 La Commande

- Pendant la Mise en place, l'initiateur choisit une Commande parmi deux tirées au hasard (deux Commandes en donjon).
- Chaque artisan choisit son bonus : Savoir-faire **ou** Ristourne, de +25 % à +100 % selon la difficulté de la Commande et le rapport entre artisans et monstres. Ce choix est mémorisé.
- Tous les artisans doivent la respecter. Un manquement l'annule pour tout le camp (elle passe en rayé).
- Premières Commandes :

| Commande | Règle |
|---|---|
| Sans contact | ne jamais finir son tour à côté d'un ennemi |
| Fait minute | gagner avant la fin de la 5e manche |
| À la chaîne | faire tomber les ennemis dans l'ordre indiqué |
| Fait main | chaque ennemi tombe sous un Coup d'outil |
| Sans sel | aucun soin de tout le combat |
| Sur le plan de travail | au plus 1 Pas par tour |
| Une seule cuisson | ne jamais lancer deux fois le même sort dans un tour |
| Service en salle | ne jamais commencer deux tours de suite sur la même case |

### 3.22 Les monstres et leur IA

**La fiche d'un monstre** : niveau, Victuailles, CM, Pas, Ouverture, Rideau, Faux-fuyant, Conservation par élément, sorts (au format de la partie 4), comportement, XP, Blé, objets.

| | Grumeau (niveau 2) | Mie-tron (niveau 3) |
|---|---|---|
| Rôle | colle au contact | tire de loin, fuit le contact |
| Victuailles | 52 | 40 |
| CM / Pas | 4 / 3 | 5 / 3 |
| Ouverture | 80 | 130 (il joue avant toi) |
| Rideau / Faux-fuyant | 5 / 0 | 0 / 8 |
| Conservation | Flambée −20 %, Eaudace +30 % | Terroir −20 %, Soufflé +20 % |
| Sort 1 | Coup de pâte : 3 CM, Rayon 1, 8 à 11 Terroir, 1 par tour | Miettes : 2 CM, Rayon 2 à 5, vue, 6 à 9 Flambée, 2 par tour |
| Sort 2 | Pâte collante : 2 CM, Rayon 1 à 2, Ramolli 1 tour, relance 2 | Pincée de farine : 3 CM, Rayon 1 à 3, Fumé 1 tour, relance 3 |
| XP / Blé | 25 / 4 | 35 / 5 |

**L'IA, tour par tour :**
1. Si un sort peut faire tomber une cible, le lancer (en marchant d'abord si besoin).
2. Sinon, pour chaque case atteignable (en comptant la perte au Rideau) et chaque sort lançable depuis cette case : valeur = dégâts attendus (avec la Conservation de la cible) + bonus si la cible est la plus fragile − danger de la case (nombre d'artisans qui peuvent la frapper au prochain tour). Jouer le meilleur couple ; on peut lancer puis marcher.
3. Selon le comportement : « colle » finit son tour au contact de l'artisan le plus fragile ; « tire » finit à 3 à 5 cases, hors du contact, et si possible hors de vue de l'artisan au plus grand Rayon.
4. Sinon, avancer vers la cible choisie.

### 3.23 Ce que l'écran doit montrer

- **Agir en deux temps.** Premier toucher : l'aperçu. Pour la marche : le chemin, les Pas qui resteront, la perte au Rideau. Pour un sort : la zone dans la couleur de l'élément, « −13 à −18 » au-dessus de chaque cible, une toque renversée sur celles qui tomberaient, un avertissement sur chaque allié touché. Second toucher sur la même case (ou bouton « Lancer ») : on valide. Toucher ailleurs : on annule.
- **Les couleurs** : Pas en vert ; Rayon visable en or plein avec contour ; Rayon caché en or pâle hachuré ; zone dans la couleur de l'élément ; cases de départ en or (artisans) et cuivre (monstres) ; cases hors d'atteinte en gris barré.
- **La caméra** : elle cadre l'île du combat (zoom d'environ ×1,5, cases d'environ 55 × 28 pixels). On pince pour zoomer, double toucher pour recentrer sur son artisan.
- **Les fiches** : un appui long sur un combattant, un sort ou un objet ouvre sa fiche complète.
- **La place** : au moins 75 % de l'écran pour le terrain en combat. Le journal (2 lignes) et les signaux ne recouvrent jamais la grille.

### Annexe : les mots de Dofus à ne pas utiliser

PA, PM, PO, Tacle, Fuite, Initiative, Prospection, Sagesse, Puissance, Érosion, variante, grade, sorts communs, challenge, glyphe, mode tactique, mode créature, kamas, Zaap, Havre-Sac, Almanax, Kolizéum, percepteur, prisme, pods, forgemagie (et son jargon : exo, over, puits, runes Pa et Ra), Dofus (les œufs), les noms des 19 classes, des monstres (Bouftou, Tofu, Wabbit, Bwork…), des sorts (Bond, Colère, Pression, Flèche Explosive, Flamiche…), des challenges (Statue, Zombie, Barbare, Économe, Doume…) et des états (Intaclable, Inébranlable, Pesanteur, Lourd, Brokle, Téléfrag, Poisse).

---

## 4. Le format d'un sort

Aujourd'hui, un sort est une ligne : `[niveau, nom, élément, coups de main, rayon en texte, effet en texte, moteur]`. Le moteur ne peut pas lire une phrase comme « Rayon 1 à 4, en ligne » ou « repousse d'une case ». Il faut une fiche où chaque règle de la partie 3 a son champ.

### Les champs

| Champ | Ce qu'il contient | Exemple |
|---|---|---|
| id | un nom unique | `"levainqueur.mie-raille"` |
| classe, emplacement | la classe et la place dans le grimoire (1 à 16) | `"levainqueur"`, `2` |
| declinaisonDe | l'id du sort de base (vide pour un sort de base) | `null` |
| niveau, nom, element, cm | comme aujourd'hui | `1`, `"Mie-raille"`, `"F"`, `2` |
| rayon | `{ min, max, modifiable }` | `{ "min": 2, "max": 6, "modifiable": true }` |
| lancer | `"libre"`, `"ligne"`, `"diagonale"`, `"ligne+diagonale"` | `"libre"` |
| vue | la ligne de vue est-elle demandée ? | `true` |
| cible | `"ennemi"`, `"allie"`, `"combattant"`, `"caseLibre"`, `"case"`, `"soi"` | `"combattant"` |
| parTour, parCible | limites par tour (0 = aucune) | `3`, `2` |
| relance, relanceInitiale | en tours du lanceur | `0`, `0` |
| plafondPose | objets posés en même temps (sorts qui posent) | `3` |
| maitre | taux de coup de maître du sort, en % | `10` |
| zone | `{ forme, taille, tailleMin, baisse }` | `{ "forme": "case" }` |
| touche | `"ennemis"`, `"allies"`, `"tous"` | `"tous"` |
| effets | la liste des effets, dans l'ordre | voir ci-dessous |
| texte | la phrase d'ambiance (le jeu de mots), affichée dans l'infobulle, jamais lue par le moteur | `"Une volée de miettes brûlantes."` |
| change | pour une déclinaison : ce qui change par rapport au sort de base (le 8e champ d'aujourd'hui) | |

### Les effets : des briques

Un sort = une liste de briques. Chaque brique a un `type` et ses réglages. Les premières briques à coder :

| type | Réglages | Sorts actuels qui en ont besoin |
|---|---|---|
| degats | element, min, max, maitre [min, max] | presque tous |
| soin | min, max, maitre | Pain Béni, Puits d'amour |
| bouclier | valeur, tours, couchesMax | Glaçage, Étal royal |
| pousse / attire | cases | Baguette magique, Coup de jarret, Pétrissage, Hameçon |
| bond / echange / dans-le-dos | (aucun) | Croûte que croûte, Cocktail explosif, Tournedos |
| ramene | cases (attire un allié) | Paris-Brest |
| etat | nom, tours, couches | Flan-bé (Brûlé), Canapé (Enraciné), Marinade (Attendri) |
| retire | quoi (`"cm"` ou `"pas"`), n | Pain perdu, Bâtard trempé |
| bonus | carac, valeur, tours, qui | La Levée, Marée montante, Opéra |
| pose | quoi (`"nappe"`, `"piege"`, `"fournee"`, `"graine"`, `"ustensile"`), tours, déclenche, effets de l'objet | Four à pain, Amuse-bouche, Sardinade, Mitron |
| rebond | fois, rayon | Ficelle électrique, Anguille électrique |
| renforce | sort ou famille, valeur, tours | Fusil à aiguiser, Service à l'assiette |
| si | condition (`"cibleBlessee"`, `"dansLeDos"`, `"buffetComplet"`…), puis des briques | Bouchée à la reine, Dessert surprise |
| gainCM | n | Galette des rois (avec la Fève), Opéra |

Les sorts des monstres utilisent exactement le même format.

### Trois exemples tirés des sorts actuels

**1. Mie-raille (Levainqueur, niveau 1) : une frappe à distance.**

Aujourd'hui :
```
[1, "Mie-raille", "F", 2, "2 à 6", "10 à 14 dégâts Flambée : une volée de miettes brûlantes", "c|2|6|10|14"]
```
Demain :
```json
{
  "id": "levainqueur.mie-raille", "classe": "levainqueur", "emplacement": 2, "declinaisonDe": null,
  "niveau": 1, "nom": "Mie-raille", "element": "F", "cm": 2,
  "rayon": { "min": 2, "max": 6, "modifiable": true },
  "lancer": "libre", "vue": true, "cible": "combattant",
  "parTour": 3, "parCible": 2, "relance": 0, "relanceInitiale": 0,
  "maitre": 10,
  "zone": { "forme": "case" }, "touche": "tous",
  "effets": [
    { "type": "degats", "element": "F", "min": 10, "max": 14, "maitre": [13, 17] }
  ],
  "texte": "Une volée de miettes brûlantes."
}
```
Ce qui change en jeu : elle ne passe plus à travers les billots, elle profite du bonus de Rayon, et on ne peut plus la lancer trois fois sur le même Grumeau.

**2. Four à pain (Levainqueur, niveau 15) : une pose à retardement.**

Aujourd'hui :
```
[15, "Four à pain", "F", 4, "1 à 3", "Enfourne un four qui cuit 2 tours puis éclate : 30 à 36 dégâts Flambée autour"]
```
Demain :
```json
{
  "id": "levainqueur.four-a-pain", "classe": "levainqueur", "emplacement": 7, "declinaisonDe": null,
  "niveau": 15, "nom": "Four à pain", "element": "F", "cm": 4,
  "rayon": { "min": 1, "max": 3, "modifiable": false },
  "lancer": "libre", "vue": false, "cible": "caseLibre",
  "parTour": 1, "parCible": 0, "relance": 2, "relanceInitiale": 0, "plafondPose": 2,
  "maitre": 0,
  "zone": { "forme": "case" }, "touche": "tous",
  "effets": [
    { "type": "pose", "quoi": "fournee", "ustensile": true, "victuailles": 30, "tours": 2,
      "aLaCuisson": {
        "zone": { "forme": "rond", "taille": 1 }, "touche": "tous", "maitre": 15,
        "effets": [ { "type": "degats", "element": "F", "min": 30, "max": 36, "maitre": [37, 45] } ]
      } }
  ],
  "texte": "Enfourne un four qui cuit 2 tours puis éclate."
}
```
Ce qui change en jeu : le four occupe sa case et cache la vue pendant qu'il cuit, l'ennemi peut le casser avant qu'il n'éclate, et l'explosion touche aussi les alliés trop proches.

**3. Coup de jarret (Bouchevalier, niveau 40) : contact et poussée.**

Aujourd'hui :
```
[40, "Coup de jarret", "S", 3, "1", "16 à 20 dégâts Soufflé, repousse de 2 cases"]
```
Demain :
```json
{
  "id": "bouchevalier.coup-de-jarret", "classe": "bouchevalier", "emplacement": 10, "declinaisonDe": null,
  "niveau": 40, "nom": "Coup de jarret", "element": "S", "cm": 3,
  "rayon": { "min": 1, "max": 1, "modifiable": false },
  "lancer": "libre", "vue": true, "cible": "ennemi",
  "parTour": 2, "parCible": 1, "relance": 0, "relanceInitiale": 0,
  "maitre": 15,
  "zone": { "forme": "case" }, "touche": "ennemis",
  "effets": [
    { "type": "degats", "element": "S", "min": 16, "max": 20, "maitre": [20, 25] },
    { "type": "pousse", "cases": 2 }
  ],
  "texte": "Un coup sec dans le jarret, et l'ennemi recule."
}
```
Ce qui change en jeu : contre un billot ou un autre ennemi, la poussée bloquée inflige l'Écrasement (22 dégâts par case perdue au niveau 40), et un ennemi Planté ne bouge pas.

### Le vérificateur

Un petit script lit tous les sorts et signale : un champ manquant ; une frappe sans aucune limite (ni parTour, ni parCible, ni relance) ; une zone de dégâts sans « touche » ; un sort à 7 CM disponible avant le niveau 100 ; pour chaque classe et chaque élément, le nombre de sorts offensifs qu'on peut équiper ensemble aux niveaux 30, 50, 100 et 200.

---

## 5. Le moteur

### Réponse courte

Oui, un moteur graphique aidera, mais **pour l'écran, pas pour les règles**. Aucun des écarts de la partie 2 ne vient du dessin en SVG : la ligne de vue, le Rideau, l'ordre de jeu, les limites de sorts et l'IA sont du calcul. Ce qui aide vraiment, c'est de sortir les règles dans un **module à part, sans affichage**, que je peux tester en quelques secondes sans navigateur, et qui servira tel quel au téléphone et au serveur. Ensuite, Phaser apportera la caméra, le zoom au doigt, les animations et la fluidité.

### a) Le prototype jouable dans la page

**Ce que la maquette SVG fait bien** : dessiner les personnages (tes 8 classes sont dessinées en SVG, nettes à toutes les tailles), un petit terrain, des cases qu'on touche.

**Ce qu'elle ne permet pas bien :**
- Pas de caméra ni de zoom au doigt : il faudrait tout coder à la main (cadrage, pincer, glisser, limites).
- Chaque case, chaque effet est un élément de la page. C'est très bien pour 80 cases, mais les animations (farine qui vole, flammes de la Flambée, fumée du Pâtéladin, personnages qui marchent image par image, chiffres qui montent) deviennent vite lourdes sur un téléphone moyen.
- Pas d'animations d'images, pas de transitions adoucies toutes prêtes, pas de particules, pas de sons gérés. Le tri de profondeur se fait à la main.
- Les règles, le dessin et les menus sont mêlés dans un seul fichier : difficile à tester et à faire grandir.

**Ce qu'apporterait Phaser 3** (gratuit, licence MIT, disponible sur cdnjs : `https://cdnjs.cloudflare.com/ajax/libs/phaser/3.90.0/phaser.min.js`, environ 1 Mo) :
- une caméra : zoom, déplacement, suivi d'un personnage, limites ;
- le toucher à plusieurs doigts (le pincer se code en quelques lignes) ;
- des transitions adoucies (un personnage qui glisse de case en case, un chiffre qui monte et s'efface), des particules, des animations d'images, des sons ;
- un tri de profondeur simple (chaque objet reçoit une profondeur selon X + Y) ;
- un dessin rapide en WebGL (avec repli automatique), pensé pour les téléphones ;
- la lecture des cartes en losanges dessinées avec Tiled, déjà prévu dans le plan.

Tes dessins SVG actuels restent : on les transforme en images au chargement. Les menus (barre de sorts, onglets) restent en HTML par-dessus le terrain : c'est exactement l'organisation de Dofus Touch.

**PixiJS** (8.23.0 sur cdnjs) dessine encore plus vite et pèse moins, mais il ne fait que dessiner : caméra, toucher, transitions et cartes seraient à écrire nous-mêmes.

**Recommandation : Phaser 3.90.0** pour le prototype. C'est la version la plus documentée (des milliers d'exemples) et c'est le moteur déjà choisi par le plan. Phaser 4 existe aussi (4.2.1, sur cdnjs) ; on pourra y passer au moment de créer le vrai projet, le code change peu.

### b) Le vrai jeu sur téléphone

| | Phaser + TypeScript + Capacitor (le plan actuel) | Godot 4 | Unity 6 |
|---|---|---|---|
| Coût | gratuit | gratuit (licence MIT) | gratuit jusqu'à 200 000 $ de revenus, puis 2 310 $ par an et par poste |
| Langage | TypeScript (du JavaScript typé) | GDScript (C# encore expérimental sur téléphone) | C# |
| Losanges | à la main ou via Tiled, simple pour du tour par tour | intégré (cartes en tuiles isométriques, tri par profondeur) | intégré |
| Tester sur ton téléphone | un lien à ouvrir, rien à installer | une application à installer à chaque essai (la version web est plus lourde) | une application à installer à chaque essai |
| Serveur qui arbitre les combats | le **même** module de règles tourne sur le serveur Colyseus (même langage) | règles à réécrire pour le serveur, ou un Godot sans écran sur le serveur | règles à réécrire, ou un Unity sans écran sur le serveur |
| Exemple connu | Dofus Touch (JavaScript, canvas et HTML) | | Dofus 3, Waven |
| Point faible | la batterie et les téléphones bas de gamme (reproche fait à Touch) | export iPhone qui demande un Mac ; reprendre le prototype | lourd, éditeur à apprendre, conditions de licence |

**Recommandation : garder le plan, Phaser + TypeScript + Capacitor, avec Colyseus pour le serveur.** Les raisons :
1. **Les mêmes règles partout.** Le module de règles, écrit en TypeScript, tourne dans le navigateur, dans l'application et sur le serveur. C'est le serveur qui tranche chaque action avec le même code : la meilleure protection contre la triche et les robots, premier reproche fait à Touch.
2. **Tu testes par un lien**, à chaque étape, sans rien installer. Les données (sorts, cartes, monstres) se mettent à jour sans repasser par les stores.
3. **Un jeu de tour par tour en 2D ne demande pas un gros moteur.** Dofus Touch tourne depuis 10 ans sur cette organisation (4,6 sur 5 sur l'App Store).
4. **Tout est gratuit**, et c'est moi qui écris le code : un éditeur visuel comme celui de Godot ou d'Unity t'apporterait peu.

Le risque à surveiller : la fluidité et la batterie sur un Android bas de gamme. On le mesure dès le premier prototype (dessiner seulement quand quelque chose bouge, 30 images par seconde au repos). Si le test échoue, **Godot 4 est le plan B**, et le serveur reste en TypeScript avec Colyseus, qui propose un kit pour Godot. Unity n'apporterait rien de décisif pour un jeu 2D au tour par tour, et coûterait une réécriture complète.

**Les coûts à prévoir :**
- Phaser, TypeScript, Capacitor, Tiled, Colyseus : 0 €.
- Serveur en ligne : environ 15 à 20 € par mois au début (Colyseus Cloud à partir de 15 $ par mois, ou un petit serveur loué).
- Google Play : 25 $, une seule fois.
- iPhone : 99 $ par an (programme développeur d'Apple), plus un Mac avec Xcode ou un service de compilation en ligne (par exemple les machines macOS de GitHub Actions ou Codemagic).

**Ce que tu dois installer ou décider :**
- **Maintenant** : rien à installer. Une seule décision : confirmer Phaser.
- **Pour les essais sur téléphone** : un téléphone Android, même ancien, pour juger la fluidité, en plus de ton téléphone habituel.
- **Pour publier** : un compte Google Play ; pour l'iPhone, un compte Apple développeur et un Mac ou un service de compilation en ligne.

---

## 6. Ce que je propose de faire maintenant

1. **Tu valides 7 choix** (ma proposition entre parenthèses) :
   - la formule du Rideau, avec toujours au moins 1 Pas gardé (oui) ;
   - les zones de dégâts touchent aussi les alliés, avec un aperçu qui prévient (oui) ;
   - le soin sur soi réservé au Pâtéladin et au Pâtissorcier, le Pain de route pour les autres (oui) ;
   - le Minuteur de 25 s + 1 s par CM et par Pas, facultatif en solo (oui) ;
   - les effets secondaires des affinités : Terroir → Rideau, Soufflé → Faux-fuyant, Éclair → Ouverture, Flambée → Coup de maître, Eaudace → Victuailles (oui) ;
   - +1 CM au niveau 100 et le chef-d'œuvre gardé au niveau 200 (oui) ;
   - Phaser pour le prototype et le vrai jeu, Godot en plan B (oui).
2. **J'écris le module de règles**, sans affichage : grille, chemins, Rideau, ligne de vue, Rayon, limites et relances, dégâts et coup de maître, zones, poussée et Écrasement, Entame, états, ordre de jeu, Minuteur, Commande. Avec une soixantaine de petits tests qui tournent en quelques secondes.
3. **Je passe les sorts au nouveau format.** D'abord les 40 sorts des niveaux 1 à 6 et leurs déclinaisons, en réécrivant le départ des 8 classes pour leur donner une identité. Puis un script pré-convertit les autres et me donne la liste de ceux à relire à la main.
4. **Je fais les fiches du Grumeau et du Mie-tron et leur IA**, puis je simule un millier de combats pour régler les chiffres : un bon placement doit coûter 30 à 40 % des Victuailles, un mauvais doit pouvoir faire perdre.
5. **Je branche ces règles sur la maquette actuelle** : ligne de vue, Rideau, limites, ordre alterné, monstres à sorts, aperçu en deux temps, Rayon bien visible. **Tu la testes** sur ton téléphone par le lien : est-ce que ça « sent » Dofus maintenant ?
6. **Je refais le combat avec Phaser 3.90.0** dans la page : Fourneau en portrait avec ses obstacles, caméra et zoom, Mise en place, groupes visibles sur la carte, Minuteur, une première Commande. Tes dessins SVG sont réutilisés.
7. **Ensuite seulement**, l'étape 1 du plan : le projet TypeScript + Capacitor + Colyseus, avec le même module de règles côté serveur.
