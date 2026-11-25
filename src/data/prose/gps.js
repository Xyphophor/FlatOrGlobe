// Prose de l'onglet gps, extraite VERBATIM et dans l'ordre du panneau
// legacy par research/extract_prose.py (EN). Rendue par src/core/prose.js.
export const PROSE = [
 {
  "t": "eyebrow",
  "html": "GPS · the arithmetic inside every fix"
 },
 {
  "t": "h1",
  "html": "Your phone solves a globe equation several times a second"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig opener",
  "id": "",
  "html": "<div class=\"fig opener\" style=\"margin:16px 0\"> <canvas id=\"gpsTri\"></canvas> <ul class=\"figkey\"> <li><span class=\"sw\" data-sw=\"gpsshell\"></span><span>each satellite's measured range is a full sphere of possible positions, drawn as a wireframe shell with its far half faded</span></li> <li><span class=\"sw\" data-sw=\"gpsearth\"></span><span>the Earth is the small solid globe sitting inside all three</span></li> <li><span class=\"sw\" data-sw=\"gpscircle\"></span><span>where two shells cut each other: a violet circle</span></li> <li><span class=\"sw\" data-sw=\"gpsyou\"></span><span>the point on the surface where all three circles meet: you</span></li> </ul> <div class=\"fcap\" id=\"gpsTriCap\"><b>Three range spheres, drawn at true scale.</b> Drag to orbit: the handshake holds from every angle.</div> </div>",
  "k": "x:gps-k1"
 },
 {
  "t": "lead",
  "html": "GPS does not measure position — it measures <b>time</b>. A receiver listens to at least four satellites, notes how long each signal took to arrive, multiplies by the speed of light, and solves four equations for four unknowns: where you are (x, y, z) and what time it really is. Every symbol in that math is globe-shaped: the satellite positions are broadcast as coordinates on a rotating ellipsoid, the orbits repeat with the stars rather than the sun, and the clocks are built fast-or-slow on purpose to survive curved spacetime above a round planet.",
  "opener": true,
  "k": "de9fe103"
 },
 {
  "t": "h2",
  "html": "The equation your phone actually solves",
  "k": "64c2b4b4"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "lines": [
   {
    "tex": "\\rho_i = \\left| \\mathbf{x} - \\mathbf{s}_i(t) \\right| + c\\cdot\\delta t",
    "fallback": "ρᵢ = | x − sᵢ(t) | + c·δt"
   },
   {
    "tex": null,
    "fallback": "four unknowns <span class=\"tex\" data-tex=\"(x,\\ y,\\ z,\\ \\delta t)\">(x, y, z, δt)</span> ⇒ <b>four satellites</b>"
   },
   {
    "tex": null,
    "fallback": "1 μs of clock error = <span class=\"tex\" data-tex=\"\\g{300\\,\\text{m}}\"><b>300 m</b></span> of position error"
   }
  ],
  "fig": "gpsfig0",
  "gloss": "The satellite positions sᵢ(t) come from the broadcast ephemeris — orbital elements<sup class=\"ref\"><a href=\"#s-gps-n4\">[4]</a></sup> the receiver evaluates in Earth-centred WGS-84 coordinates, the same ellipsoid the surveying tab runs on. Note what the receiver does <em>not</em> carry: an accurate clock. The fourth satellite buys the time δt, which is why a $10 receiver chip can use atomic-clock timing. The solution point where the four ranges close exists because the geometry is what the ephemeris says it is; feed the same signals into any other geometry and the ranges simply fail to meet.",
  "k": "x:42cacf87"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "",
  "lines": [
   {
    "tex": "\\rho_i = \\sqrt{(x-x_i)^2 + (y-y_i)^2 + (z-z_i)^2} + c\\cdot\\delta t,\\quad i = 1\\ldots 4",
    "fallback": "ρᵢ = √((x−xᵢ)² + (y−yᵢ)² + (z−zᵢ)²) + c·δt , &nbsp; i = 1…4"
   }
  ],
  "fig": "gpsfig1",
  "gloss": "Written out, each measurement says: <em>you lie on a sphere</em> of radius rᵢ = ρᵢ − c·δt centred on satellite i. One sphere pins you to a surface; two intersect in a circle; three meet in exactly <b>two points</b> — and the second point lands thousands of kilometres out in space, so it is rejected (or resolved automatically once the fourth satellite fixes δt). The receiver solves this by Newton iteration in milliseconds; the model below draws it.",
  "k": "x:d92cf81a"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "mini-form",
  "id": "",
  "html": "<div class=\"mini-form\"> <div class=\"field\" style=\"flex:1;min-width:230px\"> <label>Your latitude φ <span id=\"gpsLatRead\" class=\"unit\">+45°</span></label> <input type=\"range\" id=\"gpsLat\" min=\"-85\" max=\"85\" step=\"1\" value=\"45\" style=\"accent-color:var(--obj3)\"> </div> </div>",
  "k": "x:6b13c9ee"
 },
 {
  "t": "notes",
  "html": "The three circles are not independent. They all pass through the same <b>two points</b>: you, on the surface, and a mirror point in deep space on the far side of the satellite plane. That second point is rejected as a receiver location, and eliminated outright once the fourth satellite fixes δt. There is no third place the ranges could put you.",
  "k": "gps-p-two"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "cnav-grid",
  "id": "",
  "html": "<div class=\"cnav-grid\"> <div class=\"fig\"> <canvas id=\"gpsSky\"></canvas> <div class=\"fcap\" id=\"gpsSkyCap\"><b>The constellation, to scale.</b> 24 baseline satellites in six orbital planes<sup class=\"ref\"><a href=\"#s-gps-n1\">[1]</a></sup> inclined 55°, at 4.17 Earth radii from the centre (20,200 km up), each circling twice a day. From any point on the sphere, 8–12 are above your horizon at once — highlighted, with sight lines — and the set constantly changes as satellites <em>rise and set</em>, exactly as the satellite-status screen of any phone GPS app shows. Drag to orbit; the count updates live as the constellation wheels.</div> </div> <div class=\"fig\"> <canvas id=\"gpsRange\" style=\"cursor:default\"></canvas> <div class=\"fcap\"><b>Why four satellites.</b> With a perfect clock, three ranges (solid) intersect at your position. A cheap receiver's clock is off by some unknown δt, inflating every measured range by the same c·δt (dashed) — the circles miss. Solving for δt alongside position shrinks them back until they close: the fix and the time fall out together. This closure is a strict geometric test, passed millions of times a second, everywhere on Earth, only by the broadcast globe geometry.</div> </div> </div>",
  "k": "x:72f1b94d"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "",
  "lines": [
   {
    "tex": "T = 2\\pi\\sqrt{\\frac{a^3}{GM}} = 2\\pi\\sqrt{\\frac{26,560^3}{398,600}}\\ \\text{s} = \\g{11\\,\\text{h}\\ 58\\,\\text{min}}",
    "fallback": "T = 2π√(a³ / GM) = 2π√(26,560³ / 398,600) s = <b>11 h 58 min</b>"
   }
  ],
  "fig": "gpsfig2",
  "gloss": "A bonus equation with nowhere to hide: Kepler's third law, with the broadcast semi-major axis a = 26,560 km and the Earth's measured gravitational parameter GM, reproduces the broadcast orbital period to the minute<sup class=\"ref\"><a href=\"#s-gps-n3\">[3]</a></sup>. The constellation's timetable is the equation of motion around a spherical mass — there is no version of this arithmetic over a plane.",
  "k": "x:38e4824f"
 },
 {
  "t": "h2",
  "html": "Three globe fingerprints inside the signal",
  "k": "4686ca1f"
 },
 {
  "t": "notes",
  "html": "<b>How long a satellite can stay up, exactly.</b> A satellite at a = 26,560 km is above a true horizon while the angle at the Earth's centre between it and you is less than arccos(R/a) = 76.12°. That is 152.2° of an 11 h 58 min orbit, so <b>no GPS satellite is ever visible for more than 5 h 04 min</b> — and above the 5° elevation mask most receivers apply, no more than 4 h 44 min. One radius, one orbit, nothing fitted. Fixed emitters on a plane have no such ceiling: once up, they never set.",
  "k": "gps-vis1"
 },
 {
  "t": "notes",
  "html": "<b>① The sidereal repeat.</b> The orbital period is 11 h 58 min — half a<sup class=\"ref\"><a href=\"#s-gps-n2\">[2]</a></sup> <em>sidereal</em> day, not half a solar day. Each satellite's ground track repeats not every 24 hours but every 23 h 56 min: the constellation keeps time with the <b>stars</b>, and the ground slides 4 minutes eastward beneath it daily. That 4-minute slip is the rotation of the Earth, written into the almanac your phone downloads.",
  "k": "d75a2347"
 },
 {
  "t": "notes",
  "html": "<b>② The relativity ledger.</b> Orbital speed (3.9 km/s)<sup class=\"ref\"><a href=\"#s-gps-n3\">[3]</a></sup> makes the satellite clocks run <em>slow</em> by ~7 μs/day; sitting higher in Earth's gravity well makes them run <em>fast</em> by ~45 μs/day. Net: <b>+38 μs/day</b><sup class=\"ref\"><a href=\"#s-gps-n5\">[5]</a></sup>, which at 300 m/μs would smear positions by ~11 km per day. So the clocks are manufactured deliberately slow — offset before launch so they tick correctly once in orbit. The hardware is pre-distorted for curved spacetime around a spherical mass; the fact that the fix stays put is a daily test of both relativity and the geometry it was computed for.",
  "k": "0f576ba9"
 },
 {
  "t": "notes",
  "html": "<b>③ The relativity ledger, as an equation.</b>",
  "k": "bfb9bb3a"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "",
  "lines": [
   {
    "tex": null,
    "fallback": "<span class=\"tex\" data-tex=\"\\frac{\\Delta f}{f} = \\frac{\\Delta U}{c^2} - \\frac{v^2}{2c^2} \\implies +45.7 - 7.1 \\approx \\g{+38.6\\ \\text{μs}/\\text{day}}\">Δf / f = ΔU/c² − v²/2c² &nbsp;⇒&nbsp; +45.7 − 7.1 ≈ <b>+38.6 μs/day</b></span> &nbsp;⇒&nbsp; × c ≈ 11.6 km/day of drift if ignored"
   }
  ],
  "fig": "gpsfig3",
  "gloss": "Gravitational blueshift from sitting higher in the potential of a spherical mass, minus time dilation from the 3.9 km/s orbit — both terms are functions of GM and r around a globe, and the satellites' clocks are factory-offset by exactly this amount<sup class=\"ref\"><a href=\"#s-gps-n5\">[5]</a></sup>. The fix holding steady for decades is a daily audit of the arithmetic.",
  "k": "x:a983156b"
 },
 {
  "t": "notes",
  "html": "<b>④ The range window.</b> Every pseudorange your receiver logs falls between ~20,200 km (satellite overhead) and ~25,800 km (satellite on the horizon) — precisely √((R+h)² − R²) for a sphere of radius R. That narrow window, identical for receivers on every continent, is the sphere's signature in raw data anyone can record.",
  "k": "c1988880"
 },
  { "t": "h2", "html": "Solve it yourself, from raw signals", "k": "gps-raw-h2" },
  { "t": "notes", "html": "Everything above computes what a receiver should see. Here is what real receivers did see. On one day, <span class=\"cv\" data-v=\"grN\">…</span> stations of the International GNSS Service, spread over every continent, recorded the raw pseudoranges of the GPS satellites; the data are public.<sup class=\"ref\"><a href=\"#s-gps-n6\">[6]</a></sup> Each station is solved <em>alone</em>, every five minutes, from the origin of the coordinate system and with no position taken from the file: four unknowns (x, y, z and the receiver clock) from the satellites above 10°, using the broadcast orbits and clocks,<sup class=\"ref\"><a href=\"#s-gps-n7\">[7]</a></sup> the light time, the Earth's turn during the flight, and a standard troposphere.<sup class=\"ref\"><a href=\"#s-gps-n8\">[8]</a></sup> The day's fixes are averaged. Limit: the broadcast orbits are written in the WGS84 frame, so this is a test that can fail, not a measurement from nothing: with a wrong geometry the stations would not solve to a metre, they would leave kilometres of residual.", "k": "gps-raw-p1" },
  { "t": "raw", "tag": "div", "class": "", "id": "", "html": "<div class=\"fig\"><canvas id=\"gpsRawMap\" class=\"gps-raw\"></canvas></div>", "k": "gps-raw-map" },
  { "t": "fcap", "html": "<b>Real receivers, solved from the raw signals.</b> Left: the stations (a flat map, only to locate them). Right: what is left of each pseudorange once the fix is made, all stations and epochs together: <span class=\"cv\" data-v=\"grRes\">…</span> rms, 95 % below <span class=\"cv\" data-v=\"grP95\">…</span>. Receiver noise, multipath and broadcast-orbit error make up these metres. <em>Would favour the flat plane: station positions that only solve with kilometre residuals, or that fit a plane better than a sphere.</em>", "k": "gps-raw-capmap" },
  { "t": "notes", "html": "The stations come out as points in space, with no shape assumed. Fit a sphere through them (centre and radius free), or the best plane:", "k": "gps-raw-p2" },
  {
    "t": "formula",
    "flat": false,
    "style": "",
    "lines": [
      { "tex": "\\lvert \\mathbf{x}_j - \\mathbf{c} \\rvert = R \\quad\\Leftrightarrow\\quad \\lvert \\mathbf{x}_j \\rvert^2 = 2\\,\\mathbf{c}\\cdot\\mathbf{x}_j + \\left(R^2 - \\lvert \\mathbf{c} \\rvert^2\\right)", "fallback": "|xⱼ − c| = R  ⇔  |xⱼ|² = 2·c·xⱼ + (R² − |c|²)" }
    ],
    "gloss": "x<sub>j</sub>: the position of station j, solved from its own pseudoranges · c: centre of the sphere · R: its radius · the right-hand form is linear in c and in R² − |c|², one least-squares solve gives both; a plane would be n·x = d",
    "fig": "gpsFxSphere",
    "k": "gps-raw-fx"
  },
  { "t": "raw", "tag": "div", "class": "", "id": "", "html": "<div class=\"fig\"><canvas id=\"gpsRawFit\" class=\"gps-raw\"></canvas></div>", "k": "gps-raw-fit" },
  { "t": "fcap", "html": "<b>The Earth's radius from receivers that solved themselves.</b> The sphere has R = <span class=\"cv\" data-v=\"grR\">…</span> (leaving one station out in turn), centred <span class=\"cv\" data-v=\"grCentre\">…</span> from the origin of the coordinates; the best plane through the same points leaves <span class=\"cv\" data-v=\"grPlane\">…</span>. What the sphere leaves, <span class=\"cv\" data-v=\"grSphRms\">…</span> rms, is the Earth's flattening, not noise: the equator stands <span class=\"cv\" data-v=\"grDelta\">…</span> farther from the centre than the poles (the WGS84 ellipsoid, a published model, has <span class=\"cv\" data-v=\"grWgs\">…</span>); remove it and <span class=\"cv\" data-v=\"grAfter\">…</span> remain, the scatter of one-day fixes and of the stations' heights. <em>Would favour the flat plane: a plane fitting better than the sphere.</em>", "k": "gps-raw-capfit" },
  { "t": "notes", "html": "<b>With your own phone.</b> The same calculation, run on the raw log of an Android phone, in your browser, and a way to fit a sphere with other people far away: the tab <a class=\"xref\" href=\"#tab-rx\" data-xref=\"rx\">Your own GPS</a>.", "k": "gps-raw-rx" },
  { "t": "notes", "html": "One more check uses no orbit at all. A receiver can only track a satellite that is above its own horizon, and the files say which ones it tracked. Take two stations on opposite sides of the equator:", "k": "gps-raw-p3" },
  { "t": "raw", "tag": "div", "class": "", "id": "", "html": "<div class=\"fig\"><canvas id=\"gpsRawVis\" class=\"gps-raw\"></canvas></div>", "k": "gps-raw-vis" },
  { "t": "fcap", "html": "<b>The two stations do not see the same sky.</b> One row per satellite, one column per five minutes: blue, seen only from <span class=\"cv\" data-v=\"grA\">…</span>; purple, only from <span class=\"cv\" data-v=\"grB\">…</span>; teal, from both. <span class=\"cv\" data-v=\"grAB\">…</span> apart, they track <span class=\"cv\" data-v=\"grCommon\">…</span> satellites in common on average, while <span class=\"cv\" data-v=\"grOnlyA\">…</span> are seen only from the first and <span class=\"cv\" data-v=\"grOnlyB\">…</span> only from the second, and the two lists are never identical. Nothing here comes from an orbit or from WGS84, only from the files. On a plane with the transmitters above it, every station would see the same satellites at the same time. <em>Would favour the flat plane: every station seeing the same satellites at the same time.</em>", "k": "gps-raw-capvis" },
  { "t": "notes", "html": "Do this for all <span class=\"cv\" data-v=\"grPairs\">…</span> pairs of stations. A satellite at the distance a = <span class=\"cv\" data-v=\"grAEarth\">…</span> from the centre can be above the horizon of two points on a sphere of radius R only if they are less than 2·arccos(R/a) apart, whatever the satellite does: <span class=\"cv\" data-v=\"grLimit\">…</span> with the radius fitted above and the broadcast orbit radius.", "k": "gps-raw-p4" },
  { "t": "raw", "tag": "div", "class": "", "id": "", "html": "<div class=\"fig\"><canvas id=\"gpsRawShare\" class=\"gps-raw\"></canvas></div>", "k": "gps-raw-share" },
  { "t": "fcap", "html": "<b>How many satellites two stations share, by how far apart they are.</b> One dot per pair of stations: the number of satellites tracked by both at the same time, averaged over the day. The count falls with the separation and the farthest pair that ever tracked the same satellite is <span class=\"cv\" data-v=\"grShareMax\">…</span> apart; none of the pairs beyond <span class=\"cv\" data-v=\"grDisjoint\">…</span> ever did. Dashed: the geometric limit <span class=\"cv\" data-v=\"grLimit\">…</span>, which has no free parameter. A flat model has a free height for each transmitter and would have to be tuned to land on such a limit. <em>Would favour the flat plane: pairs of stations that share satellites well beyond that separation.</em>", "k": "gps-raw-capshare" },
 {
  "t": "h2",
  "html": "Now try to build it on a flat plane",
  "k": "d47629ca"
 },
 {
  "t": "notes",
  "html": "Steel-man the disc: forget that nothing orbits a plane (orbits are free fall around a central mass) and simply mount the 31 transmitters on towers or hovering platforms, at any heights you like, anywhere over the disc. The public, decodable signal itself now convicts the model:",
  "k": "22f001e0"
 },
 {
  "t": "raw",
  "html": "<table class=\"cnav-table\"> <caption>What receivers measure vs what fixed flat-plane emitters must produce</caption> <thead><tr><th>Measured (log it yourself)</th><th>Globe</th><th>Flat emitters</th></tr></thead> <tbody> <tr><td style=\"text-align:left\">Satellites <b>rise and set</b>; the in-view set turns over completely in hours</td><td class=\"hot\">predicted</td><td class=\"cold\">impossible — anything above the plane stays above every horizon forever, alt = atan(h/d) &gt; 0</td></tr> <tr><td style=\"text-align:left\">8–12 in view, roughly the same count <b>everywhere</b> — Alaska, Ecuador, New Zealand</td><td class=\"hot\">predicted</td><td class=\"cold\">count collapses with distance from the array; the far side of the disc sees a low cluster near one horizon</td></tr> <tr><td style=\"text-align:left\">Pseudoranges confined to <b>20,200–25,800 km</b></td> <td class=\"hot\">predicted</td><td class=\"cold\">ranges to never-setting distant emitters run to 40,000 km and beyond — never observed</td></tr> <tr><td style=\"text-align:left\">Southern receivers watch satellites wheel around the <b>southern</b> sky</td> <td class=\"hot\">predicted</td><td class=\"cold\">no south to wheel around on a pole-centred disc</td></tr> <tr><td style=\"text-align:left\">One broadcast ephemeris closes the four-range equation for <b>every</b> receiver at once</td><td class=\"hot\">predicted</td><td class=\"cold\">no emitter arrangement over a plane reproduces sphere-consistent ranges at all receivers simultaneously</td></tr> <tr><td style=\"text-align:left\">Clocks pre-offset by +38 μs/day hold the fix steady for decades</td> <td class=\"hot\">predicted</td><td class=\"cold\">no account — the offset is computed from orbital speed and gravitational potential around a spherical mass</td></tr> </tbody> </table>",
  "k": "x:03e00429"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>The deepest point is the simplest.</b> GPS is not a picture of the Earth that could be faked; it is a <em>live geometry proof</em> re-run by billions of independent receivers, using public equations, public ephemerides, and raw observables anyone can log. The four ranges close on a point — your point — only if the transmitters are where the globe math says they are. A navigation system is the one kind of evidence that cannot humor a wrong shape and keep working: get the geometry wrong by a kilometre and every landing, harvest and package delivery drifts with it.",
  "k": "d417c8a3"
 },
 {
  "t": "exp",
  "h": "Experiment 8 · read the sky with a free app",
  "title": "Any GNSS status app shows the raw constellation — no account, no cost",
  "lead": "Install a satellite-status app (most phones expose GPS, Galileo, GLONASS and BeiDou). The sky plot shows each satellite's azimuth and elevation, live.",
  "iv": "<span class=\"vartag iv-t\">Independent variable</span><br> <b>What you change:</b> the <b>time</b> — screenshot the sky plot now and again in 1–2 hours; and if you can, compare with a friend at a different latitude at the same moment.",
  "dv": "<span class=\"vartag dv-t\">Dependent variable</span><br> <b>What you measure:</b> each satellite's <b>elevation over time</b> (rising or setting?), the <b>count in view</b>, and where the tracks wheel (north or south).",
  "meta": [],
  "inputs": [],
  "out": "exp8out",
  "verdict": "exp8v",
  "k": "x:2ef5e98b"
 },
 {
  "t": "xrefs",
  "keys": [
   "dist",
   "grav",
   "cnav",
   "surv"
  ],
  "wide": false
 },
 {
  "t": "sources"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "srcs reading",
  "id": "",
  "html": "<div class=\"srcs reading\"><b class=\"h\">Further reading</b> <div class=\"note\">Not cited above, and no claim on this tab rests on it — listed because it is what you would read next, or because it lets you redo the measurement on data this page did not choose.</div> <ul> <li><a href=\"https://www.navcen.uscg.gov/gps-technical-references\">IS-GPS-200, <em>Navstar GPS Space Segment / Navigation User Interfaces</em></a> — the interface specification itself, published by the U.S. Coast Guard Navigation Center. <b>This is the strongest document on the tab.</b> Ashby's review, cited above, explains why the relativistic correction is needed; IS-GPS-200 is where it is <em>written into the standard</em>, as the term −2√(μa)·e·sin E / c² that every receiver is required to apply, alongside the broadcast Keplerian elements. Not an argument about the Earth — a signal specification that will not work unless the Earth is the shape and size stated here.</li> <li><a href=\"https://igs.org/formats-and-standards/\">International GNSS Service — formats and standards (RINEX)</a>, with the <a href=\"https://files.igs.org/pub/resource/pubs/UsingIGSProductsVer21_cor.pdf\">guide to using IGS products</a>. Over 300 permanent tracking stations in more than 80 countries, publishing precise orbits and clocks free of charge. Download a day of broadcast ephemerides and do the four-satellite closure yourself, on real data.</li> <li><b>B. Hofmann-Wellenhof, H. Lichtenegger &amp; E. Wasle, <em>GNSS — Global Navigation Satellite Systems: GPS, GLONASS, Galileo, and more</em> (Springer, 2008).</b> The standard graduate text, for the reader who wants the trilateration worked through completely rather than sketched.</li> <li><b>BIPM — <em>Circular T</em>.</b> International atomic time is maintained by comparing clocks in dozens of national laboratories, largely over GPS links. The same relativistic corrections appear there, in metrology rather than navigation, and disagreements would show up as nanoseconds of mismatch between laboratories.</li> </ul> </div>",
  "k": "x:rd-more"
 }
];
