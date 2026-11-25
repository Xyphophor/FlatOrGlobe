package seismesh

import (
	"fmt"
	"math/rand"
	"testing"
	"time"
)

// TestExtend: the full mesh (MESH_CACHE), timings and numbers of the extension.
func TestExtend(t *testing.T) {
	c := loadCached(t)
	g, keep := subgraph(c, MinQuakes)
	G, order := fullGraph(c, keep, MinAll)
	fmt.Println("core", g.NQ, g.NS, len(g.E), "full", G.NQ, G.NS, len(G.E))
	for _, k := range []int{3, 2} {
		s := g.Init(k, rand.New(rand.NewSource(1)))
		g.Descend(s, iters, 0.02, true, iters, nil)
		t0 := time.Now()
		S := Extend(G, s, g.NS, g.NS)
		fmt.Printf("k=%d core %.2f s; placed %.2f s (%v)\n", k, g.Stress(s), G.Stress(S), time.Since(t0))
		t0 = time.Now()
		G.Descend(S, 2000, 0.005, true, 2000, nil)
		fmt.Printf("  joint %.2f s (%v) c2 %.4f c3 %.4f\n", G.Stress(S), time.Since(t0), S.M.C2, S.M.C3)
		if k == 3 {
			loc := make([][2]float64, len(order))
			for i, ks := range order {
				loc[i] = c.Loc[ks]
			}
			_, R, rel := SphereFit(S.X[G.NQ:])
			_, Rc, relc := SphereFit(S.X[G.NQ : G.NQ+g.NS])
			e, mir := AlignError(S.X[G.NQ:], loc)
			ec, _ := AlignError(S.X[G.NQ:G.NQ+g.NS], loc[:g.NS])
			fmt.Printf("  all: R %.3f rel %.4f vs %.2f deg mir %v; core: R %.3f rel %.4f vs %.2f\n", R, rel, e, mir, Rc, relc, ec)
		}
	}
}
