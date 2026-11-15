// Personnages d'Orvane, vus de 3/4 (tournés vers le bas à droite).
// Chaque classe se reconnaît à son corps : étage (taille), forme d'ensemble, forme de tête
// et une signature anatomique (pognes, meringue, billots, auréole tombée, collerette,
// voile, pique, échalas), toujours en couleur de peau, de cheveux ou de matière neutre.
// La tenue de départ est strictement la même pour les huit : tunique de lin sans manches à encolure
// large, arrêtée à mi-cuisse, tablier neutre et sabots bruns. Bras, épaules et tibias restent nus.
// La peau et les cheveux sont au choix du joueur (o.peau, o.poils) ; aucune classe n'a de teinte imposée.
// Les dessins sont écrits dans le repère de la bible des corps (sol à y = 0, sommet du
// crâne entre -56 et -92), puis réduits de moitié : à o.s = 1, 46 unités de haut au plus,
// et de part et d'autre de l'axe 19 au plus (Bouchevalier), 18 (Levainqueur), 16 (les autres).
window.ORVANE = window.ORVANE || {};
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const TRAIT = "#1D2725", LIN = "#EDE3CC", TABLIER = "#CDBE9F", SABOT = "#5B4632", BLANC = "#FFFDF7";
  const FUMEE = "#C4C9D0", FUMEE_DESSOUS = "#9EA4AB", IVOIRE = "#F3E6C4", TERRE = "#8A6238", BOIS = "#EBD9B0", CROUTE_DOREE = "#B58A55";
  const OMBRE = "#5A4330"; // ombre chaude, jamais un gris sale
  const SUCRES = { vanille: "#F7ECD3", framboise: "#F6C9D2", pistache: "#DDEDC8", violette: "#E5D6F2", citron: "#F8EEB4", caramel: "#F0D6B2" };
  const PEAU_DEFAUT = "#C8956B", POILS_DEFAUT = "#6B4A2E";
  const EP = 1.5;           // contour, dans le repère de la bible (0,75 une fois réduit)
  const REDUC = 0.5;        // bible -> unités du jeu
  let uid = 0;

  function el(n, a, p) { const e = document.createElementNS(NS, n); for (const k in a) if (a[k] !== undefined && a[k] !== null) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function rgb(hex) {
    let h = String(hex || "#888888").trim();
    if (/^#[0-9a-f]{3}$/i.test(h)) h = "#" + h.slice(1).split("").map(x => x + x).join("");
    if (!/^#[0-9a-f]{6}$/i.test(h)) h = "#888888";
    const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255];
  }
  const hexa = c => "#" + c.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  // f > 0 éclaircit, f < 0 assombrit
  const teinte = (hex, f) => hexa(rgb(hex).map(v => f < 0 ? v * (1 + f) : v + (255 - v) * f));
  const melange = (a, b, t) => { const x = rgb(a), y = rgb(b); return hexa(x.map((v, i) => v + (y[i] - v) * t)); };
  const luma = h => { const [r, g, b] = rgb(h); return (.299 * r + .587 * g + .114 * b) / 255; };
  // Éclaircir une peau sans la griser : on monte la luminosité en gardant la teinte et la saturation
  // (mêler au blanc donne des tons cendrés sur les peaux foncées).
  function lumiere(hex, k) {
    const [r, g, b] = rgb(hex).map(v => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    let h = 0, s = 0;
    if (d) {
      s = d / (1 - Math.abs(2 * l - 1));
      h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    }
    const L = l + (1 - l) * k, S = Math.min(1, s * (1 + .08 * k)), C = (1 - Math.abs(2 * L - 1)) * S, X = C * (1 - Math.abs((h % 2 + 2) % 2 - 1)), m = L - C / 2;
    const hh = ((h % 6) + 6) % 6, [a, bb, cc] = hh < 1 ? [C, X, 0] : hh < 2 ? [X, C, 0] : hh < 3 ? [0, C, X] : hh < 4 ? [0, X, C] : hh < 5 ? [X, 0, C] : [C, 0, X];
    return hexa([a + m, bb + m, cc + m].map(v => v * 255));
  }
  // Contour : la couleur de remplissage assombrie de 35 %, opaque, 1,5 d'épaisseur
  const bord = f => typeof f === "string" && f[0] === "#" ? teinte(f, -.35) : TRAIT;
  const ct = a => Object.assign({ stroke: bord(a.fill), "stroke-width": EP, "stroke-linejoin": "round", "stroke-linecap": "round" }, a);

  // Formes de base, avec contour
  const P = (g, d, fill, x) => el("path", ct(Object.assign({ d, fill }, x)), g);
  const E = (g, cx, cy, rx, ry, fill, x) => el("ellipse", ct(Object.assign({ cx, cy, rx, ry, fill }, x)), g);
  const R = (g, x, y, w, h, r, fill, extra) => el("rect", ct(Object.assign({ x, y, width: w, height: h, rx: r, fill }, extra)), g);
  // Trait sans contour
  const T = (g, d, couleur, w, x) => el("path", Object.assign({ d, fill: "none", stroke: couleur, "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round" }, x), g);
  const G = (g, a) => el("g", a || {}, g);
  // Membre épais (polyligne à bouts ronds) avec son contour
  function M(g, pts, w, fill) {
    const points = pts.map(p => p.join(",")).join(" ");
    const base = { points, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" };
    el("polyline", Object.assign({}, base, { stroke: bord(fill), "stroke-width": w + EP }), g);
    el("polyline", Object.assign({}, base, { stroke: fill, "stroke-width": w - EP }), g);
  }
  // Membres du côté lointain (+x) : remontés de 2, à l'échelle 0,92 autour de leur racine
  const loin = (g, x, y) => G(g, { class: "lointain", transform: `translate(0 -2) translate(${x} ${y}) scale(.92) translate(${-x} ${-y})` });
  const ombre = (g, rx) => el("ellipse", { cx: 0, cy: 0, rx, ry: rx * .3, fill: TRAIT, opacity: .22, class: "ombre" }, g);
  const autour = (x, y, k) => `translate(${x} ${y}) scale(${k}) translate(${-x} ${-y})`;

  // Échantillonnage de courbes
  const cub = (a, b, c, d, t) => { const u = 1 - t; return [0, 1].map(i => u * u * u * a[i] + 3 * u * u * t * b[i] + 3 * u * t * t * c[i] + t * t * t * d[i]); };
  const qua = (a, b, c, t) => { const u = 1 - t; return [0, 1].map(i => u * u * a[i] + 2 * u * t * b[i] + t * t * c[i]); };
  const fx = q => q[0].toFixed(2) + "," + q[1].toFixed(2);
  // Fuseau : ruban qui suit un axe, de largeur wf(t) (t de 0 à 1 le long de l'axe), bout rond ou pointu.
  // wf peut rendre [demi-largeur côté A, demi-largeur côté B] pour un bord qui ondule.
  function fuseau(pts, wf, bout) {
    const lg = [0]; for (let i = 1; i < pts.length; i++) lg.push(lg[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const tot = lg[lg.length - 1], A = [], B = [], TG = [];
    pts.forEach((p, i) => {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      let tx = b[0] - a[0], ty = b[1] - a[1]; const n = Math.hypot(tx, ty) || 1; tx /= n; ty /= n;
      const w = wf(lg[i] / tot), wa = Array.isArray(w) ? w[0] : w / 2, wb = Array.isArray(w) ? w[1] : w / 2;
      A.push([p[0] - ty * wa, p[1] + tx * wa]); B.push([p[0] + ty * wb, p[1] - tx * wb]); TG.push([tx, ty, (wa + wb) / 2]);
    });
    const k = A.length - 1, [tx, ty, w] = TG[k];
    let d = "M" + A.map(fx).join(" L");
    if (bout === "rond") d += ` C${fx([A[k][0] + tx * w * 1.35, A[k][1] + ty * w * 1.35])} ${fx([B[k][0] + tx * w * 1.35, B[k][1] + ty * w * 1.35])} ${fx(B[k])}`;
    else if (Array.isArray(bout)) d += " L" + fx(bout);
    d += " L" + B.slice().reverse().map(fx).join(" L") + " Z";
    return { d, A, B, t: lg.map(v => v / tot) };
  }
  const ind = (f, t) => { let i = 0; while (i < f.t.length - 1 && f.t[i] < t) i++; return i; };
  const vers = (p, q, k) => [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k];

  // ---------- Visage ----------
  function yeux(g, c, a) {
    a.p.forEach(([x, y], i) => {
      const k = i ? .9 : 1, rx = a.rx * k, ry = a.ry * k;
      el("ellipse", { cx: x, cy: y, rx, ry, fill: TRAIT }, g);
      el("circle", { cx: x + rx * .35, cy: y - ry * .38, r: Math.max(.75, rx * .4), fill: BLANC }, g);
      if (c.f) { // cils
        T(g, `M${x + rx * .55} ${y - ry * .85} l1.7 -1.3 M${x + rx * .95} ${y - ry * .4} l1.9 -.5`, TRAIT, .9);
      }
      if (a.sourcils !== false) {
        const hh = c.f ? 1.5 : .7, w = c.f ? 1.1 : 1.9;
        let sy = y - ry - (a.sourcils || 2.4);
        if (a.malin && i === 0) { // un sourcil levé : air complice
          sy -= 1.3;
          T(g, `M${x - rx * 1.15} ${sy + 1} Q${x - rx * .2} ${sy - hh - 1.2} ${x + rx * 1.15} ${sy - .2}`, c.sourcil, w);
        } else if (a.malin) {
          T(g, `M${x - rx * 1.15} ${sy + .1} Q${x} ${sy - hh * .4} ${x + rx * 1.15} ${sy + .9}`, c.sourcil, w);
        } else T(g, `M${x - rx * 1.15} ${sy + (c.f ? .6 : .5)} Q${x} ${sy - hh} ${x + rx * 1.15} ${sy + (c.f ? .2 : .4)}`, c.sourcil, w);
      }
    });
  }
  function bouche(g, x, y, type, w) {
    w = w || 6;
    if (type === "franc") {
      el("path", { d: `M${x - w / 2} ${y - .8} Q${x} ${y + w * .75} ${x + w / 2} ${y - .8} Z`, fill: "#8A3F36", stroke: TRAIT, "stroke-width": 1, "stroke-linejoin": "round" }, g);
      el("path", { d: `M${x - w * .22} ${y + w * .3} Q${x} ${y + w * .5} ${x + w * .22} ${y + w * .3}`, fill: "none", stroke: "#D97B6C", "stroke-width": 1.1, "stroke-linecap": "round" }, g);
    } else if (type === "coin") T(g, `M${x - w / 2} ${y + .3} Q${x + w * .15} ${y + 1.8} ${x + w / 2} ${y - 1.4}`, TRAIT, 1.2);
    else if (type === "large") T(g, `M${x - w / 2} ${y - .8} Q${x} ${y + w * .45} ${x + w / 2} ${y - .8}`, TRAIT, 1.3);
    else T(g, `M${x - w / 2} ${y - .4} Q${x} ${y + w * .32} ${x + w / 2} ${y - .4}`, TRAIT, 1.1);
  }
  const nez = (g, c, x, y, r) => el("circle", { cx: x, cy: y, r: r || 1.4, fill: teinte(c.peau, -.16) }, g);
  const joues = (g, pts, rx, ry, op) => pts.forEach(([x, y]) => el("ellipse", { cx: x, cy: y, rx, ry, fill: "#E27A68", opacity: op || .3 }, g));
  // Main en moufle arrondie, pouce en petite ellipse (aucun doigt en trait)
  function moufle(g, x, y, r, fill, sens, ry) {
    E(g, x, y, r, ry || r * 1.08, fill);
    const px = x + sens * r * .78, py = y - r * .3;
    E(g, px, py, r * .46, r * .34, fill, { transform: `rotate(${sens * -35} ${px} ${py})` });
  }

  // ---------- Tenue de départ, strictement la même pour les huit ----------
  // Tunique de lin sans manches, à encolure large, qui s'arrête à mi-cuisse, avec un ourlet piqué ;
  // tablier neutre noué à la taille ; sabots bruns. Seule la coupe suit le corps : mêmes pièces,
  // mêmes teintes, mêmes finitions. Bras, épaules et tibias restent nus.
  function tenue(g, t) {
    const gt = G(g, { class: "tenue" });
    P(gt, t.tunique, LIN);
    if (t.ombre) el("path", { d: t.ombre, fill: OMBRE, opacity: .09 }, gt);
    T(gt, t.ourlet, teinte(LIN, -.2), 1.1, { "stroke-dasharray": "2.2 1.6" });
    if (t.reflet) el("ellipse", Object.assign({ fill: "#FFFFFF", opacity: .3 }, t.reflet), gt);
    P(gt, t.tablier, TABLIER);
    T(gt, `M${t.lien[1]} ${t.lien[0]} L${t.lien[2]} ${t.lien[0]}`, teinte(TABLIER, -.24), 1.6);
    return gt;
  }
  // Jambes nues (couleur de peau) : la tunique s'arrête à mi-cuisse
  const jambe = (g, c, pts, w, lointaine) => M(g, pts, w, lointaine ? c.peauL : c.peau);
  const sabot = (g, c, cx, cy, rx, ry, lointain) => { E(g, cx, cy, rx, ry, lointain ? teinte(SABOT, -.12) : SABOT); el("ellipse", { cx: cx - rx * .25, cy: cy - ry * .35, rx: rx * .4, ry: ry * .25, fill: "#FFFFFF", opacity: .18 }, g); };
  const flanc = (g, d) => el("path", { d, fill: OMBRE, opacity: .1 }, g);

  // ---------- Les huit corps ----------
  const PLANS = {};

  // 1. Levainqueur : l'haltère. Deux pognes rondes de part et d'autre du bassin, tête en pain de mie.
  function grigne(g, c, x, y, fournee) {
    const t = c.grigne, d = grigneTrace(t, x, y), w = t === "epi" || t === "quadrillage" ? 1.4 : 1.8;
    if (fournee) { // la lueur suit exactement la grigne : halo de l'élément, trait doré clair
      T(g, d, c.elem, w + 4.2, { opacity: .45, class: "lueur-halo" });
      T(g, d, "#FFD36E", w + 1.1, { class: "lueur" });
      T(g, d, "#FFF6D2", w * .5);
      return;
    }
    T(g, d, teinte(c.peau, -.32), w + 1.5, { opacity: .5 });
    T(g, d, lumiere(c.peau, .6), w);
  }
  function grigneTrace(t, x, y) {
    if (t === "epi") return `M${x - 3.5} ${y + 1.5} L${x + 3.5} ${y - 1.5} M${x - 2.5} ${y - 1.8} l1.6 2 M${x} ${y - 2.8} l1.6 2 M${x + 2.5} ${y - 3.8} l1.4 1.9 M${x - 2.4} ${y + 2.8} l1.5 -1.9 M${x + .1} ${y + 1.8} l1.5 -1.9`;
    if (t === "chevron") return `M${x - 3.8} ${y - 1.5} L${x} ${y + 1} L${x + 3.8} ${y - 1.5} M${x - 3.8} ${y - 4} L${x} ${y - 1.5} L${x + 3.8} ${y - 4}`;
    if (t === "quadrillage") return `M${x - 3.6} ${y - 2.6} l7.2 0 M${x - 3.6} ${y + .4} l7.2 0 M${x - 1.6} ${y - 4.5} l0 6.8 M${x + 1.6} ${y - 4.5} l0 6.8`;
    return `M${x - 3.2} ${y - 3.2} L${x + 3.2} ${y + 2} M${x + 3.2} ${y - 3.2} L${x - 3.2} ${y + 2}`; // croix
  }
  // cote : -1 pour la pogne proche (à gauche), 1 pour la lointaine. En fournée, elle gonfle à 1,15
  // autour d'un pivot placé côté corps (et un peu au-dessus du centre) : le bord intérieur reste à sa
  // place, la pogne grossit vers l'extérieur et vers le bas, et le vide avec la cuisse reste de 6 au moins.
  function pogne(g, c, cx, cy, r, peau, fournee, cote) {
    const px = cx - cote * 2, py = cy - 2;
    const gp = G(g, { class: "signature pogne", "data-pivot": `${px} ${py}`, transform: fournee ? autour(px, py, 1.15) : null });
    E(gp, cx, cy, r, r, peau);
    el("ellipse", { cx: cx + 1, cy: cy + r * .45, rx: r * .72, ry: r * .38, fill: OMBRE, opacity: .12 }, gp);
    el("ellipse", { cx: cx - .6, cy: cy - r * .32, rx: r * .8, ry: r * .52, fill: "#FFFFFF", opacity: .3 }, gp); // voile de farine
    grigne(gp, c, cx - .6, cy - r * .3, fournee);
    const px2 = cx + r * .3, py2 = cy - r * .8; // pouce, sur le dessus avant, rentré contre l'avant-bras
    E(gp, px2, py2, 2.4, 1.85, peau, { transform: `rotate(-30 ${px2} ${py2})` });
  }
  const TETE_PAIN = (f) => `M -14,${f ? -57.5 : -56} Q -14,-52 ${f ? -9 : -10.5},-52 L ${f ? 9 : 10.5},-52 Q 14,-52 14,${f ? -57.5 : -56} L 14,-66 Q 14,-67.6 15.2,-68.4 Q 16.4,-69.4 16.4,-71.8 Q 14.8,-82 0,-82 Q -14.8,-82 -16.4,-71.8 Q -16.4,-69.4 -15.2,-68.4 Q -14,-67.6 -14,-66 Z`;
  // Profil d'un flanc, du haut vers le bas, en segments quadratiques [cx, cy, x, y] depuis le point « de » ;
  // le flanc proche (−x) est tel quel, le flanc lointain (+x) est en miroir, raccourci de « k » (vue de 3/4).
  const flancQ = (de, segs, k) => {
    const X = x => k ? -x * k : x;
    return { de: [X(de[0]), de[1]], bas: (s => [X(s[2]), s[3]])(segs[segs.length - 1]),
      descend: segs.map(([a, b, x, y]) => ` Q ${X(a).toFixed(2)},${b} ${X(x).toFixed(2)},${y}`).join(""),
      monte: segs.map((s, i) => { const avant = i ? segs[i - 1] : [0, 0, de[0], de[1]]; return ` Q ${X(s[0]).toFixed(2)},${s[1]} ${X(avant[2]).toFixed(2)},${avant[3]}`; }).reverse().join("") };
  };
  // Levainqueur : épaules rondes, puis la taille se resserre tôt, pour laisser 6 de vide au-dessus des pognes
  const LEV_TORSE = [[-21, -53, -21, -45.5], [-21, -40.2, -16, -37], [-10.6, -33, -9.4, -28], [-8.6, -25, -8.6, -22]];
  // le même flanc, pris à l'aisselle (−20.2, −41.6) : c'est là que l'emmanchure de la tunique rejoint le torse
  const LEV_FLANC = [[-19, -38.92, -16, -37], [-10.6, -33, -9.4, -28], [-8.6, -25, -8.6, -22]];
  const LEV_K = .9; // flanc lointain
  PLANS.levainqueur = c => {
    const { g, peau } = c, fournee = c.etat === "fournee";
    ombre(g, 30);
    // Coiffure de dos (tresse de la Levainqueuse), comme une tresse de pain
    if (c.f && c.coiffure !== "courte") {
      const tr = G(g, { class: "tresse" });
      [[-14.5, -59, 3.6], [-16.2, -54, 3.4], [-17.2, -49.2, 3.1], [-17.6, -44.8, 2.7]].forEach(([x, y, r]) => E(tr, x, y, r, r * .85, c.poils));
      E(tr, -17.7, -41.4, 1.7, 1.9, c.poils);
    }
    // Côté lointain : bras nu et pogne, derrière le torse
    const lo = loin(g, 16.2, -46.5);
    M(G(lo, { class: "bras" }), [[16.2, -46.5], [22.6, -37.4], [26, -28.6]], 9.6, c.peauL);
    pogne(lo, c, 27.3, -21.6, 8.1, c.peauL, fournee, 1);
    // Jambes courtes et plantées, tibias nus
    jambe(g, c, [[4.2, -22], [4.5, -5]], 7, true); sabot(g, c, 6, -3.6, 6, 3.1, true);
    jambe(g, c, [[-4.2, -22], [-4.5, -4]], 7); sabot(g, c, -5.2, -3, 6.2, 3.2);
    // Torse bombé, épaules rondes et nues, taille fine
    const t = G(g, { class: "torse", transform: c.f ? "scale(.96 1)" : null });
    const tp = flancQ([-12, -53], LEV_TORSE), tl = flancQ([-12, -53], LEV_TORSE, LEV_K);
    P(t, `M ${tp.de.join(",")}${tp.descend} L ${tl.bas.join(",")}${tl.monte} Z`, peau);
    el("ellipse", { cx: -14.5, cy: -47.5, rx: 3.4, ry: 2.2, fill: "#FFFFFF", opacity: .2 }, t);
    const fp = flancQ([-20.2, -41.6], LEV_FLANC), fl = flancQ([-20.2, -41.6], LEV_FLANC, LEV_K), hk = (-8.95 * LEV_K).toFixed(2);
    tenue(t, {
      tunique: `M -13.2,-52.8 Q -14.8,-44 ${fp.de.join(",")}${fp.descend} L -8.95,-17.4 Q 0,-15.6 ${hk},-17.4 L ${fl.bas.join(",")}${fl.monte} Q ${(14.8 * LEV_K).toFixed(2)},-44 ${(13.2 * LEV_K).toFixed(2)},-52.8 L 9.6,-52.8 C 6.2,-45.6 -4.2,-45.6 -10.4,-52.8 Z`,
      ombre: "M -14.4,-45.6 Q -15.8,-42.6 -19.5,-41.3 Q -18.4,-38.8 -15.5,-37.2 Q -10.4,-33.4 -9.1,-28 Q -8.3,-25 -8.3,-22 L -8.6,-17.9 L -6.2,-17.6 Q -6,-24.5 -7.4,-29.4 Q -10.2,-35.8 -11.6,-45.6 Z",
      ourlet: `M -8.7,-19.3 Q 0,-17.5 ${(8.7 * LEV_K).toFixed(2)},-19.3`,
      reflet: { cx: -6, cy: -40, rx: 4, ry: 2.6 },
      tablier: "M -3.4,-43.8 L 12,-43.8 Q 13.2,-37.6 10.4,-31.8 Q 7.8,-27.4 7.3,-18.8 L -4,-18.8 Q -4.3,-25 -5,-30 Q -4.9,-37.6 -3.4,-43.8 Z",
      lien: [-31, -5.2, 10]
    });
    // Bras proche, nu, jusqu'à la pogne
    M(G(g, { class: "bras" }), [[-16.2, -46.5], [-22.4, -37.6], [-25.4, -29.4]], 9.6, peau);
    pogne(g, c, -26.3, -23.5, 8.1, peau, fournee, -1);
    // Tête en tranche de pain de mie : le dessus déborde du moule
    const h = G(g, { class: "tete" });
    P(h, TETE_PAIN(c.f), peau);
    el("path", { d: "M -13,-56 L -13,-66 Q -11,-60 -10,-53 L -11.5,-53 Q -13,-53 -13,-56 Z", fill: OMBRE, opacity: .08 }, h);
    yeux(h, c, { p: [[-1.5, -62.5], [8, -62.5]], rx: 2.2, ry: 2.8 });
    joues(h, [[-4.5, -58.2], [11.5, -58.2]], 2.6, 1.6);
    nez(h, c, 4.5, -59.3, 1.5);
    bouche(h, 3.5, -56.3, "franc", 7);
    // le bord du moule, sous le débord du dôme qui reste en peau de part et d'autre
    T(h, "M -14,-66.2 Q -14.6,-67.6 -15.8,-68.2 M 14,-66.2 Q 14.6,-67.6 15.8,-68.2", teinte(peau, -.35), .9, { opacity: .6 });
    // Cheveux courts : une calotte en mèches sur le dôme, 2 unités en retrait du débord de chaque côté
    P(h, "M -14.4,-74.6 Q -13.8,-82.9 0,-82.9 Q 13.8,-82.9 14.4,-75 Q 12.8,-76.4 11.4,-74.8 Q 9.2,-77.8 6.4,-75.6 Q 3.4,-78.4 .3,-75.8 Q -2.9,-78.2 -5.9,-75.4 Q -8.9,-77.8 -11.3,-74.8 Q -12.9,-76.2 -14.4,-74.6 Z", c.poils);
    T(h, "M -8,-80.4 Q -3,-81.9 3,-81.2", "#FFFFFF", 1.3, { opacity: .3 });
  };

  // 2. Pâtissorcier : la pointe sur boule, qui flotte. La Meringue pochée sort du crâne, dans la frange.
  // Tête et Meringue sont dessinées dans le repère de la bible (tête de centre (0,-56), rayon 16),
  // puis posées sur le buste à l'échelle 0,95 : la pointe reste sous le plafond de 46 unités de jeu.
  const TETE_CHOU = "translate(0 -51.3) scale(.95) translate(0 56)";
  function meringue(g, c) {
    const tors = c.torsade < 0 ? -1 : 1, sucre = c.sucre, PIED = [-1, -66], PLAFOND = -98.7;
    const N = 4.5, FIN = .82; // 4 à 5 ondes par bord, décalées d'une demi-onde d'un bord à l'autre : une torsade
    // profil de meringue pochée : un ventre plein en bas, puis une pointe qui file et se recourbe vers l'arrière
    const larg = t => 3 + 13 * Math.pow(1 - t * t, 1.35);
    const amp = t => t > FIN ? 0 : 1.25 * (1 - .45 * t / FIN) * Math.min(1, (FIN - t) / .08);
    // bord droit (A) et bord gauche (B) : des lobes arrondis séparés par de petits creux, en quinconce
    const lobe = (t, dec) => amp(t) * (Math.pow(Math.abs(Math.sin(Math.PI * (N * t / FIN + dec))), .6) - .55);
    const decA = tors > 0 ? 0 : .5, decB = tors > 0 ? .5 : 0;
    let ax = [];
    const fait = k => {
      ax = [];
      for (let i = 0; i <= 56; i++) ax.push(cub(PIED, [-.6, -79], [-2.6, -89.5], [-8.2, -93.8], i / 56));
      for (let i = 1; i <= 12; i++) ax.push(qua([-8.2, -93.8], [-12, -95.4], [-14.6, -92.6], i / 12));
      ax = ax.map(([x, y]) => [PIED[0] + (x - PIED[0]) * k, PIED[1] + (y - PIED[1]) * k]);
      return fuseau(ax, t => [larg(t) / 2 + lobe(t, decA), larg(t) / 2 + lobe(t, decB)], "rond");
    };
    // la Meringue monte jusqu'au plafond (46 unités de jeu une fois posée) : environ 27 au-dessus du crâne
    let k = 1, f = fait(k);
    for (let n = 0; n < 3; n++) { const haut = Math.min(...f.A.concat(f.B).map(p => p[1])); k *= (PLAFOND - PIED[1]) / (haut - PIED[1]); f = fait(k); }
    // u de -1 (bord gauche, B) à 1 (bord droit, A)
    const sur = (i, u) => u < 0 ? vers(ax[i], f.B[i], -u) : vers(ax[i], f.A[i], u);
    const mg = G(g, { class: "signature meringue", "data-pivot": "-1 -67" });
    // le pied, en étoile de douille : cinq petites dents sur le devant
    const pied = [];
    for (let i = 0; i <= 72; i++) {
      const a = i / 72 * 2 * Math.PI, dent = Math.sin(a) > 0 ? 1.15 * Math.abs(Math.sin(5 * a)) : 0;
      pied.push([-1 + (10.6 + dent) * Math.cos(a), -66.6 + (3.2 + dent * .75) * Math.sin(a)]);
    }
    P(mg, "M" + pied.map(fx).join(" L") + " Z", sucre);
    for (let j = 1; j < 5; j++) { // les sillons entre les dents
      const a = j * Math.PI / 5;
      T(mg, `M${fx([-1 + 9.3 * Math.cos(a), -66.6 + 2.6 * Math.sin(a)])} L${fx([-1 + 10.9 * Math.cos(a), -66.6 + 3.3 * Math.sin(a)])}`, teinte(sucre, -.24), .9);
    }
    P(mg, f.d, sucre);
    el("ellipse", { cx: -1.2, cy: -66.4, rx: 7.2, ry: 1.7, fill: sucre }, mg); // raccord du pied, sans contour
    // ombre douce sur le flanc droit
    const i0 = ind(f, .05), i1 = ind(f, .74);
    const bordD = f.A.slice(i0, i1 + 1), milieu = bordD.map((p, i) => vers(p, ax[i0 + i], .5)).reverse();
    el("path", { d: "M" + bordD.concat(milieu).map(fx).join(" L") + " Z", fill: OMBRE, opacity: .08 }, mg);
    // cannelures : chacune part d'un creux du bord gauche et monte en spirale jusqu'à un creux du bord droit
    const cann = teinte(sucre, -.25), clair = teinte(sucre, .6);
    const creuxB = k => (k + (tors > 0 ? .5 : 0)) * FIN / N, creuxA = k => (k + (tors > 0 ? 0 : .5)) * FIN / N;
    for (let k = 0; k < N + 1; k++) {
      const tg = tors > 0 ? creuxB(k) : creuxA(k), td = Math.min(FIN - .01, tors > 0 ? creuxA(k + 2) : creuxB(k + 2));
      if (td - tg < .1) break;
      const pts = [], lum = [];
      for (let s = 0; s <= 12; s++) {
        const t = tg + (td - tg) * s / 12, u = -.92 * Math.cos(Math.PI * s / 12);
        pts.push(sur(ind(f, t), u)); lum.push(sur(ind(f, t + .012), u));
      }
      T(mg, "M" + lum.map(fx).join(" L"), clair, 1, { opacity: .85 });
      T(mg, "M" + pts.map(fx).join(" L"), cann, 1.15, { opacity: .95 });
    }
    // reflet de sucre brillant : un éclat sur chaque lobe du bord gauche, et une étincelle
    for (let k = 0; k < N; k++) {
      const tm = ((k + (tors > 0 ? 1 : .5)) * FIN / N), ta = tm - .045, tb = tm + .03;
      if (tb > .66) break;
      const ref = []; for (let i = ind(f, ta); i <= ind(f, tb); i++) ref.push(sur(i, -.68));
      if (ref.length > 1) T(mg, "M" + ref.map(fx).join(" L"), "#FFFFFF", 1.9, { opacity: .95 });
    }
    { const ref = []; for (let i = ind(f, .02); i <= ind(f, .1); i++) ref.push(sur(i, -.72)); T(mg, "M" + ref.map(fx).join(" L"), "#FFFFFF", 1.9, { opacity: .95 }); }
    const ec = sur(ind(f, .7), -.3);
    el("path", { d: `M${ec[0]} ${ec[1] - 2} L${ec[0] + .5} ${ec[1] - .5} L${ec[0] + 2} ${ec[1]} L${ec[0] + .5} ${ec[1] + .5} L${ec[0]} ${ec[1] + 2} L${ec[0] - .5} ${ec[1] + .5} L${ec[0] - 2} ${ec[1]} L${ec[0] - .5} ${ec[1] - .5} Z`, fill: "#FFFFFF", opacity: .95 }, mg);
    // Glaçage : une goutte par bouclier actif (3 au plus), qui glisse le long du bord droit (côté +x),
    // chacune à sa hauteur et de sa longueur, au bout arrondi et plus large ; aucune nappe ne les relie.
    const nb = Math.min(3, c.glacage || 0);
    if (nb) {
      const nappe = melange(sucre, "#FFFFFF", .6), POS = [[.16, 7], [.4, 5.2], [.6, 6.2]];
      for (let j = 0; j < nb; j++) {
        const [t, l] = POS[j], p = vers(f.A[ind(f, t)], ax[ind(f, t)], .12), x = p[0], y = p[1];
        el("path", { d: `M${fx([x - 1.1, y - 1.2])} Q${fx([x - 1.2, y + l * .5])} ${fx([x - 1.5, y + l - 1.4])} A1.55 1.55 0 1 0 ${fx([x + 1.5, y + l - 1.4])} Q${fx([x + 1, y + l * .45])} ${fx([x + 1.1, y - 1.2])} Q${fx([x, y - 2])} ${fx([x - 1.1, y - 1.2])} Z`, fill: nappe, stroke: teinte(nappe, -.35), "stroke-width": .9, "stroke-linejoin": "round" }, mg);
        el("ellipse", { cx: x - .5, cy: y + l - 1.6, rx: .5, ry: .8, fill: "#FFFFFF", opacity: .95 }, mg);
      }
    }
    return mg;
  }
  PLANS.patissorcier = c => {
    const { g, peau } = c;
    el("ellipse", { cx: 0, cy: 0, rx: 13, ry: 3.9, fill: TRAIT, opacity: .22, class: "ombre" }, g);
    const corps = G(g, { class: "corps leve", "data-leve": 8 });
    // Mèches longues dans la nuque (Pâtissorcière), derrière la tête
    if (c.f && c.coiffure !== "courte") P(G(corps, { transform: TETE_CHOU }), "M -10,-66 Q -18.5,-64 -19.2,-53 Q -19.6,-44 -17,-38.5 Q -13,-40.5 -11.5,-44 Q -9.5,-40.5 -6.5,-41 Q -10,-50 -6,-63 Z", c.poils);
    // Bras lointain, nu
    const lo = loin(corps, 8.3, -34.5);
    M(lo, [[8.3, -34.5], [13.4, -26.8]], 4.5, c.peauL);
    moufle(lo, 14, -25.4, 2.9, c.peauL, 1);
    // Jambes minuscules, pieds toujours visibles, à 8 au-dessus du sol
    jambe(corps, c, [[4, -15], [4.6, -11.8]], 5, true); sabot(corps, c, 5.6, -10.4, 3.6, 2, true);
    jambe(corps, c, [[-4, -15], [-4.6, -11.4]], 5); sabot(corps, c, -4.2, -10, 3.6, 2);
    // Buste en chou, épaules nues
    const t = G(corps, { class: "torse", transform: c.f ? "scale(.96 1)" : null });
    E(t, 0, -25.5, 10.8, 11.8, peau);
    tenue(t, {
      tunique: "M -6.4,-36.2 Q -8.6,-31 -10.6,-27.8 A 10.8 11.8 0 0 0 -8.2,-17.82 L -7.7,-14.2 Q 0,-12.6 7.7,-14.2 L 8.2,-17.82 A 10.8 11.8 0 0 0 10.6,-27.8 Q 8.6,-31 6.4,-36.2 L 3.6,-36.9 Q .5,-29.6 -3.6,-36.9 Z",
      ombre: "M -8.6,-31 Q -10.6,-25 -9.2,-19 L -7.6,-14.6 L -5.4,-14 Q -7.4,-22 -6.4,-30 Z",
      ourlet: "M -7.4,-15.9 Q 0,-14.4 7.4,-15.9",
      reflet: { cx: -4.6, cy: -27.4, rx: 2.4, ry: 1.7 },
      tablier: "M -1.6,-31.6 Q 5.6,-33 9,-29 Q 10.4,-22.4 7.2,-16.2 Q 2.4,-14.2 -1.8,-15.4 Q -3.4,-24 -1.6,-31.6 Z",
      lien: [-24.4, -2.9, 10.3]
    });
    // Bras proche, nu, mains fines de chef d'orchestre
    M(corps, [[-8.3, -34.5], [-13.4, -26.8]], 4.5, peau);
    moufle(corps, -14, -25.4, 2.9, peau, -1);
    // Tête toute ronde, et la Meringue
    const tc = G(corps, { transform: TETE_CHOU });
    const h = G(tc, { class: "tete" });
    E(h, 0, -56, 16, 16, peau);
    el("path", { d: "M -13.5,-47 Q -16,-54 -14.5,-62 Q -12,-52 -6.5,-44 Q -10.5,-44.5 -13.5,-47 Z", fill: OMBRE, opacity: .08 }, h);
    yeux(h, c, { p: [[1, -53], [10, -53]], rx: 2.7, ry: 3.4, sourcils: 2 });
    joues(h, [[-3, -48], [13, -48]], 3, 1.8, .35);
    nez(h, c, 6, -48.8, 1.1);
    bouche(h, 6, -45.2, "doux", 3.8);
    // Frange (elle couvre le dessus du crâne), puis la Meringue pochée dessus : la frange sort dessous
    P(h, c.f ? "M -15.9,-57.5 A 16.6 16.6 0 0 1 15.9,-57.5 Q 13.6,-61.5 10.6,-60.2 Q 7,-63.4 3,-61 Q -1,-64 -5,-61.3 Q -9,-63 -12,-59.8 Q -14.3,-59 -15.9,-57.5 Z"
      : "M -15.9,-58.5 A 16.6 16.6 0 0 1 15.9,-58.5 Q 13.2,-62.4 10,-60.8 Q 6.4,-64.2 2.4,-61.6 Q -1.8,-64.8 -5.8,-61.8 Q -10,-63.8 -13,-60.4 Q -14.6,-59.8 -15.9,-58.5 Z", c.poils);
    T(h, "M -9,-68.5 Q -12.5,-66 -13.6,-62.5", "#FFFFFF", 1.2, { opacity: .3 });
    meringue(tc, c);
  };

  // 3. Bouchevalier : le château. Bloc à angles droits, billots de peau plus hauts que le menton.
  function mainBloc(g, x0, y0, w, h, fill, sens, peau) {
    R(g, x0, y0, w, h, 3, fill);
    const xe = sens < 0 ? x0 + 1.1 : x0 + w - 1.1; // arête nette, le tranchant
    T(g, `M${xe} ${y0 + 2} L${xe} ${y0 + h - 2}`, lumiere(peau, .45), 1.6, { opacity: .95 });
    T(g, `M${x0 + w * .3} ${y0 + h * .55} l${w * .4} 0`, teinte(peau, -.35), .8, { opacity: .5 });
  }
  PLANS.bouchevalier = c => {
    const { g, peau } = c;
    ombre(g, 31);
    // Bras lointain, nu : il dépasse du bloc, la main reste visible
    const lo = loin(g, 29, -64);
    M(lo, [[29, -64], [29, -34]], 13.2, c.peauL);
    mainBloc(lo, 22.8, -33, 12.4, 13, c.peauL, 1, c.peauL);
    // Jambes larges, écartées, tibias nus
    R(g, 5.5, -31, 14, 27.5, 3, c.peauL); R(g, 3.5, -8.5, 19, 7.5, 3, teinte(SABOT, -.12));
    R(g, -21, -30, 15, 27, 3, peau); R(g, -23.6, -7, 19.6, 7, 3, SABOT);
    // Torse-bloc avec l'encoche de la tête ; côté lointain un peu raccourci (3/4)
    const t = G(g, { class: "torse", transform: c.f ? "scale(.96 1)" : null });
    P(t, "M -34.6,-70 L -27.6,-77 L -14,-77 L -14,-66 L 14,-66 L 14,-77 L 25,-77 L 31.5,-70.5 L 31,-34 Q 30.5,-28 25,-28 L -28.6,-28 Q -34.2,-28 -34.4,-34 Z", peau);
    // les Billots, en peau : dessus plat plus clair, arête extérieure taillée en biseau (le tranchant)
    const bl = G(t, { class: "signature billots", "data-pivot": "-21 -73.4 21 -73.4" });
    el("path", { d: "M -27.6,-77 L -14,-77 L -14,-73.4 L -31.2,-73.4 Z M 25,-77 L 14,-77 L 14,-73.4 L 28.6,-73.4 Z", fill: lumiere(peau, .22) }, bl);
    T(bl, "M -27.6,-73.4 L -14,-73.4 M 28.6,-73.4 L 14,-73.4", teinte(peau, -.2), .9, { opacity: .6 });
    T(bl, "M -33.9,-70.3 L -27.9,-76.3 M 30.9,-70.8 L 25.4,-76.3", lumiere(peau, .5), 1.9, { opacity: .95 });
    T(bl, "M -33.2,-69.2 L -27.4,-75 M 30.2,-69.6 L 24.8,-75", teinte(peau, -.3), 1, { opacity: .45 });
    el("path", { d: "M 25.6,-73.4 L 28.6,-73.4 L 31.4,-70.5 L 31,-60 L 25.6,-60 Z", fill: OMBRE, opacity: .08 }, t);
    tenue(t, {
      tunique: "M -14,-77 L -16,-77 Q -16.6,-62.6 -23.4,-56.6 Q -28.4,-52.4 -34.3,-50 L -34.3,-34 Q -34,-29 -29.5,-27.4 L -24,-23.4 Q 0,-21.4 22.6,-23.4 L 27,-27.4 Q 31,-29 31,-34 L 31,-50 Q 26,-52.4 21.8,-56.6 Q 16.2,-62.6 16,-77 L 14,-77 L 14,-66 Q 13.5,-60.6 1,-60.4 Q -13.5,-60.6 -14,-66 Z",
      ombre: "M 31,-50 L 31,-34 Q 31,-29 27,-27.4 L 22.6,-23.4 L 19.8,-23.2 L 24.2,-27.8 Q 27,-29.4 27,-34 L 27,-52.2 Z",
      ourlet: "M -23.6,-25.3 Q 0,-23.3 22.2,-25.3",
      reflet: { cx: 5, cy: -50, rx: 9, ry: 5 },
      tablier: "M -8,-58 L 20,-58 L 20.6,-27.6 Q 6,-24.6 -8.6,-27.6 Z",
      lien: [-45, -8.3, 20.3]
    });
    el("ellipse", { cx: 1, cy: -63.2, rx: 12.5, ry: 2.2, fill: OMBRE, opacity: .14 }, t); // ombre portée de la tête
    // Bras proche, épais et nu, arête nette jusqu'à la main
    M(g, [[-30.6, -64], [-30.6, -34]], 13.2, peau);
    T(g, "M -36.2,-58 L -36.2,-36", lumiere(peau, .42), 1.5, { opacity: .85 });
    mainBloc(g, -37.2, -33, 12.4, 13, peau, -1, peau);
    // Petite tête en dôme, posée entre les billots
    const h = G(g, { class: "tete" });
    P(h, c.f ? "M -14,-67.5 Q -14,-64 -10,-64 L 10,-64 Q 14,-64 14,-67.5 L 14,-78 Q 14,-91.5 0,-91.5 Q -14,-91.5 -14,-78 Z"
      : "M -14,-66 Q -14,-64 -11.5,-64 L 11.5,-64 Q 14,-64 14,-66 L 14,-78 Q 14,-91.5 0,-91.5 Q -14,-91.5 -14,-78 Z", peau);
    el("path", { d: "M -13,-67 L -13,-77 Q -11,-70 -9,-65 L -11,-65 Q -13,-65 -13,-67 Z", fill: OMBRE, opacity: .08 }, h);
    yeux(h, c, { p: [[1, -74.5], [8.5, -74.5]], rx: 1.6, ry: 2, sourcils: 3.2 });
    joues(h, [[-2.5, -70.5], [11.5, -70.5]], 2.6, 1.5);
    nez(h, c, 5, -71.5, 1.5);
    bouche(h, 4.2, -68, "large", 9);
    // Cheveux courts
    P(h, "M -14.6,-74 Q -15.2,-92 0,-92 Q 15.2,-92 14.6,-77 Q 11,-82.5 5,-81.5 Q -1,-83.5 -7,-80.5 Q -11.5,-79 -14.6,-74 Z", c.poils);
    if (c.f && c.coiffure !== "courte") { // nattes plaquées et petit chignon bas
      T(h, "M -10,-81 Q -3,-88 8,-86.5 M -12.5,-78 Q -6,-84.5 4,-84", teinte(c.poils, -.25), 1, { opacity: .7 });
      E(h, -12.4, -76, 3.6, 3.4, c.poils);
    }
  };

  // 4. Pâtéladin : la planète. Corps fin traversé par l'Auréole tombée, un anneau de fumée.
  // L'anneau est une guirlande de bouffées allongées (12 × 6) et décalées, couchées le long d'un tube de 6,
  // vu en 3/4 ; trois bouffées un peu plus grosses font les renflements. La fumée passe de 0,9 près du trou
  // à 0,6 au bord extérieur, où elle s'effiloche en petites volutes horizontales, jamais montantes.
  // Gris perle froid, nettement plus foncé que le lin de la tunique : l'anneau ne se fond jamais dans l'habit.
  // La moitié avant est plus fine et plus translucide : on voit la tunique au travers, jamais un plateau blanc.
  const ANN = { cy: -33, rx: 26, ry: 11, k: .38 };
  const BOUFFEES = (() => {
    const L = [], n = 18;
    for (let i = 0; i < n; i++) {
      const a = i * 360 / n + 10, q = a * Math.PI / 180, s = Math.sin(q), co = Math.cos(q);
      const j = i % 6 === 2 ? 1.16 : [1, .92, 1.04][i % 3], dec = [.6, -.5, .2][i % 3]; // tailles et décalages inégaux
      L.push({ a, x: (ANN.rx + dec) * co, y: ANN.cy + (ANN.ry + dec * ANN.k) * s - (i % 2 ? .5 : 0),
        rx: j * Math.hypot(6 * s, 2.9 * co), ry: j * Math.hypot(6 * ANN.k * co, 2.2), devant: s > -.06 });
    }
    return L.sort((p, q) => p.y - q.y);
  })();
  const BORD_FUMEE = teinte(FUMEE, -.35), FUMEE_DOS = teinte(FUMEE, -.07); // la moitié arrière est dans l'ombre du corps
  function anneau(g, devant, k, masque) {
    const ag = G(g, { class: "signature anneau-" + (devant ? "bas" : "haut"), "data-pivot": "0 -33", transform: k !== 1 ? autour(0, -33, k) : null });
    const gm = G(G(ag, { opacity: devant ? .82 : null }), { mask: `url(#${masque})` });
    const fin = devant ? .84 : .94; // tube avant plus fin, tube arrière un peu plus fin aussi : le trou s'ouvre
    const liste = BOUFFEES.filter(b => b.devant === devant).map(b => Object.assign({}, b, { rx: b.rx * fin, ry: b.ry * fin }));
    // volutes horizontales au bord extérieur, à gauche et à droite
    const vol = devant ? ["M -28.4,-31.4 q -1.9,.5 -2.6,-.2 q -.6,-.6 .2,-.9 q .6,-.2 .8,.3", "M 28.6,-31.6 q 1.8,.5 2.5,-.2 q .6,-.6 -.2,-.9 q -.6,-.2 -.8,.3"]
      : ["M -28.2,-36 q -1.8,-.4 -2.6,.3 q -.6,.6 .2,.9 q .6,.1 .8,-.4", "M 28.4,-36.2 q 1.7,-.4 2.5,.3 q .6,.6 -.2,.9 q -.6,.1 -.8,-.4"];
    vol.forEach(d => T(gm, d, BORD_FUMEE, 2.7));
    // le trait d'abord, puis les fonds par-dessus : seul le bord de la guirlande garde un contour
    liste.forEach(b => el("ellipse", { cx: b.x, cy: b.y, rx: b.rx + .75, ry: b.ry + .75, fill: BORD_FUMEE }, gm));
    vol.forEach(d => T(gm, d, FUMEE, 1.4));
    liste.forEach(b => el("ellipse", { cx: b.x, cy: b.y, rx: b.rx, ry: b.ry, fill: devant ? FUMEE : FUMEE_DOS }, gm));
    // modelé : dessous plus sombre, voile plus clair sur le dessus de chaque bouffée
    liste.forEach(b => el("ellipse", { cx: b.x + b.rx * .08, cy: b.y + b.ry * .34, rx: b.rx * .8, ry: b.ry * .56, fill: FUMEE_DESSOUS, opacity: .7 }, gm));
    liste.forEach(b => {
      el("ellipse", { cx: b.x - b.rx * .15, cy: b.y - b.ry * .35, rx: b.rx * .6, ry: b.ry * .38, fill: "#FFFFFF", opacity: .4 }, gm);
    });
    if (devant) {
      el("path", { d: "M -14,-22.4 Q 0,-20.6 14,-22.4", fill: "none", stroke: FUMEE_DESSOUS, "stroke-width": 1.2, opacity: .7, "stroke-linecap": "round" }, gm);
      T(gm, "M -21,-26.8 q -1.4,-.5 -.5,-1.4 q .9,-.6 1.8,-.2 M 18.6,-26.2 q 1.3,-.6 .3,-1.4 q -.9,-.6 -1.7,-.2", "#FFFFFF", .8, { opacity: .6 });
    }
    return ag;
  }
  PLANS.pateladin = c => {
    const { g, peau } = c, k = c.etat === "fumage" ? .9 : 1;
    ombre(g, 25);
    // la fumée s'éclaircit vers le bord : opacité 0,9 près du trou, 0,6 au bord extérieur (masque en dégradé)
    const id = "orv-fumee-" + (++uid), defs = el("defs", {}, g);
    const rg = el("radialGradient", { id: id + "g", gradientUnits: "userSpaceOnUse", cx: 0, cy: -33, r: 30, gradientTransform: "translate(0 -33) scale(1 .4) translate(0 33)" }, defs);
    [[0, .9], [.74, .9], [1, .6]].forEach(([o, op]) => el("stop", { offset: o, "stop-color": "#FFFFFF", "stop-opacity": op }, rg));
    const mq = el("mask", { id, maskUnits: "userSpaceOnUse", x: -40, y: -56, width: 80, height: 46 }, defs);
    el("rect", { x: -40, y: -56, width: 80, height: 46, fill: `url(#${id}g)` }, mq);
    // Moitié haute de l'anneau, derrière le corps
    anneau(g, false, k, id);
    // Tresse de la Pâtéladine, au-dessus de l'anneau
    if (c.f && c.coiffure !== "courte") [[-13.5, -60, 3], [-15, -55.5, 2.9], [-16, -51, 2.7], [-16.5, -47, 2.3]].forEach(([x, y, r]) => E(g, x, y, r, r * .85, c.poils));
    // Bras lointain, nu, le long du corps, main dans le trou de l'anneau
    const lo = loin(g, 10, -39.5);
    M(lo, [[10, -39.5], [12, -30.5]], 5.6, c.peauL);
    moufle(lo, 12.2, -29.5, 3.1, c.peauL, 1);
    // Jambes droites, pieds joints, tibias nus
    jambe(g, c, [[4.5, -23], [4.5, -5]], 7.6, true); sabot(g, c, 5.8, -3, 5, 2.6, true);
    jambe(g, c, [[-4.5, -23], [-4.5, -4]], 7.6); sabot(g, c, -4, -2.5, 5, 2.6);
    // Cou et torse fin et droit
    R(g, -3.5, -46, 8, 7, 1, c.peauL);
    const t = G(g, { class: "torse", transform: c.f ? "scale(.96 1)" : null });
    R(t, -10, -41, 20, 19.5, 4, peau);
    tenue(t, {
      tunique: "M -4.6,-41 L -7.4,-41 Q -8.6,-36 -10,-33.2 L -10,-21.5 L -10.8,-17.4 Q 0,-15.8 10.8,-17.4 L 10,-21.5 L 10,-33.2 Q 9.2,-36 8.4,-41 L 5.6,-41 Q .5,-33.4 -4.6,-41 Z",
      ombre: "M -9.6,-33 L -9.6,-21.5 L -10.3,-17.6 L -7.4,-17.2 L -6.6,-21.6 L -6.6,-35.6 Z",
      ourlet: "M -10.5,-19.3 Q 0,-17.7 10.5,-19.3",
      reflet: { cx: -6.2, cy: -26.6, rx: 1.9, ry: 1.5 },
      tablier: "M -2.5,-35.6 L 9,-35.6 L 9.3,-19 L -3,-19 Z",
      lien: [-29.5, -3, 9.6]
    });
    // L'anneau fait de l'ombre sur le corps, dans le trou : une ombre douce juste au-dessus du tube avant,
    // sur la tunique et les bras. Elle montre que l'anneau flotte autour du corps, sans le toucher.
    const ob = el("linearGradient", { id: id + "o", gradientUnits: "userSpaceOnUse", x1: 0, y1: -31.5, x2: 0, y2: -23.5 }, defs);
    [[0, 0], [.55, .2], [1, .26]].forEach(([o, op]) => el("stop", { offset: o, "stop-color": OMBRE, "stop-opacity": op }, ob));
    const cp = el("clipPath", { id: id + "c" }, defs);
    el("rect", { x: -10.8, y: -41, width: 21.6, height: 24 }, cp);
    el("path", { d: "M -10.8,-31.5 L 10.8,-31.5 L 10.8,-23.5 Q 0,-21.6 -10.8,-23.5 Z", fill: `url(#${id}o)`, "clip-path": `url(#${id}c)`, class: "ombre-anneau" }, t);
    // Bras proche, nu, main sur le cœur
    M(g, [[-10, -39.5], [-11.6, -33], [-5, -34.6]], 5.6, peau);
    moufle(g, -4.4, -34.8, 3.3, peau, 1, 3);
    el("path", { d: "M -14.2,-31.4 Q -12.4,-29.6 -9.6,-30.6", fill: "none", stroke: OMBRE, "stroke-width": 2.2, opacity: .14, "stroke-linecap": "round" }, g);
    // Tête en écusson : front large et plat, côtés droits, menton en pointe nette de blason
    const h = G(g, { class: "tete" });
    P(h, c.f ? "M -14,-69.5 Q -14,-72 -11.5,-72 L 11.5,-72 Q 14,-72 14,-69.5 L 14,-58 C 14,-50.8 6.8,-45.2 3,-40.8 C -.8,-45.2 -14,-50.8 -14,-58 Z"
      : "M -14,-70 Q -14,-72 -12,-72 L 12,-72 Q 14,-72 14,-70 L 14,-57.5 C 14,-50.5 6.4,-44.8 3,-40.4 C -.4,-44.8 -14,-50.5 -14,-57.5 Z", peau);
    el("path", { d: "M -13,-58 Q -13,-50.5 -3,-43.6 Q -10,-51 -10.5,-59 Z", fill: OMBRE, opacity: .08 }, h);
    yeux(h, c, { p: [[1, -59.5], [8.5, -59.5]], rx: 2, ry: 2.6 });
    joues(h, [[-2, -55], [11, -55]], 2.4, 1.4);
    nez(h, c, 5.2, -55.8, 1.4);
    bouche(h, 4.5, -51, "doux", 5);
    // Cheveux : ils épousent le haut plat de l'écusson, les côtés droits restent visibles
    P(h, "M -14.7,-62.5 L -14.7,-70.6 Q -14.7,-73.2 -12,-73.2 L 12,-73.2 Q 14.7,-73.2 14.7,-70.6 L 14.7,-67.4 Q 11,-69.4 6,-67.8 Q 1,-69.8 -4,-67.4 Q -9,-67.2 -11.6,-64.8 Q -13,-63 -14.7,-62.5 Z", c.poils);
    if (c.f && c.coiffure !== "courte") { // couronne tressée
      for (let i = 0; i < 6; i++) E(h, -11.5 + i * 4.6, -71.6, 2.6, 1.9, c.poils);
    }
    // Moitié basse de l'anneau, devant
    anneau(g, true, k, id);
  };

  // 5. Fromagicien : le disque troué. La Collerette d'affinage encadre la tête par derrière.
  // Déployée (échelle 1), elle tient dans 16 unités de jeu de part et d'autre ; repliée au repos à 0,92.
  const COLLERETTE = { cx: -.8, cy: -59, rx: 30.6, ry: 29.2, trous: [[-22, -65.5, 5.2], [3.2, -80.2, 4.4], [21.2, -53.2, 4.6]] };
  function collerette(g, c, k) {
    const { cx, cy, rx, ry, trous } = COLLERETTE, n = 14, pts = [], ctl = [];
    for (let i = 0; i <= n; i++) {
      const a = -Math.PI / 2 + i * 2 * Math.PI / n, b = a + Math.PI / n;
      pts.push([cx + (rx - 1.3) * Math.cos(a), cy + (ry - 1.3) * Math.sin(a)]);
      ctl.push([cx + (rx + 1.9) * Math.cos(b), cy + (ry + 1.9) * Math.sin(b)]);
    }
    let d = `M${fx(pts[0])}`;
    for (let i = 1; i <= n; i++) d += ` Q${fx(ctl[i - 1])} ${fx(pts[i])}`;
    d += " Z";
    let dt = "";
    trous.forEach(([x, y, r]) => { dt += ` M${x - r},${y} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0 Z`; });
    const gc = G(g, { class: "signature collerette", "data-pivot": `${cx} ${cy}`, transform: k !== 1 ? autour(cx, cy, k) : null });
    const croute = c.croute;
    P(gc, d + dt, croute, { "fill-rule": "evenodd" });
    // bord de croûte, plus foncé, et lumière douce vers le centre
    el("ellipse", { cx, cy, rx: rx - 3, ry: ry - 3, fill: "none", stroke: teinte(croute, -.18), "stroke-width": 1.8, opacity: .45 }, gc);
    el("path", { d: `M${cx - rx * .62} ${cy - ry * .62} A${rx - 2} ${ry - 2} 0 0 1 ${cx + rx * .1} ${cy - ry + 2.1}`, fill: "none", stroke: "#FFFFFF", "stroke-width": 1.6, opacity: .45, "stroke-linecap": "round" }, gc);
    // les trous, les « yeux » du fromage : un bord intérieur plus sombre pour bien les détacher
    trous.forEach(([x, y, r]) => {
      el("circle", { cx: x, cy: y, r: r + .9, fill: "none", stroke: teinte(croute, -.3), "stroke-width": 1.8, opacity: .6 }, gc);
      el("path", { d: `M${x - r + .4} ${y + 1} A${r - .4} ${r - .4} 0 0 0 ${x + r - .4} ${y + 1}`, fill: "none", stroke: "#FFFFFF", "stroke-width": 1.2, opacity: .35 }, gc);
    });
    // Affinage : la lueur est un anneau lumineux sur le bord du trou, le centre reste vide
    if (c.lueur) trous.slice(0, c.lueur).forEach(([x, y, r]) => {
      el("circle", { cx: x, cy: y, r: r + 1.6, fill: "none", stroke: c.elem, "stroke-width": 3, opacity: .35 }, gc);
      el("circle", { cx: x, cy: y, r: r - .2, fill: "none", stroke: c.elem, "stroke-width": 1.8, opacity: .95 }, gc);
    });
  }
  PLANS.fromagicien = c => {
    const { g, peau } = c;
    ombre(g, 26);
    collerette(g, c, c.etat === "deploye" ? 1 : .92);
    // Bras lointain, nu
    const lo = loin(g, 12, -38);
    M(lo, [[12, -38], [16, -27.5]], 6, c.peauL);
    moufle(lo, 16.4, -26.4, 3, c.peauL, 1);
    // Jambes courtes et droites, tibias nus
    jambe(g, c, [[5.5, -23], [5.5, -5]], 7.6, true); sabot(g, c, 6.8, -3.4, 5, 3, true);
    jambe(g, c, [[-5.5, -23], [-5.5, -4.5]], 7.6); sabot(g, c, -5, -3, 5, 3);
    // Cou, torse compact
    R(g, -4.5, -44, 9, 6, 1, c.peauL);
    const t = G(g, { class: "torse", transform: c.f ? "scale(.96 1)" : null });
    R(t, -12, -40, 24, 18.5, 6, peau);
    tenue(t, {
      tunique: "M -5.6,-40 L -8.6,-40 Q -10,-35 -12,-31.5 L -12,-21.5 L -12.4,-18.2 Q 0,-16.6 12.4,-18.2 L 12,-21.5 L 12,-31.5 Q 10.4,-35 9.6,-40 L 6.6,-40 Q .5,-33 -5.6,-40 Z",
      ombre: "M -11.5,-31.4 L -11.5,-21.5 L -11.9,-18.4 L -8.6,-18 L -8.4,-21.6 L -8.4,-34.6 Z",
      ourlet: "M -12.1,-20 Q 0,-18.4 12.1,-20",
      reflet: { cx: -6.6, cy: -27.4, rx: 2.4, ry: 1.7 },
      tablier: "M -2.5,-35 L 10.5,-35 L 11,-19.6 L -3,-19.6 Z",
      lien: [-29.5, -2.8, 11]
    });
    // Nattes de la Fromagicienne, devant la collerette sans couvrir ses trous
    if (c.f && c.coiffure !== "courte") [[-13.4, -56.5, 2.7], [-14.2, -52, 2.6], [-14.8, -47.6, 2.5], [-15.2, -43.4, 2.3], [-15.4, -39.6, 2]].forEach(([x, y, r]) => E(g, x, y, r, r * .9, c.poils));
    // Bras proche, nu, mains fines de prestidigitateur
    M(g, [[-12, -38], [-16, -27.5]], 6, peau);
    moufle(g, -16.4, -26.4, 3, peau, -1);
    // Tête large et plate : dessus plat en ellipse, flancs droits
    const h = G(g, { class: "tete" });
    const rb = c.f ? 8 : 6;
    P(h, `M -15,-68 L -15,${-42.5 - rb} Q -15,-42.5 ${-15 + rb},-42.5 L ${15 - rb},-42.5 Q 15,-42.5 15,${-42.5 - rb} L 15,-68 A 15 4.4 0 0 0 -15,-68 Z`, peau);
    el("path", { d: "M -14,-66 L -14,-50 Q -13,-44.5 -8,-43.5 Q -11.5,-52 -11,-66 Z", fill: OMBRE, opacity: .08 }, h);
    yeux(h, c, { p: [[1, -56.5], [8.5, -56.5]], rx: 2, ry: 2.6 });
    joues(h, [[-2, -51.5], [11, -51.5]], 2.4, 1.4);
    nez(h, c, 5.2, -52.5, 1.6);
    bouche(h, 4.6, -47.6, "doux", 5);
    // Cheveux : une frange qui tombe du bord avant et une mèche sur le côté ; le dessus reste en peau
    P(h, "M -15.6,-67.6 L -15,-68 A 15 4.4 0 0 0 11.6,-65.2 Q 11.4,-62.4 9.6,-61.4 Q 7.8,-63.2 5.6,-60.6 Q 3.6,-62.8 1.4,-60.2 Q -1.2,-62.6 -3.6,-60.2 Q -6,-62.4 -8.2,-60.2 Q -10.2,-61.8 -11.4,-59.6 Q -12.6,-56.8 -12.8,-53.2 Q -14.4,-54.4 -15.6,-52.2 Z", c.poils);
    T(h, "M -12.6,-62.6 Q -13.4,-58.6 -13.6,-55", teinte(c.poils, .3), .9, { opacity: .7 });
    // le dessus plat de la tête, en peau plus claire
    el("ellipse", { cx: 0, cy: -68, rx: 14.25, ry: 3.7, fill: lumiere(peau, .16) }, h);
    T(h, "M -9,-69.6 Q 0,-71.6 9,-69.8", "#FFFFFF", 1.3, { opacity: .35 });
  };

  // 6. Merlanceur : le I à voile. Le plus élancé, une nageoire dorsale à rayons dans le dos.
  // La Voile est une nageoire dorsale de poisson-voilier, jamais un éventail ni une aile : cinq rayons
  // partent chacun de leur point de la colonne, de la nuque au milieu du dos ; le premier, près de la nuque,
  // est le plus haut, puis le bord libre descend en pente douce vers le milieu du dos. La membrane est en
  // peau franche, opaque, en dégradé continu (aucune bande : des bandes claires et foncées feraient lire
  // une coiffe à plumes), avec un fin liseré nacré le long du bord ;
  // le bord se creuse en festons larges entre deux rayons, et chaque rayon dépasse de 2 en épine arrondie.
  // Ce qui dépasse au-dessus du crâne reste derrière la nuque. À marée basse, les rayons se couchent.
  const VOILE = {
    base: [[-3.4, -62], [-9, -38]],
    // pied (fraction de la base) et pointe à marée haute : le plus haut devant, puis de plus en plus court
    rayons: [[.02, [-14, -89.4]], [.24, [-21.4, -83]], [.46, [-25.8, -73.6]], [.68, [-27.4, -62.6]], [.88, [-25.6, -51.4]]]
  };
  function voile(g, c, basse) {
    const [B0, B1] = VOILE.base, base = lumiere(c.peau, .04), bout = lumiere(c.peau, .15), nacre = lumiere(c.peau, .4);
    const rayon = teinte(base, -.3), Bm = vers(B0, B1, .5), EPINE = 1.8;
    const R_ = VOILE.rayons.map(([s, p]) => {
      const b = vers(B0, B1, s); let dx = p[0] - b[0], dy = p[1] - b[1], L = Math.hypot(dx, dy), q = Math.atan2(dy, dx);
      if (basse) { q -= 20 * Math.PI / 180; L *= .65; }
      const dir = [Math.cos(q), Math.sin(q)];
      return { b, dir, tip: [b[0] + dir[0] * L, b[1] + dir[1] * L], e: [b[0] + dir[0] * (L - EPINE), b[1] + dir[1] * (L - EPINE)] };
    });
    // festons concaves, larges et doux : entre deux rayons, le bord se creuse vers la colonne
    const creux = (p, q, prof) => {
      const m = vers(p, q, .5); let nx = q[1] - p[1], ny = p[0] - q[0]; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
      if (nx * (Bm[0] - m[0]) + ny * (Bm[1] - m[1]) < 0) { nx = -nx; ny = -ny; }
      return [m[0] + nx * prof * 2, m[1] + ny * prof * 2];
    };
    let bord = `M${fx(R_[0].e)}`;
    for (let i = 0; i < R_.length - 1; i++) bord += ` Q${fx(creux(R_[i].e, R_[i + 1].e, basse ? .45 : .6))} ${fx(R_[i + 1].e)}`;
    const forme = `M${fx(B0)} L${bord.slice(1)} Q${fx(creux(R_[R_.length - 1].e, B1, 1.1))} ${fx(B1)} Z`;
    const vg = G(g, { class: "signature voile", "data-pivot": "-7 -45" });
    const id = "orv-voile-" + (++uid), defs = el("defs", {}, vg);
    const loin = R_.reduce((a, r) => [a[0] + r.e[0] / R_.length, a[1] + r.e[1] / R_.length], [0, 0]);
    const lg = el("linearGradient", { id, gradientUnits: "userSpaceOnUse", x1: Bm[0], y1: Bm[1], x2: loin[0], y2: loin[1] }, defs);
    [[0, base], [.35, base], [1, bout]].forEach(([o, col]) => el("stop", { offset: o, "stop-color": col }, lg));
    el("path", { d: forme }, el("clipPath", { id: id + "c" }, defs));
    // (le liseré nacré, 2 unités le long du bord libre, est peint à l'intérieur de la membrane, plus bas)
    // chaque rayon dépasse du bord en épine souple : un petit bout effilé et arrondi, de la teinte du bord
    const cb = teinte(bout, -.35);
    R_.forEach(r => {
      const nrm = [-r.dir[1], r.dir[0]], a = [r.e[0] - r.dir[0] * .8 + nrm[0] * 1.8, r.e[1] - r.dir[1] * .8 + nrm[1] * 1.8], b = [r.e[0] - r.dir[0] * .8 - nrm[0] * 1.8, r.e[1] - r.dir[1] * .8 - nrm[1] * 1.8];
      const t1 = [r.tip[0] + nrm[0] * .75, r.tip[1] + nrm[1] * .75], t2 = [r.tip[0] - nrm[0] * .75, r.tip[1] - nrm[1] * .75];
      el("path", { d: `M${fx(a)} Q${fx(vers(a, t1, .6))} ${fx(t1)} Q${fx([r.tip[0] + r.dir[0] * 1.1, r.tip[1] + r.dir[1] * 1.1])} ${fx(t2)} Q${fx(vers(b, t2, .6))} ${fx(b)} Z`, fill: bout, stroke: cb, "stroke-width": 1.1, "stroke-linejoin": "round" }, vg);
    });
    // la membrane par-dessus la racine des épines, puis les rayons fins, un ton plus soutenu
    el("path", { d: forme, fill: `url(#${id})` }, vg);
    T(vg, bord, nacre, 1.6, { "clip-path": `url(#${id}c)`, opacity: .5 });
    T(vg, bord, "#FFFFFF", 1.2, { "clip-path": `url(#${id}c)`, opacity: .22, transform: "translate(.5 .5)" });
    R_.forEach(r => {
      const m = vers(r.b, r.e, .55), nrm = [-r.dir[1], r.dir[0]];
      T(vg, `M${fx(r.b)} Q${fx([m[0] + nrm[0] * .45, m[1] + nrm[1] * .45])} ${fx([r.tip[0] - r.dir[0] * .8, r.tip[1] - r.dir[1] * .8])}`, rayon, 1.2, { opacity: .8 });
    });
    el("path", { d: forme, fill: "none", stroke: cb, "stroke-width": EP, "stroke-linejoin": "round" }, vg);
    return vg;
  }
  PLANS.merlanceur = c => {
    const { g, peau } = c, cou = c.f ? 1 : 0;
    ombre(g, 22);
    // La Voile, dans le dos (haut gauche), dessinée en premier
    voile(g, c, c.etat === "maree-basse");
    // Bras lointain, nu
    const lo = loin(g, 10, -49);
    M(lo, [[10, -49], [13, -36], [14, -22.5]], 6, c.peauL);
    moufle(lo, 14.2, -21.2, 3.4, c.peauL, 1);
    // Longues jambes serrées, tibias nus
    jambe(g, c, [[4.5, -31], [4.8, -5]], 7, true); sabot(g, c, 6.2, -3.2, 5, 2.5, true);
    jambe(g, c, [[-4.5, -31], [-4.5, -4.5]], 7); sabot(g, c, -3.8, -2.5, 5, 2.5);
    // Long cou, torse fin
    R(g, -3.5, -59 - cou, 7, 10 + cou, 1.5, c.peauL);
    const t = G(g, { class: "torse", transform: c.f ? "scale(.96 1)" : null });
    P(t, "M -10,-49 Q -10,-52 -8,-52 L 8,-52 Q 10,-52 10,-49 L 7.5,-36 L 8,-29.5 L -8,-29.5 L -7.5,-36 Z", peau);
    tenue(t, {
      tunique: "M -4.4,-52 L -7.2,-52 Q -8,-46.8 -9.2,-45 L -7.5,-36 L -8,-29.5 L -8.8,-24 Q 0,-22.4 8.8,-24 L 8,-29.5 L 7.5,-36 L 9.2,-45 Q 8,-46.8 7.6,-52 L 5,-52 Q .3,-44.6 -4.4,-52 Z",
      ombre: "M -8.9,-45 L -7.2,-36 L -7.7,-29.5 L -8.4,-24.2 L -5.6,-23.6 L -5,-30 L -5.4,-44 Z",
      ourlet: "M -8.6,-25.8 Q 0,-24.2 8.6,-25.8",
      reflet: { cx: -5, cy: -40.5, rx: 1.6, ry: 2.6 },
      tablier: "M -2,-46.4 L 8.4,-46.4 L 6.8,-36 L 7.2,-25.4 L -3,-25.4 L -2.6,-36 Z",
      lien: [-36, -2.6, 7.2]
    });
    // Queue basse de la Merlanceuse, ramenée sur l'épaule avant, jamais sur la Voile
    if (c.f && c.coiffure !== "courte") P(g, `M 6,${-64 - cou} Q 12.5,${-61 - cou} 12,-51 Q 11.5,-45 13,-41 Q 9,-42 8.5,-47 Q 8,-53 4.5,${-58 - cou} Z`, c.poils);
    // Bras proche, nu, le plus long du roster
    M(g, [[-10, -49], [-13, -36], [-14, -22.5]], 6, peau);
    moufle(g, -14.2, -21.2, 3.4, peau, -1);
    const ec = lumiere(peau, .35); // écailles en losange sur l'avant-bras
    [[-13.1, -33.2], [-13.5, -30], [-13.9, -26.8]].forEach(([x, y]) => el("path", { d: `M${x} ${y - 1.6} l1.3 1.6 l-1.3 1.6 l-1.3 -1.6 Z`, fill: ec, opacity: .85 }, g));
    // Tête en olive, étroite, penchée vers l'avant comme celle d'un nageur
    const h = G(g, { class: "tete", transform: cou ? "translate(0 -1)" : null });
    E(h, 1.5, -69.5, 10, 13.6, peau, { transform: "rotate(12 1.5 -69.5)" });
    el("path", { d: "M -6.8,-62 Q -9,-70 -6,-78 Q -6,-68 -1.5,-59 Q -5,-59.5 -6.8,-62 Z", fill: OMBRE, opacity: .08 }, h);
    yeux(h, c, { p: [[.2, -69.5], [7.6, -68.8]], rx: 2.9, ry: 3.3, sourcils: 1.8 });
    // deux petites écailles ton sur ton, avec un reflet nacré, sous l'œil +x seulement (jamais sur les deux joues)
    [[9.2, -64.3, 1], [11.2, -63.7, .85]].forEach(([x, y, k]) => {
      el("path", { d: `M${x} ${y - 1.4 * k} l${k} ${1.4 * k} l${-k} ${1.4 * k} l${-k} ${-1.4 * k} Z`, fill: lumiere(peau, .22), opacity: .75 }, h);
      el("path", { d: `M${x} ${y - 1.4 * k} l${k * .55} ${.77 * k} l${-k * .55} ${.2 * k} Z`, fill: "#FFFFFF", opacity: .3 }, h);
    });
    nez(h, c, 5, -64.2, 1.1);
    bouche(h, 4.4, -60.6, "doux", 4.2);
    // Cheveux courts lissés en arrière
    P(h, c.f ? "M 11.5,-78.6 Q 5,-85.4 -2.5,-82.8 Q -9.8,-80.2 -10.4,-71 Q -10.4,-64.5 -7.6,-61.2 Q -7.2,-69.5 -4.2,-73.4 Q 0,-77.2 5.2,-76.8 Q 9,-77.4 11.5,-78.6 Z"
      : "M 11.5,-78.2 Q 5,-85.2 -2.5,-82.8 Q -9.8,-80.2 -10.4,-72 Q -10.4,-66.5 -8.2,-63.2 Q -7.6,-70 -4.6,-73.8 Q 0,-77.4 5.2,-76.6 Q 9,-77 11.5,-78.2 Z", c.poils);
    T(h, "M 6.4,-80.6 Q -.6,-82.2 -5.8,-77.6 M 2.4,-78.6 Q -3.4,-78.6 -7,-73", teinte(c.poils, .3), .9, { opacity: .7 });
  };

  // 7. Traîtreur : la crosse. Une pique à cocktail rigide part du crâne, coudée net, et plonge devant le visage.
  // olive farcie (et autres bouchées), enfilée par le milieu, l'axe de la pique tourné de « ang » degrés
  function bouchee(g, type, x, y, ang) {
    const rot = `rotate(${ang} ${x} ${y})`;
    if (type === "tomate") { E(g, x, y, 4.6, 4.3, "#D9493A"); el("path", { d: `M${x - 2} ${y - 4} l2 1.2 l2 -1.2`, fill: "none", stroke: "#4E7A3A", "stroke-width": 1.2, transform: rot }, g); }
    else if (type === "petit-four") { const q = G(g, { transform: rot }); R(q, x - 4.5, y - 4, 9, 8, 2, "#E9B9C4"); el("rect", { x: x - 4.5, y: y - 4, width: 9, height: 3, rx: 1.5, fill: "#FFFFFF", opacity: .8 }, q); }
    else if (type === "verrine") { const q = G(g, { transform: rot }); P(q, `M${x - 4} ${y - 5} L${x + 4} ${y - 5} L${x + 3} ${y + 4.5} L${x - 3} ${y + 4.5} Z`, "#F4ECD8"); el("rect", { x: x - 3.3, y: y - .5, width: 6.6, height: 4.5, fill: "#C9584A", opacity: .8 }, q); }
    else {
      const q = G(g, { transform: rot });
      E(q, x, y, 4, 5.2, "#7C8C3A");
      el("ellipse", { cx: x, cy: y - 4.7, rx: 1.9, ry: 1, fill: "#D04A3C", stroke: teinte("#D04A3C", -.35), "stroke-width": .6 }, q);
      el("ellipse", { cx: x - 1.6, cy: y - .4, rx: 1, ry: 2.4, fill: "#FFFFFF", opacity: .45 }, q);
    }
  }
  PLANS.traitreur = c => {
    const { g, peau } = c;
    ombre(g, 16);
    // Petite queue dans la nuque (Traîtreuse), derrière la tête
    if (c.f && c.coiffure !== "courte") P(g, "M -7,-45 Q -14,-44 -15.5,-37 Q -15.5,-33.5 -13.5,-32 Q -12.5,-36 -9,-38 Q -6.5,-40 -5.5,-42 Z", c.poils);
    // Bras lointain, nu : la main est cachée dans le dos
    const lo = loin(g, 6, -28.5);
    M(lo, [[6, -28.5], [8, -23]], 4, c.peauL);
    // Jambes fines, sur la pointe des pieds, tibias nus
    jambe(g, c, [[3.5, -18], [3.5, -6]], 4.5, true);
    P(g, "M 1.5,-6.5 L 6.5,-6.5 L 8.5,-.6 L 5.5,-.6 Z", teinte(SABOT, -.12));
    jambe(g, c, [[-3.5, -18], [-3.5, -6]], 4.5);
    P(g, "M -5.5,-6 L -.5,-6 L 1.5,0 L -1.5,0 Z", SABOT);
    // Torse à la taille marquée
    const t = G(g, { class: "torse", transform: c.f ? "scale(.96 1)" : null });
    P(t, "M -7,-30 L 7,-30 Q 6,-24 5,-22 Q 6,-19 6,-17 L -6,-17 Q -6,-19 -5,-22 Q -6,-24 -7,-30 Z", peau);
    tenue(t, {
      tunique: "M -3.4,-30 L -5.8,-30 Q -5.8,-27.4 -6.4,-25.6 Q -5.6,-24 -5,-22 Q -6,-19 -6.2,-17 L -6.7,-14.6 Q 0,-13.2 6.7,-14.6 L 6.2,-17 Q 6,-19 5,-22 Q 5.6,-24 6.4,-25.6 Q 5.8,-27.4 5.8,-30 L 4,-30 Q .4,-24.8 -3.4,-30 Z",
      ombre: "M -5.8,-28 Q -6,-26.6 -6.2,-25.6 Q -5.4,-24 -4.8,-22 Q -5.8,-19 -6,-17 L -6.4,-14.8 L -4.2,-14.4 Q -3.8,-19 -3.6,-22 Q -4,-25 -4,-28.4 Z",
      ourlet: "M -6.4,-16.1 Q 0,-14.7 6.4,-16.1",
      reflet: { cx: -3.4, cy: -20.4, rx: 1.1, ry: 1.5 },
      tablier: "M -1.5,-26.4 L 5.8,-26.4 Q 5.2,-23.6 4.4,-22 Q 5.4,-19 5.4,-15.8 L -2.4,-15.8 Q -2.8,-19 -2,-22 Q -2.8,-24 -1.5,-26.4 Z",
      lien: [-22, -2.4, 4.8]
    });
    // Bras proche, nu, main ouverte comme pour présenter un plateau
    M(g, [[-6, -28.5], [-11, -20.5]], 4, peau);
    E(g, -12, -19.6, 3, 1.9, peau, { transform: "rotate(-12 -12 -19.6)" });
    E(g, -10, -21.2, 1.2, .9, peau);
    // Tête en goutte, comme une flamme de bougie
    const h = G(g, { class: "tete" });
    P(h, "M 4,-56 C 9,-52 11.5,-47 11.5,-40.5 A 10.5 10.5 0 0 1 -9.5,-40.5 C -9.5,-48 -3,-53 4,-56 Z", peau);
    el("path", { d: "M -8.5,-36 Q -9.5,-42 -7,-47 Q -7,-40 -3,-31.5 Q -7,-32.5 -8.5,-36 Z", fill: OMBRE, opacity: .08 }, h);
    // grands yeux ronds bien ouverts, un sourcil levé, sourire en coin
    yeux(h, c, { p: [[.6, -41.4], [7.4, -41.4]], rx: 2.5, ry: 3, sourcils: 1.8, malin: true });
    joues(h, [[-2.5, -37], [9.8, -37]], 2, 1.2, .28);
    nez(h, c, 5.4, -37.6, 1.5);
    bouche(h, 4.6, -34.4, "coin", 5.2);
    // Cheveux plaqués en arrière : une bande lisse sur l'arrière du crâne
    P(h, c.f ? "M 4,-55.6 C -2.5,-53 -9.6,-48.5 -9.9,-41.5 Q -9.9,-38 -8.8,-36 Q -8.2,-42 -5.6,-46 Q -1.5,-50.8 4,-55.6 Z"
      : "M 4,-55.6 C -2.5,-53 -9.6,-48.5 -9.9,-41.5 Q -9.9,-38.5 -9.1,-37 Q -8.3,-42.5 -5.4,-46.4 Q -1.3,-51 4,-55.6 Z", c.poils);
    T(h, "M 1.8,-53.3 Q -4,-50.3 -7.2,-44.6", teinte(c.poils, .35), .9, { opacity: .7 });
    // La Pique : une mèche raidie, deux segments droits et un coude net. La montée est entièrement de la
    // couleur des cheveux : elle naît de la ligne des cheveux comme un petit épi raidi. Au coude, la mèche
    // se torsade et devient le bois clair d'une pique à cocktail, qui redescend droit devant le visage.
    // La bouchée est enfilée au milieu de la descente, la pointe ressort dessous : rien ne pend.
    const B = [3.4, -54.4], C = [12.2, -64.6], Q = [21.6, -42.6];
    const pq = G(g, { class: "signature pique", "data-pivot": "4 -56" });
    const n1 = (() => { const l = Math.hypot(C[0] - B[0], C[1] - B[1]); return [(C[0] - B[0]) / l, (C[1] - B[1]) / l]; })();
    const n2 = (() => { const l = Math.hypot(Q[0] - C[0], Q[1] - C[1]); return [(Q[0] - C[0]) / l, (Q[1] - C[1]) / l]; })();
    const pp = (p, d, k, w) => [p[0] + d[0] * k - d[1] * w, p[1] + d[1] * k + d[0] * w];
    // coude net : les bords des deux segments se coupent en onglet (coin extérieur et coin intérieur)
    const W1 = 1.6, W2 = 1.55;
    const coin = (w1, w2) => { // intersection du bord de la montée (décalé de w1) et du bord de la descente (décalé de w2)
      const a = pp(C, n1, 0, w1), b = pp(C, n2, 0, w2), det = n1[0] * n2[1] - n1[1] * n2[0];
      const t = ((b[0] - a[0]) * n2[1] - (b[1] - a[1]) * n2[0]) / det; return [a[0] + n1[0] * t, a[1] + n1[1] * t];
    };
    const cE = coin(-W1, -W2), cI = coin(W1, W2);
    // descente : bois clair, droite, effilée en pointe
    const bois = `M${fx(cE)} L${fx(pp(Q, n2, -3, -1.25))} L${fx(Q)} L${fx(pp(Q, n2, -3, 1.25))} L${fx(cI)} Z`;
    P(pq, bois, BOIS);
    T(pq, `M${fx(pp(C, n2, 4.6, -.5))} L${fx(pp(Q, n2, -6, -.4))}`, "#FFFFFF", .8, { opacity: .55 });
    // au coude, la torsade : le bout de la mèche s'enroule deux fois autour du bois, puis le bois file seul
    const id = "orv-pique-" + (++uid);
    el("path", { d: bois }, el("clipPath", { id }, el("defs", {}, pq)));
    const tq = G(pq, { "clip-path": `url(#${id})` });
    [.4, 2.5].forEach(k => el("path", { d: `M${fx(pp(C, n2, k, -2))} L${fx(pp(C, n2, k + 1.1, -2))} L${fx(pp(C, n2, k + 2.3, 2))} L${fx(pp(C, n2, k + 1.2, 2))} Z`, fill: c.poils, stroke: bord(c.poils), "stroke-width": .55 }, tq));
    el("path", { d: bois, fill: "none", stroke: bord(BOIS), "stroke-width": EP, "stroke-linejoin": "round" }, pq);
    // montée : la mèche raidie, de la couleur des cheveux, qui sort de la pointe du crâne comme un épi :
    // ses deux bords partent du contour de la tête et s'y raccordent en douceur (aucun col, aucun anneau)
    const gA = [1.06, -54.29], dA = [5.69, -54.5]; // départs sur le contour de la tête, côté nuque et côté front
    const bordG = `M${fx(gA)} Q${fx(pp(B, n1, 1.2, -1.95))} ${fx(pp(B, n1, 3.2, -W1 - .15))} L${fx(cE)}`;
    const bordD = `M${fx(dA)} Q${fx(pp(B, n1, 1.2, 1.95))} ${fx(pp(B, n1, 3.2, W1 + .15))} L${fx(cI)}`;
    el("path", { d: `${bordG} L${fx(cI)} L${fx(pp(B, n1, 3.2, W1 + .15))} Q${fx(pp(B, n1, 1.2, 1.95))} ${fx(dA)} Q${fx([3.4, -53.6])} ${fx(gA)} Z`, fill: c.poils }, pq);
    [bordG, bordD, `M${fx(cE)} L${fx(cI)}`].forEach(d => el("path", { d, fill: "none", stroke: bord(c.poils), "stroke-width": EP, "stroke-linecap": "round", "stroke-linejoin": "round" }, pq));
    // deux fils de mèche, pour qu'on lise des cheveux même quand ils sont aussi clairs que le bois
    T(pq, `M${fx(pp(B, n1, 2.4, -.6))} L${fx(pp(C, n1, -1.6, -.5))}`, teinte(c.poils, -.28), .7, { opacity: .8 });
    T(pq, `M${fx(pp(B, n1, 3.4, .8))} L${fx(pp(C, n1, -2.4, .6))}`, lumiere(c.poils, .35), .7, { opacity: .7 });
    // au coude, la tête de la pique : un petit nœud contrasté qui déborde du bois des deux côtés
    { const K = pp(C, n2, 2, 0), ang = Math.atan2(n2[1], n2[0]) * 180 / Math.PI + 90, kn = teinte(c.poils, luma(c.poils) > .6 ? -.38 : -.2);
      el("ellipse", { cx: K[0], cy: K[1], rx: 2.5, ry: 1.7, fill: kn, stroke: bord(kn), "stroke-width": 1, transform: `rotate(${ang.toFixed(1)} ${K[0].toFixed(2)} ${K[1].toFixed(2)})` }, pq);
      el("ellipse", { cx: K[0] - .6, cy: K[1] - .5, rx: .7, ry: .45, fill: "#FFFFFF", opacity: .55 }, pq); }
    const mo = vers(C, Q, .55);
    bouchee(pq, c.bouchee, mo[0], mo[1], Math.atan2(n2[1], n2[0]) * 180 / Math.PI - 90);
  };

  // 8. Légumancien : le compas. Grosse tête de radis sur deux longues jambes nues, droites, écartées en A.
  PLANS.legumancien = c => {
    const { g, peau } = c, inv = c.etat === "invocation", enfoui = inv ? 6 : 3, bas = inv ? 20 : 0;
    ombre(g, 19);
    // Les Échalas : jambes longues et droites, en peau, écartées en A, pieds en piquet plantés dans la terre
    const echalas = G(g, { class: "signature echalas" });
    const jambeA = (s, lointaine) => {
      const hx = 3.6 * s, hy = -48 + bas, ax = 15 * s, ay = -7 + (enfoui - 3);
      let pts;
      if (inv) { // genoux pliés, le corps s'abaisse de 20
        const mx = (hx + ax) / 2, my = (hy + ay) / 2, dx = ax - hx, dy = ay - hy, dd = Math.hypot(dx, dy), off = Math.sqrt(Math.max(0, 24 * 24 - dd * dd / 4));
        pts = [[hx, hy], [mx + s * Math.abs(dy) / dd * off * .55, my - Math.abs(dx) / dd * off * .55], [ax, ay]];
      } else pts = [[hx, hy], [(hx + ax) / 2 + s * .4, (hy + ay) / 2], [ax, ay]];
      M(echalas, pts, 6, lointaine ? c.peauL : peau);
      // pied en piquet, en peau : il s'effile sous le sabot et s'enfonce dans le sol (3 à l'arrêt, 6 pour
      // invoquer) ; le sabot brun, le même que celui des autres classes, reste posé sur le cou-de-pied
      const pe = lointaine ? c.peauL : peau, kx = Math.max(.5, 1 - (enfoui - 3) / 6);
      P(echalas, `M ${ax - 2.7 * kx},${ay + .6} L ${ax + 2.7 * kx},${ay + .6} L ${ax + .75 + .5 * s},0 L ${ax - .55 + .5 * s},0 Z`, pe);
      sabot(echalas, c, ax + .4 * s, ay + .2, 4.4, 2.3, lointaine);
      T(echalas, `M${ax - 4.6} 0 L${ax + 5.4} 0`, teinte(TERRE, -.2), 1.3, { opacity: .55 });
    };
    jambeA(1, true); jambeA(-1, false);
    const haut = G(g, { class: "corps-haut", transform: bas ? `translate(0 ${bas})` : null });
    // Cheveux longs de la Légumancienne, derrière la tête, jusqu'aux épaules
    if (c.f && c.coiffure !== "courte") P(haut, "M -17,-80 Q -21,-72 -20.6,-63 Q -20,-57.5 -16,-56 Q -15,-60 -12,-61.5 Q -2,-58.5 8,-60.5 Q 13,-60 16.5,-57 Q 20.4,-60 20.5,-65 Q 20.7,-73 17,-80 Z", c.poils);
    // Bras lointain, nu, près du corps
    const lo = loin(haut, 8.5, -56);
    M(lo, inv ? [[8.5, -56], [11.4, -47.5], [14, -40]] : [[8.5, -56], [11.4, -47.5]], 4.5, c.peauL);
    moufle(lo, inv ? 14.4 : 11.8, inv ? -38.4 : -45.2, 3.4, c.peauL, 1, 4.2);
    // Cou, buste court au petit ventre ferme de tubercule
    R(haut, -3.5, -62, 7, 6, 1, c.peauL);
    const t = G(haut, { class: "torse", transform: c.f ? "scale(.96 1)" : null });
    P(t, "M -8,-58 Q -10,-58 -10,-55 Q -11,-50 -8,-47 Q -7,-45.5 -5.5,-45.5 L 6,-45.5 Q 8,-45.5 8.5,-47 Q 11,-50 10,-55 Q 10,-58 8,-58 Z", peau);
    tenue(t, {
      tunique: "M -4.4,-58 L -7,-58 Q -8.4,-55.2 -10,-53.6 Q -10.6,-51.4 -10.2,-49 L -10.8,-38.6 Q 0,-37 10.8,-38.6 L 10.2,-49 Q 10.8,-51.4 10.2,-53.6 Q 8.8,-55.2 7.8,-58 L 5,-58 Q .3,-51.4 -4.4,-58 Z",
      ombre: "M -9.8,-53.4 Q -10.2,-51.2 -9.8,-49 L -10.3,-38.9 L -7.4,-38.4 L -7,-49 Q -7,-52 -7.6,-55 Z",
      ourlet: "M -10.6,-40.4 Q 0,-38.8 10.6,-40.4",
      reflet: { cx: 3, cy: -50.5, rx: 3, ry: 2 },
      tablier: "M -1.5,-54.2 L 8,-54.2 Q 9.6,-50 8.6,-46 L 8.8,-40 L -2,-40 Q -2.6,-47 -1.5,-54.2 Z",
      lien: [-48.5, -2.2, 9.4]
    });
    // Bras proche, nu, mains larges et plates de jardinier, contre le corps
    M(haut, inv ? [[-8.5, -56], [-11.4, -47.5], [-14, -40]] : [[-8.5, -56], [-11.4, -47.5]], 4.5, peau);
    const mx = inv ? -14.4 : -11.8, my = inv ? -38.4 : -45.2;
    moufle(haut, mx, my, 3.4, peau, -1, 4.2);
    T(haut, `M${mx - 1.2} ${my + 1.4} l.2 2 M${mx + .9} ${my + 1.6} l0 1.8`, teinte(peau, -.35), .7, { opacity: .6 }); // deux plis, rien ne pend
    // Tête de radis rond : plus large que haute, joues pleines, menton en pointe douce
    const h = G(haut, { class: "tete" });
    P(h, "M 2,-59.6 Q -5.5,-60.4 -12.6,-65.6 Q -19,-70.6 -19,-78.4 Q -19,-92 0.5,-92 Q 19,-92 19,-78.4 Q 19,-70.6 14.6,-65.6 Q 8.5,-60.4 2,-59.6 Z", peau);
    el("path", { d: "M -17,-72 Q -14,-65 -5,-61.4 Q -12.5,-66.5 -13.8,-76 Z", fill: OMBRE, opacity: .08 }, h);
    yeux(h, c, { p: [[.5, -76.5], [9.5, -76.5]], rx: 2.4, ry: 3 });
    joues(h, [[-3.4, -70.6], [13.4, -70.6]], 3.4, 1.8, .35);
    nez(h, c, 5.5, -72.4, 1.3);
    bouche(h, 5.2, -67.2, "doux", 5);
    // Cheveux courts et bouclés, sans dépasser du crâne, aucune feuille
    P(h, "M -18.4,-74.5 Q -20,-92 0.5,-92 Q 20,-92 18.4,-77 Q 16,-80.5 12.5,-79.5 Q 10,-82.5 6.5,-80.5 Q 3.2,-83.2 -.2,-80.5 Q -3.8,-83 -7.4,-80 Q -11,-81.6 -13.8,-78 Q -16.6,-78 -18.4,-74.5 Z", c.poils);
    T(h, "M -9,-87 q 2,-1.6 4,0 M 1,-88 q 2,-1.6 4,0 M -3.5,-84.5 q 2,-1.4 4,0 M 6.5,-85 q 2,-1.4 4,0", teinte(c.poils, .28), .9, { opacity: .7 });
  };

  // La croûte de la Collerette : couleur de cheveux mêlée d'ivoire, toujours claire (luminance de 55 à 80 %)
  function croute(poils) {
    let k = .45, c = melange(poils, IVOIRE, k);
    while (luma(c) < .55 && k < 1) { k += .05; c = melange(poils, IVOIRE, k); }
    for (let j = .05; luma(c) > .8 && j <= 1; j += .05) c = melange(melange(poils, IVOIRE, k), CROUTE_DOREE, j);
    return c;
  }

  // ---------- Point d'entrée ----------
  ORVANE.dessinePerso = function (parent, cls, o = {}) {
    const corps = cls.corps || {}, plan = PLANS[corps.plan] || PLANS[cls.id] || PLANS.levainqueur;
    const peau = o.peau || cls.peau || PEAU_DEFAUT, poils = o.poils || cls.poils || POILS_DEFAUT;
    const racine = el("g", { class: "perso perso-" + cls.id }, parent);
    const s = (o.s || 1) * REDUC;
    const g = el("g", { transform: `scale(${(o.sens || 1) * s} ${s})` }, racine);
    // la lueur prend la couleur de l'élément du sort lancé (o.elem : clé d'élément ou couleur), sinon un or chaud neutre
    const elem = (o.elem && (((ORVANE.ELEMENTS || {})[o.elem] || {}).couleur || o.elem)) || "#E0A54A";
    plan({
      g, peau, poils, f: o.sexe === "f", etat: o.etat, elem,
      peauL: teinte(peau, -.12),
      sourcil: teinte(poils, -.3),
      coiffure: o.coiffure,
      grigne: o.grigne || corps.grigne || "croix",
      sucre: SUCRES[o.sucre || corps.sucre] || o.sucre || SUCRES.framboise,
      torsade: o.torsade || corps.torsade || 1,
      glacage: o.glacage || 0,
      croute: croute(poils),
      lueur: o.lueur || 0,
      bouchee: o.bouchee || corps.bouchee || "olive"
    });
    return racine;
  };
  ORVANE.SUCRES = SUCRES;

  // Grumeau : boule de pâte ratée, premier adversaire de l'Astrelier.
  const contour = { stroke: TRAIT, "stroke-opacity": .55, "stroke-width": .8, "stroke-linejoin": "round" };
  const avec = (a, b) => Object.assign({}, b, a);
  ORVANE.dessineGrumeau = function (parent, o = {}) {
    const g = el("g", { transform: `scale(${o.s || 1})` }, parent);
    el("ellipse", { cx: 0, cy: 0, rx: 10, ry: 3.2, fill: TRAIT, opacity: .2 }, g);
    el("path", avec({ d: "M-11 -2 Q-13 -12 -6 -16 Q-2 -21 3 -17 Q11 -17 11 -9 Q13 -3 8 -1 Q0 1 -11 -2z", fill: "#E9DCC0" }, contour), g);
    el("path", { d: "M-9 -4 Q-1 -1 8 -3", stroke: "#C9B48C", "stroke-width": 1.4, fill: "none" }, g);
    [[-6, -14, 1.6], [6, -12, 1.2], [-1, -6, 1]].forEach(([x, y, rr]) => el("circle", { cx: x, cy: y, r: rr, fill: "#D9C39A" }, g));
    el("path", { d: "M-3 -12 l3 1.2 M5.5 -12.4 l-3 1.2", stroke: TRAIT, "stroke-width": .9, "stroke-linecap": "round" }, g);
    el("circle", { cx: -.8, cy: -10, r: 1.1, fill: TRAIT }, g); el("circle", { cx: 3.6, cy: -10.2, r: 1.1, fill: TRAIT }, g);
    el("path", { d: "M-.5 -6.5 q2 -1.2 4 0", stroke: TRAIT, "stroke-width": .8, fill: "none" }, g);
    return g;
  };
})();
