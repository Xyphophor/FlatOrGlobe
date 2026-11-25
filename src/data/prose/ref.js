// Prose de l'onglet ref, extraite VERBATIM et dans l'ordre du panneau
// legacy par research/extract_prose.py (EN). Rendue par src/core/prose.js.
export const PROSE = [
 {
  "t": "eyebrow",
  "html": "Refraction · where R/(1−k) comes from"
 },
 {
  "t": "h1",
  "html": "Light bends. Here is exactly how much — and why that does not rescue a flat Earth"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig opener",
  "id": "",
  "html": "<div class=\"fig opener\" style=\"margin:18px 0\"> <canvas id=\"refCasesCanvas\"></canvas> <div class=\"fcap\"><b>Same planet, four atmospheres.</b> One observer, four horizontal rays differing only in k, each labelled with its own. Curvature is exaggerated; the factor is printed on the figure and the ratios between the arcs are exact.</div> </div>",
  "k": "x:rf-fcap3"
 },
 {
  "t": "lead",
  "html": "Every other tab on this page carries a refraction switch. Turn it on and the globe stops using its real radius <b>R = 6,371 km</b> and starts using an <em>effective</em> radius <b>R/(1−k)</b>. That single substitution is the most suspected line on the whole page, so this tab does nothing but justify it: Snell's law first, then the geometry, then the weather that fixes <b>k</b>, then the measurements that pin it down.",
  "opener": true,
  "k": "rf-lead"
 },
 {
  "t": "lead",
  "html": "And then the part nobody expects — the same formula that lets refraction help the globe puts a hard <em>ceiling</em> on what refraction is allowed to do, and that ceiling is exactly where the flat model would have to live.",
  "opener": true,
  "k": "rf-lead2"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"refReel\" class=\"ref-reel\"></canvas></div>"
 },
 {
  "t": "fcap",
  "k": "refReel-cap",
  "html": "<b>The whole tab in under a minute.</b> Light bending in thinning air; the same curvature taken from the ray and from the ground, which leaves R/(1 − k); why ordinary refraction lifts distant objects over a plane instead of hiding them; 97 reciprocal lines of the 1800s, all above the plane's zero; one line hour by hour in 1879; the k of 300,000 radiosondes of 2026, by day and by night; the 2019 Worthing–Brighton laser test redone in the air its own thermometers measured; the air each model needs for the dip measured at Caussols. Every number is the page's own. Click to pause."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "",
  "lines": [
   {
    "tex": "\\frac{1}{\\rho} = -\\frac{\\cos\\beta}{n}\\cdot\\frac{dn}{dh}",
    "fallback": "1/ρ = −(cos β / n) · dn/dh"
   },
   {
    "tex": "k \\equiv \\frac{R}{\\rho}",
    "fallback": "k ≡ R/ρ"
   },
   {
    "tex": "\\g{R_{\\text{eff}} = \\frac{R}{1-k}}",
    "fallback": "<b>R<sub>eff</sub> = R / (1 − k)</b>"
   }
  ],
  "fig": "reffig0",
  "gloss": "Three steps, and only the middle one is a definition. A vertical gradient of refractive index bends a ray into a circle of radius ρ; the refraction coefficient k is nothing but the ratio of the ray's curvature to the Earth's; and because only the <em>difference</em> of two curvatures can ever be observed, a curved ray over a sphere of radius R behaves exactly like a straight ray over a sphere of radius R/(1−k). Everything below is the proof, the numbers, and the limits.",
  "k": "x:rf-gloss"
 },
 {
  "t": "h2",
  "html": "What refraction actually is — and which way it bends",
  "k": "rf-h1"
 },
 {
  "t": "lead",
  "html": "The refractive index is <b>n = c/v</b>, the speed of light in vacuum over its speed in the medium. Denser air is slower, so it has a larger n: at sea level n − 1 ≈ 2.77 × 10⁻⁴, and at the top of the troposphere about a quarter of that. The atmosphere is a stack of transparent layers whose n decreases upward, and a ray crossing it obeys Snell's law at every level: <b>n₁ sin θ₁ = n₂ sin θ₂</b>, θ measured from the vertical.",
  "opener": false,
  "k": "rf-p1"
 },
 {
  "t": "lead",
  "html": "Which way it bends is clearest from the wavefront — a marching band advancing in line abreast. If the left half steps onto mud while the right stays on tarmac, the left half lags and the line pivots toward the mud. The part of a wavefront in the slower, denser medium lags the same way, so the front swings toward the dense side, and the ray, always perpendicular to it, turns with it.",
  "opener": false,
  "k": "rf-p2"
 },
 {
  "t": "lead",
  "html": "That is the whole mechanism, and it is why the popular one-liner \"light bends toward the denser medium\" is nearly right but worth stating precisely:",
  "opener": false,
  "k": "rf-p2b"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>The exact statement.</b> A ray's <em>centre of curvature lies on the denser side</em>. In the Earth's atmosphere, denser means lower, so a near-horizontal ray is concave downward — it bends around the planet rather than away from it.",
  "k": "rf-call1"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "Note what this does <em>not</em> say: that the ray moves downward. Over a long sightline the ray rides <b>above</b> the straight chord between its endpoints, bulging up into the thin, fast air like a lifeguard who runs further along the beach to shorten the swim. Both descriptions are the same curve — one local (which way it turns), one global (where the path goes) — and confusing them is the commonest error in amateur refraction arguments, on both sides.",
  "k": "rf-call1b"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "cnav-grid",
  "id": "",
  "html": "<div class=\"cnav-grid\"> <div class=\"fig\"> <canvas id=\"refSnellCanvas\"></canvas> <div class=\"fcap\"><b>Snell's law, layer by layer.</b> Refractive index increases downward. A ray launched slightly upward is bent a little more horizontal at each interface it crosses going up, until it levels off and comes back down. Short ticks are the wavefront, always perpendicular to the ray. The dashed line is the straight chord: the real path lies above it. Index steps are hugely exaggerated so the kinks are visible; in real air there are no steps at all, only a smooth gradient, and the polyline becomes a circular arc.</div> </div> <div class=\"fig\"> <canvas id=\"refCirclesCanvas\"></canvas> <div class=\"fcap\"><b>Two circles, one subtraction.</b> The planet is one circle; under a uniform gradient the light path is another, of radius ρ = R/k — about 7.7 times larger at k = 0.13. Measured down from the observer's horizontal, the ground falls away by d²/2R and the ray only by d²/2ρ. What an observer can ever see is the <em>gap</em> between them. Curvature is exaggerated (factor printed on the figure), but the ratio ρ/R is exact.</div> </div> </div>",
  "k": "x:rf-fcap1"
 },
 {
  "t": "h2",
  "html": "The atmosphere is a measured stack, not a free parameter",
  "k": "rf-h2"
 },
 {
  "t": "lead",
  "html": "Air's refractivity for visible light follows a formula fixed in the laboratory: <b>n − 1 ≈ 78.8 × 10⁻⁶ · P/T</b>, with pressure P in hectopascals and temperature T in kelvin. Put in P = 1013 hPa and T = 288 K and you get the 2.77 × 10⁻⁴ quoted above. Nothing here is adjustable — it is a property of nitrogen and oxygen.",
  "opener": false,
  "k": "rf-p3"
 },
 {
  "t": "lead",
  "html": "To find how n changes with height, differentiate that expression and feed in the one other thing the atmosphere is obliged to do — support its own weight. Hydrostatic balance says dP/dh = −ρ<sub>air</sub> g, which for an ideal gas becomes dP/dh = −(g/R<sub>d</sub>)·(P/T) = −0.0342 · P/T hPa per metre. Combining the two:",
  "opener": false,
  "k": "rf-p4"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--obj1)",
  "lines": [
   {
    "tex": "\\frac{dn}{dh} = -78.8\\times 10^{-6}\\cdot\\frac{P}{T^2}\\left(0.0342 + \\frac{dT}{dh}\\right)",
    "fallback": "dn/dh = −78.8 × 10⁻⁶ · (P/T²) · ( 0.0342 + dT/dh )"
   }
  ],
  "fig": "reffig1",
  "gloss": "P in hPa, T in K, dT/dh in K per metre. This is the entire physical input to everything that follows. Under a standard atmosphere at sea level (P = 1013 hPa, T = 288 K, dT/dh = −0.0065 K/m) it evaluates to <b>−2.66 × 10⁻⁸ per metre</b>: the index of air drops by about 27 parts per billion for every metre you climb. That is a fantastically small number, and it is enough to bend a sightline visibly over 50 km.",
  "k": "x:rf-gloss2"
 },
 {
  "t": "h2",
  "html": "Snell's law on a round planet: the ray is an arc of a circle",
  "k": "rf-h3"
 },
 {
  "t": "lead",
  "html": "Applying Snell's law across a stack of <em>curved</em> layers gives a conserved quantity, first written down by Pierre Bouguer in 1729 and known ever since as the refractive invariant: <b>n · r · sin z = constant</b> along a ray, where r is distance from the Earth's centre and z is the ray's local zenith angle.<sup class=\"ref\"><a href=\"#s-ref-n1\">[1]</a></sup> It is the optical twin of angular momentum, and it falls straight out of Fermat's principle in a spherically symmetric medium.<sup class=\"ref\"><a href=\"#s-ref-n8\">[8]</a></sup> Differentiating it along the path gives the curvature of the ray itself:",
  "opener": false,
  "k": "rf-p5"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "",
  "lines": [
   {
    "tex": null,
    "fallback": "<span class=\"tex\" data-tex=\"\\frac{1}{\\rho} = -\\frac{\\cos\\beta}{n}\\cdot\\frac{dn}{dh}\">1/ρ = −(cos β / n) · dn/dh</span> &nbsp;&nbsp;→&nbsp;&nbsp; <span class=\"tex\" data-tex=\"\\frac{1}{\\rho} \\approx \\left|\\frac{dn}{dh}\\right|\">1/ρ ≈ |dn/dh|</span> for a near-horizontal ray"
   }
  ],
  "fig": "reffig2",
  "gloss": "β is the ray's elevation above the local horizontal, so cos β ≈ 1 for the long, nearly level sightlines this page argues about, and n ≈ 1 always. A ray aimed steeply upward bends far less — which is why the Sun's refraction is 34′ at the horizon and essentially zero at the zenith. With the standard gradient above, ρ = 1/(2.66 × 10⁻⁸) ≈ <b>37,500 km</b>; at the page's default k = 0.13 it is ≈ 49,000 km.",
  "k": "x:rf-gloss3"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>Yes — under uniform refraction the ray really is a circle, and your two-circle picture is the right one.</b> Look at the formula: if dn/dh is constant over the slab of air the ray occupies, then 1/ρ is constant, and a curve of constant curvature is a circular arc. So the geometry reduces to exactly two circles — the Earth of radius R, and the light path of radius ρ, sharing a common vertical at the observer and slowly separating.",
  "k": "rf-call2"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>Three honest caveats.</b> First, dn/dh falls off with height, so the arc is only <em>locally</em> circular and a ray climbing several kilometres straightens out. Second, cos β means a steep ray curves less than a flat one, so “one ρ” holds only for near-horizontal rays. Third, the approximation needs h ≪ 8 km, the atmosphere's scale height, which every terrestrial sightline satisfies. Within those limits the circular arc is geodesy's standard working tool, not a simplification invented for this page.<sup class=\"ref\"><a href=\"#s-ref-n3\">[3]</a></sup>",
  "k": "rf-call2b"
 },
 {
  "t": "h2",
  "html": "Subtracting one curvature from the other: R/(1−k), derived",
  "k": "rf-h4"
 },
 {
  "t": "lead",
  "html": "Now the step everything else on this page depends on. Define the refraction coefficient as the ratio of the two curvatures: <b>k ≡ R/ρ</b> — how much of the Earth's curvature the light path already imitates. Stand an observer on the sphere and drop a horizontal tangent line from the eye. Over a horizontal distance d:",
  "opener": false,
  "k": "rf-p6"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\" style=\"margin:18px 0\"> <div class=\"preset-row\" style=\"margin-bottom:6px\"> <span class=\"preset-lbl\">Unbend the light</span> <button class=\"presetbtn\" id=\"refFrCurved\" aria-pressed=\"true\">Curved ray, real R</button> <button class=\"presetbtn\" id=\"refFrStraight\" aria-pressed=\"false\">Straight ray, R/(1−k)</button> <span style=\"flex:1 1 auto\"></span> <button class=\"presetbtn\" id=\"refPlay\" aria-pressed=\"false\" aria-label=\"Play or pause the morph\">&#9654;</button> </div> <div class=\"reads\" id=\"refMorphReads\"></div> <canvas id=\"refMorphCanvas\"></canvas> <div class=\"fcap\"><b>Watch the gap, not the arcs.</b> Press play and the whole scene is bent by one common amount until the light comes out straight — subtracting 1/ρ from the ray and from the ground at the same time, which is the only move the derivation above makes. The ray unrolls from a 49,000 km arc into a line; the planet swells from 6,371 km to 7,323 km. And the orange bar, the amount of the far pole that sits below the line of sight, does not move by a single pixel, because it is set by the <em>difference</em> of the two curvatures and that difference is what the subtraction leaves alone.</div> <div class=\"fcap\">Everything an observer could measure lives in that bar. Curvature is exaggerated so that any of this is visible at all — the factor is printed on the figure, and every ratio between the drawn arcs is exact.</div> </div>",
  "k": "x:rf-anlbl1"
 },
 {
  "t": "formula",
  "flat": true,
  "style": "border-left-color:var(--flat)",
  "lines": [
   {
    "tex": null,
    "fallback": "ground below tangent: &nbsp;<span class=\"tex\" data-tex=\"x_E = R\\left(\\sec\\frac{d}{R} - 1\\right) \\approx \\frac{d^2}{2R}\">x<sub>E</sub> = R(sec(d/R) − 1) ≈ d²/2R</span>"
   },
   {
    "tex": null,
    "fallback": "ray below tangent: &nbsp;<span class=\"tex\" data-tex=\"x_L \\approx \\frac{d^2}{2\\rho} = \\frac{k\\,d^2}{2R}\">x<sub>L</sub> ≈ d²/2ρ = k·d²/2R</span>"
   },
   {
    "tex": null,
    "fallback": "<b>ray above ground: &nbsp;<span class=\"tex\" data-tex=\"x_E - x_L = (1-k)\\frac{d^2}{2R} = \\frac{d^2}{2R_{\\text{eff}}}\">x<sub>E</sub> − x<sub>L</sub> = (1 − k)·d²/2R = d² / 2R<sub>eff</sub></span></b>"
   }
  ],
  "fig": "reffig3",
  "gloss": "One line of algebra, and R<sub>eff</sub> = R/(1−k) drops out. The point is not the algebra but what it means: no observation can separate \"the ground curved away from me\" from \"my line of sight curved down with it\". Only the difference of the two curvatures is ever visible. So you may legitimately subtract 1/ρ from both, which straightens the ray and leaves a sphere of curvature (1−k)/R. Curved ray over a real Earth ⇔ straight ray over a bigger fictitious Earth. Exactly equivalent, to second order in d/R.",
  "k": "x:rf-gloss4"
 },
 {
  "t": "fold",
  "q": false,
  "k": "ref-fold1",
  "summary": "<b>Why a curved ray over R is exactly a straight ray over R/(1−k)</b><span class=\"fold-teaser\">Snell gives the ray its own curvature; one subtraction gives the equivalence; and the last two lines price what the subtraction throws away</span>",
  "html": "<div class=\"formula\" style=\"border-left-color:var(--globe)\"> <div class=\"big\"><div class=\"ln\"><span class=\"eqn\">(1)</span>&nbsp;<span class=\"tex\" data-tex=\"n\\cos\\beta = \\text{const}\">n cos β = const</span></div><div class=\"ln\"><span class=\"eqn\">(2)</span>&nbsp;<span class=\"tex\" data-tex=\"\\frac{d\\beta}{ds} = \\frac{\\cos\\beta}{n}\\frac{dn}{dh}\">dβ/ds = (cos β / n)(dn/dh)</span></div><div class=\"ln\"><span class=\"eqn\">(3)</span>&nbsp;<span class=\"tex\" data-tex=\"\\frac{1}{\\rho} = -\\frac{\\cos\\beta}{n}\\frac{dn}{dh}\">1/ρ = −(cos β / n)(dn/dh)</span></div><div class=\"ln\"><span class=\"eqn\">(4)</span>&nbsp;<span class=\"tex\" data-tex=\"y_{\\text{ground}} = -\\frac{x^2}{2R}\">y_ground = −x²/2R</span></div><div class=\"ln\"><span class=\"eqn\">(5)</span>&nbsp;<span class=\"tex\" data-tex=\"y_{\\text{ray}} = \\beta x - \\frac{x^2}{2\\rho}\">y_ray = βx − x²/2ρ</span></div><div class=\"ln\"><span class=\"eqn\">(6)</span>&nbsp;<span class=\"tex\" data-tex=\"H(x) = y_{\\text{ray}} - y_{\\text{ground}} = \\beta x + \\frac{x^2}{2R}(1-k)\">H(x) = y_ray − y_ground = βx + (x²/2R)(1 − k)</span></div><div class=\"ln\"><span class=\"eqn\">(7)</span>&nbsp;<span class=\"tex\" data-tex=\"H(x) = \\beta x + \\frac{x^2}{2R_{\\text{eff}}}\">H(x) = βx + x²/2R_eff</span></div><div class=\"ln\"><b><span class=\"eqn\">(8)</span>&nbsp;<span class=\"tex\" data-tex=\"\\frac{1}{R_{\\text{eff}}} = \\frac{1-k}{R} \\implies R_{\\text{eff}} = \\frac{R}{1-k}\">1/R_eff = (1 − k)/R ⟹ R_eff = R/(1 − k)</span></b></div><div class=\"ln\"><span class=\"eqn\">(9)</span>&nbsp;<span class=\"tex\" data-tex=\"R\\left(\\sec\\frac{d}{R} - 1\\right) = \\frac{d^2}{2R} + \\frac{5d^4}{24R^3} + \\ldots\">R(sec(d/R) − 1) = d²/2R + 5d⁴/24R³ + …</span></div><div class=\"ln\"><span class=\"eqn\">(10)</span>&nbsp;<span class=\"tex\" data-tex=\"\\text{residue} = \\frac{5d^4}{24R^3}\\cdot 3k(1-k)\">residue = (5d⁴/24R³)·3k(1 − k)</span></div></div> <div class=\"figsym\" id=\"refFxRay\"></div><div class=\"gloss\">Line (1) is Snell's law in an atmosphere stratified into level layers, with β the ray's elevation above the local horizontal: it is conserved along the whole ray. Differentiate (1) with respect to arc length s, using dh/ds = sin β; the sin β cancels from both sides and (2) is what is left. The ray turns at exactly that rate, so its curvature is (3) — which is the first line of the formula block near the top of this tab, now derived rather than quoted. Nothing has been assumed but Snell's law and layers that are level. Now put x along the tangent plane at the observer and y upward. To second order the ground falls away as (4), and a ray leaving at elevation β with the constant curvature (3) follows (5). The ray's height above the ground is the difference of the two, which is (6), where k ≡ R/ρ. A straight ray over a sphere of radius R_eff would instead give (7). Compare (6) with (7): they agree at every distance x and for every launch angle β if and only if (8). That is the equivalence — not an analogy but an identity between two parabolas, and it is why every other tab on this page may swap R for R_eff and otherwise pretend light travels in straight lines. What that second order costs is line (9): both (4) and (5) are truncated circles, and keeping the next term on both sides leaves the residue (10). Over d = 100 km at k = 0.13 that residue is 2.7 cm, against a ray-above-ground of 683 m — four parts in 100,000, and roughly a thousand times smaller than the ±0.03 that k itself is known to. That is the caveat stated below this section, with a size on it.</div> </div>"
 },
 {
  "t": "lead",
  "html": "This is why k, and not ρ, is the number quoted everywhere: it is dimensionless and it is already the answer. k = 0.13 gives R<sub>eff</sub> = 1.149 R, the value Gauss used for continental sightlines. k = 0.143 gives exactly 7/6 R — the classic surveyor's rule of thumb. Radio engineers, whose wavelengths bend rather more, use k = 0.25 and call it the \"4/3 Earth\". And k = 0.17 is the standard atmosphere at sea level, which the hidden-height tab uses when it concedes the world-record sighting.<sup class=\"ref\"><a href=\"#s-ref-n3\">[3]</a></sup>",
  "opener": false,
  "k": "rf-p7"
 },
 {
  "t": "table",
  "id": "",
  "tbody": "refKRows",
  "caption": "What each k costs you — computed live from the formulas above, R = 6,371 km, eye height 2 m",
  "head": [
   "Refraction coefficient k",
   "Ray radius ρ = R/k",
   "ρ / R",
   "R<sub>eff</sub> / R",
   "Horizon from 2 m",
   "Hidden at 20 km"
  ],
  "k": "x:rf-cap1"
 },
 {
  "t": "notes-block",
  "paras": [
   "<p><span class=\"k\">A caveat this page owes you.</span> The other tabs feed R<sub>eff</sub> into the <em>exact</em> secant formulas rather than into the parabolic approximation the derivation above used. Strictly, the equivalence is only second-order in d/R, so the two disagree slightly at very long range. The disagreement is several orders of magnitude smaller than the uncertainty in k itself, which is why every geodesy textbook does the same thing — but it is an approximation, and it should be named rather than buried.</p>"
  ],
  "k": "x:rf-n1"
 },
 {
  "t": "h2",
  "html": "What sets k? Weather, and nothing else",
  "k": "rf-h5"
 },
 {
  "t": "lead",
  "html": "Multiply the gradient formula by R and you get the working expression every surveyor knows, usually attributed through Gauss to the modern form given in Torge's <em>Geodesy</em>:<sup class=\"ref\"><a href=\"#s-ref-n3\">[3]</a></sup>",
  "opener": false,
  "k": "rf-p8"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "lines": [
   {
    "tex": "k = 503\\cdot\\frac{P}{T^2}\\left(0.0342 + \\frac{dT}{dh}\\right)",
    "fallback": "k = 503 · (P / T²) · ( 0.0342 + dT/dh )"
   }
  ],
  "fig": "reffig4",
  "gloss": "P in hPa, T in K, dT/dh in K per metre. Read what it says. Pressure and temperature move k by a few per cent — a mountain top has thinner air and refracts less. But the bracket is the whole story, and only one term in it can change: the <b>temperature gradient</b>. Everything interesting about refraction, including its sign, is decided by how fast the air cools as you climb.",
  "k": "x:rf-gloss5"
 },
 {
  "t": "lead",
  "html": "The number 0.0342 K per metre in that bracket has a name and a meaning. It is the <b>autoconvective lapse rate</b>, 3.42 °C per 100 m: the rate of cooling at which the fall of pressure and the fall of temperature exactly cancel, so the <em>density</em> of the air is the same at every height.<sup class=\"ref\"><a href=\"#s-ref-n6\">[6]</a></sup> An atmosphere cooling at precisely that rate is optically homogeneous, and light crosses it in perfectly straight lines: k = 0.",
  "opener": false,
  "k": "rf-p9"
 },
 {
  "t": "lead",
  "html": "Cool more slowly than that — which is what real air normally does — and density falls with height, so rays bend down and k is positive. Cool faster, as air does in the first metre above sun-baked asphalt, and density <em>increases</em> upward: rays bend up, k goes negative, and you get the puddle mirage on the road ahead.",
  "opener": false,
  "k": "rf-p9b"
 },
 {
  "t": "table",
  "id": "",
  "tbody": "refCondRows",
  "caption": "The same formula across real conditions (P = 1013 hPa, T = 288 K) — k is computed, not chosen",
  "head": [
   "Condition",
   "dT/dh",
   "k",
   "Ray curvature vs Earth's",
   "What you see"
  ],
  "k": "x:rf-cap2"
 },
 {
  "t": "h2",
  "html": "When k changes with height: layered air, sinking, looming and mirages",
  "k": "rf-hnu"
 },
 {
  "t": "lead",
  "opener": false,
  "k": "rf-nu1",
  "html": "Everything above assumed one gradient over the whole path, which makes the ray an arc of a circle and lets one number, k, describe it. That is a good description for a sightline well above the ground, through air that cools at a steady rate. It is not a good one for a ray that skims a surface. Within a few metres of water or ground the gradient is set by the surface. It is strongest at the bottom and fades with height, roughly as the logarithm of height. So a ray that passes 50 cm above the water bends far more than one that passes 10 m above it, and two points of the same scene, seen by the same eye, can be seen through different values of k.<sup class=\"ref\"><a href=\"#s-ref-n14\">[14]</a></sup>"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "x:rf-gloss-nu",
  "fig": "refFxLayer",
  "lines": [
   {
    "tex": "\\frac{1}{\\rho(h)} = \\frac{k(h)}{R},\\qquad k(h) = 503\\cdot\\frac{P}{T^2}\\left(0.0342 + \\frac{dT}{dh}(h)\\right)",
    "fallback": "1/ρ(h) = k(h)/R, k(h) = 503 · (P/T²) · (0.0342 + dT/dh at height h)"
   }
  ],
  "gloss": "The same formula as before, applied at each height: the ray's curvature at a given moment is set by the gradient of the layer it is crossing. Over a stack of layers the ray is no longer a circle. The single k of R/(1 − k) is then an average over the heights the ray crosses, and different rays have different averages."
 },
 {
  "t": "notes",
  "k": "rf-nu2",
  "html": "<b>What layered air does to a picture.</b> First, it changes the vertical scale. If the low rays bend more than the high ones, the bottom of a distant object is squeezed or pushed down (sinking) or stretched and lifted (looming), while its top is drawn almost normally. Second, when the gradient near the surface is strong enough, low rays turn back before reaching the surface and an inverted copy of the scene appears under it: an <b>inferior mirage</b>. It is the wet-looking road on a hot day, and over water warmer than the air it is the bright strip under distant boats and shores. When warm air lies over cold water, the opposite happens: rays are trapped, distant things loom higher, and stacked or inverted images appear above them (<b>superior mirage</b>, the Fata Morgana).<sup class=\"ref\"><a href=\"#s-ref-n14\">[14]</a></sup><sup class=\"ref\"><a href=\"#s-ref-n15\">[15]</a></sup> Third, one scene can need several values of k at once. The <a class=\"xref\" href=\"#tab-contrib\" data-xref=\"contrib\">Contributions</a> tab measures this on two photographs of a tower 13 km across Gulf St Vincent: the bending that hides the foot of the tower places a building on the shore 2.3 km behind it about 1.5 m too low."
 },
 {
  "t": "notes",
  "k": "rf-nu3",
  "html": "<b>What this site does about it.</b> The standard k = 0.13 describes rays well above the surface. The tabs that depend on refraction say so wherever a sightline skims water, and treat such lines as weak tests. The reciprocal zenith angles of the next section measure the refraction of the line actually used, at the moment it is used. And the traced rays of the contributions tab follow the bending layer by layer instead of using one k."
 },
 {
  "t": "callout",
  "flat": true,
  "k": "rf-nu4",
  "html": "<b>The flat model's best tool, and its limits.</b> Layered air is the strongest version of the refraction argument. A cold layer over warmer water bends low rays upward, and on a plane that alone can hide the foot of a distant object, as a hot road hides the road. Its limits can be measured. It acts within the layer, so it changes with the weather and the tide of the air, not with distance in the steady way curvature does. It leaves marks in the picture: squeezed bottoms, mirrored strips. And it needs a measurable temperature difference, which a thermometer at the water and one a few metres up can check. <b>What would vindicate the plane:</b> distant feet hidden by the amount the globe predicts, day after day, with thermometers showing no layer at all."
 },
 {
  "t": "h2",
  "html": "k is measured, not assumed — and here is the instrument",
  "k": "rf-h6"
 },
 {
  "t": "lead",
  "html": "The charge that refraction is a fudge factor would be fair if k could only ever be inferred from the answer you wanted. It cannot. Surveyors have measured it directly for two centuries with <b>simultaneous reciprocal zenith angles</b>: two instruments, one at each end of a line of known length s, each measuring the angle down from its own local vertical to the other, at the same instant so both see the same air.",
  "opener": false,
  "k": "rf-p10"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "",
  "lines": [
   {
    "tex": null,
    "fallback": "<span class=\"tex\" data-tex=\"z_A + z_B = 180\\deg + \\gamma(1-k),\\quad \\gamma = \\frac{s}{R}\">z<sub>A</sub> + z<sub>B</sub> = 180° + γ(1 − k), &nbsp; γ = s/R</span> &nbsp;&nbsp;→&nbsp;&nbsp; <span class=\"tex\" data-tex=\"\\g{k = 1 - \\frac{z_A + z_B - 180\\deg}{\\gamma}}\"><b>k = 1 − (z<sub>A</sub> + z<sub>B</sub> − 180°) / γ</b></span>"
   }
  ],
  "fig": "reffig5",
  "gloss": "γ is the angle the line subtends at the Earth's centre — 16.19′ over 30 km. With no refraction the two zenith angles would sum to 180° + γ; refraction bends both rays down, subtracting kγ. The two station heights cancel out entirely: they never appear. Simultaneity matters because k swings through the day, and it is what makes the two rays share one atmosphere.<sup class=\"ref\"><a href=\"#s-ref-n7\">[7]</a></sup>",
  "k": "x:rf-gloss6"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "lines": [
   {
    "tex": null,
    "fallback": "<span class=\"eqn\">(a)</span>&nbsp;<span class=\"tex\" data-tex=\"z_A = \\zeta_A - \\delta_A,\\quad z_B = \\zeta_B - \\delta_B\">z_A = ζ_A − δ_A,&nbsp; z_B = ζ_B − δ_B</span>"
   },
   {
    "tex": null,
    "fallback": "<span class=\"eqn\">(b)</span>&nbsp;<span class=\"tex\" data-tex=\"z_A + z_B = 180\\deg + \\gamma - (\\delta_A + \\delta_B)\">z_A + z_B = 180° + γ − (δ_A + δ_B)</span>"
   },
   {
    "tex": null,
    "fallback": "<span class=\"eqn\">(c)</span>&nbsp;<span class=\"tex\" data-tex=\"z_A - z_B = \\zeta_A - \\zeta_B - (\\delta_A - \\delta_B)\">z_A − z_B = ζ_A − ζ_B − (δ_A − δ_B)</span>"
   }
  ],
  "fig": "refFxRecip",
  "gloss": "What reciprocal observation actually cancels — and it is not what most people remember. Write each reading as the straight-line zenith angle ζ minus the refraction angle δ that lifts the far station, line (a). Add the two, line (b): the geometry contributes 180° + γ and the two refraction terms <b>add</b>, giving 180° + γ(1 − k) with δ_A = δ_B = kγ/2. Subtract them, line (c): the two refraction terms <b>cancel</b>, and so does the curvature, leaving nothing but the height difference between the stations — which is why reciprocal trigonometric levelling is famous for being refraction-free, and it genuinely is.</div> <div class=\"gloss\">Simultaneity is what earns both results, for one reason: it makes δ_A equal δ_B. So the difference gives you a height with no k in it, and the sum gives you curvature and refraction together, with the heights gone. This tab uses the sum, on purpose: it is the combination where the nuisance parameter cancels and the two things being argued about survive — and k is separable there because it multiplies γ rather than hiding inside it.",
  "k": "x:rf-recip"
 },
 {
  "t": "lead",
  "html": "Run over test networks with lines from 4 to 23 km, this method returns a mean k of about <b>0.10 in daylight rising to 0.34 at night</b>, when the ground has cooled and inversions form.<sup class=\"ref\"><a href=\"#s-ref-n5\">[5]</a></sup> A 2010 study at ETH Zurich parked two pairs of total stations over grass and logged k continuously at minute-scale resolution, watching it oscillate with the surface heat flux exactly as the temperature-gradient formula predicts.<sup class=\"ref\"><a href=\"#s-ref-n4\">[4]</a></sup> k is not a knob. It is a weather observation, and it behaves like one.",
  "opener": false,
  "k": "rf-p11"
 },
 {
  "t": "callout",
  "flat": true,
  "html": "<b>The circularity objection, taken seriously.</b> A sharp reader will notice that γ = s/R uses the very radius the exercise is supposed to be testing, so measuring k this way assumes a globe. That is true, and it matters — which is why the page does not rest on it.",
  "k": "rf-call3"
 },
 {
  "t": "callout",
  "flat": true,
  "html": "Two replies. First, R is over-determined elsewhere on this page by methods that never use k: great-circle distances flown daily, the magnetic dip law, the analemma, four-satellite GPS closure. Second, the <em>qualitative</em> result needs no R at all: on a plane, reciprocal zenith angles sum to <b>180° or less</b> — exactly 180° for straight light, less for the downward-bending light of normal air. Surveyors measure sums above 180°, everywhere, by an amount growing with distance. No value of k on a plane produces that sign.",
  "k": "rf-call3b"
 },
 {
  "t": "notes",
  "k": "rf-r206a",
  "html": "<b>One line, ten sessions.</b> The surveyor Jesse Kozlowski observed simultaneous reciprocal zenith angles over a 1.5 km stretch of Route 206 in New Jersey, between two marks he had fixed by GNSS, with the line of sight 1.5 to 1.7 m above the ground: in November 2015, on three days of November 2016, and in 2018 on remade marks<sup class=\"ref\"><a href=\"#s-ref-n13\">[13]</a></sup>. The angle between the two verticals, γ, comes from those coordinates: 49.9″ (52.1″ in 2018). The excess the theodolites read ranged from 3″ to 75″, so k = 1 − ε/γ ranged from <b>+0.94 to −0.48</b> on the same line. It was positive on two days and negative through a whole November midday (six sets from 10:05 to 14:28, k between −0.21 and −0.48), when the light bent upward over the road."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "k": "x:rf-r206-setup",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"refFigR206Setup\"></div> <div class=\"fcap\">The setup, seen from the side. Two total stations on tripods over marks at mile posts 27 and 28, 1.54 km apart along the road, sight each other at the same moment; each reads the zenith angle of the other from its own vertical. The two verticals are γ = 49.9″ apart, the angle between the two GNSS positions seen from the Earth's centre. Over cool ground the light arches up and the sum z₁ + z₂ exceeds 180° by less than γ; over a road warmer than the air it sags and the excess exceeds γ<sup class=\"ref\"><a href=\"#s-ref-n13\">[13]</a></sup>.</div> </div>"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "k": "x:rf-r206-map",
  "html": "<div class=\"fig\"><canvas id=\"refR206Map\" role=\"img\" aria-label=\"Map of the Route 206 line in New Jersey: marks at mile posts 27 and 28, 1.54 km apart along the highway, north up\" style=\"width:100%;max-width:440px;height:clamp(300px,calc(420px - 10vw),380px);display:block;margin:0 auto\"></canvas> <div class=\"fcap\">Where: the two marks on the shoulder of US Route 206 in New Jersey, at the coordinates Kozlowski published for 2015–2016 (NAD83, adjusted on the CORS stations NJTW and NJGC)<sup class=\"ref\"><a href=\"#s-ref-n13\">[13]</a></sup>. The 2018 marks were remade a few tens of metres away. Map data © OpenStreetMap contributors (ODbL), to scale of its 500 m bar.</div> </div>"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "k": "x:rf-r206-fig",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"refFigR206\"></div> <div class=\"fcap\">k for each session on the Route 206 line. Below zero, refraction lowers the far mark instead of lifting it and the zenith angles sum to more than geometry alone gives; above zero, to less. The standard 0.13 is an average over many conditions, not a promise for one line at 1.6 m<sup class=\"ref\"><a href=\"#s-ref-n13\">[13]</a></sup>.</div> </div>"
 },
 {
  "t": "callout",
  "flat": true,
  "k": "rf-r206b",
  "html": "<b>Where the radius enters here.</b> A GNSS receiver measures its position in a frame centred on the Earth's centre of mass, the point the satellites orbit, and its latitude and longitude are the direction of that position, corrected for the flattening. Seen from the centre, two receivers 1.5 km apart are γ = s/|r| apart, where |r|, about 6,369 km, is their distance from the centre as the satellite system gives it. The radius is measured, not assumed, but it comes from the satellite ephemerides: k = 1 − ε/γ is the old formula k = 1 − ε·R/s with the GNSS radius in place of 6,371 km. This line measures k, not R, and it counts as a check like the rest of this section. Its lesson is the spread: near the ground k is weather, and it takes either sign.",
 },
 {
  "t": "notes",
  "k": "rf-caus1",
  "html": "<b>The same question asked of a dip: what air does each model need?</b> On 13 June 2026 the sea horizon was measured <span class=\"cv\" data-v=\"rcDip\">…</span>′ below level from the plateau de Caussols, <span class=\"cv\" data-v=\"rcH\">…</span> m above the sea (between <span class=\"cv\" data-v=\"rcDipLo\">…</span>′ and <span class=\"cv\" data-v=\"rcDipHi\">…</span>′ depending on how the photograph is read: dip tab). The ray that grazes the sea and reaches the eye crosses every layer of air in between, but in air made of layers only its two ends count. On the globe the layers are spherical and n·r·cos α keeps its value along the ray (Bouguer); over a plane they are flat and n·cos α keeps its value (Snell).<sup class=\"ref\"><a href=\"#s-ref-n1\">[1]</a></sup> So each model fixes the refractive index the air at the eye must have, given the air at the sea, and that index is a temperature at the eye's pressure."
 },
 {
  "t": "formula",
  "flat": false,
  "k": "rf-caus-fx",
  "fig": "rfCausFx",
  "lines": [
   {
    "tex": "\\g{n_{\\text{sea}}\\,R = n_{\\text{eye}}\\,(R + h)\\cos\\delta},\\qquad n_{\\text{sea}} = n_{\\text{eye}}\\cos\\delta",
    "fallback": "globe: n_sea·R = n_eye·(R + h)·cos δ · plane: n_sea = n_eye·cos δ"
   }
  ],
  "gloss": "δ is the measured dip, h the eye's height, R the globe's radius, n the refractive index of the air at the sea and at the eye, n − 1 = 79.01·10⁻⁶·P/T (P in hPa, T in K). On the plane, cos δ < 1 demands n_eye > n_sea: a sea seen below eye level needs air at the eye that bends light more than the air at the water."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "",
  "id": "",
  "k": "x:rf-caus-fig",
  "html": "<div class=\"fig\"><canvas id=\"rfCausAir\" role=\"img\" aria-label=\"Two gauges, the globe on the left and the plane on the right, around a chart of temperature against height from the sea to the eye at Caussols, 1,210 m. The black lines are the air of 13 June 2026, about 20 °C at both ends. The blue line ends near −5 °C at the eye: the air the globe needs for the measured dip. The orange line ends near −118 °C: the air the plane needs. The gauges give the same as mean temperature gradients, in kelvin per 100 m.\"></canvas></div>"
 },
 {
  "t": "fcap",
  "k": "rf-caus-cap",
  "html": "<b>What each model asks of the air for the dip measured at Caussols.</b> Centre: temperature from the sea (left end, the ERA5 2 m air over the sea, <span class=\"cv\" data-v=\"rcTsea\">…</span> °C at <span class=\"cv\" data-v=\"rcPsea\">…</span> hPa) to the eye at <span class=\"cv\" data-v=\"rcH\">…</span> m (<span class=\"cv\" data-v=\"rcP\">…</span> hPa). Only the two ends count, so each profile is drawn as a straight line. Black: the air of that afternoon, <span class=\"cv\" data-v=\"rcTeye\">…</span> °C at the eye from ERA5 and <span class=\"cv\" data-v=\"rcTfree\">…</span> °C in the free air over the sea from AROME (dashed). Blue: what the globe needs, <span class=\"cv\" data-v=\"rcTg\">…</span> °C at the eye (<span class=\"cv\" data-v=\"rcTgLo\">…</span> to <span class=\"cv\" data-v=\"rcTgHi\">…</span> °C over the readings of the photograph, shaded). Orange: what the plane needs, <span class=\"cv\" data-v=\"rcTf\">…</span> °C. Grey dashes: the air in which the eye's index equals the sea's, light straight on average, <span class=\"cv\" data-v=\"rcTsame\">…</span> °C. <b>The gauges</b>, as in the contributions tab, give the mean gradient between the sea and the eye in kelvin per 100 m: black, that day's air; coloured, what each model needs and its range. The dotted lines are the dry adiabatic (−0.98) and autoconvective (−3.4) lapse rates. Rule 2: the plane gets the same dip, the same heights and the same air at the sea."
 },
 {
  "t": "notes",
  "k": "rf-caus2",
  "html": "The plane needs the air at the eye at <span class=\"cv\" data-v=\"rcTf\">…</span> °C (<span class=\"cv\" data-v=\"rcTfK\">…</span> K): <span class=\"cv\" data-v=\"rcGf\">…</span> K per 100 m over the whole 1,210 m, more than three times the rate at which air becomes denser at the top than at the bottom and overturns.<sup class=\"ref\"><a href=\"#s-ref-n6\">[6]</a></sup> That afternoon the air fell by <span class=\"cv\" data-v=\"rcGd\">…</span> to <span class=\"cv\" data-v=\"rcGd2\">…</span> K per 100 m. The globe needs <span class=\"cv\" data-v=\"rcTg\">…</span> °C at the eye, <span class=\"cv\" data-v=\"rcGg\">…</span> K per 100 m: colder than the day's air too, which is the dip tab's own finding that the measured dip is a few minutes deeper than the air predicts and points at the camera rather than the air. Across the readings of the photograph the globe's need runs from cold to mild (<span class=\"cv\" data-v=\"rcTgLo\">…</span> to <span class=\"cv\" data-v=\"rcTgHi\">…</span> °C); the plane's stays near −120 °C whatever the reading. A difference of minutes of arc on the globe is a difference of more than a hundred kelvins on the plane."
 },
 {
  "t": "notes",
  "k": "rf-bord1",
  "html": "<b>The same question asked of a hidden height: the balcony near Antibes.</b> On 28 March 2026 at 17:34, a photograph taken from a balcony near Antibes, the eye <span class=\"cv\" data-v=\"rbEye\">…</span> m above the sea, shows Bordighera across <span class=\"cv\" data-v=\"rbD\">…</span> km of water (<a data-xref=\"hh\">Hidden height tab</a>). The sea hides the bottom <span class=\"cv\" data-v=\"rbH\">…</span> m of the Villa Regina Margherita, give or take <span class=\"cv\" data-v=\"rbHsd\">…</span> m (the sea line on the photograph, the roof in the Liguria LiDAR, the level of the sea). A dip depends only on the air at its two ends; a hidden height does not. The ray that grazes the sea half way is bent most in the lowest metres, where the temperature changes fastest, so the whole profile counts and the air must be described by its physics. Over the sea the lowest tens of metres follow the surface-layer similarity of Monin and Obukhov, set by the sea's temperature, the air at 2 m, its humidity and the wind.<sup class=\"ref\"><a href=\"#s-ref-n20\">[20]</a></sup> The reanalysis gives them for that minute: sea <span class=\"cv\" data-v=\"rbSst\">…</span> °C, air <span class=\"cv\" data-v=\"rbT2\">…</span> °C at 2 m (<span class=\"cv\" data-v=\"rbAs\">…</span> K from the sea), wind <span class=\"cv\" data-v=\"rbU\">…</span> m/s.<sup class=\"ref\"><a href=\"#s-ref-n19\">[19]</a></sup> Keep the sea, the wind and the humidity, and let the air's temperature be anything: for each air − sea difference from −10 to +4 K, rays are traced from the eye over a sphere of 6,371 km and over a plane, and the height they hide at <span class=\"cv\" data-v=\"rbD\">…</span> km is read. The same family of airs for both models."
 },
 {
  "t": "formula",
  "flat": false,
  "k": "rf-bord-fx",
  "fig": "rfBordFx",
  "lines": [
   {
    "tex": "T(z) = T_{s} + \\frac{\\theta_{*}}{\\kappa}\\left[\\ln\\frac{z}{z_{0}} - \\psi\\left(\\frac{z}{L}\\right)\\right] - \\Gamma z",
    "fallback": "T(z) = T_s + (θ*/κ)·[ln(z/z₀) − ψ(z/L)] − Γz"
   },
   {
    "tex": "\\frac{d\\theta}{dx} = \\g{\\frac{1}{R}} + \\frac{1}{n}\\frac{dn}{dz},\\qquad \\frac{d\\theta}{dx} = \\frac{1}{n}\\frac{dn}{dz}",
    "fallback": "globe: dθ/dx = 1/R + (1/n)·dn/dz · plane: dθ/dx = (1/n)·dn/dz"
   }
  ],
  "gloss": "First line: the temperature at height z over the sea, T<sub>s</sub> the sea's surface, θ<sub>*</sub> the temperature scale of the heat the sea gives the air, κ = 0.4, z<sub>0</sub> the roughness length for heat, ψ the stability correction and L the Obukhov length, both fixed by the air − sea difference and the wind, Γ = 0.98 K per 100 m.<sup class=\"ref\"><a href=\"#s-ref-n20\">[20]</a></sup> Second line: the ray's slope θ against the local level changes with distance x by the bending of the air, (1/n)·dn/dz, plus, on the globe only, the turning of the level itself, 1/R (small slopes; fog traces the exact equations in 5 m steps). The figure: five of these profiles over the sea of 28 March, from air 3 K colder than the sea to 0.5 K warmer."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "",
  "id": "",
  "k": "x:rf-bord-fig",
  "html": "<div class=\"fig\"><canvas id=\"rfBordAir\" role=\"img\" aria-label=\"Two gauges, the globe on the left and the plane on the right, around a chart of temperature against height from the sea to the eye near Antibes, 41.6 m. The black curve is the air of 28 March 2026, from 14.6 °C at the sea surface to 13.6 °C at the eye, with a grey band for half a kelvin either way. The blue curve is the air the globe needs to hide 44.8 m of the Villa Regina Margherita, a little warmer, 14.6 °C at the eye. The orange curve is the air the plane needs, colder, 11.2 °C at the eye. The gauges give the same as mean temperature gradients, in kelvin per 100 m.\"></canvas></div>"
 },
 {
  "t": "fcap",
  "k": "rf-bord-cap",
  "html": "<b>What each model asks of the air for the height hidden at Bordighera.</b> Centre: temperature from the sea surface (<span class=\"cv\" data-v=\"rbSst\">…</span> °C) to the eye at <span class=\"cv\" data-v=\"rbEye\">…</span> m, the whole profile this time. Black: the air of that evening in the reanalysis, <span class=\"cv\" data-v=\"rbTd\">…</span> °C at the eye; the grey band moves the air − sea difference by ± <span class=\"cv\" data-v=\"rbAsSd\">…</span> K, a reanalysis' usual error over the sea. Blue: the air in which the globe's rays hide <span class=\"cv\" data-v=\"rbH\">…</span> m at <span class=\"cv\" data-v=\"rbD\">…</span> km, <span class=\"cv\" data-v=\"rbAsG\">…</span> K from the sea. Orange: the plane's, <span class=\"cv\" data-v=\"rbAsF\">…</span> K. <b>The gauges</b> give the mean gradient between 0.5 m and the eye, in kelvin per 100 m: black, the day's and its band; coloured, what each model needs, with the range that the <span class=\"cv\" data-v=\"rbHsd\">…</span> m margin on the hidden height gives (narrow here). The dotted lines are the dry adiabatic (−0.98) and autoconvective (−3.4) lapse rates. Rule 2: the plane gets the same photograph, eye, distance, sea, wind and humidity."
 },
 {
  "t": "notes",
  "k": "rf-bord2",
  "html": "In the day's air the globe hides <span class=\"cv\" data-v=\"rbHg\">…</span> m at the villa, twice what the photograph shows, and the plane hides <span class=\"cv\" data-v=\"rbHf\">…</span>: on a plane ordinary air lifts the far shore, it never hides it. To hide <span class=\"cv\" data-v=\"rbH\">…</span> m, the globe needs the air at 2 m <span class=\"cv\" data-v=\"rbDg\">…</span> K warmer than the reanalysis has it, <span class=\"cv\" data-v=\"rbGg\">…</span> K per 100 m instead of <span class=\"cv\" data-v=\"rbGd\">…</span>; the plane needs it <span class=\"cv\" data-v=\"rbDf\">…</span> K colder, <span class=\"cv\" data-v=\"rbGf\">…</span> K per 100 m, beyond the dry adiabatic rate. Neither need is extreme in itself: both stay far from the autoconvective rate. The difference is that the globe's need sits just above the band of the day's air and the plane's well below it. Two things make this case less sharp than Caussols. Near the surface, half a kelvin changes the hidden height by tens of metres on the globe (its curve steepens towards a duct, which is why its range is so narrow); and a reanalysis cell 25 km wide does not know the air of this line of sight to better than about half a kelvin. The next section puts this photograph with the others."
 },
 {
  "t": "h2",
  "k": "rf-hair",
  "html": "Fourteen photographs, one question: how far is each model's air from the day's?"
 },
 {
  "t": "notes",
  "k": "rf-air1",
  "html": "<b>Every photograph on this site for which each model was asked what air it needs, side by side.</b> From this tab, the Caussols dip and the Bordighera photograph above; from the published contributions, <span class=\"cv\" data-v=\"rsContrib\">…</span> (each analysed in full in the <a data-xref=\"contrib\">contributions tab</a>). A contribution analysed but not published is left out. The question is always the same: the mean temperature gradient between the bottom of the ray (the sea, or the ground at the horizon) and the eye that each model needs to put the horizon where the photograph shows it, against the gradient of that day's air in the weather models.<sup class=\"ref\"><a href=\"#s-ref-n19\">[19]</a></sup> For a dip only the two ends count (Bouguer and Snell, above); for a hidden height the rays are traced through the day's air with one number changed. Both models get the same margins: the photograph's (the reading of the dip, the hidden height and its error) and the day's air (the spread of the weather models, at least 1 K between the two ends of a dip). <b>Stated in advance:</b> the plane would be vindicated if its z stayed within ±2 on most photographs while the globe's did not; the globe would fail if the roles were reversed."
 },
 {
  "t": "formula",
  "flat": false,
  "k": "rf-air-fx",
  "fig": "rfStatFx",
  "lines": [
   {
    "tex": "z = \\frac{g_{\\text{need}} - g_{\\text{day}}}{\\sqrt{\\sigma_1^2 + \\sigma_2^2}},\\qquad \\chi^2 = \\sum z^2",
    "fallback": "z = (g_need − g_day) / √(σ₁² + σ₂²),  χ² = Σ z²"
   }
  ],
  "gloss": "g is the mean gradient dT/dz between the two ends of the ray; σ<sub>1</sub> is the half-width of the model's range on the side of the day's air, σ<sub>2</sub> that of the day's range on the side of the model's: the two margins that face each other. A z between −2 and +2 means the photograph and the day's air agree within their errors; negative, the model needs colder air at the eye. χ² adds the squares: for n independent photographs that agree it is about n. For a dip read from an aircraft the index at the eye changes in step with the dip, while the temperature it stands for runs off to infinity at the low pressures of altitude, so z is computed there on the index, N = (n − 1)·10⁶: the same test on a scale where the margins are symmetric."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "",
  "id": "",
  "k": "x:rf-air-fig",
  "html": "<div class=\"fig\"><canvas id=\"rfStatFig\" role=\"img\" aria-label=\"A chart with one row per photograph. Each row has a blue dot for the globe and an orange dot for the plane, placed by how many standard errors the air each model needs is from the day's air; a green band marks less than two. The globe's dots stay near the band; the plane's lie far to the colder side. For a series of readings made with one instrument, hollow circles show the same with each model's best constant offset.\"></canvas></div>"
 },
 {
  "t": "fcap",
  "k": "rf-air-cap",
  "html": "<b>How far each model's air is from the day's, photograph by photograph.</b> One row per photograph: this tab's, then the contributions'; a series of readings made with one instrument comes last, below the dashed line. Each dot is z for one model, blue the globe and orange the plane; the green band is |z| &lt; 2. The scale is linear between −2 and +2 and logarithmic beyond, or the plane's rows would not fit. For a series, the hollow circle is the same reading after a constant offset is removed from all its readings, chosen for each model to make its own χ² smallest: an instrument's zero is rarely right to a few tenths of a degree, and the same freedom goes to both. Below, χ² for all, for the independent photographs only, and with the offsets."
 },
 {
  "t": "table",
  "k": "x:rf-air-tab",
  "id": "rfStatTab",
  "tbody": "rfStatRows",
  "caption": "The gradient each photograph needs, in K per 100 m from the bottom of the ray to the eye (in brackets for a series of readings: with each model's best constant offset)",
  "head": [
   "Photograph",
   "Eye",
   "Day's air",
   "Globe needs",
   "Plane needs",
   "z globe",
   "z plane"
  ]
 },
 {
  "t": "notes",
  "k": "rf-air2",
  "html": "<b>What comes out.</b> For the photographs that are each an independent test (<span class=\"cv\" data-v=\"rsNin\">…</span>), the globe's z are <span class=\"cv\" data-v=\"rsZinG\">…</span>: χ² = <span class=\"cv\" data-v=\"rsChiInG\">…</span>, <span class=\"cv\" data-v=\"rsIn2G\">…</span> within two σ. The plane's are <span class=\"cv\" data-v=\"rsZinF\">…</span>: χ² = <span class=\"cv\" data-v=\"rsChiInF\">…</span>, <span class=\"cv\" data-v=\"rsIn2F\">…</span> within two σ. At Caussols the plane needs air at the eye more than a hundred kelvins colder than at the sea. Bordighera is its best case: the air it needs there is ordinary, just not that day's (z = <span class=\"cv\" data-v=\"rsZbF\">…</span>, against <span class=\"cv\" data-v=\"rsZbG\">…</span> for the globe). All <span class=\"cv\" data-v=\"rsN\">…</span> rows: globe χ² = <span class=\"cv\" data-v=\"rsChiG\">…</span>, plane <span class=\"cv\" data-v=\"rsChiF\">…</span>; with each model's best offset on each series of readings, <span class=\"cv\" data-v=\"rsChiAsG\">…</span> and <span class=\"cv\" data-v=\"rsChiAsF\">…</span>. Median |z|: globe <span class=\"cv\" data-v=\"rsMedZG\">…</span>, plane <span class=\"cv\" data-v=\"rsMedZF\">…</span>. Each contribution says what its own rows show:"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "",
  "id": "",
  "k": "x:rf-air-contrib",
  "html": "<div id=\"rfAirContrib\" class=\"rf-air-contrib\"></div>"
 },
 {
  "t": "callout",
  "flat": true,
  "k": "rf-air3",
  "html": "<b>The plane's best case, and the way out a gradient does not cover.</b> Every number above gives the plane the same dip, the same heights, the same air at the bottom of the ray and the same margins as the globe, and on a series of readings its own best offset. One way out remains for a dip: a horizon that is not a grazing ray at all but the distance at which haze hides the surface. That edge needs no particular air. It needs a soft edge that moves with the weather where a photograph shows a sharp line; the <a data-xref=\"dip\">Dip tab</a> sets it against the sea horizon. No haze can do what a hidden height shows, hide the bottom of a building and leave its top: on a plane that takes air bending light downward, the air this section prices."
 },
 {
  "t": "notes",
  "k": "rf-air4",
  "html": "<b>Limits.</b> The day's air comes from weather models, not from thermometers on the line of sight: cells tens of kilometres wide, hourly fields. The floor of 1 K between the two ends of a dip is our choice, the same for both models; a larger one shrinks every z, the plane's as much as the globe's. A hidden height rests on one family of airs (the surface layer over the sea at Bordighera): another family would change both models' needs. Readings made with one instrument share its zero and are not independent tests; the χ² of the independent photographs is given apart. A handful of photographs is few. The test that would settle each one is a thermometer at the eye and one at the sea, read at the minute of the photograph."
 },
 {
  "t": "h2",
  "k": "rf-hsp4",
  "html": "Ninety-seven lines surveyed in 1859–1895: the effective radius, measured"
 },
 {
  "t": "notes",
  "k": "rf-sp4a",
  "html": "<b>The US Coast and Geodetic Survey measured both zenith angles of almost every line of its transcontinental triangulation,</b> to carry heights from the coast to the Rockies, and Charles Schott printed them station by station<sup class=\"ref\"><a href=\"#s-ref-n16\">[16]</a></sup>. We transcribed <span class=\"cv\" data-v=\"zenRows\">…</span> of them, in eastern Colorado, along the California coast and inland, and around Mount Hamilton, and checked every line against Schott's own arithmetic. <span class=\"cv\" data-v=\"zenN\">…</span> lines were measured from both ends. Schott computed the refraction of each one; on the <span class=\"cv\" data-v=\"zenSchottN\">…</span> lines he gives, our k agrees with his to <span class=\"cv\" data-v=\"zenSchott\">…</span>."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "rf-fx-sp4",
  "fig": "refFxZen",
  "lines": [
   {
    "tex": "E = \\zeta_1 + \\zeta_2 - 180° = \\frac{s}{R}(1-k)",
    "fallback": "E = ζ₁ + ζ₂ − 180° = (s/R)(1 − k)"
   },
   {
    "tex": "\\frac{s}{E} = \\frac{R}{1-k}",
    "fallback": "s/E = R/(1 − k)"
   }
  ],
  "gloss": "ζ₁ and ζ₂ are the zenith angles read at the two ends, s the length of the line from the triangulation (bases and angles, no radius). On a sphere the two verticals differ by s/R and the refraction takes back k of it. So s/E is the effective radius R/(1 − k), the one this site uses for sightlines through the air, read from two angles and a length: <b><span class=\"cv\" data-v=\"zenReff\">…</span> km</b> in the median line, <span class=\"cv\" data-v=\"zenReffCo\">…</span> km in dry Colorado, <span class=\"cv\" data-v=\"zenReffCa\">…</span> km on the California coast."
 },
 {
  "t": "callout",
  "flat": true,
  "k": "rf-sp4b",
  "html": "<b>The flat model, at its best.</b> On a plane both verticals are parallel: with straight light the two angles add to 180°, and with light bent toward the ground, as it is here, to less. Of the <span class=\"cv\" data-v=\"zenN\">…</span> lines, every sum is above 180°; the smallest excess is <span class=\"cv\" data-v=\"zenMinE\">…</span>″, on a line of <span class=\"cv\" data-v=\"zenMinS\">…</span> km, and the excess grows with the length of the line. <b>What would vindicate it:</b> sums at or below 180°, or an excess that does not grow with the distance."
 },
 {
  "t": "notes",
  "k": "rf-sp4c",
  "html": "<b>The same line, hour by hour.</b> In September and October 1879 George Davidson's parties at Round Top, 3,173 m up in the Sierra Nevada, and at Jackson Butte in the foothills, 714 m, 72.4 km apart, read each other's zenith angle at the same hour for fourteen days, with thermometers and barometers at both ends<sup class=\"ref\"><a href=\"#s-ref-n16\">[16]</a></sup>. k is <span class=\"cv\" data-v=\"zenNight\">…</span> at night and falls to <span class=\"cv\" data-v=\"zenNoon\">…</span> in the early afternoon, every day: the air near the warm lower slope cools faster with height by day. The sum of the two angles stays above 180° at every one of the <span class=\"cv\" data-v=\"zenPairsH\">…</span> hours."
 },
 {
  "t": "raw",
  "class": "fig",
  "id": "",
  "k": "x:rf-sp4-fig",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"refFigZenHour\"></div> <div class=\"fcap\">k on the Round Top–Jackson Butte line, hour by hour, September–October 1879: each dot one simultaneous pair of zenith angles, the line their mean. Dashed: the k predicted from the mean temperatures and pressures at the two ends only, k = 503·P/T²·(0.0342 + ΔT/Δh). It follows the night value and misses most of the afternoon dip, which happens in the air near the ground at the lower end, not in the average lapse between the two stations.</div> </div>"
 },
 {
  "t": "notes",
  "k": "rf-sp4d",
  "html": "<b>Limits.</b> Many lines were observed from each end in a different year, so the two angles did not see the same air: Schott called them non-simultaneous, and they carry part of the scatter. k as a number needs the Earth's radius (k = 1 − R·E/s, with R = 6,371 km); R/(1 − k) does not, which is why it is the quantity given above. The reductions to the station mark and for eccentricity are Schott's, a few seconds at most, and the distances are those of the adjusted triangulation."
 },
 {
  "t": "h2",
  "k": "rf-higra",
  "html": "k in the air of 2026: 300,000 radiosondes"
 },
 {
  "t": "notes",
  "k": "rf-igra1",
  "html": "<b>Twice a day, at midnight and noon UT, some seven hundred stations release a balloon that radios back the pressure and temperature of the air it climbs through</b><sup class=\"ref\"><a href=\"#s-ref-n11\">[11]</a></sup>. The formula of the section above turns each pair of levels into a k. We computed it for every sounding of 2026 in the NOAA archive, <span class=\"cv\" data-v=\"igN\">…</span> soundings from <span class=\"cv\" data-v=\"igSt\">…</span> stations, in two layers: the lowest one, from the ground to the first level 50 to 300 m up, the air a sightline near the ground crosses; and the first kilometre, the air between two summits."
 },
 {
  "t": "raw",
  "class": "fig",
  "id": "",
  "k": "x:rf-igra-fig",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"refFigIgra\"></div> <div class=\"fcap\">How often each k occurs in the air measured by the world's radiosondes in 2026, in the lowest layer, by day (Sun above the horizon at launch) and by night. Grey: the value 0.13 the site uses. Orange: k = 1, the air in which a globe looks flat. Below, the median of each station's soundings by latitude band.</div> </div>"
 },
 {
  "t": "notes",
  "k": "rf-igra2",
  "html": "<b>The site's 0.13 is a daytime value near the ground,</b> and the radiosondes say so: the median of the lowest layer is <span class=\"cv\" data-v=\"igDay\">…</span> by day and <span class=\"cv\" data-v=\"igNight\">…</span> by night, when the ground cools the air above it. Half of the daytime values lie between <span class=\"cv\" data-v=\"igDayQ1\">…</span> and <span class=\"cv\" data-v=\"igDayQ3\">…</span>. Over the first kilometre the spread is narrower, <span class=\"cv\" data-v=\"igKmDay\">…</span> by day and <span class=\"cv\" data-v=\"igKmNight\">…</span> by night, and k grows towards the poles, where the ground is colder than the air."
 },
 {
  "t": "callout",
  "flat": true,
  "k": "rf-igra3",
  "html": "<b>The air the flat model needs.</b> R/(1 − k) is infinite at k = 1: a ray curving exactly as the ground does, the globe looking flat. In the lowest layer that air was measured in <span class=\"cv\" data-v=\"igGe1N\">…</span> % of the night soundings and <span class=\"cv\" data-v=\"igGe1D\">…</span> % of the daytime ones, most of them over the Antarctic plateau, where a cold surface inversion lasts for months (<span class=\"cv\" data-v=\"igConc\">…</span> % at Concordia); over the first kilometre, in none. <b>What would vindicate it:</b> k at 1 or more in most soundings, in every climate, by day and by night."
 },
 {
  "t": "notes",
  "k": "rf-igra4",
  "html": "<b>Limits.</b> A radiosonde's lowest reading is taken at the launch site, sometimes over a warm tarmac; the levels are tens to hundreds of metres apart, so the thin layers that make mirages are not resolved; the heights of levels without a printed height are computed from pressure and temperature (the hypsometric equation, a lab constant and g only). Water vapour, under 1 % of the refractivity for visible light, is left out. And k is the ray's curvature divided by the Earth's, so the radius is its unit: a check, not a measurement."
 },
 {
  "t": "h2",
  "k": "rf-hlas",
  "html": "Laser tests: a widening beam, at night, over water"
 },
 {
  "t": "notes",
  "k": "rf-las1",
  "html": "<b>A laser across the sea looks like the cleanest test there is.</b> Fire it level from one shore and look for it from the other: if the water is curved, the bulge should hide it. On 23 February 2019 a group did exactly that between the end of Worthing Pier and the West Pier at Brighton, <span class=\"cv\" data-v=\"lasD\">…</span> km apart, with lasers and cameras 1 m above the water, and saw the beams.<sup class=\"ref\"><a href=\"#s-ref-n18\">[18]</a></sup> They also measured the air at both ends, which makes the test checkable. Two things decide what the far camera sees, and neither is the shape of the water: the beam is a cone that widens with distance, and the air a metre above water, at night, is the most strongly bending air there is.<sup class=\"ref\"><a href=\"#s-ref-n12\">[12]</a></sup>"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "rf-las-fx1",
  "fig": "refFxLaser",
  "lines": [
   {
    "tex": "w(d) = w_0 + \\theta\\, d",
    "fallback": "w(d) = w₀ + θd"
   },
   {
    "tex": "d_w = \\frac{2h}{\\theta}",
    "fallback": "d_w = 2h/θ"
   }
  ],
  "gloss": "θ is the beam's full divergence, w₀ its width at the laser, d the distance, h the height of the laser above the water. A hand-held pointer spreads by about 1 mrad: at <span class=\"cv\" data-v=\"lasD\">…</span> km its beam is <span class=\"cv\" data-v=\"lasW\">…</span> m tall, and fired level from 1 m, its lower edge reaches the water at <span class=\"cv\" data-v=\"lasEdge\">…</span> km (on a plane, with straight light). The width decides where some ray points, not whether a ray can get there: if the water's bulge is in the way, no ray of the cone reaches the eye."
 },
 {
  "t": "notes",
  "k": "rf-las-geo",
  "html": "<b>What the globe needs.</b> Without air, a laser 1 m above the water seen from 1 m above the water <span class=\"cv\" data-v=\"lasD\">…</span> km away is hidden by <span class=\"cv\" data-v=\"lasHid\">…</span> m: the sea bulges <span class=\"cv\" data-v=\"lasBulge\">…</span> m between them. The operators' slides get this right. With the site's k = 0.13 it is still hidden by <span class=\"cv\" data-v=\"lasHidK\">…</span> m. For the beam to be seen the air must bend light with a uniform k of <span class=\"cv\" data-v=\"lasKNeed\">…</span>: at that evening's 1,033.6 hPa and about 8 °C, air warming with height by <span class=\"cv\" data-v=\"lasGNeed\">…</span> °C per metre, that is <span class=\"cv\" data-v=\"lasG2\">…</span> °C between the water and 2 m."
 },
 {
  "t": "notes",
  "k": "rf-las2",
  "html": "<b>Why at night.</b> A laser spot is lost in daylight beyond a few kilometres, so these tests are made after dark. Night is when the air near the surface departs most from the standard 0.13. The radiosondes of the section above give a median k in the lowest layer of <span class=\"cv\" data-v=\"igDay\">…</span> by day and <span class=\"cv\" data-v=\"igNight\">…</span> by night, and the air in which a globe looks flat, k ≥ 1, in <span class=\"cv\" data-v=\"igGe1N\">…</span> % of the night soundings against <span class=\"cv\" data-v=\"igGe1D\">…</span> % of the daytime ones.<sup class=\"ref\"><a href=\"#s-ref-n11\">[11]</a></sup> Davidson's line of 1879 shows the same swing on one line: k <span class=\"cv\" data-v=\"zenNight\">…</span> at night, <span class=\"cv\" data-v=\"zenNoon\">…</span> in the early afternoon.<sup class=\"ref\"><a href=\"#s-ref-n16\">[16]</a></sup> Those layers are tens to hundreds of metres thick. The metre just above water bends far more."
 },
 {
  "t": "notes",
  "k": "rf-las3",
  "html": "<b>What they measured.</b> Water keeps its temperature through the night while the air above it warms or cools with the weather, and the difference is concentrated in the first metres.<sup class=\"ref\"><a href=\"#s-ref-n14\">[14]</a></sup> The operators read the air at several heights at both ends with two thermometers good to ±0.25 °C, read to the half degree.<sup class=\"ref\"><a href=\"#s-ref-n18\">[18]</a></sup> At Worthing both thermometers show the air warming with height: about 0.5 °C from just above the water to 0.5 m, no change up to 1.5 m, then another 1 °C by 2 m. That is 1.5 °C in 2 m, nine times what the globe needs, and in those two layers k is about <span class=\"cv\" data-v=\"lasKw1\">…</span> and <span class=\"cv\" data-v=\"lasKw2\">…</span>.<sup class=\"ref\"><a href=\"#s-ref-n17\">[17]</a></sup> At Brighton the water was 7.0 °C and the air 7.0 °C at 1.78 m, with readings in between that they call indistinguishable within the precision: any gradient between −0.28 and +0.28 °C per metre fits them, including the <span class=\"cv\" data-v=\"lasGNeed\">…</span> the globe needs. Their thermometers could not see the air that decides the test. Calm water at grazing incidence is also a mirror: at a milliradian it reflects about 99 % of the light, so a ray that reaches it bounces back up. Ripples a few hundredths of a millimetre high already scatter part of it."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "rf-las-fx2",
  "fig": "refFxLasK",
  "lines": [
   {
    "tex": "\\frac{dT}{dh}(h) = \\frac{T_{i+1} - T_i}{h_{i+1} - h_i}\\ (h_i \\le h < h_{i+1}),\\qquad k(h) = 503\\cdot\\frac{P}{T^2}\\left(0.0342 + \\frac{dT}{dh}(h)\\right)",
    "fallback": "dT/dh(h) = (T_{i+1} − T_i)/(h_{i+1} − h_i) between their readings, k(h) = 503 · (P/T²) · (0.0342 + dT/dh(h))"
   },
   {
    "tex": "\\g{h″ = \\frac{1 - k(h)}{R}},\\qquad \\f{h″ = -\\frac{k(h)}{R}}",
    "fallback": "h″ = (1 − k(h))/R (globe), h″ = −k(h)/R (plane)"
   }
  ],
  "gloss": "h is the ray's height above the water, h″ its curvature measured against the water (blue, the globe; orange, the plane), R the Earth's radius, P and T that evening's pressure and temperature (1,033.6 hPa from ERA5, 8 °C). dT/dh is taken segment by segment between their readings, and above the last one is the gradient that gives k = 0.13. The plane gets the same air, the same beam and the same eye. The figure below traces 81 rays of the beam with these equations, applying each end's air to the whole path: the air offshore was not measured."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "",
  "id": "",
  "k": "x:rf-las-fig",
  "html": "<div class=\"fig\"><canvas id=\"refLaserCanvas\" class=\"ref-laser\" role=\"img\" aria-label=\"Animation: the laser test of 23 February 2019 between Worthing and Brighton, 15.3 km, laser and camera 1 m above the water, on a globe (top) and on a plane (bottom) in the same air, through four airs. With straight light and with the standard air, the globe hides the beam and the plane shows it. In the air measured at the Worthing end the globe shows it directly and the plane by reflection. In the air measured at the Brighton end the globe hides it again.\"></canvas> <p class=\"reads\" id=\"refLaserReads\"></p></div>"
 },
 {
  "t": "fcap",
  "k": "rf-las-cap",
  "html": "<b>The test of 23 February 2019, redone ray by ray.</b> A 1 mrad laser fired level 1 m above the water, and a camera 1 m up, <span class=\"cv\" data-v=\"lasD\">…</span> km away. Top, the globe (the sea bulges <span class=\"cv\" data-v=\"lasBulge\">…</span> m between them); bottom, a plane with the same air. With straight light and with the standard air, the globe hides the beam and the plane shows it: the test the laser is meant to be. In the air measured at the Worthing end the globe shows the beam directly: the step of 1 °C between 1.5 and 2 m guides it over the bulge. The plane shows it too, but only by reflection off the water (dashed after a first bounce). In the air measured at the Brighton end, flat within their precision, the globe hides it again. The same evening, 15 km apart, two airs give two answers: the air decides, not the shape, and the thermometers were too coarse to tell which air the beam crossed. Every frame is traced; the darker ray is the beam's axis. Click to pause."
 },
 {
  "t": "callout",
  "flat": true,
  "k": "rf-las4",
  "html": "<b>The flat model's best laser test.</b> A narrow beam, so that θd is small against what it is meant to reveal: a surveyor's laser at 0.1 mrad spreads 1.5 m over 15.3 km, against a hidden height of 10.8 m. The line well above the water, where k returns to its standard value. Thermometers good to 0.05 °C at 0.25, 0.5, 1, 2 and 4 m at both ends, and on a boat halfway. The beam looked for by day as well as by night, in both directions. <b>What would vindicate the plane:</b> under those conditions, again and again, the centre of the beam arriving at the height of a straight line over a plane, on a line long enough for the globe to hide it by several beam widths. <b>What would vindicate the globe:</b> the same beam hidden by the predicted amount, with the same thermometers."
 },
 {
  "t": "notes",
  "k": "rf-las5",
  "html": "<b>No mirage is not no refraction.</b> The slides conclude that no refraction occurred because no inferior or superior mirage could be seen. A steady gradient bends light without doubling any image: a mirage needs the gradient to change sharply with height. With k = 0.78 the far shore simply rises into view, intact. <b>The clean version needs no laser.</b> Two instruments reading each other's zenith angle at the same moment measure the refraction of the very line they use, and the heights cancel (the sections above). Three targets at equal height above still water answer the question with nothing that spreads. The <a class=\"xref\" href=\"#tab-surv\" data-xref=\"surv\">Surveying</a> tab works through the beam-width arithmetic from the instrument's side."
 },
 {
  "t": "notes",
  "html": "<b>Which is why a beam skimming water is the worst possible probe of k.</b> Over water on a warm afternoon the temperature gradient is the steepest and least stable in the lower atmosphere: cold water chills the air touching it, the profile inverts, and k routinely runs several times the standard 0.13 and can pass 1 — light bending as fast as the ground falls away, a globe wearing a plane's appearance. A laser aimed level a metre or two above a lake samples exactly that layer, and because the beam widens, its lower edge samples it even when the centre does not. Such a test measures the duct and reports it as the shape<sup class=\"ref\"><a href=\"#s-ref-n12\">[12]</a></sup>.",
  "k": "rf-laser"
 },
 {
  "t": "h2",
  "html": "The six refraction arguments, answered with numbers",
  "k": "rf-h7"
 },
 {
  "t": "lead",
  "html": "These are the objections as they are actually made, not softened versions of them. Each one deserves a quantity in reply rather than a rebuke.",
  "opener": false,
  "k": "rf-p12"
 },
 {
  "t": "fold",
  "q": true,
  "k": "ref-fold2",
  "summary": "<b class=\"faq-q\">1. \"Refraction was invented to save the globe.\"</b>",
  "html": "<p class=\"cnav-lead\">Bouguer published the invariant in 1729 and used it to predict the raising of the horizon before anyone was arguing about the shape of the Earth.<sup class=\"ref\"><a href=\"#s-ref-n8\">[8]</a></sup> Refraction tables were in nautical almanacs a century before that argument existed, and Helbronner was applying them to 250 km sightlines across the Mediterranean in 1925. If it had been invented to rescue anything, it would have been tuned to fit; instead the Guinness-record sighting in the hidden-height tab clears the horizon at k = 0.123, <em>below</em> the standard-atmosphere value. A rescue device that asks for less than average is not a rescue device.</p>"
 },
 {
  "t": "fold",
  "q": true,
  "k": "ref-fold3",
  "summary": "<b class=\"faq-q\">2. \"If light bends, it can bend enough to hide things on a flat Earth.\"</b>",
  "html": "<p class=\"cnav-lead\">This one fails on sign, not magnitude. To hide a distant object below your sightline on a plane, the ray must curve <em>upward</em>, away from the ground — which needs n to increase with height, air denser as you climb. The formula above prices it: temperature falling faster than 3.42 °C per 100 m, sustained over the whole height band of the ray. That happens in the first metre or two over hot asphalt or sand, where it makes inferior mirages — shimmering, inverted, obviously distorted — and it cannot hold over a kilometre of height, because such a column is top-heavy and overturns at once. Refraction of that sign is not a hiding mechanism; it is a <em>visible</em>, violently unstable one.</p>"
 },
 {
  "t": "fold",
  "q": true,
  "k": "ref-fold4",
  "summary": "<b class=\"faq-q\">3. \"k is a free parameter, so the model can fit anything.\"</b>",
  "html": "<p class=\"cnav-lead\">It is one number, not a function; it is bounded by measurable weather; and this page refuses to tune it. k is never adjusted per example to make a number come out, examples that quote a k say where it comes from, and there is exactly one k in the whole page, shared by every tab, so it cannot be quietly forked. Above all, every refracted figure is printed <em>beside</em> its unrefracted twin: in every row, refraction shrinks the effect and never reverses it.</p>"
 },
 {
  "t": "fold",
  "q": true,
  "k": "ref-fold5",
  "summary": "<b class=\"faq-q\">4. \"Then strong enough refraction could explain flat-Earth observations anyway.\"</b>",
  "html": "<p class=\"cnav-lead\">The most interesting objection, because the algebra answers it exactly. Set k = 1 in R<sub>eff</sub> = R/(1−k) and the effective radius becomes <em>infinite</em>:</p> <div class=\"callout\"><b>k = 1 <em>is</em> the flat model.</b> A flat Earth is exactly what a globe looks like when light curves as much as the ground does. So “refraction explains the flat observations” is not a rival theory: it is the claim that k = 1 always, everywhere, in every wind and season, over ocean, desert and ice. The price is on the table: air warming with height at <b>+0.129 K per metre — 12.9 °C per 100 m</b> — over the whole depth of the sightline. Real inversions reach that only in layers a few tens of metres thick over cold water or ice, and there they do not quietly flatten the world: they duct, giving Fata Morganas, stacked and inverted images, and the Novaya Zemlya effect, a slot-shaped Sun days before it should appear.<sup class=\"ref\"><a href=\"#s-ref-n2\">[2]</a></sup><sup class=\"ref\"><a href=\"#s-ref-n9\">[9]</a></sup> These are famous <em>because</em> they are rare and grotesque. Meanwhile weather balloons from more than 800 stations have reported the real temperature profile twice a day since 1905,<sup class=\"ref\"><a href=\"#s-ref-n11\">[11]</a></sup> and nowhere in that archive is a permanent global +12.9 °C per 100 m.</div>"
 },
 {
  "t": "fold",
  "q": true,
  "k": "ref-fold6",
  "summary": "<b class=\"faq-q\">5. \"Refraction lifts distant objects, so it explains the sightings anyway.\"</b>",
  "html": "<p class=\"cnav-lead\">It lifts them, but by a bounded amount, and the page's sharpest cases are chosen so that the bound is visible. Take the Viériou photograph from the elevation tab: a plane puts the far summit <b>8.5′ above</b> the near one, straight-ray spherical geometry puts it <b>2.9′ below</b>, and refraction at k = 0.13 recovers 1.5′ of that, landing at <b>1.4′ below</b>. Refraction moved the globe's answer toward the plane's — and then stopped. To close the remaining 9.9′ you would need k = 1, which by the previous paragraph <em>is</em> the flat model and carries the +12.9 °C/100 m bill. The photograph, meanwhile, settles it with no instrument at all: the far summit is below.</p>"
 },
 {
  "t": "fold",
  "q": true,
  "k": "ref-fold7",
  "summary": "<b class=\"faq-q\">6. \"Refraction varies, so no prediction is possible.\"</b>",
  "html": "<p class=\"cnav-lead\">It varies within bounds that are themselves measured, and — decisively — it varies in ways that do not mimic curvature. Real k swings between roughly 0.1 and 0.35 with the hour and the surface; the globe's curvature term does not swing at all. So the two are separable by anyone patient enough to repeat a sighting. Refraction changes with the weather; curvature changes with distance squared, everywhere, every day, in the same direction. That is what the ceiling table in the hidden-height tab is testing, and every certified long-distance record sits inside it.</p>"
 },
 {
  "t": "h2",
  "html": "The four things refraction cannot do",
  "k": "rf-h8"
 },
 {
  "t": "lead",
  "html": "<b>It cannot give a plane a horizon.</b> Refraction corrects the <em>difference</em> between two curvatures, and a plane has none of its own to correct. Bend the light down over an infinite plane and the sightline meets the ground eventually — but the ground it meets is at your own feet's level, so nothing is ever hidden behind a bulge, because there is no bulge. Worse for the flat model, ordinary downward-bending light on a plane pushes distant objects <em>up</em>, not down. It is the wrong sign for every observation it is invoked to explain.",
  "opener": false,
  "k": "rf-p19"
 },
 {
  "t": "lead",
  "html": "<b>It cannot reverse the dip of the horizon.</b> Rise, and a spherical sea horizon drops below eye level by an angle that refraction reduces from √(2e/R) to √(2e/R<sub>eff</sub>) — about 12% less at k = 0.13. It shrinks the dip; it cannot make it negative, and it cannot make it zero, which is the flat prediction at every altitude forever. Airline pilots and sextant users correct for dip on every observation.<sup class=\"ref\"><a href=\"#s-ref-n10\">[10]</a></sup>",
  "opener": false,
  "k": "rf-p20"
 },
 {
  "t": "lead",
  "html": "<b>It cannot vary correctly by accident.</b> To reproduce a single constant R across the whole of geodesy, the flat model's refraction would have to depend on distance as d², on nothing else, identically in every azimuth, in every climate, at every hour, for two centuries of surveys. A quantity that is forced to imitate d²/2R exactly is d²/2R.",
  "opener": false,
  "k": "rf-p21"
 },
 {
  "t": "lead",
  "html": "<b>It cannot survive reciprocal observation.</b> This is the cleanest test on the page because the station heights cancel and nothing is left to argue about. On a plane the two zenith angles must sum to at most 180°. On a sphere they sum to 180° + γ(1−k), which for a 30 km line is 180° + 14.1′ at k = 0.13. That is a <em>sign difference</em>, not a magnitude difference, and no positive k can rescue it.",
  "opener": false,
  "k": "rf-p22"
 },
 {
  "t": "exp",
  "h": "Experiment 1c · refraction",
  "title": "Measure k yourself, and let it convict the model of your choice",
  "lead": "Put a total station or theodolite at each end of a line several kilometres long, ideally with a clear reciprocal view. At an agreed instant, each observer measures the zenith angle to the other instrument's centre. Swap the numbers. You now have everything: the sum tells you which geometry you live on, and its excess over 180° tells you the refraction coefficient of the air you measured in.",
  "iv": "<span class=\"vartag iv-t\">Independent variable</span><br> <b>What you change:</b> the <b>line</b> — its length s, and the time of day you observe it. Try noon and again an hour after sunset.",
  "dv": "<span class=\"vartag dv-t\">Dependent variable</span><br> <b>What you measure:</b> the two <b>zenith angles</b> z<sub>A</sub> and z<sub>B</sub>, from which the sum and hence k follow with no further assumptions.",
  "meta": [],
  "inputs": [
   [
    "expRzA",
    "Zenith angle at A <span class=\"unit\">(°)</span>",
    " type=\"number\" id=\"expRzA\" value=\"90.1174\" step=\"0.0001\""
   ],
   [
    "expRzB",
    "Zenith angle at B <span class=\"unit\">(°)</span>",
    " type=\"number\" id=\"expRzB\" value=\"90.1173\" step=\"0.0001\""
   ],
   [
    "expRs",
    "Line length s <span class=\"unit\">(km)</span>",
    " type=\"number\" id=\"expRs\" value=\"30\" min=\"0.5\" max=\"300\" step=\"0.5\""
   ]
  ],
  "out": "expRout",
  "verdict": "expRv",
  "k": "x:rf-exph"
 },
 {
  "t": "notes-block",
  "paras": [
   "<p><span class=\"k\">The through-line.</span> Every tab on this page offers refraction as a toggle and prints both answers, because the honest position is not \"refraction is negligible\" — it is not — but \"refraction is measured, bounded, and of known sign\". The elevation and hidden-height tabs share one k with this one. The surveying tab shows the reciprocal-angle correction being applied in the field. And the horizon-dip tab shows the 12% that k shaves off the dip without ever touching its sign. One radius, one refraction coefficient, and the two are told apart by the fact that only one of them cares what the weather is doing.</p>"
  ],
  "k": "x:rf-n2"
 },
 {
  "t": "xrefs",
  "keys": [
   "elev",
   "hh",
   "dip",
   "twi",
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
  "html": "<div class=\"srcs reading\"><b class=\"h\">Further reading</b> <div class=\"note\">Not cited above, and no claim on this tab rests on it — listed because it is what you would read next, or because it lets you redo the measurement on data this page did not choose.</div> <ul> <li id=\"sref-r1\"><a href=\"https://arxiv.org/pdf/1107.1957\">A. C. González-García &amp; J. A. Belmonte, \"Thinking Hattusha: astronomy and landscape in the Hittite lands\" / horizon-synthesis appendix, arXiv:1107.1957</a> — gives the refraction constant in the equivalent form K = 0.273(34.2 + dT/dz), a useful independent check on the 0.0342 K/m term and on the size of the effect against curvature.</li> <li><b>L. Auer &amp; E. M. Standish, \"Astronomical refraction: computational method for all zenith angles\", <em>Astronomical Journal</em> 119 (2000), 2472.</b> The standard modern treatment, valid down to and below the horizon where the simple formulas fail. Written up in 1979 and finally published two decades later; the delay is itself a good illustration of how uncontroversial the physics is.</li> <li><b>Explanatory Supplement to the Astronomical Almanac</b>, 3rd edition, ed. S. E. Urban &amp; P. K. Seidelmann (University Science Books, 2013), chapter 7. The technical volume standing behind the national almanacs: refraction, dip, semidiameter and parallax, with the conventions each almanac actually uses.</li> </ul> </div>",
  "k": "x:rd-more"
 }
];
