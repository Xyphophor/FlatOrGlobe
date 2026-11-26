# They swapped the theodolite for a clock. That part works.

> Tab "Theodolite" of *Flat plane or Globe?*. Web page: /#tab-ct. Generated from the rendered page: same text, same computed numbers and sources; drawings are replaced by their captions and descriptions, formulas are TeX. Licence: content and data CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), Xyphophor (https://x.com/Xyphophor); source code MIT; third-party data keep the licence of their source, cited in each tab.

*Celestial theodolite · someone else's experiment, taken seriously*

*Figure caption:* The instant that makes the measurement. The observer, the crest and the star lie on **one straight line**, so the star's altitude at that second is also the elevation angle of the crest. Nothing is measured with an instrument: the clock says *when*, and an almanac turns the when into an angle. The two angles marked at the ends of that one line are what the method turns on — on a plane they are equal. Elevation enlarged.

A flat-earth project called the **Celestial Theodolite** films a star being occulted by a mountain. The occultation puts the observer, the crest and the star on **one straight line**, and the claim is that on a plane, where every horizontal is parallel to every other, that one line must make the *same* angle at both ends. The clock supplies the angle: a star's altitude at a stated second is known to arcseconds. The published target list runs from 8.8 to 130.7 km and pays a bounty for recordings[1]; the method is argued in a recorded debate[2] and, as of the last check, in no methodology paper[3].

> **The idea is a good one, and this page has a rule about saying so.** Every reciprocal-angle test here levels an instrument with a bubble, and a bubble is gravity — the very thing under dispute. A star has no bubble. At 45° a star setting due west drops **10.6″ every second**, so a GPS-synchronised phone reads an angle to better than 0.2′. That is an order of magnitude finer than the difference between the two models over these distances. *The timing is not the weak part of this experiment.*

## 1 · What the clock buys

$$\frac{d\alpha}{dt} = 15.041″\,\mathrm{s}^{-1} \times \cos\varphi \times \sin A$$

How fast a star loses altitude. φ is your latitude, A is the star's azimuth counted from north, and the rate is fastest due east and due west and zero due north and due south. The sidereal rate 15.041° per hour is 15.041 arcseconds per second of clock[5], which is the coincidence that makes this method cheap: one second of clock error is a tenth of the effect at the shortest range on that list, and under a hundredth of it at the longest.

**Seconds of clock worth one arcminute of altitude. Read it as the timing precision you need: anywhere below about 60° of latitude, and on a star setting anywhere near west, a clock good to one second is already ten times better than the angle in dispute.**

| latitude φ | star due E or W | star 45° off E–W | clock worth 1′, due E or W |
| --- | --- | --- | --- |
| 0° | 15.04″/s | 10.64″/s | 4.0 s |
| 20° | 14.13″/s | 9.99″/s | 4.2 s |
| 45° | 10.64″/s | 7.52″/s | 5.6 s |
| 60° | 7.52″/s | 5.32″/s | 8.0 s |
| 70° | 5.14″/s | 3.64″/s | 11.7 s |

## 2 · What the two models predict [evidence: prediction]

Take the two ends of that line — the observer, and the crest the star is grazing — and ask each for the star's altitude at the same second. On a plane the two horizontals are parallel, so the difference is **0.000°, with no free parameter at all**. On a globe the two local verticals diverge by the central angle γ, so the same straight line makes two different angles, and the difference is γ. It is the surveying tab's reciprocal-angle test from the other direction: a prediction of exactly zero against one that grows with distance. A federal survey crew observed the same quantity over 70 to 93 km lines in 1977, though the report is a scan whose readings could not be recovered here[9].

$$\theta_{2} - \theta_{1} = 0 \quad \text{(plane, exactly)}$$
$$\theta_{2} - \theta_{1} = \gamma = s/R \quad \text{(globe)}$$

