package satdop

import (
	"bytes"
	"encoding/gob"
	"fmt"
	"math"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

const (
	Dir      = "data/sat"
	RawDir   = Dir + "/raw"
	Stations = Dir + "/stations.txt"
	Out      = "src/data/presets/sat-doppler.js"
	Day      = "2025-04-10"
	Step     = 300         // one point every 5 minutes per satellite and station
	SowDay   = 4 * 86400.0 // 2025-04-10 is a Thursday: seconds of the GPS week at 00:00
)

// Station is one receiver's raw Doppler for the day.
type Station struct {
	ID     string
	Header [3]float64
	Obs    []Obs
}

func readStations(root string) ([][2]string, error) {
	b, err := os.ReadFile(filepath.Join(root, Stations))
	if err != nil {
		return nil, err
	}
	var out [][2]string
	for _, ln := range strings.Split(string(b), "\n") {
		f := strings.Fields(ln)
		if len(f) == 2 && !strings.HasPrefix(f[0], "#") {
			out = append(out, [2]string{f[0], f[1]})
		}
	}
	return out, nil
}

// LoadAll decompresses every station (cached in cache if non-empty).
func LoadAll(root string, step int, cache string) ([]Station, error) {
	if cache != "" {
		if b, err := os.ReadFile(cache); err == nil {
			var st []Station
			if gob.NewDecoder(bytes.NewReader(b)).Decode(&st) == nil {
				return st, nil
			}
		}
	}
	list, err := readStations(root)
	if err != nil {
		return nil, err
	}
	st := make([]Station, len(list))
	errs := make([]error, len(list))
	parallel(len(list), func(k int) {
		txt, err := decompress(root, filepath.Join(root, RawDir, list[k][1]))
		if err != nil {
			errs[k] = err
			return
		}
		obs, err := ReadDoppler(bytes.NewReader(txt), step)
		if err != nil {
			errs[k] = fmt.Errorf("%s: %v", list[k][0], err)
			return
		}
		st[k] = Station{ID: list[k][0], Header: headerXYZ(txt), Obs: obs}
	})
	for _, e := range errs {
		if e != nil {
			return nil, e
		}
	}
	if cache != "" {
		var buf bytes.Buffer
		gob.NewEncoder(&buf).Encode(st)
		os.WriteFile(cache, buf.Bytes(), 0o644)
	}
	return st, nil
}

// Build turns the stations' observations into a Problem (SNR ≥ minSNR dB-Hz).
func Build(st []Station, minSNR float64) *Problem {
	p := &Problem{}
	sats := map[string]bool{}
	for _, s := range st {
		p.Sta = append(p.Sta, s.ID)
		for _, o := range s.Obs {
			sats[o.Sat] = true
		}
	}
	for s := range sats {
		p.Sats = append(p.Sats, s)
	}
	sort.Strings(p.Sats)
	si := map[string]int{}
	for i, s := range p.Sats {
		si[s] = i
	}
	for k, s := range st {
		for _, o := range s.Obs {
			if o.SNR >= minSNR || o.SNR < 0 {
				p.Obs = append(p.Obs, O{Sat: si[o.Sat], Sta: k, T: o.T, Rate: o.Rate, Use: true})
			}
		}
	}
	p.Index()
	return p
}

// rotz turns v by angle a about z.
func rotz(v [3]float64, a float64) [3]float64 {
	c, s := math.Cos(a), math.Sin(a)
	return [3]float64{c*v[0] - s*v[1], s*v[0] + c*v[1], v[2]}
}

// BroadcastStart: a first guess of each satellite's inertial state at Tep
// from the broadcast message, in the frame where station 0 has y = 0.
// Satellites without a usable record are dropped from the problem.
func BroadcastStart(root string, p *Problem, lon0 float64) (map[string][6]float64, error) {
	K, G, err := readNav(filepath.Join(root, RawDir, "BRDC.rnx.gz"))
	if err != nil {
		return nil, err
	}
	out := map[string][6]float64{}
	toI := func(rE, vE [3]float64, t float64) [6]float64 {
		r := rotz(rE, -lon0)
		v := rotz(vE, -lon0)
		v = [3]float64{v[0] - omegaWGS*r[1], v[1] + omegaWGS*r[0], v[2]}
		r, v = rotz(r, omegaWGS*t), rotz(v, omegaWGS*t)
		return [6]float64{r[0], r[1], r[2], v[0], v[1], v[2]}
	}
	sow := SowDay + Tep
	for _, s := range p.Sats {
		if ks, ok := K[s]; ok {
			var best *kep
			bd := 1e18
			for i := range ks {
				if ks[i].health != 0 {
					continue
				}
				d := math.Abs(ks[i].toe - sow)
				if d < bd {
					best, bd = &ks[i], d
				}
			}
			if best == nil || bd > 4*3600 {
				continue
			}
			r := kepECEF(best, sow)
			r1, r2 := kepECEF(best, sow+0.5), kepECEF(best, sow-0.5)
			v := [3]float64{r1[0] - r2[0], r1[1] - r2[1], r1[2] - r2[2]}
			out[s] = toI(r, v, Tep)
		} else if gs, ok := G[s]; ok {
			var best *gloRec
			bd := 1e18
			for i := range gs {
				if gs[i].health != 0 {
					continue
				}
				d := math.Abs(gs[i].t - Tep)
				if d < bd {
					best, bd = &gs[i], d
				}
			}
			if best == nil || bd > 3600 {
				continue
			}
			x := toI(best.x, best.v, best.t)
			// bring it to Tep with a point-mass + J2 force (first guess only)
			tr := propagate(x, best.t, 3.986004418e14, 1.7555e25)
			out[s] = tr[int(Tep/H)]
		}
	}
	return out, nil
}

// KeepSats keeps only the satellites with a first guess.
func (p *Problem) KeepSats(start map[string][6]float64) {
	re := map[int]int{}
	var sats []string
	for i, s := range p.Sats {
		if _, ok := start[s]; ok {
			re[i] = len(sats)
			sats = append(sats, s)
		}
	}
	var obs []O
	for _, o := range p.Obs {
		if j, ok := re[o.Sat]; ok {
			o.Sat = j
			obs = append(obs, o)
		}
	}
	p.Sats, p.Obs = sats, obs
	p.Index()
}

// SaveModel / LoadModel: a model on disk (development).
func SaveModel(m *Model, path string) error {
	var buf bytes.Buffer
	if err := gob.NewEncoder(&buf).Encode(m); err != nil {
		return err
	}
	return os.WriteFile(path, buf.Bytes(), 0o644)
}

func LoadModel(path string) (*Model, error) {
	b, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var m Model
	return &m, gob.NewDecoder(bytes.NewReader(b)).Decode(&m)
}
