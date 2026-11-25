// Package build is the registry of `fog build` targets. A target reads
// only files already on disk (no network: that is `fog fetch`'s job, see
// epic24), so a build is deterministic and can run in CI.
package build

import (
	"encoding/json"
	"fmt"
	"io"
	"math"
	"os"
	"path/filepath"
	"strings"

	"flatorglobe/tools/internal/build/aviaflights"
	"flatorglobe/tools/internal/build/aviagravd"
	"flatorglobe/tools/internal/build/aviamesh"
	"flatorglobe/tools/internal/build/casep2p"
	"flatorglobe/tools/internal/build/daylen"
	"flatorglobe/tools/internal/build/dipatmos"
	"flatorglobe/tools/internal/build/ecl"
	"flatorglobe/tools/internal/build/eclcrater"
	"flatorglobe/tools/internal/build/flightdip"
	"flatorglobe/tools/internal/build/gpsraw"
	"flatorglobe/tools/internal/build/gravticon"
	"flatorglobe/tools/internal/build/gravtides"
	"flatorglobe/tools/internal/build/igra"
	"flatorglobe/tools/internal/build/krakatoa"
	"flatorglobe/tools/internal/build/land"
	"flatorglobe/tools/internal/build/llr"
	"flatorglobe/tools/internal/build/lomond"
	"flatorglobe/tools/internal/build/mag"
	"flatorglobe/tools/internal/build/mlo"
	"flatorglobe/tools/internal/build/orb"
	"flatorglobe/tools/internal/build/orbpulsar"
	"flatorglobe/tools/internal/build/orbradar"
	"flatorglobe/tools/internal/build/orbtransit"
	"flatorglobe/tools/internal/build/ptolemy"
	"flatorglobe/tools/internal/build/refbord"
	"flatorglobe/tools/internal/build/romer"
	"flatorglobe/tools/internal/build/satdop"
	"flatorglobe/tools/internal/build/seisbulk"
	"flatorglobe/tools/internal/build/seismesh"
	"flatorglobe/tools/internal/build/seisradius"
	"flatorglobe/tools/internal/build/seisreloc"
	"flatorglobe/tools/internal/build/seisshadow"
	"flatorglobe/tools/internal/build/seiswaves"
	"flatorglobe/tools/internal/build/starhip"
	"flatorglobe/tools/internal/build/survexcess"
	"flatorglobe/tools/internal/build/survzenith"
	"flatorglobe/tools/internal/build/tonga"
	"flatorglobe/tools/internal/build/tongalaps"
	"flatorglobe/tools/internal/build/tsar"
	"flatorglobe/tools/internal/dataset"
	"flatorglobe/tools/internal/preset"
	"flatorglobe/tools/internal/pyjson"
)

// Target is one generated output.
type Target struct {
	Name    string
	Dataset string // id of the data/**/dataset.json that names it
	Desc    string
	// Slow targets (minutes of CPU) are skipped by `fog build all` unless
	// --slow is given; `make ci-full` runs them.
	Slow bool
	// Meta targets list the site's own material (the datasets, for the home showcase): no dataset.json names them.
	Meta bool
	// Make computes the files to write and a one-line summary.
	Make func(root string) ([]preset.File, string, error)
}

// Targets in the order `fog build all` runs them.
var Targets = []Target{
	{
		Name:    "krakatoa",
		Dataset: "seis-krakatoa",
		Desc:    "seis: Krakatoa 1883 air-wave passage times (Strachey 1888), checked against Table VIII",
		Make: func(root string) ([]preset.File, string, error) {
			res, err := krakatoa.Compute(root)
			if err != nil {
				return nil, "", err
			}
			if len(res.Bad) > 0 {
				msg := "transcription mismatch:"
				for _, b := range res.Bad {
					msg += "\n  " + b
				}
				return nil, "", fmt.Errorf("%s", msg)
			}
			return []preset.File{res.File()},
				fmt.Sprintf("%d stations, %d intervals checked against Table VIII: all agree to the minute", len(res.Stations), res.Checked), nil
		},
	},
}

