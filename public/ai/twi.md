# The sky is lit for an hour before sunrise — and on a plane there is nothing above you for the Sun to light

> Tab "Twilight" of *Flat plane or Globe?*. Web page: /#tab-twi. Generated from the rendered page: same text, same computed numbers and sources; drawings are replaced by their captions and descriptions, formulas are TeX. Licence: content and data CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), Xyphophor (https://x.com/Xyphophor); source code MIT; third-party data keep the licence of their source, cited in each tab.

*Dawn & twilight · the light that arrives before the Sun does*

- Ceiling of the Earth's shadow over your head, from h = R(sec θ − 1) with R = 6,371 km: **35 km** at 6° · **142 km** at 12° · **328 km** at 18°. The left panel is at true scale, which is why the 6° shell is barely a line — that thinness is the point, not a drawing fault.

*Figure caption:* **Why there is light overhead and none underfoot.** Drawn **at true scale with no exaggeration at all** — none is needed, and the thinness of the lit shell is itself the finding. Note what the picture does *not* contain: any assumption about how bright the scattering is. The claim is only that a boundary exists and that its height is set by R.

Long before the Sun clears the horizon the sky is already bright, and long after it has gone the sky stays bright a while longer. That is not the question this tab asks. The question is sharper and much harder for a flat model to answer: why is it bright *up there* while it is dark *down here*?

A lit sky over an unlit ground is an asymmetry, and an asymmetry needs an edge. An edge needs a shadow. A shadow needs a body big enough and round enough to cast one. On a plane the Sun is above the plane at every hour of the day and night, so there is nothing anywhere that can be in shade while the air above it is in sunlight.

$$h = R\left(\sec\theta - 1\right) \approx \frac{R\theta^2}{2}$$
θ = the Sun's depression below the horizon

When the Sun is θ below your horizon, the last ray that grazes the Earth's surface passes over your head at a height h. Below h you are in the planet's shadow; above h the air is still in full sunlight and scatters some of it down to you. That single line is the whole of twilight, and it contains R — so twilight is a *measurement of the radius*, not merely a consequence of it. Put θ = 6°, 12° and 18° into it and out come 35 km, 142 km and 328 km, which is the table further down.

## Three twilights, and why they stop where they stop [evidence: prediction]

The three stages are defined by the Sun's geometric depression and by nothing else: civil twilight runs from sunset to 6° below, nautical from 6° to 12°, astronomical from 12° to 18°.[1]

The names record what a person could still do. Through civil twilight you can carry on outdoors without a lamp and the horizon stays crisp. Through nautical twilight the sea horizon is still visible while the brighter stars are out, which is exactly the window in which a sextant sight works and is why sailors named it. By the end of astronomical twilight the sky no longer adds measurable light to a telescope's field.

Those are human conventions, chosen for human tasks. What is *not* a convention is the height each one corresponds to. The formula above turns each threshold into a height above your head, and the answers land on the structure of the atmosphere without having been aimed at it. The table computes them; nothing in it is typed in by hand.

**Each twilight threshold, turned into the height of the shadow's ceiling over the observer — computed from h = R(sec θ − 1) with R = 6,371 km**

| Stage ends at | Sun's depression θ | Shadow ceiling h | h as a fraction of R | What is still in sunlight up there |
| --- | --- | --- | --- | --- |
| Sunset / sunrise | 0° | **0.0 km** | 0.00 % | nothing: the ceiling is at your feet. This is sunset. |
| Civil twilight | 6° | **35 km** | 0.55 % | mid-stratosphere, above the ozone peak — about 99% of the atmosphere's mass is already below it |
| Nautical twilight | 12° | **142 km** | 2.23 % | thermosphere — the height auroras are seen at, and where meteors burn up |
| Astronomical twilight | 18° | **328 km** | 5.15 % | the altitude the space station orbits at — there is essentially nothing left up there to scatter light |

> **How much of that is an argument, and how much is a coincidence.** Be careful here, because the temptation is to claim more than the geometry gives. The 6/12/18 thresholds were fixed by what people can do, not derived from air density, so the correspondence in the last column is a *consistency check*, not a derivation. What the geometry does give, with no wiggle room, is the mapping itself: an 18° Sun puts the shadow ceiling at 328 km and a 6° Sun puts it at 35 km, and those follow from R alone. The interesting part is that the point where a human stops being able to see the sky glow lands where the air runs out — and that the same R which fixes the horizon in the dip tab, the star altitudes in the navigation tab and the arrival times in the seismology tab also fixes this.

## What the inverse-square law actually predicts on a plane [evidence: prediction]

