# data/ — raw material and datasets

Everything the site's numbers are computed from lives here. Nothing in this
directory is served; `fog` (the Go data compiler in `tools/`, epic24)
turns it into the generated files under `src/data/`.

A **dataset** is a directory with a `dataset.json` manifest and an
`inputs.lock`. Directories without a manifest are raw material that is
still handled by a Python script in `scripts/` (being ported, see
`tasks/epic24/`).

## Commands

    make fog                       # build tools/bin/fog
    tools/bin/fog validate         # check every dataset.json, its files and its lock
    tools/bin/fog fetch <id>       # download missing inputs (URL or the dataset's fetcher)
    tools/bin/fog fetch --refresh <id>   # re-read what is cached (new pages, new API answers)
    tools/bin/fog lock <id>        # hash the inputs into inputs.lock, after checking them
    tools/bin/fog build <target>   # compile, no network; `all` for every target
    make ci                        # the local CI (validate, build --check, tests, smoke)

`fog build` never touches the network: it reads only files on disk, so the
same inputs always give the same bytes. `fog fetch` is the only command that
downloads; TLS is always verified, and a file whose SHA-256 differs from its
lock is refused, never silently replaced.

## dataset.json (schema_version 1)

| field | required | meaning |
|---|---|---|
| `schema_version` | yes | `1` |
| `id` | yes | lowercase, digits and dashes; unique |
| `title` | yes | what the data is, in one line |
| `tab` | yes | the `src/tabs/<tab>` that uses it |
| `build` | yes | `fog:<target>` (see `fog list`), or `script:scripts/x.py` until ported |
| `kind` | yes | how the raw material was obtained: `transcription`, `archive`, `scrape`, `api`, `instrument`, `photo` |
| `evidence` | yes | the best class the data can support (CLAUDE.md, rule 10): `measure`, `check`, `model` |
| `radius_enters_via` | for `check` | `[{field, how}]`: every field a globe model touched (km from coordinates, WGS84/GRS80, IGRF…). Must be empty for `measure` |
| `verdict_rule` | unless `model` | what result would vindicate the flat model (rule 5), as the page states it |
| `license` | yes | `public-domain`, `CC0-1.0`, `CC-BY-4.0`, `CC-BY-SA-4.0`, `ODbL-1.0` or `other` |
| `license_note` | for `other` | the terms and where they are |
| `sources` | yes | `[{cite, url?}]` |
| `collected` | yes | `YYYY-MM-DD` or `YYYY-MM-DD/YYYY-MM-DD` |
| `units` | yes | unit and convention of every quantity (`"t": "h after 0 h GMT"`, `"lon": "deg, E positive"`) |
| `inputs` | yes | `[{path}]` or `[{glob}]`, relative to the directory; `url` on a single path lets `fog fetch` get it; `gitignored: true` for files kept out of git (their absence is then a warning) |
| `outputs` | yes | generated files, under `src/data/` or this directory (never an input) |
| `notes` | no | anything a reader of the data should know |
| `public_raw` | yes | `yes`: the raw files may go into the public repository; `no`: only their hash and source are published |
| `public_raw_why` | for `no` | why (the terms that do not allow republishing, names of people in the file…) |
| `code` | yes | repo-relative files or directories of the code that turns the data into the page's numbers |
| `sections` | yes | `"tab/section"` of every page section that shows the data (the “code · data” button), `[]` for none |

Every input also says how it was obtained (2026-11-25, rule of transparency):

