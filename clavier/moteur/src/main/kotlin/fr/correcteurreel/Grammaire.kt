// Règles de grammaire contextuelles : homophones (a/à, ou/où…), accord sujet-verbe,
// participe passé ou infinitif (« j'ai manger » → « j'ai mangé »). Portage de correcteur/src/grammaire.js.
//
// Chaque règle examine un mot et ses voisins DANS LA MÊME PROPOSITION et peut proposer une correction :
//   - confiance HAUTE   : le clavier peut l'appliquer tout seul ;
//   - confiance MOYENNE : à souligner et à proposer, sans l'appliquer.
// Les règles privilégient la précision : dans le doute, elles ne disent rien.

package fr.correcteurreel

enum class Confiance { HAUTE, MOYENNE }

/** Une correction de grammaire, avec sa position dans le texte vérifié. */
data class CorrectionGrammaire(
    val debut: Int,
    val fin: Int,
    val avant: String,
    val apres: String,
    val regle: String,
    val message: String,
    val confiance: Confiance,
)

private val TAG_PERSONNEL = Regex("^(ind|sub|con):(\\w+):\\d[sp]$")
private val FIN_FERMEE = Regex("[.!?…\\n,;:()\"«»]")

private class Contexte(val lex: Lexique, val enCours: Boolean, val finFermee: Boolean)

private class Proposition(
    val i: Int,
    val remplacement: String,
    val regle: String,
    val message: String,
    val confiance: Confiance = Confiance.HAUTE,
    val j: Int = i,
)

private typealias Regle = (List<Mot>, Int, Contexte) -> Proposition?

/**
 * Vérifie la grammaire d'un texte.
 *
 * @param enCours le texte est en cours de frappe : la fin du texte n'est pas la fin de la phrase
 */
fun verifierGrammaire(texte: String, lexique: Lexique, enCours: Boolean = false): List<CorrectionGrammaire> {
    val t = tokeniser(texte) { lexique.contient(it) }
    val finFermee = t.isNotEmpty() && FIN_FERMEE.containsMatchIn(texte.substring(t.last().fin))
    val ctx = Contexte(lexique, enCours, finFermee)
    val corrections = mutableListOf<CorrectionGrammaire>()
    val pris = HashSet<Int>()
    for (regle in REGLES) {
        for (i in t.indices) {
            val c = regle(t, i, ctx) ?: continue
            val indices = c.i..c.j
            if (indices.any { it in pris }) continue
            val debut = t[c.i].debut
            val fin = t[c.j].fin
            val avant = texte.substring(debut, fin)
            val apres = appliquerCasse(c.remplacement, casse(t[c.i].texte))
            if (forme(avant) == forme(apres)) continue
            pris.addAll(indices)
            corrections += CorrectionGrammaire(debut, fin, avant, apres, c.regle, c.message, c.confiance)
        }
    }
    return corrections.sortedBy { it.debut }
}

/** Applique des corrections (positions dans le texte d'origine) en partant de la fin. */
fun appliquerCorrections(texte: String, corrections: List<Remplacement>): String {
    var resultat = texte
    for (c in corrections.sortedByDescending { it.debut }) {
        resultat = resultat.substring(0, c.debut) + c.apres + resultat.substring(c.fin)
    }
    return resultat
}

data class Remplacement(val debut: Int, val fin: Int, val apres: String)

fun CorrectionGrammaire.enRemplacement() = Remplacement(debut, fin, apres)

// --- Outils -------------------------------------------------------------------------------------

private fun precedent(t: List<Mot>, i: Int) = if (i > 0 && !t[i].debutProposition) t[i - 1] else null

private fun suivant(t: List<Mot>, i: Int) = if (i + 1 < t.size && !t[i + 1].debutProposition) t[i + 1] else null

/** true : la proposition s'arrête après le mot i ; false : un mot suit ; null : pas encore tapé. */
private fun finProposition(t: List<Mot>, i: Int, ctx: Contexte): Boolean? {
    if (i + 1 < t.size) return t[i + 1].debutProposition
    if (ctx.finFermee) return true
    return if (ctx.enCours) null else true
}

private fun estNomPropre(mot: Mot) = casse(mot.texte) == Casse.CAPITALE && !mot.debutPhrase

/** « vas-tu » → « vas » : la partie verbale d'une inversion. */
private fun partieVerbale(lex: Lexique, f: String) = if (lex.contient(f)) f else f.split('-')[0]

