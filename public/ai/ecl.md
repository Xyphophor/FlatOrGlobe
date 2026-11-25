# An eclipse is an appointment published years in advance

> Tab "Eclipses" of *Flat plane or Globe?*. Web page: /#tab-ecl. Generated from the rendered page: same text, same computed numbers and sources; drawings are replaced by their captions and descriptions, formulas are TeX. Licence: content and data CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), Xyphophor (https://x.com/Xyphophor); source code MIT; third-party data keep the licence of their source, cited in each tab.

*Eclipses · predicted to the second, on a sphere*

The total solar eclipse of **2 August 2027** is already on the calendar. Totality touches down over the Atlantic at sunrise, crosses southern Spain, Gibraltar and northern Morocco, runs the length of North Africa, and is longest — **6 min 23.2 s** — near Luxor at **10:00:21 UT**, with the Sun 81° high.[1][2] The path table gives the edges of the shadow every two minutes, to a tenth of an arcminute, together with the Sun's altitude, its azimuth and how long totality lasts on the centre line.[1] None of it is observed yet. All of it is computed.

> **The objection this tab answers.** “Eclipses are predicted from the saros cycle, a pattern the Babylonians found in tables — nobody needs a globe to predict them.” The saros is real and this tab shows it: after 223 lunations, 18 years 11 days and about 8 hours, the Sun, the Moon and the Moon's node line up again almost exactly.[3] But a repeating pattern says *when* a similar eclipse comes back. It does not say *where* its shadow falls, at what time it reaches a given town, how high the Sun stands there or how long totality lasts — and the saros itself puts the next member of the series a third of the world further west[4], which is a statement about a turning planet.

Those numbers come from the **Besselian elements**: six short polynomials in time that describe the Moon's shadow on a *fundamental plane through the centre of the Earth*, perpendicular to the shadow's axis.[2][5] To turn them into a time and a place, the method needs the observer's position *as seen from the Earth's centre* — the quantities ρ sin φ′ and ρ cos φ′ of a point on an ellipsoid of 6,378 km equatorial radius and 1/298 flattening. There is no version of the calculation without that ellipsoid. This tab recomputes the published centre line of 2027 from the published elements and lands on it to the thousandth of a degree; that check runs every time the page's tests do.

$$H = \mu + \lambda$$
$$\xi = \rho\cos\varphi\prime\sin H,\quad \eta = \rho\sin\varphi\prime\cos d - \rho\cos\varphi\prime\cos H\sin d,\quad \zeta = \rho\sin\varphi\prime\sin d + \rho\cos\varphi\prime\cos H\cos d$$
$$\text{total} \iff \sqrt{(x-\xi)^2 + (y-\eta)^2} < |l_2 - \zeta\tan f_2|$$

x, y, d, μ, l_1, l_2: NASA's six polynomials in time (tan f_1, tan f_2: two constants) · λ: the observer's longitude, east positive · ρ sin φ′, ρ cos φ′: the observer's position on the ellipsoid, seen from the Earth's centre · ξ, η, ζ: the observer projected onto the fundamental plane · partial when the distance is below l_1 − ζ tan f_1; each contact is an instant when the distance equals one of the two radii

*Figure caption:* **What the Besselian elements describe.** The Moon's shadow — the wide penumbra and the narrow umbra — crosses a plane through the *centre* of the Earth, perpendicular to the shadow's axis. x and y place the axis on that plane, l₁ and l₂ are the radii of the two shadows there, and six polynomials in time give all of them[2]. To know whether one place is in the shadow, the method projects that place onto the plane — ξ, η, and its height ζ above it — from its position on the ellipsoid[5]. Schematic, not to scale.

## Why an eclipse does not happen every month

Every month the Moon passes between the Earth and the Sun. If its orbit lay in the Earth's plane, every new moon would be a solar eclipse and every full moon a lunar one. It is tilted by **5.145°**[6], so most months the shadow passes above or below the Earth. The tilted orbit crosses the Earth's plane at two **nodes**; an eclipse needs a new or full moon close to one — in Meeus's test, |sin F| under 0.36, F being the Moon's distance along its orbit from the ascending node[7]. The node line points at the Sun only twice a year: the two **eclipse seasons**. It also turns backwards once in 18.6 years[6], so the seasons come about 19 days earlier each year.

