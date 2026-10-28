// Moteur de correction : ce que le clavier appelle à chaque mot tapé.

import { distanceFrappe, variantes } from "./clavier.js";
import { appliquerCorrections, verifierGrammaire } from "./grammaire.js";
import { DETERMINANTS, DETERMINANTS_AMBIGUS, SUJETS } from "./mots.js";
import { ProfilUtilisateur } from "./profil.js";
import { appliquerCasse, casse, cle, forme, sansAccents, tokeniser } from "./texte.js";

/** Pénalité par unité de distance de frappe, en puissances de 10 de fréquence. */
const PENALITE_DISTANCE = 2;
/** Pénalité quand on change un accent que l'utilisateur a explicitement tapé (« è » au lieu de « ê »). */
const PENALITE_ACCENT_TAPE = 0.15;
/** Fréquence attribuée à un mot appris (en occurrences par million, comme le lexique). */
const FREQ_MOT_APPRIS = 10;
/**
 * Un mot valide n'est remplacé par sa version accentuée que si celle-ci est environ 20 fois plus probable
 * dans ce contexte (« foret » → « forêt », « voila » → « voilà »).
 */
const ECART_VERSION_ACCENTUEE = 1.3;
/** Distance de frappe maximale d'un candidat (environ deux fautes). */
const DISTANCE_MAX = 2;
/** Fréquence (par million) au-delà de laquelle un mot est « courant ». */
const FREQ_COURANTE = 5;
/** En dessous de cette fréquence, un mot n'est jamais imposé par une correction automatique. */
const FREQ_MINIMALE = 0.5;
/** Écart de score minimal entre les deux meilleures corrections pour corriger automatiquement. */
const ECART_AUTO = 0.3;

export class Correcteur {
  /**
   * @param {import("./lexique.js").Lexique} lexique
   * @param {ProfilUtilisateur} [profil]
   */
  constructor(lexique, profil = new ProfilUtilisateur(lexique)) {
    this.lexique = lexique;
    this.profil = profil;
  }

  // --- Un mot ---------------------------------------------------------------------------------

  /**
   * Analyse un mot que l'utilisateur vient de terminer.
   *
   * @param {string} mot
   * @param {{ precedent?: string|null, debutPhrase?: boolean }} [contexte]
   * @returns {{ mot: string, valide: boolean, correction: string|null, auto: boolean,
   *             suggestions: string[], raison: string|null, distance: number|null }}
   */
  analyserMot(mot, contexte = {}) {
    const f = forme(mot);
    const modele = casse(mot);
    const resultat = { mot, valide: false, correction: null, auto: false, suggestions: [], raison: null, distance: null };
    if (!/\p{L}/u.test(f)) return { ...resultat, valide: true };

    if (this.profil.estValide(f)) {
      resultat.valide = true;
      // « paul » → « Paul » : un mot qui n'existe que comme nom propre prend une majuscule.
      const lectures = this.lexique.lectures(f);
      if (modele === "minuscules" && lectures.length && lectures.every((l) => l.cgram === "NPR")) {
        resultat.correction = appliquerCasse(f, "capitale");
        resultat.auto = true;
        resultat.distance = 0;
        resultat.raison = "nom propre";
        return resultat;
      }
      const accentue = this.versionAccentuee(f, contexte);
      if (accentue) {
        resultat.correction = this.ecrire(accentue, modele);
        resultat.auto = true;
        resultat.distance = 0;
        resultat.suggestions = [resultat.correction, mot];
        resultat.raison = `« ${f} » existe mais « ${accentue} » est bien plus probable ici`;
      }
      return resultat;
    }

    const candidats = this.candidats(f, contexte);
    resultat.suggestions = candidats.slice(0, 3).map((c) => this.ecrire(c.mot, modele));
    const [premier, second] = candidats;
    if (!premier) {
      resultat.raison = "mot inconnu, aucune correction proche";
      return resultat;
    }
    resultat.correction = this.ecrire(premier.mot, modele);
    resultat.distance = premier.distance;

    // Une majuscule en milieu de phrase signale souvent un nom propre : on suggère sans imposer.
    const nomPropre = modele === "capitale" && !contexte.debutPhrase;
    const k = cle(f);
    if (premier.exact) {
      // Seuls les accents, l'apostrophe ou le trait d'union manquent : la faute est certaine.
      resultat.auto = !nomPropre || this.profil.estAppris(premier.mot);
      resultat.raison = premier.mot.includes("'") || premier.mot.includes("-")
        ? "apostrophe ou trait d'union manquant"
        : "accent manquant";
    } else {
      const limite = k.length <= 3 ? 0.5 : k.length <= 6 ? 1 : 1.5;
      const net = !second || premier.score - second.score >= ECART_AUTO;
      // Un mot inconnu avec majuscule (« Paul » en début de phrase) ou très court (« jsp », « tkt » : souvent
      // une abréviation) n'est remplacé que par un mot courant, et un mot moyen jamais par un mot rarissime.
      // Un mot long proche d'un seul mot existant, même rare, est en revanche une faute presque certaine.
      const freq = this.profil.estAppris(premier.mot) ? FREQ_MOT_APPRIS : this.lexique.frequence(premier.mot);
      const freqRequise = modele === "capitale" || k.length <= 3 ? FREQ_COURANTE : k.length <= 7 ? FREQ_MINIMALE : 0;
      const courant = freq >= freqRequise;
      resultat.auto = !nomPropre && modele !== "mixte" && premier.distance <= limite && net && courant;
      resultat.raison = "faute de frappe probable";
    }
    return resultat;
  }

