#!/usr/bin/env bash
# !!! NE PAS LANCER SUR LA MACHINE DU PROPRIÉTAIRE (4 cœurs, 5,6 Go, sans AVX) :
# !!! le 2026-09-14 ce script l'a figée jusqu'au reboot. Préférer
# !!! scripts/mount-smoke.mjs (linkedom, sans navigateur). Voir NOTES.md.
# Capture headless (Firefox) d'un ou plusieurs onglets du serveur de dev.
# Usage : scripts/screenshot.sh <dossier-sortie> [clé ...]   (défaut : tous)
# Sert de substitut au navigateur absent de l'environnement : on VOIT le
# rendu réel (CSS, MathML, canvas 2D), pas seulement le DOM. WebGL n'est
# pas disponible en headless : les scènes Three.js montrent leur repli 2D.
set -euo pipefail
out=${1:?dossier de sortie}; shift || true
keys=("$@"); [ ${#keys[@]} -eq 0 ] && keys=(home sim hh ref cnav star dist dip grav fou seis mag sun twi azim surv ct gps obs falsify)
base=${BASE:-http://localhost:5173}
mkdir -p "$out" "$out/.profile"
for k in "${keys[@]}"; do
  MOZ_HEADLESS=1 timeout 120 firefox --headless --profile "$(realpath "$out/.profile")" --no-remote \
    --window-size="${WIDTH:-1200},${HEIGHT:-6000}" --screenshot "$(realpath "$out")/$k.png" "$base/#tab-$k" 2>/dev/null
  echo "$out/$k.png"
done
