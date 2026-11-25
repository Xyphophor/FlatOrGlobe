package seismesh

import (
	"os"
	"path/filepath"
	"sort"
	"sync"

	"flatorglobe/tools/internal/build/seisbulk"
	"flatorglobe/tools/internal/build/seisreloc"
)

// Edge is one P reading: quake Q, station S, seconds after the bulletin's search start.
type Edge struct {
	Q, S int
	T    float64
}

// Load reads the P picks of every quake of the seisbulk sample that has enough of them, keeping, as seisbulk does, the
// picks 25-95° from OUR OWN centre (seisreloc.RelocateGlobe: no catalogue location). No coordinate enters the fit: the
// station latitude/longitude are returned apart, only for the check against the fitted shape.
func Load(root string) (qs []seisbulk.Event, sta []string, loc [][2]float64, edges []Edge, err error) {
	evs, err := seisbulk.ReadCatalogue(root)
	if err != nil {
		return
	}
	type row struct{ P []seisreloc.Pick }
	rows := make([]row, len(evs))
	errs := make([]error, len(evs))
	var wg sync.WaitGroup
	sem := make(chan struct{}, 4)
	for qi := range evs {
		wg.Add(1)
		sem <- struct{}{}
		go func(qi int) {
			defer wg.Done()
			defer func() { <-sem }()
			ev := evs[qi]
			b, e := os.ReadFile(filepath.Join(root, seisbulk.RawDir, ev.ID+".isf"))
			if e != nil {
				errs[qi] = e
				return
			}
			b = seisbulk.Plain(b)
			se := seisbulk.AsEvent(ev)
			P, _ := seisreloc.PicksData(b, seisbulk.HmsSec(se.SearchStart[len(se.SearchStart)-8:]), "P")
			if len(P) < seisbulk.MinP {
				return
			}
			g, sel, e2 := seisreloc.RelocateGlobe(P)
			if e2 != nil || g.N < seisbulk.MinP {
				return
			}
			for i, p := range P {
				if sel[i] {
					rows[qi].P = append(rows[qi].P, p)
				}
			}
		}(qi)
	}
	wg.Wait()
	for _, e := range errs {
		if e != nil {
			err = e
			return
		}
	}
	idx := map[string]int{}
	for qi := range evs {
		for _, p := range rows[qi].P {
			si, ok := idx[p.Sta]
			if !ok {
				si = len(sta)
				idx[p.Sta] = si
				sta = append(sta, p.Sta)
				loc = append(loc, [2]float64{p.Lat, p.Lon})
			}
			edges = append(edges, Edge{qi, si, p.T})
		}
	}
	qs = evs
	sort.SliceStable(edges, func(i, j int) bool { return edges[i].Q < edges[j].Q })
	return
}
