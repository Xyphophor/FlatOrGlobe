// Prose de l'onglet math (2026-11-27, propriétaire : « séparer l'onglet basics en deux onglets math et physics ») : les outils
// mathématiques sortis de l'onglet phys (angles, vecteurs, dérivées, mesure et ajustement, modèles de terrain), en anglais (source).
// Valeurs : span.cv[data-v] remplis par index.js depuis src/tabs/phys/logic.js (l'exemple du pendule y reste).
export const PROSE = [
 {
  "t": "eyebrow",
  "k": "math-eyebrow",
  "html": "Math · the tools the other tabs use"
 },
 {
  "t": "h1",
  "k": "math-h1",
  "html": "The mathematics: angles, vectors, derivatives, uncertainty and terrain grids"
 },
 {
  "t": "lead",
  "opener": true,
  "k": "math-lead",
  "html": "The other tabs measure angles in minutes of arc, add arrows end to end, write <i>dθ/dt</i> or <i>3σ</i>, fit straight lines and read heights from grids, without stopping to explain how. This tab gathers those tools in one place, each with its formula and a figure, and says where on the site it is used. The physics they serve, units, motion, Newton's laws and the constants, is in the <a class=\"xref\" href=\"#tab-phys\" data-xref=\"phys\">Physics</a> tab. Nothing here is a measurement, and nothing here takes sides: the same mathematics serves both models."
 },
 {
  "t": "h2",
  "k": "math-h2angles",
  "html": "Angles and radians"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "math-fx-rad",
  "fig": "mathFxRad",
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
  "k": "math-fx-small",
  "fig": "mathFxSmall",
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
  "k": "math-h2vec",
  "html": "Vectors: adding arrows"
 },
 {
  "t": "notes",
  "k": "math-kin2",
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
  "k": "math-fx-chasles",
  "fig": "mathFxChasles",
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
  "k": "math-fx-comp",
  "fig": "mathFxComp",
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
  "k": "math-fx-sub",
  "fig": "mathFxSub",
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
  "k": "math-h2deriv",
  "html": "Derivatives: one idea, several notations"
 },
 {
  "t": "notes",
  "k": "math-deriv1",
  "html": "<b>A derivative is a rate of change at one instant.</b> Shrink the interval Δt of the mean velocity (<a class=\"xref\" href=\"#tab-phys/phys-h2kin\" data-xref=\"phys\" data-sec=\"phys-h2kin\">Physics</a>) towards zero: the chord turns into the tangent to the curve, and its slope is the instantaneous velocity. Newton and Leibniz found this independently in the 1660s–1680s and wrote it differently; Lagrange later added a third way<sup class=\"ref\"><a href=\"#s-math-n1\">[1]</a></sup><sup class=\"ref\"><a href=\"#s-math-n2\">[2]</a></sup><sup class=\"ref\"><a href=\"#s-math-n3\">[3]</a></sup>. All three are still in use, often on the same page, and they mean exactly the same thing."
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
  "k": "math-fx-tangent",
  "fig": "mathFxTangent",
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
  "k": "x:math-tab-deriv",
  "html": "<table class=\"cnav-table\"><caption>The notations, how they are read, and where the site uses them.</caption><thead><tr><th>Written</th><th>Read</th><th>Means</th><th>On this site</th></tr></thead><tbody>\n<tr><td>Δx</td><td>delta x</td><td>a finite change of x</td><td>everywhere</td></tr>\n<tr><td>dx/dt</td><td>d x d t (Leibniz)</td><td>rate of change of x with t</td><td><a class=\"xref\" href=\"#tab-rot\" data-xref=\"rot\">Rotation</a>, <a class=\"xref\" href=\"#tab-orb\" data-xref=\"orb\">Orbit</a></td></tr>\n<tr><td>ẋ, ẍ</td><td>x dot, x double dot (Newton)</td><td>first, second derivative in time</td><td>θ̇ of Kepler in <a class=\"xref\" href=\"#tab-orb\" data-xref=\"orb\">Orbit</a></td></tr>\n<tr><td>f′(x), f″(x)</td><td>f prime, f second (Lagrange)</td><td>derivative of f, whatever the variable</td><td><a class=\"xref\" href=\"#tab-curv\" data-xref=\"curv\">Horizon curve</a></td></tr>\n<tr><td>∂f/∂x</td><td>partial f partial x</td><td>derivative in x, the other variables held fixed</td><td><a class=\"xref\" href=\"#tab-grav\" data-xref=\"grav\">Gravity</a>, <a class=\"xref\" href=\"#tab-mag\" data-xref=\"mag\">Magnetism</a></td></tr>\n<tr><td>∇f</td><td>nabla f, gradient</td><td>the vector of all partial derivatives: steepest slope</td><td><a class=\"xref\" href=\"#tab-grav\" data-xref=\"grav\">Gravity</a>, <a class=\"xref\" href=\"#tab-atmo\" data-xref=\"atmo\">Atmosphere</a></td></tr>\n<tr><td>∫ f dt</td><td>integral of f d t</td><td>the sum of f dt: the area under f, the reverse of a derivative</td><td><a class=\"xref\" href=\"#tab-ref\" data-xref=\"ref\">Refraction</a> (ray tracing)</td></tr>\n<tr><td>Σ</td><td>sigma, sum</td><td>add up the terms</td><td>every fit (<a class=\"xref\" href=\"#tab-results\" data-xref=\"results\">Results</a>)</td></tr></tbody></table>"
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "math-fx-area",
  "fig": "mathFxArea",
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
  "k": "math-fx-grad",
  "fig": "mathFxGrad",
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
  "k": "math-h2meas",
  "html": "Measurement, uncertainty and fitting"
 },
 {
  "t": "notes",
  "k": "math-meas1",
  "html": "<b>A measurement is a value with its uncertainty.</b> Time the period of a 1 m pendulum twelve times with a stopwatch and you will not get the same number twice: your reaction time adds a random error each time. The mean is the best estimate; the spread around it, the standard deviation σ, says how far one measurement typically falls from it<sup class=\"ref\"><a href=\"#s-math-n4\">[4]</a></sup>. The numbers in this section are <b>invented for the example</b>, not a measurement."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "math-fx-sigma",
  "fig": "mathFxSigma",
  "lines": [
   {
    "tex": "\\g{\\bar x = \\frac{1}{N}\\sum x_i},\\qquad \\sigma = \\sqrt{\\frac{\\sum (x_i - \\bar x)^2}{N-1}},\\qquad \\sigma_{\\bar x} = \\frac{\\sigma}{\\sqrt N}",
    "fallback": "x̄ = Σxᵢ/N, σ = √(Σ(xᵢ − x̄)²/(N−1)), σ_x̄ = σ/√N"
   }
  ],
  "gloss": "For the <span class=\"cv\" data-v=\"stN\">…</span> timings in the figure, x̄ = <span class=\"cv\" data-v=\"stMean\">…</span> s and σ = <span class=\"cv\" data-v=\"stSd\">…</span> s. The mean is better known than any single timing: its uncertainty is σ/√N = <span class=\"cv\" data-v=\"stSem\">…</span> s. With the pendulum law T = 2π√(L/g)<sup class=\"ref\"><a href=\"#s-math-n5\">[5]</a></sup>, that gives g = 4π²L/T² = <span class=\"cv\" data-v=\"gSt\">…</span> ± <span class=\"cv\" data-v=\"gStErr\">…</span> m/s². About two thirds of the measurements fall within ±1σ of the mean, 95 % within ±2σ. A value 3σ away has a 0.3 % chance of being bad luck: that is the threshold the site uses to set an outlier aside, measuring σ on the <i>other</i> points, never on a percentage chosen afterwards."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "math-fx-lsq",
  "fig": "mathFxLsq",
  "lines": [
   {
    "tex": "\\g{\\chi^2 = \\sum_i \\left(\\frac{y_i - f(x_i)}{\\sigma_i}\\right)^2\\ \\text{minimal}}",
    "fallback": "χ² = Σ ((yᵢ − f(xᵢ))/σᵢ)² minimal"
   }
  ],
  "gloss": "<b>Least squares</b> (Legendre 1805, Gauss 1809)<sup class=\"ref\"><a href=\"#s-math-n6\">[6]</a></sup>. To fit a model f to measured points, choose its parameters so that the sum of the squared gaps (the <i>residuals</i>), each divided by its uncertainty, is as small as possible. Here, T² against L for five pendulum lengths: the best line has a slope of <span class=\"cv\" data-v=\"fitB\">…</span> ± <span class=\"cv\" data-v=\"fitSb\">…</span> s²/m, and since T² = (4π²/g) L, g = <span class=\"cv\" data-v=\"gFit\">…</span> ± <span class=\"cv\" data-v=\"gFitErr\">…</span> m/s². Almost every result of the site is a fit of this kind, with both models fitted the same way; when the residuals of one model are much larger than the measurement uncertainty, that model does not describe the data."
 },
 {
  "t": "people",
  "ids": [
   "gauss"
  ]
 },
 {
  "t": "notes",
  "k": "math-meas2",
  "html": "<b>Random and systematic errors.</b> Random errors scatter the measurements around the true value and shrink when they are averaged. A systematic error shifts them all the same way, a watch that runs fast, an uncorrected refraction, and averaging does nothing against it. Accuracy is closeness to the true value; precision is the closeness of the measurements to each other. The figure below shows the difference; the site's tabs say, for each result, which systematic errors they checked and which they could not."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><div class=\"figsym\" id=\"mathFigTargets\"></div></div>"
 },
 {
  "t": "fcap",
  "k": "mathFigTargets-cap",
  "html": "<b>Precision and accuracy.</b> Four sets of shots at a target whose centre is the true value. Left to right: scattered and off-centre; tight but off-centre (precise, with a systematic error); scattered but centred (accurate on average, imprecise); tight and centred."
 },
 {
  "t": "notes",
  "k": "math-meas3",
  "html": "<b>Two checks on a fit, used across this site.</b> A fitted line always gives a number, even through points that do not follow it. Two numbers say whether the line deserves it. The correlation r says how closely y follows x along a line, with no model and no unit: near 1 when it does, near 0 when x tells nothing about y. It needs more than two points: through two, any line is perfect and r is ±1."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "math-fx-corr",
  "fig": "mathFxCorr",
  "lines": [
   {
    "tex": "\\g{r = \\frac{\\sum (x_i - \\bar x)(y_i - \\bar y)}{\\sqrt{\\sum (x_i - \\bar x)^2\\,\\sum (y_i - \\bar y)^2}}}",
    "fallback": "r = Σ(xᵢ − x̄)(yᵢ − ȳ) / √(Σ(xᵢ − x̄)² Σ(yᵢ − ȳ)²)"
   }
  ],
  "gloss": "<b>Pearson's correlation</b>. xᵢ, yᵢ are the N points, x̄ and ȳ their means; r runs from −1 to 1. It does not depend on the units or on any model of what links x to y; it does not say whether the line passes through zero, nor how large the slope is."
 },
 {
  "t": "notes",
  "k": "math-meas4",
  "html": "<b>What each one says.</b> χ²/ν compares the scatter of the points around the fitted line with their known uncertainty σ. Close to 1, the line is as good as the measurements allow. Much larger, the line does not fit, or something adds errors that σ does not hold. Much smaller, σ was overestimated. It needs σ known apart from the fit: where a survey or a bulletin prints no reading error, this site gives r and the raw scatter, with its unit, and says why there is no χ²/ν. On a flat surface a radius calculation fails in one of two ways: r falls to zero (no curvature to find), or χ²/ν climbs (the flat model's own signal fits no single radius); the <a class=\"xref\" href=\"#tab-kappa\" data-xref=\"kappa\">curvature tab</a> shows both, reading by reading."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "math-fx-chi",
  "fig": "mathFxChi",
  "lines": [
   {
    "tex": "\\g{\\frac{\\chi^2}{\\nu} = \\frac{1}{N - p}\\sum_i \\left(\\frac{y_i - f(x_i)}{\\sigma_i}\\right)^2}",
    "fallback": "χ²/ν = Σ((yᵢ − f(xᵢ))/σᵢ)² / (N − p)"
   }
  ],
  "gloss": "<b>Chi-squared per degree of freedom</b>. f is the fitted model, p its number of free parameters, ν = N − p the degrees of freedom, σᵢ the uncertainty of point i, known before the fit. Each residual divided by its σ is typically about 1 if the model is right, so χ²/ν is about 1, give or take √(2/ν)."
 },
 {
  "t": "h2",
  "k": "math-h2dem",
  "html": "Terrain models: LiDAR, elevation grids and smoothing"
 },
 {
  "t": "notes",
  "k": "math-dem1",
  "html": "<b>Where the ground comes from.</b> Every horizon, skyline or hidden summit on the site that involves real ground is read from a digital elevation model, a grid of heights, never drawn by hand. In France: the IGN's LiDAR HD, the bare ground measured by airborne laser on a 1 m grid<sup class=\"ref\"><a href=\"#s-math-n7\">[7]</a></sup>. Where it has no data: the IGN's RGE ALTI, 1 m, assembled from older surveys<sup class=\"ref\"><a href=\"#s-math-n8\">[8]</a></sup>. In Austria: the BEV's 1 m laser model<sup class=\"ref\"><a href=\"#s-math-n9\">[9]</a></sup>. Elsewhere, and more than 45 km from a French viewpoint: Copernicus GLO-30, a 30 m grid measured by radar satellites, which is a <i>surface</i> model, trees and roofs included<sup class=\"ref\"><a href=\"#s-math-n10\">[10]</a></sup> (its 90 m version for a few very distant horizons). Each gap is filled by the next model in that order, and where none has a value, by the sea at 0 m."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "fig",
  "id": "",
  "html": "<div class=\"fig\"><canvas id=\"mathAnimDem\" style=\"height:clamp(380px,calc(660px - 30vw),500px)\"></canvas></div>"
 },
 {
  "t": "fcap",
  "k": "mathAnimDem-cap",
  "html": "<b>A terrain model is a mesh.</b> An invented summit, drawn at true scale. The grid first has a node every 5 m, then every 10, 20 and 40 m: at each step the nodes that go (red) come down onto the surface of the coarser grid, and the summit read on the mesh (blue, on the section through the summit) drops below the real one (black), because the sharp top falls between nodes. Then the nodes come back. Last, a patch of the 5 m grid has no data, like the LiDAR HD on the summit of Mont Agel, and another model fills it (amber): coarser, made another way, and here 8 m higher on average, so it does not meet the first one at the edges and gives yet another summit. Each node takes the height of the ground at its point; the other model, the mean of its cell. The heights are invented for the example."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "math-fx-bilin",
  "fig": "mathFxBilin",
  "lines": [
   {
    "tex": "\\g{z = (1-u)(1-v)\\,z_{00} + u(1-v)\\,z_{10} + (1-u)\\,v\\,z_{01} + u\\,v\\,z_{11}},\\qquad u = \\frac{x - x_0}{\\Delta},\\ \\ v = \\frac{y - y_0}{\\Delta}",
    "fallback": "z = (1−u)(1−v) z₀₀ + u(1−v) z₁₀ + (1−u) v z₀₁ + u v z₁₁, u = (x − x₀)/Δ, v = (y − y₀)/Δ"
   }
  ],
  "gloss": "<b>How the site reads between nodes.</b> Δ is the grid step; the point (x, y) lies at fractions u and v of the cell, and its height is the mean of the four corner heights, each weighted by how close it is. The four weights add up to 1, so the result never goes above the highest node: a summit is only as high as the nodes that land on it. That is the smoothing; it is why the summit of a 30 m model can be tens of metres below the real one, and the 1 m LiDAR only centimetres<sup class=\"ref\"><a href=\"#s-math-n7\">[7]</a></sup><sup class=\"ref\"><a href=\"#s-math-n10\">[10]</a></sup>."
 },
 {
  "t": "notes",
  "k": "math-dem2",
  "html": "<b>Why a model's summit often comes out lower than the published height.</b> Three reasons, which mostly push the same way. <i>The grid.</i> A model stores one height per cell, and the site reads between the four nearest cells (bilinear interpolation): a summit sharper than a cell is averaged with its own slopes. That is the smoothing. On a 1 m grid it costs centimetres; on a 30 m grid it can cost tens of metres on a pointed peak. To limit it, the skylines of the French and Austrian viewpoints are read twice: every 25 m along each line of sight on a 30 m grid, then again at 1 m around every point that could make the skyline; the script refuses to write a profile if a fine reading rises above the coarse one by more than the margin it allows for. <i>What is measured.</i> A bare-ground model has no cairn, pillar, building or tree, while a published height is usually that of a survey mark, and can be older than the works done on a summit; a surface model has the opposite bias. <i>The rays.</i> A profile is a set of lines of sight one step of azimuth apart: a narrow summit can fall between two of them, and it is that step, not the model, that sets the resolution there."
 },
 {
  "t": "notes",
  "k": "math-dem3",
  "html": "<b>The rule.</b> What the site draws and computes uses the model's height, the same reading for the plane and for the globe, so that any difference between the two comes from geometry and never from sampling. A model's value is never replaced by a published one, nor “corrected” by hand. Where the two differ by more than a few metres, the page gives both, names the model, and says what the published height would change; a page that does not is a mistake to report. At 40 km, 15 m of height is about 1.3′, and it moves a summit by the same amount on both models."
 },
 {
  "t": "raw",
  "tag": "div",
  "class": "",
  "id": "",
  "k": "x:math-tab-agel",
  "html": "<table class=\"cnav-table\"><caption>Mont Agel: the height each source gives, around the published summit (43.7708° N, 7.4197° E)<sup class=\"ref\"><a href=\"#s-math-n11\">[11]</a></sup>.</caption><thead><tr><th>Source</th><th>Height</th><th>What it is</th></tr></thead><tbody>\n<tr><td>Wikipédia (FR), September 2026</td><td class=\"num\">1,148 m</td><td>published</td></tr>\n<tr><td>Wikipédia (FR), November 2026, after the Géoportail</td><td class=\"num\">1,151 m</td><td>published</td></tr>\n<tr><td>IGN LiDAR HD<sup class=\"ref\"><a href=\"#s-math-n7\">[7]</a></sup></td><td class=\"num\">1,127 m</td><td>bare ground, highest point outside the gap; 1,120 m at the published point</td></tr>\n<tr><td>IGN RGE ALTI<sup class=\"ref\"><a href=\"#s-math-n8\">[8]</a></sup>, inside the gap</td><td class=\"num\">1,133 m</td><td>what the site uses</td></tr>\n<tr><td>IGN RGE ALTI, around the summit</td><td class=\"num\">1,138 m</td><td>1,137 m at the published point</td></tr>\n<tr><td>Copernicus GLO-30<sup class=\"ref\"><a href=\"#s-math-n10\">[10]</a></sup></td><td class=\"num\">1,145 m</td><td>surface, buildings included, 30 m cells</td></tr>\n</tbody></table>"
 },
 {
  "t": "notes",
  "k": "math-dem4",
  "html": "<b>An example: Mont Agel, seen from the plateau de Caussols</b> (<a class=\"xref\" href=\"#tab-dip\" data-xref=\"dip\">Dip of the horizon</a>, <a class=\"xref\" href=\"#tab-elev\" data-xref=\"elev\">Elevation angles</a>). The LiDAR HD has no data over 0.13 km² of the summit, which carries military air-detection installations<sup class=\"ref\"><a href=\"#s-math-n11\">[11]</a></sup>; around that gap the RGE ALTI stands up to 30 m above the LiDAR, while elsewhere the two agree within a metre. The data do not say which is right on the summit itself, so the site does not choose by hand: it uses its usual reading, 1,133 m, and says so. Every height in the table gives the same answer: from 1,210 m, on a plane, Mont Agel lies between 5′ (1,151 m) and 8′ (1,119 m) below the horizon, which is at eye level; on the refracted globe, between 45′ and 48′ above the sea horizon. The photograph shows it 42′ above."
 },
 {
  "t": "xrefs",
  "keys": [
   "phys",
   "kappa",
   "results",
   "dip",
   "elev",
   "ref",
   "avia",
   "grav"
  ],
  "wide": false
 },
 {
  "t": "sources"
 }
];
