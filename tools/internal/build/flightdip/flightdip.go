// Package flightdip builds src/data/presets/contrib-flightdip.js: the dip of
// the horizon measured from airliner windows by earthlyskeptic, eleven
// screenshots of the Theodolite iPhone app on two flights (AA 6322, Chicago
// to Des Moines, 5 September 2025; AA 5255, Des Moines to Washington, 8
// September 2025), and the radius they give. A statistical study of the
// contrib tab.
//
// # 1. The readings
//
// Each screenshot carries the app's on-screen reading of the reticle's
// elevation, set on the horizon (the contributor's table, in his Desmos graph
// [Desmos]); the EXIF of each file holds the app's reading at the shutter
// (ImageDescription "vert_angle_deg=…", which can differ by 0.1-0.2°), the
// phone's GPS position and altitude, the true heading of the camera and the
// time [Exif 2.32]. The contributor's document names the two flights, whose
// ADS-B track logs FlightAware publishes [FlightAware]: a fix every 15 to 30 s
// with the time, position, course, ground speed and the transponder's
// pressure altitude.
//
// # 2. Where the aircraft was
//
// The track is interpolated at each photograph's time (the phone's clock).
// On flight 1 the phone's GPS position agrees with it within seconds; on
// flight 2 the phone's position had frozen (gpsLag: the aircraft had been
// there 2.5 to 12.5 minutes before), and the "32,173 ft" screenshot was taken
// in descent at about 19,800 ft. The height is the transponder's pressure
// altitude H (ICAO standard atmosphere: p = 1013.25 (1 − 2.25577·10⁻⁵ H)^5.25588
// hPa, H in m [ICAO 1993]) placed in the day's air: the height where the GFS
// column above the aircraft has that pressure (ln p linear in height between
// the model's levels). On flight 1 it agrees with the phone's GPS within 8 to
// 50 m.
//
// # 3. The horizon seen from a plane is the ground
//
// Over land the horizon is the terrain where the line of sight grazes it, not
// sea level. Along each photograph's heading, the Copernicus GLO-90 surface
// model [Copernicus 2022] is sampled every 250 m out to 1.5 times the globe's
// horizon distance; with straight light the horizon is where the elevation
// angle ε(d) = (z(d) − h)/d − d/(2R) is largest, and the height that counts
// is h − z there.
//
// # 4. The air of the day
//
// The GFS model's air (temperature, relative humidity and geopotential height
// at 21 pressure levels, 2 m air and surface pressure; Open-Meteo's historical
// forecast archive [Open-Meteo]) is read above the aircraft and above the
// horizon at the photograph's time (linear between the hours); the
// refractivity is N = 79.01 P/T − 12.0 e/T (package refrac, [Ciddor 1996]).
// The line of sight is traced through it over the sphere, the air blended
// linearly from the aircraft's column into the horizon's, in exact polar
// form (r = R + z, θ the elevation over the local horizontal, x the ground
// distance) [Born & Wolf 1999, §3.2; Bomford 1980, ch. 3]:
//
//	dz/dx = (r/R) tan θ,   dθ/dx = (r/R)(1/r + (dn/dz)/n)
//
// and the horizon is the lowest ray that clears the terrain (bisection). In
// spherically layered air n·r·cos θ is the same all along a ray [Bouguer
// 1729; Born & Wolf 1999, §3.2.2]: a ray grazing the ground at height z_t,
// where the index is n_t, reaches the eye at h, index n_e, at
//
//	cos δ = n_t (R + z_t) / (n_e (R + h))
//
// which the fits use (q = n_t/n_e; straight light q = 1), and which agrees
// with the traced rays within 0.01-0.05°. kEff is the refraction coefficient
// the same dip would need in uniform air. Over a plane in the same air n cos θ
// is constant along a ray: a ray launched upward at α comes back down to the
// ground whenever n_e cos α > 1, so an unbounded plane's horizon stands above
// level, cos α = 1/n_e (flatEsc); the ground at a haze distance D is seen at
// the dip where ∫ dz / tan θ(z) from the ground to the eye equals D.
//
// # 5. The aircraft's acceleration
//
// The phone measures its tilt against apparent gravity, which an aircraft's
// horizontal acceleration tilts: the specific force is the acceleration over
// the ground plus 2Ω×v (Coriolis) minus gravity [Titterton & Weston 2004,
// ch. 3]; its component a_u along the view azimuth lifts the phone's level in
// that direction by a_u/g, and the true dip is δ = δ_read + a_u/g. The
// acceleration is that of the two ADS-B fixes around the photograph: the
// change of ground speed along the track and v·Δcourse/Δt across it (a turn,
// i.e. a bank, tilts apparent gravity by the bank angle, and from a side
// window most of it falls along the view). The log's rounding (1 kt, 1°)
// gives its standard error. When the course turns by more than 2° between
// the two fixes, the bracket on the steady side of a fix within 10 s is used,
// else the reading is left out of the corrected fits (unresolved). A parabola
// through the positions within ±60 s is printed as a cross-check; it smears
// the onset of a deceleration over the window, which is why it is not used.
//
// # 6. The radius
//
// R is fitted to the eleven dips by least squares on δ (a one-dimensional
// golden-section search on log R: the reading error is the same at every
// height), its uncertainty by bootstrap over the photographs (4,000
// resamples, fixed seed) and the leave-one-out rule for outliers (more than 3
// standard deviations from the others' fit). Variants: the on-screen or the
// EXIF reading; straight light or the day's air; accelerations removed or
// not; a constant zero error of the instrument free or not; and, for
// comparison, the phone's GPS heights.
//
// # 7. The plane
//
// On an infinite plane with straight light the horizon lies at eye level, δ =
// 0 at every height; in the day's air it stands above level. Steel-man: the
// far ground lost in haze at a distance D, plus a constant offset, both
// fitted, with straight light and in the day's air.
//
// Distances along the headings are great circles on a 6,371 km sphere, the
// GFS heights are the model's, and the ground speeds come from GNSS: the
// radius enters there (evidence class "check").
//
// # References
//
//   - [Bomford 1980] G. Bomford, Geodesy, 4th ed., Clarendon Press (1980), ch. 3 (refraction).
//   - [Born & Wolf 1999] M. Born, E. Wolf, Principles of Optics, 7th ed., Cambridge University
//     Press (1999), §3.2 (rays in a medium of continuously varying index; Bouguer's formula).
//   - [Bouguer 1729] P. Bouguer, Essai d'optique sur la gradation de la lumière, Paris (1729).
//   - [Ciddor 1996] P. E. Ciddor, Applied Optics 35 (1996) 1566-1573.
//   - [Copernicus 2022] Copernicus DEM GLO-90, European Space Agency, https://doi.org/10.5270/ESA-c5d3d65.
//   - [Desmos] earthlyskeptic, "[Earth] Horizon Dip vs. Height from Airplane (DSM, Linear)",
//     https://www.desmos.com/calculator/bkxuurlmlh (2025-12-30).
//   - [Exif 2.32] JEITA CP-3451C / CIPA DC-008-2019.
//   - [FlightAware] FlightAware, track logs of AAL6322 (2025-09-05, KORD-KDSM) and AAL5255
//     (2025-09-08, KDSM-KDCA), https://www.flightaware.com/live/flight/AAL6322/history/20250905/1210Z/KORD/KDSM/tracklog.
//   - [ICAO 1993] ICAO, Manual of the ICAO Standard Atmosphere, Doc 7488/3 (1993).
//   - [Open-Meteo] Open-Meteo historical forecast API, NOAA GFS, https://open-meteo.com/en/docs/historical-forecast-api.
//   - [Theodolite] Hunter Research & Technology, Theodolite (iOS app).
//   - [Titterton & Weston 2004] D. H. Titterton, J. L. Weston, Strapdown Inertial Navigation
//     Technology, 2nd ed., IET (2004), ch. 3 (specific force).
package flightdip

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"image"
	"image/jpeg"
	"io"
	"math"
	"math/rand/v2"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"flatorglobe/tools/internal/dem"
	"flatorglobe/tools/internal/exif"
	"flatorglobe/tools/internal/fetch"
	"flatorglobe/tools/internal/preset"
	"flatorglobe/tools/internal/pyjson"
)

