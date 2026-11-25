// Prose de l'onglet star, extraite VERBATIM et dans l'ordre du panneau
// legacy par research/extract_prose.py (EN). Rendue par src/core/prose.js.
export const PROSE = [
 {
  "t": "eyebrow",
  "html": "Star trails · the one thing a rotation cannot fake"
 },
 {
  "t": "h1",
  "html": "Two people watch the same sky turn opposite ways."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "figopen opener",
  "id": "st-figOpen",
  "html": "<div class=\"figopen opener\" id=\"st-figOpen\"></div>"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "reads",
  "id": "st-openReads",
  "html": "<div class=\"reads\" id=\"st-openReads\"></div>"
 },
 {
  "t": "raw",
  "tag": "button",
  "class": "mini",
  "id": "st-openBtn",
  "html": "<button id=\"st-openBtn\" type=\"button\" class=\"mini\">pause motion</button>"
 },
 {
  "t": "fcap",
  "k": "st-fcap0",
  "html": "<b>One sky, one place, two models.</b> The same 515 stars over Melbourne (37.8° S) at the December solstice, with 30-minute trails. Left, the globe, facing south: the stars turn clockwise about a fixed point due south, as high as the latitude. Right, the flat disc under its dome, facing north: the only fixed point is the northern one, low over the horizon, and the stars turn counter-clockwise about it. Real positions and colours, every Hipparcos star brighter than magnitude 4<sup class=\"ref\"><a href=\"#s-star-n7\">[7]</a></sup>, gnomonic camera; on a narrow screen the globe is the upper panel; the readout above gives both fixed points."
 },
 {
  "t": "lead",
  "html": "Point a camera at the sky for an hour and the stars draw arcs. From Europe they turn counter-clockwise about a point in the north; from Chile they turn clockwise about a point in the south. That difference is not a matter of degree. It is a <b>sign</b>, and a sign is the hardest thing in this whole page for a model to get wrong quietly.",
  "opener": true,
  "k": "st-p1"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>The result, and it is about the flat model alone.</b> The apparent sense of a rigid rotation is the sign of <b>ω · û</b>, where û is the direction you are looking. Reversing it means crossing the surface ω · û = 0; nothing else does it — not distance, not size, not speed. On a plane, everyone shares the same <em>up</em>. The dome turns about a vertical, so ω points up for every observer at once, and the fixed point sits at altitude atan(h/r), which is above the horizon everywhere on the disc whatever h is. So ω · û &gt; 0 everywhere, and the sense is the same everywhere. The flat model does not get the sense wrong: it cannot produce a reversal at all, and no setting helps it.",
  "k": "st-callout1"
 },
 {
  "t": "notes",
  "html": "Where the numbers come from, before any of them is used. The stars are the Yale Bright Star Catalogue, J2000, as published<sup class=\"ref\"><a href=\"#s-star-n1\">[1]</a></sup>, checked line by line against Hipparcos: the largest disagreement is 2.4″, except α Centauri at 21″, which is its proper motion between the two catalogue epochs<sup class=\"ref\"><a href=\"#s-star-n2\">[2]</a></sup>. Precession to the date is applied — 0.36° by 2026, the same order as the precision claimed here — so Polaris sits 0.625° from the pole rather than the 0.736° of J2000. Proper motion is not applied; it is an order of magnitude below anything asserted. The twelve cities are Natural Earth, public domain<sup class=\"ref\"><a href=\"#s-star-n3\">[3]</a></sup>, the same dataset as the coastlines elsewhere on this page.",
  "k": "st-p0"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "lines": [
   {
    "tex": "\\text{sense} = \\operatorname{sign}(\\omega\\cdot\\,û)",
    "fallback": "sense = sign(ω · û)"
   }
  ],
  "fig": "stfig0",
  "gloss": "ω is the rotation vector — along the axis, by the right hand. û is the direction you are looking. The sense you see is the sign of their dot product, so reversing it means crossing the plane ω · û = 0 and nothing else does: not distance, not size, not speed. On a plane, ω points up for every observer at once and the fixed point is always above the horizon, so the sign never changes anywhere on the disc.",
  "k": "x:st-g0"
 },
 {
  "t": "h2",
  "html": "The sky has a map: right ascension and declination",
  "k": "sky-h2a"
 },
 {
  "t": "notes",
  "k": "sky-p1",
  "html": "Measure the angle between two stars tonight, next month, from Paris or from Melbourne: it is the same angle, once the bending of light near the horizon is allowed for. The stars keep their places among themselves. Their <b>directions</b> can therefore be drawn once and for all on a sphere around the observer, as towns are drawn on a globe, and every star gets two numbers. That sphere is a map of directions only: it does not say how far any star is, and nothing on this tab needs to know."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"stAnimSphere\" style=\"height:clamp(440px,62vw,580px)\"></canvas></div>"
 },
 {
  "t": "fcap",
  "k": "sky-cap1",
  "html": "<b>The celestial sphere, drawn as a glass ball seen from outside; we are at its centre.</b> The 960 stars brighter than magnitude 4.55 that have a position in the Hipparcos catalogue<sup class=\"ref\"><a href=\"#s-star-n7\">[7]</a></sup>, at their J2000 places, with the Big Dipper, Cassiopeia, Orion and the Southern Cross joined up. Teal: the celestial equator, graduated in hours. Gold dashes: the ecliptic, the Sun's yearly path; it crosses the equator at 0 h. For six stars in turn, the amber arc is the right ascension and the blue arc the declination. The far side of the ball is the sky as it is seen from inside, so it is drawn brighter. Click to pause."
 },
 {
  "t": "notes",
  "k": "sky-p2",
  "html": "<b>Declination</b> (δ) is the latitude of that map: 0° on the celestial equator, +90° at the north celestial pole, −90° at the south one. The poles are the two fixed points the trails turn about. <b>Right ascension</b> (α) is its longitude, counted eastwards along the equator from the point where the Sun crosses it in March. It is given in hours because the sky is a clock: it turns once in 24 sidereal hours, so 1 h is 15°, and a star with one more hour of right ascension crosses the meridian one sidereal hour later. Sirius is at α = 6 h 45 min, δ = −16.7°; Vega at 18 h 37 min, +38.8°; Polaris at 2 h 32 min, +89.3°; Acrux, the foot of the Southern Cross, at 12 h 27 min, −63.1°."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "sky-fx-radec",
  "fig": "stFxRaDec",
  "lines": [
   {
    "tex": "\\delta = a - (90° - \\varphi)",
    "fallback": "δ = a − (90° − φ)"
   },
   {
    "tex": "\\alpha = \\text{sidereal time when the star crosses the meridian}",
    "fallback": "α = sidereal time when the star crosses the meridian"
   }
  ],
  "gloss": "How the two numbers are measured, with a telescope that only swings along the meridian and a clock. a is the star's altitude as it crosses the meridian, φ the latitude of the observatory, 90° − φ the altitude of the celestial equator there (the formula is written for a star crossing on the equator's side of the zenith). The clock keeps sidereal time, 24 h for one turn of the sky, and reads 0 h when the March equinox point crosses. No distance and no model of the Earth's shape enters: two angles and a time."
 },
 {
  "t": "h2",
  "html": "Fixed from one night to the next, not from one century to the next",
  "k": "sky-h2b"
 },
 {
  "t": "notes",
  "k": "sky-p3",
  "html": "From one night to the next the two numbers do not change by anything an eye or a camera can see. The whole grid slides by 0.14″ a night and the fastest star known, Barnard's, moves 0.03″ a night; the eye separates about 60″. Over centuries two slow motions add up. The first is <b>precession</b>: the axis the sky turns about is itself swinging, and it carries the grid with it, 50.3″ a year<sup class=\"ref\"><a href=\"#s-star-n8\">[8]</a></sup>. Hipparchus found it about 129 BC, by comparing his position of Spica with one measured 150 years before him<sup class=\"ref\"><a href=\"#s-star-n9\">[9]</a></sup>."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"stAnimPrec\" style=\"height:clamp(440px,62vw,600px)\"></canvas></div>"
 },
 {
  "t": "fcap",
  "k": "sky-cap2",
  "html": "<b>The stars stay, the grid moves.</b> The sky around the pole of the ecliptic (gold cross), 43° either way. The white ring is the celestial pole of the year; it travels along the gold dashed circle, 23.4° from the cross, and the grid of declination circles and hour lines (amber: 0 h) travels with it. The readout gives the nearest bright star to the pole and the coordinates of Polaris and Sirius in the grid of that year. The rate (50.288″ a year) and the tilt (23.439°) are held at their present values, which gives one turn in 25,772 years; in reality both drift a little, so dates far from today are good to a century or two, not to the year. Click to pause."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "sky-fx-prec",
  "fig": "stFxPrec",
  "lines": [
   {
    "tex": "\\Delta\\alpha \\approx (m + n\\sin\\alpha\\tan\\delta)\\,t",
    "fallback": "Δα ≈ (m + n sin α tan δ) t"
   },
   {
    "tex": "\\Delta\\delta \\approx n\\cos\\alpha\\;t",
    "fallback": "Δδ ≈ n cos α · t"
   },
   {
    "tex": "m = p\\cos\\varepsilon = 46.1\\,\\text{″/yr},\\quad n = p\\sin\\varepsilon = 20.0\\,\\text{″/yr}",
    "fallback": "m = p cos ε = 46.1″/yr, n = p sin ε = 20.0″/yr"
   }
  ],
  "gloss": "p = 50.29″ a year is the rate at which the pole goes round its circle, ε = 23.44° the radius of that circle (the tilt of the equator on the ecliptic), t the number of years. The two lines hold for a few centuries and away from the poles; the animation and the tables turn the whole sphere instead. For Sirius (α = 101°) the second line gives −3.9″ a year: its declination was −16.58° in 1900 and is −16.75° in 2026, of which 0.04° is the star's own motion."
 },
 {
  "t": "notes",
  "k": "sky-p4",
  "html": "What it does to the numbers: Polaris was 12.4° from the pole in Hipparchus's time and is 0.63° from it in 2026; it will pass closest, 0.46°, about 2100. Thuban, in the Dragon, was the pole star about 2800 BC, and Vega will be within 4° of the pole about AD 13,700. Spica was 0.5° north of the equator for Hipparchus and is 11.3° south of it now. This is why every catalogue carries a date (B1950, J2000), and why the tables of this tab move the J2000 positions to the date before using them, by 0.36°. Precession does not separate the two models: a dome may be given a swinging axis as easily as a globe. It is here because the coordinates cannot be read without it."
 },
 {
  "t": "notes",
  "k": "sky-p5",
  "html": "The second motion is each star's own, its <b>proper motion</b>. Halley found it in 1718: Sirius and Arcturus stood more than half a degree south of where Ptolemy's catalogue had put them<sup class=\"ref\"><a href=\"#s-star-n10\">[10]</a></sup>. It is small, different for every star, and it slowly undoes the constellations."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"stAnimPM\" style=\"height:clamp(340px,52vw,460px)\"></canvas></div>"
 },
 {
  "t": "fcap",
  "k": "sky-cap3",
  "html": "<b>The Big Dipper from 100,000 years ago to 100,000 years ahead.</b> Each star is moved along a straight line at the proper motion Hipparcos measured<sup class=\"ref\"><a href=\"#s-star-n7\">[7]</a></sup>; the dashed outline is today's. Five of the seven stars travel together and keep their figure; Dubhe and Alkaid go another way, and the bowl opens. The motion towards or away from us is left out, so this is the right picture for the angles and not for the brightness. Click to pause."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "sky-fx-pm",
  "fig": "stFxPM",
  "lines": [
   {
    "tex": "\\mu = \\sqrt{\\mu_{\\alpha}^2 + \\mu_{\\delta}^2},\\qquad \\Delta \\approx \\mu\\,t",
    "fallback": "μ = √(μ_α² + μ_δ²), Δ ≈ μ t"
   }
  ],
  "gloss": "μ_α and μ_δ are the two components the catalogue gives, in arcseconds a year (the first already multiplied by cos δ, so that both are angles on the sky); μ is the star's speed across the sky and Δ the angle it has covered after t years."
 },
 {
  "t": "raw",
  "tag": "table",
  "class": "cnav-table",
  "id": "st-tabPM",
  "html": "<table class=\"cnav-table\" id=\"st-tabPM\"></table>"
 },
 {
  "t": "fcap",
  "k": "sky-cap4",
  "html": "Proper motions as published by Hipparcos<sup class=\"ref\"><a href=\"#s-star-n7\">[7]</a></sup>, fastest first, then four well-known stars. The last line is the sliding of the grid, the same for every star: it is 5 to 1,000 times faster than any star's own motion, which is why a catalogue must be dated long before its stars have visibly moved."
 },
 {
  "t": "h2",
  "html": "Southern stars from the north, northern stars from the south",
  "k": "sky-h2c"
 },
 {
  "t": "notes",
  "k": "sky-p6",
  "html": "A star is called northern or southern by the sign of its declination, not by where one must stand to see it. On a globe, the horizon of latitude φ hides only the cap of sky within |φ| of the far pole; everything else rises. Sirius is a southern star (δ = −16.7°) and the brightest star of a Paris winter night, 24° up. Orion's belt lies on the celestial equator (Mintaka, δ = −0.3°) and is seen from every inhabited place. From Melbourne, Arcturus (δ = +19°) climbs to 33° and Vega (+38.8°) to 13°. From the equator the whole sphere passes overhead; only at a pole is one reduced to one's own half. And what stays hidden changes with latitude exactly as the cap says: Canopus never rises in Paris and culminates 7° above the horizon of Cairo. Aristotle already used it: stars are seen in Egypt and Cyprus that are not seen further north<sup class=\"ref\"><a href=\"#s-star-n11\">[11]</a></sup>."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"stAnimVis\" style=\"height:clamp(480px,64vw,610px)\"></canvas></div>"
 },
 {
  "t": "fcap",
  "k": "sky-cap5",
  "html": "<b>Six places, north to south.</b> The same glass ball, positions of 2026. The white line is the observer's zenith and the white circle the horizon; they go round once a sidereal day, and the horizon sweeps everything except the red cap around the far pole, which never rises. The teal cap around the near pole never sets. For each place, three stars of the other half of the sky: teal if they rise there, red if they never do. Altitudes are geometric; near the horizon refraction lifts a star by about half a degree more. Click to pause."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "sky-fx-vis",
  "fig": "stFxVis",
  "lines": [
   {
    "tex": "a_{\\max} = 90° - |\\varphi - \\delta|",
    "fallback": "a_max = 90° − |φ − δ|"
   },
   {
    "tex": "\\text{never rises: } |\\varphi - \\delta| \\ge 90°,\\qquad \\text{never sets: } |\\varphi + \\delta| \\ge 90°",
    "fallback": "never rises: |φ − δ| ≥ 90°, never sets: |φ + δ| ≥ 90°"
   },
   {
    "tex": "f = \\frac{1 + \\cos\\varphi}{2}",
    "fallback": "f = (1 + cos φ)/2"
   }
  ],
  "gloss": "φ is the latitude and δ the declination, both positive to the north. a_max is the star's altitude when it crosses the meridian, its highest of the night. f is the share of the celestial sphere that rises at latitude φ: one half at a pole, 83 % in Paris, all of it at the equator. Same triangle as the trail formula above, taken on the meridian."
 },
 {
  "t": "raw",
  "tag": "table",
  "class": "cnav-table",
  "id": "st-tabVis",
  "html": "<table class=\"cnav-table\" id=\"st-tabVis\"></table>"
 },
 {
  "t": "fcap",
  "k": "sky-cap6",
  "html": "Highest altitude of the night, geometric, for the positions of 2026; <b>never</b> = the star does not rise there, * = it never sets there. The last line is the flat disc of this tab: under a dome nothing is ever below the horizon, so there is no hidden cap at any latitude. What would count for the flat model: Canopus or the Southern Cross seen from Paris, or Polaris from Melbourne, on any night. Check any cell against the USNO service<sup class=\"ref\"><a href=\"#s-star-n5\">[5]</a></sup>."
 },
 {
  "t": "h2",
  "html": "1 · The fixed point, place by place",
  "k": "st-h2a"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "ctlrow",
  "id": "",
  "html": "<div class=\"ctlrow\"> <label>Place <select id=\"st-selSpot\"></select></label> <label>Date <select id=\"st-selDate\"></select></label> <label>Flat dome <select id=\"st-selDome\"></select></label> <label>Facing <select id=\"st-selView\"></select></label> </div>",
  "k": "x:c32a0147"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "reads",
  "id": "st-reads",
  "html": "<div class=\"reads\" id=\"st-reads\"></div>"
 },
 {
  "t": "notes",
  "html": "Nothing is fitted here. The globe puts the fixed point at the altitude of the pole — that is the celestial-navigation result, and it is argued there rather than again here<sup class=\"ref\"><a href=\"#s-star-n6\">[6]</a></sup>. The flat model puts it at atan(h/r), where r is the distance to the centre of the azimuthal-equidistant map. Read the table for what it is worth in both directions: at northern mid-latitudes the two models agree to about two degrees, and that half of the case is stated here rather than buried.",
  "k": "st-p2"
 },
 {
  "t": "formula",
  "flat": true,
  "style": "border-left-color:var(--flat)",
  "lines": [
   {
    "tex": "a = \\arctan\\left(h/d\\right)",
    "fallback": "a = arctan(h / d)"
   },
   {
    "tex": "d = \\sqrt{r^2 + \\rho^2 - 2r\\rho\\cos\\theta}",
    "fallback": "d = √(r² + ρ² − 2rρ cos θ)"
   }
  ],
  "fig": "stfig1",
  "gloss": "The flat model, edge-on and from above. h = height of the dome, r = your distance to the centre of the azimuthal-equidistant map, ρ = the radius of the circle the star's ground point travels, θ = how far round that circle it has got. a is what you would measure with a clinometer. Note that a is positive for every r, every ρ and every θ: on this model nothing ever sets.",
  "k": "x:st-g1"
 },
 {
  "t": "table",
  "id": "st-tabSpots",
  "tbody": "",
  "caption": "The flat dome is swept, never fitted. The break between the two models is not in the altitude — it is in the azimuth and in the sense, and both of them flip south of the equator without any value of h being involved.",
  "head": [],
  "k": "x:st-cap1"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "lines": [
   {
    "tex": "\\sin a = \\sin\\delta\\sin\\varphi + \\cos\\delta\\cos\\varphi\\cos H",
    "fallback": "sin a = sin δ sin φ + cos δ cos φ cos H"
   }
  ],
  "fig": "stfig2",
  "gloss": "The spherical triangle the globe uses everywhere on this page. Z = your zenith, P = the celestial pole, ★ = the star. Its sides are 90° − φ, 90° − δ and 90° − a; the angle at P is the hour angle H, which advances at 15.041° per hour and is the only thing that changes during a night. Latitude and declination are fixed, so the whole trail follows from one turning angle.",
  "k": "x:st-g2"
 },
 {
  "t": "h2",
  "html": "2 · The shape of a trail",
  "k": "st-h2b"
 },
 {
  "t": "notes",
  "html": "A trail is a circle <em>on the sky</em> if and only if the observer stands on the axis of the circle the star describes. On the disc that happens at the centre and nowhere else. Everywhere else the observer sees an oblique cone over a circle, and its angular radius from the fixed point varies by a factor of two around one turn.",
  "k": "st-p3"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"st-figSky\"></div></div>"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "lines": [
   {
    "tex": "p = 90° - |\\delta|",
    "fallback": "p = 90° − |δ|"
   },
   {
    "tex": "a_{\\text{up}} = \\varphi + p,\\quad a_{\\text{low}} = \\varphi - p",
    "fallback": "a_up = φ + p, a_low = φ − p"
   },
   {
    "tex": "\\g{\\frac{1}{2}(a_{\\text{up}} + a_{\\text{low}}) = \\varphi}",
    "fallback": "<b>½(a_up + a_low) = φ</b>"
   }
  ],
  "fig": "stfig3",
  "gloss": "Looking due north along the meridian. The pole P sits at the latitude φ, and a circumpolar star crosses the meridian twice a day, at p above P and p below it. Their mean is therefore the latitude and their half-difference is p — for any star and any latitude, with nothing fitted. Two altitudes read off a clinometer are the whole measurement.",
  "k": "x:st-g3"
 },
 {
  "t": "table",
  "id": "st-tabShape",
  "tbody": "",
  "caption": "On a globe the two culminations sit at φ + p and φ − p exactly, so their <b>mean is the latitude</b> and their half-difference is p, for any star and any latitude. Two altitudes read off a clinometer settle it: no camera, no lens correction, no calibration.",
  "head": [],
  "k": "x:st-cap2"
 },
 {
  "t": "callout",
  "flat": false,
  "html": "<b>The rule only holds while the star stays between the pole and the zenith.</b> In general the two culminations sum to 2·min(φ, δ): once δ &lt; φ the star passes the zenith, comes down the other side of the meridian, and the mean gives δ instead of φ. The star chosen above is therefore one with δ ≥ |φ|, and with the largest trail radius available rather than the brightest — a trail 0.6° across is nearly symmetric in <em>both</em> models, and a test that cannot separate them is not a test.",
  "k": "st-callout2"
 },
 {
  "t": "h2",
  "html": "3 · The dilemma that consumes the dome height",
  "k": "st-h2c"
 },
 {
  "t": "notes",
  "html": "The flat model has one free parameter here, and it has to serve two masters. Bring the dome closer and the fixed point sits at the right altitude while the trails deform; push it away and the trails become circular while the fixed point climbs to everyone's zenith. The two requirements are tens of degrees apart and no intermediate value satisfies both.",
  "k": "st-p4"
 },
 {
  "t": "table",
  "id": "st-tabDome",
  "tbody": "",
  "caption": "Dome heights are swept, as the azimuth tab already sweeps its lamp. Note that the star dome is not that lamp: flat cosmology puts the firmament above the Sun, so two heights are legitimate — but a page that argues there is only one refraction coefficient owes the reader that sentence.",
  "head": [],
  "k": "x:st-cap3"
 },
 {
  "t": "h2",
  "html": "4 · What a photograph can and cannot settle",
  "k": "st-h2d"
 },
 {
  "t": "notes",
  "html": "The expected objection is that trails photograph as ovals. They do — in both models — and the figure below is the answer rather than a warning. The dashed curve is the image of a mathematically <b>perfect circle</b> about the fixed point, seen through the same lens from the same framing. On a globe the trail lies on it. On the disc it hugs it on one side and falls away on the other.",
  "k": "st-p5"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"st-figProj\"></div> <div class=\"ctlrow\"> <label>Model <select id=\"st-selModel\"><option value=\"g\">globe</option><option value=\"f\">flat disc</option></select></label> <label>Lens <select id=\"st-selLens\"></select></label> <label>Framing <select id=\"st-selAim\"><option value=\"off\">fixed point off axis</option><option value=\"on\">aimed at the fixed point</option></select></label> </div> <div class=\"reads\" id=\"st-projReads\"></div> <ul class=\"figkey\" id=\"st-projKey\"></ul> <div class=\"fcap\"><b>Why no lens can fake the difference.</b> All eight lenses are <b>radial</b> maps: each moves a point along the ray joining it to the centre of the image and never touches its polar angle, so none of them can make a symmetric thing asymmetric or the reverse. What each law does to straight lines and to the horizon, frame by frame — and why the focal length itself deforms nothing — is shown on the <a class=\"xref\" href=\"#tab-curv\" data-xref=\"curv\">Horizon curve</a> tab. The barrel coefficients are typical of their class of lens, not the measurement of a particular model, and no number on this page depends on them.</div> </div>",
  "k": "star-m1"
 },
 {
  "t": "h2",
  "html": "5 · The rhythm along the trail",
  "k": "st-h2e"
 },
 {
  "t": "notes",
  "html": "Cut the exposure into equal intervals — an intervalometer, or a card held over the lens — and the trail becomes dashes. On a globe each dash sweeps <b>exactly</b> the same angle about the fixed point: 15.041° per hour<sup class=\"ref\"><a href=\"#s-star-n4\">[4]</a></sup>, for any star, at any latitude, with no free parameter anywhere. On the disc the star comes closer and goes away again, and the dashes stretch and bunch.",
  "k": "st-p6"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "lines": [
   {
    "tex": "\\Delta\\psi = 15.041°\\,\\mathrm{h}^{-1} \\times \\Delta t",
    "fallback": "Δψ = 15.041°/h × Δt"
   }
  ],
  "fig": "stfig4",
  "gloss": "ψ is the position angle about the fixed point F — where the star sits round the circle, not how far from it. On a globe it advances at a constant rate, so equal exposures give equal dashes, for every star and every latitude. The measurement is an angle about the centre of the image, which is why no radial lens distortion can touch it.",
  "k": "x:st-g4"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"st-figRate\"></div> <ul class=\"figkey\" id=\"st-rateKey\"></ul> <div class=\"fcap\"><b>One place, one night, one photograph.</b> This is the only test on the tab that needs neither travel nor anyone else's data. It is also immune to the lens: aimed at the fixed point, that point becomes the centre of the image, and any radial distortion preserves angles about the centre exactly. Measure with a protractor on a print. The test is strong at middle and southern latitudes, weak near the pole where the trail radius collapses, and unavailable at the equator where no trail closes.</div> </div>",
  "k": "x:st-fcap2"
 },
 {
  "t": "h2",
  "html": "6 · Always up, seasonal, never seen",
  "k": "st-h2f"
 },
 {
  "t": "notes",
  "html": "On a globe a constellation falls into one of three classes and its <b>declination</b> decides, compared with 90° − |φ|. On the flat disc there is one class: the altitude is atan(h/d), positive everywhere and always, so everything is always up, everywhere.",
  "k": "st-p7"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"st-figSeason\"></div> <ul class=\"figkey\" id=\"st-seasonKey\"></ul> <div class=\"fcap\"><b>Seasonality on its own proves nothing</b> — a dome turning at the sidereal rate reproduces the four-minute daily drift without effort, and saying so costs nothing. What can be checked is <em>which</em> constellations never set and which never rise, and from what latitude. The dates below are there to make the observation practicable, not to make an argument: they put a constellation on the meridian at a civil hour.</div> </div>",
  "k": "x:st-fcap3"
 },
 {
  "t": "table",
  "id": "st-tabSeason",
  "tbody": "",
  "caption": "Positions are those of the group of stars named in the catalogue below, not the centre of the IAU boundary. The difference is a few degrees and changes none of the three classes unless a constellation sits on a limit, in which case the limit is printed and the reader can see it.",
  "head": [],
  "k": "x:st-cap4"
 },
 {
  "t": "h2",
  "html": "Experiment 2b · photograph the axis",
  "k": "st-h2g"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "exp",
  "id": "",
  "html": "<div class=\"exp\"><p class=\"exp-meta\"><b>Independent variable:</b> the place — the hemisphere first, the latitude second. <b>Dependent:</b> (a) the sense of rotation, one bit; (b) the two culmination altitudes of one circumpolar star. <b>Held constant:</b> the same lens, the aim on the fixed point, a fixed foreground for the horizon, a stated exposure. <b>Kit:</b> a phone on a wall and thirty minutes of stacking. For (b) a clinometer is enough — no camera at all. Every altitude printed on this tab can be checked against the USNO service<sup class=\"ref\"><a href=\"#s-star-n5\">[5]</a></sup> before you go outside.</p> <p class=\"exp-meta\"><b>Verdict rule, announced in advance and symmetric.</b> The globe fails if a southern observer photographs arcs centred on Polaris, if the sense is the same in both hemispheres, or if the mean of the two culminations does not return the latitude. The flat model fails if the sense reverses between hemispheres, or if that mean does return the latitude instead of missing it by several degrees.</p></div>",
  "k": "x:st-exp1"
 },
 {
  "t": "notes",
  "html": "Deliberately left out: differential refraction and extinction near the horizon, which are modelled nowhere else on this page and which the culmination test does not need; aberration, stellar parallax and proper motion, all below anything claimed here; and trail photometry, which is real and predicted differently by the two models but cannot be measured without calibration.",
  "k": "st-p8"
 },
 {
  "t": "xrefs",
  "keys": [
   "cnav",
   "fou",
   "azim",
   "sun",
   "gps"
  ],
  "wide": false
 },
 {
  "t": "sources"
 },
 {
  "t": "fold",
  "q": false,
  "k": "star-fold1",
  "summary": "<b>Raw numbers for the case shown</b><span class=\"fold-teaser\">The Julian date, the sidereal time, the precessed declination and the disc radius, so every line above can be recomputed by hand</span>",
  "html": "<p class=\"notes\">These are the intermediate quantities the tables above are built from, printed rather than hidden. Feed the same instant to the USNO service<sup class=\"ref\"><a href=\"#s-star-n5\">[5]</a></sup> and you should get the same altitudes to the second decimal; if not, one of the two accounts is wrong, and the numbers here are enough to find out which.</p> <table id=\"st-dump\"></table>"
 }
];
