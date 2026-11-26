// Prose de l'onglet cnav, extraite VERBATIM et dans l'ordre du panneau
// legacy par research/extract_prose.py (EN). Rendue par src/core/prose.js.
export const PROSE = [
 {
  "t": "eyebrow",
  "html": "Sight reduction · the 1′ = 1 nm rule"
 },
 {
  "t": "h1",
  "html": "Why celestial navigation only closes on a globe"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig opener",
  "id": "",
  "html": "<div class=\"fig opener\"> <div class=\"figsym\" id=\"cnavPairFig\"></div> <div class=\"fcap\"><b>One rate, or a rate that keeps changing.</b> On the globe the zenith distance to a star equals the central angle θ = d/R, so sailing 60 nm toward the ground position changes the altitude by exactly 1°, anywhere. On a plane a body at finite height gives altitude = atan(H/x): equal steps in distance give unequal steps in angle. Distances are schematic; the star is at infinity.</div> </div>",
  "k": "x:cn-pair"
 },
 {
  "t": "lead",
  "html": "A sextant sight measures one thing: the <em>altitude</em> of a body — its angle above the sea horizon. Everything else in navigation is built on how that altitude changes as you move over the surface. That rate is the whole game, and only one shape of Earth produces the rate ships actually measure.",
  "opener": true,
  "k": "7712bbf3"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "opener",
  "id": "",
  "html": "<div class=\"opener\" style=\"margin:16px 0 4px\"><button type=\"button\" class=\"swapbtn refrBtn\">☼ refraction: off</button> <span class=\"drag-hint\" style=\"margin-left:8px\">applies to every figure in this tab</span></div>"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "",
  "lines": [
   {
    "tex": null,
    "fallback": "<span class=\"tex\" data-tex=\"\\g{a} = d\\times k \\iff d = \\frac{\\g{a}}{k} \\iff d = \\g{a}\\times R\"><b>a</b> = d × k &nbsp;⇔&nbsp; d = <b>a</b> / k &nbsp;⇔&nbsp; d = <b>a</b> × R</span>&nbsp;&nbsp;<span style=\"color:var(--ink-soft)\">(a in radians)</span>"
   }
  ],
  "fig": "cnavfig0",
  "gloss": "<b style=\"color:var(--globe)\">a</b> = change in a body's altitude &nbsp;·&nbsp; <b>d</b> = distance moved over the ground toward or away from its sub‑point &nbsp;·&nbsp; <b>k</b> = the rate linking them. The last two forms can both be true only if <b style=\"color:var(--globe)\">k = 1 / R</b> — the signature of a sphere of radius R.",
  "k": "cnav-m1"
 },
 {
  "t": "notes-block",
  "paras": [
   "Point a body straight up and you are standing on its <b>geographic position</b> (GP) — the spot where it sits at the zenith. Because the stars are so far away, their light arrives parallel across the whole Earth, so a body's <em>zenith distance</em> (90° − altitude) equals your angular distance from its GP. Move toward the GP and the altitude climbs; move away and it falls. On a sphere the arc you walk and the angle you turn are locked together by <code>arc = R × angle</code> — that is <code>d = a × R</code> — so <b>k = 1/R is identical everywhere, in every direction, for every body.</b>"
  ],
  "k": "cn-x1"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>The measured constant.</b> Navigators find that <b>1 arcminute of altitude change = 1 nautical mile</b> of travel toward the GP — which is how the nautical mile was defined. Feed that into d = a/k: with k = 1′/nm, R = 1/k = 3438 nm ≈ 6371 km. The radius drops out of star sights alone, and it matches the Earth's independently‑known size. It is the <em>same R</em> that curves the terrestrial sightlines over in the Simulator tab.",
  "k": "a3f804f9"
 },
 {
  "t": "h2",
  "html": "See it in 3D: four sights, one fix <span class=\"drag-hint\">· click &amp; drag to orbit</span> <button type=\"button\" class=\"swapbtn refrBtn\" id=\"cnavRefrBtn\" style=\"margin-left:10px\">☼ refraction: off</button>",
  "k": "c974926c"
 },
 {
  "t": "notes",
  "html": "Each star stands above its ground position (GP); the observer measures its altitude and computes a distance <code>d = a/k</code>, which draws a <em>circle of position</em> on the surface around that GP. The flat model gets every advantage: its star height H is calibrated so that sight ① works perfectly. The other three sights follow.",
  "k": "a28b5d79"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "cnav-grid",
  "id": "",
  "html": "<div class=\"cnav-grid\"> <div class=\"fig\"> <canvas id=\"g3d\"></canvas> <div class=\"fcap\"><b>Globe.</b> With k = 1/R, all four circles <code>d = a/k</code> pass through the observer — one point satisfies every sight simultaneously. This is a celestial fix, performed at sea every day.</div> </div> <div class=\"fig\"> <canvas id=\"f3d\"></canvas> <div class=\"fcap\"><b>Flat plane.</b> Stars at height H over the same GPs. Even with H tuned so circle ① hits the observer exactly, circles ②–④ fall short (red gaps) — because atan(r/H) isn't proportional to r. No single H fixes all four; on a plane the sights contradict each other.</div> </div> </div>",
  "k": "x:b39c22ef"
 },
 {
  "t": "raw",
  "tag": "p",
  "class": "rate-note",
  "id": "refr3dNote",
  "html": "<p class=\"rate-note\" id=\"refr3dNote\"></p>"
 },
 {
  "t": "table",
  "id": "",
  "tbody": "fix3dRows",
  "caption": "The four sights: measured altitude → d = a/k, versus what the flat model's circles actually do",
  "head": [
   "Star",
   "Measured altitude",
   "d = a/k (globe circle)",
   "Flat circle radius",
   "Flat miss at the observer"
  ],
  "k": "x:b0eb946d"
 },
 {
  "t": "h2",
  "html": "Test it yourself: is k constant?",
  "k": "405078b5"
 },
 {
  "t": "notes",
  "html": "A body sits directly over its sub‑point. The globe drops its altitude at a fixed rate; the flat‑plane model (body at height H) does not. Watch the two rate columns.",
  "k": "6ecd013a"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "mini-form",
  "id": "",
  "html": "<div class=\"mini-form\"> <div class=\"field\"><label>Flat‑model body height H <span class=\"unit\">(km)</span></label> <input type=\"number\" id=\"cnH\" value=\"5000\" min=\"100\" step=\"100\"></div> <div class=\"field\"><label>Globe radius R <span class=\"unit\">(km)</span></label> <input type=\"number\" id=\"cnR\" value=\"6371\" min=\"100\" step=\"1\"></div> </div>",
  "k": "x:b9b684d1"
 },
 {
  "t": "table",
  "id": "",
  "tbody": "cnavRows",
  "caption": "Altitude of a body above its sub‑point, with the local rate of altitude change (arcminutes per nautical mile)",
  "head": [
   "Distance from sub‑point",
   "Globe altitude",
   "Globe rate k",
   "Flat altitude",
   "Flat rate k"
  ],
  "k": "x:32fc4adf"
 },
 {
  "t": "raw",
  "tag": "p",
  "class": "rate-note",
  "id": "cnavNote",
  "html": "<p class=\"rate-note\" id=\"cnavNote\"></p>"
 },
 {
  "away": "xp-cnav-2",
  "t": "exp",
  "h": "Experiment 2 · celestial navigation",
  "title": "Drive north and watch Polaris climb",
  "lead": "Measure the altitude of Polaris (or any star) above the horizon. Drive a known distance due north along a straight road. Measure it again. The star has climbed — the question is by how much.",
  "iv": "<span class=\"vartag iv-t\">Independent variable</span><br> <b>What you change:</b> the distance <b>d</b> you travel due north. You choose it — 100 km, 300 km, 500 km.",
  "dv": "<span class=\"vartag dv-t\">Dependent variable</span><br> <b>What you measure:</b> the <b>change in the star's altitude</b>, in degrees. The sky decides this, not you.",
  "meta": [],
  "inputs": [
   [
    "exp2d",
    "IV — distance driven north <span class=\"unit\">(km)</span>",
    " type=\"number\" id=\"exp2d\" value=\"300\" min=\"1\" step=\"10\""
   ],
   [
    "exp2lat",
    "Controlled — starting latitude <span class=\"unit\">(°N)</span>",
    " type=\"number\" id=\"exp2lat\" value=\"45\" min=\"1\" max=\"85\" step=\"1\""
   ]
  ],
  "out": "exp2out",
  "verdict": "exp2v",
  "k": "x:e7075fe9"
 },
 {
  "t": "callout",
  "flat": true,
  "html": "<b>Why the plane fails, in one line.</b> On a flat plane a body at finite height can never reach the horizon (atan(H/x) stays positive), so the Sun would never set; different bodies would need different heights H and return contradictory fixes; and k would change with where you stand. The globe uses a single radius R and one k = 1/R for the Sun, the Moon and every star at once — and from that same geometry it predicts sunset, the “Polaris altitude equals your latitude” rule, and the southern stars a disk cannot show.",
  "k": "e395647e"
 },
 {
  "t": "notes-block",
  "paras": [
   "<span class=\"k\">The through‑line.</span> The two tabs are the same geometry seen twice. The curvature term <code>d² / 2R</code> that lowers a distant tower's elevation angle in the Simulator is produced by the very same R that makes <code>k = 1/R</code> here. Flatten the Earth and you break both at once — and no single flat layout reproduces the terrestrial dips <em>and</em> the constant one‑arcminute‑per‑mile star rate that ships have logged for three centuries."
  ],
  "k": "cn-x2"
 },
 {
  "t": "xrefs",
  "keys": [
   "dist",
   "sun",
   "gps",
   "fou",
   "azim"
  ],
  "wide": false
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "srcs reading",
  "id": "",
  "html": "<div class=\"srcs reading\"><b class=\"h\">Sources and further reading for this tab</b> <div class=\"note\">Nothing on this tab carries an inline [n] marker yet: these are the works it was built from, listed in full rather than pinned to individual sentences.</div> <ul> <li id=\"s2-r1\"><a href=\"https://www.dco.uscg.mil/Portals/9/NMC/pdfs/examinations/bowditch_Vol_2_2019.pdf\">Bowditch, <em>The American Practical Navigator</em>, Vol.&nbsp;2 (NGA, 2019; PDF hosted by the US Coast Guard)</a> — celestial navigation in full: a corrected sextant altitude places you on a circle around the body's ground point, the 1′ = 1 nautical mile relation, sight reduction, and the running fix. Everything this tab computes is the working method described there.</li> <li id=\"s2-r2\"><a href=\"https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2010JD014067\">Hirt et al. (2010), <em>J. Geophys. Res.</em> — terrestrial refraction coefficient</a> — background on the refraction physics behind the astronomical-refraction toggle (the drawn bend is exaggerated ×300 and labelled as such; the printed corrections are real).</li> <li><a href=\"https://aa.usno.navy.mil/data/celnav\">U.S. Naval Observatory — Celestial Navigation Data for Assumed Position and Time</a>. Fill in a position and a time and it returns Greenwich hour angle, declination, computed altitude and computed azimuth for every body above your horizon, plus the altitude corrections. <b>This is the single most useful link on this tab</b>: the stars drawn here are synthetic, chosen for legibility, but this service will give you real ones, from the organisation that publishes the almanac, and you can run the whole argument again on numbers this page had no hand in.</li> <li><a href=\"https://aa.usno.navy.mil/publications/na\">The Nautical Almanac</a> (U.S. Naval Almanac Office with HM Nautical Almanac Office). Published every year for over 150 years, tabulating hour angle and declination hourly to 0.1 arcminute. Every line of it is computed on a rotating sphere.</li> <li><a href=\"https://msi.nga.mil/Publications/SRTAir\">Sight Reduction Tables for Air Navigation</a> (Pub. 249 / AP 3270), and Pub. 229 for marine use. Prepared jointly by the U.S. Naval Observatory and the UK Hydrographic Office. These tables cannot be generated by any other geometry: they are spherical trigonometry, printed by two governments, for operational use.</li> <li><a href=\"https://aa.usno.navy.mil/publications/celnav\">USNO — Celestial Navigation Algorithms</a>. The modern least-squares formulation, which solves for course and speed as well as position. Useful here because it shows the sphere is not a legacy assumption kept for tradition: it is still the model when the method is rebuilt from scratch.</li> <li><b>T. H. Sumner, <em>A New and Accurate Method of Finding a Ship's Position at Sea</em> (Boston, 1843).</b> The origin of the line of position. Sumner found it by accident in December 1837 approaching the Irish coast in bad weather: working three different assumed latitudes, he noticed the three results fell on one straight line, and that line ran through Small's Light. Digitised and out of copyright; search the title.</li> <li><b>Marcq de Blond de Saint-Hilaire, « Calcul du point observé », <em>Revue Maritime et Coloniale</em> (1875).</b> The intercept method — the procedure this tab models — in the original French.</li> <li><b>IMO, International Convention on Standards of Training, Certification and Watchkeeping for Seafarers (STCW), tables A-II/1 and A-II/2.</b> Celestial navigation is a competence required by international treaty of officers in charge of a navigational watch. Whatever else it is, it is not a belief anyone is free to hold or not hold.</li> </ul> </div>",
  "k": "x:rd-both"
 }
];
