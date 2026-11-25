# Point at the Sun. You are pointing at a place on Earth.

> Tab "Azimuth" of *Flat plane or Globe?*. Web page: /#tab-azim. Generated from the rendered page: same text, same computed numbers and sources; drawings are replaced by their captions and descriptions, formulas are TeX. Licence: content and data CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), Xyphophor (https://x.com/Xyphophor); source code MIT; third-party data keep the licence of their source, cited in each tab.

*Azimuth · the bearing that forgets how far away the Sun is*

*Figure caption:* **The two angles of a direction.** From where you stand, a body in the sky has an altitude h above your horizontal plane and an azimuth A, counted clockwise from north. This tab tests the azimuth alone, and the azimuth does not depend on how far away the body is. Angles drawn arbitrary.

Every other solar panel on this page argues from a *time* — sunrise, the length of twilight, where a shadow falls. This one argues from a **direction**, which is cheaper to measure: a stick, its shadow, and a way of finding true north. The claim tested is not that the Sun is far or near, large or small. It is that the bearing you turn to when you face the Sun is the bearing of a particular *place* — the place with the Sun straight overhead at that instant — whatever the Sun's distance turns out to be.

> **The result the whole tab rests on.** The azimuth of any celestial body, measured from true north, is exactly the initial great-circle bearing to its **sub-body point**: the point on Earth that has the body at the zenith. Not approximately, and with no dependence whatever on how far away the body is. Two lines of proof: the sub-body point, the Earth's centre and the body are collinear, by the definition of the sub-body point. The observer's vertical also passes through the centre. So the vertical plane that contains the observer and the body contains the centre, therefore contains the whole line centre-to-body, therefore contains the sub-body point. Same vertical plane, same azimuth.

Two consequences are worth stating before anything is drawn, because both of them close doors that would otherwise be argued through. **First, the distance cancels completely.** This is the kind of quantity rule 5 of this page's own method asks for: the Sun at 150 million kilometres and the Moon at 384,000 obey the same rule, and so would a lamp at 5,000 km. Arguing about the Sun's distance cannot touch the azimuth.

**Second, parallax moves a body along the vertical circle**, toward the zenith — it changes the altitude and not the bearing. That is the objection an informed reader will make about the Moon, whose parallax reaches a whole degree, so it is answered here and not in a footnote; the numbers are further down.

## Three formulas, no free parameters [evidence: prediction]

$$\phi_{\text{sub}} = \delta \qquad \lambda_{\text{sub}} = \alpha - \text{GMST}$$

The sub-body point, from an almanac and a clock. Its latitude is the body's declination; its longitude is the right ascension minus Greenwich mean sidereal time, which is the same statement as −GHA. The USNO publishes GHA and declination for the Sun, the Moon and the navigational stars for any instant you ask for[2], so this line needs nothing from this page. Both quantities here are *geocentric*, and that matters for the Moon: the theorem points at the geocentric sub-point, which is why parallax leaves the bearing alone.

$$A = \text{atan2}\left( \sin\Delta\lambda \cos\phi_2 ,\ \cos\phi_1 \sin\phi_2 - \sin\phi_1 \cos\phi_2 \cos\Delta\lambda \right)$$

The sphere's prediction: the initial great-circle bearing from the observer (φ₁, λ₁) to the sub-body point (φ₂, λ₂). Standard spherical trigonometry, the same formula the distances tab uses, with nothing adjustable in it. Feed it a place, an instant and an almanac and it returns one number.

$$\rho = 90^\circ - \phi \qquad \theta = \lambda \qquad \text{north} = \text{toward the centre}$$

The flat model's prediction, and it needs the map to be *named* before it can have one at all. “The flat Earth” has no azimuths; a projection does. The one used here is the north-polar azimuthal equidistant map[6] — the standard flat-Earth map, the one Gleason patented in 1892[5], and the same map the distances and seismology tabs already run the flat model on. A point sits at radius 90° − φ from the centre at polar angle λ, and an observer's local north is the direction of the map's centre. That is a complete model: given a place and a sub-solar point it returns a bearing, with no height, no lamp size and no fitted constant anywhere in it.

