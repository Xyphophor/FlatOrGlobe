# Light bends. Here is exactly how much — and why that does not rescue a flat Earth

> Tab "Refraction" of *Flat plane or Globe?*. Web page: /#tab-ref. Generated from the rendered page: same text, same computed numbers and sources; drawings are replaced by their captions and descriptions, formulas are TeX. Licence: content and data CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), Xyphophor (https://x.com/Xyphophor); source code MIT; third-party data keep the licence of their source, cited in each tab.

*Refraction · where R/(1−k) comes from*

*Figure caption:* **Same planet, four atmospheres.** One observer, four horizontal rays differing only in k, each labelled with its own. Curvature is exaggerated; the factor is printed on the figure and the ratios between the arcs are exact.

Every other tab on this page carries a refraction switch. Turn it on and the globe stops using its real radius **R = 6,371 km** and starts using an *effective* radius **R/(1−k)**. That single substitution is the most suspected line on the whole page, so this tab does nothing but justify it: Snell's law first, then the geometry, then the weather that fixes **k**, then the measurements that pin it down.

And then the part nobody expects — the same formula that lets refraction help the globe puts a hard *ceiling* on what refraction is allowed to do, and that ceiling is exactly where the flat model would have to live.

*[Figure: Animation: a light ray bending in thinning air; the ray straightened while the Earth grows to R/(1 − k); on a plane ordinary refraction lifting distant objects; 97 reciprocal survey lines all above the plane's zero; k on one line hour by hour in 1879; the day and night distributions of k from the radiosondes of 2026; the 2019 Worthing–Brighton laser test traced in its measured air on a globe and on a plane; the air each model needs at Caussols; a summary]*

*Figure caption:* **The whole tab in under a minute.** Light bending in thinning air; the same curvature taken from the ray and from the ground, which leaves R/(1 − k); why ordinary refraction lifts distant objects over a plane instead of hiding them; 97 reciprocal lines of the 1800s, all above the plane's zero; one line hour by hour in 1879; the k of 300,000 radiosondes of 2026, by day and by night; the 2019 Worthing–Brighton laser test redone in the air its own thermometers measured; the air each model needs for the dip measured at Caussols. Every number is the page's own. Click to pause.

$$\frac{1}{\rho} = -\frac{\cos\beta}{n}\cdot\frac{dn}{dh}$$
$$k \equiv \frac{R}{\rho}$$
$${R_{\text{eff}} = \frac{R}{1-k}}$$

Three steps, and only the middle one is a definition. A vertical gradient of refractive index bends a ray into a circle of radius ρ; the refraction coefficient k is nothing but the ratio of the ray's curvature to the Earth's; and because only the *difference* of two curvatures can ever be observed, a curved ray over a sphere of radius R behaves exactly like a straight ray over a sphere of radius R/(1−k). Everything below is the proof, the numbers, and the limits.

## What refraction actually is — and which way it bends

The refractive index is **n = c/v**, the speed of light in vacuum over its speed in the medium. Denser air is slower, so it has a larger n: at sea level n − 1 ≈ 2.77 × 10⁻⁴, and at the top of the troposphere about a quarter of that. The atmosphere is a stack of transparent layers whose n decreases upward, and a ray crossing it obeys Snell's law at every level: **n₁ sin θ₁ = n₂ sin θ₂**, θ measured from the vertical.

Which way it bends is clearest from the wavefront — a marching band advancing in line abreast. If the left half steps onto mud while the right stays on tarmac, the left half lags and the line pivots toward the mud. The part of a wavefront in the slower, denser medium lags the same way, so the front swings toward the dense side, and the ray, always perpendicular to it, turns with it.

That is the whole mechanism, and it is why the popular one-liner "light bends toward the denser medium" is nearly right but worth stating precisely:

> **The exact statement.** A ray's *centre of curvature lies on the denser side*. In the Earth's atmosphere, denser means lower, so a near-horizontal ray is concave downward — it bends around the planet rather than away from it.

> Note what this does *not* say: that the ray moves downward. Over a long sightline the ray rides **above** the straight chord between its endpoints, bulging up into the thin, fast air like a lifeguard who runs further along the beach to shorten the swim. Both descriptions are the same curve — one local (which way it turns), one global (where the path goes) — and confusing them is the commonest error in amateur refraction arguments, on both sides.

*Figure caption:* **Snell's law, layer by layer.** Refractive index increases downward. A ray launched slightly upward is bent a little more horizontal at each interface it crosses going up, until it levels off and comes back down. Short ticks are the wavefront, always perpendicular to the ray. The dashed line is the straight chord: the real path lies above it. Index steps are hugely exaggerated so the kinks are visible; in real air there are no steps at all, only a smooth gradient, and the polyline becomes a circular arc.

*Figure caption:* **Two circles, one subtraction.** The planet is one circle; under a uniform gradient the light path is another, of radius ρ = R/k — about 7.7 times larger at k = 0.13. Measured down from the observer's horizontal, the ground falls away by d²/2R and the ray only by d²/2ρ. What an observer can ever see is the *gap* between them. Curvature is exaggerated (factor printed on the figure), but the ratio ρ/R is exact.

## The atmosphere is a measured stack, not a free parameter

Air's refractivity for visible light follows a formula fixed in the laboratory: **n − 1 ≈ 78.8 × 10⁻⁶ · P/T**, with pressure P in hectopascals and temperature T in kelvin. Put in P = 1013 hPa and T = 288 K and you get the 2.77 × 10⁻⁴ quoted above. Nothing here is adjustable — it is a property of nitrogen and oxygen.

To find how n changes with height, differentiate that expression and feed in the one other thing the atmosphere is obliged to do — support its own weight. Hydrostatic balance says dP/dh = −ρ_air g, which for an ideal gas becomes dP/dh = −(g/R_d)·(P/T) = −0.0342 · P/T hPa per metre. Combining the two:

$$\frac{dn}{dh} = -78.8\times 10^{-6}\cdot\frac{P}{T^2}\left(0.0342 + \frac{dT}{dh}\right)$$

P in hPa, T in K, dT/dh in K per metre. This is the entire physical input to everything that follows. Under a standard atmosphere at sea level (P = 1013 hPa, T = 288 K, dT/dh = −0.0065 K/m) it evaluates to **−2.66 × 10⁻⁸ per metre**: the index of air drops by about 27 parts per billion for every metre you climb. That is a fantastically small number, and it is enough to bend a sightline visibly over 50 km.

## Snell's law on a round planet: the ray is an arc of a circle

Applying Snell's law across a stack of *curved* layers gives a conserved quantity, first written down by Pierre Bouguer in 1729 and known ever since as the refractive invariant: **n · r · sin z = constant** along a ray, where r is distance from the Earth's centre and z is the ray's local zenith angle.[1] It is the optical twin of angular momentum, and it falls straight out of Fermat's principle in a spherically symmetric medium.[8] Differentiating it along the path gives the curvature of the ray itself:

$$\frac{1}{\rho} = -\frac{\cos\beta}{n}\cdot\frac{dn}{dh}$$

β is the ray's elevation above the local horizontal, so cos β ≈ 1 for the long, nearly level sightlines this page argues about, and n ≈ 1 always. A ray aimed steeply upward bends far less — which is why the Sun's refraction is 34′ at the horizon and essentially zero at the zenith. With the standard gradient above, ρ = 1/(2.66 × 10⁻⁸) ≈ **37,500 km**; at the page's default k = 0.13 it is ≈ 49,000 km.

> **Yes — under uniform refraction the ray really is a circle, and your two-circle picture is the right one.** Look at the formula: if dn/dh is constant over the slab of air the ray occupies, then 1/ρ is constant, and a curve of constant curvature is a circular arc. So the geometry reduces to exactly two circles — the Earth of radius R, and the light path of radius ρ, sharing a common vertical at the observer and slowly separating.

> **Three honest caveats.** First, dn/dh falls off with height, so the arc is only *locally* circular and a ray climbing several kilometres straightens out. Second, cos β means a steep ray curves less than a flat one, so “one ρ” holds only for near-horizontal rays. Third, the approximation needs h ≪ 8 km, the atmosphere's scale height, which every terrestrial sightline satisfies. Within those limits the circular arc is geodesy's standard working tool, not a simplification invented for this page.[3]

## Subtracting one curvature from the other: R/(1−k), derived

Now the step everything else on this page depends on. Define the refraction coefficient as the ratio of the two curvatures: **k ≡ R/ρ** — how much of the Earth's curvature the light path already imitates. Stand an observer on the sphere and drop a horizontal tangent line from the eye. Over a horizontal distance d:

- ray radius ρ = **49,008 km**
- Earth radius = **6,371 km**
- unbent **0%**
- hidden at 100 km = **683 m** unchanged

*Figure caption:* **Watch the gap, not the arcs.** Press play and the whole scene is bent by one common amount until the light comes out straight — subtracting 1/ρ from the ray and from the ground at the same time, which is the only move the derivation above makes. The ray unrolls from a 49,000 km arc into a line; the planet swells from 6,371 km to 7,323 km. And the orange bar, the amount of the far pole that sits below the line of sight, does not move by a single pixel, because it is set by the *difference* of the two curvatures and that difference is what the subtraction leaves alone.

*Figure caption:* Everything an observer could measure lives in that bar. Curvature is exaggerated so that any of this is visible at all — the factor is printed on the figure, and every ratio between the drawn arcs is exact.

$$x_E = R\left(\sec\frac{d}{R} - 1\right) \approx \frac{d^2}{2R}$$
$$x_L \approx \frac{d^2}{2\rho} = \frac{k\,d^2}{2R}$$
$$x_E - x_L = (1-k)\frac{d^2}{2R} = \frac{d^2}{2R_{\text{eff}}}$$

One line of algebra, and R_eff = R/(1−k) drops out. The point is not the algebra but what it means: no observation can separate "the ground curved away from me" from "my line of sight curved down with it". Only the difference of the two curvatures is ever visible. So you may legitimately subtract 1/ρ from both, which straightens the ray and leaves a sphere of curvature (1−k)/R. Curved ray over a real Earth ⇔ straight ray over a bigger fictitious Earth. Exactly equivalent, to second order in d/R.

### Why a curved ray over R is exactly a straight ray over R/(1−k)

Snell gives the ray its own curvature; one subtraction gives the equivalence; and the last two lines price what the subtraction throws away

$$n\cos\beta = \text{const}$$
$$\frac{d\beta}{ds} = \frac{\cos\beta}{n}\frac{dn}{dh}$$
$$\frac{1}{\rho} = -\frac{\cos\beta}{n}\frac{dn}{dh}$$
$$y_{\text{ground}} = -\frac{x^2}{2R}$$
$$y_{\text{ray}} = \beta x - \frac{x^2}{2\rho}$$
$$H(x) = y_{\text{ray}} - y_{\text{ground}} = \beta x + \frac{x^2}{2R}(1-k)$$
$$H(x) = \beta x + \frac{x^2}{2R_{\text{eff}}}$$
$$\frac{1}{R_{\text{eff}}} = \frac{1-k}{R} \implies R_{\text{eff}} = \frac{R}{1-k}$$
$$R\left(\sec\frac{d}{R} - 1\right) = \frac{d^2}{2R} + \frac{5d^4}{24R^3} + \ldots$$
$$\text{residue} = \frac{5d^4}{24R^3}\cdot 3k(1-k)$$

Line (1) is Snell's law in an atmosphere stratified into level layers, with β the ray's elevation above the local horizontal: it is conserved along the whole ray. Differentiate (1) with respect to arc length s, using dh/ds = sin β; the sin β cancels from both sides and (2) is what is left. The ray turns at exactly that rate, so its curvature is (3) — which is the first line of the formula block near the top of this tab, now derived rather than quoted. Nothing has been assumed but Snell's law and layers that are level. Now put x along the tangent plane at the observer and y upward. To second order the ground falls away as (4), and a ray leaving at elevation β with the constant curvature (3) follows (5). The ray's height above the ground is the difference of the two, which is (6), where k ≡ R/ρ. A straight ray over a sphere of radius R_eff would instead give (7). Compare (6) with (7): they agree at every distance x and for every launch angle β if and only if (8). That is the equivalence — not an analogy but an identity between two parabolas, and it is why every other tab on this page may swap R for R_eff and otherwise pretend light travels in straight lines. What that second order costs is line (9): both (4) and (5) are truncated circles, and keeping the next term on both sides leaves the residue (10). Over d = 100 km at k = 0.13 that residue is 2.7 cm, against a ray-above-ground of 683 m — four parts in 100,000, and roughly a thousand times smaller than the ±0.03 that k itself is known to. That is the caveat stated below this section, with a size on it.

This is why k, and not ρ, is the number quoted everywhere: it is dimensionless and it is already the answer. k = 0.13 gives R_eff = 1.149 R, the value Gauss used for continental sightlines. k = 0.143 gives exactly 7/6 R — the classic surveyor's rule of thumb. Radio engineers, whose wavelengths bend rather more, use k = 0.25 and call it the "4/3 Earth". And k = 0.17 is the standard atmosphere at sea level, which the hidden-height tab uses when it concedes the world-record sighting.[3]

**What each k costs you — computed live from the formulas above, R = 6,371 km, eye height 2 m**

| Refraction coefficient k | Ray radius ρ = R/k | ρ / R | R_eff / R | Horizon from 2 m | Hidden at 20 km |
| --- | --- | --- | --- | --- | --- |
| **0.000** · vacuum / straight rays | ∞ | ∞ | 1.000 | 5 km | 18 m |
| **0.130** · Gauss, continental — this page's default | 49,008 km | 0.13× | 1.149 | 5 km | 15 m |
| **0.143** · the classic 7/6-Earth survey rule | 44,552 km | 0.14× | 1.167 | 5 km | 14 m |
| **0.170** · ICAO standard atmosphere, sea level | 37,476 km | 0.17× | 1.205 | 6 km | 14 m |
| **0.250** · the 4/3-Earth radio rule | 25,484 km | 0.25× | 1.333 | 6 km | 12 m |
| **0.340** · measured maximum, clear night | 18,738 km | 0.34× | 1.515 | 6 km | 10 m |
| **1.000** · ducting — the flat model in disguise | 6,371 km | 1.00× | ∞ | ∞ | 0 m |
| **-1.000** · hot ground, first metres | −6,371 km | −1.00× | 0.500 | 4 km | 42 m |

A caveat this page owes you. The other tabs feed R_eff into the *exact* secant formulas rather than into the parabolic approximation the derivation above used. Strictly, the equivalence is only second-order in d/R, so the two disagree slightly at very long range. The disagreement is several orders of magnitude smaller than the uncertainty in k itself, which is why every geodesy textbook does the same thing — but it is an approximation, and it should be named rather than buried.

## What sets k? Weather, and nothing else

Multiply the gradient formula by R and you get the working expression every surveyor knows, usually attributed through Gauss to the modern form given in Torge's *Geodesy*:[3]

$$k = 503\cdot\frac{P}{T^2}\left(0.0342 + \frac{dT}{dh}\right)$$

P in hPa, T in K, dT/dh in K per metre. Read what it says. Pressure and temperature move k by a few per cent — a mountain top has thinner air and refracts less. But the bracket is the whole story, and only one term in it can change: the **temperature gradient**. Everything interesting about refraction, including its sign, is decided by how fast the air cools as you climb.

The number 0.0342 K per metre in that bracket has a name and a meaning. It is the **autoconvective lapse rate**, 3.42 °C per 100 m: the rate of cooling at which the fall of pressure and the fall of temperature exactly cancel, so the *density* of the air is the same at every height.[6] An atmosphere cooling at precisely that rate is optically homogeneous, and light crosses it in perfectly straight lines: k = 0.

Cool more slowly than that — which is what real air normally does — and density falls with height, so rays bend down and k is positive. Cool faster, as air does in the first metre above sun-baked asphalt, and density *increases* upward: rays bend up, k goes negative, and you get the puddle mirage on the road ahead.

**The same formula across real conditions (P = 1013 hPa, T = 288 K) — k is computed, not chosen**

| Condition | dT/dh | k | Ray curvature vs Earth's | What you see |
| --- | --- | --- | --- | --- |
| Hot asphalt or sand, first metres | −0.2000 K/m | **−1.02** | 1.02×, opposite sign (upward) | inferior mirage — the “puddle” on the road, images inverted |
| Autoconvective — density constant | −0.0342 K/m | **0.00** | 0 — straight | perfectly straight rays; the purely geometric horizon |
| Sunny afternoon, ground layer | −0.0179 K/m | **0.10** | 0.10× the Earth's, same sign | measured daytime minimum over a test network |
| Dry adiabatic | −0.0098 K/m | **0.15** | 0.15× the Earth's, same sign | well-mixed convective day |
| ICAO standard atmosphere | −0.0065 K/m | **0.17** | 0.17× the Earth's, same sign | the textbook value used by almanacs |
| Isothermal layer | 0.0000 K/m | **0.21** | 0.21× the Earth's, same sign | overcast, calm; light lifting of distant objects |
| Clear calm night over land | 0.0200 K/m | **0.33** | 0.33× the Earth's, same sign | measured nocturnal maximum; looming, towering |
| Inversion of +12.9 °C per 100 m | 0.1290 K/m | **1.00** | 1.00× the Earth's, same sign | ducting: Fata Morgana, Novaya Zemlya effect |

## When k changes with height: layered air, sinking, looming and mirages

Everything above assumed one gradient over the whole path, which makes the ray an arc of a circle and lets one number, k, describe it. That is a good description for a sightline well above the ground, through air that cools at a steady rate. It is not a good one for a ray that skims a surface. Within a few metres of water or ground the gradient is set by the surface. It is strongest at the bottom and fades with height, roughly as the logarithm of height. So a ray that passes 50 cm above the water bends far more than one that passes 10 m above it, and two points of the same scene, seen by the same eye, can be seen through different values of k.[14]

$$\frac{1}{\rho(h)} = \frac{k(h)}{R},\qquad k(h) = 503\cdot\frac{P}{T^2}\left(0.0342 + \frac{dT}{dh}(h)\right)$$

The same formula as before, applied at each height: the ray's curvature at a given moment is set by the gradient of the layer it is crossing. Over a stack of layers the ray is no longer a circle. The single k of R/(1 − k) is then an average over the heights the ray crosses, and different rays have different averages.

**What layered air does to a picture.** First, it changes the vertical scale. If the low rays bend more than the high ones, the bottom of a distant object is squeezed or pushed down (sinking) or stretched and lifted (looming), while its top is drawn almost normally. Second, when the gradient near the surface is strong enough, low rays turn back before reaching the surface and an inverted copy of the scene appears under it: an **inferior mirage**. It is the wet-looking road on a hot day, and over water warmer than the air it is the bright strip under distant boats and shores. When warm air lies over cold water, the opposite happens: rays are trapped, distant things loom higher, and stacked or inverted images appear above them (**superior mirage**, the Fata Morgana).[14][15] Third, one scene can need several values of k at once. The [Contributions](/ai/contrib.md) tab measures this on two photographs of a tower 13 km across Gulf St Vincent: the bending that hides the foot of the tower places a building on the shore 2.3 km behind it about 1.5 m too low.

**What this site does about it.** The standard k = 0.13 describes rays well above the surface. The tabs that depend on refraction say so wherever a sightline skims water, and treat such lines as weak tests. The reciprocal zenith angles of the next section measure the refraction of the line actually used, at the moment it is used. And the traced rays of the contributions tab follow the bending layer by layer instead of using one k.

> **The flat model's best tool, and its limits.** Layered air is the strongest version of the refraction argument. A cold layer over warmer water bends low rays upward, and on a plane that alone can hide the foot of a distant object, as a hot road hides the road. Its limits can be measured. It acts within the layer, so it changes with the weather and the tide of the air, not with distance in the steady way curvature does. It leaves marks in the picture: squeezed bottoms, mirrored strips. And it needs a measurable temperature difference, which a thermometer at the water and one a few metres up can check. **What would vindicate the plane:** distant feet hidden by the amount the globe predicts, day after day, with thermometers showing no layer at all.

## k is measured, not assumed — and here is the instrument [evidence: check — Where the radius enters: k is derived from the angle s/R, which uses the radius.]

The charge that refraction is a fudge factor would be fair if k could only ever be inferred from the answer you wanted. It cannot. Surveyors have measured it directly for two centuries with **simultaneous reciprocal zenith angles**: two instruments, one at each end of a line of known length s, each measuring the angle down from its own local vertical to the other, at the same instant so both see the same air.

$$z_A + z_B = 180^\circ + \gamma(1-k),\quad \gamma = \frac{s}{R}$$

γ is the angle the line subtends at the Earth's centre — 16.19′ over 30 km. With no refraction the two zenith angles would sum to 180° + γ; refraction bends both rays down, subtracting kγ. The two station heights cancel out entirely: they never appear. Simultaneity matters because k swings through the day, and it is what makes the two rays share one atmosphere.[7]

$$z_A = \zeta_A - \delta_A,\quad z_B = \zeta_B - \delta_B$$
$$z_A + z_B = 180^\circ + \gamma - (\delta_A + \delta_B)$$
$$z_A - z_B = \zeta_A - \zeta_B - (\delta_A - \delta_B)$$

What reciprocal observation actually cancels — and it is not what most people remember. Write each reading as the straight-line zenith angle ζ minus the refraction angle δ that lifts the far station, line (a). Add the two, line (b): the geometry contributes 180° + γ and the two refraction terms **add**, giving 180° + γ(1 − k) with δ_A = δ_B = kγ/2. Subtract them, line (c): the two refraction terms **cancel**, and so does the curvature, leaving nothing but the height difference between the stations — which is why reciprocal trigonometric levelling is famous for being refraction-free, and it genuinely is.

Run over test networks with lines from 4 to 23 km, this method returns a mean k of about **0.10 in daylight rising to 0.34 at night**, when the ground has cooled and inversions form.[5] A 2010 study at ETH Zurich parked two pairs of total stations over grass and logged k continuously at minute-scale resolution, watching it oscillate with the surface heat flux exactly as the temperature-gradient formula predicts.[4] k is not a knob. It is a weather observation, and it behaves like one.

> **The circularity objection, taken seriously.** A sharp reader will notice that γ = s/R uses the very radius the exercise is supposed to be testing, so measuring k this way assumes a globe. That is true, and it matters — which is why the page does not rest on it.

> Two replies. First, R is over-determined elsewhere on this page by methods that never use k: great-circle distances flown daily, the magnetic dip law, the analemma, four-satellite GPS closure. Second, the *qualitative* result needs no R at all: on a plane, reciprocal zenith angles sum to **180° or less** — exactly 180° for straight light, less for the downward-bending light of normal air. Surveyors measure sums above 180°, everywhere, by an amount growing with distance. No value of k on a plane produces that sign.

**One line, ten sessions.** The surveyor Jesse Kozlowski observed simultaneous reciprocal zenith angles over a 1.5 km stretch of Route 206 in New Jersey, between two marks he had fixed by GNSS, with the line of sight 1.5 to 1.7 m above the ground: in November 2015, on three days of November 2016, and in 2018 on remade marks[13]. The angle between the two verticals, γ, comes from those coordinates: 49.9″ (52.1″ in 2018). The excess the theodolites read ranged from 3″ to 75″, so k = 1 − ε/γ ranged from **+0.94 to −0.48** on the same line. It was positive on two days and negative through a whole November midday (six sets from 10:05 to 14:28, k between −0.21 and −0.48), when the light bent upward over the road.

*Figure caption:* The setup, seen from the side. Two total stations on tripods over marks at mile posts 27 and 28, 1.54 km apart along the road, sight each other at the same moment; each reads the zenith angle of the other from its own vertical. The two verticals are γ = 49.9″ apart, the angle between the two GNSS positions seen from the Earth's centre. Over cool ground the light arches up and the sum z₁ + z₂ exceeds 180° by less than γ; over a road warmer than the air it sags and the excess exceeds γ[13].

*[Figure: Map of the Route 206 line in New Jersey: marks at mile posts 27 and 28, 1.54 km apart along the highway, north up]*

*Figure caption:* Where: the two marks on the shoulder of US Route 206 in New Jersey, at the coordinates Kozlowski published for 2015–2016 (NAD83, adjusted on the CORS stations NJTW and NJGC)[13]. The 2018 marks were remade a few tens of metres away. Map data © OpenStreetMap contributors (ODbL), to scale of its 500 m bar.

*Figure caption:* k for each session on the Route 206 line. Below zero, refraction lowers the far mark instead of lifting it and the zenith angles sum to more than geometry alone gives; above zero, to less. The standard 0.13 is an average over many conditions, not a promise for one line at 1.6 m[13].

> **Where the radius enters here.** A GNSS receiver measures its position in a frame centred on the Earth's centre of mass, the point the satellites orbit, and its latitude and longitude are the direction of that position, corrected for the flattening. Seen from the centre, two receivers 1.5 km apart are γ = s/|r| apart, where |r|, about 6,369 km, is their distance from the centre as the satellite system gives it. The radius is measured, not assumed, but it comes from the satellite ephemerides: k = 1 − ε/γ is the old formula k = 1 − ε·R/s with the GNSS radius in place of 6,371 km. This line measures k, not R, and it counts as a check like the rest of this section. Its lesson is the spread: near the ground k is weather, and it takes either sign.

**The same question asked of a dip: what air does each model need?** On 13 June 2026 the sea horizon was measured 65.0′ below level from the plateau de Caussols, 1,210 m above the sea (between 62.2′ and 67.0′ depending on how the photograph is read: dip tab). The ray that grazes the sea and reaches the eye crosses every layer of air in between, but in air made of layers only its two ends count. On the globe the layers are spherical and n·r·cos α keeps its value along the ray (Bouguer); over a plane they are flat and n·cos α keeps its value (Snell).[1] So each model fixes the refractive index the air at the eye must have, given the air at the sea, and that index is a temperature at the eye's pressure.

$${n_{\text{sea}}\,R = n_{\text{eye}}\,(R + h)\cos\delta},\qquad n_{\text{sea}} = n_{\text{eye}}\cos\delta$$

δ is the measured dip, h the eye's height, R the globe's radius, n the refractive index of the air at the sea and at the eye, n − 1 = 79.01·10⁻⁶·P/T (P in hPa, T in K). On the plane, cos δ < 1 demands n_eye > n_sea: a sea seen below eye level needs air at the eye that bends light more than the air at the water.

*[Figure: Two gauges, the globe on the left and the plane on the right, around a chart of temperature against height from the sea to the eye at Caussols, 1,210 m. The black lines are the air of 13 June 2026, about 20 °C at both ends. The blue line ends near −5 °C at the eye: the air the globe needs for the measured dip. The orange line ends near −118 °C: the air the plane needs. The gauges give the same as mean temperature gradients, in kelvin per 100 m.]*

*Figure caption:* **What each model asks of the air for the dip measured at Caussols.** Centre: temperature from the sea (left end, the ERA5 2 m air over the sea, 21.9 °C at 1,021 hPa) to the eye at 1,210 m (889 hPa). Only the two ends count, so each profile is drawn as a straight line. Black: the air of that afternoon, 22.2 °C at the eye from ERA5 and 19.1 °C in the free air over the sea from AROME (dashed). Blue: what the globe needs, −5 °C at the eye (−16 to 11 °C over the readings of the photograph, shaded). Orange: what the plane needs, −118 °C. Grey dashes: the air in which the eye's index equals the sea's, light straight on average, −16 °C. **The gauges**, as in the contributions tab, give the mean gradient between the sea and the eye in kelvin per 100 m: black, that day's air; coloured, what each model needs and its range. The dotted lines are the dry adiabatic (−0.98) and autoconvective (−3.4) lapse rates. Rule 2: the plane gets the same dip, the same heights and the same air at the sea.

The plane needs the air at the eye at −118 °C (155 K): −11.5 K per 100 m over the whole 1,210 m, more than three times the rate at which air becomes denser at the top than at the bottom and overturns.[6] That afternoon the air fell by −0.2 to 0.0 K per 100 m. The globe needs −5 °C at the eye, −2.2 K per 100 m: colder than the day's air too, which is the dip tab's own finding that the measured dip is a few minutes deeper than the air predicts and points at the camera rather than the air. Across the readings of the photograph the globe's need runs from cold to mild (−16 to 11 °C); the plane's stays near −120 °C whatever the reading. A difference of minutes of arc on the globe is a difference of more than a hundred kelvins on the plane.

**The same question asked of a hidden height: the balcony near Antibes.** On 28 March 2026 at 17:34, a photograph taken from a balcony near Antibes, the eye 41.6 m above the sea, shows Bordighera across 49 km of water ([Hidden height tab](/ai/hh.md)). The sea hides the bottom 44.8 m of the Villa Regina Margherita, give or take 1 m (the sea line on the photograph, the roof in the Liguria LiDAR, the level of the sea). A dip depends only on the air at its two ends; a hidden height does not. The ray that grazes the sea half way is bent most in the lowest metres, where the temperature changes fastest, so the whole profile counts and the air must be described by its physics. Over the sea the lowest tens of metres follow the surface-layer similarity of Monin and Obukhov, set by the sea's temperature, the air at 2 m, its humidity and the wind.[20] The reanalysis gives them for that minute: sea 14.6 °C, air 14.1 °C at 2 m (−0.5 K from the sea), wind 6.9 m/s.[19] Keep the sea, the wind and the humidity, and let the air's temperature be anything: for each air − sea difference from −10 to +4 K, rays are traced from the eye over a sphere of 6,371 km and over a plane, and the height they hide at 49 km is read. The same family of airs for both models.

$$T(z) = T_{s} + \frac{\theta_{*}}{\kappa}\left[\ln\frac{z}{z_{0}} - \psi\left(\frac{z}{L}\right)\right] - \Gamma z$$
$$\frac{d\theta}{dx} = {\frac{1}{R}} + \frac{1}{n}\frac{dn}{dz},\qquad \frac{d\theta}{dx} = \frac{1}{n}\frac{dn}{dz}$$

First line: the temperature at height z over the sea, T_s the sea's surface, θ_* the temperature scale of the heat the sea gives the air, κ = 0.4, z_0 the roughness length for heat, ψ the stability correction and L the Obukhov length, both fixed by the air − sea difference and the wind, Γ = 0.98 K per 100 m.[20] Second line: the ray's slope θ against the local level changes with distance x by the bending of the air, (1/n)·dn/dz, plus, on the globe only, the turning of the level itself, 1/R (small slopes; fog traces the exact equations in 5 m steps). The figure: five of these profiles over the sea of 28 March, from air 3 K colder than the sea to 0.5 K warmer.

*[Figure: Two gauges, the globe on the left and the plane on the right, around a chart of temperature against height from the sea to the eye near Antibes, 41.6 m. The black curve is the air of 28 March 2026, from 14.6 °C at the sea surface to 13.6 °C at the eye, with a grey band for half a kelvin either way. The blue curve is the air the globe needs to hide 44.8 m of the Villa Regina Margherita, a little warmer, 14.6 °C at the eye. The orange curve is the air the plane needs, colder, 11.2 °C at the eye. The gauges give the same as mean temperature gradients, in kelvin per 100 m.]*

*Figure caption:* **What each model asks of the air for the height hidden at Bordighera.** Centre: temperature from the sea surface (14.6 °C) to the eye at 41.6 m, the whole profile this time. Black: the air of that evening in the reanalysis, 13.6 °C at the eye; the grey band moves the air − sea difference by ± 0.5 K, a reanalysis' usual error over the sea. Blue: the air in which the globe's rays hide 44.8 m at 49 km, +0.27 K from the sea. Orange: the plane's, −2.66 K. **The gauges** give the mean gradient between 0.5 m and the eye, in kelvin per 100 m: black, the day's and its band; coloured, what each model needs, with the range that the 1 m margin on the hidden height gives (narrow here). The dotted lines are the dry adiabatic (−0.98) and autoconvective (−3.4) lapse rates. Rule 2: the plane gets the same photograph, eye, distance, sea, wind and humidity.

In the day's air the globe hides 93 m at the villa, twice what the photograph shows, and the plane hides 0: on a plane ordinary air lifts the far shore, it never hides it. To hide 44.8 m, the globe needs the air at 2 m +0.8 K warmer than the reanalysis has it, −0.72 K per 100 m instead of −1.35; the plane needs it −2.2 K colder, −2.62 K per 100 m, beyond the dry adiabatic rate. Neither need is extreme in itself: both stay far from the autoconvective rate. The difference is that the globe's need sits just above the band of the day's air and the plane's well below it. Two things make this case less sharp than Caussols. Near the surface, half a kelvin changes the hidden height by tens of metres on the globe (its curve steepens towards a duct, which is why its range is so narrow); and a reanalysis cell 25 km wide does not know the air of this line of sight to better than about half a kelvin. The next section puts this photograph with the others.

## Fourteen photographs, one question: how far is each model's air from the day's? [evidence: check — Where the radius enters: the globe's rays are traced over a sphere of 6,371 km; the distances to Bordighera and to the targets and horizons of the contributed photographs come from coordinates; the weather models (ERA5, GFS, AROME) are built on a spherical Earth.]

**Every photograph on this site for which each model was asked what air it needs, side by side.** From this tab, the Caussols dip and the Bordighera photograph above; from the published contributions, Bass Rock seen from East Lomond (KenRDKAB's photograph) and the eleven dips earthlyskeptic read from airliner windows (each analysed in full in the [contributions tab](/ai/contrib.md)). A contribution analysed but not published is left out. The question is always the same: the mean temperature gradient between the bottom of the ray (the sea, or the ground at the horizon) and the eye that each model needs to put the horizon where the photograph shows it, against the gradient of that day's air in the weather models.[19] For a dip only the two ends count (Bouguer and Snell, above); for a hidden height the rays are traced through the day's air with one number changed. Both models get the same margins: the photograph's (the reading of the dip, the hidden height and its error) and the day's air (the spread of the weather models, at least 1 K between the two ends of a dip). **Stated in advance:** the plane would be vindicated if its z stayed within ±2 on most photographs while the globe's did not; the globe would fail if the roles were reversed.

$$z = \frac{g_{\text{need}} - g_{\text{day}}}{\sqrt{\sigma_1^2 + \sigma_2^2}},\qquad \chi^2 = \sum z^2$$

g is the mean gradient dT/dz between the two ends of the ray; σ_1 is the half-width of the model's range on the side of the day's air, σ_2 that of the day's range on the side of the model's: the two margins that face each other. A z between −2 and +2 means the photograph and the day's air agree within their errors; negative, the model needs colder air at the eye. χ² adds the squares: for n independent photographs that agree it is about n. For a dip read from an aircraft the index at the eye changes in step with the dip, while the temperature it stands for runs off to infinity at the low pressures of altitude, so z is computed there on the index, N = (n − 1)·10⁶: the same test on a scale where the margins are symmetric.

*[Figure: A chart with one row per photograph. Each row has a blue dot for the globe and an orange dot for the plane, placed by how many standard errors the air each model needs is from the day's air; a green band marks less than two. The globe's dots stay near the band; the plane's lie far to the colder side. For a series of readings made with one instrument, hollow circles show the same with each model's best constant offset.]*

*Figure caption:* **How far each model's air is from the day's, photograph by photograph.** One row per photograph: this tab's, then the contributions'; a series of readings made with one instrument comes last, below the dashed line. Each dot is z for one model, blue the globe and orange the plane; the green band is |z| < 2. The scale is linear between −2 and +2 and logarithmic beyond, or the plane's rows would not fit. For a series, the hollow circle is the same reading after a constant offset is removed from all its readings, chosen for each model to make its own χ² smallest: an instrument's zero is rarely right to a few tenths of a degree, and the same freedom goes to both. Below, χ² for all, for the independent photographs only, and with the offsets.

**The gradient each photograph needs, in K per 100 m from the bottom of the ray to the eye (in brackets for a series of readings: with each model's best constant offset)**

| Photograph | Eye | Day's air | Globe needs | Plane needs | z globe | z plane |
| --- | --- | --- | --- | --- | --- | --- |
| Caussols dip | 1,210 m | +0.03 | −2.25 | −11.55 | **−1.6** | **−22.5** |
| Bordighera | 42 m | −1.35 | −0.72 | −2.62 | **+1.6** | **−3.8** |
| Bass Rock | 337 m | 0.00 | +2.06 | −12.80 | **+1.6** | **−26.1** |
| #1 flight 1, 730 m | 725 m | −0.10 | −19.32 (−8.74) | −27.69 (−8.09) | **−3.1** (−1.5) | **−5.2** (−3.2) |
| #2 flight 1, 980 m | 979 m | −0.28 | +6.15 (+14.16) | −9.74 (−12.52) | **+1.3** (+3.6) | **−1.7** (−3.7) |
| #3 flight 1, 1,790 m | 1,790 m | −0.43 | −11.37 (−9.16) | −13.95 (−5.17) | **−3.8** (−2.8) | **−6.7** (−3.9) |
| #4 flight 1, 3,370 m | 3,374 m | −0.35 | −4.63 (−2.37) | −7.36 (−4.14) | **−1.4** (−0.5) | **−5.3** (−3.9) |
| #5 flight 1, 3,800 m | 3,800 m | −0.38 | −5.37 (−4.31) | −6.83 (−4.73) | **−2.5** (−1.6) | **−6.7** (−4.4) |
| #8 flight 2, 4,700 m | 4,695 m | −0.48 | −4.78 (−3.86) | −6.02 (−4.58) | **−2.5** (−1.5) | **−7.4** (−4.9) |
| #10 flight 2, 4,700 m | 4,695 m | −0.45 | −4.99 (−4.12) | −6.19 (−4.69) | **−2.5** (−1.6) | **−7.1** (−4.6) |
| #9 flight 2, 4,700 m | 4,695 m | −0.50 | −4.28 (−2.70) | −6.08 (−4.35) | **−1.7** (−0.7) | **−6.6** (−4.4) |
| #11 flight 2, 6,310 m | 6,311 m | −0.56 | −4.40 (−4.19) | −4.77 (−4.31) | **−2.4** (−1.9) | **−5.2** (−3.6) |
| #7 flight 1, 8,670 m | 8,665 m | −0.51 | +3.46 (+∞) | −3.15 (−2.83) | **+0.3** (+1.3) | **−7.1** (−5.2) |
| #6 flight 1, 8,670 m | 8,670 m | −0.50 | −2.70 (−2.18) | −3.21 (−2.99) | **−1.0** (−0.5) | **−4.6** (−3.3) |

**What comes out.** For the photographs that are each an independent test (3), the globe's z are −1.6, +1.6 and +1.6: χ² = 7.9, 3 within two σ. The plane's are −22.5, −3.8 and −26.1: χ² = 1,204, 0 within two σ. At Caussols the plane needs air at the eye more than a hundred kelvins colder than at the sea. Bordighera is its best case: the air it needs there is ordinary, just not that day's (z = −3.8, against +1.6 for the globe). All 14 rows: globe χ² = 64, plane 1,599; with each model's best offset on each series of readings, 45 and 1,394. Median |z|: globe 1.7, plane 6.7. Each contribution says what its own rows show:

**Bass Rock** (contributions tab). On the morning of 9 August 2023 GFS has the column at 0.0 K per 100 m between 2 m and the camera. The globe needs +2.1, z = +1.6; the plane −12.8, z = −26.1. Here the hidden height rests on one family of airs: the GFS column changed uniformly, with the air − sea differences of the weather models as the margin, the same for both models. With the air − sea difference most favourable to it, the plane still needs a fall of more than 11 K per 100 m.

**The eleven aircraft dips** (contributions tab; numbered as there, with the aircraft's height above the sea). Taken as they were read, they give the globe χ² = 56 (5 of 11 within two σ) and the plane 394 (1 of 11). The globe's misses lean one way, 9 of 11 towards colder air: the readings are deeper than the globe in the day's air, as the contribution found. A phone's level is rarely zero to a few tenths of a degree: removing from all eleven readings the constant offset most favourable to each model (globe 0.21°, plane 1.28°, the circles of the figure) brings the globe down to 37 and the plane to 190, with no reading of the plane within two σ (its closest is 3.2 σ away). The globe stays above eleven: the readings scatter more than the margins they were given (0.05° of reading, the tilt from the track log). They come from one phone on two flights, so they are not eleven independent tests. And for a dip the plane keeps a way out this calculation does not cover: a haze edge at a fixed distance instead of a grazing ray; the contribution fits it to these eleven readings, where it does nearly as well as the globe.

> **The plane's best case, and the way out a gradient does not cover.** Every number above gives the plane the same dip, the same heights, the same air at the bottom of the ray and the same margins as the globe, and on a series of readings its own best offset. One way out remains for a dip: a horizon that is not a grazing ray at all but the distance at which haze hides the surface. That edge needs no particular air. It needs a soft edge that moves with the weather where a photograph shows a sharp line; the [Dip tab](/ai/dip.md) sets it against the sea horizon. No haze can do what a hidden height shows, hide the bottom of a building and leave its top: on a plane that takes air bending light downward, the air this section prices.

**Limits.** The day's air comes from weather models, not from thermometers on the line of sight: cells tens of kilometres wide, hourly fields. The floor of 1 K between the two ends of a dip is our choice, the same for both models; a larger one shrinks every z, the plane's as much as the globe's. A hidden height rests on one family of airs (the surface layer over the sea at Bordighera): another family would change both models' needs. Readings made with one instrument share its zero and are not independent tests; the χ² of the independent photographs is given apart. A handful of photographs is few. The test that would settle each one is a thermometer at the eye and one at the sea, read at the minute of the photograph.

## Ninety-seven lines surveyed in 1859–1895: the effective radius, measured [evidence: measurement]

**The US Coast and Geodetic Survey measured both zenith angles of almost every line of its transcontinental triangulation,** to carry heights from the coast to the Rockies, and Charles Schott printed them station by station[16]. We transcribed 302 of them, in eastern Colorado, along the California coast and inland, and around Mount Hamilton, and checked every line against Schott's own arithmetic. 97 lines were measured from both ends. Schott computed the refraction of each one; on the 94 lines he gives, our k agrees with his to ±0.003.

$$E = \zeta_1 + \zeta_2 - 180° = \frac{s}{R}(1-k)$$
$$\frac{s}{E} = \frac{R}{1-k}$$

ζ₁ and ζ₂ are the zenith angles read at the two ends, s the length of the line from the triangulation (bases and angles, no radius). On a sphere the two verticals differ by s/R and the refraction takes back k of it. So s/E is the effective radius R/(1 − k), the one this site uses for sightlines through the air, read from two angles and a length: **7,490 km** in the median line, 7,072 km in dry Colorado, 7,526 km on the California coast.

> **The flat model, at its best.** On a plane both verticals are parallel: with straight light the two angles add to 180°, and with light bent toward the ground, as it is here, to less. Of the 97 lines, every sum is above 180°; the smallest excess is 354″, on a line of 12.2 km, and the excess grows with the length of the line: their correlation is r = 0.998 (a plane gives r near 0), and the line through zero has the slope of an effective radius of 7,467 km. Around it the excesses scatter by 47″, mostly the refraction changing from line to line and from year to year; Schott prints no reading error for each line apart from the adjustment, so no χ²/ν is given. **What would vindicate it:** sums at or below 180°, or an excess that does not grow with the distance.

**The same line, hour by hour.** In September and October 1879 George Davidson's parties at Round Top, 3,173 m up in the Sierra Nevada, and at Jackson Butte in the foothills, 714 m, 72.4 km apart, read each other's zenith angle at the same hour for fourteen days, with thermometers and barometers at both ends[16]. k is 0.145 at night and falls to 0.113 in the early afternoon, every day: the air near the warm lower slope cools faster with height by day. The sum of the two angles stays above 180° at every one of the 210 hours.

*Figure caption:* k on the Round Top–Jackson Butte line, hour by hour, September–October 1879: each dot one simultaneous pair of zenith angles, the line their mean. Dashed: the k predicted from the mean temperatures and pressures at the two ends only, k = 503·P/T²·(0.0342 + ΔT/Δh). It follows the night value and misses most of the afternoon dip, which happens in the air near the ground at the lower end, not in the average lapse between the two stations.

**Limits.** Many lines were observed from each end in a different year, so the two angles did not see the same air: Schott called them non-simultaneous, and they carry part of the scatter. k as a number needs the Earth's radius (k = 1 − R·E/s, with R = 6,371 km); R/(1 − k) does not, which is why it is the quantity given above. The reductions to the station mark and for eccentricity are Schott's, a few seconds at most, and the distances are those of the adjusted triangulation.

## k in the air of 2026: 300,000 radiosondes [evidence: check — Where the radius enters: k = R/ρ is the ray's curvature divided by the Earth's: the radius is its unit.]

**Twice a day, at midnight and noon UT, some seven hundred stations release a balloon that radios back the pressure and temperature of the air it climbs through**[11]. The formula of the section above turns each pair of levels into a k. We computed it for every sounding of 2026 in the NOAA archive, 301,928 soundings from 681 stations, in two layers: the lowest one, from the ground to the first level 50 to 300 m up, the air a sightline near the ground crosses; and the first kilometre, the air between two summits.

*Figure caption:* How often each k occurs in the air measured by the world's radiosondes in 2026, in the lowest layer, by day (Sun above the horizon at launch) and by night. Grey: the value 0.13 the site uses. Orange: k = 1, the air in which a globe looks flat. Below, the median of each station's soundings by latitude band.

**The site's 0.13 is a daytime value near the ground,** and the radiosondes say so: the median of the lowest layer is 0.13 by day and 0.23 by night, when the ground cools the air above it. Half of the daytime values lie between 0.08 and 0.18. Over the first kilometre the spread is narrower, 0.16 by day and 0.18 by night, and k grows towards the poles, where the ground is colder than the air.

> **The air the flat model needs.** R/(1 − k) is infinite at k = 1: a ray curving exactly as the ground does, the globe looking flat. In the lowest layer that air was measured in 1.2 % of the night soundings and 0.2 % of the daytime ones, most of them over the Antarctic plateau, where a cold surface inversion lasts for months (71 % at Concordia); over the first kilometre, in none. **What would vindicate it:** k at 1 or more in most soundings, in every climate, by day and by night.

**Limits.** A radiosonde's lowest reading is taken at the launch site, sometimes over a warm tarmac; the levels are tens to hundreds of metres apart, so the thin layers that make mirages are not resolved; the heights of levels without a printed height are computed from pressure and temperature (the hypsometric equation, a lab constant and g only). Water vapour, under 1 % of the refractivity for visible light, is left out. And k is the ray's curvature divided by the Earth's, so the radius is its unit: a check, not a measurement.

## Laser tests: a widening beam, at night, over water [evidence: prediction]

**A laser across the sea looks like the cleanest test there is.** Fire it level from one shore and look for it from the other: if the water is curved, the bulge should hide it. On 23 February 2019 a group did exactly that between the end of Worthing Pier and the West Pier at Brighton, 15.3 km apart, with lasers and cameras 1 m above the water, and saw the beams.[18] They also measured the air at both ends, which makes the test checkable. Two things decide what the far camera sees, and neither is the shape of the water: the beam is a cone that widens with distance, and the air a metre above water, at night, is the most strongly bending air there is.[12]

$$w(d) = w_0 + \theta\, d$$
$$d_w = \frac{2h}{\theta}$$

θ is the beam's full divergence, w₀ its width at the laser, d the distance, h the height of the laser above the water. A hand-held pointer spreads by about 1 mrad: at 15.3 km its beam is 15.3 m tall, and fired level from 1 m, its lower edge reaches the water at 2 km (on a plane, with straight light). The width decides where some ray points, not whether a ray can get there: if the water's bulge is in the way, no ray of the cone reaches the eye.

**What the globe needs.** Without air, a laser 1 m above the water seen from 1 m above the water 15.3 km away is hidden by 10.8 m: the sea bulges 4.6 m between them. The operators' slides get this right. With the site's k = 0.13 it is still hidden by 9.0 m. For the beam to be seen the air must bend light with a uniform k of 0.78: at that evening's 1,033.6 hPa and about 8 °C, air warming with height by 0.085 °C per metre, that is 0.17 °C between the water and 2 m.

**Why at night.** A laser spot is lost in daylight beyond a few kilometres, so these tests are made after dark. Night is when the air near the surface departs most from the standard 0.13. The radiosondes of the section above give a median k in the lowest layer of 0.13 by day and 0.23 by night, and the air in which a globe looks flat, k ≥ 1, in 1.2 % of the night soundings against 0.2 % of the daytime ones.[11] Davidson's line of 1879 shows the same swing on one line: k 0.145 at night, 0.113 in the early afternoon.[16] Those layers are tens to hundreds of metres thick. The metre just above water bends far more.

**What they measured.** Water keeps its temperature through the night while the air above it warms or cools with the weather, and the difference is concentrated in the first metres.[14] The operators read the air at several heights at both ends with two thermometers good to ±0.25 °C, read to the half degree.[18] At Worthing both thermometers show the air warming with height: about 0.5 °C from just above the water to 0.5 m, no change up to 1.5 m, then another 1 °C by 2 m. That is 1.5 °C in 2 m, nine times what the globe needs, and in those two layers k is about 8 and 13.[17] At Brighton the water was 7.0 °C and the air 7.0 °C at 1.78 m, with readings in between that they call indistinguishable within the precision: any gradient between −0.28 and +0.28 °C per metre fits them, including the 0.085 the globe needs. Their thermometers could not see the air that decides the test. Calm water at grazing incidence is also a mirror: at a milliradian it reflects about 99 % of the light, so a ray that reaches it bounces back up. Ripples a few hundredths of a millimetre high already scatter part of it.

$$\frac{dT}{dh}(h) = \frac{T_{i+1} - T_i}{h_{i+1} - h_i}\ (h_i \le h < h_{i+1}),\qquad k(h) = 503\cdot\frac{P}{T^2}\left(0.0342 + \frac{dT}{dh}(h)\right)$$
$${h″ = \frac{1 - k(h)}{R}},\qquad {h″ = -\frac{k(h)}{R}}$$

h is the ray's height above the water, h″ its curvature measured against the water (blue, the globe; orange, the plane), R the Earth's radius, P and T that evening's pressure and temperature (1,033.6 hPa from ERA5, 8 °C). dT/dh is taken segment by segment between their readings, and above the last one is the gradient that gives k = 0.13. The plane gets the same air, the same beam and the same eye. The figure below traces 81 rays of the beam with these equations, applying each end's air to the whole path: the air offshore was not measured.

*[Figure: Animation: the laser test of 23 February 2019 between Worthing and Brighton, 15.3 km, laser and camera 1 m above the water, on a globe (top) and on a plane (bottom) in the same air, through four airs. With straight light and with the standard air, the globe hides the beam and the plane shows it. In the air measured at the Worthing end the globe shows it directly and the plane by reflection. In the air measured at the Brighton end the globe hides it again.]*

- **Straight light (k = 0)**
- globe: hidden
- plane: seen

*Figure caption:* **The test of 23 February 2019, redone ray by ray.** A 1 mrad laser fired level 1 m above the water, and a camera 1 m up, 15.3 km away. Top, the globe (the sea bulges 4.6 m between them); bottom, a plane with the same air. With straight light and with the standard air, the globe hides the beam and the plane shows it: the test the laser is meant to be. In the air measured at the Worthing end the globe shows the beam directly: the step of 1 °C between 1.5 and 2 m guides it over the bulge. The plane shows it too, but only by reflection off the water (dashed after a first bounce). In the air measured at the Brighton end, flat within their precision, the globe hides it again. The same evening, 15 km apart, two airs give two answers: the air decides, not the shape, and the thermometers were too coarse to tell which air the beam crossed. Every frame is traced; the darker ray is the beam's axis. Click to pause.

> **The flat model's best laser test.** A narrow beam, so that θd is small against what it is meant to reveal: a surveyor's laser at 0.1 mrad spreads 1.5 m over 15.3 km, against a hidden height of 10.8 m. The line well above the water, where k returns to its standard value. Thermometers good to 0.05 °C at 0.25, 0.5, 1, 2 and 4 m at both ends, and on a boat halfway. The beam looked for by day as well as by night, in both directions. **What would vindicate the plane:** under those conditions, again and again, the centre of the beam arriving at the height of a straight line over a plane, on a line long enough for the globe to hide it by several beam widths. **What would vindicate the globe:** the same beam hidden by the predicted amount, with the same thermometers.

**No mirage is not no refraction.** The slides conclude that no refraction occurred because no inferior or superior mirage could be seen. A steady gradient bends light without doubling any image: a mirage needs the gradient to change sharply with height. With k = 0.78 the far shore simply rises into view, intact. **The clean version needs no laser.** Two instruments reading each other's zenith angle at the same moment measure the refraction of the very line they use, and the heights cancel (the sections above). Three targets at equal height above still water answer the question with nothing that spreads. The [Surveying](/ai/surv.md) tab works through the beam-width arithmetic from the instrument's side.

**Which is why a beam skimming water is the worst possible probe of k.** Over water on a warm afternoon the temperature gradient is the steepest and least stable in the lower atmosphere: cold water chills the air touching it, the profile inverts, and k routinely runs several times the standard 0.13 and can pass 1 — light bending as fast as the ground falls away, a globe wearing a plane's appearance. A laser aimed level a metre or two above a lake samples exactly that layer, and because the beam widens, its lower edge samples it even when the centre does not. Such a test measures the duct and reports it as the shape[12].

## The six refraction arguments, answered with numbers

These are the objections as they are actually made, not softened versions of them. Each one deserves a quantity in reply rather than a rebuke.

### 1. "Refraction was invented to save the globe."

Bouguer published the invariant in 1729 and used it to predict the raising of the horizon before anyone was arguing about the shape of the Earth.[8] Refraction tables were in nautical almanacs a century before that argument existed, and Helbronner was applying them to 250 km sightlines across the Mediterranean in 1925. If it had been invented to rescue anything, it would have been tuned to fit; instead the Guinness-record sighting in the hidden-height tab clears the horizon at k = 0.123, *below* the standard-atmosphere value. A rescue device that asks for less than average is not a rescue device.

### 2. "If light bends, it can bend enough to hide things on a flat Earth."

This one fails on sign, not magnitude. To hide a distant object below your sightline on a plane, the ray must curve *upward*, away from the ground — which needs n to increase with height, air denser as you climb. The formula above prices it: temperature falling faster than 3.42 °C per 100 m, sustained over the whole height band of the ray. That happens in the first metre or two over hot asphalt or sand, where it makes inferior mirages — shimmering, inverted, obviously distorted — and it cannot hold over a kilometre of height, because such a column is top-heavy and overturns at once. Refraction of that sign is not a hiding mechanism; it is a *visible*, violently unstable one.

### 3. "k is a free parameter, so the model can fit anything."

It is one number, not a function; it is bounded by measurable weather; and this page refuses to tune it. k is never adjusted per example to make a number come out, examples that quote a k say where it comes from, and there is exactly one k in the whole page, shared by every tab, so it cannot be quietly forked. Above all, every refracted figure is printed *beside* its unrefracted twin: in every row, refraction shrinks the effect and never reverses it.

### 4. "Then strong enough refraction could explain flat-Earth observations anyway."

The most interesting objection, because the algebra answers it exactly. Set k = 1 in R_eff = R/(1−k) and the effective radius becomes *infinite*:

> **k = 1 *is* the flat model.** A flat Earth is exactly what a globe looks like when light curves as much as the ground does. So “refraction explains the flat observations” is not a rival theory: it is the claim that k = 1 always, everywhere, in every wind and season, over ocean, desert and ice. The price is on the table: air warming with height at **+0.129 K per metre — 12.9 °C per 100 m** — over the whole depth of the sightline. Real inversions reach that only in layers a few tens of metres thick over cold water or ice, and there they do not quietly flatten the world: they duct, giving Fata Morganas, stacked and inverted images, and the Novaya Zemlya effect, a slot-shaped Sun days before it should appear.[2][9] These are famous *because* they are rare and grotesque. Meanwhile weather balloons from more than 800 stations have reported the real temperature profile twice a day since 1905,[11] and nowhere in that archive is a permanent global +12.9 °C per 100 m.

### 5. "Refraction lifts distant objects, so it explains the sightings anyway."

It lifts them, but by a bounded amount, and the page's sharpest cases are chosen so that the bound is visible. Take the Viériou photograph from the elevation tab: a plane puts the far summit **8.5′ above** the near one, straight-ray spherical geometry puts it **2.9′ below**, and refraction at k = 0.13 recovers 1.5′ of that, landing at **1.4′ below**. Refraction moved the globe's answer toward the plane's — and then stopped. To close the remaining 9.9′ you would need k = 1, which by the previous paragraph *is* the flat model and carries the +12.9 °C/100 m bill. The photograph, meanwhile, settles it with no instrument at all: the far summit is below.

### 6. "Refraction varies, so no prediction is possible."

It varies within bounds that are themselves measured, and — decisively — it varies in ways that do not mimic curvature. Real k swings between roughly 0.1 and 0.35 with the hour and the surface; the globe's curvature term does not swing at all. So the two are separable by anyone patient enough to repeat a sighting. Refraction changes with the weather; curvature changes with distance squared, everywhere, every day, in the same direction. That is what the ceiling table in the hidden-height tab is testing, and every certified long-distance record sits inside it.

## The four things refraction cannot do

**It cannot give a plane a horizon.** Refraction corrects the *difference* between two curvatures, and a plane has none of its own to correct. Bend the light down over an infinite plane and the sightline meets the ground eventually — but the ground it meets is at your own feet's level, so nothing is ever hidden behind a bulge, because there is no bulge. Worse for the flat model, ordinary downward-bending light on a plane pushes distant objects *up*, not down. It is the wrong sign for every observation it is invoked to explain.

**It cannot reverse the dip of the horizon.** Rise, and a spherical sea horizon drops below eye level by an angle that refraction reduces from √(2e/R) to √(2e/R_eff) — about 12% less at k = 0.13. It shrinks the dip; it cannot make it negative, and it cannot make it zero, which is the flat prediction at every altitude forever. Airline pilots and sextant users correct for dip on every observation.[10]

**It cannot vary correctly by accident.** To reproduce a single constant R across the whole of geodesy, the flat model's refraction would have to depend on distance as d², on nothing else, identically in every azimuth, in every climate, at every hour, for two centuries of surveys. A quantity that is forced to imitate d²/2R exactly is d²/2R.

**It cannot survive reciprocal observation.** This is the cleanest test on the page because the station heights cancel and nothing is left to argue about. On a plane the two zenith angles must sum to at most 180°. On a sphere they sum to 180° + γ(1−k), which for a 30 km line is 180° + 14.1′ at k = 0.13. That is a *sign difference*, not a magnitude difference, and no positive k can rescue it.

[**Experiment 1c · refraction** — to do yourself, with every experiment of the site, in “What would refute each model” →](/ai/falsify.md#xp-ref-1c)

The through-line. Every tab on this page offers refraction as a toggle and prints both answers, because the honest position is not "refraction is negligible" — it is not — but "refraction is measured, bounded, and of known sign". The elevation and hidden-height tabs share one k with this one. The surveying tab shows the reciprocal-angle correction being applied in the field. And the horizon-dip tab shows the 12% that k shaves off the dip without ever touching its sign. One radius, one refraction coefficient, and the two are told apart by the fact that only one of them cares what the weather is doing.

**See also**[Elevation angles](/ai/elev.md)[Hidden height](/ai/hh.md)[Dip](/ai/dip.md)[Twilight](/ai/twi.md)[Observation](/ai/obs.md)

## Sources for this tab

1. [1] [Andrew T. Young, *The Refractive Invariant* (San Diego State University)](https://aty.sdsu.edu/explain/atmos_refr/invariant.html) — derivation of n·r·sin z = constant from Snell's law in a spherically stratified atmosphere, with the consequences for horizon dip and mirages. Young's whole *Atmospheric Refraction* series is the standard modern reference for this material.
2. [2] [Andrew T. Young, *Ducts* (SDSU)](https://aty.sdsu.edu/explain/atmos_refr/duct.html) — the conditions for optical ducting, including the threshold inversion strength (near 0.11 °C per metre for typical conditions) at which rays begin to follow the Earth's curvature, and the superior mirages and Fata Morganas that result.
3. [3] [S. Baselga & L. García-Asenjo, "Practical Formulas for the Refraction Coefficient", *Journal of Surveying Engineering* 140(2), 2014](https://ascelibrary.org/doi/10.1061/(ASCE)SU.1943-5428.0000124) — derives the compact working formulas from the full geometric solution, building on the treatment in W. Torge, *Geodesy* (3rd ed., de Gruyter, 2001), which is where k = 503(P/T²)(0.0342 + dT/dh) comes from.
4. [4] [C. Hirt, S. Guillaume, A. Wisbar, B. Bürki, H. Sternberg, "Monitoring of the refraction coefficient in the lower atmosphere using a controlled set-up of simultaneous reciprocal vertical angle measurements", *J. Geophys. Res. Atmospheres* 115, D21102 (2010)](https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2010JD014067) — continuous minute-scale measurement of k over grass with two pairs of total stations.
5. [5] [K. Ramsayer, "The accuracy of the determination of terrestrial refraction from reciprocal zenith angles", IAU Symposium 89 (1979)](https://www.cambridge.org/core/journals/symposium-international-astronomical-union/article/accuracy-of-the-determination-of-terrestrial-refraction-from-reciprocal-zenith-angles/AFA5B4D0CEB6A574241028995AFE81A9) — test network of lines from 4 to 23 km, observed 40 times each; mean k from 0.10 by day to 0.34 by night.
6. [6] [American Meteorological Society, *Glossary of Meteorology*: "autoconvective lapse rate"](https://glossary.ametsoc.org/wiki/Autoconvective_lapse_rate) — the lapse rate g/R_d ≈ 3.4 °C per 100 m at which density is constant with height, explicitly noted as the dividing line between upward and downward refraction.
7. [7] [D. Tsoulis, S. Petrovic, N. Kilian, "Theoretical and Numerical Aspects of the Geodetic Method for Determining the Atmospheric Refraction Coefficient Using Simultaneous and Mutual Zenith Observations", *J. Surveying Engineering* 134(1), 2008 (GFZ open copy)](https://gfzpublic.gfz.de/rest/items/item_236880_2/component/file_236879/content) — the exact geometry behind z_A + z_B = 180° + γ(1−k) and the iterative solution for k.
8. [8] ["L'invariant de Bouguer et ses conséquences", *Comptes Rendus Physique* (Académie des sciences, 2023)](https://comptes-rendus.academie-sciences.fr/physique/item/10.5802/crphys.115.pdf) — Bouguer's 1729 prize essay, the invariant that bears his name, his refraction integral and his prediction of the hillingar (looming) effect.
9. [9] [Atmospheric Optics, *Novaya Zemlya Effect*](https://atoptics.co.uk/blog/novaya-zemlya-effect-opod/) — what ducting actually looks like: a slot-shaped Sun channelled hundreds of kilometres inside an inversion layer, first recorded by Barentsz's crew in 1597 and sketched by Nansen in 1894.
10. [10] [Bowditch, *The American Practical Navigator*, Vol. 2 (NGA, 2019; PDF hosted by the US Coast Guard)](https://www.dco.uscg.mil/Portals/9/NMC/pdfs/examinations/bowditch_Vol_2_2019.pdf) — tabulated refraction and dip corrections, applied to every sextant sight taken at sea; ~34′ of refraction at the horizon, falling to zero at the zenith.
11. [11] [NOAA NCEI, *Integrated Global Radiosonde Archive* (IGRA v2)](https://www.ncei.noaa.gov/products/weather-balloon/integrated-global-radiosonde-archive) — soundings from more than 2,800 stations, earliest data from 1905, around 800 reporting in near real time: the observational record of the temperature profile that k depends on.
12. [12] [flatearth.ws — flat-earth laser tests are misleading](https://flatearth.ws/laser) — the practice described from the outside, with the arithmetic quoted above in its own terms: at 1 mrad of divergence a beam is about 10 m wide at 10 km, so an observer in the middle of it can move 5 m vertically and still see it. Listed here for what it documents about the method, not as a source for any physical constant on this tab.
13. [13] J. Kozlowski, [One mile level line](https://jessekozlowski.wordpress.com/2016/11/24/one-mile-level-line/) (2016) — Route 206, mile posts 27 to 28, New Jersey: the GNSS adjustment of the two marks (NAD83, from CORS NJTW and NJGC), the 2015 reciprocal sets and the six sets of 17 November 2016 with their times. The sessions of 6 and 14 November 2016 and of 2018 are from his [Zenith Angle Projects](https://walter.bislins.ch/blog/media/2004-04%20Zenith%20Angle%20Projects%20Jesse%20Kozlowski.pdf) table (PDF hosted by W. Bislin, who evaluated the same sessions independently).
14. [14] A. T. Young, [An Introduction to Mirages](https://aty.sdsu.edu/mirages/mirintro.html) (San Diego State University): ray bending in layers with large changes of thermal gradient; inferior and superior mirages, looming and sinking.
15. [15] W. H. Lehn, "Atmospheric refraction and lake monsters", *Science* 205 (1979) 183–185: images of distant objects stretched, squeezed and stacked by a thermal inversion over cold water.
16. [16] C. A. Schott, [*The Transcontinental Triangulation and the American Arc of the Parallel*](https://geodesy.noaa.gov/library/pdfs/Special_Publication_No_4.pdf), U.S. Coast and Geodetic Survey Special Publication No. 4 (Washington, 1900), Part II, Determination of heights: abstracts of resulting zenith distances, eastern Colorado (pp. 257–261), the Pacific coast and Mount Diablo (pp. 269–275), Mount Hamilton (pp. 300–302); his coefficients of refraction m = k/2 (pp. 262, 276–277, 302); G. Davidson's hourly zenith distances and meteorological record at Round Top and Jackson Butte, September–October 1879 (pp. 280–292). Our transcription, read by `fog build surv-zenith`.
17. [17] [Metabunk — why flat-earth laser tests are misleading](https://www.metabunk.org/threads/why-flat-earth-laser-tests-are-misleading.10625/), the working thread on the Brighton laser test over the sea: the test's readings as summarised by Mick West: a standard green laser of 1.0 mrad divergence, lasers and cameras 1.0 m up, and "the air above the water 0.5°C cooler than the air at 1.0m", with "1.5°C thermal inversion over 2m". A discussion forum rather than a journal; the full tables are the operators' own [18] (also the Surveying tab's source for the same test).
18. [18] Dr John D., [PIER2PIER 2 – Results & Observations](https://www.youtube.com/watch?v=uJ3TLdcVNfA) (YouTube), the operators' presentation of the Worthing–Brighton laser test, 23 February 2019: the two sites, 15.3 km apart, lasers and cameras 1 m above the tide; the thermometer tables at both ends (two thermometers, ±0.25 °C) and the tide predictions used. The figures of the laser section are computed from those tables.
19. [19] H. Hersbach et al., [“The ERA5 global reanalysis”](https://doi.org/10.1002/qj.3803), *Q. J. R. Meteorol. Soc.* **146**, 1999–2049 (2020), and the sea-surface temperature of the [Open-Meteo marine API](https://open-meteo.com/en/docs/marine-weather-api), read through the [Open-Meteo historical weather API](https://open-meteo.com/en/docs/historical-weather-api) by `fog build ref-bordighera`: air and dew point at 2 m, wind at 10 m and surface pressure at three sea points south of the Antibes–Bordighera line (43.5° N; 7.25, 7.5, 7.75° E), 28 March 2026, interpolated to 17:34.
20. [20] T. Foken, “50 years of the Monin–Obukhov similarity theory”, *Boundary-Layer Meteorology* 119 (2006) 431–447: the flux–profile relations (Businger–Dyer) that give the temperature and humidity of the lowest tens of metres over the sea from the sea temperature, the air at 2 m and the wind.

## Further reading

Not cited above, and no claim on this tab rests on it — listed because it is what you would read next, or because it lets you redo the measurement on data this page did not choose.

- [A. C. González-García & J. A. Belmonte, "Thinking Hattusha: astronomy and landscape in the Hittite lands" / horizon-synthesis appendix, arXiv:1107.1957](https://arxiv.org/pdf/1107.1957) — gives the refraction constant in the equivalent form K = 0.273(34.2 + dT/dz), a useful independent check on the 0.0342 K/m term and on the size of the effect against curvature.
- **L. Auer & E. M. Standish, "Astronomical refraction: computational method for all zenith angles", *Astronomical Journal* 119 (2000), 2472.** The standard modern treatment, valid down to and below the horizon where the simple formulas fail. Written up in 1979 and finally published two decades later; the delay is itself a good illustration of how uncontroversial the physics is.
- **Explanatory Supplement to the Astronomical Almanac**, 3rd edition, ed. S. E. Urban & P. K. Seidelmann (University Science Books, 2013), chapter 7. The technical volume standing behind the national almanacs: refraction, dip, semidiameter and parallax, with the conventions each almanac actually uses.
