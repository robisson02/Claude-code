/*
 * Orvane, prototype : la carte de l'Astrelier et la quête facultative « Le tour de l'Astrelier ».
 *   La carte (bouton « Carte » de l'exploration) : les îles et leurs liaisons, avec l'icône de chaque moyen ; l'île où l'on est ;
 *   les Fours banals allumés ; les îles pas encore visitées en silhouette. Toucher une île dit son nom et comment y aller.
 *   On ne voyage pas depuis la carte, sauf d'un Four banal allumé à un autre, quand on est devant un four.
 *   La quête (proposée à la fin de « Premier service », et sur la carte) : une étape par moyen de voyage ; même carte de quête
 *   que le tutoriel ; 30 Blé à la fin. La Grande Pelle et la Sieste n'en font pas partie (niveau 12).
 * La progression est dans le profil (profil.tour), sauvée par P.Profil.sauver (localStorage dans des try/catch).
 */
window.ORVANE = window.ORVANE || {};
(() => {
  const P = ORVANE.Proto = ORVANE.Proto || {};
  const I = () => P.Iles, V = () => P.Voyage;
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const meme = (a, b) => !!a && !!b && a[0] === b[0] && a[1] === b[1];

  // ---------- Les icônes des moyens de voyage (22 × 22, traits dorés) ----------
  const ICONES = {
    marche: '<path d="M6 15c-1.6 0-2.6-1.4-2.4-3.4.2-2.2 1.6-4 3-4 1.2 0 2 1.4 1.8 3.4-.2 2.4-1.2 4-2.4 4zM5.4 18.4a1.6 1.4 0 103.2 0 1.6 1.4 0 10-3.2 0zM15 9c-1.4 0-2.2-1.4-2-3.2.2-2 1.4-3.6 2.6-3.6 1.2 0 2 1.4 1.8 3.2-.2 2.2-1.2 3.6-2.4 3.6zM14.4 12.2a1.5 1.3 0 103 0 1.5 1.3 0 10-3 0z" fill="C"/>',
    // un pan de mur, son guichet en arc, la tablette ; le médaillon ⇄ des jumeaux au-dessus
    "passe-plat": '<path d="M3.5 20V9.5h15V20" fill="none" stroke="C" stroke-width="1.6" stroke-linejoin="round"/><path d="M6.4 16v-3.4a4.6 3.6 0 0 1 9.2 0V16z" fill="C" opacity=".9"/><path d="M2.6 16.4h16.8" stroke="C" stroke-width="1.8" stroke-linecap="round"/><path d="M7.4 4.6h7l-1.6-1.6M14.6 7H7.6l1.6 1.6" fill="none" stroke="C" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>',
    // une caisse suspendue à sa corde, une double flèche (monter, descendre)
    "monte-plats": '<path d="M11 1v4.6" stroke="C" stroke-width="1.6"/><path d="M4.6 8.6L11 5.4l6.4 3.2v8.2L11 20l-6.4-3.2z" fill="none" stroke="C" stroke-width="1.7" stroke-linejoin="round"/><path d="M11 9.4v8M8.8 11.4l2.2-2.2 2.2 2.2M8.8 15.4l2.2 2.2 2.2-2.2" fill="none" stroke="C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
    // une crêpe en goulotte qui descend, une pile de crêpes au départ
    toboggan: '<path d="M4 6.4c6 0 7.4 5 9.6 8.8 1.4 2.4 3.2 3.6 5.6 3.6" fill="none" stroke="C" stroke-width="4.2" stroke-linecap="round"/><path d="M4 6.4c6 0 7.4 5 9.6 8.8 1.4 2.4 3.2 3.6 5.6 3.6" fill="none" stroke="#0D2D2A" stroke-width="1.1" stroke-linecap="round" stroke-dasharray="1 2.4"/><ellipse cx="5" cy="3.4" rx="3.4" ry="1.4" fill="C"/>',
    // le dôme du four, sa bouche, et une petite flamme qui en sort
    four: '<path d="M3 19c0-7.4 3.6-11 8-11s8 3.6 8 11z" fill="C"/><path d="M8.6 19v-3.2a2.4 2.4 0 014.8 0V19z" fill="#0D2D2A"/><path d="M11 18.6c-1-1-1-2 0-3.2 1 1.2 1 2.2 0 3.2z" fill="#FFE6A8"/><path d="M11 1.2c-2 2.2-2.2 3.8-.6 5.4.2-1 .8-1.6 1.6-2 .4 1 .2 1.6-.4 2.2 1.8-.6 2.2-2.6-.6-5.6z" fill="C"/>',
    // la pelle à enfourner : un long manche, une palette large et plate, farinée
    pelle: '<path d="M2.4 2.8l7.2 6.4" stroke="C" stroke-width="2.2" stroke-linecap="round"/><rect x="8.6" y="8.4" width="11" height="10.4" rx="2.6" fill="C" transform="rotate(8 14 13.6)"/><circle cx="12.6" cy="12.6" r="1" fill="#0D2D2A" opacity=".6"/><circle cx="16" cy="15.2" r=".8" fill="#0D2D2A" opacity=".6"/>',
    sieste: '<path d="M3 15h16v3H3zM3 12h6v3H3z" fill="C"/><path d="M12 4h4l-4 4h4M17 9h2.6L17 11.6h2.6" fill="none" stroke="C" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>'
  };
  const icone = (n, c, t) => `<svg viewBox="0 0 22 22" width="${t || 20}" height="${t || 20}" aria-hidden="true">${(ICONES[n] || "").replace(/="C"/g, `="${c || "#E4C98E"}"`)}</svg>`;
  const NOMS = { marche: "À pied, par le bord", "passe-plat": "Passe-plat", "monte-plats": "Monte-plats", toboggan: "Toboggan (sens\u00A0unique)", four: "Four banal", pelle: "Grande Pelle (niveau\u00A012)", sieste: "Sieste" };

  // ---------- La carte de l'Astrelier ----------
  // Les îles sur la carte (repère 340 × 400) ; la Voie lactée est le pont lui-même
  const POS = {
    halle: { x: 78, y: 92, r: 40 }, "voie-lactee": { x: 128, y: 160, r: 0 }, fourneau: { x: 176, y: 226, r: 44 },
    penderie: { x: 266, y: 66, r: 34 }, moule: { x: 270, y: 292, r: 34 }, "grand-etal": { x: 86, y: 350, r: 34 }
  };
  const COULEURS = { halle: "#EFE6D2", fourneau: "#E6DAC1", penderie: "#E4CDA4", moule: "#EDE0BE", "grand-etal": "#DED6C6" };
  const vis = () => (P.Profil.monde() || {}).visitees || {};
  function ileSvg(id, ici) {
    const p = POS[id], connue = !!vis()[id] || ici, r = p.r, h = r / 2;
    const dessus = connue ? COULEURS[id] : "#2C3936", flanc = connue ? "#A8916A" : "#1F2B29", flanc2 = connue ? "#8A7550" : "#18221F";
    let s = `<g class="ile-svg${connue ? "" : " silhouette"}">`;
    s += `<path d="M${p.x - r} ${p.y} L${p.x} ${p.y + h} L${p.x} ${p.y + h + r * .7} L${p.x - r * .55} ${p.y + h + r * .38}z" fill="${flanc}"/>`;
    s += `<path d="M${p.x} ${p.y + h} L${p.x + r} ${p.y} L${p.x + r * .55} ${p.y + h + r * .38} L${p.x} ${p.y + h + r * .7}z" fill="${flanc2}"/>`;
    s += `<path d="M${p.x} ${p.y - h} L${p.x + r} ${p.y} L${p.x} ${p.y + h} L${p.x - r} ${p.y}z" fill="${dessus}" stroke="${connue ? "#C5A572" : "#3F4E4A"}" stroke-width="1.2"/>`;
    // un petit signe de l'île
    if (connue) {
      if (id === "penderie") s += `<path d="M${p.x - 12} ${p.y - 14}h24M${p.x - 10} ${p.y - 14}v14M${p.x + 10} ${p.y - 14}v14" stroke="#5B4632" stroke-width="1.6"/><path d="M${p.x - 6} ${p.y - 13}l-2 9h5zM${p.x + 3} ${p.y - 13}l-2 9h5z" fill="#2A5049"/>`;
      if (id === "moule") s += `<ellipse cx="${p.x + 8}" cy="${p.y - 4}" rx="8" ry="3.4" fill="#C9BC9C" stroke="#8C7F62"/><path d="M${p.x + 0} ${p.y - 4}v-5h16v5" fill="#D9CCAB" stroke="#8C7F62"/>`;
      if (id === "fourneau") s += `<path d="M${p.x - 20} ${p.y - 2}h10M${p.x + 8} ${p.y + 6}h8" stroke="#8A6238" stroke-width="3" stroke-linecap="round"/>`;
      if (id === "halle") s += `<path d="M${p.x - 18} ${p.y - 6}l9 -9 9 9z" fill="#2A5049"/><path d="M${p.x + 4} ${p.y - 2}l8 -8 8 8z" fill="#2A5049"/>`;
      if (id === "grand-etal") s += `<path d="M${p.x - 14} ${p.y - 2}v-12l7 -6 7 6v12zM${p.x + 2} ${p.y + 2}v-10l6 -5 6 5v10z" fill="#8F8774"/>`;
    }
    // le Four banal de l'île : une flamme dorée s'il est allumé, grise sinon
    const f = I().ile(id).objets.find(o => o.genre === "four");
    if (f) {
      const al = V().allume(f);
      s += `<g transform="translate(${id === "grand-etal" ? p.x + r - 20 : p.x - r + 2} ${p.y - h - 14})"><circle cx="9" cy="9" r="9.5" fill="#0D2D2A" stroke="${al ? "#E4C98E" : "#55605C"}" stroke-width="1.2"/><g transform="translate(.2 .2) scale(.8)">${(ICONES.four).replace(/="C"/g, `="${al ? "#E4C98E" : "#6E7A76"}"`)}</g></g>`;
    }
    if (ici) s += epingle(p.x + r * .38, p.y - h - 2);
    return s + "</g>";
  }
  // l'épingle dorée de l'île où l'on est (sa pointe touche l'île)
  const epingle = (x, y) => `<g class="ici"><path d="M${x} ${y} C${x - 3} ${y - 6} ${x - 8} ${y - 9} ${x - 8} ${y - 15} a8 8 0 0 1 16 0 C${x + 8} ${y - 9} ${x + 3} ${y - 6} ${x} ${y}z" fill="#E4C98E" stroke="#0D2D2A" stroke-width="1.6"/><circle cx="${x}" cy="${y - 15}" r="3.2" fill="#0D2D2A"/></g>`;
  function lienSvg(a, b, genre, o = {}) {
    const A = POS[a], B = POS[b], mx = (A.x + B.x) / 2 + (o.dx || 0), my = (A.y + B.y) / 2 + (o.dy || 0);
    const pointille = genre === "passe-plat" || genre === "four" || genre === "sieste" ? ' stroke-dasharray="2 6"' : genre === "pelle" ? ' stroke-dasharray="8 5"' : "";
    let s = `<path d="M${A.x} ${A.y} Q${mx} ${my} ${B.x} ${B.y}" fill="none" stroke="#C5A572" stroke-opacity=".75" stroke-width="2"${pointille} stroke-linecap="round"/>`;
    // le moyen, en pastille au milieu du lien (et une flèche s'il est à sens unique)
    const cx = (A.x + 2 * mx + B.x) / 4, cy = (A.y + 2 * my + B.y) / 4;
    if (o.sensUnique) {
      const ang = Math.atan2(B.y - A.y, B.x - A.x) * 180 / Math.PI;
      s += `<path d="M-6 -5 L5 0 L-6 5" transform="translate(${(cx + B.x) / 2} ${(cy + B.y) / 2}) rotate(${ang.toFixed(1)})" fill="none" stroke="#E4C98E" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    s += `<g transform="translate(${cx - 13} ${cy - 13})"><circle cx="13" cy="13" r="13" fill="#0D2D2A" stroke="#C5A572" stroke-width="1.2"/><g transform="translate(3 3)">${(ICONES[genre] || "").replace(/="C"/g, '="#E4C98E"')}</g></g>`;
    return s;
  }
  function voieLactee() {
    const A = POS.halle, B = POS.fourneau;
    let s = `<path d="M${A.x + 22} ${A.y + 14} Q${POS["voie-lactee"].x - 12} ${POS["voie-lactee"].y + 10} ${B.x - 24} ${B.y - 16}" fill="none" stroke="${vis()["voie-lactee"] ? "#FBF8F0" : "#2C3936"}" stroke-width="13" stroke-linecap="round" opacity=".92"/>`;
    if (vis()["voie-lactee"]) [[.2, -2], [.35, 3], [.5, -1], [.65, 2], [.8, -3]].forEach(([t, d]) => {
      const x = (1 - t) * (1 - t) * (A.x + 22) + 2 * (1 - t) * t * (POS["voie-lactee"].x - 12) + t * t * (B.x - 24), y = (1 - t) * (1 - t) * (A.y + 14) + 2 * (1 - t) * t * (POS["voie-lactee"].y + 10) + t * t * (B.y - 16);
      s += `<circle cx="${x + d}" cy="${y - d}" r="1.4" fill="#C5A572"/>`;
    });
    return s;
  }
  function svgCarte(ici) {
    let s = `<svg class="carte-svg" viewBox="0 0 340 400" role="img" aria-label="Carte de l'Astrelier">`;
    s += `<rect width="340" height="400" rx="14" fill="#0D2D2A"/>`;
    let g = 5; const rnd = () => (g = (g * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 60; i++) s += `<circle cx="${(rnd() * 340).toFixed(1)}" cy="${(rnd() * 400).toFixed(1)}" r="${(rnd() * .9 + .3).toFixed(2)}" fill="${rnd() > .7 ? "#C5A572" : "#F2EDE0"}" opacity="${(rnd() * .5 + .25).toFixed(2)}"/>`;
    // la frontière de l'Astrelier : en dessous, le monde (Grand-Étal)
    s += `<path d="M6 300 Q170 300 336 360" fill="none" stroke="#55605C" stroke-width="1.2" stroke-dasharray="3 5"/><text x="232" y="390" fill="#B5BFB8" font-size="10.5" font-family="Atkinson Hyperlegible, sans-serif">Hors de l'Astrelier</text>`;
    s += voieLactee();
    s += lienSvg("halle", "penderie", "passe-plat", { dy: -26 });
    s += lienSvg("fourneau", "penderie", "monte-plats", { dx: 10 });
    s += lienSvg("penderie", "moule", "toboggan", { dx: 34, sensUnique: true });
    s += lienSvg("moule", "grand-etal", "pelle", { dy: 22, sensUnique: true });
    s += lienSvg("grand-etal", "halle", "sieste", { dx: -70, sensUnique: true });
    ["halle", "fourneau", "penderie", "moule", "grand-etal"].forEach(id => (s += ileSvg(id, id === ici)));
    // les deux bouts du pont : à pied (à droite de la bande ; l'étiquette « La Voie lactée » est à gauche)
    [["halle", .26], ["fourneau", .76]].forEach(([, t]) => {
      const A = POS.halle, B = POS.fourneau, C = POS["voie-lactee"];
      const x = (1 - t) * (1 - t) * (A.x + 22) + 2 * (1 - t) * t * (C.x - 12) + t * t * (B.x - 24), y = (1 - t) * (1 - t) * (A.y + 14) + 2 * (1 - t) * t * (C.y + 10) + t * t * (B.y - 16);
      s += `<g transform="translate(${x + 6} ${y - 16})"><circle cx="11" cy="11" r="11" fill="#0D2D2A" stroke="#C5A572" stroke-width="1.1"/><g transform="translate(1.5 1.5) scale(.86)">${ICONES.marche.replace(/="C"/g, '="#E4C98E"')}</g></g>`;
    });
    if (ici === "voie-lactee") { const p = POS["voie-lactee"]; s += epingle(p.x - 6, p.y + 2); }
    return s + `</svg>`;
  }
  // Comment aller sur une île : les liaisons qui y mènent, en phrases
  function commentYAller(id) {
    const l = I().liaisons().filter(x => x.vers === id), out = [];
    const phrase = x => {
      const de = I().ile(x.de);
      switch (x.genre) {
        case "marche": return `à pied, par le bord ${de.de} (une flèche dorée)`;
        case "passe-plat": return `par le passe-plat ${de.de}`;
        case "monte-plats": return `par le monte-plats ${de.de}`;
        case "toboggan": return `par le toboggan ${de.de} (sens unique)`;
        case "pelle": return `par la Grande Pelle ${de.de}, au niveau ${I().NIVEAU_PELLE} (sens unique)`;
        default: return "";
      }
    };
    l.forEach(x => out.push(phrase(x)));
    const f = I().ile(id).objets.find(o => o.genre === "four");
    if (f && I().ile(id).monde === "astrelier") out.push(V().allume(f) ? "par un autre Four banal allumé (le sien est allumé)" : "par son Four banal, une fois allumé (passe devant pour l'allumer)");
    if (id !== "grand-etal" && I().ile(id).monde === "astrelier" && (id === "halle" || (f && V().allume(f)))) out.push("de Grand-Étal, en faisant la sieste");
    return out;
  }
  let choisie = null;
  function ouvrirCarte() {
    const s = P.Jeu && P.Jeu.sceneActive, ici = (P.Jeu && P.Jeu.monde && P.Jeu.monde.ile) || "fourneau";
    choisie = null;
    const boutons = I().LISTE.map(id => {
      const p = POS[id], ile = I().ile(id), connue = !!vis()[id] || id === ici;
      return `<button type="button" class="ile-b${connue ? "" : " inconnue"}${id === ici ? " ici" : ""}" data-ile="${id}" style="left:${((p.x + (id === "voie-lactee" ? -48 : 0)) / 340 * 100).toFixed(2)}%;top:${((p.y + (id === "voie-lactee" ? 10 : 14)) / 400 * 100).toFixed(2)}%" aria-label="${esc(ile.nom)}${id === ici ? " (tu es ici)" : connue ? "" : " (pas encore visitée)"}"><span>${esc(ile.court.charAt(0).toUpperCase() + ile.court.slice(1))}</span></button>`;
    }).join("");
    const legende = ["marche", "passe-plat", "monte-plats", "toboggan", "four", "pelle", "sieste"].map(n => `<li>${icone(n, "#E4C98E", 18)}<span>${esc(NOMS[n])}</span></li>`).join("");
    const corps = `<div class="carte-astrelier">${svgCarte(ici)}${boutons}</div>
      <p class="carte-detail" id="carte-detail" aria-live="polite">Tu es ${esc(I().ile(ici).a)}. Touche une île pour savoir comment y aller.</p>
      <div id="carte-depart"></div>
      <details class="carte-legende"><summary>Les moyens de voyage</summary><ul>${legende}</ul><p class="texte-doux">Petit four doré avec sa flamme : Four banal allumé (gris : éteint). Épingle dorée : tu es ici. Île sombre : pas encore visitée.</p></details>
      ${blocQuete()}`;
    const c = P.UI.fenetre("d-carte", "Carte de l'Astrelier", corps, `<button type="button" class="bouton or" data-fermer>Fermer</button>`);
    c.querySelectorAll("[data-ile]").forEach(b => (b.onclick = () => montrerIle(c, b.dataset.ile)));
    brancherQuete(c);
    if (s && V().fourDevant(s)) montrerDeparts(c);
  }
  // Devant un Four banal allumé : la carte permet d'en partir vers les autres fours allumés
  function montrerDeparts(c) {
    const s = P.Jeu.sceneActive, r = V().fourDevant(s), z = c.querySelector("#carte-depart");
    if (!r || !z) return;
    const l = I().fours(I().ile(r.o.ile).monde).filter(f => f.id !== r.o.id && V().allume(f));
    z.innerHTML = l.length ? `<p class="texte-doux">Tu es devant le Four banal ${esc(I().ile(r.o.ile).de)}. Tu peux partir vers :</p><ul class="voyages">${l.map(f => `<li><span><b>${esc(I().ile(f.ile).nom)}</b><small>Four banal ${esc(I().ile(f.ile).de)}</small></span><button type="button" class="bouton or" data-partir="${f.id}">Partir</button></li>`).join("")}</ul>` : "";
    z.querySelectorAll("[data-partir]").forEach(b => (b.onclick = () => { P.UI.fermer("d-carte"); V().partirDuFour(P.Jeu.sceneActive, b.dataset.partir); }));
  }
  function montrerIle(c, id) {
    const ile = I().ile(id), ici = P.Jeu.monde && P.Jeu.monde.ile, d = c.querySelector("#carte-detail");
    choisie = id;
    c.querySelectorAll("[data-ile]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.ile === id)));
    const voies = commentYAller(id);
    d.innerHTML = `<b>${esc(ile.nom)}</b>${id === ici ? " · tu es ici" : !vis()[id] ? " · pas encore visitée" : ""}<br>${esc(ile.texte)}` +
      (id === ici ? "" : `<br><span class="comment">Pour y aller : ${esc(voies.join(" ; ") || "pas encore de chemin")}.</span>`);
  }

  // ---------- La quête « Le tour de l'Astrelier » ----------
  const QUETE = "Le tour de l'Astrelier", PNJ = "Mère Fournil", RECOMPENSE = 30;
  const ETAPES = [
    { id: "fours", titre: "Allumer deux Fours banals" },
    { id: "four", titre: "Voyager d'un four à l'autre" },
    { id: "pont", titre: "Traverser la Voie lactée" },
    { id: "passe-plat", titre: "Prendre le passe-plat" },
    { id: "monte-plats", titre: "Prendre le monte-plats" },
    { id: "toboggan", titre: "Glisser sur le toboggan" }
  ];
  const N = ETAPES.length;
  const tour = () => { const p = P.Profil.profil; return p && p.tour ? p.tour : null; };
  const actif = () => { const t = tour(); return !!t && t.statut === "actif"; };
  const sauver = () => { try { P.Profil.sauver(); } catch (e) { /* stockage indisponible */ } };
  // les fours de l'Astrelier allumés par l'artisan (celui de la Halle brûle toujours : il ne compte pas)
  const foursAllumes = () => I().fours("astrelier").filter(f => !f.toujoursAllume && V().allume(f)).length;
  function verifierFours() { const t = tour(); if (t && t.statut === "actif" && !t.fait.fours && foursAllumes() >= 2) reussir("fours"); }
  let bravo = null, passerJusqua = 0, bravoEnAttente = null;
  const faites = t => ETAPES.filter(e => t.fait[e.id]).length;
  // silence : l'étape est comptée (et sauvée) pendant le passage, le « Bravo » attend l'arrivée sur l'autre île
  function reussir(id, silence) {
    const t = tour(); if (!t || t.statut !== "actif" || t.fait[id]) return;
    t.fait[id] = true; sauver();
    const txt = `Bravo ! ${faites(t)} sur ${N}`;
    if (silence) { bravoEnAttente = txt; return; }
    bravo = { texte: txt, jusqua: Date.now() + 2400 };
    actualiser(true);
  }
  // Commencer, ou reprendre une quête arrêtée (les étapes faites sont gardées)
  function commencer() {
    const p = P.Profil.profil; if (!p) return;
    const ancien = tour() || {}, reprise = ancien.statut === "refuse";
    p.tour = { statut: "actif", fait: reprise && ancien.fait ? Object.assign({}, ancien.fait) : {}, recompense: !!ancien.recompense, replie: false, propose: true };
    sauver();
    verifierFours();
    actualiser();
    P.UI.toast(reprise ? `Quête reprise : ${QUETE}` : `Quête : ${QUETE}`, { genre: "titre" });
  }
  function arreter() {
    const t = tour(); if (!t) return;
    t.statut = "refuse"; sauver();
    actualiser();
    P.UI.toast("Quête arrêtée. Tu peux la reprendre sur la carte.");
  }
  function signal(nom, a) {
    const t = tour(); if (!t || t.statut !== "actif") return;
    if (nom === "four-allume") {
      verifierFours();
      // le premier des deux fours : on le dit (« 1 sur 2 »)
      if (!t.fait.fours) { const k = foursAllumes(); if (k > 0) bravo = { texte: `Four allumé : ${k} sur 2`, jusqua: Date.now() + 2400 }; }
    }
    if ((nom === "passage" || nom === "arrivee") && a) {
      const silence = nom === "passage";
      if (a.genre === "four") reussir("four", silence);
      if (a.genre === "passe-plat" || a.genre === "monte-plats" || a.genre === "toboggan") reussir(a.genre, silence);
      if (a.genre === "marche" && a.traverse) reussir("pont", silence);
      if (nom === "arrivee") {
        verifierFours();
        if (bravoEnAttente) { bravo = { texte: bravoEnAttente, jusqua: Date.now() + 2400 }; bravoEnAttente = null; }
      }
    }
    if (nom !== "passage") actualiser(true);
  }
  function terminer() {
    const t = tour(), p = P.Profil.profil; if (!t || !p) return;
    t.statut = "fini";
    let don = false;
    if (!t.recompense) { t.recompense = true; don = true; p.ble += RECOMPENSE; }
    sauver();
    try { P.UI.bandeau(p); } catch (e) { /* rien */ }
    actualiser();
    const corps = `<p class="resultat">Quête réussie !</p><p>Tu as fait le tour de l'Astrelier : le pont, le passe-plat, le monte-plats, le toboggan et les Fours banals n'ont plus de secret pour toi.</p>
      <p>${don ? `Voici ta récompense : <b>${RECOMPENSE} Blé</b>.` : "Ta récompense, tu l'as reçue la première fois."}</p>
      <p class="texte-doux">Au niveau ${I().NIVEAU_PELLE}, la Grande Pelle du Moule te défournera à Grand-Étal, la ville neutre. Pour revenir, une sieste suffit.</p>`;
    P.UI.fenetre("d-fiche", `${QUETE} : réussi`, corps, `<button type="button" class="bouton or" data-fermer>Merci, ${PNJ} !</button>`, { image: P.portraits.fournil });
  }
  // Ce que dit la carte de quête : l'étape à faire ici si possible (avec l'objet à toucher), sinon le chemin vers la suivante
  // num : le numéro de l'étape dans la liste (celui de la carte et du journal), faites : combien sont faites
  function conseil() {
    const t = tour(), s = P.Jeu && P.Jeu.sceneActive;
    if (!t || !s || !s.ileId) return null;
    const ici = s.ileId, nf = faites(t), astre = I().ile(ici).monde === "astrelier";
    // hors de l'Astrelier (Grand-Étal) : toutes les étapes sont là-bas, on rentre par la Sieste
    if (!astre) {
      const lit = (s.objetsVoyage || []).find(x => x.o.genre === "sieste");
      const k = ETAPES.findIndex(e => !t.fait[e.id]);
      return { num: k < 0 ? N : k + 1, faites: nf, texte: "Les étapes sont dans l'Astrelier. Fais la sieste pour y rentrer : touche deux fois le lit de farine.", cible: lit ? lit.o.case : null };
    }
    const objetIci = genre => (s.objetsVoyage || []).find(r => r.o.genre === genre);
    const vers = (ile, texte) => { const o = V().sortieVers(ici, ile); return { texte, cible: o ? o.case : null }; };
    const options = [];
    ETAPES.forEach((e, k) => {
      if (t.fait[e.id]) return;
      const opt = o => options.push(Object.assign({ num: k + 1 }, o));
      if (e.id === "fours") {
        const n = foursAllumes(), r = (s.objetsVoyage || []).find(x => x.o.genre === "four" && !V().allume(x.o));
        if (r) opt({ ici: true, texte: `Passe devant ce Four banal pour l'allumer (four ${n + 1} sur 2).`, cible: r.o.case });
        else { const f = I().fours("astrelier").find(o => !o.toujoursAllume && !V().allume(o)); if (f) opt(vers(f.ile, `Allume deux Fours banals en passant devant (${n} sur 2). Il en reste un ${I().ile(f.ile).a}.`)); }
      } else if (e.id === "four") {
        const r = (s.objetsVoyage || []).find(x => x.o.genre === "four" && V().allume(x.o));
        if (r) opt({ ici: true, texte: "Touche deux fois le Four banal, puis « Partir » vers un autre four.", cible: r.o.case });
        else opt(vers("halle", "Voyage d'un Four banal allumé à un autre. Celui de la Halle est toujours allumé."));
      } else if (e.id === "pont") {
        if (ici === "voie-lactee") {
          const m = P.Profil.monde() || {}, bout = m.entreeVL === "haut" ? "vl-bas" : "vl-haut", o = I().objet(bout);
          opt({ ici: true, texte: "Traverse le pont jusqu'à l'autre bout, puis touche deux fois la flèche dorée.", cible: o.case });
        } else if (ici === "halle" || ici === "fourneau") {
          const r = (s.objetsVoyage || []).find(x => x.o.genre === "marche");
          opt({ ici: true, texte: "Traverse la Voie lactée : touche deux fois la flèche dorée, au bord de l'île.", cible: r ? r.o.case : null });
        } else opt(vers("fourneau", "Traverse la Voie lactée, le pont entre la Halle et le Fourneau."));
      } else {
        const r = objetIci(e.id);
        const nom = { "passe-plat": "le passe-plat", "monte-plats": "le monte-plats", toboggan: "le toboggan" }[e.id];
        if (r) opt({ ici: true, texte: `Prends ${nom} : touche-le deux fois.`, cible: r.o.case });
        else {
          const ile = e.id === "toboggan" ? "penderie" : e.id === "passe-plat" ? (ici === "fourneau" || ici === "voie-lactee" ? "penderie" : "halle") : (ici === "halle" || ici === "voie-lactee" ? "fourneau" : "penderie");
          opt(vers(ile, `Prends ${nom}, ${{ penderie: "à la Penderie des Tabliers", halle: "à la Halle des Ébauches", fourneau: "au Fourneau" }[ile]}.`));
        }
      }
    });
    const o = options.find(x => x.ici) || options[0] || null;
    return o ? Object.assign({ faites: nf }, o) : { num: N, faites: nf, texte: "Bravo ! Le tour est fait.", cible: null };
  }
  let vueTour = null, bas0 = null;
  function rendre(v) {
    const carte = $("tour-carte"); if (!carte) return;
    const etaitCache = carte.hidden, montrer = !!v;
    carte.hidden = !montrer;
    if (montrer) {
      const t = tour() || {};
      carte.classList.toggle("repliee", !!t.replie);
      const br = $("tour-replier");
      br.setAttribute("aria-expanded", String(!t.replie));
      br.setAttribute("aria-label", `${QUETE}, étape ${v.num} sur ${N}` + (t.replie ? " : déplier la carte de quête" : " : replier la carte de quête"));
      const W = window.innerWidth;
      let haut = 8;
      ["bandeau-balade"].forEach(id => { const e = $(id); if (!e || e.hidden) return; const r = e.getBoundingClientRect(); if (r.height && r.left < W * .45) haut = Math.max(haut, r.bottom + 6); });
      const top = Math.round(haut) + "px"; if (carte.style.top !== top) carte.style.top = top;
      const b = bravo && Date.now() < bravo.jusqua ? bravo.texte : "";
      carte.classList.toggle("bravo", !!b);
      ecrire($("tour-etape"), b || `Étape ${v.num} sur ${N} · ${v.faites ? v.faites + " faite" + (v.faites > 1 ? "s" : "") : "aucune faite"}`);
      ecrire($("tour-num"), `${v.num}/${N}`);
      const arme = passerJusqua > Date.now();
      ecrire($("tour-texte"), arme ? "Touche « Sûr ? » pour arrêter la quête." : v.texte);
      const ba = $("tour-arreter"); ba.classList.toggle("arme", arme); ecrire(ba, arme ? "Sûr ?" : "Arrêter");
      ba.setAttribute("aria-label", arme ? "Toucher encore pour arrêter la quête" : "Arrêter la quête");
      const img = $("tour-portrait"); if (P.portraits.fournil && img.getAttribute("src") !== P.portraits.fournil) img.src = P.portraits.fournil;
    }
    const r = montrer ? carte.getBoundingClientRect() : null;
    $("app").style.setProperty("--tour-h", r ? Math.max(0, Math.round(r.bottom) - 58) + "px" : "0px");
    const cle = montrer ? carte.style.top + (carte.classList.contains("repliee") ? "r" : "") : "";
    if (etaitCache !== !montrer || (bas0 !== null && cle !== bas0)) { if (P.Jeu && P.Jeu.recadrer) P.Jeu.recadrer(); }
    bas0 = cle;
    anneau(v && !(tour() || {}).replie ? v.cible : null);
  }
  function ecrire(e, t) { t = P.typo ? P.typo(t) : t; if (e && e.textContent !== t) e.textContent = t; }
  // L'anneau doré sur l'objet à toucher (comme le tutoriel)
  let caseAnneau = null, raf = 0;
  function anneau(c) {
    caseAnneau = c ? c.slice() : null;
    if (caseAnneau && !raf) raf = requestAnimationFrame(placer);
    if (!caseAnneau) { const a = $("tour-anneau"); if (a && !a.hidden) a.hidden = true; }
  }
  let style0 = "";
  function placer() {
    raf = 0;
    const a = $("tour-anneau"), s = P.Jeu && P.Jeu.sceneActive, c = caseAnneau;
    if (!a) return;
    if (!c || !s || !s.vue || !s.sys || !s.sys.isActive() || P.UI.ouvert() || s.enPassage) { a.hidden = true; if (c) raf = requestAnimationFrame(placer); return; }
    const w = P.iso(c[0], c[1]), e = s.vue.versEcran(w.x, w.y), Z = s.vue.Z, L = P.ISO.L * Z * 1.16, H = P.ISO.H * Z * 1.16, r = P.UI.rectUtile();
    a.hidden = !(e.x > r.x - 10 && e.x < r.x + r.w + 10 && e.y > r.y - 10 && e.y < r.y + r.h + 10);
    const st = `width:${L.toFixed(1)}px;height:${H.toFixed(1)}px;transform:translate(${(e.x - L / 2).toFixed(1)}px,${(e.y - H / 2).toFixed(1)}px)`;
    if (st !== style0) { a.style.cssText = st; style0 = st; }
    raf = requestAnimationFrame(placer);
  }
  function vue() {
    const t = tour(), J = P.Jeu;
    if (!t || t.statut !== "actif" || !J || J.etape !== "jeu") return null;
    if (P.Tuto && P.Tuto.actif && P.Tuto.actif()) return null;              // le tutoriel d'abord
    const s = J.sceneActive;
    if (!s || !s.sys || !s.sys.isActive() || s.sys.settings.key !== "balade") return null;
    return conseil();
  }
  // sansFin : pendant un geste (un four qu'on allume, puis son panneau qui s'ouvre), la fin de la quête attend la boucle suivante
  function actualiser(sansFin) {
    let v = null;
    try { v = vue(); } catch (e) { console.warn("Tour de l'Astrelier :", e); }
    vueTour = v;
    try { rendre(v); } catch (e) { console.warn("Tour de l'Astrelier (affichage) :", e); }
    // toutes les étapes faites : la fin de la quête, en exploration, quand aucune fenêtre n'est ouverte
    const t = tour();
    if (!sansFin && t && t.statut === "actif" && ETAPES.every(e => t.fait[e.id]) && P.Jeu && P.Jeu.nomScene && P.Jeu.nomScene() === "balade" && !P.UI.ouvert() && calmeIci()) terminer();
  }
  // L'artisan ne fait rien : ni passage, ni marche vers un objet (sinon le panneau de l'objet recouvrirait la fin de la quête)
  function calmeIci() { const s = (P.Jeu && P.Jeu.sceneActive) || {}; return !s.enPassage && !s.marche && !s.ensuite && !s.marcheDifferee; }
  // Proposée une fois : à la fin de « Premier service », après « Non, je connais le jeu », ou au retour dans le jeu si elle ne
  // l'a jamais été (le jeu fermé pendant la fenêtre de fin du tutoriel), quand aucune fenêtre n'est ouverte
  // (à la fin du tutoriel, elle revient même si l'on a déjà répondu « Plus tard » une fois, tant qu'elle n'est ni commencée ni finie)
  function proposerApresTuto(o = {}) {
    const t = tour(), deja = t && (t.statut || (t.propose && !o.finTuto));
    if (deja) return;
    let essais = 0;
    const quand = () => {
      if (P.Jeu.nomScene() === "balade" && !P.UI.ouvert() && calmeIci()) proposer(o);
      else if (++essais < 240) setTimeout(quand, 250);
    };
    setTimeout(quand, o.attente || 300);
  }
  function proposer(o = {}) {
    const p = P.Profil.profil; if (!p) return;
    const t0 = tour(); if (t0 && (t0.statut || (t0.propose && !o.finTuto))) return;
    p.tour = Object.assign(t0 || { statut: null, fait: {}, recompense: false, replie: false }, { propose: true });
    sauver();
    const corps = `<p>${o.sansTuto ? "" : "Encore une chose ! "}L'Astrelier a plusieurs îles. Pour passer de l'une à l'autre : un pont de lait d'étoiles, un passe-plat, un monte-plats, un toboggan, des Fours banals…</p>
      <p>Veux-tu les essayer ? C'est une petite quête, « ${QUETE} ». Elle n'est pas obligatoire. Récompense : <b>${RECOMPENSE} Blé</b>.</p>
      <p class="texte-doux">Tu la retrouves aussi sur la carte (bouton « Carte »).</p>`;
    const c = P.UI.fenetre("d-fiche", QUETE, corps, `<button type="button" class="bouton" data-fermer>Plus tard</button><button type="button" class="bouton or" id="tour-oui">Oui, j'y vais</button>`, { image: P.portraits.fournil });
    c.querySelector("#tour-oui").onclick = () => { P.UI.fermer("d-fiche"); commencer(); };
  }
  // Le journal de la quête (Mère Fournil, ou la carte)
  function listeEtapes(t) {
    return `<ol class="tuto-etapes">${ETAPES.map(e => `<li class="${t && t.fait[e.id] ? "fait" : ""}">${t && t.fait[e.id] ? '<span aria-hidden="true">✓</span> ' : ""}${esc(e.titre)}${t && t.fait[e.id] ? '<span class="vh"> (fait)</span>' : ""}</li>`).join("")}</ol>`;
  }
  function blocQuete() {
    const t = tour(), tuto = P.Tuto && P.Tuto.actif && P.Tuto.actif();
    let s = `<section class="carte-quete" aria-labelledby="carte-quete-titre"><h3 id="carte-quete-titre">Quête : ${esc(QUETE)}</h3>`;
    if (t && t.statut === "actif") s += `<p class="texte-doux">En cours. Fais chaque étape, dans l'ordre que tu veux.</p>${listeEtapes(t)}`;
    else if (t && t.statut === "fini") s += `<p class="texte-doux">Réussie ! Tu connais tous les passages de l'Astrelier.</p>`;
    else if (tuto) s += `<p class="texte-doux">Mère Fournil te la proposera après « Premier service ».</p>`;
    else if (t && t.statut === "refuse") s += `<p class="texte-doux">Quête arrêtée${faites(t) ? ` : ${faites(t)} étape${faites(t) > 1 ? "s" : ""} sur ${N} déjà faite${faites(t) > 1 ? "s" : ""}, elles sont gardées` : ""}.</p>${listeEtapes(t)}<button type="button" class="bouton or" id="carte-tour">Reprendre la quête</button>`;
    else s += `<p class="texte-doux">Essaie chaque passage de l'Astrelier : le pont, le passe-plat, le monte-plats, le toboggan, les Fours banals. Facultative. Récompense : ${RECOMPENSE} Blé.</p><button type="button" class="bouton or" id="carte-tour">Commencer la quête</button>`;
    return s + `</section>`;
  }
  function brancherQuete(c) {
    const b = c.querySelector("#carte-tour");
    if (b) b.onclick = () => { P.UI.fermer("d-carte"); commencer(); };
  }
  function parler() {
    const t = tour();
    let corps, pied;
    if (t && t.statut === "actif") {
      corps = `<p>${esc((vueTour && vueTour.texte) || "Fais le tour de l'Astrelier !")}</p>${listeEtapes(t)}`;
      pied = `<button type="button" class="bouton" id="tour-j-arreter">Arrêter la quête</button><button type="button" class="bouton or" data-fermer>Continuer</button>`;
    } else if (t && t.statut === "fini") {
      corps = `<p>Tu as fait le tour de l'Astrelier. Bravo !</p>`;
      pied = `<button type="button" class="bouton or" data-fermer>Merci !</button>`;
    } else {
      corps = `<p>L'Astrelier a plusieurs îles. Pour passer de l'une à l'autre : un pont, un passe-plat, un monte-plats, un toboggan, des Fours banals… Veux-tu les essayer ? Récompense : <b>${RECOMPENSE} Blé</b>.</p>`;
      pied = `<button type="button" class="bouton" data-fermer>Plus tard</button><button type="button" class="bouton or" id="tour-j-oui">Commencer</button>`;
    }
    const c = P.UI.fenetre("d-fiche", `${PNJ} · ${QUETE}`, corps, pied, { image: P.portraits.fournil });
    const ba = c.querySelector("#tour-j-arreter");
    if (ba) ba.onclick = () => { if (ba.dataset.sur) { P.UI.fermer("d-fiche"); arreter(); return; } ba.dataset.sur = "1"; ba.textContent = "Toucher encore pour arrêter"; ba.classList.add("or"); };
    const bo = c.querySelector("#tour-j-oui"); if (bo) bo.onclick = () => { P.UI.fermer("d-fiche"); commencer(); };
  }
  // ---------- La carte de quête : boutons et boucle ----------
  function brancher() {
    const ba = $("tour-arreter"), br = $("tour-replier");
    if (!ba || ba.dataset.branche) return;
    ba.dataset.branche = "1";
    ba.onclick = () => {
      if (passerJusqua > Date.now()) { passerJusqua = 0; arreter(); return; }
      passerJusqua = Date.now() + 4000; actualiser(); setTimeout(actualiser, 4050);
    };
    br.onclick = () => { const t = tour(); if (!t) return; t.replie = !t.replie; sauver(); actualiser(); };
  }
  function demarrer() {
    brancher();
    setInterval(() => { try { if (P.Jeu && P.UI && P.Profil) actualiser(); } catch (e) { console.warn("Tour de l'Astrelier :", e); } }, 300);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarrer); else demarrer();

  P.Astrelier = {
    ETAPES, QUETE, ICONES, icone, ouvrirCarte, commencer, arreter, signal, parler, proposerApresTuto, actualiser, commentYAller,
    etat() { const t = tour(); return t ? JSON.parse(JSON.stringify(Object.assign({}, t, { vue: vueTour }))) : null; }
  };
  P.Tour = P.Astrelier;
})();
