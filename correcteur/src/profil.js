// Ce que le clavier apprend de son utilisateur, avec des garde-fous pour ne jamais apprendre une faute.
//
// Deux choses bien séparées :
//   1. ce qui est VALIDE : le lexique de référence + les mots appris (prénoms, argot, abréviations…) ;
//   2. ce qui est FRÉQUENT pour cet utilisateur : sert seulement à classer les suggestions.
//
// Un mot inconnu n'est jamais appris s'il n'est qu'une version sans accents (ou sans apostrophe,
// sans trait d'union) d'un mot existant : « reel », « tres », « aujourdhui » restent des fautes,
// même tapés cent fois. Seul un ajout manuel explicite et forcé peut l'autoriser (« un reel Instagram »).

import { cle, forme } from "./texte.js";

export const SEUILS = {
  /** Nombre de fois qu'un mot inconnu doit être tapé avant d'être appris… */
  occurrences: 3,
  /** …dans au moins ce nombre de contextes différents (mot précédent). */
  contextes: 2,
  /** Un mot avec une majuscule en milieu de phrase (probablement un nom propre) est appris plus vite. */
  occurrencesNomPropre: 2,
  /** Si le correcteur prend le mot pour une faute de frappe, il faut annuler sa correction ce nombre de fois. */
  annulations: 2,
};

const MAX_CONTEXTES = 5;

export class ProfilUtilisateur {
  constructor(lexique) {
    this.lexique = lexique;
    /** Désactivé dans les champs de mot de passe et en navigation privée. */
    this.apprentissageActif = true;
    this.usages = new Map();
    this.bigrammes = new Map();
    this.appris = new Map();
    this.quarantaine = new Map();
    this.bloques = new Map();
    this.refus = new Map();
    this.apprisParCle = new Map();
  }

  // --- Ce qui est valide ---------------------------------------------------------------------

  estValide(mot) {
    const f = forme(mot);
    if (this.lexique.contient(f) || this.appris.has(f)) return true;
    // « as-tu », « dis-moi », « va-t-il » : valides si chaque partie l'est.
    if (f.includes("-")) {
      const parties = f.split("-");
      return parties.every((p) => p === "t" || this.lexique.contient(p) || this.appris.has(p));
    }
    return false;
  }

  estAppris(mot) {
    return this.appris.has(forme(mot));
  }

  /** Mots appris ayant cette clé (pour corriger « Matheo » en « Mathéo » une fois le prénom appris). */
  formesApprisesParCle(k) {
    return this.apprisParCle.get(k) ?? [];
  }

  /**
   * Si le mot n'est qu'une version dégradée d'un mot valide (accents, apostrophe ou trait d'union
   * manquants), renvoie ce mot valide. C'est la règle qui protège contre l'apprentissage de « reel ».
   */
  versionCorrecte(mot) {
    if (this.estValide(mot)) return null;
    const k = cle(mot);
    return this.lexique.formesParCle(k)[0] ?? this.formesApprisesParCle(k)[0] ?? null;
  }

  // --- Observation de la frappe ----------------------------------------------------------------

  /**
   * À appeler chaque fois que l'utilisateur termine un mot (espace, ponctuation), avec le mot tel
   * qu'il reste dans le texte.
   *
   * @param {string} mot
   * @param {object} options
   * @param {string} [options.precedent] mot précédent, pour les contextes et les bigrammes
   * @param {boolean} [options.annulee] l'utilisateur vient d'annuler une correction automatique pour garder ce mot
   * @param {string} [options.fauteProbableDe] mot dont le correcteur pense que celui-ci est une faute de frappe
   * @param {boolean} [options.nomPropre] majuscule en milieu de phrase
   * @returns {{ statut: "valide"|"appris"|"quarantaine"|"bloque"|"ignore", raison?: string }}
   */
  observer(mot, { precedent = null, annulee = false, fauteProbableDe = null, nomPropre = false } = {}) {
    if (!this.apprentissageActif) return { statut: "ignore", raison: "apprentissage désactivé" };
    const f = forme(mot);
    const p = precedent ? forme(precedent) : null;
    // Un mot en début de phrase compte comme un contexte à part entière.
    const contexte = p ?? "^";

    if (this.estValide(f)) {
      incrementer(this.usages, f);
      if (p) incrementer(this.bigrammes, p + " " + f);
      const appris = this.appris.get(f);
      if (appris) appris.occurrences++;
      return { statut: "valide" };
    }

    const correct = this.versionCorrecte(f);
    if (correct) {
      const bloque = this.bloques.get(f) ?? { correction: correct, tentatives: 0 };
      bloque.tentatives++;
      bloque.raison = `forme sans accent ou mal ponctuée de « ${correct} » : jamais apprise`;
      this.bloques.set(f, bloque);
      return { statut: "bloque", raison: bloque.raison };
    }

    const q = this.quarantaine.get(f) ?? { ecriture: mot, occurrences: 0, contextes: [], annulations: 0 };
    q.occurrences++;
    if (annulee) q.annulations++;
    if (!q.contextes.includes(contexte) && q.contextes.length < MAX_CONTEXTES) q.contextes.push(contexte);
    q.fauteProbableDe = fauteProbableDe;
    if (nomPropre) q.ecriture = mot;
    this.quarantaine.set(f, q);

    let pret;
    let raison;
    if (q.annulations >= SEUILS.annulations) {
      pret = true;
    } else if (fauteProbableDe) {
      pret = false;
      raison = `ressemble à une faute de frappe de « ${fauteProbableDe} » : appris seulement si vous annulez la correction ${SEUILS.annulations} fois`;
    } else if (nomPropre) {
      pret = q.occurrences >= SEUILS.occurrencesNomPropre;
    } else {
      pret = q.occurrences >= SEUILS.occurrences && q.contextes.length >= Math.min(SEUILS.contextes, q.occurrences);
    }

    if (pret) {
      this.quarantaine.delete(f);
      this.enregistrer(f, { ecriture: q.ecriture, source: "usage", occurrences: q.occurrences });
      return { statut: "appris" };
    }
    q.raison = raison ?? `vu ${q.occurrences} fois sur ${nomPropre ? SEUILS.occurrencesNomPropre : SEUILS.occurrences}`;
    return { statut: "quarantaine", raison: q.raison };
  }

