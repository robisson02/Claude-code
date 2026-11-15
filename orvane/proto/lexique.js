/*
 * Orvane, prototype : le Lexique (les mots du jeu, en phrases courtes) et le « Bon à savoir » de la fiche d'un sort.
 * Chaque définition a été relue dans le moteur (moteur/regles.js) ; les chiffres viennent de ORVANE.Regles.CONST,
 * pour rester justes si on règle le jeu.
 */
window.ORVANE = window.ORVANE || {};
(() => {
  const P = ORVANE.Proto = ORVANE.Proto || {};
  const R = () => ORVANE.Regles;
  const C = () => (R() && R().CONST) || {};
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pct = x => String(x).replace(".", ",");

  const GROUPES = [
    ["tour", "Ton tour"], ["contact", "Au contact"], ["carac", "Tes caractéristiques"], ["sol", "Ce qu'on pose au sol"],
    ["etats", "Les états"], ["combat", "Le combat"], ["sorts", "Les sorts"], ["voyage", "Voyager"]
  ];
  // { id, mot, groupe, def (le Lexique), court (une phrase, pour le « Bon à savoir ») }
  function entrees() {
    const K = C(), PR = K.PAIN_DE_ROUTE || {}, E = K.ETATS || {}, EC = K.ECRASEMENT || {}, RG = K.RANGS || {};
    const att = (E.attendri && E.attendri.conservation) || [0, 10, 15];
    return [
      // ---------- Ton tour ----------
      { id: "cm", mot: "CM (coups de main)", groupe: "tour", def: `Ce que coûtent tes sorts. Tu en as ${K.CM_DEPART} au début de chaque tour (un de plus à partir du niveau ${K.NIVEAU_COMPAGNON}). Ce que tu ne dépenses pas est perdu à la fin du tour.` },
      { id: "pas", mot: "Pas", groupe: "tour", def: `Pour marcher : 1 Pas = 1 case, tout droit (pas en diagonale). Tu en as ${K.PAS_DEPART} à chaque tour.` },
      { id: "victuailles", mot: "Victuailles", groupe: "tour", def: "Ta vie. À 0, tu « rends ton tablier » : tu sors du combat." },
      { id: "rayon", mot: "Rayon", groupe: "tour", def: "La distance à laquelle un sort peut viser, en cases. Quand tu choisis un sort, les cases dorées bien marquées sont celles que tu peux viser. Les cases hachurées sont dans le Rayon mais cachées : un décor ou quelqu'un bloque la vue, ou le sort se lance seulement en ligne ou en diagonale. Les cases dorées plus pâles sont dans le Rayon, mais le sort n'y sert à rien (par exemple une case vide pour un sort qui vise un ennemi)." },
      { id: "minuteur", mot: "Minuteur", groupe: "tour", def: `${K.MINUTEUR_S} secondes par tour. À zéro, ton tour passe. Seul, tu peux le couper dans les Réglages.` },
      { id: "pain", mot: "Pain de route", groupe: "tour", def: `Il rend ${PR.base} Victuailles, plus 1 tous les 5 niveaux. Il coûte ${PR.cm} CM, une fois par tour. Chaque combat t'en donne ${PR.parCombat} ; ceux de ton Sac en plus (une récompense) sont une réserve : tu les manges seulement après ceux du combat. Sur le bouton : « Vie pleine » (rien à soigner) ou « Déjà mangé » (une fois par tour).`, court: "il rend des Victuailles, une fois par tour." },
      { id: "relance", mot: "Limites d'un sort (sort grisé)", groupe: "tour", def: "Un sort a souvent un nombre de lancers par tour, un nombre par cible, et parfois une relance (il doit attendre quelques tours). Un sort qu'on ne peut pas lancer est grisé, avec un repère : son coût en rouge s'il manque des CM, « 2 t. » s'il revient dans 2 tours, « plein » s'il a déjà posé tout ce qu'il peut, « 0/2 » s'il a déjà servi 2 fois ce tour (« 1/2 » : servi une fois sur 2). Pendant le tour d'un autre, ou pendant ton action, toute la barre est grisée. Touche un sort grisé : le jeu dit pourquoi. Le Pain de route marque « Déjà mangé » (une fois par tour) ou « Vie pleine » (rien à soigner)." },
      // ---------- Au contact ----------
      { id: "rideau", mot: "Rideau et Faux-fuyant", groupe: "contact", def: "Quand tu quittes une case collée à un ennemi, son Rideau te retient : tu perds une partie de tes Pas et de tes CM. Ton Faux-fuyant réduit cette perte ; s'il vaut au moins le double de son Rideau, tu pars sans rien perdre. Si la perte te laisse 0 Pas, tu ne peux pas partir : tu es « pris dans le Rideau ». L'aperçu de ta marche montre la perte avant." },
      // ---------- Tes caractéristiques ----------
      { id: "affinite", mot: "Points de caractéristique et affinités", groupe: "carac", def: `Tu gagnes ${K.CAPITAL_PAR_NIVEAU} points à chaque niveau. Tu les places où tu veux, dans « Caractéristiques » : dans un élément (Flambée, Eaudace, Terroir, Soufflé, Éclair), c'est ton affinité : +1 % de dégâts par point pour tes sorts de cet élément, et un petit plus ; ou dans les Victuailles : +${(K.VICTUAILLES || {}).parPoint} Victuailles par point. Conseil : choisis 1 ou 2 éléments, ceux de tes sorts préférés. Un coin doré marque leurs sorts dans ta barre.` },
      { id: "ouverture", mot: "Ouverture", groupe: "carac", def: "Décide quel camp joue en premier : au début du combat, on compare l'Ouverture moyenne des deux camps. Ensuite, les camps jouent chacun leur tour." },
      { id: "conservation", mot: "Conservation", groupe: "carac", def: `Protège contre un élément : 20 % de Conservation Flambée = 20 % de dégâts Flambée en moins. Un chiffre négatif est une faiblesse. Un artisan monte à ${(K.CONSERVATION || {}).artisan} % au plus.` },
      { id: "levure", mot: "Levure", groupe: "carac", def: "Plus de dégâts dans tous les éléments : +1 % par point, en plus de l'affinité." },
      { id: "maitre", mot: "Coup de maître", groupe: "carac", def: `La chance qu'un sort frappe plus fort (environ +${Math.round(((K.MAITRE_FOURCHETTE || 1.25) - 1) * 100)} %). Chaque sort a sa propre chance ; ton Coup de maître s'y ajoute. Une toque dorée l'annonce.` },
      { id: "savoir-faire", mot: "Savoir-faire et Ristourne", groupe: "carac", def: "Savoir-faire : plus d'XP à la fin du combat (+1 % par point). Ristourne : plus de chances de trouver des objets. Ils viennent de l'équipement et du bonus d'une Commande tenue, pas de tes points de caractéristique." },
      { id: "entame", mot: "Entame", groupe: "carac", def: `Chaque coup reçu abîme aussi ton maximum de Victuailles : ${pct((K.ENTAME || {}).pct)} % des Victuailles perdues ne reviennent plus de tout le combat (la partie grise hachurée de la barre). Certains sorts entament plus fort.`, court: "une partie des Victuailles perdues ne revient plus de tout le combat." },
      { id: "ecrasement", mot: "Écrasement", groupe: "carac", def: `Un ennemi poussé contre un décor, le bord ou quelqu'un prend des dégâts en plus pour chaque case qu'il n'a pas pu faire (${EC.base} + niveau / ${EC.diviseurNiveau} par case). Celui qu'il heurte en prend la moitié. Jamais sur ton camp.`, court: "poussé contre un obstacle, l'ennemi prend des dégâts en plus." },
      // ---------- Au sol ----------
      { id: "fournee", mot: "Fournée", groupe: "sol", def: "Une pâte que tu poses sur une case. Elle cuit pendant quelques tours : le chiffre jaune posé dessus compte les tours qui restent. Il baisse d'un au début de chacun de tes tours. À 0, elle éclate, au début de ton tour, dans sa zone (les cases hachurées autour d'elle) : elle frappe les ennemis qui s'y trouvent à ce moment-là. Les ennemis peuvent donc en sortir avant ! Quand tu choisis un sort de fournée, l'aperçu montre sa zone et ce qu'elle ferait. Certaines, comme le Four à pain, ont des Victuailles : cassées avant, elles n'éclatent pas. Une seule fournée par case. Si tu tombes, tes fournées disparaissent. C'est la spécialité du Levainqueur.", court: "posée au sol, elle cuit quelques tours puis éclate, au début de ton tour, sur les ennemis restés dans sa zone." },
      { id: "nappe", mot: "Nappe", groupe: "sol", def: "Une flaque posée sur plusieurs cases, pour quelques tours. Elle agit sur ceux qui s'y trouvent (au début de leur tour, quand ils y entrent, ou à la fin de leur tour, selon le sort), une fois par tour chacun. Elle frappe les ennemis, ou aide les alliés si c'est un sort de soutien.", court: "une flaque sur plusieurs cases qui agit sur ceux qui s'y trouvent, pendant quelques tours." },
      { id: "piege", mot: "Piège", groupe: "sol", def: `Caché aux ennemis. Il se déclenche quand un ennemi arrive sur sa case (en marchant, poussé ou en bondissant), puis disparaît. ${K.PIEGES_PAR_POSEUR} pièges au plus par artisan. La spécialité du Traîtreur.`, court: "caché aux ennemis, il se déclenche quand l'un d'eux arrive sur sa case." },
      { id: "graine", mot: "Graine", groupe: "sol", def: "Posée sur une case libre, elle germe au début d'un de tes prochains tours (le chiffre jaune compte les tours) et devient un Commis, s'il y a la place : case libre, et pas déjà ton plein de Commis. La spécialité du Légumancien.", court: "posée au sol, elle germe au début d'un de tes prochains tours et devient un Commis." },
      { id: "ustensile", mot: "Ustensile", groupe: "sol", def: "Un objet posé qui a ses propres Victuailles : il bloque la marche et la vue, et on peut le casser. Certains agissent autour d'eux au début de chacun de tes tours. Il reste quelques tours.", court: "un objet posé, qu'on peut casser ; il bloque la marche et la vue." },
      { id: "commis", mot: "Commis", groupe: "sol", def: `Un aide appelé par un sort (ou né d'une graine). Il joue tout seul, juste après toi. Ses Victuailles et ses dégâts grandissent avec ton niveau. Tu en as ${(K.DEPART || {}).commis || 1} à la fois au départ. Si tu tombes, il tombe aussi.`, court: "un aide qui joue tout seul, juste après toi." },
      // ---------- États ----------
      { id: "brule", mot: "Brûlé", groupe: "etats", def: `Perd des Victuailles au début de chacun de ses tours (${(E.brule || {}).degats} par couche, en Flambée). Le reposer remet sa durée, sans ajouter de couche.` },
      { id: "ramolli", mot: "Ramolli", groupe: "etats", def: "Perd 1 Pas par couche au début de son tour (2 Pas au plus)." },
      { id: "enracine", mot: "Enraciné", groupe: "etats", def: "Ne peut pas marcher pendant son tour." },
      { id: "plante", mot: "Planté", groupe: "etats", def: "Ne peut être ni poussé, ni attiré, ni changer de place avec quelqu'un." },
      { id: "glissant", mot: "Glissant", groupe: "etats", def: "Quitte le contact d'un ennemi sans rien perdre au Rideau." },
      { id: "derobe", mot: "Dérobé", groupe: "etats", def: "Invisible pour l'autre camp : on ne voit plus sa case. Il se montre un instant s'il frappe ou s'il se cogne." },
      { id: "nappe-etat", mot: "Nappé", groupe: "etats", def: "Couvert d'un glaçage : un bouclier qui prend les coups à sa place. L'état part avec le dernier bouclier.", court: "un glaçage, un bouclier qui prend les coups à sa place." },
      { id: "fume", mot: "Fumé", groupe: "etats", def: `Fait ${Math.abs((E.fume || {}).degatsPct)} % de dégâts en moins.` },
      { id: "attendri", mot: "Attendri", groupe: "etats", def: `Craint plus les coups : −${att[1]} % de Conservation (−${att[2]} % avec 2 couches).` },
      { id: "affine", mot: "Affiné", groupe: "etats", def: `La marque du Fromagicien : elle gagne une couche à la fin de chaque tour du porteur (${(E.affine || {}).max} au plus), et certains sorts du Fromagicien frappent plus fort une cible bien affinée.`, court: "la marque du Fromagicien : certains de ses sorts frappent plus fort une cible bien affinée." },
      { id: "feve", mot: "Fève", groupe: "etats", def: "Dure tout le combat. Celui qui fait tomber le porteur de la Fève gagne 1 CM tout de suite.", court: "celui qui fait tomber son porteur gagne 1 CM." },
      { id: "maree", mot: "Marée haute / Marée basse", groupe: "etats", def: `La Voile du Merlanceur : il commence à marée haute (+${(E["maree-haute"] || {}).rayon} Rayon) ; à chacun de ses tours, la marée change ; marée basse : +${(E["maree-basse"] || {}).degatsPct} % de dégâts.`, court: `la marée du Merlanceur change à chacun de ses tours : haute, +${(E["maree-haute"] || {}).rayon} Rayon ; basse, +${(E["maree-basse"] || {}).degatsPct} % de dégâts.` },
      // ---------- Le combat ----------
      { id: "mise-en-place", mot: "Mise en place", groupe: "combat", def: "Avant le combat : tu choisis ta case de départ (les cases dorées ; les cases cuivre sont aux monstres), la Commande et ton bonus, puis tu touches « Envoyez ! »." },
      { id: "commande", mot: "Commande", groupe: "combat", def: "Un défi pour le combat (par exemple « Sans contact » : ne jamais finir son tour collé à un ennemi). Tenue jusqu'à la victoire, elle donne un bonus : plus d'XP (Savoir-faire) ou plus d'objets (Ristourne), au choix. Ratée, elle est barrée, sans autre perte." },
      { id: "manche", mot: "Manche", groupe: "combat", def: "Une manche est finie quand tout le monde a joué son tour une fois." },
      { id: "addition", mot: "Addition", groupe: "combat", def: `Le bilan à la fin du combat : XP, Blé, objets gagnés, Commande tenue ou ratée. Un niveau gagné donne aussi ${K.CAPITAL_PAR_NIVEAU} points de caractéristique à placer.` },
      { id: "arrivage", mot: "Arrivage", groupe: "combat", def: "Un groupe de monstres qu'on laisse en paix gagne de la fraîcheur : +10 % d'XP par minute, jusqu'à +100 %." },
      // ---------- Les sorts ----------
      { id: "declinaison", mot: "Déclinaison", groupe: "sorts", def: "Chaque emplacement du Grimoire a un sort de base et une variante, la déclinaison, qui s'ouvre plus tard. Tu prends l'un ou l'autre dans le Grimoire, hors combat." },
      { id: "rang", mot: "Rang", groupe: "sorts", def: `Un sort se renforce avec ton niveau. Il passe au rang 2 quand tu as ${RG.ecart2} niveaux de plus qu'à son arrivée (dégâts, soins et boucliers ×${pct((RG.multiplicateur || [])[2])}), au rang 3 avec ${RG.ecart3} niveaux de plus (×${pct((RG.multiplicateur || [])[3])}, et il revient un tour plus tôt). Au niveau ${RG.niveauMax}, tous tes sorts sont au rang 3, même ceux arrivés tard.` },
      { id: "outil", mot: "Coup d'outil", groupe: "sorts", def: "L'attaque de ton outil de métier. Elle est toujours dans ta barre." },
      // ---------- Voyager (les îles de l'Astrelier) ----------
      { id: "passage", mot: "Passage", groupe: "voyage", def: "Un objet qui mène à une autre île : une flèche au bord, un passe-plat, un monte-plats, un toboggan, un Four banal… Ils brillent d'or quand tu arrives sur une île. Touche-le une fois : son étiquette dit où il mène. Touche-le encore : tu y vas." },
      { id: "voie-lactee", mot: "Voie lactée", groupe: "voyage", def: "Le pont de lait d'étoiles entre la Halle des Ébauches et le Fourneau. On le traverse à pied : on y entre par le bord d'une île, on en sort par l'autre bout. Des Grumeaux s'y promènent ; on peut les éviter." },
      { id: "bord", mot: "Bord de l'île (flèche dorée)", groupe: "voyage", def: "Une flèche dorée au bord d'une île : touche-la, puis touche-la encore. Ton artisan y marche et arrive sur l'île voisine." },
      { id: "four-banal", mot: "Four banal", groupe: "voyage", def: "Le four commun d'une île (« banal » veut dire ici : à tout le monde). Passe juste devant : il s'allume, une fois pour toutes. Ensuite, depuis n'importe quel Four banal allumé, tu voyages vers les autres fours allumés. Celui de la Halle est toujours allumé. Grand-Étal a ses propres fours, à part." },
      { id: "passe-plat", mot: "Passe-plat", groupe: "voyage", def: "Le guichet entre la cuisine et la salle. On entre dans l'un, on ressort par son jumeau, sur une autre île : la Halle des Ébauches et la Penderie des Tabliers." },
      { id: "monte-plats", mot: "Monte-plats", groupe: "voyage", def: "Une petite caisse pendue à des cordes, au bord de l'île. En cuisine, elle monte les plats à l'étage. Ici, elle monte du Fourneau à la Penderie des Tabliers, une île plus haute, et en redescend." },
      { id: "toboggan", mot: "Toboggan", groupe: "voyage", def: "Une longue crêpe en pente : une glissade de la Penderie des Tabliers vers le Moule, plus bas. Il est à sens unique : il ne se remonte pas. Pour repartir du Moule, prends son Four banal." },
      { id: "pelle", mot: "Grande Pelle (Défournement)", groupe: "voyage", def: `La pelle à enfourner géante, au bord du Moule. Au niveau ${(P.Iles && P.Iles.NIVEAU_PELLE) || 12}, elle te « défourne » : tu quittes l'Astrelier pour Grand-Étal, la ville neutre. Elle ne te ramène pas : pour revenir, fais la Sieste.` },
      { id: "sieste", mot: "Sieste", groupe: "voyage", def: "Un lit de farine, à Grand-Étal. Allonge-toi : tu reviens à l'Astrelier en rêvant, à la Halle des Ébauches ou près d'un Four banal allumé." }
    ];
  }
  // le mot du Lexique pour chaque état du moteur
  const ETAT_VERS = { brule: "brule", ramolli: "ramolli", enracine: "enracine", plante: "plante", glissant: "glissant", derobe: "derobe", nappe: "nappe-etat",
    fume: "fume", attendri: "attendri", affine: "affine", feve: "feve", "maree-haute": "maree", "maree-basse": "maree" };

  // ---------- Le panneau ----------
  function lexique(cible) {
    const UI = P.UI, l = entrees();
    let corps = `<p class="texte-doux">Les mots du jeu, en quelques phrases.</p><div class="groupes-lexique" role="navigation" aria-label="Parties du Lexique">${GROUPES.map(([id, nom]) => `<button type="button" data-aller="${id}">${esc(nom)}</button>`).join("")}</div><div class="lexique">`;
    GROUPES.forEach(([gid, nom]) => {
      corps += `<section id="lexg-${gid}" aria-labelledby="lexh-${gid}"><h3 id="lexh-${gid}">${esc(nom)}</h3><dl>` +
        l.filter(e => e.groupe === gid).map(e => `<div class="entree" id="lex-${e.id}"><dt>${esc(e.mot)}</dt><dd>${esc(e.def)}</dd></div>`).join("") + `</dl></section>`;
    });
    corps += `</div>`;
    const c = UI.fenetre("d-lexique", "Lexique", corps, `<button type="button" class="bouton or" data-fermer>Fermer</button>`);
    const zone = c.querySelector(".corps");
    c.querySelectorAll("[data-aller]").forEach(b => (b.onclick = () => { const s = c.querySelector("#lexg-" + b.dataset.aller); if (s) zone.scrollTop = s.offsetTop - zone.offsetTop - 4; }));
    if (cible) {
      const e = c.querySelector("#lex-" + cible);
      if (e) {
        e.classList.add("vise");
        requestAnimationFrame(() => { zone.scrollTop = Math.max(0, e.offsetTop - zone.offsetTop - 8); });
      }
    } else zone.scrollTop = 0;
  }

  // ---------- « Bon à savoir » : les mots spéciaux d'un sort ----------
  // n : le sort complété (normaliserSort). Renvoie les ids du Lexique, dans l'ordre où ils apparaissent.
  function motsDuSort(n) {
    const vus = [];
    const ajoute = id => { if (id && vus.indexOf(id) < 0) vus.push(id); };
    const parcourir = effets => (effets || []).forEach(b => {
      if (b.type === "pose") { ajoute({ fournee: "fournee", nappe: "nappe", piege: "piege", graine: "graine", ustensile: "ustensile" }[b.quoi]); if (b.quoi === "graine" || b.commis) ajoute("commis"); parcourir(b.effets); }
      else if (b.type === "invoque") ajoute("commis");
      else if (b.type === "etat") ajoute(ETAT_VERS[b.etat]);
      else if (b.type === "entame") ajoute("entame");
      else if (b.type === "pousse") ajoute("ecrasement");
      else if (b.type === "bonus") ajoute({ levure: "levure", conservation: "conservation", coupDeMaitre: "maitre", rideau: "rideau", fauxFuyant: "rideau", ouverture: "ouverture" }[b.carac]);
      else if (b.type === "renforce" && /^famille:/.test(b.quoi || "")) ajoute({ fournee: "fournee", piege: "piege", nappe: "nappe", graine: "graine", ustensile: "ustensile", commis: "commis", invoque: "commis" }[String(b.quoi).slice(8)]);
      else if (b.type === "si") parcourir(b.effets);
    });
    parcourir(n.effets);
    return vus;
  }
  function bonASavoir(n) {
    const l = entrees(), ids = motsDuSort(n);
    if (!ids.length) return "";
    return `<div class="bon-a-savoir"><p>Bon à savoir</p>` + ids.map(id => {
      const e = l.find(x => x.id === id); if (!e) return "";
      const court = e.court || e.def.split(/(?<=\.)\s/)[0].replace(/\.$/, "");
      const mot = e.mot.replace(/ \(.*\)$/, "");
      return `<button type="button" class="terme" data-lexique="${e.id}"><span><b>${esc(mot)}</b> : ${esc(court.charAt(0).toLowerCase() + court.slice(1)).replace(/\.$/, "")}.</span><span class="vers">Lexique ›</span></button>`;
    }).join("") + `</div>`;
  }
  function brancherBonASavoir(racine) {
    racine.querySelectorAll("[data-lexique]").forEach(b => (b.onclick = () => lexique(b.dataset.lexique)));
  }

  P.Lexique = { entrees, motsDuSort, ETAT_VERS };
  P.UI = P.UI || {};
  Object.assign(P.UI, { lexique, bonASavoir, brancherBonASavoir });
})();
