/*
 * Orvane, prototype : la base commune des scènes Phaser et la scène d'exploration (« balade ») sur une île de l'Astrelier
 * (proto/iles.js : la Halle des Ébauches, la Voie lactée, le Fourneau, la Penderie des Tabliers, le Moule ; et Grand-Étal).
 * Exploration : marche en 8 directions, case par case ; des groupes de monstres qui se promènent lentement (Fourneau, Voie lactée) ;
 * toucher un groupe ouvre sa fiche, le combat ne commence que par le bouton « Engager ».
 * Les objets de voyage (proto/voyage.js) : un premier toucher montre où ils mènent, un second y va.
 */
window.ORVANE = window.ORVANE || {};
(() => {
  const P = ORVANE.Proto = ORVANE.Proto || {};
  const attendre = ms => new Promise(r => setTimeout(r, ms));
  P.attendre = attendre;

  // ---------- Base : deux caméras (ciel fixe, monde zoomable), un calque du monde, la vue ----------
  class SceneBase extends Phaser.Scene {
    preparer(combat) {
      this.combat = combat;
      this.camCiel = this.cameras.main;
      this.monde = this.add.layer();
      this.cam = this.cameras.add(0, 0, this.scale.width, this.scale.height);
      P.ciel(this, combat);
      this.cam.ignore(this.ciel);
      this.camCiel.ignore(this.monde);
      this.vue = new P.Vue(this, this.cam);
      this.vue.zMin = .32; this.vue.zMax = 3.2;
      const surTaille = () => this.redimensionner();
      this.scale.on("resize", surTaille);
      this.events.once("shutdown", () => { this.scale.off("resize", surTaille); this.ciel = null; this.arreter && this.arreter(); });
      this.input && this.input.enabled === false;
      P.reveil();
    }
    redimensionner() {
      const w = this.scale.width, h = this.scale.height;
      this.camCiel.setSize(w, h); this.cam.setSize(w, h);
      P.ciel(this, this.combat);
      this.cadrer();
      P.reveil();
    }
    // Zoom par défaut : l'île dans la partie libre de l'écran, cases d'au moins 44 px de large
    cadrer() {
      if (!this.plateau) return;
      const r = P.UI.rectUtile();
      this.vue.cadrer(this.plateau.boite(), r, { zMin: 44 / P.ISO.L, zMax: 1.7 });
      this.zDefaut = this.vue.Z;
    }
    // Ce qui est sous le doigt : la case du losange touché (caseSol), les pions dont le dessin est touché (du plus en avant au plus
    // en arrière) ; case = la case du pion de devant s'il y en a un, sinon caseSol. Chaque scène choisit ce qui l'emporte.
    sousLeDoigt(sx, sy) {
      const w = this.vue.versMonde(sx, sy), sol = P.grille(w.x, w.y);
      const pions = (this.pionsTouchables ? this.pionsTouchables() : []).filter(p => p.contient(w.x, w.y)).sort((a, b) => b.c.depth - a.c.depth);
      const pion = pions[0] || null;
      return { case: pion && pion.case ? pion.case : sol, caseSol: sol, pion, pions, monde: w };
    }
    // À chaque image : le calque du dessus de chaque pion (barre, états) suit son corps
    update() { if (this.tousLesPions) this.tousLesPions().forEach(p => p.suivre()); }
    // Zoom : les étiquettes gardent leur taille à l'écran ; l'aperçu est redessiné quand le zoom s'arrête
    surZoom() {
      if (!this.plateau) return;
      this.plateau.majEchelle();
      clearTimeout(this.minuterieZoom);
      this.minuterieZoom = setTimeout(() => { if (!this.fini && this.sys && this.sys.isActive() && this.redessiner) this.redessiner(); }, 180);
    }
    centrerSurCase(c, anime) {
      if (!c) return;
      const p = P.iso(c[0], c[1]), r = P.UI.rectUtile();
      this.vue.animerVers(p.x, p.y - 24, r.x + r.w / 2, r.y + r.h / 2, anime ? P.duree(380) : 0);
    }
    // Une animation qu'on peut attendre ; elle se termine quoi qu'il arrive (cible détruite, scène arrêtée)
    tween(o) {
      P.reveil();
      return new Promise(res => {
        let fait = false;
        const finir = () => { if (!fait) { fait = true; clearTimeout(garde); res(); } };
        const total = ((o.duration || 0) * (o.yoyo ? 2 : 1) * ((o.repeat || 0) + 1)) + (o.delay || 0);
        const garde = setTimeout(finir, total + 700);
        const oc = o.onComplete;
        o.onComplete = (...a) => { oc && oc(...a); finir(); };
        o.onStop = finir;
        this.tweens.add(o);
      });
    }
    // Déplace un pion case par case le long d'un chemin (la première case est celle de départ)
    async marcher(pion, chemin, ms) {
      for (let i = 1; i < chemin.length; i++) {
        const a = chemin[i - 1], b = chemin[i], p = P.iso(b[0], b[1]);
        const dx = (b[0] - b[1]) - (a[0] - a[1]);
        if (dx) pion.orienter(dx < 0 ? -1 : 1);
        pion.profondeur([Math.max(a[0], b[0]), Math.max(a[1], b[1])]);
        await this.tween({ targets: pion.c, x: p.x, y: p.y, duration: P.duree(ms || 170), ease: "Linear" });
        pion.case = [b[0], b[1]];
        pion.profondeur(b);
        if (this.tousLesPions) this.plateau.transparence(this.tousLesPions(), this.objetsAuSol ? this.objetsAuSol() : []);
      }
    }
  }
  P.SceneBase = SceneBase;

  // ---------- Exploration ----------
  const DIRS8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

  class SceneBalade extends SceneBase {
    constructor() { super("balade"); }
    init(d) { this.retour = d || {}; }
    create() {
      const J = P.Jeu, I = P.Iles, V = P.Voyage;
      // Phaser réutilise l'objet scène : on repart de zéro à chaque retour en exploration
      clearTimeout(this.minuterieErrance); clearInterval(this.minuterieRetour); clearTimeout(this.marcheDifferee);
      Object.assign(this, { fini: false, enFiche: false, dernier: null, curseur: null, marche: null, cible: null, marcheDifferee: null, pnj: null,
        ensuite: null, apercuVoyage: null, enPassage: false, objetsVoyage: [], fleches: null });
      // l'île : celle du passage, sinon celle où l'on est (une ancienne sauvegarde, un nouvel artisan : le Fourneau)
      const monde = J.monde = J.monde || V.nouveauMonde();
      const ileId = I.existe(this.retour.ile) ? this.retour.ile : I.existe(monde.ile) ? monde.ile : "fourneau";
      monde.ile = ileId;
      this.ileId = ileId; this.ile = I.ile(ileId); this.zone = I.zone(ileId);
      this.tutoIci = !!this.ile.tutoriel;
      this.cielVariante = this.ile.ville ? "ville" : null;
      this.preparer(false);
      this.plateau = new P.Plateau(this, I.carte(ileId), { combat: false, sol: I.sol(ileId).balade, lointaines: !this.ile.ville, ville: !!this.ile.ville, ile: ileId,
        sansGardeCorps: this.ile.objets.filter(o => o.genre === "marche").map(o => o.case), decorPour: V.decorPour(ileId) });
      this.vue.bornes = this.plateau.boite();
      const st = monde.parIle[ileId] = monde.parIle[ileId] || {};
      this.lieux = st.lieux = st.lieux || this.choisirLieux();
      // la case où l'on arrive (avant les groupes : un groupe qui revient ne se pose jamais sur l'artisan)
      const sol = c => Array.isArray(c) && this.plateau.sol(c[0], c[1]);
      if (this.retour.arrivee) monde.position = this.retour.arrivee.case.slice();
      else if (this.retour.defaite || !sol(monde.position)) monde.position = this.lieux.depart.slice();
      if (!st.groupes) st.groupes = this.nouveauxGroupes(monde.position);
      // un groupe dont la fiche n'existe pas ici (une sauvegarde d'une autre version, un groupe d'une autre île) : un autre à sa place
      st.groupes.forEach(g => { if (!g.tuto && !this.defGroupe(g.groupe)) Object.assign(g, this.groupeAuHasard(g.maison || g.case || this.lieux.depart)); });
      // l'île et la case où l'on est, les îles visitées (sauvées dans le profil)
      const lieu = P.Profil.monde();
      if (lieu) { lieu.visitees = lieu.visitees || {}; lieu.visitees[ileId] = true; }
      P.Profil.sauverLieu(ileId, monde.position);
      if (this.retour.vaincu != null) { const g = monde.groupes[this.retour.vaincu]; if (g) { g.actif = false; g.revient = Date.now() + 20000; } }
      // les groupes vaincus reviennent (un autre groupe, à leur maison) ; si on reste en exploration, la minuterie s'en charge
      monde.groupes.forEach(g => { if (!g.tuto && !g.actif && Date.now() >= g.revient && !P.memeCase(g.maison, monde.position)) Object.assign(g, this.groupeAuHasard(g.maison), { actif: true }); });
      // un groupe posé sur la case de l'artisan (rechargé debout sur sa maison) : il se pousse sur une case libre à côté
      monde.groupes.forEach(g => { if (g.actif && !g.tuto && P.memeCase(g.case, monde.position)) g.case = this.caseLibrePres(g.maison, monde.position) || g.case; });
      this.moi = new P.Pion(this.plateau, { cle: "perso-moi", equipe: "moi", taille: 20 }).placer(monde.position);
      this.pionsGroupes = [];
      monde.groupes.forEach((g, i) => { if (g.actif) this.pionsGroupes[i] = this.pionGroupe(g); });
      // au clavier : le curseur sur sa propre case (après un passage, Entrée marche tout de suite)
      if (J.clavierActif) this.curseur = monde.position.slice();
      // le tutoriel : Mère Fournil, et le Grumeau d'entraînement pendant la quête (proto/tutoriel.js), au Fourneau seulement
      if (P.Tuto && this.tutoIci) P.Tuto.preparerBalade(this);
      // les objets de voyage (proto/voyage.js)
      V.poser(this);
      this.minuterieRetour = setInterval(() => this.verifierRetours(), 1000);
      P.UI.mode("balade");
      P.UI.bandeau(P.Profil.profil);
      // le nom de l'île dans le bandeau ; trop long pour l'écran : son nom court (« La Penderie »)
      const nom = document.getElementById("lieu"), court = this.ile.court.charAt(0).toUpperCase() + this.ile.court.slice(1);
      if (nom) { nom.textContent = this.ile.nom; nom.title = this.ile.nom; if (nom.scrollWidth > nom.clientWidth + 1) nom.textContent = court; }
      V.consigne(this, null);
      this.cadrer();
      this.marche = null; this.cible = null;
      this.plateau.transparence(this.tousLesPions());
      this.errer();
      P.Jeu.sceneActive = this;
      if (this.curseur) this.dessinerCurseur();
      if (this.retour.arrivee) V.arriver(this); else V.apresPas(this);
      this.plateau.animerDecor(3); V.animer(this, 2);
      P.reveil();
    }
    // La boîte à cadrer : l'île, et les objets posés à son bord (monte-plats, toboggan, Grande Pelle)
    boiteCadre() {
      const b = this.plateau.boite();
      let x0 = b.x, x1 = b.x + b.w, y0 = b.y, y1 = b.y + b.h;
      (this.ile ? this.ile.objets : []).filter(o => o.dans === "vide").forEach(o => {
        const p = P.iso(o.case[0], o.case[1]), e = P.Voyage.etendue(o);
        x0 = Math.min(x0, p.x + e[0]); x1 = Math.max(x1, p.x + e[2]); y0 = Math.min(y0, p.y + e[1]); y1 = Math.max(y1, p.y + e[3]);
      });
      return { x: x0, y: y0, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
    }
    // Cadrer l'île ; une grande île qui déborde de l'écran : on garde son artisan en vue
    cadrer() {
      if (!this.plateau) return;
      const b = this.boiteCadre();
      this.vue.bornes = b;
      this.vue.cadrer(b, P.UI.rectUtile(), { zMin: 44 / P.ISO.L, zMax: 1.7 });
      this.zDefaut = this.vue.Z;
      if (this.moi && this.moi.case) this.garderEnVue(false);
    }
    // L'artisan sort de l'écran (ou s'approche du bord en marchant) : la vue le suit
    garderEnVue(anime) {
      if (this.enPassage) return;
      const c = this.moi.c, e = this.vue.versEcran(c.x, c.y - 20), r = P.UI.rectUtile();
      const m = anime ? 36 : 0;
      if (e.x < r.x + m || e.x > r.x + r.w - m || e.y < r.y + m + 20 || e.y > r.y + r.h - m) this.centrerSurCase(this.moi.case, anime);
    }
    arreter() { clearTimeout(this.minuterieErrance); clearInterval(this.minuterieRetour); clearTimeout(this.marcheDifferee); clearTimeout(this.minuterieZoom); this.fini = true; this.ensuite = null; }
    tousLesPions() { return (this.pionsGroupes || []).filter(Boolean).concat(this.pnj ? [this.pnj] : [], this.moi ? [this.moi] : []); }
    // la définition d'un groupe : ceux du moteur, ou le groupe d'entraînement du tutoriel
    defGroupe(id) { return (P.Tuto && P.Tuto.groupe(id)) || (ORVANE.Monstres.GROUPES[this.zone || "fourneau"] || []).find(x => x.id === id); }
    redessiner() { if (this.apercuVoyage) P.Voyage.redessiner(this); else this.montrerCible(this.cible); }
    // Un groupe vaincu revient 20 s après sa défaite (un autre groupe, à sa maison), même si l'on reste en exploration
    verifierRetours() {
      // pendant un passage, la scène s'en va : monde.groupes est déjà celui de l'île d'arrivée, on n'y touche pas
      if (this.fini || this.enPassage || P.Jeu.passage) return;
      const monde = P.Jeu.monde; if (!monde || monde.ile !== this.ileId) return;
      monde.groupes.forEach((g, i) => {
        if (g.tuto || g.actif || Date.now() < g.revient) return;
        if (this.occupee(g.maison) || (this.cible && P.memeCase(this.cible, g.maison))) return;
        Object.assign(g, this.groupeAuHasard(g.maison), { actif: true });
        const p = this.pionsGroupes[i] = this.pionGroupe(g);
        if (!P.reduit()) { p.c.setAlpha(0); this.tween({ targets: p.c, alpha: 1, duration: 500 }); }
        const def = this.defGroupe(g.groupe);
        P.UI.toast(`Un groupe revient : ${def ? def.nom : "des monstres"}`);
        this.plateau.transparence(this.tousLesPions());
        P.reveil();
      });
    }
    // Arrivage (partie 3.2) : un groupe qu'on laisse en paix gagne +10 % d'XP par minute, jusqu'à +100 %
    arrivage(g) { return Math.max(0, Math.min(100, (g.arrivageDepart || 0) + 10 * Math.floor((Date.now() - (g.depuis || Date.now())) / 60000))); }
    // Le point de départ (au milieu des cases dorées du premier jeu de départ) et trois « maisons » de groupes,
    // aussi loin que possible du départ et les unes des autres. Tout se lit dans la carte du moteur.
    choisirLieux() {
      // une île dessinée (proto/iles.js) donne son départ et la maison de ses groupes ; le Fourneau les calcule (comme avant les îles)
      if (this.ile && this.ile.depart) return { depart: this.ile.depart.slice(), maisons: (this.ile.maisons || []).map(c => c.slice()) };
      const pl = this.plateau, sols = pl.cases().filter(c => pl.sol(c[0], c[1]));
      const d = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
      const dep = (pl.carte.departs[0] || {}).artisans || [sols[sols.length - 1]];
      const cx = dep.reduce((t, c) => t + c[0], 0) / dep.length, cy = dep.reduce((t, c) => t + c[1], 0) / dep.length;
      const depart = sols.slice().sort((a, b) => d(a, [cx, cy]) - d(b, [cx, cy]))[0];
      // une maison a de la place autour d'elle pour se promener
      const ouverte = c => DIRS8.filter(([dx, dy]) => pl.sol(c[0] + dx, c[1] + dy)).length >= 6;
      const maisons = [], pris = [depart];
      for (let k = 0; k < 3; k++) {
        let best = null, bs = -1;
        sols.filter(ouverte).forEach(c => { const m = Math.min(...pris.map(q => d(c, q) * (q === depart ? 1.25 : 1))); if (m > bs) { bs = m; best = c; } });
        if (!best || bs < 3) break;
        maisons.push(best); pris.push(best);
      }
      return { depart, maisons };
    }
    nouveauxGroupes(ici) {
      if (!this.zone) return [];
      const ids = (ORVANE.Monstres.GROUPES[this.zone] || []).map(g => g.id);
      const voulus = this.ile.groupesDepart || ["mie-et-pate", "chef-seul", "grumeaux"], arr = this.ile.arrivage || [30, 0, 50];
      const l = voulus.filter(i => ids.indexOf(i) >= 0);
      return this.lieux.maisons.slice(0, l.length).map((m, i) => ({ groupe: l[i], case: (P.memeCase(m, ici) && this.caseLibrePres(m, ici)) || m.slice(), maison: m.slice(), actif: true, revient: 0, depuis: Date.now(), arrivageDepart: arr[i % arr.length] }));
    }
    // une case de sol libre près d'une maison (ni la case de l'artisan, ni une case de passage)
    caseLibrePres(m, ici) {
      const l = DIRS8.map(([dx, dy]) => [m[0] + dx, m[1] + dy]).filter(c => this.plateau.sol(c[0], c[1]) && !P.memeCase(c, ici) && !P.Voyage.reservee(this, c));
      return l.length ? l[0] : null;
    }
    groupeAuHasard(maison) {
      const l = ORVANE.Monstres.GROUPES[this.zone || "fourneau"];
      return { groupe: l[Math.floor(Math.random() * l.length)].id, case: maison.slice(), depuis: Date.now(), arrivageDepart: 0 };
    }
    pionGroupe(g) {
      const def = this.defGroupe(g.groupe) || (ORVANE.Monstres.GROUPES[this.zone || "fourneau"] || [])[0];
      const membres = def ? def.membres : ["grumeau"];
      // le premier membre marche en tête (devant), le second un peu derrière
      const pos = membres.length > 1 ? [[7, 5], [-11, -6]] : [[0, 0]];
      const p = new P.Pion(this.plateau, { equipe: "ennemi", taille: 22, membres: membres.map((m, i) => ({ cle: "monstre-" + m, dx: pos[i][0], dy: pos[i][1] })) });
      p.groupe = g;
      return p.placer(g.case);
    }
    pionsTouchables() { return this.pionsGroupes.filter(Boolean).concat(this.pnj ? [this.pnj] : []); }
    // Le groupe sur cette case (ou en train d'y aller, ou qui l'a quittée il y a moins de 1,5 s) : son indice, sinon −1
    groupeSur(c) {
      const t = Date.now();
      return this.pionsGroupes.findIndex(p => p && (P.memeCase(p.case, c) || P.memeCase(p.versCase, c) || (p.quitte && t - p.quitte.t < 1500 && P.memeCase(p.quitte.case, c))));
    }
    occupee(c, sauf) {
      if (P.memeCase(c, this.moi.case) && sauf !== this.moi) return true;
      if (this.pnj && P.memeCase(c, this.pnj.case)) return true;
      return this.pionsGroupes.some(p => p && p !== sauf && (P.memeCase(p.case, c) || P.memeCase(p.versCase, c)));
    }
    // Chemin en 8 directions (sans couper les coins du décor)
    chemin(de, vers) {
      const pl = this.plateau, cle = P.cle, ok = (x, y) => pl.sol(x, y) && !this.occupee([x, y], this.moi);
      if (!ok(vers[0], vers[1])) return null;
      const prec = new Map([[cle(de), null]]), file = [de];
      while (file.length) {
        const c = file.shift();
        if (P.memeCase(c, vers)) break;
        for (const [dx, dy] of DIRS8) {
          const n = [c[0] + dx, c[1] + dy];
          if (prec.has(cle(n)) || !ok(n[0], n[1])) continue;
          if (dx && dy && (!pl.sol(c[0] + dx, c[1]) || !pl.sol(c[0], c[1] + dy))) continue;
          prec.set(cle(n), c); file.push(n);
        }
      }
      if (!prec.has(cle(vers))) return null;
      const l = []; let c = vers; while (c) { l.unshift(c); c = prec.get(cle(c)); }
      return l;
    }
    // ---------- Toucher ----------
    toucher(sx, sy) {
      if (P.UI.ouvert() || this.enPassage || this.fini) return;
      this.plateau.animerDecor(2); P.Voyage.animer(this, 1);
      const now = Date.now(), d = this.dernier;
      this.dernier = { t: now, x: sx, y: sy };
      // un double toucher sur un passage, c'est « j'y vais » (pas « recentrer ») : l'objet passe avant le double toucher
      const t0 = this.sousLeDoigt(sx, sy), ov0 = !t0.pion ? P.Voyage.objetSous(this, t0) : null;
      if (ov0) { this.dernier = null; clearTimeout(this.marcheDifferee); this.marcheDifferee = null; P.Voyage.toucher(this, ov0); return; }
      // double toucher : on recentre sur son artisan, sans marcher (la marche du premier toucher attendait encore)
      if (d && now - d.t < 330 && Math.hypot(d.x - sx, d.y - sy) < 30) {
        this.dernier = null;
        if (this.marcheDifferee) { clearTimeout(this.marcheDifferee); this.marcheDifferee = null; if (!this.marche) this.montrerCible(null); }
        this.centrerSurCase(this.moi.case, true);
        return;
      }
      const t = this.sousLeDoigt(sx, sy);
      if (t.pion && t.pion.pnj) { P.Voyage.annuler(this); if (P.Tuto) P.Tuto.parler(); return; }
      if (t.pion && t.pion.groupe) { P.Voyage.annuler(this); this.ouvrirGroupe(this.pionsGroupes.indexOf(t.pion)); return; }
      // un objet de voyage (ou un étal, une porte…) : un premier toucher montre où il mène, un second y va
      const ov = P.Voyage.objetSous(this, t);
      if (ov) { clearTimeout(this.marcheDifferee); this.marcheDifferee = null; P.Voyage.toucher(this, ov); return; }
      P.Voyage.annuler(this);
      // un groupe qui se promène : toucher sa case, celle où il va, ou celle qu'il vient de quitter, ouvre aussi sa fiche
      const ig = this.groupeSur(t.caseSol);
      if (ig >= 0) { this.ouvrirGroupe(ig); return; }
      const c = t.case;
      if (!this.plateau.sol(c[0], c[1]) || this.occupee(c, this.moi) || !this.chemin(this.moi.case, c)) { this.refuser(c); return; }
      // la case est marquée tout de suite ; la marche part si aucun second toucher ne suit
      this.montrerCible(c);
      clearTimeout(this.marcheDifferee);
      this.marcheDifferee = setTimeout(() => { this.marcheDifferee = null; if (!this.fini) this.allerVers(c); }, 300);
    }
    // Toucher un décor, le vide ou une case prise : on le dit
    refuser(c) {
      const pl = this.plateau;
      const t = !pl.existe(c[0], c[1]) ? "Hors de l'île : on ne marche pas dans le vide"
        : !pl.sol(c[0], c[1]) ? "Un décor bloque cette case"
        : P.memeCase(c, this.moi.case) ? "Tu es déjà ici" : "On ne peut pas aller là";
      P.UI.toast(t, { genre: "refus" });
      if (pl.existe(c[0], c[1]) && !P.memeCase(c, this.moi.case)) {
        const g = this.add.graphics().setDepth(2.5); pl.ajoute(g);
        pl.losange(c, { fill: 0xC8553D, alpha: .45, barre: 0xFFFDF7 }, g);
        this.tween({ targets: g, alpha: 0, delay: P.duree(350), duration: P.duree(450), onComplete: () => g.destroy() });
      }
      P.reveil();
      return false;
    }
    doubleToucher() { this.centrerSurCase(this.moi.case, true); }
    toucherCaseClavier(c) {
      if (this.enPassage || this.fini) return false;
      this.curseur = c;
      const ov = P.Voyage.objetSurCase(this, c);
      if (ov) return P.Voyage.toucher(this, ov);
      P.Voyage.annuler(this);
      const i = this.pionsGroupes.findIndex(p => p && P.memeCase(p.case, c));
      if (i >= 0) return this.ouvrirGroupe(i);
      if (this.pnj && P.memeCase(this.pnj.case, c) && P.Tuto) { P.Tuto.parler(); return true; }
      return this.allerVers(c);
    }
    dessinerCurseur() {
      const g = this.plateau.calqueHaut; g.clear();
      if (!this.curseur || !P.Jeu.clavierActif) return;
      this.plateau.losange(this.curseur, { stroke: 0xFFFDF7, largeur: 2.5, retrait: 1 }, g);
      this.plateau.losange(this.curseur, { stroke: 0x0D2D2A, largeur: 1, retrait: 4 }, g);
    }
    ficheSousCurseur() { const c = this.curseur; if (!c) return; const i = this.pionsGroupes.findIndex(p => p && P.memeCase(p.case, c)); if (i >= 0) this.ouvrirGroupe(i); }
    // le curseur clavier peut aller sur un objet posé au bord, dans le vide (monte-plats, toboggan, Grande Pelle)
    caseObjet(c) { return !!P.Voyage.objetSurCase(this, c); }
    // Échap : l'aperçu s'efface, et la marche vers un passage s'arrête (on ne part pas)
    annulerApercu() {
      P.Voyage.annuler(this);
      if (this.ensuite) { this.ensuite = null; this.cible = null; this.montrerCible(null); }
    }
    // Appui long : la fiche d'un groupe, Mère Fournil, ou l'étiquette d'un passage (« ce que c'est »), sans y aller
    appuiLong(sx, sy) {
      if (this.enPassage || P.UI.ouvert()) return;
      const t = this.sousLeDoigt(sx, sy);
      if (t.pion && t.pion.pnj && P.Tuto) P.Tuto.parler();
      else if (t.pion && t.pion.groupe) this.ouvrirGroupe(this.pionsGroupes.indexOf(t.pion));
      else { const ov = P.Voyage.objetSous(this, t); if (ov) P.Voyage.montrer(this, ov); }
    }
    allerVers(c, ensuite) {
      if (this.enPassage) return false;
      if (!this.plateau.sol(c[0], c[1]) || this.occupee(c, this.moi)) return this.refuser(c);
      this.ensuite = ensuite ? { case: c.slice(), fn: ensuite } : null;
      this.cible = c;
      this.montrerCible(c);
      if (!this.marche) this.marche = this.boucleMarche().finally(() => { this.marche = null; });
      return true;
    }
    montrerCible(c) {
      this.plateau.effacer();
      if (c) this.plateau.losange(c, { fill: 0xE4C98E, alpha: .35, stroke: 0xC5A572, largeur: 2 });
      P.reveil();
    }
    // Aller sur une case, puis faire quelque chose (se servir d'un objet de voyage) ; déjà dessus : tout de suite
    allerPuis(c, fn) {
      if (P.memeCase(this.moi.case, c) && !this.marche) { this.cible = null; this.ensuite = null; fn(); return true; }
      if (!this.chemin(this.moi.case, c)) {
        P.UI.toast(this.occupee(c, this.moi) ? "Un groupe bloque le passage" : "On ne peut pas aller là", { genre: "refus" });
        return false;
      }
      return this.allerVers(c, fn);
    }
    async boucleMarche() {
      while (this.cible && !this.fini) {
        const ch = this.chemin(this.moi.case, this.cible);
        if (!ch || ch.length < 2) { this.cible = null; break; }
        const vise = this.cible;
        await this.marcher(this.moi, ch.slice(0, 2), 190);
        if (this.fini) break;
        P.Jeu.monde.position = this.moi.case.slice();
        if (P.Tuto) P.Tuto.signal("marche-balade");
        P.Voyage.apresPas(this);
        // le dernier pas avant un passage : pas de recentrage (la vue glisserait pendant le départ)
        if (!(this.ensuite && P.memeCase(this.moi.case, this.ensuite.case))) this.garderEnVue(true);
        if (P.memeCase(this.moi.case, vise) && vise === this.cible) this.cible = null;
      }
      if (this.fini) return;
      P.Profil.sauverLieu(this.ileId, this.moi.case);
      if (!this.apercuVoyage) this.montrerCible(null);
      // arrivé à l'objet de voyage : on s'en sert
      const e = this.ensuite;
      if (e && !this.cible && P.memeCase(this.moi.case, e.case)) { this.ensuite = null; e.fn(); }
      else if (e && !this.cible) this.ensuite = null;
    }
    ouvrirGroupe(i) {
      const p = this.pionsGroupes[i]; if (!p) return false;
      const def = this.defGroupe(p.groupe.groupe), tuto = !!p.groupe.tuto;
      this.enFiche = true;
      const prev = (tuto && P.Tuto && P.Tuto.prevision(def.id)) || ORVANE.Monstres.prevision(this.zone || "fourneau", def.id);
      P.UI.ficheGroupe(def, prev, { lieu: this.ile.sur, arrivage: this.arrivage(p.groupe), sansArrivage: tuto, note: tuto ? def.texte : "", onEngager: () => this.engager(i), onFermer: () => { this.enFiche = false; } });
      if (P.Tuto) P.Tuto.signal("fiche-groupe", { tuto });
      return true;
    }
    engager(i) {
      const g = P.Jeu.monde.groupes[i];
      if (!g || !g.actif || this.enPassage) return false;
      P.Voyage.annuler(this);
      this.cible = null; this.fini = true;
      if (P.Tuto) P.Tuto.signal("engager", { tuto: !!g.tuto });
      P.Jeu.lancerCombat(i, g.groupe, g.tuto ? 0 : this.arrivage(g));
      return true;
    }
    // ---------- Les groupes se promènent ----------
    errer() {
      const prochain = () => { if (!this.fini) this.minuterieErrance = setTimeout(() => this.pas().then(prochain), 1600 + Math.random() * 2400); };
      prochain();
    }
    async pas() {
      if (this.fini || this.enFiche || this.enPassage || P.UI.ouvert()) return;
      const libres = this.pionsGroupes.filter(p => p && !p.bouge && !p.groupe.immobile);
      if (!libres.length) return;
      const p = libres[Math.floor(Math.random() * libres.length)], g = p.groupe;
      const options = DIRS8.map(([dx, dy]) => [p.case[0] + dx, p.case[1] + dy]).filter(c =>
        this.plateau.sol(c[0], c[1]) && !this.occupee(c, p) && !P.Voyage.reservee(this, c) && Math.max(Math.abs(c[0] - g.maison[0]), Math.abs(c[1] - g.maison[1])) <= 2 &&
        Math.abs(c[0] - p.case[0]) + Math.abs(c[1] - p.case[1]) <= 2 &&
        (Math.abs(c[0] - p.case[0]) !== 1 || Math.abs(c[1] - p.case[1]) !== 1 || (this.plateau.sol(c[0], p.case[1]) && this.plateau.sol(p.case[0], c[1]))));
      if (!options.length) return;
      const c = options[Math.floor(Math.random() * options.length)];
      p.bouge = true; p.versCase = c; p.quitte = { case: p.case.slice(), t: Date.now() + 720 };
      await this.marcher(p, [p.case, c], 720);
      p.bouge = false; p.versCase = null;
      g.case = c.slice();
    }
  }
  P.SceneBalade = SceneBalade;
})();
