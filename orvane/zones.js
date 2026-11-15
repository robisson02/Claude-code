// Le monde d'Orvane : zones, Grandes Enseignes (boss en jeux de mots), boss final, sbires, précautions.
// Document de conception interne : le champ « reelle » n'apparaît jamais dans le jeu.
window.ORVANE = window.ORVANE || {};
ORVANE.MONDE = {
 "fil_rouge": "Le jour où quelqu'un a cassé les prix d'Orvane, les morceaux sont devenus des créatures : les Grandes Enseignes. Depuis, elles avalent une à une les terres des artisans, changent les marchés en parkings et les métiers en rayons tous pareils. Sortis de l'Astrelier, les huit métiers se retrouvent à Grand-Étal et reprennent le monde zone par zone : chaque enseigne vaincue dans son donjon rend ses étals aux gens du coin. Plus on s'éloigne de Grand-Étal, plus elles grossissent : les supérettes d'abord, puis les discounters et les bazars, les spécialistes du frais et du froid, les supermarchés, les grossistes, les hypermarchés, et enfin les fantômes des enseignes disparues qui hantent les friches. Et sous Grand-Étal, dans des cryptes noyées d'eau claire, nage un brochet d'or bien vivant, lui, qui refait partout le même tour, dans le même ordre. Viennent ensuite les deux gardiens du Massif-Centrale et du Grand Fournil. Car tout se joue sous le Grand Fournil, le four originel où cuit la toute première fournée du monde. Son premier feu est né d'un éclair. C'est là, dans le Nid d'Orage, que l'Élé-Clair, un dragon de néons qui a volé l'élément Éclair aux artisans, aspire la chaleur du four pour nourrir ses néons, jusqu'à ce qu'il n'en reste qu'une enseigne allumée au-dessus d'un four froid.",
 "zones": [
  {
   "nom": "L'Astrelier",
   "niveaux": "1 à 12",
   "paysage": "Le grand atelier intérieur où chaque artisan apprend son métier : établis, pétrins, chambres de pousse et plans de travail grands comme des plaines, sous un plafond d'étoiles en sucre. Au fond, une penderie où sèchent les tabliers de tous les métiers.",
   "jeu_zone": "Astre + atelier : l'atelier des étoiles (nom déjà validé).",
   "monstres": [
    {
     "nom": "Croque-Monsieur",
     "jeu": "Le sandwich qui croque vraiment les passants (déjà validé)."
    },
    {
     "nom": "Pain perdu",
     "jeu": "Une tranche qui s'est perdue dans l'atelier, et qui vous perd avec elle (déjà validé)."
    },
    {
     "nom": "Mie-graine",
     "jeu": "Mie + migraine : une miette qui tape sur la tête."
    }
   ],
   "enseigne": {
    "nom": "La Proxi-Mite",
    "reelle": "Proxi",
    "jeu": "Proxi + mite : à voix haute, on entend « proximité ». C'est la mite des vêtements, celle qui ronge le tissu. Ici, c'est le tissu du quartier, à commencer par les tabliers des artisans.",
    "forme_boss": "Une mite géante aux ailes poudrées d'étiquettes de prix, qui sort la nuit de la penderie et grignote les tabliers suspendus.",
    "donjon": "La Penderie des Tabliers : c'est le premier donjon d'enseigne, et le Grand Moule reste le boss de fin de l'Astrelier.",
    "mecanique": "Combat-tutoriel sur le placement. Proximité : elle se colle toujours à la case voisine du joueur le plus faible et lui grignote 1 Coup de main à chaque contact ; on apprend à se protéger derrière les établis. À chaque tour, elle pond un cocon « ouvert 7 j/7 » sur une case vide : s'il n'est pas écrasé en 2 tours, il éclôt en petite mite. Ouvrir les portes de la penderie (cases-lumière) la fait reculer. C'est elle qui révèle la menace des Enseignes."
   },
   "confiance": "sûr",
   "alternatives": [
    "La Proximite, en un seul mot : on lit « proximité » et le nom de l'enseigne ne ressort plus.",
    "La Mitoyenne (mite + mitoyenne, la voisine d'à côté) : aucune syllabe de l'enseigne."
   ]
  },
  {
   "nom": "Grand-Étal",
   "niveaux": "Ville neutre, sans niveau (on y arrive en sortant de l'Astrelier)",
   "paysage": "La capitale-marché au centre du monde : halles en fonte, étals des huit métiers, banque du Blé, ateliers de classe, hôtel des ventes entre joueurs. On ne s'y bat pas, mais les Enseignes y envoient leurs éclaireurs pour racheter les étals un par un.",
   "jeu_zone": "Le grand étal du marchand, en version capitale (nom déjà validé).",
   "monstres": [
    {
     "nom": "Chat-Pelure",
     "jeu": "Chat + chapelure : le chat des halles, qui suit les boulangers (habitant, ne se bat pas)."
    },
    {
     "nom": "Chien-de-Garde-Manger",
     "jeu": "Chien de garde + garde-manger : il veille sur les réserves des échoppes (habitant, ne se bat pas)."
    },
    {
     "nom": "Mouette-Frite",
     "jeu": "Mouette + moules-frites : elle chaparde les frites en terrasse (habitante, ne se bat pas)."
    }
   ],
   "enseigne": {
    "nom": "Le Moineau-Prix",
    "reelle": "Monoprix",
    "jeu": "« Mo-no-pri » devient « mwa-no-pri » : moineau + prix. Le moineau, l'oiseau des centres-villes, pour une enseigne de centre-ville. On reconnaît l'enseigne tout de suite, et c'est tendre.",
    "forme_boss": "Un moineau dodu au plumage impeccable, qui picore les miettes des étals et rêve de faire son nid sur la place du marché.",
    "donjon": "Pas de donjon : le Nid-de-Prix, perché sur le beffroi des halles.",
    "mecanique": "Comme la ville est neutre, il n'y a pas de combat mais un événement de serveur, « l'Implantation ». Le Moineau-Prix bâtit son nid brindille par brindille, et les joueurs le font fuir en faisant vivre le marché : ventes, fabrications, commandes entre artisans. Si le nid est terminé, un étal de la ville baisse ses volets pour une semaine."
   },
   "confiance": "sûr",
   "alternatives": [
    "Le Monoprisme : un cristal qui ramène toutes les couleurs à une seule. Il a la meilleure mécanique de combat (tous les sorts forcés dans un seul élément), mais le jeu de mots est moins drôle.",
    "Le Monotone : la standardisation sans « prix » dans le nom, c'est la version la plus prudente."
   ]
  },
  {
   "nom": "Les Prés-Salés",
   "niveaux": "13 à 19",
   "paysage": "Prairies rases au bord de la mer, troupeaux dans les embruns, salicornes et marais salants où le sel sèche en petites montagnes blanches.",
   "jeu_zone": "Le pré-salé, l'agneau qui broute l'herbe salée, et des prés vraiment salés (nom déjà validé).",
   "monstres": [
    {
     "nom": "Bouc-émissaire",
     "jeu": "Le bouc à qui on fait tout porter : il prend les coups à la place de ses alliés (déjà validé)."
    },
    {
     "nom": "Sali-corne",
     "jeu": "La salicorne, plante des marais salants, devient une bête à corne qui charge."
    },
    {
     "nom": "Grain-de-Sel",
     "jeu": "Mettre son grain de sel : un cristal qui se mêle de tous les combats et renforce l'ennemi le plus proche."
    }
   ],
   "enseigne": {
    "nom": "Le Vivaloup",
    "reelle": "Vival",
    "jeu": "Vival + loup : « vi-va-lou », on entend l'enseigne au début. Dans un pays de moutons, le loup se cache forcément dans le troupeau. La blague tient au combat (trouver le loup), pas à un reproche fait à l'enseigne.",
    "forme_boss": "Un grand loup sous une peau de mouton, avec au cou une clochette de porte de boutique.",
    "donjon": "La Bergerie-Supérette",
    "mecanique": "Loup déguisé : le combat commence avec 6 moutons sur la carte, dont l'un est le Vivaloup. Frapper un vrai mouton le fait fuir et rend des Victuailles au loup. L'indice : une étiquette de prix dépasse de sa laine. Une fois démasqué, il hurle et appelle 2 Sali-cornes."
   },
   "confiance": "sûr",
   "alternatives": [
    "La Vive-Valise : une valise-mimic livrée par colis. Une relecture la préfère, mais on y entend moins l'enseigne.",
    "Le Loup-du-Coin : le même combat des six moutons, sans renvoi à l'enseigne."
   ]
  },
  {
   "nom": "Les Faubourguignons",
   "niveaux": "20 à 26",
   "paysage": "Les faubourgs de Grand-Étal : ruelles pavées qui mijotent, cheminées fumantes, petites places où les vieilles échoppes baissent le rideau une à une. La nuit, un orage tourne au-dessus d'une arrière-boutique.",
   "jeu_zone": "Faubourg + bœuf bourguignon : la banlieue qui mijote à feu doux.",
   "monstres": [
    {
     "nom": "Pigeon-aux-petits-pois",
     "jeu": "Le plat, et « pigeonner » : il vous arnaque en roucoulant."
    },
    {
     "nom": "Chat-teaubriand",
     "jeu": "Chateaubriand + chat de gouttière : un matou épais comme un steak."
    },
    {
     "nom": "Poubelle-Hélène",
     "jeu": "Poire Belle-Hélène + poubelle : une poubelle nappée de chocolat qui avale tout ce qui traîne."
    }
   ],
   "enseigne": {
    "nom": "Le Frankenprix",
    "reelle": "Franprix",
    "jeu": "« Fran-ken-pri » : on entend l'enseigne, et on voit tout de suite le monstre recousu, une supérette faite de morceaux de rayons greffés dans la rue.",
    "forme_boss": "Une créature rapiécée de pièces dépareillées : un bras en baguette, une jambe en boîte de conserve, une tête en carton de pizza, des coutures en ruban d'étiquettes. Ni tête plate ni boulons dans le cou : on s'inspire du roman, pas du film.",
    "donjon": "Le Laboratoire du Docteur Rabais, une arrière-boutique sous l'orage.",
    "mecanique": "Greffe : quand un monstre meurt près de lui, il récupère le morceau et gagne un de ses sorts. Recharge : tous les 3 tours, la foudre frappe un des paratonnerres de l'arène, et s'il est dessous, il se soigne. Un joueur peut prendre sa place (il encaisse la foudre, mais le boss ne se soigne pas) ou abattre le paratonnerre. Ses coutures craquent sous la Flambée."
   },
   "confiance": "sûr",
   "alternatives": [
    "Le Frankenstock (Frankenstein + stock) : la même créature greffée, sans « prix » dans le nom.",
    "Le Roi Frangiprix : une galette des rois qui veut se faire sacrer roi du quartier. Il est gourmand, mais très proche de l'enseigne à l'écrit."
   ]
  },
  {
   "nom": "La Pointe-de-Brie",
   "niveaux": "27 à 33",
   "paysage": "Un cap de craie en forme de part de fromage qui s'avance dans la mer : falaises à croûte fleurie, parcs à huîtres à marée basse.",
   "jeu_zone": "La pointe de brie (la part de fromage) + la pointe, le cap rocheux qui avance dans la mer.",
   "monstres": [
    {
     "nom": "Bar-bare",
     "jeu": "Bar (le poisson) + barbare (déjà validé)."
    },
    {
     "nom": "Tourteau-pilleur",
     "jeu": "Le crabe qui pille les casiers (déjà validé)."
    },
    {
     "nom": "Bulutin",
     "jeu": "Bulot + lutin : un petit escargot de mer farceur."
    }
   ],
   "enseigne": {
    "nom": "Le Huit-à-Huître",
    "reelle": "8 à Huit",
    "jeu": "« De huit à huit » devient « huit à huître » : on garde l'ordre exact de l'enseigne et on finit en coquillage. Et huit bras, forcément.",
    "forme_boss": "Une huître géante d'où sortent huit bras de poulpe. Sa coquille monte et descend comme un rideau de fer.",
    "donjon": "Le Parc à Horaires : un parc à huîtres où chaque piquet affiche une heure d'ouverture.",
    "mecanique": "Horaires d'ouverture : coquille fermée, elle est invulnérable et renvoie les sorts. Une cloche sonne « Ouvert » un tour sur trois, et c'est le seul moment pour frapper le cœur. Pendant la fermeture, ses huit bras frappent seuls et se coupent un par un ; une fois les huit coupés, la coquille reste ouverte pour de bon. Perle d'appel : coquille ouverte, elle aspire le joueur le plus proche. Tous les 4 tours, la marée monte et noie les cases basses."
   },
   "confiance": "sûr",
   "alternatives": [
    "L'Huître-à-Huit : la même idée dans l'autre sens.",
    "La Pieuvre Huit-à-Nuit : la version la plus éloignée de l'enseigne, sur l'idée de la boutique ouverte tard."
   ]
  },
  {
   "nom": "Les Sablés-d'Olonne",
   "niveaux": "34 à 40",
   "paysage": "Un désert de sablé doré dont les dunes s'émiettent sous les pas, avec des oasis de caramel au beurre salé, des pyramides de sucre en morceaux et des mirages de néon à l'horizon.",
   "jeu_zone": "Les Sables-d'Olonne + le sablé (le biscuit) : un désert qui croque.",
   "monstres": [
    {
     "nom": "Chameau-mille",
     "jeu": "Chameau + camomille : il endort ses adversaires comme une tisane."
    },
    {
     "nom": "Scorpi-oignon",
     "jeu": "Scorpion + oignon : son dard fait pleurer."
    },
    {
     "nom": "Cara-vanille",
     "jeu": "Caravane + vanille : une file de gousses qui avance dans les dunes."
    }
   ],
   "enseigne": {
    "nom": "Le Sparadrap",
    "reelle": "Spar",
    "jeu": "Spar → sparadrap : l'enseigne s'entend au début d'un mot courant, et le pansement colle à l'idée du magasin de dépannage. Dans un désert, ça donne une momie.",
    "forme_boss": "Une momie emmaillotée de sparadrap, sortie d'une pyramide de boîtes de conserve, qui se déroule pour attraper ses proies.",
    "donjon": "La Pyramide de Conserves",
    "mecanique": "Adhésion forcée : chaque coup colle une bande sur un joueur. À 3 bandes, il devient « Adhérent » et ne peut plus s'éloigner à plus de 2 cases du boss. Pour le décoller, un allié arrache la bande (1 Coup de main, et ça pique un peu les Victuailles), ou un sort de Flambée fait fondre la colle. Plus la momie se déroule, plus elle couvre de cases, mais plus elle est mince et fragile. Un tour sur deux, une tempête de sable cache la moitié de la carte."
   },
   "confiance": "sûr",
   "alternatives": [
    "Le Sparesseux (Spar + paresseux) : plus drôle, mais seulement si la blague vise le libre-service où le client fait tout lui-même, jamais des salariés paresseux.",
    "La Momie-Dépanneuse : le même boss, sans trace de l'enseigne."
   ]
  },
  {
   "nom": "Les Causses-Croûtes",
   "niveaux": "41 à 47",
   "paysage": "Hauts plateaux de calcaire battus par le vent, herbe rase, murets de pierre sèche, gouffres et brebis maigres : la terre la plus sèche du monde.",
   "jeu_zone": "Les causses (plateaux arides du Sud) + casse-croûte : un pays où l'on mange sur le pouce, sec et sans beurre.",
   "monstres": [
    {
     "nom": "Brebis-cuit",
     "jeu": "Brebis + biscuit : une brebis rassise et croustillante, qui s'émiette quand on la frappe."
    },
    {
     "nom": "Hérisson-saucisson",
     "jeu": "Hérisson + saucisson : piqué de grains de poivre, il roule en boule."
    },
    {
     "nom": "Fougasse-fugace",
     "jeu": "Fougasse + fugace : elle apparaît, frappe et disparaît."
    }
   ],
   "enseigne": {
    "nom": "Le Lézard-Prix",
    "reelle": "Leader Price",
    "jeu": "« Lé-zar-pri » se prononce presque comme l'enseigne : un lézard qui se dore au soleil des petits prix.",
    "forme_boss": "Un lézard géant au dos couvert d'étiquettes, qui laisse sa queue derrière lui dès qu'on le serre de près.",
    "donjon": "Le Pierrier des Prix Cassés",
    "mecanique": "Prix cassé : à chaque quart de Victuailles perdu, il abandonne sa queue, qui devient un leurre « produit d'appel » : elle attire les coups pendant qu'il se régénère. Il faut ignorer les queues et viser la tête. Au soleil, il se recharge ; les cases d'ombre des murets le ralentissent."
   },
   "confiance": "sûr",
   "alternatives": [
    "Le Lézard-Leurre : la même queue-leurre, sans le son de l'enseigne."
   ]
  },
  {
   "nom": "Les Hauts-de-Cuisse",
   "niveaux": "48 à 54",
   "paysage": "Hauts plateaux battus par le vent, tourbières et mares, rochers en forme de pilons, poulaillers abandonnés.",
   "jeu_zone": "Haut de cuisse (le morceau de volaille) + les Hauts, comme le nom d'une région.",
   "monstres": [
    {
     "nom": "Caille-ou",
     "jeu": "Caille + caillou : une caille de pierre."
    },
    {
     "nom": "Poule-ardente",
     "jeu": "Poularde + ardente : une poule en flammes."
    },
    {
     "nom": "Poule-mouillée",
     "jeu": "Une poule trempée et peureuse : elle fuit, puis soigne ses voisines."
    }
   ],
   "enseigne": {
    "nom": "La Foire-Grenouille",
    "reelle": "La Foir'Fouille",
    "jeu": "La Foir'Fouille → la Foire-Grenouille : même rythme, même rime en « -ouille », et la grenouille saute de stand en stand. Ici, dans les Hauts-de-Cuisse, ça donne forcément des cuisses de grenouille. On l'écrit avec un tiret, jamais avec l'apostrophe de l'enseigne.",
    "forme_boss": "Une grenouille énorme, le dos couvert de babioles entassées (bougies parfumées, cadres, guirlandes), dont la langue traverse toute l'arène.",
    "donjon": "La Mare au Bazar",
    "mecanique": "Grand fouillis : la carte est couverte de tas d'objets, et chacun cache un piège, un bonus ou un têtard. Elle saute de tas en tas (3 cases d'un bond). Fouille : sa langue attrape un objet dans le sac d'un joueur, et elle s'en sert contre lui au tour suivant. Vider les tas lui retire ses cachettes, et la battre rend tout ce qu'elle a volé."
   },
   "confiance": "sûr",
   "alternatives": [
    "La Grenouille-Bazar : la même bête, sans le son de l'enseigne.",
    "La Foire-Fouine : la plus proche à l'oral, mais une relecture la juge trop proche de la marque (une seule syllabe change)."
   ]
  },
  {
   "nom": "La Forêt-Noire",
   "niveaux": "55 à 61",
   "paysage": "Forêt sombre de cerisiers géants, sous-bois de chantilly, ruisseaux de kirsch et copeaux de chocolat en guise de feuilles mortes. Sur la plus haute colline se dresse un château aux volets toujours clos.",
   "jeu_zone": "Le gâteau forêt-noire, et une forêt bien sombre (nom déjà validé).",
   "monstres": [
    {
     "nom": "Kirschouette",
     "jeu": "Kirsch + chouette (déjà validé)."
    },
    {
     "nom": "Sanglier-chantilly",
     "jeu": "Un sanglier tout en crème fouettée (déjà validé)."
    },
    {
     "nom": "Citrouille-garou",
     "jeu": "Citrouille + loup-garou, qui se transforme les nuits de pleine lune (déjà validé)."
    }
   ],
   "enseigne": {
    "nom": "Le Nozfératu",
    "reelle": "Noz",
    "jeu": "Noz + Nosferatu : l'enseigne est soudée au vampire, ça s'entend tout de suite. Il ne boit que des fins de série et des invendus.",
    "forme_boss": "Un vampire maigre et pâle, drapé dans une cape en bâche de déstockage, qui dort dans un carton de palette. Il s'inspire du vampire de légende, pas d'un film précis.",
    "donjon": "Le Château des Fins de Série",
    "mecanique": "Déstockage : chaque monstre vaincu revient sous ses ordres comme « invendu », avec moitié moins de Victuailles. Carton surprise : à chaque tour, il ouvre un carton dont personne ne connaît le contenu, pas même lui. Il craint la lumière : actionner les leviers ouvre les volets du château, et les sorts Éclair lui font double dégâts."
   },
   "confiance": "sûr",
   "alternatives": [
    "Le Comte Déstockula (Dracula + déstockage) : le même vampire des invendus, sans le nom de l'enseigne.",
    "Le Nosfé-Rabais : la même bête, sans les lettres de l'enseigne."
   ]
  },
  {
   "nom": "Le Lac-Tose",
   "niveaux": "62 à 68",
   "paysage": "Immense lac de lait aux brumes crémeuses, rives de beurre, îlots de fromage frais et nénuphars de crème.",
   "jeu_zone": "Lactose + lac.",
   "monstres": [
    {
     "nom": "Caillé-man",
     "jeu": "Lait caillé + caïman."
    },
    {
     "nom": "Lait-mure",
     "jeu": "Lait + lémure : un fantôme pâle des brumes."
    },
    {
     "nom": "Lait-viathan",
     "jeu": "Lait + Léviathan : le serpent du lac."
    }
   ],
   "enseigne": {
    "nom": "L'Al-Djinn",
    "reelle": "Aldi",
    "jeu": "Aldi → Al-Djinn : on entend « Al-di… », puis le génie. Il sort d'une brique de lait longue conservation au lieu d'une lampe.",
    "forme_boss": "Un génie de fumée blanche qui sort d'une brique de lait géante, coiffé d'un bouchon à vis. Ni peau bleue ni allure de génie de dessin animé.",
    "donjon": "La Brique Magique",
    "mecanique": "Trois vœux à prix cassé, annoncés clairement : au début, chaque joueur peut accepter un vœu. Le génie affiche tout de suite le contrat : un gros bonus pendant 4 tours, puis le même effet en malus pendant 2 tours. Il n'y a pas de piège caché, c'est un pari tactique. Les joueurs qui refusent gagnent un bouclier de Lucidité. Pour le vaincre, il faut le renfermer dans sa brique en faisant sauter ses trois bouchons."
   },
   "confiance": "sûr",
   "alternatives": [
    "L'Al-Dindon (le dindon de la farce) : le plus drôle, mais une relecture le juge risqué, parce qu'il dit que le client se fait avoir.",
    "Le Djinn-Discount : le même génie de la brique, sans le « Al- » de l'enseigne."
   ]
  },
  {
   "nom": "Les Monts d'Or",
   "niveaux": "69 à 75",
   "paysage": "Montagnes de fromage coulant, alpages dorés, chalets d'affinage, cascades de crème chaude au printemps. Au flanc du plus haut sommet, un visage géant est taillé dans la roche.",
   "jeu_zone": "Le mont-d'or (fromage) + des montagnes dorées (nom déjà validé).",
   "monstres": [
    {
     "nom": "Raclette",
     "jeu": "Le fromage qui vous racle (déjà validé)."
    },
    {
     "nom": "Chèvre-chaud",
     "jeu": "La chèvre qui sort du four (déjà validé)."
    },
    {
     "nom": "Tomme-hawk",
     "jeu": "Tomme + tomahawk : une hache de fromage qui revient comme un boomerang."
    }
   ],
   "enseigne": {
    "nom": "L'Idole",
    "reelle": "Lidl",
    "jeu": "Lidl se dit presque « l'idole » (li-dol) : une statue qu'on vénère pour ses arrivages. Les deux relectures en font le meilleur nom de la liste.",
    "forme_boss": "Une immense idole de pierre taillée dans la montagne, la bouche ouverte comme une allée centrale d'où tombent des objets sans rapport : perceuse, palmes, machine à raclette, kayak.",
    "donjon": "Le Temple des Arrivages",
    "mecanique": "Arrivages : à chaque tour, l'idole lâche 2 objets au hasard dans l'allée du milieu. Les joueurs peuvent les ramasser et s'en servir une fois, mais ses Fidèles se ruent dessus eux aussi, et c'est une course à chaque tour. Pour l'atteindre, il faut traverser l'allée sous la pluie d'objets. Têtes de gondole : à mi-vie, des têtes de pierre lui poussent sur les épaules. Une tête abattue en fait repousser deux, sauf si on la cautérise à la Flambée."
   },
   "confiance": "sûr",
   "alternatives": [
    "L'Idylle : encore plus proche à l'oreille, c'est une sirène qui fait tomber amoureux d'une ponceuse en promo.",
    "L'Hydre-des-Arrivages : l'hydre aux têtes de gondole, sans aucun son de l'enseigne."
   ]
  },
  {
   "nom": "Les Gorges du Lardon",
   "niveaux": "76 à 82",
   "paysage": "Canyon vertigineux aux strates de lard fumé, torrents de bouillon, ponts suspendus en saucisson, grottes qui sentent le fumoir. Sous le canyon, des galeries marchandes sont creusées comme des taupinières.",
   "jeu_zone": "Les gorges du Verdon deviennent les gorges du Lardon : le canyon des charcutiers.",
   "monstres": [
    {
     "nom": "Rosette-Roquette",
     "jeu": "Rosette (le saucisson) + roquette (la fusée) : un saucisson qui décolle et explose."
    },
    {
     "nom": "Andouille-Fripouille",
     "jeu": "Andouille + fripouille : une saucisse filoute qui vole et s'enfuit."
    },
    {
     "nom": "Jambon-dissant",
     "jeu": "Jambon + bondissant : il saute de falaise en falaise."
    }
   ],
   "enseigne": {
    "nom": "La Net-Taupe",
    "reelle": "Netto",
    "jeu": "Netto → Net-Taupe : on garde « nèt-to », et la taupe creuse sous les prix. Elle fait aussi place nette de tout ce qui dépasse.",
    "forme_boss": "Une taupe géante aux griffes en cutters, qui creuse sous le canyon et ne laisse rien dépasser.",
    "donjon": "Les Galeries Taupinières",
    "mecanique": "Prix nets : tous les 3 tours, elle nettoie le terrain, et tous les bonus disparaissent, les vôtres comme les siens. Elle s'enterre et ressort sous un joueur au hasard. Les taupinières montrent où elle peut sortir : se tenir dessus l'empêche de remonter à cet endroit."
   },
   "confiance": "sûr",
   "alternatives": [
    "La Crevette Place-Nette : une crevette nettoyeuse géante, sans le son de l'enseigne.",
    "Le Nettoyeur : on y lit l'enseigne en entier, et il ne faut lui donner aucune tenue d'agent d'entretien (un vrai métier)."
   ]
  },
  {
   "nom": "La Grande Savarine",
   "niveaux": "83 à 89",
   "paysage": "Savane de savarins imbibés de sirop, baobabs en baba, points d'eau sucrés, hautes herbes de vanille.",
   "jeu_zone": "Savane + savarin : une plaine de gâteaux imbibés.",
   "monstres": [
    {
     "nom": "Gnou-gat",
     "jeu": "Gnou + nougat : il charge en troupeau, collant et dur à la fois."
    },
    {
     "nom": "Hippopotarte",
     "jeu": "Hippopotame + tarte : il s'assied sur vous."
    },
    {
     "nom": "Phaco-pas-Cher",
     "jeu": "Phacochère + pas cher : il brade ses coups, faibles mais nombreux."
    }
   ],
   "enseigne": {
    "nom": "La Hyène-Bric-à-Brac",
    "reelle": "Action",
    "jeu": "Le lien passe par le sens, pas par le son : un bric-à-brac, c'est un bazar où l'on trouve de tout à petits prix, du ruban au râteau. On rit du fouillis, jamais de ce qu'on y achète. Et la hyène, c'est le rire : elle ricane à chaque petit prix. Le nom ne garde aucune syllabe de l'enseigne. On laisse aussi de côté « actionnaire » et les dividendes.",
    "forme_boss": "Une hyène hilare au pelage de papier bulle, dont le rire sonne comme un tiroir-caisse, toujours entourée de sa meute. Sur son dos tient en équilibre un bric-à-brac de petits objets (arrosoir, ballon, pelote de laine, réveil), et chacun de ses petits trotte avec un objet entre les dents.",
    "donjon": "Le Terrier du Coup de Cœur",
    "mecanique": "Achat d'impulsion : à chaque tour, elle fait apparaître près d'un joueur un objet « coup de cœur ». Le ramasser donne un petit bonus tout de suite, mais coûte 1 Coup de main au tour suivant. Plus les joueurs craquent, plus sa meute grossit. Elle répartit les coups reçus sur ses petits : il faut d'abord l'isoler de la meute. Fou rire : tous les 3 tours, son rire de tiroir-caisse sonne la charge, et la meute fonce sur le joueur qui a ramassé le plus d'objets."
   },
   "confiance": "sûr",
   "alternatives": [
    "L'Actionhyène (Action + hyène) : le nom d'origine, qui fait entendre l'enseigne, écarté au profit d'un lien par le sens.",
    "La Gifirafe : une girafe à tête de gondole, pour une autre enseigne de bazar ; on y lit le nom de cette enseigne en entier, donc à éviter tel quel."
   ]
  },
  {
   "nom": "Le Marais-Chou",
   "niveaux": "90 à 96",
   "paysage": "Marais maraîcher coupé de canaux, barques plates, potagers flottants et rangs de choux à perte de vue, sous une brume basse qui ne se lève jamais tout à fait.",
   "jeu_zone": "Marais + chou : à l'oral, « maraîcher » (nom déjà validé).",
   "monstres": [
    {
     "nom": "Chou-Fleur",
     "jeu": "Le chou qui se prend pour une fleur (déjà validé)."
    },
    {
     "nom": "Navet-tueur",
     "jeu": "Navet + tueur, et « navetteur » (déjà validé)."
    },
    {
     "nom": "Artichaut-chaud",
     "jeu": "Un cœur d'artichaut qui prend feu (déjà validé)."
    }
   ],
   "enseigne": {
    "nom": "La Grande Frayeur",
    "reelle": "Grand Frais",
    "jeu": "« Gran-fré-yeur » : on entend « Grand Frais » au début, puis la frayeur. Un épouvantail, celui qui fait peur, et qui garde les légumes au frais sous sa brume. On le préfère à la chouette effraie, qui ferait une deuxième chouette avec l'Hyper-Hulotte.",
    "forme_boss": "Un épouvantail géant planté au milieu des potagers flottants, le chapeau en cagette, les manches bourrées de paille, avec des brumisateurs au bout des doigts.",
    "donjon": "Le Potager Brumisé",
    "mecanique": "Brumisation : tous les 2 tours, la brume noie l'arène ; on ne voit plus que les cases voisines, et l'épouvantail frappe depuis la brume. Grande frayeur : son cri fait reculer de 2 cases tous les joueurs proches. Les sorts Flambée dissipent la brume ; il se fige alors et devient vulnérable. Les légumes du marais peuvent changer de camp : un Légumancien qui les apaise les fait se battre avec vous."
   },
   "confiance": "sûr",
   "alternatives": [
    "La Grande Effraie (la chouette qui effraie) : écartée, car elle ferait une deuxième chouette avec l'Hyper-Hulotte des Îles Flottantes.",
    "L'Effraie-Brumisée : la même chouette, sans « Grande », écartée pour la même raison."
   ]
  },
  {
   "nom": "Les Purénées",
   "niveaux": "97 à 104",
   "paysage": "Chaîne de montagnes en purée de pommes de terre, glaciers de crème fraîche, cols battus par un vent de muscade, refuges de bergers. Sur le plus haut pic, la glace ne fond jamais.",
   "jeu_zone": "Les Pyrénées + la purée : « pu-ré-né ».",
   "monstres": [
    {
     "nom": "Patou-Patate",
     "jeu": "Patou (le chien des bergers pyrénéens) + patate : un gardien de troupeau en purée."
    },
    {
     "nom": "Ours-Garbure",
     "jeu": "Ours + garbure, la soupe paysanne du Béarn : un ours qui mijote."
    },
    {
     "nom": "Aligot-Gator",
     "jeu": "Aligot (purée filante au fromage) + alligator : une mâchoire qui file et qui colle."
    }
   ],
   "enseigne": {
    "nom": "Le Pic-Arctique",
    "reelle": "Picard",
    "jeu": "Picard → Pic-Arctique : on entend « pi-kar » tout de suite, puis l'Arctique. Le pic, c'est à la fois l'oiseau qui tape dans le bois et le sommet glacé où il niche. On garde le tiret, car en un seul mot on lirait presque la marque.",
    "forme_boss": "Un pic géant au bec de glace et au plumage de givre, qui creuse les sapins gelés pour y ranger ses plats surgelés.",
    "donjon": "La Chaîne du Froid",
    "mecanique": "Surgelé : son coup de bec gèle un joueur 2 tours. Chaîne du froid : les joueurs gelés sont reliés par un fil de glace. Un sort Flambée sur l'un d'eux dégèle toute la chaîne, mais une chaîne de 3 joueurs éclate et blesse tout le monde : il faut rester dispersé. Ne jamais recongeler : une pièce d'armure fondue à la Flambée ne peut plus être regelée. Tous les 3 tours, il décongèle une vague de monstres sortis de la glace."
   },
   "confiance": "sûr",
   "alternatives": [
    "Le Pique-Arctique : même son, mais le nom de l'enseigne ne se lit plus.",
    "Le Pic-Givré (« givré » au sens de fou) : le même oiseau de glace, sans le son de l'enseigne."
   ]
  },
  {
   "nom": "La Nationale Sept-Épices",
   "niveaux": "105 à 112",
   "paysage": "Une route des vacances sans fin à travers des champs d'épices, des platanes en bâtons de cannelle, des aires de repos et des bouchons à perte de vue. Partout où la route traverse un village, le marché a disparu, remplacé par un parking.",
   "jeu_zone": "La Nationale 7, la route des vacances, et le mélange sept-épices. Avec ses bouchons, évidemment.",
   "monstres": [
    {
     "nom": "Bouchon-bougon",
     "jeu": "Un bouchon (de liège, et d'embouteillage) toujours ronchon, qui bloque la route."
    },
    {
     "nom": "Piment-Péage",
     "jeu": "Piment + péage : il barre le passage et réclame du Blé pour vous laisser passer."
    },
    {
     "nom": "Clou-de-Crevaison",
     "jeu": "Le clou de girofle qui crève les pneus et vous cloue sur place."
    }
   ],
   "enseigne": {
    "nom": "La Halle-à-Pattes",
    "reelle": "Intermarché",
    "jeu": "Le lien passe par le sens : c'est un marché qui marche, une halle couverte qui s'est levée sur des pattes. À voix haute, « Halle-à-Pattes » s'entend aussi « aller à pattes », marcher à pied. Le son de l'enseigne ne revient que dans son donjon, l'Antre-Marché (l'antre, c'est la tanière).",
    "forme_boss": "Une halle de marché couverte montée sur deux immenses pattes de poulet, comme la maison des contes, qui arpente la Nationale et se pose là où se tenait un vrai marché. Ni mousquetaire, ni couleurs de l'enseigne.",
    "donjon": "L'Antre-Marché : là où la halle se couche chaque soir, au bout de la Nationale.",
    "mecanique": "Elle marche : à chaque tour, elle avance de 3 cases en ligne droite, et des empreintes montrent sa route un tour à l'avance. Les cases traversées deviennent du parking, des cases mortes où l'on ne peut plus lancer de sort : le terrain rétrécit à vue d'œil. Frapper 3 fois la même patte la fait s'agenouiller, et on peut alors atteindre la halle. Rouvrir un étal sur une case de parking (sort Terroir) rend la case aux joueurs."
   },
   "confiance": "sûr",
   "alternatives": [
    "L'Inter-Marcheur : le nom d'origine, plus proche de l'enseigne à l'écrit, écarté au profit de la Halle-à-Pattes.",
    "L'Intermâchoire : un crocodile dont les deux mâchoires se battent séparément ; il ferait en plus un deuxième crocodile avec le Costaud-Croc.",
    "L'Interminarché (la file d'attente sans fin) : très drôle, mais une relecture y voit une critique du service d'une enseigne précise ; la file d'attente reste au sbire Fil-d'Attente."
   ]
  },
  {
   "nom": "Les Îles Flottantes",
   "niveaux": "113 à 120",
   "paysage": "Archipel de meringues flottant sur une mer de crème anglaise, ponts de caramel filé, nuages de sucre glace.",
   "jeu_zone": "Le dessert île flottante, et de vraies îles à la dérive (nom déjà validé).",
   "monstres": [
    {
     "nom": "Œuf-en-neige",
     "jeu": "Les blancs en neige qui vous tombent dessus (déjà validé)."
    },
    {
     "nom": "Meringue volante",
     "jeu": "Meringue + soucoupe volante (déjà validé)."
    },
    {
     "nom": "Caramel-éon",
     "jeu": "Caramel + caméléon (déjà validé)."
    }
   ],
   "enseigne": {
    "nom": "L'Hyper-Hulotte",
    "reelle": "Système U (Hyper U, Super U)",
    "jeu": "Hyper U → Hyper-Hulotte : le « U » de l'enseigne s'étire en hulotte, la chouette de nuit (« i-pèr-u-lot »). C'est la chouette des cartes de fidélité, sans aucune idée d'espionnage des clients.",
    "forme_boss": "Une hulotte gigantesque perchée sur l'île la plus haute, aux plumes en coupons de fidélité qui s'allongent à chaque point gagné.",
    "donjon": "Le Perchoir à Points",
    "mecanique": "Carte de fidélité : au début, elle tamponne un joueur. Chaque fois que ce joueur relance le même sort, elle gagne 1 point ; à 10 points, elle offre un « bon d'achat » qui soigne toute sa troupe. Il faut varier ses sorts et se passer le tampon en finissant son tour à côté d'un allié. Elle vole d'île en île, et les ponts de caramel cassent après deux passages. Aucune de ses trajectoires ne dessine de « U »."
   },
   "confiance": "sûr",
   "alternatives": [
    "La Hulotte-aux-Points : la chouette des cartes de fidélité, sans « Hyper » ni « U ».",
    "La Super-Huître : une huître qui passe de Super à Hyper en plein combat, seulement si le Huit-à-Huître change de bête."
   ]
  },
  {
   "nom": "Les Abyscuits",
   "niveaux": "121 à 128",
   "paysage": "Grands fonds de biscuits engloutis, récifs de boudoirs, coraux en gaufrette, épaves de cargos chargés de palettes.",
   "jeu_zone": "Abysses + biscuits : « a-bis-kui ». Des grands fonds trempés comme un biscuit dans le café.",
   "monstres": [
    {
     "nom": "Raie-glisse",
     "jeu": "Raie + réglisse : une raie noire et souple qui fouette."
    },
    {
     "nom": "Anguille-sous-Brioche",
     "jeu": "Il y a anguille sous roche, ici sous brioche : elle attaque par surprise."
    },
    {
     "nom": "Hareng-Saurcier",
     "jeu": "Hareng saur + sorcier : un poisson fumé qui jette des sorts de brume."
    }
   ],
   "enseigne": {
    "nom": "Le Promo-Cachalot",
    "reelle": "Promocash",
    "jeu": "Promocash → Promo-Cachalot : toute l'enseigne tient dans le début du mot sans être écrite (« ch » au lieu de « sh »), puis vient le cachalot. Et « lot », comme la vente par lots.",
    "forme_boss": "Un cachalot titanesque, la gueule en quai de chargement et la peau couverte d'étiquettes « lot de 12 », qui avale des bancs de poissons entiers d'une bouchée.",
    "donjon": "Le Ventre-Entrepôt",
    "mecanique": "Vente par lots : ses attaques arrivent toujours par 3 ou par 12. Grand conditionnement : il avale un joueur, qui continue le combat dans son ventre contre des palettes ; s'il en casse 3, il ressort et le cachalot est étourdi. Jet de promos : son évent crache des coupons qui retombent en pluie et changent des cases en zones de soldes. Tous les 4 tours, il plonge, et tout le groupe perd 1 Coup de main sous la pression."
   },
   "confiance": "sûr",
   "alternatives": [
    "Le Cachalot-en-Gros : sans le son de l'enseigne."
   ]
  },
  {
   "nom": "Le Bayou-Baisse",
   "niveaux": "129 à 136",
   "paysage": "Mangrove brûlante noyée dans une soupe de poissons orange, racines de fenouil géantes, croûtons flottants et brume de safran.",
   "jeu_zone": "Bouillabaisse + bayou, avec « baisse » comme une baisse de prix.",
   "monstres": [
    {
     "nom": "Rascasse-tête",
     "jeu": "Rascasse + casse-tête : un poisson tout en épines, impossible à attraper."
    },
    {
     "nom": "Safran-tôme",
     "jeu": "Safran + fantôme : un spectre doré des brumes."
    },
    {
     "nom": "Grondin-grognon",
     "jeu": "Le grondin, un poisson qui grogne vraiment, toujours de mauvaise humeur."
    }
   ],
   "enseigne": {
    "nom": "Le Costaud-Croc",
    "reelle": "Costco",
    "jeu": "Costco → Costaud-Croc (« kos-to-kro ») : on entend l'enseigne, puis un crocodile aussi costaud que ses formats géants.",
    "forme_boss": "Un crocodile énorme et bodybuildé qui soulève des bidons format familial comme des haltères.",
    "donjon": "L'Entrepôt-Marécage",
    "mecanique": "Réservé aux membres : une seule carte de membre traîne sur le terrain, et seul le joueur qui la porte peut blesser le croco ; on se la passe entre alliés (1 Coup de main). Format géant : les coups simples rebondissent sur ses écailles, seules les attaques de zone passent. Sa morsure fait « lot de trois » : elle frappe trois fois de suite. Trop gros pour se baisser, il laisse les cases juste sous son menton sans danger."
   },
   "confiance": "sûr",
   "alternatives": [
    "Le Costocolosse : un colosse de palettes qu'on escalade, avec un nom plus proche de l'enseigne.",
    "Le Colosse Format-Familial : sans le son de l'enseigne. Il faut alors retirer aussi la carte de membre, qui la désigne à elle seule."
   ]
  },
  {
   "nom": "La Steppe-Tartare",
   "niveaux": "137 à 144",
   "paysage": "Plaine immense d'herbes hautes et de câpres sauvages, collines de viande hachée menu, vent sec, et jaunes d'œuf qui se couchent comme des soleils.",
   "jeu_zone": "Steak tartare → steppe-tartare.",
   "monstres": [
    {
     "nom": "Câpricorne",
     "jeu": "Câpre + capricorne : un bouquetin aux cornes de câpres."
    },
    {
     "nom": "Cheval-de-frisée",
     "jeu": "Cheval de frise (l'obstacle hérissé) + salade frisée."
    },
    {
     "nom": "Tarte-arentule",
     "jeu": "Tarte + tarentule."
    }
   ],
   "enseigne": {
    "nom": "Le Géant Casse-Rhino",
    "reelle": "Géant Casino / Casino",
    "jeu": "« Géant ka-zi-no » devient « Géant kas-ri-no » : une seule consonne bouge, et le rhinocéros casse tout sur son passage, à commencer par les prix.",
    "forme_boss": "Un rhinocéros géant à la peau en tôle de hangar, dont les yeux sont deux rouleaux d'étiquettes qui défilent.",
    "donjon": "La Salle des Jeux-Concours",
    "mecanique": "Tirage sans mise : au début de chaque tour, ses yeux-rouleaux tirent son attaque (charge, piétinement ou « prix surprise »), affichée un tour à l'avance. On ne mise jamais de Blé. Charge casse-tout : il fonce tout droit jusqu'au bord en brisant obstacles et armures ; si on l'esquive, il s'assomme contre un rocher et reste étourdi un tour."
   },
   "confiance": "sûr",
   "alternatives": [
    "Le Casinocéros : un mot-valise très drôle. « Casino » s'y lit en entier, mais c'est aussi un mot courant.",
    "Le Rhino-Roulette : sans le nom de l'enseigne, mais sans roulette à miser non plus."
   ]
  },
  {
   "nom": "Le Mont-Saint-Miche",
   "niveaux": "145 à 152",
   "paysage": "Une miche colossale posée dans une baie de farine, une abbaye en croûte dorée, de grandes marées de levain qui montent à toute vitesse. Au sommet, le clocher ne sonne plus les heures : il chante la réclame.",
   "jeu_zone": "Le Mont-Saint-Michel et la miche, le gros pain rond : une abbaye en forme de miche.",
   "monstres": [
    {
     "nom": "Gargouille-Fenouille",
     "jeu": "Gargouille + fenouil : une statue-légume qui crache de l'eau anisée."
    },
    {
     "nom": "Croissant-de-lune",
     "jeu": "Le croissant de boulangerie et le croissant de lune : plus fort à marée haute."
    },
    {
     "nom": "Marée-Chaussée",
     "jeu": "Maréchaussée + marée : une vague qui vous arrête (immobilise) quand elle monte."
    }
   ],
   "enseigne": {
    "nom": "Le Haut-Chant",
    "reelle": "Auchan",
    "jeu": "Auchan se dit « au champ ». On garde le son pour en faire un « haut chant » : dans l'abbaye, le chant des moines a été remplacé par la réclame, chantée à tue-tête.",
    "forme_boss": "Un clocher vivant dont les cloches sont des haut-parleurs. Il marche sur ses contreforts et chante la pub par-dessus toute la baie. Aucun oiseau sur lui ni autour de lui.",
    "donjon": "Le Clocher des Réclames",
    "mecanique": "Matraquage : tous les 2 tours, son haut chant oblige chaque joueur à faire 2 pas vers la tête de gondole la plus proche. Se boucher les oreilles (1 Coup de main) protège pendant un tour. Trois haut-parleurs sont accrochés aux tours de l'abbaye : les casser (les sorts Soufflé renvoient le son) le rend aphone et vulnérable. La marée de levain monte tous les 4 tours et noie les cases basses."
   },
   "confiance": "sûr",
   "alternatives": [
    "L'Épouvantail Haut-Parleur : la version sans le son de l'enseigne.",
    "Le Fauche-Champs (« il vous laisse fauché ») : très drôle, mais une relecture y voit un reproche fait à une enseigne réelle."
   ]
  },
  {
   "nom": "Les Caves de Roquefort-Knox",
   "niveaux": "153 à 160",
   "paysage": "Réseau de caves fortifiées sous un plateau calcaire : voûtes ruisselantes, fromages bleus qui brillent dans le noir, et les coffres où dort la réserve de Blé d'Orvane. Les champignons ont pris possession des lieux.",
   "jeu_zone": "Roquefort + Fort Knox : la chambre forte des fromagers.",
   "monstres": [
    {
     "nom": "Stalac-tomme",
     "jeu": "Stalactite + tomme : elle vous tombe dessus du plafond."
    },
    {
     "nom": "Chauve-saucisse",
     "jeu": "Chauve-souris + saucisse : elle pend au plafond comme les saucissons qui sèchent."
    },
    {
     "nom": "Mimolette-Mitraillette",
     "jeu": "Mimolette + mitraillette : une boule de fromage qui tire des billes de croûte en rafale."
    }
   ],
   "enseigne": {
    "nom": "Le Champ-Pignon",
    "reelle": "Champion (enseigne disparue)",
    "jeu": "Champion se dit presque « champignon », et on l'écrit Champ-Pignon pour « avoir pignon sur rue » : il veut une boutique à chaque coin de cave. Son attaque phare, le Champi-Gnon, est un direct du droit.",
    "forme_boss": "Un champignon colossal en gants de boxe, une ceinture de champion fanée autour du pied. Son mycélium court sous toute la cave et fait pousser partout de petites boutiques identiques.",
    "donjon": "La Franchignonnière",
    "mecanique": "Réseau de franchises : tous les 2 tours, il fait pousser une spore-boutique sur une case vide ; si elle n'est pas détruite au tour suivant, elle devient une boutique qui le soigne. Tant qu'un petit champignon relié vit encore, il repousse à 10 % de sa vie au lieu de mourir. Couper son mycélium (les sorts Terroir s'y prêtent bien) l'empêche de planter dans cette partie de la cave. Champi-Gnon : un combo de trois coups de poing sur un joueur au contact."
   },
   "confiance": "sûr",
   "alternatives": [
    "Le Champi-Gnon : le même champion boxeur, avec un nom centré sur le coup de poing.",
    "Le Pignon-sur-Rue : sans le son de l'enseigne.",
    "Nom de zone de repli : les Caves-Ernes (caves + cavernes), si l'on veut éviter une appellation protégée dans le nom."
   ]
  },
  {
   "nom": "Les Patacombes",
   "niveaux": "161 à 168",
   "paysage": "Galeries creusées très loin sous Grand-Étal : murs de pommes de terre empilées comme des ossements, cryptes fraîches et silencieuses. Plus bas, une eau claire et froide noie les cryptes entre des berges de pommes de terre, et chaque croisement copie le précédent.",
   "jeu_zone": "Catacombes + patate, avec la pâte en prime : un ossuaire de pommes de terre, creusé juste sous les fournils de Grand-Étal.",
   "monstres": [
    {
     "nom": "Patate-Chaude",
     "jeu": "La patate chaude qu'on se refile : elle explose au bout de deux tours, il faut la passer à un ennemi."
    },
    {
     "nom": "Pomme-Fatale",
     "jeu": "Femme fatale + pomme de terre : elle charme et enracine sur place."
    },
    {
     "nom": "Hache-Parmentier",
     "jeu": "Hachis parmentier + hache : une purée gratinée qui fend tout."
    }
   ],
   "enseigne": {
    "nom": "Le Brochet-Doré",
    "reelle": "Brioche Dorée",
    "jeu": "« Bro-chè-do-ré » : le rythme de l'enseigne, ses sons « br », « o » et « ch », et « doré » à la fin. On l'entend sans qu'elle soit écrite. Ce brochet fait tout pareil, partout : le même circuit, les mêmes coups, dans le même ordre, d'un croisement à l'autre. On rit du partout-pareil, jamais du pain, des salariés ni des clients.",
    "forme_boss": "Un brochet géant au dos et aux nageoires vert sombre, les flancs couverts d'écailles d'or massif. Toutes ses écailles sont pareilles, posées au millimètre. Devant sa tête, l'or jette au sol un reflet qui montre sa face. Il ne mord pas. Rien qui se mange, ni couleur, lettre ou dessin de l'enseigne.",
    "donjon": "Les Cryptes Noyées",
    "mecanique": "Écailles d'or : de face, rien ne le blesse ; de dos, double dégâts. Partout pareil : toujours le même circuit, et trois attaques dans le même ordre (coup de queue derrière lui, vague sur une berge, reflet éblouissant devant lui), annoncées au sol un tour avant. En fin de tour, le courant (flèches) pousse d'une case les joueurs dans l'eau. Un sort Terroir roule un barrage de pommes de terre sur le circuit : il coupe le courant, et le brochet y reste bloqué un tour. Un sort Éclair sur l'eau l'étourdit un tour, pas deux de suite, et touche les joueurs dans l'eau. À mi-vie, deux attaques par tour."
   },
   "confiance": "sûr",
   "alternatives": [
    "La Carpe-Miroir (la carpe miroir est une vraie carpe aux grandes écailles brillantes) : le même combat, avec des écailles d'argent (« Écailles-miroirs » au lieu de « Écailles d'or ») ; ni brochet, ni or, ni « Doré » : c'est le repli prêt si l'avocat hésite.",
    "Le Pol-Tergeist, l'ancien boss, et son repli sans prénom, l'Esprit Frappe-Pâte : un esprit frappeur caché sous un sac à pain, qui remontait chaque nuit la même boutique, pour une autre chaîne dont on entend le prénom (toujours écrit « Pol ») ; à reprendre seulement si l'on revenait à l'esprit.",
    "La Boule-Ange (« la boulange » à l'oreille, pour une autre chaîne de boulangeries) : un ange d'acier tout rond qui roule comme une boule de pétanque, très drôle, mais le nom de cette chaîne s'y lit en entier et le boss serait l'enseigne elle-même : à éviter tel quel."
   ]
  },
  {
   "nom": "La Côte de Bœuf",
   "niveaux": "169 à 176",
   "paysage": "Falaises rouges marbrées de gras au-dessus de la mer, pâturages au bord du vide, phares en os à moelle. Au pied des falaises, un bloc de gros sel s'est fendu, et quelque chose en sort.",
   "jeu_zone": "Côte de bœuf (le morceau) + la côte (le littoral) (nom déjà validé).",
   "monstres": [
    {
     "nom": "Veau-tour",
     "jeu": "Veau + vautour : il plane au-dessus des falaises."
    },
    {
     "nom": "Onglet-griffu",
     "jeu": "L'onglet (le morceau) + ongle : une bête à griffes."
    },
    {
     "nom": "Bavette-bavarde",
     "jeu": "Bavette + bavarde : elle parle sans arrêt pour vous distraire."
    }
   ],
   "enseigne": {
    "nom": "Le Mammoutarde",
    "reelle": "Mammouth (enseigne disparue)",
    "jeu": "Mammouth + moutarde : « ma-mou-tard ». L'enseigne disparue revient comme un fossile, et elle fonce quand la moutarde lui monte au nez. Et une côte de bœuf sans moutarde, ça n'existe pas.",
    "forme_boss": "Un colosse de moutarde forte, figé dans un bloc de gros sel au pied des falaises, avec deux défenses en cuillères de bois. On devine une grosse bête, mais c'est un pot de moutarde qui a pris vie, jamais un vrai mammouth.",
    "donjon": "La Crique Extra-Forte",
    "mecanique": "La moutarde lui monte au nez : une jauge de colère monte à chaque coup reçu. Quand elle est pleine, il éternue un nuage piquant qui aveugle les joueurs proches, puis il charge. Dessalage : les vagues le dessalent un peu à chaque tour, et plus il est dessalé, plus il est rapide mais moins il est solide. Le garder dans le sel (Terroir) ou le rincer (Eaudace) : c'est le vrai choix tactique."
   },
   "confiance": "sûr",
   "alternatives": [
    "Le Liquidosaure (liquidation + dinosaure) : le fossile d'une enseigne disparue, sans mammouth.",
    "Le Mammort (un squelette de mammouth) : écarté, car il reprend l'animal emblème de l'ancienne enseigne."
   ]
  },
  {
   "nom": "Les Friches-Cassées",
   "niveaux": "177 à 184",
   "paysage": "Zone commerciale abandonnée : parkings fissurés envahis d'herbes, chariots rouillés qui roulent tout seuls, enseignes éteintes, galeries où le vent fait claquer les rideaux de fer.",
   "jeu_zone": "Fricassée + friches cassées, les zones commerciales laissées à l'abandon.",
   "monstres": [
    {
     "nom": "Liche-Lorraine",
     "jeu": "La liche (sorcier mort-vivant) + la quiche lorraine."
    },
    {
     "nom": "Arête-toi",
     "jeu": "Arête + « arrête-toi » : un spectre de poisson qui vous barre le passage."
    },
    {
     "nom": "Chariognard",
     "jeu": "Chariot + charognard : un chariot fantôme qui fond sur les blessés."
    }
   ],
   "enseigne": {
    "nom": "Le Contenant",
    "reelle": "Continent (enseigne disparue)",
    "jeu": "« Kon-ti-nan » devient « kont-nan » : l'ancien continent est devenu un contenant, un emballage géant. Ce qui compte, ce n'est plus ce qu'il y a dedans.",
    "forme_boss": "Un colosse de cartons emboîtés comme des poupées russes, scotché, sous film plastique, couvert de flèches « Ce côté vers le haut ». Au centre, après sept couches, il y a un biscuit minuscule.",
    "donjon": "La Boîte dans la Boîte",
    "mecanique": "Suremballage : sept couches (carton, film, blister, polystyrène, papier bulle, sachet, étiquette), chacune avec sa faiblesse. Le film renvoie les sorts, le polystyrène absorbe les coups physiques, le papier bulle éclate et donne un petit bonus. Sous la dernière couche se cache le vrai boss, un biscuit minuscule qui tente de s'enfuir."
   },
   "confiance": "sûr",
   "alternatives": [
    "Le Conti-Néant : un gouffre qui avale le paysage, moins drôle.",
    "La Boîte-Gigogne : sans le son de l'enseigne."
   ]
  },
  {
   "nom": "Le Massif-Centrale",
   "niveaux": "185 à 192",
   "paysage": "Un massif gris d'entrepôts et de béton, des ronds-points à perte de vue, des parkings empilés jusqu'au ciel, un brouillard de prospectus. C'est d'ici que partent tous les camions vers les autres zones, et toutes les routes y descendent vers le Grand Fournil.",
   "jeu_zone": "Le Massif central + la centrale d'achat, là où se décide tout ce qui finira en rayon.",
   "monstres": [
    {
     "nom": "Rond-Point-Virgule",
     "jeu": "Rond-point + point-virgule : il fait tourner les joueurs en rond et coupe leurs sorts en plein milieu."
    },
    {
     "nom": "Transpalettosaure",
     "jeu": "Transpalette + dinosaure : un tyrannosaure à fourches qui soulève et projette."
    },
    {
     "nom": "Néon-Néandertal",
     "jeu": "Néon + Néandertal : une brute préhistorique d'enseigne lumineuse qui éblouit."
    }
   ],
   "enseigne": {
    "nom": "Le Rat-Co",
    "reelle": "Cora",
    "jeu": "Ton idée : Cora devient le Rat-Co, avec un vrai rat (rat avec un T), pas un simple verlan. Et on rejoue avec : ses petits s'appellent les Rats-bais (rabais), son donjon les Rat-yons (rayons), et son attaque ultime la Rat-fle (rafle).",
    "forme_boss": "Un rat énorme coiffé d'une couronne de capsules, assis sur un trône de chariots empilés et de panneaux promo, les joues gonflées de pièces de Blé, la queue enroulée autour d'un chariot.",
    "donjon": "Les Rat-yons : des rayons à ciel ouvert sur les toits des entrepôts, jamais dans un égout ni une réserve de nourriture.",
    "mecanique": "Rats-bais : à chaque tour, il casse ses prix ; il perd un peu de Victuailles mais invoque 2 Rats-bais, petits et rapides. Si 5 Rats-bais sont en vie en même temps, ils font une Rat-fle : ils volent du Blé à chaque joueur, et le Rat-Co récupère toutes ses Victuailles. Il range le Blé volé dans ses joues, et le frapper aux joues lui fait tout recracher. Il faut alterner entre nettoyer les rats et taper le roi."
   },
   "confiance": "sûr",
   "alternatives": [
    "Le Roi des Rats-bais : tous les jeux de mots restent (Rats-bais, Rat-yons, Rat-fle), sans le « Co » qui renvoie à l'enseigne."
   ]
  },
  {
   "nom": "Le Grand Fournil",
   "niveaux": "193 à 200 (boss final au niveau 200)",
   "paysage": "Le four originel des artisans, une cathédrale de briques aux voûtes brûlantes, avec des pétrins grands comme des lacs. Les tapis roulants l'ont envahi, et sous ses fondations, on entend grésiller : une lumière blanche clignote dans les fissures du sol.",
   "jeu_zone": "Le fournil, là où cuit le boulanger, en version géante : le cœur du métier (nom déjà validé).",
   "monstres": [
    {
     "nom": "Brioche-stressée",
     "jeu": "Brioche tressée + stressée."
    },
    {
     "nom": "Baguette-magique",
     "jeu": "La baguette de pain qui lance des sorts."
    },
    {
     "nom": "Four-mi",
     "jeu": "Four + fourmi : une fourmi en briques chaudes, qui crache des braises."
    }
   ],
   "enseigne": {
    "nom": "Le Métrognome",
    "reelle": "Metro",
    "jeu": "Metro → Métrognome : on entend « métronome », la cadence, et on y glisse un gnome. Le grossiste impose son tempo aux fours.",
    "forme_boss": "Un gnome minuscule perché sur un métronome géant dont le balancier balaie la salle. Plus il bat vite, plus les tapis roulants accélèrent.",
    "donjon": "La Salle des Cadences",
    "mecanique": "Cadence industrielle : le balancier bat la mesure, et le temps pour jouer raccourcit à chaque tour. Les actions jouées sur le « tic » font double dégâts, celles jouées hors du rythme moitié moins. Trois joueurs sur le balancier en même temps le bloquent 2 tours, et le gnome, tout petit, devient alors une cible facile. Les fours rallumés par un sort Flambée réchauffent les alliés. Le vaincre ouvre l'escalier qui descend vers le Nid d'Orage."
   },
   "confiance": "sûr",
   "alternatives": [
    "Le Gnome-Cadence : sans le son de l'enseigne."
   ]
  }
 ],
 "boss_final": {
  "nom": "L'Élé-Clair",
  "reelle": "E.Leclerc (nom d'une famille réelle : avis d'un juriste avant la sortie)",
  "jeu": "« É-lé-klèr » : on entend l'enseigne sans qu'elle soit écrite. « Élé » comme élément, « Clair » comme éclair : c'est le dragon qui a volé l'élément Éclair aux artisans. Il est fait de néons, la lumière des grandes surfaces qui ne s'éteint jamais. Et l'éclair est aussi un gâteau de pâtissier : le nom reste du côté des artisans. Nom gardé en connaissant le risque : voir les précautions (avis d'un avocat, repli prêt, aucune ressemblance avec une personne réelle).",
  "forme": "Un dragon d'orage long comme une rue entière, fait de tubes de néon tordus qui bourdonnent et clignotent comme une enseigne de nuit. Ses ailes sont des panneaux lumineux où défilent des prix, et dans sa poitrine tourne une boule de foudre : l'élément Éclair volé aux artisans. Il n'a rien d'humain et ne parle pas : il grésille. Ses néons sont d'un blanc d'orage, jamais aux couleurs de l'enseigne, et aucun de ses éclairs ne dessine une lettre.",
  "repaire": "Le Nid d'Orage, sous les fondations du Grand Fournil, le four originel où cuit la toute première fournée du monde. Le premier feu de ce four est né d'un éclair : en volant l'élément Éclair, le dragon empêche les artisans de le rallumer. Branché sous le four, il en aspire la chaleur pour nourrir ses néons. Quand le four sera froid, il n'en restera qu'une enseigne lumineuse, allumée jour et nuit au-dessus des braises éteintes. On y descend par l'escalier qu'ouvre la défaite du Métrognome.",
  "mecanique": "Le combat a trois phases. Une bannière annonce chacune, et toutes ses attaques sont montrées un tour à l'avance par des cases qui clignotent. 1. Haute tension : l'Éclair volé brille dans sa poitrine, et les sorts Éclair lancés sur lui le soignent (un éclair barré s'affiche au-dessus de sa tête). Trois néons-relais plantés dans l'arène lui donnent aussi un bouclier : tant qu'un relais tient, il ne prend que la moitié des dégâts. Mais un sort Éclair fait sauter un relais d'un coup ; avec les autres éléments, il faut trois coups. Toutes les classes ont des sorts Éclair : on les garde pour casser les relais, et on frappe le dragon en Flambée, Eaudace, Terroir ou Soufflé. Relais cassés, son bouclier tombe ; à la moitié de ses Victuailles, il lâche l'Éclair. 2. Reprendre l'Éclair : l'Éclair tombe dans l'arène en trois étincelles, et le dragon fonce vers la plus proche de lui. Il faut les ramasser avant lui (un pas dessus suffit) et les porter jusqu'au foyer du four, au centre. Un porteur a 1 Pas de moins. Chaque étincelle avalée par le dragon rallume un relais, et il la recrache deux tours plus tard sur une case au hasard : la phase dure jusqu'à ce que les trois étincelles soient au foyer. 3. Court-circuit : l'Éclair est rendu, le four se rallume, et tout s'inverse. Les sorts Éclair lui font double dégâts. Et une fois par tour, chaque artisan peut lancer n'importe lequel de ses sorts dans l'élément Éclair. Tous les 3 tours, le dragon fonce vers le foyer pour s'y rebrancher : un artisan posté sur le foyer l'arrête net, et le dragon reste étourdi un tour. Vaincu, il rétrécit en un petit néon qui grésille, qu'un boulanger accroche à sa vitrine, et le Grand Fournil cuit à nouveau. Après le jeu, une rumeur parle d'un colis géant au bout du Dernier Kilomètre (le Colissos, en boss secret).",
  "alternatives": [
   {
    "nom": "Le Dragon Vente-Flash",
    "reelle": "E.Leclerc (repli plus sûr, sans renvoi au nom)",
    "jeu": "Vente flash + flash, l'éclair de lumière : un dragon de néon qui brade tout le temps d'un éclair. Même forme, même repaire, même combat en trois phases que l'Élé-Clair, mais le nom ne renvoie ni à l'enseigne ni à une famille. C'est le repli à prendre si le juriste dit non. Pour y passer : remplacer « l'Élé-Clair » par « le Dragon Vente-Flash » dans le fil rouge et dans les précautions, et reprendre ce texte comme jeu de mots du boss final."
   },
   {
    "nom": "La Reine Carrée-Fourmi",
    "reelle": "Carrefour (gardée en réserve)",
    "jeu": "« Ka-ré-four-mi » : une reine fourmi au corps cubique, standardisée jusqu'aux insectes, qui creusait sous le Grand Fournil, au carrefour des quatre routes d'Orvane. Son combat avait quatre phases, une par taille de magasin (Hyper, Super, Supérette, Drive) : elle rétrécissait, accélérait puis tentait de fuir, et il fallait boucher ses galeries de renforts. Elle passe en réserve, ce qui allège aussi le groupe déjà le plus présent dans le monde. Sa version prudente, la Reine des Quatre-Chemins, reste possible. Ses renvois ailleurs dans le monde (fil rouge, paysage du Grand Fournil, monstre Four-mi, escalier du Métrognome) ont été retirés : il faudrait les remettre si elle revenait."
   },
   {
    "nom": "Le Colissos",
    "reelle": "Le géant du commerce en ligne (Amazon), qui n'est pas une enseigne de grande distribution",
    "jeu": "Colis + colosse : un titan de cartons et de tapis roulants qui ne marche pas, il est livré. On le garde en boss secret d'après-jeu, au bout du Dernier Kilomètre, où les enseignes vaincues s'allient aux artisans contre lui. Il livre chaque tour un ancien boss « reconditionné », et « Retour gratuit » renvoie une attaque sur deux. Le nom « Amas-Zone » est écarté : c'est un homophone exact d'une marque mondiale."
   }
  ]
 },
 "sbires": [
  {
   "nom": "Tête-de-Gondole",
   "jeu": "La tête de gondole, le bout de rayon le plus en vue, devient un gondolier dont la tête est une pyramide de promos.",
   "role": "Provocateur : tant qu'il tient debout, les joueurs proches doivent l'attaquer en priorité, et les autres sbires sont protégés."
  },
  {
   "nom": "Produit-d'Appeau",
   "jeu": "Produit d'appel + appeau, le sifflet qui attire le gibier.",
   "role": "Appât : il siffle et attire un joueur de 3 cases vers lui. Il est faible, mais le tuer déclenche le piège caché sous lui."
  },
  {
   "nom": "Marge-Arrière",
   "jeu": "La marge arrière, l'argent qui se négocie dans le dos, et la marche arrière.",
   "role": "Assassin qui ne se déplace qu'à reculons : invisible de face, il fait double dégâts dans le dos. Il faut se placer dos à un mur."
  },
  {
   "nom": "Rupture-de-Stock",
   "jeu": "Plus rien en rayon, et « rupture » au sens de casser.",
   "role": "Rend un sort d'un joueur indisponible pendant 2 tours (« victime de son succès »)."
  },
  {
   "nom": "Datte-Limite",
   "jeu": "Date limite + datte (le fruit).",
   "role": "Compte à rebours : au bout de 3 tours, elle « périme » et empoisonne les cases autour. Il faut l'achever avant."
  },
  {
   "nom": "Lot-de-Trois",
   "jeu": "Le lot de trois, dont le troisième est « offert ».",
   "role": "Trio lié : s'ils ne meurent pas tous les trois dans le même tour, le dernier revient gratuitement et relève les autres."
  },
  {
   "nom": "Code-Barreaux",
   "jeu": "Code-barres + barreaux de prison.",
   "role": "Geôlier : il dresse des lignes de barreaux noirs et blancs qui bloquent les déplacements ou enferment un joueur 2 tours. Un sort Éclair les « scanne » et les efface."
  },
  {
   "nom": "Carte-à-Puces",
   "jeu": "La carte de fidélité à puce, et de vraies puces qui sautent.",
   "role": "Elle saute sur un joueur et le « fidélise » : marqué, il devient la cible prioritaire de tous les ennemis jusqu'à ce qu'un allié l'épouille."
  },
  {
   "nom": "Blistérique",
   "jeu": "Blister (l'emballage plastique impossible à ouvrir) + hystérique.",
   "role": "Carapace : invulnérable tant qu'on n'a pas frappé le petit coin « Ouvrir ici », qui change de place à chaque tour."
  },
  {
   "nom": "Fil-d'Attente",
   "jeu": "File d'attente + fil d'araignée.",
   "role": "Araignée qui tisse des files : les joueurs pris dedans jouent en dernier et ne peuvent pas doubler leurs alliés."
  },
  {
   "nom": "Prospectoplasme",
   "jeu": "Prospectus + ectoplasme.",
   "role": "Fantôme de papier glacé qui se colle sur la vue : il réduit la portée des sorts des joueurs proches."
  },
  {
   "nom": "Tique-de-Caisse",
   "jeu": "Ticket de caisse + tique : un parasite long comme un ticket de courses.",
   "role": "Accrochée à un joueur, elle draine un peu de Blé à chaque tour et s'allonge tant qu'on la garde ; plus elle est longue, plus l'arracher fait mal."
  },
  {
   "nom": "Automate-de-Caisse",
   "jeu": "La caisse automatique : on se moque de la machine, jamais des caissiers.",
   "role": "« Article inattendu dans la zone d'ensachage » : il immobilise un joueur jusqu'à ce qu'un allié vienne à côté de lui pour valider."
  },
  {
   "nom": "Chariot-d'Assaut",
   "jeu": "Chariot de courses + char d'assaut.",
   "role": "Il fonce en ligne droite, et sa roue voilée le fait toujours tourner à gauche : facile à piéger contre un mur."
  },
  {
   "nom": "Coupon-Jarret",
   "jeu": "Coupon de réduction + coupe-jarret, le bandit de grand chemin.",
   "role": "Il découpe 10 % du Blé du joueur touché, « à valoir sur votre prochain achat » ; on le récupère en le battant."
  },
  {
   "nom": "Premier-Prix",
   "jeu": "Le premier prix : le moins cher du rayon, et la médaille.",
   "role": "Champion de pacotille : il frappe très fort au premier coup, puis se casse au deuxième."
  },
  {
   "nom": "Sans-Contact",
   "jeu": "Le paiement sans contact.",
   "role": "Intouchable au corps à corps : seuls les sorts à distance l'atteignent."
  },
  {
   "nom": "Promo-Flash",
   "jeu": "Promo flash + éclair.",
   "role": "Elle n'apparaît qu'un seul tour ; si personne ne la touche, elle donne un gros bonus à l'enseigne."
  },
  {
   "nom": "Prix-Barrage",
   "jeu": "Prix barré + barrage.",
   "role": "Mur vivant qui bloque un couloir ; il « baisse » (rétrécit) quand on le frappe avec des attaques de zone."
  },
  {
   "nom": "Panier-Moyen-Âge",
   "jeu": "Panier moyen (le chiffre roi des magasins) + Moyen Âge : un chevalier en armure d'osier.",
   "role": "Soldat de base : rien d'exceptionnel, mais toujours là et en nombre."
  },
  {
   "nom": "Bonsaï-de-Réduction",
   "jeu": "Bon de réduction + bonsaï, l'arbre en version réduite.",
   "role": "Soutien : il réduit de moitié les dégâts reçus par ses alliés pendant un tour."
  }
 ],
 "precautions": [
  "Ne jamais écrire le vrai nom tel quel. On coupe les noms par un tiret (Al-Djinn, Pic-Arctique, Promo-Cachalot, Net-Taupe, Élé-Clair) et on écarte les graphies qui imitent la marque : l'apostrophe de « Foir'… », « Hydl », « Picarctique » en un seul mot, « Carrefourmi », « Auchampignon ». Le Brochet-Doré garde son tiret et son « Doré » au masculin, jamais « Dorée ». Dans les textes montrés aux joueurs (le champ « reelle » n'en fait pas partie), le mot « brioche » n'apparaît jamais dans sa zone ni près de son nom, car on lirait alors l'enseigne en entier. Dans aucune liste du jeu (bestiaire, succès, carte), un nom qui contient « brioche » ne figure à côté du sien : l'Anguille-sous-Brioche reste aux Abyscuits sous cette règle. Si le Pol-Tergeist, passé en alternative, revenait : on écrit toujours « Pol », jamais le prénom de l'enseigne ; « Pol » n'est jamais employé seul comme nom de personnage, et l'esprit n'est le fantôme de personne (ni portrait, ni tombe, ni date) ; repli intermédiaire : « le Poltergeist » en un seul mot.",
  "Aucun logo, couleur, slogan, mascotte ni nom de gamme ou de format. Concrètement : pas d'oiseau sur le Haut-Chant ni autour de lui (l'emblème réel de l'enseigne en est un) ; pas de mammouth pour le Mammoutarde, qui reste un pot de moutarde ; aucun mousquetaire nulle part, ni sur la Halle-à-Pattes ni ailleurs ; pour l'Élé-Clair, des néons d'un blanc d'orage, jamais aux couleurs de l'enseigne, et aucun éclair qui dessine une lettre ; pour le Brochet-Doré, un or de métal, jamais l'aspect d'une viennoiserie ni les couleurs du logo (ses nageoires restent vertes ou d'or, jamais rouges ni orangées), et ni boutique, ni vitrine, ni comptoir dans ses cryptes : rien qui rappelle les boutiques de l'enseigne ni le nom de ses offres ; aucune charge qui dessine un « U » pour l'Hyper-Hulotte ; pas de flèche en sourire sur le Colissos. Si la Reine Carrée-Fourmi, en réserve, revenait : ni flèche ni couleurs d'enseigne, et pas de « Market », « City » ou « Express » dans ses phases. Si le Pol-Tergeist revenait : aucune façade, couleur ni lettre de son enseigne.",
  "Se moquer du système, jamais des salariés ni des clients. L'Automate-de-Caisse remplace la Caisse-Enrageuse. Le Sparesseux ne s'utilise qu'avec la blague du libre-service, jamais pour des employés paresseux. Aucun boss ne porte une tenue d'agent d'entretien. Pour le Colissos : des tapis roulants et des drones, jamais de livreurs ni de préparateurs. La Hyène-Bric-à-Brac rit du fouillis, jamais de ce qu'on y achète.",
  "Aucune accusation de fait contre une entreprise réelle. Sont écartés : le Grand Fret (origine des produits « frais »), l'Interminarché en boss (qualité du service), le Fauche-Champs (ruine des clients, bétonnage), l'Al-Dindon (le client « farci »), le Carré-Fourbe (« fourbe »), et « actionnaire » ou les dividendes pour la Hyène-Bric-à-Brac. Les vœux de l'Al-Djinn sont annoncés clairement, sans « petites lignes ».",
  "Aucune allusion à l'hygiène d'une enseigne alimentaire. Le Rat-Co reste à l'air libre, sur un trône de chariots, jamais dans un égout, un silo ou une réserve de nourriture. La Proxi-Mite ronge des tabliers dans une penderie, jamais de la farine. Le Brochet-Doré nage dans une eau toujours claire et froide, sans vase ni rien qui flotte ; il ne mange rien, et ses cryptes n'ont ni boutique ni nourriture. Les pommes de terre du barrage sortent des murs de l'ossuaire et y retournent entières, jamais jetées ni abîmées. Si le Pol-Tergeist revenait : seuls des meubles vides volent, jamais de pain, et son sac à pain reste propre, repassé et arrondi, jamais pointu. Aucun boss ne ronge ni ne souille de la nourriture.",
  "Personnes réelles. L'Élé-Clair est maintenant le boss final, choisi en connaissance de cause. Mais l'enseigne porte le nom d'une famille et d'un dirigeant très médiatisé. Donc : aucun trait, vêtement, lunettes ni phrase qui rappelle une personne réelle (ni costume, ni tribune, ni blog) ; le dragon n'a rien d'humain et ne parle pas, il grésille. Il faut l'avis d'un avocat en propriété intellectuelle avant toute sortie. Le repli est prêt à l'emploi : le Dragon Vente-Flash, même forme, même repaire, même combat, sans renvoi au nom. Aucune caricature de personne réelle, nulle part ailleurs non plus. Pour les Patacombes, l'enseigne retenue ne porte le nom d'aucune personne, et le Brochet-Doré n'évoque ni le groupe qui la possède ni ses dirigeants. On écarte toujours les chaînes qui portent le prénom et le nom d'une vraie personne (par exemple Sophie Lebreuilly ou Marie Blachère) : le boss deviendrait la caricature de quelqu'un.",
  "La chaîne des Patacombes demande le plus de soin de tout le jeu. La Place des Artisans vend le pain des boulangers : c'est un concurrent direct des chaînes de boulangerie et de viennoiserie, et c'est donc ici que le risque de dénigrement est le plus fort. Rien sur la qualité, le surgelé, l'origine, la fabrication, les prix réels ou les produits de cette chaîne, et rien qui les oppose au pain des fournils d'en haut. On ne rit que du système : le même circuit, les mêmes coups dans le même ordre, des croisements et des écailles tous pareils. Ni vitrine, ni boutique, ni « formule » : chez une chaîne de boulangerie, ce sont ses produits et ses offres. Jamais du pain, des boulangers, des salariés, des clients, ni de l'histoire de la maison ou du groupe qui la possède, et aucun des lieux où elle s'installe, même en général (ni gare, ni galerie marchande, ni aéroport). Le brochet ne chasse personne : ses cryptes n'ont ni passant ni client ; il suit son circuit, ne mord jamais, n'avale ni n'emporte aucun joueur ; ses attaques visent des cases annoncées, jamais un joueur en particulier, et son courant pousse d'une case. Le repli est prêt : la Carpe-Miroir, même combat, sans brochet, sans or et sans « Doré ». Le Pol-Tergeist et son repli, l'Esprit Frappe-Pâte, passent en alternative. La Boule-Ange fait lire en entier le nom d'une autre chaîne (« Ange ») : à éviter tel quel, comme la Gifirafe. Le jeu est fait pour la plateforme et à ses couleurs : un juge peut donc le lire tout entier comme sa publicité. Le risque est dans le jeu lui-même, pas seulement autour. Ce boss ne sert jamais dans la communication (bande-annonce, réseaux, fiche du jeu, affiches), pas même par la phrase du fil rouge qui le présente : tout résumé du jeu la retire. Aucun texte montré aux joueurs ne dit « chaîne de boulangeries » ni « restauration rapide ». Si l'avocat qui relit la liste hésite, on passe à la Carpe-Miroir avant la sortie.",
  "Équilibrer les cibles. Le groupe Carrefour, avec ses enseignes actuelles ou passées (Proxi, 8 à Huit, Promocash, Cora, Champion, Continent), reste très représenté, mais il ne fournit plus le boss final : la Reine Carrée-Fourmi passe en réserve. Le groupe Casino l'est aussi (Monoprix, Franprix, Vival, Spar, Leader Price, Géant Casino). Ces liens entre enseignes sont à vérifier. Pour ne pas paraître viser une seule entreprise, on peut faire passer une ou deux zones sur leur version sans son d'enseigne (la Mitoyenne, le Cachalot-en-Gros, la Pieuvre Huit-à-Nuit).",
  "Faits à vérifier avant d'écrire le lore : le rachat de Cora et Match en 2024, et la vente des hypermarchés Géant. Si c'est confirmé, ces enseignes ont presque disparu et le risque baisse. L'histoire du jeu ne doit jamais raconter de rachats réels.",
  "Appellations protégées (AOP) : les noms de fromages et de vins protégés (Roquefort, Mont d'Or, Brie de Meaux, Comté, Cantal, Morbier, Langres…) restent du côté des artisans et des décors, jamais en monstres ridicules. Sont écartés : Roc-fort, Mort-bier, Brie-gand, Fourme-d'Ambition, Lingot-Langres, Cantal-Loup. Si besoin, les Caves de Roquefort-Knox peuvent devenir les Caves-Ernes.",
  "Attention aux autres marques. Pas de « Kong », un gorille de cinéma protégé (d'où l'abandon du Kong-Tinent). Pas l'allure du monstre de Frankenstein du cinéma (tête plate, boulons), ni celle du génie bleu d'un dessin animé, ni celle d'un film de vampire ou d'esprit frappeur précis : on s'inspire des légendes et des romans, libres de droits.",
  "Pas de jeu d'argent simulé : aucune mise en Blé. Le Casse-Rhino tire son attaque au sort, annoncée à l'avance, ce qui évite de relever l'âge conseillé du jeu.",
  "Ne jamais relier ces boss aux vraies enseignes dans la communication du jeu ou de la plateforme qui le porte, par exemple « battez le Rat-Co, achetez chez nos artisans » à côté d'un vrai logo : la parodie deviendrait de la publicité dénigrante. L'Amas-Zone est écarté pour la même raison : c'est un homophone exact d'une marque mondiale, concurrente directe de toute plateforme de vente en ligne.",
  "Une créature différente par boss : une seule chouette parmi les boss (l'Hyper-Hulotte, d'où l'épouvantail de la Grande Frayeur pour Grand Frais), une seule huître, un seul champignon, un seul rhinocéros, un seul dragon (l'Élé-Clair), un seul poisson (le Brochet-Doré, ou la Carpe-Miroir en repli, car le cachalot n'en est pas un), et plus aucun esprit frappeur, licorne, fourmi ni chien à trois têtes parmi les boss retenus.",
  "Tous les noms sont tranchés par l'utilisateur, le Brochet-Doré compris : il remplace le Pol-Tergeist aux Patacombes, et celui-ci passe en alternative. Deux noms demandent en priorité l'avis d'un juriste avant la sortie : l'Élé-Clair (nom d'une famille réelle ; repli : le Dragon Vente-Flash) et le Brochet-Doré (concurrent direct de la plateforme, voir la précaution 6 ; repli : la Carpe-Miroir). Toute la liste reste à faire relire (voir la précaution 15).",
  "Ajouter dans les crédits une mention du type « œuvre de fiction ; toute ressemblance avec des enseignes existantes relève de la parodie ». Faire relire toute la liste finale par un avocat en propriété intellectuelle, en commençant par l'Élé-Clair et le Brochet-Doré. Ces notes sont un avis de bon sens, pas un avis juridique.",
  "Ton : drôle, jamais méchant. On rit des prix cassés, de la standardisation, du suremballage, de la pub, des files d'attente, des produits d'appel et des cartes de fidélité, jamais des gens."
 ]
};
