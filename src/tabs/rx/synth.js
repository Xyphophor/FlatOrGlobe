// Ciel SYNTHÉTIQUE pour la figure de convergence (formfigs.js) et les tests : 24 satellites
// (6 plans × 4) dérivés d'un VRAI jeu d'éléments diffusés (G27, BRDC du 2 octobre 2026,
// archive BKG [7]) en tournant le nœud et l'anomalie ; un récepteur à une position
// connue ; des pseudo-distances exactes (temps de vol, rotation de la Terre pendant le
// vol, horloges du satellite et du récepteur), sans troposphère ni ionosphère. Le calcul
// de la page doit retrouver la position : c'est ce que la figure montre, itération par
// itération. Rien ici n'est une mesure.
import { satState, ecef } from "./userlogic.js";

const C = 299792458, OMEGA_E = 7.2921151467e-5;

/** Le vrai enregistrement G27 (RINEX 3.05), déjà décodé : voir userlogic.parseRinexNav. */
export const G27 = { sys: "G", prn: 27, toc: 439200, af0: 3.641471266747e-7, af1: 0, af2: 0, crs: 122.15625, dn: 4.80912889095e-9, m0: 1.690141931253,
  cuc: 6.202608346939e-6, ecc: 1.448556734249e-2, cus: 8.825212717056e-6, sqa: 5153.680339813, toe: 439200, cic: -4.172325134277e-7, om0: -1.764856242855,
  cis: -6.705522537231e-8, i0: 0.9497023637612, crc: 204.46875, w: 0.9050624367633, omd: -8.194269895661e-9, idot: -1.185763677531e-10, tgd: 2.328306436539e-9 };

/**
 * Renvoie { nav, ep, truth, bias } : nav au format de parseRinexNav, ep = une époque
 * {sow, obs} avec les satellites au-dessus de `maskDeg` vus de (lat, lon, h).
 */
export function syntheticSky({ lat = 45.2, lon = 5.7, h = 300, bias = 1234.5, dt = 600, maskDeg = 15 } = {}) {
  const eph = {};
  for (let p = 0; p < 6; p++) for (let k = 0; k < 4; k++) {
    const prn = p * 4 + k + 1;
    eph[`G${String(prn).padStart(2, "0")}`] = [{ ...G27, prn, om0: G27.om0 + p * Math.PI / 3, m0: G27.m0 + k * Math.PI / 2 + p * 0.5, af0: 1e-5 * (k - 1.5) }];
  }
  const truth = ecef(lat, lon, h), sow = G27.toe + dt, obs = [];
  for (const key in eph) {
    const e = eph[key][0];
    let tau = 0.07, sp, st;
    for (let i = 0; i < 6; i++) {          // temps de vol : point fixe
      st = satState(e, sow - tau);
      const th = OMEGA_E * tau;
      sp = [st.p[0] * Math.cos(th) + st.p[1] * Math.sin(th), -st.p[0] * Math.sin(th) + st.p[1] * Math.cos(th), st.p[2]];
      tau = Math.hypot(sp[0] - truth[0], sp[1] - truth[1], sp[2] - truth[2]) / C;
    }
    const up = (sp[0] - truth[0]) * truth[0] + (sp[1] - truth[1]) * truth[1] + (sp[2] - truth[2]) * truth[2];
    if (up / (Math.hypot(...truth) * tau * C) < Math.sin(maskDeg * Math.PI / 180)) continue;
    obs.push({ sys: "G", prn: e.prn, pr: tau * C + bias - C * st.clk });
  }
  return { nav: { eph, iono: null }, ep: { sow, obs }, truth, bias };
}
