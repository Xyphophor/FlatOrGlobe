package flightdip

import (
	"encoding/json"
	"fmt"
	"math"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"flatorglobe/tools/internal/refrac"
)

// PLevels are the GFS pressure levels read (hPa).
var PLevels = []int{1000, 975, 950, 925, 900, 850, 800, 750, 700, 650, 600, 550, 500, 450, 400, 350, 300, 250, 200, 150, 100}

// GFSURL is Open-Meteo's historical forecast API, NOAA GFS [Open-Meteo].
const GFSURL = "https://historical-forecast-api.open-meteo.com/v1/forecast"

// gfsVars lists the hourly variables requested at each point.
func gfsVars() string {
	v := []string{"temperature_2m", "dew_point_2m", "surface_pressure"}
	for _, p := range PLevels {
		v = append(v, fmt.Sprintf("temperature_%dhPa", p), fmt.Sprintf("relative_humidity_%dhPa", p), fmt.Sprintf("geopotential_height_%dhPa", p))
	}
	return strings.Join(v, ",")
}

// Site is a place where the air is read: a label, a position.
type Site struct {
	Label    string
	Lat, Lon float64
}

// gfsFile is raw/gfs-<day>.json: the sites asked and Open-Meteo's answers, in
// the same order.
type gfsFile struct {
	Sites   []Site            `json:"sites"`
	Answers []json.RawMessage `json:"answers"`
}

type gfsAnswer struct {
	Latitude, Longitude, Elevation float64
	Hourly                         map[string]json.RawMessage
}

// Column is the air above one place at one instant, from the model: levels
// ascending in height (m above sea level), temperature (K), pressure (hPa),
// vapour pressure (hPa). The lowest level is the model's 2 m air over its
// own ground.
type Column struct {
	Z, T, P, E []float64
	Elev       float64 // the model's ground (m)
}

// columnAt reads a site's column at t, interpolating linearly in time
// between the hourly values. A level at or below the model's ground is left
// out. The vapour pressure is the relative humidity times the saturation
// pressure over water (Magnus) [WMO 2008].
func columnAt(a gfsAnswer, t time.Time) (*Column, error) {
	var times []string
	if err := json.Unmarshal(a.Hourly["time"], &times); err != nil {
		return nil, err
	}
	h := -1
	for i, s := range times {
		tt, err := time.Parse("2006-01-02T15:04", s)
		if err != nil {
			return nil, err
		}
		if !tt.After(t) {
			h = i
		}
	}
	if h < 0 || h+1 >= len(times) {
		return nil, fmt.Errorf("gfs: %s outside the answer", t)
	}
	t0, _ := time.Parse("2006-01-02T15:04", times[h])
	w := t.Sub(t0).Seconds() / 3600
	get := func(k string) (float64, error) {
		var v []*float64
		if err := json.Unmarshal(a.Hourly[k], &v); err != nil || len(v) <= h+1 || v[h] == nil || v[h+1] == nil {
			return 0, fmt.Errorf("gfs: %s missing", k)
		}
		return *v[h] + w*(*v[h+1]-*v[h]), nil
	}
	c := &Column{Elev: a.Elevation}
	t2, err := get("temperature_2m")
	if err != nil {
		return nil, err
	}
	td, err := get("dew_point_2m")
	if err != nil {
		return nil, err
	}
	sp, err := get("surface_pressure")
	if err != nil {
		return nil, err
	}
	c.Z, c.T, c.P, c.E = []float64{a.Elevation + 2}, []float64{t2 + 273.15}, []float64{sp}, []float64{refrac.Esat(td)}
	for _, p := range PLevels {
		if float64(p) >= sp {
			continue
		}
		z, err1 := get(fmt.Sprintf("geopotential_height_%dhPa", p))
		tt, err2 := get(fmt.Sprintf("temperature_%dhPa", p))
		rh, err3 := get(fmt.Sprintf("relative_humidity_%dhPa", p))
		if err1 != nil || err2 != nil || err3 != nil {
			return nil, fmt.Errorf("gfs: level %d hPa missing", p)
		}
		if z <= c.Z[len(c.Z)-1] {
			continue
		}
		c.Z, c.T, c.P, c.E = append(c.Z, z), append(c.T, tt+273.15), append(c.P, float64(p)), append(c.E, math.Max(rh, 0.5)/100*refrac.Esat(tt))
	}
	if len(c.Z) < 5 {
		return nil, fmt.Errorf("gfs: %d levels", len(c.Z))
	}
	return c, nil
}

