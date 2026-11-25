# Two people watch the same sky turn opposite ways.

> Tab "Star trails" of *Flat plane or Globe?*. Web page: /#tab-star. Generated from the rendered page: same text, same computed numbers and sources; drawings are replaced by their captions and descriptions, formulas are TeX. Licence: content and data CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), Xyphophor (https://x.com/Xyphophor); source code MIT; third-party data keep the licence of their source, cited in each tab.

*Star trails · the one thing a rotation cannot fake*

*[Figure: Star motion at one place, globe and flat disc]*

- **Melbourne, Australia** 37.82° S · December solsticefixed point 37.8° due south, clockwisefixed point 19.4° due north, counter-clockwise30 min tail

*Figure caption:* **One sky, one place, two models.** The same 515 stars over Melbourne (37.8° S) at the December solstice, with 30-minute trails. Left, the globe, facing south: the stars turn clockwise about a fixed point due south, as high as the latitude. Right, the flat disc under its dome, facing north: the only fixed point is the northern one, low over the horizon, and the stars turn counter-clockwise about it. Real positions and colours, every Hipparcos star brighter than magnitude 4[7], gnomonic camera; on a narrow screen the globe is the upper panel; the readout above gives both fixed points.

Point a camera at the sky for an hour and the stars draw arcs. From Europe they turn counter-clockwise about a point in the north; from Chile they turn clockwise about a point in the south. That difference is not a matter of degree. It is a **sign**, and a sign is the hardest thing in this whole page for a model to get wrong quietly.

> **The result, and it is about the flat model alone.** The apparent sense of a rigid rotation is the sign of **ω · û**, where û is the direction you are looking. Reversing it means crossing the surface ω · û = 0; nothing else does it — not distance, not size, not speed. On a plane, everyone shares the same *up*. The dome turns about a vertical, so ω points up for every observer at once, and the fixed point sits at altitude atan(h/r), which is above the horizon everywhere on the disc whatever h is. So ω · û > 0 everywhere, and the sense is the same everywhere. The flat model does not get the sense wrong: it cannot produce a reversal at all, and no setting helps it.

Where the numbers come from, before any of them is used. The stars are the Yale Bright Star Catalogue, J2000, as published[1], checked line by line against Hipparcos: the largest disagreement is 2.4″, except α Centauri at 21″, which is its proper motion between the two catalogue epochs[2]. Precession to the date is applied — 0.36° by 2026, the same order as the precision claimed here — so Polaris sits 0.625° from the pole rather than the 0.736° of J2000. Proper motion is not applied; it is an order of magnitude below anything asserted. The twelve cities are Natural Earth, public domain[3], the same dataset as the coastlines elsewhere on this page.

$$\text{sense} = \operatorname{sign}(\omega\cdot\,û)$$

ω is the rotation vector — along the axis, by the right hand. û is the direction you are looking. The sense you see is the sign of their dot product, so reversing it means crossing the plane ω · û = 0 and nothing else does: not distance, not size, not speed. On a plane, ω points up for every observer at once and the fixed point is always above the horizon, so the sign never changes anywhere on the disc.

## The sky has a map: right ascension and declination

Measure the angle between two stars tonight, next month, from Paris or from Melbourne: it is the same angle, once the bending of light near the horizon is allowed for. The stars keep their places among themselves. Their **directions** can therefore be drawn once and for all on a sphere around the observer, as towns are drawn on a globe, and every star gets two numbers. That sphere is a map of directions only: it does not say how far any star is, and nothing on this tab needs to know.

*Figure caption:* **The celestial sphere, drawn as a glass ball seen from outside; we are at its centre.** The 960 stars brighter than magnitude 4.55 that have a position in the Hipparcos catalogue[7], at their J2000 places, with the Big Dipper, Cassiopeia, Orion and the Southern Cross joined up. Teal: the celestial equator, graduated in hours. Gold dashes: the ecliptic, the Sun's yearly path; it crosses the equator at 0 h. For six stars in turn, the amber arc is the right ascension and the blue arc the declination. The far side of the ball is the sky as it is seen from inside, so it is drawn brighter. Click to pause.

