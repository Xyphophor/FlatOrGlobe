package aviaflights

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"time"

	"flatorglobe/tools/internal/pyjson"
)

// PageURL is FlightAware's public page of a callsign (its last ~2 weeks).
var PageURL = "https://www.flightaware.com/live/flight/"

// UA is the browser user agent the Python script sent with curl.
const UA = "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0"

var bootRe = regexp.MustCompile(`(?s)var trackpollBootstrap = (\{.*?\});\s*</script>`)

// ParsePage extracts the legs from the JSON the page embeds, keeping only
// what the tab needs, in the order of the page. A page without the
// bootstrap (callsign unknown, layout changed) gives no legs.
func ParsePage(html []byte) ([]pyjson.Obj, error) {
	m := bootRe.FindSubmatch(html)
	if m == nil {
		return []pyjson.Obj{}, nil
	}
	var boot struct {
		Flights json.RawMessage `json:"flights"`
	}
	if err := json.Unmarshal(m[1], &boot); err != nil {
		return nil, fmt.Errorf("bootstrap: %w", err)
	}
	legs := []pyjson.Obj{}
	if len(boot.Flights) == 0 || string(boot.Flights) == "null" {
		return legs, nil
	}
	// the flights object is iterated in page order, as Python's dict
	dec := json.NewDecoder(bytes.NewReader(boot.Flights))
	dec.UseNumber()
	if t, err := dec.Token(); err != nil || t != json.Delim('{') {
		return nil, fmt.Errorf("bootstrap flights: not an object")
	}
	for dec.More() {
		if _, err := dec.Token(); err != nil { // key
			return nil, err
		}
		var f struct {
			ActivityLog struct {
				Flights []map[string]any `json:"flights"`
			} `json:"activityLog"`
		}
		if err := dec.Decode(&f); err != nil {
			return nil, fmt.Errorf("bootstrap flight: %w", err)
		}
		for _, x := range f.ActivityLog.Flights {
			legs = append(legs, leg(x))
		}
	}
	return legs, nil
}

func obj(x any) map[string]any {
	m, _ := x.(map[string]any)
	return m
}

// truthy is Python's bool() on a decoded JSON value.
func truthy(v any) bool {
	switch x := v.(type) {
	case nil:
		return false
	case bool:
		return x
	case string:
		return x != ""
	case json.Number:
		f, _ := x.Float64()
		return f != 0
	case []any:
		return len(x) > 0
	case map[string]any:
		return len(x) > 0
	}
	return true
}

// plain turns decoded JSON into values pyjson can write (objects are not
// expected in the fields kept; they would be a layout change).
func plain(v any) any {
	switch x := v.(type) {
	case map[string]any:
		return fmt.Sprintf("<object: FlightAware layout changed? %d keys>", len(x))
	case []any:
		out := make([]any, len(x))
		for i, e := range x {
			out[i] = plain(e)
		}
		return out
	}
	return v
}

func leg(x map[string]any) pyjson.Obj {
	o, d := obj(x["origin"]), obj(x["destination"])
	fp := obj(x["flightPlan"])
	return pyjson.Obj{
		{K: "o", V: plain(o["iata"])}, {K: "d", V: plain(d["iata"])},
		{K: "oc", V: plain(o["coord"])}, {K: "dc", V: plain(d["coord"])},
		{K: "on", V: plain(o["friendlyLocation"])}, {K: "dn", V: plain(d["friendlyLocation"])},
		{K: "off", V: plain(obj(x["takeoffTimes"])["actual"])},
		{K: "onT", V: plain(obj(x["landingTimes"])["actual"])},
		{K: "cancelled", V: truthy(x["cancelled"])}, {K: "diverted", V: truthy(x["diverted"])},
		{K: "type", V: plain(x["aircraftType"])},
		{K: "tas", V: plain(fp["speed"])}, {K: "nm", V: plain(fp["plannedDistance"])},
		{K: "fuelLb", V: plain(obj(fp["fuelBurn"])["pounds"])}, {K: "route", V: plain(fp["route"])},
	}
}

// RawJSON is the raw file Python wrote: json.dumps(out, indent=1).
func RawJSON(ident, fetched string, legs []pyjson.Obj) string {
	return rawJSON(ident, fetched, nil, legs)
}

// rawJSON adds the list of readings when a file holds several (Merge).
func rawJSON(ident, fetched string, windows []string, legs []pyjson.Obj) string {
	ls := make([]any, len(legs))
	for i, l := range legs {
		ls[i] = l
	}
	o := pyjson.Obj{{K: "ident", V: ident}, {K: "fetched", V: fetched}}
	if len(windows) > 1 {
		ws := make([]any, len(windows))
		for i, w := range windows {
			ws[i] = w
		}
		o = append(o, pyjson.KV{K: "windows", V: ws})
	}
	return pyjson.Dumps(append(o, pyjson.KV{K: "legs", V: ls}), pyjson.Indented(1))
}

func field(o pyjson.Obj, k string) any {
	for _, kv := range o {
		if kv.K == k {
			return kv.V
		}
	}
	return nil
}

