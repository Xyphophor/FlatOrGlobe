#!/usr/bin/env python3
"""La réfraction du 28 mars 2026 vers 17 h 34 (photo DSCN7496 de Bordighera), SANS la photo.

Demande du propriétaire (2026-10-06) : la photo seule ne sépare pas la hauteur d'œil et k (les deux bâtiments
sont à 49 km tous les deux) ; il faut la réfraction du jour d'ailleurs.

1. L'air et la mer le long de la visée (Open-Meteo, lu par curl) : ERA5 (température et point de rosée à 2 m,
   pression, vent à 10 m) aux trois points de grille EN MER au sud de la visée (43,5° N ; 7,25 / 7,5 / 7,75° E),
   la température de surface de la mer (marine), et le modèle à haute résolution (historical-forecast, 2 m et
   80 m) comme second avis. Interpolation linéaire entre 17 h et 18 h (heure de Paris, encore CET ce jour-là).
2. Le profil près de l'eau : similitude de Monin-Obukhov (Businger-Dyer ; rugosité de Charnock), résolue à
   partir de la mer (température, humidité saturée × 0,98) et de l'air à 2 m. On en tire T(z) et e(z).
3. Indice pour la lumière visible : N = 79,01·P/T − 12·e/T (P, e en hPa ; même constante sèche que dip).
4. Rayons tracés dans ce profil (couches horizontales sur une Terre de rayon R, z'' = 1/R + dN/dz·10⁻⁶) depuis
   l'œil : la hauteur cachée à la distance des deux bâtiments = la plus basse hauteur qu'un rayon atteint là sans
   avoir touché la mer. k équivalent : celui qui donne la même hauteur cachée avec des rayons droits sur R/(1 − k).
5. Pour plusieurs hauteurs d'œil, et l'écart (air − mer) décalé de ±0,5 K (l'incertitude d'une réanalyse).

Rien n'est écrit dans le site : sortie sur la console.  python3 research/bordighera_refraction.py
"""
import json, math, subprocess
import numpy as np

R, KAPPA, G = 6371e3, 0.4, 9.81
D_VILLA, D_HESP = 49082.0, 48949.0           # m (BORD_SITE, centres des emprises)
FRAC = 34 / 60
PTS = [(43.5, 7.25), (43.5, 7.5), (43.5, 7.75)]
Q = "&start_date=2026-03-28&end_date=2026-03-28&timezone=Europe%2FParis"


def get(url):
    return json.loads(subprocess.run(["curl", "-s", url], capture_output=True, text=True, check=True).stdout)


def at(h, k):
    a, b = h[k][17], h[k][18]
    return a + (b - a) * FRAC


def esat(t):                                   # hPa, Magnus (eau)
    return 6.112 * math.exp(17.62 * t / (243.12 + t))


def psi(zeta):
    """Fonctions de stabilité (m, h) de Businger-Dyer."""
    if zeta >= 0:
        z = min(zeta, 5.0); return -5 * z, -5 * z
    x = (1 - 16 * zeta) ** 0.25
    pm = 2 * math.log((1 + x) / 2) + math.log((1 + x * x) / 2) - 2 * math.atan(x) + math.pi / 2
    return pm, 2 * math.log((1 + x * x) / 2)


def profile(sst, t2, td2, u10, P):
    """Monin-Obukhov : renvoie T(z) (°C) et e(z) (hPa) pour z en m, à partir de la mer et de l'air à 2 m."""
    es = 0.98 * esat(sst); e2 = esat(td2)
    th_s, th_2 = sst, t2 + 0.0098 * 2           # température potentielle (référence : la surface)
    us, L = 0.035 * u10, 1e9
    for _ in range(50):
        z0 = 0.011 * us * us / G + 0.11 * 1.5e-5 / us; z0t = 1e-4
        pm10, _ = psi(10 / L); _, ph2 = psi(2 / L)
        us = KAPPA * u10 / (math.log(10 / z0) - pm10)
        ths = KAPPA * (th_2 - th_s) / (math.log(2 / z0t) - ph2)
        es_ = KAPPA * (e2 - es) / (math.log(2 / z0t) - ph2)
        thv_star = ths + 0.61 * (th_s + 273.15) * es_ / P * 0.622
        L = us * us * (th_s + 273.15) / (KAPPA * G * thv_star) if abs(thv_star) > 1e-9 else 1e9
    def T(z):
        z = max(z, 2 * z0t); return th_s + ths / KAPPA * (math.log(z / z0t) - psi(z / L)[1]) - 0.0098 * z
    def E(z):
        z = max(z, 2 * z0t); return es + es_ / KAPPA * (math.log(z / z0t) - psi(z / L)[1])
    return T, E, dict(ustar=round(us, 3), L=round(L, 1), thstar=round(ths, 4))