- Sun–node-line angle **22°**off season: the shadow passes above or belownext: lunar eclipse 22 Janclick: pause · drag: turn

*Figure caption:* **2027, day by day, not to scale.** Sun, Earth and the Moon's tilted orbit, with the node line in amber; sizes and distances squeezed to fit, the Moon's tilt drawn three times too steep — the stamp says so. The dates, phases, distance from the node and the node's backward turn come from Meeus's mean elements[6]; the verdict at each new and full moon is Meeus's test with the true 5.145°[7]. In the strip below (rings: new moons, dots: full moons, coloured: eclipses) it finds the annular eclipse of 6 February and the total of 2 August, and the lunar eclipses of 20 February, 18 July and 17 August — all in NASA's catalogue[10]. It also flags 22 January (|sin F| = 0.34, just inside the limit), where NASA lists none: a mean-element model may err at the edge, which is why the local circumstances further down are computed properly.

$$|\sin F| < 0.36 \text{ at new or full moon} \;\Rightarrow\; \text{eclipse possible}$$
$$F = 93.272^\circ + 483\,202.0175^\circ\,T,\qquad \Omega = 125.045^\circ - 1934.136^\circ\,T$$

F: the Moon's angle along its orbit from the ascending node · Ω: the longitude of that node, which turns backwards once in 18.6 years · T: Julian centuries from 1 January 2000 · Meeus's mean elements and test

## The saros: why eclipses repeat, and why somewhere else

Three of the Moon's rhythms happen to fall into step. A new moon comes back every synodic month; the Moon returns to the same node every draconic month; it returns to its closest point to the Earth every anomalistic month. Wait 223 synodic months and the other two have almost exactly caught up:[3]

| Cycle | Length | vs 223 lunations |
| --- | --- | --- |
| 223 synodic months (new moon → new moon) | 6,585.3223 d | — |
| 242 draconic months (node → node) | 6,585.3575 d | +0.8 h |
| 239 anomalistic months (perigee → perigee) | 6,585.5375 d | +5.2 h |

After one **saros** — 18 years, 11 days and **7 h 43 min** — Sun, Moon and node line up again at nearly the same distance, and an eclipse of nearly the same kind comes back. That is about orbits, and it gives the *date* whatever shape the ground has. It does not put the shadow in the same place: in those extra 7 h 43 min the Earth turns about 116°, so the next eclipse of the series lands that much further west. NASA rounds it to “~120° westward”[3]; the series catalogue gives **about 111°** from one member to the next[4]. The eclipse of 2 August 2027 is member 38 of 71 of saros 136; the previous one crossed India and China on 22 July 2009[8], the next will cross the United States on 12 August 2045[9].

- 22 Jul 2009 · 24.2° 144.1° E · shift -110.7°2 Aug 2027 · 25.5° 33.2° E · shift -110.9°12 Aug 2045 · 25.9° 78.5° W · shift -111.7°

*Figure caption:* **Three members of one series, as published.** Each band is NASA's path of totality[1][8][9]; the grey dots are the points of greatest eclipse of all 71 members of saros 136, pale for the oldest[4]. The camera follows the point of greatest eclipse from one member to the next, and that westward turn — about 111° — is the extra 7 h 43 min of rotation. The page computes nothing here; it only turns a globe. Three saroses later (an *exeligmos*, 54 years 34 days) the extra time is 23 h 09 min, nearly a whole turn, and the series comes back close to where it was: 5.6° E on 30 June 1973, 33.2° E on 2 August 2027, 53.6° E on 3 September 2081[4].

$$223 \times 29.530589\ \text{d} = 6585.32\ \text{d} \approx 242 \times 27.212221\ \text{d} \approx 239 \times 27.554550\ \text{d}$$
$$0.3213\ \text{d} \times 360^\circ \approx 116^\circ \text{ westward}$$