A different projection would give different bearings, and that has to be stated, or the tab would be testing a straw man. What it does not buy is an escape, and the reason is the thesis of the whole page rather than of this tab: a projection that repaired the bearings would have to break the distances, which the distances tab measures, or the shadow zone, which the seismology tab measures. The claim is never “no flat map gets this right”; it is that no single flat map gets two of these right at once.

## One instant, seven observatories, two predictions [evidence: prediction]

The seven places below are Global Seismographic Network stations. Their coordinates are already published[4] and this page already uses them in the seismology tab — no new list, and no place picked to flatter an answer. Three instants are offered, all fixed in advance, and nothing here is adjustable; the play button is there to show there is no favourable moment, not to find one. Every row in the table can be checked without trusting this page, against the USNO's altitude and azimuth table[1] or NOAA's solar calculator[8].

### Where the seven places and the three instants come from

The three instants are two round solstice-week times and the moment of greatest eclipse on 12 August 2026, published to a tenth of a second[3]. At every one of them the sphere's bearing is the bearing to the sub-solar point exactly, and the flat map's is whatever its geometry forces. The play button runs the clock on from whichever instant you picked, for the same reason the magnetism tab has a latitude slider. Every frame satisfies the theorem on the sphere, and every frame leaves the flat map's lines missing each other. The **Moon** button does the whole thing again for the Moon, which is the interesting case.

- **instant** 21 Dec 2026, 12:00:00 UTC documented, and not adjustable
- **Sun overhead at** 23.44° S 0.48° W geocentric sub-solar point
- **stations that can see it** 4 of 7 hollow dots cannot, and carry no ray
- **flat-map error triangle** 37,174 km on its longest side KONO, PMSA, SBA — vertices off the map
- **KONO** 189.3° flat 193.7°
- **SUR** 290.1° flat 292.0°
- **PMSA** 76.3° flat 44.2°
- **SBA** 191.9° flat 354.9°

*Figure caption:* **The globe from the side, rays drawn.** The rays are parallel because they are computed from the body's real distance, not drawn that way. A side view shows only the near face, so a station round the limb is missing here; the strip above and the map beside carry all seven.

### Parallel to within how much

*Figure caption:* Every ray and sight line in this panel is computed from the body's real distance — about 23,000 Earth radii for the Sun, 60 for the Moon. Across the whole planet the Sun's sight lines close on each other by at most about 18″ (0.005°), far below one pixel. The Moon's close by up to about 2°, and at the tips you can see them converge. Switch bodies and watch: that visible difference is the distance, drawn to scale.

*Figure caption:* **The same instant on the flat map.** North-polar azimuthal equidistant, north pole at the centre, in the orientation flat maps are always printed in. Each half-line uses this map's own definition of north — the direction of its centre — at a bearing anyone can check against the USNO. On a correct map they would all run into the body. Press play: the disagreement moves, it does not resolve.

The picture carries the whole theorem. Rays arriving from the body are parallel, and orthographic projection preserves parallelism exactly — so they are parallel on your screen for the same reason they are parallel in space, not because they were drawn that way. Follow them in. At exactly one point the ray runs straight down the radius, and the dashed line continues it through the centre: ray, sub-point and centre are one line.

Nobody looks along a curve, and nobody is being asked to. Each coloured arc is where a station's vertical plane meets the ground; the dotted line leaving that station is the look direction inside the same plane. Every dotted line is parallel to every other, because there is one body and one direction in space. What changes from station to station is the local horizon that direction is measured against, and that alone is why one Sun hands every observer a different bearing.

**Bearing to the Sun at the selected instant: what the sphere predicts, what the flat map predicts**

