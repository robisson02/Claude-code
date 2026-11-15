/*
 * Orvane, prototype : l'interface en HTML par-dessus le terrain Phaser (boutons, frise, fiches, Addition, Grimoire, réglages).
 * Le terrain, les personnages, les aperçus et les animations sont dans Phaser ; ce qui se touche au doigt ou au clavier est ici
 * (focus visible, lecteurs d'écran, tailles de texte).
 */
window.ORVANE = window.ORVANE || {};
(() => {
  const P = ORVANE.Proto = ORVANE.Proto || {};
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ic = (n, c, t) => P.icone(n, c, t);
  const EL = () => ORVANE.ELEMENTS || {};
  const nomElement = e => (EL()[e] || {}).nom || e;
  const couleurElement = e => (EL()[e] || {}).couleur || "#C5A572";
  const pluriel = (n, s, p) => n + " " + (Math.abs(n) > 1 ? (p || s + "s") : s);
  const LATERAL = "(min-aspect-ratio: 5/4) and (min-width: 640px)";
  const lateral = () => { try { return window.matchMedia(LATERAL).matches; } catch (e) { return false; } };

  const ETATS = { brule: "Brûlé", ramolli: "Ramolli", enracine: "Enraciné", plante: "Planté", glissant: "Glissant", derobe: "Dérobé", nappe: "Nappé",
    fume: "Fumé", attendri: "Attendri", affine: "Affiné", feve: "Fève", "maree-haute": "Marée haute", "maree-basse": "Marée basse" };
  const ETATS_SENS = { brule: "perd des Victuailles au début de son tour", ramolli: "perd des Pas", enracine: "ne peut pas marcher", plante: "ne peut pas être poussé",
    glissant: "sort du contact sans perte", derobe: "invisible pour l'autre camp", nappe: "protégé par un glaçage", fume: "frappe moins fort", attendri: "craint davantage les coups",
    affine: "les effets du Fromagicien se renforcent", feve: "porte la fève", "maree-haute": "+2 Rayon", "maree-basse": "+20 % de dégâts" };
  const CARACS = { levure: "Levure", rayon: "Rayon", pas: "Pas", cm: "CM", conservation: "Conservation", coupDeMaitre: "Coup de maître", rideau: "Rideau",
    fauxFuyant: "Faux-fuyant", ouverture: "Ouverture", degatsPct: "% de dégâts" };
  const CONDITIONS = { cibleBlessee: "si la cible a moins de la moitié de ses Victuailles", dansLeDos: "dans le dos de la cible", auContact: "au contact",
    cibleAffinee: "si la cible est Affinée", mareeHaute: "à marée haute", mareeBasse: "à marée basse", buffetComplet: "si le Buffet est complet (3 pièges)", cibleTombe: "si la cible tombe" };
  const ZONES = { case: "", croix: "en croix", rond: "en rond", anneau: "en anneau", ligne: "en ligne", travers: "en travers", cone: "en cône", "demi-rond": "en demi-rond", carre: "en carré", terrain: "sur tout le terrain" };
  const LANCERS = { libre: "", ligne: "en ligne", diagonale: "en diagonale", "ligne+diagonale": "en ligne ou en diagonale" };
  const POSES = { nappe: "une nappe", piege: "un piège", fournee: "une fournée", graine: "une graine", ustensile: "un Ustensile" };
  // ce que vise un renfort (« famille:fournee », « element:F », un id de sort…), dit en français
  const FAMILLES = { fournee: "les fournées", piege: "les pièges", nappe: "les nappes", graine: "les graines", ustensile: "les Ustensiles", soin: "les soins",
    commis: "les Commis", invoque: "les Commis", degats: "les dégâts", bouclier: "les boucliers", pousse: "les poussées", attire: "les attirances", retire: "les retraits",
    etat: "les états", rebond: "les rebonds", pose: "les objets posés", bond: "les bonds" };
  P.NOMS_ETATS = ETATS;

  function nomRenfort(q) {
    q = String(q || "");
    if (q.indexOf("element:") === 0) return "les sorts de " + nomElement(q.slice(8));
    if (q.indexOf("famille:") === 0) return FAMILLES[q.slice(8)] || q.slice(8);
    if (FAMILLES[q]) return FAMILLES[q];
    const s = P.Profil && P.Profil.trouverSort(q);
    return s ? `« ${s.nom} »` : q;
  }
  function decrire(b, court) {
    switch (b.type) {
      case "degats": return `−${b.min} à −${b.max} ${nomElement(b.element)}` + (b.maitre && !court ? ` (coup de maître −${b.maitre[0]} à −${b.maitre[1]})` : "");
      case "soin": return `+${b.min} à +${b.max} Victuailles`;
      case "bouclier": return `Bouclier de ${b.valeur} pendant ${pluriel(b.tours, "tour")}` + (b.couchesMax > 1 ? `, jusqu'à ${b.couchesMax} couches` : "");
      case "pousse": return `Repousse de ${pluriel(b.cases, "case")}`;
      case "attire": return `Attire de ${pluriel(b.cases, "case")}`;
      case "ramene": return `Ramène un allié de ${pluriel(b.cases, "case")}`;
      case "bond": return "Bondit sur la case visée";
      case "echange": return "Échange sa place avec la cible";
      case "dans-le-dos": return "Passe dans le dos de la cible";
      case "etat": return `${ETATS[b.etat] || b.etat}` + (b.tours ? ` pendant ${pluriel(b.tours, "tour")}` : " tout le combat") + (b.couches > 1 ? ` (${b.couches} couches)` : "");
      case "retire": return `Retire ${b.n} ${b.quoi === "cm" ? "CM" : "Pas"}`;
      case "bonus": return `${b.valeur > 0 ? "+" : ""}${b.valeur} ${CARACS[b.carac] || b.carac} pendant ${pluriel(b.tours, "tour")}` + (b.qui === "allies" ? " (alliés)" : b.qui === "cible" ? " (la cible)" : "");
      case "gainCM": return `+${b.n} CM` + (b.qui === "allies" ? " aux alliés" : "");
      case "entame": return `Entame la cible à ${b.part} % pendant ${pluriel(b.tours, "tour")}`;
      case "rebond": return `Rebondit ${pluriel(b.fois, "fois", "fois")} (${b.part} %, ${pluriel(b.rayon, "case")} au plus)`;
      case "renforce": return `Renforce ${nomRenfort(b.quoi)} de ${b.valeur} %` + (b.tours ? ` pendant ${pluriel(b.tours, "tour")}` : "") + (b.fois ? ` (${pluriel(b.fois, "lancer")})` : "");
      case "si": {
        let cond = CONDITIONS[b.condition] || b.condition;
        if (b.condition === "cibleAffinee" && b.n) cond = `si la cible est Affinée (${pluriel(b.n, "couche")} au moins)`;
        return `${cond} : ` + (b.effets || []).map(x => decrire(x, court)).join(", ");
      }
      case "pose": return `Pose ${POSES[b.quoi] || b.quoi}` + (b.tours ? ` (${pluriel(b.tours, "tour")})` : "") + ((b.effets || []).length ? " : " + b.effets.map(x => decrire(x, court)).join(", ") : "") + (b.commis ? ` qui devient ${b.commis.nom}` : "");
      case "invoque": return `Appelle un Commis : ${b.commis.nom} (${b.commis.victuailles} Victuailles)`;
      default: return b.type;
    }
  }
  P.decrireEffet = decrire;

  // ---------- Typographie française : une espace insécable avant : ; ! ? » et après « ----------
  // P.typo(texte) pour un texte ; tout texte posé dans l'interface (#app) est aussi corrigé au vol (ses nœuds de texte seulement)
  P.typo = s => String(s == null ? "" : s).replace(/ ([:;!?»])/g, "\u00A0$1").replace(/« /g, "«\u00A0");
  function typoNoeud(n) {
    if (n.nodeType === 3) { const v = n.nodeValue, w = P.typo(v); if (v !== w) n.nodeValue = w; return; }
    if (n.nodeType !== 1 || /^(SCRIPT|STYLE)$/.test(n.tagName)) return;
    const it = document.createTreeWalker(n, NodeFilter.SHOW_TEXT);
    for (let t = it.nextNode(); t; t = it.nextNode()) { const v = t.nodeValue, w = P.typo(v); if (v !== w) t.nodeValue = w; }
  }
  function brancherTypo() {
    const app = $("app"); if (!app) return;
    typoNoeud(app);
    try { new MutationObserver(l => l.forEach(m => { if (m.type === "characterData") typoNoeud(m.target); else m.addedNodes.forEach(typoNoeud); })).observe(app, { childList: true, characterData: true, subtree: true }); } catch (e) { /* rien */ }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", brancherTypo); else brancherTypo();

  // ---------- Bulles (hors combat) ; en combat, tout passe par la ligne de message (rien sur la grille) ----------
  function toast(texte, o = {}) {
    texte = P.typo(texte);
    const m = P.UI && P.UI.mode && P.UI.mode.actuel;
    if (m === "combat") { annonce(texte, { refus: o.genre === "refus" }); return; }
    if (m === "placement") {
      const c = $("consigne-placement");
      if (!c.dataset.base) c.dataset.base = c.innerHTML;
      clearTimeout(c._t);
      c.innerHTML = `<b>${esc(texte)}</b>`; c.classList.toggle("refus", o.genre === "refus");
      c._t = setTimeout(() => { c.innerHTML = c.dataset.base; c.classList.remove("refus"); }, 2600);
      return;
    }
    const d = document.createElement("div");
    d.className = "toast" + (o.genre ? " " + o.genre : "");
    d.textContent = texte;
    const z = $("toasts");
    // pas plus de deux bulles ; un nouveau titre remplace l'ancien ; la même bulle n'est pas répétée
    if ([...z.children].some(c => c.textContent === texte)) return;
    if (o.genre === "titre") [...z.children].filter(c => c.classList.contains("titre")).forEach(c => c.remove());
    while (z.children.length > 1) z.firstChild.remove();
    z.appendChild(d);
    setTimeout(() => d.remove(), 2700);
  }

  // ---------- Ligne de message du combat ----------
  // message() : réponse immédiate à un geste du joueur. annonce() : reste au moins quelques secondes ;
  // messageFond() : message de routine (« Tour de… »), qui attend la fin d'une annonce au lieu de l'écraser.
  const msg = { jusqua: 0, attente: null, minuterie: null };
  function afficher(t, refus, forte) {
    const m = $("message");
    m.textContent = t || ""; m.className = "message" + (refus ? " refus" : "") + (forte ? " annonce" : "");
    if (forte) { m.style.animation = "none"; void m.offsetWidth; m.style.animation = ""; }
  }
  function message(t, refus) { clearTimeout(msg.minuterie); msg.jusqua = 0; msg.attente = null; afficher(t, refus, false); }
  function annonce(t, o = {}) {
    afficher(t, !!o.refus, true);
    msg.jusqua = Date.now() + (o.duree || 3200);
    clearTimeout(msg.minuterie);
    msg.minuterie = setTimeout(() => {
      msg.jusqua = 0;
      if (msg.attente) { const [a, b] = msg.attente; msg.attente = null; afficher(a, b, false); }
    }, o.duree || 3200);
  }
  function messageFond(t, refus) {
    if (Date.now() < msg.jusqua) { msg.attente = [t, refus]; return; }
    afficher(t, refus, false);
  }

  // ---------- Modes de l'écran ----------
  const BLOCS = ["creation", "bandeau-balade", "frise-barre", "bas-balade", "bas-placement", "bas-combat"];
  function mode(m) {
    const vis = {
      creation: ["creation"], vide: [], balade: ["bandeau-balade", "bas-balade"],
      placement: ["frise-barre", "bas-placement"], combat: ["frise-barre", "bas-combat"]
    }[m] || [];
    BLOCS.forEach(id => { $(id).hidden = vis.indexOf(id) < 0; });
    $("chargement").hidden = true;
    P.UI.mode.actuel = m;
    // la carte de quête du tutoriel se place sous les bandes du haut avant que le terrain soit recadré
    if (P.Tuto) P.Tuto.actualiser();
    if (P.Astrelier) P.Astrelier.actualiser();
    P.Jeu && P.Jeu.recadrer && P.Jeu.recadrer();
  }
  // La partie de l'écran que l'interface ne recouvre pas (pixels CSS). En paysage et sur ordinateur, les panneaux sont à droite.
  function rectUtile() {
    const W = window.innerWidth, H = window.innerHeight, lat = lateral();
    let haut = 0, bas = H, droite = W;
    ["bandeau-balade", "frise-barre"].forEach(id => {
      const e = $(id); if (e.hidden) return;
      const r = e.getBoundingClientRect();
      // en paysage sur téléphone, la frise est dans la colonne de droite : elle ne prend pas de hauteur au terrain
      if (lat && r.left > W * .45) droite = Math.min(droite, r.left - 3); else haut = Math.max(haut, r.bottom + 3);
    });
    // la carte de quête du tutoriel (ou celle du « Tour de l'Astrelier »), en haut à gauche du terrain
    ["tuto-carte", "tour-carte"].forEach(id => { const tc = $(id); if (tc && !tc.hidden) { const r = tc.getBoundingClientRect(); if (r.height) haut = Math.max(haut, r.bottom + 3); } });
    ["bas-balade", "bas-placement", "bas-combat"].forEach(id => {
      const e = $(id); if (e.hidden) return;
      const r = e.getBoundingClientRect(); if (!r.width) return;
      if (lat) droite = Math.min(droite, r.left - 3); else bas = Math.min(bas, r.top - 3);
    });
    return { x: 0, y: haut, w: Math.max(80, droite), h: Math.max(80, bas - haut) };
  }

  // ---------- Fenêtres ----------
  function fenetre(id, titre, corps, pied, o = {}) {
    const d = $(id), c = $(id + "-contenu");
    c.innerHTML = `<header>${o.image ? `<img src="${o.image}" alt="">` : ""}<h2 id="${id}-titre">${esc(titre)}</h2>${o.sansFermer ? "" : `<button type="button" class="fermer" data-fermer aria-label="Fermer">×</button>`}</header>
      <div class="corps">${corps}</div>${pied ? `<footer>${pied}</footer>` : ""}`;
    c.querySelectorAll("[data-fermer]").forEach(b => (b.onclick = () => fermer(id)));
    if (!d.open) { try { d.showModal(); } catch (e) { d.setAttribute("open", ""); } }
    d.onclose = () => { if (o.surFermer) o.surFermer(); };
    // une fenêtre « sans fermer » refuse Échap ; si le navigateur la ferme quand même (Échap deux fois), surFermer fait la suite
    d.oncancel = e => { if (o.sansFermer) e.preventDefault(); };
    const f = c.querySelector("[autofocus]") || c.querySelector("footer .or") || c.querySelector(".fermer");
    if (f) f.focus();
    return c;
  }
  function fermer(id) { const d = $(id); if (d.open) d.close(); }
  const ouvert = () => ["d-fiche", "d-addition", "d-grimoire", "d-reglages", "d-carac", "d-lexique", "d-carte"].some(id => $(id) && $(id).open);

  // ---------- Bandeau d'exploration ----------
  function bandeau(p) {
    const n = p.niveau, a = P.Profil.xpDuNiveau(n), b = P.Profil.xpDuNiveau(n + 1);
    $("xp-niveau").textContent = `${p.nom} · Niv. ${n}`;
    $("xp-ble").textContent = p.ble;
    $("xp-barre").style.width = n >= P.Profil.NIVEAU_MAX ? "100%" : Math.max(0, Math.min(100, 100 * (p.xp - a) / (b - a))) + "%";
    $("xp-bloc").title = `${p.xp} XP · niveau suivant à ${b} XP`;
    if (P.UI.majPastille) P.UI.majPastille();
  }

  // ---------- Fiches ----------
  function ligneCarac(dt, dd) { return `<dt>${esc(dt)}</dt><dd>${dd}</dd>`; }
  function ficheCombattant(c, o = {}) {
    const cons = Object.keys(c.conservation || {}).filter(k => c.conservation[k]).map(k => `${nomElement(k)} ${c.conservation[k] > 0 ? "+" : ""}${c.conservation[k]} %`);
    const maxUtile = c.victuaillesMax - (c.entame || 0);
    let corps = "";
    if (o.texte) corps += `<p class="ambiance">${esc(o.texte)}</p>`;
    corps += `<dl class="carac">` +
      ligneCarac("Victuailles", `${c.victuailles} / ${maxUtile}` + (c.entame ? ` <span class="texte-doux">(${c.entame} entamées)</span>` : "")) +
      ligneCarac("Coups de main", `${c.cmBase} CM`) + ligneCarac("Pas", c.pasBase) +
      ligneCarac("Ouverture", c.carac.ouverture) + ligneCarac("Rideau", c.carac.rideau) + ligneCarac("Faux-fuyant", c.carac.fauxFuyant) +
      (c.comportement && c.genre !== "artisan" ? ligneCarac("Manière", c.comportement === "tire" ? "tire de loin" : "vient frapper au contact") : "") +
      (c.genre === "artisan" && c.absences ? ligneCarac("Absences", `${c.absences} d'affilée`) : "") +
      `</dl>`;
    if (cons.length) corps += `<p><b>Conservation :</b> ${esc(cons.join(", "))}<br><span class="texte-doux">Un chiffre négatif est une faiblesse.</span></p>`;
    if ((c.etats || []).length) corps += `<div class="etats-liste">${c.etats.map(e => `<span title="${esc(ETATS_SENS[e.etat] || "")}">${ic(e.etat)}${esc(ETATS[e.etat] || e.etat)}${e.couches > 1 ? " ×" + e.couches : ""}${e.tours ? " · " + pluriel(e.tours, "tour") : ""}</span>`).join("")}</div>`;
    if ((c.boucliers || []).length) corps += `<p><b>Bouclier :</b> ${c.boucliers.reduce((t, b) => t + (b.restant || 0), 0)}</p>`;
    if ((c.sorts || []).length) corps += `<p><b>Sorts :</b> ${esc(c.sorts.map(s => s.nom).join(", "))}</p>`;
    fenetre("d-fiche", `${c.nom}${c.niveau ? " · niveau " + c.niveau : ""}`, corps, "", { image: o.portrait });
    return $("d-fiche");
  }
  function ficheSort(s, b) {
    const n = ORVANE.Regles ? ORVANE.Regles.normaliserSort(s) : s;
    const r = (b && b.rayon) || n.rayon || { min: 0, max: 0 };
    const zone = n.zone && n.zone.forme !== "case" ? `${ZONES[n.zone.forme] || n.zone.forme}${n.zone.forme !== "terrain" ? " de " + n.zone.taille : ""}` : "";
    const lim = [];
    if (n.parTour) lim.push(`${n.parTour} par tour`); if (n.parCible) lim.push(`${n.parCible} par cible`);
    if (n.relance) lim.push(`revient après ${pluriel(n.relance, "tour")}`); if (n.relanceInitiale) lim.push(`pas avant le tour ${n.relanceInitiale + 1}`);
    let corps = `<p style="display:flex;gap:8px;align-items:center">${P.iconeSort(n, 26)}<b>${esc(nomElement(n.element))}</b>${n.emplacement === 0 ? ` <span class="texte-doux">· ${esc(n.outil || "outil")}</span>` : ""}</p>`;
    if (n.texte) corps += `<p class="ambiance">${esc(n.texte)}</p>`;
    corps += `<dl class="carac">` + ligneCarac("Coût", `${n.cm} CM`) +
      ligneCarac("Rayon", (r.min === r.max ? r.max : `${r.min} à ${r.max}`) + (r.modifiable ? " (modifiable)" : "")) +
      (LANCERS[n.lancer] ? ligneCarac("Lancer", LANCERS[n.lancer]) : "") + ligneCarac("Vue", n.vue ? "il faut voir la cible" : "pas besoin de voir") +
      (zone ? ligneCarac("Zone", zone) : "") + (lim.length ? ligneCarac("Limites", lim.join(", ")) : "") +
      ((b ? b.chanceMaitre : n.maitre) ? ligneCarac("Coup de maître", (b ? b.chanceMaitre : n.maitre) + " %") : "") +
      (b && b.rang > 1 ? ligneCarac("Rang", b.rang) : "") + `</dl>`;
    corps += `<ul class="liste">${(n.effets || []).map(e => `<li>${esc(decrire(e))}</li>`).join("")}</ul>`;
    if (n.change) corps += `<p class="texte-doux"><b>Déclinaison :</b> ${esc(n.change)}</p>`;
    if (b && !b.disponible && b.raison) corps += `<p class="texte-doux"><b>Pour l'instant :</b> ${esc(b.raison)}</p>`;
    // « Bon à savoir » : chaque mot spécial du sort (fournée, nappe, piège, graine, Ustensile, Commis, état…), avec un lien vers le Lexique
    if (P.UI.bonASavoir) corps += P.UI.bonASavoir(n);
    const c = fenetre("d-fiche", n.nom, corps);
    if (P.UI.brancherBonASavoir) P.UI.brancherBonASavoir(c);
  }
  function ficheGroupe(g, prev, o) {
    const M = ORVANE.Monstres, arr = o.arrivage || 0;
    const corps = (o.note ? `<p class="ambiance">${esc(o.note)}</p>` : "") + `<ul class="membres">${prev.membres.map(m => {
      const f = (P.Tuto && P.Tuto.fiche(m.id)) || M.fiche(m.id);
      return `<li><img src="${P.portraits[m.id] || ""}" alt=""><div><b>${esc(m.nom)}${m.chef ? ' <span class="chef">chef</span>' : ""}</b><span>Niveau ${m.niveau} · ${f.victuailles} Victuailles · ${f.comportement === "tire" ? "tire de loin" : "vient frapper au contact"}</span></div></li>`;
    }).join("")}</ul>
      <div class="gains"><div><b>${prev.xp}</b><span>XP prévue (avant les bonus)</span></div><div><b>${prev.ble}</b><span>Blé prévu</span></div></div>
      ${o.sansArrivage ? "" : `<p class="arrivage"><b>Arrivage : +${arr} % d'XP</b><br><span class="texte-doux">Un groupe qu'on laisse en paix gagne de la fraîcheur : +10 % par minute, jusqu'à +100 %.</span></p>`}
      <p class="texte-doux">${o.sansArrivage ? `Le combat se joue ici, ${esc(o.lieu || "sur le Fourneau")}. Avant de commencer, tu choisis ta case.` : `Le combat se joue ici, ${esc(o.lieu || "sur le Fourneau")}. Avant de commencer, tu choisis ta case, et si tu veux un défi pour un bonus : la Commande.`}</p>`;
    const c = fenetre("d-fiche", g.nom, corps, `<button type="button" class="bouton" data-fermer>Plus tard</button><button type="button" class="bouton or" id="engager">Engager</button>`, { surFermer: o.onFermer });
    c.querySelector("#engager").onclick = () => { fermer("d-fiche"); o.onEngager(); };
  }

  // ---------- Frise des tours ----------
  const friseEtat = { repliee: false };
  function frise(vue, actifId, onToucher) {
    const ol = $("frise");
    const base = (vue.frise && vue.frise.length) ? vue.frise : vue.combattants.filter(c => c.genre !== "ustensile" && (c.case || c.id === "moi")).map(c => c.id);
    const ids = base.filter(id => vue.combattants.some(c => c.id === id));
    // « À la chaîne » : le numéro de chaque ennemi dans l'ordre demandé
    const chaine = vue.commande && vue.commande.choisie === "a-la-chaine" && vue.commande.respectee !== false ? (vue.commande.ordre || []) : [];
    ol.classList.toggle("repliee", friseEtat.repliee);
    const k = chaine.join(",") + "#" + ids.map(id => { const c = vue.combattants.find(x => x.id === id); return [id, c.vivant, c.victuailles, c.victuaillesMax - (c.entame || 0), id === actifId].join(":"); }).join("|");
    if (k === ol.dataset.k) return;
    ol.dataset.k = k;
    ol.innerHTML = "";
    ids.forEach(id => {
      const c = vue.combattants.find(x => x.id === id);
      const max = Math.max(1, c.victuaillesMax - (c.entame || 0)), f = Math.max(0, Math.min(1, c.victuailles / max));
      const ennemi = c.camp !== "artisans", C = 2 * Math.PI * 19;
      const li = document.createElement("li");
      if (id === actifId) li.className = "actif-li";
      li.innerHTML = `<button type="button" class="portrait${ennemi ? " ennemi" : ""}${id === actifId ? " actif" : ""}${c.vivant ? "" : " tombe"}" aria-label="${esc(c.nom)}, ${c.victuailles} sur ${max} Victuailles${id === actifId ? ", joue maintenant" : ""}${c.vivant ? "" : ", a rendu son tablier"}">
        <svg class="anneau" viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="19" fill="${ennemi ? "#3A2A1E" : "#14302D"}" stroke="${ennemi ? "#C0703A" : "#C5A572"}" stroke-width="1.5"/><circle cx="22" cy="22" r="19" fill="none" stroke="#0D2D2A" stroke-width="4"/>
        <circle cx="22" cy="22" r="19" fill="none" stroke="${ennemi ? "#E07A52" : "#D86A50"}" stroke-width="4" stroke-linecap="round" stroke-dasharray="${(f * C).toFixed(1)} ${C.toFixed(1)}"/></svg>
        <img src="${P.portraitDe(c)}" alt="">${chaine.indexOf(id) >= 0 && c.vivant ? `<span class="rang-chaine" aria-label="à faire tomber en ${chaine.indexOf(id) + 1}">${chaine.indexOf(id) + 1}</span>` : ""}</button>`;
      li.firstElementChild.onclick = () => onToucher(id);
      ol.appendChild(li);
      if (id === actifId) setTimeout(() => li.scrollIntoView && li.scrollIntoView({ block: "nearest", inline: "center" }), 0);
    });
    // la frise défile : un fondu au bord droit le montre
    const deb = () => ol.classList.toggle("deborde", ol.scrollWidth > ol.clientWidth + 2 && ol.scrollLeft < ol.scrollWidth - ol.clientWidth - 4);
    if (!ol.dataset.ecoute) { ol.dataset.ecoute = "1"; ol.addEventListener("scroll", deb, { passive: true }); }
    setTimeout(deb, 30);
  }
  function replierFrise(on) {
    friseEtat.repliee = on == null ? !friseEtat.repliee : !!on;
    $("frise").classList.toggle("repliee", friseEtat.repliee);
    const b = $("manche");
    b.setAttribute("aria-expanded", String(!friseEtat.repliee));
    b.setAttribute("aria-label", (b.dataset.nom || "Manche") + (friseEtat.repliee ? " : déplier la frise" : " : replier la frise"));
  }
  const RATEES = {
    "sans-contact": p => `${p || "un artisan"} a fini son tour au contact d'un ennemi`,
    "fait-minute": () => "la 5e manche est passée",
    "a-la-chaine": () => "un ennemi est tombé avant son tour",
    "fait-main": () => "un ennemi est tombé sans Coup d'outil",
    "sans-sel": p => "un soin a eu lieu" + (p ? ` (${p})` : ""),
    "plan-de-travail": p => `${p || "un artisan"} a fait plus d'1 Pas dans un tour`,
    "une-seule-cuisson": p => `${p || "un artisan"} a lancé deux fois le même sort dans un tour`,
    "service-en-salle": p => `${p || "un artisan"} a commencé deux tours de suite sur la même case`
  };
  // Ce qui s'est passé (la raison du moteur répète la règle)
  // le moteur dit ce qui s'est passé (« Fait main : Grumeau est tombé sans Coup d'outil ») ; on garde la partie après le nom
  function commandeRatee(id, nomPar, raisonMoteur) {
    const i = raisonMoteur ? raisonMoteur.indexOf(" : ") : -1;
    if (i > 0) return raisonMoteur.slice(i + 3);
    const f = RATEES[id]; return f ? f(nomPar) : (raisonMoteur || "");
  }
  function infosCombat(etat, o = {}) {
    const b = $("manche");
    if (etat.phase === "miseEnPlace") { b.classList.add("mep"); b.innerHTML = "<small>Mise en</small><b>place</b>"; b.dataset.nom = "Mise en place"; }
    else { b.classList.remove("mep"); b.innerHTML = `<small>Manche</small><b>${etat.manche}</b>`; b.dataset.nom = "Manche " + etat.manche; }
    b.setAttribute("aria-label", b.dataset.nom + (friseEtat.repliee ? " : déplier la frise" : " : replier la frise"));
    const cmd = etat.commande, bc = $("commande-b"), puce = $("commande-puce");
    if (cmd && cmd.choisie) {
      const d = ORVANE.Regles.COMMANDES[cmd.choisie] || {};
      bc.hidden = false;
      puce.className = "puce commande-puce" + (cmd.respectee === false ? " ratee" : "");
      const ordre = (cmd.ordre || []).map(id => { const c = etat.combattants.find(x => x.id === id); return c ? c.nom : id; });
      puce.innerHTML = `<b>${esc(d.nom || cmd.choisie)}</b>`;
      let t = `Commande « ${d.nom || cmd.choisie} » : ${d.regle || ""}`;
      if (ordre.length && cmd.choisie === "a-la-chaine") t += " Ordre : " + ordre.join(" → ") + ".";
      if (cmd.respectee === false) t += " Ratée : " + (o.ratee || cmd.raison || "") + ".";
      bc.title = t; bc.dataset.texte = t;
      bc.setAttribute("aria-label", t);
    } else bc.hidden = true;
    if (o.absences === undefined) return;   // sans compte donné, la pastille reste comme elle est
    const ab = $("absences"), n = o.absences || 0;
    ab.hidden = !n;
    if (n) { ab.textContent = `Absent ${n}/3`; ab.title = `${pluriel(n, "tour")} passé${n > 1 ? "s" : ""} sans rien faire ; au 3e d'affilée, tu quittes le service.`; }
  }

  // ---------- Jauges du joueur ----------
  function jauges(c) {
    const max = Math.max(1, c.victuaillesMax), utile = Math.max(0, max - (c.entame || 0));
    const pv = $("pv");
    pv.querySelector(".plein").style.width = (100 * Math.max(0, c.victuailles) / max) + "%";
    pv.querySelector(".entame").style.width = (100 * (max - utile) / max) + "%";
    $("pv-texte").textContent = `${c.victuailles} / ${utile}`;
    pv.title = `${c.victuailles} Victuailles sur ${utile}`;
    // pendant le tour d'un autre, seules les Victuailles changent (cm et pas absents)
    if (c.cm != null) $("cm").textContent = c.cm;
    if (c.pas != null) $("pas").textContent = c.pas;
  }

  // ---------- Barre d'action : le Pain de route, puis les sorts sur une seule rangée qui défile ----------
  function appuiLong(bouton, surLong) {
    let t = null, long = false;
    bouton.addEventListener("pointerdown", e => { long = false; clearTimeout(t); t = setTimeout(() => { long = true; surLong(); }, 520); });
    ["pointerup", "pointerleave", "pointercancel"].forEach(n => bouton.addEventListener(n, () => clearTimeout(t)));
    bouton.addEventListener("contextmenu", e => { e.preventDefault(); clearTimeout(t); long = true; surLong(); });
    bouton.addEventListener("keydown", e => { if (e.key === "i" || e.key === "I") { e.preventDefault(); surLong(); } });
    return () => { const l = long; long = false; return l; };
  }
  function majDebord() {
    const g = $("grille-sorts");
    const plus = g.scrollWidth > g.clientWidth + 2 && !lateral();
    g.classList.toggle("deborde-g", plus && g.scrollLeft > 4);
    g.classList.toggle("deborde-d", plus && g.scrollLeft < g.scrollWidth - g.clientWidth - 4);
  }
  let brancheDebord = false;
  // Pourquoi un sort ne se lance pas, d'après la raison donnée par le moteur (R.barre) : on n'en recalcule aucune.
  // Renvoie le repère à poser sur le bouton : coût en rouge, « 2 t. » (relance), « 0/2 » (nombre par tour), « plein ».
  function repereSort(s, fiche, o) {
    const r = s.raison || "", rep = { cmManque: false, coin: "" };
    if (o.actif && /^Pas assez de coups de main/.test(r)) rep.cmManque = true;
    const pt = (fiche && fiche.parTour) || 0;
    // dans l'ordre : relance, puis « plein » (ce que le sort pose est au maximum), puis le nombre de lancers de ce tour
    if (s.relance > 0) rep.coin = `<span class="relance" aria-hidden="true">${s.relance} t.</span>`;
    else if (o.actif && /plafond atteint|pièges posés|place pour un Commis/.test(r)) rep.coin = `<span class="limite zero" aria-hidden="true">plein</span>`;
    else if (o.actif && pt > 0 && (s.lancesCeTour > 0 || /^Plus de service/.test(r))) {
      const reste = Math.max(0, pt - (s.lancesCeTour || 0));
      rep.coin = `<span class="limite${reste ? "" : " zero"}" aria-hidden="true">${reste}/${pt}</span>`;
    }
    return rep;
  }
  function barre(o) {
    // o : { sorts (R.barre), fiches (sorts complets, pour l'icône et les limites), choisi, actif, occupe, pain: { reste, valeur, cm, choisi, disponible, raison }, onSort, onLong, onPain }
    const g = $("grille-sorts"), x0 = g.scrollLeft;
    const focusId = document.activeElement && document.activeElement.dataset && document.activeElement.dataset.id;
    const fiches = {}; (o.fiches || []).forEach(s => (fiches[s.id] = s));
    // les éléments où le joueur a mis des points : un coin doré, discret, sur leurs sorts
    const miens = (P.Profil.elementsChoisis && P.Profil.elementsChoisis()) || [];
    g.innerHTML = "";
    o.sorts.forEach((s, i) => {
      const b = document.createElement("button");
      const pret = s.disponible && o.actif;
      const tien = miens.indexOf(s.element) >= 0;
      b.type = "button"; b.className = "sort" + (pret ? "" : " grise") + (tien ? " tien" : ""); b.dataset.id = s.id;
      b.setAttribute("aria-pressed", o.choisi === s.id);
      if (!pret) b.setAttribute("aria-disabled", "true");
      const raison = o.occupe ? "Un instant : l'action se termine" : !o.actif ? (o.fin ? "Le combat est terminé" : "Ce n'est pas ton tour") : s.raison;
      const rep = repereSort(s, fiches[s.id], o);
      b.setAttribute("aria-label", `${s.nom}, ${s.cm} CM, ${nomElement(s.element)}` + (tien ? " (ton élément)" : "") + (raison && !pret ? ". Indisponible : " + raison : ""));
      b.title = `${s.nom} · ${s.cm} CM · ${nomElement(s.element)}${tien ? " (ton élément)" : ""} · Rayon ${s.rayon.min === s.rayon.max ? s.rayon.max : s.rayon.min + " à " + s.rayon.max}` + (raison && !pret ? " · " + raison : "") + " (appui long : fiche)";
      b.innerHTML = `<span class="ic">${P.iconeSort(fiches[s.id] || s, 22)}</span><span class="nom">${esc(s.nom)}</span><em class="cout${rep.cmManque ? " manque" : ""}">${s.cm}</em>${rep.coin}`;
      const estLong = appuiLong(b, () => o.onLong(s));
      b.onclick = () => { if (estLong()) return; o.onSort(s); };
      if (i < 9) b.setAttribute("aria-keyshortcuts", String(i + 1));
      g.appendChild(b);
    });
    g.scrollLeft = x0;
    // le sort choisi reste visible dans la bande
    const ch = o.choisi && g.querySelector(`[data-id="${CSS.escape(o.choisi)}"]`);
    if (ch && !lateral()) { const r = ch.getBoundingClientRect(), rg = g.getBoundingClientRect(); if (r.left < rg.left || r.right > rg.right) ch.scrollIntoView({ block: "nearest", inline: "nearest" }); }
    if (!brancheDebord) { brancheDebord = true; g.addEventListener("scroll", majDebord, { passive: true }); window.addEventListener("resize", majDebord); }
    majDebord();
    // le Pain de route (le Sac du combat) : même logique, d'après R.apercuPain
    const p = o.pain, bp = $("b-pain"), pretP = p.disponible && o.actif, rp = p.raison || "";
    bp.className = "sort pain" + (pretP ? "" : " grise");
    bp.setAttribute("aria-pressed", String(!!p.choisi));
    if (!pretP) bp.setAttribute("aria-disabled", "true"); else bp.removeAttribute("aria-disabled");
    bp.setAttribute("aria-label", `Pain de route, ${p.cm} CM, soigne ${p.valeur}, il en reste ${p.reste}` + (rp && !pretP ? ". Indisponible : " + rp : ""));
    bp.title = `Pain de route · ${p.cm} CM · +${p.valeur} Victuailles · ${p.reste} dans le Sac (une fois par tour)` + (rp ? " · " + rp : "");
    // en bas du bouton : « Déjà mangé » (une fois par tour) ou « Vie pleine » (Victuailles déjà pleines), sinon « Pain »
    const etatPain = o.actif && /^Déjà mangé/.test(rp) ? "Déjà mangé" : o.actif && /pleines/.test(rp) ? "Vie pleine" : "";
    const cmManque = o.actif && /^Pas assez de coups de main/.test(rp);
    bp.innerHTML = `<span class="ic">${ic("pain", null, 22)}</span><span class="nom${etatPain ? " etat-pain" : ""}">${etatPain || "Pain"}</span><em class="cout${cmManque ? " manque" : ""}">${p.cm}</em><span class="reste${p.reste ? "" : " zero"}" aria-hidden="true">×${p.reste}</span>`;
    bp.onclick = () => o.onPain();
    if (focusId) { const f = focusId === "pain" ? bp : g.querySelector(`[data-id="${CSS.escape(focusId)}"]`); if (f) f.focus({ preventScroll: true }); }
    // « Fin du tour » reste active pendant sa propre animation : la demande attend la fin de l'action
    $("fin-tour").disabled = !(o.actif || o.occupe);
  }
  // « Accélérer » : visible pendant les tours des autres (monstres, Commis) ; le choix est retenu dans les réglages
  function accelere(visible) {
    const b = $("b-accelere"), on = !!P.Profil.reglages.accelere;
    b.hidden = !visible;
    b.setAttribute("aria-pressed", String(on));
    b.setAttribute("aria-label", on ? "Tours des monstres accélérés (×2). Toucher pour revenir à la vitesse normale" : "Accélérer les tours des monstres (×2)");
  }
  // Le bouton de validation (« Marcher », « Lancer », « Manger ») : le second toucher, en bouton
  function lancer(o) {
    const b = $("b-lancer");
    if (!o) { if (!b.hidden) { b.hidden = true; } return; }
    b.textContent = o.texte || "Lancer";
    b.setAttribute("aria-label", o.aide || o.texte || "Lancer");
    b.onclick = o.onClick;
    b.hidden = false;
  }

  // ---------- Minuteur : barre fine et secondes sur « Fin du tour » (sans redessiner le terrain) ----------
  const minu = { t: [], fin: 0, total: 45, intervalle: null };
  const minuteur = {
    // sec : secondes restantes ; total : durée d'un tour (pour la longueur de la barre)
    demarrer(sec, onFin, total, onPresse) {
      this.arreter();
      let averti = sec <= 10;
      const m = $("minuteur"), i = m.querySelector("i"), tot = total || sec;
      minu.total = tot;
      m.hidden = false; m.classList.toggle("presse", sec <= 10);
      i.style.transition = "none"; i.style.transform = `scaleX(${Math.max(0, Math.min(1, sec / tot))})`;
      void i.offsetWidth;
      i.style.transition = `transform ${sec}s linear`; i.style.transform = "scaleX(0)";
      minu.fin = Date.now() + sec * 1000;
      m.setAttribute("aria-valuemax", tot);
      const maj = () => {
        const r = Math.max(0, Math.ceil((minu.fin - Date.now()) / 1000));
        $("secondes").textContent = r + " s";
        $("fin-tour").classList.toggle("presse", r <= 10);
        m.classList.toggle("presse", r <= 10);
        m.setAttribute("aria-valuenow", r);
        m.setAttribute("aria-valuetext", r + " secondes");
        // une seule alerte, quand il reste 10 s (le tour passera tout seul à 0)
        if (!averti && r <= 10 && r > 0) { averti = true; if (onPresse) onPresse(r); }
      };
      maj(); minu.intervalle = setInterval(maj, 250);
      minu.t.push(setTimeout(() => { this.arreter(true); onFin(); }, sec * 1000));
    },
    // renvoie le temps qui restait (ms)
    arreter(garder) {
      minu.t.forEach(clearTimeout); minu.t = [];
      clearInterval(minu.intervalle); minu.intervalle = null;
      const m = $("minuteur"), i = m.querySelector("i");
      const reste = Math.max(0, minu.fin - Date.now());
      minu.fin = 0;
      if (!garder) { m.hidden = true; $("secondes").textContent = ""; $("fin-tour").classList.remove("presse"); }
      i.style.transition = "none";
      if (!garder) i.style.transform = "scaleX(1)";
      return reste;
    },
    reste() { return Math.max(0, minu.fin - Date.now()); }
  };

  // ---------- Mise en place : un résumé de la Commande, qu'on déplie pour la changer ----------
  const placeEtat = { ouvert: null };
  function placement(etat, o) {
    const R = ORVANE.Regles, cmd = etat.commande, z = $("commandes");
    z.innerHTML = "";
    $("choix-commande").hidden = !cmd;
    if (placeEtat.ouvert === null) placeEtat.ouvert = lateral() && window.innerHeight >= 640;
    const resume = () => {
      const c = etat.commande, d = c && c.choisie ? R.COMMANDES[c.choisie] : null, b = d ? c.bonus[c.choisie] : 0;
      const bonus = (o.bonus === "ristourne" || (c && c.choix && c.choix.moi === "ristourne")) ? "Ristourne" : "Savoir-faire";
      $("resume-commande").innerHTML = d ? `${esc(d.nom)} <em>+${b} % ${bonus}</em>` : "Aucune Commande";
      // la règle en une ligne : on sait ce qu'on doit tenir sans ouvrir le choix
      $("resume-regle").textContent = d ? `Défi : ${d.regle}` : "Commande (un défi pour un bonus)";
    };
    if (cmd) {
      const opts = cmd.proposees.map(id => ({ id, d: R.COMMANDES[id], bonus: cmd.bonus[id] })).concat([{ id: "", d: { nom: "Aucune", regle: "Pas de Commande, pas de bonus." }, bonus: null }]);
      opts.forEach(c => {
        const l = document.createElement("label"); l.className = "carte-choix";
        l.innerHTML = `<input type="radio" name="commande" value="${esc(c.id)}"${(cmd.choisie || "") === c.id ? " checked" : ""}><b>${esc(c.d.nom)}</b>${c.bonus ? `<em>+${c.bonus} %</em>` : "<em></em>"}<small>${esc(c.d.regle)}</small>`;
        l.querySelector("input").onchange = () => { o.onCommande(c.id || null); resume(); };
        z.appendChild(l);
      });
    }
    const bz = $("bonus"); bz.innerHTML = "";
    [["savoirFaire", "Savoir-faire", "plus d'XP"], ["ristourne", "Ristourne", "plus d'objets"]].forEach(([id, nom, sens]) => {
      const l = document.createElement("label"); l.className = "carte-choix";
      l.innerHTML = `<input type="radio" name="bonus" value="${id}"${o.bonus === id ? " checked" : ""}><b>${nom}</b><em></em><small>${sens}</small>`;
      l.querySelector("input").onchange = () => { o.bonus = id; o.onBonus(id); resume(); };
      bz.appendChild(l);
    });
    const bc = $("b-commande");
    const montrer = () => {
      $("choix-place").hidden = !placeEtat.ouvert;
      bc.setAttribute("aria-expanded", String(placeEtat.ouvert));
      $("chevron-commande").textContent = placeEtat.ouvert ? "Fermer ▴" : "Changer ▾";
      P.Jeu && P.Jeu.recadrer && P.Jeu.recadrer();
    };
    bc.onclick = () => { placeEtat.ouvert = !placeEtat.ouvert; montrer(); };
    resume(); montrer();
    $("envoyer").onclick = o.onEnvoyer;
    // la consigne (et l'explication donnée une fois : Commande…)
    if (o.consigne) { const cp = $("consigne-placement"); clearTimeout(cp._t); cp.classList.remove("refus"); cp.innerHTML = o.consigne; cp.dataset.base = o.consigne; }
  }

  // ---------- L'Addition ----------
  function addition(res, gain, o) {
    const a = res.addition || {}, id = "moi", R = ORVANE.Regles;
    const objets = (a.objets && a.objets[id]) || [];
    const cmd = a.commande;
    let corps = `<p class="resultat${a.victoire ? "" : " perdu"}">${a.victoire ? "Victoire !" : "Défaite"}</p>`;
    const ileC = (P.Jeu && P.Jeu.ile) ? P.Jeu.ile() : { nom: "Le Fourneau", a: "au Fourneau" };
    corps += `<p class="texte-doux">${a.victoire ? `${esc(ileC.nom)} est à toi, en ${pluriel(res.manche, "manche")}.` : o.abandon ? "Tu as abandonné : pas de butin. Retour au point de départ, Victuailles rendues." : "Tu rends ton tablier. Retour au point de départ, Victuailles rendues."}</p>`;
    corps += `<div class="gains"><div><b>+${(a.xp && a.xp[id]) || 0}</b><span>XP</span></div><div><b>+${(a.ble && a.ble[id]) || 0}</b><span>Blé</span></div></div>`;
    if (a.victoire && o.arrivage) corps += `<p class="texte-doux">Arrivage : +${o.arrivage} % d'XP compris.</p>`;
    // la prime de la quête du tutoriel (combat d'entraînement gagné) : de quoi passer au niveau suivant
    if (o.prime) corps += `<p class="tuto-prime">Prime de la quête « ${esc((P.Tuto && P.Tuto.QUETE) || "")} » : <b>+${o.prime} XP</b></p>`;
    const nomDe = id => ((ORVANE.Monstres.FICHES[id] || (P.Tuto && P.Tuto.fiche(id)) || {}).nom) || id;
    corps += objets.length ? `<div><p><b>Objets</b></p><ul class="liste">${objets.map(x => `<li>${esc(x.nom)} <span class="texte-doux">· sur ${esc(nomDe(x.de))}</span></li>`).join("")}</ul></div>` : `<p class="texte-doux">Aucun objet cette fois.</p>`;
    if (cmd) {
      const d = R.COMMANDES[cmd.id] || {};
      const choix = (res.commande && res.commande.choix && res.commande.choix[id]) || o.bonus;
      // sur une défaite, une Commande tenue jusque-là est « sans objet » (le moteur donne respectee: null)
      if (!a.victoire && cmd.respectee !== false) corps += `<div class="commande-bilan neutre"><b>Commande « ${esc(d.nom || cmd.id)} » : sans objet</b><br>Pas de bonus sur une défaite.</div>`;
      else corps += `<div class="commande-bilan${cmd.respectee ? "" : " ratee"}"><b>Commande « ${esc(d.nom || cmd.id)} » : ${cmd.respectee ? "réussie" : "ratée"}</b><br>` +
        (cmd.respectee ? `Bonus de ${cmd.bonus} % en ${choix === "ristourne" ? "Ristourne" : "Savoir-faire"}.` : esc(o.ratee || cmd.raison || "")) + `</div>`;
    } else corps += `<p class="texte-doux">Pas de Commande pour ce combat.</p>`;
    if (gain && gain.apres > gain.avant) {
      corps += `<div class="niveau-gagne"><b>Niveau ${gain.apres} !</b>` + (gain.debloques.length ? ` Nouveau dans le Grimoire : ${esc(gain.debloques.map(s => s.nom).join(", "))}.` : "") +
        (gain.points ? `<br><b>+${gain.points} points de caractéristique à placer</b> : plus de dégâts dans un élément de tes sorts, ou plus de vie. Touche « Placer mes points », ou plus tard « Caractéristiques ».` : "") + `</div>`;
    }
    // une ancienne sauvegarde passée à « Répartir pour moi » : on le dit une fois (ici ou dans le panneau)
    const annonceCarac = P.Profil.annonceCarac && P.Profil.annonceCarac();
    if (annonceCarac) corps += `<p class="carac-auto">${esc(annonceCarac)}</p>`;
    // l'Addition ne se ferme que par son bouton ; si le navigateur la ferme quand même (Échap deux fois, retour Android), on rentre au Fourneau
    let parti = false;
    const retour = () => { if (parti) return; parti = true; fermer("d-addition"); o.onRetour(); };
    // des points à placer : on peut y aller tout de suite (retour au Fourneau, puis le panneau s'ouvre). Après un niveau gagné,
    // c'est le bouton principal (doré) ; sinon un simple rappel. Un petit reste qui ne paie plus un point dans tes éléments n'est pas réclamé.
    const repartir = P.Profil.pointsEnAttente() > 0, niveau = !!(gain && gain.points > 0 && repartir);
    const c = fenetre("d-addition", "L'Addition", corps, (repartir ? `<button type="button" class="bouton${niveau ? " or" : ""}" id="addition-carac">Placer mes points</button>` : "") + `<button type="button" class="bouton${niveau ? "" : " or"}" id="retour-balade">Retour ${esc(ileC.a)}</button>`, { sansFermer: true, surFermer: retour });
    c.querySelector("#retour-balade").onclick = retour;
    if (repartir) c.querySelector("#addition-carac").onclick = () => {
      retour();
      let essais = 0;
      const ouvrir = () => { if (P.Jeu.nomScene() === "balade" && !ouvert()) P.UI.caracteristiques({ enCombat: false }); else if (++essais < 10) setTimeout(ouvrir, 200); };
      setTimeout(ouvrir, 300);
    };
  }

  // ---------- Grimoire (hors combat) ----------
  function grimoire(o = {}) {
    const p = P.Profil.profil, G = P.Profil.grimoire(p.classe), enCombat = !!o.enCombat;
    const miens = P.Profil.elementsChoisis ? P.Profil.elementsChoisis() : [];
    const ligne = (s, emp, quoi, choisi, ferme) => {
      const n = ORVANE.Regles.normaliserSort(s), e = (n.effets || [])[0], tien = miens.indexOf(n.element) >= 0;
      return `<label class="option-sort${ferme ? " ferme" : ""}${tien ? " tien" : ""}" data-sort="${esc(n.id)}"${tien ? ` title="${esc(nomElement(n.element))} : un de tes éléments"` : ""}><input type="radio" name="emp-${emp}" value="${quoi}"${choisi ? " checked" : ""}${ferme || enCombat ? " disabled" : ""}>
        <b>${P.iconeSort(n, 18)}<span>${esc(n.nom)}</span></b>
        <small>${ferme ? `S'ouvre au niveau ${n.niveau}` : `${n.cm} CM · ${esc(e ? decrire(e, true) : "")}`}${tien ? ` <span class="tien-txt">· ton élément</span>` : ""}</small></label>`;
    };
    let corps = P.Profil.sourceGrimoire() === "essai" ? `<p class="texte-doux">Sorts d'essai du moteur : le vrai grimoire (16 emplacements par classe) prendra leur place dès qu'il sera livré.</p>` : "";
    if (enCombat) corps += `<p class="texte-doux"><b>Le grimoire se change hors combat.</b></p>`;
    corps += `<ul class="grimoire">` + G.map(e => {
      const b = e.base, d = e.declinaison, ouvert = (b.niveau || 1) <= p.niveau, eq = P.Profil.sortEquipe(e);
      if (!ouvert) return `<li class="verrou"><div class="titre-emp"><span>Emplacement ${e.emplacement}</span><span>S'ouvre au niveau ${b.niveau}</span></div><div class="options">${ligne(b, e.emplacement, "base", false, true)}${d ? ligne(d, e.emplacement, "declinaison", false, true) : ""}</div></li>`;
      return `<li><div class="titre-emp"><span>Emplacement ${e.emplacement}</span><span>${d ? "sort de base ou déclinaison" : "pas de déclinaison"}</span></div><div class="options">${ligne(b, e.emplacement, "base", eq === b, false)}${d ? ligne(d, e.emplacement, "declinaison", eq === d, (d.niveau || 1) > p.niveau) : ""}</div></li>`;
    }).join("") + `</ul>`;
    corps += `<p class="texte-doux">Le Coup d'outil (${esc(P.Profil.classe(p.classe).outil)}) est toujours dans ta barre. Appui long sur un sort (ou touche I) : sa fiche, avec « Bon à savoir ».` +
      (miens.length ? ` Un coin doré marque les sorts de tes éléments (${esc(miens.map(nomElement).join(", "))}).` : "") + `</p>`;
    const c = fenetre("d-grimoire", `Grimoire · niveau ${p.niveau}`, corps, `<button type="button" class="bouton or" data-fermer>Fermer</button>`);
    // appui long (ou clic droit, ou I au clavier) sur un sort : sa fiche, par-dessus le Grimoire
    c.querySelectorAll("label.option-sort[data-sort]").forEach(l => {
      const s = P.Profil.trouverSort(l.dataset.sort); if (!s) return;
      const estLong = appuiLong(l, () => ficheSort(s));
      l.addEventListener("click", e => { if (estLong()) e.preventDefault(); });
    });
    c.querySelectorAll("input[type=radio]").forEach(i => (i.onchange = () => {
      const emp = +i.name.slice(4);
      P.Profil.choisir(emp, i.value);
      const s = P.Profil.sortEquipe(G.find(e => e.emplacement === emp));
      toast(`${s.nom} équipé`);
      if (o.surChange) o.surChange();
    }));
  }

  // ---------- Réglages ----------
  function reglages(o = {}) {
    const r = P.Profil.reglages;
    const reduitSysteme = (() => { try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } })();
    const action = o.miseEnPlace ? `<button type="button" class="bouton" id="r-renoncer">Renoncer (retour ${esc(((P.Jeu && P.Jeu.ile) ? P.Jeu.ile() : { a: "au Fourneau" }).a)})</button>`
      : o.enCombat ? `<button type="button" class="bouton" id="r-abandon">Abandonner le combat</button>` : `<button type="button" class="bouton" id="r-nouveau">Changer d'artisan</button>`;
    const corps = `<ul class="reglages-liste">
      <li><label><input type="checkbox" id="r-minuteur"${o.minuteurCoupe ? "" : (o.minuteurImpose || r.minuteur) ? " checked" : ""}${o.minuteurImpose || o.minuteurCoupe ? " disabled" : ""}> Minuteur de ${(ORVANE.Regles.CONST || {}).MINUTEUR_S || 45} secondes par tour</label></li>
      <li><label><input type="checkbox" id="r-reduit"${(r.reduit === null ? reduitSysteme : r.reduit) ? " checked" : ""}> Animations réduites</label></li>
      <li><label><input type="checkbox" id="r-accelere"${r.accelere ? " checked" : ""}> Accélérer les tours des monstres (×2)</label></li>
    </ul><p class="texte-doux">${o.minuteurCoupe ? "Pas de Minuteur pendant le combat d'entraînement : prends ton temps." : o.minuteurImpose ? "Avec un allié, le Minuteur reste : les tours d'un absent doivent passer." : "Sans Minuteur, tu prends ton temps : le tour attend ton « Fin du tour ». Le couper puis le remettre ne rend pas le temps écoulé."}</p>
    <div class="liens-reglages"><button type="button" class="bouton" id="r-lexique">Lexique : les mots du jeu</button>${o.enCombat ? `<button type="button" class="bouton" id="r-carac">Mes caractéristiques</button>` : ""}${!o.enCombat && P.Tuto ? `<button type="button" class="bouton" id="r-tuto">${esc(P.Tuto.libelleReglages())}</button>` : ""}</div>` + action;
    const c = fenetre("d-reglages", "Réglages", corps, `<button type="button" class="bouton or" data-fermer>Fermer</button>`);
    c.querySelector("#r-minuteur").onchange = e => { r.minuteur = e.target.checked; P.Profil.sauver(); o.surMinuteur && o.surMinuteur(r.minuteur); };
    c.querySelector("#r-reduit").onchange = e => { r.reduit = e.target.checked; P.reglages = r; P.Profil.sauver(); };
    c.querySelector("#r-accelere").onchange = e => { r.accelere = e.target.checked; P.Profil.sauver(); const b = $("b-accelere"); if (b) b.setAttribute("aria-pressed", String(!!r.accelere)); };
    c.querySelector("#r-lexique").onclick = () => P.UI.lexique();
    const rc = c.querySelector("#r-carac"); if (rc) rc.onclick = () => P.UI.caracteristiques({ enCombat: true });
    const rt = c.querySelector("#r-tuto"); if (rt) rt.onclick = () => { fermer("d-reglages"); P.Tuto.recommencer(); };
    const deuxFois = (b, texte, fin) => { if (!b) return; b.onclick = () => { if (b.dataset.sur) { fermer("d-reglages"); fin(); return; } b.dataset.sur = "1"; b.textContent = texte; b.classList.add("or"); }; };
    deuxFois(c.querySelector("#r-abandon"), "Toucher encore pour abandonner (sans butin)", () => o.surAbandon());
    deuxFois(c.querySelector("#r-renoncer"), "Toucher encore pour renoncer (le groupe reste là)", () => o.surRenoncer());
    deuxFois(c.querySelector("#r-nouveau"), "Toucher encore pour revenir au choix de l'artisan (créer un autre artisan remplace celui-ci)", () => o.surNouveau());
  }

  // ---------- Création du personnage ----------
  function creation(onEntrer) {
    const C = ORVANE.CLASSES, Pr = P.Profil, sec = $("creation");
    const ancien = Pr.profil;
    const choix = { classe: ancien ? ancien.classe : C[0].id, sexe: ancien ? ancien.sexe : "h", peau: ancien ? ancien.peau : Pr.PEAUX[2], poils: ancien ? ancien.poils : Pr.POILS[1], niveau: 1, nom: "" };
    const NIVEAUX = [1, 3, 5, 7, 10, 12, 26, 57, 100, 151, 200];
    sec.innerHTML = `<div class="creation">
      <div><h1 id="creation-titre">Orvane</h1><p class="chapo">Les huit métiers de La Place des Artisans sont devenus des classes. Choisis ton artisan (chacun peut jouer seul), puis va faire tes preuves au Fourneau.</p></div>
      ${ancien ? `<div class="reprendre"><p><b>${esc(ancien.nom)}</b>, ${esc((Pr.classe(ancien.classe) || {}).nom)} de niveau ${ancien.niveau}, ${ancien.ble} Blé.</p><button type="button" class="bouton or" id="reprendre">Reprendre</button></div>` : ""}
      <div class="creation-corps">
        <div class="apercu" aria-live="polite"><svg id="apercu-svg" viewBox="-30 -66 60 72" role="img" aria-label="Ton artisan"></svg><h2 id="apercu-nom"></h2><p id="apercu-role"></p><p id="apercu-meca"></p></div>
        <div class="reglages-perso">
          <div class="groupe-choix"><span id="l-classes">Classe</span><div class="classes" role="radiogroup" aria-labelledby="l-classes" id="classes"></div></div>
          <div class="groupe-choix"><span>Homme ou femme</span><div class="segments" role="group" aria-label="Homme ou femme"><button type="button" data-sexe="h">Homme</button><button type="button" data-sexe="f">Femme</button></div></div>
          <div class="groupe-choix"><span id="l-peau">Peau</span><div class="nuancier" role="radiogroup" aria-labelledby="l-peau" id="peaux"></div></div>
          <div class="groupe-choix"><span id="l-poils">Cheveux</span><div class="nuancier" role="radiogroup" aria-labelledby="l-poils" id="poils"></div></div>
          <div class="champs"><label>Nom<input id="nom" maxlength="18" autocomplete="off" spellcheck="false"></label>
            <label>Niveau de départ (essai)<select id="niveau">${NIVEAUX.map(n => `<option value="${n}">${n}</option>`).join("")}</select></label></div>
          <div class="entrer-ligne"><button type="button" class="bouton or" id="entrer">Entrer dans le jeu</button><p id="entrer-aide" hidden></p></div>
        </div>
      </div></div>`;
    const NS = "http://www.w3.org/2000/svg";
    const cl = $("classes");
    C.forEach(c => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "classe-b"; b.setAttribute("role", "radio"); b.dataset.classe = c.id;
      b.innerHTML = `<svg viewBox="-24 -54 48 58" aria-hidden="true"></svg><span></span>`;
      b.onclick = () => { choix.classe = c.id; maj(); };
      b.onkeydown = e => {
        const i = C.indexOf(c), d = { ArrowRight: 1, ArrowDown: 4, ArrowLeft: -1, ArrowUp: -4 }[e.key];
        if (d) { e.preventDefault(); const j = (i + d + C.length) % C.length; choix.classe = C[j].id; maj(); cl.children[j].focus(); }
      };
      cl.appendChild(b);
    });
    const nuancier = (id, liste, champ, nom) => {
      const z = $(id);
      liste.forEach((h, i) => {
        const b = document.createElement("button"); b.type = "button"; b.setAttribute("role", "radio"); b.style.background = h; b.dataset.v = h;
        b.setAttribute("aria-label", `${nom} ${i + 1}`);
        b.onclick = () => { choix[champ] = h; maj(); };
        b.onkeydown = e => { const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (d) { e.preventDefault(); const j = (i + d + liste.length) % liste.length; choix[champ] = liste[j]; maj(); z.children[j].focus(); } };
        z.appendChild(b);
      });
    };
    nuancier("peaux", Pr.PEAUX, "peau", "Peau"); nuancier("poils", Pr.POILS, "poils", "Cheveux");
    sec.querySelectorAll("[data-sexe]").forEach(b => (b.onclick = () => { choix.sexe = b.dataset.sexe; maj(); }));
    const nom = $("nom");
    let nomTouche = false;
    nom.oninput = () => { nomTouche = true; };
    const entrer = $("entrer"), aide = $("entrer-aide");
    let confirme = false;
    const desarmer = () => { confirme = false; entrer.classList.remove("confirmer"); entrer.textContent = "Entrer dans le jeu"; aide.hidden = true; };
    function maj() {
      const c = Pr.classe(choix.classe), o = { sexe: choix.sexe, peau: choix.peau, poils: choix.poils };
      [...cl.children].forEach((b, i) => {
        const cc = C[i], on = cc.id === choix.classe;
        b.setAttribute("aria-checked", on); b.tabIndex = on ? 0 : -1;
        b.querySelector("span").textContent = choix.sexe === "f" ? cc.fem : cc.nom;
        const s = b.querySelector("svg"); s.innerHTML = "";
        const g = document.createElementNS(NS, "g"); s.appendChild(g); ORVANE.dessinePerso(g, cc, Object.assign({ s: 1 }, o));
      });
      ["peaux", "poils"].forEach(id => [...$(id).children].forEach(b => { const on = b.dataset.v === choix[id === "peaux" ? "peau" : "poils"]; b.setAttribute("aria-checked", on); b.tabIndex = on ? 0 : -1; }));
      sec.querySelectorAll("[data-sexe]").forEach(b => b.setAttribute("aria-pressed", b.dataset.sexe === choix.sexe));
      const a = $("apercu-svg"); a.innerHTML = "";
      const ga = document.createElementNS(NS, "g"); a.appendChild(ga); ORVANE.dessinePerso(ga, c, Object.assign({ s: 1.25 }, o));
      $("apercu-nom").textContent = choix.sexe === "f" ? c.fem : c.nom;
      $("apercu-role").textContent = `${c.metier} · ${c.role}`;
      $("apercu-meca").textContent = `${c.meca[0]} : ${c.meca[1]}`;
      if (!nomTouche) nom.value = choix.sexe === "f" ? c.fem : c.nom;
      desarmer();
    }
    maj();
    entrer.onclick = () => {
      // un artisan est déjà sauvé : on demande un second toucher avant de le remplacer
      if (ancien && !confirme) {
        confirme = true; entrer.classList.add("confirmer");
        entrer.textContent = "Toucher encore pour remplacer " + ancien.nom;
        aide.textContent = `${ancien.nom} (${(Pr.classe(ancien.classe) || {}).nom}, niveau ${ancien.niveau}) sera remplacé. Pour le garder, touche « Reprendre » en haut.`;
        aide.hidden = false;
        return;
      }
      choix.nom = nom.value.trim() || (choix.sexe === "f" ? Pr.classe(choix.classe).fem : Pr.classe(choix.classe).nom);
      choix.niveau = +$("niveau").value;
      onEntrer(choix, true);
    };
    $("niveau").onchange = desarmer;
    const rep = $("reprendre");
    if (rep) rep.onclick = () => onEntrer(ancien, false);
    mode("creation");
    sec.scrollTop = 0;
    setTimeout(() => (rep || cl.querySelector('[aria-checked="true"]')).focus({ preventScroll: true }), 0);
  }

  P.UI = { $, esc, toast, mode, rectUtile, lateral, fenetre, fermer, ouvert, bandeau, ficheCombattant, ficheSort, ficheGroupe, frise, replierFrise, infosCombat, commandeRatee, jauges, barre, accelere, lancer, message, annonce, messageFond, minuteur, placement, addition, grimoire, reglages, creation, nomElement, couleurElement, pluriel };
})();
