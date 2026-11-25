// Cartes autonomes de l'onglet seis (epic11). Structure seulement : textes
// dans src/i18n/<langue>/seis-cards.json. `reads` : lecture de la page
// recopiée sous la figure (quel séisme est montré), l'état du sélecteur.
export const SOURCES = {
  isc: "International Seismological Centre, On-line Bulletin, doi:10.31905/D808B830.",
  shearer: "P. M. Shearer, Introduction to Seismology, ch. 8: Surface Waves and Normal Modes.",
  bormann: "P. Bormann & J. W. Dewey, IASPEI Magnitude Working Group recommendations (2013): the Ms₂₀ standard.",
  hearn: "T. M. Hearn, \"Global Rayleigh Wave Attenuation and Group Velocity from ISC Data\", Geosciences 14(2), 50 (2024).",
  ne: "Natural Earth, 1:50m Physical Vectors — Land (public domain).",
  ne110: "Natural Earth, 1:110m Physical Vectors — Land (public domain).",
  oldham: "R. D. Oldham, \"The Constitution of the Interior of the Earth, as revealed by Earthquakes\", Q. J. Geol. Soc. 62, 456–475 (1906).",
  gutenberg: "B. Gutenberg, \"Über die Konstitution des Erdinnern, erschlossen aus Erdbebenbeobachtungen\", Physikalische Zeitschrift 14, 1217–1218 (1913).",
  lehmann: "I. Lehmann, \"P′\", Publ. Bureau Central Séismologique International, Série A, 14, 87–115 (1936).",
  prem: "A. M. Dziewonski & D. L. Anderson, \"Preliminary reference Earth model\", Phys. Earth Planet. Inter. 25, 297–356 (1981).",
  braile: "L. Braile, Surface Wave Propagation Around the Earth (Purdue University).",
  strachey: "G. J. Symons (ed.), The Eruption of Krakatoa and Subsequent Phenomena, Royal Society (1888), Part II: R. Strachey, On the air waves, Tables II–IV and VIII.",
  snyder: "J. P. Snyder, Map Projections — A Working Manual, USGS Professional Paper 1395 (1987): the azimuthal equidistant projection, any centre.",
  kennett: "B. L. N. Kennett, E. R. Engdahl & R. Buland, \"Constraints on seismic velocities in the Earth from traveltimes\", Geophys. J. Int. 122, 108–124 (1995): ak135, the tables the ISC names phases with.",
  tenenbaum: "J. B. Tenenbaum, V. de Silva & J. C. Langford, \"A global geometric framework for nonlinear dimensionality reduction\", Science 290, 2319–2323 (2000): shortest paths through the measured graph, then classical scaling.",
  lindzen: "R. S. Lindzen & D. Blake, \"Lamb waves in the presence of realistic distributions of temperature and dissipation\", J. Geophys. Res. 77, 2166–2176 (1972): about 310 m/s.",
};

export const CARDS = [
  { id: "tt", figs: ["seisTTCanvas"], src: ["shearer"] },
  { id: "arc", figs: ["seisfig0"], src: [] },
  { id: "wave", figs: ["seisGlobeCanvas", "seisAnimCanvas"], fx: ["seisfig0"], labels: true, reads: ["seisAnimReads"], src: ["isc"] },
  { id: "wave-globe", figs: ["seisGlobeCanvas"], fx: ["seisfig0"], reads: ["seisAnimReads"], src: ["isc"] },
  { id: "wave-map", figs: ["seisAnimCanvas"], fx: ["seisfig0"], reads: ["seisAnimReads"], src: ["isc"] },
  { id: "core", figs: ["seisCoreCanvas"], src: ["oldham", "gutenberg", "lehmann", "prem"] },
  { id: "laps", figs: ["seisfig1"], src: ["braile"] },
  { id: "radius", figs: ["seisRadiusFig"], fx: ["seis-m2"], src: ["isc", "bormann", "shearer"] },
  { id: "radius-corr", figs: ["seisRadiusFig2"], fx: ["seis-m5"], src: ["isc", "hearn", "ne"] },
  { id: "radius-both", figs: ["seisRadiusFig", "seisRadiusFig2"], fx: ["seis-m2", "seis-m5"], labels: true, src: ["isc", "shearer", "hearn", "ne"] },
  { id: "reg", figs: ["seisRegFig"], reads: ["seisRegRead"], src: ["isc"] },
  { id: "late", figs: ["seisLatenessFig"], src: ["isc"] },
  // epic18 : le plat a le droit de choisir sa carte, mais une seule pour les neuf séismes ; l'animation et la carte de chaleur
  // 2026-10-25 : l'ombre des ondes P station par station, avec la coupe qui explique les trajets (P, Pdif, PKP)
  { id: "mesh", figs: ["seisMesh"], reads: ["seisMeshReads"], src: ["isc", "tenenbaum"] },
  { id: "shadow", figs: ["seisCoreCanvas", "shadowGlobe", "shadowMap"], rows: [1, 2], labels: true, reads: ["shMapRead"], src: ["isc", "oldham", "gutenberg", "kennett", "snyder", "ne110"] },
  { id: "flatmaps", figs: ["relocMap", "relocHeat"], fx: ["seisFxReloc"], labels: true, reads: ["rlMapRead"], src: ["isc", "snyder", "ne"] },
];