synodic, draconic and anomalistic months · 0.3213 d: the 7 h 43 min left over beyond whole days, during which the Earth turns under the Sun at 15° per hour

> **What the saros settles, and what it cannot.** A flat-earth reading can use the saros too: it is a calendar of the Sun and the Moon, and the date comes out the same on any ground. It cannot use the shift. A cycle that leaves every eclipse a third of the way round the world further west, by the amount of rotation the extra hours imply, is the calendar of a spinning body — and to draw the band itself, town by town, one needs the Besselian elements and the ellipsoid of the first section. The next sections compute that band and ask a flat model to draw the same one.

## Where and when: the eclipse at any place [evidence: prediction]

Pick a place and the page computes what it will see on 2 August 2027: when the Moon first bites the Sun, when totality begins and ends, how long it lasts, how deep the partial phase gets and where the Sun stands. It does it the way the published predictions are made — from NASA's Besselian elements[2] with Meeus's method[5], the observer placed on the ellipsoid by ρ sin φ′ and ρ cos φ′. The first line under the controls is not a claim: it is the same calculation run, as the page loads, on every point of NASA's published centre line[1], and it reports how far from the published time, duration, altitude and azimuth it lands.

- Checked now, against NASA's centre line (101 points):time of maximum ≤ **0.2 s**duration ≤ **0.18 s**Sun's altitude ≤ **0.49°**azimuth ≤ **0.51°**limits of totality, computed (dashed on the map) ≤ **1.6 km**the table gives altitude and azimuth to the whole degree

| first contact (partial begins) | 07:40:50 |
| --- | --- |
| second contact (totality begins) | 08:45:05 |
| maximum | 08:47:24 · magnitude 1.025 |
| third contact (totality ends) | 08:49:44 |
| fourth contact (partial ends) | 10:00:41 |
| duration of totality | **4 min 38.8 s** |
| Sun at maximum | altitude 38.1° · azimuth 95.2° |
| **UT · 36.013°, -5.605°, 10 m** | |

- Second route, the site's own Sun and Moon:maximum **08:47:24** (+0 s)totality with the Moon's size seen from the Earth's centre **226 s**…seen from this place **278 s** (Besselian 279 s)

*Figure caption:* **Two routes, both on a globe.** The table comes from the published Besselian elements. The last line redoes the same place with nothing from NASA: the site's own Sun and Moon[6], seen from that exact place, and the moment their centres come closest. The two agree on the time of maximum to a few seconds. The duration agrees only once the Moon is drawn at its size *from that place*: near the zenith the observer is some 6,000 km closer to it than the Earth's centre, the Moon looks about 1.6 % larger, and at Luxor that is worth over a minute of totality. The remaining few seconds are this simpler Moon's own error. On a plane there is no centre of the Earth to be closer to.

## The same shadow on a flat Earth, given every advantage

A flat model gets the best terms this page can offer. Its map is the usual azimuthal equidistant one, North Pole at the centre. Its Sun and Moon are local lamps, each hanging over the *real* point beneath the real Sun and Moon at every minute, from the same ephemeris as the globe[6]. The Moon at height H☾ is lit by the Sun at height H☉, and its shadow falls along the line from the lamp through the Moon. Only the ratio of the two heights moves that shadow, so it is tuned by least squares to follow NASA's published centre line as closely as possible[1]; the Sun's height is then tuned, separately, to the Sun's published altitudes along the path. Two free parameters, each set in the flat model's favour.

- published shadow (NASA)flat shadow, best fit: **8,393 km** awaySun over the published shadow: published **8°** · flat lamp **30°**f = 36.1 · H☉ 6,080 km · H☾ 5,911 km

*Figure caption:* **The flat model's own map, 08:26 to 11:46 UT.** Teal: NASA's path of totality, carried over onto this map as it falls, with the published position of the shadow's centre[1]. Amber: the flat model's shadow, on the best-fitting heights, with its lamp and the Moon's point beneath. The band as drawn here is stretched and bent — that is this map's distortion, not the shadow's; the published path is a smooth arc on the globe.

