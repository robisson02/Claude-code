package fr.orvane.prototype;

import android.annotation.SuppressLint;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.activity.ComponentActivity;
import androidx.activity.OnBackPressedCallback;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import androidx.webkit.WebViewAssetLoader;

/**
 * Orvane : tout le jeu tient dans une WebView, servi depuis les assets de l'application (hors ligne).
 * Les fichiers sont servis à l'adresse https://appassets.androidplatform.net/assets/www/ par WebViewAssetLoader :
 * une vraie origine https, pour que la sauvegarde (localStorage) et le dessin des textures marchent comme en ligne.
 */
public class MainActivity extends ComponentActivity {
    private static final String ACCUEIL = "https://appassets.androidplatform.net/assets/www/jeu.html";
    private static final int FOND = Color.rgb(0x0D, 0x2D, 0x2A); // vert nuit du jeu

    private WebView vue;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle etat) {
        super.onCreate(etat);
        Window fenetre = getWindow();
        fenetre.setBackgroundDrawable(new android.graphics.drawable.ColorDrawable(FOND));
        pleinEcran();

        final WebViewAssetLoader chargeur = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        vue = new WebView(this);
        vue.setBackgroundColor(FOND);
        WebSettings reglages = vue.getSettings();
        reglages.setJavaScriptEnabled(true);
        reglages.setDomStorageEnabled(true);          // sauvegarde de l'artisan (localStorage)
        reglages.setTextZoom(100);                    // la taille du texte est réglée par le jeu
        reglages.setAllowFileAccess(false);
        reglages.setAllowContentAccess(false);
        reglages.setMediaPlaybackRequiresUserGesture(false);
        reglages.setSupportZoom(false);               // le zoom est celui du jeu (pincer le terrain)
        reglages.setBuiltInZoomControls(false);

        vue.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest requete) {
                return chargeur.shouldInterceptRequest(requete.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest requete) {
                Uri adresse = requete.getUrl();
                if ("appassets.androidplatform.net".equals(adresse.getHost())) return false;
                // un lien vers l'extérieur s'ouvre dans le navigateur du téléphone
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, adresse));
                } catch (ActivityNotFoundException e) {
                    // aucun navigateur : on reste dans le jeu
                }
                return true;
            }
        });

        // Retour : ferme d'abord la fenêtre ouverte ou annule l'aperçu (pont dans www/android.js) ; sinon, le jeu passe
        // en arrière-plan sans s'arrêter (la partie reste là quand on revient).
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                vue.evaluateJavascript("window.__orvaneRetour ? String(window.__orvaneRetour()) : 'false'", resultat -> {
                    if (!"\"true\"".equals(resultat)) moveTaskToBack(true);
                });
            }
        });

        setContentView(vue);
        if (etat != null) vue.restoreState(etat);
        else vue.loadUrl(ACCUEIL);
    }

    private void pleinEcran() {
        Window fenetre = getWindow();
        WindowCompat.setDecorFitsSystemWindows(fenetre, false);
        WindowInsetsControllerCompat controle = WindowCompat.getInsetsController(fenetre, fenetre.getDecorView());
        controle.hide(WindowInsetsCompat.Type.systemBars());
        controle.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
    }

    @Override
    public void onWindowFocusChanged(boolean focus) {
        super.onWindowFocusChanged(focus);
        if (focus) pleinEcran();
    }

    @Override
    protected void onSaveInstanceState(Bundle etat) {
        super.onSaveInstanceState(etat);
        if (vue != null) vue.saveState(etat);
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (vue != null) { vue.onResume(); vue.resumeTimers(); }
    }

    @Override
    protected void onPause() {
        if (vue != null) { vue.onPause(); vue.pauseTimers(); }
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        if (vue != null) {
            vue.setVisibility(View.GONE);
            vue.destroy();
            vue = null;
        }
        super.onDestroy();
    }
}
