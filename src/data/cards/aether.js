// Cartes autonomes de l'onglet aether (2026-10-25, propriétaire : « il faut des cartes et quelques animations »). Une par
// figure ou par groupe ; la formule en bande sans redessiner sa figure (fxFigs: false), sauf l'aberration, dont la figure
// fixe (la pluie, le triangle des vitesses) ajoute à l'animation. Textes : src/i18n/<langue>/aether-cards.json ; {{clé}} = aetherValues.
import { aetherValues } from "../../tabs/aether/logic.js";

const V = (lang) => { const v = aetherValues(lang); return (k) => String(v[k] ?? k); };

export const SOURCES = {
  huygens: "C. Huygens, Traité de la lumière (1690); T. Young, Phil. Trans. R. Soc. 94 (1804) 1; A. Fresnel, Ann. Chim. Phys. 9 (1818) 57.",
  maxwell: "J. C. Maxwell, Phil. Mag. 23 (1862) 12 (Weber–Kohlrausch 310,740 km/s, Fizeau 314,858 km/s); Phil. Trans. 155 (1865) 459.",
  bradley: "J. Bradley, Phil. Trans. R. Soc. 35 (1729) 637: the aberration of γ Draconis.",
  fresnel: "A. Fresnel, Ann. Chim. Phys. 9 (1818) 57: the partial drag 1 − 1/n², and the water-filled telescope.",
  fizeau: "H. Fizeau, C. R. Acad. Sci. 33 (1851) 349: light in flowing water.",
  airy: "G. B. Airy, Proc. R. Soc. Lond. 20 (1871) 35: γ Draconis through a telescope filled with water.",
  mm: "A. A. Michelson, E. W. Morley, Am. J. Sci. 34 (1887) 333: expected 0.4 fringe, less than a fortieth seen.",
  lorentz: "G. F. FitzGerald, Science 13 (1889) 390; H. A. Lorentz, Proc. KNAW 6 (1904) 809; H. Poincaré, C. R. 140 (1905) 1504.",
  einstein: "A. Einstein, Ann. Phys. 17 (1905) 891: the two postulates; time dilation; addition of velocities.",
  laue: "M. Laue, Ann. Phys. 23 (1907) 989: Fresnel's coefficient from the addition of velocities.",
  muons: "J. Bailey et al., Nature 268 (1977) 301: muons at γ = 29.33 live 64.4 µs.",
  hk: "J. C. Hafele, R. E. Keating, Science 177 (1972) 166–170: atomic clocks flown round the world.",
  ashby: "N. Ashby, Living Rev. Relativity 6 (2003) 1: relativity in the Global Positioning System.",
  sagnac: "G. Sagnac, C. R. 157 (1913) 708 and 1410; M. Laue (1911): the same effect in special relativity.",
  mgp: "A. A. Michelson, H. G. Gale, F. Pearson, ApJ 61 (1925) 140: 0.230 ± 0.005 fringe observed, 0.236 computed.",
  ring: "K. U. Schreiber, J.-P. R. Wells, Rev. Sci. Instrum. 84 (2013) 041101: large ring lasers.",
  miller: "D. C. Miller, Rev. Mod. Phys. 5 (1933) 203; R. S. Shankland et al., Rev. Mod. Phys. 27 (1955) 167.",
  joos: "G. Joos, Ann. Phys. 399 (1930) 385: 0.002 fringe at most, 0.75 expected.",
  cavity: "S. Herrmann et al., Phys. Rev. D 80 (2009) 105011; M. Nagel et al., Nat. Commun. 6 (2015) 8174.",
  infeld: "A. Einstein, L. Infeld, The Evolution of Physics (Cambridge University Press, 1938), p. 212.",
  whittaker: "E. T. Whittaker, A History of the Theories of Aether and Electricity (1910).",
};

export const CARDS = [
  { id: "timeline", figs: ["aetherFigTimeline"], src: ["whittaker"] },
  { id: "maxwell", figs: ["aetherFxMaxwell"], fx: ["ae-fx-maxwell"], fxFigs: false, values: V, src: ["huygens", "maxwell"] },
  { id: "aberr", figs: ["aetherAnimAberr"], fx: ["ae-fx-aber"], values: V, src: ["bradley"] },
  { id: "drag", figs: ["aetherFxDrag"], fx: ["ae-fx-drag"], fxFigs: false, values: V, src: ["fresnel", "fizeau"] },
  { id: "airy", figs: ["aetherFxAiry"], fx: ["ae-fx-airy"], fxFigs: false, values: V, src: ["fresnel", "airy", "whittaker"] },
  { id: "mm", figs: ["aetherAnimMM"], fx: ["ae-fx-mm"], fxFigs: false, values: V, src: ["mm"] },
  { id: "contract", figs: ["aetherFxContract"], fx: ["ae-fx-contr"], fxFigs: false, src: ["lorentz"] },
  { id: "clock", figs: ["aetherAnimClock"], fx: ["ae-fx-lt"], fxFigs: false, values: V, src: ["einstein", "muons", "hk"] },
  { id: "vadd", figs: ["aetherFxVadd"], fx: ["ae-fx-vadd"], fxFigs: false, values: V, src: ["einstein", "laue", "fizeau"] },
  { id: "gps", figs: ["aetherFxGps"], fx: ["ae-fx-gps"], fxFigs: false, values: V, src: ["ashby"] },
  { id: "sagnac", figs: ["aetherAnimSagnac"], fx: ["ae-fx-sagnac"], fxFigs: false, values: V, src: ["sagnac", "mgp", "ring"] },
  { id: "bounds", figs: ["aetherFigBounds"], src: ["mm", "joos", "cavity", "miller"] },
  { id: "earth", figs: ["aetherFxEarth"], fx: ["ae-fx-earth"], fxFigs: false, values: V, src: ["infeld"] },
];