func init() {
	Targets = append(Targets, Target{
		Name:    "avia-gravd",
		Dataset: "avia-gravd",
		Desc:    "avia: NOAA GRAV-D airborne gravity, one sample every 30 s, velocities from the 1 Hz positions",
		Make: func(root string) ([]preset.File, string, error) {
			blocks, d, err := aviagravd.Compute(root)
			if err != nil {
				return nil, "", err
			}
			return []preset.File{aviagravd.File(blocks, d)}, aviagravd.Summary(blocks), nil
		},
	})
	Targets = append(Targets, Target{
		Name:    "ecl",
		Dataset: "ecl-nasa",
		Desc:    "ecl: NASA eclipse pages (Espenak) -> Besselian elements, paths, Saros 136, lunar months",
		Make: func(root string) ([]preset.File, string, error) {
			r, err := ecl.Compute(root)
			if err != nil {
				return nil, "", err
			}
			return []preset.File{r.File()}, r.Summary(), nil
		},
	})
	Targets = append(Targets, Target{
		Name:    "avia-flights",
		Dataset: "avia-flights",
		Desc:    "avia: FlightAware airborne times per route and direction (3-sigma leave-one-out), filed plans",
		Make: func(root string) ([]preset.File, string, error) {
			r, err := aviaflights.Compute(root)
			if err != nil {
				return nil, "", err
			}
			f, err := r.File()
			if err != nil {
				return nil, "", err
			}
			return []preset.File{f}, fmt.Sprintf("%d routes, %d airports", len(r.Recs), len(r.Airports)), nil
		},
	})
	Targets = append(Targets, Target{
		Name:    "avia-mesh",
		Dataset: "avia-flights",
		Desc:    "avia: the airline mesh by the earthquakes' method: airports free on a plane or on a sphere of free radius, airborne times only",
		Make: func(root string) ([]preset.File, string, error) {
			r, err := aviamesh.Compute(root)
			if err != nil {
				return nil, "", err
			}
			return []preset.File{r.File()}, strings.Join(r.Log, "; "), nil
		},
	})
	Targets = append(Targets, Target{
		Name:    "mag-obs",
		Dataset: "mag-obs",
		Desc:    "mag: measured inclination/field (WDC observatories + surveys), IGRF-14 coefficients, measurements.csv",
		Make: func(root string) ([]preset.File, string, error) {
			r, err := mag.Compute(root)
			if err != nil {
				return nil, "", err
			}
			return r.Files(), strings.Join(r.Log, "; "), nil
		},
	})
	Targets = append(Targets, Target{
		Name:    "seis-radius",
		Dataset: "seis-radius",
		Desc:    "seis: ISC Rayleigh arrivals of nine earthquakes, 20-160 deg, ocean fraction of each path",
		Make: func(root string) ([]preset.File, string, error) {
			r, err := seisradius.Compute(root)
			if err != nil {
				return nil, "", err
			}
			return r.Files(), strings.Join(r.Log, ", "), nil
		},
	})
	Targets = append(Targets, Target{
		Name:    "land",
		Dataset: "land",
		Desc:    "core: Natural Earth 1:110m land -> 0.5-degree land mask of the maps (decorative)",
		Make: func(root string) ([]preset.File, string, error) {
			r, err := land.Compute(root)
			if err != nil {
				return nil, "", err
			}
			return []preset.File{r.File()}, r.Summary(), nil
		},
	})
	Targets = append(Targets, Target{
		Name:    "map-ptolemy",
		Dataset: "map-ptolemy",
		Desc:    "map: Ptolemy's Geography (6,000+ coordinates) and the modern sites of 56 towns",
		Make: func(root string) ([]preset.File, string, error) {
			r, err := ptolemy.Compute(root)
			if err != nil {
				return nil, "", err
			}
			return []preset.File{r.File()}, r.Summary(), nil
		},
	})
	Targets = append(Targets, Target{
		Name:    "moon-llr",
		Dataset: "moon-llr",
		Desc:    "moon: Apollo 15 laser ranging normal points -> passes of 6 h or more",
		Make: func(root string) ([]preset.File, string, error) {
			passes, n, err := llr.Compute(root)
			if err != nil {
				return nil, "", err
			}
			return []preset.File{llr.File(passes)}, fmt.Sprintf("%d normal points, %d passes", n, len(passes)), nil
		},
	})
	Targets = append(Targets, Target{
		Name:    "orb",
		Dataset: "orb",
		Desc:    "orb: HARPS-N solar RV days, tau Ceti nightly RV, SDO apparent solar radius",
		Make:    orb.Files,
	})
	Targets = append(Targets, Target{
		Name:    "dip-atmos",
		Dataset: "dip-atmos",
		Desc:    "dip: the air at the eye and at the grazing point of the Caussols photo (Open-Meteo answers)",
		Make: func(root string) ([]preset.File, string, error) {
			out, err := dipatmos.Compute(root)
			if err != nil {
				return nil, "", err
			}
			return []preset.File{dipatmos.File(out)}, "4 answers", nil
		},
	})
	Targets = append(Targets, Target{
		Name:    "cases-pier2pier",
		Dataset: "cases-pier2pier",
		Desc:    "cases: the Worthing–Brighton laser test of February 2019 (their tables, the evenings' air, sea and tide)",
		Make: func(root string) ([]preset.File, string, error) {
			out, err := casep2p.Compute(root)
			if err != nil {
				return nil, "", err
			}
			return []preset.File{casep2p.File(out)}, "2 evenings, 5 trials", nil
		},
	})
	Targets = append(Targets, Target{
		Name:    "seis-tonga",
		Dataset: "seis-tonga",
		Desc:    "seis: Hunga Tonga pressure wave at US ASOS stations, two arrivals picked without an Earth model",
		Make: func(root string) ([]preset.File, string, error) {
			rows, err := tonga.Compute(root)
			if err != nil {
				return nil, "", err
			}
			return tonga.Files(rows), fmt.Sprintf("%d stations", len(rows)), nil
		},
	})
	Targets = append(Targets, Target{
		Name:    "atmo-tonga-laps",
		Dataset: "atmo-tonga-laps",
		Desc:    "atmo: every passage of the Hunga Tonga pressure wave over seven days at the seis-tonga barometers, no Earth model",
		Make: func(root string) ([]preset.File, string, error) {
			rows, err := tongalaps.Compute(root)
			if err != nil {
				return nil, "", err
			}
			n := 0
			for _, r := range rows {
				for _, t := range r.A {
					if !math.IsNaN(t) {
						n++
					}
				}
			}
			return []preset.File{tongalaps.File(rows)}, fmt.Sprintf("%d stations, %d passages picked", len(rows), n), nil
		},
	})
	Targets = append(Targets, Target{
		Name:    "atmo-tsar",
		Dataset: "atmo-tsar",
		Desc:    "atmo: the 30 October 1961 explosion's pressure wave at eight Japanese microbarographs and Showa Base (Murayama 1962), three passages",
		Make: func(root string) ([]preset.File, string, error) {
			res, err := tsar.Compute(root)
			if err != nil {
				return nil, "", err
			}
			if len(res.Bad) > 0 {
				return nil, "", fmt.Errorf("transcription check failed:\n  %s", strings.Join(res.Bad, "\n  "))
			}
			return []preset.File{res.File()}, fmt.Sprintf("%d stations, %d printed velocities checked: all agree", len(res.Stations), res.Checked), nil
		},
	})
	Targets = append(Targets, Target{
		Name:    "seis-relocate",
		Dataset: "seis-radius",
		Slow:    true,
		Desc:    "seis: the nine earthquakes relocated from arrival times only; one flat map against all nine",
		Make: func(root string) ([]preset.File, string, error) {
			r, err := seisreloc.Compute(root, func(string) {})
			if err != nil {
				return nil, "", err
			}
			return []preset.File{r.File()}, r.Log, nil
		},
	})
	Targets = append(Targets, Target{
		Name:    "seis-shadow",
		Dataset: "seis-radius",
		Slow:    true,
		Desc:    "seis: the P shadow zone of the nine earthquakes, station by station; one flat ring per map",
		Make: func(root string) ([]preset.File, string, error) {
			r, err := seisshadow.Compute(root)
			if err != nil {
				return nil, "", err
			}
			return []preset.File{r.File()}, r.Log, nil
		},
	})
	Targets = append(Targets, Target{
		Name:    "seis-waves",
		Dataset: "seis-waves",
		Desc:    "seis: Tohoku 2011 at GSN stations, three components; wave types from their motion, P direction vs globe and flat bearings",
		Make: func(root string) ([]preset.File, string, error) {
			r, err := seiswaves.Compute(root)
			if err != nil {
				return nil, "", err
			}
			return []preset.File{r.File()}, r.Log, nil
		},
	})
	Targets = append(Targets, Target{
		Name:    "seis-bulk",
		Dataset: "seis-radius",
		Slow:    true,
		Desc:    "seis: every shallow Mw >= 7 of 2000-2023 pooled (P relocation, one common curve, shadow, Rayleigh radius)",
		Make: func(root string) ([]preset.File, string, error) {
			r, err := seisbulk.Compute(root, func(s string) { fmt.Fprintln(os.Stderr, "  seis-bulk:", s) })
			if err != nil {
				return nil, "", err
			}
			return []preset.File{r.File()}, strings.Join(r.Log, "; "), nil
		},
	})
	Targets = append(Targets, Target{
		Name:    "seis-mesh",
		Dataset: "seis-radius",
		Slow:    true,
		Desc:    "seis: does a shape emerge from earthquake P travel times alone (plane vs 3D, free positions, one common law), and the speed experiment",
		Make: func(root string) ([]preset.File, string, error) {
			r, err := seismesh.Compute(root, func(s string) { fmt.Fprintln(os.Stderr, "  seis-mesh:", s) })
			if err != nil {
				return nil, "", err
			}
			return []preset.File{r.File()}, strings.Join(r.Log, "; "), nil
		},
	})
	Targets = append(Targets, Target{
		Name:    "dip-mlo",
		Dataset: "dip-mlo",
		Desc:    "dip: Mauna Loa last light of every 2016 evening (NOAA GML) and its horizon (Copernicus DEM)",
		Make: func(root string) ([]preset.File, string, error) {
			r, err := mlo.Compute(root)
			if err != nil {
				return nil, "", err
			}
			return r.Files(), strings.Join(r.Log, "; "), nil
		},
	})
	Targets = append(Targets, Target{
		Name:    "sat-doppler",
		Dataset: "sat-doppler",
		Slow:    true,
		Desc:    "sat: orbits, stations, GM and Ω from carrier-phase Doppler alone (34 IGS stations, GPS+Galileo+GLONASS); flat model steel-manned",
		Make: func(root string) ([]preset.File, string, error) {
			r, err := satdop.Compute(root, func(s string) { fmt.Fprintln(os.Stderr, "  sat-doppler:", s) })
			if err != nil {
				return nil, "", err
			}
			return []preset.File{r.File()}, strings.Join(r.Log, "; "), nil
		},
	})
	Targets = append(Targets, Target{
		Name:    "gps-raw",
		Dataset: "gps-raw",
		Desc:    "gps: 34 IGS stations solved from raw pseudoranges (RINEX 3, crx2rnx), satellites tracked",
		Make: func(root string) ([]preset.File, string, error) {
			r, err := gpsraw.Compute(root)
			if err != nil {
				return nil, "", err
			}
			return []preset.File{r.File()}, fmt.Sprintf("%d stations", len(r.Stations)), nil
		},
	})
}

