/*
 * Orvane, prototype : dessins SVG qui manquent à persos.js.
 * Même style que ORVANE.dessineGrumeau : sol à y = 0, contour encre à 55 %, pâte crème, ombre chaude.
 *   ORVANE.dessineMietron(parent, { s })      le Mie-tron, petit apprenti de mie coiffé d'un calot
 *   ORVANE.dessineGrumeauChef(parent, { s })  le Grumeau chef, plus gros, croûte dorée et toque de pâte
 *   ORVANE.dessineCommis(parent, { s, nom })  un Commis du Potager (radis par défaut)
 *   ORVANE.dessineMereFournil(parent, { s })  Mère Fournil, la cheffe du Fourneau (personnage non joueur du tutoriel)
 *   ORVANE.dessineDecor(parent, nom)          billot, caisse, four, lanterne (repère d'une case de 64 de large) ; et ceux des îles :
 *                                             four-banal(-eteint), passe-plat, étals, tringle, portant, armoire, moules, pancarte, bidon,
 *                                             lit, bas-toboggan, pilier(-enseigne), sacs
 *   ORVANE.dessineObjetVoyage(parent, nom)    au bord d'une île : monte-plats (mât et poulie) ou treuil, sa caisse, toboggan, Grande Pelle,
 *                                             cadenas ; couverture (la Sieste), flamme (un four qu'on allume)
 *   ORVANE.courbesVoyage                       les courbes du toboggan (départ et arrivée), pour que la glissade suive le dessin
 *   ORVANE.dessineObjetSol(parent, quoi, { couleur })   fournée, piège, graine, ustensile
 *   ORVANE.Proto.ICONES                        icônes en chaînes SVG (éléments, états, toques, tablier…)
 */
