// Figures animées pré-rendues SANS carte (propriétaire, 2026-10-27 : « c'est un genre de carte en soi déjà ») : les vitrines.
// scripts/prerender-cards.mjs les rend comme l'export « MP4 » de la figure (le dessin et sa bande de crédit, aucun texte de
// carte), clé <onglet>/<id du canvas>-fig-native-en.mp4 (et -fig-portrait-en.mp4 pour le téléphone) ; core/export-ui.js sert ce fichier au lieu de recalculer.
export const VIDEO_FIGS = { results: ["resReel"], orb: ["orbReelTunnel"], rocket: ["rocketReel"], phys: ["physReelColl"], seis: ["seisReel"], ref: ["refReel"], grav: ["gravAnimTide"], home: ["homeReel"], avia: ["aviaReel"], atmo: ["atmoReel"], persp: ["perspReel"], sun: ["sunRomerReel"] };
// la version téléphone (clé …-fig-portrait-en.mp4) : les proportions du canvas sous 560 px (style.css de chaque onglet)
export const VIDEO_FIG_PHONE = { resReel: "4 / 5", orbReelTunnel: "4 / 5", rocketReel: "3 / 4", physReelColl: "3 / 4", seisReel: "3 / 4", refReel: "3 / 4", gravAnimTide: "5 / 7", homeReel: "4 / 5", aviaReel: "3 / 4", atmoReel: "3 / 4", perspReel: "3 / 4", sunRomerReel: "3 / 4" };