$$P = S + f\,(M - S),\qquad f = \frac{H_{\text{☉}}}{H_{\text{☉}} - H_{\text{Moon}}}$$
$$f \text{ chosen to minimise } \sum_t |P(t) - C(t)|^2$$

S, M: the points beneath the Sun and Moon lamps on the flat map · H_☉, H_Moon: their heights · P: where the line from the Sun lamp through the Moon meets the ground · C(t): NASA's published centre line · only the ratio of the heights moves P, so it is fitted, in the flat model's favour

The result, computed on this page: the best-fitting flat shadow stays on average **3,950 km** from the published centre line, **8,400 km** at worst. It moves the wrong way — ten degrees of longitude *westward*, following its lamp, while the published shadow sweeps over a hundred degrees *eastward*, from the Atlantic at sunrise to the Indian Ocean at sunset. Tuned to the published altitudes, its Sun is off by only about 6° on average, but at the two ends, where NASA's Sun is rising and setting, the flat lamp stands 28° and 24° high. And given the published width of the shadow for free, at its own speed totality would last 376 to 880 seconds along the path, against the published 255 to 383.

## The Earth's own shadow: eclipses of the Moon

The oldest argument on this page is an eclipse of the Moon. Aristotle, fourth century BC: “in eclipses the outline is always curved: and, since it is the interposition of the earth that makes the eclipse, the form of this line will be caused by the form of the earth's surface, which is therefore spherical.”[11] It can be sharpened. The Earth's shadow on the Moon is an arc of the *same* circle whether the Moon is rising, high or setting — a disc casts a round shadow only when lit square on, and a straight-edged one when lit along its edge. And its size is not free: from the published sizes and distances of the Sun, the Earth and the Moon, the page computes the Earth's shadow at the Moon's distance as about 2.7 times the Moon's radius, the value the photographs show.

$$r_{\text{shadow}} = 1.02\left[R_{\text{⊕}} - d_{\text{Moon}}\,\frac{R_{\text{☉}} - R_{\text{⊕}}}{d_{\text{☉}}}\right]$$

R_⊕, R_☉: radii of the Earth and the Sun · d_Moon, d_☉: distances of the Moon and the Sun · the Earth's shadow is a cone that narrows as it recedes; at the Moon it is about 2.7 Moon radii · 1.02: the customary enlargement for the atmosphere

*Figure caption:* **One circle, three moments, and what a disc would give.** The partial phase of a lunar eclipse seen at moonrise, at its highest and at moonset: the dark edge is an arc of the same circle each time, only turned with respect to the horizon. The last panel is the shadow of a disc lit along its edge. Schematic; the shadow's radius is computed from the Sun's, Earth's and Moon's radii and distances, with the customary 2 % enlargement for the Earth's atmosphere.

A flat model has no Earth to put between the Sun and the Moon: both hang above the disc. Flat-earth writers who address lunar eclipses invoke another, unseen body; none gives its size, its distance or its path, so none says when the next eclipse will come or who will see it. The published calendar does. The three lunar eclipses of 2027 are all penumbral — the Moon only grazes the Earth's outer shadow — and the next total ones visible from Europe fall on **31 December 2028**, **26 June 2029** and **20 December 2029**[10]. Each was computed decades ago, from the same kind of elements as the solar eclipse above.

## The Sun setting while the eclipsed Moon rises, and the shadow on the “wrong side” [evidence: prediction]

> **The objection.** “In an eclipse of the Moon the Earth stands between the Sun and the Moon. Yet the eclipsed Moon has been seen above the horizon while the Sun was still up on the other side. With the Earth in between, that is impossible — so it is not the Earth's shadow.” And its more common form: “On photographs of the eclipsed Moon the dark part is often on top, while the Sun that casts the shadow is below the horizon. The Earth's shadow would come from below.”