  /** L'utilisateur a annulé une correction automatique : on retire l'usage compté pour la correction. */
  annulerUsage(mot, precedent = null) {
    const f = forme(mot);
    decrementer(this.usages, f);
    if (precedent) decrementer(this.bigrammes, forme(precedent) + " " + f);
  }

  noterRefus(tape, correction) {
    incrementer(this.refus, forme(tape) + "→" + forme(correction));
  }

  aRefuse(tape, correction) {
    return (this.refus.get(forme(tape) + "→" + forme(correction)) ?? 0) > 0;
  }

  // --- Ajout et suppression explicites ---------------------------------------------------------

  /**
   * Ajout volontaire (« Ajouter au dictionnaire », carnet de contacts…).
   * Une forme sans accent d'un mot existant est refusée, sauf avec `forcer: true`.
   */
  ajouter(mot, { source = "manuel", forcer = false } = {}) {
    const f = forme(mot);
    if (this.lexique.contient(f)) return { ajoute: false, raison: "déjà dans le dictionnaire" };
    const correct = this.versionCorrecte(f);
    if (correct && !forcer) {
      return {
        ajoute: false,
        raison: `« ${mot} » est une forme sans accent de « ${correct} ». Confirmez pour l'ajouter quand même.`,
        correction: correct,
      };
    }
    this.quarantaine.delete(f);
    this.bloques.delete(f);
    this.enregistrer(f, { ecriture: mot, source, occurrences: 0 });
    return { ajoute: true };
  }

  oublier(mot) {
    const f = forme(mot);
    const appris = this.appris.get(f);
    if (appris) {
      this.appris.delete(f);
      const k = cle(f);
      const liste = (this.apprisParCle.get(k) ?? []).filter((m) => m !== f);
      if (liste.length) this.apprisParCle.set(k, liste);
      else this.apprisParCle.delete(k);
    }
    this.quarantaine.delete(f);
    this.usages.delete(f);
    return Boolean(appris);
  }

  enregistrer(f, infos) {
    this.appris.set(f, { depuis: Date.now(), ...infos });
    const k = cle(f);
    if (!this.apprisParCle.has(k)) this.apprisParCle.set(k, []);
    if (!this.apprisParCle.get(k).includes(f)) this.apprisParCle.get(k).push(f);
  }

  // --- Classement ----------------------------------------------------------------------------

  /** Bonus de classement (en puissances de 10 de fréquence) pour les mots que l'utilisateur emploie. */
  bonus(mot, precedent = null) {
    const f = forme(mot);
    let b = 0.5 * Math.log10(1 + (this.usages.get(f) ?? 0));
    if (precedent) b += 0.8 * Math.log10(1 + (this.bigrammes.get(forme(precedent) + " " + f) ?? 0));
    return b;
  }

  /** Écriture préférée d'un mot appris (« Mathéo » plutôt que « mathéo »). */
  ecriture(mot) {
    return this.appris.get(forme(mot))?.ecriture ?? null;
  }

  // --- Sauvegarde ----------------------------------------------------------------------------

  exporter() {
    return {
      version: 1,
      usages: [...this.usages],
      bigrammes: [...this.bigrammes],
      appris: [...this.appris],
      quarantaine: [...this.quarantaine],
      bloques: [...this.bloques],
      refus: [...this.refus],
    };
  }

  static importer(donnees, lexique) {
    const profil = new ProfilUtilisateur(lexique);
    if (!donnees || donnees.version !== 1) return profil;
    profil.usages = new Map(donnees.usages);
    profil.bigrammes = new Map(donnees.bigrammes);
    profil.quarantaine = new Map(donnees.quarantaine);
    profil.bloques = new Map(donnees.bloques);
    profil.refus = new Map(donnees.refus);
    for (const [f, infos] of donnees.appris) profil.enregistrer(f, infos);
    return profil;
  }
}

function incrementer(map, k) {
  map.set(k, (map.get(k) ?? 0) + 1);
}

function decrementer(map, k) {
  const n = (map.get(k) ?? 0) - 1;
  if (n > 0) map.set(k, n);
  else map.delete(k);
}