// Paths, relative to the repository root.
const (
	Dir       = "data/contrib/flightdip"
	RawDir    = Dir + "/raw"
	PhotoDir  = RawDir + "/photos"
	DemDir    = RawDir + "/glo90"
	Out       = "src/data/presets/contrib-flightdip.js"
	PubPhotos = "public/photos" // resized copies: contrib-flightdip-<n>.jpg
	DesmosURL = "https://www.desmos.com/calculator/bkxuurlmlh"
)

// Files are the shared Google Drive folder's screenshots (folder
// 1xbZ5I3DVk3bWS3jWXljhcXMoKafTnBjE): file id and name.
var Files = [][2]string{
	{"1UEDctylIv-geAit_4NPN-Nvsmg2VKVJj", "Flight1 2322ft.JPG"},
	{"1c-mvvYLZ2qzlT08PdCm-YlQ2KJPVcVT1", "Flight1 3047ft.JPG"},
	{"1sOQImZLDpni-VsKd7NeY9TdJx0arTPx4", "Flight1 5780ft.JPG"},
	{"1xogBa9AWPwy1M4o-JmoQtBec55EexS6C", "Flight1 11037ft.JPG"},
	{"1NYNOSmlaheorUPwE0wKWRauTB9CgnZyu", "Flight1 12388ft.JPG"},
	{"1KkkPQHe1NAOQrapfkawirJxijxwwz_uJ", "Flight1 28395ft.JPG"},
	{"1BENJUrl4EqDsYub14pxoYafVlGh-Dbsu", "Flight1 28404ft.JPG"},
	{"1qho9fLa5FJ3OJsC_Ve8mmoWPf80eAbPu", "Flight2 15611ft.JPG"},
	{"153cf3_U0Z9d6msUZets4dWc4-rVBz4q7", "Flight2 15616ft.JPG"},
	{"1c7cqDqZYe2ndmLT1ZErZvJYKlJC1mU3S", "Flight2 15620ft.JPG"},
	{"17wxLyjto1R7ONLQdu63deEE-33VHltbT", "Flight2 32173ft.JPG"},
}

var (
	R, K       = 6371e3, 0.13
	Step       = 250.0 // m, the terrain profile
	Boot       = 4000
	PhotoWidth = 1400 // px, the published copies
)

var nameRe = regexp.MustCompile(`^Flight(\d) (\d+)ft\.JPG$`)
var descRe = regexp.MustCompile(`vert_angle_deg=(-?[0-9.]+)`)

// dest is the point at distance d (m) and azimuth az (degrees) from (lat, lon) on the sphere R.
func dest(lat, lon, az, d float64) (float64, float64) {
	r := math.Pi / 180
	la, lo, a, dd := lat*r, lon*r, az*r, d/R
	la2 := math.Asin(math.Sin(la)*math.Cos(dd) + math.Cos(la)*math.Sin(dd)*math.Cos(a))
	lo2 := lo + math.Atan2(math.Sin(a)*math.Sin(dd)*math.Cos(la), math.Cos(dd)-math.Sin(la)*math.Sin(la2))
	return la2 / r, lo2 / r
}

// reach is how far along the heading the terrain is sampled for an altitude h.
func reach(h float64) float64 { return 1.5 * math.Sqrt(2*R*math.Max(h, 300)) }

// tiles lists the GLO-90 cells a path crosses.
func tiles(lat, lon, az, h float64) [][2]int {
	seen := map[[2]int]bool{}
	var out [][2]int
	for d := 0.0; d <= reach(h); d += 2000 {
		la, lo := dest(lat, lon, az, d)
		k := [2]int{int(math.Floor(la)), int(math.Floor(lo))}
		if !seen[k] {
			seen[k] = true
			out = append(out, k)
		}
	}
	return out
}