| input field | required | meaning |
|---|---|---|
| `how` | yes | `download`, `api`, `scrape`, `transcription`, `ours` (a list or a choice), `contributor` |
| `origin` | yes | where exactly: the archive and the request, or the publication, its pages and who typed it |
| `checks` | no | the checks the file went through (by the build or by a script) |
| `caveats` | no | what could still be wrong in it |
| `public_raw`, `public_raw_why` | no | override the dataset's for this input |
| `refetch`, `refetch_why` | for a source that no longer gives the same file | `"no"`, why, and where the values used can still be read |
| `verify_skip` | no | a regular expression of the lines that change at every download (a VizieR answer's date); `fog lock` then also writes `inputs.norm`, the hashes without them |

`fog verify <id>…` downloads the inputs again into a temporary directory (never into data/), runs the dataset's
fetcher there when it has one, and compares every file with the lock (and with `inputs.norm` when only the dated
lines differ); `refetch: "no"` inputs are skipped with their reason. It lets anyone check that the files the public
repository does not carry are the ones the site was computed from.

## .explain files

`fog build explain` (a meta target, part of `fog build all`) writes, beside every file of every
`inputs.lock`, a plain-text `<file>.explain`: what it is, its SHA-256, whether it is in the public
repository (and if not, why and where to get it), how it was obtained, its checks and caveats, the
licence, sources, evidence class, verdict rule, the code and the page sections. Files under a symbolic
link (data/sat/raw → ../gps/raw) get theirs in `<dataset>/explain/`. Every generated file of
`src/data/` gets one too, and `src/data/provenance.js` carries the same facts to the page. The
`.explain` files are committed even in the gitignored raw directories (see .gitignore): never edit
them, edit the manifest and rebuild.

Unknown fields are errors (a typo must not silently drop a field).

## inputs.lock

One line per input file, `sha256sum` format, sorted:

    55d046d86dbd45131cbab6e58c1f41f216fb84ad226b0c9902c48ed6220fa722  tables_3_4.csv

`cd data/<dir> && sha256sum -c inputs.lock` checks it without fog. A
changed, new or missing file fails `fog validate` until the lock is
rewritten with `fog lock <id>` — that is the moment to look at the change.
Generated files carry the hashes of their inputs in their header, so
`fog build --check` also fails when an input changed and nobody rebuilt.

## Adding data

1. Raw files into the dataset directory (or an input `url` / the dataset's
   fetcher, then `fog fetch <id>`).
2. `fog lock <id>`, `fog validate`.
3. `fog build <target>`, then the tab's tests (`node --test src/tabs/<tab>/*.test.js`).
4. Commit the manifest, the lock, the raw files that are not gitignored and
   the generated files together.

The outlier rule is the project's, without exception: a value is dropped
only beyond 3 standard deviations of the OTHER values (leave-one-out,
`tools/internal/stats.KeepLOO`), never by a percentage, and every drop is
counted in the output.

## Datasets today

| id | directory | target |
|---|---|---|
| `seis-krakatoa` | `seis/krakatoa/` | `krakatoa` |
| `seis-radius` | `seis/` | `seis-radius`, `seis-relocate` (slow), `seis-shadow` (slow) |
| `seis-tonga` | `seis/tonga/` | `seis-tonga` |
| `atmo-tonga-laps` | `atmo/tonga-laps/` | `atmo-tonga-laps` |
| `atmo-tsar` | `atmo/tsar/` | `atmo-tsar` |
| `land` | `land/` | `land` |
| `map-ptolemy` | `map/ptolemy/` | `map-ptolemy` |
| `moon-llr` | `moon/llr/` | `moon-llr` |
| `orb` | `orb/` | `orb` |
| `dip-atmos` | `dip/atmos/` | `dip-atmos` |
| `ref-bordighera` | `ref/bordighera/` | `ref-bordighera` (Open-Meteo ERA5 + marine; fetched) |
| `dip-mlo` | `dip/mlo/` | `dip-mlo` |
| `gps-raw` | `gps/` | `gps-raw` |
| `sat-doppler` | `sat/` | `sat-doppler` (lente) |
| `avia-flights` | `avia/flights/` | `avia-flights` |
| `avia-gravd` | `avia/gravd/` | `avia-gravd` |
| `ecl-nasa` | `ecl/` | `ecl` |
| `mag-obs` | `mag/` | `mag-obs` |
| `contrib-flightdip` | `contrib/flightdip/` | `contrib-flightdip` (Drive screenshots, Desmos table, GLO-90 tiles; all fetched) |
| `contrib-lomond` | `contrib/lomond/` | `contrib-lomond` (GLO-30 tiles, Leith gauge, Open-Meteo; all fetched) |
| `star-hip` | `star/hip/` | `star-hip` (two VizieR answers, in git) |
| `grav-tides` | `grav/tides/` | `grav-tides` (five UHSLC hourly sea-level records, ~80 MB, gitignored) |
| `grav-ticon` | `grav/ticon/` | `grav-ticon` (TICON-3 zip, 2.8 MB, gitignored) |
| `orb-pulsar` | `orb/pulsar/` | `orb-pulsar` (EPTA DR2 zip 39 MB and NANOGrav 15 yr tar.gz 639 MB, gitignored; our transcription of Ding et al. 2023, Table 5) |
| `orb-transit` | `orb/transits/` | `orb-transit` (our transcription of Newcomb 1891, 1769 timings and station positions; DE440 from `moon-eclcraters`) |
| `orb-radar` | `orb/radar/` | `orb-radar` (our transcription of Pettengill et al. 1962, Tables I-III; DE440 from `moon-eclcraters`) |
| `surv-excess` | `surv/excess/` | `surv-excess` (our transcription of Schott's SP 4 and SP 7 triangles and positions; PDFs gitignored) |
