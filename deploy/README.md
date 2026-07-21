# Deploying to the VPS

One host running Docker, matching this project's existing shape (a Docker
Postgres the CMS already talks to in local dev) rather than a new
architecture just for production.

## Prerequisites on the VPS

- Docker + Docker Compose plugin installed.
- DNS: both domains (storefront + CMS) pointed at the VPS's IP, e.g.
  `www.yesecreations.com` and `cms.yesecreations.com` — Caddy needs both
  resolving before it can issue Let's Encrypt certificates.
- Ports 80/443 open (Caddy needs them for the ACME HTTP-01 challenge and
  serving traffic).

## First deploy (order matters)

The storefront's build step fetches the live product list from the CMS to
prerender every PDP and build `sitemap.xml` (see
`apps/storefront/Dockerfile`'s header comment). On a brand new VPS there's
no data yet, so build the storefront LAST:

```bash
git clone <repo> yese && cd yese
cp .env.production.example .env.production
# edit .env.production — fill in every value, especially:
#   PAYLOAD_SECRET, CMS_SERVICE_TOKEN (openssl rand -base64 32 / -hex 24)
#   POSTGRES_PASSWORD
#   STRIPE_SECRET_KEY / VITE_STRIPE_PUBLISHABLE_KEY / STRIPE_WEBHOOK_SECRET (LIVE keys)
#   PUBLIC_CMS_URL, STOREFRONT_URL, SITE_URL (real domains)

# edit deploy/Caddyfile — replace the two placeholder domains

# 1. Bring up Postgres + CMS only
docker compose --env-file .env.production up -d --build postgres cms

# 2. Create the first admin user at https://cms.yesecreations.com/admin
#    (Payload's normal first-boot flow), then seed the catalog:
docker compose --env-file .env.production exec cms pnpm seed
docker compose --env-file .env.production exec cms pnpm seed:feedback

# 3. NOW build and start the storefront (it can see real products) + Caddy
docker compose --env-file .env.production up -d --build storefront caddy
```

## Redeploying after a code change

```bash
git pull
docker compose --env-file .env.production up -d --build
```

Postgres data and uploaded media (`postgres_data`/`cms_media` named
volumes) persist across this — `--build` only rebuilds the app images, it
doesn't touch volumes.

## Media storage

Product photos live on local disk inside the `cms_media` volume (see
`apps/cms/src/collections/Media.ts` — deliberately not S3, this isn't a
big enough catalog to need it). **This is the only copy** — back this
volume up:

```bash
docker run --rm -v yese_cms_media:/media -v $(pwd):/backup alpine \
  tar czf /backup/cms_media_backup_$(date +%F).tar.gz -C /media .
```

## Logs

```bash
docker compose --env-file .env.production logs -f cms
docker compose --env-file .env.production logs -f storefront
```

## Known gotchas (found while building this)

- **`sharp` in the CMS image**: pnpm's isolated linker doesn't create the
  symlink sharp's native addon needs to find `libvips-cpp.so` at runtime.
  `apps/cms/Dockerfile` works around this by copying every installed
  libvips variant to `/usr/local/lib/sharp-libvips` and setting
  `LD_LIBRARY_PATH`. If a future `sharp` version bump breaks image
  uploads/resizing again, check this first.
- **Storefront's `start` script is `node server.mjs`, not `vite preview`**
  — this pinned TanStack Start version doesn't auto-bundle a self-starting
  server; `server.mjs` is a small custom fetch-native Node server (static
  file serving + SSR fallback) that IS the production entrypoint.
- **Telemetry/monitoring is not yet configured** — no error tracking,
  uptime monitoring, or log aggregation service is wired up. Flag this
  before relying on this deployment for real traffic.