Now the flat model, taken seriously and given its best case. Put a Sun at height H above an infinite plane, let it be as small and as close as you like, and let its light fall off as the inverse square of distance — which is the correct law for a compact source and is the law flat-earth accounts appeal to when they explain sunset as the Sun becoming distant and dim. An observer at ground distance d from the point directly under it is at slant range r = √(H² + d²), and the light lands on the ground obliquely, at an angle whose cosine is H/r.

$$E(d) = \frac{I H}{\left(H^2 + d^2\right)^{3/2}}$$
$$\vartheta(d) = \frac{D}{\sqrt{H^2 + d^2}}$$

E is the illuminance on level ground — the quantity a light meter pointed at the sky measures, and the quantity the published twilight measurements report. ϑ is the Sun's apparent diameter, with D its real diameter. Both are elementary and both hold on a plane for any H, any D and any brightness I.

Divide each by its value at noon, when the observer stands directly under the Sun, and something useful happens: every free parameter cancels. H disappears. D disappears. The Sun's brightness disappears. What is left is a relation between two things you can measure with a phone.

$$\frac{E(d)}{E(0)} = \left(\frac{H}{r}\right)^3 = \left(\frac{\vartheta(d)}{\vartheta(0)}\right)^{3}$$

On a plane, the ground can only get dark to the exact extent that the Sun gets *small*. Dim it by a thousand and it must have shrunk tenfold. That is not a claim about any particular flat map, or any particular Sun height, or any particular disc diameter — it is inverse-square geometry with the nuisance parameters divided out, in the same way the reciprocal zenith angles in the elevation tab cancel the two station heights. If you prefer the illuminance measured face-on to the rays rather than on level ground, drop the obliquity factor and the exponent becomes 2 instead of 3. It changes none of what follows.

So the flat model owes two numbers that must agree, and both have been measured to death. The measured day-to-night ratio of downwelling light is about **one hundred million**: a recent open-data study spanned it with two spectrometers precisely because no single instrument covers a factor of 10^8.[2] Full sun is of order 100,000 lux; a clear moonless night sky is of order 0.001 lux.[2][10]

And the Sun's apparent diameter runs between 31.6′ and 32.7′ over a whole year, a 3% swing caused by the Earth's orbital eccentricity, and is constant to far better than a percent across any one day.[7]

**The flat model's own arithmetic, with the Sun at three heights that have been proposed — all computed, none fitted**

| Sun height H | Distance d at "midnight" | Predicted brightness drop | Predicted disc shrinks to | Measured drop | Short by a factor of |
| --- | --- | --- | --- | --- | --- |
| 1,000 km | 20,000 km | 1 / 8,030 | 1.6′ | 1 / 100,000,000 | 12,453 × |
| 3,000 km | 20,000 km | 1 / 306 | 4.7′ | 1 / 100,000,000 | 326,422 × |
| 5,000 km | 20,000 km | 1 / 70 | 7.8′ | 1 / 100,000,000 | 1,426,680 × |
| 10,000 km | 20,000 km | 1 / 11 | 14.3′ | 1 / 100,000,000 | 8,944,272 × |
| **43 km** — forced | 20,000 km | 1 / 100,000,000 | 4.1″ | 1 / 100,000,000 | **matches — at the cost of the disc** |

> **The steel-man, and why it eats itself.** H is the flat model's free parameter, so tune it in the flat model's favour: pick whatever H makes the night as dark as the night actually is. The answer is H ≈ 43 km on a 20,000 km disc — the Sun would have to be lower than a weather balloon's ceiling. But the relation above is a package deal. Buying a factor of 10^8 in brightness means buying a factor of 464 in apparent size, so that Sun would cross the sky shrinking from 32′ at noon to 4″ at midnight, from a disc to a star. Nobody has ever recorded that, and a mobile phone with a solar filter rules it out in an afternoon.

> **Tune it back the other way, and it eats itself.** Push H back up to keep the disc the right size and the night gets bright again: at the usual 5,000 km the model's midnight is **one seventieth** of noon, about the difference between direct sun and a dull overcast afternoon, not the difference between noon and starlight. There is no H that does both jobs, because the exponent linking them is fixed by geometry.

*Figure caption:* **Eight orders of magnitude, and where the flat curves stop.** The vertical axis is the light on level ground relative to noon, on a log scale, so each gridline is a factor of ten; the horizontal axis is ground distance.

The gap is not a discrepancy that better numbers might close. The flat curves flatten out because a source at finite height never gets far away compared with itself, while the measurement falls off a cliff. On a globe there is no curve to draw at all past the terminator — the direct beam is geometrically zero there, and every photon that reaches you has been scattered down out of the sunlit shell above.

## The two models side by side, in motion [evidence: prediction]