θ₁ is the star's altitude above the observer's horizontal, θ₂ its altitude above the crest's horizontal at the same instant, s the distance between them and R the radius. Neither height appears: the two heights cancel out of the difference, which is what makes this worth measuring. With refraction the globe's figure becomes γ(1 − k)[7]; the plane's stays exactly zero, because a plane has nothing to correct.

**Distances are the ones published on the project's target list[1]; γ is computed here, and the last column says how many seconds of star motion that angle is worth at latitude 45° due west. At 50.8 km γ is 27.4′ — the same 0°27′ the project's spreadsheet prints as the globe's slant, so this is not a disputed number. There is no measured column because no recording has been checked on this page, and a column headed *measured* stays empty until it can be filled from something published.**

| peak | s | plane | globe, γ = s/R | γ(1 − k) | worth, in clock | measured |
| --- | --- | --- | --- | --- | --- | --- |
| Hound's Tooth | 8.8 km | 0.00′ (0.000°) | 4.75′ (0.079°) | 4.13′ (0.069°) | 27 s | — |
| Varley SE2, Squamish | 16.7 km | 0.00′ (0.000°) | 9.03′ (0.150°) | 7.85′ (0.131°) | 51 s | — |
| Blodgett Peak | 35.9 km | 0.00′ (0.000°) | 19.38′ (0.323°) | 16.86′ (0.281°) | 109 s | — |
| Cheyenne Mountain | 42.6 km | 0.00′ (0.000°) | 23.00′ (0.383°) | 20.01′ (0.334°) | 130 s | — |
| Pike's Peak | 50.8 km | 0.00′ (0.000°) | 27.40′ (0.457°) | 23.84′ (0.397°) | 155 s | — |
| North Peak | 130.7 km | 0.00′ (0.000°) | 70.52′ (1.175°) | 61.36′ (1.023°) | 398 s | — |

### How the clock column is worked out

Three lines of arithmetic, so the table above can be recomputed by hand for any peak and any latitude

Take γ from the column beside it, in arcminutes, and multiply by 60 to get arcseconds. Divide by the rate at which the star is losing altitude, 15.041 cos φ sin A arcseconds per second of clock — 10.635 at latitude 45° on a star setting due west, which is what the column assumes. The result is how much clock time that angle is worth: the size of the timing error that would be needed to fake it. Nothing else enters, and in particular no height, since the heights cancel out of a difference between two vantages.

## 3 · Where the execution decides the result

**The star is occulted by the skyline, not by the summit.** It comes down at an angle and vanishes wherever its path crosses the silhouette — a point on the ridge with its own height and distance. The instructions themselves say to aim for the summit where possible and to send daytime reference photographs[1]. In numbers: at 50 km, a crest height wrong by 30 m moves the angle by 2.1′, a thirteenth of the 27′ at stake — not fatal, but the crest must be identified before the arithmetic starts, not after.

**The refraction correction is switched off, and that is presented as the answer to refraction.** The method's own diagrams specify Stellarium with the refraction correction function *off at both vantages*[2]. But a checkbox in a program does not reach the air. Turning the correction off does not remove the bending; it removes it from the number, and leaves the observation uncorrected rather than unaffected. At the altitude in the worked case, 2°31′, astronomical refraction is 15.1′[6] — which is the 15 arcminutes printed in the same spreadsheet, so the size of the thing being switched off is not in dispute either.

**A switch with two positions and two places to apply it is a free parameter.** Off at both ends, off at one, on at one: those are four settings, and they move the answer by up to 15′ against a disagreement of 27′. This page allows itself exactly one refraction coefficient, announced in advance, applied to the globe only, with the uncorrected value printed beside the corrected one — and the reason for that rule is visible here. Whichever setting is chosen, it has to be chosen *before* the two angles are compared, and stated.

