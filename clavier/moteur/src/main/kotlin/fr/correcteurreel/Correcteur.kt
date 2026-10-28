// Moteur de correction : ce que le clavier appelle à chaque mot tapé. Portage de correcteur/src/moteur.js.

package fr.correcteurreel

/** Pénalité par unité de distance de frappe, en puissances de 10 de fréquence. */
private const val PENALITE_DISTANCE = 2.0
/** Pénalité quand on change un accent que l'utilisateur a explicitement tapé (« è » au lieu de « ê »). */
private const val PENALITE_ACCENT_TAPE = 0.15
/** Fréquence attribuée à un mot appris (en occurrences par million, comme le lexique). */
private const val FREQ_MOT_APPRIS = 10.0
/**
 * Un mot valide n'est remplacé par sa version accentuée que si celle-ci est environ 20 fois plus probable
 * dans ce contexte (« foret » → « forêt », « voila » → « voilà »).
 */
private const val ECART_VERSION_ACCENTUEE = 1.3
/** Distance de frappe maximale d'un candidat (environ deux fautes). */
private const val DISTANCE_MAX = 2.0
/** Fréquence (par million) au-delà de laquelle un mot est « courant ». */
private const val FREQ_COURANTE = 5.0
/** En dessous de cette fréquence, un mot n'est jamais imposé par une correction automatique. */
private const val FREQ_MINIMALE = 0.5
/** Écart de score minimal entre les deux meilleures corrections pour corriger automatiquement. */
private const val ECART_AUTO = 0.3

private val LETTRE = Regex("\\p{L}")

/** Ce que l'on sait du mot autour : le mot précédent (dans la même proposition) et le début de phrase. */
data class ContexteMot(val precedent: String? = null, val debutPhrase: Boolean = false)

data class AnalyseMot(
    val mot: String,
    val valide: Boolean,
    /** Meilleure correction, avec la casse tapée. */
    val correction: String? = null,
    /** Vrai si le clavier doit remplacer le mot tout seul. */
    val auto: Boolean = false,
    val suggestions: List<String> = emptyList(),
    val raison: String? = null,
    val distance: Double? = null,
)

data class MotTermine(val analyse: AnalyseMot, val final: String, val apprentissage: Apprentissage)

data class CorrectionTexte(val type: String, val avant: String, val apres: String, val message: String?, val regle: String? = null)

data class ResultatTexte(val texte: String, val corrections: List<CorrectionTexte>, val suggestions: List<CorrectionTexte>)

class Candidat(val mot: String, val exact: Boolean, val distance: Double, val score: Double)

class Correcteur(val lexique: Lexique, var profil: ProfilUtilisateur = ProfilUtilisateur(lexique)) {

    // --- Un mot --------------------------------------------------------------------------------

