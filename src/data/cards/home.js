// Carte autonome de l'accueil (epic11, demande du propriétaire du 2026-09-30) :
// le cumul des rayons. Textes : src/i18n/<langue>/home-cards.json ; les chiffres
// ({{clé}}) sont calculés sur le cumul chargé (radiiValueLookup, radii.js) et
// suivent donc les données de chaque onglet. Sources : celles des données que
// chaque onglet réduit, dans l'ordre des rangées de la figure.
import { makeT } from "../../core/i18n.js";
import { radiiValueLookup } from "../../tabs/home/radii.js";

export const SOURCES = {
  isc: "International Seismological Centre, On-line Bulletin, doi:10.31905/D808B830: surface-wave arrivals of nine large earthquakes.",
  uscgs: "USC&GS Special Publication No. 4, The Transcontinental Triangulation and the American Arc of the Parallel (1900): reciprocal zenith angles.",
  nos74: "NOAA Technical Report NOS 74 NGS 9, Survey of the McDonald Observatory Radial Line Scheme (1978): reciprocal zenith angles.",
  workbook: "Space Audits, Celestial Theodolite Calculator v9.1.1, the project's published workbook (data_table sheet).",
  gravd: "NOAA National Geodetic Survey, GRAV-D, Block EN02 airborne gravity data (2013): surveys NY11 and IN11, east–west lines, 2011.",
  flightaware: "FlightAware, public flight pages: actual departure and arrival times and filed cruise speeds, read on 2026-09-28.",
  lidar: "IGN, LiDAR HD — 1 m terrain model of France (Géoplateforme): the horizon profiles of the author's two measurements.",
  meeus: "J. Meeus, Astronomical Algorithms, 2nd ed. (1998): the Sun's position for the sunset of 10 January 2026.",
  biruni: "A. C. Sparavigna, \"The Science of al-Biruni\", arXiv:1312.7288 (2013): the mountain-dip measurement at Nandana, c. 1018.",
  hirt: "C. Hirt et al. (2010), J. Geophys. Res.: the refraction coefficient k ≈ 0.13.",
  iem: "Iowa Environmental Mesonet, ASOS one-minute data: station pressure at 102 US weather stations, 15–22 January 2022 (the Hunga Tonga pressure wave).",
  murayama: "N. Murayama, J. Meteor. Soc. Japan 40 (1962) 222, Table 1: three passages of the 30 October 1961 explosion's pressure wave at eight Japanese microbarographs.",
  pdg: "Particle Data Group, Review of Particle Physics, Introduction §5.2: weighted averages and the scale factor.",
  igs: "International GNSS Service, RINEX observation files of 80 stations, 2025-04-10 (BKG open archive): the carrier-phase Doppler of 79 navigation satellites, fitted on this site with every orbit and every receiver free.",
  rings: "G. E. Stedman, R. B. Hurst, K. U. Schreiber, Optics Communications 279 (2007) 124; K. U. Schreiber et al., J. Geophys. Res. 109 (2004) B06405: beat frequencies and dimensions of the Christchurch and Wettzell ring lasers.",
  falls: "The eastward deflection of falling balls: Benzenberg (Hamburg, 1802), Reich (Freiberg, 1831), Hall (Cambridge, Mass., 1903), Bähr et al. (Bremen drop tower, 2005); Guglielmini (1791) set aside, as in the Rotation tab.",
  bradley: "J. Bradley, Philosophical Transactions 35 (1728) 637–661; Delambre's 8 min 12 s from Jupiter's moons (1809).",
  harpsn: "X. Dumusque et al., A&A 648 (2021) A103: HARPS-N solar velocities 2015–2018; T. Trifonov et al., A&A 636 (2020) A74: HARPS velocities of τ Ceti.",
  newcomb: "S. Newcomb, Astronomical Papers II part V (1891): every timing of the 1761 and 1769 transits of Venus, with the 2012 amateur timings (venus2012.de), reduced again with JPL DE440 on this site.",
  pettengill: "G. H. Pettengill et al., Astronomical Journal 67 (1962) 181: 25 radar echoes from Venus, Millstone 1961, reduced again with JPL DE440 on this site.",
  psrs: "EPTA DR2 (A&A 678 (2023) A48) and NANOGrav 15 yr (ApJL 951 (2023) L9) pulsar timing, against the VLBA positions of H. Ding et al., MNRAS 519 (2023) 4982.",
  strachey: "G. J. Symons (ed.), The Eruption of Krakatoa and Subsequent Phenomena, Royal Society (1888), Part II (R. Strachey): times of the air wave's passages at some fifty barographs, 1883.",
};

const lookup = (lang) => {
  const t = makeT(lang, "results");
  return radiiValueLookup(lang, (k) => t(`rad-${k}`));
};

export const CARDS = [
  { id: "radii", values: lookup, figs: ["homeRadii"], src: ["isc", "uscgs", "nos74", "workbook", "gravd", "flightaware", "lidar", "meeus", "biruni", "hirt", "pdg", "iem", "strachey", "murayama", "igs"] },
  // 2026-10-17 : la figure de la rotation et de l'orbite (homeMotion)
  { id: "motion", figs: ["homeMotion"], src: ["rings", "falls", "igs", "bradley", "harpsn", "newcomb", "pettengill", "psrs"] },
];
