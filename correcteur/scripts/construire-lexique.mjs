// Convertit Lexique 3.83 (http://www.lexique.org, licence CC BY-SA 4.0) au format compact du moteur.
//
//   node scripts/construire-lexique.mjs chemin/vers/Lexique383.tsv
//
// Le fichier d'origine fait 25 Mo et 35 colonnes ; on ne garde que ce dont le correcteur a besoin :
//   forme  lemme  catégorie  genre  nombre  fréquence  conjugaisons
// Le lemme est laissé vide lorsqu'il est identique à la forme, pour gagner de la place.

import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

const source = process.argv[2];
if (!source) {
  console.error("Usage : node scripts/construire-lexique.mjs Lexique383.tsv");
  process.exit(1);
}

const octets = readFileSync(source);
// Selon la source, Lexique est distribué en UTF-8 ou en Windows-1252.
let texte;
try {
  texte = new TextDecoder("utf-8", { fatal: true }).decode(octets);
} catch {
  texte = new TextDecoder("windows-1252").decode(octets);
}

const lignes = texte.split(/\r?\n/);
const entete = lignes[0].split("\t").map((c) => c.replace(/^\d+_/, ""));
const col = (nom) => {
  const i = entete.indexOf(nom);
  if (i < 0) throw new Error(`Colonne « ${nom} » absente`);
  return i;
};
const C = {
  ortho: col("ortho"), lemme: col("lemme"), cgram: col("cgram"), genre: col("genre"),
  nombre: col("nombre"), films: col("freqfilms2"), livres: col("freqlivres"), infover: col("infover"),
};

const nombre = (s) => Number((s || "0").replace(",", ".")) || 0;
const sortie = [];
let ignorees = 0;
for (const ligne of lignes.slice(1)) {
  if (!ligne) continue;
  const c = ligne.split("\t");
  const ortho = c[C.ortho].normalize("NFC");
  // Les locutions (« à cloche-pied ») et les sigles avec points ne sont pas des mots isolés.
  if (!ortho || /[ .]/.test(ortho) || !c[C.cgram] || ortho !== ortho.toLowerCase()) {
    ignorees++;
    continue;
  }
  const lemme = c[C.lemme].normalize("NFC");
  // Les sous-titres de films sont plus proches de l'écrit d'un téléphone que les livres : on les pondère davantage.
  const freq = Math.round((0.7 * nombre(c[C.films]) + 0.3 * nombre(c[C.livres])) * 100) / 100;
  const infover = c[C.infover]
    .replace(/"/g, "")
    .split(";")
    .filter(Boolean)
    .join(",");
  sortie.push([ortho, lemme === ortho ? "" : lemme, c[C.cgram], c[C.genre], c[C.nombre], freq, infover].join("\t"));
}

const contenu = sortie.join("\n") + "\n";
writeFileSync(new URL("../data/lexique-fr.tsv.gz", import.meta.url), gzipSync(contenu, { level: 9 }));
console.log(`${sortie.length} lignes écrites (${ignorees} ignorées), ${(contenu.length / 1e6).toFixed(1)} Mo avant compression`);