// Fetch downloads the screenshots, the contributor's Desmos table, the two
// FlightAware track logs, the GLO-90 tiles along every heading (from the
// phone's position and from the track's; a cell without a tile gets a .none
// marker) and the GFS air above each aircraft position and each horizon
// (raw/gfs-<day>.json).
func Fetch(ctx context.Context, root string, refresh bool, c *fetch.Client, log io.Writer) error {
	if c == nil {
		c = &fetch.Client{}
	}
	for _, f := range Files {
		dest := filepath.Join(root, PhotoDir, f[1])
		if _, err := c.Get(ctx, "https://drive.usercontent.google.com/download?id="+f[0]+"&export=download&confirm=t", dest, ""); err != nil {
			return err
		}
	}
	fmt.Fprintf(log, "  %d screenshots\n", len(Files))
	ds := filepath.Join(root, RawDir, "desmos.json")
	if refresh {
		os.Remove(ds)
	}
	if _, err := os.Stat(ds); err != nil {
		cl := *c
		cl.Accept = "application/json"
		if _, err := cl.Get(ctx, DesmosURL, ds, ""); err != nil {
			return err
		}
	}
	for _, fl := range Flights {
		dest := filepath.Join(root, RawDir, fl.File)
		if refresh {
			os.Remove(dest)
		}
		cl := *c
		if cl.UserAgent == "" {
			cl.UserAgent = "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0"
		}
		if _, err := cl.Get(ctx, TrackURL(fl), dest, ""); err != nil {
			return err
		}
	}
	fmt.Fprintf(log, "  %d track logs\n", len(Flights))
	sites, err := readSites(root)
	if err != nil {
		return err
	}
	need := map[[2]int]bool{}
	for _, s := range sites {
		for _, t := range tiles(s.gpsLat, s.gpsLon, s.heading, s.hApprox) {
			need[t] = true
		}
		for _, t := range tiles(s.st.Lat, s.st.Lon, s.heading, s.hApprox) {
			need[t] = true
		}
	}
	keys := make([][2]int, 0, len(need))
	for k := range need {
		keys = append(keys, k)
	}
	sort.Slice(keys, func(i, j int) bool { return keys[i][0]*1000+keys[i][1] < keys[j][0]*1000+keys[j][1] })
	for _, t := range keys {
		dest := filepath.Join(root, DemDir, dem.CopName90(t[0], t[1])+".tif")
		if _, err := os.Stat(dest + ".none"); err == nil {
			continue
		}
		if _, err := c.Get(ctx, dem.CopURL90(t[0], t[1]), dest, ""); err != nil {
			var he *fetch.HTTPError
			if errors.As(err, &he) && (he.Status == 403 || he.Status == 404) {
				if err := os.WriteFile(dest+".none", nil, 0o644); err != nil {
					return err
				}
				continue
			}
			return err
		}
	}
	fmt.Fprintf(log, "  GLO-90: %d tiles\n", len(keys))
	// the air: above the aircraft and above the horizon (k = 0.13 for where it is)
	cop := &dem.Cop{Dir: filepath.Join(root, DemDir), GLO90: true}
	byDay := map[string][]Site{}
	for i, s := range sites {
		prof, err := profile(cop, s.st.Lat, s.st.Lon, s.heading, s.hApprox)
		if err != nil {
			return err
		}
		_, _, d := horizon(prof, s.hApprox, 1-K)
		la, lo := dest(s.st.Lat, s.st.Lon, s.heading, d)
		day := s.t.Format("2006-01-02")
		byDay[day] = append(byDay[day], Site{fmt.Sprintf("eye-%d", i), round(s.st.Lat, 3), round(s.st.Lon, 3)}, Site{fmt.Sprintf("hz-%d", i), round(la, 3), round(lo, 3)})
	}
	days := make([]string, 0, len(byDay))
	for d := range byDay {
		days = append(days, d)
	}
	sort.Strings(days)
	for _, day := range days {
		dest := filepath.Join(root, RawDir, "gfs-"+day+".json")
		if _, err := os.Stat(dest); err == nil && !refresh {
			continue
		}
		ss := byDay[day]
		var la, lo []string
		for _, s := range ss {
			la, lo = append(la, strconv.FormatFloat(s.Lat, 'f', -1, 64)), append(lo, strconv.FormatFloat(s.Lon, 'f', -1, 64))
		}
		url := GFSURL + "?latitude=" + strings.Join(la, ",") + "&longitude=" + strings.Join(lo, ",") +
			"&start_date=" + day + "&end_date=" + day + "&hourly=" + gfsVars() + "&models=gfs_seamless"
		tmp := dest + ".part"
		os.Remove(tmp)
		if _, err := c.Get(ctx, url, tmp, ""); err != nil {
			return err
		}
		b, err := os.ReadFile(tmp)
		os.Remove(tmp)
		if err != nil {
			return err
		}
		var ans []json.RawMessage
		if err := json.Unmarshal(b, &ans); err != nil || len(ans) != len(ss) {
			return fmt.Errorf("gfs %s: %d answers for %d sites (%v)", day, len(ans), len(ss), err)
		}
		out, err := json.Marshal(gfsFile{Sites: ss, Answers: ans})
		if err != nil {
			return err
		}
		if err := os.WriteFile(dest, out, 0o644); err != nil {
			return err
		}
		fmt.Fprintf(log, "  GFS %s: %d sites\n", day, len(ss))
	}
	return nil
}

// site is what fetch and build share about one photograph: its instant, the
// phone's position, the camera's heading, the aircraft's state from its track.
type site struct {
	t                time.Time
	gpsLat, gpsLon   float64
	heading, hApprox float64
	st               State
	flight           int
	track            []Fix
}

// photoTime is the capture instant (UTC) from the EXIF time and offset.
func photoTime(in *exif.Info) (time.Time, error) {
	return time.Parse("2006:01:02 15:04:05-07:00", in.DateTimeOriginal+in.OffsetTimeOriginal)
}

func readSites(root string) ([]site, error) {
	tracks := map[int][]Fix{}
	for _, fl := range Flights {
		tr, err := readTrack(root, fl)
		if err != nil {
			return nil, err
		}
		tracks[fl.N] = tr
	}
	var out []site
	for _, f := range Files {
		m := nameRe.FindStringSubmatch(f[1])
		if m == nil {
			return nil, fmt.Errorf("%s: unexpected name", f[1])
		}
		fl, _ := strconv.Atoi(m[1])
		in, err := readExif(filepath.Join(root, PhotoDir, f[1]))
		if err != nil {
			return nil, err
		}
		t, err := photoTime(in)
		if err != nil {
			return nil, fmt.Errorf("%s: %w", f[1], err)
		}
		st, err := At(tracks[fl], t)
		if err != nil {
			return nil, fmt.Errorf("%s: %w", f[1], err)
		}
		out = append(out, site{t: t.UTC(), gpsLat: in.Lat, gpsLon: in.Lon, heading: in.ImgDir, hApprox: st.AltFt * 0.3048, st: st, flight: fl, track: tracks[fl]})
	}
	return out, nil
}

