// Dictionnaire de référence : uniquement des mots validés, avec leurs fréquences et leurs analyses.

import { cle, forme } from "./texte.js";

const MODES_PERSONNELS = /^(ind|sub|con):/;

export class Lexique {
  constructor() {
    /** forme → { freq, lectures: [{ lemme, cgram, genre, nombre, freq, tags }] } */
    this.entrees = new Map();
    /** clé sans accents → formes, de la plus fréquente à la moins fréquente */
    this.parCle = new Map();
    /** lemme → tag de conjugaison (« ind:pre:3p ») → lectures portant ce tag */
    this.conjugaisons = new Map();
    this.clesTriees = [];
    /** première lettre → longueur → clés, pour chercher les mots à deux fautes près */
    this.parInitiale = new Map();
  }

  /** Construit un lexique à partir d'un ou plusieurs fichiers au format de data/lexique-fr.tsv. */
  static depuisTextes(...textes) {
    const lexique = new Lexique();
    for (const texte of textes) lexique.charger(texte);
    lexique.finaliser();
    return lexique;
  }

  charger(texte) {
    for (const ligne of texte.split("\n")) {
      if (!ligne || ligne.startsWith("#")) continue;
      const [ortho, lemme, cgram, genre, nombre, freq, tags] = ligne.split("\t");
      this.ajouter(ortho, {
        lemme: lemme || ortho,
        cgram,
        genre: genre || "",
        nombre: nombre || "",
        freq: Number(freq) || 0,
        tags: tags ? tags.split(",") : [],
      });
    }
  }

  ajouter(ortho, lecture) {
    const f = forme(ortho);
    let entree = this.entrees.get(f);
    if (!entree) {
      entree = { forme: f, freq: 0, lectures: [] };
      this.entrees.set(f, entree);
      const k = cle(f);
      if (!this.parCle.has(k)) this.parCle.set(k, []);
      this.parCle.get(k).push(f);
    }
    entree.freq += lecture.freq;
    entree.lectures.push(lecture);
    if (lecture.cgram === "VER" || lecture.cgram === "AUX") {
      if (!this.conjugaisons.has(lecture.lemme)) this.conjugaisons.set(lecture.lemme, new Map());
      const parTag = this.conjugaisons.get(lecture.lemme);
      for (const tag of lecture.tags) {
        if (!parTag.has(tag)) parTag.set(tag, []);
        parTag.get(tag).push({ forme: f, ...lecture });
      }
    }
  }

  finaliser() {
    for (const formes of this.parCle.values()) formes.sort((a, b) => this.frequence(b) - this.frequence(a));
    this.clesTriees = [...this.parCle.keys()].sort();
    for (const k of this.clesTriees) {
      if (!this.parInitiale.has(k[0])) this.parInitiale.set(k[0], new Map());
      const parLongueur = this.parInitiale.get(k[0]);
      if (!parLongueur.has(k.length)) parLongueur.set(k.length, []);
      parLongueur.get(k.length).push(k);
    }
  }

  /** Clés de même initiale et de longueur proche (on se trompe rarement sur la première lettre deux fois). */
  *clesVoisines(k, ecart = 2) {
    const parLongueur = this.parInitiale.get(k[0]);
    if (!parLongueur) return;
    for (let n = k.length - ecart; n <= k.length + ecart; n++) yield* parLongueur.get(n) ?? [];
  }

  contient(mot) {
    return this.entrees.has(forme(mot));
  }

  frequence(mot) {
    return this.entrees.get(forme(mot))?.freq ?? 0;
  }

  lectures(mot) {
    return this.entrees.get(forme(mot))?.lectures ?? [];
  }

  formesParCle(k) {
    return this.parCle.get(k) ?? [];
  }

  /** Formes d'un verbe pour un tag donné (« ind:pre:3p »), de la plus fréquente à la moins fréquente. */
  conjuguer(lemme, tag) {
    const lectures = this.conjugaisons.get(lemme)?.get(tag) ?? [];
    return [...lectures].sort((a, b) => b.freq - a.freq);
  }

  /** Clés commençant par un préfixe, pour proposer des complétions pendant la frappe. */
  *clesCommencantPar(prefixe) {
    let bas = 0;
    let haut = this.clesTriees.length;
    while (bas < haut) {
      const milieu = (bas + haut) >> 1;
      if (this.clesTriees[milieu] < prefixe) bas = milieu + 1;
      else haut = milieu;
    }
    for (let i = bas; i < this.clesTriees.length && this.clesTriees[i].startsWith(prefixe); i++) {
      yield this.clesTriees[i];
    }
  }

  // --- Analyse grammaticale élémentaire -------------------------------------------------------

  aCategorie(mot, ...categories) {
    return this.lectures(mot).some((l) => categories.some((c) => l.cgram === c || l.cgram.startsWith(c + ":")));
  }

  lecturesVerbales(mot) {
    return this.lectures(mot).filter((l) => l.cgram === "VER" || l.cgram === "AUX");
  }

  /** Vrai si le mot peut être un verbe conjugué à un mode personnel (indicatif, subjonctif, conditionnel). */
  estVerbeConjugue(mot) {
    return this.lecturesVerbales(mot).some((l) => l.tags.some((t) => MODES_PERSONNELS.test(t)));
  }

  estInfinitif(mot) {
    return this.lecturesVerbales(mot).some((l) => l.tags.includes("inf"));
  }

  estParticipePasse(mot) {
    return this.lecturesVerbales(mot).some((l) => l.tags.includes("par:pas"));
  }

  /** Vrai si le mot peut s'accorder avec une personne (« 3p ») à un mode personnel. */
  saccordeAvec(mot, personne) {
    return this.lecturesVerbales(mot).some((l) =>
      l.tags.some((t) => MODES_PERSONNELS.test(t) && t.endsWith(":" + personne)),
    );
  }
}
