# Two equal segments — until you flatten the Earth

> Tab "Distances" of *Flat plane or Globe?*. Web page: /#tab-dist. Generated from the rendered page: same text, same computed numbers and sources; drawings are replaced by their captions and descriptions, formulas are TeX. Licence: content and data CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), Xyphophor (https://x.com/Xyphophor); source code MIT; third-party data keep the licence of their source, cited in each tab.

*Map ≠ territory · the azimuthal equidistant trap*

*Figure caption:* **The same two points, three geometries.** Schematics of the algebra, not scale drawings: no distance in them is to scale, and none is used for any number on this page.

Take a diagonal segment in the northern hemisphere — one that cuts across parallels and meridians — and its exact mirror image across the equator. On the globe the two are *identical in length* by symmetry. Now flatten the Earth, keep the coordinates, and measure with a ruler: the mirror twins stop agreeing, and how they disagree depends on which flat map you chose. Two pairs are shown, in different directions and regions.

Globe: great‑circle arc
$$(\lambda,\ \varphi)$$
Polar map (AE): straight chord on the disk

One pair of endpoints, three rulers — each model measured *its own way*: the sphere's shortest path on the globe, and honest straight ruler lines on both flat maps. Only the globe's answer matches odometers, flight times, and surveyed distances; the polar disk is the azimuthal equidistant *projection* of the globe, centred on the north pole.

## The three rulers, written out [evidence: prediction]

Each model is asked the same question — how far apart are these two coordinate pairs? — and each answers in its own geometry. These are the three formulas the page actually evaluates for the table above, with nothing hidden inside a function name.

$$\cos\sigma = \sin\varphi_1\sin\varphi_2 + \cos\varphi_1\cos\varphi_2\cos\Delta\lambda$$
$${d_{\text{globe}} = R\,\sigma}$$

The spherical law of cosines, the oldest formula on this page.[1] σ is the angle the two points subtend at the Earth's centre, so the distance is nothing but R times an angle. The code evaluates the equivalent dot product of two unit vectors. For legs of a few kilometres the arccosine is ill-conditioned and the haversine form is the right one to use;[4] at the thousands of kilometres compared here it makes no visible difference.

$$x = R\lambda,\quad y = R\varphi$$
$${d_{\text{cart}} = R\sqrt{\Delta\varphi^2 + \Delta\lambda^2}}$$

The plate carrée, or equidistant cylindrical projection: latitude and longitude read straight off as y and x.[3] Pythagoras then prices every degree of longitude at its equatorial length wherever you happen to be, inflating the answer by roughly 1/cos φ. It stays symmetric across the equator, which is exactly why this map hides the asymmetry while still disagreeing with every odometer.

$$r = R\left(\pi/2 - \varphi\right),\quad \theta = \lambda$$
$${d_{\text{AE}} = \sqrt{r_1^2 + r_2^2 - 2r_1r_2\cos\Delta\lambda}}$$

The azimuthal equidistant projection centred on the north pole, with a straight ruler line laid across it.[3] This is the flat-earth disk, and the record is explicit: the Boston Public Library catalogues Gleason's 1892 original as the globe flattened into a circular plane, and his own patent claim is filed on a projection.[5] Distances on it are true along the radii — any line through the pole — and along nothing else.

## Why the mirror test works, and where the disk's error comes from [evidence: prediction]

$$\text{globe: }\cos\sigma(-\varphi_1, -\varphi_2, \Delta\lambda) = \cos\sigma(\varphi_1, \varphi_2, \Delta\lambda)$$
$$\text{disk: }r(-\varphi) = R(\pi/2 + \varphi) \neq r(\varphi)$$

This is the whole tab in two lines. Flip both latitudes and the spherical formula is unchanged: sin(−φ) appears twice so the two minus signs cancel, and cos(−φ) = cos φ. Mirror-image segments are therefore exactly equal on a globe — not approximately, exactly, and for every value of R. The disk's radius is simply not an even function of latitude, so its answer has to change. No choice of disk size, scale or centring repairs that, because the disagreement is about shape, not size.