> **And refraction lifts a distant object; it does not lower it.** A ray through the lower atmosphere bends downward, toward the surface, so a summit is seen *higher* than bare geometry puts it and less of it is hidden — that is exactly what R_eff = R/(1 − k) means, an effective radius *larger* than the real one, curvature partly cancelled[7]. Any argument that reads the refraction literature as showing that summits sit *lower* has the sign backwards, and it matters: with the sign the right way round, refraction is a term that helps the flat model's numbers look closer, not a defect of the globe.

**And the second vantage is often not there at all.** The call for recordings asks for a single video from a single place[1]. With one end only, there is no pair of angles to difference, and the zero the plane predicts has nothing to be tested against: what remains is one measured altitude compared with a number the same software computed, which is where the next section starts.

## 4 · The simplest objection, and it is built from the method's own instrument

*Figure caption:* **Figure 1 — the rule.** One line of sight, three stations lying on it. On a plane every horizontal is parallel to every other, so the one line makes the same angle a at each of them.

*Figure caption:* **Figure 2 — the same rule, one direction later.** Same construction, one change: the line of sight is horizontal. That is the fixed point of the sky as an observer on the equator sees it, on the horizon, at 0°.

> The method carries an angle from one station to the next, and figure 1 is that rule. So carry it, in a direction whose angle is already known somewhere: the **fixed point of the sky**, which an observer on the equator sees at 0°. A direction horizontal at one station is horizontal at the next, the horizontals being parallel; apply it again and again — figure 2 — and the fixed point sits at 0° everywhere on Earth. **From Paris it is at 48.9°**, and Polaris marks it to 0.6°. No instrument, no second observer, no clock, no software — and the 2,930′ to explain is 86 times the biggest nuisance term the horizon has to offer.

**The two ways out, and there is no third: the instrument that supplies the measured angle assumes the very thing the conclusion has to deny.**

| If they keep | Then they lose |
| --- | --- |
| The distant sky of the ephemeris software — stars far enough away that their rays arrive parallel, which is what lets an altitude be tabulated at all. | The premise that horizontals are parallel, refuted by any observation of the pole from a mid-latitude. |
| A near sky — a dome a few thousand kilometres up, whose rays are not parallel, so the same direction can make different angles in different places. | The software, which computes altitudes on a globe with the stars at infinity. Without it there is no measured angle at all, and the method has nothing left to read. |

> **What this objection does not do.** It does not show that any recording is wrong, or that a timing is sloppy. It shows that the number the method calls *the measured angle* is defined by the globe, so a result cannot be read as evidence for a plane until someone publishes a flat star ephemeris — a dome height and a ground track per star — and recomputes the same occultations in it. That would be a real test, and this page would have to take it seriously. Nobody has published one.

## 5 · Which model fits the published readings [evidence: check — Where the radius enters: star altitudes from a planetarium program at positions on the globe.]

One number is measured: the second at which the star is cut by the crest. Everything else is computed. From that second an almanac gives the star's altitude; from the published coordinates, trigonometry gives the crest's elevation angle — **a different one for each model**. Subtract, and the leftover is the residual. This answers the obvious worry that the comparison must be circular: the star's altitude comes from the clock and does not know which model you hold, while the two crest angles differ by s/2R, which is 35′ at 131 km. The star altitude cannot sit on both.

$$\Delta = \theta_{\text{star}}(T) - \theta_{\text{crest}}$$
$$\theta_{\text{flat}} = \arctan\left(\frac{H - h}{s}\right)$$
$$\theta_{\text{globe}} = \arctan\left(\frac{H - h}{s}\right) - \frac{s}{2R}$$
$$\theta_{\text{flat}} - \theta_{\text{globe}} = \frac{s}{2R} = \frac{\gamma}{2}$$

