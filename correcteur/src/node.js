// Chargement du lexique depuis les fichiers du dépôt (Node.js). Dans un navigateur, voir demo/index.html.

import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { Lexique } from "./lexique.js";

export function chargerLexique() {
  const dossier = new URL("../data/", import.meta.url);
  const principal = gunzipSync(readFileSync(new URL("lexique-fr.tsv.gz", dossier))).toString("utf8");
  const complements = readFileSync(new URL("complements.tsv", dossier), "utf8");
  return Lexique.depuisTextes(principal, complements);
}
