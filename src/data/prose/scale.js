// Prose de l'onglet scale (epic28, 2026-10-17), en anglais (source). Valeurs : span.cv[data-v] remplis par index.js.
export const PROSE = [
 {
  "t": "eyebrow",
  "k": "scale-eyebrow",
  "html": "Scale · the Earth's motions on one clock, and the distances"
 },
 {
  "t": "h1",
  "k": "scale-h1",
  "html": "How fast, how far: a clock of the Earth's motions, and the distance scale"
 },
 {
  "t": "lead",
  "opener": true,
  "k": "scale-lead",
  "html": "The Earth turns, goes round the Sun, its axis and its orbit slowly swing, and the Sun itself goes round the Galaxy. The clock below shows all five at once, each hand at its true angle now and turning at its true speed: nothing is sped up. Then the distances, from the Earth's radius to the next galaxy, each measured with the step before it."
 },
 {
  "t": "h2",
  "k": "scale-h2clock",
  "html": "A clock of the Earth's motions"
 },
 {
  "t": "notes",
  "k": "scale-clock1",
  "html": "<b>Five hands, five periods.</b> The first is the Earth's rotation relative to the stars, one turn in <span class=\"cv\" data-v=\"pSpin\">…</span>: the Earth Rotation Angle of the IERS, the same angle the ring lasers and the satellites measure in the Rotation and Satellites tabs<sup class=\"ref\"><a href=\"#s-scale-n1\">[1]</a></sup>. The second is the Earth going round the Sun, one turn in <span class=\"cv\" data-v=\"pOrbit\">…</span><sup class=\"ref\"><a href=\"#s-scale-n2\">[2]</a></sup>. The third is the slow turn of the Earth's axis, the precession of the equinoxes that Hipparchus found by comparing star positions, one turn in <span class=\"cv\" data-v=\"pAxis\">…</span><sup class=\"ref\"><a href=\"#s-scale-n3\">[3]</a></sup>. The fourth is the slow turn of the orbit itself, its long axis swinging round in <span class=\"cv\" data-v=\"pPeri\">…</span><sup class=\"ref\"><a href=\"#s-scale-n2\">[2]</a></sup>. The fifth is the Sun going round the centre of the Galaxy: the radio source Sgr A*, at the centre, seems to slide along the Milky Way by 6.411 thousandths of an arcsecond a year, the reflection of our own motion, one turn in <span class=\"cv\" data-v=\"pGal\">…</span><sup class=\"ref\"><a href=\"#s-scale-n4\">[4]</a></sup>."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"scaleAnimClock\" style=\"height:clamp(560px,calc(860px - 30vw),660px)\"></canvas></div>"
 },
 {
  "t": "fcap",
  "k": "scaleAnimClock-cap",
  "html": "<b>The Earth's motions, at their true speeds.</b> Left: each hand at its true angle at this moment, on the computer's clock, counted counterclockwise as seen from the north. Even the fastest hand, the rotation, turns only a quarter of a degree a minute, so the dial seems still. Right: for each hand, its angle now, with enough decimals that the last ones change as you watch; how far it has turned since the page opened; and a tape graduated in the hand's own angle (arcseconds, or millionths of an arcsecond for the slow ones), sliding at the hand's true rate. The graduation and its rate are printed: nothing is sped up. Click to show one frame a second."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "scale-fx-clock",
  "fig": "scaleFxClock",
  "lines": [
   {
    "tex": "\\g{\\theta(t) = \\theta_0 + 360\\deg\\,\\frac{t - t_0}{T}},\\qquad \\omega = \\frac{360\\deg}{T}",
    "fallback": "θ(t) = θ₀ + 360° (t − t₀)/T, ω = 360°/T"
   }
  ],
  "gloss": "θ is a hand's angle, θ₀ its angle at t₀ = 1 January 2000 at noon (J2000), T its period and t the time on your computer. That is the whole program: each hand is a straight line in time. Its code is a few lines in <code>src/tabs/scale/logic.js</code> (function <code>armAngle</code>), with the five values of T and θ₀ and their sources. Open the page twice an hour apart: the rotation hand has turned 15.04°, the orbit hand 0.041°."
 },
 {
  "t": "table",
  "id": "scale-tabArms",
  "tbody": "scale-tbArms",
  "k": "x:scale-cap-arms",
  "caption": "The five hands: their period, how fast their angle changes, and the speed of travel it means where it applies (v = ω r: at the equator, on the Earth's orbit, around the Galaxy)<sup class=\"ref\"><a href=\"#s-scale-n5\">[5]</a></sup><sup class=\"ref\"><a href=\"#s-scale-n6\">[6]</a></sup><sup class=\"ref\"><a href=\"#s-scale-n7\">[7]</a></sup>.",
  "head": [
   "Hand",
   "One turn",
   "Angular speed",
   "Speed of travel"
  ]
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "scale-fx-speed",
  "fig": "scaleFxSpeed",
  "lines": [
   {
    "tex": "\\g{v = \\omega\\,r = \\frac{2\\pi r}{T}}",
    "fallback": "v = ω r = 2πr/T"
   },
   {
    "tex": "v_\\text{orbit} = \\frac{2\\pi\\,(1\\ \\text{AU})}{1\\ \\text{year}},\\qquad v_\\odot = 4.74\\,\\mu\\,R_0",
    "fallback": "v_orbit = 2π (1 AU)/(1 year), v☉ = 4.74 μ R₀"
   }
  ],
  "gloss": "r is the radius of the circle: the Earth's equatorial radius, the astronomical unit, or the Sun's distance from the Galactic centre R₀ = 8.275 kpc<sup class=\"ref\"><a href=\"#s-scale-n7\">[7]</a></sup>. μ is Sgr A*'s apparent motion in milliarcseconds per year and 4.74 converts mas/yr × kpc into km/s. You are moving at <span class=\"cv\" data-v=\"vSpin\">…</span> km/s around the axis (at the equator), <span class=\"cv\" data-v=\"vOrbit\">…</span> km/s around the Sun and about <span class=\"cv\" data-v=\"vGal\">…</span> km/s around the Galaxy."
 },
 {
  "t": "notes",
  "k": "scale-clock2",
  "html": "<b>In one minute</b> you are carried <span class=\"cv\" data-v=\"dOrbit\">…</span> km around the Sun and about <span class=\"cv\" data-v=\"dGal\">…</span> km around the Galaxy. None of it is felt, because the motions are almost perfectly smooth: what the body feels is acceleration, and the largest here, toward the Earth's axis at the equator, is 0.034 m/s², a third of a percent of gravity."
 },
 {
  "t": "callout",
  "flat": true,
  "k": "scale-clock3",
  "html": "<b>On a flat model,</b> the first hand belongs to the sky, which turns over a ground at rest, and the other four have no counterpart: the Sun circles above the disc every day, and nothing goes round anything over a year. The ring lasers of the Rotation tab, which feel a rotation without looking at the sky, and the satellites, which see the receivers turn under their orbits, are where the two pictures part."
 },
 {
  "t": "h2",
  "k": "scale-h2dist",
  "html": "The distance scale"
 },
 {
  "t": "notes",
  "k": "scale-dist1",
  "html": "<b>Each step is measured with the one before it.</b> The Earth's radius comes from angles and lengths on the ground (Results tab). The Moon's distance follows from its parallax seen from opposite sides of the Earth, and now from laser echoes timed to a fraction of a nanosecond (Moon tab). The Sun's distance, the astronomical unit, comes from light time, aberration and Doppler shifts (Orbit tab), and radar echoes from the planets<sup class=\"ref\"><a href=\"#s-scale-n6\">[6]</a></sup>. With the Earth's orbit as a baseline, the nearest stars shift back and forth each year: their parallax gives their distance, Proxima Centauri's 0.768″ puts it at <span class=\"cv\" data-v=\"dProx\">…</span><sup class=\"ref\"><a href=\"#s-scale-n9\">[9]</a></sup>. The orbits of the stars around the Galactic centre, followed in position and in Doppler velocity, give its distance<sup class=\"ref\"><a href=\"#s-scale-n7\">[7]</a></sup>; and stars whose brightness is known from their pulsation period, calibrated on parallaxes, give the distance of the next galaxy<sup class=\"ref\"><a href=\"#s-scale-n10\">[10]</a></sup>."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "k": "x:scale-ladder-fig",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"scaleFigLadder\"></div> <div class=\"fcap\">The distance scale on a logarithmic axis, each tick ten times the one before. Blue: the distances measured, each from the step before it. Orange: where the flat models put the Sun, a few thousand kilometres up (the best flat lamp of the Orbit tab, fitted to the Sun's Doppler shift); the measured Sun is fifteen thousand times farther.</div> </div>"
 },
 {
  "t": "table",
  "id": "scale-tabRungs",
  "tbody": "scale-tbRungs",
  "k": "x:scale-cap-rungs",
  "caption": "The steps of the scale, the time light takes to cross them, and how they are measured<sup class=\"ref\"><a href=\"#s-scale-n6\">[6]</a></sup><sup class=\"ref\"><a href=\"#s-scale-n7\">[7]</a></sup><sup class=\"ref\"><a href=\"#s-scale-n8\">[8]</a></sup><sup class=\"ref\"><a href=\"#s-scale-n9\">[9]</a></sup><sup class=\"ref\"><a href=\"#s-scale-n10\">[10]</a></sup>.",
  "head": [
   "Object",
   "Distance",
   "Light time",
   "Measured by",
   "Tab"
  ]
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"scaleAnimZoom\" style=\"height:clamp(400px,calc(700px - 32vw),620px)\"></canvas></div>"
 },
 {
  "t": "fcap",
  "k": "scaleAnimZoom-cap",
  "html": "<b>Powers of ten, from the Earth to Andromeda.</b> The Earth stays at the centre; the field of view widens tenfold about every second and a half, from 20,000 km to four million light-years. Each object sits at its true distance from us, in its own direction, with its distance circle drawn once it can be seen; every frame has its scale bar, and the bottom of the frame names the last object passed and the next one: the empty frames are empty because space is. Objects too small to see at the scale of the frame are drawn as dots. Click to pause."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "scale-fx-par",
  "fig": "scaleFxPar",
  "lines": [
   {
    "tex": "\\g{d = \\frac{1\\ \\text{AU}}{\\tan p}},\\qquad 1\\ \\text{pc} = \\frac{1\\ \\text{AU}}{\\tan 1\\text{″}} = 206\\,265\\ \\text{AU}",
    "fallback": "d = 1 AU / tan p, 1 pc = 1 AU / tan 1″ = 206,265 AU"
   }
  ],
  "gloss": "p is the star's parallax, half its yearly back-and-forth shift against more distant stars, and the parsec the distance at which p = 1″. Proxima Centauri: p = 0.768″, d = 1.302 pc = <span class=\"cv\" data-v=\"dProx\">…</span>."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "scale-fx-lt",
  "fig": "scaleFxLt",
  "lines": [
   {
    "tex": "\\g{d = c\\,t},\\qquad c = 299\\,792.458\\ \\text{km/s}",
    "fallback": "d = c t, c = 299,792.458 km/s"
   }
  ],
  "gloss": "t is the one-way light time: the laser echo from the Moon comes back after <span class=\"cv\" data-v=\"ltMoon2\">…</span> s, the Sun's light is <span class=\"cv\" data-v=\"ltSun\">…</span> old when it arrives, Proxima's <span class=\"cv\" data-v=\"ltProx\">…</span>, Andromeda's <span class=\"cv\" data-v=\"ltM31\">…</span>."
 },
 {
  "t": "callout",
  "flat": true,
  "k": "scale-dist2",
  "html": "<b>The flat models' distances.</b> On a plane, two observers far apart see the Sun at different heights only if it is close: triangulated from a plane, the Sun comes out a few thousand kilometres up, and so does the Moon. Those distances are not measured from the Sun or the Moon themselves: the Sun's Doppler shift, its unchanging size through the day and the Moon's laser echoes all give the large ones. <b>What would vindicate the flat model here:</b> a laser echo from the Moon after a few hundredths of a second instead of 2.56 s, or a Sun whose apparent size grows by a large factor between sunset and noon."
 },
 {
  "t": "xrefs",
  "keys": [
   "rot",
   "orb",
   "sat",
   "moon",
   "results"
  ],
  "wide": false
 },
 {
  "t": "sources"
 }
];