// absentRaw lists the gitignored inputs of a dataset missing on disk.
func absentRaw(root, id string) ([]string, error) {
	paths, err := dataset.Discover(root)
	if err != nil {
		return nil, err
	}
	for _, p := range paths {
		d, err := dataset.Load(root, p)
		if err != nil {
			return nil, err
		}
		if d.ID != id {
			continue
		}
		_, missing, err := d.Files(root)
		if err != nil {
			return nil, err
		}
		var out []string
		for _, in := range missing {
			if in.Ignored {
				out = append(out, in.Path+in.Glob)
			}
		}
		return out, nil
	}
	return nil, nil // no manifest: fog validate reports it
}

// Find returns the target called name.
func Find(name string) (Target, bool) {
	for _, t := range Targets {
		if t.Name == name {
			return t, true
		}
	}
	return Target{}, false
}

// Run builds one target; with check it writes nothing and reports stale
// files. It returns false when check found a stale file.
func Run(w io.Writer, root string, t Target, check bool) (bool, error) {
	if absent, err := absentRaw(root, t.Dataset); err != nil {
		return false, fmt.Errorf("%s: %w", t.Name, err)
	} else if len(absent) > 0 {
		// raw files kept out of git (too big) are not on this machine: a CI
		// without the cache skips the target rather than failing it
		fmt.Fprintf(w, "%s: SKIPPED, raw files not on disk (%s): fog fetch %s\n", t.Name, strings.Join(absent, ", "), t.Dataset)
		return true, nil
	}
	files, summary, err := t.Make(root)
	if err != nil {
		return false, fmt.Errorf("%s: %w", t.Name, err)
	}
	fmt.Fprintf(w, "%s: %s\n", t.Name, summary)
	fresh := true
	for _, f := range files {
		st, err := preset.Write(root, f, check)
		if err != nil {
			return false, fmt.Errorf("%s: %w", t.Name, err)
		}
		fmt.Fprintf(w, "  %-9s %s\n", st, f.Out)
		if st == preset.Stale {
			fresh = false
		}
	}
	return fresh, nil
}