/** "avoir", "être" ou null selon que le mot est une forme conjuguée (ou l'infinitif) d'un auxiliaire. */
private fun auxiliaire(lex: Lexique, f: String): String? {
    for (l in lex.lecturesVerbales(f)) {
        if ((l.lemme == "avoir" || l.lemme == "être") && l.tags.any { TAG_PERSONNEL.containsMatchIn(it) || it == "inf" }) {
            return l.lemme
        }
    }
    return null
}

/** Vrai si le mot est le plus souvent un nom (« chat », « travail ») plutôt qu'un pronom ou un verbe (« rien »). */
private fun estSurtoutNom(lex: Lexique, f: String): Boolean {
    val lectures = lex.lectures(f)
    val nom = lectures.filter { it.cgram == "NOM" }.sumOf { it.freq }
    val total = lectures.sumOf { it.freq }
    return nom > 0 && nom >= total / 2
}

private val RELATIFS = setOf("que", "qu'", "qui", "dont", "où", "quoi")

/** Un relatif (« ce QUE tu dis a… ») rend le sujet du verbe suivant difficile à trouver : on baisse la confiance. */
private fun contientRelatif(t: List<Mot>, i: Int): Boolean {
    for (k in i - 1 downTo 0) {
        if (t[k].forme in RELATIFS) return true
        if (t[k].debutProposition) break
    }
    return false
}

private class Sujet(val index: Int, val forme: String, val personne: String)

/**
 * Cherche le pronom sujet du verbe en position i, en remontant les pronoms compléments :
 * « il NOUS LE donne » → « il » ; « nous LE donnons » → « nous ».
 */
private fun trouverSujet(t: List<Mot>, i: Int, lex: Lexique): Sujet? {
    var k = i - 1
    val chaine = ArrayDeque<Int>()
    while (k >= 0 && !t[k + 1].debutProposition && t[k].forme in CLITIQUES) {
        chaine.addFirst(k)
        k--
    }
    val avant = if (k >= 0 && !t[k + 1].debutProposition) t[k] else null
    if (avant != null && avant.forme in SUJETS) {
        // « lui et elle mangent » : le vrai sujet est coordonné, on ne sait pas l'accorder.
        if (avant.forme in TONIQUES && k >= 2 && !t[k].debutProposition && !t[k - 1].debutProposition &&
            t[k - 1].forme in setOf("et", "ou", "ni")
        ) {
            val x = t[k - 2]
            val nom = casse(x.texte) == Casse.CAPITALE ||
                (lex.aCategorie(x.forme, "NOM", "NPR") && !lex.estVerbeConjugue(x.forme))
            if (x.forme in TONIQUES || nom) return null
        }
        return Sujet(k, avant.forme, SUJETS.getValue(avant.forme))
    }
    if (chaine.isNotEmpty() && (avant == null || avant.forme in OUVRANTS)) {
        val premier = t[chaine.first()].forme
        if (premier == "nous" || premier == "vous") return Sujet(chaine.first(), premier, SUJETS.getValue(premier))
    }
    return null
}

// --- Locutions figées ---------------------------------------------------------------------------

private class Expression(
    motif: List<String>,
    val par: String,
    val si: ((List<Mot>, Int, Int, Contexte) -> Boolean?)? = null,
) {
    val cles = motif.map(::cle)
}

private val siQuestion: (List<Mot>, Int, Int, Contexte) -> Boolean? = { t, i, _, _ ->
    val p = precedent(t, i)
    p == null || p.forme in INTERROGATIFS
}
private val siFinProposition: (List<Mot>, Int, Int, Contexte) -> Boolean? = { t, _, j, ctx -> finProposition(t, j, ctx) }

