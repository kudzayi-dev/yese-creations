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

# 1. Bring up Postgres + CMS. Real Payload migrations
#    (apps/cms/src/migrations/) run automatically as part of this — see
#    "Database migrations" below for why that matters.
docker compose --env-file .env.production up -d --build postgres migrate cms

# 2. Create the first admin user at https://cms.yesecreations.com/admin
#    (Payload's normal first-boot flow), then seed the catalog. This runs
#    via the same one-off `migrate` service image (which still has the
#    Payload CLI), NOT `exec cms` — the lean production cms image
#    deliberately doesn't carry it. See "Database migrations" below.
docker compose --env-file .env.production run --rm migrate pnpm --filter @yese/cms seed
docker compose --env-file .env.production run --rm migrate pnpm --filter @yese/cms seed:feedback

# 3. NOW build and start the storefront (it can see real products) + Caddy
docker compose --env-file .env.production up -d --build storefront caddy
```

## Database migrations

Payload's automatic dev-mode schema push (what every local `pnpm dev`
session has relied on across this whole project) does **not** run in
production (`next start`/standalone) — a truly fresh production database
would 500 on first request (`relation "categories" does not exist`)
without this.

Real migrations live in `apps/cms/src/migrations/` and run via the
`migrate` service in `docker-compose.yml` — a one-off container (using
the Dockerfile's `builder` stage, which still has the full Payload CLI;
the lean runtime `cms` image deliberately doesn't) that runs
`pnpm --filter @yese/cms migrate` once and exits. `cms` won't start until
`migrate` exits successfully (`depends_on: ... condition:
service_completed_successfully`), so there's no window where the app is
up against unmigrated schema.

**After changing any collection/global/field in `apps/cms/src`**, generate
a new migration before deploying:

```bash
cd apps/cms && pnpm migrate:create
```

Commit the generated files in `apps/cms/src/migrations/` — they need to
ship with the code change they correspond to.


## Redeploying after a code change

```bash
git pull
docker compose --env-file .env.production up -d --build
```

`migrate` runs again automatically as part of this (harmless/no-op if
there's nothing new to migrate) before `cms` restarts — same
`service_completed_successfully` gating as the first deploy. If you
added a new migration (see "Database migrations" above), this applies it.

Postgres data and uploaded media (`postgres_data`/`cms_media` named
volumes) persist across this — `--build` only rebuilds the app images, it
doesn't touch volumes.

## Keeping data intact when shipping new features

Short version: data persistence is already handled, you don't need to
think about it for ordinary redeploys. Two things ARE worth knowing:

**Schema changes go through a migration, not manual DB work.** If a
future feature adds/changes a Payload collection or field:
1. Build and test it locally as usual.
2. `cd apps/cms && pnpm migrate:create` — generates a migration file.
3. Commit that file alongside the code change.
4. On the VPS: `git pull && docker compose up -d --build` — `migrate`
   applies it automatically before `cms` restarts (see "Database
   migrations" above). Existing rows are untouched; only the new schema
   change is applied.

**Don't casually re-run `pnpm seed` in production after the first
deploy.** It upserts-by-slug from `packages/product-data/src/products.ts`
— exactly right for the FIRST seed, but a later re-run would silently
overwrite any edits made directly in `/admin` (a renamed product, a
changed price, a swapped photo) back to whatever's hardcoded in that
file. Once the shop owner is managing the catalog live, the production
database — not `products.ts` — is the real source of truth for existing
products. Adding genuinely new products in bulk later needs a
deliberately scoped script, not a full re-seed.

Local dev's Postgres and the VPS's production Postgres are two
independent databases from here on, by design — they're not meant to
sync with each other. Local is for building/testing; production is the
real business data.

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

## Ongoing maintenance (Hostinger VPS is self-managed)

Confirmed directly from Hostinger's own docs: their VPS is self-managed —
they cover hardware, network, and hPanel functionality, nothing at the OS
or application level. There's no vendor patching anything here; the two
things below are genuinely on us.

**Host OS security patches** — set this up once, right after first boot:

```bash
sudo apt update && sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

This auto-applies security patches to the host OS (kernel, openssh-server,
etc.) without needing to remember to do it manually. Docker Engine itself
isn't covered by this — update it periodically:

```bash
sudo apt update && sudo apt install --only-upgrade docker-ce docker-ce-cli containerd.io
```

**Container image patches** — everything in this stack runs from pinned
base images (`postgres:16-alpine`, `caddy:2-alpine`,
`ghcr.io/umami-software/umami:postgresql-latest`, `node:20-alpine` for the
two custom Dockerfiles) — rebuilding periodically pulls in whatever
security fixes landed in those upstream images since the last build:

```bash
docker compose --env-file .env.production pull
docker compose --env-file .env.production up -d --build
```

A monthly cadence is reasonable for a low-traffic shop — set a recurring
reminder rather than relying on remembering. Nothing here does this
automatically.

## Known gotchas (found while building this)

- **No automatic schema push in production** — Payload's dev-mode
  convenience (drizzle-kit push on every `pnpm dev`) doesn't run in
  `next start`/standalone. Real migrations (`apps/cms/src/migrations/`)
  are required and now run automatically via the `migrate` service —
  see "Database migrations" above. Found via an actual full
  `docker compose up` against a genuinely fresh database, not assumed.
- **The lean production `cms` image has no Payload CLI** — anything
  needing it (`payload migrate`, `payload run <script>` for seeding,
  `payload generate:types`, etc.) must run against the `migrate`
  service's image (`docker compose run --rm migrate ...`), not
  `docker compose exec cms ...`. The standalone Next.js output
  deliberately excludes dev/build tooling to stay small.
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
