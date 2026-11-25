package lomond

import (
	"fmt"
	"image/jpeg"
	"math"
	"os"
	"sort"
)

// Photo is the contributor's photograph and where its edges are read: the
// windows are set by eye once, the rows inside them are measured.
type Photo struct {
	Src  string // under public/
	W, H int
	// HorizonX: column ranges where the sea horizon is read (bands of 20
	// columns), clear of the rock, of St Abb's Head and of the captions;
	// HorizonY: the rows searched.
	HorizonX [][2]int
	HorizonY [2]int
	// RockX: the columns where the rock stands above the horizon; SkipX: the
	// contributor's arrow, which touches the rock's outline there; SkyY: sky
	// rows above the summit (reference brightness).
	RockX, SkipX, SkyY [2]int
	// BaseX, BaseY: where the rock's foot meets the sea.
	BaseX, BaseY [2]int
	// AbbsX: the columns where the coast of St Abb's Head stands above the
	// horizon (right of the contributor's arrow, left of the white bar);
	// AbbsY0: the first row searched, in the sky above it.
	AbbsX  [2]int
	AbbsY0 int
}

// Lomond is the photograph (the annotated slide as sent: 1920 x 1080, the
// picture between the white side bars, x 150..1770).
var Lomond = Photo{
	Src: "photos/contrib-lomond-2023-08-09.jpg", W: 1920, H: 1080,
	HorizonX: [][2]int{{160, 860}, {1150, 1460}}, HorizonY: [2]int{555, 600},
	RockX: [2]int{886, 1060}, SkipX: [2]int{924, 952}, SkyY: [2]int{518, 526},
	BaseX: [2]int{900, 1100}, BaseY: [2]int{605, 640},
	AbbsX: [2]int{1525, 1765}, AbbsY0: 500,
}

// gray is the photograph's luminance, PIL's "L" (ITU-R 601-2 luma, integer
// rounding as PIL does it).
type gray struct {
	W, H int
	Pix  []float64
}

func (g *gray) at(x, y int) float64 { return g.Pix[y*g.W+x] }

func loadGray(path string) (*gray, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	img, err := jpeg.Decode(f)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", path, err)
	}
	b := img.Bounds()
	g := &gray{W: b.Dx(), H: b.Dy(), Pix: make([]float64, b.Dx()*b.Dy())}
	for y := 0; y < g.H; y++ {
		for x := 0; x < g.W; x++ {
			R, G, B, _ := img.At(b.Min.X+x, b.Min.Y+y).RGBA()
			r, gg, bb := R>>8, G>>8, B>>8
			g.Pix[y*g.W+x] = float64((19595*r + 38470*gg + 7471*bb + 0x8000) >> 16)
		}
	}
	return g, nil
}

// column is the mean brightness of columns [x0, x1) for rows [y0, y1).
func (g *gray) column(x0, x1, y0, y1 int) []float64 {
	out := make([]float64, y1-y0)
	for y := y0; y < y1; y++ {
		s := 0.0
		for x := x0; x < x1; x++ {
			s += g.at(x, y)
		}
		out[y-y0] = s / float64(x1-x0)
	}
	return out
}

// edge locates the strongest step of a profile (down: bright above, dark
// below; up: the reverse) and refines it to the crossing of the half-way
// level between the mean of rows 2..6 before the step and rows 3..7 after
// it, linearly interpolated. Rows are pixel indices (row j's centre at j).
func edge(p []float64, down bool) (float64, bool) {
	best, bi := 0.0, -1
	for i := 6; i+8 < len(p); i++ {
		d := p[i+1] - p[i]
		if down {
			d = -d
		}
		if d > best {
			best, bi = d, i
		}
	}
	if bi < 0 {
		return 0, false
	}
	mean := func(a, b int) float64 {
		s := 0.0
		for k := a; k <= b; k++ {
			s += p[k]
		}
		return s / float64(b-a+1)
	}
	hi, lo := mean(bi-6, bi-2), mean(bi+3, bi+7)
	th := (hi + lo) / 2
	for j := bi - 3; j <= bi+3; j++ {
		a, b := p[j], p[j+1]
		if (a-th)*(b-th) <= 0 && a != b {
			return float64(j) + (a-th)/(a-b), true
		}
	}
	return float64(bi) + 0.5, true
}

