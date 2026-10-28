// Ce que le clavier apprend de son utilisateur, avec des garde-fous pour ne jamais apprendre une faute.
// Portage de correcteur/src/profil.js.
//
// Deux choses bien séparées :
//   1. ce qui est VALIDE : le lexique de référence + les mots appris (prénoms, argot, abréviations…) ;
//   2. ce qui est FRÉQUENT pour cet utilisateur : sert seulement à classer les suggestions.
//
// Un mot inconnu n'est jamais appris s'il n'est qu'une version sans accents (ou sans apostrophe,
// sans trait d'union) d'un mot existant : « reel », « tres », « aujourdhui » restent des fautes,
// même tapés cent fois. Seul un ajout manuel explicite et forcé peut l'autoriser (« un reel Instagram »).

package fr.correcteurreel

import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.doubleOrNull
import kotlinx.serialization.json.int
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.long
import kotlinx.serialization.json.longOrNull
import kotlinx.serialization.json.put

object Seuils {
    /** Nombre de fois qu'un mot inconnu doit être tapé avant d'être appris… */
    const val OCCURRENCES = 3
    /** …dans au moins ce nombre de contextes différents (mot précédent). */
    const val CONTEXTES = 2
    /** Un mot avec une majuscule en milieu de phrase (probablement un nom propre) est appris plus vite. */
    const val OCCURRENCES_NOM_PROPRE = 2
    /** Si le correcteur prend le mot pour une faute de frappe, il faut annuler sa correction ce nombre de fois. */
    const val ANNULATIONS = 2
}

private const val MAX_CONTEXTES = 5

enum class Statut { VALIDE, APPRIS, QUARANTAINE, BLOQUE, IGNORE }

data class Apprentissage(val statut: Statut, val raison: String? = null)

data class AjoutMot(val ajoute: Boolean, val raison: String? = null, val correction: String? = null)

class MotAppris(val ecriture: String?, val source: String, var occurrences: Int, val depuis: Long)

class MotEnQuarantaine(var ecriture: String) {
    var occurrences = 0
    val contextes = mutableListOf<String>()
    var annulations = 0
    var fauteProbableDe: String? = null
    var raison: String? = null
}

class MotBloque(val correction: String) {
    var tentatives = 0
    var raison: String? = null
}

class ProfilUtilisateur(val lexique: Lexique) {
    /** Désactivé dans les champs de mot de passe et en navigation privée. */
    var apprentissageActif = true
    val usages = LinkedHashMap<String, Int>()
    val bigrammes = LinkedHashMap<String, Int>()
    val appris = LinkedHashMap<String, MotAppris>()
    val quarantaine = LinkedHashMap<String, MotEnQuarantaine>()
    val bloques = LinkedHashMap<String, MotBloque>()
    val refus = LinkedHashMap<String, Int>()
    val apprisParCle = LinkedHashMap<String, MutableList<String>>()

    // --- Ce qui est valide -------------------------------------------------------------------

    fun estValide(mot: String): Boolean {
        val f = forme(mot)
        if (lexique.contient(f) || appris.containsKey(f)) return true
        // « as-tu », « dis-moi », « va-t-il » : valides si chaque partie l'est.
        if ('-' in f) return f.split('-').all { it == "t" || lexique.contient(it) || appris.containsKey(it) }
        return false
    }

    fun estAppris(mot: String) = appris.containsKey(forme(mot))

    /** Mots appris ayant cette clé (pour corriger « Matheo » en « Mathéo » une fois le prénom appris). */
    fun formesApprisesParCle(k: String): List<String> = apprisParCle[k] ?: emptyList()

    /**
     * Si le mot n'est qu'une version dégradée d'un mot valide (accents, apostrophe ou trait d'union
     * manquants), renvoie ce mot valide. C'est la règle qui protège contre l'apprentissage de « reel ».
     */
    fun versionCorrecte(mot: String): String? {
        if (estValide(mot)) return null
        val k = cle(mot)
        return lexique.formesParCle(k).firstOrNull() ?: formesApprisesParCle(k).firstOrNull()
    }

    // --- Observation de la frappe --------------------------------------------------------------

