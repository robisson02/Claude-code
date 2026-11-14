/*
 * Orvane : le moteur de règles de combat.
 *
 * JavaScript pur, sans affichage, sans DOM, sans dépendance.
 *   navigateur : <script src="regles.js"> puis ORVANE.Regles
 *   node       : const Regles = require('./regles.js')
 *
 * Le contrat (CONTRAT.md) fait foi ; les règles détaillées sont la partie 3 du rapport.
 * Tout l'état d'un combat est un objet JSON simple (sérialisable). Les actions le modifient
 * en place et renvoient { ok: true, evenements: [...] } ; une action refusée renvoie
 * { ok: false, raison: "..." } et ne touche pas à l'état. La documentation est dans API.md.
 */
(function (racine, fabrique) {
  var Regles = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = Regles;
  else { racine.ORVANE = racine.ORVANE || {}; racine.ORVANE.Regles = Regles; }
}(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function () {
  'use strict';

  // =====================================================================
  // 1. Constantes (toutes réglables ici)
  // =====================================================================
  var CONST = {
    CM_DEPART: 6, PAS_DEPART: 3, CM_COMPAGNON: 1, NIVEAU_COMPAGNON: 100,
    PLAFONDS: { cm: 11, pas: 6, rayon: 5, commis: 5, coupDeMaitre: 100 },
    CONSERVATION: { artisan: 40, monstre: 100, minimum: -50 },
    VICTUAILLES: { base: 90, parNiveau: 5, parPoint: 2 },
    DEPART: { rideau: 5, fauxFuyant: 5, ouverture: 100, commis: 1, coupDeMaitre: 0 },
    CAPITAL_PAR_NIVEAU: 5,
    PALIERS_AFFINITE: [{ jusqua: 80, cout: 1 }, { jusqua: 160, cout: 2 }, { jusqua: Infinity, cout: 3 }],
    SAVOIR_FAIRE_POINTS: 2,
    // Décision 5 du contrat (validée) : effet secondaire de chaque affinité.
    AFFINITES_SECONDAIRES: {
      T: { carac: 'rideau', par: 10, gain: 1 },
      S: { carac: 'fauxFuyant', par: 10, gain: 1 },
      C: { carac: 'ouverture', par: 1, gain: 2 },
      F: { carac: 'coupDeMaitre', par: 20, gain: 1 },
      E: { carac: 'victuailles', par: 2, gain: 1 }
    },
    MINUTEUR_S: 45,
    // Décision 1 (mise à jour du 14 novembre) : aucun Pas garanti ; à 0 Pas après la perte, on ne sort pas (« Pris dans le Rideau »).
    RIDEAU: { ajoutFauxFuyant: 5, ajoutRideau: 5, facteurRideau: 2, pasGardes: 0 },
    ZONE: { baissePct: 15, baisseMax: 3 },
    ENTAME: { pct: 12.5, maxPct: 50 },
    ECRASEMENT: { base: 12, diviseurNiveau: 4, partHeurte: 0.5 },
    RETRAIT_MAX: { cm: 2, pas: 2 },
    MAITRE_FOURCHETTE: 1.25,
    PAIN_DE_ROUTE: { cm: 2, parTour: 1, parCombat: 3, base: 12, facteurNiveau: 2, diviseurNiveau: 10 },
    RANGS: { ecart2: 50, ecart3: 100, niveauMax: 200, multiplicateur: [1, 1, 1.15, 1.30], baisseRelanceRang3: 1 },
    COMMIS_DIVISEUR_NIVEAU: 120,
    ARTISANS_MAX: 4, ABSENCES_MAX: 3,
    PIEGES_PAR_POSEUR: 3,
    BLESSEE_PCT: 50,
    // max : couches au plus ; cumul : false = reposer l'état remet sa durée sans ajouter de couche (partie 3.16,
    // « sans cumul, sauf mention ») : seule la brique dit combien de couches (Brûlé : couches × 5 par tour).
    ETATS: {
      brule: { max: 3, cumul: false, tours: 2, degats: 5, element: 'F' },
      ramolli: { max: 2, tours: 1 },
      enracine: { max: 1, tours: 1 },
      plante: { max: 1, tours: 1 },
      glissant: { max: 1, tours: 1 },
      derobe: { max: 1, tours: 1 },
      nappe: { max: 3, tours: 2 },
      fume: { max: 1, tours: 1, degatsPct: -15 },
      attendri: { max: 2, tours: 2, conservation: [0, 10, 15] },
      affine: { max: 5, tours: 3 },
      feve: { max: 1, tours: 0 },
      'maree-haute': { max: 1, tours: 0, rayon: 2 },
      'maree-basse': { max: 1, tours: 0, degatsPct: 20 }
    },
    GROUPE_XP: [1, 1, 1.15, 1.35, 1.6],
    ECART_NIVEAU: { seuil: 10, pctParNiveau: 5, minimumPct: 20 },
    DEFAITE_PART_XP: 0.5,
    COMMANDE_BONUS: { min: 25, max: 100 },
    MANCHES_FAIT_MINUTE: 5,
    // IA : poids des dégâts différés d'une pose (la cible peut bouger avant), bonus si la cible tombe, poids du danger.
    // bonusChuteSure : une chute certaine tout de suite passe avant tout le reste (partie 3.22, point 1).
    IA: { bonusChute: 60, bonusChuteSure: 1000, bonusFragile: 6, poidsDanger: { colle: 0.15, tire: 0.45 }, tire: { min: 3, max: 5 },
      poidsPose: { fournee: 0.4, piege: 0.35, nappe: 0.4 } }
  };

  var ELEMENTS = ['F', 'E', 'T', 'S', 'C', 'N'];
  var ETATS = Object.keys(CONST.ETATS);
  var FORMES = ['case', 'croix', 'rond', 'anneau', 'ligne', 'travers', 'cone', 'demi-rond', 'carre', 'terrain'];
  var CIBLES = ['ennemi', 'allie', 'combattant', 'caseLibre', 'case', 'soi'];
  var LANCERS = ['libre', 'ligne', 'diagonale', 'ligne+diagonale'];
  var CARACS_BONUS = ['levure', 'rayon', 'pas', 'cm', 'conservation', 'coupDeMaitre', 'rideau', 'fauxFuyant', 'ouverture', 'degatsPct'];
  var CONDITIONS = ['cibleBlessee', 'dansLeDos', 'auContact', 'cibleAffinee', 'mareeHaute', 'mareeBasse', 'buffetComplet', 'cibleTombe'];
  var CONDITIONS_LANCEUR = { mareeHaute: 1, mareeBasse: 1, buffetComplet: 1 };
  var TYPES_BRIQUES = ['degats', 'soin', 'bouclier', 'pousse', 'attire', 'ramene', 'bond', 'echange', 'dans-le-dos', 'etat',
    'retire', 'bonus', 'gainCM', 'entame', 'rebond', 'renforce', 'si', 'pose', 'invoque'];
  var POSES = ['nappe', 'piege', 'fournee', 'graine', 'ustensile'];
  var CLASSES_SOIN = { patissorcier: 1, pateladin: 1 };

  // Les huit Commandes de la partie 3.21 (difficulte : base du bonus, en %).
  var COMMANDES = {
    'sans-contact': { nom: 'Sans contact', regle: 'Ne jamais finir son tour à côté d\'un ennemi.', difficulte: 40 },
    'fait-minute': { nom: 'Fait minute', regle: 'Gagner avant la fin de la 5e manche.', difficulte: 35 },
    'a-la-chaine': { nom: 'À la chaîne', regle: 'Faire tomber les ennemis dans l\'ordre indiqué.', difficulte: 30, minMonstres: 2 },
    'fait-main': { nom: 'Fait main', regle: 'Chaque ennemi tombe sous un Coup d\'outil.', difficulte: 50 },
    'sans-sel': { nom: 'Sans sel', regle: 'Aucun soin de tout le combat.', difficulte: 30 },
    'plan-de-travail': { nom: 'Sur le plan de travail', regle: 'Au plus 1 Pas par tour.', difficulte: 45 },
    'une-seule-cuisson': { nom: 'Une seule cuisson', regle: 'Ne jamais lancer deux fois le même sort dans un tour.', difficulte: 30 },
    'service-en-salle': { nom: 'Service en salle', regle: 'Ne jamais commencer deux tours de suite sur la même case.', difficulte: 25 }
  };

  // =====================================================================
  // 2. Petits outils
  // =====================================================================
  var DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  function copie(o) { return o === undefined ? undefined : JSON.parse(JSON.stringify(o)); }
  function bas(x) { return Math.floor(x + 1e-9); }
  function arrondi(x) { return Math.floor(x + 0.5 + 1e-9); }
  function signe(v) { return v > 0 ? 1 : (v < 0 ? -1 : 0); }
  function distance(a, b) { return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]); }
  function meme(a, b) { return !!a && !!b && a[0] === b[0] && a[1] === b[1]; }
  function cle(c) { return c[0] + ',' + c[1]; }
  function pluriel(n, mot) { return n + ' ' + mot + (Math.abs(n) > 1 ? 's' : ''); }
  function refus(raison) { return { ok: false, raison: raison }; }
  function reussite(ev) { return { ok: true, evenements: ev }; }
  // Une case est un couple d'entiers [x, y] (une case [2.5, 0] ou ['2', '0'] n'existe pas).
  function estCase(c) { return Array.isArray(c) && c.length === 2 && Number.isInteger(c[0]) && Number.isInteger(c[1]); }
  function prochainId(etat) { etat.compteur = (etat.compteur || 0) + 1; return etat.compteur; }

  // Hasard déterministe (mulberry32) : la graine vit dans etat.alea.
  function graine32(g) {
    if (typeof g === 'number' && isFinite(g)) return g >>> 0;
    var s = String(g === undefined || g === null ? 'orvane' : g), h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function hasard(etat) {
    var t = (etat.alea = ((etat.alea || 0) + 0x6D2B79F5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function entier(etat, a, b) { return a + Math.floor(hasard(etat) * (b - a + 1)); }
  function melanger(etat, liste) {
    var l = liste.slice();
    for (var i = l.length - 1; i > 0; i--) { var j = Math.floor(hasard(etat) * (i + 1)), t = l[i]; l[i] = l[j]; l[j] = t; }
    return l;
  }

  // =====================================================================
  // 3. La carte
  // =====================================================================
  // lignes : '.' sol ; 'a' / 'm' sol + case de départ artisan / monstre (jeu 0) ;
  // '~' ou ' ' vide ; '#' ou toute autre lettre : décor plein (legende[lettre] = nom du décor).
  function preparerCarte(def) {
    if (!def || !Array.isArray(def.lignes) || !def.lignes.length) throw new Error('Carte sans lignes');
    var H = def.lignes.length, W = 0, lignes = [], decors = {}, dA = [], dM = [];
    def.lignes.forEach(function (l) { W = Math.max(W, l.length); });
    for (var y = 0; y < H; y++) {
      var src = def.lignes[y], out = '';
      for (var x = 0; x < W; x++) {
        var ch = src.charAt(x) || '~';
        if (ch === '.') out += '.';
        else if (ch === 'a') { out += '.'; dA.push([x, y]); }
        else if (ch === 'm') { out += '.'; dM.push([x, y]); }
        else if (ch === '~' || ch === ' ') out += '~';
        else { out += '#'; decors[x + ',' + y] = (def.legende && def.legende[ch]) || (ch === '#' ? 'décor' : ch); }
      }
      lignes.push(out);
    }
    var departs = (def.departs && def.departs.length) ? copie(def.departs) : [{ artisans: dA, monstres: dM }];
    return { id: def.id || 'carte', nom: def.nom || 'Carte de combat', largeur: W, hauteur: H, lignes: lignes, decors: decors, departs: departs };
  }
  function terrain(etat, c) {
    var k = etat.carte, x = c && c[0], y = c && c[1];
    if (!Number.isInteger(x) || !Number.isInteger(y)) return 'vide';
    if (y < 0 || y >= k.hauteur || x < 0 || x >= k.largeur) return 'vide';
    var ch = k.lignes[y].charAt(x);
    return ch === '.' ? 'sol' : (ch === '#' ? 'plein' : 'vide');
  }
  function casesSol(etat) {
    var out = [];
    for (var y = 0; y < etat.carte.hauteur; y++) for (var x = 0; x < etat.carte.largeur; x++) if (terrain(etat, [x, y]) === 'sol') out.push([x, y]);
    return out;
  }

  // =====================================================================
  // 4. Combattants
  // =====================================================================
  function tourVide() { return { lances: {}, cibles: {}, pasMarches: 0, pain: 0, caseDebut: null }; }
  function zero5() { return { F: 0, E: 0, T: 0, S: 0, C: 0 }; }
  function nouveauCombattant(o) {
    var aff = zero5(), cons = { F: 0, E: 0, T: 0, S: 0, C: 0, N: 0 };
    if (o.affinites) for (var e in o.affinites) aff[e] = o.affinites[e] || 0;
    if (o.conservation) for (var f in o.conservation) cons[f] = o.conservation[f] || 0;
    return {
      id: o.id, nom: o.nom || o.id, genre: o.genre, camp: o.camp, niveau: o.niveau || 1,
      classe: o.classe || null, fiche: o.fiche || null, maitre: o.maitre || null, objet: o.objet || null,
      controle: o.controle || 'ia', comportement: o.comportement || 'colle', joue: o.joue !== false, chef: !!o.chef,
      case: null, orientation: [1, 0], vivant: true,
      victuailles: o.victuailles, victuaillesMax: o.victuailles, entame: 0,
      cmBase: o.cm || 0, pasBase: o.pas || 0, cm: 0, pas: 0,
      carac: {
        rayon: o.rayon || 0, levure: o.levure || 0, remontant: o.remontant || 0, coupDeMaitre: o.coupDeMaitre || 0,
        ouverture: o.ouverture || 0, rideau: o.rideau || 0, fauxFuyant: o.fauxFuyant || 0, commis: o.commis === undefined ? CONST.DEPART.commis : o.commis,
        ristourne: o.ristourne || 0, savoirFaire: o.savoirFaire || 0
      },
      affinites: aff, conservation: cons, plafondConservation: o.plafondConservation || CONST.CONSERVATION.artisan,
      sorts: [], etats: [], bonus: [], boucliers: [], renforts: [], entameSpeciale: null,
      retraits: { cm: 0, pas: 0 }, attente: { cm: 0, pas: 0 }, cmEnPlus: 0,
      relances: {}, tour: tourVide(), toursJoues: 0, derniereCaseDebut: null, abandon: false,
      pain: o.pain || 0, multDegats: o.multDegats || 1, absences: 0, pret: false,
      xp: o.xp || 0, ble: o.ble || 0, objets: o.objets ? copie(o.objets) : []
    };
  }
  function trouver(etat, id) {
    for (var i = 0; i < etat.combattants.length; i++) if (etat.combattants[i].id === id) return etat.combattants[i];
    return null;
  }
  function etatDe(c, nom) { for (var i = 0; i < c.etats.length; i++) if (c.etats[i].etat === nom) return c.etats[i]; return null; }
  function sommeBonus(c, carac) { var v = 0; c.bonus.forEach(function (b) { if (b.carac === carac) v += b.valeur; }); return v; }
  function caracEff(c, nom) {
    var v = (c.carac[nom] || 0) + sommeBonus(c, nom);
    if (nom === 'rayon' && etatDe(c, 'maree-haute')) v += CONST.ETATS['maree-haute'].rayon;
    return v;
  }
  function conservationEff(c, el) {
    var v = (c.conservation[el] || 0) + sommeBonus(c, 'conservation');
    var a = etatDe(c, 'attendri');
    if (a) v -= CONST.ETATS.attendri.conservation[Math.min(a.couches, CONST.ETATS.attendri.max)];
    return Math.max(CONST.CONSERVATION.minimum, Math.min(c.plafondConservation, v));
  }
  function maxVictuailles(c) { return c.victuaillesMax - c.entame; }
  function bouclierTotal(c) { var t = 0; c.boucliers.forEach(function (b) { t += b.restant; }); return t; }
  function partEntame(c) { return c.entameSpeciale ? Math.min(CONST.ENTAME.maxPct, c.entameSpeciale.part) : CONST.ENTAME.pct; }
  function sortDe(c, sortId) { for (var i = 0; i < c.sorts.length; i++) if (c.sorts[i].id === sortId) return c.sorts[i]; return null; }
  function commisDe(etat, m) { return etat.combattants.filter(function (k) { return k.vivant && k.genre === 'commis' && k.maitre === m.id; }); }
  function piegesDe(etat, m) { return etat.sol.filter(function (o) { return o.quoi === 'piege' && o.poseur === m.id; }); }
  function estCachePour(c, camp) { return c.camp !== camp && !!etatDe(c, 'derobe'); }
  function axe4(de, vers) {
    var dx = vers[0] - de[0], dy = vers[1] - de[1];
    if (!dx && !dy) return null;
    return Math.abs(dx) >= Math.abs(dy) ? [signe(dx), 0] : [0, signe(dy)];
  }
  function orienter(c, vers) { var a = axe4(c.case, vers); if (a) c.orientation = a; }

  // Index des cases occupées : réel (tout) ou vu par un camp (sans les ennemis Dérobés).
  function indexReel(etat) {
    var m = {};
    etat.combattants.forEach(function (c) { if (c.vivant && c.case) m[cle(c.case)] = c; });
    return m;
  }
  function indexVu(etat, camp) {
    var m = {};
    etat.combattants.forEach(function (c) { if (c.vivant && c.case && !estCachePour(c, camp)) m[cle(c.case)] = c; });
    return m;
  }
  function occupantReel(etat, cs) { return indexReel(etat)[cle(cs)] || null; }

  // =====================================================================
  // 5. Caractéristiques dérivées d'un artisan
  // =====================================================================
  function coutAffinite(valeur) {
    var cout = 0, prec = 0;
    for (var i = 0; i < CONST.PALIERS_AFFINITE.length; i++) {
      var p = CONST.PALIERS_AFFINITE[i], n = Math.max(0, Math.min(valeur, p.jusqua) - prec);
      cout += n * p.cout; prec = p.jusqua;
      if (valeur <= p.jusqua) break;
    }
    return cout;
  }
  function deriverArtisan(def) {
    var niv = Math.max(1, Math.min(200, def.niveau || 1));
    var eq = def.equipement || {}, cap = def.capital || {};
    var aff = zero5(), e;
    for (e in aff) aff[e] = (def.affinites && def.affinites[e]) || 0;
    var points = 0;
    for (e in aff) points += coutAffinite(aff[e]);
    points += (cap.victuailles || 0) + (cap.savoirFaire || 0);
    var dispo = CONST.CAPITAL_PAR_NIVEAU * (niv - 1);
    for (e in aff) aff[e] += (eq.affinites && eq.affinites[e]) || 0;
    var s = {
      niveau: niv, affinites: aff,
      victuailles: CONST.VICTUAILLES.base + CONST.VICTUAILLES.parNiveau * niv + CONST.VICTUAILLES.parPoint * (cap.victuailles || 0) + (eq.victuailles || 0),
      cm: Math.min(CONST.PLAFONDS.cm, CONST.CM_DEPART + (niv >= CONST.NIVEAU_COMPAGNON ? CONST.CM_COMPAGNON : 0) + (eq.cm || 0)),
      pas: Math.min(CONST.PLAFONDS.pas, CONST.PAS_DEPART + (eq.pas || 0)),
      rayon: Math.min(CONST.PLAFONDS.rayon, eq.rayon || 0),
      rideau: CONST.DEPART.rideau + (eq.rideau || 0),
      fauxFuyant: CONST.DEPART.fauxFuyant + (eq.fauxFuyant || 0),
      ouverture: CONST.DEPART.ouverture + (eq.ouverture || 0),
      coupDeMaitre: CONST.DEPART.coupDeMaitre + (eq.coupDeMaitre || 0),
      commis: Math.min(CONST.PLAFONDS.commis, CONST.DEPART.commis + (eq.commis || 0)),
      levure: eq.levure || 0, remontant: eq.remontant || 0, ristourne: eq.ristourne || 0,
      savoirFaire: Math.floor((cap.savoirFaire || 0) / CONST.SAVOIR_FAIRE_POINTS) + (eq.savoirFaire || 0),
      conservation: {},
      capital: { disponible: dispo, utilise: points, reste: dispo - points }
    };
    for (e in CONST.AFFINITES_SECONDAIRES) {
      var t = CONST.AFFINITES_SECONDAIRES[e];
      s[t.carac] += Math.floor(aff[e] / t.par) * t.gain;
    }
    ELEMENTS.forEach(function (el) { s.conservation[el] = Math.min(CONST.CONSERVATION.artisan, (eq.conservation && eq.conservation[el]) || 0); });
    return s;
  }

  // =====================================================================
  // 6. Les sorts : normalisation, rangs, vérification
  // =====================================================================
  function normaliserZone(z) {
    var n = Object.assign({ forme: 'case', taille: 0, tailleMin: 0, baisse: true }, z || {});
    if (n.forme === 'case') n.taille = 0;
    return n;
  }
  function normaliserBriques(effets, elementSort) {
    (effets || []).forEach(function (b) {
      if (b.type === 'degats') {
        if (!b.element) b.element = elementSort;
        if (!Array.isArray(b.maitre)) b.maitre = [arrondi(b.min * CONST.MAITRE_FOURCHETTE), arrondi(b.max * CONST.MAITRE_FOURCHETTE)];
      }
      if (b.type === 'soin' && !Array.isArray(b.maitre)) b.maitre = [arrondi(b.min * CONST.MAITRE_FOURCHETTE), arrondi(b.max * CONST.MAITRE_FOURCHETTE)];
      if (b.type === 'si') normaliserBriques(b.effets, elementSort);
      if (b.type === 'pose') {
        b.zone = normaliserZone(b.zone); normaliserBriques(b.effets, elementSort);
        // décision 2 : un objet qui fait des dégâts touche les ennemis, quoi qu'en dise la fiche
        if (aDegatsDirects(b.effets)) b.touche = 'ennemis';
        else if (b.touche !== 'ennemis' && b.touche !== 'allies') { var t = soutienOuAttaque({ effets: b.effets }); if (t) b.touche = t; }
      }
    });
    return effets || [];
  }
  function normaliserSort(s) {
    var n = copie(s);
    n.rayon = Object.assign({ min: 0, max: 0, modifiable: false }, n.rayon || {});
    n.lancer = n.lancer || 'libre';
    n.vue = n.vue !== false;
    n.cible = n.cible || 'combattant';
    ['cm', 'parTour', 'parCible', 'relance', 'relanceInitiale', 'plafondPose', 'maitre'].forEach(function (k) { n[k] = n[k] || 0; });
    if (n.cible === 'soi') { n.rayon.min = 0; n.rayon.max = 0; n.rayon.modifiable = false; }
    n.zone = normaliserZone(n.zone);
    n.element = n.element || 'N';
    n.effets = normaliserBriques(n.effets || [], n.element);
    n.touche = toucheDe(n, n.touche);
    if (n.emplacement === undefined) n.emplacement = null;
    return n;
  }
  // Décision 2 : « ennemis » pour tout sort qui fait des dégâts (imposé, même si la fiche dit autre chose),
  // « allies » pour un sort de soutien. Sans champ touche, le moteur le déduit des briques (voir soutienOuAttaque).
  var ETATS_SOUTIEN = { glissant: 1, derobe: 1, nappe: 1, plante: 1, 'maree-haute': 1, 'maree-basse': 1 };
  function aDegatsDirects(effets) {
    // les dégâts du sort lui-même (et de ses « si ») ; ceux d'un objet posé ou d'un Commis ont leur propre camp visé
    return (effets || []).some(function (b) { return b.type === 'degats' || (b.type === 'si' && aDegatsDirects(b.effets)); });
  }
  function soutienOuAttaque(sort) {
    var attaque = false, soutien = false;
    (function voir(effets) {
      (effets || []).forEach(function (b) {
        if (b.type === 'degats' || b.type === 'pousse' || b.type === 'attire' || b.type === 'retire' || b.type === 'entame' || b.type === 'rebond') attaque = true;
        else if (b.type === 'soin' || b.type === 'bouclier' || b.type === 'ramene' || (b.type === 'bonus' && (b.qui || 'cible') === 'cible')) soutien = true;
        else if (b.type === 'etat') { if (ETATS_SOUTIEN[b.etat]) soutien = true; else attaque = true; }
        else if (b.type === 'si') voir(b.effets);
      });
    })(sort.effets);
    if (attaque && !soutien) return 'ennemis';
    if (soutien && !attaque) return 'allies';
    return null;
  }
  function toucheDe(sort, touche) {
    if (aDegatsDirects(sort.effets)) return 'ennemis';
    if (touche === 'ennemis' || touche === 'allies') return touche;
    var t = soutienOuAttaque(sort);
    if (t) return t;
    return (sort.cible === 'allie' || sort.cible === 'soi') ? 'allies' : 'ennemis';
  }
  function rangSort(niveauSort, niveauArtisan) {
    var R = CONST.RANGS, n = niveauSort || 1;
    if (niveauArtisan >= Math.min(R.niveauMax, n + R.ecart3)) return 3;
    if (niveauArtisan >= Math.min(R.niveauMax, n + R.ecart2)) return 2;
    return 1;
  }
  function multiplierBriques(effets, m) {
    effets.forEach(function (b) {
      if (b.type === 'degats' || b.type === 'soin') {
        b.min = arrondi(b.min * m); b.max = arrondi(b.max * m);
        if (Array.isArray(b.maitre)) b.maitre = [arrondi(b.maitre[0] * m), arrondi(b.maitre[1] * m)];
      }
      if (b.type === 'bouclier') b.valeur = arrondi(b.valeur * m);
      if (b.type === 'si' || b.type === 'pose') multiplierBriques(b.effets || [], m);
      // les sorts d'un Commis (invoqué ou sorti d'une graine) font partie du sort qui l'appelle : même rang
      if ((b.type === 'invoque' || b.type === 'pose') && b.commis && Array.isArray(b.commis.sorts))
        b.commis.sorts.forEach(function (k) { normaliserBriques(k.effets || [], k.element || 'N'); multiplierBriques(k.effets || [], m); });
    });
  }
  function sortAuRang(sort, rang) {
    var n = normaliserSort(sort), m = CONST.RANGS.multiplicateur[rang] || 1;
    n.rang = rang;
    if (m !== 1) multiplierBriques(n.effets, m);
    if (rang >= 3) n.relance = Math.max(0, n.relance - CONST.RANGS.baisseRelanceRang3);
    return n;
  }
  function parcourirBriques(effets, f) {
    (effets || []).forEach(function (b) {
      f(b);
      if (b.type === 'si' || b.type === 'pose') parcourirBriques(b.effets, f);
      if (b.type === 'invoque' && b.commis && b.commis.sorts) b.commis.sorts.forEach(function (s) { parcourirBriques(s.effets, f); });
      if (b.type === 'pose' && b.commis && b.commis.sorts) b.commis.sorts.forEach(function (s) { parcourirBriques(s.effets, f); });
    });
  }
  function contientType(effets, types) {
    var t = false;
    parcourirBriques(effets, function (b) { if (types.indexOf(b.type) >= 0) t = true; });
    return t;
  }
  function familles(sort) {
    var f = {};
    parcourirBriques(sort.effets, function (b) { f[b.type] = true; if (b.type === 'pose') f[b.quoi] = true; if (b.type === 'invoque') f.commis = true; });
    return f;
  }
  function correspond(sort, quoi) {
    if (!sort || !quoi) return false;
    if (quoi === sort.id) return true;
    if (quoi.indexOf('element:') === 0) return sort.element === quoi.slice(8);
    if (quoi.indexOf('famille:') === 0) return !!familles(sort)[quoi.slice(8)];
    return false;
  }
  // Niveaux fixes de la décision 9 : emplacement → [sort de base, déclinaison] (l'emplacement 0 est le Coup d'outil).
  var NIVEAUX_EMPLACEMENTS = { 0: [1, 1], 1: [1, 3], 2: [1, 5], 3: [1, 7], 4: [10, 18], 5: [26, 34], 6: [41, 49], 7: [57, 65], 8: [73, 81],
    9: [88, 96], 10: [104, 112], 11: [120, 128], 12: [135, 143], 13: [151, 159], 14: [167, 175], 15: [182, 190], 16: [200, 200] };
  // Les champs du §3 et leur type (« ?» : peut valoir null).
  var CHAMPS_SORT = { id: 'string', classe: 'string?', emplacement: 'number?', declinaisonDe: 'string?', niveau: 'number', nom: 'string',
    element: 'string', cm: 'number', rayon: 'object', lancer: 'string', vue: 'boolean', cible: 'string', parTour: 'number', parCible: 'number',
    relance: 'number', relanceInitiale: 'number', plafondPose: 'number', maitre: 'number', zone: 'object', touche: 'string', effets: 'array',
    texte: 'string', change: 'string' };
  // Les réglages obligatoires de chaque brique (§3).
  var PARAMS_BRIQUES = { degats: ['min', 'max'], soin: ['min', 'max'], bouclier: ['valeur'], pousse: ['cases'], attire: ['cases'], ramene: ['cases'],
    etat: ['etat', 'tours'], retire: ['quoi', 'n'], bonus: ['carac', 'valeur', 'tours', 'qui'], gainCM: ['n'], entame: ['part', 'tours'],
    rebond: ['fois', 'rayon', 'part'], renforce: ['quoi', 'valeur'], si: ['condition', 'effets'], pose: ['quoi'], invoque: ['commis'] };
  // « Mie-raille » → « mie-raille » ; « Coup d'outil » → « coup-d-outil » (minuscules sans accents, tirets).
  function slug(nom) {
    return String(nom || '').toLowerCase().replace(/œ/g, 'oe').replace(/æ/g, 'ae').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  function typeOk(v, t) {
    var nul = t.charAt(t.length - 1) === '?', base = nul ? t.slice(0, -1) : t;
    if (v === null) return nul;
    if (base === 'array') return Array.isArray(v);
    if (base === 'object') return !!v && typeof v === 'object' && !Array.isArray(v);
    return typeof v === base && (base !== 'number' || isFinite(v));
  }
  function entierPositif(v) { return Number.isInteger(v) && v >= 0; }
  // Vérifie un sort contre le contrat (§3 et §4). Renvoie la liste des problèmes (vide si tout va bien).
  // opts.presence === false : seulement les valeurs, pas les champs manquants (c'est ce que fait creerCombat).
  // opts.commis : sort d'un Commis (« au même format, sans emplacement ») ; ses champs manquants ne sont pas signalés.
  function verifierSort(s, opts) {
    opts = opts || {};
    var p = [], nom = (s && (s.id || s.nom)) || '?';
    function pb(m) { p.push(nom + ' : ' + m); }
    if (!s || typeof s !== 'object') return ['sort absent'];
    var presence = opts.presence !== false && !opts.commis;
    ['id', 'nom', 'element', 'cm', 'rayon', 'cible', 'effets'].forEach(function (k) { if (s[k] === undefined) pb('champ manquant « ' + k + ' »'); });
    Object.keys(CHAMPS_SORT).forEach(function (k) {
      if (s[k] === undefined) { if (presence && ['id', 'nom', 'element', 'cm', 'rayon', 'cible', 'effets'].indexOf(k) < 0) pb('champ manquant « ' + k + ' »'); return; }
      if (!typeOk(s[k], CHAMPS_SORT[k])) pb('champ « ' + k + ' » : ' + CHAMPS_SORT[k].replace('?', ' ou null') + ' attendu');
    });
    if (s.element && ELEMENTS.indexOf(s.element) < 0) pb('élément inconnu ' + s.element);
    if (s.cm !== undefined && (s.cm < 1 || s.cm > 7)) pb('coût hors de 1 à 7 CM');
    if (s.cm === 7 && (s.niveau || 0) < 100) pb('7 CM avant le niveau 100');
    if (s.lancer && LANCERS.indexOf(s.lancer) < 0) pb('manière de lancer inconnue ' + s.lancer);
    if (s.cible && CIBLES.indexOf(s.cible) < 0) pb('cible inconnue ' + s.cible);
    if (s.rayon && typeof s.rayon === 'object') {
      if (!entierPositif(s.rayon.min === undefined ? 0 : s.rayon.min) || !entierPositif(s.rayon.max === undefined ? 0 : s.rayon.max)) pb('rayon : min et max entiers, 0 ou plus');
      else if ((s.rayon.min || 0) > (s.rayon.max || 0)) pb('rayon : min > max');
    }
    ['parTour', 'parCible', 'relance', 'relanceInitiale', 'plafondPose'].forEach(function (k) { if (s[k] !== undefined && !entierPositif(s[k])) pb(k + ' : entier, 0 ou plus'); });
    if (s.zone && s.zone.forme && FORMES.indexOf(s.zone.forme) < 0) pb('forme de zone inconnue ' + s.zone.forme);
    if (s.zone && ((s.zone.taille !== undefined && !entierPositif(s.zone.taille)) || (s.zone.tailleMin || 0) > (s.zone.taille || 0) && s.zone.forme !== 'case' && s.zone.forme !== 'terrain')) pb('zone : taille entière, tailleMin ≤ taille');
    if (s.touche && s.touche !== 'ennemis' && s.touche !== 'allies') pb('touche doit valoir « ennemis » ou « allies »');
    // emplacement, niveau (décision 9), id, nom des chefs-d'œuvre
    if (s.classe && !opts.commis) {
      if (!Number.isInteger(s.emplacement) || s.emplacement < 0 || s.emplacement > 16) pb('emplacement : 0 (Coup d\'outil) ou 1 à 16');
      else {
        var nv = NIVEAUX_EMPLACEMENTS[s.emplacement][s.declinaisonDe ? 1 : 0];
        if (s.niveau !== nv) pb('niveau ' + s.niveau + ' : l\'emplacement ' + s.emplacement + (s.declinaisonDe ? ' (déclinaison)' : '') + ' se débloque au niveau ' + nv + ' (décision 9)');
        if (s.emplacement === 16 && String(s.nom || '').indexOf('Chef-d\'œuvre') !== 0) pb('un sort de l\'emplacement 16 s\'appelle « Chef-d\'œuvre … »');
        if (s.emplacement === 0 && s.declinaisonDe) pb('le Coup d\'outil n\'a pas de déclinaison');
      }
      if (typeof s.id === 'string' && s.nom && s.id !== s.classe + '.' + slug(s.nom)) pb('id « ' + s.id + ' » : « ' + s.classe + '.' + slug(s.nom) + ' » attendu (classe + nom sans accents)');
    } else if (presence && typeof s.id === 'string' && s.nom && s.id.slice(s.id.indexOf('.') + 1) !== slug(s.nom)) pb('id « ' + s.id + ' » : « ….' + slug(s.nom) + ' » attendu');
    var aDegats = false, aSoin = false;
    parcourirBriques(s.effets, function (b) {
      if (!b || typeof b !== 'object') { pb('brique absente'); return; }
      if (TYPES_BRIQUES.indexOf(b.type) < 0) { pb('brique inconnue ' + b.type); return; }
      (PARAMS_BRIQUES[b.type] || []).forEach(function (k) { if (b[k] === undefined) pb('brique ' + b.type + ' sans « ' + k + ' »'); });
      if (b.type === 'degats') {
        aDegats = true;
        if (b.element && s.element && b.element !== s.element) pb('brique de dégâts d\'un autre élément que le sort');
        if (b.element === 'N') pb('une brique de dégâts n\'est jamais N');
        if (!(b.min <= b.max)) pb('dégâts min > max');
        if (b.maitre !== undefined && !(Array.isArray(b.maitre) && b.maitre.length === 2 && b.maitre[0] <= b.maitre[1])) pb('maitre des dégâts : [min, max]');
      }
      if (b.type === 'soin') { aSoin = true; if (!(b.min <= b.max)) pb('soin min > max'); }
      if (b.type === 'bouclier' && !(b.valeur > 0)) pb('bouclier : valeur > 0');
      if ((b.type === 'pousse' || b.type === 'attire' || b.type === 'ramene') && b.cases !== undefined && !(Number.isInteger(b.cases) && b.cases >= 1)) pb(b.type + ' : cases entier, 1 ou plus');
      if (b.type === 'etat' && b.etat !== undefined && ETATS.indexOf(b.etat) < 0) pb('état inconnu ' + b.etat);
      if (b.type === 'bonus' && b.carac !== undefined && CARACS_BONUS.indexOf(b.carac) < 0) pb('carac de bonus inconnue ' + b.carac);
      if (b.type === 'bonus' && b.carac === 'ouverture') pb('bonus d\'Ouverture sans effet en combat (l\'ordre de jeu est fixé au début, partie 3.4)');
      if (b.type === 'bonus' && b.qui !== undefined && ['soi', 'allies', 'cible'].indexOf(b.qui) < 0) pb('bonus : qui = soi, allies ou cible');
      if (b.type === 'gainCM' && b.qui !== undefined && ['soi', 'allies'].indexOf(b.qui) < 0) pb('gainCM : qui = soi ou allies');
      if (b.type === 'si' && b.condition !== undefined && CONDITIONS.indexOf(b.condition) < 0) pb('condition inconnue ' + b.condition);
      if (b.type === 'si' && b.condition === 'cibleAffinee' && b.n === undefined) pb('condition cibleAffinee sans « n »');
      if (b.type === 'pose' && b.quoi !== undefined && POSES.indexOf(b.quoi) < 0) pb('pose inconnue ' + b.quoi);
      if (b.type === 'pose' && b.quoi === 'nappe' && b.declenche !== undefined && ['debut', 'entree', 'fin'].indexOf(b.declenche) < 0) pb('nappe : declenche = debut, entree ou fin');
      if (b.type === 'pose' && b.touche !== undefined && b.touche !== 'ennemis' && b.touche !== 'allies') pb('pose : touche doit valoir « ennemis » ou « allies »');
      if (b.type === 'pose' && b.touche === 'allies' && aDegatsDirects(b.effets)) pb('un objet qui fait des dégâts touche les ennemis');
      if (b.type === 'retire' && b.quoi !== undefined && b.quoi !== 'cm' && b.quoi !== 'pas') pb('retrait de « cm » ou « pas » seulement');
      if (b.type === 'invoque' && b.commis && typeof b.commis === 'object') ['nom', 'victuailles', 'cm', 'pas'].forEach(function (k) { if (b.commis[k] === undefined) pb('Commis sans « ' + k + ' »'); });
      var fiche = (b.type === 'invoque' || b.type === 'pose') && b.commis && Array.isArray(b.commis.sorts) ? b.commis.sorts : [];
      fiche.forEach(function (k) { verifierSort(k, { commis: true }).forEach(function (m) { p.push(nom + ' › ' + m); }); });
    });
    if (aDegats) {
      if (s.element === 'N') pb('un sort N ne fait pas de dégâts');
      if ((s.touche || 'ennemis') !== 'ennemis' && aDegatsDirects(s.effets)) pb('un sort qui fait des dégâts touche les ennemis');
      if (!((s.parTour || 0) > 0 || (s.parCible || 0) > 0 || (s.relance || 0) > 0)) pb('sort de dégâts sans aucune limite');
    }
    // décision 2 : un sort de soutien touche les alliés (sinon il ne fait rien : le moteur filtre par camp)
    if (!aDegatsDirects(s.effets) && s.touche === 'ennemis') {
      var genre = soutienOuAttaque(s);
      if (genre === 'allies' || (!genre && (s.cible === 'allie' || s.cible === 'soi') && (!s.zone || !s.zone.forme || s.zone.forme === 'case')))
        pb('un sort de soutien touche les alliés (touche « allies ») : avec « ennemis », il ne fait rien');
    }
    if (aSoin && s.classe && !CLASSES_SOIN[s.classe]) pb('brique soin hors Pâtissorcier et Pâtéladin');
    if (!aDegats && !aSoin && (s.maitre || 0) !== 0) pb('maitre doit valoir 0 sans dégâts ni soin');
    if ((s.maitre || 0) > 25 || (s.maitre || 0) < 0) pb('maitre hors de 0 à 25');
    return p;
  }
  // Les seuils du §4, pour les sorts d'une ou plusieurs classes (le Coup d'outil, emplacement 0, n'y entre pas).
  // Renvoie { ok, problemes: [textes], couverture: { classe: { 34: { F, E, T, S, C }, 81: {…}, 200: {…} } } }.
  function verifierClasse(sorts) {
    var problemes = [], couverture = {}, noms = {}, parClasse = {};
    (sorts || []).forEach(function (s) {
      verifierSort(s).forEach(function (m) { problemes.push(m); });
      if (!s || s.emplacement === 0) return;
      var k = s.nom;
      if (noms[k]) problemes.push('nom « ' + k + ' » en double (' + noms[k] + ' et ' + s.id + ') : les noms sont uniques dans tout le jeu');
      else noms[k] = s.id;
      (parClasse[s.classe] || (parClasse[s.classe] = [])).push(s);
    });
    function elementsDegats(s) {
      var els = {};
      parcourirBriques(s.effets, function (b) { if (b.type === 'degats') els[b.element || s.element] = true; });
      return els;
    }
    Object.keys(parClasse).forEach(function (cl) {
      var liste = parClasse[cl], emp = {};
      liste.forEach(function (s) {
        var e = emp[s.emplacement] || (emp[s.emplacement] = { base: [], decl: [] });
        (s.declinaisonDe ? e.decl : e.base).push(s);
      });
      for (var i = 1; i <= 16; i++) {
        var e = emp[i];
        if (!e || e.base.length !== 1) problemes.push(cl + ' : emplacement ' + i + ' : ' + (e ? e.base.length : 0) + ' sort de base (1 attendu)');
        if (e && e.decl.length > 1) problemes.push(cl + ' : emplacement ' + i + ' : ' + e.decl.length + ' déclinaisons (1 au plus)');
        if (e && e.base.length === 1) e.decl.forEach(function (d) { if (d.declinaisonDe !== e.base[0].id) problemes.push(d.id + ' : declinaisonDe doit valoir « ' + e.base[0].id + ' »'); });
      }
      couverture[cl] = {};
      [34, 81, 200].forEach(function (L) {
        var c = { F: 0, E: 0, T: 0, S: 0, C: 0 };
        Object.keys(emp).forEach(function (i) {
          var offre = {};
          emp[i].base.concat(emp[i].decl).forEach(function (s) { if ((s.niveau || 1) <= L) { var els = elementsDegats(s); for (var x in els) offre[x] = true; } });
          for (var x in offre) if (c[x] !== undefined) c[x]++;
        });
        couverture[cl][L] = c;
        var mini = { 34: 1, 81: 2, 200: 4 }[L];
        Object.keys(c).forEach(function (x) { if (c[x] < mini) problemes.push(cl + ' : au niveau ' + L + ', ' + c[x] + ' emplacement(s) en ' + x + ' (' + mini + ' au moins)'); });
        if (L === 200 && Object.keys(c).filter(function (x) { return c[x] >= 5; }).length < 3) problemes.push(cl + ' : au niveau 200, moins de 3 éléments à 5 emplacements ou plus');
      });
    });
    return { ok: !problemes.length, problemes: problemes, couverture: couverture };
  }

  // =====================================================================
  // 7. Création du combat et Mise en place
  // =====================================================================
  function creerCombat(def) {
    def = def || {};
    var options = Object.assign({ minuteur: true, commande: 'auto', donjon: false, arrivage: 0 }, def.options || {});
    var etat = {
      version: 1, phase: 'miseEnPlace', alea: graine32(def.graine),
      carte: preparerCarte(def.carte), depart: 0, options: options,
      minuteur: { actif: true, duree: CONST.MINUTEUR_S },
      combattants: [], sol: [], frise: [], indexActif: -1, manche: 0, tourNumero: 0, compteur: 0,
      commande: null, chutes: [], resultat: null, avertissements: []
    };
    var nbJeux = etat.carte.departs.length;
    // (le Minuteur est réglé après l'arrivée des artisans : voir regler())
    etat.depart = (typeof options.depart === 'number') ? ((options.depart % nbJeux) + nbJeux) % nbJeux : (options.donjon ? 0 : entier(etat, 0, nbJeux - 1));
    var vus = {};
    function idUnique(base) { var id = base, k = 2; while (vus[id]) id = base + '-' + (k++); vus[id] = true; return id; }

    (def.artisans || []).forEach(function (a) { etat.combattants.push(creerArtisan(etat, a, idUnique(a.id || a.classe || 'artisan'))); });
    etat.combattants.forEach(function (c) { vus[c.id] = true; });
    (def.monstres || []).forEach(function (m) {
      var f = m.fiche || m;
      var c = nouveauCombattant({
        id: idUnique(m.id || f.id || 'monstre'), nom: f.nom, genre: 'monstre', camp: 'monstres', niveau: f.niveau, fiche: f.id,
        victuailles: f.victuailles, cm: f.cm, pas: f.pas, rayon: f.rayon, levure: f.levure, coupDeMaitre: f.coupDeMaitre,
        ouverture: f.ouverture, rideau: f.rideau, fauxFuyant: f.fauxFuyant, commis: f.commis, conservation: f.conservation, affinites: f.affinites,
        plafondConservation: CONST.CONSERVATION.monstre, controle: 'ia', comportement: f.comportement || 'colle', chef: f.chef,
        xp: f.xp, ble: f.ble, objets: f.objets
      });
      c.sorts = (f.sorts || []).map(normaliserSort);
      c.sorts.forEach(function (s) { if (s.relanceInitiale) c.relances[s.id] = s.relanceInitiale; });
      if (estCase(m.case)) c.case = m.case.slice();
      etat.combattants.push(c);
    });

    // Le jeu place les monstres (le chef d'abord).
    var jeu = etat.carte.departs[etat.depart];
    var libres = melanger(etat, (jeu.monstres || []).filter(function (cs) { return terrain(etat, cs) === 'sol'; }));
    var monstres = etat.combattants.filter(function (c) { return c.genre === 'monstre'; });
    var aPlacer = monstres.filter(function (c) { return !c.case; });
    libres = libres.filter(function (cs) { return !monstres.some(function (m) { return meme(m.case, cs); }); });
    aPlacer.sort(function (a, b) { return (b.chef ? 1 : 0) - (a.chef ? 1 : 0); });
    aPlacer.forEach(function (m, i) {
      if (i >= libres.length) throw new Error('Pas assez de cases de départ pour les monstres');
      m.case = libres[i].slice();
    });

    // La Commande : deux tirées au hasard (l'initiateur en choisit une), ou imposée.
    var nbM = monstres.length;
    if (options.commande && options.commande !== 'aucune') {
      var ids = Object.keys(COMMANDES).filter(function (k) { return !COMMANDES[k].minMonstres || nbM >= COMMANDES[k].minMonstres; });
      var prop = COMMANDES[options.commande] ? [options.commande] : melanger(etat, ids).slice(0, options.donjon ? 4 : 2);
      etat.commande = { proposees: prop, choisie: COMMANDES[options.commande] ? options.commande : null, respectee: true, raison: null, bonus: {}, choix: {}, ordre: [], prochain: 0, refusee: false };
    }
    regler(etat);
    return etat;
  }
  // Ce qui dépend du nombre d'artisans, recalculé quand un allié rejoint et au début du combat :
  // le Minuteur (décision 4 : seul le solo peut le couper) et le bonus de chaque Commande proposée (partie 3.21).
  function regler(etat) {
    var nbA = etat.combattants.filter(function (c) { return c.genre === 'artisan'; }).length;
    var nbM = etat.combattants.filter(function (c) { return c.genre === 'monstre'; }).length;
    etat.minuteur.actif = etat.options.minuteur !== false || nbA > 1;
    var k = etat.commande;
    if (k) k.proposees.forEach(function (id) {
      var b = COMMANDES[id].difficulte * Math.sqrt(Math.max(1, nbM) / Math.max(1, nbA));
      k.bonus[id] = Math.max(CONST.COMMANDE_BONUS.min, Math.min(CONST.COMMANDE_BONUS.max, Math.round(b / 5) * 5));
    });
  }
  function creerArtisan(etat, a, id) {
      var st = deriverArtisan(a);
      if (st.capital.reste < 0) throw new Error((a.nom || a.id) + ' : capital dépassé (' + st.capital.utilise + ' points pour ' + st.capital.disponible + ')');
      var c = nouveauCombattant({
        id: id, nom: a.nom, genre: 'artisan', camp: 'artisans', niveau: st.niveau, classe: a.classe,
        victuailles: st.victuailles, cm: st.cm, pas: st.pas, rayon: st.rayon, levure: st.levure, remontant: st.remontant,
        coupDeMaitre: st.coupDeMaitre, ouverture: st.ouverture, rideau: st.rideau, fauxFuyant: st.fauxFuyant, commis: st.commis,
        ristourne: st.ristourne, savoirFaire: st.savoirFaire, affinites: st.affinites, conservation: st.conservation,
        plafondConservation: CONST.CONSERVATION.artisan, controle: a.controle || 'joueur',
        pain: a.painDeRoute === undefined ? CONST.PAIN_DE_ROUTE.parCombat : a.painDeRoute
      });
      var emplacements = {};
      (a.sorts || []).forEach(function (s) {
        if ((s.niveau || 1) > st.niveau) { etat.avertissements.push(c.nom + ' : « ' + s.nom + ' » pas encore débloqué (niveau ' + s.niveau + ')'); return; }
        if (s.emplacement && emplacements[s.emplacement]) { etat.avertissements.push(c.nom + ' : deux sorts pour l\'emplacement ' + s.emplacement + ', « ' + s.nom + ' » ignoré'); return; }
        if (s.emplacement) emplacements[s.emplacement] = true;
        verifierSort(s, { presence: false }).forEach(function (m) { etat.avertissements.push(m); });
        c.sorts.push(sortAuRang(s, rangSort(s.niveau, st.niveau)));
      });
      c.comportement = a.comportement || comportementAuto(c);
      c.sorts.forEach(function (s) { if (s.relanceInitiale) c.relances[s.id] = s.relanceInitiale; });
      if (a.classe === 'merlanceur') c.etats.push({ etat: 'maree-haute', tours: 0, couches: 1, source: c.id });
      if (estCase(a.case)) c.case = a.case.slice();
      return c;
  }
  function comportementAuto(c) {
    // « tire » seulement avec un coup direct à distance (une pose ou un piège ne suffit pas à tenir à distance)
    var loin = c.sorts.some(function (s) { return s.effets.some(function (b) { return b.type === 'degats'; }) && s.rayon.max >= 4; });
    return loin ? 'tire' : 'colle';
  }
  function casesDepartArtisans(etat) { return (etat.carte.departs[etat.depart].artisans || []).filter(function (cs) { return terrain(etat, cs) === 'sol'; }); }

  function placer(etat, id, cs) {
    if (etat.phase !== 'miseEnPlace') return refus('La Mise en place est finie');
    var c = trouver(etat, id);
    if (!c) return refus('Combattant inconnu');
    if (c.genre !== 'artisan') return refus('Seuls les artisans choisissent leur case');
    if (!estCase(cs)) return refus('Case invalide');
    if (!casesDepartArtisans(etat).some(function (k) { return meme(k, cs); })) return refus('Il faut choisir une case de départ dorée');
    var o = occupantReel(etat, cs), ev = [];
    if (o && o.id === c.id) return reussite([]);
    if (o && o.genre !== 'artisan') return refus('Case déjà prise');
    if (o) { o.case = c.case ? c.case.slice() : null; ev.push({ type: 'placement', id: o.id, case: o.case }); }
    c.case = cs.slice();
    ev.push({ type: 'placement', id: c.id, case: c.case.slice() });
    return reussite(ev);
  }
  // Un allié rejoint pendant la Mise en place (il a touché la cloche de service).
  function rejoindre(etat, a) {
    if (etat.phase !== 'miseEnPlace') return refus('On ne rejoint que pendant la Mise en place');
    if (etat.combattants.filter(function (c) { return c.genre === 'artisan'; }).length >= CONST.ARTISANS_MAX) return refus('Le service est complet (' + CONST.ARTISANS_MAX + ' artisans au plus)');
    var base = (a && (a.id || a.classe)) || 'artisan', id = base, k = 2, c;
    while (trouver(etat, id)) id = base + '-' + (k++);
    try { c = creerArtisan(etat, a, id); } catch (e) { return refus(e.message); }
    if (c.case && (occupantReel(etat, c.case) || !casesDepartArtisans(etat).some(function (x) { return meme(x, c.case); }))) c.case = null;
    etat.combattants.push(c);
    if (etat.commande && !etat.commande.choix[id]) etat.commande.choix[id] = 'savoirFaire';
    regler(etat);
    return reussite([{ type: 'rejoint', id: c.id, nom: c.nom, case: c.case }]);
  }
  // « Envoyez ! » : le combat commence quand tous les artisans l'ont touché (en ligne, l'affichage appelle commencer au bout de 30 s).
  function pret(etat, id) {
    if (etat.phase !== 'miseEnPlace') return refus('La Mise en place est finie');
    var c = trouver(etat, id);
    if (!c || c.genre !== 'artisan') return refus('Seul un artisan envoie le service');
    c.pret = true;
    var ev = [{ type: 'pret', id: id }];
    if (etat.combattants.every(function (k) { return k.genre !== 'artisan' || k.pret; })) {
      var r = commencer(etat);
      if (!r.ok) { c.pret = false; return r; }
      ev = ev.concat(r.evenements);
    }
    return reussite(ev);
  }
  function choisirCommande(etat, idc) {
    if (etat.phase !== 'miseEnPlace') return refus('La Commande se choisit pendant la Mise en place');
    if (!etat.commande) return refus('Pas de Commande pour ce combat');
    if (idc !== null && etat.commande.proposees.indexOf(idc) < 0) return refus('Cette Commande n\'est pas proposée');
    etat.commande.choisie = idc;
    etat.commande.refusee = idc === null;
    return reussite([{ type: 'commande', commande: idc, choisie: true }]);
  }
  function choisirBonusCommande(etat, id, quoi) {
    if (etat.phase !== 'miseEnPlace') return refus('Le bonus se choisit pendant la Mise en place');
    if (!etat.commande) return refus('Pas de Commande pour ce combat');
    if (quoi !== 'savoirFaire' && quoi !== 'ristourne') return refus('Bonus « savoirFaire » ou « ristourne »');
    var c = trouver(etat, id);
    if (!c || c.genre !== 'artisan') return refus('Seul un artisan choisit son bonus');
    etat.commande.choix[id] = quoi;
    return reussite([]);
  }

  // L'ordre de jeu : Ouverture moyenne de chaque camp, puis alternance (partie 3.4).
  function calculerFrise(etat) {
    function camp(nom) { return etat.combattants.filter(function (c) { return c.camp === nom && (c.genre === 'artisan' || c.genre === 'monstre') && c.vivant; }); }
    var A = camp('artisans'), M = camp('monstres');
    function moy(l) { if (!l.length) return -Infinity; var s = 0; l.forEach(function (c) { s += caracEff(c, 'ouverture'); }); return s / l.length; }
    var mA = moy(A), mM = moy(M), premier;
    if (mA > mM) premier = 'A'; else if (mM > mA) premier = 'M'; else premier = hasard(etat) < 0.5 ? 'A' : 'M';
    function tri(l) { return l.map(function (c, i) { return { c: c, i: i }; }).sort(function (a, b) { return caracEff(b.c, 'ouverture') - caracEff(a.c, 'ouverture') || a.i - b.i; }).map(function (x) { return x.c.id; }); }
    var X = premier === 'A' ? tri(A) : tri(M), Y = premier === 'A' ? tri(M) : tri(A), out = [];
    for (var i = 0; i < Math.max(X.length, Y.length); i++) { if (i < X.length) out.push(X[i]); if (i < Y.length) out.push(Y[i]); }
    // les Commis déjà présents s'insèrent après leur maître
    etat.combattants.forEach(function (c) { if (c.genre === 'commis' && c.vivant) { var j = out.indexOf(c.maitre); out.splice(j < 0 ? out.length : j + 1, 0, c.id); } });
    return out;
  }

  function commencer(etat) {
    if (etat.phase !== 'miseEnPlace') return refus('Le combat a déjà commencé');
    var artisans = etat.combattants.filter(function (c) { return c.genre === 'artisan'; });
    if (!artisans.length) return refus('Aucun artisan');
    if (!etat.combattants.some(function (c) { return c.genre === 'monstre'; })) return refus('Aucun monstre');
    var libres = casesDepartArtisans(etat).filter(function (cs) { return !occupantReel(etat, cs); });
    var aPlacer = artisans.filter(function (c) { return !c.case; });
    if (aPlacer.length > libres.length) return refus('Plus de case de départ libre');
    var ev = [];
    aPlacer.forEach(function (c, i) { c.case = libres[i].slice(); ev.push({ type: 'placement', id: c.id, case: c.case.slice() }); });
    etat.combattants.forEach(function (c) {
      var e = plusProche(etat, c, c.case, Infinity, {}, true);
      if (e) orienter(c, e.case);
    });
    regler(etat);
    etat.frise = calculerFrise(etat);
    etat.phase = 'combat';
    var k = etat.commande;
    // L'initiateur choisit une Commande (partie 3.21) : s'il ne l'a pas fait, la première proposée est prise ;
    // choisirCommande(etat, null) pendant la Mise en place reste le moyen explicite de s'en passer.
    if (k && !k.choisie && !k.refusee && k.proposees.length) k.choisie = k.proposees[0];
    if (k && k.choisie === 'a-la-chaine') k.ordre = melanger(etat, etat.combattants.filter(function (c) { return c.genre === 'monstre'; }).map(function (c) { return c.id; }));
    if (k) artisans.forEach(function (a) { if (!k.choix[a.id]) k.choix[a.id] = 'savoirFaire'; });
    ev.push({ type: 'debut', frise: etat.frise.slice(), depart: etat.depart,
      commande: k && k.choisie ? { id: k.choisie, nom: COMMANDES[k.choisie].nom, regle: COMMANDES[k.choisie].regle, ordre: k.ordre.slice() } : null,
      minuteur: etat.minuteur.actif ? etat.minuteur.duree : null });
    etat.manche = 1;
    ev.push({ type: 'manche', n: 1 });
    etat.indexActif = -1;
    demarrerTourSuivant(etat, ev);
    return reussite(ev);
  }

  // =====================================================================
  // 8. Le tour
  // =====================================================================
  function actif(etat) {
    if (etat.phase !== 'combat' || etat.indexActif < 0) return null;
    return trouver(etat, etat.frise[etat.indexActif]);
  }
  function estActif(etat, c) { return etat.phase === 'combat' && c.vivant && actif(etat) === c; }
  function verifActif(etat, id) {
    if (etat.phase === 'miseEnPlace') return 'Le combat n\'a pas commencé';
    if (etat.phase === 'fin') return 'Le combat est terminé';
    var c = trouver(etat, id);
    if (!c) return 'Combattant inconnu';
    if (!c.vivant) return c.nom + ' a rendu son tablier';
    var a = actif(etat);
    if (!a || a.id !== id) return 'Ce n\'est pas le tour de ' + c.nom;
    return null;
  }
  function nouvelleManche(etat, ev) {
    etat.manche++;
    ev.push({ type: 'manche', n: etat.manche });
    if (etat.manche > CONST.MANCHES_FAIT_MINUTE) violerCommande(etat, 'fait-minute', null, ev, 'le combat est entré dans sa ' + etat.manche + 'e manche');
  }
  function demarrerTourSuivant(etat, ev) {
    for (var garde = 0; garde < 500 && etat.phase === 'combat'; garde++) {
      etat.indexActif++;
      if (etat.indexActif >= etat.frise.length) { etat.indexActif = 0; nouvelleManche(etat, ev); }
      var c = trouver(etat, etat.frise[etat.indexActif]);
      if (!c || !c.vivant || !c.joue) continue;
      debutTour(etat, c, ev);
      verifierFin(etat, ev);
      if (etat.phase !== 'combat') return;
      if (c.vivant) return;
      ev.push({ type: 'fin-tour', id: c.id });
    }
  }
  function debutTour(etat, c, ev) {
    etat.tourNumero++;
    c.tour = tourVide();
    c.tour.caseDebut = c.case.slice();
    if (c.genre === 'artisan' && c.derniereCaseDebut && meme(c.derniereCaseDebut, c.case)) violerCommande(etat, 'service-en-salle', c, ev, c.nom + ' a commencé deux tours de suite sur la même case');
    c.derniereCaseDebut = c.case.slice();
    var ram = etatDe(c, 'ramolli');
    if (ram) {
      var n = Math.min(ram.couches, CONST.RETRAIT_MAX.pas - c.retraits.pas);
      if (n > 0) { c.retraits.pas += n; c.attente.pas += n; }
    }
    var retraits = { cm: c.attente.cm, pas: c.attente.pas };
    c.cm = Math.max(0, c.cmBase + sommeBonus(c, 'cm') - c.attente.cm) + c.cmEnPlus;
    c.pas = Math.max(0, c.pasBase + sommeBonus(c, 'pas') - c.attente.pas);
    c.attente = { cm: 0, pas: 0 };
    c.cmEnPlus = 0;
    ev.push({ type: 'tour', id: c.id, manche: etat.manche, cm: c.cm, pas: c.pas, retraits: retraits, minuteur: etat.minuteur.actif ? etat.minuteur.duree : null });
    if (c.toursJoues > 0) basculerMaree(c, ev);
    c.toursJoues++;
    objetsDebutTour(etat, c, ev);
    if (c.vivant) nappesPour(etat, c, 'debut', ev);
    if (c.vivant) brulure(etat, c, ev);
  }
  function basculerMaree(c, ev) {
    var h = etatDe(c, 'maree-haute'), b = etatDe(c, 'maree-basse');
    if (h) { h.etat = 'maree-basse'; ev.push({ type: 'maree', id: c.id, etat: 'maree-basse' }); }
    else if (b) { b.etat = 'maree-haute'; ev.push({ type: 'maree', id: c.id, etat: 'maree-haute' }); }
  }
  function brulure(etat, c, ev) {
    var e = etatDe(c, 'brule');
    if (!e) return;
    var src = trouver(etat, e.source) || c;
    var sortRef = sortDe(src, e.sortId) || { id: e.sortId || 'brule', element: 'F', effets: [] };
    var v = calculerDegats(etat, src, { element: CONST.ETATS.brule.element }, sortRef, c, 0, (e.valeur || CONST.ETATS.brule.degats) * e.couches, false, 1);
    infliger(etat, c, v, { source: src.id, element: 'F', etat: 'brule', sortId: e.sortId || null }, ev);
  }
  function terminerTour(etat, c, ev) {
    if (c.vivant) nappesPour(etat, c, 'fin', ev);
    if (c.vivant && c.genre === 'artisan' && auContactEnnemi(etat, c)) violerCommande(etat, 'sans-contact', c, ev, c.nom + ' a fini son tour au contact d\'un ennemi');
    if (c.vivant) {
      var aff = etatDe(c, 'affine');
      if (aff) aff.couches = Math.min(CONST.ETATS.affine.max, aff.couches + 1);
      decompter(c, ev);
    }
    c.retraits = { cm: 0, pas: 0 };
    ev.push({ type: 'fin-tour', id: c.id });
  }
  function decompter(c, ev) {
    c.etats = c.etats.filter(function (e) {
      if (e.tours > 0 && --e.tours === 0) { ev.push({ type: 'etat', action: 'fini', cible: c.id, etat: e.etat }); return false; }
      return true;
    });
    c.bonus = c.bonus.filter(function (b) {
      if (b.tours > 0 && --b.tours === 0) { ev.push({ type: 'bonus', action: 'fini', cible: c.id, carac: b.carac, valeur: b.valeur }); return false; }
      return true;
    });
    c.boucliers = c.boucliers.filter(function (b) { return !(b.tours > 0 && --b.tours === 0); });
    c.renforts = c.renforts.filter(function (r) { return !(r.tours > 0 && --r.tours === 0) && !(r.fois > 0 && r.restant <= 0); });
    if (c.entameSpeciale && c.entameSpeciale.tours > 0 && --c.entameSpeciale.tours === 0) c.entameSpeciale = null;
    for (var k in c.relances) if (c.relances[k] > 0) c.relances[k]--;
  }
  // opts.absent : le Minuteur a fini le tour d'un artisan qui n'a rien fait. En groupe, au 3e d'affilée, il quitte le service
  // (les autres ne doivent pas l'attendre) ; en solo, le tour passe et rien de plus (event absent avec max: null).
  function finDuTour(etat, id, opts) {
    var r = verifActif(etat, id);
    if (r) return refus(r);
    var c = trouver(etat, id), ev = [];
    if (opts && opts.absent && c.genre === 'artisan') {
      var enGroupe = etat.combattants.filter(function (k) { return k.genre === 'artisan'; }).length > 1;
      c.absences++;
      ev.push({ type: 'absent', id: c.id, n: c.absences, max: enGroupe ? CONST.ABSENCES_MAX : null });
      if (enGroupe && c.absences >= CONST.ABSENCES_MAX) {
        ev.push({ type: 'quitte', id: c.id });
        tomber(etat, c, { source: null, cause: 'absent' }, ev);
        apresAction(etat, c, ev);
        return reussite(ev);
      }
    } else c.absences = 0;
    terminerTour(etat, c, ev);
    verifierFin(etat, ev);
    demarrerTourSuivant(etat, ev);
    return reussite(ev);
  }
  // Après une action : fin du combat, ou fin du tour si l'actif est tombé pendant son action.
  function apresAction(etat, c, ev) {
    verifierFin(etat, ev);
    if (etat.phase !== 'combat') return;
    var a = actif(etat);
    if (a && !a.vivant) { ev.push({ type: 'fin-tour', id: a.id }); demarrerTourSuivant(etat, ev); }
  }
  function auContactEnnemi(etat, c) {
    var occ = indexVu(etat, c.camp);
    return DIRS.some(function (d) { var o = occ[(c.case[0] + d[0]) + ',' + (c.case[1] + d[1])]; return o && o.camp !== c.camp && o.genre !== 'ustensile'; });
  }

  // =====================================================================
  // 9. Déplacement et Rideau
  // =====================================================================
  // Part gardée en quittant la case cs : produit des (Faux-fuyant + 5) / (2 × Rideau + 5), en fraction exacte.
  function partGardee(etat, c, cs, occ) {
    if (etatDe(c, 'glissant')) return null;
    var R = CONST.RIDEAU, ff = caracEff(c, 'fauxFuyant'), num = 1, den = 1;
    DIRS.forEach(function (d) {
      var o = occ[(cs[0] + d[0]) + ',' + (cs[1] + d[1])];
      if (!o || o.camp === c.camp || o.genre === 'ustensile' || o.id === c.id) return;
      var a = Math.max(0, ff + R.ajoutFauxFuyant), b = R.facteurRideau * caracEff(o, 'rideau') + R.ajoutRideau;
      if (a < b) { num *= a; den *= b; }
    });
    return num < den ? { num: num, den: den } : null;
  }
  function apresRideau(pas, cm, part) {
    if (!part) return { pas: pas, cm: cm };
    return { pas: Math.max(CONST.RIDEAU.pasGardes, arrondi(pas * part.num / part.den)), cm: arrondi(cm * part.num / part.den) };
  }
  // Ce que coûterait le fait de quitter sa case maintenant (affichable avant de bouger).
  function apercuRideau(etat, id) {
    var c = trouver(etat, id);
    if (!c || !c.vivant || !c.case) return null;
    var occ = indexVu(etat, c.camp), part = partGardee(etat, c, c.case, occ);
    var pas = estActif(etat, c) ? c.pas : c.pasBase + sommeBonus(c, 'pas'), cm = estActif(etat, c) ? c.cm : c.cmBase + sommeBonus(c, 'cm');
    var apres = apresRideau(pas, cm, part);
    var ennemis = DIRS.map(function (d) { return occ[(c.case[0] + d[0]) + ',' + (c.case[1] + d[1])]; })
      .filter(function (o) { return o && o.camp !== c.camp && o.genre !== 'ustensile'; }).map(function (o) { return o.id; });
    return { auContact: ennemis.length > 0, ennemis: ennemis, part: part ? part.num / part.den : 1,
      pasApres: apres.pas, cmApres: apres.cm, perte: { cm: cm - apres.cm, pas: pas - apres.pas }, pris: pas > 0 && apres.pas <= 0 };
  }
  // Recherche des chemins : étiquettes (Pas, CM) non dominées par case (la perte au Rideau dépend des Pas restants).
  function planifier(etat, c, opts) {
    opts = opts || {};
    var occ = indexVu(etat, c.camp);
    var dep = { case: c.case.slice(), pas: opts.pas !== undefined ? opts.pas : c.pas, cm: opts.cm !== undefined ? opts.cm : c.cm, cout: 0, prec: null, rideau: null, mort: false };
    var etiq = {}, file = [dep];
    etiq[cle(dep.case)] = [dep];
    while (file.length) {
      var L = file.shift();
      if (L.mort || L.pas <= 0) continue;
      var part = opts.sansRideau ? null : partGardee(etat, c, L.case, occ);
      var apres = apresRideau(L.pas, L.cm, part);
      if (apres.pas <= 0) continue;   // pris dans le Rideau : on ne quitte pas cette case
      var info = (apres.pas < L.pas || apres.cm < L.cm) ? { case: L.case.slice(), cm: L.cm - apres.cm, pas: L.pas - apres.pas, part: part.num / part.den } : null;
      for (var i = 0; i < 4; i++) {
        var v = [L.case[0] + DIRS[i][0], L.case[1] + DIRS[i][1]];
        if (terrain(etat, v) !== 'sol') continue;
        var o = occ[cle(v)];
        if (o && o.id !== c.id) continue;
        var N = { case: v, pas: apres.pas - 1, cm: apres.cm, cout: L.cout + 1, prec: L, rideau: info, mort: false };
        var k = cle(v), liste = etiq[k] || (etiq[k] = []), domine = false;
        for (var j = 0; j < liste.length; j++) {
          var E = liste[j];
          if (!E.mort && E.pas >= N.pas && E.cm >= N.cm && (E.pas > N.pas || E.cm > N.cm || E.cout <= N.cout)) { domine = true; break; }
        }
        if (domine) continue;
        liste.forEach(function (E) { if (N.pas >= E.pas && N.cm >= E.cm) E.mort = true; });
        liste.push(N);
        file.push(N);
      }
    }
    var meilleur = {}, liste2 = [];
    Object.keys(etiq).forEach(function (k) {
      if (k === cle(c.case)) return;
      var b = null;
      etiq[k].forEach(function (E) {
        if (E.mort) return;
        if (!b || E.cm > b.cm || (E.cm === b.cm && (E.pas > b.pas || (E.pas === b.pas && E.cout < b.cout)))) b = E;
      });
      if (b) { meilleur[k] = b; liste2.push(b); }
    });
    return { meilleur: meilleur, liste: liste2 };
  }
  function cheminDe(L) { var ch = []; for (var x = L; x; x = x.prec) ch.unshift(x.case.slice()); return ch; }
  function pertesDe(L) {
    var p = { cm: 0, pas: 0 }, r = [];
    for (var x = L; x; x = x.prec) if (x.rideau) { p.cm += x.rideau.cm; p.pas += x.rideau.pas; r.unshift(x.rideau); }
    return { perte: p, rideau: r };
  }
  function decrireEtiquette(L) {
    var p = pertesDe(L);
    return { case: L.case.slice(), cout: L.cout, chemin: cheminDe(L), pasRestants: L.pas, cmRestants: L.cm, perte: p.perte, rideau: p.rideau };
  }
  // opts.sansRideau : la portée sans la perte au Rideau (pour griser les cases devenues hors d'atteinte).
  function deplacementsPossibles(etat, id, opts) {
    var c = trouver(etat, id);
    if (!c || !c.vivant || !c.case || etat.phase === 'fin') return [];
    if (etatDe(c, 'enracine')) return [];
    var o = Object.assign({}, opts || {});
    if (!estActif(etat, c) && o.pas === undefined) { o.pas = c.pasBase + sommeBonus(c, 'pas'); o.cm = c.cmBase + sommeBonus(c, 'cm'); }
    return planifier(etat, c, o).liste.map(decrireEtiquette);
  }
  function apercuDeplacement(etat, id, cs) {
    var r = verifActif(etat, id);
    if (r) return refus(r);
    var c = trouver(etat, id);
    var r2 = raisonDeplacement(etat, c, cs);
    if (r2) return refus(r2);
    var L = planifier(etat, c).meilleur[cle(cs)];
    if (!L) return refus(raisonHorsAtteinte(etat, c, cs));
    var d = decrireEtiquette(L);
    d.ok = true;
    return d;
  }
  function raisonHorsAtteinte(etat, c, cs) {
    var r = apercuRideau(etat, c.id);
    if (r && r.pris) return 'Pris dans le Rideau';
    if (planifier(etat, c, { sansRideau: true }).meilleur[cle(cs)]) return 'Case hors d\'atteinte (Rideau)';
    return 'Case hors d\'atteinte';
  }
  function raisonDeplacement(etat, c, cs) {
    if (!estCase(cs)) return 'Case invalide';
    if (etatDe(c, 'enracine')) return 'Enraciné : impossible de marcher ce tour';
    if (c.pas <= 0) return 'Plus de Pas';
    if (meme(cs, c.case)) return 'Déjà sur cette case';
    if (terrain(etat, cs) !== 'sol') return 'On ne marche pas là';
    return null;
  }
  function deplacer(etat, id, cs) {
    var r = verifActif(etat, id);
    if (r) return refus(r);
    var c = trouver(etat, id);
    var r2 = raisonDeplacement(etat, c, cs);
    if (r2) return refus(r2);
    var L = planifier(etat, c).meilleur[cle(cs)];
    if (!L) return refus(raisonHorsAtteinte(etat, c, cs));
    var ev = [];
    c.absences = 0;
    marcher(etat, c, cheminDe(L), ev);
    apresAction(etat, c, ev);
    return reussite(ev);
  }
  function marcher(etat, c, chemin, ev) {
    var seg = [c.case.slice()];
    // (après une chute en chemin, la case est nulle : on ne recommence pas de segment)
    function vider() { if (seg.length > 1) ev.push({ type: 'deplacement', id: c.id, chemin: seg }); seg = c.case ? [c.case.slice()] : []; }
    for (var i = 1; i < chemin.length; i++) {
      var v = chemin[i];
      var apres = apresRideau(c.pas, c.cm, partGardee(etat, c, c.case, indexVu(etat, c.camp)));
      if (apres.pas <= 0) { vider(); ev.push({ type: 'bute', id: c.id, case: c.case.slice(), contre: null, rideau: true }); break; }
      if (apres.pas < c.pas || apres.cm < c.cm) {
        vider();
        ev.push({ type: 'rideau', id: c.id, case: c.case.slice(), cmPerdus: c.cm - apres.cm, pasPerdus: c.pas - apres.pas });
        c.pas = apres.pas; c.cm = apres.cm;
      }
      if (c.pas <= 0) break;
      var o = occupantReel(etat, v);
      if (o && o.id !== c.id) {
        vider();
        ev.push({ type: 'bute', id: c.id, case: v.slice(), contre: o.id });
        if (etatDe(o, 'derobe')) ev.push({ type: 'revele', id: o.id, case: o.case.slice() });
        break;
      }
      c.orientation = [v[0] - c.case[0], v[1] - c.case[1]];
      c.pas -= 1;
      c.case = v.slice();
      seg.push(v.slice());
      c.tour.pasMarches++;
      if (entreeCase(etat, c, ev, vider) || !c.vivant) break;
    }
    vider();
    if (c.genre === 'artisan' && c.tour.pasMarches > 1) violerCommande(etat, 'plan-de-travail', c, ev, c.nom + ' a marché ' + c.tour.pasMarches + ' Pas dans le même tour');
  }
  // Ce qui se passe quand un combattant arrive sur une case (marche, poussée, bond…). Vrai s'il doit s'arrêter.
  function entreeCase(etat, c, ev, avant) {
    if (!c.vivant || !c.case || c.genre === 'ustensile') return false;
    var p = null;
    for (var i = 0; i < etat.sol.length; i++) { var o = etat.sol[i]; if (o.quoi === 'piege' && o.camp !== c.camp && meme(o.case, c.case)) { p = o; break; } }
    if (p) { if (avant) avant(); declencherPiege(etat, p, c, ev); return true; }
    nappesPour(etat, c, 'entree', ev, avant);
    return false;
  }

  // =====================================================================
  // 10. Ligne de vue (supercover, règle du coin)
  // =====================================================================
  function traverse(a, b) {
    var dx = b[0] - a[0], dy = b[1] - a[1], nx = Math.abs(dx), ny = Math.abs(dy), sx = signe(dx), sy = signe(dy);
    var x = a[0], y = a[1], ix = 0, iy = 0, out = [];
    while (ix < nx || iy < ny) {
      var dec = (1 + 2 * ix) * ny - (1 + 2 * iy) * nx;
      if (dec === 0) { out.push({ coin: [[x + sx, y], [x, y + sy]] }); x += sx; y += sy; ix++; iy++; }
      else if (dec < 0) { x += sx; ix++; }
      else { y += sy; iy++; }
      if (!(x === b[0] && y === b[1])) out.push({ c: [x, y] });
    }
    return out;
  }
  function ligneDeVue(etat, a, b, opts) {
    var occ = (opts && opts.occ) || indexReel(etat), ign = opts && opts.ignorer;
    function bloque(cs) {
      var t = terrain(etat, cs);
      if (t === 'plein') return true;
      if (t === 'vide') return false;
      var o = occ[cle(cs)];
      return !!(o && o.id !== ign && !etatDe(o, 'derobe'));
    }
    var l = traverse(a, b);
    for (var i = 0; i < l.length; i++) {
      if (l[i].c && bloque(l[i].c)) return false;
      if (l[i].coin && bloque(l[i].coin[0]) && bloque(l[i].coin[1])) return false;
    }
    return true;
  }

  // =====================================================================
  // 11. Zones
  // =====================================================================
  function axe(de, vers) {
    var dx = vers[0] - de[0], dy = vers[1] - de[1];
    if (!dx && !dy) return null;
    if (Math.abs(dx) > Math.abs(dy)) return [signe(dx), 0];
    if (Math.abs(dy) > Math.abs(dx)) return [0, signe(dy)];
    return [signe(dx), signe(dy)];
  }
  function casesZone(etat, zone, origine, centre, orientation) {
    var z = normaliserZone(zone), n = z.taille || 0, m = z.tailleMin || 0, out = [], vus = {};
    var a = axe(origine, centre) || orientation || [1, 0], p = [-a[1], a[0]];
    function add(x, y) {
      var cs = [x, y], k = cle(cs);
      if (vus[k] || terrain(etat, cs) !== 'sol') return;
      vus[k] = true;
      out.push({ case: cs, dist: distance(cs, centre) });
    }
    var cx = centre[0], cy = centre[1], k, j, dx, dy;
    switch (z.forme) {
      case 'croix':
        for (k = m; k <= n; k++) { if (k === 0) add(cx, cy); else DIRS.forEach(function (d) { add(cx + d[0] * k, cy + d[1] * k); }); }
        break;
      case 'rond': case 'anneau':
        for (dx = -n; dx <= n; dx++) for (dy = -n; dy <= n; dy++) {
          var d = Math.abs(dx) + Math.abs(dy);
          if (d > n) continue;
          if (z.forme === 'anneau' ? d !== n : d < m) continue;
          add(cx + dx, cy + dy);
        }
        break;
      case 'demi-rond':
        // Rangées de 2n + 1, 2n − 1… cases qui se resserrent derrière la case visée, dans le repère (axe, perpendiculaire) :
        // sur un axe droit, c'est la moitié arrière du rond ; en diagonale, la même forme tournée (4 / 9 / 16 cases dans les deux cas).
        for (k = 0; k <= n; k++) for (j = -(n - k); j <= n - k; j++) if (k + Math.abs(j) >= m) add(cx + a[0] * k + p[0] * j, cy + a[1] * k + p[1] * j);
        break;
      case 'ligne':
        for (k = m; k <= n; k++) add(cx + a[0] * k, cy + a[1] * k);
        break;
      case 'travers':
        for (j = -n; j <= n; j++) if (Math.abs(j) >= m) add(cx + p[0] * j, cy + p[1] * j);
        break;
      case 'cone':
        for (k = m; k <= n; k++) for (j = -k; j <= k; j++) add(cx + a[0] * k + p[0] * j, cy + a[1] * k + p[1] * j);
        break;
      case 'carre':
        for (dx = -n; dx <= n; dx++) for (dy = -n; dy <= n; dy++) if (Math.max(Math.abs(dx), Math.abs(dy)) >= m) add(cx + dx, cy + dy);
        break;
      case 'terrain':
        casesSol(etat).forEach(function (cs) { add(cs[0], cs[1]); });
        break;
      default:
        add(cx, cy);
    }
    return out;
  }
  function filtreTouche(lanceur, o, touche) {
    if (touche === 'allies') return o.camp === lanceur.camp && o.genre !== 'ustensile';
    return o.camp !== lanceur.camp;
  }
  function ciblesTouchees(etat, lanceur, zone, touche, origine, centre, occ) {
    occ = occ || indexReel(etat);
    var out = [];
    casesZone(etat, zone, origine, centre, lanceur.orientation).forEach(function (z) {
      var o = occ[cle(z.case)];
      if (o && filtreTouche(lanceur, o, touche)) out.push({ c: o, d: z.dist, case: z.case.slice() });
    });
    out.sort(function (x, y) { return x.d - y.d; });
    return out;
  }

  // =====================================================================
  // 12. Lancer un sort : contrôles
  // =====================================================================
  function rayonMax(c, sort) { return Math.max(sort.rayon.min, sort.rayon.max + (sort.rayon.modifiable ? caracEff(c, 'rayon') : 0)); }
  // Contrôles qui ne dépendent pas de la case (le bouton se grise).
  function raisonSort(etat, c, sort, sansCM) {
    if (!sansCM && c.cm < sort.cm) return 'Pas assez de coups de main (' + sort.cm + ' CM)';
    var r = c.relances[sort.id] || 0;
    if (r > 0) return 'Revient dans ' + pluriel(r, 'tour');
    if (sort.parTour > 0 && (c.tour.lances[sort.id] || 0) >= sort.parTour) return 'Plus de service pour ce tour';
    var poses = [], invoque = false;
    sort.effets.forEach(function (b) { if (b.type === 'pose') poses.push(b.quoi); if (b.type === 'invoque') invoque = true; });
    if (poses.length && sort.plafondPose > 0) {
      var n = etat.sol.filter(function (o) { return o.poseur === c.id && o.sortId === sort.id; }).length;
      if (n >= sort.plafondPose) return 'Déjà ' + n + ' posés : plafond atteint';
    }
    if (poses.indexOf('piege') >= 0 && piegesDe(etat, c).length >= CONST.PIEGES_PAR_POSEUR) return 'Déjà ' + CONST.PIEGES_PAR_POSEUR + ' pièges posés';
    if (invoque && commisDe(etat, c).length >= caracEff(c, 'commis')) return 'Plus de place pour un Commis';
    return null;
  }
  // Contrôles liés à la case visée ; opts.origine : case d'où l'on lancerait (l'IA essaie des cases).
  function raisonCase(etat, c, sort, cs, opts) {
    opts = opts || {};
    var origine = opts.origine || c.case, camp = c.camp;
    if (!estCase(cs) || terrain(etat, cs) !== 'sol') return 'Case hors du terrain';
    var d = distance(origine, cs), dx = Math.abs(cs[0] - origine[0]), dy = Math.abs(cs[1] - origine[1]);
    if (sort.cible === 'soi') { if (d !== 0) return 'Ce sort se lance sur soi'; }
    else {
      if (d < sort.rayon.min || d > rayonMax(c, sort)) return 'Hors du Rayon';
      if (d > 0) {
        if (sort.lancer === 'ligne' && dx && dy) return 'Il faut lancer en ligne';
        if (sort.lancer === 'diagonale' && dx !== dy) return 'Il faut lancer en diagonale';
        if (sort.lancer === 'ligne+diagonale' && dx && dy && dx !== dy) return 'Il faut lancer en ligne ou en diagonale';
      }
    }
    var occ = opts.occ || indexVu(etat, camp);
    if (sort.vue && d > 0 && !ligneDeVue(etat, origine, cs, { ignorer: c.id, occ: occ })) return 'Pas de vue';
    var o = meme(cs, origine) ? c : occ[cle(cs)];
    if (o && o.id === c.id && !meme(cs, origine)) o = null;
    switch (sort.cible) {
      case 'ennemi': if (!o || o.camp === camp) return 'Il faut viser un ennemi'; break;
      case 'allie': if (!o || o.camp !== camp || o.genre === 'ustensile') return 'Il faut viser un allié'; break;
      case 'combattant': if (!o) return 'Il faut viser un combattant'; break;
      case 'caseLibre': if (o) return 'Il faut viser une case libre'; break;
    }
    if (o && sort.parCible > 0 && ((c.tour.cibles[sort.id] || {})[o.id] || 0) >= sort.parCible) return 'Déjà servi à cette cible';
    // Ce qui occupe la case visée (piège, graine, Ustensile, fournée qui a des Victuailles, Commis) demande une case libre,
    // même si le sort vise « case » : refus avant de payer (un ennemi Dérobé, lui, ne se découvre qu'en s'y cognant).
    if (o && sort.effets.some(occupeLaCase)) return 'Il faut viser une case libre';
    var piege = sort.effets.some(function (b) { return b.type === 'pose' && b.quoi === 'piege'; });
    if (piege && etat.sol.some(function (x) { return x.quoi === 'piege' && x.camp === camp && meme(x.case, cs); })) return 'Il y a déjà un piège ici';
    // Décision 13 : une seule fournée par case (celle qui éclate tout de suite, tours 0, ne reste pas et n'est pas concernée)
    var fournee = sort.effets.some(function (b) { return b.type === 'pose' && b.quoi === 'fournee' && (b.tours || 0) > 0; });
    if (fournee && etat.sol.some(function (x) { return x.quoi === 'fournee' && meme(x.case, cs); })) return 'Il y a déjà une fournée ici';
    return null;
  }
  function occupeLaCase(b) {
    if (b.type === 'invoque') return true;
    return b.type === 'pose' && (b.quoi === 'piege' || b.quoi === 'graine' || b.quoi === 'ustensile' || (b.quoi === 'fournee' && !!b.victuailles));
  }
  function raisonLancer(etat, c, sort, cs) { return raisonSort(etat, c, sort) || raisonCase(etat, c, sort, cs); }
  function chanceMaitre(c, sort) { return sort.maitre > 0 ? Math.min(CONST.PLAFONDS.coupDeMaitre, sort.maitre + caracEff(c, 'coupDeMaitre')) : 0; }

  function casesVisables(etat, id, sortId) {
    var c = trouver(etat, id);
    if (!c || !c.vivant || !c.case) return { disponible: false, raison: 'Combattant absent', cases: [] };
    var sort = sortDe(c, sortId);
    if (!sort) return { disponible: false, raison: 'Sort inconnu', cases: [] };
    var r0 = verifActif(etat, id) || raisonSort(etat, c, sort), out = [];
    var max = sort.cible === 'soi' ? 0 : rayonMax(c, sort), min = sort.cible === 'soi' ? 0 : sort.rayon.min;
    var occ = indexVu(etat, c.camp);
    for (var dx = -max; dx <= max; dx++) for (var dy = -max; dy <= max; dy++) {
      var d = Math.abs(dx) + Math.abs(dy);
      if (d < min || d > max) continue;
      var cs = [c.case[0] + dx, c.case[1] + dy];
      if (terrain(etat, cs) !== 'sol') continue;
      var rc = raisonCase(etat, c, sort, cs, { occ: occ });
      var vue = !(rc === 'Pas de vue' || /^Il faut lancer/.test(rc || ''));
      out.push({ case: cs, vue: vue, visable: !rc && !r0, raison: rc || r0 || null });
    }
    return { disponible: !r0, raison: r0, cases: out };
  }
  function barre(etat, id) {
    var c = trouver(etat, id);
    if (!c) return [];
    var r0 = verifActif(etat, id);
    return c.sorts.map(function (s) {
      var r = r0 || raisonSort(etat, c, s);
      return { id: s.id, nom: s.nom, element: s.element, cm: s.cm, emplacement: s.emplacement, rang: s.rang || 1,
        rayon: { min: s.rayon.min, max: rayonMax(c, s), modifiable: s.rayon.modifiable }, disponible: !r, raison: r,
        relance: c.relances[s.id] || 0, lancesCeTour: c.tour.lances[s.id] || 0, chanceMaitre: chanceMaitre(c, s) };
    });
  }

  // =====================================================================
  // 13. Lancer un sort : exécution
  // =====================================================================
  function lancer(etat, id, sortId, cs) {
    var r = verifActif(etat, id);
    if (r) return refus(r);
    var c = trouver(etat, id), sort = sortDe(c, sortId);
    if (!sort) return refus('Ce sort n\'est pas dans le grimoire de ' + c.nom);
    if (sort.cible === 'soi' && !cs) cs = c.case;
    var r2 = raisonLancer(etat, c, sort, cs);
    if (r2) return refus(r2);
    var ev = [];
    c.absences = 0;
    executerSort(etat, c, sort, cs.slice(), ev, {});
    apresAction(etat, c, ev);
    return reussite(ev);
  }
  function nouveauContexte(etat, c, sort, centre, origine, maitre, ev, opts, sortRef) {
    return { etat: etat, lanceur: c, sort: sort, sortRef: sortRef || sort, zone: sort.zone || normaliserZone(), centre: centre, origine: origine,
      maitre: maitre, ev: ev, force: (opts && opts.force) || null, jets: new Map(), faits: new Set(), tombes: {}, touchesDegats: [] };
  }
  function tirerMaitre(etat, c, taux, opts) {
    if (opts && opts.force) return !!opts.force.maitre && taux > 0;
    return taux > 0 && hasard(etat) * 100 < taux;
  }
  function executerSort(etat, c, sort, cs, ev, opts) {
    c.cm -= sort.cm;
    var vu = indexVu(etat, c.camp)[cle(cs)];
    c.tour.lances[sort.id] = (c.tour.lances[sort.id] || 0) + 1;
    if (vu) { var t = c.tour.cibles[sort.id] || (c.tour.cibles[sort.id] = {}); t[vu.id] = (t[vu.id] || 0) + 1; }
    if (sort.relance > 0) c.relances[sort.id] = sort.relance;
    if (c.genre === 'artisan' && c.tour.lances[sort.id] > 1) violerCommande(etat, 'une-seule-cuisson', c, ev, c.nom + ' a lancé ' + sort.nom + ' deux fois dans le même tour');
    if (!meme(cs, c.case)) orienter(c, cs);
    var avant = c.renforts.slice();
    var maitre = tirerMaitre(etat, c, chanceMaitre(c, sort), opts);
    ev.push({ type: 'lancer', id: c.id, sortId: sort.id, nom: sort.nom, element: sort.element, case: cs.slice(), maitre: maitre, cm: sort.cm });
    if (etatDe(c, 'derobe')) ev.push({ type: 'revele', id: c.id, case: c.case.slice() });
    var ctx = nouveauContexte(etat, c, sort, cs, c.case.slice(), maitre, ev, opts);
    appliquerEffets(ctx, sort.effets, ciblesTouchees(etat, c, sort.zone, sort.touche, c.case, cs));
    avant.forEach(function (r) { if (r.fois > 0 && correspond(sort, r.quoi)) r.restant--; });
    c.renforts = c.renforts.filter(function (r) { return !(r.fois > 0 && r.restant <= 0); });
  }
  function appliquerEffets(ctx, effets, cibles) {
    (effets || []).forEach(function (b) { var f = BRIQUES[b.type]; if (f) f(ctx, b, cibles, effets); });
  }
  function unique(ctx, b) { if (ctx.faits.has(b)) return false; ctx.faits.add(b); return true; }
  function jetDe(ctx, b) {
    if (ctx.jets.has(b)) return ctx.jets.get(b);
    var lo = ctx.maitre ? b.maitre[0] : b.min, hi = ctx.maitre ? b.maitre[1] : b.max, j;
    if (ctx.force) j = ctx.force.jet === 'min' ? lo : hi;
    else j = entier(ctx.etat, lo, hi);
    ctx.jets.set(b, j);
    return j;
  }
  function multDegats(src, sortRef, renfort) {
    var m = src.multDegats || 1;
    if (etatDe(src, 'fume')) m *= (100 + CONST.ETATS.fume.degatsPct) / 100;
    if (etatDe(src, 'maree-basse')) m *= (100 + CONST.ETATS['maree-basse'].degatsPct) / 100;
    var pct = sommeBonus(src, 'degatsPct');
    if (pct) m *= (100 + pct) / 100;
    return Math.max(0, m * (typeof renfort === 'number' ? renfort : multRenfort(src, sortRef)));
  }
  function multRenfort(src, sortRef) {
    var m = 1;
    src.renforts.forEach(function (r) { if (correspond(sortRef, r.quoi)) m *= (100 + r.valeur) / 100; });
    return m;
  }
  // La formule de dégâts (partie 3.11), étapes 1 à 6 (le jet est fourni).
  function calculerDegats(etat, src, b, sortRef, cible, dist, jet, baisse, mult, renfort) {
    var el = b.element || (sortRef && sortRef.element) || 'N';
    var aff = el === 'N' ? 0 : (src.affinites[el] || 0);
    var v = bas(jet * (100 + aff + caracEff(src, 'levure')) / 100);
    var f = 1;
    if (baisse && dist > 0) f *= (100 - CONST.ZONE.baissePct * Math.min(CONST.ZONE.baisseMax, dist)) / 100;
    f *= (100 - conservationEff(cible, el)) / 100;
    f *= multDegats(src, sortRef, renfort);
    if (mult) f *= mult;
    return Math.max(0, bas(v * f));
  }
  function fourchetteDegats(src, b, sortRef, cible, dist, baisse, mult) {
    var lo = b.maitre || [b.min, b.max];
    return {
      min: calculerDegats(null, src, b, sortRef, cible, dist, b.min, baisse, mult),
      max: calculerDegats(null, src, b, sortRef, cible, dist, b.max, baisse, mult),
      maitreMin: calculerDegats(null, src, b, sortRef, cible, dist, lo[0], baisse, mult),
      maitreMax: calculerDegats(null, src, b, sortRef, cible, dist, lo[1], baisse, mult)
    };
  }
  function infoDe(ctx, b, extra) {
    var i = { source: ctx.lanceur.id, sortId: ctx.sort.id, element: (b && b.element) || ctx.sort.element, maitre: ctx.maitre,
      outil: ctx.sort.emplacement === 0 && ctx.lanceur.genre === 'artisan', objet: ctx.objet || null };
    if (extra) for (var k in extra) i[k] = extra[k];
    return i;
  }
  function valeurDegats(ctx, b, cible, dist, mult) {
    return calculerDegats(ctx.etat, ctx.lanceur, b, ctx.sortRef, cible, dist, jetDe(ctx, b), ctx.zone.baisse !== false, mult, ctx.renfort);
  }
  function infliger(etat, cible, valeur, info, ev) {
    if (!cible.vivant) return 0;
    var reste = valeur, absorbe = 0;
    for (var i = 0; i < cible.boucliers.length && reste > 0; i++) {
      var b = cible.boucliers[i], a = Math.min(b.restant, reste);
      b.restant -= a; reste -= a; absorbe += a;
    }
    cible.boucliers = cible.boucliers.filter(function (b) { return b.restant > 0; });
    if (absorbe > 0 && !cible.boucliers.length && etatDe(cible, 'nappe')) {
      cible.etats = cible.etats.filter(function (e) { return e.etat !== 'nappe'; });
      ev.push({ type: 'etat', action: 'fini', cible: cible.id, etat: 'nappe' });
    }
    var pris = Math.min(reste, cible.victuailles), entame = 0;
    cible.victuailles -= pris;
    if (cible.genre !== 'ustensile' && pris > 0) { entame = bas(pris * partEntame(cible) / 100); cible.entame += entame; }
    ev.push({ type: 'degats', source: info.source || null, cible: cible.id, valeur: valeur, absorbe: absorbe, perdu: pris, entame: entame,
      victuailles: cible.victuailles, max: maxVictuailles(cible), element: info.ecrasement ? null : (info.element || null), maitre: !!info.maitre,
      sortId: info.sortId || null, ecrasement: !!info.ecrasement, rebond: info.rebond || 0, etat: info.etat || null, objet: info.objet || null });
    if (cible.victuailles <= 0) tomber(etat, cible, info, ev);
    return pris;
  }
  function soigner(etat, src, cible, valeur, info, ev) {
    if (!cible.vivant || cible.genre === 'ustensile') return 0;
    var reel = Math.max(0, Math.min(valeur, maxVictuailles(cible) - cible.victuailles));
    cible.victuailles += reel;
    ev.push({ type: 'soin', source: src ? src.id : null, cible: cible.id, valeur: reel, brut: valeur, maitre: !!info.maitre, victuailles: cible.victuailles,
      max: maxVictuailles(cible), sortId: info.sortId || null, pain: !!info.pain });
    if (src && src.camp === 'artisans' && valeur > 0) violerCommande(etat, 'sans-sel', src, ev, info.pain ? src.nom + ' a mangé un Pain de route' : src.nom + (src === cible ? ' s\'est soigné' : ' a soigné ' + cible.nom));
    return reel;
  }

  // Les briques d'effet (liste fermée du contrat).
  var BRIQUES = {
    degats: function (ctx, b, cibles) {
      cibles.forEach(function (t) {
        if (!t.c.vivant || t.c.camp === ctx.lanceur.camp) return;   // décision 2 : jamais les alliés ni le lanceur
        infliger(ctx.etat, t.c, valeurDegats(ctx, b, t.c, t.d, 1), infoDe(ctx, b), ctx.ev);
        if (ctx.touchesDegats.indexOf(t.c.id) < 0) ctx.touchesDegats.push(t.c.id);
        if (!t.c.vivant) ctx.tombes[t.c.id] = true;
      });
    },
    soin: function (ctx, b, cibles) {
      var src = ctx.lanceur;
      cibles.forEach(function (t) {
        if (!t.c.vivant || t.c.genre === 'ustensile') return;
        var aff = (b.element && b.element !== 'N') ? (src.affinites[b.element] || 0) : 0;
        var v = bas(jetDe(ctx, b) * (100 + caracEff(src, 'levure') + aff) / 100) + caracEff(src, 'remontant');
        if (ctx.zone.baisse !== false && t.d > 0) v = bas(v * (100 - CONST.ZONE.baissePct * Math.min(CONST.ZONE.baisseMax, t.d)) / 100);
        v = bas(v * (typeof ctx.renfort === 'number' ? ctx.renfort : multRenfort(src, ctx.sortRef)));
        soigner(ctx.etat, src, t.c, v, infoDe(ctx, b), ctx.ev);
      });
    },
    bouclier: function (ctx, b, cibles) {
      cibles.forEach(function (t) {
        if (!t.c.vivant || t.c.genre === 'ustensile') return;
        var miens = t.c.boucliers.filter(function (x) { return x.sortId === ctx.sort.id && x.source === ctx.lanceur.id; });
        if (b.couchesMax > 0 && miens.length >= b.couchesMax) t.c.boucliers.splice(t.c.boucliers.indexOf(miens[0]), 1);
        t.c.boucliers.push({ valeur: b.valeur, restant: b.valeur, tours: b.tours || 0, source: ctx.lanceur.id, sortId: ctx.sort.id });
        ctx.ev.push({ type: 'bouclier', source: ctx.lanceur.id, cible: t.c.id, valeur: b.valeur, total: bouclierTotal(t.c), tours: b.tours || 0 });
      });
    },
    pousse: function (ctx, b, cibles) {
      var origine = (ctx.zone.forme === 'case') ? ctx.origine : ctx.centre;
      cibles.filter(function (t) { return t.c.vivant && t.c.genre !== 'ustensile'; })
        .sort(function (x, y) { return distance(y.c.case, origine) - distance(x.c.case, origine); })
        .forEach(function (t) { if (t.c.vivant) pousser(ctx, t.c, b.cases || 1, meme(t.c.case, origine) ? ctx.origine : origine); });
    },
    attire: function (ctx, b, cibles) {
      cibles.forEach(function (t) { if (t.c.vivant && t.c.genre !== 'ustensile' && ctx.lanceur.case) attirer(ctx, t.c, b.cases || 1, ctx.lanceur.case, 'attire'); });
    },
    ramene: function (ctx, b, cibles) {
      cibles.forEach(function (t) { if (t.c.vivant && t.c.genre !== 'ustensile' && t.c.camp === ctx.lanceur.camp && t.c !== ctx.lanceur && ctx.lanceur.case) attirer(ctx, t.c, b.cases || 1, ctx.lanceur.case, 'ramene'); });
    },
    bond: function (ctx, b) {
      if (!unique(ctx, b)) return;
      var c = ctx.lanceur, cs = ctx.centre;
      if (!c.vivant || terrain(ctx.etat, cs) !== 'sol' || meme(cs, c.case)) return;
      var o = occupantReel(ctx.etat, cs);
      if (o) { ctx.ev.push({ type: 'bute', id: c.id, case: cs.slice(), contre: o.id }); return; }
      var de = c.case.slice();
      orienter(c, cs);
      c.case = cs.slice();
      ctx.ev.push({ type: 'bond', id: c.id, de: de, vers: cs.slice() });
      entreeCase(ctx.etat, c, ctx.ev);
    },
    echange: function (ctx, b) {
      if (!unique(ctx, b)) return;
      var c = ctx.lanceur, o = occupantReel(ctx.etat, ctx.centre);
      if (!c.vivant || !o || o === c) return;
      if (etatDe(o, 'plante') || o.genre === 'ustensile') { ctx.ev.push({ type: 'resiste', cible: o.id, etat: 'plante' }); return; }
      var a = c.case.slice(), z = o.case.slice();
      c.case = z; o.case = a;
      ctx.ev.push({ type: 'echange', id: c.id, avec: o.id, de: a, vers: z });
      entreeCase(ctx.etat, c, ctx.ev);
      entreeCase(ctx.etat, o, ctx.ev);
    },
    'dans-le-dos': function (ctx, b) {
      if (!unique(ctx, b)) return;
      var c = ctx.lanceur, o = occupantReel(ctx.etat, ctx.centre);
      if (!c.vivant || !o || o === c) return;
      var dest = [o.case[0] - o.orientation[0], o.case[1] - o.orientation[1]];
      if (meme(dest, c.case)) return;
      var gene = occupantReel(ctx.etat, dest);
      if (terrain(ctx.etat, dest) !== 'sol' || gene) { ctx.ev.push({ type: 'bute', id: c.id, case: dest, contre: gene ? gene.id : null }); return; }
      var de = c.case.slice();
      c.case = dest;
      orienter(c, o.case);
      ctx.ev.push({ type: 'dans-le-dos', id: c.id, cible: o.id, de: de, vers: dest.slice() });
      entreeCase(ctx.etat, c, ctx.ev);
    },
    etat: function (ctx, b, cibles) {
      cibles.forEach(function (t) { if (t.c.vivant && t.c.genre !== 'ustensile') poserEtat(ctx.etat, ctx.lanceur, t.c, b, ctx.ev, ctx.sort.id); });
    },
    retire: function (ctx, b, cibles) {
      cibles.forEach(function (t) { if (t.c.vivant) appliquerRetrait(ctx.etat, t.c, b.quoi === 'cm' ? 'cm' : 'pas', b.n || 1, ctx.ev); });
    },
    bonus: function (ctx, b, cibles) {
      var qui = b.qui || 'cible', liste;
      if (qui === 'soi') { if (!unique(ctx, b)) return; liste = [ctx.lanceur]; }
      else if (qui === 'allies') { if (!unique(ctx, b)) return; liste = ctx.etat.combattants.filter(function (k) { return k.vivant && k.camp === ctx.lanceur.camp && k.genre !== 'ustensile'; }); }
      else liste = cibles.map(function (t) { return t.c; });
      liste.forEach(function (k) { if (k.vivant) donnerBonus(ctx.etat, ctx.lanceur, k, b, ctx.ev); });
    },
    gainCM: function (ctx, b) {
      if (!unique(ctx, b)) return;
      var liste = (b.qui === 'allies') ? ctx.etat.combattants.filter(function (k) { return k.vivant && k.camp === ctx.lanceur.camp && k.genre !== 'ustensile'; }) : [ctx.lanceur];
      liste.forEach(function (k) { gainCM(ctx.etat, k, b.n || 1, ctx.ev); });
    },
    entame: function (ctx, b, cibles) {
      cibles.forEach(function (t) {
        if (!t.c.vivant || t.c.genre === 'ustensile') return;
        t.c.entameSpeciale = { part: Math.min(CONST.ENTAME.maxPct, b.part || 25), tours: b.tours || 1, source: ctx.lanceur.id };
        ctx.ev.push({ type: 'entame', cible: t.c.id, part: t.c.entameSpeciale.part, tours: t.c.entameSpeciale.tours });
      });
    },
    rebond: function (ctx, b, cibles, freres) {
      var deg = (freres || []).filter(function (x) { return x.type === 'degats'; });
      if (!deg.length) return;
      var exclus = {};
      ctx.touchesDegats.forEach(function (id) { exclus[id] = true; });
      cibles.filter(function (t) { return ctx.touchesDegats.indexOf(t.c.id) >= 0; }).forEach(function (t) {
        var cur = t.c, pos = t.case;
        for (var k = 1; k <= (b.fois || 1); k++) {
          var next = plusProche(ctx.etat, ctx.lanceur, pos, b.rayon || 2, exclus, false);
          if (!next) break;
          exclus[next.id] = true;
          ctx.ev.push({ type: 'rebond', de: cur.id, vers: next.id, case: next.case.slice(), n: k });
          var vise = next;
          deg.forEach(function (d) { if (vise.vivant) infliger(ctx.etat, vise, valeurDegats(ctx, d, vise, 0, (b.part || 50) / 100), infoDe(ctx, d, { rebond: k }), ctx.ev); });
          if (!next.vivant) ctx.tombes[next.id] = true;
          pos = next.case || pos;
          cur = next;
        }
      });
    },
    renforce: function (ctx, b) {
      if (!unique(ctx, b)) return;
      ctx.lanceur.renforts.push({ quoi: b.quoi, valeur: b.valeur || 0, tours: b.tours || 0, fois: b.fois || 0, restant: b.fois || 0, source: ctx.lanceur.id });
      ctx.ev.push({ type: 'renforce', id: ctx.lanceur.id, quoi: b.quoi, valeur: b.valeur || 0, tours: b.tours || 0, fois: b.fois || 0 });
    },
    si: function (ctx, b, cibles) {
      if (CONDITIONS_LANCEUR[b.condition]) { if (conditionVraie(ctx, b, null)) appliquerEffets(ctx, b.effets, cibles); return; }
      var sous = cibles.filter(function (t) { return conditionVraie(ctx, b, t.c); });
      if (sous.length) appliquerEffets(ctx, b.effets, sous);
    },
    pose: function (ctx, b) { if (unique(ctx, b)) poser(ctx, b); },
    invoque: function (ctx, b) { if (unique(ctx, b) && b.commis) invoquerCommis(ctx.etat, ctx.lanceur, b.commis, ctx.centre, ctx.ev); }
  };

  function conditionVraie(ctx, b, t) {
    var c = ctx.lanceur;
    switch (b.condition) {
      case 'cibleBlessee': return t.vivant && t.victuailles * 100 < CONST.BLESSEE_PCT * maxVictuailles(t);
      case 'dansLeDos': return t.vivant && !!c.case && dansLeDos(c.case, t);
      case 'auContact': return t.vivant && !!c.case && distance(c.case, t.case) === 1;
      case 'cibleAffinee': var a = etatDe(t, 'affine'); return t.vivant && !!a && a.couches >= (b.n || 1);
      case 'mareeHaute': return !!etatDe(c, 'maree-haute');
      case 'mareeBasse': return !!etatDe(c, 'maree-basse');
      case 'buffetComplet': return piegesDe(ctx.etat, c).length >= CONST.PIEGES_PAR_POSEUR;
      case 'cibleTombe': return !t.vivant && !!ctx.tombes[t.id];
    }
    return false;
  }
  // Le lanceur est dans le dos de la cible : dans le quart arrière de son orientation.
  function dansLeDos(caseLanceur, t) {
    var v = [caseLanceur[0] - t.case[0], caseLanceur[1] - t.case[1]], f = t.orientation;
    var avant = v[0] * f[0] + v[1] * f[1], cote = Math.abs(v[0] * f[1] - v[1] * f[0]);
    return avant < 0 && -avant >= cote;
  }
  function plusProche(etat, lanceur, depuis, rayon, exclus, toutCamp) {
    var best = null, bd = Infinity;
    if (!depuis) return null;
    etat.combattants.forEach(function (k) {
      if (!k.vivant || !k.case || k.camp === lanceur.camp || k.genre === 'ustensile' || exclus[k.id] || etatDe(k, 'derobe')) return;
      var d = distance(depuis, k.case);
      if (d <= rayon && d < bd) { bd = d; best = k; }
    });
    return best;
  }
  function pousser(ctx, t, n, depuis) {
    var etat = ctx.etat, ev = ctx.ev;
    if (etatDe(t, 'plante')) { ev.push({ type: 'resiste', cible: t.id, etat: 'plante' }); return; }
    var dir = axe(depuis, t.case);
    if (!dir) return;
    var chemin = [t.case.slice()], bloque = 0, heurte = null;
    function vider() { if (chemin.length > 1) ev.push({ type: 'pousse', source: ctx.lanceur.id, cible: t.id, chemin: chemin }); chemin = t.case ? [t.case.slice()] : []; }
    for (var i = 0; i < n; i++) {
      var v = [t.case[0] + dir[0], t.case[1] + dir[1]];
      if (terrain(etat, v) !== 'sol') { bloque = n - i; break; }
      var o = occupantReel(etat, v);
      if (o) { bloque = n - i; heurte = o; break; }
      t.case = v;
      chemin.push(v.slice());
      if (entreeCase(etat, t, ev, vider) || !t.vivant) { bloque = 0; break; }
    }
    vider();
    // Décision 2 : un allié poussé (sort de soutien) ne prend jamais d'Écrasement, et rien ne passe au heurté.
    if (bloque > 0 && t.vivant && t.camp === ctx.lanceur.camp) { ev.push({ type: 'bute', id: t.id, case: t.case.slice(), contre: heurte ? heurte.id : null, poussee: true }); return; }
    if (bloque > 0 && t.vivant) {
      var total = bloque * (CONST.ECRASEMENT.base + bas(ctx.lanceur.niveau / CONST.ECRASEMENT.diviseurNiveau));
      ev.push({ type: 'ecrasement', source: ctx.lanceur.id, cible: t.id, cases: bloque, valeur: total, heurte: heurte ? heurte.id : null });
      infliger(etat, t, total, infoDe(ctx, null, { ecrasement: true, maitre: false }), ev);
      if (!t.vivant) ctx.tombes[t.id] = true;
      if (heurte && heurte.vivant && heurte.camp !== ctx.lanceur.camp) {
        infliger(etat, heurte, bas(total * CONST.ECRASEMENT.partHeurte), infoDe(ctx, null, { ecrasement: true, maitre: false }), ev);
        if (!heurte.vivant) ctx.tombes[heurte.id] = true;
      }
    }
  }
  function attirer(ctx, t, n, vers, type) {
    var etat = ctx.etat, ev = ctx.ev;
    if (etatDe(t, 'plante')) { ev.push({ type: 'resiste', cible: t.id, etat: 'plante' }); return; }
    var chemin = [t.case.slice()];
    function vider() { if (chemin.length > 1) ev.push({ type: type, source: ctx.lanceur.id, cible: t.id, chemin: chemin }); chemin = t.case ? [t.case.slice()] : []; }
    for (var i = 0; i < n; i++) {
      if (distance(t.case, vers) <= 1) break;
      var dir = axe4(t.case, vers), v = [t.case[0] + dir[0], t.case[1] + dir[1]];
      if (terrain(etat, v) !== 'sol' || occupantReel(etat, v)) break;
      t.case = v;
      chemin.push(v.slice());
      if (entreeCase(etat, t, ev, vider) || !t.vivant) break;
    }
    vider();
  }
  function poserEtat(etat, src, cible, b, ev, sortId) {
    var nom = b.etat, def = CONST.ETATS[nom];
    if (!def) return;
    var tours = b.tours === undefined ? def.tours : b.tours;
    var couches = b.couches === undefined ? (nom === 'affine' ? 0 : 1) : b.couches;
    if (nom === 'maree-haute' || nom === 'maree-basse') cible.etats = cible.etats.filter(function (e) { return e.etat !== 'maree-haute' && e.etat !== 'maree-basse'; });
    var e = etatDe(cible, nom), ajout = 0;
    if (e) {
      e.tours = (tours <= 0 || e.tours <= 0) ? 0 : Math.max(e.tours, tours);
      if (def.max > 1 && nom !== 'affine') {
        var voulu = def.cumul === false ? Math.max(e.couches, Math.min(def.max, couches)) : Math.min(def.max, e.couches + couches);
        ajout = voulu - e.couches; e.couches = voulu;
      }
      e.source = src.id;
      if (nom === 'brule') e.valeur = Math.max(e.valeur || 0, b.valeur || def.degats || 0);
    } else {
      e = { etat: nom, tours: tours, couches: Math.min(def.max, couches), source: src.id, sortId: sortId || null };
      if (nom === 'brule') e.valeur = b.valeur || def.degats;
      cible.etats.push(e);
      ajout = e.couches;
    }
    ev.push({ type: 'etat', action: 'pose', source: src.id, cible: cible.id, etat: nom, tours: e.tours, couches: e.couches });
    // Ramolli posé pendant le tour du porteur : il agit tout de suite (dans le plafond des retraits).
    if (nom === 'ramolli' && ajout > 0 && estActif(etat, cible)) {
      var n = Math.min(ajout, CONST.RETRAIT_MAX.pas - cible.retraits.pas);
      if (n > 0) { cible.retraits.pas += n; cible.pas = Math.max(0, cible.pas - n); ev.push({ type: 'retrait', cible: cible.id, quoi: 'pas', n: n, demande: ajout, etat: 'ramolli' }); }
    }
  }
  function appliquerRetrait(etat, cible, quoi, n, ev) {
    if (cible.genre === 'ustensile') return 0;
    var possible = Math.max(0, Math.min(n, CONST.RETRAIT_MAX[quoi] - cible.retraits[quoi]));
    cible.retraits[quoi] += possible;
    if (estActif(etat, cible)) cible[quoi] = Math.max(0, cible[quoi] - possible);
    else cible.attente[quoi] += possible;
    ev.push({ type: 'retrait', cible: cible.id, quoi: quoi, n: possible, demande: n, plafond: possible < n });
    return possible;
  }
  function donnerBonus(etat, src, cible, b, ev) {
    if (cible.genre === 'ustensile') return;
    cible.bonus.push({ carac: b.carac, valeur: b.valeur || 0, tours: b.tours || 0, source: src.id });
    if ((b.carac === 'pas' || b.carac === 'cm') && estActif(etat, cible)) cible[b.carac] = Math.max(0, cible[b.carac] + (b.valeur || 0));
    ev.push({ type: 'bonus', action: 'pose', source: src.id, cible: cible.id, carac: b.carac, valeur: b.valeur || 0, tours: b.tours || 0 });
  }
  function gainCM(etat, k, n, ev, cause) {
    if (!k.vivant || k.genre === 'ustensile') return;
    if (estActif(etat, k)) k.cm += n; else k.cmEnPlus += n;
    ev.push({ type: 'gain-cm', cible: k.id, n: n, cause: cause || null });
  }

  // =====================================================================
  // 14. Au sol : nappes, pièges, fournées, graines, Ustensiles
  // =====================================================================
  function poser(ctx, b) {
    var etat = ctx.etat, c = ctx.lanceur, cs = ctx.centre.slice();
    if (b.cuitTout) etat.sol.filter(function (o) { return o.quoi === 'fournee' && o.poseur === c.id; }).forEach(function (o) { eclater(etat, o, ctx.ev); });
    var o = {
      id: 'o' + prochainId(etat), quoi: b.quoi, poseur: c.id, camp: c.camp, sortId: ctx.sort.id, nom: ctx.sort.nom, element: ctx.sort.element,
      case: cs, origine: (ctx.origine || cs).slice(), tours: b.tours || 0, reste: b.tours || 0, declenche: b.declenche || 'debut',
      zone: normaliserZone(b.zone), touche: b.touche || ctx.sort.touche || 'ennemis', maitre: b.maitre || 0, emplacement: ctx.sort.emplacement,
      effets: copie(b.effets || []), declenches: {}, cache: b.quoi === 'piege', entite: null, commis: b.commis ? copie(b.commis) : null,
      // les renforts du lanceur au moment du lancer valent pour tout ce que l'objet fera plus tard (fournée qui éclate,
      // piège ou nappe qui se déclenche) : un renfort « fois : 1 » ou d'un tour n'est pas perdu pendant la cuisson
      renfort: multRenfort(c, ctx.sortRef)
    };
    if (o.quoi === 'nappe') o.cases = casesZone(etat, o.zone, o.origine, cs, c.orientation).map(function (z) { return z.case; });
    if (o.quoi === 'graine' && o.reste <= 0) o.reste = 1;
    var occupe = occupantReel(etat, cs);
    if (o.quoi === 'ustensile' || o.quoi === 'piege' || o.quoi === 'graine' || (o.quoi === 'fournee' && b.victuailles)) {
      if (occupe) { ctx.ev.push({ type: 'bute', id: c.id, case: cs, contre: occupe.id }); return; }
    }
    if (o.quoi === 'ustensile' || (o.quoi === 'fournee' && b.victuailles)) {
      var e = nouveauCombattant({ id: c.id + '.' + o.quoi + etat.compteur, nom: b.nom || o.nom, genre: 'ustensile', camp: c.camp, niveau: c.niveau,
        maitre: c.id, objet: o.id, victuailles: b.victuailles || 20, joue: false, plafondConservation: c.plafondConservation });
      e.case = cs.slice();
      etat.combattants.push(e);
      o.entite = e.id;
    }
    etat.sol.push(o);
    ctx.ev.push({ type: 'pose', objet: o.id, quoi: o.quoi, case: cs.slice(), poseur: c.id, camp: c.camp, tours: o.tours, cache: o.cache,
      cases: o.cases || [cs.slice()], entite: o.entite, sortId: o.sortId });
    if (o.quoi === 'fournee' && o.tours <= 0) eclater(etat, o, ctx.ev);
  }
  function contexteObjet(etat, o, poseur, ev) {
    var sortRef = sortDe(poseur, o.sortId) || { id: o.sortId, element: o.element, effets: o.effets };
    var pseudo = { id: o.sortId, nom: o.nom, element: o.element, zone: o.zone, touche: o.touche, maitre: o.maitre, effets: o.effets, emplacement: o.emplacement };
    var force = etat.apercu ? { force: etat.apercu } : {};   // pendant un aperçu : jets et coup de maître forcés, jamais de hasard
    var ctx = nouveauContexte(etat, poseur, pseudo, o.case, o.origine, tirerMaitre(etat, poseur, o.maitre > 0 ? Math.min(CONST.PLAFONDS.coupDeMaitre, o.maitre + caracEff(poseur, 'coupDeMaitre')) : 0, force), ev, force, sortRef);
    ctx.objet = o.id;
    if (typeof o.renfort === 'number') ctx.renfort = o.renfort;
    return ctx;
  }
  function retirerObjet(etat, oid, ev, raison) {
    var i = -1;
    for (var k = 0; k < etat.sol.length; k++) if (etat.sol[k].id === oid) i = k;
    if (i < 0) return;
    var o = etat.sol.splice(i, 1)[0];
    if (o.entite) { var e = trouver(etat, o.entite); if (e && e.vivant) { e.vivant = false; e.case = null; } }
    ev.push({ type: 'disparait', objet: o.id, quoi: o.quoi, entite: o.entite, raison: raison, poseur: o.poseur, camp: o.camp });
  }
  function eclater(etat, o, ev) {
    if (etat.sol.indexOf(o) < 0) return;
    var poseur = trouver(etat, o.poseur);
    ev.push({ type: 'declenchement', objet: o.id, quoi: 'fournee', case: o.case.slice() });
    if (poseur && poseur.vivant) {
      var ctx = contexteObjet(etat, o, poseur, ev);
      appliquerEffets(ctx, o.effets, ciblesTouchees(etat, poseur, o.zone, o.touche, o.origine, o.case));
    }
    retirerObjet(etat, o.id, ev, 'eclate');
  }
  function declencherPiege(etat, p, c, ev) {
    var i = etat.sol.indexOf(p);
    if (i >= 0) etat.sol.splice(i, 1);
    ev.push({ type: 'declenchement', objet: p.id, quoi: 'piege', cible: c.id, case: p.case.slice() });
    var poseur = trouver(etat, p.poseur);
    if (poseur && poseur.vivant) appliquerEffets(contexteObjet(etat, p, poseur, ev), p.effets, ciblesTouchees(etat, poseur, p.zone, p.touche, p.origine, p.case));
    ev.push({ type: 'disparait', objet: p.id, quoi: 'piege', entite: null, raison: 'declenche', poseur: p.poseur, camp: p.camp });
  }
  function nappesPour(etat, c, moment, ev, avant) {
    etat.sol.filter(function (o) { return o.quoi === 'nappe' && (o.declenche || 'debut') === moment; }).forEach(function (o) {
      if (!c.vivant || !c.case || etat.sol.indexOf(o) < 0) return;
      if (!o.cases.some(function (k) { return meme(k, c.case); })) return;
      var poseur = trouver(etat, o.poseur);
      if (!poseur || !poseur.vivant || !filtreTouche(poseur, c, o.touche)) return;
      if (o.declenches[c.id] === etat.tourNumero) return;
      o.declenches[c.id] = etat.tourNumero;
      if (avant) { avant(); avant = null; }
      ev.push({ type: 'declenchement', objet: o.id, quoi: 'nappe', cible: c.id, case: c.case.slice() });
      appliquerEffets(contexteObjet(etat, o, poseur, ev), o.effets, [{ c: c, d: distance(o.case, c.case), case: c.case.slice() }]);
    });
  }
  function objetsDebutTour(etat, c, ev) {
    etat.sol.filter(function (o) { return o.poseur === c.id; }).forEach(function (o) {
      if (etat.sol.indexOf(o) < 0 || !c.vivant) return;
      if (o.quoi === 'fournee') {
        o.reste--;
        if (o.reste <= 0) eclater(etat, o, ev); else ev.push({ type: 'cuisson', objet: o.id, reste: o.reste });
      } else if (o.quoi === 'graine') {
        if (o.reste > 0) o.reste--;
        if (o.reste <= 0) germer(etat, o, c, ev);
      } else {
        if (o.quoi === 'ustensile' && o.effets.length && o.entite) {
          ev.push({ type: 'declenchement', objet: o.id, quoi: 'ustensile', case: o.case.slice() });
          appliquerEffets(contexteObjet(etat, o, c, ev), o.effets, ciblesTouchees(etat, c, o.zone, o.touche, o.origine, o.case));
        }
        if (o.tours > 0 && etat.sol.indexOf(o) >= 0 && --o.reste <= 0) retirerObjet(etat, o.id, ev, 'fini');
      }
    });
  }
  function germer(etat, o, c, ev) {
    if (occupantReel(etat, o.case) || commisDe(etat, c).length >= caracEff(c, 'commis')) return;
    retirerObjet(etat, o.id, ev, 'germe');
    invoquerCommis(etat, c, o.commis || { nom: 'Pousse', victuailles: 15, cm: 3, pas: 2, sorts: [] }, o.case, ev);
  }

  // =====================================================================
  // 15. Les Commis
  // =====================================================================
  function invoquerCommis(etat, m, fiche, cs, ev) {
    var gene = occupantReel(etat, cs);
    if (gene) { ev.push({ type: 'bute', id: m.id, case: cs.slice(), contre: gene.id }); return null; }
    if (commisDe(etat, m).length >= caracEff(m, 'commis')) return null;
    var mult = 1 + m.niveau / CONST.COMMIS_DIVISEUR_NIVEAU;
    var k = nouveauCombattant({
      id: m.id + '.commis' + prochainId(etat), nom: fiche.nom || 'Commis', genre: 'commis', camp: m.camp, niveau: m.niveau, maitre: m.id,
      victuailles: arrondi((fiche.victuailles || 20) * mult), cm: fiche.cm || 3, pas: fiche.pas || 3, ouverture: fiche.ouverture || 0,
      rideau: fiche.rideau || 0, fauxFuyant: fiche.fauxFuyant || 0, conservation: fiche.conservation, affinites: fiche.affinites,
      multDegats: mult, controle: 'ia', comportement: fiche.comportement || 'colle', plafondConservation: m.plafondConservation, commis: 0
    });
    k.sorts = (fiche.sorts || []).map(normaliserSort);
    k.sorts.forEach(function (s) { if (s.relanceInitiale) k.relances[s.id] = s.relanceInitiale; });
    k.case = cs.slice();
    var e = plusProche(etat, k, cs, Infinity, {}, true);
    if (e) orienter(k, e.case);
    etat.combattants.push(k);
    var i = etat.frise.indexOf(m.id);
    if (i < 0) etat.frise.push(k.id);
    else {
      var j = i + 1;
      while (j < etat.frise.length) { var x = trouver(etat, etat.frise[j]); if (x && x.genre === 'commis' && x.maitre === m.id) j++; else break; }
      etat.frise.splice(j, 0, k.id);
      if (j <= etat.indexActif) etat.indexActif++;
    }
    ev.push({ type: 'invoque', id: k.id, maitre: m.id, nom: k.nom, case: cs.slice(), victuailles: k.victuailles });
    entreeCase(etat, k, ev);
    return k;
  }

  // =====================================================================
  // 16. Tomber au combat, fin du combat, Addition
  // =====================================================================
  function tomber(etat, c, info, ev) {
    if (!c.vivant) return;
    var ou = c.case ? c.case.slice() : null;
    c.vivant = false;
    c.case = null;
    ev.push({ type: 'tombe', id: c.id, genre: c.genre, case: ou, par: info.source || null });
    etat.chutes.push(c.id);
    if (etatDe(c, 'feve') && info.source) { var k = trouver(etat, info.source); if (k && k.vivant) gainCM(etat, k, 1, ev, 'feve'); }
    if (c.genre === 'monstre') chuteCommande(etat, c, info, ev);
    if (c.objet) retirerObjet(etat, c.objet, ev, 'casse');
    if (c.genre === 'ustensile') return;
    etat.sol.filter(function (o) { return o.poseur === c.id; }).forEach(function (o) { retirerObjet(etat, o.id, ev, 'poseur'); });
    etat.combattants.forEach(function (k) { if (k.vivant && k.maitre === c.id && k.genre !== 'ustensile') tomber(etat, k, { source: null, cause: 'maitre' }, ev); });
    etat.combattants.forEach(function (k) {
      if (k === c) return;
      k.etats = k.etats.filter(function (e) {
        if (e.source === c.id && e.etat !== 'feve') { ev.push({ type: 'etat', action: 'fini', cible: k.id, etat: e.etat }); return false; }
        return true;
      });
      k.bonus = k.bonus.filter(function (b) { return b.source !== c.id; });
      k.boucliers = k.boucliers.filter(function (b) { return b.source !== c.id; });
    });
  }
  function verifierFin(etat, ev) {
    if (etat.phase !== 'combat') return;
    var a = etat.combattants.some(function (c) { return c.vivant && c.genre === 'artisan'; });
    var m = etat.combattants.some(function (c) { return c.vivant && c.genre === 'monstre'; });
    if (a && m) return;
    terminerCombat(etat, a ? 'artisans' : 'monstres', ev);
  }
  function terminerCombat(etat, vainqueur, ev, abandon) {
    etat.phase = 'fin';
    var k = etat.commande;
    if (k && k.choisie === 'fait-minute' && etat.manche > CONST.MANCHES_FAIT_MINUTE) violerCommande(etat, 'fait-minute', null, ev, 'le combat a duré ' + etat.manche + ' manches');
    etat.resultat = { vainqueur: vainqueur, manche: etat.manche, abandon: !!abandon, addition: calculerAddition(etat, vainqueur, abandon) };
    ev.push({ type: 'fin', vainqueur: vainqueur, manche: etat.manche, addition: copie(etat.resultat.addition) });
  }
  function calculerAddition(etat, vainqueur, abandon) {
    var artisans = etat.combattants.filter(function (c) { return c.genre === 'artisan'; });
    var monstres = etat.combattants.filter(function (c) { return c.genre === 'monstre'; });
    var victoire = vainqueur === 'artisans', k = etat.commande;
    var commandeOk = !!(k && k.choisie && k.respectee && victoire);
    // sur une défaite, une Commande tenue jusque-là est « sans objet » (respectee: null, pas de bonus) ; ratée, elle reste ratée
    var add = { victoire: victoire, xp: {}, ble: {}, objets: {}, commande: k && k.choisie ? { id: k.choisie, respectee: (victoire || !k.respectee) ? k.respectee : null,
      appliquee: commandeOk, raison: (victoire || !k.respectee) ? k.raison : 'Sans objet : pas de bonus sur une défaite', bonus: k.bonus[k.choisie] } : null };
    var somNiv = 0, nivMax = 0, xpM = 0, bleM = 0;
    artisans.forEach(function (a) { somNiv += a.niveau; });
    monstres.forEach(function (m) {
      nivMax = Math.max(nivMax, m.niveau);
      if (victoire) { xpM += m.xp; bleM += m.ble; }
      else if (!m.vivant) xpM += m.xp * CONST.DEFAITE_PART_XP;
    });
    if (abandon) xpM = 0;
    var coef = CONST.GROUPE_XP[Math.min(CONST.GROUPE_XP.length - 1, artisans.length)];
    var E = CONST.ECART_NIVEAU;
    artisans.forEach(function (a) {
      var ecart = Math.max(E.minimumPct, 100 - E.pctParNiveau * Math.max(0, a.niveau - nivMax - E.seuil)) / 100;
      var bonusC = (commandeOk && k.choix[a.id] !== 'ristourne') ? k.bonus[k.choisie] / 100 : 0;
      add.xp[a.id] = a.abandon ? 0 : bas(xpM * coef * (a.niveau / somNiv) * (1 + a.carac.savoirFaire / 100) * ecart * (1 + bonusC) * (1 + (etat.options.arrivage || 0) / 100));
      add.ble[a.id] = 0;
      add.objets[a.id] = [];
    });
    var servis = artisans.filter(function (a) { return !a.abandon; });
    if (victoire && servis.length) {
      var ordre = servis.slice().sort(function (x, y) { return ristourneDe(etat, y, commandeOk) - ristourneDe(etat, x, commandeOk); });
      var part = Math.floor(bleM / ordre.length), reste = bleM - part * ordre.length;
      ordre.forEach(function (a, i) { add.ble[a.id] = part + (i < reste ? 1 : 0); });
      monstres.forEach(function (m) {
        (m.objets || []).forEach(function (o) {
          for (var i = 0; i < ordre.length; i++) {
            var taux = o.taux * (100 + ristourneDe(etat, ordre[i], commandeOk)) / 100;
            if (hasard(etat) * 100 < taux) { add.objets[ordre[i].id].push({ id: o.id, nom: o.nom || o.id, de: m.id }); break; }
          }
        });
      });
    }
    return add;
  }
  function ristourneDe(etat, a, commandeOk) {
    var k = etat.commande;
    return a.carac.ristourne + ((commandeOk && k.choix[a.id] === 'ristourne') ? k.bonus[k.choisie] : 0);
  }
  // Abandonner vaut défaite, sans butin (partie 3.19). En groupe, celui qui abandonne quitte le service comme un absent
  // (il compte comme tombé, partie 3.5) et n'aura rien à l'Addition ; le combat continue pour les autres.
  // S'il était le dernier artisan debout (ou seul), c'est la défaite pour tous, sans butin.
  function abandonner(etat, id) {
    if (etat.phase !== 'combat') return refus('Le combat n\'est pas en cours');
    var c = trouver(etat, id);
    if (!c || c.genre !== 'artisan') return refus('Seul un artisan peut abandonner');
    if (!c.vivant) return refus(c.nom + ' a rendu son tablier');
    var ev = [];
    var autres = etat.combattants.some(function (k) { return k !== c && k.vivant && k.genre === 'artisan'; });
    if (!autres) { terminerCombat(etat, 'monstres', ev, true); return reussite(ev); }
    c.abandon = true;
    ev.push({ type: 'quitte', id: c.id, abandon: true });
    tomber(etat, c, { source: null, cause: 'abandon' }, ev);
    apresAction(etat, c, ev);
    return reussite(ev);
  }
  function resultat(etat) {
    return { fini: etat.phase === 'fin', vainqueur: etat.resultat ? etat.resultat.vainqueur : null, manche: etat.manche,
      addition: etat.resultat ? copie(etat.resultat.addition) : null, commande: etat.commande ? copie(etat.commande) : null };
  }

  // =====================================================================
  // 17. La Commande : contrôle du respect
  // =====================================================================
  // raison : ce qui s'est passé (« Merlanceur a fini son tour au contact d'un ennemi ») ; la règle reste dans regle.
  function violerCommande(etat, idc, c, ev, fait) {
    var k = etat.commande;
    if (!k || k.choisie !== idc || !k.respectee) return;
    k.respectee = false;
    k.raison = COMMANDES[idc].nom + ' : ' + (fait || (COMMANDES[idc].regle + (c ? ' (' + c.nom + ')' : '')));
    ev.push({ type: 'commande', commande: idc, respectee: false, par: c ? c.id : null, raison: k.raison, regle: COMMANDES[idc].regle });
  }
  function chuteCommande(etat, m, info, ev) {
    var k = etat.commande;
    if (!k || !k.choisie || !k.respectee) return;
    if (k.choisie === 'a-la-chaine') {
      if (k.ordre[k.prochain] === m.id) k.prochain++;
      else { var attendu = trouver(etat, k.ordre[k.prochain]); violerCommande(etat, 'a-la-chaine', null, ev, m.nom + ' est tombé avant ' + (attendu ? attendu.nom : 'son tour')); }
    }
    if (k.choisie === 'fait-main' && !info.outil) violerCommande(etat, 'fait-main', null, ev, m.nom + ' est tombé sans Coup d\'outil');
  }

  // =====================================================================
  // 18. Pain de route
  // =====================================================================
  function valeurPain(c) { var P = CONST.PAIN_DE_ROUTE; return P.base + Math.floor(P.facteurNiveau * c.niveau / P.diviseurNiveau); }
  function raisonPain(etat, c) {
    var P = CONST.PAIN_DE_ROUTE;
    if (c.genre !== 'artisan') return 'Seuls les artisans ont un Sac';
    if (c.pain <= 0) return 'Plus de Pain de route';
    if (c.tour.pain >= P.parTour) return 'Déjà mangé ce tour';
    if (c.cm < P.cm) return 'Pas assez de coups de main (' + P.cm + ' CM)';
    if (c.victuailles >= maxVictuailles(c)) return 'Victuailles déjà pleines';
    return null;
  }
  // Ce que ferait le Pain de route maintenant : disponible, raison du refus, Victuailles vraiment rendues.
  function apercuPain(etat, id) {
    var c = trouver(etat, id);
    if (!c || !c.vivant) return { ok: false, disponible: false, raison: 'Combattant absent', valeur: 0, cm: CONST.PAIN_DE_ROUTE.cm, reste: 0 };
    var r = verifActif(etat, id) || raisonPain(etat, c);
    var reel = Math.max(0, Math.min(valeurPain(c), maxVictuailles(c) - c.victuailles));
    return { ok: !r, disponible: !r, raison: r || null, valeur: reel, valeurPleine: valeurPain(c), cm: CONST.PAIN_DE_ROUTE.cm, reste: c.pain };
  }
  function utiliserPainDeRoute(etat, id) {
    var r = verifActif(etat, id);
    if (r) return refus(r);
    var c = trouver(etat, id), r2 = raisonPain(etat, c);
    if (r2) return refus(r2);
    var ev = [];
    c.absences = 0;
    c.cm -= CONST.PAIN_DE_ROUTE.cm;
    c.pain--;
    c.tour.pain++;
    ev.push({ type: 'pain', id: c.id, reste: c.pain, cm: CONST.PAIN_DE_ROUTE.cm });
    soigner(etat, c, c, valeurPain(c), { pain: true, sortId: 'sac.pain-de-route' }, ev);
    apresAction(etat, c, ev);
    return reussite(ev);
  }

  // =====================================================================
  // 19. Aperçus (rien n'est tiré au hasard, l'état n'est pas touché)
  // =====================================================================
  // Ce que voit un camp. vueInterne garde la graine (les aperçus rejouent un sort sur cette copie) ;
  // vuePour, faite pour l'envoi au client, retire aussi la graine du hasard et le compteur d'objets.
  function vueInterne(etat, camp) {
    var v = copie(etat);
    v.combattants.forEach(function (c) {
      if (!c.vivant || !estCachePour(c, camp)) return;
      // un ennemi Dérobé : rien qui permette de retrouver sa case (case, case de début de tour, orientation, Pas marchés)
      c.case = null; c.cache = true; c.orientation = null; c.derniereCaseDebut = null; c.tour = tourVide();
    });
    v.sol = v.sol.filter(function (o) { return !(o.quoi === 'piege' && o.camp !== camp); });
    return v;
  }
  function vuePour(etat, camp) {
    var v = vueInterne(etat, camp);
    delete v.alea; delete v.compteur;
    return v;
  }
  // Les événements qu'un camp peut recevoir : sans le chemin ni la case d'un ennemi Dérobé, sans les pièges de l'autre camp.
  // etat : l'état APRÈS l'action (celui que l'action vient de modifier). On remonte les événements pour savoir qui était
  // Dérobé à chaque instant (un Dérobé qui lance un sort se montre un instant : l'événement « revele » est gardé).
  function evenementsPour(etat, evenements, camp) {
    var liste = evenements || [], cache = {}, campDe = {}, piegesSorts = {};
    etat.combattants.forEach(function (c) { campDe[c.id] = c.camp; if (c.camp !== camp && etatDe(c, 'derobe')) cache[c.id] = true; });
    etat.combattants.forEach(function (c) { c.sorts.forEach(function (s) { if (s.effets.some(function (b) { return b.type === 'pose' && b.quoi === 'piege'; })) piegesSorts[c.id + '|' + s.id] = true; }); });
    var avant = new Array(liste.length);
    for (var i = liste.length - 1; i >= 0; i--) {
      var x = liste[i];
      avant[i] = Object.assign({}, cache);
      if (x.type === 'etat' && x.etat === 'derobe' && campDe[x.cible] !== camp) {
        if (x.action === 'pose') delete cache[x.cible]; else if (x.action === 'fini') cache[x.cible] = true;
      }
      if (x.type === 'tombe' && campDe[x.id] !== camp && etatDe(trouver(etat, x.id) || { etats: [] }, 'derobe')) cache[x.id] = true;
    }
    var out = [];
    liste.forEach(function (x, i) {
      var H = avant[i], y;
      // (avant[i] = qui est Dérobé juste APRÈS l'événement i ; pour l'événement qui le pose, on garde l'icône sans case)
      switch (x.type) {
        case 'deplacement': case 'bond': case 'dans-le-dos': case 'rideau':
          if (H[x.id]) return; break;
        case 'bute':
          if (H[x.id]) return; break;
        case 'echange':
          if (H[x.id] || H[x.avec]) return; break;
        case 'pousse': case 'attire': case 'ramene':
          if (H[x.cible]) return; break;
        case 'declenchement':
          if (x.cible && H[x.cible]) { y = Object.assign({}, x); y.case = null; out.push(y); return; }
          break;
        case 'lancer':
          if (campDe[x.id] !== camp && piegesSorts[x.id + '|' + x.sortId]) { y = Object.assign({}, x); y.case = null; y.cache = true; out.push(y); return; }
          break;
        case 'pose':
          if (x.quoi === 'piege' && x.camp !== camp) return;
          break;
        case 'disparait':
          if (x.quoi === 'piege' && x.raison !== 'declenche' && x.camp !== camp) return;
          break;
      }
      out.push(x);
    });
    return out;
  }

  function apercuSort(etat, id, sortId, cs) {
    var c = trouver(etat, id);
    if (!c || !c.vivant) return refus('Combattant absent');
    var sort = sortDe(c, sortId);
    if (!sort) return refus('Sort inconnu');
    if (sort.cible === 'soi' && !cs) cs = c.case;
    var r = verifActif(etat, id) || raisonLancer(etat, c, sort, cs);
    if (r) return refus(r);
    var chance = chanceMaitre(c, sort), chanceP = 0;
    // un objet posé (fournée, piège, nappe) a son propre taux de coup de maître : l'aperçu montre aussi sa fourchette maître
    sort.effets.forEach(function (b) { if (b.type === 'pose' && b.maitre > 0) chanceP = Math.max(chanceP, Math.min(CONST.PLAFONDS.coupDeMaitre, b.maitre + caracEff(c, 'coupDeMaitre'))); });
    var avecMaitre = chance > 0 || chanceP > 0;
    var modes = [{ jet: 'min', maitre: false }, { jet: 'max', maitre: false }];
    if (avecMaitre) modes.push({ jet: 'min', maitre: true }, { jet: 'max', maitre: true });
    var parCible = {}, poses = [], autres = [], parEcl = {}, zoneEcl = null, toursEcl = 0;
    function compter(table, x, im) {
      var idc = x.cible || (x.type === 'tombe' ? x.id : null);
      if (!idc) return false;
      var p = table[idc] || (table[idc] = { id: idc, degats: [0, 0, 0, 0], soin: [0, 0, 0, 0], bouclier: 0, tombe: [false, false, false, false], effets: [] });
      if (x.type === 'degats') p.degats[im] += x.valeur;
      else if (x.type === 'soin') p.soin[im] += x.valeur;
      else if (x.type === 'tombe') p.tombe[im] = true;
      else if (im === 0) { if (x.type === 'bouclier') p.bouclier += x.valeur; if (x.type !== 'declenchement') p.effets.push(x); }
      return true;
    }
    modes.forEach(function (m, im) {
      var e2 = vueInterne(etat, c.camp), c2 = trouver(e2, id), ev = [];
      e2.apercu = m;   // copie jetable : les objets posés ou déclenchés pendant l'aperçu ne tirent pas au hasard non plus
      executerSort(e2, c2, sortDe(c2, sortId), cs.slice(), ev, { force: m });
      ev.forEach(function (x) {
        if (!compter(parCible, x, im) && im === 0 && (x.type === 'pose' || x.type === 'invoque' || x.type === 'bond' || x.type === 'dans-le-dos' || x.type === 'echange')) poses.push(x);
      });
      if (im === 0) autres = ev.filter(function (x) { return x.type === 'rebond'; });
      // une fournée qui cuit : ce qu'elle ferait si elle éclatait maintenant, aux positions actuelles (les cibles peuvent bouger d'ici là)
      var evE = [];
      ev.forEach(function (x) {
        if (x.type !== 'pose' || x.quoi !== 'fournee' || !(x.tours > 0)) return;
        var o = null;
        e2.sol.forEach(function (k) { if (k.id === x.objet) o = k; });
        if (!o) return;
        if (im === 0) { zoneEcl = casesZone(e2, o.zone, o.origine, o.case, c2.orientation).map(function (z) { return z.case; }); toursEcl = x.tours; }
        eclater(e2, o, evE);
      });
      evE.forEach(function (x) { compter(parEcl, x, im); });
    });
    function versCibles(table) { return Object.keys(table).map(function (idc) {
      var p = table[idc], k = trouver(etat, idc) || { nom: idc, camp: null };
      var tombe = p.tombe[0] ? 'sur' : (p.tombe.some(function (t) { return t; }) ? 'possible' : null);
      return { id: idc, nom: k.nom, camp: k.camp, allie: k.camp === c.camp,
        degats: (p.degats[1] || p.degats[3]) ? { min: p.degats[0], max: p.degats[1], maitreMin: avecMaitre ? p.degats[2] : null, maitreMax: avecMaitre ? p.degats[3] : null } : null,
        soin: (p.soin[1] || p.soin[3]) ? { min: p.soin[0], max: p.soin[1], maitreMin: avecMaitre ? p.soin[2] : null, maitreMax: avecMaitre ? p.soin[3] : null } : null,
        bouclier: p.bouclier || null, tombe: tombe, effets: p.effets };
    }); }
    var cibles = versCibles(parCible);
    var zone = casesZone(etat, sort.zone, c.case, cs, c.orientation).map(function (z) { return z.case; });
    return { ok: true, sortId: sortId, case: cs.slice(), zone: zone, chanceMaitre: chance, chanceMaitrePose: chanceP, cm: sort.cm, cibles: cibles, poses: poses, rebonds: autres,
      eclatement: zoneEcl ? { zone: zoneEcl, tours: toursEcl, cibles: versCibles(parEcl) } : null };
  }

  // =====================================================================
  // 20. L'IA des monstres (partie 3.22), aussi utilisée par les Commis et la simulation
  // =====================================================================
  function iaInfos(etat, c) {
    var vu = indexVu(etat, c.camp), ennemis = [], allies = [];
    etat.combattants.forEach(function (k) {
      if (!k.vivant || !k.case || estCachePour(k, c.camp)) return;
      if (k.camp !== c.camp) { if (k.genre !== 'ustensile') ennemis.push(k); }
      else if (k.genre !== 'ustensile') allies.push(k);
    });
    var fragile = null;
    ennemis.forEach(function (e) { if (!fragile || e.victuailles + bouclierTotal(e) < fragile.victuailles + bouclierTotal(fragile)) fragile = e; });
    var menaces = ennemis.map(function (e) { var r = porteeDegats(e); return { e: e, rayon: r, portee: (e.pasBase + sommeBonus(e, 'pas')) + r, degats: degatsParTour(e) }; });
    return { vu: vu, ennemis: ennemis, allies: allies, fragile: fragile, menaces: menaces };
  }
  function porteeDegats(e) {
    var p = 0;
    e.sorts.forEach(function (s) { if (contientType(s.effets, ['degats'])) p = Math.max(p, rayonMax(e, s) + (s.zone.forme === 'case' ? 0 : s.zone.taille)); });
    return p;
  }
  function degatsParTour(e) {
    var best = 0;
    e.sorts.forEach(function (s) {
      var d = 0;
      s.effets.forEach(function (b) { if (b.type === 'degats') d += (b.min + b.max) / 2; });
      if (!d) return;
      var n = Math.floor(Math.max(1, e.cmBase) / Math.max(1, s.cm));
      if (s.parTour) n = Math.min(n, s.parTour);
      if (s.relance) n = Math.min(n, 1);
      best = Math.max(best, d * n * (e.multDegats || 1));
    });
    return best;
  }
  function iaDanger(c, cs, info) {
    var d = 0;
    info.menaces.forEach(function (m) { if (distance(m.e.case, cs) <= m.portee) d += m.degats; });
    return d;
  }
  function autour(cs, r) {
    var out = [];
    for (var dx = -r; dx <= r; dx++) for (var dy = -r; dy <= r; dy++) if (Math.abs(dx) + Math.abs(dy) <= r) out.push([cs[0] + dx, cs[1] + dy]);
    return out;
  }
  function iaCandidats(etat, c, s, origine, info) {
    if (s.cible === 'soi') return [origine];
    var res = {};
    function add(cs) { if (terrain(etat, cs) === 'sol') res[cle(cs)] = cs; }
    var ext = s.zone.forme === 'case' ? 0 : (['ligne', 'cone', 'demi-rond'].indexOf(s.zone.forme) >= 0 ? 0 : s.zone.taille);
    var offensif = s.touche !== 'allies' && contientType(s.effets, ['degats', 'etat', 'retire', 'pousse', 'attire', 'entame']);
    var pose = contientType(s.effets, ['pose']), invoque = contientType(s.effets, ['invoque']);
    if (offensif && !pose) info.ennemis.forEach(function (e) { autour(e.case, ext).forEach(add); });
    if (s.touche === 'allies' || contientType(s.effets, ['soin', 'bouclier', 'bonus'])) info.allies.forEach(function (a) { add(a === c ? origine : a.case); });
    if (pose) info.ennemis.forEach(function (e) { autour(e.case, Math.max(1, s.zone.taille || 0, maxZonePose(s))).forEach(add); });
    if (invoque) autour(origine, 1).forEach(add);
    return Object.keys(res).map(function (k) { return res[k]; });
  }
  function maxZonePose(s) { var t = 0; s.effets.forEach(function (b) { if (b.type === 'pose' && b.zone) t = Math.max(t, b.zone.taille || 0); }); return t; }
  function probaAuMoins(min, max, seuil) { if (max < seuil) return 0; if (min >= seuil) return 1; return (max - seuil + 1) / (max - min + 1); }
  function valeurEtat(b, t, c) {
    var ennemi = t.camp !== c.camp, v = { ramolli: 6, enracine: 7, fume: 6, attendri: 5, affine: 3, feve: 3 }[b.etat];
    if (b.etat === 'brule') return ennemi ? (b.valeur || CONST.ETATS.brule.degats) * Math.max(1, b.tours || 2) * 0.8 : 0;
    if (ennemi) return v || 1;
    return { glissant: 3, plante: 1, derobe: 6, nappe: 0 }[b.etat] || 1;
  }
  // Valeur attendue d'un sort lancé depuis « origine » sur « cs » (en Victuailles environ).
  function iaEvaluer(etat, c, s, origine, cs, info, occ) {
    var touches = ciblesTouchees(etat, { camp: c.camp, orientation: c.orientation }, s.zone, s.touche, origine, cs, occ);
    var p = chanceMaitre(c, s) / 100, val = 0, acc = {};
    var virtuel = { case: origine };
    function parcourir(effets, cibles, poids) {
      effets.forEach(function (b) {
        switch (b.type) {
          case 'degats':
            cibles.forEach(function (t) {
              if (t.c.camp === c.camp) return;
              var f = fourchetteDegats(c, b, s, t.c, t.d, s.zone.baisse !== false, 1), k = poids + '|' + t.c.id;
              var a = acc[k] || (acc[k] = { t: t.c, w: poids, min: 0, max: 0, mmin: 0, mmax: 0 });
              a.min += f.min; a.max += f.max; a.mmin += f.maitreMin; a.mmax += f.maitreMax;
            });
            break;
          case 'soin':
            cibles.forEach(function (t) {
              if (t.c.camp !== c.camp) return;
              var moy = (b.min + b.max) / 2 * (100 + caracEff(c, 'levure')) / 100 + caracEff(c, 'remontant');
              val += Math.min(maxVictuailles(t.c) - t.c.victuailles, moy) * 0.9 * poids;
            });
            break;
          case 'bouclier': cibles.forEach(function (t) { if (t.c.camp === c.camp) val += b.valeur * 0.35 * poids; }); break;
          case 'etat': cibles.forEach(function (t) { val += valeurEtat(b, t.c, c) * poids; }); break;
          case 'retire': cibles.forEach(function (t) { if (t.c.camp !== c.camp) val += (b.quoi === 'cm' ? 6 : 4) * Math.max(0, Math.min(b.n || 1, 2 - t.c.retraits[b.quoi === 'cm' ? 'cm' : 'pas'])) * poids; }); break;
          case 'pousse': case 'attire': cibles.forEach(function (t) { if (t.c.camp !== c.camp) val += 1.5 * poids; }); break;
          case 'bonus': val += 3 * poids; break;
          case 'gainCM': val += 4 * (b.n || 1) * poids; break;
          case 'entame': val += 2 * poids * cibles.length; break;
          case 'renforce': val += 2 * poids; break;
          case 'invoque': if (commisDe(etat, c).length < caracEff(c, 'commis')) val += 25 * poids; break;
          case 'pose':
            if (b.quoi === 'graine') { if (commisDe(etat, c).length < caracEff(c, 'commis')) val += 18 * poids; break; }
            if (b.quoi === 'ustensile') { val += 4 * poids; break; }
            var sous = ciblesTouchees(etat, { camp: c.camp, orientation: c.orientation }, b.zone, b.touche || s.touche, origine, cs, occ);
            parcourir(b.effets || [], sous, poids * (CONST.IA.poidsPose[b.quoi] || 0.4) * (b.quoi === 'nappe' ? Math.min(2, Math.max(1, b.tours || 1)) : 1));
            break;
          case 'si':
            if (b.condition === 'cibleTombe') { parcourir(b.effets || [], cibles, poids * 0.3); break; }
            if (CONDITIONS_LANCEUR[b.condition]) { if (conditionVraie({ lanceur: c, etat: etat, tombes: {} }, b, null)) parcourir(b.effets || [], cibles, poids); break; }
            var ok = cibles.filter(function (t) { return conditionVraie({ lanceur: Object.assign({}, c, virtuel), etat: etat, tombes: {} }, b, t.c); });
            if (ok.length) parcourir(b.effets || [], ok, poids);
            break;
          case 'rebond':
            var moy = 0;
            effets.forEach(function (d) { if (d.type === 'degats') moy += (d.min + d.max) / 2; });
            val += moy * (b.part || 50) / 100 * Math.min(b.fois || 1, Math.max(0, info.ennemis.length - 1)) * 0.6 * poids;
            break;
        }
      });
    }
    parcourir(s.effets, touches, 1);
    // Chaque groupe (cible, poids) : dégâts utiles + chance de la faire tomber, le tout pondéré (une pose agit plus tard).
    Object.keys(acc).forEach(function (k) {
      var a = acc[k], t = a.t, pv = t.victuailles + bouclierTotal(t), w = a.w * (t.genre === 'ustensile' ? 0.3 : 1);
      var moy = (1 - p) * (a.min + a.max) / 2 + p * (a.mmin + a.mmax) / 2, v = Math.min(moy, pv);
      if (t.genre !== 'ustensile') {
        var pc = (1 - p) * probaAuMoins(a.min, a.max, pv) + p * probaAuMoins(a.mmin, a.mmax, pv);
        v += pc * (CONST.IA.bonusChute + t.niveau);
        if (pc >= 1 && a.w === 1) v += CONST.IA.bonusChuteSure;   // effet immédiat (pas une pose) qui fait tomber à coup sûr
      }
      if (info.fragile && t === info.fragile && moy > 0) v += CONST.IA.bonusFragile;
      val += v * w;
    });
    return val;
  }
  function occVirtuelle(vu, c, cs) {
    var o = {};
    for (var k in vu) if (vu[k] !== c) o[k] = vu[k];
    o[cle(cs)] = c;
    return o;
  }
  function iaMeilleurCoup(etat, c) {
    var info = iaInfos(etat, c);
    if (!info.ennemis.length) return null;
    var positions = [{ case: c.case.slice(), cm: c.cm, pas: c.pas, cout: 0 }];
    if (c.pas > 0 && !etatDe(c, 'enracine')) positions = positions.concat(planifier(etat, c).liste);
    var sorts = c.sorts.filter(function (s) { return !raisonSort(etat, c, s, true); });
    var poids = CONST.IA.poidsDanger[c.comportement] || CONST.IA.poidsDanger.colle, best = null;
    positions.forEach(function (p) {
      var danger = iaDanger(c, p.case, info), occ = occVirtuelle(info.vu, c, p.case);
      sorts.forEach(function (s) {
        if (s.cm > p.cm) return;
        iaCandidats(etat, c, s, p.case, info).forEach(function (cs) {
          if (raisonCase(etat, c, s, cs, { origine: p.case, occ: occ })) return;
          var v = iaEvaluer(etat, c, s, p.case, cs, info, occ);
          if (v <= 0.5) return;
          var total = v - danger * poids * (p.pas > 0 ? 0.5 : 1) - p.cout * 0.3 - (c.cm - p.cm) * 2 - s.cm * 0.2;
          if (!best || total > best.valeur) best = { valeur: total, depuis: p.case.slice(), sortId: s.id, cible: cs.slice() };
        });
      });
    });
    if (!raisonPain(etat, c)) {
      var max = maxVictuailles(c), ratio = c.victuailles / max;
      if (ratio < 0.5) {
        var v = Math.min(valeurPain(c), max - c.victuailles) * (1.5 + 2 * (0.5 - ratio));
        if (!best || v > best.valeur) best = { valeur: v, pain: true };
      }
    }
    return best;
  }
  function distancesSol(etat, depuis) {
    var d = {}, file = [depuis];
    d[cle(depuis)] = 0;
    while (file.length) {
      var u = file.shift();
      DIRS.forEach(function (k) {
        var v = [u[0] + k[0], u[1] + k[1]];
        if (terrain(etat, v) !== 'sol' || d[cle(v)] !== undefined) return;
        d[cle(v)] = d[cle(u)] + 1;
        file.push(v);
      });
    }
    return d;
  }
  function iaPlacementFinal(etat, c, ev) {
    if (c.pas <= 0 || etatDe(c, 'enracine')) return;
    var info = iaInfos(etat, c);
    if (!info.ennemis.length) return;
    var poss = [{ case: c.case.slice(), cout: 0 }].concat(planifier(etat, c).liste);
    var choix = null, best = -Infinity;
    if (c.comportement === 'tire') {
      // « si possible hors de vue de l'artisan au plus grand Rayon » (partie 3.22, point 3)
      var tireur = null, pt = -1;
      info.menaces.forEach(function (m) { if (m.rayon > pt) { pt = m.rayon; tireur = m.e; } });
      var T = CONST.IA.tire;
      poss.forEach(function (p) {
        var dmin = Infinity;
        info.ennemis.forEach(function (e) { dmin = Math.min(dmin, distance(e.case, p.case)); });
        var s = 0;
        if (dmin <= 1) s -= 100;
        else if (dmin < T.min) s -= (T.min - dmin) * 15;
        else if (dmin > T.max) s -= (dmin - T.max) * 8;
        else s += 20;
        if (tireur && !ligneDeVue(etat, p.case, tireur.case, { ignorer: c.id, occ: occVirtuelle(info.vu, c, p.case) })) s += 12;
        s -= iaDanger(c, p.case, info) * 0.4 + p.cout * 0.2;
        if (s > best) { best = s; choix = p; }
      });
    } else {
      var cible = info.fragile;
      if (distance(c.case, cible.case) === 1) return;
      var dist = distancesSol(etat, cible.case);
      poss.forEach(function (p) {
        var d = dist[cle(p.case)];
        if (d === undefined) d = 50 + distance(p.case, cible.case);
        var s = -d * 10 - p.cout * 0.1 - iaDanger(c, p.case, info) * 0.02;
        if (s > best) { best = s; choix = p; }
      });
    }
    if (choix && !meme(choix.case, c.case)) {
      var r = deplacer(etat, c.id, choix.case);
      if (r.ok) Array.prototype.push.apply(ev, r.evenements);
    }
  }
  function iaJoue(etat, id) {
    var r = verifActif(etat, id);
    if (r) return refus(r);
    var c = trouver(etat, id), ev = [];
    function suivre(res) { if (res && res.ok) Array.prototype.push.apply(ev, res.evenements); return res && res.ok; }
    for (var garde = 0; garde < 15 && estActif(etat, c); garde++) {
      var choix = iaMeilleurCoup(etat, c);
      if (!choix) break;
      if (choix.pain) { if (!suivre(utiliserPainDeRoute(etat, id))) break; continue; }
      if (!meme(choix.depuis, c.case)) {
        if (!suivre(deplacer(etat, id, choix.depuis))) break;
        if (!estActif(etat, c) || !meme(choix.depuis, c.case)) continue;
      }
      if (!suivre(lancer(etat, id, choix.sortId, choix.cible))) break;
    }
    if (estActif(etat, c)) iaPlacementFinal(etat, c, ev);
    if (estActif(etat, c)) suivre(finDuTour(etat, id));
    return reussite(ev);
  }
  // Placement automatique pendant la Mise en place (simulation, artisan absent).
  // Valeur d'une case de départ pour un artisan : les dégâts que les monstres pourraient lui faire avant et pendant
  // la première manche (portée = Pas + Rayon ; un tireur qui le voit déjà frappe sans bouger), contre ce qu'il pourrait
  // leur faire à son premier tour. opts.pire : la case la plus mauvaise (pour la simulation).
  function valeurCaseDepart(etat, c, cs) {
    var monstres = etat.combattants.filter(function (k) { return k.genre === 'monstre' && k.case; });
    var occ = indexReel(etat), danger = 0;
    monstres.forEach(function (m) {
      var d = distance(m.case, cs), rm = porteeDegats(m), pm = m.pasBase + sommeBonus(m, 'pas'), dm = degatsParTour(m);
      var vue = ligneDeVue(etat, m.case, cs, { ignorer: c.id, occ: occ });
      // être vu dès le départ coûte cher (un tireur avance en gardant la vue) ; un décor entre les deux protège
      var proche = d <= rm + pm ? 1 : (d <= rm + 2 * pm ? 0.6 : 0.3);
      danger += dm * proche * (vue ? 1 : 0.35) * (m.comportement === 'tire' ? 1.5 : 1);
    });
    return -danger;
  }
  function iaPlace(etat, id, opts) {
    var c = trouver(etat, id);
    if (!c || etat.phase !== 'miseEnPlace') return refus('Pas de Mise en place en cours');
    var best = null, bs = null, pire = !!(opts && opts.pire);
    casesDepartArtisans(etat).forEach(function (cs) {
      var o = occupantReel(etat, cs);
      if (o && o !== c) return;
      var s = valeurCaseDepart(etat, c, cs);
      if (bs === null || (pire ? s < bs : s > bs)) { bs = s; best = cs; }
    });
    return best ? placer(etat, id, best) : refus('Aucune case libre');
  }

  // =====================================================================
  // 21. Ce qu'on expose
  // =====================================================================
  return {
    version: '1.0.0',
    CONST: CONST, COMMANDES: COMMANDES, ELEMENTS: ELEMENTS, ETATS: ETATS, FORMES: FORMES, CIBLES: CIBLES, LANCERS: LANCERS,
    BRIQUES: TYPES_BRIQUES, CONDITIONS: CONDITIONS, CARACS_BONUS: CARACS_BONUS, POSES: POSES,
    // combat
    creerCombat: creerCombat, rejoindre: rejoindre, placer: placer, pret: pret, choisirCommande: choisirCommande, choisirBonusCommande: choisirBonusCommande,
    commencer: commencer, actif: actif, deplacementsPossibles: deplacementsPossibles, apercuDeplacement: apercuDeplacement, apercuRideau: apercuRideau,
    deplacer: deplacer, casesVisables: casesVisables, apercuSort: apercuSort, lancer: lancer, barre: barre,
    utiliserPainDeRoute: utiliserPainDeRoute, apercuPain: apercuPain, finDuTour: finDuTour, iaJoue: iaJoue, iaPlace: iaPlace,
    abandonner: abandonner, resultat: resultat, vuePour: vuePour, evenementsPour: evenementsPour,
    // fiches
    deriverArtisan: deriverArtisan, coutAffinite: coutAffinite, rangSort: rangSort, sortAuRang: sortAuRang,
    normaliserSort: normaliserSort, verifierSort: verifierSort, verifierClasse: verifierClasse, NIVEAUX_EMPLACEMENTS: NIVEAUX_EMPLACEMENTS, valeurPain: function (niveau) { return valeurPain({ niveau: niveau }); },
    // utilitaires
    trouver: trouver, cloner: copie, ligneDeVue: ligneDeVue, casesZone: casesZone, distance: distance, terrain: terrain,
    tempsDuTour: function (etat) { return etat.minuteur.actif ? etat.minuteur.duree : null; },
    interne: { traverse: traverse, planifier: planifier, partGardee: partGardee, calculerDegats: calculerDegats, fourchetteDegats: fourchetteDegats,
      calculerFrise: calculerFrise, preparerCarte: preparerCarte, conservationEff: conservationEff, caracEff: caracEff, dansLeDos: dansLeDos,
      iaMeilleurCoup: iaMeilleurCoup, axe: axe, graine32: graine32, hasard: hasard }
  };
}));
