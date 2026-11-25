package satdop

import (
	"compress/gzip"
	"io"
	"math"
	"os"
	"strconv"
	"strings"
)

// The broadcast navigation message is read ONLY to start the iterations
// (a first guess of each satellite's state); the solution's independence
// from that start is tested by restarting from perturbed states.

type kep struct {
	toe, sqa, ecc, i0, om0, w, m0, dn, omd, idot, cuc, cus, crc, crs, cic, cis float64
	mu, health                                                                 float64
}

type gloRec struct {
	t         float64 // s since the day's 00:00 GPS time
	x, v, acc [3]float64
	health    float64
}

func nf(s string) float64 {
	s = strings.TrimSpace(strings.NewReplacer("D", "E", "d", "e").Replace(s))
	if s == "" {
		return 0
	}
	v, _ := strconv.ParseFloat(s, 64)
	return v
}

func sub(s string, a, b int) string {
	if a >= len(s) {
		return ""
	}
	return s[a:min(b, len(s))]
}

// readNav: Keplerian records of GPS and Galileo, state-vector records of GLONASS.
func readNav(path string) (map[string][]kep, map[string][]gloRec, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, nil, err
	}
	defer f.Close()
	gz, err := gzip.NewReader(f)
	if err != nil {
		return nil, nil, err
	}
	b, err := io.ReadAll(gz)
	if err != nil {
		return nil, nil, err
	}
	lines := strings.Split(string(b), "\n")
	i := 0
	for ; i < len(lines); i++ {
		if strings.Contains(lines[i], "END OF HEADER") {
			i++
			break
		}
	}
	K := map[string][]kep{}
	G := map[string][]gloRec{}
	for ; i < len(lines); i++ {
		h := lines[i]
		if len(h) < 23 || (h[0] != 'G' && h[0] != 'E' && h[0] != 'R') || h[1] < '0' || h[1] > '9' {
			continue
		}
		sat := h[:3]
		y, _ := strconv.Atoi(sub(h, 4, 8))
		mo, _ := strconv.Atoi(sub(h, 9, 11))
		d, _ := strconv.Atoi(sub(h, 12, 14))
		hh, _ := strconv.Atoi(sub(h, 15, 17))
		mi, _ := strconv.Atoi(sub(h, 18, 20))
		ss, _ := strconv.Atoi(sub(h, 21, 23))
		if h[0] == 'R' {
			if i+3 >= len(lines) {
				break
			}
			var v [12]float64
			for k := 0; k < 3; k++ {
				ln := lines[i+1+k]
				for q := 0; q < 4; q++ {
					v[4*k+q] = nf(sub(ln, 4+19*q, 23+19*q))
				}
			}
			if y == 2025 && mo == 4 && d == 10 {
				t := float64(hh*3600+mi*60+ss) + 18 // UTC -> GPS time (18 leap seconds)
				G[sat] = append(G[sat], gloRec{t: t, x: [3]float64{v[0] * 1e3, v[4] * 1e3, v[8] * 1e3},
					v: [3]float64{v[1] * 1e3, v[5] * 1e3, v[9] * 1e3}, acc: [3]float64{v[2] * 1e3, v[6] * 1e3, v[10] * 1e3}, health: v[3]})
			}
			i += 3
			continue
		}
		if i+7 >= len(lines) {
			break
		}
		var v []float64
		for _, ln := range lines[i+1 : i+8] {
			for q := 0; q < 4; q++ {
				v = append(v, nf(sub(ln, 4+19*q, 23+19*q)))
			}
		}
		mu := 3.986005e14
		hl := v[21]
		if h[0] == 'E' {
			mu = 3.986004418e14
			hl = 0
		}
		_ = y
		K[sat] = append(K[sat], kep{crs: v[1], dn: v[2], m0: v[3], cuc: v[4], ecc: v[5], cus: v[6], sqa: v[7], toe: v[8],
			cic: v[9], om0: v[10], cis: v[11], i0: v[12], crc: v[13], w: v[14], omd: v[15], idot: v[16], mu: mu, health: hl})
		i += 7
	}
	return K, G, nil
}

const omegaWGS = 7.2921151467e-5 // only to rotate the broadcast first guess into an inertial frame

// kepECEF: broadcast Keplerian ECEF position at s of week t.
func kepECEF(e *kep, t float64) [3]float64 {
	a := e.sqa * e.sqa
	tk := math.Mod(t-e.toe+302400+604800*4, 604800) - 302400
	n := math.Sqrt(e.mu/(a*a*a)) + e.dn
	M := e.m0 + n*tk
	E := M
	for k := 0; k < 15; k++ {
		E = M + e.ecc*math.Sin(E)
	}
	nu := math.Atan2(math.Sqrt(1-e.ecc*e.ecc)*math.Sin(E), math.Cos(E)-e.ecc)
	phi := nu + e.w
	s2, c2 := math.Sin(2*phi), math.Cos(2*phi)
	u := phi + e.cus*s2 + e.cuc*c2
	r := a*(1-e.ecc*math.Cos(E)) + e.crs*s2 + e.crc*c2
	i := e.i0 + e.idot*tk + e.cis*s2 + e.cic*c2
	xp, yp := r*math.Cos(u), r*math.Sin(u)
	om := e.om0 + (e.omd-omegaWGS)*tk - omegaWGS*e.toe
	ci, si, co, so := math.Cos(i), math.Sin(i), math.Cos(om), math.Sin(om)
	return [3]float64{xp*co - yp*ci*so, xp*so + yp*ci*co, yp * si}
}
