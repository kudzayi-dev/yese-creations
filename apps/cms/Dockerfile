# apps/cms/Dockerfile
#
# Build from the REPO ROOT (not apps/cms): the pnpm workspace's lockfile
# and every workspace package.json need to be visible for `pnpm install`
# to resolve `workspace:*` deps correctly.
#
#   docker build -f apps/cms/Dockerfile -t yese-cms .
#
# Deliberately NOT using `turbo prune` for this image: prune only traces
# the package.json dependency graph, but the CMS's build has a real
# dependency on @yese/docs that ISN'T a package dependency — it's a
# filesystem one. The CMS admin panel serves the Docusaurus handover site
# by reading ../docs/build directly at request time (see
# apps/cms/src/app/(payload)/admin/docs/[[...slug]]/route.ts). turbo.json
# encodes this as a task-level dependency ("@yese/cms#build":
# { dependsOn: [..., "@yese/docs#build"] }), which turbo prune does not
# follow. A prune-based image silently built without apps/docs and shipped
# a CMS whose /admin/docs 404s. Installing the full workspace and letting
# `turbo run build --filter=@yese/cms...` do the ordering is slower to
# build but can't silently drop a real dependency the way prune did here.

FROM node:20-alpine AS base
RUN npm install -g pnpm@10.17.0 turbo@2.5.4
WORKDIR /repo

# ---- deps: install once, cached as long as lockfile/package.jsons don't change ----
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc turbo.json ./
COPY apps/cms/package.json apps/cms/package.json
COPY apps/docs/package.json apps/docs/package.json
COPY apps/storefront/package.json apps/storefront/package.json
COPY packages/product-data/package.json packages/product-data/package.json
COPY packages/tsconfig/package.json packages/tsconfig/package.json
COPY packages/ui/package.json packages/ui/package.json
RUN pnpm install --frozen-lockfile

# ---- build: full source, build only what @yese/cms needs (which pulls in @yese/docs via turbo.json) ----
FROM deps AS builder
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm turbo run build --filter=@yese/cms...

# ---- runtime: minimal image, no source/dev deps ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && adduser -S payload -u 1001

# Next.js standalone output mirrors the monorepo path it was built from.
COPY --from=builder --chown=payload:nodejs /repo/apps/cms/.next/standalone ./
COPY --from=builder --chown=payload:nodejs /repo/apps/cms/.next/static ./apps/cms/.next/static
# Note: apps/cms has no public/ directory today — nothing to copy. If one
# is added later (e.g. a favicon for /admin), add it back here.
# The Docusaurus handover site (/admin/docs) — read from disk at request
# time, not bundled into the Next.js server output above.
COPY --from=builder --chown=payload:nodejs /repo/apps/docs/build ./apps/docs/build

# Uploaded media (apps/cms/media, local disk per the media storage
# decision) — mount a volume here in production so it survives redeploys.
RUN mkdir -p ./apps/cms/media && chown payload:nodejs ./apps/cms/media

# Reinstall sharp's libvips shared libraries directly — confirmed via a
# real Docker build+run that pnpm's isolated linker (node-linker=isolated
# in .npmrc) doesn't create the sibling symlink sharp's .node addon needs
# to dlopen() libvips at runtime, even though the correct file IS present
# elsewhere in node_modules/.pnpm (in the separate @img/sharp-libvips-*
# package). Copying every installed libvips variant's lib/ directory into
# one location and adding it to LD_LIBRARY_PATH sidesteps the symlink gap
# entirely and is version/arch-agnostic (dlopen searches LD_LIBRARY_PATH
# by filename, so this doesn't need to match sharp's exact pinned version).
RUN mkdir -p /usr/local/lib/sharp-libvips
COPY --from=builder /repo/node_modules/.pnpm/@img+sharp-libvips-*/node_modules/@img/sharp-libvips-*/lib/ /usr/local/lib/sharp-libvips/
ENV LD_LIBRARY_PATH=/usr/local/lib/sharp-libvips

USER payload
EXPOSE 3001
ENV PORT=3001 HOSTNAME=0.0.0.0
CMD ["node", "apps/cms/server.js"]
