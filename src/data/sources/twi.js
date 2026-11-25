// Sources de l'onglet twi, portées à l'identique du legacy
// (flat-or-globe-2.20.0.html, ~L12128-12175, bloc .srcs de tab-twi).
// L'ordre EST la numérotation [n] (voir src/core/citations.js).
export const SOURCES = [
  {
    id: "usno-rst-defs",
    html: `<a href="https://aa.usno.navy.mil/faq/RST_defs">United States Naval Observatory, Astronomical Applications Department, <em>Rise, Set, and Twilight Definitions</em></a> — the definitions used throughout this tab, in the words of the institution that publishes the tables: civil, nautical and astronomical twilight at 6°, 12° and 18° of geometric depression of the Sun's centre, with the caveat that what you can actually see also depends on the weather.`,
  },
  {
    id: "spitschan-2016",
    html: `<a href="https://doi.org/10.1038/srep26756">M. Spitschan, G. K. Aguirre, D. H. Brainard &amp; A. M. Sweeney, "Variation of outdoor illumination as a function of solar elevation and light pollution", <em>Scientific Reports</em> 6, 26756 (2016)</a> — open access, with the spectra and the analysis code published: downwelling irradiance measured minute by minute from full day to full night at a dark-sky park and in a city, and the source of the 10<sup>8</sup> day-to-night figure, which the authors had to cover with two different spectrometers.`,
  },
  {
    id: "hulburt-1953",
    html: `<a href="https://doi.org/10.1364/JOSA.43.000113">E. O. Hulburt, "Explanation of the brightness and color of the sky, particularly the twilight sky", <em>Journal of the Optical Society of America</em> 43, 113 (1953)</a> — the classical calculation of twilight brightness from the illuminated shell above the observer, including the ozone absorption that makes the twilight sky blue rather than red.`,
  },
  {
    id: "rozenberg-1966",
    html: `G. V. Rozenberg, <em>Twilight: A Study in Atmospheric Optics</em> (Plenum Press, New York, 1966), translated from the Russian — the monograph on the subject: the shadow geometry, the twilight rays, the purple light and the way the brightness curve is read as a sounding of the upper atmosphere. Cited without a link because no stable open copy exists; the full reference is given so it can be found in a library.`,
  },
  {
    id: "lee-hernandez-2003",
    html: `<a href="https://doi.org/10.1364/AO.42.000445">R. L. Lee &amp; J. Hernández-Andrés, "Measuring and modeling twilight's purple light", <em>Applied Optics</em> 42, 445–457 (2003)</a> — measured twilight colours and radiances against a multiple-scattering model; the reason this page's note insists that twilight brightness is not a one-line formula.`,
  },
  {
    id: "lynch-livingston",
    html: `D. K. Lynch &amp; W. C. Livingston, <em>Color and Light in Nature</em>, 2nd edition (Cambridge University Press, 2001), chapter 3 — the standard descriptive reference for the anti-twilight arch, the Belt of Venus and the shadow's rise rate, with photographs. Unlinked for the same reason as [4].`,
  },
  {
    id: "nasa-sun-fact",
    html: `<a href="https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html">NASA Space Science Data Coordinated Archive, <em>Sun Fact Sheet</em></a> — the Sun's apparent diameter as seen from Earth, 31.6′ to 32.7′ over the year, which is the measurement the flat model's brightness–size relation has to survive.`,
  },
  {
    id: "usno-rs-oneyear",
    html: `<a href="https://aa.usno.navy.mil/data/RS_OneYear">United States Naval Observatory, <em>Table of Sunrise/Sunset, Moonrise/Moonset, or Twilight Times for an Entire Year</em></a> — where to get the printed answer for your own coordinates, to check the calculator on this page against. Ask for twilight rather than sunrise, and ask for a latitude above 48.6° in June to see the dashes.`,
  },
  {
    id: "noaa-solcalc",
    html: `<a href="https://gml.noaa.gov/grad/solcalc/">NOAA Global Monitoring Laboratory, <em>Solar Calculator</em></a> — an independent implementation of the same solar position formulae, from a different institution in a different country's service, for anyone who would rather not trust either this page or the Navy.`,
  },
  {
    id: "brown-1952",
    html: `D. R. E. Brown, <em>Natural Illumination Charts</em>, Report No. 374-1, Research and Development Project NS 714-100, Bureau of Ships, Department of the Navy (September 1952) — the measurements from which the standard illuminance-against-solar-elevation curves descend, still cited in the current literature. Unlinked: the scanned report is not stably hosted, and the retypings that circulate have a documented figure-labelling error.`,
  },
  {
    id: "timeanddate-99",
    html: `<a href="https://www.timeanddate.com/news/astronomy/99-percent-sunlight-july-8">K. Bikos, <em>Fact Check: 99% of the World's Population Gets Sunlight at the Same Moment on July 8</em> (timeanddate.com)</a> — the fact-check itself, with the method stated: their own solar data crossed with the 2022 gridded population estimates from the Center for International Earth Science Information Network at Columbia University. It is also the source of the honest qualification quoted above, that roughly 3% of the total is in astronomical twilight and would call it night.`,
  },
  {
    id: "earthsky-99",
    html: `<a href="https://earthsky.org/earth/99-percent-worlds-population-receive-sunlight/">EarthSky, <em>99% of the world's population in sunlight July 8 … and other dates</em></a> — the follow-up showing that the effect is not a one-day curiosity: the share stays above 98% for roughly two months around the June solstice, and the daily maximum falls between 11:00 and 11:03 UTC on almost every one of the top thirty days.`,
  },
];

export const FURTHER_READING = [
  `<b>C. F. Bohren &amp; E. E. Clothiaux, <em>Fundamentals of Atmospheric Radiation</em> (Wiley-VCH, 2006).</b> The scattering physics behind twilight colour and brightness, at the level needed to check the claims in this tab rather than accept them.`,
];
