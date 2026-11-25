// Groupes d'onglets (propriétaire, 2026-10-04) : la même répartition pour la barre d'onglets et
// pour les cartes de l'accueil. La géométrie (forme, taille), les mouvements (rotation, orbite),
// les onglets qui mêlent les deux, les réponses aux objections, la mesure en commun, puis les
// résultats et ce qui réfuterait chaque modèle. Un onglet absent d'ici n'apparaît dans aucun groupe.
// 2026-10-25 (propriétaire) : la géométrie (14 onglets) est coupée en deux, le ciel et l'horizon d'un
// côté, le sol et les distances de l'autre ; l'accueil les garde sous un même titre « Géométrie ».
// 2026-10-25 : les bases de physique (phys) avec l'accueil, là où l'on va quand on est perdu.
// 2026-10-25 : l'éther (aether), histoire et objections, à côté de l'histoire des cartes.
// 2026-10-27 : les fusées (rocket), après l'atmosphère dont elles reprennent les billes.
// 2026-10-31 : les études de cas (cases), juste avant les contributions.
// 2026-11-25 : les règles de la comparaison (rules), à côté des bases.
// 2026-11-21 : la perspective (persp), en tête des objections : le mot revient dans presque toutes.
export const TAB_GROUPS = [
  { id: "start", tabs: ["home", "phys", "rules"] },
  { id: "sky", tabs: ["elev", "hh", "cnav", "dip", "curv", "twi", "azim", "ecl", "moon"] },
  { id: "ground", tabs: ["dist", "grav", "seis", "mag", "gps"] },
  { id: "motion", tabs: ["rot", "orb", "sat", "scale"] },
  { id: "both", tabs: ["sun", "star", "fou", "avia"] },
  { id: "answers", tabs: ["persp", "ref", "surv", "obs", "ct", "atmo", "rocket", "map", "aether", "cases", "contrib"] },
  { id: "collab", tabs: ["rx"] },
  { id: "verdict", tabs: ["results", "falsify"] },
];
export const groupTabs = (id) => TAB_GROUPS.find((g) => g.id === id)?.tabs || [];
