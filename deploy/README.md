# Déploiement : image, environnements, k3s

Une seule image (`Dockerfile` à la racine) sert tous les environnements. Ce qui change d'un
environnement à l'autre est lu **au démarrage**, depuis la variable `SITE_ENV` :

| | `production` | tout autre valeur (`staging`, …) |
|---|---|---|
| `robots.txt` | `Allow: /` | `Disallow: /` |
| en-tête `X-Robots-Tag` | — | `noindex, nofollow` |
| bandeau en bas à droite | — | « staging · <commit> » |
| en-tête `X-Site-Env` | `production` | la valeur |

On construit donc une fois, on teste l'image en staging, puis on **promeut la même image**
(le même tag) en production : ce qui est en ligne est exactement ce qui a été vu.

## Fichiers

```
Dockerfile                       node 22 (npm ci, tests, vite build) → nginx non privilégié (uid 101, :8080)
.dockerignore                    liste blanche : index.html, src/, public/, package*.json, deploy/nginx/
deploy/nginx/default.conf        cache (assets/ un an, HTML revalidé), gzip, /healthz, en-têtes
deploy/nginx/40-site-env.sh      écrit robots.txt et les directives de l'environnement dans /tmp/site
deploy/k8s/base/                 Deployment (racine en lecture seule, sans privilèges) + Service
deploy/k8s/overlays/staging/     flatorglobe-staging, 1 réplique, accès par Tailscale seulement
deploy/k8s/overlays/production/  flatorglobe, 2 répliques, Ingress Traefik public, PDB
deploy/k8s/media/                Garage (stockage S3 des vidéos), partagé par les deux environnements
deploy/deploy.sh                 build / push / staging / promote / status / run
deploy/media.sh                  init / put / ls / rm / status du stockage des vidéos
```

## Avant le premier déploiement

À adapter (cherchez `À ADAPTER`) :

1. **Le registre** : `newName` dans les deux `overlays/*/kustomization.yaml`
   (par exemple `ghcr.io/<compte>/flat-or-globe` ou un registre sur le cluster).
   Sans registre, sur un k3s à un seul nœud, on peut importer l'image directement :
   `podman save <image> | sudo k3s ctr images import -`.
2. **Le domaine** de production : `overlays/production/ingress.yaml` (deux occurrences), et le
   certificat : cert-manager (décommenter l'annotation) ou un secret TLS `flatorglobe-tls` créé à la main.
3. **Tailscale pour la préproduction** : installer l'opérateur Tailscale sur le cluster
   ([doc](https://tailscale.com/kb/1236/kubernetes-operator)), avec un client OAuth du tailnet,
   MagicDNS et HTTPS activés. L'Ingress `ingressClassName: tailscale` publie alors le site sur
   `https://flatorglobe-staging.<tailnet>.ts.net`, **et nulle part ailleurs** ; qui y a droit se
   règle dans les ACL du tailnet.
   *Variante sans opérateur*, si le nœud k3s est lui-même sur le tailnet : un Ingress Traefik
   ordinaire sur un nom interne, restreint par un middleware `ipAllowList` à `100.64.0.0/10`.

## Cycle d'une mise à jour

```sh
deploy/deploy.sh build        # image <registre>:<commit> (tests unitaires compris)
deploy/deploy.sh push
deploy/deploy.sh staging      # déploie ce commit en préproduction, attend le rollout
# … vérifier sur https://flatorglobe-staging.<tailnet>.ts.net (bandeau « staging · <commit> »)
deploy/deploy.sh promote      # même tag en production, après confirmation
git commit deploy/k8s/overlays -m "deploy: <commit>"   # le tag écrit est la trace de ce qui tourne
```

`staging` refuse un arbre modifié (tag `-dirty`) : ce qui est testé doit être un commit.
Revenir en arrière : `deploy/deploy.sh staging <ancien-tag>` puis `promote`, ou
`kubectl -n flatorglobe rollout undo deploy/site`.

Essai local, sans cluster : `deploy/deploy.sh run staging` puis http://localhost:8080
(racine en lecture seule et `/tmp` en tmpfs, comme sur le cluster).

## Où construire

La construction lance `vite build`. **Pas sur la machine du propriétaire** sans décision
explicite (ancienne, sans AVX ; voir CLAUDE.md) : sur le nœud k3s (podman ou buildah), ou dans la
CI de la forge qui hébergera le dépôt. `--build-arg SKIP_TESTS=1` saute les tests en cas d'urgence.

## Médias : photos dans l'image, vidéos dans le cluster

- **Photos** (`public/photos/`, dans git) : elles font partie des mesures (les presets donnent leurs
  pixels, focales, azimuts) et changent avec le code ; elles restent dans git et dans l'image.
- **Vidéos** : dans un stockage objet **Garage** (compatible S3) sur le cluster, `deploy/k8s/media`,
  espace de noms `flatorglobe-media`, un volume de 10 Gi (local-path). Garage plutôt que MinIO, qui ne
  publie plus d'images communautaires (à ma connaissance, depuis 2025). Le nginx du site relaie
  `/video/…` vers le point d'accès « web » de Garage (bucket `media`, lecture anonyme) : **même
  domaine**, donc pas de CORS, et les canvas qui dessinent une vidéo restent exportables. Les URL du
  code (`/video/obs-2026-01-10-x20.mp4`) ne changent pas. Staging et production lisent le même bucket ;
  ajouter une vidéo ne demande ni rebuild ni redéploiement.
- Une NetworkPolicy n'ouvre Garage qu'aux pods du site, et seulement son port web. L'API S3 n'est
  jamais exposée : les envois passent par `kubectl port-forward`.

```sh
deploy/media.sh init                                   # une fois (secret, nœud, bucket, clé d'envoi)
deploy/media.sh put public/video/obs-2026-01-10-x20.mp4  # → servie sous /video/obs-2026-01-10-x20.mp4
deploy/media.sh ls
```

La clé d'envoi est gardée hors du dépôt, dans `~/.config/flatorglobe/media.env`. Le client S3 est
awscli lancé par `uvx` (rien à installer). Sauvegarde : le volume local-path est un dossier du nœud
(`/var/lib/rancher/k3s/storage/`) ; le copier, ou `aws s3 sync` le bucket ailleurs.

Hors cluster (`deploy/deploy.sh run`), `MEDIA_UPSTREAM` n'est pas défini : `/video/` répond 404.

## Ce qui n'est pas dans l'image

- `data/` (3,8 Go de données brutes) : inutile au site.
- `public/video/` : servi par le stockage du cluster (ci-dessus), exclu par `.dockerignore`.

## Pas encore vérifié

Rien de ceci n'a été exécuté : ni podman, ni docker, ni kubectl, ni nginx, ni Garage n'existent sur
la machine où ces fichiers ont été écrits. Pour Garage, à vérifier au premier `media.sh init` : le tag
de l'image (`v1.1.0` écrit), la sortie de `garage key create` (lue par le script), et que l'avance
rapide dans la vidéo marche à travers nginx (requêtes Range). Contrôlé : la syntaxe du script, le YAML, et le script
d'environnement (sorties staging/production). Premier essai conseillé : `deploy/deploy.sh build`
puis `run staging` sur le nœud k3s, et `curl -I localhost:8080/` (en-têtes), `/robots.txt`, `/healthz`.
