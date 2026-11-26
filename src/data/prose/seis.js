// Prose de l'onglet seis, extraite VERBATIM et dans l'ordre du panneau
// legacy par research/extract_prose.py (EN). Rendue par src/core/prose.js.
export const PROSE = [
 {
  "t": "eyebrow",
  "html": "Seismology · the planet is scanned a hundred times a day"
 },
 {
  "t": "h1",
  "html": "Earthquakes measure the distance between every pair of points on Earth, and no flat map survives the result"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig opener",
  "id": "",
  "html": "<div class=\"fig opener\" style=\"margin:18px 0\"> <canvas id=\"seisTTCanvas\"></canvas> <div class=\"fcap\"><b>The travel-time curve, the way a seismologist checks it.</b> Arrival time against distance, every station plotted twice: once at its great-circle distance, once at its flat-map distance. This is the plot the experiment card asks you to reproduce from real traces.</div> </div>",
  "k": "x:sq-fcap2"
 },
 {
  "t": "lead",
  "html": "Somewhere on Earth a magnitude-5 earthquake happens roughly every hour. Each one sends a pulse across the surface and through the interior, and a few thousand instruments write down when it arrives. That is a distance measurement between two points on the planet — thousands of them a day, over every pair of continents, made by institutions in dozens of countries that give the raw traces away for free. This tab is about what that pile of arrival times says about the shape of the surface, and then about what the <em>missing</em> arrivals say about what is underneath it.",
  "opener": true,
  "k": "sq-lead"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"seisReel\" class=\"seis-reel\"></canvas></div>"
 },
 {
  "t": "fcap",
  "k": "seisReel-cap",
  "html": "<b>The whole tab in under a minute.</b> The P wave of the 2011 Tōhoku earthquake lighting real stations at their recorded times; the four kinds of waves told apart by how they move the ground; our own centre, found from the times alone; all 261 large shallow earthquakes under one curve, globe against the best flat map; the same, earthquake by earthquake; every flat-map centre tried; the shadow of the core at 368,987 stations; the radius from 13,586 surface-wave arrivals. Every number is the page's own. Click to pause."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "",
  "lines": [
   {
    "tex": "t = \\frac{R\\Delta}{v}",
    "fallback": "t = R·Δ / v"
   },
   {
    "tex": null,
    "fallback": "Δ = great-circle angle"
   },
   {
    "tex": null,
    "fallback": "<span class=\"tex\" data-tex=\"v \\approx 3.8\\ \\text{km}/\\text{s}\">v ≈ 3.8 km/s</span> <span style=\"color:var(--ink-soft);font-weight:400\">(Rayleigh, 100–200 s)</span>"
   }
  ],
  "fig": "seisfig0",
  "gloss": "A surface-wave arrival time is the great-circle distance divided by the group velocity — one function of the angular separation Δ, the same in every azimuth and on every continent. That is a strong claim, and it is the one the flat model cannot match: on a plane the distance between two points is whatever the map says, and no flat map can reproduce the distances a sphere has. Not \"no flat map yet\" — no flat map ever, as a theorem.",
  "k": "x:sq-gloss"
 },
 {
  "t": "h2",
  "html": "Why this is a shape measurement and not a geology lesson",
  "k": "sq-h1"
 },
 {
  "t": "lead",
  "html": "Gauss proved in 1827 that a surface's curvature is fixed by distances measured <em>within</em> the surface alone — the <em>Theorema Egregium</em>. Its brutal corollary is that a sphere cannot be flattened onto a plane without changing distances. Every world map you have ever seen is therefore lying about something; the only question is which distances it wrecks and by how much. A seismic network measures exactly the quantity the theorem is about: surface distance between pairs of points, tens of thousands of pairs, continuously, for over a century.",
  "opener": false,
  "k": "sq-p1"
 },
 {
  "t": "lead",
  "html": "So the test does not require believing any particular story about the Earth's interior. Take the arrival times, ask what surface geometry makes them consistent, and the answer comes back a sphere of radius 6,371 km — the same radius the other tabs get from horizons, from star altitudes and from satellites. Then, as a bonus no flat model has any analogue for, the pattern of the arrivals that are <em>absent</em> hands you a map of the inside.",
  "opener": false,
  "k": "sq-p2"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>How to read the figures below.</b> A page cannot ship a hundred megabytes of seismograms, so the arrival times drawn here are <em>computed</em> from the spherical model. What they show needs no data at all: for ordinary station pairs the two models' distances disagree by tens of minutes to over an hour of travel time. Whether real traces follow the globe column or the flat one is yours to settle — the experiment card at the bottom does it with free public data and about twenty lines of Python. Take this tab's word for the geometry, not for the arrivals.",
  "k": "sq-call1"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\" style=\"margin:18px 0\"> <div class=\"preset-row\" style=\"margin-bottom:6px\"> <span class=\"preset-lbl\">Real epicentre</span> <select id=\"seisRealEvSel\"></select> <span style=\"flex:1 1 auto\"></span> <button class=\"presetbtn\" id=\"seisPlay\" aria-pressed=\"true\" aria-label=\"Play or pause\">&#10073;&#10073;</button> <button class=\"presetbtn\" id=\"seisReset\" aria-label=\"Restart\">&#8634;</button> </div> <div class=\"reads\" id=\"seisAnimReads\"></div> <canvas id=\"seisAnimCanvas\"></canvas> <ul class=\"figkey\"> <li><span class=\"sw\" data-sw=\"seisteal\"></span><span>where the surface wave actually is, computed on the sphere and drawn onto this map, at 3.5 km/s</span></li> <li><span class=\"sw\" data-sw=\"seisorange\"></span><span>where it would be if the map were the territory, at the same speed</span></li> </ul> <div class=\"fcap\"><b>Real epicentres, real stations, real recorded arrival times.</b> The background is the north-polar azimuthal equidistant projection — the standard flat-earth map, on which distance from the north pole is correct and nothing else is. The two wavefronts are still computed geometry, exactly like the rest of this tab's animation; what is new is that each dot switches on at that station's <em>own recorded</em> arrival time from the ISC bulletin, not a computed one. Pick any of the nine real earthquakes used further below.</div> </div>",
  "k": "seis-m1"
 },
 {
  "t": "h2",
  "html": "Telling the waves apart: by how they move, not only by when they arrive",
  "k": "wv-h1"
 },
 {
  "t": "lead",
  "html": "The sections below use readings the ISC names P, Pdif or PKP, and say each time that this is where a globe model enters: the ISC gives these names by comparing each arrival time with tables built for a spherical Earth.<sup class=\"ref\"><a href=\"#s-seis-n5\">[5]</a></sup> But a seismometer records more than a time. It records the ground's motion in three directions, up, north and east, and each kind of wave moves the ground its own way.<sup class=\"ref\"><a href=\"#s-seis-n20\">[20]</a></sup> That can be read off the record with no Earth model at all.",
  "opener": false,
  "k": "wv-p1"
 },
 {
  "t": "raw",
  "tag": "ul",
  "class": "seis-waves-list",
  "id": "",
  "html": "<ul class=\"seis-waves-list\"><li><b>P</b>, the first to arrive: a push and pull <em>along</em> the ray. At a distant station the ray comes up steeply, so the motion is mostly vertical, with a small horizontal part pointing straight away from the earthquake.</li><li><b>S</b>: a shear <em>across</em> the ray, either horizontal and transverse to the path (SH) or in the vertical plane of the path (SV).</li><li><b>Love</b>: horizontal and transverse, like SH, but at long periods and after S.</li><li><b>Rayleigh</b>, the slowest and largest: the ground rolls on an ellipse in the vertical plane of the path, backwards at the top (retrograde).</li><li>And the period: P and S shake at a few seconds, surface waves at tens of seconds, and surface waves are dispersed, their long periods arriving first.<sup class=\"ref\"><a href=\"#s-seis-n15\">[15]</a></sup></li></ul>",
  "k": "wv-list"
 },
 {
  "t": "formula",
  "fig": "seisFxPolar",
  "flat": false,
  "style": "",
  "lines": [
   {
    "tex": "C = \\frac{1}{N}\\sum_i (\\mathbf{x}_i - \\bar{\\mathbf{x}})(\\mathbf{x}_i - \\bar{\\mathbf{x}})^{T}, \\qquad L = 1 - \\frac{\\lambda_2}{\\lambda_1}",
    "fallback": "C = (1/N) Σ (xᵢ − x̄)(xᵢ − x̄)ᵀ,   L = 1 − λ₂/λ₁"
   },
   {
    "tex": null,
    "fallback": "<span style=\"color:var(--ink-soft);font-weight:400\">λ₁ ≥ λ₂ ≥ λ₃ and u₁, u₂, u₃: the eigenvalues and directions of C. L near 1: the ground moves on a line (P, S, Love), along u₁. L small and λ₃ small: an ellipse in the plane normal to u₃ (Rayleigh).</span>"
   }
  ],
  "gloss": "Over a window of a few seconds to two minutes, the three components give a cloud of ground positions. Its covariance says how the cloud is spread: along one line, in one plane, or in every direction.<sup class=\"ref\"><a href=\"#s-seis-n21\">[21]</a></sup><sup class=\"ref\"><a href=\"#s-seis-n22\">[22]</a></sup> For the P wave, u₁ also says where the wave came from: its horizontal part points away from the source when its vertical part points up. Here the P onset is found by the ratio of a short to a long running mean of the energy,<sup class=\"ref\"><a href=\"#s-seis-n23\">[23]</a></sup> the P direction is read from the first seconds after it, and the two horizontals are turned into R, away from the source along that measured direction, and T, across it. No travel time, no origin time and no Earth model is used.",
  "k": "wv-f1"
 },
 {
  "t": "raw",
  "tag": "p",
  "class": "reads",
  "id": "wvRead",
  "html": "<p class=\"reads\" id=\"wvRead\"></p>"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><div class=\"reloc-row\"><span class=\"preset-lbl\">Station</span> <select id=\"wvSta\" aria-label=\"Station\"></select></div><canvas id=\"wvTraces\" class=\"wv-traces\" role=\"img\" aria-label=\"The three components of ground motion at one station during the 2011 Tōhoku earthquake, vertical, radial and transverse, with two coloured bands underneath classifying each window by the shape of the motion\"></canvas><ul class=\"figkey\"><li><span class=\"sw\" data-sw=\"wvp\"></span><span>a line in the vertical plane of the path: P, SV</span></li> <li><span class=\"sw\" data-sw=\"wvt\"></span><span>a line across the path: SH, Love</span></li> <li><span class=\"sw\" data-sw=\"wvr\"></span><span>a retrograde ellipse in the vertical plane of the path: Rayleigh</span></li> <li><span class=\"sw\" data-sw=\"wvm\"></span><span>mixed</span></li></ul><div class=\"fcap\"><b>Tōhoku 2011, three components at one station.</b> Real records from the Global Seismograph Network<sup class=\"ref\"><a href=\"#s-seis-n24\">[24]</a></sup>, ground velocity, 2 to 100 s, the horizontals turned to R and T with the direction the P wave itself gave. The coloured bands underneath classify each window from the motion alone: blue, a line in the vertical plane of the path (P, SV); violet, a line across the path (SH, Love); magenta, a retrograde ellipse in the vertical plane of the path (Rayleigh); grey, mixed. Top band: 20 s windows at 2–20 s periods; bottom band: 2 min windows at 25–100 s. The boxes mark the four windows of the next figure, found from the records alone: the P onset, the first strong transverse onset two minutes or more later, and the strongest minute of long-period transverse, then vertical, motion.</div></div>",
  "k": "wv-fig1"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"wvHodo\" class=\"wv-hodo\" role=\"img\" aria-label=\"The path of the ground in four windows: a nearly vertical line for P, a line across the path for S and for Love, a retrograde ellipse in the vertical plane for Rayleigh\"></canvas><div class=\"fcap\"><b>The ground's path in the four windows.</b> P and Rayleigh in the vertical plane of the path (R across, Z up); S and Love seen from above (R across, T up). The arrow shows the sense of motion halfway through the window.</div></div>",
  "k": "wv-fig2"
 },
 {
  "t": "notes",
  "html": "At the 4 stations shown, the P motion is a line (L from 0.96 to 1.00), in the vertical plane of the path, 20–29° from the vertical, at periods of 8–10 s. The first strong onset on the transverse component comes 7–10 minutes later at periods of 8–20 s. Then the long-period transverse motion (Love, transverse share 0.84 or more, 40–80 s), and after it the Rayleigh ellipse (24–48 s), retrograde at every station. The order and the shapes are exactly what the list above says, read off the records without a single travel time.",
  "k": "wv-p2"
 },
 {
  "t": "lead",
  "html": "The P wave also says where it came from, and that is a test of the shape. Directions on the ground are angles: the direction of the epicentre from a station follows from latitudes and longitudes alone. On the globe it is the start of the great circle; on a flat map, the straight line on the map. The same was done for three great earthquakes, Tōhoku 2011, Maule 2010 and Nias 2005, at the same fourteen stations wherever they recorded a clear P: 38 records (4 without data or without a clear onset).",
  "opener": false,
  "k": "wv-p3"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"wvDirs\" class=\"wv-dirs\" role=\"img\" aria-label=\"For each record, the measured direction of the P wave minus the predicted direction of the epicentre: tight around zero for the globe, spread over tens of degrees for the flat maps\"></canvas><div class=\"fcap\"><b>Where the P wave came from, against where each model puts the epicentre.</b> One dot per record, coloured by earthquake: the direction measured from the P motion minus the predicted direction. Top: the globe, no parameter. Middle: the North Pole flat map. Bottom: the one flat map, out of every centre, whose straight lines fit all 38 measured directions best.</div></div>",
  "k": "wv-fig3"
 },
 {
  "t": "raw",
  "tag": "table",
  "class": "cnav-table",
  "id": "wvTab",
  "html": "<table class=\"cnav-table\" id=\"wvTab\"><caption>The P wave's direction against the predicted direction of the epicentre (rms difference)</caption><thead><tr><th>Earthquake</th><th>Records</th><th>Globe</th><th>Flat, North Pole map</th><th>Flat, one best map</th><th>Flat, that earthquake's own map</th></tr></thead><tbody id=\"wvRows\"></tbody></table>",
  "k": "wv-tab"
 },
 {
  "t": "notes",
  "html": "On the globe the measured directions differ from the great circle by 11.3° rms, 3.6° median. On the North Pole map, by 42.7° rms (30.1° median). The flat model's best case is its best map: the centre near 30° N, 152° W fits all three earthquakes best, and it still misses by 35.4° rms (22.3° median), 3 times the globe. As in the relocation sections, a flat map centred near one earthquake does nearly as well as the globe for that earthquake (7–14° rms, last column), because an azimuthal equidistant map keeps the lines through its centre straight; a flat Earth is one map, not three. The globe's 11.3° is not zero, and the largest single miss is kept: Maule 2010 at SBA in Antarctica, where the P motion comes out almost horizontal (89° from the vertical) and its direction, 83°, against 127° on the globe, changes by over a hundred degrees with the window length.",
  "k": "wv-p4"
 },
 {
  "t": "callout",
  "flat": true,
  "html": "<b>The flat model, stated before the measurement.</b> What would vindicate the plane: a P wave arriving from the direction of the straight line to the epicentre on one flat map, at all stations and for all earthquakes, as well as from the great-circle direction, even with the map's centre left free, a parameter the globe does not get. The best single map misses 3 times as much as the globe.",
  "k": "wv-c1"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>What this does and does not use.</b> (1) The epicentres are the ISC's, located with travel-time tables built for a spherical Earth; the measured directions themselves use only the records and the orientation of each sensor from the station metadata. An orientation error would turn every direction at that station by the same angle, globe and flat alike. (2) The amplitudes are scaled by one gain per channel, not by the full instrument response; it is enough for the shapes, which compare components of the same sensor. (3) The classes are a rule of thumb: thresholds on L, on the transverse share and on the flatness of the ellipse. Windows where waves overlap come out grey, as they should.",
  "k": "wv-c2"
 },
 {
  "t": "h2",
  "html": "Seven stations, one earthquake, two geometries",
  "k": "sq-h2"
 },
 {
  "t": "lead",
  "html": "These are real instruments of the Global Seismographic Network at their published coordinates. For each one the table gives the great-circle distance from the Sumatra–Andaman epicentre and the flat map's distance between the same two dots, then turns both into a Rayleigh-wave arrival time. Nothing is fitted: the inputs are seven pairs of coordinates and one wave speed.",
  "opener": false,
  "k": "sq-p3"
 },
 {
  "t": "table",
  "id": "",
  "tbody": "seisStationRows",
  "caption": "Arrival of the 3.8 km/s surface wave — both distances computed from the same coordinates, neither fitted",
  "head": [
   "Station",
   "Δ great circle",
   "Globe: distance",
   "Globe: arrival",
   "Flat map: distance",
   "Flat map: arrival",
   "Disagreement"
  ],
  "k": "x:sq-cap1"
 },
 {
  "t": "callout",
  "flat": true,
  "html": "<b>Notice what the flat map gets right.</b> Some northern stations come out within a few percent — and that is the diagnosis, not a concession. An azimuthal equidistant map is <em>exact</em> along every line through its centre, so roughly radial paths are nearly right by construction. The error is zero at the centre and grows towards the rim, exactly as the projection's own distortion formula requires. A flat Earth would have to explain why arrival times are wrong by precisely the amount, and in precisely the pattern, that a projection of a sphere is wrong.",
  "k": "sq-call2"
 },
 {
  "t": "h2",
  "html": "The ring of silence, and what is inside it",
  "k": "sq-h3"
 },
 {
  "t": "lead",
  "html": "Now the interior. In 1906 Richard Dixon Oldham noticed that past roughly 120° from an epicentre the S waves simply stopped arriving.<sup class=\"ref\"><a href=\"#s-seis-n1\">[1]</a></sup> S waves are shear waves and shear does not propagate in a liquid, so something in the middle of the Earth is molten. In 1913 Beno Gutenberg pinned the top of it near 2,900 km depth using the fact that direct P waves are missing too — not everywhere, but in a band from about 103° to 143°, where the sharp velocity drop at the boundary refracts them downward and away.",
  "opener": false,
  "k": "sq-p4"
 },
 {
  "t": "lead",
  "html": "The <em>shape</em> of that absence is the argument. It is a ring, at a fixed angular distance, in every azimuth, around every epicentre on the planet. A sphere with a concentric liquid ball inside produces exactly that, and produces it automatically. A disc has no mechanism that makes stations fall silent at 103° in every direction and start talking again at 143°, because on a disc there is no single angular distance that means the same thing in all directions.",
  "opener": false,
  "k": "sq-p5"
 },
 {
  "t": "lead",
  "html": "And in 1936 Inge Lehmann found faint P arrivals <em>inside</em> the silent band and explained them with a solid ball at the centre of the molten one — the inner core, discovered by taking a shadow seriously.<sup class=\"ref\"><a href=\"#s-seis-n10\">[10]</a></sup>",
  "opener": false,
  "k": "sq-p5b"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\" style=\"margin:18px 0\"> <div class=\"sh-pair\"><canvas id=\"seisCoreCanvas\"></canvas><canvas id=\"shadowIdeal\" class=\"shadow-ideal\" role=\"img\" aria-label=\"An ideal globe turning, with one epicentre fixed on it: every point coloured by its angle from the epicentre, green where direct P arrives (under 103 degrees), orange in the shadow (103 to 143 degrees), violet where PKP comes back through the core (beyond 143 degrees)\"></canvas></div> <ul class=\"figkey\"> <li><span class=\"sw\" data-sw=\"shzoneP\"></span><span>on the surface: direct P arrives (Δ under 103°)</span></li> <li><span class=\"sw\" data-sw=\"shzoneS\"></span><span>the shadow: no direct P (103° to 143°)</span></li> <li><span class=\"sw\" data-sw=\"shzoneK\"></span><span>PKP comes back through the core (beyond 143°)</span></li> <li><span class=\"sw\" data-sw=\"shglobe\"></span><span>the shadow's edges, 103° and 143° from the epicentre</span></li> <li><span class=\"sw\" data-sw=\"shepi\"></span><span>the epicentre</span></li> <li><span class=\"sw\" data-sw=\"shP\"></span><span><b>P</b>: a compression wave through the mantle, bent back up; direct P surfaces out to about 103°</span></li> <li><span class=\"sw\" data-sw=\"shPdif\"></span><span><b>P<sub>dif</sub></b>: a P wave that grazes the core and creeps along its surface, coming up weak inside the shadow</span></li> <li><span class=\"sw\" data-sw=\"shPKP\"></span><span><b>PKP</b>: a P wave refracted down through the liquid core (K), back out past about 143°</span></li> <li><span class=\"sw\" data-sw=\"shS\"></span><span><b>S</b>: a shear wave, stopped at the core: a liquid does not carry shear</span></li> <li><span class=\"sw\" data-sw=\"shband\"></span><span>the P shadow, 103° to 143° from the epicentre on each side</span></li> </ul> <div class=\"fcap\"><b>Why the shadow has the width it has.</b> A cross-section with P-wave paths leaving one epicentre at a range of take-off angles. Rays that stay in the mantle bend back upward as velocity rises with depth and surface out to about 103°. Rays that reach the core are refracted sharply downward by the velocity drop and re-emerge only past about 143°. Between the two, nothing. S waves cannot enter the liquid at all, so their shadow runs from 103° all the way round to the antipode. Layer radii are PREM's and are drawn to scale: core–mantle boundary at 3,480 km radius, inner core at 1,221 km.<sup class=\"ref\"><a href=\"#s-seis-n4\">[4]</a></sup> On the right, what that gives at the surface: an ideal globe with one epicentre, turning, each point coloured by the wave it receives. No data here; the same colours are filled with real stations further down. Click to pause.</div> </div>",
  "k": "x:sq-fcap3"
 },
 {
  "t": "table",
  "id": "",
  "tbody": "seisLayerRows",
  "caption": "The interior, and the observation each boundary was read off — radii from PREM",
  "head": [
   "Boundary",
   "Depth",
   "Radius",
   "Fraction of R",
   "What gave it away"
  ],
  "k": "x:sq-cap2"
 },
 {
  "t": "h2",
  "html": "The wave that keeps going round",
  "k": "sq-h4"
 },
 {
  "t": "lead",
  "html": "A large earthquake does not send its surface wave past you once. The pulse travels both ways round the great circle, so a single station records the short way (R1), then the long way (R2), then the short way again after one complete extra lap (R3), then R4, and for the very greatest earthquakes further still. Loma Prieta in 1989, a merely magnitude-6.9 event, produced clean R1, R2 and R3 across the global network.<sup class=\"ref\"><a href=\"#s-seis-n2\">[2]</a></sup>",
  "opener": false,
  "k": "sq-p6"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "lines": [
   {
    "tex": "t(R_3) - t(R_1) = \\frac{2\\pi R}{v} \\approx \\frac{40,030\\ \\text{km}}{3.8\\ \\text{km}\\,\\text{s}^{-1}} \\approx 2\\,\\text{h}\\ 56\\,\\text{m}",
    "fallback": "t(R3) − t(R1) = 2πR / v ≈ 40,030 km / 3.8 km s⁻¹ ≈ 2 h 56 m"
   }
  ],
  "fig": "seisfig1",
  "gloss": "R3 has covered one entire extra circumference relative to R1, so the gap between them at a single station measures the circumference of the Earth directly, assuming nothing about where anything is. Do it at a second station and you get the same number. Do it for an earthquake on the other side of the planet and you get it again. This may be the strongest single item on the tab, because it does not merely say the surface is curved — it says the surface is <em>closed</em>, with no edge for the wave to reflect from, and with the same circumference measured in every direction. A disc with a rim would return an echo whose delay depended on which way the wave set off. Nobody has ever recorded one.",
  "k": "x:sq-gloss2"
 },
 {
  "t": "notes",
  "html": "Watch the northern stations agree almost exactly while the southern ones drift apart by the better part of an hour. That gradient — error growing with southern latitude rather than scattering at random — is the fingerprint of a projection, and it is the same gradient for every earthquake regardless of where it starts.",
  "k": "sq-p-grad"
 },
 {
  "t": "h2",
  "html": "And then the whole thing rings",
  "k": "sq-h5"
 },
 {
  "t": "lead",
  "html": "Past about magnitude 8.5, the surface waves lap the planet often enough to interfere with themselves and the Earth begins to resonate as one body, like a struck bell. The gravest tones are ₀S₂, in which the planet alternates between a rugby ball and a doorstop with a period near 54 minutes, and ₀S₀, the breathing mode, in which the whole sphere expands and contracts together every 20.5 minutes. After the 2004 Sumatra–Andaman earthquake these were recorded on seismometers and superconducting gravimeters around the world.<sup class=\"ref\"><a href=\"#s-seis-n3\">[3]</a></sup>",
  "opener": false,
  "k": "sq-p7"
 },
 {
  "t": "lead",
  "html": "A resonance is the sharpest kind of shape measurement there is, because the tones of a body depend on its size, its shape and its density profile and on nothing else. The observed list of hundreds of mode frequencies is what pins down the radial density model in the first place<sup class=\"ref\"><a href=\"#s-seis-n4\">[4]</a></sup> — and the fact that a <em>radial</em> model, a function of depth alone, reproduces them is a statement of spherical symmetry that nothing on a disc has a counterpart for.",
  "opener": false,
  "k": "sq-p8"
 },
 {
  "t": "lead",
  "html": "A disc has no fundamental tone at 54 minutes. It has no fundamental tone at all until you say where its edge is, and then the tone tells you where the edge is, and no such tone has ever been recorded.",
  "opener": false,
  "k": "sq-p8b"
 },
 {
  "t": "h2",
  "html": "Four objections, and what the data says back",
  "k": "sq-h6"
 },
 {
  "t": "fold",
  "q": true,
  "k": "seis-fold1",
  "summary": "<b class=\"faq-q\">1. \"Seismologists assume a spherical Earth in their software, so of course they get one out.\"</b>",
  "html": "<p class=\"cnav-lead\">The model is assumed and then <em>tested</em>, which is a different thing, and the test is unforgiving. A location computed from four stations predicts the arrival time at the fifth; a wrong Earth model shows up as residuals that will not go away. Reference models are fitted to millions of catalogued arrival times and their residuals sit at the level of seconds against travel times of twenty minutes.<sup class=\"ref\"><a href=\"#s-seis-n5\">[5]</a></sup> If the surface metric were wrong by the 60–100% the flat map needs in the southern hemisphere, no such model could exist at all — and what you would notice first is earthquakes being located in the wrong place, which the ruptured ground and the tsunami arrival times would immediately contradict.</p>"
 },
 {
  "t": "fold",
  "q": true,
  "k": "seis-fold2",
  "summary": "<b class=\"faq-q\">2. \"The agencies could be coordinating.\"</b>",
  "html": "<p class=\"cnav-lead\">Data centres in the United States, France, Germany, Japan, Switzerland, New Zealand, Turkey, Italy, Canada, Greece, Taiwan and Spain all serve raw traces through the same open FDSN protocol, and ObsPy will pull from any of them with a one-line change of hostname.<sup class=\"ref\"><a href=\"#s-seis-n6\">[6]</a></sup> Add a few thousand hobbyist Raspberry Shake instruments in private houses streaming to a public archive that speaks the same protocol.<sup class=\"ref\"><a href=\"#s-seis-n9\">[9]</a></sup> Coordination is not really the obstacle; the obstacle is that you can download a Norwegian trace and an Antarctic trace of the same earthquake in one script and compare them yourself in an afternoon.</p>"
 },
 {
  "t": "fold",
  "q": true,
  "k": "seis-fold3",
  "summary": "<b class=\"faq-q\">3. \"The waves could travel at different speeds in different directions.\"</b>",
  "html": "<p class=\"cnav-lead\">They do vary a little — that variation is an entire discipline called seismic tomography, and it amounts to a few percent. To rescue the flat map you would need the surface wave to run at 3.8 km/s towards Norway and about 7.7 km/s towards the Antarctic Peninsula from the same earthquake, and then to change its mind about which direction is which as soon as the earthquake happens somewhere else, because the required factor depends on the epicentre. A speed field that has to be recomputed for every source is not a speed field. It is the distances that are wrong, and only one arrangement of the distances is consistent across all sources at once.</p>"
 },
 {
  "t": "fold",
  "q": true,
  "k": "seis-fold4",
  "summary": "<b class=\"faq-q\">4. \"Nobody can check any of this without a laboratory.\"</b>",
  "html": "<p class=\"cnav-lead\">This is the objection the tab most wants to lose. Every trace referred to here is free, most of it available within minutes of the event, and the tooling is a Python package.<sup class=\"ref\"><a href=\"#s-seis-n7\">[7]</a></sup> There is a point-and-click route for anyone who would rather not write code.<sup class=\"ref\"><a href=\"#s-seis-n8\">[8]</a></sup> A hundred-euro seismometer in a spare room records earthquakes from the far side of the planet and joins the same open network you are downloading from. The experiment below is not a thought experiment.</p>"
 },
 {
  "away": "xp-seis-1e",
  "t": "exp",
  "h": "Experiment 1e · seismology",
  "title": "Download one earthquake and plot the travel-time curve yourself",
  "lead": "Pick any magnitude 7.5 or greater event from the last twenty years. Ask a data centre for the vertical component at ten or twelve stations spread between 20° and 160° away, band-pass between 100 and 200 seconds so that only the long-period surface wave survives, and read off the time of the peak of the wave packet at each. Plot that time against great-circle distance, then against flat-map distance. One of those two plots is a straight line through the origin and the other is a shotgun pattern. You will know which within a minute of the plot appearing, and you will not have taken anybody's word for anything.",
  "iv": "<span class=\"vartag iv-t\">Independent variable</span><br> <b>What you change:</b> the <b>station</b>, and therefore its distance from the epicentre. Spread them over as much of the range as you can, and make sure several are in the southern hemisphere — that is where the two models separate.",
  "dv": "<span class=\"vartag dv-t\">Dependent variable</span><br> <b>What you measure:</b> the <b>arrival time</b> of the filtered surface-wave peak, relative to the origin time in the event catalogue. Nothing else — no amplitudes, no instrument response, no modelling.",
  "meta": [],
  "inputs": [
   [
    "expSlat",
    "Epicentre latitude <span class=\"unit\">(°)</span>",
    " type=\"number\" id=\"expSlat\" value=\"3.316\" min=\"-90\" max=\"90\" step=\"0.001\""
   ],
   [
    "expSlon",
    "Epicentre longitude <span class=\"unit\">(°)</span>",
    " type=\"number\" id=\"expSlon\" value=\"95.854\" min=\"-180\" max=\"180\" step=\"0.001\""
   ],
   [
    "expTlat",
    "Station latitude <span class=\"unit\">(°)</span>",
    " type=\"number\" id=\"expTlat\" value=\"-64.774\" min=\"-90\" max=\"90\" step=\"0.001\""
   ],
   [
    "expTlon",
    "Station longitude <span class=\"unit\">(°)</span>",
    " type=\"number\" id=\"expTlon\" value=\"-64.049\" min=\"-180\" max=\"180\" step=\"0.001\""
   ],
   [
    "expSv",
    "Group velocity <span class=\"unit\">(km/s)</span>",
    " type=\"number\" id=\"expSv\" value=\"3.8\" min=\"1\" max=\"8\" step=\"0.1\""
   ]
  ],
  "out": "expSout",
  "verdict": "expSverd",
  "k": "x:sq-exph"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "exp",
  "id": "",
  "html": "<div class=\"exp\"> <div class=\"exp-h\">Experiment 1e-b · the ring of silence</div> <div class=\"exp-t\">Ask whether a wave arrived at all — a yes/no test, in a browser, with no code</div> <p class=\"exp-lead\">Experiment 1e above fits a line and reads its slope. This one asks a blunter question, and needs less: <b>did the wave arrive, or did it not?</b> Pick a single magnitude 7 or larger event from the catalogue<sup class=\"ref\"><a href=\"#s-seis-n11\">[11]</a></sup> and request the vertical component at five stations spread across the distance range — say near 60°, 95°, 120°, 135° and 155° from the epicentre. Point-and-click will do it; the event-oriented request tool<sup class=\"ref\"><a href=\"#s-seis-n8\">[8]</a></sup> picks the event on a map and the stations by distance band, and hands you the traces. Then look at each record at the time direct P is due. You are not measuring anything. You are answering five yes/no questions.</p> <div class=\"exp-grid\"> <div class=\"exp-var iv\"><span class=\"vartag iv-t\">Independent variable</span><br> <b>What you change:</b> the station's <b>angular distance Δ</b> from the epicentre — nothing else. Then, for the version that matters most, keep Δ near 120° and change the <b>azimuth</b> instead: pick stations in that band on opposite sides of the epicentre, and ask the same question again.</div> <div class=\"exp-var dv\"><span class=\"vartag dv-t\">Dependent variable</span><br> <b>What you measure:</b> the <b>presence or absence</b> of a sharp P onset at the predicted time. Not its amplitude, not its polarity, not a corrected magnitude. One bit per station, as in Experiment 6b on the solar tab, and for the same reason: a bit cannot be fudged by a calibration.</div> </div> <p class=\"exp-meta\"><b>Hold constant:</b> one event, one component, the same window relative to the catalogue origin time, and the same display gain — a shadow is easy to manufacture by turning the gain down. Prefer a shallow event; a deep one shifts the edges of the band by degrees. <br><b>Kit:</b> a browser. Experiment 1e wants a Python install; this one does not, which is the only reason it is listed separately. <br><b>The tells, stated in advance:</b> a crisp impulsive P out to about <b>103°</b>; between 103° and about <b>143°</b> no impulsive P at the time it is due; and beyond 143° P returns — but late, having been refracted down through the liquid core and back. The shape of the absence is the argument: it is a <b>ring</b>, at a fixed angular distance, in every azimuth, around every epicentre on the planet. Move the earthquake and the ring moves with it. <br><b>What a flat model would need.</b> Not a shadow somewhere — a shadow at one fixed <em>angular</em> radius in all directions at once, recentring itself on each new epicentre, and letting the wave back in past a second fixed radius, later than a straight path allows. There is no arrangement of layers in a slab that does this; there is one arrangement of a sphere with a low-velocity core that does it without adjustment, and it is the arrangement Gutenberg published in 1913<sup class=\"ref\"><a href=\"#s-seis-n12\">[12]</a></sup>.</p> <p class=\"exp-meta\"><b>The honest caveat, before the verdict.</b> The band is not literally silent, and this page will not pretend otherwise. Weak long-period energy diffracts around the core boundary, and faint arrivals do appear inside the band — that is precisely what Lehmann took seriously in 1936 when she deduced the inner core from them<sup class=\"ref\"><a href=\"#s-seis-n10\">[10]</a></sup>. So the test is not \"no signal at all\"; it is <b>no sharp, impulsive, high-frequency P at the predicted arrival time</b>, against an unmistakable one at 95°. <br><b>The verdict rule, symmetric.</b> The globe fails if a station at 120° records a crisp on-time P as sharp as the one at 95°, or if the quiet band sits at a fixed distance in kilometres rather than in degrees, or if it appears in some azimuths and not others. The flat model fails if the silence closes into a ring at one angular radius, recentres on every new epicentre, and gives the wave back late beyond 143°.</p> </div>",
  "k": "x:sq2-h"
 },
 {
  "t": "h2",
  "html": "The reverse-engineering, done for real",
  "k": "sq-h7"
 },
 {
  "t": "lead",
  "html": "Experiment 1e above is a recipe for redoing this measurement yourself: download one earthquake, keep the surface wave, read off arrival times, and plot them against distance both ways. This section is that recipe already carried out — not on numbers this page computed, but on 479 real Rayleigh-wave (LR) arrivals picked by real seismograph networks for nine real earthquakes between 2004 and 2022, pulled from the same public bulletin Experiment 1e's tooling talks to.<sup class=\"ref\"><a href=\"#s-seis-n13\">[13]</a></sup> Every row is one instrument's own reading of its own trace.",
  "opener": false,
  "k": "sq-p9"
 },
 {
  "t": "formula",
  "fig": "seisFxRvt",
  "flat": false,
  "style": "",
  "lines": [
   {
    "tex": "R = \\dfrac{v\\,t}{\\Delta}",
    "fallback": "R = v·t / Δ"
   },
   {
    "tex": null,
    "fallback": "Δ = great-circle angle from the published coordinates (seisDelta) — never ISC's own printed distance, which could hide whatever radius its software already assumes"
   },
   {
    "tex": null,
    "fallback": "<span class=\"tex\" data-tex=\"v \\approx 3.5\\ \\text{km}/\\text{s}\">v ≈ 3.5 km/s</span> <span style=\"color:var(--ink-soft);font-weight:400\">(Ms₂₀ band, 18–22 s — a shorter, slower wave than the 3.8 km/s used elsewhere on this tab)</span>"
   }
  ],
  "gloss": "Nothing here is fitted to land near 6,371 km: t is a real clock-to-clock arrival time, Δ comes from coordinates the same way seisDelta() computes it everywhere else on this tab, and v is a round textbook figure for this wave band, fixed before looking at the answer.<sup class=\"ref\"><a href=\"#s-seis-n14\">[14]</a></sup> Picking v from the result, or quietly dropping the earthquakes that disagree, would make the whole exercise circular — neither is done here.",
  "k": "seis-m2"
 },
 {
  "t": "raw",
  "tag": "p",
  "class": "reads",
  "id": "seisRadiusRead",
  "html": "<p class=\"reads\" id=\"seisRadiusRead\"></p>"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"seisRadiusFig\"></div> <div class=\"fcap\"><b>Nine box plots: nine real earthquakes, then all 479 arrivals combined.</b> Same convention as the surveying tab's box plot — box between the quartiles, bar at the median, whiskers to 1.5 interquartile ranges, dots past them — with 6,371 km drawn as a vertical line. Every box lands within a few thousand kilometres of that line on the first try, with nothing fitted; none goes anywhere near the infinity a flat map would need.</div> </div>",
  "k": "seis-m3"
 },
 {
  "t": "table",
  "id": "",
  "tbody": "seisRadiusRows",
  "caption": "The same boxes as numbers — median radius, interquartile range, and departure from 6,371 km",
  "head": [
   "Earthquake",
   "n",
   "Median R",
   "Quartiles",
   "Off 6,371 km"
  ],
  "k": "seis-m4"
 },
 {
  "t": "callout",
  "flat": true,
  "html": "<b>This box is wider than the others on this page, and that is expected.</b> A few percent of median offset and about a quarter of the range in spread is real crustal heterogeneity: Rayleigh waves at 18–22 s run measurably faster under ocean basins than under continents, and these paths mix both.<sup class=\"ref\"><a href=\"#s-seis-n15\">[15]</a></sup> Other agencies' picks, or purely teleseismic distances, do not tighten it — the spread is in the wave, not in the bookkeeping. It is far below the 60–100% a flat map would need. Real data with its honest scatter, landing in the right place without being tuned to, is worth more than a perfect line computed from the model under test.",
  "k": "sq-call3"
 },
 {
  "t": "h2",
  "html": "Correcting for where the wave actually travelled",
  "k": "sq-h8"
 },
 {
  "t": "lead",
  "html": "The cause named above is testable, not just citable. A 20 s wave samples the top of the mantle under thin oceanic crust but stays inside the thicker, slower crust under a continent. For each of the 479 paths, the fraction of the great-circle route over open ocean can be measured from real coastlines, and one global oceanic and one global continental group velocity, both published independently from the same ISC data family as these arrivals,<sup class=\"ref\"><a href=\"#s-seis-n16\">[16]</a></sup> blended by that fraction — <em>before</em> looking at any radius, so the correction stays as non-circular as the raw version.",
  "opener": false,
  "k": "sq-p10"
 },
 {
  "t": "formula",
  "fig": "seisFxBlend",
  "flat": false,
  "style": "",
  "lines": [
   {
    "tex": "v_{\\text{path}} = f_{\\text{ocean}}\\,v_{\\text{ocean}} + (1-f_{\\text{ocean}})\\,v_{\\text{cont}}",
    "fallback": "v(path) = f_ocean·v_ocean + (1 − f_ocean)·v_continent"
   },
   {
    "tex": null,
    "fallback": "<span class=\"tex\" data-tex=\"v_{\\text{ocean}} \\approx 3.6\\ \\text{km}/\\text{s}\">v_ocean ≈ 3.6 km/s</span>, <span class=\"tex\" data-tex=\"v_{\\text{cont}} \\approx 2.97\\ \\text{km}/\\text{s}\">v_continent ≈ 2.97 km/s</span> — both from Hearn (2024), the same ISC data this tab already uses"
   },
   {
    "tex": null,
    "fallback": "f_ocean = share of the real great-circle path over open ocean, sampled every ~0.5° against real coastline polygons<sup class=\"ref\"><a href=\"#s-seis-n17\">[17]</a></sup> — not the simplified map coastline drawn elsewhere on this site"
   }
  ],
  "gloss": "Two numbers, not 479: v_ocean and v_continent are fixed once, from someone else's independent tomography of the same ISC dataset family, before any radius here is computed. What varies path by path is f_ocean, a purely geometric fact about where the great circle actually goes — it is not a free parameter tuned to this result any more than the coastlines themselves are.",
  "k": "seis-m5"
 },
 {
  "t": "raw",
  "tag": "p",
  "class": "reads",
  "id": "seisRadiusRead2",
  "html": "<p class=\"reads\" id=\"seisRadiusRead2\"></p>"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"seisRadiusFig2\"></div> <div class=\"fcap\"><b>The same 479 arrivals, same nine earthquakes, only the velocity now varies path by path.</b> Same convention: box between the quartiles, bar at the median, whiskers to 1.5 interquartile ranges, 6,371 km as a vertical line. Compare directly against the box plot above — every box should sit measurably closer to the line.</div> </div>",
  "k": "seis-m6"
 },
 {
  "t": "table",
  "id": "",
  "tbody": "seisRadiusRows2",
  "caption": "The corrected boxes as numbers — compare each row against the same row in the uncorrected table above",
  "head": [
   "Earthquake",
   "n",
   "Median R",
   "Quartiles",
   "Off 6,371 km"
  ],
  "k": "seis-m7"
 },
 {
  "t": "lead",
  "html": "The same reconstruction on every Rayleigh arrival of the large sample of the relocation section further down: 261 earthquakes, 13,586 arrivals. The epicentre and origin time come from the ISC as above, with the same 3.5 km/s and the same path correction. They are shown in a box of their own, apart from the nine above.",
  "opener": false,
  "k": "sq-b1"
 },
 {
  "t": "raw",
  "tag": "p",
  "class": "reads",
  "id": "seisRadiusBulkRead",
  "html": "<p class=\"reads\" id=\"seisRadiusBulkRead\"></p>"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"seisRadiusBulkFig\"></div> <div class=\"fcap\"><b>13,586 arrivals of 261 earthquakes, 2000–2023.</b> Same convention as above: box between the quartiles, bar at the median, whiskers to 1.5 interquartile ranges. The 11 arrivals beyond the whiskers are not drawn. Rows 1 and 2: every arrival, with 3.5 km/s, then with the ocean/continent speed. Rows 3 and 4: one median per earthquake with five arrivals or more, the same two ways.</div> </div>",
  "k": "seis-b1"
 },
 {
  "t": "notes",
  "html": "Every arrival together gives a median of 6,989 km (+9.7 %), and 6,654 km (+4.4 %) once the path is corrected; the nine above gave 6,910 km (+8.5 %) and 6,675 km (+4.8 %). The medians of the 258 earthquakes give 6,939 km (+8.9 %) and 6,637 km (+4.2 %). The box is somewhat narrower than the nine's, quartiles 6,230–7,561 km against 5,883–7,616 km (6,200–6,985 against 5,830–7,041 corrected), but not 5 times narrower, as it would be if its width came from too few readings: most of it is the wave's own dispersion, which more data does not remove. The excess over 6,371 km is about the same with nine earthquakes or 261: it belongs to the method, one round speed (or two, once corrected) for a wave whose speed varies, not to the choice of earthquakes.",
  "k": "sq-bp"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>Narrower, not perfect — as a real correction should be.</b> An ocean/continent split is a coarse model: real crust varies with age, thickness and temperature, so dispersion is not fully removed. What the tightening shows is that the residual pointed at a real, independently measurable cause, not at a mistake: had it been a bug, a geometric fact unrelated to the data — how much of a path crosses ocean — would have had no reason to correlate with the error. It does.",
  "k": "sq-call4"
 },
 {
  "t": "h2",
  "html": "The opening argument again, one real earthquake at a time",
  "k": "sq-h9"
 },
 {
  "t": "lead",
  "html": "The first figure on this tab makes one claim: arrival time and distance sit on one straight line through the origin, at the true wave speed. Here it is on real data, one earthquake at a time (selector below): each real arrival is plotted <em>twice</em> at its real recorded time — at its great-circle distance, and at the flat map's distance for the same two coordinates, joined by a thin line. A plain least-squares line is fitted through the great-circle cloud alone, with nothing assumed about the speed, and compared with the constant-speed line, distance ÷ 3.5&nbsp;km/s. Nothing is tuned to land near that line; the fit only ever sees the cloud.",
  "opener": false,
  "k": "sq-p11"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "preset-row",
  "id": "",
  "html": "<div class=\"preset-row\" style=\"margin:12px 0 6px\"> <span class=\"preset-lbl\">Earthquake</span> <select id=\"seisRegEvSel\"></select> </div>"
 },
 {
  "t": "raw",
  "tag": "p",
  "class": "reads",
  "id": "seisRegRead",
  "html": "<p class=\"reads\" id=\"seisRegRead\"></p>"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"seisRegFig\"></div> <ul class=\"figkey\"> <li><span class=\"sw\" data-sw=\"seisdotink\"></span><span>one real arrival, at its true great-circle distance</span></li> <li><span class=\"sw\" data-sw=\"seisdotflat\"></span><span>the SAME real arrival, at what the flat map's own distance would be for the same two coordinates</span></li> <li><span class=\"sw\" data-sw=\"seisconn\"></span><span>the same real recorded time, two different distance claims</span></li> <li><span class=\"sw\" data-sw=\"seisfitink\"></span><span>the least-squares line through the great-circle cloud alone — no wave speed assumed</span></li> <li><span class=\"sw\" data-sw=\"seisreglineglobe\"></span><span>the speed line, distance ÷ 3.5 km/s — a fact about the speed alone, not about which model is right</span></li> </ul> <div class=\"fcap\"><b>The gap between each pair of dots is the whole argument.</b> The dark, great-circle dots should sit close to the speed line if 3.5 km/s is roughly right; the orange, flat-map dots sit wherever that earthquake's own map distortion puts them, with no line of their own to explain them away. The fitted black line ignores all of that — it only ever sees the dark dots' own cloud.</div> </div>",
  "k": "seis-m8"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>Switch to Tonga 2022 and the fit gets noisy — as it should.</b> With 5 real points a least-squares line has little to average, so its speed can land well off the line; with 146 (Alaska 2021) it sits almost on it. Pooled over all nine earthquakes (479 rows) it lands close to the speed line — the box plot above gives the number — and no single small earthquake is asked to carry that claim.",
  "k": "sq-call5"
 },
 {
  "t": "h2",
  "html": "The projection's fingerprint, confirmed on real clocks",
  "k": "sq-h10"
 },
 {
  "t": "lead",
  "html": "The R1/R2/R3 section above noted that northern stations agree almost exactly with the globe while southern ones drift by the better part of an hour, and called that gradient the signature of a projection. Here it is measured on the same 479 real arrivals. For each, two residuals are computed against the SAME recorded time, never against each other: the globe's (great-circle distance ÷ 3.5&nbsp;km/s, minus the real time) and the flat map's (its distance ÷ 3.5&nbsp;km/s, minus the real time). Both are averaged in 15°-wide bands of station colatitude — degrees from the true North Pole, the flat map's centre — so the horizontal axis is literally the map's radius.",
  "opener": false,
  "k": "sq-p12"
 },
 {
  "t": "raw",
  "tag": "p",
  "class": "reads",
  "id": "seisLatenessRead",
  "html": "<p class=\"reads\" id=\"seisLatenessRead\"></p>"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"seisLatenessFig\"></div> <ul class=\"figkey\"> <li><span class=\"sw\" data-sw=\"seislatglobe\"></span><span>average globe residual — real time minus the globe's own prediction, by station colatitude</span></li> <li><span class=\"sw\" data-sw=\"seislatflat\"></span><span>average flat-map residual — same real time, the flat map's own distance instead</span></li> </ul> <div class=\"fcap\"><b>0° is the north pole, 180° is the south pole — literally where each station sits on the flat map, not just its latitude.</b> The dashed line at zero is \"predicted the real time exactly.\" The blue line hugging it everywhere is the globe surviving contact with real seismograph clocks at every distance from the pole. The orange line peeling away with colatitude, reaching most of an hour late near the antipode, is the specific, falsifiable shape a flat map's own distortion has to produce — and does.</div> </div>",
  "k": "seis-m9"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>The globe's line is not exactly zero either — left visible on purpose.</b> Real Rayleigh dispersion keeps the blue line a few minutes off zero in places, with no trend across colatitude: the honest cost of one round velocity for every path. The orange line's residual is another kind of thing: it grows by a predictable amount with colatitude, in all nine earthquakes, because it is not noise — it is the map's own distortion formula.",
  "k": "sq-call6"
 },
 {
  "t": "h2",
  "html": "Doing it ourselves: no catalogue location, no radius",
  "k": "rl-h1"
 },
 {
  "t": "lead",
  "html": "Everything above takes each earthquake's epicentre and origin time from the ISC.<sup class=\"ref\"><a href=\"#s-seis-n1\">[1]</a></sup> The ISC finds them with a model of seismic speeds inside a spherical Earth of known radius. None of that is used here. Only what a station records is kept: the time a wave arrived, and the station's latitude and longitude, taken as angles. The earthquake's centre is then found as the centre of a circle that grows at a speed that is not known in advance.",
  "opener": false,
  "k": "rl-p1"
 },
 {
  "t": "lead",
  "html": "The P wave, the first to arrive, is read to about a second. Its travel time does not grow in proportion to distance, because it dives through the Earth. A travel-time table would fix that, but a table is a model of the Earth. So each geometry gets the same free curve instead: time as a polynomial of degree three in the distance. On the globe the distance is the great-circle angle from the centre. On the flat map it is the distance on the disc, in the map's own degrees. Each model has six free numbers: the centre (two) and the curve (four). Only stations between 25° and 95° from the fitted centre are used, and readings more than three standard deviations from the others are set aside, one at a time.",
  "opener": false,
  "k": "rl-p2"
 },
 {
  "t": "formula",
  "fig": "seisFxReloc",
  "flat": false,
  "style": "",
  "lines": [
   {
    "tex": "t_i = c_0 + c_1 u_i + c_2 u_i^2 + c_3 u_i^3, \\qquad u_i = \\dfrac{\\delta_i}{100}",
    "fallback": "tᵢ = c₀ + c₁uᵢ + c₂uᵢ² + c₃uᵢ³,   uᵢ = δᵢ / 100"
   },
   {
    "tex": null,
    "fallback": "<span style=\"color:var(--ink-soft);font-weight:400\">δᵢ: on the globe, the great-circle angle from the centre to station i; on the flat map, the straight distance on the disc (degrees). Centre and c₀…c₃ are fitted to the arrival times, nothing else.</span>"
   }
  ],
  "gloss": "If the Earth is a sphere, every arrival should depend on one number only, its station's angle from the centre, and fall on one smooth curve. If it is the flat-earth map, the same should be true of the straight distance on the disc. Both models get the same freedom. The question is which distance the real clocks agree with. The constant c₀ is not the origin time: the curve, fitted between 25° and 95°, does not extrapolate to zero distance, and its c₀ comes out about a minute late.",
  "k": "rl-f1"
 },
 {
  "t": "lead",
  "html": "Nine earthquakes are few. So the same method is run on every earthquake that meets a rule fixed before looking: in the reviewed ISC Bulletin,<sup class=\"ref\"><a href=\"#s-seis-n1\">[1]</a></sup> from 2000 to 2023, moment magnitude 7.0 or more (Global CMT) and no deeper than 70 km. That gives 262 earthquakes; the 261 with at least 50 P stations between 25° and 95° from our own centre are kept, 199,421 P arrivals in all. None of them is offered in the menus below: they are there for the totals. And with this many earthquakes the test can be made stricter, because a wave obeys one law, not one per earthquake.",
  "opener": false,
  "k": "rl-b1"
 },
 {
  "t": "formula",
  "fig": "seisFxRelocC",
  "flat": false,
  "style": "",
  "lines": [
   {
    "tex": "t_{q,i} = c_{0,q} + c_1 u_{q,i} + c_2 u_{q,i}^2 + c_3 u_{q,i}^3",
    "fallback": "t_q,i = c₀,q + c₁u_q,i + c₂u_q,i² + c₃u_q,i³"
   },
   {
    "tex": null,
    "fallback": "<span style=\"color:var(--ink-soft);font-weight:400\">q: the earthquake, i: its station. Each earthquake keeps its own centre and its own c₀,q, its origin time, which is not known. c₁, c₂, c₃ are one set for all 261.</span>"
   }
  ],
  "gloss": "This is the stricter test. Above, each earthquake had its own cubic, and the flat model used that freedom to bend its curve the wrong way. Here each model gets one curve for every earthquake. It is fitted by turns: the centres and origin times with the curve held, then the curve with the centres held, until nothing moves. The depth limit is what makes one curve fair. Above 70 km, an earthquake's depth shifts its arrival times by about a constant, and c₀,q absorbs it.",
  "k": "rl-bf"
 },
 {
  "t": "raw",
  "tag": "p",
  "class": "reads",
  "id": "rlBulkRead",
  "html": "<p class=\"reads\" id=\"rlBulkRead\"></p>"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"bulkHist\" class=\"bulk-hist\" role=\"img\" aria-label=\"The share of every P station of every earthquake by how far its real time is from the common curve: a narrow peak for the globe, a wide spread for the flat maps\"></canvas><div class=\"fcap\"><b>Every station of every earthquake, one curve for all.</b> The share of the P stations by how far their real arrival time is from the curve's time, in one-second bins. Teal: the globe, distances along the great circle. Orange: the best single flat map found, distances on the disc; dashed: the North Pole map. The globe's stations pile up within a couple of seconds of zero. The flat maps' spread over tens of seconds. Readings set aside, more than three standard deviations from the others, are not counted.</div></div>",
  "k": "rl-bfig1"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"bulkDens\" class=\"bulk-dens\" role=\"img\" aria-label=\"The residuals of every station against its distance from each model's centre, as a density: the globe on top, the best flat map below\"></canvas><div class=\"fcap\"><b>The same residuals against distance.</b> Each cell is 2° by one second, darker where more stations fall. Top: the globe. Bottom: the best flat map. On the globe the band is narrow and level at every distance. On the flat map it is wide, and it bends: the map stretches some paths and squeezes others, and one curve cannot follow both.</div></div>",
  "k": "rl-bfig2"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"bulkQuakes\" class=\"bulk-quakes\" role=\"img\" aria-label=\"One dot per earthquake: the globe's scatter against the best flat map's, on log scales, with the line where they would be equal\"></canvas><div class=\"fcap\"><b>Earthquake by earthquake.</b> One dot per earthquake. Across: the globe's scatter for it. Up: the best flat map's. Both use the common curve. A dot on the dashed line would be an earthquake the flat map describes as well as the globe. Black: the eight named earthquakes of this tab; the ninth, Hunga Tonga, was an eruption well below magnitude 7.</div></div>",
  "k": "rl-bfig3"
 },
 {
  "t": "table",
  "id": "rlBulkTab",
  "tbody": "rlBulkRows",
  "caption": "All 261 earthquakes together: scatter of the P times",
  "head": [
   "Model",
   "A curve per earthquake",
   "One curve for all",
   "Stations kept",
   "Set aside",
   "Globe better (a curve each)",
   "Globe better (one curve)"
  ],
  "k": "rl-btab"
 },
 {
  "t": "notes",
  "html": "The globe's scatter is 1.25 s with a curve per earthquake and 1.29 s with one curve for all 261. One law serves every earthquake as well as 261 separate curves do. The flat maps cannot say the same. On the North Pole map the scatter goes from 23.7 s to 24.5 s. On the best single map found, centred near 53° N, 178° E, it goes from 15.9 s to 19.0 s, 15 times the globe's. That map is the best of 235 centres scanned with a curve per earthquake, the criterion that favours the plane most. The common curve was then fitted on its five best centres and the best was kept. The globe does better for every one of the 261. The closest are the earthquakes next to the best map's centre, where an azimuthal map distorts least: Alaska 2021, 1.53 s against the globe's 1.48 s. The typical earthquake has a flat scatter 10 times the globe's.",
  "k": "rl-bp"
 },
 {
  "t": "lead",
  "html": "Below, the nine named earthquakes one at a time, each with its own curve, as the method was first built.",
  "opener": false,
  "k": "rl-b2"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><div class=\"reloc-row\"><span class=\"preset-lbl\">Earthquake</span> <select id=\"rlQuakeR\" aria-label=\"Earthquake\"></select></div><canvas id=\"relocResid\" class=\"reloc-resid\" role=\"img\" aria-label=\"For one earthquake, the difference between each station's real P arrival time and the time the fitted curve gives, against its distance from the fitted centre: in the top band for the globe, in the bottom band for the flat-earth map\"></canvas><div class=\"fcap\"><b>What is left over, station by station.</b> Each dot is one station's real P arrival time minus the time the fitted curve gives it. Top band: the globe, with distances along the great circle. Bottom band: the flat map centred on the North Pole, with distances on the disc. Each model has its own centre and its own curve, fitted in its favour. Grey: set aside, more than three standard deviations from the others. On the globe the dots lie in a band a few seconds wide. On the flat map they spread into tens of seconds, and they do so in patterns, not at random: the map stretches some directions and squeezes others.</div></div>",
  "k": "rl-fig1"
 },
 {
  "t": "table",
  "id": "rlTab",
  "tbody": "rlRows",
  "caption": "Nine earthquakes relocated from their arrival times alone",
  "head": [
   "Earthquake",
   "P stations kept",
   "Globe: scatter",
   "Relocated centre vs the ISC's",
   "Flat, North Pole map",
   "Flat, its own map",
   "Flat, best single map",
   "Label-free: globe / flat",
   "Surface waves: one lap"
  ],
  "k": "rl-tab"
 },
 {
  "t": "notes",
  "html": "The relocated centres land between 0.07° and 0.9° from the ISC's, although the ISC's was never used. The globe's scatter is 0.6 to 5.4 seconds, 1.8 seconds over all nine earthquakes. On the flat-earth map the same earthquakes scatter by 1.5 to 47 seconds, 12 seconds over all nine. The closest cases are the Kuril and Alaska earthquakes, close to the North Pole, where that map distorts least. And the plane only reaches its numbers by bending its curve the wrong way. For seven of the nine earthquakes on the North Pole map, and four of the nine on the best single map below, its fitted time falls as the distance grows: the wave would reach farther stations sooner. The globe's curve rises with distance for all nine. The plane is allowed this here, and it still loses. The last column is the surface wave's lap of the Earth in hours, from its angular speed, with no kilometre anywhere: 2.2 to 3.5 hours. Surface-wave readings are only good to a few minutes, so this column is shown, not used.",
  "k": "rl-p3"
 },
 {
  "t": "h2",
  "html": "One flat map for nine earthquakes",
  "k": "rl-h2"
 },
 {
  "t": "lead",
  "html": "The flat model's best case: let it choose its map. An azimuthal equidistant map<sup class=\"ref\"><a href=\"#s-seis-n18\">[18]</a></sup> keeps every distance from its centre exact. On a map centred on an earthquake's epicentre, that earthquake's wave fronts are perfect circles, and the plane describes it exactly as well as the globe does. The table shows it: the column \"its own map\" matches the globe's. But a flat Earth is one map, not nine. On the map of one earthquake, the fronts of the others are no longer circles. So the plane is offered every centre, on a grid over the whole Earth. For each map, all nine earthquakes are fitted again, each with its own centre and its own curve.",
  "opener": false,
  "k": "rl-p4"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><div class=\"reloc-row\"><span class=\"preset-lbl\">Map</span> <select id=\"rlMapC\" aria-label=\"Map centre\"></select> <span class=\"preset-lbl\">Earthquake</span> <select id=\"rlMapQ\" aria-label=\"Earthquake\"></select></div><canvas id=\"relocMap\" class=\"reloc-map\" role=\"img\" aria-label=\"An azimuthal equidistant map with a chosen centre, and one earthquake's P wave spreading over it: the true front from the globe, which is a circle only on the map centred on that earthquake, and the flat model's best circle on this map, with the stations lighting up at their real arrival times\"></canvas><div class=\"reads\" id=\"rlMapRead\"></div><div class=\"fcap\"><b>Choose the flat model's map, then choose the earthquake.</b> Solid teal: the true front of the P wave. It is drawn from the globe fit, at a constant great-circle angle from the centre, and projected onto this map. Dashed orange: the flat model's best front on this map, around its own fitted centre. Sometimes there are two or three circles at once: on most maps the plane's best curve is not increasing, so the same instant falls at several distances. Stations light up at their real arrival time. On the map centred on the earthquake shown, the two fronts coincide. Choose another earthquake on the same map and they part: the true front is no longer a circle, and the stations stop lighting up on the orange line. The continents are Natural Earth's{ref(26)}. Click to pause.</div></div>",
  "k": "rl-fig2"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"relocHeat\" class=\"reloc-heat\" role=\"img\" aria-label=\"A world map in plate carrée where each cell is coloured by the flat model's scatter for all nine earthquakes when the flat map is centred there; the best cell, in north-east Asia, is circled, and the nine epicentres are marked\"></canvas><div class=\"fcap\"><b>Where the flat map could be centred, and what each choice costs.</b> Each cell is one possible centre for the flat map, on a 20° grid with finer points around the best one. Its colour is the scatter of all nine earthquakes refitted on that map, from the globe's value (palest) to the worst (darkest). The best single map is centred near 58° N 141° E, by the Sea of Okhotsk, north of the Kuril and Japanese earthquakes. There it reaches 7.3 seconds, four times the globe's 1.8, and it gets there by sacrificing the Illapel and Tonga earthquakes, at about 20 seconds each. Maps centred on one of the nine epicentres are worse still for the other eight: 12 to 49 seconds.</div></div>",
  "k": "rl-fig3"
 },
 {
  "t": "callout",
  "flat": true,
  "html": "<b>The flat model, given every map, still fails, and the verdict was stated before the fit.</b> What would have vindicated the plane: one flat map fitting all nine earthquakes as well as the globe, with the same number of free parameters. The best map found misses by a factor of four. The North Pole map that flat-earth sources publish misses by a factor of almost seven. The globe needs no choice at all: one sphere, nine centres, nine curves, 1.8 seconds.",
  "k": "rl-c1"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>What this cannot do, and where a model still enters.</b> (1) No radius comes out. A speed in kilometres per second would need a distance in kilometres between stations, and that distance is taken from their coordinates with the Earth's radius. So the radius of this tab stays the check above. (2) The readings used are those the ISC names \"P\". The ISC gives that name by comparing each arrival with a travel-time table built on a spherical Earth, so the choice of readings, though not their times, leans on a model. Hence the label on this section. As a check, the last-but-one column of the table drops the names and keeps the first arrival reported at each station. That data is noisier, and for the Nias and Tonga earthquakes stray readings pull the centre far off. But the globe still beats the flat map for all nine. (3) The cubic curve is a convenience. It is the same for both models, which is what makes the comparison fair, but it is not physics.",
  "k": "rl-c2"
 },
 {
  "t": "h2",
  "html": "The ring of silence, station by station",
  "k": "sh-h1"
 },
 {
  "t": "lead",
  "html": "Experiment 1e-b above asks one bit per station: did a direct P wave arrive, or not? The bulletin already answers it for thousands of stations. For the same nine earthquakes, every station is put in one of three groups by the phases the ISC reports for it<sup class=\"ref\"><a href=\"#s-seis-n13\">[13]</a></sup>: a direct P wave, the wave that went straight through the mantle; only P<sub>dif</sub>, the weak wave bent along the core; or only PKP, the wave that came back through the core. That makes 12,822 stations: 9,573 with a direct P, 1,364 with P<sub>dif</sub> only, 1,885 with PKP only.",
  "opener": false,
  "k": "sh-p1"
 },
 {
  "t": "lead",
  "html": "On the globe the rule has no free number. Direct P is seen out to 103° from the epicentre and not beyond, because the core is in the way<sup class=\"ref\"><a href=\"#s-seis-n1\">[1]</a></sup><sup class=\"ref\"><a href=\"#s-seis-n12\">[12]</a></sup>. Here Δ is the great-circle angle between the published coordinates. On a flat map the steel-man is generous. The map is an azimuthal equidistant map<sup class=\"ref\"><a href=\"#s-seis-n18\">[18]</a></sup> with any centre, the shadow is a disc around the epicentre, and its radius ρ is fitted to the stations, while the globe's 103° is not. A map centred on an earthquake gives that earthquake exactly the globe's distances, so it fits that earthquake perfectly. A flat Earth is one map, though, and its waves obey one law. So the real test is one map and one ring for all nine.",
  "opener": false,
  "k": "sh-p2"
 },
 {
  "t": "lead",
  "html": "First, the same rule on every earthquake of the large sample of the relocation section: 261 earthquakes with at least 50 classed stations, 368,987 stations in all. Here it is clearest on one axis: the share of stations that reported a direct P, by distance from the epicentre. On the globe that share should drop to zero at one angle, the same for every earthquake. On a flat map it should drop at one distance on the disc.",
  "opener": false,
  "k": "sh-b1"
 },
 {
  "t": "raw",
  "tag": "p",
  "class": "reads",
  "id": "shBulkRead",
  "html": "<p class=\"reads\" id=\"shBulkRead\"></p>"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"bulkShadow\" class=\"bulk-shadow\" role=\"img\" aria-label=\"The share of stations that reported a direct P by distance from the epicentre, for every station of every earthquake: the globe's angle on top, the distance on the best flat map below\"></canvas><div class=\"fcap\"><b>368,987 stations of 261 earthquakes on one axis.</b> Each bar is 2° wide. Its height is the share of the stations at that distance that reported a direct P, paler where there are fewer stations. Top: the globe's angle from the published epicentre. The share stays near 100 % out to about 97° and falls to almost nothing past 103°, for all the earthquakes at once. Bottom: the same stations on the best flat map for one ring, centred near 76° N, 166° E, with distances on the disc. The step is smeared: on that map the same edge falls at a different distance for each earthquake, and for each direction from it.</div></div>",
  "k": "sh-bfig1"
 },
 {
  "t": "notes",
  "html": "Counted as below, as stations on the wrong side of the ring. The globe's 103° gets 14,280 of 368,987 wrong, and one ring for all at 98.8° leaves 3,764. Between 97° and 103° the ISC names most arrivals P<sub>dif</sub>, which is why the globe's best ring sits a few degrees inside the textbook 103°. The North Pole map with its best ring (110°) leaves 25,866. The best of all map centres, near 76° N, 166° E, leaves 24,575, 7 times the globe's best ring, although its ring is fitted too. With one ring per earthquake on one shared map, 261 free numbers against the globe's one, the best map (near 62° N, 160° E) leaves 14,833. That is still more than the globe's textbook 103°, which fits nothing.",
  "k": "sh-bp"
 },
 {
  "t": "lead",
  "html": "Below, the nine named earthquakes, one at a time and on any map.",
  "opener": false,
  "k": "sh-b2"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><div class=\"reloc-row\"><span class=\"preset-lbl\">Map</span> <select id=\"shMapC\" aria-label=\"Map centre\"></select> <span class=\"preset-lbl\">Earthquake</span> <select id=\"shMapQ\" aria-label=\"Earthquake\"></select></div><div class=\"sh-pair\"><canvas id=\"shadowGlobe\" class=\"shadow-globe\" role=\"img\" aria-label=\"The globe seen from far away, turned towards the earthquake's shadow: every point coloured by its angle from the epicentre, green where direct P arrives (under 103 degrees), orange in the shadow (103 to 143 degrees), violet where PKP comes back through the core (beyond 143 degrees), with the earthquake's real stations on top\"></canvas><canvas id=\"shadowMap\" class=\"shadow-map\" role=\"img\" aria-label=\"An azimuthal equidistant map with a chosen centre and one earthquake's stations, coloured by the P phases the bulletin gives them; the globe's shadow ring, 103 to 143 degrees from the epicentre, projected on the map; the flat model's best ring on this map, a circle around the epicentre; stations on the wrong side of the flat ring are crossed\"></canvas></div><div class=\"reads\" id=\"shMapRead\"></div><ul class=\"figkey\"> <li><span class=\"sw\" data-sw=\"shdirect\"></span><span>a station that reported a direct <b>P</b></span></li> <li><span class=\"sw\" data-sw=\"shdif\"></span><span>only <b>P<sub>dif</sub></b>, the weak wave bent along the core</span></li> <li><span class=\"sw\" data-sw=\"shcore\"></span><span>only <b>PKP</b>, back through the core</span></li> <li><span class=\"sw\" data-sw=\"shzoneP\"></span><span>on the globe: direct P arrives (Δ under 103°)</span></li> <li><span class=\"sw\" data-sw=\"shzoneS\"></span><span>the shadow: no direct P (103° to 143°)</span></li> <li><span class=\"sw\" data-sw=\"shzoneK\"></span><span>PKP comes back through the core (beyond 143°)</span></li> <li><span class=\"sw\" data-sw=\"shglobe\"></span><span>the globe's shadow edges, 103° and 143° from the epicentre, computed on the sphere</span></li> <li><span class=\"sw\" data-sw=\"shflat\"></span><span>the flat model's best ring for this earthquake on this map</span></li> <li><span class=\"sw\" data-sw=\"shcommon\"></span><span>the one ring that suits all nine best on this map</span></li> <li><span class=\"sw\" data-sw=\"shbad\"></span><span>a station on the wrong side of the flat ring</span></li> <li><span class=\"sw\" data-sw=\"shepi\"></span><span>the epicentre</span></li> </ul><div class=\"fcap\"><b>Left, the globe; right, the map you choose.</b> The globe is seen from far away and turned towards this earthquake's shadow. Each point is coloured by its angle from the epicentre, and the stations sit on the band their reports put them in. On the right, the same stations on an azimuthal equidistant map. The globe's shadow is projected onto it, so it is a circle only on the map centred on that earthquake. The flat model draws its own best ring around the epicentre. The globe's errors are counted in the line above the key. Continents: Natural Earth<sup class=\"ref\"><a href=\"#s-seis-n19\">[19]</a></sup>.</div></div>",
  "k": "sh-fig1"
 },
 {
  "t": "table",
  "id": "shTab",
  "tbody": "shRows",
  "caption": "Stations on the wrong side of the ring: the globe, then flat maps",
  "head": [
   "Earthquake",
   "Stations",
   "Direct P",
   "Globe, 103° (no fit)",
   "Globe, best ring",
   "Flat, its own map",
   "Flat, North Pole map",
   "Flat, best single map"
  ],
  "k": "sh-tab"
 },
 {
  "t": "notes",
  "html": "Each column counts the stations a ring puts on the wrong side: a direct P outside the ring, or none inside. The globe's textbook 103° gets 269 of 12,822 wrong. Most of them sit between 97° and 103°, where the ISC already names the arrival P<sub>dif</sub>; one ring at 97.1° for all nine leaves 53. Each earthquake on its own map does exactly as well as the globe, as it must. In the last row each flat map gets one ring for all nine. The North Pole map leaves 631 wrong, at ρ = 110.4°, and the best of all map centres (72° N, 100.5° E) leaves 606. Even allowing each earthquake its own ring on one shared map, the best map leaves 449. On the map of one earthquake, a single ring fails the others. On the Maule or Illapel map no ring does better than none: 3,249 wrong, every station without a direct P. The Kuril map, the best of the nine, still leaves 735.",
  "k": "sh-p3"
 },
 {
  "t": "callout",
  "flat": true,
  "html": "<b>The flat model, stated before the count.</b> What would vindicate the plane: one flat map on which one ring around each epicentre separates the stations that got a direct P from those that did not, as well as the globe's single angle does. The globe, with one number for all nine earthquakes (97.1°), misplaces 53 stations. The best flat map, with three numbers (its centre and its ring), misplaces 606, eleven times as many. With nine rings it still misplaces 449. The share of stations classed right looks close, 99.6 % against 95.3 %. That is only because most stations are far from any edge, and every model gets those right.",
  "k": "sh-c1"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>Where the globe enters, and what this does not show.</b> (1) The phase names are the ISC's. Its analysts and its locator name each reading by comparing it with the ak135 travel-time tables<sup class=\"ref\"><a href=\"#s-seis-n5\">[5]</a></sup>, which are built for a spherical Earth. A reading that would be called P on the globe could, in principle, be called something else on another model. The station coordinates come from maps. This section is therefore a check, not a measurement. (2) The groups are about what was reported, not what was recorded. A station that saw nothing usually reports nothing and is absent, so the shadow shows as a lack of P names, not as silent stations. (3) Inside the shadow there are faint arrivals, P<sub>dif</sub> and the inner-core PKiKP. Lehmann found the inner core with them in 1936. Here they count as \"no direct P\". (4) Hunga Tonga 2022 has only 157 stations, too few to weigh much.",
  "k": "sh-c2"
 },
 {
  "t": "notes-block",
  "paras": [
   "<p><span class=\"k\">Caveats this page owes you.</span> Three. The Earth is not a perfect sphere and seismologists know it: the ellipticity correction to travel times reaches a couple of seconds, and reference models carry it explicitly. Surface-wave group velocity is not one number but depends on period and on whether the path crosses ocean or continent, at the level of a few percent — which is why the experiment above insists on filtering to one narrow band. And the 3.8 km/s used throughout this tab is a round working value, not a measured constant for any particular path. None of the three comes near the size of what is being argued about here: a few percent against a disagreement that reaches beyond 100%.</p> <p><span class=\"k\">The through-line.</span> The Foucault tab measures the angle between your floor and the axis of the world without looking at anything. This one measures the distance between your floor and somebody else's, without looking at anything either — no sightline, no atmosphere, no refraction, nothing for the argument in the refraction tab to attach itself to. And it lands on the same 6,371 km. That is the shape of the whole page: not one decisive measurement, but a dozen unrelated instruments that would all have to be wrong in a mutually consistent way for the answer to be anything else.</p>"
  ],
  "k": "x:sq-n1"
 },
 {
  "t": "xrefs",
  "keys": [
   "grav",
   "dist",
   "surv",
   "atmo"
  ],
  "wide": false
 },
 {
  "t": "h2",
  "html": "Does a shape come out of the times alone?",
  "k": "ms-h2"
 },
 {
  "t": "lead",
  "html": "The mesh of flight times in the Aviation tab, with another pure measure. Take the P arrivals of the <span class=\"cv\" data-mesh=\"quakes\">…</span> earthquakes above, at the <span class=\"cv\" data-mesh=\"stations\">…</span> stations that read at least <span class=\"cv\" data-mesh=\"minQ\">…</span> of them: <span class=\"cv\" data-mesh=\"edges\">…</span> readings, each one a time and nothing else. No epicentre, no station coordinate, no radius, no Earth model. Every earthquake and every station is a free point, on a plane (two numbers each) or in space (three), and the points move until the times fit one law, <i>t</i> = <i>c</i><sub>0</sub> + <i>g</i>(<i>u</i>): <i>u</i> the distance between the two points, <i>c</i><sub>0</sub> a free origin time for each earthquake, <i>g</i> one free curve for all of them, because deep paths are faster. The unit of length is the one the law starts with: a kilometre never enters.",
  "opener": false,
  "k": "ms-p1"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"seisMesh\" class=\"seis-reel\"></canvas><p class=\"reads\" id=\"seisMeshReads\"></p><div class=\"fcap\"><b>The shape comes out of the times, step by step.</b> One animation in seven steps. 1\u20132: each time is read as a straight-line distance and everything is forced onto a plane, which gets every freedom and stalls. 3: the same start with one number more per station: space settles. 4: only then are the lines drawn as great-circle arcs, on the sphere the cloud lies on. 5: the speed of propagation, the one input that touched the radius, is changed by \u00b125 %: the size follows, the shape does not. 6: other speed laws: still a sphere. 7: the check: the cloud is turned (rotation only) onto the real map, which fades in, and a red dashed arc joins each station to its published position; a zoom, at the same scale in every direction, makes those arcs visible. Each dot is a station, coloured by its real latitude, which the fit never reads; the \u00d7 are the eight earthquakes that read the most stations. Until step 4 the lines are chords, the distance the fit uses. Click to pause.</div></div>",
  "k": "ms-fig"
 },
 {
  "t": "notes",
  "html": "The plane does not settle: <span class=\"cv\" data-mesh=\"planeStress\">…</span> rms of the time residuals, where space settles at <span class=\"cv\" data-mesh=\"spaceStress\">…</span>, <span class=\"cv\" data-mesh=\"ratio\">…</span> times less. The cloud in space lies on a sphere: its stations stay within <span class=\"cv\" data-mesh=\"rel\">…</span> of the best sphere's radius. Laid on the real map afterwards (rotation and scale only), the <span class=\"cv\" data-mesh=\"stations\">…</span> stations sit <span class=\"cv\" data-mesh=\"vs\">…</span> from their published positions, which the fit never read. The shape was in the times. A random start does not find it (in space it stalls at 40 to 50 s); the start used, <span class=\"cv\" data-mesh=\"startStress\">…</span> off, is the same in the plane and in space: shortest paths through the mesh, then classical MDS<sup class=\"ref\"><a href=\"#s-seis-n25\">[25]</a><a href=\"#s-seis-n26\">[26]</a></sup>, with no coordinate. The plane is the first two coordinates of that start, space adds the third: that is why the animation goes back to the start before freeing the third dimension. Lifting the settled plane instead stalls between 3 and 6.5 s: the plane has folded the cloud over, and space does not unfold it. The earthquakes' own distance from the centre is not fixed by the times (it moves together with their origin time): they are drawn where the fit leaves them, then slid onto the sphere when the arcs appear. The best rotation onto the map uses the published coordinates: it is part of the check, and turning a cloud changes none of its distances.",
  "k": "ms-p2"
 },
 {
  "t": "notes",
  "html": "Every reading, for the record: with all the <span class=\"cv\" data-mesh=\"allStations\">…</span> stations that read at least <span class=\"cv\" data-mesh=\"allMinQ\">…</span> of the quakes (<span class=\"cv\" data-mesh=\"allReadings\">…</span> readings), each placed by its own times, refitted together and the readings beyond three standard deviations set aside on each surface, space settles at <span class=\"cv\" data-mesh=\"allSpace\">…</span> and the plane at <span class=\"cv\" data-mesh=\"allPlane\">…</span>; the stations stay within <span class=\"cv\" data-mesh=\"allRel\">…</span> of one radius and sit a median <span class=\"cv\" data-mesh=\"allMed\">…</span> from their published positions (<span class=\"cv\" data-mesh=\"allP90\">…</span> for nine in ten). The shape does not change; the drawing keeps the best-read stations.",
  "k": "ms-p2b"
 },
 {
  "t": "notes",
  "html": "The one number that ties the mesh to kilometres is <i>v</i><sub>0</sub>, the speed the law starts with. Change it for every distance at once and the cloud keeps its shape and only grows or shrinks: <i>R</i> = 100 s × <i>v</i><sub>0</sub> × <span class=\"cv\" data-mesh=\"R\">…</span> = <span class=\"cv\" data-mesh=\"kmPerV\">…</span> × <i>v</i><sub>0</sub> km, so the Earth's 6,371 km asks for <i>v</i><sub>0</sub> = <span class=\"cv\" data-mesh=\"v0\">…</span>. That speed was established with distances measured on the globe: it is where the radius enters. Changing the law itself is another matter. With its curvature shifted (faster or slower with distance), or held constant, the refitted cloud is still a sphere (radial scatter at most <span class=\"cv\" data-mesh=\"relMax\">…</span>) but its radius runs from <span class=\"cv\" data-mesh=\"rMin\">…</span> to <span class=\"cv\" data-mesh=\"rMax\">…</span> units, and the fit worsens, from <span class=\"cv\" data-mesh=\"spaceStress\">…</span> to as much as <span class=\"cv\" data-mesh=\"stressMax\">…</span>; a constant speed gives <span class=\"cv\" data-mesh=\"linStress\">…</span> and <span class=\"cv\" data-mesh=\"linR\">…</span> units. The times give the sphere; the speed gives its size. A flat model would be vindicated by a plane that fits these times as well as space does, or by a cloud in space that is not a sphere: neither happens. Limits: a cloud and its mirror image fit equally; stations are identified by their code, so two stations sharing one would be merged; the readings kept are those 25–95° from our own relocation, a selection made with a globe fit; and only the earthquakes above were tried.",
  "k": "ms-p3"
 },
 {
  "t": "sources"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "srcs reading",
  "id": "",
  "html": "<div class=\"srcs reading\"><b class=\"h\">Further reading</b> <div class=\"note\">Not cited above, and no claim on this tab rests on it — listed because it is what you would read next, or because it lets you redo the measurement on data this page did not choose.</div> <ul> <li id=\"sseis-r2\"><a href=\"https://escweb.wr.usgs.gov/share/mooney/SriL.II2.pdf\">J. R. Kayal, <em>Seismic Waves and Earthquake Location</em> (USGS-hosted lecture notes, PDF)</a> — P, S, Love and Rayleigh phases, the ray-parameter argument for why rays curve back upward in the mantle, and the standard station-network location procedure referred to under objection 1.</li> <li><a href=\"https://escweb.wr.usgs.gov/share/mooney/\">USGS — W. D. Mooney, seismology training course materials</a>. The full set of lecture notes from which the earthquake-location document cited above is taken, including the travel-time and Earth-structure sessions. Written for training national seismic networks, so it assumes no prior background.</li> </ul> </div>",
  "k": "x:rd-more"
 }
];
