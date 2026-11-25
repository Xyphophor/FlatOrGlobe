// Lignes du tableau "What would refute each model", portées VERBATIM du legacy
// (flat-or-globe-2.20.0.html, FX_ROWS ~L25061). Une ligne par onglet de
// preuve : ce qu'on mesure, ce qui coulerait le globe, ce qui coulerait le
// modèle plat, la précision nécessaire. Règle rhétorique n°6 : le verdict
// est énoncé AVANT la mesure, et il est symétrique.
export const FX_ROWS = [
  { tab:"elev",
    what:"The angle of a distant peak above the horizon.",
    globe:"A documented summit photographed at the angle the flat map predicts, repeatably, over a sightline long enough that the two models differ by more than your sighting error.",
    flat:"One radius fitting three sightlines of different lengths at once — the flat model needs a new correction for each.",
    prec:"±2′ on the angle: a theodolite, or a phone clinometer on a levelled base." },

  { tab:"hh",
    what:"How much of a distant target is hidden.",
    globe:"A target of known height, at a measured distance, photographed from a measured eye height, with its whole height visible where the globe hides a slice.",
    flat:"Any hidden slice at all that zoom does not recover: a plane hides nothing, ever, at any distance.",
    prec:"Eye height to ±0.5 m, distance to ±1 %, and the time of day recorded." },

  { tab:"cnav",
    what:"The altitude of Polaris, from two places.",
    globe:"Polaris measured at an altitude that is not the latitude, or a rate that is not 1° per 111 km along a long north–south baseline.",
    flat:"A constant rate over a baseline of thousands of kilometres — the flat map requires that rate to change with distance from its centre.",
    prec:"±10′ with a sextant; ±0.5° is already enough over 1,000 km." },

  { tab:"star",
    what:"Which way the sky turns, and the shape of the trails.",
    globe:"A southern observer photographing arcs centred on Polaris, the same sense of rotation in both hemispheres, or a culmination mean that does not return the latitude.",
    flat:"Any reversal of sense between hemispheres at all: on a plane everyone shares one up, so the sense cannot change.",
    prec:"A phone on a wall, 30 minutes. For the culminations, a clinometer to ±0.5°." },

  { tab:"dist",
    what:"Two long legs of a real journey.",
    globe:"Two legs the globe calls equal coming out unequal, by more than your timing error, on a route where the flat map calls them very different.",
    flat:"The two legs coming out equal — the flat map has them differing by thousands of kilometres.",
    prec:"Flight time × ground speed, or a GPS track; ±3 % separates the models on the routes listed." },

  { tab:"dip",
    what:"How far below eye level the sea horizon sits.",
    globe:"A dip that does not grow as the square root of your height, or a doubled sunset with a repeatable zero delay from a height difference where the globe predicts seconds.",
    flat:"Any non-zero dip at all, at any height: on a plane the horizon stays exactly at eye level.",
    prec:"A stopwatch to ±1 s and a height difference to ±1 m; a theodolite reads the dip directly." },

  // epic13 (2026-09-28) : onglet nouveau, pas dans le legacy
  { tab:"curv",
    what:"How much the horizon sags in a photograph, with the horizon through the centre of the frame.",
    globe:"A sagitta that does not follow the dip — the same bend from 3 km and from 20 km with the same camera — or clearly less than computed from a known height with a calibrated lens.",
    flat:"Any sagitta at all in a calibrated photograph, horizon on the axis: on a plane the horizon is a straight line at eye level, 0.0 at every height.",
    prec:"An ordinary or calibrated lens, the horizon on the optical axis, and a known height; from 35,000 ft the globe predicts about 0.5° across a 60° field." },

  // epic16/UC06 (2026-10-03) : onglet nouveau, pas dans le legacy
  { tab:"rx",
    what:"Your own phone's raw GPS/Galileo signals, solved from the centre of the coordinates; then a sphere fitted through several phones far apart.",
    globe:"A phone whose pseudoranges only solve with kilometre residuals, or a group spread over thousands of kilometres whose points lie on a plane, or whose radius falls outside 6,335–6,400 km beyond its uncertainty.",
    flat:"Residuals of metres for phones everywhere with one set of transmitters, and a bulge between distant phones: on a plane there is none.",
    prec:"An Android phone with raw measurements, a few minutes outdoors, the day's broadcast navigation file; for a group, five people or more a few thousand kilometres apart." },

  { tab:"grav",
    what:"The weight of the same object at two latitudes.",
    globe:"g at the equator and near a pole agreeing to better than a few parts in ten thousand, or varying with latitude in a way that is not sin²φ.",
    flat:"Any latitude dependence of the observed size and sign — a plane gives no reason for one.",
    prec:"A pendulum timed over 1,000 swings reaches one part in 10⁴, which is the size of the effect." },

  { tab:"fou",
    what:"Which way a long pendulum drifts, and how fast.",
    globe:"A precession rate that is not 15.041 sin φ degrees per hour, or one that fails to reverse when the pendulum crosses the equator.",
    flat:"Any reversal of the drift between hemispheres, or any dependence on latitude at all.",
    prec:"A 10 m pendulum, one hour, a chalk mark on the floor: the rate is ~11°/h at 45°." },

  { tab:"seis",
    what:"When one earthquake arrives at two distant stations.",
    globe:"A station at 120° recording a crisp on-time P as sharp as the one at 95°, or the quiet band sitting at a fixed distance in kilometres rather than a fixed angle.",
    flat:"The shadow zone appearing at all, at the angle the globe predicts, from every earthquake regardless of where it starts.",
    prec:"Open archives and a clock; the arrival differences are minutes, not seconds." },

  // epic05/UC05 : une deuxième ligne pour seis, clé propre (id) -- l'onde de pression du Hunga Tonga
  { tab:"atmo", id:"seis-tonga",
    what:"The pressure wave of one volcanic eruption, on ordinary barometers thousands of kilometres apart.",
    globe:"Each barometer recording the pulse only once, or t\u2081 + t\u2082 changing with the station's distance by more than a few percent, as an echo off an edge would make it, or the second pulse arriving later at the farther stations, as a bounce off a dome would.",
    flat:"A second pulse arriving from the other side, earlier the farther the station, with t\u2081 + t\u2082 the same everywhere to within a few percent.",
    prec:"A barometer logged once a minute (airport stations are open) and the eruption time; the pulse is about 0.7 hPa." },

  // epic18 : nos propres localisations ; une seule carte plate pour neuf séismes
  { tab:"seis", id:"seis-relocate",
    what:"Arrival times of P waves at hundreds of stations for nine earthquakes, then for every shallow earthquake of magnitude 7 or more from 2000 to 2023, and the stations' latitudes and longitudes.",
    globe:"Arrival times that do not fall on one smooth curve of the great-circle distance from some centre, or a centre found that way far from where the earthquake was felt.",
    flat:"One flat map fitting all the earthquakes as well as the globe does, with the same number of free parameters, whether each earthquake gets its own curve or all share one.",
    prec:"Open bulletins and a least-squares fit; the P waves are read to about a second." },

  // 2026-10-30 : la direction d'arrivée de l'onde P, lue sur son propre mouvement
  { tab:"seis", id:"seis-waves",
    what:"The direction the first seismic wave (P) arrives from at a station, read off the three components of its own motion, for three great earthquakes.",
    globe:"P waves arriving from directions that do not follow the great circle to the epicentre, station after station.",
    flat:"P waves arriving along the straight line to the epicentre on one flat map, for all stations and all three earthquakes, as well as along the great circle.",
    prec:"Open three-component records of the global network and each sensor's orientation; the direction comes out to a few degrees." },

  // epic05/UC06 : Krakatoa 1883, les tableaux de Strachey
  { tab:"atmo", id:"seis-krakatoa",
    what:"The same kind of pressure wave in 1883, read by hand on the barographs of some fifty observatories.",
    globe:"A full lap (III \u2212 I, IV \u2212 II) that changes with the station's position, as echoes off an edge or a dome would make it, or no regular later passages at all.",
    flat:"The same lap of about 35\u00bd hours at every station from Calcutta to Washington, seven passages at many of them, and the interval I \u2192 II falling in a straight line with the angle from the volcano.",
    prec:"The printed tables of the 1888 Royal Society report (public domain) and a subtraction; no position, no eruption time." },

  // 2026-11-21 : toutes les ondes de Lamb réunies (Tonga sur sept jours, Krakatoa, Nouvelle-Zemble 1961)
  { tab:"atmo", id:"atmo-lamb",
    what:"Every lap of a pressure wave timed at one station, from Krakatoa (1883), the 1961 Novaya Zemlya explosion and Hunga Tonga (2022, seven days of barometers), pooled into one radius.",
    globe:"Laps that differ from one event, instrument or station to the next by more than the wind can explain, or returns after a lap that never cluster.",
    flat:"Laps of 35 to 36 hours whatever the year, the instrument and the place: 35.1 h in Japan in 1961, 36.1 h across the United States in 2022, about 35\u00bd h on the barographs of 1883.",
    prec:"Times printed in 1888 and 1962, and seven days of public airport barometers picked without any Earth model; one fixed speed, 310 m/s." },

  { tab:"mag",
    what:"The angle a freely tilting compass needle takes.",
    globe:"A dip angle that does not follow tan I = 2 tan λ, or a field at the pole that is not twice the field at the equator.",
    flat:"The dipole law holding at all across latitudes — this is the one test that constrains the shape without using a radius.",
    prec:"A dip needle to ±1°; the law predicts 63.4° at 45°, which is far outside that." },

  { tab:"sun",
    what:"Who is in daylight at one instant.",
    globe:"Polled answers that no great circle can separate — two places 180° apart in longitude both in daylight at the same second.",
    flat:"A day–night boundary that is a great circle, moving at 15°/h, with no place ever lit on both sides of the disc.",
    prec:"A handful of correspondents and a synchronised clock; no instrument at all." },

  { tab:"twi",
    what:"How long the sky stays lit after sunset.",
    globe:"The Earth's shadow measured at or below the antisolar point, or climbing at a constant ratio instead of an accelerating one.",
    flat:"A dark shadow edge appearing opposite the Sun at all, with its elevation equal to the Sun's depression.",
    prec:"A phone camera and a timer; the boundary moves degrees per minute." },

  { tab:"azim",
    what:"The compass bearing of the Sun at a stated second.",
    globe:"A measured azimuth departing from the great-circle bearing to the published sub-solar point by more than your sighting error.",
    flat:"The bearing matching the great circle rather than the flat map, which points the other way round the horizon.",
    prec:"±2° with a good compass, once magnetic declination is applied; the models differ by tens of degrees south of the tropics." },

  { tab:"ecl",
    what:"When totality begins and how long it lasts, at a named place, on 2 August 2027.",
    globe:"Tarifa not total from 08:45:05 UT ±15 s for 4 min 39 s ±10 s; Luxor total at any time but 10:02–10:08 UT; Marseille seeing totality at all.",
    flat:"Totality at Tarifa (the best-fitting flat shadow stays ~4,300 km away), or at Luxor near 10:05 UT rather than about 06:09 UT.",
    prec:"A clock set to the second (a phone synced to network time) and a filtered view of the Sun; the models differ by hours and thousands of kilometres." },


  { tab:"ct",
    what:"One star, one straight line of sight, its altitude read at both ends of that line.",
    globe:"The two ends returning the same altitude \u2014 difference zero within your error \u2014 repeatably, at 9 km and at 131 km alike.",
    flat:"That difference growing in proportion to s: the plane predicts exactly 0.000\u00b0 with no free parameter, and the globe predicts \u03b3 = s/R, which is 27\u2032 at 50 km.",
    prec:"A GPS-synchronised clock to \u00b11 s, which is 0.18\u2032. The hard part is the refraction setting: it is worth 15\u2032 and must be fixed before the comparison, not after." },

  { tab:"gps",
    what:"How long a satellite stays above your horizon.",
    globe:"One satellite tracked continuously above the horizon for more than 5 h 04 min, or a constellation that repeats on 24 h rather than 23 h 56 m.",
    flat:"Any satellite setting at all, or the sidereal repeat: fixed emitters over a plane never set and repeat on the solar day.",
    prec:"A phone GNSS status app and a clock; the 4-minute daily drift is unmistakable in a week." },

  // epic14 (2026-09-28) : onglet nouveau, pas dans le legacy
  { tab:"avia",
    what:"How long airliners take on long routes, timed both ways, and which way a free gyro drifts.",
    globe:"Round-trip airborne times on the southern routes (Sydney–Santiago, Perth–Johannesburg) about twice what their great-circle distances need, or a free heading indicator drifting the same way in both hemispheres.",
    flat:"Round-trip times proportional to great-circle distances, with one speed near the filed cruise speeds; inertial units finding true north and their latitude from the Earth's rotation.",
    prec:"Public flight-tracking times over a couple of weeks, both directions averaged; a heading indicator, a clock and a compass." },

  // epic19 (2026-10-04) : onglets nouveaux, pas dans le legacy
  { tab:"rot",
    what:"The rotation that ring lasers and falling balls feel about the local vertical.",
    globe:"Two horizontal ring lasers at different latitudes reading the same rotation, or careful drops landing on the plumb point on average.",
    flat:"A beat ratio between Wettzell and Christchurch of sin 49.14° / sin 43.58° = 1.097, and balls landing east by ⅓ ω g t³ cos φ; a disc predicts 1 and no deflection, a plane at rest zero for both.",
    prec:"Published ring-laser frequencies and dimensions; for the drops, hundreds of falls of 20 m or more and a plumb line to 0.01 mm." },
  { tab:"orb",
    what:"The yearly swing of starlight and of Doppler shifts, and the Sun's Doppler shift through the day.",
    globe:"Zenith stars that stay put through the year to better than 1″, or a solar Doppler curve through the day that a lamp a few thousand km up fits as well as the rotating observer does.",
    flat:"A common yearly swing of about ±20″ in every star, a Sun 3.4 % wider in January, and a daily solar Doppler curve that the best lamp misses by 27 m/s where the parameter-free globe leaves 1 m/s.",
    prec:"A zenith camera or published catalogue positions; public solar spectra (HARPS-N) or a home spectroscope at about 1 m/s for the daily curve." },
  { tab:"sat",
    what:"One day of carrier-phase Doppler from 80 receivers on 79 navigation satellites, fitted with the orbits, the receivers, GM and Ω all free.",
    globe:"Receivers held on one plane fitting the Doppler as well as free ones, or satellites needing different GM for their periods.",
    flat:"Receivers settling on a ball around the centre the orbits go round, 6,357 to 6,381 km from it, from a start on a flat map; one GM for 79 satellites at three heights; the best plane missing by over a hundred m/s where the ball leaves millimetres.",
    prec:"Public RINEX files of the IGS and a least-squares fit of a few hundred unknowns." },
  { tab:"moon",
    what:"Laser times of flight to the Moon from one station through a night.",
    globe:"Ranges as smooth with the station at rest (R = 0) as with any other radius.",
    flat:"One radius, near 6,366 km for Grasse, that makes the Moon's distance from the centre smooth to a metre, where a station at rest leaves about 10 km.",
    prec:"Public normal points (EDC/DGFI) and a lunar theory good to about 10″." },
];