    /**
     * À appeler chaque fois que l'utilisateur termine un mot (espace, ponctuation), avec le mot tel
     * qu'il reste dans le texte.
     *
     * @param precedent mot précédent, pour les contextes et les bigrammes
     * @param annulee l'utilisateur vient d'annuler une correction automatique pour garder ce mot
     * @param fauteProbableDe mot dont le correcteur pense que celui-ci est une faute de frappe
     * @param nomPropre majuscule en milieu de phrase
     */
    fun observer(
        mot: String,
        precedent: String? = null,
        annulee: Boolean = false,
        fauteProbableDe: String? = null,
        nomPropre: Boolean = false,
    ): Apprentissage {
        if (!apprentissageActif) return Apprentissage(Statut.IGNORE, "apprentissage désactivé")
        val f = forme(mot)
        val p = if (precedent.isNullOrEmpty()) null else forme(precedent)
        // Un mot en début de phrase compte comme un contexte à part entière.
        val contexte = p ?: "^"

        if (estValide(f)) {
            incrementer(usages, f)
            if (p != null) incrementer(bigrammes, "$p $f")
            appris[f]?.let { it.occurrences++ }
            return Apprentissage(Statut.VALIDE)
        }

        val correct = versionCorrecte(f)
        if (correct != null) {
            val bloque = bloques.getOrPut(f) { MotBloque(correct) }
            bloque.tentatives++
            bloque.raison = "forme sans accent ou mal ponctuée de « $correct » : jamais apprise"
            return Apprentissage(Statut.BLOQUE, bloque.raison)
        }

        val q = quarantaine.getOrPut(f) { MotEnQuarantaine(mot) }
        q.occurrences++
        if (annulee) q.annulations++
        if (contexte !in q.contextes && q.contextes.size < MAX_CONTEXTES) q.contextes += contexte
        q.fauteProbableDe = fauteProbableDe
        if (nomPropre) q.ecriture = mot

        var raison: String? = null
        val pret = when {
            q.annulations >= Seuils.ANNULATIONS -> true
            fauteProbableDe != null -> {
                raison = "ressemble à une faute de frappe de « $fauteProbableDe » : appris seulement si vous " +
                    "annulez la correction ${Seuils.ANNULATIONS} fois"
                false
            }
            nomPropre -> q.occurrences >= Seuils.OCCURRENCES_NOM_PROPRE
            else -> q.occurrences >= Seuils.OCCURRENCES && q.contextes.size >= minOf(Seuils.CONTEXTES, q.occurrences)
        }

        if (pret) {
            quarantaine.remove(f)
            enregistrer(f, MotAppris(q.ecriture, "usage", q.occurrences, System.currentTimeMillis()))
            return Apprentissage(Statut.APPRIS)
        }
        q.raison = raison
            ?: "vu ${q.occurrences} fois sur ${if (nomPropre) Seuils.OCCURRENCES_NOM_PROPRE else Seuils.OCCURRENCES}"
        return Apprentissage(Statut.QUARANTAINE, q.raison)
    }

    /** L'utilisateur a annulé une correction automatique : on retire l'usage compté pour la correction. */
    fun annulerUsage(mot: String, precedent: String? = null) {
        val f = forme(mot)
        decrementer(usages, f)
        if (!precedent.isNullOrEmpty()) decrementer(bigrammes, forme(precedent) + " " + f)
    }

    fun noterRefus(tape: String, correction: String) = incrementer(refus, forme(tape) + "→" + forme(correction))

    fun aRefuse(tape: String, correction: String) = (refus[forme(tape) + "→" + forme(correction)] ?: 0) > 0

    // --- Ajout et suppression explicites -------------------------------------------------------

    /**
     * Ajout volontaire (« Ajouter au dictionnaire », carnet de contacts…).
     * Une forme sans accent d'un mot existant est refusée, sauf avec [forcer].
     */
    fun ajouter(mot: String, source: String = "manuel", forcer: Boolean = false): AjoutMot {
        val f = forme(mot)
        if (lexique.contient(f)) return AjoutMot(false, "déjà dans le dictionnaire")
        val correct = versionCorrecte(f)
        if (correct != null && !forcer) {
            return AjoutMot(
                false,
                "« $mot » est une forme sans accent de « $correct ». Confirmez pour l'ajouter quand même.",
                correct,
            )
        }
        quarantaine.remove(f)
        bloques.remove(f)
        enregistrer(f, MotAppris(mot, source, 0, System.currentTimeMillis()))
        return AjoutMot(true)
    }

    fun oublier(mot: String): Boolean {
        val f = forme(mot)
        val etait = appris.remove(f)
        if (etait != null) {
            val k = cle(f)
            val liste = apprisParCle[k].orEmpty().filter { it != f }
            if (liste.isNotEmpty()) apprisParCle[k] = liste.toMutableList() else apprisParCle.remove(k)
        }
        quarantaine.remove(f)
        usages.remove(f)
        return etait != null
    }

    private fun enregistrer(f: String, infos: MotAppris) {
        appris[f] = infos
        val liste = apprisParCle.getOrPut(cle(f)) { mutableListOf() }
        if (f !in liste) liste += f
    }

    // --- Classement ----------------------------------------------------------------------------

