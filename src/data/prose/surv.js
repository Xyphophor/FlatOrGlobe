// Prose de l'onglet surv, extraite VERBATIM et dans l'ordre du panneau
// legacy par research/extract_prose.py (EN). Rendue par src/core/prose.js.
export const PROSE = [
 {
  "t": "eyebrow",
  "html": "Geodetic surveying · how professionals measure a planet"
 },
 {
  "t": "h1",
  "html": "Surveyors don't assume the curve — their instruments keep finding it"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig opener",
  "id": "",
  "html": "<div class=\"fig opener\"> <div class=\"figsym\" id=\"survPairFig\"></div> <div class=\"fcap\"><b>The correction, and what it would be on a plane.</b> The line of sight is level in both. On a plane the ground stays under it and the staff needs no correction at all; on a globe the ground falls away by d²/2R and every sight does. Curvature is exaggerated.</div> </div>",
  "k": "x:sv-pair"
 },
 {
  "t": "lead",
  "html": "Professional surveying is two centuries of procedures that exist <em>only because</em> raw measurements kept disagreeing with flat geometry by exactly the amount a sphere predicts. No knobs to turn here: every number below is a documented case — a wager, a survey, a tunnel, an accelerator — with the source linked at the bottom.",
  "opener": true,
  "k": "f96e4e94"
 },
 {
  "t": "h2",
  "html": "01 · Levelling: the correction applied a thousand times a day",
  "k": "cab55d9e"
 },
 {
  "t": "notes",
  "html": "A surveyor's level defines a <em>horizontal</em> line of sight — tangent to the level surface at the instrument. But \"level\" (equal height, equal gravity potential) <em>curves with the planet</em>: the tangent climbs away from the level surface<sup class=\"ref\"><a href=\"#s-surv-n3\">[3]</a></sup> as the square of the distance. Three documented situations, three scales:",
  "k": "766b7b70"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "lines": [
   {
    "tex": "\\operatorname{drop} = \\frac{d^2}{2R} \\approx \\g{7.85\\,\\text{cm}\\times d^2[\\text{km}]}",
    "fallback": "drop = d²/2R ≈ <b>7.85 cm × d²[km]</b>"
   },
   {
    "tex": null,
    "fallback": "mid-span bulge of a chord: <span class=\"tex\" data-tex=\"\\g{\\frac{d^2}{8R}}\"><b>d²/8R</b></span>"
   },
   {
    "tex": null,
    "fallback": "with refraction (k = 0.13): × 0.87"
   }
  ],
  "fig": "survfig0",
  "gloss": "Field procedure encodes the first formula twice over: sights are kept short <em>and</em> balanced — equal back-sight and fore-sight — precisely so the curvature term cancels between the two staff readings. A correction that cancels by symmetry is still a correction: on a flat earth the whole ritual would be pointless.",
  "k": "x:5d201b49"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "preset-row",
  "id": "",
  "html": "<div class=\"preset-row\" style=\"margin:12px 0 4px\"> <select id=\"survLvlSel\" aria-label=\"Documented levelling scenes\"></select> </div>"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\" style=\"margin:10px 0 16px\"> <canvas id=\"survLevel\" style=\"cursor:default\"></canvas> <div class=\"fcap\" id=\"survLvlCap\"></div> </div>"
 },
 {
  "t": "fold",
  "q": false,
  "k": "surv-fold1",
  "summary": "<b>The Bedford Level wager, 1870 — surveying settles a bet</b><span class=\"fold-teaser\">Rowbotham sighted eight inches above the water, deep in the refraction layer; Wallace raised the line to about 4 m, set a marker mid-way, and won — and the numbers in the table above are his, documented, not computed here</span>",
  "html": "<div class=\"callout\">Flat-earth author Samuel Rowbotham had sighted along the Old Bedford River with a telescope eight inches above the water — deep in the strong-refraction layer — and declared the six-mile stretch flat. When his follower John Hampden staked £500 that no scientist could show curvature there, the naturalist <b>Alfred Russel Wallace</b> — a trained surveyor — accepted, raised the sight line to ~4 m to escape the worst refraction, and set a marker mid-way between two end markers at equal height. Through the telescope the middle marker stood clearly proud of the line joining the ends — the ~1.6 m the sphere predicts (1.85 m before refraction) — and the referee, editor of <em>The Field</em>, awarded Wallace the wager<sup class=\"ref\"><a href=\"#s-surv-n4\">[4]</a></sup>. Hampden's response was years of libel and lawsuits, but the measurement has been repeated on that canal ever since, always with the same result. The design — three markers, one sight line — is the cleanest curvature experiment ever devised, and it needs no input from you: the numbers above are the documented ones.<a class=\"xref\" data-xref=\"ref\"></a></div>"
 },
 {
  "t": "h2",
  "html": "02 · Triangulation: the angles confess <button type=\"button\" class=\"swapbtn\" id=\"survTriSpinBtn\" style=\"margin-left:10px\">⏸ pause</button>",
  "k": "11ef0793"
 },
 {
  "t": "notes",
  "html": "<b>Why the excess is the area divided by R²</b> (Girard, Gauss), and the same angle sums run on triangles simulated on a plane: <a class=\"xref\" href=\"#tab-kappa/ka-h2inside\" data-xref=\"kappa\" data-sec=\"ka-h2inside\">Curvature</a>.",
  "k": "ka-link-surv"
 },
 {
  "t": "notes",
  "html": "Historic mapping was built from chains of triangles between hilltop stations — theodolite angles plus one measured baseline. On a plane, every triangle's angles sum to exactly 180°. On a sphere they sum to more, by the <b>spherical excess</b>, proportional to the triangle's area — and surveyors do not debate this, they <em>budget</em> for it, triangle by triangle. Pick a documented network:",
  "k": "a7301ae8"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "preset-row",
  "id": "",
  "html": "<div class=\"preset-row\" style=\"margin:12px 0 4px\"> <select id=\"survTriSel\" aria-label=\"Documented triangulation networks\"></select> </div>"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "cnav-grid",
  "id": "",
  "html": "<div class=\"cnav-grid\"> <div class=\"fig\"> <canvas id=\"survTri\"></canvas> <div class=\"fcap\" id=\"survTriCap\"></div> </div> <div class=\"fig\"> <table class=\"cnav-table\" style=\"margin:0\"> <caption>Documented networks and the excess their theodolites had to swallow</caption> <thead><tr><th>Network</th><th>Sides</th><th>Excess ε per triangle</th></tr></thead> <tbody id=\"survRows\"></tbody> </table> <p class=\"rate-note\" style=\"margin-top:10px\">Snellius' pioneering 1615 chain (Alkmaar–Bergen op Zoom, the first triangulation) carried ~2″ per triangle — below his instruments'<sup class=\"ref\"><a href=\"#s-surv-n11\">[11]</a></sup> precision, which is why the excess only <em>emerged</em> as networks and theodolites grew. From Gauss onward it was measured routinely; the Struve chain's 258 triangles, Britain's 6,500-pillar retriangulation and India's Great Trigonometrical Survey all closed only because ε was carried in the books. No flat arrangement of the same stations can close at all.</p> </div> </div>",
  "k": "x:c7523051"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "lines": [
   {
    "tex": "\\varepsilon = \\frac{\\text{Area}}{R^2} \\implies \\varepsilon\\arcsec \\approx \\g{\\frac{\\text{Area}[\\text{km}^2]}{197}}",
    "fallback": "ε = Area / R² &nbsp;⇒&nbsp; ε″ ≈ <b>Area[km²] / 197</b>"
   },
   {
    "tex": null,
    "fallback": "flat prediction: <b style=\"color:var(--flat)\"><span class=\"tex\" data-tex=\"\\f{\\varepsilon = 0}\">ε = 0</span>, always</b>"
   }
  ],
  "fig": "survfig1",
  "gloss": "The benchmark case: Gauss's great triangle <b>Brocken–Hohehagen–Inselsberg</b> (sides 69, 85 and 107 km), measured in his 1820s Hanover survey with an excess of about <b>14.85″</b> — dozens of times the resolution of his theodolite. The equal-area triangle drawn below carries the same excess; the area-law and the measurement agree to a hundredth of an arcsecond.",
  "k": "x:7e096bc2"
 },
 {
  "t": "h2",
  "html": "03 · The great arcs: surveying the size — and the flattening",
  "k": "b51565e1"
 },
 {
  "t": "notes",
  "html": "Measure a long north–south chain of triangles, fix its ends astronomically, and you get the length of one degree of latitude. Do it at different latitudes and you get not just the size of the planet but its <em>shape</em>: a degree is longer near the poles — the signature of the oblate spheroid Newton predicted from rotation.",
  "k": "3658611d"
 },
 {
  "t": "formula",
  "k": "sv-fx-arc",
  "fig": "survFxArcs",
  "lines": [
   {
    "tex": "M(\\varphi) = \\frac{\\pi}{180}\\,\\frac{a(1-e^2)}{(1-e^2\\sin^2\\varphi)^{3/2}}",
    "fallback": "M(φ) = (π/180) · a(1 − e²) / (1 − e² sin²φ)^{3/2}"
   },
   {
    "tex": "e^2 = 1 - \\left(\\frac{M_0}{M_{90}}\\right)^{2/3},\\qquad a = \\frac{180}{\\pi}\\,\\frac{M_0}{1 - e^2},\\qquad f \\approx \\frac{e^2}{2}",
    "fallback": "e² = 1 − (M₀/M₉₀)^{2/3},  a = (180/π)·M₀/(1 − e²),  f ≈ e²/2"
   },
   {
    "tex": "M_0 = 110.574\\ \\text{km},\\ M_{90} = 111.694\\ \\text{km} \\;\\Rightarrow\\; a = 6378\\ \\text{km},\\ f = 1/298",
    "fallback": "M₀ = 110.574 km, M₉₀ = 111.694 km ⇒ a = 6,378 km, f = 1/298"
   }
  ],
  "gloss": "M(φ): length of one degree of latitude at latitude φ, measured along the meridian · a: equatorial radius · e: eccentricity · f: flattening · on a sphere M is the same everywhere (111.2 km); on a plane the astronomical latitude would not change at all along a straight chain"
 },
 {
  "t": "raw",
  "html": "<table class=\"cnav-table\"> <caption>The classic arc measurements (simplified) · one degree of meridian: 110.57 km at the equator → 111.69 km at the poles</caption> <thead><tr><th>Years</th><th>Arc</th><th>What it established</th></tr></thead> <tbody> <tr><td>1615</td><td style=\"text-align:left\">Snellius, Alkmaar–Bergen op Zoom — the first triangulation chain</td><td style=\"text-align:left\">The method itself: a degree from 33 triangles and one baseline</td></tr> <tr><td>1669–70</td><td style=\"text-align:left\">Picard's Paris arc</td><td style=\"text-align:left\">The degree Newton used to check universal gravitation</td></tr> <tr><td>1736–44</td><td style=\"text-align:left\">Lapland (Maupertuis) &amp; Peru (La Condamine) — Paris Academy expeditions</td><td style=\"text-align:left\">A polar degree is longer: Earth is flattened, settling Newton vs Cassini<sup class=\"ref\"><a href=\"#s-surv-n12\">[12]</a></sup></td></tr> <tr><td>1792–98</td><td style=\"text-align:left\">Dunkirk–Barcelona (Delambre &amp; Méchain), through revolutionary France</td><td style=\"text-align:left\">The quarter-meridian whose ten-millionth part <b>defined the metre</b></td></tr> <tr><td>1816–55</td><td style=\"text-align:left\">Struve Geodetic Arc — 2,820 km, Hammerfest to the Black Sea, 258 triangles, 10 modern countries</td><td style=\"text-align:left\">First accurate long meridian segment; UNESCO World Heritage since 2005<sup class=\"ref\"><a href=\"#s-surv-n8\">[8]</a></sup></td></tr> <tr><td>1802–71</td><td style=\"text-align:left\">Great Trigonometrical Survey of India (Lambton, then Everest) — ~2,400 km arc</td><td style=\"text-align:left\">Sub-continental network; incidentally measured the Himalaya, including Peak XV</td></tr> <tr><td>1936–62</td><td style=\"text-align:left\">Retriangulation of Great Britain — 6,500+ concrete trig pillars<sup class=\"ref\"><a href=\"#s-surv-n9\">[9]</a></sup></td><td style=\"text-align:left\">A national datum (OSGB36); every triangle carrying its excess</td></tr> </tbody> </table>",
  "k": "x:0fe2988d"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>The metre in your ruler is a piece of the curve.</b> The 1791 definition — one ten-millionth of the pole-to-equator meridian<sup class=\"ref\"><a href=\"#s-surv-n10\">[10]</a></sup> through Paris — means the original metre <em>is</em> a surveyed measurement of Earth's curvature, fought for over seven years of triangulation through a revolution. Every later redefinition (prototype bar, krypton wavelength, light-second fraction) was chosen to preserve that length.",
  "k": "f5f34b7c"
 },
 {
  "t": "h2",
  "html": "04 · Curvature as an engineering constraint",
  "k": "555402e8"
 },
 {
  "t": "notes",
  "html": "When the stakes are measured in billions, nobody gets to \"assume\" a shape. Three projects that had to <em>build against</em> R:",
  "k": "a4ca135f"
 },
 {
  "t": "raw",
  "html": "<table class=\"cnav-table\"> <caption>Engineering projects where Earth's curvature entered the blueprints</caption> <thead><tr><th>Project</th><th>Scale</th><th>The curvature fact</th></tr></thead> <tbody> <tr><td style=\"text-align:left\"><b>Peak XV (Everest), 1852</b><br>Great Trigonometrical Survey</td> <td>stations 160–240 km away</td> <td style=\"text-align:left\">Vertical angles from six distant stations, corrected for curvature, refraction (minutes of arc!) and plumb-line deflection, computed by Radhanath Sikdar's team to 29,002 ft — within 0.1% of today's 29,032 ft, without anyone climbing anything</td></tr> <tr><td style=\"text-align:left\"><b>SLAC linear accelerator, 1962</b><br>Stanford / U.S. DOE</td> <td>3.2 km, dead straight</td> <td style=\"text-align:left\">Laser-aligned straight to ~0.5 mm over two miles — while a straight 3.2 km line departs from the <em>level</em> surface by ~20 cm end-to-middle. \"Straight\" and \"level\" split apart at accelerator tolerances; the builders had to choose straight, on purpose<sup class=\"ref\"><a href=\"#s-surv-n5\">[5]</a></sup></td></tr> <tr><td style=\"text-align:left\"><b>LIGO gravitational-wave detectors, 1990s</b><br>Caltech / MIT / NSF</td> <td>two 4 km straight arms</td> <td style=\"text-align:left\">LIGO's own fact sheet: over each 4 km arm \"the Earth curves away by nearly a meter\", so the slab was earth-moved<sup class=\"ref\"><a href=\"#s-surv-n2\">[2]</a></sup> and precision-poured to keep the laser straight while the level ground fell away; the published alignment paper computed every design height on the WGS-84 ellipsoid — a straight line varies ~1.25 m in ellipsoidal height over the 4 km baseline</td></tr> <tr><td style=\"text-align:left\"><b>Gotthard Base Tunnel, 1999–2016</b><br>AlpTransit / ETH Zürich</td> <td>57 km through the Alps</td> <td style=\"text-align:left\">GPS fixed the portals; gyrotheodolites (north to 0.001°) steered underground; gravity anomalies and deflections of the vertical were corrected explicitly. Final breakthrough error: <b>8 cm horizontal, 1 cm vertical</b><sup class=\"ref\"><a href=\"#s-surv-n6\">[6]</a></sup> — impossible arithmetic on any flat model</td></tr> </tbody> </table>",
  "k": "x:9a6aa191"
 },
 {
  "t": "notes",
  "html": "<b>And the professional version of this page's first tab:</b> in trigonometric levelling, two stations observe each other's zenith angle simultaneously. On a plane the two angles must sum to exactly 180°; on the sphere they sum to 180° + the arc between the stations — for 30 km, an excess of <b>16.2′</b>, enormous by theodolite standards, measured in every reciprocal campaign since the 1800s and the standard way refraction itself is calibrated (Gauss's k ≈ 0.13 comes from exactly such data<sup class=\"ref\"><a href=\"#s-surv-n7\">[7]</a></sup> in his Hanover network). The Elevation-angles tab computes this same number from the amateur side.",
  "k": "2e7c8282"
 },
 {
  "t": "h2",
  "html": "05 · A field guide to the methods — written for the skeptical reader",
  "k": "6621ff19"
 },
 {
  "t": "notes",
  "html": "If you doubt the globe, the best reading list is not debate videos — it is the <b>training manuals</b>. They are not persuasion documents; they are instructions for getting jobs done by people who are liable when heights and boundaries come out wrong, and every one of them contains steps that exist only because of R. Here is the map of where to look. For each method: what the manual instructs, and whether the step <b>accounts for</b> the curvature (builds it in) or outright <b>measures</b> it. The test is always the same — delete the curve from the procedure and the numbers stop closing.",
  "k": "2dd0b26f"
 },
 {
  "t": "raw",
  "html": "<table class=\"cnav-table\"> <caption>Professional methods, and exactly where the curve enters — every source is a training or reference document</caption> <thead><tr><th>Method</th><th>What the manual instructs</th><th>Accounts / measures</th></tr></thead> <tbody> <tr><td style=\"text-align:left\"><b>Differential levelling,<br>balanced sights</b></td> <td style=\"text-align:left\">NOAA Manual NOS NGS 3 (<em>Geodetic Leveling</em>), Figure 3-8, states it verbatim: curvature error <em>c</em> \"cancels if s<sub>B</sub> = s<sub>F</sub><sup class=\"ref\"><a href=\"#s-surv-n1\">[1]</a></sup>\" — keep back-sight equal to fore-sight and the curve subtracts itself out of every setup</td> <td style=\"text-align:left\"><b>Accounts</b> — by designed cancellation, thousands of times per line</td></tr> <tr><td style=\"text-align:left\"><b>River &amp; valley crossings<br>(unbalanced sights)</b></td> <td style=\"text-align:left\">When sights can't be balanced, NGS's supplement to the same manual prescribes an observing routine that corrects \"atmospheric refraction, Earth's curvature, pointing and collimation\" explicitly — the correction that usually cancels is applied by formula instead</td> <td style=\"text-align:left\"><b>Accounts</b> — explicit c&amp;r correction</td></tr> <tr><td style=\"text-align:left\"><b>Reciprocal zenith angles<br>(trigonometric levelling)</b></td> <td style=\"text-align:left\">Two stations observe each other simultaneously; the angle sum exceeds 180° by the arc between them (16.2′ per 30 km) and the leftover scatter calibrates the refraction coefficient k ≈ 0.13 — Gauss did exactly this in Hanover</td> <td style=\"text-align:left\"><b>Measures</b> — the excess IS the curvature</td></tr> <tr><td style=\"text-align:left\"><b>Triangulation adjustment<br>(spherical excess)</b></td> <td style=\"text-align:left\">Every large triangle's angles are checked against 180° + Area/R²; Legendre's classical rule — subtract one third of the excess from each measured angle, then solve as a plane triangle — has been the standard workflow since the 1800s</td> <td style=\"text-align:left\"><b>Both</b> — measured per triangle, then budgeted out</td></tr> <tr><td style=\"text-align:left\"><b>Distance reduction:<br>\"grid vs ground\"</b></td> <td style=\"text-align:left\">Every EDM or GNSS distance is multiplied by an <em>elevation factor</em> R/(R+h) — reducing the measurement down to the ellipsoid — and a <em>grid scale factor</em> onto the map projection; open surveying course texts and provincial technical bulletins walk licensure candidates through the arithmetic, with R = 6,371,000 m sitting in the denominator of every job</td> <td style=\"text-align:left\"><b>Accounts</b> — R is in the formula on every project</td></tr> <tr><td style=\"text-align:left\"><b>Map projections &amp;<br>State Plane zones</b></td> <td style=\"text-align:left\">Snyder's USGS <em>Map Projections — A Working Manual</em> (PP 1395) is the standard reference: a curved surface cannot be flattened without distortion, so projections manage it and zones are sized to cap the error — the very existence of projection zones is curvature bookkeeping</td> <td style=\"text-align:left\"><b>Accounts</b> — the whole discipline exists because of it</td></tr> <tr><td style=\"text-align:left\"><b>GNSS heights:<br>ellipsoid vs geoid</b></td> <td style=\"text-align:left\">Every GPS fix returns height above the WGS-84 <em>ellipsoid</em>; NGS procedure requires applying a geoid model to obtain the orthometric height a level would give — two different \"heights\" that only both exist on a curved, rotating planet with a gravity field</td> <td style=\"text-align:left\"><b>Measures</b> — in every RTK fix, everywhere, daily</td></tr> </tbody> </table>",
  "k": "x:88306943"
 },
 {
  "t": "raw",
  "tag": "p",
  "class": "rate-note",
  "id": "",
  "html": "<p class=\"rate-note\">A fair challenge for any flat model: reproduce one row. Write the flat-earth levelling manual in which balancing sight distances buys nothing, the flat reduction formula with no R in it that still matches every EDM baseline, or the flat projection with no distortion to manage — and explain why the actual manuals, written by people with no stake in cosmology, all contain the curve.</p>",
  "k": "x:de2b16e7"
 },
 {
  "t": "h2",
  "html": "06 · Modern practice, same curve",
  "k": "9fcb577c"
 },
 {
  "t": "notes",
  "html": "Today the National Geodetic Survey and its counterparts maintain the reference frame with GNSS networks, and heights still come from geodetic levelling tied to the geoid — the level surface itself. Datums are defined on an ellipsoid because centimetre-level measurements leave no other option; \"ellipsoid height\" vs \"orthometric height\" is a distinction that only exists on a curved, rotating planet with a gravity field. Surveyors are, in a precise sense, the profession that measures the flat-earth question every working day — and files the answer as routine paperwork.",
  "k": "afa9f7a2"
 },
 {
  "away": "xp-surv-7",
  "t": "exp",
  "h": "Experiment 7 · levelling across water",
  "title": "Rent an auto level, find a calm lake or canal, and re-run Wallace yourself",
  "lead": "Set a levelled instrument at the shore, sight a graduated staff (or a marked board on a boat) at increasing distances across the water. Water is the level surface; your sightline is the tangent. Record the reading vs distance — or use Wallace's stronger design: three equal-height markers and one sight line.",
  "iv": "<span class=\"vartag iv-t\">Independent variable</span><br> <b>What you change:</b> the <b>sight distance d</b> — 200 m, 500 m, 1 km, 2 km, as far as optics allow.",
  "dv": "<span class=\"vartag dv-t\">Dependent variable</span><br> <b>What you measure:</b> how far the staff reading sits <b>above</b> the instrument's height — the drop of the level surface below the tangent line (or the mid-marker's rise above the end-to-end line).",
  "meta": [],
  "inputs": [],
  "out": "exp7out",
  "verdict": "exp7v",
  "k": "x:01656e9c"
 },
 {
  "t": "h2",
  "html": "The laser, considered as an instrument",
  "k": "sv-h2laser"
 },
 {
  "t": "notes",
  "html": "<b>A laser fails on beam width before it fails on refraction, and that part is arithmetic.</b> A hand-held pointer diverges by one to two milliradians, a surveyor's rotary laser ten times less. At divergence θ the beam is θd wide at range d, so the reading is uncertain by half that either way, while the drop being looked for is d²/2R. Their ratio is <b>d / θR</b>, independent of the beam's width at the muzzle. With a 1 mrad pointer the drop does not even equal the beam's half-width until <b>6.4 km</b>, and at 10 km, where the drop is 7.9 m, the beam is 10 m across: the instrument's own blur is the size of the effect.",
  "k": "sv-laser1"
 },
 {
  "t": "notes",
  "html": "<b>And the spreading is not symmetric in its consequences.</b> A beam aimed level from 1.5 m above water is 5 m tall at 5 km, so its lower edge is skimming the surface — the one layer where the temperature gradient is steepest and where ducting occurs. Whatever the centre of the beam does, some ray in it always takes the most strongly bent path available, and that is the ray that arrives. The Brighton test over the sea is the documented case: at the Worthing end its own operators logged the air just above the water half a degree cooler than at 0.5 to 1.5 m, and another degree warmer at 2 m, and still read the beam's arrival as geometry (worked through in the Refraction tab)<sup class=\"ref\"><a href=\"#s-surv-n13\">[13]</a></sup>.",
  "k": "sv-laser2"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>The remedy is not a better laser.</b> The question these tests ask — does a horizontal line of sight stay the same height above the surface — needs no beam at all. Three marks at equal height above still water answer it, which is Wallace's 1870 design, and Rainy Lake answered it again in 2018 with targets on ice and a licensed surveyor's differential GPS. A target has no divergence, sits where it is put, and can be measured by someone else afterwards. <em>Adding a laser adds two failure modes and no information</em><sup class=\"ref\"><a href=\"#s-surv-n14\">[14]</a></sup>.",
  "k": "sv-laser3"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>The correction is not a historical curiosity; it is a checkbox in the firmware of every instrument sold.</b> Sokkia, Topcon, Leica, Nikon and Trimble all ship total stations whose manuals carry the same pair of terms and the same switch to enable them: subtract d²/2R for the curve, add back k·d²/2R for refraction<sup class=\"ref\"><a href=\"#s-surv-n15\">[15]</a></sup>. A surveyor turning that setting on is not endorsing a cosmology. They are stopping their instrument from being wrong by 8 cm at a kilometre, which is the whole of the argument on this page, sold as a menu item.",
  "k": "sv-koz1"
 },
 {
  "t": "notes",
  "html": "<b>And the reciprocal-angle measurement has been made at ninety kilometres, by a federal agency, on purpose.</b> In 1977 a crew surveyed seven lines radiating from station BALDY on Mount Livermore, Texas — 70 to 92.8 km — measuring distances by EDM and observing <em>simultaneous</em> reciprocal zenith distances at both ends, day and night. The sum of a reciprocal pair measures how far the two plumb lines have splayed apart: γ, and nothing else. The scheme is a NOAA technical report; the crew's own account was put online by the surveyor Jesse Kozlowski<sup class=\"ref\"><a href=\"#s-surv-n16\">[16]</a></sup>. It is the quantity the celestial-theodolite tab reads from a star, measured forty years earlier with a Wild T-3.",
  "k": "sv-koz2"
 },
 {
  "t": "notes",
  "html": "<b>A worked case, with both ends read at the same instant.</b> In 1977 the National Geodetic Survey observed seven lines around the McDonald Observatory in Texas, 32 to 93 km long, with the two theodolites reading <em>simultaneously</em> and the line of sight everywhere more than 30 m above the ground — out of the layer where refraction goes wild. On a plane the two verticals are parallel, so the two zenith angles must sum to <b>exactly 180°</b>, with no parameter to adjust. They do not. The sum exceeds 180° in every line, by 16′ at 32 km and by 45′ at 93 km, and it grows with distance.",
  "k": "sv-zen1"
 },
 {
  "t": "table",
  "id": "sv-tabZen",
  "tbody": "",
  "caption": "The published zenith angles are the only input; every column after the second is recomputed here and agrees to the third decimal with Walter Bislin's independent evaluation<sup class=\"ref\"><a href=\"#s-surv-n17\">[17]</a></sup>. Globe k is the refraction coefficient needed to explain the excess if the verticals diverge by s/R; plane k is what it takes if they do not, and the last column is the temperature gradient that plane k demands.",
  "head": [],
  "k": "x:sv-cap-zen"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>Read the last two columns together.</b> On a globe the excess is the divergence of the verticals minus a small refraction term, and solving for that term gives k between 0.084 and 0.115 — ordinary standard refraction, the same value the refraction tab derives from a lapse rate of a few degrees per kilometre. On a plane the whole excess has to be refraction, and refraction of the wrong sign: light bending <em>upward</em>, k ≈ −0.89, which needs air that gets denser with height. The temperature gradient required is about −205 °C per kilometre. Starting from 15 °C at the ground, that reaches absolute zero <b>1.4 km up</b>, and it would have to hold at every altitude and over every one of the seven lines at once.",
  "k": "sv-zen2"
 },
 {
  "t": "notes",
  "html": "<b>Every reciprocal pair returns a radius, so ask all of them at once.</b> The relation needs no extra assumption: ζ₁ + ζ₂ − 180° = (1 − k)·d/R. Divide the distance by the excess and you have the <em>apparent</em> radius, the one an instrument reads before any correction; multiply by 1 − k and you have the geometric one. Thirty-two pairs are on file here — the seven NGS lines above and twenty-five from the transcontinental triangulation of 1900, spanning 18 to 157 km<sup class=\"ref\"><a href=\"#s-surv-n18\">[18]</a></sup>. <b>A plane predicts no radius at all:</b> it needs the sum to be 180° exactly, which puts R at infinity.",
  "k": "sv-rad1"
 },
 {
  "t": "raw",
  "tag": "p",
  "class": "reads",
  "id": "sv-readR",
  "html": "<p class=\"reads\" id=\"sv-readR\"></p>"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"sv-figR\"></div> <div class=\"fcap\">The same thirty-two pairs, read twice. Uncorrected they cluster near 7,150 km, about 12 % high — and that excess is not noise, it is refraction: R/(1 − k) is the effective radius the refraction tab derives from a temperature gradient, arrived at here from theodolites instead. Apply the page's one standard coefficient and the median lands within a few per cent of 6,371 km. Neither box goes anywhere near infinity, which is the only value a plane allows.</div> </div>",
  "k": "x:sv-rad2"
 },
 {
  "t": "h2",
  "html": "The radius from the instruments alone: no map, no k",
  "k": "sv-h2rapp"
 },
 {
  "t": "notes",
  "k": "sv-rapp1",
  "html": "<b>Two theodolites and a distance meter are enough, provided one gives up correcting for the air.</b> The radius above divides the excess into distances that, for the 1900 lines, had been reduced to sea level on the spheroid, then multiplies by a k that was itself measured with the radius known. Remove both. For the seven McDonald lines, the surveyor Jesse Kozlowski's compilation lists the distance the laser rangefinder actually measured beside the straight chord between the stations' published coordinates. The two agree within 7 cm on every line, where a reduction to sea level would have shortened the measured value by 11 to 35 m: these are raw slope distances<sup class=\"ref\"><a href=\"#s-surv-n19\">[19]</a></sup>. What remains is a length measured on the ground, two angles each read from a local plumb line, and the heights of the stations. The radius enters nowhere."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "sv-fx-rapp",
  "fig": "svFxRapp",
  "lines": [
   {
    "tex": "\\varepsilon = \\zeta_1 + \\zeta_2 - 180\\deg",
    "fallback": "ε = ζ₁ + ζ₂ − 180°"
   },
   {
    "tex": "\\g{\\rho = \\frac{s}{\\varepsilon} - \\bar h}",
    "fallback": "ρ = s/ε − h̄"
   },
   {
    "tex": "R = (1-k)\\,\\rho \\le \\rho \\quad\\text{if } k \\ge 0",
    "fallback": "R = (1 − k) ρ ≤ ρ if k ≥ 0"
   }
  ],
  "gloss": "ε is the angle between the two plumb lines, read directly as the excess of the two zenith angles over 180°; s is the EDM distance; h̄ the mean height of the stations (the radius is solved exactly from the chord, both heights included, which differs from s/ε − h̄ by under 1 km). ρ is the radius of the sphere on which those two plumb lines and that chord fit: the <em>apparent</em> radius. It is not R. Refraction lifts each far station, lowers both zenith angles and removes kε from the excess, so ρ = R/(1 − k). Leaving k out cannot create a curvature that is not there; it can only misstate its size."
 },
 {
  "t": "table",
  "id": "sv-tabRapp",
  "tbody": "sv-tbRapp",
  "k": "x:sv-cap-rapp",
  "caption": "The seven McDonald lines, without k. EDM − chord compares the measured distance with the straight line between the stations' coordinates; the coordinates serve that comparison only, never the radius.",
  "head": [
   "BALDY →",
   "EDM distance",
   "EDM − chord",
   "ε",
   "Apparent radius ρ"
  ]
 },
 {
  "t": "raw",
  "tag": "p",
  "class": "reads",
  "id": "sv-readRapp",
  "html": "<p class=\"reads\" id=\"sv-readRapp\"></p>"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "k": "x:sv-rapp-fig",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"svFigRapp\"></div> <div class=\"fcap\">Forty-five pairs, no correction. The seven McDonald lines, 32 to 93 km long and everywhere more than 30 m above the ground, give 6,953 to 7,199 km: about 12 % above 6,371, the size a k near 0.1 produces. Kozlowski's thirty-eight total-station lines, 70 m to 1.6 km long and read 1.5 m above the ground, scatter from 1,200 to 7,800 km around a median of 4,400: there k is often negative and the apparent globe is smaller<sup class=\"ref\"><a href=\"#s-surv-n19\">[19]</a></sup>. Every one of the 45 sums exceeds 180°.</div> </div>"
 },
 {
  "t": "callout",
  "flat": false,
  "k": "sv-rapp2",
  "html": "<b>What follows without knowing k.</b> Refraction raises the far station only while the air thins with height, that is while the temperature falls by less than 34 °C per kilometre, the rate beyond which air is denser above than below and overturns on its own. Then k ≥ 0 and R = (1 − k)ρ cannot exceed ρ. Steeper gradients exist in the first metres over sun-warmed ground, which is where Kozlowski's lines run and why they bound nothing. Along the McDonald lines, more than 30 m up and 32 to 93 km long, they cannot hold from end to end. So the theodolites alone, backed only by a measured length and measured heights, say: <b>the surface is convex, with a radius of at most about 7,000 km</b>. A bigger globe than the real one, if one refuses every correction, but a globe."
 },
 {
  "t": "callout",
  "flat": true,
  "k": "sv-rapp3",
  "html": "<b>The plane, given its best chance.</b> Its free parameter is the air. To return these sums it needs light bending upward along all seven lines at once, k ≈ −0.9: air denser at height, the temperature falling by about 205 °C per kilometre (table above). <b>What would vindicate it:</b> a long line, well above the ground, read from both ends at once, whose sum stays at 180° or below. None is on file here: of 45 pairs, 45 exceed 180°."
 },
 {
  "t": "notes",
  "k": "sv-rapp4",
  "html": "<b>What this does not do.</b> It gives ρ, not R: without the temperature gradient along each line, which nobody recorded, k stays unknown and only the bound survives. The theodolites read the plumb lines, which in mountains lean by up to some tens of arcseconds toward the masses; a 20″ difference between the two ends of the 32 km line would move its ρ by 2 %. Whether the 1977 distances received the “second velocity correction” cannot be read from the scan: it uses k and R, and at 93 km it amounts to at most 0.2 m, two parts per million. The 1977 angles and distances are Kozlowski's transcription of a scanned report. On the short lines, rounding each angle to 1″ is a third of a 5″ excess, and much of their spread is that."
 },
 {
  "t": "h2",
  "html": "Sixteen hundred triangles on three continents: the curvature from their angles alone",
  "k": "sv-h2tri"
 },
 {
  "t": "notes",
  "k": "sv-tri1",
  "html": "<b>Gauss's test, run on whole surveys.</b> Section 02 draws one triangle and computes its excess. Here the excess is read, in the angles as the observers wrote them down: the U.S. Coast and Geodetic Survey's arc along the 39th parallel and its Eastern Oblique Arc<sup class=\"ref\"><a href=\"#s-surv-n18\">[18]</a></sup><sup class=\"ref\"><a href=\"#s-surv-n20\">[20]</a></sup>, Delambre and Méchain's meridian from Dunkirk to Barcelona<sup class=\"ref\"><a href=\"#s-surv-n22\">[22]</a></sup>, Maclear's arc at the Cape of Good Hope<sup class=\"ref\"><a href=\"#s-surv-n23\">[23]</a></sup>, Roy's chain from Greenwich towards Paris<sup class=\"ref\"><a href=\"#s-surv-n24\">[24]</a></sup> and the southern half of Struve's arc, from the Gulf of Finland to the Danube<sup class=\"ref\"><a href=\"#s-surv-n25\">[25]</a></sup>. We transcribed every triangle from the scans, page by page: 1,601 of them. Every printed check had to hold on what we read (sums, corrections, logarithms of the sides, the sine rule), or the triangle is a misprint, verified on the page image and set aside, about twenty of them; triangles with a concluded angle, whose sum is forced, never count. On a sphere of radius R the three angles of a triangle add up to 180° plus its area divided by R²<sup class=\"ref\"><a href=\"#s-surv-n21\">[21]</a></sup>; on a plane they add up to 180° whatever its size."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "sv-fx-tri",
  "fig": "svFxTri",
  "lines": [
   {
    "tex": "\\varepsilon = \\alpha_1 + \\alpha_2 + \\alpha_3 - 180\\deg",
    "fallback": "ε = α₁ + α₂ + α₃ − 180°"
   },
   {
    "tex": "\\g{\\varepsilon = \\frac{A}{R^2}}",
    "fallback": "ε = A/R²"
   },
   {
    "tex": "\\frac{1}{R^2} = \\frac{\\sum \\varepsilon A}{\\sum A^2}",
    "fallback": "1/R² = Σ εA / Σ A²"
   }
  ],
  "gloss": "α₁, α₂, α₃ are the angles observed at the three stations and ε their excess over 180° (in radians in the second line); A is the triangle's area. The least-squares line through zero gives 1/R². The areas use no radius: each length is carried from a measured base line through the triangles with the observed angles alone, as plane triangles, then Heron's formula. Where a concluded or misprinted angle breaks the chain, 180° minus the two sound angles carries the length on; that triangle never enters the fit."
 },
 {
  "t": "raw",
  "tag": "p",
  "class": "reads",
  "id": "sv-readTri",
  "html": "<p class=\"reads\" id=\"sv-readTri\"></p>"
 },
 {
  "t": "table",
  "id": "sv-tabTri",
  "tbody": "sv-tbTri",
  "k": "x:sv-cap-tri",
  "caption": "The radius survey by survey. Range: 16 to 84 % of a bootstrap over printed pages (∞: a flat surface is not excluded). r: correlation of the excess with the area, which needs no model (a plane gives r near 0, a sphere near 1). Scatter: the residuals around the line, in seconds of arc; the volumes print no reading error independent of their adjustment, so no χ²/ν is given. Plane: how much larger the flat model's residuals are (χ² ratio), with its best constant offset.",
  "head": [
   "Survey",
   "Triangles",
   "R",
   "Range",
   "r",
   "Scatter",
   "Plane"
  ]
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "k": "x:sv-tri-fig",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"svFigTri\"></div> <div class=\"fcap\">Each dot is a triangle, coloured by survey: its observed excess against the square root of its area, roughly its side. The globe's curve is the fitted ε = A/R²; the dashed line is the flat model's best case, a constant offset added to every triangle, which cannot follow the size. The largest triangle, Mount Nebo – Tushar – Wheeler Peak in Utah and Nevada, covers 14,524 km² and exceeds 180° by 75.3″.</div></div>"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "k": "x:sv-tri-maps",
  "html": "<div class=\"fig\"><div class=\"cnav-grid\"><canvas id=\"svTriGlobe\"></canvas><canvas id=\"svTriFlat\"></canvas></div> <div class=\"fcap\">The same triangles where the surveys' printed positions put them (Roy and Struve print none; where Delambre's printed positions contradict his own sides, the triangle is left out), on the globe and on the azimuthal map centred on the North Pole that flat-Earth maps use. The positions only draw the figure; they enter no number above. On the flat map, with its one scale set as favourably as possible, each side is coloured by its length on the map divided by its measured length: north–south sides come out about 11 % short everywhere, east–west sides up to 7 % long in the United States and more than twice their length at the Cape.</div></div>"
 },
 {
  "t": "callout",
  "flat": false,
  "k": "sv-tri2",
  "html": "<b>What the angles say.</b> The excess grows with the area, as on a sphere: 0.3″ on average for triangles of about 50 km², 1″ around 200 km², 2.5″ around 500 km², 8″ around 1,700 km², 35″ for the mountain-top triangles of about 7,000 km² in the American West. One line through zero fits them all, in Maine and in California, at the Cape and in Livonia, and its slope gives the radius above. Nothing in the data told the triangles how big the Earth is: the angles were read on the instruments, the lengths come from base lines measured with rods and bars on the ground."
 },
 {
  "t": "callout",
  "flat": true,
  "k": "sv-tri3",
  "html": "<b>The plane, given its best chance.</b> A plane has no curvature to adjust, but the observers could have had a habit: a constant error in every sum. Fitted as favourably as possible, that offset comes to about +4″ for every triangle, small and large alike; it gives the small triangles too much and the large ones far too little, and leaves residuals about six times larger than the globe's line (reading above). A flat map does no better with the lengths: whatever its scale, it cannot lay the measured sides of the United States and of the Cape on one sheet (figure above). <b>What would vindicate it:</b> angle sums that stay at 180° whatever the size of the triangle, or an excess that does not grow with the area."
 },
 {
  "t": "notes",
  "k": "sv-tri4",
  "html": "<b>What this does not do.</b> The surveys do not weigh the same. Schott's large western triangles fix the radius; Struve's and Maclear's agree within their spread; Delambre's, small (280 km² on average) and whose sums scatter by about 1.8″ around the line, come out low, 5,364 km; Roy's twelve usable triangles of the 1780s are too small for his angles, read to the second, and only bound the radius from below. The observed angles were first balanced at each station, which uses no figure of the Earth; the corrections that close each triangle on a spheroid are not used. The base lines are printed reduced to sea level, a correction of about one part in a million that uses the radius: the one place it enters, worth a few metres on R. Triangles that share stations are not independent, so each range is a bootstrap that resamples whole printed pages. Plumb lines leaning toward mountains, and the observers' habits, leave a small constant offset, −0.06″ when fitted on all the surveys; with it the radius comes to 6,373 km instead of 6,383. For comparison only, the mean radius of curvature of the ellipsoid is 6,371 to 6,376 km between 35° and 42° N, 6,367 to 6,370 km at the Cape and 6,387 km at 58° N."
 },
 {
  "t": "xrefs",
  "keys": [
   "dist",
   "dip",
   "grav",
   "gps",
   "azim",
   "elev"
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
  "html": "<div class=\"srcs reading\"><b class=\"h\">Further reading</b> <div class=\"note\">Not cited above, and no claim on this tab rests on it — listed because it is what you would read next, or because it lets you redo the measurement on data this page did not choose.</div> <ul> <li id=\"s7-r1\"><a href=\"https://www.himalayanclub.org/hj/17/14/mount-everest-its-name-and-height\">The Himalayan Journal — \"Mount Everest: its name and height\"</a>: the 1849–50 observations, the 1852 computation, and the refraction and plumb-line-deflection corrections behind 29,002 ft.</li> <li><a href=\"https://jessekozlowski.wordpress.com/2020/06/09/reciprocal-zenith-angle-projects/\">Reciprocal zenith angle projects</a> — sixteen of them, with the raw sets of direct and reverse readings tabulated, several evaluated independently by Walter Bislin in <a href=\"http://walter.bislins.ch/bloge/index.asp?page=Determining+the+Shape+of+the+Earth+with+Zenith+Angle+Measurements\">Determining the shape of the Earth with zenith angle measurements</a>. Amateur and professional observations mixed, published with their numbers rather than their conclusions, which is the rarest thing in this whole argument.</li> <li id=\"s7-r2\"><a href=\"https://walter.bislins.ch/bloge/index.asp?page=Proof+of+Earth+Curvature%3A+The+Rainy+Lake+Experiment\">The Rainy Lake experiment (2018)</a> — Wallace's three-marker design repeated on a frozen lake with every target position fixed to centimetres by differential GPS by a licensed surveyor; the measured surface radius comes out near 6,400&nbsp;km. The modern answer to “your telescope was miscalibrated”.</li> <li id=\"s7-r3\"><a href=\"https://www.suezcanal.gov.eg/English/About/SuezCanal/Pages/CanalCharacteristics.aspx\">Suez Canal Authority — canal characteristics</a> — the lock-free length routinely cited as proof of a flat sea. It is the opposite: a canal is dug to a <em>level</em>, and a level surface is an equipotential, not a plane. A straight chord between the ends would run hundreds of metres below the water at the midpoint.</li> <li id=\"s7-r4\"><a href=\"http://www.helbronner.org/IMG/pdf/BSSHNC_730-733_Art-_Palmieri_cle8a7d81.pdf\">J. Palmieri on Helbronner's Corsica junction (2010)</a> — the source for the two longest triangle sides in the list above: the 1879 Spain–Algeria junction of Perrier and Ibáñez, and Helbronner's own 1925 Coudon–Monte Cinto side of 255.6&nbsp;km. Both are worked through from the observer's end in tab&nbsp;1.</li> <li><b>IGN — RGF93 and the NGF-IGN69 levelling network.</b> The French equivalents of the NOAA and Ordnance Survey references above: a national horizontal datum computed on an ellipsoid, and a national height system referred to a geoid. For a French reader, the nearest place to check that their own country's survey works the way this tab says surveys work.</li> <li><a href=\"https://geodesy.noaa.gov/CORS/data.shtml\">NOAA NGS — CORS data and products</a>. Continuously operating reference stations, with the raw observation files public. The modern successor to the triangulation networks in the table above, and still solving the same geometry.</li> </ul> </div>",
  "k": "x:rd-more"
 }
];
