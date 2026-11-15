/*
 * Orvane : sorts d'essai du moteur, au format du contrat (§3).
 * Ce ne sont PAS les sorts du jeu (un autre travail les réécrit) : ils servent aux tests et à la simulation.
 * Les trois exemples de la partie 4 du rapport (Mie-raille, Four à pain, Coup de jarret) sont repris,
 * corrigés par le contrat : touche « ennemis », niveaux fixes de la décision 9, pose au format du §3.
 * Navigateur : ORVANE.SORTS_ESSAI ; node : require('./sorts-essai.js') (un tableau).
 */
(function (racine, fabrique) {
  var S = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = S;
  else { racine.ORVANE = racine.ORVANE || {}; racine.ORVANE.SORTS_ESSAI = S; }
}(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function () {
  'use strict';
  function sort(o) {
    return Object.assign({
      declinaisonDe: null, lancer: 'libre', vue: true, cible: 'combattant',
      parTour: 0, parCible: 0, relance: 0, relanceInitiale: 0, plafondPose: 0, maitre: 0,
      zone: { forme: 'case', taille: 0, tailleMin: 0, baisse: true }, touche: 'ennemis', texte: '', change: ''
    }, o);
  }
  return [
    // ---- Levainqueur : emplacements 1 à 3 et leurs déclinaisons (niveaux 1/3, 1/5, 1/7) ----
    sort({
      id: 'levainqueur.coup-de-petrin', classe: 'levainqueur', emplacement: 1, niveau: 1, nom: 'Coup de pétrin', element: 'T', cm: 3,
      rayon: { min: 1, max: 1, modifiable: false }, cible: 'ennemi', parTour: 2, parCible: 1, maitre: 10,
      effets: [{ type: 'degats', element: 'T', min: 18, max: 22, maitre: [23, 28] }],
      texte: 'Les pognes s\'abattent comme sur la pâte.'
    }),
    sort({
      id: 'levainqueur.petrin-pousse', classe: 'levainqueur', emplacement: 1, declinaisonDe: 'levainqueur.coup-de-petrin', niveau: 3,
      nom: 'Pétrin poussé', element: 'T', cm: 3, rayon: { min: 1, max: 1, modifiable: false }, cible: 'ennemi', parTour: 2, parCible: 1, maitre: 10,
      effets: [{ type: 'degats', element: 'T', min: 14, max: 17, maitre: [18, 21] }, { type: 'pousse', cases: 2 }],
      texte: 'On repousse la pâte au fond du pétrin.', change: 'Moins de dégâts, mais repousse de 2 cases.'
    }),
    sort({
      id: 'levainqueur.mie-raille', classe: 'levainqueur', emplacement: 2, niveau: 1, nom: 'Mie-raille', element: 'F', cm: 2,
      rayon: { min: 2, max: 6, modifiable: true }, parTour: 3, parCible: 2, maitre: 10,
      effets: [{ type: 'degats', element: 'F', min: 10, max: 14, maitre: [13, 17] }],
      texte: 'Une volée de miettes brûlantes.'
    }),
    sort({
      id: 'levainqueur.mie-trempee', classe: 'levainqueur', emplacement: 2, declinaisonDe: 'levainqueur.mie-raille', niveau: 5,
      nom: 'Mie trempée', element: 'E', cm: 2, rayon: { min: 2, max: 5, modifiable: true }, parTour: 2, parCible: 1, maitre: 5,
      effets: [{ type: 'degats', element: 'E', min: 8, max: 10, maitre: [10, 13] }, { type: 'retire', quoi: 'pas', n: 1 }],
      texte: 'La mie trempée colle aux pieds.', change: 'Eaudace, moins de dégâts, retire 1 Pas.'
    }),
    sort({
      id: 'levainqueur.petite-fournee', classe: 'levainqueur', emplacement: 3, niveau: 1, nom: 'Petite fournée', element: 'F', cm: 3,
      rayon: { min: 1, max: 4, modifiable: false }, vue: false, cible: 'caseLibre', parTour: 2, plafondPose: 3,
      effets: [{ type: 'pose', quoi: 'fournee', tours: 1, zone: { forme: 'croix', taille: 1, tailleMin: 0, baisse: true }, touche: 'ennemis', maitre: 10,
        effets: [{ type: 'degats', element: 'F', min: 14, max: 18, maitre: [18, 22] }] }],
      texte: 'Un petit pâton enfourné à même le sol : il éclate au tour suivant.'
    }),
    sort({
      id: 'levainqueur.croute-que-croute', classe: 'levainqueur', emplacement: 3, declinaisonDe: 'levainqueur.petite-fournee', niveau: 7,
      nom: 'Croûte que croûte', element: 'N', cm: 2, rayon: { min: 1, max: 3, modifiable: false }, cible: 'caseLibre', parTour: 1, relance: 2,
      effets: [{ type: 'bond' }],
      texte: 'Coûte que coûte, on bondit.', change: 'Un bond à la place de la fournée.'
    }),
    // ---- Exemple 2 du rapport : Four à pain (emplacement 7, niveau 57 d'après la décision 9) ----
    sort({
      id: 'levainqueur.four-a-pain', classe: 'levainqueur', emplacement: 7, niveau: 57, nom: 'Four à pain', element: 'F', cm: 4,
      rayon: { min: 1, max: 3, modifiable: false }, vue: false, cible: 'caseLibre', parTour: 1, relance: 2, plafondPose: 2,
      effets: [{ type: 'pose', quoi: 'fournee', victuailles: 30, tours: 2, zone: { forme: 'rond', taille: 1, tailleMin: 0, baisse: true }, touche: 'ennemis', maitre: 15,
        effets: [{ type: 'degats', element: 'F', min: 30, max: 36, maitre: [37, 45] }] }],
      texte: 'Enfourne un four qui cuit 2 tours puis éclate.'
    }),
    // ---- Exemple 3 du rapport : Coup de jarret (Bouchevalier, emplacement 10, niveau 104 d'après la décision 9) ----
    sort({
      id: 'bouchevalier.coup-de-jarret', classe: 'bouchevalier', emplacement: 10, niveau: 104, nom: 'Coup de jarret', element: 'S', cm: 3,
      rayon: { min: 1, max: 1, modifiable: false }, cible: 'ennemi', parTour: 2, parCible: 1, maitre: 15,
      effets: [{ type: 'degats', element: 'S', min: 16, max: 20, maitre: [20, 25] }, { type: 'pousse', cases: 2 }],
      texte: 'Un coup sec dans le jarret, et l\'ennemi recule.'
    }),
    // ---- Quelques mécaniques de classe, pour essayer le format ----
    sort({
      id: 'patissorcier.glacage', classe: 'patissorcier', emplacement: 1, niveau: 1, nom: 'Glaçage', element: 'N', cm: 2,
      rayon: { min: 0, max: 4, modifiable: false }, cible: 'allie', touche: 'allies', parTour: 1, parCible: 1, relance: 2,
      effets: [{ type: 'bouclier', valeur: 20, tours: 2, couchesMax: 3 }, { type: 'etat', etat: 'nappe', tours: 2, couches: 1 }],
      texte: 'Une couche de sucre glace qui encaisse à la place.'
    }),
    sort({
      id: 'traitreur.amuse-bouche', classe: 'traitreur', emplacement: 3, niveau: 1, nom: 'Amuse-bouche', element: 'T', cm: 2,
      rayon: { min: 1, max: 4, modifiable: false }, vue: false, cible: 'caseLibre', parTour: 2, plafondPose: 3,
      effets: [{ type: 'pose', quoi: 'piege', zone: { forme: 'case' }, touche: 'ennemis', maitre: 10,
        effets: [{ type: 'degats', element: 'T', min: 12, max: 15, maitre: [15, 19] }] }],
      texte: 'Un petit four posé là, qui croque celui qui marche dessus.'
    }),
    sort({
      id: 'legumancien.radis', classe: 'legumancien', emplacement: 2, niveau: 1, nom: 'Radis', element: 'T', cm: 3,
      rayon: { min: 1, max: 2, modifiable: false }, vue: false, cible: 'caseLibre', parTour: 1, relance: 4, relanceInitiale: 1, plafondPose: 1,
      effets: [{ type: 'pose', quoi: 'graine', tours: 1, commis: { nom: 'Radis', victuailles: 20, cm: 3, pas: 3, ouverture: 0, rideau: 3, fauxFuyant: 3,
        sorts: [{ id: 'radis.croque', nom: 'Croque', element: 'T', cm: 3, rayon: { min: 1, max: 1 }, cible: 'ennemi', parTour: 1, parCible: 1, maitre: 5,
          effets: [{ type: 'degats', element: 'T', min: 6, max: 8, maitre: [8, 10] }] }] } }],
      texte: 'Une graine plantée sort de terre au tour suivant.'
    })
  ];
}));
