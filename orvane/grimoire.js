// Le grimoire d'Orvane : 16 emplacements par classe, chacun avec son sort de base et sa déclinaison,
// au format du contrat (moteur/CONTRAT.md). On équipe l'un ou l'autre ; changement hors combat seulement.
var ORVANE = (typeof window !== "undefined" ? window : globalThis).ORVANE = (typeof window !== "undefined" ? window : globalThis).ORVANE || {};
ORVANE.GRIMOIRE = {
 "levainqueur": [
  {
   "base": {
    "id": "levainqueur.coup-de-petrin",
    "classe": "levainqueur",
    "emplacement": 1,
    "declinaisonDe": null,
    "niveau": 1,
    "nom": "Coup de pétrin",
    "element": "T",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 1,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 18,
      "max": 22,
      "maitre": [
       23,
       28
      ]
     }
    ],
    "texte": "Un coup des deux pognes, et l'ennemi est dans le pétrin.",
    "change": ""
   },
   "declinaison": {
    "id": "levainqueur.bassinage",
    "classe": "levainqueur",
    "emplacement": 1,
    "declinaisonDe": "levainqueur.coup-de-petrin",
    "niveau": 3,
    "nom": "Bassinage",
    "element": "E",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": false
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 14,
      "max": 18,
      "maitre": [
       18,
       23
      ]
     },
     {
      "type": "etat",
      "etat": "ramolli",
      "tours": 1,
      "couches": 2
     }
    ],
    "texte": "Bassiner, c'est ajouter de l'eau pour assouplir la pâte. Ça marche aussi sur l'ennemi.",
    "change": "Le pétrin ne frappe plus au contact : l'eau part en ligne jusqu'à 3 cases, en Eaudace, et détrempe la cible (Ramolli 2 couches : −2 Pas à son prochain tour)."
   }
  },
  {
   "base": {
    "id": "levainqueur.fournee",
    "classe": "levainqueur",
    "emplacement": 2,
    "declinaisonDe": null,
    "niveau": 1,
    "nom": "Fournée",
    "element": "F",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "caseLibre",
    "parTour": 2,
    "parCible": 0,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 3,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "pose",
      "quoi": "fournee",
      "tours": 1,
      "zone": {
       "forme": "croix",
       "taille": 2,
       "tailleMin": 0,
       "baisse": true
      },
      "touche": "ennemis",
      "maitre": 15,
      "effets": [
       {
        "type": "degats",
        "element": "F",
        "min": 19,
        "max": 23,
        "maitre": [
         24,
         29
        ]
       }
      ]
     }
    ],
    "texte": "Tu poses une fournée au sol : elle cuit un tour, puis éclate en grande croix, jusqu'à 2 cases autour d'elle. Les ennemis qui y sont encore prennent tout.",
    "change": ""
   },
   "declinaison": {
    "id": "levainqueur.fournee-eclair",
    "classe": "levainqueur",
    "emplacement": 2,
    "declinaisonDe": "levainqueur.fournee",
    "niveau": 5,
    "nom": "Fournée éclair",
    "element": "C",
    "cm": 2,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": false
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "ennemi",
    "parTour": 3,
    "parCible": 2,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 9,
      "max": 12,
      "maitre": [
       11,
       15
      ]
     }
    ],
    "texte": "Une fournée faite en un éclair : pas le temps de cuire, et presque rien à payer.",
    "change": "Elle ne cuit plus au sol : elle part tout de suite, en ligne, sur une seule cible, et ne coûte que 2 coups de main, en Éclair."
   }
  },
  {
   "base": {
    "id": "levainqueur.croute-que-croute",
    "classe": "levainqueur",
    "emplacement": 3,
    "declinaisonDe": null,
    "niveau": 1,
    "nom": "Croûte que croûte",
    "element": "S",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "caseLibre",
    "parTour": 1,
    "parCible": 0,
    "relance": 2,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "rond",
     "taille": 1,
     "tailleMin": 1,
     "baisse": false
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "bond"
     },
     {
      "type": "degats",
      "element": "S",
      "min": 15,
      "max": 17,
      "maitre": [
       19,
       21
      ]
     }
    ],
    "texte": "Coûte que coûte, il y va : il bondit, et sa croûte éclate autour de lui quand il retombe.",
    "change": ""
   },
   "declinaison": {
    "id": "levainqueur.casse-croute",
    "classe": "levainqueur",
    "emplacement": 3,
    "declinaisonDe": "levainqueur.croute-que-croute",
    "niveau": 7,
    "nom": "Casse-croûte",
    "element": "C",
    "cm": 2,
    "rayon": {
     "min": 1,
     "max": 1,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 2,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 10,
      "max": 13,
      "maitre": [
       13,
       16
      ]
     },
     {
      "type": "bonus",
      "carac": "pas",
      "valeur": 2,
      "tours": 1,
      "qui": "soi"
     }
    ],
    "texte": "Un morceau sur le pouce, une pogne au passage, et ça repart.",
    "change": "On ne bondit plus : on frappe au contact, en Éclair, et le casse-croûte donne +2 Pas ce tour. À cause de ces Pas, une fois par tour et un tour sur deux (relance 2)."
   }
  },
  {
   "base": {
    "id": "levainqueur.mie-raille",
    "classe": "levainqueur",
    "emplacement": 4,
    "declinaisonDe": null,
    "niveau": 10,
    "nom": "Mie-raille",
    "element": "F",
    "cm": 2,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 3,
    "parCible": 2,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 15,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "F",
      "min": 9,
      "max": 12,
      "maitre": [
       11,
       15
      ]
     },
     {
      "type": "etat",
      "etat": "brule",
      "tours": 2,
      "couches": 1
     }
    ],
    "texte": "La mitraille de mie : des miettes brûlantes, tirées à bout portant, qui brûlent encore après.",
    "change": ""
   },
   "declinaison": {
    "id": "levainqueur.mie-stral",
    "classe": "levainqueur",
    "emplacement": 4,
    "declinaisonDe": "levainqueur.mie-raille",
    "niveau": 18,
    "nom": "Mie-stral",
    "element": "S",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 1,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "case",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "cone",
     "taille": 2,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 12,
      "max": 16,
      "maitre": [
       15,
       20
      ]
     }
    ],
    "texte": "Le mistral se lève et emporte les miettes.",
    "change": "Les miettes ne visent plus une cible : le vent les emporte en cône devant toi, sur 9 cases, en Soufflé, sans brûlure."
   }
  },
  {
   "base": {
    "id": "levainqueur.pain-beni",
    "classe": "levainqueur",
    "emplacement": 5,
    "declinaisonDe": null,
    "niveau": 26,
    "nom": "Pain béni",
    "element": "N",
    "cm": 2,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 1,
    "relance": 2,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "allies",
    "effets": [
     {
      "type": "bouclier",
      "valeur": 22,
      "tours": 2,
      "couchesMax": 1
     }
    ],
    "texte": "C'est pain béni : une croûte bénie qui encaisse à ta place.",
    "change": ""
   },
   "declinaison": {
    "id": "levainqueur.pain-banni",
    "classe": "levainqueur",
    "emplacement": 5,
    "declinaisonDe": "levainqueur.pain-beni",
    "niveau": 34,
    "nom": "Pain banni",
    "element": "C",
    "cm": 3,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 14,
      "max": 18,
      "maitre": [
       18,
       23
      ]
     },
     {
      "type": "rebond",
      "fois": 1,
      "rayon": 2,
      "part": 50
     }
    ],
    "texte": "Le ciel ne bénit plus : il foudroie, et la foudre saute sur le voisin.",
    "change": "Le pain béni devient pain banni : plus de bouclier, une frappe Éclair de 2 à 5 cases qui rebondit sur un ennemi proche."
   }
  },
  {
   "base": {
    "id": "levainqueur.baguette-magique",
    "classe": "levainqueur",
    "emplacement": 6,
    "declinaisonDe": null,
    "niveau": 41,
    "nom": "Baguette magique",
    "element": "T",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": false
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 16,
      "max": 20,
      "maitre": [
       20,
       25
      ]
     },
     {
      "type": "pousse",
      "cases": 1
     }
    ],
    "texte": "Pas de magie : une baguette de la veille, dure comme du bois, et l'ennemi recule.",
    "change": ""
   },
   "declinaison": {
    "id": "levainqueur.baguette-de-sourcier",
    "classe": "levainqueur",
    "emplacement": 6,
    "declinaisonDe": "levainqueur.baguette-magique",
    "niveau": 49,
    "nom": "Baguette de sourcier",
    "element": "E",
    "cm": 3,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "case",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "croix",
     "taille": 1,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 10,
      "max": 14,
      "maitre": [
       13,
       18
      ]
     },
     {
      "type": "etat",
      "etat": "ramolli",
      "tours": 1,
      "couches": 1
     }
    ],
    "texte": "Du sorcier au sourcier : la baguette tremble, et l'eau jaillit sous les pieds.",
    "change": "La baguette ne pousse plus une cible en ligne : elle fait jaillir une source en croix qui ramollit (−1 Pas), en Eaudace."
   }
  },
  {
   "base": {
    "id": "levainqueur.four-a-pain",
    "classe": "levainqueur",
    "emplacement": 7,
    "declinaisonDe": null,
    "niveau": 57,
    "nom": "Four à pain",
    "element": "F",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "caseLibre",
    "parTour": 1,
    "parCible": 0,
    "relance": 2,
    "relanceInitiale": 0,
    "plafondPose": 2,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "pose",
      "quoi": "fournee",
      "tours": 2,
      "victuailles": 60,
      "zone": {
       "forme": "rond",
       "taille": 1,
       "tailleMin": 0,
       "baisse": true
      },
      "touche": "ennemis",
      "maitre": 15,
      "effets": [
       {
        "type": "degats",
        "element": "F",
        "min": 31,
        "max": 37,
        "maitre": [
         39,
         46
        ]
       }
      ]
     }
    ],
    "texte": "Un vrai four au sol : il cuit deux tours en cachant la vue, puis il éclate, sauf si l'ennemi le casse avant. Un four, ça prend de la place : relance de 2 tours, deux au plus sur le terrain.",
    "change": ""
   },
   "declinaison": {
    "id": "levainqueur.chaleur-tournante",
    "classe": "levainqueur",
    "emplacement": 7,
    "declinaisonDe": "levainqueur.four-a-pain",
    "niveau": 65,
    "nom": "Chaleur tournante",
    "element": "S",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "caseLibre",
    "parTour": 1,
    "parCible": 0,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 2,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "pose",
      "quoi": "fournee",
      "tours": 1,
      "zone": {
       "forme": "rond",
       "taille": 2,
       "tailleMin": 0,
       "baisse": true
      },
      "touche": "ennemis",
      "maitre": 5,
      "effets": [
       {
        "type": "degats",
        "element": "S",
        "min": 22,
        "max": 27,
        "maitre": [
         28,
         34
        ]
       }
      ]
     }
    ],
    "texte": "Un four ventilé : la chaleur tourne un seul tour, puis elle souffle large, jusqu'à 2 cases autour.",
    "change": "Toujours une fournée, mais le four ventilé ne bloque plus sa case et ne se casse pas : il cuit en un tour, sans relance, et souffle sur 2 cases autour, moins fort, en Soufflé."
   }
  },
  {
   "base": {
    "id": "levainqueur.batard-trempe",
    "classe": "levainqueur",
    "emplacement": 8,
    "declinaisonDe": null,
    "niveau": 73,
    "nom": "Bâtard trempé",
    "element": "E",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 15,
      "max": 19,
      "maitre": [
       19,
       24
      ]
     },
     {
      "type": "etat",
      "etat": "ramolli",
      "tours": 2,
      "couches": 1
     }
    ],
    "texte": "Un bâtard trempé : la mie molle colle aux pieds pendant deux tours.",
    "change": ""
   },
   "declinaison": {
    "id": "levainqueur.batard-rassis",
    "classe": "levainqueur",
    "emplacement": 8,
    "declinaisonDe": "levainqueur.batard-trempe",
    "niveau": 81,
    "nom": "Bâtard rassis",
    "element": "T",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 2,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 18,
      "max": 23,
      "maitre": [
       23,
       29
      ]
     }
    ],
    "texte": "Trois jours d'âge, dur comme la pierre : on le lance de tout près, même sans être au contact.",
    "change": "Le même bâtard, sec au lieu de trempé : il ne ralentit plus, il cogne plus fort, mais de 1 à 2 cases seulement, en Terroir."
   }
  },
  {
   "base": {
    "id": "levainqueur.petrissage",
    "classe": "levainqueur",
    "emplacement": 9,
    "declinaisonDe": null,
    "niveau": 88,
    "nom": "Pétrissage",
    "element": "S",
    "cm": 3,
    "rayon": {
     "min": 2,
     "max": 4,
     "modifiable": false
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 14,
      "max": 17,
      "maitre": [
       18,
       21
      ]
     },
     {
      "type": "attire",
      "cases": 3
     }
    ],
    "texte": "On ramène la pâte vers soi, encore et encore, et l'ennemi avec.",
    "change": ""
   },
   "declinaison": {
    "id": "levainqueur.coup-de-pousse",
    "classe": "levainqueur",
    "emplacement": 9,
    "declinaisonDe": "levainqueur.petrissage",
    "niveau": 96,
    "nom": "Coup de pousse",
    "element": "T",
    "cm": 3,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 0,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "rond",
     "taille": 1,
     "tailleMin": 1,
     "baisse": false
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 11,
      "max": 15,
      "maitre": [
       14,
       19
      ]
     },
     {
      "type": "pousse",
      "cases": 2
     }
    ],
    "texte": "La pâte a levé d'un coup : tout le monde dehors !",
    "change": "Après le pétrissage, la pousse : au lieu d'attirer une cible, la pâte gonfle autour de toi et repousse tous les ennemis de 2 cases, en Terroir."
   }
  },
  {
   "base": {
    "id": "levainqueur.ficelle-electrique",
    "classe": "levainqueur",
    "emplacement": 10,
    "declinaisonDe": null,
    "niveau": 104,
    "nom": "Ficelle électrique",
    "element": "C",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 5,
     "modifiable": true
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 15,
      "max": 19,
      "maitre": [
       19,
       24
      ]
     },
     {
      "type": "rebond",
      "fois": 2,
      "rayon": 2,
      "part": 50
     }
    ],
    "texte": "Une ficelle, c'est une baguette fine. Celle-ci conduit le courant d'un ennemi à l'autre.",
    "change": ""
   },
   "declinaison": {
    "id": "levainqueur.bien-ficele",
    "classe": "levainqueur",
    "emplacement": 10,
    "declinaisonDe": "levainqueur.ficelle-electrique",
    "niveau": 112,
    "nom": "Bien ficelé",
    "element": "E",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 13,
      "max": 17,
      "maitre": [
       16,
       21
      ]
     },
     {
      "type": "etat",
      "etat": "enracine",
      "tours": 1,
      "couches": 1
     }
    ],
    "texte": "Ficelé comme un rôti, il ne bouge plus.",
    "change": "La ficelle ne rebondit plus : elle ligote une seule cible et l'enracine 1 tour, moins fort mais avec du contrôle, en Eaudace."
   }
  },
  {
   "base": {
    "id": "levainqueur.la-levee",
    "classe": "levainqueur",
    "emplacement": 11,
    "declinaisonDe": null,
    "niveau": 120,
    "nom": "La levée",
    "element": "N",
    "cm": 2,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 0,
    "relance": 3,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "allies",
    "effets": [
     {
      "type": "bonus",
      "carac": "levure",
      "valeur": 80,
      "tours": 2,
      "qui": "soi"
     }
    ],
    "texte": "La pâte prend l'air et monte : la Levure fait tout monter.",
    "change": ""
   },
   "declinaison": {
    "id": "levainqueur.levee-de-boucliers",
    "classe": "levainqueur",
    "emplacement": 11,
    "declinaisonDe": "levainqueur.la-levee",
    "niveau": 128,
    "nom": "Levée de boucliers",
    "element": "N",
    "cm": 3,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 1,
    "relance": 2,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "rond",
     "taille": 1,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "allies",
    "effets": [
     {
      "type": "bouclier",
      "valeur": 30,
      "tours": 2,
      "couchesMax": 1
     }
    ],
    "texte": "On ne lève plus la pâte, on lève les boucliers.",
    "change": "La puissance pour toi seul devient un bouclier pour toi et chaque allié à côté de toi."
   }
  },
  {
   "base": {
    "id": "levainqueur.galette-des-rois",
    "classe": "levainqueur",
    "emplacement": 12,
    "declinaisonDe": null,
    "niveau": 135,
    "nom": "Galette des rois",
    "element": "N",
    "cm": 1,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 2,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "etat",
      "etat": "feve",
      "tours": 99,
      "couches": 1
     }
    ],
    "texte": "Une fève cachée sur un ennemi, pour un seul coup de main : celui qui le fait tomber devient roi et gagne 1 coup de main.",
    "change": ""
   },
   "declinaison": {
    "id": "levainqueur.tirer-les-rois",
    "classe": "levainqueur",
    "emplacement": 12,
    "declinaisonDe": "levainqueur.galette-des-rois",
    "niveau": 143,
    "nom": "Tirer les rois",
    "element": "C",
    "cm": 3,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 16,
      "max": 21,
      "maitre": [
       20,
       26
      ]
     },
     {
      "type": "si",
      "condition": "cibleTombe",
      "effets": [
       {
        "type": "gainCM",
        "n": 1,
        "qui": "soi"
       }
      ]
     }
    ],
    "texte": "On tire les rois, et on tire tout court : si la cible tombe, la fève est pour toi.",
    "change": "Plus de fève à cacher : tu tires toi-même, en Éclair, et si la cible tombe, c'est toi qui gagnes le coup de main."
   }
  },
  {
   "base": {
    "id": "levainqueur.brioche-filante",
    "classe": "levainqueur",
    "emplacement": 13,
    "declinaisonDe": null,
    "niveau": 151,
    "nom": "Brioche filante",
    "element": "C",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": false
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 2,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 25,
      "max": 31,
      "maitre": [
       31,
       39
      ]
     },
     {
      "type": "dans-le-dos"
     }
    ],
    "texte": "Comme une étoile filante, vive comme l'éclair : la brioche fonce, frappe et ressort derrière la cible. Elle revient un tour sur deux : on ne file pas deux fois de suite.",
    "change": ""
   },
   "declinaison": {
    "id": "levainqueur.tete-de-brioche",
    "classe": "levainqueur",
    "emplacement": 13,
    "declinaisonDe": "levainqueur.brioche-filante",
    "niveau": 159,
    "nom": "Tête de brioche",
    "element": "T",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 1,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 26,
      "max": 32,
      "maitre": [
       33,
       40
      ]
     },
     {
      "type": "pousse",
      "cases": 1
     }
    ],
    "texte": "Un coup de tête de pioche, et la cible recule d'une case.",
    "change": "Plus de course : la brioche à tête frappe au contact, sans bouger, plus fort, et repousse d'une case, en Terroir."
   }
  },
  {
   "base": {
    "id": "levainqueur.geindre",
    "classe": "levainqueur",
    "emplacement": 14,
    "declinaisonDe": null,
    "niveau": 167,
    "nom": "Geindre",
    "element": "T",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 2,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "caseLibre",
    "parTour": 1,
    "parCible": 0,
    "relance": 4,
    "relanceInitiale": 1,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "invoque",
      "commis": {
       "nom": "Geindre",
       "victuailles": 100,
       "cm": 4,
       "pas": 3,
       "ouverture": 80,
       "rideau": 12,
       "fauxFuyant": 4,
       "sorts": [
        {
         "id": "levainqueur.petite-pogne",
         "classe": "levainqueur",
         "declinaisonDe": null,
         "niveau": 167,
         "nom": "Petite pogne",
         "element": "T",
         "cm": 2,
         "rayon": {
          "min": 1,
          "max": 1,
          "modifiable": false
         },
         "lancer": "libre",
         "vue": true,
         "cible": "ennemi",
         "parTour": 3,
         "parCible": 2,
         "relance": 0,
         "relanceInitiale": 0,
         "plafondPose": 0,
         "maitre": 5,
         "zone": {
          "forme": "case",
          "taille": 0,
          "tailleMin": 0,
          "baisse": true
         },
         "touche": "ennemis",
         "effets": [
          {
           "type": "degats",
           "element": "T",
           "min": 9,
           "max": 12,
           "maitre": [
            11,
            15
           ]
          }
         ],
         "texte": "Le geindre pétrit l'ennemi de ses pognes, en soufflant fort.",
         "change": ""
        }
       ]
      }
     }
    ],
    "texte": "Le geindre, c'est l'ouvrier du fournil qui pétrit en soufflant fort. Il vient t'aider : il retient les ennemis au contact (beaucoup de Rideau) et les pétrit de ses grosses pognes.",
    "change": ""
   },
   "declinaison": {
    "id": "levainqueur.geindre-courant-d-air",
    "classe": "levainqueur",
    "emplacement": 14,
    "declinaisonDe": "levainqueur.geindre",
    "niveau": 175,
    "nom": "Geindre courant d'air",
    "element": "S",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 2,
     "modifiable": false
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "case",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "ligne",
     "taille": 3,
     "tailleMin": 0,
     "baisse": false
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 20,
      "max": 24,
      "maitre": [
       25,
       30
      ]
     }
    ],
    "texte": "Un courant d'air en tablier : on l'a à peine vu passer.",
    "change": "Le geindre ne reste plus : il passe en courant d'air et frappe tout de suite chaque ennemi d'une ligne de 4 cases, en Soufflé."
   }
  },
  {
   "base": {
    "id": "levainqueur.pain-perdu",
    "classe": "levainqueur",
    "emplacement": 15,
    "declinaisonDe": null,
    "niveau": 182,
    "nom": "Pain perdu",
    "element": "E",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 19,
      "max": 24,
      "maitre": [
       24,
       30
      ]
     },
     {
      "type": "retire",
      "quoi": "cm",
      "n": 2
     }
    ],
    "texte": "Le pain perdu ne l'est pas pour tout le monde : la cible perd 2 coups de main.",
    "change": ""
   },
   "declinaison": {
    "id": "levainqueur.pain-dore",
    "classe": "levainqueur",
    "emplacement": 15,
    "declinaisonDe": "levainqueur.pain-perdu",
    "niveau": 190,
    "nom": "Pain doré",
    "element": "F",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": false
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 15,
    "zone": {
     "forme": "ligne",
     "taille": 1,
     "tailleMin": 0,
     "baisse": false
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "F",
      "min": 24,
      "max": 30,
      "maitre": [
       30,
       38
      ]
     }
    ],
    "texte": "Doré des deux côtés.",
    "change": "Le pain perdu, doré à la poêle : il ne vole plus de coups de main, il frappe fort la cible et l'ennemi juste derrière, en Flambée."
   }
  },
  {
   "base": {
    "id": "levainqueur.chef-d-oeuvre-la-grande-fournee",
    "classe": "levainqueur",
    "emplacement": 16,
    "declinaisonDe": null,
    "niveau": 200,
    "nom": "Chef-d'œuvre : la Grande Fournée",
    "element": "F",
    "cm": 7,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 0,
    "relance": 5,
    "relanceInitiale": 2,
    "plafondPose": 0,
    "maitre": 15,
    "zone": {
     "forme": "rond",
     "taille": 3,
     "tailleMin": 1,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "F",
      "min": 40,
      "max": 50,
      "maitre": [
       50,
       63
      ]
     },
     {
      "type": "renforce",
      "quoi": "famille:fournee",
      "valeur": 50,
      "tours": 2,
      "fois": 0
     }
    ],
    "texte": "Le grand four s'ouvre : tout brûle autour de toi, et ce qui cuit encore éclate 50 % plus fort pendant 2 tours.",
    "change": ""
   },
   "declinaison": {
    "id": "levainqueur.chef-d-oeuvre-le-grand-petrin",
    "classe": "levainqueur",
    "emplacement": 16,
    "declinaisonDe": "levainqueur.chef-d-oeuvre-la-grande-fournee",
    "niveau": 200,
    "nom": "Chef-d'œuvre : le Grand Pétrin",
    "element": "E",
    "cm": 7,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 0,
    "relance": 5,
    "relanceInitiale": 2,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "terrain",
     "taille": 0,
     "tailleMin": 0,
     "baisse": false
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 28,
      "max": 35,
      "maitre": [
       35,
       44
      ]
     },
     {
      "type": "retire",
      "quoi": "pas",
      "n": 2
     }
    ],
    "texte": "Tout le monde dans le pétrin : la pâte trop mouillée colle à tous les pieds.",
    "change": "Au lieu d'ouvrir le grand four autour de toi, tu mets tout le terrain dans le pétrin : moins fort, mais chaque ennemi est touché et perd 2 Pas, en Eaudace."
   }
  }
 ],
 "patissorcier": [
  {
   "base": {
    "id": "patissorcier.chou-chou",
    "classe": "patissorcier",
    "emplacement": 1,
    "declinaisonDe": null,
    "niveau": 1,
    "nom": "Chou-chou",
    "element": "F",
    "cm": 2,
    "rayon": {
     "min": 2,
     "max": 6,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "ennemi",
    "parTour": 3,
    "parCible": 2,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 15,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "F",
      "min": 7,
      "max": 8,
      "maitre": [
       9,
       10
      ]
     }
    ],
    "texte": "Un chou tout chaud, lancé en cloche par-dessus les obstacles : pas besoin de voir la cible. Le tir en cloche se paie : un peu moins de dégâts, et le Rayon ne s'allonge pas.",
    "change": ""
   },
   "declinaison": {
    "id": "patissorcier.chouquettes",
    "classe": "patissorcier",
    "emplacement": 1,
    "declinaisonDe": "patissorcier.chou-chou",
    "niveau": 3,
    "nom": "Chouquettes",
    "element": "S",
    "cm": 2,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "case",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "rond",
     "taille": 1,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 6,
      "max": 9,
      "maitre": [
       8,
       11
      ]
     }
    ],
    "texte": "Une poignée de chouquettes emportées par le vent, qui retombent en pluie sucrée.",
    "change": "Le chou lancé en cloche sur une seule cible devient une poignée de chouquettes qui retombent en zone, en Soufflé : il faut voir la case visée, mais les ennemis à côté sont touchés aussi."
   }
  },
  {
   "base": {
    "id": "patissorcier.glacage",
    "classe": "patissorcier",
    "emplacement": 2,
    "declinaisonDe": null,
    "niveau": 1,
    "nom": "Glaçage",
    "element": "N",
    "cm": 2,
    "rayon": {
     "min": 0,
     "max": 4,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "allie",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "allies",
    "effets": [
     {
      "type": "bouclier",
      "valeur": 12,
      "tours": 3,
      "couchesMax": 3
     },
     {
      "type": "etat",
      "etat": "nappe",
      "tours": 3,
      "couches": 1
     }
    ],
    "texte": "Une couche de sucre glace qui durcit sur un allié, ou sur soi, et tient 3 tours. Le Glaçage se pose couche par couche : deux lancers par tour, une couche par allié et par tour, sans relance. Un allié glacé trois tours de suite porte trois couches.",
    "change": ""
   },
   "declinaison": {
    "id": "patissorcier.glacage-a-la-louche",
    "classe": "patissorcier",
    "emplacement": 2,
    "declinaisonDe": "patissorcier.glacage",
    "niveau": 5,
    "nom": "Glaçage à la louche",
    "element": "N",
    "cm": 3,
    "rayon": {
     "min": 0,
     "max": 4,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "case",
    "parTour": 1,
    "parCible": 0,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "croix",
     "taille": 1,
     "tailleMin": 0,
     "baisse": false
    },
    "touche": "allies",
    "effets": [
     {
      "type": "bouclier",
      "valeur": 8,
      "tours": 3,
      "couchesMax": 3
     },
     {
      "type": "etat",
      "etat": "nappe",
      "tours": 3,
      "couches": 1
     }
    ],
    "texte": "On ne lisse plus au couteau : on verse à la louche sur tout le monde, et tant pis pour les finitions.",
    "change": "Le glaçage versé à la louche couvre une croix d'alliés d'une couche plus fine (8 au lieu de 12), une fois par tour et sans relance, pour la reverser à chaque tour. Seul, c'est moins bien ; dès que trois alliés se serrent, c'est mieux."
   }
  },
  {
   "base": {
    "id": "patissorcier.crepe-volante",
    "classe": "patissorcier",
    "emplacement": 3,
    "declinaisonDe": null,
    "niveau": 1,
    "nom": "Crêpe volante",
    "element": "N",
    "cm": 2,
    "rayon": {
     "min": 0,
     "max": 3,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "allie",
    "parTour": 1,
    "parCible": 0,
    "relance": 2,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "allies",
    "effets": [
     {
      "type": "bonus",
      "carac": "pas",
      "valeur": 2,
      "tours": 1,
      "qui": "cible"
     },
     {
      "type": "etat",
      "etat": "glissant",
      "tours": 1,
      "couches": 1
     }
    ],
    "texte": "Il glisse une crêpe volante sous les pieds d'un allié, ou sous les siens : +2 Pas et Glissant, on file au ras du sol sans se laisser retenir. C'est le déplacement de la classe : relance de 2 tours, comme un bond.",
    "change": ""
   },
   "declinaison": {
    "id": "patissorcier.crepe-suzette",
    "classe": "patissorcier",
    "emplacement": 3,
    "declinaisonDe": "patissorcier.crepe-volante",
    "niveau": 7,
    "nom": "Crêpe Suzette",
    "element": "F",
    "cm": 2,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 3,
    "parCible": 2,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "F",
      "min": 9,
      "max": 12,
      "maitre": [
       11,
       15
      ]
     },
     {
      "type": "etat",
      "etat": "brule",
      "tours": 2,
      "couches": 1
     }
    ],
    "texte": "La crêpe saute, flambe à l'orange et retombe sur la tête de l'ennemi : ça brûle encore au tour suivant.",
    "change": "La crêpe ne porte plus personne : flambée, elle retombe sur un ennemi proche et le laisse Brûlé, en Flambée. Le déplacement devient des dégâts qui durent."
   }
  },
  {
   "base": {
    "id": "patissorcier.douceur",
    "classe": "patissorcier",
    "emplacement": 4,
    "declinaisonDe": null,
    "niveau": 10,
    "nom": "Douceur",
    "element": "N",
    "cm": 3,
    "rayon": {
     "min": 0,
     "max": 3,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "allie",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "allies",
    "effets": [
     {
      "type": "soin",
      "min": 15,
      "max": 19,
      "maitre": [
       19,
       24
      ]
     }
    ],
    "texte": "Une petite douceur, et ça va tout de suite mieux. Soigner, c'est son métier : une Douceur par tour, sans relance, là où les autres soins attendent 2 tours.",
    "change": ""
   },
   "declinaison": {
    "id": "patissorcier.eau-douce",
    "classe": "patissorcier",
    "emplacement": 4,
    "declinaisonDe": "patissorcier.douceur",
    "niveau": 18,
    "nom": "Eau douce",
    "element": "E",
    "cm": 3,
    "rayon": {
     "min": 2,
     "max": 6,
     "modifiable": true
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 14,
      "max": 17,
      "maitre": [
       18,
       21
      ]
     },
     {
      "type": "retire",
      "quoi": "pas",
      "n": 1
     }
    ],
    "texte": "Un jet d'eau sucrée en pleine figure : ça colle, et on avance moins vite.",
    "change": "La douceur qui soigne un allié devient un jet d'eau sucrée tiré en ligne et de loin : le soin laisse place à des dégâts Eaudace qui retirent 1 Pas."
   }
  },
  {
   "base": {
    "id": "patissorcier.coup-de-fouet",
    "classe": "patissorcier",
    "emplacement": 5,
    "declinaisonDe": null,
    "niveau": 26,
    "nom": "Coup de fouet",
    "element": "T",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": false
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 15,
      "max": 19,
      "maitre": [
       19,
       24
      ]
     },
     {
      "type": "pousse",
      "cases": 2
     }
    ],
    "texte": "Un coup de fouet qui claque au ras du sol : l'ennemi recule de 2 cases. Gare au mur derrière lui.",
    "change": ""
   },
   "declinaison": {
    "id": "patissorcier.fouet-survolte",
    "classe": "patissorcier",
    "emplacement": 5,
    "declinaisonDe": "patissorcier.coup-de-fouet",
    "niveau": 34,
    "nom": "Fouet survolté",
    "element": "C",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": false
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 14,
      "max": 18,
      "maitre": [
       18,
       23
      ]
     },
     {
      "type": "rebond",
      "fois": 1,
      "rayon": 3,
      "part": 50
     }
    ],
    "texte": "Le fouet claque si vite qu'il crépite : l'étincelle saute jusqu'à 3 cases, sur un deuxième ennemi.",
    "change": "Le coup de fouet ne repousse plus : la mèche chargée d'électricité porte un peu plus loin en ligne (1 à 4 cases), en Éclair, et l'étincelle saute sur un deuxième ennemi jusqu'à 3 cases."
   }
  },
  {
   "base": {
    "id": "patissorcier.tourbillon-de-meringue",
    "classe": "patissorcier",
    "emplacement": 6,
    "declinaisonDe": null,
    "niveau": 41,
    "nom": "Tourbillon de meringue",
    "element": "S",
    "cm": 4,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "case",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "rond",
     "taille": 2,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 13,
      "max": 17,
      "maitre": [
       16,
       21
      ]
     }
    ],
    "texte": "La meringue part en tourbillon : un grand nuage sucré qui fouette tous les ennemis alentour.",
    "change": ""
   },
   "declinaison": {
    "id": "patissorcier.blancs-en-neige",
    "classe": "patissorcier",
    "emplacement": 6,
    "declinaisonDe": "patissorcier.tourbillon-de-meringue",
    "niveau": 49,
    "nom": "Blancs en neige",
    "element": "E",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 14,
      "max": 17,
      "maitre": [
       18,
       21
      ]
     },
     {
      "type": "etat",
      "etat": "ramolli",
      "tours": 1,
      "couches": 1
     }
    ],
    "texte": "Des blancs montés en neige et tassés en boule : la neige colle aux bottes.",
    "change": "Les mêmes blancs d'œufs, tassés en boule : une seule cible au lieu d'un grand tourbillon, plus fort, en Eaudace, et la cible Ramollie perd 1 Pas."
   }
  },
  {
   "base": {
    "id": "patissorcier.flan-be",
    "classe": "patissorcier",
    "emplacement": 7,
    "declinaisonDe": null,
    "niveau": 57,
    "nom": "Flan-bé",
    "element": "F",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 15,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "F",
      "min": 15,
      "max": 19,
      "maitre": [
       19,
       24
      ]
     },
     {
      "type": "etat",
      "etat": "brule",
      "tours": 2,
      "couches": 1
     }
    ],
    "texte": "Un flan flambé au rhum : il brûle encore au tour suivant.",
    "change": ""
   },
   "declinaison": {
    "id": "patissorcier.tremblement-de-flan",
    "classe": "patissorcier",
    "emplacement": 7,
    "declinaisonDe": "patissorcier.flan-be",
    "niveau": 65,
    "nom": "Tremblement de flan",
    "element": "T",
    "cm": 3,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "case",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "croix",
     "taille": 2,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 11,
      "max": 14,
      "maitre": [
       14,
       18
      ]
     }
    ],
    "texte": "Le sol tremble comme un flan qu'on démoule : la secousse passe sous terre.",
    "change": "Le flan ne brûle plus une seule cible : il fait trembler le sol en grande croix, sans ligne de vue, en Terroir."
   }
  },
  {
   "base": {
    "id": "patissorcier.eclair-au-chocolat",
    "classe": "patissorcier",
    "emplacement": 8,
    "declinaisonDe": null,
    "niveau": 73,
    "nom": "Éclair au chocolat",
    "element": "C",
    "cm": 2,
    "rayon": {
     "min": 2,
     "max": 6,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 3,
    "parCible": 2,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 10,
      "max": 13,
      "maitre": [
       13,
       16
      ]
     },
     {
      "type": "si",
      "condition": "cibleTombe",
      "effets": [
       {
        "type": "gainCM",
        "n": 1,
        "qui": "soi"
       }
      ]
     }
    ],
    "texte": "Vite fait, vite avalé : si l'éclair fait tomber la cible, le Pâtissorcier regagne 1 CM.",
    "change": ""
   },
   "declinaison": {
    "id": "patissorcier.fondant-au-chocolat",
    "classe": "patissorcier",
    "emplacement": 8,
    "declinaisonDe": "patissorcier.eclair-au-chocolat",
    "niveau": 81,
    "nom": "Fondant au chocolat",
    "element": "F",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 20,
    "zone": {
     "forme": "rond",
     "taille": 1,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "F",
      "min": 18,
      "max": 22,
      "maitre": [
       22,
       27
      ]
     }
    ],
    "texte": "Le chocolat fond sur la cible, et le cœur coulant déborde sur les ennemis à côté.",
    "change": "Le chocolat ne file plus comme un éclair : il fond de près, plus fort, avec plus de coups de maître, et le cœur coulant éclabousse les ennemis collés à la cible, en Flambée."
   }
  },
  {
   "base": {
    "id": "patissorcier.ile-flottante",
    "classe": "patissorcier",
    "emplacement": 9,
    "declinaisonDe": null,
    "niveau": 88,
    "nom": "Île flottante",
    "element": "E",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "case",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "rond",
     "taille": 1,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 15,
      "max": 19,
      "maitre": [
       19,
       24
      ]
     },
     {
      "type": "etat",
      "etat": "ramolli",
      "tours": 1,
      "couches": 1
     }
    ],
    "texte": "Une île de blancs qui flotte sur la crème anglaise : les ennemis y pataugent et perdent 1 Pas.",
    "change": ""
   },
   "declinaison": {
    "id": "patissorcier.ile-deserte",
    "classe": "patissorcier",
    "emplacement": 9,
    "declinaisonDe": "patissorcier.ile-flottante",
    "niveau": 96,
    "nom": "Île déserte",
    "element": "T",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "combattant",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "anneau",
     "taille": 1,
     "tailleMin": 0,
     "baisse": false
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 12,
      "max": 15,
      "maitre": [
       15,
       19
      ]
     },
     {
      "type": "pousse",
      "cases": 2
     }
    ],
    "texte": "Seul sur son île : les ennemis collés au combattant visé sont chassés. Lancée sur un allié encerclé, elle fait le vide autour de lui.",
    "change": "L'île ne fait plus patauger une zone : elle frappe et chasse de 2 cases les ennemis collés à un combattant, allié ou ennemi, en Terroir. Le combattant visé n'est pas touché."
   }
  },
  {
   "base": {
    "id": "patissorcier.mille-feuille",
    "classe": "patissorcier",
    "emplacement": 10,
    "declinaisonDe": null,
    "niveau": 104,
    "nom": "Mille-feuille",
    "element": "S",
    "cm": 3,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "case",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "travers",
     "taille": 2,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 12,
      "max": 16,
      "maitre": [
       15,
       20
      ]
     }
    ],
    "texte": "Cinq feuilles tranchantes qui volent côte à côte : une belle part de mille-feuille, servie en travers.",
    "change": ""
   },
   "declinaison": {
    "id": "patissorcier.mille-volts",
    "classe": "patissorcier",
    "emplacement": 10,
    "declinaisonDe": "patissorcier.mille-feuille",
    "niveau": 112,
    "nom": "Mille-volts",
    "element": "C",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 19,
      "max": 23,
      "maitre": [
       24,
       29
      ]
     },
     {
      "type": "rebond",
      "fois": 2,
      "rayon": 3,
      "part": 50
     }
    ],
    "texte": "Mille feuilles, mille volts : le courant saute d'ennemi en ennemi.",
    "change": "Les feuilles ne volent plus en travers : une seule décharge, qui rebondit deux fois sur les ennemis proches à moitié de sa force, en Éclair, pour un coup de main de plus."
   }
  },
  {
   "base": {
    "id": "patissorcier.piece-montee",
    "classe": "patissorcier",
    "emplacement": 11,
    "declinaisonDe": null,
    "niveau": 120,
    "nom": "Pièce montée",
    "element": "N",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 2,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "caseLibre",
    "parTour": 1,
    "parCible": 0,
    "relance": 4,
    "relanceInitiale": 1,
    "plafondPose": 1,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "allies",
    "effets": [
     {
      "type": "pose",
      "quoi": "ustensile",
      "nom": "Pièce montée",
      "victuailles": 120,
      "tours": 3,
      "zone": {
       "forme": "rond",
       "taille": 1,
       "tailleMin": 1,
       "baisse": false
      },
      "touche": "allies",
      "maitre": 0,
      "effets": [
       {
        "type": "bouclier",
        "valeur": 16,
        "tours": 2,
        "couchesMax": 3
       },
       {
        "type": "etat",
        "etat": "nappe",
        "tours": 2,
        "couches": 1
       }
      ]
     }
    ],
    "texte": "Une pièce montée de choux et de nougatine monte la garde pendant 3 tours. Elle ne bouge pas, bloque le passage et la vue, et au début de chaque tour du Pâtissorcier elle glace les alliés collés à elle. Le Chou-chou, lancé en cloche, passe par-dessus. Une seule à la fois.",
    "change": ""
   },
   "declinaison": {
    "id": "patissorcier.piece-demontee",
    "classe": "patissorcier",
    "emplacement": 11,
    "declinaisonDe": "patissorcier.piece-montee",
    "niveau": 128,
    "nom": "Pièce démontée",
    "element": "T",
    "cm": 4,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "case",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 2,
    "maitre": 5,
    "zone": {
     "forme": "croix",
     "taille": 1,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 15,
      "max": 19,
      "maitre": [
       19,
       24
      ]
     },
     {
      "type": "pose",
      "quoi": "nappe",
      "tours": 2,
      "declenche": "entree",
      "zone": {
       "forme": "croix",
       "taille": 1,
       "tailleMin": 0,
       "baisse": false
      },
      "touche": "ennemis",
      "maitre": 5,
      "effets": [
       {
        "type": "degats",
        "element": "T",
        "min": 8,
        "max": 10,
        "maitre": [
         10,
         13
        ]
       }
      ]
     }
    ],
    "texte": "La pièce montée s'écroule sur les ennemis. Les éclats de nougatine restent au sol : qui marche dessus se blesse.",
    "change": "La pièce montée ne garde plus personne : elle s'écroule en croix sur les ennemis, et ses éclats restent au sol 2 tours, en Terroir. Une fois par tour et deux tas d'éclats au plus, car chaque lancer frappe et laisse en plus une nappe qui blesse."
   }
  },
  {
   "base": {
    "id": "patissorcier.paris-brest",
    "classe": "patissorcier",
    "emplacement": 12,
    "declinaisonDe": null,
    "niveau": 135,
    "nom": "Paris-Brest",
    "element": "N",
    "cm": 3,
    "rayon": {
     "min": 2,
     "max": 8,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "allie",
    "parTour": 1,
    "parCible": 0,
    "relance": 2,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "allies",
    "effets": [
     {
      "type": "ramene",
      "cases": 8
     }
    ],
    "texte": "En selle sur la roue de pâte à choux : l'allié lointain revient à toute allure, jusqu'au contact du Pâtissorcier.",
    "change": ""
   },
   "declinaison": {
    "id": "patissorcier.brest-paris",
    "classe": "patissorcier",
    "emplacement": 12,
    "declinaisonDe": "patissorcier.paris-brest",
    "niveau": 143,
    "nom": "Brest-Paris",
    "element": "T",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 12,
      "max": 15,
      "maitre": [
       15,
       19
      ]
     },
     {
      "type": "pousse",
      "cases": 4
     }
    ],
    "texte": "Le retour se fait à toute allure : l'ennemi repart 4 cases plus loin, et s'écrase s'il heurte quelque chose.",
    "change": "Le même trajet à l'envers : au lieu de ramener un allié, on renvoie un ennemi proche 4 cases plus loin, en Terroir. Moins de dégâts directs, mais l'Écrasement fait mal s'il heurte un obstacle."
   }
  },
  {
   "base": {
    "id": "patissorcier.opera",
    "classe": "patissorcier",
    "emplacement": 13,
    "declinaisonDe": null,
    "niveau": 151,
    "nom": "Opéra",
    "element": "N",
    "cm": 4,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 0,
    "relance": 3,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "rond",
     "taille": 3,
     "tailleMin": 0,
     "baisse": false
    },
    "touche": "allies",
    "effets": [
     {
      "type": "bonus",
      "carac": "cm",
      "valeur": 1,
      "tours": 1,
      "qui": "cible"
     }
    ],
    "texte": "Un opéra en trois couches et trois actes : portés par la musique, les alliés proches gagnent 1 coup de main.",
    "change": ""
   },
   "declinaison": {
    "id": "patissorcier.opera-rock",
    "classe": "patissorcier",
    "emplacement": 13,
    "declinaisonDe": "patissorcier.opera",
    "niveau": 159,
    "nom": "Opéra rock",
    "element": "F",
    "cm": 4,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 0,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 15,
    "zone": {
     "forme": "rond",
     "taille": 2,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "F",
      "min": 16,
      "max": 20,
      "maitre": [
       20,
       25
      ]
     },
     {
      "type": "etat",
      "etat": "brule",
      "tours": 2,
      "couches": 1
     }
    ],
    "texte": "La salle s'enflamme : les ennemis autour du Pâtissorcier brûlent encore après le dernier accord.",
    "change": "Même scène, autre musique : au lieu de donner un coup de main aux alliés proches, le concert brûle les ennemis autour du Pâtissorcier, en Flambée."
   }
  },
  {
   "base": {
    "id": "patissorcier.charlotte",
    "classe": "patissorcier",
    "emplacement": 14,
    "declinaisonDe": null,
    "niveau": 167,
    "nom": "Charlotte",
    "element": "E",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 21,
      "max": 25,
      "maitre": [
       26,
       31
      ]
     },
     {
      "type": "etat",
      "etat": "enracine",
      "tours": 1,
      "couches": 1
     }
    ],
    "texte": "La cible est enfermée dans une charlotte de biscuits : impossible de faire un pas pendant 1 tour.",
    "change": ""
   },
   "declinaison": {
    "id": "patissorcier.charlotte-russe",
    "classe": "patissorcier",
    "emplacement": 14,
    "declinaisonDe": "patissorcier.charlotte",
    "niveau": 175,
    "nom": "Charlotte russe",
    "element": "E",
    "cm": 4,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "case",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "croix",
     "taille": 1,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 17,
      "max": 21,
      "maitre": [
       21,
       26
      ]
     },
     {
      "type": "retire",
      "quoi": "pas",
      "n": 2
     }
    ],
    "texte": "Servie glacée, elle gèle les pieds : chaque ennemi de la croix perd 2 Pas.",
    "change": "La charlotte servie glacée : au lieu d'enfermer une seule cible, elle gèle une croix d'ennemis, qui perdent 2 Pas sans être enfermés, toujours en Eaudace. Une fois par tour, car le retrait touche toute la zone."
   }
  },
  {
   "base": {
    "id": "patissorcier.puits-d-amour",
    "classe": "patissorcier",
    "emplacement": 15,
    "declinaisonDe": null,
    "niveau": 182,
    "nom": "Puits d'amour",
    "element": "E",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "case",
    "parTour": 1,
    "parCible": 1,
    "relance": 2,
    "relanceInitiale": 0,
    "plafondPose": 1,
    "maitre": 5,
    "zone": {
     "forme": "rond",
     "taille": 1,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 16,
      "max": 20,
      "maitre": [
       20,
       25
      ]
     },
     {
      "type": "etat",
      "etat": "ramolli",
      "tours": 1,
      "couches": 1
     },
     {
      "type": "pose",
      "quoi": "nappe",
      "tours": 2,
      "declenche": "debut",
      "zone": {
       "forme": "rond",
       "taille": 1,
       "tailleMin": 0,
       "baisse": false
      },
      "touche": "allies",
      "maitre": 5,
      "effets": [
       {
        "type": "soin",
        "min": 16,
        "max": 20,
        "maitre": [
         20,
         25
        ]
       }
      ]
     }
    ],
    "texte": "Le puits d'amour déborde : la crème colle aux pieds des ennemis, et la flaque qui reste soigne les alliés qui y commencent leur tour.",
    "change": ""
   },
   "declinaison": {
    "id": "patissorcier.coup-de-foudre",
    "classe": "patissorcier",
    "emplacement": 15,
    "declinaisonDe": "patissorcier.puits-d-amour",
    "niveau": 190,
    "nom": "Coup de foudre",
    "element": "C",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 22,
      "max": 26,
      "maitre": [
       27,
       33
      ]
     },
     {
      "type": "retire",
      "quoi": "cm",
      "n": 1
     }
    ],
    "texte": "Un coup de foudre, et on en perd ses moyens : la cible perd 1 coup de main.",
    "change": "L'amour frappe d'un coup : fini la crème et le soin, une seule cible foudroyée qui perd 1 CM, en Éclair."
   }
  },
  {
   "base": {
    "id": "patissorcier.chef-d-oeuvre-croquembouche",
    "classe": "patissorcier",
    "emplacement": 16,
    "declinaisonDe": null,
    "niveau": 200,
    "nom": "Chef-d'œuvre : Croquembouche",
    "element": "C",
    "cm": 7,
    "rayon": {
     "min": 2,
     "max": 6,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "case",
    "parTour": 1,
    "parCible": 0,
    "relance": 5,
    "relanceInitiale": 2,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "rond",
     "taille": 2,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 36,
      "max": 44,
      "maitre": [
       45,
       55
      ]
     },
     {
      "type": "si",
      "condition": "cibleTombe",
      "effets": [
       {
        "type": "gainCM",
        "n": 2,
        "qui": "soi"
       }
      ]
     }
    ],
    "texte": "La tour de choux s'écroule dans une pluie d'étincelles de caramel. Si un ennemi tombe sous la tour, le Pâtissorcier regagne 2 CM, une seule fois par lancer.",
    "change": ""
   },
   "declinaison": {
    "id": "patissorcier.chef-d-oeuvre-le-sucre-file",
    "classe": "patissorcier",
    "emplacement": 16,
    "declinaisonDe": "patissorcier.chef-d-oeuvre-croquembouche",
    "niveau": 200,
    "nom": "Chef-d'œuvre : le Sucre filé",
    "element": "S",
    "cm": 7,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 0,
    "relance": 5,
    "relanceInitiale": 2,
    "plafondPose": 1,
    "maitre": 5,
    "zone": {
     "forme": "terrain",
     "taille": 0,
     "tailleMin": 0,
     "baisse": false
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 22,
      "max": 28,
      "maitre": [
       28,
       35
      ]
     },
     {
      "type": "pose",
      "quoi": "nappe",
      "tours": 1,
      "declenche": "debut",
      "zone": {
       "forme": "terrain",
       "taille": 0,
       "tailleMin": 0,
       "baisse": false
      },
      "touche": "allies",
      "maitre": 0,
      "effets": [
       {
        "type": "bouclier",
        "valeur": 20,
        "tours": 2,
        "couchesMax": 3
       },
       {
        "type": "etat",
        "etat": "nappe",
        "tours": 2,
        "couches": 1
       }
      ]
     }
    ],
    "texte": "Un voile de sucre filé balaie tout le terrain : il cingle chaque ennemi, puis retombe en couche de Glaçage sur les alliés du Pâtissorcier, au début de leur tour.",
    "change": "Le Croquembouche s'abat sur une zone, en Éclair ; le Sucre filé couvre tout le terrain, moins fort par ennemi, en Soufflé, et ses alliés (pas lui) reçoivent une couche de Glaçage au début de leur tour."
   }
  }
 ],
 "bouchevalier": [
  {
   "base": {
    "id": "bouchevalier.tranche-de-vie",
    "classe": "bouchevalier",
    "emplacement": 1,
    "declinaisonDe": null,
    "niveau": 1,
    "nom": "Tranche de vie",
    "element": "T",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 1,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 16,
      "max": 20,
      "maitre": [
       20,
       25
      ]
     },
     {
      "type": "entame",
      "part": 25,
      "tours": 2
     }
    ],
    "texte": "Une tranche nette, au contact. C'est le Tranchant : pendant 2 tours, un quart des dégâts que la cible reçoit ne pourra plus être soigné de tout le combat. Une tranche de vie, au sens propre.",
    "change": ""
   },
   "declinaison": {
    "id": "bouchevalier.coupe-vent",
    "classe": "bouchevalier",
    "emplacement": 1,
    "declinaisonDe": "bouchevalier.tranche-de-vie",
    "niveau": 3,
    "nom": "Coupe-vent",
    "element": "S",
    "cm": 2,
    "rayon": {
     "min": 1,
     "max": 1,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "case",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "travers",
     "taille": 1,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 8,
      "max": 11,
      "maitre": [
       10,
       14
      ]
     },
     {
      "type": "si",
      "condition": "auContact",
      "effets": [
       {
        "type": "entame",
        "part": 25,
        "tours": 2
       }
      ]
     }
    ],
    "texte": "Un grand revers fend l'air devant toi : le vent coupe, la lame aussi.",
    "change": "Au lieu d'une seule tranche, un revers en Soufflé balaie les 3 cases devant toi, pour 2 coups de main. Seul l'ennemi collé à toi est entamé."
   }
  },
  {
   "base": {
    "id": "bouchevalier.croc-de-boucher",
    "classe": "bouchevalier",
    "emplacement": 2,
    "declinaisonDe": null,
    "niveau": 1,
    "nom": "Croc de boucher",
    "element": "S",
    "cm": 2,
    "rayon": {
     "min": 2,
     "max": 3,
     "modifiable": false
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 7,
      "max": 9,
      "maitre": [
       9,
       11
      ]
     },
     {
      "type": "attire",
      "cases": 3
     }
    ],
    "texte": "Le croc accroche l'ennemi à 2 ou 3 cases et le tire jusqu'à toi. Collé à toi, il est pris dans ton Rideau. Un croc ne tient qu'une pièce à la fois : 2 lancers par tour, 1 par cible.",
    "change": ""
   },
   "declinaison": {
    "id": "bouchevalier.lancer-de-hachoir",
    "classe": "bouchevalier",
    "emplacement": 2,
    "declinaisonDe": "bouchevalier.croc-de-boucher",
    "niveau": 5,
    "nom": "Lancer de hachoir",
    "element": "C",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 5,
     "modifiable": true
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 12,
      "max": 15,
      "maitre": [
       15,
       19
      ]
     },
     {
      "type": "rebond",
      "fois": 1,
      "rayon": 2,
      "part": 50
     }
    ],
    "texte": "Le hachoir part tout droit, frappe, puis ricoche sur l'ennemi le plus proche.",
    "change": "Le croc n'attire plus : tu lances le hachoir, plus loin et plus fort, en Éclair. Il ricoche sur un deuxième ennemi à 2 cases ou moins, pour la moitié des dégâts."
   }
  },
  {
   "base": {
    "id": "bouchevalier.tomber-sur-un-os",
    "classe": "bouchevalier",
    "emplacement": 3,
    "declinaisonDe": null,
    "niveau": 1,
    "nom": "Tomber sur un os",
    "element": "N",
    "cm": 2,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 0,
    "relance": 3,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "allies",
    "effets": [
     {
      "type": "bouclier",
      "valeur": 17,
      "tours": 2,
      "couchesMax": 1
     },
     {
      "type": "bonus",
      "carac": "rideau",
      "valeur": 10,
      "tours": 3,
      "qui": "soi"
     }
    ],
    "texte": "Qui vient te chercher tombe sur un os : bouclier de 17 pendant 2 tours, et +10 Rideau pendant 3 tours. Une fois collé à toi, on ne repart plus comme ça : l'os revient quand le Rideau retombe.",
    "change": ""
   },
   "declinaison": {
    "id": "bouchevalier.os-a-ronger",
    "classe": "bouchevalier",
    "emplacement": 3,
    "declinaisonDe": "bouchevalier.tomber-sur-un-os",
    "niveau": 7,
    "nom": "Os à ronger",
    "element": "T",
    "cm": 3,
    "rayon": {
     "min": 2,
     "max": 4,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": false,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 15,
      "max": 19,
      "maitre": [
       19,
       24
      ]
     }
    ],
    "texte": "Un os lancé en cloche, par-dessus les obstacles : de quoi l'occuper un moment.",
    "change": "Tu ne gardes plus l'os pour toi : tu le lances en cloche, sans ligne de vue, sur un ennemi entre 2 et 4 cases, en Terroir."
   }
  },
  {
   "base": {
    "id": "bouchevalier.barbecue",
    "classe": "bouchevalier",
    "emplacement": 4,
    "declinaisonDe": null,
    "niveau": 10,
    "nom": "Barbecue",
    "element": "F",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "case",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 15,
    "zone": {
     "forme": "carre",
     "taille": 1,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "F",
      "min": 9,
      "max": 12,
      "maitre": [
       11,
       15
      ]
     },
     {
      "type": "etat",
      "etat": "brule",
      "tours": 2,
      "couches": 1
     }
    ],
    "texte": "Tu allumes le gril, un carré de 3 cases sur 3 : tout ce qui est dessus grille, et brûle encore 2 tours.",
    "change": ""
   },
   "declinaison": {
    "id": "bouchevalier.barbecue-a-l-eau",
    "classe": "bouchevalier",
    "emplacement": 4,
    "declinaisonDe": "bouchevalier.barbecue",
    "niveau": 18,
    "nom": "Barbecue à l'eau",
    "element": "E",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": true
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 14,
      "max": 17,
      "maitre": [
       18,
       21
      ]
     },
     {
      "type": "etat",
      "etat": "ramolli",
      "tours": 1,
      "couches": 1
     }
    ],
    "texte": "Le barbecue tombe à l'eau : la braise est noyée, et le jet trempe la cible jusqu'aux os.",
    "change": "Le gril en zone devient un jet d'eau en ligne : une seule cible, plus fort, en Eaudace, et elle perd 1 Pas (ramollie)."
   }
  },
  {
   "base": {
    "id": "bouchevalier.saute-mouton",
    "classe": "bouchevalier",
    "emplacement": 5,
    "declinaisonDe": null,
    "niveau": 26,
    "nom": "Saute-mouton",
    "element": "N",
    "cm": 2,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "allie",
    "parTour": 1,
    "parCible": 0,
    "relance": 2,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "allies",
    "effets": [
     {
      "type": "echange"
     },
     {
      "type": "bonus",
      "carac": "conservation",
      "valeur": 15,
      "tours": 2,
      "qui": "soi"
     }
    ],
    "texte": "Au saute-mouton, tu passes par-dessus le copain et tu prends sa place, avec les coups qui allaient avec : +15 % de Conservation pendant 2 tours. C'est d'abord un déplacement : il revient au bout de 2 tours, comme un saut.",
    "change": ""
   },
   "declinaison": {
    "id": "bouchevalier.mouton-statique",
    "classe": "bouchevalier",
    "emplacement": 5,
    "declinaisonDe": "bouchevalier.saute-mouton",
    "niveau": 34,
    "nom": "Mouton statique",
    "element": "C",
    "cm": 2,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 0,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "rond",
     "taille": 1,
     "tailleMin": 1,
     "baisse": false
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 7,
      "max": 10,
      "maitre": [
       9,
       13
      ]
     },
     {
      "type": "rebond",
      "fois": 1,
      "rayon": 2,
      "part": 50
     }
    ],
    "texte": "Le mouton ne saute plus : il reste là, et sa laine chargée pique tous ceux qui le collent. Puis l'étincelle saute sur un voisin.",
    "change": "Plus d'échange : tu restes statique, et ta laine chargée frappe en Éclair les ennemis des 4 cases collées à toi, puis l'étincelle saute sur un autre ennemi à 2 cases, à moitié de sa force. Une fois par tour, car elle touche tous tes voisins."
   }
  },
  {
   "base": {
    "id": "bouchevalier.mise-en-barquette",
    "classe": "bouchevalier",
    "emplacement": 6,
    "declinaisonDe": null,
    "niveau": 41,
    "nom": "Mise en barquette",
    "element": "N",
    "cm": 2,
    "rayon": {
     "min": 1,
     "max": 2,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "allie",
    "parTour": 1,
    "parCible": 1,
    "relance": 2,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "allies",
    "effets": [
     {
      "type": "bouclier",
      "valeur": 25,
      "tours": 2,
      "couchesMax": 1
     },
     {
      "type": "etat",
      "etat": "glissant",
      "tours": 1,
      "couches": 1
     }
    ],
    "texte": "L'allié est mis en barquette, sous film : bouclier de 25. Et le film glisse si bien qu'à son prochain tour, il quitte le contact sans rien perdre.",
    "change": ""
   },
   "declinaison": {
    "id": "bouchevalier.mise-sous-vide",
    "classe": "bouchevalier",
    "emplacement": 6,
    "declinaisonDe": "bouchevalier.mise-en-barquette",
    "niveau": 49,
    "nom": "Mise sous vide",
    "element": "S",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 12,
      "max": 15,
      "maitre": [
       15,
       19
      ]
     },
     {
      "type": "attire",
      "cases": 2
     }
    ],
    "texte": "Tu fais le vide d'un coup : la cible est aspirée de 2 cases vers toi, emballée.",
    "change": "Tu emballes l'ennemi au lieu de l'allié : petits dégâts Soufflé, et le vide l'aspire de 2 cases vers toi."
   }
  },
  {
   "base": {
    "id": "bouchevalier.marinade",
    "classe": "bouchevalier",
    "emplacement": 7,
    "declinaisonDe": null,
    "niveau": 57,
    "nom": "Marinade",
    "element": "E",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 12,
      "max": 16,
      "maitre": [
       15,
       20
      ]
     },
     {
      "type": "etat",
      "etat": "attendri",
      "tours": 2,
      "couches": 1
     },
     {
      "type": "etat",
      "etat": "ramolli",
      "tours": 1,
      "couches": 1
     }
    ],
    "texte": "Dans la marinade, la viande ramollit et s'attendrit. L'ennemi aussi : −1 Pas, et −10 % de Conservation pendant 2 tours.",
    "change": ""
   },
   "declinaison": {
    "id": "bouchevalier.laisser-mariner",
    "classe": "bouchevalier",
    "emplacement": 7,
    "declinaisonDe": "bouchevalier.marinade",
    "niveau": 65,
    "nom": "Laisser mariner",
    "element": "E",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "case",
    "parTour": 1,
    "parCible": 0,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 2,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "pose",
      "quoi": "nappe",
      "tours": 2,
      "declenche": "debut",
      "zone": {
       "forme": "rond",
       "taille": 1,
       "tailleMin": 0,
       "baisse": false
      },
      "touche": "ennemis",
      "maitre": 5,
      "effets": [
       {
        "type": "degats",
        "element": "E",
        "min": 11,
        "max": 13,
        "maitre": [
         14,
         16
        ]
       },
       {
        "type": "etat",
        "etat": "ramolli",
        "tours": 1,
        "couches": 1
       },
       {
        "type": "etat",
        "etat": "attendri",
        "tours": 2,
        "couches": 1
       }
      ]
     }
    ],
    "texte": "Tu verses la marinade au sol, et tu laisses mariner : qui commence son tour dedans y trempe, ramollit et s'attendrit.",
    "change": "La marinade ne vise plus une cible : elle reste au sol 2 tours, sur 5 cases. Chaque ennemi qui commence son tour dedans prend des dégâts Eaudace, perd 1 Pas et s'attendrit. Une flaque par tour, deux au sol au plus, car elle dure."
   }
  },
  {
   "base": {
    "id": "bouchevalier.attendrisseur",
    "classe": "bouchevalier",
    "emplacement": 8,
    "declinaisonDe": null,
    "niveau": 73,
    "nom": "Attendrisseur",
    "element": "F",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 1,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 20,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "F",
      "min": 15,
      "max": 19,
      "maitre": [
       19,
       24
      ]
     },
     {
      "type": "etat",
      "etat": "attendri",
      "tours": 2,
      "couches": 1
     },
     {
      "type": "entame",
      "part": 25,
      "tours": 2
     }
    ],
    "texte": "Le maillet à pointes tombe de tout son poids. La cible est entamée, et attendrie : elle craint davantage les coups. Un seul coup de maillet par tour : il est lourd.",
    "change": ""
   },
   "declinaison": {
    "id": "bouchevalier.attendrissement",
    "classe": "bouchevalier",
    "emplacement": 8,
    "declinaisonDe": "bouchevalier.attendrisseur",
    "niveau": 81,
    "nom": "Attendrissement",
    "element": "N",
    "cm": 3,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 0,
    "relance": 3,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "rond",
     "taille": 2,
     "tailleMin": 1,
     "baisse": false
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "bonus",
      "carac": "degatsPct",
      "valeur": -10,
      "tours": 2,
      "qui": "cible"
     },
     {
      "type": "etat",
      "etat": "attendri",
      "tours": 2,
      "couches": 1
     }
    ],
    "texte": "Les ennemis autour de toi sont tout attendris : ils n'ont plus le cœur à frapper fort, ni à encaisser.",
    "change": "La grosse frappe au contact devient une protection : pendant 2 tours, les ennemis à 2 cases ou moins font 10 % de dégâts en moins, et ils sont attendris (−10 % de Conservation)."
   }
  },
  {
   "base": {
    "id": "bouchevalier.billot",
    "classe": "bouchevalier",
    "emplacement": 9,
    "declinaisonDe": null,
    "niveau": 88,
    "nom": "Billot",
    "element": "N",
    "cm": 2,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 0,
    "relance": 3,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "allies",
    "effets": [
     {
      "type": "bonus",
      "carac": "conservation",
      "valeur": 25,
      "tours": 2,
      "qui": "soi"
     },
     {
      "type": "etat",
      "etat": "plante",
      "tours": 2,
      "couches": 1
     }
    ],
    "texte": "Planté comme un billot : +25 % de Conservation, et rien ne te fait bouger de force pendant 2 tours.",
    "change": ""
   },
   "declinaison": {
    "id": "bouchevalier.sur-le-billot",
    "classe": "bouchevalier",
    "emplacement": 9,
    "declinaisonDe": "bouchevalier.billot",
    "niveau": 96,
    "nom": "Sur le billot",
    "element": "T",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 1,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 20,
      "max": 25,
      "maitre": [
       25,
       31
      ]
     },
     {
      "type": "entame",
      "part": 25,
      "tours": 2
     },
     {
      "type": "bonus",
      "carac": "rideau",
      "valeur": 10,
      "tours": 2,
      "qui": "soi"
     }
    ],
    "texte": "Tu poses l'ennemi sur le billot : il est entamé, et il ne s'en va plus si facilement.",
    "change": "Le billot ne te protège plus, tu y poses l'ennemi : une grosse frappe Terroir au contact, avec le Tranchant, et +10 Rideau pendant 2 tours pour le garder."
   }
  },
  {
   "base": {
    "id": "bouchevalier.coup-de-jarret",
    "classe": "bouchevalier",
    "emplacement": 10,
    "declinaisonDe": null,
    "niveau": 104,
    "nom": "Coup de jarret",
    "element": "T",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 1,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 16,
      "max": 20,
      "maitre": [
       20,
       25
      ]
     },
     {
      "type": "entame",
      "part": 25,
      "tours": 2
     },
     {
      "type": "pousse",
      "cases": 2
     }
    ],
    "texte": "Un coup sec dans le jarret, et l'ennemi recule de 2 cases. S'il heurte un obstacle, il s'écrase.",
    "change": ""
   },
   "declinaison": {
    "id": "bouchevalier.jarretiere",
    "classe": "bouchevalier",
    "emplacement": 10,
    "declinaisonDe": "bouchevalier.coup-de-jarret",
    "niveau": 112,
    "nom": "Jarretière",
    "element": "N",
    "cm": 2,
    "rayon": {
     "min": 2,
     "max": 6,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "allie",
    "parTour": 1,
    "parCible": 0,
    "relance": 2,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "allies",
    "effets": [
     {
      "type": "ramene",
      "cases": 5
     }
    ],
    "texte": "Honni soit qui mal y pense : la jarretière, élastique, ramène un allié en danger jusqu'à toi.",
    "change": "Tu ne repousses plus un ennemi : la jarretière ramène un allié vers toi, de 5 cases au plus, sans dégâts, pour le sauver."
   }
  },
  {
   "base": {
    "id": "bouchevalier.tournedos",
    "classe": "bouchevalier",
    "emplacement": 11,
    "declinaisonDe": null,
    "niveau": 120,
    "nom": "Tournedos",
    "element": "S",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 1,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 17,
      "max": 21,
      "maitre": [
       21,
       26
      ]
     },
     {
      "type": "entame",
      "part": 25,
      "tours": 2
     },
     {
      "type": "dans-le-dos"
     }
    ],
    "texte": "Tu frappes la cible, puis tu passes dans son dos : pour te faire face, elle doit tourner le dos à ses amis. Un vrai tournedos. Une fois par tour seulement, car tu changes de place.",
    "change": ""
   },
   "declinaison": {
    "id": "bouchevalier.tourne-broche",
    "classe": "bouchevalier",
    "emplacement": 11,
    "declinaisonDe": "bouchevalier.tournedos",
    "niveau": 128,
    "nom": "Tourne-broche",
    "element": "F",
    "cm": 4,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 0,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 15,
    "zone": {
     "forme": "carre",
     "taille": 1,
     "tailleMin": 1,
     "baisse": false
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "F",
      "min": 15,
      "max": 19,
      "maitre": [
       19,
       24
      ]
     },
     {
      "type": "etat",
      "etat": "brule",
      "tours": 2,
      "couches": 1
     }
    ],
    "texte": "Tu tournes sur toi-même comme une broche : tout ce qui t'entoure rôtit.",
    "change": "Tu ne passes plus dans le dos : tu tournes sur place et tu brûles en Flambée les ennemis des 8 cases autour de toi, diagonales comprises. Une fois par tour, car il touche tous tes voisins."
   }
  },
  {
   "base": {
    "id": "bouchevalier.cote-de-mailles",
    "classe": "bouchevalier",
    "emplacement": 12,
    "declinaisonDe": null,
    "niveau": 135,
    "nom": "Côte de mailles",
    "element": "N",
    "cm": 3,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 0,
    "relance": 3,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "rond",
     "taille": 1,
     "tailleMin": 0,
     "baisse": false
    },
    "touche": "allies",
    "effets": [
     {
      "type": "bonus",
      "carac": "conservation",
      "valeur": 20,
      "tours": 2,
      "qui": "cible"
     }
    ],
    "texte": "Une côte de mailles pour tout le monde : toi et les alliés collés à toi gagnez +20 % de Conservation pendant 2 tours.",
    "change": ""
   },
   "declinaison": {
    "id": "bouchevalier.maille-a-partir",
    "classe": "bouchevalier",
    "emplacement": 12,
    "declinaisonDe": "bouchevalier.cote-de-mailles",
    "niveau": 143,
    "nom": "Maille à partir",
    "element": "S",
    "cm": 4,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 0,
    "relance": 2,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "rond",
     "taille": 3,
     "tailleMin": 2,
     "baisse": false
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 11,
      "max": 14,
      "maitre": [
       14,
       18
      ]
     },
     {
      "type": "attire",
      "cases": 2
     }
    ],
    "texte": "Tu as maille à partir avec tout le monde : qu'ils viennent donc te chercher.",
    "change": "Au lieu de rendre tes alliés plus solides, tu cherches la bagarre : les ennemis à 2 ou 3 cases prennent des dégâts Soufflé et sont attirés de 2 cases vers toi. Une fois par tour, avec une relance de 2, car il déplace tout le monde."
   }
  },
  {
   "base": {
    "id": "bouchevalier.fusil-a-aiguiser",
    "classe": "bouchevalier",
    "emplacement": 13,
    "declinaisonDe": null,
    "niveau": 151,
    "nom": "Fusil à aiguiser",
    "element": "N",
    "cm": 2,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 0,
    "relance": 3,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "allies",
    "effets": [
     {
      "type": "bonus",
      "carac": "coupDeMaitre",
      "valeur": 20,
      "tours": 2,
      "qui": "soi"
     }
    ],
    "texte": "Quelques passes sur le fusil, et la lame est prête : +20 % de Coup de maître pendant 2 tours. Ton couperet n'en coupe que mieux.",
    "change": ""
   },
   "declinaison": {
    "id": "bouchevalier.fine-lame",
    "classe": "bouchevalier",
    "emplacement": 13,
    "declinaisonDe": "bouchevalier.fusil-a-aiguiser",
    "niveau": 159,
    "nom": "Fine lame",
    "element": "C",
    "cm": 3,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 15,
      "max": 19,
      "maitre": [
       19,
       24
      ]
     },
     {
      "type": "retire",
      "quoi": "cm",
      "n": 1
     }
    ],
    "texte": "Bien aiguisée, la lame file comme l'éclair jusqu'à la cible et lui coupe un coup de main.",
    "change": "Le fusil ne prépare plus les coups : la lame frappe à distance, en Éclair, et la cible perd 1 coup de main."
   }
  },
  {
   "base": {
    "id": "bouchevalier.piece-du-boucher",
    "classe": "bouchevalier",
    "emplacement": 14,
    "declinaisonDe": null,
    "niveau": 167,
    "nom": "Pièce du boucher",
    "element": "T",
    "cm": 5,
    "rayon": {
     "min": 1,
     "max": 2,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "croix",
     "taille": 1,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 23,
      "max": 28,
      "maitre": [
       29,
       35
      ]
     },
     {
      "type": "pousse",
      "cases": 1
     },
     {
      "type": "si",
      "condition": "auContact",
      "effets": [
       {
        "type": "entame",
        "part": 25,
        "tours": 2
       }
      ]
     }
    ],
    "texte": "La grosse pièce s'abat sur la cible et sur les 4 cases autour. Tous reculent d'une case, et ceux qui sont collés à toi sont entamés.",
    "change": ""
   },
   "declinaison": {
    "id": "bouchevalier.piece-de-resistance",
    "classe": "bouchevalier",
    "emplacement": 14,
    "declinaisonDe": "bouchevalier.piece-du-boucher",
    "niveau": 175,
    "nom": "Pièce de résistance",
    "element": "F",
    "cm": 4,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 0,
    "relance": 2,
    "relanceInitiale": 0,
    "plafondPose": 1,
    "maitre": 0,
    "zone": {
     "forme": "rond",
     "taille": 1,
     "tailleMin": 1,
     "baisse": false
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "pose",
      "quoi": "nappe",
      "tours": 2,
      "declenche": "fin",
      "zone": {
       "forme": "rond",
       "taille": 1,
       "tailleMin": 1,
       "baisse": false
      },
      "touche": "ennemis",
      "maitre": 10,
      "effets": [
       {
        "type": "degats",
        "element": "F",
        "min": 14,
        "max": 17,
        "maitre": [
         18,
         21
        ]
       }
      ]
     }
    ],
    "texte": "Tu deviens la pièce de résistance du repas, et tu chauffes comme la résistance d'un four : l'ennemi qui finit son tour collé à toi se brûle.",
    "change": "La grosse pièce ne s'abat plus sur l'ennemi : pendant 2 tours, les 4 cases autour de toi brûlent en Flambée l'ennemi qui y finit son tour, et ton Rideau le retient là. Une seule à la fois, relance de 2 : il n'y a qu'une pièce de résistance."
   }
  },
  {
   "base": {
    "id": "bouchevalier.saignant-ou-a-point",
    "classe": "bouchevalier",
    "emplacement": 15,
    "declinaisonDe": null,
    "niveau": 182,
    "nom": "Saignant ou à point",
    "element": "F",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 20,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "F",
      "min": 22,
      "max": 26,
      "maitre": [
       28,
       33
      ]
     },
     {
      "type": "si",
      "condition": "cibleBlessee",
      "effets": [
       {
        "type": "degats",
        "element": "F",
        "min": 11,
        "max": 13,
        "maitre": [
         14,
         16
        ]
       }
      ]
     }
    ],
    "texte": "Plus la cible est blessée, plus ça cuit : sous la moitié de sa vie (ses Victuailles), elle prend un supplément.",
    "change": ""
   },
   "declinaison": {
    "id": "bouchevalier.cuisson-bleue",
    "classe": "bouchevalier",
    "emplacement": 15,
    "declinaisonDe": "bouchevalier.saignant-ou-a-point",
    "niveau": 190,
    "nom": "Cuisson bleue",
    "element": "E",
    "cm": 4,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 20,
      "max": 24,
      "maitre": [
       25,
       30
      ]
     },
     {
      "type": "retire",
      "quoi": "pas",
      "n": 2
     }
    ],
    "texte": "Une cuisson bleue : à peine saisie. La cible, saisie, perd 2 Pas.",
    "change": "La finition de près devient une ouverture de loin : plus de supplément sur les blessés, mais la cible est saisie, en Eaudace, et perd 2 Pas."
   }
  },
  {
   "base": {
    "id": "bouchevalier.chef-d-oeuvre-l-etal-royal",
    "classe": "bouchevalier",
    "emplacement": 16,
    "declinaisonDe": null,
    "niveau": 200,
    "nom": "Chef-d'œuvre : l'Étal royal",
    "element": "E",
    "cm": 7,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 0,
    "relance": 5,
    "relanceInitiale": 2,
    "plafondPose": 1,
    "maitre": 10,
    "zone": {
     "forme": "rond",
     "taille": 2,
     "tailleMin": 1,
     "baisse": false
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 34,
      "max": 42,
      "maitre": [
       43,
       53
      ]
     },
     {
      "type": "etat",
      "etat": "ramolli",
      "tours": 1,
      "couches": 2
     },
     {
      "type": "pose",
      "quoi": "nappe",
      "tours": 1,
      "declenche": "debut",
      "zone": {
       "forme": "rond",
       "taille": 2,
       "tailleMin": 0,
       "baisse": false
      },
      "touche": "allies",
      "maitre": 0,
      "effets": [
       {
        "type": "bouclier",
        "valeur": 40,
        "tours": 2,
        "couchesMax": 1
       }
      ]
     }
    ],
    "texte": "Tu ouvres la chambre froide : le givre frappe les ennemis à 2 cases ou moins et les ralentit (−2 Pas). Les alliés qui commencent leur tour dans le froid, toi compris, se couvrent de givre : bouclier de 40.",
    "change": ""
   },
   "declinaison": {
    "id": "bouchevalier.chef-d-oeuvre-la-taille-royale",
    "classe": "bouchevalier",
    "emplacement": 16,
    "declinaisonDe": "bouchevalier.chef-d-oeuvre-l-etal-royal",
    "niveau": 200,
    "nom": "Chef-d'œuvre : la Taille royale",
    "element": "C",
    "cm": 7,
    "rayon": {
     "min": 1,
     "max": 1,
     "modifiable": false
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "case",
    "parTour": 1,
    "parCible": 0,
    "relance": 5,
    "relanceInitiale": 2,
    "plafondPose": 0,
    "maitre": 15,
    "zone": {
     "forme": "ligne",
     "taille": 5,
     "tailleMin": 0,
     "baisse": false
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 38,
      "max": 46,
      "maitre": [
       48,
       58
      ]
     },
     {
      "type": "entame",
      "part": 25,
      "tours": 2
     },
     {
      "type": "si",
      "condition": "cibleTombe",
      "effets": [
       {
        "type": "gainCM",
        "n": 1,
        "qui": "soi"
       }
      ]
     }
    ],
    "texte": "La taille royale : la coupe du boucher, et l'ancien impôt du roi. Un seul coup de couperet, rapide comme l'éclair, fend toute la ligne.",
    "change": "Tu ne protèges plus autour de toi : un seul coup, en Éclair, fend une ligne de 6 cases et entame chaque ennemi. Si au moins un ennemi tombe, tu regagnes 1 coup de main."
   }
  }
 ],
 "pateladin": [
  {
   "base": {
    "id": "pateladin.coup-de-saucisson",
    "classe": "pateladin",
    "emplacement": 1,
    "declinaisonDe": null,
    "niveau": 1,
    "nom": "Coup de saucisson",
    "element": "T",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 1,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 17,
      "max": 21,
      "maitre": [
       21,
       26
      ]
     },
     {
      "type": "etat",
      "etat": "fume",
      "tours": 1,
      "couches": 1
     }
    ],
    "texte": "Un coup de saucisson bien fumé : l'ennemi en garde l'odeur et frappe moins fort (Fumé : −15 % de dégâts à son prochain tour). Un seul coup par tour : l'autre main garde la tartine pour soigner.",
    "change": ""
   },
   "declinaison": {
    "id": "pateladin.saucisson-et-lumiere",
    "classe": "pateladin",
    "emplacement": 1,
    "declinaisonDe": "pateladin.coup-de-saucisson",
    "niveau": 3,
    "nom": "Saucisson et lumière",
    "element": "C",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": true
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 16,
      "max": 20,
      "maitre": [
       20,
       25
      ]
     },
     {
      "type": "si",
      "condition": "cibleTombe",
      "effets": [
       {
        "type": "gainCM",
        "n": 1,
        "qui": "soi"
       }
      ]
     }
    ],
    "texte": "Son et lumière : le saucisson ferré lance un éclair. Si la cible tombe, le spectacle continue.",
    "change": "Le coup au contact devient une estocade en ligne jusqu'à 3 cases, en Éclair ; il ne fume plus la cible, mais rend 1 CM si elle tombe. Toujours un seul par tour, comme le Coup de saucisson."
   }
  },
  {
   "base": {
    "id": "pateladin.fumoir",
    "classe": "pateladin",
    "emplacement": 2,
    "declinaisonDe": null,
    "niveau": 1,
    "nom": "Fumoir",
    "element": "N",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "case",
    "parTour": 1,
    "parCible": 0,
    "relance": 2,
    "relanceInitiale": 0,
    "plafondPose": 2,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "allies",
    "effets": [
     {
      "type": "pose",
      "quoi": "nappe",
      "tours": 2,
      "declenche": "debut",
      "zone": {
       "forme": "rond",
       "taille": 1,
       "tailleMin": 0,
       "baisse": false
      },
      "touche": "allies",
      "maitre": 5,
      "effets": [
       {
        "type": "soin",
        "min": 5,
        "max": 7,
        "maitre": [
         6,
         9
        ]
       }
      ]
     },
     {
      "type": "pose",
      "quoi": "nappe",
      "tours": 2,
      "declenche": "debut",
      "zone": {
       "forme": "rond",
       "taille": 1,
       "tailleMin": 0,
       "baisse": false
      },
      "touche": "ennemis",
      "maitre": 0,
      "effets": [
       {
        "type": "etat",
        "etat": "fume",
        "tours": 1,
        "couches": 1
       }
      ]
     }
    ],
    "texte": "Le fumoir s'ouvre : sa fumée soigne les alliés et fait tousser les ennemis qui y commencent leur tour. Une seule fumée à la fois : elle tient 2 tours, le temps que le fumoir se recharge (relance 2, comme un soin).",
    "change": ""
   },
   "declinaison": {
    "id": "pateladin.fumage-a-froid",
    "classe": "pateladin",
    "emplacement": 2,
    "declinaisonDe": "pateladin.fumoir",
    "niveau": 5,
    "nom": "Fumage à froid",
    "element": "S",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": false
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "case",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "cone",
     "taille": 1,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 10,
      "max": 13,
      "maitre": [
       13,
       16
      ]
     },
     {
      "type": "etat",
      "etat": "fume",
      "tours": 1,
      "couches": 1
     }
    ],
    "texte": "Fumer à froid, c'est sans flamme : juste un courant d'air chargé de fumée.",
    "change": "La fumée ne soigne plus et ne reste pas au sol : soufflée en cône jusqu'à 3 cases devant soi, elle fait des dégâts Soufflé et rend Fumés les ennemis touchés."
   }
  },
  {
   "base": {
    "id": "pateladin.rillettes-reconfortantes",
    "classe": "pateladin",
    "emplacement": 3,
    "declinaisonDe": null,
    "niveau": 1,
    "nom": "Rillettes réconfortantes",
    "element": "N",
    "cm": 3,
    "rayon": {
     "min": 0,
     "max": 2,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "allie",
    "parTour": 1,
    "parCible": 1,
    "relance": 2,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "allies",
    "effets": [
     {
      "type": "si",
      "condition": "cibleBlessee",
      "effets": [
       {
        "type": "soin",
        "min": 5,
        "max": 8,
        "maitre": [
         6,
         10
        ]
       }
      ]
     },
     {
      "type": "soin",
      "min": 13,
      "max": 16,
      "maitre": [
       16,
       20
      ]
     }
    ],
    "texte": "Une tartine de rillettes, et ça repart. Plus on est mal en point, plus ça réconforte : un allié sous la moitié de ses Victuailles est soigné davantage.",
    "change": ""
   },
   "declinaison": {
    "id": "pateladin.rillettes-du-mans",
    "classe": "pateladin",
    "emplacement": 3,
    "declinaisonDe": "pateladin.rillettes-reconfortantes",
    "niveau": 7,
    "nom": "Rillettes du Mans",
    "element": "N",
    "cm": 2,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "combattant",
    "parTour": 1,
    "parCible": 0,
    "relance": 2,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "allies",
    "effets": [
     {
      "type": "echange"
     }
    ],
    "texte": "Comme aux 24 Heures du Mans : on passe le relais et le pilote change. Si tu étais dans ta fumée, c'est l'autre qui s'y retrouve.",
    "change": "Le soin devient un échange de places avec un allié ou un ennemi, à 4 cases au plus : on prend la place de l'allié en danger, ou on met l'ennemi dans sa fumée."
   }
  },
  {
   "base": {
    "id": "pateladin.chipolata-ardente",
    "classe": "pateladin",
    "emplacement": 4,
    "declinaisonDe": null,
    "niveau": 10,
    "nom": "Chipolata ardente",
    "element": "F",
    "cm": 2,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 3,
    "parCible": 2,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 20,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "F",
      "min": 11,
      "max": 15,
      "maitre": [
       14,
       19
      ]
     }
    ],
    "texte": "Une chipolata qui sort du gril, encore ardente : elle pique, et une fois sur cinq elle brûle fort.",
    "change": ""
   },
   "declinaison": {
    "id": "pateladin.chipolata-benite",
    "classe": "pateladin",
    "emplacement": 4,
    "declinaisonDe": "pateladin.chipolata-ardente",
    "niveau": 18,
    "nom": "Chipolata bénite",
    "element": "E",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "case",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "croix",
     "taille": 1,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 10,
      "max": 12,
      "maitre": [
       13,
       15
      ]
     },
     {
      "type": "etat",
      "etat": "ramolli",
      "tours": 1,
      "couches": 1
     }
    ],
    "texte": "Un signe de croix à l'eau bénite : les ennemis traînent les pieds.",
    "change": "Le tir sur une cible devient un signe de croix : une zone en croix, en Eaudace, qui ramollit les ennemis touchés (−1 Pas)."
   }
  },
  {
   "base": {
    "id": "pateladin.jambondissement",
    "classe": "pateladin",
    "emplacement": 5,
    "declinaisonDe": null,
    "niveau": 26,
    "nom": "Jambondissement",
    "element": "N",
    "cm": 2,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "caseLibre",
    "parTour": 1,
    "parCible": 0,
    "relance": 2,
    "relanceInitiale": 0,
    "plafondPose": 2,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "allies",
    "effets": [
     {
      "type": "bond"
     },
     {
      "type": "pose",
      "quoi": "nappe",
      "tours": 1,
      "declenche": "debut",
      "zone": {
       "forme": "rond",
       "taille": 1,
       "tailleMin": 0,
       "baisse": false
      },
      "touche": "allies",
      "maitre": 5,
      "effets": [
       {
        "type": "soin",
        "min": 7,
        "max": 9,
        "maitre": [
         9,
         11
        ]
       }
      ]
     },
     {
      "type": "pose",
      "quoi": "nappe",
      "tours": 1,
      "declenche": "debut",
      "zone": {
       "forme": "rond",
       "taille": 1,
       "tailleMin": 0,
       "baisse": false
      },
      "touche": "ennemis",
      "maitre": 0,
      "effets": [
       {
        "type": "etat",
        "etat": "fume",
        "tours": 1,
        "couches": 1
       }
      ]
     }
    ],
    "texte": "Un bond de jambon pour voler au secours : il retombe dans un petit nuage de fumée, qui soigne les alliés autour de lui et fait tousser les ennemis au début de leur tour.",
    "change": ""
   },
   "declinaison": {
    "id": "pateladin.jambon-ricochet",
    "classe": "pateladin",
    "emplacement": 5,
    "declinaisonDe": "pateladin.jambondissement",
    "niveau": 34,
    "nom": "Jambon-ricochet",
    "element": "C",
    "cm": 2,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": false
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 8,
      "max": 10,
      "maitre": [
       10,
       13
      ]
     },
     {
      "type": "rebond",
      "fois": 2,
      "rayon": 2,
      "part": 50
     }
    ],
    "texte": "Le jambon ricoche d'un ennemi à l'autre, vif comme l'éclair.",
    "change": "Le bond devient un tir Éclair en ligne qui rebondit deux fois à moitié de sa force ; 2 par tour seulement, à cause des rebonds."
   }
  },
  {
   "base": {
    "id": "pateladin.terrine",
    "classe": "pateladin",
    "emplacement": 6,
    "declinaisonDe": null,
    "niveau": 41,
    "nom": "Terrine",
    "element": "E",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 12,
      "max": 16,
      "maitre": [
       15,
       20
      ]
     },
     {
      "type": "etat",
      "etat": "enracine",
      "tours": 1,
      "couches": 1
     }
    ],
    "texte": "Cuite au bain-marie et bien tassée : la cible ne bouge plus de sa terrine.",
    "change": ""
   },
   "declinaison": {
    "id": "pateladin.prise-de-terrine",
    "classe": "pateladin",
    "emplacement": 6,
    "declinaisonDe": "pateladin.terrine",
    "niveau": 49,
    "nom": "Prise de terrine",
    "element": "T",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 16,
      "max": 20,
      "maitre": [
       20,
       25
      ]
     }
    ],
    "texte": "Comme une prise de terre : le coup passe sous la terre et ressort sous la cible, même derrière un mur.",
    "change": "On n'enferme plus la cible : le coup, en Terroir et plus fort, passe sous la terre et frappe sans ligne de vue jusqu'à 4 cases."
   }
  },
  {
   "base": {
    "id": "pateladin.pate-en-croute",
    "classe": "pateladin",
    "emplacement": 7,
    "declinaisonDe": null,
    "niveau": 57,
    "nom": "Pâté en croûte",
    "element": "N",
    "cm": 3,
    "rayon": {
     "min": 0,
     "max": 3,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "allie",
    "parTour": 1,
    "parCible": 1,
    "relance": 2,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "allies",
    "effets": [
     {
      "type": "bouclier",
      "valeur": 28,
      "tours": 2,
      "couchesMax": 1
     },
     {
      "type": "etat",
      "etat": "plante",
      "tours": 1,
      "couches": 1
     }
    ],
    "texte": "Une bonne croûte autour du pâté : les coups n'atteignent pas la farce, et rien ne le déplace.",
    "change": ""
   },
   "declinaison": {
    "id": "pateladin.pate-de-campagne",
    "classe": "pateladin",
    "emplacement": 7,
    "declinaisonDe": "pateladin.pate-en-croute",
    "niveau": 65,
    "nom": "Pâté de campagne",
    "element": "T",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "case",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "rond",
     "taille": 1,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 12,
      "max": 15,
      "maitre": [
       15,
       19
      ]
     },
     {
      "type": "pousse",
      "cases": 1
     }
    ],
    "texte": "Le pâté part en campagne : il tombe au sol et les ennemis autour reculent.",
    "change": "Le bouclier sur un allié devient une attaque Terroir en rond, qui repousse d'une case les ennemis touchés."
   }
  },
  {
   "base": {
    "id": "pateladin.farandole-d-andouilles",
    "classe": "pateladin",
    "emplacement": 8,
    "declinaisonDe": null,
    "niveau": 73,
    "nom": "Farandole d'andouilles",
    "element": "S",
    "cm": 3,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "anneau",
     "taille": 2,
     "tailleMin": 0,
     "baisse": false
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 12,
      "max": 15,
      "maitre": [
       15,
       19
      ]
     },
     {
      "type": "attire",
      "cases": 1
     }
    ],
    "texte": "Il fait l'andouille et entraîne tout le monde dans la farandole : la ronde happe les ennemis à 2 cases et les ramène au contact.",
    "change": ""
   },
   "declinaison": {
    "id": "pateladin.andouillette-grillee",
    "classe": "pateladin",
    "emplacement": 8,
    "declinaisonDe": "pateladin.farandole-d-andouilles",
    "niveau": 81,
    "nom": "Andouillette grillée",
    "element": "F",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 2,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 15,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "F",
      "min": 20,
      "max": 25,
      "maitre": [
       25,
       31
      ]
     },
     {
      "type": "etat",
      "etat": "brule",
      "tours": 2,
      "couches": 1
     }
    ],
    "texte": "Une andouillette bien grillée : l'odeur reste, la brûlure aussi.",
    "change": "La farandole autour de soi devient un gros coup Flambée sur une cible à 2 cases au plus, qui la laisse Brûlée 2 tours ; on n'attire plus personne."
   }
  },
  {
   "base": {
    "id": "pateladin.saumure",
    "classe": "pateladin",
    "emplacement": 9,
    "declinaisonDe": null,
    "niveau": 88,
    "nom": "Saumure",
    "element": "E",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 16,
      "max": 20,
      "maitre": [
       20,
       25
      ]
     },
     {
      "type": "retire",
      "quoi": "pas",
      "n": 1
     }
    ],
    "texte": "Un bain de saumure : la cible, bien salée, a les jambes lourdes.",
    "change": ""
   },
   "declinaison": {
    "id": "pateladin.poivre-et-sel",
    "classe": "pateladin",
    "emplacement": 9,
    "declinaisonDe": "pateladin.saumure",
    "niveau": 96,
    "nom": "Poivre et sel",
    "element": "S",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "case",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "rond",
     "taille": 2,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 15,
      "max": 18,
      "maitre": [
       19,
       23
      ]
     }
    ],
    "texte": "Un coup de vent chargé de poivre et de sel : les ennemis éternuent et pleurent.",
    "change": "Le coup salé sur une cible devient un grand rond de 2 cases, en Soufflé, plus cher, qui ne retire plus de Pas."
   }
  },
  {
   "base": {
    "id": "pateladin.fumee-sacree",
    "classe": "pateladin",
    "emplacement": 10,
    "declinaisonDe": null,
    "niveau": 104,
    "nom": "Fumée sacrée",
    "element": "N",
    "cm": 4,
    "rayon": {
     "min": 0,
     "max": 3,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "case",
    "parTour": 1,
    "parCible": 0,
    "relance": 3,
    "relanceInitiale": 0,
    "plafondPose": 2,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "allies",
    "effets": [
     {
      "type": "pose",
      "quoi": "nappe",
      "tours": 3,
      "declenche": "debut",
      "zone": {
       "forme": "rond",
       "taille": 2,
       "tailleMin": 0,
       "baisse": false
      },
      "touche": "allies",
      "maitre": 5,
      "effets": [
       {
        "type": "soin",
        "min": 10,
        "max": 13,
        "maitre": [
         13,
         16
        ]
       }
      ]
     },
     {
      "type": "pose",
      "quoi": "nappe",
      "tours": 3,
      "declenche": "debut",
      "zone": {
       "forme": "rond",
       "taille": 2,
       "tailleMin": 0,
       "baisse": false
      },
      "touche": "ennemis",
      "maitre": 0,
      "effets": [
       {
        "type": "etat",
        "etat": "fume",
        "tours": 1,
        "couches": 1
       }
      ]
     }
    ],
    "texte": "La fumée sacrée monte du fumoir : elle bénit les alliés et fait tousser les impies qui y commencent leur tour. Une seule à la fois : elle tient 3 tours, autant que sa relance.",
    "change": ""
   },
   "declinaison": {
    "id": "pateladin.pas-de-fumee-sans-feu",
    "classe": "pateladin",
    "emplacement": 10,
    "declinaisonDe": "pateladin.fumee-sacree",
    "niveau": 112,
    "nom": "Pas de fumée sans feu",
    "element": "F",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "case",
    "parTour": 1,
    "parCible": 0,
    "relance": 2,
    "relanceInitiale": 0,
    "plafondPose": 2,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "pose",
      "quoi": "nappe",
      "tours": 2,
      "declenche": "debut",
      "zone": {
       "forme": "rond",
       "taille": 1,
       "tailleMin": 0,
       "baisse": false
      },
      "touche": "ennemis",
      "maitre": 10,
      "effets": [
       {
        "type": "degats",
        "element": "F",
        "min": 12,
        "max": 15,
        "maitre": [
         15,
         19
        ]
       }
      ]
     },
     {
      "type": "pose",
      "quoi": "nappe",
      "tours": 2,
      "declenche": "debut",
      "zone": {
       "forme": "rond",
       "taille": 1,
       "tailleMin": 0,
       "baisse": false
      },
      "touche": "allies",
      "maitre": 5,
      "effets": [
       {
        "type": "soin",
        "min": 5,
        "max": 7,
        "maitre": [
         6,
         9
        ]
       }
      ]
     }
    ],
    "texte": "Il n'y a pas de fumée sans feu : celle-ci brûle les ennemis qui y commencent leur tour.",
    "change": "La grande fumée de soutien devient une petite fumée d'attaque de 2 tours, qui brûle les ennemis à chaque début de tour et soigne moins ; une seule à la fois, relance 2, car elle dure 2 tours."
   }
  },
  {
   "base": {
    "id": "pateladin.cervelas",
    "classe": "pateladin",
    "emplacement": 11,
    "declinaisonDe": null,
    "niveau": 120,
    "nom": "Cervelas",
    "element": "C",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 16,
      "max": 20,
      "maitre": [
       20,
       25
      ]
     },
     {
      "type": "retire",
      "quoi": "cm",
      "n": 1
     }
    ],
    "texte": "Un coup de cervelas sur la tête : la cible voit trente-six chandelles et perd un coup de main.",
    "change": ""
   },
   "declinaison": {
    "id": "pateladin.tempete-sous-un-cervelas",
    "classe": "pateladin",
    "emplacement": 11,
    "declinaisonDe": "pateladin.cervelas",
    "niveau": 128,
    "nom": "Tempête sous un cervelas",
    "element": "S",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "case",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "rond",
     "taille": 1,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 16,
      "max": 20,
      "maitre": [
       20,
       25
      ]
     },
     {
      "type": "bonus",
      "carac": "fauxFuyant",
      "valeur": -5,
      "tours": 1,
      "qui": "cible"
     }
    ],
    "texte": "Une tempête sous un cervelas : les ennemis, déboussolés, ne savent plus par où filer (−5 Faux-fuyant à leur prochain tour).",
    "change": "La frappe sur une cible devient une tempête en rond, en Soufflé, plus chère ; au lieu d'un coup de main, les ennemis touchés perdent 5 Faux-fuyant pendant 1 tour : ils ont du mal à quitter le contact."
   }
  },
  {
   "base": {
    "id": "pateladin.faire-le-boudin",
    "classe": "pateladin",
    "emplacement": 12,
    "declinaisonDe": null,
    "niveau": 135,
    "nom": "Faire le boudin",
    "element": "N",
    "cm": 2,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 0,
    "relance": 3,
    "relanceInitiale": 0,
    "plafondPose": 1,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "allies",
    "effets": [
     {
      "type": "bonus",
      "carac": "conservation",
      "valeur": 15,
      "tours": 2,
      "qui": "soi"
     },
     {
      "type": "etat",
      "etat": "enracine",
      "tours": 1,
      "couches": 1
     },
     {
      "type": "pose",
      "quoi": "nappe",
      "tours": 2,
      "declenche": "debut",
      "zone": {
       "forme": "rond",
       "taille": 1,
       "tailleMin": 0,
       "baisse": false
      },
      "touche": "ennemis",
      "maitre": 0,
      "effets": [
       {
        "type": "etat",
        "etat": "fume",
        "tours": 1,
        "couches": 1
       }
      ]
     }
    ],
    "texte": "Il fait le boudin, et il fume dans son coin : il ne bouge plus de ce tour, il encaisse mieux (+15 % de Conservation, 2 tours), et les ennemis collés à lui toussent. Un renfort sur soi : 1 par tour, relance 3.",
    "change": ""
   },
   "declinaison": {
    "id": "pateladin.boudin-puree",
    "classe": "pateladin",
    "emplacement": 12,
    "declinaisonDe": "pateladin.faire-le-boudin",
    "niveau": 143,
    "nom": "Boudin purée",
    "element": "T",
    "cm": 4,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "anneau",
     "taille": 1,
     "tailleMin": 0,
     "baisse": false
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 18,
      "max": 22,
      "maitre": [
       23,
       28
      ]
     },
     {
      "type": "pousse",
      "cases": 1
     }
    ],
    "texte": "Boudin purée : ce qui est coincé contre un mur finit en purée.",
    "change": "La bouderie sur soi devient une attaque Terroir sur les 4 cases autour de soi, qui repousse d'une case : un ennemi coincé contre un obstacle subit l'Écrasement."
   }
  },
  {
   "base": {
    "id": "pateladin.pluie-de-lardons",
    "classe": "pateladin",
    "emplacement": 13,
    "declinaisonDe": null,
    "niveau": 151,
    "nom": "Pluie de lardons",
    "element": "C",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 18,
      "max": 22,
      "maitre": [
       23,
       28
      ]
     },
     {
      "type": "rebond",
      "fois": 2,
      "rayon": 3,
      "part": 50
     }
    ],
    "texte": "Il pleut des lardons : comme la foudre, ils sautent d'un ennemi à l'autre.",
    "change": ""
   },
   "declinaison": {
    "id": "pateladin.poelee-de-lardons",
    "classe": "pateladin",
    "emplacement": 13,
    "declinaisonDe": "pateladin.pluie-de-lardons",
    "niveau": 159,
    "nom": "Poêlée de lardons",
    "element": "F",
    "cm": 4,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 15,
    "zone": {
     "forme": "rond",
     "taille": 2,
     "tailleMin": 1,
     "baisse": false
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "F",
      "min": 16,
      "max": 19,
      "maitre": [
       20,
       24
      ]
     },
     {
      "type": "etat",
      "etat": "fume",
      "tours": 1,
      "couches": 1
     }
    ],
    "texte": "Des lardons fumés sautent dans la poêle : ça grésille tout autour, et la fumée fait tousser les ennemis touchés.",
    "change": "Le tir qui rebondit devient une zone tout autour de soi, en Flambée ; les ennemis touchés sont Fumés 1 tour (−15 % de dégâts)."
   }
  },
  {
   "base": {
    "id": "pateladin.jambonneau",
    "classe": "pateladin",
    "emplacement": 14,
    "declinaisonDe": null,
    "niveau": 167,
    "nom": "Jambonneau",
    "element": "E",
    "cm": 5,
    "rayon": {
     "min": 1,
     "max": 1,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 28,
      "max": 33,
      "maitre": [
       35,
       41
      ]
     },
     {
      "type": "etat",
      "etat": "ramolli",
      "tours": 1,
      "couches": 1
     }
    ],
    "texte": "Le jambonneau sort tout juste du bouillon : il cogne fort, et il ramollit.",
    "change": ""
   },
   "declinaison": {
    "id": "pateladin.jambon-de-pays",
    "classe": "pateladin",
    "emplacement": 14,
    "declinaisonDe": "pateladin.jambonneau",
    "niveau": 175,
    "nom": "Jambon de pays",
    "element": "T",
    "cm": 5,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": false
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 26,
      "max": 31,
      "maitre": [
       33,
       39
      ]
     },
     {
      "type": "pousse",
      "cases": 3
     }
    ],
    "texte": "Jambon de pays : on renvoie la cible au pays, trois cases plus loin.",
    "change": "Le gros coup au contact devient un coup Terroir en ligne jusqu'à 3 cases, un peu moins fort, qui repousse la cible de 3 cases au lieu de la ramollir."
   }
  },
  {
   "base": {
    "id": "pateladin.rosette-des-vents",
    "classe": "pateladin",
    "emplacement": 15,
    "declinaisonDe": null,
    "niveau": 182,
    "nom": "Rosette des vents",
    "element": "S",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "case",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "croix",
     "taille": 2,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 20,
      "max": 24,
      "maitre": [
       25,
       30
      ]
     }
    ],
    "texte": "La rose des vents montre les quatre directions : le vent souffle dans les quatre à la fois.",
    "change": ""
   },
   "declinaison": {
    "id": "pateladin.rosette-arrosee",
    "classe": "pateladin",
    "emplacement": 15,
    "declinaisonDe": "pateladin.rosette-des-vents",
    "niveau": 190,
    "nom": "Rosette arrosée",
    "element": "E",
    "cm": 4,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 22,
      "max": 27,
      "maitre": [
       28,
       34
      ]
     },
     {
      "type": "etat",
      "etat": "ramolli",
      "tours": 1,
      "couches": 2
     }
    ],
    "texte": "Une rosette bien arrosée : la cible a les jambes en coton.",
    "change": "Le vent en croix devient un tir Eaudace sur une seule cible, plus loin et plus fort, qui la ramollit de 2 couches (−2 Pas)."
   }
  },
  {
   "base": {
    "id": "pateladin.chef-d-oeuvre-le-grand-plateau",
    "classe": "pateladin",
    "emplacement": 16,
    "declinaisonDe": null,
    "niveau": 200,
    "nom": "Chef-d'œuvre : le Grand Plateau",
    "element": "F",
    "cm": 7,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 0,
    "relance": 5,
    "relanceInitiale": 2,
    "plafondPose": 2,
    "maitre": 15,
    "zone": {
     "forme": "rond",
     "taille": 3,
     "tailleMin": 1,
     "baisse": false
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "F",
      "min": 30,
      "max": 37,
      "maitre": [
       38,
       46
      ]
     },
     {
      "type": "pose",
      "quoi": "nappe",
      "tours": 2,
      "declenche": "debut",
      "zone": {
       "forme": "rond",
       "taille": 3,
       "tailleMin": 0,
       "baisse": false
      },
      "touche": "allies",
      "maitre": 5,
      "effets": [
       {
        "type": "soin",
        "min": 18,
        "max": 22,
        "maitre": [
         23,
         28
        ]
       }
      ]
     },
     {
      "type": "pose",
      "quoi": "nappe",
      "tours": 2,
      "declenche": "debut",
      "zone": {
       "forme": "rond",
       "taille": 3,
       "tailleMin": 0,
       "baisse": false
      },
      "touche": "ennemis",
      "maitre": 0,
      "effets": [
       {
        "type": "etat",
        "etat": "fume",
        "tours": 1,
        "couches": 1
       }
      ]
     }
    ],
    "texte": "Le Grand Plateau est servi : de quoi reprendre des forces pour les alliés, de la braise et de la fumée pour les autres.",
    "change": ""
   },
   "declinaison": {
    "id": "pateladin.chef-d-oeuvre-le-plateau-d-orages",
    "classe": "pateladin",
    "emplacement": 16,
    "declinaisonDe": "pateladin.chef-d-oeuvre-le-grand-plateau",
    "niveau": 200,
    "nom": "Chef-d'œuvre : le Plateau d'orages",
    "element": "C",
    "cm": 7,
    "rayon": {
     "min": 1,
     "max": 6,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 0,
    "relance": 5,
    "relanceInitiale": 2,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 40,
      "max": 50,
      "maitre": [
       50,
       63
      ]
     },
     {
      "type": "rebond",
      "fois": 3,
      "rayon": 3,
      "part": 50
     }
    ],
    "texte": "L'orage éclate sur le Grand Plateau : la foudre saute d'un ennemi à l'autre.",
    "change": "Le grand service autour de soi devient un orage lancé sur un ennemi jusqu'à 6 cases, en Éclair, plus fort, qui rebondit 3 fois ; il ne soigne plus et ne laisse pas de fumée."
   }
  }
 ],
 "fromagicien": [
  {
   "base": {
    "id": "fromagicien.bleu-d-orage",
    "classe": "fromagicien",
    "emplacement": 1,
    "declinaisonDe": null,
    "niveau": 1,
    "nom": "Bleu d'orage",
    "element": "C",
    "cm": 2,
    "rayon": {
     "min": 2,
     "max": 4,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 3,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 5,
      "max": 7,
      "maitre": [
       6,
       9
      ]
     },
     {
      "type": "rebond",
      "fois": 1,
      "rayon": 2,
      "part": 50
     },
     {
      "type": "etat",
      "etat": "affine",
      "tours": 4,
      "couches": 0
     }
    ],
    "texte": "Les veines du bleu sont des éclairs qui dorment. La foudre saute sur un voisin, et la cible part en affinage. Mais la foudre ne tombe jamais deux fois au même endroit : une seule fois par cible et par tour.",
    "change": ""
   },
   "declinaison": {
    "id": "fromagicien.bleu-marine",
    "classe": "fromagicien",
    "emplacement": 1,
    "declinaisonDe": "fromagicien.bleu-d-orage",
    "niveau": 3,
    "nom": "Bleu marine",
    "element": "E",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": false
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "case",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "ligne",
     "taille": 2,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 6,
      "max": 8,
      "maitre": [
       8,
       10
      ]
     },
     {
      "type": "etat",
      "etat": "ramolli",
      "tours": 1,
      "couches": 1
     },
     {
      "type": "etat",
      "etat": "affine",
      "tours": 4,
      "couches": 0
     }
    ],
    "texte": "Le bleu passe de l'orage à la mer : une vague déferle, mouille les pieds et met tout le monde en cave.",
    "change": "L'éclair sur une cible devient une vague lancée en ligne (1 à 4 cases, 3 CM) qui touche 3 cases, ramollit (−1 Pas) et affine tous ceux qu'elle mouille, en Eaudace, sans rebond."
   }
  },
  {
   "base": {
    "id": "fromagicien.coup-de-meule",
    "classe": "fromagicien",
    "emplacement": 2,
    "declinaisonDe": null,
    "niveau": 1,
    "nom": "Coup de meule",
    "element": "T",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 10,
      "max": 13,
      "maitre": [
       13,
       16
      ]
     },
     {
      "type": "si",
      "condition": "cibleAffinee",
      "n": 1,
      "effets": [
       {
        "type": "degats",
        "element": "T",
        "min": 2,
        "max": 3,
        "maitre": [
         3,
         4
        ]
       }
      ]
     },
     {
      "type": "si",
      "condition": "cibleAffinee",
      "n": 2,
      "effets": [
       {
        "type": "degats",
        "element": "T",
        "min": 2,
        "max": 3,
        "maitre": [
         3,
         4
        ]
       }
      ]
     },
     {
      "type": "si",
      "condition": "cibleAffinee",
      "n": 3,
      "effets": [
       {
        "type": "degats",
        "element": "T",
        "min": 2,
        "max": 3,
        "maitre": [
         3,
         4
        ]
       }
      ]
     },
     {
      "type": "pousse",
      "cases": 1
     }
    ],
    "texte": "Une meule entière roule sur la cible et la fait reculer d'une case. Plus le fromage est fait, plus il pèse : un peu plus fort à chaque tour d'affinage, jusqu'à 3.",
    "change": ""
   },
   "declinaison": {
    "id": "fromagicien.palet-de-chevre",
    "classe": "fromagicien",
    "emplacement": 2,
    "declinaisonDe": "fromagicien.coup-de-meule",
    "niveau": 5,
    "nom": "Palet de chèvre",
    "element": "T",
    "cm": 3,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": false
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 8,
      "max": 10,
      "maitre": [
       10,
       13
      ]
     },
     {
      "type": "pousse",
      "cases": 2
     },
     {
      "type": "si",
      "condition": "cibleAffinee",
      "n": 2,
      "effets": [
       {
        "type": "pousse",
        "cases": 1
       }
      ]
     }
    ],
    "texte": "Un palet de chèvre lancé à plat, comme au jeu de palets : il file et emporte la cible. Bien sec, il va plus loin.",
    "change": "On ne frappe plus de près avec la meule : on lance un palet en ligne, de 2 à 5 cases, moins fort et sans dégâts en plus sur une cible affinée, mais il repousse de 2 cases (3 si la cible est affinée depuis 2 tours)."
   }
  },
  {
   "base": {
    "id": "fromagicien.glissade-a-raclette",
    "classe": "fromagicien",
    "emplacement": 3,
    "declinaisonDe": null,
    "niveau": 1,
    "nom": "Glissade à raclette",
    "element": "N",
    "cm": 2,
    "rayon": {
     "min": 2,
     "max": 4,
     "modifiable": false
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "caseLibre",
    "parTour": 1,
    "parCible": 0,
    "relance": 2,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "allies",
    "effets": [
     {
      "type": "bond"
     }
    ],
    "texte": "Un filet de raclette fondue sous les semelles, et tu files tout droit, de 2 à 4 cases, si la voie est libre.",
    "change": ""
   },
   "declinaison": {
    "id": "fromagicien.coulee-de-raclette",
    "classe": "fromagicien",
    "emplacement": 3,
    "declinaisonDe": "fromagicien.glissade-a-raclette",
    "niveau": 7,
    "nom": "Coulée de raclette",
    "element": "T",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "case",
    "parTour": 2,
    "parCible": 0,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 3,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "pose",
      "quoi": "nappe",
      "tours": 2,
      "declenche": "debut",
      "zone": {
       "forme": "croix",
       "taille": 1,
       "tailleMin": 0,
       "baisse": true
      },
      "touche": "ennemis",
      "maitre": 5,
      "effets": [
       {
        "type": "degats",
        "element": "T",
        "min": 11,
        "max": 13,
        "maitre": [
         14,
         16
        ]
       },
       {
        "type": "si",
        "condition": "cibleAffinee",
        "n": 1,
        "effets": [
         {
          "type": "degats",
          "element": "T",
          "min": 3,
          "max": 4,
          "maitre": [
           4,
           5
          ]
         }
        ]
       }
      ]
     }
    ],
    "texte": "La raclette fondue nappe le sol en croix pendant 2 tours. Qui commence son tour dedans y laisse des plumes, et un peu plus s'il est déjà affiné.",
    "change": "On ne glisse plus soi-même : la raclette coule au sol en croix pendant 2 tours et frappe en Terroir chaque ennemi qui commence son tour dedans, un peu plus fort s'il est affiné."
   }
  },
  {
   "base": {
    "id": "fromagicien.fondue",
    "classe": "fromagicien",
    "emplacement": 4,
    "declinaisonDe": null,
    "niveau": 10,
    "nom": "Fondue",
    "element": "F",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 15,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "F",
      "min": 15,
      "max": 19,
      "maitre": [
       19,
       24
      ]
     },
     {
      "type": "etat",
      "etat": "brule",
      "tours": 2,
      "couches": 1
     },
     {
      "type": "si",
      "condition": "cibleAffinee",
      "n": 2,
      "effets": [
       {
        "type": "etat",
        "etat": "brule",
        "tours": 2,
        "couches": 2
       }
      ]
     }
    ],
    "texte": "On trempe la cible dans le caquelon : elle en ressort brûlante. Affinée depuis 2 tours, elle brûle deux fois plus (2 couches de Brûlé).",
    "change": ""
   },
   "declinaison": {
    "id": "fromagicien.souffle-au-fromage",
    "classe": "fromagicien",
    "emplacement": 4,
    "declinaisonDe": "fromagicien.fondue",
    "niveau": 18,
    "nom": "Soufflé au fromage",
    "element": "S",
    "cm": 3,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": false,
    "cible": "case",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "rond",
     "taille": 2,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 10,
      "max": 13,
      "maitre": [
       13,
       16
      ]
     }
    ],
    "texte": "Il monte, monte, passe par-dessus les obstacles, puis retombe sur tout le monde.",
    "change": "Le coup brûlant sur une cible devient une grande zone ronde de 13 cases, lancée sans ligne de vue et sans brûlure, en Soufflé."
   }
  },
  {
   "base": {
    "id": "fromagicien.petit-lait",
    "classe": "fromagicien",
    "emplacement": 5,
    "declinaisonDe": null,
    "niveau": 26,
    "nom": "Petit-lait",
    "element": "N",
    "cm": 2,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 1,
    "relance": 2,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "allies",
    "effets": [
     {
      "type": "bouclier",
      "valeur": 24,
      "tours": 2,
      "couchesMax": 1
     },
     {
      "type": "bonus",
      "carac": "fauxFuyant",
      "valeur": 10,
      "tours": 1,
      "qui": "soi"
     }
    ],
    "texte": "Ça passe comme du petit-lait : les coups glissent dessus, et toi tu glisses hors du contact (+10 Faux-fuyant ce tour).",
    "change": ""
   },
   "declinaison": {
    "id": "fromagicien.soupe-au-lait",
    "classe": "fromagicien",
    "emplacement": 5,
    "declinaisonDe": "fromagicien.petit-lait",
    "niveau": 34,
    "nom": "Soupe au lait",
    "element": "F",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 25,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "F",
      "min": 15,
      "max": 19,
      "maitre": [
       19,
       24
      ]
     }
    ],
    "texte": "Le lait monte d'un coup et déborde. Comme les gens soupe au lait, il s'emporte souvent : 25 % de coups de maître.",
    "change": "On ne se protège plus, on s'emporte : une frappe Flambée de 1 à 4 cases, avec le plus haut taux de coup de maître (25 %)."
   }
  },
  {
   "base": {
    "id": "fromagicien.affinage",
    "classe": "fromagicien",
    "emplacement": 6,
    "declinaisonDe": null,
    "niveau": 41,
    "nom": "Affinage",
    "element": "N",
    "cm": 2,
    "rayon": {
     "min": 1,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "case",
    "parTour": 1,
    "parCible": 0,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "rond",
     "taille": 1,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "etat",
      "etat": "affine",
      "tours": 4,
      "couches": 1
     }
    ],
    "texte": "Toute la tablée descend en cave, avec un tour d'affinage d'avance. Sur un ennemi déjà affiné, le compte continue et la marque repart pour 4 tours. Une tablée par tour : la cave n'a qu'une porte.",
    "change": ""
   },
   "declinaison": {
    "id": "fromagicien.coup-de-frais",
    "classe": "fromagicien",
    "emplacement": 6,
    "declinaisonDe": "fromagicien.affinage",
    "niveau": 49,
    "nom": "Coup de frais",
    "element": "E",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 5,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 13,
      "max": 16,
      "maitre": [
       16,
       20
      ]
     },
     {
      "type": "etat",
      "etat": "ramolli",
      "tours": 1,
      "couches": 1
     },
     {
      "type": "etat",
      "etat": "affine",
      "tours": 4,
      "couches": 0
     }
    ],
    "texte": "Un coup de frais, comme en chambre froide : la cible, engourdie par le froid, perd 1 Pas, et elle se garde plus longtemps en cave.",
    "change": "Au lieu de mettre une tablée en cave, on garde une seule cible au frais : dégâts d'Eaudace, Ramollie (−1 Pas), et sa marque d'affinage dure de nouveau 4 tours."
   }
  },
  {
   "base": {
    "id": "fromagicien.croute-fleurie",
    "classe": "fromagicien",
    "emplacement": 7,
    "declinaisonDe": null,
    "niveau": 57,
    "nom": "Croûte fleurie",
    "element": "N",
    "cm": 2,
    "rayon": {
     "min": 0,
     "max": 4,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "allie",
    "parTour": 1,
    "parCible": 1,
    "relance": 2,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "allies",
    "effets": [
     {
      "type": "bouclier",
      "valeur": 30,
      "tours": 2,
      "couchesMax": 1
     },
     {
      "type": "etat",
      "etat": "affine",
      "tours": 4,
      "couches": 0
     },
     {
      "type": "si",
      "condition": "cibleAffinee",
      "n": 2,
      "effets": [
       {
        "type": "bonus",
        "carac": "conservation",
        "valeur": 10,
        "tours": 2,
        "qui": "cible"
       }
      ]
     }
    ],
    "texte": "Une croûte qui encaisse à la place d'un allié et le met en cave. Elle fleurit à l'humidité : sur un allié affiné depuis 2 tours, elle durcit (+10 % de Conservation).",
    "change": ""
   },
   "declinaison": {
    "id": "fromagicien.croute-cendree",
    "classe": "fromagicien",
    "emplacement": 7,
    "declinaisonDe": "fromagicien.croute-fleurie",
    "niveau": 65,
    "nom": "Croûte cendrée",
    "element": "F",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "F",
      "min": 8,
      "max": 10,
      "maitre": [
       10,
       13
      ]
     },
     {
      "type": "etat",
      "etat": "brule",
      "tours": 3,
      "couches": 1
     },
     {
      "type": "si",
      "condition": "cibleAffinee",
      "n": 1,
      "effets": [
       {
        "type": "etat",
        "etat": "brule",
        "tours": 3,
        "couches": 2
       }
      ]
     },
     {
      "type": "si",
      "condition": "cibleAffinee",
      "n": 3,
      "effets": [
       {
        "type": "etat",
        "etat": "brule",
        "tours": 3,
        "couches": 3
       }
      ]
     },
     {
      "type": "etat",
      "etat": "affine",
      "tours": 4,
      "couches": 0
     }
    ],
    "texte": "La croûte est roulée dans la cendre chaude : elle couve et brûle 3 tours. Plus la cible est affinée, plus la braise prend : 2 couches à 1 tour d'affinage, 3 couches à 3 tours.",
    "change": "La croûte ne protège plus un allié : couverte de cendre, elle brûle un ennemi 3 tours et le met en cave ; la brûlure passe à 2 couches quand il est affiné depuis 1 tour, à 3 couches depuis 3 tours."
   }
  },
  {
   "base": {
    "id": "fromagicien.trou-d-emmental",
    "classe": "fromagicien",
    "emplacement": 8,
    "declinaisonDe": null,
    "niveau": 73,
    "nom": "Trou d'emmental",
    "element": "S",
    "cm": 3,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": false
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 14,
      "max": 17,
      "maitre": [
       18,
       21
      ]
     },
     {
      "type": "attire",
      "cases": 2
     }
    ],
    "texte": "Le trou de l'emmental aspire tout ce qui passe : la cible est tirée de 2 cases vers toi.",
    "change": ""
   },
   "declinaison": {
    "id": "fromagicien.trou-de-memoire",
    "classe": "fromagicien",
    "emplacement": 8,
    "declinaisonDe": "fromagicien.trou-d-emmental",
    "niveau": 81,
    "nom": "Trou de mémoire",
    "element": "C",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 12,
      "max": 15,
      "maitre": [
       15,
       19
      ]
     },
     {
      "type": "retire",
      "quoi": "cm",
      "n": 1
     },
     {
      "type": "si",
      "condition": "cibleAffinee",
      "n": 3,
      "effets": [
       {
        "type": "retire",
        "quoi": "cm",
        "n": 1
       }
      ]
     }
    ],
    "texte": "Un éclair traverse la tête de la cible et y laisse un trou : elle oublie un coup de main, deux si elle est affinée depuis 3 tours.",
    "change": "Le trou ne déplace plus la cible, il lui vide la tête : en Éclair, sans tir en ligne, un peu moins fort, elle perd 1 coup de main (2 si elle est affinée depuis 3 tours)."
   }
  },
  {
   "base": {
    "id": "fromagicien.lait-caille",
    "classe": "fromagicien",
    "emplacement": 9,
    "declinaisonDe": null,
    "niveau": 88,
    "nom": "Lait caillé",
    "element": "E",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 14,
      "max": 17,
      "maitre": [
       18,
       21
      ]
     },
     {
      "type": "retire",
      "quoi": "pas",
      "n": 1
     },
     {
      "type": "si",
      "condition": "cibleAffinee",
      "n": 2,
      "effets": [
       {
        "type": "retire",
        "quoi": "pas",
        "n": 1
       }
      ]
     }
    ],
    "texte": "Le lait caille et fige les jambes : −1 Pas, et −2 quand la cible est affinée depuis 2 tours.",
    "change": ""
   },
   "declinaison": {
    "id": "fromagicien.ca-caille",
    "classe": "fromagicien",
    "emplacement": 9,
    "declinaisonDe": "fromagicien.lait-caille",
    "niveau": 96,
    "nom": "Ça caille",
    "element": "E",
    "cm": 3,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 0,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "rond",
     "taille": 1,
     "tailleMin": 1,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 13,
      "max": 16,
      "maitre": [
       16,
       20
      ]
     },
     {
      "type": "retire",
      "quoi": "pas",
      "n": 2
     }
    ],
    "texte": "Ça caille ! Une fois par tour, un froid de cave tombe autour de toi : ceux qui te collent perdent 2 Pas.",
    "change": "Le froid ne vise plus une cible au loin : il tombe sur les 4 cases autour de toi et retire 2 Pas d'un coup aux ennemis au contact, sans besoin d'affinage. Une fois par tour seulement, car il frappe tous ceux qui te collent."
   }
  },
  {
   "base": {
    "id": "fromagicien.roquefort",
    "classe": "fromagicien",
    "emplacement": 10,
    "declinaisonDe": null,
    "niveau": 104,
    "nom": "Roquefort",
    "element": "T",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 15,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 21,
      "max": 25,
      "maitre": [
       26,
       31
      ]
     },
     {
      "type": "pousse",
      "cases": 2
     },
     {
      "type": "si",
      "condition": "cibleAffinee",
      "n": 2,
      "effets": [
       {
        "type": "degats",
        "element": "T",
        "min": 5,
        "max": 6,
        "maitre": [
         6,
         8
        ]
       }
      ]
     }
    ],
    "texte": "C'est du fort, et ça repousse : rien que l'odeur fait reculer la cible de 2 cases. Sur une cible affinée depuis 2 tours, il cogne plus fort.",
    "change": ""
   },
   "declinaison": {
    "id": "fromagicien.fort-en-gueule",
    "classe": "fromagicien",
    "emplacement": 10,
    "declinaisonDe": "fromagicien.roquefort",
    "niveau": 112,
    "nom": "Fort en gueule",
    "element": "S",
    "cm": 4,
    "rayon": {
     "min": 2,
     "max": 7,
     "modifiable": true
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "case",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "ligne",
     "taille": 3,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 17,
      "max": 21,
      "maitre": [
       21,
       26
      ]
     }
    ],
    "texte": "Toujours du fort, mais en paroles : ton haleine de roquefort porte loin et traverse toute la file.",
    "change": "Le gros coup de près qui repousse devient une haleine en ligne, de 2 à 7 cases, qui touche 4 cases à la file, sans poussée, en Soufflé."
   }
  },
  {
   "base": {
    "id": "fromagicien.odeur-persistante",
    "classe": "fromagicien",
    "emplacement": 11,
    "declinaisonDe": null,
    "niveau": 120,
    "nom": "Odeur persistante",
    "element": "S",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 5,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "case",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 1,
    "maitre": 5,
    "zone": {
     "forme": "rond",
     "taille": 2,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 10,
      "max": 13,
      "maitre": [
       13,
       16
      ]
     },
     {
      "type": "pose",
      "quoi": "nappe",
      "tours": 2,
      "declenche": "debut",
      "zone": {
       "forme": "rond",
       "taille": 2,
       "tailleMin": 0,
       "baisse": true
      },
      "touche": "ennemis",
      "maitre": 0,
      "effets": [
       {
        "type": "retire",
        "quoi": "cm",
        "n": 1
       }
      ]
     }
    ],
    "texte": "L'odeur s'étale en grand et reste 2 tours : qui commence son tour dedans en perd un coup de main. Une seule odeur à la fois, elle suffit.",
    "change": ""
   },
   "declinaison": {
    "id": "fromagicien.air-charge",
    "classe": "fromagicien",
    "emplacement": 11,
    "declinaisonDe": "fromagicien.odeur-persistante",
    "niveau": 128,
    "nom": "Air chargé",
    "element": "C",
    "cm": 3,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 16,
      "max": 19,
      "maitre": [
       20,
       24
      ]
     },
     {
      "type": "rebond",
      "fois": 2,
      "rayon": 2,
      "part": 50
     }
    ],
    "texte": "L'odeur charge l'air et attire la foudre, qui saute d'ennemi en ennemi.",
    "change": "L'odeur ne reste plus au sol : l'air chargé attire la foudre sur une seule cible, plus fort, et elle rebondit 2 fois sur des ennemis proches, en Éclair."
   }
  },
  {
   "base": {
    "id": "fromagicien.comte-a-rebours",
    "classe": "fromagicien",
    "emplacement": 12,
    "declinaisonDe": null,
    "niveau": 135,
    "nom": "Comté à rebours",
    "element": "C",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 5,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 3,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 15,
      "max": 18,
      "maitre": [
       19,
       23
      ]
     },
     {
      "type": "si",
      "condition": "cibleAffinee",
      "n": 3,
      "effets": [
       {
        "type": "degats",
        "element": "C",
        "min": 28,
        "max": 34,
        "maitre": [
         35,
         43
        ]
       },
       {
        "type": "rebond",
        "fois": 1,
        "rayon": 2,
        "part": 50
       }
      ]
     },
     {
      "type": "etat",
      "etat": "affine",
      "tours": 4,
      "couches": 0
     }
    ],
    "texte": "Le compte à rebours commence : la cible part en cave. Quand elle est affinée depuis 3 tours, le comté est prêt : la foudre tombe, puis rebondit. Un comté tous les 3 tours : c'est le temps du compte à rebours.",
    "change": ""
   },
   "declinaison": {
    "id": "fromagicien.comte-gouttes",
    "classe": "fromagicien",
    "emplacement": 12,
    "declinaisonDe": "fromagicien.comte-a-rebours",
    "niveau": 143,
    "nom": "Comté-gouttes",
    "element": "E",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 17,
      "max": 20,
      "maitre": [
       21,
       25
      ]
     },
     {
      "type": "etat",
      "etat": "ramolli",
      "tours": 1,
      "couches": 1
     },
     {
      "type": "si",
      "condition": "cibleAffinee",
      "n": 1,
      "effets": [
       {
        "type": "degats",
        "element": "E",
        "min": 4,
        "max": 5,
        "maitre": [
         5,
         6
        ]
       }
      ]
     },
     {
      "type": "si",
      "condition": "cibleAffinee",
      "n": 2,
      "effets": [
       {
        "type": "degats",
        "element": "E",
        "min": 4,
        "max": 5,
        "maitre": [
         5,
         6
        ]
       }
      ]
     },
     {
      "type": "si",
      "condition": "cibleAffinee",
      "n": 3,
      "effets": [
       {
        "type": "degats",
        "element": "E",
        "min": 4,
        "max": 5,
        "maitre": [
         5,
         6
        ]
       }
      ]
     },
     {
      "type": "etat",
      "etat": "affine",
      "tours": 4,
      "couches": 0
     }
    ],
    "texte": "Goutte à goutte : chaque goutte ramollit la cible, et les gouttes grossissent à chaque tour d'affinage.",
    "change": "Plus d'attente jusqu'au 3e tour d'affinage, ni de relance : les gouttes tombent à chaque tour, ramollissent (−1 Pas) et grossissent un peu à chaque tour d'affinage, en Eaudace, mais sans grosse explosion ni rebond."
   }
  },
  {
   "base": {
    "id": "fromagicien.meule-roulante",
    "classe": "fromagicien",
    "emplacement": 13,
    "declinaisonDe": null,
    "niveau": 151,
    "nom": "Meule roulante",
    "element": "T",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 1,
     "modifiable": false
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "case",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "ligne",
     "taille": 4,
     "tailleMin": 0,
     "baisse": false
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 17,
      "max": 21,
      "maitre": [
       21,
       26
      ]
     },
     {
      "type": "pousse",
      "cases": 1
     }
    ],
    "texte": "La meule part de tes pieds et roule tout droit sur 5 cases, sans ralentir, en bousculant chacun d'une case.",
    "change": ""
   },
   "declinaison": {
    "id": "fromagicien.meule-a-etincelles",
    "classe": "fromagicien",
    "emplacement": 13,
    "declinaisonDe": "fromagicien.meule-roulante",
    "niveau": 159,
    "nom": "Meule à étincelles",
    "element": "C",
    "cm": 4,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "case",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "croix",
     "taille": 1,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 17,
      "max": 20,
      "maitre": [
       21,
       25
      ]
     },
     {
      "type": "rebond",
      "fois": 1,
      "rayon": 3,
      "part": 50
     }
    ],
    "texte": "La meule tourne sur place, au loin, comme une meule à aiguiser, et crache des étincelles qui sautent sur les voisins.",
    "change": "La meule ne roule plus en ligne à partir de toi : elle tourne au loin, frappe une croix, et ses étincelles rebondissent sur un ennemi proche, en Éclair, sans poussée."
   }
  },
  {
   "base": {
    "id": "fromagicien.cave-d-affinage",
    "classe": "fromagicien",
    "emplacement": 14,
    "declinaisonDe": null,
    "niveau": 167,
    "nom": "Cave d'affinage",
    "element": "N",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "caseLibre",
    "parTour": 1,
    "parCible": 0,
    "relance": 4,
    "relanceInitiale": 1,
    "plafondPose": 1,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "pose",
      "quoi": "ustensile",
      "nom": "Cave",
      "victuailles": 120,
      "tours": 3,
      "zone": {
       "forme": "rond",
       "taille": 2,
       "tailleMin": 0,
       "baisse": true
      },
      "touche": "ennemis",
      "maitre": 0,
      "effets": [
       {
        "type": "etat",
        "etat": "affine",
        "tours": 4,
        "couches": 1
       },
       {
        "type": "etat",
        "etat": "ramolli",
        "tours": 1,
        "couches": 1
       }
      ]
     }
    ],
    "texte": "Une cave sort de terre et bloque le passage et la vue. Au début de chacun de tes tours, les ennemis à 2 cases autour sont affinés et ramollis. Une seule cave à la fois : on ne la creuse pas dès le premier tour, puis il faut 4 tours pour en creuser une autre.",
    "change": ""
   },
   "declinaison": {
    "id": "fromagicien.mise-en-cave",
    "classe": "fromagicien",
    "emplacement": 14,
    "declinaisonDe": "fromagicien.cave-d-affinage",
    "niveau": 175,
    "nom": "Mise en cave",
    "element": "N",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 3,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "etat",
      "etat": "enracine",
      "tours": 1,
      "couches": 1
     },
     {
      "type": "retire",
      "quoi": "cm",
      "n": 2
     },
     {
      "type": "etat",
      "etat": "affine",
      "tours": 4,
      "couches": 2
     }
    ],
    "texte": "On enferme un ennemi en cave : il ne marche plus, perd 2 coups de main et mûrit vite. Il faut du temps pour rouvrir la cave.",
    "change": "La cave ne se pose plus au sol : on y met un seul ennemi, Enraciné 1 tour, −2 coups de main, et affiné avec 2 tours d'avance."
   }
  },
  {
   "base": {
    "id": "fromagicien.mont-d-or-brulant",
    "classe": "fromagicien",
    "emplacement": 15,
    "declinaisonDe": null,
    "niveau": 182,
    "nom": "Mont-d'or brûlant",
    "element": "F",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 20,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "F",
      "min": 22,
      "max": 26,
      "maitre": [
       28,
       33
      ]
     },
     {
      "type": "etat",
      "etat": "brule",
      "tours": 2,
      "couches": 1
     },
     {
      "type": "si",
      "condition": "cibleAffinee",
      "n": 3,
      "effets": [
       {
        "type": "degats",
        "element": "F",
        "min": 11,
        "max": 13,
        "maitre": [
         14,
         16
        ]
       }
      ]
     }
    ],
    "texte": "Le mont-d'or se cuit dans sa boîte et se mange brûlant. Sur une cible affinée depuis 3 tours, il est à point : moitié plus de dégâts.",
    "change": ""
   },
   "declinaison": {
    "id": "fromagicien.vacherie",
    "classe": "fromagicien",
    "emplacement": 15,
    "declinaisonDe": "fromagicien.mont-d-or-brulant",
    "niveau": 190,
    "nom": "Vacherie",
    "element": "S",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "case",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "croix",
     "taille": 2,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 18,
      "max": 22,
      "maitre": [
       23,
       28
      ]
     },
     {
      "type": "etat",
      "etat": "affine",
      "tours": 4,
      "couches": 1
     }
    ],
    "texte": "Le vacherin, l'autre nom du mont-d'or, fait une vacherie : on ouvre la boîte, l'odeur se répand, et tout le monde passe en cave.",
    "change": "Le coup de grâce sur une cible affinée devient une grande croix sans condition, en Soufflé, qui affine tous les ennemis touchés avec un tour d'avance."
   }
  },
  {
   "base": {
    "id": "fromagicien.chef-d-oeuvre-le-grand-cru",
    "classe": "fromagicien",
    "emplacement": 16,
    "declinaisonDe": null,
    "niveau": 200,
    "nom": "Chef-d'œuvre : le Grand Cru",
    "element": "T",
    "cm": 7,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 0,
    "relance": 5,
    "relanceInitiale": 2,
    "plafondPose": 0,
    "maitre": 15,
    "zone": {
     "forme": "terrain",
     "taille": 0,
     "tailleMin": 0,
     "baisse": false
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 26,
      "max": 32,
      "maitre": [
       33,
       40
      ]
     },
     {
      "type": "si",
      "condition": "cibleAffinee",
      "n": 1,
      "effets": [
       {
        "type": "degats",
        "element": "T",
        "min": 8,
        "max": 10,
        "maitre": [
         10,
         13
        ]
       }
      ]
     },
     {
      "type": "si",
      "condition": "cibleAffinee",
      "n": 3,
      "effets": [
       {
        "type": "degats",
        "element": "T",
        "min": 8,
        "max": 10,
        "maitre": [
         10,
         13
        ]
       }
      ]
     },
     {
      "type": "si",
      "condition": "cibleAffinee",
      "n": 5,
      "effets": [
       {
        "type": "degats",
        "element": "T",
        "min": 8,
        "max": 10,
        "maitre": [
         10,
         13
        ]
       }
      ]
     }
    ],
    "texte": "Toute la cave est servie d'un coup, sur tout le terrain. Plus un ennemi a vieilli, plus il prend : à 1, 3 et 5 tours d'affinage (pour 5, il faut relancer sa marque en route).",
    "change": ""
   },
   "declinaison": {
    "id": "fromagicien.chef-d-oeuvre-la-grande-crue",
    "classe": "fromagicien",
    "emplacement": 16,
    "declinaisonDe": "fromagicien.chef-d-oeuvre-le-grand-cru",
    "niveau": 200,
    "nom": "Chef-d'œuvre : la Grande Crue",
    "element": "E",
    "cm": 7,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 0,
    "relance": 5,
    "relanceInitiale": 2,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "terrain",
     "taille": 0,
     "tailleMin": 0,
     "baisse": false
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 25,
      "max": 30,
      "maitre": [
       31,
       38
      ]
     },
     {
      "type": "etat",
      "etat": "ramolli",
      "tours": 3,
      "couches": 1
     },
     {
      "type": "si",
      "condition": "cibleAffinee",
      "n": 2,
      "effets": [
       {
        "type": "etat",
        "etat": "ramolli",
        "tours": 3,
        "couches": 1
       }
      ]
     },
     {
      "type": "si",
      "condition": "cibleAffinee",
      "n": 4,
      "effets": [
       {
        "type": "etat",
        "etat": "enracine",
        "tours": 1,
        "couches": 1
       }
      ]
     }
    ],
    "texte": "La crue monte dans toute la cave : tout le monde a les pieds dans l'eau, et les plus affinés s'y enfoncent.",
    "change": "Le Grand Cru fait payer l'affinage en dégâts ; la Grande Crue frappe un peu moins, en Eaudace, et noie le terrain : Ramolli 3 tours, une couche de plus à 2 tours d'affinage, et Enraciné à 4 tours d'affinage."
   }
  }
 ],
 "merlanceur": [
  {
   "base": {
    "id": "merlanceur.harpon",
    "classe": "merlanceur",
    "emplacement": 1,
    "declinaisonDe": null,
    "niveau": 1,
    "nom": "Harpon",
    "element": "E",
    "cm": 3,
    "rayon": {
     "min": 3,
     "max": 7,
     "modifiable": true
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 13,
      "max": 16,
      "maitre": [
       16,
       20
      ]
     },
     {
      "type": "si",
      "condition": "mareeBasse",
      "effets": [
       {
        "type": "etat",
        "etat": "ramolli",
        "tours": 2,
        "couches": 1
       }
      ]
     }
    ],
    "texte": "Le harpon file droit et loin. À marée basse, la cible s'échoue sur le sable : elle est Ramollie (−1 Pas) pendant 2 tours.",
    "change": ""
   },
   "declinaison": {
    "id": "merlanceur.harpon-terre-a-terre",
    "classe": "merlanceur",
    "emplacement": 1,
    "declinaisonDe": "merlanceur.harpon",
    "niveau": 3,
    "nom": "Harpon terre-à-terre",
    "element": "T",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 1,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 12,
      "max": 15,
      "maitre": [
       15,
       19
      ]
     },
     {
      "type": "pousse",
      "cases": 1
     },
     {
      "type": "si",
      "condition": "mareeHaute",
      "effets": [
       {
        "type": "pousse",
        "cases": 1
       }
      ]
     }
    ],
    "texte": "Pas de lancer, les pieds sur terre : un coup de manche, et l'ennemi recule d'une case. À marée haute, la vague l'emporte d'une case de plus.",
    "change": "Le harpon ne se lance plus : il frappe au contact, en Terroir, et repousse l'ennemi d'une case (2 à marée haute)."
   }
  },
  {
   "base": {
    "id": "merlanceur.eclat-d-ecaille",
    "classe": "merlanceur",
    "emplacement": 2,
    "declinaisonDe": null,
    "niveau": 1,
    "nom": "Éclat d'écaille",
    "element": "S",
    "cm": 2,
    "rayon": {
     "min": 1,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 3,
    "parCible": 2,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 6,
      "max": 8,
      "maitre": [
       8,
       10
      ]
     },
     {
      "type": "bonus",
      "carac": "fauxFuyant",
      "valeur": 7,
      "tours": 1,
      "qui": "soi"
     }
    ],
    "texte": "Une écaille lancée d'une pichenette, même à bout portant. Et toi, tu glisses comme un poisson : +7 Faux-fuyant jusqu'à la fin du tour.",
    "change": ""
   },
   "declinaison": {
    "id": "merlanceur.eclair-d-ecaille",
    "classe": "merlanceur",
    "emplacement": 2,
    "declinaisonDe": "merlanceur.eclat-d-ecaille",
    "niveau": 5,
    "nom": "Éclair d'écaille",
    "element": "C",
    "cm": 2,
    "rayon": {
     "min": 2,
     "max": 7,
     "modifiable": true
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "ennemi",
    "parTour": 3,
    "parCible": 2,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 7,
      "max": 9,
      "maitre": [
       9,
       11
      ]
     },
     {
      "type": "rebond",
      "fois": 1,
      "rayon": 2,
      "part": 50
     }
    ],
    "texte": "Un reflet d'écaille file tout droit, puis saute sur l'ennemi le plus proche (à 2 cases au plus), à moitié des dégâts.",
    "change": "Plus de glissade : le reflet part en ligne, plus loin, en Éclair, et rebondit sur un second ennemi à moitié des dégâts."
   }
  },
  {
   "base": {
    "id": "merlanceur.saut-de-carpe",
    "classe": "merlanceur",
    "emplacement": 3,
    "declinaisonDe": null,
    "niveau": 1,
    "nom": "Saut de carpe",
    "element": "N",
    "cm": 2,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": false
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "caseLibre",
    "parTour": 1,
    "parCible": 0,
    "relance": 2,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "allies",
    "effets": [
     {
      "type": "bond"
     },
     {
      "type": "si",
      "condition": "mareeBasse",
      "effets": [
       {
        "type": "bonus",
        "carac": "pas",
        "valeur": 1,
        "tours": 1,
        "qui": "soi"
       }
      ]
     }
    ],
    "texte": "La carpe bondit hors de l'eau, tout droit, jusqu'à 3 cases. À marée basse, elle retombe sur le sable et frétille : +1 Pas pour ce tour.",
    "change": ""
   },
   "declinaison": {
    "id": "merlanceur.saute-de-carpe",
    "classe": "merlanceur",
    "emplacement": 3,
    "declinaisonDe": "merlanceur.saut-de-carpe",
    "niveau": 7,
    "nom": "Sauté de carpe",
    "element": "F",
    "cm": 2,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 3,
    "parCible": 2,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 15,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "F",
      "min": 9,
      "max": 12,
      "maitre": [
       11,
       15
      ]
     },
     {
      "type": "si",
      "condition": "mareeBasse",
      "effets": [
       {
        "type": "etat",
        "etat": "brule",
        "tours": 2,
        "couches": 1
       }
      ]
     }
    ],
    "texte": "La carpe saute à la poêle et sort brûlante. À marée basse, la poêle est à sec : ça attache, la cible est Brûlée 2 tours.",
    "change": "Plus de saut : une petite attaque Flambée de près, pas chère, qui fait Brûlé à marée basse."
   }
  },
  {
   "base": {
    "id": "merlanceur.coup-de-filet",
    "classe": "merlanceur",
    "emplacement": 4,
    "declinaisonDe": null,
    "niveau": 10,
    "nom": "Coup de filet",
    "element": "S",
    "cm": 3,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "case",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "rond",
     "taille": 1,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 10,
      "max": 13,
      "maitre": [
       13,
       16
      ]
     },
     {
      "type": "attire",
      "cases": 1
     }
    ],
    "texte": "Un grand coup de filet sur le quai : chaque ennemi pris dedans est tiré d'une case vers toi.",
    "change": ""
   },
   "declinaison": {
    "id": "merlanceur.filet-d-eau",
    "classe": "merlanceur",
    "emplacement": 4,
    "declinaisonDe": "merlanceur.coup-de-filet",
    "niveau": 18,
    "nom": "Filet d'eau",
    "element": "E",
    "cm": 3,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 12,
      "max": 15,
      "maitre": [
       15,
       19
      ]
     },
     {
      "type": "retire",
      "quoi": "pas",
      "n": 2
     }
    ],
    "texte": "Un filet d'eau glacée dans le cou : la cible perd 2 Pas à son prochain tour.",
    "change": "Le filet ne ramasse plus tout un groupe : il vise un seul ennemi, en Eaudace, qui perd 2 Pas à son prochain tour."
   }
  },
  {
   "base": {
    "id": "merlanceur.maree-montante",
    "classe": "merlanceur",
    "emplacement": 5,
    "declinaisonDe": null,
    "niveau": 26,
    "nom": "Marée montante",
    "element": "N",
    "cm": 2,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 0,
    "relance": 3,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "allies",
    "effets": [
     {
      "type": "etat",
      "etat": "maree-haute",
      "tours": 0,
      "couches": 1
     },
     {
      "type": "bonus",
      "carac": "rayon",
      "valeur": 1,
      "tours": 1,
      "qui": "allies"
     }
    ],
    "texte": "La mer monte d'un coup : ta marée passe à haute tout de suite, puis reprend son rythme. Toute l'équipe gagne +1 Rayon : toi pour ce tour, tes alliés jusqu'à la fin de leur prochain tour.",
    "change": ""
   },
   "declinaison": {
    "id": "merlanceur.mascaret",
    "classe": "merlanceur",
    "emplacement": 5,
    "declinaisonDe": "merlanceur.maree-montante",
    "niveau": 34,
    "nom": "Mascaret",
    "element": "E",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": true
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "case",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "ligne",
     "taille": 2,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 10,
      "max": 13,
      "maitre": [
       13,
       16
      ]
     },
     {
      "type": "etat",
      "etat": "ramolli",
      "tours": 1,
      "couches": 1
     },
     {
      "type": "si",
      "condition": "mareeBasse",
      "effets": [
       {
        "type": "bonus",
        "carac": "rayon",
        "valeur": 2,
        "tours": 1,
        "qui": "soi"
       }
      ]
     }
    ],
    "texte": "La vague du mascaret remonte la ligne et noie les pieds : les ennemis touchés sont Ramollis. À marée basse, elle ramène la mer : +2 Rayon jusqu'à la fin du tour.",
    "change": "Plus de bonus d'équipe : une vague d'Eaudace sur 3 cases en ligne qui ralentit, et te rend la portée de la marée haute quand la mer est basse."
   }
  },
  {
   "base": {
    "id": "merlanceur.anguille-electrique",
    "classe": "merlanceur",
    "emplacement": 6,
    "declinaisonDe": null,
    "niveau": 41,
    "nom": "Anguille électrique",
    "element": "C",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 6,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 14,
      "max": 18,
      "maitre": [
       18,
       23
      ]
     },
     {
      "type": "rebond",
      "fois": 1,
      "rayon": 2,
      "part": 50
     }
    ],
    "texte": "L'anguille frappe, puis file vers l'ennemi le plus proche (à 2 cases au plus) et le secoue à son tour, à moitié des dégâts.",
    "change": ""
   },
   "declinaison": {
    "id": "merlanceur.anguille-sous-roche",
    "classe": "merlanceur",
    "emplacement": 6,
    "declinaisonDe": "merlanceur.anguille-electrique",
    "niveau": 49,
    "nom": "Anguille sous roche",
    "element": "T",
    "cm": 3,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 14,
      "max": 18,
      "maitre": [
       18,
       23
      ]
     }
    ],
    "texte": "Il y a anguille sous roche : elle passe sous les obstacles et surgit sous la cible.",
    "change": "Plus de rebond : l'anguille passe sous terre, en Terroir, et touche une cible hors de vue, mais sans bonus de Rayon."
   }
  },
  {
   "base": {
    "id": "merlanceur.bouillabaisse",
    "classe": "merlanceur",
    "emplacement": 7,
    "declinaisonDe": null,
    "niveau": 57,
    "nom": "Bouillabaisse",
    "element": "F",
    "cm": 4,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "case",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 2,
    "maitre": 15,
    "zone": {
     "forme": "rond",
     "taille": 1,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "F",
      "min": 13,
      "max": 16,
      "maitre": [
       16,
       20
      ]
     },
     {
      "type": "pose",
      "quoi": "nappe",
      "tours": 2,
      "declenche": "debut",
      "zone": {
       "forme": "rond",
       "taille": 1,
       "tailleMin": 0,
       "baisse": false
      },
      "touche": "ennemis",
      "maitre": 5,
      "effets": [
       {
        "type": "degats",
        "element": "F",
        "min": 7,
        "max": 9,
        "maitre": [
         9,
         11
        ]
       }
      ]
     }
    ],
    "texte": "La soupe du port déborde sur le quai : pendant 2 tours, le bouillon brûle l'ennemi qui commence son tour dedans.",
    "change": ""
   },
   "declinaison": {
    "id": "merlanceur.fumet-de-poisson",
    "classe": "merlanceur",
    "emplacement": 7,
    "declinaisonDe": "merlanceur.bouillabaisse",
    "niveau": 65,
    "nom": "Fumet de poisson",
    "element": "S",
    "cm": 4,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 0,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "rond",
     "taille": 2,
     "tailleMin": 1,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 13,
      "max": 16,
      "maitre": [
       16,
       20
      ]
     },
     {
      "type": "bonus",
      "carac": "fauxFuyant",
      "valeur": 10,
      "tours": 1,
      "qui": "soi"
     }
    ],
    "texte": "Le fumet monte d'un coup tout autour de toi : personne n'y échappe à 2 cases à la ronde. Pendant qu'ils se bouchent le nez, tu files : +10 Faux-fuyant jusqu'à la fin du tour.",
    "change": "Plus de soupe lancée au loin qui reste au sol : l'odeur part de toi, frappe tout de suite une zone bien plus large, en Soufflé, puis t'aide à sortir du contact."
   }
  },
  {
   "base": {
    "id": "merlanceur.raie-pulsion",
    "classe": "merlanceur",
    "emplacement": 8,
    "declinaisonDe": null,
    "niveau": 73,
    "nom": "Raie-pulsion",
    "element": "T",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 12,
      "max": 15,
      "maitre": [
       15,
       19
      ]
     },
     {
      "type": "pousse",
      "cases": 3
     }
    ],
    "texte": "La raie claque des ailes : répulsion garantie, la cible recule de 3 cases.",
    "change": ""
   },
   "declinaison": {
    "id": "merlanceur.raie-au-beurre-noir",
    "classe": "merlanceur",
    "emplacement": 8,
    "declinaisonDe": "merlanceur.raie-pulsion",
    "niveau": 81,
    "nom": "Raie au beurre noir",
    "element": "F",
    "cm": 3,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 25,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "F",
      "min": 15,
      "max": 19,
      "maitre": [
       19,
       24
      ]
     }
    ],
    "texte": "Une raie au beurre noir, servie bien chaude : un coup sec qui tombe souvent en coup de maître (taux 25 %). La cible repart avec un œil au beurre noir.",
    "change": "Plus de poussée : un coup de Flambée à distance, plus fort, qui fait souvent un coup de maître (25 % au lieu de 10 %)."
   }
  },
  {
   "base": {
    "id": "merlanceur.hamecon",
    "classe": "merlanceur",
    "emplacement": 9,
    "declinaisonDe": null,
    "niveau": 88,
    "nom": "Hameçon",
    "element": "S",
    "cm": 3,
    "rayon": {
     "min": 2,
     "max": 6,
     "modifiable": true
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 13,
      "max": 16,
      "maitre": [
       16,
       20
      ]
     },
     {
      "type": "attire",
      "cases": 3
     }
    ],
    "texte": "L'hameçon se plante et la ligne se tend : la cible est ferrée et tirée de 3 cases vers toi.",
    "change": ""
   },
   "declinaison": {
    "id": "merlanceur.hameconnage",
    "classe": "merlanceur",
    "emplacement": 9,
    "declinaisonDe": "merlanceur.hamecon",
    "niveau": 96,
    "nom": "Hameçonnage",
    "element": "C",
    "cm": 3,
    "rayon": {
     "min": 2,
     "max": 6,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 10,
      "max": 13,
      "maitre": [
       13,
       16
      ]
     },
     {
      "type": "retire",
      "quoi": "cm",
      "n": 1
     },
     {
      "type": "gainCM",
      "n": 1,
      "qui": "soi"
     }
    ],
    "texte": "Un bel appât, et la cible mord : elle perd 1 coup de main à son prochain tour, et c'est toi qui le gagnes. Une seule arnaque par tour.",
    "change": "La ligne ne tire plus la cible : c'est une arnaque en Éclair, qui lui vole 1 coup de main pour te le donner."
   }
  },
  {
   "base": {
    "id": "merlanceur.thon-nerre",
    "classe": "merlanceur",
    "emplacement": 10,
    "declinaisonDe": null,
    "niveau": 104,
    "nom": "Thon-nerre",
    "element": "C",
    "cm": 4,
    "rayon": {
     "min": 2,
     "max": 6,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 23,
      "max": 28,
      "maitre": [
       29,
       35
      ]
     },
     {
      "type": "si",
      "condition": "cibleTombe",
      "effets": [
       {
        "type": "gainCM",
        "n": 1,
        "qui": "soi"
       }
      ]
     }
    ],
    "texte": "Un thon tombe du ciel dans un coup de tonnerre. Si la cible tombe, l'éclair te rend 1 coup de main.",
    "change": ""
   },
   "declinaison": {
    "id": "merlanceur.thon-nerre-de-brest",
    "classe": "merlanceur",
    "emplacement": 10,
    "declinaisonDe": "merlanceur.thon-nerre",
    "niveau": 112,
    "nom": "Thon-nerre de Brest",
    "element": "C",
    "cm": 4,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "case",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "croix",
     "taille": 2,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 15,
      "max": 19,
      "maitre": [
       19,
       24
      ]
     },
     {
      "type": "si",
      "condition": "cibleTombe",
      "effets": [
       {
        "type": "gainCM",
        "n": 1,
        "qui": "soi"
       }
      ]
     }
    ],
    "texte": "Le juron du vieux marin tonne sur tout le quai : la foudre tombe en croix. Si un ennemi tombe, l'éclair te rend 1 coup de main (une fois par lancer).",
    "change": "Le gros coup sur une seule cible devient un juron de marin qui tonne en croix : moins fort par ennemi, mais plusieurs ennemis touchés. Il rend toujours 1 coup de main si un ennemi tombe."
   }
  },
  {
   "base": {
    "id": "merlanceur.banc-de-sardines",
    "classe": "merlanceur",
    "emplacement": 11,
    "declinaisonDe": null,
    "niveau": 120,
    "nom": "Banc de sardines",
    "element": "E",
    "cm": 2,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "caseLibre",
    "parTour": 2,
    "parCible": 0,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 3,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "pose",
      "quoi": "ustensile",
      "tours": 3,
      "victuailles": 100,
      "zone": {
       "forme": "rond",
       "taille": 1,
       "tailleMin": 1,
       "baisse": false
      },
      "touche": "ennemis",
      "maitre": 5,
      "effets": [
       {
        "type": "degats",
        "element": "E",
        "min": 7,
        "max": 9,
        "maitre": [
         9,
         11
        ]
       },
       {
        "type": "etat",
        "etat": "ramolli",
        "tours": 1,
        "couches": 1
       }
      ]
     }
    ],
    "texte": "Serrées comme des sardines : le banc bouche le passage et cache la vue pendant 3 tours. Il a 100 Victuailles : l'ennemi peut le casser. Au début de ton tour, il éclabousse les ennemis collés à lui, qui sont Ramollis (−1 Pas). Trois bancs font un mur.",
    "change": ""
   },
   "declinaison": {
    "id": "merlanceur.sardinade",
    "classe": "merlanceur",
    "emplacement": 11,
    "declinaisonDe": "merlanceur.banc-de-sardines",
    "niveau": 128,
    "nom": "Sardinade",
    "element": "F",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "case",
    "parTour": 1,
    "parCible": 0,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 2,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "pose",
      "quoi": "nappe",
      "tours": 2,
      "declenche": "entree",
      "zone": {
       "forme": "ligne",
       "taille": 2,
       "tailleMin": 0,
       "baisse": false
      },
      "touche": "ennemis",
      "maitre": 10,
      "effets": [
       {
        "type": "degats",
        "element": "F",
        "min": 15,
        "max": 19,
        "maitre": [
         19,
         24
        ]
       }
      ]
     }
    ],
    "texte": "Un gril sur 3 cases en ligne, pendant 2 tours. Chaque ennemi qui y entre, en marchant ou poussé, grille une fois par tour. Un seul gril par tour : il couvre déjà 3 cases.",
    "change": "Au lieu de boucher le passage, on le rend brûlant : on peut passer sur le gril, mais ça coûte cher en Flambée."
   }
  },
  {
   "base": {
    "id": "merlanceur.bain-de-mer",
    "classe": "merlanceur",
    "emplacement": 12,
    "declinaisonDe": null,
    "niveau": 135,
    "nom": "Bain de mer",
    "element": "N",
    "cm": 2,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 0,
    "relance": 3,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "rond",
     "taille": 2,
     "tailleMin": 0,
     "baisse": false
    },
    "touche": "allies",
    "effets": [
     {
      "type": "etat",
      "etat": "glissant",
      "tours": 1,
      "couches": 1
     },
     {
      "type": "bonus",
      "carac": "pas",
      "valeur": 1,
      "tours": 1,
      "qui": "cible"
     }
    ],
    "texte": "Un bain de mer pour toute l'équipe. Toi et tes alliés à 2 cases, vous devenez Glissants et gagnez 1 Pas : personne ne vous retient.",
    "change": ""
   },
   "declinaison": {
    "id": "merlanceur.bain-marie",
    "classe": "merlanceur",
    "emplacement": 12,
    "declinaisonDe": "merlanceur.bain-de-mer",
    "niveau": 143,
    "nom": "Bain-marie",
    "element": "F",
    "cm": 3,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 15,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "F",
      "min": 16,
      "max": 20,
      "maitre": [
       20,
       25
      ]
     },
     {
      "type": "etat",
      "etat": "brule",
      "tours": 2,
      "couches": 1
     }
    ],
    "texte": "La cuisson douce : la cible chauffe tout doucement, et reste Brûlée 2 tours.",
    "change": "Plus de bain pour les alliés : la cuisson douce passe sur un ennemi, un coup de Flambée puis Brûlé pendant 2 tours."
   }
  },
  {
   "base": {
    "id": "merlanceur.maree-basse",
    "classe": "merlanceur",
    "emplacement": 13,
    "declinaisonDe": null,
    "niveau": 151,
    "nom": "Marée basse",
    "element": "N",
    "cm": 2,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 0,
    "relance": 3,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "allies",
    "effets": [
     {
      "type": "etat",
      "etat": "maree-basse",
      "tours": 0,
      "couches": 1
     },
     {
      "type": "bonus",
      "carac": "degatsPct",
      "valeur": 10,
      "tours": 1,
      "qui": "allies"
     }
    ],
    "texte": "La mer se retire d'un coup : ta marée passe à basse tout de suite, puis reprend son rythme. Toute l'équipe fait +10 % de dégâts : toi pour ce tour, tes alliés jusqu'à la fin de leur prochain tour.",
    "change": ""
   },
   "declinaison": {
    "id": "merlanceur.basse-tension",
    "classe": "merlanceur",
    "emplacement": 13,
    "declinaisonDe": "merlanceur.maree-basse",
    "niveau": 159,
    "nom": "Basse tension",
    "element": "C",
    "cm": 4,
    "rayon": {
     "min": 2,
     "max": 6,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 24,
      "max": 29,
      "maitre": [
       30,
       36
      ]
     },
     {
      "type": "si",
      "condition": "mareeHaute",
      "effets": [
       {
        "type": "bonus",
        "carac": "degatsPct",
        "valeur": 20,
        "tours": 1,
        "qui": "soi"
       }
      ]
     }
    ],
    "texte": "L'orage gronde, la tension baisse avec la mer. À marée haute, tu prends d'avance la force de la marée basse : +20 % de dégâts pour tes sorts suivants, jusqu'à la fin du tour.",
    "change": "Plus de changement de marée ni de bonus d'équipe : une frappe Éclair à distance qui, à marée haute, t'ajoute les +20 % de la marée basse."
   }
  },
  {
   "base": {
    "id": "merlanceur.requin-marteau",
    "classe": "merlanceur",
    "emplacement": 14,
    "declinaisonDe": null,
    "niveau": 167,
    "nom": "Requin-marteau",
    "element": "T",
    "cm": 5,
    "rayon": {
     "min": 1,
     "max": 2,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 15,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 31,
      "max": 37,
      "maitre": [
       39,
       46
      ]
     },
     {
      "type": "pousse",
      "cases": 1
     }
    ],
    "texte": "Un coup de tête de requin-marteau : la cible recule d'une case, et si un obstacle l'arrête, elle s'écrase.",
    "change": ""
   },
   "declinaison": {
    "id": "merlanceur.requin-scie",
    "classe": "merlanceur",
    "emplacement": 14,
    "declinaisonDe": "merlanceur.requin-marteau",
    "niveau": 175,
    "nom": "Requin-scie",
    "element": "S",
    "cm": 5,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": true
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "case",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "travers",
     "taille": 2,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 24,
      "max": 30,
      "maitre": [
       30,
       38
      ]
     }
    ],
    "texte": "Le requin-scie balaie de côté avec son nez en dents de scie : 5 cases en travers, tranchées d'un coup.",
    "change": "Le marteau frappe une seule cible de près ; la scie balaie 5 cases en travers, en Soufflé, sans repousser."
   }
  },
  {
   "base": {
    "id": "merlanceur.raz-de-maree",
    "classe": "merlanceur",
    "emplacement": 15,
    "declinaisonDe": null,
    "niveau": 182,
    "nom": "Raz-de-marée",
    "element": "E",
    "cm": 5,
    "rayon": {
     "min": 1,
     "max": 2,
     "modifiable": true
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "case",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "ligne",
     "taille": 4,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 24,
      "max": 29,
      "maitre": [
       30,
       36
      ]
     },
     {
      "type": "etat",
      "etat": "ramolli",
      "tours": 1,
      "couches": 1
     }
    ],
    "texte": "Une vague immense balaie 5 cases en ligne : les ennemis noyés sont Ramollis.",
    "change": ""
   },
   "declinaison": {
    "id": "merlanceur.lame-de-fond",
    "classe": "merlanceur",
    "emplacement": 15,
    "declinaisonDe": "merlanceur.raz-de-maree",
    "niveau": 190,
    "nom": "Lame de fond",
    "element": "T",
    "cm": 5,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 15,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 27,
      "max": 33,
      "maitre": [
       34,
       41
      ]
     },
     {
      "type": "pousse",
      "cases": 2
     }
    ],
    "texte": "La vague remonte du fond, chargée de sable et de galets, et jette la cible 2 cases plus loin.",
    "change": "Plus de vague sur toute une ligne qui ralentit : un seul gros coup de Terroir sur une cible, repoussée de 2 cases."
   }
  },
  {
   "base": {
    "id": "merlanceur.chef-d-oeuvre-la-peche-miraculeuse",
    "classe": "merlanceur",
    "emplacement": 16,
    "declinaisonDe": null,
    "niveau": 200,
    "nom": "Chef-d'œuvre : la Pêche miraculeuse",
    "element": "S",
    "cm": 7,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 0,
    "relance": 5,
    "relanceInitiale": 2,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "terrain",
     "taille": 0,
     "tailleMin": 0,
     "baisse": false
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 30,
      "max": 37,
      "maitre": [
       38,
       46
      ]
     },
     {
      "type": "attire",
      "cases": 3
     },
     {
      "type": "si",
      "condition": "mareeHaute",
      "effets": [
       {
        "type": "attire",
        "cases": 2
       }
      ]
     }
    ],
    "texte": "Le filet couvre tout le terrain : chaque ennemi est pris et tiré de 3 cases vers toi, de 5 à marée haute. Reste à servir la ligne.",
    "change": ""
   },
   "declinaison": {
    "id": "merlanceur.chef-d-oeuvre-la-criee",
    "classe": "merlanceur",
    "emplacement": 16,
    "declinaisonDe": "merlanceur.chef-d-oeuvre-la-peche-miraculeuse",
    "niveau": 200,
    "nom": "Chef-d'œuvre : la Criée",
    "element": "T",
    "cm": 7,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 0,
    "relance": 5,
    "relanceInitiale": 2,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "terrain",
     "taille": 0,
     "tailleMin": 0,
     "baisse": false
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 29,
      "max": 36,
      "maitre": [
       36,
       45
      ]
     },
     {
      "type": "pousse",
      "cases": 2
     }
    ],
    "texte": "Adjugé, vendu ! Le marteau du commissaire-priseur s'abat et tout le port recule de 2 cases. Qui heurte un obstacle s'écrase.",
    "change": "L'inverse de la Pêche miraculeuse : au lieu de tout ramener vers toi, tu renvoies chaque ennemi 2 cases plus loin, en Terroir."
   }
  }
 ],
 "traitreur": [
  {
   "base": {
    "id": "traitreur.pique-olive",
    "classe": "traitreur",
    "emplacement": 1,
    "declinaisonDe": null,
    "niveau": 1,
    "nom": "Pique-olive",
    "element": "C",
    "cm": 2,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 3,
    "parCible": 2,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 12,
      "max": 15,
      "maitre": [
       15,
       19
      ]
     },
     {
      "type": "si",
      "condition": "dansLeDos",
      "effets": [
       {
        "type": "degats",
        "element": "C",
        "min": 7,
        "max": 9,
        "maitre": [
         9,
         11
        ]
       }
      ]
     }
    ],
    "texte": "La pique à cocktail de ta mèche, olive comprise, plantée d'un coup sec, de près (3 cases au plus). Dans le dos, elle pique bien plus fort : 7 à 9 dégâts de plus.",
    "change": ""
   },
   "declinaison": {
    "id": "traitreur.pique-feu",
    "classe": "traitreur",
    "emplacement": 1,
    "declinaisonDe": "traitreur.pique-olive",
    "niveau": 3,
    "nom": "Pique-feu",
    "element": "F",
    "cm": 2,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": true
    },
    "lancer": "ligne",
    "vue": false,
    "cible": "ennemi",
    "parTour": 3,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 15,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "F",
      "min": 7,
      "max": 9,
      "maitre": [
       9,
       11
      ]
     },
     {
      "type": "etat",
      "etat": "brule",
      "tours": 2,
      "couches": 1
     }
    ],
    "texte": "La pique passe dans les braises, puis part en cloche, droit devant : elle retombe en ligne jusqu'à 5 cases, même derrière un décor (pas besoin de voir la cible). Elle pique moins fort, mais la cible reste Brûlée 2 tours. La braise ne prend qu'une fois par cible et par tour : on pique un ennemi, puis le suivant.",
    "change": "La pique ne se plante plus de près : rougie au feu, elle se lance en cloche, en ligne jusqu'à 5 cases et sans ligne de vue, en Flambée, et Brûle. Elle frappe moins fort, sans bonus dans le dos, et une seule fois par cible et par tour : c'est le sort qui répartit le feu, pas celui qui achève."
   }
  },
  {
   "base": {
    "id": "traitreur.amuse-bouche",
    "classe": "traitreur",
    "emplacement": 2,
    "declinaisonDe": null,
    "niveau": 1,
    "nom": "Amuse-bouche",
    "element": "T",
    "cm": 2,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "caseLibre",
    "parTour": 2,
    "parCible": 0,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 3,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "pose",
      "quoi": "piege",
      "tours": 0,
      "zone": {
       "forme": "case",
       "taille": 0,
       "tailleMin": 0,
       "baisse": true
      },
      "touche": "ennemis",
      "maitre": 10,
      "effets": [
       {
        "type": "degats",
        "element": "T",
        "min": 11,
        "max": 14,
        "maitre": [
         14,
         18
        ]
       }
      ]
     },
     {
      "type": "si",
      "condition": "buffetComplet",
      "effets": [
       {
        "type": "gainCM",
        "n": 1,
        "qui": "soi"
       }
      ]
     }
    ],
    "texte": "Un amuse-bouche posé là, l'air de rien, caché à l'ennemi. Qui marche dessus se fait croquer. Trois pièges au sol, c'est un buffet complet : il te rend 1 coup de main.",
    "change": ""
   },
   "declinaison": {
    "id": "traitreur.amuse-galerie",
    "classe": "traitreur",
    "emplacement": 2,
    "declinaisonDe": "traitreur.amuse-bouche",
    "niveau": 5,
    "nom": "Amuse-galerie",
    "element": "S",
    "cm": 2,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "caseLibre",
    "parTour": 2,
    "parCible": 0,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 3,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "pose",
      "quoi": "piege",
      "tours": 0,
      "zone": {
       "forme": "case",
       "taille": 0,
       "tailleMin": 0,
       "baisse": true
      },
      "touche": "ennemis",
      "maitre": 10,
      "effets": [
       {
        "type": "degats",
        "element": "S",
        "min": 8,
        "max": 10,
        "maitre": [
         10,
         13
        ]
       },
       {
        "type": "attire",
        "cases": 2
       }
      ]
     },
     {
      "type": "si",
      "condition": "buffetComplet",
      "effets": [
       {
        "type": "gainCM",
        "n": 1,
        "qui": "soi"
       }
      ]
     }
    ],
    "texte": "Le piège amuse la galerie : la victime, intriguée, vient voir de plus près. Attirée de 2 cases vers toi, elle peut tomber sur un autre piège.",
    "change": "Le piège fait moins mal, en Soufflé, mais il attire la victime de 2 cases vers toi : on enchaîne les pièges, ou on la sert à la pique."
   }
  },
  {
   "base": {
    "id": "traitreur.service-discret",
    "classe": "traitreur",
    "emplacement": 3,
    "declinaisonDe": null,
    "niveau": 1,
    "nom": "Service discret",
    "element": "N",
    "cm": 2,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 0,
    "relance": 3,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "allies",
    "effets": [
     {
      "type": "etat",
      "etat": "derobe",
      "tours": 2,
      "couches": 1
     },
     {
      "type": "bonus",
      "carac": "pas",
      "valeur": 1,
      "tours": 1,
      "qui": "soi"
     }
    ],
    "texte": "Un bon serveur, on ne le voit pas passer. Tu deviens Dérobé (invisible pour l'ennemi) jusqu'à la fin de ton prochain tour, et tu gagnes 1 Pas ce tour. Lancer un sort montre ta case un instant.",
    "change": ""
   },
   "declinaison": {
    "id": "traitreur.libre-service",
    "classe": "traitreur",
    "emplacement": 3,
    "declinaisonDe": "traitreur.service-discret",
    "niveau": 7,
    "nom": "Libre-service",
    "element": "N",
    "cm": 2,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 0,
    "relance": 2,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "dans-le-dos"
     }
    ],
    "texte": "Pas besoin d'attendre qu'on te serve : tu passes toi-même derrière le comptoir... et derrière l'ennemi. La case dans son dos doit être libre.",
    "change": "On ne se cache plus, on se sert : au lieu de disparaître, tu passes d'un coup dans le dos d'un ennemi à 4 cases ou moins, prêt à piquer."
   }
  },
  {
   "base": {
    "id": "traitreur.couteau-volant",
    "classe": "traitreur",
    "emplacement": 4,
    "declinaisonDe": null,
    "niveau": 10,
    "nom": "Couteau volant",
    "element": "S",
    "cm": 3,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": true
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "ligne",
     "taille": 2,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 13,
      "max": 16,
      "maitre": [
       16,
       20
      ]
     }
    ],
    "texte": "Le couteau file droit et ne s'arrête pas au premier client : il touche la cible et les 2 cases derrière elle.",
    "change": ""
   },
   "declinaison": {
    "id": "traitreur.couteau-a-huitres",
    "classe": "traitreur",
    "emplacement": 4,
    "declinaisonDe": "traitreur.couteau-volant",
    "niveau": 18,
    "nom": "Couteau à huîtres",
    "element": "E",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 1,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 15,
      "max": 18,
      "maitre": [
       19,
       23
      ]
     },
     {
      "type": "retire",
      "quoi": "pas",
      "n": 1
     }
    ],
    "texte": "Un petit coup sec, comme pour ouvrir une huître. La cible se referme : elle perd 1 Pas.",
    "change": "Le couteau ne se lance plus : il pique au contact une seule cible, en Eaudace, qui perd 1 Pas."
   }
  },
  {
   "base": {
    "id": "traitreur.verrine",
    "classe": "traitreur",
    "emplacement": 5,
    "declinaisonDe": null,
    "niveau": 26,
    "nom": "Verrine",
    "element": "E",
    "cm": 2,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "caseLibre",
    "parTour": 2,
    "parCible": 0,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 3,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "pose",
      "quoi": "piege",
      "tours": 0,
      "zone": {
       "forme": "case",
       "taille": 0,
       "tailleMin": 0,
       "baisse": true
      },
      "touche": "ennemis",
      "maitre": 10,
      "effets": [
       {
        "type": "degats",
        "element": "E",
        "min": 10,
        "max": 12,
        "maitre": [
         13,
         15
        ]
       },
       {
        "type": "etat",
        "etat": "ramolli",
        "tours": 2,
        "couches": 1
       }
      ]
     },
     {
      "type": "si",
      "condition": "buffetComplet",
      "effets": [
       {
        "type": "gainCM",
        "n": 1,
        "qui": "soi"
       }
      ]
     }
    ],
    "texte": "Une jolie verrine posée au sol, cachée à l'ennemi. Le verre casse sous le pied : la victime est Ramollie (−1 Pas) pendant 2 tours. Elle compte dans ton buffet.",
    "change": ""
   },
   "declinaison": {
    "id": "traitreur.eclats-de-verrine",
    "classe": "traitreur",
    "emplacement": 5,
    "declinaisonDe": "traitreur.verrine",
    "niveau": 34,
    "nom": "Éclats de verrine",
    "element": "C",
    "cm": 3,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 13,
      "max": 16,
      "maitre": [
       16,
       20
      ]
     },
     {
      "type": "rebond",
      "fois": 2,
      "rayon": 2,
      "part": 50
     }
    ],
    "texte": "La verrine vole en éclats sur la cible, et les éclats rebondissent sur 2 ennemis proches, à moitié des dégâts.",
    "change": "La verrine n'attend plus au sol et ne ralentit plus : on la lance, en Éclair, et ses éclats touchent 2 ennemis de plus. Elle ne compte pas dans ton buffet."
   }
  },
  {
   "base": {
    "id": "traitreur.petits-fours",
    "classe": "traitreur",
    "emplacement": 6,
    "declinaisonDe": null,
    "niveau": 41,
    "nom": "Petits-fours",
    "element": "F",
    "cm": 4,
    "rayon": {
     "min": 2,
     "max": 4,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "case",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 15,
    "zone": {
     "forme": "croix",
     "taille": 1,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "F",
      "min": 15,
      "max": 19,
      "maitre": [
       19,
       24
      ]
     },
     {
      "type": "etat",
      "etat": "brule",
      "tours": 2,
      "couches": 1
     }
    ],
    "texte": "Un plateau de petits-fours tout juste sortis du four, sur la case visée et les 4 cases autour. Ça colle aux doigts : les ennemis touchés sont Brûlés.",
    "change": ""
   },
   "declinaison": {
    "id": "traitreur.petits-fourbes",
    "classe": "traitreur",
    "emplacement": 6,
    "declinaisonDe": "traitreur.petits-fours",
    "niveau": 49,
    "nom": "Petits-fourbes",
    "element": "S",
    "cm": 3,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": true
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 13,
      "max": 16,
      "maitre": [
       16,
       20
      ]
     },
     {
      "type": "attire",
      "cases": 2
     }
    ],
    "texte": "Petits, mais fourbes : lancés en ligne, ils attirent la cible de 2 cases vers toi, droit sur tes pièges si tu les as bien placés.",
    "change": "Plus de zone ni de Brûlé : une seule cible, en ligne et en Soufflé, attirée de 2 cases vers toi. Un sort à 3 CM, qu'on peut lancer 2 fois par tour."
   }
  },
  {
   "base": {
    "id": "traitreur.canape",
    "classe": "traitreur",
    "emplacement": 7,
    "declinaisonDe": null,
    "niveau": 57,
    "nom": "Canapé",
    "element": "T",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 16,
      "max": 19,
      "maitre": [
       20,
       24
      ]
     },
     {
      "type": "pousse",
      "cases": 2
     }
    ],
    "texte": "Un canapé si copieux qu'il enfonce la cible : elle recule de 2 cases. Contre un mur, elle s'écrase ; sur un piège, il claque.",
    "change": ""
   },
   "declinaison": {
    "id": "traitreur.canape-lit",
    "classe": "traitreur",
    "emplacement": 7,
    "declinaisonDe": "traitreur.canape",
    "niveau": 65,
    "nom": "Canapé-lit",
    "element": "N",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 3,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "etat",
      "etat": "enracine",
      "tours": 1,
      "couches": 1
     },
     {
      "type": "retire",
      "quoi": "cm",
      "n": 2
     }
    ],
    "texte": "Le canapé se déplie et la cible s'y affale : elle est Enracinée et perd 2 coups de main à son prochain tour. Une sieste, pas plus : le sort revient dans 3 tours.",
    "change": "Plus de dégâts ni de poussée : on endort presque la cible (Enracinée, −2 CM), une fois tous les 3 tours."
   }
  },
  {
   "base": {
    "id": "traitreur.service-a-l-assiette",
    "classe": "traitreur",
    "emplacement": 8,
    "declinaisonDe": null,
    "niveau": 73,
    "nom": "Service à l'assiette",
    "element": "N",
    "cm": 2,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 0,
    "relance": 3,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "allies",
    "effets": [
     {
      "type": "renforce",
      "quoi": "famille:piege",
      "valeur": 40,
      "tours": 2,
      "fois": 0
     }
    ],
    "texte": "Chaque piège dressé à l'assiette, avec soin : ceux que tu poses ce tour-ci et au prochain feront +40 % de dégâts, même s'ils claquent bien plus tard. Lance-le avant de poser tes pièges.",
    "change": ""
   },
   "declinaison": {
    "id": "traitreur.sous-cloche",
    "classe": "traitreur",
    "emplacement": 8,
    "declinaisonDe": "traitreur.service-a-l-assiette",
    "niveau": 81,
    "nom": "Sous cloche",
    "element": "N",
    "cm": 2,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 0,
    "relance": 3,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "allies",
    "effets": [
     {
      "type": "bonus",
      "carac": "degatsPct",
      "valeur": 25,
      "tours": 2,
      "qui": "soi"
     }
    ],
    "texte": "Sous la cloche, tout reste chaud : +25 % de dégâts sur tout ce que tu fais, jusqu'à la fin de ton prochain tour.",
    "change": "Le bonus ne touche plus seulement les pièges que tu poses : il vaut pour tous tes dégâts, mais il est plus petit (+25 %). On choisit entre le jeu du poseur de pièges et celui de l'assassin."
   }
  },
  {
   "base": {
    "id": "traitreur.bouchee-a-la-reine",
    "classe": "traitreur",
    "emplacement": 9,
    "declinaisonDe": null,
    "niveau": 88,
    "nom": "Bouchée à la reine",
    "element": "C",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 1,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 15,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 16,
      "max": 19,
      "maitre": [
       20,
       24
      ]
     },
     {
      "type": "si",
      "condition": "dansLeDos",
      "effets": [
       {
        "type": "degats",
        "element": "C",
        "min": 16,
        "max": 19,
        "maitre": [
         20,
         24
        ]
       }
      ]
     },
     {
      "type": "si",
      "condition": "cibleTombe",
      "effets": [
       {
        "type": "gainCM",
        "n": 1,
        "qui": "soi"
       }
      ]
     }
    ],
    "texte": "Une bouchée feuilletée, servie comme à la reine. Dans le dos, elle passe deux fois : dégâts doublés. Si la cible tombe, tu enchaînes : +1 coup de main.",
    "change": ""
   },
   "declinaison": {
    "id": "traitreur.vol-au-vent",
    "classe": "traitreur",
    "emplacement": 9,
    "declinaisonDe": "traitreur.bouchee-a-la-reine",
    "niveau": 96,
    "nom": "Vol-au-vent",
    "element": "S",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 1,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 14,
      "max": 17,
      "maitre": [
       18,
       21
      ]
     },
     {
      "type": "bonus",
      "carac": "pas",
      "valeur": 2,
      "tours": 1,
      "qui": "soi"
     },
     {
      "type": "bonus",
      "carac": "fauxFuyant",
      "valeur": 10,
      "tours": 1,
      "qui": "soi"
     }
    ],
    "texte": "Un coup de feuilleté, et tu t'envoles comme le vent : +2 Pas et +10 Faux-fuyant ce tour, pour quitter le contact. Une seule envolée par tour.",
    "change": "Le même feuilleté servi pour filer, en Soufflé : il frappe moins fort, sans bonus dans le dos, une fois par tour, mais tu gagnes de quoi fuir après le coup."
   }
  },
  {
   "base": {
    "id": "traitreur.cocktail-explosif",
    "classe": "traitreur",
    "emplacement": 10,
    "declinaisonDe": null,
    "niveau": 104,
    "nom": "Cocktail explosif",
    "element": "S",
    "cm": 3,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 0,
    "relance": 2,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 15,
      "max": 18,
      "maitre": [
       19,
       23
      ]
     },
     {
      "type": "echange"
     }
    ],
    "texte": "Le cocktail explose dans un grand souffle. Quand tout retombe, tu as pris la place de la cible... et elle la tienne, avec ce que tu avais laissé dessous.",
    "change": ""
   },
   "declinaison": {
    "id": "traitreur.cocktail-flambe",
    "classe": "traitreur",
    "emplacement": 10,
    "declinaisonDe": "traitreur.cocktail-explosif",
    "niveau": 112,
    "nom": "Cocktail flambé",
    "element": "F",
    "cm": 4,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "case",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 1,
    "maitre": 15,
    "zone": {
     "forme": "rond",
     "taille": 1,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "F",
      "min": 17,
      "max": 21,
      "maitre": [
       21,
       26
      ]
     },
     {
      "type": "pose",
      "quoi": "nappe",
      "tours": 1,
      "declenche": "debut",
      "zone": {
       "forme": "rond",
       "taille": 1,
       "tailleMin": 0,
       "baisse": true
      },
      "touche": "ennemis",
      "maitre": 5,
      "effets": [
       {
        "type": "degats",
        "element": "F",
        "min": 7,
        "max": 9,
        "maitre": [
         9,
         11
        ]
       }
      ]
     }
    ],
    "texte": "Le cocktail flambe sur la case visée et les 4 cases autour. Le sol brûle encore : qui y commence son tour prend 7 à 9 dégâts Flambée.",
    "change": "Le cocktail ne déplace plus personne : il flambe en zone, en Flambée, et laisse le sol en feu jusqu'à ton prochain tour."
   }
  },
  {
   "base": {
    "id": "traitreur.buffet-a-volonte",
    "classe": "traitreur",
    "emplacement": 11,
    "declinaisonDe": null,
    "niveau": 120,
    "nom": "Buffet à volonté",
    "element": "N",
    "cm": 3,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 0,
    "relance": 3,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "rond",
     "taille": 4,
     "tailleMin": 1,
     "baisse": false
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "attire",
      "cases": 2
     },
     {
      "type": "si",
      "condition": "buffetComplet",
      "effets": [
       {
        "type": "attire",
        "cases": 1
       }
      ]
     }
    ],
    "texte": "Le buffet est ouvert, à volonté ! Tous les ennemis à 4 cases ou moins se précipitent : attirés de 2 cases vers toi (3 si ton buffet est complet)... et vers tes pièges. Une telle ruée ne revient que tous les 3 tours.",
    "change": ""
   },
   "declinaison": {
    "id": "traitreur.buffet-froid",
    "classe": "traitreur",
    "emplacement": 11,
    "declinaisonDe": "traitreur.buffet-a-volonte",
    "niveau": 128,
    "nom": "Buffet froid",
    "element": "E",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "caseLibre",
    "parTour": 1,
    "parCible": 0,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 2,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "pose",
      "quoi": "piege",
      "tours": 0,
      "zone": {
       "forme": "carre",
       "taille": 1,
       "tailleMin": 0,
       "baisse": true
      },
      "touche": "ennemis",
      "maitre": 10,
      "effets": [
       {
        "type": "degats",
        "element": "E",
        "min": 13,
        "max": 16,
        "maitre": [
         16,
         20
        ]
       },
       {
        "type": "etat",
        "etat": "enracine",
        "tours": 1,
        "couches": 1
       }
      ]
     },
     {
      "type": "si",
      "condition": "buffetComplet",
      "effets": [
       {
        "type": "gainCM",
        "n": 1,
        "qui": "soi"
       }
      ]
     }
    ],
    "texte": "Un buffet froid, dressé d'avance et caché au sol. Qui marche dessus est saisi par le froid, avec ses voisins (3 cases sur 3) : dégâts Eaudace, et ils sont Enracinés, sans pouvoir marcher, jusqu'à la fin de leur tour. Il compte dans ton buffet.",
    "change": "Au lieu d'attirer tout le monde vers toi, tu caches un piège glacé, en Eaudace, qui fige sur place la victime et ses voisins. Un seul par tour, deux au sol au plus."
   }
  },
  {
   "base": {
    "id": "traitreur.table-renversee",
    "classe": "traitreur",
    "emplacement": 12,
    "declinaisonDe": null,
    "niveau": 135,
    "nom": "Table renversée",
    "element": "T",
    "cm": 4,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "rond",
     "taille": 2,
     "tailleMin": 1,
     "baisse": false
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 16,
      "max": 20,
      "maitre": [
       20,
       25
      ]
     },
     {
      "type": "pousse",
      "cases": 2
     }
    ],
    "texte": "Tu renverses la table d'un coup sec, et tout ce qui était dessus vole. Les ennemis à 2 cases ou moins sont repoussés de 2 cases. Contre un mur, ils s'écrasent ; sur un piège, il claque.",
    "change": ""
   },
   "declinaison": {
    "id": "traitreur.chemin-de-table",
    "classe": "traitreur",
    "emplacement": 12,
    "declinaisonDe": "traitreur.table-renversee",
    "niveau": 143,
    "nom": "Chemin de table",
    "element": "S",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": true
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "case",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "ligne",
     "taille": 3,
     "tailleMin": 0,
     "baisse": false
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 16,
      "max": 20,
      "maitre": [
       20,
       25
      ]
     },
     {
      "type": "attire",
      "cases": 2
     }
    ],
    "texte": "Tu tires le chemin de table d'un coup sec, sans rien casser : chaque ennemi sur la ligne de 4 cases est attiré de 2 cases vers toi.",
    "change": "On ne repousse plus autour de soi : on tire le chemin de table sur une ligne de 4 cases, en Soufflé, et chaque ennemi touché est attiré de 2 cases vers toi."
   }
  },
  {
   "base": {
    "id": "traitreur.flambee-minute",
    "classe": "traitreur",
    "emplacement": 13,
    "declinaisonDe": null,
    "niveau": 151,
    "nom": "Flambée minute",
    "element": "F",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 20,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "F",
      "min": 24,
      "max": 29,
      "maitre": [
       30,
       36
      ]
     },
     {
      "type": "etat",
      "etat": "brule",
      "tours": 2,
      "couches": 1
     }
    ],
    "texte": "Flambé à la minute, devant le client : de près (3 cases au plus), un grand coup de Flambée, et la cible reste Brûlée 2 tours. Le geste est sûr : coup de maître fréquent.",
    "change": ""
   },
   "declinaison": {
    "id": "traitreur.glace-minute",
    "classe": "traitreur",
    "emplacement": 13,
    "declinaisonDe": "traitreur.flambee-minute",
    "niveau": 159,
    "nom": "Glace minute",
    "element": "E",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "case",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "croix",
     "taille": 1,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 18,
      "max": 22,
      "maitre": [
       23,
       28
      ]
     },
     {
      "type": "etat",
      "etat": "ramolli",
      "tours": 1,
      "couches": 2
     }
    ],
    "texte": "Le chaud devient froid : la glace prend d'un coup sur la case visée et les 4 cases autour. Les ennemis gelés perdent 2 Pas à leur prochain tour.",
    "change": "Au lieu d'un gros coup de près sur une cible, une petite zone d'Eaudace lancée un peu plus loin, qui ralentit les ennemis touchés (Ramolli, 2 couches)."
   }
  },
  {
   "base": {
    "id": "traitreur.dessert-surprise",
    "classe": "traitreur",
    "emplacement": 14,
    "declinaisonDe": null,
    "niveau": 167,
    "nom": "Dessert surprise",
    "element": "E",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 21,
      "max": 25,
      "maitre": [
       26,
       31
      ]
     },
     {
      "type": "retire",
      "quoi": "pas",
      "n": 1
     },
     {
      "type": "si",
      "condition": "buffetComplet",
      "effets": [
       {
        "type": "gainCM",
        "n": 1,
        "qui": "soi"
       }
      ]
     }
    ],
    "texte": "Un dessert glacé qui cache une surprise : la cible perd 1 Pas. Si ton buffet est complet, le dessert est offert : tu regagnes 1 coup de main.",
    "change": ""
   },
   "declinaison": {
    "id": "traitreur.surprise-du-chef",
    "classe": "traitreur",
    "emplacement": 14,
    "declinaisonDe": "traitreur.dessert-surprise",
    "niveau": 175,
    "nom": "Surprise du chef",
    "element": "T",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "caseLibre",
    "parTour": 1,
    "parCible": 0,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 2,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "pose",
      "quoi": "piege",
      "tours": 0,
      "zone": {
       "forme": "croix",
       "taille": 1,
       "tailleMin": 0,
       "baisse": true
      },
      "touche": "ennemis",
      "maitre": 10,
      "effets": [
       {
        "type": "degats",
        "element": "T",
        "min": 22,
        "max": 27,
        "maitre": [
         28,
         34
        ]
       }
      ]
     },
     {
      "type": "si",
      "condition": "buffetComplet",
      "effets": [
       {
        "type": "gainCM",
        "n": 1,
        "qui": "soi"
       }
      ]
     }
    ],
    "texte": "La surprise du chef attend, cachée au sol : le plat s'ouvre sous qui marche dessus et éclabousse les 4 cases autour. Elle compte dans ton buffet.",
    "change": "La surprise devient un gros piège caché, en Terroir, qui touche aussi les cases voisines, au lieu d'un coup direct ; un seul par tour, deux au sol au plus."
   }
  },
  {
   "base": {
    "id": "traitreur.menu-complet",
    "classe": "traitreur",
    "emplacement": 15,
    "declinaisonDe": null,
    "niveau": 182,
    "nom": "Menu complet",
    "element": "C",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 20,
      "max": 24,
      "maitre": [
       25,
       30
      ]
     },
     {
      "type": "rebond",
      "fois": 2,
      "rayon": 3,
      "part": 50
     }
    ],
    "texte": "Un menu complet, servi en trois temps : l'entrée sur la cible, puis le plat et le dessert rebondissent sur 2 ennemis proches, à moitié des dégâts.",
    "change": ""
   },
   "declinaison": {
    "id": "traitreur.plat-du-terroir",
    "classe": "traitreur",
    "emplacement": 15,
    "declinaisonDe": "traitreur.menu-complet",
    "niveau": 190,
    "nom": "Plat du terroir",
    "element": "T",
    "cm": 4,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "case",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "croix",
     "taille": 2,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 21,
      "max": 25,
      "maitre": [
       26,
       31
      ]
     },
     {
      "type": "pousse",
      "cases": 1
     }
    ],
    "texte": "Un plat du terroir, bien lourd, retombe de haut : il écrase une croix de 9 cases et repousse d'une case les ennemis touchés, loin du point de chute.",
    "change": "Le menu ne rebondit plus d'un ennemi à l'autre : le plat retombe en grande croix, en Terroir, et repousse."
   }
  },
  {
   "base": {
    "id": "traitreur.chef-d-oeuvre-le-banquet-des-traitres",
    "classe": "traitreur",
    "emplacement": 16,
    "declinaisonDe": null,
    "niveau": 200,
    "nom": "Chef-d'œuvre : le Banquet des traîtres",
    "element": "C",
    "cm": 7,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 0,
    "relance": 5,
    "relanceInitiale": 2,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "terrain",
     "taille": 0,
     "tailleMin": 0,
     "baisse": false
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 30,
      "max": 37,
      "maitre": [
       38,
       46
      ]
     },
     {
      "type": "si",
      "condition": "buffetComplet",
      "effets": [
       {
        "type": "degats",
        "element": "C",
        "min": 8,
        "max": 10,
        "maitre": [
         10,
         13
        ]
       }
      ]
     }
    ],
    "texte": "À table, les traîtres ! Chaque ennemi du terrain est servi : dégâts Éclair. Si ton buffet est complet, la trahison est totale : 8 à 10 dégâts de plus chacun.",
    "change": ""
   },
   "declinaison": {
    "id": "traitreur.chef-d-oeuvre-le-coup-de-feu",
    "classe": "traitreur",
    "emplacement": 16,
    "declinaisonDe": "traitreur.chef-d-oeuvre-le-banquet-des-traitres",
    "niveau": 200,
    "nom": "Chef-d'œuvre : le Coup de feu",
    "element": "F",
    "cm": 7,
    "rayon": {
     "min": 1,
     "max": 6,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 0,
    "relance": 5,
    "relanceInitiale": 2,
    "plafondPose": 0,
    "maitre": 20,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "F",
      "min": 46,
      "max": 56,
      "maitre": [
       58,
       70
      ]
     },
     {
      "type": "si",
      "condition": "buffetComplet",
      "effets": [
       {
        "type": "degats",
        "element": "F",
        "min": 12,
        "max": 15,
        "maitre": [
         15,
         19
        ]
       }
      ]
     }
    ],
    "texte": "C'est le coup de feu en cuisine : tout part sur une seule assiette. Si ton buffet est complet, tout le service suit : 12 à 15 dégâts de plus.",
    "change": "Au lieu de servir tout le terrain, on met tout le feu sur une seule cible, en Flambée."
   }
  }
 ],
 "legumancien": [
  {
   "base": {
    "id": "legumancien.semis",
    "classe": "legumancien",
    "emplacement": 1,
    "declinaisonDe": null,
    "niveau": 1,
    "nom": "Semis",
    "element": "T",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "caseLibre",
    "parTour": 1,
    "parCible": 0,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 2,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "pose",
      "quoi": "graine",
      "tours": 1,
      "zone": {
       "forme": "case",
       "taille": 0,
       "tailleMin": 0,
       "baisse": true
      },
      "touche": "ennemis",
      "maitre": 0,
      "effets": [],
      "commis": {
       "nom": "Radis furieux",
       "victuailles": 24,
       "cm": 4,
       "pas": 3,
       "ouverture": 0,
       "rideau": 6,
       "fauxFuyant": 2,
       "comportement": "colle",
       "sorts": [
        {
         "id": "legumancien.croque-au-sel",
         "classe": "legumancien",
         "declinaisonDe": null,
         "niveau": 1,
         "nom": "Croque-au-sel",
         "element": "T",
         "cm": 2,
         "rayon": {
          "min": 1,
          "max": 1,
          "modifiable": false
         },
         "lancer": "libre",
         "vue": true,
         "cible": "ennemi",
         "parTour": 2,
         "parCible": 2,
         "relance": 0,
         "relanceInitiale": 0,
         "plafondPose": 0,
         "maitre": 5,
         "zone": {
          "forme": "case",
          "taille": 0,
          "tailleMin": 0,
          "baisse": true
         },
         "touche": "ennemis",
         "effets": [
          {
           "type": "degats",
           "element": "T",
           "min": 7,
           "max": 9,
           "maitre": [
            9,
            11
           ]
          }
         ],
         "texte": "Le Radis furieux se croque cru, mais lui aussi croque : il mord l'ennemi au contact, plus fort que l'étincelle du Radis survolté.",
         "change": ""
        }
       ]
      }
     }
    ],
    "texte": "Qui sème des radis récolte des morsures. La graine germe au tour suivant : un Radis furieux sort de terre et mord les ennemis au contact. Un radis pousse vite : tu peux en semer un à chaque tour, sans attendre. Deux graines au plus en terre : la seconde attend qu'une place de Commis se libère.",
    "change": ""
   },
   "declinaison": {
    "id": "legumancien.semis-conducteur",
    "classe": "legumancien",
    "emplacement": 1,
    "declinaisonDe": "legumancien.semis",
    "niveau": 3,
    "nom": "Semis-conducteur",
    "element": "C",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "caseLibre",
    "parTour": 1,
    "parCible": 0,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 2,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "pose",
      "quoi": "graine",
      "tours": 1,
      "zone": {
       "forme": "case",
       "taille": 0,
       "tailleMin": 0,
       "baisse": true
      },
      "touche": "ennemis",
      "maitre": 0,
      "effets": [],
      "commis": {
       "nom": "Radis survolté",
       "victuailles": 16,
       "cm": 4,
       "pas": 4,
       "ouverture": 0,
       "rideau": 0,
       "fauxFuyant": 10,
       "comportement": "tire",
       "sorts": [
        {
         "id": "legumancien.court-jus",
         "classe": "legumancien",
         "declinaisonDe": null,
         "niveau": 3,
         "nom": "Court-jus",
         "element": "C",
         "cm": 2,
         "rayon": {
          "min": 2,
          "max": 4,
          "modifiable": false
         },
         "lancer": "libre",
         "vue": true,
         "cible": "ennemi",
         "parTour": 2,
         "parCible": 2,
         "relance": 0,
         "relanceInitiale": 0,
         "plafondPose": 0,
         "maitre": 5,
         "zone": {
          "forme": "case",
          "taille": 0,
          "tailleMin": 0,
          "baisse": true
         },
         "touche": "ennemis",
         "effets": [
          {
           "type": "degats",
           "element": "C",
           "min": 6,
           "max": 8,
           "maitre": [
            8,
            10
           ]
          },
          {
           "type": "rebond",
           "fois": 1,
           "rayon": 2,
           "part": 50
          }
         ],
         "texte": "Une étincelle de radis frappe un ennemi, puis saute sur l'ennemi le plus proche.",
         "change": ""
        }
       ]
      }
     }
    ],
    "texte": "Un semi-conducteur, mais en graine : le courant la porte un peu plus loin, jusqu'à 4 cases. Le Radis survolté reste à distance et lance des étincelles qui sautent d'un ennemi à l'autre.",
    "change": "La graine donne un Radis survolté à la place du Radis furieux : plus fragile et plus rapide, il fuit le contact et tire de loin en Éclair, avec une étincelle qui rebondit, au lieu de mordre. Elle se sème aussi un peu plus loin (4 cases au lieu de 3)."
   }
  },
  {
   "base": {
    "id": "legumancien.navet-en-cloche",
    "classe": "legumancien",
    "emplacement": 2,
    "declinaisonDe": null,
    "niveau": 1,
    "nom": "Navet en cloche",
    "element": "T",
    "cm": 2,
    "rayon": {
     "min": 2,
     "max": 6,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "ennemi",
    "parTour": 3,
    "parCible": 2,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 8,
      "max": 10,
      "maitre": [
       10,
       13
      ]
     }
    ],
    "texte": "Ce navet fait un carton. Tiré en cloche par-dessus tes légumes, il passe au-dessus des obstacles, mais ne tombe jamais à moins de 2 cases de toi. Un petit navet part vite : jusqu'à trois par tour, deux sur la même cible.",
    "change": ""
   },
   "declinaison": {
    "id": "legumancien.rutabagarre",
    "classe": "legumancien",
    "emplacement": 2,
    "declinaisonDe": "legumancien.navet-en-cloche",
    "niveau": 5,
    "nom": "Rutabagarre",
    "element": "T",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 1,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 15,
      "max": 19,
      "maitre": [
       19,
       24
      ]
     },
     {
      "type": "pousse",
      "cases": 2
     }
    ],
    "texte": "La bagarre au rutabaga, le gros cousin du navet : un coup au contact qui renvoie l'ennemi deux cases plus loin. S'il bute contre un de tes légumes, c'est l'ennemi qui s'écrase, pas le légume.",
    "change": "On ne tire plus le navet en cloche, on cogne avec le rutabaga : un seul gros coup au contact (3 coups de main au lieu de 2), presque deux fois plus fort, qui repousse de 2 cases."
   }
  },
  {
   "base": {
    "id": "legumancien.repiquage",
    "classe": "legumancien",
    "emplacement": 3,
    "declinaisonDe": null,
    "niveau": 1,
    "nom": "Repiquage",
    "element": "N",
    "cm": 2,
    "rayon": {
     "min": 1,
     "max": 6,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "allie",
    "parTour": 1,
    "parCible": 0,
    "relance": 2,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "allies",
    "effets": [
     {
      "type": "echange"
     }
    ],
    "texte": "Au potager, repiquer, c'est déterrer un plant et le replanter ailleurs. Ici, tu changes de place avec un allié, souvent un de tes légumes, par les racines : pas besoin de le voir.",
    "change": ""
   },
   "declinaison": {
    "id": "legumancien.flageolet",
    "classe": "legumancien",
    "emplacement": 3,
    "declinaisonDe": "legumancien.repiquage",
    "niveau": 7,
    "nom": "Flageolet",
    "element": "S",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": true
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "case",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "ligne",
     "taille": 2,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 12,
      "max": 15,
      "maitre": [
       15,
       19
      ]
     }
    ],
    "texte": "Ce haricot est aussi une petite flûte, et il siffle fort : le son traverse toute une ligne d'ennemis.",
    "change": "On ne change plus de place : le flageolet, haricot et petite flûte, siffle des dégâts Soufflé sur une ligne de 3 cases."
   }
  },
  {
   "base": {
    "id": "legumancien.piment-vif",
    "classe": "legumancien",
    "emplacement": 4,
    "declinaisonDe": null,
    "niveau": 10,
    "nom": "Piment vif",
    "element": "F",
    "cm": 2,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 3,
    "parCible": 2,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 15,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "F",
      "min": 8,
      "max": 11,
      "maitre": [
       10,
       14
      ]
     },
     {
      "type": "etat",
      "etat": "brule",
      "tours": 2,
      "couches": 1
     }
    ],
    "texte": "Un piment qui pique au vif : la cible brûle encore pendant 2 tours.",
    "change": ""
   },
   "declinaison": {
    "id": "legumancien.piment-d-artifice",
    "classe": "legumancien",
    "emplacement": 4,
    "declinaisonDe": "legumancien.piment-vif",
    "niveau": 18,
    "nom": "Piment d'artifice",
    "element": "F",
    "cm": 3,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "case",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 20,
    "zone": {
     "forme": "croix",
     "taille": 1,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "F",
      "min": 12,
      "max": 15,
      "maitre": [
       15,
       19
      ]
     }
    ],
    "texte": "Le piment éclate en feu d'artifice : une croix d'étincelles, et souvent le bouquet final.",
    "change": "Le piment ne vise plus une seule cible : il éclate en feu d'artifice sur une croix, pour 1 coup de main de plus, avec plus de coups de maître mais sans Brûlé."
   }
  },
  {
   "base": {
    "id": "legumancien.bouillon-de-legumes",
    "classe": "legumancien",
    "emplacement": 5,
    "declinaisonDe": null,
    "niveau": 26,
    "nom": "Bouillon de légumes",
    "element": "N",
    "cm": 2,
    "rayon": {
     "min": 0,
     "max": 4,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "allie",
    "parTour": 1,
    "parCible": 1,
    "relance": 2,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "allies",
    "effets": [
     {
      "type": "bouclier",
      "valeur": 24,
      "tours": 2,
      "couchesMax": 1
     }
    ],
    "texte": "Un bouillon qui tient au corps : il encaisse les coups à la place d'un allié, d'un de tes légumes ou de toi-même.",
    "change": ""
   },
   "declinaison": {
    "id": "legumancien.bouillon-d-onze-heures",
    "classe": "legumancien",
    "emplacement": 5,
    "declinaisonDe": "legumancien.bouillon-de-legumes",
    "niveau": 34,
    "nom": "Bouillon d'onze heures",
    "element": "E",
    "cm": 3,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 13,
      "max": 17,
      "maitre": [
       16,
       21
      ]
     },
     {
      "type": "retire",
      "quoi": "pas",
      "n": 1
     }
    ],
    "texte": "Le bouillon d'onze heures, celui qu'on sert pour empoisonner : il pèse sur l'estomac, et la cible perd 1 Pas.",
    "change": "Le bouillon qui protège devient le bouillon empoisonné de l'expression : plus de bouclier pour un allié, mais des dégâts Eaudace sur un ennemi, qui perd 1 Pas."
   }
  },
  {
   "base": {
    "id": "legumancien.puree-de-pois",
    "classe": "legumancien",
    "emplacement": 6,
    "declinaisonDe": null,
    "niveau": 41,
    "nom": "Purée de pois",
    "element": "E",
    "cm": 3,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "case",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "rond",
     "taille": 1,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 11,
      "max": 14,
      "maitre": [
       14,
       18
      ]
     },
     {
      "type": "etat",
      "etat": "ramolli",
      "tours": 1,
      "couches": 1
     }
    ],
    "texte": "Une averse de petits pois tombe du ciel, par-dessus les obstacles, et s'écrase en purée sous les pieds : les ennemis touchés sont ramollis et pataugent.",
    "change": ""
   },
   "declinaison": {
    "id": "legumancien.pile-pois",
    "classe": "legumancien",
    "emplacement": 6,
    "declinaisonDe": "legumancien.puree-de-pois",
    "niveau": 49,
    "nom": "Pile-pois",
    "element": "C",
    "cm": 2,
    "rayon": {
     "min": 2,
     "max": 7,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 3,
    "parCible": 2,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 10,
      "max": 13,
      "maitre": [
       13,
       16
      ]
     },
     {
      "type": "si",
      "condition": "cibleTombe",
      "effets": [
       {
        "type": "gainCM",
        "n": 1,
        "qui": "soi"
       }
      ]
     }
    ],
    "texte": "Un petit pois chargé comme une pile, qui tombe pile poil. S'il fait tomber la cible, la charge te revient : 1 coup de main de plus.",
    "change": "La purée de pois en zone devient un seul pois chargé comme une pile : une seule cible, plus loin et moins cher, en Éclair, et 1 coup de main rendu si la cible tombe."
   }
  },
  {
   "base": {
    "id": "legumancien.aigrette-de-pissenlit",
    "classe": "legumancien",
    "emplacement": 7,
    "declinaisonDe": null,
    "niveau": 57,
    "nom": "Aigrette de pissenlit",
    "element": "S",
    "cm": 3,
    "rayon": {
     "min": 2,
     "max": 6,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "case",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "rond",
     "taille": 2,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 11,
      "max": 14,
      "maitre": [
       14,
       18
      ]
     }
    ],
    "texte": "Tu souffles sur l'aigrette : les graines s'envolent et piquent tous les ennemis d'une large zone.",
    "change": ""
   },
   "declinaison": {
    "id": "legumancien.dent-de-lion",
    "classe": "legumancien",
    "emplacement": 7,
    "declinaisonDe": "legumancien.aigrette-de-pissenlit",
    "niveau": 65,
    "nom": "Dent-de-lion",
    "element": "T",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "case",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "travers",
     "taille": 1,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 12,
      "max": 15,
      "maitre": [
       15,
       19
      ]
     }
    ],
    "texte": "Le pissenlit, qu'on appelle aussi dent-de-lion, montre les dents : une mâchoire sort du sol et mord 3 cases côte à côte, en travers face à toi. Elle mord par en dessous : pas besoin de voir la cible.",
    "change": "Le pissenlit ne s'envole plus : sous son autre nom, dent-de-lion, il mord depuis le sol en Terroir, sur 3 cases côte à côte au lieu d'un grand rond, de plus près et sans avoir besoin de vue."
   }
  },
  {
   "base": {
    "id": "legumancien.citrouille-de-garde",
    "classe": "legumancien",
    "emplacement": 8,
    "declinaisonDe": null,
    "niveau": 73,
    "nom": "Citrouille de garde",
    "element": "N",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 2,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "caseLibre",
    "parTour": 1,
    "parCible": 0,
    "relance": 4,
    "relanceInitiale": 1,
    "plafondPose": 0,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "invoque",
      "commis": {
       "nom": "Citrouille de garde",
       "victuailles": 120,
       "cm": 3,
       "pas": 2,
       "ouverture": 0,
       "rideau": 20,
       "fauxFuyant": 0,
       "comportement": "colle",
       "sorts": [
        {
         "id": "legumancien.vrille-de-courge",
         "classe": "legumancien",
         "declinaisonDe": null,
         "niveau": 73,
         "nom": "Vrille de courge",
         "element": "N",
         "cm": 2,
         "rayon": {
          "min": 2,
          "max": 4,
          "modifiable": false
         },
         "lancer": "libre",
         "vue": true,
         "cible": "ennemi",
         "parTour": 1,
         "parCible": 1,
         "relance": 2,
         "relanceInitiale": 0,
         "plafondPose": 0,
         "maitre": 0,
         "zone": {
          "forme": "case",
          "taille": 0,
          "tailleMin": 0,
          "baisse": true
         },
         "touche": "ennemis",
         "effets": [
          {
           "type": "attire",
           "cases": 2
          }
         ],
         "texte": "La courge lance une vrille, une tige qui s'enroule : elle attrape l'ennemi et le tire contre elle, de 2 cases.",
         "change": ""
        }
       ]
      }
     }
    ],
    "texte": "Une grosse citrouille sort de terre tout de suite et se poste devant toi. Elle attire un ennemi contre elle et le retient : avec elle, personne ne passe.",
    "change": ""
   },
   "declinaison": {
    "id": "legumancien.citrouille-lanterne",
    "classe": "legumancien",
    "emplacement": 8,
    "declinaisonDe": "legumancien.citrouille-de-garde",
    "niveau": 81,
    "nom": "Citrouille-lanterne",
    "element": "F",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "caseLibre",
    "parTour": 1,
    "parCible": 0,
    "relance": 3,
    "relanceInitiale": 0,
    "plafondPose": 1,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "pose",
      "quoi": "ustensile",
      "nom": "Citrouille-lanterne",
      "victuailles": 60,
      "tours": 3,
      "zone": {
       "forme": "rond",
       "taille": 1,
       "tailleMin": 1,
       "baisse": false
      },
      "touche": "ennemis",
      "maitre": 10,
      "effets": [
       {
        "type": "degats",
        "element": "F",
        "min": 10,
        "max": 13,
        "maitre": [
         13,
         16
        ]
       }
      ]
     }
    ],
    "texte": "Une citrouille creusée, une bougie dedans : posée au sol, elle brûle les ennemis à côté d'elle au début de chacun de tes tours. Une seule à la fois.",
    "change": "La citrouille ne garde plus : posée comme une lanterne pour 3 tours, elle ne bouge pas et ne prend pas de place de Commis, mais brûle en Flambée les ennemis à côté d'elle ; on peut la casser."
   }
  },
  {
   "base": {
    "id": "legumancien.radis-actif",
    "classe": "legumancien",
    "emplacement": 9,
    "declinaisonDe": null,
    "niveau": 88,
    "nom": "Radis-actif",
    "element": "C",
    "cm": 3,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 14,
      "max": 18,
      "maitre": [
       18,
       23
      ]
     },
     {
      "type": "rebond",
      "fois": 2,
      "rayon": 2,
      "part": 50
     }
    ],
    "texte": "Un radis radioactif : son éclair saute d'un ennemi à l'autre, deux fois.",
    "change": ""
   },
   "declinaison": {
    "id": "legumancien.radis-ateur",
    "classe": "legumancien",
    "emplacement": 9,
    "declinaisonDe": "legumancien.radis-actif",
    "niveau": 96,
    "nom": "Radis-ateur",
    "element": "F",
    "cm": 3,
    "rayon": {
     "min": 0,
     "max": 5,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": true,
    "cible": "allie",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "rond",
     "taille": 1,
     "tailleMin": 1,
     "baisse": false
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "F",
      "min": 13,
      "max": 16,
      "maitre": [
       16,
       20
      ]
     },
     {
      "type": "etat",
      "etat": "brule",
      "tours": 2,
      "couches": 1
     }
    ],
    "texte": "Tu vises un allié, un de tes légumes de préférence : il chauffe comme un radiateur et brûle les ennemis à côté de lui.",
    "change": "Le radis ne rebondit plus : tu vises un allié, un de tes légumes ou toi-même, qui chauffe comme un radiateur et brûle en Flambée tous les ennemis à côté de lui."
   }
  },
  {
   "base": {
    "id": "legumancien.racines-nouees",
    "classe": "legumancien",
    "emplacement": 10,
    "declinaisonDe": null,
    "niveau": 104,
    "nom": "Racines nouées",
    "element": "E",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 3,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 14,
      "max": 17,
      "maitre": [
       18,
       21
      ]
     },
     {
      "type": "etat",
      "etat": "enracine",
      "tours": 2,
      "couches": 1
     }
    ],
    "texte": "Des racines gorgées d'eau sortent du sol et se nouent aux chevilles : la cible ne marche plus pendant 2 tours. Il faut ensuite un tour pour refaire un nœud pareil : la cible a toujours un tour de répit.",
    "change": ""
   },
   "declinaison": {
    "id": "legumancien.racine-carree",
    "classe": "legumancien",
    "emplacement": 10,
    "declinaisonDe": "legumancien.racines-nouees",
    "niveau": 112,
    "nom": "Racine carrée",
    "element": "T",
    "cm": 4,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "case",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "carre",
     "taille": 1,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 16,
      "max": 20,
      "maitre": [
       20,
       25
      ]
     },
     {
      "type": "pousse",
      "cases": 1
     }
    ],
    "texte": "La racine carrée, version potager : des racines jaillissent sur un carré de 3 cases sur 3 et repoussent les ennemis touchés loin du centre.",
    "change": "Les racines ne tiennent plus une cible : elles jaillissent du sol sur un carré de 3 cases sur 3, en Terroir, sans besoin de vue, et repoussent d'une case au lieu d'enraciner."
   }
  },
  {
   "base": {
    "id": "legumancien.oignon-larmoyant",
    "classe": "legumancien",
    "emplacement": 11,
    "declinaisonDe": null,
    "niveau": 120,
    "nom": "Oignon larmoyant",
    "element": "E",
    "cm": 3,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 14,
      "max": 18,
      "maitre": [
       18,
       23
      ]
     },
     {
      "type": "etat",
      "etat": "ramolli",
      "tours": 2,
      "couches": 1
     }
    ],
    "texte": "Un oignon qui fait pleurer : les yeux pleins de larmes, la cible avance à tâtons. Elle est ramollie pendant 2 tours ; un deuxième oignon le tour suivant, et elle perd 2 Pas.",
    "change": ""
   },
   "declinaison": {
    "id": "legumancien.en-rang-d-oignons",
    "classe": "legumancien",
    "emplacement": 11,
    "declinaisonDe": "legumancien.oignon-larmoyant",
    "niveau": 128,
    "nom": "En rang d'oignons",
    "element": "S",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": true
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "case",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "ligne",
     "taille": 3,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 17,
      "max": 21,
      "maitre": [
       21,
       26
      ]
     },
     {
      "type": "attire",
      "cases": 1
     }
    ],
    "texte": "Un coup de vent prend toute la rangée, et chacun avance d'une case vers toi : les voilà en rang d'oignons.",
    "change": "L'oignon ne fait plus pleurer une seule cible : un coup de vent frappe toute une ligne de 4 cases en Soufflé et attire chaque ennemi d'une case vers toi."
   }
  },
  {
   "base": {
    "id": "legumancien.chou-fleur-carnivore",
    "classe": "legumancien",
    "emplacement": 12,
    "declinaisonDe": null,
    "niveau": 135,
    "nom": "Chou-fleur carnivore",
    "element": "F",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "caseLibre",
    "parTour": 1,
    "parCible": 0,
    "relance": 4,
    "relanceInitiale": 0,
    "plafondPose": 1,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "pose",
      "quoi": "graine",
      "tours": 1,
      "zone": {
       "forme": "case",
       "taille": 0,
       "tailleMin": 0,
       "baisse": true
      },
      "touche": "ennemis",
      "maitre": 0,
      "effets": [],
      "commis": {
       "nom": "Chou-fleur carnivore",
       "victuailles": 100,
       "cm": 4,
       "pas": 3,
       "ouverture": 0,
       "rideau": 10,
       "fauxFuyant": 2,
       "comportement": "colle",
       "sorts": [
        {
         "id": "legumancien.croc-gratine",
         "classe": "legumancien",
         "declinaisonDe": null,
         "niveau": 135,
         "nom": "Croc gratiné",
         "element": "F",
         "cm": 4,
         "rayon": {
          "min": 0,
          "max": 0,
          "modifiable": false
         },
         "lancer": "libre",
         "vue": true,
         "cible": "soi",
         "parTour": 1,
         "parCible": 0,
         "relance": 0,
         "relanceInitiale": 0,
         "plafondPose": 0,
         "maitre": 10,
         "zone": {
          "forme": "rond",
          "taille": 1,
          "tailleMin": 1,
          "baisse": false
         },
         "touche": "ennemis",
         "effets": [
          {
           "type": "degats",
           "element": "F",
           "min": 17,
           "max": 21,
           "maitre": [
            21,
            26
           ]
          },
          {
           "type": "etat",
           "etat": "brule",
           "tours": 2,
           "couches": 1
          }
         ],
         "texte": "Le chou-fleur mord tout ce qui passe à côté de lui, et sa morsure gratine.",
         "change": ""
        }
       ]
      }
     }
    ],
    "texte": "Une graine de chou-fleur qui a les dents longues. Au tour suivant, il sort de terre et mord tous les ennemis autour de lui ; la morsure brûle. La graine met un tour à sortir : on peut la semer dès le premier tour.",
    "change": ""
   },
   "declinaison": {
    "id": "legumancien.chou-marin",
    "classe": "legumancien",
    "emplacement": 12,
    "declinaisonDe": "legumancien.chou-fleur-carnivore",
    "niveau": 143,
    "nom": "Chou-marin",
    "element": "E",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "caseLibre",
    "parTour": 1,
    "parCible": 0,
    "relance": 4,
    "relanceInitiale": 0,
    "plafondPose": 1,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "pose",
      "quoi": "graine",
      "tours": 1,
      "zone": {
       "forme": "case",
       "taille": 0,
       "tailleMin": 0,
       "baisse": true
      },
      "touche": "ennemis",
      "maitre": 0,
      "effets": [],
      "commis": {
       "nom": "Chou-marin",
       "victuailles": 60,
       "cm": 4,
       "pas": 3,
       "ouverture": 0,
       "rideau": 0,
       "fauxFuyant": 10,
       "comportement": "tire",
       "sorts": [
        {
         "id": "legumancien.torpille-de-chou",
         "classe": "legumancien",
         "declinaisonDe": null,
         "niveau": 143,
         "nom": "Torpille de chou",
         "element": "E",
         "cm": 4,
         "rayon": {
          "min": 2,
          "max": 5,
          "modifiable": false
         },
         "lancer": "libre",
         "vue": true,
         "cible": "ennemi",
         "parTour": 1,
         "parCible": 1,
         "relance": 0,
         "relanceInitiale": 0,
         "plafondPose": 0,
         "maitre": 5,
         "zone": {
          "forme": "case",
          "taille": 0,
          "tailleMin": 0,
          "baisse": true
         },
         "touche": "ennemis",
         "effets": [
          {
           "type": "degats",
           "element": "E",
           "min": 17,
           "max": 21,
           "maitre": [
            21,
            26
           ]
          },
          {
           "type": "retire",
           "quoi": "pas",
           "n": 1
          }
         ],
         "texte": "Une torpille de chou, lancée de loin, qui coupe les jambes : la cible perd 1 Pas.",
         "change": ""
        }
       ]
      }
     }
    ],
    "texte": "Un chou-marin, qui se prend pour un sous-marin : il reste à distance et lance des torpilles de chou qui ralentissent. La graine met un tour à sortir : on peut la semer dès le premier tour.",
    "change": "Le chou qui mord au contact devient un chou-marin, plus fragile, qui reste à distance et tire en Eaudace sur une seule cible : chaque torpille retire 1 Pas."
   }
  },
  {
   "base": {
    "id": "legumancien.patate-chaude",
    "classe": "legumancien",
    "emplacement": 13,
    "declinaisonDe": null,
    "niveau": 151,
    "nom": "Patate chaude",
    "element": "F",
    "cm": 4,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 20,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "F",
      "min": 22,
      "max": 27,
      "maitre": [
       28,
       34
      ]
     },
     {
      "type": "etat",
      "etat": "brule",
      "tours": 2,
      "couches": 1
     }
    ],
    "texte": "Une patate brûlante que personne ne veut garder : elle colle à la cible et la brûle encore 2 tours.",
    "change": ""
   },
   "declinaison": {
    "id": "legumancien.pommes-soufflees",
    "classe": "legumancien",
    "emplacement": 13,
    "declinaisonDe": "legumancien.patate-chaude",
    "niveau": 159,
    "nom": "Pommes soufflées",
    "element": "S",
    "cm": 4,
    "rayon": {
     "min": 2,
     "max": 5,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "case",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "croix",
     "taille": 2,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 18,
      "max": 22,
      "maitre": [
       23,
       28
      ]
     }
    ],
    "texte": "Les pommes de terre gonflent comme des ballons, puis éclatent toutes ensemble.",
    "change": "La patate ne vise plus une seule cible : les pommes soufflées éclatent sur une grande croix, en Soufflé, sans Brûlé."
   }
  },
  {
   "base": {
    "id": "legumancien.epouvantail",
    "classe": "legumancien",
    "emplacement": 14,
    "declinaisonDe": null,
    "niveau": 167,
    "nom": "Épouvantail",
    "element": "T",
    "cm": 3,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "caseLibre",
    "parTour": 1,
    "parCible": 0,
    "relance": 3,
    "relanceInitiale": 0,
    "plafondPose": 1,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "pose",
      "quoi": "ustensile",
      "nom": "Épouvantail",
      "victuailles": 120,
      "tours": 3,
      "zone": {
       "forme": "rond",
       "taille": 2,
       "tailleMin": 1,
       "baisse": false
      },
      "touche": "ennemis",
      "maitre": 0,
      "effets": [
       {
        "type": "pousse",
        "cases": 1
       }
      ]
     }
    ],
    "texte": "Un épouvantail aux haillons qui claquent : au début de chacun de tes tours, les ennemis à 2 cases ou moins de lui reculent d'une case. Contre un obstacle, ils s'écrasent. Un seul à la fois.",
    "change": ""
   },
   "declinaison": {
    "id": "legumancien.epouvantonnerre",
    "classe": "legumancien",
    "emplacement": 14,
    "declinaisonDe": "legumancien.epouvantail",
    "niveau": 175,
    "nom": "Épouvantonnerre",
    "element": "C",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 3,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "caseLibre",
    "parTour": 1,
    "parCible": 0,
    "relance": 3,
    "relanceInitiale": 0,
    "plafondPose": 1,
    "maitre": 0,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "pose",
      "quoi": "ustensile",
      "nom": "Épouvantonnerre",
      "victuailles": 100,
      "tours": 2,
      "zone": {
       "forme": "rond",
       "taille": 2,
       "tailleMin": 1,
       "baisse": true
      },
      "touche": "ennemis",
      "maitre": 10,
      "effets": [
       {
        "type": "degats",
        "element": "C",
        "min": 13,
        "max": 16,
        "maitre": [
         16,
         20
        ]
       },
       {
        "type": "rebond",
        "fois": 1,
        "rayon": 2,
        "part": 50
       }
      ]
     }
    ],
    "texte": "Un épouvantail paratonnerre : pendant 2 tours, la foudre tombe sur les ennemis à 2 cases ou moins de lui, puis saute sur un ennemi proche. Un seul à la fois.",
    "change": "L'épouvantail ne fait plus reculer : il sert de paratonnerre, et pendant 2 tours la foudre frappe en Éclair les ennemis à 2 cases ou moins de lui, avec un rebond."
   }
  },
  {
   "base": {
    "id": "legumancien.celeri-branche",
    "classe": "legumancien",
    "emplacement": 15,
    "declinaisonDe": null,
    "niveau": 182,
    "nom": "Céleri branché",
    "element": "C",
    "cm": 4,
    "rayon": {
     "min": 2,
     "max": 6,
     "modifiable": true
    },
    "lancer": "libre",
    "vue": true,
    "cible": "ennemi",
    "parTour": 1,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "case",
     "taille": 0,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "C",
      "min": 24,
      "max": 28,
      "maitre": [
       30,
       35
      ]
     },
     {
      "type": "bonus",
      "carac": "pas",
      "valeur": 2,
      "tours": 1,
      "qui": "soi"
     }
    ],
    "texte": "Une branche de céleri branchée sur l'orage : la décharge part, et la célérité te donne 2 Pas pour ce tour.",
    "change": ""
   },
   "declinaison": {
    "id": "legumancien.jus-de-celeri",
    "classe": "legumancien",
    "emplacement": 15,
    "declinaisonDe": "legumancien.celeri-branche",
    "niveau": 190,
    "nom": "Jus de céleri",
    "element": "E",
    "cm": 4,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": true
    },
    "lancer": "ligne",
    "vue": true,
    "cible": "case",
    "parTour": 2,
    "parCible": 1,
    "relance": 0,
    "relanceInitiale": 0,
    "plafondPose": 0,
    "maitre": 5,
    "zone": {
     "forme": "ligne",
     "taille": 4,
     "tailleMin": 0,
     "baisse": true
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "E",
      "min": 20,
      "max": 23,
      "maitre": [
       25,
       29
      ]
     },
     {
      "type": "etat",
      "etat": "ramolli",
      "tours": 1,
      "couches": 1
     }
    ],
    "texte": "Une branche de céleri pressée d'un coup : le jus gicle sur toute la ligne et colle aux pieds.",
    "change": "Le céleri ne donne plus de Pas : pressé d'un coup, son jus traverse une ligne de 5 cases en Eaudace et ramollit les ennemis."
   }
  },
  {
   "base": {
    "id": "legumancien.chef-d-oeuvre-la-grande-recolte",
    "classe": "legumancien",
    "emplacement": 16,
    "declinaisonDe": null,
    "niveau": 200,
    "nom": "Chef-d'œuvre : la Grande Récolte",
    "element": "T",
    "cm": 7,
    "rayon": {
     "min": 0,
     "max": 0,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "soi",
    "parTour": 1,
    "parCible": 0,
    "relance": 5,
    "relanceInitiale": 2,
    "plafondPose": 0,
    "maitre": 10,
    "zone": {
     "forme": "terrain",
     "taille": 0,
     "tailleMin": 0,
     "baisse": false
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "T",
      "min": 30,
      "max": 36,
      "maitre": [
       38,
       45
      ]
     },
     {
      "type": "pousse",
      "cases": 1
     }
    ],
    "texte": "Tout le potager sort de terre d'un coup : le sol se soulève sous chaque ennemi et le repousse d'une case loin de toi. Celui qui bute contre un de tes légumes s'écrase.",
    "change": ""
   },
   "declinaison": {
    "id": "legumancien.chef-d-oeuvre-qui-seme-le-vent",
    "classe": "legumancien",
    "emplacement": 16,
    "declinaisonDe": "legumancien.chef-d-oeuvre-la-grande-recolte",
    "niveau": 200,
    "nom": "Chef-d'œuvre : Qui sème le vent",
    "element": "S",
    "cm": 7,
    "rayon": {
     "min": 1,
     "max": 4,
     "modifiable": false
    },
    "lancer": "libre",
    "vue": false,
    "cible": "caseLibre",
    "parTour": 1,
    "parCible": 0,
    "relance": 5,
    "relanceInitiale": 2,
    "plafondPose": 1,
    "maitre": 10,
    "zone": {
     "forme": "terrain",
     "taille": 0,
     "tailleMin": 0,
     "baisse": false
    },
    "touche": "ennemis",
    "effets": [
     {
      "type": "degats",
      "element": "S",
      "min": 26,
      "max": 32,
      "maitre": [
       33,
       40
      ]
     },
     {
      "type": "pose",
      "quoi": "graine",
      "tours": 1,
      "zone": {
       "forme": "case",
       "taille": 0,
       "tailleMin": 0,
       "baisse": true
      },
      "touche": "ennemis",
      "maitre": 0,
      "effets": [],
      "commis": {
       "nom": "Pissenlit géant",
       "victuailles": 100,
       "cm": 4,
       "pas": 3,
       "ouverture": 0,
       "rideau": 0,
       "fauxFuyant": 10,
       "comportement": "tire",
       "sorts": [
        {
         "id": "legumancien.vol-d-aigrettes",
         "classe": "legumancien",
         "declinaisonDe": null,
         "niveau": 200,
         "nom": "Vol d'aigrettes",
         "element": "S",
         "cm": 4,
         "rayon": {
          "min": 2,
          "max": 5,
          "modifiable": false
         },
         "lancer": "libre",
         "vue": true,
         "cible": "case",
         "parTour": 1,
         "parCible": 1,
         "relance": 0,
         "relanceInitiale": 0,
         "plafondPose": 0,
         "maitre": 5,
         "zone": {
          "forme": "rond",
          "taille": 1,
          "tailleMin": 0,
          "baisse": true
         },
         "touche": "ennemis",
         "effets": [
          {
           "type": "degats",
           "element": "S",
           "min": 15,
           "max": 19,
           "maitre": [
            19,
            24
           ]
          }
         ],
         "texte": "Le Pissenlit géant secoue sa tête : une nuée d'aigrettes pique les ennemis d'une petite zone.",
         "change": ""
        }
       ]
      }
     }
    ],
    "texte": "Qui sème le vent récolte la tempête : le vent frappe tous les ennemis et sème une graine sur la case visée. Au tour suivant, un Pissenlit géant en sort, s'il te reste une place de Commis.",
    "change": "La Grande Récolte repousse tous les ennemis loin de toi ; celui-ci frappe un peu moins fort, en Soufflé, ne repousse personne, mais sème un Pissenlit géant qui sort de terre au tour suivant."
   }
  }
 ]
};
if (typeof module === 'object' && module.exports) module.exports = ORVANE.GRIMOIRE;