Everything above compares one place at one moment. This panel puts the whole planet under both models at the same instant, because the disagreement is not really about how bright the sky is — it is about the *shape* of the lit region, and shape is the thing you can check without owning a light meter. On the left, a globe shaded by the Sun's altitude, with the three twilight thresholds drawn as the small circles they actually are. On the right, the same instant on the standard flat map, in two versions.

The second of those versions is the one that matters, and it is worth being clear about why it is not a straw man. Suppose everything is granted: forget the inverse square, forget the Sun's height, and assume only that brightness on a plane is *some* decreasing function of your distance from the point beneath the Sun. What that function is does not matter. Because it decreases, its contours are **circles centred on the subsolar point** — for every such function, without exception.

So a flat Earth is committed to a circular day–night boundary whatever its photometry turns out to be, and the single remaining number, the radius, is then tuned *in the flat model's favour*: each ring is pinned so that the plane is exactly right at 45° N at that instant. It touches the truth at one latitude, by construction, and misses everywhere else. The dashed teal curve is where sunset is really happening, which is not a claim of this page but the content of the sunrise and sunset tables printed for every city on Earth.

- Day 189 of the year, **11:15 UTC**. Sun overhead at **22.5° N, 12.5° E**; the middle of the night is at **22.5° S, 167.5° W**. **Dashed teal** = the real day–night edge at this instant, the line the published sunrise and sunset tables trace out. Its short ticks point into the night side, so the loop encloses the night rather than the day — worth checking at the December preset, where it closes around the pole. **Hollow dot** = that morning's sunrise at 45° N, **solid dot** = that evening's sunset. Both sit at the same map distance from the Sun, so one calibration pins the rings through both; any decreasing law gives rings, so only their radii were free and they have been spent there.

*Figure caption:* **One instant, two geometries.** The teal curve is not this page's assertion: it is the published rise and set tables, drawn as a line. One calibration pins both amber dots and every ring passes through them, so the plane is exact there *by construction* — the comparison is everywhere else. The globe's zone boundaries are computed, not traced; its daylight ramp is Lambert's cosine, but the ramp *through* twilight is interpolated, and schematic, because this page owns no scattering model.

Watch the ticks reverse. In July the day–night curve hugs the lit region and they face outwards; in December it closes around the pole and they face in, because in December the pole is the part in darkness. That reversal is not a drawing choice — it is what a tilted planet does.

The two halves do not animate alike, and it is worth knowing which. On the globe the viewpoint is fixed relative to the Sun, so the terminator holds still and the coastlines slide through it. On the flat map the coastlines are held still, in the orientation flat maps are always drawn in, and the lit patch sweeps across them instead. Both show the same rotation; they differ only in what they nail down. The right-hand panel offers two shadings: **1/r²** shades the plane by E/E₀ = (H/r)³ with the Sun 5,000 km up, and **Fitted** instead draws the circular contours that any decreasing law is forced to produce.

Switch the right-hand panel to **1/r²** and an obvious question arises: if the plane never goes dark on this map, then where does it go dark? The formula answers it. Solving E(d)/E(0) = 10^−8 for the distance, with the Sun 5,000 km up, puts real night **2,320,800 km** from the point beneath it — a hundred and sixteen times the radius of the whole flat map, and six times the distance to the Moon.

Even a mere thousandfold dimming, which is still a bright overcast afternoon rather than night, does not arrive until 49,700 km, two and a half times the rim. Lowering the Sun does not rescue this: at 1,000 km, about the lowest anyone has proposed, night still needs 464,000 km, twenty-three times the map. The plane is simply too small for its own light to fall off across it, and that is not a defect of one flat map but of the inverse-square law applied to a source hanging a few thousand kilometres above a surface you can walk on.

> **The day almost nobody is in the dark.** Set the panel to 8 July, 11:15 UTC and look at where the night is. Combining their solar data with a gridded population dataset, timeanddate found that at that moment it is night for just under 80 million people — so roughly **99% of humanity** is receiving some sunlight at once, about 83% in full daylight and 16% somewhere in twilight.[11]

> **What that number does and does not say.** They are careful, and so is this page: around 3% of that total, some 257 million people, are in astronomical twilight, which is not distinguishable from night by eye, so the honest figure for *perceptible* light is nearer 96%.[11] It is also not unique to one date — it holds on about sixty days around the June solstice, with the daily peak falling between 11:00 and 11:03 UTC.[12] This page ships no population grid and does not recompute those percentages; it quotes them, and they are checkable against the sources.

Why is that an argument rather than a curiosity? Because the number is a *census of who is standing inside the shadow*, and the shadow's shape is precisely what the two models disagree about.

It comes out that high because the middle of the night, on that date at that hour, sits in the emptiest part of the Pacific, while the tilt keeps the whole northern half of the planet — where most of humanity lives — in daylight at the same time. That is not a coincidence anybody arranged; it falls out of a tilted sphere turning once a day, and you can watch it fall out by pressing play.

