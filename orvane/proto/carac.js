/*
 * Orvane, prototype : le panneau « Caractéristiques » (placer ses points de capital, librement).
 * Hors combat on règle un brouillon, on voit ce qu'il donne, puis on valide ; en combat, le panneau se lit seulement.
 * Les points vont où le joueur veut : les 5 éléments (affinités) et les Victuailles. Rien n'est bridé ; le panneau donne
 * seulement un conseil (choisir 1 ou 2 éléments). Le Savoir-faire ne se prend pas ici (il vient de l'équipement).
 * Coûts (R.coutAffinite, paliers), effets (R.deriverArtisan, CONST.AFFINITES_SECONDAIRES, CONST.VICTUAILLES) et capital
 * (CONST.CAPITAL_PAR_NIVEAU × (niveau − 1)) viennent du moteur.
 */
window.ORVANE = window.ORVANE || {};
(() => {
  const P = ORVANE.Proto = ORVANE.Proto || {};
  const R = () => ORVANE.Regles;
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const NOMS_CARAC = { rideau: "Rideau", fauxFuyant: "Faux-fuyant", ouverture: "Ouverture", coupDeMaitre: "Coup de maître", victuailles: "Victuailles" };
  const pts = n => n + " point" + (Math.abs(n) > 1 ? "s" : "");
  const COEUR = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22" width="22" height="22" aria-hidden="true"><path d="M11 19.2C5.4 15 2.4 11.8 2.4 8.2 2.4 5.6 4.4 3.6 6.9 3.6c1.7 0 3.2.9 4.1 2.3.9-1.4 2.4-2.3 4.1-2.3 2.5 0 4.5 2 4.5 4.6 0 3.6-3 6.8-8.6 11z" fill="#E07A62"/></svg>';
  // D'après le calcul des dégâts du moteur (calculerDegats : jet × (100 + affinité + Levure) / 100) : 1 point d'affinité = +1 % de dégâts
  const PCT_PAR_POINT = 1;

  // Le petit effet en plus d'un élément, en une phrase (CONST.AFFINITES_SECONDAIRES)
  function effetSecondaire(e) {
    const t = (R().CONST.AFFINITES_SECONDAIRES || {})[e];
    if (!t) return "";
    const qui = NOMS_CARAC[t.carac] || t.carac;
    const gain = t.carac === "coupDeMaitre" ? `+${t.gain} % de chance de ${qui}` : `+${t.gain} ${qui}`;
    return t.par === 1 ? `${gain} par point` : `${gain} tous les ${t.par} points`;
  }
  function sensElement(e) {
    const nom = P.UI.nomElement(e), s2 = effetSecondaire(e);
    return `Tes sorts ${nom} font +${PCT_PAR_POINT} % de dégâts par point.` + (s2 ? ` En plus : ${s2}.` : "");
  }
  // Le prochain point d'un élément : son coût selon les paliers (moteur)
  const coutSuivant = v => R().coutAffinite(v + 1) - R().coutAffinite(v);
  // Le palier franchi (CONST.PALIERS_AFFINITE) : la valeur au-delà de laquelle le point coûte ce qu'il coûte maintenant
  function seuilPalier(v) {
    let prec = 0;
    for (const p of R().CONST.PALIERS_AFFINITE || []) { if (v + 1 <= p.jusqua) return prec; prec = p.jusqua; }
    return prec;
  }
  const copie = c => JSON.parse(JSON.stringify(c));
  // Les mots de l'aperçu, en une phrase (les mêmes que le Lexique)
  const MOTS_APERCU = [
    { mot: "Rideau", def: "Retient un ennemi qui quitte ton contact : il perd des Pas et des CM." },
    { mot: "Faux-fuyant", def: "T'aide à quitter le contact d'un ennemi : tu perds moins au Rideau." },
    { mot: "Ouverture", def: "Décide quel camp joue en premier au début du combat." },
    { mot: "Coup de maître", def: "La chance qu'un sort frappe plus fort. Ton Coup de maître s'ajoute à celle de chaque sort." }
  ];
  // Le reste trop petit pour un point de plus dans les éléments choisis (sur la répartition en cours) : la phrase qui l'explique
  function petitReste(b, n) {
    if (n <= 0) return "";
    const choisis = P.Profil.ELEMENTS.filter(e => b.affinites[e] > 0);
    if (!choisis.length) return "";
    const couts = choisis.map(e => ({ e, c: coutSuivant(b.affinites[e]) })), min = Math.min(...couts.map(x => x.c));
    if (n >= min) return "";
    const noms = couts.map(x => P.UI.nomElement(x.e)).join(" ou ");
    return `Trop peu pour 1 point de plus en ${noms} (il en faut ${min}). Place-les ailleurs, ou garde-les pour plus tard.`;
  }
  const derive = (c, niveau) => P.Profil.deriver(c, niveau);
  const reste = (c, niveau) => derive(c, niveau).capital.reste;

  // Les sorts du joueur, par élément : équipés (dans la barre, Coup d'outil compris) et débloqués (sort de base ou déclinaison ouverts)
  function sortsParElement(p) {
    const Pr = P.Profil, eq = {}, deb = {};
    Pr.sortsEquipes(p).forEach(s => { (eq[s.element] = eq[s.element] || []).push(s); });
    const vus = new Set();
    Pr.grimoire(p.classe).forEach(e => [e.base, e.declinaison].forEach(s => {
      if (s && (s.niveau || 1) <= p.niveau && !vus.has(s.id)) { vus.add(s.id); (deb[s.element] = deb[s.element] || []).push(s); }
    }));
    Pr.sortsEquipes(p).filter(s => !s.emplacement).forEach(s => { if (!vus.has(s.id)) { vus.add(s.id); (deb[s.element] = deb[s.element] || []).push(s); } });
    return { eq, deb };
  }

  // Les lignes du panneau : les 5 éléments, puis les Victuailles
  function lignes() {
    const K = R().CONST, UI = P.UI;
    const l = P.Profil.ELEMENTS.map(e => ({
      id: e, element: true, nom: UI.nomElement(e), couleur: UI.couleurElement(e), icone: P.icone(e, null, 22), sens: sensElement(e),
      valeur: b => b.affinites[e],
      coutPlus: b => coutSuivant(b.affinites[e]),
      ajouter: (b, n) => { b.affinites[e] = Math.max(0, b.affinites[e] + n); }
    }));
    l.push({
      id: "victuailles", element: false, nom: "Victuailles", couleur: "#C8553D", icone: COEUR,
      sens: `Plus de vie : +${K.VICTUAILLES.parPoint} Victuailles par point.`,
      valeur: b => b.victuailles,
      coutPlus: () => 1,
      ajouter: (b, n) => { b.victuailles = Math.max(0, b.victuailles + n); }
    });
    return l;
  }

  // Appui maintenu qui répète (après un court temps), et toucher simple.
  // Le clic qui suit un appui maintenu est ignoré (il a déjà agi) ; si le bouton s'est grisé pendant l'appui, ce clic n'arrive
  // jamais : on oublie l'appui juste après le lâcher, pour que le prochain toucher ou la touche Entrée agisse.
  function maintien(b, fn) {
    let t1 = null, t2 = null, repete = false;
    const stop = () => { clearTimeout(t1); clearInterval(t2); t1 = t2 = null; };
    const lacher = () => { stop(); if (repete) setTimeout(() => { repete = false; }, 60); };
    b.addEventListener("pointerdown", e => {
      if (e.button > 0) return;
      repete = false; stop();
      t1 = setTimeout(() => { repete = true; fn(); t2 = setInterval(() => { if (b.disabled) { stop(); return; } fn(); }, 90); }, 450);
    });
    ["pointerup", "pointerleave", "pointercancel"].forEach(n => b.addEventListener(n, lacher));
    b.addEventListener("keydown", () => { repete = false; });
    // e.detail === 0 : clic venu du clavier (Entrée, Espace), jamais ignoré
    b.addEventListener("click", e => { if (repete && e.detail !== 0) { repete = false; e.preventDefault(); return; } repete = false; fn(); });
    b.addEventListener("contextmenu", e => e.preventDefault());
  }

  // ---------- Le panneau ----------
  function caracteristiques(o = {}) {
    const UI = P.UI, Pr = P.Profil, p = Pr.profil, enCombat = !!o.enCombat;
    if (!p) return;
    const annonce = Pr.annonceCarac();
    const valide = copie(Pr.caracActuelle(p));
    let brouillon = copie(valide);
    const L = lignes(), S = sortsParElement(p), K = R().CONST;
    const degatsEquipes = Pr.sortsEquipes(p).filter(Pr.faitDesDegats);

    let corps = "";
    if (annonce) corps += `<p class="carac-auto">${esc(annonce)}</p>`;
    corps += enCombat
      ? `<p class="carac-conseil">En combat, tu peux seulement lire tes caractéristiques. Tu les changes hors combat.</p>`
      : `<p class="carac-conseil"><b>Place tes points où tu veux.</b> Le plus efficace : choisir 1 ou 2 éléments, ceux de tes sorts préférés.</p>`;
    corps += `<div class="carac-reste" id="carac-reste" aria-live="polite"><b id="carac-n">0</b><span><span id="carac-n-texte">points à placer</span><small>Niveau ${p.niveau} · ${K.CAPITAL_PAR_NIVEAU} points par niveau gagné</small><small class="carac-petit-reste" id="carac-petit-reste" hidden></small></span></div>`;
    corps += `<ul class="carac-lignes">` + L.map(l => {
      let sorts = "";
      if (l.element) {
        const eq = S.eq[l.id] || [], deb = S.deb[l.id] || [];
        sorts = eq.length || deb.length
          ? `Tes sorts ${esc(l.nom)} : ${eq.length} équipé${eq.length > 1 ? "s" : ""} sur ${deb.length} débloqué${deb.length > 1 ? "s" : ""}` + (eq.length ? ` (${esc(eq.map(s => s.nom).join(", "))})` : "") + "."
          : `Aucun de tes sorts n'est ${esc(l.nom)} pour l'instant.`;
      }
      return `
      <li class="carac-ligne${l.element ? "" : " vie"}" data-ligne="${l.id}" style="--el:${l.couleur}">
        <span class="titre">${l.icone}<span>${esc(l.nom)}</span></span>
        <span class="reglage">${enCombat ? "" : `<button type="button" data-moins aria-label="${esc(l.nom)} : retirer 1 point">−</button>`}<span class="valeur" data-valeur>0</span>${enCombat ? "" : `<button type="button" data-plus aria-label="${esc(l.nom)} : ajouter 1 point">+</button><button type="button" class="dix" data-dix aria-label="${esc(l.nom)} : ajouter 10 points">+10</button>`}</span>
        <p class="sens">${esc(l.sens)}</p>
        <p class="ici" data-ici></p>
        <p class="cout-suivant">${enCombat ? "" : `<span data-prochain></span>`}${sorts ? `<span class="sorts-el">${sorts}</span>` : ""}</p>
      </li>`;
    }).join("") + `</ul>`;
    corps += `<p class="carac-indication" id="carac-indication"></p>`;
    corps += `<p class="carac-note"><b>Ce que ça donne</b>${enCombat ? "" : " (avant de valider)"}</p><dl class="carac-apercu" id="carac-apercu"></dl>`;
    // les mots de l'aperçu, en une phrase chacun (comme le Lexique), et le Lexique en entier d'un toucher
    corps += `<details class="carac-mots"><summary>Rideau, Faux-fuyant, Ouverture, Coup de maître : c'est quoi ?</summary><dl>${MOTS_APERCU.map(m => `<dt>${esc(m.mot)}</dt><dd>${esc(m.def)}</dd>`).join("")}</dl>
      <button type="button" class="bouton" id="carac-lexique">Ouvrir le Lexique</button></details>`;
    corps += `<p class="carac-note">Dans ta barre de sorts et ton Grimoire, un coin doré marque les sorts de tes éléments.</p>`;
    if (!enCombat) corps += `<p class="carac-note">« Tout reprendre » rend tous tes points : c'est gratuit dans ce prototype.</p>`;
    // le message de « Répartir pour moi » et « Tout reprendre » s'affiche juste au-dessus de leurs boutons (toujours en vue)
    const pied = enCombat ? `<button type="button" class="bouton or" data-fermer>Fermer</button>`
      : `<p class="carac-statut" id="carac-statut" aria-live="polite"></p><button type="button" class="bouton" id="carac-auto">Répartir pour moi</button><button type="button" class="bouton" id="carac-zero">Tout reprendre</button><button type="button" class="bouton or" id="carac-valider">Valider</button>`;
    const c = UI.fenetre("d-carac", "Caractéristiques", corps, pied);
    const change = () => JSON.stringify(brouillon) !== JSON.stringify(valide);
    const ELEMENTS_PLACES = b => P.Profil.ELEMENTS.some(e => b.affinites[e] > 0);

    function apercu() {
      const a = derive(valide, p.niveau), b = derive(brouillon, p.niveau);
      const ligne = (nom, va, vb, avant, apres) => {
        avant = avant || ""; apres = apres || "";
        const t = va === vb ? `${avant}${vb}${apres}` : `<del>${avant}${va}${apres}</del> → <ins>${avant}${vb}${apres}</ins>`;
        return `<dt>${esc(nom)}</dt><dd>${t}</dd>`;
      };
      let h = "";
      P.Profil.ELEMENTS.forEach(e => { h += ligne("Dégâts " + UI.nomElement(e), PCT_PAR_POINT * a.affinites[e], PCT_PAR_POINT * b.affinites[e], "+", " %"); });
      h += ligne("Victuailles", a.victuailles, b.victuailles) + ligne("Rideau", a.rideau, b.rideau) + ligne("Faux-fuyant", a.fauxFuyant, b.fauxFuyant) +
        ligne("Ouverture", a.ouverture, b.ouverture) + ligne("Coup de maître (chance ajoutée à chaque sort)", a.coupDeMaitre, b.coupDeMaitre, "+", " %");
      $("carac-apercu").innerHTML = h;
    }
    function maj() {
      const n = reste(brouillon, p.niveau);
      $("carac-n").textContent = n;
      $("carac-n-texte").textContent = (n > 1 ? "points à placer" : n === 1 ? "point à placer" : "tout est placé") + (n > 0 && enCombat ? " après le combat" : "");
      $("carac-reste").classList.toggle("zero", n <= 0);
      // un petit reste qui ne paie plus un point dans tes éléments (paliers) : on dit pourquoi, sans le réclamer
      const pr = $("carac-petit-reste"), petit = petitReste(brouillon, n);
      pr.hidden = !petit; pr.textContent = petit;
      L.forEach(l => {
        const li = c.querySelector(`[data-ligne="${l.id}"]`), v = l.valeur(brouillon), v0 = l.valeur(valide);
        const val = li.querySelector("[data-valeur]");
        val.textContent = v;
        val.classList.toggle("change", v !== v0);
        li.classList.toggle("vide", v === 0);
        const ici = li.querySelector("[data-ici]");
        ici.textContent = !v ? "" : l.element ? `Avec tes ${pts(v)} ici : +${PCT_PAR_POINT * v} % de dégâts ${l.nom}.` : `Avec tes ${pts(v)} ici : +${v * K.VICTUAILLES.parPoint} Victuailles.`;
        if (enCombat) return;
        const cp = l.coutPlus(brouillon);
        li.querySelector("[data-moins]").disabled = v <= 0;
        li.querySelector("[data-plus]").disabled = cp > n;
        li.querySelector("[data-dix]").disabled = cp > n;
        li.querySelector("[data-prochain]").textContent = `Ajouter 1 ici coûte ${pts(cp)}` + (l.element && cp > 1 ? ` (au-delà de ${seuilPalier(v)}, c'est plus cher).` : ".");
      });
      // indication neutre : combien de tes sorts de dégâts équipés profitent de ta répartition
      const touches = degatsEquipes.filter(s => brouillon.affinites[s.element] > 0).length;
      $("carac-indication").textContent = degatsEquipes.length && ELEMENTS_PLACES(brouillon)
        ? `Tes points profitent à ${touches} de tes ${degatsEquipes.length} sorts de dégâts équipés.` : "";
      if (!enCombat) {
        const v = $("carac-valider");
        v.disabled = !change();
        v.textContent = change() ? "Valider" : "Rien à valider";
        $("carac-zero").disabled = reste(brouillon, p.niveau) >= derive(brouillon, p.niveau).capital.disponible;
      }
      apercu();
    }
    if (!enCombat) {
      L.forEach(l => {
        const li = c.querySelector(`[data-ligne="${l.id}"]`);
        const ajouter = k => {
          // ±k points, un par un, tant que le capital les paie (le coût suit les paliers du moteur)
          for (let i = 0; i < Math.abs(k); i++) {
            const essai = copie(brouillon); l.ajouter(essai, k > 0 ? 1 : -1);
            if (k > 0 && reste(essai, p.niveau) < 0) break;
            brouillon = essai;
          }
          // un réglage à la main : le message de « Répartir pour moi » ou « Tout reprendre » n'est plus vrai
          const st = $("carac-statut"); if (st) st.textContent = "";
          maj();
        };
        maintien(li.querySelector("[data-moins]"), () => ajouter(-1));
        maintien(li.querySelector("[data-plus]"), () => ajouter(1));
        maintien(li.querySelector("[data-dix]"), () => ajouter(10));
      });
      // (une bulle serait cachée par le panneau : le panneau le dit lui-même)
      const statut = t => { const e = $("carac-statut"); e.textContent = t; };
      $("carac-auto").onclick = () => {
        brouillon = Pr.repartirPourMoi(p); maj();
        const els = Pr.elementsConseilles(p).map(UI.nomElement);
        statut(els.length ? `Points placés en ${els.join(" et ")}, les éléments de tes sorts. Touche « Valider » pour les garder.` : "Aucun de tes sorts ne fait de dégâts : place tes points toi-même.");
      };
      $("carac-zero").onclick = () => { brouillon = Pr.caracVide(); maj(); statut("Tous tes points sont rendus. Place-les à nouveau, puis touche « Valider »."); };
      $("carac-valider").onclick = () => {
        if (!change()) return;
        Pr.validerCarac(brouillon);
        UI.fermer("d-carac");
        majPastille();
        const r = Pr.pointsEnAttente(), reste = Pr.pointsRestants();
        UI.toast("Caractéristiques enregistrées" + (r ? ` · encore ${pts(r)} à placer` : reste ? ` · ${pts(reste)} gardé${reste > 1 ? "s" : ""} pour plus tard` : ""));
        if (P.Tuto) P.Tuto.signal("carac-valide");
        if (o.surValider) o.surValider();
      };
    }
    const bl = $("carac-lexique"); if (bl) bl.onclick = () => { if (UI.lexique) UI.lexique("rideau"); };
    maj();
  }

  // La pastille du bouton « Caractéristiques » : les points qui restent à placer
  function majPastille() {
    const b = $("b-carac"), pa = $("pastille-carac"); if (!b || !pa) return;
    // le petit reste qui ne paie plus un point dans tes éléments n'est pas réclamé (P.Profil.pointsEnAttente)
    const n = P.Profil.profil ? P.Profil.pointsEnAttente() : 0;
    pa.hidden = !n; pa.textContent = n;
    b.setAttribute("aria-label", "Caractéristiques" + (n ? `, ${pts(n)} à placer` : ""));
  }

  // Un nouvel artisan qui commence au-dessus du niveau 1 : ses points ne sont pas placés, on le lui propose
  function proposerRepartition() {
    const UI = P.UI, Pr = P.Profil, n = Pr.pointsEnAttente();
    if (!n) return;
    const corps = `<p>Tu commences au niveau ${Pr.profil.niveau} : tu as <b>${pts(n)} de caractéristique</b> à placer.</p>
      <p class="texte-doux">Un point dans un élément : plus de dégâts avec tes sorts de cet élément. Un point en Victuailles : plus de vie. Tu peux les placer toi-même, ou me laisser faire selon les éléments de tes sorts. Tu pourras tout changer dans « Caractéristiques ».</p>`;
    const c = UI.fenetre("d-fiche", "Tes points de caractéristique", corps,
      `<button type="button" class="bouton" data-fermer>Plus tard</button><button type="button" class="bouton" id="prop-auto">Répartir pour moi</button><button type="button" class="bouton or" id="prop-choisir">Choisir moi-même</button>`);
    c.querySelector("#prop-auto").onclick = () => { Pr.validerCarac(Pr.repartirPourMoi()); UI.fermer("d-fiche"); majPastille(); UI.toast("Points placés selon les éléments de tes sorts"); };
    c.querySelector("#prop-choisir").onclick = () => { UI.fermer("d-fiche"); caracteristiques(); };
  }

  P.UI = P.UI || {};
  Object.assign(P.UI, { caracteristiques, majPastille, proposerRepartition });
})();