// profile is the terrain along a heading, every Step m (no data or sea: 0).
func profile(cop *dem.Cop, lat, lon, az, h float64) ([]float64, error) {
	var lats, lons []float64
	for d := Step; d <= reach(h); d += Step {
		la, lo := dest(lat, lon, az, d)
		lats, lons = append(lats, la), append(lons, lo)
	}
	prof, err := cop.Grid(lats, lons)
	if err != nil {
		return nil, err
	}
	for j := range prof {
		if math.IsNaN(prof[j]) || prof[j] < 0 {
			prof[j] = math.Max(0, prof[j])
		}
	}
	return prof, nil
}

func readExif(p string) (*exif.Info, error) {
	b, err := os.ReadFile(p)
	if err != nil {
		return nil, fmt.Errorf("%w (fog fetch contrib-flightdip)", err)
	}
	return exif.Read(b)
}

// desmos reads the contributor's table: altitude (ft) -> dip (degrees).
func desmos(root string) (map[int]float64, error) {
	b, err := os.ReadFile(filepath.Join(root, RawDir, "desmos.json"))
	if err != nil {
		return nil, fmt.Errorf("%w (fog fetch contrib-flightdip)", err)
	}
	var d struct {
		State struct {
			Expressions struct {
				List []struct {
					Type    string `json:"type"`
					Columns []struct {
						Latex  string   `json:"latex"`
						Values []string `json:"values"`
					} `json:"columns"`
				} `json:"list"`
			} `json:"expressions"`
		} `json:"state"`
	}
	if err := json.Unmarshal(b, &d); err != nil {
		return nil, fmt.Errorf("desmos.json: %w", err)
	}
	for _, e := range d.State.Expressions.List {
		if e.Type != "table" || len(e.Columns) < 2 || e.Columns[0].Latex != "h" || e.Columns[1].Latex != "a" {
			continue
		}
		out := map[int]float64{}
		for i, hs := range e.Columns[0].Values {
			h, err1 := strconv.Atoi(hs)
			a, err2 := strconv.ParseFloat(e.Columns[1].Values[i], 64)
			if err1 == nil && err2 == nil {
				out[h] = a
			}
		}
		return out, nil
	}
	return nil, errors.New("desmos.json: no (h, a) table")
}

// Point is one photograph.
type Point struct {
	Flight, Ft             int
	File, Src              string
	UTC, Local, Offset     string
	Lat, Lon               float64 // the aircraft at the instant, from its track
	GpsLat, GpsLon, GpsLag float64 // the phone's position, and how long before the photograph the aircraft was there (s)
	H, HGps, AltFt         float64 // height (m): from the track's pressure altitude in the day's air; the phone's GPS; the transponder's altitude (ft)
	Heading                float64
	Dip, DipExif           float64 // degrees below level: on screen (the contributor's), EXIF
	Lens                   string
	Focal35                int
	Zh, Dh                 float64 // terrain at the horizon (m) and its distance (m), straight light
	ZhA, DhA               float64 // the same in the day's air
	Profile                [][2]float64
	GlobeDip, GlobeDipA    float64 // the globe's dip (6,371 km) over this terrain, straight light and in the day's air (degrees)
	KEff                   float64 // the refraction coefficient the day's air amounts to for this line of sight
	NEye, NHz              float64 // refractivity at the eye and at the horizon's ground
	TEye, PEye, EEye       float64 // the GFS air at the eye: temperature (K), pressure and water vapour pressure (hPa)
	THz, PHz, EHz          float64 // the same on the horizon's ground (column above the horizon)
	Tilt, SigTilt          float64 // the aircraft's acceleration along the view, as a tilt of the phone's level (degrees; true dip = reading + tilt)
	Unresolved             bool    // a turn the track log cannot place: no tilt
	Accel, Gs, Turn        float64 // horizontal acceleration (m/s²), ground speed (m/s), course change within the fit (degrees)
	FlatD                  float64 // the haze distance a plane needs for the reading (m), straight light
	FlatEsc                float64 // the horizon of an unbounded plane in the day's air, degrees ABOVE level
}

// horizon finds the terrain horizon for an eye at h above sea level, apparent curvature c.
func horizon(prof []float64, h, c float64) (eps, z, d float64) {
	eps = math.Inf(-1)
	for i, zi := range prof {
		x := float64(i+1) * Step
		e := (zi-h)/x - c*x/(2*R)
		if e > eps {
			eps, z, d = e, zi, x
		}
	}
	return
}

// obs is one reading for a fit: dip (rad), eye height h and the horizon's
// ground z (m above sea level), and q = n_ground/n_eye (1: straight light).
type obs struct{ d, h, z, q, s float64 } // s: the reading's error (rad), see DispSig

// DispSig is the error of reading the app's dip, shown to 0.1°: a uniform rounding error, 0.1°/√12 (degrees). With the
// acceleration tilt's uncertainty (SigTilt) it makes the σ of each reading for χ²/ν (2026-11-27, the curvature tab's rule:
// χ²/ν only with a reading error known apart from the fit). It does NOT hold the phone's level calibration, nor how the
// horizon is placed on the reticle: a χ²/ν well above 1 says those are larger than what σ holds.
const DispSig = 0.1 / 3.4641016151377544

// chi2nu is Σ ((d − b − pred)/s)² / (n − p).
func chi2nu(os []obs, Rs, b float64, p int) float64 {
	ss := 0.0
	for _, o := range os {
		r := (o.d - b - pred(Rs, o)) / o.s
		ss += r * r
	}
	return ss / float64(len(os)-p)
}

// corr is Pearson's r of the dips with √h: needs no model of the Earth.
func corr(os []obs) float64 {
	n := float64(len(os))
	mx, my := 0.0, 0.0
	for _, o := range os {
		mx += math.Sqrt(o.h)
		my += o.d
	}
	mx, my = mx/n, my/n
	a, b, c := 0.0, 0.0, 0.0
	for _, o := range os {
		x, y := math.Sqrt(o.h)-mx, o.d-my
		a += x * y
		b += x * x
		c += y * y
	}
	return a / math.Sqrt(b*c)
}

// pred is the globe's dip for a reading at radius Rs (Bouguer).
func pred(Rs float64, o obs) float64 { return Bouguer(Rs, o.h, o.z, o.q) }

// offsetFor is the constant offset b (rad) that best fits dips − b to radius Rs.
func offsetFor(os []obs, Rs float64) float64 {
	s := 0.0
	for _, o := range os {
		s += o.d - pred(Rs, o)
	}
	return s / float64(len(os))
}

