package fr.correcteurreel

import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.boolean
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.doubleOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import java.io.File
import java.util.zip.GZIPInputStream
import kotlin.math.abs
import kotlin.test.Test
import kotlin.test.fail

/** Charge le dictionnaire partagé avec la version JavaScript (correcteur/data). */
object Donnees {
    val lexique: Lexique by lazy {
        val dossier = File(System.getProperty("donnees") ?: "../../correcteur/data")
        val principal = GZIPInputStream(File(dossier, "lexique-fr.tsv.gz").inputStream()).reader().readText()
        val complements = File(dossier, "complements.tsv").readText()
        Lexique.depuisTextes(principal, complements)
    }
}

/**
 * Vérifie que le portage Kotlin donne exactement les mêmes résultats que le moteur JavaScript, sur des
 * milliers de cas générés par outils/generer-parite.mjs.
 */
class PariteTest {
    private val lexique = Donnees.lexique

    private fun cas(nom: String): JsonArray {
        val texte = javaClass.getResource("/parite/$nom")?.readText() ?: error("cas de référence absent : $nom")
        return Json.parseToJsonElement(texte).jsonArray
    }

    private fun JsonElement?.texte(): String? = (this as? JsonPrimitive)?.takeUnless { it is JsonNull }?.contentOrNull
    private fun JsonObject.texte(cle: String) = this[cle].texte()
    private fun JsonObject.bool(cle: String) = (this[cle] as? JsonPrimitive)?.booleanOrNull ?: false
    private fun JsonObject.liste(cle: String) = (this[cle] as? JsonArray)?.map { it.jsonPrimitive.content } ?: emptyList()
    private fun memeNombre(a: Double?, b: Double?) = (a == null && b == null) || (a != null && b != null && abs(a - b) < 1e-9)

    private fun ecartsAnalyse(attendu: JsonObject, obtenu: AnalyseMot): List<String> = buildList {
        if (attendu.bool("valide") != obtenu.valide) add("valide ${attendu["valide"]} ≠ ${obtenu.valide}")
        if (attendu.texte("correction") != obtenu.correction) add("correction ${attendu["correction"]} ≠ ${obtenu.correction}")
        if (attendu.bool("auto") != obtenu.auto) add("auto ${attendu["auto"]} ≠ ${obtenu.auto}")
        if (attendu.liste("suggestions") != obtenu.suggestions) add("suggestions ${attendu["suggestions"]} ≠ ${obtenu.suggestions}")
        if (attendu.texte("raison") != obtenu.raison) add("raison ${attendu["raison"]} ≠ ${obtenu.raison}")
        val distance = (attendu["distance"] as? JsonPrimitive)?.doubleOrNull
        if (!memeNombre(distance, obtenu.distance)) add("distance $distance ≠ ${obtenu.distance}")
    }

    private fun ecartsApprentissage(attendu: JsonObject, obtenu: Apprentissage): List<String> = buildList {
        if (attendu.texte("statut") != obtenu.statut.name.lowercase()) add("statut ${attendu["statut"]} ≠ ${obtenu.statut}")
        if (attendu.texte("raison") != obtenu.raison) add("raison ${attendu["raison"]} ≠ ${obtenu.raison}")
    }

    private fun verifier(nom: String, ecarts: List<String>, total: Int) {
        if (ecarts.isNotEmpty()) fail("$nom : ${ecarts.size} écarts sur $total\n" + ecarts.take(25).joinToString("\n"))
        println("$nom : $total cas identiques")
    }

    @Test
    fun `analyse des mots identique`() {
        val tous = cas("mots.json")
        val ecarts = mutableListOf<String>()
        for (c in tous.map { it.jsonObject }) {
            val mot = c.texte("mot")!!
            val contexte = ContexteMot(c.texte("precedent"), c.bool("debutPhrase"))
            val e = ecartsAnalyse(c["attendu"]!!.jsonObject, Correcteur(lexique).analyserMot(mot, contexte))
            if (e.isNotEmpty()) ecarts += "« $mot » $contexte : ${e.joinToString(" ; ")}"
        }
        verifier("mots", ecarts, tous.size)
    }

    @Test
    fun `suggestions identiques`() {
        val tous = cas("suggestions.json")
        val correcteur = Correcteur(lexique)
        val ecarts = mutableListOf<String>()
        for (c in tous.map { it.jsonObject }) {
            val partiel = c.texte("partiel")!!
            val obtenu = correcteur.suggestions(partiel, ContexteMot(c.texte("precedent")))
            val attendu = c.liste("attendu")
            if (attendu != obtenu) ecarts += "« $partiel » : $attendu ≠ $obtenu"
        }
        verifier("suggestions", ecarts, tous.size)
    }

    private fun correctionsTexte(e: JsonElement?) = (e as JsonArray).map { it.jsonObject }.map {
        listOf(it.texte("type"), it.texte("avant"), it.texte("apres"), it.texte("message"), it.texte("regle"))
    }

