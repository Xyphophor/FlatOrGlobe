// Cartes autonomes de l'onglet orb (2026-10-04) : une par animation. Textes : src/i18n/<langue>/orb-cards.json.
export const SOURCES = {
  bradley: "J. Bradley, Philosophical Transactions 35 (1728) 637–661; light time 8 min 12 s (Delambre, 1809).",
  sdo: "JSOC, Stanford: SDO/HMI hmi.Ic_720s, RSUN_OBS every seven days of 2023.",
  harpsn: "X. Dumusque et al., A&A 648 (2021) A103; HARPS-N solar time series 2015–2018, DACE, University of Geneva.",
  harps: "T. Trifonov et al., A&A 636 (2020) A74: HARPS radial velocities of τ Ceti (HD 10700), 2003–2019.",
  bessel: "F. W. Bessel, Astronomische Nachrichten 16 (1838) 65: the parallax of 61 Cygni.",
  kepler: "J. Kepler, Astronomia nova (1609) and Harmonices mundi (1619): the three laws of planetary motion.",
  newton: "I. Newton, Principia (1687), and A Treatise of the System of the World (1728): gravitation and the cannonball.",
  gps: "ESA Navipedia, GPS Space Segment: semi-major axis 26,560 km, period half a sidereal day (the pull GM used here).",
  iss: "European Space Agency, Where is the International Space Station?: 400 km high, one circuit in 92 minutes.",
  pettengill: "G. H. Pettengill et al., Astronomical Journal 67 (1962) 181: 25 radar echoes from Venus, Millstone, spring 1961.",
  de440: "R. S. Park et al., Astronomical Journal 161 (2021) 105: the JPL ephemeris DE440 (today's orbits).",
  epta: "J. Antoniadis et al. (EPTA), A&A 678 (2023) A48, and G. Agazie et al. (NANOGrav), ApJL 951 (2023) L9: pulsar timing.",
  mspsrpi: "H. Ding et al., MNRAS 519 (2023) 4982: VLBA positions of 18 millisecond pulsars against quasars.",
  newcomb: "S. Newcomb, Astronomical Papers II part V (1891): every timing of the 1761 and 1769 transits of Venus and the stations' positions; venus2012.de: the 2012 contact III timings.",
  meeus: "J. Meeus, Astronomical Algorithms, 2nd ed. (Willmann-Bell, 1998): the Sun's position and distance.",
};
export const CARDS = [
  { id: "ab", figs: ["orbAnimAb"], fx: ["orbFxAb"], src: ["bradley", "meeus"] },
  { id: "sun", figs: ["orbAnimSun"], fx: ["orbFxSun"], src: ["sdo", "meeus"] },
  { id: "dop", figs: ["orbAnimDop"], fx: ["orbFxDop"], src: ["harpsn", "meeus"] },
  { id: "star", figs: ["orbAnimStar"], fx: ["orbFxStar"], src: ["harps", "meeus"] },
  { id: "par", figs: ["orbAnimPar"], fx: ["orbFxPar"], src: ["bessel", "meeus"] },
  // 2026-11-18 : l'écho radar de Vénus
  { id: "transit", figs: ["orbAnimTransit"], fx: ["orbFxTransit"], src: ["newcomb", "de440"] },
  { id: "radar", figs: ["orbAnimRadar"], fx: ["orbFxRadar"], src: ["pettengill", "de440"] },
  { id: "psr", figs: ["orbAnimPsr"], fx: ["orbFxPsr"], src: ["epta", "mspsrpi"] },
  // 2026-10-16 (propriétaire : « un extract en card des explications des orbites »)
  { id: "kep", figs: ["orbAnimKep"], fx: ["orbFxKep", "orbFxKep3"], src: ["kepler", "newton"] },
  { id: "fall", figs: ["orbAnimFall"], fx: ["orbFxFall"], src: ["newton"] },
  // 2026-11-11 (propriétaire) : le canon à 400 km, tir après tir, caméra sur le boulet
  { id: "cannon", figs: ["orbAnimCannon"], fx: ["orb-fx-can"], src: ["newton", "gps", "iss"] },
];
