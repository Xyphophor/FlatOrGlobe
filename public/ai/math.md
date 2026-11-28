# The mathematics: angles, vectors, derivatives, uncertainty and terrain grids

> Tab "Math" of *Flat plane or Globe?*. Web page: /#tab-math. Generated from the rendered page: same text, same computed numbers and sources; drawings are replaced by their captions and descriptions, formulas are TeX. Licence: content and data CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), Xyphophor (https://x.com/Xyphophor); source code MIT; third-party data keep the licence of their source, cited in each tab.

*Math · the tools the other tabs use*

The other tabs measure angles in minutes of arc, add arrows end to end, write *dθ/dt* or *3σ*, fit straight lines and read heights from grids, without stopping to explain how. This tab gathers those tools in one place, each with its formula and a figure, and says where on the site it is used. The physics they serve, units, motion, Newton's laws and the constants, is in the [Physics](/ai/phys.md) tab. Nothing here is a measurement, and nothing here takes sides: the same mathematics serves both models.

## Angles and radians

$${\theta = \frac{s}{r}}\ \text{(rad)},\qquad 2\pi\ \text{rad} = 360^\circ,\qquad 1^\circ = 60' = 3600''$$

**The radian.** An angle θ in radians is the arc s it cuts on a circle divided by the radius r: a full turn is 2π r / r = 2π rad, so 1 rad = 57.30°. Degrees split into 60 minutes of arc (′) and each minute into 60 seconds of arc (″); 1″ = 4.848 millionths of a radian. The elevation, dip and refraction tabs ([Elevation angles](/ai/elev.md), [Dip](/ai/dip.md), [Refraction](/ai/ref.md)) count in minutes and seconds of arc; every formula of the site computes in radians.

$${\tan\theta \approx \sin\theta \approx \theta}\quad (\theta\ \text{small, in rad})$$

**Small angles.** For a thin triangle, the opposite side over the long side is almost the angle itself in radians. The error is 0.010 % at 1°, 0.25 % at 5° and 1.0 % at 10°. That is why an object of height h seen at a distance d spans an angle of about h/d, and why the site can write the dip of the horizon as √(2h/R).

## Vectors: adding arrows

**Adding vectors: Chasles' relation.** Going from A to B, then from B to C, ends at the same place as going straight from A to C: written with displacement vectors, AB⃗ + BC⃗ = AC⃗. It is named after the French geometer Michel Chasles (1793–1880), and it holds for any number of steps: AB⃗ + BC⃗ + CD⃗ = AD⃗. Only the start and the end count, not the path. That is what “putting the arrows end to end” means, and it works the same for displacements, velocities, accelerations and forces.

