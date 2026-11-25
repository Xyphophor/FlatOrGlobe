package lomond

import (
	"encoding/json"
	"fmt"
	"math"
	"os"
	"path/filepath"
	"time"

	"flatorglobe/tools/internal/tide"
)

// tideM: the constituents four weeks of readings can separate (Rayleigh
// criterion, 1/T = 0.036 cycle/day): K2 and P1 (182 days from S2 and K1),
// nu2 and mu2 (207 days from N2 and 2N2) and the long-period tides are left
// out [Foreman 1977, § 2.2].
var tideM = tide.Pick("Q1", "O1", "K1", "2N2", "N2", "M2", "L2", "S2", "MN4", "M4", "MS4", "M6")

// Tide is the sea level at the photograph from the Leith gauge.
type Tide struct {
	N       int     // readings in the four weeks
	Z0      float64 // mean level of the fit (gauge datum, m)
	Gap     [2]float64
	Water   float64   // at the photograph, m above the four weeks' mean level
	Pred    float64   // the harmonic prediction alone, same datum
	Surge   float64   // the residual (weather) interpolated across the gap
	Hours   []float64 // the day, hour by hour (UTC 0..24), m above the mean level
	HL      [][]any   // the day's highs and lows ("HH:MM" UTC, "High"/"Low", m)
	CheckN  int       // held-out windows of the gap's length
	CheckCm float64   // their RMS error (cm) at the photograph's offset
	Rms     float64   // residual RMS of the fit (cm)
	Series  [][2]float64
}

type reading struct {
	t, h float64
}

// leith reads the IOC answer (UTC, metres above the gauge's datum).
func leith(root string) ([]reading, error) {
	b, err := os.ReadFile(filepath.Join(root, RawDir, "leith.json"))
	if err != nil {
		return nil, fmt.Errorf("%w (fog fetch contrib-lomond)", err)
	}
	var rows []struct {
		Slevel float64 `json:"slevel"`
		Stime  string  `json:"stime"`
	}
	if err := json.Unmarshal(b, &rows); err != nil {
		return nil, fmt.Errorf("leith.json: %w", err)
	}
	var out []reading
	for _, r := range rows {
		t, err := time.Parse("2006-01-02 15:04:05", r.Stime)
		if err != nil {
			return nil, err
		}
		out = append(out, reading{float64(t.Unix()), r.Slevel})
	}
	return out, nil
}

// tideAt fits the four weeks, predicts the photograph's instant and adds the
// residual (the weather's surge) interpolated linearly across the gap in
// the readings that covers it. Checked by removing every window of the
// gap's length (stepped by 3 h) and predicting the reading at the
// photograph's offset into it the same way.
func tideAt(rs []reading, ts float64) (*Tide, error) {
	t := make([]float64, len(rs))
	h := make([]float64, len(rs))
	for i, r := range rs {
		t[i], h[i] = r.t, r.h
	}
	x := tideM.FitSeries(t, h)
	res := make([]float64, len(rs))
	ss := 0.0
	for i := range rs {
		res[i] = h[i] - tideM.At(x, t[i])
		ss += res[i] * res[i]
	}
	// the gap around ts
	k := 0
	for k < len(t) && t[k] < ts {
		k++
	}
	if k == 0 || k == len(t) {
		return nil, fmt.Errorf("photograph outside the gauge's readings")
	}
	a, b := k-1, k
	surge := func(a, b int, ts float64) float64 {
		return res[a] + (ts-t[a])/(t[b]-t[a])*(res[b]-res[a])
	}
	out := &Tide{N: len(rs), Z0: x[0], Gap: [2]float64{t[a], t[b]}, Rms: round(math.Sqrt(ss/float64(len(rs)))*100, 1)}
	out.Pred = tideM.At(x, ts) - x[0]
	out.Surge = surge(a, b, ts)
	out.Water = out.Pred + out.Surge
	// held-out windows: same length as the gap, the photograph at the same offset
	L, off := t[b]-t[a], ts-t[a]
	var e2 []float64
	for w := t[0] + 6*3600; w+L < t[len(t)-1]-6*3600; w += 3 * 3600 {
		if math.Abs(w-t[a]) < 2*L {
			continue
		}
		i := 0
		for i < len(t) && t[i] < w {
			i++
		}
		j := i
		for j < len(t) && t[j] < w+L {
			j++
		}
		// the reading closest to w+off inside the window
		best := -1
		for q := i; q < j; q++ {
			if best < 0 || math.Abs(t[q]-(w+off)) < math.Abs(t[best]-(w+off)) {
				best = q
			}
		}
		if best < 0 || i == 0 || j >= len(t) || math.Abs(t[best]-(w+off)) > 450 {
			continue
		}
		p := tideM.At(x, t[best]) + surge(i-1, j, t[best])
		e2 = append(e2, (p-h[best])*(p-h[best]))
	}
	s := 0.0
	for _, v := range e2 {
		s += v
	}
	out.CheckN = len(e2)
	out.CheckCm = round(math.Sqrt(s/float64(len(e2)))*100, 1)
	// the day, hour by hour: readings where there are some, the fill in the gap
	day0 := float64(time.Date(2023, 8, 9, 0, 0, 0, 0, time.UTC).Unix())
	for hh := 0; hh <= 24; hh++ {
		tt := day0 + float64(hh)*3600
		v := math.NaN()
		for i := range t {
			if t[i] == tt {
				v = h[i] - x[0]
			}
		}
		if math.IsNaN(v) {
			v = tideM.At(x, tt) - x[0] + surge(a, b, tt)
			if tt < t[a] || tt > t[b] {
				v = tideM.At(x, tt) - x[0]
			}
		}
		out.Hours = append(out.Hours, round(v, 3))
	}
	for _, e := range tideM.Extrema(x, day0, day0+86400) {
		out.HL = append(out.HL, []any{time.Unix(int64(e.T), 0).UTC().Format("15:04"), e.Typ, round(e.H-x[0], 2)})
	}
	// readings of the photograph's morning (0-12 h UTC), for the page's curve
	for i := range t {
		if t[i] >= day0 && t[i] <= day0+12*3600 {
			out.Series = append(out.Series, [2]float64{(t[i] - day0) / 3600, round(h[i]-x[0], 3)})
		}
	}
	return out, nil
}
