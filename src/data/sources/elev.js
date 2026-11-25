// Sources de l'onglet "elev" (ex-"sim") (angles d'élévation), portées à l'identique du
// bloc .srcs du legacy (flat-or-globe-2.20.0.html, ~L7514-7553, ids
// "s1-1".."s1-9" -- 9 entrées, pas 14 : tasks/epic02/UC01.org annonçait 14
// avant vérification directe du fichier, chiffre corrigé ici).
//
// Deux entrées (helbronner-palmieri, ovalp-corse) sont réutilisées par
// src/data/sources/hh.js sous des numéros différents -- comportement voulu,
// cf. tasks/epic01/UC06.org : la numérotation est strictement par onglet.
export const SOURCES = [
  {
    id: "helbronner-palmieri",
    html: `J. Palmieri, <em>Paul Helbronner (1871–1938) et la géodésie de la Corse</em>, Bull. Soc. Sci. Hist. Nat. Corse
      730–733 (2010) — the scholarly account of the 1925–26 direct geodetic junction of Corsica to the French
      mainland: curvature named as the obstacle that had defeated every earlier attempt, the station heights, the five
      simultaneous beams observed from Monte Cinto on 25–26 August 1925, and the ±0.57″ closure. Summarises Helbronner's
      <em>Description géométrique détaillée des Alpes françaises</em>, tome IX (Gauthier-Villars, 1929).
      <a href="http://www.helbronner.org/IMG/pdf/BSSHNC_730-733_Art-_Palmieri_cle8a7d81.pdf">(source)</a>`,
  },
  {
    id: "ovalp-corse",
    html: `Ovalp — <a href="https://www.ovalp.com/fr/comprendre/corse-vue-du-continent"><em>La Corse vue du continent</em></a> —
      Helbronner's own computed sightline lengths (Mont Agel → Monte Cinto 198,282.67 m; Mont Coudon → Monte Cinto
      255,582.75 m), the history of the junction, and modern high-resolution photographs of the island from the
      Alpes-Maritimes.`,
  },
  {
    id: "cheiron-wikipedia",
    html: `<a href="https://fr.wikipedia.org/wiki/Montagne_du_Cheiron">Montagne du Cheiron (Wikipédia, FR)</a> — the ridge
      the original observation was made from, and the source for the observer's height: the summits of the Cheiron are
      the cime du Cheiron (1,778 m), Jérusalem (1,768 m), the <b>sommet de Viériou</b>, also spelled Viriou
      (<b>1,395 m</b>), and Coutellade (1,322 m). The same list is published by the Parc naturel régional des
      Préalpes d'Azur and by Pays de Grasse Tourisme.`,
  },
  {
    id: "castellaras-wikipedia",
    html: `<a href="https://fr.wikipedia.org/wiki/Castellaras_de_Thorenc">Castellaras de Thorenc (Wikipédia, FR)</a> — the
      nearer of the two aligned targets: a rocky pinnacle at <b>1,400 m</b> at Andon, Alpes-Maritimes, carrying the
      ruins of a medieval castle, listed as a <em>monument historique</em> on 28 March 1991.`,
  },
  {
    id: "canigou-terreplate",
    html: `<a href="https://www.terre-plate.org/comment-voir-la-courbure-de-la-terre-en-5-secondes/">The Canigou seen from
      Notre-Dame de la Garde, Marseille</a> — photographs of the sunset alignment taken from the basilica esplanade at
      <b>142 m</b>, together with the argument this page's section 03 formalises: on a plane the visual horizon sits at
      eye level, so nothing lower than the observer could ever be seen — and things lower than the observer are seen
      every day.`,
  },
  {
    id: "bedford-historicuk",
    html: `<a href="https://www.historic-uk.com/HistoryUK/HistoryofBritain/The-Bedford-Level-Experiment/">The Bedford Level
      experiment (Historic UK)</a> — the 1870 three-marker design used as an example here and worked through properly
      in the surveying tab: markers at equal height above still water along a 9.7 km straight canal, which is the
      cleanest classical form of this whole argument.`,
  },
  {
    id: "guinness-shkhara",
    html: `<a href="https://www.guinnessworldrecords.com/world-records/66661-longest-line-of-sight-on-earth">Guinness World
      Records — longest line of sight on earth photographed</a> — <b>493.07 km (306.37 mi)</b>, Richard Jezik
      (Slovakia), Giresun, Turkey, <b>15 December 2024</b>. The citation also records the conditions, which matter more
      than the distance: months of watching the forecast, a ten-hour hike through snow to the summit, a night at
      −12 °C with the wind rising to 20–25 m/s, and the frame taken before sunrise. Cited here because the flat-earth
      argument rests on it — so it is quoted from the certifying body rather than from a repost.`,
  },
  {
    id: "wikipedia-longdistance",
    html: `<a href="https://en.wikipedia.org/wiki/Long_distance_observations">Long distance observations (Wikipedia)</a> —
      the maintained list behind the ceiling table: the 493 km Karagöl → Shkhara shot of 15 December 2024, the
      483.5 km Cerro Champaquí → Aconcagua of 13 June 2023, and Marc Bret's 443 km Pic de Finestrelles → Massif des
      Écrins of 16 July 2016. Useful precisely because it is kept by enthusiasts who would love to list a longer one.`,
  },
  {
    id: "wikipedia-shkhara",
    html: `<a href="https://en.wikipedia.org/wiki/Shkhara">Shkhara (Wikipedia)</a> — the target's height, <b>5,203 m
      (17,070 ft)</b>, on the Georgia–Russia border; the summit sits on the Bezengi Wall, an 11–12 km rampart, which is
      what makes the "what else should be in the frame" test so sharp.`,
  },
  {
    id: "wikipedia-argentera",
    html: `<a href="https://en.wikipedia.org/wiki/Monte_Argentera">Monte Argentera (Wikipedia)</a> — the highest summit
      of the Maritime Alps, <b>3,297 m</b>, in Italy just beyond the French border; the target of the second viewpoint.`,
  },
  {
    id: "wikipedia-schneeberg",
    html: `<a href="https://en.wikipedia.org/wiki/Schneeberg_(Alps)">Schneeberg (Wikipedia)</a> — the highest mountain
      of Lower Austria; its summit, the Klosterwappen, is <b>2,076 m</b>. The target of a reader's photograph from Vienna.`,
  },
  {
    id: "bev-als",
    html: `BEV (Bundesamt für Eich- und Vermessungswesen), <a href="https://www.bev.gv.at/Services/Produkte/Digitales-Gelaendehoehenmodell/ALS-Hoehenraster.html">ALS
      DTM, 1 m terrain model of Austria</a> from airborne laser scanning (CC BY 4.0), read by this project's
      research/bev_dem.py; Austria's counterpart of the IGN's LiDAR HD.`,
  },
  {
    id: "wikipedia-agel",
    html: `<a href="https://fr.wikipedia.org/wiki/Mont_Agel">Mont Agel (Wikipédia, FR)</a> — <b>1,148 m</b>, above Monaco;
      the site uses the terrain model's 1,133 m: the IGN's LiDAR HD has no data over 0.13 km² of the summit, a military site, and the RGE ALTI that fills the gap reads 1,133 m there at most (Copernicus GLO-30, a surface model with the buildings, 1,145 m; Wikipédia gave 1,151 m in November 2026). The Basics tab, section on terrain models, gives every value and why they differ.`,
  },
  {
    id: "copernicus",
    html: `<a href="https://spacedata.copernicus.eu/collections/copernicus-digital-elevation-model">Copernicus DEM GLO-30</a>
      (ESA), a 30 m surface model of the whole globe, read by this project's research/cop_dem.py where the IGN's data
      stop (Italy, Corsica seen from afar); a SURFACE model, forests and buildings included.`,
  },
];