private val EXPRESSIONS = listOf(
    Expression(listOf("bien", "sur"), "bien sûr") { t, _, j, ctx ->
        val n = suivant(t, j)
        if (n != null) n.forme !in DETERMINANTS else finProposition(t, j, ctx)
    },
    Expression(listOf("la", "bas"), "là-bas"),
    Expression(listOf("au", "dela"), "au-delà"),
    Expression(listOf("aujourd", "hui"), "aujourd'hui"),
    Expression(listOf("quelqu", "un"), "quelqu'un"),
    // « c'est peut-être » mais « il peut être »
    Expression(listOf("peut", "etre"), "peut-être") { t, i, _, ctx ->
        val p = precedent(t, i)
        p == null || (ctx.lex.estVerbeConjugue(p.forme) && p.forme !in SUJETS)
    },
    // « est-ce que tu viens » mais « c'est ce que je veux »
    Expression(listOf("est", "ce", "que"), "est-ce que", siQuestion),
    Expression(listOf("est", "ce", "qu'"), "est-ce qu'", siQuestion),
    Expression(listOf("c'", "est", "a", "dire"), "c'est-à-dire"),
    Expression(listOf("tout", "a", "fait"), "tout à fait") { t, _, j, ctx ->
        val n = suivant(t, j)
        if (n != null) n.forme !in DETERMINANTS && !ctx.lex.estParticipePasse(n.forme) else finProposition(t, j, ctx)
    },
    Expression(listOf("a", "peu", "pres"), "à peu près"),
    Expression(listOf("a", "plus", "tard"), "à plus tard"),
    Expression(listOf("a", "plus"), "à plus", siFinProposition),
    Expression(listOf("a", "toute"), "à toute", siFinProposition),
) + listOf("celui", "celle", "ceux", "celles").flatMap { d ->
    listOf(Expression(listOf(d, "la"), "$d-là"), Expression(listOf(d, "ci"), "$d-ci"))
}

private fun regleExpressions(t: List<Mot>, i: Int, ctx: Contexte): Proposition? {
    for (e in EXPRESSIONS) {
        val j = i + e.cles.size - 1
        if (j >= t.size) continue
        var ok = true
        var k = 0
        while (k < e.cles.size && ok) {
            ok = cle(t[i + k].forme) == e.cles[k] && (k == 0 || !t[i + k].debutProposition)
            k++
        }
        if (!ok) continue
        if (e.si != null && e.si.invoke(t, i, j, ctx) != true) continue
        return Proposition(i, e.par, "locution", "Locution : « ${e.par} »", Confiance.HAUTE, j)
    }
    return null
}

// --- a / à --------------------------------------------------------------------------------------

private val AVANT_A_VERBE = setOf(
    "il", "elle", "on", "qui", "ça", "cela", "ceci", "y", "n'", "l'", "m'", "t'", "lui", "leur", "en", "nous", "vous",
)
private val AVANT_A_PREPOSITION = setOf("jusqu'", "grâce", "face", "quant", "rapport")
// « a priori », « a fortiori » : locutions latines, sans accent.
private val LATIN = setOf("priori", "posteriori", "fortiori", "minima", "maxima")
private val APRES_A_PREPOSITION = setOf(
    "côté", "cause", "partir", "peine", "propos", "travers", "part", "bientôt", "demain", "chaque", "quel", "quelle",
    "quels", "quelles", "qui", "quoi", "moi", "toi", "lui", "nous", "vous", "eux", "pied", "cheval", "vélo", "fond",
    "midi", "minuit", "condition", "présent", "nouveau", "gauche", "droite",
)

private fun regleA(t: List<Mot>, i: Int, ctx: Contexte): Proposition? {
    val lex = ctx.lex
    val f = t[i].forme
    if (f != "a" && f != "à") return null
    val p = precedent(t, i)
    val n = suivant(t, i)
    if (p != null && p.forme in AVANT_A_VERBE) {
        if (f == "à" && !(n != null && n.forme in APRES_A_PREPOSITION)) {
            return Proposition(i, "a", "a/à", "Après « ${p.texte} », c'est le verbe avoir : « a » (sans accent)")
        }
        return null
    }
    // « Marie a… » : un mot avec majuscule devant « a » est sans doute un sujet, même en début de phrase.
    if (f == "à" || (p != null && casse(p.texte) == Casse.CAPITALE)) return null
    // « ce qu'il voulait a été fait » : « a » est l'auxiliaire du participe qui suit.
    if (n != null && lex.estParticipePasse(n.forme) && n.forme !in APRES_A_PREPOSITION) return null
    if (n != null && n.forme in LATIN) return null

    val message = "Ici c'est la préposition « à » (on ne peut pas dire « avait »)"
    if (p != null && p.forme in AVANT_A_PREPOSITION) return Proposition(i, "à", "a/à", message)
    if (n != null && n.forme in APRES_A_PREPOSITION) return Proposition(i, "à", "a/à", message)
    val relatif = contientRelatif(t, i)
    if (p != null) {
        val pDetermine = i >= 2 && !t[i - 1].debutProposition && t[i - 2].forme in DETERMINANTS
        val pVerbal = !pDetermine && p.forme !in SUJETS &&
            (lex.estVerbeConjugue(p.forme) || lex.estInfinitif(p.forme) || lex.estParticipePasse(p.forme))
        // « je vais a Paris », « j'ai pensé a toi », « c'est a moi »
        if (pVerbal) return Proposition(i, "à", "a/à", message, if (relatif) Confiance.MOYENNE else Confiance.HAUTE)
    }
    if (n != null && lex.estInfinitif(n.forme)) {
        // « rien a manger » → « à » ; mais « le chat a manger » est sans doute « le chat a mangé ».
        val pNom = p != null && estSurtoutNom(lex, p.forme)
        return Proposition(i, "à", "a/à", message, if (pNom || relatif) Confiance.MOYENNE else Confiance.HAUTE)
    }
    // « A demain », « A mon avis » en début de phrase
    if (t[i].debutPhrase && n != null) return Proposition(i, "à", "a/à", message)
    return null
}

