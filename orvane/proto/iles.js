/*
 * Orvane, prototype : les îles de l'Astrelier (et un premier aperçu de Grand-Étal), leurs objets et leurs liaisons.
 * Rien que des données et de petits calculs : aucune règle de combat, aucun dessin.
 *   ORVANE.Proto.Iles.ile(id)          l'île, avec sa carte d'exploration (lignes, légende) et ses objets placés (cases, accès)
 *   ORVANE.Proto.Iles.carte(id)        la carte d'exploration (format du moteur : lignes, légende, départs)
 *   ORVANE.Proto.Iles.carteCombat(id)  la carte où se jouent les combats de l'île (le Fourneau ; le pont pour la Voie lactée)
 *   ORVANE.Proto.Iles.zone(id)         la zone des groupes de monstres de l'île (ORVANE.Monstres.GROUPES), ou null
 *   ORVANE.Proto.Iles.objet(id)        un objet de voyage, où qu'il soit
 *   ORVANE.Proto.Iles.liaisons()       toutes les liaisons : { de, vers, genre, condition, sensUnique }
 *
 * Les plans sont dessinés comme on voit l'île à l'écran : une rangée par demi-rangée de losanges (v = x + y), une colonne par
 * demi-colonne (u = x − y). Une case sur deux seulement existe (u + v pair) : les autres places sont des espaces.
 *   .  sol          ~  vide          MAJUSCULE  décor plein (légende)
 *   chiffre, @, *   sol marqué (sortie par le bord, point d'arrivée, maison d'un groupe)
 *   minuscule       objet posé dans le vide, au bord de l'île (monte-plats, toboggan, Grande Pelle)
 * Le Fourneau garde la carte du moteur (ORVANE.Monstres.carte('fourneau')) : ses objets y sont placés par leurs cases (x, y),
 * sans changer une seule case (le départ, les maisons des groupes et les places du tutoriel restent les mêmes).
 *
 * Les groupes de la Voie lactée sont ajoutés à ORVANE.Monstres.GROUPES['voie-lactee'] (les fiches du moteur, inchangées).
 * Navigateur : ORVANE.Proto.Iles ; node : require('./iles.js') (pour les vérifications des essais).
 */
