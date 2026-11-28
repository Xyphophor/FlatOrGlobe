# Every flat map of the world is a picture of a globe — the flat-earth map included

> Tab "Maps" of *Flat plane or Globe?*. Web page: /#tab-map. Generated from the rendered page: same text, same computed numbers and sources; drawings are replaced by their captions and descriptions, formulas are TeX. Licence: content and data CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), Xyphophor (https://x.com/Xyphophor); source code MIT; third-party data keep the licence of their source, cited in each tab.

*Maps · history and projections*

For most of history a map was flat because it was small, and it was right to be. A town, a valley, even a kingdom fits on a sheet of paper with errors smaller than anyone could pace. The trouble starts with the whole world. Since Ptolemy, about 150 CE, every world map has been drawn from a ball, with rules for spreading its curved grid on a plane, and every set of rules has to give something up. The map used today to illustrate a flat Earth is one of those rules: the azimuthal equidistant projection, centred on the North Pole. This tab is history and geometry, not a measurement; the measurements that decide between the models are in the other tabs.

## Small maps are flat, and rightly so

**The oldest map of the world we have is a disc.** A clay tablet from Sippar, a Neo-Babylonian copy of an older original, shows Babylon on the Euphrates inside a ring of “bitter river”, with triangular regions beyond it[1]. It is a diagram of the known world, not a survey. Practical maps were local: Roman itineraries listed roads and stages, medieval portolan charts drew the Mediterranean coast from compass bearings and sailing days[2]. Treating the ground as a plane cost them nothing, because over a small region the plane and the sphere disagree by far less than their measurements could see.

*Figure caption:* The Babylonian map of the world, redrawn as a schematic: the disc of Mesopotamia inside a ring of ocean, regions beyond it as triangles. It is a picture of what was known, drawn as a disc because the known world surrounded the place that drew it.

How much do they disagree? Draw the best possible flat map of a region around its centre: every distance from the centre exact, every direction from the centre exact. A circle at ground distance d from the centre is then drawn 2πd long, but on a sphere of radius R the circle that is everywhere d from a point is only 2πR sin(d/R) long. The map must stretch it, and that stretch is the smallest error any flat map of the region can have[3].

$$C_{\text{sphere}} = 2\pi R\sin\frac{d}{R},\qquad C_{\text{map}} = 2\pi d$$
$${k = \frac{c}{\sin c} \approx 1 + \frac{c^2}{6},\quad c = \frac{d}{R}}$$

c is the distance from the centre as an angle at the Earth's centre. The error grows as the square of the region's size: 0.004 % at 100 km, 0.41 % at 1,000 km, and it reaches 1 % only 1,560 km from the centre.

*Figure caption:* The smallest error of a flat map against the size of the region it covers, on logarithmic scales. A town map is wrong by less than a millionth; a kingdom by a fraction of a percent; a map of the whole Mediterranean by a few percent, about what a careful sailing chart could notice. The world cannot be drawn this way without errors of tens of percent.

> **The flat model's best case is real.** Within a few hundred kilometres a flat map is not an approximation anyone can catch with a tape, a chain or a compass: it is the right working tool, and surveyors still use it (the last section). The flat intuition comes from here, and it is sound at this scale. It stops being sound when one map has to hold the whole world, which is what the other tabs test with distances, angles and times.

## The Greeks: a sphere, then its size

**By the fourth century BCE the sphere was argued from observation.** Aristotle gives two reasons: the Earth's shadow on the Moon during an eclipse always has a curved edge, and travelling north or south changes which stars rise and set[4]. About a century later Eratosthenes measured its size. At Syene the noon Sun at the solstice was overhead; at Alexandria, to the north, a gnomon's shadow showed it 1/50 of a circle from the vertical. The two places, 5,000 stadia apart, are therefore 1/50 of the way around[5]. Hipparchus then proposed fixing places by latitude and longitude, angles on the sphere, rather than by itineraries[2].