| Station | Sun's altitude | Globe | Flat map | Disagreement |
| --- | --- | --- | --- | --- |
| **KONO** Kongsberg, Norway | 6.5° | 189.30° | 193.72° | **+4.42°** |
| **HRV** Harvard, Massachusetts | -2.8° — below the horizon | 119.66° | 84.30° | **−35.36°** |
| **ANMO** Albuquerque, New Mexico | -25.8° — below the horizon | 101.62° | 51.65° | **−49.97°** |
| **CTAO** Charters Towers, Australia | -35.7° — below the horizon | 218.31° | 343.11° | **+124.80°** |
| **SUR** Sutherland, South Africa | 69.2° | 290.10° | 292.05° | **+1.95°** |
| **PMSA** Palmer Station, Antarctica | 32.3° | 76.33° | 44.25° | **−32.08°** |
| **SBA** Scott Base, Antarctica | 11.6° | 191.94° | 354.86° | **+162.92°** |

Read the last column rather than the first four. In the far north the two models very nearly agree — the flat map is least wrong near its own centre, which is exactly where its makers live and exactly where the objection “it works fine” comes from. Go south and the disagreement does not merely grow: it **changes sign**, and then passes 90°, and at the December instant a station on the Ross Ice Shelf is told to look almost due north for a Sun that is almost due south. That is not a three-per-cent discrepancy anyone can wave at refraction. It is the difference between turning left and turning right.

## The eclipse: a published bearing, and nobody's word for it [evidence: check — Where the radius enters: the published eclipse bearing comes from an ephemeris that places the observer on the ellipsoid.]

Everything above is this page computing its own answers, which is worth exactly as much as your trust in this page. So here is one row this page did not compute. For the total solar eclipse of 12 August 2026, Fred Espenak publishes the instant of greatest eclipse, the place on Earth it happens, and the Sun's altitude and azimuth there — computed independently, from the JPL DE405 ephemeris[3]. The table below sets that published azimuth beside this page's own, and beside the great-circle bearing to the sub-solar point, which is the quantity the theorem says must equal it.

**Greatest eclipse, 12 August 2026, 17:45:53.3 UT1, at 65° 13.4′ N 25° 13.7′ W**

| Quantity | Published | This page | Difference |
| --- | --- | --- | --- |
| Sun's declination | +14.8013° | +14.8024° | 4.2″ |
| Moon's declination | +15.6162° | +15.6154° | 3.0″ |
| Sun's altitude there | 25.8° | 25.763° | 0.037° |
| **Sun's azimuth there** | **248.4°** | **248.366°** | **0.034°** |
| Bearing to the sub-solar point | — not published | 248.366° | 0.0000° from the azimuth above |
| Sun's and Moon's sub-points | — not published | 99 km apart | which is what an eclipse is |
| ΔT used | 72.4 s | 75.5 s | 3.1 s — under 1″ of Sun |

The agreement is not the interesting part — two correct calculations of the same sphere ought to agree. The interesting part is the third row: the bearing to the sub-solar point comes out equal to the azimuth to every decimal the page prints, which is the theorem being obeyed rather than assumed.

And the eclipse itself is the theorem at its most literal. An eclipse is the moment the Sun's sub-point and the Moon's sub-point nearly coincide; at greatest eclipse these two places are under a hundred kilometres apart on a planet forty thousand kilometres around, which is why one small patch of Iceland has the Moon exactly in front of the Sun. Two bodies, one at 384,000 km and one at 150 million, produce the same bearing from the same spot because their sub-points are in the same place. *Distance does not enter.*

The next total eclipse visible from Europe, on 2 August 2027, has a tab of its own: [Eclipses](/ai/ecl.md) computes its path, its local times and durations from NASA's Besselian elements, and asks a flat model to do the same.

One honest note on the arithmetic: this page's own ΔT model gives 75.5 s where the eclipse prediction uses 72.4 s, a three-second disagreement about the Earth's rotation rate that moves the Sun by well under an arcsecond and the Moon by under two.

## The Moon, and why being close does not rescue anything

