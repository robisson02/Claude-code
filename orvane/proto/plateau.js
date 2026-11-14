/*
 * Orvane, prototype : le plateau en losanges (Phaser 3).
 *   ORVANE.Proto.iso(x, y)        case → point du monde (centre du losange)
 *   ORVANE.Proto.grille(wx, wy)   point du monde → case
 *   ORVANE.Proto.Plateau          sol éclairé (texture), décor, îles lointaines, calque des cases, étiquettes, chiffres qui montent
 *   ORVANE.Proto.Pion             un personnage, un monstre ou un objet sur sa case (image, anneau, Victuailles, états)
 *   ORVANE.Proto.Vue              la caméra : cadrage, zoom, déplacement, bornes
 *   ORVANE.Proto.ciel(scene, combat)   le ciel étoilé de l'Astrelier (caméra du fond, sans zoom)
 * Le plateau ne connaît pas les règles : il dessine ce qu'on lui dit.
 */
window.ORVANE = window.ORVANE || {};
(() => {
  const P = ORVANE.Proto = ORVANE.Proto || {};
  const L = 64, H = 32, EP = 18;      // largeur et hauteur d'un losange, épaisseur de l'île (unités du monde)
  P.ISO = { L, H, EP };
  P.iso = (x, y) => ({ x: (x - y) * L / 2, y: (x + y) * H / 2 });
  P.grille = (wx, wy) => { const u = wx / (L / 2), v = wy / (H / 2); return [Math.round((u + v) / 2), Math.round((v - u) / 2)]; };
  P.cle = c => c[0] + "," + c[1];
  P.memeCase = (a, b) => !!a && !!b && a[0] === b[0] && a[1] === b[1];
  const hex = s => parseInt(String(s).replace("#", ""), 16);
  P.hex = hex;
  P.reduit = () => {
    const r = P.reglages && P.reglages.reduit;
    if (r === true || r === false) return r;
    try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; }
  };
  // « Accélérer » (réglage retenu) : pendant le tour d'un monstre ou d'un Commis joué par l'ordinateur, tout va deux fois plus vite
  P.vitesse = () => {
    const s = P.Jeu && P.Jeu.sceneActive;
    return P.reglages && P.reglages.accelere && s && s.phase === "autre" ? 2 : 1;
  };
  P.duree = ms => Math.round(ms * (P.reduit() ? .25 : 1) / P.vitesse());
  P.POLICE = '"Atkinson Hyperlegible", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  P.POLICE_TITRE = '"Bricolage Grotesque", "Segoe UI", system-ui, sans-serif';

  // ---------- La carte brute (format du moteur) ----------
  function lireCarte(carte) {
    const lignes = carte.lignes, hauteur = lignes.length, largeur = Math.max(...lignes.map(l => l.length));
    const legende = carte.legende || {};
    const terrain = (x, y) => {
      if (y < 0 || y >= hauteur || x < 0 || x >= largeur) return "vide";
      const ch = lignes[y][x];
      if (ch === undefined || ch === "~" || ch === " ") return "vide";
      if (ch === "." || ch === "a" || ch === "m") return "sol";
      return "plein";
    };
    const decor = (x, y) => { const ch = (lignes[y] || "")[x]; return terrain(x, y) === "plein" ? (legende[ch] || "caisse") : null; };
    return { largeur, hauteur, terrain, decor, nom: carte.nom, departs: carte.departs || [] };
  }
  P.lireCarte = lireCarte;

  // ---------- Le ciel ----------
  P.ciel = function (scene, combat) {
    const w = scene.scale.width, h = scene.scale.height, cle = "ciel";
    let tex = scene.textures.get(cle);
    if (!scene.textures.exists(cle)) tex = scene.textures.createCanvas(cle, w, h);
    else if (tex.width !== w || tex.height !== h) tex.setSize(w, h);
    const x = tex.context, s = Math.max(1, Math.min(w, h) / 420);
    // hors de l'Astrelier (Grand-Étal) : un ciel du monde, sans les constellations d'outils, une lueur de ville à l'horizon
    const ville = scene.cielVariante === "ville";
    const g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, ville ? "#1A4640" : combat ? "#0F302D" : "#123A36"); g.addColorStop(1, ville ? "#0B2523" : "#061A19");
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    if (ville) { const v = x.createRadialGradient(w / 2, h * 1.05, 10, w / 2, h * 1.05, h * .7); v.addColorStop(0, "rgba(228,201,142,.22)"); v.addColorStop(1, "rgba(228,201,142,0)"); x.fillStyle = v; x.fillRect(0, 0, w, h); }
    let graine = 11; const rnd = () => (graine = (graine * 16807) % 2147483647) / 2147483647;
    const n = Math.round(w * h / ((ville ? 9000 : 5200) * s * s));
    for (let i = 0; i < n; i++) {
      x.globalAlpha = rnd() * .6 + .25; x.fillStyle = rnd() > .72 ? "#C5A572" : "#F2EDE0";
      x.beginPath(); x.arc(rnd() * w, rnd() * h, (rnd() * 1.1 + .3) * s, 0, 7); x.fill();
    }
    x.globalAlpha = 1;
    // Constellations d'outils : le Couteau, le Rouleau, le Fouet
    const C = (pts, nom, lx, ly) => {
      const p = pts.map(([a, b]) => [a * w, b * h]);
      x.strokeStyle = "rgba(197,165,114,.32)"; x.lineWidth = .9 * s; x.beginPath(); p.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.stroke();
      x.fillStyle = "#E4C98E"; p.forEach(([a, b]) => { x.beginPath(); x.arc(a, b, 1.7 * s, 0, 7); x.fill(); });
      x.fillStyle = "rgba(197,165,114,.55)"; x.font = `${Math.round(8 * s)}px ${P.POLICE}`; x.fillText(nom, lx * w, ly * h);
    };
    if (!ville) {
      C([[.04, .14], [.1, .12], [.15, .1], [.2, .085], [.18, .075], [.22, .09]], "LE COUTEAU", .03, .17);
      C([[.06, .6], [.11, .62], [.16, .64], [.21, .66], [.26, .68]], "LE ROULEAU", .07, .715);
      C([[.88, .5], [.83, .53], [.82, .57], [.86, .6], [.92, .57], [.92, .53], [.88, .5], [.9, .46]], "LE FOUET", .79, .645);
    }
    tex.refresh();
    let im = scene.ciel;
    if (!im) { im = scene.ciel = scene.add.image(0, 0, cle).setOrigin(0, 0).setDepth(-1000); }
    im.setDisplaySize(w, h);
    return im;
  };

  // ---------- Le plateau ----------
  // Couleurs du sol par défaut (le Fourneau) ; une île peut donner les siennes (proto/iles.js) : clair, fonce, plein, flancG, flancD, motif
  const SOL_BALADE = { clair: "#EFE6D2", fonce: "#E6DAC1", plein: "#E6DAC1", flancG: "#A8916A", flancD: "#8A7550", motif: null, trait: "rgba(29,39,37,.07)" };
  const SOL_COMBAT = { clair: "#E2D6BC", fonce: "#D8CBAE", plein: "#B5A27E", flancG: "#8C7856", flancD: "#6F5D40", motif: null, trait: "rgba(29,39,37,.17)" };
  // Les décors qui éclairent le sol autour d'eux (un Four banal éteint, non)
  const LUMIERES = { four: 190, "four-banal": 190, lanterne: 130 };
  class Plateau {
    // o : { combat, sol (couleurs ; ep : épaisseur, liseréOr, gardeCorps, gouttes), lointaines (false : pas d'îles au loin),
    //       ile (l'île où l'on est : les autres sont dessinées au loin comme sur la carte), ville (Grand-Étal : des façades au fond),
    //       sansGardeCorps (les cases sans garde-corps : les sorties par le bord), decorPour(x, y, nom) → le décor de cette case }
    constructor(scene, carte, o = {}) {
      this.scene = scene; this.carte = lireCarte(carte); this.combat = !!o.combat;
      this.monde = scene.monde;        // Layer rendu par la caméra du monde
      this.etiquettes = [];
      this.pal = Object.assign({}, this.combat ? SOL_COMBAT : SOL_BALADE, o.sol || {});
      this.ep = this.pal.ep || EP;
      this.ile = o.ile || null; this.ville = !!o.ville; this.sansGardeCorps = o.sansGardeCorps || [];
      this.lointaines = o.lointaines !== false;
      this.decorPour = o.decorPour || null;
      this.decorParCase = {};
      this.creer();
    }
    ajoute(obj) { this.monde.add(obj); return obj; }
    sol(x, y) { return this.carte.terrain(x, y) === "sol"; }
    existe(x, y) { return this.carte.terrain(x, y) !== "vide"; }
    cases() { const l = []; for (let y = 0; y < this.carte.hauteur; y++) for (let x = 0; x < this.carte.largeur; x++) if (this.existe(x, y)) l.push([x, y]); return l; }
    boite() {
      if (this._boite) return this._boite;
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      this.cases().forEach(([x, y]) => { const p = P.iso(x, y); x0 = Math.min(x0, p.x - L / 2); x1 = Math.max(x1, p.x + L / 2); y0 = Math.min(y0, p.y - H / 2); y1 = Math.max(y1, p.y + H / 2 + this.ep); });
      return (this._boite = { x: x0, y: y0, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 });
    }
    creer() {
      const sc = this.scene;
      this.iles = this.lointaines || this.ville ? this.ajoute(this.dessinerIles()).setDepth(-50) : null;
      this.solImg = this.ajoute(this.dessinerSol()).setDepth(0);
      this.calqueSol = this.ajoute(sc.add.graphics()).setDepth(1);     // nappes
      this.calque = this.ajoute(sc.add.graphics()).setDepth(2);        // portée, Rayon, zone, chemin
      this.calqueHaut = this.ajoute(sc.add.graphics()).setDepth(3);    // contour du curseur clavier
      this.decors = [];
      P.Textures.halo(sc, "halo-chaud", "rgba(255,196,110,A)", 64);
      P.Textures.halo(sc, "halo-pale", "rgba(242,223,168,A)", 48);
      this.cases().forEach(([x, y]) => {
        const nom = this.nomDecor(x, y);
        if (!nom) return;
        const p = P.iso(x, y), cle = "decor-" + nom, inf = P.Textures.info(cle);
        if (!inf) return;
        const im = this.ajoute(sc.add.image(p.x, p.y + 3, cle).setOrigin(inf.ox, inf.oy).setScale(1 / inf.k).setDepth(100 + (x + y) * 10 + 5));
        im.case = [x, y]; im.nom = nom;
        this.decors.push(im);
        this.decorParCase[x + "," + y] = im;
        this.halo(im);
      });
      if (this.pal.gardeCorps && !this.combat) this.dessinerGardeCorps();
    }
    // Le décor dessiné sur une case (une île peut en changer un : un Four banal éteint, par exemple)
    nomDecor(x, y) { const n = this.carte.decor(x, y); return n && this.decorPour ? this.decorPour(x, y, n) : n; }
    // La lueur du four et des lanternes ; elle s'efface avec son décor quand il devient transparent (sinon elle cache ce qui est derrière)
    halo(im) {
      const sc = this.scene, p = P.iso(im.case[0], im.case[1]), z = 100 + (im.case[0] + im.case[1]) * 10 + 6;
      if (im.halo) { im.halo.destroy(); im.halo = null; im.haloAlpha = 0; }
      if (im.nom === "four" || im.nom === "four-banal") { im.halo = this.ajoute(sc.add.image(p.x + 8 * 1.6, p.y - 4, "halo-chaud").setScale(.9).setBlendMode(Phaser.BlendModes.ADD).setDepth(z).setAlpha(.8)); im.haloAlpha = .8; }
      if (im.nom === "lanterne") { im.halo = this.ajoute(sc.add.image(p.x, p.y - 44, "halo-pale").setScale(.8).setBlendMode(Phaser.BlendModes.ADD).setDepth(z).setAlpha(.9)); im.haloAlpha = .9; }
    }
    // Changer le décor d'une case (un Four banal qu'on allume) : son image, sa lueur et la lumière sur le sol
    changerDecor(c, nom) {
      const im = this.decorParCase[c[0] + "," + c[1]], inf = P.Textures.info("decor-" + nom);
      if (!im || !inf || im.nom === nom) return im || null;
      im.setTexture("decor-" + nom).setOrigin(inf.ox, inf.oy).setScale(1 / inf.k);
      im.nom = nom;
      this.halo(im);
      if (im.halo && im.alpha < 1) im.halo.setAlpha(im.haloAlpha * .25);
      this.redessinerSol();
      P.reveil && P.reveil();
      return im;
    }
    redessinerSol() {
      const ancien = this.solImg, cle = ancien && ancien.texture && ancien.texture.key;
      this.solImg = this.ajoute(this.dessinerSol()).setDepth(0);
      if (ancien) ancien.destroy();
      if (cle && this.scene.textures.exists(cle)) this.scene.textures.remove(cle);
    }
    // Un décor qui cache un personnage ou un objet au sol (placé derrière lui) devient à moitié transparent ;
    // un personnage qui en cache un autre aussi (on voit celui de derrière, sa barre reste au-dessus de tout)
    transparence(pions, objets) {
      const derriere = (im, b, p) => p.c.visible && p.c.depth < im.depth &&
        p.c.x > b.x - 6 && p.c.x < b.right + 6 && p.c.y - p.hauteur * .5 > b.y && p.c.y - p.hauteur * .5 < b.bottom;
      // plus les cases à dégager (this.degager : la case que montre le tutoriel, derrière un décor)
      const objs = (objets || []).map(o => ({ c: o, hauteur: 16 })).concat((this.degager || []).map(c => {
        const q = P.iso(c[0], c[1]); return { c: { x: q.x, y: q.y, visible: true, depth: 100 + (c[0] + c[1]) * 10 + 2 }, hauteur: 16 };
      }));
      this.decors.forEach(im => {
        const b = im.getBounds();
        // un objet au sol (fournée, piège, graine) est petit et bas : le décor s'efface davantage pour lui
        const a = objs.some(p => derriere(im, b, p)) ? .28 : pions.some(p => derriere(im, b, p)) ? .45 : 1;
        if (im.alpha !== a) {
          im.setAlpha(a);
          if (im.halo) im.halo.setAlpha(im.haloAlpha * (a < 1 ? .25 : 1));
          P.reveil && P.reveil();
        }
      });
      const vis = pions.filter(p => p.c.visible && p.corps);
      vis.forEach(p => {
        const a = p.corps();
        // p cache q si son dessin couvre les pieds ou le milieu du corps de q (q est derrière p)
        const dedans = (x, y) => x > a.x0 && x < a.x1 && y > a.y0 - 4 && y < a.y1 + 3;
        const cache = vis.some(q => q !== p && q.c.depth < p.c.depth && (dedans(q.c.x, q.c.y - 5) || dedans(q.c.x, q.c.y - q.hauteur * .5)));
        p.masque(cache);
      });
    }
    // Le sol, dessiné une fois dans une texture (3 pixels par unité), éclairé par le four et les lanternes
    dessinerSol() {
      const sc = this.scene, b = this.boite(), K = 3, base = this.combat ? "sol-combat" : "sol-balade";
      // une nouvelle clé à chaque dessin : l'ancienne image reste valable jusqu'à ce qu'on la remplace (redessinerSol)
      this.nSol = (this.nSol || 0) + 1;
      const cle = base + "-" + this.nSol;
      if (sc.textures.exists(cle)) sc.textures.remove(cle);
      if (this.nSol === 1) Object.keys(sc.textures.list).filter(k => k.indexOf(base + "-") === 0).forEach(k => sc.textures.remove(k));
      const W = Math.ceil(b.w * K), Hh = Math.ceil(b.h * K);
      const tex = sc.textures.createCanvas(cle, W, Hh), x = tex.context, C = this.combat, S = this.pal;

      x.setTransform(K, 0, 0, K, -b.x * K, -b.y * K);
      x.lineJoin = "round";
      const t = this.carte.terrain, EP = this.ep;
      const cases = this.cases().sort((a, c) => (a[0] + a[1]) - (c[0] + c[1]) || a[0] - c[0]);
      const poly = (pts, fill) => { x.beginPath(); pts.forEach(([a, c], i) => (i ? x.lineTo(a, c) : x.moveTo(a, c))); x.closePath(); x.fillStyle = fill; x.fill(); };
      // flancs de l'île
      cases.forEach(([cx, cy]) => {
        const p = P.iso(cx, cy), l = L / 2, h = H / 2;
        if (t(cx, cy + 1) === "vide") poly([[p.x - l, p.y], [p.x, p.y + h], [p.x, p.y + h + EP], [p.x - l, p.y + EP]], S.flancG);
        if (t(cx + 1, cy) === "vide") poly([[p.x, p.y + h], [p.x + l, p.y], [p.x + l, p.y + EP], [p.x, p.y + h + EP]], S.flancD);
      });
      // un liseré d'or au pied d'un flanc fin (le pont de la Voie lactée)
      if (S.liseréOr) {
        x.strokeStyle = "#C5A572"; x.lineWidth = 1.4;
        cases.forEach(([cx, cy]) => {
          const p = P.iso(cx, cy), l = L / 2, h = H / 2;
          if (t(cx, cy + 1) === "vide") { x.beginPath(); x.moveTo(p.x - l, p.y + EP); x.lineTo(p.x, p.y + h + EP); x.stroke(); }
          if (t(cx + 1, cy) === "vide") { x.beginPath(); x.moveTo(p.x, p.y + h + EP); x.lineTo(p.x + l, p.y + EP); x.stroke(); }
        });
      }
      // strates du flanc
      x.strokeStyle = "rgba(29,39,37,.12)"; x.lineWidth = 1;
      cases.forEach(([cx, cy]) => {
        const p = P.iso(cx, cy), l = L / 2, h = H / 2;
        if (t(cx, cy + 1) === "vide") { x.beginPath(); x.moveTo(p.x - l, p.y + EP * .55); x.lineTo(p.x, p.y + h + EP * .55); x.stroke(); }
        if (t(cx + 1, cy) === "vide") { x.beginPath(); x.moveTo(p.x, p.y + h + EP * .55); x.lineTo(p.x + l, p.y + EP * .55); x.stroke(); }
      });
      // dessus des cases
      cases.forEach(([cx, cy]) => {
        const p = P.iso(cx, cy), l = L / 2, h = H / 2, plein = t(cx, cy) === "plein";
        const clair = (cx + cy) % 2;
        const f = C && plein ? S.plein : clair ? S.clair : S.fonce;
        poly([[p.x, p.y - h], [p.x + l, p.y], [p.x, p.y + h], [p.x - l, p.y]], f);
      });
      if (S.motif) this.motif(x, cases, S.motif);
      // lumière chaude du four et des lanternes, ombre douce vers les bords
      x.save();
      x.globalCompositeOperation = "source-atop";
      cases.forEach(([cx, cy]) => {
        const nom = this.nomDecor(cx, cy);
        if (!LUMIERES[nom]) return;
        const p = P.iso(cx, cy), r = LUMIERES[nom];
        const g = x.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        g.addColorStop(0, `rgba(255,190,105,${C ? .26 : .34})`); g.addColorStop(1, "rgba(255,190,105,0)");
        x.fillStyle = g; x.fillRect(p.x - r, p.y - r, r * 2, r * 2);
      });
      const v = x.createRadialGradient(b.cx, b.cy - EP, Math.min(b.w, b.h) * .2, b.cx, b.cy, Math.max(b.w, b.h) * .62);
      v.addColorStop(0, "rgba(6,26,25,0)"); v.addColorStop(1, `rgba(6,26,25,${C ? .32 : .22})`);
      x.fillStyle = v; x.fillRect(b.x, b.y, b.w, b.h);
      x.restore();
      // traits des cases (plus marqués en combat : la vue en plan)
      x.strokeStyle = S.trait || (C ? SOL_COMBAT.trait : SOL_BALADE.trait); x.lineWidth = C ? 1.1 : .8;
      cases.forEach(([cx, cy]) => {
        const p = P.iso(cx, cy), l = L / 2, h = H / 2;
        x.beginPath(); x.moveTo(p.x, p.y - h); x.lineTo(p.x + l, p.y); x.lineTo(p.x, p.y + h); x.lineTo(p.x - l, p.y); x.closePath(); x.stroke();
      });
      // liseré de lumière sur les bords du fond, ombre sous les bords du devant
      cases.forEach(([cx, cy]) => {
        const p = P.iso(cx, cy), l = L / 2, h = H / 2;
        x.lineWidth = 1.6;
        x.strokeStyle = "rgba(255,246,222,.75)";
        if (t(cx - 1, cy) === "vide") { x.beginPath(); x.moveTo(p.x - l, p.y); x.lineTo(p.x, p.y - h); x.stroke(); }
        if (t(cx, cy - 1) === "vide") { x.beginPath(); x.moveTo(p.x, p.y - h); x.lineTo(p.x + l, p.y); x.stroke(); }
        x.strokeStyle = "rgba(122,95,46,.55)"; x.lineWidth = 1.2;
        if (t(cx, cy + 1) === "vide") { x.beginPath(); x.moveTo(p.x - l, p.y); x.lineTo(p.x, p.y + h); x.stroke(); }
        if (t(cx + 1, cy) === "vide") { x.beginPath(); x.moveTo(p.x, p.y + h); x.lineTo(p.x + l, p.y); x.stroke(); }
      });
      // en combat : le pied des décors pleins bien marqué
      if (C) cases.forEach(([cx, cy]) => {
        if (t(cx, cy) !== "plein") return;
        const p = P.iso(cx, cy), l = L / 2 - 5, h = H / 2 - 2.5;
        x.strokeStyle = "rgba(29,39,37,.45)"; x.lineWidth = 1.4;
        x.beginPath(); x.moveTo(p.x, p.y - h); x.lineTo(p.x + l, p.y); x.lineTo(p.x, p.y + h); x.lineTo(p.x - l, p.y); x.closePath(); x.stroke();
      });
      tex.refresh();
      return sc.add.image(b.x, b.y, cle).setOrigin(0, 0).setScale(1 / K);
    }
    // Un motif léger sur le dessus des cases : petites étoiles (la Voie lactée), lames de parquet, dalles, pavés, cannelures
    motif(x, cases, m) {
      let graine = 7; const rnd = () => (graine = (graine * 16807) % 2147483647) / 2147483647;
      const l = L / 2, h = H / 2;
      x.save();
      cases.forEach(([cx, cy]) => {
        if (this.carte.terrain(cx, cy) !== "sol") return;
        const p = P.iso(cx, cy);
        if (m === "etoiles") {
          // des étoiles de lait : petites croix dorées ou blanches, et une poussière brillante
          for (let i = 0; i < 3; i++) {
            const a = rnd() - .5, b = rnd() - .5, sx = p.x + (a - b) * l * .9, sy = p.y + (a + b) * h * .9, r = 1 + rnd() * 1.8;
            x.fillStyle = rnd() > .55 ? "rgba(197,165,114,.8)" : "rgba(255,255,255,.95)";
            x.beginPath(); x.moveTo(sx, sy - r * 1.8); x.lineTo(sx + r * .45, sy - r * .45); x.lineTo(sx + r * 1.8, sy); x.lineTo(sx + r * .45, sy + r * .45);
            x.lineTo(sx, sy + r * 1.8); x.lineTo(sx - r * .45, sy + r * .45); x.lineTo(sx - r * 1.8, sy); x.lineTo(sx - r * .45, sy - r * .45); x.closePath(); x.fill();
          }
          x.fillStyle = "rgba(214,200,160,.35)";
          for (let i = 0; i < 4; i++) { const a = rnd() - .5, b = rnd() - .5; x.beginPath(); x.arc(p.x + (a - b) * l, p.y + (a + b) * h, .9, 0, 7); x.fill(); }
        } else if (m === "parquet") {
          // trois lames dans le sens de la case
          x.strokeStyle = "rgba(122,95,46,.22)"; x.lineWidth = .9;
          [.25, .5, .75].forEach(t => { x.beginPath(); x.moveTo(p.x - l + l * t, p.y - h * t); x.lineTo(p.x + l * t, p.y + h - h * t); x.stroke(); });
        } else if (m === "tomettes") {
          // des tomettes de terre cuite : quatre carreaux par case, joints clairs, un carreau sur trois un peu plus rouge
          x.strokeStyle = "rgba(255,246,228,.45)"; x.lineWidth = 1;
          x.beginPath(); x.moveTo(p.x - l / 2, p.y - h / 2); x.lineTo(p.x + l / 2, p.y + h / 2); x.stroke();
          x.beginPath(); x.moveTo(p.x - l / 2, p.y + h / 2); x.lineTo(p.x + l / 2, p.y - h / 2); x.stroke();
          if (rnd() > .66) { x.fillStyle = "rgba(176,92,52,.10)"; x.beginPath(); x.moveTo(p.x, p.y - h); x.lineTo(p.x + l / 2, p.y - h / 2); x.lineTo(p.x, p.y); x.lineTo(p.x - l / 2, p.y - h / 2); x.closePath(); x.fill(); }
        } else if (m === "dalles" || m === "paves") {
          x.strokeStyle = m === "paves" ? "rgba(70,62,48,.2)" : "rgba(122,95,46,.13)"; x.lineWidth = .9;
          const n = m === "paves" ? 3 : 2;
          for (let i = 1; i < n; i++) {
            const t = i / n;
            x.beginPath(); x.moveTo(p.x - l + l * t, p.y - h * t); x.lineTo(p.x + l * t, p.y + h - h * t); x.stroke();
            x.beginPath(); x.moveTo(p.x - l + l * t, p.y + h * t); x.lineTo(p.x + l * t, p.y - h + h * t); x.stroke();
          }
        } else if (m === "cannelures") {
          x.strokeStyle = "rgba(168,139,87,.22)"; x.lineWidth = 1;
          x.beginPath(); x.ellipse(p.x, p.y, l * .55, h * .55, 0, 0, 7); x.stroke();
        }
      });
      x.restore();
    }
    // Les îles lointaines de l'Astrelier (décor ; grisées en combat), placées comme sur la carte de l'Astrelier, vues depuis l'île
    // où l'on est (jamais elle-même) : plus bas et plus petites depuis la Penderie (une île haute, une nappe de nuages de farine
    // dessous), plus haut et vues par en dessous depuis le Moule (une île basse, la crêpe du toboggan qui descend du ciel).
    // Grand-Étal (la ville) : des façades au fond, plus de constellations ni d'îles de l'Astrelier.
    dessinerIles() {
      const sc = this.scene, cle = this.combat ? "iles-combat" : "iles-balade", b = this.boite();
      const W = 1700, Hh = 1700, cx0 = W / 2, cy0 = Hh / 2;
      if (sc.textures.exists(cle)) sc.textures.remove(cle);
      const tex = sc.textures.createCanvas(cle, W, Hh), x = tex.context, C = this.combat;
      if (this.ville) { this.dessinerFacades(x, cx0, cy0, b); tex.refresh(); return sc.add.image(b.cx, b.cy, cle).setAlpha(C ? .45 : .7); }
      const coul = C ? ["#3F4E4A", "#2C3936", "#24302D"] : ["#B9B49A", "#6E6A52", "#5A5642"];
      const POS = { halle: [78, 92], "voie-lactee": [128, 160], fourneau: [176, 226], penderie: [266, 66], moule: [270, 292] };
      const NIV = { penderie: 1, moule: -1 };
      const ici = POS[this.ile] ? this.ile : "fourneau", h0 = NIV[ici] || 0;
      // la partie du ciel visible autour de l'île au zoom par défaut (comme le cadrage de la scène)
      const r = P.UI && P.UI.rectUtile ? P.UI.rectUtile() : { w: 390, h: 640 };
      const Z = Math.max(44 / L, Math.min(1.7, Math.min(r.w / (b.w + 24), r.h / (b.h + 70))));
      const Wv = r.w / Z, Hv = r.h / Z, cyv = -18;
      const dist = id => Math.hypot(POS[id][0] - POS[ici][0], POS[id][1] - POS[ici][1]);
      const loin = Object.keys(POS).filter(id => id !== ici && id !== "voie-lactee").map(dist).sort((a, c) => a - c);
      // une île au loin : dans la direction de la carte, vers le bord de l'écran (la plus proche un peu moins loin) ;
      // plus bas si l'on est plus haut qu'elle, plus haut si l'on est plus bas : [x, y, échelle, vue par en dessous]
      const place = id => {
        const d = (NIV[id] || 0) - h0, k = Math.pow(.8, Math.abs(d)) * (d < 0 ? .85 : 1);
        const a = Math.atan2(POS[id][1] - POS[ici][1], POS[id][0] - POS[ici][0]);
        const f = id === "voie-lactee" ? .5 : dist(id) <= loin[0] + 1 ? .74 : 1;
        let dx = Math.cos(a) * (Wv / 2 - 46) * f, dy = cyv + Math.sin(a) * (Hv / 2 - 56) * f - d * 70;
        dy = Math.max(cyv - Hv / 2 + 50, Math.min(cyv + Hv / 2 - 40, dy));
        return [dx, dy, k, d > 0];
      };
      const ile = (dx, dy, r, dessous, bat) => {
        const cx = cx0 + dx, cy = cy0 + dy, h = r / 2, f = dessous ? .45 : 1, cone = dessous ? 1.15 : .75;
        x.fillStyle = coul[1]; x.beginPath(); x.moveTo(cx - r, cy); x.lineTo(cx, cy + h * f); x.lineTo(cx + r, cy); x.lineTo(cx + r * .55, cy + h * f + r * .4); x.lineTo(cx, cy + h * f + r * cone); x.lineTo(cx - r * .55, cy + h * f + r * .4); x.closePath(); x.fill();
        x.fillStyle = coul[2]; x.beginPath(); x.moveTo(cx, cy + h * f); x.lineTo(cx + r, cy); x.lineTo(cx + r * .55, cy + h * f + r * .4); x.lineTo(cx, cy + h * f + r * cone); x.closePath(); x.fill();
        x.fillStyle = coul[0]; x.beginPath(); x.moveTo(cx, cy - h * f); x.lineTo(cx + r, cy); x.lineTo(cx, cy + h * f); x.lineTo(cx - r, cy); x.closePath(); x.fill();
        if (bat && !dessous) bat(cx, cy, r);
      };
      const B = C ? "#3C4A46" : null;
      const DESSINS = {
        halle: (cx, cy, r) => { const k = r / 64; x.fillStyle = B || "#8A6E48"; x.fillRect(cx - 22 * k, cy - 10 * k, 44 * k, 11 * k); x.fillStyle = B || "#9E7A4C"; x.beginPath(); x.moveTo(cx - 29 * k, cy - 9 * k); x.lineTo(cx, cy - 32 * k); x.lineTo(cx + 29 * k, cy - 9 * k); x.closePath(); x.fill(); x.fillStyle = C ? "#56625E" : "#E4B54A"; x.fillRect(cx - 4 * k, cy - 6 * k, 8 * k, 7 * k); },
        fourneau: (cx, cy, r) => { const k = r / 60; x.fillStyle = B || "#C9B48C"; x.beginPath(); x.ellipse(cx, cy - 4 * k, 16 * k, 14 * k, 0, Math.PI, 0); x.fill(); x.fillRect(cx - 6 * k, cy - 30 * k, 5 * k, 12 * k); x.fillStyle = C ? "#56625E" : "#E4B54A"; x.beginPath(); x.ellipse(cx + 4 * k, cy - 6 * k, 4 * k, 5 * k, 0, Math.PI, 0); x.fill(); },
        penderie: (cx, cy, r) => { const k = r / 46; x.strokeStyle = B || "#5B4632"; x.lineWidth = 2.4 * k; x.beginPath(); x.moveTo(cx - 14 * k, cy); x.lineTo(cx - 14 * k, cy - 24 * k); x.lineTo(cx + 14 * k, cy - 24 * k); x.lineTo(cx + 14 * k, cy); x.stroke(); x.fillStyle = C ? "#56625E" : "#2A5049"; [-7, 0, 7].forEach((a, i) => { x.fillStyle = C ? "#56625E" : ["#F4ECDA", "#2A5049", "#E4C98E"][i]; x.fillRect(cx + a * k - 3 * k, cy - 22 * k, 6 * k, 13 * k); }); },
        moule: (cx, cy, r) => { const k = r / 46; x.fillStyle = B || "#C9BC9C"; x.beginPath(); x.moveTo(cx - 13 * k, cy - 16 * k); x.lineTo(cx + 13 * k, cy - 16 * k); x.lineTo(cx + 10 * k, cy - 2 * k); x.lineTo(cx - 10 * k, cy - 2 * k); x.closePath(); x.fill(); x.fillStyle = C ? "#56625E" : "#E6DCC4"; x.beginPath(); x.ellipse(cx, cy - 16 * k, 13 * k, 4 * k, 0, 0, 7); x.fill(); }
      };
      const R = { halle: 64, fourneau: 60, penderie: 46, moule: 46 };
      // depuis une île haute : une nappe de nuages de farine, en bas
      if (h0 > 0) {
        x.fillStyle = C ? "rgba(120,130,126,.25)" : "rgba(250,246,236,.42)";
        for (let i = 0; i < 46; i++) { const a = (i * 97) % 1500 - 750, c = cyv + Hv / 2 - 150 + ((i * 53) % 200); x.beginPath(); x.ellipse(cx0 + a, cy0 + c, 40 + (i * 31) % 50, 14 + (i * 7) % 12, 0, 0, 7); x.fill(); }
      }
      // le pont de lumière (la Voie lactée), entre la Halle et le Fourneau
      if (ici !== "voie-lactee") {
        const a = place("halle"), c = place("fourneau"), m = place("voie-lactee");
        x.strokeStyle = C ? "rgba(140,150,146,.3)" : "rgba(242,237,224,.55)"; x.lineWidth = 5 * Math.min(a[2], c[2]); x.lineCap = "round"; x.setLineDash([3, 9]);
        x.beginPath(); x.moveTo(cx0 + (ici === "halle" ? m[0] * .5 : a[0]), cy0 + (ici === "halle" ? m[1] * .5 : a[1])); x.quadraticCurveTo(cx0 + m[0], cy0 + m[1], cx0 + (ici === "fourneau" ? m[0] * .5 : c[0]), cy0 + (ici === "fourneau" ? m[1] * .5 : c[1])); x.stroke(); x.setLineDash([]);
      }
      Object.keys(R).filter(id => id !== ici).forEach(id => { const [dx, dy, k, dessous] = place(id); ile(dx, dy, R[id] * k, dessous, DESSINS[id]); });
      // depuis le Moule : la crêpe du toboggan descend du ciel vers le bas du toboggan
      if (ici === "moule" && !C) {
        x.strokeStyle = "rgba(232,194,122,.42)"; x.lineWidth = 14; x.lineCap = "round";
        x.beginPath(); x.moveTo(cx0 - b.w * .35, cy0 - 850); x.bezierCurveTo(cx0 - b.w * .32, cy0 - 600, cx0 - b.w * .42, cy0 - 420, cx0 - b.w * .48, cy0 - b.h * .5 - 60); x.stroke();
      }
      tex.refresh();
      return sc.add.image(b.cx, b.cy, cle).setAlpha(C ? .4 : .5);
    }
    // Grand-Étal : des façades de pierre au fond (toits, fenêtres éclairées), sous la lueur de la ville
    dessinerFacades(x, cx0, cy0, b) {
      const C = this.combat, haut = cy0 - b.h * .5 - 40;
      let g = 3; const rnd = () => (g = (g * 16807) % 2147483647) / 2147483647;
      for (let i = -7; i <= 7; i++) {
        const w = 60 + rnd() * 40, h = 90 + rnd() * 110, px = cx0 + i * 92 + (rnd() - .5) * 20, py = haut - Math.abs(i) * 22;
        x.fillStyle = C ? "#2C3936" : (i % 2 ? "#4E5A54" : "#56625C");
        x.fillRect(px - w / 2, py - h, w, h + 240);
        x.fillStyle = C ? "#24302D" : "#3B4642"; x.beginPath(); x.moveTo(px - w / 2 - 6, py - h); x.lineTo(px, py - h - 34 - rnd() * 18); x.lineTo(px + w / 2 + 6, py - h); x.closePath(); x.fill();
        for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) {
          x.fillStyle = !C && rnd() > .45 ? "rgba(228,181,74,.75)" : "rgba(20,30,28,.6)";
          x.fillRect(px - w / 2 + 12 + c * (w - 34), py - h + 18 + r * 34, 10, 14);
        }
      }
    }
    // Les garde-corps du pont : des poteaux d'or toutes les deux cases de bord, reliés par une corde de lumière
    dessinerGardeCorps() {
      const sc = this.scene, t = this.carte.terrain, l = L / 2, h = H / 2, haut = 13, parProf = new Map();
      const calque = z => { if (!parProf.has(z)) parProf.set(z, this.ajoute(sc.add.graphics()).setDepth(z)); return parProf.get(z); };
      const sans = this.sansGardeCorps.map(c => c.join(","));
      this.cases().forEach(([cx, cy]) => {
        if (sans.indexOf(cx + "," + cy) >= 0) return;
        const p = P.iso(cx, cy), G = { x: p.x - l, y: p.y }, Ht = { x: p.x, y: p.y - h }, D = { x: p.x + l, y: p.y }, Bs = { x: p.x, y: p.y + h };
        const bords = [];
        if (t(cx - 1, cy) === "vide") bords.push([G, Ht, -3]);
        if (t(cx, cy - 1) === "vide") bords.push([Ht, D, -3]);
        if (t(cx, cy + 1) === "vide") bords.push([G, Bs, 8]);
        if (t(cx + 1, cy) === "vide") bords.push([Bs, D, 8]);
        bords.forEach(([a, c, dz]) => {
          const g = calque(100 + (cx + cy) * 10 + dz);
          g.lineStyle(1.3, 0xE4C98E, .9);
          g.beginPath(); g.moveTo(a.x, a.y - haut);
          const n = 6;
          for (let i = 1; i <= n; i++) { const k = i / n; g.lineTo(a.x + (c.x - a.x) * k, a.y + (c.y - a.y) * k - haut + Math.sin(Math.PI * k) * 3); }
          g.strokePath();
          if ((cx + cy) % 2 === 0) {
            g.lineStyle(2.4, 0xC5A572, 1); g.lineBetween(a.x, a.y + 1, a.x, a.y - haut - 1);
            g.fillStyle(0xE4C98E, 1); g.fillCircle(a.x, a.y - haut - 1.6, 2);
          }
        });
      });
    }
    // Le lait qui goutte du bord du pont : quelques gouttes qui tombent, puis s'arrêtent (la boucle du jeu peut dormir) ;
    // relancées à chaque geste. Rien avec les animations réduites.
    animerDecor(fois) {
      if (!this.pal.gouttes || this.combat || P.reduit()) return;
      const sc = this.scene, t = this.carte.terrain;
      if (!this.gouttes) {
        const bords = this.cases().filter(([cx, cy]) => t(cx, cy + 1) === "vide" || t(cx + 1, cy) === "vide").sort((a, c) => (a[0] + a[1]) - (c[0] + c[1]));
        this.gouttes = [.18, .4, .63, .86].map((f, i) => {
          const [cx, cy] = bords[Math.floor(f * (bords.length - 1))], p = P.iso(cx, cy), gauche = t(cx, cy + 1) === "vide";
          const x0 = p.x + (gauche ? -L / 4 : L / 4), y0 = p.y + H / 4 + this.ep;
          const g = this.ajoute(sc.add.graphics()).setDepth(-5);
          g.fillStyle(0xFFFDF7, 1); g.fillCircle(0, 0, 2.2); g.fillTriangle(-1.8, -.8, 1.8, -.8, 0, -5);
          g.setPosition(x0, y0).setAlpha(0);
          return { g, x0, y0, retard: i * 260, tw: null };
        });
      }
      this.gouttes.forEach(d => {
        if (d.tw && d.tw.isPlaying()) return;
        d.g.setPosition(d.x0, d.y0).setAlpha(0);
        d.tw = sc.tweens.add({ targets: d.g, y: d.y0 + 40, alpha: { from: .95, to: 0 }, duration: 900, delay: d.retard, repeat: (fois || 3) - 1, repeatDelay: 300, ease: "Quad.In" });
      });
      P.reveil && P.reveil();
    }
    // ---------- Calque des cases (redessiné seulement quand l'aperçu change) ----------
    effacer() { this.calque.clear(); this.viderEtiquettes(); this.places = []; this.obstacles = []; this._vb = null; }
    // Les étiquettes gardent leur taille à l'écran quel que soit le zoom (référence : le zoom par défaut)
    echelle() {
      const v = this.scene.vue, z = v ? v.Z : 1, ref = this.scene.zDefaut || z;
      return Math.max(.45, Math.min(1.8, ref / z));
    }
    majEchelle() { const k = this.echelle(); this.etiquettes.forEach(t => { if (t.etiquette) t.setScale(k); }); }
    // La partie du monde visible dans la zone libre de l'écran
    vueMonde() {
      if (this._vb) return this._vb;
      const v = this.scene.vue; if (!v || !P.UI) return null;
      const r = P.UI.rectUtile(), a = v.versMonde(r.x + 6, r.y + 6), b = v.versMonde(r.x + r.w - 6, r.y + r.h - 6);
      return (this._vb = { x0: a.x, y0: a.y, x1: b.x, y1: b.y });
    }
    losange(c, o = {}, gr) {
      const g = gr || this.calque, p = P.iso(c[0], c[1]), r = o.retrait == null ? 2 : o.retrait;
      const l = L / 2 - r, h = H / 2 - r / 2;
      const pts = [{ x: p.x, y: p.y - h }, { x: p.x + l, y: p.y }, { x: p.x, y: p.y + h }, { x: p.x - l, y: p.y }];
      if (o.fill != null) { g.fillStyle(o.fill, o.alpha == null ? .5 : o.alpha); g.fillPoints(pts, true); }
      if (o.hachure != null) {
        g.lineStyle(o.hachureLargeur || 1.6, o.hachure, o.hachureAlpha == null ? .75 : o.hachureAlpha);
        const [T, Rr, B, Lf] = pts;
        [.2, .4, .6, .8].forEach(t => {
          g.lineBetween(T.x + (Rr.x - T.x) * t, T.y + (Rr.y - T.y) * t, Lf.x + (B.x - Lf.x) * t, Lf.y + (B.y - Lf.y) * t);
        });
      }
      if (o.barre != null) { g.lineStyle(2, o.barre, .8); g.lineBetween(pts[3].x + 8, pts[3].y + 4, pts[1].x - 8, pts[1].y - 4); }
      if (o.stroke != null) { g.lineStyle(o.largeur || 1.5, o.stroke, o.strokeAlpha == null ? .9 : o.strokeAlpha); g.strokePoints(pts, true, true); }
      if (o.point != null) { g.fillStyle(o.point, .95); g.fillCircle(p.x, p.y, o.pointRayon || 4); }
    }
    // Étiquette posée au-dessus d'une case ou d'un point (aperçus)
    // Étiquette en pastille sombre ; elle se pousse vers le haut si elle chevauche une étiquette déjà posée
    etiquette(wx, wy, texte, o = {}) {
      const k = this.echelle(), Z = (this.scene.vue && this.scene.vue.Z) || 1;
      const style = {
        fontFamily: P.POLICE, fontSize: (o.taille || 15) + "px", fontStyle: "bold", color: o.couleur || "#FFFDF7",
        stroke: o.contour || "#0D2D2A", strokeThickness: o.epaisseur == null ? 2 : o.epaisseur, align: "center",
        backgroundColor: o.fond === false ? null : (o.fond || "rgba(13,45,42,0.86)"), padding: o.fond === false ? undefined : { x: 5, y: 2 }
      };
      // jamais plus large que l'écran : retour à la ligne (largeur utile moins 24 px)
      if (P.UI && P.UI.rectUtile) { const r = P.UI.rectUtile(), max = Math.max(140, Math.min(r.w, 560) - 24 - 10); style.wordWrap = { width: max / (k * Z), useAdvancedWrap: true }; }
      const t = this.scene.add.text(wx, wy, P.typo ? P.typo(texte) : texte, style).setOrigin(.5, 1).setDepth(o.depth || 900000).setResolution(P.resolutionTexte());
      t.etiquette = true; t.setScale(k);
      this.places = this.places || [];
      // la première place libre (ni sur une autre étiquette, ni sur un obstacle : un personnage, une barre),
      // en essayant tour à tour un cran plus haut, un cran plus bas, deux crans plus haut…
      const genes = this.places.concat(o.libre ? [] : (this.obstacles || []));
      const y0 = t.y, pas = t.getBounds().height + 2;
      const gene = () => { const b = t.getBounds(); return genes.some(r => !(b.right < r.x || b.x > r.right || b.bottom < r.y || b.y > r.bottom)); };
      for (let i = 0; i < 15; i++) {
        t.y = y0 + (o.bec ? -1 : (i % 2 ? -1 : 1)) * (o.bec ? i : Math.ceil(i / 2)) * pas;
        if (!gene()) break;
        if (i === 14) t.y = y0;
      }
      // dans l'écran : jamais coupée au bord
      const vb = o.borner === false ? null : this.vueMonde();
      if (vb) {
        let b = t.getBounds();
        if (b.x < vb.x0) t.x += vb.x0 - b.x; else if (b.right > vb.x1) t.x -= b.right - vb.x1;
        b = t.getBounds(); if (b.y < vb.y0) t.y += vb.y0 - b.y;
      }
      const b = t.getBounds(); this.places.push({ x: b.x, y: b.y, right: b.right, bottom: b.bottom });
      this.ajoute(t);
      this.etiquettes.push(t);
      // un petit bec qui pointe vers l'objet (surtout quand l'étiquette a dû se pousser de côté ou vers le haut)
      if (o.bec) {
        const g = this.ajoute(this.scene.add.graphics()).setDepth((o.depth || 900000) - 1);
        const bx = Math.max(b.x + 8 * k, Math.min(b.right - 8 * k, wx)), pointe = Math.max(b.bottom + 7 * k, Math.min(wy + 6 * k, b.bottom + 60 * k));
        g.fillStyle(0x0D2D2A, .86); g.fillTriangle(bx - 5 * k, b.bottom - .5, bx + 5 * k, b.bottom - .5, wx, pointe);
        g.lineStyle(1.2 * k, 0xC5A572, .9); g.lineBetween(bx - 5 * k, b.bottom, wx, pointe); g.lineBetween(bx + 5 * k, b.bottom, wx, pointe);
        this.etiquettes.push(g);
        this.places.push({ x: Math.min(bx, wx) - 5 * k, y: b.bottom, right: Math.max(bx, wx) + 5 * k, bottom: pointe });
      }
      return t;
    }
    image(wx, wy, cle, o = {}) {
      const inf = P.Textures.info(cle) || { k: 1, ox: .5, oy: .5 };
      const im = this.scene.add.image(wx, wy, cle).setOrigin(o.ox == null ? .5 : o.ox, o.oy == null ? .5 : o.oy).setScale((o.taille || 22) / ((inf.w || 22) * inf.k))
        .setDepth(o.depth || 900000).setAlpha(o.alpha == null ? 1 : o.alpha);
      this.ajoute(im);
      if (o.temporaire !== false) this.etiquettes.push(im);
      return im;
    }
    viderEtiquettes() { this.etiquettes.forEach(t => t.destroy()); this.etiquettes = []; }
    // Chiffre qui monte puis s'efface
    flotter(wx, wy, texte, o = {}) {
      const sc = this.scene, now = Date.now(), k = this.echelle();
      // empilés : un chiffre qui arrive sur un autre encore visible se pose au-dessus
      this.flottants = (this.flottants || []).filter(f => f.fin > now);
      for (let i = 0; i < 6; i++) {
        const g = this.flottants.find(f => Math.abs(f.x - wx) < 46 * k && Math.abs(f.y - wy) < 17 * k);
        if (!g) break;
        wy = g.y - 18 * k;
      }
      // un chiffre reste net environ 0,8 s, puis s'efface (sa durée ne suit pas « Accélérer » : il doit rester lisible)
      const d = o.duree || 1050;
      this.flottants.push({ x: wx, y: wy, fin: now + d * .9, texte });
      const t = sc.add.text(wx, wy, texte, {
        fontFamily: P.POLICE, fontSize: (o.taille || 18) + "px", fontStyle: "bold", color: o.couleur || "#FFFDF7",
        stroke: "#0D2D2A", strokeThickness: 5, align: "center"
      }).setOrigin(.5, 1).setDepth(1000000 + (o.rang || 0)).setResolution(P.resolutionTexte());
      this.ajoute(t);
      t.setScale(k);
      if (P.reduit()) {
        sc.tweens.add({ targets: t, alpha: 0, delay: d * .75, duration: d * .25, onComplete: () => t.destroy() });
      } else {
        t.setScale(.6 * k);
        sc.tweens.add({ targets: t, scale: k, duration: 120, ease: "Back.Out" });
        sc.tweens.add({ targets: t, y: wy - (o.monte || 34) * k, duration: d, ease: "Cubic.Out" });
        sc.tweens.add({ targets: t, alpha: 0, delay: d * .76, duration: d * .24, onComplete: () => t.destroy() });
      }
      P.reveil && P.reveil();
      return t;
    }
  }
  P.Plateau = Plateau;
  P.resolutionTexte = () => Math.min(4, Math.max(2, Math.ceil((P.dpr || 1) * 1.5)));

  // ---------- Un pion sur le plateau ----------
  // o : { cle (texture), equipe: 'moi' | 'allie' | 'ennemi' | 'neutre', taille (largeur de l'anneau), hauteur (haut de la tête) }
  class Pion {
    constructor(plateau, o) {
      const sc = plateau.scene;
      this.plateau = plateau; this.o = o;
      this.c = sc.add.container(0, 0); plateau.ajoute(this.c);
      this.anneau = sc.add.graphics(); this.c.add(this.anneau);
      this.dessinerAnneau();
      this.membres = [];
      (o.membres || [{ cle: o.cle, dx: 0, dy: 0 }]).forEach(m => {
        const inf = P.Textures.info(m.cle) || { ox: .5, oy: 1, k: 4, h: 40 };
        const im = sc.add.image(m.dx || 0, m.dy || 0, m.cle).setOrigin(inf.ox, inf.oy).setScale(1 / inf.k);
        im.hauteur = inf.h * inf.oy;
        this.membres.push(im);
      });
      // le membre de devant est dessiné en dernier
      this.membres.slice().sort((a, b) => a.y - b.y).forEach(im => this.c.add(im));
      this.image = this.membres[0];
      this.hauteur = o.hauteur || Math.max(...this.membres.map(m => m.hauteur - m.y));
      // au-dessus de tous les corps : la barre de Victuailles (avec son chiffre), les états, la marque du tour
      this.dessus = sc.add.container(0, 0); plateau.ajoute(this.dessus);
      this.barre = sc.add.graphics(); this.dessus.add(this.barre);
      this.marque = sc.add.graphics(); this.dessus.add(this.marque);
      this.icones = sc.add.container(0, -this.hauteur - 18); this.dessus.add(this.icones);
      this.case = null; this.sens = 1; this.vie = null; this.estMasque = false;
    }
    // Le corps (boîte du dessin) dans le monde
    corps() { const w = (this.o.taille || 19) * .85; return { x0: this.c.x - w, x1: this.c.x + w, y0: this.c.y - this.hauteur, y1: this.c.y - 3 }; }
    // Ce pion en cache un autre : on le rend à moitié transparent
    masque(on) {
      if (on === this.estMasque) return;
      this.estMasque = on;
      this.membres.forEach(m => m.setAlpha(on ? .42 : 1));
      P.reveil && P.reveil();
    }
    // Le calque du dessus suit le corps (appelé à chaque image et à chaque placement)
    suivre() {
      const d = this.dessus;
      if (d.x !== this.c.x || d.y !== this.c.y) d.setPosition(this.c.x, this.c.y);
      if (d.visible !== this.c.visible) d.setVisible(this.c.visible);
      const a = Math.min(1, this.c.alpha);
      if (d.alpha !== a) d.setAlpha(a);
      const z = 600000 + this.c.depth;
      if (d.depth !== z) d.setDepth(z);
    }
    dessinerAnneau() {
      const g = this.anneau, e = this.o.equipe, rx = this.o.taille || 19, ry = rx / 2;
      g.clear();
      if (e === "neutre") return;
      const col = e === "ennemi" ? 0xC0703A : 0xC5A572;
      if (e === "ennemi") {
        g.lineStyle(2, col, .95);
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) g.beginPath(), g.arc(0, 0, rx, a, a + Math.PI / 14), g.strokePath();
        // l'arc est circulaire : on aplatit le Graphics
      } else {
        g.lineStyle(e === "moi" ? 2.6 : 2, col, 1); g.strokeCircle(0, 0, rx);
      }
      g.setScale(1, .5);
    }
    placer(c) {
      this.case = c ? [c[0], c[1]] : null;
      if (!c) { this.c.setVisible(false); this.suivre(); return this; }
      const p = P.iso(c[0], c[1]);
      this.c.setVisible(true).setPosition(p.x, p.y).setDepth(100 + (c[0] + c[1]) * 10 + 4);
      this.suivre();
      return this;
    }
    profondeur(c) { this.c.setDepth(100 + (c[0] + c[1]) * 10 + 4); }
    orienter(sens) {
      if (!sens || sens === this.sens) return;
      this.sens = sens;
      this.membres.forEach(m => m.setFlipX(sens < 0));
    }
    // Victuailles : barre fine au-dessus de la tête (redessinée seulement si elle change)
    victuailles(v, max, entame, montrer) {
      const k = [v, max, entame, montrer, this.o.chiffre].join("|");
      if (k === this._vk) return; this._vk = k;
      const g = this.barre; g.clear();
      if (this.chiffre) this.chiffre.setVisible(false);
      if (!montrer || !max) return;
      const w = 34, h = 5, x = -w / 2 - (this.o.chiffre ? 8 : 0), y = -this.hauteur - 10;
      const plafond = Math.max(1, max), utile = Math.max(0, max - (entame || 0));
      g.fillStyle(0x0D2D2A, .9); g.fillRoundedRect(x - 1.5, y - 1.5, w + 3, h + 3, 3);
      if (entame) { g.fillStyle(0x6E7A76, .9); g.fillRect(x + w * utile / plafond, y, w * (plafond - utile) / plafond, h); }
      g.fillStyle(this.o.equipe === "ennemi" ? 0xD9663F : 0xC8553D, 1); g.fillRect(x, y, Math.max(0, w * v / plafond), h);
      if (this.o.chiffre) {
        if (!this.chiffre) {
          this.chiffre = this.plateau.scene.add.text(0, 0, "", { fontFamily: P.POLICE, fontSize: "10px", fontStyle: "bold", color: "#FFFDF7", backgroundColor: "#0D2D2A", padding: { x: 2, y: 0 } })
            .setOrigin(0, .5).setResolution(P.resolutionTexte());
          this.dessus.add(this.chiffre);
        }
        this.chiffre.setText(String(v)).setPosition(x + w + 2.5, y + h / 2).setVisible(true);
      }
    }
    actif(on) {
      const g = this.marque; g.clear();
      if (!on) return;
      const y = -this.hauteur - 26;
      g.fillStyle(0xE4C98E, 1); g.lineStyle(1.5, 0x0D2D2A, 1);
      g.fillTriangle(-6, y - 8, 6, y - 8, 0, y); g.strokeTriangle(-6, y - 8, 6, y - 8, 0, y);
    }
    // États : petites icônes au-dessus de la barre
    etats(liste) {
      const k = JSON.stringify(liste || []);
      if (k === this._ek) return; this._ek = k;
      this.icones.removeAll(true);
      const sc = this.plateau.scene, n = (liste || []).length, pas = 15;
      (liste || []).forEach((e, i) => {
        const cle = "ic-" + e.etat;
        if (!sc.textures.exists(cle)) return;
        const inf = P.Textures.info(cle);
        const x = (i - (n - 1) / 2) * pas;
        const fond = sc.add.circle(x, 0, 7.5, 0x0D2D2A, .85); this.icones.add(fond);
        const im = sc.add.image(x, 0, cle).setScale(12 / 22 / inf.k); this.icones.add(im);
        if (e.couches > 1) { const t = sc.add.text(x + 6, 4, String(e.couches), { fontFamily: P.POLICE, fontSize: "9px", fontStyle: "bold", color: "#FFFDF7", stroke: "#0D2D2A", strokeThickness: 3 }).setOrigin(.5).setResolution(P.resolutionTexte()); this.icones.add(t); }
      });
    }
    contient(wx, wy) {
      if (!this.c.visible) return false;
      const dx = wx - this.c.x, dy = wy - this.c.y, w = (this.o.taille || 19) + 4;
      return dx >= -w && dx <= w && dy <= 8 && dy >= -this.hauteur - 6;
    }
    detruire() { this.c.destroy(); this.dessus.destroy(); }
  }
  P.Pion = Pion;

  // ---------- La caméra du monde ----------
  // Z = pixels CSS par unité du monde ; zoom Phaser = Z × dpr (le jeu est rendu en pixels de l'appareil).
  class Vue {
    constructor(scene, cam) {
      this.scene = scene; this.cam = cam; this.bornes = null;
      this.Z = 1; this.zMin = .3; this.zMax = 3;
    }
    get dpr() { return P.dpr || 1; }
    setZ(z, ancre) {
      z = Math.max(this.zMin, Math.min(this.zMax, z));
      if (ancre) {
        const avant = this.versMonde(ancre.x, ancre.y);
        this.Z = z; this.cam.setZoom(z * this.dpr);
        const apres = this.versMonde(ancre.x, ancre.y);
        this.cam.scrollX += avant.x - apres.x; this.cam.scrollY += avant.y - apres.y;
      } else { this.Z = z; this.cam.setZoom(z * this.dpr); }
      this.borner();
      if (this.scene.surZoom) this.scene.surZoom();
      P.reveil && P.reveil();
    }
    versMonde(sx, sy) {
      const c = this.cam, gx = sx * this.dpr - c.x, gy = sy * this.dpr - c.y;
      return { x: c.scrollX + c.width / 2 + (gx - c.width / 2) / c.zoom, y: c.scrollY + c.height / 2 + (gy - c.height / 2) / c.zoom };
    }
    versEcran(wx, wy) {
      const c = this.cam;
      return { x: ((wx - c.scrollX - c.width / 2) * c.zoom + c.width / 2 + c.x) / this.dpr, y: ((wy - c.scrollY - c.height / 2) * c.zoom + c.height / 2 + c.y) / this.dpr };
    }
    // Place le point du monde (wx, wy) au point de l'écran (sx, sy) (pixels CSS)
    placer(wx, wy, sx, sy) {
      const c = this.cam;
      c.scrollX = wx - c.width / 2 - (sx * this.dpr - c.x - c.width / 2) / c.zoom;
      c.scrollY = wy - c.height / 2 - (sy * this.dpr - c.y - c.height / 2) / c.zoom;
      this.borner();
      P.reveil && P.reveil();
    }
    deplacer(dx, dy) { this.cam.scrollX -= dx * this.dpr / this.cam.zoom; this.cam.scrollY -= dy * this.dpr / this.cam.zoom; this.borner(); P.reveil && P.reveil(); }
    // Le centre de la vue reste au-dessus de l'île (avec une marge)
    borner() {
      const b = this.bornes; if (!b) return;
      const c = this.cam, cx = c.scrollX + c.width / 2, cy = c.scrollY + c.height / 2;
      const mx = b.w * .5, my = b.h * .5;
      const nx = Math.max(b.x - mx * .4, Math.min(b.x + b.w + mx * .4, cx)), ny = Math.max(b.y - my * .6, Math.min(b.y + b.h + my * .6, cy));
      c.scrollX += nx - cx; c.scrollY += ny - cy;
    }
    // Cadre la boîte dans le rectangle utile de l'écran (pixels CSS)
    cadrer(boite, rect, o = {}) {
      const zFit = Math.min(rect.w / (boite.w + (o.marge || 24)), rect.h / (boite.h + (o.margeH || 70)));
      const z = Math.max(o.zMin || 0, Math.min(o.zMax || 3, zFit));
      this.setZ(z);
      this.placer(boite.cx, boite.cy - (o.leve || 18), rect.x + rect.w / 2, rect.y + rect.h / 2);
      return z;
    }
    animerVers(wx, wy, sx, sy, duree) {
      const c = this.cam, depart = { x: c.scrollX, y: c.scrollY };
      this.placer(wx, wy, sx, sy);
      const fin = { x: c.scrollX, y: c.scrollY };
      if (P.reduit() || !duree) return;
      c.scrollX = depart.x; c.scrollY = depart.y;
      const o = { t: 0 };
      if (this.animation) { try { this.animation.stop(); } catch (e) { /* rien */ } }
      this.animation = this.scene.tweens.add({ targets: o, t: 1, duration: duree, ease: "Cubic.Out", onUpdate: () => { c.scrollX = depart.x + (fin.x - depart.x) * o.t; c.scrollY = depart.y + (fin.y - depart.y) * o.t; } });
      P.reveil && P.reveil();
    }
  }
  P.Vue = Vue;
})();
