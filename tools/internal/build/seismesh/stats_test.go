package seismesh

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"os"
	"testing"
)

func loadCached(t *testing.T) cache {
	path := os.Getenv("MESH_CACHE")
	if path == "" {
		t.Skip("set MESH_CACHE=<file> to run the mesh experiments (Load takes minutes; the file caches it)")
	}
	if b, err := os.ReadFile(path); err == nil {
		var c cache
		json.Unmarshal(b, &c)
		return c
	}
	qs, sta, loc, edges, err := Load("../../../..")
	if err != nil {
		t.Skip(err)
	}
	c := cache{sta, loc, edges, len(qs)}
	b, _ := json.Marshal(c)
	os.WriteFile(path, b, 0o644)
	return c
}

// TestProto, TestVariants, TestRandomStart: the experiments behind the design (random starts stall at 40-50 s).
func TestProto(t *testing.T) {
	c := loadCached(t)
	g, keep := subgraph(c, 120)
	fmt.Println("nodes", g.NQ, g.NS, "edges", len(g.E))
	for _, k := range []int{2, 3} {
		rng := rand.New(rand.NewSource(1))
		s := g.Init(k, rng)
		fmt.Printf("k=%d init stress %.1f s\n", k, g.Stress(s))
		g.Descend(s, 8000, 0.02, true, 2000, func(it int) { fmt.Printf("  it %d stress %.2f s  c2 %.3f c3 %.3f\n", it, g.Stress(s), s.M.C2, s.M.C3) })
		_, R, rel := SphereFit(s.X)
		_, _, relS := SphereFit(s.X[g.NQ:])
		if k == 3 {
			loc := make([][2]float64, len(keep))
			for i, ks := range keep {
				loc[i] = c.Loc[ks]
			}
			e, mir := AlignError(s.X[g.NQ:], loc)
			fmt.Printf("stations only: radial scatter %.3f; check vs real positions: %.1f deg rms, mirrored=%v\n", relS, e, mir)
		}
		fmt.Printf("k=%d final stress %.2f s, sphere R %.2f u, radial scatter %.3f\n", k, g.Stress(s), R, rel)
	}
}

func TestVariants(t *testing.T) {
	c := loadCached(t)
	g, keep := subgraph(c, 120)
	rng := rand.New(rand.NewSource(1))
	s := g.Init(3, rng)
	g.Descend(s, 6000, 0.02, true, 6000, nil)
	loc := make([][2]float64, len(keep))
	for i, ks := range keep {
		loc[i] = c.Loc[ks]
	}
	rep := func(tag string, s *State) {
		_, R, rel := SphereFit(s.X[g.NQ:])
		e, _ := AlignError(s.X[g.NQ:], loc)
		fmt.Printf("%-22s stress %.2f s  R %.3f u  radial %.4f  vs real %.2f deg  c2 %.4f c3 %.4f\n", tag, g.Stress(s), R, rel, e, s.M.C2, s.M.C3)
	}
	rep("free curve", s)
	base := s
	for _, d := range []float64{-0.04, -0.02, 0.02, 0.04, 0.08} {
		w := &State{K: 3, M: Model{C0: append([]float64(nil), base.M.C0...), C2: base.M.C2 + d, C3: base.M.C3}}
		for _, x := range base.X {
			w.X = append(w.X, append([]float64(nil), x...))
		}
		g.Descend(w, 3000, 0.01, false, 3000, nil)
		rep(fmt.Sprintf("c2 %+.2f, refit", d), w)
	}
	// linear law: c2 = c3 = 0
	w := &State{K: 3, M: Model{C0: append([]float64(nil), base.M.C0...)}}
	for _, x := range base.X {
		w.X = append(w.X, append([]float64(nil), x...))
	}
	g.Descend(w, 4000, 0.01, false, 4000, nil)
	rep("constant speed (c2=c3=0)", w)
}

func TestRandomStart(t *testing.T) {
	c := loadCached(t)
	g, keep := subgraph(c, 120)
	loc := make([][2]float64, len(keep))
	for i, ks := range keep {
		loc[i] = c.Loc[ks]
	}
	for seed := int64(1); seed <= 4; seed++ {
		rng := rand.New(rand.NewSource(seed))
		s := g.Init(3, rng)
		for i := range s.X {
			for j := range s.X[i] {
				s.X[i][j] = rng.NormFloat64() * 3
			}
		}
		g.Descend(s, 12000, 0.02, true, 4000, func(it int) { fmt.Printf("   seed %d it %d stress %.2f\n", seed, it, g.Stress(s)) })
		_, R, rel := SphereFit(s.X[g.NQ:])
		e, _ := AlignError(s.X[g.NQ:], loc)
		fmt.Printf("seed %d: stress %.2f R %.2f radial %.4f vs real %.2f deg\n", seed, g.Stress(s), R, rel, e)
	}
}
