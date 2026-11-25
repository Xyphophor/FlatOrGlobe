// Cartes autonomes de l'onglet persp (2026-11-21) : une par animation, plus le point de fuite ; la formule en bande sans
// redessiner sa figure (fxFigs: false). Textes : src/i18n/<langue>/persp-cards.json ; {{clé}} = perspValues.
import { perspValues } from "../../tabs/persp/logic.js";

const V = (lang) => { const v = perspValues(lang); return (k) => String(v[k] ?? k); };

export const SOURCES = {
  euclid: "Euclid, Optics (c. 300 BC), definition 4 and proposition 5; transl. H. E. Burton, J. Opt. Soc. Am. 35 (1945) 357.",
  alberti: "L. B. Alberti, De pictura (1435), book I: the visual pyramid and the centric point.",
  snellen: "H. Snellen, Probebuchstaben zur Bestimmung der Sehschärfe (Utrecht, 1862): one minute of arc.",
  flat: "Encyclopædia Britannica, “Flat Earth”: a Sun about 50 km across, about 5,500 km up; the Flat Earth Society's 32 miles across, 3,000 miles up (TalkOrigins archive).",
  sun: "NASA Goddard, Sun Fact Sheet: apparent diameter 1,887″ to 1,952″.",
  young: "A. T. Young, Astron. J. 127 (2004) 3622: refraction flattens the setting Sun, its width unchanged.",
  minnaert: "M. Minnaert, The Nature of Light and Colour in the Open Air (Dover, 1954): sunbeams, perspective, the antisolar point.",
  lynch: "D. K. Lynch, W. Livingston, Color and Light in Nature, 2nd ed. (Cambridge University Press, 2001): crepuscular and anticrepuscular rays.",
};

export const CARDS = [
  { id: "cubes", figs: ["perspAnimCubes"], fx: ["pe-fx-angle"], fxFigs: false, values: V, src: ["euclid", "alberti", "snellen"] },
  { id: "lines", figs: ["persFxVanish"], fx: ["pe-fx-vanish"], fxFigs: false, src: ["alberti"] },
  { id: "sunset", figs: ["perspAnimSunset"], fx: ["pe-fx-sunset"], fxFigs: false, values: V, src: ["flat", "sun", "young"] },
  { id: "dip", figs: ["perspAnimDip"], fx: ["pe-fx-dip"], fxFigs: false, values: V, src: ["flat"] },
  { id: "rays", figs: ["perspAnimRays"], fx: ["pe-fx-rays"], fxFigs: false, values: V, src: ["minnaert", "lynch"] },
  { id: "near", figs: ["perspAnimNear"], fx: ["pe-fx-shadow"], fxFigs: false, values: V, src: ["minnaert", "lynch"] },
  { id: "anti", figs: ["perspAnimAnti"], fx: ["pe-fx-anti"], fxFigs: false, values: V, src: ["flat", "minnaert", "lynch"] },
  { id: "zoom", figs: ["perspAnimZoom"], fx: ["pe-fx-zoom"], fxFigs: false, values: V, src: ["euclid"] },
];
