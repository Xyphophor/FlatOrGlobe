# The code you share: your position rounded to q metres, and its check digits.
import math

def fnv1a(s):
    """32-bit FNV-1a over the characters: catches a copying error, not a forgery."""
    h = 0x811C9DC5
    for ch in s:
        h = ((h ^ ord(ch)) * 0x01000193) & 0xFFFFFFFF
    return h

def base36(n):
    digits = "0123456789abcdefghijklmnopqrstuvwxyz"
    out = ""
    while True:
        n, k = divmod(n, 36)
        out = digits[k] + out
        if n == 0:
            return out

def make_code(name, date, x, q, rms, epochs, systems):
    rnd = lambda v: math.floor(v + 0.5)                    # x_hat = q * round(x / q)
    body = "|".join(["FOG1", name, date, str(q)] + [str(rnd(v / q)) for v in x]
                    + [str(rnd(rms * 10)), str(epochs), systems])
    return body + "|" + base36(fnv1a(body))