**Declination** (δ) is the latitude of that map: 0° on the celestial equator, +90° at the north celestial pole, −90° at the south one. The poles are the two fixed points the trails turn about. **Right ascension** (α) is its longitude, counted eastwards along the equator from the point where the Sun crosses it in March. It is given in hours because the sky is a clock: it turns once in 24 sidereal hours, so 1 h is 15°, and a star with one more hour of right ascension crosses the meridian one sidereal hour later. Sirius is at α = 6 h 45 min, δ = −16.7°; Vega at 18 h 37 min, +38.8°; Polaris at 2 h 32 min, +89.3°; Acrux, the foot of the Southern Cross, at 12 h 27 min, −63.1°.

$$\delta = a - (90° - \varphi)$$
$$\alpha = \text{sidereal time when the star crosses the meridian}$$

How the two numbers are measured, with a telescope that only swings along the meridian and a clock. a is the star's altitude as it crosses the meridian, φ the latitude of the observatory, 90° − φ the altitude of the celestial equator there (the formula is written for a star crossing on the equator's side of the zenith). The clock keeps sidereal time, 24 h for one turn of the sky, and reads 0 h when the March equinox point crosses. No distance and no model of the Earth's shape enters: two angles and a time.

## Fixed from one night to the next, not from one century to the next

From one night to the next the two numbers do not change by anything an eye or a camera can see. The whole grid slides by 0.14″ a night and the fastest star known, Barnard's, moves 0.03″ a night; the eye separates about 60″. Over centuries two slow motions add up. The first is **precession**: the axis the sky turns about is itself swinging, and it carries the grid with it, 50.3″ a year[8]. Hipparchus found it about 129 BC, by comparing his position of Spica with one measured 150 years before him[9].

*Figure caption:* **The stars stay, the grid moves.** The sky around the pole of the ecliptic (gold cross), 43° either way. The white ring is the celestial pole of the year; it travels along the gold dashed circle, 23.4° from the cross, and the grid of declination circles and hour lines (amber: 0 h) travels with it. The readout gives the nearest bright star to the pole and the coordinates of Polaris and Sirius in the grid of that year. The rate (50.288″ a year) and the tilt (23.439°) are held at their present values, which gives one turn in 25,772 years; in reality both drift a little, so dates far from today are good to a century or two, not to the year. Click to pause.

$$\Delta\alpha \approx (m + n\sin\alpha\tan\delta)\,t$$
$$\Delta\delta \approx n\cos\alpha\;t$$
$$m = p\cos\varepsilon = 46.1\,\text{″/yr},\quad n = p\sin\varepsilon = 20.0\,\text{″/yr}$$

p = 50.29″ a year is the rate at which the pole goes round its circle, ε = 23.44° the radius of that circle (the tilt of the equator on the ecliptic), t the number of years. The two lines hold for a few centuries and away from the poles; the animation and the tables turn the whole sphere instead. For Sirius (α = 101°) the second line gives −3.9″ a year: its declination was −16.58° in 1900 and is −16.75° in 2026, of which 0.04° is the star's own motion.

What it does to the numbers: Polaris was 12.4° from the pole in Hipparchus's time and is 0.63° from it in 2026; it will pass closest, 0.46°, about 2100. Thuban, in the Dragon, was the pole star about 2800 BC, and Vega will be within 4° of the pole about AD 13,700. Spica was 0.5° north of the equator for Hipparchus and is 11.3° south of it now. This is why every catalogue carries a date (B1950, J2000), and why the tables of this tab move the J2000 positions to the date before using them, by 0.36°. Precession does not separate the two models: a dome may be given a swinging axis as easily as a globe. It is here because the coordinates cannot be read without it.

The second motion is each star's own, its **proper motion**. Halley found it in 1718: Sirius and Arcturus stood more than half a degree south of where Ptolemy's catalogue had put them[10]. It is small, different for every star, and it slowly undoes the constellations.