func init() {
	Targets = append(Targets, Target{
		Name:    "contrib-lomond",
		Dataset: "contrib-lomond",
		Desc:    "contrib: Bass Rock from East Lomond (GLO-30, Leith gauge, GFS column, rays traced over globe and plane)",
		Make: func(root string) ([]preset.File, string, error) {
			r, err := lomond.Compute(root)
			if err != nil {
				return nil, "", err
			}
			return []preset.File{r.File()}, fmt.Sprintf("%d traced columns", len(r.Traced)), nil
		},
	})
}

func init() {
	Targets = append(Targets, Target{
		Name:    "contrib-flightdip",
		Dataset: "contrib-flightdip",
		Desc:    "contrib: horizon dips from airliner windows (earthlyskeptic, Theodolite app), terrain from GLO-90, the radius",
		Make: func(root string) ([]preset.File, string, error) {
			r, err := flightdip.Compute(root)
			if err != nil {
				return nil, "", err
			}
			if err := flightdip.Photos(root); err != nil {
				return nil, "", err
			}
			return []preset.File{r.File()}, fmt.Sprintf("%d photographs, R = %.0f km", len(r.Points), r.Fits[0].R), nil
		},
	})
}

func init() {
	Targets = append(Targets, Target{
		Name:    "surv-excess",
		Dataset: "surv-excess",
		Desc:    "surv: curvature from the observed angle sums of 1,100 survey triangles (Schott, USC&GS SP4 and SP7), radius-free areas",
		Make: func(root string) ([]preset.File, string, error) {
			r, err := survexcess.Compute(root)
			if err != nil {
				return nil, "", err
			}
			if len(r.Bad) > 0 || len(r.PosBad) > 0 {
				return nil, "", fmt.Errorf("transcription check failed:\n  %s", strings.Join(append(r.Bad, r.PosBad...), "\n  "))
			}
			return []preset.File{r.File()}, r.Summary(), nil
		},
	})
}

