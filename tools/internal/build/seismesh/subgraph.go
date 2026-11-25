package seismesh

// cache is the loaded mesh before the choice of stations (also saved by the tests, Load takes minutes).
type cache struct {
	Sta  []string
	Loc  [][2]float64
	Edge []Edge
	NQ   int
}

// subgraph keeps the stations that read at least minQ quakes and the quakes that still have a reading.
func subgraph(c cache, minQ int) (*Graph, []int) {
	cnt := map[int]int{}
	for _, e := range c.Edge {
		cnt[e.S]++
	}
	idx := map[int]int{}
	var keep []int
	for s, n := range cnt {
		if n >= minQ {
			keep = append(keep, s)
		}
	}
	// deterministic order
	for i := 0; i < len(keep); i++ {
		for j := i + 1; j < len(keep); j++ {
			if keep[j] < keep[i] {
				keep[i], keep[j] = keep[j], keep[i]
			}
		}
	}
	for i, s := range keep {
		idx[s] = i
	}
	qn := map[int]int{}
	g := &Graph{NS: len(keep)}
	for _, e := range c.Edge {
		if i, ok := idx[e.S]; ok {
			q, ok := qn[e.Q]
			if !ok {
				q = len(qn)
				qn[e.Q] = q
			}
			g.E = append(g.E, Edge{q, i, e.T})
		}
	}
	g.NQ = len(qn)
	return g, keep
}