The Moon is the one body where a reader can reasonably expect the distance to matter, because its parallax is not a rounding error: seen from the surface rather than from the centre of the Earth, the Moon shifts by up to a degree — twice its own diameter. The shift is **radial**, along the line from the zenith through the body, so it takes the Moon down the vertical circle it is already on. Altitude changes. Bearing does not. The table puts numbers on both, at the same instant and at the same seven stations.

**The Moon at the selected instant: what parallax does to the altitude, and what it does to the bearing**

| Station | Altitude shift | Bearing shift | Bearing to sub-lunar point |
| --- | --- | --- | --- |
| **KONO** Kongsberg, Norway | -1.000° = -60.0′ | −8.2″ | 44.552° |
| **HRV** Harvard, Massachusetts — Moon below the horizon | -0.947° = -56.8′ | +7.1″ | 330.011° |
| **ANMO** Albuquerque, New Mexico — Moon below the horizon | -0.996° = -59.8′ | +15.2″ | 302.800° |
| **CTAO** Charters Towers, Australia | -0.706° = -42.3′ | −1.6″ | 351.390° |
| **SUR** Sutherland, South Africa — Moon below the horizon | -0.803° = -48.2′ | +4.8″ | 82.829° |
| **PMSA** Palmer Station, Antarctica — Moon below the horizon | -0.684° = -41.1′ | −7.0″ | 212.131° |
| **SBA** Scott Base, Antarctica — Moon below the horizon | -0.972° = -58.3′ | −2.2″ | 334.718° |

The bearing shifts are arcseconds against a degree of altitude shift, and this page owes you an account of why they are not exactly zero. On a sphere they would be. They are not zero here because the topocentric correction used for the Moon is the standard one[9], which places the observer on an *ellipsoid*: the local vertical of a geodetic latitude does not quite pass through the centre, missing it by up to about 11.5′ of latitude, and the theorem's one hypothesis fails by exactly that much.

So the residue in the third column is the Earth's flattening, not the Moon's proximity — which is a strange thing to have to admit on a page that elsewhere declares the ellipsoid out of scope, and it is admitted rather than rounded away.

## Parallax as a ruler [evidence: prediction]

Up to here parallax has been set aside: it is radial, so it slides the Moon along the vertical circle it is already on, so the bearing does not care and this tab may set it aside. All of that is true, and it throws away the best thing in the section. The altitude that parallax shifts is the oldest measurement of the Moon's distance there is. So the same two observations yield two independent results, and they are not in competition: the bearing is the quantity the distance **vanishes from**, and the difference in altitude is the quantity that is **nothing but** the distance.

> **What parallax measures, and what it does not.** Two observers a known distance apart see the Moon in front of different stars. The angle between their two sight lines gives the Moon's distance **in Earth radii**, and in nothing else. Turning that into kilometres needs R, and R does not come from the sky: it comes from the surveying, distances and horizon-dip tabs, and from every other radius measurement on this page. This is the thesis of the whole page applied to a single body — the measurement constrains *d/R*, never *d* on its own.

$$\sin \pi = \frac{R}{d} \qquad \frac{d}{R} = \frac{1}{\sin \pi}$$

The classical form. π is the *horizontal parallax*: the angle the Earth's radius subtends as seen from the body, which is the same thing as how far the body shifts between being seen overhead and being seen on the horizon. It is published for the Moon every day[2]. One published number, and the distance in Earth radii follows with no other input whatever. The symbol is the astronomer's, not the circle constant: here π is the name of an angle — about 57′ (0.95°) for the Moon — so sin π ≈ 0.0166, and d ≈ 60 R.

$$\frac{d}{R} = \frac{b}{R \sin \theta}$$

The two-observer form, which is the one you could actually carry out. *b* is the part of the line joining the two observers that lies *across* the direction of the Moon, and θ is the angle between their two sight lines — which is exactly how far the Moon appears to move against the background stars between the two places. Nothing else enters it: no horizon, no height above sea level, no clock beyond agreeing on the instant.