    /** Analyse un mot que l'utilisateur vient de terminer. */
    fun analyserMot(mot: String, contexte: ContexteMot = ContexteMot()): AnalyseMot {
        val f = forme(mot)
        val modele = casse(mot)
        if (!LETTRE.containsMatchIn(f)) return AnalyseMot(mot, valide = true)

        if (profil.estValide(f)) {
            // « paul » → « Paul » : un mot qui n'existe que comme nom propre prend une majuscule.
            val lectures = lexique.lectures(f)
            if (modele == Casse.MINUSCULES && lectures.isNotEmpty() && lectures.all { it.cgram == "NPR" }) {
                return AnalyseMot(mot, true, appliquerCasse(f, Casse.CAPITALE), true, raison = "nom propre", distance = 0.0)
            }
            val accentue = versionAccentuee(f, contexte) ?: return AnalyseMot(mot, valide = true)
            val correction = ecrire(accentue, modele)
            return AnalyseMot(
                mot, true, correction, true, listOf(correction, mot),
                "« $f » existe mais « $accentue » est bien plus probable ici", 0.0,
            )
        }

        val candidats = candidats(f, contexte)
        val suggestions = candidats.take(3).map { ecrire(it.mot, modele) }
        val premier = candidats.firstOrNull()
            ?: return AnalyseMot(mot, false, suggestions = suggestions, raison = "mot inconnu, aucune correction proche")
        val second = candidats.getOrNull(1)
        val correction = ecrire(premier.mot, modele)

        // Une majuscule en milieu de phrase signale souvent un nom propre : on suggère sans imposer.
        val nomPropre = modele == Casse.CAPITALE && !contexte.debutPhrase
        val k = cle(f)
        val auto: Boolean
        val raison: String
        if (premier.exact) {
            // Seuls les accents, l'apostrophe ou le trait d'union manquent : la faute est certaine.
            auto = !nomPropre || profil.estAppris(premier.mot)
            raison = if ('\'' in premier.mot || '-' in premier.mot) "apostrophe ou trait d'union manquant" else "accent manquant"
        } else {
            val limite = if (k.length <= 3) 0.5 else if (k.length <= 6) 1.0 else 1.5
            val net = second == null || premier.score - second.score >= ECART_AUTO
            // Un mot inconnu avec majuscule (« Paul » en début de phrase) ou très court (« jsp », « tkt » : souvent
            // une abréviation) n'est remplacé que par un mot courant, et un mot moyen jamais par un mot rarissime.
            // Un mot long proche d'un seul mot existant, même rare, est en revanche une faute presque certaine.
            val freq = if (profil.estAppris(premier.mot)) FREQ_MOT_APPRIS else lexique.frequence(premier.mot)
            val freqRequise = when {
                modele == Casse.CAPITALE || k.length <= 3 -> FREQ_COURANTE
                k.length <= 7 -> FREQ_MINIMALE
                else -> 0.0
            }
            auto = !nomPropre && modele != Casse.MIXTE && premier.distance <= limite && net && freq >= freqRequise
            raison = "faute de frappe probable"
        }
        return AnalyseMot(mot, false, correction, auto, suggestions, raison, premier.distance)
    }

    /** Candidats de correction pour une forme inconnue, du plus probable au moins probable. */
    fun candidats(f: String, contexte: ContexteMot = ContexteMot()): List<Candidat> {
        val k = cle(f)
        val vus = LinkedHashMap<String, Candidat>()
        fun examiner(cleCandidate: String, distanceCle: Double? = null) {
            for (m in formesParCle(cleCandidate)) {
                if (m in vus) continue
                val exact = cleCandidate == k
                val distance = (if (exact) 0.0 else distanceCle ?: distanceFrappe(k, cleCandidate)) + penaliteAccents(f, m)
                vus[m] = Candidat(m, exact, distance, score(m, contexte) - PENALITE_DISTANCE * distance)
            }
        }
        examiner(k)
        for (v in variantes(k)) examiner(v)
        // Deux fautes dans le même mot : on ne cherche plus loin que si rien de proche n'a été trouvé.
        if (k.length >= 4 && vus.values.none { it.distance <= 1 }) {
            val cles = lexique.clesVoisines(k).toList() + profil.apprisParCle.keys
            for (c in cles) {
                val d = distanceFrappe(k, c, DISTANCE_MAX)
                if (d <= DISTANCE_MAX) examiner(c, d)
            }
        }
        // Les bonnes lettres sans les accents (« reel », « Lea ») l'emportent toujours sur une faute de frappe.
        return vus.values.sortedWith(compareByDescending<Candidat> { it.exact }.thenByDescending { it.score })
    }

    /** Mots du lexique et mots appris partageant une clé. */
    fun formesParCle(k: String): List<String> {
        val appris = profil.formesApprisesParCle(k)
        val dansLexique = lexique.formesParCle(k)
        return if (appris.isNotEmpty()) dansLexique + appris else dansLexique
    }

    /**
     * Pour un mot valide sans accent, la version accentuée nettement plus probable (« foret » → « forêt »),
     * sauf si l'utilisateur a déjà refusé ce remplacement.
     */
    fun versionAccentuee(f: String, contexte: ContexteMot): String? {
        val jumeaux = formesParCle(cle(f)).filter { it != f && sansAccents(it) != it && !profil.aRefuse(f, it) }
        if (jumeaux.isEmpty()) return null
        val base = score(f, contexte)
        var meilleur: String? = null
        var meilleurScore = 0.0
        for (m in jumeaux) {
            val s = score(m, contexte) - penaliteAccents(f, m)
            if (s - base >= ECART_VERSION_ACCENTUEE && (meilleur == null || s > meilleurScore)) {
                meilleur = m
                meilleurScore = s
            }
        }
        return meilleur
    }