  /** Candidats de correction pour une forme inconnue, du plus probable au moins probable. */
  candidats(f, contexte = {}) {
    const k = cle(f);
    const vus = new Map();
    const examiner = (cleCandidate, distanceCle) => {
      for (const m of this.formesParCle(cleCandidate)) {
        if (vus.has(m)) continue;
        const exact = cleCandidate === k;
        const distance = (exact ? 0 : distanceCle ?? distanceFrappe(k, cleCandidate)) + this.penaliteAccents(f, m);
        vus.set(m, { mot: m, exact, distance, score: this.score(m, contexte) - PENALITE_DISTANCE * distance });
      }
    };
    examiner(k);
    for (const v of variantes(k)) examiner(v);
    // Deux fautes dans le même mot : on ne cherche plus loin que si rien de proche n'a été trouvé.
    if (k.length >= 4 && ![...vus.values()].some((c) => c.distance <= 1)) {
      const cles = [...this.lexique.clesVoisines(k), ...this.profil.apprisParCle.keys()];
      for (const c of cles) {
        const d = distanceFrappe(k, c, DISTANCE_MAX);
        if (d <= DISTANCE_MAX) examiner(c, d);
      }
    }
    // Les bonnes lettres sans les accents (« reel », « Lea ») l'emportent toujours sur une faute de frappe.
    return [...vus.values()].sort((a, b) => b.exact - a.exact || b.score - a.score);
  }

  /** Mots du lexique et mots appris partageant une clé. */
  formesParCle(k) {
    const appris = this.profil.formesApprisesParCle(k);
    const lexique = this.lexique.formesParCle(k);
    return appris.length ? [...lexique, ...appris] : lexique;
  }

  /**
   * Pour un mot valide sans accent, la version accentuée nettement plus probable (« foret » → « forêt »),
   * sauf si l'utilisateur a déjà refusé ce remplacement.
   */
  versionAccentuee(f, contexte) {
    const jumeaux = this.formesParCle(cle(f)).filter(
      (m) => m !== f && sansAccents(m) !== m && !this.profil.aRefuse(f, m),
    );
    if (!jumeaux.length) return null;
    const base = this.score(f, contexte);
    let meilleur = null;
    for (const m of jumeaux) {
      const s = this.score(m, contexte) - this.penaliteAccents(f, m);
      if (s - base >= ECART_VERSION_ACCENTUEE && (!meilleur || s > meilleur.s)) meilleur = { m, s };
    }
    return meilleur?.m ?? null;
  }

