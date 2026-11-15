/*
 * Orvane, prototype : le démarrage (Phaser 3.90), les textures, les gestes (toucher, appui long, glisser, pincer, molette, clavier),
 * la mise en veille de la boucle quand rien ne bouge, et window.__orvane pour les essais automatiques.
 */
window.ORVANE = window.ORVANE || {};
(() => {
  const P = ORVANE.Proto = ORVANE.Proto || {};
  const UI = () => P.UI;
  P.reglages = P.Profil.reglages;
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  P.dpr = DPR;
  P.portraits = {};
  P.portraitDe = c => {
    if (!c) return "";
    if (c.id === "moi") return P.portraits.moi || "";
    if (c.genre === "monstre") return P.portraits[c.fiche] || P.portraits.grumeau || "";
    if (c.genre === "commis") return P.portraits.commis || "";
    if (c.genre === "artisan") return P.portraits["classe-" + c.classe] || P.portraits.moi || "";
    return P.portraits.ustensile || "";
  };

  const Jeu = P.Jeu = { game: null, sceneActive: null, monde: null, clavierActif: false, images: 0, depart: 0, occupe: 0 };

  // ---------- Veille : la boucle s'arrête quand rien ne bouge, repart au moindre changement ----------
  let calme = 0;
  P.reveil = () => {
    calme = 0;
    const g = Jeu.game;
    if (g && g.loop && !g.loop.running && g.isBooted) { g.loop.resetDelta(); g.loop.wake(); }
  };
  function occupe() {
    if (Jeu.occupe > 0 || gestes.actif) return true;
    // toute animation en cours ou en attente (un délai compte aussi) garde la boucle éveillée
    return Jeu.game.scene.getScenes(true).some(s => s.tweens && s.tweens.getTweens().length > 0);
  }

  // ---------- Textures (dessins SVG rendus à 4 pixels par unité) ----------
  const S_PERSO = 1.5, S_MONSTRE = 1.68;
  class SceneDemarrage extends Phaser.Scene {
    constructor() { super("demarrage"); }
    create() { Jeu.preparerTextures(this).then(() => Jeu.pret()).catch(e => { console.error(e); document.getElementById("chargement").textContent = "Le jeu n'a pas pu démarrer."; }); }
  }
  Jeu.preparerTextures = async function (scene) {
    const T = P.Textures, F = ORVANE.Monstres.FICHES, l = [];
    const dessinMonstre = id => {
      const s = S_MONSTRE * ((F[id] && F[id].taille) || 1);
      if (id === "mie-tron") return g => ORVANE.dessineMietron(g, { s });
      if (id === "grumeau-chef") return g => ORVANE.dessineGrumeauChef(g, { s: s / 1.37 });
      return g => ORVANE.dessineGrumeau(g, { s });
    };
    Object.keys(F).forEach(id => {
      l.push(T.svg(scene, "monstre-" + id, dessinMonstre(id)));
      l.push(T.portrait(dessinMonstre(id), 96, .95).then(u => (P.portraits[id] = u)));
    });
    l.push(T.svg(scene, "commis", g => ORVANE.dessineCommis(g, { s: S_MONSTRE })));
    l.push(T.portrait(g => ORVANE.dessineCommis(g, { s: 2 }), 96, .95).then(u => (P.portraits.commis = u)));
    ["four", "billot", "caisse", "lanterne"].forEach(n => l.push(T.svg(scene, "decor-" + n, g => ORVANE.dessineDecor(g, n, { s: 1.6 }))));
    // les îles de l'Astrelier (proto/iles.js) : leurs décors, et les objets de voyage posés au bord (proto/voyage.js)
    ["four-banal", "four-banal-eteint", "passe-plat", "etal-pain", "etal-lait", "etal-outils", "tringle", "portant", "armoire", "moule-kouglof", "moule-tarte",
      "porte-moule", "pancarte", "bidon", "lit", "bas-toboggan", "pilier", "pilier-enseigne", "sacs"].forEach(n => l.push(T.svg(scene, "decor-" + n, g => ORVANE.dessineDecor(g, n, { s: 1.6 }))));
    ["monte-plats", "treuil", "caisse-monte", "caisse-descend", "toboggan", "pelle", "cadenas", "couverture", "flamme"].forEach(n => l.push(T.svg(scene, "voyage-" + n, g => ORVANE.dessineObjetVoyage(g, n, { s: 1.6 }))));
    l.push(T.portrait(g => ORVANE.dessineDecor(g, "four-banal", { s: 2 }), 96, .9).then(u => (P.portraits.fourBanal = u)));
    l.push(T.portrait(g => ORVANE.dessineDecor(g, "lit", { s: 2 }), 96, 1).then(u => (P.portraits.lit = u)));
    ["fournee", "piege", "graine", "ustensile"].forEach(q => l.push(T.svg(scene, "objet-" + q, g => ORVANE.dessineObjetSol(g, q, { s: 1.5 }))));
    l.push(T.portrait(g => ORVANE.dessineObjetSol(g, "ustensile", { s: 2 }), 96, 1).then(u => (P.portraits.ustensile = u)));
    // le tutoriel : Mère Fournil et le Grumeau d'entraînement
    if (P.Tuto) l.push(P.Tuto.preparerTextures(scene));
    const I = P.ICONES;
    ["brule", "ramolli", "enracine", "plante", "glissant", "derobe", "nappe", "fume", "attendri", "affine", "feve", "maree-haute", "maree-basse", "toque", "toqueRenversee", "tablier", "pain"]
      .forEach(n => l.push(T.icone(scene, "ic-" + n, I[n], 64)));
    await Promise.all(l);
  };
  Jeu.preparerPerso = async function () {
    const p = P.Profil.profil, c = P.Profil.classe(p.classe), o = { peau: p.peau, poils: p.poils, sexe: p.sexe };
    await P.Textures.svg({ textures: Jeu.game.textures }, "perso-moi", g => ORVANE.dessinePerso(g, c, Object.assign({ s: S_PERSO }, o)));
    P.portraits.moi = await P.Textures.portrait(g => ORVANE.dessinePerso(g, c, Object.assign({ s: 2 }, o)), 96, .62);
  };

  // ---------- Parcours : création → exploration ⇄ combat → Addition ----------
  Jeu.pret = function () {
    document.getElementById("chargement").hidden = true;
    UI().creation((choix, nouveau) => Jeu.entrer(choix, nouveau));
    Jeu.etape = "creation";
  };
  Jeu.entrer = async function (choix, nouveau, o = {}) {
    const neuf = nouveau || !P.Profil.profil;
    if (neuf) { P.Profil.nouveau(choix); Jeu.monde = null; }
    // le tutoriel reprend où il en était (un combat, lui, ne survit pas au rechargement)
    if (P.Tuto) P.Tuto.entrer();
    // essais automatiques : les points d'un artisan de niveau > 1 sont placés pour lui (« Répartir pour moi »), sauf demande contraire
    if (neuf && o.repartir) P.Profil.validerCarac(P.Profil.repartirPourMoi());
    await Jeu.preparerPerso();
    Jeu.etape = "jeu";
    UI().mode("vide");
    const g = Jeu.game;
    ["combat", "balade"].forEach(k => { if (g.scene.isActive(k)) g.scene.stop(k); });
    g.scene.start("balade", {});
    P.reveil();
    // un nouvel artisan : « Suivre le tutoriel ? » (Mère Fournil) ; s'il commence au-dessus du niveau 1 et ne suit pas le tutoriel,
    // ses points ne sont pas répartis : on le lui propose (le tutoriel, lui, les fait placer à l'étape 8)
    const repartition = () => !o.repartir && !o.silence && P.Profil.pointsRestants() > 0;
    const quand = (fn, essais = 0) => { if (Jeu.nomScene() === "balade" && !UI().ouvert()) fn(); else if (essais < 12) setTimeout(() => quand(fn, essais + 1), 250); };
    if (neuf && P.Tuto && !o.silence && !o.sansTuto) setTimeout(() => quand(() => P.Tuto.proposer(suit => { if (!suit && repartition()) setTimeout(() => quand(() => UI().proposerRepartition()), 300); })), 350);
    else if (neuf && repartition()) setTimeout(() => quand(() => UI().proposerRepartition()), 350);
    // au retour : une question restée sans réponse (le jeu fermé avant) revient
    else if (!neuf && P.Tuto && P.Tuto.reprendre && !o.silence) setTimeout(() => quand(() => P.Tuto.reprendre()), 350);
  };
  Jeu.lancerCombat = function (indice, groupe, arrivage) {
    const g = Jeu.game;
    UI().fermer("d-fiche");
    g.scene.stop("balade");
    g.scene.start("combat", { groupe, indice, ile: Jeu.monde ? Jeu.monde.ile : "fourneau", arrivage: arrivage || 0, graine: (Date.now() % 100000) + indice * 7, depart: Jeu.depart++ % 3 });
    P.reveil();
  };
  // Passer d'une île à l'autre (proto/voyage.js) : la scène d'exploration repart sur l'autre île
  Jeu.changerIle = function (d) {
    const s = Jeu.game.scene.getScene("balade");
    if (!s) return;
    s.scene.restart(d);
    P.reveil();
  };
  // L'île où l'on est, pour les textes (« Retour au Fourneau », « La Voie lactée est à toi »…)
  Jeu.ile = () => (P.Iles && P.Iles.ile((Jeu.monde && Jeu.monde.ile) || "fourneau")) || { nom: "Le Fourneau", a: "au Fourneau", sur: "sur le Fourneau" };
  // Retour en exploration : après l'Addition, ou en renonçant pendant la Mise en place (le groupe reste là)
  Jeu.retourBalade = function (o) {
    const g = Jeu.game, s = Jeu.sceneActive;
    if (P.Tuto) P.Tuto.signal("retour", { tuto: !!(s && s.tuto), victoire: !!o.victoire, renonce: !!o.renonce });
    ["d-fiche", "d-reglages", "d-addition"].forEach(id => UI().fermer(id));
    UI().minuteur.arreter();
    g.scene.stop("combat");
    g.scene.start("balade", { vaincu: o.victoire ? o.indice : null, defaite: !o.victoire && !o.renonce });
    P.reveil();
  };
  Jeu.recadrer = function () {
    requestAnimationFrame(() => { const s = Jeu.sceneActive; if (s && s.sys && s.sys.isActive() && s.cadrer) s.cadrer(); });
  };
  Jeu.nomScene = function () {
    if (Jeu.etape !== "jeu") return Jeu.etape || "chargement";
    if (document.getElementById("d-addition").open) return "addition";
    const s = Jeu.sceneActive;
    if (!s || !s.sys || !s.sys.isActive()) return "chargement";
    if (s.sys.settings.key === "combat") return s.phase === "placement" ? "placement" : "combat";
    return s.sys.settings.key;
  };

  // ---------- Gestes sur le terrain ----------
  const gestes = { actif: false };
  function brancherGestes(canvas) {
    const pts = new Map();
    let g = null, minuterieLong = null;
    const scene = () => { const s = Jeu.sceneActive; return s && s.sys && s.sys.isActive() ? s : null; };
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y), milieu = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
    canvas.addEventListener("pointerdown", e => {
      // un toucher ou un clic n'est pas une navigation au clavier : pas de curseur clavier
      if (Jeu.clavierActif) { Jeu.clavierActif = false; const s = scene(); if (s && s.dessinerCurseur) s.dessinerCurseur(); }
      if (e.pointerType === "mouse" && e.button !== 0) return;
      try { canvas.setPointerCapture(e.pointerId); } catch (x) { /* rien */ }
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      gestes.actif = true; P.reveil();
      if (pts.size === 1) {
        g = { type: "toucher", x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY };
        clearTimeout(minuterieLong);
        minuterieLong = setTimeout(() => { if (g && g.type === "toucher") { g.type = "long"; const s = scene(); if (s && s.appuiLong) s.appuiLong(g.x0, g.y0); } }, 520);
      } else if (pts.size === 2) {
        clearTimeout(minuterieLong);
        const [a, b] = [...pts.values()], s = scene();
        g = { type: "pincer", d0: Math.max(10, dist(a, b)), z0: s ? s.vue.Z : 1, m: milieu(a, b) };
      }
    });
    canvas.addEventListener("pointermove", e => {
      // souris sans bouton : l'aperçu suit le pointeur (le clic valide)
      if (e.pointerType === "mouse" && !pts.size) { const s = scene(); if (s && s.survol && !UI().ouvert()) s.survol(e.clientX, e.clientY); return; }
      const p = pts.get(e.pointerId); if (!p || !g) return;
      const s = scene();
      const dx = e.clientX - p.x, dy = e.clientY - p.y;
      p.x = e.clientX; p.y = e.clientY;
      if (g.type === "toucher" && Math.hypot(e.clientX - g.x0, e.clientY - g.y0) > 9) { g.type = "glisser"; clearTimeout(minuterieLong); }
      if (!s) return;
      if (g.type === "glisser") s.vue.deplacer(dx, dy);
      else if (g.type === "pincer" && pts.size >= 2) {
        const [a, b] = [...pts.values()], m = milieu(a, b);
        s.vue.setZ(g.z0 * dist(a, b) / g.d0, m);
        s.vue.deplacer(m.x - g.m.x, m.y - g.m.y); g.m = m;
      }
    });
    const fin = e => {
      if (!pts.has(e.pointerId)) return;
      pts.delete(e.pointerId);
      clearTimeout(minuterieLong);
      if (g && g.type === "toucher" && pts.size === 0 && e.type === "pointerup") { const s = scene(); if (s && s.toucher) s.toucher(e.clientX, e.clientY, e.pointerType); }
      if (g && g.type === "pincer" && pts.size === 1) g = { type: "glisser" };
      if (pts.size === 0) { g = null; gestes.actif = false; }
      P.reveil();
    };
    canvas.addEventListener("pointerup", fin);
    canvas.addEventListener("pointercancel", fin);
    canvas.addEventListener("contextmenu", e => { e.preventDefault(); const s = scene(); if (s && s.appuiLong) s.appuiLong(e.clientX, e.clientY); });
    canvas.addEventListener("wheel", e => { e.preventDefault(); const s = scene(); if (s) s.vue.setZ(s.vue.Z * (e.deltaY < 0 ? 1.12 : 1 / 1.12), { x: e.clientX, y: e.clientY }); }, { passive: false });
    // Clavier : flèches = curseur, Entrée = toucher, Échap = annuler, C = recentrer, + et − = zoom
    canvas.tabIndex = 0;
    canvas.setAttribute("role", "application");
    canvas.setAttribute("aria-label", "Le terrain. Flèches pour passer d'une case à sa voisine (haut : vers le haut à droite, droite : vers le bas à droite, bas : vers le bas à gauche, gauche : vers le haut à gauche), Entrée pour la toucher, Échap pour annuler, C pour recentrer, + et − pour zoomer.");
    // La case où le curseur clavier commence : la sienne (exploration ou combat), sinon une case dorée (Mise en place), sinon une case de sol
    const caseDepart = s => {
      try {
        if (s.moi && s.moi.case) return s.moi.case.slice();
        const m = typeof s.moi === "function" ? s.moi() : null;
        if (m && m.case) return m.case.slice();
        const e = s.etat, dep = e && e.carte && e.carte.departs[e.depart];
        if (dep && dep.artisans && dep.artisans[0]) return dep.artisans[0].slice();
        const sol = s.plateau && s.plateau.cases().find(c => s.plateau.sol(c[0], c[1]));
        if (sol) return sol.slice();
      } catch (err) { /* rien */ }
      return null;
    };
    const montrerCurseur = () => { Jeu.clavierActif = true; const s = scene(); if (s) { if (!s.curseur) s.curseur = caseDepart(s); s.dessinerCurseur && s.dessinerCurseur(); P.reveil(); } };
    canvas.addEventListener("focus", () => { let vis = false; try { vis = canvas.matches(":focus-visible"); } catch (e) { vis = false; } if (vis) montrerCurseur(); });
    canvas.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") { const s = scene(); if (s && s.finSurvol) s.finSurvol(); } });
    canvas.addEventListener("blur", () => { Jeu.clavierActif = false; const s = scene(); if (s && s.dessinerCurseur) s.dessinerCurseur(); P.reveil(); });
    canvas.addEventListener("keydown", e => {
      const s = scene(); if (!s) return;
      if (!Jeu.clavierActif && /^Arrow|^Enter$|^ $/.test(e.key)) montrerCurseur();
      // Chaque flèche mène à une case voisine de la grille (toutes les cases sont atteignables, un Pas = une flèche) ;
      // sur l'écran, haut monte (vers la droite), droite va à droite (en descendant), bas descend (vers la gauche), gauche va à gauche (en montant)
      const d = { ArrowUp: [0, -1], ArrowRight: [1, 0], ArrowDown: [0, 1], ArrowLeft: [-1, 0] }[e.key];
      if (d) {
        e.preventDefault();
        // une nouvelle scène (combat, retour au Fourneau) n'a pas encore de curseur : il part de sa propre case
        if (!s.curseur || !(s.plateau.existe(s.curseur[0], s.curseur[1]) || (s.caseObjet && s.caseObjet(s.curseur)))) s.curseur = caseDepart(s);
        if (!s.curseur) return;
        const c = s.curseur, n = [c[0] + d[0], c[1] + d[1]];
        // une case de l'île, ou un objet posé au bord (monte-plats, toboggan, Grande Pelle)
        if (s.plateau.existe(n[0], n[1]) || (s.caseObjet && s.caseObjet(n))) s.curseur = n;
        s.dessinerCurseur && s.dessinerCurseur();
        const w = P.iso(s.curseur[0], s.curseur[1]), ec = s.vue.versEcran(w.x, w.y), r = UI().rectUtile();
        if (ec.x < 20 || ec.x > r.w - 20 || ec.y < r.y + 20 || ec.y > r.y + r.h - 20) s.centrerSurCase(s.curseur, true);
        P.reveil();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (s.curseur) s.toucherCaseClavier(s.curseur);
        else { s.curseur = caseDepart(s); if (s.dessinerCurseur) s.dessinerCurseur(); P.reveil(); }
      }
      else if (e.key === "c" || e.key === "C") { e.preventDefault(); s.doubleToucher && s.doubleToucher(); }
      else if (e.key === "i" || e.key === "I") { e.preventDefault(); s.ficheSousCurseur && s.ficheSousCurseur(); }
      else if (e.key === "+" || e.key === "=") { e.preventDefault(); s.vue.setZ(s.vue.Z * 1.15); }
      else if (e.key === "-") { e.preventDefault(); s.vue.setZ(s.vue.Z / 1.15); }
    });
  }
  // Raccourcis hors du terrain : 1 à 9 = sorts, P = Pain de route, Échap = annuler
  document.addEventListener("keydown", e => {
    const s = Jeu.sceneActive;
    if (!s || !s.sys || !s.sys.isActive() || UI().ouvert()) return;
    if (/^(INPUT|SELECT|TEXTAREA)$/.test((e.target && e.target.tagName) || "")) return;
    if (s.sys.settings.key === "combat") {
      if (/^[1-9]$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const b = document.querySelectorAll("#grille-sorts .sort")[+e.key - 1];
        if (b) { e.preventDefault(); b.click(); }
      } else if ((e.key === "p" || e.key === "P") && !e.ctrlKey && !e.metaKey) { e.preventDefault(); document.getElementById("b-pain").click(); }
      else if (e.key === "Escape") { s.annuler && s.annuler(); }
    } else if (s.sys.settings.key === "balade" && e.key === "Escape" && s.annulerApercu) s.annulerApercu();
  });

  // ---------- Boutons fixes de l'interface ----------
  function brancherBoutons() {
    const $ = id => document.getElementById(id);
    // pendant un passage d'une île à l'autre, aucun bouton n'ouvre de fenêtre (au doigt, à la souris ni au clavier)
    const libre = fn => (...a) => { const s = Jeu.sceneActive; if (Jeu.passage || (s && s.enPassage)) return; fn(...a); };
    $("b-grimoire").innerHTML = P.icone("livre", "currentColor", 20).replace('width="20"', 'width="20" style="color:inherit"') + "Grimoire";
    $("b-reglages-combat").innerHTML = P.icone("reglages", "currentColor", 22);
    $("ic-cm").innerHTML = P.icone("cm", null, 15); $("ic-pas").innerHTML = P.icone("pas", null, 15);
    $("b-grimoire").onclick = libre(() => UI().grimoire({ enCombat: false }));
    $("b-carac").onclick = libre(() => UI().caracteristiques({ enCombat: false }));
    $("b-lexique").onclick = libre(() => UI().lexique());
    // la carte de l'Astrelier (proto/astrelier.js)
    if ($("b-carte")) $("b-carte").onclick = libre(() => { if (P.Astrelier) P.Astrelier.ouvrirCarte(); });
    $("b-perso").onclick = libre(() => {
      const p = P.Profil.profil, c = P.Profil.classe(p.classe), def = P.Profil.artisan(), d = ORVANE.Regles.deriverArtisan(def);
      const corps = `<p class="ambiance">${UI().esc(c.jeu)} ${UI().esc(c.meca[0])} : ${UI().esc(c.meca[1])}</p>
        <dl class="carac"><dt>Niveau</dt><dd>${p.niveau} (${p.xp} XP)</dd><dt>Blé</dt><dd>${p.ble}</dd><dt>Victuailles</dt><dd>${d.victuailles}</dd><dt>Coups de main</dt><dd>${d.cm} CM</dd><dt>Pas</dt><dd>${d.pas}</dd>
        <dt>Ouverture</dt><dd>${d.ouverture}</dd><dt>Rideau · Faux-fuyant</dt><dd>${d.rideau} · ${d.fauxFuyant}</dd>${Object.keys(d.affinites).filter(k => d.affinites[k]).map(k => `<dt>${UI().nomElement(k)}</dt><dd>${d.affinites[k]} (+${d.affinites[k]} % de dégâts)</dd>`).join("")}
        <dt>Combats gagnés</dt><dd>${p.victoires} sur ${p.combats}</dd></dl>
        <p><b>Sac :</b> ${Object.keys(p.sac).map(k => `${UI().esc((p.noms && p.noms[k]) || (k === "sac.pain-de-route" ? "Pain de route" : k))} ×${p.sac[k]}` + (k === "sac.pain-de-route" ? ` (${ORVANE.Regles.CONST.PAIN_DE_ROUTE.parCombat} à chaque combat${P.Profil.reservePains() ? `, ${P.Profil.reservePains()} en réserve` : ""})` : "")).join(", ") || "vide"}</p>
        <p class="texte-doux">${P.Profil.pointsRestants() ? `Il te reste <b>${P.Profil.pointsRestants()} points de caractéristique</b> à placer.` : "Tous tes points de caractéristique sont placés."}</p>`;
      const f = UI().fenetre("d-fiche", `${p.nom} · ${p.sexe === "f" ? c.fem : c.nom}`, corps, `<button type="button" class="bouton or" id="fiche-carac">Caractéristiques</button>`, { image: P.portraits.moi });
      f.querySelector("#fiche-carac").onclick = () => { UI().fermer("d-fiche"); UI().caracteristiques({ enCombat: false }); };
    });
    $("b-reglages").onclick = libre(() => UI().reglages({ enCombat: false, surNouveau: () => { if (Jeu.passage) return; Jeu.game.scene.stop("balade"); Jeu.sceneActive = null; Jeu.etape = "creation"; UI().creation((c, n) => Jeu.entrer(c, n)); } }));
    $("b-reglages-combat").onclick = () => {
      const s = Jeu.sceneActive;
      UI().reglages({
        enCombat: true, miseEnPlace: !!(s && s.phase === "placement"), minuteurImpose: !!(s && s.minuteurImpose && s.minuteurImpose()), minuteurCoupe: !!(s && s.tuto),
        surMinuteur: on => { if (s && s.reglerMinuteur) s.reglerMinuteur(on); },
        surAbandon: () => { if (s && s.abandonner) s.abandonner(); },
        surRenoncer: () => { if (s && s.renoncer) s.renoncer(); }
      });
    };
    $("fin-tour").onclick = () => { const s = Jeu.sceneActive; if (s && s.finDuTour) s.finDuTour(); };
    // « Accélérer » (×2) pendant les tours des monstres : retenu dans les réglages, effet immédiat
    $("b-accelere").onclick = () => {
      const r = P.Profil.reglages; r.accelere = !r.accelere; P.Profil.sauver();
      UI().accelere(true);
      UI().message(r.accelere ? "Tours des monstres accélérés (×2)" : "Tours des monstres à vitesse normale");
    };
    // la Manche replie ou déplie la frise ; la Commande se rappelle d'un toucher
    $("manche").onclick = () => UI().replierFrise();
    $("commande-b").onclick = () => { const t = $("commande-b").dataset.texte; if (t) UI().toast(t); };
  }

  // ---------- Démarrage ----------
  async function demarrer() {
    try {
      await Promise.race([
        Promise.all([document.fonts.load('700 16px "Atkinson Hyperlegible"'), document.fonts.load('400 16px "Atkinson Hyperlegible"'), document.fonts.load('800 20px "Bricolage Grotesque"')]),
        new Promise(r => setTimeout(r, 1800))
      ]);
    } catch (e) { /* polices de secours */ }
    brancherBoutons();
    const w = window.innerWidth, h = window.innerHeight;
    const game = Jeu.game = new Phaser.Game({
      type: Phaser.AUTO, parent: "terrain", transparent: true, banner: false,
      scale: { mode: Phaser.Scale.NONE, width: Math.round(w * DPR), height: Math.round(h * DPR), zoom: 1 / DPR },
      fps: { target: 30, limit: 30 },
      render: { antialias: true, powerPreference: "low-power", roundPixels: false },
      input: { keyboard: false, mouse: false, touch: false, gamepad: false },
      disableContextMenu: true,
      scene: [SceneDemarrage, P.SceneBalade, P.SceneCombat]
    });
    game.events.once("ready", () => brancherGestes(game.canvas));
    game.events.on("postrender", () => {
      Jeu.images++;
      if (occupe()) { calme = 0; return; }
      if (++calme >= 3) game.loop.sleep();
    });
    let attente = null;
    window.addEventListener("resize", () => {
      clearTimeout(attente);
      attente = setTimeout(() => {
        const W = window.innerWidth, H = window.innerHeight;
        game.scale.resize(Math.round(W * DPR), Math.round(H * DPR));
        game.scale.setZoom(1 / DPR);
        P.reveil();
      }, 80);
    });
  }

  // ---------- Pour les essais automatiques ----------
  const sceneDe = cle => { const s = Jeu.sceneActive; return s && s.sys && s.sys.isActive() && s.sys.settings.key === cle ? s : null; };
  function calmeJeu() {
    const s = Jeu.sceneActive, n = Jeu.nomScene();
    if (n === "creation" || n === "addition") return true;
    if (!s || !s.sys || !s.sys.isActive()) return false;
    if (s.sys.settings.key === "balade") return !s.marche && !s.marcheDifferee && !s.enPassage && !Jeu.passage;
    if (s.sys.settings.key === "combat") return s.anime === 0 && !s.validationDifferee && (s.phase === "joueur" || s.phase === "placement" || (s.termine && document.getElementById("d-addition").open));
    return true;
  }
  const patienter = (t) => new Promise((res, rej) => {
    const t0 = Date.now(), f = () => { if (calmeJeu()) return res(Jeu.nomScene()); if (Date.now() - t0 > (t || 90000)) return rej(new Error("Le jeu ne s'est pas calmé (" + Jeu.nomScene() + ")")); setTimeout(f, 40); };
    setTimeout(f, 30);
  });
  window.__orvane = {
    get etat() { const s = sceneDe("combat"); return s ? s.etat : null; },
    get scene() { return Jeu.nomScene(); },
    get profil() { return P.Profil.profil; },
    get images() { return Jeu.images; },
    get boucleActive() { return !!(Jeu.game && Jeu.game.loop.running); },
    regles: () => ORVANE.Regles,
    attendre: patienter,
    async creer(o = {}) {
      if (Jeu.etape !== "creation") throw new Error("Pas sur l'écran de création");
      const p = P.Profil.profil;
      // o.repartir : false = points laissés à répartir (comme un vrai nouvel artisan, avec la proposition) ; par défaut, répartis pour lui
      // o.tuto : true = le jeu propose le tutoriel comme à un vrai nouvel artisan (sinon, pas de tutoriel)
      await Jeu.entrer(Object.assign({ classe: "levainqueur", sexe: "h", peau: P.Profil.PEAUX[2], poils: P.Profil.POILS[1], niveau: 1 }, o), true, { repartir: o.repartir !== false, silence: o.proposer === false, sansTuto: o.tuto !== true });
      if (p && o.garder) { /* rien */ }
      await new Promise(r => setTimeout(r, 60));
      return patienter();
    },
    toucherCase(c) {
      const s = Jeu.sceneActive;
      if (!s || !s.sys.isActive()) return Promise.resolve(false);
      const r = s.toucherCaseClavier(c);
      return Promise.resolve(r).then(() => patienter()).then(() => r);
    },
    choisirSort(id) { const s = sceneDe("combat"); return s ? s.choisirSort(id) : false; },
    ouvrirGroupe(i) { const s = sceneDe("balade"); return s ? s.ouvrirGroupe(i) : false; },
    engagerGroupe(i) {
      const s = sceneDe("balade"); if (!s) return Promise.resolve(false);
      const ok = s.engager(i);
      return ok ? patienter().then(() => true) : Promise.resolve(false);
    },
    envoyer() { const s = sceneDe("combat"); return s ? Promise.resolve(s.envoyer()).then(() => patienter()) : Promise.resolve(false); },
    finDuTour() { const s = sceneDe("combat"); return s ? Promise.resolve(s.finDuTour()).then(() => patienter()) : Promise.resolve(false); },
    retour() { const b = document.getElementById("retour-balade"); if (b) b.click(); return patienter(); },
    groupes() { return (Jeu.monde ? Jeu.monde.groupes : []).map((g, i) => ({ i, groupe: g.groupe, case: g.case, actif: g.actif })); },
    ecranDeCase(c) { const s = Jeu.sceneActive; if (!s) return null; const w = P.iso(c[0], c[1]); return s.vue.versEcran(w.x, w.y); },
    ecranDePion(id) { const s = Jeu.sceneActive; if (!s) return null; const p = id === "moi" && s.moi && s.moi.c ? s.moi : (s.pions ? s.pions[id] : null); if (!p) return null; return s.vue.versEcran(p.c.x, p.c.y - p.hauteur / 2); },
    zoom() { const s = Jeu.sceneActive; return s ? s.vue.Z : null; },
    rectUtile: () => UI().rectUtile(),
    // le tutoriel : l'état sauvé, l'étape et ce qui est montré (lecture seule)
    tuto: () => (P.Tuto ? P.Tuto.etat() : null),
    // les îles (lecture seule) : l'île où l'on est, ses objets (écran), le lieu sauvé, le dernier passage, la quête du tour
    get ile() { return Jeu.monde ? Jeu.monde.ile : null; },
    objets() {
      const s = sceneDe("balade"); if (!s) return [];
      return (s.objetsVoyage || []).map(r => {
        const o = r.o, w = P.iso(o.case[0], o.case[1]), e = s.vue.versEcran(w.x, w.y);
        let d = null; if (r.im) { const b = r.im.getBounds(); const pt = s.vue.versEcran(b.centerX, b.y + b.height * .55); d = { x: pt.x, y: pt.y }; }
        return { id: o.id, genre: o.genre, case: o.case, acces: o.acces, ecran: e, dessin: d, vers: o.vers || null, allume: o.genre === "four" ? P.Voyage.allume(o) : undefined };
      });
    },
    lieu: () => JSON.parse(JSON.stringify(P.Profil.monde() || null)),
    moi: () => { const s = sceneDe("balade"); return s && s.moi ? s.moi.case.slice() : null; },
    apercuVoyage: () => { const s = sceneDe("balade"); return s && s.apercuVoyage ? s.apercuVoyage.id : null; },
    get passage() { return Jeu.passage ? Object.assign({}, Jeu.passage) : null; },
    get dernierPassage() { return Jeu.dernierPassage ? Object.assign({}, Jeu.dernierPassage) : null; },
    tour: () => (P.Astrelier ? P.Astrelier.etat() : null),
    jeu: Jeu
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarrer); else demarrer();
})();
