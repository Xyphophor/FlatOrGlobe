// Profil d'horizon « fin » (2026-09-24, demande du propriétaire : que la
// crête colle au LiDAR à fort zoom). Le générateur (research/lidar_horizon.py)
// écrit le profil habituel au pas de 0,1° ET, sur la bande des couchers
// filmés, un détail au pas de 0,01° (HP.detail). Cette fonction fond les deux
// en UN profil au pas du détail sur toute l'étendue : les vraies lectures
// LiDAR dans la bande, le profil à 0,1° interpolé linéairement ailleurs
// (aucune donnée inventée : entre deux rayons à 0,1°, on ne sait pas mieux).
// Même forme que le profil d'origine (az0, step, tableaux alignés), donc
// les figures qui bouclent sur az0 + i·step n'ont rien à changer.
const cache = new WeakMap();

export function refineProfile(HP) {
  const D = HP?.detail;
  if (!D) return HP;
  if (cache.has(HP)) return cache.get(HP);
  const n0 = HP.flat.length, span = HP.step * (n0 - 1);
  const n = Math.round(span / D.step) + 1;
  const coarse = (arr, az) => { const x = (az - HP.az0) / HP.step, i = Math.min(n0 - 2, Math.max(0, Math.floor(x))), f = x - i; return arr[i] * (1 - f) + arr[i + 1] * f; };
  const out = { ...HP, step: D.step };
  for (const key of Object.keys(HP)) {
    const arr = HP[key];
    if (!Array.isArray(arr) || arr.length !== n0) continue;
    const det = D[key];
    const res = new Array(n);
    for (let i = 0; i < n; i++) {
      const az = HP.az0 + i * D.step, j = (az - D.az0) / D.step, jr = Math.round(j);
      res[i] = det && Math.abs(j - jr) < 1e-6 && jr >= 0 && jr < det.length ? det[jr] : coarse(arr, az);
    }
    out[key] = res;
  }
  cache.set(HP, out);
  return out;
}
