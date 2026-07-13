import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import config from "@payload-config";
import {
  PRODUCTS,
  detailFor,
  productSlug,
  type Product as SeedProduct,
} from "@yese/product-data";
import { getPayload } from "payload";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Read-only source assets from the design handoff bundle.
const ASSETS_DIR = path.resolve(dirname, "../../../../design_handoff_yese_shop/assets");

// Every image we want in Media, with its alt text. Keyed by basename, which is what
// Payload stores as `filename` and what we match on for idempotency.
const MEDIA_SEED: Array<{ file: string; alt: string }> = [
  { file: "yese-logo.png", alt: "Yese Creations logo" },
  { file: "yese-logo-cutout.png", alt: "Yese Creations logo, cutout mark" },
  {
    file: "product-crochet-doll.png",
    alt: "Goddess Amigurumi Doll — ivory crochet doll with gold metallic hair",
  },
  {
    file: "product-blossom-canvas.png",
    alt: "Cherry Blossom Branch — original acrylic painting of pink blossom on bare branch",
  },
];

// Which products own real photography. Only p5 and p10 have photos; every other
// product renders generated placeholder art (PHGradient) in the storefront.
const PRODUCT_PHOTOS: Record<string, string[]> = {
  p5: ["product-crochet-doll.png"],
  p10: ["product-blossom-canvas.png"],
};

async function seed() {
  const payload = await getPayload({ config });

  // ---------------------------------------------------------------- media
  const mediaIds = new Map<string, number>();

  for (const { file, alt } of MEDIA_SEED) {
    const filePath = path.join(ASSETS_DIR, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Seed asset missing: ${filePath}`);
    }

    const existing = await payload.find({
      collection: "media",
      where: { filename: { equals: file } },
      limit: 1,
    });

    const found = existing.docs[0];
    if (found) {
      // Refresh alt only — don't re-upload, that would regenerate every size and
      // churn the media dir for no reason.
      const updated = await payload.update({
        collection: "media",
        id: found.id,
        data: { alt },
      });
      mediaIds.set(file, updated.id);
      console.log(`  media   ~ ${file}`);
    } else {
      const created = await payload.create({
        collection: "media",
        data: { alt },
        filePath,
      });
      mediaIds.set(file, created.id);
      console.log(`  media   + ${file}`);
    }
  }

  // ------------------------------------------------------------- products
  for (const p of PRODUCTS as SeedProduct[]) {
    const slug = productSlug(p);
    const detail = detailFor(p);

    const photos = (PRODUCT_PHOTOS[p.id] ?? [])
      .map((f) => mediaIds.get(f))
      .filter((id): id is number => typeof id === "number");

    const data = {
      name: p.name,
      slug,
      cat: p.cat,
      price: p.price,
      meta: p.meta,
      // Shared type uses "" for "no tag"; Payload models that as an unset select.
      tag: p.tag === "" ? null : p.tag,
      palette: p.palette,
      motif: p.motif,
      photos,
      story: detail.story,
      // Payload array fields need a named subfield: string[] -> { spec }[].
      specs: detail.specs.map((spec) => ({ spec })),
      care: detail.care,
      madeIn: detail.madeIn,
    };

    // Idempotency key is the slug — stable and unique, unlike the serial id.
    const existing = await payload.find({
      collection: "products",
      where: { slug: { equals: slug } },
      limit: 1,
    });

    const found = existing.docs[0];
    if (found) {
      await payload.update({ collection: "products", id: found.id, data });
      console.log(`  product ~ ${slug}`);
    } else {
      await payload.create({ collection: "products", data });
      console.log(`  product + ${slug}`);
    }
  }

  console.log(`\nSeeded ${MEDIA_SEED.length} media + ${PRODUCTS.length} products.`);
}

// NOTE: top-level await, NOT `seed().catch(...)`. `payload run` does not await a
// floating promise — the process exits before any async work starts, giving a
// silent exit 0 with zero output. Awaiting here is load-bearing.
try {
  await seed();
  // Payload keeps the Postgres pool open; exit explicitly or the script hangs.
  process.exit(0);
} catch (err) {
  console.error(err);
  process.exit(1);
}