    /** Bonus de classement (en puissances de 10 de fréquence) pour les mots que l'utilisateur emploie. */
    fun bonus(mot: String, precedent: String? = null): Double {
        val f = forme(mot)
        var b = 0.5 * StrictMath.log10(1.0 + (usages[f] ?: 0))
        if (!precedent.isNullOrEmpty()) b += 0.8 * StrictMath.log10(1.0 + (bigrammes[forme(precedent) + " " + f] ?: 0))
        return b
    }

    /** Écriture préférée d'un mot appris (« Mathéo » plutôt que « mathéo »). */
    fun ecriture(mot: String): String? = appris[forme(mot)]?.ecriture

    // --- Sauvegarde (même format JSON que la version JavaScript) --------------------------------

    fun exporter(): JsonObject = buildJsonObject {
        put("version", 1)
        put("usages", paires(usages) { JsonPrimitive(it) })
        put("bigrammes", paires(bigrammes) { JsonPrimitive(it) })
        put("appris", paires(appris) { a ->
            buildJsonObject {
                put("depuis", a.depuis)
                put("ecriture", a.ecriture)
                put("source", a.source)
                put("occurrences", a.occurrences)
            }
        })
        put("quarantaine", paires(quarantaine) { q ->
            buildJsonObject {
                put("ecriture", q.ecriture)
                put("occurrences", q.occurrences)
                put("contextes", JsonArray(q.contextes.map(::JsonPrimitive)))
                put("annulations", q.annulations)
                put("fauteProbableDe", q.fauteProbableDe)
                put("raison", q.raison)
            }
        })
        put("bloques", paires(bloques) { b ->
            buildJsonObject {
                put("correction", b.correction)
                put("tentatives", b.tentatives)
                put("raison", b.raison)
            }
        })
        put("refus", paires(refus) { JsonPrimitive(it) })
    }

    companion object {
        fun importer(donnees: JsonElement?, lexique: Lexique): ProfilUtilisateur {
            val profil = ProfilUtilisateur(lexique)
            val o = donnees as? JsonObject ?: return profil
            if (o["version"]?.jsonPrimitive?.doubleOrNull != 1.0) return profil
            lirePaires(o["usages"]) { k, v -> profil.usages[k] = v.jsonPrimitive.int }
            lirePaires(o["bigrammes"]) { k, v -> profil.bigrammes[k] = v.jsonPrimitive.int }
            lirePaires(o["refus"]) { k, v -> profil.refus[k] = v.jsonPrimitive.int }
            lirePaires(o["quarantaine"]) { k, v ->
                val j = v.jsonObject
                profil.quarantaine[k] = MotEnQuarantaine(j.texte("ecriture") ?: k).apply {
                    occurrences = j["occurrences"]?.jsonPrimitive?.int ?: 0
                    contextes += j["contextes"]?.jsonArray?.map { it.jsonPrimitive.content }.orEmpty()
                    annulations = j["annulations"]?.jsonPrimitive?.int ?: 0
                    fauteProbableDe = j.texte("fauteProbableDe")
                    raison = j.texte("raison")
                }
            }
            lirePaires(o["bloques"]) { k, v ->
                val j = v.jsonObject
                profil.bloques[k] = MotBloque(j.texte("correction") ?: k).apply {
                    tentatives = j["tentatives"]?.jsonPrimitive?.int ?: 0
                    raison = j.texte("raison")
                }
            }
            lirePaires(o["appris"]) { k, v ->
                val j = v.jsonObject
                profil.enregistrer(
                    k,
                    MotAppris(
                        ecriture = j.texte("ecriture"),
                        source = j.texte("source") ?: "usage",
                        occurrences = j["occurrences"]?.jsonPrimitive?.int ?: 0,
                        depuis = j["depuis"]?.jsonPrimitive?.longOrNull ?: System.currentTimeMillis(),
                    ),
                )
            }
            return profil
        }
    }
}

private fun incrementer(map: MutableMap<String, Int>, k: String) {
    map[k] = (map[k] ?: 0) + 1
}

private fun decrementer(map: MutableMap<String, Int>, k: String) {
    val n = (map[k] ?: 0) - 1
    if (n > 0) map[k] = n else map.remove(k)
}

private fun <V> paires(map: Map<String, V>, valeur: (V) -> JsonElement) = buildJsonArray {
    for ((k, v) in map) add(JsonArray(listOf(JsonPrimitive(k), valeur(v))))
}

private fun lirePaires(e: JsonElement?, lire: (String, JsonElement) -> Unit) {
    for (paire in (e as? JsonArray).orEmpty()) {
        val p = paire as? JsonArray ?: continue
        val cle = p.getOrNull(0)?.jsonPrimitive?.contentOrNull ?: continue
        lire(cle, p.getOrNull(1) ?: JsonNull)
    }
}

private fun JsonObject.texte(cle: String): String? = (this[cle] as? JsonPrimitive)?.contentOrNull