$$\text{along a parallel} \quad\text{globe: } d = R\cos\varphi\,\Delta\lambda$$
$$\text{disk: } d = R(\pi/2 - \varphi)\,\Delta\lambda$$
$${\text{ratio} = \frac{\pi/2 - \varphi}{\cos\varphi}}$$

Take the simplest leg there is, due east along a parallel, and both models close into elementary form. R divides out of the ratio, which makes this a radius-free test like the magnetism tab: it constrains the shape alone, whatever the size. The ratio equals 1 only at the pole and rises without bound going south — 1.11 at 45° N, 1.57 at the equator, 3.33 at 45° S, 17.1 at 80° S.

*Figure caption:* **The stretch factor, plotted.** The curve is the ratio above; the teal line at ×1 is what vehicles actually log. The disk never reads short, and never reads true except at the pole. At ±45° the two halves of a mirror pair differ by a factor of three, which is the discrepancy the experiment below asks you to go and settle.

> **One honesty note about that last pair.** A leg flown due east along a parallel is a rhumb line, not the shortest path: between 45° N 0° and 45° N 60° E the parallel measures 4,718 km and the great circle 4,605 km, 2.4% shorter. That approximation is real, and it is not what is being tested — both models are asked for the same parallel-following leg, so the ratio between them is unaffected. The table at the top of this tab avoids the issue entirely by giving the globe its true great-circle answer and the flat maps their own straight ruler lines, and it reaches the same verdict.

## Two legs the globe calls equal — and each flat map breaks a different one [evidence: prediction]

The mirror pairs above leave the cartesian map a way out: its grid is symmetric across the equator, so it keeps mirror twins equal and only inflates them both. This pair closes that door. Two legs, each exactly 60° of arc, chosen so the sphere makes them identical to the kilometre. Neither flat map can hold them equal, and — this is the part worth sitting with — they fail in opposite directions.

$$\text{polar leg: } 60^\circ\text{N } 0^\circ \to 60^\circ\text{N } 180^\circ$$
$$\text{equator leg: } 0^\circ\ 30^\circ\text{W} \to 0^\circ\ 30^\circ\text{E}$$
$${\sigma = 60^\circ \text{ for both} \implies d = 6,672\,\text{km}}$$

Both equalities are exact, not fitted. For the polar leg, cos σ = sin²60° + cos²60°·cos 180° = 0.75 − 0.25 = 0.5, so σ = 60°: the great circle runs straight over the pole, 30° down each side. For the equator leg cos σ = cos 60° directly. Same central angle, therefore the same distance, and R does not need to be known for the two to be equal — only for the 6,672 km. Any route planner returns both numbers.[2]

*Figure caption:* **The same pair under three rulers.** Panel A shows each leg on the great circle that carries it, seen face-on: two identical 60° arcs, which is the whole point — the sphere has no way to distinguish them. Panels B and C are drawn to scale within themselves, so the lengths you see are the lengths each model claims; there is no exaggeration factor anywhere in this figure, and none is needed.

**Equal on the globe by construction; each flat map preserves one leg exactly and breaks the other**

| Segment (endpoints) | Globe great‑circle | Flat cartesian ruler | Flat polar (AE) ruler |
| --- | --- | --- | --- |
| polar 60°N 0° → 60°N 180° | 6,672 km | 20,015 km (+200%) | 6,672 km (0%) |
| equator 0° 30°W → 0° 30°E | 6,672 km | 6,672 km (0%) | 10,007 km (+50%) |

> **Verdict rule, stated in advance.** Go and measure both legs — flight time × ground speed, a GPS track, or published great-circle tables. If they come out equal, the sphere survives and both flat maps are refuted, each by a different leg. If the polar leg really is three times the equator leg, the cartesian map survives and the sphere is refuted. If the equator leg really is one and a half times the polar one, the polar disk survives instead. The three models make three different predictions here, so this single measurement can eliminate at least two of them — and note that no flat map can be rescued by rescaling, since each is already exactly right on one of the two legs.

