/*
 * Orvane, prototype : le personnage du joueur (hors combat) et ce qu'on donne au moteur.
 * ORVANE.Proto.Profil : création, sauvegarde (localStorage dans des try/catch), niveaux, grimoire, définition d'artisan.
 * Le grimoire vient de ORVANE.GRIMOIRE (grimoire.js, { classe: [{ base, declinaison }] }) s'il existe, sinon de ORVANE.SORTS_ESSAI.
 * Aucune règle de combat ici : seulement le personnage qu'on passe à ORVANE.Regles.creerCombat.
 */
window.ORVANE = window.ORVANE || {};
(() => {
  const P = ORVANE.Proto = ORVANE.Proto || {};
  const R = () => ORVANE.Regles, O = () => ORVANE.Outils;
  const CLE = "orvane-proto-1";
  const PEAUX = ["#F1C9A5", "#E3BC94", "#C8956B", "#9C6B47", "#6B4A2E", "#4A3222"];
  const POILS = ["#2B211C", "#6B4A2E", "#C9A26B", "#B5532F", "#E8E1D2"];
  const NIVEAU_MAX = 200;
  const ELEMENTS = ["F", "E", "T", "S", "C"];

  // Courbe d'expérience du prototype : pour passer du niveau n au niveau n + 1, 40 n + 20 n² XP.
  const marche = n => 40 * n + 20 * n * n;
  function xpDuNiveau(n) { let t = 0; for (let k = 1; k < n; k++) t += marche(k); return t; }
  function niveauPourXp(xp) { let n = 1; while (n < NIVEAU_MAX && xp >= xpDuNiveau(n + 1)) n++; return n; }

  function lire() { try { const v = JSON.parse(localStorage.getItem(CLE) || "null"); return v && typeof v === "object" ? v : null; } catch (e) { return null; } }
  function ecrire(v) { try { localStorage.setItem(CLE, JSON.stringify(v)); } catch (e) { /* stockage indisponible : on continue sans */ } }

  const sauvegarde = lire() || {};
  // Les réglages, remis en forme (une sauvegarde abîmée ou bricolée ne doit pas dire une chose et en faire une autre) :
  // minuteur et accelere sont des oui/non ; reduit vaut oui, non, ou null (= suivre le système) ; bonus est l'un des deux bonus.
  function reparerReglages(v) {
    v = v && typeof v === "object" && !Array.isArray(v) ? v : {};
    const oui = (x, d) => x === true || x === 1 || x === "true" ? true : x === false || x === 0 || x === "false" || x === null ? false : d;
    return {
      minuteur: oui(v.minuteur, true),
      bonus: v.bonus === "ristourne" ? "ristourne" : "savoirFaire",
      reduit: v.reduit === true || v.reduit === false ? v.reduit : null,
      accelere: oui(v.accelere, false)
    };
  }
  const reglages = reparerReglages(sauvegarde.reglages);

  function classe(id) { return (ORVANE.CLASSES || []).find(c => c.id === id) || ORVANE.CLASSES[0]; }
  // Une sauvegarde abîmée ou plus ancienne est complétée avec les valeurs par défaut (sinon on repart de zéro)
  function reparer(v) {
    if (!v || typeof v !== "object") return null;
    try {
      const c = classe(v.classe), ent = (x, d, a, b) => { x = Math.round(+x); return Number.isFinite(x) ? Math.max(a, Math.min(b, x)) : d; };
      const niveau = ent(v.niveau, 1, 1, NIVEAU_MAX);
      const p = {
        classe: c.id, sexe: v.sexe === "f" ? "f" : "h",
        peau: typeof v.peau === "string" ? v.peau : PEAUX[2], poils: typeof v.poils === "string" ? v.poils : POILS[1],
        nom: String(v.nom || (v.sexe === "f" ? c.fem : c.nom)).slice(0, 18), niveau,
        xp: Math.max(ent(v.xp, 0, 0, 1e12), xpDuNiveau(niveau)), ble: ent(v.ble, 0, 0, 1e12),
        sac: reparerSac(v.sac),
        choix: reparerChoix(v.choix),
        combats: ent(v.combats, 0, 0, 1e9), victoires: ent(v.victoires, 0, 0, 1e9)
      };
      if (v.noms && typeof v.noms === "object" && !Array.isArray(v.noms)) {
        p.noms = {}; Object.keys(v.noms).forEach(k => { if (typeof v.noms[k] === "string") p.noms[k] = v.noms[k].slice(0, 60); });
      }
      // les explications données une seule fois (Minuteur, Commande…)
      if (v.vu && typeof v.vu === "object" && !Array.isArray(v.vu)) { p.vu = {}; Object.keys(v.vu).forEach(k => { if (v.vu[k] === true) p.vu[k] = true; }); }
      // le tutoriel (proto/tutoriel.js) : { statut, fait: { étape: true }, prime, recompense, replie, commence }
      if (v.tuto && typeof v.tuto === "object") {
        const f = {}; if (v.tuto.fait && typeof v.tuto.fait === "object") Object.keys(v.tuto.fait).forEach(k => { if (v.tuto.fait[k] === true) f[k] = true; });
        p.tuto = { statut: ["actif", "fini", "passe"].indexOf(v.tuto.statut) >= 0 ? v.tuto.statut : null, fait: f, prime: !!v.tuto.prime, recompense: !!v.tuto.recompense, replie: !!v.tuto.replie, commence: !!v.tuto.commence, propose: !!v.tuto.propose };
        if (Number.isFinite(+v.tuto.niveauAvant) && v.tuto.niveauAvant !== null) p.tuto.niveauAvant = ent(v.tuto.niveauAvant, 1, 1, NIVEAU_MAX);
      }
      // Le lieu (îles de l'Astrelier, proto/iles.js) : l'île et la case où l'on est, les îles visitées, les Fours banals allumés,
      // le bout de la Voie lactée par lequel on y est entré. Une sauvegarde d'avant les îles n'en a pas : on reprend au Fourneau.
      if (v.monde && typeof v.monde === "object" && !Array.isArray(v.monde)) p.monde = reparerMonde(v.monde);
      // La quête « Le tour de l'Astrelier » (proto/astrelier.js) : { statut, fait: { étape: true }, recompense, replie, propose }
      if (v.tour && typeof v.tour === "object" && !Array.isArray(v.tour)) {
        p.tour = { statut: ["actif", "fini", "refuse"].indexOf(v.tour.statut) >= 0 ? v.tour.statut : null, fait: oui(v.tour.fait), recompense: !!v.tour.recompense, replie: !!v.tour.replie, propose: !!v.tour.propose };
      }
      // Caractéristiques : { affinites: { F, E, T, S, C }, victuailles } (points placés par le joueur).
      // Une sauvegarde d'avant le panneau (répartition automatique, avec un reste en Victuailles) n'en a pas :
      // ses points passent à la règle « Répartir pour moi », et le jeu le dit une fois (profil.caracAnnonce).
      if (v.carac && typeof v.carac === "object" && v.carac.mode !== "auto") {
        const r = reparerCarac(v.carac, niveau);
        p.carac = r.carac;
        // une répartition abîmée (plus de points que le capital) : « Répartir pour moi », et le jeu le dit une fois
        if (r.abimee) { p.carac = repartirPourMoi(p); p.caracAnnonce = "abimee"; }
        else if (r.rendus) p.caracAnnonce = "rendus:" + r.rendus;
        else if (v.caracAnnonce) p.caracAnnonce = String(v.caracAnnonce);
      } else {
        p.carac = repartirPourMoi(p);
        if (niveau > 1) p.caracAnnonce = "ancienne";
      }
      return p;
    } catch (e) { return null; }
  }
  // Un ensemble de clés à vrai ({ id: true }), sans rien d'autre
  function oui(o) {
    const r = {};
    if (o && typeof o === "object" && !Array.isArray(o)) Object.keys(o).forEach(k => { if (o[k] === true && k.length <= 60) r[k] = true; });
    return r;
  }
  function reparerMonde(m) {
    const ids = (P.Iles && P.Iles.LISTE) || [], ile = ids.indexOf(m.ile) >= 0 ? m.ile : "fourneau";
    const c = ile === m.ile && Array.isArray(m.case) && m.case.length === 2 && m.case.every(n => Number.isInteger(n) && n >= 0 && n < 400) ? [m.case[0], m.case[1]] : null;
    const r = { ile, case: c, visitees: oui(m.visitees), fours: oui(m.fours) };
    if (m.entreeVL === "haut" || m.entreeVL === "bas") r.entreeVL = m.entreeVL;
    return r;
  }
  // Le Sac : un objet { id: nombre } (un tableau, ou des nombres abîmés, perdraient les objets gagnés à la sauvegarde)
  function reparerSac(v) {
    const s = {};
    if (v && typeof v === "object" && !Array.isArray(v)) Object.keys(v).forEach(k => { const n = Math.round(+v[k]); if (Number.isFinite(n) && n > 0) s[k] = Math.min(n, 1e6); });
    if (!s["sac.pain-de-route"]) s["sac.pain-de-route"] = PAINS_PAR_COMBAT();
    return s;
  }
  function reparerChoix(v) {
    const c = {};
    if (v && typeof v === "object" && !Array.isArray(v)) Object.keys(v).forEach(k => { if (v[k] === "base" || v[k] === "declinaison") c[k] = v[k]; });
    return c;
  }
  // Les Pains de route : chaque combat en donne CONST.PAIN_DE_ROUTE.parCombat ; ceux du Sac au-delà (une récompense) sont une
  // réserve, mangée seulement après les Pains du combat.
  function PAINS_PAR_COMBAT() { try { return R().CONST.PAIN_DE_ROUTE.parCombat; } catch (e) { return 3; } }
  let profil = reparer(sauvegarde.profil);
  // une ancienne sauvegarde vient de passer à « Répartir pour moi » : on garde tout de suite cette répartition
  if (profil && profil.caracAnnonce) sauver();
  function nouveau(o) {
    const c = classe(o.classe);
    const niveau = Math.max(1, Math.min(NIVEAU_MAX, Math.round(+o.niveau || 1)));
    profil = {
      classe: c.id, sexe: o.sexe === "f" ? "f" : "h", peau: o.peau || PEAUX[2], poils: o.poils || POILS[1],
      nom: String(o.nom || (o.sexe === "f" ? c.fem : c.nom)).slice(0, 18),
      niveau, xp: xpDuNiveau(niveau), ble: 0, sac: { "sac.pain-de-route": PAINS_PAR_COMBAT() }, choix: {}, combats: 0, victoires: 0,
      // un nouvel artisan choisit lui-même : ses points ne sont pas répartis
      carac: caracVide()
    };
    sauver();
    return profil;
  }
  function sauver() { ecrire({ profil, reglages }); }
  // Le lieu de l'artisan (îles) : profil.monde, créé au besoin (un nouvel artisan, une ancienne sauvegarde : le Fourneau)
  function monde() {
    if (!profil) return null;
    if (!profil.monde) profil.monde = { ile: "fourneau", case: null, visitees: {}, fours: {} };
    return profil.monde;
  }
  function sauverLieu(ile, c) {
    const m = monde(); if (!m) return;
    m.ile = ile; m.case = c ? [c[0], c[1]] : null;
    sauver();
  }

  // ---------- Grimoire ----------
  // Emplacements de la classe : [{ emplacement, base, declinaison }], triés.
  function grimoire(idClasse) {
    const G = ORVANE.GRIMOIRE && ORVANE.GRIMOIRE[idClasse];
    if (Array.isArray(G) && G.length) {
      return G.map((e, i) => ({ emplacement: (e.base && e.base.emplacement) || i + 1, base: e.base || null, declinaison: e.declinaison || null }))
        .filter(e => e.base).sort((a, b) => a.emplacement - b.emplacement);
    }
    const parEmp = {};
    (ORVANE.SORTS_ESSAI || []).filter(s => s.classe === idClasse && s.emplacement > 0).forEach(s => {
      const e = parEmp[s.emplacement] = parEmp[s.emplacement] || { emplacement: s.emplacement, base: null, declinaison: null };
      if (s.declinaisonDe) e.declinaison = s; else e.base = s;
    });
    return Object.values(parEmp).filter(e => e.base).sort((a, b) => a.emplacement - b.emplacement);
  }
  const sourceGrimoire = () => (ORVANE.GRIMOIRE ? "grimoire" : "essai");
  // Le sort équipé d'un emplacement (null si l'emplacement n'est pas encore débloqué)
  function sortEquipe(e, p) {
    p = p || profil;
    if (!e.base || (e.base.niveau || 1) > p.niveau) return null;
    const d = e.declinaison;
    if (p.choix[e.emplacement] === "declinaison" && d && (d.niveau || 1) <= p.niveau) return d;
    return e.base;
  }
  function choisir(emplacement, quoi) { profil.choix[emplacement] = quoi === "declinaison" ? "declinaison" : "base"; sauver(); }
  function sortsEquipes(p) {
    p = p || profil;
    const l = grimoire(p.classe).map(e => sortEquipe(e, p)).filter(Boolean);
    try { l.push(O().pour(p.classe)); } catch (e) { /* classe sans outil */ }
    return l;
  }
  // Tous les sorts connus (pour les fiches)
  function trouverSort(id) {
    const G = ORVANE.GRIMOIRE ? Object.values(ORVANE.GRIMOIRE).flat().flatMap(e => [e.base, e.declinaison]) : [];
    return G.concat(ORVANE.SORTS_ESSAI || [], O() ? O().tous() : []).find(s => s && s.id === id) || null;
  }

  // ---------- Caractéristiques (capital) ----------
  // profil.carac = { affinites: { F, E, T, S, C }, victuailles } : les points de capital que le joueur a placés, librement
  // (CONST.CAPITAL_PAR_NIVEAU par niveau). Rien n'est bridé. Le Savoir-faire ne se prend plus avec ces points :
  // le jeu passe toujours capital.savoirFaire = 0 au moteur. Coûts et effets : R.coutAffinite, R.deriverArtisan, R.CONST.
  function caracVide() { return { affinites: { F: 0, E: 0, T: 0, S: 0, C: 0 }, victuailles: 0 }; }
  // Remet une répartition en état. Ce qui était en Savoir-faire (ancienne version du panneau) est rendu : rendus = points rendus.
  // Une répartition qui dépasse le capital du niveau (sauvegarde abîmée) repart de zéro.
  function reparerCarac(c, niveau) {
    const ent = x => { x = Math.round(+x); return Number.isFinite(x) && x > 0 ? Math.min(x, 1e6) : 0; };
    const n = caracVide();
    ELEMENTS.forEach(e => { n.affinites[e] = ent(c && c.affinites && c.affinites[e]); });
    n.victuailles = ent(c && c.victuailles);
    const rendus = ent(c && c.savoirFaire);
    try { if (R().deriverArtisan(defCarac(n, niveau)).capital.reste < 0) return { carac: caracVide(), rendus: 0, abimee: true }; } catch (e) { return { carac: caracVide(), rendus: 0, abimee: true }; }
    return { carac: n, rendus };
  }
  // Ce qu'on donne au moteur pour une répartition (savoirFaire toujours 0)
  function defCarac(c, niveau) {
    c = c || caracVide();
    const a = {}; ELEMENTS.forEach(e => { a[e] = (c.affinites && c.affinites[e]) || 0; });
    return { niveau, affinites: a, capital: { victuailles: c.victuailles || 0, savoirFaire: 0 } };
  }
  function capitalDuNiveau(niveau) { return R().CONST.CAPITAL_PAR_NIVEAU * (niveau - 1); }

  // Un sort qui fait des dégâts : une brique « degats » quelque part (pose, si, Commis compris) et un élément autre que N
  function faitDesDegats(s) { return !!s && s.element !== "N" && JSON.stringify(s.effets || []).indexOf('"degats"') >= 0; }
  // Les éléments que « Répartir pour moi » choisit (même règle que moteur/simule.js) : parmi les sorts équipés qui font des dégâts,
  // l'élément le plus présent (à égalité : celui du sort au plus petit emplacement), plus le 2e s'il a au moins la moitié de ses sorts.
  function elementsConseilles(p) {
    p = p || profil;
    const compte = {}, premier = {};
    sortsEquipes(p).filter(faitDesDegats).forEach(s => {
      compte[s.element] = (compte[s.element] || 0) + 1;
      const emp = s.emplacement || 99;
      if (!(s.element in premier) || emp < premier[s.element]) premier[s.element] = emp;
    });
    const tri = Object.keys(compte).sort((a, b) => compte[b] - compte[a] || premier[a] - premier[b]);
    const els = tri.slice(0, 1);
    if (tri[1] && compte[tri[1]] * 2 >= compte[tri[0]]) els.push(tri[1]);
    return els;
  }
  // « Répartir pour moi » : tout le capital, point par point, à tour de rôle entre les éléments choisis, au coût réel des paliers,
  // tant que ça tient dans le capital ; rien en Victuailles. Repart de zéro (remplace la répartition).
  function repartirPourMoi(p) {
    p = p || profil;
    const RR = R(), els = elementsConseilles(p), capital = capitalDuNiveau(p.niveau), c = caracVide(), a = c.affinites;
    const cout = () => els.reduce((t, e) => t + RR.coutAffinite(a[e]), 0);
    for (let monte = true, garde = 0; monte && els.length && garde < 100000; garde++) {
      monte = false;
      for (const e of els) { a[e]++; if (cout() <= capital) monte = true; else a[e]--; }
    }
    return c;
  }
  // La répartition en vigueur (celle que le combat utilise)
  function caracActuelle(p) { p = p || profil; return (p && p.carac) || caracVide(); }
  // Ce que le moteur en tire (affinités, Victuailles, Rideau…, capital.reste)
  function deriver(c, niveau) { return R().deriverArtisan(defCarac(c, niveau)); }
  // Points pas encore placés
  function pointsRestants(p) {
    p = p || profil;
    if (!p) return 0;
    try { return Math.max(0, deriver(caracActuelle(p), p.niveau).capital.reste); } catch (e) { return 0; }
  }
  // Les points qu'on rappelle au joueur (pastille, Addition, tutoriel) : ceux qui restent, sauf un petit reste qui ne paie plus
  // un point dans aucun des éléments qu'il a choisis (au-delà d'un palier, un point en coûte 2 ou 3). Ce reste se place
  // toujours où l'on veut (Victuailles, autre élément) : on ne le réclame simplement pas à chaque combat.
  function pointsEnAttente(p) {
    p = p || profil;
    const n = pointsRestants(p);
    if (n <= 0) return 0;
    const a = caracActuelle(p).affinites || {}, choisis = ELEMENTS.filter(e => a[e] > 0);
    if (!choisis.length) return n;
    try {
      const moinsCher = Math.min(...choisis.map(e => R().coutAffinite(a[e] + 1) - R().coutAffinite(a[e])));
      return n >= moinsCher ? n : 0;
    } catch (e) { return n; }
  }
  // Le coût du prochain point dans un élément (paliers du moteur)
  function coutPointElement(p, e) { const v = (caracActuelle(p).affinites || {})[e] || 0; return R().coutAffinite(v + 1) - R().coutAffinite(v); }
  // Les éléments où le joueur a mis des points (le repère discret de la barre et du Grimoire)
  function elementsChoisis(p) { const a = caracActuelle(p).affinites || {}; return ELEMENTS.filter(e => a[e] > 0); }
  // Valider une répartition : elle devient celle du joueur
  function validerCarac(c) {
    const r = reparerCarac(c, profil.niveau);
    profil.carac = r.carac; sauver();
    return r.carac;
  }
  // Ce que le jeu doit dire une fois (ancienne sauvegarde passée à « Répartir pour moi », points rendus) ; lu puis oublié
  function annonceCarac() {
    const a = profil && profil.caracAnnonce;
    if (!a) return null;
    delete profil.caracAnnonce; sauver();
    if (a === "ancienne") return "Tes points de caractéristique ont été placés pour toi, selon les éléments de tes sorts (« Répartir pour moi »). Tu peux maintenant les placer où tu veux.";
    if (a === "abimee") return "Ta répartition enregistrée était abîmée (plus de points que ton niveau n'en donne). Tes points ont été placés pour toi, selon les éléments de tes sorts (« Répartir pour moi »). Tu peux les changer ici.";
    const n = +String(a).split(":")[1] || 0;
    return n ? `Le Savoir-faire ne se prend plus avec tes points : ${n} point${n > 1 ? "s" : ""} te ${n > 1 ? "sont rendus" : "est rendu"}, à placer où tu veux.` : null;
  }

  // La définition d'artisan qu'on passe à creerCombat
  function artisan(p) {
    p = p || profil;
    const sorts = sortsEquipes(p), d = defCarac(caracActuelle(p), p.niveau);
    return {
      id: "moi", nom: p.nom, classe: p.classe, niveau: p.niveau, affinites: d.affinites, capital: d.capital,
      sorts, controle: "joueur", painDeRoute: painsPourCombat(p)
    };
  }
  // Les Pains de route d'un combat : ceux du combat, plus la réserve du Sac
  function reservePains(p) { p = p || profil; return Math.max(0, ((p.sac || {})["sac.pain-de-route"] || 0) - PAINS_PAR_COMBAT()); }
  function painsPourCombat(p) { return PAINS_PAR_COMBAT() + reservePains(p); }
  // Après un combat : les Pains mangés au-delà de ceux du combat sortent du Sac
  function mangerPains(n) {
    const deReserve = Math.max(0, Math.min(reservePains(), (n || 0) - PAINS_PAR_COMBAT()));
    if (deReserve > 0) { profil.sac["sac.pain-de-route"] -= deReserve; sauver(); }
    return deReserve;
  }
  // Une explication donnée une seule fois par artisan (vrai la première fois)
  function premiereFois(cle) {
    if (!profil) return false;
    profil.vu = profil.vu || {};
    if (profil.vu[cle]) return false;
    profil.vu[cle] = true; sauver();
    return true;
  }
  const dejaVu = cle => !!(profil && profil.vu && profil.vu[cle]);

  // Après l'Addition : XP, Blé, objets ; renvoie les niveaux gagnés et ce qu'ils débloquent
  function encaisser(addition, id) {
    const avant = profil.niveau;
    profil.combats++;
    if (addition.victoire) profil.victoires++;
    profil.xp += (addition.xp && addition.xp[id]) || 0;
    profil.ble += (addition.ble && addition.ble[id]) || 0;
    ((addition.objets && addition.objets[id]) || []).forEach(o => { profil.sac[o.id] = (profil.sac[o.id] || 0) + 1; profil.noms = profil.noms || {}; profil.noms[o.id] = o.nom; });
    profil.niveau = Math.max(profil.niveau, niveauPourXp(profil.xp));
    const debloques = [];
    if (profil.niveau > avant) grimoire(profil.classe).forEach(e => [e.base, e.declinaison].forEach(s => {
      if (s && s.niveau > avant && s.niveau <= profil.niveau) debloques.push(s);
    }));
    sauver();
    // chaque niveau gagné donne des points de caractéristique (CONST.CAPITAL_PAR_NIVEAU)
    const points = (profil.niveau - avant) * R().CONST.CAPITAL_PAR_NIVEAU;
    return { avant, apres: profil.niveau, debloques, points };
  }

  P.Profil = {
    PEAUX, POILS, NIVEAU_MAX, reglages, xpDuNiveau, niveauPourXp, classe, nouveau, sauver,
    grimoire, sourceGrimoire, sortEquipe, choisir, sortsEquipes, trouverSort, artisan, encaisser,
    ELEMENTS, caracVide, defCarac, deriver, capitalDuNiveau, faitDesDegats, elementsConseilles, repartirPourMoi, caracActuelle,
    pointsRestants, pointsEnAttente, coutPointElement, elementsChoisis, validerCarac, annonceCarac,
    reservePains, painsPourCombat, mangerPains, premiereFois, dejaVu, reparerReglages, monde, sauverLieu, reparerMonde,
    get profil() { return profil; },
    oublier() { profil = null; sauver(); }
  };
})();
