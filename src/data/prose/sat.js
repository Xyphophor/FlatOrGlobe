// Prose de l'onglet sat (epic27, 2026-10-16), en anglais (source). Valeurs : span.cv[data-v] remplis par index.js.
export const PROSE = [
 {
  "t": "eyebrow",
  "k": "sat-eyebrow",
  "html": "Satellites · one day of Doppler from 80 receivers"
 },
 {
  "t": "h1",
  "k": "sat-h1",
  "html": "Satellites in the Doppler: their orbits, the Earth's mass and the shape of the ground"
 },
 {
  "t": "lead",
  "opener": true,
  "k": "sat-lead",
  "html": "A navigation receiver counts the carrier cycles of every satellite it hears; the rate of the count is the Doppler shift, the speed at which the satellite comes closer or moves away. On 10 April 2025, <span class=\"cv\" data-v=\"nSta\">…</span> receivers of the International GNSS Service, on every continent, recorded it for <span class=\"cv\" data-v=\"nSat\">…</span> GPS, Galileo and GLONASS satellites<sup class=\"ref\"><a href=\"#s-sat-n1\">[1]</a></sup>. This tab fits the orbits, the receivers' positions, the Earth's GM and its rotation to those speeds and to nothing else, starting with the receivers laid out on a flat map."
 },
 {
  "t": "h2",
  "k": "sat-h2res",
  "html": "What one day of satellite Doppler gives"
 },
 {
  "t": "table",
  "id": "sat-tabRes",
  "tbody": "sat-tbRes",
  "k": "x:sat-cap-res",
  "caption": "Every number in the second column comes from the measured speeds, clocks and carrier frequencies alone, with the receivers started on a flat map. The third column is for comparison only and was never used<sup class=\"ref\"><a href=\"#s-sat-n8\">[8]</a></sup><sup class=\"ref\"><a href=\"#s-sat-n9\">[9]</a></sup>. How each is obtained is explained in the next sections.",
  "head": [
   "Quantity",
   "From the Doppler alone",
   "Accepted value",
   "Difference"
  ]
 },
 {
  "t": "notes",
  "k": "sat-res1",
  "html": "<b>How to read it.</b> GM is the Earth's mass times the constant of gravitation: what sets the satellites' periods. Ω is how fast the ground turns with respect to the orbits; one turn is the sidereal day. The radius and the flattening describe the surface on which the receivers end up; the flattening is found twice, from where the receivers sit and from how the satellites move. The last row is the test: the receivers left free explain the speeds to millimetres per second, held on a plane they miss by more than a hundred metres per second."
 },
 {
  "t": "h2",
  "k": "sat-h2dop",
  "html": "The Doppler shift of a passing satellite"
 },
 {
  "t": "notes",
  "k": "sat-dop1",
  "html": "<b>A GPS satellite broadcasts on 1575.42 MHz, a wavelength of 19.03 cm.</b> Coming closer at 800 m/s it is heard 4.2 kHz higher; moving away, 4.2 kHz lower<sup class=\"ref\"><a href=\"#s-sat-n3\">[3]</a></sup>. The receiver does not only measure the shift: it counts the cycles of the carrier, and the count changes by one each time the satellite's distance changes by one wavelength<sup class=\"ref\"><a href=\"#s-sat-n2\">[2]</a></sup>. Here the count is read every 5 minutes over one minute, on two carrier frequencies so that the ionosphere, which slows the two differently, drops out<sup class=\"ref\"><a href=\"#s-sat-n3\">[3]</a></sup><sup class=\"ref\"><a href=\"#s-sat-n4\">[4]</a></sup><sup class=\"ref\"><a href=\"#s-sat-n5\">[5]</a></sup>. At Wettzell, in Bavaria, the satellites approach and recede at up to <span class=\"cv\" data-v=\"maxRate\">…</span> m/s: each rises closing in, passes its nearest point, and sets moving away."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"satAnimPass\" style=\"height:clamp(360px,calc(660px - 32vw),600px)\"></canvas></div>"
 },
 {
  "t": "fcap",
  "k": "satAnimPass-cap",
  "html": "<b>A satellite's Doppler shift records its motion.</b> Left: a GPS satellite on its orbit passing over a receiver, the line of sight and the satellite's velocity, with its part along the line of sight (thick arrow): toward the receiver while it rises, away while it sets. The Earth and the orbit are to scale with each other; the receiver is carried round by the rotation. Right: one day of measurements at Wettzell for the six satellites tracked longest, each point the speed over one minute every five minutes, and the curve of the fitted solution. Click to pause."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "sat-fx-dop",
  "fig": "satFxDop",
  "lines": [
   {
    "tex": "\\dot\\rho = -\\lambda\\,D = \\lambda\\,\\frac{L(t+30\\,\\text{s}) - L(t-30\\,\\text{s})}{60\\,\\text{s}}",
    "fallback": "ρ̇ = −λD = λ (L(t+30 s) − L(t−30 s)) / 60 s"
   },
   {
    "tex": "\\g{\\dot\\rho_{\\text{IF}} = \\frac{f_1^2\\,\\dot\\rho_1 - f_2^2\\,\\dot\\rho_2}{f_1^2 - f_2^2}}",
    "fallback": "ρ̇_IF = (f₁² ρ̇₁ − f₂² ρ̇₂) / (f₁² − f₂²)"
   }
  ],
  "gloss": "ρ̇ is the range rate (how fast the distance to the satellite changes), λ = c/f the carrier's wavelength, D the Doppler shift and L the count of carrier cycles. The ionosphere delays a carrier by an amount proportional to 1/f², so the combination of two frequencies f₁ and f₂ in the second line cancels it. Nothing in this uses a position or a distance on the ground."
 },
 {
  "t": "notes",
  "k": "sat-dop2",
  "html": "<b>This is how satellite navigation began.</b> In October 1957 William Guier and George Weiffenbach, at the Applied Physics Laboratory of Johns Hopkins, recorded the Doppler shift of Sputnik's 20 MHz beacon and found that one pass, from one station, was enough to work out its orbit. Their colleague Frank McClure turned the problem round: if the orbit is known, the Doppler gives the station's position. That became Transit, the US Navy's satellite navigation system from 1964<sup class=\"ref\"><a href=\"#s-sat-n7\">[7]</a></sup>. This tab does both at once, with no orbit and no station known in advance."
 },
 {
  "t": "h2",
  "k": "sat-h2how",
  "html": "How speeds give the Earth's mass and its rotation"
 },
 {
  "t": "notes",
  "k": "sat-how1",
  "html": "<b>Step 1: one satellite gives GM from its speed and its period.</b> The Doppler gives speeds, in metres per second, and the clocks give times. Watched through the day, a GPS satellite goes round in <span class=\"cv\" data-v=\"TG\">…</span>: its angular rate is n = 2π/T = <span class=\"cv\" data-v=\"nG\">…</span> × 10⁻⁴ rad/s. Its speed along the orbit is v = <span class=\"cv\" data-v=\"vG\">…</span> km/s. A body going round at speed v with angular rate n is on a circle of radius a = v/n = <span class=\"cv\" data-v=\"aGm\">…</span> km: the size of the orbit, in kilometres, without any ruler. Newton's law for a circular orbit, v²/a = GM/a², then gives GM = v²a = v³/n = <span class=\"cv\" data-v=\"gmBack\">…</span> × 10¹⁴ m³/s². That is all GM is here: how fast a satellite must go to keep falling around at the distance its period implies (Orbit tab)."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "sat-fx-gm",
  "fig": "satFxGM",
  "lines": [
   {
    "tex": "a = \\frac{v}{n},\\qquad \\frac{v^2}{a} = \\frac{GM}{a^2}",
    "fallback": "a = v/n, v²/a = GM/a²"
   },
   {
    "tex": "\\g{GM = v^2 a = \\frac{v^3}{n}}",
    "fallback": "GM = v² a = v³/n"
   }
  ],
  "gloss": "v is the satellite's speed, n = 2π/T its angular rate and T its period, a the radius of its orbit. For GPS: v = <span class=\"cv\" data-v=\"vG\">…</span> km/s and T = <span class=\"cv\" data-v=\"TG\">…</span> give a = <span class=\"cv\" data-v=\"aGm\">…</span> km and GM = <span class=\"cv\" data-v=\"gmBack\">…</span> × 10¹⁴ m³/s². The real orbits are slightly elliptical and pulled by the Earth's bulge, the Sun and the Moon; the fit uses the full motion, but the idea is this one."
 },
 {
  "t": "notes",
  "k": "sat-how2",
  "html": "<b>Step 2: many receivers give each satellite's whole velocity.</b> A receiver measures only the part of the satellite's velocity along its line of sight, like a radar. Three receivers looking from different directions at the same moment measure three different parts, and together they fix the velocity in space; with dozens of receivers through the day, each satellite's whole orbit is pinned down, and each receiver's position with it, since a line of sight starts at the receiver. Each receiver's clock adds the same small error to every satellite it hears at that moment; comparing the satellites it hears removes it."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "sat-fx-los",
  "fig": "satFxLos",
  "lines": [
   {
    "tex": "\\dot\\rho_k = \\mathbf{u}_k\\cdot\\mathbf{v}_s - \\mathbf{u}_k\\cdot\\mathbf{v}_k + \\delta\\dot t_k,\\qquad k = 1, 2, 3, \\ldots",
    "fallback": "ρ̇_k = u_k·v_s − u_k·v_k + δṫ_k, k = 1, 2, 3, …"
   },
   {
    "tex": "\\g{\\text{three directions } \\mathbf{u}_k \\Rightarrow \\mathbf{v}_s}",
    "fallback": "three directions u_k ⇒ v_s"
   }
  ],
  "gloss": "ρ̇_k is the speed measured by receiver k, u_k the direction from it to the satellite, v_s the satellite's velocity, v_k the receiver's own velocity and δṫ_k its clock error, the same for every satellite it hears at that moment. One equation per receiver and satellite every five minutes: <span class=\"cv\" data-v=\"n\">…</span> of them for a few hundred unknowns."
 },
 {
  "t": "notes",
  "k": "sat-how3",
  "html": "<b>Step 3: the rotation shows in the receivers' own speed.</b> Every receiver is carried around the axis: at the equator at <span class=\"cv\" data-v=\"vEq\">…</span> m/s, at Wettzell (<span class=\"cv\" data-v=\"latW\">…</span>° N) at <span class=\"cv\" data-v=\"vW\">…</span> m/s. That velocity enters every speed the receiver measures, and its direction turns through the day, coming back after one turn. The satellites, meanwhile, follow Newton's laws in a frame that does not turn. The fit therefore needs one axis and one rate Ω that turn every receiver's position consistently against the orbits; it finds Ω = <span class=\"cv\" data-v=\"om\">…</span> × 10⁻⁵ rad/s, one turn in <span class=\"cv\" data-v=\"day\">…</span>, the sidereal day a clock and a star give (Rotation tab). A ground at rest would be Ω = 0; free to take any value, the fit settles on this one."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "sat-fx-om",
  "fig": "satFxOm",
  "lines": [
   {
    "tex": "\\mathbf{v}_k = \\Omega\\,\\hat{\\mathbf{z}}\\times\\mathbf{p}_k,\\qquad |\\mathbf{v}_k| = \\Omega\\,r_k\\cos\\varphi_k",
    "fallback": "v_k = Ω ẑ × p_k, |v_k| = Ω r_k cos φ_k"
   },
   {
    "tex": "\\g{T_\\text{turn} = \\frac{2\\pi}{\\Omega}}",
    "fallback": "T_turn = 2π/Ω"
   }
  ],
  "gloss": "p_k is receiver k's position from the centre, r_k its distance and φ_k its latitude, ẑ the axis. The receiver's speed is Ω times its distance from the axis, r cos φ. With Ω = <span class=\"cv\" data-v=\"om\">…</span> × 10⁻⁵ rad/s, T_turn = <span class=\"cv\" data-v=\"day\">…</span>."
 },
 {
  "t": "notes",
  "k": "sat-how4",
  "html": "<b>Step 4: everything at once.</b> The steps above are how the numbers can be read; the fit does them all together, because each unknown leans on the others: the orbits need the receivers' positions, the positions need the orbits, and both need GM and Ω. Least squares adjusts the few hundred unknowns until the <span class=\"cv\" data-v=\"n\">…</span> predicted speeds match the measured ones; the next section gives the full model and how it starts."
 },
 {
  "t": "h2",
  "k": "sat-h2fit",
  "html": "Orbits, the Earth's mass and its rotation from the Doppler alone"
 },
 {
  "t": "notes",
  "k": "sat-fit1",
  "html": "<b>Everything is unknown at the start except the clocks and the carrier frequencies.</b> Each satellite gets a position and a velocity at noon, moved by Newton's gravity: a point mass GM, a term for a flattened body, and the pull of the Sun and the Moon, which enters through their periods and a mass ratio, not their distances in kilometres<sup class=\"ref\"><a href=\"#s-sat-n6\">[6]</a></sup>. Each receiver gets a position fixed on a body turning at a rate Ω about an axis. GM, Ω, the flattening term, <span class=\"cv\" data-v=\"nPar\">…</span> unknowns in all, are adjusted until the predicted speeds match the <span class=\"cv\" data-v=\"n\">…</span> measured ones. Each receiver's own clock rate is a free unknown at every epoch. <b>The receivers start on a flat map</b>, an azimuthal projection through the North Pole with GM 25 % too small; each receiver is placed on that map by its latitude and longitude, taken as angles from its file; the satellites start from the orbits they broadcast, the one input a globe model made. The restarts in the table below show what the start decides and what it does not."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"satAnimBall\" style=\"height:clamp(380px,calc(700px - 30vw),620px)\"></canvas></div>"
 },
 {
  "t": "fcap",
  "k": "satAnimBall-cap",
  "html": "<b>From a flat map to a ball, by the Doppler alone.</b> Left: the <span class=\"cv\" data-v=\"nStaAll\">…</span> receivers, iteration by iteration of the fit, in a tilted view that turns about the rotation axis (dashed), with the centre the orbits go round (cross). They start on a flat azimuthal map 6,371 km above the centre (orange disc); each iteration moves them to where the measured speeds put them, and they end on a ball. The wire sphere is drawn at 6,371 km for reference, not fitted; the view zooms as the network shrinks (scale bar). Right: each receiver's distance from the centre against its latitude: spread over thousands of kilometres at the start, all in the band 6,357–6,381 km at the end. Blue north, orange south. Click to pause."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "sat-fx-model",
  "fig": "satFxModel",
  "lines": [
   {
    "tex": "\\ddot{\\mathbf{r}} = -\\frac{GM}{r^3}\\,\\mathbf{r} + \\mathbf{a}_{J_2} + \\mathbf{a}_\\odot + \\mathbf{a}_{\\text{Moon}},\\qquad \\mathbf{p}(t) = R_z(\\Omega t)\\,\\mathbf{p}_0",
    "fallback": "r̈ = −GM r/r³ + a_J₂ + a☉ + a_Moon, p(t) = R_z(Ωt) p₀"
   },
   {
    "tex": "\\g{\\dot\\rho\\,\\left(1 + \\frac{\\mathbf{u}\\cdot\\mathbf{v}_s}{c}\\right) = \\mathbf{u}\\cdot(\\mathbf{v}_s - \\mathbf{v}_p)} + \\delta\\dot t_k",
    "fallback": "ρ̇ (1 + u·v_s/c) = u·(v_s − v_p) + δṫ_k"
   }
  ],
  "gloss": "r is a satellite's position from the centre of attraction, p a receiver's, turned by the rotation R_z(Ωt) about the axis; u is the unit vector from receiver to satellite along the line of sight, v_s and v_p their velocities, the satellite's taken one light time earlier; δṫ_k is receiver k's clock rate at that epoch. The fit also carries the slant air delay's rate (one zenith delay per receiver, a flat layer), each satellite clock's offset and its relativistic drift −2 r·v/c²."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "k": "x:sat-conv-fig",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"satFigConv\"></div> <div class=\"fcap\">The fit from its flat start: the speeds left unexplained (logarithmic, m/s) and the spread of the receivers' distances from the centre of the orbits, at each accepted iteration, before any point is rejected.</div> </div>"
 },
 {
  "t": "table",
  "id": "sat-tabRestart",
  "tbody": "sat-tbRestart",
  "k": "x:sat-cap-restart",
  "caption": "The same points fitted from other starts. Δ is the difference with the main solution: GM and Ω in parts per billion, the largest displacement of any receiver in metres.",
  "head": [
   "Start",
   "rms (mm/s)",
   "ΔGM (ppb)",
   "ΔΩ (ppb)",
   "Largest receiver shift"
  ]
 },
 {
  "t": "raw",
  "tag": "p",
  "class": "reads",
  "id": "sat-readFit",
  "html": "<p class=\"reads\" id=\"sat-readFit\"></p>"
 },
 {
  "t": "notes",
  "k": "sat-fit2",
  "html": "<b>The result.</b> The speeds are reproduced to <span class=\"cv\" data-v=\"rms\">…</span> mm/s rms over <span class=\"cv\" data-v=\"n\">…</span> points, out of a signal of hundreds of m/s. The Earth's GM comes out at <span class=\"cv\" data-v=\"gm\">…</span> × 10¹⁴ m³/s², <span class=\"cv\" data-v=\"dGM\">…</span> from the value adopted by the IERS, 3.986004418 × 10¹⁴<sup class=\"ref\"><a href=\"#s-sat-n8\">[8]</a></sup>; the rotation at Ω = <span class=\"cv\" data-v=\"om\">…</span> × 10⁻⁵ rad/s, one turn in <span class=\"cv\" data-v=\"day\">…</span>, <span class=\"cv\" data-v=\"dOm\">…</span> from the IERS value 7.292115 × 10⁻⁵<sup class=\"ref\"><a href=\"#s-sat-n8\">[8]</a></sup>. The formal uncertainties are ±<span class=\"cv\" data-v=\"sgmPpb\">…</span> parts per billion on GM and ±<span class=\"cv\" data-v=\"somPpb\">…</span> on Ω; they assume independent errors. GM departs from the adopted value by <span class=\"cv\" data-v=\"gmSig\">…</span> of them and Ω by <span class=\"cv\" data-v=\"omSig\">…</span>: more than the formal uncertainties allow, a measure of what one day and the truncated forces leave out (see Limits). The receivers end <span class=\"cv\" data-v=\"dcat\">…</span> m from the positions in their files (median), positions this fit never read."
 },
 {
  "t": "h2",
  "k": "sat-h2ball",
  "html": "The receivers sit on a ball, flattened at the poles"
 },
 {
  "t": "notes",
  "k": "sat-ball1",
  "html": "<b>Every receiver ends between <span class=\"cv\" data-v=\"rMin\">…</span> and <span class=\"cv\" data-v=\"rMax\">…</span> km from the point the satellites orbit.</b> The nearest are in Antarctica and the Arctic, the farthest near the equator and on the high plateaus of the Andes and of Ethiopia. Laid on an ellipse, the distances give an equatorial radius of <span class=\"cv\" data-v=\"ellA\">…</span> km and a flattening of 1/<span class=\"cv\" data-v=\"ellInvF\">…</span><sup class=\"ref\"><a href=\"#s-sat-n9\">[9]</a></sup>; what is left, <span class=\"cv\" data-v=\"ellRms\">…</span> km rms, is mostly the receivers' heights above sea level. The best plane through the same receivers misses them by <span class=\"cv\" data-v=\"planeRms\">…</span> km rms."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "sat-fx-ell",
  "fig": "satFxEll",
  "lines": [
   {
    "tex": "\\g{r(\\varphi) \\approx a\\,(1 - f\\,\\sin^2\\varphi)},\\qquad f = \\frac{a-b}{a}",
    "fallback": "r(φ) ≈ a (1 − f sin²φ), f = (a − b)/a"
   }
  ],
  "gloss": "r is a receiver's distance from the centre, φ its geocentric latitude (the angle at the centre, from the fitted position), a and b the equatorial and polar radii. Fitted on the <span class=\"cv\" data-v=\"nStaKept\">…</span> receivers: a = <span class=\"cv\" data-v=\"ellA\">…</span> km, 1/f = <span class=\"cv\" data-v=\"ellInvF\">…</span>."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "k": "x:sat-ball-fig",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"satFigBall\"></div> <div class=\"fcap\">Each receiver's distance from the centre of the orbits against its latitude (dots), and the fitted ellipse (line). Excluded receivers in grey. The vertical axis starts at 6,350 km; the best plane through the receivers would put them thousands of kilometres off this axis.</div> </div>"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "sat-fx-j2",
  "fig": "satFxJ2",
  "lines": [
   {
    "tex": "J_2 = \\frac{\\mu_J}{GM\\,a^2},\\qquad q = \\frac{\\Omega^2 a^3}{GM}",
    "fallback": "J₂ = μ_J/(GM a²), q = Ω² a³/GM"
   },
   {
    "tex": "\\g{f \\approx \\tfrac32 J_2 + \\tfrac12 q}",
    "fallback": "f ≈ (3/2) J₂ + q/2"
   }
  ],
  "gloss": "μ_J is the oblateness term of the satellites' force, fitted with the rest (<span class=\"cv\" data-v=\"muj\">…</span> × 10²⁵ m⁵/s²); J₂ = <span class=\"cv\" data-v=\"j2\">…</span> × 10⁻³ and q = <span class=\"cv\" data-v=\"q\">…</span> × 10⁻³, the ratio of the spin's push to gravity at the equator. Clairaut's relation for a fluid body in equilibrium<sup class=\"ref\"><a href=\"#s-sat-n10\">[10]</a></sup> turns them into a flattening of 1/<span class=\"cv\" data-v=\"fInv\">…</span>: the same flattening seen a second way, in the satellites' motion rather than in the receivers' positions."
 },
 {
  "t": "h2",
  "k": "sat-h2kep",
  "html": "Kepler's third law at three heights"
 },
 {
  "t": "notes",
  "k": "sat-kep1",
  "html": "<b>Above, one GM was shared by every satellite: Kepler's third law was assumed.</b> Given its own GM, each satellite tests it: from its period and the size of its orbit, n²a³. GLONASS orbits at <span class=\"cv\" data-v=\"aR\">…</span> km, GPS at <span class=\"cv\" data-v=\"aG\">…</span> km, Galileo at <span class=\"cv\" data-v=\"aE\">…</span> km, with periods from 11 h 16 min to 14 h 05 min. The <span class=\"cv\" data-v=\"nKep\">…</span> satellites give the same GM to <span class=\"cv\" data-v=\"kepSpread\">…</span> parts per million (standard deviation), and the three constellations' medians agree to <span class=\"cv\" data-v=\"kepSys\">…</span> ppm. The Moon, 15 times farther out (Orbit tab), gives the same law."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"satAnimKep\" style=\"height:clamp(420px,calc(700px - 30vw),560px)\"></canvas></div>"
 },
 {
  "t": "fcap",
  "k": "satAnimKep-cap",
  "html": "<b>Three orbits, one GM, and how an orbit is checked.</b> Left, to scale: the Earth and the median orbits of GLONASS, GPS and Galileo found by the fit. Each satellite turns at the period its own constellation's GM gives, T = 2π√(a³/GM): the higher orbit is the slower, and n²a³ comes out the same for the three. Right, validating an orbit: from the fitted orbit of GPS satellite G32 and the receiver's place, the speed of the satellite toward Wettzell is computed for every five minutes of the day (blue line, drawn in advance); the measured speeds arrive as the day goes by (dots). Below, their difference in millimetres per second, against speeds of several hundred metres per second: an orbit is accepted when it predicts the next measurements this closely, at every receiver that sees the satellite. One day is played in 24 seconds. Click to pause."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "sat-fx-kep",
  "fig": "satFxKep",
  "lines": [
   {
    "tex": "\\g{GM_j = n_j^2\\,a_j^3},\\qquad n_j = \\frac{2\\pi}{T_j}",
    "fallback": "GM_j = n_j² a_j³, n_j = 2π/T_j"
   }
  ],
  "gloss": "n_j is satellite j's mean motion, T_j its period and a_j its semi-major axis, all fitted to its own Doppler; the J₂ and Sun–Moon terms are kept in the motion, so GM<sub>j</sub> is the point mass that each orbit needs."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "k": "x:sat-kep-fig",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"satFigKep\"></div> <div class=\"fcap\">GM from each satellite's own orbit, against its semi-major axis: GLONASS, GPS and Galileo. The vertical axis is in parts per million around the shared solution. A failure of the third law would tilt the three groups or separate them.</div> </div>"
 },
 {
  "t": "h2",
  "k": "sat-h2flat",
  "html": "The flat model, steel-manned"
 },
 {
  "t": "notes",
  "k": "sat-flat1",
  "html": "<b>The same points, the same satellites, the same freedoms, and one constraint: every receiver on one plane.</b> The plane's tilt and height and each receiver's position on it are free; the satellites keep Newtonian orbits around a centre that the fit may put anywhere above or below the plane; GM, Ω, the clocks and the air are as free as on the globe. It is generous: a flat model has no orbits to offer, and is given these. The fit is started twice, from the plane that best fits the globe's receivers and from the classic disc, the receivers on an azimuthal map perpendicular to the axis, and the better result is kept."
 },
 {
  "t": "callout",
  "flat": true,
  "k": "sat-flat2",
  "html": "<b>The best plane leaves <span class=\"cv\" data-v=\"flatRms\">…</span> m/s unexplained</b>, against <span class=\"cv\" data-v=\"rms\">…</span> mm/s for the receivers left free: <span class=\"cv\" data-v=\"flatRatio\">…</span> times more. Half of its residuals exceed <span class=\"cv\" data-v=\"flatQ50\">…</span> m/s and one in a hundred <span class=\"cv\" data-v=\"flatQ99\">…</span> m/s; the plane it settles on is tilted <span class=\"cv\" data-v=\"flatTilt\">…</span>° from the rotation axis. <b>What would vindicate the flat model:</b> receivers held on a plane fitting the Doppler as well as free ones, to a few millimetres per second; or satellites needing different GM for their periods."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "k": "x:sat-flat-fig",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"satFigFlat\"></div> <div class=\"fcap\">One satellite over Wettzell through the day: the measured speeds (dots), the globe solution (blue) and the best flat solution (orange). The receiver's clock rate is taken out of the points as each model estimates it.</div> </div>"
 },
 {
  "t": "h2",
  "k": "sat-h2lim",
  "html": "Limits"
 },
 {
  "t": "notes",
  "k": "sat-lim1",
  "html": "<b>One day, <span class=\"cv\" data-v=\"nStaAll\">…</span> receivers, every five minutes.</b> <span class=\"cv\" data-v=\"dropStaTxt\">…</span> (<span class=\"cv\" data-v=\"dropSta\">…</span>) and <span class=\"cv\" data-v=\"dropSatTxt\">…</span> (<span class=\"cv\" data-v=\"dropSat\">…</span>) are left out because their residuals lie more than 3 standard deviations from the others', and <span class=\"cv\" data-v=\"rejected\">…</span> single points (<span class=\"cv\" data-v=\"rejPct\">…</span> %) for the same reason, the rule of this site. The forces are truncated: no higher terms of the Earth's field and no pressure of sunlight, which is why <span class=\"cv\" data-v=\"rms\">…</span> mm/s remains instead of a millimetre. The Doppler cannot tell north from south, since the mirror image of the whole solution fits as well; the first receiver's longitude, an angle, only turns the drawing. The satellites' first guess is the broadcast orbit, made with a globe model; the restarts show it does not decide the answer: every satellite started 5 % too high still lands on the same solution when the receivers start from their catalogue positions, but not when they also start on the flat map, where the fit ends in another minimum, at 49 m/s. With every receiver dropped at a random place on the flat map, it also ends in another minimum, at 117 m/s: the fit needs the receivers' rough directions to find its way, and the solution it then finds is the one with by far the smallest residual. Changing the Moon's distance in kilometres by 10 %, with GM/d³ kept as its period gives it, moves GM by 0.8 ppm and the receivers by 3.5 m."
 },
 {
  "t": "xrefs",
  "keys": [
   "orb",
   "gps",
   "rot",
   "moon",
   "grav"
  ],
  "wide": false
 },
 {
  "t": "sources"
 }
];
