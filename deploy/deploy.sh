#!/usr/bin/env bash
# Flat or Globe -- construire, publier, déployer en staging, promouvoir en production.
#
#   deploy/deploy.sh build            construit l'image, taguée du commit (podman, sinon docker)
#   deploy/deploy.sh push             la pousse vers le registre
#   deploy/deploy.sh staging [TAG]    déploie TAG (défaut : le commit courant) en staging
#   deploy/deploy.sh promote          déploie en production le tag qui tourne en staging
#   deploy/deploy.sh status           tags et pods des deux environnements
#   deploy/deploy.sh run [ENV]        lance l'image en local sur :8080 (ENV=staging par défaut)
#
# Variables : REGISTRY (défaut : celui écrit dans les overlays), KUBECTL (défaut : kubectl),
# ENGINE (podman | docker). Le tag écrit dans overlays/*/kustomization.yaml est la trace de ce qui
# est déployé : committer ce fichier après staging/promote.
#
# ATTENTION : `build` lance `vite build`. Sur la machine du propriétaire (ancienne, sans AVX) il
# ne se lance pas sans décision explicite (CLAUDE.md) ; le faire sur le nœud k3s ou en CI.
set -euo pipefail
cd "$(dirname "$0")/.."
K8S=deploy/k8s/overlays
KUBECTL=${KUBECTL:-kubectl}
ENGINE=${ENGINE:-$(command -v podman >/dev/null && echo podman || echo docker)}
cur_reg() { sed -n 's/^ *newName: *\([^ #]*\).*/\1/p' "$K8S/$1/kustomization.yaml"; }
cur_tag() { sed -n 's/^ *newTag: *\([^ #]*\).*/\1/p' "$K8S/$1/kustomization.yaml"; }
set_tag() { sed -i "s/^\( *newTag: *\)[^ #]*/\1$2/" "$K8S/$1/kustomization.yaml"; }
REGISTRY=${REGISTRY:-$(cur_reg staging)}
git_tag() {
  local t; t=$(git rev-parse --short=10 HEAD)
  if ! git diff --quiet HEAD -- index.html src public package.json package-lock.json deploy/nginx Dockerfile; then t="$t-dirty"; fi
  echo "$t"
}

case "${1:-}" in
  build)
    TAG=${2:-$(git_tag)}
    "$ENGINE" build --build-arg GIT_SHA="$TAG" -t "$REGISTRY:$TAG" .
    echo "image: $REGISTRY:$TAG" ;;
  push)
    TAG=${2:-$(git_tag)}
    "$ENGINE" push "$REGISTRY:$TAG" ;;
  staging)
    TAG=${2:-$(git_tag)}
    case "$TAG" in *-dirty) echo "refus : $TAG n'est pas un commit (arbre modifié)"; exit 1;; esac
    set_tag staging "$TAG"
    "$KUBECTL" apply -k "$K8S/staging"
    "$KUBECTL" -n flatorglobe-staging rollout status deploy/site --timeout=120s
    echo "staging = $TAG" ;;
  promote)
    TAG=$(cur_tag staging)
    [ "$TAG" = dev ] && { echo "rien en staging"; exit 1; }
    read -r -p "Production : $(cur_tag production) -> $TAG ? [o/N] " ok
    [ "$ok" = o ] || [ "$ok" = O ] || exit 1
    set_tag production "$TAG"
    "$KUBECTL" apply -k "$K8S/production"
    "$KUBECTL" -n flatorglobe rollout status deploy/site --timeout=180s
    echo "production = $TAG" ;;
  status)
    for e in staging production; do echo "$e : $(cur_tag $e)"; done
    "$KUBECTL" -n flatorglobe-staging get deploy,pods,ingress 2>/dev/null || true
    "$KUBECTL" -n flatorglobe get deploy,pods,ingress 2>/dev/null || true ;;
  run)
    E=${2:-staging}
    "$ENGINE" run --rm -p 8080:8080 -e SITE_ENV="$E" --read-only --tmpfs /tmp "$REGISTRY:$(git_tag)" ;;
  *)
    sed -n '2,15p' "$0"; exit 1 ;;
esac
