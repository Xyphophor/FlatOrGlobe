// Les scènes de l'animation « une ville cachée par la mer » (hh, 2026-10-06) : la liste déroulante au-dessus
// de l'animation. Chaque scène se charge à part (import dynamique) et rend { site, buildings, fan, photo,
// xhalfDeg } au format de research/build_bordighera.py et research/fit_bordighera_photo.py.
// À venir : le Cap d'Antibes depuis la plage (11 km), quand la photo sera prise au ras de l'eau -- celle du
// 20 avril 2026 (œil à 3,7 m) ne tranche pas : 1 m d'écart entre modèles, du même ordre que les vagues.
export const SCENES = [
  {
    key: "bordighera", label: "bd-scene-bordighera", fallback: "Bordighera from a balcony near Antibes, 49 km",
    load: () => import("./bordighera-anim.js").then((m) => m.BORD_SCENE),
  },
];