**Why the half, when section 2 used the whole γ.** The chord joining observer and crest makes an angle γ/2 with the local horizontal at *each* end — that is the angle between a chord and the tangent. One end taken alone therefore sees half the central angle, and the pair sees all of it: γ/2 separates the two *models* at one vantage, γ separates the two *vantages* along one line. The calculator prints both under those names, *Central Angle (γ)* and *θGeo,Terrestrial,Drop (γ/2)*, in a ratio of exactly two[8]. H and h are the crest and observer heights, s the ground distance, R the radius, T the occultation second; θ_star(T) is the almanac's altitude, geometric when the software's refraction correction is off and apparent when it is on, and the crest angle must be taken the same way.

**One worked case from the project's published calculator, the North Peak sheet[8]. The heights, the distance and the four star altitudes are read from it; every angle below them is recomputed here and agrees with its cells to the arcsecond. The last three rows are the two-vantage test of section 2, run on those numbers.**

| Pikes Peak, 39 Aquarii, 2025-01-27 18:43:07 | value |
| --- | --- |
| crest and observer heights | 4300 m, 2073 m |
| ground distance s | 50.55 km |
| crest angle, plane — arctan(Δh/s) | 2.5225° |
| crest angle, globe — minus s/2R | 2.2952° |
| star altitude at the observer, geometric | 2.1024° |
| star altitude at the observer, apparent | 2.3256° |
| star altitude at the crest, geometric | 2.5562° |
| **difference between the two ends, measured** | **0.4538°** |
| **predicted: globe γ = s/R · plane 0** | **0.4546°** · **0.0000°** |
| residual on that difference | **−0.05′** · **+27.23′** |
| **their comparison: crest star − flat crest angle** | **+2.02′** |
| … which is the flat residual, plus the measured γ | −25.21′ plus +27.23′ |

*Figure caption:* The same case asked four ways: each model, with and without the almanac's refraction correction, and in each the crest angle reduced the same way as the star altitude. The bars are absolute residuals, so shorter is better, and the arithmetic is entirely from the sheet — only the subtraction is done here.

> **What the dataset returns.** Two questions can be put to it. The first compares the crest angle, worked out from maps and heights, against the almanac's star altitude — and that is the one that carries weight, because only one of its two terms comes from the software. The second is the two-vantage test the method itself advertises, where the plane predicts exactly zero. The figures below run both over every case, and the table under them gives the numbers. **The caveat travels with the result:** those star altitudes are Stellarium's, computed on a globe, so the second question is close to a check on the transcription rather than a measurement.

> **Why the sheet reports the plane as the closer of the two — worth following carefully.** The comparison it prints sets the star's altitude *at the crest* beside the flat crest angle *seen from the observer*: two different vantages. The gap comes out small — on the North Peak case the +13′35″ the sheet shows. But that subtraction contains the plane's residual at one vantage, **−56.5′**, plus the measured difference between the vantages, **+70.1′** — and that second term is γ, the quantity the flat model says is exactly zero. **The plane only comes close because it is credited with the globe's own measured curvature.** Hold the flat premise honestly — the star at the same altitude from both ends — and the flat residual is its worst score of the four.

*Figure caption:* Both studies over every case on file: the one-vantage residual at the top, the two-vantage residual below, each split between the models and each with refraction applied at both ends. The dots beyond the whiskers matter — they are the cases where both models miss together, which is the signature of a misidentified crest rather than of a curved or a flat Earth.

- Closest to their measured second**globe, refraction on** · median 2.08′next: plane, refraction on · 13.02′46 cases

**The same four series as numbers. Residuals are absolute, so smaller is closer to what was measured, and the median is the column to read first — one badly identified crest moves a mean and leaves a median alone.**

| series | median | mean | quartiles | beyond |
| --- | --- | --- | --- | --- |
| one end · plane | **13.02′** | 17.42′ | 5.32–18.27′ | 1 |
| one end · globe | **2.08′** | 8.08′ | 0.77–3.69′ | 6 |
| two ends · plane | **22.50′** | 20.63′ | 3.68–27.26′ | 3 |
| two ends · globe | **0.03′** | 0.55′ | 0.00–0.40′ | 7 |

