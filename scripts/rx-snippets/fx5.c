/* The code you share: your position rounded to q metres, and its check digits. */
#include <stdio.h>
#include <stdint.h>
#include <math.h>

/* 32-bit FNV-1a: catches a copying error, not a forgery. (Bytes: the same as the page
   for a name in plain ASCII; the page hashes UTF-16 code units.) */
uint32_t fnv1a(const char *s) {
    uint32_t h = 0x811C9DC5u;
    for (; *s; s++) { h ^= (unsigned char)*s; h *= 0x01000193u; }
    return h;
}

void base36(uint32_t n, char *out) {
    char tmp[8]; int k = 0;
    do { tmp[k++] = "0123456789abcdefghijklmnopqrstuvwxyz"[n % 36]; n /= 36; } while (n);
    while (k) *out++ = tmp[--k];
    *out = 0;
}

/* x_hat = q * round(x / q): the code carries round(x / q). */
void make_code(const char *name, const char *date, const double x[3], int q, double rms,
               int epochs, const char *systems, char *out, size_t size) {
    char check[8];
    int len = snprintf(out, size, "FOG1|%s|%s|%d|%.0f|%.0f|%.0f|%.0f|%d|%s", name, date, q,
                       floor(x[0] / q + 0.5), floor(x[1] / q + 0.5), floor(x[2] / q + 0.5),
                       floor(rms * 10 + 0.5), epochs, systems);
    base36(fnv1a(out), check);
    snprintf(out + len, size - len, "|%s", check);
}
