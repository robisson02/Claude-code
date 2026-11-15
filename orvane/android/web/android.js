// Pont entre le jeu et l'application Android (ajouté seulement dans l'APK).
// La touche Retour du téléphone appelle window.__orvaneRetour() : elle ferme d'abord la fenêtre ouverte, puis annule
// un aperçu en cours ; si elle n'a rien à faire, elle renvoie false et l'application passe en arrière-plan.
(function () {
  window.__orvaneRetour = function () {
    var ouvertes = Array.prototype.slice.call(document.querySelectorAll("dialog[open]"));
    var d = ouvertes[ouvertes.length - 1];
    if (d) {
      // comme Échap : la fenêtre décide (l'Addition, par exemple, ne se ferme que par son bouton)
      var ev = new Event("cancel", { cancelable: true });
      if (d.dispatchEvent(ev)) d.close();
      return true;
    }
    var jeu = window.__orvane && window.__orvane.jeu, s = jeu && jeu.sceneActive;
    if (!s || !s.sys || !s.sys.isActive()) return false;
    var cle = s.sys.settings.key;
    var enCours = cle === "combat" ? (s.apercu || s.sortChoisi || s.painChoisi || s.regard)
      : cle === "balade" ? (s.ensuite || s.cible) : null;
    if (!enCours) return false;
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    return true;
  };
})();
