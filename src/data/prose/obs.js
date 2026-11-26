// Prose de l'onglet obs, extraite VERBATIM et dans l'ordre du panneau
// legacy par research/extract_prose.py (EN). Rendue par src/core/prose.js.
export const PROSE = [
 {
  "t": "notes",
  "html": "This tab is not translated yet: it stays in English in every language. Its ephemeris is validated — Sun and Moon to better than 35″ against libastro over 42 dates in 2026–27<sup class=\"ref\"><a href=\"#s-obs-n2\">[2]</a></sup> — and the flat model in the panel covers azimuth only.",
  "k": "obs-1"
 },
 {
  "t": "eyebrow",
  "html": "Observation · predict first, photograph second",
  "k": "obs-2"
 },
 {
  "t": "h1",
  "html": "Point a camera at a ridge at the right minute",
  "k": "obs-3"
 },
 {
  "t": "xrefs",
  "keys": [
   "ref",
   "elev",
   "hh",
   "dip",
   "sun",
   "twi"
  ],
  "wide": true
 },
 {
  "t": "lead",
  "html": "Every other tab on this page argues from measurements someone else published. This one hands you the instrument. Pick a date and a time, and it draws the Sun or the Moon at its true angular size against a skyline computed two ways from the same terrain — once on a plane, once on a sphere. The two curves separate by a measurable amount at certain azimuths. Go and photograph one of those azimuths at the stated minute, and the photograph decides.",
  "opener": false,
  "k": "obs-4"
 },
 {
  "t": "lead",
  "html": "The Sun makes this cheap. Its disc is <b>32.4′</b> across, known to a fraction of an arcsecond, so a photograph containing both the disc and a ridge <em>calibrates itself</em>: the disc supplies the angular scale inside the frame. No theodolite, no known focal length, no assumption about where eye level was. And azimuth is immune to refraction, which is vertical — so the one prediction the flat map cannot rescue with weather is the one about <em>direction</em>.",
  "opener": false,
  "k": "obs-5"
 },
 {
  "t": "h2",
  "html": "The panel",
  "k": "obs-6"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "panel",
  "id": "",
  "html": "<div class=\"panel\"> <div class=\"cap\"><div class=\"name\"><span class=\"tag\">View</span> Camera — solid = globe, dashed = flat</div></div> <div class=\"reads\" id=\"obsReads\"></div> <canvas id=\"obsCam\" style=\"width:100%;height:clamp(240px,52vw,420px);display:block\"></canvas> <!-- contrôles JUSTE SOUS la vue (2026-09-24) --> <div class=\"obsctl compact\"> <div><label class=\"f\" for=\"obsDate\">Date</label><input type=\"date\" id=\"obsDate\" value=\"2026-11-24\"></div> <div><label class=\"f\" for=\"obsTime\">Local time (CET)</label><input type=\"time\" id=\"obsTime\" step=\"1\" value=\"16:56:33\"></div> <div><label class=\"f\" for=\"obsBody\">Object</label> <select id=\"obsBody\"><option value=\"sun\">Sun</option><option value=\"moon\">Moon</option></select></div> <div><label class=\"f\" for=\"obsLamp\">Flat lamp height <span id=\"obsLampV\">5,000 km</span></label> <input type=\"range\" id=\"obsLamp\" min=\"500\" max=\"20000\" step=\"100\" value=\"5000\"></div> <div><label class=\"f\" for=\"obsFov\">Field of view <span id=\"obsFovV\">4.0°</span></label> <input type=\"range\" id=\"obsFov\" min=\"0.6\" max=\"40\" step=\"0.1\" value=\"4\"></div> <div><label class=\"f\" for=\"obsSpeed\">Playback <span id=\"obsSpeedV\">60×</span></label> <input type=\"range\" id=\"obsSpeed\" min=\"1\" max=\"600\" step=\"1\" value=\"60\"></div> <div><label class=\"f\">Run</label><div class=\"obsrow\"> <button type=\"button\" id=\"obsPlay\">Play</button> <button type=\"button\" id=\"obsBack\">−1 min</button> <button type=\"button\" id=\"obsFwd\">+1 min</button></div></div> <div><label class=\"f\" for=\"obsTrack\">Camera</label> <select id=\"obsTrack\"> <option value=\"real\">Track the real object</option> <option value=\"flat\">Track the flat-model object</option> <option value=\"both\" selected>Frame both</option> <option value=\"fixed\">Fixed on the ridge</option> </select></div> <div><label class=\"f\">Options</label><div class=\"obsrow\" style=\"flex-wrap:wrap\"> <label class=\"obschk\"><input type=\"checkbox\" id=\"obsRefr\" checked> Refraction</label> <label class=\"obschk\"><input type=\"checkbox\" id=\"obsSky\" checked> Skylines</label> <label class=\"obschk\"><input type=\"checkbox\" id=\"obsFilter\"> Solar filter</label> <label class=\"obschk\"><input type=\"checkbox\" id=\"obsFlatSun\" checked> Flat-model object</label></div></div> </div> <div class=\"reads\" id=\"obsReads2\"></div> <div class=\"reads\" id=\"obsCross\"></div> <p class=\"notes\" style=\"max-width:74ch\"><b>This has been done before, and for two centuries.</b> Canigou is photographed from Allauch, 263 km away, silhouetted on the setting Sun around 9 February and 1 November — the dates the sunset azimuth lines up with the peak, exactly as 24 November lines up here. The hidden-height tab carries that case with its filtered view: on a plane the mountain would be a black mass taller than the solar disc, and what is photographed is a notch an eighth of its width. The shoot below is the same measurement, on a shorter line, with the crossing of two crests instead of one summit.</p> <p class=\"notes\" style=\"max-width:74ch\"><b>What the disc will actually be cut by, on 24 November, is the corner where the two ridges meet.</b> That is a stronger tell than either ridge alone, and it needs no eye level at all. The far ridge is nearly horizontal across this window and the near one climbs steeply, so raising the far ridge slides the intersection along the steep branch: the corner sits at a different azimuth in each model, and at a different height. The band above reads both off the same terrain profile the panel draws — <b>about a tenth of a degree of azimuth apart, and about 6′ of altitude</b>, a sixth of a solar diameter sideways and a fifth of one vertically. The panel’s solar-filter view draws exactly what a dense filter shows and nothing else: the disc, and the terrain only where it cuts into it. The plane’s extra ridge is the blue band, the globe’s silhouette the black one, and the two predictions cannot both be where the notch falls.</p>  <div class=\"fcap\"><b>True scale, no exaggeration.</b> The bar at the right is the object's own diameter — the only honest ruler in a panel meant to be held against a photograph. The refraction switch is the page's single <code>k</code>, shared with every other tab; the object itself is refracted by Bennett's formula,<sup class=\"ref\"><a href=\"#s-obs-n3\">[3]</a></sup> which is the same physics integrated over the whole atmosphere rather than one layer.</div> </div>",
  "k": "obs-7"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "panel",
  "id": "",
  "html": "<div class=\"panel\"> <div class=\"cap\"><div class=\"name\"><span class=\"tag\">Map</span> The flat model's own map, seen from above</div></div> <div class=\"reads\" id=\"obsMapReads\"></div> <canvas id=\"obsMap\" style=\"width:100%;height:clamp(300px,82vw,470px);display:block\"></canvas> <ul class=\"figkey\"> <li><span class=\"sw\" data-sw=\"obsteal\"></span><span>the bearing a compass reads at that instant</span></li> <li><span class=\"sw\" data-sw=\"obsamber\"></span><span>the line to the point the Sun stands over, which is what a direction means on a flat world</span></li> <li><span class=\"sw\" data-sw=\"obsgc\"></span><span>the true great-circle path, for context only — do not measure an angle off it</span></li> </ul> <div class=\"fcap\"><b>This is the Gleason azimuthal-equidistant disc</b> — the map flat-earth sources publish, not one invented here to be knocked down. North pole at the centre, Antarctica as the rim, updating with the panel above second for second. Both rays are bearings measured off local north, which on this map is the direction to the centre, so they can be compared. The projection is equidistant from the centre but not conformal — it stretches east–west by about 12 % at this latitude — which is why the great-circle curve is context and not a protractor. The comparison that means something is between the two straight rays and the numbers above them: it needs no instrument beyond a compass, and refraction cannot touch it, being vertical.</div> </div>",
  "k": "obs-8"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "panel",
  "id": "",
  "html": "<div class=\"panel\"> <div class=\"cap\"><div class=\"name\"><span class=\"tag\" style=\"background:#e6f2f0;color:var(--globe)\">Data</span> Targets from this viewpoint</div></div> <table id=\"obsTbl\"><thead><tr> <th>Summit</th><th>Distance</th><th>Above eye</th><th>Flat</th><th>Globe</th><th>Gap</th> </tr></thead><tbody></tbody></table> <div class=\"fcap\"><b>Distance and azimuth are derived, not copied.</b> Each row carries only what a source publishes — name, coordinates, summit height — and the page computes the rest by great circle, so a rounded readout from an app can never enter the arithmetic. Sphere, not ellipsoid: the WGS-84 geodesic differs by 0.3 %, which moves the Grand Mourre answer by 0.08′ out of a 12.7′ effect.<sup class=\"ref\"><a href=\"#s-obs-n4\">[4]</a></sup></div> </div>",
  "k": "obs-9"
 },
 {
  "t": "h2",
  "html": "The crossing: one point that has to be in two places",
  "k": "obs-10"
 },
 {
  "t": "lead",
  "html": "The strongest thing at this viewpoint is not a summit. It is the place where two ridges <em>touch</em>. Sweep left from Mourre Frey<sup class=\"ref\"><a href=\"#s-obs-n5\">[5]</a></sup> and the near ridge at 16 km sinks; sweep right from Le Grand Mourre and the far ridge at 54 km rises to meet it. At azimuth <b>241.29°</b> the two silhouettes cross. Photograph that spot and you have measured nothing — you have only observed that two ridges touch — and yet the flat model is already finished.",
  "opener": false,
  "k": "obs-11"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>The two points that meet are on opposite sides of the observer.</b> The near side of the crossing is ridge <b>C</b> in the table, sixteen metres from PeakFinder's point, at <b>1,683 m</b> on the IGN's LiDAR — seven metres <em>below</em> the viewpoint.<sup class=\"ref\"><a href=\"#s-obs-n4\">[4]</a></sup> The far side, 54 km out, is at <b>1,809 m</b>, 119 m <em>above</em> it. On a plane only height enters the formula: lower than you is below eye level, higher is above, at every distance. So the two points cannot appear at the same height — and they do. <br><br>On a sphere, at k = 0.13, curvature takes 200 m from the far ridge and 18 m from the near one, and both land near <b>−5′</b> (−6′ with straight rays), where the crossing is observed. Put the other way: a plane makes them coincide only for an observer at <b>1,629 m</b>, about <b>60 m</b> below the real 1,690 m — and no value of k can repair that, since a plane has no curvature to correct.",
  "k": "obs-12"
 },
 {
  "t": "lead",
  "html": "The cheapest test on the page: no instrument, no clock, no angle, not even a level — two measured altitudes, your own, and a photograph in which two ridges touch. <b>Its limit, stated plainly:</b> it works only because the viewpoint sits <em>between</em> 1,683 m and 1,809 m, and the lower margin is only <b>seven metres</b>. That margin is measured, not inferred — airborne LiDAR is good to about ten centimetres vertically, where the 90 m model used before was off by twenty metres on sharp ground — but two readings shave it. PeakFinder publishes the near point at 1,677 m, where the LiDAR reads 1,683 m at the crossing itself: the published figure is the one not to lean on. And the viewpoint is published at 1,690 m with ground at 1,686.9 m on the LiDAR, so a standing eye at about 1,688.5 m leaves nearer <b>six metres</b>. Know your altitude to a few metres — from a LiDAR spot height, not a phone's GPS — or the argument does not close; standing six metres lower would end it. The far margin, 119 m, is not in question.",
  "opener": false,
  "k": "obs-13"
 },
 {
  "t": "h2",
  "html": "Why this viewpoint",
  "k": "obs-14"
 },
 {
  "t": "lead",
  "html": "The viewpoint is a documented spot at <b>44.09388° N, 6.92856° E, 1,690 m</b> in the Alpes-de-Haute-Provence.<sup class=\"ref\"><a href=\"#s-obs-n1\">[1]</a></sup> Its interest is one summit: <b>Le Grand Mourre, 1,898 m</b>, 54.1 km away on a bearing of 241.2°. It stands <b>208 m higher than the observer</b> — and on a plane, a summit higher than you is above eye level at every distance, because on a plane only height counts. A sphere of R = 6,371 km costs it 231 m of curvature drop over that range, which is more than its 208 m of extra height, so it must sit <em>below</em> eye level. Refraction at k = 0.13 lifts it back to roughly level, and no further.",
  "opener": false,
  "k": "obs-15"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>A 3°-wide window where the models disagree by 12.7′.</b> Ray-marching the IGN's LiDAR terrain out to 120 km,<sup class=\"ref\"><a href=\"#s-obs-n4\">[4]</a></sup> the far ridge at 54 km is the skyline from azimuth <b>238.1°</b> to <b>241.2°</b>. Across that window a plane puts it <b>7′ to 15′ above</b> eye level; a globe keeps it within a couple of arcminutes of level (−7′ to +0.5′ with straight rays, −5′ to +2.4′ at k = 0.13). The sign does not flip at every azimuth — the older 90 m model said it did, wrongly — but the 12.7′ gap, 40 % of the solar disc, holds across the window. The Sun rides it on <b>24 November 2026</b>: first contact at <b>16:54:48 CET</b>, upper limb gone at <b>16:58:17</b>, for the standard atmosphere at the viewpoint<sup class=\"ref\"><a href=\"#s-obs-n6\">[6]</a></sup><sup class=\"ref\"><a href=\"#s-obs-n7\">[7]</a></sup>; plausible weather moves those by under ten seconds (the Atmosphere control shows how). Three and a half minutes, the neighbouring evenings nearly as good — one filtered video takes it.",
  "k": "obs-16"
 },
 {
  "t": "notes",
  "html": "The same kind of dated appointment, at the scale of a continent, is the total eclipse of 2 August 2027: the <a class=\"xref\" href=\"#tab-ecl\" data-xref=\"ecl\">Eclipses</a> tab states in advance when totality begins at Tarifa and at Luxor, and what a flat model would predict instead.",
  "k": "obs-17"
 },
 {
  "t": "lead",
  "html": "Two things the panel refuses to do. It does not treat the drawn skyline as evidence: both curves come from a terrain model, which cannot test the geometry that built it — they show <em>where</em> to point the camera. And named summits use their published heights, never the model's, so the terrain model never supplies the number a summit test turns on (the LiDAR happens to read Le Grand Mourre, Mourre de Chanier and Mourre Frey within a metre of them<sup class=\"ref\"><a href=\"#s-obs-n4\">[4]</a></sup>). The crossing is the one exception: its two points have no published height good to a few metres, so both come from the LiDAR.",
  "opener": false,
  "k": "obs-18"
 },
 {
  "away": "xp-obs-sign",
  "t": "exp",
  "h": "Experiment · photograph the sign change",
  "title": "One filtered camera, one synchronised clock, six minutes",
  "lead": "Stand at the published viewpoint. Point a solar-filtered camera at azimuth 241°, start recording before 16:53 CET and stop after 17:00. Film a network-synchronised clock in shot, or note the timestamps. That is the entire apparatus.",
  "iv": "<span class=\"vartag iv-t\">Independent variable</span><br> <b>What you change:</b> the <b>instant</b>, and nothing else. The viewpoint, the azimuth and the target summit are all fixed and published in advance — you only choose when to read the frame.",
  "dv": "<span class=\"vartag dv-t\">Dependent variable</span><br> <b>What you measure:</b> the ridge's height above or below the Sun's centre, <b>in units of the solar disc</b>, read straight off that frame. The disc is 32.4′ wide, so the frame carries its own scale — you do not get to choose this, the photograph tells you.",
  "meta": [
   "<b>Hold constant:</b> one tripod, one clock synchronised to network time and filmed in shot. <b>The tells, stated in advance:</b> a plane requires Le Grand Mourre to stand <b>13.2′ above</b> eye level, a sphere with straight rays <b>1.4′ below</b>, a sphere with k = 0.13, <b>0.5′ above</b>. The spread between plane and sphere is <b>12.7′, or 39 % of the solar disc</b>, and it converts to about <b>83 seconds</b> of sunset timing at this latitude. <b>Read the limb, not the blaze:</b> a Sun photographed near the horizon is overexposed, and the white blob is wider than the real disc, so judging \"half hidden\" by eye runs early. Stop the exposure down until the disc has an edge before you time anything."
  ],
  "inputs": [],
  "out": "obsExpOut",
  "verdict": "obsExpV",
  "k": "obs-19"
 },
 {
  "t": "callout",
  "flat": true,
  "html": "<b>What would settle it for the plane.</b> If the ridge photographs 13′ above the Sun's centre at the stated minute — two fifths of a disc high, unmistakable at any zoom — the flat prediction holds and the globe's is refuted. If it photographs level with the Sun or below it, no value of k on a plane can produce that, because a plane has no curvature to correct for. The measurement is the same either way; only the answer differs.",
  "k": "obs-20"
 },
 {
  "t": "h2",
  "html": "The arithmetic, in full",
  "k": "obs-21"
 },
 {
  "t": "lead",
  "html": "Everything on this tab comes out of three formulas, and the argument is entirely about which symbols appear in them. Here they are, with nothing hidden.",
  "opener": false,
  "k": "obs-22"
 },
 {
  "t": "formula",
  "flat": true,
  "style": "border-left-color:var(--flat)",
  "lines": [
   {
    "tex": null,
    "fallback": "Plane &nbsp;·&nbsp; <span class=\"tex\" data-tex=\"\\tan\\alpha = \\frac{\\Delta h}{d}\">tan&nbsp;α = Δh / d</span>"
   }
  ],
  "fig": null,
  "gloss": "Δh is the target's height above the observer's eye, d the distance between them. That is the complete formula. Notice what is <b>absent</b>: any length to compare d against. Double d and double Δh and α is unchanged, because a plane has no size. This is not a simplification of the flat model — it <em>is</em> the flat model, and it has no free parameter left to tune.",
  "k": "obs-23"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "lines": [
   {
    "tex": null,
    "fallback": "Sphere &nbsp;·&nbsp; <span class=\"tex\" data-tex=\"\\tan\\alpha = \\frac{r_2\\cos\\gamma - r_1}{r_2\\sin\\gamma}\">tan&nbsp;α = (r₂ cos γ − r₁) / (r₂ sin γ)</span> &nbsp;&nbsp;with&nbsp;&nbsp; <span class=\"tex\" data-tex=\"\\gamma = \\frac{d}{R}\">γ = d / R</span>"
   }
  ],
  "fig": null,
  "gloss": "r₁ = R + h₁ and r₂ = R + h₂ are the two distances from the planet's centre, and γ is the angle the two radii open between them. <b>γ = d/R is where the whole disagreement lives.</b> The observer's horizontal is perpendicular to <em>his own</em> radius, and the target's vertical has swung away by γ, so the target has to be found lower than a plane would put it — by an amount that depends on <b>distance alone</b>. This is the exact form the page computes; it is not expanded or approximated.",
  "k": "obs-24"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "",
  "lines": [
   {
    "tex": null,
    "fallback": "Small γ &nbsp;·&nbsp; <span class=\"tex\" data-tex=\"\\alpha \\approx \\frac{\\Delta h}{d} - \\frac{d}{2R}\">α ≈ Δh/d − d/(2R)</span> &nbsp;&nbsp;→&nbsp;&nbsp; with refraction, <span class=\"tex\" data-tex=\"\\frac{d(1-k)}{2R}\">d(1−k)/(2R)</span>"
   }
  ],
  "fig": null,
  "gloss": "Expand the sphere formula and the plane's answer falls out first, followed by a correction of <b>d/(2R)</b>. Everything this page argues is contained in that one term. Set R = ∞ and it vanishes and you are back on a plane — so a plane is not a rival model here, it is the <b>R → ∞ limit</b> of the same formula. Refraction does not remove the term, it only replaces R with R/(1−k), shrinking it by a factor (1−k). At the standard k = 0.13 that is a 13 % reduction. To cancel it outright you need <b>k = 1</b>, which makes the effective radius infinite — that is, k = 1 <em>is</em> the plane, and it would take a temperature rising 12.9 °C per hundred metres held over the whole sight line.",
  "k": "obs-25"
 },
 {
  "t": "h2",
  "html": "Diagram: where d/R enters",
  "k": "obs-26"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\" id=\"obsFigDR\" style=\"margin:10px 0 4px\">\n<svg viewBox=\"0 0 900 330\" role=\"img\" aria-label=\"Why the curvature term d over R has to appear: a plane, a sphere, and the size of the difference\">\n<text x=\"20.0\" y=\"20.0\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"11\" fill=\"#b45309\" text-anchor=\"start\" font-weight=\"normal\" font-style=\"normal\">A · PLANE — no length scale in the formula</text>\n<line x1=\"20\" y1=\"210\" x2=\"270\" y2=\"210\" stroke=\"#c9c3b4\" stroke-width=\"2\"/>\n<line x1=\"40\" y1=\"210\" x2=\"40\" y2=\"182\" stroke=\"#151a21\" stroke-width=\"2\"/>\n<line x1=\"245\" y1=\"210\" x2=\"245\" y2=\"158\" stroke=\"#151a21\" stroke-width=\"2\"/>\n<circle cx=\"40\" cy=\"182\" r=\"3\" fill=\"#151a21\"/>\n<circle cx=\"245\" cy=\"158\" r=\"3\" fill=\"#151a21\"/>\n<line x1=\"40\" y1=\"182\" x2=\"259\" y2=\"182\" stroke=\"#5b6470\" stroke-width=\"1\" stroke-dasharray=\"4 3\"/>\n<line x1=\"40\" y1=\"182\" x2=\"245\" y2=\"158\" stroke=\"#b45309\" stroke-width=\"2\"/>\n<path d=\"M 86 182 A 46 46 0 0 0 85.4 176.1\" fill=\"none\" stroke=\"#b45309\" stroke-width=\"1.4\"/>\n<text data-tex=\"\\alpha\" x=\"92.0\" y=\"177.0\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"12\" fill=\"#b45309\" text-anchor=\"start\" font-weight=\"600\" font-style=\"italic\">α</text>\n<text data-tex=\"d\" x=\"136.0\" y=\"204.0\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"12\" fill=\"#5b6470\" text-anchor=\"middle\" font-weight=\"normal\" font-style=\"italic\">d</text>\n<line x1=\"40\" y1=\"218\" x2=\"245\" y2=\"218\" stroke=\"#5b6470\" stroke-width=\"1\"/>\n<text data-tex=\"\\Delta h\" x=\"253.0\" y=\"168.0\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"12\" fill=\"#5b6470\" text-anchor=\"start\" font-weight=\"normal\" font-style=\"italic\">Δh</text>\n<text data-tex=\"\\tan\\alpha = \\Delta h/d\" x=\"20.0\" y=\"248.0\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"13\" fill=\"#b45309\" text-anchor=\"start\" font-weight=\"600\" font-style=\"normal\">tan α = Δh / d</text>\n<text x=\"20.0\" y=\"268.0\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#5b6470\" text-anchor=\"start\" font-weight=\"normal\" font-style=\"normal\">d and Δh are the only inputs.</text>\n<text x=\"20.0\" y=\"282.0\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#5b6470\" text-anchor=\"start\" font-weight=\"normal\" font-style=\"normal\">Double both and α is unchanged:</text>\n<text x=\"20.0\" y=\"296.0\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#5b6470\" text-anchor=\"start\" font-weight=\"normal\" font-style=\"normal\">a plane has no size to compare to.</text>\n<text x=\"312.0\" y=\"20.0\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"11\" fill=\"#0f766e\" text-anchor=\"start\" font-weight=\"normal\" font-style=\"normal\">B · SPHERE — the target's vertical has swung by γ = d/R</text>\n<path d=\"M 352.3 200.0 A 500 500 0 0 1 551.7 200.0\" fill=\"none\" stroke=\"#c9c3b4\" stroke-width=\"2\"/>\n<line x1=\"452\" y1=\"690\" x2=\"386.7\" y2=\"194.3\" stroke=\"#5b6470\" stroke-width=\"1\" stroke-dasharray=\"3 4\"/>\n<line x1=\"452\" y1=\"690\" x2=\"517.3\" y2=\"194.3\" stroke=\"#5b6470\" stroke-width=\"1\" stroke-dasharray=\"3 4\"/>\n<line x1=\"386.7\" y1=\"194.3\" x2=\"383.3\" y2=\"168.5\" stroke=\"#151a21\" stroke-width=\"2\"/>\n<line x1=\"517.3\" y1=\"194.3\" x2=\"523.3\" y2=\"148.7\" stroke=\"#151a21\" stroke-width=\"2\"/>\n<circle cx=\"383.3\" cy=\"168.5\" r=\"3\" fill=\"#151a21\"/>\n<circle cx=\"523.3\" cy=\"148.7\" r=\"3\" fill=\"#151a21\"/>\n<line x1=\"383.3\" y1=\"168.5\" x2=\"680.8\" y2=\"129.3\" stroke=\"#5b6470\" stroke-width=\"1\" stroke-dasharray=\"4 3\"/>\n<text x=\"676.8\" y=\"121.3\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"end\" font-weight=\"normal\" font-style=\"normal\">observer's horizontal</text>\n<line x1=\"383.3\" y1=\"168.5\" x2=\"523.3\" y2=\"148.7\" stroke=\"#0f766e\" stroke-width=\"2\"/>\n<text data-tex=\"\\gamma = d/R\" x=\"458.0\" y=\"328.0\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"12\" fill=\"#0f766e\" text-anchor=\"start\" font-weight=\"600\" font-style=\"italic\">γ = d/R</text>\n<path d=\"M 452.0 342.0 A 348 348 0 0 1 497.4 345.0\" fill=\"none\" stroke=\"#0f766e\" stroke-width=\"1.4\"/>\n<text data-tex=\"\\tan\\alpha = (r_2\\cos\\gamma - r_1)/(r_2\\sin\\gamma)\" x=\"312.0\" y=\"248.0\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"13\" fill=\"#0f766e\" text-anchor=\"start\" font-weight=\"600\" font-style=\"normal\">tan α = (r₂ cos γ − r₁) / (r₂ sin γ)</text>\n<text data-tex=\"r_1 = R + h_1,\\ r_2 = R + h_2,\\ \\gamma = d/R.\" x=\"312.0\" y=\"268.0\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#5b6470\" text-anchor=\"start\" font-weight=\"normal\" font-style=\"normal\">r₁ = R + h₁, r₂ = R + h₂, γ = d/R.</text>\n<text x=\"312.0\" y=\"282.0\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#5b6470\" text-anchor=\"start\" font-weight=\"normal\" font-style=\"normal\">Small γ:  α ≈ Δh/d − d/(2R)  — the plane's answer,</text>\n<text x=\"312.0\" y=\"296.0\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#5b6470\" text-anchor=\"start\" font-weight=\"normal\" font-style=\"normal\">minus a term that exists only because R is finite.</text>\n<text x=\"312.0\" y=\"314.0\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"start\" font-weight=\"normal\" font-style=\"normal\">Curvature drawn ×90 by shrinking the planet, not stretching the axis.</text>\n<text x=\"660.0\" y=\"20.0\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"11\" fill=\"#151a21\" text-anchor=\"start\" font-weight=\"normal\" font-style=\"normal\">C · THE TERM ITSELF, d/(2R)</text>\n<rect x=\"660\" y=\"44\" width=\"218\" height=\"168\" fill=\"none\" stroke=\"#c9c3b4\" stroke-width=\"1\"/>\n<line x1=\"660\" y1=\"156.0\" x2=\"878\" y2=\"156.0\" stroke=\"#ece8dd\" stroke-width=\"1\"/>\n<text x=\"655.0\" y=\"159.0\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"end\" font-weight=\"normal\" font-style=\"normal\">10′</text>\n<line x1=\"660\" y1=\"100.0\" x2=\"878\" y2=\"100.0\" stroke=\"#ece8dd\" stroke-width=\"1\"/>\n<text x=\"655.0\" y=\"103.0\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"end\" font-weight=\"normal\" font-style=\"normal\">20′</text>\n<line x1=\"660\" y1=\"44.0\" x2=\"878\" y2=\"44.0\" stroke=\"#ece8dd\" stroke-width=\"1\"/>\n<text x=\"655.0\" y=\"47.0\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"end\" font-weight=\"normal\" font-style=\"normal\">30′</text>\n<line x1=\"714.5\" y1=\"44\" x2=\"714.5\" y2=\"212\" stroke=\"#ece8dd\" stroke-width=\"1\"/>\n<text x=\"714.5\" y=\"225.0\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"middle\" font-weight=\"normal\" font-style=\"normal\">25</text>\n<line x1=\"769.0\" y1=\"44\" x2=\"769.0\" y2=\"212\" stroke=\"#ece8dd\" stroke-width=\"1\"/>\n<text x=\"769.0\" y=\"225.0\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"middle\" font-weight=\"normal\" font-style=\"normal\">50</text>\n<line x1=\"823.5\" y1=\"44\" x2=\"823.5\" y2=\"212\" stroke=\"#ece8dd\" stroke-width=\"1\"/>\n<text x=\"823.5\" y=\"225.0\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"middle\" font-weight=\"normal\" font-style=\"normal\">75</text>\n<line x1=\"878.0\" y1=\"44\" x2=\"878.0\" y2=\"212\" stroke=\"#ece8dd\" stroke-width=\"1\"/>\n<text x=\"878.0\" y=\"225.0\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"middle\" font-weight=\"normal\" font-style=\"normal\">100</text>\n<text x=\"769.0\" y=\"239.0\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#5b6470\" text-anchor=\"middle\" font-weight=\"normal\" font-style=\"normal\">distance (km)</text>\n<polyline points=\"660.0,212.0 662.2,210.5 664.4,209.0 666.5,207.5 668.7,206.0 670.9,204.4 673.1,202.9 675.3,201.4 677.4,199.9 679.6,198.4 681.8,196.9 684.0,195.4 686.2,193.9 688.3,192.4 690.5,190.8 692.7,189.3 694.9,187.8 697.1,186.3 699.2,184.8 701.4,183.3 703.6,181.8 705.8,180.3 708.0,178.8 710.1,177.3 712.3,175.7 714.5,174.2 716.7,172.7 718.9,171.2 721.0,169.7 723.2,168.2 725.4,166.7 727.6,165.2 729.8,163.7 731.9,162.1 734.1,160.6 736.3,159.1 738.5,157.6 740.7,156.1 742.8,154.6 745.0,153.1 747.2,151.6 749.4,150.1 751.6,148.5 753.7,147.0 755.9,145.5 758.1,144.0 760.3,142.5 762.5,141.0 764.6,139.5 766.8,138.0 769.0,136.5 771.2,134.9 773.4,133.4 775.5,131.9 777.7,130.4 779.9,128.9 782.1,127.4 784.3,125.9 786.4,124.4 788.6,122.9 790.8,121.3 793.0,119.8 795.2,118.3 797.3,116.8 799.5,115.3 801.7,113.8 803.9,112.3 806.1,110.8 808.2,109.3 810.4,107.8 812.6,106.2 814.8,104.7 817.0,103.2 819.1,101.7 821.3,100.2 823.5,98.7 825.7,97.2 827.9,95.7 830.0,94.2 832.2,92.6 834.4,91.1 836.6,89.6 838.8,88.1 840.9,86.6 843.1,85.1 845.3,83.6 847.5,82.1 849.7,80.6 851.8,79.0 854.0,77.5 856.2,76.0 858.4,74.5 860.6,73.0 862.7,71.5 864.9,70.0 867.1,68.5 869.3,67.0 871.5,65.4 873.6,63.9 875.8,62.4 878.0,60.9\" fill=\"none\" stroke=\"#0f766e\" stroke-width=\"2\" stroke-dasharray=\"\" opacity=\"1\"/>\n<text data-tex=\"k = 0\" x=\"821.0\" y=\"98.2\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#0f766e\" text-anchor=\"start\" font-weight=\"normal\" font-style=\"normal\">k = 0</text>\n<polyline points=\"660.0,212.0 662.2,210.7 664.4,209.4 666.5,208.1 668.7,206.7 670.9,205.4 673.1,204.1 675.3,202.8 677.4,201.5 679.6,200.2 681.8,198.9 684.0,197.5 686.2,196.2 688.3,194.9 690.5,193.6 692.7,192.3 694.9,191.0 697.1,189.7 699.2,188.3 701.4,187.0 703.6,185.7 705.8,184.4 708.0,183.1 710.1,181.8 712.3,180.5 714.5,179.1 716.7,177.8 718.9,176.5 721.0,175.2 723.2,173.9 725.4,172.6 727.6,171.3 729.8,169.9 731.9,168.6 734.1,167.3 736.3,166.0 738.5,164.7 740.7,163.4 742.8,162.1 745.0,160.7 747.2,159.4 749.4,158.1 751.6,156.8 753.7,155.5 755.9,154.2 758.1,152.8 760.3,151.5 762.5,150.2 764.6,148.9 766.8,147.6 769.0,146.3 771.2,145.0 773.4,143.6 775.5,142.3 777.7,141.0 779.9,139.7 782.1,138.4 784.3,137.1 786.4,135.8 788.6,134.4 790.8,133.1 793.0,131.8 795.2,130.5 797.3,129.2 799.5,127.9 801.7,126.6 803.9,125.2 806.1,123.9 808.2,122.6 810.4,121.3 812.6,120.0 814.8,118.7 817.0,117.4 819.1,116.0 821.3,114.7 823.5,113.4 825.7,112.1 827.9,110.8 830.0,109.5 832.2,108.2 834.4,106.8 836.6,105.5 838.8,104.2 840.9,102.9 843.1,101.6 845.3,100.3 847.5,99.0 849.7,97.6 851.8,96.3 854.0,95.0 856.2,93.7 858.4,92.4 860.6,91.1 862.7,89.8 864.9,88.4 867.1,87.1 869.3,85.8 871.5,84.5 873.6,83.2 875.8,81.9 878.0,80.6\" fill=\"none\" stroke=\"#0f766e\" stroke-width=\"2\" stroke-dasharray=\"5 4\" opacity=\"0.75\"/>\n<text data-tex=\"k = 0.13\" x=\"821.0\" y=\"112.4\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#0f766e\" text-anchor=\"start\" font-weight=\"normal\" font-style=\"normal\">k = 0.13</text>\n<line x1=\"660\" y1=\"212\" x2=\"878\" y2=\"212\" stroke=\"#b45309\" stroke-width=\"2.5\"/>\n<text x=\"666.0\" y=\"205.0\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#b45309\" text-anchor=\"start\" font-weight=\"normal\" font-style=\"normal\">plane: zero at every distance</text>\n<circle cx=\"777.9\" cy=\"140.9\" r=\"3.5\" fill=\"none\" stroke=\"#151a21\" stroke-width=\"1.6\"/>\n<text x=\"771.9\" y=\"132.9\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"9\" fill=\"#151a21\" text-anchor=\"end\" font-weight=\"normal\" font-style=\"normal\">54 km → 12.7′</text>\n<text x=\"660.0\" y=\"248.0\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#5b6470\" text-anchor=\"start\" font-weight=\"normal\" font-style=\"normal\">The gap grows with d and never</text>\n<text x=\"660.0\" y=\"262.0\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#5b6470\" text-anchor=\"start\" font-weight=\"normal\" font-style=\"normal\">with Δh. That is the signature:</text>\n<text x=\"660.0\" y=\"276.0\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#5b6470\" text-anchor=\"start\" font-weight=\"normal\" font-style=\"normal\">a plane cannot make an error that</text>\n<text x=\"660.0\" y=\"290.0\" font-family=\"ui-monospace,Menlo,monospace\" font-size=\"10\" fill=\"#5b6470\" text-anchor=\"start\" font-weight=\"normal\" font-style=\"normal\">depends on distance alone.</text>\n</svg>\n    </div>",
  "k": "obs-27"
 },
 {
  "t": "fcap",
  "html": "Panel B's curvature is exaggerated ×90 by drawing a <b>smaller planet</b> and scaling the heights to match, then rendering both axes at one scale. Stretching the vertical axis instead would turn the globe into an ellipse and <em>reduce</em> the tilt between the two verticals, which is the very effect being shown. Panel C is at true scale and needs no exaggeration. This figure is generated by <code>make_fig_curvature.py</code>, shipped beside the page — edit the generator, never these coordinates.",
  "k": "obs-28"
 },
 {
  "t": "callout",
  "flat": true,
  "html": "<b>And the flat model's own object.</b> The dashed outline is where a lamp circling above the disc would have to be. Its azimuth is the direction, on the azimuthal-equidistant map, from the viewpoint to the point the Sun stands over — <b>independent of the lamp's height</b>, so there is nothing to adjust and no refraction to appeal to, refraction being vertical. Its altitude does depend on the height, hence the slider: from 500 to 20,000 km the dashed disc never reaches the horizon; even at 500 km it stands 2.5° up while the real Sun touches the ridge. <br><br><b>Its size is fixed, not fitted:</b> the diameter that subtends the observed 32.4′ when overhead, 47 km at 5,000 km up. At sunset the lamp is 11,578 km away across the map, so it must look <b>12.8′ wide, 40 % of what the camera records</b>, whatever the height. <br><br><b>You will usually not see it in frame:</b> at the 24 November sunset it sits 40° from the real Sun, and an arrow at the border points to it; <em>Frame both</em> pulls back far enough to hold the two. That they cannot share a normal photograph <em>is</em> the finding.",
  "k": "obs-29"
 },
 {
  "t": "h2",
  "html": "10 January 2026: one sunset, four ways",
  "k": "obs-30"
 },
 {
  "t": "lead",
  "html": "The same kind of appointment as the Celestial theodolite tab's 24 November, on the evening of 10 January 2026, when a P900 on a tripod was aimed in advance at the notch where the globe's Sun was due to set. The three drawn panels share that camera — direction, zoom, instant. <b>A</b>: the globe, the ephemeris Sun and the ridge with standard refraction. <b>B</b>: the same Sun over a plane, whose far ridge stands higher (the globe's ridge dashed). <b>C</b>: the plane with its own Sun, a lamp 5,000 km above the point under the real Sun — about 33° right of the frame and 23° up, never setting. <b>D</b>: the video itself. <b>E</b> and <b>F</b>: the same instant seen from above, as in the Azimuth tab — the globe with the point beneath the Sun and the great circle from this viewpoint to it, and the Gleason flat-earth map, where the Sun's bearing, laid off straight from the viewpoint, misses that point.",
  "k": "obs-31"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig obs-jan\"><div class=\"obs-jan-grid\"><canvas id=\"obsJan-globe\"></canvas><canvas id=\"obsJan-flatG\"></canvas><canvas id=\"obsJan-flatF\"></canvas><div class=\"obs-jan-video\" id=\"obsJan-video\"><p><b>D · The P900 video, 10 January 2026</b><br>Filmed from this viewpoint, camera fixed on the point where the globe's Sun was due to set. It will run here, in step with the three panels.</p></div></div><div class=\"reads\" id=\"obsJanReads\"></div></div>",
  "k": "obs-32"
 },
 {
  "t": "fcap",
  "html": "<b>Fixed camera, 17:03 to 17:15 CET, ×20.</b> True angular scale on both axes, the width of the frame printed in each panel. Each drawn panel puts its own ridge where the video shows the ridge (0.40 of the frame height, measured on the recording), as if the camera had been aimed at the ridge the same way in every model: what differs between the panels is the Sun. The ridges are the LiDAR profile of this viewpoint computed for each model; the Sun's positions are the page's own ephemeris<sup class=\"ref\"><a href=\"#s-obs-n2\">[2]</a></sup>, with standard refraction on the globe's Sun. The video is the camera's own recording, reduced and sped up ×20 to run with the panels; it sets the clock for all six. Its time is the camera's clock (first frame 17:06:57 CET, from the file's metadata), checked against a network clock filmed beside the camera's screen: they agree to about a second (below). Click any panel, or the video, to pause. The times under the panels are computed, not read off the drawing.",
  "k": "obs-33"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "obs-ntp",
  "id": "",
  "html": "<div class=\"obs-ntp\"><figure><img src=\"/photos/obs-2026-01-10-ntp-171106.jpg\" alt=\"Phone photograph: a network-time website reading 17:11:06 beside the camera's screen, the setting Sun behind them\" loading=\"lazy\"><figcaption>17:11:06 CET</figcaption></figure><figure><img src=\"/photos/obs-2026-01-10-ntp-171237.jpg\" alt=\"Phone photograph: a network-time website reading 17:12:37 beside the camera's screen, the setting Sun behind them\" loading=\"lazy\"><figcaption>17:12:37 CET</figcaption></figure><figure><img src=\"/photos/obs-2026-01-10-ntp-171240.jpg\" alt=\"Phone photograph: a network-time website reading 17:12:40 beside the camera's screen, the setting Sun behind them\" loading=\"lazy\"><figcaption>17:12:40 CET</figcaption></figure></div>",
  "k": "obs-34"
 },
 {
  "t": "notes",
  "html": "<b>What the camera saw, against a network clock.</b> Three phone photographs frame a website showing network time (NTP) beside the camera's screen, and so date the recording independently: at 17:11:06 the screen shows what the video shows at 17:11:07 by the camera's clock, and the recording counter drops by 91 s between 17:11:06 and 17:12:37, as the network clock does. At <b>17:11:06</b> the lower left edge of the Sun touches the shoulder where the ridge, rising to the left, levels off (azimuth 238.95°). The globe puts that contact at <b>17:11:05</b>, with the Sun about half hidden. The plane, with the same Sun over its higher ridge, puts it at 17:10:38, and at 17:11:06 has the Sun three quarters hidden, its edge cutting the ridge lower down the slope. The Sun is gone between <b>17:12:37 and 17:12:40</b>: the globe predicts the last light at 17:13:10, the plane at 17:11:29. The globe's lag of about 30 s is stated, not tuned away: the last sliver, seen through 54 km of low air, fades before the geometric contact, and the terrain model is bare ground, without the forest on the ridge (about 1.6′ at 54 km, some 12 s). All the times on this tab take the Sun's disc as it appears near the horizon, flattened by refraction (here 27.9′ tall for 32.5′ wide), each edge refracted at its own height.",
  "k": "obs-35"
 },
 {
  "t": "notes",
  "html": "<b>Eratosthenes, from one photograph.</b> The Sun's altitude needs no radius: it is 90° minus the angle between the viewpoint and the point beneath the Sun (90.44° at 17:11:06), plus the atmosphere's refraction. So when its edge touches the shoulder, the shoulder's elevation angle is measured: <b>1.5′</b> (0.9′ to 2.1′, depending on where along the edge the contact sits). The shoulder is 54.1 km away and 238 m above the eye on the LiDAR. On a plane its angle would be the slope alone, 15.2′; on a sphere, the slope minus a curvature term of about d/2R. Solving for R gives <b>about 5,900 km</b>, and 5,000 to 6,500 km across the uncertainties (the contact point, refraction k from 0.09 to 0.17, up to 20 m of forest on the ridge): the Earth's 6,371 km lies inside, as it did for Eratosthenes. A plane, an infinite radius, would need the shoulder at 15.2′, thirteen arcminutes above what was photographed: two fifths of the Sun's disc.",
  "k": "obs-36"
 },
 {
  "t": "h2",
  "k": "obs-h2theo",
  "html": "24 November, as a measurement: the Grand Mourre with a theodolite"
 },
 {
  "t": "notes",
  "k": "obs-theo1",
  "html": "<b>The 24 November shot is a check, and can only be one.</b> The ridge's distance and height come from maps, and the Sun's position from an ephemeris that computes it for a latitude on a sphere. To turn the same line of sight into a measurement, the Sun has to be replaced by a level and the maps by a tape. A theodolite reads the angle α between the horizontal and the summit, face left then face right to cancel its index error. The distance s comes from a baseline of a kilometre or so measured on the ground with a wheel or a laser rangefinder, never a GPS, and the two horizontal angles from its ends to the summit. The height difference Δh comes from two recording barometers, one left at the viewpoint and one carried to the summit, with the temperatures at both ends."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "obs-fx-theo",
  "fig": "obsFxTheo",
  "lines": [
   {
    "tex": "s = \\frac{b\\,\\sin B}{\\sin(A+B)},\\qquad \\alpha = \\frac{\\Delta h}{s} - \\frac{s\\,(1-k)}{2R}",
    "fallback": "s = b sin B / sin(A + B), α = Δh/s − s(1 − k)/2R"
   },
   {
    "tex": "\\g{\\frac{R}{1-k} = \\frac{s^2}{2\\,(\\Delta h - s\\,\\alpha)}}",
    "fallback": "R/(1 − k) = s² / 2(Δh − sα)"
   }
  ],
  "gloss": "b is the measured baseline, A and B the horizontal angles at its ends. On a plane α = Δh/s, 13.2′ here; on a globe with standard refraction, about 0.5′. Without k, the result is the apparent radius, a bound on R as in the reciprocal-zenith-angle section of the Surveying tab; with a second observer on the summit reading back at the same moment, Δh drops out and the sum of the two angles exceeds 180° by about 25′ on a globe, against 0 or less on a plane."
 },
 {
  "t": "table",
  "id": "obs-tabTheo",
  "tbody": "obs-tbTheo",
  "k": "x:obs-cap-theo",
  "caption": "What each measurement costs in the result, with the map values used only to plan (54.1 km, 208 m). Planned precisions: α to 10″ (a used 5–20″ theodolite, two faces), s to 0.4 % (a 1 km baseline), Δh to 5 m (two barometers, temperatures logged).",
  "head": [
   "Measurement",
   "Planned precision",
   "Effect on R/(1 − k)"
  ]
 },
 {
  "away": "xp-obs-th",
  "t": "exp",
  "h": "Experiment · the Grand Mourre, measured",
  "title": "Enter your own α, s and Δh",
  "lead": "Nothing here comes from a map once these three are yours.",
  "iv": "<b>You measure</b> α with the theodolite, s by triangulation, Δh with barometers",
  "dv": "<b>You get</b> the apparent radius R/(1 − k), and the plane's α for the same s and Δh",
  "meta": [
   "Prediction before measuring: α ≈ 0.5′ on a globe with standard refraction, 13.2′ on a plane.",
   "Best variant: a second observer on the summit, both theodolites read at the same instant (signal mirror by day, lamp at dusk)."
  ],
  "inputs": [
   [
    "obsThA",
    "α (′)",
    "value=\"0.52\" step=\"0.01\""
   ],
   [
    "obsThS",
    "s (km)",
    "value=\"54.1\" step=\"0.01\""
   ],
   [
    "obsThH",
    "Δh (m)",
    "value=\"208\" step=\"0.5\""
   ]
  ],
  "out": "obsThOut",
  "verdict": "obsThV"
 },
 {
  "t": "callout",
  "flat": true,
  "k": "obs-theo2",
  "html": "<b>What would vindicate the plane:</b> α within a minute of arc of Δh/s, about 13.2′ with today's map values. The globe needs α near 0.5′, and with no k at all, −1.4′. Twelve minutes of arc is forty times the planned uncertainty of the theodolite. This section is a prediction until the measurement is made."
 },
 {
  "t": "sources"
 },
 {
  "t": "reading"
 }
];
