# Curvature: how fast a direction turns

> Tab "Curvature" of *Flat plane or Globe?*. Web page: /#tab-kappa. Generated from the rendered page: same text, same computed numbers and sources; drawings are replaced by their captions and descriptions, formulas are TeX. Licence: content and data CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), Xyphophor (https://x.com/Xyphophor); source code MIT; third-party data keep the licence of their source, cited in each tab.

*Curvature · what it is, how it is measured, and what a plane gives*

Every method on this site that gives the Earth a radius measures one thing: how much a direction turns over a distance. That is the mathematical definition of curvature, and it needs no globe to state: a straight line turns by nothing, a circle by the same angle for every metre, and the radius is what you divide by. This tab defines it, takes it from curves to surfaces, shows how it is detected from inside a surface with angles and lengths only, and then answers the objection that these calculations “assume the globe”: run them on readings taken on a plane, and they do not return a radius.

*[Figure: Animation: a point rolls along a curve with its tangent, the angle between two tangents divided by the distance between them giving the curvature; the curve becomes a line and a circle, then a plane and a sphere; then simulated dips, triangles, Eratosthenes' shadows and trips of known speed on a plane and on a sphere, where only the sphere's readings line up and give a radius; last, the correlation and the scatter as readings are added: on the plane one falls or the other climbs]*

*Figure caption:* **The whole tab in under a minute.** A point rolls along a road with its tangent: the turn between two tangents divided by the distance between them is the curvature. The road becomes a straight line (κ = 0) and a circle (κ = 1/R), then, spun about a vertical axis, a plane (K = 0) and a sphere (K = 1/R²). Then the same naive radius calculation is run on dips, triangles, Eratosthenes' shadows and trips of known speed simulated on a plane and on a sphere with the same instrument: one or two readings always give a number, hundreds give 6,368 km on the sphere and no single radius on the plane. Click to pause.

*Figure caption:* **Curvature in forty seconds.** A road seen from above, drawn at uniform scale in metres. A point rolls along it with its tangent (blue); a second point 8 m further on carries its own tangent (green); the angle Δθ between the two directions, drawn again from one point at the top right, divided by the 8 m between them, is the curvature κ. The dashed circle is the one that hugs the road best at the first point, the osculating circle, of radius 1/κ: small in a tight bend, huge where the road almost runs straight. Then the road is straightened into a line, where the two tangents never differ (κ = 0), and closed up evenly into a circle of 20 m, where they always differ by the same angle (κ = 1/R everywhere). The camera rises without a cut and each is turned about its vertical axis: the line sweeps out a plane, the circle a sphere. On a surface there are two directions at each point; their two curvatures are 0 and 0 on the plane, 1/R and 1/R on the sphere, and their product is Gauss's curvature K. Click to pause.

## A direction that turns with distance

**Walk along a curve and watch your heading.** Over a short stretch Δs it changes by an angle Δθ. The curvature is the ratio, in the limit of short stretches: how many radians the direction turns per metre walked[6]. It is a local number, read at one point, and it uses only a position along the curve, a distance and an angle. Nothing in it refers to a centre, an outside, or a third dimension.

$${\kappa = \frac{d\theta}{ds} = \lim_{\Delta s \to 0} \frac{\Delta\theta}{\Delta s}}$$

**The curvature of a curve.** θ is the direction of the tangent, s the distance walked along the curve, κ the turn per unit length, in radians per metre (or per km). Its sign says which way the curve turns: positive to the left, negative to the right.

**Two curves have the same curvature at every point.** On a straight line the tangent never changes: κ = 0 everywhere. On a circle of radius R, walking an arc Δs turns the radius, and therefore the tangent, which stays at right angles to it, by Δs/R: κ = 1/R everywhere. Any other curve has a curvature that changes from point to point, and at each point the circle of radius 1/κ that hugs it best, the osculating circle[3], gives the curve's local radius.

$${\Delta\theta = \frac{\Delta s}{R} \;\Rightarrow\; \kappa_{\text{circle}} = \frac{1}{R}},\qquad \kappa_{\text{line}} = 0$$

**The circle and the line.** R is the circle's radius. On the Earth, R = 6,371 km: a walk of 1 km turns the vertical by 32.4″, 100 m by 3.24″, and one degree takes 111 km. A straight line is the circle whose radius is infinite.

