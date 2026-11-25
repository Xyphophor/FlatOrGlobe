// PRESETS de l'onglet "elev" (ex-"sim") (angles d'élévation), portés à l'identique du
// legacy (flat-or-globe-2.20.0.html, PRESETS ~L24688, applyPreset ~L24879).
//
// label/note/why sont l'anglais canonique -- comme dans le legacy, où ce
// sont des chaînes JS et non du DOM, elles restent la source de vérité.
// Les traductions vivent dans src/i18n/<lang>/sim.json sous les clés
// "preset-<key>-label" / "-note" / "-why" (voir presetText() dans
// index.js) ; une clé absente retombe automatiquement sur ce texte anglais
// -- jamais de duplication de l'anglais dans un dictionnaire i18n.
//
// `names`/`obs` sont des noms propres et ne sont volontairement PAS
// traduits : le legacy ne les fait pas non plus passer par presetText().
export const PRESETS = {
  vieriou: {
    label: "Sommet de Viériou → Thorenc · the original observation",
    note: "observer 1,395 m on the Cheiron ridge; the Cime de Barbin at 60 km sits 8.5′ ABOVE the Castellaras on a plane and 1.4′ BELOW it on a globe (2.9′ with straight rays) — a sign flip inside one photograph",
    why: "The Barbin and the Castellaras are ALIGNED to the eye in the photograph — 0.86° apart in true bearing, about one and a half moon-widths, so the picture itself settles which of the two looks higher, with no instrument and no trust required. The plane says the far Barbin must ride 8.5′ ABOVE the near Castellaras, because it is 161 m taller and height is all that matters on a plane. The globe says it must sit 1.4′ BELOW it, because 60 km of curve costs it more than its extra height buys. The photograph shows the Barbin below. A full moon spans 31′ for scale.",
    sourceIds: ["cheiron-wikipedia", "castellaras-wikipedia"],
    obs: "Sommet de Viériou, 1,395 m",
    names: [
      { n: "Castellaras de Thorenc", s: "Castellaras" },
      { n: "Cime de Barbin", s: "Barbin" },
      { n: "Ubac du Bas Thorenc", s: "Ubac" },
    ],
    eye: 1395, radius: 6371, k: 0.13, refr: true,
    o: [{ d: 17.73, h: 1400, az: 0 }, { d: 59.96, h: 1561, az: 0.86 }, { d: 21.9, h: 1539, az: -1.84 }],
    third: true,
  },
  tower: {
    label: "Tower + mountain · both taller, both below eye level",
    note: "observer 322.5 m — a tower at 16.9 km and a summit at 56.6 km; both are TALLER than the observer yet both sit below eye level on a globe, and both are well inside the horizon",
    obs: "Tower, 322.5 m",
    names: [
      { n: "Tower at 16.9 km", s: "Tower" },
      { n: "Mountain at 56.6 km", s: "Mountain" },
    ],
    why: "Both targets are TALLER than the observer, and both are comfortably inside the horizon, so neither “it is too far to see” nor “it is hidden” is available. On a plane anything taller than you must appear above your eye level — that is not a modelling choice, it is what a plane means. Both of these sit below it. The globe predicts exactly that, and predicts the two amounts.",
    eye: 322.5, radius: 6371, k: 0.13, refr: false,
    o: [{ d: 16.9, h: 341, az: 0 }, { d: 56.6, h: 484, az: 2 }],
    third: false,
  },
  cinto: {
    label: "Monte Cinto → mainland France · Helbronner, night of 25–26 Aug 1925",
    note: "from the summit of Monte Cinto (2,709 m), the three nearest of the five beams he held for eight hours: Mont Agel, Mont Chauve d'Aspremont, La Sauvette. Every one is far below eye level on a globe and far above it on a plane",
    sourceIds: ["helbronner-palmieri", "ovalp-corse"],
    obs: "Monte Cinto summit, 2,709 m",
    names: [
      { n: "Mont Agel", s: "Agel" },
      { n: "Mont Chauve d'Aspremont", s: "Mont Chauve" },
      { n: "La Sauvette", s: "Sauvette" },
    ],
    why: "Helbronner held five projector beams from this summit for eight hours and reduced the whole network to ±0.6″ per angle. On a plane every one of these stations, being lower than him, would have to appear below his eye level by a definite amount — and they do appear below, but by amounts that match the globe, not the plane. The decisive point is that the reduction CLOSED: a survey computed on the wrong surface does not close to arcseconds over 250 km, it accumulates.",
    eye: 2709, radius: 6371, k: 0.14, refr: true,
    o: [{ d: 198.283, h: 1149, az: 0 }, { d: 206, h: 840, az: 2 }, { d: 236, h: 779, az: 4 }],
    third: true,
  },
  coudon: {
    label: "Fort du Coudon → Monte Cinto · the reciprocal sight",
    note: "the same 255,582.75 m line read from the other end: a peak 2,004 m taller than the observer that a theodolite must be aimed DOWNWARD at — 0.449° above eye level on a plane, 0.700° below it on a globe",
    sourceIds: ["helbronner-palmieri", "ovalp-corse"],
    obs: "Fort du Coudon, 702 m",
    names: [
      { n: "Monte Cinto", s: "Cinto" },
      { n: "Monte Rotondo", s: "Rotondo" },
      { n: "Monte Stello", s: "Stello" },
    ],
    why: "The cleanest sign flip on the page. Monte Cinto is 2,004 m TALLER than this station. On a plane a taller object is above you, full stop: +0.449°. On a globe 255.6 km of curve drops it to −0.700°, so the theodolite must be aimed DOWNWARD at a mountain two kilometres above you. That is 69′ apart — more than two full moons — and it is the direction of the aim, not its precision, that decides. Helbronner aimed down.",
    eye: 702, radius: 6371, k: 0.14, refr: true,
    o: [{ d: 255.583, h: 2709, az: 0 }, { d: 236, h: 2622, az: 3 }, { d: 198, h: 1307, az: 6 }],
    third: true,
  },
  garde: {
    label: "Notre-Dame de la Garde, Marseille → Canigou",
    note: "from the esplanade at 142 m: Sainte-Victoire at 34 km, Mont Ventoux at 99 km, and the Canigou at 253 km — the last is the celebrated sunset alignment, and on a plane its whole 2,784 m would stand well above eye level",
    sourceIds: ["canigou-terreplate"],
    obs: "Notre-Dame de la Garde esplanade, 142 m",
    names: [
      { n: "Montagne Sainte-Victoire", s: "Sainte-Victoire" },
      { n: "Mont Ventoux", s: "Ventoux" },
      { n: "Pic du Canigou", s: "Canigou" },
    ],
    why: "Three targets at 34, 99 and 253 km, all far taller than the 142 m observer. The plane puts all three above eye level and keeps them all fully visible down to their foothills. The globe puts them progressively lower and cuts progressively more off their bases — and the Canigou, the famous one, is reduced to a summit silhouette rising out of the horizon at sunset. Everyone who has photographed it describes exactly that, and nobody has ever photographed its base.",
    eye: 142, radius: 6371, k: 0.17, refr: true,
    o: [{ d: 34, h: 1011, az: 0 }, { d: 99, h: 1910, az: 3 }, { d: 253, h: 2784.7, az: 6 }],
    third: true,
  },
  shkhara: {
    label: "Karagöl → Shkhara · the Guinness world record, 493 km",
    note: "the longest line of sight ever photographed (R. Jezik, 15 Dec 2024). Flat puts Shkhara 0.224° ABOVE eye level, with its whole 5,203 m and the Black Sea coast beneath it; the globe puts it 1.62° BELOW, with 91% of the mountain buried. 110 arcminutes apart — three and a half full moons. The second target, Kaçkar Dağı, is the instructive contrast: nearer, 1.3 km lower, and entirely above the horizon",
    sourceIds: ["guinness-shkhara", "wikipedia-longdistance", "wikipedia-shkhara"],
    obs: "Karagöl subpeak, 3,275 m",
    names: [
      { n: "Shkhara (Georgia–Russia)", s: "Shkhara" },
      { n: "Kaçkar Dağı", s: "Kaçkar" },
    ],
    why: "The flat arithmetic on this record is CORRECT: with straight rays the globe buries Shkhara 1,350 m below the line of sight. What it omits is refraction, and the amount needed is the test. The summit clears at k = 0.123 — less than the standard-atmosphere 0.17. At the standard value 491 m of 5,203 shows: 9.4%, a thin line of summits on the horizon. That is the photograph. The plane instead requires the whole 5,203 m, the Bezengi Wall to its base, the Svaneti valleys and the Black Sea coast, all in the same frame. They are absent.",
    eye: 3275, radius: 6371, k: 0.17, refr: true,
    o: [{ d: 493.07, h: 5203, az: 0 }, { d: 235, h: 3937, az: 5 }],
    third: false,
  },
  bedford: {
    label: "Bedford Level 1870 · Wallace's three markers",
    note: "three markers at the SAME height above still water, 4.8 km apart along a straight canal, telescope at that height too. A plane predicts three dots in a row; a sphere predicts the middle one standing proud by about 1.5 m",
    sourceIds: ["bedford-historicuk"],
    obs: "Telescope 3.96 m above the water",
    names: [
      { n: "Middle marker, 4.83 km", s: "Middle marker" },
      { n: "Far marker, 9.66 km", s: "Far marker" },
      { n: "Near marker, 1.0 km", s: "Near marker" },
    ],
    why: "Three markers at the SAME height above still water, seen from that same height. This removes every excuse at once: no haze argument, no height difference to argue about, no instrument scale to calibrate. A plane predicts three dots in a straight line. A sphere predicts the middle one standing about 1.5 m proud of the line joining the near and far ones. Through Wallace's telescope in 1870 it stood proud.",
    eye: 3.96, radius: 6371, k: 0.13, refr: true,
    o: [{ d: 4.83, h: 3.96, az: 0 }, { d: 9.66, h: 3.96, az: 1.2 }, { d: 1.0, h: 3.96, az: 2.4 }],
    third: true,
  },
  // le point de vue de Xyphophor (2026-09-25) ; paysage LiDAR et photo : ELEV_ARG plus bas.
  // Argentera à sa hauteur PUBLIÉE (3 297 m, source) ; le MNT du paysage la met à 3 246 m.
  argentera: {
    label: "Xyphophor's viewpoint → the Argentera beside the Riourun · a photograph",
    note: "from a roadside at 107 m, the Argentera, 64 km away in Italy, shows just left of the Riourun, 17 km away. A plane puts the Argentera's summit well ABOVE the Riourun's; a globe puts it below — and the photograph shows it below",
    sourceIds: ["wikipedia-argentera"],
    obs: "Xyphophor's viewpoint, 107 m",
    names: [
      { n: "Riourun", s: "Riourun" },
      { n: "Argentera", s: "Argentera" },
    ],
    why: "Two summits almost in line, 16 and 64 km away. On a plane the far one, 2,400 m taller, must stand several arcminutes ABOVE the near one; on a globe the 64 km of curve pull it down to just under the Riourun's summit. Xyphophor's photograph, at the scale given by the camera's focal length and fitted to the LiDAR skyline with every model given its own best tilt and height, shows the Riourun on top.",
    eye: 106.7, radius: 6371, k: 0.13, refr: true,
    o: [{ d: 16.57, h: 878.9, az: 0 }, { d: 64.46, h: 3297, az: -0.45 }],
    third: false,
  },
  // une photo envoyée par un lecteur (2026-09-26) ; paysage LiDAR (BEV) : ELEV_SCHNEE plus bas.
  // Hauteurs PUBLIÉES (Schneeberg 2 076 m, Anninger 675 m) ; le LiDAR lit 2 075,3 et 674,3 m.
  // Œil : 164 m tel que DONNÉ par le photographe (sol BEV 156,7 m ; question posée).
  // la photo PeakFinder du propriétaire depuis Caussols (2026-09-27) ; paysage : ELEV_CAUS plus bas
  caussols: {
    label: "Plateau de Caussols → Mont Agel over the sea horizon · a photograph",
    note: "from 1,210 m on the plateau de Caussols, Mont Agel (1,148 m published), 39 km away and below the eye, stands above the sea horizon. A plane puts it 7′ BELOW the horizon; a globe 47′ above",
    sourceIds: ["wikipedia-agel"],
    obs: "Plateau de Caussols, 1,210 m",
    names: [
      { n: "Mont Agel", s: "Mont Agel" },
      { n: "Monte Ceppo", s: "Monte Ceppo" },
    ],
    why: "A summit lower than the eye, seen across the sea. On a plane the sea rises towards eye level with distance, so anything lower than the eye must sit below the horizon: Mont Agel, 77 m lower at 39 km, 7′ below it. On a globe the horizon drops 62′ below eye level at this height, and Mont Agel stands 47′ above it. The photograph from this point shows it above the sea horizon. The test is a sign, not a size.",
    eye: 1210, radius: 6371, k: 0.13, refr: true,
    o: [{ d: 39.25, h: 1148, az: 0 }, { d: 70.1, h: 1627, az: -11.6 }],
    third: false,
  },
  schneeberg: {
    label: "Vienna → the Schneeberg over the Anninger · deprojected's photograph",
    note: "from Vienna at 164 m, the Schneeberg, highest summit of Lower Austria, 71 km away, rises behind the Anninger, 26 km away. A plane puts the Schneeberg 24′ above the Anninger; a globe 14′",
    sourceIds: ["wikipedia-schneeberg"],
    obs: "deprojected's viewpoint in Vienna, 164 m",
    names: [
      { n: "Schneeberg (Klosterwappen)", s: "Schneeberg" },
      { n: "Anninger", s: "Anninger" },
    ],
    why: "Two summits nearly in line, 26 and 71 km away. On a plane only the heights count, and the Schneeberg, 1,400 m taller, stands about 24′ above the Anninger; on a globe the extra 45 km of curve take about 10′ of that away. deprojected photographed the Schneeberg from Vienna; fitted to the Austrian LiDAR skyline, the photograph puts the dark ridge in front of it where the globe does, 13′ above where a plane would.",
    eye: 164, radius: 6371, k: 0.13, refr: true,
    o: [{ d: 71.0, h: 2076, az: 0 }, { d: 25.7, h: 675, az: -1.40 }],
    third: false,
  },
};