// at returns T (K), P (hPa), e (hPa) at height z: T linear, ln P and ln e
// linear in height between levels, the end intervals extended beyond.
func (c *Column) at(z float64) (float64, float64, float64) {
	n := len(c.Z)
	i := sort.SearchFloat64s(c.Z, z)
	if i < 1 {
		i = 1
	}
	if i > n-1 {
		i = n - 1
	}
	u := (z - c.Z[i-1]) / (c.Z[i] - c.Z[i-1])
	T := c.T[i-1] + u*(c.T[i]-c.T[i-1])
	P := math.Exp(math.Log(c.P[i-1]) + u*(math.Log(c.P[i])-math.Log(c.P[i-1])))
	E := math.Exp(math.Log(c.E[i-1]) + u*(math.Log(c.E[i])-math.Log(c.E[i-1])))
	return T, P, E
}

// N is the refractivity (n − 1)·10⁶ in the visible at height z, the formula
// of package refrac: N = 79.01 P/T − 12.0 e/T [Ciddor 1996].
func (c *Column) N(z float64) float64 {
	T, P, E := c.at(z)
	return 79.01*P/T - 12.0*E/T
}

// HeightOfPressure is the height (m) where the column's pressure is p (hPa).
func (c *Column) HeightOfPressure(p float64) float64 {
	lo, hi := -1000.0, 20000.0
	for range 60 {
		m := (lo + hi) / 2
		if _, P, _ := c.at(m); P > p {
			lo = m
		} else {
			hi = m
		}
	}
	return (lo + hi) / 2
}

// PressureAltitude is the pressure (hPa) a transponder's altitude H (ft)
// stands for: the ICAO standard atmosphere below 11 km,
// p = 1013.25 (1 − 2.25577·10⁻⁵ H_m)^5.25588 [ICAO 1993].
func PressureAltitude(ft float64) float64 {
	return 1013.25 * math.Pow(1-2.25577e-5*ft*0.3048, 5.25588)
}

// Air is the refractivity along a line of sight: the column above the
// aircraft blended linearly with distance into the column above the horizon.
type Air struct {
	Eye, Hz *Column
	D       float64 // distance (m) at which the horizon's column takes over fully
}

// N at height z, distance x.
func (a *Air) N(z, x float64) float64 {
	w := 0.0
	if a.D > 0 {
		w = math.Min(1, math.Max(0, x/a.D))
	}
	return (1-w)*a.Eye.N(z) + w*a.Hz.N(z)
}

// dNdz by central difference (1 m).
func (a *Air) dNdz(z, x float64) float64 { return (a.N(z+1, x) - a.N(z-1, x)) / 2 }

// Ray traces a ray from height h with initial elevation th (rad, negative
// downward) over a sphere of radius Rs (Rs = 0: a plane), in steps of dx
// metres of ground distance, over the terrain prof (heights every Step m from
// Step on): it returns whether it got to xmax without meeting the ground, and
// the smallest clearance (m) above the terrain with its distance. In polar
// coordinates (r, φ) with θ the elevation over the local horizontal and x =
// Rs·φ [Born & Wolf 1999, §3.2; Bomford 1980, ch. 3]:
//
//	dz/dx = (r/Rs) tan θ,   dθ/dx = (r/Rs)(1/r + (dn/dz)/n)
//
// and on a plane dz/dx = tan θ, dθ/dx = (dn/dz)/n. Midpoint steps; noAir
// traces straight lines.
func Ray(air *Air, prof []float64, h, th, Rs, dx, xmax float64, noAir bool) (bool, float64, float64) {
	z, x := h, 0.0
	clear, at := math.Inf(1), 0.0
	f := func(z, th, x float64) (float64, float64) {
		g := 0.0
		if !noAir {
			g = air.dNdz(z, x) * 1e-6 / (1 + air.N(z, x)*1e-6)
		}
		if Rs == 0 {
			return math.Tan(th), g
		}
		r := Rs + z
		return r / Rs * math.Tan(th), r / Rs * (1/r + g)
	}
	for x < xmax {
		dz1, dt1 := f(z, th, x)
		dz2, dt2 := f(z+dz1*dx/2, th+dt1*dx/2, x+dx/2)
		z, th, x = z+dz2*dx, th+dt2*dx, x+dx
		g := terrainAt(prof, x)
		if c := z - g; c < clear {
			clear, at = c, x
		}
		if z <= g {
			return false, clear, at
		}
	}
	return true, clear, at
}

