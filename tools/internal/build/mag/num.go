package mag

import (
	"encoding/json"
	"strconv"
	"strings"

	"flatorglobe/tools/internal/pyjson"
)

// Num is a Python number as the script handled it: the survey JSON gives
// ints and floats, and Python keeps an int an int through round(x, n),
// subtraction of an int and str(): the output spells 45, not 45.0.
type Num struct {
	F   float64
	Int bool
}

func fl(f float64) Num { return Num{F: f} }

// numOf reads a JSON number.
func numOf(n json.Number) (Num, error) {
	s := string(n)
	f, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return Num{}, err
	}
	return Num{F: f, Int: !strings.ContainsAny(s, ".eE")}, nil
}

// Str is str(x).
func (n Num) Str() string {
	if n.Int {
		return strconv.FormatInt(int64(n.F), 10)
	}
	return pyjson.Float(n.F)
}

// Round is round(x, nd): an int stays an int.
func (n Num) Round(nd int) Num {
	if n.Int {
		return n
	}
	return fl(pyjson.Round(n.F, nd))
}

// JSON is the value to hand to pyjson.
func (n Num) JSON() any {
	if n.Int {
		return int(n.F)
	}
	return n.F
}

// lon180 maps a longitude to -180..180 the way the script did.
func lon180(n Num) Num {
	if n.F > 180 {
		return Num{F: n.F - 360, Int: n.Int}
	}
	return n
}