*Figure caption:* **Michel Chasles** 1793–1880
[Photograph, 19th century (Smithsonian Libraries)](https://commons.wikimedia.org/wiki/File:Michel_Chasles.jpg)

$${\vec{AB} + \vec{BC} = \vec{AC}},\qquad \vec{AB} + \vec{BC} + \vec{CD} = \vec{AD},\qquad \vec{AB} + \vec{BA} = \vec 0$$

The detour through B and the direct path land at the same point. A round trip adds up to the zero vector: AB⃗ + BA⃗ = 0⃗, so BA⃗ = −AB⃗, the same arrow turned round. The order of the steps does not matter either: AB⃗ + BC⃗ = BC⃗ + AB⃗, the two other sides of a parallelogram.

$${\vec a + \vec b = (a_x + b_x,\ a_y + b_y)}$$

**With components, it is ordinary addition.** Put the arrows end to end and look at their shadows on each axis: the shadows add up too. To add two vectors, add their x components together and their y components together. That is how a computer adds forces or velocities, and how the [Aviation](/ai/avia.md) tab adds the wind to an airliner's airspeed.

$${\vec a - \vec b = \vec a + (-\vec b)},\qquad \vec b + (\vec a - \vec b) = \vec a$$

**Subtracting is adding the opposite.** −b⃗ is b⃗ turned round. Drawn from a common origin, a⃗ − b⃗ is the arrow that goes from the tip of b⃗ to the tip of a⃗: the step still needed to get from b⃗ to a⃗, which is Chasles' relation again. This tab uses it twice: the change of velocity Δv⃗ = v⃗₂ − v⃗₁ points to the centre on a circle, and the velocity seen from a moving train is v⃗′ = v⃗ − V⃗.

## Derivatives: one idea, several notations

**A derivative is a rate of change at one instant.** Shrink the interval Δt of the mean velocity ([Physics](/ai/phys.md#phys-h2kin)) towards zero: the chord turns into the tangent to the curve, and its slope is the instantaneous velocity. Newton and Leibniz found this independently in the 1660s–1680s and wrote it differently; Lagrange later added a third way[1][2][3]. All three are still in use, often on the same page, and they mean exactly the same thing.

*Figure caption:* **Isaac Newton** 1642–1727
[After Godfrey Kneller, 1689](https://commons.wikimedia.org/wiki/File:GodfreyKneller-IsaacNewton-1689.jpg)

*Figure caption:* **Gottfried Wilhelm Leibniz** 1646–1716
[Christoph Bernhard Francke, c. 1695 (Herzog Anton Ulrich-Museum)](https://commons.wikimedia.org/wiki/File:Christoph_Bernhard_Francke_-_Bildnis_des_Philosophen_Leibniz_(ca._1695).jpg)

*Figure caption:* **Joseph-Louis Lagrange** 1736–1813
[Anonymous, 19th century](https://commons.wikimedia.org/wiki/File:%D0%9B%D0%B0%D0%B3%D1%80%D0%B0%D0%BD%D0%B6.jpg)

$${v(t) = \lim_{\Delta t \to 0} \frac{\Delta x}{\Delta t} = \frac{dx}{dt} = \dot x = x\prime(t)}$$
$$a = \frac{dv}{dt} = \frac{d^2x}{dt^2} = \ddot x = x''(t)$$

“lim” reads “the limit as Δt goes to zero”. dx/dt (Leibniz) keeps the memory of a ratio of two tiny changes; ẋ, with a dot (Newton), is used only for derivatives with respect to time; x′ (Lagrange) says “derivative of x” without naming the variable. Two dots, two primes or d²/dt²: the derivative taken twice, the acceleration.

**The notations, how they are read, and where the site uses them.**

| Written | Read | Means | On this site |
| --- | --- | --- | --- |
| Δx | delta x | a finite change of x | everywhere |
| dx/dt | d x d t (Leibniz) | rate of change of x with t | [Rotation](/ai/rot.md), [Orbit](/ai/orb.md) |
| ẋ, ẍ | x dot, x double dot (Newton) | first, second derivative in time | θ̇ of Kepler in [Orbit](/ai/orb.md) |
| f′(x), f″(x) | f prime, f second (Lagrange) | derivative of f, whatever the variable | [Horizon curve](/ai/curv.md) |
| ∂f/∂x | partial f partial x | derivative in x, the other variables held fixed | [Gravity](/ai/grav.md), [Magnetism](/ai/mag.md) |
| ∇f | nabla f, gradient | the vector of all partial derivatives: steepest slope | [Gravity](/ai/grav.md), [Atmosphere](/ai/atmo.md) |
| ∫ f dt | integral of f d t | the sum of f dt: the area under f, the reverse of a derivative | [Refraction](/ai/ref.md) (ray tracing) |
| Σ | sigma, sum | add up the terms | every fit ([Results](/ai/results.md)) |

$${x(t) = x_0 + \int_{0}^{t} v\,dt}\qquad \Leftrightarrow\qquad \frac{dx}{dt} = v$$

**The integral undoes the derivative.** Cut the time into thin slices dt; in each, the body moves v dt. Adding all the slices (the long S, ∫, is a stretched “sum”) gives the distance covered: the area under the curve of v against t. An inertial navigation unit does exactly that, twice, from its accelerometers ([Aviation](/ai/avia.md)).

$${\nabla h = \left(\frac{\partial h}{\partial x},\ \frac{\partial h}{\partial y}\right)}$$

**Partial derivatives.** When a quantity depends on several variables, such as the height h of a hill at each point (x, y) of a map, ∂h/∂x is its slope walking due east, with y held fixed, and ∂h/∂y its slope walking north. Together they form the gradient ∇h, an arrow pointing straight uphill, across the contour lines. Gravity is minus the gradient of the potential; air pressure falls along its gradient with height.

## Measurement, uncertainty and fitting

**A measurement is a value with its uncertainty.** Time the period of a 1 m pendulum twelve times with a stopwatch and you will not get the same number twice: your reaction time adds a random error each time. The mean is the best estimate; the spread around it, the standard deviation σ, says how far one measurement typically falls from it[4]. The numbers in this section are **invented for the example**, not a measurement.

$${\bar x = \frac{1}{N}\sum x_i},\qquad \sigma = \sqrt{\frac{\sum (x_i - \bar x)^2}{N-1}},\qquad \sigma_{\bar x} = \frac{\sigma}{\sqrt N}$$

For the 12 timings in the figure, x̄ = 2.006 s and σ = 0.014 s. The mean is better known than any single timing: its uncertainty is σ/√N = 0.004 s. With the pendulum law T = 2π√(L/g)[5], that gives g = 4π²L/T² = 9.81 ± 0.04 m/s². About two thirds of the measurements fall within ±1σ of the mean, 95 % within ±2σ. A value 3σ away has a 0.3 % chance of being bad luck: that is the threshold the site uses to set an outlier aside, measuring σ on the *other* points, never on a percentage chosen afterwards.

$${\chi^2 = \sum_i \left(\frac{y_i - f(x_i)}{\sigma_i}\right)^2\ \text{minimal}}$$

**Least squares** (Legendre 1805, Gauss 1809)[6]. To fit a model f to measured points, choose its parameters so that the sum of the squared gaps (the *residuals*), each divided by its uncertainty, is as small as possible. Here, T² against L for five pendulum lengths: the best line has a slope of 4.025 ± 0.035 s²/m, and since T² = (4π²/g) L, g = 9.81 ± 0.09 m/s². Almost every result of the site is a fit of this kind, with both models fitted the same way; when the residuals of one model are much larger than the measurement uncertainty, that model does not describe the data.

*Figure caption:* **Carl Friedrich Gauss** 1777–1855
[Gottlieb Biermann after Christian Albrecht Jensen, 1840](https://commons.wikimedia.org/wiki/File:Carl_Friedrich_Gauss.jpg)

**Random and systematic errors.** Random errors scatter the measurements around the true value and shrink when they are averaged. A systematic error shifts them all the same way, a watch that runs fast, an uncorrected refraction, and averaging does nothing against it. Accuracy is closeness to the true value; precision is the closeness of the measurements to each other. The figure below shows the difference; the site's tabs say, for each result, which systematic errors they checked and which they could not.

*Figure caption:* **Precision and accuracy.** Four sets of shots at a target whose centre is the true value. Left to right: scattered and off-centre; tight but off-centre (precise, with a systematic error); scattered but centred (accurate on average, imprecise); tight and centred.

**Two checks on a fit, used across this site.** A fitted line always gives a number, even through points that do not follow it. Two numbers say whether the line deserves it. The correlation r says how closely y follows x along a line, with no model and no unit: near 1 when it does, near 0 when x tells nothing about y. It needs more than two points: through two, any line is perfect and r is ±1.

$${r = \frac{\sum (x_i - \bar x)(y_i - \bar y)}{\sqrt{\sum (x_i - \bar x)^2\,\sum (y_i - \bar y)^2}}}$$

**Pearson's correlation**. xᵢ, yᵢ are the N points, x̄ and ȳ their means; r runs from −1 to 1. It does not depend on the units or on any model of what links x to y; it does not say whether the line passes through zero, nor how large the slope is.

**What each one says.** χ²/ν compares the scatter of the points around the fitted line with their known uncertainty σ. Close to 1, the line is as good as the measurements allow. Much larger, the line does not fit, or something adds errors that σ does not hold. Much smaller, σ was overestimated. It needs σ known apart from the fit: where a survey or a bulletin prints no reading error, this site gives r and the raw scatter, with its unit, and says why there is no χ²/ν. On a flat surface a radius calculation fails in one of two ways: r falls to zero (no curvature to find), or χ²/ν climbs (the flat model's own signal fits no single radius); the [curvature tab](/ai/kappa.md) shows both, reading by reading.

$${\frac{\chi^2}{\nu} = \frac{1}{N - p}\sum_i \left(\frac{y_i - f(x_i)}{\sigma_i}\right)^2}$$

**Chi-squared per degree of freedom**. f is the fitted model, p its number of free parameters, ν = N − p the degrees of freedom, σᵢ the uncertainty of point i, known before the fit. Each residual divided by its σ is typically about 1 if the model is right, so χ²/ν is about 1, give or take √(2/ν).

## Terrain models: LiDAR, elevation grids and smoothing

**Where the ground comes from.** Every horizon, skyline or hidden summit on the site that involves real ground is read from a digital elevation model, a grid of heights, never drawn by hand. In France: the IGN's LiDAR HD, the bare ground measured by airborne laser on a 1 m grid[7]. Where it has no data: the IGN's RGE ALTI, 1 m, assembled from older surveys[8]. In Austria: the BEV's 1 m laser model[9]. Elsewhere, and more than 45 km from a French viewpoint: Copernicus GLO-30, a 30 m grid measured by radar satellites, which is a *surface* model, trees and roofs included[10] (its 90 m version for a few very distant horizons). Each gap is filled by the next model in that order, and where none has a value, by the sea at 0 m.

*Figure caption:* **A terrain model is a mesh.** An invented summit, drawn at true scale. The grid first has a node every 5 m, then every 10, 20 and 40 m: at each step the nodes that go (red) come down onto the surface of the coarser grid, and the summit read on the mesh (blue, on the section through the summit) drops below the real one (black), because the sharp top falls between nodes. Then the nodes come back. Last, a patch of the 5 m grid has no data, like the LiDAR HD on the summit of Mont Agel, and another model fills it (amber): coarser, made another way, and here 8 m higher on average, so it does not meet the first one at the edges and gives yet another summit. Each node takes the height of the ground at its point; the other model, the mean of its cell. The heights are invented for the example.

$${z = (1-u)(1-v)\,z_{00} + u(1-v)\,z_{10} + (1-u)\,v\,z_{01} + u\,v\,z_{11}},\qquad u = \frac{x - x_0}{\Delta},\ \ v = \frac{y - y_0}{\Delta}$$

**How the site reads between nodes.** Δ is the grid step; the point (x, y) lies at fractions u and v of the cell, and its height is the mean of the four corner heights, each weighted by how close it is. The four weights add up to 1, so the result never goes above the highest node: a summit is only as high as the nodes that land on it. That is the smoothing; it is why the summit of a 30 m model can be tens of metres below the real one, and the 1 m LiDAR only centimetres[7][10].

**Why a model's summit often comes out lower than the published height.** Three reasons, which mostly push the same way. *The grid.* A model stores one height per cell, and the site reads between the four nearest cells (bilinear interpolation): a summit sharper than a cell is averaged with its own slopes. That is the smoothing. On a 1 m grid it costs centimetres; on a 30 m grid it can cost tens of metres on a pointed peak. To limit it, the skylines of the French and Austrian viewpoints are read twice: every 25 m along each line of sight on a 30 m grid, then again at 1 m around every point that could make the skyline; the script refuses to write a profile if a fine reading rises above the coarse one by more than the margin it allows for. *What is measured.* A bare-ground model has no cairn, pillar, building or tree, while a published height is usually that of a survey mark, and can be older than the works done on a summit; a surface model has the opposite bias. *The rays.* A profile is a set of lines of sight one step of azimuth apart: a narrow summit can fall between two of them, and it is that step, not the model, that sets the resolution there.

**The rule.** What the site draws and computes uses the model's height, the same reading for the plane and for the globe, so that any difference between the two comes from geometry and never from sampling. A model's value is never replaced by a published one, nor “corrected” by hand. Where the two differ by more than a few metres, the page gives both, names the model, and says what the published height would change; a page that does not is a mistake to report. At 40 km, 15 m of height is about 1.3′, and it moves a summit by the same amount on both models.

**Mont Agel: the height each source gives, around the published summit (43.7708° N, 7.4197° E)[11].**

| Source | Height | What it is |
| --- | --- | --- |
| Wikipédia (FR), September 2026 | 1,148 m | published |
| Wikipédia (FR), November 2026, after the Géoportail | 1,151 m | published |
| IGN LiDAR HD[7] | 1,127 m | bare ground, highest point outside the gap; 1,120 m at the published point |
| IGN RGE ALTI[8], inside the gap | 1,133 m | what the site uses |
| IGN RGE ALTI, around the summit | 1,138 m | 1,137 m at the published point |
| Copernicus GLO-30[10] | 1,145 m | surface, buildings included, 30 m cells |

**An example: Mont Agel, seen from the plateau de Caussols** ([Dip of the horizon](/ai/dip.md), [Elevation angles](/ai/elev.md)). The LiDAR HD has no data over 0.13 km² of the summit, which carries military air-detection installations[11]; around that gap the RGE ALTI stands up to 30 m above the LiDAR, while elsewhere the two agree within a metre. The data do not say which is right on the summit itself, so the site does not choose by hand: it uses its usual reading, 1,133 m, and says so. Every height in the table gives the same answer: from 1,210 m, on a plane, Mont Agel lies between 5′ (1,151 m) and 8′ (1,119 m) below the horizon, which is at eye level; on the refracted globe, between 45′ and 48′ above the sea horizon. The photograph shows it 42′ above.

**See also**[Physics](/ai/phys.md)[Curvature](/ai/kappa.md)[Results](/ai/results.md)[Dip](/ai/dip.md)[Elevation angles](/ai/elev.md)[Refraction](/ai/ref.md)[Aviation](/ai/avia.md)[Gravity](/ai/grav.md)

## Sources for this tab

1. [1] G. W. Leibniz, “Nova methodus pro maximis et minimis”, *Acta Eruditorum* (October 1684) 467–473: the notation dx, dy and the rules of the differential calculus.
2. [2] I. Newton, *The Method of Fluxions and Infinite Series* (written 1671, published London, 1736): “fluxions”, the rates of change of “fluents” in time, later written with a dot over the letter.
3. [3] J.-L. Lagrange, *Théorie des fonctions analytiques* (Paris, 1797): the derived function written f′(x), f″(x).
4. [4] JCGM 100:2008, [*Evaluation of measurement data — Guide to the expression of uncertainty in measurement*](https://www.bipm.org/en/committees/jc/jcgm/publications) (GUM), BIPM et al.: standard uncertainty, the experimental standard deviation with N − 1, and the standard deviation of the mean s/√N (§ 4.2).
5. [5] C. Huygens, *Horologium oscillatorium* (Paris, 1673): the period of a pendulum and its relation to the fall of bodies, T = 2π√(L/g) for small swings, and (Part V) the theorems on centrifugal force, v²/r, worked out in *De vi centrifuga* (1659, published 1703).
6. [6] A.-M. Legendre, *Nouvelles méthodes pour la détermination des orbites des comètes* (Paris, 1805), appendix “Sur la méthode des moindres quarrés”; C. F. Gauss, *Theoria motus corporum coelestium* (Hamburg, 1809), Book II, Section III.
7. [7] IGN, [LiDAR HD](https://geoservices.ign.fr/lidarhd), digital terrain model (MNT, bare ground, 1 m grid) from airborne laser, read through the Géoplateforme WMS-Raster service (layer IGNF_LIDAR-HD_MNT_ELEVATION) by this project's `research/lidar_horizon.py`.
8. [8] IGN, [RGE ALTI](https://geoservices.ign.fr/rgealti), 1 m digital terrain model of France, assembled from airborne LiDAR, photogrammetric correlation and, in places, radar surveys; used only where the LiDAR HD has no data.
9. [9] BEV (Bundesamt für Eich- und Vermessungswesen), [ALS-Höhenraster](https://www.bev.gv.at/Services/Produkte/Digitales-Gelaendehoehenmodell/ALS-Hoehenraster.html), 1 m airborne-laser terrain model of Austria.
10. [10] [ESA / Airbus, *Copernicus DEM GLO-30*](https://doi.org/10.5270/ESA-c5d3d65) (and GLO-90): a 1-arc-second (about 30 m) digital surface model of the globe from the TanDEM-X radar mission, vegetation and buildings included.
11. [11] [Mont Agel (Wikipédia, FR)](https://fr.wikipedia.org/wiki/Mont_Agel): 1,148 m when consulted in September 2026, 1,151 m in November 2026 (reference: Géoportail), at 43°46′15″ N, 7°25′11″ E; military air-detection installations on the summit. Model heights read by this project (`research/lidar_horizon.py` and the Géoplateforme altimetry service), 25 November 2026.
