# Seismic Rayleigh-wave arrival data — raw material for epic05's radius-reconstruction idea

Not part of the built site. This is a local staging area: raw bulletin
downloads plus one cleaned CSV/JSON, gathered 2026-09-19 to test the
owner's idea (box-plot reconstruction of Earth's radius from real
earthquake arrival-time data, same statistical pattern as `surv`'s
`svFigR()`/`svRadii()`/`ctStats()`).

## Adding a new earthquake (2026-09-19, generic pipeline)

Add one entry to `events.json` (key, name, date, origin time, epicentre,
`min_mag`, and the ISC search window — see the existing 8 for the shape),
then run `tools/bin/fog fetch seis-radius`, `fog lock seis-radius` and
`fog build seis-radius` (epic24; `make fog` builds the binary). Fetch gets the raw
bulletin (skipped if `raw/<key>.isf` already exists); build
reparses **every** event in the manifest into `lr_arrivals.json`/`.csv`,
re-classifies every path's ocean fraction against the Natural Earth land
polygons (`raw/ne_50m_land.geojson`, hashed in `inputs.lock` since 2026-10-14;
until then they were downloaded afresh at every run), and regenerates `src/data/presets/seis-radius.js` — the file the
`seis` tab actually ships. Nothing else needs editing for the box plots,
table or readout to pick up the new event: `seisRadiusGroups()` and
`seisRadiusFigGeneric()` in `src/tabs/seis/logic.js`/`seis-legacy.js` size
themselves from the data. What is NOT automatic: the tab's own prose
sentences that quote the row/earthquake count in words (e.g. "474 real
... arrivals ... eight real earthquakes") are hand-written text, not
templated, and need a one-time manual update in
`src/data/prose/seis.js` + the 4 translated `seis-prose.json` files after
a count-changing run — see `tasks/epic05/UC02.org`.

## Source

International Seismological Centre (ISC) On-line Bulletin, queried via
its public CGI web service (`http://www.isc.ac.uk/cgi-bin/web-db-run`,
`out_format=ISF2`, `request=COMPREHENSIVE`, `include_phases=on`), one
query per event, global search restricted to a ~1-1.5 hour window
around each event's known origin time and a minimum magnitude filter.
Format: IASPEI Seismic Format (ISF) 2.1 — spec at
`http://www.isc.ac.uk/standards/isf/download/isf21.pdf`.

**Citation required by ISC for any use of this data:**
International Seismological Centre (2026), On-line Bulletin,
https://doi.org/10.31905/D808B830

## What's here

- `events.json` — the manifest read by `fog build seis-radius` (`dataset.json` describes the dataset).
  Edit this to add/change an earthquake; nothing else in this folder
  should be hand-edited (the script regenerates `lr_arrivals.*` and
  `src/data/presets/seis-radius.js` from it every run).
- `raw/*.isf` — the 9 raw bulletin dumps, one per earthquake, exactly as
  returned by the ISC query (HTML wrapper + `<pre>` block with the
  origin solutions and every phase reading from every contributing
  network). Kept for provenance / reproducibility, not meant to be
  parsed at build time.
- `lr_arrivals.csv` / `.json` — cleaned dataset extracted from the raw
  files: one row per (event, station) pair with a usable **LR** (or
  `MLR`) phase reading, i.e. a timed Rayleigh-wave arrival contributing
  to that station's *Ms* surface-wave magnitude. Columns: `event`,
  `event_name`, `event_date`, `origin_time_utc`, `epi_lat`, `epi_lon`,
  `station`, `sta_lat`, `sta_lon`, `distance_deg` (great-circle angle
  from the *coordinates*, computed the same way as `seisDelta()` in
  `src/tabs/seis/logic.js` — not read off the ISC bulletin's own
  printed distance column, to avoid inheriting whatever radius ISC's
  own software assumed), `travel_time_s` (median across all reporting
  agencies when a station has more than one pick), `n_picks`,
  `pick_spread_s`.

## The 9 events

| key | event | M | why chosen |
|---|---|---|---|
| sumatra2004 | Sumatra-Andaman, 26 Dec 2004 | 9.1 | already in `SEIS_EVENTS` |
| nias2005 | Nias, Sumatra, 28 Mar 2005 | 8.6 | same region, different year |
| tohoku2011 | Tōhoku, 11 Mar 2011 | 9.1 | already in `SEIS_EVENTS` |
| maule2010 | Maule, Chile, 27 Feb 2010 | 8.8 | replaces the 1960 Chile event — see below |
| illapel2015 | Illapel, Chile, 16 Sep 2015 | 8.3 | different decade, same subduction zone |
| solomon2013 | Solomon Islands, 6 Feb 2013 | 8.0 | Pacific, different quadrant |
| alaska2021 | Chignik, Alaska, 29 Jul 2021 | 8.2 | high latitude, different quadrant |
| kuril2006 | Kuril Islands, 15 Nov 2006 | 8.3 | added 2026-09-19 to test the generic pipeline: NW Pacific, a quadrant none of the other 7 touch |
| tonga2022 | Hunga Tonga–Hunga Haʻapai eruption, 15 Jan 2022 | 5.8 (seismic) | added 2026-09-19, owner's request ("would be cool") — NOT a tectonic earthquake: an explosive, atmospheric-coupled eruption whose Lamb wave excited anomalously large global Rayleigh waves for its modest conventional magnitude. Only 5 usable timed LR picks (vs. 19-146 for the other eight) — small-n on purpose, not hidden; its own median comes out ~4-9% LOW rather than high, unlike most of the other eight. |

**All nine have digital, broadband-era global recording** — the same
requirement that ruled out the 1960 Chile event below.

**The 1960 Valdivia (Chile) M9.5 event in `SEIS_EVENTS` was NOT
re-fetched for this**: checked first — ISC's pre-1964 holdings for it
come from the old International Seismological Summary and carry almost
no digitized surface-wave (LR) picks, just a handful of P-wave times.
Not usable for this method. Maule 2010 covers the same region with
real digital-era data instead.

## Method (reverse-engineering R) and an honest caveat already found

For each row: `distance_km = v × travel_time_s` (v = an assumed,
citable Rayleigh group velocity, NOT fitted to this data — fitting v to
force the right answer would make the whole exercise circular), then
`R = distance_km / (distance_deg in radians)`. Same shape as the
reciprocal-zenith-angle reconstruction already in `surv`.

**Already checked, before writing any tab code:** with a plausible
constant `v` (3.5–4.0 km/s, the usual range quoted for ~20 s-period
Rayleigh waves), the median reconstructed R lands **6–9 % above the
true 6371 km**, with roughly a ±25 % IQR — real crustal heterogeneity
(oceanic vs. continental paths have measurably different Rayleigh
group velocity), not agency-to-agency noise: switching from "first
reading found" to "median of all readings per station" changed nothing,
and restricting to teleseismic distances (≥40°, ≥60°) didn't tighten
the spread either. This is a real, honest result, not a small-scatter
"pins the value" result — CLAUDE.md rule 6 says to admit exactly this
kind of limitation in the page text rather than hide it. The box plot
will still center in the right neighborhood with real data; it will
just be visibly wider than `surv`'s reciprocal-zenith-angle one, and
that's worth saying explicitly rather than cherry-picking a velocity to
make it look tighter than it is.

## Resolved: v, and where this ended up shipping

`v = 3.5 km/s`, a round mid-range value for the Ms_20 band (18-22 s) drawn
from the general Rayleigh-dispersion literature (Shearer, *Introduction to
Seismology*, ch. 8) — deliberately DIFFERENT from the `SEIS_V = 3.8 km/s`
already used elsewhere on the `seis` tab, which is annotated for 100-200 s
waves (longer period, samples deeper/faster material, genuinely a different
number for a different wave). Not fitted to the data: fixed from the period
band before computing a single radius. With the original 7-earthquake,
442-row set this v put the combined median **~7.5% above 6371 km**, IQR
roughly [-8%, +18%] — matches the "6-9% high" sanity check above closely
enough to confirm it wasn't a fluke of the round test velocities used at
that stage. (With the 8th earthquake added below, 474 rows, the number
moves slightly — see the live readout in the tab rather than a number
frozen here.)

Shipped in the `seis` tab itself (not a new tab — the owner's explicit
choice) as a new section "The reverse-engineering, done for real": a
box-plot figure (`seisRadiusFig`, one box per earthquake + all combined),
a summary table and readout, and a callout stating the honest result in
the page's own voice, per the owner's explicit instruction to keep the
imperfection rather than engineer it away ("J'aime que ce soit pas
parfait — ça montre que c'est du concret"). Data trimmed into
`src/data/presets/seis-radius.js` ([distance_deg, travel_time_s] pairs
grouped by event). See `tasks/epic05/UC02.org` for the full implementation
trace and citations.

## Second panel, 2026-09-19: an ocean/continent path correction

Owner's follow-up idea: since the residual scatter above is blamed on
Rayleigh-wave dispersion between oceanic and continental crust, could a
per-path correction (fraction of the great-circle route over ocean) tighten
it? Yes, genuinely, and it stayed non-circular:

- Found T. M. Hearn (2024), *Global Rayleigh Wave Attenuation and Group
  Velocity from ISC Data* (Geosciences 14(2), 50) — the SAME ISC-bulletin
  data family as these arrivals, tomographically imaged at ~20 s: global
  oceanic group velocity ≈3.6 km/s, and a continental example (2.97 km/s,
  South America) the paper endorses as ISC-consistent. Both fixed from this
  independent source, never fit to our own rows.
- Each real great-circle path (epicentre coordinates to station
  coordinates, kept in `lr_arrivals.json`) is re-sampled (~0.5° steps) and
  classified land/ocean against Natural Earth's 1:50m land polygons —
  fetched fresh, explicitly NOT the project's existing `src/data/coasts.js`,
  which is heavily simplified and marked decorative in its own header
  comment ("no page claim relies on it"). Point-in-polygon classifier and
  great-circle slerp sampling written from scratch (stdlib Python only, no
  shapely/geopandas available on this machine). `ocean_frac` baked into
  `src/data/presets/seis-radius.js` as a third value per row.
- Result (7 earthquakes, 442 rows): combined median bias dropped from
  +7.5% (single v) to **+4.2%**, and the combined IQR narrowed from ~26%
  of R to ~19%. Real, verified by a dedicated test (`the ocean/continent
  correction narrows the spread and the bias without erasing either`)
  that also asserts the residual stays non-zero — a two-value
  ocean/continent split is a coarse model of a real continuum (crustal
  age/thickness vary continuously), so it should tighten, not erase, the
  scatter. Framed that way in the tab's callout rather than presented as
  a clean fix.
- Shipped as a second box-plot panel ("Correcting for where the wave
  actually travelled") right after the first, same layout, directly
  comparable row by row. Two new sources appended: [16] Hearn 2024, [17]
  Natural Earth 1:50m land.
- The whole harvest→parse→classify→regenerate pipeline was then extracted
  into `scripts/build_seis_radius.py`, driven by `events.json`, and an 8th
  earthquake (Kuril Islands 2006, a genuinely new quadrant) was added
  purely by editing the manifest and rerunning the script, to prove the
  pipeline is actually reusable rather than one-off code in a scratch
  directory. See the "Adding a new earthquake" section above.

## Third panel, same day: a histogram per earthquake, and a real-data replay

Two more owner requests landed in the same session:

- **A 9th event, Tonga 2022** (see the table above) — tests the pipeline
  again, and its own median lands on the *other* side of 6371 km from
  most of the rest, exactly what was being tested for.
- **The tab's opening claim (flat map ≠ globe on arrival time), redone
  with real recorded times instead of computed ones, per real earthquake.**
  For every one of the 479 real arrivals, the flat map's own distance
  (north-polar azimuthal-equidistant, same projection used throughout
  `seis`) is turned into a predicted arrival time at the box plot's 3.5
  km/s, then compared against the clock time that real station actually
  recorded. Nine small-multiple histograms, one per earthquake — no
  combined one, since the point is to see each event's own shape,
  including Tonga's thin n=5 one looking visibly different from the
  others (a sample-size fact, called out explicitly rather than hidden).
  New logic: `seisFlatDisagreementMin`/`seisFlatDisagreementGroups`
  (`src/tabs/seis/logic.js`, mirrored in `seis-legacy.js`).
- **The wavefront animation now replays real data.** Previously it only
  ever showed a toy 3-event/7-station demo with everything computed
  (arrival times included) — that demo still exists, now decoupled into
  its own `seisDemoEv` state feeding table 1 and the opening travel-time
  figure only. The animation itself was repurposed: pick any of the 9
  real earthquakes from a new selector, and each real station's dot
  switches on at its own recorded `travel_time_s`, not a computed one.
  The wavefronts themselves are still necessarily computed geometry (there
  is no way to draw a literal wavefront otherwise), now at the box plot's
  3.5 km/s instead of the demo's 3.8. The old per-station timeline side
  panel (sized for exactly 7 stations) was dropped — real events range
  from 5 to 146 stations, so the map now shows dots only plus an aggregate
  "X/N reached" count. New logic: `seisRealAnimHits`
  (`src/tabs/seis/logic.js`, mirrored in `seis-legacy.js`).

Both required the preset to carry station code + lat/lon (and each
event's own lat/lon) in addition to distance/time/ocean_frac —
`scripts/build_seis_radius.py`'s `write_preset()` was extended
accordingly; rerunning it after the events.json changes above regenerated
`src/data/presets/seis-radius.js` with the richer per-row shape
`[station, sta_lat, sta_lon, distance_deg, travel_time_s, ocean_frac]`.

Verified interactively (not just "no exception"): a throwaway linkedom
script confirmed switching the real-event selector actually changes the
displayed event name and station count (Sumatra 19 → Tonga 5), and that
clicking a demo button changes table 1's numbers while leaving the
real-replay animation's own reads untouched — the decoupling works as
designed. `node --test` 203/203, `mount-smoke` 20/20, `npm run audit`
clean.

## Fourth round, same day: dropped the leftover demo buttons, and swapped the histograms for a regression chart

Two owner corrections landed after the above:

- **The 3-button demo selector (Sumatra/Tōhoku/Chile) was removed.** It
  drove only table 1 and the opening travel-time figure after the
  decoupling above, and with real earthquakes now selectable everywhere
  else on the tab, keeping a second, separate demo selector was pure
  clutter — flagged directly by the owner ("artifacts of button ... not
  necessary anymore"). Table 1 / the opening figure now always show the
  one fixed Sumatra 2004 worked example (`SEIS_DEMO_EV`), no switcher.
  Also fixed along the way: the `<select>` for the real-station replay
  had `class="presetbtn"` (a button style) instead of relying on the
  `.preset-row select` rule `legacy.css` already defines for exactly this
  — using the wrong class was a second, smaller instance of the same
  "unnecessary artifact" complaint.
- **The 9 per-earthquake histograms (previous round) were the wrong
  interpretation of "one histogram per dataset" and were removed
  entirely.** What the owner actually wanted: for one real earthquake at
  a time (a selector), a scatter of its real (great-circle distance,
  recorded arrival time) points, a plain least-squares regression line
  fitted through that cloud with **no wave speed assumed**, plus two
  theoretical reference lines at the box plot's 3.5 km/s — one for what
  the globe predicts, one for what that earthquake's own flat-map
  distances (median flat/globe distance ratio across its real stations)
  would predict. New logic: `seisRegressionFit`, `seisMedianFlatRatio`,
  `seisRegressionData` (`src/tabs/seis/logic.js`, mirrored in
  `seis-legacy.js`), replacing `seisFlatDisagreementMin`/
  `seisFlatDisagreementGroups` entirely (deleted, not deprecated).
- **Honest finding surfaced while testing it**: per-earthquake, the fit
  does NOT reliably land closer to the globe line than the flat one —
  Sumatra 2004 (n=19, the box plot's own worst-behaved case at +20% off)
  fits at 3.06 km/s, closer to its own flat expectation (3.19) than the
  globe's (3.50). Alaska 2021 (n=146) fits at 3.47 km/s, almost exactly
  on the globe line. Tonga 2022 (n=5) swings to 3.69 km/s, close to
  neither. This is real dispersion/small-sample noise, not a bug (a test
  originally asserted "globe is always closer" and had to be corrected
  to test the *pooled* 479-row fit instead, which does land closer to
  globe) — the tab's new callout explains this directly rather than
  picking a flattering default earthquake to hide it.
- Two now-dead figkey swatches (`seisbar`/`seistick`, from the animation's
  removed per-station timeline panel) were deleted from
  `src/core/symbols.js`; two new ones added (`seisdotink`, `seisfitink`)
  for the regression chart's legend.
- Verified interactively again: switching the regression selector changes
  the fitted v, n and both theoretical values correctly for all three
  spot-checked earthquakes (Sumatra/Alaska/Tonga above). `node --test`
  205/205, `mount-smoke` 20/20, `npm run audit` clean.

## Fifth round, same day: the legend didn't match the drawing

Owner caught a real design flaw right after the above: "flat-map
expectation" was drawn as a second straight line at a *rescaled slope* of
the *same* globe-distance x-axis (median flat/globe ratio × km / v) — a
line that doesn't correspond to any real x-position a flat map actually
claims, plotted on an axis explicitly labelled "great-circle distance."
The legend also called the globe line "teal" while the code drew it in
`C.globe` (blue) — a second, independent mismatch, from copy-pasting
figkey conventions.

Fixed by going back to the tab's own established pattern (the opening
`drawSeisTT` figure already does this, with computed data): each real
arrival is now plotted **twice** at its one real recorded time — once at
its true great-circle distance (dark dot), once at what the flat map's
own distance for the same two coordinates would be (orange dot) — joined
by a thin grey connector. There is only **one** speed line now
(distance ÷ 3.5 km/s, blue, dashed): a fact about the assumed speed
alone, not a second "model" line, which is what the owner's confusion was
correctly flagging ("the speed should be the same, right?" — yes, and now
there's only one speed line to prove it). `seisRegressionData()` changed
shape: each point carries `{kmG, kmF, t}` instead of a single `km`; the
median flat/globe ratio (`seisMedianFlatRatio`, kept) moved from a drawn
line into the text readout ("its own flat map claims ~X% more distance,
on average"). Two new figkey swatches added (`seisdotflat`, `seisconn`);
the now-wrong `seisreglineflat` swatch removed. `node --test` 206/206,
`mount-smoke` 20/20, `npm run audit` clean.

## Sixth round, same day: the projection's own fingerprint, by colatitude

Owner's next idea: the R1/R2/R3 section already CLAIMS in prose that
northern stations agree with the globe while southern ones drift ("the
signature of a projection"), but never showed it with real data. Owner
asked for it "to be fair" — each model's own prediction compared against
the SAME real recorded time (not flat vs. globe compared to each other) —
and on colatitude (0°–180° from the true north pole, the AE map's own
centre and radial coordinate), not signed latitude, since that is the
variable the projection's distortion actually depends on.

Checked with real data before building anything (per the standing
practice this session): pooled across all 479 real arrivals, 15°-wide
colatitude bands, average "lateness" (predicted time minus real time) for
each model —

    colat [  0, 15) n=  2  globe= -6.1 min  flat=  -6.1 min
    colat [ 75, 90) n= 63  globe=  1.7 min  flat=   6.8 min
    colat [150,165) n= 11  globe= -2.4 min  flat=  46.7 min
    colat [165,180) n=  7  globe= -2.8 min  flat=  68.0 min

The globe's own residual stays bounded (±6 min) at every colatitude, with
no trend; the flat map's residual grows to over an hour near the
antipode. New logic: `seisLatenessBins()` (`src/tabs/seis/logic.js`,
mirrored in `seis-legacy.js`), pooling all nine earthquakes (this is a
property of the map projection, not of which quake). New figure
`seisLatenessFig`: two solid line-and-dot series (globe blue, flat
orange) against colatitude, zero-line dashed. Two new figkey swatches
(`seislatglobe`, `seislatflat`) — deliberately solid, not reusing the
regression chart's dashed speed-line swatch, after the previous round's
legend mismatch. `node --test` 207/207 (kept the globe-residual bound and
the north/south growth as explicit assertions), `mount-smoke` 20/20,
`npm run audit` clean. Verified interactively that the live readout
matches the diagnostic numbers above exactly.

## Hunga Tonga pressure wave (`tonga/`, epic05/UC05, 2026-10-03)

Separate from the ISC pipeline above. `fog fetch seis-tonga` (until 2026-10-14
`scripts/build_tonga_lamb.py`; `fog build seis-tonga` then compiles, no network)
fetches US ASOS one-minute pressure (Iowa Environmental Mesonet, open) for
2 stations per state into `tonga/raw/` (21 MB, git-ignored, refetched on
demand), picks the short-path (A1) and long-path (A2) arrivals of the
15 January 2022 Lamb wave without any Earth model, and writes
`tonga/picks.json`/`.csv` plus `src/data/presets/seis-tonga.js`.
See `tools/internal/build/tonga/` and `tasks/epic05/UC05.org`.