Then switch the right-hand panel between its two versions and ask which landmasses each one puts in the dark. They are not the same landmasses, and only one of the two answers agrees with the sunrise and sunset times published for those cities on that date.

## The duration of twilight is the test with no radius in it [evidence: prediction]

Everything so far has used R. This section does not, and that makes it the counterpart on this tab of the magnetism tab's dip law: a constraint on *shape* that survives any rescaling. Twilight lasts as long as the Sun takes to travel from the horizon down to 18° below it, and how long that takes depends on the angle at which the Sun's daily circle meets your horizon. At the equator it comes down almost vertically and the whole business is over in a little over an hour. At 50° north it slants, and in June it slants so much that the Sun never gets 18° down at all.

$$\cos H = \frac{\sin h - \sin\varphi\sin\delta}{\cos\varphi\cos\delta}$$
$$h_{\min} = \left|\varphi + \delta\right| - 90^\circ$$

The first line is the hour angle at which the Sun stands at altitude h, for latitude φ and declination δ; the duration of a stage is the difference of two hour angles divided by 15.041° per hour. The second line is the Sun's altitude at local midnight, and it is the one that decides everything: if h_min never reaches −18°, there is no astronomical night at that place on that date, however long you wait. Notice that neither line contains R, or any distance at all, and an independent implementation of the same formulae is published by a different institution in a different country's service.[9] These are statements about a sphere's shape and its tilt, and they would read the same for a planet twice the size.

Set h_min = −18° and the condition falls out: astronomical night disappears above latitude 90° − 18° − δ. At the June solstice, with δ = 23.44°, that is **48.6°**. Nautical night goes at **54.6°** and civil night — the genuine white nights — at **60.6°**. Those are three sharp latitudes, predicted from the obliquity of the ecliptic and nothing else, and every one of them can be checked by looking up a published almanac[8] or by going outside in June.

Paris sits at 48.86°, a fifth of a degree past the first threshold, which is why Paris has no astronomical night for about two months either side of midsummer and Nice, 5° further south, has one every night of the year.

**Length of each twilight stage, computed from latitude and declination alone — sunrise taken at the standard −0°50′ for the centre of the disc**

| Place | Latitude | Date | Civil | Nautical | Astronomical | Sun's altitude at midnight |
| --- | --- | --- | --- | --- | --- | --- |
| Quito | −0.22° | date-equinox | 21 min | 24 min | 24 min | −89.8° |
|  |  | date-june | 22 min | 26 min | 26 min | −66.8° |
| Nice | 43.70° | date-equinox | 29 min | 34 min | 34 min | −46.3° |
|  |  | date-june | 36 min | 47 min | 60 min | −22.9° |
| Paris | 48.86° | date-equinox | 31 min | 37 min | 38 min | −41.1° |
|  |  | date-june | 43 min | 61 min | *all night* | **−17.7°** |
| London | 51.51° | date-equinox | 33 min | 39 min | 41 min | −38.5° |
|  |  | date-june | 48 min | 74 min | *all night* | **−15.0°** |
| Copenhagen | 55.68° | date-equinox | 37 min | 44 min | 46 min | −34.3° |
|  |  | date-june | 61 min | *all night* | *all night* | **−10.9°** |
| Saint Petersburg | 59.94° | date-equinox | 41 min | 50 min | 54 min | −30.1° |
|  |  | date-june | 105 min | *all night* | *all night* | **−6.6°** |
| Reykjavík | 64.13° | date-equinox | 48 min | 58 min | 66 min | −25.9° |
|  |  | date-june | *all night* | *all night* | *all night* | **−2.4°** |
| Ushuaia | −54.80° | date-equinox | 36 min | 43 min | 45 min | −35.2° |
|  |  | date-june | 45 min | 47 min | 44 min | −58.6° |

*Figure caption:* **Twilight length against latitude, and the three places it becomes infinite.** All three curves are at midsummer — June in the north, December in the south — so the axis is latitude without a sign and Ushuaia is plotted at its own midsummer rather than pretended to be northern. The three latitudes are 48.6° for astronomical, 54.6° for nautical, 60.6° for civil.

A flat model has no counterpart for any of this. Its Sun is above the plane at every instant, it never crosses a horizon, and nothing in an inverse-square falloff produces a latitude past which a stage takes infinitely long in June and eighty minutes in December.

> **This is a sign test, not a near miss.** The page prefers these wherever it can get them, for the reason set out in the elevation tab: a disagreement of a few percent can always be blamed on the instrument, but a question with a yes and a no cannot. Does astronomical night occur at your latitude in the third week of June? At 48° the answer is yes and at 49° it is no, and the almanac agreed with the calculation for a century before anyone thought to argue about it. The flat model does not give a different answer here. It gives no answer, because it has no quantity whose sign could flip.