  /** Probabilité (logarithmique) d'un mot ici : fréquence + habitudes de l'utilisateur + contexte. */
  score(m, contexte = {}) {
    const freq = this.lexique.frequence(m) || (this.profil.estAppris(m) ? FREQ_MOT_APPRIS : 0);
    return Math.log10(freq + 0.05) + this.profil.bonus(m, contexte.precedent) + this.bonusContexte(m, contexte.precedent);
  }

  /** Bonus selon le mot précédent : un nom après « la », un verbe accordé après « ils »… */
  bonusContexte(m, precedent) {
    if (!precedent) return 0;
    const p = forme(precedent);
    const lectures = this.lexique.lectures(m);
    const determinant = DETERMINANTS.get(p);
    if (determinant) {
      const [genre, nombre] = determinant;
      const nominales = lectures.filter((l) => l.cgram === "NOM" || l.cgram.startsWith("ADJ"));
      const accordees = nominales.filter(
        (l) => (!genre || !l.genre || l.genre === genre) && (!nombre || !l.nombre || l.nombre === nombre),
      );
      if (accordees.length) return 0.5;
      if (DETERMINANTS_AMBIGUS.has(p)) return 0;
      return nominales.length ? -1 : -1.5;
    }
    const personne = SUJETS.get(p);
    if (personne) {
      if (this.lexique.saccordeAvec(m, personne)) return 1;
      return this.lexique.estVerbeConjugue(m) ? -0.5 : -1;
    }
    if (this.lexique.lecturesVerbales(p).some((l) => l.lemme === "avoir" || l.lemme === "être")) {
      return this.lexique.estParticipePasse(m) ? 1 : 0;
    }
    return 0;
  }

  /** Pénalise le changement d'un accent tapé volontairement (« pècheur » : l'utilisateur voulait un accent). */
  penaliteAccents(tape, candidat) {
    let penalite = 0;
    for (const c of tape) {
      if (sansAccents(c) !== c && !candidat.includes(c)) penalite += PENALITE_ACCENT_TAPE;
    }
    return penalite;
  }

  /** Écrit un mot avec la casse tapée, ou l'écriture apprise (« Mathéo »). */
  ecrire(m, modele) {
    const appris = this.profil.ecriture(m);
    if (appris && casse(appris) !== "minuscules" && modele === "minuscules") return appris;
    return appliquerCasse(appris ?? m, modele);
  }

  // --- Complétion pendant la frappe -----------------------------------------------------------

  /** Trois propositions pour la barre de suggestions pendant qu'un mot est en cours de frappe. */
  suggestions(partiel, contexte = {}, max = 3) {
    const k = cle(partiel);
    if (!k) return [];
    const modele = casse(partiel);
    const resultats = new Map();
    const ajouter = (m, s) => {
      if (!resultats.has(m) || resultats.get(m) < s) resultats.set(m, s);
    };
    let examinees = 0;
    for (const c of this.lexique.clesCommencantPar(k)) {
      for (const m of this.lexique.formesParCle(c)) ajouter(m, this.score(m, contexte) - 0.05 * (c.length - k.length));
      if (++examinees > 20000) break;
    }
    for (const [f] of this.profil.appris) {
      if (cle(f).startsWith(k)) ajouter(f, this.score(f, contexte));
    }
    // Le début d'un mot n'est pas une faute : on ne propose de corrections que faute de complétions.
    if (resultats.size < max && !this.profil.estValide(partiel)) {
      for (const c of this.candidats(forme(partiel), contexte).slice(0, max - resultats.size)) ajouter(c.mot, c.score);
    }
    return [...resultats]
      .sort((a, b) => b[1] - a[1])
      .slice(0, max)
      .map(([m]) => this.ecrire(m, modele));
  }