$${\kappa = \frac{y\prime\prime}{\left(1 + y\prime^{2}\right)^{3/2}}},\qquad \rho = \frac{1}{\kappa}$$

**The same number for a graph.** For a curve drawn as y(x), y′ and y″ are its first and second derivatives ([Math](/ai/math.md#math-h2deriv)) and ρ the radius of the osculating circle, the circle through three points of the curve as they merge. Where the curve is a straight line, y″ = 0 and ρ is infinite.

## On a surface, two directions and one number

**Stand on a surface and cut it with planes through the vertical.** Each cut is a curve with its own curvature, and as the cut turns, the curvature runs between a largest and a smallest value, κ₁ and κ₂, in two directions at right angles: the principal curvatures, found by Euler in 1760[2]. A plane gives 0 in every direction. A sphere gives 1/R in every direction. A cylinder gives 1/R across and 0 along; a saddle bends up one way and down the other.

$${K = \kappa_1\,\kappa_2}:\qquad K_{\text{plane}} = 0,\quad K_{\text{sphere}} = \frac{1}{R^2}$$

**Gauss's curvature.** κ₁ and κ₂ are the principal curvatures at a point, K their product, in 1/m² or 1/km². On the Earth K = 2.46 × 10⁻⁸ /km². The cylinder, curved in one direction only, has K = 0, like the plane: it can be unrolled onto a sheet without stretching, and the sphere cannot.

**Why the product, and not one of the two.** Gauss proved in 1827 that K, unlike κ₁ or κ₂ alone, can be measured by someone who never leaves the surface, from lengths and angles drawn on it, and that no bending without stretching changes it: his theorema egregium[1]. A sheet of paper rolled into a cylinder keeps K = 0, and the triangles drawn on it keep their angles. That is also why no flat map of a sphere keeps every length ([Maps](/ai/map.md#map-h2gauss)). Two consequences follow, and they are the two ways to detect curvature from inside.

## Curvature measured from inside: angles and lengths

**Draw a triangle with straight lines on the surface**, the shortest paths between three points, and add its three angles. On a plane they make 180°, whatever the triangle's size. On a surface of curvature K they make 180° plus K times the area: on a sphere, the area divided by R². Albert Girard gave the sphere's case in 1629[4], Gauss the general one[1].

$${\alpha + \beta + \gamma - 180^\circ = K\,A = \frac{A}{R^2}}$$

**The angle excess of a triangle.** α, β, γ are its three angles, A its area, K the curvature, the excess in radians. On the Earth one second of arc of excess takes 197 km² of triangle; a triangle of 1,000 km² exceeds 180° by 5.08″.

**Or walk a circle.** Keep a fixed distance r from a post, measured along the ground, and walk round it. On a plane the circumference is 2πr. On a sphere it is shorter: the lines that leave the post spread less and less, and meet again at the far side. Bertrand, Diguet and Puiseux showed in 1848 that the shortfall gives K at the post[5]. On the Earth a circle of 100 km is 26 m short of 2πr, one of 10 km 25.8 mm.

$${C = 2\pi R \sin\frac{r}{R} \approx 2\pi r - \frac{\pi}{3}\,K\,r^{3}}$$

**The circumference of a circle drawn on the surface.** r is the radius walked along the ground, C the circumference, R the sphere's radius and K = 1/R². The second form holds on any surface for small r: K = 3(2πr − C)/(π r³).

**Every radius on this site is one of these.** The surveyors' triangles add their angles ([1,458 triangles, Surveying](/ai/surv.md#sv-h2tri)); the reciprocal zenith angles of two stations are the triangle with its third corner at the centre ([Elevation angles](/ai/elev.md#2a51c10f), [97 lines, Refraction](/ai/ref.md#rf-hsp4)); the dip of the horizon is the turn of the vertical between the eye and the horizon ([Dip](/ai/dip.md#84acea2b)); Eratosthenes compared two verticals against the same sunlight ([Gravity](/ai/grav.md#gv-h1)); seismic waves and airliners divide a speed times a time by the angle between two places ([Seismology](/ai/seis.md#sq-h7), [Aviation](/ai/avia.md#avia-h2rf)). Each measures an angle and a length, and divides.

## “It assumes the globe”: run the calculation on a plane

**The objection.** “A radius computed from angles assumes a ball; feed the formula anything and it gives you a ball.” If that were so, readings taken on a flat surface would also come out with a radius. So the next six sections do exactly that. Each simulates one method on two surfaces, a plane and a sphere of 6,371 km, with the same instrument: the same places, the same distances and the same reading errors, drawn from one fixed random sequence. Only the surface differs. Then each set of readings is put through the same naive calculation, without saying which surface it came from.

**The calculation.** Each method gives two numbers per reading, x from distances or heights and y from angles or lengths, such that a sphere of radius R makes y proportional to x. The radius comes from the slope of the line through zero that fits the readings best. With it come two checks that need no model: the correlation r between x and y, and how far the readings scatter around the line compared with the instrument's known error, χ²/ν, which is close to 1 when the line holds and much larger when it does not.

$${c = \frac{\sum x_i y_i/\sigma_i^2}{\sum x_i^2/\sigma_i^2}},\qquad R = c^{-1/p},\qquad \frac{\chi^2}{\nu} = \frac{1}{n-1}\sum \left(\frac{y_i - c\,x_i}{\sigma_i}\right)^2$$

**A line through zero, and the radius it gives.** xᵢ and yᵢ are the n readings, σᵢ the instrument's error on yᵢ, c the slope; p is 1 when the slope is 1/R, 2 when it is 1/R² (triangles, circles), ½ when it is 1/√R (the dip). c ≤ 0 gives no real radius at all. The range shown is the radius for c ± its standard error: when c − σ_c ≤ 0, it runs to infinity, and a flat surface is not excluded. The figure shows the 300 simulated triangles of the section below.

**Under each animation, the two checks as the readings come in**, one point per reading added. They fail in two different ways on the plane. For the dip, the zenith angles, the triangles and the circle, the plane's correlation falls to zero while its scatter stays at 1: its readings are perfectly consistent, with a curvature of zero. For Eratosthenes and speed × time, where the flat model makes a signal of its own (the nearby Sun, the flat map), the correlation stays and the scatter climbs into the hundreds: no single radius fits them. On the sphere both stay where a sphere puts them, r = 1 and χ²/ν close to 1. With only a few readings the scatter is itself poorly known, which is why the curves wander at the start.

*Figure caption:* **Two ways to fail.** The correlation r and the scatter χ²/ν against the number of readings, for the simulated triangles (top) and for Eratosthenes under the flat model's Sun (bottom), on the plane (amber) and on the sphere (blue). The plane's triangles end at r = -0.01 with χ²/ν = 1.14: consistent readings, with no curvature. Its shadows end at r = 0.69 with χ²/ν = 306: a signal, but no single radius. The sphere's stay at r = 1 and χ²/ν close to 1.

**What this is and is not.** These readings are simulated, so this is no evidence about the Earth: it is a test of the calculation. No air bends the light in these simulations; the real readings and their refraction are in the tabs linked from each section. What would vindicate the flat model, stated in advance, is the same in all six: real readings that behave like the plane's column below, and not like the sphere's.

## The dip of the horizon, from 50 m to 12 km

**The reading.** An observer at height h measures how far the horizon lies below eye level, to 1′, from a beach, a hill or an airliner. On a sphere the line of sight to the horizon is tangent to the ground, and the dip is the angle the vertical turns between the eye and the tangent point. On a plane the far ground approaches eye level and never goes below it: the dip read is the instrument's error alone.

*Figure caption:* **200 dips on each surface.** Top: the reading being taken (not to scale); bottom: every dip so far against √(2h), with the line through zero of each surface. With one reading, the plane already gives a radius, 45,804,941 km, from nothing but the instrument's error; with two, their correlation is a perfect 1, as it is for any two readings. Then the readings pile up: on the sphere they rise along one line and the radius settles at 6,393 km (6,382–6,405); on the plane they stay around zero, the correlation falls to -0.13 and the slope comes out below zero: no radius at all. Click to pause.

$${\cos\delta = \frac{R}{R+h}} \;\Rightarrow\; \delta \approx \sqrt{\frac{2h}{R}},\qquad R \approx \frac{2h}{\delta^2}$$

**The dip of the horizon.** h is the height of the eye, δ the dip in radians, R the radius. y = δ and x = √(2h), so the slope is 1/√R. On a plane δ = 0 at every height. The real dips, with refraction, are in the [Dip](/ai/dip.md#84acea2b) tab; al-Bīrūnī measured one about 1018.

## Reciprocal zenith angles, lines of 10 to 120 km

**The reading.** Two stations a distance d apart each measure the angle from straight up to the other, to 10″. If the two verticals are parallel, the two angles add up to exactly 180°, whatever the distance and the heights. If they meet at a centre, the sum exceeds 180° by d/R. It is the triangle of the previous section with one corner at the centre of the Earth.

*Figure caption:* **200 lines on each surface.** The excess of the two zenith angles over 180°, in minutes of arc, against the length of the line. The plane's first reading falls below 180°, so its “radius” is negative, and so is the slope through its first two; later the slope wanders either side of zero, within its errors, and with all the readings the plane's range runs to infinity. The sphere's readings lie on one line: 6,372 km, correlation 1.000. Click to pause.

$${z_A + z_B - 180^\circ = \frac{d}{R}}$$

**Reciprocal zenith angles.** z_A and z_B are the angles from the vertical at each station to the other, d the distance between them, the excess in radians. On a plane the excess is 0 at every distance. With air, light curves down on both surfaces: on the sphere the excess shrinks to d(1 − k)/R, and on a plane the sum falls BELOW 180° by d/ρ, 7.0′ for 100 km with k = 0.13 (ρ = R/k = 49,008 km). The 97 lines surveyed in Colorado and California from 1859 to 1895 all exceed 180°, by 6′ to 56′ ([Refraction](/ai/ref.md#rf-hsp4)).

## Triangles of 50 to 15,000 km²

**The reading.** A surveyor measures the three angles of a triangle between hilltops, each to 0.7″, and its area from a measured base, without any radius. On a plane the angles add up to 180° plus the reading errors; on a sphere the excess grows with the area.

*Figure caption:* **300 triangles on each surface.** The excess over 180° in seconds of arc against the area. The plane's first triangle happens to come out slightly above 180°, and gives a radius of 40,950 km; its second agrees, 59,591 km, and their correlation is a perfect 1. Two readings that do not contradict each other. By thirty triangles the plane's slope has fallen below zero, by three hundred it is back to 215,215 km with a range that runs to infinity, and its correlation is -0.01. The sphere's: 6,368 km, correlation 0.998. Click to pause.

**The formula is the angle excess above**, α + β + γ − 180° = A/R², so y is the excess and x the area, and the slope is 1/R². The surveys of the nineteenth century did exactly this with 1,458 real triangles, and their excess grows with the area along one line, at 6,383 km ([Surveying](/ai/surv.md#sv-h2tri)).

## A circle walked round a post, 20 to 300 km

**The reading.** Lengths only, as Gauss allowed: walk a circle at a fixed distance r from a post, measured on the ground, and measure its circumference to one part in 100,000 (a centimetre per kilometre). On a plane C = 2πr. On a sphere it falls short by πr³/(3R²): y is the shortfall and x = πr³/3, so the slope is 1/R². Nobody has surveyed the Earth this way; the triangles above rest on the same theorem.

*Figure caption:* **200 circles on each surface.** The shortfall 2πr − C in metres against the radius walked (axis drawn as πr³/3). The plane's first circle comes out longer than 2πr, as if the ground were a saddle: no radius. Its readings stay around zero at every size, the slope stays within two standard errors of zero, and with all the readings the range runs to infinity. The sphere's: 6,387 km, correlation 0.998. Click to pause.

## Eratosthenes, with the flat model's nearby Sun

**The reading.** Two sticks on the line that runs towards the point under the Sun, d apart, and the angle of each one's shadow, to 0.1°. On the sphere the Sun is far and its rays parallel, and the angles differ by d/R. On the plane a Sun at infinity would make them equal, and the plane would give no radius, like the four other methods. Flat-earth models put the Sun about 5,000 km up[8]; then the angles differ, and the plane does give a radius.

*Figure caption:* **200 pairs of sticks on each surface**, the first stick anywhere from 0 to 8,000 km from the point under the Sun, the second 200 to 1,500 km further. The plane's first two pairs fall near the point under the Sun and agree: 5,250 and 5,282 km, a plausible radius. Then pairs further away come in, and they give larger radii, up to 17,800 km: the readings no longer lie on any line through zero, and their scatter around the best one is χ²/ν = 306, against 1 for the instrument's error alone. The sphere's lie on one line at 6,380 km, χ²/ν = 0.93. Click to pause.

$${\Delta z = \frac{d}{R}},\qquad \Delta z_{\text{plane}} = \arctan\frac{r_2}{H} - \arctan\frac{r_1}{H}$$

**Two shadows.** Δz is the difference between the two shadows' angles from the vertical, d the distance between the sticks; on the plane, H is the Sun's height and r₁, r₂ the sticks' distances from the point under it. Close to that point the plane gives R ≈ H; at a distance r it gives (H² + r²)/H, 17,800 km at 8,000 km. Any H gives the same pattern, scaled. Readings within 2,000 km of the point under the Sun give 5,616 km on the plane, those beyond 6,000 km give 16,487 km; on the sphere, 6,388 and 6,365 km.

**Two readings are not a test.** Eratosthenes' two cities, a 7.2° difference over about 800 km[7], fit a flat Earth with a Sun about 6,300 km above the southern one as well as they fit a globe, which is what flat-earth videos say, and it is true. What separates the two is the third reading and the hundredth, taken further from the Sun: one radius for all of them, or a radius that depends on where you stand. A real measurement of the Sun's height across many places is in the [Sun](/ai/sun.md) and [Observation](/ai/obs.md) tabs.

## Speed × time over angle: earthquakes and airliners

**The reading.** A seismic wave or an airliner of known speed v goes from one place to another in a time t, so it covers v t. The two places are given by their latitude and longitude, angles read on the sky, and the angle θ between them at the centre comes from those four angles with the sphere's formula: this is the step said to “assume the globe”. Then R = v t / θ. On the sphere, v t = R θ. For the plane, the same coordinates are laid on the flat-earth map, the azimuthal map centred on the North Pole, with a degree of latitude worth πR/180 km as on the globe (its own convention), and v t is the straight distance on that map. Each trip is known to 1.5 % plus 20 km (winds, detours, a speed known to a few per cent).

*Figure caption:* **200 trips on each surface**, 10° to 120° long, between places from 60° S to 75° N. Distance travelled against the angle from the coordinates. The plane's first trip gives 6,301 km, a plausible radius, and its second 7,412 km: the flat map keeps lengths along the meridians, so trips in the north come out close to the globe. Then trips in the south come in, and the map stretches them: 12,853 km for the trips south of 10° S, 6,789 km for those north of 15° N; around the best line, χ²/ν = 253. The sphere's: 6,371 km, 6,380 in the south and 6,368 in the north, χ²/ν = 0.93. Click to pause.

$${v\,t = R\,\theta},\qquad \cos\theta = \sin\varphi_1\sin\varphi_2 + \cos\varphi_1\cos\varphi_2\cos\Delta\lambda$$

**A trip and its angle.** v is the speed of the wave or the aircraft, t the travel time, φ₁, φ₂ the latitudes and Δλ the difference of longitudes of the two places, θ the angle between them at the centre, in radians. The formula for θ is the sphere's, and that is the point: it does not make trips on a plane fit a sphere. On the flat map a trip of 60° along the equator is 1.5 times as long as on the globe, and one of 60° of longitude along 35° S 2.6 times. The real fits: 90 airline routes with their filed airspeeds give 6,513 ± 83 km, every known bias pushing up ([Aviation](/ai/avia.md#avia-h2rf)); the seismic waves, [Seismology](/ai/seis.md#sq-h7).

**No flat map does better.** Any flat map keeps some distances and stretches others, and no choice of scale or centre makes every trip's v t proportional to its angle ([Maps](/ai/map.md#map-h2gauss)). On a flat Earth it would show as speeds that depend on the route: airliners that must fly faster in the south, seismic waves that travel faster east–west. What would vindicate the plane: travel times, with known speeds, that fit straight distances on one flat map at every latitude.

## Six methods, one answer each

**The same naive calculation on simulated readings: the plane's first reading, the plane and the sphere after all of them. ∞: the range reaches infinity, a flat surface is not excluded.**

| Method (real readings) | Plane, 1 reading | Plane, all | Sphere, all |
| --- | --- | --- | --- |
| Dip of the horizon ([Dip](/ai/dip.md#84acea2b)) | 45,804,941 km | no radius (r = -0.13) | 6,393 km (r = 1.000) |
| Reciprocal zenith angles ([Refraction](/ai/ref.md#rf-hsp4)) | negative | no radius (r = 0.10) | 6,372 km (r = 1.000) |
| Triangles ([Surveying](/ai/surv.md#sv-h2tri)) | 40,950 km | 215,215 km … ∞ (r = -0.01) | 6,368 km (r = 0.998) |
| Circle round a post | none (C > 2πr) | no radius (r = -0.06) | 6,387 km (r = 0.998) |
| Speed × time over angle, flat-earth map ([Aviation](/ai/avia.md#avia-h2rf), [Seismology](/ai/seis.md#sq-h7)) | 6,301 km | 7,676 km, χ²/ν = 253 | 6,371 km, χ²/ν = 0.93 |
| Eratosthenes, flat Sun at 5,000 km ([Sun](/ai/sun.md), [Observation](/ai/obs.md)) | 5,250 km | 8,511 km, χ²/ν = 306 | 6,380 km, χ²/ν = 0.93 |

**So the calculation does not assume the globe.** Given readings from a plane, four of the six methods return what a plane is: a slope compatible with zero, an infinite radius, readings that do not correlate with distance or area. The two others, Eratosthenes under the flat model's nearby Sun and speed × time on the flat-earth map, return a radius that changes with where it is measured. Given readings from a sphere, all six return its radius, and the readings line up. With one or two readings, either surface can give a plausible number: one reading always gives a radius, and any two correlate perfectly. The answer is in the many.

**What the real readings do.** They behave like the sphere's column: the excess of 1,458 triangles grows with their area, the sums of 97 pairs of zenith angles all exceed 180° and grow with the length, the dip grows as the square root of the height, from a beach to an airliner. Each tab linked above shows its readings, its refraction and its flat-model best case. What would have vindicated the plane: readings like the plane's column, with no slope, at every size.

**See also**[Math](/ai/math.md)[Physics](/ai/phys.md)[Surveying](/ai/surv.md)[Dip](/ai/dip.md)[Elevation angles](/ai/elev.md)[Refraction](/ai/ref.md)[Maps](/ai/map.md)[Gravity](/ai/grav.md)[Results](/ai/results.md)

## Sources for this tab

1. [1] C. F. Gauss, *Disquisitiones generales circa superficies curvas* (Göttingen, 1827; read to the Royal Society of Göttingen in 1827, printed 1828): the curvature measure K as the product of the principal curvatures, its invariance under bending without stretching (art. 12, the “theorema egregium”), and the angle excess of a geodesic triangle equal to the integral of K over its area (art. 20); English translation by A. Hiltebeitel and J. Morehead, *General Investigations of Curved Surfaces* (Princeton, 1902).
2. [2] L. Euler, “Recherches sur la courbure des surfaces”, *Mémoires de l'Académie des sciences de Berlin* 16 (1760, printed 1767) 119–143: the curvature of the sections of a surface through its normal, and its largest and smallest values in two directions at right angles (Opera Omnia I.28, E333).
3. [3] G. W. Leibniz, “Meditatio nova de natura anguli contactus et osculi”, *Acta Eruditorum* (June 1686) 289–292: the circle that touches a curve most closely at a point, which he named the osculating circle.
4. [4] A. Girard, *Invention nouvelle en l'algèbre* (Amsterdam, 1629): the area of a spherical triangle is proportional to the excess of its angles over two right angles.
5. [5] J. Bertrand, C.-F. Diguet and V. Puiseux, three successive notes on Gauss's measure of curvature, *Journal de mathématiques pures et appliquées* 13 (1848) 80–90: the curvature at a point from the circumference (Bertrand, Diguet) or the area (Puiseux) of a small geodesic circle around it, K = 3(2πr − C)/(πr³) in the limit.
6. [6] M. P. do Carmo, *Differential Geometry of Curves and Surfaces* (Prentice-Hall, 1976; 2nd edition Dover, 2016), chapters 1 (the curvature of a curve), 3 (principal and Gaussian curvatures) and 4 (the theorema egregium and the Gauss–Bonnet theorem).
7. [7] Cleomedes, *Cleomedes' Lectures on Astronomy* (Caelestia) I.7, translated by A. C. Bowen and R. B. Todd (University of California Press, 2004): Eratosthenes' measurement, the Sun overhead at Syene and a shadow of one fiftieth of a circle at Alexandria, 5,000 stadia to the north.
8. [8] [“Flat Earth”, *Encyclopædia Britannica*](https://www.britannica.com/topic/flat-Earth): in some modern flat-earth models the Sun and the Moon are about 50 km across and circle above the disc at a height of about 5,500 km.
