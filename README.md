# Flat plane or Globe?

A static site that puts the flat-earth and globe models side by side against measurable evidence:
seismic waves, survey triangles, eclipses of Io, sunsets, tides, flight times, pressure waves of
volcanic eruptions, star positions and more. Every result is computed from public data by the code
in this repository, and every section of the site has a **code · data** button that leads here.

## The rule of transparency

Every number traces back to its files and its code.

- `data/<dataset>/dataset.json` describes a dataset: what it is, its sources, licence, evidence class,
  what result would vindicate the flat model, the code that uses it and the page sections that show it.
- Beside **every data file**, a `<file>.explain` says where it comes from exactly (the archive and the
  request, or the publication and its pages), how it was obtained (downloaded, or typed by hand from a
  scan, and by whom), the checks it went through, what could still be wrong in it, and its SHA-256.
- When a file's terms do not allow republishing it (for example FlightAware pages, VizieR copies,
  BSRN records), **only its hash and its source are here**, with the reason, in its `.explain`.
  Fetch it from the source (`fog fetch <dataset>`) and compare the hash.
- Large files are kept out of git for their size; their `.explain` and hash are here.
- Generated files (`src/data/presets/*.js`) carry the hashes of their inputs and their own `.explain`.

## Layout

`STRUCTURE.md` describes the tree in full, and how to follow a number of the site back to its files.

- `data/` — the raw material and the datasets (`data/README.md`).
- `tools/` — `fog`, the Go data compiler: `fog fetch`, `fog build`, `fog validate`
  (`go doc -all ./internal/build/<package>` gives each method with its formulas and references).
- `src/` — the site (plain JavaScript, Vite): one directory per tab in `src/tabs/`, shared code in
  `src/core/`, generated data in `src/data/`.
- `scripts/` — checks of the site without a browser (`mount-smoke.mjs`), the AI-mode pages.
- `research/` — exploratory scripts (Python), not needed to build anything.

## Build

    npm install
    npm run dev                      # the site, on http://localhost:5173
    make fog && tools/bin/fog build all   # regenerate src/data from data/ (no network)
    make ci                          # the local checks

## Licence

Code under MIT, content and computed data under CC BY 4.0 (see `LICENSE`). Third-party data keep the
licence of their source, given in each dataset's `dataset.json` and in each file's `.explain`.