    /** Probabilité (logarithmique) d'un mot ici : fréquence + habitudes de l'utilisateur + contexte. */
    fun score(m: String, contexte: ContexteMot = ContexteMot()): Double {
        val dansLexique = lexique.frequence(m)
        val freq = if (dansLexique != 0.0) dansLexique else if (profil.estAppris(m)) FREQ_MOT_APPRIS else 0.0
        return StrictMath.log10(freq + 0.05) + profil.bonus(m, contexte.precedent) + bonusContexte(m, contexte.precedent)
    }

    /** Bonus selon le mot précédent : un nom après « la », un verbe accordé après « ils »… */
    fun bonusContexte(m: String, precedent: String?): Double {
        if (precedent.isNullOrEmpty()) return 0.0
        val p = forme(precedent)
        val lectures = lexique.lectures(m)
        val determinant = DETERMINANTS[p]
        if (determinant != null) {
            val (genre, nombre) = determinant
            val nominales = lectures.filter { it.cgram == "NOM" || it.cgram.startsWith("ADJ") }
            val accordees = nominales.filter {
                (genre.isEmpty() || it.genre.isEmpty() || it.genre == genre) &&
                    (nombre.isEmpty() || it.nombre.isEmpty() || it.nombre == nombre)
            }
            if (accordees.isNotEmpty()) return 0.5
            if (p in DETERMINANTS_AMBIGUS) return 0.0
            return if (nominales.isNotEmpty()) -1.0 else -1.5
        }
        val personne = SUJETS[p]
        if (personne != null) {
            if (lexique.saccordeAvec(m, personne)) return 1.0
            return if (lexique.estVerbeConjugue(m)) -0.5 else -1.0
        }
        if (lexique.lecturesVerbales(p).any { it.lemme == "avoir" || it.lemme == "être" }) {
            return if (lexique.estParticipePasse(m)) 1.0 else 0.0
        }
        return 0.0
    }

    /** Pénalise le changement d'un accent tapé volontairement (« pècheur » : l'utilisateur voulait un accent). */
    fun penaliteAccents(tape: String, candidat: String): Double {
        var penalite = 0.0
        for (c in tape) {
            if (sansAccents(c.toString()) != c.toString() && c !in candidat) penalite += PENALITE_ACCENT_TAPE
        }
        return penalite
    }

    /** Écrit un mot avec la casse tapée, ou l'écriture apprise (« Mathéo »). */
    fun ecrire(m: String, modele: Casse): String {
        val appris = profil.ecriture(m)
        if (appris != null && casse(appris) != Casse.MINUSCULES && modele == Casse.MINUSCULES) return appris
        return appliquerCasse(appris ?: m, modele)
    }

    // --- Complétion pendant la frappe ----------------------------------------------------------

    /** Propositions pour la barre de suggestions pendant qu'un mot est en cours de frappe. */
    fun suggestions(partiel: String, contexte: ContexteMot = ContexteMot(), max: Int = 3): List<String> {
        val k = cle(partiel)
        if (k.isEmpty()) return emptyList()
        val modele = casse(partiel)
        val resultats = LinkedHashMap<String, Double>()
        fun ajouter(m: String, s: Double) {
            val actuel = resultats[m]
            if (actuel == null || actuel < s) resultats[m] = s
        }
        var examinees = 0
        for (c in lexique.clesCommencantPar(k)) {
            for (m in lexique.formesParCle(c)) ajouter(m, score(m, contexte) - 0.05 * (c.length - k.length))
            if (++examinees > 20000) break
        }
        for (f in profil.appris.keys) {
            if (cle(f).startsWith(k)) ajouter(f, score(f, contexte))
        }
        // Le début d'un mot n'est pas une faute : on ne propose de corrections que faute de complétions.
        if (resultats.size < max && !profil.estValide(partiel)) {
            for (c in candidats(forme(partiel), contexte).take(max - resultats.size)) ajouter(c.mot, c.score)
        }
        return resultats.entries.sortedByDescending { it.value }.take(max).map { ecrire(it.key, modele) }
    }