## The Earth's shadow is an object, and you can photograph it

On a clear evening, turn your back on the sunset and look east about ten minutes after the Sun has gone. There is a dark blue-grey band lying along the horizon, with a soft pink band above it, and the boundary between them is straight enough to measure and slightly curved if you take in enough sky. The pink is sunlight reddened by its long passage through the lower atmosphere and back-scattered towards you — it has been called the Belt of Venus for a long time. The dark band under it is the Earth's own shadow, projected onto the air, seen edge-on.[6]

It behaves exactly as a shadow should. It appears opposite the Sun, centred on the antisolar point to within the accuracy anyone can hold a camera. Its top rises as the Sun sinks, at the Sun's own rate, so that its elevation above the eastern horizon tracks the Sun's depression below the western one. It is wider than the Sun because the Sun is not a point. And it fades out as it climbs, for the plainest of reasons: it is being projected onto air that is thinning as it goes up, so by the time the shadow's edge is 20° high there is nothing left up there to catch it.

*Figure caption:* **The eastern sky at three moments after sunset.** The dark segment is the geometric shadow of the Earth, drawn at the elevation the Sun's depression puts it, with the reddened band immediately above it. This is a schematic: the colours are indicative and the fading is drawn, not computed from a scattering model. What *is* computed is the height of the boundary in each frame, and that is the whole falsifiable content — an edge exists, it sits opposite the Sun, and its elevation equals the Sun's depression. The flat model predicts no edge at all in the eastern sky, because there is no body between the observer and the Sun to cast one and the Sun is never below the plane.

## Four objections, and what each one costs

Refraction is real and this page models it everywhere, so before the objections, here is its size: at the horizon it lifts an object by about 34′, a little over half a degree, and that is the reason sunrise is reckoned with the Sun's centre at −0°50′ rather than at zero.

### 1. "It is just perspective — the Sun goes too far away to see."

Perspective moves things towards a vanishing point; it does not switch them off, and it certainly does not switch off the ground while leaving the sky lit. If the Sun were merely far, its light would still be falling on your street at the same fraction of noon as on the air 200 km above your street, because both are essentially the same distance from it. The asymmetry is the whole phenomenon and perspective has nothing to say about it. Perspective also cannot make an edge: the shadow in the eastern sky has a boundary you can put a protractor on.

### 2. "The Sun is a spotlight and its beam has a limited reach."

This is the stronger version, and it is worth taking seriously because it does at least produce a boundary. But it produces the wrong one. A spotlight on a plane illuminates a circle, and the edge of that circle is at a fixed distance from the sub-solar point, so the time your location spends in the fade is set by how fast that edge sweeps past — which is nearly the same everywhere and in every season. The measured twilight lasts 68 minutes at the equator, 107 minutes at Paris in March and never ends at Paris in June. A beam of fixed reach cannot do that. It also cannot put the fade boundary in the sky *opposite* the Sun rather than in the direction the beam is going.

### 3. "Refraction explains it."

Its size is priced above: about 34′ at the horizon, against the 1,080′ that twilight runs to — thirty times larger, and refraction shrinks rapidly as you move away from the horizon. There is also no free parameter left to spend: the refraction tab prices the flat limit k = 1 at a sustained inversion of +12.9 °C per 100 m, and radiosondes have been failing to find one since 1905.

### 4. "The air simply gets dimmer as the light travels further through it."

Extinction along a long slant path is real too, and it is why the setting Sun is red and dim enough to look at. But extinction is a smooth, monotonic, exponential attenuation with air mass. It gives no threshold, no edge, and no dependence on the *direction* you look — whereas the observed twilight sky is bright in the west and dark in the east by an amount that tracks a single angle. And extinction cannot produce the latitude thresholds of the previous section, because the air mass along the path is a function of the Sun's altitude, and the whole point of that section is that the Sun's altitude at midnight is fixed by φ and δ in a way no atmospheric effect can touch.

Experiment 1f · dawn and twilight

Time first light against the clock, twice a year, from your own doorstep

This one costs nothing and needs no instrument beyond a phone and a clear horizon. Pick a spot with an open view east, go out well before sunrise on a clear morning near an equinox, and write down the clock time at which you can first make out the horizon line and the time the Sun's upper edge appears. Then do it again within a few days of the June solstice from the same spot. The interval is civil dawn, and the calculator below predicts both lengths from your latitude and the date alone, with no fitting and no free parameter. If you are north of about 48.6°, the more dramatic version is available to you: on the June nights the sky never goes properly dark at all, and the almanac will print a dash where the end of astronomical twilight should be.