func init() {
	Targets = append(Targets, Target{
		Name:    "moon-eclcraters",
		Dataset: "moon-eclcraters",
		Desc:    "moon: 22,500 lunar eclipse crater timings (Herald & Sinnott, 1842-2011) -> radius and shape of the Earth's shadow, DE440",
		Make: func(root string) ([]preset.File, string, error) {
			r, err := eclcrater.Compute(root)
			if err != nil {
				return nil, "", err
			}
			return []preset.File{r.File()}, r.Summary(), nil
		},
	})
}

func init() {
	Targets = append(Targets, Target{
		Name:    "ref-igra",
		Dataset: "ref-igra",
		Desc:    "ref: refraction coefficient k of the measured air, every 2026 radiosonde sounding of IGRA 2 (NOAA), day and night",
		Make: func(root string) ([]preset.File, string, error) {
			r, err := igra.Compute(root)
			if err != nil {
				return nil, "", err
			}
			return []preset.File{r.File()}, r.Summary(), nil
		},
	})
}

func init() {
	Targets = append(Targets, Target{
		Name:    "surv-zenith",
		Dataset: "surv-zenith",
		Desc:    "ref: reciprocal zenith distances of Schott (USC&GS SP 4, Part II, our transcription) -> R/(1-k) and k per line, hourly k Round Top-Jackson Butte 1879",
		Make: func(root string) ([]preset.File, string, error) {
			r, err := survzenith.Compute(root)
			if err != nil {
				return nil, "", err
			}
			if len(r.Bad) > 0 {
				return nil, "", fmt.Errorf("transcription check failed:\n  %s", strings.Join(r.Bad, "\n  "))
			}
			return []preset.File{r.File()}, r.Summary(), nil
		},
	})
}

