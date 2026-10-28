// SPDX-License-Identifier: GPL-3.0-only
//
// Thème « La Place des Artisans », aux couleurs du site laplacedesartisans.fr (crème, encre, vert nuit, or).
//
// Le fond reste net : un dégradé uni à peine marqué, avec un filet doré en haut du clavier. Rien n'est dessiné
// derrière les touches, qui gardent tout leur contraste. Le village du logo (maisons, église, cyprès,
// colline dorée) est posé dans la barre d'espace, la seule touche sans lettre.
// Une image de fond choisie par l'utilisateur dans les réglages reste prioritaire sur le dégradé.

package helium314.keyboard.latin.correcteur

import android.content.res.Resources
import android.graphics.Canvas
import android.graphics.ColorFilter
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Path
import android.graphics.PixelFormat
import android.graphics.Rect
import android.graphics.Shader
import android.graphics.drawable.Drawable
import androidx.core.graphics.toColorInt
import helium314.keyboard.latin.common.Colors
import helium314.keyboard.latin.common.DefaultColors
import kotlin.math.max
import kotlin.math.min

object PlaceDesArtisans {
    private val OR = "#C5A572".toColorInt()

    @JvmStatic
    fun couleurs(themeStyle: String, hasBorders: Boolean, nuit: Boolean, imageUtilisateur: Drawable?): Colors =
        if (nuit) DefaultColors(
            themeStyle,
            hasBorders,
            accent = "#94763F".toColorInt(), // ocre : la flèche blanche de la touche Entrée reste lisible
            background = "#082221".toColorInt(), // bas du dégradé, repris par la barre de navigation
            keyBackground = "#1B3835".toColorInt(),
            functionalKey = "#14302D".toColorInt(),
            spaceBar = "#1B3835".toColorInt(),
            keyText = "#F2EDE0".toColorInt(),
            keyHintText = OR,
            gesture = OR,
            keyboardBackground = imageUtilisateur ?: Fond("#0D2D2A".toColorInt(), "#082221".toColorInt(), 0x73C5A572),
            illustrationEspace = Village(nuit = true),
        ) else DefaultColors(
            themeStyle,
            hasBorders,
            accent = "#15301F".toColorInt(),
            background = "#F2EADB".toColorInt(),
            keyBackground = "#FFFDF7".toColorInt(),
            functionalKey = "#ECE6D7".toColorInt(),
            spaceBar = "#FFFDF7".toColorInt(),
            keyText = "#1D2725".toColorInt(),
            keyHintText = "#7A5F2E".toColorInt(),
            gesture = "#94763F".toColorInt(),
            keyboardBackground = imageUtilisateur ?: Fond("#FAF7EF".toColorInt(), "#F2EADB".toColorInt(), 0xB3C5A572.toInt()),
            illustrationEspace = Village(nuit = false),
        )

    /** Dégradé vertical uni, surmonté d'un filet doré de 1 dp. */
    private class Fond(private val haut: Int, private val bas: Int, couleurFilet: Int) : Drawable() {
        private val degrade = Paint()
        private val filet = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = couleurFilet }
        private val epaisseurFilet = Resources.getSystem().displayMetrics.density

        override fun onBoundsChange(bounds: Rect) {
            degrade.shader = LinearGradient(0f, bounds.top.toFloat(), 0f, bounds.bottom.toFloat(), haut, bas, Shader.TileMode.CLAMP)
        }

        override fun draw(canvas: Canvas) {
            val b = bounds
            canvas.drawRect(b, degrade)
            canvas.drawRect(b.left.toFloat(), b.top.toFloat(), b.right.toFloat(), b.top + epaisseurFilet, filet)
        }