func terrainAt(prof []float64, x float64) float64 {
	u := x/Step - 1
	if u <= 0 {
		return prof[0]
	}
	i := int(u)
	if i >= len(prof)-1 {
		return prof[len(prof)-1]
	}
	return prof[i] + (u-float64(i))*(prof[i+1]-prof[i])
}

// Horizon is the elevation (rad) of the terrain horizon: the lowest ray that
// still clears the terrain out to xmax (bisection), and the distance where
// it grazes.
func Horizon(air *Air, prof []float64, h, Rs, xmax float64, noAir bool) (float64, float64) {
	lo, hi := -0.1, 0.05
	var at float64
	for range 40 {
		m := (lo + hi) / 2
		ok, _, x := Ray(air, prof, h, m, Rs, 100, xmax, noAir)
		if ok {
			hi, at = m, x
		} else {
			lo = m
		}
	}
	return hi, at
}

// Bouguer is the dip (rad) of a ray grazing a sphere of radius Rs + zt where
// the index is nt, seen from Rs + h where it is ne: in spherically layered
// air n·r·cos θ is the same all along a ray [Bouguer 1729; Born & Wolf 1999,
// §3.2.2], so cos δ = nt (Rs + zt) / (ne (Rs + h)). Straight light: nt = ne.
func Bouguer(Rs, h, zt, q float64) float64 {
	c := q * (Rs + zt) / (Rs + h)
	if c >= 1 {
		return 0
	}
	return math.Acos(c)
}

// FlatDip is the dip (rad) at which, over a plane in horizontally layered
// air, the ground at height zg and distance D is seen from height h:
// n cos θ is the same all along the ray [Born & Wolf 1999, §3.2.2], so the
// ray's slope at height z is fixed and x = ∫ dz / tan|θ(z)| from zg to h;
// bisection on the dip. noAir: atan((h − zg)/D).
func FlatDip(col *Column, h, zg, D float64, noAir bool) float64 {
	if noAir {
		return math.Atan((h - zg) / D)
	}
	ne := 1 + col.N(h)*1e-6
	ns := make([]float64, 200)
	for i := range ns {
		ns[i] = 1 + col.N(zg+(h-zg)*(float64(i)+0.5)/200)*1e-6
	}
	reach := func(d float64) float64 {
		x, dz := 0.0, (h-zg)/200
		for _, n := range ns {
			c := ne * math.Cos(d) / n
			x += dz * c / math.Sqrt(1-c*c)
		}
		return x
	}
	lo, hi := 1e-7, 0.3
	for range 60 {
		m := (lo + hi) / 2
		if reach(m) > D {
			lo = m
		} else {
			hi = m
		}
	}
	return (lo + hi) / 2
}

// FlatEscape is the elevation (rad, above level) of the horizon of an
// unbounded plane in this air: a ray launched upward at α comes back down to
// the ground whenever n_eye cos α exceeds the index at the top of the air,
// 1; the last such ray, cos α = 1/n_eye, is the farthest ground seen.
func FlatEscape(col *Column, h float64) float64 { return math.Acos(1 / (1 + col.N(h)*1e-6)) }

// readGFS reads the stored answers of one day by site label.
func readGFS(root, day string) (map[string]gfsAnswer, error) {
	b, err := os.ReadFile(filepath.Join(root, RawDir, "gfs-"+day+".json"))
	if err != nil {
		return nil, fmt.Errorf("%w (fog fetch contrib-flightdip)", err)
	}
	var f gfsFile
	if err := json.Unmarshal(b, &f); err != nil {
		return nil, err
	}
	out := map[string]gfsAnswer{}
	for i, s := range f.Sites {
		var a gfsAnswer
		if err := json.Unmarshal(f.Answers[i], &a); err != nil {
			return nil, err
		}
		out[s.Label] = a
	}
	return out, nil
}
