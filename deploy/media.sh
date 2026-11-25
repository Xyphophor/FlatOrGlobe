#!/usr/bin/env bash
# Médias du site (vidéos) dans le stockage Garage du cluster (deploy/k8s/media).
#
#   deploy/media.sh init              une fois : secret, Garage, disposition du nœud, bucket « media »
#                                     ouvert en lecture web, clé d'envoi gardée dans ~/.config/flatorglobe/
#   deploy/media.sh put FICHIER [CLÉ] envoie un fichier (clé par défaut : video/<nom du fichier>)
#   deploy/media.sh put-dir DOSSIER [PRÉFIXE]
#                                     envoie les .mp4 et manifest.json d'un dossier, sauf _unpublished/ (défaut : video/cards ; sync, une seule connexion)
#   deploy/media.sh ls                liste le bucket
#   deploy/media.sh rm CLÉ            supprime un objet
#   deploy/media.sh status            état de Garage
#
# Le site sert le bucket sous /video/ (nginx → point d'accès web de Garage, même domaine : pas de
# CORS, les canvas qui dessinent la vidéo restent exportables). L'API S3 n'est jamais exposée : les
# envois passent par kubectl port-forward. Client S3 : awscli lancé par uvx (rien à installer),
# ou `aws` s'il est déjà là.
set -euo pipefail
cd "$(dirname "$0")/.."
KUBECTL=${KUBECTL:-kubectl}
NS=flatorglobe-media BUCKET=media KEYNAME=site-upload
CONF=${XDG_CONFIG_HOME:-$HOME/.config}/flatorglobe/media.env
g() { "$KUBECTL" -n "$NS" exec garage-0 -- /garage "$@"; }
aws_() { if command -v aws >/dev/null; then aws "$@"; else uvx --quiet --from awscli aws "$@"; fi; }
s3() {
  [ -f "$CONF" ] || { echo "pas de clé ($CONF) : lancer d'abord deploy/media.sh init"; exit 1; }
  # shellcheck disable=SC1090
  . "$CONF"
  local port=39000
  "$KUBECTL" -n "$NS" port-forward svc/garage "$port:3900" >/dev/null 2>&1 & local pf=$!
  trap 'kill $pf 2>/dev/null' EXIT
  for _ in $(seq 20); do (exec 3<>/dev/tcp/127.0.0.1/$port) 2>/dev/null && break; sleep 0.3; done
  AWS_ACCESS_KEY_ID=$KEY_ID AWS_SECRET_ACCESS_KEY=$KEY_SECRET AWS_DEFAULT_REGION=garage \
    aws_ --endpoint-url "http://127.0.0.1:$port" "$@"
}

case "${1:-}" in
  init)
    if ! "$KUBECTL" -n "$NS" get secret garage-secrets >/dev/null 2>&1; then
      "$KUBECTL" apply -f deploy/k8s/media/namespace.yaml
      "$KUBECTL" -n "$NS" create secret generic garage-secrets \
        --from-literal=rpc-secret="$(openssl rand -hex 32)" --from-literal=admin-token="$(openssl rand -base64 32)"
    fi
    "$KUBECTL" apply -k deploy/k8s/media
    "$KUBECTL" -n "$NS" rollout status statefulset/garage --timeout=180s
    if ! g layout show 2>/dev/null | grep -q dc1; then          # nœud pas encore placé dans la disposition
      ID=$(g node id -q | cut -d@ -f1)
      g layout assign -z dc1 -c 10G "$ID"
      g layout apply --version 1
    fi
    g bucket info "$BUCKET" >/dev/null 2>&1 || g bucket create "$BUCKET"
    g bucket website --allow "$BUCKET"
    if [ ! -f "$CONF" ]; then
      OUT=$(g key create "$KEYNAME")
      KID=$(printf '%s\n' "$OUT" | awk -F': *' '/Key ID/ { print $2; exit }')
      KSEC=$(printf '%s\n' "$OUT" | awk -F': *' '/Secret key/ { print $2; exit }')
      g bucket allow --read --write --owner "$BUCKET" --key "$KEYNAME"
      mkdir -p "$(dirname "$CONF")"; umask 077
      printf 'KEY_ID=%s\nKEY_SECRET=%s\n' "$KID" "$KSEC" > "$CONF"
      echo "clé d'envoi enregistrée dans $CONF"
    fi
    g bucket info "$BUCKET" ;;
  put)
    F=${2:?fichier}; K=${3:-video/$(basename "$F")}
    s3 s3 cp "$F" "s3://$BUCKET/$K"
    echo "en ligne sous /$K" ;;
  put-dir)
    D=${2:?dossier}; K=${3:-video/cards}
    s3 s3 sync "$D" "s3://$BUCKET/$K" --exclude '*' --include '*.mp4' --include 'manifest.json' --include 'layers/manifest.json' --exclude '_unpublished/*'
    echo "en ligne sous /$K/" ;;
  ls) s3 s3 ls "s3://$BUCKET/" --recursive --human-readable ;;
  rm) s3 s3 rm "s3://$BUCKET/${2:?clé}" ;;
  status) g status; g bucket info "$BUCKET" ;;
  *) sed -n '2,16p' "$0"; exit 1 ;;
esac
