// Cartes autonomes de l'onglet phys (2026-10-25) : une par figure, ou par groupe quand les figures vont ensemble.
// 2026-11-27 : angles, vectors, deriv, sigma, lsq et demmesh sont partis avec leurs figures dans src/data/cards/math.js.
// Toutes les figures sont celles des formules : fxFigs: false garde les formules en bande sans les redessiner en petit.
// Textes : src/i18n/<langue>/phys-cards.json ; {{clé}} = valeur de physValues (src/tabs/phys/logic.js).
import { physValues } from "../../tabs/phys/logic.js";
import { mechValues } from "../../tabs/phys/mechanics.js";

const V = (lang) => { const v = { ...physValues(lang), ...mechValues(lang) }; return (k) => String(v[k] ?? k); };

export const SOURCES = {
  si: "BIPM, The International System of Units (SI), 9th edition (2019): the seven defining constants.",
  codata: "NIST, CODATA 2022 recommended values: G = 6.674 30(15) × 10⁻¹¹ m³ kg⁻¹ s⁻².",
  galileo: "G. Galilei, Dialogo sopra i due massimi sistemi del mondo (1632), Second Day: the ship's cabin.",
  newton: "I. Newton, Principia (1687): the laws of motion; Book III, Prop. IV (the Moon test).",
  coriolis: "G. Coriolis, Journal de l'École polytechnique 15 (1835) 142: the force in a rotating frame.",
  kepler: "J. Kepler, Astronomia nova (1609); Harmonices mundi (1619), Book V.",
  cavendish: "H. Cavendish, Phil. Trans. R. Soc. 88 (1798) 469: G measured with lead spheres.",
  iers: "IERS Conventions (2010), TN 36, table 1.1: GM⊕ = 3.986 004 418 × 10¹⁴ m³/s², ω = 7.292 115 × 10⁻⁵ rad/s.",
  grs80: "H. Moritz, Geodetic Reference System 1980, J. Geodesy 74 (2000) 128: radii and normal gravity.",
  moon: "NASA NSSDCA, Moon Fact Sheet: 384,400 km, sidereal period 27.3217 days, Earth/Moon mass ratio 81.3.",
  huygens: "C. Huygens, Horologium oscillatorium (1673): the pendulum and the centrifugal force.",
  doppler: "C. Doppler, Abh. königl. böhm. Ges. Wiss. 2 (1842) 465.",
  snell: "R. Descartes, La Dioptrique (1637): the law of sines, found earlier by Snellius and Ibn Sahl.",
  cgpm: "3rd CGPM (1901): standard gravity g_n = 9.806 65 m/s².",
  stevin: "S. Stevin, De Beghinselen der Weeghconst (Leiden, 1586): the triangle of forces.",
  atwood: "G. Atwood, A Treatise on the Rectilinear Motion and Rotation of Bodies (Cambridge, 1784).",
  oersted: "H. C. Ørsted, Experimenta circa effectum conflictus electrici in acum magneticam (1820).",
  lorentz: "H. A. Lorentz, Versuch einer Theorie der electrischen und optischen Erscheinungen in bewegten Körpern (1895).",
  igrf: "P. Alken et al., IGRF-13, Earth Planets Space 73 (2021) 49: horizontal field about 15–25 µT at mid-latitudes.",
  galileo2: "G. Galilei, Discorsi e dimostrazioni matematiche intorno a due nuove scienze (1638), Fourth Day: the parabola.",
  steel: "EN 1993-1-1 (Eurocode 3), § 3.2.6: density of steel 7,850 kg/m³.",
  ussa: "U.S. Standard Atmosphere, 1976: air density at sea level 1.225 kg/m³.",
  marlow: "W. C. Marlow, The Physics of Pocket Billiards (1995): ball-ball contact 0.1–0.6 ms; 0.25–0.3 ms measured by Sorokin.",
  hoerner: "S. F. Hoerner, Fluid-Dynamic Drag (1965), ch. 3: smooth sphere C_D ≈ 0.47 below Re ≈ 3 × 10⁵.",
};