window.ORVANE = window.ORVANE || {};
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const TRAIT = "#1D2725";
  const contour = { stroke: TRAIT, "stroke-opacity": .55, "stroke-width": .8, "stroke-linejoin": "round", "stroke-linecap": "round" };
  const avec = (a, b) => Object.assign({}, b, a);
  function el(n, a, p) { const e = document.createElementNS(NS, n); for (const k in a) if (a[k] !== undefined && a[k] !== null) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }

  // ---------- Mie-tron : un petit apprenti de mie, poreux et pâle, qui jette des miettes ----------
  ORVANE.dessineMietron = function (parent, o = {}) {
    const g = el("g", { transform: `scale(${o.s || 1})` }, parent);
    el("ellipse", { cx: 0, cy: 0, rx: 8.5, ry: 2.8, fill: TRAIT, opacity: .2 }, g);
    // petites jambes de pâte
    el("ellipse", avec({ cx: -3.4, cy: -1.4, rx: 2.3, ry: 1.7, fill: "#E2CFA8" }, contour), g);
    el("ellipse", avec({ cx: 3.2, cy: -1.3, rx: 2.3, ry: 1.7, fill: "#E2CFA8" }, contour), g);
    // bras gauche, le long du corps
    el("path", { d: "M-6.6 -10.5 Q-10 -9 -10.6 -6", stroke: "#8E7E62", "stroke-width": 3.1, fill: "none", "stroke-linecap": "round", opacity: .55 }, g);
    el("path", { d: "M-6.6 -10.5 Q-10 -9 -10.6 -6", stroke: "#F3EAD6", "stroke-width": 2.2, fill: "none", "stroke-linecap": "round" }, g);
    // corps : une mie en poire, ventre rond
    el("path", avec({ d: "M-7.6 -2.6 Q-10.2 -9 -7.4 -14.6 Q-4.4 -19.4 0.6 -19.2 Q5.8 -19 8 -14.2 Q10.4 -8.6 7.8 -2.8 Q0 0 -7.6 -2.6z", fill: "#F4ECDA" }, contour), g);
    // tablier minuscule
    el("path", { d: "M-4.6 -7.6 Q0 -6.6 4.8 -7.8 L4.2 -3 Q0 -2 -4 -2.8z", fill: "#E9DEC7", stroke: "#C9B48C", "stroke-width": .6 }, g);
    // alvéoles de la mie
    [[-5.2, -12.8, 1.1], [5.4, -11.2, .9], [-3.4, -5.6, .7], [6, -6, .8], [1.8, -16.6, .6], [-6.4, -8.6, .6]].forEach(([x, y, r]) =>
      el("ellipse", { cx: x, cy: y, rx: r, ry: r * .8, fill: "#E3D2B0" }, g));
    // bras droit levé : une pincée de miettes
    el("path", { d: "M6.8 -12 Q10.4 -13.4 11.4 -17", stroke: "#8E7E62", "stroke-width": 3.1, fill: "none", "stroke-linecap": "round", opacity: .55 }, g);
    el("path", { d: "M6.8 -12 Q10.4 -13.4 11.4 -17", stroke: "#F3EAD6", "stroke-width": 2.2, fill: "none", "stroke-linecap": "round" }, g);
    [[12.4, -19.2, .9], [10.6, -20.4, .7], [13.6, -21.2, .6]].forEach(([x, y, r]) => el("circle", { cx: x, cy: y, r, fill: "#C98A4A" }, g));
    // visage : yeux décidés, petite bouche
    el("path", { d: "M-3.6 -14.4 l2.4 .8 M4.6 -14.6 l-2.4 .8", stroke: TRAIT, "stroke-width": .8, "stroke-linecap": "round" }, g);
    el("circle", { cx: -2.2, cy: -12.6, r: 1, fill: TRAIT }, g); el("circle", { cx: 2.9, cy: -12.8, r: 1, fill: TRAIT }, g);
    el("path", { d: "M-.6 -9.6 q1.4 1 2.8 0", stroke: TRAIT, "stroke-width": .75, fill: "none", "stroke-linecap": "round" }, g);
    el("ellipse", { cx: -4.6, cy: -10.4, rx: 1.4, ry: .8, fill: "#E27A68", opacity: .3 }, g);
    // calot de mitron, en papier, de travers
    el("path", avec({ d: "M-6.8 -17.4 Q-6.2 -22.6 -.4 -23.4 Q5.6 -23.6 7.4 -18.4 Q.4 -16.4 -6.8 -17.4z", fill: "#FFFDF7" }, contour), g);
    el("path", { d: "M-5.6 -18.6 Q.6 -19.4 6.2 -18.8 M.2 -23.2 L.6 -19.2", stroke: "#D9CDB4", "stroke-width": .7, fill: "none" }, g);
    return g;
  };

  // ---------- Grumeau chef : un gros Grumeau à la croûte dorée, moustache de pâte et toque de pâte crue ----------
  ORVANE.dessineGrumeauChef = function (parent, o = {}) {
    const g = el("g", { transform: `scale(${o.s || 1})` }, parent);
    el("ellipse", { cx: 0, cy: 0, rx: 12.5, ry: 3.8, fill: TRAIT, opacity: .22 }, g);
    // corps : la même boule ratée, plus large, avec des bosses
    el("path", avec({ d: "M-13 -2.4 Q-15.6 -9 -12.4 -14.2 Q-11 -20 -4.6 -20.6 Q-1 -24 4 -21.2 Q11.6 -21.4 12.6 -13.6 Q15.8 -7.4 10.6 -1.6 Q0 1.6 -13 -2.4z", fill: "#E9DCC0" }, contour), g);
    // croûte dorée sur le dessus, à demi cuite
    el("path", { d: "M-11.6 -13.6 Q-10 -19.4 -4.6 -20 Q-1 -23.2 4 -20.6 Q11 -20.8 12 -13.8 Q8 -16.4 3.6 -15.6 Q-1.2 -17.8 -5.2 -15.4 Q-8.6 -16.2 -11.6 -13.6z", fill: "#D9B47C", opacity: .9 }, g);
    el("path", { d: "M-7 -18.2 q2 -1 4 0 M3.6 -19.2 q2 -.8 4 .4", stroke: "#B58A55", "stroke-width": .8, fill: "none", "stroke-linecap": "round" }, g);
    el("path", { d: "M-11 -4.4 Q-1 -1 10 -3.6", stroke: "#C9B48C", "stroke-width": 1.5, fill: "none" }, g);
    [[-8.4, -8, 1.5], [8.2, -7.4, 1.2], [-2.4, -4.6, 1]].forEach(([x, y, r]) => el("circle", { cx: x, cy: y, r, fill: "#D9C39A" }, g));
    // sourcils épais et regard de chef
    el("path", avec({ d: "M-6.4 -14.2 Q-4 -15.8 -1.2 -14.4 L-1.4 -13.2 Q-4 -14.2 -6 -13z", fill: "#C9B48C" }, contour), g);
    el("path", avec({ d: "M2 -14.6 Q4.8 -16 7.4 -14.2 L7 -13.1 Q4.6 -14.4 2.2 -13.4z", fill: "#C9B48C" }, contour), g);
    el("circle", { cx: -3.4, cy: -11.6, r: 1.3, fill: TRAIT }, g); el("circle", { cx: 4.4, cy: -11.8, r: 1.3, fill: TRAIT }, g);
    el("circle", { cx: -3, cy: -12, r: .4, fill: "#FFFDF7" }, g); el("circle", { cx: 4.8, cy: -12.2, r: .4, fill: "#FFFDF7" }, g);
    // moustache : deux boudins de pâte
    el("path", avec({ d: "M.4 -8.6 Q-3 -10.2 -6.6 -8.2 Q-8.4 -7 -7.6 -6 Q-4.4 -7.6 .4 -7.2z", fill: "#F1E6CD" }, contour), g);
    el("path", avec({ d: "M1.2 -8.6 Q4.6 -10.2 8.2 -8.2 Q10 -7 9.2 -6 Q6 -7.6 1.2 -7.2z", fill: "#F1E6CD" }, contour), g);
    el("path", { d: "M-1.6 -4.8 q2.4 -1.4 5 0", stroke: TRAIT, "stroke-width": .8, fill: "none", "stroke-linecap": "round" }, g);
    // toque de pâte crue, un peu affaissée
    el("path", avec({ d: "M-6 -20.4 L-5.4 -24.2 Q-9.4 -25.4 -8.4 -29.4 Q-6.8 -32.6 -3 -30.8 Q-1.4 -34.6 2.6 -33.4 Q6.2 -32.8 6.4 -29.6 Q10 -29.2 9.4 -25.6 Q8.6 -23.4 5.8 -23.8 L6 -20.6 Q0 -18.6 -6 -20.4z", fill: "#F7F0DF" }, contour), g);
    el("path", { d: "M-5.4 -23.8 Q.4 -22.6 5.8 -23.6 M-2.6 -30.2 Q-1.6 -27.4 -2.2 -25 M3 -29.6 Q2.2 -27 3 -24.6", stroke: "#D9CDB4", "stroke-width": .7, fill: "none" }, g);
    return g;
  };

  // ---------- Commis du Potager : un petit légume qui marche ----------
  const LEGUMES = [["#D95B6A", "#6E9E58"], ["#E58A3C", "#6E9E58"], ["#B85CA0", "#7FA35E"], ["#E8D9A0", "#6E9E58"]];
  ORVANE.dessineCommis = function (parent, o = {}) {
    const g = el("g", { transform: `scale(${o.s || 1})` }, parent);
    const nom = String(o.nom || "Radis");
    let h = 0; for (const c of nom) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const [corps, feuille] = /radis/i.test(nom) ? LEGUMES[0] : LEGUMES[h % LEGUMES.length];
    el("ellipse", { cx: 0, cy: 0, rx: 7.5, ry: 2.4, fill: TRAIT, opacity: .2 }, g);
    el("path", { d: "M-2.6 -1 L-3.2 -3.4 M2.6 -1 L3 -3.4", stroke: "#8A6238", "stroke-width": 1.4, "stroke-linecap": "round" }, g);
    el("path", avec({ d: "M0 -3 Q-7.6 -4 -7.4 -10.4 Q-7 -16 0 -16.2 Q7 -16 7.4 -10.4 Q7.6 -4 0 -3z", fill: corps }, contour), g);
    el("path", { d: "M-4.6 -12.6 Q-3.6 -14.4 -1.6 -14.8", stroke: "#FFFFFF", "stroke-width": 1, opacity: .45, fill: "none", "stroke-linecap": "round" }, g);
    el("path", avec({ d: "M0 -16 Q-4.6 -21.6 -2.8 -24 Q.2 -21 0 -16z", fill: feuille }, contour), g);
    el("path", avec({ d: "M.4 -16 Q4.2 -22.4 6.6 -21.4 Q4.6 -17.6 .4 -16z", fill: feuille }, contour), g);
    el("circle", { cx: -2.2, cy: -10.6, r: .95, fill: TRAIT }, g); el("circle", { cx: 2.4, cy: -10.8, r: .95, fill: TRAIT }, g);
    el("path", { d: "M-1 -7.8 q1.2 .9 2.4 0", stroke: TRAIT, "stroke-width": .7, fill: "none", "stroke-linecap": "round" }, g);
    return g;
  };

  // ---------- Mère Fournil : la cheffe du Fourneau, qui donne la quête « Premier service » ----------
  // Une boulangère ronde en robe vert nuit, grand tablier crème, toque haute à épingle dorée, rouleau à pâtisserie en main.
  // Sol à y = 0, sommet de la toque vers −52 (à peu près la taille d'un artisan à la même échelle).
  ORVANE.dessineMereFournil = function (parent, o = {}) {
    const g = el("g", { transform: `scale(${o.s || 1})` }, parent);
    const PEAU = "#E3BC94", ROBE = "#1B3835", ROBE_C = "#2A5049", CREME = "#F4ECDA", OR = "#C5A572", BOIS = "#D9B47C";
    el("ellipse", { cx: 0, cy: 0, rx: 12, ry: 3.7, fill: TRAIT, opacity: .22 }, g);
    // sabots
    el("ellipse", avec({ cx: -4, cy: -1.2, rx: 3.2, ry: 1.7, fill: "#5B4632" }, contour), g);
    el("ellipse", avec({ cx: 4.4, cy: -1, rx: 3.2, ry: 1.7, fill: "#5B4632" }, contour), g);
    // robe en cloche, jusqu'au sol
    el("path", avec({ d: "M-11.4 -2.2 Q-11 -12 -8.2 -20.4 L8.6 -20.4 Q11.2 -12 11.8 -2.2 Q0 1.2 -11.4 -2.2z", fill: ROBE }, contour), g);
    el("path", { d: "M-9.6 -4 Q-9 -11 -7 -18 M9.8 -4 Q9.4 -11 7.6 -18", stroke: ROBE_C, "stroke-width": 1.1, fill: "none", "stroke-linecap": "round" }, g);
    // buste rond
    el("path", avec({ d: "M-8.6 -20 Q-9.6 -27 -6.6 -30.4 Q0 -32.4 6.8 -30.4 Q9.8 -27 8.8 -20 Q0 -18.4 -8.6 -20z", fill: ROBE }, contour), g);
    // grand tablier crème, bavette et liseré doré
    el("path", avec({ d: "M-6.8 -19.6 Q-7.6 -10 -6.4 -2.4 Q0 -.6 6.8 -2.4 Q7.8 -10 7 -19.6z", fill: CREME }, contour), g);
    el("path", avec({ d: "M-4.4 -19.6 L-4 -28.4 Q0 -29.6 4.2 -28.4 L4.6 -19.6z", fill: CREME }, contour), g);
    el("path", { d: "M-6.6 -4.2 Q0 -2.4 6.6 -4.2", stroke: OR, "stroke-width": .9, fill: "none" }, g);
    el("path", { d: "M-7 -19.6 Q0 -18.6 7.2 -19.6", stroke: "#C9B48C", "stroke-width": .8, fill: "none" }, g);
    el("rect", { x: -2.2, y: -13.4, width: 4.4, height: 3.4, rx: .8, fill: "none", stroke: "#C9B48C", "stroke-width": .7 }, g);
    // bras, puis le rouleau à pâtisserie tenu devant elle
    el("path", { d: "M-7.6 -28 Q-11.6 -24 -9.6 -18.6", stroke: "#9C7653", "stroke-width": 4.2, fill: "none", "stroke-linecap": "round" }, g);
    el("path", { d: "M-7.6 -28 Q-11.6 -24 -9.6 -18.6", stroke: PEAU, "stroke-width": 3, fill: "none", "stroke-linecap": "round" }, g);
    el("path", { d: "M7.8 -28 Q11.8 -24 9.8 -18.8", stroke: "#9C7653", "stroke-width": 4.2, fill: "none", "stroke-linecap": "round" }, g);
    el("path", { d: "M7.8 -28 Q11.8 -24 9.8 -18.8", stroke: PEAU, "stroke-width": 3, fill: "none", "stroke-linecap": "round" }, g);
    el("rect", avec({ x: -9.6, y: -19.8, width: 19.6, height: 3.2, rx: 1.6, fill: BOIS }, contour), g);
    el("rect", avec({ x: -13.6, y: -19.1, width: 4.2, height: 1.8, rx: .9, fill: "#B58A55" }, contour), g);
    el("rect", avec({ x: 9.8, y: -19.1, width: 4.2, height: 1.8, rx: .9, fill: "#B58A55" }, contour), g);
    el("circle", avec({ cx: -9.6, cy: -18.4, r: 1.9, fill: PEAU }, contour), g);
    el("circle", avec({ cx: 9.9, cy: -18.4, r: 1.9, fill: PEAU }, contour), g);
    // tête ronde, cheveux gris en chignon sous la toque
    el("ellipse", avec({ cx: .6, cy: -35.6, rx: 6.6, ry: 6.2, fill: PEAU }, contour), g);
    el("path", avec({ d: "M-6 -36.4 Q-6.8 -41.4 -2 -42.2 L4 -42.2 Q8 -41.4 7.2 -36.4 Q6 -39.2 3.6 -39.6 Q.6 -38 -2.4 -39.6 Q-5 -39 -6 -36.4z", fill: "#D9D4C8" }, contour), g);
    el("circle", avec({ cx: -6.4, cy: -38.8, r: 2.1, fill: "#D9D4C8" }, contour), g);
    // visage : yeux rieurs, joues roses, grand sourire
    el("path", { d: "M-2.4 -35.6 q1.1 -1.1 2.2 0 M3 -35.8 q1.1 -1.1 2.2 0", stroke: TRAIT, "stroke-width": .85, fill: "none", "stroke-linecap": "round" }, g);
    el("ellipse", { cx: -3.2, cy: -33.2, rx: 1.5, ry: .9, fill: "#E27A68", opacity: .4 }, g);
    el("ellipse", { cx: 5.6, cy: -33.4, rx: 1.5, ry: .9, fill: "#E27A68", opacity: .4 }, g);
    el("circle", { cx: 1.5, cy: -33.8, r: .8, fill: "#C9946C" }, g);
    el("path", { d: "M-.8 -31.8 Q1.4 -30 3.8 -31.9", stroke: TRAIT, "stroke-width": .85, fill: "none", "stroke-linecap": "round" }, g);
    // toque haute de cheffe, épingle dorée
    el("path", avec({ d: "M-5.2 -41 L-5 -44.2 L6.2 -44.2 L6.4 -41 Q.6 -40 -5.2 -41z", fill: "#FFFDF7" }, contour), g);
    el("path", avec({ d: "M-5 -44 Q-9.2 -45 -8.4 -49 Q-7.2 -52 -3.6 -50.6 Q-2.4 -54.6 1.2 -54 Q4.6 -54.4 5.4 -50.8 Q9.2 -51.6 9.6 -48 Q9.6 -44.8 6.2 -44 Q.6 -43 -5 -44z", fill: "#FFFDF7" }, contour), g);
    el("path", { d: "M-2.4 -44.2 Q-3.2 -47.2 -2.6 -49.6 M2.8 -44 Q2.2 -47.4 3.2 -50", stroke: "#D9CDB4", "stroke-width": .7, fill: "none" }, g);
    el("circle", avec({ cx: 3.6, cy: -42.6, r: 1.1, fill: OR }, contour), g);
    return g;
  };

  // ---------- Décor (repris de la maquette, agrandi pour des cases de 64) ----------
  const boite = (g, cx, cy, a, ht, c) => {
    const b = a / 2;
    el("polygon", { points: `${cx - a},${cy - ht} ${cx},${cy - ht + b} ${cx},${cy + b} ${cx - a},${cy}`, fill: c[1] }, g);
    el("polygon", { points: `${cx},${cy - ht + b} ${cx + a},${cy - ht} ${cx + a},${cy} ${cx},${cy + b}`, fill: c[2] }, g);
    el("polygon", { points: `${cx},${cy - ht - b} ${cx + a},${cy - ht} ${cx},${cy - ht + b} ${cx - a},${cy - ht}`, fill: c[0] }, g);
  };
  const DECORS = {
    four: g => {
      el("ellipse", { cx: 0, cy: 2, rx: 21, ry: 10, fill: "#9C8862" }, g);
      el("path", { d: "M-19 2 Q-19 -34 0 -36 Q19 -34 19 2 Q0 12 -19 2z", fill: "#D9C39A", stroke: TRAIT, "stroke-opacity": .45 }, g);
      el("path", { d: "M-15 -6 Q-15 -28 0 -31 M-8 -33 Q-14 -24 -14 -10", stroke: "#BFA678", "stroke-width": 1.2, fill: "none" }, g);
      el("rect", { x: -9, y: -48, width: 6, height: 14, fill: "#B9A57E", stroke: TRAIT, "stroke-opacity": .45 }, g);
      el("path", { d: "M2 6 L2 -9 Q8 -17 14 -9 L14 2z", fill: "#3A1A14" }, g);
      el("path", { d: "M4 5 L4 -6 Q8 -12 12 -6 L12 3z", fill: "#E4B54A" }, g);
      el("path", { d: "M6 3 Q8 -6 10 3z", fill: "#FFE6A8" }, g);
    },
    billot: g => {
      el("path", { d: "M-12 -13 L-12 2 Q0 9 12 2 L12 -13z", fill: "#8A6238", stroke: TRAIT, "stroke-opacity": .35 }, g);
      el("path", { d: "M-6 -9 L-6 4 M5 -9 L5 5", stroke: "#6F4E2C", "stroke-width": 1 }, g);
      el("ellipse", { cx: 0, cy: -13, rx: 12, ry: 6, fill: "#C9A26B", stroke: TRAIT, "stroke-opacity": .35 }, g);
      el("ellipse", { cx: 0, cy: -13, rx: 7, ry: 3.4, fill: "none", stroke: "#8A6238" }, g);
      el("ellipse", { cx: 0, cy: -13, rx: 3, ry: 1.4, fill: "none", stroke: "#8A6238" }, g);
      el("path", { d: "M3 -26 L9 -15 L6 -14 Z", fill: "#B9C2C4", stroke: TRAIT, "stroke-opacity": .5 }, g);
      el("rect", { x: 1, y: -33, width: 3, height: 8, rx: 1, fill: "#5B4632", transform: "rotate(-28 2.5 -29)" }, g);
    },
    caisse: g => {
      boite(g, 0, 4, 15, 18, ["#C9A26B", "#8A6238", "#6F4E2C"]);
      el("path", { d: "M-15 -6 L0 1.5 M0 1.5 L15 -6 M-15 -12 L0 -4.5 L15 -12", stroke: "#5B4632", "stroke-width": 1, fill: "none" }, g);
      [[-5, -21, "#D2693C"], [2, -22, "#E4B54A"], [7, -20, "#8A6238"]].forEach(([x, y, f]) => el("circle", { cx: x, cy: y, r: 3.2, fill: f, stroke: TRAIT, "stroke-opacity": .3 }, g));
    },
    lanterne: g => {
      el("ellipse", { cx: 0, cy: 2, rx: 7, ry: 3, fill: "#5B4A35" }, g);
      el("rect", { x: -1.6, y: -40, width: 3.2, height: 42, fill: "#2B3B38" }, g);
      el("path", { d: "M-6 -48 L6 -48 L7.5 -37 L-7.5 -37z", fill: "#E4B54A", stroke: "#2B3B38", "stroke-width": 1.4 }, g);
      el("path", { d: "M-7 -48 L7 -48 L0 -54z", fill: "#2B3B38" }, g);
      el("path", { d: "M-2 -40 Q0 -46 2 -40z", fill: "#FFF1C2" }, g);
    }
  };
  // ---------- Décors et objets de voyage des îles de l'Astrelier (passe 6) ----------
  // Même repère : une case fait 40 × 20 avant l'agrandissement (s = 1,6), le pied au point (0, 0).
  const BOIS = ["#C9A26B", "#8A6238", "#6F4E2C"], BOIS_C = ["#D9B47C", "#A9804E", "#8A6238"];
  const FER = ["#E6DCC4", "#C9BC9C", "#AFA27F"];
  const trait = (o) => Object.assign({ stroke: TRAIT, "stroke-opacity": .45, "stroke-width": .8, "stroke-linejoin": "round" }, o);
  // un four commun : le four du Fourneau, avec la pancarte dorée du Four banal (une étoile) ; éteint : bouche noire, cendres
  const fourBanal = (g, allume) => {
    el("ellipse", { cx: 0, cy: 2, rx: 22, ry: 10.5, fill: "#9C8862" }, g);
    el("path", trait({ d: "M-19 2 Q-19 -34 0 -36 Q19 -34 19 2 Q0 12 -19 2z", fill: allume ? "#D9C39A" : "#CDBB98" }), g);
    el("path", { d: "M-15 -6 Q-15 -28 0 -31 M-8 -33 Q-14 -24 -14 -10", stroke: "#BFA678", "stroke-width": 1.2, fill: "none" }, g);
    // pierres du pied
    [[-16, 2], [-9, 5.5], [-1, 7], [7, 6], [14, 3.2]].forEach(([x, y]) => el("ellipse", trait({ cx: x, cy: y, rx: 3.6, ry: 1.9, fill: "#B5A27E" }), g));
    el("rect", trait({ x: -9, y: -48, width: 6, height: 14, fill: "#B9A57E" }), g);
    el("path", { d: "M2 6 L2 -9 Q8 -17 14 -9 L14 2z", fill: allume ? "#3A1A14" : "#2B211C" }, g);
    if (allume) {
      el("path", { d: "M4 5 L4 -6 Q8 -12 12 -6 L12 3z", fill: "#E4B54A" }, g);
      el("path", { d: "M6 3 Q8 -6 10 3z", fill: "#FFE6A8" }, g);
      el("path", { d: "M-6 -52 q-3 -4 0 -7 q3 -3 0 -7", stroke: "#F2EDE0", "stroke-width": 1.4, fill: "none", "stroke-linecap": "round", opacity: .55 }, g);
    } else {
      el("path", { d: "M4 4 Q8 1 12 3", stroke: "#6E6A60", "stroke-width": 1.6, fill: "none", "stroke-linecap": "round" }, g);
      [[6, 2.6], [9.6, 2], [8, 3.6]].forEach(([x, y]) => el("circle", { cx: x, cy: y, r: .7, fill: "#8A3B2C" }, g));
    }
    // la pancarte du Four banal : un rond doré et son étoile, sur un poteau
    el("rect", trait({ x: -25.4, y: -30, width: 2.6, height: 33, rx: 1, fill: "#6F4E2C" }), g);
    el("circle", trait({ cx: -24, cy: -32, r: 6.4, fill: allume ? "#E4C98E" : "#C5A572", "stroke-opacity": .6 }), g);
    el("path", { d: "M-24 -36.4l1.3 3 3.2.3-2.4 2.1.7 3.1-2.8-1.6-2.8 1.6.7-3.1-2.4-2.1 3.2-.3z", fill: allume ? "#FFFDF7" : "#F2EDE0" }, g);
  };
  // une face de boîte en losange (gauche ou droite) : point (fx, fy) de la face, fx de 0 à a, fy de 0 à ht (du haut)
  const faceG = (cx, cy, a, ht) => (fx, fy) => [cx - a + fx, cy - ht + fx * .5 + fy];
  const faceD = (cx, cy, a, ht) => (fx, fy) => [cx + fx, cy - ht + a * .5 - fx * .5 + fy];
  const quad = (f, x0, y0, x1, y1) => [f(x0, y0), f(x1, y0), f(x1, y1), f(x0, y1)].map(p => p.join(",")).join(" ");
  Object.assign(DECORS, {
    "four-banal": g => fourBanal(g, true),
    "four-banal-eteint": g => fourBanal(g, false),
    // le passe-plat : un pan de mur crépi, large et bas, cadre de bois ; un grand guichet doré tourné vers la case d'accès
    // (en bas à gauche), une tablette qui avance avec une assiette sous cloche et la sonnette ; le médaillon ⇄ des jumeaux
    "passe-plat": g => {
      const A = 26, B = 8, ht = 25, F = [(A - B) / 2, 2 + (A + B) / 4];
      const fL = (s, h) => [F[0] - s, F[1] - s * .5 - h];          // la face large (gauche), s de 0 à A, h de 0 à ht
      const fR = (s, h) => [F[0] + s, F[1] - s * .5 - h];          // la face étroite (droite)
      const q = pts => pts.map(p => p.map(n => n.toFixed(2)).join(",")).join(" ");
      el("ellipse", { cx: 0, cy: 7, rx: 21, ry: 8, fill: TRAIT, opacity: .2 }, g);
      el("polygon", trait({ points: q([fR(0, 0), fR(B, 0), fR(B, ht), fR(0, ht)]), fill: "#D9CBB0" }), g);
      el("polygon", trait({ points: q([fL(0, 0), fL(A, 0), fL(A, ht), fL(0, ht)]), fill: "#EFE3CC" }), g);
      const K = fL(A, ht);
      el("polygon", trait({ points: q([fL(0, ht), K, [K[0] + B, K[1] - B * .5], fR(B, ht)]), fill: "#8A6238" }), g);   // le chapeau de bois
      // le cadre de bois aux deux bouts et en bas
      [[0, 1.6], [A - 1.6, A]].forEach(([a, b]) => el("polygon", { points: q([fL(a, 0), fL(b, 0), fL(b, ht), fL(a, ht)]), fill: "#8A6238" }, g));
      el("polygon", { points: q([fL(0, 0), fL(A, 0), fL(A, 2), fL(0, 2)]), fill: "#6F4E2C" }, g);
      // le guichet : 70 % de la face, une lueur dorée
      el("polygon", trait({ points: q([fL(3.4, 6), fL(22.6, 6), fL(22.6, 20.4), fL(3.4, 20.4)]), fill: "#8A6238" }), g);
      el("polygon", { points: q([fL(4.6, 7), fL(21.4, 7), fL(21.4, 19.2), fL(4.6, 19.2)]), fill: "#3A2A1E" }, g);
      el("polygon", { points: q([fL(5.4, 7), fL(20.6, 7), fL(20.6, 18.2), fL(5.4, 18.2)]), fill: "#E4B54A", opacity: .75 }, g);
      el("polygon", { points: q([fL(9, 7), fL(17, 7), fL(17, 15), fL(9, 15)]), fill: "#FFE6A8", opacity: .75 }, g);
      // la tablette, qui avance vers la case d'accès
      const avance = (p, d) => [p[0] - d, p[1] + d * .5];
      el("polygon", trait({ points: q([fL(2.4, 6), fL(23.6, 6), avance(fL(23.6, 6), 5), avance(fL(2.4, 6), 5)]), fill: "#C9A26B" }), g);
      el("polygon", { points: q([avance(fL(2.4, 6), 5), avance(fL(23.6, 6), 5), avance(fL(23.6, 4.8), 5), avance(fL(2.4, 4.8), 5)]), fill: "#6F4E2C" }, g);
      // l'assiette sous cloche
      const [ax, ay] = avance(fL(15.5, 6), 2.6);
      el("ellipse", trait({ cx: ax, cy: ay, rx: 4.4, ry: 1.8, fill: "#FFFDF7" }), g);
      el("path", trait({ d: `M${ax - 3.4} ${ay - .2} Q${ax - 3.2} ${ay - 5.4} ${ax} ${ay - 5.6} Q${ax + 3.2} ${ay - 5.4} ${ax + 3.4} ${ay - .2}z`, fill: "#E6DCC4" }), g);
      el("path", { d: `M${ax - 1.8} ${ay - 3.6} q1 -1.4 2.6 -1.4`, stroke: "#FFFDF7", "stroke-width": .8, fill: "none" }, g);
      el("circle", trait({ cx: ax, cy: ay - 6.2, r: .9, fill: "#C9BC9C" }), g);
      // la sonnette, posée sur la tablette
      const [sx, sy] = avance(fL(6.4, 6), 2.4);
      el("ellipse", { cx: sx, cy: sy, rx: 2.6, ry: 1, fill: "#7A5F2E" }, g);
      el("path", trait({ d: `M${sx - 2.2} ${sy - .3} Q${sx} ${sy - 4.4} ${sx + 2.2} ${sy - .3}z`, fill: "#E4C98E" }), g);
      el("circle", { cx: sx, cy: sy - 4, r: .7, fill: "#7A5F2E" }, g);
      // le médaillon des jumeaux : deux flèches ⇄, le même sur les deux passe-plats
      const [mx, my] = fL(13, 22.6);
      el("ellipse", trait({ cx: mx, cy: my, rx: 3.4, ry: 2.6, fill: "#E4C98E" }), g);
      el("path", { d: `M${mx - 2} ${my - .9} h3.6 l-1 -1 M${mx + 2} ${my + .9} h-3.6 l1 1`, stroke: "#5B4632", "stroke-width": .75, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
    },
    // un pilier de la Halle : pierre au pied, poteau de bois, une poutre de la charpente ; l'un porte l'enseigne de la Halle
    pilier: g => pilier(g, false),
    "pilier-enseigne": g => pilier(g, true),
    // des sacs de farine (Grand-Étal)
    sacs: g => {
      el("ellipse", { cx: 0, cy: 3, rx: 19, ry: 7.5, fill: TRAIT, opacity: .18 }, g);
      [[-7, 1, 1], [7, 2, -1], [0, -9, 1]].forEach(([x, y, r]) => sac(g, x, y, r));
    },
    // un étal de marché : comptoir de bois, auvent rayé crème et vert nuit, la marchandise
    "etal-pain": g => etal(g, "pain"), "etal-lait": g => etal(g, "lait"), "etal-outils": g => etal(g, "outils"),
    // une tringle : deux montants, une barre, trois tabliers sur leurs cintres
    tringle: g => {
      el("ellipse", { cx: 0, cy: 1, rx: 20, ry: 7, fill: TRAIT, opacity: .16 }, g);
      [[-14, -7], [14, 7]].forEach(([x, y]) => { el("rect", trait({ x: x - 1.3, y: y - 40, width: 2.6, height: 40, rx: 1, fill: "#5B4632" }), g); el("ellipse", trait({ cx: x, cy: y, rx: 3.6, ry: 1.6, fill: "#6F4E2C" }), g); });
      el("path", { d: "M-15 -47.4 L15 -32.4", stroke: "#2B3B38", "stroke-width": 1.8, "stroke-linecap": "round" }, g);
      [[-8, "#F4ECDA", "#C9B48C"], [0, "#2A5049", "#1B3835"], [8, "#E4C98E", "#C5A572"]].forEach(([x, c, b]) => {
        const y = -40 + x * .5;
        el("path", { d: `M${x - 3} ${y + 3} L${x} ${y} L${x + 3} ${y + 3}`, stroke: "#7A5F2E", "stroke-width": .8, fill: "none" }, g);   // le cintre
        el("path", trait({ d: `M${x - 3.6} ${y + 2.6} Q${x} ${y + 4.2} ${x + 3.6} ${y + 2.6} L${x + 5} ${y + 9} L${x + 4.4} ${y + 21} Q${x} ${y + 23} ${x - 4.4} ${y + 21} L${x - 5} ${y + 9}z`, fill: c }), g);
        el("path", { d: `M${x - 3} ${y + 13} Q${x} ${y + 14.4} ${x + 3} ${y + 13}`, stroke: b, "stroke-width": 1, fill: "none" }, g);   // la poche
      });
    },
    // un portant : un mât, ses crochets, deux cintres et un tablier
    portant: g => {
      el("ellipse", { cx: 0, cy: 1, rx: 9, ry: 3.6, fill: TRAIT, opacity: .18 }, g);
      el("path", trait({ d: "M-7 1 L0 -3 L7 1 L0 4z", fill: "#6F4E2C" }), g);
      el("rect", trait({ x: -1.2, y: -46, width: 2.4, height: 46, rx: 1, fill: "#5B4632" }), g);
      el("path", { d: "M0 -44 q-6 0 -7 4 M0 -44 q6 0 7 4 M0 -46 v-3", stroke: "#2B3B38", "stroke-width": 1.4, fill: "none", "stroke-linecap": "round" }, g);
      el("circle", { cx: 0, cy: -50, r: 1.8, fill: "#C5A572" }, g);
      el("path", { d: "M-7 -40 l-3.6 3 h7.2z M7 -40 l-3.6 3 h7.2z", stroke: "#7A5F2E", "stroke-width": .8, fill: "none" }, g);
      el("path", trait({ d: "M-10.6 -37 Q-7 -36 -3.4 -37 L-2.6 -30 L-3.2 -19 Q-7 -17.6 -10.8 -19 L-11.4 -30z", fill: "#F4ECDA" }), g);
      el("path", { d: "M-10.8 -24 h7.4", stroke: "#C5A572", "stroke-width": 1.2 }, g);
      el("path", trait({ d: "M3.4 -37 Q7 -36 10.6 -37 L11 -32 Q7 -31 3 -32z", fill: "#2A5049" }), g);
    },
    // l'armoire de la Penderie : la porte du donjon de la Proxi-Mite (une mite sur les portes), fermée d'un cadenas doré
    armoire: g => {
      const a = 17, ht = 48, cy = 4;
      el("ellipse", { cx: 0, cy: 6, rx: 21, ry: 8, fill: TRAIT, opacity: .2 }, g);
      boite(g, 0, cy, a, ht, ["#B98E5A", "#7E5A34", "#64462A"]);
      el("path", trait({ d: `M${-a - 1} ${cy - ht - 1} L0 ${cy - ht - a / 2 - 2} L${a + 1} ${cy - ht - 1} L0 ${cy - ht + a / 2}z`, fill: "#D2AE78" }), g);
      const f = faceG(0, cy, a, ht);
      el("polygon", trait({ points: quad(f, 1.5, 5, 8.2, 44), fill: "#8A6238" }), g);
      el("polygon", trait({ points: quad(f, 8.8, 5, 15.5, 44), fill: "#8A6238" }), g);
      // la mite : un corps, quatre ailes couvertes d'étiquettes
      const [mx, my] = f(8.5, 16);
      el("path", trait({ d: `M${mx} ${my} q-7 -6 -8 1 q2 5 8 1z M${mx} ${my} q7 -4 7 3 q-3 4 -7 -1z`, fill: "#D9D4C8" }), g);
      el("path", trait({ d: `M${mx} ${my + 1} q-6 2 -5 7 q4 0 5 -5z M${mx} ${my + 1} q6 3 4 7 q-4 -1 -4 -5z`, fill: "#C9C2B2" }), g);
      [[-5, -1.4], [4, 0], [-3.4, 5.4], [3, 6]].forEach(([dx, dy]) => el("rect", { x: mx + dx - 1, y: my + dy - .7, width: 2, height: 1.4, fill: "#FFFDF7", stroke: "#8A3B2C", "stroke-width": .3 }, g));
      el("ellipse", { cx: mx, cy: my + 1.4, rx: 1.1, ry: 3.4, fill: "#5B4632" }, g);
      // le cadenas
      const [cx2, cy2] = f(8.5, 28);
      el("path", { d: `M${cx2 - 2.4} ${cy2 - 1} v-2.4 a2.4 2.4 0 0 1 4.8 0 v2.4`, stroke: "#7A5F2E", "stroke-width": 1.3, fill: "none" }, g);
      el("rect", trait({ x: cx2 - 3.4, y: cy2 - 1.2, width: 6.8, height: 5.6, rx: 1.2, fill: "#E4C98E" }), g);
      el("circle", { cx: cx2, cy: cy2 + 1.4, r: .9, fill: "#7A5F2E" }, g);
    },
    // un moule à kouglof géant (cannelé, une cheminée au milieu), en fer-blanc doré
    "moule-kouglof": g => {
      el("ellipse", { cx: 0, cy: 2, rx: 17, ry: 7, fill: TRAIT, opacity: .2 }, g);
      el("path", trait({ d: "M-15 -16 L-12.6 0 Q0 6.4 12.6 0 L15 -16z", fill: FER[1] }), g);
      for (let i = -12; i <= 12; i += 4) el("path", { d: `M${i * 1.04} ${-15 + Math.abs(i) * .05} L${i * .86} ${1 + 4 * (1 - (i * i) / 160)}`, stroke: FER[2], "stroke-width": 1.4 }, g);
      el("ellipse", trait({ cx: 0, cy: -16, rx: 15, ry: 6.6, fill: FER[0] }), g);
      el("ellipse", { cx: 0, cy: -16, rx: 11.4, ry: 4.8, fill: "#C9BC9C" }, g);
      el("path", trait({ d: "M-3 -16 L-3 -26 Q0 -27.6 3 -26 L3 -16z", fill: FER[0] }), g);
      el("ellipse", { cx: 0, cy: -26, rx: 3, ry: 1.3, fill: "#8C7F62" }, g);
      el("path", { d: "M-10 -18 q10 -5 20 0", stroke: "#FFFDF7", "stroke-width": 1, opacity: .6, fill: "none" }, g);
    },
    // un moule à tarte géant, large et cannelé
    "moule-tarte": g => {
      el("ellipse", { cx: 0, cy: 2, rx: 20, ry: 8.4, fill: TRAIT, opacity: .18 }, g);
      el("path", trait({ d: "M-19 -5 L-17 1 Q0 8.4 17 1 L19 -5z", fill: FER[1] }), g);
      let d = "";
      for (let k = 0; k < 24; k++) { const t = k / 24 * Math.PI * 2, r = k % 2 ? 18.2 : 19.4; d += (k ? "L" : "M") + (Math.cos(t) * r).toFixed(1) + " " + (-5 + Math.sin(t) * r * .42).toFixed(1); }
      el("path", trait({ d: d + "z", fill: FER[0] }), g);
      el("ellipse", { cx: 0, cy: -5, rx: 15.4, ry: 6.2, fill: "#D6CAAA" }, g);
      el("path", { d: "M-11 -7 q11 -4 22 0", stroke: "#FFFDF7", "stroke-width": 1, opacity: .55, fill: "none" }, g);
    },
    // la porte du donjon du Grand Moule : un moule renversé, sa porte cintrée, un cadenas
    "porte-moule": g => {
      el("ellipse", { cx: 0, cy: 2, rx: 21, ry: 9, fill: TRAIT, opacity: .2 }, g);
      el("path", trait({ d: "M-19 2 Q-20 -26 -10 -38 Q0 -44 10 -38 Q20 -26 19 2 Q0 10 -19 2z", fill: FER[1] }), g);
      [-14, -8, -2, 4, 10, 15].forEach(x => el("path", { d: `M${x} ${-30 + Math.abs(x) * .5} Q${x * 1.08} -14 ${x * 1.02} ${3 + 3 * (1 - x * x / 300)}`, stroke: FER[2], "stroke-width": 1.4, fill: "none" }, g));
      el("path", trait({ d: "M-6 -42 Q0 -50 6 -42z", fill: FER[0] }), g);
      el("path", trait({ d: "M-7 6 L-7 -14 Q0 -24 7 -14 L7 6 Q0 8.4 -7 6z", fill: "#5B4632" }), g);
      el("path", { d: "M0 -19.6 L0 7.6", stroke: "#3A2A1E", "stroke-width": .9 }, g);
      el("path", { d: "M-2.2 -4 v-2.2 a2.2 2.2 0 0 1 4.4 0 v2.2", stroke: "#7A5F2E", "stroke-width": 1.2, fill: "none" }, g);
      el("rect", trait({ x: -3.2, y: -4.2, width: 6.4, height: 5.2, rx: 1.1, fill: "#E4C98E" }), g);
    },
    // une pancarte de bois sur deux pieds
    pancarte: g => {
      el("ellipse", { cx: 0, cy: 1, rx: 13, ry: 4, fill: TRAIT, opacity: .16 }, g);
      [-9, 9].forEach(x => el("rect", trait({ x: x - 1.2, y: -24, width: 2.4, height: 24 + x * .25, rx: 1, fill: "#6F4E2C" }), g));
      el("path", trait({ d: "M-14 -32 L14 -26 L14 -12 L-14 -18z", fill: "#D9B47C" }), g);
      el("path", { d: "M-10 -26 L6 -22.6 M-10 -22 L10 -17.8", stroke: "#7A5F2E", "stroke-width": 1.2, "stroke-linecap": "round" }, g);
      el("path", { d: "M10.4 -24l.9 2 2.1.2-1.6 1.4.5 2.1-1.9-1.1-1.9 1.1.5-2.1-1.6-1.4 2.1-.2z", fill: "#C5A572" }, g);
    },
    // un bidon de lait (la Voie lactée)
    bidon: g => {
      el("ellipse", { cx: 0, cy: 1, rx: 9, ry: 3.6, fill: TRAIT, opacity: .2 }, g);
      el("path", trait({ d: "M-7 -14 L-7 -1 Q0 3 7 -1 L7 -14z", fill: "#E9E4D8" }), g);
      el("path", { d: "M3 -14 L3 0.4", stroke: "#FFFDF7", "stroke-width": 1.6, opacity: .7 }, g);
      el("path", trait({ d: "M-7 -14 Q-6 -18 -3.4 -19 L3.4 -19 Q6 -18 7 -14 Q0 -11 -7 -14z", fill: "#D8D2C4" }), g);
      el("path", trait({ d: "M-3.6 -19 L-3.6 -23 Q0 -24.6 3.6 -23 L3.6 -19z", fill: "#E9E4D8" }), g);
      el("ellipse", trait({ cx: 0, cy: -23.4, rx: 4.6, ry: 1.8, fill: "#C9C2B2" }), g);
      el("path", { d: "M-7 -8.6 Q0 -5.6 7 -8.6", stroke: "#C5A572", "stroke-width": 1.6, fill: "none" }, g);
      el("path", { d: "M-7 -16 q-3 0 -3 3 M7 -16 q3 0 3 3", stroke: "#8E8A7E", "stroke-width": 1.2, fill: "none" }, g);
    },
    // le lit de farine de Grand-Étal : un sac de farine en guise de matelas (toile, épi tamponné, « FARINE », coin noué),
    // un oreiller, une couverture étoilée ; 1,3 fois plus grand qu'une caisse
    lit: g0 => {
      const g = el("g", { transform: "scale(1.3)" }, g0);
      el("ellipse", { cx: 0, cy: 3, rx: 21, ry: 8.5, fill: TRAIT, opacity: .2 }, g);
      boite(g, 0, 5, 18, 6, BOIS);
      el("path", trait({ d: "M-18.6 -2.6 Q-19 -6 -15 -7.4 L-1 -14.4 Q2 -15.6 5 -14.4 L18 -7.8 Q20 -6 18.6 -3 L1 6 Q-1.4 7 -4 6z", fill: "#E6D7B8" }), g);
      el("path", { d: "M-15 -4.4 L1 3.6 M-7 -11 L10 -2.6", stroke: "#CDBB98", "stroke-width": .8, "stroke-dasharray": "1.6 1.6", fill: "none" }, g);
      // le coin noué du sac
      el("path", trait({ d: "M17.6 -6.6 q3.6 -.6 4.4 1.8 q-1.6 1.4 -3.6 .4z", fill: "#D9C8A4" }), g);
      el("path", { d: "M18.4 -6 l1.2 1.4", stroke: "#8A6238", "stroke-width": .9 }, g);
      // le tampon : un épi et « FARINE », à l'encre, couchés sur la toile
      const t = el("g", { transform: "matrix(1 .5 -1 .5 -9.6 -3.4)" }, g);
      el("path", { d: "M-6 0 L6 0 M-3 -2.2 L-1 0 M-3 2.2 L-1 0 M0 -2.2 L2 0 M0 2.2 L2 0 M3 -2 L5 0 M3 2 L5 0", stroke: "#2B3B38", "stroke-width": .8, "stroke-linecap": "round", opacity: .8, transform: "translate(-3.4 -1.6) scale(.5)" }, t);
      const tx = el("text", { x: -1.4, y: 2.2, "font-family": "Arial, Helvetica, sans-serif", "font-size": 2.8, "font-weight": 700, fill: "#2B3B38", opacity: .82, "letter-spacing": ".2" }, t);
      tx.textContent = "FARINE";
      // l'oreiller, la couverture étoilée
      el("path", trait({ d: "M-12 -10 Q-12.6 -14 -8.6 -14.6 L-4 -16.6 Q-1 -17 -.6 -14 Q-1 -11 -5 -9.6 L-9 -8 Q-12 -7.6 -12 -10z", fill: "#FFFDF7" }), g);
      el("path", trait({ d: "M1 4.6 L-1.4 -1 Q6 -6.4 14 -5.4 L18.4 -3.4 L3 4.8 Q2 5.4 1 4.6z", fill: "#2A5049" }), g);
      [[6, -2.4], [11, -3.6], [8.6, .4], [13.6, -1.6]].forEach(([x, y]) => el("circle", { cx: x, cy: y, r: .9, fill: "#E4C98E" }, g));
      el("path", { d: "M-16 -16 q2 -2 4 0 M-12.6 -21 q1.4 -1.4 2.8 0", stroke: "#FFFDF7", "stroke-width": 1, fill: "none", opacity: .7 }, g);
    },
    // le bas du toboggan, au Moule : la crêpe descend du ciel en goulotte et finit sur un coussin de farine
    "bas-toboggan": g => {
      el("ellipse", { cx: 8, cy: 3, rx: 17, ry: 6.4, fill: "#FFFDF7", opacity: .85 }, g);
      crepe(g, BAS_TOBOGGAN, 6.4, { debut: .02 });
      el("path", trait({ d: "M2 3 Q8 -4 17 -1 Q23 2 19 6 Q9 9 2 3z", fill: "#FFFDF7" }), g);
      [[6, 0], [14, 2], [10, 5]].forEach(([x, y]) => el("circle", { cx: x, cy: y, r: 1.2, fill: "#F2EDE0" }, g));
    }
  });
  function etal(g, quoi) {
    el("ellipse", { cx: 0, cy: 4, rx: 21, ry: 8, fill: TRAIT, opacity: .18 }, g);
    [[-15, -1], [15, -1]].forEach(([x, y]) => el("rect", trait({ x: x - 1, y: y - 40, width: 2, height: 40, fill: "#5B4632" }), g));
    boite(g, 0, 5, 16, 13, BOIS);
    el("path", { d: "M-16 -8 L0 0 L16 -8", stroke: "#5B4632", "stroke-width": .8, fill: "none", opacity: .7 }, g);
    // la marchandise sur le comptoir
    if (quoi === "pain") {
      [[-7, -10, 0], [1, -12, 1], [7, -8.6, 0]].forEach(([x, y, r]) => {
        el("ellipse", trait({ cx: x, cy: y, rx: 5.4, ry: 2.8, fill: "#D9A866", transform: `rotate(${r ? -18 : 14} ${x} ${y})` }), g);
        el("path", { d: `M${x - 2.6} ${y - .4} l1.4 -1.2 M${x - .2} ${y + .2} l1.4 -1.2 M${x + 2.2} ${y + .6} l1.4 -1.2`, stroke: "#F3D9A8", "stroke-width": .9, "stroke-linecap": "round" }, g);
      });
    } else if (quoi === "lait") {
      [[-7, -9], [-2, -11.4]].forEach(([x, y]) => { el("path", trait({ d: `M${x - 2.4} ${y + 2} L${x - 2.4} ${y - 6} Q${x} ${y - 9} ${x + 2.4} ${y - 6} L${x + 2.4} ${y + 2}z`, fill: "#FFFDF7" }), g); el("rect", { x: x - 1.2, y: y - 10.4, width: 2.4, height: 2, fill: "#C5A572" }, g); });
      el("path", trait({ d: "M3 -9 L9 -12 L13 -10 L13 -7 L7 -4 L3 -6z", fill: "#F3D27A" }), g);
    } else {
      el("path", trait({ d: "M-12 -8 L2 -14", stroke: "#C9A26B", "stroke-width": 3.4, "stroke-linecap": "round" }), g);
      el("path", { d: "M-12 -8 L2 -14", stroke: "#D9B47C", "stroke-width": 2.4, "stroke-linecap": "round" }, g);
      el("path", { d: "M5 -6 q3 -9 6 -1 M6 -6 q2 -7 4 -1", stroke: "#8E8A7E", "stroke-width": .9, fill: "none" }, g);
      el("path", { d: "M8 -6 L8 -2", stroke: "#5B4632", "stroke-width": 1.6, "stroke-linecap": "round" }, g);
      el("path", trait({ d: "M-4 -5 L6 -10 L7 -8.6 L-3 -3.6z", fill: "#B9C2C4" }), g);
    }
    // l'auvent rayé, bord festonné
    const rayures = 8;
    for (let i = 0; i < rayures; i++) {
      const x0 = -18 + i * 36 / rayures, x1 = x0 + 36 / rayures;
      el("path", { d: `M${x0} ${-38 + x0 * 0} L${x1} -38 L${x1 + 2} -28 L${x0 + 2} -28z`, fill: i % 2 ? "#2A5049" : "#F4ECDA" }, g);
    }
    el("path", { d: "M-18 -38 L18 -38 L20 -28 L-16 -28z", fill: "none", stroke: TRAIT, "stroke-opacity": .5, "stroke-width": .8 }, g);
    let fest = "M-16 -28";
    for (let i = 0; i < 6; i++) fest += ` q3 4 6 0`;
    el("path", { d: fest, fill: "#C5A572", stroke: TRAIT, "stroke-opacity": .45, "stroke-width": .7 }, g);
  }

  function pilier(g, enseigne) {
    el("ellipse", { cx: 0, cy: 2, rx: 11, ry: 4.6, fill: TRAIT, opacity: .2 }, g);
    boite(g, 0, 3, 7.5, 7, ["#D8CDB6", "#B9AB8E", "#9C8F74"]);                    // la pierre du pied
    boite(g, 0, -4, 3.6, 58, BOIS);                                               // le poteau
    el("path", trait({ d: "M-3.6 -60 L-14 -65 L-14 -62 L-3.6 -57z", fill: "#8A6238" }), g);   // les poutres de la charpente
    el("path", trait({ d: "M3.6 -60 L14 -65 L14 -62 L3.6 -57z", fill: "#6F4E2C" }), g);
    el("path", trait({ d: "M-3.6 -62 L-12 -66 L0 -72 L12 -66 L3.6 -62 L0 -64z", fill: "#A9804E" }), g);
    if (enseigne) {
      // l'enseigne suspendue : une potence, deux chaînettes, un panneau avec une miche et une étoile
      el("path", { d: "M3 -50 L17 -57 M8 -52.4 L13 -50", stroke: "#2B3B38", "stroke-width": 1.4, "stroke-linecap": "round" }, g);
      el("path", { d: "M11 -54 L11 -46 M16 -56.6 L16 -48.6", stroke: "#7A5F2E", "stroke-width": .7 }, g);
      el("path", trait({ d: "M8.4 -46 L18.6 -51 L18.6 -41 L8.4 -36z", fill: "#2A5049" }), g);
      el("path", { d: "M9.4 -45.4 L17.6 -49.4 L17.6 -41.6 L9.4 -37.6z", fill: "none", stroke: "#C5A572", "stroke-width": .6 }, g);
      el("ellipse", { cx: 13.4, cy: -42.6, rx: 3, ry: 1.7, fill: "#D9A866", transform: "rotate(-26 13.4 -42.6)" }, g);
      el("path", { d: "M14.8 -47.4l.5 1.1 1.2.1-.9.8.3 1.2-1.1-.6-1.1.6.3-1.2-.9-.8 1.2-.1z", fill: "#E4C98E" }, g);
    }
  }
  function sac(g, x, y, r) {
    el("path", trait({ d: `M${x - 7} ${y + 1} Q${x - 8} ${y - 9} ${x - 4} ${y - 12} L${x + 4} ${y - 12} Q${x + 8} ${y - 9} ${x + 7} ${y + 1} Q${x} ${y + 4.4} ${x - 7} ${y + 1}z`, fill: "#E6D7B8" }), g);
    el("path", trait({ d: `M${x - 3.6} ${y - 12} Q${x} ${y - 15.4} ${x + 3.6} ${y - 12} Q${x} ${y - 10.6} ${x - 3.6} ${y - 12}z`, fill: "#D9C8A4" }), g);
    el("path", { d: `M${x - 2} ${y - 13.6} l${r * 1.6} -2.6`, stroke: "#8A6238", "stroke-width": .9, "stroke-linecap": "round" }, g);
    el("path", { d: `M${x - 3.4} ${y - 5} h6.8 M${x - 2.6} ${y - 3} h5.2`, stroke: "#2B3B38", "stroke-width": .7, opacity: .6 }, g);
    el("path", { d: `M${x} ${y - 9.6} v4 M${x - 1.2} ${y - 8.6} l1.2 1 M${x + 1.2} ${y - 8.6} l-1.2 1`, stroke: "#C5A572", "stroke-width": .7, "stroke-linecap": "round" }, g);
  }
  // Une crêpe en goulotte le long d'une courbe (4 points) : plus claire, deux rebords clairs, une dentelle de petits anneaux
  const pointCourbe = (P, t) => { const u = 1 - t; return [0, 1].map(k => u * u * u * P[0][k] + 3 * u * u * t * P[1][k] + 3 * u * t * t * P[2][k] + t * t * t * P[3][k]); };
  const BAS_TOBOGGAN = [[-30, -96], [-26, -50], [-12, -12], [12, 0]];
  const TOBOGGAN = [[11, -5], [-6, 8], [-30, 30], [-50, 78]];
  function crepe(g, P, demi, o = {}) {
    const n = 26, a = [], b = [], c = [];
    for (let i = 0; i <= n; i++) {
      const t = (o.debut || 0) + (1 - (o.debut || 0)) * i / n, p = pointCourbe(P, t), q = pointCourbe(P, Math.min(1, t + .01)), r = pointCourbe(P, Math.max(0, t - .01));
      let dx = q[0] - r[0], dy = q[1] - r[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      const w = demi * (.9 + .1 * Math.sin(i * 1.7));
      a.push([p[0] - dy * w, p[1] + dx * w]); b.push([p[0] + dy * w, p[1] - dx * w]); c.push(p);
    }
    const pts = a.concat(b.slice().reverse()).map(p => p.map(v => v.toFixed(2)).join(",")).join(" ");
    el("polygon", trait({ points: pts, fill: "#E8C27A" }), g);
    // la dentelle : de petits anneaux sur deux rangs
    for (let i = 2; i < n; i += 2) [.45, -.45].forEach(k => {
      const p = c[i], x = p[0] + (a[i][0] - p[0]) * k, y = p[1] + (a[i][1] - p[1]) * k;
      el("circle", { cx: x.toFixed(2), cy: y.toFixed(2), r: 1.15, fill: "none", stroke: "#B07A3E", "stroke-width": .55, opacity: .5 }, g);
    });
    const ligne = l => "M" + l.map(p => p.map(v => v.toFixed(2)).join(" ")).join(" L");
    el("path", { d: ligne(a), stroke: "#F7E3B8", "stroke-width": 1.6, fill: "none", "stroke-linecap": "round" }, g);
    el("path", { d: ligne(b), stroke: "#F7E3B8", "stroke-width": 1.6, fill: "none", "stroke-linecap": "round" }, g);
    el("path", { d: ligne(b), stroke: "#B9874A", "stroke-width": .5, fill: "none", opacity: .6, transform: "translate(0 1)" }, g);
  }
  ORVANE.courbesVoyage = { TOBOGGAN, BAS_TOBOGGAN, point: pointCourbe };

  // ---------- Les objets posés au bord d'une île, dans le vide (pied au point (0, 0) de leur case) ----------
  //   ORVANE.dessineObjetVoyage(parent, nom, { s })   monte-plats (cordes et poulie), caisse (la cabine), toboggan, pelle, cadenas
  ORVANE.dessineObjetVoyage = function (parent, nom, o = {}) {
    const g = el("g", { transform: `scale(${o.s || 1})` }, parent);
    if (nom === "monte-plats") {
      // une console de bois accrochée au bord de l'île, deux cordes qui montent à une poulie
      el("path", trait({ d: "M-22 -9 L4 4 L4 8 L-22 -5z", fill: "#6F4E2C" }), g);
      el("path", trait({ d: "M-14 -3 L-6 12 L-4 11 L-11 -4z", fill: "#5B4632" }), g);
      el("path", { d: "M-6 -26 L-3 -112 M6 -22 L3 -112", stroke: "#8A6238", "stroke-width": 1.4 }, g);
      el("path", { d: "M-6 -26 L-3 -112 M6 -22 L3 -112", stroke: "#D9B47C", "stroke-width": .6, "stroke-dasharray": "1.4 1.6" }, g);
      el("rect", trait({ x: -10, y: -122, width: 20, height: 4, rx: 1.4, fill: "#5B4632" }), g);
      el("circle", trait({ cx: 0, cy: -114, r: 7, fill: "#C9A26B" }), g);
      el("circle", { cx: 0, cy: -114, r: 4.6, fill: "none", stroke: "#8A6238", "stroke-width": 1.2 }, g);
      el("circle", { cx: 0, cy: -114, r: 1.6, fill: "#E4C98E" }, g);
    } else if (nom === "treuil") {
      // l'île haute (la Penderie) : un treuil à manivelle au ras du sol, ses deux cordes qui descendent dans le vide
      el("path", { d: "M-5 -18 L-5 78 M5 -14 L5 82", stroke: "#8A6238", "stroke-width": 1.4 }, g);
      el("path", { d: "M-5 -18 L-5 78 M5 -14 L5 82", stroke: "#D9B47C", "stroke-width": .6, "stroke-dasharray": "1.4 1.6" }, g);
      [[-12, -12], [12, -2]].forEach(([x, y]) => {
        el("path", trait({ d: `M${x - 3} ${y + 6} L${x} ${y - 14} L${x + 3} ${y + 6}`, fill: "none", stroke: "#5B4632", "stroke-width": 2.2, "stroke-linecap": "round" }), g);
      });
      el("path", trait({ d: "M-12 -26 L12 -16 L12 -11 L-12 -21z", fill: "#C9A26B" }), g);           // le tambour
      el("path", { d: "M-6 -23.6 L-6 -18.6 M0 -21 L0 -16 M6 -18.6 L6 -13.6", stroke: "#8A6238", "stroke-width": .8 }, g);
      el("ellipse", trait({ cx: 12, cy: -13.5, rx: 1.8, ry: 2.8, fill: "#8A6238" }), g);
      el("path", { d: "M12 -13.5 L17 -16 L17 -21", stroke: "#2B3B38", "stroke-width": 1.4, "stroke-linecap": "round", fill: "none" }, g);   // la manivelle
      el("circle", { cx: 17, cy: -21.4, r: 1.3, fill: "#C5A572" }, g);
    } else if (nom === "caisse-monte" || nom === "caisse-descend") {
      // la cabine du monte-plats : une caisse ouverte devant, cerclée de fer, une flèche dorée (monter ou descendre)
      boite(g, 0, 2, 12, 22, BOIS_C);
      const f = faceG(0, 2, 12, 22);
      el("polygon", { points: quad(f, 1.6, 3, 10.4, 19), fill: "#3A2A1E" }, g);
      el("polygon", { points: quad(f, 2.6, 13, 10, 19), fill: "#E9DEC7", opacity: .9 }, g);
      [3, 19].forEach(y => { el("path", { d: `M${-12} ${2 - 22 + y} L0 ${2 - 22 + 6 + y} L12 ${2 - 22 + y}`, stroke: "#5B6763", "stroke-width": 1.1, fill: "none" }, g); });
      const d = faceD(0, 2, 12, 22), [ax, ay] = d(6, 11), haut = nom === "caisse-monte";
      el("path", trait({ d: haut ? `M${ax - 3.4} ${ay + 2.4} L${ax} ${ay - 3.4} L${ax + 3.4} ${ay + 2.4}z` : `M${ax - 3.4} ${ay - 2.4} L${ax} ${ay + 3.4} L${ax + 3.4} ${ay - 2.4}z`, fill: "#E4C98E" }), g);
      el("path", { d: "M-6 -26 l0 -4 M6 -22 l0 -4", stroke: "#8A6238", "stroke-width": 1.4 }, g);
    } else if (nom === "toboggan") {
      // le toboggan : une longue crêpe en goulotte, qui part de la pointe de l'île et tourne sous elle, vers le bas à gauche ;
      // au départ, une pile de crêpes et le panneau « sens unique »
      crepe(g, TOBOGGAN, 7.2);
      [[0, 0], [0, -2.2], [0, -4.4], [0, -6.6]].forEach(([dx, dy], k) => el("ellipse", trait({ cx: 17 + dx, cy: -8 + dy, rx: 6.6 - k * .3, ry: 3.1, fill: k % 2 ? "#E8C27A" : "#D9A866" }), g));
      el("path", { d: "M12 -14.6 q5 -2 10 0", stroke: "#F7E3B8", "stroke-width": .8, fill: "none" }, g);
      el("rect", trait({ x: 25, y: -32, width: 2.2, height: 26, rx: 1, fill: "#6F4E2C" }), g);
      el("circle", trait({ cx: 26, cy: -34, r: 5.6, fill: "#E4C98E" }), g);
      el("path", { d: "M23.6 -36 L26 -32.4 L28.4 -36 M26 -32.6 L26 -37.4", stroke: "#1D2725", "stroke-width": 1.2, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
    } else if (nom === "pelle") {
      // la Grande Pelle : une palette de bois de trois cases, posée sur un tréteau accroché au bord, qui avance dans le vide ;
      // une lueur dorée au bout, vers Grand-Étal
      const def = el("defs", {}, g), rg = el("radialGradient", { id: "lueur-pelle" }, def);
      el("stop", { offset: "0", "stop-color": "#FFE6A8", "stop-opacity": ".9" }, rg); el("stop", { offset: ".5", "stop-color": "#E4B54A", "stop-opacity": ".35" }, rg); el("stop", { offset: "1", "stop-color": "#E4B54A", "stop-opacity": "0" }, rg);
      el("ellipse", { cx: 62, cy: 30, rx: 20, ry: 13, fill: "url(#lueur-pelle)" }, g);
      // le tréteau, accroché au flanc de l'île
      el("path", trait({ d: "M-6 -2 L-10 18 M2 2 L-2 22 M-8 8 L0 12", fill: "none", stroke: "#5B4632", "stroke-width": 2, "stroke-linecap": "round" }), g);
      // le manche, puis la palette
      el("path", trait({ d: "M-14 -9 L-11 -11.6 L8 -1 L5 1.6z", fill: "#A9804E" }), g);
      el("ellipse", trait({ cx: -13.4, cy: -10.4, rx: 2.4, ry: 1.6, fill: "#8A6238" }), g);
      el("path", trait({ d: "M4 -1.2 Q10 -6 18 -3.6 L60 17.4 Q68 22 60 26.6 L46 33 Q39 35.4 32 31.6 L-2 14.6 Q-7 10.6 -1 6.4z", fill: "#D9B47C" }), g);
      el("path", { d: "M1 8 L46 30.6 M7 4 L52 26.6 M13 0.6 L56 22", stroke: "#BF955E", "stroke-width": .9, fill: "none" }, g);
      [[14, 10, 4.2], [30, 18, 3.4], [24, 21, 2.4], [42, 23, 2.6], [50, 21, 1.8]].forEach(([x, y, r]) => el("ellipse", { cx: x, cy: y, rx: r, ry: r * .5, fill: "#FFFDF7", opacity: .85 }, g));
    } else if (nom === "cadenas") {
      // la Grande Pelle fermée : un grand cadenas doré et son étiquette « 12 »
      el("path", { d: "M-4.5 -4.5 v-4.5 a4.5 4.5 0 0 1 9 0 v4.5", stroke: "#7A5F2E", "stroke-width": 2.2, fill: "none" }, g);
      el("rect", trait({ x: -6.6, y: -5.1, width: 13.2, height: 10.5, rx: 2, fill: "#E4C98E" }), g);
      el("circle", { cx: 0, cy: -.6, r: 1.5, fill: "#7A5F2E" }, g);
      el("path", { d: "M0 0 v2.6", stroke: "#7A5F2E", "stroke-width": 1.2 }, g);
      el("path", trait({ d: "M6.6 -1 L12 1.6 L24 1.6 L24 11.4 L12 11.4 L6.6 8.8z", fill: "#FFFDF7" }), g);
      el("circle", { cx: 10.4, cy: 6.5, r: .9, fill: "#C5A572" }, g);
      // « 12 », à l'encre
      el("path", { d: "M14.4 4.6 L16 3.6 L16 9.6 M18.2 5 Q18.6 3.4 20.2 3.4 Q21.8 3.6 21.6 5.2 Q21.4 6.4 18.2 9.6 L22 9.6", stroke: "#1D2725", "stroke-width": 1.1, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
    } else if (nom === "couverture") {
      // la couverture étoilée du lit, seule : posée sur l'artisan quand il fait la sieste
      const h = el("g", { transform: "scale(1.3)" }, g);
      el("path", trait({ d: "M1 4.6 L-4.6 -4.6 Q5 -11 14 -8 L18.4 -3.4 L3 4.8 Q2 5.4 1 4.6z", fill: "#2A5049" }), h);
      el("path", { d: "M-4.6 -4.6 Q5 -11 14 -8", stroke: "#C5A572", "stroke-width": .9, fill: "none" }, h);
      [[3, -4.4], [9, -6.4], [6.6, -1.2], [12.6, -3.2], [2, 1]].forEach(([x, y]) => el("circle", { cx: x, cy: y, r: .9, fill: "#E4C98E" }, h));
    } else if (nom === "flamme") {
      // la flamme qui jaillit de la bouche d'un Four banal qu'on allume
      el("path", { d: "M0 2 Q-7 -4 -4 -12 Q-2 -8 -1 -10 Q-2 -17 3 -22 Q2 -15 6 -11 Q8 -14 7 -17 Q12 -10 8 -2 Q5 3 0 2z", fill: "#E4B54A" }, g);
      el("path", { d: "M1 1 Q-3 -3 -1 -8 Q1 -6 2 -8 Q2 -12 4 -14 Q4 -9 6 -7 Q7 -3 4 0z", fill: "#FFE6A8" }, g);
    }
    return g;
  };

  ORVANE.dessineDecor = function (parent, nom, o = {}) {
    const g = el("g", { transform: `scale(${o.s || 1})` }, parent);
    (DECORS[nom] || DECORS.caisse)(g);
    return g;
  };

  // ---------- Objets au sol ----------
  ORVANE.dessineObjetSol = function (parent, quoi, o = {}) {
    const g = el("g", { transform: `scale(${o.s || 1})` }, parent);
    const c = o.couleur || "#D2693C";
    if (quoi === "fournee") {
      el("ellipse", { cx: 0, cy: 0, rx: 12, ry: 4.4, fill: c, opacity: .35 }, g);
      el("path", avec({ d: "M-10 -1 Q-11 -9 -4 -11 Q0 -12.4 4 -11 Q11 -9 10 -1 Q0 2.4 -10 -1z", fill: "#E8C995" }, contour), g);
      el("path", { d: "M-6 -6 Q-2 -9 2 -8.4 M-1 -4.6 Q3 -7.6 6.4 -6.6", stroke: "#FFD36E", "stroke-width": 1.6, fill: "none", "stroke-linecap": "round" }, g);
      el("path", { d: "M-6 -6 Q-2 -9 2 -8.4 M-1 -4.6 Q3 -7.6 6.4 -6.6", stroke: c, "stroke-width": .7, fill: "none", "stroke-linecap": "round" }, g);
    } else if (quoi === "piege") {
      el("ellipse", { cx: 0, cy: 0, rx: 9, ry: 3.4, fill: TRAIT, opacity: .2 }, g);
      el("path", avec({ d: "M-8 -1 L-8 -6 Q0 -9.6 8 -6 L8 -1 Q0 2 -8 -1z", fill: "#F6C9D2" }, contour), g);
      el("ellipse", avec({ cx: 0, cy: -6, rx: 8, ry: 3, fill: "#FFFDF7" }, contour), g);
      el("path", { d: "M0 -6 L1.6 -17", stroke: "#8A6238", "stroke-width": 1, "stroke-linecap": "round" }, g);
      el("circle", avec({ cx: 1.4, cy: -14.6, r: 2.4, fill: "#6E8B3D" }, contour), g);
    } else if (quoi === "graine") {
      el("ellipse", { cx: 0, cy: 0, rx: 10, ry: 3.8, fill: "#8A6238", opacity: .55 }, g);
      el("path", avec({ d: "M-8 -.6 Q0 -6 8 -.6 Q0 2 -8 -.6z", fill: "#9C7B52" }, contour), g);
      el("path", { d: "M0 -3 Q-.6 -8 1 -11", stroke: "#6E9E58", "stroke-width": 1.4, fill: "none", "stroke-linecap": "round" }, g);
      el("path", avec({ d: "M1 -10.6 Q5 -13 6.4 -10.6 Q4 -9 1 -10.6z", fill: "#7FB069" }, contour), g);
    } else { // ustensile : une marmite
      el("ellipse", { cx: 0, cy: 0, rx: 13, ry: 4.6, fill: TRAIT, opacity: .22 }, g);
      el("path", avec({ d: "M-11 -14 L-10 -2 Q0 3 10 -2 L11 -14z", fill: "#6F4E2C" }, contour), g);
      el("ellipse", avec({ cx: 0, cy: -14, rx: 11, ry: 4, fill: "#8A6238" }, contour), g);
      el("path", { d: "M-13 -12 Q-15 -10 -12 -8 M13 -12 Q15 -10 12 -8", stroke: "#2B3B38", "stroke-width": 1.4, fill: "none" }, g);
    }
    return g;
  };

  // ---------- Icônes (chaînes SVG, boîte 0 0 22 22) ----------
  // Éléments : repris de la maquette. C est remplacé par la couleur.
  const ICONES = {
    F: '<path d="M11 2c4 5 7 7.5 7 11.5a7 7 0 01-14 0c0-3 2-5.5 3.5-7.5 1 2 2 2.5 3.5 3.5z" fill="C"/>',
    E: '<path d="M11 2C11 2 4.5 10 4.5 14a6.5 6.5 0 0013 0C17.5 10 11 2 11 2z" fill="C"/>',
    T: '<path d="M2 18L8.5 7l3 4.5L15 6l5 12z" fill="C"/>',
    S: '<path d="M3 8h10a3 3 0 10-3-3M3 13h14a3 3 0 11-3 3M3 18h6" fill="none" stroke="C" stroke-width="2.2" stroke-linecap="round"/>',
    C: '<path d="M13 2L5 12.5h5.5L9 20l8.5-11H12l1-7z" fill="C"/>',
    N: '<path d="M11 2l2.2 6 6.3.8-4.9 4.1 1.6 6.6L11 16l-5.2 3.5 1.6-6.6L2.5 8.8l6.3-.8z" fill="C"/>',
    // états
    brule: '<path d="M11 2c4 5 7 7.5 7 11.5a7 7 0 01-14 0c0-3 2-5.5 3.5-7.5 1 2 2 2.5 3.5 3.5z" fill="#D2693C"/><path d="M11 10c2 2.6 3.4 3.8 3.4 6a3.4 3.4 0 01-6.8 0c0-1.6 1.6-3.4 3.4-6z" fill="#FFD36E"/>',
    ramolli: '<path d="M11 2C11 2 4.5 10 4.5 14a6.5 6.5 0 0013 0C17.5 10 11 2 11 2z" fill="#3F8FA8"/><path d="M8 15a3 3 0 003 3" stroke="#DDF1F6" stroke-width="1.6" fill="none" stroke-linecap="round"/>',
    enracine: '<path d="M11 3v8M11 11c-3 1-5 4-6 8M11 11c3 1 5 4 6 8M11 11v8" stroke="#8A6238" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
    plante: '<path d="M7 3h8l-2 9h-4z" fill="#8A6238"/><path d="M9 12h4l-2 8z" fill="#5B4632"/>',
    glissant: '<path d="M2 12c3-4 6 4 9 0s6 4 9 0M2 17c3-4 6 4 9 0s6 4 9 0" stroke="#5E9E80" stroke-width="2.2" fill="none" stroke-linecap="round"/>',
    derobe: '<path d="M2 11s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" fill="none" stroke="#8E7CC3" stroke-width="2"/><circle cx="11" cy="11" r="2.6" fill="#8E7CC3"/><path d="M4 19L18 3" stroke="#F2EDE0" stroke-width="2.2" stroke-linecap="round"/>',
    nappe: '<path d="M11 2l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V5z" fill="#F6C9D2" stroke="#FFFDF7" stroke-width="1.4"/>',
    fume: '<circle cx="8" cy="13" r="4.5" fill="#9EA4AB"/><circle cx="13.5" cy="10" r="5" fill="#C4C9D0"/><circle cx="15" cy="15" r="3.5" fill="#9EA4AB"/>',
    attendri: '<rect x="3" y="4" width="10" height="7" rx="1.5" fill="#C8553D"/><path d="M8 11l7 8" stroke="#8A6238" stroke-width="2.6" stroke-linecap="round"/>',
    affine: '<path d="M3 16L19 8v9H3z" fill="#E4B54A"/><path d="M3 16L19 8 14 5z" fill="#F3D27A"/><circle cx="9" cy="14" r="1.4" fill="#C59A2E"/><circle cx="15" cy="13.4" r="1.1" fill="#C59A2E"/>',
    feve: '<ellipse cx="11" cy="11" rx="6" ry="8" fill="#C5A572" transform="rotate(25 11 11)"/><path d="M9 7q3 4 0 8" stroke="#7A5F2E" stroke-width="1.4" fill="none"/>',
    "maree-haute": '<path d="M2 15c3-4 6 4 9 0s6 4 9 0" stroke="#3F8FA8" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M11 3l-4 5h8z" fill="#3F8FA8"/>',
    "maree-basse": '<path d="M2 9c3-4 6 4 9 0s6 4 9 0" stroke="#3F8FA8" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M11 19l-4-5h8z" fill="#3F8FA8"/>',
    // signes du combat
    toque: '<path d="M6 14l-.6-4.2C3 9 2.4 6.4 4 5c1.4-1.2 3.2-.6 4 .2C8.6 3.4 10 2.6 11.4 2.8c1.8.2 2.8 1.6 2.8 2.8 1.2-.8 3-.6 3.8.8 1 1.8-.2 3.8-2.4 4.2L15 14z" fill="#E4C98E" stroke="#7A5F2E" stroke-width="1.1" stroke-linejoin="round"/><rect x="5.6" y="14" width="9.8" height="4" rx="1" fill="#C5A572" stroke="#7A5F2E" stroke-width="1.1"/>',
    toqueRenversee: '<g transform="rotate(180 11 11)"><path d="M6 14l-.6-4.2C3 9 2.4 6.4 4 5c1.4-1.2 3.2-.6 4 .2C8.6 3.4 10 2.6 11.4 2.8c1.8.2 2.8 1.6 2.8 2.8 1.2-.8 3-.6 3.8.8 1 1.8-.2 3.8-2.4 4.2L15 14z" fill="#FFFDF7" stroke="#1D2725" stroke-width="1.1" stroke-linejoin="round"/><rect x="5.6" y="14" width="9.8" height="4" rx="1" fill="#E0D6BF" stroke="#1D2725" stroke-width="1.1"/></g>',
    tablier: '<path d="M7 3h8v3l3 2-1 2-2-1v10H7V9L5 10 4 8l3-2z" fill="#CDBE9F" stroke="#1D2725" stroke-width="1" stroke-linejoin="round"/><path d="M8 13h6" stroke="#1D2725" stroke-width="1"/>',
    pain: '<path d="M3 14c0-5 4-8 8-8s8 3 8 8c0 2-1 3-3 3H6c-2 0-3-1-3-3z" fill="#D9A866" stroke="#7A5F2E" stroke-width="1.1"/><path d="M7 10l2 3M11 9l1.4 3.6M15 10l1 3" stroke="#F3D9A8" stroke-width="1.4" stroke-linecap="round"/>',
    cm: '<path d="M11 1l10 10-10 10L1 11z" fill="#C5A572"/>',
    pas: '<circle cx="11" cy="11" r="9.5" fill="#7FC79A"/>',
    reglages: '<path d="M3 6h9M17 6h2M3 16h2M10 16h9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="14.5" cy="6" r="2.6" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="7.5" cy="16" r="2.6" fill="none" stroke="currentColor" stroke-width="2"/>',
    livre: '<path d="M3 4h6a2 2 0 012 2v13a2 2 0 00-2-2H3zM19 4h-6a2 2 0 00-2 2v13a2 2 0 012-2h6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>'
  };
  const COULEURS = { F: "#D2693C", E: "#3F8FA8", T: "#8A6238", S: "#5E9E80", C: "#8E7CC3", N: "#9A9384" };
  function icone(nom, couleur, taille) {
    const corps = (ICONES[nom] || ICONES.N).replace(/="C"/g, `="${couleur || COULEURS[nom] || "#C5A572"}"`);
    const t = taille || 22;
    return `<svg xmlns="${NS}" viewBox="0 0 22 22" width="${t}" height="${t}" aria-hidden="true">${corps}</svg>`;
  }
  // ---------- Icône d'un sort : un signe qui dit ce que fait le sort (zone, cible, pose, déplacement…), dans la couleur de l'élément ----------
  // Couleurs éclaircies pour rester lisibles sur le vert nuit des boutons
  const CLAIRES = { F: "#EE8A5E", E: "#62B6D0", T: "#CC9A66", S: "#7FC9A5", C: "#B1A3E6", N: "#E4C98E" };
  const los = (x, y, r) => `M${x} ${y - r}L${x + r} ${y}L${x} ${y + r}L${x - r} ${y}z`;
  const SIGNES = {
    contact: '<path d="M18.6 2.6L8.8 12.4l2.6 2.6 9.2-9.6z" fill="C"/><path d="M9.8 14.2L3.6 20.4" stroke="C" stroke-width="3.2" stroke-linecap="round"/><path d="M7 10.6l4.6 4.6" stroke="C" stroke-width="1.6" stroke-linecap="round"/>',
    distance: '<circle cx="11" cy="11" r="8.2" fill="none" stroke="C" stroke-width="2"/><circle cx="11" cy="11" r="4.4" fill="none" stroke="C" stroke-width="1.6"/><circle cx="11" cy="11" r="1.8" fill="C"/>',
    "zone-croix": `<path d="${los(11, 11, 3.4)}${los(11, 4.2, 3.2)}${los(11, 17.8, 3.2)}${los(4.2, 11, 3.2)}${los(17.8, 11, 3.2)}" fill="C"/>`,
    "zone-rond": '<circle cx="11" cy="11" r="8.6" fill="C" opacity=".38"/><circle cx="11" cy="11" r="4.6" fill="C"/>',
    "zone-anneau": '<circle cx="11" cy="11" r="7.4" fill="none" stroke="C" stroke-width="3.2"/><circle cx="11" cy="11" r="1.6" fill="C" opacity=".5"/>',
    "zone-ligne": `<path d="${los(11, 3.8, 3)}${los(11, 11, 3)}${los(11, 18.2, 3)}" fill="C"/>`,
    "zone-travers": `<path d="${los(3.8, 11, 3)}${los(11, 11, 3)}${los(18.2, 11, 3)}" fill="C"/>`,
    "zone-cone": '<path d="M11 20L2.6 6.2Q11 1.6 19.4 6.2z" fill="C"/><path d="M11 20L6.4 8.6M11 20l4.6-11.4" stroke="#0D2D2A" stroke-width="1" opacity=".5"/>',
    "zone-demi-rond": '<path d="M2.4 15.6a8.6 8.6 0 0117.2 0z" fill="C"/><circle cx="11" cy="15.6" r="1.8" fill="#0D2D2A" opacity=".5"/>',
    "zone-carre": `<path d="${los(11, 5, 3.2)}${los(5, 11, 3.2)}${los(17, 11, 3.2)}${los(11, 17, 3.2)}${los(11, 11, 3.2)}" fill="C"/><path d="M4 4h14v14H4z" fill="none" stroke="C" stroke-width="1.2"/>`,
    "zone-terrain": '<path d="M2 11L11 4.5 20 11 11 17.5z" fill="C" opacity=".45"/><path d="M2 11L11 4.5 20 11 11 17.5z" fill="none" stroke="C" stroke-width="1.8"/><path d="M6.5 7.8l9 6.4M15.5 7.8l-9 6.4" stroke="C" stroke-width="1.2"/>',
    "pose-fournee": '<path d="M3.4 16.4Q3 6.2 11 5.8q8 .4 7.6 10.6z" fill="C"/><rect x="2" y="16.4" width="18" height="2.6" rx="1.2" fill="C"/><path d="M8.6 16.2v-3.6q2.4-3 4.8 0v3.6" fill="#0D2D2A" opacity=".55"/>',
    "pose-piege": '<path d="M2.6 12.6l2.8-4.6 2.8 4.6 2.8-4.6 2.8 4.6 2.8-4.6 2.8 4.6Q11 20.6 2.6 12.6z" fill="C"/>',
    "pose-nappe": '<path d="M11 5.2L20.4 11 11 16.8 1.6 11z" fill="C" opacity=".42"/><path d="M5.6 11.2q2.7-2.2 5.4 0t5.4 0" stroke="C" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M11 5.2L20.4 11 11 16.8 1.6 11z" fill="none" stroke="C" stroke-width="1.4"/>',
    "pose-nappe-soin": '<path d="M11 8.2L20.4 13 11 17.8 1.6 13z" fill="C" opacity=".45"/><path d="M11 8.2L20.4 13 11 17.8 1.6 13z" fill="none" stroke="C" stroke-width="1.4"/><path d="M9.2 1.8h3.6v3h3v3.6h-3v3H9.2v-3h-3V4.8h3z" fill="C"/>',
    "pose-nappe-fume": '<path d="M11 10.2L20.4 14.6 11 19 1.6 14.6z" fill="C" opacity=".42"/><circle cx="8" cy="8.6" r="3.6" fill="C"/><circle cx="12.6" cy="6" r="4" fill="C"/><circle cx="15.4" cy="9.6" r="2.8" fill="C"/>',
    "pose-graine": '<ellipse cx="11" cy="16.4" rx="6.6" ry="3" fill="C" opacity=".55"/><path d="M11 15V8.4" stroke="C" stroke-width="2" stroke-linecap="round"/><path d="M11 9.4Q6 9.6 5 5.2q5 0 6 4.2zM11 8.4q1.4-4.6 6.6-4.4-1 4.8-6.6 4.4z" fill="C"/>',
    "pose-ustensile": '<path d="M4 8h14l-1.2 9.2Q11 20.4 5.2 17.2z" fill="C"/><path d="M2.4 8h17.2" stroke="C" stroke-width="2.2" stroke-linecap="round"/><path d="M9 5.2h4" stroke="C" stroke-width="2.2" stroke-linecap="round"/>',
    invoque: '<path d="M11 19.6q-6.6-1-6.4-6.6.2-5.2 6.4-5.2t6.4 5.2q.2 5.6-6.4 6.6z" fill="C"/><path d="M11 8q-3.4-4.4-1.4-6.2 2 1.6 1.4 6.2zM11.4 8q2.2-5 5-4.2-.8 3.6-5 4.2z" fill="C"/><circle cx="8.8" cy="13" r="1.1" fill="#0D2D2A"/><circle cx="13.2" cy="13" r="1.1" fill="#0D2D2A"/>',
    outil: '<path d="M4.6 17.4L13.4 8.6" stroke="C" stroke-width="3" stroke-linecap="round"/><rect x="11.6" y="2.6" width="8" height="7.4" rx="1.6" transform="rotate(45 15.6 6.3)" fill="C"/>',
    bond: '<path d="M3.2 18.4Q8 2.4 17 13.4" fill="none" stroke="C" stroke-width="2.4" stroke-linecap="round"/><path d="M13 13.6l4.6.6.4-4.6" fill="none" stroke="C" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 19.6h7" stroke="C" stroke-width="1.6" opacity=".6"/>',
    echange: '<path d="M3.6 8h13M13 4.4L16.6 8 13 11.6M18.4 14H5.4M9 10.4L5.4 14 9 17.6" fill="none" stroke="C" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>',
    dos: '<path d="M16.8 16.4A7 7 0 1 1 15.6 5.4" fill="none" stroke="C" stroke-width="2.4" stroke-linecap="round"/><path d="M12.4 4.6l3.6.6-.8 3.6" fill="none" stroke="C" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="11" cy="11" r="2.4" fill="C"/>',
    soin: '<path d="M8.6 3.4h4.8v5.2h5.2v4.8h-5.2v5.2H8.6v-5.2H3.4V8.6h5.2z" fill="C"/>',
    bouclier: '<path d="M11 2.4l7.4 3v5.6c0 4.8-3.2 8.2-7.4 9.4-4.2-1.2-7.4-4.6-7.4-9.4V5.4z" fill="C"/><path d="M11 5.6v11.6" stroke="#0D2D2A" stroke-width="1.2" opacity=".45"/>',
    pousse: '<circle cx="5.4" cy="11" r="3.4" fill="C"/><path d="M10.4 11h8.6M15.2 7.2L19 11l-3.8 3.8" fill="none" stroke="C" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
    attire: '<circle cx="16.6" cy="11" r="3.4" fill="C"/><path d="M11.6 11H3M6.8 7.2L3 11l3.8 3.8" fill="none" stroke="C" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
    rebond: '<circle cx="4" cy="16.6" r="2.4" fill="C"/><circle cx="11" cy="5" r="2.4" fill="C"/><circle cx="18" cy="16.6" r="2.4" fill="C"/><path d="M5.2 14.4l4.6-7.2M12.2 7.2l4.6 7.2" stroke="C" stroke-width="1.8" stroke-dasharray="2 1.6"/>',
    retire: '<circle cx="11" cy="11" r="8.4" fill="none" stroke="C" stroke-width="2"/><path d="M6.6 11h8.8" stroke="C" stroke-width="3" stroke-linecap="round"/>',
    bonus: '<path d="M4.4 12.6L11 6l6.6 6.6M4.4 18.4L11 11.8l6.6 6.6" fill="none" stroke="C" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="11" cy="2.6" r="1.6" fill="C"/>',
    "bouclier-allie": '<path d="M9 2.6l6 2.4v4.8c0 3.9-2.6 6.8-6 7.8-3.4-1-6-3.9-6-7.8V5z" fill="C"/><path d="M13.4 17h6.2M17 14.4l2.6 2.6L17 19.6" fill="none" stroke="C" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>',
    armure: '<path d="M5 3.6h4l2 2 2-2h4l2.4 4.2-2.2 2V18.4H4.8V9.8L2.6 7.8z" fill="C"/><path d="M8 11.2h6M8 14.4h6" stroke="#0D2D2A" stroke-width="1.3" opacity=".55"/>',
    toque: '<path d="M6 13l-.6-4C3 8.4 2.6 5.8 4.2 4.6c1.4-1 3-.4 3.8.4.6-1.8 2-2.6 3.4-2.4 1.8.2 2.8 1.6 2.8 2.8 1.2-.8 3-.6 3.8.8 1 1.8-.2 3.8-2.4 4.2L15 13z" fill="C"/><rect x="5.6" y="14.2" width="9.8" height="4" rx="1" fill="C"/>',
    rideau: '<path d="M2.6 3.4h16.8" stroke="C" stroke-width="2" stroke-linecap="round"/><path d="M4 4.4q.4 8.4 4.4 15H4zM18 4.4q-.4 8.4-4.4 15H18z" fill="C"/><path d="M8.4 4.4q1 6.4 2.6 8.4 1.6-2 2.6-8.4z" fill="C" opacity=".5"/>',
    plume: '<path d="M18.6 2.6C10.6 3.4 5.4 8.6 4.2 17.8l2-1.2c1.2-5 4-8.8 8-11-3 3-5 6.2-6 10.2 6.4-1 10.2-6 10.4-13.2z" fill="C"/><path d="M3 19.6l3.4-3" stroke="C" stroke-width="1.8" stroke-linecap="round"/>',
    botte: '<path d="M6.6 2.6h6.4v8.2l5.2 3c1 .6 1.6 1.6 1.6 2.6v2.2H4.6v-5l2-1.4z" fill="C"/><path d="M6.6 6h6.4" stroke="#0D2D2A" stroke-width="1.2" opacity=".5"/>',
    losange: '<path d="M10 2l6.6 6.6L10 15.2 3.4 8.6z" fill="C"/><path d="M16.4 13.6v6.8M13 17h6.8" stroke="C" stroke-width="2.3" stroke-linecap="round"/>',
    oeil: '<path d="M2 11s3.6-6 9-6 9 6 9 6-3.6 6-9 6-9-6-9-6z" fill="none" stroke="C" stroke-width="2"/><circle cx="11" cy="11" r="3.1" fill="C"/>',
    "etat-plante": '<path d="M8 2h6l-1.6 11H9.6z" fill="C"/><path d="M9.6 13h2.8L11 19.4z" fill="C" opacity=".7"/><path d="M3 20h16" stroke="C" stroke-width="1.8" stroke-linecap="round"/>',
    "etat-glissant": '<path d="M2 9c3-4 6 4 9 0s6 4 9 0M2 15c3-4 6 4 9 0s6 4 9 0" stroke="C" stroke-width="2.3" fill="none" stroke-linecap="round"/>',
    "etat-derobe": '<path d="M2 11s3.6-6 9-6 9 6 9 6-3.6 6-9 6-9-6-9-6z" fill="none" stroke="C" stroke-width="2"/><circle cx="11" cy="11" r="2.6" fill="C"/><path d="M4 19L18 3" stroke="C" stroke-width="2.2" stroke-linecap="round"/>',
    etat: '<circle cx="11" cy="11" r="3.2" fill="C"/><path d="M11 2.6v3.4M11 16v3.4M2.6 11h3.4M16 11h3.4M5 5l2.4 2.4M14.6 14.6L17 17M17 5l-2.4 2.4M7.4 14.6L5 17" stroke="C" stroke-width="1.8" stroke-linecap="round"/>'
  };
  // La famille d'un sort, lue dans ses briques (aucune règle : seulement de quoi choisir un dessin)
  function familleSort(s) {
    const eff = (s && s.effets) || [], types = new Set();
    const voir = l => (l || []).forEach(b => { types.add(b.type); if (b.type === "si") voir(b.effets); });
    voir(eff);
    const pose = eff.find(b => b.type === "pose");
    if (types.has("bond") && !types.has("degats")) return "bond";
    if (pose) {
      if (pose.quoi === "nappe") { const pe = JSON.stringify(pose.effets || []); if (/"soin"/.test(pe)) return "pose-nappe-soin"; if (/"fume"/.test(pe)) return "pose-nappe-fume"; }
      return "pose-" + (SIGNES["pose-" + pose.quoi] ? pose.quoi : "nappe");
    }
    if (types.has("invoque")) return "invoque";
    if (s.emplacement === 0) return "outil";
    if (types.has("bond")) return "bond";
    if (types.has("echange")) return "echange";
    if (types.has("dans-le-dos")) return "dos";
    if (types.has("soin")) return "soin";
    const degats = types.has("degats"), forme = s.zone && s.zone.forme && s.zone.forme !== "case" ? s.zone.forme : null;
    if (degats && forme && SIGNES["zone-" + forme]) return "zone-" + forme;
    if (types.has("bouclier")) return s.cible === "allie" || s.cible === "combattant" ? "bouclier-allie" : "bouclier";
    if (types.has("pousse")) return "pousse";
    if (types.has("attire") || types.has("ramene")) return "attire";
    if (types.has("rebond")) return "rebond";
    if (degats) return s.rayon && s.rayon.max <= 1 ? "contact" : "distance";
    if (types.has("retire")) return "retire";
    // soutien : l'état le plus parlant, puis la caractéristique du bonus
    const et = eff.find(b => b.type === "etat" && SIGNES["etat-" + b.etat]);
    if (et) return "etat-" + et.etat;
    const bo = eff.find(b => b.type === "bonus");
    const CARAC = { conservation: "armure", coupDeMaitre: "toque", rideau: "rideau", fauxFuyant: "plume", pas: "botte", cm: "losange", rayon: "oeil" };
    if (bo && CARAC[bo.carac]) return CARAC[bo.carac];
    if (types.has("gainCM")) return "losange";
    if (types.has("bonus") || types.has("renforce") || types.has("entame")) return "bonus";
    if (types.has("etat")) return "etat";
    return forme && SIGNES["zone-" + forme] ? "zone-" + forme : "distance";
  }
  function iconeSort(s, taille) {
    const el = (s && s.element) || "N", c = CLAIRES[el] || CLAIRES.N, f = familleSort(s || {}), t = taille || 22;
    const signe = SIGNES[f].replace(/="C"/g, `="${c}"`);
    // l'élément en pastille, en bas à droite (sauf Neutre)
    const pastille = el === "N" ? "" : `<circle cx="18" cy="18" r="4.4" fill="#0D2D2A"/><g transform="translate(14.4 14.4) scale(.33)">${(ICONES[el] || "").replace(/="C"/g, `="${c}"`)}</g>`;
    return `<svg xmlns="${NS}" viewBox="0 0 22 22" width="${t}" height="${t}" aria-hidden="true">${signe}${pastille}</svg>`;
  }
  ORVANE.Proto = ORVANE.Proto || {};
  Object.assign(ORVANE.Proto, { ICONES, icone, iconeSort, familleSort, COULEURS_ELEMENTS: COULEURS, COULEURS_CLAIRES: CLAIRES });
})();
