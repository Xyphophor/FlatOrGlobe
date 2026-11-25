# Measured magnetic field — raw material for epic12

Not part of the built site. Staging area for the `mag` tab's test of the
globe and flat models against MEASURED magnetic inclination (dip angle,
not declination) and total field strength. Started 2026-09-27 (owner's
idea), made multi-source 2026-09-28.

## Adding a source (the only file to edit: `sources.json`)

Add one entry to `sources.json`, then run, from the repo root:

    tools/bin/fog fetch mag-obs        # fetch (cached in raw/<key>/); --refresh re-reads the WDC form
    tools/bin/fog lock mag-obs         # hash the new raw files into inputs.lock
    tools/bin/fog build mag-obs        # select, write (no network)
    node scripts/fit_mag_obs.mjs       # refit the flat layouts (~3 min on the owner's machine)
    node --test src/tabs/mag/*.test.js src/core/cards.test.js

An entry is `{key, kind, name, cite, url, ...options}`:

| kind               | what it reads                                                  | options |
|--------------------|----------------------------------------------------------------|---------|
| `wdc-annual-means` | BGS WDC observatory annual means (form `/cgi-bin/means`)        | `years` [from, to], `mean_codes` (default 1, 2, 4) |
| `wdc-survey`       | BGS WDC API `/global-geomagnetic-survey`                        | `years`, `types` ⊂ repeat-station, one-off, marine-vector, aeromag |
| `csv`              | a local file `data/mag/<file>`: columns code,name,lat,lon,year,I,F | `file` |

A new FORMAT needs a new adapter function in `tools/internal/build/mag/mag.go`
(returns rows and counts; see the three existing ones), one line in `adapters`,
and, if it downloads, a case in `fetch.go`.

What follows automatically: the tab's source selector, every figure,
table and number in the text (the prose carries `<span data-obsv="…">`
placeholders filled by `obsValues()` in `src/tabs/mag/obs-figs.js`), the
export cards (`{{…}}`), the CSV download, the exclusion counts.

What is NOT automatic, on purpose: the qualitative sentences around those
numbers ("the fitted flat disc is too shallow in both hemispheres", "the
globe's worst misses lie around the South Atlantic", …). Each one is
guarded by a `text: …` test in `src/tabs/mag/obs-logic.test.js`. If a new
source makes one false, that test fails: rewrite the sentence (5
languages), do not loosen the test. A new source also needs one line in
each `src/i18n/<lang>/mag.json` (`obs-src-<key>`, the selector label; the
manifest `name` is the fallback) and, for the reading list, an `<li>` at
the END of the mag sources (rule 8).

The globe side is never fitted (owner's rule, 2026-09-28): its numbers
all come from the IGRF-14 coefficients (`igrf14coeffs.txt`, parsed into
`src/data/presets/igrf14.js` by the build).

## Current sources (2026-09-28)

- `obs` — BGS World Data Centre for Geomagnetism (Edinburgh), *Worldwide
  Observatory Annual Means*,
  <https://geomag.bgs.ac.uk/data_service/data/annual_means.shtml>. Values
  supplied by the observatory operators: annual means of continuously
  recorded variometer data tied to absolute observations. 2015–2025, mean
  codes 1 (all days), 2 (quiet days), 4 (absolute observations only).
  186 sites. KLI did not answer on 2026-09-28 (rerun to retry).
- `survey` — BGS WDC *Global Survey Data*, via
  <https://wdcapi.bgs.ac.uk/global-geomagnetic-survey>: repeat stations
  and one-off survey stations, measured by national survey institutes.
  1990–2025; one site = one position to 0.01° (~1 km; the same station
  appears under several spellings), latest measurement kept. 2,147 sites,
  mostly Europe (46 %), the Americas (22 %) and Asia (18 %).

Both are measurements, not a field model — but IGRF/WMM are fitted to
data that include them, so comparing the data with the full IGRF would be
circular. The tab's globe side is the IGRF-14 centred dipole and the
off-centre dipole computed from IGRF-14 (Fraser-Smith 1987).

## Files

- `sources.json` — the manifest.
- `raw/<key>/` — cached downloads (delete a file to refetch it).
- `igrf14coeffs.txt` — the official IGRF-14 coefficient file.
- `measurements.csv` — every kept site, all sources (`src` column).
- `src/data/presets/mag-obs.js` — the same rows + `MAG_OBS_SOURCES`
  (counts, years, exclusion counts), shipped with the site.
- `src/data/presets/mag-obs-fit.js` — the flat layouts' fits (on I only).
- `src/data/presets/igrf14.js` — degree-1/2 IGRF-14 coefficients.

Longitudes are ±180°. Latitudes are geodetic; `obs-logic.js` converts
them to geocentric before taking the dipole-frame magnetic latitude.
