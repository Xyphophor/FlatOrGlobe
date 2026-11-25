// Sources de l'onglet mag, portées à l'identique du legacy
// (flat-or-globe-2.20.0.html, ~L11199-11228, bloc .srcs de tab-mag).
// Contrairement à dist/dip, ce bloc ne porte AUCUNE ancre [n] inline dans
// le legacy ("Nothing on this tab carries an inline [n] marker yet") --
// l'ordre ci-dessous est conservé pour rester fidèle mais rien dans
// index.js n'a besoin d'appeler cite() pour cet onglet.
export const SOURCES = [
  {
    id: "noaa-igrf",
    html: `<a href="https://www.ncei.noaa.gov/products/international-geomagnetic-reference-field">NOAA NCEI — International Geomagnetic Reference Field (IGRF)</a> — the standard model behind the "measured" columns; <a href="https://www.ngdc.noaa.gov/geomag/models.shtml">NOAA's geomagnetic models &amp; calculators</a> let you compute I and |B| for your own coordinates and check every number in the tables.`,
  },
  {
    id: "bgs-poles",
    html: `<a href="https://geomag.bgs.ac.uk/education/poles.html">British Geological Survey — Magnetic Poles</a> — dip poles vs geomagnetic (dipole) poles, why they differ and move, and the dipole axis tilt of about 10°; the BGS <a href="https://geomag.bgs.ac.uk/education/home.html">education pages</a> also cover smartphone magnetometers, the sensor Experiment 5 relies on.`,
  },
  {
    id: "suunto-balancing",
    html: `<a href="https://www.suunto.com/en-us/Support/Compasses-feature-index/Understanding-balancing-zones/">Suunto — Understanding balancing zones</a> — the manufacturer's own explanation of hemisphere-balanced needles and the global needle: the compass industry engineering built around the dip.`,
  },
  {
    id: "gilbert-demagnete",
    html: `<a href="https://www.gutenberg.org/ebooks/33810">William Gilbert, <em>De Magnete</em> (1600), full English translation at Project Gutenberg</a> — the terrella experiments and the conclusion that the Earth itself is a great magnet.`,
  },
  {
    id: "south-magnetic-pole-history",
    html: `<a href="https://www.antarctica.gov.au/magazine/issue-22-2012/science/a-timeline-of-scientific-highlights/">Australian Antarctic Program</a> and <a href="https://recollections.nma.gov.au/issues/vol_6_no_1/exhibition_reviews/quest_for_the_south_magnetic_pole">National Museum of Australia</a> — the 1909 David–Mawson–Mackay journey toward the South Magnetic Pole, the modern reassessment of how close they came, and Barton's 2000 fix within ~2 km of the drifting pole.`,
  },
  {
    id: "esa-swarm-weak-patch",
    html: `<a href="https://www.esa.int/Applications/Observing_the_Earth/FutureEO/Swarm/Swarm_reveals_growing_weak_spot_in_Earth_s_magnetic_field">ESA Swarm</a> and <a href="https://svs.gsfc.nasa.gov/4840/">NASA SVS</a> — the South Atlantic weak patch: the largest non-dipole anomaly, flagged with * in the tables above.`,
  },
  {
    id: "intermagnet",
    html: `<a href="https://intermagnet.org/">INTERMAGNET</a>, with data served through the <a href="https://imag-data.bgs.ac.uk/">BGS data portal</a>. Around 150 magnetic observatories worldwide, publishing definitive one-minute and one-second data, free to download. This is the check this tab most needs and has been missing. Everything in the tables above is read off a model; here are the measurements the models are fitted to. Take the observatories' latitudes, take their inclinations, plot one against the other, and see whether tan I = 2 tan λ falls out of data that nobody assembled to make this argument.`,
  },
  {
    id: "wmm",
    html: `<a href="https://www.ncei.noaa.gov/products/world-magnetic-model">NOAA NCEI / BGS — World Magnetic Model</a>. The operational model rather than the research one: the WMM is what runs in the compass app on your phone and in aviation and defence navigation systems, and it is rebuilt every five years because the field moves. A model that had the shape of the Earth wrong would be noticed by its users within weeks.`,
  },
  {
    id: "norman-1581",
    html: `Robert Norman, <em>The Newe Attractive</em> (London, 1581). The discovery of magnetic dip, by a London compass-maker who found that a needle he had balanced perfectly before magnetising it would afterwards tip downward, and had to trim it to make it lie level again. Nineteen years before Gilbert, and the more concrete of the two: it starts from a workshop annoyance.`,
  },
  {
    id: "halley-1701",
    html: `Edmond Halley, <em>A New and Correct Chart Shewing the Variations of the Compass</em> (1701). The first isogonic chart, drawn from measurements Halley made himself on two Atlantic voyages. The field's structure has been mapped continuously for over three centuries.`,
  },
  {
    id: "esa-vires",
    html: `<a href="https://vires.services/">ESA — VirES for Swarm</a>. Interactive access to the Swarm satellite magnetic measurements. The same verification as INTERMAGNET, from orbit instead of the ground, and again free.`,
  },
];