/**
 * Silhouette bakée du Sommet de Viériou (SIM_VIE dans le legacy, ~L28475),
 * réutilisée depuis src/data/dem/vieriou.json (produite par une session
 * précédente, vérifiée octet pour octet contre le legacy avant réutilisation).
 * SIM_PROFILES = { vieriou: 1 } dans le legacy : un seul cas a un profil
 * cuit aujourd'hui.
 */
export const SIM_PROFILES = ["vieriou"];

// La photo de Xyphophor depuis le Sommet de Viériou (Canon EOS 100D,
// 18 mm, 30 mars 2017 ; panorama 360° assemblé sous Photoshop, ~28 px/°).
// CALAGE : research/align_photo.py sur un premier recadrage de 299×172 px
// (colonnes 94-299, le cairn exclu) :
//   centre 267,24°, 27,0 px/° (rms 2,59 px) ; solution concurrente la plus
//   proche 269,38°, 100,5 px/°, rms 3,18 -- écartée à l'œil (elle lisse les
//   reliefs que la première suit).
// Ce recadrage est EXACTEMENT les pixels (1799, 623) de IMG_20251105_165348.jpg
// (corrélation 0,997 à l'échelle 1,000) : l'image publiée est recoupée de ce
// fichier-là, sans recompression lourde, sur 16° (432×242 px -- hauteur paire imposée par ffmpeg -- x 1732, y 588),
// et hérite du même calage. Hors des 11° calés, l'erreur d'échelle (±0,5 px/°)
// peut atteindre ~2 px aux bords. Chaque modèle garde SA meilleure hauteur
// (eyeRow, règle 2) ; rmsPx = écart résiduel de la ligne de ciel au calage.
export const ELEV_PHOTO = {
  src: "/photos/elev-vieriou.jpg", w: 432, h: 242, azCenter: 267.221, pxPerDeg: 27.0,
  models: { globeK: { eyeRow: 111.24, rmsPx: 2.59 }, globe: { eyeRow: 110.71, rmsPx: 2.47 }, flat: { eyeRow: 115.0, rmsPx: 3.66 } },
};

