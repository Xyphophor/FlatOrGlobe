package casep2p

import (
	"math"
	"testing"

	"flatorglobe/tools/internal/pyjson"
)

// La distance Worthing–Brighton : leurs 15,3 km, à la position des sites près (~50 m).
func TestDistance(t *testing.T) {
	d := GC(50.8070, -0.3688, 50.8197, -0.1530)
	if math.Abs(d-15300) > 150 {
		t.Fatalf("Worthing–Brighton %.0f m, 15,300 m expected within 150", d)
	}
}

// Le dataset se lit en entier : deux soirs, cinq essais, les deux tableaux de thermomètres.
func TestCompute(t *testing.T) {
	out, err := Compute("../../../..")
	if err != nil {
		t.Fatal(err)
	}
	get := func(k string) any {
		for _, kv := range out {
			if kv.K == k {
				return kv.V
			}
		}
		return nil
	}
	if n := len(get("trials").([]any)); n != 5 {
		t.Fatalf("%d trials", n)
	}
	if n := len(get("evenings").(pyjson.Obj)); n != 2 {
		t.Fatalf("%d evenings", n)
	}
}
