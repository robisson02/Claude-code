import assert from "node:assert/strict";
import { test } from "node:test";
import { verifierGrammaire } from "../src/grammaire.js";
import { lexique, nouveauCorrecteur } from "./aide.js";

const c = nouveauCorrecteur();

// Phrases correctes : le correcteur ne doit RIEN y changer.
const CORRECTES = [
  "Il a mangé une pomme.", "Je vais à Paris demain.", "Elle est là.", "Tu veux du café ou du thé ?",
  "Où est le chat ?", "C'est sûr qu'il viendra.", "Il est sur la table.", "Ils ont faim.", "Nous mangeons ensemble.",
  "Il nous mange.", "Vous nous avez vus.", "Je vous aime.", "Lui et elle mangent.", "Ce que tu dis a du sens.",
  "Ce qu'il voulait a été fait.", "La porte a été fermée.", "Il y a du monde.", "Le chat a faim.", "Marie a un chien.",
  "J'ai été manger chez lui.", "Il peut être content.", "C'est ce que je veux.", "Il faut manger.", "Je dois partir.",
  "Elle s'est levée tôt.", "Ça va bien.", "Sa mère est partie.", "Ses parents sont là.", "Ces gens sont gentils.",
  "Il fait beau aujourd'hui.", "Je sais où il est.", "Tu manges ou tu dors ?", "Le jour où il est venu.",
  "Un jour ou l'autre.", "Je suis allé manger.", "Elle est allée acheter du pain.", "Il n'y a rien de prévu.",
  "Un sentiment de passé.", "Une étude de marché.", "Des vacances d'été.", "Il est passé hier.", "Je l'ai vu.",
  "On a gagné !", "Il a peur.", "Elle a raison.", "C'est à moi.", "Je pense à toi.", "Tu as vu ça ?", "Il semble fatigué.",
  "Les enfants jouent dehors.", "Je ne sais pas.", "Peut-être demain.", "Il était une fois.", "Bien sûr que oui.",
  "Je t'aime.", "Il se lave.", "Elle se lève.", "Qu'est-ce que tu fais ?", "Je suis sûr de moi.", "La forêt est belle.",
  "C'est la vie.", "Je la vois.", "Mets-la là.", "Par là.", "Ce jour-là.", "Celui-là.", "Tu invites qui ?",
  "Il voila son visage.", "On est bien.", "Et il mange.", "Paul et elle mangent.", "Je mange et elle dort.",
  "A priori non.", "Il a mal au dos.", "Il a à faire.", "J'ai du travail à faire.", "Le vent a tourné.",
  "Tout le monde a compris.", "Ça me plaît.", "Il a acheté une voiture.", "Je voudrais un café.", "Elle aime danser.",
  "Il est tard.", "C'est trop bien !", "Vous êtes sûrs ?", "On se voit demain ?", "Elles sont parties.",
  "Je me demande où tu vas.", "Il ne le sait pas.", "Tu ne me l'as pas dit.", "Il en a marre.", "Qui a fait ça ?",
  "Ma sœur a un chat.", "Il a mangé et bu.", "L'été est chaud.", "Il a été malade.", "Un employé de bureau.",
  "Le passé est passé.", "Il faut le dire.", "Je préfère rester.", "Va chercher le pain.", "Il est venu me voir.",
  "Cela fait du bien.", "La cote de popularité.", "La côte est belle.", "Il a l'air content.",
];

test("aucune phrase correcte n'est modifiée", () => {
  for (const phrase of CORRECTES) assert.equal(c.corrigerTexte(phrase).texte, phrase, phrase);
});

const ERREURS = [
  // a / à
  ["je vais a paris", "je vais à paris"], ["rien a manger", "rien à manger"], ["A demain !", "À demain !"],
  ["je pense a toi", "je pense à toi"], ["il à mangé", "il a mangé"], ["a cote de moi", "à côté de moi"],
  ["tout a fait", "tout à fait"],
  // ou / où, la / là
  ["ou est le chat ?", "où est le chat ?"], ["d'ou tu viens", "d'où tu viens"], ["la ville ou j'habite", "la ville où j'habite"],
  ["je sais pas ou il est", "je sais pas où il est"], ["ou t'es ?", "où t'es ?"], ["il est parti la ou il voulait", "il est parti là où il voulait"],
  ["il est la.", "il est là."], ["ce jour la, il pleuvait", "ce jour-là, il pleuvait"],
  // sur / sûr, locutions
  ["je suis sur de moi", "je suis sûr de moi"], ["bien sur que oui", "bien sûr que oui"], ["c'est pas sur.", "c'est pas sûr."],
  ["peut etre demain", "peut-être demain"], ["est ce que tu viens", "est-ce que tu viens"], ["aujourd hui", "aujourd'hui"],
  ["quelqu un", "quelqu'un"],
  // accord sujet-verbe
  ["ils mange", "ils mangent"], ["nous mange", "nous mangeons"], ["tu mange", "tu manges"], ["je manges", "je mange"],
  ["tu a raison", "tu as raison"], ["j'a faim", "j'ai faim"], ["ils son partis", "ils sont partis"], ["ils on faim", "ils ont faim"],
  // participe / infinitif
  ["j'ai manger", "j'ai mangé"], ["il a manger", "il a mangé"], ["j'ai pas manger", "j'ai pas mangé"],
  ["elle est aller au cinema", "elle est allée au cinéma"], ["je suis aller manger", "je suis allé manger"],
  ["je vais mangé", "je vais manger"], ["il faut mangé", "il faut manger"], ["vous pouvez mangez", "vous pouvez manger"],
  ["pour mangé", "pour manger"], ["sans mangé", "sans manger"],
  // ce / se, ça / sa, c'est / ces, et / est
  ["il ce lave", "il se lave"], ["il c'est trompé", "il s'est trompé"], ["il ses trompé", "il s'est trompé"],
  ["sa va", "ça va"], ["sa me saoule", "ça me saoule"], ["comme sa.", "comme ça."], ["ces pas grave", "c'est pas grave"],
  ["il et parti", "il est parti"], ["c'et bon", "c'est bon"],
];

test("les erreurs de grammaire courantes sont corrigées", () => {
  for (const [faute, attendu] of ERREURS) assert.equal(c.corrigerTexte(faute).texte, attendu, faute);
});

test("pendant la frappe, on attend la suite avant de trancher", () => {
  const enCours = (texte) => verifierGrammaire(texte, lexique, { enCours: true }).map((x) => x.apres);
  assert.deepEqual(enCours("il est la "), []);
  assert.deepEqual(enCours("il est la. "), ["là"]);
  assert.deepEqual(enCours("bien sur "), []);
  assert.deepEqual(enCours("bien sur que "), ["bien sûr"]);
  assert.deepEqual(enCours("je vais a "), ["à"]);
});

test("chaque correction explique la règle appliquée", () => {
  const [correction] = verifierGrammaire("ils mange.", lexique);
  assert.equal(correction.apres, "mangent");
  assert.equal(correction.confiance, "haute");
  assert.match(correction.message, /s'accorde avec « ils »/);
});

test("un texte complet est corrigé d'un bloc", () => {
  const { texte } = c.corrigerTexte(
    "je vais a paris, c'est tres reel. j'ai manger une pomme et ils mange. ou est le telephonne ? bien sur que oui, sa va.",
  );
  assert.equal(texte, "je vais à paris, c'est très réel. j'ai mangé une pomme et ils mangent. où est le téléphone ? bien sûr que oui, ça va.");
});