// --- Accord du verbe avec un pronom sujet -------------------------------------------------------

private val HOMOPHONES_APRES_SUJET = mapOf("3p" to mapOf("son" to "sont", "on" to "ont"))

private fun regleAccord(t: List<Mot>, i: Int, ctx: Contexte): Proposition? {
    val lex = ctx.lex
    val f = t[i].forme
    val sujet = trouverSujet(t, i, lex) ?: return null
    val homophone = HOMOPHONES_APRES_SUJET[sujet.personne]?.get(f)
    if (homophone != null) {
        return Proposition(i, homophone, "accord", "Après « ${sujet.forme} », il faut le verbe : « $homophone »")
    }
    if (!lex.estVerbeConjugue(f) || lex.saccordeAvec(f, sujet.personne)) return null

    // Même verbe, même temps, à la bonne personne : « ils mange » → « mangent ».
    class Option(val forme: String, val score: Double)
    val options = mutableListOf<Option>()
    for (l in lex.lecturesVerbales(f)) {
        for (tag in l.tags) {
            val m = TAG_PERSONNEL.find(tag) ?: continue
            val (mode, temps) = m.destructured
            for (c in lex.conjuguer(l.lemme, "$mode:$temps:${sujet.personne}")) {
                options += Option(c.forme, StrictMath.log10(l.freq + 0.1) + if (mode == "ind") 1 else 0)
            }
        }
    }
    if (options.isEmpty()) return null
    val tries = options.sortedByDescending { it.score }
    val choix = tries[0].forme
    val rival = tries.firstOrNull { it.forme != choix }
    val confiance = if (rival != null && tries[0].score - rival.score < 0.5) Confiance.MOYENNE else Confiance.HAUTE
    return Proposition(i, choix, "accord", "Le verbe s'accorde avec « ${sujet.forme} » : « $choix »", confiance)
}

// --- Participe passé après un auxiliaire : « j'ai manger » → « j'ai mangé » ---------------------

private val ACCORD_ETRE = mapOf("elle" to ("f" to "s"), "ils" to ("m" to "p"), "elles" to ("f" to "p"), "nous" to ("m" to "p"))

private fun regleAuxiliaire(t: List<Mot>, i: Int, ctx: Contexte): Proposition? {
    val lex = ctx.lex
    val f = t[i].forme
    val lectures = lex.lecturesVerbales(f).filter { it.lemme.endsWith("er") }
    val lecture = lectures.firstOrNull { "inf" in it.tags && f.endsWith("er") }
        ?: if (f.endsWith("ez")) lectures.firstOrNull { l -> l.tags.any { it.endsWith(":2p") } } else null
    if (lecture == null) return null

    var k = i - 1
    while (k >= 0 && !t[k + 1].debutProposition && t[k].forme in ADVERBES_INTERCALES) k--
    if (k < 0 || t[k + 1].debutProposition) return null
    val aux = auxiliaire(lex, t[k].forme) ?: return null
    val avantAux = if (k > 0 && !t[k].debutProposition) t[k - 1] else null
    // « il y a à manger » ; et « a » sans sujet devant est peut-être « à » (traité par la règle a/à).
    if (avantAux?.forme == "y") return null
    if (t[k].forme == "a" && !(avantAux != null && (avantAux.forme in AVANT_A_VERBE || estNomPropre(avantAux)))) return null
    val sujet = trouverSujet(t, k, lex)
    if (aux == "être" && sujet == null) return null

    val (genre, nombre) = if (aux == "être") ACCORD_ETRE[sujet!!.forme] ?: ("m" to "s") else ("m" to "s")
    val participes = lex.conjuguer(lecture.lemme, "par:pas")
    val participe = participes.firstOrNull { it.genre == genre && it.nombre == nombre }
        ?: participes.firstOrNull { it.genre.ifEmpty { "m" } == genre && it.nombre.ifEmpty { "s" } == nombre }
        ?: return null
    return Proposition(
        i, participe.forme, "participe",
        "Après l'auxiliaire « ${t[k].texte} », on écrit le participe passé : « ${participe.forme} »",
    )
}

