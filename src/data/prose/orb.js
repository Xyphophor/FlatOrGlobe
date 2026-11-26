// Prose de l'onglet orb (epic19, 2026-10-04), en anglais (source). Valeurs : span.cv[data-v] remplis par index.js.
export const PROSE = [
 {
  "t": "eyebrow",
  "html": "Earth's orbit · light, Doppler and the Sun's size",
  "k": "orb-eyebrow"
 },
 {
  "t": "h1",
  "html": "The year in the light: aberration, light time and Doppler",
  "k": "orb-h1"
 },
 {
  "t": "lead",
  "opener": true,
  "k": "orb-lead",
  "html": "These measurements separate a moving Earth from one at rest more than a globe from a plane, and the page says so where it matters. They give the size of the orbit, the astronomical unit, from angles, clocks and wavelengths. The flat model's Sun, a lamp circling a few thousand kilometres up, is tested against the Doppler data below with its height left free."
 },
 {
  "t": "h2",
  "k": "orb-h2kep",
  "html": "Kepler and Newton: what an orbit is"
 },
 {
  "t": "notes",
  "k": "orb-kep1",
  "html": "<b>Kepler found three rules in Tycho Brahe's observations of the planets; Newton found the single force behind them.</b> The first two laws (1609, from the orbit of Mars): each planet moves on an ellipse with the Sun at one focus, and the line from the Sun to the planet sweeps out equal areas in equal times, so the planet goes fastest at perihelion and slowest at aphelion<sup class=\"ref\"><a href=\"#s-orb-n7\">[7]</a></sup>. The third (1619): the square of the period is proportional to the cube of the orbit's size, with the same constant for every planet<sup class=\"ref\"><a href=\"#s-orb-n8\">[8]</a></sup>. Kepler's sizes were relative ones, in units of the Earth's orbit, obtained from angles alone as Copernicus had done; no distance in kilometres entered."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"orbAnimKep\" style=\"height:clamp(430px,calc(700px - 30vw),610px)\"></canvas></div>"
 },
 {
  "t": "fcap",
  "k": "orbAnimKep-cap",
  "html": "<b>Kepler's laws, moving.</b> Left: a planet on an ellipse, the Sun at one focus, its period cut into twelve equal times; each leaves its sector, and the twelve sectors have the same area, long and thin far from the Sun, short and wide near it, where the planet goes fastest (its speed is printed as a multiple of 2πa/T, the speed on a circle of the same period). Right: two orbits around the same body, one four times wider than the other, drawn to scale between them: the inner one goes round eight times while the outer one goes round once, because T² ∝ a³ and 4³ = 8². The ellipse is far more eccentric than the Earth's (0.6 against 0.017). In the band below, the three laws with the values of the moment shown: ½r²θ̇ stays at 0.400 whether the planet is near or far. Click to pause."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "orb-fx-kep",
  "fig": "orbFxKep",
  "lines": [
   {
    "tex": "r(\\theta) = \\frac{a\\,(1-e^2)}{1+e\\cos\\theta},\\qquad r_{\\min} = a(1-e),\\quad r_{\\max} = a(1+e)",
    "fallback": "r(θ) = a(1 − e²)/(1 + e cos θ), r_min = a(1 − e), r_max = a(1 + e)"
   },
   {
    "tex": "\\g{\\frac{dA}{dt} = \\tfrac12\\,r^2\\,\\dot\\theta = \\frac{\\pi a b}{T}},\\qquad b = a\\sqrt{1-e^2}",
    "fallback": "dA/dt = ½ r² θ̇ = πab/T, b = a√(1 − e²)"
   }
  ],
  "gloss": "r is the distance from the Sun, θ the angle from perihelion, a the semi-major axis, e the eccentricity, b the semi-minor axis, A the area swept and T the period. At both ends of the ellipse the velocity is perpendicular to r, so equal areas give r<sub>min</sub> v<sub>max</sub> = r<sub>max</sub> v<sub>min</sub>: the Earth moves (1 + e)/(1 − e) = <span class=\"cv\" data-v=\"vRatio\">…</span> % faster in early January than in early July, the same ratio as the Sun's width further down."
 },
 {
  "t": "notes",
  "k": "orb-kep2",
  "html": "<b>Newton showed in 1687 that the three laws follow from one attraction</b>, toward the Sun, proportional to the two masses and weakening as the inverse square of the distance<sup class=\"ref\"><a href=\"#s-orb-n9\">[9]</a></sup>. Any force aimed at one centre keeps the swept area constant (the second law: angular momentum is conserved); only the inverse square closes the path into a fixed ellipse (the first); and the third law's constant becomes 4π²/GM, where GM belongs to the attracting body alone. His own picture is a cannonball fired horizontally from a high mountain: the faster it leaves, the farther it lands; fast enough, the ground curves away beneath it as fast as it falls, and it never lands. Near the ground that speed is <span class=\"cv\" data-v=\"v1\">…</span> km/s."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "orb-fx-newt",
  "fig": "orbFxNewt",
  "lines": [
   {
    "tex": "F = \\frac{G\\,M\\,m}{r^2},\\qquad \\frac{v^2}{r} = \\frac{GM}{r^2}\\ \\text{on a circle}",
    "fallback": "F = GMm/r², v²/r = GM/r² on a circle"
   },
   {
    "tex": "\\g{v^2 = GM\\left(\\frac{2}{r} - \\frac{1}{a}\\right)}",
    "fallback": "v² = GM (2/r − 1/a)"
   }
  ],
  "gloss": "G is the constant of gravitation, M and m the two masses, r their distance, v the speed and a the semi-major axis. On a circle the pull per unit mass, GM/r², is exactly the acceleration v²/r that bends the path into the circle; the second line (vis-viva) holds anywhere on an ellipse. With the Earth's GM and r = 6,371 km, v = <span class=\"cv\" data-v=\"v1\">…</span> km/s."
 },
 {
  "t": "notes",
  "k": "orb-kep2b",
  "html": "<b>How falling makes an orbit.</b> Everything near the ground falls 4.9 m in its first second, whatever its sideways speed. A ball thrown sideways at 7.9 km/s has covered 7.9 km in that second, and over 7.9 km the Earth's surface curves down by (7.9 km)²/2R = 4.9 m, the same drop this site uses for hidden heights and horizons. So the ball has fallen 4.9 m and the ground beneath it has fallen away by 4.9 m: it is as high as when it started, and the same is true the next second, and the next. It never stops falling, and it never comes closer to the ground. Slower, it falls faster than the ground curves and lands; faster, it climbs away on an ellipse. Without air, such a ground-skimming orbit takes 2πR/v = <span class=\"cv\" data-v=\"tSkim\">…</span> minutes."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"orbAnimFall\" style=\"height:clamp(450px,calc(740px - 32vw),670px)\"></canvas></div>"
 },
 {
  "t": "fcap",
  "k": "orbAnimFall-cap",
  "html": "<b>Falling without ever landing.</b> Left: Newton's cannon on a mountain far too high to be to scale; four balls fired sideways, faster each time, under the pull GM/r² alone. The slower ones fall back (orange); at the right speed the ball falls all the way round and comes back to the mountain (blue): an orbit. Right, at true scale: the first 200 seconds of an orbit 30 km up. The dashed line is where the ball would go without gravity; the orange line is how far it has fallen below it, ½gt², which is exactly how far the Earth's surface (brown, radius 6,371 km) has curved down below the same line, (vt)²/2R: the ball stays at the same height. In the band below, the equations with the values of the moment shown: v²/r against GM/r² for the shot in flight, ½gt² against (vt)²/2R, and the period. Click to pause."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "orb-fx-fall",
  "fig": "orbFxFall",
  "lines": [
   {
    "tex": "\\tfrac12\\,g\\,t^2 = \\frac{(v\\,t)^2}{2R}\\quad\\Rightarrow\\quad \\g{v = \\sqrt{g\\,R}}",
    "fallback": "½ g t² = (vt)²/2R ⇒ v = √(gR)"
   },
   {
    "tex": "T = \\frac{2\\pi R}{v} = 2\\pi\\sqrt{\\frac{R}{g}}",
    "fallback": "T = 2πR/v = 2π√(R/g)"
   }
  ],
  "gloss": "g = 9.81 m/s² is the fall of any body at the surface, t the time, v the sideways speed and R the Earth's radius. The left side is how far the ball has fallen, the right side how far the ground has curved away below a straight line in the same time; equal, the ball keeps its height. With R = 6,371 km, v = <span class=\"cv\" data-v=\"v1\">…</span> km/s and T = <span class=\"cv\" data-v=\"tSkim\">…</span> min. It is the circle of the vis-viva line above, with g = GM/R²."
 },
 {
  "t": "notes",
  "k": "orb-can1",
  "html": "<b>The same cannon, shot by shot.</b> Put the cannon 400 km up, the height at which the International Space Station flies<sup class=\"ref\"><a href=\"#s-orb-n13\">[13]</a></sup>, and ask each time for a range on the ground: 0 m, 100 m, 100 km, 500 km, 1,000 km, 5,000 km, 15,000 km. Every shot is level; only the speed changes. The camera rides with the ball."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"orbAnimCannon\" style=\"height:clamp(480px,64vw,640px)\"></canvas></div>"
 },
 {
  "t": "fcap",
  "k": "orbAnimCannon-cap",
  "html": "<b>Eight shots from 400 km, each harder than the last.</b> Main view: the camera follows the ball and keeps its vertical upright, so the ball stays in the middle and the ground comes up to meet it; the ground is graduated in distance from the foot of the cannon, the pale band is the first 100 km of air. Yellow: the path flown; dashes: the straight line the ball would follow without gravity; green arrow: its speed; red arrow: the pull, 8.7 m/s² at 400 km against 9.8 on the ground. Small frame: the whole Earth with every shot so far. Both views are at true scale. The path is computed under the pull GM/r² alone: no air (a real ball would be slowed below 100 km and land shorter) and no rotation of the Earth. The eighth shot, at the speed of a circle, falls all the way round without coming any closer. Click to pause."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "orb-fx-can",
  "fig": "orbFxCan",
  "lines": [
   {
    "tex": "p = \\frac{(r_0 v)^2}{GM},\\qquad e = 1 - \\frac{r_0 v^2}{GM}",
    "fallback": "p = (r₀v)²/GM, e = 1 − r₀v²/GM"
   },
   {
    "tex": "\\cos\\theta = \\frac{1 - p/R}{e},\\qquad s = R\\,\\theta",
    "fallback": "cos θ = (1 − p/R)/e, s = Rθ"
   },
   {
    "tex": "\\g{v_c = \\sqrt{GM/r_0}}",
    "fallback": "<b>v_c = √(GM/r₀)</b>"
   }
  ],
  "gloss": "r₀ = 6,771 km is the cannon's distance from the Earth's centre, R = 6,371 km the Earth's radius, v the launch speed and GM = <span class=\"cv\" data-v=\"gmCan\">…</span> m³/s² the pull this page reads from the orbit of the GPS satellites<sup class=\"ref\"><a href=\"#s-orb-n11\">[11]</a></sup>. Fired level and too slowly to stay up, the ball starts from the farthest point of an ellipse (p and e fix its size and shape<sup class=\"ref\"><a href=\"#s-orb-n12\">[12]</a></sup>); it meets the ground at the angle θ from the cannon, seen from the Earth's centre, and s is the range. The range grows with v up to half a turn; past <span class=\"cv\" data-v=\"vMiss\">…</span> m/s the ellipse no longer reaches the ground, and at v_c = <span class=\"cv\" data-v=\"vCan\">…</span> m/s it is a circle."
 },
 {
  "t": "raw",
  "tag": "table",
  "class": "cnav-table",
  "id": "orbTabCannon",
  "html": "<table class=\"cnav-table\" id=\"orbTabCannon\"></table>"
 },
 {
  "t": "fcap",
  "k": "orbTabCannon-cap",
  "html": "The first 100 km of range cost almost nothing: the ball falls for five minutes whatever is done, so 0.34 m/s, a slow walk, is enough for 100 m. The last steps cost almost nothing either: from 15,000 km to never landing there are 137 m/s. Computed for the circle at 400 km: <span class=\"cv\" data-v=\"vCanKmh\">…</span> km/h and <span class=\"cv\" data-v=\"tCan\">…</span> minutes a turn. The space agency gives 92 minutes and a round 28,800 km/h for the station<sup class=\"ref\"><a href=\"#s-orb-n13\">[13]</a></sup>. Last column: over a plane with the same pull everywhere there is no such speed. The ball lands after 4 min 45 s whatever the shot, only farther away; nothing fired level stays up. What would count for the flat model: a satellite whose period does not follow from its height by these formulas."
 },
 {
  "t": "notes",
  "k": "orb-tun1",
  "html": "<b>The same 84 minutes through a tunnel.</b> Drop a ball into a hole bored straight through a uniform Earth, with no air. Inside, only the matter closer to the centre than the ball pulls it, so gravity weakens in a straight line, g r/R, like a spring: the ball swings from one side to the other and back in 2π√(R/g), the period above, and crosses the centre at √(gR), the orbital speed. A second ball in a tunnel at right angles, a quarter of a swing behind, swings the same way. Take the point that follows one ball left–right and the other up–down: it goes round a circle just above the ground, at constant speed, pulled towards the centre by g. That point is a satellite skimming the Earth, and each ball is its shadow on one axis."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"orbReelTunnel\" class=\"orb-reel\"></canvas></div>"
 },
 {
  "t": "fcap",
  "k": "orbReelTunnel-cap",
  "html": "<b>An orbit made of two falls.</b> One ball through a tunnel, its position, speed and pull; a second ball at right angles; both together; the satellite that results; and the two clocks side by side. Schematic, balls enlarged. The two balls can be added because inside a uniform Earth the pull is proportional to the distance from the centre; outside the Earth it falls off as 1/r², and an orbit, still an ellipse, is no longer exactly the sum of two waves. The real Earth, denser at its core, would take about 38 minutes for one crossing instead of 42. Click to pause."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "orb-fx-kep3",
  "fig": "orbFxKep3",
  "lines": [
   {
    "tex": "\\g{T^2 = \\frac{4\\pi^2}{GM}\\,a^3}",
    "fallback": "T² = (4π²/GM) a³"
   },
   {
    "tex": "GM_\\odot = \\frac{4\\pi^2\\,(1\\ \\text{AU})^3}{(1\\ \\text{yr})^2},\\qquad GM_\\oplus = \\frac{4\\pi^2 a_{\\text{Moon}}^3}{T_{\\text{Moon}}^2}\\,\\frac{1}{1+m/M}",
    "fallback": "GM☉ = 4π² (1 AU)³/(1 yr)², GM⊕ = 4π² a_Moon³/T_Moon² × 1/(1 + m/M)"
   }
  ],
  "gloss": "In units of the Earth's orbit and the year, T² = a³ for every planet. In kilometres it needs the astronomical unit, which this tab measures below: with a = 149.6 million km, GM☉ = <span class=\"cv\" data-v=\"gmSun\">…</span> m³/s². Around the Earth the same law holds with a constant <span class=\"cv\" data-v=\"gmRatio\">…</span> times smaller: the Moon (384,400 km, 27.32 days, its own mass m/M = 1/81 removed) gives GM⊕ = <span class=\"cv\" data-v=\"gmMoon\">…</span> m³/s², the GPS satellites (26,560 km, 11 h 58 min) <span class=\"cv\" data-v=\"gmGps\">…</span>."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "k": "x:orb-kep3-fig",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"orbFigKep3\"></div> <div class=\"fcap\">Kepler's third law on logarithmic axes. The eight planets (period against semi-major axis) lie on one line of slope 3/2, T ∝ a<sup>3/2</sup>, Uranus and Neptune included although Kepler never knew them. T²/a³ is the same to 1.2 %; Saturn and Neptune depart most, because the giant planets perturb one another and one set of elements does not give their mean orbit exactly. the Moon and the GPS satellites lie on a parallel line far below, because the Earth's GM is 333,000 times smaller than the Sun's. Planets and Moon from NASA's fact sheets<sup class=\"ref\"><a href=\"#s-orb-n10\">[10]</a></sup>, GPS from ESA<sup class=\"ref\"><a href=\"#s-orb-n11\">[11]</a></sup>.</div> </div>"
 },
 {
  "t": "notes",
  "k": "orb-kep3",
  "html": "<b>What the rest of this tab measures with these laws.</b> The first: the Sun's apparent size through the year gives the eccentricity e of the ellipse. The first two together: the distance to the Sun changes along the ellipse, at a rate that peaks at K = 2πae/(T√(1−e²)), the yearly swing of the Sun's Doppler shift; and the changing speed puts 7.7 minutes into the equation of time (the stick section). The third is not needed by any of them: light time, aberration and Doppler give the astronomical unit with the year alone. What it adds is mass: the size of an orbit and its period give GM of the body it goes around, the Sun's here, the Earth's in the Moon and Satellites tabs."
 },
 {
  "t": "callout",
  "flat": true,
  "k": "orb-kep4",
  "html": "<b>The flat model's Sun.</b> A Sun circling a few thousand kilometres above the disc, its circuit widening from the Tropic of Cancer to the Tropic of Capricorn and back each year, has no force named to hold it on that path, so its speed and its height are whatever the year requires: Kepler's laws are not wrong for it, they are absent from it. Gravitation is tested where it predicts with nothing left to adjust: everything circling the Earth must give one and the same GM, whatever its distance and its period. <b>What would vindicate the flat model here:</b> bodies circling the Earth whose periods do not follow T² ∝ a³ with a single constant."
 },
 {
  "t": "h2",
  "k": "orb-h2ab",
  "html": "Aberration and light time: the orbit from an angle and a clock"
 },
 {
  "t": "notes",
  "k": "orb-ab1",
  "html": "<b>Bradley was looking for parallax and found something else.</b> γ Draconis, observed at the zenith of Kew in 1725–1728, moved through an annual cycle about 40″ wide, a quarter of a year out of step with what parallax would give: the direction of starlight tilts with the observer's velocity, as rain tilts for a runner. The half-width κ is the ratio v/c. From it Bradley gave the light time from the Sun: 8 min 12 s<sup class=\"ref\"><a href=\"#s-orb-n1\">[1]</a></sup>. Delambre reached the same 8 min 12 s in 1809 from the eclipses of Jupiter's moons, which come early when the Earth is on Jupiter's side of its orbit and late when it is on the far side<sup class=\"ref\"><a href=\"#s-orb-n2\">[2]</a></sup>. Rømer's 1676 figure, about 22 minutes across the orbit, was a third too large."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"orbAnimAb\" style=\"height:clamp(560px,calc(880px - 30vw),780px)\"></canvas></div>"
 },
 {
  "t": "fcap",
  "html": "<b>Aberration: the telescope detects the Earth's speed.</b> Top left: the Earth on its orbit through one year, with its velocity v. Top right: the view in the telescope, in the same orientation. The orange cross is where γ Draconis would sit if the Earth were at rest; the blue dot is where it is seen, always displaced toward the direction the Earth is moving, by κ = v/c, so that in a year it traces a near-circle of radius 20.2″. Dotted: its parallax, enlarged five hundred times; it points away from the Sun, a quarter of a year out of step with the aberration, which is how Bradley could tell the two apart. Below: why. Seen from the side, the starlight falls straight down while the telescope moves at v. A tube pointed straight at the star moves under the light, which hits its trailing wall (red dots); a tube tilted forward by κ keeps the light on its axis down to the eyepiece, as an umbrella is tilted forward when running in the rain. So the star is seen tilted toward v. In the tubes v/c is enlarged about three thousand times; offsets in the eyepiece to the 10″ bar; the orbit is not to scale. Click to pause.",
  "k": "orbAnimAb-cap"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "orb-fx-ab",
  "fig": "orbFxAb",
  "lines": [
   {
    "tex": "\\tan\\kappa = \\frac{v}{c},\\qquad a = \\frac{v\\,T}{2\\pi}",
    "fallback": "tan κ = v/c, a = vT/2π"
   },
   {
    "tex": "\\g{a = c\\,t_\\odot},\\qquad t_\\odot = \\frac{\\kappa\\,T}{2\\pi}",
    "fallback": "a = c t☉, t☉ = κT/2π"
   }
  ],
  "gloss": "κ is half the annual swing of a star (radians), v the Earth's orbital speed, T the year, a the radius of the orbit and t☉ the light time from the Sun. Bradley's 8 min 12 s gives κ = <span class=\"cv\" data-v=\"kappa\">…</span>″ and a = <span class=\"cv\" data-v=\"auB\">…</span> million km; the modern value is 149.6. Nothing in this enters a radius of the Earth or a map."
 },
 {
  "t": "callout",
  "flat": true,
  "k": "orb-ab2",
  "html": "<b>What this does and does not separate.</b> A yearly swing common to every star in the same direction is the signature of the observer moving, not of the stars. An Earth at rest under stars that all swing yearly in step reproduces the angles exactly (Tycho's system is kinematically the same); only the dynamics, why the stars would do that, chooses. A flat model with a fixed sky predicts no swing at all. <b>What would vindicate it:</b> a zenith star that stays put through the year to better than a second of arc."
 },
 {
  "t": "h2",
  "k": "orb-h2transit",
  "html": "Transits of Venus, 1761, 1769 and 2012: the Sun's distance from where you stand"
 },
 {
  "t": "notes",
  "k": "orb-tr1",
  "html": "<b>Three times since 1761 Venus has crossed the face of the Sun with observers spread over the Earth to time the moments when its edge touched the Sun's.</b> Halley had shown in 1716 how to use them: two observers far apart see Venus against the Sun along different lines, so the same contact happens for them minutes apart, by an amount set by the size of the Earth against the distance of the Sun<sup class=\"ref\"><a href=\"#s-orb-n23\">[23]</a></sup>. In 1761 and 1769 Cook and Green observed at Tahiti, Hell at Vardø, Chappe in Siberia and then in Baja California, Mason and Dixon at the Cape, and dozens of others; in 1891 Newcomb gathered every one of their timings, <span class=\"cv\" data-v=\"trN61\">…</span> for 1761 and <span class=\"cv\" data-v=\"trN69\">…</span> for 1769, with the positions of their stations<sup class=\"ref\"><a href=\"#s-orb-n22\">[22]</a></sup>. In 2012 amateurs sent their timings to an open project; only the file of the third contact survives, <span class=\"cv\" data-v=\"trN12\">…</span> timings<sup class=\"ref\"><a href=\"#s-orb-n24\">[24]</a></sup>. We transcribed them all and computed each contact again for each station, for a trial distance of the Sun."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"orbAnimTransit\" style=\"height:clamp(560px,calc(840px - 30vw),660px)\"></canvas></div>"
 },
 {
  "t": "fcap",
  "k": "orbAnimTransit-cap",
  "html": "<b>Nine contacts, one after the other: the four of 1761, the four of 1769, the third of 2012.</b> Left: the Earth as the Sun saw it at that moment, and the stations that timed the contact, blue where the Earth's size makes it come earlier, red where later. Right: for every timing, the observed time minus the time it would have had with the Sun infinitely far (vertical), against the shift that the Earth's size gives with the Sun at 149.6 million km (horizontal), the shifts computed from the orbits<sup class=\"ref\"><a href=\"#s-orb-n15\">[15]</a></sup> and the stations' places<sup class=\"ref\"><a href=\"#s-orb-n22\">[22]</a></sup>. The timings follow a line of slope close to 1; the dashed line is what a Sun 5,000 km away would demand. Click to pause."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "orb-fx-tr",
  "fig": "orbFxTransit",
  "lines": [
   {
    "tex": "t_{\\text{obs}} = t_\\infty + P\\,\\frac{A_{\\text{DE}}}{A} + \\delta_k",
    "fallback": "t_obs = t∞ + P·A_DE/A + δ_k"
   },
   {
    "tex": "\\g{\\pi_\\odot = \\frac{a_\\oplus}{A}}",
    "fallback": "π☉ = a⊕ / A"
   }
  ],
  "gloss": "t∞ is the instant of the contact for an observer at the Earth's centre, P the shift the station's place on the Earth gives it when the Sun is at A_DE = 149.6 million km (proportional to the Earth's radius over the Sun's distance), A the distance sought and δ_k one offset per contact, which takes up the black drop, the definition of the Sun's edge and the observers' habits. The fit gives A, or the solar parallax π☉, the angle the Earth's equatorial radius a⊕ subtends from the Sun."
 },
 {
  "t": "notes",
  "k": "orb-tr2",
  "html": "<b>The 1769 timings give <span class=\"cv\" data-v=\"trA\">…</span> million km</b> (± <span class=\"cv\" data-v=\"trSA\">…</span>, from re-drawing the stations at random), a solar parallax of <span class=\"cv\" data-v=\"trPar\">…</span>″. Those of 1761 give <span class=\"cv\" data-v=\"trA61\">…</span> ± <span class=\"cv\" data-v=\"trSA61\">…</span> million km, farther off and less sure, as the observers of the time found: fewer stations far apart, longitudes worse known. The amateurs of 2012 give <span class=\"cv\" data-v=\"trA12\">…</span> ± <span class=\"cv\" data-v=\"trSA12\">…</span> million km from one contact alone, the very value the project drew from it (158.5)<sup class=\"ref\"><a href=\"#s-orb-n24\">[24]</a></sup>, <span class=\"cv\" data-v=\"trPct12\">…</span> % too much: with a single contact, a small bias between the European and the Pacific timings goes straight into the distance. The three together: <span class=\"cv\" data-v=\"trAall\">…</span> ± <span class=\"cv\" data-v=\"trSAall\">…</span> million km. In 2004, ESO gathered <span class=\"cv\" data-v=\"trN04\">…</span> timings and published 149.61 ± 0.01 million km<sup class=\"ref\"><a href=\"#s-orb-n25\">[25]</a></sup>; those timings are no longer online, so that value is quoted, not recomputed. Left out of the fits: the observations of the \"G\" phase at the inner contacts (an earlier appearance than the thread of light, which Newcomb kept apart), and those more than three standard deviations from the fit of the others."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "k": "x:orb-transits-fig",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"orbFigTransits\"></div> <div class=\"fcap\">The astronomical unit from each transit, with the error of re-drawing its stations at random: 1761, 1769 and 2012 reduced here from the observers' timings, 2004 as ESO published it (hollow: its timings are no longer online), and the three reduced here together. The vertical line is today's value.</div> </div>"
 },
 {
  "t": "callout",
  "flat": true,
  "k": "orb-tr3",
  "html": "<b>The flat model's best case.</b> A Sun and a Venus a few thousand kilometres up could be placed so that a transit happens; but then the observers' lines of sight would differ by tens of degrees, not by seconds of arc: a contact would come hours apart, or not at all, from one continent to the next, and in the diagram the timings would have to lie on a line some <span class=\"cv\" data-v=\"trSlope5000\">…</span> times steeper. <b>What would vindicate the flat model here:</b> contact times that do not depend on where on the Earth they were taken, or that depend on it far more than a Sun at 150 million km allows."
 },
 {
  "t": "notes",
  "k": "orb-tr4",
  "html": "<b>Limits.</b> This section is a check: the baseline between the stations is in units of the Earth's radius, so a transit measures the Sun's distance in Earth radii (<span class=\"cv\" data-v=\"trRe\">…</span> of them in 1769), and its value in kilometres uses that radius. The orbits come from a modern ephemeris, used for their shape alone. The clocks of 1761 and 1769 were set by the stations' own longitudes, often uncertain by seconds; the black drop blurred the inner contacts by tens of seconds: hence a result to a percent and not better. Seven printed residuals of 1761 disagree with Newcomb's own times (Madras, Tornea, Stockholm at the last contact); his times are used. The 2012 file gives no heights, and one line has its latitude and longitude swapped; nothing was corrected."
 },
 {
  "t": "h2",
  "k": "orb-h2radar",
  "html": "Radar echoes from Venus: the astronomical unit by a clock, 1961"
 },
 {
  "t": "notes",
  "k": "orb-rd1",
  "html": "<b>In the spring of 1961 several radars sent pulses to Venus and timed the echoes.</b> At Millstone Hill, Massachusetts, MIT's Lincoln Laboratory transmitted for as long as the round trip would last, then listened: the echo came back after 283 to 449 seconds, four and three-quarter minutes at the closest approach on 10 April, seven and a half by mid-May<sup class=\"ref\"><a href=\"#s-orb-n14\">[14]</a></sup>. In half the shortest of those times light covers <span class=\"cv\" data-v=\"rdDmin\">…</span> million km. The orbits give the Earth–Venus distance in astronomical units, from centuries of angles and Kepler's third law; the echo gives it in kilometres; their ratio is the astronomical unit."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"orbAnimRadar\" style=\"height:clamp(560px,calc(860px - 30vw),700px)\"></canvas></div>"
 },
 {
  "t": "fcap",
  "k": "orbAnimRadar-cap",
  "html": "<b>Twenty-five echoes, one after the other.</b> Left: the orbits of the Earth and Venus seen from the north, to scale, from 6 March to 18 May 1961; the pulse leaves the Earth, reaches Venus and comes back, and its flight time is the one the Millstone team printed, to a ten-thousandth of a second<sup class=\"ref\"><a href=\"#s-orb-n14\">[14]</a></sup>. Right: the astronomical unit each echo gives. Grey rings: as printed in 1962, reduced with Newcomb's orbits; they drift by some 2,000 km over the two months. Blue dots: the same flight times reduced by us with today's orbits (JPL DE440<sup class=\"ref\"><a href=\"#s-orb-n15\">[15]</a></sup>), with the team's printed error bars; they lie along today's value. The drawn positions of Venus come from approximate orbital elements<sup class=\"ref\"><a href=\"#s-orb-n16\">[16]</a></sup>; every number written comes from the 1962 table. Click to pause."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "orb-fx-rd",
  "fig": "orbFxRadar",
  "lines": [
   {
    "tex": "c\\,\\tau = |V - S_1| + |V - S_2| - 2R_V",
    "fallback": "c τ = |V − S₁| + |V − S₂| − 2 R_V"
   },
   {
    "tex": "\\g{A = \\frac{c\\,\\tau/2 + R_V}{d_{\\text{AU}}}}",
    "fallback": "A = (c τ/2 + R_V) / d_AU"
   },
   {
    "tex": "\\sin\\varepsilon = \\frac{r_V}{r_E},\\qquad d_{\\text{conj}} = (1 - \\sin\\varepsilon)\\,A",
    "fallback": "sin ε = r_V / r_E, d_conj = (1 − sin ε) A"
   }
  ],
  "gloss": "τ is the flight time, V the centre of Venus at the instant of reflection, S₁ and S₂ the antenna when the pulse left and when it came back, R_V the radius of Venus, d_AU the Earth–Venus distance in astronomical units given by the orbits and A the unit in kilometres (the first line, solved for A, is the second when the antenna sits at the Earth's centre). With one angle instead of the orbits: Venus never strays more than about ε = 46.3° from the Sun, so the two orbits are in the ratio sin ε = 0.723, the ratio of NASA's semi-major axes, 108.2 and 149.6 million km<sup class=\"ref\"><a href=\"#s-orb-n10\">[10]</a></sup>. At conjunction, τ = <span class=\"cv\" data-v=\"rdTauMin\">…</span> s then gives A ≈ <span class=\"cv\" data-v=\"rdBack\">…</span> million km, <span class=\"cv\" data-v=\"rdBackPct\">…</span> % too much, because the orbits are not quite circles. With the full orbits, each echo is solved for A."
 },
 {
  "t": "notes",
  "k": "orb-rd2",
  "html": "<b>The 1961 echoes, reduced with today's orbits, give <span class=\"cv\" data-v=\"rdMed\">…</span> km</b> (median of the 25; weighted mean <span class=\"cv\" data-v=\"rdMean\">…</span> ± <span class=\"cv\" data-v=\"rdSig\">…</span> km, scatter <span class=\"cv\" data-v=\"rdRms\">…</span> km about it, within the team's own error bars). The value adopted today, 149,597,870.7 km<sup class=\"ref\"><a href=\"#s-orb-n17\">[17]</a></sup>, is <span class=\"cv\" data-v=\"rdDiff\">…</span> km away. In 1962 the team found that their values drifted with the date, by <span class=\"cv\" data-v=\"rdNewSpan\">…</span> km from March to May with Newcomb's orbits and still by some hundreds with Duncombe's corrections, and wrote that perfectly known orbits should yield a horizontal straight line<sup class=\"ref\"><a href=\"#s-orb-n14\">[14]</a></sup>: with today's orbits the line is horizontal to <span class=\"cv\" data-v=\"rdRms\">…</span> km. Their published value, 149,597,850 ± 400 km, and those of the other four radars of 1961 (table below) all lie within <span class=\"cv\" data-v=\"rdTeamsPct\">…</span> % of today's."
 },
 {
  "t": "fold",
  "q": false,
  "k": "orb-rd-fold",
  "summary": "<b>The 25 echoes of the 1962 table, and the five radars of 1961</b>",
  "html": "<table class=\"cnav-table\" id=\"orbRadarTable\"></table><table class=\"cnav-table\" id=\"orbRadarTeams\"></table>"
 },
 {
  "t": "callout",
  "flat": true,
  "k": "orb-rd3",
  "html": "<b>The flat model's best case.</b> The radar measures the distance to Venus and nothing else, and a flat model may put Venus wherever it likes. Near a Sun a few thousand kilometres up, at H = 5,000 km, the echo would come back after 2H/c = <span class=\"cv\" data-v=\"rdFlat\">…</span> s; Millstone waited 283 to 449 s, which puts Venus 42 to 67 million km away whatever the shape of the ground. Then the Sun: in those weeks Venus was a thin crescent, its Sun–Venus–Earth angle reaching <span class=\"cv\" data-v=\"rdPhase\">…</span>°, lit from behind, so the Sun lay beyond it, farther than 42 million km. <b>What would vindicate the flat model here:</b> echoes from Venus coming back in a fraction of a second, or flight times that no single astronomical unit fits from March to May."
 },
 {
  "t": "notes",
  "k": "orb-rd4",
  "html": "<b>Limits.</b> This section is a check. The flight times are a clock, but turning them into a distance from the Earth's centre needs the antenna's place on the Earth, up to <span class=\"cv\" data-v=\"rdSta\">…</span> km along the line of sight, computed on the ellipsoid; and today's orbits rest in part on the radar ranging of the decades that followed, these echoes among the first. The team's own reduction, with Newcomb's orbits built from angles alone, is shown beside ours. The early March echoes carry timing errors of up to 500 µs, as the team says, and their 1958 result, announced in 1959, was found to be wrong by these 1961 echoes, with no cause found<sup class=\"ref\"><a href=\"#s-orb-n14\">[14]</a></sup>."
 },
 {
  "t": "h2",
  "k": "orb-h2psr",
  "html": "Pulsars: the orbit timed by clocks in the sky"
 },
 {
  "t": "notes",
  "k": "orb-ps1",
  "html": "<b>A millisecond pulsar is a clock that keeps time to a fraction of a microsecond over decades.</b> Two networks of radio telescopes time dozens of them: the European Pulsar Timing Array<sup class=\"ref\"><a href=\"#s-orb-n18\">[18]</a></sup> and the North American NANOGrav<sup class=\"ref\"><a href=\"#s-orb-n21\">[21]</a></sup>, <span class=\"cv\" data-v=\"psToa\">…</span> pulse arrival times for the <span class=\"cv\" data-v=\"psN\">…</span> pulsars used here, over up to <span class=\"cv\" data-v=\"psYears\">…</span> years. Through each year the pulses come early when the Earth is on the pulsar's side of its orbit and late when it is on the other side, by up to (A/c)·cos β, where A is the radius of the orbit and β the pulsar's latitude above the plane of the orbit: <span class=\"cv\" data-v=\"psMaxDelay\">…</span> s for a pulsar in that plane<sup class=\"ref\"><a href=\"#s-orb-n20\">[20]</a></sup>. It is Rømer's method, with Jupiter's moon replaced by a clock steady to the microsecond."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"orbAnimPsr\" style=\"height:clamp(540px,calc(840px - 30vw),660px)\"></canvas></div>"
 },
 {
  "t": "fcap",
  "k": "orbAnimPsr-cap",
  "html": "<b>The same pulses, early or late with the Earth's place.</b> Left: the Earth's orbit seen from the north, to scale, and the wave fronts of one pulsar arriving from its direction; the purple segment is the Earth's distance along that direction, which light takes (A/c)·cos β·cos(λ⊕ − λ) seconds to cover. Right: that delay through one year for the twelve pulsars, the one shown on the left in bold. Each year shown is a different pulsar; their directions are the timing positions<sup class=\"ref\"><a href=\"#s-orb-n18\">[18]</a></sup>. Click to pause."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "orb-fx-ps",
  "fig": "orbFxPsr",
  "lines": [
   {
    "tex": "\\Delta t = -\\frac{A}{c}\\,r\\cos\\beta\\,\\cos(\\lambda_\\oplus - \\lambda)",
    "fallback": "Δt = −(A/c) r cos β cos(λ⊕ − λ)"
   },
   {
    "tex": "\\g{A = A_{\\text{DE}}\\,\\frac{\\cos\\beta_{\\text{timing}}}{\\cos\\beta_{\\text{VLBI}}}}",
    "fallback": "A = A_DE cos β_timing / cos β_VLBI"
   }
  ],
  "gloss": "Δt is the arrival time minus that of a steady clock, r the Earth's distance from the Sun in astronomical units and λ⊕ its longitude, λ and β the pulsar's ecliptic longitude and latitude, A the unit in kilometres. The delay fixes only the product A·cos β: a timing fit that takes the Earth's orbit from an ephemeris with the unit A_DE puts the pulsar at the latitude β_timing for which A_DE·cos β_timing is the true A·cos β. An independent latitude separates the two."
 },
 {
  "t": "notes",
  "k": "orb-ps2",
  "html": "<b>The latitude from quasars.</b> Antennas spread across a continent, linked as one telescope, measured the direction of eighteen of these pulsars against quasars billions of light years away: an angle, with no orbit and no delay in it<sup class=\"ref\"><a href=\"#s-orb-n19\">[19]</a></sup>. Twelve are timed by one array or both, <span class=\"cv\" data-v=\"psModels\">…</span> timing models in all. Carried to the timing epoch with their own measured proper motions, the two positions agree to <span class=\"cv\" data-v=\"psTypDb\">…</span> milliarcseconds in latitude (median). Had the unit been 1,000 km larger than the one the timing assumed, the timing latitudes would sit at least <span class=\"cv\" data-v=\"psShift\">…</span>″ away from the interferometric ones."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "k": "x:orb-psr-fig",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"orbFigPsr\"></div> <div class=\"fcap\">The astronomical unit from each pulsar, A_DE·cos β_timing/cos β_VLBI, with the error that the two positions carry. Blue: EPTA, green: NANOGrav. The two pulsars near the plane of the orbit (β ≈ 1° and 0.2°) have errors of a few metres: there cos β is 1 whatever the latitude, and the timing amplitude is the unit itself. J0610−2100's bar runs off the left edge (± 11 km).</div> </div>"
 },
 {
  "t": "notes",
  "k": "orb-ps3",
  "html": "<b>Twelve pulsars, <span class=\"cv\" data-v=\"psModels\">…</span> timing models, give <span class=\"cv\" data-v=\"psMed\">…</span> km</b> (median), from <span class=\"cv\" data-v=\"psMin\">…</span> to <span class=\"cv\" data-v=\"psMax\">…</span> km, the farthest, J0610−2100, <span class=\"cv\" data-v=\"ps0610\">…</span> km off with an error of <span class=\"cv\" data-v=\"ps0610s\">…</span> km (its quasar reference is poorly placed). Two clocks, one in the sky and one at the telescope, and an angle measured against quasars agree on the radius of the Earth's orbit to a few parts in a billion, and two independent arrays agree with each other pulsar by pulsar."
 },
 {
  "t": "callout",
  "flat": true,
  "k": "orb-ps4",
  "html": "<b>The flat model's best case.</b> On a fixed Earth the pulses would arrive like the ticks of a steady clock, with no yearly delay; a flat model can keep a moving Earth out only by letting every pulsar swing back and forth in the sky once a year, each in step with its own ecliptic longitude, by an amount that falls as cos β, and all in exactly the same proportion: the motion of an observer, attributed to the sources. <b>What would vindicate the flat model here:</b> pulsars with no annual delay, or delays whose sizes do not follow cos β, or timing and interferometric latitudes that disagree in the same sense for every pulsar."
 },
 {
  "t": "notes",
  "k": "orb-ps5",
  "html": "<b>Limits.</b> This section is a check: the timing models place each telescope by its coordinates on the Earth (a daily delay of up to 21 ms) and take the shape of the Earth's orbit from an ephemeris, whose scale owes much to radar ranging. The interferometric positions' absolute errors are, in their authors' words, only indicative. For J1730−2304 the EPTA latitude differs from the interferometric one by <span class=\"cv\" data-v=\"psDb1730\">…</span> mas, eight times the stated errors, and NANOGrav's by <span class=\"cv\" data-v=\"psDb1730n\">…</span> mas: the gap lies in one timing solution, not in the interferometry; it does not change the unit, the pulsar lying 0.2° from the plane of the orbit."
 },
 {
  "t": "h2",
  "k": "orb-h2sun",
  "html": "The Sun's size over the year"
 },
 {
  "t": "notes",
  "k": "orb-sun1",
  "html": "<b>The Sun is 3.4 % wider in early January than in early July.</b> SDO's apparent radius, every seven days of 2023, runs from <span class=\"cv\" data-v=\"rmin\">…</span>″ to <span class=\"cv\" data-v=\"rmax\">…</span>″<sup class=\"ref\"><a href=\"#s-orb-n4\">[4]</a></sup>. The ratio gives the eccentricity of the distance, e = <span class=\"cv\" data-v=\"e\">…</span>. It is computed by the spacecraft's pipeline from an ephemeris, so this is a check; a camera with a fixed lens and a solar filter measures the same ratio in pixels in January and July, and that would be a measurement."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"orbAnimSun\" style=\"height:clamp(360px,calc(660px - 32vw),600px)\"></canvas></div>"
 },
 {
  "t": "fcap",
  "html": "<b>The Sun's size detects the changing distance.</b> Left: the orbit to scale, eccentricity 0.017, the Earth placed by the ephemeris, its distance to the Sun in astronomical units. Right: the Sun's disc at the radius SDO measured that week, between the largest (solid ring, early January) and smallest (dotted ring, early July) of 2023; below, the year of SDO measurements with the cursor. Click to pause.",
  "k": "orbAnimSun-cap"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "orb-fx-sun",
  "fig": "orbFxSun",
  "lines": [
   {
    "tex": "\\frac{r_{\\max}}{r_{\\min}} = \\frac{\\theta_{\\max}}{\\theta_{\\min}} = \\frac{1+e}{1-e}\\;\\Rightarrow\\; \\g{e = \\frac{\\theta_{\\max}-\\theta_{\\min}}{\\theta_{\\max}+\\theta_{\\min}}}",
    "fallback": "θmax/θmin = (1+e)/(1−e) ⇒ e = (θmax − θmin)/(θmax + θmin)"
   }
  ],
  "gloss": "θ is the apparent radius, inversely proportional to the distance r. The Sun is widest in early January (perihelion) and narrowest in early July."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "k": "x:orb-sun-fig",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"orbFigSun\"></div> <div class=\"fcap\">The Sun's apparent radius through 2023 (SDO). A lamp circling above a plane would change size within each day by a large factor between noon and sunset; the real Sun changes by 3.4 % over a year and not measurably within a day.</div> </div>"
 },
 {
  "t": "h2",
  "k": "orb-h2dop",
  "html": "The Sun's Doppler shift: rotation in a day, orbit in a year"
 },
 {
  "t": "notes",
  "k": "orb-dop1",
  "html": "<b>Since 2015 a small telescope on La Palma has fed the whole Sun into the HARPS-N spectrograph every five minutes of every clear day.</b> The release gives the Sun's velocity in the solar system's frame and the correction that was subtracted to get there; adding it back gives what the spectrograph actually saw<sup class=\"ref\"><a href=\"#s-orb-n3\">[3]</a></sup>. In the morning the Sun approaches, in the afternoon it recedes, by <span class=\"cv\" data-v=\"amp\">…</span> m/s at most: the speed of La Palma around the Earth's axis, projected toward the Sun. Over the year the daily mean swings by ±<span class=\"cv\" data-v=\"K\">…</span> m/s: the Earth closing in on the Sun toward January and moving away toward July."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"orbAnimDop\" style=\"height:clamp(360px,calc(660px - 32vw),600px)\"></canvas></div>"
 },
 {
  "t": "fcap",
  "html": "<b>The Sun's Doppler shift detects the ground's motion through the day.</b> Left: the Earth seen from above the North Pole, La Palma carried around on its parallel, the Sun far to the right. Blue arrow: La Palma's velocity; thick arrow: its part along the line to the Sun, toward the Sun in the morning, away in the afternoon. Right: the same day of HARPS-N measurements, the globe's curve with no free shape and the best flat lamp, with the cursor at the time shown. Click to pause.",
  "k": "orbAnimDop-cap"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "orb-fx-dop",
  "fig": "orbFxDop",
  "lines": [
   {
    "tex": "v(t) = v_0 + \\Omega R\\cos\\varphi\\cos\\delta\\,\\sin H(t)",
    "fallback": "v(t) = v₀ + Ω R cos φ cos δ sin H(t)"
   },
   {
    "tex": "\\g{R = \\frac{|A|}{\\Omega\\cos\\varphi\\cos\\delta}},\\qquad a = \\frac{K\\,T\\sqrt{1-e^2}}{2\\pi e}",
    "fallback": "R = |A| / (Ω cos φ cos δ), a = K T √(1−e²) / 2πe"
   }
  ],
  "gloss": "A is the fitted daily amplitude, H the Sun's hour angle, φ = 28.75° the latitude, δ the Sun's declination (from an ephemeris: a check), Ω the rotation measured in the Rotation tab. K is the yearly amplitude of the daily mean v₀; with e from the Sun's size it gives the orbit's semi-major axis a."
 },
 {
  "t": "raw",
  "tag": "p",
  "class": "reads",
  "id": "orb-readDop",
  "html": "<p class=\"reads\" id=\"orb-readDop\"></p>"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "k": "x:orb-dop-fig",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"orbFigDop\"></div> <div class=\"fcap\">One day of HARPS-N (dots), the globe's curve with no free shape (blue, R = 6,371 km, the Sun's position from an ephemeris) and the best flat lamp (orange, its height fitted over all days). Each model gets one free constant per day.</div> </div>"
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "k": "x:orb-year-fig",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"orbFigYear\"></div> <div class=\"fcap\">The daily mean velocity over three years: the Earth approaches the Sun from July to January and recedes from January to July. The amplitude K, with the eccentricity from the Sun's size, gives the astronomical unit.</div> </div>"
 },
 {
  "t": "callout",
  "flat": true,
  "k": "orb-dop2",
  "html": "<b>The flat lamp, at its best.</b> Its free parameter is its height. Over the 462 days the best height is <span class=\"cv\" data-v=\"Hflat\">…</span> km, and it leaves residuals of <span class=\"cv\" data-v=\"rmsFlat\">…</span> m/s. The globe, with no free shape at all (R = 6,371 km, the Sun where the ephemeris puts it), leaves <span class=\"cv\" data-v=\"rmsGlobe\">…</span> m/s. <b>What would vindicate the lamp:</b> residuals at the level of the instrument, about 1 m/s, for some height."
 },
 {
  "t": "notes",
  "k": "orb-dop3",
  "html": "<b>Limits.</b> The velocity is rebuilt by adding back a correction computed from ephemerides, the declination comes from one, and the Earth's radius enters both: this section is a check. The radius scatters by ±10 km from day to day around its median, 6,362 km, which is the station's distance from the axis divided by cos φ. Over a few hours around noon the yearly drift, up to 8.5 m/s a day, looks like the daily term: it is estimated over the year first and removed from each day. The Moon's pull on the Earth, 12.5 m/s over 27 days, is not removed."
 },
 {
  "t": "h2",
  "k": "orb-h2star",
  "html": "A star's Doppler shift: τ Ceti over sixteen years"
 },
 {
  "t": "notes",
  "k": "orb-star1",
  "html": "<b>τ Ceti barely moves; the observer does.</b> HARPS at La Silla observed it on <span class=\"cv\" data-v=\"nStar\">…</span> nights between 2003 and 2019<sup class=\"ref\"><a href=\"#s-orb-n5\">[5]</a></sup>. Its observed velocity swings by ±<span class=\"cv\" data-v=\"Kstar\">…</span> km/s with a period of one year. τ Ceti lies <span class=\"cv\" data-v=\"beta\">…</span>° from the ecliptic, so the Earth's full orbital speed is <span class=\"cv\" data-v=\"vStar\">…</span> km/s and the orbit's radius <span class=\"cv\" data-v=\"aStar\">…</span> million km."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"orbAnimStar\" style=\"height:clamp(360px,calc(660px - 32vw),600px)\"></canvas></div>"
 },
 {
  "t": "fcap",
  "html": "<b>A star's Doppler shift detects the Earth's orbital speed.</b> Left: the Earth through a year, its velocity (thin arrow) and the part of it directed at τ Ceti (thick arrow). Right: the HARPS nights folded on one year, the curve computed from the Earth's orbit alone, with only the star's own mean velocity adjusted, and the cursor at the date shown. Click to pause.",
  "k": "orbAnimStar-cap"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "orb-fx-star",
  "fig": "orbFxStar",
  "lines": [
   {
    "tex": "v_{\\text{obs}}(t) = \\gamma + K\\sin(2\\pi t/T + \\varphi_0),\\qquad \\g{v = \\frac{K}{\\cos\\beta}},\\quad a = \\frac{vT}{2\\pi}",
    "fallback": "v_obs = γ + K sin(2πt/T + φ₀), v = K/cos β, a = vT/2π"
   }
  ],
  "gloss": "γ is the star's own velocity, K the annual amplitude, β the star's ecliptic latitude (from its catalogue position) and T the sidereal year."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "k": "x:orb-star-fig",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"orbFigStar\"></div> <div class=\"fcap\">τ Ceti's observed velocity folded on one year (dots) and the fitted sinusoid. The star's own velocity, −16.5 km/s, is the mean; the swing is the observer.</div> </div>"
 },
 {
  "t": "h2",
  "k": "orb-h2par",
  "html": "Parallax: the orbit as a baseline"
 },
 {
  "t": "notes",
  "k": "orb-par1",
  "html": "<b>In 1838 Bessel measured 61 Cygni shifting back and forth by 0.314″ against fainter stars over a year</b><sup class=\"ref\"><a href=\"#s-orb-n6\">[6]</a></sup>: the near star seen from opposite sides of the orbit. Read as a triangle whose base is the orbit, it puts 61 Cygni <span class=\"cv\" data-v=\"parAU\">…</span> astronomical units away. Like aberration, it shows the observer moving each year; unlike aberration, its size depends on each star's distance."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"orbAnimPar\" style=\"height:clamp(360px,calc(660px - 32vw),600px)\"></canvas></div>"
 },
 {
  "t": "fcap",
  "html": "<b>Parallax detects the Earth's change of place.</b> Left: the Earth through 1838 and its line of sight to 61 Cygni, drawn far too close. Right: 61 Cygni against fainter, more distant stars, tracing a small ellipse of half-width 0.314″ (Bessel's value), always on the side opposite the Earth's position. The whole field also swings by about 20″ through aberration, and 61 Cygni drifts 5.2″ a year on its own; both are removed here, as Bessel removed them. Shifts to the 0.2″ bar. Click to pause.",
  "k": "orbAnimPar-cap"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "orb-fx-par",
  "fig": "orbFxPar",
  "lines": [
   {
    "tex": "\\g{d = \\frac{a}{\\tan p}}",
    "fallback": "d = a / tan p"
   }
  ],
  "gloss": "p is the parallax (half the annual shift), a the radius of the orbit and d the star's distance."
 },
 {
  "t": "h2",
  "k": "orb-h2gno",
  "html": "A stick in the ground: the tilt and the eccentricity from noon shadows"
 },
 {
  "t": "notes",
  "k": "orb-gno1",
  "html": "<b>A vertical stick, a level and a clock give the obliquity and the eccentricity without any other instrument.</b> At the solstices the noon Sun stands highest and lowest; half the difference of the two noon altitudes is the tilt of the axis, ε, and their mean gives the latitude. Through the year the clock time of the shortest shadow wanders by up to a quarter of an hour around noon, the equation of time: about 7.7 minutes of it come from the eccentricity and 9.9 from the tilt, with different periods, so a year of noon timings separates them."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "orb-fx-gno",
  "fig": "orbFxGno",
  "lines": [
   {
    "tex": "\\tan h = \\frac{L}{s},\\qquad \\varepsilon = \\frac{h_{\\text{June}} - h_{\\text{Dec}}}{2},\\qquad \\varphi = 90\\deg - \\frac{h_{\\text{June}} + h_{\\text{Dec}}}{2}",
    "fallback": "tan h = L/s, ε = (h_June − h_Dec)/2, φ = 90° − (h_June + h_Dec)/2"
   },
   {
    "tex": "\\g{E(t) \\approx 2e\\,\\sin M - \\tan^2(\\varepsilon/2)\\,\\sin 2\\lambda}",
    "fallback": "E(t) ≈ 2e sin M − tan²(ε/2) sin 2λ"
   }
  ],
  "gloss": "L is the stick's height and s the noon shadow's length, h the Sun's noon altitude; E is the equation of time in radians of rotation (× 229.2 for minutes), M the Sun's mean anomaly and λ its longitude. The first term has a period of a year and gives e, the second half a year and gives ε."
 },
 {
  "away": "xp-orb-gno",
  "t": "exp",
  "k": "orb-exp",
  "h": "Experiment · the noon shadow",
  "title": "Measure the shortest shadow at both solstices",
  "lead": "A stick made vertical with a level, a flat floor, a tape. Mark the shortest shadow around noon on 21 June and 21 December.",
  "iv": "<b>You measure</b> the stick's height and the two noon shadows",
  "dv": "<b>You get</b> the axis tilt ε and your latitude φ",
  "meta": [
   "Prediction for Marseille (43.3° N): shadows of 0.36 L in June and 2.33 L in December, ε ≈ 23.44°.",
   "A year of noon timings against a network clock gives the equation of time, and from it e."
  ],
  "inputs": [
   [
    "orbGnoL",
    "Stick height L (cm)",
    "value=\"100\" step=\"0.1\""
   ],
   [
    "orbGnoS",
    "June noon shadow (cm)",
    "value=\"36.1\" step=\"0.1\""
   ],
   [
    "orbGnoW",
    "December noon shadow (cm)",
    "value=\"232.6\" step=\"0.1\""
   ]
  ],
  "out": "orbGnoOut",
  "verdict": "orbGnoV"
 },
 {
  "t": "xrefs",
  "keys": [
   "sun",
   "rot",
   "sat",
   "star",
   "azim"
  ],
  "wide": false
 },
 {
  "t": "sources"
 }
];
