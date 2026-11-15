/*
 * Orvane, prototype : voyager d'une île à l'autre (les îles et leurs objets sont dans proto/iles.js).
 * Chaque moyen est tiré du décor de l'atelier céleste : la marche par le bord (une flèche dorée, puis une tête de pont en lait
 * d'étoiles), le passe-plat (un guichet et son jumeau), le monte-plats (une caisse à cordes : mât et poulie en bas, treuil en haut),
 * le toboggan (une crêpe en goulotte, à sens unique), le Four banal (allumé en passant devant, puis on voyage d'un four allumé à
 * l'autre), la Grande Pelle (le Défournement, vers Grand-Étal, au niveau 12) et la Sieste (le lit de farine de Grand-Étal, pour
 * revenir à l'Astrelier en rêvant).
 * Comme le reste du jeu : un premier toucher montre où mène l'objet (son étiquette), un second y va ; un appui long montre
 * seulement l'étiquette. Pendant un passage, les touchers (doigt, souris, clavier) sont ignorés.
 * Un passage dure 1,5 s au plus (bien moins avec les animations réduites : un fondu, et l'icône du moyen sur le voile).
 */
window.ORVANE = window.ORVANE || {};
(() => {
  const P = ORVANE.Proto = ORVANE.Proto || {};
  const I = () => P.Iles;
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const meme = (a, b) => !!a && !!b && a[0] === b[0] && a[1] === b[1];
  const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
  const attendre = ms => new Promise(r => setTimeout(r, ms));
  const S = 1.6;                    // l'échelle des dessins (proto/jeu.js : dessineDecor et dessineObjetVoyage à s = 1,6)

  // Les mots des moyens de voyage (étiquettes, carte, Lexique)
  const NOMS = { marche: "Bord de l'île", "passe-plat": "Passe-plat", "monte-plats": "Monte-plats", toboggan: "Toboggan", four: "Four banal", pelle: "Grande Pelle", sieste: "Sieste" };

  // ---------- Le monde : l'île où l'on est (en mémoire, et sauvée dans le profil) ----------
  function nouveauMonde() {
    const sv = P.Profil.monde() || {};
    const ile = I().existe(sv.ile) ? sv.ile : "fourneau";
    const m = { ile, position: sv.case ? sv.case.slice() : null, parIle: {} };
    // les groupes de l'île où l'on est (le tutoriel et les essais lisent monde.groupes)
    Object.defineProperty(m, "groupes", { get() { const s = this.parIle[this.ile]; return s ? (s.groupes || (s.groupes = [])) : []; }, enumerable: false });
    return m;
  }
  const lieu = () => P.Profil.monde() || { fours: {}, visitees: {} };
  const allume = o => !!o && (o.toujoursAllume || !!(lieu().fours || {})[o.id]);
  const niveau = () => (P.Profil.profil || {}).niveau || 1;

  // ---------- Sur l'île : les objets ----------
  // Le décor d'une case : un Four banal allumé ou éteint (le grand four du Fourneau est son Four banal)
  function decorPour(ileId) {
    const fours = {};
    I().ile(ileId).objets.filter(o => o.genre === "four").forEach(o => (fours[o.case.join(",")] = o));
    return (x, y, nom) => { const o = fours[x + "," + y]; return o ? (allume(o) ? "four-banal" : "four-banal-eteint") : nom; };
  }
  // Où un objet posé au bord, dans le vide, s'étend autour de sa case (pour cadrer l'île) : [x0, y0, x1, y1] en unités du monde
  function etendue(o) {
    if (o.genre === "toboggan") return [-84, -56, 60, 110];
    if (o.genre === "pelle") return [-30, -30, 120, 64];
    if (o.genre === "monte-plats") return o.sens === "descend" ? [-34, -50, 34, 40] : [-34, -64, 34, 26];
    return [-34, -46, 34, 22];
  }
  // Pose les objets de l'île : ceux du bord (dans le vide) sont dessinés ici, ceux de la carte le sont par le plateau ;
  // les sorties par le bord ont leur flèche dorée sur le sol, et une tête de pont au-delà
  function poser(scene) {
    const pl = scene.plateau, ile = scene.ile, sc = scene;
    scene.objetsVoyage = ile.objets.filter(o => o.genre !== "arrivee").map(o => {
      const r = { o, im: null, autres: [] }, p = P.iso(o.case[0], o.case[1]), z = 100 + (o.case[0] + o.case[1]) * 10 + 5;
      const image = (cle, dy) => { const inf = P.Textures.info(cle); if (!inf) return null; const im = pl.ajoute(sc.add.image(p.x, p.y + (dy || 3), cle).setOrigin(inf.ox, inf.oy).setScale(1 / inf.k).setDepth(z)); im.case = o.case.slice(); return im; };
      if (o.dans === "plein") r.im = pl.decorParCase[o.case.join(",")] || null;
      else if (o.genre === "monte-plats") {
        // en bas (le Fourneau), un mât et sa poulie : la corde monte ; en haut (la Penderie), un treuil au ras du sol : la corde descend
        r.cordes = image(o.sens === "descend" ? "voyage-treuil" : "voyage-monte-plats"); if (r.cordes) r.cordes.setDepth(z - 1);
        r.im = image("voyage-caisse-" + o.sens); r.caisse = r.im;
        if (r.im) pl.decors.push(r.im);
      } else if (o.genre === "toboggan" || o.genre === "pelle") {
        // à plat dans le vide : jamais transparents (l'artisan glisse ou monte dessus)
        r.im = image("voyage-" + o.genre);
        if (o.genre === "pelle" && niveau() < o.niveau) {
          const inf = P.Textures.info("voyage-cadenas");
          if (inf) r.cadenas = pl.ajoute(sc.add.image(p.x - 4, p.y + 4, "voyage-cadenas").setOrigin(inf.ox, inf.oy).setScale(1 / inf.k).setDepth(z + 1));
        }
      }
      return r;
    });
    dessinerFleches(scene);
  }
  // Les flèches dorées des sorties par le bord (à plat sur la case, pointées vers le vide), et la tête de pont au-delà :
  // deux ou trois dalles de lait d'étoiles de plus en plus transparentes
  function dessinerFleches(scene) {
    const pl = scene.plateau;
    if (scene.fleches) scene.fleches.destroy();
    if (scene.chevrons) scene.chevrons.destroy();
    const g = scene.fleches = pl.ajoute(scene.add.graphics()).setDepth(1.5);
    const c = scene.chevrons = pl.ajoute(scene.add.graphics()).setDepth(1.6);
    (scene.objetsVoyage || []).filter(r => r.o.genre === "marche").forEach(r => {
      const o = r.o, p = P.iso(o.case[0], o.case[1]), q = P.iso(o.case[0] + o.sens[0], o.case[1] + o.sens[1]);
      const dx = q.x - p.x, dy = q.y - p.y, n = Math.hypot(dx, dy), ux = dx / n, uy = dy / n, vx = -uy, vy = ux;
      // la tête de pont : des dalles de lait d'étoiles, de plus en plus transparentes, et leur flanc fin
      [.85, .5, .25].forEach((a, i) => {
        const cs = [o.case[0] + o.sens[0] * (i + 1), o.case[1] + o.sens[1] * (i + 1)], pc = P.iso(cs[0], cs[1]), l = 32 * (1 - i * .08), h = 16 * (1 - i * .08);
        g.fillStyle(0xD6CEBB, a * .8); g.fillPoints([{ x: pc.x - l, y: pc.y }, { x: pc.x, y: pc.y + h }, { x: pc.x + l, y: pc.y }, { x: pc.x + l, y: pc.y + 5 }, { x: pc.x, y: pc.y + h + 5 }, { x: pc.x - l, y: pc.y + 5 }], true);
        g.fillStyle(0xFBF8F0, a); g.fillPoints([{ x: pc.x, y: pc.y - h }, { x: pc.x + l, y: pc.y }, { x: pc.x, y: pc.y + h }, { x: pc.x - l, y: pc.y }], true);
        g.lineStyle(1, 0xC5A572, a * .8); g.strokePoints([{ x: pc.x, y: pc.y - h }, { x: pc.x + l, y: pc.y }, { x: pc.x, y: pc.y + h }, { x: pc.x - l, y: pc.y }], true, true);
        [[-.3, -.2, 0xC5A572], [.25, .1, 0xFFFFFF], [-.05, .35, 0xC5A572]].forEach(([a1, b1, col]) => { g.fillStyle(col, a); g.fillCircle(pc.x + a1 * l, pc.y + b1 * h, 1.6); });
      });
      // la case en or, puis deux chevrons (or soutenu, contour encre)
      pl.losange(o.case, { fill: 0xE4C98E, alpha: .38, stroke: 0xC5A572, strokeAlpha: .95, largeur: 2 }, g);
      [-8, 7].forEach(k => {
        const cx = p.x + ux * k, cy = p.y + uy * k, a = 10.8, b = 9;
        const pts = [{ x: cx + ux * a, y: cy + uy * a }, { x: cx - ux * 2.4 + vx * b, y: cy - uy * 2.4 + vy * b }, { x: cx - ux * 6 + vx * b, y: cy - uy * 6 + vy * b },
          { x: cx + ux * (a - 6), y: cy + uy * (a - 6) }, { x: cx - ux * 6 - vx * b, y: cy - uy * 6 - vy * b }, { x: cx - ux * 2.4 - vx * b, y: cy - uy * 2.4 - vy * b }];
        c.fillStyle(0xC5A572, 1); c.fillPoints(pts, true);
        c.lineStyle(2, 0x1D2725, .9); c.strokePoints(pts, true, true);
      });
    });
  }
  // Ce qui brille d'or attire l'œil quelques instants (après une arrivée, à chaque toucher) : les flèches pulsent, une petite
  // étoile scintille au-dessus des autres passages. Puis tout s'arrête (la boucle du jeu peut dormir). Rien en animations réduites.
  function animer(scene, fois) {
    if (!scene || !scene.plateau || P.reduit() || scene.enPassage) return;
    const n = fois || 2;
    if (scene.chevrons && !(scene.pulsation && scene.pulsation.isPlaying())) {
      scene.chevrons.setAlpha(1);
      scene.pulsation = scene.tweens.add({ targets: scene.chevrons, alpha: .45, duration: 800, yoyo: true, repeat: n - 1, ease: "Sine.InOut" });
    }
    (scene.objetsVoyage || []).filter(r => r.o.genre !== "marche" && r.o.genre !== "info").forEach((r, i) => {
      if (r.etincelle && r.etincelle.tw && r.etincelle.tw.isPlaying()) return;
      const pt = pointEtincelle(r);
      if (!pt || !scene.textures.exists("halo-pale")) return;
      if (!r.etincelle) {
        const e = scene.plateau.ajoute(scene.add.graphics()).setDepth(900000 - 5);
        e.fillStyle(0xFFF6D8, 1); e.fillPoints([{ x: 0, y: -6 }, { x: 1.4, y: -1.4 }, { x: 6, y: 0 }, { x: 1.4, y: 1.4 }, { x: 0, y: 6 }, { x: -1.4, y: 1.4 }, { x: -6, y: 0 }, { x: -1.4, y: -1.4 }], true);
        e.lineStyle(1, 0xC5A572, 1); e.strokePoints([{ x: 0, y: -6 }, { x: 1.4, y: -1.4 }, { x: 6, y: 0 }, { x: 1.4, y: 1.4 }, { x: 0, y: 6 }, { x: -1.4, y: 1.4 }, { x: -6, y: 0 }, { x: -1.4, y: -1.4 }], true, true);
        r.etincelle = { g: e };
      }
      const e = r.etincelle.g;
      e.setPosition(pt.x, pt.y).setAlpha(0).setScale(.4);
      r.etincelle.tw = scene.tweens.add({ targets: e, alpha: 1, scale: 1.1, duration: 500, yoyo: true, delay: 150 + i * 180, repeat: n - 1, repeatDelay: 700, ease: "Sine.InOut" });
    });
    P.reveil();
  }
  // le point où scintille l'étoile d'un passage : en haut de son dessin
  function pointEtincelle(r) {
    if (!r.im) return null;
    const b = (r.o.genre === "monte-plats" && r.cordes ? r.cordes : r.im).getBounds();
    if (r.o.genre === "toboggan" || r.o.genre === "pelle") { const p = P.iso(r.o.case[0], r.o.case[1]); return { x: p.x + (r.o.genre === "pelle" ? 30 : 22), y: p.y - 26 }; }
    return { x: b.centerX + 8, y: b.y + Math.min(18, b.height * .25) };
  }
  // L'objet sous le doigt : d'abord un dessin touché (là où il n'est pas transparent ; dans toute sa boîte pour un étal), le plus en
  // avant (la profondeur du dessin touché lui-même : les cordes d'un monte-plats sont derrière sa caisse) ; sinon la case touchée
  function pixel(scene, im, wx, wy) {
    if (!im || !im.visible || im.alpha < .05) return false;
    const b = im.getBounds();
    if (wx < b.x || wx > b.right || wy < b.y || wy > b.bottom) return false;
    const px = Math.floor((wx - im.x) / im.scaleX + im.displayOriginX), py = Math.floor((wy - im.y) / im.scaleY + im.displayOriginY);
    const a = scene.textures.getPixelAlpha(px, py, im.texture.key);
    return a != null && a > 40;
  }
  function profondeurTouchee(scene, r, w) {
    let z = -Infinity;
    if (r.o.touche === "boite" && r.im && r.im.visible) {
      const b = r.im.getBounds(), mx = b.width * .1;
      if (w.x > b.x + mx && w.x < b.right - mx && w.y > b.y && w.y < b.bottom - b.height * .1) z = r.im.depth;
    }
    [r.im, r.cordes].forEach(im => { if (im && pixel(scene, im, w.x, w.y)) z = Math.max(z, im.depth); });
    return z;
  }
  function objetSous(scene, t) {
    const l = scene.objetsVoyage || [], w = t.monde;
    let mieux = null, zm = -Infinity;
    l.forEach(r => { const z = profondeurTouchee(scene, r, w); if (z > zm) { zm = z; mieux = r; } });
    if (mieux) return mieux;
    return l.find(r => meme(r.o.case, t.caseSol)) || null;
  }
  const objetSurCase = (scene, c) => (scene.objetsVoyage || []).find(r => meme(r.o.case, c)) || null;
  // Les cases où les groupes ne se promènent pas (sorties, accès, arrivées)
  function reservee(scene, c) { return (scene.ile ? scene.ile.objets : []).some(o => meme(o.case, c) || meme(o.acces, c) || meme(o.arrivee, c)); }

  // ---------- Ce qu'on dit d'un objet ----------
  // titre et ligne : l'étiquette (deux lignes courtes) ; consigne : la phrase entière, en bas (lue par les lecteurs d'écran)
  function textes(o) {
    const d = I().destination(o), vers = d ? I().ile(d.ile) : null, n = niveau();
    switch (o.genre) {
      case "marche": return { titre: "Bord de l'île", ligne: "vers " + vers.le, consigne: `Bord de l'île : vers ${vers.le}. Touche encore la flèche pour y aller.` };
      case "passe-plat": return { titre: "Passe-plat", ligne: "vers " + vers.le, consigne: `Passe-plat : vers ${vers.le}. Touche-le encore pour y aller.` };
      case "monte-plats": {
        const v = o.sens === "monte" ? "monter " + vers.a : "descendre " + vers.a;
        return { titre: "Monte-plats", ligne: v, consigne: `Monte-plats : ${v}. Touche-le encore pour y aller.` };
      }
      case "toboggan": return { titre: "Toboggan (sens unique)", ligne: "glisser vers " + vers.le, consigne: `Toboggan : glisser vers ${vers.le}. Il ne se remonte pas. Touche-le encore pour glisser.` };
      case "pelle":
        if (n < o.niveau) return { titre: "Grande Pelle", ligne: `vers ${vers.le}, au niveau ${o.niveau}`, consigne: `Grande Pelle : vers ${vers.le}. Elle s'ouvre au niveau ${o.niveau}. Tu es au niveau ${n}.`, ferme: true };
        return { titre: "Grande Pelle (sens unique)", ligne: "vers " + vers.le, consigne: `Tu quittes l'Astrelier : tu pourras revenir en faisant la sieste. Touche encore la Grande Pelle pour partir.` };
      case "four": {
        const ile = I().ile(o.ile);
        return allume(o) ? { titre: "Four banal " + ile.de, ligne: "allumé : il mène aux autres fours", consigne: `Four banal ${ile.de}, allumé. Touche-le encore pour voir les fours où il mène.` }
          : { titre: "Four banal " + ile.de, ligne: "éteint : touche-le encore", consigne: `Four banal ${ile.de}, éteint. Touche-le encore : tu l'allumes en passant devant.` };
      }
      case "sieste": return { titre: "Lit de farine", ligne: "la Sieste : rentrer à l'Astrelier", consigne: "Lit de farine : fais la sieste pour revenir à l'Astrelier en rêvant. Touche-le encore pour t'y allonger." };
      default: return { titre: o.nom, ligne: o.court || o.dit, consigne: `${o.nom}. ${o.dit}` };
    }
  }
  const CONSIGNE = "Touche une case pour marcher, un groupe pour voir sa fiche. Ce qui brille d'or mène à une autre île.";
  const CONSIGNE_CALME = "Touche une case pour marcher. Ce qui brille d'or mène à une autre île.";
  function consigne(scene, texte) {
    const c = $("consigne-balade"); if (!c) return;
    let t = texte || (scene && scene.ile && scene.ile.zone ? CONSIGNE : CONSIGNE_CALME);
    if (P.typo) t = P.typo(t);
    if (c.textContent !== t) c.textContent = t;
    c.classList.toggle("apercu-voyage", !!texte);
  }

  // ---------- Toucher un objet : le premier toucher montre, le second y va ----------
  function toucher(scene, r) {
    if (scene.enPassage) return false;
    const o = r.o, a = scene.apercuVoyage;
    if (a && a.id === o.id) return agir(scene, r);
    // on change d'avis en marchant vers un autre passage : ce voyage-là est oublié (comme quand on touche une case)
    if (scene.ensuite) { scene.ensuite = null; scene.cible = null; }
    montrer(scene, r);
    return true;
  }
  function montrer(scene, r) {
    const o = r.o, pl = scene.plateau, t = textes(o);
    scene.apercuVoyage = { id: o.id, t: Date.now() };
    pl.effacer();
    // les groupes de monstres et l'artisan sont des obstacles : l'étiquette ne se pose pas sur eux
    pl.obstacles = (scene.tousLesPions ? scene.tousLesPions() : []).filter(p => p.c.visible).map(p => { const c = p.corps(); return { x: c.x0, y: c.y0 - 4, right: c.x1, bottom: c.y1 + 2 }; });
    if (scene.cible) pl.losange(scene.cible, { fill: 0xE4C98E, alpha: .35, stroke: 0xC5A572, largeur: 2 });
    if (o.genre !== "info") pl.losange(o.acces, { fill: 0xE4C98E, alpha: .4, stroke: 0xFFFDF7, strokeAlpha: .9, largeur: 2 });
    // l'étiquette, au-dessus du dessin de l'objet (ou de sa case), avec un petit bec qui le montre
    const p = P.iso(o.case[0], o.case[1]);
    let x = p.x, y = p.y - 26;
    if (r.im) { const b = r.im.getBounds(); y = Math.min(y, b.y - 4); }
    if (o.genre === "monte-plats") y = p.y - (o.sens === "descend" ? 44 : 70);
    if (o.genre === "toboggan") { x = p.x + 18; y = p.y - 28; }
    if (o.genre === "pelle") { x = p.x + 30; y = p.y - 18; }
    pl.etiquette(x, y, t.titre + "\n" + t.ligne, { taille: 13.5, couleur: t.ferme ? "#FFD2C6" : "#FFFDF7", bec: true });
    consigne(scene, t.consigne);
    P.reveil();
  }
  function annuler(scene) {
    if (!scene || !scene.apercuVoyage) return;
    scene.apercuVoyage = null;
    consigne(scene, null);
    if (scene.montrerCible) scene.montrerCible(scene.cible);
  }
  // Redessiner l'aperçu (après un zoom)
  function redessiner(scene) { const a = scene.apercuVoyage, r = a && (scene.objetsVoyage || []).find(x => x.o.id === a.id); if (r) montrer(scene, r); }
  function agir(scene, r) {
    const o = r.o;
    annuler(scene);
    if (o.genre === "info") { P.UI.toast(`${o.nom}. ${o.dit}`); return true; }
    if (o.genre === "pelle" && niveau() < o.niveau) {
      P.UI.toast(`La Grande Pelle s'ouvre au niveau ${o.niveau}. Tu es au niveau ${niveau()}.`, { genre: "refus" });
      return false;
    }
    return scene.allerPuis(o.acces, () => utiliser(scene, r));
  }
  function utiliser(scene, r) {
    const o = r.o;
    if (scene.fini || scene.enPassage) return;
    // une fenêtre s'est ouverte pendant la marche (la fin d'une quête…) : on ne la recouvre pas, il suffira de toucher encore
    if (o.genre === "four") {
      // on voit d'abord le four s'allumer ; son panneau s'ouvre ensuite (0,7 s après l'allumage), si l'artisan est toujours devant
      if (!allume(o)) allumer(scene, r);
      const reste = (r.allumeA || 0) + (P.reduit() ? 250 : 700) - Date.now();
      const ouvrir = () => { if (!scene.fini && !scene.enPassage && !scene.marche && P.Jeu.sceneActive === scene && meme(scene.moi.case, o.acces) && !P.UI.ouvert()) ouvrirFour(scene, r); };
      if (reste > 0) setTimeout(ouvrir, reste); else ouvrir();
      return;
    }
    if (o.genre === "sieste") { if (!P.UI.ouvert()) ouvrirSieste(scene, r); return; }
    if (P.UI.ouvert()) return;
    const d = I().destination(o);
    if (d) passage(scene, r, d, o.genre);
  }

  // ---------- Le Four banal ----------
  // le dessin du four (s = 1,6, posé 3 plus bas) : sa bouche, l'étoile de son enseigne, sa cheminée
  const BOUCHE = [12.8, -3.4], ETOILE = [-38.4, -48.2], CHEMINEE = [-9.6, -74];
  function allumer(scene, r) {
    const m = P.Profil.monde(); if (!m) return;
    m.fours = m.fours || {};
    if (m.fours[r.o.id]) return;
    m.fours[r.o.id] = true;
    r.allumeA = Date.now();
    P.Profil.sauver();
    scene.plateau.changerDecor(r.o.case, "four-banal");
    const p = P.iso(r.o.case[0], r.o.case[1]);
    if (!P.reduit()) {
      // une flamme jaillit de la bouche, l'étoile de l'enseigne s'allume, la fumée part
      const bx = p.x + BOUCHE[0], by = p.y + BOUCHE[1];
      if (scene.textures.exists("halo-chaud")) {
        const h = scene.plateau.ajoute(scene.add.image(bx, by, "halo-chaud").setBlendMode(Phaser.BlendModes.ADD).setDepth(950000).setScale(.3).setAlpha(.95));
        scene.tween({ targets: h, scale: 1.8, alpha: 0, duration: 800, ease: "Cubic.Out", onComplete: () => h.destroy() });
      }
      const inf = P.Textures.info("voyage-flamme");
      if (inf) {
        const f = scene.plateau.ajoute(scene.add.image(bx, by + 4, "voyage-flamme").setOrigin(inf.ox, inf.oy).setScale(0).setDepth(950001));
        scene.tween({ targets: f, scale: 1.25 / inf.k, duration: 220, ease: "Back.Out" }).then(() => scene.tween({ targets: f, scale: .7 / inf.k, alpha: 0, y: by - 6, duration: 520, ease: "Sine.In", onComplete: () => f.destroy() }));
      }
      if (scene.textures.exists("halo-pale")) {
        const e = scene.plateau.ajoute(scene.add.image(p.x + ETOILE[0], p.y + ETOILE[1], "halo-pale").setBlendMode(Phaser.BlendModes.ADD).setDepth(950000).setScale(.1).setAlpha(1));
        scene.tween({ targets: e, scale: .9, alpha: 0, duration: 650, delay: 120, ease: "Cubic.Out", onComplete: () => e.destroy() });
      }
      [0, 1, 2].forEach(i => {
        const g = scene.plateau.ajoute(scene.add.graphics()).setDepth(950000);
        g.fillStyle(0xF2EDE0, .8); g.fillCircle(0, 0, 4 + i);
        g.setPosition(p.x + CHEMINEE[0], p.y + CHEMINEE[1]).setAlpha(0);
        scene.tween({ targets: g, y: g.y - 26 - i * 6, x: g.x + 5 + i * 3, alpha: { from: .8, to: 0 }, scale: 1.8, duration: 900, delay: 160 + i * 170, onComplete: () => g.destroy() });
      });
    }
    P.UI.toast("Four banal allumé");
    if (P.Tour) P.Tour.signal("four-allume");
  }
  // Les fours d'un même réseau (l'Astrelier, ou Grand-Étal à part) : { o, ile, allume }
  function reseau(o) { return I().fours(I().ile(o.ile).monde).filter(f => f.id !== o.id).map(f => ({ o: f, ile: I().ile(f.ile), allume: allume(f) })); }
  function ouvrirFour(scene, r) {
    const o = r.o, ile = I().ile(o.ile), l = reseau(o), vis = lieu().visitees || {};
    let corps = `<p>Ce four est allumé. D'ici, tu voyages vers les autres Fours banals allumés.</p>`;
    if (!l.length) corps += `<p class="texte-doux">C'est le seul Four banal de ce côté du monde, pour l'instant. Les autres arrivent avec la suite du monde.${o.ile === "grand-etal" ? " Pour rentrer à l'Astrelier, fais la sieste sur le lit de farine." : ""}</p>`;
    else corps += `<ul class="voyages">${l.map(f => f.allume
      ? `<li><span><b>${esc(f.ile.nom)}</b><small>Four banal ${esc(f.ile.de)}</small></span><button type="button" class="bouton or" data-four="${f.o.id}">Partir</button></li>`
      : `<li class="eteint"><span><b>${esc(vis[f.ile.id] ? f.ile.nom : "Une île pas encore visitée")}</b><small>Éteint : passe devant pour l'allumer.</small></span></li>`).join("")}</ul>`;
    const c = P.UI.fenetre("d-fiche", "Four banal " + ile.de, corps, `<button type="button" class="bouton" data-fermer>Rester</button>`, { image: P.portraits.fourBanal });
    c.querySelectorAll("[data-four]").forEach(b => (b.onclick = () => {
      const f = I().objet(b.dataset.four);
      P.UI.fermer("d-fiche");
      passage(scene, r, { ile: f.ile, objet: f.id, case: f.arrivee.slice() }, "four");
    }));
  }
  // Depuis la carte : partir d'un four allumé, si l'on est devant
  function fourDevant(scene) {
    if (!scene || !scene.moi || !scene.objetsVoyage) return null;
    return scene.objetsVoyage.find(r => r.o.genre === "four" && allume(r.o) && cheb(scene.moi.case, r.o.case) <= 1) || null;
  }
  function partirDuFour(scene, idFour) {
    const r = fourDevant(scene), f = I().objet(idFour);
    if (!r || !f || !allume(f) || f.id === r.o.id) return false;
    passage(scene, r, { ile: f.ile, objet: f.id, case: f.arrivee.slice() }, "four");
    return true;
  }

  // ---------- La Sieste (Grand-Étal) : se réveiller à la Halle ou près d'un Four banal allumé de l'Astrelier ----------
  function ouvrirSieste(scene, r) {
    const l = I().fours("astrelier").filter(allume);
    const corps = `<p>Tu t'allonges sur le lit de farine. Tu fermes les yeux… et tu rêves de l'Astrelier.</p><p>Où veux-tu te réveiller ?</p>
      <ul class="voyages">${l.map(f => { const ile = I().ile(f.ile); return `<li><span><b>${esc(ile.nom)}</b><small>${f.ile === "halle" ? "La place de tous les débutants" : "Près du Four banal " + esc(ile.de)}</small></span><button type="button" class="bouton or" data-reve="${f.id}">Rêver</button></li>`; }).join("")}</ul>`;
    const c = P.UI.fenetre("d-fiche", "La Sieste", corps, `<button type="button" class="bouton" data-fermer>Rester éveillé</button>`, { image: P.portraits.lit });
    c.querySelectorAll("[data-reve]").forEach(b => (b.onclick = () => {
      const f = I().objet(b.dataset.reve);
      P.UI.fermer("d-fiche");
      passage(scene, r, { ile: f.ile, objet: f.id, case: f.arrivee.slice() }, "sieste");
    }));
  }

  // ---------- Le voile (il couvre l'écran entre deux îles et bloque les touchers) ----------
  // nuit (marcher, glisser, monter…), braise (le Four banal), rêve (la Sieste) ; animations réduites : l'icône du moyen au centre
  const VOILES = { four: "braise", sieste: "reve" };
  function voile(etat, genre, ms) {
    const v = $("voile"); if (!v) return Promise.resolve();
    v.style.setProperty("--t", (ms || 0) + "ms");
    if (etat === "pret") {
      v.className = "voile " + (VOILES[genre] || "nuit");
      const ic = v.querySelector(".voile-icone");
      if (ic) { ic.innerHTML = P.reduit() && P.Astrelier ? P.Astrelier.icone(genre === "marche" ? "marche" : genre, "#E4C98E", 64) : ""; }
      v.hidden = false; void v.offsetWidth; return Promise.resolve();
    }
    if (etat === "couvre") { v.hidden = false; void v.offsetWidth; v.classList.add("couvre"); return attendre(ms); }
    v.classList.remove("couvre");
    return attendre(ms).then(() => { if (!v.classList.contains("couvre")) v.hidden = true; });
  }
  // Pendant un passage, l'interface est inerte (doigt, souris et clavier) : ni Carte, ni Réglages, ni fenêtre
  function inerte(on) {
    ["bas-balade", "bandeau-balade", "tour-carte", "tuto-carte"].forEach(id => { const e = $(id); if (e) { if (on) e.setAttribute("inert", ""); else e.removeAttribute("inert"); } });
  }

  // ---------- Un passage : l'animation de départ, le voile, l'autre île, l'animation d'arrivée ----------
  async function passage(scene, r, dest, genre) {
    if (!scene || scene.enPassage || scene.fini || !dest) return false;
    const o = r.o, red = P.reduit(), J = P.Jeu;
    scene.enPassage = true; scene.cible = null; scene.ensuite = null;
    annuler(scene);
    inerte(true);
    // la vue ne glisse plus pendant le départ
    if (scene.vue && scene.vue.animation) { try { scene.vue.animation.stop(); } catch (e) { /* rien */ } }
    const pass = J.passage = { genre, de: scene.ileId, vers: dest.ile, debut: performance.now() };
    voile("pret", genre, 0);
    // la Voie lactée : traversée si l'on sort par l'autre bout que celui par lequel on est entré
    const m = P.Profil.monde();
    let traverse = false;
    if (scene.ileId === "voie-lactee" && o.genre === "marche" && m && m.entreeVL && m.entreeVL !== o.bout) traverse = true;
    try { await depart(scene, r, genre, red); } catch (e) { /* l'animation n'est qu'un décor */ }
    pass.depart = Math.round(performance.now() - pass.debut);
    await voile("couvre", genre, red ? 80 : 160);
    pass.couvert = Math.round(performance.now() - pass.debut);
    const arrivee = { genre, objet: dest.objet, case: dest.case.slice(), de: scene.ileId, traverse, depuis: o.id };
    if (m) {
      m.visitees = m.visitees || {};
      if (dest.ile === "voie-lactee" && o.genre === "marche") m.entreeVL = I().objet(dest.objet).bout; else delete m.entreeVL;
    }
    // l'étape de la quête est comptée en même temps que l'île est sauvée (recharger pendant l'arrivée ne la perd pas)
    if (P.Tour) { try { P.Tour.signal("passage", arrivee); } catch (e) { /* rien */ } }
    P.Profil.sauverLieu(dest.ile, dest.case);
    // la scène qui s'en va n'a plus rien à faire (ses minuteries liraient déjà les groupes de l'île d'arrivée)
    scene.arreter();
    J.monde.ile = dest.ile; J.monde.position = dest.case.slice();
    J.changerIle({ ile: dest.ile, arrivee });
    // garde-fou : si l'île d'arrivée ne s'ouvrait pas, le voile ne reste pas posé
    setTimeout(() => { if (J.passage === pass) { J.passage = null; voile("decouvre", genre, 0); inerte(false); const s = J.sceneActive; if (s) s.enPassage = false; } }, 6000);
    return true;
  }
  // Une courbe (4 points) du dessin, en unités du monde autour d'un point
  const courbe = (pts, p, dy) => pts.map(q => ({ x: p.x + q[0] * S, y: p.y + (dy == null ? 3 : dy) + q[1] * S }));
  function suivre(scene, cible, pts, ms, ease, o = {}) {
    const C = ORVANE.courbesVoyage, t = { k: 0 }, l = pts.map(q => [q.x, q.y]);
    return scene.tween({ targets: t, k: 1, duration: ms, ease, onUpdate: () => {
      const q = C.point(l, t.k); cible.setPosition(q[0], q[1]);
      if (o.alpha) cible.setAlpha(o.alpha(t.k));
      if (o.echelle) cible.setScale(o.echelle(t.k));
    } });
  }
  // L'animation de départ (0,65 s au plus) ; réduite : le personnage s'efface
  async function depart(scene, r, genre, red) {
    const moi = scene.moi, o = r.o, pc = P.iso(o.case[0], o.case[1]);
    if (red) { await scene.tween({ targets: moi.c, alpha: 0, duration: 90 }); return; }
    if (genre === "marche") {
      // il marche sur la tête de pont, puis s'efface dans le ciel
      const q = P.iso(o.case[0] + o.sens[0], o.case[1] + o.sens[1]);
      moi.orienter(q.x - moi.c.x < 0 ? -1 : 1);
      await scene.tween({ targets: moi.c, x: q.x, y: q.y, alpha: 0, duration: 360, ease: "Linear" });
    } else if (genre === "passe-plat") {
      // il rapetisse en allant vers le guichet (vers le haut) ; la sonnette tinte
      const g = { x: pc.x - 6.4, y: pc.y - 11.4 };
      eclat(scene, pc.x, pc.y - 2, .35); setTimeout(() => eclat(scene, pc.x, pc.y - 2, .3), 160);
      eclat(scene, g.x, g.y, .7);
      moi.orienter(g.x - moi.c.x < 0 ? -1 : 1);
      await scene.tween({ targets: moi.c, x: g.x, y: g.y + 8, scale: .3, alpha: 0, duration: 400, ease: "Cubic.In" });
    } else if (genre === "monte-plats") {
      // il entre dans la caisse, qui monte (au Fourneau) ou descend (à la Penderie) le long de ses cordes
      await scene.tween({ targets: moi.c, x: pc.x, y: pc.y - 6, duration: 110, ease: "Sine.Out" });
      const cibles = [moi.c].concat(r.caisse ? [r.caisse] : []);
      await scene.tween({ targets: cibles, y: (o.sens === "descend" ? "+=" : "-=") + 120, alpha: 0, duration: 270, ease: "Cubic.In" });
    } else if (genre === "toboggan") {
      // il s'assoit au haut de la crêpe et glisse le long de sa courbe, de plus en plus vite
      const pts = courbe(ORVANE.courbesVoyage.TOBOGGAN, pc);
      await scene.tween({ targets: moi.c, x: pts[0].x, y: pts[0].y - 2, duration: 80, ease: "Sine.Out" });
      moi.orienter(-1); moi.c.setDepth(r.im ? r.im.depth + 1 : moi.c.depth);
      await suivre(scene, moi.c, pts, 420, "Quad.In", { alpha: k => k < .8 ? 1 : 1 - (k - .8) * 5 });
    } else if (genre === "four") {
      // il entre dans la bouche du four, dans une lueur de braise
      const b = { x: pc.x + BOUCHE[0], y: pc.y + BOUCHE[1] };
      eclat(scene, b.x, b.y - 4, 1);
      moi.orienter(b.x - moi.c.x < 0 ? -1 : 1);
      await scene.tween({ targets: moi.c, x: b.x, y: b.y + 4, scale: .35, alpha: 0, duration: 420, ease: "Cubic.In" });
    } else if (genre === "pelle") {
      // il monte sur la palette ; la palette bascule et le lance en arc dans le vide, vers Grand-Étal
      const d0 = { x: pc.x + 4, y: pc.y }, but = { x: pc.x + 120, y: pc.y + 120 }, ctrl = { x: pc.x + 70, y: pc.y - 80 };
      if (moi.anneau) moi.anneau.setVisible(false);
      await scene.tween({ targets: moi.c, x: d0.x, y: d0.y, duration: 140, ease: "Sine.InOut" });
      farine(scene, d0.x, d0.y);
      if (r.im) scene.tween({ targets: r.im, angle: -10, duration: 120, ease: "Quad.Out", yoyo: true, hold: 120 });
      moi.c.setDepth(1000);
      const t = { k: 0 };
      await scene.tween({ targets: t, k: 1, duration: 420, ease: "Sine.In", onUpdate: () => {
        const u = 1 - t.k; moi.c.setPosition(u * u * d0.x + 2 * u * t.k * ctrl.x + t.k * t.k * but.x, u * u * d0.y + 2 * u * t.k * ctrl.y + t.k * t.k * but.y);
        moi.c.setAngle(t.k * 160).setAlpha(t.k < .7 ? 1 : 1 - (t.k - .7) / .3);
      } });
    } else if (genre === "sieste") {
      // il monte sur le lit, s'y couche sous la couverture ; des « z » montent
      const lit = { x: pc.x + 17, y: pc.y + 4 };
      if (moi.anneau) moi.anneau.setVisible(false);
      await scene.tween({ targets: moi.c, x: lit.x, y: lit.y, duration: 110, ease: "Sine.InOut" });
      moi.c.setDepth(r.im ? r.im.depth + 1 : moi.c.depth);
      await scene.tween({ targets: moi.c, angle: -58, scale: .92, duration: 110, ease: "Sine.Out" });
      const inf = P.Textures.info("voyage-couverture");
      if (inf) { const cv = scene.plateau.ajoute(scene.add.image(pc.x, pc.y + 3, "voyage-couverture").setOrigin(inf.ox, inf.oy).setScale(1 / inf.k).setDepth(moi.c.depth + 1).setAlpha(0)); scene.tween({ targets: cv, alpha: 1, duration: 120 }); }
      zzz(scene, pc.x - 14, pc.y - 16);
      await scene.tween({ targets: moi.c, alpha: .999, duration: 140 });
    } else await scene.tween({ targets: moi.c, alpha: 0, duration: 300 });
  }
  // L'arrivée, appelée par la scène d'exploration quand elle s'ouvre après un passage
  async function arriver(scene) {
    const a = scene.retour && scene.retour.arrivee; if (!a) return;
    const J = P.Jeu, red = P.reduit(), moi = scene.moi, genre = a.genre;
    scene.enPassage = true;
    if (J.passage) J.passage.ouverture = Math.round(performance.now() - J.passage.debut);
    const o = I().objet(a.objet), cible = { x: moi.c.x, y: moi.c.y }, z0 = moi.c.depth;
    const r = (scene.objetsVoyage || []).find(x => x.o.id === a.objet);
    moi.c.setAlpha(0);
    // la caisse du monte-plats arrive avec l'artisan (invisible avant, elle ne flotte pas seule)
    const p0 = o ? P.iso(o.case[0], o.case[1]) : null;
    if (r && r.caisse && genre === "monte-plats" && !red) { r.caisse.setAlpha(0); r.caisse.y += o.sens === "monte" ? -120 : 120; }
    const fin = voile("decouvre", genre, red ? 80 : 160);
    try {
      if (red) await scene.tween({ targets: moi.c, alpha: 1, duration: 90 });
      else if (genre === "marche" && o) {
        const q = P.iso(o.case[0] + o.sens[0], o.case[1] + o.sens[1]);
        moi.c.setPosition(q.x, q.y); moi.orienter(cible.x - q.x < 0 ? -1 : 1);
        await scene.tween({ targets: moi.c, x: cible.x, y: cible.y, alpha: 1, duration: 300, ease: "Linear" });
      } else if (genre === "passe-plat" && o) {
        // il ressort par le guichet du jumeau
        const g = { x: p0.x - 6.4, y: p0.y - 11.4 };
        moi.c.setPosition(g.x, g.y + 8).setScale(.3);
        eclat(scene, g.x, g.y, .7);
        moi.orienter(cible.x - g.x < 0 ? -1 : 1);
        await scene.tween({ targets: moi.c, x: cible.x, y: cible.y, scale: 1, alpha: 1, duration: 300, ease: "Cubic.Out" });
      } else if (genre === "monte-plats" && o) {
        const dy = o.sens === "monte" ? -120 : 120;
        const cibles = [moi.c].concat(r && r.caisse ? [r.caisse] : []);
        moi.c.setPosition(p0.x, p0.y - 6 + dy);
        await scene.tween({ targets: cibles, y: "-=" + dy, alpha: 1, duration: 210, ease: "Cubic.Out" });
        await scene.tween({ targets: moi.c, x: cible.x, y: cible.y, duration: 90 });
      } else if (genre === "toboggan") {
        // il descend du ciel le long de la crêpe du bas du toboggan, et finit dans la farine
        const bas = (scene.ile.objets || []).find(x => x.id === "moule-bas-toboggan");
        if (bas) {
          const pb = P.iso(bas.case[0], bas.case[1]), pts = courbe(ORVANE.courbesVoyage.BAS_TOBOGGAN, pb);
          moi.c.setPosition(pts[0].x, pts[0].y).setDepth(1000); moi.orienter(1);
          await suivre(scene, moi.c, pts, 250, "Quad.Out", { alpha: k => Math.min(1, k * 4) });
          await scene.tween({ targets: moi.c, x: cible.x, y: cible.y, duration: 70, ease: "Sine.Out" });
        } else {
          moi.c.setPosition(cible.x - 80, cible.y - 90);
          await scene.tween({ targets: moi.c, x: cible.x, y: cible.y, alpha: 1, duration: 300, ease: "Quad.Out" });
        }
        farine(scene, cible.x, cible.y);
      } else if (genre === "pelle") {
        moi.c.setPosition(cible.x, cible.y - 150);
        await scene.tween({ targets: moi.c, y: cible.y, alpha: 1, duration: 300, ease: "Quad.In" });
        farine(scene, cible.x, cible.y);
      } else if (genre === "four" && o) {
        // il sort de la bouche du four d'arrivée
        const b = { x: p0.x + BOUCHE[0], y: p0.y + BOUCHE[1] };
        moi.c.setPosition(b.x, b.y + 4).setScale(.35);
        eclat(scene, b.x, b.y - 4, .9);
        moi.orienter(cible.x - b.x < 0 ? -1 : 1);
        await scene.tween({ targets: moi.c, x: cible.x, y: cible.y, scale: 1, alpha: 1, duration: 320, ease: "Cubic.Out" });
      } else if (genre === "sieste") {
        // il se réveille : il apparaît, puis s'étire
        await scene.tween({ targets: moi.c, alpha: 1, duration: 120, ease: "Sine.Out" });
        await scene.tween({ targets: moi.c, scaleY: 1.08, scaleX: .95, duration: 90, yoyo: true, ease: "Sine.InOut" });
      } else await scene.tween({ targets: moi.c, alpha: 1, duration: 300, ease: "Sine.Out" });
    } catch (e) { /* rien */ }
    await fin;
    moi.c.setAlpha(1).setScale(1).setAngle(0).setPosition(cible.x, cible.y).setDepth(z0);
    if (r && r.caisse) { const p = P.iso(r.o.case[0], r.o.case[1]); r.caisse.setPosition(p.x, p.y + 3).setAlpha(1); }
    scene.enPassage = false;
    inerte(false);
    if (J.passage) { J.passage.fin = performance.now(); J.passage.duree = Math.round(J.passage.fin - J.passage.debut); J.dernierPassage = J.passage; J.passage = null; }
    const ile = scene.ile;
    titre(scene, genre === "sieste" ? `Tu te réveilles ${ile.a}` : ile.nom);
    apresPas(scene);
    if (P.Tour) P.Tour.signal("arrivee", a);
    // au clavier : le curseur revient sur sa case
    if (J.clavierActif && scene.moi) { scene.curseur = scene.moi.case.slice(); if (scene.dessinerCurseur) scene.dessinerCurseur(); }
    animer(scene, 2);
    P.reveil();
  }
  // Le nom de l'île, à l'arrivée : en haut ou au-dessus du panneau du bas, du côté où il ne cache pas l'artisan
  function titre(scene, texte) {
    const t = $("titre-ile");
    if (!t) { P.UI.toast(texte, { genre: "titre" }); return; }
    const r = P.UI.rectUtile(), e = scene.vue.versEcran(scene.moi.c.x, scene.moi.c.y - 30);
    const enHaut = e.y > r.y + r.h * .45;
    t.textContent = P.typo ? P.typo(texte) : texte;
    t.style.top = Math.round(enHaut ? r.y + 10 : r.y + r.h - 52) + "px";
    t.classList.remove("montre"); void t.offsetWidth; t.classList.add("montre");
    clearTimeout(titre.minuterie);
    titre.minuterie = setTimeout(() => t.classList.remove("montre"), 2600);
  }
  // Petits effets : une lueur dorée, un nuage de farine, des « z »
  function eclat(scene, x, y, k) {
    if (!scene.textures.exists("halo-chaud")) return;
    const h = scene.plateau.ajoute(scene.add.image(x, y, "halo-chaud").setBlendMode(Phaser.BlendModes.ADD).setDepth(950000).setScale(.2).setAlpha(.9));
    scene.tween({ targets: h, scale: 1.6 * (k || 1), alpha: 0, duration: 480, ease: "Cubic.Out", onComplete: () => h.destroy() });
  }
  function farine(scene, x, y) {
    if (P.reduit()) return;
    const g = scene.plateau.ajoute(scene.add.graphics()).setDepth(950000);
    g.fillStyle(0xFFFDF7, .9);
    [[-12, -2, 6], [0, -5, 8], [12, -1, 6], [-5, 3, 5], [7, 4, 5]].forEach(([a, b, r]) => g.fillCircle(a, b, r));
    g.setPosition(x, y);
    scene.tween({ targets: g, alpha: 0, scaleX: 1.5, scaleY: 1.2, duration: 420, onComplete: () => g.destroy() });
  }
  function zzz(scene, x, y) {
    ["z", "z", "Z"].forEach((t, i) => setTimeout(() => { if (scene.plateau && scene.sys && scene.sys.isActive()) scene.plateau.flotter(x + 10 + i * 8, y - i * 6, t, { couleur: "#E4C98E", taille: 14 + i * 3, duree: 700 }); }, i * 110));
  }

  // ---------- Après chaque pas : allumer les fours devant lesquels on passe ----------
  function apresPas(scene) {
    if (!scene || !scene.moi || !scene.moi.case) return;
    (scene.objetsVoyage || []).forEach(r => { if (r.o.genre === "four" && !allume(r.o) && cheb(scene.moi.case, r.o.case) <= 1) allumer(scene, r); });
  }

  // ---------- Le chemin vers une île : le premier objet à prendre d'ici (pour le tutoriel et la quête) ----------
  // Parcours en largeur sur les liaisons : la Grande Pelle seulement au bon niveau ; un Four banal mène aux autres fours allumés
  // de son monde s'il est allumé (ou s'il est sur l'île de départ : on l'allume en passant devant) ; la Sieste, de Grand-Étal vers
  // la Halle et les îles aux fours allumés de l'Astrelier
  function sortieVers(ileDepart, ileBut) {
    if (ileDepart === ileBut) return null;
    const liens = [];
    I().LISTE.forEach(id => I().ile(id).objets.forEach(o => {
      const d = I().destination(o);
      if (d && (o.genre !== "pelle" || niveau() >= o.niveau)) liens.push({ de: id, vers: d.ile, o });
      if (o.genre === "sieste") I().fours("astrelier").filter(allume).forEach(f => liens.push({ de: id, vers: f.ile, o }));
    }));
    I().fours().filter(a => allume(a) || a.ile === ileDepart).forEach(a => I().fours(I().ile(a.ile).monde).filter(b => b.id !== a.id && allume(b)).forEach(b => liens.push({ de: a.ile, vers: b.ile, o: a })));
    const prec = { [ileDepart]: null }, file = [ileDepart];
    while (file.length) {
      const i = file.shift();
      if (i === ileBut) break;
      liens.filter(l => l.de === i && !(l.vers in prec)).forEach(l => { prec[l.vers] = l; file.push(l.vers); });
    }
    if (!(ileBut in prec)) return null;
    let l = prec[ileBut];
    while (l && l.de !== ileDepart) l = prec[l.de];
    return l ? l.o : null;
  }

  P.Voyage = {
    NOMS, nouveauMonde, decorPour, poser, etendue, animer, objetSous, objetSurCase, reservee, toucher, montrer, annuler, redessiner, apresPas, arriver,
    passage, allume, ouvrirFour, fourDevant, partirDuFour, sortieVers, textes, consigne
  };
})();