// --- Infinitif après un verbe ou une préposition : « je vais mangé » → « je vais manger » --------

private val MODAUX = setOf("pouvoir", "vouloir", "devoir", "aller", "falloir", "savoir", "oser")
private val PREFERENCES = setOf("aimer", "adorer", "détester", "préférer")
private val PREPOSITIONS_INFINITIF = setOf("pour", "à", "de", "d'", "sans")
private val PRONOMS_INDEFINIS = setOf("rien", "chose", "personne", "quoi", "quelqu'un", "ça", "cela", "ceci")

private fun regleInfinitif(t: List<Mot>, i: Int, ctx: Contexte): Proposition? {
    val lex = ctx.lex
    val f = t[i].forme
    // Un nom (« le passé », « un employé ») ou « été » ne sont jamais à changer en infinitif.
    if (lex.aCategorie(f, "NOM")) return null
    val lectures = lex.lecturesVerbales(f).filter { it.lemme.endsWith("er") && lex.estInfinitif(it.lemme) }
    val lecture = lectures.firstOrNull { "par:pas" in it.tags }
        ?: if (f.endsWith("ez")) lectures.firstOrNull { l -> l.tags.any { it.endsWith(":2p") } } else null
    if (lecture == null) return null

    var k = i - 1
    var clitique = false
    while (k >= 0 && !t[k + 1].debutProposition &&
        (t[k].forme in ADVERBES_INTERCALES || (t[k].forme in CLITIQUES && t[k].forme !in SUJETS))
    ) {
        if (t[k].forme in CLITIQUES) clitique = true
        k--
    }
    if (k < 0 || t[k + 1].debutProposition) return null
    val declencheur = t[k]
    val lemmes = lex.lecturesVerbales(partieVerbale(lex, declencheur.forme)).map { it.lemme }
    if (declencheur.forme in PREPOSITIONS_INFINITIF) {
        // « rien de prévu », « quelque chose de cassé » : le participe y est un adjectif.
        if ((declencheur.forme == "de" || declencheur.forme == "d'") && k > 0 && t[k - 1].forme in PRONOMS_INDEFINIS) {
            return null
        }
    } else if (lemmes.none { it in MODAUX || (it in PREFERENCES && !clitique) }) {
        return null
    }
    return Proposition(
        i, lecture.lemme, "infinitif",
        "Après « ${declencheur.texte} », on écrit l'infinitif : « ${lecture.lemme} »",
    )
}

// --- ou / où ------------------------------------------------------------------------------------

private val AVANT_OU_RELATIF = setOf("d'", "par", "importe", "jusqu'")
private val LIEUX_TEMPS = setOf(
    "jour", "jours", "moment", "endroit", "endroits", "lieu", "ville", "pays", "maison", "instant", "heure", "année",
    "époque", "soir", "matin", "nuit", "semaine", "mois", "période", "cas", "pièce", "chambre", "rue", "place", "coin",
    "fois", "temps",
)
private val VERBES_INTERROGATION = setOf("savoir", "demander", "ignorer")
private val SUJETS_APRES_OU = SUJETS.keys + setOf("c'", "ça", "ce")
private val CLITIQUES_APRES_OU = setOf("t'", "m'", "s'", "l'", "y", "en", "me", "te", "se")

