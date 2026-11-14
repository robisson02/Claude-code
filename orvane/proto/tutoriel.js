/*
 * Orvane, prototype : le tutoriel, une quête très simple, « Premier service », donnée par Mère Fournil au Fourneau.
 * Neuf étapes. Chacune : une ou deux phrases de Mère Fournil (sur la carte de quête, et dans la fenêtre ouverte s'il y en a une),
 * une cible mise en valeur (un anneau doré qui pulse sur un bouton ou sur une case du terrain) et la détection de la réussite.
 * La réussite vient de signaux envoyés par les scènes (P.Tuto.signal) ; ce qui s'affiche se recalcule d'après l'état du jeu
 * (scène, phase, aperçu, fenêtres ouvertes), plusieurs fois par seconde. Une étape faite dans le désordre compte quand même.
 * Aucune règle ici : portée, cases vertes et dorées, sorts disponibles, zones viennent de ORVANE.Regles.
 * Le Grumeau d'entraînement est tiré de la fiche du Grumeau (ORVANE.Monstres), sans toucher à monstres.js : aucun chiffre écrit en dur.
 * La progression est dans le profil (profil.tuto), sauvée par P.Profil.sauver (localStorage dans des try/catch).
 */
window.ORVANE = window.ORVANE || {};
(() => {
  const P = ORVANE.Proto = ORVANE.Proto || {};
  const R = () => ORVANE.Regles;
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const meme = (a, b) => !!a && !!b && a[0] === b[0] && a[1] === b[1];

  const PNJ = "Mère Fournil", QUETE = "Premier service";
  const GROUPE = "entrainement", FICHE = "grumeau-entrainement", NOM_FICHE = "Grumeau d'entraînement";
  // La récompense de fin de quête : une seule fois par artisan (même si l'on recommence le tutoriel)
  const RECOMPENSE = { ble: 20, pains: 1 };
  const ETAPES = [
    { id: "marcher", titre: "Marcher" },
    { id: "groupe", titre: "Regarder un groupe" },
    { id: "placement", titre: "La Mise en place" },
    { id: "marcheCombat", titre: "Marcher en combat" },
    { id: "sort", titre: "Lancer un sort" },
    { id: "finTour", titre: "Finir son tour" },
    { id: "addition", titre: "Gagner et lire l'Addition" },
    { id: "points", titre: "Placer ses points" },
    { id: "grimoire", titre: "Ouvrir le Grimoire" }
  ];
  const N = ETAPES.length;
  const COMBAT = ["placement", "marcheCombat", "sort", "finTour", "addition"];
  const index = id => ETAPES.findIndex(e => e.id === id);

  // Ce que dit Mère Fournil (phrases courtes, mots du Lexique ; deux lignes au plus sur la carte d'un téléphone)
  const DIT = {
    marcher: "Bienvenue au Fourneau ! Touche une case pour marcher.",
    groupe: "Voici un Grumeau d'entraînement. Touche-le pour voir sa fiche.",
    groupePerdu: "Pas grave ! Touche le Grumeau d'entraînement pour recommencer.",
    groupeRepris: "Le combat s'est arrêté. Touche le Grumeau d'entraînement pour recommencer.",
    groupeRenonce: "Le Grumeau d'entraînement t'attend. Touche-le quand tu veux.",
    fiche: "Sa fiche dit sa vie (Victuailles) et ce qu'il rapporte. Touche « Engager ».",
    ficheAutre: "Ce groupe est trop fort pour commencer. Touche « Plus tard », puis le Grumeau d'entraînement.",
    place: "Avant le combat, choisis ta place : touche la case dorée marquée, près du Grumeau.",
    envoyez: "La Commande, un défi pour un bonus : pas cette fois. Touche « Envoyez ! ».",
    replace: "Touche une case dorée, puis « Envoyez ! ».",
    vert: "À toi ! Les cases vertes : là où tu peux marcher. Touche-en une.",
    apercuMarche: "L'aperçu montre le chemin et les Pas qu'il coûte. Touche encore la case.",
    apercuMarcheSouris: "L'aperçu montre le chemin et les Pas qu'il coûte. Clique pour y aller.",
    rangerSort: "Pour marcher, range d'abord ton sort : touche-le encore.",
    plusDePas: "Tu n'as plus de Pas. Touche « Fin du tour ».",
    choisirSort: nom => `Touche le sort « ${nom} » en bas. Son chiffre doré : son prix en CM (coups de main).`,
    trop: "Trop loin pour tes sorts. Approche-toi : touche une case verte.",
    tropFinir: "Trop loin pour tes sorts. Touche « Fin du tour » : le Grumeau va venir.",
    viser: "Les cases dorées : le Rayon du sort. Touche le Grumeau.",
    viserZone: "Touche la case marquée : le Grumeau sera dans la zone du sort.",
    horsRayon: "Ce sort n'atteint pas le Grumeau. Choisis-en un autre en bas.",
    apercuSort: "Tu vois la zone et les dégâts prévus. Touche encore le Grumeau.",
    apercuSortCase: "Tu vois la zone et les dégâts prévus. Touche encore la même case.",
    apercuSortSouris: "Tu vois la zone et les dégâts prévus. Clique pour lancer.",
    finTour: "Touche « Fin du tour ». Tes CM (pour les sorts) et tes Pas (pour marcher) reviennent au tour suivant.",
    continuer: nom => `Fais tomber le Grumeau ! Touche « ${nom} », puis le Grumeau.`,
    continuerViser: "Fais tomber le Grumeau ! Touche-le, puis encore pour lancer.",
    continuerZone: "Fais tomber le Grumeau ! Touche la case marquée, puis encore.",
    rienAFaire: "Plus rien à faire ce tour-ci ? Touche « Fin du tour ».",
    attente: "C'est le tour du Grumeau. Attends ton tour.",
    finCombat: "Le combat est fini !",
    victoireNiveau: "Victoire ! Regarde l'XP et le Blé gagnés, puis touche « Placer mes points ».",
    victoire: "Victoire ! Regarde l'XP et le Blé gagnés, puis touche « Retour au Fourneau ».",
    defaite: "Perdu, ce n'est pas grave. Touche « Retour au Fourneau » et réessaie.",
    autreCombat: "Ce combat ne compte pas pour la quête. Le Grumeau d'entraînement t'attend.",
    points: (n, niveau) => n > 0 ? (niveau ? `Tu as gagné un niveau, et ${n} points à placer. Touche « Caractéristiques ».` : `Tu as ${n} point${n > 1 ? "s" : ""} à placer. Touche « Caractéristiques ».`) : "Touche « Caractéristiques » pour voir tes points.",
    placerPoints: els => `Place tes points où tu veux. Mon conseil : 1 ou 2 éléments, ceux de tes sorts préférés${els}.`,
    valider: "Touche « Valider » pour garder tes points.",
    validerReste: "Tu peux en garder pour plus tard. Touche « Valider » pour garder ce choix.",
    pointsPlaces: "Tes points sont déjà placés. Tu pourras les changer ici. Touche × pour fermer.",
    caracTot: "Ici, tu places tes points. Tu en gagnes à chaque niveau.",
    pointsApres: "Après ce combat, touche « Caractéristiques ».",
    grimoire: "Dernière étape : touche « Grimoire », le livre de tes sorts.",
    grimoireOuvert: "Chaque sort a une variante, la déclinaison, qui s'ouvre plus tard. Touche « Fermer ».",
    grimoireApres: "Après ce combat, touche « Grimoire ».",
    // ailleurs qu'au Fourneau (îles de l'Astrelier, proto/voyage.js) : l'anneau montre le passage vers le Fourneau
    marcherAilleurs: "Touche une case pour marcher.",
    groupeAilleurs: "Le Grumeau d'entraînement t'attend au Fourneau. Le chemin part de l'anneau doré."
  };

  // ---------- État (dans le profil) ----------
  const profil = () => (P.Profil && P.Profil.profil) || null;
  function tuto() {
    const p = profil();
    if (!p || !p.tuto || typeof p.tuto !== "object") return null;
    const x = p.tuto;
    if (!x.fait || typeof x.fait !== "object") x.fait = {};
    if (["actif", "fini", "passe"].indexOf(x.statut) < 0) x.statut = null;
    return x;
  }
  const actif = () => { const x = tuto(); return !!x && x.statut === "actif"; };
  const fait = id => { const x = tuto(); return !!(x && x.fait[id] === true); };
  // l'étape en cours : la première pas encore faite (−1 : toutes faites)
  function premiere() { const x = tuto(); return x ? ETAPES.findIndex(e => x.fait[e.id] !== true) : -1; }
  const sauver = () => { try { P.Profil.sauver(); } catch (e) { /* stockage indisponible : on continue sans */ } };
  // ce qui ne se sauve pas : l'étape en cours de route (fiche ouverte, case choisie, issue du combat…)
  const neuf = () => ({ fiche: null, place: false, issue: null, perdu: false, renonce: false, bravo: null, grimoireVu: false, caracVu: false, vue: null, cache: {}, passer: 0 });
  let sous = neuf();

  function reussir(id, silence) {
    const x = tuto();
    if (!x || x.fait[id] === true) return false;
    x.fait[id] = true;
    sauver();
    if (!silence) sous.bravo = { texte: `Bravo ! Étape ${index(id) + 1} réussie`, jusqua: Date.now() + 2400 };
    return true;
  }

  // ---------- Le Grumeau d'entraînement (à partir de la fiche du moteur) ----------
  // Le plus gros coup que l'artisan peut porter d'un seul sort (Coup de maître compris), d'après ses sorts équipés au rang de son
  // niveau (R.rangSort, R.sortAuRang) et ses affinités (R.deriverArtisan) : le Grumeau d'entraînement doit tenir un coup,
  // pour qu'on ait le temps de finir son tour (étape 6), puis tomber au suivant.
  // Toutes les briques d'un même sort s'additionnent (elles touchent la même cible), conditions comprises ; une poussée bloquée
  // ajoute l'Écrasement (CONST.ECRASEMENT) ; ce qu'un sort pose (fournée…) compte à part. Une marge de 20 % couvre les bonus
  // de dégâts et les états (Marée basse, Attendri…).
  function coupMax() {
    const Pr = P.Profil, p = profil();
    if (!p) return 0;
    let m = 0;
    try {
      const K = R().CONST, d = Pr.deriver(Pr.caracActuelle(p), p.niveau), lev = d.levure || 0, MF = K.MAITRE_FOURCHETTE || 1.25;
      const ecrase = K.ECRASEMENT ? K.ECRASEMENT.base + Math.floor(p.niveau / K.ECRASEMENT.diviseurNiveau) : 0;
      const somme = (l, el0) => (l || []).reduce((t, b) => {
        if (b.type === "degats") {
          const el = b.element || el0, aff = el === "N" ? 0 : ((d.affinites || {})[el] || 0);
          const haut = Math.max(b.max || 0, Array.isArray(b.maitre) ? b.maitre[1] : Math.ceil((b.max || 0) * MF));
          return t + haut * (100 + aff + lev) / 100;
        }
        if (b.type === "pousse") return t + (b.cases || 1) * ecrase;
        if (b.type === "si") return t + somme(b.effets, el0);
        return t;
      }, 0);
      Pr.sortsEquipes(p).forEach(s0 => {
        const s = R().sortAuRang(s0, R().rangSort(s0.niveau || 1, p.niveau));
        m = Math.max(m, somme(s.effets, s.element));
        (s.effets || []).filter(b => b.type === "pose").forEach(b => { m = Math.max(m, somme(b.effets, s.element)); });
      });
    } catch (e) { m = 0; }
    return Math.ceil(m * 1.2);
  }
  // Victuailles : la moitié de celles du Grumeau, ou à peine plus que ton plus gros coup (il tombe au deuxième) ; dégâts au quart ; ni Pâte collante
  // ni Rideau ; il joue après toi (Ouverture 0).
  function ficheEntrainement() {
    const f = ORVANE.Monstres.fiche("grumeau");
    const quart = n => Math.max(1, Math.round(n / 4));
    const coup = (f.sorts || []).find(s => (s.effets || []).some(e => e.type === "degats"));
    const sorts = coup ? [Object.assign(JSON.parse(JSON.stringify(coup)), {
      id: FICHE + ".coup-mou", nom: "Coup mou", texte: "Un petit paquet de pâte qui fait à peine mal.",
      effets: coup.effets.filter(e => e.type === "degats").map(e => Object.assign({}, e, { min: quart(e.min), max: quart(e.max), maitre: Array.isArray(e.maitre) ? e.maitre.map(quart) : e.maitre }))
    })] : [];
    return Object.assign(f, {
      id: FICHE, nom: NOM_FICHE, niveau: 1, chef: false,
      victuailles: Math.max(1, Math.round(f.victuailles / 2), coupMax() + 1), ouverture: 0, rideau: 0, fauxFuyant: 0, conservation: {},
      sorts, objets: (f.objets || []).slice(0, 1),
      texte: "Un Grumeau pour s'entraîner, avec son bandeau. Il frappe à peine."
    });
  }
  const groupe = id => id === GROUPE ? { id: GROUPE, nom: NOM_FICHE, membres: [FICHE], texte: "Un Grumeau pour s'entraîner. Il frappe à peine : idéal pour un premier combat." } : null;
  const fiche = id => id === FICHE ? ficheEntrainement() : null;
  function prevision(id) {
    if (id !== GROUPE) return null;
    const f = ficheEntrainement();
    return { membres: [{ id: f.id, nom: f.nom, niveau: f.niveau, chef: false }], xp: f.xp, ble: f.ble, niveauMax: f.niveau };
  }
  // Le combat d'entraînement : toujours le premier jeu de cases de départ, le Grumeau sur la case de monstre la plus proche
  // des cases dorées, sans Minuteur (on prend le temps de lire)
  function combat(id) {
    if (id !== GROUPE) return null;
    const f = ficheEntrainement(), dep = ORVANE.Monstres.carte("fourneau").departs[0];
    let mieux = null, d0 = Infinity;
    // la plus proche d'une case dorée ; à égalité, la plus proche de toutes (en moyenne)
    (dep.monstres || []).forEach(m => {
      const l = dep.artisans.map(a => R().distance(a, m)), d = Math.min(...l) * 100 + l.reduce((t, x) => t + x, 0) / l.length;
      if (d < d0) { d0 = d; mieux = m; }
    });
    if (mieux) f.case = mieux.slice();
    return { monstres: [f], options: { minuteur: false, depart: 0 } };
  }

  // ---------- Dessins : Mère Fournil et le Grumeau d'entraînement (son bandeau doré) ----------
  const NS = "http://www.w3.org/2000/svg";
  function dessineGrumeauEntrainement(parent, o = {}) {
    ORVANE.dessineGrumeau(parent, { s: o.s });
    const g = document.createElementNS(NS, "g"); g.setAttribute("transform", `scale(${o.s || 1})`); parent.appendChild(g);
    const p = (d, a) => { const e = document.createElementNS(NS, "path"); e.setAttribute("d", d); Object.keys(a).forEach(k => e.setAttribute(k, a[k])); g.appendChild(e); };
    p("M-10.2 -12.2 Q0 -16.6 10.4 -13.4 L10.6 -11.2 Q0 -14.4 -10.4 -10z", { fill: "#C5A572", stroke: "#1D2725", "stroke-opacity": .55, "stroke-width": .7, "stroke-linejoin": "round" });
    p("M-10 -11.4 q-3.2 -1.6 -4.8 .6 M-10 -10.8 q-2.6 1.8 -2.4 4", { fill: "none", stroke: "#C5A572", "stroke-width": 1.5, "stroke-linecap": "round" });
  }
  async function preparerTextures(scene) {
    const T = P.Textures, S = 1.68 * .88;
    await Promise.all([
      T.svg(scene, "monstre-" + FICHE, g => dessineGrumeauEntrainement(g, { s: S })),
      T.portrait(g => dessineGrumeauEntrainement(g, { s: S }), 96, .95).then(u => (P.portraits[FICHE] = u)),
      T.svg(scene, "pnj-fournil", g => ORVANE.dessineMereFournil(g, { s: 1.38 })),
      T.portrait(g => ORVANE.dessineMereFournil(g, { s: 2 }), 96, .5).then(u => (P.portraits.fournil = u))
    ]);
  }

  // ---------- L'exploration : Mère Fournil, et le Grumeau d'entraînement pendant la quête ----------
  const DIRS8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
  // la scène d'exploration du Fourneau (Mère Fournil et le Grumeau d'entraînement n'existent que là)
  function sceneBalade() { const s = P.Jeu && P.Jeu.sceneActive; return s && s.sys && s.sys.isActive() && s.sys.settings.key === "balade" && s.tutoIci !== false ? s : null; }
  // ailleurs : la case du premier passage à prendre vers le Fourneau
  function caseVersFourneau(s) {
    const o = P.Voyage && s.ileId ? P.Voyage.sortieVers(s.ileId, "fourneau") : null;
    return o ? o.case.slice() : null;
  }
  // Les deux places du tutoriel, lues dans la carte : Mère Fournil à 2 cases du départ, le Grumeau d'entraînement à 3 ou 4,
  // loin des maisons des groupes
  function lieux(scene) {
    const monde = P.Jeu.monde;
    if (monde.tuto) return monde.tuto;
    const pl = scene.plateau, dep = scene.lieux.depart, maisons = scene.lieux.maisons || [];
    const sols = pl.cases().filter(c => pl.sol(c[0], c[1]) && !meme(c, dep));
    const ouvert = c => DIRS8.filter(([dx, dy]) => pl.sol(c[0] + dx, c[1] + dy)).length;
    const loinMaisons = c => maisons.length ? Math.min(...maisons.map(m => cheb(c, m))) : 9;
    // en plein milieu du sol (aucun décor autour : on le voit bien), sinon presque
    let l = sols.filter(c => [3, 4].indexOf(cheb(c, dep)) >= 0 && ouvert(c) === 8 && loinMaisons(c) >= 3);
    if (!l.length) l = sols.filter(c => [3, 4].indexOf(cheb(c, dep)) >= 0 && ouvert(c) >= 6 && loinMaisons(c) >= 3);
    if (!l.length) l = sols.filter(c => cheb(c, dep) >= 2 && loinMaisons(c) >= 2);
    if (!l.length) l = sols;
    l.sort((a, b) => (loinMaisons(b) - loinMaisons(a)) || (cheb(a, dep) - cheb(b, dep)) || ((a[0] + a[1]) - (b[0] + b[1])));
    const entrainement = (l[0] || dep).slice();
    let m = sols.filter(c => cheb(c, dep) === 2 && ouvert(c) === 8 && loinMaisons(c) >= 2 && !meme(c, entrainement));
    if (!m.length) m = sols.filter(c => cheb(c, dep) === 2 && ouvert(c) >= 5 && loinMaisons(c) >= 2 && !meme(c, entrainement));
    if (!m.length) m = sols.filter(c => cheb(c, dep) <= 3 && !meme(c, entrainement));
    m.sort((a, b) => (cheb(b, entrainement) - cheb(a, entrainement)) || (ouvert(b) - ouvert(a)));
    monde.tuto = { entrainement, pnj: (m[0] || dep).slice() };
    return monde.tuto;
  }
  // la case voulue si elle est libre, sinon la plus proche qui l'est
  function caseLibre(scene, c) {
    const pl = scene.plateau, libre = k => pl.sol(k[0], k[1]) && !scene.occupee(k);
    if (libre(c)) return c.slice();
    const l = pl.cases().filter(libre).sort((a, b) => cheb(a, c) - cheb(b, c));
    return (l[0] || c).slice();
  }
  // Appelé à la création de l'exploration (et quand la quête commence ou s'arrête)
  function preparerBalade(scene) {
    if (!scene || !P.Jeu.monde || !scene.plateau) return;
    const L = lieux(scene);
    if (!scene.pnj && scene.textures.exists("pnj-fournil")) {
      scene.pnj = new P.Pion(scene.plateau, { cle: "pnj-fournil", equipe: "neutre", taille: 20 }).placer(caseLibre(scene, L.pnj));
      scene.pnj.pnj = true;
      scene.pnj.orienter(-1);
    }
    majGroupe(scene);
  }
  function majGroupe(scene) {
    const monde = P.Jeu.monde; if (!monde || !scene || !scene.pionsGroupes) return;
    let i = monde.groupes.findIndex(g => g.tuto);
    const voulu = actif() && !fait("addition");
    if (voulu) {
      const L = lieux(scene);
      if (i < 0) { monde.groupes.push({ groupe: GROUPE, tuto: true, immobile: true, case: L.entrainement.slice(), maison: L.entrainement.slice(), actif: false, revient: 0, depuis: Date.now(), arrivageDepart: 0 }); i = monde.groupes.length - 1; }
      const g = monde.groupes[i];
      if (!g.actif) { g.actif = true; g.case = caseLibre(scene, L.entrainement); }
      if (!scene.pionsGroupes[i]) {
        const p = scene.pionsGroupes[i] = scene.pionGroupe(g);
        if (!P.reduit()) { p.c.setAlpha(0); scene.tween({ targets: p.c, alpha: 1, duration: 400 }); }
      }
    } else if (i >= 0) {
      monde.groupes[i].actif = false;
      const p = scene.pionsGroupes[i];
      if (p) { p.detruire(); scene.pionsGroupes[i] = null; }
    }
    scene.plateau.transparence(scene.tousLesPions());
    P.reveil && P.reveil();
  }
  function caseGroupe(scene) {
    const i = P.Jeu.monde ? P.Jeu.monde.groupes.findIndex(g => g.tuto && g.actif) : -1;
    const p = i >= 0 && scene.pionsGroupes[i];
    return p && p.case ? p.case : null;
  }
  // Étape 1 : une case libre à deux pas, sur le chemin du Grumeau d'entraînement
  function caseMarche(scene) {
    const moi = scene.moi && scene.moi.case; if (!moi) return null;
    const cle = moi.join(",");
    if (sous.cache.marche && sous.cache.marche.cle === cle) return sous.cache.marche.v;
    const pl = scene.plateau, gc = caseGroupe(scene);
    let v = null;
    if (gc) {
      const voisins = DIRS8.map(([dx, dy]) => [gc[0] + dx, gc[1] + dy]).filter(c => pl.sol(c[0], c[1]) && !scene.occupee(c)).sort((a, b) => cheb(a, moi) - cheb(b, moi));
      for (const vz of voisins) {
        const ch = scene.chemin(moi, vz);
        if (ch && ch.length > 1) { const l = ch.slice(1, 4), bien = l.find(c => !cachee(pl, c)); v = bien || ch[Math.min(2, ch.length - 1)]; break; }
      }
    }
    if (!v) v = DIRS8.map(([dx, dy]) => [moi[0] + 2 * dx, moi[1] + 2 * dy]).find(c => pl.sol(c[0], c[1]) && !scene.occupee(c) && scene.chemin(moi, c)) || null;
    sous.cache.marche = { cle, v };
    return v;
  }

  // Une case cachée derrière un décor (le décor est dessiné devant elle, plus bas à l'écran) : on évite d'y poser l'anneau.
  // Le four, haut et large, cache jusqu'à trois cases derrière lui ; billot, caisse et lanterne (sa tête), celle juste derrière.
  const PORTE_DECOR = { four: 3, billot: 2, caisse: 2, lanterne: 2 };
  function cachee(pl, c) {
    for (let dx = 0; dx <= 3; dx++) for (let dy = 0; dy <= 3; dy++) {
      const k = dx + dy;
      if (k < 1 || k > 3 || Math.abs(dx - dy) > 1) continue;
      const x = c[0] + dx, y = c[1] + dy, d = pl.existe(x, y) && !pl.sol(x, y) ? (pl.carte.decor ? pl.carte.decor(x, y) : "caisse") : null;
      if (d && k <= (d in PORTE_DECOR ? PORTE_DECOR[d] : 2)) return 1;
    }
    return 0;
  }

  // ---------- Le combat d'entraînement : les cibles, d'après le moteur ----------
  function grumeau(s) { return (s.vueEtat.combattants || []).find(c => c.camp !== "artisans" && c.genre === "monstre" && c.vivant && c.case) || null; }
  // la case verte la plus proche du Grumeau (R.deplacementsPossibles, déjà calculée par la scène)
  // De cette case, un sort disponible atteindrait-il le Grumeau ? Le moteur le dit, sur une copie de l'état où l'on est
  // déjà sur cette case (R.cloner, R.barre, R.casesVisables, R.apercuSort).
  function atteintDepuis(e, c, g) {
    try {
      const k = R().cloner(e), m = R().trouver(k, "moi"); m.case = c.slice();
      const fiches = m.sorts || [];
      return R().barre(k, "moi").filter(b => b.disponible).some(b => {
        const f = fiches.find(x => x.id === b.id); if (!f || !faitDegats(f)) return false;
        const v = R().casesVisables(k, "moi", b.id).cases.filter(x => x.visable && R().distance(x.case, g.case) <= 3);
        const touche = cs => { try { const ap = R().apercuSort(k, "moi", b.id, cs); return !!(ap.ok && (ap.cibles || []).some(t => t.id === g.id && t.degats && !t.allie)); } catch (err) { return false; } };
        const direct = v.find(x => meme(x.case, g.case));
        return (direct && touche(direct.case)) || v.some(x => !meme(x.case, g.case) && touche(x.case));
      });
    } catch (err) { return false; }
  }
  function caseVerte(s, g) {
    const l = (s.portee || []).slice();
    if (!l.length) return null;
    const pl = s.plateau, e = s.etat, moi = (R().trouver(e, "moi") || {});
    const cle = g ? cleTour(e, moi, g) + "|verte" : "";
    if (cle && sous.cache.verte && sous.cache.verte.cle === cle) return sous.cache.verte.v;
    // un détour (plus de Pas que de cases en ligne droite) trompe l'œil : la case semble voisine et coûte 3 Pas
    const detour = p => moi.case ? Math.max(0, p.cout - R().distance(moi.case, p.case)) : 0;
    // d'abord les cases d'où un sort atteint le Grumeau (on pourra lancer juste après) ; puis la plus proche du Grumeau ;
    // une case cachée derrière un décor ne sert qu'en dernier recours (l'anneau y désignerait le décor)
    const portee = new Map(l.map(p => [p.case.join(","), g ? atteintDepuis(e, p.case, g) : false]));
    const score = p => (portee.get(p.case.join(",")) ? 0 : 100) + (g ? R().distance(p.case, g.case) : 0) + 8 * cachee(pl, p.case) + 2 * detour(p);
    l.sort((a, b) => score(a) - score(b) || cachee(pl, a.case) - cachee(pl, b.case) || a.cout - b.cout);
    const v = l[0].case;
    if (cle) sous.cache.verte = { cle, v };
    return v;
  }
  // la case dorée la plus proche du Grumeau (la sienne compte : la toucher, c'est choisir d'y rester)
  function caseDoree(s, g) {
    const e = s.etat, dep = e.carte.departs[e.depart];
    const l = (dep.artisans || []).filter(c => R().terrain(e, c) === "sol" && !(e.combattants || []).some(k => k.id !== "moi" && k.vivant && meme(k.case, c)));
    const score = c => (g ? R().distance(c, g.case) : 0) + 8 * cachee(s.plateau, c);
    l.sort((a, b) => score(a) - score(b));
    return l[0] || null;
  }
  const faitDegats = f => JSON.stringify((f && f.effets) || []).indexOf('"degats"') >= 0;
  const degatsDirects = f => (f.effets || []).some(b => b.type === "degats" || (b.type === "si" && (b.effets || []).some(x => x.type === "degats")));
  // Où viser avec ce sort pour toucher le Grumeau : sa case si le sort l'y prend, sinon une case visable dont la zone le prend
  // (R.casesVisables, puis R.apercuSort qui donne les cibles et leurs dégâts prévus) ; null si rien ne l'atteint d'ici
  const cleTour = (e, moi, g) => JSON.stringify([e.manche, e.tourNumero, moi.case, moi.cm, g.case, g.victuailles]);
  function viseePour(s, g, id) {
    const e = s.etat, moi = R().trouver(e, "moi");
    if (!moi || !g) return null;
    const cle = cleTour(e, moi, g) + id;
    sous.cache.vise = sous.cache.vise || {};
    if (cle in sous.cache.vise) return sous.cache.vise[cle];
    let v = null;
    try {
      const l = R().casesVisables(e, "moi", id).cases.filter(c => c.visable);
      const touche = c => { try { const ap = R().apercuSort(e, "moi", id, c); return !!(ap.ok && (ap.cibles || []).some(k => k.id === g.id && k.degats && !k.allie)); } catch (err) { return false; } };
      if (l.some(c => meme(c.case, g.case)) && touche(g.case)) v = g.case.slice();
      else {
        const autres = l.map(c => c.case).filter(c => !meme(c, g.case)).sort((a, b) => cachee(s.plateau, a) - cachee(s.plateau, b) || R().distance(a, g.case) - R().distance(b, g.case));
        v = autres.find(touche) || null;
      }
    } catch (err) { v = null; }
    if (Object.keys(sous.cache.vise).length > 60) sous.cache.vise = {};
    sous.cache.vise[cle] = v;
    return v;
  }
  // Le sort à conseiller : disponible (R.barre), qui fait des dégâts tout de suite de préférence, et qui atteint le Grumeau d'ici
  function sortConseille(s, g) {
    const e = s.etat, moi = R().trouver(e, "moi");
    if (!moi || !g) return null;
    const cle = cleTour(e, moi, g);
    if (sous.cache.sort && sous.cache.sort.cle === cle) return sous.cache.sort.v;
    const fiches = moi.sorts || [], rang = b => b.emplacement ? b.emplacement : 50;
    const l = R().barre(e, "moi").filter(b => b.disponible).map(b => ({ b, f: fiches.find(x => x.id === b.id) })).filter(x => x.f && faitDegats(x.f))
      .sort((a, b) => (degatsDirects(b.f) - degatsDirects(a.f)) || (rang(a.b) - rang(b.b)));
    let v = null;
    for (const x of l) if (viseePour(s, g, x.b.id)) { v = x.b; break; }
    sous.cache.sort = { cle, v };
    return v;
  }
  const selSort = id => `#grille-sorts .sort[data-id="${CSS.escape(id)}"]`;

  // ---------- Ce qu'il faut montrer maintenant : { num, texte, cible: { sel } | { case } | null, dans } ----------
  function ouverts() {
    const o = id => { const d = $(id); return !!(d && d.open); };
    return { fiche: o("d-fiche"), addition: o("d-addition"), carac: o("d-carac"), grimoire: o("d-grimoire"), reglages: o("d-reglages"), lexique: o("d-lexique") };
  }
  function vue() {
    const x = tuto();
    if (!x || x.statut !== "actif") return null;
    const J = P.Jeu;
    if (!J || J.etape !== "jeu") return null;
    const s = J.sceneActive;
    if (!s || !s.sys || !s.sys.isActive()) return sous.vue;
    const k = premiere();
    if (k < 0) return { num: N, texte: "Bravo ! Ta quête est finie.", cible: null };
    return s.sys.settings.key === "combat" ? vueCombat(s, k) : vueBalade(s, k);
  }
  function vueBalade(s, k) {
    const d = ouverts();
    // le combat d'entraînement n'est pas allé au bout (défaite, rechargement, renoncement) : on reprend à l'étape 2
    if (k >= index("placement") && k <= index("addition")) k = index("groupe");
    if (d.fiche && sous.fiche && k <= index("groupe")) {
      if (sous.fiche === "tuto") return { num: 2, texte: DIT.fiche, cible: { sel: "#engager" } };
      return { num: 2, texte: DIT.ficheAutre, cible: { sel: "#d-fiche footer [data-fermer]" } };
    }
    if (d.grimoire) return { num: k === index("grimoire") ? 9 : k + 1, texte: DIT.grimoireOuvert, cible: { sel: "#d-grimoire footer [data-fermer]" } };
    if (d.carac) {
      if (k < index("points")) return { num: k + 1, texte: DIT.caracTot, cible: null, dans: "d-carac" };
      if (k === index("points")) {
        const v = $("carac-valider"), reste = +((($("carac-n") || {}).textContent) || 0);
        if (v && !v.disabled) return { num: 8, texte: reste > 0 ? DIT.validerReste : DIT.valider, cible: { sel: "#carac-valider" } };
        if (P.Profil.pointsEnAttente() > 0) {
          const els = P.Profil.elementsConseilles().map(P.UI.nomElement);
          return { num: 8, texte: DIT.placerPoints(els.length ? ` (pour toi : ${els.join(" et ")})` : ""), cible: { sel: "#carac-reste" } };
        }
        return { num: 8, texte: DIT.pointsPlaces, cible: { sel: "#d-carac .fermer" } };
      }
    }
    if (k === index("marcher")) return { num: 1, texte: s.tutoIci === false ? DIT.marcherAilleurs : DIT.marcher, cible: { case: caseMarche(s) } };
    if (k === index("groupe") && s.tutoIci === false) return { num: 2, texte: DIT.groupeAilleurs, cible: { case: caseVersFourneau(s) } };
    if (k === index("groupe")) {
      const repris = COMBAT.some(id => fait(id));
      return { num: 2, texte: sous.perdu ? DIT.groupePerdu : sous.renonce ? DIT.groupeRenonce : repris ? DIT.groupeRepris : DIT.groupe, cible: { case: caseGroupe(s) } };
    }
    if (k === index("points")) {
      const x = tuto() || {}, p = profil() || {};
      return { num: 8, texte: DIT.points(P.Profil.pointsEnAttente(), x.niveauAvant != null && p.niveau > x.niveauAvant), cible: { sel: "#b-carac" } };
    }
    return { num: 9, texte: DIT.grimoire, cible: { sel: "#b-grimoire" } };
  }
  function vueCombat(s, k) {
    const d = ouverts();
    if (!s.tuto) {
      const t = k === index("points") ? DIT.pointsApres : k === index("grimoire") ? DIT.grimoireApres : DIT.autreCombat;
      return { num: k + 1, texte: t, cible: null };
    }
    const kc = COMBAT.findIndex(id => !fait(id)), ec = kc < 0 ? index("addition") : index(COMBAT[kc]), num = ec + 1;
    if (d.addition) {
      const victoire = sous.issue === "victoire" || !!(s.etat.resultat && s.etat.resultat.vainqueur === "artisans");
      if (!victoire) return { num: 7, texte: DIT.defaite, cible: { sel: "#retour-balade" } };
      const niv = !!$("addition-carac");
      return { num: 7, texte: niv ? DIT.victoireNiveau : DIT.victoire, cible: { sel: niv ? "#addition-carac" : "#retour-balade" } };
    }
    if (s.phase === "placement") {
      if (ec === index("placement")) return sous.place ? { num, texte: DIT.envoyez, cible: { sel: "#envoyer" } } : { num, texte: DIT.place, cible: { case: caseDoree(s, grumeau(s)) } };
      return { num, texte: DIT.replace, cible: { sel: "#envoyer" } };
    }
    if (s.termine || s.phase === "fin" || s.etat.phase === "fin") return { num: 7, texte: DIT.finCombat, cible: null };
    // pendant sa propre action : même texte, sans cible (elle aurait bougé)
    if (s.phase === "anime" && s.monTour()) return Object.assign({}, sous.vue || { num, texte: DIT.attente }, { cible: null, dans: null });
    if (s.phase !== "joueur") return { num, texte: DIT.attente, cible: null };
    const g = grumeau(s), a = s.apercu, souris = !!(a && a.survol);
    const id = ETAPES[ec].id;
    if (id === "marcheCombat") {
      if (a && a.type === "marche") return { num, texte: souris ? DIT.apercuMarcheSouris : DIT.apercuMarche, cible: { case: a.case } };
      if (s.sortChoisi) return { num, texte: DIT.rangerSort, cible: { sel: selSort(s.sortChoisi) } };
      const v = caseVerte(s, g);
      return v ? { num, texte: DIT.vert, cible: { case: v } } : { num, texte: DIT.plusDePas, cible: { sel: "#fin-tour" } };
    }
    if (id === "finTour") return { num, texte: DIT.finTour, cible: { sel: "#fin-tour" } };
    // « Lancer un sort » (étape 5), puis « Gagner » (étape 7) : on guide vers un sort qui atteint le Grumeau
    const gagner = id === "addition";
    if (a && a.type === "sort") return { num, texte: souris ? DIT.apercuSortSouris : g && meme(a.case, g.case) ? DIT.apercuSort : DIT.apercuSortCase, cible: { case: a.case } };
    if (s.sortChoisi) {
      const vise = viseePour(s, g, s.sortChoisi);
      if (vise) {
        const surLui = meme(vise, g.case);
        return { num, texte: gagner ? (surLui ? DIT.continuerViser : DIT.continuerZone) : (surLui ? DIT.viser : DIT.viserZone), cible: { case: vise } };
      }
      const c = sortConseille(s, g);
      if (c) return { num, texte: DIT.horsRayon, cible: { sel: selSort(c.id) } };
    } else {
      const c = sortConseille(s, g);
      if (c) return { num, texte: gagner ? DIT.continuer(c.nom) : DIT.choisirSort(c.nom), cible: { sel: selSort(c.id) } };
    }
    const v = caseVerte(s, g);
    if (v && g && R().distance(v, g.case) < R().distance((R().trouver(s.etat, "moi") || {}).case || v, g.case)) return { num, texte: DIT.trop, cible: { case: v } };
    return { num, texte: gagner ? DIT.rienAFaire : DIT.tropFinir, cible: { sel: "#fin-tour" } };
  }

  // ---------- Affichage : la carte de quête, l'anneau doré, la phrase dans la fenêtre ouverte ----------
  let marque = null, marqueCle = "", rafAnneau = 0, bas0 = null, dansCle = "";
  function rendre(v) {
    const carte = $("tuto-carte"); if (!carte) return;
    const montrer = !!v, etaitCache = carte.hidden;
    carte.hidden = !montrer;
    $("app").classList.toggle("anim-reduite", !!(P.reduit && P.reduit()));
    if (montrer) {
      const x = tuto() || {};
      carte.classList.toggle("repliee", !!x.replie);
      const bt = $("tuto-replier");
      bt.setAttribute("aria-expanded", String(!x.replie));
      bt.setAttribute("aria-label", `${QUETE}, étape ${v.num} sur ${N}` + (x.replie ? " : déplier la carte de quête" : " : replier la carte de quête"));
      // sous les bandes du haut (sauf celles qui sont dans la colonne de droite, en paysage)
      const W = window.innerWidth;
      let haut = 8;
      ["bandeau-balade", "frise-barre"].forEach(id => { const e = $(id); if (!e || e.hidden) return; const r = e.getBoundingClientRect(); if (r.height && r.left < W * .45) haut = Math.max(haut, r.bottom + 6); });
      const top = Math.round(haut) + "px";
      if (carte.style.top !== top) carte.style.top = top;
      const bravo = sous.bravo && Date.now() < sous.bravo.jusqua ? sous.bravo.texte : "";
      carte.classList.toggle("bravo", !!bravo);
      ecrire($("tuto-etape"), bravo || `Étape ${v.num} sur ${N}`);
      ecrire($("tuto-num"), `${v.num}/${N}`);
      ecrire($("tuto-texte"), sous.passer > Date.now() ? "Touche « Sûr ? » pour arrêter la quête." : v.texte);
      const bp = $("tuto-passer"), arme = sous.passer > Date.now();
      bp.classList.toggle("arme", arme);
      ecrire(bp, arme ? "Sûr ?" : "Passer");
      bp.setAttribute("aria-label", arme ? "Toucher encore pour passer le tutoriel" : "Passer le tutoriel");
      const img = $("tuto-portrait"); if (P.portraits.fournil && img.getAttribute("src") !== P.portraits.fournil) img.src = P.portraits.fournil;
    }
    // la carte prend une bande en haut du terrain (P.UI.rectUtile) : on recadre quand elle apparaît, disparaît, se replie
    // ou change de place (autre scène) ; pas quand seul son texte change (la vue ne saute pas sous le doigt)
    const r = montrer ? carte.getBoundingClientRect() : null;
    $("app").style.setProperty("--tuto-h", r ? Math.max(0, Math.round(r.bottom) - 58) + "px" : "0px");
    const cle = montrer ? carte.style.top + (carte.classList.contains("repliee") ? "r" : "") : "";
    if (etaitCache !== !montrer || (bas0 !== null && cle !== bas0)) { if (P.Jeu && P.Jeu.recadrer) P.Jeu.recadrer(); }
    bas0 = cle;
    appliquerCible(v);
  }
  function ecrire(e, t) { t = P.typo ? P.typo(t) : t; if (e && e.textContent !== t) e.textContent = t; }
  // La cible : la classe « tuto-cible » sur un bouton, ou l'anneau posé sur une case du terrain
  function appliquerCible(v) {
    v = v === undefined ? sous.vue : v;
    const sel = v && v.cible && v.cible.sel;
    const el = sel ? document.querySelector(sel) : null;
    if (marque && marque !== el) marque.classList.remove("tuto-cible");
    if (el && !el.classList.contains("tuto-cible")) el.classList.add("tuto-cible");
    // un sort conseillé hors de la bande qui défile : on l'y amène, une fois
    if (el && sel !== marqueCle && el.classList.contains("sort")) { try { el.scrollIntoView({ block: "nearest", inline: "nearest" }); } catch (e) { /* rien */ } }
    marque = el; marqueCle = sel || "";
    // dans une fenêtre ouverte, Mère Fournil parle dans la fenêtre (la carte est derrière)
    const dlg = (el && el.closest("dialog")) || (v && v.dans ? $(v.dans) : null);
    const ancien = document.querySelector(".tuto-dans");
    if (dlg && dlg.open && v) {
      const pied = dlg.querySelector("footer"), corps = dlg.querySelector(".corps");
      let n = ancien;
      if (!n) { n = document.createElement("p"); n.className = "tuto-dans"; n.setAttribute("role", "status"); }
      const html = `<img src="${P.portraits.fournil || ""}" alt=""><span><b>${PNJ} :</b> ${esc(v.texte)}</span>`;
      if (dansCle !== html) { n.innerHTML = html; dansCle = html; }
      const lieu = pied || corps;
      if (lieu && (n.parentNode !== lieu || lieu.firstChild !== n)) lieu.insertBefore(n, lieu.firstChild);
    } else if (ancien) { ancien.remove(); dansCle = ""; }
    const carte = $("tuto-carte"), dedans = !!(dlg && dlg.open && v);
    if (carte && carte.classList.contains("dans-fenetre") !== dedans) carte.classList.toggle("dans-fenetre", dedans);
    // l'anneau sur une case du terrain
    const surCase = !!(v && v.cible && v.cible.case);
    if (surCase && !rafAnneau) rafAnneau = requestAnimationFrame(placerAnneau);
    if (!surCase) { const a = $("tuto-anneau"); if (a && !a.hidden) a.hidden = true; degager(P.Jeu && P.Jeu.sceneActive, null); }
  }
  let styleAnneau = "";
  // La case montrée est cachée derrière un décor : le décor devient transparent (comme devant un personnage), on voit la case
  function degager(s, c) {
    const pl = s && s.plateau; if (!pl || !pl.transparence) return;
    const voulu = c && cachee(pl, c) ? c.join(",") : "";
    if ((pl.degageCle || "") === voulu) return;
    pl.degageCle = voulu; pl.degager = voulu ? [c.slice()] : [];
    try { pl.transparence(s.tousLesPions ? s.tousLesPions() : [], s.objetsAuSol ? s.objetsAuSol() : []); } catch (e) { /* rien */ }
  }
  function placerAnneau() {
    rafAnneau = 0;
    const a = $("tuto-anneau"), v = sous.vue, s = P.Jeu && P.Jeu.sceneActive;
    const c = v && v.cible && v.cible.case;
    if (!a) return;
    if (!c || !s || !s.vue || !s.sys || !s.sys.isActive() || P.UI.ouvert() || (P.Jeu && P.Jeu.nomScene() === "creation")) { a.hidden = true; degager(s, null); return; }
    degager(s, c);
    const w = P.iso(c[0], c[1]), e = s.vue.versEcran(w.x, w.y), Z = s.vue.Z;
    const L = P.ISO.L * Z * 1.16, H = P.ISO.H * Z * 1.16, r = P.UI.rectUtile();
    const dedans = e.x > r.x - 10 && e.x < r.x + r.w + 10 && e.y > r.y - 10 && e.y < r.y + r.h + 10;
    a.hidden = !dedans;
    const st = `width:${L.toFixed(1)}px;height:${H.toFixed(1)}px;transform:translate(${(e.x - L / 2).toFixed(1)}px,${(e.y - H / 2).toFixed(1)}px)`;
    if (st !== styleAnneau) { a.style.cssText = st; styleAnneau = st; }
    rafAnneau = requestAnimationFrame(placerAnneau);
  }

  // ---------- Les moments clés ----------
  function actualiser() {
    let v = null;
    try { v = vue(); } catch (e) { console.warn("Tutoriel :", e); v = sous.vue; }
    sous.vue = v;
    try { rendre(v); } catch (e) { console.warn("Tutoriel (affichage) :", e); }
  }
  // Les réussites qui se voient à l'écran : le Grimoire ouvert puis refermé ; le panneau des caractéristiques refermé sans
  // points à placer ; une fiche refermée
  function surveiller() {
    const x = tuto(); if (!x || x.statut !== "actif") return;
    const d = ouverts(), k = premiere();
    if (!d.fiche) sous.fiche = null;
    if (d.grimoire) sous.grimoireVu = true;
    else if (sous.grimoireVu) { sous.grimoireVu = false; reussir("grimoire"); }
    if (d.carac && k === index("points")) sous.caracVu = true;
    else if (!d.carac && sous.caracVu) { sous.caracVu = false; if (P.Profil.pointsEnAttente() === 0) reussir("points"); }
    // toutes les étapes faites : la fin de la quête, au Fourneau, quand aucune fenêtre n'est ouverte
    if (premiere() < 0 && P.Jeu.nomScene() === "balade" && !P.UI.ouvert()) terminer();
  }
  function signal(nom, d = {}) {
    if (!actif()) return;
    const x = tuto();
    switch (nom) {
      case "marche-balade": reussir("marcher"); break;
      case "fiche-groupe": sous.fiche = d.tuto ? "tuto" : "autre"; break;
      case "engager": if (d.tuto) { reussir("marcher", true); reussir("groupe"); sous.place = false; sous.perdu = false; sous.renonce = false; sous.issue = null; } break;
      case "place": if (d.tuto) sous.place = true; break;
      case "envoye": if (d.tuto) reussir("placement"); break;
      case "deplace": if (d.tuto) reussir("marcheCombat"); break;
      case "lance": if (d.tuto) reussir("sort"); break;
      case "fin-tour": if (d.tuto) reussir("finTour"); break;
      case "fin-combat":
        if (!d.tuto) break;
        sous.issue = d.victoire ? "victoire" : "defaite";
        // la victoire est acquise dès maintenant (la prime et l'XP le sont aussi) : recharger la page sur l'Addition reprend à l'étape 8
        if (d.victoire) { const p = profil(); if (p) x.niveauAvant = p.niveau; COMBAT.forEach(id => reussir(id, id !== "addition")); }
        break;
      case "retour":
        if (d.tuto && d.victoire) COMBAT.forEach(id => reussir(id, id !== "addition"));
        else if (d.tuto) { delete x.fait.groupe; delete x.fait.addition; sous.perdu = !d.renonce; sous.renonce = !!d.renonce; sauver(); }
        sous.issue = null; sous.place = false;
        break;
      case "carac-valide": reussir("points"); break;
      default: break;
    }
    actualiser();
  }
  // La prime de la quête, à l'Addition du combat d'entraînement gagné : de quoi passer au niveau suivant (une fois par artisan)
  function prime(addition) {
    const x = tuto(), p = profil();
    if (!x || x.statut !== "actif" || x.prime || !p) return 0;
    x.prime = true; sauver();
    if (p.niveau >= P.Profil.NIVEAU_MAX) return 0;
    const gagne = (addition && addition.xp && addition.xp.moi) || 0;
    return Math.max(0, P.Profil.xpDuNiveau(p.niveau + 1) - (p.xp + gagne));
  }
  function terminer() {
    const x = tuto(), p = profil(); if (!x || !p) return;
    x.statut = "fini";
    let don = false;
    if (!x.recompense) {
      x.recompense = true; don = true;
      p.ble += RECOMPENSE.ble;
      p.sac["sac.pain-de-route"] = (p.sac["sac.pain-de-route"] || 0) + RECOMPENSE.pains;
    }
    sauver();
    try { P.UI.bandeau(p); } catch (e) { /* rien */ }
    const s = sceneBalade(); if (s) majGroupe(s);
    actualiser();
    const corps = `<p class="resultat">Quête réussie !</p>
      <p>Bravo, tu connais le service. ${don ? `Voici ta récompense : <b>${RECOMPENSE.ble} Blé</b> et <b>${RECOMPENSE.pains > 1 ? RECOMPENSE.pains + " Pains" : "un Pain"} de route</b>.` : "Ta récompense, tu l'as reçue la première fois."}</p>
      <p>Dans les vrais combats, deux choses en plus : un <b>Minuteur</b> (${(R().CONST || {}).MINUTEUR_S || 45} secondes par tour, tu peux le couper dans les Réglages) et une <b>Commande</b> (un défi pour un bonus, à toi de la garder ou non).</p>
      <p class="texte-doux">Un mot du jeu t'échappe ? Le <b>Lexique</b> l'explique. Tu le trouves en bas de l'écran, et dans les Réglages pendant un combat.</p>`;
    const c = P.UI.fenetre("d-fiche", `${QUETE} : réussi`, corps, `<button type="button" class="bouton" id="tuto-lexique">Ouvrir le Lexique</button><button type="button" class="bouton or" data-fermer>Merci, ${PNJ} !</button>`, { image: P.portraits.fournil, surFermer: () => { if (P.Astrelier) P.Astrelier.proposerApresTuto({ finTuto: true }); } });
    c.querySelector("#tuto-lexique").onclick = () => { P.UI.fermer("d-fiche"); P.UI.lexique(); };
  }

  // ---------- Commencer, passer, recommencer ----------
  function demarrer() {
    const p = profil(); if (!p) return;
    const ancien = tuto() || {};
    p.tuto = { statut: "actif", fait: {}, prime: !!ancien.prime, recompense: !!ancien.recompense, replie: false, commence: true };
    sauver();
    sous = neuf();
    const s = sceneBalade(); if (s) preparerBalade(s);
    actualiser();
  }
  function passer() {
    const p = profil(); if (!p) return;
    const x = tuto();
    if (x) x.statut = "passe"; else p.tuto = { statut: "passe", fait: {} };
    sauver();
    sous = neuf();
    const s = sceneBalade(); if (s) majGroupe(s);
    actualiser();
    P.UI.toast("Tutoriel passé. Tu peux le recommencer dans les Réglages.");
  }
  // Pour un nouvel artisan : « Suivre le tutoriel ? »
  function proposer(ensuite) {
    const p = profil(); if (!p) return;
    let choisi = false;
    const fin = suit => {
      if (choisi) return; choisi = true;
      P.UI.fermer("d-fiche");
      if (suit) demarrer();
      else { p.tuto = Object.assign(tuto() || { fait: {} }, { statut: "passe" }); sauver(); P.UI.toast("D'accord ! Le tutoriel t'attend dans les Réglages."); }
      if (ensuite) ensuite(suit);
      // sans le tutoriel, Mère Fournil propose quand même le tour de l'Astrelier (après la répartition des points, s'il y en a)
      if (!suit && P.Astrelier) P.Astrelier.proposerApresTuto({ sansTuto: true, attente: 900 });
    };
    // la question est posée : si le jeu se ferme avant la réponse, elle revient au retour
    p.tuto = Object.assign(tuto() || { fait: {}, statut: null }, { propose: true }); sauver();
    const corps = `<p>Bonjour, je suis <b>${PNJ}</b>, la cheffe du Fourneau.</p><p>Veux-tu suivre le tutoriel ? C'est une petite quête, « ${QUETE} » : 9 étapes très courtes pour comprendre le jeu.</p>`;
    const c = P.UI.fenetre("d-fiche", "Suivre le tutoriel ?", corps,
      `<button type="button" class="bouton" id="tuto-non">Non, je connais le jeu</button><button type="button" class="bouton or" id="tuto-oui">Oui</button>`,
      { image: P.portraits.fournil, sansFermer: true, surFermer: () => fin(false) });
    c.querySelector("#tuto-oui").onclick = () => fin(true);
    c.querySelector("#tuto-non").onclick = () => fin(false);
  }
  // Toucher Mère Fournil sur le terrain : la quête en entier
  function parler() {
    const x = tuto(), UI = P.UI;
    let corps, pied;
    if (x && x.statut === "actif") {
      const k = premiere(), v = sous.vue;
      corps = `<p>${esc((v && v.texte) || "")}</p><ol class="tuto-etapes">${ETAPES.map((e, i) => `<li class="${x.fait[e.id] ? "fait" : i === k ? "encours" : ""}">${x.fait[e.id] ? '<span aria-hidden="true">✓</span> ' : ""}${esc(e.titre)}${x.fait[e.id] ? '<span class="vh"> (fait)</span>' : i === k ? '<span class="vh"> (en cours)</span>' : ""}</li>`).join("")}</ol>`;
      pied = `<button type="button" class="bouton" id="tuto-j-passer">Passer le tutoriel</button><button type="button" class="bouton or" data-fermer>Continuer</button>`;
    } else if (x && x.statut === "fini") {
      corps = `<p>Tu connais le service ! Un mot du jeu t'échappe ? Le Lexique l'explique.</p>`;
      pied = `<button type="button" class="bouton" id="tuto-j-refaire">Recommencer le tutoriel</button><button type="button" class="bouton" id="tuto-j-tour">Le tour de l'Astrelier</button><button type="button" class="bouton" id="tuto-j-lexique">Lexique</button><button type="button" class="bouton or" data-fermer>Merci !</button>`;
    } else {
      corps = `<p>Bonjour, je suis la cheffe du Fourneau. Veux-tu suivre le tutoriel ? C'est une petite quête, « ${QUETE} ».</p>`;
      pied = `<button type="button" class="bouton" data-fermer>Plus tard</button><button type="button" class="bouton or" id="tuto-j-refaire">Suivre le tutoriel</button>`;
    }
    const c = UI.fenetre("d-fiche", x && x.statut === "actif" ? `${PNJ} · ${QUETE}` : PNJ, corps, pied, { image: P.portraits.fournil });
    const bp = c.querySelector("#tuto-j-passer");
    if (bp) bp.onclick = () => { if (bp.dataset.sur) { UI.fermer("d-fiche"); passer(); return; } bp.dataset.sur = "1"; bp.textContent = "Toucher encore pour passer"; bp.classList.add("or"); };
    const br = c.querySelector("#tuto-j-refaire"); if (br) br.onclick = () => { UI.fermer("d-fiche"); demarrer(); };
    const bl = c.querySelector("#tuto-j-lexique"); if (bl) bl.onclick = () => { UI.fermer("d-fiche"); UI.lexique(); };
    const bt = c.querySelector("#tuto-j-tour"); if (bt) bt.onclick = () => { UI.fermer("d-fiche"); if (P.Astrelier) P.Astrelier.parler(); };
  }
  // À chaque entrée dans le jeu (nouvel artisan ou « Reprendre ») : un combat ne survit pas au rechargement de la page
  function entrer() {
    sous = neuf();
    const x = tuto();
    if (x && x.statut === "actif" && x.fait.groupe && !x.fait.addition) { delete x.fait.groupe; sauver(); }
    actualiser();
  }
  // Au retour dans le jeu (« Reprendre ») : une question restée sans réponse revient (le tutoriel, puis le tour de l'Astrelier)
  function reprendre() {
    const x = tuto();
    if (x && x.propose && !x.statut && !x.commence) { proposer(); return true; }
    const t = (profil() || {}).tour;
    if (x && (x.statut === "fini" || x.statut === "passe") && (!t || (!t.propose && !t.statut)) && P.Astrelier) { P.Astrelier.proposerApresTuto({ sansTuto: x.statut !== "fini" }); return true; }
    return false;
  }
  // « Suivre » tant qu'il n'a jamais commencé (refusé à la création), « Recommencer » ensuite
  const libelleReglages = () => { const x = tuto(); return x && (x.commence || x.statut === "actif" || x.statut === "fini") ? "Recommencer le tutoriel" : "Suivre le tutoriel"; };

  // ---------- La carte : boutons ----------
  function brancher() {
    const bp = $("tuto-passer"), br = $("tuto-replier");
    if (!bp || bp.dataset.branche) return;
    bp.dataset.branche = "1";
    bp.onclick = () => {
      if (sous.passer > Date.now()) { sous.passer = 0; passer(); return; }
      sous.passer = Date.now() + 4000;
      actualiser();
      setTimeout(actualiser, 4050);
    };
    br.onclick = () => { const x = tuto(); if (!x) return; x.replie = !x.replie; sauver(); actualiser(); };
  }

  // ---------- Boucles ----------
  let prevu = 0;
  const bientot = () => { if (prevu) return; prevu = requestAnimationFrame(() => { prevu = 0; try { appliquerCible(); } catch (e) { /* rien */ } }); };
  function demarrerBoucles() {
    brancher();
    setInterval(() => { try { if (P.Jeu && P.UI && P.Profil) { surveiller(); actualiser(); } } catch (e) { console.warn("Tutoriel :", e); } }, 250);
    // la barre de sorts et les fenêtres se redessinent : la cible est reposée tout de suite
    try { new MutationObserver(bientot).observe($("app"), { childList: true, subtree: true }); } catch (e) { /* rien */ }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarrerBoucles); else demarrerBoucles();

  P.Tuto = {
    ETAPES, PNJ, QUETE, GROUPE, FICHE,
    signal, combat, groupe, fiche, prevision, prime, preparerBalade, preparerTextures, majGroupe,
    proposer, parler, demarrer, recommencer: demarrer, passer, entrer, reprendre, actualiser, libelleReglages,
    actif, premiere,
    // pour les essais : l'état sauvé et l'étape montrée (lecture seule)
    etat() { const x = tuto(); return x ? JSON.parse(JSON.stringify(Object.assign({}, x, { etape: premiere() + 1, vue: sous.vue }))) : null; }
  };
})();