// fitRb is the least-squares radius: minimise Σ(δ_i − b − δ(R; h_i, z_i,
// q_i))², golden-section search on log R; with offset, a constant zero
// error b of the instrument is fitted too (for each R the best b is the mean
// residual), else b = 0.
func fitRb(os []obs, offset bool) (float64, float64) {
	cost := func(Rs float64) float64 {
		b := 0.0
		if offset {
			b = offsetFor(os, Rs)
		}
		s := 0.0
		for _, o := range os {
			r := o.d - b - pred(Rs, o)
			s += r * r
		}
		return s
	}
	lo, hi := math.Log(5e5), math.Log(1e9)
	g := (math.Sqrt(5) - 1) / 2
	a, b := hi-g*(hi-lo), lo+g*(hi-lo)
	for range 200 {
		if cost(math.Exp(a)) < cost(math.Exp(b)) {
			hi = b
		} else {
			lo = a
		}
		a, b = hi-g*(hi-lo), lo+g*(hi-lo)
	}
	Rs := math.Exp((lo + hi) / 2)
	if offset {
		return Rs, offsetFor(os, Rs)
	}
	return Rs, 0
}

func fitR(os []obs) float64 { r, _ := fitRb(os, false); return r }

// Fit is one variant of the radius.
type Fit struct {
	Name           string
	R, Lo, Hi, Rms float64 // km, km, km (bootstrap 16th-84th percentiles), residual RMS (degrees)
	B, BLo, BHi    float64 // the instrument's constant offset when fitted (degrees), 0 otherwise
	Out            []int   // photographs excluded by the leave-one-out rule (indices)
	N              int
	Chi2nu, Corr   float64 // χ²/ν with each reading's σ (DispSig, SigTilt); r of the dips with √h
}

func rms(os []obs, Rs, b float64) float64 {
	ss := 0.0
	for _, o := range os {
		r := o.d - b - pred(Rs, o)
		ss += r * r
	}
	return math.Sqrt(ss / float64(len(os)))
}

func fit(name string, all []obs, offset bool, seed uint64) Fit {
	// leave-one-out: a point more than 3 SD (of the others' residuals) from the others' fit
	var out []int
	for i := range all {
		var rest []obs
		for j := range all {
			if j != i {
				rest = append(rest, all[j])
			}
		}
		Ri, bi := fitRb(rest, offset)
		sd := rms(rest, Ri, bi) * math.Sqrt(float64(len(rest))/float64(len(rest)-1))
		if math.Abs(all[i].d-bi-pred(Ri, all[i])) > 3*sd {
			out = append(out, i)
		}
	}
	var os []obs
	for i := range all {
		if !contains(out, i) {
			os = append(os, all[i])
		}
	}
	Rf, bf := fitRb(os, offset)
	rng := rand.New(rand.NewPCG(seed, 0x5eed))
	bs, bb := make([]float64, Boot), make([]float64, Boot)
	for b := range bs {
		var bo []obs
		for range os {
			bo = append(bo, os[rng.IntN(len(os))])
		}
		bs[b], bb[b] = fitRb(bo, offset)
	}
	sort.Float64s(bs)
	sort.Float64s(bb)
	q := func(p float64) float64 { return bs[int(p*float64(len(bs)-1))] }
	qb := func(p float64) float64 { return bb[int(p*float64(len(bb)-1))] * 180 / math.Pi }
	return Fit{Name: name, R: Rf / 1000, Lo: q(0.16) / 1000, Hi: q(0.84) / 1000,
		Rms: rms(os, Rf, bf) * 180 / math.Pi, Out: out, N: len(os), B: bf * 180 / math.Pi, BLo: qb(0.16), BHi: qb(0.84),
		Chi2nu: chi2nu(os, Rf, bf, map[bool]int{false: 1, true: 2}[offset]), Corr: corr(os)}
}

func contains(a []int, x int) bool {
	for _, v := range a {
		if v == x {
			return true
		}
	}
	return false
}

// Alt is a model with its own parameters fitted with a constant offset: the
// globe at its surveyed radius (offset only), and the plane's steel-man, a far
// edge lost in haze at a fixed distance D (D and b free).
type Alt struct {
	Name          string
	Param, B, Rms float64 // D (km) for the plane, R (km) for the globe; offset (degrees); RMS (degrees)
	Chi2nu        float64 // with each reading's σ; parameters: the offset (globe), D and the offset (plane)
}

func globeFixed(name string, os []obs) Alt {
	b := offsetFor(os, R)
	return Alt{Name: name, Param: R / 1000, B: b * 180 / math.Pi, Rms: rms(os, R, b) * 180 / math.Pi, Chi2nu: chi2nu(os, R, b, 1)}
}

// readSig is a reading's σ (rad): the display's rounding and, when known, the acceleration tilt's uncertainty.
func readSig(p Point) float64 {
	s := DispSig * DispSig
	if !math.IsNaN(p.SigTilt) {
		s += p.SigTilt * p.SigTilt
	}
	return math.Sqrt(s) * math.Pi / 180
}

// HazeD are the haze distances tried for the plane (m), 20 to 3,000 km.
var HazeD = func() []float64 {
	var d []float64
	for k := 0; k <= 300; k++ {
		d = append(d, 20e3*math.Pow(150, float64(k)/300))
	}
	return d
}()

// planeHaze fits the plane's haze distance and offset: dips[i] is the
// reading (rad), tab[k][i] the plane's dip at HazeD[k] for photograph i.
func planeHaze(name string, dips, sig []float64, tab [][]float64) Alt {
	best := Alt{Rms: math.Inf(1)}
	for k, D := range HazeD {
		b, ss := 0.0, 0.0
		for i := range dips {
			b += dips[i] - tab[k][i]
		}
		b /= float64(len(dips))
		for i := range dips {
			r := dips[i] - b - tab[k][i]
			ss += r * r
		}
		if e := math.Sqrt(ss/float64(len(dips))) * 180 / math.Pi; e < best.Rms {
			c := 0.0
			for i := range dips {
				r := (dips[i] - b - tab[k][i]) / sig[i]
				c += r * r
			}
			best = Alt{Name: name, Param: D / 1000, B: b * 180 / math.Pi, Rms: e, Chi2nu: c / float64(len(dips)-2)}
		}
	}
	return best
}

