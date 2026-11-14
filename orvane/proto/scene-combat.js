/*
 * Orvane, prototype : la scène de combat (Phaser), branchée sur ORVANE.Regles.
 * Aucune règle ici : portée, Rideau, Rayon, zone, dégâts prévus, Pain de route, IA, fin du combat… tout vient du moteur.
 * La scène dessine vuePour(etat, 'artisans') et anime evenementsPour(etat, evenements, 'artisans'), dans l'ordre.
 * Agir en deux temps : premier toucher = aperçu, second toucher sur la même case (ou le bouton « Lancer ») = action,
 * toucher ailleurs = annulation. Un second toucher très rapide (double toucher) recentre et n'agit jamais.
 * À la souris, l'aperçu suit le pointeur et le clic valide.
 */
window.ORVANE = window.ORVANE || {};
(() => {
  const P = ORVANE.Proto = ORVANE.Proto || {};
  const R = () => ORVANE.Regles;
  const attendre = ms => new Promise(r => setTimeout(r, ms));
  const D = ms => P.duree(ms);
  const MOI = "moi";
  const hex = P.hex;
  const VERT = 0x7FC79A, VERT_FONCE = 0x2F6B4E, OR_FONCE = 0x7A5F2E, OR_CLAIR = 0xE4C98E, CUIVRE = 0xC0703A, GRIS = 0x6E7A76, BLANC = 0xFFFDF7;
  const NOMS_EFFETS = { pousse: "repoussé", attire: "attiré", ramene: "ramené", bond: "bond", echange: "échange", "dans-le-dos": "dans le dos", retrait: "retrait", bouclier: "bouclier", entame: "entamé", ecrasement: "écrasé" };
  const DOUBLE_MS = 330, DOUBLE_PX = 30;
  // Temps des animations (ms, à vitesse normale ; « Accélérer » les divise par 2 pendant les tours des autres, P.duree).
  // But : un tour de monstre ordinaire (marcher, frapper deux fois) en 2 s au plus, les chiffres restant lisibles (plateau.flotter).
  const ATTENTE = { avantMonstre: 160, tourMonstre: 60, pasMoi: 120, pasAutre: 95, lancer: 40, degats: 170, manche: 70, effet: 100 };

  class SceneCombat extends P.SceneBase {
    constructor() { super("combat"); }
    init(d) { this.donnees = d || {}; }
    create() {
      const M = ORVANE.Monstres, d = this.donnees, reg = P.Profil.reglages;
      // Phaser réutilise l'objet scène d'un combat à l'autre : tout l'état d'affichage repart de zéro
      Object.assign(this, { fini: false, termine: false, cleTour: null, aAgi: false, finDemandee: false, finVoulue: false, dernierToucher: null, regard: null,
        curseur: null, portee: null, perdues: null, rideau: null, painChoisi: false, depuisFrise: false, _vue: null, resteMinuteur: null,
        survolCle: null, survolCase: null, ratee: null, abandon: false, marqueFiche: null, expliquerCommande: undefined, painsDonnes: null });
      // l'île où l'on se bat (proto/iles.js) : la carte du Fourneau, ou le pont de la Voie lactée
      const I = P.Iles, ile = I && I.existe(d.ile) ? d.ile : "fourneau", zone = (I && I.zone(ile)) || "fourneau";
      const carte = () => (I ? I.carteCombat(ile) : M.carte("fourneau"));
      this.ileId = ile;
      this.cielVariante = null;
      this.preparer(true);
      this.plateau = new P.Plateau(this, carte(), { combat: true, sol: I ? I.sol(ile).combat : null });
      this.vue.bornes = this.plateau.boite();
      // le combat d'entraînement du tutoriel (proto/tutoriel.js) : son Grumeau, sans Minuteur, Commande « Aucune » présélectionnée
      const T = P.Tuto && P.Tuto.combat(d.groupe);
      this.tuto = !!T;
      const artisan = P.Profil.artisan();
      this.painsDonnes = artisan.painDeRoute;
      this.etat = R().creerCombat({
        carte: carte(), graine: d.graine, artisans: [artisan],
        monstres: T ? T.monstres : M.groupe(zone, d.groupe),
        options: Object.assign({ minuteur: reg.minuteur !== false, depart: d.depart, commande: "auto", arrivage: d.arrivage || 0 }, T ? T.options : {})
      });
      (this.etat.avertissements || []).forEach(a => console.info("Orvane :", a));
      if (this.etat.commande) {
        R().choisirCommande(this.etat, T ? null : this.etat.commande.proposees[0]);
        R().choisirBonusCommande(this.etat, MOI, reg.bonus === "ristourne" ? "ristourne" : "savoirFaire");
      }
      this.pions = {}; this.objets = {}; this.enMouvement = new Set();
      this.phase = "placement"; this.anime = 0;
      // On est déjà posé sur une case dorée (on se voit sur le plateau) ; toucher une autre case dorée change de place
      this.placeDefaut();
      this.sortChoisi = null; this.apercu = null; this.vis = null;
      P.UI.mode("placement");
      P.UI.message("");
      this.montrerPlacement();
      this.synchroniser();
      this.dessiner();
      this.cadrer();
      P.Jeu.sceneActive = this;
      P.UI.toast("Combat engagé : place-toi !", { genre: "titre" });
      P.reveil();
    }
    arreter() { this.fini = true; P.UI.minuteur.arreter(); P.UI.lancer(null); clearTimeout(this.minuterieZoom); clearTimeout(this.validationDifferee); }
    pionsTouchables() { return Object.values(this.pions).filter(p => p.c.visible); }
    tousLesPions() { return Object.values(this.pions || {}); }
    objetsAuSol() { return Object.values(this.objets || {}); }
    redessiner() { this.dessiner(); }
    // Ce que voit le camp des artisans (mis en cache jusqu'au prochain changement de l'état)
    get vueEtat() { if (!this._vue) this._vue = R().vuePour(this.etat, "artisans"); return this._vue; }
    change() { this._vue = null; }
    vu(id) { return this.vueEtat.combattants.find(x => x.id === id) || null; }
    moi() { return R().trouver(this.etat, MOI); }
    monTour() { const a = R().actif(this.etat); return !!a && a.id === MOI && this.etat.phase === "combat"; }
    occupe() { return this.phase === "anime" && this.monTour(); }

    // ---------- Gestes ----------
    toucher(sx, sy, genre) {
      if (P.UI.ouvert() || this.fini) return;
      const now = Date.now(), d = this.dernierToucher;
      // double toucher : on recentre, sans jamais agir. Un toucher qui validerait un aperçu attend donc un court instant :
      // si un second toucher suit, c'était un double toucher et rien n'est joué.
      if (d && now - d.t < DOUBLE_MS && Math.hypot(d.x - sx, d.y - sy) < DOUBLE_PX) {
        clearTimeout(this.validationDifferee); this.validationDifferee = null;
        this.dernierToucher = null; this.doubleToucher(true); return;
      }
      this.dernierToucher = { t: now, x: sx, y: sy };
      if (this.occupe()) { P.UI.message("Un instant : l'action se termine", true); return; }
      const c = this.resoudre(this.sousLeDoigt(sx, sy));
      if (genre !== "mouse" && this.valideraitEn(c)) {
        clearTimeout(this.validationDifferee);
        this.validationDifferee = setTimeout(() => { this.validationDifferee = null; if (!this.fini && this.valideraitEn(c)) this.toucherCase(c); }, DOUBLE_MS);
        return;
      }
      this.toucherCase(c);
    }
    // ce toucher serait le second sur la case de l'aperçu (donc une action)
    valideraitEn(c) { const a = this.apercu; return this.phase === "joueur" && !!a && (a.type === "marche" || a.type === "sort") && P.memeCase(a.case, c); }
    // Quelle case le doigt désigne : le losange touché l'emporte s'il sert à quelque chose (case dorée, case verte,
    // case visable du Rayon, case occupée) ; sinon le personnage dessiné devant.
    resoudre(t) {
      const c0 = t.caseSol, occ = this.occupantVisible(c0), devant = t.pions.find(p => p.case);
      const dans = (l, c) => (l || []).some(x => P.memeCase(x.case || x, c));
      if (this.phase === "placement") {
        const dep = this.etat.carte.departs[this.etat.depart];
        if (dans(dep.artisans, c0) || occ) return c0;
        return devant ? devant.case : c0;
      }
      if (this.phase === "joueur") {
        if (this.sortChoisi) {
          const v = this.vis || (this.vis = R().casesVisables(this.etat, MOI, this.sortChoisi));
          const visable = c => v.cases.some(x => x.visable && P.memeCase(x.case, c));
          if (visable(c0) || occ) return c0;
          const p = t.pions.find(q => q.case && visable(q.case));
          if (p) return p.case;
          return devant ? devant.case : c0;
        }
        if (this.painChoisi) return c0;
        if (dans(this.portee, c0) || occ) return c0;
        return devant ? devant.case : c0;
      }
      if (occ) return c0;
      return devant ? devant.case : c0;
    }
    appuiLong(sx, sy) {
      if (P.UI.ouvert()) return;
      const t = this.sousLeDoigt(sx, sy);
      const o = this.occupantVisible(t.caseSol) || (t.pion ? this.vu(t.pion.id) : null);
      if (o) this.ficheDe(o.id);
    }
    doubleToucher(depuisToucher) {
      const m = this.moi();
      if (m && m.case) this.centrerSurCase(m.case, true); else this.cadrer();
      if (depuisToucher && this.apercu && this.phase === "joueur") P.UI.message("Recentré. Touche encore la case pour valider", false);
    }
    toucherCaseClavier(c) { this.curseur = c; return this.toucherCase(c); }
    ficheSousCurseur() {
      const c = (P.Jeu.clavierActif && this.curseur) || this.survolCase;
      if (!c) return;
      const o = this.occupantVisible(c);
      if (o) this.ficheDe(o.id); else P.UI.message("Personne sur cette case");
    }
    // Souris : l'aperçu suit le pointeur (comme un premier toucher), le clic valide
    survol(sx, sy) {
      if (this.fini || this.phase !== "joueur" || this.painChoisi) return;
      const t = this.sousLeDoigt(sx, sy), c = this.resoudre(t), k = P.cle(c);
      this.survolCase = c;
      if (k === this.survolCle) return;
      this.survolCle = k;
      const e = this.etat;
      if (this.sortChoisi) {
        const v = this.vis || (this.vis = R().casesVisables(e, MOI, this.sortChoisi));
        const ici = v.cases.find(x => P.memeCase(x.case, c));
        if (ici && ici.visable) {
          const ap = R().apercuSort(e, MOI, this.sortChoisi, c);
          this.apercu = ap.ok ? { type: "sort", case: c, ap, survol: true, eclat: this.apercuEclatement(c) } : null;
          P.UI.message(ap.ok ? this.messageSort(ap, c) : ap.raison, !ap.ok);
        } else if (this.apercu) { this.apercu = null; P.UI.message(ici ? ici.raison || "" : "", !!ici); }
        else return;
      } else {
        if ((this.portee || []).some(p => P.memeCase(p.case, c))) {
          const ap = R().apercuDeplacement(e, MOI, c);
          this.apercu = ap.ok ? { type: "marche", case: c, ap, survol: true } : null;
          if (ap.ok) P.UI.message(this.messageMarche(ap));
        } else if (this.apercu && this.apercu.type === "marche") { this.apercu = null; P.UI.message(""); }
        else return;
      }
      this.dessiner();
    }
    finSurvol() { this.survolCle = null; if (this.apercu && this.apercu.survol) { this.apercu = null; this.dessiner(); } }
    annuler() {
      if (this.apercu) this.apercu = null;
      else if (this.sortChoisi || this.painChoisi) { this.sortChoisi = null; this.painChoisi = false; this.vis = null; }
      else { this.regard = null; this.marqueFiche = null; }
      P.UI.message(""); this.majBarre(); this.dessiner();
    }

    // ---------- Minuteur (compté par l'affichage, API §2) ----------
    // En solo il se coupe dans les réglages ; avec un allié il reste (le moteur garde alors minuteur.actif).
    minuteurImpose() { return this.etat.combattants.filter(c => c.genre === "artisan").length > 1; }
    minuteurActif() { return this.minuteurImpose() || (!this.tuto && P.Profil.reglages.minuteur === true); }
    dureeTour() { return R().tempsDuTour(this.etat) || (R().CONST && R().CONST.MINUTEUR_S) || 45; }
    reglerMinuteur(on) {
      // l'état du moteur n'est pas touché : couper puis remettre le Minuteur reprend le temps qui restait
      if (!on && !this.minuteurImpose()) { const r = P.UI.minuteur.arreter(); if (r > 0) this.resteMinuteur = r; }
      // le combat d'entraînement du tutoriel n'a pas de Minuteur, même si on le remet dans les Réglages
      else if (on && this.minuteurActif() && (this.phase === "joueur" || this.occupe())) this.lancerMinuteur();
    }
    lancerMinuteur() {
      const total = this.dureeTour(), reste = this.resteMinuteur != null ? Math.max(.2, this.resteMinuteur / 1000) : total;
      P.UI.minuteur.demarrer(reste, () => this.surMinuteur(), total, s => {
        if (this.phase === "joueur" || this.occupe()) P.UI.annonce(`Plus que ${s} secondes : joue, ou touche « Fin du tour »`, { refus: true, duree: 3500 });
      });
    }
    surMinuteur() {
      this.resteMinuteur = 0;
      if (this.phase === "joueur") this.finDuTour(true);
      else this.finDemandee = true;
    }
    async abandonner() {
      if (this.etat.phase === "fin") return false;
      const r = R().abandonner(this.etat, MOI);
      if (!r.ok) { P.UI.message(r.raison, true); return false; }
      this.change();
      this.abandon = true;
      P.UI.minuteur.arreter();
      this.effacerChoix();
      this.phase = "anime";
      await this.animer(r.evenements);
      this.finir();
      return true;
    }
    // Pendant la Mise en place, rien n'a commencé dans le moteur : on rentre au Fourneau, le groupe reste là
    renoncer() {
      if (this.phase !== "placement") return false;
      this.fini = true;
      P.Jeu.retourBalade({ victoire: false, renonce: true, indice: this.donnees.indice });
      return true;
    }

    // ---------- Mise en place ----------
    // La case de départ par défaut : la première case dorée libre (le moteur la refuse si elle ne convient pas)
    placeDefaut() {
      const dep = this.etat.carte.departs[this.etat.depart];
      for (const c of dep.artisans || []) { try { if (R().placer(this.etat, MOI, c).ok) { this.change(); return true; } } catch (e) { /* case suivante */ } }
      return false;
    }
    // La consigne de la Mise en place ; au premier vrai combat avec une Commande, une phrase l'explique (une seule fois)
    consignePlacement() {
      const moi = this.moi(), base = moi && moi.case
        ? "Tu es sur une <b>case dorée</b>. Touche-en une autre pour changer de place, puis « Envoyez ! »."
        : "Touche une <b>case dorée</b> pour t'y placer. Les cases cuivre sont celles des monstres.";
      if (this.expliquerCommande) return "<b>La Commande</b> est un défi pour un bonus d'XP ou d'objets. Ratée, tu ne perds rien. « Changer » pour une autre, ou « Aucune ». " + base;
      return base;
    }
    montrerPlacement() {
      const reg = P.Profil.reglages;
      if (this.expliquerCommande === undefined) this.expliquerCommande = !this.tuto && !!(this.etat.commande && this.etat.commande.choisie) && P.Profil.premiereFois("commande");
      P.UI.placement(this.etat, {
        consigne: this.consignePlacement(),
        bonus: reg.bonus === "ristourne" ? "ristourne" : "savoirFaire",
        onCommande: id => { const r = R().choisirCommande(this.etat, id); this.change(); if (!r.ok) P.UI.toast(r.raison, { genre: "refus" }); P.UI.infosCombat(this.etat); P.UI.frise(this.vueEtat, null, id2 => this.depuisLaFrise(id2)); },
        onBonus: b => { reg.bonus = b; P.Profil.sauver(); if (this.etat.commande) R().choisirBonusCommande(this.etat, MOI, b); this.change(); },
        onEnvoyer: () => this.envoyer()
      });
      P.UI.frise(this.vueEtat, null, id => this.depuisLaFrise(id));
      P.UI.infosCombat(this.etat);
    }
    placer(c) {
      const r = R().placer(this.etat, MOI, c);
      if (!r.ok) { P.UI.toast(r.raison, { genre: "refus" }); return false; }
      this.change();
      if (P.Tuto) P.Tuto.signal("place", { tuto: this.tuto });
      this.synchroniser(); this.dessiner();
      const p = this.pions[MOI];
      if (p && !P.reduit()) { p.c.y -= 14; this.tween({ targets: p.c, y: p.c.y + 14, duration: 180, ease: "Bounce.Out" }); }
      return true;
    }
    async envoyer() {
      if (this.phase !== "placement") return false;
      const r = R().pret(this.etat, MOI);
      if (!r.ok) { P.UI.toast(r.raison, { genre: "refus" }); return false; }
      this.change();
      if (P.Tuto) P.Tuto.signal("envoye", { tuto: this.tuto });
      this.phase = "anime";
      this.marqueFiche = null;
      P.UI.mode("combat");
      this.cadrer();
      this.majHud();
      await this.animer(r.evenements);
      this.boucle();
      return true;
    }

    // ---------- La boucle du combat ----------
    async boucle() {
      if (this.fini) return;
      if (this.etat.phase === "fin") return this.finir();
      const a = R().actif(this.etat);
      if (!a) return;
      if (a.controle !== "joueur") {
        this.phase = "autre";
        this.majHud();
        this.dessiner();
        // un court temps pour voir qui joue (le portrait s'allume, « Tour de… ») avant que le monstre agisse
        await attendre(D(ATTENTE.avantMonstre));
        if (this.fini || this.termine) return;
        if (this.etat.phase === "fin") return this.finir();
        let r;
        try { r = R().iaJoue(this.etat, a.id); } catch (err) { console.error("Le moteur a échoué pendant le tour de " + a.nom, err); r = { ok: false, raison: String(err && err.message) }; }
        if (!r.ok) {
          // le moteur refuse ou échoue : on passe ce tour pour ne pas bloquer le combat
          console.warn("Tour de " + a.nom + " passé :", r.raison);
          try { r = R().finDuTour(this.etat, a.id); } catch (err) { r = { ok: false }; }
          if (!r.ok) { P.UI.annonce("Le combat est bloqué : " + (r.raison || "erreur du moteur"), { refus: true, duree: 8000 }); return; }
        }
        this.change();
        await this.animer(r.evenements || []);
        return this.boucle();
      }
      this.tourDuJoueur();
    }
    tourDuJoueur() {
      this.phase = "joueur";
      this.change();
      const cle = this.etat.manche + ":" + this.etat.tourNumero + ":" + this.etat.indexActif;
      if (cle !== this.cleTour) {
        this.cleTour = cle; this.aAgi = false; this.finDemandee = false; this.finVoulue = false; this.resteMinuteur = null;
        this.sortChoisi = null; this.apercu = null; this.painChoisi = false;
        if (this.minuteurActif()) {
          this.lancerMinuteur();
          // le premier tour avec un Minuteur : on le dit une fois (et où le couper)
          if (P.Profil.premiereFois("minuteur") && !this.minuteurImpose()) P.UI.annonce(`Minuteur : ${Math.round(this.dureeTour())} s par tour (à couper dans les Réglages, en haut).`, { duree: 7000 });
        } else P.UI.minuteur.arreter();
      }
      this.calculerPortee();
      this.majHud();
      this.dessiner();
      if (this.finVoulue) { this.finVoulue = false; this.finDuTour(); return; }
      if (this.finDemandee) { this.finDemandee = false; this.finDuTour(true); }
    }
    async finDuTour(parMinuteur) {
      // pendant sa propre animation, la demande attend la fin de l'action (rien ne se perd)
      if (!parMinuteur && this.occupe()) { this.finVoulue = true; P.UI.message("Fin du tour dès que l'action est finie"); return false; }
      if (this.phase !== "joueur") return false;
      const absent = parMinuteur && !this.aAgi;
      const r = R().finDuTour(this.etat, MOI, absent ? { absent: true } : undefined);
      if (!r.ok) { P.UI.message(r.raison, true); return false; }
      this.change();
      if (!parMinuteur && P.Tuto) P.Tuto.signal("fin-tour", { tuto: this.tuto });
      P.UI.minuteur.arreter(); this.resteMinuteur = null;
      // l'absence est annoncée par l'événement « absent » (avec le compte) ; sinon on dit pourquoi le tour finit
      if (parMinuteur && !absent) P.UI.annonce("Temps écoulé : fin du tour", { refus: true, duree: 3500 });
      this.effacerChoix();
      this.phase = "anime";
      this.majBarre(); this.dessiner();
      await this.animer(r.evenements);
      this.boucle();
      return true;
    }
    async agir(fn, signal) {
      if (this.phase !== "joueur") return false;
      const r = fn();
      if (!r.ok) { P.UI.message(r.raison, true); return false; }
      this.change();
      if (signal && P.Tuto) P.Tuto.signal(signal, { tuto: this.tuto });
      this.aAgi = true;
      // après une action, plus rien n'est choisi : le toucher suivant ne relance pas le sort par mégarde
      this.apercu = null; this.vis = null; this.sortChoisi = null; this.painChoisi = false; this.regard = null; this.survolCle = null;
      this.phase = "anime";
      this.majBarre();
      this.dessiner();
      await this.animer(r.evenements);
      this.boucle();
      return true;
    }
    async finir() {
      if (this.termine) return; this.termine = true;
      this.phase = "fin";
      P.UI.minuteur.arreter();
      this.effacerChoix(); this.dessiner(); this.majBarre();
      ["d-fiche", "d-reglages"].forEach(id => P.UI.fermer(id));
      const res = R().resultat(this.etat);
      const victoire = !!(res.addition && res.addition.victoire);
      // les Pains de route mangés au-delà de ceux du combat sortent de la réserve du Sac
      const moiFin = this.moi();
      if (moiFin && this.painsDonnes != null) P.Profil.mangerPains(this.painsDonnes - Math.max(0, moiFin.pain || 0));
      P.UI.annonce(victoire ? "Victoire ! Voici l'Addition" : "Combat terminé", { refus: !victoire, duree: 9000 });
      // tutoriel : le combat d'entraînement gagné donne une prime d'XP, de quoi passer au niveau suivant
      if (P.Tuto) P.Tuto.signal("fin-combat", { tuto: this.tuto, victoire });
      const prime = this.tuto && victoire && P.Tuto ? P.Tuto.prime(res.addition) : 0;
      let compte = res.addition || {};
      if (prime) compte = Object.assign({}, compte, { xp: Object.assign({}, compte.xp, { [MOI]: ((compte.xp && compte.xp[MOI]) || 0) + prime }) });
      const gain = P.Profil.encaisser(compte, MOI);
      await attendre(D(700));
      if (this.fini) return;
      ["d-fiche", "d-reglages"].forEach(id => P.UI.fermer(id));
      P.UI.addition(res, gain, {
        bonus: P.Profil.reglages.bonus, ratee: this.ratee, arrivage: this.donnees.arrivage, abandon: this.abandon, prime,
        onRetour: () => P.Jeu.retourBalade({ victoire, indice: this.donnees.indice })
      });
    }

    // ---------- Portée et aperçus (tout vient du moteur) ----------
    calculerPortee() {
      const e = this.etat, moi = this.moi();
      if (!moi || !moi.vivant || this.phase !== "joueur") { this.portee = null; return; }
      this.portee = R().deplacementsPossibles(e, MOI);
      const sans = R().deplacementsPossibles(e, MOI, { sansRideau: true });
      const k = new Set(this.portee.map(p => P.cle(p.case)));
      this.perdues = sans.filter(p => !k.has(P.cle(p.case))).map(p => p.case);
      this.rideau = R().apercuRideau(e, MOI);
      if (this.sortChoisi) this.vis = R().casesVisables(e, MOI, this.sortChoisi);
    }
    effacerChoix() { this.sortChoisi = null; this.apercu = null; this.vis = null; this.painChoisi = false; this.portee = null; this.regard = null; this.marqueFiche = null; P.UI.lancer(null); }

    // Toucher une case (déjà résolue) : le cœur de « agir en deux temps »
    toucherCase(c) {
      if (this.fini || !c) return false;
      if (this.phase === "placement") {
        const dep = this.etat.carte.departs[this.etat.depart];
        if (dep.artisans.some(x => P.memeCase(x, c))) return this.placer(c);
        const o = this.occupantVisible(c);
        if (o) return this.ficheDe(o.id);
        P.UI.toast("Touche une case dorée pour te placer");
        return false;
      }
      if (this.phase !== "joueur") {
        const o = this.occupantVisible(c);
        if (o) this.montrerRegard(o); else if (this.regard) { this.regard = null; this.dessiner(); }
        return false;
      }
      const e = this.etat;
      if (this.painChoisi) { this.painChoisi = false; this.apercu = null; this.majBarre(); }
      if (this.sortChoisi) {
        if (this.apercu && this.apercu.type === "sort" && P.memeCase(this.apercu.case, c)) return this.valider();
        const v = this.vis || (this.vis = R().casesVisables(e, MOI, this.sortChoisi));
        const ici = v.cases.find(x => P.memeCase(x.case, c));
        if (ici && ici.visable) {
          const ap = R().apercuSort(e, MOI, this.sortChoisi, c);
          if (ap.ok) { this.apercu = { type: "sort", case: c, ap, eclat: this.apercuEclatement(c) }; P.UI.message(this.messageSort(ap, c), false); }
          else { this.apercu = null; P.UI.message(ap.raison, true); }
        } else if (ici) { this.apercu = null; P.UI.message(ici.raison || "Impossible ici", true); }
        else if (this.apercu) { this.apercu = null; P.UI.message("Aperçu annulé"); }
        else {
          const s = this.barreActuelle().find(x => x.id === this.sortChoisi);
          this.sortChoisi = null; this.vis = null;
          P.UI.message(`${s ? s.nom : "Sort"} : rangé (case hors du Rayon)`); this.majBarre();
        }
        this.dessiner();
        return !!this.apercu;
      }
      // Marche
      if (this.apercu && this.apercu.type === "marche" && P.memeCase(this.apercu.case, c)) return this.valider();
      const moi = this.moi();
      const o = this.occupantVisible(c);
      if (o && o.id !== MOI) {
        this.apercu = null; this.montrerRegard(o);
        P.UI.message(`${o.nom} : ${Math.max(0, o.victuailles)} Victuailles. En cuivre : où il peut aller`);
        return true;
      }
      this.regard = null;
      if (P.memeCase(c, moi.case)) { this.apercu = null; P.UI.message("C'est toi. Appui long : ta fiche"); this.dessiner(); return false; }
      const ap = R().apercuDeplacement(e, MOI, c);
      if (ap.ok) { this.apercu = { type: "marche", case: c, ap }; P.UI.message(this.messageMarche(ap), false); }
      else if (this.plateau.existe(c[0], c[1]) && /Rideau/.test(ap.raison)) { this.apercu = { type: "refus", case: c, raison: ap.raison }; P.UI.message(ap.raison, true); }
      else {
        const avait = !!this.apercu; this.apercu = null;
        const sol = this.plateau.sol(c[0], c[1]), existe = this.plateau.existe(c[0], c[1]);
        P.UI.message(sol ? ap.raison : existe ? "Un décor bloque cette case" : avait ? "Aperçu annulé" : "Hors du terrain", sol || existe || !avait);
      }
      this.dessiner();
      return !!ap.ok;
    }
    // Le second toucher, ou le bouton « Marcher / Lancer / Manger »
    valider() {
      const a = this.apercu;
      if (this.phase !== "joueur" || !a) return false;
      if (a.type === "marche") return this.agir(() => R().deplacer(this.etat, MOI, a.case), "deplace");
      if (a.type === "sort" && this.sortChoisi) { const id = this.sortChoisi; return this.agir(() => R().lancer(this.etat, MOI, id, a.case), "lance"); }
      if (a.type === "pain") return this.agir(() => R().utiliserPainDeRoute(this.etat, MOI));
      return false;
    }
    majLancer() {
      const a = this.apercu, t = a && { marche: "Marcher", sort: "Lancer", pain: "Manger" }[a.type];
      if (this.phase !== "joueur" || !t) { P.UI.lancer(null); return; }
      P.UI.lancer({ texte: t, aide: t + " (comme toucher encore la case)", onClick: () => this.valider() });
    }
    texteperte(p) { const l = []; if (p.pas) l.push(`−${p.pas} Pas`); if (p.cm) l.push(`−${p.cm} CM`); return l.join(", "); }
    messageMarche(ap) { return `Marcher ici : −${ap.cout} Pas` + (ap.perte && (ap.perte.pas || ap.perte.cm) ? ` · Rideau ${this.texteperte(ap.perte)}` : ""); }
    messageSort(ap, c) {
      const s = this.barreActuelle().find(x => x.id === this.sortChoisi);
      const o = this.occupantVisible(c);
      const ec = this.apercu && this.apercu.eclat;
      const n = ap.cibles.filter(k => !k.allie && k.degats).length;
      let t = `${s ? s.nom : "Sort"} → ${o ? o.nom : "la case"}` + (n > (o && o.camp !== "artisans" ? 1 : 0) ? ` (${n} ennemi${n > 1 ? "s" : ""} touché${n > 1 ? "s" : ""})` : "");
      if (ec || (ap.poses || []).some(p => (p.quoi || p.type) === "fournee")) t += ` · éclate dans ${(ec && ec.tours) || 1} t.`;
      return t;
    }
    occupantVisible(c) { return this.vueEtat.combattants.find(x => x.vivant && x.case && P.memeCase(x.case, c)) || null; }
    montrerRegard(o) {
      // la portée de ce combattant à son prochain tour (moteur), et son nom ; effacée dès qu'un tour commence ou qu'il bouge
      this.regard = { id: o.id, cases: R().deplacementsPossibles(this.etat, o.id).map(p => p.case) };
      this.dessiner();
    }
    oublierRegard(id) { if (this.regard && (id == null || this.regard.id === id)) { this.regard = null; this.dessiner(); } }
    // Fournée qui cuit : où elle éclatera, et ce qu'elle ferait si elle éclatait maintenant (le moteur le calcule sur une copie de l'état)
    apercuEclatement(c) {
      const moi = this.moi(), s = (moi.sorts || []).find(x => x.id === this.sortChoisi);
      const b = s && (s.effets || []).find(x => x.type === "pose" && x.quoi === "fournee" && (x.tours || 0) > 0);
      if (!b) return null;
      // le moteur donne la zone d'éclatement et ce qu'elle ferait si elle éclatait maintenant (apercuSort → eclatement)
      let zone = [c], cibles = [];
      try {
        const ap = R().apercuSort(this.etat, MOI, s.id, c), ec = ap.ok && ap.eclatement;
        if (ec) { zone = ec.zone; cibles = ec.cibles.filter(k => k.degats && !k.allie); }
      } catch (e) { cibles = []; }
      return { zone, cibles, tours: b.tours, element: s.element };
    }

    // ---------- Sorts et objets ----------
    barreActuelle() { return R().barre(this.etat, MOI); }
    choisirSort(id) {
      if (this.occupe()) { P.UI.message("Un instant : l'action se termine", true); return false; }
      if (this.phase !== "joueur") { P.UI.message(this.phase === "fin" ? "Le combat est terminé" : "Ce n'est pas ton tour", true); return false; }
      const s = this.barreActuelle().find(x => x.id === id);
      if (!s) return false;
      this.painChoisi = false; this.survolCle = null;
      if (this.sortChoisi === id) { this.sortChoisi = null; this.apercu = null; this.vis = null; P.UI.message(`${s.nom} : rangé`); this.majBarre(); this.dessiner(); return true; }
      if (!s.disponible) {
        this.sortChoisi = null; this.apercu = null; this.vis = null;
        // le moteur donne la première raison ; une relance en cours (s.relance, du moteur) se dit aussi
        const relance = s.relance > 0 && !/^Revient/.test(s.raison || "") ? ` · revient dans ${s.relance} tour${s.relance > 1 ? "s" : ""}` : "";
        P.UI.message(`${s.nom} : ${s.raison}${relance}`, true);
        this.majBarre(); this.dessiner();
        return false;
      }
      this.sortChoisi = id; this.apercu = null;
      this.vis = R().casesVisables(this.etat, MOI, id);
      const r = s.rayon;
      P.UI.message(`${s.nom} · ${s.cm} CM · Rayon ${r.min === r.max ? r.max : r.min + " à " + r.max} : touche une case dorée`);
      // un sort qui se lance sur soi : l'aperçu vient tout de suite, on valide en touchant encore sa case
      const n = (this.moi().sorts || []).find(x => x.id === id);
      if (n && (n.cible === "soi" || (r.max === 0 && r.min === 0))) this.toucherCase(this.moi().case);
      this.majBarre(); this.dessiner();
      return true;
    }
    // Le Pain de route : le moteur dit s'il est possible (et ce qu'il rendrait), en l'essayant sur une copie de l'état
    etatPain(actif) {
      const moi = this.moi(), PR = (R().CONST && R().CONST.PAIN_DE_ROUTE) || {};
      const o = { cm: PR.cm || 2, valeur: R().valeurPain(moi.niveau), reste: moi.pain, choisi: this.painChoisi, disponible: false, raison: null };
      if (!actif) { o.raison = this.occupe() ? "Un instant : l'action se termine" : this.phase === "fin" ? "Le combat est terminé" : "Ce n'est pas ton tour"; return o; }
      try {
        const r = R().apercuPain(this.etat, MOI);
        o.disponible = r.disponible; o.raison = r.raison; if (r.disponible) o.valeur = r.valeur;
      } catch (err) { o.raison = "Indisponible"; }
      return o;
    }
    toucherPain() {
      if (this.occupe()) { P.UI.message("Un instant : l'action se termine", true); return false; }
      if (this.phase !== "joueur") { P.UI.message("Ce n'est pas ton tour", true); return false; }
      if (this.painChoisi) return this.valider();
      const pain = this.etatPain(true);
      if (!pain.disponible) { P.UI.message("Pain de route : " + pain.raison, true); return false; }
      this.sortChoisi = null; this.vis = null;
      this.painChoisi = true;
      this.apercu = { type: "pain", valeur: pain.valeur };
      P.UI.message(`Pain de route : +${pain.valeur} Victuailles, −${pain.cm} CM`);
      this.majBarre(); this.dessiner();
      return true;
    }

    // ---------- Interface ----------
    majHud() {
      const vue = this.vueEtat, a = R().actif(this.etat), moi = vue.combattants.find(c => c.id === MOI);
      P.UI.frise(vue, a ? a.id : null, id => this.depuisLaFrise(id));
      P.UI.infosCombat(this.etat, { ratee: this.ratee, absences: moi && this.enGroupe() ? moi.absences : 0 });
      if (moi) P.UI.jauges(moi);
      if (this.phase === "autre" && a) P.UI.messageFond(`Tour de ${a.nom}…`);
      else if (this.phase === "joueur" && !this.sortChoisi && !this.apercu && !this.painChoisi) P.UI.messageFond(this.messageAToi());
      this.majBarre();
    }
    // Ce qu'on peut faire à son tour, d'après le moteur : marcher (cases vertes), lancer un sort (R.barre), ou rien
    messageAToi() {
      const marcher = (this.portee || []).length > 0, sort = R().barre(this.etat, MOI).some(b => b.disponible);
      if (marcher && sort) return "À toi : touche une case pour marcher, ou choisis un sort";
      if (sort) return "À toi : plus de Pas, choisis un sort";
      if (marcher) return "À toi : touche une case pour marcher, ou « Fin du tour »";
      return "Plus rien à faire ce tour-ci : touche « Fin du tour »";
    }
    majBarre() {
      const moi = this.moi(), actif = this.phase === "joueur";
      P.UI.barre({
        sorts: R().barre(this.etat, MOI), fiches: moi.sorts, choisi: this.sortChoisi, actif, occupe: this.occupe(), pain: this.etatPain(actif),
        fin: this.phase === "fin" || this.etat.phase === "fin",
        onSort: s => this.choisirSort(s.id), onLong: s => this.ficheSortDe(s.id), onPain: () => this.toucherPain()
      });
      // « Accélérer » pendant les tours des autres (pas pendant la Mise en place, ni une fois le combat fini)
      P.UI.accelere(!this.fini && this.etat.phase === "combat" && (this.phase === "autre" || (this.phase === "anime" && !this.monTour())));
      this.majLancer();
    }
    depuisLaFrise(id) { this.depuisFrise = true; this.ficheDe(id); }
    ficheDe(id) {
      const c = this.vu(id) || (id === MOI ? this.moi() : null);
      if (!c) return;
      const f = c.fiche && (ORVANE.Monstres.FICHES[c.fiche] || (P.Tuto && P.Tuto.fiche(c.fiche)));
      const d = P.UI.ficheCombattant(c, { portrait: P.portraitDe(c), texte: f ? f.texte : (c.genre === "artisan" ? (P.Profil.classe(c.classe) || {}).jeu : "") });
      if (c.case && this.depuisFrise) {
        // la caméra amène le combattant dans la partie du terrain que la fiche ne cache pas, et le marque
        this.marqueFiche = c.case.slice(); this.dessiner();
        d.addEventListener("close", () => { this.marqueFiche = null; if (!this.fini) this.dessiner(); }, { once: true });
        requestAnimationFrame(() => {
          const r = P.UI.rectUtile(), b = d.getBoundingClientRect();
          let z = r;
          if (b.top > r.y + 90 && b.top < r.y + r.h) z = { x: r.x, y: r.y, w: r.w, h: b.top - r.y };
          else if (b.left > r.x + r.w * .4) z = { x: r.x, y: r.y, w: b.left - r.x, h: r.h };
          else if (b.right < r.x + r.w * .6) z = { x: b.right, y: r.y, w: r.x + r.w - b.right, h: r.h };
          const p = P.iso(c.case[0], c.case[1]);
          this.vue.animerVers(p.x, p.y - 24, z.x + z.w / 2, z.y + z.h / 2, P.duree(380));
        });
      }
      this.depuisFrise = false;
    }
    ficheSortDe(id) {
      const b = this.barreActuelle().find(x => x.id === id);
      const s = (this.moi().sorts || []).find(x => x.id === id) || P.Profil.trouverSort(id);
      if (s) P.UI.ficheSort(s, b);
    }

    // ---------- Dessin des cases (seulement quand quelque chose change) ----------
    dessiner() {
      const pl = this.plateau;
      pl.effacer();
      if (this.fini) return;
      const e = this.etat;
      if (this.marqueFiche) { pl.losange(this.marqueFiche, { stroke: OR_CLAIR, largeur: 3, retrait: 2 }); pl.losange(this.marqueFiche, { stroke: 0x0D2D2A, largeur: 1, retrait: 5 }); }
      if (this.phase === "placement") {
        const dep = e.carte.departs[e.depart];
        dep.artisans.forEach(c => pl.losange(c, { fill: 0xE0B65A, alpha: .78, stroke: OR_FONCE, largeur: 2.2 }));
        dep.monstres.forEach(c => pl.losange(c, { fill: CUIVRE, alpha: .45, stroke: 0x8A4A22, largeur: 1.6 }));
        const moi = this.moi();
        if (moi.case) pl.losange(moi.case, { stroke: BLANC, largeur: 2.6, retrait: 4 });
        P.reveil(); this.dessinerCurseur(); this.majLancer(); return;
      }
      if (this.regard) {
        this.regard.cases.forEach(c => pl.losange(c, { fill: CUIVRE, alpha: .28, stroke: CUIVRE, strokeAlpha: .5, largeur: 1 }));
        const p = this.pions[this.regard.id], c = this.vu(this.regard.id);
        if (p && c && p.c.visible) pl.etiquette(p.c.x, p.c.y - p.hauteur - 30, `${c.nom} · ${Math.max(0, c.victuailles)} Victuailles`, { taille: 13, couleur: "#F2EDE0" });
      }
      if (this.phase !== "joueur") { P.reveil(); this.dessinerCurseur(); this.majLancer(); return; }
      const moi = this.moi();
      if (this.sortChoisi) this.dessinerSort(moi);
      else if (this.painChoisi) {
        const p = this.pions[MOI];
        pl.losange(moi.case, { fill: 0x7FC79A, alpha: .5, stroke: VERT_FONCE });
        if (p) pl.etiquette(p.c.x, p.c.y - p.hauteur - 30, `+${(this.apercu && this.apercu.valeur) || R().valeurPain(moi.niveau)} Victuailles`, { couleur: "#A8E6BE" });
      } else this.dessinerMarche(moi);
      P.reveil();
      this.dessinerCurseur();
      this.majLancer();
    }
    // le corps de son artisan (et ce qui est au-dessus) : les étiquettes ne s'y posent pas
    obstacleMoi() {
      const p = this.pions[MOI];
      if (!p || !p.c.visible) return [];
      return [{ x: p.c.x - 22, right: p.c.x + 22, y: p.c.y - p.hauteur - 28, bottom: p.c.y + 2 }];
    }
    dessinerMarche(moi) {
      const pl = this.plateau;
      (this.perdues || []).forEach(c => pl.losange(c, { fill: GRIS, alpha: .35, barre: 0x2B3B38 }));
      (this.portee || []).forEach(p => pl.losange(p.case, { fill: VERT, alpha: .42, stroke: VERT_FONCE, strokeAlpha: .55, largeur: 1 }));
      // au contact : ce que coûterait de sortir (l'aperçu d'une marche le dit déjà sur son chemin)
      if (this.rideau && this.rideau.auContact && !(this.apercu && this.apercu.type === "marche")) {
        const p = this.pions[MOI];
        const t = this.rideau.pris ? "Pris dans le Rideau" : (this.rideau.perte.pas || this.rideau.perte.cm) ? `Sortir : ${this.texteperte(this.rideau.perte)}` : "";
        if (t && p) pl.etiquette(p.c.x, p.c.y + 30, t, { taille: 13, couleur: this.rideau.pris ? "#FF9A85" : "#E4C98E" });
      }
      const a = this.apercu;
      pl.obstacles = this.obstacleMoi();
      if (a && a.type === "marche") {
        const ap = a.ap;
        ap.chemin.slice(1).forEach(c => pl.losange(c, { fill: VERT, alpha: .8, stroke: 0xFFFDF7, strokeAlpha: .8, largeur: 1.4, point: 0x1F6B45, pointRayon: 3.5 }));
        pl.losange(a.case, { stroke: BLANC, largeur: 3, retrait: 3 });
        const p = P.iso(a.case[0], a.case[1]);
        pl.etiquette(p.x, p.y + 6, `−${ap.cout} Pas`, { taille: 16, couleur: "#BFF0CF" });
        pl.etiquette(p.x, p.y + 30, `reste ${ap.pasRestants} Pas, ${ap.cmRestants} CM`, { taille: 12, couleur: "#D7E8DD" });
        (ap.rideau || []).forEach(r => {
          const q = P.iso(r.case[0], r.case[1]);
          pl.losange(r.case, { stroke: 0xE07A52, largeur: 2.4, retrait: 5 });
          pl.etiquette(q.x, q.y - 4, `Rideau : ${this.texteperte(r)}`, { taille: 13, couleur: "#FFC4A8" });
        });
      } else if (a && a.type === "refus") {
        const p = P.iso(a.case[0], a.case[1]);
        pl.losange(a.case, { fill: 0xC8553D, alpha: .4, barre: 0xFFFDF7 });
        pl.etiquette(p.x, p.y - 14, a.raison, { taille: 13, couleur: "#FF9A85" });
      }
    }
    dessinerSort(moi) {
      const pl = this.plateau, v = this.vis;
      if (!v) return;
      v.cases.forEach(x => {
        // Rayon : or plein avec contour là où l'on voit, or pâle hachuré là où la vue est coupée
        if (x.vue) pl.losange(x.case, { fill: 0xD9A441, alpha: x.visable ? .58 : .34, stroke: 0x6B5222, strokeAlpha: .9, largeur: 1.6 });
        else pl.losange(x.case, { fill: 0xD9A441, alpha: .14, hachure: 0x9A7432, hachureAlpha: .85, hachureLargeur: 1.4 });
      });
      // nombre par cible atteint : le moteur refuse la case (« Déjà servi à cette cible ») ; on l'écrit au-dessus de la cible
      v.cases.filter(x => /^Déjà servi/.test(x.raison || "")).forEach(x => {
        const o = this.occupantVisible(x.case), p = o && this.pions[o.id];
        if (p && p.c.visible) pl.etiquette(p.c.x, p.c.y - p.hauteur - 30, "déjà servi ce tour", { taille: 12, couleur: "#FF9A85" });
      });
      const a = this.apercu;
      if (!a || a.type !== "sort") return;
      const ap = a.ap, s = (moi.sorts || []).find(x => x.id === this.sortChoisi) || {};
      const col = s.element && s.element !== "N" ? hex(P.UI.couleurElement(s.element)) : OR_CLAIR;
      ap.zone.forEach(c => pl.losange(c, { fill: col, alpha: .62, stroke: BLANC, strokeAlpha: .55, largeur: 1 }));
      pl.losange(a.case, { stroke: BLANC, largeur: 3, retrait: 3 });
      // fournée : la zone où elle éclatera, hachurée dans la couleur de l'élément, et les dégâts si elle éclatait maintenant
      const ec = a.eclat;
      if (ec) ec.zone.forEach(c => pl.losange(c, { fill: col, alpha: .22, hachure: col, hachureAlpha: .9, hachureLargeur: 1.6, stroke: col, strokeAlpha: .9, largeur: 1.4 }));
      // les étiquettes des objets posés ne se posent pas sur un personnage
      pl.obstacles = Object.values(this.pions).filter(p => p.c.visible).map(p => ({ x: p.c.x - 20, right: p.c.x + 20, y: p.c.y - p.hauteur - 28, bottom: p.c.y + 2 }));
      (ap.poses || []).forEach(po => {
        const c = po.case || a.case, q = P.iso(c[0], c[1]), quoi = po.quoi || po.type;
        const nom = { fournee: "Fournée", piege: "Piège", nappe: "Nappe", graine: "Graine", ustensile: "Ustensile", invoque: "Commis", bond: "Bond" }[quoi] || "";
        const t = quoi === "fournee" && po.tours ? `Fournée : éclate dans ${po.tours} t.` : nom + (po.tours ? ` (${po.tours} t.)` : "");
        if (nom) pl.etiquette(q.x, q.y - 18, t, { taille: 13, couleur: "#F2EDE0" });
      });
      // les étiquettes des cibles ne recouvrent pas les barres de Victuailles
      pl.obstacles = Object.values(this.pions).filter(p => p.c.visible).map(p => ({ x: p.c.x - 27, right: p.c.x + 27, y: p.c.y - p.hauteur - 17, bottom: p.c.y - p.hauteur - 2 }));
      const principal = this.occupantVisible(a.case);
      const etiqueter = (ci, prefixe, couleurs) => {
        const p = this.pions[ci.id]; if (!p || !p.c.visible) return;
        const x = p.c.x, y = p.c.y - p.hauteur - 30;
        let t = "", coul = "#FFFDF7";
        if (ci.degats) { t = ci.degats.min === ci.degats.max ? `−${ci.degats.min}` : `−${ci.degats.min} à −${ci.degats.max}`; coul = couleurs || (ci.allie ? "#FF9A85" : "#FFE2C8"); }
        else if (ci.soin) { t = `+${ci.soin.min} à +${ci.soin.max}`; coul = "#A8E6BE"; }
        else if (ci.bouclier) { t = `+${ci.bouclier.min != null ? ci.bouclier.min : ci.bouclier} bouclier`; coul = "#CFE3F0"; }
        if (prefixe && t) t = prefixe + t;
        const extra = (ci.effets || []).map(f => NOMS_EFFETS[f.type] || (f.type === "etat" ? (P.NOMS_ETATS[f.etat] || f.etat) : "")).filter(Boolean);
        // une seule étiquette par cible : la cible visée est nommée (dans une mêlée, on sait qui prend), puis les effets
        const haut = [ci.nom].concat([...new Set(extra)]).join(" · ");
        const texte = [haut, t].filter(Boolean).join("\n");
        const et = texte ? pl.etiquette(x, y, texte, { taille: t ? 14 : 12, couleur: t ? coul : "#E4C98E" }) : null;
        // toque renversée : la cible tomberait (pâle si ce n'est que possible)
        if (ci.tombe && et) { const bb = et.getBounds(); pl.image(bb.right + 12 * pl.echelle(), bb.centerY, "ic-toqueRenversee", { taille: 22 * pl.echelle(), alpha: ci.tombe === "sur" ? 1 : .45 }); }
      };
      ap.cibles.forEach(ci => etiqueter(ci));
      if (ec) ec.cibles.filter(ci => !ap.cibles.some(k => k.id === ci.id && k.degats)).forEach(ci => etiqueter(ci, "à l'éclatement ", "#FFD36E"));
    }
    dessinerCurseur() {
      const g = this.plateau.calqueHaut; g.clear();
      if (!this.curseur || !P.Jeu.clavierActif) return;
      this.plateau.losange(this.curseur, { stroke: BLANC, largeur: 2.5, retrait: 1 }, g);
      this.plateau.losange(this.curseur, { stroke: 0x0D2D2A, largeur: 1, retrait: 4 }, g);
    }

    // ---------- Pions et objets au sol, d'après ce que voit le camp des artisans ----------
    creerPion(c) {
      let cle = "perso-moi", equipe = "moi";
      if (c.genre === "artisan") { cle = c.id === MOI ? "perso-moi" : "perso-" + c.classe; equipe = c.id === MOI ? "moi" : "allie"; }
      else if (c.genre === "monstre") { cle = "monstre-" + c.fiche; equipe = "ennemi"; }
      else if (c.genre === "commis") { cle = "commis"; equipe = c.camp === "artisans" ? "allie" : "ennemi"; }
      else { cle = "objet-ustensile"; equipe = "neutre"; }
      if (!this.textures.exists(cle)) cle = c.camp === "artisans" ? "perso-moi" : "monstre-grumeau";
      const taille = c.genre === "monstre" && c.chef ? 24 : 19;
      const p = new P.Pion(this.plateau, { cle, equipe, taille, chiffre: true });
      p.id = c.id;
      return p;
    }
    synchroniser() {
      const vue = this.vueEtat, a = R().actif(this.etat), vus = new Set();
      vue.combattants.forEach(c => {
        if (c.genre === "ustensile" && !c.case) return;
        let p = this.pions[c.id];
        if (!p) p = this.pions[c.id] = this.creerPion(c);
        vus.add(c.id);
        if (!this.enMouvement.has(c.id)) { p.placer(c.vivant ? c.case : null); p.c.setAlpha(1).setAngle(0); }
        if (c.orientation) { const s = c.orientation[0] - c.orientation[1]; if (s) p.orienter(s < 0 ? -1 : 1); }
        p.victuailles(Math.max(0, c.victuailles), c.victuaillesMax, c.entame || 0, c.vivant && c.genre !== "ustensile");
        p.etats(c.vivant ? (c.etats || []).map(x => ({ etat: x.etat, couches: x.couches })) : []);
        p.actif(this.phase !== "placement" && a && a.id === c.id && c.vivant);
      });
      Object.keys(this.pions).forEach(id => { if (!vus.has(id)) this.pions[id].placer(null); });
      // objets au sol
      const ids = new Set();
      (vue.sol || []).forEach(o => {
        if (o.quoi === "nappe" || o.quoi === "ustensile") return;
        ids.add(o.id);
        if (!this.objets[o.id]) this.objets[o.id] = this.creerObjet(o);
        this.majObjet(this.objets[o.id], o);
      });
      Object.keys(this.objets).forEach(id => { if (!ids.has(id)) { this.objets[id].destroy(); delete this.objets[id]; } });
      // nappes, et le losange de chaque objet posé (visible même sous un personnage)
      const g = this.plateau.calqueSol; g.clear();
      (vue.sol || []).forEach(o => {
        const col = o.element && o.element !== "N" ? hex(P.UI.couleurElement(o.element)) : 0x9EA4AB;
        if (o.quoi === "nappe") (o.cases || [o.case]).forEach(c => this.plateau.losange(c, { fill: col, alpha: .26, hachure: col, hachureAlpha: .45, retrait: 3 }, g));
        else if (o.case && o.quoi !== "ustensile") {
          // une fournée : là où elle éclatera, en hachures pâles
          if (o.quoi === "fournee" && o.zone) {
            let z = [];
            try { z = R().casesZone(this.etat, o.zone, o.origine || o.case, o.case).map(k => k.case); } catch (e) { z = []; }
            z.forEach(c => this.plateau.losange(c, { hachure: col, hachureAlpha: .55, hachureLargeur: 1.3, retrait: 4 }, g));
          }
          this.plateau.losange(o.case, { fill: col, alpha: .2, stroke: col, strokeAlpha: .95, largeur: 2.4, retrait: 3 }, g);
        }
      });
      this.plateau.transparence(this.tousLesPions(), this.objetsAuSol());
      P.reveil();
    }
    creerObjet(o) {
      const p = P.iso(o.case[0], o.case[1]), cle = "objet-" + o.quoi;
      const c = this.add.container(p.x, p.y); this.plateau.ajoute(c);
      c.setDepth(100 + (o.case[0] + o.case[1]) * 10 + 2);
      const inf = P.Textures.info(cle);
      if (inf) c.add(this.add.image(0, 2, cle).setOrigin(inf.ox, inf.oy).setScale(1.2 / inf.k).setAlpha(o.cache ? .7 : 1));
      if (o.reste != null || o.quoi === "fournee" || o.quoi === "graine") {
        // le compte à rebours au-dessus de tout (jamais caché par un décor ou un personnage)
        const t = this.add.text(p.x - 17, p.y - 5, "", { fontFamily: P.POLICE, fontSize: "13px", fontStyle: "bold", color: "#0D2D2A", backgroundColor: "#FFD36E", padding: { x: 4, y: 1 } })
          .setOrigin(.5).setResolution(P.resolutionTexte()).setDepth(650000 + c.depth);
        this.plateau.ajoute(t); c.compte = t;
        const detruire = c.destroy.bind(c);
        c.destroy = (...a) => { if (t.scene) t.destroy(); return detruire(...a); };
      }
      return c;
    }
    majObjet(c, o) {
      if (c.compte) c.compte.setText(o.reste != null ? String(o.reste) : "");
      if (c.compte) c.compte.setVisible(o.reste != null);
    }

    // ---------- Animation des événements, dans l'ordre (ce que voit le camp des artisans) ----------
    async animer(evs) {
      this.anime++;
      this.change();
      let liste = evs || [];
      try { liste = R().evenementsPour(this.etat, liste, "artisans") || liste; } catch (err) { console.warn("evenementsPour", err); }
      const j = P.Jeu.journal = P.Jeu.journal || [];
      try {
        for (const ev of liste) {
          if (this.fini) break;
          j.push(ev.type); if (j.length > 300) j.splice(0, j.length - 300);
          const f = this["ev_" + ev.type.replace(/-/g, "_")];
          if (f) { try { await f.call(this, ev); } catch (err) { console.warn("Animation " + ev.type, err); } }
        }
      } finally { this.anime--; }
      if (!this.fini) { this.synchroniser(); this.majHud(); }
    }
    pion(id) { return this.pions[id]; }
    tete(id) { const p = this.pions[id]; return p && p.c.visible ? { x: p.c.x, y: p.c.y - p.hauteur - 24 } : null; }
    centreCase(c) { return P.iso(c[0], c[1]); }
    visible(id) { const c = this.vu(id); return !!(c && !c.cache); }
    ev_placement(ev) { const p = this.pions[ev.id]; if (p) p.placer(ev.case); }
    async ev_debut() { this.synchroniser(); P.UI.annonce("Envoyez ! Le service commence", { duree: 1800 }); await attendre(D(400)); }
    async ev_manche(ev) { P.UI.infosCombat(this.etat, { ratee: this.ratee }); if (ev.n > 1) { P.UI.messageFond("Manche " + ev.n); await attendre(D(ATTENTE.manche)); } }
    async ev_tour(ev) {
      // la portée montrée d'un combattant n'est plus à jour quand un tour commence
      if (this.regard) { this.regard = null; this.dessiner(); }
      Object.values(this.pions).forEach(p => p.actif(p.id === ev.id));
      const vue = this.vueEtat;
      P.UI.frise(vue, ev.id, id => this.depuisLaFrise(id));
      const c = vue.combattants.find(x => x.id === ev.id);
      if (ev.id === MOI) {
        const m = this.moi(), ab = (m && this.enGroupe() && m.absences) || 0;
        P.UI.jauges(Object.assign({}, m, { cm: ev.cm, pas: ev.pas }));
        P.UI.annonce(ab ? `À toi ! (absent ${ab} fois sur 3 : joue, ou finis ton tour)` : "À toi !", { duree: ab ? 4000 : 2200, refus: ab >= 2 });
        const pan = document.getElementById("bas-combat"); pan.classList.remove("a-toi"); void pan.offsetWidth; pan.classList.add("a-toi");
      } else if (c) P.UI.messageFond(`Tour de ${c.nom}…`);
      if (ev.retraits && (ev.retraits.cm || ev.retraits.pas)) {
        const t = this.tete(ev.id); if (t) this.plateau.flotter(t.x, t.y, this.texteperte({ cm: ev.retraits.cm, pas: ev.retraits.pas }), { couleur: "#9FD3E4" });
      }
      if (c && c.case) this.suivre(c.case);
      await attendre(D(ev.id === MOI ? 200 : ATTENTE.tourMonstre));
    }
    suivre(c) {
      // la caméra suit sans brusquer : seulement si la case sort de la partie utile de l'écran
      const p = P.iso(c[0], c[1]), e = this.vue.versEcran(p.x, p.y - 30), r = P.UI.rectUtile();
      if (e.x < r.x + 30 || e.x > r.x + r.w - 30 || e.y < r.y + 40 || e.y > r.y + r.h - 10) this.centrerSurCase(c, true);
    }
    async ev_deplacement(ev) {
      const p = this.pions[ev.id];
      if (!p) return;
      this.oublierRegard(ev.id);
      if (!this.visible(ev.id)) { p.placer(null); return; }
      this.enMouvement.add(ev.id);
      p.placer(ev.chemin[0]);
      await this.marcherFluide(p, ev.chemin, ev.id === MOI ? ATTENTE.pasMoi : ATTENTE.pasAutre);
      this.enMouvement.delete(ev.id);
    }
    // La marche d'un combattant : un seul mouvement continu le long du chemin (case par case pour l'orientation, la profondeur
    // et la transparence du décor), pour que la vitesse ne dépende pas du nombre d'images par seconde.
    async marcherFluide(p, chemin, msParCase) {
      const n = chemin.length - 1;
      if (n < 1) return;
      const pts = chemin.map(c => P.iso(c[0], c[1])), o = { t: 0 };
      let seg = -1;
      const transparence = () => this.plateau.transparence(this.tousLesPions(), this.objetsAuSol());
      const entrer = i => {
        const a = chemin[i], b = chemin[i + 1], dx = (b[0] - b[1]) - (a[0] - a[1]);
        if (dx) p.orienter(dx < 0 ? -1 : 1);
        if (i > 0) { p.case = [a[0], a[1]]; transparence(); }
        p.profondeur([Math.max(a[0], b[0]), Math.max(a[1], b[1])]);
      };
      await this.tween({ targets: o, t: n, duration: D(msParCase * n), ease: "Linear", onUpdate: () => {
        const i = Math.max(0, Math.min(n - 1, Math.floor(o.t)));
        if (i !== seg) { seg = i; entrer(i); }
        const f = Math.min(1, o.t - i);
        p.c.x = pts[i].x + (pts[i + 1].x - pts[i].x) * f; p.c.y = pts[i].y + (pts[i + 1].y - pts[i].y) * f;
      } });
      const fin = chemin[n];
      p.c.x = pts[n].x; p.c.y = pts[n].y; p.case = [fin[0], fin[1]]; p.profondeur(fin);
      transparence();
    }
    async ev_rideau(ev) {
      if (!ev.case) return;
      const q = this.centreCase(ev.case);
      this.plateau.flotter(q.x, q.y - 10, `Rideau : ${this.texteperte({ cm: ev.cmPerdus, pas: ev.pasPerdus })}`, { couleur: "#FFC4A8", taille: 15 });
      await attendre(D(200));
    }
    async ev_bute(ev) {
      const t = this.tete(ev.id); if (t) this.plateau.flotter(t.x, t.y, ev.rideau ? "Pris dans le Rideau" : "Bloqué !", { couleur: "#FF9A85", taille: 15 });
      await this.secouer(ev.id);
    }
    async ev_revele(ev) {
      const p = this.pions[ev.id]; if (!p) return;
      p.placer(ev.case); p.c.setAlpha(.6);
      await attendre(D(350));
    }
    async ev_lancer(ev) {
      const p = this.pions[ev.id], col = ev.element && ev.element !== "N" ? hex(P.UI.couleurElement(ev.element)) : OR_CLAIR;
      if (p && ev.case) { const dx = (ev.case[0] - ev.case[1]) - (p.case ? p.case[0] - p.case[1] : 0); if (dx) p.orienter(dx < 0 ? -1 : 1); }
      if (ev.maitre && p && p.c.visible) {
        const t = this.tete(ev.id);
        this.plateau.flotter(t.x, t.y - 4, "Coup de maître !", { couleur: "#FFD36E", taille: 16, rang: 2 });
        const im = this.plateau.image(t.x - 52 * this.plateau.echelle(), t.y - 12, "ic-toque", { taille: 24 * this.plateau.echelle(), temporaire: false });
        this.tween({ targets: im, y: t.y - 36, alpha: 0, delay: 500, duration: 500, onComplete: () => im.destroy() });
      }
      // le petit saut du lanceur se joue pendant que le projectile part (on ne l'attend pas)
      if (p && p.c.visible && !P.reduit()) { const y0 = p.c.y; this.tween({ targets: p.c, y: y0 - 7, duration: D(60), yoyo: true, ease: "Quad.Out" }).then(() => { if (!this.enMouvement.has(ev.id)) p.c.y = y0; }); }
      if (!ev.case || ev.cache) { await attendre(D(ATTENTE.lancer)); return; }
      // la zone du sort dans la couleur de l'élément (zone calculée par le moteur, d'après ce que voit le camp)
      const lanceur = this.vu(ev.id), sort = lanceur && (lanceur.sorts || []).find(s => s.id === ev.sortId);
      let zone = [ev.case];
      try { if (sort && sort.zone && lanceur.case) zone = R().casesZone(this.etat, sort.zone, lanceur.case, ev.case) || [ev.case]; } catch (e) { zone = [ev.case]; }
      if (p && p.c.visible && p.case && R().distance(p.case, ev.case) > 1) await this.projectile(p, ev.case, col);
      const g = this.add.graphics().setDepth(2.5); this.plateau.ajoute(g);
      zone.forEach(c => this.plateau.losange(c, { fill: col, alpha: .7, stroke: BLANC, strokeAlpha: .8 }, g));
      this.tween({ targets: g, alpha: 0, duration: D(420), onComplete: () => g.destroy() });
      await attendre(D(ATTENTE.lancer));
    }
    async projectile(p, c, col) {
      if (P.reduit()) return;
      const a = { x: p.c.x, y: p.c.y - p.hauteur * .6 }, b = this.centreCase(c);
      const o = this.add.circle(a.x, a.y, 5, col).setStrokeStyle(2, BLANC).setDepth(900000); this.plateau.ajoute(o);
      await this.tween({ targets: o, x: b.x, y: b.y - 10, duration: D(Math.min(200, 60 + 16 * Math.hypot(b.x - a.x, b.y - a.y) / 32)), ease: "Quad.In" });
      o.destroy();
    }
    async ev_degats(ev) {
      const p = this.pions[ev.cible], c = this.vu(ev.cible);
      if (!p || !p.c.visible) return;
      const t = this.tete(ev.cible), maitre = !!ev.maitre;
      this.plateau.flotter(t.x, t.y, `−${ev.valeur}`, { couleur: maitre ? "#FFD36E" : "#FF9A85", taille: maitre ? 24 : 19, monte: 40 });
      if (ev.absorbe) this.plateau.flotter(t.x, t.y, `bouclier −${ev.absorbe}`, { couleur: "#CFE3F0", taille: 12 });
      if (ev.etat === "brule") this.plateau.flotter(t.x, t.y, "Brûlé", { couleur: "#F0A27A", taille: 12 });
      if (ev.rebond) this.plateau.flotter(t.x, t.y, "rebond", { couleur: "#C9BCF0", taille: 12 });
      if (c) p.victuailles(Math.max(0, ev.victuailles), c.victuaillesMax, Math.max(0, c.victuaillesMax - ev.max), true);
      if (ev.cible === MOI && c) P.UI.jauges(Object.assign({}, c, { victuailles: Math.max(0, ev.victuailles), cm: undefined, pas: undefined }));
      p.membres.forEach(m => m.setTintFill(0xFFFFFF));
      setTimeout(() => p.membres.forEach(m => m.clearTint()), 110);
      // la secousse se joue sans retenir la suite ; le chiffre, lui, reste lisible environ 0,8 s (plateau.flotter)
      this.secouer(ev.cible, 3);
      await attendre(D(ATTENTE.degats));
    }
    async ev_soin(ev) {
      const p = this.pions[ev.cible], c = this.vu(ev.cible);
      if (!p || !p.c.visible) return;
      const t = this.tete(ev.cible);
      this.plateau.flotter(t.x, t.y, `+${ev.valeur}`, { couleur: "#A8E6BE", taille: ev.maitre ? 22 : 19 });
      if (ev.pain) this.plateau.flotter(t.x, t.y, "Pain de route", { couleur: "#F3D9A8", taille: 12 });
      if (c) p.victuailles(ev.victuailles, c.victuaillesMax, Math.max(0, c.victuaillesMax - ev.max), true);
      if (ev.cible === MOI && c) P.UI.jauges(Object.assign({}, c, { victuailles: ev.victuailles, cm: undefined, pas: undefined }));
      await attendre(D(180));
    }
    async ev_bouclier(ev) { const t = this.tete(ev.cible); if (t) this.plateau.flotter(t.x, t.y, `+${ev.valeur} bouclier`, { couleur: "#CFE3F0", taille: 15 }); await attendre(D(150)); }
    async glisser(ev, mot) {
      const p = this.pions[ev.cible]; if (!p) return;
      this.oublierRegard(ev.cible);
      const t = this.tete(ev.cible); if (t) this.plateau.flotter(t.x, t.y, mot, { couleur: "#E4C98E", taille: 13 });
      this.enMouvement.add(ev.cible);
      if (ev.chemin && ev.chemin.length > 1) {
        for (let i = 1; i < ev.chemin.length; i++) { const q = this.centreCase(ev.chemin[i]); p.profondeur(ev.chemin[i]); await this.tween({ targets: p.c, x: q.x, y: q.y, duration: D(80), ease: "Quad.Out" }); p.case = ev.chemin[i]; }
      }
      this.enMouvement.delete(ev.cible);
    }
    ev_pousse(ev) { return this.glisser(ev, "Repoussé"); }
    ev_attire(ev) { return this.glisser(ev, "Attiré"); }
    ev_ramene(ev) { return this.glisser(ev, "Ramené"); }
    async ev_ecrasement(ev) {
      const t = this.tete(ev.cible); if (t) this.plateau.flotter(t.x, t.y, "Écrasement !", { couleur: "#FFB37A", taille: 16, rang: 1 });
      if (ev.heurte) { const h = this.tete(ev.heurte); if (h) this.plateau.flotter(h.x, h.y, "heurté", { couleur: "#FFB37A", taille: 12 }); }
      await this.secouer(ev.cible, 6);
    }
    async ev_resiste(ev) { const t = this.tete(ev.cible); if (t) this.plateau.flotter(t.x, t.y, "Planté : ne bouge pas", { couleur: "#E4C98E", taille: 13 }); await attendre(D(150)); }
    async sauter(id, vers) {
      const p = this.pions[id]; if (!p) return;
      this.oublierRegard(id);
      const q = this.centreCase(vers);
      this.enMouvement.add(id); p.profondeur(vers);
      if (P.reduit()) p.c.setPosition(q.x, q.y);
      else {
        const y0 = p.c.y, o = { t: 0 }, x0 = p.c.x;
        await this.tween({ targets: o, t: 1, duration: D(240), ease: "Sine.InOut", onUpdate: () => { p.c.x = x0 + (q.x - x0) * o.t; p.c.y = y0 + (q.y - y0) * o.t - Math.sin(o.t * Math.PI) * 30; } });
      }
      p.case = vers; this.enMouvement.delete(id);
    }
    ev_bond(ev) { return this.sauter(ev.id, ev.vers); }
    async ev_echange(ev) { await Promise.all([this.sauter(ev.id, ev.vers), this.sauter(ev.avec, ev.de)]); }
    ev_dans_le_dos(ev) { return this.sauter(ev.id, ev.vers); }
    async ev_etat(ev) {
      if (ev.action !== "pose") return;
      const t = this.tete(ev.cible); if (!t) return;
      this.plateau.flotter(t.x, t.y, P.NOMS_ETATS[ev.etat] || ev.etat, { couleur: "#E4C98E", taille: 13 });
      const c = this.vu(ev.cible), p = this.pions[ev.cible];
      if (c && p) p.etats((c.etats || []).map(x => ({ etat: x.etat, couches: x.couches })));
      await attendre(D(ATTENTE.effet));
    }
    async ev_retrait(ev) { const t = this.tete(ev.cible); if (t) this.plateau.flotter(t.x, t.y, `−${ev.n} ${ev.quoi === "cm" ? "CM" : "Pas"}`, { couleur: "#9FD3E4", taille: 15 }); await attendre(D(ATTENTE.effet)); }
    async ev_bonus(ev) {
      if (ev.action !== "pose") return;
      const t = this.tete(ev.cible), noms = { levure: "Levure", rayon: "Rayon", pas: "Pas", cm: "CM", conservation: "Conservation", coupDeMaitre: "Coup de maître", rideau: "Rideau", fauxFuyant: "Faux-fuyant", ouverture: "Ouverture", degatsPct: "% dégâts" };
      if (t) this.plateau.flotter(t.x, t.y, `${ev.valeur > 0 ? "+" : ""}${ev.valeur} ${noms[ev.carac] || ev.carac}`, { couleur: "#E4C98E", taille: 14 });
      await attendre(D(ATTENTE.effet));
    }
    async ev_gain_cm(ev) { const t = this.tete(ev.cible); if (t) this.plateau.flotter(t.x, t.y, `+${ev.n} CM`, { couleur: "#E4C98E", taille: 15 }); await attendre(D(ATTENTE.effet)); }
    async ev_entame(ev) { const t = this.tete(ev.cible); if (t) this.plateau.flotter(t.x, t.y, `Entamé ${ev.part} %`, { couleur: "#FFB37A", taille: 13 }); await attendre(D(110)); }
    async ev_rebond(ev) {
      const a = this.tete(ev.de), b = this.tete(ev.vers); if (!a || !b) return;
      const g = this.add.graphics().setDepth(950000); this.plateau.ajoute(g);
      g.lineStyle(3, 0xC9BCF0, 1); g.beginPath(); g.moveTo(a.x, a.y);
      for (let i = 1; i < 6; i++) { const t = i / 6; g.lineTo(a.x + (b.x - a.x) * t + (i % 2 ? 6 : -6), a.y + (b.y - a.y) * t - Math.sin(t * Math.PI) * 18); }
      g.lineTo(b.x, b.y); g.strokePath();
      this.tween({ targets: g, alpha: 0, duration: D(420), onComplete: () => g.destroy() });
      await attendre(D(120));
    }
    async ev_renforce(ev) { const t = this.tete(ev.id); if (t) this.plateau.flotter(t.x, t.y, `Renforcé +${ev.valeur} %`, { couleur: "#E4C98E", taille: 13 }); }
    async ev_maree(ev) { const t = this.tete(ev.id); if (t) this.plateau.flotter(t.x, t.y, P.NOMS_ETATS[ev.etat] || "Marée", { couleur: "#9FD3E4", taille: 14 }); await attendre(D(ATTENTE.effet)); }
    async ev_pose(ev) {
      // un piège caché n'est montré qu'à son camp (evenementsPour l'a déjà retiré pour l'autre camp)
      if (ev.cache && ev.camp !== "artisans") return;
      if (ev.quoi === "nappe") { this.synchroniser(); await attendre(D(140)); return; }
      if (ev.quoi === "ustensile" || !ev.case) return;
      const o = { id: ev.objet, quoi: ev.quoi, case: ev.case, reste: ev.quoi === "fournee" || ev.quoi === "graine" ? ev.tours : null, cache: ev.cache };
      if (!this.objets[ev.objet]) this.objets[ev.objet] = this.creerObjet(o);
      const c = this.objets[ev.objet];
      this.majObjet(c, o);
      if (!P.reduit()) { c.setScale(.3); await this.tween({ targets: c, scale: 1, duration: D(180), ease: "Back.Out" }); }
    }
    async ev_cuisson(ev) {
      const c = this.objets[ev.objet]; if (!c) return;
      if (c.compte) c.compte.setText(String(ev.reste)).setVisible(true);
      this.plateau.flotter(c.x, c.y - 24, ev.reste > 0 ? `cuit… ${ev.reste}` : "c'est cuit !", { couleur: "#FFD36E", taille: 13 });
      if (!P.reduit()) await this.tween({ targets: c, scale: 1.15, duration: D(100), yoyo: true });
    }
    async ev_declenchement(ev) {
      const c = ev.case || (this.objets[ev.objet] && P.grille(this.objets[ev.objet].x, this.objets[ev.objet].y));
      if (!c) return;
      const q = this.centreCase(c);
      const r = this.add.ellipse(q.x, q.y, 20, 10, 0xFFD36E, .8).setDepth(2.6); this.plateau.ajoute(r);
      this.tween({ targets: r, scaleX: 5, scaleY: 5, alpha: 0, duration: D(480), ease: "Cubic.Out", onComplete: () => r.destroy() });
      const nom = { fournee: "La fournée éclate !", piege: "Piège !", nappe: "", graine: "" }[ev.quoi];
      if (nom) this.plateau.flotter(q.x, q.y - 26, nom, { couleur: "#FFD36E", taille: 15 });
      await attendre(D(160));
    }
    async ev_disparait(ev) {
      const c = this.objets[ev.objet]; if (!c) return;
      delete this.objets[ev.objet];
      if (c.compte) c.compte.setVisible(false);
      await this.tween({ targets: c, alpha: 0, scale: .6, duration: D(180) });
      c.destroy();
    }
    async ev_invoque(ev) {
      const c = this.vu(ev.id); if (!c) return;
      const p = this.pions[ev.id] || (this.pions[ev.id] = this.creerPion(c));
      p.placer(ev.case);
      const t = this.tete(ev.id); if (t) this.plateau.flotter(t.x, t.y, ev.nom + " arrive !", { couleur: "#A8E6BE", taille: 14 });
      if (!P.reduit()) { p.c.setScale(.2); await this.tween({ targets: p.c, scale: 1, duration: D(220), ease: "Back.Out" }); }
      P.UI.frise(this.vueEtat, (R().actif(this.etat) || {}).id, id => this.depuisLaFrise(id));
    }
    async ev_tombe(ev) {
      const p = this.pions[ev.id]; if (!p) return;
      this.oublierRegard(ev.id);
      const t = this.tete(ev.id);
      if (t) {
        this.plateau.flotter(t.x, t.y, "rend son tablier", { couleur: "#F2EDE0", taille: 15, duree: 1500 });
        const im = this.plateau.image(t.x, t.y + 6, "ic-tablier", { taille: 22, temporaire: false });
        this.tween({ targets: im, y: t.y - 36, alpha: 0, duration: D(1100), onComplete: () => im.destroy() });
      }
      this.enMouvement.add(ev.id);
      p.actif(false); p.victuailles(0, 1, 0, false); p.etats([]);
      await this.tween({ targets: p.c, angle: p.sens < 0 ? -80 : 80, alpha: 0, y: p.c.y + 4, duration: D(360), ease: "Quad.In" });
      p.placer(null); p.c.setAngle(0).setAlpha(1);
      this.enMouvement.delete(ev.id);
      P.UI.frise(this.vueEtat, (R().actif(this.etat) || {}).id, id => this.depuisLaFrise(id));
    }
    async ev_pain(ev) { await attendre(D(100)); }
    // en solo (max: null), le Minuteur passe le tour et rien de plus ; en groupe, au 3e tour passé on quitte le service
    enGroupe() { return (this.etat.combattants || []).filter(k => k.genre === "artisan").length > 1; }
    async ev_absent(ev) {
      if (ev.id !== MOI) return;
      if (!ev.max) { P.UI.annonce("Temps écoulé : tour passé", { refus: true, duree: 3500 }); return; }
      P.UI.annonce(`Temps écoulé : tour passé (absent ${ev.n} fois sur ${ev.max})` + (ev.n === ev.max - 1 ? ". Encore une et tu quittes le service" : ""), { refus: true, duree: 4500 });
    }
    async ev_quitte(ev) {
      if (ev.id !== MOI) return;
      P.UI.annonce(ev.abandon ? "Tu quittes le service" : "Trois tours sans jouer : tu quittes le service", { refus: true, duree: 6000 });
      await attendre(D(400));
    }
    async ev_commande(ev) {
      if (ev.respectee === false) {
        const par = ev.par ? this.vu(ev.par) : null;
        this.ratee = P.UI.commandeRatee(ev.commande, par && par.nom, ev.raison);
        P.UI.annonce("Commande ratée : " + this.ratee, { refus: true, duree: 4500 });
        P.UI.infosCombat(this.etat, { ratee: this.ratee });
      }
    }
    async secouer(id, amp) {
      const p = this.pions[id]; if (!p || P.reduit() || !p.c.visible) return;
      const x = p.c.x;
      await this.tween({ targets: p.c, x: x + (amp || 4), duration: D(35), yoyo: true, repeat: 1, ease: "Sine.InOut" });
      p.c.x = x;
    }
  }
  P.SceneCombat = SceneCombat;
})();