private fun regleOu(t: List<Mot>, i: Int, ctx: Contexte): Proposition? {
    val lex = ctx.lex
    if (t[i].forme != "ou") return null
    val p = precedent(t, i)
    val n = suivant(t, i)
    val message = "« où » (lieu, moment) prend un accent ; « ou » sans accent veut dire « ou bien »"
    if (p != null && p.forme in AVANT_OU_RELATIF) return Proposition(i, "où", "ou/où", message)
    val nSujet = n != null && n.forme in SUJETS_APRES_OU
    if (p?.forme == "la" && nSujet) {
        return Proposition(i - 1, "là où", "ou/où", "« là où » : les deux mots prennent un accent", Confiance.HAUTE, i)
    }
    if (p != null && p.forme in LIEUX_TEMPS && nSujet) return Proposition(i, "où", "ou/où", message)
    if (p != null && nSujet) {
        // « je sais (pas) où il est », « je me demande où tu vas »
        val verbe = if (p.forme == "pas" && i >= 2 && !t[i - 1].debutProposition) t[i - 2] else p
        if (lex.lecturesVerbales(partieVerbale(lex, verbe.forme)).any { it.lemme in VERBES_INTERROGATION }) {
            return Proposition(i, "où", "ou/où", message)
        }
    }
    if (t[i].debutPhrase && n != null) {
        // « Où est… ? », « Où t'es ? », « Où vas-tu ? »
        var k = i + 1
        while (k < t.size && !t[k].debutProposition && t[k].forme in CLITIQUES_APRES_OU) k++
        val v = if (k < t.size && !t[k].debutProposition) t[k] else null
        if (v != null && v.forme !in SUJETS &&
            (v.forme.startsWith("est-ce") || lex.estVerbeConjugue(partieVerbale(lex, v.forme)))
        ) {
            return Proposition(i, "où", "ou/où", message)
        }
    }
    if (n?.forme == "ça" && finProposition(t, i + 1, ctx) == true) return Proposition(i, "où", "ou/où", message)
    return null
}

// --- la / là ------------------------------------------------------------------------------------

private val DEMONSTRATIFS = setOf("ce", "cet", "cette", "ces")

private fun regleLa(t: List<Mot>, i: Int, ctx: Contexte): Proposition? {
    val lex = ctx.lex
    if (t[i].forme != "la" || finProposition(t, i, ctx) != true) return null
    val p = precedent(t, i) ?: return null
    val message = "« là » (à cet endroit) prend un accent ; « la » est un article ou un pronom"
    // « ce jour la » → « ce jour-là »
    if (i >= 2 && !t[i - 1].debutProposition && t[i - 2].forme in DEMONSTRATIFS && lex.aCategorie(p.forme, "NOM")) {
        return Proposition(i - 1, "${p.forme}-là", "la/là", message, Confiance.HAUTE, i)
    }
    val ici = p.forme == "et" && i >= 2 && t[i - 2].forme == "ici"
    if (p.forme == "par" || ici || auxiliaire(lex, p.forme) == "être") return Proposition(i, "là", "la/là", message)
    return null
}

// --- sur / sûr ----------------------------------------------------------------------------------

private val SUR = mapOf("sur" to "sûr", "sure" to "sûre", "surs" to "sûrs", "sures" to "sûres")
private val INTENSIFS = setOf("pas", "plus", "bien", "très", "tout", "trop", "vraiment", "assez", "presque", "si")

private fun regleSur(t: List<Mot>, i: Int, ctx: Contexte): Proposition? {
    val remplacement = SUR[t[i].forme] ?: return null
    var p = precedent(t, i)
    if (p != null && p.forme in INTENSIFS) p = precedent(t, i - 1)
    if (p == null || auxiliaire(ctx.lex, p.forme) != "être") return null
    val n = suivant(t, i)
    if (if (n != null) n.forme !in setOf("de", "d'", "que", "qu'", "et") else finProposition(t, i, ctx) != true) return null
    return Proposition(
        i, remplacement, "sur/sûr", "« sûr » (certain) prend un accent circonflexe ; « sur » veut dire « dessus »",
    )
}

// --- ce / se, c'est / s'est ---------------------------------------------------------------------

