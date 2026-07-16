# Yese Creations

Full-stack storefront for **Yese Creations** — a one-woman handmade-goods shop (crochet,
plushies, prints, home goods). A pnpm/Turborepo monorepo:

- `apps/cms` — Payload CMS 3.x (Next.js-hosted), backed by Postgres. Owns all product data,
  customer feedback/testimonials, and site-wide feature flags (`site-settings` global).
- `apps/storefront` — TanStack Start (React SSR). Reads products and feedback from the CMS at
  request/build time; renders the homepage grid, a fast in-app product overlay, and dedicated
  server-rendered pages — Product Detail Pages (`/product/<slug>`), `/feedback` (full customer
  review list) and `/about` (the maker's story) — each with full SEO (title/meta/canonical/OG/
  Twitter, plus JSON-LD on PDPs). `/about` and reviews also have a fast in-app overlay/inline-section
  view for browsing without a full page load; the standalone routes exist for sharing and search
  indexing (see `apps/docs/docs/homepage-and-content.md` for the non-technical version of this).
- `packages/product-data` — shared TypeScript types/enums + dev seed data (source of truth for
  both apps, so they can't drift).
- `packages/ui` — shared placeholder art component (`PHGradient`) used wherever a product has no
  real photo yet.

The design is final/high-fidelity, ported from the prototype in `design_handoff_yese_shop/` and
`design_handoff_yese_checkout/` (HTML/CSS/JS references — **not** production code, but genuine
build dependencies: see "Don't delete the design_handoff folders" below).

## Prerequisites

- Node >= 20.9 (`engines` in the root `package.json`)
- pnpm 10.17.x (`packageManager` field — `corepack enable` will pick this up automatically)
- Postgres reachable at `localhost:5432` (Docker is the easiest way — see below)
- A Stripe **test-mode** account if you want to exercise checkout end-to-end (optional for
  everything else — the homepage, overlay, and PDPs work without it)

## 1. Install

```sh
pnpm install
```

## 2. Postgres

No `docker-compose.yml` exists in this repo (yet) — spin up a plain container:

```sh
docker run --name yese-postgres -e POSTGRES_PASSWORD=localdev -p 5432:5432 -d postgres:16-alpine
docker exec -it yese-postgres psql -U postgres -c "CREATE DATABASE yese;"
```

This matches the default `DATABASE_URI` in `apps/cms/.env.example`
(`postgresql://postgres:localdev@localhost:5432/yese`). Payload uses Drizzle's `push` mode in
dev, so the schema syncs automatically on first boot — no manual migrations.

## 3. Env files

Each app reads its own `.env` (Vite and Next.js both only look in their own app directory, not
the monorepo root). Copy the example file for each app:

```sh
cp apps/cms/.env.example apps/cms/.env
cp apps/storefront/.env.example apps/storefront/.env
```

The root `.env.example` is a reference only (not loaded by either app) — it documents every var
across the stack in one place. Defaults in both `.env.example` files work out of the box for
local dev **except** the Stripe keys, which are placeholders
(`STRIPE_SECRET_KEY=sk_test_replace_me`) — checkout will not create a real PaymentIntent until you
fill in real Stripe test-mode keys (`STRIPE_SECRET_KEY`, `VITE_STRIPE_PUBLISHABLE_KEY`, and
`STRIPE_WEBHOOK_SECRET` from `stripe listen --forward-to localhost:3000/api/webhooks/stripe`).
Everything else — homepage, overlay, PDPs, cart — works with zero Stripe config.

## 4. First boot: create the admin user, then seed

The CMS must be started **once on its own** first, because Payload's first boot requires creating
an admin user through the UI before the API/seed script can authenticate against it:

```sh
pnpm --filter @yese/cms dev
```

Visit `http://localhost:3001/admin` and create the first user. Once that's done, seed the product
catalog (186 real products, migrated from the yesecreations eBay store) + their media:

```sh
pnpm --filter @yese/cms seed
```

Then seed customer feedback (real eBay buyer feedback, also migrated from the same store —
masked buyer handles, no real names, since that's all eBay's public feedback profile exposes):

```sh
pnpm --filter @yese/cms seed:feedback
```

Both seed scripts are idempotent (matches on slug/filename/quote+handle, safe to re-run). The
product seed reads real image files from `design_handoff_yese_shop/assets/` — **that folder is a
real runtime dependency of the seed script, not just a design reference; do not delete it** (this
corrects an earlier planning note in `.plan/stages/21-wiring-e2e.md` that called it safe to
remove).

## 5. Run both apps

```sh
pnpm dev
```

Runs both apps via Turborepo. Ports:

| App | Port | URL |
|---|---|---|
| CMS (Payload admin + API) | **3001** | http://localhost:3001/admin |
| Storefront | **3000** | http://localhost:3000 |

(`.plan/stages/21-wiring-e2e.md`'s original context note has these swapped — 3001 is the CMS,
3000 is the storefront; the `.env` files and each app's own `package.json` `dev` script are the
source of truth and agree with the table above.)

The storefront's product grid, overlay, and PDPs all read from the CMS over HTTP — if the CMS
isn't up (or hasn't been seeded), the homepage grid renders empty and individual PDP routes
404/error. Bring the CMS up and seeded first if you're starting fresh.

