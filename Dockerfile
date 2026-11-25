# Flat or Globe -- image du site statique (Vite) servie par nginx non privilégié.
# Une seule image pour tous les environnements : SITE_ENV (production | staging | …), lu au
# démarrage, règle robots, en-têtes et bandeau. On construit une fois, on teste en staging,
# on promeut la MÊME image en production.
#
#   podman build -t flat-or-globe:$(git rev-parse --short HEAD) --build-arg GIT_SHA=$(git rev-parse --short HEAD) .
#   podman run --rm -p 8080:8080 -e SITE_ENV=staging flat-or-globe:<tag>
#
# ATTENTION (CLAUDE.md) : la construction lance `vite build` ; ne pas la lancer sur la machine
# du propriétaire (ancienne, sans AVX) sans l'avoir décidé -- la faire sur le nœud k3s ou en CI.

# ---- 1. construction et tests -------------------------------------------------------------
FROM docker.io/library/node:22-bookworm-slim AS build
WORKDIR /app
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    npm_config_fund=false \
    npm_config_audit=false
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.js ./
COPY scripts/contrib-build.mjs ./scripts/
COPY src ./src
COPY public ./public
# les tests unitaires (node:test, sans navigateur) gardent la porte : une régression bloque l'image
ARG SKIP_TESTS=0
RUN if [ "$SKIP_TESTS" != "1" ]; then npm test; fi
RUN npm run build
# une contribution non publiée (src/data/contrib/published.json) ne doit laisser aucune trace dans dist/
RUN node scripts/contrib-build.mjs check dist
ARG GIT_SHA=dev
RUN printf '%s\n' "$GIT_SHA" > dist/version.txt

# ---- 2. service -----------------------------------------------------------------------------
FROM docker.io/nginxinc/nginx-unprivileged:1.27-alpine
ARG GIT_SHA=dev
LABEL org.opencontainers.image.title="flat-or-globe" \
      org.opencontainers.image.description="Flat plane or Globe? -- static site" \
      org.opencontainers.image.revision="$GIT_SHA"
COPY deploy/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --chmod=0755 deploy/nginx/40-site-env.sh /docker-entrypoint.d/40-site-env.sh
COPY --from=build /app/dist /usr/share/nginx/html
ENV SITE_ENV=production
EXPOSE 8080
# l'image tourne en uid 101 et n'écrit que dans /tmp (compatible readOnlyRootFilesystem)
USER 101