**Measuring the Moon's distance from two of the stations above, at the selected instant**

| Quantity | At this instant | Where the number comes from |
| --- | --- | --- |
| The pair | KONO ↔ CTAO | the two stations that can both see the Moon and whose sight lines open widest — chosen by that rule, not by hand |
| Distance between them | 14,445 km along the surface | great circle, from the published station coordinates |
| Baseline across the line of sight | 1.683 R | the part of the straight line between them lying across the direction of the Moon: *b* in the formula |
| Shift of the Moon against the stars | 101.6′ = 1.693° | θ: computed here, measured by nobody — the angle between the two sight lines |
| **Distance reconstructed** | **56.98 Earth radii** | **b / (R sin θ), and nothing else whatever** |
| From the horizontal parallax alone | 57.13 R | 1 / sin π, with π = 60.2′: one published number, the classical form |
| This page's ephemeris, for comparison | 364,379 km = 57.19 R | Meeus — what the two reconstructions are checked against, not what they are derived from |
| The same measurement on the Sun | 17.5″ across 17,828 km | the widest opening the Sun gives anywhere on this planet: the negative witness |

Two things in that table are better said out loud than left for a careful reader to catch. **The two reconstructions do not agree exactly**, and they are not meant to. Part of the gap is fixed and exactly known: horizontal parallax is defined against the Earth's *equatorial* radius of 6,378.14 km, while the row below it is quoted in mean radii of 6,371 km, so those two lines differ by that ratio — 0.112 per cent — before anything else has happened.

The rest of the gap moves with the geometry, and it is the flattening again, exactly as in the bearing column further up: it is smallest when the two stations lie squarely across the line of sight, and largest when the baseline is badly foreshortened or the Moon is low in one of the two skies. On a sphere both parts would be zero. Watch it change as the clock runs, because a page that had quietly fitted something would not let you.

**And the same measurement fails on the Sun**, which is why the last row is there. Across the whole width of the planet the Sun shifts by some sixteen arcseconds — under a hundredth of the Moon's shift, and far below anything the equipment this experiment asks for could see. That failure is what shows the method is not manufacturing its answer: an instrument that returned a distance for everything you pointed it at would be measuring itself.

**The flat model given its best chance: a lamp at a fixed height above the disc, and the altitudes it would require**

| Station | Lamp 3,000 km up | 5,000 km up | 8,000 km up | The Moon, really |
| --- | --- | --- | --- | --- |
| **KONO** Kongsberg, Norway | 16.9° | 26.8° | 38.9° | 1.7° |
| **HRV** Harvard, Massachusetts | 13.8° | 22.3° | 33.2° | -18.8° — set |
| **ANMO** Albuquerque, New Mexico | 14.8° | 23.8° | 35.2° | -5.2° — set |
| **CTAO** Charters Towers, Australia | 31.1° | 45.1° | 58.1° | 45.1° |
| **SUR** Sutherland, South Africa | 9.3° | 15.2° | 23.6° | -36.9° — set |
| **PMSA** Palmer Station, Antarctica | 7.1° | 11.7° | 18.3° | -46.7° — set |
| **SBA** Scott Base, Antarctica | 13.4° | 21.7° | 32.5° | -13.7° — set |

The lamp's height is the flat model's one free parameter here, and rule 2 of this page's method says to spend it in the flat model's favour rather than to caricature it — so the table sweeps it instead of picking one. Choose whichever column comes closest at one station and it is wrong at the next; there is no height, inside that range or outside it, that produces the last column.

Then notice what happens at the places where the Moon has set. A lamp hanging over a plane is above the horizon from *everywhere* on that plane, always, at every height — its altitude is the arctangent of a positive number and cannot be anything else. The Moon is below the horizon at several of these places at the same moment. That is not a disagreement of a few degrees to be haggled over: it is a change of sign, and no choice of height touches it.

## Who did this before you