def N(T, E, P0, z):
    t = T(z) + 273.15; p = P0 * math.exp(-z / 8400)
    return 79.01 * p / t - 12.0 * E(z) / t


def hidden_at(T, E, P0, eye, dists, dx=5.0):
    """Plus basse hauteur atteinte à chaque distance par un rayon parti de l'œil sans toucher la mer (m).
    Tous les rayons à la fois (numpy) ; dN/dz tabulé sur une grille logarithmique de 1 cm à 200 m."""
    zs = 0.01 * 1.02 ** np.arange(500); zs = zs[zs < 200]
    Ns = np.array([N(T, E, P0, z) for z in zs]); zm = (zs[1:] + zs[:-1]) / 2; gr = np.diff(Ns) / np.diff(zs)
    a = -(eye / 15000) * (1 + 2e-3 * np.arange(-400, 1400))
    z = np.full(a.shape, eye); s = a.copy(); alive = np.ones(a.shape, bool); x = 0.0
    best = {}; nxt = sorted(dists); j = 0
    while x < max(dists):
        s = s + (1 / R + np.interp(z, zm, gr) * 1e-6) * dx; z = z + s * dx; x += dx
        alive &= z > 0
        while j < len(nxt) and x >= nxt[j]:
            best[nxt[j]] = float(z[alive].min()) if alive.any() else math.inf; j += 1
    return best


def k_equiv(H, eye, d):
    lo, hi = -1.0, 0.9
    for _ in range(80):
        k = (lo + hi) / 2; Rp = R / (1 - k); d0 = math.sqrt(2 * Rp * eye)
        h = (d - d0) ** 2 / (2 * Rp) if d > d0 else 0
        if h > H: lo = k
        else: hi = k
    return (lo + hi) / 2


def main():
    rows = []
    for la, lo in PTS:
        e = get(f"https://archive-api.open-meteo.com/v1/archive?latitude={la}&longitude={lo}&hourly=temperature_2m,dew_point_2m,surface_pressure,wind_speed_10m&models=era5{Q}")["hourly"]
        m = get(f"https://marine-api.open-meteo.com/v1/marine?latitude={la}&longitude={lo}&hourly=sea_surface_temperature{Q}")["hourly"]
        f = get(f"https://historical-forecast-api.open-meteo.com/v1/forecast?latitude={la}&longitude={lo}&hourly=temperature_2m,dew_point_2m,wind_speed_10m,temperature_80m{Q}")["hourly"]
        rows.append(dict(pt=(la, lo), sst=at(m, "sea_surface_temperature"), t2=at(e, "temperature_2m"), td=at(e, "dew_point_2m"),
                         u=at(e, "wind_speed_10m") / 3.6, P=at(e, "surface_pressure"),
                         hf_t2=at(f, "temperature_2m"), hf_td=at(f, "dew_point_2m"), hf_u=at(f, "wind_speed_10m") / 3.6, hf_t80=at(f, "temperature_80m")))
    for r in rows:
        print(f"{r['pt']} : mer {r['sst']:.2f} °C ; ERA5 2 m {r['t2']:.2f} °C (rosée {r['td']:.1f}), vent {r['u']:.1f} m/s, {r['P']:.1f} hPa ; "
              f"modèle fin 2 m {r['hf_t2']:.2f} °C, 80 m {r['hf_t80']:.2f} °C, vent {r['hf_u']:.1f} m/s")
    mean = lambda k: sum(r[k] for r in rows) / len(rows)
    cases = [("ERA5", mean("t2"), mean("td"), mean("u")), ("modèle fin", mean("hf_t2"), mean("hf_td"), mean("hf_u"))]
    sst, P = mean("sst"), mean("P")
    print(f"\nmoyenne : mer {sst:.2f} °C, {P:.1f} hPa")
    print("cas | air−mer | œil | caché Villa / Hesperia | k équiv. | (photo : caché ≈ 44,8 m Villa, ≥ 46,2 m Hesperia)")
    for name, t2, td, u in cases:
        for dT in (-0.5, 0.0, 0.5):
            T, E, mo = profile(sst, t2 + dT, td, u, P)
            for eye in (28.6, 33.6, 36.6, 38.6):
                H = hidden_at(T, E, P, eye, [D_HESP, D_VILLA])
                print(f"{name:10s} | {t2 + dT - sst:+.2f} K | {eye:4.1f} m | {H[D_VILLA]:5.1f} / {H[D_HESP]:5.1f} m | k = {k_equiv(H[D_VILLA], eye, D_VILLA):.3f} | {mo}")


if __name__ == "__main__":
    main()
