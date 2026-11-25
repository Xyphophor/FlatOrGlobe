# The rules of the comparison

> Tab "Rules" of *Flat plane or Globe?*. Web page: /#tab-rules. Generated from the rendered page: same text, same computed numbers and sources; drawings are replaced by their captions and descriptions, formulas are TeX. Licence: content and data CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), Xyphophor (https://x.com/Xyphophor); source code MIT; third-party data keep the licence of their source, cited in each tab.

*Start · how the comparison is run*

The site compares two models of the Earth against the same measurements. A comparison is only worth something if it is fair, and fairness has to be decided *before* the results are known, not after. These are the rules the site holds itself to. They were fixed as the work went on, often after a mistake, and they apply to every tab. Most of them protect the flat model as much as the globe. If you find a page that breaks one, that is a mistake to report.

## Drawing: nothing exaggerated without saying so

**1. Never exaggerate silently.** Every scene is drawn at true scale by default. When a curve would be invisible at true scale, the planet is drawn smaller, with the factor printed on the figure, and both axes keep the same scale; an axis is never stretched on its own, because that turns a sphere into an ellipse and hides the very tilt the drawing has to show. A figure that is not to scale says so on its stamp. *Why:* stretched axes are the most common trick in videos on both sides; if we used it, nothing else on the page could be trusted.