The “impossible” eclipse has a name, the **selenelion** or horizontal eclipse, and it is old news: Cleomedes reported it nearly two thousand years ago and put it down to the air.[12] It has been photographed, at sunrise over Minneapolis on 8 October 2014 for one.[13] On a globe it is a matter of a few arcminutes. Standing on the line between day and night, you are on the edge of the Earth as seen from the Sun: your horizon plane points straight at the Sun on one side and straight down the Earth's shadow on the other. The Sun and the centre of the shadow are both on your horizon, 180° apart. Three things move them by less than a degree. The Moon, 60 Earth radii away, seen from the surface instead of the centre, sits about 1° lower: its parallax π. Inside the shadow, 0.7° in radius, it may sit above or below the centre: δ. And a body is in sight as soon as its upper edge is, half a disc, s, above its centre. The air then lifts both edges by about half a degree each: ρ.

- **16:25 UT** · Moon, total eclipse
- Brest, Sun, upper edge: **+53′** (without air +28′)
- Brest, Moon, upper edge: **+3′** (without air −31′)
- **both in the sky, the Moon in the Earth's shadow**
- Adelaide: Moon **+26°**, Sun **-28°**
- Earth's shadow on the Moon, zenith up: Brest **from below**, Adelaide **from above**
- its angle from celestial north, the same for both: **154°** · **154°**

*Figure caption:* **One instant, two places.** Top: the Sun's rays, the Earth, its shadow and the Moon at one true scale, in the plane through the Sun, the Earth's centre and the first observer (white dot, on the line between day and night); Adelaide, which is not in that plane, is projected onto it (blue dot), with its line of sight to the Moon (blue dots); the box enlarges the Moon's surroundings uniformly, by the factor printed. Dashed: the observer's horizon plane; orange: the lowest ray that still reaches the eye through the standard atmosphere. Bottom: the eclipsed Moon at the same instant from two places, zenith up: on the left the place of the selenelion, the Moon on its sea horizon (1° bar); on the right Adelaide, a wider field so that its horizon is in the picture (10° bar), the Moon high in a night sky and shown again in a box enlarged uniformly to the scale of the left view (factor printed). The red arrow points from the Moon's centre to the centre of the Earth's shadow, the side the shadow comes from; the disc at the bottom right is the shadow as each place sees it, with the Moon's path during the animation. In each small yellow frame, the Sun for that place at that instant, looking towards it, horizon across the middle, at its own uniform scale (bar): above the horizon at the selenelion, far below it at Adelaide. Filled discs: with standard refraction, each point of the edge lifted by its own amount; dashed outlines: the same discs without air. The Moon's colouring is the Earth's umbra and penumbra, computed. Sea-level observers. Click to pause.

$$(h_{\text{☉}} + s_{\text{☉}} + \rho_{\text{☉}}) + (h_{\text{☾}} + s_{\text{☾}} + \rho_{\text{☾}}) = -\pi + \delta + s_{\text{☉}} + s_{\text{☾}} + \rho_{\text{☉}} + \rho_{\text{☾}}$$

the heights of the two upper edges above a sea horizon, added at the moment they are equal · h: height of each centre · π: the Moon's parallax in height, about 58′ · δ: how far the Moon, seen from the Earth's centre, stands above the shadow's axis · s: half-diameters, about 16′ each · ρ: refraction at the horizon, about 29′ each · the two can be seen together only if the sum is above zero; from a height, add twice the dip of the horizon

Computed on this page for **Brest** (48.39° N, 4.49° W) on **31 December 2028**: the Moon is totally eclipsed from 16:16 to 17:28 UT — NASA lists 1 h 11 min of totality[10] — and from a sea horizon the setting Sun and the rising, totally eclipsed Moon are both above it from **16:25 to 16:33 UT**, the Sun in the south-west at azimuth 234°, the Moon in the north-east at 54°. Without air, the same two edges would each miss the horizon by 2′: at sea level this selenelion needs the atmosphere, but only just. An eye 1.2 m above a sea horizon gains 2′ of dip on each side and would see both without any air. Refraction is the margin, not the explanation; the explanation is that the horizon of someone standing on the edge of a ball points at both. For Minneapolis on 8 October 2014, with the Moon partly eclipsed and high in the shadow, the page finds both above the horizon from 12:20 to 12:29 UT, possible even without air: the morning of the photograph.[13] Near the horizon refraction changes from one evening to the next by several arcminutes, with the temperature of the air near the ground, so the ends of each window are uncertain by a minute or two; a hill on the horizon shuts it.