private fun regleCeSe(t: List<Mot>, i: Int, ctx: Contexte): Proposition? {
    val lex = ctx.lex
    val f = t[i].forme
    if (f !in setOf("ce", "c'", "ses", "ces")) return null
    var k = i - 1
    if (k >= 0 && !t[k + 1].debutProposition && (t[k].forme == "ne" || t[k].forme == "n'")) k--
    if (k < 0 || t[k + 1].debutProposition) return null
    val sujet = t[k].forme
    if (sujet !in setOf("il", "elle", "on", "ils", "elles")) return null
    val n = suivant(t, i) ?: return null
    val message = "Devant un verbe, après un pronom sujet, c'est le pronom « se » / « s' »"
    if (f == "ce" && lex.estVerbeConjugue(partieVerbale(lex, n.forme))) return Proposition(i, "se", "ce/se", message)
    if (sujet !in setOf("il", "elle", "on")) return null
    // « il c'est trompé » → « il s'est trompé » ; « il ses trompé » → « il s'est trompé »
    if (f == "c'" && n.forme == "est") {
        val v = suivant(t, i + 1)
        return if (v != null && lex.estParticipePasse(v.forme)) Proposition(i, "s'", "ce/se", message) else null
    }
    if ((f == "ses" || f == "ces") && lex.estParticipePasse(n.forme) && !lex.aCategorie(n.forme, "NOM")) {
        return Proposition(i, "s'est", "ce/se", message)
    }
    return null
}

// --- sa / ça ------------------------------------------------------------------------------------

private val APRES_CA = setOf("m'", "me", "t'", "te", "nous", "vous", "lui", "leur", "y", "en", "ne", "n'")

private fun regleSaCa(t: List<Mot>, i: Int, ctx: Contexte): Proposition? {
    val lex = ctx.lex
    if (t[i].forme != "sa") return null
    val n = suivant(t, i)
    val message = "« ça » (= cela) ; « sa » est un déterminant (« sa maison »)"
    if (n == null) return if (finProposition(t, i, ctx) == true) Proposition(i, "ça", "sa/ça", message) else null
    if (n.forme in APRES_CA) return Proposition(i, "ça", "sa/ça", message)
    // « sa va », « sa fait » : un verbe que « sa » ne peut pas déterminer
    val nomFeminin = lex.lectures(n.forme).any {
        (it.cgram == "NOM" || it.cgram.startsWith("ADJ")) && it.genre != "m" && it.nombre != "p"
    }
    if (!nomFeminin && lex.estVerbeConjugue(partieVerbale(lex, n.forme))) return Proposition(i, "ça", "sa/ça", message)
    return null
}

// --- ces / ses / c'est --------------------------------------------------------------------------

private val APRES_CEST = setOf(
    "bon", "bien", "vrai", "normal", "super", "ça", "moi", "toi", "lui", "eux", "pour", "quoi", "qui", "possible",
    "impossible", "dommage", "génial", "sûr", "clair", "fini", "dur", "facile", "compliqué", "beau", "cool", "top", "nul",
    "mieux", "juste", "faux", "grave", "mort", "quand", "comme", "ok", "là", "ici", "rien", "mal", "dingue", "ouf",
    "chaud", "chiant", "drôle", "marrant", "simple", "gentil", "sympa", "incroyable", "important",
)
private val AMPLIFICATEURS = setOf("pas", "trop", "vraiment", "tellement", "très", "plus", "toujours", "jamais")

private fun regleCesCest(t: List<Mot>, i: Int, @Suppress("UNUSED_PARAMETER") ctx: Contexte): Proposition? {
    val f = t[i].forme
    if (f != "ces" && f != "ses") return null
    var n = suivant(t, i)
    if (n != null && n.forme in AMPLIFICATEURS) n = suivant(t, i + 1)
    if (n == null || n.forme !in APRES_CEST) return null
    return Proposition(
        i, "c'est", "ces/c'est", "« c'est » (= cela est) ; « ces » et « ses » sont des déterminants pluriels",
    )
}

// --- et / est -----------------------------------------------------------------------------------

private fun regleEtEst(t: List<Mot>, i: Int, @Suppress("UNUSED_PARAMETER") ctx: Contexte): Proposition? {
    if (t[i].forme != "et") return null
    val p = precedent(t, i)
    if (p == null || p.forme !in setOf("il", "on", "c'")) return null
    return Proposition(i, "est", "et/est", "« est » (verbe être) ; « et » sert à relier deux éléments")
}

private val REGLES: List<Regle> = listOf(
    ::regleExpressions, ::regleA, ::regleAccord, ::regleAuxiliaire, ::regleInfinitif, ::regleOu, ::regleLa, ::regleSur,
    ::regleCeSe, ::regleSaCa, ::regleCesCest, ::regleEtEst,
)