*Figure caption:* **Aristotle** 384–322 BCE
[Marble bust, a Roman copy of a Greek bronze by Lysippos, c. 330 BCE (Palazzo Altemps, Rome)](https://commons.wikimedia.org/wiki/File:Aristotle_Altemps_Inv8575.jpg)

*Figure caption:* **Eratosthenes** c. 276–194 BCE
[Imagined: no likeness of him survives (engraving, date unknown)](https://commons.wikimedia.org/wiki/File:Eratosthenes.jpg)

$${C = \frac{360°}{\alpha}\,s}$$

α is the Sun's angle from the vertical at the second place when it is overhead at the first, s the distance between them along the meridian. α = 7.2° and s = 5,000 stadia give C = 250,000 stadia. The length of the stadion he used is uncertain, so the result in kilometres is too; the method is what lasted. The tabs on celestial navigation and dip repeat it with modern instruments.

## Ptolemy: a map that knows it is drawn from a ball

**Ptolemy's *Geography*, about 150 CE, is a list and a method.** The list gives some 8,000 places by latitude and longitude; the method tells how to draw them on a plane[6]. He starts by criticising his predecessor Marinus of Tyre, who drew meridians and parallels as a rectangular grid. Marinus had at least spaced his meridians correctly at one latitude, that of Rhodes, 36°, where a degree of longitude is shorter than a degree of latitude in the ratio cos 36°. Ptolemy gives that ratio as 93 to 115[6][7].

*Figure caption:* **Claudius Ptolemy** c. 100–170
[Imagined: no likeness survives (Justus van Gent, c. 1475, Louvre)](https://commons.wikimedia.org/wiki/File:Claudio_Ptolomeo.png)

$$x = R\,\lambda\cos\varphi_1,\qquad y = R\,\varphi$$
$${\frac{\text{parallel}}{\text{equator}} = \cos\varphi:\quad \cos 36° = 0.809 \approx \frac{93}{115}}$$

λ is longitude and φ latitude, in radians. The length of a parallel shrinks as cos φ because the parallel is a circle of radius R cos φ: that ratio only exists on a sphere. Ptolemy's 93/115 is 0.8087, cos 36° is 0.8090; his 52/115 for Thule, 63°, is 0.4522 against 0.4540.

*Figure caption:* **Marinus's rectangular grid, with modern coastlines.** Degrees of longitude are drawn cos 36° as long as degrees of latitude, so lengths are true along the parallel of Rhodes (orange) and along every meridian, and too long east–west north of it, too short south of it. The dashed frame is the region Ptolemy's list covered, in modern longitudes.

**Ptolemy's own first projection** curves the parallels into concentric arcs and makes the meridians straight lines meeting at a point above the pole, as if a cone had been set over the globe and unrolled. He chose it so that the parallels of Rhodes and Thule keep their true length relative to the meridians, 93 and 52 parts for 115 at the equator[6][7]. In modern terms it is an equidistant conic projection with two standard parallels, written down again by Snyder in 1987[3].

$$n = \frac{\cos\varphi_1 - \cos\varphi_2}{\varphi_2 - \varphi_1},\qquad G = \frac{\cos\varphi_1}{n} + \varphi_1$$
$${\rho = R\,(G - \varphi),\quad \theta = n(\lambda - \lambda_0),\quad x = \rho\sin\theta,\ y = \rho_0 - \rho\cos\theta}$$

φ₁ = 36° and φ₂ = 63° give n = 0.753: the fan of meridians opens 136° for 180° of longitude. Distances along every meridian are true (ρ falls by R for each radian of latitude), and the two chosen parallels have exactly the length 2πR cos φ, which is the property Ptolemy asked for.

*Figure caption:* **Ptolemy's world computed from his own numbers, beside a map drawn from them.** Left: the 6,372 coordinates of his catalogue (brown dots), placed with his first projection inside his frame, 63° N to 16°25′ S over 180° of longitude east of the Fortunate Isles[6][17]. The parallels of Thule and Rhodes (orange) and every meridian are at true scale. Underneath, modern coastlines through the same projection, his zero meridian set on the Canaries. For 56 towns whose site is known, a line joins where he puts them (black) to where they are (blue)[19]: his latitudes are off by 0.4° on average (standard deviation 2.5°), but his longitudes grow 1.40 times too fast eastward. Right: the world map of the Byzantine manuscript Urbinas gr. 82, about 1300, drawn by hand on the same projection from the same lists[18].

> **Admitted limits.** Ptolemy's projection was right and his data were not. He adopted a circumference of 180,000 stadia, smaller than Eratosthenes', and longitudes estimated from travel times, so the known world spans 180° of longitude on his maps; the towns above put the same lands across about 128°[6]. The factor 1.40 is almost exactly 252,000 / 180,000 = 1.4: distances counted in stadia and turned into degrees at 500 stadia a degree instead of about 700 come out 1.4 times too many degrees. The method held; the numbers were corrected over the next fifteen centuries by exactly the kind of measurements this site collects.

## The Middle Ages kept the globe

**The round “T-O” maps of medieval manuscripts are diagrams, not claims about shape.** They split the inhabited quarter of the globe into Asia, Europe and Africa with a T of waters, east at the top, as a schema to remember the three parts of the world[2]. The scholars who copied them taught a spherical Earth: Bede in the eighth century, Sacrobosco's *De sphaera* in every university from the thirteenth. The story that medieval people thought the Earth flat, and that Columbus had to prove otherwise, was popularised in the nineteenth century, largely by Washington Irving's 1828 life of Columbus[8].

*Figure caption:* A T-O map, as a schematic: the ocean around the inhabited lands, the Mediterranean as the stem of the T, the Don and the Nile as its arms. It is to a world map what a metro diagram is to a street map.

Meanwhile the sailors' portolan charts, from the late thirteenth century, drew the Mediterranean and the Black Sea as a plane criss-crossed by compass lines, accurate enough for a basin about 3,000 km long[2]. Ptolemy's *Geography* came back to Western Europe in a Latin translation in the early 1400s and was printed with maps from 1477; Renaissance mapmakers inherited his projections along with his errors[2][9].

## Mercator, 1569: a map for steering

**A navigator wants a straight line on the chart to be a constant compass heading.** On the globe, meridians converge toward the poles; on a chart where they are drawn parallel, every parallel at latitude φ is stretched east–west by 1/cos φ. Gerardus Mercator's world map of 1569 stretched the north–south direction by the same factor at every latitude, so that small shapes and all angles stay true[10]. He did it graphically; Edward Wright computed the spacing of the parallels in 1599, by adding up sec φ degree by degree[11].

*Figure caption:* **Gerardus Mercator** 1512–1594
[Frans Hogenberg, 1574, at the age of 62](https://commons.wikimedia.org/wiki/File:Gerardus_Mercator2.jpg)

$$x = R\lambda,\qquad y = R\sum_{0}^{\varphi}\sec\varphi\,\Delta\varphi \to R\ln\tan\left(\frac{\pi}{4} + \frac{\varphi}{2}\right)$$
$${h = k = \sec\varphi,\qquad \text{area} \times \sec^2\varphi}$$

h and k are the scales along the meridian and the parallel. They are equal, so the map is conformal: angles and small shapes are true. Areas are not: at 72° N, Greenland's latitude, every area is drawn 10.5 times larger than at the equator, and the pole itself is infinitely far away[3].

*Figure caption:* **Mercator's projection with Tissot's circles.** Every blue circle is the same circle on the globe, 1,560 km across; on the map they keep their round shape and grow toward the poles. The orange line from Frankfurt to San Francisco is straight: a single compass heading, 10,540 km. The dashed curve is the great circle, the shortest route on the globe, 9,150 km, which airliners fly; on this map it bulges toward the pole.

> **The flat model and Mercator.** A flat Earth drawn as Mercator's rectangle would need the poles infinitely long and every route straight on it to be the shortest; neither is the case, and no flat-earth proposal uses it. A flat map with straight shortest routes has to be azimuthal, centred somewhere, which is where the rest of this tab goes.

## Gauss, 1827: no flat map can be true everywhere

**Gauss's curvature K = κ₁κ₂**, the principal curvatures and why a cylinder unrolls and a sphere does not: [Curvature](/ai/kappa.md#ka-h2surf).

**Every projection gives something up, and this is a theorem, not a lack of skill.** Carl Friedrich Gauss showed in 1827 that the curvature of a surface can be measured from inside it, from lengths alone, and is unchanged by any bending without stretching[12]. A sheet of paper has zero curvature and a sphere 1/R²; so no map of any part of a sphere keeps every length. In 1881 Nicolas Auguste Tissot published how to see what each map gives up: draw small equal circles on the globe and look at the ellipses they become[13].

*Figure caption:* **Carl Friedrich Gauss** 1777–1855
[Gottlieb Biermann after Christian Albrecht Jensen, 1840](https://commons.wikimedia.org/wiki/File:Carl_Friedrich_Gauss.jpg)

$$K_{\text{sphere}} = \frac{1}{R^2} \neq K_{\text{plane}} = 0$$
$${\text{conformal: } h = k,\qquad \text{equal-area: } h\,k = 1,\qquad \text{never } h = k = 1 \text{ everywhere}}$$

h and k are the scales of the map along the meridian and the parallel at a point; the small circle becomes an ellipse whose axes come from them. A map can keep shapes (Mercator, stereographic), or areas (Lambert, sinusoidal), or distances along one family of lines (Ptolemy's meridians, the azimuthal equidistant's lines from the centre), never all of them[3].

*Figure caption:* **The same circles on six maps.** Each blue patch is a circle 7° in radius on the globe, at the same places on every map. The equirectangular grid of Marinus keeps neither shape nor area; Mercator keeps shapes; Lambert's cylinder (1772) and the sinusoidal keep areas and squash shapes; the polar azimuthal equidistant keeps distances from the North Pole and stretches the south east–west; the orthographic is how a globe looks from far away, half of it hidden[9].

## The azimuthal equidistant: true from one point

**Put one place at the centre and draw every other place at its true distance and true direction from it.** That is the azimuthal equidistant projection. Mercator used it in 1569 for the inset of the Arctic on his world map, and Guillaume Postel for a map in 1581, which is why it is also called Postel's projection[10][9]. It is the right map for questions asked from one place: which way and how far to any city from here, as on radio amateurs' maps centred on their station[3]. The rim of the disc is a single point, the antipode of the centre, drawn as a circle.

*Figure caption:* **The centre travels, the map is redrawn.** From the North Pole to Paris, Mecca, Cape Town, the South Pole, Sydney and Honolulu, along great circles: the same coastlines, the same rule, a different flat map at every step. Any of them is a correct azimuthal equidistant map; none of them is more “flat” than the others. Click to pause.

$$\cos c = \sin\varphi_0\sin\varphi + \cos\varphi_0\cos\varphi\cos(\lambda - \lambda_0)$$
$${\rho = R\,c,\quad \theta = \text{azimuth from } (\varphi_0, \lambda_0);\qquad h = 1,\ k = \frac{c}{\sin c}}$$

(φ₀, λ₀) is the centre, c the angular distance to the point, θ its direction from the centre. Along lines from the centre the scale h is exactly 1; across them it is k = c/sin c, the stretch of the first section, which reaches π/2 = 1.57 at 90° from the centre and grows without bound toward the rim. The site draws all its flat maps with this one function, for any centre.

- Sydney – Santiagoon this map: 25,684 kmgreat circle: 11,347 kmmap / ground: ×2.26

*Figure caption:* **One globe, one rule, any centre.** The thin lines from the centre are true in length and direction; the dashed orange rings are 30° apart on the ground. The orange straight line joins Sydney and Santiago, and the reading below compares its length on this map with the great-circle distance (dashed blue). Change the centre: the line is right only when it passes through the centre, and the polar map, the one used for a flat Earth, more than doubles it.

## The flat-earth map is a globe map

**In 1892 Alexander Gleason of Buffalo published a “New Standard Map of the World”** on a north-polar azimuthal equidistant projection, drawn on the projection of J. S. Christopher; he patented it in 1893 as a time chart, and he wrote that it supported his belief that the round Earth was false[14]. Its grid is the polar map above, computed from latitudes and longitudes measured on a globe. The United Nations emblem, adopted in 1946, is the same projection centred on the North Pole and cut at 60° S[15]. Both are reproduced today as “the” flat Earth.

$$\rho = R\left(\frac{\pi}{2} - \varphi\right),\qquad \text{parallel drawn } 2\pi R\left(\frac{\pi}{2} - \varphi\right) \text{ vs } 2\pi R\cos\varphi$$
$${k_{E\text{–}W} = \frac{\pi/2 - \varphi}{\cos\varphi}}$$

On the polar map every parallel is a circle whose radius is its true distance from the pole, so its drawn length is 2πR(π/2 − φ) while its true length is 2πR cos φ. East–west distances are drawn 1.08 times too long at London's latitude, 1.57 at the equator, 2.60 at Sydney's, and without limit toward the rim.

*Figure caption:* **Gleason's map with Tissot's circles.** The same 7° circles as on the other maps: round near the North Pole, stretched east–west further south, 2.60 times too wide at the latitude of Sydney, Cape Town and Buenos Aires. The dashed orange circle is the edge of the UN emblem, 60° S. Antarctica, a continent, becomes the rim.

> **Steel-manning the flat map.** On the polar map, every distance from the North Pole and every north–south distance along a meridian is exactly right; a test along a meridian cannot tell it from the globe. Nor is the North Pole special: any centre gives an equally valid map, true from its centre and wrong elsewhere. The flat model therefore has a free parameter, the centre, and the dist tab tunes it in the model's favour: the best centre for a set of measured flight distances still misses the southern routes by thousands of kilometres. **What would vindicate it:** one centre for which measured east–west distances in the south, Sydney–Santiago or Johannesburg–Perth, match the map's straight lines.

## Today: flat again, one small piece at a time

**Modern surveying and every phone's map grid come back to the first section.** The Universal Transverse Mercator system cuts the globe into sixty zones 6° of longitude wide and maps each on its own cylinder, touching the globe along the zone's central meridian[16]. Inside a zone the ground is treated as a plane, with an error small enough to be ignored and a formula to correct it: the reason a flat map of a small region was fine for the Babylonians is the reason it is fine for a land surveyor, and the reason the zones have to stop after 6°[9].

$${k \approx k_0\left(1 + \frac{x^2}{2R^2}\right),\qquad k_0 = 0.9996}$$

x is the distance from the zone's central meridian. The scale is set slightly below 1 on the central meridian so that it is exactly 1 about 180 km either side and only 1.0010 at the zone's edge, 334 km away at the equator: a thousandth at most, the same c²/2 growth as the first section's c²/6, for the same reason[16].

Reading the history this way, nobody ever had to choose between a flat map and a globe. Flat sheets were always right for small places, and the sphere was always behind them as soon as the sheets had to join. The other tabs measure where the join shows: the horizon, the distances, the angles to the Sun and the stars.

**See also**[Distances](/ai/dist.md)[Cel. nav.](/ai/cnav.md)[Dip](/ai/dip.md)[Aviation](/ai/avia.md)[Surveying](/ai/surv.md)[GPS](/ai/gps.md)

## Sources for this tab

1. [1] British Museum, [the Babylonian map of the world](https://www.britishmuseum.org/collection/object/W_1882-0714-509), BM 92687 (1882,0714.509): clay tablet from Sippar, 12.2 × 8.2 cm, Neo-Babylonian copy of an earlier original.
2. [2] J. B. Harley & D. Woodward (eds.), [*The History of Cartography*, vol. 1: Cartography in Prehistoric, Ancient, and Medieval Europe and the Mediterranean](https://press.uchicago.edu/books/HOC/HOC_V1/Volume1.html) (University of Chicago Press, 1987), free online — Babylonian maps (ch. 6), Greek and Roman cartography (ch. 8–14), mappaemundi (ch. 18), portolan charts (ch. 19).
3. [3] J. P. Snyder, [*Map Projections — A Working Manual*](https://pubs.usgs.gov/publication/pp1395), USGS Professional Paper 1395 (1987): the formulas of every projection drawn here (equidistant conic §16, Mercator §7, cylindrical equal-area §10, azimuthal equidistant §25, orthographic §20, sinusoidal §30) and Tissot's indicatrix (§4).
4. [4] Aristotle, *On the Heavens* (De Caelo) II.14, 297b–298a: the curved edge of the Earth's shadow in lunar eclipses, and stars that rise or vanish as one travels north or south.
5. [5] Cleomedes, *Cleomedes' Lectures on Astronomy* (Caelestia) I.7, transl. A. C. Bowen & R. B. Todd (University of California Press, 2004): Eratosthenes' measurement from Syene and Alexandria, 1/50 of a circle and 5,000 stadia.
6. [6] J. L. Berggren & A. Jones, *Ptolemy's Geography: An Annotated Translation of the Theoretical Chapters* (Princeton University Press, 2000): Book I (critique of Marinus, the two projections, I.20–24), the circumference of 180,000 stadia, about 8,000 localities by latitude and longitude.
7. [7] Museo Galileo, [Ptolemy's first projection](https://mostre.museogalileo.it/framauro/en/designing-the-world/ptolemy-s-projections/ptolemy-s-first-projection.html) (exhibition *Designing the World*): the ratio 115 : 93 : 52 of the equator and the parallels of Rhodes (36°) and Thule (63°).
8. [8] J. B. Russell, *Inventing the Flat Earth: Columbus and Modern Historians* (Praeger, 1991): the medieval consensus on a spherical Earth (Bede, Sacrobosco) and how Washington Irving's *Life of Columbus* (1828) spread the myth that the Middle Ages believed it flat.
9. [9] J. P. Snyder, *Flattening the Earth: Two Thousand Years of Map Projections* (University of Chicago Press, 1993): the history of projections, from Ptolemy to Mercator, Lambert (1772), the sinusoidal, Postel's azimuthal equidistant (1581) and the twentieth-century grids.
10. [10] G. Mercator, *Nova et aucta orbis terrae descriptio ad usum navigantium emendate accommodata* (Duisburg, 1569), 18 sheets: the conformal cylindrical projection, with an inset of the north polar region on the azimuthal equidistant projection.
11. [11] E. Wright, *Certaine Errors in Navigation* (London, 1599): the first table of Mercator's “meridional parts”, the spacing of the parallels computed by summing sec φ.
12. [12] C. F. Gauss, *Disquisitiones generales circa superficies curvas*, Commentationes Societatis Regiae Scientiarum Gottingensis Recentiores 6 (1828; read in 1827): the *theorema egregium* — the curvature of a surface can be measured within it, and no map keeps it.
13. [13] N. A. Tissot, *Mémoire sur la représentation des surfaces et les projections des cartes géographiques* (Gauthier-Villars, Paris, 1881): the indicatrix, the ellipse into which every map turns a small circle.
14. [14] A. J. Gleason, *Gleason's New Standard Map of the World* (Buffalo, 1892), on the projection of J. S. Christopher ([catalogue record](https://ark.digitalcommonwealth.org/ark:/50959/7h149v85z)) — Leventhal Map & Education Center, [“The round earth as a flat-out lie”](https://www.leventhalmap.org/digital-exhibitions/bending-lines/power-belief/3.1.3): Gleason saw in it support for his belief that the round Earth was false (*Is the Bible from Heaven? Is the Earth a Globe?*, 1890); patented as a “time chart”, US patent 497,917 (1893).
15. [15] United Nations, [UN emblem and flag](https://www.un.org/en/about-us/un-emblem-and-flag); General Assembly resolution 92 (I), 7 December 1946: “a map of the world representing an azimuthal equidistant projection centred on the North Pole … extends to 60 degrees south latitude”.
16. [16] Defense Mapping Agency, *The Universal Grids: Universal Transverse Mercator (UTM) and Universal Polar Stereographic (UPS)*, DMA TM 8358.2 (1989): sixty zones of 6° of longitude, scale factor 0.9996 on each central meridian, from 80° S to 84° N.
17. [17] G. Graßhoff & O. Defaux, [Catalog of Ptolemy's Geography, main books](https://zenodo.org/record/3585758) (Humboldt University Berlin / Max Planck Institute for the History of Science, 2019, CC BY 4.0), after A. Stückelberger & G. Graßhoff, *Klaudios Ptolemaios, Handbuch der Geographie* (Schwabe, Basel, 2006): 6,372 localities with coordinates (Omega recension, Xi where Omega gives none), and the modern identification of each site.
18. [18] Codex Vaticanus Urbinas graecus 82, ff. 60v–61r: world map on Ptolemy's first projection, Constantinople, about 1300, probably made under Maximus Planudes; Biblioteca Apostolica Vaticana. Image: [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Ptolemy-World_Vat_Urb_82.jpg) (public domain).
19. [19] Modern sites of the 56 towns: [Wikidata](https://www.wikidata.org/), coordinate location (P625), CC0, read on 2026-10-26 (`data/map/ptolemy/modern.csv`).