## See it in 3D · click & drag to orbit [evidence: prediction]

*Figure caption:* **Globe.** Pair A (blue / orange) and pair B (teal / violet): each southern segment is the mirror of its northern twin, so within each pair the great‑circle lengths are **exactly equal**. The arcs look curved because on a sphere the shortest path *is* an arc.

*Figure caption:* **Polar map (the flat‑earth disk).** The same endpoints plotted at r = 90°−φ, θ = λ, joined by *straight ruler lines* — how anyone measures a flat map. Each southern segment comes out far longer than its identical northern mirror, and the two pairs are distorted by different amounts.

**Same endpoints, three rulers — flat maps measured with straight lines, as a ruler would**

| Segment (endpoints) | Globe great‑circle | Flat cartesian ruler | Flat polar (AE) ruler |
| --- | --- | --- | --- |
| A·N 50°N 40°W → 30°N 10°E | 4 692 km | 5 988 km (+28%) | 5 113 km (+9%) |
| A·S 50°S 40°W → 30°S 10°E | 4 692 km | 5 988 km (+28%) | 12 383 km (+164%) |
| B·N 10°N 60°E → 35°N 100°E | 4 909 km | 5 245 km (+7%) | 5 761 km (+17%) |
| B·S 10°S 60°E → 35°S 100°E | 4 909 km | 5 245 km (+7%) | 8 947 km (+82%) |
| C·N 33°N 71°W → 34°N 151°E | 11 369 km | 15 345 km (+35%) | 11 731 km (+3%) |
| C·S 33°S 71°W → 34°S 151°E | 11 369 km | 15 345 km (+35%) | 25 641 km (+126%) |

Experiment 3 · distances

The same east–west trip, north and south

Pick an east–west leg spanning a fixed number of degrees of longitude, and measure how long it really is. Then do the mirror-image leg in the other hemisphere. Book the flights, or read the published great-circle distances and flight times.

Independent variable
**What you change:** the **latitude** of the leg — try +45°, then −45°. You choose which parallel to travel along.

Dependent variable
**What you measure:** the **ground distance actually covered** — odometer, GPS track, or flight time × cruising speed.

IV latitude 45° , span Δλ = 60°
DV globe: this leg 4 718 km · mirror leg 4 718 km → **equal**
DV flat disc: this leg 5 240 km · mirror leg 15 720 km → ratio 3.00×

**Verdict rule:** if the two mirror legs measure the same, the globe survives. If the southern one is really 3.0× the northern one, the disc survives. Airlines settle this daily: Sydney–Santiago is about 11,400 km and is flown non-stop in roughly 12½ hours, which no aircraft could do if it were the ~25,000 km the disc requires.

> **The confusion, named.** The flat‑earth disk (the “Gleason map”) is the azimuthal equidistant projection of the globe. It preserves distances *only along straight lines through the pole*; every east–west distance is stretched by (90°−φ)/cos φ — a factor of 1.11 at 45° N but **3.33 at 45° S**. Treating that projection as the territory forces the southern hemisphere to be three times wider than it measures. Real ships and aircraft cross it anyway: Sydney–Santiago is ~11,400 km and is flown non‑stop in ~12½ hours; on the disk it would be ~25,000 km, longer than any airliner's range.

Why the cartesian ruler also fails. Reading latitude/longitude as x‑y coordinates (a plate‑carrée grid) at least keeps north and south symmetric — but it prices every east–west degree at its equatorial length, inflating both segments by 1/cos φ (+41% at 45°). It hides the asymmetry while still disagreeing with every odometer. Coordinates are *addresses on a sphere*, not distances; the only ruler that returns what vehicles actually log is R·cos φ·Δλ — spherical geometry.