func numOf(v any) (float64, bool) {
	switch x := v.(type) {
	case json.Number:
		f, err := x.Float64()
		return f, err == nil
	case *json.Number:
		return num(x)
	}
	return 0, false
}

// SameLeg is the window over which two readings of a callsign's leg are
// the same flight: same airports, wheels-off within 3 h (FlightAware
// refines an actual time after the flight; one callsign flies a pair at
// most once or twice a day).
const SameLeg = 3 * 3600.0

// Merge keeps the flights of an earlier reading of a callsign's page that
// the new page no longer shows (it covers about two weeks): the new legs
// first, in page order, then the earlier legs that had flown (actual
// wheels-off) and are not in the new page. An earlier leg without an
// actual wheels-off (scheduled, cancelled) is dropped: the new page says
// what became of it, or it is too old to matter.
func Merge(old *Raw, fresh []pyjson.Obj) []pyjson.Obj {
	out := append([]pyjson.Obj{}, fresh...)
	if old == nil {
		return out
	}
	for _, L := range old.Legs {
		off, ok := num(L.Off)
		if !ok || off == 0 {
			continue
		}
		dup := false
		for _, n := range fresh {
			nOff, ok := numOf(field(n, "off"))
			if ok && field(n, "o") == str(L.O) && field(n, "d") == str(L.D) && math.Abs(nOff-off) < SameLeg {
				dup = true
				break
			}
		}
		if !dup {
			out = append(out, legObj(L))
		}
	}
	return out
}

// legObj writes a read leg back in the raw file's order and spelling.
func legObj(L Leg) pyjson.Obj {
	s := func(p *string) any {
		if p == nil {
			return nil
		}
		return *p
	}
	n := func(p *json.Number) any {
		if p == nil {
			return nil
		}
		return *p
	}
	c := func(xs []json.Number) any {
		if xs == nil {
			return nil
		}
		out := make([]any, len(xs))
		for i, x := range xs {
			out[i] = x
		}
		return out
	}
	return pyjson.Obj{
		{K: "o", V: s(L.O)}, {K: "d", V: s(L.D)}, {K: "oc", V: c(L.OC)}, {K: "dc", V: c(L.DC)},
		{K: "on", V: s(L.On)}, {K: "dn", V: s(L.Dn)}, {K: "off", V: n(L.Off)}, {K: "onT", V: n(L.OnT)},
		{K: "cancelled", V: L.Cancelled}, {K: "diverted", V: L.Diverted}, {K: "type", V: s(L.Type)},
		{K: "tas", V: n(L.Tas)}, {K: "nm", V: n(L.Nm)}, {K: "fuelLb", V: n(L.FuelL)}, {K: "route", V: s(L.Route)},
	}
}

// Fetch downloads the page of every callsign of routes.json whose raw file
// is missing (all of them with refresh), one request every pause. A
// refresh adds to a raw file, never replaces it (Merge): each reading is a
// new ~two-week window, and the file lists them all ("windows").
func Fetch(ctx context.Context, root string, refresh bool, client *http.Client, pause time.Duration, log io.Writer) error {
	routes, err := ReadRoutes(root)
	if err != nil {
		return err
	}
	if client == nil {
		client = &http.Client{Timeout: 2 * time.Minute}
	}
	seen := map[string]bool{}
	first := true
	for _, r := range routes {
		for _, ident := range append(append([]string{}, r.AB...), r.BA...) {
			if seen[ident] {
				continue
			}
			seen[ident] = true
			p := filepath.Join(root, RawDir, ident+".json")
			if _, err := os.Stat(p); err == nil && !refresh {
				continue
			}
			if !first {
				select {
				case <-ctx.Done():
					return ctx.Err()
				case <-time.After(pause):
				}
			}
			first = false
			req, err := http.NewRequestWithContext(ctx, http.MethodGet, PageURL+ident, nil)
			if err != nil {
				return err
			}
			req.Header.Set("User-Agent", UA)
			resp, err := client.Do(req)
			if err != nil {
				return fmt.Errorf("%s: %w", ident, err)
			}
			body, err := io.ReadAll(resp.Body)
			resp.Body.Close()
			if err != nil {
				return fmt.Errorf("%s: %w", ident, err)
			}
			if resp.StatusCode != http.StatusOK {
				return fmt.Errorf("%s: HTTP %d", ident, resp.StatusCode)
			}
			legs, err := ParsePage(body)
			if err != nil {
				return fmt.Errorf("%s: %w", ident, err)
			}
			if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
				return err
			}
			today := time.Now().UTC().Format("2006-01-02")
			var windows []string
			n := len(legs)
			if old, err := ReadRaw(root, ident); err == nil {
				windows = append(windows, old.Windows...)
				if len(windows) == 0 {
					windows = append(windows, old.Fetched)
				}
				if windows[len(windows)-1] != today {
					windows = append(windows, today)
				}
				legs = Merge(old, legs)
			}
			if err := os.WriteFile(p, []byte(rawJSON(ident, today, windows, legs)), 0o644); err != nil {
				return err
			}
			fmt.Fprintf(log, "  %s: %d legs on the page, %d in all\n", ident, n, len(legs))
		}
	}
	return nil
}