**The shadow on the “wrong side”.** The second form of the objection is not about the selenelion: it is about which way is up. Seen from the Moon, the centre of the Earth's shadow lies in one direction among the stars, the same for everyone at a given instant. “Up” is each observer's zenith, and it turns from one place to the next. The figure shows one instant from two places 16,600 km apart. At Brest the Moon is on the horizon and the shadow comes from below. At **Adelaide** (34.93° S, 138.60° E) the same Moon is 26° high in the north-north-west, the Sun 27° below the opposite horizon, and the shadow comes from above: south of the equator the Moon is seen upside down compared with Brest. Measured from the celestial north instead of the zenith, the two directions agree to within 0.4°, and that small difference is the parallax between the two places. In the Minneapolis case Adelaide sees it from above as well, the Moon 37° high, to within 0.2°. A dark part on top while the Sun is below the horizon is what a ball predicts wherever the Moon is high and the observer's zenith lies on the shadow's side of the Moon.

> **The globe is sunk** if, on 31 December 2028, from a sea horizon at Brest, the Moon that appears in the north-east around 16:25 UT is not totally eclipsed; or if, anywhere and at any eclipse, the Sun and the eclipsed Moon are seen together with their upper edges adding up to more than **2°** above a sea horizon. Parallax, the shadow's size and the two half-discs allow at most about half a degree, standard refraction about one more, and the 2° leaves room for unusual air. It is also sunk if two observers, photographing the same eclipse at the same minute, find the shadow's centre at directions from the celestial north that differ by more than 5°: the parallax between any two places moves it by less than half a degree in both cases on this page.

> **A flat model** has both bodies above the plane at all times, so a selenelion costs it nothing — and explains nothing: with no Earth between them it has no shadow, no reason for the Moon to darken only when it stands opposite the Sun, and no time for the Brest window. A flat model that names its shadow-casting body, with a size, a height and a path, is welcome to state its own Brest time before the day.

## What would refute each model, stated before 2 August 2027 [evidence: prediction]

> **The globe is sunk** if, at **Tarifa** (36.013° N, 5.605° W, at the shore), totality does not begin within 15 s of **08:45:05 UT** or does not last **4 min 39 s** to within 10 s, with the Sun 38° high in the east; if **Luxor** sees totality at any time other than **10:02–10:08 UT**, lasting 6 min 20 s to within 10 s; or if **Marseille** sees totality at all — the globe gives it a partial eclipse, magnitude 0.77, deepest at 09:02:56 UT. These are the figures of the “Where and when” section, computed on this page from NASA's elements[2], which reproduce NASA's own centre line to within a second. The tolerances cover what the predictions leave out: the Moon's mountains and valleys at its edge, which move the contacts by a few seconds[2].

> **The flat model above is sunk** — on the heights that suit it best — if Tarifa sees a total eclipse at all: its shadow never comes closer than about 4,300 km. And it is sunk if Luxor's totality comes near 10:05 UT: its shadow passes 80 km from Luxor at about **06:09 UT**, four hours earlier, under a lamp that would then be high in Luxor's morning sky. A different flat model is welcome to state its own Tarifa and Luxor numbers before the day; this page will run it through the same test.

## Sources for this tab