The through‑line. This is the third appearance of the same R: it curves the sightlines in the Simulator, sets k = 1/R in Celestial navigation, and here converts coordinate differences into the distances the world actually measures. One sphere explains all three; each flat model must fail at least one.

**See also**[Cel. nav.](/ai/cnav.md)[Surveying](/ai/surv.md)[GPS](/ai/gps.md)[Seismology](/ai/seis.md)[Azimuth](/ai/azim.md)

## Sources for this tab

1. [1] [Bowditch, *The American Practical Navigator*, Vol. 2 (NGA, 2019; PDF hosted by the US Coast Guard)](https://www.dco.uscg.mil/Portals/9/NMC/pdfs/examinations/bowditch_Vol_2_2019.pdf) — "The Sailings": great-circle and rhumb-line distance computation on the sphere, plus the nautical mile's definition as one minute of arc, which is what ties angle to distance here.
2. [2] [Great Circle Mapper](https://www.greatcirclemap.com/) — segment C is a real scheduled route, Santiago de Chile → Sydney, flown daily in about 12–13 hours; its northern mirror is the identical pair of coordinates reflected across the equator. Any route planner will return the same great-circle length for both, which is the point: the polar disc returns nearly twice as much for the southern one.
3. [3] [J. P. Snyder, *Map Projections — A Working Manual*, U.S. Geological Survey Professional Paper 1395 (1987), DOI 10.3133/pp1395](https://doi.org/10.3133/pp1395) — the standard reference for projection mathematics; the forward equations quoted here for the Azimuthal Equidistant and for the Equidistant Cylindrical (plate carrée) are its own, for the spherical case.
4. [4] [R. W. Sinnott, "Virtues of the Haversine", *Sky & Telescope* 68(2), 158–159 (1984)](https://ui.adsabs.harvard.edu/abs/1984S%26T....68..158S/abstract) — why the arccosine form of the great-circle distance loses precision on short legs, and the haversine that replaces it. Cited here so the formula given above is not mistaken for the one to code up for short baselines.
5. [5] [Norman B. Leventhal Map & Education Center, Boston Public Library — catalogue record for Alexander Gleason, *New Standard Map of the World* (Buffalo, 1892)](https://collections.leventhalmap.org/search/commonwealth:7h149v85z) — the library's own note describes the map as the globe flattened into a circular plane, and records the patent claim, US 497,917. The flat-earth disk is a projection of the sphere by its maker's own filing.

## Further reading

Not cited above, and no claim on this tab rests on it — listed because it is what you would read next, or because it lets you redo the measurement on data this page did not choose.

- [NGA Office of Geomatics — *Department of Defense World Geodetic System 1984* (NGA.STND.0036, v1.0.0, 2014)](https://earth-info.nga.mil/index.php?dir=wgs84&action=wgs84) — where the reference figures used throughout this page are actually defined, rather than merely quoted: semi-major axis a = 6,378,137 m exactly, flattening 1/f = 298.257223563, arithmetic mean radius R_1 = 6,371.0088 km. The standard states that it supplements [IERS Technical Note 36, *IERS Conventions (2010)*](https://www.iers.org/IERS/EN/Publications/TechnicalNotes/tn36.html), which is the civilian side of the same constants. Two defence and scientific standards agreeing on one figure is a stronger check than any single agency; and any flight-booking site's city-pair distances give the same geodesics an independent everyday test.
- **T. Vincenty, "Direct and inverse solutions of geodesics on the ellipsoid with application of nested equations", *Survey Review* 23 (1975), 88–93.** The formula geodetic agencies actually use. This page deliberately works on a sphere; Vincenty is how you check what that simplification costs, which for the legs here is a few kilometres in eleven thousand.
- **Published airline timetables and manufacturer range figures** — for example the Santiago–Sydney and Perth–London services, against the published range of the aircraft flying them. A commercial timetable is a harder thing to wave away than a great-circle calculator: an airline that has mis-stated a flight time by four hours is an airline that has run out of fuel.