    // --- Événements du clavier ------------------------------------------------------------------

    /**
     * L'utilisateur vient de terminer un mot (espace ou ponctuation). Renvoie l'analyse et ce qui a été
     * appris ; si l'analyse est automatique, le clavier remplace le mot par la correction.
     */
    fun motTermine(mot: String, contexte: ContexteMot = ContexteMot()): MotTermine {
        val analyse = analyserMot(mot, contexte)
        val final = if (analyse.auto && analyse.correction != null) analyse.correction else mot
        val apprentissage = profil.observer(
            final,
            precedent = contexte.precedent,
            nomPropre = casse(mot) == Casse.CAPITALE && !contexte.debutPhrase,
        )
        return MotTermine(analyse, final, apprentissage)
    }

    /**
     * L'utilisateur a annulé une correction automatique (retour arrière juste après) pour garder ce qu'il
     * avait tapé. Le mot n'est appris que s'il n'est pas une simple faute d'accent d'un mot existant.
     */
    fun annulerCorrection(tape: String, correction: String, contexte: ContexteMot = ContexteMot()): Apprentissage {
        profil.annulerUsage(correction, contexte.precedent)
        return garderMot(tape, contexte)
    }

    /**
     * L'utilisateur garde exactement ce qu'il a tapé (case « mot tapé » de la barre de suggestions, ou
     * annulation d'une correction). Compte comme un refus de la correction que le moteur aurait faite.
     */
    fun garderMot(tape: String, contexte: ContexteMot = ContexteMot()): Apprentissage {
        val analyse = analyserMot(tape, contexte)
        if (analyse.correction != null) profil.noterRefus(tape, analyse.correction)
        return profil.observer(
            tape,
            precedent = contexte.precedent,
            annulee = analyse.auto,
            fauteProbableDe = if (analyse.auto && (analyse.distance ?: 0.0) > 0) forme(analyse.correction!!) else null,
            nomPropre = casse(tape) == Casse.CAPITALE && !contexte.debutPhrase,
        )
    }

    // --- Un texte entier ------------------------------------------------------------------------

    /** Vérifie la grammaire (voir Grammaire.kt). */
    fun verifierGrammaire(texte: String, enCours: Boolean = false) = verifierGrammaire(texte, lexique, enCours)

    /**
     * Corrige un texte complet comme le ferait le clavier mot après mot, puis la grammaire.
     * N'apprend rien : c'est une simulation (utile pour les tests).
     */
    fun corrigerTexte(texte: String): ResultatTexte {
        val corrections = mutableListOf<CorrectionTexte>()
        val suggestions = mutableListOf<CorrectionTexte>()
        val remplacements = mutableListOf<Remplacement>()
        var precedent: String? = null
        for (m in tokeniser(texte) { lexique.contient(it) }) {
            val contexte = ContexteMot(if (m.debutProposition) null else precedent, m.debutPhrase)
            val a = analyserMot(m.texte, contexte)
            if (a.correction != null && a.auto) {
                remplacements += Remplacement(m.debut, m.fin, a.correction)
                corrections += CorrectionTexte("orthographe", m.texte, a.correction, a.raison)
            } else if (a.correction != null) {
                suggestions += CorrectionTexte("orthographe", m.texte, a.correction, a.raison)
            }
            precedent = if (a.auto && a.correction != null) a.correction else m.texte
        }
        var resultat = appliquerCorrections(texte, remplacements)

        // La grammaire peut débloquer d'autres corrections (« la ou » → « là où ») : quelques passes.
        for (passe in 0 until 3) {
            val trouvees = verifierGrammaire(resultat, lexique)
            val sures = trouvees.filter { it.confiance == Confiance.HAUTE }
            for (c in trouvees) {
                val haute = c.confiance == Confiance.HAUTE
                if (haute || passe == 0) {
                    (if (haute) corrections else suggestions) += CorrectionTexte("grammaire", c.avant, c.apres, c.message, c.regle)
                }
            }
            if (sures.isEmpty()) break
            resultat = appliquerCorrections(resultat, sures.map { it.enRemplacement() })
        }
        return ResultatTexte(resultat, corrections, suggestions)
    }
}