(function (racine, fabrique) {
  var M = (racine.ORVANE && racine.ORVANE.Monstres) || (typeof require === 'function' ? require('../moteur/monstres.js') : null);
  var I = fabrique(M);
  if (typeof module === 'object' && module.exports) module.exports = I;
  else { racine.ORVANE = racine.ORVANE || {}; racine.ORVANE.Proto = racine.ORVANE.Proto || {}; racine.ORVANE.Proto.Iles = I; }
}(typeof globalThis !== 'undefined' ? globalThis : this, function (M) {
  'use strict';

  // Le niveau où la Grande Pelle s'ouvre (le Défournement vers Grand-Étal)
  var NIVEAU_PELLE = 12;

  // ---------- Les groupes de la Voie lactée (des Grumeaux, rien que des Grumeaux : on apprend à les éviter) ----------
  var GROUPES_VL = [
    { id: 'grumeaux-du-pont', nom: 'Deux Grumeaux', membres: ['grumeau', 'grumeau'] },
    { id: 'grumeau-egare', nom: 'Un Grumeau égaré', membres: ['grumeau'] }
  ];
  if (M && M.GROUPES && !M.GROUPES['voie-lactee']) M.GROUPES['voie-lactee'] = GROUPES_VL;

  // ---------- Couleurs du sol (exploration ; combat pour la Voie lactée) ----------
  var SOLS = {
    // la Halle : des tomettes, comme sous une vraie halle de marché
    halle: { balade: { clair: '#E9D2B4', fonce: '#DDBF9C', flancG: '#A8805A', flancD: '#8A6646', motif: 'tomettes', trait: 'rgba(122,70,40,.10)' } },
    // la Voie lactée : un pont de lait d'étoiles, au tablier fin (flancs de lait, liseré d'or), bordé de garde-corps, d'où le lait goutte
    'voie-lactee': {
      balade: { clair: '#FBF8F0', fonce: '#F1ECDF', flancG: '#E9E3D3', flancD: '#D6CEBB', motif: 'etoiles', trait: 'rgba(29,39,37,.05)', ep: 8, liseréOr: true, gardeCorps: true, gouttes: true },
      combat: { clair: '#ECE7DA', fonce: '#E1DBCB', plein: '#BDB39E', flancG: '#B3AA96', flancD: '#9A907B', motif: 'etoiles' }
    },
    fourneau: {},
    penderie: { balade: { clair: '#E4CDA4', fonce: '#DAC197', flancG: '#9C7B52', flancD: '#7E6140', motif: 'parquet' } },
    moule: { balade: { clair: '#EDE0BE', fonce: '#E3D3AB', flancG: '#A88B57', flancD: '#8C7347', motif: 'cannelures' } },
    // Grand-Étal : des pavés plus froids, une ville de pierre
    'grand-etal': { balade: { clair: '#CFC6B4', fonce: '#BDB4A1', flancG: '#857E6E', flancD: '#6E685A', motif: 'paves', trait: 'rgba(40,40,36,.10)' } }
  };

  // ---------- Les îles ----------
  // nom (début de phrase), le (dans une phrase), a (« aller à… »), de (« le four de… »), sur (« le combat se joue… »)
  var DEF = {
    halle: {
      nom: 'La Halle des Ébauches', le: 'la Halle des Ébauches', a: 'à la Halle des Ébauches', de: 'de la Halle', sur: 'à la Halle', court: 'la Halle',
      monde: 'astrelier', texte: 'La place de tous les débutants : les marchands, le Four banal, le départ de la Voie lactée.',
      plan: [
        '~ . . . ~',
        ' . . . . ',
        'H L O L I',
        ' . . . . ',
        '. . . . P',
        ' . . . . ',
        'E . . . .',
        ' . . @ . ',
        '. . . . .',
        ' . . . . ',
        'Q . . . G',
        ' . . . . ',
        'C . . . .',
        ' . . . . ',
        '. . . . L',
        ' . . . . ',
        'I . . . I',
        ' . . . 1 ',
        '~ . . . ~',
        ' ~ . . ~ ',
        '~ ~ . ~ ~'
      ],
      legende: { O: 'four-banal', P: 'passe-plat', E: 'etal-pain', Q: 'etal-lait', G: 'etal-outils', L: 'lanterne', C: 'caisse', I: 'pilier', H: 'pilier-enseigne' },
      objets: [
        { id: 'halle-four', genre: 'four', ou: 'O', toujoursAllume: true },
        { id: 'halle-passe-plat', genre: 'passe-plat', ou: 'P', vers: 'penderie-passe-plat' },
        { id: 'halle-bord', genre: 'marche', ou: '1', sens: [1, 0], vers: 'vl-haut' },
        // un étal a un jour entre l'auvent et le comptoir : on le touche dans toute sa boîte
        { id: 'halle-etal-pain', genre: 'info', ou: 'E', nom: 'Étal du boulanger', court: '« Bientôt ! »', dit: '« Bientôt ! » Le marché ouvre bientôt.', touche: 'boite' },
        { id: 'halle-etal-lait', genre: 'info', ou: 'Q', nom: 'Étal de la laitière', court: '« Bientôt ! »', dit: '« Bientôt ! » Le marché ouvre bientôt.', touche: 'boite' },
        { id: 'halle-etal-outils', genre: 'info', ou: 'G', nom: 'Étal des outils', court: '« Bientôt ! »', dit: '« Bientôt ! » Le marché ouvre bientôt.', touche: 'boite' }
      ]
    },
    'voie-lactee': {
      nom: 'La Voie lactée', le: 'la Voie lactée', a: 'à la Voie lactée', de: 'de la Voie lactée', sur: 'sur la Voie lactée', court: 'la Voie lactée',
      monde: 'astrelier', zone: 'voie-lactee', groupesDepart: ['grumeaux-du-pont'], arrivage: [20],
      texte: 'Le pont de lait d\'étoiles entre la Halle et le Fourneau. Des Grumeaux s\'y promènent : on peut les éviter.',
      // un tablier de trois cases au plus, d'un bout à l'autre ; les lanternes et les bidons sur de petits balcons, à côté ;
      // un seul belvédère plus large, autour de la maison des Grumeaux (on passe à côté d'eux sans les toucher)
      plan: [
        '~ ~ 1 ~ ~',
        ' ~ . . ~ ',
        '~ . . . ~',
        ' L . . ~ ',
        '~ . . . ~',
        ' ~ . . ~ ',
        '~ . . . ~',
        ' ~ . . J ',
        '~ . . . ~',
        ' ~ . . ~ ',
        '~ . . . ~',
        ' L . . ~ ',
        '~ . . . ~',
        ' . . . . ',
        '. . . . .',
        ' . . . . ',
        '. . * . .',
        ' . . . . ',
        '. . . . J',
        ' . . . . ',
        '~ . . . ~',
        ' ~ . . L ',
        '~ . . . ~',
        ' ~ . . ~ ',
        '~ . . . ~',
        ' J . . ~ ',
        '~ . . . ~',
        ' ~ . . ~ ',
        '~ . . . ~',
        ' ~ . . L ',
        '~ . @ . ~',
        ' ~ . . ~ ',
        '~ . . . ~',
        ' ~ . . ~ ',
        '~ ~ 2 ~ ~'
      ],
      legende: { L: 'lanterne', J: 'bidon' },
      objets: [
        { id: 'vl-haut', genre: 'marche', ou: '1', sens: [-1, 0], vers: 'halle-bord', bout: 'haut' },
        { id: 'vl-bas', genre: 'marche', ou: '2', sens: [1, 0], vers: 'fourneau-bord', bout: 'bas' }
      ]
    },
    fourneau: {
      nom: 'Le Fourneau', le: 'le Fourneau', a: 'au Fourneau', de: 'du Fourneau', sur: 'sur le Fourneau', court: 'le Fourneau',
      monde: 'astrelier', zone: 'fourneau', tutoriel: true,
      texte: 'L\'île des premiers combats, contre les Grumeaux et les Mie-trons. Mère Fournil y donne la quête « Premier service ».',
      carteMoteur: 'fourneau',
      objets: [
        // le grand four du Fourneau est son Four banal (sa case ne change pas : le combat se joue sur la même carte)
        { id: 'fourneau-four', genre: 'four', case: [7, 8], acces: [7, 9] },
        { id: 'fourneau-bord', genre: 'marche', case: [0, 4], sens: [-1, 0], vers: 'vl-bas' },
        { id: 'fourneau-monte-plats', genre: 'monte-plats', case: [12, 7], acces: [12, 8], sens: 'monte', vers: 'penderie-monte-plats' }
      ]
    },
    penderie: {
      nom: 'La Penderie des Tabliers', le: 'la Penderie des Tabliers', a: 'à la Penderie des Tabliers', de: 'de la Penderie', sur: 'à la Penderie', court: 'la Penderie',
      monde: 'astrelier', haute: true,
      texte: 'Une île plus haute, pleine de tabliers suspendus. La Proxi-Mite y ronge les tabliers des artisans : son donjon ouvre bientôt.',
      plan: [
        '~ . D . ~',
        ' . . . . ',
        'K . . . K',
        ' . . . . ',
        '. T . T .',
        ' . . . . ',
        'K . . . .',
        ' . . @ . ',
        '. T . T .',
        ' . . . . ',
        '. . . . P',
        ' . . . . ',
        '~ . T . ~',
        ' . . . . ',
        'm . . . .',
        ' . . . . ',
        '~ . . . ~',
        ' ~ . . ~ ',
        '~ ~ . ~ ~',
        ' ~ t ~ ~ '
      ],
      legende: { D: 'armoire', K: 'portant', T: 'tringle', P: 'passe-plat' },
      objets: [
        { id: 'penderie-passe-plat', genre: 'passe-plat', ou: 'P', vers: 'halle-passe-plat' },
        { id: 'penderie-monte-plats', genre: 'monte-plats', ou: 'm', sens: 'descend', vers: 'fourneau-monte-plats' },
        { id: 'penderie-toboggan', genre: 'toboggan', ou: 't', vers: 'moule-toboggan', sensUnique: true },
        { id: 'penderie-donjon', genre: 'info', ou: 'D', nom: 'Donjon de la Proxi-Mite', court: 'La porte est fermée.', dit: 'La porte est fermée. Le donjon ouvre bientôt.' }
      ]
    },
    moule: {
      nom: 'Le Moule', le: 'le Moule', a: 'au Moule', de: 'du Moule', sur: 'au Moule', court: 'le Moule',
      monde: 'astrelier', basse: true,
      texte: 'Une île en contrebas, pleine de moules à gâteaux géants. Le Grand Moule y attend dans son donjon. La Grande Pelle mène à Grand-Étal.',
      plan: [
        '~ X . . ~',
        ' . 3 . . ',
        '. . . U .',
        ' . . . . ',
        'V . . . R',
        ' . . . . ',
        '. . O . .',
        ' . . . . ',
        'U . . . V',
        ' . . @ . ',
        '. . . . .',
        ' . . . . ',
        '~ V . U ~',
        ' . . . . ',
        '~ . . . ~',
        ' ~ . . ~ ',
        '~ ~ . ~ ~',
        ' ~ ~ p ~ '
      ],
      legende: { X: 'bas-toboggan', U: 'moule-kouglof', V: 'moule-tarte', R: 'porte-moule', O: 'four-banal' },
      objets: [
        { id: 'moule-toboggan', genre: 'arrivee', ou: '3' },
        { id: 'moule-four', genre: 'four', ou: 'O' },
        { id: 'moule-pelle', genre: 'pelle', ou: 'p', vers: 'grand-etal-arrivee', sensUnique: true, niveau: NIVEAU_PELLE },
        { id: 'moule-bas-toboggan', genre: 'info', ou: 'X', nom: 'Le bas du toboggan', court: 'Il ne se remonte pas.', dit: 'Le toboggan ne se remonte pas. Pour repartir : le Four banal.' },
        { id: 'moule-donjon', genre: 'info', ou: 'R', nom: 'Donjon du Grand Moule', court: 'La porte est fermée.', dit: 'La porte est fermée. Le donjon ouvre bientôt.' }
      ]
    },
    'grand-etal': {
      nom: 'Grand-Étal', le: 'Grand-Étal', a: 'à Grand-Étal', de: 'de Grand-Étal', sur: 'à Grand-Étal', court: 'Grand-Étal',
      monde: 'grand-etal', ville: true,
      texte: 'La ville neutre, hors de l\'Astrelier. Pour l\'instant, une petite place : la suite du monde arrive bientôt.',
      plan: [
        '~ . N . ~',
        ' . . . . ',
        'L . . . L',
        ' . . . . ',
        '. . 4 . O',
        ' . . . . ',
        'S . . . .',
        ' . . . . ',
        '. . . . Z',
        ' . . . . ',
        'S . . . .',
        ' . . . . ',
        '~ L . L ~',
        ' ~ . . ~ ',
        '~ ~ . ~ ~'
      ],
      legende: { N: 'pancarte', L: 'lanterne', O: 'four-banal', Z: 'lit', S: 'sacs' },
      depart: '4',
      objets: [
        { id: 'grand-etal-arrivee', genre: 'arrivee', ou: '4' },
        { id: 'grand-etal-four', genre: 'four', ou: 'O' },
        { id: 'grand-etal-sieste', genre: 'sieste', ou: 'Z' },
        { id: 'grand-etal-pancarte', genre: 'info', ou: 'N', nom: 'Une pancarte', court: 'La suite du monde arrive bientôt.', dit: 'La suite du monde arrive bientôt.' }
      ]
    }
  };
  var LISTE = ['halle', 'voie-lactee', 'fourneau', 'penderie', 'moule', 'grand-etal'];

  // ---------- La carte de combat de la Voie lactée : un pont, avec un étranglement au milieu ----------
  // Les monstres partent en haut, les artisans en bas ; trois jeux de départ, chacun mêle des cases exposées,
  // des cases à l'abri d'un décor (lanterne, bidon de lait) et des cases en retrait. Départs en (u, v), comme le plan.
  var PONT = {
    id: 'pont', nom: 'La Voie lactée',
    plan: [
      '~ ~ . ~ ~',
      ' ~ . . ~ ',
      '~ . . . ~',
      ' . . . . ',
      '. . . . .',
      ' . . . . ',
      '. L . . .',
      ' . . . . ',
      '. . . J .',
      ' . . . . ',
      '. . . . .',
      ' . . . . ',
      '~ . . . ~',
      ' ~ . . ~ ',
      '~ . J . ~',
      ' ~ . . ~ ',
      '~ . . . ~',
      ' . . . . ',
      '. . . . .',
      ' . . . . ',
      '. . . L .',
      ' . . . . ',
      'J . . . .',
      ' . . . . ',
      '. . . . .',
      ' ~ . . ~ ',
      '~ ~ . ~ ~'
    ],
    legende: { L: 'lanterne', J: 'bidon' },
    departs: [
      { artisans: [[-1, 19], [1, 19], [0, 18], [3, 21], [1, 23], [-2, 20]], monstres: [[0, 4], [-1, 5], [1, 5], [2, 4], [-2, 4], [0, 6]] },
      { artisans: [[-3, 17], [-4, 18], [-3, 19], [-2, 22], [-3, 21], [-1, 23]], monstres: [[-3, 5], [-4, 4], [-3, 7], [-1, 7], [-3, 3], [-4, 8]] },
      { artisans: [[3, 17], [4, 18], [3, 19], [4, 22], [2, 22], [3, 23]], monstres: [[3, 5], [4, 6], [3, 7], [1, 7], [3, 3], [4, 4]] }
    ]
  };

  // ---------- Lecture d'un plan ----------
  function lirePlan(plan, legende, nom) {
    var larg = 0;
    plan.forEach(function (r) { larg = Math.max(larg, r.length); });
    var U = (larg - 1) / 2, cellules = [];
    plan.forEach(function (r, v) {
      for (var i = 0; i < larg; i++) {
        var ch = r.charAt(i) || ' ', u = i - U;
        if (ch === ' ') continue;
        if ((u + v) % 2 !== 0) throw new Error('Plan ' + nom + ' : « ' + ch + ' » mal placé (rangée ' + v + ', colonne ' + i + ')');
        cellules.push({ u: u, v: v, ch: ch });
      }
    });
    // (u, v) → (x, y) : x = (u + v) / 2, y = (v − u) / 2, décalés pour commencer à 0
    var x0 = Infinity, y0 = Infinity;
    cellules.forEach(function (c) { c.x = (c.u + c.v) / 2; c.y = (c.v - c.u) / 2; if (c.ch !== '~') { x0 = Math.min(x0, c.x); y0 = Math.min(y0, c.y); } });
    var W = 0, H = 0;
    cellules.forEach(function (c) { c.x -= x0; c.y -= y0; if (c.ch !== '~' && !/[a-z]/.test(c.ch)) { W = Math.max(W, c.x + 1); H = Math.max(H, c.y + 1); } });
    var grille = [];
    for (var y = 0; y < H; y++) { grille.push([]); for (var x = 0; x < W; x++) grille[y].push('~'); }
    var reperes = {};
    cellules.forEach(function (c) {
      var ch = c.ch, dedans = c.x >= 0 && c.y >= 0 && c.x < W && c.y < H;
      if (/[a-z]/.test(ch)) { reperes[ch] = [c.x, c.y]; return; }          // un objet dans le vide
      if (!dedans) return;
      if (ch === '.' || ch === '~') { grille[c.y][c.x] = ch; return; }
      if (/[A-Z]/.test(ch)) { if (!legende[ch]) throw new Error('Plan ' + nom + ' : « ' + ch + ' » sans légende'); grille[c.y][c.x] = ch; reperes[ch] = reperes[ch] || [c.x, c.y]; return; }
      grille[c.y][c.x] = '.'; reperes[ch] = [c.x, c.y];                       // chiffre, @, * : du sol marqué
    });
    var conv = function (uv) { return [(uv[0] + uv[1]) / 2 - x0, (uv[1] - uv[0]) / 2 - y0]; };
    return { lignes: grille.map(function (l) { return l.join(''); }), reperes: reperes, conv: conv };
  }

  // ---------- Construction des îles ----------
  var ILES = {}, OBJETS = {};
  var ADJ = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  function terrainDe(lignes) {
    return function (x, y) {
      var l = lignes[y]; if (!l || x < 0 || y < 0) return 'vide';
      var ch = l.charAt(x);
      if (!ch || ch === '~' || ch === ' ') return 'vide';
      return ch === '.' || ch === 'a' || ch === 'm' ? 'sol' : 'plein';
    };
  }
  function construire(id) {
    var d = DEF[id], ile = { id: id };
    Object.keys(d).forEach(function (k) { if (k !== 'plan' && k !== 'objets') ile[k] = d[k]; });
    var reperes = {};
    if (d.carteMoteur) {
      var c = M.carte(d.carteMoteur);
      ile.lignes = c.lignes.slice(); ile.legende = Object.assign({}, c.legende); ile.departsMoteur = c.departs;
    } else {
      var p = lirePlan(d.plan, d.legende || {}, id);
      ile.lignes = p.lignes; ile.legende = Object.assign({}, d.legende); reperes = p.reperes;
      if (reperes['@'] || reperes[d.depart]) ile.depart = (reperes[d.depart] || reperes['@']).slice();
      ile.maisons = reperes['*'] ? [reperes['*'].slice()] : [];
    }
    var t = terrainDe(ile.lignes);
    ile.terrain = t;
    ile.objets = (d.objets || []).map(function (o0) {
      var o = Object.assign({}, o0, { ile: id });
      if (!o.case) o.case = (reperes[o.ou] || []).slice();
      if (o.case.length !== 2) throw new Error('Objet ' + o.id + ' : case introuvable');
      var k = t(o.case[0], o.case[1]);
      // l'accès : la case de sol d'où l'on s'en sert (la case elle-même pour une sortie par le bord ou un point d'arrivée)
      if (o.genre === 'marche' || o.genre === 'arrivee') o.acces = o.case.slice();
      else if (!o.acces && o.genre === 'four' && t(o.case[0], o.case[1] + 1) === 'sol') o.acces = [o.case[0], o.case[1] + 1];
      else if (!o.acces) {
        var l = ADJ.map(function (a) { return [o.case[0] + a[0], o.case[1] + a[1]]; }).filter(function (q) { return t(q[0], q[1]) === 'sol'; });
        // de préférence la case de devant (plus bas à l'écran), puis la plus proche du milieu de l'île
        l.sort(function (a, b) { return (b[0] + b[1]) - (a[0] + a[1]) || (Math.abs(a[0] - a[1]) - Math.abs(b[0] - b[1])); });
        if (!l.length) throw new Error('Objet ' + o.id + ' : pas de case de sol à côté');
        o.acces = l[0];
      }
      // une sortie par le bord : la flèche montre le vide (o.sens, en x, y) ; on arrive une case plus loin vers l'intérieur
      if (o.genre === 'marche') {
        if (!o.sens) {
          var vide = ADJ.filter(function (a) { return t(o.case[0] + a[0], o.case[1] + a[1]) === 'vide'; });
          o.sens = vide[0] || [1, 0];
        }
        o.arrivee = [o.case[0] - o.sens[0], o.case[1] - o.sens[1]];
      } else o.arrivee = o.acces.slice();
      o.dans = k;    // 'sol', 'plein' (un décor de la carte) ou 'vide' (posé au bord)
      OBJETS[o.id] = o;
      return o;
    });
    // le départ : un point marqué, sinon (le Fourneau) celui que choisit la scène
    ILES[id] = ile;
    return ile;
  }
  LISTE.forEach(construire);
  var pont = lirePlan(PONT.plan, PONT.legende, 'pont');
  var CARTE_PONT = { id: 'pont', nom: PONT.nom, lignes: pont.lignes, legende: PONT.legende,
    departs: PONT.departs.map(function (j) { return { artisans: j.artisans.map(pont.conv), monstres: j.monstres.map(pont.conv) }; }) };

  // ---------- Questions ----------
  var copie = function (o) { return JSON.parse(JSON.stringify(o)); };
  function ile(id) { return ILES[id] || null; }
  function existe(id) { return !!ILES[id]; }
  function carte(id) {
    var i = ILES[id]; if (!i) return null;
    return { id: id, nom: i.nom, lignes: i.lignes.slice(), legende: Object.assign({}, i.legende), departs: copie(i.departsMoteur || []) };
  }
  function carteCombat(id) { return id === 'voie-lactee' ? copie(CARTE_PONT) : M.carte('fourneau'); }
  function zone(id) { var i = ILES[id]; return (i && i.zone) || null; }
  function objet(id) { return OBJETS[id] || null; }
  function sol(id) { var s = SOLS[id] || {}; return { balade: s.balade || null, combat: s.combat || null }; }
  // Où mène un objet : { ile, objet, case } (l'objet jumeau, et la case où l'on arrive)
  function destination(o) {
    var v = o && o.vers ? OBJETS[o.vers] : null;
    return v ? { ile: v.ile, objet: v.id, case: v.arrivee.slice() } : null;
  }
  // Les Fours banals d'un monde (« astrelier » ou « grand-etal ») : deux réseaux séparés
  function fours(monde) {
    return Object.keys(OBJETS).map(function (k) { return OBJETS[k]; }).filter(function (o) { return o.genre === 'four' && (!monde || ILES[o.ile].monde === monde); });
  }
  // Toutes les liaisons, pour la carte de l'Astrelier et le rapport : { de, vers, genre, condition, sensUnique, objet }
  function liaisons() {
    var l = [];
    LISTE.forEach(function (id) {
      ILES[id].objets.forEach(function (o) {
        if (o.genre === 'marche' || o.genre === 'passe-plat' || o.genre === 'monte-plats' || o.genre === 'toboggan' || o.genre === 'pelle') {
          var d = destination(o);
          l.push({ de: id, vers: d.ile, genre: o.genre, objet: o.id, sensUnique: !!o.sensUnique, condition: o.niveau ? 'niveau ' + o.niveau : '' });
        }
      });
    });
    return l;
  }
  // Une vérification complète (essais) : chaque objet a son accès sur le sol, chaque sortie mène à une case de sol,
  // chaque objet est atteignable à pied depuis le départ de son île
  function verifier(departs) {
    var erreurs = [];
    LISTE.forEach(function (id) {
      var i = ILES[id], t = i.terrain, dep = (departs && departs[id]) || i.depart;
      if (!dep) { erreurs.push(id + ' : pas de départ'); return; }
      if (t(dep[0], dep[1]) !== 'sol') erreurs.push(id + ' : départ hors du sol');
      var vus = {}, file = [dep], k = function (c) { return c[0] + ',' + c[1]; };
      vus[k(dep)] = true;
      while (file.length) {
        var c = file.shift();
        [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (a) {
          var n = [c[0] + a[0], c[1] + a[1]];
          if (vus[k(n)] || t(n[0], n[1]) !== 'sol') return;
          if (a[0] && a[1] && (t(c[0] + a[0], c[1]) !== 'sol' || t(c[0], c[1] + a[1]) !== 'sol')) return;
          vus[k(n)] = true; file.push(n);
        });
      }
      i.objets.forEach(function (o) {
        if (t(o.acces[0], o.acces[1]) !== 'sol') erreurs.push(o.id + ' : accès hors du sol');
        else if (!vus[k(o.acces)]) erreurs.push(o.id + ' : accès injoignable depuis le départ');
        if (t(o.arrivee[0], o.arrivee[1]) !== 'sol') erreurs.push(o.id + ' : arrivée hors du sol');
        if (o.genre === 'marche' && t(o.case[0] + o.sens[0], o.case[1] + o.sens[1]) !== 'vide') erreurs.push(o.id + ' : la flèche ne montre pas le vide');
        if (o.dans === 'vide' && o.genre === 'marche') erreurs.push(o.id + ' : sortie dans le vide');
        if ((o.genre === 'monte-plats' || o.genre === 'toboggan' || o.genre === 'pelle') && o.dans !== 'vide') erreurs.push(o.id + ' : devrait être au bord, dans le vide');
        if (o.vers && !OBJETS[o.vers]) erreurs.push(o.id + ' : mène à un objet inconnu');
      });
    });
    return erreurs;
  }

  return {
    LISTE: LISTE, NIVEAU_PELLE: NIVEAU_PELLE, GROUPES_VL: GROUPES_VL,
    ile: ile, existe: existe, carte: carte, carteCombat: carteCombat, zone: zone, objet: objet, sol: sol,
    destination: destination, fours: fours, liaisons: liaisons, verifier: verifier, lirePlan: lirePlan,
    get objets() { return OBJETS; }
  };
}));
