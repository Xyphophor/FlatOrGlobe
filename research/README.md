# research/ — exploratory Python

Decided on 2026-10-14 (epic24): the data chain is Go (`tools/`, the `fog`
data compiler; `make ci`). Python stays here for proofs of concept and
exploratory work, the analyses that still move (a photo awaited, an eye
height to measure, a contributor's agreement), and the one-off tools. Nothing
here runs in `make ci`, and nothing here is needed to build the site.
Dependencies: `requirements.txt` (pinned), Python `.python-version`.

| script | what | status |
|---|---|---|
| `lidar_horizon.py` (+ `bev_dem.py`, `bev_lzw.c`, `cop_dem.py`) | horizon profiles of the viewpoints (IGN LiDAR HD WMS, Austrian BEV, Copernicus) → `src/data/dem/*` | interactive: viewpoints added per photo, assumed eye heights to confirm |
| `build_bordighera.py`, `fit_bordighera_photo.py`, `bordighera_refraction.py` | the owner's balcony photo (hh tab) | eye at 41.6 m (owner's GPS, 2026-10-14; `BORD_AZ=0.00112` keeps the photo's direction); balcony position private (`data/hh/bordighera/raw/eye.json`) |
| `align_photo.py`, `argentera2/` | photo/skyline fitting (elev tab) | exploratory |
| `fit_camera_caussols.py`, `measure_dip_caussols.py` | the Caussols dip photo (dip tab) | frozen outputs |
| `extract_prose.py`, `port_legacy_js.py`, `rewrite_prose.py` | migration from the legacy single file (epic02) | done; kept for reference |
| `build_r206_map.py` | one-off download of 16 OSM tiles (`public/maps/ref-r206/`) | done |

When one of these analyses is frozen, its build moves to `tools/` like the
others: freeze the Python output as the parity oracle, port, check byte for
byte, then remove the script (see `tasks/epic24/`).
