# @yese/cms

Payload CMS 3.x (Next.js-hosted) on Postgres. Admin panel + REST/GraphQL API for
the Yese Creations store. This is the backend/source-of-truth; the storefront reads
product data from here.

## Stack

- Payload 3.86 + `@payloadcms/db-postgres` (Drizzle), `@payloadcms/next`, lexical editor
- Next.js 16.2 (Turbopack dev), React 19
- Runs on **port 3001** (storefront takes 3000)

## Prerequisites

A running Postgres 16. Local dev uses the shared infra Docker Postgres:

```
postgresql://postgres:localdev@localhost:5432/yese
```

The `yese` database must exist. To create it:

```bash
docker exec -e PGPASSWORD=localdev infra-postgres-1 \
  psql -U postgres -c "CREATE DATABASE yese;"
```

## Setup

```bash
cp .env.example .env          # then edit PAYLOAD_SECRET for anything real
pnpm install                  # from the monorepo root
pnpm --filter @yese/cms dev   # http://localhost:3001/admin
```

First visit to `/admin` shows the create-first-user screen. In dev, Payload uses
Drizzle `push` to auto-sync the schema to Postgres on boot — no manual migration
step while iterating. (Production should switch to generated migrations.)

## Scripts

- `dev` — Next dev server on :3001
- `build` / `start` — production build / serve
- `generate:types` — writes `src/payload-types.ts` from the Payload config
- `seed` — seeds the full product catalog (186 products, migrated from eBay) + media
- `seed:feedback` — seeds customer feedback (migrated from the eBay store's public feedback
  profile); both seed scripts are idempotent, safe to re-run
- `clean:products` — dev utility to wipe the Products collection
- `payload` — the Payload CLI (migrations, etc.)
- `typecheck` — `tsc --noEmit`

## Layout

- `src/payload.config.ts` — Payload config (postgres adapter, collections, globals, secret)
- `src/collections/` — `Users` (auth), `Products`, `Media`, `Customers`, `Orders`, `Feedback`
  (customer testimonials/reviews — see `Feedback.ts` for the `source: "ebay" | "app"` field that
  drives which card style the storefront renders)
- `src/globals/` — `SiteSettings` (site-wide feature flags: which homepage marketing sections are
  live, and whether eBay-sourced feedback is shown — see `SiteSettings.ts`)
- `src/scripts/` — `seed.ts` (products), `seed-feedback.ts` (feedback), `clean-products.ts`
- `src/app/(payload)/` — the Next route group Payload serves the admin + API from
- `src/payload-types.ts` — generated; do not edit by hand

## Notes

- Relative imports inside `src/` are **extensionless** (bundler resolution +
  Turbopack), unlike the `.js`-suffixed ESM specifiers in `packages/*`.
- `DATABASE_URI` and `PAYLOAD_SECRET` are required; the app reads them from `.env`.