1. [1] Fred Espenak, NASA GSFC, [*Path of the Total Solar Eclipse of 2027 Aug 02*](https://eclipse.gsfc.nasa.gov/SEpath/SEpath2001/SE2027Aug02Tpath.html) — northern limit, southern limit and centre line every 120 s (WGS 84), with the Sun's altitude and azimuth, path width and central duration. Archived 2026-09-24 in the project's `data/ecl/raw/`.
2. [2] Fred Espenak, NASA GSFC, [*Besselian Elements for the Total Solar Eclipse of 2027 Aug 02*](https://eclipse.gsfc.nasa.gov/SEbeselm/SEbeselm2001/SE2027Aug02Tbeselm.html) — polynomial elements x, y, d, l1, l2, μ about t0 = 10:00 TDT, ΔT = 71.7 s, VSOP87/ELP2000-85; greatest eclipse 10:06:37.7 UT at 25°30.3′ N 33°11.0′ E; greatest duration 6 min 23.2 s at 10:00:21 UT, 26°49′ N 31°08′ E. “Eclipse Predictions by Fred Espenak, NASA's GSFC.”
3. [3] Fred Espenak, NASA GSFC, [*Eclipses and the Saros*](https://eclipse.gsfc.nasa.gov/SEsaros/SEsaros.html) — synodic month 29.530589 d, anomalistic 27.554550 d, draconic 27.212221 d; 223 synodic months = 6,585.3223 d, 242 draconic = 6,585.3575 d, 239 anomalistic = 6,585.5375 d; “each successive eclipse path shifts ~120° westward”.
4. [4] Fred Espenak, NASA GSFC, [*Catalog of Solar Eclipses of Saros 136*](https://eclipse.gsfc.nasa.gov/SEsaros/SEsaros136.html) — the 71 members of the series, with the place of greatest eclipse and the central duration of each.
5. [5] Jean Meeus, *Elements of Solar Eclipses 1951–2200* (Willmann-Bell, 1989) — the method that turns Besselian elements into local circumstances, using the observer's geocentric coordinates ρ sin φ′, ρ cos φ′ on the ellipsoid.
6. [6] Jean Meeus, *Astronomical Algorithms*, 2nd ed. (Willmann-Bell, 1998), chapter 47: mean elongation D, argument of latitude F and longitude of the ascending node Ω of the Moon (the node regresses 1,934.1° per century, one turn in 18.6 years), and the mean inclination of the lunar orbit, 5.145°; chapter 25 for the Sun's mean longitude.
7. [7] Jean Meeus, *Astronomical Algorithms*, 2nd ed., chapter 54 (Eclipses): at a new or full moon, no eclipse is possible if |sin F| > 0.36, F being the Moon's argument of latitude -- the test the model on this tab applies, with the real inclination.
8. [8] Fred Espenak, NASA GSFC, [*Path of the Total Solar Eclipse of 2009 Jul 22*](https://eclipse.gsfc.nasa.gov/SEpath/SEpath2001/SE2009Jul22Tpath.html) — the previous member of saros 136 (India, China, the Pacific). Archived 2026-09-24.
9. [9] Fred Espenak, NASA GSFC, [*Path of the Total Solar Eclipse of 2045 Aug 12*](https://eclipse.gsfc.nasa.gov/SEpath/SEpath2001/SE2045Aug12Tpath.html) — the next member of saros 136 (the United States, the Caribbean, Brazil). Archived 2026-09-24.
10. [10] Fred Espenak, NASA GSFC, [*Lunar Eclipses: 2021–2030*](https://eclipse.gsfc.nasa.gov/LEdecade/LEdecade2021.html) — 2027: penumbral eclipses on 20 February, 18 July and 17 August; the next total lunar eclipses visible from Europe on 31 December 2028, 26 June 2029 and 20 December 2029. Archived 2026-09-24.
11. [11] Aristotle, *On the Heavens*, book II, chapter 14, translated by J. L. Stocks (Internet Classics Archive, [classics.mit.edu](https://classics.mit.edu/Aristotle/heavens.html)): “in eclipses the outline is always curved: and, since it is the interposition of the earth that makes the eclipse, the form of this line will be caused by the form of the earth's surface, which is therefore spherical.”
12. [12] Cleomedes, *Cleomedes' Lectures on Astronomy: A Translation of The Heavens*, translated with an introduction and commentary by Alan C. Bowen and Robert B. Todd (University of California Press, 2004), book II — reports of an eclipse of the Moon seen while the Sun was still above the horizon, explained by the bending of sight through moist air.
13. [13] The Photographer's Ephemeris, [*The Selenelion Challenge*](https://photoephemeris.com/en/articles/the-selenelion-challenge) (4 November 2022): “the reason a selenelion can be seen at ground level is atmospheric refraction”; reproduces Tom Ruen's photograph *Lunar eclipse at sunrise, Minneapolis, October 2014* (Wikimedia Commons, CC BY-SA 4.0) as a genuine one.