None of this is a modern measurement, and pretending otherwise would sell it short. Hipparchus, in the second century BC, got the Moon's distance out of a solar eclipse that was total at the Hellespont and about four fifths covered at Alexandria — two places, one instant, one angle. The figure usually reconstructed for him is around 67 Earth radii, with a spread of roughly 62 to 73[10], and the eclipse is most probably the one astronomers label −189, which is 190 BC[11]. Those are reconstructions from later summaries and they differ between scholars, so a range is the only honest form to give them in.

Ptolemy, three centuries after that, measured the parallax *directly*, with an instrument built for the purpose, in Book V of the *Almagest*[12] — a different geometry from the eclipse method, and the two are routinely run together by people retelling the story. His lunar model was also badly wrong about how much the distance varies, implying a swing from about 34 to 64 Earth radii[10] where the truth is about 56 to 64: a useful reminder that having the right order of magnitude is not the same as being right.

And in 1751 the thing was finally done properly. Lacaille observed the Moon from the Cape of Good Hope while Lalande, nineteen years old and sent in his teacher's place, observed it from Berlin on very nearly the same meridian[13]: two people ten thousand kilometres apart, agreeing on a minute. What the young Lalande then argued about with that teacher, in front of a commission of the Paris Academy, was how much to allow for the Earth not being a perfect sphere — which is the same correction that puts the tenth of a per cent into the table above.

## What could spoil your measurement

**Magnetic north is not north.** This is the one that will ruin the experiment if it is not taken seriously, because the error is the same size as the effect: the declination runs to 10–20° across western Europe and much more elsewhere, and it drifts. Either correct it with the official model[7] or, better, avoid the compass entirely — at true solar noon the shadow of a vertical stick is at its shortest and lies exactly along the north–south line, so one observation removes magnetic declination from the problem altogether.

**The clock matters more than it looks.** The sub-solar point travels 15° of longitude per hour; an hour of error is an hour of wrong answer, and everything on this tab is stated in UTC for that reason.

**Refraction is almost innocent here**, and that is not luck: like parallax, atmospheric refraction lifts a body along its vertical circle, so in a spherically stratified atmosphere it changes the altitude by up to 34′ near the horizon and the azimuth by nothing at all. Only a horizontally structured atmosphere bends a bearing, and by arcminutes.

**And the projection is a choice**, restated once more because it is the honest weak point: the numbers in the flat column are the azimuthal equidistant map's numbers, not a proof about every conceivable flat map.

Experiment 9 · where is the Sun for you?

A stick, its shadow, and one agreed minute — with a friend far away, if you can

Stand a stick vertically on level ground. At an agreed UTC minute, mark the shadow. The Sun's azimuth is the shadow's direction plus 180°. Measure that angle from **true** north — see above for why the compass will not do — with a printed protractor and a piece of string, or by taking a second mark at local solar noon to establish the north–south line first.

Independent variable
**What you change:** your **place**. The sharp version needs two observers far apart in latitude, ideally one in each hemisphere, at the same UTC minute; the weaker but still decisive version is one observer and the published bearing for their own coordinates.

Dependent variable
**What you measure:** the Sun's **azimuth** in degrees from true north. One angle. Not a duration, not a brightness, not a horizon.

At **21 Dec 2026, 12:00:00 UTC**, the widest disagreement among these stations is at **Scott Base, Antarctica**: the Sun is **191.9°** from true north, and the flat map says **354.9°** — a gap of **162.9°**. The narrowest is **Sutherland, South Africa**, where the gap is only **2.0°**, which a protractor and a string will not resolve.

**Verdict rule.** At SBA the two models do not differ in size but in **direction**: one sends you 163° round the horizon from the other. Measure the bearing to ±5° and one of them is finished. If it agrees with the flat map, the globe prediction is refuted; if it agrees with the great-circle bearing to the published sub-point, no choice of lamp height rescues the disc, because the disc's bearing has no lamp height in it.

Experiment 9b · the Moon against the stars

One photograph each, two places, one agreed second — and the sky is the ruler