## How the two apps connect

- Storefront → CMS: server-only fetches (`apps/storefront/src/lib/cms.ts`) to
  `CMS_URL` (`http://localhost:3001`), never exposed to the client bundle.
- CMS → Storefront: `payload.config.ts`'s `serverURL: CMS_URL` makes Payload emit **absolute**
  media URLs, so images uploaded in the CMS (`:3001`) render correctly on the storefront (`:3000`)
  without a proxy.
- Both apps read the same `packages/product-data` shapes, so the CMS collection schema and the
  storefront's TypeScript types can't drift apart.
- Cart/wishlist state lives entirely client-side (`localStorage`, keys `yese_cart`/`yese_favs`),
  shared by the homepage, the fast in-app overlay, and every PDP — adding to the basket on a PDP
  and navigating back to the homepage shows the same basket count.
- CMS-driven feature flags (`site-settings` global, admin: **Site Settings**): which homepage
  marketing sections are shown (Original Artworks / How I make each piece / Studio Journal /
  Bespoke, all default OFF until an editor turns them on), and whether eBay-sourced feedback
  entries are shown to customers (`feedback.showEbaySourced`, defaults ON). The storefront
  re-fetches this global on every request — no caching — so toggling a flag in `/admin` takes
  effect immediately, no redeploy or server restart. See `apps/storefront/src/lib/cms.ts`.
- The **Feedback** collection is the single source for both the homepage's featured-reviews strip
  and the full `/feedback` page — same "one data source, two views" pattern as products/overlay/PDP.
  Each entry has a `source` (`ebay` | `app`) that decides which card style renders: eBay-sourced
  entries show a masked buyer handle + "Verified eBay purchase" badge (eBay never exposes a real
  name); `app` entries show a real customer name. See `FeedbackCard.tsx`.

## Build / SSG

```sh
pnpm --filter @yese/storefront build
```

Prerenders the homepage and every `/product/<slug>` to static HTML at build time (reading the
product list from the CMS — **the CMS must be reachable at build time**, or that build's PDPs
silently fall back to SSR-at-request-time instead of prerendering, per
`apps/storefront/vite.config.ts`'s CMS-unreachable fallback). Also emits `sitemap.xml` and copies
the static `public/robots.txt`. `/checkout` and `/confirmation` are deliberately never prerendered
— they stay live SSR routes (checkout creates a real Stripe PaymentIntent per request).

## Repo layout notes

- `design_handoff_yese_shop/` and `design_handoff_yese_checkout/` are the original prototypes
  (HTML/CSS/JS). They're read-only design references **and** a real build dependency —
  `design_handoff_yese_shop/assets/` is read directly by the CMS seed script (see step 4). Don't
  delete either folder.
- `.plan/PLAN.md` + `.plan/stages/*.md` — the stage-by-stage build plan and handover notes for
  every stage. Useful history if you're picking this project back up in a fresh session.
- File/import conventions (no `.js`/`.jsx` source files, extensionless relative imports, aliased
  paths preferred) are documented in `.plan/PLAN.md`.
