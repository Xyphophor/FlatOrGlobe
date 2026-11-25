package survexcess

import (
	"math"
	"os"
	"testing"
)

func c(v, u float64) cell { return cell{v, u} }

// A triangle as printed (SP7 p. 36, Epping base net no. 3) passes every check.
func printed() *Tri {
	return &Tri{K: "3", R: [3]Row{
		{Station: "Tunk", Deg: c(50, 1), Min: c(45, 1), Sec: c(11.850, .001), Corr: c(-0.039, .001), Sph: c(11.811, .001), Exc: c(0.094, .001), Log: c(4.03267078, 1e-8), Dist: c(10781.291, .001)},
		{Station: "Epping West Base", Deg: c(49, 1), Min: c(1, 1), Sec: c(45.330, .001), Corr: c(0.300, .001), Sph: c(45.630, .001), Exc: c(0.094, .001), Log: c(4.02166233, 1e-8), Dist: c(10511.443, .001)},
		{Station: "Burke", Deg: c(80, 1), Min: c(13, 1), Sec: c(2.640, .001), Corr: c(0.203, .001), Sph: c(2.843, .001), Exc: c(0.095, .001), Log: c(4.13732824, 1e-8), Dist: c(13719.183, .001)},
	}}
}

func TestCheckPrinted(t *testing.T) {
	tr := printed()
	tr.Check()
	if len(tr.Errs) != 0 {
		t.Fatalf("printed triangle should pass: %v", tr.Errs)
	}
	if got := tr.Obs(); math.Abs(got-(-0.18)) > 1e-6 {
		t.Fatalf("observed excess %.4f, want -0.180", got)
	}
}

func TestCheckCatchesMisread(t *testing.T) {
	for name, edit := range map[string]func(*Tri){
		"seconds": func(tr *Tri) { tr.R[1].Sec.V = 45.380 },
		"log":     func(tr *Tri) { tr.R[0].Log.V = 4.03267178 },
		"dist":    func(tr *Tri) { tr.R[2].Dist.V = 13719.883 },
		"degrees": func(tr *Tri) { tr.R[2].Deg.V = 30 },
	} {
		tr := printed()
		edit(tr)
		tr.Check()
		if len(tr.Errs)+len(tr.SideErrs) == 0 {
			t.Errorf("%s misread not caught", name)
		}
	}
}

// Vincenty on Clarke 1866 reproduces a printed side (SP7 p. 238, Howard - Mount Desert, 72 984.22 m).
func TestVincentyPrintedSide(t *testing.T) {
	d := Vincenty(44+37.0/60+44.677/3600, -(67 + 23.0/60 + 46.486/3600), 44+21.0/60+3.308/3600, -(68 + 13.0/60 + 38.729/3600))
	if math.Abs(d-72984.22) > 0.02 {
		t.Fatalf("Vincenty %.3f m, printed 72984.22", d)
	}
}

// synthetic network: a strip of equilateral-ish triangles on a sphere of radius R, angles exact;
// the fit must return R, and on a plane (R huge) the excess must vanish.
func sphereStrip(R float64, n int) ([]*Tri, []Base) {
	// stations along two parallel lines, spacing s; spherical triangle angles from l'Huilier
	s := 30000.0
	var tris []*Tri
	ang := func(a, b, c float64) float64 { // angle opposite side a, spherical, sides in metres
		A, B, C := a/R, b/R, c/R
		return math.Acos((math.Cos(A) - math.Cos(B)*math.Cos(C)) / (math.Sin(B) * math.Sin(C)))
	}
	name := func(row, i int) string { return string(rune('A'+row)) + string(rune('a'+i)) }
	for i := 0; i < n; i++ {
		var st [3]string
		if i%2 == 0 {
			st = [3]string{name(0, i/2), name(0, i/2+1), name(1, i/2)}
		} else {
			st = [3]string{name(1, i/2), name(1, i/2+1), name(0, i/2+1)}
		}
		var tr Tri
		tr.Pub, tr.Page, tr.K = "t", 1+i/10, string(rune('0'+i%10))
		for j := 0; j < 3; j++ {
			a := ang(s, s, s) / Sec
			deg := math.Floor(a / 3600)
			mn := math.Floor((a - deg*3600) / 60)
			tr.R[j] = Row{Station: st[j], Deg: c(deg, 1), Min: c(mn, 1), Sec: c(a-deg*3600-mn*60, 1e-6), Dist: c(s, 1e-6)}
		}
		tris = append(tris, &tr)
	}
	return tris, []Base{{name(0, 0), name(0, 1), s}}
}

func TestRadiusFromSyntheticSphere(t *testing.T) {
	for _, R := range []float64{6371e3, 3000e3} {
		tris, bases := sphereStrip(R, 40)
		areas, _ := PlaneAreas(tris, bases)
		if len(areas) != len(tris) {
			t.Fatalf("reached %d of %d", len(areas), len(tris))
		}
		var ps []Point
		for _, tr := range tris {
			ps = append(ps, Point{E: tr.Obs(), A: areas[tr].A, Pub: tr.Pub, Page: tr.Page})
		}
		got := RadiusKm(FitK(ps))
		if math.Abs(got-R/1000)/(R/1000) > 2e-3 {
			t.Errorf("R = %.1f km, want %.1f", got, R/1000)
		}
	}
}

// Full computation on a copy of the data (FOG_SURV_ROOT), when given.
func TestComputeOnData(t *testing.T) {
	root := os.Getenv("FOG_SURV_ROOT")
	if root == "" {
		t.Skip("FOG_SURV_ROOT not set")
	}
	res, err := Compute(root)
	if err != nil {
		t.Fatal(err)
	}
	t.Log(res.Summary())
	for _, b := range append(res.Bad, res.PosBad...) {
		t.Error(b)
	}
	t.Logf("%d position warnings (not drawn)", len(res.PosWarn))
	for _, u := range res.UnreachedList {
		t.Log("unreached:", u)
	}
	for _, p := range Pubs {
		f := res.PerPub[p.ID]
		t.Logf("%s: n=%d (-%d) R=%.0f (%.0f-%.0f) bias %.3f″ Rbias %.0f flat χ² ×%.1f", p.ID, f.N, f.Dropped, f.R, f.Lo, f.Hi, f.Bias, f.RBias, f.Chi2Ratio)
	}
}
