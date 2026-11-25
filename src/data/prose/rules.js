// Onglet « rules » (2026-11-25, demande du propriétaire : « on a établi des règles pour permettre la meilleure comparaison,
// la plus honnête ; il faut les afficher »). Les règles du CLAUDE.md (1 à 10), et celles fixées depuis avec le propriétaire
// (globe sourcé, marges symétriques, exclusion à 3 σ des autres, moyenne pondérée, altitudes des MNT, contributions).
// Généré une fois ; s'édite à la main ensuite. Texte français : src/i18n/fr/rules-prose.json.
export const PROSE = [
 {
  "t": "eyebrow",
  "k": "rules-eyebrow",
  "html": "Start · how the comparison is run"
 },
 {
  "t": "h1",
  "k": "rules-h1",
  "html": "The rules of the comparison"
 },
 {
  "t": "lead",
  "k": "rules-lead",
  "html": "The site compares two models of the Earth against the same measurements. A comparison is only worth something if it is fair, and fairness has to be decided <i>before</i> the results are known, not after. These are the rules the site holds itself to. They were fixed as the work went on, often after a mistake, and they apply to every tab. Most of them protect the flat model as much as the globe. If you find a page that breaks one, that is a mistake to report."
 },
 {
  "t": "h2",
  "k": "rules-h2draw",
  "html": "Drawing: nothing exaggerated without saying so"
 },
 {
  "t": "notes",
  "k": "rules-draw1",
  "html": "<b>1. Never exaggerate silently.</b> Every scene is drawn at true scale by default. When a curve would be invisible at true scale, the planet is drawn smaller, with the factor printed on the figure, and both axes keep the same scale; an axis is never stretched on its own, because that turns a sphere into an ellipse and hides the very tilt the drawing has to show. A figure that is not to scale says so on its stamp. <i>Why:</i> stretched axes are the most common trick in videos on both sides; if we used it, nothing else on the page could be trusted."
 },
 {
  "t": "notes",
  "k": "rules-draw2",
  "html": "<b>2. Numbers come from geometry, never from the drawing.</b> Every angle, height or distance printed on the site is computed from the true geometry and the data, never measured on a picture, exaggerated or not. The same reading of the terrain, the same air, the same instrument feed both models, so that any difference between them comes from the shape and from nothing else (<a class=\"xref\" href=\"#tab-phys/phys-h2dem\" data-xref=\"phys\" data-sec=\"phys-h2dem\">Basics</a>, terrain models)."
 },
 {
  "t": "h2",
  "k": "rules-h2fair",
  "html": "Fairness: the flat model gets its best case"
 },
 {
  "t": "notes",
  "k": "rules-fair1",
  "html": "<b>3. Steel-man the flat model.</b> Where the flat model has a free parameter, it is tuned in the flat model's favour before it is compared: the height of the stars in <a class=\"xref\" href=\"#tab-cnav\" data-xref=\"cnav\">Cel. nav.</a>, the calibration of the field in <a class=\"xref\" href=\"#tab-mag\" data-xref=\"mag\">Magnetism</a>, the centre of the map in <a class=\"xref\" href=\"#tab-seis\" data-xref=\"seis\">Seismology</a>, the best of several flat maps, and for photographs even the refraction it would need (rule 11). The page then shows its best case, and shows where it still fails. When it wins somewhere, the page says so too. <i>Why:</i> beating a flat model nobody defends proves nothing."
 },
 {
  "t": "notes",
  "k": "rules-fair2",
  "html": "<b>4. The globe is never fitted to our data.</b> The globe's numbers come from published sources, with as little freedom as possible: the radius 6,371 km, the reference ellipsoid, the published field models, the published ephemerides. They are not adjusted to the site's own measurements to improve its score. When the globe does worse than expected somewhere, the page shows it as it is and explains it. <i>Why:</i> a globe re-tuned to win would be moving the goalposts. Only the flat model, which has no published standard version, gets fitted."
 },
 {
  "t": "notes",
  "k": "rules-fair3",
  "html": "<b>5. The same margins for both.</b> When an uncertain input could explain a miss, such as the temperature of the air or a reading error, the flat model gets the same lever and the same error band as the globe, on the same scale, and its most favourable value as well. <i>Why:</i> a lenient scale for one model and a harsh one for the other is a verdict decided in advance."
 },
 {
  "t": "notes",
  "k": "rules-fair4",
  "html": "<b>6. Say in advance what would prove the globe wrong.</b> Every experiment states, before its result, what outcome would vindicate the flat model, and what would vindicate the globe: the same kind of result, with the signs swapped. These verdict rules are collected in <a class=\"xref\" href=\"#tab-falsify\" data-xref=\"falsify\">What would refute each model</a>. <i>Why:</i> a test that only one answer can pass is not a test."
 },
 {
  "t": "h2",
  "k": "rules-h2test",
  "html": "What makes a good test"
 },
 {
  "t": "notes",
  "k": "rules-test1",
  "html": "<b>7. Prefer a change of sign to a difference of size.</b> “This summit is above eye level on a plane and below it on a globe” cannot be put down to instrument error the way “3 % off” can. The site looks for those tests first. <i>Example:</i> a summit lower than the eye, seen above the sea horizon (<a class=\"xref\" href=\"#tab-dip\" data-xref=\"dip\">Dip</a>, <a class=\"xref\" href=\"#tab-elev\" data-xref=\"elev\">Elevation angles</a>)."
 },
 {
  "t": "notes",
  "k": "rules-test2",
  "html": "<b>8. Prefer quantities where the unknowns cancel.</b> Two observers who sight each other at the same moment see the heights, the air and most errors cancel; on a plane the two angles must add up to exactly 180°, with no parameter left to adjust (<a class=\"xref\" href=\"#tab-elev/2a51c10f\" data-xref=\"elev\" data-sec=\"2a51c10f\">Elevation angles</a>). Such tests come before the ones that need a model of the air or of the instruments."
 },
 {
  "t": "notes",
  "k": "rules-test3",
  "html": "<b>9. Documented cases, not knobs.</b> The evidence tabs show real, documented cases: a photograph with its place, time and camera, a survey with its published numbers, a recording with its station. They have no sliders to make an effect appear or vanish; the calculators that remain are labelled as such. <i>Why:</i> a knob lets anyone find the setting that confirms what they already think."
 },
 {
  "t": "h2",
  "k": "rules-h2refr",
  "html": "Refraction: modelled everywhere, even imagined for the plane, then checked against the weather"
 },
 {
  "t": "notes",
  "k": "rules-refr1",
  "html": "<b>10. Refraction is the usual escape, so it is modelled everywhere.</b> By default the globe is computed twice: with straight rays, and with standard refraction, which bends light along the curve and acts like a larger radius, R′ = R/(1 − k) with k = 0.13<sup class=\"ref\"><a href=\"#s-rules-n1\">[1]</a></sup>. Both values are printed side by side, so the reader can see that standard refraction shrinks the effect without reversing it."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "rules-fx-refr",
  "fig": "rulesFxRefr",
  "lines": [
   {
    "tex": "\\g{R^{\\prime} = \\frac{R}{1-k}},\\qquad k = 0.13",
    "fallback": "R′ = R/(1 − k), k = 0.13"
   }
  ],
  "gloss": "<b>Refraction as a larger radius.</b> R is the Earth's radius, k the refraction coefficient, the ratio of the curvature of the light ray to that of the Earth. With k = 0.13, light near the ground follows a curve of radius about 7.7 R, and the Earth seen through it looks like a sphere of radius R′ ≈ 1.15 R: flatter, never flat. Measured values of k near the ground scatter widely around this mean<sup class=\"ref\"><a href=\"#s-rules-n1\">[1]</a></sup>."
 },
 {
  "t": "notes",
  "k": "rules-refr2",
  "html": "<b>11. For a photograph, the plane may get an imagined refraction, and the weather has the last word.</b> Real air varies, and k can even turn negative over warm ground. So, to give the plane its best case (rule 3), the site sometimes goes further on photographs: it gives the plane the refraction it would <i>need</i> for the computed view to match what the photograph shows, an air chosen in its favour, and does the same for the globe. Beside each, the page always writes the refraction computed from the weather of the day: temperatures of the air and of the sea, weather-model profiles, soundings. This is how most of the <a class=\"xref\" href=\"#tab-contrib\" data-xref=\"contrib\">Contributions</a> are analysed: the photographs and readings sent by readers are rarely taken in standard air. <a class=\"xref\" href=\"#tab-ref/rf-hair\" data-xref=\"ref\" data-sec=\"rf-hair\">Refraction</a> puts every such photograph on the site side by side, with how far each model's air is from the day's. The question is then not whether some air could make the model fit, since one almost always can, but whether the air each model needs is the air that was there, within the same margins for both (rule 5)."
 },
 {
  "t": "h2",
  "k": "rules-h2data",
  "html": "Data: what counts, what is set aside, how results are combined"
 },
 {
  "t": "notes",
  "k": "rules-data1",
  "html": "<b>12. A measurement must not contain the answer.</b> Each section that shows evidence carries a badge. A <b>measure</b> gives the curvature or the radius from data the radius never entered: times, local angles, lengths measured on the ground, measured heights, latitudes and longitudes taken as angles, laboratory constants, star catalogues. A <b>check</b> compares real data with the globe, or uses data that a globe model touched once, even if it was cleaned afterwards: any distance in kilometres taken from coordinates, a map or a terrain model, satellite positions, reference ellipsoids, field models. A <b>model</b> is a prediction with nothing measured. The same rule holds for the Earth's rotation and the distance to the Sun. <a class=\"xref\" href=\"#tab-results\" data-xref=\"results\">Results</a> keeps the two totals apart, measures and checks, and a check never sets the uncertainty of a measure. <i>Why:</i> otherwise one could always say that the radius came out because it was put in."
 },
 {
  "t": "notes",
  "k": "rules-data2",
  "html": "<b>13. Keep the scatter, fix the parameters first.</b> Real data are messy, and the site leaves them messy: a result that comes out scattered or biased is shown and explained, not tuned until it looks tight. A free parameter, a speed, a threshold, a filter, is chosen from the literature or from reasoning <i>before</i> the result is computed, never by watching what it does to the answer. Data are never invented; transcriptions from old books are checked against the totals printed in them, and the build stops on any disagreement that is not explained. An example made up to explain something says that it is invented."
 },
 {
  "t": "notes",
  "k": "rules-data3",
  "html": "<b>14. Setting a value aside: three standard deviations of the others.</b> A value is set aside only if it lies more than three standard deviations from the mean of all the <i>other</i> values, that spread being measured without it, in a single pass. Never a percentage chosen afterwards. Our own measurements get no special treatment: they count like any other, and fall out by the same rule."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "rules-fx-excl",
  "fig": "rulesFxExcl",
  "lines": [
   {
    "tex": "\\g{|x_i - \\bar x_{-i}| > 3\\,\\sigma_{-i}}",
    "fallback": "|xᵢ − x̄₋ᵢ| > 3 σ₋ᵢ"
   }
  ],
  "gloss": "<b>The exclusion rule.</b> xᵢ is the value tested, x̄₋ᵢ and σ₋ᵢ the mean and the standard deviation of all the others. A value three standard deviations away has a chance of about 0.3 % of being bad luck<sup class=\"ref\"><a href=\"#s-rules-n2\">[2]</a></sup>. Leaving the value out of its own test matters: a wild value inflates the spread it is measured against and can hide behind it."
 },
 {
  "t": "notes",
  "k": "rules-data4",
  "html": "<b>15. Combining results: each weighs by its own uncertainty.</b> The radius found by different methods is combined as a mean weighted by each method's uncertainty, which is its statistical error together with the systematic error measured in its own tab, as the largest shift between its own alternative reductions. If the methods disagree more than their uncertainties allow, the uncertainty of the mean is enlarged by the Birge ratio<sup class=\"ref\"><a href=\"#s-rules-n3\">[3]</a></sup>, rather than ignored."
 },
 {
  "t": "formula",
  "flat": false,
  "style": "border-left-color:var(--globe)",
  "k": "rules-fx-wmean",
  "fig": "rulesFxWmean",
  "lines": [
   {
    "tex": "\\g{\\bar x = \\frac{\\sum x_i/\\sigma_i^2}{\\sum 1/\\sigma_i^2}},\\qquad \\sigma_{\\bar x} = \\frac{1}{\\sqrt{\\sum 1/\\sigma_i^2}},\\qquad B = \\sqrt{\\frac{\\chi^2}{N-1}}",
    "fallback": "x̄ = Σ(xᵢ/σᵢ²) / Σ(1/σᵢ²), σ_x̄ = 1/√Σ(1/σᵢ²), B = √(χ²/(N − 1))"
   }
  ],
  "gloss": "<b>The weighted mean.</b> xᵢ is the result of method i and σᵢ its uncertainty; a precise method counts more, as 1/σᵢ². χ² is the sum of the squared gaps (xᵢ − x̄)/σᵢ, and N the number of methods. When B is above 1, the methods disagree more than their stated uncertainties allow, and σ<sub>x̄</sub> is multiplied by B<sup class=\"ref\"><a href=\"#s-rules-n2\">[2]</a></sup><sup class=\"ref\"><a href=\"#s-rules-n3\">[3]</a></sup>."
 },
 {
  "t": "notes",
  "k": "rules-data5",
  "html": "<b>16. Terrain heights: the model's, and the published one beside it.</b> Horizons and summits are read from terrain models, the same reading for both models. When the model's height differs from the published one, the page gives both and says what the published one would change; it does not swap one for the other by hand (<a class=\"xref\" href=\"#tab-phys/phys-h2dem\" data-xref=\"phys\" data-sec=\"phys-h2dem\">Basics</a>, terrain models)."
 },
 {
  "t": "h2",
  "k": "rules-h2open",
  "html": "Openness: sources, limits and data"
 },
 {
  "t": "notes",
  "k": "rules-open1",
  "html": "<b>17. Every claim has its source.</b> Each tab has one numbered list of sources, and every specific claim carries its number [n]. The data the site computes from are named with their archive, and the programs that turn them into the page's numbers are kept with the site, with the reference of each formula."
 },
 {
  "t": "notes",
  "k": "rules-open2",
  "html": "<b>18. Limits are said in the page, not hidden in the code.</b> When a method is weak, badly conditioned or depends on an assumption, the page says so where the result is shown. Those sentences are not removed to make a page more convincing."
 },
 {
  "t": "notes",
  "k": "rules-open3",
  "html": "<b>19. Contributions are published with their author's agreement.</b> A photograph or a measurement sent by someone appears in <a class=\"xref\" href=\"#tab-contrib\" data-xref=\"contrib\">Contributions</a> only once its author has agreed, under the public name they chose, and is analysed by the same rules as everything else, including when the result is not the one they expected."
 },
 {
  "t": "notes",
  "k": "rules-open4",
  "html": "<b>20. Show the mathematics.</b> The key relations are written as formulas, each with its own figure and a sentence that defines its symbols; an animation that explains something comes first, then its formula, then the results. Everything is meant to be checked by the reader, by hand if they like."
 },
 {
  "t": "notes",
  "k": "rules-open5",
  "html": "<b>21. Transparency: every number can be traced to its files and its code.</b> Each section that shows evidence has a “code · data” button. It names the data the section is computed from, the code that turns them into its numbers and the files it generates. Beside every data file, a <code>.explain</code> file says where it comes from exactly (the archive and the request, or the publication and its pages), how it was obtained (downloaded, or typed by hand from a scan, by whom), the checks it went through, what could still be wrong in it, and its SHA-256 hash. When a file's terms do not allow republishing it, only its hash and its source are given, with the reason, so that anyone can fetch it and check it is the same. Nothing is hidden, the known errors included."
 },
 {
  "t": "xrefs",
  "keys": [
   "phys",
   "falsify",
   "results",
   "ref",
   "contrib"
  ],
  "wide": false
 },
 {
  "t": "sources"
 }
];
