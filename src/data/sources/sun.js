// Sources de l'onglet sun, portées à l'identique du legacy
// (flat-or-globe-2.20.0.html, ~L11523-11558, bloc .srcs de tab-sun).
// L'ordre EST la numérotation [n] (voir src/core/citations.js) : ne pas
// réordonner sans vérifier chaque cite(KEY, id) dans src/tabs/sun/index.js.
export const SOURCES = [
  {
    id: "paris-obs-romer",
    html: `<a href="https://observatoiredeparis.psl.eu/340-years-ago-romer-showed.html">Paris Observatory — how Rømer and Cassini's Io program revealed the finite speed of light in 1676</a>, and <a href="https://pubs.aip.org/aapt/ajp/article-pdf/66/7/561/12210384/561_1_online.pdf">an <em>American Journal of Physics</em> analysis of Rømer's method</a>.`,
  },
  {
    id: "uva-speed-of-light",
    html: `<a href="http://galileoandeinstein.physics.virginia.edu/lectures/spedlite.html">University of Virginia lecture, "The Speed of Light"</a> — Rømer's 10-minutes-late prediction of 9 Nov 1676, then Fizeau's toothed wheel (1849) and Foucault's rotating mirror: the terrestrial <em>c</em> this tab feeds back into Io.`,
  },
  {
    id: "royal-society-cook-transit",
    html: `<a href="https://royalsocietypublishing.org/doi/10.1098/rsnr.1969.0004">Royal Society — "Captain Cook and the transit of Venus of 1769"</a>: why one absolute distance calibrates the whole solar system whose <em>relative</em> map Kepler had already fixed from angles alone; plus <a href="https://www.royalobservatorygreenwich.org/articles.php?article=1189">Royal Observatory Greenwich on the transit expeditions</a> and <a href="https://skyandtelescope.org/astronomy-news/transits-of-venus-in-history-1769-today/">Sky &amp; Telescope's history</a> (Encke's 2.5%-high solution).`,
  },
  {
    id: "iau-au",
    html: `<a href="https://iauarchive.eso.org/public/themes/measuring/">IAU — the astronomical unit, defined since 2012 as exactly 149,597,870,700 m</a>; background at the <a href="https://ssd.jpl.nasa.gov/faq.html">JPL Solar System Dynamics FAQ</a> and <a href="https://observatoiredeparis.psl.eu/the-new-definition-of-the-astronomical-unit.html">Paris Observatory</a>.`,
  },
  {
    id: "bss-sundials",
    html: `<a href="https://sundialsoc.org.uk/all-about-sundials/how-sundials-work/">British Sundial Society — How Sundials Work</a> — why the gnomon must parallel the Earth's axis, how the equatorial dial's 15° hour lines become the splayed lines of horizontal dials, and how hour-line angles change with latitude: the dial-maker's craft is applied globe geometry.`,
  },
  {
    id: "noaa-solcalc",
    html: `<a href="https://gml.noaa.gov/grad/solcalc/">NOAA Solar Calculator</a> — check every noon altitude, declination and equation-of-time value in this tab for your own coordinates; the <a href="https://gml.noaa.gov/grad/solcalc/calcdetails.html">calculation details</a> page documents the formulas this tab implements.`,
  },
  {
    id: "antarctic-programs",
    html: `<a href="https://www.bas.ac.uk/">British Antarctic Survey</a>, <a href="https://www.antarctica.gov.au/">Australian Antarctic Program</a> and the <a href="https://www.usap.gov/">United States Antarctic Program</a> — station positions, and the live webcams and daily reports from which the daylight answers in Experiment 6b can be read directly rather than taken on anyone's word. The stations sit at very different longitudes, which is the whole point of asking them at the same instant.`,
  },
  {
    id: "bsrn",
    html: `A. Driemel et al., “Baseline Surface Radiation Network (BSRN): structure and data description (1992–2017)”, <em>Earth Syst. Sci. Data</em> 10 (2018) 1491–1501; the station-month datasets of March, June and December 2019 on <a href="https://doi.org/10.1594/PANGAEA.880000">PANGAEA</a>: one-minute downward short-wave irradiance. Read by <code>fog build sun-bsrn</code>.`,
  },
  // Rømer à rebours sur les vraies éclipses (2026-11-25, fog build sun-romer) : n9 à n16
  {
    id: "lieske86",
    html: `J. H. Lieske, <em>Astron. Astrophys. Suppl.</em> 63 (1986) 143–202, and <em>Astron. Astrophys.</em> 154 (1986) 61–76 — the compilation of eclipses of the Galilean satellites: 16,802 timings from 426 observatories; the raw file is at the <a href="https://ftp.imcce.fr/pub/NSDC/jupiter/raw_data/phenomena/eclips/">IMCCE Natural Satellites Data Center</a> (1652-1983_J1-4_lieske.data.txt), the one this section reads.`,
  },
  {
    id: "lieske83",
    html: `J. H. Lieske, <a href="https://doi.org/10.1017/S0252921100096925">“A collection of Galilean satellite eclipses 1652–1982”</a>, in <em>Dynamical Trapping and Evolution in the Solar System</em> (Reidel, 1983) 51–59 — Delisle's manuscripts at the Paris Observatory and Pingré's <em>Annales célestes</em>: Delambre's collection, thought lost; the reduction of local apparent times, and a longitude found from the residuals (Hoai-Ngan, Huai'an).`,
  },
  {
    id: "standish",
    html: `E. M. Standish, <a href="https://ssd.jpl.nasa.gov/planets/approx_pos.html">“Keplerian Elements for Approximate Positions of the Major Planets”</a> (JPL Solar System Dynamics), Table 2a (3000 BC – AD 3000): the angles of the Earth's and Jupiter's orbits used here.`,
  },
  {
    id: "espenak-dt",
    html: `F. Espenak and J. Meeus, <a href="https://eclipse.gsfc.nasa.gov/SEhelp/deltatpoly2004.html"><em>Five Millennium Canon of Solar Eclipses</em>, NASA/TP-2006-214141, §2.6</a> — ΔT = TT − UT since 1600, after Morrison and Stephenson (lunar occultations and eclipse records).`,
  },
  {
    id: "lieske80",
    html: `J. H. Lieske, “Improved ephemerides of the Galilean satellites”, <em>Astron. Astrophys.</em> 82 (1980) 340–348 — the mean motions of Io and Europa, and the Laplace resonance (n₁ − 3n₂ + 2n₃ = 0) that keeps the conjunctions of Io and Europa at Io's perijove.`,
  },
  {
    id: "de440",
    html: `R. S. Park, W. M. Folkner, J. G. Williams and D. H. Boggs, <a href="https://doi.org/10.3847/1538-3881/abd414">“The JPL Planetary and Lunar Ephemerides DE440 and DE441”</a>, <em>Astron. J.</em> 161 (2021) 105 — used only for the shape of the orbits, as a check.`,
  },
  {
    id: "spaceaudits-romer",
    html: `AlanSpaceAudits (Aether Cosmology Research Group), <a href="https://publish.obsidian.md/spaceaudits/Null_Hypothesis/Speed_of_Light/Romer_Method_Null">“Rømer's Method with Modern Ephemerides, A Speed-of-Light Null Test”</a>, and its code, <a href="https://github.com/AlanSpaceAudits/romer_c">github.com/AlanSpaceAudits/romer_c</a> (read 25 November 2026).`,
  },
  {
    id: "birge",
    html: `R. T. Birge, “The calculation of errors by the method of least squares”, <em>Phys. Rev.</em> 40 (1932) 207–227 — the ratio by which the error of a mean is widened when its parts disagree more than their errors allow.`,
  },
];

