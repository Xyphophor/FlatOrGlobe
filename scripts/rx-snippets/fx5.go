// The code you share: your position rounded to q metres, and its check digits.
// import ("fmt"; "math"; "strconv")

// fnv1a is the 32-bit FNV-1a hash over the characters: catches a copying error, not a forgery.
func fnv1a(s string) uint32 {
	h := uint32(0x811C9DC5)
	for _, ch := range s {
		h = (h ^ uint32(ch)) * 0x01000193
	}
	return h
}

// makeCode: x_hat = q * round(x / q), the code carries round(x / q).
func makeCode(name, date string, x [3]float64, q int, rms float64, epochs int, systems string) string {
	rnd := func(v float64) int64 { return int64(math.Floor(v + 0.5)) }
	qf := float64(q)
	body := fmt.Sprintf("FOG1|%s|%s|%d|%d|%d|%d|%d|%d|%s", name, date, q,
		rnd(x[0]/qf), rnd(x[1]/qf), rnd(x[2]/qf), rnd(rms*10), epochs, systems)
	return body + "|" + strconv.FormatUint(uint64(fnv1a(body)), 36)
}