        override fun setAlpha(alpha: Int) {}
        override fun setColorFilter(colorFilter: ColorFilter?) {}
        @Deprecated("Deprecated in Java")
        override fun getOpacity() = PixelFormat.OPAQUE
    }

    /**
     * Le village du logo, en traits fins. Dessiné dans un repère de 1000 × 300, puis réduit sans déformation
     * pour tenir dans la barre d'espace, quelle que soit sa taille.
     */
    private class Village(nuit: Boolean) : Drawable() {
        private val couleurTrait = if (nuit) 0x4DF8F4E8 else 0x661D2725
        private val couleurCypres = if (nuit) 0x42F8F4E8 else 0x6615301F
        private val couleurColline = if (nuit) 0xBFC5A572.toInt() else 0xF2C5A572.toInt()
        private var opacite = 255

        private val pinceau = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeCap = Paint.Cap.ROUND
            strokeJoin = Paint.Join.ROUND
        }
        private val remplissage = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.FILL }

        private val colline = Path().apply {
            moveTo(20f, 272f); quadTo(502f, 214f, 985f, 268f)
        }
        private val traits = Path().apply {
            // maison A
            ligne(292f, 236f, 292f, 206f, 352f, 206f, 352f, 238f)
            ligne(284f, 209f, 322f, 182f, 360f, 209f)
            fenetre(306f, 214f, 10f, 10f); fenetre(330f, 214f, 10f, 10f)
            // maison B, plus haute
            ligne(372f, 238f, 372f, 196f, 444f, 196f, 444f, 236f)
            ligne(362f, 199f, 408f, 168f, 454f, 199f)
            fenetre(388f, 206f, 12f, 12f); fenetre(416f, 206f, 12f, 12f)
            // église : clocher pointu, nef et porte
            ligne(470f, 236f, 470f, 118f, 500f, 118f, 500f, 236f)
            ligne(466f, 120f, 485f, 66f, 504f, 120f)
            ligne(481f, 140f, 481f, 156f); ligne(489f, 140f, 489f, 156f)
            ligne(500f, 178f, 562f, 178f, 562f, 236f)
            ligne(498f, 180f, 531f, 156f, 566f, 180f)
            moveTo(524f, 236f); lineTo(524f, 214f); quadTo(531f, 206f, 538f, 214f); lineTo(538f, 236f)
            // maison C
            ligne(584f, 236f, 584f, 202f, 640f, 202f, 640f, 236f)
            ligne(576f, 205f, 612f, 178f, 648f, 205f)
            fenetre(604f, 212f, 12f, 11f)
            // petite maison D
            ligne(656f, 236f, 656f, 214f, 700f, 214f, 700f, 238f)
            ligne(649f, 216f, 678f, 196f, 707f, 216f)
        }
        private val cypres = Path().apply {
            moveTo(736f, 132f)
            cubicTo(752f, 162f, 752f, 214f, 742f, 238f)
            lineTo(730f, 238f)
            cubicTo(720f, 214f, 720f, 162f, 736f, 132f)
            close()
        }

        override fun draw(canvas: Canvas) {
            val b = bounds
            if (b.isEmpty) return
            // partie utile du dessin : x de 20 à 985, y de 60 à 278
            val echelle = min(b.width() * 0.92f / 965f, b.height() * 0.78f / 218f)
            if (echelle <= 0f) return
            canvas.save()
            canvas.translate(b.exactCenterX() - 502.5f * echelle, b.exactCenterY() - 169f * echelle)
            canvas.scale(echelle, echelle)
            // épaisseurs en pixels, proportionnelles à la hauteur de la touche
            pinceau.strokeWidth = max(1.5f, b.height() * 0.017f) / echelle
            pinceau.color = attenue(couleurTrait)
            canvas.drawPath(traits, pinceau)
            remplissage.color = attenue(couleurCypres)
            canvas.drawPath(cypres, remplissage)
            pinceau.strokeWidth = max(2f, b.height() * 0.024f) / echelle
            pinceau.color = attenue(couleurColline)
            canvas.drawPath(colline, pinceau)
            canvas.restore()
        }

        private fun attenue(couleur: Int): Int {
            val alpha = (couleur ushr 24) * opacite / 255
            return (alpha shl 24) or (couleur and 0xFFFFFF)
        }

        override fun setAlpha(alpha: Int) { opacite = alpha }
        override fun setColorFilter(colorFilter: ColorFilter?) {}
        @Deprecated("Deprecated in Java")
        override fun getOpacity() = PixelFormat.TRANSLUCENT
    }
}

private fun Path.ligne(vararg points: Float) {
    moveTo(points[0], points[1])
    for (i in 2 until points.size step 2) lineTo(points[i], points[i + 1])
}

private fun Path.fenetre(x: Float, y: Float, largeur: Float, hauteur: Float) =
    addRect(x, y, x + largeur, y + hauteur, Path.Direction.CW)
