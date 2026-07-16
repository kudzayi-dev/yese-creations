// Standalone fallback — truncates the `products` table directly via `pg`,
// bypassing Payload/Drizzle's dev schema push entirely (that push is what's
// failing: it can't cast old category values like "Home" into the new enum
// while rows still exist). Run this BEFORE `pnpm run clean:products` or
// `pnpm run seed` if the psql command isn't available.
//
// Run from apps/cms with: node src/scripts/truncate-products.mjs

import { Client } from "pg";
import { config as loadEnv } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(dirname, "../../.env") });

const connectionString = process.env.DATABASE_URI;
if (!connectionString) {
  console.error("DATABASE_URI not found — check apps/cms/.env");
  process.exit(1);
}

const client = new Client({ connectionString });

try {
  await client.connect();
  await client.query('TRUNCATE TABLE "products" RESTART IDENTITY CASCADE;');
  console.log('Truncated "products" table.');
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  await client.end();
}
