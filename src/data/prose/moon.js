// Prose de l'onglet moon (epic19, 2026-10-04), en anglais (source). Valeurs : span.cv[data-v] remplis par index.js.
export const PROSE = [
 {
  "t": "eyebrow",
  "html": "The Moon as a ruler · lasers, parallax and shadow",
  "k": "moon-eyebrow"
 },
 {
  "t": "h1",
  "html": "Grasse fires a laser at the Moon, and the Earth's radius comes back",
  "k": "moon-h1"
 },
 {
  "t": "lead",
  "opener": true,
  "k": "moon-lead",
  "html": "Seventy kilometres from Marseille, on the Calern plateau, a telescope fires laser pulses at a reflector left on the Moon by Apollo 15 and times their return to a fraction of a nanosecond. Over a night the time of flight changes by tens of milliseconds, and most of that change is the observatory itself being carried around the Earth's axis. The size of that circle is the Earth's radius."
 },
 {
  "t": "h2",
  "k": "moon-h2llr",
  "html": "Laser ranges from Grasse: the radius from times of flight"
 },
 {
  "t": "notes",
  "k": "moon-llr1",
  "html": "<b>Each point is a time of flight, about 2.5 s there and back,</b> and the archive gives <span class=\"cv\" data-v=\"nPass\">…</span> passes of six hours or more from Grasse between 2015 and 2025<sup class=\"ref\"><a href=\"#s-moon-n1\">[1]</a></sup><sup class=\"ref\"><a href=\"#s-moon-n2\">[2]</a></sup>. The distance from the Earth's centre to the reflector changes smoothly over a night. The distance from the observatory does not: it carries the observatory's own circle around the axis. For a trial radius R, subtract the observatory's part and see how smooth what is left is. One value makes it smooth to a metre."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "moon-fx-llr",
  "fig": "moonFxLlr",
  "lines": [
   {
    "tex": "\\rho = \\tfrac12\\,c\\,\\tau,\\qquad \\rho^2 = D^2 - 2DR\\cos Z + R^2",
    "fallback": "ρ = ½ c τ, ρ² = D² − 2DR cos Z + R²"
   },
   {
    "tex": "\\cos Z = \\sin\\psi\\sin\\delta + \\cos\\psi\\cos\\delta\\cos H,\\qquad \\g{R:\\ D(t)\\ \\text{smoothest}}",
    "fallback": "cos Z = sin ψ sin δ + cos ψ cos δ cos H; R: D(t) smoothest"
   }
  ],
  "gloss": "τ is the measured time of flight, ρ the distance from the observatory to the reflector, D the distance from the Earth's centre, Z the angle between the observatory's direction from the centre and the Moon's. ψ is the observatory's geocentric latitude, δ and H the Moon's declination and hour angle, from a lunar theory<sup class=\"ref\"><a href=\"#s-moon-n3\">[3]</a></sup>: that is where a model enters, so this section is a check. For each pass, R is the value that makes D(t) closest to a cubic."
 },
 {
  "t": "raw",
  "tag": "p",
  "class": "reads",
  "id": "moon-readLlr",
  "html": "<p class=\"reads\" id=\"moon-readLlr\"></p>"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "k": "x:moon-llr-fig",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"moonFigLlr\"></div> <div class=\"fcap\">Top: for the first pass in the archive, how smooth the Moon's distance from the centre comes out for each trial radius (residual from a cubic, log scale). Bottom: the radius from each of the passes. The geocentric radius of the observatory on the reference ellipsoid, 6,369.3 km, is drawn for comparison.</div> </div>"
 },
 {
  "t": "callout",
  "flat": true,
  "k": "moon-llr2",
  "html": "<b>The flat model, at its best.</b> On a plane the observatory does not move, so the range is the distance from a fixed point to a Moon that may follow any smooth path: set R = 0 and let the cubic do everything. The residual is then <span class=\"cv\" data-v=\"flatRms\">…</span> km in the median pass, against <span class=\"cv\" data-v=\"globeRms\">…</span> m with the observatory carried on a circle of radius R. <b>What would vindicate it:</b> passes whose ranges are as smooth with R = 0 as with any other value."
 },
 {
  "t": "notes",
  "k": "moon-llr3",
  "html": "<b>Limits.</b> The radius found is the distance from the Earth's centre to the observatory, <span class=\"cv\" data-v=\"med\">…</span> km in the median, <span class=\"cv\" data-v=\"dev\">…</span> km below the reference ellipsoid's value there, and the quartiles span <span class=\"cv\" data-v=\"iqr\">…</span> km. The Moon's direction comes from an abridged lunar theory good to about 10″; its errors and the observatory's latitude are the main source of the spread."
 },
 {
  "t": "h2",
  "k": "moon-h2par",
  "html": "The Moon's parallax, Kepler and a pendulum"
 },
 {
  "t": "notes",
  "k": "moon-par1",
  "html": "<b>A measurement to make with a camera.</b> Through a night the Moon shifts against the stars by up to a degree more than its orbit alone would carry it, because the observer is carried around the axis: the horizontal parallax π, about 57′, the angle the Earth's radius subtends from the Moon. Kepler's third law with g = GM/R² then gives R itself, with no distance on the ground."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "moon-fx-par",
  "fig": "moonFxPar",
  "lines": [
   {
    "tex": "\\sin\\pi = \\frac{R}{D},\\qquad n^2 D^3 = gR^2\\left(1+\\frac{m}{M}\\right)",
    "fallback": "sin π = R/D, n² D³ = g R² (1 + m/M)"
   },
   {
    "tex": "\\g{R = \\frac{g\\,\\sin^3\\pi\\,(1+m/M)}{n^2}}",
    "fallback": "R = g sin³π (1 + m/M) / n²"
   }
  ],
  "gloss": "g is measured with a pendulum, n = 2π / (27.32 days) is the Moon's motion against the stars, m/M ≈ 1/81 the Moon-to-Earth mass ratio. With π = 57.04′ and g = 9.80 m/s², R ≈ <span class=\"cv\" data-v=\"parR\">…</span> km. An error of 1 % in π is 3 % in R."
 },
 {
  "away": "xp-moon-par",
  "t": "exp",
  "h": "Experiment · the Moon against the stars",
  "title": "Photograph the Moon among the same stars at moonrise, transit and moonset",
  "lead": "A camera on a tripod, a fixed focal length, the same stars in every frame.",
  "iv": "<b>You measure</b> the Moon's position among catalogue stars at three times",
  "dv": "<b>You get</b> its parallax π, then R from g and the month",
  "meta": [
   "Separate the parallax from the orbital motion with a second night, or by fitting the motion as a straight line across the night.",
   "Prediction: π between 54′ and 61′ depending on the Moon's distance that week."
  ],
  "inputs": [
   [
    "moonPi",
    "Parallax π (′)",
    "value=\"57.04\" step=\"0.01\""
   ],
   [
    "moonG",
    "g (m/s²)",
    "value=\"9.805\" step=\"0.001\""
   ]
  ],
  "out": "moonParOut",
  "verdict": "moonParV",
  "k": "moon-exp"
 },
 {
  "t": "h2",
  "k": "moon-h2ecl",
  "html": "The Earth's shadow on the Moon (Aristarchus)"
 },
 {
  "t": "notes",
  "k": "moon-ecl1",
  "html": "<b>During a lunar eclipse the Earth's shadow crosses the Moon, and its edge is an arc of a circle about 2.6 Moon-widths across.</b> A crater timing is the instant that edge crosses a crater. It is the same for every observer, wherever they stand, so one timing puts one point on the edge of the shadow. Observers with small telescopes timed <span class=\"cv\" data-v=\"eclTot\">…</span> of them at 94 eclipses between 1842 and 2011<sup class=\"ref\"><a href=\"#s-moon-n4\">[4]</a></sup><sup class=\"ref\"><a href=\"#s-moon-n5\">[5]</a></sup>. We reduced the <span class=\"cv\" data-v=\"eclN\">…</span> that mark the middle of a crater or a contact with the Moon's limb ourselves: the instant at the Moon, the crater placed on the Moon by its selenographic latitude and longitude<sup class=\"ref\"><a href=\"#s-moon-n6\">[6]</a></sup> and the Moon's orientation<sup class=\"ref\"><a href=\"#s-moon-n8\">[8]</a></sup>, the shadow's axis from the Sun through the Earth's centre<sup class=\"ref\"><a href=\"#s-moon-n7\">[7]</a></sup>. σ, the shadow's angular radius, is the angle between the two seen from the Earth's centre. Our reduction agrees with the catalogue authors' own, timing by timing (correlation <span class=\"cv\" data-v=\"eclCorr\">…</span>)."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "moon-fx-ecl",
  "fig": "moonFxEcl",
  "lines": [
   {
    "tex": "\\g{\\sigma + s_\\odot = \\pi_M + \\pi_\\odot}",
    "fallback": "σ + s☉ = π☾ + π☉"
   },
   {
    "tex": "\\g{R_s = \\frac{\\sigma + s_\\odot}{1/D_M + 1/D_\\odot}}",
    "fallback": "R_s = (σ + s☉)/(1/D☾ + 1/D☉)"
   }
  ],
  "gloss": "σ is the shadow's angular radius at the Moon, measured at each eclipse (41′ to 46′ as the Moon's distance changes), s☉ the Sun's angular radius, π = R/D the parallaxes, D☾ and D☉ the distances of that instant<sup class=\"ref\"><a href=\"#s-moon-n7\">[7]</a></sup>. Aristarchus' relation holds for a ball without air; R_s is then the radius of whatever casts the edge of the umbra: <b><span class=\"cv\" data-v=\"eclRs\">…</span> ± <span class=\"cv\" data-v=\"eclRsSig\">…</span> km</b> over the <span class=\"cv\" data-v=\"eclNE\">…</span> eclipses with 20 timings or more, <span class=\"cv\" data-v=\"eclEnl\">…</span> % more than an airless Earth would give. The Earth plus the lowest, opaque layer of its air, about <span class=\"cv\" data-v=\"eclLayer\">…</span> km thick<sup class=\"ref\"><a href=\"#s-moon-n4\">[4]</a></sup>."
 },
 {
  "t": "raw",
  "class": "fig",
  "id": "",
  "k": "x:moon-eclrs-fig",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"moonFigEclRs\"></div> <div class=\"fcap\">The radius of the body that casts the umbra's edge, from the median σ of each eclipse with 20 timings or more, 1842-2011. Every eclipse lands above the Earth's mean radius: the shadow is cast by the Earth and the bottom of its air, and how thick that bottom is changes from one eclipse to the next.</div> </div>"
 },
 {
  "t": "notes",
  "k": "moon-ecl2",
  "html": "<b>Limits, and where the radius enters.</b> A visual timing is good to 25 or 30 seconds, a few tenths of a percent of σ, and the enlargement changes from one eclipse to the next with the air along the Earth's edge. Julius Schmidt's clocks of 1842-1879 were corrected by the catalogue's compilers against modern ephemerides<sup class=\"ref\"><a href=\"#s-moon-n5\">[5]</a></sup>. The catalogue kept only the timings whose layer height, which its authors computed from the Earth's radius, lies between −50 and +250 km: a selection that touched the radius, and the distances come from an ephemeris. That makes this radius a check, not a measurement. The parallax experiment of the previous section has not been done yet and stays a prediction."
 },
 {
  "t": "h2",
  "k": "moon-h2shape",
  "html": "The shadow is round from every side: 12,700 timings"
 },
 {
  "t": "notes",
  "k": "moon-shape1",
  "html": "<b>Aristotle's argument, with numbers.</b> The Earth's shadow on the Moon is always an arc of a circle; only a ball casts a round shadow whichever way it is lit<sup class=\"ref\"><a href=\"#s-moon-n9\">[9]</a></sup>. Divide each timing's σ by the median σ of its own eclipse: no radius and no distance enter, only angles. The latitude β on the shadow says which side of the Earth cast that piece of the edge: ±90° the polar regions, 0° the equator. A round shadow gives 1 at every β."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "moon-fx-shape",
  "fig": "moonFxShape",
  "lines": [
   {
    "tex": "\\g{\\frac{\\sigma(\\beta)}{\\sigma_0} \\approx 1 - f_s \\sin^2\\beta}",
    "fallback": "σ(β)/σ₀ ≈ 1 − f_s sin²β"
   },
   {
    "tex": "\\f{\\frac{\\sigma(\\beta)}{\\sigma_0} = \\frac{1}{\\sqrt{\\cos^2\\beta + \\sin^2\\beta / \\sin^2\\delta_\\odot}}}",
    "fallback": "σ(β)/σ₀ = 1/√(cos²β + sin²β/sin²δ☉)"
   }
  ],
  "gloss": "Top line, a ball: f_s is the flattening of its shadow, fitted to the <span class=\"cv\" data-v=\"eclN\">…</span> timings: <b><span class=\"cv\" data-v=\"eclE\">…</span> ± <span class=\"cv\" data-v=\"eclESig\">…</span></b>, against 0.0034 for the Earth's own shape. Bottom line, a flat disc with the Earth's axis as its normal: lit from the Sun's direction, its shadow is an ellipse whose height is sin δ☉ of its width, δ☉ the Sun's declination at the eclipse, between −23.4° and +23.4°."
 },
 {
  "t": "raw",
  "class": "fig",
  "id": "",
  "k": "x:moon-eclsh-fig",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"moonFigEclShape\"></div> <div class=\"fcap\">Every timing's σ divided by its eclipse's median, against the latitude on the shadow. Top, the whole scale: the timings, counted in cells of 2° by 0.5 %, form one thin band at 1; the dashed curves are the best flat disc's shadow for the Sun at 3°, 12° and 23° of declination. Bottom, the band magnified a hundred times: ten-degree averages with two standard errors, the fitted flattening and the Earth's.</div> </div>"
 },
 {
  "t": "callout",
  "flat": true,
  "k": "moon-shape2",
  "html": "<b>The flat model, at its best.</b> A flat Earth that casts a shadow on the Moon at all already borrows the globe's geometry; give it that, with the Earth's axis as the disc's normal and the best radius at each eclipse. The timings then scatter <span class=\"cv\" data-v=\"eclDisc\">…</span> % around the best disc's ellipse, in the median eclipse, against <span class=\"cv\" data-v=\"eclBall\">…</span> % around a circle. Only a disc turned to face the Sun at every eclipse, whatever the season, would cast a round shadow every time, and a body whose shadow is round from every direction is a ball. <b>What would vindicate it:</b> a shadow whose radius changes with β the way a disc's does, or a shadow stretched along the equator."
 },
 {
  "t": "notes",
  "k": "moon-shape3",
  "html": "<b>Limits.</b> The latitudes on the shadow are not evenly covered: the craters are on the near side, and the Moon crosses the shadow north or south of its centre depending on the eclipse. One eclipse's own flattening is uncertain by a few thousandths; it is the <span class=\"cv\" data-v=\"eclN\">…</span> timings together that fix it. The fitted flattening is a little below the Earth's: the air that enlarges the shadow is not the same over the poles and over the equator. Timings more than three standard deviations from the rest of their eclipse are set aside, the site's usual rule."
 },
 {
  "t": "xrefs",
  "keys": [
   "ecl",
   "azim",
   "grav",
   "rot"
  ],
  "wide": false
 },
 {
  "t": "sources"
 }
];