Independent variable
**What you change:** the **date**, and therefore the Sun's declination. Two dates two months apart are enough at mid-latitudes; equinox against solstice is the sharpest pair. Changing your **latitude** instead works just as well if you are travelling.

Dependent variable
**What you measure:** the **number of minutes** between first light and sunrise. A clock and your own eyes. No angles, no instruments, no trust in anyone else's data.

**Hold constant:** the site, the direction you face, and the criterion you use for "first light" — pick one and stick to it, because the criterion is worth several minutes and the effect you are after is tens of minutes. Clear sky both times; cloud on one morning and not the other ruins the comparison.
**Kit:** a phone. If you want the version with a number in it rather than a judgement call, point the phone's camera east on a tripod, shoot at fixed exposure every thirty seconds, and read the frame brightness afterwards — the curve is the twilight curve and its knee is unmistakable.
**The tell:** at 45° north the interval grows by roughly a quarter between March and June; at the equator it barely moves at all; north of 48.6° astronomical night vanishes outright in June. A flat Sun that dims by distance has no mechanism that makes the fade take longer in one month than another at the same place.

**Civil** 43 min · **Nautical** 61 min · **Astronomical** never ends
Total sunset → −18°: **never ends**. Sun's altitude at local midnight: **−17.70°**.
Astronomical night vanishes above latitude 48.6° · nautical above 54.6° · civil above 60.6°.

**Verdict rule.** At 48.86° with the Sun at 23.44°, the globe says there is **no astronomical night at all** on this date, because the Sun bottoms out at −17.70° and never reaches −18°. Look up the almanac for these coordinates: it should print a dash. If it prints a time — if the sky does go fully dark here on this date — the geometry on this tab is wrong and you should say so.

## How high the shadow stands — and why it climbs faster than the Sun sinks [evidence: prediction]

The table above gives the shadow's ceiling *over your head*, in kilometres. What you actually look at in the east is an angle, and the two are not the same number. Getting from one to the other takes no new physics, only the same formula applied twice. A patch of air lying angular distance ψ from you *towards* the antisolar point has the Sun that much further below its own horizon, at depression θ + ψ, so it is lit only if it clears its own ceiling: R(sec(θ + ψ) − 1). Follow a line of sight leaving your eye at altitude *a*, ask where along it that condition is first met, and the trigonometry collapses to one line.

> **Sunlit at distance s along a sight line at altitude a, when the Sun is θ below the horizon:** s · sin(a − θ) > R (1 − cos θ). **Two consequences arrive with no free parameter whatever.** First, if a ≤ θ the left-hand side is never positive, however far you look — so **the top of the shadow always stands higher than the antisolar point**, at every depression, above any atmosphere, on any sphere. It cannot be at or below it. Second, the whole sky goes shadowed once the ceiling rises past the layer that does the scattering, that is at cos θ_z = 1 / (1 + H/R) — which is the ceiling formula read backwards.

Only one quantity there has to be supplied from outside: H, the effective top of the scattering layer, which is not a sharp surface — air density falls off smoothly, so the shadow's edge is a gradient rather than a line. Rather than pick a value, the table prints three and lets you see how little the interesting behaviour depends on the choice. What does not depend on it at all is the shape: the shadow rises *faster* than the Sun sinks, the ratio grows without bound, and the sky is fully shadowed at a depression of a very few degrees.

**Altitude of the top of the dark segment in the east, computed from s · sin(a − θ) = R(1 − cos θ) with R = 6,371 km — three values of the scattering-layer top H, none of them fitted to anything**

| Sun's depression θ | H = 10 km | H = 15 km | H = 20 km | Rise ratio at H = 15 km |
| --- | --- | --- | --- | --- |
| 0.5° | **0.55°** | **0.54°** | **0.53°** | × 1.07 |
| 1.0° | **1.23°** | **1.17°** | **1.14°** | × 1.17 |
| 1.5° | **2.16°** | **1.96°** | **1.87°** | × 1.31 |
| 2.0° | **3.65°** | **3.03°** | **2.79°** | × 1.52 |
| 2.5° | **6.88°** | **4.68°** | **4.03°** | × 1.87 |
| 3.0° | **23.25°** | **7.80°** | **5.91°** | × 2.60 |
| 3.5° | *whole sky* | **17.27°** | **9.34°** | × 4.93 |
| 4.0° | *whole sky* | *whole sky* | **18.32°** | — |

*Figure caption:* Depression at which the shadow reaches the zenith and the dark segment covers the sky: H = 10 km → **θ_z = 3.21°** · H = 15 km → **θ_z = 3.93°** · H = 20 km → **θ_z = 4.53°**. Note what that means for an observer: the **angle** is the same everywhere on Earth, in every season — but the **clock time** it takes to get there is not, and runs from about thirteen minutes near the equator to three quarters of an hour at high latitude in spring.

