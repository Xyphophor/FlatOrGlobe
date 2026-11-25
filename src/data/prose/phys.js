// Prose de l'onglet phys (2026-10-25), en anglais (source). Valeurs : span.cv[data-v] remplis par index.js depuis logic.js.
// Les tableaux sont des blocs bruts AVEC clé (traduits entiers) ; celui des constantes est rempli par index.js.
import { MECH } from "../../tabs/phys/mech-prose.js";

export const PROSE = [
 {
  "t": "eyebrow",
  "k": "phys-eyebrow",
  "html": "Basics · the physics the other tabs use"
 },
 {
  "t": "h1",
  "k": "phys-h1",
  "html": "The basics: units, derivatives, frames of reference, Newton's laws and the constants"
 },
 {
  "t": "lead",
  "opener": true,
  "k": "phys-lead",
  "html": "The other tabs use words like <i>inertial frame</i>, <i>angular velocity</i>, <i>dθ/dt</i>, <i>GM</i> or <i>3σ</i> without stopping to define them. This tab gathers those definitions in one place, each with its formula and a figure, and says where on the site it is used. Nothing here is a measurement, and nothing here takes sides: Newton's laws, the units and the statistics are the same tools for both models, and any model of the Earth has to obey them."
 },
 {
  "t": "h2",
  "k": "phys-h2units",
  "html": "Quantities, units and orders of magnitude"
 },
 {
  "t": "notes",
  "k": "phys-units1",
  "html": "<b>A quantity is a number times a unit.</b> “6,371 km” says how many times the kilometre fits in the Earth's radius; the number alone means nothing. Since 20 May 2019 the seven base units of the International System (SI) are no longer defined by objects (the platinum kilogram in Sèvres) but by fixing the value of seven constants of nature<sup class=\"ref\"><a href=\"#s-phys-n1\">[1]</a></sup>: the second by the frequency of the caesium atom, the metre by the speed of light, the kilogram by Planck's constant, and so on. Large and small numbers are written in scientific notation: 6.371 × 10⁶ m, 7.29 × 10⁻⁵ rad/s. The exponent counts the places the decimal point moves, so its <i>order of magnitude</i> is read at a glance."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "",
  "id": "",
  "k": "x:phys-tab-si",
  "html": "<table class=\"cnav-table\"><caption>The seven SI base units and the constant that fixes each one since 2019<sup class=\"ref\"><a href=\"#s-phys-n1\">[1]</a></sup>; and the prefixes the site uses.</caption><thead><tr><th>Quantity</th><th>Unit</th><th>Fixed by</th></tr></thead><tbody>\n<tr><td>time</td><td>second (s)</td><td>caesium-133 frequency Δν<sub>Cs</sub> = 9 192 631 770 Hz</td></tr>\n<tr><td>length</td><td>metre (m)</td><td>speed of light c = 299 792 458 m/s</td></tr>\n<tr><td>mass</td><td>kilogram (kg)</td><td>Planck's constant h</td></tr>\n<tr><td>electric current</td><td>ampere (A)</td><td>elementary charge e</td></tr>\n<tr><td>temperature</td><td>kelvin (K)</td><td>Boltzmann's constant k<sub>B</sub></td></tr>\n<tr><td>amount of substance</td><td>mole (mol)</td><td>Avogadro's number N<sub>A</sub></td></tr>\n<tr><td>luminous intensity</td><td>candela (cd)</td><td>luminous efficacy K<sub>cd</sub> = 683 lm/W</td></tr>\n<tr><td colspan=\"3\">Prefixes: n (nano) 10⁻⁹ · µ (micro) 10⁻⁶ · m (milli) 10⁻³ · k (kilo) 10³ · M (mega) 10⁶ · G (giga) 10⁹</td></tr></tbody></table>"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "phys-fx-rad",
  "fig": "physFxRad",
  "lines": [
   {
    "tex": "\\g{\\theta = \\frac{s}{r}}\\ \\text{(rad)},\\qquad 2\\pi\\ \\text{rad} = 360\\deg,\\qquad 1\\deg = 60\\arcmin = 3600\\arcsec",
    "fallback": "θ = s/r (rad), 2π rad = 360°, 1° = 60′ = 3600″"
   }
  ],
  "gloss": "<b>The radian.</b> An angle θ in radians is the arc s it cuts on a circle divided by the radius r: a full turn is 2π r / r = 2π rad, so 1 rad = 57.30°. Degrees split into 60 minutes of arc (′) and each minute into 60 seconds of arc (″); 1″ = <span class=\"cv\" data-v=\"arcsecRad\">…</span> millionths of a radian. The elevation, dip and refraction tabs (<a class=\"xref\" href=\"#tab-elev\" data-xref=\"elev\">Elevation angles</a>, <a class=\"xref\" href=\"#tab-dip\" data-xref=\"dip\">Dip</a>, <a class=\"xref\" href=\"#tab-ref\" data-xref=\"ref\">Refraction</a>) count in minutes and seconds of arc; every formula of the site computes in radians."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "phys-fx-small",
  "fig": "physFxSmall",
  "lines": [
   {
    "tex": "\\g{\\tan\\theta \\approx \\sin\\theta \\approx \\theta}\\quad (\\theta\\ \\text{small, in rad})",
    "fallback": "tan θ ≈ sin θ ≈ θ (θ small, in rad)"
   }
  ],
  "gloss": "<b>Small angles.</b> For a thin triangle, the opposite side over the long side is almost the angle itself in radians. The error is <span class=\"cv\" data-v=\"sa1\">…</span> % at 1°, <span class=\"cv\" data-v=\"sa5\">…</span> % at 5° and <span class=\"cv\" data-v=\"sa10\">…</span> % at 10°. That is why an object of height h seen at a distance d spans an angle of about h/d, and why the site can write the dip of the horizon as √(2h/R)."
 },
 {
  "t": "h2",
  "k": "phys-h2kin",
  "html": "Position, velocity, acceleration"
 },
 {
  "t": "notes",
  "k": "phys-kin1",
  "html": "<b>Kinematics describes motion without asking what causes it.</b> A body's position x is measured from an origin chosen by the observer; its velocity v is how fast x changes, its acceleration a how fast v changes. All three are <i>vectors</i>: they have a size and a direction, and adding two of them means putting them end to end. A speed of 900 km/h going east and the same speed going west are two different velocities."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "phys-fx-mean",
  "fig": "physFxMean",
  "lines": [
   {
    "tex": "\\g{\\bar v = \\frac{\\Delta x}{\\Delta t} = \\frac{x_2 - x_1}{t_2 - t_1}},\\qquad \\bar a = \\frac{\\Delta v}{\\Delta t}",
    "fallback": "v̄ = Δx/Δt = (x₂ − x₁)/(t₂ − t₁), ā = Δv/Δt"
   }
  ],
  "gloss": "Δ (delta) means “the change in”: Δx is the distance covered between two instants, Δt the time between them. Their ratio is the <i>mean</i> velocity over that interval: on a graph of x against t, the slope of the straight chord joining the two points."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "phys-fx-vec",
  "fig": "physFxVec",
  "lines": [
   {
    "tex": "\\g{\\vec v = (v_x,\\ v_y)},\\qquad |\\vec v| = \\sqrt{v_x^2 + v_y^2},\\qquad \\vec v_{\\text{total}} = \\vec v_1 + \\vec v_2",
    "fallback": "v = (vₓ, v_y), |v| = √(vₓ² + v_y²), v_total = v₁ + v₂"
   }
  ],
  "gloss": "An arrow over a letter marks a vector. It splits into components along the axes, and its length, the <i>magnitude</i>, follows from Pythagoras. An airliner's ground speed is its airspeed plus the wind, added as arrows: that is the <a class=\"xref\" href=\"#tab-avia\" data-xref=\"avia\">Aviation</a> tab's triangle of velocities."
 },
 {
  "t": "notes",
  "k": "phys-kin2",
  "html": "<b>Adding vectors: Chasles' relation.</b> Going from A to B, then from B to C, ends at the same place as going straight from A to C: written with displacement vectors, AB⃗ + BC⃗ = AC⃗. It is named after the French geometer Michel Chasles (1793–1880), and it holds for any number of steps: AB⃗ + BC⃗ + CD⃗ = AD⃗. Only the start and the end count, not the path. That is what “putting the arrows end to end” means, and it works the same for displacements, velocities, accelerations and forces."
 },
 {
  "t": "people",
  "ids": [
   "chasles"
  ]
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "phys-fx-chasles",
  "fig": "physFxChasles",
  "lines": [
   {
    "tex": "\\g{\\vec{AB} + \\vec{BC} = \\vec{AC}},\\qquad \\vec{AB} + \\vec{BC} + \\vec{CD} = \\vec{AD},\\qquad \\vec{AB} + \\vec{BA} = \\vec 0",
    "fallback": "AB + BC = AC, AB + BC + CD = AD, AB + BA = 0"
   }
  ],
  "gloss": "The detour through B and the direct path land at the same point. A round trip adds up to the zero vector: AB⃗ + BA⃗ = 0⃗, so BA⃗ = −AB⃗, the same arrow turned round. The order of the steps does not matter either: AB⃗ + BC⃗ = BC⃗ + AB⃗, the two other sides of a parallelogram."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "phys-fx-comp",
  "fig": "physFxComp",
  "lines": [
   {
    "tex": "\\g{\\vec a + \\vec b = (a_x + b_x,\\ a_y + b_y)}",
    "fallback": "a + b = (aₓ + bₓ, a_y + b_y)"
   }
  ],
  "gloss": "<b>With components, it is ordinary addition.</b> Put the arrows end to end and look at their shadows on each axis: the shadows add up too. To add two vectors, add their x components together and their y components together. That is how a computer adds forces or velocities, and how the <a class=\"xref\" href=\"#tab-avia\" data-xref=\"avia\">Aviation</a> tab adds the wind to an airliner's airspeed."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "phys-fx-sub",
  "fig": "physFxSub",
  "lines": [
   {
    "tex": "\\g{\\vec a - \\vec b = \\vec a + (-\\vec b)},\\qquad \\vec b + (\\vec a - \\vec b) = \\vec a",
    "fallback": "a − b = a + (−b), b + (a − b) = a"
   }
  ],
  "gloss": "<b>Subtracting is adding the opposite.</b> −b⃗ is b⃗ turned round. Drawn from a common origin, a⃗ − b⃗ is the arrow that goes from the tip of b⃗ to the tip of a⃗: the step still needed to get from b⃗ to a⃗, which is Chasles' relation again. This tab uses it twice: the change of velocity Δv⃗ = v⃗₂ − v⃗₁ points to the centre on a circle, and the velocity seen from a moving train is v⃗′ = v⃗ − V⃗."
 },
 {
  "t": "h2",
  "k": "phys-h2deriv",
  "html": "Derivatives: one idea, several notations"
 },
 {
  "t": "notes",
  "k": "phys-deriv1",
  "html": "<b>A derivative is a rate of change at one instant.</b> Shrink the interval Δt of the mean velocity towards zero: the chord turns into the tangent to the curve, and its slope is the instantaneous velocity. Newton and Leibniz found this independently in the 1660s–1680s and wrote it differently; Lagrange later added a third way<sup class=\"ref\"><a href=\"#s-phys-n5\">[5]</a></sup><sup class=\"ref\"><a href=\"#s-phys-n6\">[6]</a></sup><sup class=\"ref\"><a href=\"#s-phys-n7\">[7]</a></sup>. All three are still in use, often on the same page, and they mean exactly the same thing."
 },
 {
  "t": "people",
  "ids": [
   "newton",
   "leibniz",
   "lagrange"
  ]
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "phys-fx-tangent",
  "fig": "physFxTangent",
  "lines": [
   {
    "tex": "\\g{v(t) = \\lim_{\\Delta t \\to 0} \\frac{\\Delta x}{\\Delta t} = \\frac{dx}{dt} = \\dot x = x\\prime(t)}",
    "fallback": "v(t) = lim(Δt→0) Δx/Δt = dx/dt = ẋ = x′(t)"
   },
   {
    "tex": "a = \\frac{dv}{dt} = \\frac{d^2x}{dt^2} = \\ddot x = x\\dprime(t)",
    "fallback": "a = dv/dt = d²x/dt² = ẍ = x″(t)"
   }
  ],
  "gloss": "“lim” reads “the limit as Δt goes to zero”. dx/dt (Leibniz) keeps the memory of a ratio of two tiny changes; ẋ, with a dot (Newton), is used only for derivatives with respect to time; x′ (Lagrange) says “derivative of x” without naming the variable. Two dots, two primes or d²/dt²: the derivative taken twice, the acceleration."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "",
  "id": "",
  "k": "x:phys-tab-deriv",
  "html": "<table class=\"cnav-table\"><caption>The notations, how they are read, and where the site uses them.</caption><thead><tr><th>Written</th><th>Read</th><th>Means</th><th>On this site</th></tr></thead><tbody>\n<tr><td>Δx</td><td>delta x</td><td>a finite change of x</td><td>everywhere</td></tr>\n<tr><td>dx/dt</td><td>d x d t (Leibniz)</td><td>rate of change of x with t</td><td><a class=\"xref\" href=\"#tab-rot\" data-xref=\"rot\">Rotation</a>, <a class=\"xref\" href=\"#tab-orb\" data-xref=\"orb\">Orbit</a></td></tr>\n<tr><td>ẋ, ẍ</td><td>x dot, x double dot (Newton)</td><td>first, second derivative in time</td><td>θ̇ of Kepler in <a class=\"xref\" href=\"#tab-orb\" data-xref=\"orb\">Orbit</a></td></tr>\n<tr><td>f′(x), f″(x)</td><td>f prime, f second (Lagrange)</td><td>derivative of f, whatever the variable</td><td><a class=\"xref\" href=\"#tab-curv\" data-xref=\"curv\">Horizon curve</a></td></tr>\n<tr><td>∂f/∂x</td><td>partial f partial x</td><td>derivative in x, the other variables held fixed</td><td><a class=\"xref\" href=\"#tab-grav\" data-xref=\"grav\">Gravity</a>, <a class=\"xref\" href=\"#tab-mag\" data-xref=\"mag\">Magnetism</a></td></tr>\n<tr><td>∇f</td><td>nabla f, gradient</td><td>the vector of all partial derivatives: steepest slope</td><td><a class=\"xref\" href=\"#tab-grav\" data-xref=\"grav\">Gravity</a>, <a class=\"xref\" href=\"#tab-atmo\" data-xref=\"atmo\">Atmosphere</a></td></tr>\n<tr><td>∫ f dt</td><td>integral of f d t</td><td>the sum of f dt: the area under f, the reverse of a derivative</td><td><a class=\"xref\" href=\"#tab-ref\" data-xref=\"ref\">Refraction</a> (ray tracing)</td></tr>\n<tr><td>Σ</td><td>sigma, sum</td><td>add up the terms</td><td>every fit (<a class=\"xref\" href=\"#tab-results\" data-xref=\"results\">Results</a>)</td></tr></tbody></table>"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "phys-fx-area",
  "fig": "physFxArea",
  "lines": [
   {
    "tex": "\\g{x(t) = x_0 + \\int_{0}^{t} v\\,dt}\\qquad \\Leftrightarrow\\qquad \\frac{dx}{dt} = v",
    "fallback": "x(t) = x₀ + ∫₀ᵗ v dt ⇔ dx/dt = v"
   }
  ],
  "gloss": "<b>The integral undoes the derivative.</b> Cut the time into thin slices dt; in each, the body moves v dt. Adding all the slices (the long S, ∫, is a stretched “sum”) gives the distance covered: the area under the curve of v against t. An inertial navigation unit does exactly that, twice, from its accelerometers (<a class=\"xref\" href=\"#tab-avia\" data-xref=\"avia\">Aviation</a>)."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "phys-fx-grad",
  "fig": "physFxGrad",
  "lines": [
   {
    "tex": "\\g{\\nabla h = \\left(\\frac{\\partial h}{\\partial x},\\ \\frac{\\partial h}{\\partial y}\\right)}",
    "fallback": "∇h = (∂h/∂x, ∂h/∂y)"
   }
  ],
  "gloss": "<b>Partial derivatives.</b> When a quantity depends on several variables, such as the height h of a hill at each point (x, y) of a map, ∂h/∂x is its slope walking due east, with y held fixed, and ∂h/∂y its slope walking north. Together they form the gradient ∇h, an arrow pointing straight uphill, across the contour lines. Gravity is minus the gradient of the potential; air pressure falls along its gradient with height."
 },
 {
  "t": "h2",
  "k": "phys-h2frames",
  "html": "Frames of reference"
 },
 {
  "t": "notes",
  "k": "phys-frames1",
  "html": "<b>A frame of reference is an observer with axes and a clock.</b> Positions, velocities and accelerations only have a value relative to one. A frame is <i>inertial</i> when a body on which no force acts moves in a straight line at constant speed, or stays at rest: Newton's laws hold there as written. Galileo noticed in 1632 that, in the closed cabin of a ship sailing smoothly, flies, fish in a bowl and dripping water behave exactly as on land: no experiment inside can tell a uniform motion from rest<sup class=\"ref\"><a href=\"#s-phys-n3\">[3]</a></sup>. Any frame moving at constant velocity relative to an inertial frame is itself inertial."
 },
 {
  "t": "people",
  "ids": [
   "galileo"
  ]
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "phys-fx-galileo",
  "fig": "physFxGalileo",
  "lines": [
   {
    "tex": "\\g{x\\prime = x - V t},\\qquad v\\prime = v - V,\\qquad a\\prime = a",
    "fallback": "x′ = x − Vt, v′ = v − V, a′ = a"
   }
  ],
  "gloss": "<b>Galilean change of frame.</b> A train moves at constant speed V along the platform. Positions and velocities measured on board (primed) differ from those measured on the platform, but accelerations are the same: V is constant, so it vanishes when differentiated. Forces, which give accelerations, are therefore the same in every inertial frame. That is why a smooth motion cannot be felt, and why “I would feel the Earth move” is not an argument: what is felt is acceleration, not speed."
 },
 {
  "t": "notes",
  "k": "phys-frames2",
  "html": "<b>A rotating frame is not inertial.</b> On a merry-go-round, a ball rolled straight across seems to curve, and a passenger feels pushed outwards, although no one pushes. Written in the turning frame, Newton's second law only works if <i>inertial forces</i> are added: they are not caused by another body, they come from the frame's own acceleration<sup class=\"ref\"><a href=\"#s-phys-n8\">[8]</a></sup>. The ground under our feet turns once a sidereal day, so it is a rotating frame; its rotation is slow enough that these forces are small, but instruments measure them."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "phys-fx-rotframe",
  "fig": "physFxRotFrame",
  "lines": [
   {
    "tex": "\\g{\\vec a\\prime = \\vec a - 2\\,\\vec\\Omega\\times\\vec v\\prime - \\vec\\Omega\\times(\\vec\\Omega\\times\\vec r)}",
    "fallback": "a′ = a − 2 Ω × v′ − Ω × (Ω × r)"
   },
   {
    "tex": "a_\\text{Coriolis} = 2\\,\\Omega\\,v\\,\\sin\\varphi,\\qquad a_\\text{centrifugal} = \\Omega^2\\,r",
    "fallback": "a_Coriolis = 2Ωv sin φ, a_centrifugal = Ω² r"
   }
  ],
  "gloss": "Ω is the frame's angular velocity, v′ and r the body's velocity and position in that frame, × the vector (cross) product, φ the latitude. The middle term is the Coriolis acceleration: it deviates anything that moves, to the right in the northern hemisphere; for an airliner at 250 m/s at 45° it is <span class=\"cv\" data-v=\"cor\">…</span> m/s², <span class=\"cv\" data-v=\"corPct\">…</span> % of gravity. The last term is the centrifugal acceleration, outward from the axis: <span class=\"cv\" data-v=\"aEq\">…</span> m/s² at the equator. The figure shows the same ball seen from outside (straight line) and from the turning disc (curved)."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "",
  "id": "",
  "k": "x:phys-tab-inertial",
  "html": "<table class=\"cnav-table\"><caption>The inertial forces of a turning Earth, their size, and the tabs that measure them<sup class=\"ref\"><a href=\"#s-phys-n8\">[8]</a></sup><sup class=\"ref\"><a href=\"#s-phys-n11\">[11]</a></sup>.</caption><thead><tr><th>Force</th><th>Per unit mass</th><th>On the Earth</th><th>On this site</th></tr></thead><tbody>\n<tr><td>centrifugal</td><td>Ω² r cos φ, away from the axis</td><td><span class=\"cv\" data-v=\"aEq\">…</span> m/s² at the equator, 0 at the poles</td><td><a class=\"xref\" href=\"#tab-grav\" data-xref=\"grav\">Gravity</a></td></tr>\n<tr><td>Coriolis</td><td>2 Ω × v, across the motion</td><td>~10⁻⁴ m/s² per m/s of speed</td><td><a class=\"xref\" href=\"#tab-fou\" data-xref=\"fou\">Foucault</a>, <a class=\"xref\" href=\"#tab-avia\" data-xref=\"avia\">Aviation</a>, <a class=\"xref\" href=\"#tab-rot\" data-xref=\"rot\">Rotation</a></td></tr>\n<tr><td>Eötvös (vertical part of Coriolis)</td><td>2 Ω v cos φ, up for eastward motion</td><td>a ship going east is lighter</td><td><a class=\"xref\" href=\"#tab-avia\" data-xref=\"avia\">Aviation</a>, <a class=\"xref\" href=\"#tab-grav\" data-xref=\"grav\">Gravity</a></td></tr>\n<tr><td>Euler</td><td>−(dΩ/dt) × r</td><td>negligible: Ω barely changes</td><td>—</td></tr></tbody></table>"
 },
 {
  "t": "h2",
  "k": "phys-h2newton",
  "html": "Newton's three laws and universal gravitation"
 },
 {
  "t": "notes",
  "k": "phys-newton1",
  "html": "<b>The three laws (Principia, 1687)<sup class=\"ref\"><a href=\"#s-phys-n4\">[4]</a></sup>.</b> First: a body stays at rest or in uniform straight motion unless a force acts on it; this is what defines an inertial frame. Second: the force equals the mass times the acceleration. Third: when a body pushes another, the other pushes back with an equal and opposite force. <b>Mass is not weight.</b> Mass (kg) measures how hard a body is to accelerate and is the same everywhere; weight is the force of gravity on it, m g, in newtons (N = kg·m/s²), and changes with g. A bathroom scale measures a force and displays it divided by a standard g."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "phys-fx-n2",
  "fig": "physFxN2",
  "lines": [
   {
    "tex": "\\g{\\sum \\vec F = m\\,\\vec a = m\\,\\frac{d\\vec v}{dt}}\\qquad (\\sum \\vec F = 0\\ \\Leftrightarrow\\ \\vec v\\ \\text{constant})",
    "fallback": "ΣF = m a = m dv/dt (ΣF = 0 ⇔ v constant)"
   }
  ],
  "gloss": "Σ F is the sum of all forces on the body, added as arrows. If they cancel, the acceleration is zero and the first law follows: the first law is the second with no net force. On a book lying on a table, its weight and the table's push cancel."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "phys-fx-n3",
  "fig": "physFxN3",
  "lines": [
   {
    "tex": "\\g{\\vec F_{A\\to B} = -\\vec F_{B\\to A}}",
    "fallback": "F(A→B) = −F(B→A)"
   }
  ],
  "gloss": "The apple pulls the Earth up exactly as hard as the Earth pulls the apple down. The Earth's acceleration is far too small to see because its mass is 10²⁴ times larger. The two forces act on different bodies, so they never cancel each other."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "phys-fx-grav",
  "fig": "physFxGrav",
  "lines": [
   {
    "tex": "\\g{F = \\frac{G\\,m_1\\,m_2}{r^2}},\\qquad g = \\frac{G M}{R^2}",
    "fallback": "F = G m₁ m₂ / r², g = GM/R²"
   }
  ],
  "gloss": "Every pair of masses attracts along the line joining them, with a force that falls as the square of the distance r between their centres; for a sphere, the attraction outside is as if all its mass were at the centre. G is the gravitational constant, first measured in the laboratory by Cavendish in 1798 with lead balls<sup class=\"ref\"><a href=\"#s-phys-n10\">[10]</a></sup>. At the surface of a sphere of mass M and radius R, the acceleration is g = GM/R²: <span class=\"cv\" data-v=\"gSph\">…</span> m/s² for the Earth's GM and a radius of 6,371 km. The <a class=\"xref\" href=\"#tab-grav\" data-xref=\"grav\">Gravity</a> tab compares measured g with this."
 },
 {
  "t": "people",
  "ids": [
   "cavendish"
  ]
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "phys-fx-moon",
  "fig": "physFxMoon",
  "lines": [
   {
    "tex": "\\g{a_\\text{Moon} = \\frac{4\\pi^2 r}{T^2} \\approx g\\,\\left(\\frac{R}{r}\\right)^2}",
    "fallback": "a_Moon = 4π² r / T² ≈ g (R/r)²"
   }
  ],
  "gloss": "<b>Newton's Moon test.</b> The Moon, at r = 60 Earth radii, goes round in T = 27.32 days: to bend its path into that circle it must fall towards the Earth by <span class=\"cv\" data-v=\"moonOrbit\">…</span> mm/s². Gravity at the surface, weakened by (R/r)² = 1/3,600, gives <span class=\"cv\" data-v=\"moonG\">…</span> mm/s²<sup class=\"ref\"><a href=\"#s-phys-n4\">[4]</a></sup><sup class=\"ref\"><a href=\"#s-phys-n17\">[17]</a></sup>. The two agree to <span class=\"cv\" data-v=\"moonPct\">…</span> %; counting the Moon's own mass (the Earth and the Moon both turn about their common centre, so G(M+m) in place of GM) gives <span class=\"cv\" data-v=\"moonGpair\">…</span> mm/s². The same force makes apples fall and keeps the Moon in orbit."
 },
 ...MECH,   // la mécanique (2026-10-27) : forces, poulies, chocs, magnétisme, balistique
 {
  "t": "h2",
  "k": "phys-h2circ",
  "html": "Circular motion and angular velocity"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "phys-fx-omega",
  "fig": "physFxOmega",
  "lines": [
   {
    "tex": "\\g{\\omega = \\frac{d\\theta}{dt} = \\frac{2\\pi}{T}},\\qquad v = \\omega\\,r",
    "fallback": "ω = dθ/dt = 2π/T, v = ω r"
   }
  ],
  "gloss": "<b>Angular velocity.</b> ω (omega) is how fast an angle turns, in radians per second; T is the time for one turn. Every point of a turning body has the same ω, but its speed v grows with its distance r from the axis. For the Earth, ω = 7.292 × 10⁻⁵ rad/s<sup class=\"ref\"><a href=\"#s-phys-n11\">[11]</a></sup>: one turn in <span class=\"cv\" data-v=\"tSid\">…</span> s. The <a class=\"xref\" href=\"#tab-rot\" data-xref=\"rot\">Rotation</a> tab measures ω with ring lasers and gyroscopes, the <a class=\"xref\" href=\"#tab-scale\" data-xref=\"scale\">Scale</a> tab shows it as a clock hand."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "phys-fx-centri",
  "fig": "physFxCentri",
  "lines": [
   {
    "tex": "\\g{a_c = \\frac{v^2}{r} = \\omega^2 r},\\ \\text{towards the centre}",
    "fallback": "a_c = v²/r = ω² r, towards the centre"
   }
  ],
  "gloss": "<b>Turning at constant speed is accelerating.</b> The speed keeps its size but not its direction: between two instants, the difference Δv of the velocity arrows points to the centre. Seen from the inertial frame that is a centripetal acceleration, provided by a force (the string of a sling, gravity for the Moon)<sup class=\"ref\"><a href=\"#s-phys-n19\">[19]</a></sup>; seen from the turning frame it appears as the centrifugal force of the previous section, the same size and the opposite way. At the equator, ω²R = <span class=\"cv\" data-v=\"aEq\">…</span> m/s², <span class=\"cv\" data-v=\"aEqPct\">…</span> % of g."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "phys-fx-sidereal",
  "fig": "physFxSidereal",
  "lines": [
   {
    "tex": "\\g{\\frac{1}{T_\\text{sid}} = \\frac{1}{T_\\text{sol}} + \\frac{1}{T_\\text{year}}}\\ \\Rightarrow\\ T_\\text{sid} \\approx 86\\,164\\ \\text{s}",
    "fallback": "1/T_sid = 1/T_sol + 1/T_year ⇒ T_sid ≈ 86,164 s"
   }
  ],
  "gloss": "<b>Two kinds of day.</b> The solar day (86,400 s, noon to noon) is a turn relative to the Sun; the sidereal day is a turn relative to the stars. Because the Earth also moves along its orbit, it has to turn a little more than once to face the Sun again: in a year it turns 366.24 times relative to the stars for 365.24 noons. With T_sol = 86,400 s and T_year = 365.2422 days, T_sid = <span class=\"cv\" data-v=\"tSidCalc\">…</span> s. This is why the stars rise four minutes earlier every night (<a class=\"xref\" href=\"#tab-star\" data-xref=\"star\">Star trails</a>)."
 },
 {
  "t": "h2",
  "k": "phys-h2energy",
  "html": "Energy, momentum and angular momentum"
 },
 {
  "t": "notes",
  "k": "phys-energy1",
  "html": "<b>Three quantities that do not change.</b> In an isolated system, three totals stay constant whatever happens inside: the energy, the momentum (mass times velocity) and the angular momentum (the “amount of turning”). They follow from Newton's laws and save solving the motion step by step: knowing what is conserved often gives the answer directly."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "phys-fx-energy",
  "fig": "physFxEnergy",
  "lines": [
   {
    "tex": "\\g{E = \\tfrac12\\,m v^2 + m g h = \\text{constant}},\\qquad E_p = -\\frac{G M m}{r}",
    "fallback": "E = ½ m v² + m g h = constant, E_p = −GMm/r"
   }
  ],
  "gloss": "The kinetic energy ½mv² is the energy of motion, the potential energy mgh that of height near the ground (in joules, J = kg·m²/s²). A ball dropped from h trades one for the other and reaches the ground at v = √(2gh), whatever its mass. Far from the ground, where g is no longer constant, the potential energy is −GMm/r: zero at infinity, negative when bound."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "phys-fx-mom",
  "fig": "physFxMom",
  "lines": [
   {
    "tex": "\\g{\\vec p = m\\,\\vec v},\\qquad \\vec p_1 + \\vec p_2 = \\text{constant}\\ \\Rightarrow\\ m_1 v_1 = -m_2 v_2",
    "fallback": "p = m v, p₁ + p₂ = constant ⇒ m₁v₁ = −m₂v₂"
   }
  ],
  "gloss": "Two skaters at rest push each other apart: the total momentum was zero and stays zero, so the lighter one goes faster, the opposite way. A rocket works the same way with its exhaust gases, which is why it needs no air to push against."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "phys-fx-kep2",
  "fig": "physFxKep2",
  "lines": [
   {
    "tex": "\\g{L = m\\,r^2\\,\\dot\\theta = \\text{constant}}\\ \\Leftrightarrow\\ \\frac{dA}{dt} = \\frac{r^2\\dot\\theta}{2} = \\text{constant}",
    "fallback": "L = m r² θ̇ = constant ⇔ dA/dt = r²θ̇/2 = constant"
   }
  ],
  "gloss": "<b>Kepler's second law</b> (1609): the line from the Sun to a planet sweeps equal areas in equal times<sup class=\"ref\"><a href=\"#s-phys-n9\">[9]</a></sup>. It is the conservation of angular momentum L under a force aimed at the Sun: close in (small r), the planet turns faster (large θ̇). The Earth is fastest in early January, at perihelion, which is one reason the seasons do not have the same length (<a class=\"xref\" href=\"#tab-orb\" data-xref=\"orb\">Orbit</a>)."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "phys-fx-kep3",
  "fig": "physFxKep3",
  "lines": [
   {
    "tex": "\\g{T^2 = \\frac{4\\pi^2}{G(M+m)}\\,a^3}",
    "fallback": "T² = 4π² a³ / (G(M+m))"
   }
  ],
  "gloss": "<b>Kepler's third law</b> (1619), as Newton derived it: the square of the period grows as the cube of the orbit's size a (half the long axis of the ellipse)<sup class=\"ref\"><a href=\"#s-phys-n9\">[9]</a></sup><sup class=\"ref\"><a href=\"#s-phys-n4\">[4]</a></sup>. With the Earth's GM, a GPS satellite at a = 26,560 km goes round in <span class=\"cv\" data-v=\"tGps\">…</span> h, half a sidereal day (<a class=\"xref\" href=\"#tab-sat\" data-xref=\"sat\">Satellites</a>); the Moon, with GM alone, in <span class=\"cv\" data-v=\"tMoon\">…</span> days, and with G(M+m) in <span class=\"cv\" data-v=\"tMoonPair\">…</span> days, against <span class=\"cv\" data-v=\"tMoonObs\">…</span> observed."
 },
 {
  "t": "people",
  "ids": [
   "kepler"
  ]
 },
 {
  "t": "h2",
  "k": "phys-h2waves",
  "html": "Waves and light"
 },
 {
  "t": "notes",
  "k": "phys-waves1",
  "html": "<b>A wave carries energy without carrying matter.</b> The sea swell, sound, the seismic waves of the <a class=\"xref\" href=\"#tab-seis\" data-xref=\"seis\">Seismology</a> tab, the pressure wave of Hunga Tonga (<a class=\"xref\" href=\"#tab-atmo\" data-xref=\"atmo\">Atmosphere</a>), radio and light are all waves: a disturbance that travels while each point only oscillates about its place. Light needs no medium and goes at c in vacuum, slower in air, water or glass."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "phys-fx-wave",
  "fig": "physFxWave",
  "lines": [
   {
    "tex": "\\g{v = \\lambda\\,f = \\frac{\\lambda}{T}},\\qquad t = \\frac{d}{v}",
    "fallback": "v = λ f = λ/T, t = d/v"
   }
  ],
  "gloss": "λ (lambda) is the wavelength, the distance between two crests; f the frequency, the number of crests passing per second (hertz, Hz), and T = 1/f the period. In one period the wave advances one wavelength. The travel time over a distance d is d/v: the seismology and Tonga tabs read distances from such times."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "phys-fx-snell",
  "fig": "physFxSnell",
  "lines": [
   {
    "tex": "\\g{n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2},\\qquad n = \\frac{c}{v}",
    "fallback": "n₁ sin θ₁ = n₂ sin θ₂, n = c/v"
   }
  ],
  "gloss": "<b>Refraction.</b> When light passes into a medium where it is slower (higher index n), it bends towards the perpendicular<sup class=\"ref\"><a href=\"#s-phys-n15\">[15]</a></sup>. Air gets thinner with height, so its index slowly decreases upwards and a ray going nearly level bends gently downward, following the Earth's curve a little: that is atmospheric refraction, the subject of the <a class=\"xref\" href=\"#tab-ref\" data-xref=\"ref\">Refraction</a> tab. The site always shows it beside the unrefracted value."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "phys-fx-doppler",
  "fig": "physFxDoppler",
  "lines": [
   {
    "tex": "\\g{\\frac{\\Delta f}{f} \\approx -\\frac{v_r}{c}}\\quad (v_r \\ll c)",
    "fallback": "Δf/f ≈ −v_r/c (v_r ≪ c)"
   }
  ],
  "gloss": "<b>The Doppler effect</b> (1842)<sup class=\"ref\"><a href=\"#s-phys-n14\">[14]</a></sup>. A source moving away (v_r > 0) stretches its waves, so its frequency drops; one coming closer squeezes them, so it rises. That is the change in pitch of a passing siren. Only the speed along the line of sight, v_r, counts. Measured on starlight it gives the Earth's orbital speed (<a class=\"xref\" href=\"#tab-orb\" data-xref=\"orb\">Orbit</a>); on satellite radio signals, their orbits (<a class=\"xref\" href=\"#tab-sat\" data-xref=\"sat\">Satellites</a>)."
 },
 {
  "t": "h2",
  "k": "phys-h2const",
  "html": "Constants: defined, measured, and local"
 },
 {
  "t": "notes",
  "k": "phys-const1",
  "html": "<b>Not every “constant” is the same kind of number.</b> The seven constants of the SI are exact <i>by definition</i>: since 2019 the metre is the distance light travels in 1/299,792,458 s, so c cannot be measured any more, only used<sup class=\"ref\"><a href=\"#s-phys-n1\">[1]</a></sup>. The gravitational constant G is a universal constant that is <i>measured</i>, and is the least well known of all (2 parts in 100,000)<sup class=\"ref\"><a href=\"#s-phys-n2\">[2]</a></sup>. The Earth's GM, its rotation ω, its radius and the local g are <i>properties of one planet</i>, not universal constants: g changes from place to place, and the “standard” g<sub>n</sub> = 9.80665 m/s² is a convention adopted in 1901 for weighing, not a value found anywhere in particular<sup class=\"ref\"><a href=\"#s-phys-n16\">[16]</a></sup>. That last distinction is the site's purity rule: a measurement of the radius may never have used the radius (<a class=\"xref\" href=\"#tab-results\" data-xref=\"results\">Results</a>)."
 },
 {
  "t": "table",
  "id": "phys-tabConst",
  "tbody": "phys-tbConst",
  "k": "x:phys-cap-const",
  "caption": "The constants the site uses, and what kind each one is<sup class=\"ref\"><a href=\"#s-phys-n1\">[1]</a></sup><sup class=\"ref\"><a href=\"#s-phys-n2\">[2]</a></sup><sup class=\"ref\"><a href=\"#s-phys-n11\">[11]</a></sup><sup class=\"ref\"><a href=\"#s-phys-n12\">[12]</a></sup><sup class=\"ref\"><a href=\"#s-phys-n16\">[16]</a></sup>.",
  "head": [
   "Symbol",
   "Name",
   "Value",
   "Unit",
   "Kind"
  ]
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "phys-fx-metre",
  "fig": "physFxMetre",
  "lines": [
   {
    "tex": "\\g{1\\ \\text{m} = c \\times \\frac{1}{299\\,792\\,458}\\ \\text{s}},\\qquad 1\\ \\text{s} = \\frac{9\\,192\\,631\\,770}{\\Delta\\nu_\\text{Cs}}",
    "fallback": "1 m = c × (1/299,792,458) s, 1 s = 9,192,631,770 / Δν_Cs"
   }
  ],
  "gloss": "<b>A constant defines a unit.</b> The second is the duration of 9,192,631,770 oscillations of the radiation of the caesium-133 atom, the metre the distance light travels in 1/299,792,458 of that second. Any laboratory can rebuild them without a reference object. GPS clocks count these oscillations (<a class=\"xref\" href=\"#tab-gps\" data-xref=\"gps\">GPS</a>)."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "phys-fx-gvar",
  "fig": "physFxGvar",
  "lines": [
   {
    "tex": "\\g{g(\\varphi) \\approx \\frac{G M}{R^2} - \\omega^2 R \\cos^2\\varphi}\\quad \\text{(sphere, no flattening)}",
    "fallback": "g(φ) ≈ GM/R² − ω²R cos²φ (sphere, no flattening)"
   }
  ],
  "gloss": "<b>g is local.</b> On a turning sphere of radius 6,371 km, the centrifugal term lowers gravity from <span class=\"cv\" data-v=\"gPoleSph\">…</span> m/s² at the poles to <span class=\"cv\" data-v=\"gEqSph\">…</span> m/s² at the equator. Measured, it goes from <span class=\"cv\" data-v=\"gPole\">…</span> to <span class=\"cv\" data-v=\"gEq\">…</span> m/s²<sup class=\"ref\"><a href=\"#s-phys-n12\">[12]</a></sup>: the difference is larger because the Earth is also flattened, the equator being 21 km farther from the centre than the poles. Height, the rocks below and the tides change it further, in the fourth decimal and beyond (<a class=\"xref\" href=\"#tab-grav\" data-xref=\"grav\">Gravity</a>)."
 },
 {
  "t": "h2",
  "k": "phys-h2meas",
  "html": "Measurement, uncertainty and fitting"
 },
 {
  "t": "notes",
  "k": "phys-meas1",
  "html": "<b>A measurement is a value with its uncertainty.</b> Time the period of a 1 m pendulum twelve times with a stopwatch and you will not get the same number twice: your reaction time adds a random error each time. The mean is the best estimate; the spread around it, the standard deviation σ, says how far one measurement typically falls from it<sup class=\"ref\"><a href=\"#s-phys-n13\">[13]</a></sup>. The numbers in this section are <b>invented for the example</b>, not a measurement."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "phys-fx-sigma",
  "fig": "physFxSigma",
  "lines": [
   {
    "tex": "\\g{\\bar x = \\frac{1}{N}\\sum x_i},\\qquad \\sigma = \\sqrt{\\frac{\\sum (x_i - \\bar x)^2}{N-1}},\\qquad \\sigma_{\\bar x} = \\frac{\\sigma}{\\sqrt N}",
    "fallback": "x̄ = Σxᵢ/N, σ = √(Σ(xᵢ − x̄)²/(N−1)), σ_x̄ = σ/√N"
   }
  ],
  "gloss": "For the <span class=\"cv\" data-v=\"stN\">…</span> timings in the figure, x̄ = <span class=\"cv\" data-v=\"stMean\">…</span> s and σ = <span class=\"cv\" data-v=\"stSd\">…</span> s. The mean is better known than any single timing: its uncertainty is σ/√N = <span class=\"cv\" data-v=\"stSem\">…</span> s. With the pendulum law T = 2π√(L/g)<sup class=\"ref\"><a href=\"#s-phys-n19\">[19]</a></sup>, that gives g = 4π²L/T² = <span class=\"cv\" data-v=\"gSt\">…</span> ± <span class=\"cv\" data-v=\"gStErr\">…</span> m/s². About two thirds of the measurements fall within ±1σ of the mean, 95 % within ±2σ. A value 3σ away has a 0.3 % chance of being bad luck: that is the threshold the site uses to set an outlier aside, measuring σ on the <i>other</i> points, never on a percentage chosen afterwards."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "phys-fx-lsq",
  "fig": "physFxLsq",
  "lines": [
   {
    "tex": "\\g{\\chi^2 = \\sum_i \\left(\\frac{y_i - f(x_i)}{\\sigma_i}\\right)^2\\ \\text{minimal}}",
    "fallback": "χ² = Σ ((yᵢ − f(xᵢ))/σᵢ)² minimal"
   }
  ],
  "gloss": "<b>Least squares</b> (Legendre 1805, Gauss 1809)<sup class=\"ref\"><a href=\"#s-phys-n18\">[18]</a></sup>. To fit a model f to measured points, choose its parameters so that the sum of the squared gaps (the <i>residuals</i>), each divided by its uncertainty, is as small as possible. Here, T² against L for five pendulum lengths: the best line has a slope of <span class=\"cv\" data-v=\"fitB\">…</span> ± <span class=\"cv\" data-v=\"fitSb\">…</span> s²/m, and since T² = (4π²/g) L, g = <span class=\"cv\" data-v=\"gFit\">…</span> ± <span class=\"cv\" data-v=\"gFitErr\">…</span> m/s². Almost every result of the site is a fit of this kind, with both models fitted the same way; when the residuals of one model are much larger than the measurement uncertainty, that model does not describe the data."
 },
 {
  "t": "people",
  "ids": [
   "gauss"
  ]
 },
 {
  "t": "notes",
  "k": "phys-meas2",
  "html": "<b>Random and systematic errors.</b> Random errors scatter the measurements around the true value and shrink when they are averaged. A systematic error shifts them all the same way, a watch that runs fast, an uncorrected refraction, and averaging does nothing against it. Accuracy is closeness to the true value; precision is the closeness of the measurements to each other. The figure below shows the difference; the site's tabs say, for each result, which systematic errors they checked and which they could not."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"physFigTargets\"></div></div>"
 },
 {
  "t": "fcap",
  "k": "physFigTargets-cap",
  "html": "<b>Precision and accuracy.</b> Four sets of shots at a target whose centre is the true value. Left to right: scattered and off-centre; tight but off-centre (precise, with a systematic error); scattered but centred (accurate on average, imprecise); tight and centred."
 },
 {
  "t": "h2",
  "k": "phys-h2dem",
  "html": "Terrain models: LiDAR, elevation grids and smoothing"
 },
 {
  "t": "notes",
  "k": "phys-dem1",
  "html": "<b>Where the ground comes from.</b> Every horizon, skyline or hidden summit on the site that involves real ground is read from a digital elevation model, a grid of heights, never drawn by hand. In France: the IGN's LiDAR HD, the bare ground measured by airborne laser on a 1 m grid<sup class=\"ref\"><a href=\"#s-phys-n30\">[30]</a></sup>. Where it has no data: the IGN's RGE ALTI, 1 m, assembled from older surveys<sup class=\"ref\"><a href=\"#s-phys-n31\">[31]</a></sup>. In Austria: the BEV's 1 m laser model<sup class=\"ref\"><a href=\"#s-phys-n32\">[32]</a></sup>. Elsewhere, and more than 45 km from a French viewpoint: Copernicus GLO-30, a 30 m grid measured by radar satellites, which is a <i>surface</i> model, trees and roofs included<sup class=\"ref\"><a href=\"#s-phys-n33\">[33]</a></sup> (its 90 m version for a few very distant horizons). Each gap is filled by the next model in that order, and where none has a value, by the sea at 0 m."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"physAnimDem\" style=\"height:clamp(380px,calc(660px - 30vw),500px)\"></canvas></div>"
 },
 {
  "t": "fcap",
  "k": "physAnimDem-cap",
  "html": "<b>A terrain model is a mesh.</b> An invented summit, drawn at true scale. The grid first has a node every 5 m, then every 10, 20 and 40 m: at each step the nodes that go (red) come down onto the surface of the coarser grid, and the summit read on the mesh (blue, on the section through the summit) drops below the real one (black), because the sharp top falls between nodes. Then the nodes come back. Last, a patch of the 5 m grid has no data, like the LiDAR HD on the summit of Mont Agel, and another model fills it (amber): coarser, made another way, and here 8 m higher on average, so it does not meet the first one at the edges and gives yet another summit. Each node takes the height of the ground at its point; the other model, the mean of its cell. The heights are invented for the example."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "phys-fx-bilin",
  "fig": "physFxBilin",
  "lines": [
   {
    "tex": "\\g{z = (1-u)(1-v)\\,z_{00} + u(1-v)\\,z_{10} + (1-u)\\,v\\,z_{01} + u\\,v\\,z_{11}},\\qquad u = \\frac{x - x_0}{\\Delta},\\ \\ v = \\frac{y - y_0}{\\Delta}",
    "fallback": "z = (1−u)(1−v) z₀₀ + u(1−v) z₁₀ + (1−u) v z₀₁ + u v z₁₁, u = (x − x₀)/Δ, v = (y − y₀)/Δ"
   }
  ],
  "gloss": "<b>How the site reads between nodes.</b> Δ is the grid step; the point (x, y) lies at fractions u and v of the cell, and its height is the mean of the four corner heights, each weighted by how close it is. The four weights add up to 1, so the result never goes above the highest node: a summit is only as high as the nodes that land on it. That is the smoothing; it is why the summit of a 30 m model can be tens of metres below the real one, and the 1 m LiDAR only centimetres<sup class=\"ref\"><a href=\"#s-phys-n30\">[30]</a></sup><sup class=\"ref\"><a href=\"#s-phys-n33\">[33]</a></sup>."
 },
 {
  "t": "notes",
  "k": "phys-dem2",
  "html": "<b>Why a model's summit often comes out lower than the published height.</b> Three reasons, which mostly push the same way. <i>The grid.</i> A model stores one height per cell, and the site reads between the four nearest cells (bilinear interpolation): a summit sharper than a cell is averaged with its own slopes. That is the smoothing. On a 1 m grid it costs centimetres; on a 30 m grid it can cost tens of metres on a pointed peak. To limit it, the skylines of the French and Austrian viewpoints are read twice: every 25 m along each line of sight on a 30 m grid, then again at 1 m around every point that could make the skyline; the script refuses to write a profile if a fine reading rises above the coarse one by more than the margin it allows for. <i>What is measured.</i> A bare-ground model has no cairn, pillar, building or tree, while a published height is usually that of a survey mark, and can be older than the works done on a summit; a surface model has the opposite bias. <i>The rays.</i> A profile is a set of lines of sight one step of azimuth apart: a narrow summit can fall between two of them, and it is that step, not the model, that sets the resolution there."
 },
 {
  "t": "notes",
  "k": "phys-dem3",
  "html": "<b>The rule.</b> What the site draws and computes uses the model's height, the same reading for the plane and for the globe, so that any difference between the two comes from geometry and never from sampling. A model's value is never replaced by a published one, nor “corrected” by hand. Where the two differ by more than a few metres, the page gives both, names the model, and says what the published height would change; a page that does not is a mistake to report. At 40 km, 15 m of height is about 1.3′, and it moves a summit by the same amount on both models."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "",
  "id": "",
  "k": "x:phys-tab-agel",
  "html": "<table class=\"cnav-table\"><caption>Mont Agel: the height each source gives, around the published summit (43.7708° N, 7.4197° E)<sup class=\"ref\"><a href=\"#s-phys-n34\">[34]</a></sup>.</caption><thead><tr><th>Source</th><th>Height</th><th>What it is</th></tr></thead><tbody>\n<tr><td>Wikipédia (FR), September 2026</td><td class=\"num\">1,148 m</td><td>published</td></tr>\n<tr><td>Wikipédia (FR), November 2026, after the Géoportail</td><td class=\"num\">1,151 m</td><td>published</td></tr>\n<tr><td>IGN LiDAR HD<sup class=\"ref\"><a href=\"#s-phys-n30\">[30]</a></sup></td><td class=\"num\">1,127 m</td><td>bare ground, highest point outside the gap; 1,120 m at the published point</td></tr>\n<tr><td>IGN RGE ALTI<sup class=\"ref\"><a href=\"#s-phys-n31\">[31]</a></sup>, inside the gap</td><td class=\"num\">1,133 m</td><td>what the site uses</td></tr>\n<tr><td>IGN RGE ALTI, around the summit</td><td class=\"num\">1,138 m</td><td>1,137 m at the published point</td></tr>\n<tr><td>Copernicus GLO-30<sup class=\"ref\"><a href=\"#s-phys-n33\">[33]</a></sup></td><td class=\"num\">1,145 m</td><td>surface, buildings included, 30 m cells</td></tr>\n</tbody></table>"
 },
 {
  "t": "notes",
  "k": "phys-dem4",
  "html": "<b>An example: Mont Agel, seen from the plateau de Caussols</b> (<a class=\"xref\" href=\"#tab-dip\" data-xref=\"dip\">Dip of the horizon</a>, <a class=\"xref\" href=\"#tab-elev\" data-xref=\"elev\">Elevation angles</a>). The LiDAR HD has no data over 0.13 km² of the summit, which carries military air-detection installations<sup class=\"ref\"><a href=\"#s-phys-n34\">[34]</a></sup>; around that gap the RGE ALTI stands up to 30 m above the LiDAR, while elsewhere the two agree within a metre. The data do not say which is right on the summit itself, so the site does not choose by hand: it uses its usual reading, 1,133 m, and says so. Every height in the table gives the same answer: from 1,210 m, on a plane, Mont Agel lies between 5′ (1,151 m) and 8′ (1,119 m) below the horizon, which is at eye level; on the refracted globe, between 45′ and 48′ above the sea horizon. The photograph shows it 42′ above."
 },
 {
  "t": "xrefs",
  "keys": [
   "rot",
   "grav",
   "fou",
   "orb",
   "sat",
   "ref",
   "results",
   "dip",
   "elev"
  ],
  "wide": false
 },
 {
  "t": "sources"
 }
];
