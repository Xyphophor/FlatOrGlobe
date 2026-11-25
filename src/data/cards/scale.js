// Cartes autonomes de l'onglet scale (epic28, 2026-10-17). Textes : src/i18n/<langue>/scale-cards.json.
export const SOURCES = {
  iers: "G. Petit, B. Luzum (eds.), IERS Conventions (2010), eq. 5.15: the Earth Rotation Angle.",
  jpl: "E. M. Standish, Keplerian Elements for Approximate Positions of the Major Planets, JPL: the Earth's mean longitude and perihelion.",
  prec: "N. Capitaine et al., A&A 412 (2003) 567: general precession, 5,028.796195″ per century.",
  sgra: "M. J. Reid, A. Brunthaler, ApJ 892 (2020) 39: the proper motion of Sgr A*, 6.411 mas per year.",
  dist: "IAU 2012 (the astronomical unit); NASA fact sheets (Moon, Neptune); Gaia DR3 (Proxima Centauri); GRAVITY 2021 (Galactic centre, 8.275 kpc); Li et al. 2021 (Andromeda, 761 kpc).",
};
export const CARDS = [
  { id: "clock", figs: ["scaleAnimClock"], fx: ["scaleFxClock", "scaleFxSpeed"], src: ["iers", "jpl", "prec", "sgra"] },
  { id: "zoom", figs: ["scaleAnimZoom"], fx: ["scaleFxPar", "scaleFxLt"], src: ["dist"] },
];
