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

// Read-only source assets from the design handoff bundle. Brand marks only —
// product photography now comes from PRODUCT_PHOTOS_DIR below.
const ASSETS_DIR = path.resolve(dirname, "../../../../design_handoff_yese_shop/assets");

// Real product photography, migrated from eBay and downloaded locally by
// download-images.js. One subfolder per product id, files numbered 1..n
// matching the `imgs` order in @yese/product-data. Not committed to the repo
// (too large) — this script expects it to exist on the machine running the
// seed, same as ASSETS_DIR above.
const PRODUCT_PHOTOS_DIR = path.join(
  process.env.HOME ?? "",
  "Downloads/yese-assets/assets/products",
);

// Brand marks only. Product photos are handled dynamically via PRODUCT_PHOTOS_DIR.
const MEDIA_SEED: Array<{ file: string; alt: string }> = [
  { file: "yese-logo.png", alt: "Yese Creations logo" },
  { file: "yese-logo-cutout.png", alt: "Yese Creations logo, cutout mark" },
];

// Several eBay listing titles repeat verbatim (near-duplicate listings), which
// collapses to the same base slug. Disambiguate deterministically: first
// occurrence keeps the bare slug, subsequent ones get -2, -3, etc. Iterated in
// PRODUCTS order, so this is stable across re-runs.
function uniqueSlugs(products: SeedProduct[]): Map<string, string> {
  const seen = new Map<string, number>();
  const slugById = new Map<string, string>();
  for (const p of products) {
    const base = productSlug(p);
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    slugById.set(p.id, count === 1 ? base : `${base}-${count}`);
  }
  return slugById;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

function buildMetaTitle(name: string): string {
  const suffix = " | Yese Creations";
  const maxNameLen = Math.max(10, 60 - suffix.length);
  return `${truncate(name, maxNameLen)}${suffix}`;
}

function buildMetaDescription(story: string, meta: string): string {
  const base = story && story.trim().length > 0 ? story : meta;
  return truncate(base, 155);
}

function mimeTypeFor(ext: string): string {
  switch (ext.toLowerCase()) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".avif":
      return "image/avif";
    default:
      throw new Error(`Unsupported image extension: ${ext}`);
  }
}

async function seed() {
  const payload = await getPayload({ config });

  // ---------------------------------------------------------- brand media
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

  // -------------------------------------------------------- product photos
  // Uploads (or reuses) every real photo for a product. Filenames are
  // prefixed with the product id (e.g. "p1-1.jpg") since the source folders
  // all reuse "1.jpg", "2.jpg", ... and Payload's Media collection needs
  // globally unique filenames.
  async function uploadProductPhotos(p: SeedProduct): Promise<number[]> {
    const ids: number[] = [];
    const imgs = p.imgs && p.imgs.length ? p.imgs : p.img ? [p.img] : [];

    for (let i = 0; i < imgs.length; i++) {
      const basename = path.basename(imgs[i]); // "1.jpg"
      const ext = path.extname(basename);
      const uniqueFilename = `${p.id}-${basename}`; // "p1-1.jpg"
      const localPath = path.join(PRODUCT_PHOTOS_DIR, p.id, basename);

      if (!fs.existsSync(localPath)) {
        console.warn(`  ! missing photo, skipping: ${localPath}`);
        continue;
      }

      const existing = await payload.find({
        collection: "media",
        where: { filename: { equals: uniqueFilename } },
        limit: 1,
      });

      const found = existing.docs[0];
      if (found) {
        ids.push(found.id);
        continue;
      }

      const buffer = fs.readFileSync(localPath);
      const created = await payload.create({
        collection: "media",
        data: { alt: `${p.name} — photo ${i + 1}` },
        file: {
          data: buffer,
          mimetype: mimeTypeFor(ext),
          name: uniqueFilename,
          size: buffer.length,
        },
      });
      ids.push(created.id);
    }

    return ids;
  }

  // ------------------------------------------------------------- products
  let photosUploaded = 0;
  let photosSkipped = 0;
  const slugById = uniqueSlugs(PRODUCTS as SeedProduct[]);

  for (const p of PRODUCTS as SeedProduct[]) {
    const slug = slugById.get(p.id) ?? productSlug(p);
    const detail = detailFor(p);
    const photos = await uploadProductPhotos(p);
    const expectedCount = (p.imgs && p.imgs.length) || (p.img ? 1 : 0);
    photosUploaded += photos.length;
    photosSkipped += Math.max(0, expectedCount - photos.length);

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
      metaTitle: buildMetaTitle(p.name),
      metaDescription: buildMetaDescription(detail.story, p.meta),
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
      console.log(`  product ~ ${slug} (${photos.length} photo${photos.length === 1 ? "" : "s"})`);
    } else {
      await payload.create({ collection: "products", data });
      console.log(`  product + ${slug} (${photos.length} photo${photos.length === 1 ? "" : "s"})`);
    }
  }

  console.log(
    `\nSeeded ${MEDIA_SEED.length} brand media + ${PRODUCTS.length} products ` +
      `(${photosUploaded} product photos uploaded/reused, ${photosSkipped} missing on disk).`,
  );

  if (photosSkipped > 0) {
    console.warn(
      `\nWARNING: ${photosSkipped} expected photo(s) were not found under ${PRODUCT_PHOTOS_DIR}.\n` +
        `Check that yese-assets/assets/products was downloaded and is at that path.`,
    );
  }
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