func init() {
	Targets = append(Targets, Target{
		Name:    "sun-bsrn",
		Dataset: "sun-bsrn",
		Desc:    "sun: length of the day measured by BSRN pyranometers, March, June and December 2019, against the globe and the best flat spotlight",
		Make: func(root string) ([]preset.File, string, error) {
			r, err := daylen.Compute(root)
			if err != nil {
				return nil, "", err
			}
			return []preset.File{r.File()}, r.Summary(), nil
		},
	})
	Targets = append(Targets, Target{
		Name:    "star-hip",
		Dataset: "star-hip",
		Desc:    "star: Hipparcos stars brighter than V = 4.55 and six fast-moving stars, positions and proper motions as published",
		Make: func(root string) ([]preset.File, string, error) {
			r, err := starhip.Compute(root)
			if err != nil {
				return nil, "", err
			}
			return []preset.File{r.File()}, r.Summary(), nil
		},
	})
}

func init() {
	Targets = append(Targets, Target{
		Name:    "ref-bordighera",
		Dataset: "ref-bordighera",
		Desc:    "ref: the air of the Bordighera photo (ERA5, marine) and rays traced over globe and plane, the air each model needs",
		Make: func(root string) ([]preset.File, string, error) {
			r, err := refbord.Compute(root)
			if err != nil {
				return nil, "", err
			}
			return []preset.File{r.File()}, fmt.Sprintf("%d traced airs", len(r.Traced)), nil
		},
	})
}

func init() {
	Targets = append(Targets, Target{
		Name:    "grav-tides",
		Dataset: "grav-tides",
		Desc:    "grav: one year of hourly sea level at five tide gauges (UHSLC): spectrum, spring-neap period, harmonic constants",
		Make: func(root string) ([]preset.File, string, error) {
			r, err := gravtides.Compute(root)
			if err != nil {
				return nil, "", err
			}
			return []preset.File{r.File()}, r.Summary(), nil
		},
	})
}

func init() {
	Targets = append(Targets, Target{
		Name:    "grav-ticon",
		Dataset: "grav-ticon",
		Desc:    "grav: TICON-3 tidal constants of the world's tide gauges, thinned for the tide globe, and M2 in open and enclosed seas",
		Make: func(root string) ([]preset.File, string, error) {
			r, err := gravticon.Compute(root)
			if err != nil {
				return nil, "", err
			}
			return []preset.File{r.File()}, r.Summary(), nil
		},
	})
}

func init() {
	Targets = append(Targets, Target{
		Name:    "orb-radar",
		Dataset: "orb-radar",
		Desc:    "orb: radar echoes from Venus, Millstone 1961 (Pettengill et al. 1962, our transcription) -> the astronomical unit again with DE440",
		Make: func(root string) ([]preset.File, string, error) {
			r, err := orbradar.Compute(root)
			if err != nil {
				return nil, "", err
			}
			if len(r.Bad) > 0 {
				return nil, "", fmt.Errorf("transcription check failed:\n  %s", strings.Join(r.Bad, "\n  "))
			}
			return []preset.File{r.File()}, r.Summary(), nil
		},
	})
}

