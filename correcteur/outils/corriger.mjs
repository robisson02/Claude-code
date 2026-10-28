// Corrige un texte en ligne de commande :
//   node outils/corriger.mjs "je vais a paris demain, c'est tres reel"
//   echo "ils mange" | node outils/corriger.mjs

import { readFileSync } from "node:fs";
import { Correcteur } from "../src/moteur.js";
import { chargerLexique } from "../src/node.js";

const texte = process.argv.slice(2).join(" ") || readFileSync(0, "utf8");
const correcteur = new Correcteur(chargerLexique());
const { texte: corrige, corrections, suggestions } = correcteur.corrigerTexte(texte);

console.log(corrige.trim());
for (const c of corrections) console.log(`  ✔ ${c.avant} → ${c.apres}   (${c.message})`);
for (const s of suggestions) console.log(`  ? ${s.avant} → ${s.apres}   (${s.message})`);
