/*
 * Orvane : les monstres du Fourneau (fiches au format du contrat) et la carte de combat du Fourneau.
 * Navigateur : ORVANE.Monstres ; node : require('./monstres.js').
 * Valeurs de départ de la partie 3.22 du rapport (Grumeau, Mie-tron) ; le Grumeau chef est nouveau.
 */
(function (racine, fabrique) {
  var M = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = M;
  else { racine.ORVANE = racine.ORVANE || {}; racine.ORVANE.Monstres = M; }
}(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function () {
  'use strict';

  function sort(o) {
    return Object.assign({
      classe: null, emplacement: null, declinaisonDe: null, niveau: 1,
      rayon: { min: 1, max: 1, modifiable: false }, lancer: 'libre', vue: true, cible: 'ennemi',
      parTour: 0, parCible: 0, relance: 0, relanceInitiale: 0, plafondPose: 0, maitre: 0,
      zone: { forme: 'case', taille: 0, tailleMin: 0, baisse: true }, touche: 'ennemis', effets: [], texte: '', change: ''
    }, o);
  }

  // Sorts partagés
  var PATE_COLLANTE = sort({
    id: 'grumeau.pate-collante', nom: 'Pâte collante', element: 'E', cm: 2,
    rayon: { min: 1, max: 2, modifiable: false }, parTour: 1, parCible: 1, relance: 2,
    effets: [{ type: 'etat', etat: 'ramolli', tours: 1, couches: 1 }],
    texte: 'Une boulette de pâte crue qui colle aux semelles.'
  });

  var FICHES = {
    grumeau: {
      id: 'grumeau', nom: 'Grumeau', niveau: 2, chef: false, taille: 1,
      victuailles: 34, cm: 4, pas: 3, ouverture: 80, rideau: 5, fauxFuyant: 0,
      conservation: { F: -20, E: 30 }, comportement: 'colle',
      sorts: [
        sort({
          id: 'grumeau.coup-de-pate', nom: 'Coup de pâte', element: 'T', cm: 3,
          rayon: { min: 1, max: 1, modifiable: false }, parTour: 1, parCible: 1, maitre: 5,
          effets: [{ type: 'degats', element: 'T', min: 8, max: 11, maitre: [10, 14] }],
          texte: 'Un gros paquet de pâte qui retombe lourdement.'
        }),
        PATE_COLLANTE
      ],
      xp: 25, ble: 4,
      objets: [{ id: 'pate-crue', nom: 'Pâte crue', taux: 40 }, { id: 'grumeau-seche', nom: 'Grumeau séché', taux: 8 }],
      texte: 'Une boule de pâte mal pétrie qui roule vers tout ce qui bouge. Craint la Flambée.'
    },
    'mie-tron': {
      id: 'mie-tron', nom: 'Mie-tron', niveau: 3, chef: false, taille: 0.9,
      victuailles: 26, cm: 5, pas: 3, ouverture: 130, rideau: 0, fauxFuyant: 8,
      conservation: { T: -20, S: 20 }, comportement: 'tire',
      sorts: [
        sort({
          id: 'mie-tron.miettes', nom: 'Miettes', element: 'F', cm: 2,
          rayon: { min: 2, max: 5, modifiable: false }, cible: 'ennemi', parTour: 2, parCible: 2, maitre: 5,
          effets: [{ type: 'degats', element: 'F', min: 6, max: 9, maitre: [8, 11] }],
          texte: 'Il jette des miettes brûlantes, de loin.'
        }),
        sort({
          id: 'mie-tron.pincee-de-farine', nom: 'Pincée de farine', element: 'N', cm: 3,
          rayon: { min: 1, max: 3, modifiable: false }, parTour: 1, parCible: 1, relance: 3,
          effets: [{ type: 'etat', etat: 'fume', tours: 1 }],
          texte: 'Un nuage de farine dans les yeux : on frappe moins fort.'
        })
      ],
      xp: 35, ble: 5,
      objets: [{ id: 'farine-de-mie', nom: 'Farine de mie', taux: 35 }, { id: 'poussiere-d-etoile', nom: 'Poussière d\'étoile', taux: 12 }],
      texte: 'Un petit apprenti de mie qui tire de loin et file dès qu\'on l\'approche. Craint le Terroir.'
    },
    'grumeau-chef': {
      id: 'grumeau-chef', nom: 'Grumeau chef', niveau: 4, chef: true, taille: 1.35,
      victuailles: 43, cm: 5, pas: 3, ouverture: 90, rideau: 8, fauxFuyant: 2,
      conservation: { F: -15, E: 30, T: 10 }, comportement: 'colle',
      sorts: [
        sort({
          id: 'grumeau-chef.grosse-pate', nom: 'Grosse pâte', element: 'T', cm: 3,
          rayon: { min: 1, max: 1, modifiable: false }, parTour: 1, parCible: 1, maitre: 5,
          effets: [{ type: 'degats', element: 'T', min: 9, max: 12, maitre: [11, 15] }],
          texte: 'Le chef ne retient pas sa pâte.'
        }),
        sort({
          id: 'grumeau-chef.ecrase-paton', nom: 'Écrase-pâton', element: 'T', cm: 2,
          rayon: { min: 0, max: 0, modifiable: false }, cible: 'soi', parTour: 1, relance: 2, maitre: 5,
          zone: { forme: 'croix', taille: 1, tailleMin: 1, baisse: false },
          effets: [{ type: 'degats', element: 'T', min: 5, max: 7, maitre: [7, 9] }],
          texte: 'Il s\'aplatit d\'un coup : tout ce qui est collé à lui en prend.'
        }),
        PATE_COLLANTE
      ],
      xp: 60, ble: 10,
      objets: [{ id: 'levain-du-chef', nom: 'Levain du chef', taux: 20 }, { id: 'pate-crue', nom: 'Pâte crue', taux: 50 },
        { id: 'grumeau-seche', nom: 'Grumeau séché', taux: 15 }],
      texte: 'Le plus gros des Grumeaux, qui mène sa fournée. Il retient bien au contact.'
    }
  };

  // Les groupes qui errent sur le Fourneau (1 ou 2 monstres ; le premier membre marche en tête).
  var GROUPES = {
    fourneau: [
      { id: 'chef-seul', nom: 'Le chef seul', membres: ['grumeau-chef'] },
      { id: 'mie-et-pate', nom: 'Mie et pâte', membres: ['grumeau', 'mie-tron'] },
      { id: 'grumeaux', nom: 'Le chef et son pâton', membres: ['grumeau-chef', 'grumeau'] },
      { id: 'le-chef', nom: 'Le chef et son mitron', membres: ['grumeau-chef', 'mie-tron'] }
    ]
  };

  // La carte de combat du Fourneau, pensée pour le portrait (rapport, partie 2, point 16).
  // Avec la projection de l'API (ecranX = (x − y) × L/2, ecranY = (x + y) × H/2), une grille rectangulaire donne un losange
  // deux fois plus large que haut : le terrain est donc une bande le long de la diagonale x + y, soit à l'écran
  // 9 demi-colonnes (x − y de −4 à 4) sur 27 demi-rangées (x + y de 1 à 27) : environ 275 × 392 px avec des cases de 55 × 28,
  // 118 cases dont 5 décors qui cachent (113 cases de sol). Les monstres partent en haut, les artisans en bas.
  // Chaque jeu de départ mêle des cases dorées exposées (le Mie-tron, qui joue avant, peut tirer dès son premier tour),
  // des cases à l'abri d'un décor et des cases en retrait : le placement compte (voir simule.js --placement=chaque).
  var CARTES = {
    fourneau: {
      id: 'fourneau', nom: 'Le Fourneau',
      lignes: [
        '~~...~~~~~~~~~~~',
        '~.....~~~~~~~~~~',
        '.......~~~~~~~~~',
        '........~~~~~~~~',
        '.........~~~~~~~',
        '~......B.C~~~~~~',
        '~~.........~~~~~',
        '~~~.........~~~~',
        '~~~~...F.L...~~~',
        '~~~~~.........~~',
        '~~~~~~.........~',
        '~~~~~~~.B.......',
        '~~~~~~~~........',
        '~~~~~~~~~.......',
        '~~~~~~~~~~.....~',
        '~~~~~~~~~~~...~~'
      ],
      legende: { B: 'billot', C: 'caisse', F: 'four', L: 'lanterne' },
      departs: [
        { artisans: [[9, 7], [10, 8], [9, 11], [11, 10], [8, 10], [9, 10]], monstres: [[4, 6], [5, 5], [4, 5], [5, 4], [4, 7], [6, 5]] },
        { artisans: [[10, 9], [12, 9], [12, 11], [12, 8], [11, 7], [10, 12]], monstres: [[4, 7], [4, 8], [3, 7], [5, 8], [5, 7], [5, 6]] },
        { artisans: [[9, 10], [9, 12], [11, 12], [8, 12], [7, 11], [12, 10]], monstres: [[7, 4], [8, 4], [7, 3], [8, 5], [6, 6], [6, 5]] }
      ]
    }
  };

  function copie(o) { return JSON.parse(JSON.stringify(o)); }
  function fiche(id) { if (!FICHES[id]) throw new Error('Monstre inconnu : ' + id); return copie(FICHES[id]); }
  function groupe(zone, id) {
    var g = (GROUPES[zone] || []).filter(function (x) { return x.id === id; })[0];
    if (!g) throw new Error('Groupe inconnu : ' + id);
    return g.membres.map(fiche);
  }
  // XP et Blé prévus d'un groupe (pour la fiche qu'on ouvre en touchant le groupe sur la carte).
  function prevision(zone, id) {
    var m = groupe(zone, id), xp = 0, ble = 0, niv = 0;
    m.forEach(function (f) { xp += f.xp; ble += f.ble; niv = Math.max(niv, f.niveau); });
    return { membres: m.map(function (f) { return { id: f.id, nom: f.nom, niveau: f.niveau, chef: f.chef }; }), xp: xp, ble: ble, niveauMax: niv };
  }

  return { FICHES: FICHES, GROUPES: GROUPES, CARTES: CARTES, fiche: fiche, groupe: groupe, prevision: prevision,
    carte: function (id) { return copie(CARTES[id || 'fourneau']); } };
}));