Experiment 1f-b · time the Earth's own shadow

Turn your back on the sunset and photograph the east — a phone, a wall to rest it on, twenty minutes

Ten minutes after sunset there is a dark blue-grey band along the eastern horizon with a pink one above it: the planet's own shadow, cast on its own air, with the Belt of Venus along its top edge.[6] Rest a phone on a wall, frame the eastern horizon with something vertical of known height in shot — a lamp post, a door frame, a distant mast — and shoot one fixed-exposure frame every minute from sunset until the band has climbed out of frame. Afterwards, convert the band's top edge into an angle using the object of known height and its distance. You will have the shadow's altitude against the clock, and the clock converts to the Sun's depression.

Independent variable
**What you change:** the **time since sunset**, and therefore the Sun's depression θ, which an almanac gives you for your position to the minute.[1] Nothing else moves. If you can repeat it from a very different latitude, or six months later, do — that is where the sharper version lives.

Dependent variable
**What you measure:** the **altitude of the shadow's upper edge**, in degrees, frame by frame. One angle per photograph, read off against a foreground object whose height and distance you know.

**Hold constant:** the camera position, the focal length and the exposure — an automatic exposure will chase the fading sky and move the very edge you are trying to follow. Pick one criterion for the top edge, the colour boundary rather than the brightness one, and keep it. Face the antisolar azimuth, not simply east: ten minutes after sunset the two differ by several degrees.
**Kit:** a phone, a wall, and a foreground object. If you want the angle without trigonometry, hold a ruler at arm's length — a centimetre at 57 cm subtends one degree, near enough for a two-degree effect.
**The tells, stated in advance:** the shadow's top is **never below the antisolar point**, at any moment, which the derivation above gives with no adjustable quantity; it **accelerates**, the ratio in the last column growing from about 1.1 to beyond 5 within twenty minutes; and the sky is fully shadowed at a **depression of three to four and a half degrees** — the same angle in Quito and in Reykjavík, though one takes a quarter of the time the other does.

**What this experiment cannot do, said plainly.** It does not measure R. The single free quantity H is degenerate with the radius here — a bigger planet with a shallower atmosphere gives a similar curve — so anyone claiming a radius from a sunset photograph is claiming too much, and this page will not. Nor is the top edge sharp: air thins gradually, so two careful observers will disagree by something like half a degree, which is a few kilometres of H. What the experiment does settle is *shape*, and shape is what the two models disagree about.
**The verdict rule, symmetric.** The sphere fails if the shadow's top is ever measured at or below the antisolar point, if it climbs at a constant ratio rather than an accelerating one, or if the depression at which it reaches the zenith turns out to depend on where you stand or on the season. The flat model fails if a boundary it must explain as distance and haze instead behaves as a shadow does: an arc curved about the antisolar point, rising at an accelerating angular rate, closing over the sky at one fixed solar depression that is the same for every observer on the planet while the clock time is not.

Caveats this page owes you. Four, and the first is the one that matters. The heights in the first table are the *geometric* ceiling of the shadow; they are not a brightness model. Real twilight brightness involves multiple scattering, ozone absorption in the Chappuis band and aerosol loading, and the classical treatments are Hulburt's and Rozenberg's, not a one-line formula.[3][4][5] Second, the durations here use the mean Sun and a spherical Earth, with sunrise at the conventional −0°50′; published almanacs will differ from them by a minute or two, and a mountain horizon by rather more. Third, the measured 10^8 day-to-night ratio is downwelling irradiance at one dark rural site, and the same study measures a factor of 100 between that site and a city — the number is a scale, not a constant. Fourth, the anti-twilight figure is a schematic, and its colours are drawn rather than computed. None of the four moves an argument that turns on eight orders of magnitude against fewer than two, and on a stage length that goes to infinity at a latitude you can point to on a map.

The through-line. The dip tab measures how far the horizon falls below level; this tab measures how far the *shadow* rises above it, which is the same geometry read upwards instead of downwards, and it arrives at the same R. Then the duration section drops R entirely and constrains the shape on its own, the way the magnetism tab does. And the inverse-square section is the page's method in miniature: take the flat model's own physics, divide out its free parameters until nothing adjustable is left, and see what it is then obliged to predict. Here it is obliged to predict that the night is seventy times darker than the day. Go outside and see whether it is.

**See also**[Sun](/ai/sun.md)[Refraction](/ai/ref.md)[Dip](/ai/dip.md)[Azimuth](/ai/azim.md)

## Sources for this tab