/** Bloc "Further reading" du legacy : non cité, aucune affirmation ne repose dessus. */
export const FURTHER_READING = [
  `<a href="https://gallica.bnf.fr/ark:/12148/bpt6k56527v/f234.image">« Démonstration touchant le mouvement de la lumière trouvé par M. Rœmer », <em>Journal des Sçavans</em>, 7 December 1676, pp. 233–236 — digitised by the Bibliothèque nationale de France</a>. Four pages, in the original French, reporting Rømer's argument to the Académie: the eclipses of Io run late when Earth is receding and early when it is approaching, therefore light takes time. It is the first measurement of a solar-system distance scale that did not depend on the parallax expeditions, and you can read the original rather than an account of it.`,
  `<b>Edmond Halley, "Methodus singularis quâ Solis Parallaxis sive distantia à Terra…", <em>Philosophical Transactions</em> 29 (1716), 454–464.</b> The proposal that sent the transit expeditions out: observe the transit of Venus from widely separated latitudes, time the contacts, and the difference gives the solar parallax. Halley knew he would be dead before the 1761 transit and wrote it for whoever came after.`,
  `<b>IMCCE (Observatoire de Paris) and NASA JPL Horizons.</b> Two independent ephemeris services, one French, one American. Any number in this tab can be regenerated in either, from institutions with no stake in this page's argument.`,
];