// Point de vue du propriétaire pour l'Argentera, refait le 2026-10-06 avec une meilleure photo :
// 43,62258° N, 7,07217° E (« environ », au bord d'une route ; 130 m au sud du premier point du
// 2026-09-25, 43,62374° N, 7,07219° E, abandonné avec la photo du téléphone) ; sol 105,0 m (LiDAR HD)
// + 1,7 m d'œil (SUPPOSÉ, hauteur d'homme). Le lieu est confirmé par la parallaxe : l'écart
// Argentera-Riourun passe de 0,547° à 0,451° entre les deux points, et de 0,64° à 0,54° entre les
// deux photos. Regard vers l'Argentera (Italie, 64,5 km), dont seul le haut dépasse ; devant, le
// Riourun (43,76495° N, 7,13317° E, 878,9 m au LiDAR, 16,6 km). Profil et couches :
// research/lidar_horizon.py argentera2 (argentera2-view*.json).
// Argentera placée sur le point le plus haut du MNT du massif (RGE ALTI côté
// italien) : 3 246 m en 44,1775° N, 7,3050° E -- 3 297 m publiés, dit dans la page.
// PHOTO : DSCN7498.JPG (Nikon P900, 31 mars 2026 11:26, 143 mm = 800 mm éq., 4608×3456) ;
// ÉCHELLE LUE DANS L'EXIF : 143 mm sur un capteur de 6,178 mm -> 1 862 px/° (pleine image), la même
// pour tous les modèles. Calage (image réduite ×4, pic enneigé de droite écarté : plus clair que les
// nuages, la ligne de ciel y est mal lue) :
//   python3 research/align_photo.py <image réduite ×4> src/data/dem/argentera2-view.json --sky drop \
//     --allfar --skip 730:900 --anchor 675.1:16.741 --scale 4 --ppd 1862:1863:1
// azimut ANCRÉ sur le sommet de l'Argentera (x 675,1 px = 16,741°) ; basculement et hauteur ajustés
// pour CHAQUE modèle (règle 2). Résidus : globe k 20,1 px (0,65′), globe 26,0 (0,84′), plan 126,4
// (4,07′). Échelle laissée libre (--ppd 1600:2200:2) : 1 890-1 908 px/°, 0,53′ / 0,77′ / 3,96′.
// Image publiée : pleine image réduite ×3 (1536×1152), contraste adouci, sans métadonnées ; les
// nombres ci-dessous sont en pixels de cette image.
// Photo d'un lecteur (2026-09-26) : Vienne, 48,211995° N, 16,48885° E, 164 m
// (DONNÉS par lui ; sol BEV 156,7 m) → le Schneeberg (Klosterwappen, 2 076 m
// publiés, 2 075,3 m au BEV ALS en 47,767016° N, 15,804469° E, 71,0 km,
// azimut 226,08°) derrière l'Anninger (674,3 m, 25,7 km, 224,68°). Profil et
// couches : research/lidar_horizon.py schneeberg (MNT ALS 1 m du BEV, Autriche).
// Son azimut MESURÉ, 248,69°, contredit ses coordonnées ; la photo tranche :
// calée azimut libre (align_photo.py --sky rise), elle tombe à 226,20°
// (rms 16,6 px), la meilleure solution près de 252° à 26,8 px. Ancrée sur le
// sommet (x 1110 = 226,275°, le sommet de la ligne de ciel dans les trois
// modèles), chaque modèle prend SA meilleure échelle (1 085-1 090 px/°),
// son basculement et sa hauteur (règle 2). La crête sombre de premier plan
// (≤ 55 km), jamais utilisée pour le calage, tombe alors à 0,9′ du globe
// (rayons droits), 2,5′ du globe k -- la forêt (≈ 25 m à 26 km, ≈ 3′) n'est
// pas dans un modèle de SOL nu -- et à 13,0′ du plan, qui la met sous le bas
// de l'image. Photo : public/photos/elev-schneeberg.jpg, l'image telle que
// reçue (2048×477 : recadrée ? assemblée ?), hors git comme les autres
// photos ; mise en place pour que le propriétaire en envoie le rendu animé à
// son auteur -- l'autorisation de PUBLIER, le point de vue et l'azimut sont
// en attente de sa réponse.
export const SCHNEE_PHOTO = {
    src: "/photos/elev-schneeberg.jpg", w: 2048, h: 477, anchorX: 1110, anchorAz: 226.275, anchorName: "Schneeberg",
    models: {
      globeK: { pxPerDeg: 1090.0, eyeRow: 1479.1, slope: 0.00919, rmsPx: 15.9 },
      globe: { pxPerDeg: 1090.0, eyeRow: 1434.2, slope: 0.00972, rmsPx: 15.8 },
      flat: { pxPerDeg: 1085.0, eyeRow: 1771.7, slope: 0.00528, rmsPx: 16.0 },
    },
};