1. [1] [United States Naval Observatory, Astronomical Applications Department, *Rise, Set, and Twilight Definitions*](https://aa.usno.navy.mil/faq/RST_defs) — the definitions used throughout this tab, in the words of the institution that publishes the tables: civil, nautical and astronomical twilight at 6°, 12° and 18° of geometric depression of the Sun's centre, with the caveat that what you can actually see also depends on the weather.
2. [2] [M. Spitschan, G. K. Aguirre, D. H. Brainard & A. M. Sweeney, "Variation of outdoor illumination as a function of solar elevation and light pollution", *Scientific Reports* 6, 26756 (2016)](https://doi.org/10.1038/srep26756) — open access, with the spectra and the analysis code published: downwelling irradiance measured minute by minute from full day to full night at a dark-sky park and in a city, and the source of the 10^8 day-to-night figure, which the authors had to cover with two different spectrometers.
3. [3] [E. O. Hulburt, "Explanation of the brightness and color of the sky, particularly the twilight sky", *Journal of the Optical Society of America* 43, 113 (1953)](https://doi.org/10.1364/JOSA.43.000113) — the classical calculation of twilight brightness from the illuminated shell above the observer, including the ozone absorption that makes the twilight sky blue rather than red.
4. [4] G. V. Rozenberg, *Twilight: A Study in Atmospheric Optics* (Plenum Press, New York, 1966), translated from the Russian — the monograph on the subject: the shadow geometry, the twilight rays, the purple light and the way the brightness curve is read as a sounding of the upper atmosphere. Cited without a link because no stable open copy exists; the full reference is given so it can be found in a library.
5. [5] [R. L. Lee & J. Hernández-Andrés, "Measuring and modeling twilight's purple light", *Applied Optics* 42, 445–457 (2003)](https://doi.org/10.1364/AO.42.000445) — measured twilight colours and radiances against a multiple-scattering model; the reason this page's note insists that twilight brightness is not a one-line formula.
6. [6] D. K. Lynch & W. C. Livingston, *Color and Light in Nature*, 2nd edition (Cambridge University Press, 2001), chapter 3 — the standard descriptive reference for the anti-twilight arch, the Belt of Venus and the shadow's rise rate, with photographs. Unlinked for the same reason as [4].
7. [7] [NASA Space Science Data Coordinated Archive, *Sun Fact Sheet*](https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html) — the Sun's apparent diameter as seen from Earth, 31.6′ to 32.7′ over the year, which is the measurement the flat model's brightness–size relation has to survive.
8. [8] [United States Naval Observatory, *Table of Sunrise/Sunset, Moonrise/Moonset, or Twilight Times for an Entire Year*](https://aa.usno.navy.mil/data/RS_OneYear) — where to get the printed answer for your own coordinates, to check the calculator on this page against. Ask for twilight rather than sunrise, and ask for a latitude above 48.6° in June to see the dashes.
9. [9] [NOAA Global Monitoring Laboratory, *Solar Calculator*](https://gml.noaa.gov/grad/solcalc/) — an independent implementation of the same solar position formulae, from a different institution in a different country's service, for anyone who would rather not trust either this page or the Navy.
10. [10] D. R. E. Brown, *Natural Illumination Charts*, Report No. 374-1, Research and Development Project NS 714-100, Bureau of Ships, Department of the Navy (September 1952) — the measurements from which the standard illuminance-against-solar-elevation curves descend, still cited in the current literature. Unlinked: the scanned report is not stably hosted, and the retypings that circulate have a documented figure-labelling error.
11. [11] [K. Bikos, *Fact Check: 99% of the World's Population Gets Sunlight at the Same Moment on July 8* (timeanddate.com)](https://www.timeanddate.com/news/astronomy/99-percent-sunlight-july-8) — the fact-check itself, with the method stated: their own solar data crossed with the 2022 gridded population estimates from the Center for International Earth Science Information Network at Columbia University. It is also the source of the honest qualification quoted above, that roughly 3% of the total is in astronomical twilight and would call it night.
12. [12] [EarthSky, *99% of the world's population in sunlight July 8 … and other dates*](https://earthsky.org/earth/99-percent-worlds-population-receive-sunlight/) — the follow-up showing that the effect is not a one-day curiosity: the share stays above 98% for roughly two months around the June solstice, and the daily maximum falls between 11:00 and 11:03 UTC on almost every one of the top thirty days.

## Further reading

Not cited above, and no claim on this tab rests on it — listed because it is what you would read next, or because it lets you redo the measurement on data this page did not choose.

- **C. F. Bohren & E. E. Clothiaux, *Fundamentals of Atmospheric Radiation* (Wiley-VCH, 2006).** The scattering physics behind twilight colour and brightness, at the level needed to check the claims in this tab rather than accept them.