Agree an instant, to the second, with someone far away from you in latitude. At that instant each of you photographs the Moon with a star close beside it in the same frame. Then measure how far the Moon sits from that star, in arcminutes, in each photograph, and take the difference. That difference is the parallax. You are deliberately *not* measuring a height above a horizon: an angle inside a single frame needs no level, no horizon and no calibration, and refraction lifts the Moon and the star beside it by almost the same amount, so most of it cancels instead of having to be modelled.

Independent variable
**What you change:** your **place**, at a fixed instant. Two observers as far apart in latitude as you can arrange; a few thousand kilometres is already plenty. Without a second observer, the published topocentric position for your own coordinates does the same job rather less convincingly.

Dependent variable
**What you measure:** the Moon's **angular distance from a nearby star**, in arcminutes. One angle inside one photograph. Not an altitude, not a time, not a horizon.

At **21 Dec 2026, 12:00:00 UTC**, **Kongsberg, Norway** and **Charters Towers, Australia** lie 14,445 km apart and both have the Moon above the horizon. Between those two viewpoints the Moon stands **101.6′** apart against the background stars — 3.1 times its own diameter, so a single photograph from each place settles it. That one angle gives **56.98 Earth radii**, against 57.19 from this page's ephemeris, and it needed no distance, no horizon and no clock beyond the agreed instant. The same two sight lines to the **Sun** open by only 17.5″, which is why this experiment does not work on the Sun.

**Verdict rule.** The globe fails if your measured shift does not put d/R within your own uncertainty of the almanac's, or if the answer changes when you turn the baseline. The flat model fails on the table above: the kindest of the three lamp heights at this instant is 3,000 km, and even that one misses some station's altitude by **53.8°** — and at 5 of these 7 places the Moon is below the horizon right now, where a lamp hung over a plane is above it from everywhere, at every height.

**See also**[Sun](/ai/sun.md)[Twilight](/ai/twi.md)[Magnetism](/ai/mag.md)[Cel. nav.](/ai/cnav.md)[Distances](/ai/dist.md)[Surveying](/ai/surv.md)[Observation](/ai/obs.md)

## Sources for this tab

