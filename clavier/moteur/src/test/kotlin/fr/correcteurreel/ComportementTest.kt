package fr.correcteurreel

import kotlin.system.measureNanoTime
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

/** Les garanties principales du correcteur, écrites pour être lues (le détail est couvert par PariteTest). */
class ComportementTest {
    private val lexique = Donnees.lexique

    @Test
    fun `reel est corrigé en réel et n'est jamais appris`() {
        val c = Correcteur(lexique)
        repeat(10) {
            val r = c.motTermine("reel", ContexteMot("c'est"))
            assertEquals("réel", r.final)
            assertEquals(Statut.BLOQUE, c.annulerCorrection("reel", "réel", ContexteMot("c'est")).statut)
        }
        assertFalse(c.profil.estAppris("reel"))
        assertTrue(c.analyserMot("reel").auto)
    }

    @Test
    fun `un mot pris pour une faute est appris après deux annulations`() {
        val c = Correcteur(lexique)
        assertEquals("mer", c.motTermine("mdr", ContexteMot("trop")).final)
        assertEquals(Statut.QUARANTAINE, c.annulerCorrection("mdr", "mer", ContexteMot("trop")).statut)
        c.motTermine("mdr", ContexteMot("ah"))
        assertEquals(Statut.APPRIS, c.annulerCorrection("mdr", "mer", ContexteMot("ah")).statut)
        assertTrue(c.analyserMot("mdr").valide)
    }

    @Test
    fun `la grammaire corrige les erreurs courantes`() {
        val c = Correcteur(lexique)
        assertEquals(
            "je vais à paris, c'est très réel. j'ai mangé et ils mangent. où est le téléphone ?",
            c.corrigerTexte("je vais a paris, c'est tres reel. j'ai manger et ils mange. ou est le telephonne ?").texte,
        )
    }

    @Test
    fun `le moteur répond assez vite pour un clavier`() {
        val c = Correcteur(lexique)
        val mots = listOf("reel", "bonjoue", "telephonne", "anticonstitutionelement", "maisob", "chein", "mdr", "developpemnt")
        repeat(3) { mots.forEach { c.analyserMot(it) } } // échauffement de la JVM
        val ns = measureNanoTime { repeat(10) { mots.forEach { c.analyserMot(it); c.suggestions(it.take(4)) } } }
        val ms = ns / 1e6 / (10 * mots.size)
        println("analyse + suggestions : %.2f ms par mot en moyenne".format(ms))
        assertTrue(ms < 20, "trop lent : $ms ms par mot")
    }

    @Test
    fun `le profil se sauvegarde et se recharge`() {
        val c = Correcteur(lexique)
        c.profil.ajouter("Anaëlle", source = "contact")
        c.motTermine("reel")
        c.motTermine("chelou")
        val profil = ProfilUtilisateur.importer(c.profil.exporter(), lexique)
        assertTrue(profil.estAppris("anaëlle"))
        assertEquals("Anaëlle", profil.ecriture("anaëlle"))
        assertEquals(1, profil.quarantaine.getValue("chelou").occurrences)
        assertEquals(1, profil.usages["réel"])
    }
}
