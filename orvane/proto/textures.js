/*
 * Orvane, prototype : les dessins SVG rendus en textures Phaser (nettes : 4 pixels de texture par unité du monde).
 * ORVANE.Proto.Textures.svg(scene, cle, dessine, { k }) → Promise { ox, oy, w, h } (origine = le point (0, 0) du dessin, les pieds)
 * ORVANE.Proto.Textures.portrait(dessine, taille) → Promise d'une image (data URL) pour les portraits ronds du DOM.
 */
window.ORVANE = window.ORVANE || {};
(() => {
  const P = ORVANE.Proto = ORVANE.Proto || {};
  const NS = "http://www.w3.org/2000/svg";
  const INFOS = {};          // cle → { ox, oy, w, h, k }
  let hote = null;
  function zone() {
    if (!hote) { hote = document.createElementNS(NS, "svg"); hote.setAttribute("aria-hidden", "true"); hote.style.cssText = "position:absolute;left:-9999px;top:0;width:10px;height:10px;overflow:hidden"; document.body.appendChild(hote); }
    return hote;
  }
  // Construit un SVG autonome autour du dessin et renvoie sa chaîne, sa boîte
  function construire(dessine, marge) {
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("xmlns", NS);
    zone().appendChild(svg);
    const g = document.createElementNS(NS, "g"); svg.appendChild(g);
    dessine(g);
    const b = g.getBBox(), m = marge == null ? 1 : marge;
    const box = { x: b.x - m, y: b.y - m, w: b.width + 2 * m, h: b.height + 2 * m };
    svg.setAttribute("viewBox", `${box.x} ${box.y} ${box.w} ${box.h}`);
    svg.remove();
    return { svg, box };
  }
  function versImage(svg, wpx, hpx) {
    svg.setAttribute("width", wpx); svg.setAttribute("height", hpx);
    const txt = new XMLSerializer().serializeToString(svg);
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = () => rej(new Error("Dessin illisible"));
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(txt);
    });
  }
  async function svg(scene, cle, dessine, o = {}) {
    const k = o.k || 4;
    const { svg: el, box } = construire(dessine, o.marge);
    const W = Math.max(1, Math.ceil(box.w * k)), H = Math.max(1, Math.ceil(box.h * k));
    const img = await versImage(el, W, H);
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    c.getContext("2d").drawImage(img, 0, 0, W, H);
    if (scene.textures.exists(cle)) scene.textures.remove(cle);
    scene.textures.addCanvas(cle, c);
    const info = { ox: -box.x / box.w, oy: -box.y / box.h, w: box.w, h: box.h, k, canvas: c };
    INFOS[cle] = info;
    return info;
  }
  // Portrait rond : on cadre le haut du dessin (tête et épaules)
  async function portrait(dessine, taille, part) {
    const { svg: el, box } = construire(dessine, 1);
    const h = box.h * (part || .62), cote = Math.max(h, box.w * .9);
    const x = box.x + box.w / 2 - cote / 2, y = box.y - 1;
    el.setAttribute("viewBox", `${x} ${y} ${cote} ${cote}`);
    const t = taille || 96;
    const img = await versImage(el, t, t);
    const c = document.createElement("canvas"); c.width = t; c.height = t;
    c.getContext("2d").drawImage(img, 0, 0, t, t);
    return c.toDataURL("image/png");
  }
  // Un dessin d'icône (chaîne SVG 22 × 22) en texture
  async function icone(scene, cle, corps, taillePx) {
    const t = taillePx || 64;
    const txt = `<svg xmlns="${NS}" viewBox="0 0 22 22" width="${t}" height="${t}">${corps}</svg>`;
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error("Icône illisible")); i.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(txt); });
    const c = document.createElement("canvas"); c.width = t; c.height = t; c.getContext("2d").drawImage(img, 0, 0, t, t);
    if (scene.textures.exists(cle)) scene.textures.remove(cle);
    scene.textures.addCanvas(cle, c);
    INFOS[cle] = { ox: .5, oy: .5, w: 22, h: 22, k: t / 22 };
  }
  // Halo de lumière (dégradé radial) pour le four et les lanternes
  function halo(scene, cle, couleur, rayon) {
    if (scene.textures.exists(cle)) return;
    const r = rayon || 64, c = document.createElement("canvas"); c.width = c.height = r * 2;
    const x = c.getContext("2d"), g = x.createRadialGradient(r, r, 0, r, r, r);
    g.addColorStop(0, couleur.replace("A", ".85")); g.addColorStop(.45, couleur.replace("A", ".28")); g.addColorStop(1, couleur.replace("A", "0"));
    x.fillStyle = g; x.fillRect(0, 0, r * 2, r * 2);
    scene.textures.addCanvas(cle, c);
  }
  P.Textures = { svg, portrait, icone, halo, info: cle => INFOS[cle] };
})();