export const CARDS = [
  { id: "kin", figs: ["physFxMean", "physFxVec"], fx: ["phys-fx-mean", "phys-fx-vec"], fxFigs: false, labels: true, src: [] },
  { id: "galileo", figs: ["physFxGalileo"], fx: ["phys-fx-galileo"], fxFigs: false, src: ["galileo"] },
  { id: "rotframe", figs: ["physFxRotFrame"], fx: ["phys-fx-rotframe"], fxFigs: false, values: V, src: ["coriolis", "iers"] },
  { id: "newton", figs: ["physFxN2", "physFxN3"], fx: ["phys-fx-n2", "phys-fx-n3"], fxFigs: false, labels: true, src: ["newton"] },
  { id: "grav", figs: ["physFxGrav", "physFxMoon"], fx: ["phys-fx-grav", "phys-fx-moon"], fxFigs: false, labels: true, values: V, src: ["newton", "cavendish", "iers", "moon"] },
  { id: "circ", figs: ["physFxOmega", "physFxCentri"], fx: ["phys-fx-omega", "phys-fx-centri"], fxFigs: false, labels: true, values: V, src: ["iers", "huygens"] },
  { id: "sidereal", figs: ["physFxSidereal"], fx: ["phys-fx-sidereal"], fxFigs: false, values: V, src: ["iers"] },
  { id: "conserv", figs: ["physFxEnergy", "physFxMom"], fx: ["phys-fx-energy", "phys-fx-mom"], fxFigs: false, labels: true, src: ["newton"] },
  { id: "kepler", figs: ["physFxKep2", "physFxKep3"], fx: ["phys-fx-kep2", "phys-fx-kep3"], fxFigs: false, labels: true, values: V, src: ["kepler", "newton", "iers", "moon"] },
  { id: "waves", figs: ["physFxWave", "physFxDoppler"], fx: ["phys-fx-wave", "phys-fx-doppler"], fxFigs: false, labels: true, src: ["doppler"] },
  { id: "snell", figs: ["physFxSnell"], fx: ["phys-fx-snell"], fxFigs: false, src: ["snell"] },
  { id: "const", figs: ["physFxMetre", "physFxGvar"], fx: ["phys-fx-metre", "phys-fx-gvar"], fxFigs: false, labels: true, values: V, src: ["si", "codata", "grs80", "cgpm"] },
  // la mécanique (2026-10-27) : une carte par animation, ses formules en bande
  { id: "forcetable", figs: ["physAnimTable"], fx: ["phys-fx-equil"], fxFigs: false, src: ["stevin", "newton"] },
  { id: "pulleys", figs: ["physAnimPulley"], fx: ["phys-fx-atwood", "phys-fx-tackle"], fxFigs: false, values: V, src: ["atwood"] },
  { id: "kick", figs: ["physAnimKick"], fx: ["phys-fx-impulse", "phys-fx-billiard"], fxFigs: false, values: V, src: ["newton", "marlow"] },
  { id: "isum", figs: ["physAnimISum"], fx: ["phys-fx-sumJ"], fxFigs: false, values: V, src: ["newton"] },
  { id: "frames", figs: ["physAnimFrames"], fx: ["phys-fx-kickframes"], fxFigs: false, values: V, src: ["galileo", "newton"] },
  { id: "magnetic", figs: ["physAnimMag"], fx: ["phys-fx-lorentz", "phys-fx-oersted"], fxFigs: false, values: V, src: ["oersted", "lorentz", "codata", "igrf"] },
  { id: "ballistic", figs: ["physAnimBall"], fx: ["phys-fx-ballistic", "phys-fx-drag"], fxFigs: false, values: V, src: ["steel", "galileo2", "ussa", "hoerner"] },
];