  // --- Événements du clavier -------------------------------------------------------------------

  /**
   * L'utilisateur vient de terminer un mot (espace ou ponctuation). Renvoie l'analyse et ce qui a été
   * appris ; si `analyse.auto` est vrai, le clavier remplace le mot par `analyse.correction`.
   */
  motTermine(mot, contexte = {}) {
    const analyse = this.analyserMot(mot, contexte);
    const final = analyse.auto && analyse.correction ? analyse.correction : mot;
    const apprentissage = this.profil.observer(final, {
      precedent: contexte.precedent,
      nomPropre: casse(mot) === "capitale" && !contexte.debutPhrase,
    });
    return { ...analyse, final, apprentissage };
  }

  /**
   * L'utilisateur a annulé une correction automatique (retour arrière juste après) pour garder ce qu'il
   * avait tapé. Le mot n'est appris que s'il n'est pas une simple faute d'accent d'un mot existant.
   */
  annulerCorrection(tape, correction, contexte = {}) {
    this.profil.annulerUsage(correction, contexte.precedent);
    return this.garderMot(tape, contexte);
  }

  /**
   * L'utilisateur garde exactement ce qu'il a tapé (case « mot tapé » de la barre de suggestions, ou
   * annulation d'une correction). Compte comme un refus de la correction que le moteur aurait faite.
   */
  garderMot(tape, contexte = {}) {
    const analyse = this.analyserMot(tape, contexte);
    if (analyse.correction) this.profil.noterRefus(tape, analyse.correction);
    return this.profil.observer(tape, {
      precedent: contexte.precedent,
      annulee: analyse.auto,
      fauteProbableDe: analyse.auto && analyse.distance > 0 ? forme(analyse.correction) : null,
      nomPropre: casse(tape) === "capitale" && !contexte.debutPhrase,
    });
  }

  // --- Un texte entier --------------------------------------------------------------------------

  /** Vérifie la grammaire (voir grammaire.js). */
  verifierGrammaire(texte, options) {
    return verifierGrammaire(texte, this.lexique, options);
  }

  /**
   * Corrige un texte complet comme le ferait le clavier mot après mot, puis la grammaire.
   * N'apprend rien : c'est une simulation (utile pour les tests et l'outil en ligne de commande).
   */
  corrigerTexte(texte) {
    const corrections = [];
    const suggestions = [];
    const mots = tokeniser(texte, (f) => this.lexique.contient(f));
    const remplacements = [];
    let precedent = null;
    for (const m of mots) {
      const contexte = { precedent: m.debutProposition ? null : precedent, debutPhrase: m.debutPhrase };
      const a = this.analyserMot(m.texte, contexte);
      if (a.correction && a.auto) {
        remplacements.push({ debut: m.debut, fin: m.fin, apres: a.correction });
        corrections.push({ type: "orthographe", avant: m.texte, apres: a.correction, message: a.raison });
      } else if (a.correction) {
        suggestions.push({ type: "orthographe", avant: m.texte, apres: a.correction, message: a.raison });
      }
      precedent = a.auto && a.correction ? a.correction : m.texte;
    }
    let resultat = appliquerCorrections(texte, remplacements);

    // La grammaire peut débloquer d'autres corrections (« la ou » → « là où ») : quelques passes.
    for (let passe = 0; passe < 3; passe++) {
      const trouvees = verifierGrammaire(resultat, this.lexique);
      const sures = trouvees.filter((c) => c.confiance === "haute");
      for (const c of trouvees) {
        const liste = c.confiance === "haute" ? corrections : suggestions;
        if (c.confiance === "haute" || passe === 0) {
          liste.push({ type: "grammaire", avant: c.avant, apres: c.apres, message: c.message, regle: c.regle });
        }
      }
      if (!sures.length) break;
      resultat = appliquerCorrections(resultat, sures);
    }
    return { texte: resultat, corrections, suggestions };
  }
}
