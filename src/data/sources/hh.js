// Sources de l'onglet "hh" (hauteur cachée), portées à l'identique du bloc
// .srcs du legacy (flat-or-globe-2.20.0.html, ~L8059-8102, ids "shh-1".."shh-13"
// -- 13 entrées, pas 11 : tasks/epic02/UC01.org annonçait 11 avant vérification
// directe du fichier, chiffre corrigé ici).
//
// Deux entrées (helbronner-palmieri, ovalp-corse) sont partagées avec
// src/data/sources/sim.js sous des numéros différents -- comportement voulu,
// cf. tasks/epic01/UC06.org : la numérotation est strictement par onglet, la
// même source peut donc porter un [n] différent d'un onglet à l'autre.
// "Further reading" (Andrew T. Young) n'est PAS repris ici : simplification
// de cette première passe (voir Résultat de l'UC).
export const SOURCES = [
  {
    id: "dettwiller-refraction-atm",
    html: `L. Dettwiller, <em>Phénomènes de réfraction atmosphérique terrestre</em>,
      <a href="https://comptes-rendus.academie-sciences.fr/physique/item/10.5802/crphys.114.pdf">C. R. Physique 23 (2022)
      S1, 103–132</a> (Académie des sciences) — derives the refraction coefficient from the vertical temperature
      gradient and gives κ ≈ 0.17 for the US 1976 standard atmosphere at sea level, the value this page assumes for
      sightlines close to a water surface. Also the reference for what happens when κ goes large or negative (mirages,
      hillingar).`,
  },
  {
    id: "dettwiller-refraction-hist",
    html: `L. Dettwiller, <em>Panorama historique de l'étude de la réfraction astronomique</em>,
      <a href="https://comptes-rendus.academie-sciences.fr/physique/articles/10.5802/crphys.110/">C. R. Physique 23
      (2022) S1, 13–62</a> — notes the long-run working average of about 0.14 for geodesists, whose observations are
      typically made from relatively high stations on warm sunny afternoons; used here for the Corsica junction, where
      no coefficient was published for the observations themselves.`,
  },
  {
    id: "hirt-refraction-coefficient",
    html: `<a href="https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2010JD014067">Hirt et al. (2010), J. Geophys.
      Res. — terrestrial refraction coefficient</a> — the k ≈ 0.13 "Gaussian" value used here (Gauss derived it in
      1826 from his Hanover survey network), and field measurements showing k varies with weather and can even go
      negative over hot ground — exactly why this page treats variable-k models as unfalsifiable and keeps k fixed and
      visible.`,
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
    id: "garda-lake-level",
    html: `<a href="https://www.comunitadelgarda.it/misura-del-livello-del-lago-di-garda/118.html">Comunità del Garda —
      lake level measurement</a> — the institutional gauge for Lake Garda, read against a hydrometric zero of
      64.027 m above mean sea level, together with the discharge from the Salionze regulating works. The reference
      surface is an equipotential, not a plane.`,
  },
  {
    id: "voce-trentino-garda",
    html: `<a href="https://www.lavocedeltrentino.it/2019/07/14/il-lago-di-garda-non-curva-leonardo-da-vinci-e-terrapiattisti-a-confronto/">La
      Voce del Trentino (2019) — the Lake Garda flat-earth observations</a> — the distances and claims used in the
      table above (Bardolino → Gardone Riviera 14.40 km, Desenzano → Garda 17 km, Desenzano → Gargnano 26 km),
      reported from the group's own account. Cited so their numbers are used, not a paraphrase of them.`,
  },
  {
    id: "bislin-rainy-lake",
    html: `<a href="https://walter.bislins.ch/bloge/index.asp?page=Proof+of+Earth+Curvature%3A+The+Rainy+Lake+Experiment">The
      Rainy Lake experiment (2018), reported by W. Bislin</a> — seven targets on lake ice out to 9.5 km, positions
      fixed by differential GPS to centimetres by a licensed surveyor; the water surface measures curved at roughly
      6,400 km radius. The modern successor to the Bedford Level test.`,
  },
  {
    id: "funivia-baldo",
    html: `<a href="https://www.funiviedelbaldo.it/en/funivia-malcesine-monte-baldo">Funivia Malcesine – Monte Baldo
      (operator)</a> — the three station altitudes (90 m, 580 m at San Michele, 1,760 m at Tratto Spino) that make
      the height sweep described above a single-ticket experiment.`,
  },
  {
    id: "helbronner-palmieri",
    html: `J. Palmieri, <em>Paul Helbronner (1871–1938) et la géodésie de la Corse</em>,
      <a href="http://www.helbronner.org/IMG/pdf/BSSHNC_730-733_Art-_Palmieri_cle8a7d81.pdf">Bull. Soc. Sci. Hist. Nat.
      Corse 730–733 (2010)</a> — the scholarly account of the 1925–26 direct geodetic junction of Corsica to the
      French mainland: curvature named as the obstacle that had defeated every earlier attempt, the station heights,
      the five simultaneous beams observed from Monte Cinto on 25–26 August 1925, and the ±0.57″ closure.`,
  },
  {
    id: "ovalp-corse",
    html: `Ovalp — <a href="https://www.ovalp.com/fr/comprendre/corse-vue-du-continent"><em>La Corse vue du continent</em></a> —
      Helbronner's own computed sightline lengths (Mont Agel → Monte Cinto 198,282.67 m; Mont Coudon → Monte Cinto
      255,582.75 m), the history of the junction, and modern high-resolution photographs of the island from the
      Alpes-Maritimes.`,
  },
  {
    id: "varoquaux-corse",
    html: `<a href="http://emmanuel.varoquaux.free.fr/corse/">E. Varoquaux — La Corse vue du continent</a> — photographs
      from the Côte d'Azur with the minimum observer height computed for each summit (about 12 m for Monte Cinto at
      198 km, about 40 m for the 2,305 m Cima Statoghia at 194 km), which this page reproduces independently from its
      own formula.`,
  },
  {
    id: "chicago-abc57",
    html: `Chicago across Lake Michigan. Distances and viewpoints from
      <a href="https://www.abc57.com/news/skyline-skepticism-the-lake-michigan-mirage">ABC57, Skyline skepticism: the
      Lake Michigan mirage</a> (Warren Dunes, Tower Hill 250 ft) and
      <a href="https://www.abc57.com/news/mirage-of-chicago-skyline-seen-from-michigan-shoreline">ABC57 on Joshua
      Nowicki's Grand Mere photograph</a> of April 2015, reported there as a superior mirage. Willis Tower heights are
      the published 442.1 m to roof and 527.3 m to tip, taken here above the lake datum. Every hidden height in the
      list is computed on this page from those figures; none is quoted from any of the sources.`,
  },
  {
    id: "canigou-metabunk",
    html: `Canigou from Allauch. The observation is old — von Zach recorded it from Notre-Dame de la Garde in 1808 — and
      the modern discussion, including the alignment dates checked against sunset azimuths and an overlay of the
      photograph on a terrain model, is at
      <a href="https://www.metabunk.org/threads/explained-observations-of-canigou-curvature-of-the-earth-atmospheric-refraction.8688/">Metabunk,
      Observations of Canigou, curvature of the Earth and atmospheric refraction</a> (2017). The height of the visible
      cut, near 2,450 m, is from the local observers' own page, canigou.allauch.free.fr.`,
  },
  {
    id: "ign-lidarhd",
    html: `IGN, LiDAR HD terrain model (MNT), Géoplateforme WMS-Raster
      (<a href="https://geoservices.ign.fr/lidarhd">geoservices.ign.fr/lidarhd</a>), Licence Ouverte 2.0: the ground
      under the balcony near Antibes, read at 1 m (research/build_bordighera.py, via research/lidar_horizon.py).`,
  },
  {
    id: "osm-bordighera",
    html: `OpenStreetMap contributors, building outlines and <code>building:levels</code> around Via Romana, Bordighera,
      read through the OSM API on 6 October 2026 (<a href="https://www.openstreetmap.org/copyright">ODbL</a>). Where a
      building has no number of floors, its height is the Copernicus GLO-30 surface model minus the TINITALY ground
      (ESA, Copernicus licence), or three floors.`,
  },
  {
    id: "tinitaly",
    html: `Tarquini S., Isola I., Favalli M., Battistini A., Dotta G. (2023), TINITALY, a digital elevation model of
      Italy with a 10 meters cell size (version 1.1), Istituto Nazionale di Geofisica e Vulcanologia (INGV),
      <a href="https://doi.org/10.13127/tinitaly/1.1">doi:10.13127/tinitaly/1.1</a>, CC BY 4.0, read through its WCS:
      the ground of Bordighera and the hills behind it.`,
  },
  {
    id: "pcn-lidar-liguria",
    html: `Ministero dell'Ambiente, Geoportale Nazionale, Piano Straordinario di Telerilevamento Ambientale: LiDAR
      1 m of Liguria, digital surface model (first return) and terrain model, flights 2008–2010, WMS
      <code>LIDAR_LIGURIA</code> at wms.pcn.minambiente.it, read one pixel at a time (GetFeatureInfo): roofs and
      ground of 621 buildings of the lower town of Bordighera.`,
  },
];
