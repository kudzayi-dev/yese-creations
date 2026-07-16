import config from "@payload-config";
import { getPayload } from "payload";

// Deletes ALL documents in the `products` collection. Intended for clearing
// out the 10 dev-placeholder products (Luna Heart Bouquet etc.) before
// seeding real production data. Does NOT touch `media` — placeholder photos
// (product-crochet-doll.png, product-blossom-canvas.png) are left in place;
// delete those separately if you also want them gone.
//
// Run with: pnpm run clean:products   (see package.json)
// Or directly: payload run src/scripts/clean-products.ts

async function cleanProducts() {
  const payload = await getPayload({ config });

  const existing = await payload.find({
    collection: "products",
    limit: 0, // limit: 0 = return all matching docs, no pagination cap
  });

  if (existing.totalDocs === 0) {
    console.log("No products found — nothing to clean.");
    return;
  }

  console.log(`Deleting ${existing.totalDocs} product(s)...`);

  const result = await payload.delete({
    collection: "products",
    where: { id: { exists: true } }, // matches every document
  });

  const deletedCount = Array.isArray(result.docs) ? result.docs.length : existing.totalDocs;
  console.log(`Deleted ${deletedCount} product(s).`);

  if (result.errors?.length) {
    console.error(`${result.errors.length} error(s) during delete:`, result.errors);
    process.exitCode = 1;
  }
}

try {
  await cleanProducts();
  process.exit(process.exitCode ?? 0);
} catch (err) {
  console.error(err);
  process.exit(1);
}
