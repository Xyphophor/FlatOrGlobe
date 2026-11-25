// Moindres carrés linéaires par équations normales (pivot partiel), et recherche
// d'un minimum à une dimension (section dorée). Partagé par rot, orb, moon (epic19).

/** Coefficients a minimisant Σ(y − X·a)² ; renvoie aussi les résidus et leur rms. */
export function lsq(X, y) {
  const n = X[0].length, A = Array.from({ length: n }, () => Array(n).fill(0)), b = Array(n).fill(0);
  X.forEach((r, i) => { for (let p = 0; p < n; p++) { b[p] += r[p] * y[i]; for (let q = 0; q < n; q++) A[p][q] += r[p] * r[q]; } });
  for (let i = 0; i < n; i++) {
    let p = i; for (let j = i + 1; j < n; j++) if (Math.abs(A[j][i]) > Math.abs(A[p][i])) p = j;
    [A[i], A[p]] = [A[p], A[i]]; [b[i], b[p]] = [b[p], b[i]];
    for (let j = i + 1; j < n; j++) { const f = A[j][i] / A[i][i]; for (let k = i; k < n; k++) A[j][k] -= f * A[i][k]; b[j] -= f * b[i]; }
  }
  const a = Array(n);
  for (let i = n - 1; i >= 0; i--) { let s = b[i]; for (let k = i + 1; k < n; k++) s -= A[i][k] * a[k]; a[i] = s / A[i][i]; }
  const res = y.map((v, i) => v - X[i].reduce((s, x, k) => s + x * a[k], 0));
  return { a, res, rms: Math.sqrt(res.reduce((s, v) => s + v * v, 0) / res.length) };
}

/** Minimum de f sur [lo, hi] (section dorée, f unimodale). */
export function golden(f, lo, hi, iter = 90) {
  const g = (Math.sqrt(5) - 1) / 2;
  let a = lo, b = hi, c = b - g * (b - a), d = a + g * (b - a), fc = f(c), fd = f(d);
  for (let i = 0; i < iter; i++) {
    if (fc < fd) { b = d; d = c; fd = fc; c = b - g * (b - a); fc = f(c); }
    else { a = c; c = d; fc = fd; d = a + g * (b - a); fd = f(d); }
  }
  return (a + b) / 2;
}

/** Médiane et quartiles (interpolation linéaire). */
export function quartiles(v) {
  const s = v.slice().sort((x, y) => x - y), n = s.length;
  const q = (p) => { const i = (n - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return s[lo] + (s[hi] - s[lo]) * (i - lo); };
  return { n, min: s[0], q1: q(0.25), med: q(0.5), q3: q(0.75), max: s[n - 1] };
}