// gpsLag is how long before t (s) the aircraft passed nearest to the phone's
// position, and how far from it (m): the track's segments, linear in time.
func gpsLag(tr []Fix, t time.Time, lat, lon float64) (float64, float64) {
	cosl := math.Cos(lat * math.Pi / 180)
	xy := func(f Fix) (float64, float64) {
		return (f.Lon - lon) * math.Pi / 180 * R * cosl, (f.Lat - lat) * math.Pi / 180 * R
	}
	best, when := math.Inf(1), t
	for i := 0; i+1 < len(tr); i++ {
		ax, ay := xy(tr[i])
		bx, by := xy(tr[i+1])
		vx, vy := bx-ax, by-ay
		u := 0.0
		if L := vx*vx + vy*vy; L > 0 {
			u = math.Max(0, math.Min(1, -(ax*vx+ay*vy)/L))
		}
		if d := math.Hypot(ax+u*vx, ay+u*vy); d < best {
			best = d
			when = tr[i].T.Add(time.Duration(u * float64(tr[i+1].T.Sub(tr[i].T))))
		}
	}
	return t.Sub(when).Seconds(), best
}

// Result is the preset's content.
type Result struct {
	Points []Point
	Fits   []Fit
	Alts   []Alt
	Log    strings.Builder
}

