# Krakatoa 1883 air wave — hand transcription (epic05/UC06)

Source: *The Eruption of Krakatoa and Subsequent Phenomena*, Report of the
Krakatoa Committee of the Royal Society (London, Trübner, 1888), Part II,
"On the air waves and sounds caused by the eruption of Krakatoa in August,
1883", prepared in the Meteorological Office and presented by Lieut.-General
R. Strachey, pp. 57–88. Scan: <https://archive.org/details/eruptionofkrakat00roya>
(PDF pages 106–120 hold the tables used here). Public domain.

- `tables_3_4.csv` — Table II (station latitude/longitude, p. 62) and Tables
  III–IV (GMT times of passages I–VII, pp. 65–67), typed from the page images
  on 2026-10-03. The OCR text of the scan is unusable for the tables.
- `table_8.csv` — Table VIII (intervals between successive passages, pp. 75–76),
  typed separately as a check.

`make data` (or `tools/bin/fog build krakatoa`; Go, `tools/internal/build/krakatoa/`) recomputes every interval from Tables III–IV,
compares it with Table VIII (175 intervals, all equal to the minute on
2026-10-03) and writes `src/data/presets/seis-krakatoa.js`.

What is NOT taken from the report: Strachey's velocities in miles per hour
(he converted degrees per hour with the radius of the day — circular for our
purpose) and his distances in degrees (recomputed from the coordinates where
needed, only to draw and to test the flat model). Only times are used for the
radius.
