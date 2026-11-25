package npy

import "math/bits"

// less is numpy's comparison for float64 sorts: NaN sorts last.
func less(a, b float64) bool { return a < b || (b != b && a == a) }

// Argsort is np.argsort(v) with the default kind ("quicksort") as numpy
// runs it on a CPU without AVX512/AVX2 dispatch: an introsort (median of
// three, insertion sort up to 16 elements, heapsort past the depth limit),
// NOT stable: equal values come out in numpy's order, which this
// reproduces exactly (numpy/_core/src/npysort/quicksort.cpp, aquicksort_).
func Argsort(v []float64) []int {
	num := len(v)
	tosort := make([]int, num)
	for i := range tosort {
		tosort[i] = i
	}
	if num < 2 {
		return tosort
	}
	const small = 15 // SMALL_QUICKSORT
	type frame struct{ pl, pr, depth int }
	var stack []frame
	pl, pr := 0, num-1
	cdepth := (bits.Len(uint(num)) - 1) * 2 // npy_get_msb(num) * 2
	for {
		if cdepth < 0 {
			aheapsort(v, tosort[pl:pr+1])
			goto pop
		}
		for pr-pl > small {
			pm := pl + (pr-pl)>>1
			if less(v[tosort[pm]], v[tosort[pl]]) {
				tosort[pm], tosort[pl] = tosort[pl], tosort[pm]
			}
			if less(v[tosort[pr]], v[tosort[pm]]) {
				tosort[pr], tosort[pm] = tosort[pm], tosort[pr]
			}
			if less(v[tosort[pm]], v[tosort[pl]]) {
				tosort[pm], tosort[pl] = tosort[pl], tosort[pm]
			}
			vp := v[tosort[pm]]
			pi, pj := pl, pr-1
			tosort[pm], tosort[pj] = tosort[pj], tosort[pm]
			for {
				for pi++; less(v[tosort[pi]], vp); pi++ {
				}
				for pj--; less(vp, v[tosort[pj]]); pj-- {
				}
				if pi >= pj {
					break
				}
				tosort[pi], tosort[pj] = tosort[pj], tosort[pi]
			}
			pk := pr - 1
			tosort[pi], tosort[pk] = tosort[pk], tosort[pi]
			cdepth--
			// push the largest partition on the stack
			if pi-pl < pr-pi {
				stack = append(stack, frame{pi + 1, pr, cdepth})
				pr = pi - 1
			} else {
				stack = append(stack, frame{pl, pi - 1, cdepth})
				pl = pi + 1
			}
		}
		// insertion sort
		for pi := pl + 1; pi <= pr; pi++ {
			vi := tosort[pi]
			vp := v[vi]
			pj, pk := pi, pi-1
			for pj > pl && less(vp, v[tosort[pk]]) {
				tosort[pj] = tosort[pk]
				pj--
				pk--
			}
			tosort[pj] = vi
		}
	pop:
		if len(stack) == 0 {
			break
		}
		f := stack[len(stack)-1]
		stack = stack[:len(stack)-1]
		pl, pr, cdepth = f.pl, f.pr, f.depth
	}
	return tosort
}

// aheapsort is numpy's aheapsort_ on a slice of indices (1-based heap).
func aheapsort(v []float64, tosort []int) {
	n := len(tosort)
	a := func(i int) *int { return &tosort[i-1] }
	for l := n >> 1; l > 0; l-- {
		tmp := *a(l)
		i, j := l, l<<1
		for j <= n {
			if j < n && less(v[*a(j)], v[*a(j + 1)]) {
				j++
			}
			if less(v[tmp], v[*a(j)]) {
				*a(i) = *a(j)
				i, j = j, j+j
			} else {
				break
			}
		}
		*a(i) = tmp
	}
	for ; n > 1; n-- {
		tmp := *a(n)
		*a(n) = *a(1)
		i, j := 1, 2
		for j <= n-1 {
			if j < n-1 && less(v[*a(j)], v[*a(j + 1)]) {
				j++
			}
			if less(v[tmp], v[*a(j)]) {
				*a(i) = *a(j)
				i, j = j, j+j
			} else {
				break
			}
		}
		*a(i) = tmp
	}
}