    @Test
    fun `textes corrigés identiques`() {
        val tous = cas("textes.json")
        val correcteur = Correcteur(lexique)
        val ecarts = mutableListOf<String>()
        for (c in tous.map { it.jsonObject }) {
            val texte = c.texte("texte")!!
            val attendu = c["attendu"]!!.jsonObject
            val obtenu = correcteur.corrigerTexte(texte)
            val corrections = obtenu.corrections.map { listOf(it.type, it.avant, it.apres, it.message, it.regle) }
            val suggestions = obtenu.suggestions.map { listOf(it.type, it.avant, it.apres, it.message, it.regle) }
            if (attendu.texte("texte") != obtenu.texte) ecarts += "« $texte » : ${attendu["texte"]} ≠ « ${obtenu.texte} »"
            else if (correctionsTexte(attendu["corrections"]) != corrections) ecarts += "« $texte » : corrections ${attendu["corrections"]} ≠ $corrections"
            else if (correctionsTexte(attendu["suggestions"]) != suggestions) ecarts += "« $texte » : suggestions ${attendu["suggestions"]} ≠ $suggestions"
        }
        verifier("textes", ecarts, tous.size)
    }

    @Test
    fun `grammaire pendant la frappe identique`() {
        val tous = cas("grammaire-en-cours.json")
        val ecarts = mutableListOf<String>()
        for (c in tous.map { it.jsonObject }) {
            val texte = c.texte("texte")!!
            val attendu = c["attendu"]!!.jsonArray.map { it.jsonObject }.map {
                listOf(it["debut"].texte(), it["fin"].texte(), it.texte("avant"), it.texte("apres"), it.texte("regle"), it.texte("message"), it.texte("confiance"))
            }
            val obtenu = verifierGrammaire(texte, lexique, enCours = true).map {
                listOf(it.debut.toString(), it.fin.toString(), it.avant, it.apres, it.regle, it.message, it.confiance.name.lowercase())
            }
            if (attendu != obtenu) ecarts += "« $texte » : $attendu ≠ $obtenu"
        }
        verifier("grammaire en cours", ecarts, tous.size)
    }

    @Test
    fun `scénarios d'apprentissage identiques`() {
        val tous = cas("scenarios.json")
        val ecarts = mutableListOf<String>()
        var etapes = 0
        tous.map { it.jsonObject }.forEachIndexed { s, scenario ->
            val c = Correcteur(lexique)
            for (etape in scenario["etapes"]!!.jsonArray.map { it.jsonObject }) {
                etapes++
                val op = etape.texte("op")!!
                val mot = etape.texte("mot")!!
                val ctx = ContexteMot(etape.texte("precedent"), etape.bool("debutPhrase"))
                val attendu = etape["attendu"]
                val e: List<String> = when (op) {
                    "motTermine" -> {
                        val r = c.motTermine(mot, ctx)
                        val a = attendu!!.jsonObject
                        ecartsAnalyse(a, r.analyse) +
                            (if (a.texte("final") != r.final) listOf("final ${a["final"]} ≠ ${r.final}") else emptyList()) +
                            ecartsApprentissage(a["apprentissage"]!!.jsonObject, r.apprentissage)
                    }
                    "annuler" -> {
                        val correction = c.analyserMot(mot, ctx).correction
                        if (correction == null) {
                            if (attendu is JsonNull || attendu == null) emptyList() else listOf("annulation attendue")
                        } else {
                            ecartsApprentissage(attendu!!.jsonObject, c.annulerCorrection(mot, correction, ctx))
                        }
                    }
                    "garder" -> ecartsApprentissage(attendu!!.jsonObject, c.garderMot(mot, ctx))
                    "ajouter" -> {
                        val r = c.profil.ajouter(mot, forcer = etape.bool("forcer"))
                        val a = attendu!!.jsonObject
                        buildList {
                            if (a.bool("ajoute") != r.ajoute) add("ajoute ${a["ajoute"]} ≠ ${r.ajoute}")
                            if (a.texte("raison") != r.raison) add("raison ${a["raison"]} ≠ ${r.raison}")
                            if (a.texte("correction") != r.correction) add("correction ${a["correction"]} ≠ ${r.correction}")
                        }
                    }
                    "oublier" -> {
                        val r = c.profil.oublier(mot)
                        if (attendu!!.jsonPrimitive.boolean != r) listOf("oublier ${attendu} ≠ $r") else emptyList()
                    }
                    "analyser" -> ecartsAnalyse(attendu!!.jsonObject, c.analyserMot(mot, ctx))
                    "suggestions" -> {
                        val r = c.suggestions(mot.take(3), ctx)
                        val a = attendu!!.jsonArray.map { it.jsonPrimitive.content }
                        if (a != r) listOf("suggestions $a ≠ $r") else emptyList()
                    }
                    else -> listOf("opération inconnue $op")
                }
                if (e.isNotEmpty()) ecarts += "scénario $s, $op « $mot » $ctx : ${e.joinToString(" ; ")}"
            }
            val attenduProfil = nettoyer(scenario["profil"]!!)
            val obtenuProfil = nettoyer(c.profil.exporter())
            if (attenduProfil != obtenuProfil) ecarts += "scénario $s : profil final\n  attendu $attenduProfil\n  obtenu  $obtenuProfil"
        }
        verifier("scénarios", ecarts, etapes)
    }

    /** Ignore les dates d'apprentissage et les champs vides, que JavaScript omet. */
    private fun nettoyer(e: JsonElement): JsonElement = when (e) {
        is JsonObject -> JsonObject(e.filterValues { it !is JsonNull }.mapValues { (k, v) -> if (k == "depuis") JsonPrimitive(0) else nettoyer(v) })
        is JsonArray -> JsonArray(e.map(::nettoyer))
        else -> e
    }
}