// Reading is what is measured on the photograph (rows and columns in pixels
// of the image as published).
type Reading struct {
	// the sea horizon: row = HorA + HorB·x (least squares over the bands),
	// its residual scatter (px) and the bands read
	HorA, HorB, HorSd float64
	HorPts            [][2]float64
	// the summit (lowest row of the rock's outline, 5-column running mean)
	SummitX, SummitRow float64
	Outline            [][2]float64 // (x, row) of the outline above the horizon
	// the foot of the rock, levelled to the summit's column (the horizon's
	// tilt removed), median over the columns, and its scatter
	Base, BaseSd float64
	// the rock's ends at its foot (px): width in the picture
	Left, Right float64
	// the horizon at the summit's column, and the fraction of the rock (from
	// its foot) below it
	HorAtSummit, F, FSd float64
	// St Abb's Head: per column, the height of its outline above the horizon
	// (px), where the step from sky to land is clear (0 elsewhere: sea)
	Abbs [][2]float64
}

// Read measures the photograph.
func (ph *Photo) Read(g *gray) (*Reading, error) {
	r := &Reading{}
	// 1. the horizon, band by band, then a straight line
	var xs, ys []float64
	for _, rg := range ph.HorizonX {
		for x := rg[0]; x+20 <= rg[1]; x += 20 {
			y, ok := edge(g.column(x, x+20, ph.HorizonY[0], ph.HorizonY[1]), true)
			if !ok {
				continue
			}
			xs = append(xs, float64(x)+9.5)
			ys = append(ys, float64(ph.HorizonY[0])+y)
		}
	}
	if len(xs) < 5 {
		return nil, fmt.Errorf("horizon: %d bands", len(xs))
	}
	r.HorA, r.HorB, r.HorSd = fitLine(xs, ys)
	for i := range xs {
		r.HorPts = append(r.HorPts, [2]float64{xs[i], round(ys[i], 2)})
	}
	hor := func(x float64) float64 { return r.HorA + r.HorB*x }
	// 2. the outline above the horizon: per column (3-column mean), the
	// crossing of the half-way level between the sky and the rock
	var ox, oy []float64
	for x := ph.RockX[0]; x <= ph.RockX[1]; x++ {
		if x >= ph.SkipX[0] && x <= ph.SkipX[1] {
			continue
		}
		p := g.column(x-1, x+2, ph.SkyY[0], int(hor(float64(x)))+24)
		sky := 0.0
		for i := 0; i < ph.SkyY[1]-ph.SkyY[0]; i++ {
			sky += p[i]
		}
		sky /= float64(ph.SkyY[1] - ph.SkyY[0])
		rock := 0.0
		for i := len(p) - 12; i < len(p); i++ {
			rock += p[i]
		}
		rock /= 12
		th := (sky + rock) / 2
		for i := ph.SkyY[1] - ph.SkyY[0]; i+1 < len(p); i++ {
			if p[i] >= th && p[i+1] < th {
				y := float64(ph.SkyY[0]+i) + (p[i]-th)/(p[i]-p[i+1])
				if y < hor(float64(x))-1 {
					ox = append(ox, float64(x))
					oy = append(oy, y)
				}
				break
			}
		}
	}
	if len(ox) < 20 {
		return nil, fmt.Errorf("outline: %d columns", len(ox))
	}
	best := math.Inf(1)
	for i := 2; i+2 < len(ox); i++ {
		if ox[i+2]-ox[i-2] != 4 {
			continue // across the skipped arrow
		}
		m := (oy[i-2] + oy[i-1] + oy[i] + oy[i+1] + oy[i+2]) / 5
		if m < best {
			best, r.SummitX = m, ox[i]
		}
	}
	r.SummitRow = best
	for i := 0; i < len(ox); i += 4 {
		r.Outline = append(r.Outline, [2]float64{ox[i], round(oy[i], 2)})
	}
	// 3. the foot: per column, the step from the dark rock to the brighter
	// sea, levelled to the summit's column
	var bs []float64
	for x := ph.BaseX[0]; x < ph.BaseX[1]; x += 2 {
		y, ok := edge(g.column(x, x+2, ph.BaseY[0], ph.BaseY[1]), false)
		if !ok {
			continue
		}
		bs = append(bs, float64(ph.BaseY[0])+y-r.HorB*(float64(x)+0.5-r.SummitX))
	}
	sort.Float64s(bs)
	r.Base = bs[len(bs)/2]
	if len(bs)%2 == 0 {
		r.Base = (bs[len(bs)/2-1] + bs[len(bs)/2]) / 2
	}
	r.BaseSd = mad(bs) * 1.4826
	// 4. the rock's ends just above its foot: brightness along rows Base-8..Base-3
	y0, y1 := int(r.Base)-8, int(r.Base)-3
	row := func(x int) float64 {
		s := 0.0
		for y := y0; y < y1; y++ {
			s += g.at(x, y)
		}
		return s / float64(y1-y0)
	}
	sea := (row(ph.RockX[0]-60) + row(ph.RockX[1]+90)) / 2
	rk := 0.0
	for x := int(r.SummitX) - 20; x < int(r.SummitX)+20; x++ {
		rk += row(x)
	}
	rk /= 40
	th := (sea + rk) / 2
	for x := ph.RockX[0] - 60; x < int(r.SummitX); x++ {
		if row(x) >= th && row(x+1) < th {
			r.Left = float64(x) + (row(x)-th)/(row(x)-row(x+1))
			break
		}
	}
	for x := ph.RockX[1] + 90; x > int(r.SummitX); x-- {
		if row(x) >= th && row(x-1) < th {
			r.Right = float64(x) - (row(x)-th)/(row(x)-row(x-1))
			break
		}
	}
	// 5. St Abb's Head's outline: per 5-column band centred on x, the step
	// from the sky to the land between AbbsY0 and the horizon (edge), kept
	// when the land is at least 8 grey levels darker than the sky
	for x := ph.AbbsX[0]; x <= ph.AbbsX[1]; x++ {
		hy := hor(float64(x))
		p := g.column(x-2, x+3, ph.AbbsY0, int(hy)-2)
		y, ok := edge(p, true)
		if i := int(y); ok && i >= 6 && i+8 < len(p) && p[i-4]-p[i+5] >= 8 {
			r.Abbs = append(r.Abbs, [2]float64{float64(x), hy - (float64(ph.AbbsY0) + y)})
		} else {
			r.Abbs = append(r.Abbs, [2]float64{float64(x), 0})
		}
	}
	// 6. the fraction
	r.HorAtSummit = hor(r.SummitX)
	r.F = (r.Base - r.HorAtSummit) / (r.Base - r.SummitRow)
	// uncertainty: the horizon's scatter, the foot's, half a pixel on the
	// summit's outline, added in quadrature through f's partial derivatives
	span := r.Base - r.SummitRow
	sH := math.Hypot(r.HorSd/math.Sqrt(float64(len(xs)))*2, 0.5)
	sB := math.Hypot(r.BaseSd/math.Sqrt(float64(len(bs))), 0.5)
	dfdH := -1 / span
	dfdB := 1/span - (r.Base-r.HorAtSummit)/(span*span)
	dfdS := (r.Base - r.HorAtSummit) / (span * span)
	r.FSd = math.Sqrt(dfdH*dfdH*sH*sH + dfdB*dfdB*sB*sB + dfdS*dfdS*0.25)
	return r, nil
}

// fitLine is the least-squares line y = a + b x and the residuals' standard
// deviation (n - 2 degrees of freedom).
func fitLine(x, y []float64) (a, b, sd float64) {
	n := float64(len(x))
	mx, my := 0.0, 0.0
	for i := range x {
		mx += x[i]
		my += y[i]
	}
	mx /= n
	my /= n
	sxx, sxy := 0.0, 0.0
	for i := range x {
		sxx += (x[i] - mx) * (x[i] - mx)
		sxy += (x[i] - mx) * (y[i] - my)
	}
	b = sxy / sxx
	a = my - b*mx
	ss := 0.0
	for i := range x {
		d := y[i] - a - b*x[i]
		ss += d * d
	}
	return a, b, math.Sqrt(ss / (n - 2))
}

// mad is the median absolute deviation from the median.
func mad(a []float64) float64 {
	s := append([]float64(nil), a...)
	sort.Float64s(s)
	m := s[len(s)/2]
	d := make([]float64, len(s))
	for i, v := range s {
		d[i] = math.Abs(v - m)
	}
	sort.Float64s(d)
	return d[len(d)/2]
}

func round(x float64, n int) float64 {
	p := math.Pow(10, float64(n))
	return math.Round(x*p) / p
}
