// Prose de l'onglet rot (epic19, 2026-10-04), en anglais (source). Valeurs : span.cv[data-v] remplis par values.js.
export const PROSE = [
 {
  "t": "eyebrow",
  "html": "Earth's rotation · three instruments, no map",
  "k": "rot-eyebrow"
 },
 {
  "t": "h1",
  "html": "The ground turns, and the instruments that say so need no map",
  "k": "rot-h1"
 },
 {
  "t": "lead",
  "opener": true,
  "k": "rot-lead",
  "html": "Three models make three different claims about rotation. A plane at rest says nothing turns. A disc spinning about the North Pole says every place turns at the same rate about its own vertical. A globe says each place turns about its vertical at the rate Ω·sin φ, which is largest at the poles, nothing at the equator, and reversed in the south. The instruments below read that rate from a frequency, a fall and a clock. None of them is given a radius, a map or an ephemeris."
 },
 {
  "t": "h2",
  "k": "rot-h2ring",
  "html": "Ring lasers: the rotation read from a beat frequency"
 },
 {
  "t": "notes",
  "k": "rot-ring1",
  "html": "<b>Two beams of light run around a closed loop in opposite directions.</b> If the loop turns, the beam going with the rotation has a longer path than the one going against it, the two settle on slightly different frequencies, and their beat is counted directly. The rate is exact: f = 4A·Ω/(λP), where A is the area enclosed, P the perimeter, λ the wavelength and Ω the rotation about the loop's axis. Four horizontal rings have been run for years: three in the Cashmere cavern under Christchurch, New Zealand, one at Wettzell in Bavaria<sup class=\"ref\"><a href=\"#s-rot-n1\">[1]</a></sup><sup class=\"ref\"><a href=\"#s-rot-n2\">[2]</a></sup>. Their sizes are measured with a tape, their wavelength is a property of helium-neon, their beat is counted."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"rotAnimRing\" style=\"height:clamp(360px,calc(660px - 32vw),600px)\"></canvas></div>"
 },
 {
  "t": "fcap",
  "html": "<b>A ring laser detecting the ground's turn.</b> Two light pulses leave the detector together and run around the ring in opposite directions. The ring turns with the ground, so the pulse running with the turn has further to go and arrives late; the one running against it arrives early. In a ring laser the two beams run continuously and the delay shows as interference fringes drifting past the detector: on the right, at the beat measured on Wettzell's ring G, at the globe's Ω sin φ, at the rate a disc turning about the pole would give, and frozen for a plane at rest. The fringes are slowed 200 times; the ring's turn during one lap of light is enlarged by the factor stamped on the drawing. Click to pause.",
  "k": "rotAnimRing-cap"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "rot-fx-ring",
  "fig": "rotFxRing",
  "lines": [
   {
    "tex": "f = \\frac{4A}{\\lambda P}\\,\\Omega_{\\text{v}}",
    "fallback": "f = 4A Ωv / λP"
   },
   {
    "tex": "\\g{\\Omega_{\\text{v}} = \\Omega\\,\\sin\\varphi}\\quad\\text{(globe)},\\qquad \\Omega_{\\text{v}} = \\Omega\\quad\\text{(disc)},\\qquad 0\\quad\\text{(plane at rest)}",
    "fallback": "Ωv = Ω sin φ (globe), Ω (disc), 0 (plane at rest)"
   }
  ],
  "gloss": "Ωv is the part of the rotation about the ring's own axis, here the local vertical. On a globe the vertical makes the angle 90° − φ with the Earth's axis, so a horizontal ring sees Ω sin φ. On a disc turning about its pole every vertical is parallel to the axis, so every ring sees all of Ω. The ratio between two sites, sin φ₁ / sin φ₂ against 1, needs no value of Ω at all."
 },
 {
  "t": "table",
  "id": "rot-tabRing",
  "tbody": "rot-tbRing",
  "k": "x:rot-cap-ring",
  "caption": "Four horizontal rings. The measured beat gives Ωv = fλP/4A; dividing by |sin φ| gives Ω. The last two columns are the beats the two flat models predict for the same ring, with the rotation the stars show (one turn in 23 h 56 min)<sup class=\"ref\"><a href=\"#s-rot-n1\">[1]</a></sup><sup class=\"ref\"><a href=\"#s-rot-n2\">[2]</a></sup>.",
  "head": [
   "Ring",
   "Site",
   "Area",
   "Beat measured",
   "Ω from the beat",
   "Disc would read",
   "Plane at rest"
  ]
 },
 {
  "t": "raw",
  "tag": "p",
  "class": "reads",
  "id": "rot-readRing",
  "html": "<p class=\"reads\" id=\"rot-readRing\"></p>"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "k": "x:rot-ringhz-fig",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"rotFigRingHz\"></div> <div class=\"fcap\">What the rings measured: the beat frequency of each, beside the frequency its size and latitude give for a globe turning once a sidereal day, for a disc turning about its pole, and for a plane at rest (zero)<sup class=\"ref\"><a href=\"#s-rot-n1\">[1]</a></sup><sup class=\"ref\"><a href=\"#s-rot-n2\">[2]</a></sup>. The ratio of Wettzell to Christchurch needs no value of Ω at all: it is the ratio of the sines of their latitudes on a globe, and 1 on a disc.</div> </div>"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "k": "x:rot-ring-fig",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"rotFigRing\"></div> <div class=\"fcap\">The rotation each ring feels about its vertical, against what each model allows. Christchurch and Wettzell read different rates, in the ratio of the sines of their latitudes; a disc would make them equal and a plane at rest would make them zero.</div> </div>"
 },
 {
  "t": "callout",
  "flat": false,
  "k": "rot-ring2",
  "html": "<b>The test that needs no parameter.</b> Wettzell's ring feels <span class=\"cv\" data-v=\"ratioM\">…</span> times the rotation of Christchurch's. A globe predicts sin 49.14° / sin 43.58° = <span class=\"cv\" data-v=\"ratioG\">…</span>. Any disc, whatever its speed, predicts exactly 1. Wettzell's G alone gives Ω = <span class=\"cv\" data-v=\"omegaG\">…</span> rad/s: one turn in <span class=\"cv\" data-v=\"dayG\">…</span>."
 },
 {
  "t": "callout",
  "flat": true,
  "k": "rot-ring3",
  "html": "<b>The flat models, at their best.</b> A disc is free to choose its speed, and it can match one ring: tuned on Wettzell, it then predicts <span class=\"cv\" data-v=\"discCII\">…</span> Hz at Christchurch, where C-II counts 79.4 Hz. It cannot match both, because the ratio does not depend on the speed. A plane at rest predicts a beat of zero, and a ring laser at rest does lock to zero: these rings never do. <b>What would vindicate a flat model:</b> two horizontal rings at different latitudes reading the same rotation."
 },
 {
  "t": "notes",
  "k": "rot-ring4",
  "html": "<b>Limits.</b> The large Christchurch rings read 0.2 % low; their builders attribute it to backscatter coupling between the beams, which pulls the two frequencies together, and the small rings do not show it<sup class=\"ref\"><a href=\"#s-rot-n1\">[1]</a></sup>. The beat is a magnitude: the reversal of sense in the south is in the geometry, not in a sign the counter displays. The latitudes are taken as angles."
 },
 {
  "t": "h2",
  "k": "rot-h2fall",
  "html": "A dropped ball lands east of the plumb line"
 },
 {
  "t": "notes",
  "k": "rot-fall1",
  "html": "<b>The top of a shaft moves east a little faster than its bottom,</b> because it is a little further from the axis. A ball let go at the top keeps that extra speed and lands east of the point under it. The effect was predicted by Newton and measured from 1791 on, in towers and mine shafts<sup class=\"ref\"><a href=\"#s-rot-n3\">[3]</a></sup>. Only lengths, a time and g enter: no map, no radius."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"rotAnimFall\" style=\"height:clamp(360px,calc(660px - 32vw),600px)\"></canvas></div>"
 },
 {
  "t": "fcap",
  "html": "<b>Reich's drop at Freiberg, 1831, in real time.</b> The top of the 158.5 m shaft is further from the Earth's axis than its bottom and moves east a few millimetres per second faster; a ball let go at the top keeps that speed and lands east of the plumb line. Blue: the ball on the globe's path; orange ring: a ball on either flat model, which falls straight. At the bottom, what Reich measured over 106 drops, with its error, and what the globe predicts. The eastward offset is enlarged 1,000 times; the fall itself takes its real 5.7 s. Click to pause.",
  "k": "rotAnimFall-cap"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "rot-fx-fall",
  "fig": "rotFxFall",
  "lines": [
   {
    "tex": "t = \\sqrt{2h/g}",
    "fallback": "t = √(2h/g)"
   },
   {
    "tex": "d = \\tfrac13\\,\\omega\\,g\\,t^3\\cos\\varphi \\;\\Rightarrow\\; \\g{\\omega = \\frac{3d}{g\\,t^3\\cos\\varphi}}",
    "fallback": "d = ⅓ ω g t³ cos φ ⇒ ω = 3d / (g t³ cos φ)"
   }
  ],
  "gloss": "h is the height of the drop, t its duration, d the measured eastward offset and φ the latitude. On a disc turning about its vertical axis the fall is parallel to the axis, the Coriolis force vanishes and d = 0; on a plane at rest d = 0 too. Only a turning globe, whose axis is tilted to the local vertical by 90° − φ, gives cos φ."
 },
 {
  "t": "table",
  "id": "rot-tabFall",
  "tbody": "rot-tbFall",
  "k": "x:rot-cap-fall",
  "caption": "Five experiments, all of those in Roehner's table<sup class=\"ref\"><a href=\"#s-rot-n3\">[3]</a></sup>. The globe's offset uses the rotation of the stars; ω is read from the measured offset alone.",
  "head": [
   "Experiment",
   "Height",
   "Offset measured",
   "Globe would give",
   "ω from the offset"
  ]
 },
 {
  "t": "raw",
  "tag": "p",
  "class": "reads",
  "id": "rot-readFall",
  "html": "<p class=\"reads\" id=\"rot-readFall\"></p>"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "k": "x:rot-fallmm-fig",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"rotFigFallMm\"></div> <div class=\"fcap\">What the drops measured: the eastward offset of each series, in millimetres, beside the offset the rotating globe predicts for its height and latitude (blue tick)<sup class=\"ref\"><a href=\"#s-rot-n3\">[3]</a></sup>. Both flat models predict zero. Bähr's drop-tower series lands 15 % beyond the prediction, Hall's short drop 17 % short of it; Guglielmini's 1791 series is set aside, more than three standard deviations from the others.</div> </div>"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "k": "x:rot-fall-fig",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"rotFigFall\"></div> <div class=\"fcap\">The rotation rate each drop implies, with its probable error where one was published. Both flat models sit on zero. Guglielmini's 1791 value is shown and set aside: it lies more than three standard deviations from the other four.</div> </div>"
 },
 {
  "t": "callout",
  "flat": true,
  "k": "rot-fall2",
  "html": "<b>Both flat models predict nothing here.</b> A plane at rest has no Coriolis force; a disc turning about its vertical has one, but it is parallel to the fall and pushes nowhere. <b>What would vindicate them:</b> a long series of careful drops whose mean lands on the plumb point. Hall's 946 drops landed 1.49 mm east<sup class=\"ref\"><a href=\"#s-rot-n4\">[4]</a></sup>."
 },
 {
  "t": "notes",
  "k": "rot-fall3",
  "html": "<b>Limits.</b> Air and turbulence scatter the impacts: Roehner estimates that Reich's published error is about ten times too small<sup class=\"ref\"><a href=\"#s-rot-n3\">[3]</a></sup>, Hall's mean is 17 % below the rotation's prediction and Bähr's 15 % above it. Guglielmini's 1791 offset is nearly twice the prediction and is set aside by the rule used everywhere on this site, more than three standard deviations from the others. Freiberg's latitude is taken as 50.92°<sup class=\"ref\"><a href=\"#s-rot-n5\">[5]</a></sup>."
 },
 {
  "t": "h2",
  "k": "rot-h2sid",
  "html": "The sidereal day: a measurement to make yourself"
 },
 {
  "t": "notes",
  "k": "rot-sid1",
  "html": "<b>A camera on a tripod, a chimney and a clock.</b> Frame a bright star just before it passes behind a fixed edge, note the time it disappears, and do it again some nights later at the same spot. It will vanish about 3 min 56 s earlier each night. Ten nights give the length of one turn of the sky to a fraction of a second."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"rotAnimSid\" style=\"height:clamp(360px,calc(660px - 32vw),600px)\"></canvas></div>"
 },
 {
  "t": "fcap",
  "html": "<b>A turn against the stars, a turn against the Sun.</b> Left, seen from above: the Earth turns and moves along its orbit. The observer's meridian (black line) faces the distant star a little before it faces the Sun again, because by then the Earth has moved on. Right: the star hiding behind a chimney, night after night, 3 min 56 s earlier on the clock each time. The Earth's daily step along its orbit is drawn six times too large so that the gap shows; the times are the true ones. Click to pause.",
  "k": "rotAnimSid-cap"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "rot-fx-sid",
  "fig": "rotFxSid",
  "lines": [
   {
    "tex": "T_{s} = \\frac{t_2 - t_1}{N},\\qquad \\Delta = 86\\,400\\,\\text{s} - T_{s}",
    "fallback": "Tₛ = (t₂ − t₁)/N, Δ = 86 400 s − Tₛ"
   },
   {
    "tex": "\\Omega = \\frac{2\\pi}{T_{s}},\\qquad \\frac{86\\,400\\,\\text{s}}{\\Delta} = 366.24 = 365.24 + 1",
    "fallback": "Ω = 2π/Tₛ, 86 400 s / Δ = 366.24 = 365.24 + 1"
   }
  ],
  "gloss": "t₁ and t₂ are the two clock times (civil days included), N the number of turns between them. The star turns 366.24 times a year while the Sun turns 365.24 times: one turn of difference, the Earth's orbit seen from the ground, or on a flat model the Sun's own yearly lag."
 },
 {
  "t": "exp",
  "h": "Experiment · the sidereal day",
  "title": "Time a star behind a fixed edge, twice",
  "lead": "Same place, same edge, a few nights apart. Enter the two clock readings and the number of nights.",
  "iv": "<b>You measure</b> two times of disappearance and the number of nights",
  "dv": "<b>You get</b> the length of one turn and the daily advance",
  "meta": [
   "The clock must be set to a network time source; photograph its screen with the star, as for the 10 January sunset in the observation tab.",
   "Prediction: 23 h 56 min 4.1 s per turn, 3 min 55.9 s earlier each night."
  ],
  "inputs": [
   [
    "rotT1",
    "First time (hh:mm:ss)",
    "type=\"text\" value=\"21:14:05\""
   ],
   [
    "rotT2",
    "Second time (hh:mm:ss)",
    "type=\"text\" value=\"20:34:46\""
   ],
   [
    "rotN",
    "Nights between",
    "type=\"number\" value=\"10\" min=\"1\" step=\"1\""
   ]
  ],
  "out": "rotSidOut",
  "verdict": "rotSidV",
  "k": "rot-exp"
 },
 {
  "t": "callout",
  "flat": true,
  "k": "rot-sid2",
  "html": "<b>This one does not separate the models,</b> and it is here for that reason. Stars turn once in 23 h 56 min above a plane as above a globe. What the clock gives is the rate Ω the ring lasers read about their verticals, measured with nothing but time, and the extra turn per year. The separation is in the latitude dependence above."
 },
 {
  "t": "xrefs",
  "keys": [
   "fou",
   "avia",
   "star",
   "grav"
  ],
  "wide": false
 },
 {
  "t": "sources"
 }
];
