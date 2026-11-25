# The bulge: height s of an arc of radius R above its chord L.
import math

def sagitta(R, L):
    return R - math.sqrt(R * R - (L / 2) ** 2)             # about L*L / (8 R)