func init() {
	Targets = append(Targets, Target{
		Name:    "orb-pulsar",
		Dataset: "orb-pulsar",
		Desc:    "orb: the astronomical unit from pulsar timing (EPTA DR2) against VLBI directions (MSPSRpi, our transcription): A_DE cos(beta_t)/cos(beta_VLBI)",
		Make: func(root string) ([]preset.File, string, error) {
			r, err := orbpulsar.Compute(root)
			if err != nil {
				return nil, "", err
			}
			return []preset.File{r.File()}, r.Summary(), nil
		},
	})
}

func init() {
	Targets = append(Targets, Target{
		Name:    "orb-transit",
		Dataset: "orb-transit",
		Desc:    "orb: the transit of Venus of 1769, 278 contact timings (Newcomb 1891, our transcription), each recomputed with DE440 for a trial unit -> the astronomical unit",
		Make: func(root string) ([]preset.File, string, error) {
			r, err := orbtransit.Compute(root)
			if err != nil {
				return nil, "", err
			}
			if len(r.Bad) > 0 {
				return nil, "", fmt.Errorf("transcription check failed:\n  %s", strings.Join(r.Bad, "\n  "))
			}
			return []preset.File{r.File()}, r.Summary(), nil
		},
	})
}

// datasets: the list of every data/**/dataset.json, for the pages that count them (the home showcase, 2026-11-19).
func init() {
	Targets = append(Targets, Target{
		Name: "datasets",
		Meta: true,
		Desc: "site: the list of the datasets (data/**/dataset.json) -> src/data/datasets.js, for the counters of the home showcase",
		Make: func(root string) ([]preset.File, string, error) {
			paths, err := dataset.Discover(root)
			if err != nil {
				return nil, "", err
			}
			// an unpublished contribution never reaches the client (src/data/contrib/published.json): left out of the list
			const pub = "src/data/contrib/published.json"
			pb, err := os.ReadFile(filepath.Join(root, pub))
			if err != nil {
				return nil, "", err
			}
			published := map[string]bool{}
			if err := json.Unmarshal(pb, &published); err != nil {
				return nil, "", err
			}
			var b strings.Builder
			b.WriteString("// One dataset per line: [id, tab, kind, evidence (the best class its data can support), title]; unpublished contributions left out, published ones counted without their names\nexport const DATASETS = [\n")
			n := map[string]int{}
			kept := []string{pub}
			for _, p := range paths {
				d, err := dataset.Load(root, p)
				if err != nil {
					return nil, "", err
				}
				if key, ok := strings.CutPrefix(d.ID, "contrib-"); ok && !published[key] {
					continue
				}
				kept = append(kept, p)
				if strings.HasPrefix(d.ID, "contrib-") { // a contribution leaves no trace outside its own files: counted, not named
					n[d.Evidence]++
					b.WriteString(" " + pyjson.Dumps([]any{"contrib", d.Tab, d.Kind, d.Evidence, ""}, pyjson.Compact) + ",\n")
					continue
				}
				n[d.Evidence]++
				b.WriteString(" " + pyjson.Dumps([]any{d.ID, d.Tab, d.Kind, d.Evidence, d.Title}, pyjson.Compact) + ",\n")
			}
			b.WriteString("];\n")
			return []preset.File{{Out: "src/data/datasets.js", Command: "build datasets", Inputs: kept,
					Notes: []string{"The datasets compiled by fog (data/**/dataset.json), counted by the home showcase."}, Body: b.String()}},
				fmt.Sprintf("%d datasets (measure %d, check %d, model %d)", len(kept)-1, n["measure"], n["check"], n["model"]), nil
		},
	})
}

func init() {
	Targets = append(Targets, Target{
		Name:    "sun-romer",
		Dataset: "sun-romer",
		Desc:    "sun: Rømer reversed, the astronomical unit from 8,822 eclipses of Io 1652-1983 (Lieske, IMCCE NSDC), laboratory c, orbits of angles and periods",
		Make: func(root string) ([]preset.File, string, error) {
			r, err := romer.Compute(root)
			if err != nil {
				return nil, "", err
			}
			return []preset.File{r.File()}, r.Summary(), nil
		},
	})
}
