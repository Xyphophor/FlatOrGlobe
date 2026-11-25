// Point de vue et cibles de l'onglet obs, portés VERBATIM du legacy
// (flat-or-globe-2.20.0.html L26398-26412). Partagés avec l'onglet ct
// (figure du tir du 24 novembre). Distances et azimuts DÉRIVÉS par grand
// cercle, jamais copiés d'une appli.
import { OBS } from "../../core/ephemeris.js";

export const OBS_SITE = { key: "globespot", name: "Globe spot", lat: 44.09388, lon: 6.92856, h: 1690, tz: 1 };
export const OBS_TARGETS = [
  { key: "A", name: "Le Grand Mourre", h: 1898, lat: 43.85750, lon: 6.33722 },
  { key: "B", name: "Mourre de Chanier", h: 1930, lat: 43.84171, lon: 6.35139 },
  { key: "C", name: "Ridge point 1677 m", h: 1677, lat: 44.02418, lon: 6.75155 },
  // Mourre Frey : coordonnées DÉRIVÉES (localisé dans le MNT au relèvement et à
  // la distance publiés) ; la hauteur est celle publiée. Signalé dans les sources.
  { key: "D", name: "Mourre Frey", h: 2025, lat: 44.03250, lon: 6.73333, derived: true },
].map((t) => { const g = OBS.greatCircle(OBS_SITE.lat, OBS_SITE.lon, t.lat, t.lon); return Object.assign({}, t, { d: g.d, az: g.az }); });


/* ATMOSPHÈRE PAR DÉFAUT DU POINT DE VUE (2026-09-24, décision du
   propriétaire). La réfraction astronomique de Sæmundsson est calibrée à
   1010 hPa et 10 °C ; à 1 690 m l'atmosphère standard OACI donne ~826 hPa et
   ~4 °C, d'où le facteur P/1010 · 283/(273 + T) = 0,836 (Meeus ch. 16). Sans
   lui, la page avançait la réfraction du niveau de la mer et publiait des
   heures de contact ~35 s trop tardives. k reste celui de la page (0,13,
   règle 3) : l'écart avec le k de la formule (~0,15) ne pèse que ~2 s.
   Partagé par obs et ct, pour qu'ils montrent le même Soleil au même instant. */
export const OBS_ATM = {
  isa:    { T: 4,  P: 826,  g: -6.5, k: 0.13, label: "standard atmosphere at 1,690 m (default)" },
  sea:    { T: 10, P: 1010, g: -6.5, k: 0.13, label: "sea-level standard (old default)" },
  winter: { T: -3, P: 835,  g: -2,   label: "clear winter evening" },
  inv:    { T: -8, P: 840,  g: 10,   label: "winter inversion (cold air at ground)" },
  summer: { T: 18, P: 830,  g: -9.8, label: "summer afternoon" },
};
/** k de la formule de l'onglet ref : 503·P/T²·(0,0342 + dT/dh) ; un préréglage peut le fixer. */
export const obsKof = (a) => a.k ?? Math.max(-0.5, Math.min(0.9, 503 * a.P / ((a.T + 273.15) ** 2) * (0.0342 + a.g / 1000)));
/** Facteur de la réfraction astronomique (Meeus ch. 16). */
export const obsRefrF = (a) => (a.P / 1010) * (283 / (273 + a.T));
export const OBS_REFR_F = obsRefrF(OBS_ATM.isa);

// Le coucher du 10 janvier 2026 filmé par le propriétaire (P900 sur trépied,
// visé là où le Soleil du globe devait se cacher) -- src/tabs/obs/jan10.js.
// Tout réglage demandé par le propriétaire se fait ICI :
//   t0 / span : fenêtre en heure locale CET (s) ; speed : accélération sans vidéo ;
//   frame : null = centré sur le Soleil du globe au milieu de la fenêtre,
//           sinon { az, alt, fovDeg } (fovDeg = largeur du cadre, le zoom),
//           ou azAt: "HH:MM:SS" = l'azimut du Soleil du globe à cette heure ;
//           ce qui manque reste automatique ;
//   video : null = emplacement réservé ; sinon { src, startLocal: "HH:MM:SS"
//           (heure CET de la première image), rate: 1 (ou le facteur si la
//           vidéo est accélérée) } -- la vidéo commande alors l'horloge.
export const OBS_JAN10 = {
  date: "2026-01-10", t0: "17:03:00", span: 720, speed: 20, lampKM: 5000,
  // ridgeRow (2026-09-27, demande du propriétaire : « comme si on avait visé la crête pareil,
  // c'est le Soleil qui départage ») : chaque panneau pose la médiane de SA crête (moitié
  // droite du cadre) à cette fraction de la hauteur, là où la vidéo montre la sienne --
  // mesurée sur la moitié droite des images (loin de l'éblouissement), 2 images/s :
  // médiane 0,40 H, l'appareil dérive de ±10 px (≈ 1′) pendant l'enregistrement.
  frame: { fovDeg: 1.5, azAt: "17:12:00", ridgeRow: 0.40 },   // cadrage demandé par le propriétaire (2026-09-24)
  // DSCN7381.MOV (Nikon P900, 1920×1080, 25 i/s, 347 s), réduit à 960×540 et
  // accéléré ×20 (ffmpeg setpts=PTS/20) : 17,4 s. Heure de la première image :
  // creation_time des métadonnées, 17:06:57, écrit « Z » mais en heure LOCALE
  // (en UTC le Soleil serait couché ; en heure de fin de prise il serait un
  // degré trop haut). Horloge de l'appareil, à recouper avec les photos du
  // téléphone du propriétaire -- FAIT le 2026-09-27 : trois photos avec une horloge NTP
  // à côté de l'écran (public/photos/obs-2026-01-10-ntp-*.jpg) : l'horloge de l'appareil est
  // juste à ~1 s. Fichier hors git (public/video/, .gitignore).
  video: { src: "/video/obs-2026-01-10-x20.mp4", startLocal: "17:06:57", rate: 20 },
};