**2. Numbers come from geometry, never from the drawing.** Every angle, height or distance printed on the site is computed from the true geometry and the data, never measured on a picture, exaggerated or not. The same reading of the terrain, the same air, the same instrument feed both models, so that any difference between them comes from the shape and from nothing else ([Basics](/ai/phys.md#phys-h2dem), terrain models).

## Fairness: the flat model gets its best case

**3. Steel-man the flat model.** Where the flat model has a free parameter, it is tuned in the flat model's favour before it is compared: the height of the stars in [Cel. nav.](/ai/cnav.md), the calibration of the field in [Magnetism](/ai/mag.md), the centre of the map in [Seismology](/ai/seis.md), the best of several flat maps, and for photographs even the refraction it would need (rule 11). The page then shows its best case, and shows where it still fails. When it wins somewhere, the page says so too. *Why:* beating a flat model nobody defends proves nothing.

**4. The globe is never fitted to our data.** The globe's numbers come from published sources, with as little freedom as possible: the radius 6,371 km, the reference ellipsoid, the published field models, the published ephemerides. They are not adjusted to the site's own measurements to improve its score. When the globe does worse than expected somewhere, the page shows it as it is and explains it. *Why:* a globe re-tuned to win would be moving the goalposts. Only the flat model, which has no published standard version, gets fitted.

**5. The same margins for both.** When an uncertain input could explain a miss, such as the temperature of the air or a reading error, the flat model gets the same lever and the same error band as the globe, on the same scale, and its most favourable value as well. *Why:* a lenient scale for one model and a harsh one for the other is a verdict decided in advance.

**6. Say in advance what would prove the globe wrong.** Every experiment states, before its result, what outcome would vindicate the flat model, and what would vindicate the globe: the same kind of result, with the signs swapped. These verdict rules are collected in [What would refute each model](/ai/falsify.md). *Why:* a test that only one answer can pass is not a test.

## What makes a good test

**7. Prefer a change of sign to a difference of size.** “This summit is above eye level on a plane and below it on a globe” cannot be put down to instrument error the way “3 % off” can. The site looks for those tests first. *Example:* a summit lower than the eye, seen above the sea horizon ([Dip](/ai/dip.md), [Elevation angles](/ai/elev.md)).

**8. Prefer quantities where the unknowns cancel.** Two observers who sight each other at the same moment see the heights, the air and most errors cancel; on a plane the two angles must add up to exactly 180°, with no parameter left to adjust ([Elevation angles](/ai/elev.md#2a51c10f)). Such tests come before the ones that need a model of the air or of the instruments.

**9. Documented cases, not knobs.** The evidence tabs show real, documented cases: a photograph with its place, time and camera, a survey with its published numbers, a recording with its station. They have no sliders to make an effect appear or vanish; the calculators that remain are labelled as such. *Why:* a knob lets anyone find the setting that confirms what they already think.

## Refraction: modelled everywhere, even imagined for the plane, then checked against the weather

**10. Refraction is the usual escape, so it is modelled everywhere.** By default the globe is computed twice: with straight rays, and with standard refraction, which bends light along the curve and acts like a larger radius, R′ = R/(1 − k) with k = 0.13[1]. Both values are printed side by side, so the reader can see that standard refraction shrinks the effect without reversing it.

$${R^{\prime} = \frac{R}{1-k}},\qquad k = 0.13$$

**Refraction as a larger radius.** R is the Earth's radius, k the refraction coefficient, the ratio of the curvature of the light ray to that of the Earth. With k = 0.13, light near the ground follows a curve of radius about 7.7 R, and the Earth seen through it looks like a sphere of radius R′ ≈ 1.15 R: flatter, never flat. Measured values of k near the ground scatter widely around this mean[1].

**11. For a photograph, the plane may get an imagined refraction, and the weather has the last word.** Real air varies, and k can even turn negative over warm ground. So, to give the plane its best case (rule 3), the site sometimes goes further on photographs: it gives the plane the refraction it would *need* for the computed view to match what the photograph shows, an air chosen in its favour, and does the same for the globe. Beside each, the page always writes the refraction computed from the weather of the day: temperatures of the air and of the sea, weather-model profiles, soundings. This is how most of the [Contributions](/ai/contrib.md) are analysed: the photographs and readings sent by readers are rarely taken in standard air. [Refraction](/ai/ref.md#rf-hair) puts every such photograph on the site side by side, with how far each model's air is from the day's. The question is then not whether some air could make the model fit, since one almost always can, but whether the air each model needs is the air that was there, within the same margins for both (rule 5).

## Data: what counts, what is set aside, how results are combined

**12. A measurement must not contain the answer.** Each section that shows evidence carries a badge. A **measure** gives the curvature or the radius from data the radius never entered: times, local angles, lengths measured on the ground, measured heights, latitudes and longitudes taken as angles, laboratory constants, star catalogues. A **check** compares real data with the globe, or uses data that a globe model touched once, even if it was cleaned afterwards: any distance in kilometres taken from coordinates, a map or a terrain model, satellite positions, reference ellipsoids, field models. A **model** is a prediction with nothing measured. The same rule holds for the Earth's rotation and the distance to the Sun. [Results](/ai/results.md) keeps the two totals apart, measures and checks, and a check never sets the uncertainty of a measure. *Why:* otherwise one could always say that the radius came out because it was put in.

**13. Keep the scatter, fix the parameters first.** Real data are messy, and the site leaves them messy: a result that comes out scattered or biased is shown and explained, not tuned until it looks tight. A free parameter, a speed, a threshold, a filter, is chosen from the literature or from reasoning *before* the result is computed, never by watching what it does to the answer. Data are never invented; transcriptions from old books are checked against the totals printed in them, and the build stops on any disagreement that is not explained. An example made up to explain something says that it is invented.

**14. Setting a value aside: three standard deviations of the others.** A value is set aside only if it lies more than three standard deviations from the mean of all the *other* values, that spread being measured without it, in a single pass. Never a percentage chosen afterwards. Our own measurements get no special treatment: they count like any other, and fall out by the same rule.

$${|x_i - \bar x_{-i}| > 3\,\sigma_{-i}}$$

**The exclusion rule.** xᵢ is the value tested, x̄₋ᵢ and σ₋ᵢ the mean and the standard deviation of all the others. A value three standard deviations away has a chance of about 0.3 % of being bad luck[2]. Leaving the value out of its own test matters: a wild value inflates the spread it is measured against and can hide behind it.

**15. Combining results: each weighs by its own uncertainty.** The radius found by different methods is combined as a mean weighted by each method's uncertainty, which is its statistical error together with the systematic error measured in its own tab, as the largest shift between its own alternative reductions. If the methods disagree more than their uncertainties allow, the uncertainty of the mean is enlarged by the Birge ratio[3], rather than ignored.

$${\bar x = \frac{\sum x_i/\sigma_i^2}{\sum 1/\sigma_i^2}},\qquad \sigma_{\bar x} = \frac{1}{\sqrt{\sum 1/\sigma_i^2}},\qquad B = \sqrt{\frac{\chi^2}{N-1}}$$

**The weighted mean.** xᵢ is the result of method i and σᵢ its uncertainty; a precise method counts more, as 1/σᵢ². χ² is the sum of the squared gaps (xᵢ − x̄)/σᵢ, and N the number of methods. When B is above 1, the methods disagree more than their stated uncertainties allow, and σ_x̄ is multiplied by B[2][3].

**16. Terrain heights: the model's, and the published one beside it.** Horizons and summits are read from terrain models, the same reading for both models. When the model's height differs from the published one, the page gives both and says what the published one would change; it does not swap one for the other by hand ([Basics](/ai/phys.md#phys-h2dem), terrain models).

## Openness: sources, limits and data

**17. Every claim has its source.** Each tab has one numbered list of sources, and every specific claim carries its number [n]. The data the site computes from are named with their archive, and the programs that turn them into the page's numbers are kept with the site, with the reference of each formula.

**18. Limits are said in the page, not hidden in the code.** When a method is weak, badly conditioned or depends on an assumption, the page says so where the result is shown. Those sentences are not removed to make a page more convincing.

**19. Contributions are published with their author's agreement.** A photograph or a measurement sent by someone appears in [Contributions](/ai/contrib.md) only once its author has agreed, under the public name they chose, and is analysed by the same rules as everything else, including when the result is not the one they expected.

**20. Show the mathematics.** The key relations are written as formulas, each with its own figure and a sentence that defines its symbols; an animation that explains something comes first, then its formula, then the results. Everything is meant to be checked by the reader, by hand if they like.

**21. Transparency: every number can be traced to its files and its code.** Each section that shows evidence has a “code · data” button. It names the data the section is computed from, the code that turns them into its numbers and the files it generates. Beside every data file, a `.explain` file says where it comes from exactly (the archive and the request, or the publication and its pages), how it was obtained (downloaded, or typed by hand from a scan, by whom), the checks it went through, what could still be wrong in it, and its SHA-256 hash. When a file's terms do not allow republishing it, only its hash and its source are given, with the reason, so that anyone can fetch it and check it is the same. Nothing is hidden, the known errors included.

**See also**[Basics](/ai/phys.md)[What would refute each model](/ai/falsify.md)[Results](/ai/results.md)[Refraction](/ai/ref.md)[Contributions](/ai/contrib.md)

## Sources for this tab

1. [1] [C. Hirt, S. Guillaume, A. Wisbar, B. Bürki, H. Sternberg, “Monitoring of the refraction coefficient in the lower atmosphere using a controlled setup of simultaneous reciprocal vertical angle measurements”](https://doi.org/10.1029/2010JD014067), *Journal of Geophysical Research* 115 (2010) D21102: the refraction coefficient k ≈ 0.13 on average, from Gauss's Hanover reciprocal observations to modern data, and how strongly it varies with the weather near the ground.
2. [2] JCGM 100:2008, [*Evaluation of measurement data — Guide to the expression of uncertainty in measurement*](https://www.bipm.org/en/committees/jc/jcgm/publications) (GUM), BIPM et al.: standard uncertainty, combination of uncertainties; for a normal distribution, 99.7 % of values lie within ±3σ.
3. [3] R. T. Birge, “The calculation of errors by the method of least squares”, *Physical Review* 40 (1932) 207–227: the ratio √(χ²/(N − 1)) that tests whether results agree within their stated errors, and enlarges the error of their mean when they do not.
