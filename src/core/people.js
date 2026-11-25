// Portraits des personnes dont parlent les onglets (2026-10-26, demande du propriétaire : phys et map).
// Bloc de prose {t: "people", ids: [...]} ; images dans public/portraits/ (260 px de large, réduites des
// fichiers de Wikimedia Commons, tous dans le domaine public). Textes : src/i18n/<langue>/people.json
// (<id>.name, .life, .credit, .alt), l'anglais ci-dessous en repli. Un portrait imaginé (personne de l'Antiquité
// dont aucun visage n'est conservé) le dit dans sa légende : règle 6, pas de fausse ressemblance.
import { makeT } from "./i18n.js";

const C = "https://commons.wikimedia.org/wiki/File:";
/** id → image, nom, dates, page Commons, légende anglaise. w × h : taille du fichier. */
export const PEOPLE = {
  aristotle: { name: "Aristotle", life: "384–322 BCE", w: 260, h: 348, page: C + "Aristotle_Altemps_Inv8575.jpg",
    credit: "Marble bust, a Roman copy of a Greek bronze by Lysippos, c. 330 BCE (Palazzo Altemps, Rome)" },
  eratosthenes: { name: "Eratosthenes", life: "c. 276–194 BCE", w: 260, h: 376, page: C + "Eratosthenes.jpg",
    credit: "Imagined: no likeness of him survives (engraving, date unknown)" },
  ptolemy: { name: "Claudius Ptolemy", life: "c. 100–170", w: 260, h: 346, page: C + "Claudio_Ptolomeo.png",
    credit: "Imagined: no likeness survives (Justus van Gent, c. 1475, Louvre)" },
  mercator: { name: "Gerardus Mercator", life: "1512–1594", w: 260, h: 344, page: C + "Gerardus_Mercator2.jpg",
    credit: "Frans Hogenberg, 1574, at the age of 62" },
  galileo: { name: "Galileo Galilei", life: "1564–1642", w: 260, h: 320, page: C + "Galileo.arp.300pix.jpg",
    credit: "Justus Sustermans, c. 1640 (National Maritime Museum, London)" },
  kepler: { name: "Johannes Kepler", life: "1571–1630", w: 260, h: 374, page: C + "JKepler.jpg",
    credit: "August Köhler, 1910, after an older portrait (Kepler Museum, Weil der Stadt)" },
  newton: { name: "Isaac Newton", life: "1642–1727", w: 260, h: 366, page: C + "GodfreyKneller-IsaacNewton-1689.jpg",
    credit: "After Godfrey Kneller, 1689" },
  leibniz: { name: "Gottfried Wilhelm Leibniz", life: "1646–1716", w: 260, h: 320, page: C + "Christoph_Bernhard_Francke_-_Bildnis_des_Philosophen_Leibniz_(ca._1695).jpg",
    credit: "Christoph Bernhard Francke, c. 1695 (Herzog Anton Ulrich-Museum)" },
  cavendish: { name: "Henry Cavendish", life: "1731–1810", w: 260, h: 316, page: C + "Cavendish_Henry_signature.jpg",
    credit: "After the only likeness, sketched by William Alexander without his knowledge (G. Wilson, 1851)" },
  lagrange: { name: "Joseph-Louis Lagrange", life: "1736–1813", w: 260, h: 338, page: C + "%D0%9B%D0%B0%D0%B3%D1%80%D0%B0%D0%BD%D0%B6.jpg",
    credit: "Anonymous, 19th century" },
  gauss: { name: "Carl Friedrich Gauss", life: "1777–1855", w: 260, h: 334, page: C + "Carl_Friedrich_Gauss.jpg",
    credit: "Gottlieb Biermann after Christian Albrecht Jensen, 1840" },
  chasles: { name: "Michel Chasles", life: "1793–1880", w: 260, h: 362, page: C + "Michel_Chasles.jpg",
    credit: "Photograph, 19th century (Smithsonian Libraries)" },
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

/** Le HTML d'une rangée de portraits, dans la langue de la page. */
export function peopleHTML(ids, lang = "en") {
  const t = makeT(lang, "people"), tr = (k, fb) => { const v = t(k); return v && v !== k ? v : fb; };
  const fig = (id) => {
    const p = PEOPLE[id]; if (!p) throw new Error(`people: unknown id ${id}`);
    const name = tr(`${id}.name`, p.name), credit = tr(`${id}.credit`, p.credit), alt = tr(`${id}.alt`, `${name}. ${credit}`);
    return `<figure class="person"><img src="/portraits/${id}.jpg" alt="${esc(alt)}" width="${p.w}" height="${p.h}" loading="lazy" decoding="async">` +
      `<figcaption><b>${name}</b> <span class="life">${tr(`${id}.life`, p.life)}</span><br><a href="${p.page}" rel="noopener">${credit}</a></figcaption></figure>`;
  };
  return `<div class="people">${ids.map(fig).join("")}</div>`;
}
