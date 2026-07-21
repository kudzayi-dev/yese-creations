# apps/storefront/Dockerfile
#
# Build from the REPO ROOT:
#   docker build -f apps/storefront/Dockerfile -t yese-storefront .
#
# IMPORTANT build-time dependency: vite.config.ts fetches the live product
# list from CMS_URL at BUILD time (to prerender every PDP + list them in
# sitemap.xml) and reads SITE_URL for the sitemap host. If the CMS isn't
# reachable during `docker build` (e.g. building before the CMS is
# deployed), the build still succeeds but silently produces zero
# prerendered PDPs and an empty product sitemap \u2014 every PDP still works
# fine via SSR at request time instead, so this degrades safely, but for a
# complete prerender/sitemap you want the CMS already up and reachable at
# the CMS_URL/SITE_URL build args below when you build this image. In
# docker-compose, that means: bring up postgres + cms first, THEN build
# and start storefront.
#
# Runs via server.mjs, NOT `vite preview` \u2014 this pinned TanStack Start
# version doesn't auto-bundle a self-starting Nitro server; `vite build`
# only emits a bare fetch-handler (dist/server/server.js). server.mjs is
# the real production entrypoint (verified against a real build+curl
# smoke test \u2014 see .plan/PLAN.md's deployment stage notes).

FROM node:20-alpine AS base
RUN npm install -g pnpm@10.17.0 turbo@2.5.4
WORKDIR /repo

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc turbo.json ./
COPY apps/storefront/package.json apps/storefront/package.json
COPY packages/product-data/package.json packages/product-data/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/tsconfig/package.json packages/tsconfig/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS builder
COPY . .
# Build-time-only values (see header comment). CMS_URL here is whatever
# this image is built against; the RUNTIME CMS_URL (set on `docker run`/
# in compose) is what the running server actually talks to \u2014 they're
# usually the same value in this deployment model, but they don't have to
# be.
ARG CMS_URL=http://localhost:3001
ARG SITE_URL=https://www.yesecreations.com
ENV CMS_URL=$CMS_URL SITE_URL=$SITE_URL
RUN pnpm turbo run build --filter=@yese/storefront...

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && adduser -S storefront -u 1001

# Preserve the monorepo-relative path rather than flattening — pnpm's
# isolated linker (node-linker=isolated in .npmrc) means dependencies live
# in a root .pnpm content store plus per-package node_modules symlinks
# (apps/storefront/node_modules/<dep> -> ../../node_modules/.pnpm/...), not
# a flat hoisted root node_modules. Flattening server.mjs to /app and only
# copying root node_modules breaks that symlink resolution; keeping the
# real apps/storefront/ path and copying both node_modules trees keeps it
# working exactly as it did in the builder stage.
COPY --from=builder --chown=storefront:nodejs /repo/node_modules ./node_modules
COPY --from=builder --chown=storefront:nodejs /repo/apps/storefront/node_modules ./apps/storefront/node_modules
COPY --from=builder --chown=storefront:nodejs /repo/apps/storefront/dist ./apps/storefront/dist
COPY --from=builder --chown=storefront:nodejs /repo/apps/storefront/server.mjs ./apps/storefront/server.mjs
COPY --from=builder --chown=storefront:nodejs /repo/apps/storefront/package.json ./apps/storefront/package.json

USER storefront
WORKDIR /app/apps/storefront
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.mjs"]
