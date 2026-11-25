// Stations du Global Seismographic Network utilisées comme sites d'observation
// (onglet azim ; le futur onglet seis les réutilise -- une seule liste, aucun
// lieu choisi pour arranger une réponse). Portées à l'identique du legacy
// (flat-or-globe-2.20.0.html, ~L19285 `SEIS_STATIONS`). Positions nominales
// arrondies à 0,01° (EarthScope / NSF SAGE) : un centième de degré est ~1 km,
// les désaccords mesurés se chiffrent en milliers.
export const SEIS_STATIONS = [
  { c: "KONO", n: "Kongsberg, Norway", lat: 59.65, lon: 9.60 },
  { c: "HRV", n: "Harvard, Massachusetts", lat: 42.51, lon: -71.56 },
  { c: "ANMO", n: "Albuquerque, New Mexico", lat: 34.95, lon: -106.46 },
  { c: "CTAO", n: "Charters Towers, Australia", lat: -20.09, lon: 146.25 },
  { c: "SUR", n: "Sutherland, South Africa", lat: -32.38, lon: 20.81 },
  { c: "PMSA", n: "Palmer Station, Antarctica", lat: -64.77, lon: -64.05 },
  { c: "SBA", n: "Scott Base, Antarctica", lat: -77.85, lon: 166.76 },
];