*Figure caption:* **The Big Dipper from 100,000 years ago to 100,000 years ahead.** Each star is moved along a straight line at the proper motion Hipparcos measured[7]; the dashed outline is today's. Five of the seven stars travel together and keep their figure; Dubhe and Alkaid go another way, and the bowl opens. The motion towards or away from us is left out, so this is the right picture for the angles and not for the brightness. Click to pause.

$$\mu = \sqrt{\mu_{\alpha}^2 + \mu_{\delta}^2},\qquad \Delta \approx \mu\,t$$

μ_α and μ_δ are the two components the catalogue gives, in arcseconds a year (the first already multiplied by cos δ, so that both are angles on the sky); μ is the star's speed across the sky and Δ the angle it has covered after t years.

| Star | Proper motion, ″ per year | Years to move 0.5° (the Moon's width) | Moved since Hipparchus (129 BC) |
| --- | --- | --- | --- |
| Barnard's star | 10.36 | 174 | 6.20° |
| Kapteyn's star | 8.67 | 208 | 5.19° |
| Groombridge 1830 | 7.06 | 255 | 4.22° |
| 61 Cygni | 5.28 | 341 | 3.16° |
| α Centauri | 3.71 | 485 | 2.22° |
| Arcturus | 2.28 | 790 | 1.36° |
| Sirius | 1.34 | 1,344 | 0.80° |
| Vega | 0.35 | 5,131 | 0.21° |
| Polaris | 0.05 | 39,368 | 0.03° |
| **Every star, by precession (the grid slides)** | **50.29** | **36** | **30.1°** |

*Figure caption:* Proper motions as published by Hipparcos[7], fastest first, then four well-known stars. The last line is the sliding of the grid, the same for every star: it is 5 to 1,000 times faster than any star's own motion, which is why a catalogue must be dated long before its stars have visibly moved.

## Southern stars from the north, northern stars from the south [evidence: prediction]

A star is called northern or southern by the sign of its declination, not by where one must stand to see it. On a globe, the horizon of latitude φ hides only the cap of sky within |φ| of the far pole; everything else rises. Sirius is a southern star (δ = −16.7°) and the brightest star of a Paris winter night, 24° up. Orion's belt lies on the celestial equator (Mintaka, δ = −0.3°) and is seen from every inhabited place. From Melbourne, Arcturus (δ = +19°) climbs to 33° and Vega (+38.8°) to 13°. From the equator the whole sphere passes overhead; only at a pole is one reduced to one's own half. And what stays hidden changes with latitude exactly as the cap says: Canopus never rises in Paris and culminates 7° above the horizon of Cairo. Aristotle already used it: stars are seen in Egypt and Cyprus that are not seen further north[11].

*Figure caption:* **Six places, north to south.** The same glass ball, positions of 2026. The white line is the observer's zenith and the white circle the horizon; they go round once a sidereal day, and the horizon sweeps everything except the red cap around the far pole, which never rises. The teal cap around the near pole never sets. For each place, three stars of the other half of the sky: teal if they rise there, red if they never do. Altitudes are geometric; near the horizon refraction lifts a star by about half a degree more. Click to pause.

$$a_{\max} = 90° - |\varphi - \delta|$$
$$\text{never rises: } |\varphi - \delta| \ge 90°,\qquad \text{never sets: } |\varphi + \delta| \ge 90°$$
$$f = \frac{1 + \cos\varphi}{2}$$

φ is the latitude and δ the declination, both positive to the north. a_max is the star's altitude when it crosses the meridian, its highest of the night. f is the share of the celestial sphere that rises at latitude φ: one half at a pole, 83 % in Paris, all of it at the equator. Same triangle as the trail formula above, taken on the meridian.

| Star | δ | Tromsø · 69.6° N | Paris · 48.9° N | Cairo · 30.1° N | Quito · 0.2° S | Melbourne · 37.8° S | Ushuaia · 54.8° S |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Polaris | +89.4° | 70.3° * | 49.5° * | 30.7° * | 0.4° | never | never |
| Capella | +46.0° | 66.4° * | 87.2° * | 74.0° | 43.8° | 6.2° | never |
| Vega | +38.8° | 59.2° * | 79.9° | 81.2° | 51.0° | 13.4° | never |
| Arcturus | +19.0° | 39.4° | 60.2° | 79.0° | 70.7° | 33.1° | 16.2° |
| Betelgeuse | +7.4° | 27.8° | 48.5° | 67.4° | 82.4° | 44.8° | 27.8° |
| Sirius | −16.8° | 3.6° | 24.4° | 43.2° | 73.5° | 68.9° | 52.0° |
| Canopus | −52.7° | never | never | 7.2° | 37.5° | 75.1° * | 87.9° * |
| α Centauri | −60.9° | never | never | never | 29.3° | 66.9° * | 83.8° * |
| Acrux | −63.2° | never | never | never | 27.0° | 64.6° * | 81.5° * |
| Flat disc under a dome |  | every star above the horizon, from every place, at every hour: altitude atan(h/d) > 0 |  |  |  |  |  |

*Figure caption:* Highest altitude of the night, geometric, for the positions of 2026; **never** = the star does not rise there, * = it never sets there. The last line is the flat disc of this tab: under a dome nothing is ever below the horizon, so there is no hidden cap at any latitude. What would count for the flat model: Canopus or the Southern Cross seen from Paris, or Polaris from Melbourne, on any night. Check any cell against the USNO service[5].

## 1 · The fixed point, place by place [evidence: prediction]

- **Paris, France** 48.87° N2026-12-21, local mean midnight · 4 h exposure · facing the fixed point**globe** fixed point 48.87° N, counter-clockwise**flat** fixed point 47.57° N, counter-clockwise, dome 5,004 km

Nothing is fitted here. The globe puts the fixed point at the altitude of the pole — that is the celestial-navigation result, and it is argued there rather than again here[6]. The flat model puts it at atan(h/r), where r is the distance to the centre of the azimuthal-equidistant map. Read the table for what it is worth in both directions: at northern mid-latitudes the two models agree to about two degrees, and that half of the case is stated here rather than buried.

$$a = \arctan\left(h/d\right)$$
$$d = \sqrt{r^2 + \rho^2 - 2r\rho\cos\theta}$$

The flat model, edge-on and from above. h = height of the dome, r = your distance to the centre of the azimuthal-equidistant map, ρ = the radius of the circle the star's ground point travels, θ = how far round that circle it has got. a is what you would measure with a clinometer. Note that a is positive for every r, every ρ and every θ: on this model nothing ever sets.

**The flat dome is swept, never fitted. The break between the two models is not in the altitude — it is in the azimuth and in the sense, and both of them flip south of the equator without any value of h being involved.**

| place | φ | globe alt | az | sense | flat alt | az | sense |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Longyearbyen, Svalbard | 78.22° N | 78.22° | N | counter-clockwise | 75.33° | N | counter-clockwise |
| Tromsø, Norway | 69.64° N | 69.64° | N | counter-clockwise | 65.65° | N | counter-clockwise |
| Paris, France | 48.87° N | 48.87° | N | counter-clockwise | 47.57° | N | counter-clockwise |
| New York, USA | 40.75° N | 40.75° | N | counter-clockwise | 42.42° | N | counter-clockwise |
| Cairo, Egypt | 30.05° N | 30.05° | N | counter-clockwise | 36.89° | N | counter-clockwise |
| Mexico City, Mexico | 19.44° N | 19.44° | N | counter-clockwise | 32.53° | N | counter-clockwise |
| Quito, Ecuador | 0.21° S | 0.21° | S | clockwise | 26.51° | N | counter-clockwise |
| Lima, Peru | 12.05° S | 12.05° | S | clockwise | 23.80° | N | counter-clockwise |
| Rio de Janeiro, Brazil | 22.92° S | 22.92° | S | clockwise | 21.73° | N | counter-clockwise |
| Santiago, Chile | 33.45° S | 33.45° | S | clockwise | 20.03° | N | counter-clockwise |
| Melbourne, Australia | 37.82° S | 37.82° | S | clockwise | 19.40° | N | counter-clockwise |
| Ushuaia, Argentina | 54.79° S | 54.79° | S | clockwise | 17.27° | N | counter-clockwise |

$$\sin a = \sin\delta\sin\varphi + \cos\delta\cos\varphi\cos H$$

The spherical triangle the globe uses everywhere on this page. Z = your zenith, P = the celestial pole, ★ = the star. Its sides are 90° − φ, 90° − δ and 90° − a; the angle at P is the hour angle H, which advances at 15.041° per hour and is the only thing that changes during a night. Latitude and declination are fixed, so the whole trail follows from one turning angle.

## 2 · The shape of a trail [evidence: prediction]

A trail is a circle *on the sky* if and only if the observer stands on the axis of the circle the star describes. On the disc that happens at the centre and nowhere else. Everywhere else the observer sees an oblique cone over a circle, and its angular radius from the fixed point varies by a factor of two around one turn.

*[Figure: Star trails from one place, globe and flat disc]*

$$p = 90° - |\delta|$$
$$a_{\text{up}} = \varphi + p,\quad a_{\text{low}} = \varphi - p$$
$${\frac{1}{2}(a_{\text{up}} + a_{\text{low}}) = \varphi}$$

Looking due north along the meridian. The pole P sits at the latitude φ, and a circumpolar star crosses the meridian twice a day, at p above P and p below it. Their mean is therefore the latitude and their half-difference is p — for any star and any latitude, with nothing fitted. Two altitudes read off a clinometer are the whole measurement.

**On a globe the two culminations sit at φ + p and φ − p exactly, so their **mean is the latitude** and their half-difference is p, for any star and any latitude. Two altitudes read off a clinometer settle it: no camera, no lens correction, no calibration.**

| Alkaid (η UMa, δ = 49.31°) | globe | flat |
| --- | --- | --- |
| upper culmination | 89.51° | 89.34° |
| lower culmination | 8.05° | 28.77° |
| **mean of the two** | **48.78°** | **59.06°** |
| altitude of the fixed point | 48.87° | 47.57° |
| mean − fixed point | -0.09° | 11.48° |
| radius from the fixed point | 40.8° … 40.8° | 18.8° … 42.0° |
| expected if the trail were circular | 40.8° | — |

> **The rule only holds while the star stays between the pole and the zenith.** In general the two culminations sum to 2·min(φ, δ): once δ < φ the star passes the zenith, comes down the other side of the meridian, and the mean gives δ instead of φ. The star chosen above is therefore one with δ ≥ |φ|, and with the largest trail radius available rather than the brightest — a trail 0.6° across is nearly symmetric in *both* models, and a test that cannot separate them is not a test.

## 3 · The dilemma that consumes the dome height

The flat model has one free parameter here, and it has to serve two masters. Bring the dome closer and the fixed point sits at the right altitude while the trails deform; push it away and the trails become circular while the fixed point climbs to everyone's zenith. The two requirements are tens of degrees apart and no intermediate value satisfies both.

**Dome heights are swept, as the azimuth tab already sweeps its lamp. Note that the star dome is not that lamp: flat cosmology puts the firmament above the Sun, so two heights are legitimate — but a page that argues there is only one refraction coefficient owes the reader that sentence.**

| dome height | alt. of fixed point | error vs φ | asymmetry (Alkaid) |
| --- | --- | --- | --- |
| 5,004 km | 47.57° | -1.30° | +11.48° |
| 10,000 km | 65.42° | +16.55° | +3.24° |
| 25,000 km | 79.63° | +30.76° | +0.29° |
| 100,000 km | 87.38° | +38.51° | -0.00° |

## 4 · What a photograph can and cannot settle

The expected objection is that trails photograph as ovals. They do — in both models — and the figure below is the answer rather than a warning. The dashed curve is the image of a mathematically **perfect circle** about the fixed point, seen through the same lens from the same framing. On a globe the trail lies on it. On the disc it hugs it on one side and falls away on the other.

- **Paris, France**globe · 35 mm full frame · rectilinearfixed point 48.9° N, 14° off the optical axis

*Figure caption:* **Why no lens can fake the difference.** All eight lenses are **radial** maps: each moves a point along the ray joining it to the centre of the image and never touches its polar angle, so none of them can make a symmetric thing asymmetric or the reverse. What each law does to straight lines and to the horizon, frame by frame — and why the focal length itself deforms nothing — is shown on the [Horizon curve](/ai/curv.md) tab. The barrel coefficients are typical of their class of lens, not the measurement of a particular model, and no number on this page depends on them.

## 5 · The rhythm along the trail [evidence: prediction]

Cut the exposure into equal intervals — an intervalometer, or a card held over the lens — and the trail becomes dashes. On a globe each dash sweeps **exactly** the same angle about the fixed point: 15.041° per hour[4], for any star, at any latitude, with no free parameter anywhere. On the disc the star comes closer and goes away again, and the dashes stretch and bunch.

$$\Delta\psi = 15.041°\,\mathrm{h}^{-1} \times \Delta t$$

ψ is the position angle about the fixed point F — where the star sits round the circle, not how far from it. On a globe it advances at a constant rate, so equal exposures give equal dashes, for every star and every latitude. The measurement is an angle about the centre of the image, which is why no radial lens distortion can touch it.

*Figure caption:* **One place, one night, one photograph.** This is the only test on the tab that needs neither travel nor anyone else's data. It is also immune to the lens: aimed at the fixed point, that point becomes the centre of the image, and any radial distortion preserves angles about the centre exactly. Measure with a protractor on a print. The test is strong at middle and southern latitudes, weak near the pole where the trail radius collapses, and unavailable at the equator where no trail closes.

## 6 · Always up, seasonal, never seen [evidence: prediction]

On a globe a constellation falls into one of three classes and its **declination** decides, compared with 90° − |φ|. On the flat disc there is one class: the altitude is atan(h/d), positive everywhere and always, so everything is always up, everywhere.

*Figure caption:* **Seasonality on its own proves nothing** — a dome turning at the sidereal rate reproduces the four-minute daily drift without effort, and saying so costs nothing. What can be checked is *which* constellations never set and which never rise, and from what latitude. The dates below are there to make the observation practicable, not to make an argument: they put a constellation on the meridian at a civil hour.

| constellation | δ | globe, at Paris, France | on the meridian near midnight | flat disc |
| --- | --- | --- | --- | --- |
| Ursa Minor | 79.9° | always up | May, 59° at best | always up |
| Cassiopeia | 60.5° | always up | October, 78° at best | always up |
| Ursa Major | 56.4° | always up | March, 83° at best | always up |
| Auriga | 46.0° | always up | December, 87° at best | always up |
| Cygnus | 45.4° | always up | August, 87° at best | always up |
| Lyra | 38.8° | seasonal | July, 80° at best | always up |
| Gemini | 29.9° | seasonal | January, 71° at best | always up |
| Boötes | 19.1° | seasonal | April, 60° at best | always up |
| Taurus | 16.6° | seasonal | December, 58° at best | always up |
| Pegasus | 15.4° | seasonal | September, 56° at best | always up |
| Leo | 11.8° | seasonal | February, 53° at best | always up |
| Aquila | 8.9° | seasonal | July, 50° at best | always up |
| Orion | -2.4° | seasonal | December, 39° at best | always up |
| Virgo | -11.3° | seasonal | April, 30° at best | always up |
| Canis Major | -16.7° | seasonal | January, 24° at best | always up |
| Scorpius | -26.5° | seasonal | May, 15° at best | always up |
| Piscis Austrinus | -29.5° | seasonal | September, 12° at best | always up |
| Carina | -52.7° | never rises | — | always up |
| Eridanus | -57.1° | never rises | — | always up |
| Southern Cross | -59.8° | never rises | — | always up |
| Centaurus | -60.8° | never rises | — | always up |
| Octans | -88.8° | never rises | — | always up |

## Experiment 2b · photograph the axis

**Independent variable:** the place — the hemisphere first, the latitude second. **Dependent:** (a) the sense of rotation, one bit; (b) the two culmination altitudes of one circumpolar star. **Held constant:** the same lens, the aim on the fixed point, a fixed foreground for the horizon, a stated exposure. **Kit:** a phone on a wall and thirty minutes of stacking. For (b) a clinometer is enough — no camera at all. Every altitude printed on this tab can be checked against the USNO service[5] before you go outside.

**Verdict rule, announced in advance and symmetric.** The globe fails if a southern observer photographs arcs centred on Polaris, if the sense is the same in both hemispheres, or if the mean of the two culminations does not return the latitude. The flat model fails if the sense reverses between hemispheres, or if that mean does return the latitude instead of missing it by several degrees.

Deliberately left out: differential refraction and extinction near the horizon, which are modelled nowhere else on this page and which the culmination test does not need; aberration, stellar parallax and proper motion, all below anything claimed here; and trail photometry, which is real and predicted differently by the two models but cannot be measured without calibration.

**See also**[Cel. nav.](/ai/cnav.md)[Foucault](/ai/fou.md)[Azimuth](/ai/azim.md)[Sun](/ai/sun.md)[GPS](/ai/gps.md)

## Sources for this tab

1. [1] [Yale Bright Star Catalogue, 5th revised edition](http://tdc-www.harvard.edu/catalogs/bsc5.html) (Hoffleit & Warren) — the 49 stars used here, J2000, as published.
2. [2] [ESA, Hipparcos catalogue](https://www.cosmos.esa.int/web/hipparcos) — used as an independent check of every line above; the largest disagreement is 2.4″, except α Centauri at 21″, which is its proper motion between catalogue epochs.
3. [3] [Natural Earth, 1:10m populated places](https://www.naturalearthdata.com/), public domain — the twelve cities, the same dataset as the coastlines used elsewhere on this page.
4. [4] [IERS](https://www.iers.org/) — the sidereal day and the 15.041°/h figure.
5. [5] [U.S. Naval Observatory, altitude and azimuth service](https://aa.usno.navy.mil/data/AltAz) — check any line of any table here against it without taking this page's word for anything.
6. [6] [Bowditch, *The American Practical Navigator*](https://msi.nga.mil/Publications/APN) — the pole's altitude equals the latitude; the celestial navigation tab argues it.
7. [7] [ESA, *The Hipparcos and Tycho Catalogues*, ESA SP-1200 (1997)](https://cdsarc.cds.unistra.fr/viz-bin/cat/I/239), VizieR I/239 — the 960 stars brighter than V = 4.55 and six fast-moving stars of the celestial sphere drawn here, positions and proper motions as published.
8. [8] [N. Capitaine, P. T. Wallace & J. Chapront, Expressions for IAU 2000 precession quantities, *Astronomy & Astrophysics* 412 (2003) 567–586](https://doi.org/10.1051/0004-6361:20031539) — the precession in longitude, 5,028.796″ per century, and the obliquity.
9. [9] Ptolemy, *Almagest*, VII 2–3, trans. G. J. Toomer (Duckworth, 1984) — Hipparchus's discovery of precession from the position of Spica measured by Timocharis and by himself.
10. [10] [E. Halley, Considerations on the change of the latitudes of some of the principal fixt stars, *Philosophical Transactions* 30 (1718) 736–738](https://doi.org/10.1098/rstl.1717.0025) — the discovery of proper motion.
11. [11] [Aristotle, *On the Heavens*, II 14 (297b–298a)](http://classics.mit.edu/Aristotle/heavens.2.ii.html) — stars seen in Egypt and near Cyprus that are not seen in the northerly regions.

### Raw numbers for the case shown

The Julian date, the sidereal time, the precessed declination and the disc radius, so every line above can be recomputed by hand

These are the intermediate quantities the tables above are built from, printed rather than hidden. Feed the same instant to the USNO service[5] and you should get the same altitudes to the second decimal; if not, one of the two accounts is wrong, and the numbers here are enough to find out which.

| Julian date, local mean midnight | 2461395.49352 |
| --- | --- |
| Greenwich mean sidereal time | 87.2422° |
| Polaris δ, J2000 as published | 89.2642° — 0.736° from the pole |
| Polaris δ, precessed to the date | 89.3754° — 0.625° from the pole |
| r(φ), observer to disc centre on the flat map | 4574 km |
| dome height in use | 5,004 km |
| circumpolar star the tables use | Alkaid (δ = 49.31°, p = 40.69°) |
