# Real flight times — raw material for the avia tab (epic14)

Not part of the built site. The `avia` tab compares measured airborne times
of long-haul flights with the distances each model gives.

## Adding a route (the only file to edit: `flights/routes.json`)

Add `{ "a": "SYD", "b": "SCL", "ab": [callsigns a->b], "ba": [callsigns b->a], "south": true }`
(ICAO callsigns as FlightAware lists them, e.g. `QFA27`; `south` = both
airports in the southern hemisphere, shown first). Then, from the repo root:

    tools/bin/fog fetch avia-flights   # new callsigns' pages (cached in flights/raw/), one every 3 s
    tools/bin/fog lock avia-flights    # hash the new raw files into flights/inputs.lock
    tools/bin/fog build avia-flights   # write the preset (no network)
    node scripts/fit_avia_flat.mjs     # refit the best free flat layout (~1 s)
    node --test src/tabs/avia/*.test.js

(`make fog` builds `tools/bin/fog`.) `fog fetch --refresh avia-flights` re-reads every callsign
(a new two-week window) and ADDS its flights to the raw file (the earlier
flights it no longer shows are kept, the file lists its readings in
`windows`): each refresh adds about two weeks of flights. Check that two
callsigns of a route are not the same aircraft (codeshares: TAM8084 and
LAN8084 were, 2026-11-07; one was removed). The dataset is described by `flights/dataset.json` (epic24). Kept per leg:
actual wheels-off / wheels-on, cancelled/diverted flags, the filed plan
(cruise speed, route, planned distance). A leg more than 3 standard deviations
from the mean of the OTHER legs of its direction (their standard deviation,
floor 1 min) is dropped and counted. Airport coordinates are FlightAware's.

What follows automatically: the table, every number in the text (spans
filled by `src/tabs/avia/values.js`), the race figure's route list, the
springs figure. Not automatic: the qualitative sentences (e.g. which route
fits worst and why); `logic.test.js` guards the main ones.

Data: FlightAware (https://www.flightaware.com), public flight pages, read
2026-09-28, 2026-11-06 and 2026-11-25 (42 routes added on the last date). Check FlightAware's terms before re-fetching on a large scale.

## Airborne gravity (Eötvös section): `gravd/dataset.json`

One input per NOAA NGS GRAV-D block (`<ID>.zip` and the URL of its release)
in `gravd/dataset.json`. Then `fog fetch avia-gravd`, `fog lock avia-gravd`,
`fog build avia-gravd`, and the tests. Only the main data lines are kept; the tab needs lines flown in
opposite directions next to each other (EN02: east-west, alternated).
NOAA data are public domain.