Which rows are in: every row of the *data_table* sheet carrying the seven numbers, less four kinds set aside **before the residuals were looked at** — rows the sheet labels *Test*, rows where the occulting body is the Moon, the four rows aimed at aircraft, and one row whose apparent altitude is below its true altitude, which cannot happen. Nothing else is dropped. Cases where **both** models miss stay in: at 1 and 7 km the two predictions are indistinguishable, so a joint miss is a misidentified crest, not a verdict, and removing them would flatter both. Adding the four aircraft rows would not change the direction — the globe wins all four, by more.

> **The short version.** Of the four ways of putting the question to the dataset, the globe with refraction at both ends sits closest to the recorded second, and not marginally; no arrangement of the flat model gets nearer. It comes with the limit that has followed this section from the start: the star altitudes come from software that computes on a globe, so this is the method's arithmetic checked against itself, not an independent measurement. **The independent version is old:** Canigou has been photographed from Allauch, 263 km off, cut out against the setting Sun since 1808, and the hidden-height tab shows what each model puts on the disc — a black mass taller than the Sun, or a notch an eighth of its width.

## 6 · The radius, recovered from the same data [evidence: check — Where the radius enters: crest angles from distances in km computed from coordinates and map heights.]

Every case can be run backwards. Instead of asking whether a radius of 6,371 km fits, solve for the radius each observation implies and see where they land. This is the page's unifying claim applied to flat-earth data: one R has to satisfy everything, and here it is being asked to emerge from a flat-earth dataset. **Only cases beyond 20 km are used**, and the threshold is geometric rather than chosen after the fact: below it the two models differ by under 5′, the denominator is the size of the crest error, and the division returns noise or a negative radius.

$$R_{\gamma} = \frac{s}{\theta_{\text{crest}} - \theta_{\text{obs}}}$$
$$R_{\text{raw}} = \frac{s}{2\left(G - \theta_{\text{obs}}\right)}$$
$$R_{\text{red}} = \frac{(1 - k)\,s}{2\left(G - \theta_{\text{obs,app}}\right)}$$

**Every symbol is a row of the case table above.** s is *ground distance s*; Δh is the difference of the two heights on the *crest and observer heights* row; G is *crest angle, plane — arctan(Δh/s)*, the only quantity here that comes from maps rather than from software. θ_obs is *star altitude at the observer, geometric* and θ_obs,app the *apparent* row beneath it; θ_crest is *star altitude at the crest*. Angles go in radians, so R comes out in the units of s. k is the terrestrial refraction coefficient implied by the sheet, 0.148 — that correction is written s/1,500,000 in degrees[8], which is that k and not the 0.13 the rest of this page uses. The three lines produce the three rows of the table below, in the same order.

- Radius from their data, reduced consistently**6380 km** · median of 28accepted value 6371 km

*Figure caption:* Three reductions, three answers. Same box plot as before — box between the quartiles, bar the median, whiskers to 1.5 interquartile ranges, dots past them — with the accepted radius drawn as a vertical line so the deviation is the distance to it.

**The same three as numbers, with the median's departure from 6,371 km in the last column.**

| reduction | cases | median R | quartiles | off 6371 |
| --- | --- | --- | --- | --- |
| γ · two ends | 28 | **6371 km** | 6353–6390 km | 0.0 % |
| one end · raw | 28 | **2942 km** | 2417–3457 km | -53.8 % |
| one end · reduced | 28 | **6380 km** | 6043–7281 km | 0.1 % |

> **Read the three lines in order; only the third means anything.** The first solves R from γ, the difference of two altitudes the software computed on a globe of 6,371 km — it lands on 6,371 by construction and only checks the transcription. The second uses the crest angle from maps and heights, genuinely independent of the software, but pairs it with a geometric star altitude when the occultation happened in the *apparent* direction; that mismatch, the method's default, returns a radius near 3,000 km — **not a plane and not the Earth, but a globe of the wrong size**. The third fixes the mismatch and nothing else. It is the one to argue with.