// Compute reads the photographs, the table, the tracks, the air and the
// terrain, and fits.
func Compute(root string) (*Result, error) {
	tab, err := desmos(root)
	if err != nil {
		return nil, err
	}
	sites, err := readSites(root)
	if err != nil {
		return nil, err
	}
	cop := &dem.Cop{Dir: filepath.Join(root, DemDir), GLO90: true}
	gfs := map[string]map[string]gfsAnswer{}
	res := &Result{}
	type extra struct {
		eye    *Column
		z1, z2 float64
	}
	var ex []extra
	for i, f := range Files {
		s := sites[i]
		m := nameRe.FindStringSubmatch(f[1])
		ft, _ := strconv.Atoi(m[2])
		in, err := readExif(filepath.Join(root, PhotoDir, f[1]))
		if err != nil {
			return nil, err
		}
		a, ok := tab[ft]
		if !ok {
			return nil, fmt.Errorf("%s: no %d ft row in the Desmos table", f[1], ft)
		}
		em := descRe.FindStringSubmatch(in.Description)
		if em == nil {
			return nil, fmt.Errorf("%s: no vert_angle_deg in the EXIF description", f[1])
		}
		ae, _ := strconv.ParseFloat(em[1], 64)
		day := s.t.Format("2006-01-02")
		if gfs[day] == nil {
			if gfs[day], err = readGFS(root, day); err != nil {
				return nil, err
			}
		}
		ga, ok1 := gfs[day][fmt.Sprintf("eye-%d", i)]
		gh, ok2 := gfs[day][fmt.Sprintf("hz-%d", i)]
		if !ok1 || !ok2 {
			return nil, fmt.Errorf("%s: no GFS air (fog fetch --refresh contrib-flightdip)", f[1])
		}
		eye, err := columnAt(ga, s.t)
		if err != nil {
			return nil, err
		}
		hzc, err := columnAt(gh, s.t)
		if err != nil {
			return nil, err
		}
		h := eye.HeightOfPressure(PressureAltitude(s.st.AltFt))
		prof, err := profile(cop, s.st.Lat, s.st.Lon, s.heading, h)
		if err != nil {
			return nil, err
		}
		e1, z1, d1 := horizon(prof, h, 1)
		air := &Air{Eye: eye, Hz: hzc, D: d1}
		thA, xA := Horizon(air, prof, h, R, reach(h), false)
		th0, _ := Horizon(air, prof, h, R, reach(h), true)
		zA := terrainAt(prof, xA)
		nE, nT := eye.N(h), hzc.N(zA)
		tE, pE, eE := eye.at(h)
		tH, pH, eH := hzc.at(zA)
		q := (1 + nT*1e-6) / (1 + nE*1e-6)
		bq := Bouguer(R, h, zA, q)
		c := math.Cos(bq)
		kEff := 1 - R/((c*h-zA)/(1-c))
		lag, miss := gpsLag(s.track, s.t, s.gpsLat, s.gpsLon)
		tilt := s.st.Tilt(s.heading, s.st.Lat)
		var pr [][2]float64
		for j := 0; j < len(prof); j += 8 { // every 2 km for the page
			pr = append(pr, [2]float64{float64(j+1) * Step, math.Round(prof[j])})
		}
		sig := s.st.SigTilt(s.heading) * 180 / math.Pi
		p := Point{Flight: s.flight, Ft: ft, File: f[1], Src: fmt.Sprintf("photos/contrib-flightdip-%d.jpg", i+1),
			UTC: s.t.Format("2006-01-02 15:04:05"), Local: strings.Replace(in.DateTimeOriginal, ":", "-", 2), Offset: in.OffsetTimeOriginal,
			Lat: s.st.Lat, Lon: s.st.Lon, GpsLat: in.Lat, GpsLon: in.Lon, GpsLag: lag,
			H: h, HGps: in.Alt, AltFt: s.st.AltFt, Heading: in.ImgDir,
			Dip: a, DipExif: -ae, Lens: in.Lens, Focal35: in.Focal35,
			Zh: z1, Dh: d1, ZhA: zA, DhA: xA, Profile: pr,
			GlobeDip: -e1 * 180 / math.Pi, GlobeDipA: -thA * 180 / math.Pi, KEff: kEff, NEye: nE, NHz: nT,
			TEye: tE, PEye: pE, EEye: eE, THz: tH, PHz: pH, EHz: eH,
			Tilt: tilt * 180 / math.Pi, SigTilt: sig, Unresolved: s.st.Unresolved, Accel: math.Hypot(s.st.AE, s.st.AN), Gs: math.Hypot(s.st.VE, s.st.VN), Turn: s.st.Turn,
			FlatD:   (h - z1) / math.Tan(a*math.Pi/180),
			FlatEsc: FlatEscape(eye, h) * 180 / math.Pi}
		res.Points = append(res.Points, p)
		ex = append(ex, extra{eye: eye, z1: z1, z2: zA})
		fmt.Fprintf(&res.Log, "%-20s %s  h %5.0f m (GPS %5.0f, %+5.0f m; GPS fix %4.0f s old, %4.0f m off)  dip %.1f° (EXIF %.1f°)  tilt %+.2f°±%.2f%s (a %.2f m/s², view %3.0f° from the track; parabola %+.2f°, %d fixes ±%.0f s)\n",
			f[1], p.UTC[11:], h, in.Alt, in.Alt-h, lag, miss, a, -ae, p.Tilt, sig, map[bool]string{true: " UNRESOLVED"}[p.Unresolved], p.Accel, math.Remainder(s.heading-s.st.Crs, 360), s.st.TiltParabola(s.heading, s.st.Lat)*180/math.Pi, s.st.N, s.st.Span)
		fmt.Fprintf(&res.Log, "%20s horizon %4.0f m at %3.0f km (air %4.0f m at %3.0f km)  globe %.3f° (ray %.3f°)  air %.3f° (Bouguer %.3f°)  k %.3f  N %.0f→%.0f  flat sky-horizon +%.2f°\n",
			"", z1, d1/1000, zA, xA/1000, -e1*180/math.Pi, -th0*180/math.Pi, -thA*180/math.Pi, bq*180/math.Pi, kEff, nE, nT, p.FlatEsc)
	}
	order := make([]int, len(res.Points))
	for i := range order {
		order[i] = i
	}
	sort.SliceStable(order, func(i, j int) bool { return res.Points[order[i]].H < res.Points[order[j]].H })
	pts, exs := make([]Point, len(order)), make([]extra, len(order))
	for k, i := range order {
		pts[k], exs[k] = res.Points[i], ex[i]
	}
	res.Points, ex = pts, exs
	mk := func(sel func(p Point) float64, air, gps bool) []obs {
		var os []obs
		for _, p := range res.Points {
			if math.IsNaN(sel(p)) {
				continue
			}
			o := obs{d: sel(p) * math.Pi / 180, h: p.H, z: p.Zh, q: 1, s: readSig(p)}
			if gps {
				o.h = p.HGps
			}
			if air {
				o.z, o.q = p.ZhA, (1+p.NHz*1e-6)/(1+p.NEye*1e-6)
			}
			os = append(os, o)
		}
		return os
	}
	scr := func(p Point) float64 { return p.Dip }
	exf := func(p Point) float64 { return p.DipExif }
	acc := func(p Point) float64 {
		if p.Unresolved {
			return math.NaN()
		}
		return p.Dip + p.Tilt
	}
	res.Fits = []Fit{
		fit("screen, no refraction", mk(scr, false, false), false, 1),
		fit("screen, air of the day", mk(scr, true, false), false, 2),
		fit("EXIF, no refraction", mk(exf, false, false), false, 3),
		fit("EXIF, air of the day", mk(exf, true, false), false, 4),
		fit("screen, air of the day, accelerations removed", mk(acc, true, false), false, 5),
		fit("screen, no refraction, constant offset", mk(scr, false, false), true, 6),
		fit("screen, air of the day, constant offset", mk(scr, true, false), true, 7),
		fit("screen, air of the day, accelerations removed, constant offset", mk(acc, true, false), true, 8),
		fit("screen, no refraction, the phone's GPS heights", mk(scr, false, true), false, 9),
	}
	// the plane: haze edge at D over the horizon's ground z1, straight or in the eye's air
	n := len(res.Points)
	tab0, tabA := make([][]float64, len(HazeD)), make([][]float64, len(HazeD))
	for k, D := range HazeD {
		tab0[k], tabA[k] = make([]float64, n), make([]float64, n)
		for i, p := range res.Points {
			tab0[k][i] = FlatDip(ex[i].eye, p.H, ex[i].z1, D, true)
			tabA[k][i] = FlatDip(ex[i].eye, p.H, ex[i].z1, D, false)
		}
	}
	// the plane's tables keep the readings a selector keeps
	plane := func(name string, sel func(p Point) float64, tab [][]float64) Alt {
		var d, sg []float64
		var keep []int
		for i, p := range res.Points {
			if !math.IsNaN(sel(p)) {
				d, keep, sg = append(d, sel(p)*math.Pi/180), append(keep, i), append(sg, readSig(p))
			}
		}
		sub := make([][]float64, len(tab))
		for k := range tab {
			for _, i := range keep {
				sub[k] = append(sub[k], tab[k][i])
			}
		}
		return planeHaze(name, d, sg, sub)
	}
	res.Alts = []Alt{
		globeFixed("globe, R = 6,371 km, no refraction, constant offset", mk(scr, false, false)),
		globeFixed("globe, R = 6,371 km, air of the day, constant offset", mk(scr, true, false)),
		globeFixed("globe, R = 6,371 km, air of the day, accelerations removed, constant offset", mk(acc, true, false)),
		plane("plane, haze edge, no refraction, constant offset", scr, tab0),
		plane("plane, haze edge, air of the day, constant offset", scr, tabA),
		plane("plane, haze edge, air of the day, accelerations removed, constant offset", acc, tabA),
	}
	for _, a := range res.Alts {
		fmt.Fprintf(&res.Log, "  %s: %.0f km, offset %+.2f°, rms %.3f°\n", a.Name, a.Param, a.B, a.Rms)
	}
	for _, f := range res.Fits {
		fmt.Fprintf(&res.Log, "  R = %5.0f km (%5.0f..%5.0f), offset %+.2f° (%+.2f..%+.2f), rms %.2f°, n %d, out %v  [%s]\n", f.R, f.Lo, f.Hi, f.B, f.BLo, f.BHi, f.Rms, f.N, f.Out, f.Name)
	}
	return res, nil
}

// Photos writes the published copies (PhotoWidth wide, JPEG quality 85) when
// they are missing or differ.
func Photos(root string) error {
	for i, f := range Files {
		b, err := os.ReadFile(filepath.Join(root, PhotoDir, f[1]))
		if err != nil {
			return err
		}
		img, err := jpeg.Decode(bytes.NewReader(b))
		if err != nil {
			return fmt.Errorf("%s: %w", f[1], err)
		}
		small := resize(img, PhotoWidth)
		var buf bytes.Buffer
		if err := jpeg.Encode(&buf, small, &jpeg.Options{Quality: 85}); err != nil {
			return err
		}
		dest := filepath.Join(root, PubPhotos, fmt.Sprintf("contrib-flightdip-%d.jpg", i+1))
		if old, err := os.ReadFile(dest); err == nil && bytes.Equal(old, buf.Bytes()) {
			continue
		}
		if err := os.WriteFile(dest, buf.Bytes(), 0o644); err != nil {
			return err
		}
	}
	return nil
}

