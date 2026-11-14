// Données de conception d'Orvane : éléments, caractéristiques, classes.
window.ORVANE = window.ORVANE || {};

// Les éléments appartiennent aux sorts, pas aux classes.
ORVANE.ELEMENTS = {
  F: { nom: "Flambée", vrai: "Feu", couleur: "#D2693C", jeu: "Le plat flambé, la flamme, et la flambée des prix." },
  E: { nom: "Eaudace", vrai: "Eau", couleur: "#3F8FA8", jeu: "L'eau et l'audace : il en faut pour plonger." },
  T: { nom: "Terroir", vrai: "Terre", couleur: "#8A6238", jeu: "La terre et le goût du pays, celui des caves et des potagers." },
  S: { nom: "Soufflé", vrai: "Vent", couleur: "#5E9E80", jeu: "Le souffle du vent et le soufflé qui monte au four." },
  C: { nom: "Éclair", vrai: "Foudre", couleur: "#8E7CC3", jeu: "La foudre, et l'éclair au chocolat." },
  N: { nom: "Neutre", vrai: "Utilitaire", couleur: "#9A9384", jeu: "Soins, boucliers, déplacements, invocations." }
};

// [nom, rôle en combat, jeu de mots]
ORVANE.CARACS = [
  ["Victuailles", "Points de vie", "Les provisions qui tiennent au corps."],
  ["Levure", "Puissance : bonus de dégâts dans tous les éléments", "Ce qui fait tout monter."],
  ["Flambée, Eaudace, Terroir, Soufflé, Éclair", "Affinité à chaque élément", "Une par élément, à répartir à chaque niveau."],
  ["Coups de main (CM)", "Points d'action : 6 au départ", "Un sort, c'est un coup de main."],
  ["Pas", "Points de mouvement : 3 au départ", "Le pas de porte, la boutique et la marche."],
  ["Rayon", "Portée des sorts", "Le rayon du magasin, le rayon d'action."],
  ["Coup de maître", "Chance de coup critique", "Le geste parfait du meilleur ouvrier."],
  ["Ouverture", "Initiative : qui joue en premier", "Le premier qui lève le rideau."],
  ["Rideau", "Retenir un ennemi au contact", "On baisse le rideau, personne ne sort."],
  ["Faux-fuyant", "Quitter le contact d'un ennemi", "L'art de filer sans répondre."],
  ["Conservation", "Résistances, en %, par élément", "Ce qui garde frais sous les coups."],
  ["Remontant", "Bonus aux soins", "Le petit verre qui requinque."],
  ["Commis", "Nombre d'invocations", "Les aides de cuisine qu'on appelle en renfort."],
  ["Savoir-faire", "Bonus d'expérience", "Ce qu'on apprend en faisant."],
  ["Ristourne", "Chance de butin", "Un petit plus à chaque passage en caisse."]
];