## 7 · What this page is doing about it

Criticising somebody else's observation is cheap unless you make one. The **observation** tab attempts the same experiment, pre-registered here, with three changes. The Sun stands in for the star, so the frame **carries its own angular scale** — the disc is 32.4′ wide — and no software turns a time into an angle. There are **two ridges**: a near crest at 16 km where the models barely differ, a control on the method, and a far one at 54 km where they differ in sign. And the prediction sits at **0°**, eye level, the one angle you can check without knowing where level is: the far ridge is either above the Sun's centre or below it, and the photograph says which.

The shot can be placed on these axes before it is taken, and that is worth doing because it uses **a different instrument**: a solar disc as the ruler, no clock, no star altitude read out of software. Beyond 20 km the plane's miss tracks (1 − k)s/2R — the curvature term itself, not a fitted line — with a correlation of 0.97, while the globe's misses stay flat with no trend at all. So the two boxes below are not just a summary: they are a prediction. The 24 November geometry, 208 m of height over 54.1 km, says where one more point has to fall on each of them, and arithmetic alone fixes it

- Flat residual against the curvature termr = 0.971 over 28 casesslope 1.28 against a predicted 1.00the 24 November shot must land at 12.4′

*Figure caption:* The same two boxes as section 6, restricted to the 28 cases beyond 20 km, with the 24 November shot marked on each. The mark on the orange box is the 12.4′ the plane will have to be out by; the mark on the teal box is the zero the globe will have to show. **If the plane is right instead, the two marks swap places** — that is the whole prediction, and the photograph puts the point on one row or the other.

*[Figure: The Sun sinking behind the ridge on 24 November 2026, through a solar filter, fixed camera]*

*Figure caption:* What a dense solar filter will show, minute by minute, from the viewpoint on 24 November — the disc, and the terrain only where it cuts into it, at true angular scale. The blue band is the extra ridge the plane requires; the black is the globe's silhouette. The profile is sampled every 0.1° of azimuth, which is the resolution of the terrain read and not a smoothing, so the facets are the data. Each frame is centred on the disc: it is the ridge that climbs through it.

> **Stated before the shot, which is the whole point.** Le Grand Mourre, 54.1 km away and 208 m taller than the viewpoint, must sit **13.2′ above** eye level on a plane, **1.4′ below** on a sphere with straight rays, and **0.5′ above** with k = 0.13. The spread is 12.7′, 39 % of the solar disc, and the Sun crosses that window on **24 November 2026 between 16:54:48 and 16:58:17 CET** (standard atmosphere at the viewpoint, 826 hPa; see the observation tab). Those numbers are computed, not observed: at the time of writing **no photograph exists**, and if it comes out against the globe this tab will say so — a verdict rule announced in advance binds whoever announced it.

**A first shot, 10 January 2026.** Before that date the same method was tried from the same viewpoint on a winter sunset, filmed by a camera aimed in advance with a network clock photographed beside its screen. At 17:11:06 the Sun's lower left edge touched the shoulder of the ridge, where the globe puts it at 17:11:05; the plane, with the same Sun over its higher ridge, puts it at 17:10:38, the Sun already three quarters hidden. Used like Eratosthenes' shadow, that single contact gives the Earth's radius: about 5,900 km, 5,000 to 6,500 km across the uncertainties. The last light came about 30 s before the globe's prediction, a gap stated rather than tuned away. The video, the photographs and the calculation are in the [observation tab](/ai/obs.md).

