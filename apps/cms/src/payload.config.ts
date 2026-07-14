import path from "path";
import { fileURLToPath } from "url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Media } from "./collections/Media";
import { Orders } from "./collections/Orders";
import { Products } from "./collections/Products";
import { Users } from "./collections/Users";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  // Load-bearing: the storefront renders on :3000 and reads media served from :3001.
  // serverURL makes Payload emit ABSOLUTE upload URLs instead of root-relative ones.
  serverURL: process.env.CMS_URL || "http://localhost:3001",
  cors: [process.env.STOREFRONT_URL || "http://localhost:3000"],
  admin: {
    user: Users.slug,
    components: {
      // Adds an "Admin guides" link to the bottom of the admin nav,
      // pointing at /admin/docs (see DocsNavLink.tsx and the route at
      // src/app/(payload)/admin/docs/[[...slug]]/route.ts) so the client
      // handover site is actually discoverable, not just a URL someone has
      // to already know.
      //
      // Uses the "@/" tsconfig path alias rather than a bare "/"-prefixed
      // path: Payload's importmap generator computes a relative fs path for
      // "/"-prefixed component paths, and it gets that computation wrong
      // for this nested route's importMap.js (off by one directory level,
      // reproduced on every `payload generate:importmap` run and every dev
      // server boot — see Stage 23's notes). Using the alias sidesteps the
      // relative-path computation entirely; Next.js's own bundler resolves
      // "@/..." the same way regardless of which file imports it.
      afterNavLinks: ["@/components/DocsNavLink#DocsNavLink"],
    },
  },
  collections: [Users, Media, Products, Orders],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || "",
    },
  }),
  sharp,
});