// corps : silhouette propre à la classe, indépendante des vêtements.
// peau, poils : simples teintes par défaut, les mêmes pour toutes les classes ; le joueur les choisit librement.
ORVANE.CLASSES = [
  { id: "levainqueur", nom: "Levainqueur", fem: "Levainqueuse", metier: "Boulangerie",
    jeu: "Le levain et le vainqueur.", role: "Combattant au contact et en zone",
    meca: ["La Fournée", "Certains sorts s'enfournent : posés au sol, ils cuisent un ou deux tours puis éclatent."],
    morpho: "Bâti pour pétrir : torse bombé aux épaules rondes, taille fine, jambes courtes et plantées, et deux gros poings ronds, les pognes, qui pendent à hauteur des hanches, marqués sur le dessus d'une grigne, l'entaille du boulanger. Sa tête est carrée en bas, avec un sommet bombé qui déborde un peu de chaque côté.",
    outil: "Rouleau de chêne",
    corps: { plan: "levainqueur", etage: 4, H: 82, forme: "haltère", tete: "tranche de pain de mie", signature: "les Pognes", zone: "mains", grigne: "croix" },
    peau: "#C8956B", poils: "#6B4A2E" },
  { id: "patissorcier", nom: "Pâtissorcier", fem: "Pâtissorcière", metier: "Pâtisserie",
    jeu: "Le pâtissier et le sorcier.", role: "Mage de soutien",
    meca: ["Le Glaçage", "Pose des boucliers en couches sur ses alliés, jusqu'à trois couches."],
    morpho: "Un petit corps léger comme un soufflé, qui flotte au-dessus de son ombre sur de tout petits pieds. Sur sa tête toute ronde, une meringue pochée monte en pointe torsadée et se recourbe vers l'arrière, comme un chapeau de sorcier en sucre.",
    outil: "Fouet d'argent",
    corps: { plan: "patissorcier", etage: 2, H: 64, forme: "pointe sur boule, en lévitation", tete: "chou", signature: "la Meringue", zone: "sommet du crâne, vers l'arrière", sucre: "framboise", torsade: 1 },
    peau: "#C8956B", poils: "#6B4A2E" },
  { id: "bouchevalier", nom: "Bouchevalier", fem: "Bouchevalière", metier: "Boucherie",
    jeu: "Le boucher et le chevalier.", role: "Protecteur",
    meca: ["Le Tranchant", "Ses coups au contact entament la Conservation de la cible ; il encaisse à la place de ses alliés."],
    morpho: "Un bloc presque carré, sans cou : deux épaules massives au dessus plat, à l'arête taillée en biseau comme un tranchant, montent plus haut que le menton et encadrent une petite tête ronde, comme un donjon entre deux tours. Les bras sont épais, les jambes courtes et écartées : impossible de le faire reculer.",
    outil: "Couperet",
    corps: { plan: "bouchevalier", etage: 5, H: 92, forme: "château", tete: "dôme", signature: "les Billots", zone: "épaules" },
    peau: "#C8956B", poils: "#6B4A2E" },
  { id: "pateladin", nom: "Pâtéladin", fem: "Pâtéladine", metier: "Charcuterie",
    jeu: "Le pâté et le paladin.", role: "Combattant soigneur",
    meca: ["Le Fumage", "Laisse des zones de fumée : les alliés y sont soignés, les ennemis affaiblis."],
    morpho: "Un corps fin et droit au port de paladin, surmonté d'une tête en écusson. Autour de son torse flotte un anneau de fumée gris perle, son auréole tombée à force de veiller sur le fumoir, séparé du corps par un vide bien visible.",
    outil: "Saucisson sec ferré",
    corps: { plan: "pateladin", etage: 3, H: 72, forme: "planète", tete: "écusson", signature: "l'Auréole tombée", zone: "milieu du torse" },
    peau: "#C8956B", poils: "#6B4A2E" },
  { id: "fromagicien", nom: "Fromagicien", fem: "Fromagicienne", metier: "Fromagerie",
    jeu: "Le fromager et le magicien.", role: "Mage de contrôle",
    meca: ["L'Affinage", "Ses effets se renforcent à chaque tour où ils restent sur la cible."],
    morpho: "Un corps compact et vif, sur des jambes courtes, avec une tête large au dessus plat et aux flancs droits. Derrière sa tête s'ouvre une grande collerette de croûte percée de trois trous, comme un rideau de scène qu'il déploie avant chaque tour.",
    outil: "Bâton-tranche-meule",
    corps: { plan: "fromagicien", etage: 3, H: 72, forme: "disque troué sur pattes", tete: "meule", signature: "la Collerette d'affinage", zone: "tour de la tête, par derrière" },
    peau: "#C8956B", poils: "#6B4A2E" },
  { id: "merlanceur", nom: "Merlanceur", fem: "Merlanceuse", metier: "Poissonnerie",
    jeu: "Le merlan et le lanceur.", role: "Tireur à distance",
    meca: ["La Marée", "Alterne chaque tour : marée haute (+2 Rayon) puis marée basse (+20 % de dégâts)."],
    morpho: "Le plus élancé de tous : long cou, longues jambes, et des bras de lanceur qui descendent jusqu'à mi-cuisse. Une nageoire dorsale à rayons, la Voile, se dresse le long de son dos : haute près de la nuque, elle descend en pente jusqu'au milieu du dos, comme celle d'un poisson-voilier, et monte ou se couche avec la marée.",
    outil: "Harpon",
    corps: { plan: "merlanceur", etage: 4, H: 82, forme: "I à voile", tete: "olive", signature: "la Voile", zone: "dos" },
    peau: "#C8956B", poils: "#6B4A2E" },
  { id: "traitreur", nom: "Traîtreur", fem: "Traîtreuse", metier: "Traiteur",
    jeu: "Le traiteur et le traître.", role: "Assassin et poseur de pièges",
    meca: ["Le Buffet", "Pose des amuse-bouches piégés au sol ; un buffet complet de trois pièges lui rend un coup de main."],
    morpho: "Petit, fin et souple, il marche sur la pointe des pieds. De la pointe de sa tête en goutte part une mèche raidie, coudée net vers l'avant, qui devient une pique à cocktail et plonge devant son visage. Une olive y est enfilée, la pointe ressort dessous : l'amuse-bouche qui attire les imprudents.",
    outil: "Couteau à beurre affûté",
    corps: { plan: "traitreur", etage: 1, H: 56, forme: "crosse", tete: "goutte", signature: "la Pique", zone: "sommet du crâne, vers l'avant", bouchee: "olive" },
    peau: "#C8956B", poils: "#6B4A2E" },
  { id: "legumancien", nom: "Légumancien", fem: "Légumancienne", metier: "Primeur",
    jeu: "Le légume et le nécromancien : il réveille le potager.", role: "Invocateur",
    meca: ["Le Potager", "Plante des graines qui sortent de terre au tour suivant en légumes combattants."],
    morpho: "Un grand échalas : deux jambes longues et droites comme des tuteurs de potager, plus hautes que tout le reste du corps, sous un buste court et une grosse tête ronde aux joues pleines. À l'arrêt, ses pieds pointus se plantent dans la terre.",
    outil: "Sécateur",
    corps: { plan: "legumancien", etage: 5, H: 92, forme: "compas", tete: "radis rond", signature: "les Échalas", zone: "jambes" },
    peau: "#C8956B", poils: "#6B4A2E" }
];