[**Experiment 11 · time a star onto a ridge** — to do yourself, with every experiment of the site, in “What would refute each model” →](/ai/falsify.md#xp-ct-11)

**See also**[Elevation angles](/ai/elev.md)[Refraction](/ai/ref.md)[Star trails](/ai/star.md)[Cel. nav.](/ai/cnav.md)[Surveying](/ai/surv.md)[Observation](/ai/obs.md)

## Sources for this tab

1. [1] [Space Audits, *Celestial Theodolite* — measurement reward program](https://publish.obsidian.md/spaceaudits/Celestial_Theodolite/91_Celestial_Bounty), the project's own published notes. The target list, the distances from 8.8 to 130.7 km, the instruction to aim for the summit and to supply daytime reference photographs, and the single-station protocol are read from that page. Read on 28 August 2026; a published page can change, and this one is a working vault.
2. [2] [Debate: Space Audits vs Astronomy Live, *The Celestial Theodolite*](https://www.youtube.com/watch?v=e21-tkyLA7I), part 1, February 2026 — the method argued by its author against an astronomer, with the second part and a folder of supporting links given in its description. Cited as the primary discussion, not as a source for any number on this tab.
3. [3] [Journal of Geocentric Cosmology, "Celestial Theodolite"](https://journalofgeocentriccosmology.org/2025/03/22/celestial-theodolite/), 22 March 2025 — a sympathetic write-up that lists ten videos on the method and states that it could find no document setting out the methodology. That is why the protocol above is quoted from the reward page rather than from a paper.
4. [4] [U.S. Naval Observatory, altitude and azimuth service](https://aa.usno.navy.mil/data/AltAz) — an independent altitude for any star at any second, so the angle at the heart of this method can be checked against something other than one piece of software.
5. [5] [IERS](https://www.iers.org/) — the sidereal day, from which 15.041° per hour, and therefore 15.041″ per second of clock, follows.
6. [6] Astronomical refraction. Þ. Sæmundsson, *Sky & Telescope* 72 (1986), 1.02·cot(h + 10.3/(h + 5.11)) for a **true** altitude h in degrees; it gives 5.4′ at 10°, 9.7′ at 5°, 16.9′ at 2° and about 29′ at the horizon. Those are the numbers quoted above, and they are the same formula the observation tab uses.
7. [7] [Hirt et al. (2010), *J. Geophys. Res.* — terrestrial refraction coefficient](https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2010JD014067) — the k ≈ 0.13 used for R_eff here, the single value used everywhere on this page for a sight line through the lower atmosphere.
8. [8] [Celestial Theodolite Calculator v9.1.1](https://docs.google.com/spreadsheets/d/1Bwxw2PmgsGzLaR86Q_lG-zV1uiNgyzcijnzMsHeC_cw/edit?usp=sharing), the project's own published workbook. Its *data_table* sheet holds one row per observation with the heights, the distance and the four star altitudes; those rows are the whole of the input used here. The derived cells of the North Peak sheet — the flat angle, the drop, the central angle, the terrestrial refraction — were recomputed independently before anything was published from them, and they reproduce. Read on 28 August 2026; a working sheet can change.
9. [9] The same measurement, made on the ground. NOAA Technical Report [NOS 74 NGS 9](https://geodesy.noaa.gov/PUBS_LIB/TRNOS74NGS9.pdf) (1978) publishes the McDonald Observatory radial scheme: seven lines of 70 to 92.8 km, distances by EDM, with *simultaneous* reciprocal zenith distances at both ends — whose sum is γ. **No numbers are read from the report itself here:** the file is a scan with no machine-readable text. The zenith angles from that survey are transcribed by Walter Bislin, and the surveying tab now works all seven lines through. The operational account is Charlie Glover's recollection, published by the surveyor Jesse Kozlowski at [Very long line EDM and reciprocal zenith angle observations](https://jessekozlowski.wordpress.com/2020/03/24/very-long-line-edm-measurements-reciprocal-zenith-angle-observations/); his [reciprocal zenith angle projects](https://jessekozlowski.wordpress.com/2020/06/09/reciprocal-zenith-angle-projects/) do publish their raw direct and reverse sets, and are where to look for data of this kind. The surveying tab carries the same entry.
