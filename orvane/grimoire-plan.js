// Pour la page du plan : lit le grimoire structuré (grimoire.js, ORVANE.GRIMOIRE) et en tire les lignes du tableau des sorts.
// ORVANE.SORTS[classe] et ORVANE.DECLINAISONS[classe] : [niveau, nom, élément, CM, Rayon, effet, id, ce qui change].
(() => {
  const O = window.ORVANE = window.ORVANE || {}, G = O.GRIMOIRE;
  // icônes des éléments (reprises de l'ancienne maquette), pour la section des éléments
  const ICONES = { F: '<path d="M11 2c4 5 7 7.5 7 11.5a7 7 0 01-14 0c0-3 2-5.5 3.5-7.5 1 2 2 2.5 3.5 3.5z" fill="C"/>', E: '<path d="M11 2C11 2 4.5 10 4.5 14a6.5 6.5 0 0013 0C17.5 10 11 2 11 2z" fill="C"/>',
    T: '<path d="M2 18L8.5 7l3 4.5L15 6l5 12z" fill="C"/>', S: '<path d="M3 8h10a3 3 0 10-3-3M3 13h14a3 3 0 11-3 3M3 18h6" fill="none" stroke="C" stroke-width="2.2" stroke-linecap="round"/>',
    C: '<path d="M13 2L5 12.5h5.5L9 20l8.5-11H12l1-7z" fill="C"/>', N: '<path d="M11 2l2.2 6 6.3.8-4.9 4.1 1.6 6.6L11 16l-5.2 3.5 1.6-6.6L2.5 8.8l6.3-.8z" fill="C"/>' };
  ORVANE.icone = (e, couleur) => ICONES[e].replace(/="C"/g, `="${couleur || (window.ORVANE.ELEMENTS)[e].couleur}"`);
  if (!G) return;
  const EL = k => ((O.ELEMENTS || {})[k] || {}).nom || k;
  const pl = (n, s, p) => n + " " + (Math.abs(n) > 1 ? (p || s + "s") : s);
  const ETATS = { brule: "Brûlé", ramolli: "Ramolli", enracine: "Enraciné", plante: "Planté", glissant: "Glissant", derobe: "Dérobé", nappe: "Nappé",
    fume: "Fumé", attendri: "Attendri", affine: "Affiné", feve: "Fève", "maree-haute": "Marée haute", "maree-basse": "Marée basse" };
  const CARACS = { levure: "Levure", rayon: "Rayon", pas: "Pas", cm: "CM", conservation: "Conservation", coupDeMaitre: "Coup de maître", rideau: "Rideau",
    fauxFuyant: "Faux-fuyant", ouverture: "Ouverture", degatsPct: "% de dégâts" };
  const CONDS = { cibleBlessee: "si la cible a moins de la moitié de ses Victuailles", dansLeDos: "dans le dos", auContact: "au contact",
    cibleAffinee: "si la cible est Affinée", mareeHaute: "à marée haute", mareeBasse: "à marée basse", buffetComplet: "si le Buffet est complet", cibleTombe: "si la cible tombe" };
  const ZONES = { croix: "en croix", rond: "en rond", anneau: "en anneau", ligne: "en ligne", travers: "en travers", cone: "en cône", "demi-rond": "en demi-rond", carre: "en carré", terrain: "sur tout le terrain" };
  const POSES = { nappe: "une nappe", piege: "un piège", fournee: "une fournée", graine: "une graine", ustensile: "un Ustensile" };
  const LANCERS = { ligne: "en ligne", diagonale: "en diagonale", "ligne+diagonale": "en ligne ou diagonale" };
  function effet(b) {
    switch (b.type) {
      case "degats": return `${b.min} à ${b.max} dégâts ${EL(b.element)}`;
      case "soin": return `soigne ${b.min} à ${b.max}`;
      case "bouclier": return `bouclier de ${b.valeur} (${pl(b.tours, "tour")})`;
      case "pousse": return `repousse de ${pl(b.cases, "case")}`;
      case "attire": return `attire de ${pl(b.cases, "case")}`;
      case "ramene": return `ramène un allié de ${pl(b.cases, "case")}`;
      case "bond": return "bondit sur la case";
      case "echange": return "échange de place";
      case "dans-le-dos": return "passe dans le dos";
      case "etat": return (ETATS[b.etat] || b.etat) + (b.tours ? ` (${pl(b.tours, "tour")})` : "");
      case "retire": return `−${b.n} ${b.quoi === "cm" ? "CM" : "Pas"}`;
      case "bonus": return `${b.valeur > 0 ? "+" : ""}${b.valeur} ${CARACS[b.carac] || b.carac} (${pl(b.tours, "tour")})`;
      case "gainCM": return `+${b.n} CM`;
      case "entame": return `Entame ${b.part} %`;
      case "rebond": return `rebondit ${b.fois} fois`;
      case "renforce": return `renforce de ${b.valeur} %`;
      case "si": return (b.condition === "cibleAffinee" && b.n ? `si la cible est Affinée (${pl(b.n, "couche")} au moins)` : CONDS[b.condition] || b.condition) + " : " + (b.effets || []).map(effet).join(", ");
      case "pose": return `pose ${POSES[b.quoi] || b.quoi}` + (b.tours ? ` (${pl(b.tours, "tour")})` : "") + (b.zone && ZONES[b.zone.forme] ? `, zone ${ZONES[b.zone.forme]}` + (b.zone.taille ? ` ${b.zone.taille}` : "") : "") + ((b.effets || []).length ? " : " + b.effets.map(effet).join(", ") : "");
      case "invoque": return `appelle ${b.commis && b.commis.nom || "un Commis"}`;
      default: return b.type;
    }
  }
  const rayon = s => {
    const r = s.rayon || { min: 0, max: 0 };
    let t = s.cible === "soi" || (r.min === 0 && r.max === 0) ? "Soi" : r.min === r.max ? String(r.max) : `${r.min} à ${r.max}`;
    if (r.modifiable) t += ", modifiable";
    if (LANCERS[s.lancer]) t += ", " + LANCERS[s.lancer];
    if (t !== "Soi" && s.vue === false) t += ", sans vue";
    return t;
  };
  const texte = s => {
    let t = (s.effets || []).map(effet).join(", ");
    const z = s.zone && ZONES[s.zone.forme];
    if (z) t += ` · zone ${z}` + (s.zone.taille ? ` ${s.zone.taille}` : "");
    if (s.relance) t += ` · relance ${pl(s.relance, "tour")}`;
    return t.charAt(0).toUpperCase() + t.slice(1);
  };
  const ligne = s => [s.niveau, s.nom, s.element, s.cm, rayon(s), texte(s), s.id, s.change || ""];
  O.SORTS = {}; O.DECLINAISONS = {};
  Object.keys(G).forEach(id => {
    O.SORTS[id] = G[id].map(e => ligne(e.base));
    O.DECLINAISONS[id] = G[id].map(e => ligne(e.declinaison));
  });
})();
