/*
 * Orvane : le « Coup d'outil » de chaque classe (rapport, partie 2, point 15) et la fiche du Pain de route.
 * Navigateur : ORVANE.Outils ; node : require('./outils.js').
 * Format du contrat (§3) ; emplacement 0 ; l'élément suit l'outil (jamais N : il fait des dégâts) ;
 * 3 à 5 CM, une fois par tour (Couteau : deux), parCible 0 (barème §3.10).
 * L'outil vient du champ « outil » de donnees.js.
 */
(function (racine, fabrique) {
  var O = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = O;
  else { racine.ORVANE = racine.ORVANE || {}; racine.ORVANE.Outils = O; }
}(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function () {
  'use strict';

  function outil(classe, o) {
    return Object.assign({
      id: classe + '.coup-d-outil', classe: classe, emplacement: 0, declinaisonDe: null, niveau: 1,
      nom: 'Coup d\'outil', lancer: 'libre', vue: true, cible: 'combattant',
      parTour: 1, parCible: 0, relance: 0, relanceInitiale: 0, plafondPose: 0, maitre: 10,
      zone: { forme: 'case', taille: 0, tailleMin: 0, baisse: true }, touche: 'ennemis', change: ''
    }, o);
  }

  var OUTILS = {
    levainqueur: outil('levainqueur', {
      outil: 'Rouleau de chêne', element: 'T', cm: 4, rayon: { min: 1, max: 1, modifiable: false }, cible: 'case',
      zone: { forme: 'travers', taille: 1, tailleMin: 0, baisse: true },
      effets: [{ type: 'degats', element: 'T', min: 13, max: 16, maitre: [16, 20] }],
      texte: 'On étale la pâte d\'un grand geste : trois cases en travers.'
    }),
    patissorcier: outil('patissorcier', {
      outil: 'Fouet d\'argent', element: 'S', cm: 4, rayon: { min: 1, max: 2, modifiable: false }, cible: 'case',
      zone: { forme: 'croix', taille: 1, tailleMin: 0, baisse: true },
      effets: [{ type: 'degats', element: 'S', min: 11, max: 14, maitre: [14, 18] }],
      texte: 'Un tour de fouet qui fait mousser l\'air en croix.'
    }),
    bouchevalier: outil('bouchevalier', {
      outil: 'Couperet', element: 'F', cm: 4, rayon: { min: 1, max: 1, modifiable: false }, maitre: 25,
      // « gros coup de maître » (point 15) : le taux de 25 % (le plafond d'un sort), avec la fourchette maître habituelle
      // d'environ + 25 % (partie 3.11), et non une fourchette à + 55 %
      effets: [{ type: 'degats', element: 'F', min: 17, max: 22, maitre: [21, 28] }],
      texte: 'Un seul coup, net, et parfois le geste parfait.'
    }),
    pateladin: outil('pateladin', {
      outil: 'Saucisson sec ferré', element: 'C', cm: 4, rayon: { min: 1, max: 1, modifiable: false }, lancer: 'ligne', cible: 'case',
      zone: { forme: 'ligne', taille: 1, tailleMin: 0, baisse: true },
      effets: [{ type: 'degats', element: 'C', min: 14, max: 17, maitre: [18, 21] }],
      texte: 'Une estocade de saucisson ferré qui traverse deux cases.'
    }),
    fromagicien: outil('fromagicien', {
      outil: 'Bâton-tranche-meule', element: 'T', cm: 4, rayon: { min: 1, max: 2, modifiable: false },
      effets: [{ type: 'degats', element: 'T', min: 14, max: 18, maitre: [18, 23] }, { type: 'pousse', cases: 1 }],
      texte: 'Le plat du bâton, comme on tranche une meule : la cible recule.'
    }),
    merlanceur: outil('merlanceur', {
      outil: 'Harpon', element: 'E', cm: 4, rayon: { min: 2, max: 5, modifiable: false },
      effets: [{ type: 'degats', element: 'E', min: 14, max: 18, maitre: [18, 23] }],
      texte: 'Le harpon file droit, de loin.'
    }),
    traitreur: outil('traitreur', {
      outil: 'Couteau à beurre affûté', element: 'C', cm: 3, rayon: { min: 1, max: 1, modifiable: false }, parTour: 2, maitre: 15,
      effets: [{ type: 'degats', element: 'C', min: 10, max: 13, maitre: [13, 16] }],
      texte: 'Deux coups vifs : le beurre, puis la tartine.'
    }),
    // Sécateur : « 2 cases côte à côte » (point 15) ; la liste fermée des formes (contrat §3) n'a pas de paire perpendiculaire
    // à l'axe (« travers » donne 3, 5, 7 cases) : c'est donc, comme le Saucisson, la case visée et celle de derrière (à faire valider).
    legumancien: outil('legumancien', {
      outil: 'Sécateur', element: 'S', cm: 4, rayon: { min: 1, max: 1, modifiable: false }, cible: 'case',
      zone: { forme: 'ligne', taille: 1, tailleMin: 0, baisse: true },
      effets: [{ type: 'degats', element: 'S', min: 14, max: 17, maitre: [18, 21] }],
      texte: 'Clac ! Deux cases côte à côte, comme deux tiges d\'un coup.'
    })
  };

  // Le Pain de route (contrat, décision 3) : objet du Sac. Le moteur lit ses valeurs dans Regles.CONST.PAIN_DE_ROUTE.
  var PAIN_DE_ROUTE = {
    id: 'sac.pain-de-route', nom: 'Pain de route', type: 'objet', cm: 2, parTour: 1, parCombat: 3,
    soin: { base: 12, facteurNiveau: 2, diviseurNiveau: 10, formule: '12 + 2 × niveau / 10, arrondi à l\'inférieur' },
    texte: 'Une miche serrée au fond du Sac : de quoi tenir jusqu\'au prochain four.'
  };

  function copie(o) { return JSON.parse(JSON.stringify(o)); }
  return {
    OUTILS: OUTILS, PAIN_DE_ROUTE: PAIN_DE_ROUTE,
    pour: function (classe) { if (!OUTILS[classe]) throw new Error('Classe sans outil : ' + classe); return copie(OUTILS[classe]); },
    tous: function () { return Object.keys(OUTILS).map(function (k) { return copie(OUTILS[k]); }); }
  };
}));