export const ELEV_SCHNEE = {
  eye: 164,
  targets: [
    { name: "Schneeberg", d: 71010, h: 2075.3, az: 226.083, color: "#c2410c", clearance: true },
    { name: "Anninger", d: 25680, h: 674.3, az: 224.682, color: "#1d4ed8" },
  ],
  view: { az: 225.85, alt: 1.12, fovDeg: 3.4 },
  // photo retirée le 2026-09-27 en attendant son auteur, remise le 2026-10-06 : deprojected (X) a
  // autorisé son usage. public/photos/elev-schneeberg.jpg = data/elev/schneeberg-lecteur-2048x477.jpg.
  photo: SCHNEE_PHOTO,
};
// Plateau de Caussols (photo PeakFinder du propriétaire, 2026-09-27) : 43,72218° N,
// 6,93849° E, 1 210 m (sol LiDAR 1 208,5 m). Vue vers l'est, de 53° à 129° : la Riviera,
// l'Italie, la Corse. Relief : LiDAR HD/RGE ALTI jusqu'à 45 km, Copernicus GLO-30 au-delà
// (research/lidar_horizon.py caussols). LE TEST : l'horizon marin. Globe k : 62,5′ sous
// l'œil ; plan : la mer remonte vers le niveau de l'œil (limite). Le Mont Agel (sol RGE
// ALTI 1 133 m, 1 148 m publiés), 77 m sous l'œil à 39 km : 6,7′ SOUS l'horizon d'un plan,
// 47′ au-dessus de celui du globe -- un signe. La photo le montre au-dessus.
// Monte Ceppo (Italie) : Copernicus 1 622 m (1 627 publiés) ; Cap Corse : 1 313 m.
export const ELEV_CAUS = {
  eye: 1210,
  targets: [
    { name: "Monte Ceppo", d: 70090, h: 1622, az: 69.668, color: "#6d28d9", horizon: true },
    { name: "Mont Agel", d: 39250, h: 1133, az: 81.287, color: "#c2410c", horizon: true },
    { name: "Cap Corse", d: 221660, h: 1313, az: 115.828, color: "#1d4ed8", horizon: true },
  ],
  // la vue = l'appareil calé pour le globe k (cap, inclinaison ; champ de l'image entière)
  view: { az: 92.173, alt: -0.700, fovDeg: 73.9 },
  // PHOTO (2026-09-27) : IMG du 13 juin 2026, 15:23:05, Redmi Note 13 Pro (2312DRA50G), 23 mm
  // équivalent, fichier ORIGINAL 4 080 × 3 060 (une capture PeakFinder du même instant,
  // recadrée et zoomée, avait été écartée). Focale f = 23 mm sur la diagonale 24 × 36
  // (43,27 mm) → 2 711 px. Calage (hors git : $CLAUDE_JOB_DIR/tmp/camfit.py, rectiligne) :
  // cap, inclinaison, rotation sur les SEULS sommets proches (dôme du Puy de Tourrettes et
  // Pic de Courmettes), chaque modèle à son meilleur (règle 2). RECALÉ le 2026-09-27 (le
  // propriétaire voyait la photo trop haute : +9 px au sommet du Courmettes) : le premier
  // calage (moindres carrés tronqués, colonnes 750-2 100) était tiré par des points de
  // flanc mal détectés (arbres) ; celui-ci minimise l'écart absolu MÉDIAN sur les deux
  // SOMMETS nets (colonnes 1 000-1 300 et 1 550-1 800) : 1,4 à 2,3 px (rmsPx = cette médiane).
  // Jamais utilisés au calage : l'HORIZON MARIN observé (lignes 1 553-1 598, colonnes
  // 2 250-3 850, mer dégagée) tombe à 4 px en moyenne du globe k (≈ 5′), 7 px du globe à
  // rayons droits, 35 px (≈ 44′) sous celui du plan ; le MONT AGEL (crête lointaine dans le
  // col, ligne ≈ 1 499 ; globe k prédit 1 498) est ≈ 33 px, 42′, au-dessus de l'horizon
  // observé -- globe k 47′ au-dessus, plan 6,7′ dessous.
  photo: {
    src: "/photos/elev-caussols.jpg", w: 4080, h: 3060, f: 2711,
    models: {
      globeK: { yaw: 92.173, pitch: -0.700, roll: 1.231, rmsPx: 2.3 },
      globe: { yaw: 92.208, pitch: -0.627, roll: 1.456, rmsPx: 1.4 },
      flat: { yaw: 92.246, pitch: -0.456, roll: 1.869, rmsPx: 1.7 },
    },
  },
};


export const ELEV_ARG = {
  eye: 106.7,
  targets: [
    { name: "Argentera", d: 64462, h: 3246, az: 16.741, color: "#c2410c", clearance: true },
    { name: "Riourun", d: 16573, h: 878.9, az: 17.192, color: "#1d4ed8" },
  ],
  view: { az: 17.6, alt: 2.45, fovDeg: 3.0 },
  photo: {
    src: "/photos/elev-argentera.jpg", w: 1536, h: 1152, anchorX: 224.7, anchorAz: 16.741, anchorName: "Argentera", scaleFrom: "exif",
    models: {
      globeK: { pxPerDeg: 620.67, eyeRow: 2099.27, slope: -0.01008, rmsPx: 6.7 },
      globe: { pxPerDeg: 620.67, eyeRow: 2088.33, slope: -0.00663, rmsPx: 8.7 },
      flat: { pxPerDeg: 620.67, eyeRow: 2202.03, slope: -0.00358, rmsPx: 42.1 },
    },
  },
};