// resize is an area-average downscale to width w.
func resize(src image.Image, w int) *image.RGBA {
	b := src.Bounds()
	sw, sh := b.Dx(), b.Dy()
	h := int(math.Round(float64(sh) * float64(w) / float64(sw)))
	dst := image.NewRGBA(image.Rect(0, 0, w, h))
	fx, fy := float64(sw)/float64(w), float64(sh)/float64(h)
	for y := 0; y < h; y++ {
		y0, y1 := int(float64(y)*fy), int(float64(y+1)*fy)
		for x := 0; x < w; x++ {
			x0, x1 := int(float64(x)*fx), int(float64(x+1)*fx)
			var r, g, bl, n uint64
			for yy := y0; yy < max(y1, y0+1); yy++ {
				for xx := x0; xx < max(x1, x0+1); xx++ {
					cr, cg, cb, _ := src.At(b.Min.X+xx, b.Min.Y+yy).RGBA()
					r, g, bl, n = r+uint64(cr>>8), g+uint64(cg>>8), bl+uint64(cb>>8), n+1
				}
			}
			o := dst.PixOffset(x, y)
			dst.Pix[o], dst.Pix[o+1], dst.Pix[o+2], dst.Pix[o+3] = uint8(r/n), uint8(g/n), uint8(bl/n), 255
		}
	}
	return dst
}

func round(x float64, n int) float64 { p := math.Pow(10, float64(n)); return math.Round(x*p) / p }

var compact = pyjson.Opts{Item: ",", Key: ":", ASCII: true}

// File is the preset.
func (r *Result) File() preset.File {
	var pts []any
	for _, p := range r.Points {
		var pr []any
		for _, q := range p.Profile {
			pr = append(pr, []float64{q[0], q[1]})
		}
		var sig any
		if !math.IsNaN(p.SigTilt) {
			sig = round(p.SigTilt, 2)
		}
		pts = append(pts, pyjson.Obj{{K: "flight", V: p.Flight}, {K: "ft", V: p.Ft}, {K: "file", V: p.File}, {K: "src", V: p.Src},
			{K: "utc", V: p.UTC}, {K: "local", V: p.Local}, {K: "offset", V: p.Offset},
			{K: "lat", V: round(p.Lat, 4)}, {K: "lon", V: round(p.Lon, 4)}, {K: "gpsLat", V: round(p.GpsLat, 5)}, {K: "gpsLon", V: round(p.GpsLon, 5)}, {K: "gpsLag", V: round(p.GpsLag, 0)},
			{K: "h", V: round(p.H, 0)}, {K: "hGps", V: round(p.HGps, 0)}, {K: "altFt", V: round(p.AltFt, 0)}, {K: "heading", V: round(p.Heading, 1)},
			{K: "dip", V: p.Dip}, {K: "dipExif", V: p.DipExif}, {K: "lens", V: p.Lens}, {K: "focal35", V: p.Focal35},
			{K: "zh", V: round(p.Zh, 0)}, {K: "dh", V: round(p.Dh, 0)}, {K: "zhA", V: round(p.ZhA, 0)}, {K: "dhA", V: round(p.DhA, 0)},
			{K: "globeDip", V: round(p.GlobeDip, 3)}, {K: "globeDipA", V: round(p.GlobeDipA, 3)}, {K: "kEff", V: round(p.KEff, 3)},
			{K: "nEye", V: round(p.NEye, 1)}, {K: "nHz", V: round(p.NHz, 1)},
			{K: "tEye", V: round(p.TEye, 2)}, {K: "pEye", V: round(p.PEye, 2)}, {K: "eEye", V: round(p.EEye, 3)},
			{K: "tHz", V: round(p.THz, 2)}, {K: "pHz", V: round(p.PHz, 2)}, {K: "eHz", V: round(p.EHz, 3)},
			{K: "tilt", V: round(p.Tilt, 2)}, {K: "sigTilt", V: sig}, {K: "unresolved", V: p.Unresolved}, {K: "accel", V: round(p.Accel, 3)}, {K: "gs", V: round(p.Gs, 1)}, {K: "turn", V: round(p.Turn, 0)},
			{K: "flatD", V: round(p.FlatD, 0)}, {K: "flatEsc", V: round(p.FlatEsc, 2)}, {K: "profile", V: pr}})
	}
	var fits []any
	for _, f := range r.Fits {
		out := f.Out
		if out == nil {
			out = []int{}
		}
		fits = append(fits, pyjson.Obj{{K: "name", V: f.Name}, {K: "R", V: round(f.R, 0)}, {K: "lo", V: round(f.Lo, 0)}, {K: "hi", V: round(f.Hi, 0)},
			{K: "rms", V: round(f.Rms, 3)}, {K: "n", V: f.N}, {K: "out", V: out},
			{K: "b", V: round(f.B, 3)}, {K: "bLo", V: round(f.BLo, 3)}, {K: "bHi", V: round(f.BHi, 3)},
			{K: "chi2nu", V: round(f.Chi2nu, 2)}, {K: "r", V: round(f.Corr, 3)}})
	}
	var alts []any
	for _, a := range r.Alts {
		alts = append(alts, pyjson.Obj{{K: "name", V: a.Name}, {K: "param", V: round(a.Param, 0)}, {K: "b", V: round(a.B, 3)}, {K: "rms", V: round(a.Rms, 3)}, {K: "chi2nu", V: round(a.Chi2nu, 2)}})
	}
	var inputs []string
	inputs = append(inputs, Dir+"/inputs.lock")
	return preset.File{
		Out: Out, Command: "build contrib-flightdip", Inputs: inputs,
		Notes: []string{
			"Horizon dips measured from airliner windows by earthlyskeptic with the Theodolite iPhone app (2 flights, September",
			"2025): his on-screen readings (Desmos table) and the EXIF ones; heights from the FlightAware (ADS-B) track logs'",
			"pressure altitudes in the GFS air (the phone's GPS kept for comparison: it froze on flight 2), the aircraft's",
			"acceleration along the view, terrain at the horizon from Copernicus GLO-90, the dip traced through the day's air;",
			"the radius fitted to the dips (km, bootstrap 16-84 %).",
		},
		Body: "export const FD_POINTS = " + pyjson.Dumps(pts, compact) + ";\nexport const FD_FITS = " + pyjson.Dumps(fits, compact) + ";\nexport const FD_ALTS = " + pyjson.Dumps(alts, compact) + ";\n",
	}
}