1. [1] [U.S. Naval Observatory — *Altitude and Azimuth of the Sun or Moon During One Day*](https://aa.usno.navy.mil/data/AltAz): enter any place and any date between 1700 and 2100 and it returns the altitude and azimuth, tabulated. This is the independent check on every bearing printed on this tab, and it is free and takes a minute.
2. [2] [U.S. Naval Observatory — *Celestial Navigation Data for Assumed Position and Time*](https://aa.usno.navy.mil/data/celnav): Greenwich hour angle and declination for the Sun, Moon, planets and navigational stars, which is the sub-body point in the form navigators use. Also prints the computed azimuth Zn, so the two halves of the theorem can be read off one page.
3. [3] [F. Espenak, EclipseWise — *Total Solar Eclipse of 2026 Aug 12*](https://eclipsewise.com/solar/SEprime/2001-2100/SE2026Aug12Tprime.html): the instant of greatest eclipse (17:47:05.8 TD = 17:45:53.3 UT1), its position, the Sun's altitude and azimuth there, the geocentric coordinates of both bodies, and ΔT — all from the JPL DE405 ephemeris. The published azimuth in the eclipse table above is this one, not a value computed here.
4. [4] [EarthScope / NSF SAGE — data and station-metadata services](https://service.iris.edu/clients/): the coordinates of the Global Seismographic Network stations used as observing sites here, which are the same ones the seismology tab uses. Nominal positions, rounded to 0.01°; a hundredth of a degree is about a kilometre and the disagreements below run to thousands.
5. [5] [Norman B. Leventhal Map & Education Center, Boston Public Library — catalogue record for Alexander Gleason, *New Standard Map of the World* (1892)](https://collections.leventhalmap.org/search/commonwealth:7h149v85z): the flat map whose azimuths are computed here, held and described by a public library rather than by this page. Its own legend calls it a projection of the sphere, which is worth knowing before it is cited as a flat Earth.
6. [6] [J. P. Snyder, *Map Projections — A Working Manual*, USGS Professional Paper 1395 (1987)](https://doi.org/10.3133/pp1395): the azimuthal equidistant projection defined and its formulas given, so the flat model used here is the textbook object and not a caricature invented for the occasion.
7. [7] [NOAA National Centers for Environmental Information — geomagnetic models and calculators](https://www.ngdc.noaa.gov/geomag/models.shtml): the World Magnetic Model, and the declination calculator that converts a compass bearing into a true one. The single most likely source of error in the experiment on this tab.
8. [8] [NOAA Global Monitoring Laboratory — Solar Calculator](https://gml.noaa.gov/grad/solcalc/): a second, independent implementation of the solar position, including azimuth. If this page and the USNO ever disagreed, this is the tie-breaker.
9. [9] **J. Meeus, *Astronomical Algorithms*, 2nd ed. (Willmann-Bell, 1998)**, chapters 12, 13, 25, 40 and 47 — sidereal time, coordinate transformation, the Sun, the parallax correction and the abridged lunar theory. These are the algorithms this page's ephemeris implements, so the reference is given for auditing it rather than for authority.
10. [10] [K. Krisciunas, *Determining the Eccentricity of the Moon’s Orbit without a Telescope* (American Journal of Physics 78, 2010; arXiv:1001.1432)](https://arxiv.org/abs/1001.1432): its opening pages collect the pre-telescopic lunar distances together with the scholarship behind each — Hipparchus at 67⅓ Earth radii with a range of 62 to 72⅔, and the 33.6 to 64.2 range implied by Ptolemy’s lunar model. The body of the paper measures the Moon’s changing angular size with a piece of cardboard and a yardstick, which is the same spirit as the experiment below.
11. [11] [L. V. Morrison, F. R. Stephenson & C. Y. Hohenkerk, *On the Eclipse of Hipparchus*, Journal for the History of Astronomy 50 (2019)](https://journals.sagepub.com/doi/10.1177/0021828618817175): which eclipse Hipparchus actually used, decided by plotting the candidate tracks against modern measurements of the Earth’s changing rotation rate. Cited here for the date and for nothing else.
12. [12] **G. J. Toomer (trans.), *Ptolemy’s Almagest* (Duckworth, 1984)**, Book V: the parallactic instrument and the direct measurement of the Moon’s parallax. A different geometry from Hipparchus’s eclipse, and the standard translation to check any retelling against.
13. [13] [MacTutor History of Mathematics — *Jérôme Lalande*](https://mathshistory.st-andrews.ac.uk/Biographies/Lalande/): the 1751 Berlin–Cape of Good Hope campaign, why Berlin was chosen (nearly the same meridian as the Cape), and the dispute with Lemonnier over how to correct for the Earth’s flattening, which a commission of the Paris Academy settled in Lalande’s favour.

## Further reading

Not cited above, and no claim on this tab rests on it — listed because it is what you would read next, or because it lets you redo the measurement on data this page did not choose.

- [NASA — *Total Solar Eclipse on August 12, 2026*](https://science.nasa.gov/eclipses/future-eclipses/total-solar-eclipse-on-august-12-2026/), with the Scientific Visualization Studio's shadow-path map. Not needed for any claim here, but it is the same event drawn as a picture, and the umbral track is the sub-lunar point's path across the surface.
- [IMCCE, Observatoire de Paris](https://www.imcce.fr/) — a third independent ephemeris service, and in French. Worth having because “check it somewhere else” is a weaker instruction when all the somewhere-elses are in one country.
- **Bowditch, *The American Practical Navigator***, the chapters on azimuth and on the sight reduction of the Sun. The theorem on this tab is, in navigator's language, the statement that the azimuth of a body equals the bearing of its geographical position — a working tool for two centuries before it was an argument about anything.
