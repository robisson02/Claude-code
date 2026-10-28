import { Correcteur } from "../src/moteur.js";
import { chargerLexique } from "../src/node.js";

export const lexique = chargerLexique();

/** Un correcteur neuf (profil vierge) pour chaque test. */
export function nouveauCorrecteur() {
  return new Correcteur(lexique);
}
