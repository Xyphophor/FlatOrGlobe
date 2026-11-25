/* Décodeur LZW de TIFF (compression 5), pour les dalles COG du BEV lues par
 * research/bev_dem.py. Python pur mettait ~1 s par bloc de 256 × 256 ; ici
 * quelques millisecondes. Compilé à la demande par bev_dem.py :
 *   cc -O2 -shared -fPIC -o <cache>/libbevlzw.so research/bev_lzw.c
 *
 * Variante TIFF : codes lus bit de poids fort d'abord, 9 à 12 bits, Clear =
 * 256, EOI = 257, et le « changement anticipé » (la largeur passe à n + 1 dès
 * que le prochain code vaut 2^n − 1, comme libtiff).
 *
 * Astuce classique : chaque entrée de la table est une chaîne DÉJÀ écrite
 * dans la sortie (la sortie précédente + le premier octet de la suivante,
 * qui la suit immédiatement) ; on la note (début, longueur) dans `out`,
 * sans table de chaînes.
 *
 * Renvoie le nombre d'octets écrits, ou −1 si le flux est invalide. */
#include <stdint.h>
#include <string.h>

int lzw_decode(const uint8_t *in, int inlen, uint8_t *out, int outlen) {
    static int st[4096], ln[4096];
    int ip = 0, pos = 0, nbits = 9, next = 258, old = -1, oldpos = 0, oldlen = 0;
    uint32_t buf = 0; int bits = 0;
    for (;;) {
        while (bits < nbits) {
            if (ip >= inlen) return pos;              /* flux tronqué sans EOI : on rend ce qu'on a */
            buf = (buf << 8) | in[ip++]; bits += 8;
        }
        int code = (int)((buf >> (bits - nbits)) & ((1u << nbits) - 1));
        bits -= nbits;
        if (code == 257) break;
        if (code == 256) { nbits = 9; next = 258; old = -1; continue; }
        int curlen;
        if (old < 0) {                                /* premier code après Clear : un littéral */
            if (code > 255 || pos >= outlen) return -1;
            out[pos] = (uint8_t)code; curlen = 1;
        } else {
            if (code < 256) {
                if (pos >= outlen) return -1;
                out[pos] = (uint8_t)code; curlen = 1;
            } else if (code < next) {
                curlen = ln[code];
                if (pos + curlen > outlen) return -1;
                for (int i = 0; i < curlen; i++) out[pos + i] = out[st[code] + i];
            } else if (code == next) {                /* cas KwKwK : l'ancienne chaîne + son premier octet */
                curlen = oldlen + 1;
                if (pos + curlen > outlen) return -1;
                for (int i = 0; i < oldlen; i++) out[pos + i] = out[oldpos + i];
                out[pos + oldlen] = out[oldpos];
            } else return -1;
            if (next < 4096) { st[next] = oldpos; ln[next] = oldlen + 1; next++; }
            if (next >= (1 << nbits) - 1 && nbits < 12) nbits++;
        }
        old = code; oldpos = pos; oldlen = curlen; pos += curlen;
    }
    return pos;
}

/* Prédicteur 3 de TIFF (« floating point », éditions 2025 du BEV) : chaque
 * ligne de w flottants est stockée octet de poids fort d'abord, par plans
 * (w octets de poids fort, puis w suivants…), puis différenciée octet par
 * octet. On cumule, puis on remet chaque flottant en petit-boutiste
 * (comme libtiff, fpAcc). `buf` : h lignes de 4·w octets, réécrites en place. */
void fp_predictor(uint8_t *buf, int w, int h) {
    static uint8_t tmp[4 * 4096];
    int n = 4 * w;
    if (n > (int)sizeof tmp) return;
    for (int r = 0; r < h; r++) {
        uint8_t *row = buf + (size_t)r * n;
        for (int i = 1; i < n; i++) row[i] = (uint8_t)(row[i] + row[i - 1]);
        memcpy(tmp, row, n);
        for (int i = 0; i < w; i++)
            for (int b = 0; b < 4; b++) row[4 * i + b] = tmp[(3 - b) * w + i];
    }
}
