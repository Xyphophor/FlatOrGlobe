// Prose de l'onglet dip, extraite VERBATIM et dans l'ordre du panneau
// legacy par research/extract_prose.py (EN). Rendue par src/core/prose.js.
export const PROSE = [
 {
  "t": "eyebrow",
  "html": "Dip of the horizon · the navigator's daily correction",
  "k": "dip-m1"
 },
 {
  "t": "h1",
  "html": "The horizon drops as you rise — by a measured amount"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig opener",
  "id": "",
  "html": "<div class=\"fig opener\"> <div class=\"figsym\" id=\"dipPairFig\"></div> <div class=\"fcap\"><b>Where the sea horizon sits, relative to eye level.</b> Same eye height in both. On a plane the sea runs out to meet eye level and there is no angle to measure; on a globe the horizon is the tangent from the eye, an angle δ below level. Curvature is exaggerated.</div> </div>",
  "k": "x:dp-pair"
 },
 {
  "t": "lead",
  "html": "Climb, and the sea horizon sinks <em>below</em> your eye level. Every sextant sight is corrected for it before anything else. The globe predicts exactly how much; a flat plane predicts exactly zero, at every height, forever. Drag the observer up and down and compare.",
  "opener": true,
  "k": "f2dcb175"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig flatten-fig\"><canvas id=\"dipFlatten\" style=\"height:340px\"></canvas><div class=\"reads\" id=\"dipFlattenReads\"></div></div>"
 },
 {
  "t": "fcap",
  "html": "<b>Flatten the Earth, and watch the horizon climb.</b> The same eye, 1,395 m up on the Sommet de Viériou, while the curvature goes from the real Earth to a plane and back. On the globe the sea horizon sits <b>1.20°</b> below eye level (1.12° with standard refraction, k = 0.13)<sup class=\"ref\"><a href=\"#s-dip-n1\">[1]</a></sup>; as the surface flattens it climbs, and on a plane it never leaves eye level. In between, the surface is a larger sphere, never a stretched drawing; the side view's exaggeration is printed, and the angles come from the geometry, not from the drawing.",
  "k": "dip-flatten-cap"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig dip-caus\"><canvas id=\"dipCaus\" role=\"img\" aria-label=\"The view east from the plateau de Caussols, bent from a plane to the measured Earth and then refracted: the sea horizon falls below eye level and Mont Agel rises clear of it\"></canvas><div class=\"reads\" id=\"dipCausReads\"></div></div>"
 },
 {
  "t": "fcap",
  "html": "<b>From the plateau de Caussols, bend the Earth and watch the sea horizon fall.</b> The view east from 1,210 m, drawn from the IGN's LiDAR and, beyond 45 km, the Copernicus model: the Riviera, Mont Agel, Monte Ceppo in Italy, Corsica 222 km out to sea. It starts on a plane, where the sea rises towards eye level and Mont Agel, 77 m lower than the eye, sits 7′ below the horizon. Its height here is the terrain model's, 1,133 m, not the published 1,148 m: the IGN's LiDAR has no data on the summit, a military site, and the models that fill the gap differ by up to 30 m around it (<a class=\"xref\" href=\"#tab-math/math-h2dem\" data-xref=\"math\" data-sec=\"math-h2dem\">Math</a>, terrain models). With 1,148 m it would sit 5′ below the plane's horizon instead of 7′, and 48′ above the refracted globe's instead of 47′. The Earth is then curved to its measured radius, 6,371 km: the horizon falls to 67′ below eye level and Mont Agel rises clear of it. Refraction comes last, and it works the other way: bending light along the curve, it acts as a larger radius, R/(1−k) with k = 0.13, and lifts the far scene back by a few arcminutes (horizon 62′ below). The terrain between the three computed models is interpolated for the animation; the horizon and the named summits are computed at every step. Last, once the model has stopped changing, <a href=\"https://x.com/Xyphophor\" target=\"_blank\" rel=\"noopener\">Xyphophor</a>'s photograph from this spot fades in, then blinks fully on and off to show how well it lands on the drawing. It is framed as the refracted globe prefers (focal length from the camera, heading, tilt and roll fitted on the near summits): its sea horizon lies within 0.1° of that model's and about 45′ below a plane's, and Mont Agel stands 42′ above it.",
  "k": "dip-caus-cap"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "mini-form",
  "id": "",
  "html": "<div class=\"mini-form\"> <div class=\"field\" style=\"min-width:210px\"> <label>Observer height <span class=\"unit\">(m)</span> — or drag in the view</label> <input type=\"number\" id=\"dipH\" value=\"100\" min=\"0.5\" max=\"20000\" step=\"1\"> </div> <div class=\"field\" style=\"min-width:250px\"> <label>Or load a documented vantage point</label> <select id=\"dipSel\" aria-label=\"Documented vantage points\"></select> </div> <div class=\"field\" style=\"flex:1;min-width:200px\"> <label>Vertical zoom <span id=\"dipExRead\" class=\"unit\">×1</span></label> <input type=\"range\" id=\"dipEx\" min=\"0.4\" max=\"6\" step=\"0.1\" value=\"1\" style=\"accent-color:var(--ink)\"> </div> <button type=\"button\" class=\"swapbtn\" id=\"dipRefrBtn\">☼ refraction: off</button> </div>",
  "k": "x:f2ac7818"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "cnav-grid",
  "id": "",
  "html": "<div class=\"cnav-grid\"> <div class=\"fig\"> <canvas id=\"dipG\" style=\"cursor:ns-resize\"></canvas> <div class=\"fcap\" id=\"dipGCap\"></div> </div> <div class=\"fig\"> <canvas id=\"dipF\" style=\"cursor:ns-resize\"></canvas> <div class=\"fcap\" id=\"dipFCap\"></div> </div> </div>"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "lines": [
   {
    "tex": "\\operatorname{Dip} = \\arccos\\frac{R}{R+h} \\approx \\g{1.76\\arcmin\\times\\sqrt{h}}",
    "fallback": "Dip = arccos( R / (R+h) ) &nbsp;≈&nbsp; <b>1.76′ × √h</b>"
   },
   {
    "tex": "\\operatorname{Horizon} = \\sqrt{2Rh + h^2} \\approx \\g{3.86\\,\\text{km}\\times\\sqrt{h}}",
    "fallback": "Horizon = √(2Rh + h²) &nbsp;≈&nbsp; <b>3.86 km × √h</b>"
   }
  ],
  "fig": "dipfig0",
  "gloss": "h in metres. The bold constants are the <em>refracted</em> values printed in every nautical almanac and dip table (geometric: 1.93′√h and 3.57 km·√h). On a flat plane both formulas collapse: <b style=\"color:var(--flat)\">dip = 0 at every height</b>, and the ground never reaches a horizon at all.<a class=\"xref\" data-xref=\"ref\"></a>",
  "k": "x:c2f14e34"
 },
 {
  "t": "table",
  "id": "",
  "tbody": "dipRows",
  "caption": "What each model predicts at the current eye height",
  "head": [
   "Model",
   "Dip below eye level",
   "Distance to horizon",
   "Sharp edge?"
  ],
  "k": "x:14ebcfce"
 },
 {
  "t": "raw",
  "tag": "p",
  "class": "rate-note",
  "id": "dipNote",
  "html": "<p class=\"rate-note\" id=\"dipNote\"></p>"
 },
 {
  "t": "h2",
  "html": "Solve the triangle: the flat model contradicts itself",
  "k": "e711563d"
 },
 {
  "t": "notes",
  "html": "Suppose the flat model is granted the <em>measured</em> dip angle δ — the one a dip meter actually reads. On a flat plane the eye, the point straight below it, and the point where the sightline meets the ground form a <b>right triangle</b>: height h, horizontal run d, right angle at the foot. That triangle is solvable, and it fixes where the ground must be:",
  "k": "24ec1a6d"
 },
 {
  "t": "formula",
  "flat": true,
  "style": "border-left-color:var(--flat)",
  "lines": [
   {
    "tex": "\\tan\\delta = \\frac{h}{d} \\implies \\f{d = \\frac{h}{\\tan\\delta}}",
    "fallback": "tan δ = h / d &nbsp;⇒&nbsp; <b style=\"color:var(--flat)\">d = h / tan δ</b>"
   }
  ],
  "fig": "dipfig1",
  "gloss": "Feed the measured dip into flat geometry and it says the sightline strikes the ground at distance d. But δ ≈ √(2h/R), so d ≈ h/√(2h/R) = √(hR/2) = <b>½·√(2Rh)</b> — exactly <b>half</b> the measured horizon distance, at every height. And on a plane nothing ends there: the ground simply continues, seen at ever‑smaller angles.",
  "k": "x:3435c137"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\" style=\"margin:16px 0\"> <canvas id=\"dipTri\"></canvas> <div class=\"fcap\" id=\"dipTriCap\"></div> </div>"
 },
 {
  "t": "table",
  "id": "",
  "tbody": "triRows",
  "caption": "Grant the measured dip, then solve the flat triangle — and compare with the horizon that can actually be ranged",
  "head": [
   "Eye height",
   "Measured dip δ",
   "Flat: d = h / tan δ",
   "Measured horizon",
   "Ratio"
  ],
  "k": "x:d0023ce6"
 },
 {
  "t": "callout",
  "flat": true,
  "html": "<b>Three statements, no consistent flat answer.</b> (1) The dip is real and measured — so the flat triangle puts the ground at h/tan δ. (2) The horizon is real and ranged — radar, known landmarks and ship disappearance all put it twice as far. (3) On a plane the surface has no edge at either distance. The globe satisfies all three at once with a single number: the tangent point of a sphere of radius R sits at √(2Rh), and the angle to it <em>is</em> the dip. The factor of 2 isn't a fudge — it's the signature of a tangent line on a circle versus a chord to a plane.",
  "k": "cfbe4290"
 },
 {
  "t": "h2",
  "html": "The surface you never drew <button type=\"button\" class=\"swapbtn\" id=\"dipEnvBtn\" style=\"margin-left:10px\">◔ reveal the surface</button>",
  "k": "bfb8cbb7"
 },
 {
  "t": "notes",
  "html": "<b>Tangents, osculating circles and what curvature means</b>, from a curve to a surface: <a class=\"xref\" href=\"#tab-kappa/ka-h2def\" data-xref=\"kappa\" data-sec=\"ka-h2def\">Curvature</a>.",
  "k": "ka-link-dip2"
 },
 {
  "t": "notes",
  "html": "Here is the same measurement with <b>no ground drawn at all</b>. Every line is one sightline to the horizon, taken from a real vantage point on the <em>same vertical</em> — a beach, a ship's bridge, a lighthouse, a cliff, a summit, an airliner — each tipped below horizontal by its own measured dip δ(h). Nothing else is plotted: no circle, no arc, no Earth. Yet the lines cannot enter a certain region, and that forbidden region has a shape. The dip angles alone carve the planet out of the negative space. <b>Click any sightline</b> to see which altitude it came from.",
  "k": "73253bf6"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\" style=\"margin:16px 0\"> <canvas id=\"dipEnv\" style=\"cursor:pointer\"></canvas> <div id=\"dipEnvInfo\" style=\"margin-top:10px;padding:11px 13px;background:var(--paper);border:1px solid var(--line); border-radius:8px;font-size:13px;line-height:1.6;min-height:62px\"></div> <div class=\"fcap\" id=\"dipEnvCap\"></div> </div>"
 },
 {
  "t": "notes-block",
  "paras": [
   "This is what a mathematician calls an <b>envelope</b>: a family of straight lines whose boundary traces a curve that none of them crosses. Because a tangent to a circle touches at one point and lies outside it everywhere else, the sightlines can only be tangents of one specific circle — the one whose radius satisfies cos δ = R/(R+h) at <em>every</em> height simultaneously. A flat plane produces no envelope at all: with δ = 0 at all heights, every line is horizontal, they never fan, and the empty region is an unbounded half‑plane with no curve anywhere in it."
  ],
  "k": "dp-n4"
 },
 {
  "t": "h2",
  "html": "Measuring the Earth from one dip angle",
  "k": "84acea2b"
 },
 {
  "t": "notes",
  "html": "<b>The mathematics behind it</b>, curvature as the turn of the vertical between the eye and the horizon, and the same calculation run on readings taken on a plane, which gives no radius: <a class=\"xref\" href=\"#tab-kappa/ka-h2dip\" data-xref=\"kappa\" data-sec=\"ka-h2dip\">Curvature</a>.",
  "k": "ka-link-dip1"
 },
 {
  "t": "notes",
  "html": "Turn the formula around. If you can measure your height h and the dip δ, you can solve for R — no satellites, no travel, no second observer:",
  "k": "6ccfd2e3"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "lines": [
   {
    "tex": "\\cos\\delta = \\frac{R}{R+h} \\implies \\g{R = \\frac{h\\cos\\delta}{1-\\cos\\delta}} \\approx \\g{\\frac{2h}{\\delta^2}}",
    "fallback": "cos δ = R/(R+h) &nbsp;⇒&nbsp; <b>R = h·cos δ / (1 − cos δ)</b> &nbsp;≈&nbsp; <b>2h / δ²</b>"
   }
  ],
  "fig": "dipfig2",
  "gloss": "δ in radians for the approximation. One hill, one angle, one number — and it must come out the same from a sea cliff, a mountain, or an aircraft window. That consistency is the test; a single value would prove nothing on its own.",
  "k": "x:94d0e9e4"
 },
 {
  "t": "table",
  "id": "",
  "tbody": "radRows",
  "caption": "Solving for R from the current height, and what refraction does to the answer",
  "head": [
   "Dip used",
   "Value at current h",
   "R = h·cos δ/(1−cos δ)",
   "Compared with 6,371 km"
  ],
  "k": "x:5f788a52"
 },
 {
  "t": "raw",
  "tag": "p",
  "class": "rate-note",
  "id": "radNote",
  "html": "<p class=\"rate-note\" id=\"radNote\"></p>"
 },
 {
  "t": "fold",
  "q": false,
  "k": "dip-fold1",
  "summary": "<b>Who did it first: al‑Bīrūnī, around 1018</b><span class=\"fold-teaser\">An astrolabe, a hill in the Salt Range, and an answer within a fraction of a percent — partly by luck, since he had no way to correct for refraction</span>",
  "html": "<div class=\"callout\"><b>Who did it first: al‑Bīrūnī, around 1018.</b> The Persian scholar Abū Rayḥān al‑Bīrūnī carried out exactly this measurement from a hill at Nandana, in the Salt Range of what is now Pakistan. He first obtained the hill's height by triangulating it from the plain below, then used an astrolabe to measure the dip of the horizon — reporting roughly 34 arcminutes — and applied the same relation R = h·cos δ/(1 − cos δ). Depending on which cubit he used, his answer corresponds to an Earth radius of about 6,300–6,340 km, within a fraction of a percent of the modern 6,371 km<sup class=\"ref\"><a href=\"#s-dip-n10\">[10]</a></sup>. Eratosthenes had measured the Earth some 1,250 years earlier, but by a completely different route — comparing midday shadow angles at two latitudes — so the <em>dip method</em> is credited to al‑Bīrūnī. His accuracy involved some luck: as the table above shows, refraction biases this method by more than 10%, and he had no way to correct for it.</div>"
 },
 {
  "t": "h2",
  "html": "Your own dip, measured on a photograph — and the radius it gives",
  "k": "dip-own-h2"
 },
 {
  "t": "notes",
  "k": "dip-own-p1",
  "html": "The page's author photographed the sea from the plateau de Caussols on 13 June 2026 at 15:23, the eye <span class=\"cv\" data-v=\"ownH\">…</span> above it — the photograph used in the Caussols figure above. It can measure the dip itself, without assuming a globe. The sea horizon lies at the same depression all the way round, on a globe and on a plane alike (where that depression is zero), so its slope in the picture gives the camera's roll, and its height is left free. The level is fixed by the two nearby summits, the dome of the Puy de Tourrettes and the Pic de Courmettes, about 7 km off, whose elevation angles come from the LiDAR terrain with flat trigonometry — no curvature at all, the choice most favourable to a plane (with the globe's own geometry they move by under 2′). The scale is the camera's EXIF focal length: one pixel is <span class=\"cv\" data-v=\"ownPx\">…</span>. The horizon is found in <span class=\"cv\" data-v=\"ownN\">…</span> columns of open sea, scattering <span class=\"cv\" data-v=\"ownSig\">…</span> about a straight line; the summits are matched to <span class=\"cv\" data-v=\"ownSum\">…</span> rms. Result: the sea horizon lies <b><span class=\"cv\" data-v=\"ownDip\">…</span></b> below the level. A plane says 0′."
 },
 {
  "t": "notes",
  "k": "dip-own-p2",
  "html": "Turning a dip into a radius needs the bending of the light, and the standard coefficient k = <span class=\"cv\" data-v=\"ownK\">…</span> is an average for sightlines near the ground. From 1,210 m what counts is the air at the two ends of the grazing ray: the dip depends almost only on the difference between the air at eye level and the air at the apparent horizon, whatever lies in between.<sup class=\"ref\"><a href=\"#s-dip-n2\">[2]</a></sup> For an atmosphere in spherical layers this is exact: n·r·cos α keeps the same value all along a ray (Bouguer's invariant), so the ray that grazes the sea, where the index is n<sub>sea</sub>, reaches the eye with n<sub>sea</sub>·R = n<sub>eye</sub>·(R + h)·cos δ. The reanalysis for that afternoon gives <span class=\"cv\" data-v=\"ownTeye\">…</span> and <span class=\"cv\" data-v=\"ownPeye\">…</span> at the eye, <span class=\"cv\" data-v=\"ownTsea\">…</span> and <span class=\"cv\" data-v=\"ownPsea\">…</span> over the sea where the ray grazes it<sup class=\"ref\"><a href=\"#s-dip-n6\">[6]</a></sup>; with the refractive index of air for visible light<sup class=\"ref\"><a href=\"#s-dip-n5\">[5]</a></sup>, a globe of 6,371 km predicts a dip of <span class=\"cv\" data-v=\"ownPred\">…</span> that day — more bending than standard, as if k were <span class=\"cv\" data-v=\"ownKeq\">…</span>, because the air at 1,210 m was almost as warm as the air over the sea. Solved for R, the photograph's <span class=\"cv\" data-v=\"ownDip\">…</span> gives <b>R = <span class=\"cv\" data-v=\"ownRair\">…</span></b>. With the standard k instead: <span class=\"cv\" data-v=\"ownRk\">…</span>; with no refraction at all: <span class=\"cv\" data-v=\"ownRgeo\">…</span>."
 },
 {
  "t": "formula",
  "fig": "dipFxBouguer",
  "lines": [
   {
    "tex": "R = \\frac{n_{\\text{eye}}\\,h\\cos\\delta}{n_{\\text{sea}} - n_{\\text{eye}}\\cos\\delta}",
    "fallback": "R = n_eye·h·cos δ / (n_sea − n_eye·cos δ)"
   }
  ],
  "gloss": "h = height of the eye above the sea · δ = measured dip · n = refractive index of the air at the eye and where the ray grazes the sea, n − 1 = 79.01·10⁻⁶·P/T (P in hPa, T in K) · with n_sea = n_eye it is the formula of the table above",
  "k": "dip-m2"
 },
 {
  "t": "raw",
  "k": "dip-own-fig",
  "html": "<div class=\"fig dip-own\"><canvas id=\"dipOwnAll\" class=\"dip-own-all\"></canvas><canvas id=\"dipOwnZoom\" class=\"dip-own-zoom\"></canvas><div class=\"tablewrap\"><table class=\"cnav-table\"><caption>Each decision of the measurement changed alone: the dip, and the radius under three assumptions about the air</caption><thead><tr><th>Variant</th><th>Dip</th><th>R, no refraction</th><th>R, k = 0.13</th><th>R, the day's air</th><th>Fit (summits / horizon)</th></tr></thead><tbody id=\"dipOwnTb\"></tbody></table></div></div>"
 },
 {
  "t": "fcap",
  "k": "dip-own-cap",
  "html": "<b>The photograph, and the lines measured on it.</b> Top: the strip of the photograph from the two summits to the open sea, at uniform scale. Yellow dots: the skyline found on the summits; white line: the LiDAR relief projected by the fitted camera; orange dashes: the level (eye level, where a plane puts the horizon); white: the sea horizon measured. Bottom: a magnified piece of the horizon, with the measured points, and for comparison only the globe's horizon for that day's air and for no refraction. No axis is stretched."
 },
 {
  "t": "notes",
  "k": "dip-own-p3",
  "html": "The measurement is imprecise, and the table shows how much. Changing each decision alone — where the hazy horizon is taken, how the skyline is found, whether the summits are given the globe's geometry, a few metres of scrub on them — moves the dip between <span class=\"cv\" data-v=\"ownDipLo\">…</span> and <span class=\"cv\" data-v=\"ownDipHi\">…</span>; with three states of the air, R runs from <span class=\"cv\" data-v=\"ownRLo\">…</span> to <span class=\"cv\" data-v=\"ownRHi\">…</span>. One pixel is <span class=\"cv\" data-v=\"ownPx\">…</span>, and one minute of dip is <span class=\"cv\" data-v=\"ownPct\">…</span> of the radius. The central dip lies <span class=\"cv\" data-v=\"ownGap\">…</span> (<span class=\"cv\" data-v=\"ownGapPx\">…</span>) deeper than the globe predicts for that day's air. The air cannot explain that — it bent the light more than standard, which raises the horizon — so the difference points at the camera: scrub on the summits, residual lens distortion away from the centre of the frame, or where exactly the hazy horizon lies. Taking the free air above the sea at eye height (<span class=\"cv\" data-v=\"ownTfree\">…</span>) instead of the air of the sunny plateau gives <span class=\"cv\" data-v=\"ownRfree\">…</span>. A plane gives no radius at all: its horizon would lie on the level line, <span class=\"cv\" data-v=\"ownDip\">…</span> above the one photographed."
 },
 {
  "away": "xp-dip-4",
  "t": "exp",
  "h": "Experiment 4 · horizon dip",
  "title": "Climb, and measure how far the sea horizon falls",
  "lead": "Stand at the shore with a levelled instrument and measure the angle between true horizontal and the sea horizon. Then climb — a cliff path, a tall building, a hill — and measure again from a known height.",
  "iv": "<span class=\"vartag iv-t\">Independent variable</span><br> <b>What you change:</b> your <b>eye height h</b> above sea level. You choose it by where you stand: 2 m, then 50 m, then 300 m. Set it with the height control at the top of this tab.",
  "dv": "<span class=\"vartag dv-t\">Dependent variable</span><br> <b>What you measure:</b> the <b>dip angle</b> — how far the horizon sits below level. The world decides this.",
  "meta": [],
  "inputs": [],
  "out": "exp4out",
  "verdict": "exp4v",
  "k": "x:c77cc604"
 },
 {
  "t": "h2",
  "html": "Below eye level and still in the sky — the band the Sun has to cross",
  "k": "dp-h1"
 },
 {
  "t": "notes",
  "html": "Everything above treats the dip as a correction. Turn it round and it becomes something you can <em>watch</em>. If the horizon sits δ below your eye level, then there is a strip of sky, δ tall, that is <b>below the level line and above the horizon at the same time</b>. Anything in that strip — the Sun, the Moon, a planet, a distant aircraft — is seen whole, against sky, with nothing in front of it, while a bubble level says it is beneath you. From a mountain or an airliner the strip is several Sun‑widths tall and it takes the Sun a quarter of an hour to cross it.",
  "k": "dp-p1"
 },
 {
  "t": "notes",
  "html": "On a flat plane that strip cannot exist, and not by a little. The ground's depression angle is atan(h/x), which shrinks toward zero as the ground recedes: eye level <em>is</em> the vanishing line, and the surface fills every direction below it out to the limit of visibility. An object seen below your own eye level would have to be seen through the ground. The flat model does not predict a thin strip, or a strip that needs good conditions. It predicts a strip of width <b>zero</b>, at every height, which is rule 4 again: an absence against a presence.",
  "k": "dp-p2"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "lines": [
   {
    "tex": null,
    "fallback": "Whole Sun below level <em>and</em> clear of the horizon &nbsp;⇔&nbsp; <span class=\"tex\" data-tex=\"\\g{\\delta(h) \\gt 32\\arcmin}\"><b>δ(h) &gt; 32′</b></span>"
   },
   {
    "tex": null,
    "fallback": "window = <span class=\"tex\" data-tex=\"\\g{\\delta - 32\\arcmin}\"><b>δ − 32′</b></span>"
   },
   {
    "tex": null,
    "fallback": "time = <span class=\"tex\" data-tex=\"\\g{\\frac{\\delta - 32\\arcmin}{15.04\\deg/\\text{h}\\times\\cos\\varphi}}\"><b>(δ − 32′) / (15.04°/h × cos φ)</b></span>"
   }
  ],
  "fig": "dipfig3",
  "gloss": "The Sun spans about 32′<sup class=\"ref\"><a href=\"#s-dip-n4\">[4]</a></sup>, so its whole disc is under your eye level once its centre is 16′ below, and it is still wholly clear of the horizon until its centre reaches 16′ above the horizon line. Subtract: the window opens at a dip of one Sun‑width, which is an eye height of about 330 m. The rate is the equinox rate at latitude φ; away from the equinox it is slower still, which only lengthens the window.",
  "k": "x:dp-f1"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\" style=\"margin:16px 0\"> <canvas id=\"dipBand\"></canvas> <div class=\"fcap\" id=\"dipBandCap\"></div> </div>"
 },
 {
  "t": "table",
  "id": "",
  "tbody": "bandRows",
  "caption": "The band below eye level, at documented heights, and how long the Sun spends inside it",
  "head": [
   "Eye height",
   "Dip δ",
   "Band, in Sun‑widths",
   "Whole disc below level and clear",
   "Time to cross, φ = 45°",
   "Flat plane"
  ],
  "k": "x:09147b18"
 },
 {
  "t": "raw",
  "tag": "p",
  "class": "rate-note",
  "id": "bandNote",
  "html": "<p class=\"rate-note\" id=\"bandNote\"></p>"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>This is not the Sun setting, and that is the whole point.</b> Occultation is a separate event that happens later, when the disc finally reaches the horizon line. The claim here is about the interval <em>before</em> it: the Sun entire, nothing covering any part of it, sky visible underneath it, and a levelled instrument reading it as below the horizontal. You can photograph the state directly — one frame containing the Sun, the sea horizon under it, and a plumb line or a levelled bar in the same field of view. There is no version of a flat plane in which that frame exists.",
  "k": "dp-c1"
 },
 {
  "t": "callout",
  "flat": true,
  "html": "<b>Three things that can spoil it, stated in advance.</b> First, the level has to be a real level: in an aircraft the apparent vertical follows the resultant of gravity and acceleration, so a bank or a climb tilts it — take the reading in steady cruise, and prefer the angle from the Sun <em>to the horizon</em>, which no instrument error can manufacture. Second, refraction lifts objects near the horizon by roughly 34′<sup class=\"ref\"><a href=\"#s-dip-n1\">[1]</a></sup> and shrinks the dip by about 8%<sup class=\"ref\"><a href=\"#s-dip-n2\">[2]</a></sup>; both are already in the numbers above, and both work <em>against</em> the effect rather than creating it. Third, over land the horizon is terrain, not the geometric horizon, so this is a sea‑horizon measurement. None of the three turns a zero into 3°.",
  "k": "dp-c2"
 },
 {
  "away": "xp-dip-4b",
  "t": "exp",
  "h": "Experiment 4b · the doubled sunset",
  "title": "Watch the same sunset twice, and get the radius of the Earth out of a stopwatch",
  "lead": "Sit at the water's edge facing west and watch the Sun's last edge disappear. Then stand up — or run up a dune, or take a lift, or take off — and it comes back. The delay is not an illusion and it is not small: it is δ(h₂) − δ(h₁) divided by the rate at which the Sun sinks. Rawlins proposed this in 1979<sup class=\"ref\"><a href=\"#s-dip-n3\">[3]</a></sup> as a way to measure the planet with a wristwatch and a metre stick, and Minnaert did the six‑metre version by running up a dyke.<sup class=\"ref\"><a href=\"#s-dip-n2\">[2]</a></sup>",
  "iv": "<span class=\"vartag iv-t\">Independent variable</span><br> <b>What you change:</b> your <b>eye height</b>, between the first sunset and the second. Sitting to standing is half a metre; a stairwell is ten; an aircraft is eleven thousand.",
  "dv": "<span class=\"vartag dv-t\">Dependent variable</span><br> <b>What you measure:</b> the <b>delay</b> in seconds between the two disappearances — one number, from a stopwatch.",
  "meta": [],
  "inputs": [
   [
    "expDbA",
    "Lower eye height <span class=\"unit\">(m)</span>",
    " type=\"number\" id=\"expDbA\" value=\"1.2\" min=\"0.1\" max=\"20000\" step=\"0.1\""
   ],
   [
    "expDbB",
    "Higher eye height <span class=\"unit\">(m)</span>",
    " type=\"number\" id=\"expDbB\" value=\"6\" min=\"0.2\" max=\"20000\" step=\"0.1\""
   ],
   [
    "expDbLat",
    "Latitude <span class=\"unit\">(°)</span>",
    " type=\"number\" id=\"expDbLat\" value=\"52\" min=\"-70\" max=\"70\" step=\"0.5\""
   ],
   [
    "expDbT",
    "Delay you measured <span class=\"unit\">(s)</span>",
    " type=\"number\" id=\"expDbT\" value=\"16\" min=\"0.1\" max=\"7200\" step=\"0.1\""
   ]
  ],
  "out": "expDbOut",
  "verdict": "expDbV",
  "k": "x:dp-exph"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>It is measured, not inferred.</b> A dip meter (or a theodolite levelled with a bubble, or a sextant's artificial horizon) reads the angle between the true horizontal and the sea horizon directly. From a 10 m bridge it is about 5.6′ (0.093°); from a 100 m cliff about 17.6′ (0.293°); from an airliner at 10 km about 3.0°. Those numbers are tabulated, reproducible with hardware costing a few hundred euros, and they track √h exactly as arccos(R/(R+h)) requires. A plane predicts 0.0′ = 0.000° at every one of those heights.",
  "k": "c741c9e3"
 },
 {
  "t": "h2",
  "html": "The doubled sunset, on an instrument: Mauna Loa and the coast below it",
  "k": "ml-h1"
 },
 {
  "t": "notes",
  "html": "Experiment 4b asks for a stopwatch. NOAA's observatory on Mauna Loa, 3,397 m up on the island of Hawaii, runs something better: a pyrheliometer, a tube that follows the Sun and records its direct light every minute. The record is open to anyone.<sup class=\"ref\"><a href=\"#s-dip-n7\">[7]</a></sup> It says, to the minute, when sunlight stops reaching the mountain each evening. 55 km away towards the summer sunset, at Keahole Point on the coast (4 m), there is also a station.<sup class=\"ref\"><a href=\"#s-dip-n8\">[8]</a></sup> It measures only the light of the whole sky, which does not mark the sunset, so its sunset is computed. Both are put on one clock.",
  "k": "ml-p1"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig dip-mlo",
  "id": "",
  "html": "<div class=\"fig dip-mlo\"><canvas id=\"dipMlo\" role=\"img\" aria-label=\"An animated cross-section through the Earth in the direction of the sunset, with Mauna Loa Observatory on its mountain and Keahole Point on the coast 55 km closer to the Sun. As the clock runs, the last ray of sunlight, grazing the sea, sweeps upward: Keahole falls into the Earth's shadow first, the mountain minutes later. Below, the western sky from each place, and the direct sunlight measured at Mauna Loa on the same clock.\"></canvas><div class=\"reads\" id=\"dipMloReads\"></div></div>",
  "k": "ml-fig"
 },
 {
  "t": "fcap",
  "html": "<b>One clock, two sunsets.</b> Top: a cross-section through the Earth in the direction of the setting Sun on a typical evening, chosen by a rule fixed in advance: of the year's clear evenings, the one whose last light came closest to the median. The Sun is to the left. The yellow line is the last ray that still reaches the ground, grazing the sea. The grey band behind the Earth is its shadow. Rule 1: to show a 3.4 km mountain beside the curve of the sea, the Earth is drawn smaller and the distances along the ground shortened, by the factors printed on the figure. The heights are true, and the ray and its tangent point land where they would on the real Earth. The terrain between the two places is the Copernicus surface model. Middle: the western sky from each place, at true angular scale, with eye level dashed. From the mountain the sea horizon lies 1.7° below eye level, and the Sun sinks into that gap before it sets. Bottom: the direct sunlight measured at Mauna Loa that evening (black), with the computed sunsets. Click to pause.",
  "k": "ml-cap"
 },
 {
  "t": "formula",
  "fig": "dipFxMlo",
  "flat": false,
  "style": "",
  "lines": [
   {
    "tex": "a_{\\odot} = -(\\varphi + \\rho_0 + s)",
    "fallback": "a = −(φ + ρ₀ + s)"
   },
   {
    "tex": "\\varphi = \\dfrac{1}{1-k}\\arccos\\dfrac{R_e}{R_e + h}, \\qquad R_e = \\dfrac{R}{1-k}",
    "fallback": "φ = arccos(Rₑ/(Rₑ + h)) / (1 − k),   Rₑ = R/(1 − k)"
   },
   {
    "tex": null,
    "fallback": "<span style=\"color:var(--ink-soft);font-weight:400\">Keahole (h = 4 m): a = −0.81° · Mauna Loa (h = 3,397 m): a = −2.75° (−2.13° without refraction)</span>"
   }
  ],
  "gloss": "a is the true altitude of the Sun's centre at the moment its upper edge disappears. The last ray that reaches the eye grazes the sea at a tangent point, an arc φ away. Beyond that point it bends a further ρ₀ ≈ 34′ in the air<sup class=\"ref\"><a href=\"#s-dip-n1\">[1]</a></sup>, and the centre of the Sun is s ≈ 16′ below its edge.<sup class=\"ref\"><a href=\"#s-dip-n4\">[4]</a></sup> Refraction near the ground enters through Rₑ = R/(1 − k), k = 0.13.<sup class=\"ref\"><a href=\"#s-dip-n2\">[2]</a></sup> The mountain keeps the Sun until it is almost 2° lower than at the coast, about 9 minutes of the Sun's motion on a summer evening there. Keahole lies 55 km further west, which alone gives it about 2 minutes more, so the mountain's lead is 6 to 7 minutes.",
  "k": "ml-f1"
 },
 {
  "t": "notes",
  "html": "One evening proves little, so here is the whole of 2016. The direct light ended on 331 evenings, 286 of them clear. On 104 of those, the Sun set where the observatory's horizon is the sea: April to August. In the other months it sets further south, behind the slopes of Mauna Loa itself (the Copernicus terrain model<sup class=\"ref\"><a href=\"#s-dip-n9\">[9]</a></sup>). Those evenings are left out by that rule alone. On the 104, the light stopped with the Sun's centre 1.72° below the horizontal (median), and below it on 90 evenings. It stopped a median 1.9 minutes after Keahole's computed sunset, and later than that sunset on 70 evenings. The geometry predicts more: the last edge at −2.75°, 6.6 minutes after Keahole (6.0 without refraction). The instrument loses the beam about a degree early, because a ray grazing the sea crosses hundreds of kilometres of low air and arrives too dim for the 5 W/m² threshold. That loss works against the effect, not for it.",
  "k": "ml-p2"
 },
 {
  "t": "callout",
  "flat": true,
  "html": "<b>What the plane predicts, and what would have vindicated it.</b> On a plane, nothing is ever seen below eye level. And a lamp at height H and distance D is seen at atan((H − h)/D): lower from a mountain than from the shore. If anything, the mountain would lose the Sun <em>first</em>. On a globe the mountain loses it minutes <em>later</em>, and the record agrees on most evenings. What would vindicate the plane: on the same clear evening, the mountain's last direct light coming no later than the coast's, measured by the same kind of instrument at both places. That second instrument is what this section lacks. Keahole's sunset is computed, so the comparison is between a measurement and a prediction, not between two measurements.",
  "k": "ml-c1"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>Limits, stated in advance.</b> The tracker is aimed by the same astronomical calculation used here, and it sees a patch of sky several degrees wide. On its own, then, it cannot place the Sun to a fraction of a degree. What it fixes is the <em>time</em> the light stops, and the Sun's position at that time is ordinary astronomy, the same that predicts every sunset at sea level. The threshold makes the measured last light come early, by about a degree, and the amount varies with the haze. Near azimuth 300° the summit of Hualālai, 35 km away, rises just above the sea horizon. No evening of 2016 set there, and the rule would have left it out. This is one year of one observatory; the build script redoes any other year.",
  "k": "ml-c2"
 },
 {
  "t": "notes-block",
  "paras": [
   "<span class=\"k\">Why a plane has no horizon at all.</span> On an infinite plane the ground's depression angle below eye level is atan(h/x), which shrinks toward zero as x grows but never reaches it. The surface would fade into haze at a distance set by air clarity — blurry, weather‑dependent, and different for every camera. What is actually seen is a <em>sharp, hard edge</em> at a definite distance that sharpens with better optics, sits lower the higher you climb, and hides ships hull‑first. The right panel shows the flat model's depression at the same distance where the globe places its horizon: a number that is not zero, but is far too small and in the wrong place."
  ],
  "k": "dp-n1"
 },
 {
  "t": "notes-block",
  "paras": [
   "<span class=\"k\">Refraction, again.</span> Air bends light downward, pushing the horizon farther away and reducing the dip by roughly 8%. That is why the almanac constant is 1.76′√h rather than the geometric 1.93′√h. Toggle it above: it changes the numbers by a few percent, never the sign, and never rescues zero."
  ],
  "k": "dp-n2"
 },
 {
  "t": "notes-block",
  "paras": [
   "<span class=\"k\">The through‑line.</span> Same R again — the dip is simply the elevation angle of the tangent sightline, the limiting case of the Simulator's geometry when the target's height goes to zero. It is the horizon whose dip the perspective panel already draws, and the same R that fixes k = 1/R and converts Δλ into kilometres."
  ],
  "k": "dp-n3"
 },
 {
  "t": "xrefs",
  "keys": [
   "ref",
   "hh",
   "elev",
   "obs"
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
  "html": "<div class=\"srcs reading\"><b class=\"h\">Further reading</b> <div class=\"note\">Not cited above, and no claim on this tab rests on it — listed because it is what you would read next, or because it lets you redo the measurement on data this page did not choose.</div> <ul> <li id=\"s4-r1\"><a href=\"https://arxiv.org/pdf/1312.7288\">Sparavigna (2013), \"The Science of al-Biruni\" (arXiv)</a> — al-Bīrūnī's height-plus-dip measurement at the Fort of Nandana and the resulting Earth radius, within about 2% of the modern reference value.</li> <li id=\"s4-r2\"><a href=\"https://mathshistory.st-andrews.ac.uk/Biographies/Al-Biruni/\">MacTutor History of Mathematics: al-Biruni</a> — biography and his geodesic work in context.</li> <li id=\"s4-r3\"><a href=\"https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2010JD014067\">Hirt et al. (2010), <em>J. Geophys. Res.</em> — terrestrial refraction coefficient</a> — why refraction biases the one-hill method by ~10% and why k is weather-dependent, as the table above shows.</li> <li id=\"s4-r4\"><a href=\"https://www.dco.uscg.mil/Portals/9/NMC/pdfs/examinations/bowditch_Vol_2_2019.pdf\">Bowditch, <em>The American Practical Navigator</em>, Vol.&nbsp;2 — dip tables</a> — the published dip and horizon-distance tables against which every entry in the vantage-point list above can be checked. The heights themselves are the operators' own published figures (basilica esplanade 142&nbsp;m, Eiffel Tower top platform 276&nbsp;m, Burj Khalifa SKY 555&nbsp;m); the summits are from the sources in tab&nbsp;1.</li> <li><b>Explanatory Supplement to the Astronomical Almanac</b>, 3rd edition (2013), chapter 7 — the conventions behind the dip and refraction corrections that the almanacs tabulate.</li> <li><b>Jamil Ali (trans.), <em>The Determination of the Coordinates of Positions for the Correction of Distances between Cities</em> (American University of Beirut, 1967).</b> The standard English translation of al-Bīrūnī's <em>Taḥdīd</em>, in which the mountain-dip method is set out by the man who used it around 1018. The sources above discuss it; this is the text itself.</li> </ul> </div>",
  "k": "x:rd-more"
 }
];
