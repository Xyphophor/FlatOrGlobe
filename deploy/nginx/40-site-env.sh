#!/bin/sh
# Lancé par l'entrypoint de l'image nginx avant nginx. Écrit dans /tmp/site (seul endroit
# inscriptible) ce qui dépend de l'environnement : robots.txt et les directives de chaque
# location (en-têtes ; hors production, noindex et bandeau visible avec la version).
set -eu
ENV="${SITE_ENV:-production}"
VER="$(cat /usr/share/nginx/html/version.txt 2>/dev/null || echo dev)"
mkdir -p /tmp/site
{
  echo 'add_header X-Content-Type-Options "nosniff" always;'
  echo 'add_header Referrer-Policy "strict-origin-when-cross-origin" always;'
  echo 'add_header X-Frame-Options "SAMEORIGIN" always;'
  echo "add_header X-Site-Env \"$ENV\" always;"
} > /tmp/site/headers.conf
if [ "$ENV" = "production" ]; then
  printf 'User-agent: *\nAllow: /\n' > /tmp/site/robots.txt
  : > /tmp/site/env.conf
else
  printf 'User-agent: *\nDisallow: /\n' > /tmp/site/robots.txt
  # le bandeau n'est injecté que dans le HTML (sub_filter ne touche que text/html)
  cat > /tmp/site/env.conf <<CONF
add_header X-Robots-Tag "noindex, nofollow" always;
sub_filter_once on;
sub_filter '</body>' '<div style="position:fixed;right:8px;bottom:8px;z-index:99999;padding:3px 8px;border-radius:4px;background:#b45309;color:#fff;font:600 12px ui-monospace,monospace;pointer-events:none">${ENV} · ${VER}</div></body>';
CONF
fi
# /video/ : relayé vers le bucket de médias s'il est configuré (sinon, fichiers de l'image s'il y en a).
# Résolution DNS à la demande (resolver + variable) : le site démarre même si le stockage est absent.
if [ -n "${MEDIA_UPSTREAM:-}" ]; then
  RES=$(awk '/^nameserver/ { print $2; exit }' /etc/resolv.conf)
  case "$RES" in *:*) RES="[$RES]";; esac
  cat > /tmp/site/media.conf <<CONF
location ^~ /video/ {
    include /tmp/site/headers.conf;
    resolver $RES valid=30s ipv6=off;
    set \$media_up ${MEDIA_UPSTREAM};
    proxy_pass \$media_up;
    proxy_http_version 1.1;
    proxy_set_header Host ${MEDIA_BUCKET:-media};
    proxy_set_header Connection "";
    proxy_set_header Authorization "";
    proxy_hide_header Cache-Control;
    proxy_hide_header Set-Cookie;
    proxy_hide_header x-amz-request-id;
    proxy_hide_header x-amz-id-2;
    proxy_hide_header Server;
    add_header Cache-Control "public, max-age=86400" always;
    proxy_connect_timeout 3s;
}
CONF
else
  : > /tmp/site/media.conf
fi
echo "40-site-env.sh: SITE_ENV=$ENV version=$VER media=${MEDIA_UPSTREAM:-(image)}"
