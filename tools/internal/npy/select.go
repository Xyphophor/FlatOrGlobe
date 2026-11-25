package npy

import "math/bits"

func msb(n int) int { return bits.Len(uint(n)) - 1 }

// Partition is np.partition(a, kth) on one row, in place, with numpy's
// generic introselect (numpy/_core/src/npysort/selection.cpp, single kth,
// no pivot stack): the elements end in the same order as numpy leaves
// them, which matters when the first k are then summed.
func Partition(v []float64, kth int) {
	introselect(v, len(v), kth)
}

func introselect(v []float64, num, kth int) {
	low, high := 0, num-1
	if kth-low < 3 {
		dumbSelect(v[low:], high-low+1, kth-low)
		return
	}
	if kth == num-1 { // inexact type: move the maximum (last of equals) to the end
		maxidx, maxval := low, v[low]
		for k := low + 1; k < num; k++ {
			if !less(v[k], maxval) {
				maxidx, maxval = k, v[k]
			}
		}
		v[kth], v[maxidx] = v[maxidx], v[kth]
		return
	}
	depth := msb(num) * 2
	for low+1 < high {
		ll, hh := low+1, high
		if depth > 0 || hh-ll < 5 {
			mid := low + (high-low)/2
			median3Swap(v, low, mid, high)
		} else {
			mid := ll + medianOfMedian5(v[ll:], hh-ll)
			v[mid], v[low] = v[low], v[mid]
			ll--
			hh++
		}
		depth--
		pivot := v[low]
		for {
			for ll++; less(v[ll], pivot); ll++ {
			}
			for hh--; less(pivot, v[hh]); hh-- {
			}
			if hh < ll {
				break
			}
			v[ll], v[hh] = v[hh], v[ll]
		}
		v[low], v[hh] = v[hh], v[low]
		if hh >= kth {
			high = hh - 1
		}
		if hh <= kth {
			low = ll
		}
	}
	if high == low+1 && less(v[high], v[low]) {
		v[high], v[low] = v[low], v[high]
	}
}

func median3Swap(v []float64, low, mid, high int) {
	if less(v[high], v[mid]) {
		v[high], v[mid] = v[mid], v[high]
	}
	if less(v[high], v[low]) {
		v[high], v[low] = v[low], v[high]
	}
	if less(v[low], v[mid]) {
		v[low], v[mid] = v[mid], v[low]
	}
	v[mid], v[low+1] = v[low+1], v[mid]
}

func median5(v []float64) int {
	if less(v[1], v[0]) {
		v[1], v[0] = v[0], v[1]
	}
	if less(v[4], v[3]) {
		v[4], v[3] = v[3], v[4]
	}
	if less(v[3], v[0]) {
		v[3], v[0] = v[0], v[3]
	}
	if less(v[4], v[1]) {
		v[4], v[1] = v[1], v[4]
	}
	if less(v[2], v[1]) {
		v[2], v[1] = v[1], v[2]
	}
	if less(v[3], v[2]) {
		if less(v[3], v[1]) {
			return 1
		}
		return 3
	}
	return 2
}

func medianOfMedian5(v []float64, num int) int {
	right := num - 1
	nmed := (right + 1) / 5
	for i, sub := 0, 0; i < nmed; i, sub = i+1, sub+5 {
		m := median5(v[sub:])
		v[sub+m], v[i] = v[i], v[sub+m]
	}
	if nmed > 2 {
		introselect(v, nmed, nmed/2)
	}
	return nmed / 2
}

func dumbSelect(v []float64, num, kth int) {
	for i := 0; i <= kth; i++ {
		minidx, minval := i, v[i]
		for k := i + 1; k < num; k++ {
			if less(v[k], minval) {
				minidx, minval = k, v[k]
			}
		}
		v[i], v[minidx] = v[minidx], v[i]
	}
}
